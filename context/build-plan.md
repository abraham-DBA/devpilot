# Build Plan

## Core Principle

Full page UI is built with mock data first and validated visually. Once the UI meets premium standards, database interactions, server actions, and states are wired sequentially. Every phase must be testable before moving to the next.

---

## Phase 1 — Foundation

### 01 Marketing Homepage
Build the landing layout highlighting the value proposition of DevFlow.

**UI:**
- **Navigation header**: Logo, name, links to features/workflow, and a primary CTA "Get Started".
- **Hero area**: Clean typography, sub-header text, primary CTA "Start Tracking", and a dashboard UI preview layout.
- **Workflow Preview section**: Step-by-step layout illustrating Project -> Modules -> Ownership -> Progress.
- **Footer**: Workspace copyright and minimal links.

**Logic:**
- CTA buttons route authenticated users to `/dashboard` and unauthenticated users to `/login`.

---

### 02 Supabase Authentication
Set up secure entry routes using Supabase Auth.

**UI:**
- **Login/Signup Page**: Modern, centered container. Form inputs for Email and Password. Google OAuth button and GitHub OAuth button.
- **Callbacks page**: Landing spinner during OAuth code exchange.

**Logic:**
- Email signup and sign-in handling via Supabase clients.
- Google & GitHub OAuth triggers.
- Next.js Auth Middleware protecting: `/dashboard`, `/projects`, and `/profile`.
- Public page exclusions: `/` (home) and `/login`.

---

### 03 Database Tables Setup & Seed
Establish database structures on Supabase.

**Logic:**
- Write SQL DDL statements creating `users`, `projects`, `project_members`, `modules`, and `activities` tables.
- Add Row-Level Security (RLS) policies scoped to project membership.
- Create mock data seeds (at least two projects, three developers, five modules, and some activities) to verify reads.

---

### 04 Onboarding & Role Selection
First-time user onboarding profile configuration.

**UI:**
- **Onboarding Form**: Displayed automatically on `/dashboard` or `/profile` if profile setup is missing. Requires name input and role selection dropdown (`Developer`, `Team Lead`, `Project Manager`).

**Logic:**
- Write profile save action in `actions/profile.ts` inserting/updating rows in the `users` table.
- Blocks dashboard redirection until role configuration is set.

---

## Phase 2 — Project Workspace

### 05 Projects Dashboard (Main UI)
High-level view of all team projects.

**UI:**
- **Workspace Stats summary**: Horizontal bar displaying total projects, completed projects, active blockers, and high-risk projects.
- **Projects Grid**: List of active project cards showing name, description timeline, team avatars, and calculated progress percentages.
- **"Create Project" Action Button**: Directs to project creation.

**Logic:**
- Query all active projects the user belongs to from the DB.
- Compute average completion and health statuses dynamically.

---

### 06 Project Creation Form
Form layout for starting a new coordination flow.

**UI:**
- **Form Card**: Fields for Project Name, Description, Start Date, End Date, and Member Selection checkboxes (fetching user list from database).
- **Submit button** with active loading indicator.

**Logic:**
- Server Action in `actions/projects.ts` inserts a row in `projects` and inserts matching records in `project_members`.
- Revalidates path `/dashboard` and redirects to `/projects/[id]`.

---

## Phase 3 — Module Management & Assignments

### 07 Project Detail Dashboard
Central workspace for monitoring a single project's health.

**UI:**
- **Project Header**: Title, description, project health badge (`🟢 On Track`, `🟡 At Risk`, `🔴 High Risk`), and date ranges.
- **Team members sidebar**: List of developers joined on the project.
- **Modules overview grid**: Grouped by progress categories or shown as a table list.
- **"Add Module" Action Button**.

**Logic:**
- Fetch single project by ID including related members and modules.
- Compute health based on formula: elapsed duration ratio vs progress percentage.

---

### 08 Module Definition Form
Define components and assign developers.

**UI:**
- **Modal or Page Form**: Module Name, Description, Owner dropdown (displaying project team members), Deadline date picker, and initial state selections.

**Logic:**
- Server Action in `actions/modules.ts` creating modules.
- Form validation checks (Deadline must fall within project start/end dates).
- Creates an entry in `activities` tracking module initialization.

---

### 09 Module Ownership List
Listing and sorting modules.

**UI:**
- **Modules Table/List**: Row layout containing Module Name, Owner name/avatar, progress bar (`0-100%`), Status Pill, and deadline status indicator (🟢/🟡/🔴).
- **Filters**: Tab selections to filter by Owner, status state (`Blocked`, `Completed`), or search inputs.

**Logic:**
- Wire filters to query parameters or Zustand state filters to trigger immediate grid updates.

---

## Phase 4 — Developer Progress & Blocker Reporting

### 10 Module Details Editor
Developer workstation to report module status.

**UI:**
- **Detail Panel**: Displays full description, timeline details, progress slider (0-100%), and Status Dropdown (`Not Started`, `In Progress`, `Review`, `Completed`, `Blocked`).

**Logic:**
- Slide progress update updates database in real time.
- Completing module (setting to `Completed`) locks progress to 100% automatically.

---

### 11 Blocker Reporting Form
Immediate blocker visibility mechanism.

**UI:**
- **Blocker Dialog**: Appears immediately when a module status transitions to `Blocked`. Requires description text input (e.g. "Stuck on backend DB configuration").

**Logic:**
- Save blocker text to `blocker_description` in the database.
- Insert critical notification item into the `activities` logging table.
- Instantly triggers the high-risk red alert badge on parent project dashboard card.

---

### 12 Technical Notes knowledge Base
Technical and implementation references within modules.

**UI:**
- **Dual-Pane Layout**: Technical Notes editor/viewer and Implementation Notes editor. Supports markdown rendering.
- **Save buttons** displaying saved confirmations.

**Logic:**
- Save note contents to `technical_notes` and `implementation_notes` columns in `modules`.
- Read notes immediately on load.

---

## Phase 5 — Coordination & Health Monitoring

### 13 Project Health Algorithm Visualizer
Flagging project risks automatically based on schedule velocity.

**UI:**
- Highlight dashboard panels in red if project health computes to `🔴 High Risk`.
- Display a breakdown explanation box showing elapsed timeline percentage vs current completion percentage.

**Logic:**
- Compute risk level using `calculateProjectHealth()` logic in `lib/utils.ts`.

---

### 14 Real-Time Project Activity Feed
Activity streams of progress changes and updates.

**UI:**
- **Activities Card**: Chronological list of events with icon markers (blue for updates, green for completions, red for blockers) and user timestamps.

**Logic:**
- Set up Supabase Realtime channel subscription.
- Automatically insert list items at the top of the feed as Postgres broadcast payloads fire.

---

### 15 Overriding Workspace Metrics
Consolidated workspace performance analytics.

**UI:**
- **Charts Section**: 
  - Module completion ratios (recharts pie/bar chart).
  - Developer workload distribution (modules assigned counts).
  - Blocker listing panel highlighting unresolved blocking logs.

**Logic:**
- Aggregate module stats across the user's workspace projects from the database.

---

## Feature Counts by Phase

| Phase | Features | Description |
| --- | --- | --- |
| Phase 1 — Foundation | 4 | Marketing, Supabase Auth, DB schema setup, and Role Onboarding |
| Phase 2 — Project Workspace | 2 | Workspace project dashboard and project creation |
| Phase 3 — Module Management | 3 | Project detail overview, Module creation form, and Modules owner listing |
| Phase 4 — Developer Workflow | 3 | Progress tracking details, Blocker logging, and Markdown technical notes |
| Phase 5 — Coordination & Analytics | 3 | Health calculations, Real-time activities feed, and workspace metric charts |
| **Total** | **15** | |
