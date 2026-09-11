import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { getAllHardware, addHardwareItem, updateHardwareItem, deleteHardwareItem } from "@/lib/hardwareService";
import { createClient } from "@supabase/supabase-js";
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

    const all = await getAllHardware(true);
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
    const { item } = body as { item: Omit<HardwareItemDB, "created_at" | "updated_at"> };

    if (!item || !item.name || !item.category || !item.price) {
      return NextResponse.json({ error: "Missing required hardware fields" }, { status: 400 });
    }

    const newItem = await addHardwareItem({
      ...item,
      id: item.id || `hw-${item.category}-${Date.now()}`,
      status: item.status || "active",
    });

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin added hardware: ${newItem.name} (฿${newItem.price.toLocaleString()})`,
        target_resource: "hardware",
        details: { item: newItem },
      });
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

    const updated = await updateHardwareItem(id, updates);

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      let actionDesc = `Admin updated hardware ${id}`;
      if (updates.status) {
        actionDesc = `Admin ${updates.status === "active" ? "enabled" : "disabled"} hardware ${id}`;
      } else if (updates.price) {
        actionDesc = `Admin changed hardware ${id} price to ฿${updates.price.toLocaleString()}`;
      }

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: actionDesc,
        target_resource: "hardware",
        details: { id, updates },
      });
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

    await deleteHardwareItem(id);

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin deleted hardware: ${id}`,
        target_resource: "hardware",
        details: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
