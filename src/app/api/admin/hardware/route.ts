import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, getSupabaseAdminClient } from "@/lib/supabase/server";
import {
  getAllHardware,
  addHardwareItem,
  updateHardwareItem,
  deleteHardwareItem,
  seedInitialHardware,
} from "@/lib/hardwareService";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { HardwareItemDB } from "@/types/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const adminClient = getSupabaseAdminClient(authHeader);
    const all = await getAllHardware(true, adminClient);
    let filtered = all;
    if (category && category !== "all") {
      filtered = all.filter((item) => item.category === category);
    }

    return NextResponse.json({ success: true, hardware: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Check if request is to seed or reset database
    if (body?.action === "seed" || body?.action === "reset") {
      const adminClient = getSupabaseAdminClient(authHeader);
      const result = await seedInitialHardware(adminClient);
      const refreshed = await getAllHardware(true, adminClient);
      return NextResponse.json({
        success: true,
        message: `Seeded ${result.count} hardware items successfully`,
        count: result.count,
        hardware: refreshed,
      });
    }

    const { item } = body as { item: Omit<HardwareItemDB, "created_at" | "updated_at"> };

    if (!item || !item.name || !item.category || !item.price) {
      return NextResponse.json({ error: "Missing required hardware fields" }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient(authHeader);
    const newItem = await addHardwareItem(
      {
        ...item,
        id: item.id || `hw-${item.category}-${Date.now()}`,
        status: item.status || "active",
      },
      adminClient
    );

    if (isSupabaseConfigured() && adminClient) {
      try {
        await adminClient.from("admin_logs").insert({
          admin_id: user.id,
          admin_email: user.email,
          action: `Admin added hardware: ${newItem.name} (฿${newItem.price.toLocaleString()})`,
          target_resource: "hardware",
          details: { item: newItem },
        });
      } catch (logErr) {
        console.warn("Could not write admin log:", logErr);
      }
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body as { id: string; updates: Partial<HardwareItemDB> };

    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient(authHeader);
    const updated = await updateHardwareItem(id, updates, adminClient);

    if (isSupabaseConfigured() && adminClient) {
      try {
        let actionDesc = `Admin updated hardware ${id}`;
        if (updates.status) {
          actionDesc = `Admin ${updates.status === "active" ? "enabled" : "disabled"} hardware ${id}`;
        } else if (updates.price) {
          actionDesc = `Admin changed hardware ${id} price to ฿${updates.price.toLocaleString()}`;
        }

        await adminClient.from("admin_logs").insert({
          admin_id: user.id,
          admin_email: user.email,
          action: actionDesc,
          target_resource: "hardware",
          details: { id, updates },
        });
      } catch (logErr) {
        console.warn("Could not write admin log:", logErr);
      }
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing hardware id" }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient(authHeader);
    await deleteHardwareItem(id, adminClient);

    if (isSupabaseConfigured() && adminClient) {
      try {
        await adminClient.from("admin_logs").insert({
          admin_id: user.id,
          admin_email: user.email,
          action: `Admin deleted hardware ${id}`,
          target_resource: "hardware",
          details: { id },
        });
      } catch (logErr) {
        console.warn("Could not write admin log:", logErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
