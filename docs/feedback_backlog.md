# Privora User Feedback Backlog (Week 9)

This document contains categorized beta/public feedback logs, prioritized into Critical Bugs, UX Improvements, and Feature Requests using High/Medium/Low severity tiers.

---

## 1. Categorized Backlog

### Category A: Critical Bugs (High Priority)
- **FB-001: Mobile Safari Score Text Wrapping**
  - *Description*: When viewing the dashboard overview on iOS Safari, the circular score indicator gauge sometimes causes the inner score text percentage to wrap to a new line, breaking the HSL layout boundaries.
  - *Severity*: High
  - *Action*: Fixed CSS flex width on SVG containers in the overview layout to prevent scaling issues.
- **FB-002: Next Scan Computation Under Flow Settings**
  - *Description*: Users changing settings options do not see the "Next Scan" widget refresh unless they trigger a manual window reload.
  - *Severity*: Medium
  - *Action*: Integrated settings change state listeners inside the dashboard overview component context.

---

### Category B: UX Improvements (Medium Priority)
- **FB-003: PDF Document Branding Polish**
  - *Description*: Users reported the generated PDF report looks generic and lacks visual branding or headers.
  - *Severity*: Medium
  - *Action*: Upgraded jsPDF draw actions to output custom primary header colors, divider structures, metadata rows, and detailed bullet points listing active exposures.
- **FB-004: Interactive Navigation for Help/Roadmap**
  - *Description*: Beta testers requested a clearer location to check Version 1.1 roadmaps and chat with the prototype assistant without hunting through settings dropdowns.
  - *Severity*: Low
  - *Action*: Registered direct sidebar routes for "Feedback Admin" and "MYRAH AI & Roadmap".

---

### Category C: Feature Requests (Low Priority)
- **FB-005: Raw CSV Report Exports**
  - *Description*: Requests for downloading exposed registries lists in plain text/CSV formatting for external spreadsheet backups.
  - *Severity*: Medium
  - *Action*: Added CSV compilers triggering download links inside the Reports module.
- **FB-006: Context-Aware Chat Guidelines**
  - *Description*: Request to have the AI privacy assistant (MYRAH) automatically read scan results and suggest immediate removal actions instead of asking general questions.
  - *Severity*: Medium
  - *Action*: Configured the chatbot state provider to fetch active removal counts and summarize exposures.

---

## 2. Prioritization Matrix

```text
Priority    Item ID     Category            Description
------------------------------------------------------------------------------------------------
HIGH        FB-001      Critical Bug        Fix iOS Safari score gauge text wrapping.
MEDIUM      FB-003      UX Improvement      Harden PDF reporting styles with custom headers.
MEDIUM      FB-005      Feature Request     Enable CSV downloads of exposed registries.
MEDIUM      FB-006      Feature Request     Enable MYRAH context-aware scan summaries.
LOW         FB-002      Critical Bug        Sync settings refresh updates to next scan widget.
LOW         FB-004      UX Improvement      Provide direct navigation sidebar routing.
```
