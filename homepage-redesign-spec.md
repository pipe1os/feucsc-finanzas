# Homepage Redesign — Specification

> **Project:** FEUCSC Financial Transparency Portal
> **Status:** Draft
> **Author:** Buffy (AI assistant)
> **Created:** 2026-06-25

---

## 1. Executive Summary

Redesign the public-facing homepage (`/`) of the FEUCSC financial transparency portal to better serve first-time student visitors. The redesign keeps a **pure financial-focus** (no new non-data sections) while making the dashboard **warmer, more student-friendly**, and **more compact above the fold** on mobile. The layout will use a **seamless card-based flow** with a **secondary accent color** complementing the existing red brand.

---

## 2. Strategic Goals

| Goal | Priority |
|---|---|
| Build trust & credibility with students | 🔴 High |
| Make financial data engaging & accessible | 🔴 High |
| Communicate FEUCSC brand identity | 🟡 Medium |
| Drive exploration of other pages | 🟡 Medium |

---

## 3. Target Audience

**Primary:** First-time student visitors.
**Secondary:** Returning students checking expense transparency.
**Tertiary:** General public / university administrators.

---

## 4. Design Principles

1. **Financial focus** — The homepage is *the* dashboard for transparency. No about sections, testimonials, or non-data elements. The data tells the story.
2. **Warmer & student-friendly** — Move away from pure Apple-minimalist toward a slightly warmer, more approachable feel. Softer neutrals, warmer grays, thoughtful use of the red accent.
3. **Seamless card-based flow** — Content sections flow naturally without harsh dividers. Cards feel connected rather than boxed in.
4. **Compact on mobile** — Optimize layout so students see meaningful content above the fold on mobile devices. Minimize vertical whitespace waste.
5. **Pure data, no extras** — No new sections like "About FEUCSC", testimonials, latest updates, or stat badges. The KPI card, chart, and transactions are the complete set.

---

## 5. Current State (Baseline)

The current homepage (`src/app/(public)/page.tsx`) contains:

- **Header:** Title "Transparencia Financiera" + subtitle paragraph
- **KPI Card (col-span-4):** Single composite card showing:
  - Total Gastado (large number)
  - Percentage of budget used (with color-coded progress bar: green ≤ 40%, amber ≤ 69%, rose > 69%)
  - Presupuesto Total (smaller)
  - Saldo Disponible (smaller)
- **Expense Trend Chart (col-span-8):** Monthly line chart with area fill, tooltips on hover
- **Latest Transactions Preview (col-span-12):** Table/list showing last 3 transactions + "Ver todos" link
- **Footer**

Layout uses a 12-column grid: KPI (4 cols) + Trend Chart (8 cols) on desktop, stacked on mobile.

---

## 6. Proposed Changes

### 6.1 — Visual Direction: Warmer & More Student-Friendly

| Aspect | Current | Proposed |
|---|---|---|
| Overall mood | Clean, professional, neutral | Warmer, inviting, youthful |
| Gray palette | Cool grays (`#f5f5f7` ... `#1d1d1f`) | Slightly warmer gray tones (consider shifting toward warm-neutral) |
| Background | White + dot pattern | Keep dot pattern but possibly soften it |
| Card surfaces | White with `shadow-apple` | Keep shadow-apple, consider subtle warm tint on card backgrounds |
| Red accent | `#E30707` — restrained usage | More intentional red usage in active states, dividers, icons |

### 6.2 — Secondary Accent Color

Add a secondary accent to complement `#E30707` (red) for:
- Chart elements (gradient stops, grid lines)
- Subtle UI highlights
- Category color palette variety

**Options to evaluate:**
- **Emerald** (`#10B981`) — contrasts red, signals "good/available" naturally
- **Amber** (`#F59E0B`) — warm, already appears in status indicators
- **Blue** (`#3B82F6`) — safe, trust-signaling

The KPI card progress bar already uses green/amber/rose — this should be reevaluated with the new secondary palette for a more cohesive look.

### 6.3 — Header Refinements

- Keep the "Transparencia Financiera" heading
- Update the subtitle to be slightly more welcoming/first-time-friendly (current: *"Presupuesto, gastos y comprobantes de la Federación de Estudiantes UCSC."*)
- Consider making the heading warmer with a subtle `text-gradient-red`
- No hero section, no logo in header area (logo stays in sidebar)
- Maintain SEO metadata as-is (`title: "Transparencia Financiera | FEUCSC"`)

### 6.4 — KPI Card Refinements

- **Keep as a single card** (no splitting into multiple cards)
- Refine visual hierarchy to make "Total Gastado" more prominent
- Add a **secondary accent color** to the progress bar (e.g., emerald for low spend → amber for medium → red for high, with smoother transitions)
- Consider adding a subtle animated entrance (already has `animate-bar-grow` and `animate-fade-in-up`)
- Add the academic year label inline more elegantly
- Explore slightly warmer background for the card surface

### 6.5 — Trend Chart Refinements

- Update chart colors: use the secondary accent for gradient fills, grid lines
- Consider using a gradient that goes from red to the secondary color for the area fill
- Keep all existing functionality (tooltips, interactive dots, D3 rendering)
- Ensure touch interactions work well on mobile (already has touch support)
- Explore making the chart feel more "embedded" in a seamless card flow

### 6.6 — Latest Transactions Refinements

- **Keep showing 3 transactions** (no change)
- Refine card styling to match the warmer/seamless direction
- Consider making the category badges slightly more visually prominent
- Keep "Ver todos" link with arrow animation
- Ensure the table layout feels continuous with the chart above

### 6.7 — Mobile Layout: Compact Above the Fold

- Reduce padding/margins on mobile to fit KPI card + trend chart + at least 1 transaction in the initial viewport
- On mobile: stack KPI card → chart → transactions (already the case)
- Consider reducing the KPI card's vertical height on mobile (smaller font sizes, tighter spacing)
- Evaluate whether 2-column layout works for KPI card sub-values on small screens

### 6.8 — Layout & Grid

| Breakpoint | Current | Proposed |
|---|---|---|
| Mobile (< 768px) | Stacked single column | Stacked single column, tighter spacing |
| Tablet (768-1024px) | Single column | Evaluate 2-column layout for KPI + chart |
| Desktop (≥ 1024px) | KPI (4) + Chart (8) + Transactions (12) | Same grid ratio, seamless card feel |
| Wide (≥ 1920px) | 18px base font-size (already implemented) | Same behavior |

### 6.9 — Animation & Interaction

- Keep existing animations (`animate-fade-in-up`, `animate-bar-grow`, `stagger-*` classes)
- Add a subtle entrance animation for the entire page content area
- Chart hover interactions: maintain current behavior
- Progress bar: keep the bar-grow entrance animation
- Respect `prefers-reduced-motion` (already implemented)

---

## 7. Files to Modify

| File | Changes |
|---|---|
| `src/app/(public)/page.tsx` | Header text updates, layout refinement, pass new color props |
| `src/components/public/KPICards.tsx` | Refine visual hierarchy, update progress bar colors, warm up card |
| `src/components/public/ExpenseTrendChart.tsx` | Update gradient colors, grid line colors to use secondary accent |
| `src/components/public/LatestTransactionsPreview.tsx` | Polish card styling to match warmer direction |
| `src/app/globals.css` | Potentially update gray palette toward warmer tones, add secondary accent color tokens |
| `src/app/(public)/layout.tsx` | Minor spacing adjustments if needed |

---

## 8. Non-Goals (Out of Scope)

- ❌ No hero section, mission statement, or "About FEUCSC" content
- ❌ No testimonials, quotes, or social proof elements
- ❌ No latest update / "last synced" indicators
- ❌ No additional stat badges or transaction counts
- ❌ No changes to navigation (sidebar stays as-is)
- ❌ No changes to the Footer
- ❌ No changes to `/gastos` detail page (separate scope)
- ❌ No changes to admin pages
- ❌ No content or structural changes to the data-fetching logic

---

## 9. Acceptance Criteria

1. The homepage feels **warmer** and more inviting to first-time student visitors
2. **Secondary accent color** is visible in chart gradients and UI elements
3. **KPI card** is refined with better hierarchy and updated colors
4. **Seamless card flow** — cards feel connected, not isolated
5. **Mobile** shows meaningful data (KPI + chart) without excessive scrolling
6. All existing **functionality** works: chart interactions, tooltips, links, responsive breakpoints
7. **`prefers-reduced-motion`** is respected
8. **No regressions** on other pages (gastos, FAQ, contacto, admin)

---

## 10. Open Questions / Future Considerations

- Which specific secondary accent color to use? (emerald, amber, or blue — needs visual testing)
- Exact gray palette warm-shift value (minor hex adjustments or a new gray family?)
- Whether to change the KPI progress bar green/amber/rose threshold colors when introducing the secondary palette
