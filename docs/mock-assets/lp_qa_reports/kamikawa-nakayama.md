# LP QA — kamikawa-nakayama

| Field | Value |
|-------|-------|
| **Date** | 2026-06-25 |
| **Evaluator** | resort-qa-a11y (L3) |
| **Target** | `docs/mock-assets/kamikawa-nakayama-lp/` (`index.html`, `mock.css`, `messages/ja.json`, `messages/en.json`) |
| **Basis** | `docs/mock-assets/lp_mock_requirements.md` LP-Q1–LP-Q8 · `docs/mock-assets/LP_FACTORY_PROCEDURE.md` · `configs/lp-brief/kamikawa-nakayama.yaml` (strategy: freemium · Sounkyo snow-play hub · archetype: `local-value`) · affiliate shell reference: `docs/mock-assets/pippu-lp/index.html` |

## Verdict

**PASS** — LP-Q1–LP-Q8 all pass. `highlight-duet` uses grid stack / 2-column layout with **no** negative-margin overlay on interactive CTAs (kirigamine-incident pattern absent).

## Mechanical validation table

| Script | Result | Notes |
|--------|--------|-------|
| `validate-mock-i18n.mjs` | exit 0 | `kamikawa-nakayama-lp` 103 keys; 2 unused resort keys (WARN, reserved) |
| `validate-mock-html-i18n.mjs` | exit 0 | 118 HTML keys OK (index only) |
| `validate-mock-lp-shell.mjs` | exit 0 | `id=kamikawa-nakayama` (single-page LP) |
| `validate-mock-lp-copy.mjs` | exit 0 | No §1.1 inbound forbidden substrings |
| `validate-skyticket-affiliate.mjs` | exit 0 | Registry + `#access` wiring OK |
| `validate-resort-guides-ids.mjs` | exit 0 | Confirmed locally 2026-06-25 (16 mappings; `japowResortId` 36) |

Re-run locally (PowerShell):

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
node scripts/validate-resort-guides-ids.mjs
```

## Rubric LP-Q1–LP-Q8 table with evidence

| ID | Result | Evidence |
|----|--------|----------|
| **LP-Q1** Mobile-first | **PASS** | `.btn` `min-height: 44px` (`mock.css:191–196`); `.lang-switch [data-lang-switch]` 44×44 (`../_shared/mock-i18n.css:8–11`); `.path-tile` `min-height: 10rem` (`mock.css:474–479`); path grid collapses to `span-12` below 640px (`mock.css:514–520`); `.hero-title` `clamp(2rem, 8vw, 3.75rem)` (`mock.css:268–276`); `.inner` uses `clamp` padding — no fixed-width elements >400px on narrow viewports |
| **LP-Q2** Accessibility | **PASS** | `:focus-visible` on links/buttons (`../_shared/mock-i18n.css:30–40`); decorative hero `alt=""` (`index.html:39`); meaningful images use `data-i18n-attr="alt:…"` (`index.html:97–98`, `170–173`, etc.); `prefers-reduced-motion` disables pulse + scroll + btn transform (`mock.css:324–326`, `779–782`; `mock-i18n.css:42–44`); lang group `role="group"` + `aria-label` (`index.html:29–31`); sections `aria-labelledby` (`index.html:91`, `128`, `162`, …); guide accordion `aria-expanded` toggled in inline script (`index.html:412–434`) |
| **LP-Q3** Strategy conversion | **PASS** | Hero CTAs → `#freemium` / `#live` (`index.html:49–51`); live strip immediately below hero (`index.html:56–89`); `#highlights` free-lift strengths visible first scroll (`index.html:162–196`); `#paths` five tiles incl. freemium / access / today / tour / map (`index.html:132–158`); aligns with brief pillars freemium · corridor · powder (`configs/lp-brief/kamikawa-nakayama.yaml:25–31`) and strategy line (`registry.json:342–345`) |
| **LP-Q4** i18n | **PASS** | Mechanical validators exit 0; `data-mock-resort="kamikawa-nakayama"` (`index.html:2`); `../_shared/mock-i18n.js` loaded (`index.html:410`); `?lang=en` supported via `mock-i18n.js` (`document.documentElement.lang`) |
| **LP-Q5** Performance (static) | **PASS** | Hero `width`/`height` `1920×1080` (`index.html:39`); section images dimensioned (`index.html:100–101`, `174–175`, etc.); `.live-pulse` infinite animation stopped under `prefers-reduced-motion` (`mock.css:324–326`); no autoplay GIFs; `next/image` N/A |
| **LP-Q6** Data separation | **PASS** | Facility copy in `messages/ja.json` + `messages/en.json`; registry single source for name/region/strategy/affiliate (`docs/mock-assets/registry.json:331–352`); access address/phone/rentacar strings in JSON `access.*` only (`messages/ja.json:160–169`); prices in `freemium.specs` / `guides.*.body` JSON only — no duplicate hardcoding in HTML attributes |
| **LP-Q7** Copy tone | **PASS** | §1.1 forbidden inbound substrings absent; `validate-mock-lp-copy.mjs` exit 0. Headings are experience/place/action: e.g. `highlights.title` = 「無料の強み」(`messages/ja.json:84`), `wellness.title` = 「滑ったあと、上川ラーメンへ。」(`messages/ja.json:111`). No `インバウンド` / `inbound` in user-visible copy paths |
| **LP-Q8** Layout integrity | **PASS** | **`highlight-duet` check (primary):** grid vertical stack on mobile, 2-column at `min-width: 1024px` (`mock.css:523–572`); `.highlight-secondary` has `margin: 0`, `position: relative` — **no** `margin-top: negative` or `position: absolute` overlay on sibling CTA. `btn-powder`（ゲレンデマップ）at `index.html:183` sits in `.highlight-primary-body` below image — fully tappable. **`transit-card`:** mobile `margin-top: -4rem` overlaps image frame only (`mock.css:417–426`); CTAs in `.transit-actions` (`index.html:119–122`) are inside the card, not covered by adjacent sections. `#paths` tiles use non-overlapping grid (`mock.css:467–521`) |

### LP-Q8 — `highlight-duet` detail (kirigamine incident regression)

| Check | kamikawa-nakayama | kirigamine FAIL pattern |
|-------|-------------------|-------------------------|
| `.highlight-secondary` negative `margin-top` | **None** (`margin: 0`, `mock.css:554`) | `-2.5rem` overlay |
| `position: absolute` on secondary card | **No** (`position: relative`) | Covered primary CTA |
| Mobile layout | Grid `gap: 1.5rem`, stacked articles | Overlap hid `btn-powder` label |
| Desktop layout | `grid-template-columns: 1.15fr 0.85fr` side-by-side | Card rode on top of CTA row |

Manual review at 375px logical width: `#highlights` `.btn-powder` and `.highlight-secondary .btn-ghost` remain fully visible and unobstructed by adjacent cards.

### Affiliate · map · brief alignment (supplemental)

| Check | Result | Evidence |
|-------|--------|----------|
| Skyticket `#access` block | **PASS** | `rentacar-link.css`, `skyticket-rentacar.js`, `data-skyticket-rentacar-block/link/pixel` (`index.html:13`, `366–388`, `409`); destination `asahikawa_airport` (`registry.json:350–351`) |
| Resort map links | **PASS** | Header + highlights CTA `../map.html?resort=kamikawa-nakayama` (`index.html:22`, `183`); path tile (`index.html:153`) |
| Brief strategy on hero/paths | **PASS** | Tagline/badges match brief hero (`messages/ja.json:12–17` ↔ `kamikawa-nakayama.yaml:19–23`); paths cover freemium, access, today, tour, map |
| Other-resort ID grep | **PASS** | No `pippu` / `kirigamine` / `biei` / `比布` / `#Pippu` in rendered copy paths |

## Blockers (if FAIL)

None.

## WARN (non-blocking)

| Item | Detail |
|------|--------|
| Strategy voice in body copy | Guides accordion and `freemium.lead` retain mock-strategy phrasing (e.g. 「差別化要因」「収益を創出」「キャッシュ化」 in `messages/ja.json:87–100`, `144–148`) — not §1.1 forbidden, but polish before client presentation |
| `guides.snowPlay.title` | 「海外向け雪遊びレンタルパック」 — segment label on accordion heading; mechanical copy gate passes; consider guest-facing product name at visual/copy pass |
| Hardcoded “Live” label | `index.html:61` — not in i18n JSON; EN page shows English chip amid JA dashboard |
| `<meta title>` / description | Hardcoded JA in `<head>` (`index.html:6–7`); runtime title swap depends on `mock-i18n.js` |
| Unused message keys | 2 keys — expected for shell parity |
| `sanctuary.eyebrow` | JA JSON uses English eyebrow 「Free Japow」(`messages/ja.json:47`) — cosmetic |
| Single-page LP | No subpages (`corridor-stay` / `nearby-food` template CSS present in `mock.css:784+` but unused) — OK for brief `local-value` without `subPages` |
| HTML fallbacks shorter than JSON | e.g. `sanctuary.lead` / `highlights.primary.lead` in `index.html` are abbreviated vs `messages/ja.json` — runtime i18n uses JSON; fallbacks are file:// preview only |

## Ship gate footer

```
Mechanical validation exit 0
  + resort-qa-a11y PASS (LP-Q1–LP-Q8)          ← PASS (2026-06-25)
  + resort-visual-evaluator PASS (LP-V1–V6)     ← pending (run lp_qa_reports/kamikawa-nakayama_visual.md)
  + Human Gate (Phase 8)
→ guides 配信・クライアント提示可（visual L3 + Human Gate pending）
```

**a11y PASS alone is not ship.** Both L3 evaluators must PASS before guides delivery.
