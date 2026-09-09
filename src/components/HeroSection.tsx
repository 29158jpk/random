"use client";

import React from "react";
import { Dices, Sparkles, Zap, ShieldCheck, Flame, Lock } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  onScrollToRandom: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToRandom }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleClickRandom = () => {
    playClickSound();
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    onScrollToRandom();
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
      {/* Background ambient neon glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold mb-6 shadow-inner animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Next-Gen Conditional PC Randomizer</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
          <span className="bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
            Horizon Auto PC
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-200 mb-3 tracking-wide">
          “Spin Your PC. Find Your Build.”
        </p>

        {/* Thai Description */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
          สุ่มสเปกคอมที่เหมาะกับงบและสไตล์การใช้งานของคุณ ตรวจสอบความเข้ากันได้
          คำนวณคะแนนความคุ้มค่า และลุ้นรับ <span className="text-amber-400 font-semibold">Luck Score</span> พร้อมระดับความหายากสุดเร้าใจ
        </p>

        {/* Massive 🎲 RANDOM PC Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={handleClickRandom}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-lg sm:text-xl tracking-wider uppercase shadow-xl shadow-sky-500/25 glow-btn flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            {isAuthenticated ? (
              <Dices className="w-7 h-7 animate-spin-slow" />
            ) : (
              <Lock className="w-6 h-6 text-amber-300 animate-pulse" />
            )}
            <span>🎲 RANDOM PC</span>
          </button>
        </div>

        {/* Value Props & Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">100% Compatible</h4>
              <p className="text-[11px] sm:text-xs text-slate-400">เช็ค Socket, RAM, ไฟ PSU</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Luck & Rarity</h4>
              <p className="text-[11px] sm:text-xs text-slate-400">ลุ้นสเปกระดับ Mythic & God</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Smart Rerolls</h4>
              <p className="text-[11px] sm:text-xs text-slate-400">Better & Cheaper Reroll</p>
            </div>
          </div>

          <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Game FPS Benchmark</h4>
              <p className="text-[11px] sm:text-xs text-slate-400">ประเมินเฟรมเรตเกมจริง</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
