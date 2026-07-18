# UI/UX Blueprint — Privora

This document outlines structural grids, layout containers, responsive flows, accessibility criteria, and visual interactions for all views.

---

## 1. Page Shell & Layout Systems

We define three core layout shells to wrap our pages:

### 1.1 Marketing Shell (Public Pages)
*   **Grid Structure**: Single-column flex layout with max-width restriction. Content boundaries: `max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto`.
*   **Header**: Sticky transparent header using a backdrop blur effect (`backdrop-blur-md bg-background/80 border-b border-border`).
*   **Content Padding**: Dynamic vertical margins using fluid typography spacings: `py-16 md:py-24 lg:py-32`.
*   **Footer**: Responsive grid switching from 1 column on mobile to 4 columns on desktop with dark/light semantic borders.

### 1.2 Auth Shell (Sign In, Sign Up, Recovery)
*   **Grid Structure**: Dual pane grid system (Desktop-only split screen).
    *   **Left Pane (Desktop Only - 50% width)**: Deep dark modern brand aesthetic featuring animated SVG graphics representing secure firewalls, high-contrast privacy slogans, and trust credentials.
    *   **Right Pane (100% Mobile, 50% Desktop)**: Center-aligned vertical flex stack housing Clerk component wrapper.
*   **Theme Constraints**: Locked to Dark Mode to retain a high-contrast premium security aesthetic, regardless of global theme setting.

### 1.3 App Shell (Protected Dashboard Pages)
*   **Sidebar Navigation (Desktop - Width: 260px)**: Fixed left navigation bar, persistent height (`h-screen`), borders pointing right (`border-r border-border`). Left sidebar toggles into an overlay drawer on mobile.
*   **Main Workspace Window**: Scrollable viewport area (`overflow-y-auto h-screen flex-1`).
    *   **Outer Container**: Integrated breadcrumb navigation bar + notifications drawer button.
    *   **Page Wrapper**: Fluid spacing matching screen margins: `p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto`.
*   **Responsive Transition**: Above 1024px (Desktop): Persistent sidebar. Below 1024px: Sidebar is hidden; header bar exposes a Hamburger menu button which slides the navigation panel in from the left on hover/click.

---

## 2. Page Specifications

### 2.1 Public Landing Page (`/`)
*   **Layout**: Marketing Shell.
*   **Sections**:
    1.  **Hero Section**: Bold typographic hook, primary CTA ("Start Free Scan"), and inline social proof logos.
    2.  **Live Scan Simulator**: Interactive container mimicking real-time database scanning. Shows broker names matching search queries and fading from red to resolved green.
    3.  **Core Features Grid**: Three-column card layout displaying value features (Continuous Monitoring, Auto Opt-Out, Zero-Knowledge Encryption).
    4.  **Privacy Rating Explainer**: Interactive mock dashboard component explaining how the Privacy Score works.
    5.  **Testimonials Slider**: Subtle fade transition container featuring user recommendations.
    6.  **Action CTA**: Deep gradient background box triggering the signup flow.
*   **Interactions**: Hover micro-scaling on CTA buttons, smooth scroll triggers.
*   **Responsive**: Hero image stacks vertically below heading on mobile viewports.

### 2.2 Auth Pages (`/sign-in`, `/sign-up`, `/forgot-password`, `/verify-email`)
*   **Layout**: Auth Shell.
*   **Sections**: Card container centering input fields and oauth triggers.
*   **Interactions**: Focus rings on text inputs, smooth modal slides.
*   **Responsive**: Content spans full-width without the left visual pane on viewports under 1024px.

### 2.3 Dashboard Overview (`/dashboard`)
*   **Layout**: App Shell.
*   **Sections**:
    1.  **Header**: Welcome message widget ("Hello, User Name") + current date ticker.
    2.  **Stats Overview Grid**: 4 columns (or 2 columns on tablet/mobile) showing key counters.
    3.  **Main Panel (Split Grid - 60/40)**:
        *   *Left (60%)*: Privacy Score breakdown. Rendered with custom radial circular progress gauge, score trends line chart, and contextual tips.
        *   *Right (40%)*: Live Action Alert Center. Houses cards displaying recent scans, newly identified broker files, and pending action triggers.
*   **Interactions**: Clicking cards triggers status detail overlays. Radial gauge animates from 0 to actual value on initial page load.

### 2.4 Privacy Scan Page (`/dashboard/scan`)
*   **Layout**: App Shell.
*   **Sections**:
    1.  **Search Input panel**: Form cards with validated inputs (First Name, Last Name, State Selector, Age Group).
    2.  **Scan Simulator**: Renders when scan is running. Displays scanning logs and progress percentage bar.
    3.  **Result Table (Active once scan completes)**: Paginated table containing broker name, severity tag, matched data type badges, and removal trigger action button.
*   **Interactions**: Table rows expand to reveal specific masked records found (e.g. `123** Main St, Ph: (555) ***-1212`).

### 2.5 Removal Center (`/dashboard/removal`)
*   **Layout**: App Shell.
*   **Sections**:
    1.  **Header Metrics**: Count of removal status (Active, In Progress, Completed, Total).
    2.  **Broker List Card Stack**: Searchable list view of data brokers. Shows inline badges matching statuses.
*   **Interactions**: Clicking a broker row slides open a right-side Detail Drawer showing step-by-step audit records (e.g., "Opt-out fax submitted, July 15, 2026").

### 2.6 Privacy Reports (`/dashboard/reports`)
*   **Layout**: App Shell.
*   **Sections**:
    1.  **Historical Trend Area**: Line chart displaying Privacy Score progress over months.
    2.  **PDF Document Archive**: File browser grid showing generated reports. Download button.
*   **Interactions**: Click download trigger to request signed Supabase Storage URL and launch download prompt.

### 2.7 Settings (`/dashboard/settings`)
*   **Layout**: App Shell.
*   **Sections**: Tabs-based panel matching subsections (`Profile`, `Billing`, `Notifications`).
*   **Interactions**: Toast alerts indicating "Settings Saved" upon form submission. Sync billing changes securely to Stripe customer portal.

---

## 3. Responsive Behavior & Breakpoints
Our responsive structure utilizes standard Tailwind media hooks:
*   **Mobile (`< 640px`)**: Single-column vertical scroll layouts. Sidebars are replaced by top header and slide-out drawers. Actions stack vertically.
*   **Tablet (`640px - 1024px`)**: Sidebars are hidden, accessible via drawer. Grids transition to two columns. Tables support side-scrolling or overflow ellipses on long strings.
*   **Desktop (`> 1024px`)**: Persistent sidebar, two or three-column grids, explicit table structures.

---

## 4. Accessibility Specification (a11y)
To match premium standards, the frontend follows strict WAI-ARIA and accessibility rules:
*   **Semantic Elements**: Correct structural wrappers (`<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>`, `<section>`).
*   **ARIA Labels**: All interactive icons lacking visible text (e.g. Close `X` buttons, hamburger toggles) must contain explicit `aria-label` attributes.
*   **Keyboard Navigation**: Tab indexes must preserve a logical visual reading order. Modals must lock focus inside their active frames (`focus trap`) and close on pressing the `Escape` key.
*   **Color Contrast**: All text must comply with WCAG 2.1 AA ratings (minimum contrast ratio of 4.5:1 for body copy and 3:1 for large text headings).

---

## 5. Theme Behavior
*   **Color Preference**: Supports System Default, Light, and Dark settings using `next-themes` and CSS variables.
*   **Transition Controls**: Global transition transitions must not exceed `150ms` (using `transition-colors duration-150 ease-in-out`) to keep theme transitions fast and light.
*   **Variables Sync**: All primary layout blocks read colors from standard theme names (e.g. `--background`, `--foreground`, `--border`, `--card`, `--primary`).
