"use client";

import React from "react";
import { DailyChallenge, PCBuild } from "@/types/hardware";
import { Trophy, X, Sparkles, CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyChallenge: DailyChallenge;
  onAcceptChallenge: (challenge: DailyChallenge) => void;
  lastBuild?: PCBuild | null;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  dailyChallenge,
  onAcceptChallenge,
  lastBuild,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  if (!isOpen) return null;

  // Evaluate if the last build satisfies the challenge
  let challengePassed = false;
  let evaluationNotes = "";

  if (lastBuild) {
    const underBudget = lastBuild.totalPrice <= dailyChallenge.targetBudget;
    let constraintsMet = true;

    if (dailyChallenge.constraints.cpuBrand && lastBuild.cpu.brand !== dailyChallenge.constraints.cpuBrand) {
      constraintsMet = false;
    }
    if (dailyChallenge.constraints.gpuBrand && lastBuild.gpu.brand !== dailyChallenge.constraints.gpuBrand) {
      constraintsMet = false;
    }
    if (dailyChallenge.constraints.caseStyle && lastBuild.case.caseStyle !== dailyChallenge.constraints.caseStyle) {
      constraintsMet = false;
    }

    challengePassed = underBudget && constraintsMet;
    if (challengePassed) {
      evaluationNotes = `🎉 ยินดีด้วย! คุณผ่านภารกิจประจำวันด้วย Build "${lastBuild.name}" ในราคา ฿${lastBuild.totalPrice.toLocaleString()} (Luck: ${lastBuild.luckScore}/100)`;
    } else {
      evaluationNotes = `ยังไม่ผ่านเงื่อนไข (สเปกล่าสุด: ฿${lastBuild.totalPrice.toLocaleString()}) กด "TRY CHALLENGE" เพื่อลองใหม่อีกครั้ง!`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/25">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>DAILY PC CHALLENGE</span>
              <span>•</span>
              <span className="text-slate-400">{dailyChallenge.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {dailyChallenge.title}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-white/5">
          {dailyChallenge.description}
        </p>

        {/* Requirements Card */}
        <div className="mb-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            เงื่อนไขภารกิจ (Mission Goals):
          </div>
          <div className="glass-panel p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">งบประมาณเป้าหมาย:</span>
              <span className="font-bold text-emerald-400">
                ไม่เกิน ฿{dailyChallenge.targetBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ประเภทการใช้งาน:</span>
              <span className="font-bold text-sky-400 capitalize">
                {dailyChallenge.targetUsage}
              </span>
            </div>
            {dailyChallenge.constraints.cpuBrand && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">แบรนด์ CPU:</span>
                <span className="font-bold text-indigo-400">
                  {dailyChallenge.constraints.cpuBrand}
                </span>
              </div>
            )}
            {dailyChallenge.constraints.gpuBrand && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">แบรนด์ GPU:</span>
                <span className="font-bold text-purple-400">
                  {dailyChallenge.constraints.gpuBrand}
                </span>
              </div>
            )}
            {dailyChallenge.constraints.caseStyle && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">สไตล์เคส:</span>
                <span className="font-bold text-amber-400">
                  {dailyChallenge.constraints.caseStyle} Theme
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status result if evaluated */}
        {lastBuild && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold mb-6 flex items-start gap-2.5 ${
              challengePassed
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800/80 border-white/10 text-slate-300"
            }`}
          >
            {challengePassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <p>{evaluationNotes}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            playClickSound();
            if (!isAuthenticated) {
              onClose();
              openAuthModal("login");
              return;
            }
            onAcceptChallenge(dailyChallenge);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102"
        >
          {isAuthenticated ? (
            <>
              <span>🎲 TRY CHALLENGE</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-950" />
              <span>🔒 LOGIN TO TRY CHALLENGE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
