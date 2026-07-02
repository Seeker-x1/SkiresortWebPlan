# QA / a11y Report — Root template

**Date:** 2026-07-02  
**Scope:** `src/` root template pages and shared components, plus `messages/ja.json` and `messages/en.json`  
**Evaluator:** `resort-qa-a11y` (L3)  
**Out of scope:** `docs/mock-assets/*`, Sichinohe production `/map`

---

## Verdict

**FAIL** — the root template is not shippable yet because **Q4 i18n** fails in a shared component.

`resort-qa-a11y` PASS alone is not sufficient for ship; `resort-visual-evaluator` must also PASS.

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **Q1** Mobile-first | **PASS** | Mobile controls meet target sizing in reviewed code: `LangSwitcher` buttons use `min-h-[44px] min-w-[44px]`, header menu button is `h-11 w-11`, `Button` enforces `min-h-[44px]`, and bottom nav links use `min-h-[56px]` with safe-area padding via `pb-[env(safe-area-inset-bottom)]`. Layout primitives are fluid (`max-w-6xl`, grid/flex) and no fixed-width overflow risk was found in the root home page components. |
| **Q2** Accessibility | **PASS** | Keyboard focus is visible through shared focus styles in `src/app/globals.css` and `src/components/ui/Button.tsx`. Skip link is present in `src/app/[locale]/page.tsx`. Meaningful hero imagery uses translated `alt` text in `messages/*.json` and decorative card images use `alt=""` in `src/components/sections/BentoExploreGrid.tsx`. Reduced-motion handling exists in `src/app/globals.css`, `src/lib/use-scroll-reveal.ts`, `src/components/sections/HeroSection.tsx`, and `src/components/ui/AnimatedCounter.tsx`. Lang switcher has `role="group"` and an accessible label in `src/components/layout/LangSwitcher.tsx`. |
| **Q3** Conversion path | **PASS** | The home flow is linear and visible: hero → live status → dual CTA → ticket pricing in `src/app/[locale]/page.tsx`. Users can reach status and ticket actions within the first scroll and tickets within three taps or fewer. |
| **Q4** i18n | **FAIL** | Shared component `src/components/sections/PrimaryCtaBand.tsx` hardcodes Japanese in `aria-label="主要アクション"`. This violates the root-template rule of no hardcoded Japanese in components and means `/en` still serves Japanese component copy. Locale routing itself is correct (`/` default ja, `/en` explicit en) via `src/i18n/routing.ts`, `src/middleware.ts`, and `src/app/[locale]/layout.tsx`. |
| **Q5** Performance | **PASS** | Hero uses `next/image` with `priority` in `src/components/sections/HeroSection.tsx`. Motion loops are guarded for reduced motion (`live-pulse` CSS override, reveal hooks, hero image motion, animated counter). `npm run build` completed successfully on 2026-07-02. |
| **Q6** Data separation | **PASS** | Locale-dependent copy lives in `messages/ja.json` and `messages/en.json`, while prices, URLs, counts, and other non-locale data are centralized in `src/data/resort-template.ts` and combined in `src/lib/get-resort-data.ts`. No duplicated price/URL constants were found across locale message files. |

---

## Failing items

1. **Q4 i18n**  
   `src/components/sections/PrimaryCtaBand.tsx` contains hardcoded Japanese in a shared component:
   - `aria-label="主要アクション"`

This is a ship blocker for the root template because the English route should not expose Japanese-only component strings.

---

## Verification notes

- Reviewed locale routing and message wiring in `src/i18n/*`, `src/app/[locale]/*`, and `messages/*.json`.
- Reviewed shared mobile navigation, buttons, footer, and section components under `src/components/`.
- Ran `npm run build` successfully.  
- Build warning observed: Next.js reports that `middleware` is deprecated in favor of `proxy`; this is **not** a Q1–Q6 blocker for this QA pass.

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → root template UI shippable
```
