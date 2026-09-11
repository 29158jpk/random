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

    const { searchParams } = new URL(req.url);
    const timeFilter = searchParams.get("time") || "all"; // today | 7d | 30d | all
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      let query = client
        .from("user_builds")
        .select(`
          id,
          user_id,
          build_name,
          total_price,
          luck_score,
          luck_tier,
          rarity,
          scores,
          created_at,
          profiles:user_id (username, email)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      const now = new Date();
      if (timeFilter === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte("created_at", startOfDay);
      } else if (timeFilter === "7d") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", sevenDaysAgo);
      } else if (timeFilter === "30d") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", thirtyDaysAgo);
      }

      const { data, error: dbError } = await query;
      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        user: {
          id: row.user_id,
          username: row.profiles?.username || "Unknown",
          email: row.profiles?.email || "",
        },
        buildName: row.build_name,
        price: row.total_price,
        performance: row.scores?.performance || 0,
        value: row.scores?.value || 0,
        luck: row.luck_score,
        rarity: row.rarity,
        date: row.created_at,
      }));

      return NextResponse.json({ success: true, randoms: formatted });
    }

    return NextResponse.json({ success: true, randoms: [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
