import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { MemberListItem } from "@/types/admin";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { user, error } = await verifyAdminToken(authHeader);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get("limit") || "20", 10)));

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || "" } },
      });

      let query = client.from("profiles").select("*", { count: "exact" });

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (role !== "all") {
        query = query.eq("role", role);
      }
      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (sort === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: profiles, count, error: dbError } = await query;

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      // Aggregate build statistics per member
      const memberItems: MemberListItem[] = [];
      for (const p of profiles || []) {
        // Query builds count
        const { count: totalRandoms } = await client
          .from("user_builds")
          .select("*", { count: "exact", head: true })
          .eq("user_id", p.id);

        const { count: savedCount } = await client
          .from("user_builds")
          .select("*", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("is_saved", true);

        const { data: luckRow } = await client
          .from("user_builds")
          .select("luck_score")
          .eq("user_id", p.id)
          .order("luck_score", { ascending: false })
          .limit(1)
          .maybeSingle();

        memberItems.push({
          ...p,
          totalRandoms: totalRandoms || 0,
          savedBuildsCount: savedCount || 0,
          highestLuck: luckRow?.luck_score || 0,
        });
      }

      // If sort is by build metrics:
      if (sort === "most_random") {
        memberItems.sort((a, b) => b.totalRandoms - a.totalRandoms);
      } else if (sort === "most_saved") {
        memberItems.sort((a, b) => b.savedBuildsCount - a.savedBuildsCount);
      } else if (sort === "highest_luck") {
        memberItems.sort((a, b) => b.highestLuck - a.highestLuck);
      }

      return NextResponse.json({
        success: true,
        members: memberItems,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      });
    }

    // Local / Offline fallback
    return NextResponse.json({
      success: true,
      members: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
