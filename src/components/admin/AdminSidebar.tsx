"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dices,
  Bookmark,
  History,
  Trophy,
  Cpu,
  BarChart3,
  Settings,
  LogOut,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Random Activity", href: "/admin/randoms", icon: Dices },
    { label: "Collections", href: "/admin/collections", icon: Bookmark },
    { label: "History", href: "/admin/history", icon: History },
    { label: "Daily Challenges", href: "/admin/challenges", icon: Trophy },
    { label: "Hardware", href: "/admin/hardware", icon: Cpu },
    { label: "Statistics", href: "/admin/statistics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Dices className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Horizon Admin
                </span>
                <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Control Center</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black tracking-wider uppercase text-slate-400">
            Management Suite
          </div>

          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 shadow-md shadow-sky-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Quick View Website & Logout */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-slate-300 text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>View Website</span>
            </span>
            <span className="text-[10px] text-slate-500">Live</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
