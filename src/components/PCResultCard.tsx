"use client";

import React, { useState } from "react";
import {
  PCBuild,
  HardwareItem,
  RarityTier,
  LuckTier,
} from "@/types/hardware";
import { getHardwareImageUrl } from "@/lib/hardwareImages";
import {
  Cpu,
  Eye,
  CircuitBoard,
  Zap,
  HardDrive,
  Box,
  Wind,
  RotateCw,
  TrendingUp,
  DollarSign,
  Heart,
  Share2,
  Check,
  Flame,
  Sparkles,
  Trophy,
  Gauge,
  Gamepad2,
  Copy,
  Info,
  Lock,
} from "lucide-react";
import { playClickSound, playJackpotSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface PCResultCardProps {
  build: PCBuild;
  isSaved: boolean;
  onReroll: () => void;
  onBetterReroll: () => void;
  onCheaperReroll: () => void;
  onToggleSave: () => void;
  onSelectHardware?: (item: HardwareItem) => void;
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

export const PCResultCard: React.FC<PCResultCardProps> = ({
  build,
  isSaved,
  onReroll,
  onBetterReroll,
  onCheaperReroll,
  onToggleSave,
  onSelectHardware,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedPartId, setCopiedPartId] = useState<string | null>(null);

  const rarityInfo = RARITY_STYLES[build.rarity] || RARITY_STYLES.Common;
  const luckInfo = LUCK_STYLES[build.luckTier] || LUCK_STYLES.Normal;

  const handleShare = async () => {
    playClickSound();
    const shareText = `🎲 I generated a PC on Horizon Auto PC!

Build: ${build.name}
CPU: ${build.cpu.name}
GPU: ${build.gpu.name}
RAM: ${build.ram.name}
SSD: ${build.storage.name}

💰 ฿${build.totalPrice.toLocaleString()} (Budget: ฿${build.budget.toLocaleString()})
🍀 Luck: ${build.luckScore}/100 (${build.luckTier})
⭐ Rarity: ${build.rarity}
${build.specialBuild ? `🔥 ${build.specialBuild.badge}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Horizon Auto PC: ${build.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
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

  const copyPartName = (name: string, id: string) => {
    playClickSound();
    navigator.clipboard.writeText(name);
    setCopiedPartId(id);
    setTimeout(() => setCopiedPartId(null), 1500);
  };

  const parts = [
    { label: "CPU", item: build.cpu, icon: Cpu },
    { label: "GPU", item: build.gpu, icon: Eye },
    { label: "Motherboard", item: build.motherboard, icon: CircuitBoard },
    { label: "RAM", item: build.ram, icon: Zap },
    { label: "SSD", item: build.storage, icon: HardDrive },
    { label: "PSU", item: build.psu, icon: Zap },
    { label: "Case", item: build.case, icon: Box },
    { label: "Cooler", item: build.cooler, icon: Wind },
  ];

  return (
    <div
      className={`glass-panel border-2 rounded-3xl p-5 sm:p-8 shadow-2xl transition-all ${rarityInfo.border} ${rarityInfo.glow}`}
    >
      {/* Top Banner: Rarity + Special Build Announcement */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${rarityInfo.bg} ${rarityInfo.border} ${rarityInfo.text}`}
          >
            {rarityInfo.badge}
          </span>

          {build.specialBuild && (
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {build.specialBuild.badge}
            </span>
          )}
        </div>

        {/* PC Luck Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">PC Luck:</span>
          <span className={`text-sm font-black ${luckInfo.color}`}>
            {build.luckScore}/100
          </span>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            ({build.luckTier})
          </span>
        </div>
      </div>

      {/* Special Build description alert if triggered */}
      {build.specialBuild && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/50 border border-rose-500/30 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">
              {build.specialBuild.badge}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {build.specialBuild.description}
            </p>
          </div>
        </div>
      )}

      {/* Title & Price Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            <span>🎲 YOUR RANDOM PC</span>
            <span>•</span>
            <span className="text-sky-400">Total System Draw: ~{build.totalPowerWatts}W</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {build.name}
          </h2>
        </div>

        {/* Price & Savings */}
        <div className="flex flex-col md:items-end">
          <div className="text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text">
            ฿{build.totalPrice.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-0.5">
            Budget: ฿{build.budget.toLocaleString()}{" "}
            {build.budget - build.totalPrice > 0 ? (
              <span className="text-emerald-400 font-bold">
                (ประหยัด ฿{(build.budget - build.totalPrice).toLocaleString()})
              </span>
            ) : (
              <span className="text-slate-400 font-bold">(เป๊ะตามงบ)</span>
            )}
          </div>
        </div>
      </div>

      {/* 4 Score Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="glass-panel p-3 rounded-xl border border-white/10 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Performance</div>
          <div className="text-2xl font-black text-sky-400 mt-0.5">
            {build.scores.performance}<span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${build.scores.performance}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-white/10 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Value</div>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">
            {build.scores.value}<span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${build.scores.value}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-white/10 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Compatibility</div>
          <div className="text-2xl font-black text-indigo-400 mt-0.5">
            {build.scores.compatibility}<span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-400 h-full rounded-full transition-all duration-700"
              style={{ width: `100%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-white/10 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Overall Score</div>
          <div className="text-2xl font-black text-amber-400 mt-0.5">
            {build.scores.overall}<span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${build.scores.overall}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hardware Parts Breakdown */}
      <div className="space-y-2.5 mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
          <span>Component Breakdown (8 Parts)</span>
          <span className="text-slate-500 font-normal">คลิกชื่อชิ้นส่วนเพื่อคัดลอก</span>
        </div>

        {parts.map((p) => {
          const Icon = p.icon;
          const isCopied = copiedPartId === p.item.id;
          const img = getHardwareImageUrl(p.item);
          return (
            <div
              key={p.label}
              onClick={() => {
                if (onSelectHardware) {
                  playClickSound();
                  onSelectHardware(p.item);
                }
              }}
              className="group glass-panel p-3 sm:p-3.5 rounded-2xl border border-white/5 hover:border-sky-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-sky-500/40 transition-colors p-1">
                  <img
                    src={img}
                    alt={p.item.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getHardwareImageUrl({
                        category: p.item.category,
                        name: p.item.name,
                      });
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {p.label}
                    </span>
                    {p.item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/20">
                        {p.item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    {p.item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {p.item.specs || p.item.brand}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-200">
                    {p.item.price === 0 ? "ฟรี (Included)" : `฿${p.item.price.toLocaleString()}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tier {p.item.performanceTier}/10
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyPartName(p.item.name, p.item.id);
                  }}
                  className="p-1 rounded text-slate-500 hover:text-sky-400 transition-colors"
                  title="Copy Name"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-40 hover:opacity-100" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game FPS Benchmark Section */}
      {build.estimatedFps && build.estimatedFps.length > 0 && (
        <div className="mb-8 glass-panel p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Estimated In-Game FPS
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {build.estimatedFps.map((gameItem) => (
              <div
                key={gameItem.game}
                className="bg-slate-900/70 p-3 rounded-xl border border-white/5 text-center"
              >
                <div className="text-xs font-semibold text-slate-300 truncate">
                  {gameItem.game}
                </div>
                <div className="text-xl font-black text-sky-400 mt-1">
                  ~{gameItem.fps} <span className="text-[10px] text-slate-400">FPS</span>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                    gameItem.playableTier === "Ultra"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : gameItem.playableTier === "High"
                      ? "bg-sky-500/20 text-sky-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {gameItem.playableTier} Tier
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build Analysis */}
      <div className="mb-8 glass-panel p-4 sm:p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            Build Analysis (วิเคราะห์สเปก)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
          {build.analysis.summary}
        </p>
        <p className="text-xs text-sky-300/90 font-medium bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20">
          💡 {build.analysis.suitability}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Normal Reroll */}
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              openAuthModal("login");
              return;
            }
            onReroll();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all hover:scale-102"
        >
          {isAuthenticated ? (
            <RotateCw className="w-4 h-4 text-sky-400" />
          ) : (
            <Lock className="w-4 h-4 text-amber-300" />
          )}
          <span>🔄 REROLL</span>
        </button>

        {/* Better Reroll */}
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              openAuthModal("login");
              return;
            }
            onBetterReroll();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all hover:scale-102"
        >
          {isAuthenticated ? (
            <TrendingUp className="w-4 h-4 text-sky-200" />
          ) : (
            <Lock className="w-4 h-4 text-amber-300" />
          )}
          <span>⚡ BETTER REROLL</span>
        </button>

        {/* Cheaper Reroll */}
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              openAuthModal("login");
              return;
            }
            onCheaperReroll();
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
        >
          {isAuthenticated ? (
            <DollarSign className="w-4 h-4 text-emerald-200" />
          ) : (
            <Lock className="w-4 h-4 text-amber-300" />
          )}
          <span>💰 CHEAPER REROLL</span>
        </button>
      </div>

      {/* Save & Share Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-white/10">
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              openAuthModal("login");
              return;
            }
            onToggleSave();
          }}
          className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
            isSaved
              ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
              : "bg-slate-800/80 hover:bg-slate-700 border-white/10 text-slate-200"
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{isSaved ? "❤️ SAVED IN COLLECTION" : "❤️ SAVE BUILD"}</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold text-xs sm:text-sm transition-all"
        >
          {copiedShare ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED TO CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>📤 SHARE BUILD</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
