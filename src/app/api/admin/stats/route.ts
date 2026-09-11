import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AdminDashboardStats } from "@/types/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    // If Supabase is fully configured, query real database metrics
    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      // 1. Total Members
      const { count: membersCount } = await client
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 2. Total Builds
      const { count: buildsCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true });

      // 3. Saved Builds
      const { count: savedCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .eq("is_saved", true);

      // 4. Challenge Participants
      const { count: participantsCount } = await client
        .from("challenge_participants")
        .select("*", { count: "exact", head: true });

      // 5. Legendary Builds
      const { count: legendaryCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .eq("rarity", "Legendary");

      // 6. Mythic Builds
      const { count: mythicCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .eq("rarity", "Mythic");

      // 7. Highest Luck
      const { data: maxLuckRow } = await client
        .from("user_builds")
        .select("luck_score")
        .order("luck_score", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 8. Recent Activities
      const { data: activities } = await client
        .from("member_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const stats: AdminDashboardStats = {
        totalMembers: membersCount || 0,
        totalRandomBuilds: buildsCount || 0,
        savedBuilds: savedCount || 0,
        totalHistory: buildsCount || 0,
        challengeParticipants: participantsCount || 0,
        legendaryBuilds: legendaryCount || 0,
        mythicBuilds: mythicCount || 0,
        highestLuck: maxLuckRow?.luck_score || 0,
      };

      return NextResponse.json({
        success: true,
        stats,
        activities: activities || [],
      });
    }

    // Fallback for offline/local development demonstration
    const fallbackStats: AdminDashboardStats = {
      totalMembers: 1,
      totalRandomBuilds: 0,
      savedBuilds: 0,
      totalHistory: 0,
      challengeParticipants: 0,
      legendaryBuilds: 0,
      mythicBuilds: 0,
      highestLuck: 0,
    };

    return NextResponse.json({
      success: true,
      stats: fallbackStats,
      activities: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
