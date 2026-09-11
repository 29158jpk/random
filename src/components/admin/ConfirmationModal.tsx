"use client";

import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  email: string;
  isDeleting?: boolean;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
  email,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black text-white">
            Are you sure you want to delete this member?
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            การดำเนินการนี้จะลบบัญชีและประวัติการสุ่มทั้งหมดของผู้ใช้อย่างถาวร และไม่สามารถกู้คืนได้
          </p>

          {/* Member Card Details */}
          <div className="my-5 p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Target Member
            </div>
            <div className="mt-1 text-sm font-bold text-white truncate">{username}</div>
            <div className="text-xs text-sky-400 font-mono truncate">{email}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-white/10"
            >
              Cancel (ยกเลิก)
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : "Delete Member"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
