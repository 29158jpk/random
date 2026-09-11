"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "sky" | "purple" | "emerald" | "amber" | "rose" | "indigo";
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "sky",
  trend,
}) => {
  const colorMap = {
    sky: {
      border: "border-sky-500/25 hover:border-sky-500/50",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      glow: "shadow-sky-500/10",
    },
    purple: {
      border: "border-purple-500/25 hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      glow: "shadow-purple-500/10",
    },
    emerald: {
      border: "border-emerald-500/25 hover:border-emerald-500/50",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      border: "border-amber-500/25 hover:border-amber-500/50",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      glow: "shadow-amber-500/10",
    },
    rose: {
      border: "border-rose-500/25 hover:border-rose-500/50",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      glow: "shadow-rose-500/10",
    },
    indigo: {
      border: "border-indigo-500/25 hover:border-indigo-500/50",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      glow: "shadow-indigo-500/10",
    },
  };

  const scheme = colorMap[color] || colorMap.sky;

  return (
    <div
      className={`glass-panel rounded-2xl p-4 sm:p-5 border ${scheme.border} transition-all duration-200 hover:-translate-y-0.5 shadow-lg ${scheme.glow} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${scheme.bg} flex items-center justify-center ${scheme.text} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] font-bold text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
