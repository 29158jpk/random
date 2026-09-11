import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MemberDetail, PCBuild } from "@/types/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      // 1. Fetch Profile
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      // 2. Fetch User Builds
      const { data: buildsData } = await client
        .from("user_builds")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      const builds: PCBuild[] = (buildsData || []).map((row) => ({
        id: row.id,
        name: row.build_name,
        timestamp: new Date(row.created_at).getTime(),
        cpu: row.parts.cpu,
        gpu: row.parts.gpu,
        motherboard: row.parts.motherboard,
        ram: row.parts.ram,
        storage: row.parts.storage,
        psu: row.parts.psu,
        cooler: row.parts.cooler,
        case: row.parts.case,
        totalPrice: row.total_price,
        budget: row.budget,
        totalPowerWatts: (row.parts.cpu?.power || 65) + (row.parts.gpu?.power || 120) + 120,
        scores: row.scores,
        luckScore: row.luck_score,
        luckTier: row.luck_tier,
        rarity: row.rarity,
        specialBuild: row.special_build,
        analysis: row.analysis,
        estimatedFps: row.estimated_fps || [],
      }));

      const recentRandomBuilds = builds.slice(0, 10);
      const recentSavedBuilds = builds.filter((_, idx) => buildsData?.[idx]?.is_saved).slice(0, 10);

      const stats = {
        totalRandomBuilds: builds.length,
        savedBuilds: buildsData?.filter((b) => b.is_saved).length || 0,
        historyCount: builds.length,
        highestLuck: builds.length ? Math.max(...builds.map((b) => b.luckScore)) : 0,
        highestScore: builds.length ? Math.max(...builds.map((b) => b.scores?.overall || 0)) : 0,
        legendaryBuilds: builds.filter((b) => b.rarity === "Legendary").length,
        mythicBuilds: builds.filter((b) => b.rarity === "Mythic").length,
      };

      const detail: MemberDetail = {
        ...profile,
        stats,
        recentRandomBuilds,
        recentSavedBuilds,
      };

      return NextResponse.json({ success: true, member: detail });
    }

    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const { user, profile: adminProfile, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { status, role } = body as { status?: "active" | "suspended"; role?: "user" | "admin" };

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (status) updates.status = status;
      if (role) updates.role = role;

      const { data: updated, error: updateError } = await client
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      // Log action to admin_logs
      let actionName = "Updated member";
      if (status === "suspended") actionName = `Admin suspended user ${updated.username}`;
      else if (status === "active") actionName = `Admin unsuspended user ${updated.username}`;
      else if (role) actionName = `Admin changed ${updated.username} role to ${role}`;

      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: actionName,
        target_user_id: id,
        target_resource: "profiles",
        details: { updates },
      });

      return NextResponse.json({ success: true, member: updated });
    }

    return NextResponse.json({ success: true, message: "Updated locally" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      // Get user info before deleting
      const { data: target } = await client
        .from("profiles")
        .select("username, email")
        .eq("id", id)
        .single();

      // Delete from profiles (foreign key on delete cascade removes builds, activities, etc.)
      const { error: delError } = await client.from("profiles").delete().eq("id", id);
      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 400 });
      }

      // Log to admin_logs
      await client.from("admin_logs").insert({
        admin_id: user.id,
        admin_email: user.email,
        action: `Admin deleted member: ${target?.username || id} (${target?.email || ""})`,
        target_user_id: id,
        target_resource: "profiles",
        details: { deletedUser: target },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Deleted locally" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
