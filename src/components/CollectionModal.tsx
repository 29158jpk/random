"use client";

import React from "react";
import { PCBuild } from "@/types/hardware";
import { Bookmark, X, Trash2, ExternalLink, Sparkles, Heart } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedBuilds: PCBuild[];
  onSelectBuild: (build: PCBuild) => void;
  onDeleteBuild: (id: string) => void;
  onClearAll: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  savedBuilds,
  onSelectBuild,
  onDeleteBuild,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-sky-500/30 p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                My Collection ({savedBuilds.length})
              </h2>
              <p className="text-xs text-slate-400">
                สเปกคอมที่คุณกดบันทึกหัวใจไว้ (บันทึกในเครื่อง LocalStorage)
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
          {savedBuilds.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                ยังไม่มี Build ในคอลเลกชัน
              </p>
              <p className="text-xs text-slate-500 mt-1">
                กดปุ่ม &quot;❤️ SAVE BUILD&quot; หลังสุ่มเพื่อเก็บสเปกที่ชอบไว้ที่นี่
              </p>
            </div>
          ) : (
            savedBuilds.map((build) => (
              <div
                key={build.id}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-sky-400">
                      {build.rarity}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Luck: {build.luckScore}/100
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">
                      Score: {build.scores.overall}/100
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-sky-300 transition-colors">
                    {build.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {build.cpu.name} • {build.gpu.name} • {build.ram.name}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-base sm:text-lg font-black text-emerald-400">
                    ฿{build.totalPrice.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        onSelectBuild(build);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                      title="ดูรายละเอียด Build นี้"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteBuild(build.id);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all"
                      title="ลบออกจากคอลเลกชัน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedBuilds.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                playClickSound();
                if (confirm("คุณต้องการล้างคอลเลกชันทั้งหมดใช่หรือไม่?")) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              ล้างทั้งหมด (Clear Collection)
            </button>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
