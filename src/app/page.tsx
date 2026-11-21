"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Navbar } from "@/components/Navbar";
import { ShareModal } from "@/components/ShareModal";
import { UploadModal } from "@/components/UploadModal";
import {
  Plus,
  Upload,
  FileText,
  Share2,
  Trash2,
  Clock,
  Shield,
  UserCheck,
  Eye,
  Edit3,
} from "lucide-react";

interface DocumentShareItem {
  id: string;
  userId: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface DocumentItem {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  shares?: DocumentShareItem[];
  permission?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, isLoading: isUserLoading } = useUser();

  const [activeTab, setActiveTab] = useState<"owned" | "shared">("owned");
  const [ownedDocs, setOwnedDocs] = useState<DocumentItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingDocs(true);
    try {
      const res = await fetch(`/api/documents?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser, fetchDocuments]);

  const handleCreateDocument = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p></p>",
          ownerId: currentUser.id,
        }),
      });
      if (res.ok) {
        const doc = await res.json();
        router.push(`/document/${doc.id}`);
      }
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${docId}?userId=${currentUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOwnedDocs((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const currentDocs = activeTab === "owned" ? ownedDocs : sharedDocs;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero / Action Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Google Docs Inspired Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {currentUser ? `Welcome, ${currentUser.name}` : "Document Workspace"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">
              Create, edit, and collaborate on rich-text documents with instant cloud persistence and file import.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 transition shadow-2xs"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Import File</span>
            </button>

            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("owned")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "owned"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>My Documents</span>
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
                {ownedDocs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("shared")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "shared"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Shared with Me</span>
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
                {sharedDocs.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            {activeTab === "owned"
              ? "Documents created and owned by your current account"
              : "Documents shared with your account by other team members"}
          </div>
        </div>

        {/* Document Grid */}
        {isLoadingDocs || isUserLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 bg-white rounded-xl border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : currentDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {activeTab === "owned" ? "No documents yet" : "No documents shared with you"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {activeTab === "owned"
                ? "Get started by creating a new document or importing a Markdown (.md) or text (.txt) file."
                : "When another user shares a document with your email, it will appear here."}
            </p>
            {activeTab === "owned" && (
              <button
                onClick={handleCreateDocument}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentDocs.map((doc) => {
              const isOwner = doc.ownerId === currentUser?.id;
              const formattedDate = new Date(doc.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between h-48"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex items-center gap-1">
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareDoc(doc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Share document"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}

                        {isOwner && (
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate text-sm">
                        {doc.title || "Untitled Document"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Modified {formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-[11px] font-medium">
                          {doc.shares && doc.shares.length > 0
                            ? `Shared with ${doc.shares.length} ${
                                doc.shares.length === 1 ? "person" : "people"
                              }`
                            : "Private to you"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-[11px]">
                          By <strong className="text-slate-800">{doc.owner?.name || "Team Member"}</strong>
                        </span>
                      </div>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOwner
                          ? "bg-slate-100 text-slate-700"
                          : doc.permission === "edit"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {isOwner ? (
                        "Owner"
                      ) : doc.permission === "edit" ? (
                        <span className="flex items-center gap-1">
                          <Edit3 className="w-2.5 h-2.5" /> Can Edit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" /> View Only
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {shareDoc && (
        <ShareModal
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
          isOpen={!!shareDoc}
          onClose={() => setShareDoc(null)}
          isOwner={shareDoc.ownerId === currentUser?.id}
          shares={shareDoc.shares || []}
          ownerName={currentUser?.name}
          ownerEmail={currentUser?.email}
          onSharesUpdated={() => {
            fetchDocuments();
            fetch(`/api/documents/${shareDoc.id}?userId=${currentUser?.id}`)
              .then((r) => r.json())
              .then((updated) => setShareDoc(updated));
          }}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportSuccess={(newDocId) => {
          fetchDocuments();
          router.push(`/document/${newDocId}`);
        }}
      />
    </div>
  );
}
