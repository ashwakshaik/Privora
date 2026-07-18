# Reusable Component Library Specification — Privora

This document details specifications, Tailwind CSS class configurations, component properties (Props APIs), states, and accessibility rules for all reusable UI components.

---

## 1. Action & Navigation Components

### 1.1 Button (`Button`)
*   **Props**: `variant` ("primary" | "secondary" | "destructive" | "ghost"), `size` ("sm" | "md" | "lg"), `isLoading` (boolean), `disabled` (boolean), `children` (ReactNode), `onClick` (function).
*   **Styling (Tailwind)**:
    *   *Base*: `inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none duration-150`
    *   *Primary*: `bg-primary text-primary-foreground hover:opacity-90 shadow-sm`
    *   *Secondary*: `bg-secondary text-secondary-foreground border border-border hover:bg-accent`
    *   *Ghost*: `hover:bg-accent hover:text-accent-foreground`
    *   *Destructive*: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
    *   *Sizes*: `sm`: `h-9 px-3 text-xs`, `md`: `h-10 px-4 text-sm`, `lg`: `h-11 px-8 text-base`
*   **Accessibility**: Must expose standard keyboard trigger events (`Enter`/`Space`), dynamic `aria-disabled` tracking states, and custom `aria-label` hooks where appropriate.

### 1.2 Sidebar Navigation (`Sidebar`)
*   **Props**: `activeRoute` (string), `onNavigate` (function), `isCollapsed` (boolean).
*   **Styling (Tailwind)**:
    *   *Container*: `w-64 border-r border-border bg-card h-screen flex flex-col justify-between py-6 px-4`
    *   *NavLinks*: `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted duration-150`
    *   *ActiveLink*: `bg-accent text-foreground font-medium`
*   **Accessibility**: Sidebar wrapper maps to standard `<aside>` block containing `<nav role="navigation">`. Focus outline highlights keyboard navigators.

---

## 2. Input & Selection Components

### 2.1 Text Input (`Input`)
*   **Props**: `type` (string), `label` (string), `placeholder` (string), `error` (string), `isRequired` (boolean), `value` (string), `onChange` (function).
*   **Styling (Tailwind)**:
    *   *Label*: `text-xs font-semibold text-muted-foreground mb-1 block`
    *   *Field*: `w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary disabled:opacity-50 transition-shadow duration-150`
    *   *ErrorField*: `border-destructive focus-visible:ring-destructive`
*   **Accessibility**: Label includes explicit `htmlFor` matching input ID. Errors map to `<p id="error-id" aria-live="polite">` structures.

### 2.2 Dropdown / Select Menu (`Dropdown`)
*   **Props**: `options` (Array of objects), `selectedOption` (object), `onChange` (function), `placeholder` (string).
*   **Styling (Tailwind)**:
    *   *Trigger Button*: `flex items-center justify-between w-full h-10 px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:ring-2 focus:ring-ring`
    *   *Dropdown Menu Box*: `absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto`
    *   *Option Item*: `px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors duration-75`

---

## 3. Feedback & Data Display

### 3.1 Stat Card (`StatCard`)
*   **Props**: `title` (string), `value` (string | number), `description` (string), `trend` (number - optional), `icon` (ReactComponent).
*   **Styling (Tailwind)**:
    *   *Wrapper*: `border border-border bg-card p-6 rounded-lg shadow-sm flex items-center justify-between`
    *   *Title Text*: `text-xs font-semibold text-muted-foreground tracking-wider uppercase`
    *   *Value Number*: `text-2xl font-bold text-foreground tracking-tight mt-1`

### 3.2 Toast Notification (`Toast`)
*   **Props**: `message` (string), `type` ("success" | "error" | "info"), `onClose` (function), `duration` (number).
*   **Styling (Tailwind)**:
    *   *Wrapper*: `fixed bottom-4 right-4 z-50 flex items-center space-x-3 bg-card border border-border px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in`
    *   *Icons*: Dynamic green tick (`text-emerald-500`), red warning (`text-destructive`), or blue detail info.
*   **Accessibility**: Container is configured as `<div role="status" aria-live="polite">`. Exposes interactive close `X` trigger with target `aria-label="Dismiss notification"`.

### 3.3 Circular Progress Gauge (`RadialProgress`)
*   **Props**: `value` (number - 0 to 100), `size` (number - size in px), `strokeWidth` (number).
*   **Styling (Tailwind)**:
    *   *Track Circle*: `stroke-secondary fill-none`
    *   *Indicator Circle*: `stroke-primary fill-none transition-all duration-500 ease-out`
    *   *Center Label*: `absolute flex flex-col items-center justify-center`
*   **Accessibility**: Outer element includes `role="progressbar"` with `aria-valuenow={value}` and `aria-valuemin="0"` and `aria-valuemax="100"`.

---

## 4. Overlay & Container structures

### 4.1 Modal Dialog (`Modal`)
*   **Props**: `isOpen` (boolean), `title` (string), `description` (string), `children` (ReactNode), `onClose` (function).
*   **Styling (Tailwind)**:
    *   *Backdrop Overlay*: `fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300`
    *   *Content Window*: `fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-border bg-card p-6 shadow-lg rounded-lg duration-200 animate-in fade-in-0 zoom-in-95`
*   **Accessibility**: Modals integrate a Focus Trap to prevent tab index escapes and close automatically on pressing the `Escape` key.

### 4.2 Loading Skeleton (`Skeleton`)
*   **Props**: `className` (string).
*   **Styling (Tailwind)**:
    *   *Base styling*: `animate-pulse rounded bg-muted/60`
    *   *Usage Examples*:
        *   Text Line: `h-4 w-[250px] bg-muted/60`
        *   Avatar Circle: `h-10 w-10 rounded-full bg-muted/60`
