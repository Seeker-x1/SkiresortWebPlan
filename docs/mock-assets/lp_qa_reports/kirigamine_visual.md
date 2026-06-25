# LP Visual QA — Kirigamine (`kirigamine-lp`)

**Date:** 2026-06-24  
**Evaluator:** `resort-visual-evaluator` (L3)  
**Target:** `docs/mock-assets/kirigamine-lp/` (`index.html`, `mock.css`, `lp-mock-kirigamine-*.png`)  
**Standards:** `docs/mock-assets/lp_mock_requirements.md` LP-V1–V6  
**Canonical CSS:** `sichinohe-lp/mock.css` (factory baseline), `pippu-lp/mock.css` (same-archetype `transit-onsen` reference)

---

## Verdict

**PASS**

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **LP-V1** Typography hierarchy | **PASS** | Clear scale: `.eyebrow` (Syne, 0.625rem, uppercase) → `.hero-title` `clamp(2rem, 8vw, 3.75rem)` → `.heading-lg` `clamp(1.75rem, 5vw, 2.75rem)` → `.lead` / `.lead-whisper` → body `1rem` / `line-height: 1.75` (`mock.css` L59–87, L249–257, L68–74, L23–30). IBM Plex Mono on `.badge-price`, `.live-updated`, `.journey-step__num`, `.access-postal` (`mock.css` L95–98, L317–321, L633–637). No BBS flat-list layout; highlight duet + offset transit-card provide editorial rhythm (`index.html` L91–126, L172–199). **WARN:** `.hero-title` and `.heading-lg` inherit Noto Sans JP (no explicit `font-family: Syne`) — same as `pippu-lp/mock.css` L249–257, diverges from written spec “`.hero-title` + Syne”. |
| **LP-V2** Spacing rhythm | **PASS** | Token parity with canonical: `--section: clamp(5rem, 14vw, 9rem)`, `--inner: clamp(1.25rem, 4vw, 3rem)`, `.inner` `max-width: 72rem` (`mock.css` L15–17, L50–57). `.section { padding: var(--section) 0 }` uniform (`L57`). Grids use consistent `gap: 1rem` on `.path-grid` (`L452`), `0.75rem` on `.status-grid` (`L326`). Compact `.live-dashboard` strip (`padding: 1.25rem 0`) matches pippu archetype, not a section-padding outlier. |
| **LP-V3** Visual assets | **PASS** | Five dedicated `lp-mock-kirigamine-*.png` on disk (hero 3.0 MB, panorama 2.5 MB, kids 2.9 MB, food 2.0 MB, onsen 2.3 MB). SHA-256 prefixes differ from all `lp-mock-pippu-*.png` (no rename-only copy). Visual inspection: photorealistic family-ski hero, 360° plateau panorama, kids/magic-carpet tubing, Suwa-lake food/onsen — no SVG doodles or Unsplash URLs. Hero uses `.hero-overlay` gradient + `object-fit: cover` (`mock.css` L231–240, L224–228); all section `img` have `width`/`height` (`index.html` L39, L96–101, L175–180, L221–226, L239–244). |
| **LP-V4** Micro-interactions | **PASS** | `.btn` hover `transform` + `box-shadow` with `--ease` (`mock.css` L182–211). `.path-tile:hover` border + shadow (`L465–471`). `.live-pulse` animation with `@media (prefers-reduced-motion: reduce)` stop (`L305–307`, L758–761`). `html { scroll-behavior: smooth }` suppressed under reduced-motion (`L758–759`). |
| **LP-V5** Brand consistency | **PASS** | `:root` defines `--bg`, `--fg`, `--muted`, `--accent`, `--accent-powder`, `--surface`, `--border` (`mock.css` L3–17). Light base `--bg: #f5f9fc`; CTAs use tokenized `.btn-secret` / `.btn-powder` / `.btn-ghost` — no full-dark top UI. Facility palette differentiated from pippu (`--accent: #2d6a8f` alpine blue vs pippu `#b8324a`). No emoji UI icons; guide expand uses `+`/`−` text (`index.html` L314, L326). Single inline accent on live snow value via `var(--accent-powder)` (`L79`). |
| **LP-V6** Archetype alignment | **PASS** | Section stack matches `transit-onsen` reference (`pippu-lp/index.html`): hero → live-dashboard → sanctuary/transit-grid → paths → highlights duet → bundle → wellness → tour journey → guides accordion → access. Family strategy reflected in hero badges (未就学児無料, 3コース) and kids highlight. **WARN:** `.badge-strawberry` class name is pippu-template legacy; content is facility-specific via i18n. |

---

## Blockers

None. V1 and V5 both PASS — no visual re-implementation required.

---

## WARN (non-blocking)

1. **Display Syne gap:** Add `font-family: Syne` to `.hero-title` (and optionally `.heading-lg`) to align with written LP-V1 spec; currently matches pippu archetype but not ideal spec text.
2. **Hero clamp range:** `clamp(2rem, 8vw, 3.75rem)` is below the documented `clamp(2.5rem, 8vw, 4.5rem)` band — acceptable as pippu-parity but slightly conservative on desktop.
3. **Legacy class name:** `.badge-strawberry` carries pippu naming; cosmetic only, no visual defect.

---

## CSS token comparison (kirigamine vs canonical)

| Token | `kirigamine-lp` | `pippu-lp` (archetype) | `sichinohe-lp` (factory) |
|-------|-----------------|------------------------|--------------------------|
| `--bg` | `#f5f9fc` | `#faf7f5` | `#f8f9fb` |
| `--accent` | `#2d6a8f` | `#b8324a` | `#0b5f8c` |
| `--section` | `clamp(5rem, 14vw, 9rem)` | same | same |
| `--inner` | `clamp(1.25rem, 4vw, 3rem)` | same | same |
| Structure | transit-onsen full | reference | simplified transit |

Kirigamine correctly forks pippu layout/tokens with facility-specific accent (cool alpine blue-green) rather than copying pippu crimson.

---

## Prior incident check (V3)

| Check | Result |
|-------|--------|
| Pippu PNG rename | **Clear** — distinct hashes and file sizes |
| SVG doodle replacement | **Clear** — all five assets photorealistic PNG |
| `#PippuPowder` / pippu string residue in HTML/CSS | **Clear** — grep clean |

---

## 再発防止

新規 `{id}-lp` 追加後は `lp-mock-{id}-*.png` の SHA-256 を複製元と照合し、ビジュアル L3 前にアセット固有性を機械確認する。

---

## Ship gate

```
lp_qa_reports/kirigamine.md (resort-qa-a11y) PASS
  + lp_qa_reports/kirigamine_visual.md (resort-visual-evaluator) PASS
  → guides 配信・クライアント提示可
```

**Note:** This visual gate PASS does not substitute for mechanical `validate-mock-*.mjs` exit 0 or Human Gate fact-check.
