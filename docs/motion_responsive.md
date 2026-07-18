# Motion & Responsive Design Specification — Privora (Day 6)

This document defines physics curves, animation timing specs, interactive state shifts, responsive breakpoint rules, and viewport content adaptions.

---

## 1. The Motion System

Our animation system is built to feel clean, light, and modern, preventing layout lag.

### 1.1 Transition & Timing Specifications

| Motion Type | Duration | Easing Curve | CSS Value |
| :--- | :--- | :--- | :--- |
| **Hover Feedback** | `150ms` | Standard ease-in-out | `transition duration-150 ease-in-out` |
| **Modal / Drawer Slide** | `300ms` | Stripe Snappy Bezier | `transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)` |
| **Progress Ring Fill** | `800ms` | Decelerate ease-out | `transition-all duration-800 cubic-bezier(0, 0, 0.2, 1)` |
| **Notifications Fade** | `200ms` | standard ease-out | `transition-opacity duration-200 ease-out` |
| **Inline Check Draw** | `350ms` | Snappy ease-out | `transition-all duration-350 ease-out` |

### 1.2 Shimmer Loading Skeletons
*   Pulsing skeletons use a light grey overlay that shifts back and forth:
    ```css
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton-shimmer {
      background: linear-gradient(90deg, var(--muted) 25%, var(--accent) 50%, var(--muted) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
    }
    ```

### 1.3 Error Shake Form Jitter
*   Forms that fail client-side validations waddle horizontally over `300ms` with keyframes translating by `4px` back and forth. This communicates failure instantly without relying on plain color changes.

---

## 2. Responsive Guidelines & Viewport Breakpoints
We test our layouts across 4 distinct viewport categories:

```text
+------------------+------------------+------------------+------------------+
|      MOBILE      |      TABLET      |      LAPTOP      |     DESKTOP      |
|    < 640px       |  640px - 1024px  | 1024px - 1440px  |    > 1440px      |
+------------------+------------------+------------------+------------------+
| Single-column    | 2-column grids   | 12-col grids     | max-w-7xl limit  |
| Sidebar hidden   | Sidebar hidden   | Sidebar fixed    | Sidebar fixed    |
| Table scrolls    | Table wraps      | Table complete   | Table complete   |
+------------------+------------------+------------------+------------------+
```

### 2.1 Viewport Rules Details

*   **Mobile Viewport (`< 640px`)**:
    *   *Layout*: Full width vertical scrolling stacks. Navigation is hidden behind a top header block containing a hamburger menu button. Side margins are capped at `16px` (`px-4`).
    *   *Components*: Table headers collapse. Only broker name and status display; details are delegated to a full-screen modal drawer overlay.
*   **Tablet Viewport (`640px - 1024px`)**:
    *   *Layout*: Grids change to 2 columns. Sidebar remains hidden, sliding open from the left when clicking the hamburger trigger.
    *   *Components*: Table headers wrap cells. Progress indicators size decreases from `160px` to `120px`.
*   **Laptop Viewport (`1024px - 1440px`)**:
    *   *Layout*: Persistent sidebar navigation displays. Content grids use 12-column layout templates. Margins grow to `32px` (`px-8`).
*   **Desktop Viewport (`> 1440px`)**:
    *   *Layout*: Content container width is capped at `1280px` (`max-w-7xl mx-auto`) to preserve balanced layouts on wide screens.
