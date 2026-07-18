# Design System Specification v1 — Privora (Day 2)

This document establishes the UI component layout, spacing grid system, border/shadow rules, and styling behaviors for all core reusable design assets.

---

## 1. Grid & Spacing System
We utilize a strict **4px/8px baseline grid** to ensure visual alignment and proportional vertical rhythms across all components and pages.

### 1.1 Spacing Scale

| Value Token | Size (rem) | Size (px) | Typical Application |
| :--- | :--- | :--- | :--- |
| `space-1` | `0.25rem` | 4px | Padding inside badges, small label gaps |
| `space-2` | `0.5rem` | 8px | Padding inside inputs, checkbox margins |
| `space-3` | `0.75rem`| 12px | List item vertical spacing, button padding |
| `space-4` | `1.0rem`  | 16px | Card padding, small grid gutters |
| `space-5` | `1.25rem` | 20px | Section description margins |
| `space-6` | `1.5rem`  | 24px | Page margins, larger card padding |
| `space-8` | `2.0rem`  | 32px | Grid gutters, page sub-header spacing |
| `space-12`| `3.0rem`  | 48px | Hero vertical spacing gaps |
| `space-16`| `4.0rem`  | 64px | Main page section layout padding |

### 1.2 Layout Grids
*   **Desktop Layout**: 12-column grid system, gutter spacing `24px` (`gap-6`), content area bounded at `max-w-7xl px-8 mx-auto`.
*   **Dashboard Layout**: Split grid structure. Left Sidebar fixed width `260px` (`w-[260px]`), Right Main Viewport uses flexbox filling remaining area (`flex-1`), utilizing standard page layout padding of `24px` (`p-6`).
*   **Mobile Layout**: 1-column responsive stack, gutters `16px` (`gap-4`), side margins `16px` (`px-4`).

---

## 2. Radii & Shadows

### 2.1 Border Radii
*   `radius-sm`: `4px` (`rounded-sm`) — Checkbox frames, mini badges.
*   `radius-md`: `6px` (`rounded-md`) — Text inputs, menu options.
*   `radius-lg`: `8px` (`rounded-lg`) — Standard card frames, buttons, alert banners. (Default)
*   `radius-xl`: `12px` (`rounded-xl`) — Dialog overlays, dropdown wrapper menus.
*   `radius-full`: `9999px` (`rounded-full`) — Avatars, status pills.

### 2.2 Shadow Tokens
*   `shadow-border`: CSS overlay line simulating an outer border:
    `box-shadow: 0 0 0 1px hsl(var(--border))`
*   `shadow-sm`: Used for inputs and static cards:
    `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`
*   `shadow-md`: Primary hover card elevation:
    `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`
*   `shadow-lg`: Applied to Modals, Popovers, and Toast alerts:
    `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)`

---

## 3. UI Components

### 3.1 Buttons (`Button`)
*   **States**:
    *   *Idle*: Full color backgrounds, transitions active (`transition-colors duration-150`).
    *   *Hover*: Background color shifts slightly (`hover:bg-primary/90` or `hover:bg-secondary`).
    *   *Active (Click)*: Scale shrinks slightly (`active:scale-[0.98] transition-transform duration-75`).
    *   *Focus*: Outer ring highlights (`ring-2 ring-ring ring-offset-2`).
    *   *Disabled*: Background becomes gray, click actions locked (`opacity-50 pointer-events-none`).
*   **Types**: Primary, Secondary, Destructive, Ghost, Link.

### 3.2 Inputs & Forms
*   **Input Field**: `bg-background border border-input text-foreground text-sm rounded-lg h-10 px-3 transition-shadow duration-150`
*   **Label**: `text-xs font-semibold text-muted-foreground tracking-wide mb-1 block`
*   **Required Indicator**: Red asterisk (`text-destructive ml-0.5`).
*   **Error State**: Field border changes to `border-destructive`, input shadows change to soft red ring, error text prints below.

### 3.3 Cards (`Card`)
*   **Structure**:
    ```text
    +--------------------------------------------------+
    |  Card Title (text-lg font-semibold)             |
    |  Card Description (text-sm text-muted)           |
    |--------------------------------------------------|
    |                                                  |
    |  Card Content (flex column / text-base)         |
    |                                                  |
    |--------------------------------------------------|
    |  Card Footer Actions (flex justify-end gap-3)    |
    +--------------------------------------------------+
    ```
*   **Classes**: `bg-card text-card-foreground border border-border rounded-lg p-6 shadow-sm`

### 3.4 Badges (`Badge`)
*   **Success Badge**: Background `bg-emerald-500/10`, Text `text-emerald-500`, Border `border border-emerald-500/20`.
*   **Warning Badge**: Background `bg-amber-500/10`, Text `text-amber-500`, Border `border border-amber-500/20`.
*   **Destructive Badge**: Background `bg-destructive/10`, Text `text-destructive`, Border `border border-destructive/20`.
*   **Muted/Neutral Badge**: Background `bg-muted`, Text `text-muted-foreground`.

### 3.5 Tables
*   **Alignment**: Column text aligns left (`text-left`), numbers align right (`text-right`), status tags align center (`text-center`).
*   **Paddings**: Row cells use `py-3 px-4`.
*   **Dividers**: Thin horizontal lines between rows (`border-b border-border`). Hover rows swap to `hover:bg-muted/30`.

### 3.6 Modals & Toasts
*   **Modal Structure**: Flex wrapper centers screen modal body, overlay handles backdrop blur and color fade, modal body scales in snappy bezier motion.
*   **Toast Structure**: Pop box from bottom-right, includes color coding icons, text summaries, and close triggers.
