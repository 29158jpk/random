"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteMemberModal } from "@/components/admin/ConfirmationModal";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { MemberListItem, UserRole, UserStatus } from "@/types/admin";

export default function MembersManagementPage() {
  const { session } = useAuth();
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Search, filter, and sort state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Modals state
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        role: roleFilter,
        status: statusFilter,
        sort: sortOption,
      });

      const res = await fetch(`/api/admin/members?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [session, page, roleFilter, statusFilter, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  // Toggle user status (suspend / unsuspend)
  const toggleSuspend = async (member: MemberListItem) => {
    if (!session?.access_token) return;
    const nextStatus: UserStatus = member.status === "active" ? "suspended" : "active";

    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
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
            ? `ระงับการใช้งาน ${member.username} เรียบร้อยแล้ว`
            : `ยกเลิกการระงับ ${member.username} เรียบร้อยแล้ว`
        );
        setTimeout(() => setActionMessage(null), 4000);
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Toggle user role (user / admin)
  const toggleRole = async (member: MemberListItem) => {
    if (!session?.access_token) return;
    const nextRole: UserRole = member.role === "admin" ? "user" : "admin";

    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (res.ok) {
        setActionMessage(`เปลี่ยนบทบาท ${member.username} เป็น ${nextRole.toUpperCase()} แล้ว`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // Confirm delete member
  const handleConfirmDelete = async () => {
    if (!selectedMember || !session?.access_token) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
        setActionMessage(`ลบสมาชิกเรียบร้อยแล้ว`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchMembers();
      }
    } catch (err) {
      console.error("Failed to delete member:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-400" />
            <span>Member Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ค้นหา ตรวจสอบสถิติ จัดการสิทธิ์ และดูแลสมาชิก Horizon Auto PC ({total} สมาชิกทั้งหมด)
          </p>
        </div>

        <button
          onClick={fetchMembers}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-xs sm:text-sm font-bold animate-in fade-in flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วย Username หรือ Email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Roles: All</option>
              <option value="user">Role: User</option>
              <option value="admin">Role: Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="most_random">Sort: Most Random</option>
              <option value="most_saved">Sort: Most Saved</option>
              <option value="highest_luck">Sort: Highest Luck</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Members Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-center">Randoms</th>
                <th className="py-3.5 px-3 text-center">Saved</th>
                <th className="py-3.5 px-3 text-center">Luck</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 px-3">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
                    Loading members directory...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 opacity-40 mx-auto mb-2 text-slate-500" />
                    ไม่พบข้อมูลสมาชิกตามเงื่อนไขที่กำหนด
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const avatarLetter = (m.username || m.email || "M").charAt(0).toUpperCase();
                  const isAdmin = m.role === "admin";
                  const isSuspended = m.status === "suspended";

                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Avatar & User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {avatarLetter}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate max-w-[150px]">
                              {m.username}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => toggleRole(m)}
                          title="คลิกเพื่อเปลี่ยนบทบาท"
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-transform hover:scale-105 ${
                            isAdmin
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "bg-slate-800 text-slate-300 border border-white/10"
                          }`}
                        >
                          {m.role}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isSuspended
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuspended ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
                            }`}
                          />
                          {m.status}
                        </span>
                      </td>

                      {/* Random Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-200">
                        {m.totalRandoms}
                      </td>

                      {/* Saved Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-sky-400">
                        {m.savedBuildsCount}
                      </td>

                      {/* Highest Luck */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                        {m.highestLuck}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {new Date(m.last_active || m.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="ดูรายละเอียด (View)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Suspend / Unsuspend */}
                          <button
                            onClick={() => toggleSuspend(m)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                            }`}
                            title={isSuspended ? "ยกเลิกระงับ (Unsuspend)" : "ระงับการใช้งาน (Suspend)"}
                          >
                            {isSuspended ? (
                              <UserCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Member */}
                          <button
                            onClick={() => {
                              setSelectedMember(m);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                            title="ลบสมาชิก (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3.5 px-4 bg-slate-900/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{members.length}</span> of{" "}
            <span className="font-bold text-white">{total}</span> members (Page {page} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono font-bold text-slate-300">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Member Confirmation Modal */}
      {selectedMember && (
        <DeleteMemberModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedMember(null);
          }}
          onConfirm={handleConfirmDelete}
          username={selectedMember.username}
          email={selectedMember.email}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
