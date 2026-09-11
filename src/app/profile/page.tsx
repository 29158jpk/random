"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import {
  User,
  Shield,
  Calendar,
  Clock,
  Dices,
  Bookmark,
  Clover,
  Trophy,
  Diamond,
  ArrowLeft,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { PCBuild } from "@/types/hardware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user, profile, isAuthenticated, isAdmin, isSuspended, signOut, openAuthModal } = useAuth();
  const [builds, setBuilds] = useState<PCBuild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.id;

    async function loadBuilds() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("user_builds")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (data) {
            const parsed: PCBuild[] = data.map((row) => ({
              id: row.id,
              name: row.build_name,
              timestamp: new Date(row.created_at).getTime(),
              cpu: row.parts.cpu,
              gpu: row.parts.gpu,
              motherboard: row.parts.motherboard,
              ram: row.parts.ram,
              storage: row.parts.storage,
              psu: row.parts.psu,
              cooler: row.parts.cooler,
              case: row.parts.case,
              totalPrice: row.total_price,
              budget: row.budget,
              totalPowerWatts: (row.parts.cpu?.power || 65) + (row.parts.gpu?.power || 120) + 120,
              scores: row.scores,
              luckScore: row.luck_score,
              luckTier: row.luck_tier,
              rarity: row.rarity,
              specialBuild: row.special_build,
              analysis: row.analysis,
              estimatedFps: row.estimated_fps || [],
            }));
            setBuilds(parsed);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(err);
        }
      }

      // Local fallback
      try {
        const raw = localStorage.getItem(`horizon_history_${userId}`);
        if (raw) setBuilds(JSON.parse(raw));
      } catch {
        // ignore
      }
      setLoading(false);
    }

    loadBuilds();
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full glass-panel border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Member Profile</h2>
          <p className="text-xs text-slate-400">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์และสถิติของคุณ</p>
          <button
            onClick={() => openAuthModal("login")}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold"
          >
            เข้าสู่ระบบ (Login)
          </button>
          <Link href="/" className="block text-xs text-slate-400 hover:text-white">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const username = profile?.username || user.user_metadata?.username || user.email?.split("@")[0] || "Member";
  const avatarLetter = username.charAt(0).toUpperCase();

  const savedBuilds = builds.filter((b) => {
    try {
      const savedRaw = localStorage.getItem(`horizon_saved_${user.id}`);
      if (savedRaw) {
        const savedList: PCBuild[] = JSON.parse(savedRaw);
        return savedList.some((s) => s.id === b.id);
      }
    } catch {}
    return false;
  });

  const bestLuck = builds.length ? Math.max(...builds.map((b) => b.luckScore)) : 0;
  const bestScore = builds.length ? Math.max(...builds.map((b) => b.scores?.overall || 0)) : 0;
  const mythicCount = builds.filter((b) => b.rarity === "Mythic").length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Return to Horizon Auto PC</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Profile Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-sky-500/25 shrink-0">
                {avatarLetter}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{username}</h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase ${
                      isAdmin
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    }`}
                  >
                    {profile?.role || "user"}
                  </span>
                  {isSuspended && (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Suspended
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-400 font-mono mt-1">{user.email}</div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Member Since:{" "}
                      {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-bold transition-all flex items-center gap-2 self-start"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 5 Personal Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-sky-500/30 text-center">
            <Dices className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
            <div className="text-[10px] font-bold text-slate-400 uppercase">Random Builds</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{builds.length}</div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 text-center">
            <Bookmark className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-[10px] font-bold text-slate-400 uppercase">Saved Builds</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{savedBuilds.length}</div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 text-center">
            <Clover className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-[10px] font-bold text-slate-400 uppercase">Best Luck</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{bestLuck}/100</div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <div className="text-[10px] font-bold text-slate-400 uppercase">Best Score</div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">{bestScore}/100</div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-rose-500/30 text-center col-span-2 sm:col-span-1">
            <Diamond className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
            <div className="text-[10px] font-bold text-slate-400 uppercase">Mythic Builds</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">{mythicCount}</div>
          </div>
        </div>

        {/* User's Builds History */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Dices className="w-4 h-4 text-sky-400" />
              <span>Recent Builds by {username} ({builds.length})</span>
            </h3>
            <Link
              href="/"
              className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
            >
              <span>Spin New PC</span>
            </Link>
          </div>

          {builds.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Dices className="w-10 h-10 opacity-30 mx-auto mb-2 text-sky-400" />
              คุณยังไม่เคยสุ่มสเปกคอม กด "Spin New PC" ด้านบนเพื่อเริ่มสุ่มเลย!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {builds.slice(0, 10).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-sky-500/30 transition-all space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-sky-400">
                        {b.rarity}
                      </span>
                      <h4 className="font-bold text-white text-sm line-clamp-1 mt-0.5">{b.name}</h4>
                    </div>
                    <div className="text-right font-mono font-black text-sky-300">
                      ฿{b.totalPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 space-y-1 font-mono">
                    <div className="truncate">CPU: {b.cpu?.name}</div>
                    <div className="truncate">GPU: {b.gpu?.name}</div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>
                      Luck: <strong className="text-emerald-400">{b.luckScore}/100</strong>
                    </span>
                    <span>{new Date(b.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
