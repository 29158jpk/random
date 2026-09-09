"use client";

import React, { useState, useEffect } from "react";
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
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const [muted, setMuted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2.5 group"
            onClick={() => playClickSound()}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Dices className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
                  Horizon Auto PC
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  AUTO PC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Spin Your PC. Find Your Build.
              </p>
            </div>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-all ${
              muted
                ? "bg-slate-800/50 border-white/10 text-slate-400"
                : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20"
            }`}
            title={muted ? "เปิดเสียง Sound Effects" : "ปิดเสียง Mute"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                playClickSound();
                setThemeDropdownOpen(!themeDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 transition-all"
              title="เลือกธีม (Theme)"
            >
              <Palette className="w-4 h-4" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl glass-panel border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Gaming Themes
                </div>
                {[
                  { id: "dark", label: "Dark Void (Default)", color: "bg-slate-900" },
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
                        ? "bg-sky-500/20 text-sky-300 font-semibold"
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

          {/* If NOT Authenticated: Show [Login] and [Register] */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  openAuthModal("login");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-white/10 text-xs sm:text-sm font-bold transition-all hover:scale-102"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Login</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  openAuthModal("register");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md shadow-sky-500/20 hover:scale-102"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          ) : (
            /* If Authenticated: Show Member Avatar & Menu */
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setUserDropdownOpen(!userDropdownOpen);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-sky-500/40 hover:border-sky-400 text-slate-200 text-xs sm:text-sm font-bold transition-all shadow-md shadow-sky-500/10"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-black uppercase">
                  {username.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {username}
                </span>
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

                  {/* Daily Challenge */}
                  <button
                    onClick={() => {
                      playClickSound();
                      setUserDropdownOpen(false);
                      onOpenDailyChallenge();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-amber-300 hover:bg-white/5 transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Daily Challenge</span>
                  </button>

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
        </div>
      </div>
    </header>
  );
};
