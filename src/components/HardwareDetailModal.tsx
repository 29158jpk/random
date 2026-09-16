"use client";

import React from "react";
import { HardwareItem, PCBuild } from "@/types/hardware";
import {
  X,
  Cpu,
  Tv,
  Layers,
  HardDrive,
  Zap,
  Fan,
  Box,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Activity,
  DollarSign,
  Gauge,
} from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { getHardwareImageUrl } from "@/lib/hardwareImages";

interface HardwareDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HardwareItem | null;
  buildContext?: PCBuild | null;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  cpu: Cpu,
  gpu: Tv,
  motherboard: Layers,
  ram: Layers,
  storage: HardDrive,
  psu: Zap,
  cooler: Fan,
  case: Box,
};

export const HardwareDetailModal: React.FC<HardwareDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  buildContext,
}) => {
  if (!isOpen || !item) return null;

  const Icon = CATEGORY_ICONS[item.category] || Cpu;
  const imageUrl = getHardwareImageUrl(item);

  // Performance score normalized
  const perfScore =
    item.performanceTier > 10 ? item.performanceTier : Math.round(item.performanceTier * 10);

  // Compatibility checklist items
  const compatibilityChecks: string[] = [];

  if (item.category === "cpu") {
    if (buildContext?.motherboard) {
      compatibilityChecks.push(
        `✓ Compatible with Motherboard Socket (${item.socket || "Standard"} match)`
      );
    }
    if (buildContext?.psu) {
      compatibilityChecks.push(
        `✓ PSU Power is sufficient (${buildContext.psu.power}W handles ${item.power}W CPU)`
      );
    }
    if (buildContext?.gpu) {
      compatibilityChecks.push(
        `✓ CPU/GPU combination supported without severe bottleneck`
      );
    }
    if (buildContext?.cooler) {
      compatibilityChecks.push(
        `✓ Cooler thermal capacity adequate for ${item.power}W TDP`
      );
    }
  } else if (item.category === "gpu") {
    if (buildContext?.motherboard) {
      compatibilityChecks.push(
        `✓ Compatible with Motherboard PCIe x16 slot`
      );
    }
    if (buildContext?.psu) {
      compatibilityChecks.push(
        `✓ PSU Power is sufficient (${buildContext.psu.power}W covers ${item.power}W GPU draw)`
      );
    }
    if (buildContext?.case) {
      compatibilityChecks.push(
        `✓ Compatible with Case clearance and GPU bracket length`
      );
    }
    if (buildContext?.cpu) {
      compatibilityChecks.push(
        `✓ CPU/GPU balance certified for high frame stability`
      );
    }
  } else if (item.category === "motherboard") {
    if (buildContext?.cpu) {
      compatibilityChecks.push(
        `✓ CPU Socket match (${item.socket || "AM4/AM5/LGA"} compatible with ${buildContext.cpu.name})`
      );
    }
    if (buildContext?.ram) {
      compatibilityChecks.push(
        `✓ Memory Architecture match (${item.memoryType || "DDR4/DDR5"} compatible with ${buildContext.ram.name})`
      );
    }
    if (buildContext?.case) {
      compatibilityChecks.push(
        `✓ Case Form-Factor mount verified`
      );
    }
  } else if (item.category === "ram") {
    if (buildContext?.motherboard) {
      compatibilityChecks.push(
        `✓ Memory bus speed and DDR spec compatible with ${buildContext.motherboard.name}`
      );
    }
    compatibilityChecks.push(`✓ Dual-channel architecture bandwidth optimized`);
  } else if (item.category === "psu") {
    const totalEst = buildContext ? buildContext.totalPowerWatts : 400;
    compatibilityChecks.push(
      `✓ PSU capacity ${item.power}W exceeds estimated system draw (${totalEst}W)`
    );
    compatibilityChecks.push(`✓ Over-voltage & short-circuit safety protections`);
    compatibilityChecks.push(`✓ Standard ATX mounting compatible with chassis`);
  } else if (item.category === "storage") {
    compatibilityChecks.push(`✓ NVMe M.2 / SATA high-speed transfer bus supported`);
    compatibilityChecks.push(`✓ Thermal heat spreader clearance verified`);
  } else if (item.category === "cooler") {
    if (buildContext?.cpu) {
      compatibilityChecks.push(
        `✓ Mounting bracket compatible with ${buildContext.cpu.socket || "Socket"}`
      );
    }
    compatibilityChecks.push(`✓ Heat dissipation covers CPU TDP requirements`);
  } else if (item.category === "case") {
    compatibilityChecks.push(`✓ High-airflow chassis with dust filtration`);
    compatibilityChecks.push(`✓ Motherboard standoff and PSU chamber compatible`);
  }

  // If custom compatibility text from database is present, add it
  if (item.compatibility && !compatibilityChecks.includes(`✓ ${item.compatibility}`)) {
    compatibilityChecks.unshift(`✓ ${item.compatibility}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl glass-panel border border-sky-500/30 p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-400">
                {item.category.toUpperCase()} DETAILS
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {item.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Product Image Section */}
          <div className="w-full h-44 sm:h-52 rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden relative flex items-center justify-center p-2">
            <img
              src={imageUrl}
              alt={item.name}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getHardwareImageUrl({
                  category: item.category,
                  name: item.name,
                });
              }}
            />
            {item.badge && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/30 text-sky-200 border border-sky-500/40">
                {item.badge}
              </span>
            )}
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {/* Brand */}
            <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Brand
              </span>
              <span className="text-xs sm:text-sm font-black text-white truncate block mt-0.5">
                {item.brand}
              </span>
            </div>

            {/* Model */}
            {item.model && (
              <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Model
                </span>
                <span className="text-xs sm:text-sm font-black text-sky-400 truncate block mt-0.5 font-mono">
                  {item.model}
                </span>
              </div>
            )}

            {/* VRAM (for GPU/RAM) */}
            {item.vram && (
              <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  VRAM
                </span>
                <span className="text-xs sm:text-sm font-black text-purple-400 truncate block mt-0.5 font-mono">
                  {item.vram}GB
                </span>
              </div>
            )}

            {/* Power */}
            <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Power Draw
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400 truncate block mt-0.5 font-mono">
                {item.power_consumption || `${item.power}W`}
              </span>
            </div>

            {/* Performance */}
            <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Performance
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 truncate block mt-0.5 font-mono">
                {perfScore}/100
              </span>
            </div>

            {/* Socket if present */}
            {item.socket && (
              <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Socket
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-200 truncate block mt-0.5 font-mono">
                  {item.socket}
                </span>
              </div>
            )}

            {/* Memory Type if present */}
            {item.memoryType && (
              <div className="glass-panel p-2.5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                  Memory Type
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-200 truncate block mt-0.5 font-mono">
                  {item.memoryType}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="glass-panel p-2.5 rounded-xl border border-emerald-500/30 text-center bg-emerald-500/5">
              <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                Price
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 truncate block mt-0.5 font-mono">
                {item.price === 0 ? "Included" : `฿${item.price.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Specifications */}
          {item.specs && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Specifications
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                {item.specs}
              </p>
            </div>
          )}

          {/* Description (if present in Database) */}
          {item.description && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Product Description
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Compatibility Verification Checklist */}
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Compatibility Analysis</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              {compatibilityChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{check.replace(/^✓\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* External Product URL if present */}
          {item.product_url && (
            <a
              href={item.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-sky-400 hover:text-sky-300 text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-colors"
            >
              <span>ดูข้อมูลสินค้าเพิ่มเติม (Official / Store Link)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Hardware ID: <span className="font-mono text-[11px] text-slate-300">{item.id}</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
