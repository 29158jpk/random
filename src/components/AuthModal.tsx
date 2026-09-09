"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, KeyRound, User as UserIcon, X, AlertCircle, CheckCircle2, Sparkles, Database } from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";

interface AuthModalProps {
  onSuccessMessage?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessMessage }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    signIn,
    signUp,
    isConfigured,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setErrorMessage(null);
    setSuccessInfo(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(
            error.message.includes("Invalid login credentials")
              ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
              : error.message
          );
        } else {
          closeAuthModal();
          if (onSuccessMessage) {
            onSuccessMessage("✅ Login successful! พร้อมสุ่ม PC ของคุณแล้ว");
          }
        }
      } else {
        const { error, user } = await signUp(email, password, username);
        if (error) {
          setErrorMessage(error.message);
        } else if (user && !user.identities?.length) {
          setErrorMessage("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ");
        } else {
          // If auto sign-in was enabled
          setSuccessInfo("✅ สมัครสมาชิกสำเร็จ! ระบบเข้าสู่ระบบให้คุณเรียบร้อยแล้ว");
          setTimeout(() => {
            closeAuthModal();
            if (onSuccessMessage) {
              onSuccessMessage("✅ Login successful! พร้อมสุ่ม PC ของคุณแล้ว");
            }
          }, 900);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-sky-500/30 p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            closeAuthModal();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <Lock className="w-7 h-7 text-sky-400 animate-pulse" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>🔒 Login Required</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสุ่ม PC ได้
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            เข้าสู่ระบบก่อนเพื่อเริ่มสุ่ม PC ของคุณ และบันทึก Build ลงในบัญชี
          </p>
        </div>


        {/* Tab Switcher: Login / Create Account */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setErrorMessage(null);
              openAuthModal("login");
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              isLogin
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Login (เข้าสู่ระบบ)
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setErrorMessage(null);
              openAuthModal("register");
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              !isLogin
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account (สมัครสมาชิก)
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successInfo && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Username (ชื่อผู้ใช้)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="เช่น ProGamer99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email (อีเมล)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password (รหัสผ่าน)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons: [Login / Create Account] and [Cancel] */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : isLogin ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (Login)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างบัญชี (Create Account)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                closeAuthModal();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
            >
              Cancel (ยกเลิก)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
