"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GamingAreaChart, GamingBarChart } from "@/components/admin/ChartComponents";
import {
  BarChart3,
  TrendingUp,
  Clover,
  Coins,
  Cpu,
  Tv,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function AdminStatisticsPage() {
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/statistics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>Admin Visual Statistics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            การวิเคราะห์เชิงภาพกราฟิกเกี่ยวกับสเปกคอม ความนิยมแบรนด์ และการเติบโตของสมาชิก
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-sky-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>Total Builds Sampled</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {(data?.totalBuilds || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all users</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Average Build Value</span>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono mt-2">
            ฿{(data?.avgPrice || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">Mean system spend</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clover className="w-4 h-4 text-emerald-400" />
            <span>Average Luck Score</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
            {data?.avgLuck || 0} / 100
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Community luck average</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Total Registered Members</span>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono mt-2">
            {(data?.memberCount || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Database profiles</div>
        </div>
      </div>

      {/* Chart Row 1: Daily Activity & Budget Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Random Builds per Day Area Chart */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Random Builds per Day (Past 7 Days)</span>
            </h3>
          </div>
          <GamingAreaChart data={data?.randomsPerDay || []} color="#38bdf8" />
        </div>

        {/* Popular Budget Brackets */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Popular Budget Brackets (฿)</span>
            </h3>
          </div>
          <GamingBarChart data={data?.popularBudgets || []} color="#f59e0b" />
        </div>
      </div>

      {/* Chart Row 2: Brand Share & Rarity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GPU Brand Share */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Tv className="w-4 h-4 text-sky-400" />
            <span>GPU Brand Share</span>
          </h3>
          <GamingBarChart data={data?.gpuBrands || []} color="#38bdf8" />
        </div>

        {/* CPU Brand Share */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>CPU Brand Share</span>
          </h3>
          <GamingBarChart data={data?.cpuBrands || []} color="#c084fc" />
        </div>

        {/* Rarity Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Rarity Distribution</span>
          </h3>
          <GamingBarChart data={data?.rarityDistribution || []} color="#10b981" />
        </div>
      </div>
    </div>
  );
}
