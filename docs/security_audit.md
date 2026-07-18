# Privora Security Audit & Penetration Checklist (v1.0 Launch)

This document outlines the security audit vectors, threat modeling, security control mechanisms, and vulnerability mitigation protocols implemented in the Privora platform.

---

## 1. Core Threat Modeling
Privora handles sensitive Personally Identifiable Information (PII) like names, phone numbers, email addresses, and physical locations. The core objective is to prevent exposures of this search criteria.

```text
Threat Agent            Vector                          Mitigation
------------------------------------------------------------------------------------------------------
Unauthenticated User    Direct URL access to /dashboard Middleware session validation & redirects
DB Dump Leaks           Plaintext database scraping     Field encryption of PII & Zero-knowledge hashes
XSS/CSRF Attacks        Cookie hijack / token theft     HTTP-Only cookies, CSP rules, SameSite limits
SQL Injection           Raw queries abuse               Supabase PostgREST parameter binding
```

---

## 2. Security Audit Checklist & Status

### A. Authentication & Session Handling
- [x] Session management delegated to **Clerk Auth Providers**.
- [x] Tokens are secured via `HTTP-Only`, `Secure` flag, and `SameSite=Lax` cookie parameters.
- [x] Automatic user session expiration handles inactive states.

### B. Database Security (Row-Level Security)
- [x] Row Level Security (RLS) is enabled across all Supabase PostgreSQL tables.
- [x] No operations run without verifying `auth.uid() = user_id`.
- [x] Service role credentials (which bypass RLS) are restricted to backend API routes (`src/app/api/webhooks/clerk`).

### C. Zero-Knowledge Search Architecture
- [x] Search input criteria are encrypted in-memory and hashed (SHA-256) before database insertion.
- [x] Plaintext search parameters are discarded from server memory and never committed to persistent log files.

### D. Input Sanitization & Validation
- [x] All entry fields are sanitized on the client and validated on the backend via strict **Zod Schemas**.
- [x] HTML markup/characters are stripped before search matching.

### E. Penetration Control Headers (CSP)
- [x] Custom HTTP Headers set strict clickjacking (`X-Frame-Options: DENY`) and content sniffing (`X-Content-Type-Options: nosniff`) blockades.
- [x] Rigid Content Security Policy (CSP) configured in `next.config.ts` to restrict external scripts, styles, and iframe embeds.

---

## 3. Penetration Test Protocols & Commands

To perform manual security validation sweeps:

1. **Verify Session Middleware Protection**:
   ```bash
   curl -I http://localhost:3000/dashboard
   # Success criteria: Returns HTTP 307 Redirect (to /sign-in)
   ```

2. **Verify Security Headers Configuration**:
   ```bash
   curl -I http://localhost:3000/
   # Verify output contains:
   # X-Frame-Options: DENY
   # X-Content-Type-Options: nosniff
   # Content-Security-Policy: ...
   ```

3. **Check Supabase API Key Access Scope**:
   Verify that requesting rows from `removal_requests` table with an anonymous key but without a Bearer JWT returns an empty payload due to RLS blocks.
