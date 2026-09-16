"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Lock,
  Mail,
  KeyRound,
  User as UserIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Delete,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { playClickSound } from "@/lib/soundEffects";

const ADMIN_PIN = "1111";
const ADMIN_EMAIL = "admin@horizonpc.local";
const ADMIN_PASSWORD = "admin123456";

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
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Admin PIN pad state
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const pinTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  // Handle PIN digit press
  const handlePinPress = async (digit: string) => {
    if (pin.length >= 4 || loading) return;
    playClickSound();
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      if (newPin === ADMIN_PIN) {
        setLoading(true);
        const { error } = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
        setLoading(false);
        if (!error) {
          setSuccessInfo("🛡️ Admin Access Granted!");
          setTimeout(() => {
            closeAuthModal();
            if (onSuccessMessage) onSuccessMessage("🛡️ Admin login สำเร็จ!");
          }, 700);
        } else {
          setPinError(true);
          setPinShake(true);
          if (pinTimeout.current) clearTimeout(pinTimeout.current);
          pinTimeout.current = setTimeout(() => {
            setPin("");
            setPinShake(false);
          }, 800);
        }
      } else {
        setPinError(true);
        setPinShake(true);
        if (pinTimeout.current) clearTimeout(pinTimeout.current);
        pinTimeout.current = setTimeout(() => {
          setPin("");
          setPinShake(false);
          setPinError(false);
        }, 800);
      }
    }
  };

  const handlePinDelete = () => {
    playClickSound();
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  };

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
          const msg = error.message;
          setErrorMessage(
            msg.includes("Invalid login credentials")
              ? "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่ หรือลองใช้รหัสผ่านที่ตั้งไว้ตอนสมัคร"
              : msg.includes("รหัสผ่านไม่ถูกต้อง")
              ? "🔑 " + msg
              : msg
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
          onClick={() => { playClickSound(); closeAuthModal(); }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => { playClickSound(); setErrorMessage(null); openAuthModal("login"); }}
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
            onClick={() => { playClickSound(); setErrorMessage(null); openAuthModal("register"); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              !isLogin
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account (สมัครสมาชิก)
          </button>
        </div>

        {/* ━━━ ADMIN QUICK ACCESS PIN PAD ━━━ */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setShowPinPad((v) => !v);
              setPin("");
              setPinError(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              showPinPad
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/20"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>🛡️ Admin Quick Access</span>
              {showPinPad && (
                <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[10px] font-black tracking-widest">
                  ADMIN
                </span>
              )}
            </div>
            {showPinPad ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPinPad && (
            <div className="mt-2 p-5 rounded-2xl bg-slate-950/90 border border-purple-500/30 shadow-xl shadow-purple-500/10 animate-in slide-in-from-top-2">
              <p className="text-center text-[11px] text-slate-400 mb-4">
                กรอก Admin PIN (4 หลัก) เพื่อเข้าสู่ระบบอัตโนมัติ
              </p>

              {/* PIN dot indicators */}
              <div
                className="flex items-center justify-center gap-4 mb-4"
                style={pinShake ? { animation: "shake 0.4s ease-in-out" } : {}}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pin.length > i
                        ? pinError
                          ? "bg-rose-400 border-rose-400 shadow-md shadow-rose-400/50"
                          : "bg-purple-400 border-purple-400 shadow-md shadow-purple-400/50 scale-110"
                        : "bg-transparent border-slate-600"
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-center text-[11px] text-rose-400 font-bold mb-3 animate-in fade-in">
                  ❌ PIN ไม่ถูกต้อง กรุณาลองใหม่
                </p>
              )}

              {/* Number pad grid */}
              <div className="grid grid-cols-3 gap-2">
                {["1","2","3","4","5","6","7","8","9"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handlePinPress(d)}
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-800 hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 text-white font-black text-lg transition-all active:scale-95 disabled:opacity-40 hover:text-purple-200"
                  >
                    {d}
                  </button>
                ))}
                {/* CLR / 0 / DEL */}
                <button
                  type="button"
                  onClick={() => { playClickSound(); setPin(""); setPinError(false); }}
                  disabled={loading}
                  className="h-12 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 font-bold text-xs transition-all active:scale-95 disabled:opacity-40"
                >
                  CLR
                </button>
                <button
                  type="button"
                  onClick={() => handlePinPress("0")}
                  disabled={loading}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-purple-500/20 hover:border-purple-500/50 border border-white/10 text-white font-black text-lg transition-all active:scale-95 disabled:opacity-40 hover:text-purple-200"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinDelete}
                  disabled={loading}
                  className="h-12 rounded-xl bg-slate-800/60 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-slate-400 hover:text-amber-300 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {loading && (
                <p className="mt-4 text-center text-xs text-purple-300 font-bold animate-pulse">
                  🛡️ กำลังตรวจสอบสิทธิ์ Admin...
                </p>
              )}
            </div>
          )}
        </div>
        {/* ━━━ END ADMIN QUICK ACCESS ━━━ */}

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

        {/* Login / Register Form */}
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

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
              onClick={() => { playClickSound(); closeAuthModal(); }}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
            >
              Cancel (ยกเลิก)
            </button>
          </div>
        </form>
      </div>

      {/* PIN shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
