# Complete UI Design Plan — Privora

This document defines page states, section grids, components, empty layouts, loading skeletons, and error displays for all application views.

---

## 1. Landing Page (`/`)
*   **Sections**:
    *   **Navbar**: Wordmark logo, Features link, Security framework link, Pricing, "Sign In" link, "Start Free Scan" primary CTA.
    *   **Hero**: Main caption header, subtitle details, email input + CTA button inline, product mock image wrapper.
    *   **Broker Radar**: Live mock animation rendering search exposure metrics.
    *   **Feature List Grid**: 3-column feature layout blocks.
    *   **Pricing Grid**: Free vs Pro side-by-side subscription panels.
    *   **Footer Links**: Legal notices, social tags, security standards badges.
*   **Components**: `Button`, `Input`, `Navbar`, `Footer`, `PricingCard`, `RadarSimulator`.
*   **User Actions**: Click navigation items, input mock email address to start onboarding, toggle pricing options.
*   **Empty States**: N/A (Marketing site).
*   **Loading States**: Client transitions render header blur backdrop, image assets lazy-load with neutral gray background spacers.
*   **Error States**: Form validations trigger red input borders and pop text tooltips if invalid emails are submitted.

---

## 2. Authentication Pages (`/sign-in` & `/sign-up`)
*   **Sections**: Split-pane layout. Left pane shows rotating security slides; right pane renders Clerk container.
*   **Components**: `AuthCard`, `TextInput`, `Button`, `SocialLoginButton`.
*   **User Actions**: Input login credentials, toggle "Show Password", click OAuth login targets, click forgot password link.
*   **Empty States**: N/A.
*   **Loading States**: Clerk components render customized shimmering logo loader overlays while validating network tokens.
*   **Error States**: Red accent warning boxes are generated above inputs detailing incorrect credentials or connection failures.

---

## 3. Dashboard Overview (`/dashboard`)
*   **Sections**: Page header title, Stats grid (4 metric boxes), main body split grid (radial score gauge on left, recent alert list on right).
*   **Components**: `Sidebar`, `Breadcrumb`, `StatCard`, `RadialProgress`, `ActivityFeed`, `NotificationBadge`.
*   **User Actions**: Trigger "Start New Scan", click alert list rows, click sidebar options.
*   **Empty States**: If no scans have been performed yet, score gauge displays a dotted circle outline with CTA "Initiate Initial Privacy Scan to calculate rating".
*   **Loading States**: Stat cards and progress gauge display animated skeleton block overlays (`animate-pulse` bg gray-100/dark:gray-800).
*   **Error States**: Global database connection failures generate absolute header banner: "Unable to sync real-time exposures. Retrying connection...".

---

## 4. Privacy Scan Page (`/dashboard/scan`)
*   **Sections**: Search criteria input panel (form), scan execution progress terminal, search results table.
*   **Components**: `SearchForm`, `ProgressMeter`, `DataTable`, `Badge`, `Button`.
*   **User Actions**: Submit search form, select/sort results columns, click "Queue Auto-Removal".
*   **Empty States**: Results block states: "Submit search inputs above to query active broker records."
*   **Loading States**: Progress terminal shows active logs ("Searching Whitepages...", "Querying Radaris...") alongside a running percentage loading bar.
*   **Error States**: Form validation displays inline input tags if required criteria fields are left blank.

---

## 5. Removal Center (`/dashboard/removal`)
*   **Sections**: Header counter widgets, status filter tab selector (`All`, `Exposed`, `In Progress`, `Removed`), paginated cards list, details slide-out drawer.
*   **Components**: `RemovalCard`, `TabsList`, `StatusIndicator`, `SidebarDrawer`, `AutopilotToggle`.
*   **User Actions**: Toggle autopilot switch, search list items by name, click card to open detailed trace log drawer.
*   **Empty States**: "No active exposures found. Your digital footprint is clean!" (Green icon verification banner).
*   **Loading States**: Cards list displays vertical row of 5 pulsing skeleton loading blocks.
*   **Error States**: Active action button displays: "Upgrade to Pro to automate removals" if user tier matches standard Free level.

---

## 6. Privacy Reports Page (`/dashboard/reports`)
*   **Sections**: Page description, historical trend timeline chart, list grid of monthly report downloads.
*   **Components**: `TrendChart`, `ReportCard`, `DownloadButton`.
*   **User Actions**: Hover timeline nodes to read score history, click report cards to download.
*   **Empty States**: "Your first monthly summary report will be generated on [Date]." (Rendered inside a dotted layout container).
*   **Loading States**: Trend chart shows neutral grey container skeleton while database aggregates complete query runs.
*   **Error States**: If PDF files fail to generate, card status changes to "Failed. Click to regenerate."

---

## 7. Settings Page (`/dashboard/settings`)
*   **Sections**: Sub-navigation tabs (`Profile`, `Billing`, `Notifications`), settings content boxes.
*   **Components**: `TabsContainer`, `ProfileForm`, `BillingCard`, `NotificationSettingsGrid`, `StripePortalButton`.
*   **User Actions**: Modify text inputs, check/uncheck alert thresholds, click Billing portal redirect.
*   **Empty States**: N/A.
*   **Loading States**: Billing details panel displays loading spinner while calling backend Clerk/Stripe session scripts.
*   **Error States**: Error messages display if updating profiles violates validations or Stripe API connections fail.
