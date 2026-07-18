# Development Blueprint — Privora

This document serves as the developer handbook for building Privora, outlining structural layouts, coding standards, coding naming conventions, Git branching systems, environment configurations, and the detailed 10-week Sprint Plan.

---

## 1. Directory Structure Map
The codebase will follow a standard modular structure:

```text
Privora/
├── .github/
│   └── workflows/
│       ├── test.yml            # CI pipeline (lint, typecheck, unit test)
│       └── deploy.yml          # CD pipeline (deploy on main merge)
├── docs/                       # Product Architecture & Design Specs (Tasks 1-10)
├── public/                     # Static assets (fonts, SVGs, manifest)
├── src/
│   ├── app/                    # Next.js App Router (Layouts & Pages)
│   ├── components/
│   │   ├── ui/                 # Core atomic components (shadcn imports)
│   │   └── shared/             # Composite widgets (Navbar, Charts, Forms)
│   ├── hooks/                  # Custom React hooks (e.g., useScan, useAuthSync)
│   ├── lib/                    # Supabase, Stripe, Resend client utilities
│   └── styles/
│       └── globals.css         # Tailwind styles & global HSL variables
├── supabase/
│   ├── migrations/             # SQL schema version files
│   └── config.toml             # Local emulation settings
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

---

## 2. Coding Standards & Naming Conventions

### 2.1 Coding Rules
*   **Language**: Strict TypeScript. No `any` type usage is permitted.
*   **Components**: Prefer React Server Components (RSC) for pages and layout shells. Use Client Components (`"use client"`) only when user interactivity (state, hooks, browser events) is required.
*   **Imports**: Organize imports sequentially: standard React core libraries first, followed by Next.js components, third-party libraries, local components, and style directories.

### 2.2 Naming Conventions
*   **React Components**: PascalCase (e.g. `RadialProgress.tsx`, `StatCard.tsx`).
*   **Custom Hooks**: camelCase prefixed with `use` (e.g. `usePrivacyScore.ts`).
*   **Utility Modules**: lowercase or camelCase (e.g. `supabase.ts`, `stripeHelpers.ts`).
*   **Database Tables & Columns**: lower_snake_case (e.g. `privacy_scores`, `overall_score`).

---

## 3. Git Workflow
*   **Primary Branches**:
    *   `main`: Mirror of the production deployment. Protected from direct writes.
    *   `dev`: Integration branch for testing and sprint assembly.
*   **Feature Branches**: Created off `dev`, using the prefix `feat/`, `fix/`, or `chore/` (e.g. `feat/clerk-auth-integration`).
*   **Pull Requests**: Must pass the GitHub Actions CI check (ESLint, TypeScript compiling, and Prettier checks) and require one technical review sign-off before merging into `dev`.
*   **Commit Message Convention**: Conventional Commits standard:
    *   `feat: add circular score indicator widget`
    *   `fix: resolve memory leak in scan progress hook`
    *   `chore: bump next-themes package version`

---

## 4. Environment Variables Template (`.env.example`)
Create a `.env.local` in the project root containing these variables:

```bash
# Next.js Client Environment Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-never-share

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Resend Transactional Email API Key
RESEND_API_KEY=re_...

# Stripe Billing keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# PostHog Analytics Client
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry Quality Monitoring DSN
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 5. Deployment Flow (CI/CD)
1.  **Local Dev**: Run `npm run dev` alongside supabase emulation (`supabase start`).
2.  **Pull Request**: Creating a PR triggers Vercel to compile a dynamic preview deployment URL, which run checks against active Supabase DB schema changes.
3.  **Merge to Dev**: Commits are validated inside standard staging sandbox environment.
4.  **Production Release**: Merging `dev` into `main` executes final production build checks, uploads static assets to Cloudflare DNS configurations, and runs migrations on Supabase production schema.

---

## 6. The 10-Week Sprint Roadmap

```mermaid
gantt
    title Privora 10-Week Sprint Timeline
    dateFormat  YYYY-MM-DD
    section Foundation & Design
    Phase 1: Product Foundation (Week 1) :active, p1, 2026-07-15, 7d
    Phase 2: Design System Spec (Week 2)  : p2, after p1, 7d
    Phase 3: UI Mockup Blueprints (Week 3) : p3, after p2, 7d
    section Development
    Phase 4: Frontend Shell Build (Week 4) : p4, after p3, 7d
    Phase 5: Clerk Auth Integration (Week 5) : p5, after p4, 7d
    Phase 6: Supabase Database Setup (Week 6) : p6, after p5, 7d
    Phase 7: Core Feature Assembly (Week 7)  : p7, after p6, 7d
    section Launch & Optimization
    Phase 8: Integrations Setup (Week 8)    : p8, after p7, 7d
    Phase 9: Quality Testing & Debug (Week 9) : p9, after p8, 7d
    Phase 10: Production Deployment (Week 10) : p10, after p9, 7d
```

### Phase Details

*   **Phase 1: Product Foundation (Week 1) [CURRENT PHASE]**
    *   *Deliverables*: PDD (Product Definition), System Architecture, Information Architecture, Feature Lists, User Stories, Tech Stack Freeze, Sprint Plan.
    *   *Goal*: Complete product and engineering blueprint definition.
*   **Phase 2: Design System Spec (Week 2)**
    *   *Deliverables*: Setup unified color variables, typography assets, button layouts, cards structure, input tokens, tables, theme switches, custom icons list, and motion ease tokens inside documentation maps.
*   **Phase 3: UI Mockup Blueprints (Week 3)**
    *   *Deliverables*: Mock layouts and page mock charts for Landing, Login, Register, Dashboard overview, Scan window, Reports list, Removal center, and Settings views.
*   **Phase 4: Frontend Shell Build (Week 4)**
    *   *Deliverables*: Static pages layouts in Next.js 15. Create responsive Navbar, Footer, App sidebars, and fluid containers. Disable backend APIs.
*   **Phase 5: Clerk Auth Integration (Week 5)**
    *   *Deliverables*: Integrate Clerk provider. Setup Register, Login, Forgot Password, and Email Verification route flows using Clerk's custom pages.
*   **Phase 6: Supabase Database Setup (Week 6)**
    *   *Deliverables*: Execute SQL migrations to initialize Tables (Users, Scans, Reports, Scores, Settings), Row Level Security (RLS) policies, and synchronize Clerk Auth webhooks.
*   **Phase 7: Core Feature Assembly (Week 7)**
    *   *Deliverables*: Connect frontend components to database. Enable dynamic Privacy Scan simulator, Privacy Score calculation script, Removal center table updates, PDF download hooks, and user settings changes.
*   **Phase 8: Integrations Setup (Week 8)**
    *   *Deliverables*: Wire up Resend API (email notifications), Stripe subscriptions billing checkout, PostHog custom page tracking, and Sentry catch-all tracking logs.
*   **Phase 9: Quality Testing & Debug (Week 9)**
    *   *Deliverables*: Execute performance audit tests, verify responsive display bugs, validate WCAG accessibility rules, verify data leak vulnerability protections.
*   **Phase 10: Production Deployment (Week 10)**
    *   *Deliverables*: Hook Vercel hosting to main repository, point DNS rules to Cloudflare, configure SSL certificates, write meta tags and sitemaps to optimize SEO settings.

---

## 7. Production Launch Checklist
- [ ] Enable Supabase RLS policies across all tables.
- [ ] Swap Clerk sandbox secret keys to production keys.
- [ ] Verify Stripe webhook signatures are validated.
- [ ] Lock environment variables values inside Vercel console configuration.
- [ ] Run Core Web Vitals audit to confirm performance grades remain above 95.
- [ ] Verify SSL configurations are active and secure on Cloudflare DNS.
