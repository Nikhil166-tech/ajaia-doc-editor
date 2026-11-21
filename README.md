# Ajaia Docs - AI-Native Collaborative Document Editor

A lightweight, full-stack collaborative document editor inspired by Google Docs, built as part of the **Ajaia LLC - AI-Native Full Stack Developer Assignment**.

---

## 🚀 Live Demo & Seeded Test Accounts

- **Live Production URL:** [https://ajaia-doc-editor-iota.vercel.app](https://ajaia-doc-editor-iota.vercel.app)
- **Local URL:** `http://localhost:3000`
- **Simulated Test Accounts (Available in header dropdown):**
  - **Alice Johnson:** `alice@ajaia.test` (Primary Owner)
  - **Bob Smith:** `bob@ajaia.test` (Collaborator)

---

## ✨ Features Implemented

1. **Document Creation & Rich-Text Editing**
   - Create blank documents or open existing ones.
   - Inline title editing with automatic persistence.
   - Comprehensive Tiptap toolbar: **Bold**, *Italic*, <u>Underline</u>, Headings (H1, H2, H3), Bulleted Lists, Numbered Lists, Blockquotes, and Horizontal Dividers.
   - Debounced auto-saving (1000ms) with real-time status indicators (*"Saving changes..."* / *"Saved to cloud"*).

2. **File Upload & Markdown Import**
   - Import `.md` and `.txt` files directly from the dashboard.
   - Markdown headers (`# Header`) are automatically extracted as the document title.
   - Content is parsed and converted into rich HTML paragraphs and headings.

3. **Sharing & Access Control**
   - Explicit document ownership (`ownerId`).
   - Granular role-based permissions (`Can Edit` vs `View Only`).
   - Owner can share with other team members by email and revoke access at any time.
   - Dashboard cleanly separates **"My Documents"** from **"Shared with Me"**.

4. **Persistence & Data Modeling**
   - Relational database schema managed with Prisma ORM and SQLite.
   - Database seeded with initial users and an onboarding document.

5. **Automated Testing & Engineering Quality**
   - Integration test suite powered by Vitest verifying owner isolation, unauthorized access blocks, share permission grants, and share revocation.
   - Full TypeScript strict mode across frontend and API routes.

---

## 🛠️ Local Setup & Run Instructions

### Prerequisites
- Node.js 18+ (tested on v20.19.6)
- npm 10+

### Installation & Execution
```bash
# 1. Clone or navigate to the project directory
cd ajaia-doc-editor

# 2. Install dependencies
npm install

# 3. Initialize & seed SQLite database
npx prisma db push
npx tsx prisma/seed.ts

# 4. Run automated tests
npm test # or npx vitest run

# 5. Build and run production server
npm run build
npm start

# Or run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests
```bash
npx vitest run
```
The test suite in `tests/sharing.test.ts` validates:
- Document owner integrity
- Unauthorized user access rejection (HTTP 403 logic)
- Permission assignment (`edit` vs `view`)
- Access revocation
