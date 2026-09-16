"use client";

import React, { useState } from "react";
import {
  PCBuild,
  HardwareItem,
  RarityTier,
  LuckTier,
  ComponentCategory,
} from "@/types/hardware";
import {
  Cpu,
  Tv,
  Layers,
  HardDrive,
  Zap,
  Fan,
  Box,
  X,
  Heart,
  Share2,
  RotateCw,
  TrendingUp,
  DollarSign,
  Sparkles,
  Flame,
  Check,
  CheckCircle2,
  Trophy,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { getHardwareImageUrl } from "@/lib/hardwareImages";

interface PCResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: PCBuild | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onReroll: () => void;
  onBetterReroll: () => void;
  onCheaperReroll: () => void;
  onSelectHardware: (item: HardwareItem) => void;
}

const RARITY_STYLES: Record<
  RarityTier,
  { badge: string; border: string; glow: string; text: string; bg: string }
> = {
  Common: {
    badge: "⚪ Common",
    border: "border-slate-500/40",
    glow: "shadow-slate-500/10",
    text: "text-slate-300",
    bg: "bg-slate-500/10",
  },
  Rare: {
    badge: "🔵 Rare",
    border: "border-sky-500/50",
    glow: "shadow-sky-500/25",
    text: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  Epic: {
    badge: "🟣 Epic",
    border: "border-purple-500/60",
    glow: "shadow-purple-500/30",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  Legendary: {
    badge: "🟡 Legendary",
    border: "border-amber-400/70",
    glow: "shadow-amber-400/35",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  Mythic: {
    badge: "🔴 Mythic",
    border: "border-rose-500/80",
    glow: "shadow-rose-500/40 animate-pulse",
    text: "text-rose-400",
    bg: "bg-rose-500/15",
  },
};

const LUCK_STYLES: Record<LuckTier, { color: string; label: string }> = {
  Unlucky: { color: "text-slate-400", label: "🥀 Unlucky (0-30)" },
  Normal: { color: "text-blue-300", label: "⚖️ Normal (31-60)" },
  Lucky: { color: "text-emerald-400", label: "🍀 Lucky (61-80)" },
  "Very Lucky": { color: "text-amber-400", label: "✨ Very Lucky (81-95)" },
  "INSANE LUCK": { color: "text-rose-400 animate-pulse", label: "🌟 INSANE LUCK (96-100)" },
};

export const PCResultModal: React.FC<PCResultModalProps> = ({
  isOpen,
  onClose,
  build,
  isSaved,
  onToggleSave,
  onReroll,
  onBetterReroll,
  onCheaperReroll,
  onSelectHardware,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !build) return null;

  const rarityInfo = RARITY_STYLES[build.rarity] || RARITY_STYLES.Common;
  const luckInfo = LUCK_STYLES[build.luckTier] || LUCK_STYLES.Normal;

  // Calculate Budget Used percentage
  const budgetUsedPct =
    build.budget > 0
      ? Math.min(100, Math.round((build.totalPrice / build.budget) * 1000) / 10)
      : 100;

  const handleShare = async () => {
    playClickSound();
    const shareText = `🎲 I generated a PC on Horizon Auto PC!

Build: ${build.name}
Total Price: ฿${build.totalPrice.toLocaleString()} (Budget: ฿${build.budget.toLocaleString()})
Luck Score: ${build.luckScore}/100 (${build.luckTier})
Rarity: ${build.rarity}
${build.specialBuild ? `Special: ${build.specialBuild.badge}` : ""}

Specs:
• CPU: ${build.cpu.name}
• GPU: ${build.gpu.name}
• RAM: ${build.ram.name}
• SSD: ${build.storage.name}
• Mobo: ${build.motherboard.name}
• PSU: ${build.psu.name}
• Case: ${build.case.name}
• Cooler: ${build.cooler.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Horizon Auto PC: ${build.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  const hardwareCards: {
    categoryLabel: string;
    item: HardwareItem;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { categoryLabel: "CPU", item: build.cpu, icon: Cpu },
    { categoryLabel: "GPU", item: build.gpu, icon: Tv },
    { categoryLabel: "Motherboard", item: build.motherboard, icon: Layers },
    { categoryLabel: "RAM", item: build.ram, icon: Layers },
    { categoryLabel: "SSD", item: build.storage, icon: HardDrive },
    { categoryLabel: "PSU", item: build.psu, icon: Zap },
    { categoryLabel: "Case", item: build.case, icon: Box },
    { categoryLabel: "CPU Cooler", item: build.cooler, icon: Fan },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        className={`w-full max-w-5xl rounded-3xl glass-panel border-2 ${rarityInfo.border} ${rarityInfo.glow} p-4 sm:p-6 lg:p-8 shadow-2xl relative my-auto max-h-[94vh] flex flex-col`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-sky-400">
                  PC GENERATED!
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${rarityInfo.bg} ${rarityInfo.border} ${rarityInfo.text}`}
                >
                  {rarityInfo.badge}
                </span>
                {build.specialBuild && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    <Flame className="w-3 h-3 text-rose-400" />
                    {build.specialBuild.badge}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {build.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Close Popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Top Showcase Banner: Price + Budget Used + Scores */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5">
            {/* Left: Build Image / PC Image Representation */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 border border-sky-500/30 overflow-hidden relative flex items-center justify-center shadow-xl group">
                <img
                  src={getHardwareImageUrl(build.case)}
                  alt={build.name}
                  className="max-h-full max-w-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 inset-x-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-sky-300">
                  {build.case.name.split(" ").slice(0, 3).join(" ")}
                </div>
              </div>
            </div>

            {/* Right: Metrics & Scores */}
            <div className="md:col-span-8 space-y-4">
              {/* Pricing row */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Total Build Price
                  </span>
                  <div className="text-2xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-sky-300 to-sky-400 bg-clip-text">
                    ฿{build.totalPrice.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Budget Used
                  </span>
                  <div className="text-lg sm:text-2xl font-black text-white font-mono">
                    {budgetUsedPct}%{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      (งบ ฿{build.budget.toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Core Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10">
                {/* Luck */}
                <div className="glass-panel p-2 rounded-xl border border-amber-500/30 text-center bg-amber-500/5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">
                    Luck Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                    {build.luckScore}/100
                  </span>
                </div>

                {/* Performance */}
                <div className="glass-panel p-2 rounded-xl border border-sky-500/30 text-center bg-sky-500/5">
                  <span className="text-[10px] text-sky-400 font-bold uppercase block">
                    Performance
                  </span>
                  <span className="text-base sm:text-lg font-black text-sky-400 font-mono">
                    {build.scores.performance}/100
                  </span>
                </div>

                {/* Value */}
                <div className="glass-panel p-2 rounded-xl border border-emerald-500/30 text-center bg-emerald-500/5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                    Value Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {build.scores.value}/100
                  </span>
                </div>

                {/* Compatibility */}
                <div className="glass-panel p-2 rounded-xl border border-indigo-500/30 text-center bg-indigo-500/5">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block">
                    Compatibility
                  </span>
                  <span className="text-base sm:text-lg font-black text-indigo-300 font-mono">
                    100/100
                  </span>
                </div>

                {/* Rarity */}
                <div className="glass-panel p-2 rounded-xl border border-purple-500/30 text-center bg-purple-500/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">
                    Rarity
                  </span>
                  <span className="text-base sm:text-lg font-black text-purple-300 uppercase">
                    {build.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: 8 Interactive Hardware Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Hardware Components (8 ชิ้น)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 hidden sm:inline">
                  คลิกที่ Card เพื่อดูรายละเอียดสินค้า
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                System Draw: ~{build.totalPowerWatts}W
              </span>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {hardwareCards.map((card) => {
                const Icon = card.icon;
                const img = getHardwareImageUrl(card.item);
                return (
                  <div
                    key={card.categoryLabel}
                    onClick={() => {
                      playClickSound();
                      onSelectHardware(card.item);
                    }}
                    className="group glass-panel rounded-2xl p-3 sm:p-3.5 border border-white/10 hover:border-sky-400/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/15 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Category & Badge */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-sky-300 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {card.categoryLabel}
                          </span>
                        </div>
                        {card.item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 truncate max-w-[90px]">
                            {card.item.badge}
                          </span>
                        )}
                      </div>

                      {/* Component Product Image */}
                      <div className="w-full h-24 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center p-1.5 mb-2.5 overflow-hidden group-hover:border-sky-500/30 transition-colors">
                        <img
                          src={img}
                          alt={card.item.name}
                          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getHardwareImageUrl({
                              category: card.item.category,
                              name: card.item.name,
                            });
                          }}
                        />
                      </div>

                      {/* Component Name */}
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-tight mb-1">
                        {card.item.name}
                      </h4>

                      {/* Key Specs / VRAM */}
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {card.item.vram ? `${card.item.vram}GB • ` : ""}
                        {card.item.specs || card.item.brand}
                      </p>
                    </div>

                    {/* Price & Click Hint */}
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="text-xs sm:text-sm font-black text-sky-400 font-mono">
                        {card.item.price === 0
                          ? "Included"
                          : `฿${card.item.price.toLocaleString()}`}
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-sky-400 transition-colors flex items-center gap-0.5">
                        Details <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-white/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Actions: Save & Share */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                playClickSound();
                onToggleSave();
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                isSaved
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md shadow-rose-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-400 text-rose-400" : ""}`} />
              <span>{isSaved ? "Saved in Collection" : "Save Build"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Right Actions: Rerolls & Close */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                playClickSound();
                onCheaperReroll();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
              title="สุ่มใหม่โดยเน้นความประหยัด"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Cheaper Reroll</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onBetterReroll();
              }}
              className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
              title="สุ่มใหม่โดยดันประสิทธิภาพสูงสุด"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Better Reroll</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onReroll();
              }}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reroll</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
