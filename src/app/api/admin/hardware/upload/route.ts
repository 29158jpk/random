import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import fs from "fs";
import path from "path";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error: authError } = await verifyAdminToken(authHeader);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || "Unauthorized: Admin privileges required" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldImageUrl = formData.get("oldImageUrl") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed formats: PNG, JPG, JPEG, WEBP",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "File size exceeds limit (Max 10MB)",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || ".png";
    const sanitizedBase = path
      .basename(file.name, fileExt)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 30);
    const fileName = `${Date.now()}-${sanitizedBase}${fileExt}`;

    // 1. Primary Flow: Upload to Supabase Storage bucket `hardware-images`
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseAdminClient(authHeader);
        const bucketName = "hardware-images";

        // Auto-create bucket if missing
        try {
          await client.storage.createBucket(bucketName, { public: true });
        } catch {
          // ignore if bucket already exists
        }

        // Upload file to bucket
        const { error: uploadError } = await client.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = client.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          const newImageUrl = publicData.publicUrl;

          // Safely delete old image if it was in the same bucket
          if (oldImageUrl && oldImageUrl.includes(bucketName)) {
            try {
              const oldPath = oldImageUrl.split(`${bucketName}/`).pop();
              if (oldPath && oldPath !== fileName) {
                await client.storage.from(bucketName).remove([oldPath]);
              }
            } catch (delErr) {
              console.warn("Could not delete old image:", delErr);
            }
          }

          return NextResponse.json({
            success: true,
            url: newImageUrl,
            fileName,
          });
        } else {
          console.warn("Supabase Storage upload warning:", uploadError.message);
        }
      } catch (storageErr) {
        console.warn("Supabase storage error, attempting fallback:", storageErr);
      }
    }

    // 2. Local Filesystem Flow (Works in local dev)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "hardware");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(localFilePath, buffer);

      const localUrl = `/uploads/hardware/${fileName}`;
      return NextResponse.json({
        success: true,
        url: localUrl,
        fileName,
      });
    } catch {
      // In serverless/read-only environments (like Vercel), local filesystem write fails.
      // Fallback safely to high-performance Data URI so the image is NEVER lost!
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        fileName,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error during upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
