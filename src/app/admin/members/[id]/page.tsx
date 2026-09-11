"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteMemberModal } from "@/components/admin/ConfirmationModal";
import {
  ArrowLeft,
  User,
  Shield,
  Calendar,
  Clock,
  Dices,
  Bookmark,
  History,
  Clover,
  Trophy,
  Sparkles,
  Diamond,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
  Cpu,
  Layers,
} from "lucide-react";
import { MemberDetail, UserStatus, UserRole } from "@/types/admin";
import { PCBuild } from "@/types/hardware";

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session } = useAuth();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"randoms" | "saved">("randoms");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchMemberDetail = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
      }
    } catch (err) {
      console.error("Failed to load member detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, [id, session]);

  // Toggle Suspend / Unsuspend
  const handleToggleSuspend = async () => {
    if (!member || !session?.access_token) return;
    const nextStatus: UserStatus = member.status === "active" ? "suspended" : "active";

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setActionMessage(
          nextStatus === "suspended"
            ? `ระงับบัญชีผู้ใช้แล้ว`
            : `ยกเลิกการระงับบัญชีแล้ว`
        );
        setTimeout(() => setActionMessage(null), 4000);
        fetchMemberDetail();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Toggle Role
  const handleToggleRole = async () => {
    if (!member || !session?.access_token) return;
    const nextRole: UserRole = member.role === "admin" ? "user" : "admin";

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (res.ok) {
        setActionMessage(`เปลี่ยนสิทธิ์เป็น ${nextRole.toUpperCase()} แล้ว`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchMemberDetail();
      }
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-3" />
        <div>Loading Member Details...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-16 text-center text-slate-400">
        <UserX className="w-12 h-12 mx-auto mb-3 text-slate-500" />
        <h2 className="text-xl font-bold text-white">Member Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">ไม่พบข้อมูลสมาชิกในระบบ</p>
        <Link
          href="/admin/members"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าสมาชิก</span>
        </Link>
      </div>
    );
  }

  const avatarLetter = (member.username || member.email || "M").charAt(0).toUpperCase();
  const isAdmin = member.role === "admin";
  const isSuspended = member.status === "suspended";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button & Action message */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>

        {actionMessage && (
          <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Profile Card Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-sky-500/25 shrink-0">
              {avatarLetter}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {member.username}
                </h1>
                {/* Role Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    isAdmin
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-slate-800 text-slate-300 border border-white/10"
                  }`}
                >
                  {member.role}
                </span>
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase ${
                    isSuspended
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSuspended ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  {member.status}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-sky-400 font-mono mt-1">
                {member.email}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined: {new Date(member.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Last Active: {new Date(member.last_active || member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleRole}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/10"
            >
              Change Role ({isAdmin ? "To User" : "To Admin"})
            </button>

            <button
              onClick={handleToggleSuspend}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSuspended
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40"
              }`}
            >
              {isSuspended ? "Unsuspend Account" : "Suspend Account"}
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Member Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Dices className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Randoms</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.totalRandomBuilds}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Bookmark className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Saved Builds</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.savedBuilds}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <History className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">History Count</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.historyCount}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Clover className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Highest Luck</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.highestLuck}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Highest Score</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.highestScore}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Legendary Builds</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.legendaryBuilds}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
          <Diamond className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
          <div className="text-[10px] font-bold text-slate-400 uppercase">Mythic Builds</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {member.stats.mythicBuilds}
          </div>
        </div>
      </div>

      {/* Builds Tabs: Recent Random Builds / Recent Saved Builds */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-white/10 bg-slate-900/60 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab("randoms")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "randoms"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Recent Random Builds ({member.recentRandomBuilds.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "saved"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Saved Builds ({member.recentSavedBuilds.length})
          </button>
        </div>

        {/* Tab Content List */}
        <div className="p-6">
          {activeTab === "randoms" ? (
            member.recentRandomBuilds.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                ยังไม่มีประวัติการสุ่มสเปกคอมสำหรับสมาชิกท่านนี้
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.recentRandomBuilds.map((b) => (
                  <BuildCardItem key={b.id} build={b} />
                ))}
              </div>
            )
          ) : member.recentSavedBuilds.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              ยังไม่มีสเปกคอมที่บันทึกไว้ใน Collection
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.recentSavedBuilds.map((b) => (
                <BuildCardItem key={b.id} build={b} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await fetch(`/api/admin/members/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            window.location.href = "/admin/members";
          } catch (err) {
            console.error(err);
            setIsDeleting(false);
          }
        }}
        username={member.username}
        email={member.email}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function BuildCardItem({ build }: { build: PCBuild }) {
  const rarityColors: Record<string, string> = {
    Common: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    Rare: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    Epic: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    Legendary: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Mythic: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-sky-500/30 transition-all space-y-2.5">
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
              rarityColors[build.rarity] || rarityColors.Common
            }`}
          >
            {build.rarity}
          </span>
          <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{build.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-sky-400 font-mono">
            ฿{build.totalPrice.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            {new Date(build.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-white/5 font-mono">
        <div className="truncate">CPU: {build.cpu?.name}</div>
        <div className="truncate">GPU: {build.gpu?.name}</div>
        <div className="truncate">RAM: {build.ram?.name}</div>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
        <span>Luck: <strong className="text-emerald-400">{build.luckScore}/100</strong></span>
        <span>Score: <strong className="text-white">{build.scores?.overall || 0}/100</strong></span>
      </div>
    </div>
  );
}
