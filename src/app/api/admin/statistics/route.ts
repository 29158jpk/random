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

      // 1. All builds for aggregation
      const { data: builds } = await client
        .from("user_builds")
        .select("total_price, budget, luck_score, rarity, parts, created_at")
        .limit(1000);

      // 2. Members count
      const { count: memberCount } = await client
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const allBuilds = builds || [];

      // A. Random Builds per Day (last 7 days)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = dayNames[d.getDay()];
        dailyMap[key] = 0;
      }

      for (const b of allBuilds) {
        const bDate = new Date(b.created_at);
        const daysDiff = (Date.now() - bDate.getTime()) / 86400000;
        if (daysDiff <= 7) {
          const key = dayNames[bDate.getDay()];
          if (dailyMap[key] !== undefined) {
            dailyMap[key]++;
          }
        }
      }
      const randomsPerDay = Object.entries(dailyMap).map(([label, value]) => ({ label, value }));

      // B. Popular Budget
      const budgetMap: Record<string, number> = {
        "15K-25K": 0,
        "25K-35K": 0,
        "35K-50K": 0,
        "50K+": 0,
      };
      for (const b of allBuilds) {
        const p = b.budget || b.total_price;
        if (p < 25000) budgetMap["15K-25K"]++;
        else if (p < 35000) budgetMap["25K-35K"]++;
        else if (p < 50000) budgetMap["35K-50K"]++;
        else budgetMap["50K+"]++;
      }
      const popularBudgets = Object.entries(budgetMap).map(([label, value]) => ({ label, value }));

      // C. GPU Brand
      const gpuBrandMap: Record<string, number> = { NVIDIA: 0, AMD: 0, Intel: 0 };
      for (const b of allBuilds) {
        const brand = b.parts?.gpu?.brand;
        if (brand === "NVIDIA") gpuBrandMap.NVIDIA++;
        else if (brand === "AMD") gpuBrandMap.AMD++;
        else if (brand === "Intel") gpuBrandMap.Intel++;
      }
      const gpuBrands = Object.entries(gpuBrandMap).map(([label, value]) => ({ label, value }));

      // D. CPU Brand
      const cpuBrandMap: Record<string, number> = { AMD: 0, Intel: 0 };
      for (const b of allBuilds) {
        const brand = b.parts?.cpu?.brand;
        if (brand === "AMD") cpuBrandMap.AMD++;
        else if (brand === "Intel") cpuBrandMap.Intel++;
      }
      const cpuBrands = Object.entries(cpuBrandMap).map(([label, value]) => ({ label, value }));

      // E. Rarity Distribution
      const rarityMap: Record<string, number> = {
        Common: 0,
        Rare: 0,
        Epic: 0,
        Legendary: 0,
        Mythic: 0,
      };
      for (const b of allBuilds) {
        if (rarityMap[b.rarity] !== undefined) {
          rarityMap[b.rarity]++;
        }
      }
      const rarityDistribution = Object.entries(rarityMap).map(([label, value]) => ({ label, value }));

      // F. Averages
      const totalLuck = allBuilds.reduce((acc, b) => acc + (b.luck_score || 0), 0);
      const avgLuck = allBuilds.length ? Math.round(totalLuck / allBuilds.length) : 0;

      const totalPrice = allBuilds.reduce((acc, b) => acc + (b.total_price || 0), 0);
      const avgPrice = allBuilds.length ? Math.round(totalPrice / allBuilds.length) : 0;

      return NextResponse.json({
        success: true,
        stats: {
          memberCount: memberCount || 0,
          totalBuilds: allBuilds.length,
          avgLuck,
          avgPrice,
          randomsPerDay,
          popularBudgets,
          gpuBrands,
          cpuBrands,
          rarityDistribution,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        memberCount: 1,
        totalBuilds: 0,
        avgLuck: 0,
        avgPrice: 0,
        randomsPerDay: [
          { label: "Mon", value: 0 },
          { label: "Tue", value: 0 },
          { label: "Wed", value: 0 },
          { label: "Thu", value: 0 },
          { label: "Fri", value: 0 },
          { label: "Sat", value: 0 },
          { label: "Sun", value: 0 },
        ],
        popularBudgets: [],
        gpuBrands: [],
        cpuBrands: [],
        rarityDistribution: [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
