# Feature Requirements Specification (FRS) — Privora

This document details functional specifications, input/output validation, user actions, success criteria, and error boundaries for each feature module in MVP version 1.

---

## 1. Landing Page (`Landing`)
*   **Purpose**: Introduce the platform value proposition, demonstrate data vulnerability, and drive registrations.
*   **Inputs**: None (Public promotional view).
*   **Outputs**: Visual marketing blocks, interactive pricing comparisons, client-side exposure scanning simulator.
*   **Validation**: None.
*   **User Actions**:
    *   Click "Start Free Scan" (Redirects to `/sign-up`).
    *   Toggle Pricing slider between Free and Pro billing.
    *   Click brand links, footer navigation, and security documentation.
*   **Success Criteria**: Page load under `800ms`, responsive rendering, click-through rates tracking correctly in PostHog.
*   **Error Handling**: Fail-safe static mock renders if dynamic statistics counters (total records deleted) fail to load from backend Supabase edge functions.

---

## 2. Authentication (`Auth`)
*   **Purpose**: Secure entry point utilizing Clerk auth hooks.
*   **Inputs**:
    *   *Sign Up*: Email Address, Password, First Name, Last Name.
    *   *Sign In*: Email Address, Password.
    *   *Recovery*: Email Address.
*   **Outputs**: JWT authentication token (Client), profile creation webhook trigger (Database).
*   **Validation**:
    *   Email: Must conform to standard email regex syntax (`^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$`).
    *   Password: Minimum 8 characters, containing at least 1 uppercase letter, 1 number, and 1 special character.
*   **User Actions**:
    *   Submit login credentials / sign up form.
    *   Trigger Google OAuth login button.
    *   Submit email reset verification link request.
*   **Success Criteria**: User authenticated, redirect to `/dashboard`, Clerk-to-Supabase user record synchronization completes within `2 seconds`.
*   **Error Handling**:
    *   *Invalid Credentials*: Renders inline descriptive label ("Incorrect email or password").
    *   *Password Weakness*: Highlights specific missing security rules below input.
    *   *Network Timeout*: Banner alert instructing user to verify connection and retry.

---

## 3. Dashboard Overview (`Dashboard`)
*   **Purpose**: Provide key summary statistics of personal exposure status, privacy score, and pending removal requests.
*   **Inputs**: User Auth Session Token.
*   **Outputs**:
    *   Overall Privacy Score (Integer: 0 to 100).
    *   Aggregate counters (Scanned, Exposed, Removed, In Progress).
    *   Recent Action Alert logs list.
*   **Validation**: Validate authentication token expiry on page reload.
*   **User Actions**:
    *   Click "Run New Scan" (Navigates to `/dashboard/scan`).
    *   Click removal count details widget (Navigates to `/dashboard/removal`).
    *   Acknowledge alerts by clicking the close button.
*   **Success Criteria**: Real-time load of all database counters within `400ms` using optimized Supabase PostgreSQL indexes.
*   **Error Handling**:
    *   *Unauthenticated*: Redirect user immediately to `/sign-in` via middleware.
    *   *Database Offline*: Render skeleton loading structures and persistent toast indicating connection retry attempt.

---

## 4. Privacy Scan (`Scan`)
*   **Purpose**: Search broker lists to locate records match criteria.
*   **Inputs**: First Name, Last Name, Middle Initial (Optional), Current State, Current City, Estimated Age Range.
*   **Outputs**: Structured list of matching data brokers exposing records, severity flags, match type indicators (e.g., Address, Phonenumber).
*   **Validation**:
    *   First & Last Name: Max 50 characters, letters only, no special symbols.
    *   State: Valid two-letter state code.
    *   City: Max 100 characters.
*   **User Actions**:
    *   Enter search criteria and click "Start Scan".
    *   Click "Request Removal" on individual search matches.
*   **Success Criteria**: Simulation animation processes correctly, updates results list, recalculates Privacy Score, and hashes parameters to preserve search privacy.
*   **Error Handling**:
    *   *Missing Parameters*: Form block prevents submission, highlighting required inputs.
    *   *Scan Failure*: Standard error alert triggers advising retry after 60 seconds.

---

## 5. Privacy Score Matrix (`Score`)
*   **Purpose**: Calculate a clear, objective privacy health metric based on active exposures.
*   **Inputs**: List of active scan results matching user.
*   **Outputs**: Weighted integer score (`0-100`) where 100 indicates zero found exposures.
*   **Validation**: Recalculated dynamically on change in database states (new exposure found, removal request resolved).
*   **Formula Logic**:
    *   Base score starts at `100`.
    *   Each active exposure subtracts a value based on severity category:
        *   *High Severity (Home Address, Phone Number)*: `-8` points per exposure.
        *   *Medium Severity (Email, Public Profile links)*: `-3` points per exposure.
    *   Minimum possible score is capped at `0`.
*   **User Actions**: None (Read-only display widget).
*   **Success Criteria**: Mathematical calculation executes instantly without network delay.
*   **Error Handling**: Null states in exposures default score render to `100`.

---

## 6. Removal Center (`Removal`)
*   **Purpose**: Track and automate opt-out submissions across data brokers.
*   **Inputs**: Selected search match ID, user authorization signature token (Pro tier only).
*   **Outputs**: Opt-out request status record updates in Supabase database (`Pending` -> `In Progress` -> `Completed`).
*   **Validation**: Automated removal tracking is blocked unless user holds active Stripe Pro plan subscription state.
*   **User Actions**:
    *   Toggle "Autopilot" (Enables automated opt-out submissions).
    *   Click "Manual Opt-out Instructions" (Free users).
    *   Click broker row to open detail tracking side-sheet drawer.
*   **Success Criteria**: Status updates persist reliably in DB, automated emails/faxes queued for delivery to broker.
*   **Error Handling**:
    *   *Broker Rejection*: Mark status as `Refused`, alert user with instructions on how to handle manual validation.
    *   *Stripe Expiry*: Prompt billing update card if user tries to trigger automatic removal after payment card failure.

---

## 7. Privacy Reports (`Reports`)
*   **Purpose**: Provide regular visual summaries and downloadable PDF documentation of the user's progress.
*   **Inputs**: Date Range, User ID.
*   **Outputs**:
    *   Score tracking line graph.
    *   Generated monthly PDF report.
*   **Validation**: PDF reports must be access-controlled via private Supabase Storage signed URLs.
*   **User Actions**:
    *   Click "Download PDF".
    *   Change report date ranges.
*   **Success Criteria**: PDFs are generated dynamically, uploaded to storage, and temporary signed URLs expire exactly 15 minutes after generation.
*   **Error Handling**:
    *   *Download Link Expired*: Clicking trigger refreshes URL signature in the background and launches download.
    *   *Missing Data*: Display empty state placeholder graph if no historical scans exist for range.

---

## 8. User Settings (`Settings`)
*   **Purpose**: Manage user details, billing state, and notification switches.
*   **Inputs**:
    *   *Profile*: Name, primary search emails.
    *   *Billing*: Subscription plans.
    *   *Notifications*: Checkbox states.
*   **Outputs**: Updated profile record in database, redirect to Stripe customer portal, updated notification flags.
*   **Validation**: Ensure profile inputs don't violate character limits; Stripe API integration verifies session state.
*   **User Actions**:
    *   Submit Profile edit form.
    *   Click "Manage Billing" (Redirects to billing portal page).
    *   Toggle alert thresholds.
*   **Success Criteria**: Database writes return status success, UI changes update dashboard settings panel.
*   **Error Handling**:
    *   *Update Failure*: Toast message stating "Failed to save settings. Please try again."
    *   *Stripe Integration Issue*: Error message stating "Billing portal unreachable. Please contact support."
