import { NextRequest, NextResponse } from "next/server";
import { verifyActiveUser } from "@/lib/supabase/server";
import { generateRandomBuild } from "@/lib/randomEngine";
import { getActiveHardwarePool } from "@/lib/hardwareService";
import { UserPreferences } from "@/types/hardware";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, profile, error: authError } = await verifyActiveUser(authHeader);

    if (authError || !user) {
      const isSuspended = authError?.includes("suspended");
      return NextResponse.json(
        {
          error: isSuspended ? "Account suspended" : "Authentication required",
          message: isSuspended
            ? "Your account has been suspended. บัญชีของคุณถูกระงับการใช้งาน"
            : "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสุ่ม PC ได้",
        },
        { status: isSuspended ? 403 : 401 }
      );
    }

    const body = await req.json();
    const { preferences, variant = "normal" } = body as {
      preferences: UserPreferences;
      variant?: "normal" | "better" | "cheaper";
    };

    if (!preferences || !preferences.budget) {
      return NextResponse.json(
        { error: "Invalid request. Missing preferences or budget." },
        { status: 400 }
      );
    }

    // 1. Fetch active hardware pool from database
    const activePool = await getActiveHardwarePool();

    // 2. Run Server-Side Random Engine with active hardware pool
    const build = generateRandomBuild(preferences, variant, activePool);

    // 3. If Supabase is fully configured, record to user_builds and member_activities
    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serverClient = createClient(supabaseUrl, supabaseAnonKey);

        await serverClient.from("user_builds").insert({
          id: build.id,
          user_id: user.id,
          build_name: build.name,
          budget: build.budget,
          total_price: build.totalPrice,
          luck_score: build.luckScore,
          luck_tier: build.luckTier,
          rarity: build.rarity,
          special_build: build.specialBuild || null,
          scores: build.scores,
          parts: {
            cpu: build.cpu,
            gpu: build.gpu,
            motherboard: build.motherboard,
            ram: build.ram,
            storage: build.storage,
            psu: build.psu,
            cooler: build.cooler,
            case: build.case,
          },
          analysis: build.analysis,
          estimated_fps: build.estimatedFps,
          is_saved: false,
        });

        // Record member activity
        await serverClient.from("member_activities").insert({
          user_id: user.id,
          activity_type: "random_pc",
          description: `${profile?.username || user.email.split("@")[0]} generated a ${build.rarity} build: ${build.name} (฿${build.totalPrice.toLocaleString()})`,
          metadata: {
            buildId: build.id,
            rarity: build.rarity,
            luckScore: build.luckScore,
            totalPrice: build.totalPrice,
          },
        });
      } catch (dbError) {
        console.warn("Could not insert build or activity into Supabase:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      build,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
