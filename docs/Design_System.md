# Design System Specification — Privora

This document defines the core styling variables, typographic hierarchies, grid tokens, and component specifications that form the unified Privora design language (inspired by Vercel, Linear, and Stripe).

---

## 1. Color System (Tailwind CSS Variables Mapping)
We utilize a curated, high-contrast palette based on HSL colors to ensure smooth transitions between Light and Dark modes.

### 1.1 CSS Variables Definitions

```css
/* Color System Tokens */
:root {
  /* Light Mode Palette */
  --background: 240 10% 99%;       /* Slate White */
  --foreground: 240 10% 4%;        /* Near Black */
  
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 4%;
  
  --primary: 250 84% 54%;          /* Premium Indigo */
  --primary-foreground: 210 40% 98%;
  
  --secondary: 240 4.8% 95.9%;     /* Subtle Gray */
  --secondary-foreground: 240 5.9% 10%;
  
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  
  --destructive: 0 84.2% 60.2%;    /* Soft Red */
  --destructive-foreground: 0 0% 98%;

  --border: 240 5.9% 90%;          /* Clean Border Gray */
  --input: 240 5.9% 90%;
  --ring: 250 84% 54%;
  --radius: 0.5rem;                /* 8px */
}

.dark {
  /* Dark Mode Palette */
  --background: 240 10% 3.9%;      /* Deep Slate Black */
  --foreground: 0 0% 98%;          /* Stark White */
  
  --card: 240 10% 6%;              /* Sleek Charcoal Card */
  --card-foreground: 0 0% 98%;
  
  --popover: 240 10% 6%;
  --popover-foreground: 0 0% 98%;
  
  --primary: 250 84% 58%;          /* Electric Violet/Indigo */
  --primary-foreground: 210 40% 98%;
  
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 250 84% 58%;
}
```

---

## 2. Typography & Font Scale
*   **Font Family**: Primary is **Inter** (Sans-Serif), secondary is **Geist Mono** for codes/hashes.
*   **Font Weights**: `Light: 300`, `Regular: 400`, `Medium: 500`, `SemiBold: 600`, `Bold: 700`.

| Token | Size (px) | Line Height | Tracking | Recommended Use |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | 12px (0.75rem) | 16px | +0.01em | Table Metadata, Badges |
| `text-sm` | 14px (0.875rem)| 20px | 0 | Body Copy, Form Labels, Sidebar link |
| `text-base`| 16px (1.0rem) | 24px | -0.011em | Card Paragraphs, Input texts |
| `text-lg` | 18px (1.125rem)| 28px | -0.018em | Section Sub-headings, Large text |
| `text-xl` | 20px (1.25rem) | 28px | -0.021em | Dashboard widget headers |
| `text-2xl`| 24px (1.5rem)  | 32px | -0.022em | Page headers, Modal titles |
| `text-3xl`| 30px (1.875rem)| 36px | -0.022em | Hero sub-headers |
| `text-4xl`| 36px (2.25rem) | 40px | -0.024em | Major Hero titles |

---

## 3. Border Radii & Shadow Systems

### 3.1 Radii
*   `rounded-sm`: `0.125rem` (2px) — Checkboxes, minimal icons.
*   `rounded-md`: `0.375rem` (6px) — Form Inputs, small alerts.
*   `rounded-lg`: `0.5rem` (8px) — Cards, Modals, Buttons. (Default standard)
*   `rounded-full`: `9999px` — Avatar frames, pill-style status badges.

### 3.2 Shadow System
*   `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` — Subtle form elements.
*   `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` — Hover states for cards.
*   `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` — Modals, popovers, dropdown containers.
*   `shadow-ring`: `0 0 0 2px hsl(var(--ring))` — Active keyboard focus rings.

---

## 4. UI Components Specifications

### 4.1 Buttons
*   **Primary Button**: Background: `bg-primary`, Text: `text-primary-foreground`. Hover: `hover:opacity-90`. Active focus rings.
*   **Secondary Button**: Background: `bg-secondary`, Border: `border border-border`. Hover: `hover:bg-accent`.
*   **Destructive Button**: Background: `bg-destructive`, Text: `text-destructive-foreground`. Hover: `hover:bg-destructive/90`.

### 4.2 Inputs
*   Background: `bg-background`, Border: `border border-input`, Text: `text-foreground`.
*   Hover/Focus State: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary`.
*   Error State: Border turns red (`border-destructive`), inline text helper in destructive colors.

### 4.3 Cards
*   Background: `bg-card`, Border: `border border-border`, Text: `text-card-foreground`.
*   Styling: Dynamic hover shadow increases. Content layouts leverage clear flex columns.

### 4.4 Tables
*   Header: Background `bg-muted/50`, uppercase text, bold weights.
*   Borders: Horizontal division only (`border-b border-border`). Hover rows change to `hover:bg-muted/20`.

### 4.5 Modals
*   Overlay: `fixed inset-0 bg-background/80 backdrop-blur-sm`.
*   Content Frame: Centered flex grid, radius `rounded-lg`, shadow `shadow-lg`, animation transition entry `scale-95` to `scale-100`.

---

## 5. Motion Principles (Transition Dynamics)
*   **Duration Scale**:
    *   `fast`: `75ms` — Accordion headers, icon shifts, text-color highlights.
    *   `normal`: `150ms` — Tooltips, dropdown toggles, button interactions.
    *   `smooth`: `300ms` — Modals opening, sidebars collapsing, page shell transitions.
*   **Easing Functions**:
    *   Standard: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out).
    *   Snappy: `cubic-bezier(0.16, 1, 0.3, 1)` (Stripe-like quick response curves).

---

## 6. Responsive Breakpoints
*   **sm**: `640px` (Phone horizontal grid wrappers).
*   **md**: `768px` (Tablets / split views).
*   **lg**: `1024px` (Laptops - sidebar transitions to permanent).
*   **xl**: `1280px` (Desktops - maximum content width constraint caps here).

---

## 7. Accessibility Rules
*   Every interactive element has a minimum size profile of `44x44px` to allow accurate tap interaction.
*   Explicit focus rings (`ring-2 ring-ring`) displayed around buttons, inputs, links, and switches when navigated via key tabs.
*   Forms are linked via explicit tag matching: `<label htmlFor="email">` explicitly references `<input id="email">`.
