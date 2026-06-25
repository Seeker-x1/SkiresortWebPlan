# LP Visual QA — Kamikawa Nakayama (`kamikawa-nakayama-lp`)

**Date:** 2026-06-25  
**Evaluator:** `resort-visual-evaluator` (L3)  
**Target:** `docs/mock-assets/kamikawa-nakayama-lp/` (`index.html`, `mock.css`, `lp-mock-kamikawa-nakayama-*.png`)  
**Standards:** `docs/mock-assets/lp_mock_requirements.md` LP-V1–V6  
**Canonical CSS:** `sichinohe-lp/mock.css` (factory baseline), `gokazan-lp/mock.css` (`local-value` archetype reference per `configs/lp-brief/kamikawa-nakayama.yaml`)

---

## Verdict

**PASS**

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **LP-V1** Typography hierarchy | **PASS** | Clear scale: `.eyebrow` (Syne, 0.625rem, uppercase, `letter-spacing: 0.2em`) → `.hero-title` `clamp(2rem, 8vw, 3.75rem)` → `.heading-lg` `clamp(1.75rem, 5vw, 2.75rem)` → `.lead` / `.lead-whisper` → body `1rem` / `line-height: 1.75` (`mock.css` L59–87, L268–276, L68–74, L23–30). IBM Plex Mono on `.badge-price`, `.live-updated`, `.journey-step__num`, `.access-postal`, `.culture-badge`, `.hashtag` (`mock.css` L89–98, L336–340, L654–658, L745, L129–139, L728–734). Editorial layout via transit-grid offset card, highlight-duet, and journey steps (`index.html` L91–126, L167–194, L267–288) — not BBS flat-list. **WARN:** `.hero-title` and `.heading-lg` inherit Noto Sans JP (no explicit `font-family: Syne`); `.eyebrow` alone uses Syne — same gap as `kirigamine-lp` / `pippu-lp` archetype parity. |
| **LP-V2** Spacing rhythm | **PASS** | Token parity with canonical: `--section: clamp(5rem, 14vw, 9rem)`, `--inner: clamp(1.25rem, 4vw, 3rem)`, `.inner` `max-width: 72rem` (`mock.css` L15–17, L50–57). `.section { padding: var(--section) 0 }` uniform (`L57`). Grids: `.path-grid` `gap: 1rem` (`L470`), `.status-grid` `gap: 0.75rem` (`L345`), `.highlight-duet` grid stack / 2-col at 1024px (`L523–572`) — no negative-margin CTA overlay on `#highlights` (kirigamine incident pattern avoided). Compact `.live-dashboard` (`padding: 1.25rem 0`, `L293–298`) matches archetype strip, not a section-padding outlier. |
| **LP-V3** Visual assets | **PASS** | Four dedicated `lp-mock-kamikawa-nakayama-*.png` on disk: hero 3.1 MB, powder 2.2 MB, lodge 2.6 MB, ramen 2.3 MB. Map hero `images/maps/kamikawa-nakayama-hero.png` 3.8 MB (distinct from `pippu-hero.png` and all LP section PNGs). SHA-256 cross-check against every other `lp-mock-*.png` in `docs/mock-assets/` — **no byte-identical copies**. No Unsplash URLs, SVG doodles, or broken `src`. Hero `.hero-overlay` gradient + `object-fit: cover` (`mock.css` L250–258, L243–248); section images have `width`/`height` and `data-i18n-attr` alt wiring (`index.html` L39, L96–101, L170–175, L216–221, L234–239). **WARN:** `#freemium` reuses `lp-mock-kamikawa-nakayama-hero.png` (`index.html` L217) — same-facility reuse only, not cross-resort copy; a dedicated freemium/rental PNG would strengthen editorial variety. |
| **LP-V4** Micro-interactions | **PASS** | `.btn` / `.btn-free` / `.btn-powder` / `.btn-map` hover `transform` + `box-shadow` with `--ease` (`mock.css` L191–222, L751–752). `.path-tile:hover` border + shadow (`L487–490`). `.btn-ghost:hover` background shift (`L230`). `.live-pulse` keyframe with `@media (prefers-reduced-motion: reduce)` stop (`L309–326`, L779–782). `html { scroll-behavior: smooth }` suppressed under reduced-motion (`L779–781`). |
| **LP-V5** Brand consistency | **PASS** | `:root` defines `--bg`, `--fg`, `--muted`, `--accent`, `--accent-powder`, `--accent-warm`, `--surface`, `--border`, `--live` (`mock.css` L3–17). Light base `--bg: #f4f8fb`; CTAs tokenized (`.btn-free` → `--live`, `.btn-powder` → `--accent-powder`, `.btn-map` → `--accent`) — no full-dark top UI. Facility palette: cool alpine teal `#1a5a72` / powder `#3d7a9e`, differentiated from gokazan `#1a4f72` and pippu crimson. No emoji UI icons; guide accordion uses `+`/`−` text (`index.html` L301, L313, L325). Google Map link uses inline SVG pin, not emoji (`L362`). |
| **LP-V6** Archetype alignment | **PASS** | Brief `archetype: local-value` (`configs/lp-brief/kamikawa-nakayama.yaml`). Section stack reflects freemium · Sounkyo hub strategy: hero (無料リフト badges) → live-dashboard → sanctuary (powder) → paths → highlights (清潔施設 / 黒岳棲み分け) → `#freemium` (replaces gokazan `#pass`) → `#wellness` (上川ラーメン) → tour journey → guides accordion → access + Skyticket block. Freemium-first hero CTA (`#freemium`) matches strategy pillar. **WARN:** HTML/CSS skeleton follows `pippu-lp` / `kirigamine-lp` transit-onsen lineage (live strip + transit-grid + highlight-duet) rather than gokazan nav (`#pass`); content and section IDs are correctly adapted for local-value + freemium — not a structural FAIL. |

---

## Blockers

None. V1 and V5 both PASS — no visual re-implementation required.

---

## WARN (non-blocking)

1. **Display Syne gap:** Add `font-family: Syne` to `.hero-title` (and optionally `.heading-lg`) to align with written LP-V1 spec; `.eyebrow` already uses Syne.
2. **Hero clamp range:** `clamp(2rem, 8vw, 3.75rem)` is below the documented `clamp(2.5rem, 8vw, 4.5rem)` band — acceptable as archetype parity, slightly conservative on desktop.
3. **Intra-LP hero reuse:** `#freemium` section image duplicates hero PNG; consider `lp-mock-kamikawa-nakayama-rental.png` or lodge variant for visual variety.
4. **Archetype skeleton:** `local-value` brief with transit-onsen HTML fork — functionally correct for freemium strategy; optional future refactor toward `gokazan-lp` `#pass` naming if factory standardizes local-value nav labels.

---

## CSS token comparison (kamikawa-nakayama vs references)

| Token | `kamikawa-nakayama-lp` | `gokazan-lp` (`local-value`) | `pippu-lp` (skeleton source) | `sichinohe-lp` (factory) |
|-------|------------------------|------------------------------|------------------------------|--------------------------|
| `--bg` | `#f4f8fb` | `#f6f8fb` | `#faf7f5` | `#f8f9fb` |
| `--accent` | `#1a5a72` | `#1a4f72` | `#b8324a` | `#0b5f8c` |
| `--section` | `clamp(5rem, 14vw, 9rem)` | same | same | same |
| `--inner` | `clamp(1.25rem, 4vw, 3rem)` | same | same | same |
| Primary CTA | `.btn-free` (`--live`) | `.btn-pass` | `.btn-secret` | `.btn-primary` |
| Strategy section | `#freemium` | `#pass` | `#bundle` / wellness | transit-focused |

Kamikawa correctly forks the shared LP skeleton with facility-specific accent (alpine teal + live green freemium CTA) rather than copying gokazan or pippu palettes wholesale.

---

## Prior incident check (V3)

| Check | Result |
|-------|--------|
| Pippu / gokazan / kirigamine PNG rename | **Clear** — four distinct SHA-256 prefixes; zero byte-identical matches across repo |
| SVG doodle replacement | **Clear** — all four section assets photorealistic PNG (2.1–3.1 MB) |
| `#PippuPowder` / pippu / gokazan string residue in HTML/CSS/messages | **Clear** — grep clean |
| Map hero distinct from LP hero | **Clear** — `images/maps/kamikawa-nakayama-hero.png` SHA256 `4CF8E626…` ≠ any `lp-mock-*.png` |

### Asset inventory

| File | Size | SHA-256 (prefix) |
|------|------|------------------|
| `lp-mock-kamikawa-nakayama-hero.png` | 3,109,803 B | `11BC297A2D3DBC8B` |
| `lp-mock-kamikawa-nakayama-powder.png` | 2,173,761 B | `D35ACD40E3440EA8` |
| `lp-mock-kamikawa-nakayama-lodge.png` | 2,610,396 B | `535C276FF5E1484D` |
| `lp-mock-kamikawa-nakayama-ramen.png` | 2,322,330 B | `055C146F9067A7F8` |
| `images/maps/kamikawa-nakayama-hero.png` | 3,774,666 B | `4CF8E6260A1327B3` |

---

## 再発防止

新規 `{id}-lp` 追加後は `lp-mock-{id}-*.png` の SHA-256 を複製元（pippu / gokazan / kirigamine 等）と照合し、ビジュアル L3 前にアセット固有性を機械確認する。同一 LP 内での hero 画像の二重使用は V3 WARN として記録する。

---

## Ship gate

```
lp_qa_reports/kamikawa-nakayama.md (resort-qa-a11y) PASS
  + lp_qa_reports/kamikawa-nakayama_visual.md (resort-visual-evaluator) PASS
  → guides 配信・クライアント提示可
```

**Note:** This visual gate PASS does not substitute for mechanical `validate-mock-*.mjs` exit 0 or Human Gate fact-check.
