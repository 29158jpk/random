"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bookmark,
  Cpu,
  Tv,
  Coins,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface CollectionStats {
  totalSaved: number;
  mostSavedBuild: { name: string; count: number } | null;
  mostPopularGPU: { name: string; count: number } | null;
  mostPopularCPU: { name: string; count: number } | null;
  mostPopularBudget: { name: string; count: number } | null;
  mostCommonRarity: { name: string; count: number } | null;
}

export default function AdminCollectionsPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/collections", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [session]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-emerald-400" />
            <span>Collection Intelligence</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            สถิติและความนิยมของสเปกคอมที่สมาชิกบันทึกไว้ในระบบ ({stats?.totalSaved || 0} Saved Builds)
          </p>
        </div>

        <button
          onClick={fetchCollections}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Most Saved Build */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Most Saved Build</span>
          </div>
          <div className="mt-2 font-bold text-white text-sm line-clamp-1">
            {stats?.mostSavedBuild?.name || "None yet"}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1">
            {stats?.mostSavedBuild ? `${stats.mostSavedBuild.count} users saved` : "-"}
          </div>
        </div>

        {/* Most Popular GPU */}
        <div className="glass-panel rounded-2xl p-5 border border-sky-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Tv className="w-4 h-4 text-sky-400" />
            <span>Most Popular GPU</span>
          </div>
          <div className="mt-2 font-bold text-white text-sm line-clamp-1">
            {stats?.mostPopularGPU?.name || "None yet"}
          </div>
          <div className="text-[11px] text-sky-400 font-bold mt-1">
            {stats?.mostPopularGPU ? `${stats.mostPopularGPU.count} saved builds` : "-"}
          </div>
        </div>

        {/* Most Popular CPU */}
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Most Popular CPU</span>
          </div>
          <div className="mt-2 font-bold text-white text-sm line-clamp-1">
            {stats?.mostPopularCPU?.name || "None yet"}
          </div>
          <div className="text-[11px] text-purple-400 font-bold mt-1">
            {stats?.mostPopularCPU ? `${stats.mostPopularCPU.count} saved builds` : "-"}
          </div>
        </div>

        {/* Most Popular Budget */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Popular Budget</span>
          </div>
          <div className="mt-2 font-bold text-white text-sm line-clamp-1">
            {stats?.mostPopularBudget?.name || "None yet"}
          </div>
          <div className="text-[11px] text-amber-400 font-bold mt-1">
            {stats?.mostPopularBudget ? `${stats.mostPopularBudget.count} saved builds` : "-"}
          </div>
        </div>

        {/* Most Common Rarity */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Common Rarity</span>
          </div>
          <div className="mt-2 font-bold text-white text-sm line-clamp-1">
            {stats?.mostCommonRarity?.name || "None yet"}
          </div>
          <div className="text-[11px] text-rose-400 font-bold mt-1">
            {stats?.mostCommonRarity ? `${stats.mostCommonRarity.count} saved builds` : "-"}
          </div>
        </div>
      </div>

      {/* Saved Builds List */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Latest Saved Builds by Members ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Bookmark className="w-8 h-8 opacity-40 mx-auto mb-2" />
            ยังไม่มีรายการ Saved Builds ในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400">
                      {b.rarity}
                    </span>
                    <h4 className="font-bold text-white line-clamp-1 mt-0.5">{b.build_name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sky-400">
                      ฿{b.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 space-y-1">
                  <div className="truncate">GPU: {b.parts?.gpu?.name}</div>
                  <div className="truncate">CPU: {b.parts?.cpu?.name}</div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>
                    Saved by:{" "}
                    <Link
                      href={`/admin/members/${b.user_id}`}
                      className="text-slate-300 hover:text-white font-bold"
                    >
                      {b.profiles?.username || "Member"}
                    </Link>
                  </span>
                  <span>{new Date(b.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
