"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { X, UserPlus, Trash2, Shield, Eye, Edit3, Check } from "lucide-react";

interface Share {
  id: string;
  userId: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  shares: Share[];
  ownerName?: string;
  ownerEmail?: string;
  onSharesUpdated: () => void;
}

export function ShareModal({
  documentId,
  documentTitle,
  isOpen,
  onClose,
  isOwner,
  shares,
  ownerName,
  ownerEmail,
  onSharesUpdated,
}: ShareModalProps) {
  const { currentUser, users } = useUser();
  const [selectedEmail, setSelectedEmail] = useState("");
  const [permission, setPermission] = useState("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter available users to share with (exclude current user and already shared users)
  const sharedUserIds = new Set(shares.map((s) => s.userId));
  const availableUsers = users.filter(
    (u) => u.id !== currentUser?.id && !sharedUserIds.has(u.id)
  );

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: selectedEmail,
          permission,
          userId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to share document");
      }

      setSuccessMsg(`Access granted to ${selectedEmail}`);
      setSelectedEmail("");
      onSharesUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          userId: currentUser?.id,
        }),
      });

      if (res.ok) {
        onSharesUpdated();
      }
    } catch (err) {
      console.error("Failed to revoke access:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Share Document</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs">{documentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add User Form - Only Owner can share */}
          {isOwner ? (
            <form onSubmit={handleShare} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Grant Access to a Team Member
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select team member...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="edit">Can Edit</option>
                  <option value="view">Can View</option>
                </select>

                <button
                  type="submit"
                  disabled={!selectedEmail || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              Only the document owner can invite new collaborators or change permissions.
            </div>
          )}

          {/* People with access list */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              People with Access
            </h4>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {/* Owner */}
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {(ownerName || "O").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {ownerName || "Owner"}
                    </div>
                    <div className="text-[11px] text-slate-500">{ownerEmail}</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  Owner
                </span>
              </div>

              {/* Collaborators */}
              {shares.map((share) => (
                <div key={share.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {share.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {share.user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{share.user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                      {share.permission === "edit" ? (
                        <>
                          <Edit3 className="w-3 h-3 text-emerald-600" /> Can Edit
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-blue-600" /> Can View
                        </>
                      )}
                    </span>

                    {isOwner && (
                      <button
                        onClick={() => handleRevoke(share.userId)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
