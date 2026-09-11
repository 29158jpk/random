"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "Admin";
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Horizon Auto PC Admin</span>
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
            <ShieldCheck className="w-3 h-3" />
            <span>Active Guard</span>
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick "View Website" Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all hover:scale-102"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Website</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>

        {/* Admin Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-sky-500/20">
              {avatarLetter}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white max-w-[120px] truncate">
                {username}
              </div>
              <div className="text-[10px] text-sky-400 font-medium">Super Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Admin User Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel border border-white/15 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-white/10 mb-1">
                <div className="text-xs font-bold text-white truncate">{username}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>Profile</span>
              </Link>

              <Link
                href="/"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Website</span>
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
