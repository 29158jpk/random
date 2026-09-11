"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/admin/StatCard";
import {
  Users,
  Dices,
  Bookmark,
  History,
  Trophy,
  Sparkles,
  Diamond,
  Clover,
  ArrowRight,
  Plus,
  RefreshCw,
  Cpu,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { AdminDashboardStats, MemberActivity } from "@/types/admin";

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activities, setActivities] = useState<MemberActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  const cards = [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? 0,
      subtitle: "Active community users",
      icon: Users,
      color: "sky" as const,
    },
    {
      title: "Total Random Builds",
      value: stats?.totalRandomBuilds ?? 0,
      subtitle: "Generated via Random PC",
      icon: Dices,
      color: "purple" as const,
    },
    {
      title: "Saved Builds",
      value: stats?.savedBuilds ?? 0,
      subtitle: "User collections",
      icon: Bookmark,
      color: "emerald" as const,
    },
    {
      title: "Total History",
      value: stats?.totalHistory ?? 0,
      subtitle: "Lifetime generation logs",
      icon: History,
      color: "indigo" as const,
    },
    {
      title: "Challenge Participants",
      value: stats?.challengeParticipants ?? 0,
      subtitle: "Daily challenge entries",
      icon: Trophy,
      color: "amber" as const,
    },
    {
      title: "Legendary Builds",
      value: stats?.legendaryBuilds ?? 0,
      subtitle: "High tier RNG hits",
      icon: Sparkles,
      color: "amber" as const,
    },
    {
      title: "Mythic Builds",
      value: stats?.mythicBuilds ?? 0,
      subtitle: "God roll builds",
      icon: Diamond,
      color: "rose" as const,
    },
    {
      title: "Highest Luck",
      value: `${stats?.highestLuck ?? 0} / 100`,
      subtitle: "Peak luck score recorded",
      icon: Clover,
      color: "emerald" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dashboard Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-black border border-sky-500/30">
              LIVE SUPABASE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and monitoring across Horizon Auto PC members and hardware
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/hardware"
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Hardware</span>
          </Link>
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Quick Access Shortcuts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
            <span>Quick Control Center</span>
            <span className="text-[10px] text-sky-400">Shortcuts</span>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              href="/admin/members"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-xs font-bold text-slate-200 transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div>Member Directory</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Search, filter & moderate accounts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/hardware"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-xs font-bold text-slate-200 transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div>Hardware Catalog</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Add new GPUs & toggle active parts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/challenges"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-xs font-bold text-slate-200 transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div>Daily Challenges</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Create & manage daily quests
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/statistics"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-xs font-bold text-slate-200 transition-all hover:translate-x-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div>Visual Statistics</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Interactive charts & growth trends
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Live Recent Activity Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Recent Activity Feed</span>
            </div>
            <Link
              href="/admin/randoms"
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Dices className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                ยังไม่มีประวัติกิจกรรมล่าสุดในขณะนี้
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">{act.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(act.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                    {act.activity_type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
