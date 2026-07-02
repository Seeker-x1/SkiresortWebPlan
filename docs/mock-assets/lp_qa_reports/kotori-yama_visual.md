# LP Visual QA — Kotoriyama (`kotori-yama-lp`)

**Date:** 2026-07-02  
**Evaluator:** `resort-visual-evaluator` (L3)  
**Target:** `docs/mock-assets/kotori-yama-lp/` (`index.html`, `mock.css`, `lp-mock-kotori-yama-*.png`)  
**Standards:** `docs/mock-assets/lp_mock_requirements.md` LP-V1–V6  
**Canonical CSS:** `sichinohe-lp/mock.css` (factory baseline), `shinjo-lp` (`copyFrom` per `configs/lp-brief/kotori-yama.yaml`)

---

## Verdict

**PASS**

---

## Rubric

| ID | Result | Evidence |
|----|--------|----------|
| **LP-V1** Typography hierarchy | **PASS** | Clear scale: `.eyebrow` (Syne, 0.625rem, uppercase, `letter-spacing: 0.2em`) → `.hero-title` `clamp(2rem, 8vw, 3.75rem)` → `.heading-lg` `clamp(1.75rem, 5vw, 2.75rem)` → `.lead` / `.lead-whisper` → body `1rem` / `line-height: 1.75` (`mock.css` L59–87, L232–240, L68–74, L23–30). IBM Plex Mono on `.badge-price`, `.badge-visitor`, `.live-updated`, `.journey-step__num`, `.price-card__value`, `.access-postal`, `.hashtag` (`mock.css` L95–98, L300–304, L654–658, L614–618, L745, L728–734). Editorial rhythm via transit-grid offset card, highlight-duet, journey steps, and path-grid bento (`index.html` L93–125, L166–199, L338–375) — not BBS flat-list. **WARN:** `.hero-title` and `.heading-lg` inherit Noto Sans JP (no explicit `font-family: Syne`); only `.eyebrow` uses Syne — same gap as `kirigamine-lp` / `kamikawa-nakayama-lp` archetype parity. |
| **LP-V2** Spacing rhythm | **PASS** | Token parity with canonical: `--section: clamp(5rem, 14vw, 9rem)`, `--inner: clamp(1.25rem, 4vw, 3rem)`, `.inner` `max-width: 72rem` (`mock.css` L15–17, L50–57). `.section { padding: var(--section) 0 }` uniform (`L57`). Grids: `.path-grid` `gap: 1rem` (`L435`), `.status-grid` `gap: 0.75rem` (`L309`). Compact `.live-dashboard` (`padding: 1.25rem 0`, `L257–262`) matches archetype live strip. `.access-section` uses slightly reduced `clamp(3rem, 8vw, 5rem)` (`L737`) — intentional footer compaction, not a 2× section outlier. **WARN:** `.highlight-secondary` uses `position: absolute` at `min-width: 1024px` (`L527–536`) — pippu/kirigamine lineage; recommend manual LP-Q8 check at 375px and 1280px that primary CTA in `.highlight-primary-body` is not obscured. |
| **LP-V3** Visual assets | **PASS** | Four dedicated `lp-mock-kotori-yama-*.png` on disk (hero 2.7 MB, transit 3.0 MB, family 2.5 MB, spa 2.7 MB). Photorealistic AI PNGs — no SVG doodles, Unsplash URLs, or broken `src`. Hero `.hero-overlay` gradient + `object-fit: cover` (`mock.css` L214–223, L207–212); section images have `width`/`height` and `data-i18n-attr` alt wiring (`index.html` L41, L98–104, L174–180, L233–239, L251–257, L291–297, L309–315). No cross-resort template residue in HTML/CSS grep. **WARN:** Intra-LP reuse — `hero.png` in `#highlights` primary (`L175`), `transit.png` in `#pass` (`L234`), `family.png` in both `#rental` and `#family` (`L252`, `L310`); same-facility only, but editorial variety is reduced vs. six distinct crops. |
| **LP-V4** Micro-interactions | **PASS** | `.btn` / `.btn-gold` / `.btn-map` hover `transform` + `box-shadow` with `--ease` (`mock.css` L171–186, L751–752). `.btn-ghost:hover` background shift (`L194`). `.path-tile:hover` border + shadow (`L451–454`). `.live-pulse` keyframe with `@media (prefers-reduced-motion: reduce)` stop (`L283–290`). `html { scroll-behavior: smooth }` and `.btn:hover { transform: none }` under reduced-motion (`L778–781`). `:focus-visible` from shared `../_shared/mock-i18n.css` (`L36–40`). |
| **LP-V5** Brand consistency | **PASS** | `:root` defines `--bg`, `--fg`, `--muted`, `--accent`, `--accent-yotei`, `--accent-warm`, `--surface`, `--border`, `--live` (`mock.css` L3–17). Light base `--bg: #f4f6f5`; CTAs tokenized (`.btn-gold` / `.btn-map` → `--accent`, `.btn-ghost` → `--border` / `--accent-soft`) — no full-dark top UI. Facility palette: forest green `#2a5a4a` + warm `#b86b3a`, differentiated from shinjo/pippu palettes. No emoji UI icons; guide accordion uses `+`/`−` text (`index.html` L386, L398, L410). Google Map link uses inline SVG pin (`L447`). |
| **LP-V6** Archetype alignment | **PASS** | Brief `archetype: local-value`, `copyFrom: shinjo-lp` (`configs/lp-brief/kotori-yama.yaml`). Section stack reflects 貸切ローカル × 温泉回遊 strategy: hero (ロープトー / 貸切感 badges) → live-dashboard → transit-grid → paths → highlights (コスパ / ロープトー) → `#pass` → `#rental` → `#spa` → `#family` → journey (`#workation`) → guides accordion → access + Skyticket block. Hero CTA to `#pass` matches value pillar. **WARN:** `#workation` section ID is template legacy naming; content correctly presents Snow · Food · Spa day loop. Skeleton follows transit-onsen lineage (live strip + highlight-duet absolute card) rather than minimal gokazan `#pass`-only nav — content adapted, not structural FAIL. |

---

## Blockers

None. V1 and V5 both PASS — no visual re-implementation required.

---

## WARN (non-blocking)

1. **Display Syne gap:** Add `font-family: Syne` to `.hero-title` (and optionally `.heading-lg`) to align with written LP-V1 spec; `.eyebrow` alone uses Syne.
2. **Hero clamp range:** `clamp(2rem, 8vw, 3.75rem)` is below the documented `clamp(2.5rem, 8vw, 4.5rem)` band — acceptable as archetype parity, slightly conservative on desktop.
3. **Intra-LP image reuse:** Three PNGs serve six image slots (`hero`→highlights, `transit`→pass, `family`→rental+family); consider dedicated `lp-mock-kotori-yama-pass.png` or `lp-mock-kotori-yama-value.png` for editorial variety.
4. **Highlight-duet overlay:** Desktop `position: absolute` on `.highlight-secondary` (`mock.css` L527–536) — verify with LP-Q8 manual pass that `.highlight-primary-body` CTA is fully tappable at 375px and unobscured at 1280px.
5. **Section ID legacy:** `#workation` wrapper for snow-spa day journey — cosmetic naming only; content matches brief pillars.

---

## Asset inventory

| File | Size |
|------|------|
| `lp-mock-kotori-yama-hero.png` | 2,691,512 B |
| `lp-mock-kotori-yama-transit.png` | 3,002,824 B |
| `lp-mock-kotori-yama-family.png` | 2,514,500 B |
| `lp-mock-kotori-yama-spa.png` | 2,748,131 B |
| `images/maps/kotori-yama-hero.png` | (map asset, separate from LP section PNGs) |

---

## 再発防止

新規 `{id}-lp` 追加後は `lp-mock-{id}-*.png` の件数と HTML `src` 参照を突合し、同一 LP 内の hero/section 二重使用は V3 WARN として L3 前に記録する。`highlight-duet` の desktop absolute 配置は LP-Q8 手動確認を a11y ゲートとセットで実施する。

---

## Ship gate

```
lp_qa_reports/kotori-yama.md (resort-qa-a11y) PASS
  + lp_qa_reports/kotori-yama_visual.md (resort-visual-evaluator) PASS
  → guides 配信・クライアント提示可
```

**Note:** This visual gate PASS does not substitute for mechanical `validate-mock-*.mjs` exit 0 or Human Gate fact-check.
