# Code Standards

Implementation rules and conventions for the entire DevFlow project. The AI agent must follow these guidelines in every session without exception to prevent pattern drift and architectural decay.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer:

- **Think before implementing** — Understand the user flow and database architecture before writing any code.
- **Read context files first** — Never assume API shapes or schemas; always verify against `architecture.md` and `project-overview.md`.
- **Strict Scope Boundaries** — Implement only the requested code and database modifications. Do not write premature features.
- **Testability** — Every feature must have a visual representation or clear logic verification path immediately upon build.
- **Clean Over Clever** — Simple, readable code is always preferred over complex custom abstractions.
- **One Thing at a Time** — Complete one component or route fully before starting the next.
- **Graceful Failure Handling** — Wrap queries and async integrations in robust try/catch blocks; log failures clearly, and fail safely.

---

## TypeScript

- Strict mode enabled in `tsconfig.json` — No implicit any is allowed.
- Never use `any` — Use `unknown` and narrow types using type guards or Zod schema parses.
- Never use type assertions (`as SomeType`) unless absolutely necessary and documented.
- Explicitly type all function parameters, return shapes, and React Component props.
- Use `type` for object shapes, function signatures, and unions; use `interface` only for extendable component props.
- All asynchronous calls must be properly awaited or handled via promise catches.

---

## Next.js Conventions

- **App Router only** — Standard folder-based app routing.
- **React 19** — Leverage React 19 standards throughout.
- **Server Components by default** — All layout and page components must fetch data on the server.
- **Client Components boundary** — Add `"use client"` only when components require:
  - React state hooks (`useState`, `useReducer`, `useContext`)
  - Side-effect hooks (`useEffect`)
  - Browser APIs (window, localStorage, history)
  - Interactive event listeners (`onClick`, `onChange`)
  - Zustand store subscriptions
- **Server Actions** — Server Actions must live in `actions/` (e.g., `actions/projects.ts`, `actions/modules.ts`) and carry `"use server"` at the top of the file. Do not define actions inline.
- **Route Handlers** — API endpoints live in `app/api/` (e.g., `app/api/auth/callback/route.ts`). Keep them strictly focused on network callback mechanics; business operations must live in the database or server actions.

---

## File and Folder Naming Conventions

- **Directories**: kebab-case (e.g. `project-details`, `module-editor`).
- **React Components**: PascalCase (e.g. `ProjectCard.tsx`, `WorkspaceStats.tsx`).
- **Utility / Config Files**: camelCase (e.g. `supabaseClient.ts`, `supabaseServer.ts`).
- **Types files**: `index.ts` within the `types/` folder.
- **Server Actions**: camelCase (e.g. `projects.ts`, `modules.ts`).
- **One Component per file** — Never bundle multiple components into a single source file.

---

## Component Layout Structure

Standard layout sequence inside every component file:

```typescript
"use client"; // only if state or store required

// 1. External Node module imports
import { useState } from "react";
import { Plus } from "lucide-react";

// 2. Project Component imports
import { Button } from "@/components/ui/Button";

// 3. Typings and interfaces
type Props = {
  projectId: string;
  isOwner: boolean;
};

// 4. Main Component declaration
export function ComponentName({ projectId, isOwner }: Props) {
  // hooks & store selection
  // state hooks
  // business and state handler routines
  // return JSX render statement
}
```

- Always use named exports — No `export default` for UI components.
- Keep inline styles completely absent — Style components using Tailwind tokens.

---

## Server Action Pattern

Every server action must adhere to a standard error and success shape:

```typescript
// actions/modules.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";

type UpdateProgressResult = {
  success: boolean;
  error?: string;
};

export async function updateModuleProgress(
  moduleId: string, 
  progress: number
): Promise<UpdateProgressResult> {
  try {
    const supabase = await createSupabaseServer();
    
    // Auth validation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized access" };
    }

    // DB Write
    const { error } = await supabase
      .from("modules")
      .update({ progress, updated_at: new Date().toISOString() })
      .eq("id", moduleId);

    if (error) throw error;

    revalidatePath("/projects/[id]");
    return { success: true };
  } catch (err) {
    console.error("[actions/modules/updateProgress]", err);
    return { success: false, error: "Failed to update progress" };
  }
}
```

- Always return `{ success: boolean, error?: string, data?: T }`.
- Never throw exceptions back to the client UI. Catch and return them as an error string.
- Call `revalidatePath` to trigger router data refreshes.

---

## Supabase Client Usage Rules

Do not instantiate clients directly in component bodies. Import predefined client utilities:

- **Browser context**: Client components must import `supabase` from `@/lib/supabase-client`.
- **Server context**: Server components, Actions, and API routes must instantiate using `await createSupabaseServer()` from `@/lib/supabase-server`.
- Always scope queries to user permissions or explicit owner fields in tables where RLS doesn't fully cover it.

---

## Health Risk Formula

The health calculation of a project (🟢 On Track, 🟡 At Risk, 🔴 High Risk) must follow this logic:

```typescript
// lib/utils.ts
export type ProjectHealth = "on_track" | "at_risk" | "high_risk";

export function calculateProjectHealth(
  startDate: string,
  endDate: string,
  progress: number
): ProjectHealth {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return "on_track";
  if (now >= end) return progress >= 100 ? "on_track" : "high_risk";

  const totalDuration = end - start;
  const timeElapsed = now - start;
  const timeUsedPercentage = (timeElapsed / totalDuration) * 100;

  const diff = timeUsedPercentage - progress;

  if (diff > 20) return "high_risk";
  if (diff > 0) return "at_risk";
  return "on_track";
}
```

Always use this shared helper to guarantee health visual synchronizations.

---

## Environment Variables

The project requires the following environment variables to run:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

All credentials must reside in `.env.local`. Do not commit secret keys to GitHub.

---

## Import Aliasing

Always use the `@/` prefix for all project references to prevent deep relative path resolutions.

```typescript
// Correct
import { Button } from "@/components/ui/Button";

// Incorrect
import { Button } from "../../../../components/ui/Button";
```

---

## Approved Project Dependencies

Only use the following packages. Do not install any additional third party node modules unless explicitly instructed by the user:

- `@supabase/ssr` & `@supabase/supabase-js` — Supabase integration
- `zustand` — Client state tracking
- `lucide-react` — UI icons
- `tailwindcss` — CSS framework
- `zod` — Validation schema structures
