# UI Tokens

Design tokens for DevFlow. All colors, typography, spacing, and component values are structured below. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-accent` → `bg-accent`, `text-accent`, `border-accent`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#F8FAFC] text-[#0F172A]"

// Never — raw Tailwind color classes
className="bg-indigo-500 text-slate-600"
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f8fafc; /* light slate */
  --color-surface: #ffffff;
  --color-surface-secondary: #f1f5f9;
  --color-surface-tertiary: #e2e8f0;
  --color-surface-muted: #f8fafc;

  /* Borders */
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  --color-border-muted: #cbd5e1;

  /* Text */
  --color-text-primary: #0f172a; /* Slate 900 */
  --color-text-secondary: #475569; /* Slate 600 */
  --color-text-muted: #94a3b8; /* Slate 400 */
  --color-text-dark: #334155; /* Slate 700 */
  --color-text-darkest: #0f172a;
  --color-text-black: #020617; /* Slate 950 */

  /* Primary accent — Violet */
  --color-accent: #7c3aed; /* Violet 600 */
  --color-accent-dark: #6d28d9; /* Violet 700 */
  --color-accent-light: #ddd6fe; /* Violet 200 */
  --color-accent-muted: #f5f3ff; /* Violet 50 */
  --color-accent-foreground: #ffffff;

  /* Success / Completed — Emerald */
  --color-success: #10b981; /* Emerald 500 */
  --color-success-dark: #047857; /* Emerald 700 */
  --color-success-light: #d1fae5; /* Emerald 100 */
  --color-success-lightest: #f0fdf4; /* Emerald 50 */
  --color-success-foreground: #047857;

  /* Info / In Progress — Blue */
  --color-info: #3b82f6; /* Blue 500 */
  --color-info-dark: #1d4ed8; /* Blue 700 */
  --color-info-light: #dbeafe; /* Blue 100 */
  --color-info-lightest: #eff6ff;
  --color-info-foreground: #1d4ed8;

  /* Warning / Due Soon — Amber */
  --color-warning: #d97706; /* Amber 600 */
  --color-warning-light: #fef3c7; /* Amber 100 */
  --color-warning-foreground: #78350f;

  /* Error / Overdue / High Risk — Rose */
  --color-error: #e11d48; /* Rose 600 */
  --color-error-light: #ffe4e6; /* Rose 100 */
  --color-error-foreground: #9f1239;

  /* Dark overlays */
  --color-overlay: #0f172a;
  --color-overlay-dark: #020617;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ----------------- | ---------------------- |
| Page background   | `bg-background`        |
| Card / surface    | `bg-surface`           |
| Secondary surface | `bg-surface-secondary` |
| Default border    | `border-border`        |
| Light border      | `border-border-light`  |

### Typography

| Element                | Token                           |
| ---------------------- | ------------------------------- |
| Headings, primary text | `text-text-primary` (#0F172A)   |
| Secondary text, labels | `text-text-secondary` (#475569) |
| Placeholder, muted     | `text-text-muted` (#94A3B8)     |
| Dark labels            | `text-text-dark` (#334155)      |

### Accent (Primary Violet)
Used for: primary buttons, active nav items, project selection highlight, focus rings.

| Element                | Token                    |
| ---------------------- | ------------------------ |
| Button background      | `bg-accent`              |
| Button text            | `text-accent-foreground` |
| Light badge background | `bg-accent-light`        |
| Subtle background      | `bg-accent-muted`        |

---

## Progress State Badge Styles

| State          | Background               | Text                        | Border (Optional)     |
| -------------- | ------------------------ | --------------------------- | --------------------- |
| `Not Started`  | `bg-surface-secondary`   | `text-text-secondary`       | `border-border`       |
| `In Progress`  | `bg-info-light`          | `text-info-foreground`      | `border-info-light`   |
| `Review`       | `bg-accent-muted`        | `text-accent`               | `border-accent-light` |
| `Completed`    | `bg-success-lightest`    | `text-success-foreground`   | `border-success-light`|
| `Blocked`      | `bg-error-light`         | `text-error-foreground`     | `border-error-light`  |

---

## Deadline Status Indicators

| Status       | Color  | Token                              | Trigger Condition                  |
| ------------ | ------ | ---------------------------------- | ---------------------------------- |
| 🟢 `On Track` | Green  | `text-success` / `bg-success-light` | Deadline is > 3 days away          |
| 🟡 `Due Soon` | Yellow | `text-warning` / `bg-warning-light` | Deadline is within 3 days          |
| 🔴 `Overdue`  | Red    | `text-error` / `bg-error-light`    | Deadline is in the past            |

---

## Project Health Indicator

| Health         | Color  | Token                              | Description                        |
| -------------- | ------ | ---------------------------------- | ---------------------------------- |
| 🟢 `On Track`   | Green  | `text-success`                     | Progress matches or leads timeline |
| 🟡 `At Risk`    | Yellow | `text-warning`                     | Timeline leads progress by 1-20%   |
| 🔴 `High Risk`  | Red    | `text-error`                       | Timeline leads progress by > 20%   |

---

## Typography

| Element              | Size | Weight | Line height | Color token           |
| -------------------- | ---- | ------ | ----------- | --------------------- |
| Logo text            | 19px | 700    | 28px        | `text-text-black`     |
| Stat number          | 30px | 600    | 36px        | `text-text-primary`   |
| Section heading      | 16px | 600    | 24px        | `text-text-primary`   |
| Nav item (active)    | 14px | 500    | 20px        | `text-accent`         |
| Nav item (inactive)  | 14px | 500    | 20px        | `text-text-secondary` |
| Card label           | 14px | 500    | 20px        | `text-text-secondary` |
| Body / content text  | 14px | 400    | 20px        | `text-text-primary`   |
| Badge text           | 12px | 500    | 16px        | Varies by state       |
| Timestamp / muted    | 12px | 400    | 16px        | `text-text-muted`     |

Font family: **Inter** — import from Google Fonts or use `next/font/google`.

---

## Spacing

| Token       | Value      | Usage                 |
| ----------- | ---------- | --------------------- |
| `gap-1`     | 4px        | Tight gaps            |
| `gap-2`     | 8px        | Badge and tag gaps    |
| `gap-3`     | 12px       | Form field gaps       |
| `gap-4`     | 16px       | Card internal gaps    |
| `gap-6`     | 24px       | Between cards         |
| `gap-8`     | 32px       | Page section gaps     |
| `p-4`       | 16px       | Inner card padding    |
| `p-6`       | 24px       | Large card padding    |
| `px-4 py-2` | 16px / 8px | Button standard padding|
| `px-3 py-1` | 12px / 4px | Badge standard padding|

---

## Component Tokens

### Cards
```
background: bg-surface
border: 1px solid var(--color-border)
border-radius: 16px (rounded-2xl)
padding: 24px (p-6)
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
```

### Buttons
**Primary:**
```
background: bg-accent
hover: bg-accent-dark
text: text-accent-foreground
border-radius: rounded-lg
padding: px-4 py-2
font-weight: font-medium
```

**Secondary:**
```
background: bg-surface
border: 1px solid var(--color-border)
hover: bg-surface-secondary
text: text-text-primary
border-radius: rounded-lg
padding: px-4 py-2
```

**Ghost:**
```
background: transparent
text: text-text-secondary
hover: bg-surface-secondary
border-radius: rounded-lg
```

### Input Fields
```
background: bg-surface
border: 1px solid var(--color-border)
border-radius: rounded-lg
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-muted
focus: ring-2 ring-accent border-transparent outline-none
```

### Badges
```
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

### Module Progress Bar
```
background track: bg-border
fill: bg-accent (or state-specific color like bg-success for 100%)
height: 6px
border-radius: rounded-full
```

---

## Invariants

- Never use raw CSS hex values or Tailwind default color classes (`bg-purple-500`) — always use theme variables defined in `@theme` in `app/globals.css`.
- Font family is Inter — load in root layout.
- The default border is always `border-border` (`#e2e8f0`).
- No gradients on component card backgrounds.
