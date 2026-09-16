"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dices,
  Volume2,
  VolumeX,
  Palette,
  Bookmark,
  History,
  Trophy,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ChevronDown,
  ShieldCheck,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { getSoundMuted, setSoundMuted, playClickSound } from "@/lib/soundEffects";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onOpenCollection: () => void;
  onOpenHistory: () => void;
  onOpenDailyChallenge: () => void;
  savedCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCollection,
  onOpenHistory,
  onOpenDailyChallenge,
  savedCount,
  historyCount,
}) => {
  const { user, isAuthenticated, isAdmin, signOut, openAuthModal } = useAuth();
  const [muted, setMuted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMuted(getSoundMuted());
    const savedTheme = localStorage.getItem("horizon_theme") || "dark";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      playClickSound();
    }
  };

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("horizon_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    setThemeDropdownOpen(false);
    playClickSound();
  };

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Member";

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-3 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => playClickSound()}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all border border-cyan-400/30">
              <Dices className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black italic text-base sm:text-xl tracking-tight">
                  <span className="text-white">HORIZON</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent text-glow-cyan">
                    AUTO PC
                  </span>
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTO PC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden lg:block">
                Spin Your PC. Find Your Build.
              </p>
            </div>
          </Link>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {/* หน้าหลัก */}
          <Link
            href="/"
            onClick={() => playClickSound()}
            className="px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
          >
            หน้าหลัก
          </Link>

          {/* สุ่มสเปกคอม */}
          <button
            onClick={() => {
              playClickSound();
              const target = document.getElementById("random-engine");
              if (target) target.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all"
          >
            สุ่มสเปกคอม
          </button>

          {/* Daily Challenge */}
          <button
            onClick={() => {
              playClickSound();
              onOpenDailyChallenge();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/30"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>ภารกิจรายวัน</span>
          </button>

          {/* Collection */}
          <button
            onClick={() => {
              playClickSound();
              onOpenCollection();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 hover:text-sky-200 text-xs font-bold transition-all border border-sky-500/30"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>คลังสเปก</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black">
                {savedCount}
              </span>
            )}
          </button>

          {/* History */}
          <button
            onClick={() => {
              playClickSound();
              onOpenHistory();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 hover:text-purple-200 text-xs font-bold transition-all border border-purple-500/30"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>ประวัติสุ่ม</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black">
                {historyCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard Button for Admins */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => playClickSound()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-black transition-all border border-purple-500/40 shadow-sm shadow-purple-500/20"
            >
              <Settings className="w-3.5 h-3.5 text-purple-300" />
              <span>จัดการระบบ</span>
            </Link>
          )}
        </nav>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              muted
                ? "bg-slate-800/50 border-white/10 text-slate-400"
                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            }`}
            title={muted ? "เปิดเสียง Sound Effects" : "ปิดเสียง Mute"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                playClickSound();
                setThemeDropdownOpen(!themeDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 transition-all"
              title="เลือกธีม (Theme)"
            >
              <Palette className="w-4 h-4" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl glass-panel border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Gaming Themes
                </div>
                {[
                  { id: "dark", label: "Fiery Red (Default)", color: "bg-red-600" },
                  { id: "blue", label: "Cyber Neon", color: "bg-sky-600" },
                  { id: "purple", label: "Synthwave Purple", color: "bg-purple-600" },
                  { id: "green", label: "Matrix / Razer", color: "bg-emerald-600" },
                  { id: "light", label: "Clean Light", color: "bg-slate-100" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      currentTheme === t.id
                        ? "bg-red-500/20 text-red-300 font-semibold"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full border border-white/30 ${t.color}`} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Section (Pill style matching reference screenshot) */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playClickSound();
                  openAuthModal("login");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-sky-400/50 hover:border-sky-300 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-md shadow-sky-500/10"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <User className="w-2.5 h-2.5" />
                </div>
                <span>เข้าสู่ระบบ</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  openAuthModal("register");
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-2.5 h-2.5" />
                </div>
                <span>สมัครสมาชิก</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setUserDropdownOpen(!userDropdownOpen);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl glass-panel border border-sky-500/40 hover:border-sky-400 text-slate-200 text-xs sm:text-sm font-bold transition-all shadow-md shadow-sky-500/10"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-black uppercase shrink-0">
                  {username.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-sky-500/30 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Horizon Verified Member</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-0.5">
                      {user?.email}
                    </div>
                  </div>

                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() => {
                      playClickSound();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>My Profile</span>
                  </Link>

                  {/* Collection */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setUserDropdownOpen(false);
                      onOpenCollection();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-sky-400" />
                      <span>My Collection</span>
                    </div>
                    {savedCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-300 font-bold text-[10px]">
                        {savedCount}
                      </span>
                    )}
                  </button>

                  {/* History */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setUserDropdownOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-400" />
                      <span>Build History</span>
                    </div>
                    {historyCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 font-bold text-[10px]">
                        {historyCount}
                      </span>
                    )}
                  </button>

                  {/* Admin Dashboard */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        playClickSound();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all my-1 border border-purple-500/30"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">Admin Dashboard</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/30 text-purple-200">
                        ADMIN
                      </span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-white/10" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout (ออกจากระบบ)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger (for Daily Challenge, Collection, History) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDailyChallenge();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 text-amber-300 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Daily Challenge</span>
            </div>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCollection();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 text-sky-300 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>My Collection</span>
            </div>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-300 text-[10px]">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenHistory();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 text-purple-300 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Build History</span>
            </div>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-500/30"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-300" />
                <span>Admin Dashboard</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/30">
                ADMIN
              </span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
