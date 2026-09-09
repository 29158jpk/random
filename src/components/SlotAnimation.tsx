"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Eye, HardDrive, Zap, Box, Wind, ShieldCheck, CircuitBoard } from "lucide-react";
import { playReelTickSound, playRevealSound } from "@/lib/soundEffects";
import { PCBuild } from "@/types/hardware";

interface SlotAnimationProps {
  finalBuild: PCBuild;
  onAnimationComplete: () => void;
}

const STAGES = [
  { key: "cpu", label: "CPU (Processor)", icon: Cpu },
  { key: "gpu", label: "GPU (Graphics)", icon: Eye },
  { key: "motherboard", label: "Motherboard", icon: CircuitBoard },
  { key: "ram", label: "RAM (Memory)", icon: Zap },
  { key: "storage", label: "SSD (Storage)", icon: HardDrive },
  { key: "psu", label: "PSU (Power)", icon: Zap },
  { key: "case", label: "Case & Airflow", icon: Box },
  { key: "cooler", label: "Cooler (Thermal)", icon: Wind },
];

export const SlotAnimation: React.FC<SlotAnimationProps> = ({
  finalBuild,
  onAnimationComplete,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [tickerText, setTickerText] = useState("ANALYZING BUDGET...");

  useEffect(() => {
    // Total animation: ~1.4 seconds across stages
    const stageDuration = 160; // ms per component
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < STAGES.length) {
        setCurrentStageIndex(currentIdx);
        const stage = STAGES[currentIdx];
        const part = finalBuild[stage.key as keyof PCBuild] as { name?: string };
        setTickerText(part?.name || "MATCHING HARDWARE...");
        playReelTickSound(400 + currentIdx * 45);
        currentIdx++;
      } else {
        clearInterval(interval);
        playRevealSound(finalBuild.rarity);
        setTimeout(() => {
          onAnimationComplete();
        }, 180);
      }
    }, stageDuration);

    return () => clearInterval(interval);
  }, [finalBuild, onAnimationComplete]);

  const activeStage = STAGES[Math.min(currentStageIndex, STAGES.length - 1)];
  const IconComponent = activeStage.icon;

  return (
    <div className="w-full glass-panel border border-sky-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden my-6 animate-pulse">
      {/* Background cyber grid scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/20">
          <IconComponent className="w-10 h-10 text-sky-400 animate-spin-slow" />
        </div>

        <div className="text-xs font-bold tracking-widest text-sky-400 uppercase mb-2">
          SYNCHRONIZING {activeStage.label}
        </div>

        <div className="text-xl sm:text-2xl font-black text-white tracking-wide truncate px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 mb-6">
          {tickerText}
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {STAGES.map((s, idx) => (
            <div
              key={s.key}
              className={`h-2 rounded-full transition-all duration-150 ${
                idx === currentStageIndex
                  ? "w-8 bg-sky-400 shadow-md shadow-sky-400"
                  : idx < currentStageIndex
                  ? "w-2.5 bg-sky-600"
                  : "w-2.5 bg-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verifying Wattage, Socket & Form-Factor Compatibility...</span>
        </div>
      </div>
    </div>
  );
};
