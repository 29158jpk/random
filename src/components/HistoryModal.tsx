"use client";

import React from "react";
import { PCBuild } from "@/types/hardware";
import { History, X, RotateCcw, Clock, Sparkles } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { getHardwareImageUrl } from "@/lib/hardwareImages";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyBuilds: PCBuild[];
  onSelectBuild: (build: PCBuild) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyBuilds,
  onSelectBuild,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-purple-500/30 p-5 sm:p-7 shadow-2xl relative my-auto max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Build History ({historyBuilds.length})
              </h2>
              <p className="text-xs text-slate-400">
                ประวัติการสุ่มล่าสุด 35 รายการ พร้อมรูปภาพและสเปกอุปกรณ์
              </p>
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {historyBuilds.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                ยังไม่มีประวัติการสุ่ม
              </p>
              <p className="text-xs text-slate-500 mt-1">
                กดปุ่ม &quot;🎲 RANDOM PC&quot; เพื่อเริ่มต้นการสุ่มครั้งแรก
              </p>
            </div>
          ) : (
            historyBuilds.map((build) => {
              const formattedTime = new Date(build.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const caseImg = getHardwareImageUrl(build.case);

              return (
                <div
                  key={build.id}
                  className="glass-panel p-3 sm:p-3.5 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={caseImg}
                        alt={build.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getHardwareImageUrl({
                            category: "case",
                            name: build.name,
                          });
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formattedTime}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-black text-purple-400">
                          {build.rarity}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {build.luckScore}/100
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors truncate">
                        {build.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {build.cpu.name} • {build.gpu.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                    <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                      ฿{build.totalPrice.toLocaleString()}
                    </div>

                    <button
                      onClick={() => {
                        playClickSound();
                        onSelectBuild(build);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="โหลด Build นี้ขึ้นมาแสดง"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {historyBuilds.length > 0 && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                playClickSound();
                if (confirm("คุณต้องการล้างประวัติการสุ่มทั้งหมดใช่หรือไม่?")) {
                  onClearHistory();
                }
              }}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              ล้างประวัติทั้งหมด
            </button>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
