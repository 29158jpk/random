"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  History,
  Calendar,
  Users,
  Trophy,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface HistoryStats {
  totalRandoms: number;
  randomsToday: number;
  randomsThisWeek: number;
  randomsThisMonth: number;
  topUsers: { username: string; email: string; count: number }[];
}

export default function AdminHistoryPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/history", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [session]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-purple-400" />
            <span>History Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            สถิติและภาพรวมการสุ่มของระบบ Horizon Auto PC ตามช่วงเวลา
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Time Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Total Lifetime Randoms</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {(stats?.totalRandoms || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">All recorded builds</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-sky-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Randoms Today</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {(stats?.randomsToday || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-400 mt-1">Past 24 hours</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Randoms This Week</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {(stats?.randomsThisWeek || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Past 7 days</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Randoms This Month</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {(stats?.randomsThisMonth || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Past 30 days</div>
        </div>
      </div>

      {/* Top Users Leaderboard */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Top Members by Random Count
            </h3>
          </div>
          <Link
            href="/admin/members"
            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
          >
            <span>View All Members</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.topUsers?.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            ยังไม่มีข้อมูลอันดับสมาชิกในขณะนี้
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {stats?.topUsers?.map((u, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : idx === 1
                        ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                        : idx === 2
                        ? "bg-amber-700/20 text-amber-500 border border-amber-700/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white">{u.username}</div>
                    <div className="text-[10px] text-slate-500">{u.email}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-purple-400">
                    {u.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">rolls</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
