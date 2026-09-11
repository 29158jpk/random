"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  RefreshCw,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { DailyChallengeDB } from "@/types/admin";
import { UsageType } from "@/types/hardware";

export default function AdminChallengesPage() {
  const { session } = useAuth();
  const [challenges, setChallenges] = useState<DailyChallengeDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<DailyChallengeDB | null>(null);
  const [formData, setFormData] = useState<Partial<DailyChallengeDB>>({
    title: "",
    description: "",
    budget: 25000,
    usage: "gaming",
    target_score: 65,
    reward_title: "Challenge Conqueror",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenges = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/challenges", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [session]);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormData({
      title: "",
      description: "",
      budget: 25000,
      usage: "gaming",
      target_score: 65,
      reward_title: "Challenge Conqueror",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: DailyChallengeDB) => {
    setEditingChallenge(c);
    setFormData(c);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (c: DailyChallengeDB) => {
    if (!session?.access_token) return;
    const nextStatus = c.status === "active" ? "disabled" : "active";

    try {
      await fetch("/api/admin/challenges", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: c.id,
          updates: { status: nextStatus },
        }),
      });
      fetchChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.access_token || !confirm("ยืนยันการลบ Daily Challenge นี้?")) return;

    try {
      await fetch(`/api/admin/challenges?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      fetchChallenges();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSubmitting(true);

    try {
      if (editingChallenge) {
        await fetch("/api/admin/challenges", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: editingChallenge.id,
            updates: formData,
          }),
        });
      } else {
        await fetch("/api/admin/challenges", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ challenge: formData }),
        });
      }
      setIsModalOpen(false);
      fetchChallenges();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Daily Challenge Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            สร้างและจัดการภารกิจประจำวันให้สมาชิกประลองสเปกคอม ({challenges.length} Challenges)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchChallenges}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Challenge</span>
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
          Loading challenges...
        </div>
      ) : challenges.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs glass-panel rounded-2xl border border-white/10">
          <Trophy className="w-10 h-10 opacity-30 mx-auto mb-2 text-amber-400" />
          ยังไม่มี Daily Challenge ในระบบ กดปุ่ม "Create Challenge" ด้านบนเพื่อเริ่มสร้าง
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c) => {
            const isActive = c.status === "active";
            return (
              <div
                key={c.id}
                className={`glass-panel rounded-2xl p-5 border transition-all space-y-3 relative overflow-hidden ${
                  isActive ? "border-amber-500/30" : "border-white/10 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {c.status}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-1 line-clamp-1">{c.title}</h3>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      ฿{c.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target Score: <strong className="text-white">{c.target_score}+</strong></span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    <strong>{c.participants_count || 0}</strong> participants
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`text-xs font-bold transition-colors ${
                      isActive ? "text-amber-400 hover:text-amber-300" : "text-emerald-400 hover:text-emerald-300"
                    }`}
                  >
                    {isActive ? "Disable" : "Enable"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-amber-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{editingChallenge ? "Edit Daily Challenge" : "Create New Challenge"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-300">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น Best Gaming PC Under ฿25,000"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดเงื่อนไขภารกิจ..."
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Budget Limit (฿)</label>
                  <input
                    type="number"
                    required
                    value={formData.budget || 25000}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Target Score</label>
                  <input
                    type="number"
                    required
                    value={formData.target_score || 65}
                    onChange={(e) =>
                      setFormData({ ...formData, target_score: Number(e.target.value) })
                    }
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Reward Title</label>
                <input
                  type="text"
                  value={formData.reward_title || ""}
                  onChange={(e) => setFormData({ ...formData, reward_title: e.target.value })}
                  placeholder="เช่น Budget Gaming Conqueror"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25"
                >
                  {submitting ? "Saving..." : editingChallenge ? "Save Changes" : "Create Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
