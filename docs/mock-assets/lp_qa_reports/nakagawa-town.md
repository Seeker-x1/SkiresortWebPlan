# LP QA — nakagawa-town

| Field | Value |
|-------|-------|
| **Date** | 2026-07-02 |
| **Evaluator** | resort-qa-a11y (L3) |
| **Target** | `docs/mock-assets/nakagawa-town-lp/` (`index.html`, `mock.css`, `messages/ja.json`, `messages/en.json`) |
| **Basis** | `docs/mock-assets/lp_mock_requirements.md` LP-Q1–LP-Q9 · `configs/lp-brief/nakagawa-town.yaml` (strategy: live-dashboard · archetype: `live-dashboard` · `copyFrom: minami-furano-lp`) · `docs/research/inbox/nakagawa-town.md` |

## Verdict

**FAIL** — LP-Q4, LP-Q6, LP-Q8 block ship. Return to `resort-template-implementer`.

**Root cause:** `index.html` HTML fallbacks were not reconciled after `minami-furano-lp` template copy. `messages/*.json` describe 中川町民スキー場 (Powder400 / ¥400 / 天塩中川駅) but `index.html` still renders 国設南ふらのスキー場 fallbacks (Secret Powder Pass / ¥2,500 / 南富良野町) before i18n runs and in no-JS contexts. `#highlights` `.highlight-secondary` retains the kirigamine-class negative-margin overlay pattern.

## Mechanical validation table

| Script | Result | Notes |
|--------|--------|-------|
| `validate-mock-i18n.mjs` | exit 0 | `nakagawa-town-lp` 102 keys |
| `validate-mock-html-i18n.mjs` | exit 0 | 121 HTML keys OK; 2 unused resort keys (WARN) |
| `validate-mock-lp-shell.mjs` | exit 0 | `id=nakagawa-town` |
| `validate-mock-lp-copy.mjs` | exit 0 | No §1.1 inbound forbidden substrings |
| `validate-skyticket-affiliate.mjs` | exit 0 | `affiliates.rentacar: asahikawa_airport` |
| `validate-resort-guides-ids.mjs` | exit 0 | `NAME_SUBSTRINGS["nakagawa-town"]` = `["中川町民","中川町"]` |
| `validate-mock-japow-detail.mjs` | exit 0 | `japowResortId` 47 → `nakagawa-town` (`data/resort-guides.json:450–453`) |
| `validate-mock-japow-detail.mjs --public` | not run | Re-run after `guides/scripts/sync.mjs` before ship |

Mechanical exit 0 does **not** override manual LP-Q4/Q6/Q8 failures below.

## Rubric LP-Q1–LP-Q9

| ID | Result | Evidence |
|----|--------|----------|
| **LP-Q1** Mobile-first | **PASS** | `.btn` `min-height: 44px` (`mock.css:172–176`); `.lang-switch [data-lang-switch]` 44×44 (`../_shared/mock-i18n.css:8–11`); `.path-tile` `min-height: 10rem` (`mock.css:455–461`); path grid collapses to full width below 640px (`mock.css:495–501`); `.hero-title` `clamp(2rem, 8vw, 3.75rem)` (`mock.css:249–257`); no fixed elements >400px on 375px |
| **LP-Q2** Accessibility | **PASS** (WARN) | `:focus-visible` on links/buttons (`../_shared/mock-i18n.css:30–40`); decorative hero `alt=""` (`index.html:39`); meaningful images use `data-i18n-attr="alt:…"`; `prefers-reduced-motion` disables pulse, scroll, btn transform (`mock.css:305–307`, `758–761`); lang group `role="group"` + `aria-label` (`index.html:29–31`); sections `aria-labelledby` throughout. **WARN:** HTML `alt` fallbacks describe minami-furano scenes until i18n applies |
| **LP-Q3** Strategy conversion | **FAIL** | **Runtime (JS):** Hero CTAs → `#pass` / `#live` (`index.html:49–51`); live strip immediately below hero (`index.html:56–89`); `#highlights` live-dashboard pillar (`messages/ja.json:74–87`) aligns with brief (`nakagawa-town.yaml:12–32`). **Fallback / no-JS:** Hero shows 「国設南ふらのスキー場」「Secret Powder Pass」「8時間 ¥2,500」(`index.html:43–50`) — wrong facility and wrong strategy vs registry (`registry.json:2596–2598`) and JSON (`messages/ja.json:7–15`). Conversion path is coherent only after `mock-i18n.js`; static HTML misleads users and crawlers |
| **LP-Q4** i18n | **FAIL** | Validators exit 0 on key wiring, but HTML fallbacks violate spirit of §LP-Q4: extensive hardcoded JA for the **wrong resort** across hero, sanctuary, paths, highlights, pass, hike, tour, guides, access, footer (`index.html:18–406` vs `messages/ja.json`). **EN locale:** `messages/en.json:163–166` leaves `access.rentacarEyebrow`, `rentacarLink`, `rentacarNote`, `rentacarHint` in Japanese on the EN page. HTML `access-affiliate__eyebrow` fallback 「十勝・富良野圏」(`index.html:368`) is wrong region |
| **LP-Q5** Performance (static) | **PASS** | Hero `width`/`height` `1920×1080` (`index.html:39`); section images dimensioned; `.live-pulse` animation stopped under `prefers-reduced-motion` (`mock.css:305–307`); no autoplay GIFs; `next/image` N/A |
| **LP-Q6** Data separation | **FAIL** | Facility copy correctly isolated in `messages/ja.json` + `messages/en.json`; registry is single source for name/strategy/japow (`registry.json:2586–2606`). **Blocker:** `index.html` duplicates prices, address, phones, and region for **minami-furano** — e.g. `8時間 ¥2,500` (`index.html:46`), `〒079-2402 南富良野町字幾寅` (`index.html:349–350`), `0167-52-2143` (`index.html:353–354`), footer `© 国設南ふらのスキー場` (`index.html:401`) — while JSON has 中川町 data (`messages/ja.json:156–170`). Conflicts with §LP-Q6 single-source rule |
| **LP-Q7** Copy tone | **PASS** (WARN) | `validate-mock-lp-copy.mjs` exit 0; no §1.1 inbound forbidden strings. Headings are experience/place/action oriented. **WARN:** Internal strategy voice in guest copy — 「サブスク型集客」「デジタルギャップ」(`messages/ja.json:79`, `85`, `144`); `access.rentacarEyebrow` duplicates registry strategy line into affiliate UI (`messages/ja.json:163`, `en.json:163`) |
| **LP-Q8** Layout integrity | **FAIL** | `.highlight-secondary` uses `margin-top: -2.5rem` + desktop `position: absolute` (`mock.css:531–550`) — same anti-pattern as kirigamine 2026-06 incident (`lp_qa_reports/kirigamine.md`). On 375px the secondary card overlaps `#highlights` primary body where `btn-powder` sits (`index.html:173–178`, `mock.css:523–540`). §LP-Q8 forbids z-index + negative-margin CTA overlap |
| **LP-Q9** JAPOW「詳細確認」 | **PASS** | `resort-guides.guides["47"].registryId` === `nakagawa-town` (`data/resort-guides.json:450–453`); `registry.japowResortId` 47 (`registry.json:2602`); `guideUrl` `https://guides.japowserch.com/nakagawa-town/` (`registry.json:2601`); `validate-resort-guides-ids.mjs` + `validate-mock-japow-detail.mjs` exit 0. **Note:** `--public` sync validation not run in this audit |

## Blockers (return to implementer)

| Priority | Item | Fix |
|----------|------|-----|
| P0 | **minami-furano HTML fallback residue** | Replace all `index.html` fallback text with `messages/ja.json` values (or sync via factory Step 5–6). Grep targets: `国設南ふらの`, `Secret Powder`, `南富良野`, `かなやま`, `マリオット`, `幾寅`, `8時間 ¥2,500`, `十勝・富良野` |
| P0 | **LP-Q8 highlight-duet** | Refactor `mock.css` `.highlight-duet` / `.highlight-secondary` to mobile stack + desktop grid without negative-margin / absolute overlay on interactive rows (see fixed `kirigamine-lp/mock.css` pattern) |
| P1 | **EN rentacar strings** | Translate `messages/en.json` `access.rentacarEyebrow`, `rentacarLink`, `rentacarNote`, `rentacarHint`; use experience copy not raw `registry.strategy` |
| P2 | **Copy tone polish** | Rephrase 「サブスク型集客」「デジタルギャップ」in `messages/ja.json` to guest-facing facts (optional for PASS; recommended before Human Gate) |

## WARN (non-blocking after blockers fixed)

| Item | Detail |
|------|--------|
| Hardcoded “Live” chip | `index.html:61` — not in resort JSON; EN page shows English amid localized dashboard |
| `<meta title>` / description | JA-only in `<head>` (`index.html:6–7`); runtime swap depends on `mock-i18n.js` |
| `mock.css` comment | Line 1 says 「LP案モック」 — CSS comment only, not user-visible |
| Unused message keys | 2 keys per `validate-mock-html-i18n.mjs` — expected shell parity |
| `copyFrom: minami-furano-lp` | Intentional per brief; residue cleanup is mandatory post-copy per `lp-factory-no-shortcuts` |

## Ship gate footer

```
Mechanical validation exit 0
  + resort-qa-a11y FAIL (LP-Q3, LP-Q4, LP-Q6, LP-Q8)   ← this audit
  + resort-visual-evaluator PASS (LP-V1–V6)             ← not run; required before ship
  + Human Gate (facts: ¥400, 積雪次第開館, ロープトウ昼休み)
→ guides 配信不可 — fix blockers, re-run L3
```

**a11y PASS alone is not ship.** Both L3 evaluators must PASS before guides delivery.
