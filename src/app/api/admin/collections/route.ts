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

      const { data: savedRows, error: dbError } = await client
        .from("user_builds")
        .select(`
          id,
          user_id,
          build_name,
          budget,
          total_price,
          luck_score,
          rarity,
          parts,
          created_at,
          profiles:user_id (username, email)
        `)
        .eq("is_saved", true)
        .order("created_at", { ascending: false });

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      const builds = savedRows || [];
      const gpuCounts: Record<string, number> = {};
      const cpuCounts: Record<string, number> = {};
      const budgetBuckets: Record<string, number> = {
        "< ฿20,000": 0,
        "฿20,000 - ฿30,000": 0,
        "฿30,000 - ฿45,000": 0,
        "฿45,000+": 0,
      };
      const rarityCounts: Record<string, number> = {};
      const buildNameCounts: Record<string, number> = {};

      for (const b of builds) {
        // Name
        buildNameCounts[b.build_name] = (buildNameCounts[b.build_name] || 0) + 1;

        // GPU
        const gpuName = b.parts?.gpu?.name || "Unknown GPU";
        gpuCounts[gpuName] = (gpuCounts[gpuName] || 0) + 1;

        // CPU
        const cpuName = b.parts?.cpu?.name || "Unknown CPU";
        cpuCounts[cpuName] = (cpuCounts[cpuName] || 0) + 1;

        // Budget
        const budget = b.budget || b.total_price;
        if (budget < 20000) budgetBuckets["< ฿20,000"]++;
        else if (budget <= 30000) budgetBuckets["฿20,000 - ฿30,000"]++;
        else if (budget <= 45000) budgetBuckets["฿30,000 - ฿45,000"]++;
        else budgetBuckets["฿45,000+"]++;

        // Rarity
        rarityCounts[b.rarity] = (rarityCounts[b.rarity] || 0) + 1;
      }

      const getTopKey = (record: Record<string, number>) => {
        const sorted = Object.entries(record).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
      };

      const stats = {
        totalSaved: builds.length,
        mostSavedBuild: getTopKey(buildNameCounts),
        mostPopularGPU: getTopKey(gpuCounts),
        mostPopularCPU: getTopKey(cpuCounts),
        mostPopularBudget: getTopKey(budgetBuckets),
        mostCommonRarity: getTopKey(rarityCounts),
      };

      return NextResponse.json({
        success: true,
        stats,
        items: builds.slice(0, 50),
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalSaved: 0,
        mostSavedBuild: null,
        mostPopularGPU: null,
        mostPopularCPU: null,
        mostPopularBudget: null,
        mostCommonRarity: null,
      },
      items: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
