# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here.
2. If yes — match its exact classes and design details.
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then register it here.

After building any component — update this file with the component name, file path, and exact classes used.

---

## Registered Components

### 1. WorkspaceStats
* **Path**: [WorkspaceStats.tsx](file:///Users/abrah/lupora-tech/devpilot/components/dashboard/WorkspaceStats.tsx)
* **Classes / Tokens**:
  * Outer Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
  * Card Container: `bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow`
  * Stat Number: `text-3xl font-semibold text-text-primary`
  * Icon Wrapper: `h-12 w-12 rounded-xl flex items-center justify-center` (e.g. `bg-accent-muted text-accent` or `bg-success-lightest text-success`)

### 2. ProjectCard
* **Path**: [ProjectCard.tsx](file:///Users/abrah/lupora-tech/devpilot/components/dashboard/ProjectCard.tsx)
* **Classes / Tokens**:
  * Link Wrap: `block group`
  * Card Container: `bg-surface border rounded-2xl p-6 shadow-sm group-hover:shadow-md group-hover:scale-[1.01] transition-all flex flex-col gap-4 h-full min-h-[220px]`
  * Border health dynamic highlights:
    * High Risk: `border-t-4 border-t-error border-x-border border-b-border`
    * At Risk: `border-t-4 border-t-warning border-x-border border-b-border`
    * On Track: `border-border`
  * Title: `text-base font-bold text-text-primary group-hover:text-accent transition-colors`
  * Description: `text-xs text-text-secondary line-clamp-2 mt-0.5 leading-relaxed`
  * Health Badge: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold` (with corresponding health theme backgrounds/foregrounds)
  * Progress Fill: `h-full rounded-full transition-all duration-300` (e.g. `bg-success`, `bg-error`, `bg-warning`, or `bg-accent` based on state)

### 3. ProjectDashboard
* **Path**: [ProjectDashboard.tsx](file:///Users/abrah/lupora-tech/devpilot/components/projects/ProjectDashboard.tsx)
* **Classes / Tokens**:
  * Layout Grid: `grid grid-cols-1 lg:grid-cols-4 gap-6 items-start`
  * Banner Card: `bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-5` (with conditional health border-t-4 class)
  * Heading: `text-xl md:text-2xl font-bold tracking-tight text-text-primary`
  * Subtext: `text-xs md:text-sm text-text-secondary leading-relaxed`

### 4. ModulesList
* **Path**: [ModulesList.tsx](file:///Users/abrah/lupora-tech/devpilot/components/projects/ModulesList.tsx)
* **Classes / Tokens**:
  * Tabs wrap: `flex flex-wrap items-center gap-2`
  * Search wrap: `relative w-full md:w-72 flex items-center`
  * Search input: `w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all`
  * Grid container: `grid grid-cols-1 gap-5`
  * Card container: `bg-surface border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative group`
  * Category badge: `inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary text-text-secondary border border-border`
  * Blocker warning: `mt-2 rounded-xl px-4 py-2.5 text-xs font-semibold border bg-error-light text-error-foreground border-error-light`

### 5. ModuleWorkstation
* **Path**: [ModuleWorkstation.tsx](file:///Users/abrah/lupora-tech/devpilot/components/modules/ModuleWorkstation.tsx)
* **Classes / Tokens**:
  * Grid: `grid grid-cols-1 lg:grid-cols-3 gap-6 items-start`
  * Blocker Alert: `bg-error-light border border-error-light text-error-foreground rounded-2xl p-5 flex items-start gap-3.5 shadow-sm`
  * Document Card: `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5`
  * Textarea: `w-full bg-surface border border-border rounded-lg p-4 font-mono text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all`
  * Preview render: `whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed break-words`
  * Control Panel: `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5`

### 6. BlockerModal
* **Path**: [BlockerModal.tsx](file:///Users/abrah/lupora-tech/devpilot/components/modules/BlockerModal.tsx)
* **Classes / Tokens**:
  * Backdrop: `absolute inset-0 bg-overlay/50 backdrop-blur-sm`
  * Modal Card: `relative bg-surface border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full flex flex-col gap-4 z-10 mx-4`
  * Buttons Wrap: `flex items-center justify-end gap-3 mt-2`

### 7. ActivityFeed
* **Path**: [ActivityFeed.tsx](file:///Users/abrah/lupora-tech/devpilot/components/projects/ActivityFeed.tsx)
* **Classes / Tokens**:
  * Feed Wrap: `relative border-l border-border pl-6 ml-3 flex flex-col gap-6`
  * Node Icon: `h-7 w-7 rounded-full flex items-center justify-center border shrink-0` (using `bg-error-light text-error border-error-light`, `bg-success-lightest text-success border-success-light`, or `bg-info-light text-info border-info-light`)
  * Event Content: `flex flex-col gap-0.5`
  * Message: `text-sm text-text-primary font-medium leading-snug`
  * Timestamp: `text-[11px] text-text-secondary`

### 8. WorkspaceCharts
* **Path**: [WorkspaceCharts.tsx](file:///Users/abrah/lupora-tech/devpilot/components/dashboard/WorkspaceCharts.tsx)
* **Classes / Tokens**:
  * Analytics Grid: `grid grid-cols-1 lg:grid-cols-2 gap-6`
  * Card: `bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5`
  * Radial Conic Ring: `relative h-36 w-36 rounded-full flex items-center justify-center shadow-inner`
  * Inner Ring Overlay: `absolute h-[116px] w-[116px] bg-surface rounded-full flex flex-col items-center justify-center shadow-sm`
  * Workload distribution scroll wrap: `flex flex-col gap-4 py-1 max-h-[170px] overflow-y-auto pr-1`
  * Blocker Card: `bg-error-light border border-error-light rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow border-l-4 border-l-error`

### 9. ProgressUpdateModal
* **Path**: [ProgressUpdateModal.tsx](file:///Users/abrah/lupora-tech/devpilot/components/projects/ProgressUpdateModal.tsx)
* **Classes / Tokens**:
  * Backdrop: `absolute inset-0 bg-overlay/50 backdrop-blur-sm animate-fade-in`
  * Modal Card: `relative bg-surface border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full flex flex-col gap-4 z-10 mx-4`
  * Slider input: `w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent`


