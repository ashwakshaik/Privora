# High-Fidelity UI Design Specifications — Privora (Day 5)

This document defines high-fidelity visual layout specs, spacing hierarchies, typographic treatments, colors, and layout compositions for the primary Privora pages.

---

## 1. Landing Page (`/`)
*   **Visual Direction**: Deep dark backdrop (`bg-[#0B0A0F]`), high-contrast layout, and fluid typography.
*   **Layout & Sections**:
    1.  **Hero**:
        *   Container: `pt-32 pb-20 max-w-5xl mx-auto text-center px-4`
        *   Heading: `text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400`
        *   Subtitle: `text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mt-6 leading-relaxed`
        *   CTA Box: `mt-10 flex flex-col sm:flex-row items-center justify-center gap-3`
            *   Input Field: `bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 w-full sm:w-80 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500`
            *   Submit Button: `bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-6 py-3 w-full sm:w-auto shadow-lg shadow-indigo-600/20`
    2.  **Live Scan Simulator Widget**:
        *   Wrapper: `mt-20 border border-zinc-800 bg-zinc-900/30 rounded-xl p-6 max-w-4xl mx-auto backdrop-blur-md shadow-2xl`
        *   Header Bar: `flex items-center justify-between pb-4 border-b border-zinc-800`
            *   Indicator light: green glowing dot (`h-2 w-2 rounded-full bg-emerald-500 animate-pulse`).
        *   Terminal Output Console: `font-mono text-sm text-zinc-400 space-y-2 pt-4 h-48 overflow-y-auto`
    3.  **Pricing Grid**:
        *   Wrapper: `py-24 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4`
        *   Pro Card: Highlighted card with premium border overlay:
            `relative bg-zinc-950 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/5`

---

## 2. Dashboard Overview (`/dashboard`)
*   **Visual Direction**: Sleek modern dashboard. Subtle dark background (`bg-[#09090B]`), clean card containers (`bg-[#121214] border border-[#1F1F23]`).
*   **Layout & Sections**:
    1.  **Metric Widget Grid**:
        *   Container: `grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8`
        *   Card Layout:
            *   Title Label: `text-xs font-semibold text-zinc-400 uppercase tracking-wider`
            *   Value Display: `text-3xl font-bold text-white tracking-tight mt-1`
            *   Footer detail: `text-[11px] text-zinc-500 mt-2`
    2.  **Privacy Rating Circle (Left Column - 40% width)**:
        *   Card styling: `bg-[#121214] border border-[#1F1F23] rounded-xl p-8 flex flex-col items-center justify-center`
        *   Progress Radial: Large central circle. Stroke width `8px`, track colored in dark grey, active circular bar colored in bright indigo (`stroke-indigo-500`).
        *   Central Value Text: `text-4xl font-extrabold text-white` centered inside, subtitle `text-xs text-zinc-500 mt-1`.
    3.  **Action Logs Feed (Right Column - 60% width)**:
        *   Header: `flex items-center justify-between mb-4` -> Title `text-lg font-semibold text-white`
        *   Rows List: Vertical stack. Rows show small alert badges (`Exposed` in red, `Removed` in green), text description, and date strings.

---

## 3. Privacy Scan Page (`/dashboard/scan`)
*   **Visual Direction**: Form focused layouts. Generous spacing around labels, input boxes are full width with light borders.
*   **Layout & Sections**:
    1.  **Criteria Input Box**:
        *   Card styling: `bg-[#121214] border border-[#1F1F23] rounded-xl p-8 max-w-3xl mx-auto`
        *   Form Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
        *   Actions Button Wrapper: `mt-8 flex justify-end`
    2.  **Result Table (Scan Completed State)**:
        *   Container: `bg-[#121214] border border-[#1F1F23] rounded-xl overflow-hidden shadow-sm`
        *   Headers Row: `bg-[#18181B] border-b border-[#1F1F23] text-xs font-semibold text-zinc-400 py-3 px-6`
        *   Data Row: `border-b border-[#1F1F23] py-4 px-6 hover:bg-zinc-800/10 transition-colors text-sm text-white`
        *   Match Badge: Pill tags, e.g. Address matches show light red labels.

---

## 4. Reports Page (`/dashboard/reports`)
*   **Visual Direction**: Visual data graphs. Clean borders partition trends details from list tables.
*   **Layout & Sections**:
    1.  **Trend Plot Wrapper**:
        *   Card styling: `bg-[#121214] border border-[#1F1F23] rounded-xl p-8 mb-8`
        *   Score Graph Container: Renders line charts showing values over 6 months using clean, vector-rendered SVG pathways.
    2.  **PDF Reports Archive**:
        *   Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
        *   Report Card:
            *   Header: File name `text-sm font-semibold text-white`, icon showing PDF layout.
            *   Subtitle: Created date, size details.
            *   Button CTA: Secondary button displaying "Download PDF" (`h-9 text-xs`).

---

## 5. Settings Page (`/dashboard/settings`)
*   **Visual Direction**: Clean tab layout. Content areas load based on active sub-navigation switches.
*   **Layout & Sections**:
    1.  **Tabs Navigation**:
        *   Wrapper: `flex space-x-1 border-b border-[#1F1F23] mb-8`
        *   Tab Item Link: `px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-150 border-b-2 border-transparent`
        *   Active Item: `border-indigo-500 text-white font-medium`
    2.  **Billing Detail Panel**:
        *   Card Container: `bg-[#121214] border border-[#1F1F23] rounded-xl p-8`
        *   Active Tier Label: Badge component indicating `"Privora Pro"` in bright indigo colors.
        *   Invoice Table: Lists previous billing lines, date of transaction, price tier, and invoice details.
