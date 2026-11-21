# AI-Native Workflow Note

**Candidate:** Itharaju Nikhil Kumar (`itharajunikhil16@gmail.com`)  
**Assignment:** Ajaia LLC - AI-Native Full Stack Developer Take-Home

---

## 1. AI Tools Utilized
- **Antigravity Agentic Assistant / Gemini 3.8 Flash:** Used for strategic decomposition, full-stack scaffolding, schema authoring, API route generation, and test creation.
- **Node / TypeScript Language Tools:** Real-time type checking and lint validation to guarantee runtime correctness.

---

## 2. Where AI Materially Accelerated Delivery
1. **Full-Stack Project Scaffolding:** Initializing Next.js 14, Tailwind CSS, Tiptap extensions, and Prisma models concurrently saved an estimated 60-90 minutes of manual setup.
2. **Relational Authorization Logic:** Synthesizing the role-based access control (RBAC) patterns for `DocumentShare` join tables and API permission guards across `GET`, `PATCH`, `DELETE`, and `POST /share`.
3. **Rich-Text Toolbar Integration:** Generating responsive Tiptap command bindings for bold, italic, underline, multiple heading levels, lists, quotes, and dividers in clean Tailwind components.
4. **Automated Test Generation:** Prompting the agent to write comprehensive Vitest integration tests covering owner verification, 403 access denial, and permission revocation in minutes.

---

## 3. What AI-Generated Output Was Changed or Rejected
1. **Prisma 7 Breaking Change Rollback:**
   - *Issue:* During initial setup, Prisma CLI defaulted to v7, which introduced a major breaking change deprecating `url = env("DATABASE_URL")` in `schema.prisma` in favor of experimental config drivers.
   - *Engineering Decision:* Rather than troubleshooting experimental beta drivers under time constraints, we exercised product judgment and rolled back to stable Prisma v6.4.1. This resolved migration issues immediately and ensured bulletproof local SQLite persistence.
2. **ESLint / TypeScript Strict Typing Overrides:**
   - *Issue:* Initial drafts used loose `any` types for error handling and had a few unused icon imports.
   - *Correction:* Replaced `any` with typed error instances (`err instanceof Error ? err.message : ...`) and properly typed document share interfaces to ensure zero compilation warnings during `next build`.
3. **Collaboration Scope Restraint:**
   - *Proposal:* AI suggestions often default to attempting full WebSockets / Yjs setups.
   - *Decision:* Strictly rejected this to avoid shipping a brittle, partially working real-time sync, opting instead for a rock-solid debounced auto-save engine that fulfills all persistence requirements without synchronization bugs.

---

## 4. Verification of Correctness & Reliability
- **Automated Testing:** Executed `vitest` tests validating document creation, owner isolation, share permission checks, and revocation.
- **Production Compilation:** Verified `npm run build` succeeds with zero errors and optimized static/dynamic routes.
- **Manual End-to-End Walkthrough:** Tested on `localhost:3000`:
  - Created, renamed, and edited documents with rich-text formatting.
  - Uploaded `.md` files and verified heading and paragraph parsing.
  - Switched between simulated accounts (Alice and Bob) and confirmed dashboard segregation ("My Documents" vs "Shared with Me") and permission enforcement.
