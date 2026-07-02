# Visual QA Report — `resort-visual-evaluator` (L3)

**Date:** 2026-07-02  
**Scope:** Root template `src/` top page and shared UI  
**Files reviewed:** `src/app/[locale]/page.tsx`, `src/app/[locale]/layout.tsx`, `src/app/globals.css`, `src/data/resort-template.ts`, `src/lib/motion.ts`, `src/lib/use-scroll-reveal.ts`, `src/components/layout/*`, `src/components/sections/*`, `src/components/ui/*`  
**Out of scope:** `resorts/Sichinohe-CyoueiSki/web/` map fleet, LP mock assets

---

## Verdict

**FAIL**

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **V1** Typography hierarchy | **PASS** | `src/app/[locale]/layout.tsx` loads **Syne**, **DM Sans**, **IBM Plex Mono**, and **Noto Sans JP**. `src/app/globals.css` sets body to `1rem / 1.75`, defines `.font-display` and `.font-mono-metrics`, and `HeroSection` uses `font-display text-4xl md:text-5xl lg:text-6xl` with editorial line control. `SectionHeading` keeps a single H2 style across `BentoExploreGrid`, `TicketPricing`, `NewsSection`, and `AccessSection`. |
| **V2** Spacing rhythm | **FAIL** | Major content sections mostly follow `py-16 md:py-24` (`BentoExploreGrid`, `TicketPricing`, `NewsSection`, `AccessSection`), but `PrimaryCtaBand` breaks the page rhythm with `py-6` in `src/components/sections/PrimaryCtaBand.tsx`. The bento grid also drops to `gap-3` on mobile in `src/components/sections/BentoExploreGrid.tsx`, while the spec calls for `gap-4` consistency. |
| **V3** Photo / visual assets | **FAIL** | `src/data/resort-template.ts` points the hero to `/images/hero-sichinohe.png`, while `docs/final_requirements.md` specifies the v2 approved hero asset as `/public/images/hero-sichinohe.svg`. The local asset is not an Unsplash blocker, but the implementation currently diverges from the approved canonical hero asset. Bento thumbnails remain Unsplash-hosted in the same file; that is WARN-level only per spec. |
| **V4** Micro-interactions | **PASS** | `src/lib/motion.ts` matches the required reveal curve (`y:24→0`, ease `[0.22, 1, 0.36, 1]`, stagger `0.08`). `HeroSection` implements a one-way `scale: 1.04` over 12s and disables it with `useReducedMotion`. `AnimatedCounter` falls back to static values under reduced motion, and `use-scroll-reveal.ts` swaps to static variants when motion should be reduced. `BentoExploreGrid` adds explicit hover lift `y:-4` rather than relying on default-only Tailwind states. |
| **V5** Brand consistency | **FAIL** | `src/components/ui/Badge.tsx` uses hardcoded Tailwind color families (`bg-amber-50`, `text-amber-800`, `bg-emerald-50`, `bg-red-50`) instead of the approved token system (`--gold`, `--success`, `--danger`, `--alpine-soft`). This breaks the “globals.css tokens only” requirement and causes shared badges to drift away from the Alpine Clarity+ palette. No emoji UI icons were found; `MobileBottomNav` correctly uses SVG paths. |
| **V6** Benchmark alignment | **PASS** | The page clearly shows at least three benchmark-derived elements from `docs/design_concepts.md`: a LAAX-style three-metric `LiveStatusStrip`, an Awwwards-style asymmetric bento in `BentoExploreGrid`, and mono tabular metrics for snow/ticket values via `.font-mono-metrics`. |

---

## Blockers

- **V5 ship blocker:** Refactor `src/components/ui/Badge.tsx` to use the approved design tokens instead of raw Tailwind amber/emerald/red utility colors.
- **V3 ship blocker:** Align `src/data/resort-template.ts` hero selection with the approved v2 hero asset (`/images/hero-sichinohe.svg`) or update the visual spec if the PNG is the new canonical production asset.
- **V2 quality blocker:** Normalize section rhythm in `src/components/sections/PrimaryCtaBand.tsx` and restore mobile bento spacing in `src/components/sections/BentoExploreGrid.tsx` to the approved grid cadence.

---

## Re-occurrence prevention

Shared UI primitives must consume only `globals.css` design tokens; do not introduce raw palette utilities into reusable components.

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → root template UI shippable
```
