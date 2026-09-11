"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  ShieldCheck,
  Database,
  History,
  RefreshCw,
  Lock,
  Clock,
  Terminal,
} from "lucide-react";
import { AdminLog } from "@/types/admin";

export default function AdminSettingsPage() {
  const { session, user, isConfigured } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [session]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-sky-400" />
            <span>Admin Settings & Security Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            บันทึกการดำเนินการของผู้ดูแลระบบ (Audit Trail) และตรวจสอบสถานะความปลอดภัย
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Database Backend</span>
          </div>
          <div className="mt-2 text-base font-bold text-white flex items-center gap-2">
            <span>{isConfigured ? "Supabase Cloud DB" : "Local Cryptographic Engine"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            RLS Security Enabled
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Authorization</span>
          </div>
          <div className="mt-2 text-base font-bold text-emerald-400">
            Strict Token + Role Policy
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Current User: {user?.email}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Audit Trail Logging</span>
          </div>
          <div className="mt-2 text-base font-bold text-white font-mono">
            {logs.length} Recorded Actions
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Immutable admin action tracking
          </div>
        </div>
      </div>

      {/* Admin Action Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Admin Action Logs (admin_logs)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Past 50 admin events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Admin</th>
                <th className="py-3 px-4">Action Summary</th>
                <th className="py-3 px-3">Resource</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
                    Loading action logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 text-xs font-sans">
                    ยังไม่มีประวัติการบันทึกของ Admin ในระบบ
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-200 text-xs font-bold">
                      {log.admin_email || log.admin_id}
                    </td>
                    <td className="py-3 px-4 text-white text-xs font-sans font-medium">
                      {log.action}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-sky-400">
                        {log.target_resource}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
