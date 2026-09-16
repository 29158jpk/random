"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Search,
  RefreshCw,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ZoomIn,
} from "lucide-react";
import { HardwareItemDB } from "@/types/admin";
import { ComponentCategory } from "@/types/hardware";
import { getHardwareImageUrl } from "@/lib/hardwareImages";

const CATEGORIES: { id: ComponentCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
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
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HardwareItemDB | null>(null);
  const [formData, setFormData] = useState<Partial<HardwareItemDB>>({
    name: "",
    brand: "",
    model: "",
    category: "cpu",
    price: 3000,
    performanceTier: 5,
    power: 65,
    power_consumption: "65W",
    socket: "AM5",
    memoryType: "DDR5",
    vram: undefined,
    specs: "",
    description: "",
    compatibility: "Compatible with modern motherboards and standard PSUs",
    product_url: "",
    image_url: "",
    active: true,
    status: "active",
  });

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      } else {
        showNotification("Failed to load hardware list", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error connecting to hardware database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHardware();
  }, [session, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setImagePreview("");
    setFormData({
      name: "",
      brand: "",
      model: "",
      category: selectedCategory,
      price: 3500,
      performanceTier: 6,
      power: 65,
      power_consumption: "65W",
      socket: selectedCategory === "cpu" || selectedCategory === "motherboard" ? "AM5" : undefined,
      memoryType: selectedCategory === "ram" || selectedCategory === "motherboard" ? "DDR5" : undefined,
      specs: "",
      description: "",
      compatibility: "Standard desktop compatibility verified",
      product_url: "",
      image_url: "",
      status: "active",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HardwareItemDB) => {
    setEditingItem(item);
    setImagePreview(item.image_url || "");
    setFormData({
      ...item,
      model: item.model || "",
      description: item.description || "",
      power_consumption: item.power_consumption || `${item.power}W`,
      compatibility: item.compatibility || "",
      product_url: item.product_url || "",
      active: item.active !== false && item.status !== "disabled",
      status: item.status || "active",
    });
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification("File size exceeds 10MB limit", "error");
      return;
    }

    // Validate format
    const validFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      showNotification("Allowed formats: PNG, JPG, JPEG, WEBP", "error");
      return;
    }

    // Set immediate client preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    if (!session?.access_token) {
      showNotification("Admin session required to upload", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      if (formData.image_url) {
        uploadData.append("oldImageUrl", formData.image_url);
      }

      const res = await fetch("/api/admin/hardware/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: uploadData,
      });

      const resJson = await res.json();
      if (res.ok && resJson.url) {
        setFormData((prev) => ({ ...prev, image_url: resJson.url }));
        setImagePreview(resJson.url);
        showNotification("Image uploaded to Supabase Storage successfully!");
      } else {
        showNotification(resJson.error || "Image upload failed", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showNotification("Error uploading image to server", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleStatus = async (item: HardwareItemDB) => {
    if (!session?.access_token) return;
    const nextActive = !(item.active !== false && item.status !== "disabled");
    const nextStatus = nextActive ? "active" : "disabled";

    try {
      await fetch("/api/admin/hardware", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: item.id,
          updates: { status: nextStatus, active: nextActive },
        }),
      });
      showNotification(
        nextActive ? `Enabled ${item.name} for Random Engine` : `Disabled ${item.name}`
      );
      fetchHardware();
    } catch (err) {
      console.error(err);
      showNotification("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!session?.access_token || !confirm(`ยืนยันการลบอุปกรณ์ "${name}" ออกจากระบบ?`)) return;

    try {
      const res = await fetch(`/api/admin/hardware?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        showNotification(`Deleted ${name}`);
        fetchHardware();
      } else {
        showNotification("Failed to delete hardware", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error deleting item", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price || 0),
        performanceTier: Number(formData.performanceTier || 5),
        power: Number(formData.power || 65),
        power_consumption: formData.power_consumption || `${formData.power || 65}W`,
        active: formData.active !== false,
        status: formData.active ? "active" : "disabled",
      };

      let res;
      if (editingItem) {
        res = await fetch("/api/admin/hardware", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: editingItem.id,
            updates: payload,
          }),
        });
      } else {
        res = await fetch("/api/admin/hardware", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ item: payload }),
        });
      }

      if (res.ok) {
        showNotification(editingItem ? "Hardware updated successfully!" : "Hardware added to Database!");
        setIsModalOpen(false);
        fetchHardware();
      } else {
        const errData = await res.json();
        showNotification(errData.error || "Failed to save hardware", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error saving hardware", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = hardwareList.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.brand.toLowerCase().includes(q) ||
      (h.model && h.model.toLowerCase().includes(q)) ||
      (h.specs && h.specs.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-2xl glass-panel border shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/80 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-sky-400" />
            <span>Hardware Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            จัดการฐานข้อมูลฮาร์ดแวร์จริงและรูปภาพใน Supabase Storage ({hardwareList.length} รายการ)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHardware}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-400" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Hardware</span>
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
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Search & Filters */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`ค้นหาในหมวด ${selectedCategory.toUpperCase()} (ชื่อ, แบรนด์, รุ่น)...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>

      {/* Hardware Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-3">Name & Model</th>
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
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto mb-2" />
                    กำลังโหลดข้อมูลฮาร์ดแวร์...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500 text-xs">
                    ไม่พบอุปกรณ์ฮาร์ดแวร์ในหมวดหมู่นี้
                  </td>
                </tr>
              ) : (
                filteredItems.map((h) => {
                  const isActive = h.active !== false && h.status !== "disabled";
                  const displayImg = getHardwareImageUrl(h);
                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        !isActive ? "opacity-60 bg-slate-950/40" : ""
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setLightboxUrl(displayImg)}
                          title="คลิกเพื่อขยายดูรูปขนาดใหญ่"
                          className="w-16 h-14 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 flex items-center justify-center relative p-1 shadow-sm cursor-pointer hover:border-sky-500/50 hover:scale-105 transition-all group"
                        >
                          <img
                            src={displayImg}
                            alt={h.name}
                            className="max-w-full max-h-full object-contain drop-shadow-sm"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.currentTarget as HTMLImageElement).src = getHardwareImageUrl({
                                category: h.category,
                                name: h.name,
                              });
                            }}
                          />
                          <div className="absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn className="w-3.5 h-3.5 text-sky-300" />
                          </div>
                        </div>
                      </td>

                      {/* Name & Model */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white max-w-[220px] truncate">{h.name}</div>
                        {h.model && (
                          <div className="text-[10px] text-slate-400 font-mono">Model: {h.model}</div>
                        )}
                        {h.badge && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {h.badge}
                          </span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3 font-semibold text-slate-300">{h.brand}</td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-black text-sky-400">
                        ฿{h.price.toLocaleString()}
                      </td>

                      {/* Tier */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                        {h.performanceTier}/10
                      </td>

                      {/* Power */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {h.power}W
                      </td>

                      {/* Specs */}
                      <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate">
                        {h.specs || h.description || "-"}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(h)}
                          title="คลิกเพื่อสลับ Active/Inactive สำหรับการสุ่ม"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all hover:scale-105 ${
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
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(h.id, h.name)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-sky-500/30 p-5 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/10 pb-4 shrink-0">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                <span>{editingItem ? "Edit Hardware Item" : "Add New Hardware Component"}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ข้อมูลอุปกรณ์จะเชื่อมต่อกับ Random Engine และ Supabase Database ทันที
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* IMAGE UPLOAD SECTION */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Hardware Image (รูปภาพอุปกรณ์)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Image Preview Box (Enlarged full image container with Zoom button) */}
                  <div className="w-full sm:w-80 h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950/90 border-2 border-dashed border-sky-500/50 p-3 flex items-center justify-center relative shrink-0 shadow-inner group">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setLightboxUrl(imagePreview)}
                          title="คลิกเพื่อดูรูปภาพแบบเต็มจอ"
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(imagePreview)}
                          className="absolute top-3 right-3 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-sky-500 text-slate-200 hover:text-slate-950 border border-sky-500/30 backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 text-[11px] font-bold"
                          title="ขยายรูปภาพขนาดใหญ่"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>ขยายรูปเต็ม</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-3 text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-sky-400" />
                        <span className="text-xs font-bold block text-slate-400">ยังไม่ได้เลือกรูปภาพ</span>
                        <span className="text-[10px] text-slate-500">คลิกปุ่มด้านขวาเพื่ออัปโหลด</span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-sky-400 gap-1.5 text-xs font-bold backdrop-blur-xs">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>กำลังอัปโหลดรูปภาพ...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions & URL input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-2 transition-all hover:scale-102"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.image_url ? "Change Image (เปลี่ยนรูป)" : "Upload Image (อัปโหลดรูป)"}</span>
                      </button>

                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image_url: "" }));
                            setImagePreview("");
                          }}
                          className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      รองรับ PNG, JPG, JPEG, WEBP ขนาดไม่เกิน 10MB (บันทึกใน Supabase Storage Bucket &apos;hardware-images&apos;)
                    </p>
                    <input
                      type="text"
                      value={formData.image_url || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="หรือใส่ Image URL ตรงนี้..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Name *</label>
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
                  <label className="text-xs font-bold text-slate-300">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand || ""}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="เช่น Intel, AMD, NVIDIA, ASUS"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Model & Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Model</label>
                  <input
                    type="text"
                    value={formData.model || ""}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="เช่น RTX 4060, B650M"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Category *</label>
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
                  <label className="text-xs font-bold text-slate-300">Price (฿) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 font-mono font-bold text-sky-400"
                  />
                </div>
              </div>

              {/* Performance Tier & Power & VRAM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Performance (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.performanceTier || 5}
                    onChange={(e) =>
                      setFormData({ ...formData, performanceTier: Number(e.target.value) })
                    }
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Power Consumption</label>
                  <input
                    type="text"
                    value={formData.power_consumption || (formData.power ? `${formData.power}W` : "")}
                    onChange={(e) => {
                      const str = e.target.value;
                      const num = parseInt(str.replace(/\D/g, ""), 10) || 65;
                      setFormData({ ...formData, power_consumption: str, power: num });
                    }}
                    placeholder="เช่น 115W หรือ 65W"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">VRAM / Memory Type</label>
                  <input
                    type="text"
                    value={formData.vram ? `${formData.vram}GB` : formData.memoryType || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val, 10);
                      setFormData({
                        ...formData,
                        vram: !isNaN(num) ? num : undefined,
                        memoryType: (val.includes("DDR4") ? "DDR4" : val.includes("DDR5") ? "DDR5" : val) as any,
                      });
                    }}
                    placeholder="เช่น 8GB GDDR6 หรือ DDR5"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Socket & Product URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Socket (CPU / Motherboard)</label>
                  <input
                    type="text"
                    value={formData.socket || ""}
                    onChange={(e) => setFormData({ ...formData, socket: e.target.value as any })}
                    placeholder="AM4, AM5, LGA1700, LGA1851"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Product URL (Link ร้านค้า)</label>
                  <input
                    type="url"
                    value={formData.product_url || ""}
                    onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Specs & Description */}
              <div>
                <label className="text-xs font-bold text-slate-300">Key Specifications</label>
                <input
                  type="text"
                  required
                  value={formData.specs || ""}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="เช่น 6 Cores / 12 Threads, Up to 4.4 GHz, 35MB Cache"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Description (รายละเอียดสินค้า)</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดฮาร์ดแวร์ ข้อดี จุดเด่น หรือข้อมูลที่ผู้ใช้จะเห็นใน Hardware Detail Popup..."
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Compatibility Checklist info */}
              <div>
                <label className="text-xs font-bold text-slate-300">Compatibility Note (ความเข้ากันได้)</label>
                <input
                  type="text"
                  value={formData.compatibility || ""}
                  onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                  placeholder="เช่น รองรับ Motherboard AM4 / PSU 550W ขึ้นไป"
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Active / Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-300">Status in Random Engine</label>
                  <select
                    value={formData.active ? "active" : "disabled"}
                    onChange={(e) => {
                      const act = e.target.value === "active";
                      setFormData({
                        ...formData,
                        active: act,
                        status: act ? "active" : "disabled",
                      });
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">Active (อนุญาตให้ Random Engine สุ่มได้)</option>
                    <option value="disabled">Inactive (ปิดการใช้งาน ไม่ถูกสุ่ม)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Badge (optional)</label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="เช่น Best Value, New, Overclocked"
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : editingItem ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>+ Add to Database</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Fullscreen Image Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="ปิดหน้านี้"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-3 bg-slate-950 rounded-3xl border border-sky-500/40 shadow-2xl overflow-hidden flex items-center justify-center">
              <img
                src={lightboxUrl}
                alt="Enlarged preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className="mt-3 text-xs text-sky-300 font-semibold bg-slate-900/90 px-3 py-1 rounded-full border border-white/10">
              คลิกบริเวณรอบนอกเพื่อปิด
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
