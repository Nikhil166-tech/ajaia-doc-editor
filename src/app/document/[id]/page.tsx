"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { ShareModal } from "@/components/ShareModal";
import {
  ArrowLeft,
  Share2,
  Cloud,
  Loader2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Lock,
  Edit3,
  Shield,
  Eye,
} from "lucide-react";

interface ShareItem {
  id: string;
  userId: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  isOwner: boolean;
  permission: "owner" | "edit" | "view";
  owner: {
    id: string;
    name: string;
    email: string;
  };
  shares: ShareItem[];
}

export default function DocumentEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentUser, users, setCurrentUser } = useUser();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [title, setTitle] = useState("Untitled Document");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch document details
  const fetchDocument = useCallback(async () => {
    if (!currentUser || !id) return;
    try {
      const res = await fetch(`/api/documents/${id}?userId=${currentUser.id}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Access Denied: You do not have permission to view this document.");
        } else if (res.status === 404) {
          setError("Document not found.");
        } else {
          setError("Failed to load document.");
        }
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setDocument(data);
      setTitle(data.title);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load document";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Can the current user edit?
  const canEdit = document?.isOwner || document?.permission === "edit";

  // Debounced auto-save function
  const triggerAutoSave = useCallback(
    (newContent: string, newTitle: string) => {
      if (!currentUser || !canEdit) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setSaveStatus("saving");

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/documents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: newTitle,
              content: newContent,
              userId: currentUser.id,
            }),
          });

          if (res.ok) {
            setSaveStatus("saved");
          } else {
            setSaveStatus("unsaved");
          }
        } catch (err) {
          console.error("Auto-save failed:", err);
          setSaveStatus("unsaved");
        }
      }, 1000);
    },
    [currentUser, canEdit, id]
  );

  // Setup Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
    ],
    content: "",
    editable: canEdit,
    editorProps: {
      attributes: {
        class: "focus:outline-none max-w-none text-slate-800",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus("unsaved");
      triggerAutoSave(currentEditor.getHTML(), title);
    },
  });

  // Sync content when document is loaded
  useEffect(() => {
    if (editor && document) {
      if (editor.getHTML() !== document.content) {
        editor.commands.setContent(document.content || "<p></p>");
      }
      editor.setEditable(canEdit);
    }
  }, [document, editor, canEdit]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus("unsaved");
    if (editor) {
      triggerAutoSave(editor.getHTML(), newTitle);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Notice</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Switch Test Account to Check Permissions:
            </span>
            <select
              value={currentUser?.id || ""}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) {
                  setCurrentUser(selected);
                  setIsLoading(true);
                }
              }}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation & Document Controls */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition shrink-0"
              title="Back to all documents"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={title}
                disabled={!canEdit}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled Document"
                className="w-full text-lg font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded px-2 py-0.5 outline-none transition truncate disabled:opacity-75"
              />
              <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500">
                {saveStatus === "saving" ? (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving changes...
                  </span>
                ) : saveStatus === "saved" ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Cloud className="w-3 h-3" /> Saved to cloud
                  </span>
                ) : (
                  <span className="text-slate-400">Unsaved changes</span>
                )}
                <span>•</span>
                <span>{canEdit ? "Editing permitted" : "Read-only view"}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Badges & Simulated User */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Permission Badge */}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                document.isOwner
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : canEdit
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {document.isOwner ? (
                <>
                  <Shield className="w-3.5 h-3.5" /> Owner
                </>
              ) : canEdit ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Can Edit
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> View Only
                </>
              )}
            </span>

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
              {document.shares.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-800 text-blue-100 rounded-full text-[10px]">
                  {document.shares.length}
                </span>
              )}
            </button>

            {/* User Switcher */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs">
              <span className="text-slate-400">User:</span>
              <select
                value={currentUser?.id || ""}
                onChange={(e) => {
                  const selected = users.find((u) => u.id === e.target.value);
                  if (selected) {
                    setCurrentUser(selected);
                  }
                }}
                className="font-medium bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tiptap Formatting Toolbar */}
        {canEdit && editor && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 sm:px-6 py-2 flex items-center gap-1 overflow-x-auto">
            {/* Undo / Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1.5" />

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-blue-100 text-blue-700 font-bold"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-blue-100 text-blue-700 font-bold"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-blue-100 text-blue-700 font-bold"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1.5" />

            {/* Inline Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("bold")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Bold"
            >
              <BoldIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("italic")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Italic"
            >
              <ItalicIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("underline")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1.5" />

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("bulletList")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("orderedList")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1.5" />

            {/* Quote & Divider */}
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded transition ${
                editor.isActive("blockquote")
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Editor Page Container (Google Docs Style Paper) */}
      <main className="flex-1 py-10 px-4 sm:px-6 flex justify-center overflow-y-auto">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md border border-slate-200 min-h-[900px] p-12 sm:p-16">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        documentId={document.id}
        documentTitle={document.title}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isOwner={document.isOwner}
        shares={document.shares || []}
        ownerName={document.owner?.name}
        ownerEmail={document.owner?.email}
        onSharesUpdated={fetchDocument}
      />
    </div>
  );
}
