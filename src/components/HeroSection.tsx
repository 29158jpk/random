"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Gift,
  Trophy,
  Gamepad2,
  Sparkles,
  Flame,
  ChevronRight,
  Dices,
  Lock,
} from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  onScrollToRandom: () => void;
  onRandomClick?: () => void;
  onOpenDailyChallenge?: () => void;
  onOpenCollection?: () => void;
  onOpenHistory?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToRandom,
  onRandomClick,
  onOpenDailyChallenge,
  onOpenCollection,
}) => {
  const { isAuthenticated } = useAuth();
  const [bannerImgError, setBannerImgError] = useState(false);
  const [card1Error, setCard1Error] = useState(false);
  const [card2Error, setCard2Error] = useState(false);
  const [card3Error, setCard3Error] = useState(false);

  const handleClickRandom = () => {
    playClickSound();
    if (onRandomClick) {
      onRandomClick();
    } else {
      onScrollToRandom();
    }
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-6 px-3 sm:px-6 lg:px-8 space-y-6">
      
      {/* ============================================================ */}
      {/* 1. CURVED GAMING HERO BANNER (CYAN / BLUE / PURPLE THEME)    */}
      {/* ============================================================ */}
      <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden banner-glow-frame-cyan bg-slate-950 aspect-[16/7] sm:aspect-[21/9] flex items-center justify-center shadow-2xl">
        
        {/* Background Image */}
        {!bannerImgError ? (
          <Image
            src="/images/hero-banner-cyan.jpg"
            alt="Horizon Auto PC Gaming Portal Banner"
            fill
            priority
            className="object-cover object-center select-none"
            onError={() => setBannerImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950 via-slate-900 to-purple-950" />
        )}

        {/* Ambient Dark-to-Cyan/Purple Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-color-dodge pointer-events-none" />

        {/* Floating Cyan/Purple Sparks */}
        <div className="absolute top-4 left-1/4 w-2 h-2 rounded-full bg-cyan-400 blur-xs animate-ping" />
        <div className="absolute bottom-8 right-1/3 w-3 h-3 rounded-full bg-purple-400 blur-xs animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-sky-300 blur-xs animate-ping" />

        {/* Center Branding */}
        <div className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center justify-center">
          
          {/* Huge Slanted 3D Gaming Logo */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none select-none mb-3">
            <span className="text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)]">HORIZON </span>
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent text-glow-cyan">
              AUTO PC
            </span>
          </h1>

          {/* Clean Tagline */}
          <div className="inline-block px-4 sm:px-6 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl">
            <p className="text-base sm:text-xl md:text-2xl font-black text-cyan-300 tracking-wide drop-shadow-md">
              “Spin Your PC. Find Your Build.”
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ANNOUNCEMENT NEWS TICKER (แถบประกาศไฟวิ่ง)                 */}
      {/* ============================================================ */}
      <div className="relative max-w-6xl mx-auto rounded-full bg-slate-900/90 text-white px-4 py-2 shadow-xl overflow-hidden flex items-center gap-3 border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[11px] font-black uppercase shrink-0">
          <Flame className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
          <span>ประกาศ</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 text-xs sm:text-sm font-bold text-cyan-200">
          <div className="animate-marquee inline-block">
            ยินดีต้อนรับสู่ HORIZON AUTO PC ✨ สุ่มสเปกคอมพิวเตอร์ตามงบประมาณและการใช้งาน ลุ้นรับสเปกระดับ Mythic & Legendary พร้อมระบบตรวจสอบความเข้ากันได้ 100%! 🚀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ยินดีต้อนรับสู่ HORIZON AUTO PC ✨ สุ่มสเปกคอมพิวเตอร์ตามงบประมาณและการใช้งาน ลุ้นรับสเปกระดับ Mythic & Legendary!
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 3 GLOWING ACTION CARDS (CYAN / PURPLE THEME)              */}
      {/* ============================================================ */}
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
        
        {/* Card 1: สุ่มสเปกคอม */}
        <div className="rounded-3xl border-neon-cyan bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 p-4 flex items-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
          
          {/* Card Graphic */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-cyan-500/30 relative bg-slate-900 shadow-inner flex items-center justify-center">
            {!card1Error ? (
              <img
                src="/images/card-random.jpg"
                alt="สุ่มสเปกคอมพิวเตอร์"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setCard1Error(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-900 via-slate-950 to-sky-900 p-3 flex flex-col items-center justify-center text-cyan-300 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                <Dices className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)] mb-1" />
                <span className="text-[10px] font-black uppercase text-cyan-200 tracking-wider">RANDOM PC</span>
              </div>
            )}
          </div>

          {/* Card Details & Action Button */}
          <div className="flex-1 text-left flex flex-col justify-between h-full py-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-cyan-500 text-slate-950">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                LUCKY DRAW
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight mb-1">
              สุ่มสเปกคอม
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              จัดสเปกตามงบและการใช้งาน
            </p>
            <button
              onClick={handleClickRandom}
              className="w-full py-2 px-4 rounded-xl glow-btn-cyan text-white text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isAuthenticated ? (
                <Dices className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>คลิก</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: ภารกิจประจำวัน (Daily Challenge) */}
        <div className="rounded-3xl border-neon-cyan bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 p-4 flex items-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Graphic */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-amber-500/30 relative bg-slate-900 shadow-inner flex items-center justify-center">
            {!card2Error ? (
              <img
                src="/images/card-challenge.jpg"
                alt="ภารกิจประจำวัน Daily Challenge"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setCard2Error(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-900 p-3 flex flex-col items-center justify-center text-amber-300 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] mb-1" />
                <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">CHALLENGE</span>
              </div>
            )}
          </div>

          {/* Card Details & Action Button */}
          <div className="flex-1 text-left flex flex-col justify-between h-full py-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-amber-500 text-slate-950">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                CHALLENGE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight mb-1">
              ภารกิจประจำวัน
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              ท้าทายจัดสเปกรับเหรียญ
            </p>
            <button
              onClick={() => {
                playClickSound();
                if (onOpenDailyChallenge) onOpenDailyChallenge();
              }}
              className="w-full py-2 px-4 rounded-xl glow-btn-cyan text-white text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>คลิก</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: คลังสเปก & ประวัติ (Collection / History) */}
        <div className="rounded-3xl border-neon-cyan bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 p-4 flex items-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Graphic */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-purple-500/30 relative bg-slate-900 shadow-inner flex items-center justify-center">
            {!card3Error ? (
              <img
                src="/images/card-collection.jpg"
                alt="คลังสเปกและผลงาน"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setCard3Error(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-900 p-3 flex flex-col items-center justify-center text-purple-300 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                <Gamepad2 className="w-10 h-10 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] mb-1" />
                <span className="text-[10px] font-black uppercase text-purple-200 tracking-wider">COLLECTION</span>
              </div>
            )}
          </div>

          {/* Card Details & Action Button */}
          <div className="flex-1 text-left flex flex-col justify-between h-full py-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded bg-purple-500 text-white">
                <Gamepad2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                COLLECTION
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight mb-1">
              คลังสเปกของฉัน
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              สเปกที่บันทึกไว้ & ประวัติ
            </p>
            <button
              onClick={() => {
                playClickSound();
                if (onOpenCollection) onOpenCollection();
              }}
              className="w-full py-2 px-4 rounded-xl glow-btn-cyan text-white text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>คลิก</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
