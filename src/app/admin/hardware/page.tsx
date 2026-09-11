"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Cpu,
  Tv,
  HardDrive,
  Zap,
  Box,
  Fan,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Filter,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { HardwareItemDB } from "@/types/admin";
import { ComponentCategory } from "@/types/hardware";

const CATEGORIES: { id: ComponentCategory; label: string; icon: any }[] = [
  { id: "cpu", label: "CPU", icon: Cpu },
  { id: "gpu", label: "GPU", icon: Tv },
  { id: "motherboard", label: "Motherboard", icon: Layers },
  { id: "ram", label: "RAM", icon: Layers },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "psu", label: "PSU", icon: Zap },
  { id: "cooler", label: "Cooler", icon: Fan },
  { id: "case", label: "Case", icon: Box },
];

export default function AdminHardwarePage() {
  const { session } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>("cpu");
  const [hardwareList, setHardwareList] = useState<HardwareItemDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HardwareItemDB | null>(null);
  const [formData, setFormData] = useState<Partial<HardwareItemDB>>({
    name: "",
    brand: "",
    category: "cpu",
    price: 3000,
    performanceTier: 5,
    power: 65,
    specs: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchHardware = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hardware?category=${selectedCategory}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHardwareList(data.hardware || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHardware();
  }, [session, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      brand: "",
      category: selectedCategory,
      price: 3500,
      performanceTier: 6,
      power: 65,
      socket: selectedCategory === "cpu" || selectedCategory === "motherboard" ? "AM5" : undefined,
      memoryType: selectedCategory === "ram" || selectedCategory === "motherboard" ? "DDR5" : undefined,
      specs: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HardwareItemDB) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item: HardwareItemDB) => {
    if (!session?.access_token) return;
    const nextStatus = item.status === "active" ? "disabled" : "active";

    try {
      await fetch("/api/admin/hardware", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: item.id,
          updates: { status: nextStatus },
        }),
      });
      fetchHardware();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.access_token || !confirm("ยืนยันการลบอุปกรณ์ฮาร์ดแวร์นี้?")) return;

    try {
      await fetch(`/api/admin/hardware?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      fetchHardware();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSubmitting(true);

    try {
      if (editingItem) {
        await fetch("/api/admin/hardware", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: editingItem.id,
            updates: formData,
          }),
        });
      } else {
        await fetch("/api/admin/hardware", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ item: formData }),
        });
      }
      setIsModalOpen(false);
      fetchHardware();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = hardwareList.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-sky-400" />
            <span>Hardware Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            จัดการฐานข้อมูลอุปกรณ์ฮาร์ดแวร์ที่ระบบ Random PC ดึงไปใช้ในการสุ่ม ({hardwareList.length} อุปกรณ์)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHardware}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hardware</span>
          </button>
        </div>
      </div>

      {/* 8 Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 scale-102"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`ค้นหาในหมวด ${selectedCategory.toUpperCase()}...`}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Hardware Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Hardware Component</th>
                <th className="py-3.5 px-3">Brand</th>
                <th className="py-3.5 px-3 text-right">Price</th>
                <th className="py-3.5 px-3 text-center">Tier</th>
                <th className="py-3.5 px-3 text-center">Power</th>
                <th className="py-3.5 px-3">Key Specs</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
                    Loading components...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 text-xs">
                    ไม่พบอุปกรณ์ฮาร์ดแวร์ในหมวดหมู่นี้
                  </td>
                </tr>
              ) : (
                filteredItems.map((h) => {
                  const isActive = h.status === "active";
                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !isActive ? "opacity-60 bg-slate-950/40" : ""
                      }`}
                    >
                      {/* Name & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white max-w-[240px] truncate">{h.name}</div>
                        {h.badge && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {h.badge}
                          </span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-3 font-semibold text-slate-300">{h.brand}</td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-black text-sky-400">
                        ฿{h.price.toLocaleString()}
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">
                        {h.performanceTier}/10
                      </td>

                      {/* Power */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                        {h.power}W
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-3 text-slate-400 max-w-[200px] truncate">
                        {h.specs}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(h)}
                          title="คลิกเพื่อเปิด/ปิดการใช้งานใน Random Engine"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all hover:scale-105 ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                            }`}
                          />
                          {h.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                            title="Delete"
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
      </div>

      {/* Add / Edit Hardware Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-sky-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              <span>{editingItem ? "Edit Hardware Item" : "Add New Hardware"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น Intel Core i5-14400F"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand || ""}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="เช่น Intel / AMD / NVIDIA"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ComponentCategory })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Price (฿)</label>
                  <input
                    type="number"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Tier (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.performanceTier || 5}
                    onChange={(e) =>
                      setFormData({ ...formData, performanceTier: Number(e.target.value) })
                    }
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Power (Watts)</label>
                  <input
                    type="number"
                    value={formData.power || 65}
                    onChange={(e) => setFormData({ ...formData, power: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Socket (optional)</label>
                  <input
                    type="text"
                    value={formData.socket || ""}
                    onChange={(e) => setFormData({ ...formData, socket: e.target.value as any })}
                    placeholder="AM4, AM5, LGA1700"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">VRAM / RAM Type</label>
                  <input
                    type="text"
                    value={formData.memoryType || ""}
                    onChange={(e) => setFormData({ ...formData, memoryType: e.target.value as any })}
                    placeholder="DDR4, DDR5, 8GB"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Specifications</label>
                <input
                  type="text"
                  required
                  value={formData.specs || ""}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="เช่น 10 Cores, 4.7 GHz, 20MB Cache"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Badge (optional)</label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="เช่น Best Value"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "active" | "disabled" })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">Active (Available for Random)</option>
                    <option value="disabled">Disabled (Excluded from Random)</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/25"
                >
                  {submitting ? "Saving..." : editingItem ? "Save Component" : "Add to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
