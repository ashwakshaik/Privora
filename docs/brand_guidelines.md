# Brand Guidelines & Identity — Privora (Day 1)

This document establishes the foundational visual and conceptual identity for Privora, outlining brand personality, core design principles, logo system rules, color tokens, and typography guidelines.

---

## 1. Brand Personality & Values
Privora's identity must reflect absolute security, calmness, and modern premium execution. It avoids the dark, intimidating tropes of traditional cybersecurity ("cyberpunk" neon, security shields, alert sirens) and instead adopts a sleek, clean, and empowering aesthetic.

*   **Trustworthy**: Direct, transparent, and objective. We never use fear-mongering copy to drive conversions.
*   **Premium**: Sleek, clean layouts with generous breathing room. Inspired by Stripe and Linear.
*   **Minimalist**: Do not show secondary information by default. Elevate focus through typographic scale and subtle borders.
*   **Empowering**: Privacy control is presented as a solved operational problem, not a cause for panic.

---

## 2. Core Design Principles
1.  **Clarity Over Alarmism**: Information is displayed with clean, objective metrics. Low privacy scores are opportunities to fix issues, not system emergencies.
2.  **Zero Friction**: Minimize user inputs. Use smart defaults. The onboarding scan must complete in seconds.
3.  **Performance as a Feature**: Pages must load instantly. Transitions must be snappy (150ms).
4.  **Intentional Aesthetics**: Contrast borders, dark-mode-first styling, and high-quality type sizing determine visual hierarchy, not heavy colors.

---

## 3. Logo Rules & Layout
The Privora logo consists of an abstract geometry symbol (the **Portal**) and a clean sans-serif wordmark in **Inter** or **Geist Sans**.

### 3.1 Logo Construction
*   **The Symbol (Portal)**: A perfect outer circle representing the user's boundary, intersected by three overlapping curves representing incoming databands being deflected.
*   **The Wordmark**: Written in pure lower-case: **privora** (Font: Geist Sans SemiBold, Tracking: `-0.03em`).

```text
    Portal Symbol         Wordmark
        
       /---\
      / /-\ \
     | |   | |    privora
      \ \-/ /
       \---/
```

### 3.2 Visual Constraints & Alignment
*   **Clear Space**: Clear margin spacing equal to `0.5x` the width of the portal symbol must surround the logo at all times.
*   **Minimum Size**:
    *   *Digital*: height of `24px` for logo + wordmark lockup.
    *   *Print*: height of `12mm`.
*   **Color Configurations**:
    *   *On Dark Background*: Portal Symbol is rendered in Electric Indigo (`hsl(250, 84%, 58%)`), Wordmark is pure white (`hsl(0, 0%, 98%)`).
    *   *On Light Background*: Portal Symbol is rendered in Deep Indigo (`hsl(250, 84%, 54%)`), Wordmark is Charcoal Black (`hsl(240, 10%, 4%)`).

---

## 4. Color Palette
Our color system uses unified HSL variables. The colors are high-contrast and accessibility-checked to ensure WCAG 2.1 AA ratings.

### 4.1 Palette Values Matrix

| Color Role | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Brand Indigo)** | `hsl(250, 84%, 54%)` | `hsl(250, 84%, 58%)` | Primary CTA, focus rings, progress indicator |
| **Background (Base)** | `hsl(240, 10%, 99%)` | `hsl(240, 10%, 3.9%)` | Page body background |
| **Card / Container** | `hsl(0, 0%, 100%)` | `hsl(240, 10%, 6%)` | Dashboard widgets, form frames |
| **Foreground Text** | `hsl(240, 10%, 4%)` | `hsl(0, 0%, 98%)` | Primary copy, page headings |
| **Muted Text** | `hsl(240, 3.8%, 46.1%)`| `hsl(240, 5%, 64.9%)` | Labels, helper texts, table headers |
| **Border / Divider** | `hsl(240, 5.9%, 90%)` | `hsl(240, 3.7%, 15.9%)` | Thin lines dividing sections |
| **Success (Green)** | `hsl(142, 76%, 36%)` | `hsl(142, 70%, 45%)` | Status: Removed, active secure state |
| **Destructive (Red)** | `hsl(0, 84.2%, 60.2%)`| `hsl(0, 62.8%, 30.6%)` | Status: Exposed, delete warnings |
| **Warning (Amber)** | `hsl(38, 92%, 50%)` | `hsl(38, 90%, 55%)` | Status: In-Progress, scanning alerts |

---

## 5. Typography Specs
Our typography is designed for readability and structured data reporting. We pair **Inter** for UI control copy with **Geist Mono** for hashes, system codes, and search criteria.

*   **Primary Font Stack**: `Inter, system-ui, -apple-system, sans-serif`
*   **Mono Font Stack**: `Geist Mono, SFMono-Regular, Consolas, monospace`
*   **Line Heights**: Standardized ratios:
    *   *Body text*: `1.5` for comfortable reading.
    *   *Heading text*: `1.2` for compact, modern title aesthetics.
*   **Tracking**: Accentuate headings by tightening letters:
    *   H1 / H2: `-0.024em` (tracking-tight)
    *   Metadata / Badges: `+0.05em` (tracking-wider, uppercase)

---

## 6. Icon Style
*   **Icon Library**: **Lucide Icons** (or Radix Icons).
*   **Stroke Width**: Strictly set to `1.75px` to match thin-line typographic weights.
*   **Geometry**: Modern geometric shapes, rounded ends, flat vectors.
*   **Usage Rule**: Icons should always accompany descriptive labels. Avoid using raw floating icons without tooltips or labels.
