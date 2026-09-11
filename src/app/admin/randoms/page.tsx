"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dices, Calendar, RefreshCw, Sparkles, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";

interface RandomLogItem {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  buildName: string;
  price: number;
  performance: number;
  value: number;
  luck: number;
  rarity: string;
  date: string;
}

export default function AdminRandomsPage() {
  const { session } = useAuth();
  const [randoms, setRandoms] = useState<RandomLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  const fetchRandoms = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/randoms?time=${timeFilter}&limit=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRandoms(data.randoms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandoms();
  }, [session, timeFilter]);

  const rarityColors: Record<string, string> = {
    Common: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    Rare: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    Epic: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    Legendary: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Mythic: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Dices className="w-7 h-7 text-sky-400" />
            <span>Random Activity Feed</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ประวัติการสุ่มสเปกคอมพิวเตอร์ทั้งหมดของผู้ใช้งานในระบบ ({randoms.length} รายการ)
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {["today", "7d", "30d", "all"].map((filterKey) => {
            const labels: Record<string, string> = {
              today: "Today",
              "7d": "7 Days",
              "30d": "30 Days",
              all: "All Time",
            };
            const active = timeFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setTimeFilter(filterKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10"
                }`}
              >
                {labels[filterKey]}
              </button>
            );
          })}

          <button
            onClick={fetchRandoms}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Build</th>
                <th className="py-3.5 px-3 text-right">Price</th>
                <th className="py-3.5 px-3 text-center">Performance</th>
                <th className="py-3.5 px-3 text-center">Value</th>
                <th className="py-3.5 px-3 text-center">Luck</th>
                <th className="py-3.5 px-3 text-center">Rarity</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
                    Loading random activity...
                  </td>
                </tr>
              ) : randoms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                    <Dices className="w-8 h-8 opacity-40 mx-auto mb-2 text-slate-500" />
                    ไม่พบข้อมูลการสุ่มในช่วงเวลานี้
                  </td>
                </tr>
              ) : (
                randoms.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/members/${item.user.id}`}
                        className="font-bold text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>{item.user.username}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {item.user.email}
                      </div>
                    </td>

                    {/* Build Name */}
                    <td className="py-3.5 px-3 font-semibold text-white max-w-[180px] truncate">
                      {item.buildName}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 text-right font-mono font-black text-sky-300">
                      ฿{item.price.toLocaleString()}
                    </td>

                    {/* Performance */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                      {item.performance}/100
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                      {item.value}/100
                    </td>

                    {/* Luck */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                      {item.luck}/100
                    </td>

                    {/* Rarity */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          rarityColors[item.rarity] || rarityColors.Common
                        }`}
                      >
                        {item.rarity}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
