# Architecture & Design Trade-offs

## 1. System Overview
Ajaia Docs is built as a cohesive, full-stack Next.js application utilizing the App Router architecture, TypeScript, Tailwind CSS, Tiptap, and Prisma ORM backed by SQLite.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client (Browser)                          │
│   Dashboard View           Editor View (Tiptap)    Share Modal  │
│   (UserContext: Alice/Bob) (Debounced Auto-save)   (RBAC)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP REST API
┌────────────────────────────────▼────────────────────────────────┐
│                   Next.js Server API Routes                     │
│  /api/users            /api/documents          /api/documents/[id]
│  /api/documents/import /api/documents/[id]/share                │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Prisma ORM
┌────────────────────────────────▼────────────────────────────────┐
│                      SQLite Database                            │
│  User ◄──────────── Document ◄──────────── DocumentShare        │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Core Architectural Decisions

### A. Tiptap Headless Rich-Text Engine
- **Why Chosen:** Tiptap is built on ProseMirror, the industry benchmark for structured rich text. It produces clean semantic HTML, decouples styling entirely to Tailwind CSS, and provides an extensible foundation.
- **Trade-off:** Chose standard ProseMirror document serialization over complex Yjs/CRDT state because CRDTs introduce synchronization overhead that was unnecessary for the scoped timebox.

### B. Relational Data Model & Access Control
- **Schema Design:**
  - `User`: Seeded profiles (`id`, `name`, `email`) switchable via a header dropdown.
  - `Document`: Represents the document entity (`id`, `title`, `content`, `ownerId`, timestamps).
  - `DocumentShare`: Join table establishing granular access (`documentId`, `userId`, `permission: "view" | "edit"`).
- **Access Logic:**
  - `GET /api/documents/[id]`: Returns 403 Forbidden if the requester is neither the owner nor has an explicit share record.
  - `PATCH /api/documents/[id]`: Requires `owner` or `edit` permission.
  - `DELETE /api/documents/[id]`: Restricted exclusively to the owner.

### C. Debounced Auto-Save
- Edits trigger a 1000ms debounce timer before sending a `PATCH` request with the latest HTML content and title.
- UI displays real-time feedback: `Saving changes...` -> `Saved to cloud`.

### D. File Import Pipeline
- Supports `.md` and `.txt`.
- For Markdown, `# Heading` syntax is automatically extracted to populate the document title, and Markdown syntax is parsed into semantic HTML via `marked`.
- For Plain Text, paragraphs separated by double newlines are wrapped in semantic `<p>` tags.

## 3. Deliberate Scope Cuts & What We Deprioritized
1. **Real-time Multi-cursor WebSockets:** Implementing operational transformation (OT) or CRDTs (e.g. Yjs) under 4 hours introduces edge-case race conditions. A reliable debounced auto-save meets the prompt's persistence requirement with 100% stability.
2. **Heavy Authentication / OAuth:** Implemented a simulated multi-user switcher (Alice & Bob) with persistent state. This eliminates login friction for reviewers while maintaining realistic multi-tenant authorization logic.
3. **Binary File Parsing (.docx / .pdf):** Kept file parsing focused on text/markdown to guarantee fast, zero-dependency reliability.

## 4. What We Would Build Next (Next 2-4 Hours)
1. **Version History & Restore Points:** Snapshotting previous revisions to a `DocumentVersion` table with diff viewing.
2. **Export Capabilities:** Client-side export to Markdown and PDF.
3. **Presence Indicators:** Lightweight presence polling or WebSockets to show who is currently viewing or editing the document.
