# Ajaia LLC - Candidate Assignment Submission

**Candidate Name:** Itharaju Nikhil Kumar  
**Email:** itharajunikhil16@gmail.com  
**Assignment:** AI-Native Full Stack Developer Take-Home Assignment  
**Project:** Ajaia Docs - Lightweight Collaborative Document Editor  

---

## 📦 What Is Included In This Submission

1. **Live Production URL:** [https://ajaia-doc-editor-iota.vercel.app](https://ajaia-doc-editor-iota.vercel.app)
2. **Local Run URL:** `http://localhost:3000`
3. **Source Code:** Complete Next.js 14, TypeScript, Tailwind CSS, Tiptap, and Prisma SQLite codebase in `C:\ajaia-doc-editor`.
2. **README.md:** Complete local setup, seed instructions, and test guide.
3. **ARCHITECTURE.md:** Comprehensive architecture note covering design decisions, data model, trade-offs, and future roadmap.
4. **AI_WORKFLOW.md:** Detailed AI-native note explaining tools used, acceleration points, rejected code/decisions, and verification methods.
5. **Automated Test Suite:** Integration tests (`tests/sharing.test.ts`) validating ownership, access denial, and permission grants. All 4 tests passing.
6. **Walkthrough Video Outline / Link:** Walkthrough structure covering the end-to-end flows.

---

## 🔑 Test Credentials / Seeded Accounts

The application includes an in-app simulated account switcher in the top navigation bar:
- **Alice Johnson (`alice@ajaia.test`):** Primary owner of seeded welcome document.
- **Bob Smith (`bob@ajaia.test`):** Collaborator receiving shared documents.

---

## 🟢 What Is Working End-to-End

- **Document Creation & Editing:** Create blank docs, rename titles, format rich text (Bold, Italic, Underline, H1, H2, H3, Lists, Quotes, Dividers), and debounced auto-saving.
- **File Upload / Import:** Uploading `.md` and `.txt` files directly converts them into editable documents, extracting titles from markdown `#` headers.
- **Sharing & Access Control:** Owner can share documents with edit or view permissions, revoke access, and views are cleanly segregated into "My Documents" and "Shared with Me".
- **Database Persistence:** Real-time persistence using Prisma ORM with SQLite database.
- **Automated Verification:** 4 passing Vitest integration tests for authorization logic.

---

## 🟡 What Was Intentionally Deprioritized

- **WebSocket / CRDT Synchronization:** Deprioritized to avoid race conditions under tight time constraints; replaced with a robust debounced auto-save engine.
- **Complex OAuth Flow:** Seeded user accounts eliminate reviewer login friction while validating multi-tenant security rules.
- **Binary File Parsing (.docx / .pdf):** Kept file parsing focused on text/markdown for clean, zero-dependency execution.

---

## 🚀 Next Steps With Another 2-4 Hours

1. **Document Version History:** Snapshot past edits to restore earlier document states.
2. **Export to PDF & Markdown:** One-click download of document drafts.
3. **Presence Badges:** Visual indication of users currently viewing a document.
