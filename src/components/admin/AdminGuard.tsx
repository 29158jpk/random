"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Lock, ArrowLeft, RefreshCw, LogIn, Sparkles } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user, profile, openAuthModal, signOut } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center animate-pulse">
              <Lock className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Horizon Security System</h2>
            <p className="text-xs text-slate-400 mt-1">Verifying Administrator Privileges...</p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Guest user trying to access /admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-md w-full glass-panel border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-wider mb-2">
            Authentication Required
          </div>
          <h1 className="text-2xl font-black text-white">Admin Access Restricted</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            หน้านี้สำหรับผู้ดูแลระบบ Horizon Auto PC กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ Admin
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าหลัก Horizon Auto PC</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated user but NOT admin -> Show 403 Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full glass-panel border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-xs uppercase tracking-widest mb-2">
            403 Forbidden
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Access Denied
          </h1>

          <p className="text-sm text-slate-300 mt-2 font-medium">
            พื้นที่นี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin Only) เท่านั้น
          </p>

          <div className="my-5 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-left text-xs">
            <div className="text-slate-400 font-semibold mb-1">สถานะผู้ใช้งานปัจจุบัน:</div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="truncate max-w-[200px]">{user?.email}</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold uppercase text-[10px]">
                Role: {profile?.role || "user"}
              </span>
            </div>
            {profile?.status === "suspended" && (
              <div className="mt-2 text-rose-400 font-bold text-[11px] bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                ⚠️ บัญชีนี้อยู่ในสถานะถูกระงับการใช้งาน (Suspended)
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก Horizon Auto PC</span>
            </Link>

            <button
              onClick={async () => {
                await signOut();
                openAuthModal("login");
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>สลับบัญชี (Switch Account)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is an active Administrator
  return <>{children}</>;
};
