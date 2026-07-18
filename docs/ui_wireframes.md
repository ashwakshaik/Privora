# UI Wireframes Specification — Privora (Day 4)

This document contains low-fidelity structural ASCII wireframe layouts for all 11 pages of Privora, detailing layout containers, sidebar elements, forms, list alignments, and action placements.

---

## 1. Public Pages (Marketing & Auth)

### 1.1 Marketing Landing Page (`/`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora             Features   Pricing   Security   [Login] [Start Scan] |
+-----------------------------------------------------------------------------+
|                                                                             |
|                      Gain Control of Your Digital Footprint                 |
|            Privora automatically monitors and removes your personal         |
|                     records from hundreds of online data brokers.           |
|                                                                             |
|                        [ Enter Email Address ] [ Start Free Scan ]          |
|                                                                             |
|        +------------------------------------------------------------+       |
|        | [Portal Radar Simulation - Scanning Broker Database Logs]  |       |
|        | Query: John Doe | State: CA                               |       |
|        | Searching whitepages.com... Record Matched [x] (Exposed)   |       |
|        +------------------------------------------------------------+       |
|                                                                             |
+-----------------------------------------------------------------------------+
| [Continuous Guarding]        [Automated Requests]      [Zero-Knowledge Sync]|
| Checks databases monthly.    No manual legal forms.     PII encrypted.      |
+-----------------------------------------------------------------------------+
|                                                                             |
|                            Choose Your Privacy Tier                         |
|             [Monthly / Annual Billing Toggle]                               |
|                                                                             |
|        +-------------------------+      +-------------------------+         |
|        | FREE TIER               |      | PRO AUTOPILOT           |         |
|        | Scan and list exposures |      | Auto opt-out submissions|         |
|        | Manual guide checklist  |      | Continuous guarding     |         |
|        |                         |      | Monthly PDF reports     |         |
|        |       [ Get Started ]   |      |      [ Upgrade Now ]    |         |
|        +-------------------------+      +-------------------------+         |
|                                                                             |
+-----------------------------------------------------------------------------+
| privora (c) 2026      Features | Pricing      Privacy Policy | Terms        |
+-----------------------------------------------------------------------------+
```

### 1.2 Sign-In / Login Page (`/sign-in`)
```text
+-----------------------------------+-----------------------------------------+
|                                   |                                         |
|                                   |                 privora                 |
|                                   |                                         |
|                                   |              Welcome Back               |
|                                   |        Enter details to sign in.        |
|                                   |                                         |
|          [ VISUAL PANE ]          |        Email Address                    |
|                                   |        [___________________________]    |
|       Sleek Security Graphic      |                                         |
|                                   |        Password                         |
|     "Your data boundary,          |        [___________________________]    |
|      monitored in real-time."     |                                         |
|                                   |        [x] Remember me   Forgot password?|
|                                   |                                         |
|                                   |              [ Sign In ]                |
|                                   |                                         |
|                                   |         -- or continue with --          |
|                                   |            [ Google OAuth ]             |
|                                   |                                         |
|                                   |       Don't have an account? Sign up    |
+-----------------------------------+-----------------------------------------+
```

### 1.3 Sign-Up / Register Page (`/sign-up`)
```text
+-----------------------------------+-----------------------------------------+
|                                   |                                         |
|                                   |                 privora                 |
|                                   |                                         |
|                                   |            Create Account               |
|                                   |        Begin your privacy scan.         |
|                                   |                                         |
|          [ VISUAL PANE ]          |        First Name         Last Name     |
|                                   |        [___________]      [________]    |
|       Sleek Security Graphic      |                                         |
|                                   |        Email Address                    |
|      "Join thousands of           |        [___________________________]    |
|       privacy conscious           |                                         |
|       users worldwide."           |        Password                         |
|                                   |        [___________________________]    |
|                                   |                                         |
|                                   |              [ Sign Up ]                |
|                                   |                                         |
|                                   |         -- or continue with --          |
|                                   |            [ Google OAuth ]             |
|                                   |                                         |
|                                   |       Already have an account? Log In   |
+-----------------------------------+-----------------------------------------+
```

### 1.4 404 Not Found Page (`/404`)
```text
+-----------------------------------------------------------------------------+
|                                                                             |
|                                    privora                                  |
|                                                                             |
|                                      404                                    |
|                                Page Not Found                               |
|                                                                             |
|             The link you followed may be broken or the resource has         |
|                           been removed from our database.                   |
|                                                                             |
|                         [ Back to Dashboard ]  [ Support ]                  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## 2. Dashboard Shell Layout Pages

### 2.1 Dashboard Overview (`/dashboard`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Overview                    [Profile Icon] |
|-------------------|---------------------------------------------------------|
| [o] Overview      | Welcome back, Ashwak.                     [ Run Scan ]  |
| [o] Privacy Scan  |                                                         |
| [o] Removal Center| +------------+ +------------+ +------------+ +--------+ |
| [o] Reports       | | SCANNED    | | EXPOSED    | | IN PROGRESS| | REMOVED| |
| [o] Settings      | | 85 Brokers | | 12 Records | | 8 Submits  | | 4 Done | |
|                   | +------------+ +------------+ +------------+ +--------+ |
|                   |                                                         |
|                   | +------------------------+ +--------------------------+ |
|                   | | PRIVACY SCORE          | | RECENT ACTIVITY FEED     | |
|                   | |                        | |                          | |
|                   | |       /-------\        | | [!] Whitepages: Found PII| |
|                   | |      /  78%    \       | | [!] Radaris: Removal Sent| |
|                   | |     |   Good    |      | | [x] Spokeo: Opt-out Done | |
|                   | |      \         /       | | [!] Spokeo: Scan Complete| |
|                   | |       \-------/        | |                          | |
|                   | |                        | |                          | |
|                   | +------------------------+ +--------------------------+ |
+-------------------|---------------------------------------------------------|
| [Avatar] Ashwak   | Pro Account [Active]                                    |
+-----------------------------------------------------------------------------+
```

### 2.2 Privacy Scan Input Form (`/dashboard/scan` - Entry State)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Privacy Scan                              |
|-------------------|---------------------------------------------------------|
| [o] Overview      | New Exposure Scan                                       |
| [o] Privacy Scan  | Input details to search databases.                      |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Search Criteria                                     | |
|                   | |                                                     | |
|                   | | First Name                      Last Name           | |
|                   | | [_______________________]       [_________________] | |
|                   | |                                                     | |
|                   | | City                            State               | |
|                   | | [_______________________]       [Dropdown: CA (v)]  | |
|                   | |                                                     | |
|                   | | Age Group                                           | |
|                   | | [Dropdown: 25 - 34 (v)]                             | |
|                   | |                                                     | |
|                   | |                 [ Start Scan ]                      | |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.3 Scan Progress Simulator (`/dashboard/scan` - Scanning State)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Privacy Scan                              |
|-------------------|---------------------------------------------------------|
| [o] Overview      | Scan in Progress...                                     |
| [o] Privacy Scan  | Checking broker databases in real-time.                 |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Processing: 64% Complete                            | |
|                   | | [=============================>-------------]       | |
|                   | |                                                     | |
|                   | | Scanning Whitepages.com ... Found (Address Exposed) | |
|                   | | Scanning Spokeo.com ... Found (Phone Exposed)       | |
|                   | | Scanning Radaris.com ... Checking...                | |
|                   | | Scanning Intelius.com ... Safe (No records found)   | |
|                   | |                                                     | |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.4 Privacy Scan Results Table (`/dashboard/scan` - Results State)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Privacy Scan                              |
|-------------------|---------------------------------------------------------|
| [o] Overview      | Scan Results: 12 Exposures Identified                   |
| [o] Privacy Scan  | Privacy Score decreased to 42%.                         |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Broker Name   Severity   Matched Records   Action   | |
|                   | |-----------------------------------------------------| |
|                   | | Whitepages    [High]     123** Main St.    [Remove] | |
|                   | | Spokeo        [High]     (555) ***-4321    [Remove] | |
|                   | | Radaris       [Medium]   john.d**@gmail.c  [Remove] | |
|                   | | Intelius      [Low]      Age Range 25-34   [Remove] | |
|                   | |                                                     | |
|                   | |                                  Pages [1] 2 3 [>]  | |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.5 Removal Center Dashboard (`/dashboard/removal`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Removal Center                            |
|-------------------|---------------------------------------------------------|
| [o] Overview      | Removal Request Tracker                                 |
| [o] Privacy Scan  | Autopilot active: [o--] Enabled                         |
| [o] Removal Center|                                                         |
| [o] Reports       | Tabs: [All]   [Exposed]   [In Progress]   [Removed]     |
| [o] Settings      | +-----------------------------------------------------+ |
|                   | | Broker Name   Status          Date Sent    Action   | |
|                   | |-----------------------------------------------------| |
|                   | | Whitepages    [In Progress]   2026-07-10   [Details]| |
|                   | | Spokeo        [Removed]       2026-07-09   [Details]| |
|                   | | Radaris       [Pending]       2026-07-12   [Details]| |
|                   | | Intelius      [Refused]       2026-07-08   [Details]| |
|                   | |                                                     | |
|                   | |                                  Pages [1] 2 [>]    | |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.6 Removal Details Slide-out Drawer Panel (`/dashboard/removal#details`)
```text
+--------------------------------------------------+--------------------------+
| Dashboard  /  Removal Center                     | Whitepages Tracker       |
|--------------------------------------------------|                          |
|                                                  | Status: [In Progress]    |
| Tabs: [All]   [Exposed]   [In Progress]          | Date Initiated: Jul 10   |
| +----------------------------------------------+ |                          |
| | Broker Name   Status          Date Sent      | | Removals Progress Log:   |
| |----------------------------------------------| |                          |
| | Whitepages    [In Progress]   2026-07-10     | | - Jul 10: Opt-out request|
| | Spokeo        [Removed]       2026-07-09     | |   sent via automated fax.|
| | Radaris       [Pending]       2026-07-12     | |                          |
| | Intelius      [Refused]       2026-07-08     | | - Jul 11: Confirmation of|
| |                                              | |   opt-out receipt from   |
| |                                              | |   broker compliance team.|
| |                                              | |                          |
| |                               Pages [1] [>]  | |   [ Close Drawer ]       |
| +----------------------------------------------+ |                          |
+--------------------------------------------------+--------------------------+
```

### 2.7 Reports Archive Dashboard (`/dashboard/reports`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Reports Archive                           |
|-------------------|---------------------------------------------------------|
| [o] Overview      | Privacy Progress Reports                                |
| [o] Privacy Scan  | Historical trend and downloads.                         |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Privacy Score Trend                                 | |
|                   | | 100|                                                | |
|                   | |  80|            /---\                               | |
|                   | |  60|     /-----\     \                              | |
|                   | |  40|----/             \-----/                       | |
|                   | |   0+---------------------------------               | |
|                   | |     Apr   May   Jun   Jul                           | |
|                   | +-----------------------------------------------------+ |
|                   | | Report File                     Date      Action    | |
|                   | |-----------------------------------------------------| |
|                   | | report_june_2026.pdf            Jul 01    [Download]| |
|                   | | report_may_2026.pdf             Jun 01    [Download]| |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.8 Settings Profile & Notification Panel (`/dashboard/settings`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Settings                                  |
|-------------------|---------------------------------------------------------|
| [o] Overview      | System Configuration                                    |
| [o] Privacy Scan  | Tabs: [Profile]   [Billing & Tier]   [Notifications]    |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Profile Scan Attributes                             | |
|                   | |                                                     | |
|                   | | Contact Email                                       | |
|                   | | [ashwak@gmail.com                     ]             | |
|                   | |                                                     | |
|                   | | Primary Home Address (Optional verification)        | |
|                   | | [123 Main St, Los Angeles, CA 90001   ]             | |
|                   | |                                                     | |
|                   | |                 [ Save Changes ]                    | |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```

### 2.9 Settings Billing Panel (`/dashboard/settings#billing`)
```text
+-----------------------------------------------------------------------------+
| [Logo] privora    | Dashboard  /  Settings                                  |
|-------------------|---------------------------------------------------------|
| [o] Overview      | System Configuration                                    |
| [o] Privacy Scan  | Tabs: [Profile]   [Billing & Tier]   [Notifications]    |
| [o] Removal Center|                                                         |
| [o] Reports       | +-----------------------------------------------------+ |
| [o] Settings      | | Active Plan: Privora Pro (Autopilot Opt-out active) | |
|                   | | Billing Period: Monthly ($19/mo)                    | |
|                   | | Next Invoice: August 01, 2026                       | |
|                   | |                                                     | |
|                   | |              [ Manage Billing via Stripe ]          | |
|                   | |                                                     | |
|                   | | Invoice History                                     | |
|                   | | Jul 01, 2026        Pro Subscription    $19.00 [PDF]| |
|                   | | Jun 01, 2026        Pro Subscription    $19.00 [PDF]| |
|                   | +-----------------------------------------------------+ |
+-------------------+---------------------------------------------------------+
```
