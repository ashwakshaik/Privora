# Motion Design System — Privora

This document defines page transitions, hover interactions, loading indicators, success/error feedback loops, scroll animations, and system-wide motion principles. All motions follow an elegant, minimal, and meaningful design language (inspired by Stripe and Linear).

---

## 1. Core Principles
1.  **Restraint First**: Animations must never delay a user action. Taps, clicks, and page navigations should feel snappy.
2.  **Physical Integrity**: UI elements should slide or fade along logical physical axes (e.g. sidebar menu drawer slides in from the left edge; settings modals scale up from the center).
3.  **Hardware Optimization**: Always animate using GPU-accelerated attributes (`transform: translate3d/scale`, `opacity`). Avoid animating sizes (`width`, `height`, `margin`) to prevent browser layout reflows.
4.  **A11y Respect**: Respect user system preferences. If a browser reports `prefers-reduced-motion: reduce`, all transitions drop to instant shifts.

---

## 2. Animation Token Catalog

### 2.1 Easing Curves
*   **Standard (Snappy)**: `cubic-bezier(0.16, 1, 0.3, 1)` (Stripe curve). Used for navigation items, menus, and layout transitions.
*   **Decelerate (Out)**: `cubic-bezier(0, 0, 0.2, 1)`. Used for elements entering the screen.
*   **Accelerate (In)**: `cubic-bezier(0.4, 0, 1, 1)`. Used for elements exiting the screen.

### 2.2 Duration Tokens
*   `duration-75` (75ms): Micro-feedbacks (checkbox ticks, text color shifts).
*   `duration-150` (150ms): Hover indicators, active button state transitions, tooltips.
*   `duration-300` (300ms): Modals opening, sidebars toggling, page route swaps.

---

## 3. Motion Specs by Use Case

### 3.1 Page Transitions
*   **Behavior**: Smooth fade and light vertical lift when changing routes.
*   **Framer Motion Spec**:
    ```javascript
    const pageTransition = {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
    };
    ```
*   **Fallback (CSS)**: `.page-transition { transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms; }`

### 3.2 Hover Animations
*   **Action Buttons**: Light background highlight shifts, inline arrow icons shift right by `3px` (`transition-transform group-hover:translate-x-0.5 duration-150`).
*   **Card Hover (Grid)**: Scale transforms should not exceed `1.015`. A subtle shadow increases to mimic physical card elevation:
    `transition-all hover:scale-[1.015] hover:shadow-md hover:border-muted-foreground/30 duration-200`

### 3.3 Loading & Skeleton Animations
*   **Progress Meter**: Scans display percentage updates that animate using a smooth ease-out transitions (`transition-all duration-500 ease-out`).
*   **Skeleton Shimmer**: Pulsing light grey backgrounds loop continuously.
    `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }`
    `.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`

### 3.4 Success & Error Feedbacks
*   **Success Checkmark Alert**: Radial circular checkmarks draw their paths using SVG stroke-dashoffset transitions over `350ms`, followed by a brief toast slide-in from the bottom-right.
*   **Error Shake**: Input submission errors trigger horizontal jitter shakes on target form blocks to notify users:
    ```css
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.3s ease-in-out; }
    ```

### 3.5 Dashboard Animations
*   **Circular Progress Gauge**: On dashboard mount, the Privacy Score circular dial fills from 0 to target score (e.g. 75%) over `800ms` using standard snappy bezier curves.
*   **Drawer Sidebar Slide**: Detail drawers slide in from the right edge with dynamic overlays:
    *   *Drawer container*: `translate-x-full` (initial) to `translate-x-0` (active) over `300ms` with Stripe bezier curves.
    *   *Backdrop Overlay*: Fades in from `opacity-0` to `opacity-50` over `300ms`.
