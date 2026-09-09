"use client";

import React, { useState } from "react";
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
  ChevronRight,
  Sparkles,
  Zap,
  DollarSign,
  Shuffle,
  Shield,
  Layers,
  Settings2,
  Lock,
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
  const { isAuthenticated, openAuthModal } = useAuth();
  const [mobileStep, setMobileStep] = useState<number>(1);

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
    <div id="random-engine" className="w-full glass-panel border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl">
      {/* Mobile Step Wizard Tabs */}
      <div className="flex sm:hidden items-center justify-between gap-1 mb-6 pb-4 border-b border-white/10 overflow-x-auto">
        {[
          { step: 1, label: "1. Budget" },
          { step: 2, label: "2. Usage" },
          { step: 3, label: "3. Hardware" },
          { step: 4, label: "4. Mode" },
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => {
              playClickSound();
              setMobileStep(s.step);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              mobileStep === s.step
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                : "bg-slate-800/80 text-slate-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 sm:space-y-7">
        {/* STEP 1: Budget */}
        <div className={mobileStep !== 1 ? "hidden sm:block" : "block"}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Budget (งบประมาณ)</span>
            </label>
            <div className="text-sm sm:text-base font-black text-emerald-400">
              ฿{preferences.budget.toLocaleString()}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {BUDGET_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  playClickSound();
                  update({ budget: amount });
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                  preferences.budget === amount
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-102"
                    : "bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 border border-white/5"
                }`}
              >
                ฿{(amount / 1000).toLocaleString()}k
              </button>
            ))}
          </div>

          {/* Custom Slider / Input */}
          <div className="flex items-center gap-3">
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

        {/* STEP 2: Usage & Gaming Preferences */}
        <div className={mobileStep !== 2 ? "hidden sm:block" : "block"}>
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <Gamepad2 className="w-4 h-4 text-sky-400" />
            <span>Usage (ประเภทการใช้งาน)</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
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
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
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

          {/* Resolution Selector */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Target Resolution
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["1080p", "1440p", "4k"] as ResolutionType[]).map((res) => (
                <button
                  key={res}
                  onClick={() => {
                    playClickSound();
                    update({ resolution: res });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    preferences.resolution === res
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                      : "bg-slate-800/70 text-slate-400 border border-white/5"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Gaming Preference: Multi-select Games */}
          {preferences.usage === "gaming" && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Target Games (เลือกเกมที่เล่นบ่อย)
                </div>
                <div className="text-[10px] text-sky-400 font-semibold">
                  {preferences.selectedGames.length} เกมที่เลือก
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {GAME_OPTIONS.map((game) => {
                  const isChecked = preferences.selectedGames.includes(game);
                  return (
                    <button
                      key={game}
                      onClick={() => toggleGame(game)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm shadow-purple-500/20"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-purple-400" />}
                      <span>{game}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: Hardware Preference */}
        <div className={mobileStep !== 3 ? "hidden sm:block" : "block"}>
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span>Hardware Preference (ความชอบส่วนตัว)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* CPU Brand */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">CPU Brand</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["AMD", "Intel", "No Preference"] as const).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      playClickSound();
                      update({ cpuBrand: brand });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      preferences.cpuBrand === brand
                        ? "bg-sky-500 text-slate-950 font-extrabold"
                        : "bg-slate-800/70 text-slate-400 border border-white/5"
                    }`}
                  >
                    {brand === "No Preference" ? "Any" : brand}
                  </button>
                ))}
              </div>
            </div>

            {/* GPU Brand */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">GPU Brand</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["NVIDIA", "AMD", "Intel", "No Preference"] as const).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      playClickSound();
                      update({ gpuBrand: brand });
                    }}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all ${
                      preferences.gpuBrand === brand
                        ? "bg-emerald-500 text-slate-950 font-extrabold"
                        : "bg-slate-800/70 text-slate-400 border border-white/5"
                    }`}
                  >
                    {brand === "No Preference" ? "Any" : brand}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* RAM */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">RAM Capacity</div>
              <div className="grid grid-cols-3 gap-1">
                {(["16GB", "32GB", "64GB"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      playClickSound();
                      update({
                        ramSize: preferences.ramSize === size ? "No Preference" : size,
                      });
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      preferences.ramSize === size
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-800/70 text-slate-400 border border-white/5"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">Storage SSD</div>
              <div className="grid grid-cols-3 gap-1">
                {(["500GB", "1TB", "2TB"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      playClickSound();
                      update({
                        storageSize: preferences.storageSize === size ? "No Preference" : size,
                      });
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      preferences.storageSize === size
                        ? "bg-purple-500 text-white"
                        : "bg-slate-800/70 text-slate-400 border border-white/5"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Case Theme */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">Case Style</div>
              <div className="grid grid-cols-3 gap-1">
                {(["Black", "White", "RGB"] as CaseStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      playClickSound();
                      update({
                        caseStyle: preferences.caseStyle === style ? "No Preference" : style,
                      });
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      preferences.caseStyle === style
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800/70 text-slate-400 border border-white/5"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: Random Mode */}
        <div className={mobileStep !== 4 ? "hidden sm:block" : "block"}>
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <Shuffle className="w-4 h-4 text-purple-400" />
            <span>Random Mode (โหมดการสุ่ม)</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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

        {/* Mobile Step Navigation */}
        <div className="flex sm:hidden items-center justify-between gap-2 pt-2">
          {mobileStep > 1 && (
            <button
              onClick={() => {
                playClickSound();
                setMobileStep(mobileStep - 1);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              ย้อนกลับ
            </button>
          )}
          {mobileStep < 4 ? (
            <button
              onClick={() => {
                playClickSound();
                setMobileStep(mobileStep + 1);
              }}
              className="ml-auto px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Massive 🎲 RANDOM PC Button */}
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              openAuthModal("login");
              return;
            }
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
