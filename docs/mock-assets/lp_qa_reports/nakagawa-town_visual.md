# LP Visual QA — Nakagawa Town (`nakagawa-town-lp`)

**Date:** 2026-07-02  
**Evaluator:** `resort-visual-evaluator` (L3)  
**Target:** `docs/mock-assets/nakagawa-town-lp/` (`index.html`, `mock.css`, `lp-mock-nakagawa-town-*.png`)  
**Standards:** `docs/mock-assets/lp_mock_requirements.md` LP-V1–V6  
**Canonical CSS:** `sichinohe-lp/mock.css` (factory baseline)  
**Brief:** `configs/lp-brief/nakagawa-town.yaml` (`archetype: live-dashboard`, `copyFrom: minami-furano-lp`)

---

## Verdict

**PASS**

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **LP-V1** Typography hierarchy | **PASS** | Clear scale: `.eyebrow` (Syne, 0.625rem, uppercase, `letter-spacing: 0.2em`) → `.hero-title` `clamp(2rem, 8vw, 3.75rem)` → `.heading-lg` `clamp(1.75rem, 5vw, 2.75rem)` → `.lead` / `.lead-whisper` → body `1rem` / `line-height: 1.75` (`mock.css` L59–87, L249–257, L68–74, L23–30). IBM Plex Mono on `.badge-price`, `.live-updated`, `.journey-step__num`, `.access-postal`, `.hashtag` (`mock.css` L95–98, L317–321, L633–637, L724, L707–713). Editorial rhythm via transit-grid offset card, highlight-duet, and journey steps (`index.html` L91–126, L157–190, L262–288) — not BBS flat-list. **WARN:** `.hero-title` and `.heading-lg` inherit Noto Sans JP (no explicit `font-family: Syne`); only `.eyebrow` uses Syne — same gap as `kirigamine-lp` / `kamikawa-nakayama-lp`. **WARN:** hero clamp max `3.75rem` is below written spec band `clamp(2.5rem, 8vw, 4.5rem)`. |
| **LP-V2** Spacing rhythm | **PASS** | Token parity with canonical: `--section: clamp(5rem, 14vw, 9rem)`, `--inner: clamp(1.25rem, 4vw, 3rem)`, `.inner` `max-width: 72rem` (`mock.css` L15–17, L50–57). `.section { padding: var(--section) 0 }` uniform (`L57`). Grids: `.path-grid` `gap: 1rem` (`L451`), `.status-grid` `gap: 0.75rem` (`L326`). Compact `.live-dashboard` (`padding: 1.25rem 0`, `L274–278`) matches `live-dashboard` archetype strip. **WARN:** `.highlight-secondary` retains pre-kamikawa negative-margin / absolute overlay pattern (`margin-top: -2.5rem` mobile, `position: absolute` at 1024px — `mock.css` L531–550). `kamikawa-nakayama-lp` refactored to grid stack without overlap; this LP regresses that fix and may fail LP-Q8 manual check at 375px on `#highlights`. |
| **LP-V3** Visual assets | **PASS** | Four dedicated `lp-mock-nakagawa-town-*.png` on disk (hero 2.7 MB, night 2.5 MB, hub 2.4 MB, station 2.7 MB). SHA-256 cross-check against all other `lp-mock-*.png` in `docs/mock-assets/` — **all four UNIQUE** (prefixes `97093a6f`, `0900bc99`, `6a07cf0a`, `916ac300`). Map hero `images/maps/nakagawa-town-hero.png` 3.4 MB (distinct asset). No Unsplash URLs, SVG doodles, or broken `src`. Hero `.hero-overlay` gradient + `object-fit: cover` (`mock.css` L231–239, L224–228); section images have `width`/`height` and `data-i18n-attr` alt wiring (`index.html` L39, L96–101, L165–170, L211–216, L229–234). **WARN:** `#highlights` primary reuses `lp-mock-nakagawa-town-hero.png` (`index.html` L166) — same-facility reuse only; dedicated powder/dashboard PNG would strengthen editorial variety. **WARN:** HTML `alt` fallbacks still describe 南ふらの/マリオット until i18n hydrates (`index.html` L214, L232). |
| **LP-V4** Micro-interactions | **PASS** | `.btn` / `.btn-secret` / `.btn-powder` / `.btn-map` hover `transform` + `box-shadow` with `--ease` (`mock.css` L182–211, L731). `.path-tile:hover` border + shadow (`L468–471`). `.btn-ghost:hover` background shift (`L211`). `.live-pulse` keyframe with `@media (prefers-reduced-motion: reduce)` stop (`L300–307`, L758–761). `html { scroll-behavior: smooth }` suppressed under reduced-motion (`L758–759`). |
| **LP-V5** Brand consistency | **PASS** | `:root` defines `--bg`, `--fg`, `--muted`, `--accent`, `--accent-powder`, `--accent-warm`, `--surface`, `--border`, `--live` (`mock.css` L3–17). Light base `--bg: #f4f7fa`; CTAs tokenized (`.btn-secret` → `--accent`, `.btn-powder` → `--accent-powder`, `.btn-map` → `--accent`) — no full-dark top UI. Facility palette: cool alpine `#2d5a7a` / powder `#4a8fb8`, differentiated from pippu crimson and kamikawa teal. No emoji UI icons; guide accordion uses `+`/`−` text (`index.html` L301, L313, L325). Google Map link uses inline SVG pin (`L363`). |
| **LP-V6** Archetype alignment | **PASS** | Brief `archetype: live-dashboard` (`configs/lp-brief/nakagawa-town.yaml`). Section stack matches live-dashboard lineage: hero (¥400 badges via i18n) → `#live` live-dashboard → sanctuary/transit-grid → `#paths` → `#highlights` → `#pass` (Powder400) → `#hike` (station walk) → `#tour` journey → `#guides` accordion → `#access` + Skyticket block. `messages/ja.json` strategy pillars (降雪API, 町民, 天塩中川駅) reflected in copy. **WARN:** `copyFrom: minami-furano-lp` — `index.html` retains 30+ minami-furano HTML fallbacks (国設南ふらの, Secret Powder Pass, マリオット, 富良野) under `data-i18n` nodes; runtime i18n masks this but no-JS / pre-hydration preview shows wrong resort. Skeleton is functionally correct for `live-dashboard`; content wiring in JSON is facility-specific. |

---

## Blockers

None. LP-V1 and LP-V5 both PASS — no visual re-implementation required for ship gate.

---

## WARN (non-blocking · cross-gate)

1. **Display Syne gap:** Add `font-family: Syne` to `.hero-title` (and optionally `.heading-lg`) per written LP-V1 spec.
2. **Hero clamp range:** `clamp(2rem, 8vw, 3.75rem)` below documented `clamp(2.5rem, 8vw, 4.5rem)` band — archetype parity, conservative on desktop.
3. **`#highlights` kirigamine-pattern CSS:** Refactor `.highlight-duet` / `.highlight-secondary` to `kamikawa-nakayama-lp` grid stack (no `margin-top: -2.5rem`, no `position: absolute` on secondary) before LP-Q8 sign-off.
4. **Intra-LP hero reuse:** `#highlights` primary duplicates hero PNG; consider `lp-mock-nakagawa-town-powder.png` or dashboard variant.
5. **HTML fallback residue:** Replace all minami-furano fallback strings in `index.html` with nakagawa-town copy (or neutral placeholders) — blocks `resort-qa-a11y` LP-Q4, not this visual gate.
6. **Header offset:** `.site-header { top: 1.75rem }` (`mock.css` L125) with no `.mock-banner` in `index.html` — minor top gap on local preview.

---

## CSS token comparison (nakagawa-town vs references)

| Token | `nakagawa-town-lp` | `kamikawa-nakayama-lp` | `sichinohe-lp` (factory) |
|-------|--------------------|-------------------------|--------------------------|
| `--bg` | `#f4f7fa` | `#f4f8fb` | `#f8f9fb` |
| `--accent` | `#2d5a7a` | `#1a5a72` | `#0b5f8c` |
| `--section` | `clamp(5rem, 14vw, 9rem)` | same | same |
| `--inner` | `clamp(1.25rem, 4vw, 3rem)` | same | same |
| Primary CTA | `.btn-secret` (`--accent`) | `.btn-free` (`--live`) | `.btn-primary` |
| `#highlights` layout | negative-margin duet (legacy) | grid stack (fixed) | transit-focused |

Nakagawa correctly forks palette for a northern Hokkaido town hill while inheriting the live-dashboard HTML/CSS skeleton from minami-furano.

---

## Prior incident check (V3 / factory)

| Check | Result |
|-------|--------|
| Cross-resort PNG rename | **Clear** — four SHA-256 hashes unique; zero byte-identical matches |
| SVG doodle replacement | **Clear** — all four section assets photorealistic PNG (2.4–2.7 MB) |
| minami-furano string residue in `messages/` | **Clear** — `messages/ja.json` / `en.json` facility-specific |
| minami-furano residue in `index.html` fallbacks | **Present** — 30+ nodes (LP-Q4 / implementer cleanup, not V5 FAIL) |
| Map hero distinct from LP hero | **Clear** — `images/maps/nakagawa-town-hero.png` separate file |

### Asset inventory

| File | Size | SHA-256 (prefix) |
|------|------|------------------|
| `lp-mock-nakagawa-town-hero.png` | 2,707,089 B | `97093A6FC5B819BC` |
| `lp-mock-nakagawa-town-night.png` | 2,476,946 B | `6A07CF0AE9CE4B4B` |
| `lp-mock-nakagawa-town-hub.png` | 2,436,440 B | `0900BC99157C2153` |
| `lp-mock-nakagawa-town-station.png` | 2,654,231 B | `916AC300127F2E26` |
| `images/maps/nakagawa-town-hero.png` | 3,429,467 B | (not cross-checked) |

---

## 再発防止

`copyFrom` 複製後は `index.html` の `data-i18n` フォールバックを grep（複製元 `{id}` ・施設名・戦略語）し、ビジュアル L3 前に `highlight-duet` を `kamikawa-nakayama-lp` グリッド版へ揃える。PNG は SHA-256 で複製元と照合する。

---

## Ship gate

```
lp_qa_reports/nakagawa-town.md (resort-qa-a11y) — pending
  + lp_qa_reports/nakagawa-town_visual.md (resort-visual-evaluator) PASS
  → guides 配信・クライアント提示可（a11y PASS + 機械検証 exit 0 が前提）
```

**Note:** This visual gate PASS does not substitute for mechanical `validate-mock-*.mjs` exit 0, LP-Q8 `#highlights` manual check, or Human Gate fact-check.
