# Library Docs

Project-specific usage guidelines for the third-party libraries approved for DevFlow.

---

## Supabase SSR & JS Client

We use `@supabase/ssr` to configure authentication and database client interactions in the Next.js App Router context.

### 1. Client vs. Server Clients

Do not mix browser and server Supabase client instantiation. Follow these exact definitions:

```typescript
// lib/supabase-client.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

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
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  );
};
```

### 2. Standard Query Patterns

Always handle the return parameters (`data`, `error`) from Supabase queries. Never assume successful resolution.

#### Fetching Rows
```typescript
const supabase = await createSupabaseServer();
const { data: projects, error } = await supabase
  .from("projects")
  .select(`
    *,
    project_members(user_id),
    modules(*)
  `)
  .eq("status", "active")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Fetch projects error:", error);
  return [];
}
```

#### Inserting Rows (with Activities)
```typescript
const supabase = await createSupabaseServer();
const { data: newModule, error: moduleError } = await supabase
  .from("modules")
  .insert({
    project_id: projectId,
    name: moduleName,
    assigned_to: devId,
    deadline: deadlineIso,
    status: "not_started"
  })
  .select()
  .single();

if (moduleError) throw moduleError;

// Also log activity
await supabase
  .from("activities")
  .insert({
    project_id: projectId,
    user_id: creatorId,
    message: `Created module "${moduleName}"`
  });
```

#### Updating Progress and Status
```typescript
const supabase = await createSupabaseServer();
const { error } = await supabase
  .from("modules")
  .update({
    progress: progressVal,
    status: statusVal,
    blocker_description: statusVal === "blocked" ? blockerDesc : null,
    updated_at: new Date().toISOString()
  })
  .eq("id", moduleId);
```

---

## Zustand (Client State Management)

We use Zustand to manage client-side visual states (e.g. modals, current active project filters, optimistic activity logs, and drawer configurations).

### Zustand Store Pattern

Stores must separate state from mutations clearly. Define your store as follows:

```typescript
// lib/store/useProjectStore.ts
import { create } from "zustand";

interface ProjectState {
  // States
  activeFilter: string;
  isCreateModalOpen: boolean;
  selectedModuleId: string | null;

  // Actions
  setActiveFilter: (filter: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setSelectedModuleId: (id: string | null) => void;
  resetStore: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeFilter: "all",
  isCreateModalOpen: false,
  selectedModuleId: null,

  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setSelectedModuleId: (selectedModuleId) => set({ selectedModuleId }),
  resetStore: () => set({ activeFilter: "all", isCreateModalOpen: false, selectedModuleId: null }),
}));
```

### Hook Consumption in Client Components

To prevent unnecessary re-renders, select specific slice states rather than loading the entire store hook:

```typescript
// Correct slice selection
const isCreateModalOpen = useProjectStore((state) => state.isCreateModalOpen);
const setCreateModalOpen = useProjectStore((state) => state.setCreateModalOpen);

// Avoid
const store = useProjectStore(); // Triggers re-renders on any store update!
```

---

## Tailwind CSS v4 Theme Integration

Tailwind v4 removes `tailwind.config.js` in favor of inline configuration using the `@theme` directive directly within CSS imports.

### 1. Color Customization in `globals.css`
Colors are mapped to CSS custom properties. Use the prefix `--color-*` to register custom Tailwind color utilities.

```css
@import "tailwindcss";

@theme {
  --color-accent: #7c3aed; /* Leads to bg-accent, text-accent utility output */
  --color-success: #10b981; /* Leads to bg-success, text-success */
  --color-border: #e2e8f0;
}
```

### 2. Standard CSS Variable Usage
Avoid using static hex keys in your components. Use Tailwind classes derived from your theme configurations.

```tsx
// bg-surface translates to background-color: var(--color-surface)
// border-border translates to border-color: var(--color-border)
<div className="bg-surface border border-border rounded-xl p-6">
  <h3 className="text-text-primary text-lg font-semibold">Project Title</h3>
</div>
```

---

## Lucide React Icons

Lucide provides modular svg icons. Always import icons individually using destructive imports:

```typescript
import { Plus, CheckCircle, AlertTriangle, Play, HelpCircle } from "lucide-react";
```

Ensure standard sizing handles (`size={18}`) or class sizes (`className="h-5 w-5"`) are set on all SVG instances to avoid layout layout breakages.

---

## Sonner (Toast Notifications)

Sonner provides lightweight, animated toast popups. The `<Toaster />` provider is mounted once in the root layout (`app/layout.tsx`).

### Configuration

```tsx
// app/layout.tsx
import { Toaster } from "sonner";

// Inside <body>:
<Toaster
  position="top-right"
  richColors
  toastOptions={{
    style: {
      fontFamily: "var(--font-sans)",
    },
  }}
/>
```

### Usage in Client Components

Import `toast` from `sonner` and call it directly — no state management needed:

```tsx
import { toast } from "sonner";

// Success
toast.success("Module status updated successfully!");

// Error
toast.error("Failed to update workstation data.");

// Info
toast.info("Sync request queued.");
```

### Rules

- **Never use inline success/error banners** for transient feedback. Use `toast.success()` and `toast.error()` instead.
- Inline error states (e.g. form validation) that need to persist until the user corrects input may still use local state.
- Do not install or use any other toast/notification library.

