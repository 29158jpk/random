"use client";

import React from "react";
import { Lock, LogIn, X, ShieldAlert } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedLogin: () => void;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onProceedLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-amber-500/40 p-6 sm:p-8 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-lg shadow-amber-500/20 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase mb-2">
          LOGIN REQUIRED
        </h3>

        {/* Prompt message */}
        <p className="text-sm sm:text-base font-bold text-amber-300 mb-2">
          Please login before generating your PC.
        </p>

        <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
          กรุณาเข้าสู่ระบบเพื่อเริ่มการสุ่มสเปกคอมพิวเตอร์ การตั้งค่างบประมาณและการเลือกของคุณจะถูกเก็บรักษาไว้ทั้งหมด
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 font-bold text-xs sm:text-sm border border-white/10 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              playClickSound();
              onProceedLogin();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 hover:scale-102"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
