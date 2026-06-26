# Contacto Page Redesign — Specification

> **Project:** FEUCSC Financial Transparency Portal
> **Status:** Draft
> **Author:** Buffy (AI assistant)
> **Created:** 2026-06-25
> **Based on:** Interview with project owner

---

## 1. Executive Summary

Redesign the `/contacto` page of the FEUCSC financial transparency portal. The redesign focuses purely on **visual polish** — the 3 existing contact items (institutional email, physical address, Instagram link) remain unchanged. The goal is to give the page more **visual impact and personality** while staying within a **minimalist, clean aesthetic** consistent with the Apple-inspired design language already used throughout the site.

---

## 2. Strategic Goals

| Goal | Priority |
|---|---|
| Give the contacto page visual parity with the FAQ and homepage | 🔴 High |
| Maintain a clean, minimalist Apple-like aesthetic | 🔴 High |
| Create subtle differentiation between the 3 contact items | 🟡 Medium |
| Improve mobile experience with tighter spacing | 🟡 Medium |
| Keep functional behavior unchanged (no new features) | 🔴 High |

---

## 3. Target Audience

**Primary:** Students visiting the page to find FEUCSC contact information (email, location, Instagram).

---

## 4. Design Principles

1. **Visual polish without bloat** — The page keeps its 3 existing contact items. Improvements come from refinement, not addition.
2. **Minimalist & clean** — Apple-inspired design language: generous whitespace, subtle shadows, thin borders, restrained color usage.
3. **Subtle differentiation** — Each of the 3 contact cards gets a unique accent/hover treatment so they don't feel purely mechanical, while maintaining visual consistency.
4. **Center-aligned header** — The centered title/subtitle layout stays (different from the left-aligned FAQ page). This feels intentional for a contact page.
5. **Staggered entrance** — Cards animate in one by one with delays, matching the pattern used on the FAQ page.
6. **All cards feel interactive** — Even the static address card gets a subtle hover effect for visual cohesion.

---

## 5. Current State (Baseline)

The current page (`src/app/(public)/contacto/page.tsx`) contains:

**Header:**
- Title: "Contacto"
- Subtitle: "¿Tienes dudas? Ponte en contacto con nosotros."
- Centered alignment with `animate-fade-in-up` animation

**3 Contact Items (vertical list, single column):**
1. **Institutional Email** — Button with clipboard copy functionality + `CopyIcon` indicator
2. **Physical Address** — Static card (no interaction): "Avenida Alonso de Ribera 2850, Concepción"
3. **Instagram Link** — `<a>` tag linking to `https://instagram.com/feucsc_` with hover color transition to red-500

**Footer:** Standard copyright footer at the bottom of content.

All items share the same style: white card with `border-border`, `shadow-apple`, `rounded-2xl`, and identical icon containers (`size-11 rounded-xl bg-zinc-50 text-zinc-400`).

---

## 6. Proposed Changes

### 6.1 — Header Refinements

| Aspect | Current | Proposed |
|---|---|---|
| Title | "Contacto" (text-2xl font-semibold) | Keep same — minimal polish only |
| Subtitle | "¿Tienes dudas? Ponte en contacto con nosotros." | Keep same |
| Alignment | Centered | Keep centered |
| Decoration | None | None — simple header stays |
| Animation | `animate-fade-in-up` | Keep same |

**No changes to header content.** Only verify spacing is correct.

---

### 6.2 — Card Styling: Slightly Differentiated Treatments

All 3 cards keep the same base layout (icon + text + optional action) but receive **subtle differentiated icon backgrounds and hover treatments**.

#### 6.2.1 — Base Card (common to all)

- `rounded-2xl bg-white border border-border shadow-apple`
- `p-5 sm:p-6` padding
- **New:** All 3 cards show a subtle hover lift (`hover:shadow-apple-lg hover:border-border` transition) — even the static address card — for visual consistency
- Same `group` hover pattern

#### 6.2.2 — Email Card (Copy)

| Aspect | Current | Proposed |
|---|---|---|
| Icon background | `bg-zinc-50 text-zinc-400` | Keep subtle — perhaps `bg-red-50 text-red-400/80` for a very soft red hint |
| Label | "Correo institucional" | Keep same |
| Value | "feucsc@ucsc.cl" | Keep same |
| Action | Inline CopyIcon next to value | Keep inline CopyIcon — just polish sizing/color |
| Hover | Already works as `<button>` | Keep same |
| Accent idea | None | The soft red icon hint subtly identifies this as the primary contact method |

**CopyIcon behavior stays:** `startAnimation()`/`stopAnimation()` with 1-second timeout, toast notification on copy.

#### 6.2.3 — Address Card (Static → Polished)

| Aspect | Current | Proposed |
|---|---|---|
| Icon background | `bg-zinc-50 text-zinc-400` | `bg-zinc-50` stays, but icon color slightly warmer — a very soft warm tone |
| Label | "Sala FEUCSC" | Keep same |
| Value | "Avenida Alonso de Ribera 2850, Concepción" | Keep same |
| Interaction | None (static `<div>`) | Add subtle hover lift (`hover:shadow-apple-lg hover:border-border` + cursor change) |

The address card should feel like part of the set even though it's not clickable. A very subtle `hover:bg-gray-50/50` could also work.

#### 6.2.4 — Instagram Card (Neutral Warm Accent)

| Aspect | Current | Proposed |
|---|---|---|
| Icon background | `bg-zinc-50 text-zinc-400` | `bg-amber-50 text-amber-500/80` — warm amber/gold accent |
| Label | "Síguenos en Instagram" | Keep same |
| Value | "@feucsc_" | Keep same |
| Hover text color | `group-hover:text-red-500` (red) | Change to `group-hover:text-amber-600` (warm amber) |
| Icon background on hover | None | Optional: subtle amber tint intensification |

The warm amber/gold accent provides a neutral but friendly differentiation without using Instagram's brand colors or the site's red.

---

### 6.3 — Staggered Entry Animation

| Aspect | Current | Proposed |
|---|---|---|
| Header | `animate-fade-in-up opacity-0` (instant) | Keep same |
| Cards container | `animate-fade-in-up opacity-0` with `style={{ animationDelay: "0.1s" }}` (all cards together) | Replace with **3 staggered cards** with individual delays (0.1s, 0.2s, 0.3s) |
| Footer | `animate-fade-in-up` (no delay) | Add a delay (0.4s) to appear after the cards |

The staggered approach matches the FAQ page's pattern and creates a more dynamic entrance. Each card fades in one after another.

```
Header:       delay 0s
Email card:   delay 0.1s
Address card: delay 0.2s
Instagram:    delay 0.3s
Footer:       delay 0.4s
```

All entries use the existing `animate-fade-in-up` CSS animation (0.5s cubic-bezier).

---

### 6.4 — Sticky Footer

The Footer should stick to the bottom of the viewport when the page content is shorter than the viewport height. This prevents the footer from floating in the middle of the screen on short-content pages like /contacto.

**Implementation:**
- The parent container (`<div className="mx-auto max-w-3xl ...">`) should use `min-h-[calc(100dvh-*)]` or flex-based sticky footer pattern
- On desktop (with sidebar): footer should stick relative to the content area, not the full viewport
- Ensure the backdrop blur and dot pattern still cover the full background

---

### 6.5 — Mobile Spacing: Tighter

| Breakpoint | Current | Proposed |
|---|---|---|
| Mobile padding top | `pt-16` | `pt-12` (slightly tighter) |
| Card padding | `p-5 sm:p-6` | Keep same |
| Gap between cards | `gap-4` | Keep same |
| Desktop padding | `lg:pt-10 lg:pb-4` | Keep same |

The header subtitle's `max-w-md` should be kept or slightly widened.

---

### 6.6 — Icon Polish

**Email icon (mail):** Keep the mail icon (`<rect width="20" height="16" ... rx="2" />` + `<path d="m22 7..." />`) — it's clear and recognizable.

**Address icon (map pin):** Keep the map pin icon (`<path d="M20 10c0 6-8 12-8 12..." />` + `<circle cx="12" cy="10" r="3" />`) — it's the standard map marker.

**Instagram icon:** Keep the Instagram icon (`<rect rx="5" />` + camera lens + dot). No changes.

---

## 7. Files to Modify

| File | Changes |
|---|---|
| `src/app/(public)/contacto/page.tsx` | Card refinements, staggered delays, differentiated icon/color treatments, sticky footer wrapper, tighter mobile padding |
| `src/components/public/Footer.tsx` | Possibly no changes needed if sticky footer is achieved via container styling |

No changes to:
- `globals.css` (no new utilities needed)
- Sidebar, layout, template
- Any other pages

---

## 8. Non-Goals (Out of Scope)

- ❌ No new content or features (no contact form, map, phone, hours, social media expansion)
- ❌ No structural layout changes (stays single-column)
- ❌ No new color variables or theme changes
- ❌ No changes to the `CopyIcon` component behavior
- ❌ No changes to the FAQ, homepage, gastos, or admin pages
- ❌ No changes to the sidebar or navigation
- ❌ No changes to SEO metadata

---

## 9. Acceptance Criteria

1. All 3 contact cards have **subtle hover effects** (shadow, border, cursor) — including the address card
2. The **Instagram card** uses a warm amber/gold accent for its icon and hover state
3. The **email card** uses a soft red accent for its icon background
4. The **header** stays centered, simple, and unchanged in content
5. Cards **stagger in** with 0.1s, 0.2s, 0.3s delays on page load
6. The **footer** sticks to the bottom of the viewport when content is short
7. On **mobile**, the top padding is slightly tighter (`pt-16` → `pt-12`)
8. **prefers-reduced-motion** is respected (already implemented globally)
9. All existing **functionality** works: email copy, clipboard fallback, toast, Instagram link opens in new tab
10. No visual regressions on the FAQ page, homepage, or other pages

---

## 10. Open Questions / Future Considerations

- Exact amber/gold shade for Instagram accent (e.g., `amber-500` vs a custom warm tone)
- Whether the address card's icon should get a very soft warm-gray shift or stay pure zinc
- Whether the cards should have a very subtle `ring-1 ring-black/[0.02]` on hover for extra polish
