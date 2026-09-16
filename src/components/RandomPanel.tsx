"use client";

import React from "react";
import {
  UserPreferences,
  UsageType,
  ResolutionType,
  RandomMode,
  CaseStyle,
} from "@/types/hardware";
import {
  Dices,
  Gamepad2,
  Tv,
  Briefcase,
  Video,
  Code,
  Flame,
  Check,
  Sparkles,
  Zap,
  DollarSign,
  Shuffle,
  Shield,
  Layers,
  Settings2,
  Lock,
  Sliders,
} from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface RandomPanelProps {
  preferences: UserPreferences;
  onChangePreferences: (prefs: UserPreferences) => void;
  onSpin: () => void;
  isSpinning: boolean;
}

const BUDGET_PRESETS = [
  10000, 15000, 20000, 25000, 30000, 40000, 50000, 70000, 100000,
];

const USAGE_OPTIONS: { id: UsageType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "streaming", label: "Streaming", icon: Tv },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "editing", label: "Editing", icon: Video },
  { id: "programming", label: "Programming", icon: Code },
  { id: "all_around", label: "All Around", icon: Flame },
];

const GAME_OPTIONS = [
  "Valorant",
  "Counter-Strike 2",
  "GTA V",
  "GTA VI",
  "Minecraft",
  "Roblox",
  "Fortnite",
  "PUBG",
  "Apex Legends",
  "Call of Duty",
];

const MODES: { id: RandomMode; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: "normal", label: "Normal", icon: Dices, desc: "สุ่มสมดุลตามความต้องการ" },
  { id: "chaos", label: "Chaos", icon: Shuffle, desc: "สุ่มอิสระ ไร้ขีดจำกัด" },
  { id: "budget", label: "Budget", icon: DollarSign, desc: "เน้นประหยัด คุ้มค่าสูงสุด" },
  { id: "performance", label: "Performance", icon: Zap, desc: "รีดความแรงชนเพดานงบ" },
  { id: "lucky", label: "Lucky", icon: Sparkles, desc: "เพิ่มโอกาสได้ Build พิเศษ & เทพ" },
];

export const RandomPanel: React.FC<RandomPanelProps> = ({
  preferences,
  onChangePreferences,
  onSpin,
  isSpinning,
}) => {
  const { isAuthenticated } = useAuth();

  const update = (fields: Partial<UserPreferences>) => {
    onChangePreferences({ ...preferences, ...fields });
  };

  const toggleGame = (game: string) => {
    playClickSound();
    const current = preferences.selectedGames;
    if (current.includes(game)) {
      update({ selectedGames: current.filter((g) => g !== game) });
    } else {
      update({ selectedGames: [...current, game] });
    }
  };

  return (
    <div id="random-engine" className="w-full glass-panel border border-white/10 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6">
      {/* Panel Title & Current Config Summary */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              PC Configuration
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/25 px-2.5 py-0.5 rounded-full">
            Ready to Spin
          </span>
        </div>

        {/* Selected Values Summary Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            ฿{preferences.budget.toLocaleString()}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 capitalize">
            {preferences.usage} ({preferences.resolution})
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 capitalize">
            Mode: {preferences.mode}
          </span>
          {preferences.cpuBrand !== "No Preference" && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-white/10">
              CPU: {preferences.cpuBrand}
            </span>
          )}
          {preferences.gpuBrand !== "No Preference" && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-white/10">
              GPU: {preferences.gpuBrand}
            </span>
          )}
        </div>
      </div>

      {/* 1. BUDGET SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Budget (งบประมาณ)</span>
          </label>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
            ฿{preferences.budget.toLocaleString()}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {BUDGET_PRESETS.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                playClickSound();
                update({ budget: amount });
              }}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all ${
                preferences.budget === amount
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-102 font-black"
                  : "bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 border border-white/5"
              }`}
            >
              ฿{(amount / 1000).toLocaleString()}k
            </button>
          ))}
        </div>

        {/* Custom Slider + Manual Input */}
        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min={8000}
            max={120000}
            step={1000}
            value={preferences.budget}
            onChange={(e) => update({ budget: Number(e.target.value) })}
            className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="relative shrink-0 w-28">
            <input
              type="number"
              min={8000}
              max={200000}
              step={500}
              value={preferences.budget}
              onChange={(e) => update({ budget: Math.max(5000, Number(e.target.value)) })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-bold text-white text-right focus:outline-none focus:border-emerald-400"
            />
            <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-bold">฿</span>
          </div>
        </div>
      </div>

      {/* 2. USAGE SECTION */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-sky-400" />
          <span>Usage (ประเภทการใช้งาน)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {USAGE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preferences.usage === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  playClickSound();
                  update({ usage: opt.id });
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20"
                    : "bg-slate-800/60 hover:bg-slate-800 border-white/5 text-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TARGET RESOLUTION */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
          Target Resolution (ความละเอียดหน้าจอ)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["1080p", "1440p", "4k"] as ResolutionType[]).map((res) => (
            <button
              key={res}
              onClick={() => {
                playClickSound();
                update({ resolution: res });
              }}
              className={`py-2 rounded-xl text-xs font-black uppercase transition-all ${
                preferences.resolution === res
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                  : "bg-slate-800/70 text-slate-400 border border-white/5 hover:bg-slate-800"
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* 4. TARGET GAMES (if Gaming) */}
      {preferences.usage === "gaming" && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Target Games (เกมที่ต้องการเล่น)
            </div>
            <span className="text-[10px] text-sky-400 font-bold">
              {preferences.selectedGames.length} เกมที่เลือก
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {GAME_OPTIONS.map((game) => {
              const isSelected = preferences.selectedGames.includes(game);
              return (
                <button
                  key={game}
                  onClick={() => toggleGame(game)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/30"
                      : "bg-slate-800/70 text-slate-400 border border-white/5 hover:bg-slate-800"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{game}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. HARDWARE PREFERENCES */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Hardware Preference (ค่ายและสไตล์ที่ชอบ)</span>
        </label>

        {/* CPU & GPU Brands */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              CPU Brand
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["No Preference", "AMD", "Intel"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    playClickSound();
                    update({ cpuBrand: b });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    preferences.cpuBrand === b
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      : "bg-slate-800/70 text-slate-400 border border-white/5"
                  }`}
                >
                  {b === "No Preference" ? "Auto" : b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              GPU Brand
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["No Preference", "NVIDIA", "AMD"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    playClickSound();
                    update({ gpuBrand: b });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    preferences.gpuBrand === b
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      : "bg-slate-800/70 text-slate-400 border border-white/5"
                  }`}
                >
                  {b === "No Preference" ? "Auto" : b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Case Style */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Case Aesthetic
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {(["No Preference", "RGB", "Black", "White", "Minimal", "Gaming"] as const).map((cs) => (
              <button
                key={cs}
                onClick={() => {
                  playClickSound();
                  update({ caseStyle: cs });
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all ${
                  preferences.caseStyle === cs
                    ? "bg-sky-500 text-slate-950 font-black"
                    : "bg-slate-800/70 text-slate-400 border border-white/5"
                }`}
              >
                {cs === "No Preference" ? "Any" : cs}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. RANDOM MODE */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-amber-400" />
          <span>Random Mode (โหมดการสุ่ม)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = preferences.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  playClickSound();
                  update({ mode: m.id });
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-gradient-to-b from-sky-500/25 to-indigo-500/25 border-sky-400 shadow-md shadow-sky-500/20"
                    : "bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
                  <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {m.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Massive 🎲 RANDOM PC Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            playClickSound();
            onSpin();
          }}
          disabled={isSpinning}
          className={`w-full py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-xl tracking-wider uppercase shadow-2xl flex items-center justify-center gap-3 transition-all ${
            isSpinning
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-sky-500/30 glow-btn active:scale-98"
          }`}
        >
          {isSpinning ? (
            <Dices className="w-6 h-6 animate-spin" />
          ) : !isAuthenticated ? (
            <Lock className="w-6 h-6 text-amber-300 animate-pulse" />
          ) : (
            <Dices className="w-6 h-6 animate-bounce" />
          )}
          <span>
            {isSpinning
              ? "GENERATING PC BUILD..."
              : !isAuthenticated
              ? "🔒 RANDOM PC (LOGIN REQUIRED)"
              : "🎲 RANDOM PC"}
          </span>
        </button>
      </div>
    </div>
  );
};
