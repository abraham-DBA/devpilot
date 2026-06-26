# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

- **Phase:** All Phases Completed
- **Last completed:** 15 Overriding Workspace Metrics (Phase 5 complete)
- **Next:** N/A

---

## Progress

### Phase 1 — Foundation

- [x] 01 Marketing Homepage
- [x] 02 Better Auth Integration
- [x] 03 Database Tables Setup & Seed
- [x] 04 Onboarding & Role Selection

### Phase 2 — Project Workspace

- [x] 05 Projects Dashboard (Main UI)
- [x] 06 Project Creation Form

### Phase 3 — Module Management & Assignments

- [x] 07 Project Detail Dashboard
- [x] 08 Module Definition Form
- [x] 09 Module Ownership List

### Phase 4 — Developer Progress & Blocker Reporting

- [x] 10 Module Details Editor
- [x] 11 Blocker Reporting Form
- [x] 12 Technical Notes Knowledge Base

### Phase 5 — Coordination & Health Monitoring

- [x] 13 Project Health Algorithm Visualizer
- [x] 14 Real-Time Project Activity Feed
- [x] 15 Overriding Workspace Metrics

---

## Decisions Made During Build

- **Standard Better Auth Integration**: Migrated fully from the managed `@neondatabase/auth` service to standard self-hosted `better-auth` using the `@neondatabase/serverless` database connection pool.
- **Edge Middleware Optimization**: Checked for cookie presence (`better-auth.session_token`) in `middleware.ts` to avoid database pooler performance bottlenecks in edge route matches.
- **Next.js Server Actions Integration**: Rewrote data manipulation mutations using Next.js Server Actions (`actions/profile.ts`, `actions/projects.ts`, and `actions/modules.ts`) retrieving the user session via `auth.api.getSession({ headers: await headers() })`.
- **Dynamic Dashboard Calculations**: Calculated average project progress, active blockers count, and timeline health status on-the-fly inside Server Components by combining raw query maps, keeping database states fast.
- **Dedicated Creation Route**: Built `/projects/new` as a separate route that checks user roles first, handles timeline validation client-side, and registers relations in `project_members`.
- **Project Boundary Date Gating**: Enforced deadline limits checking that module dates fall strictly inside project schedule duration limits both on client form layouts and inside the Server Action database query.
- **Workspace Sidebar Integration**: Fetched team member roles and contact handles in a single query inside the project detail router to populate a dedicated sidebar card on the dashboard.
- **Explicit Note Saves**: Implemented separate Save buttons for technical and implementation notes, protecting the database from high network request spam on every typing keystroke.
- **Workstation Gating**: Restrained control updates (dropdowns, sliders) strictly to the assigned developer or lead/manager, displaying informational messages for other users.
- **Completions Locking**: Locked progress inputs to 100% when the status transitions to Completed, unlocking only when reverted.
- **Custom CSS Conic Rings**: Created custom concentric CSS completion indicators using conic-gradients to avoid heavy bundle charting assets.
- **In-Memory Aggregations**: Consolidated database workloads and active blocker queries by performing list filters and map reducers in-memory inside Next.js Page routers, optimizing Neon connection pools.

---

## Notes

- Obsolete Supabase client files (`supabase-client.ts`, `supabase-server.ts`) and managed Neon Auth proxy handlers were deleted.
- Better Auth database tables (`session`, `account`, `verification`) were successfully migrated using `npx auth migrate`.
- Dropped `NOT NULL` constraint on `users.role` so signup does not fail before onboarding.
