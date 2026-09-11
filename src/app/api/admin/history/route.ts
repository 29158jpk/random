import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
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

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Total
      const { count: totalRandoms } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true });

      // Today
      const { count: todayCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay);

      // This Week
      const { count: weekCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo);

      // This Month
      const { count: monthCount } = await client
        .from("user_builds")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo);

      // Top Users
      const { data: allBuilds } = await client
        .from("user_builds")
        .select("user_id, profiles:user_id (username, email)")
        .limit(1000);

      const userCounts: Record<string, { username: string; email: string; count: number }> = {};
      for (const b of (allBuilds || []) as any[]) {
        if (!userCounts[b.user_id]) {
          userCounts[b.user_id] = {
            username: b.profiles?.username || "Unknown",
            email: b.profiles?.email || "",
            count: 0,
          };
        }
        userCounts[b.user_id].count++;
      }

      const topUsers = Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return NextResponse.json({
        success: true,
        stats: {
          totalRandoms: totalRandoms || 0,
          randomsToday: todayCount || 0,
          randomsThisWeek: weekCount || 0,
          randomsThisMonth: monthCount || 0,
          topUsers,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRandoms: 0,
        randomsToday: 0,
        randomsThisWeek: 0,
        randomsThisMonth: 0,
        topUsers: [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
