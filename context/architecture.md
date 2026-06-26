# Architecture

## Stack

| Layer                   | Tool                      | Purpose                                       |
| ----------------------- | ------------------------- | --------------------------------------------- |
| Framework               | Next.js 16 (App Router)   | Full stack React framework                    |
| Auth + Database + API   | Supabase                  | Authentication, Postgres Database, Realtime   |
| State Management        | Zustand                   | Lightweight global state                      |
| Styling                 | Tailwind CSS v4           | Premium styling and utility classes           |
| Icons                   | Lucide React              | Modern standard iconography                  |
| Language                | TypeScript strict         | End-to-end type safety                       |
| Deployment              | Docker + Nginx            | Containerization & reverse proxy routing      |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout, fonts, CSS import
│   ├── page.tsx                            → Homepage (marketing and CTAs)
│   ├── login/
│   │   └── page.tsx                        → Login / Signup (Supabase auth UI)
│   ├── dashboard/
│   │   └── page.tsx                        → Main dashboard (All projects overview)
│   ├── projects/
│   │   ├── new/
│   │   │   └── page.tsx                    → Create new project form
│   │   └── [id]/
│   │       ├── page.tsx                    → Project detail dashboard
│   │       └── modules/
│   │           ├── new/
│   │           │   └── page.tsx            → Create project module form
│   │           └── [mid]/
│   │               └── page.tsx            → Module detail & notes editing
│   ├── profile/
│   │   └── page.tsx                        → User profile settings & role setup
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts                → Supabase OAuth redirect landing
├── actions/
│   ├── projects.ts                         → Server Actions for creating/updating projects
│   ├── modules.ts                          → Server Actions for modules and blocker logic
│   └── profile.ts                          → Server Actions for saving user profile details
├── components/
│   ├── ui/                                 → Custom or primitive UI elements (buttons, inputs)
│   ├── layout/
│   │   ├── Navbar.tsx                      → Top navigation header
│   │   └── Footer.tsx                      → Bottom footer
│   ├── dashboard/
│   │   ├── ProjectCard.tsx                 → High-level project state card
│   │   └── WorkspaceStats.tsx              → Summary counts across all projects
│   ├── projects/
│   │   ├── ProjectDashboard.tsx            → Complete dashboard container
│   │   ├── TeamSection.tsx                 → Team membership list & assign layout
│   │   ├── ModulesList.tsx                 → Project module listings & progress bars
│   │   └── HealthIndicator.tsx             → Details of low/high-risk project calculations
│   └── modules/
│       ├── ModuleEditor.tsx                → Edit progress, status, and description
│       ├── BlockerForm.tsx                 → Blocker creation & logging dialog
│       └── NotesDoc.tsx                    → Tech & implementation details viewer
├── lib/
│   ├── supabase-client.ts                  → Browser-side Supabase client hook
│   ├── supabase-server.ts                  → Server-side Supabase client loader
│   ├── store/
│   │   └── useProjectStore.ts              → Zustand store for client UI state sync
│   └── utils.ts                            → Date parsing, class names, risk algorithms
└── types/
    └── index.ts                            → Core database & domain TypeScript declarations
```

---

## System Boundaries

* **`app/`**: Route handlers and layout components. Houses page endpoints and data loading functions.
* **`actions/`**: Mutation Layer. Server Actions performing Supabase updates and executing `revalidatePath` hooks.
* **`components/`**: Presentation Layer. Presentational React components. Avoids nested DB queries; receives props or pulls from lightweight Zustand state.
* **`lib/store/`**: UI State management. Zustand stores tracking UI states (e.g. modals, active filtering selections).
* **`lib/`**: Services config. Supabase instantiations (client/server), utility algorithms (risk metrics, dates).
* **`types/`**: Type declarations only. No code.

---

## Data Flow

### Authentication Flow
```
User clicks OAuth / email Login
        ↓
Supabase Auth executes flow
        ↓
Auth callback redirects to api/auth/callback
        ↓
Token exchange writes to Cookies
        ↓
Middleware authorizes layout access
```

### UI Mutations (Project & Module Updates)
```
User updates Module Progress to 90%
        ↓
Component triggers Server Action (actions/modules.ts)
        ↓
Server Action validates role & variables
        ↓
Supabase DB updates 'modules' row
        ↓
Server Action logs Activity in 'activities' table
        ↓
revalidatePath() refreshes data context
        ↓
Supabase Realtime pushes notification to subscribers
```

---

## Supabase Database Schema

### `users`
Tracks registered accounts and their workspace roles.

| Column      | Type        | Constraints                    | Notes                                        |
| ----------- | ----------- | ------------------------------ | -------------------------------------------- |
| id          | uuid        | Primary Key, References Auth   | Matches auth.users.id                        |
| name        | text        | Not Null                       | Display name                                 |
| email       | text        | Not Null, Unique               |                                              |
| role        | text        | Not Null                       | 'developer', 'team_lead', 'project_manager'  |
| created_at  | timestamptz | Default now()                  |                                              |

### `projects`
Core project container.

| Column      | Type        | Constraints                    | Notes                                        |
| ----------- | ----------- | ------------------------------ | -------------------------------------------- |
| id          | uuid        | Primary Key                    |                                              |
| name        | text        | Not Null                       |                                              |
| description | text        |                                |                                              |
| start_date  | timestamptz | Not Null                       |                                              |
| end_date    | timestamptz | Not Null                       |                                              |
| status      | text        | Default 'active'               | 'active', 'completed', 'archived'            |
| created_by  | uuid        | References users.id            | Project owner/manager                        |
| created_at  | timestamptz | Default now()                  |                                              |

### `project_members`
Many-to-many relationship mapping users to projects.

| Column     | Type        | Constraints                     | Notes                                        |
| ---------- | ----------- | ------------------------------- | -------------------------------------------- |
| id         | uuid        | Primary Key                     |                                              |
| project_id | uuid        | References projects.id ON DELETE CASCADE |                                      |
| user_id    | uuid        | References users.id             | Team member reference                        |
| joined_at  | timestamptz | Default now()                   |                                              |

### `modules`
Individual component tracking rows within a project.

| Column               | Type        | Constraints                     | Notes                                        |
| -------------------- | ----------- | ------------------------------- | -------------------------------------------- |
| id                   | uuid        | Primary Key                     |                                              |
| project_id           | uuid        | References projects.id ON DELETE CASCADE |                                      |
| name                 | text        | Not Null                        | Module name                                  |
| description          | text        |                                 |                                              |
| assigned_to          | uuid        | References users.id             | Assigned developer (accountable owner)       |
| progress             | integer     | Default 0                       | Integer from 0 to 100                        |
| status               | text        | Default 'not_started'           | 'not_started', 'in_progress', 'review', 'completed', 'blocked' |
| deadline             | timestamptz | Not Null                        | Module completion deadline                   |
| blocker_description  | text        |                                 | Set when status is 'blocked'                 |
| technical_notes      | text        |                                 | DB schema, API endpoints, logic              |
| implementation_notes | text        |                                 | Technical decisions, workarounds             |
| created_at           | timestamptz | Default now()                   |                                              |
| updated_at           | timestamptz | Default now()                   |                                              |

### `activities`
Real-time chronological events log.

| Column     | Type        | Constraints                    | Notes                                        |
| ---------- | ----------- | ------------------------------ | -------------------------------------------- |
| id         | uuid        | Primary Key                    |                                              |
| project_id | uuid        | References projects.id ON DELETE CASCADE | Optional scoping to project         |
| user_id    | uuid        | References users.id            | Actor performing update                      |
| message    | text        | Not Null                       | Human-readable event description             |
| created_at | timestamptz | Default now()                  |                                              |

---

## Supabase SSR Configuration Pattern

### Browser Client
Exposed to Client Components:

```typescript
// lib/supabase-client.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Server Client
Exposed to Server Components, Route Handlers, and Server Actions:

```typescript
// lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method can be ignored if
            // called from a Server Component
          }
        },
      },
    }
  );
};
```

---

## Realtime Activity Synchronization

For the Project activity feed, the dashboard subscribes to changes on the `activities` table:

```typescript
// Example usage in Client Component
useEffect(() => {
  const channel = supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "activities",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        // Append new activity to UI list via Zustand or state callback
        addActivity(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [projectId]);
```
