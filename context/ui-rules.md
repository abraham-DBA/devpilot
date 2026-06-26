# UI Rules

Rules and design principles for building the DevFlow UI. All components must adhere strictly to these rules to ensure consistency, clean structure, and a premium developer experience.

---

## Font

Always import Inter via `next/font/google` in the root layout.

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

Apply the font variable class (`font-sans`) to the `<html>` or `<body>` tag. Never use fallback default system fonts unless loading fails.

---

## Layout

- **Page container**: Centered, max-width of 1280px (`max-w-7xl`).
- **Main page padding**: `px-4 py-8 md:px-8` for standard desktop screens.
- **Section gap**: `gap-6` (24px) between grid items and vertical components.
- **Header height**: 64px (`h-16`), fixed or sticky top, white background with border-b.
- **Layout structure**: Top navigation bar for all pages. Side drawers or overlays are reserved for forms/blocker detail states only.

---

## Navbar

Displays: Logo + DevFlow name, and links to: Dashboard, Projects, Profile.

- **Active item**: `color: var(--color-accent)` (violet), `font-weight: 500`.
- **Inactive item**: `color: var(--color-text-secondary)` (slate 600), `hover: text-text-primary`.
- **Styling**: Horizontal padding `px-4 md:px-8`, border-bottom separating it from contents.

---

## Content Cards

All functional components (stats, module lists, forms) live in cards.

```css
background: var(--color-surface); /* #FFFFFF */
border: 1px solid var(--color-border); /* #E2E8F0 */
border-radius: var(--radius-lg); /* 12px / rounded-xl */
padding: 24px (p-6);
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
```

- Card headers should use a clean horizontal alignment (`flex items-center justify-between`) to separate the title from action buttons or badges.
- Never use deep gradients or colorful backgrounds for cards. Cards must always remain white or light grey (`bg-surface-secondary`) to keep focus on functional content.

---

## Typography Hierarchy

| Level | CSS / Tailwind Classes | Purpose |
| --- | --- | --- |
| Page Title | `text-2xl font-bold text-text-primary tracking-tight` | Page-level layout title |
| Section Header | `text-lg font-semibold text-text-primary` | Card titles, subsection headers |
| Content Bold | `text-sm font-medium text-text-primary` | Table row headings, form labels |
| Body Text | `text-sm font-normal text-text-secondary` | General details, descriptions |
| Subtitle / Muted | `text-xs font-normal text-text-muted` | Meta metadata, timestamps, notes |

---

## Badges & Status Indicators

- **Pill Shape**: All status states (e.g. `Completed`, `Blocked`, `In Progress`) use rounded pills (`rounded-full px-2.5 py-0.5 text-xs font-medium`).
- **Indicator Rings**: If a status represents an active block or danger state (e.g., `Blocked`), include an inner solid dot or a pulse animation to draw immediate attention.
- **Alert Flags**: Project health flags (`🟢 On Track`, `🟡 At Risk`, `🔴 High Risk`) must display an icon next to the text.

---

## Form Controls

- Inputs, textareas, and select components must share identical borders, border-radius, and focus indicators.
- **Focus state**: `focus:ring-2 focus:ring-accent focus:border-transparent outline-none`.
- Mandatory inputs must show a red asterisk (`*`) next to their label.
- Error validation borders must change to `border-error` with text in `text-error`.

---

## Tables & Module Lists

- **Header row**: Thin bottom border, uppercase column labels, `text-xs font-semibold text-text-secondary`.
- **Data rows**: White rows with thin divider line, `text-sm text-text-primary`, no alternating row backgrounds.
- **Hover state**: Subtle color shift to `bg-surface-secondary` on hover.
- **Module alignment**: The progress column must display a compact progress bar alongside the percentage text (e.g. `[Progress Bar] 75%`).

---

## Project Health Evaluation UI

To visually distinguish high-risk projects on the dashboard:
- Display a card header indicator badge.
- If **🔴 High Risk**: Highlight the top border of the card with `border-t-4 border-t-error`.
- If **🟡 At Risk**: Highlight the top border of the card with `border-t-4 border-t-warning`.
- If **🟢 On Track**: Keep normal thin border on all sides.

---

## Empty States

- Required for any dynamic listing (projects list, active modules list, blocker list, activity feed).
- Render a centered layout containing:
  - Slate-colored icon.
  - Descriptive text (e.g., "No active modules found. Click 'Add Module' to begin.").
  - Prominent Call to Action button.

---

## Do Nots

- **No default colors**: Never use Tailwind default values (`bg-blue-500` or `text-red-500`). Use theme-based utility aliases.
- **No mixed font weights**: Do not use bold (`font-bold`) text for body copy or small metadata.
- **No overlapping layers**: Limit overlays to one modal pop-up at a time. Do not stack multiple modal layers.
- **No complex gradients**: Keep card panels flat white. Gradients are reserved only for the dashboard metrics header.
- **No absolute positioning logic for layout**: Never position core navigation or action forms using `fixed` or `absolute` layout offsets; rely strictly on standard Flex and Grid flows.
