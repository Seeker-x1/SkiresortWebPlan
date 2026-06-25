# LP QA — kirigamine

| Field | Value |
|-------|-------|
| **Date** | 2026-06-24 (re-eval after copy fixes) |
| **Evaluator** | resort-qa-a11y (L3) |
| **Target** | `docs/mock-assets/kirigamine-lp/` (`index.html`, `mock.css`, `messages/ja.json`, `messages/en.json`, `corridor-stay.html`, `nearby-food.html`, `nearby-onsen.html`) |
| **Basis** | `docs/mock-assets/lp_mock_requirements.md` LP-Q1–LP-Q7 · `docs/mock-assets/LP_FACTORY_PROCEDURE.md` · `configs/lp-brief/kirigamine.yaml` (strategy: entry-level family · archetype: `local-value`) · affiliate shell reference: `docs/mock-assets/pippu-lp/index.html` |

## Verdict

**PASS**（2026-06-24 re-eval）— LP-Q1–LP-Q8 all pass after `highlight-duet` overlap fix.

**Prior FAIL (LP-Q8):** `.highlight-secondary` used `margin-top: -2.5rem` + `position: absolute` on desktop, covering `btn-powder`（ゲレンデマップ）on 375px — screenshot-confirmed UX break. **Fixed:** grid stack / 2-column, no negative-margin overlay (`kirigamine-lp/mock.css`, same pattern in `pippu-lp/mock.css`).

## Fixes applied (2026-06-24)

| Key | Before (FAIL) | After (PASS) |
|-----|---------------|--------------|
| `guides.ecosystem.title` (JA) | 「エントリー層を広げる価格戦略」 | 「家族にやさしい料金」 (`messages/ja.json:151`; HTML fallback `index.html:313`) |
| `guides.ecosystem.body` (JA) | 業界戦略 voice（裾野・役割） | 料金・こどもの日・定休の事実記述 (`messages/ja.json:152`; `index.html:317–318`) |
| `highlights.secondary.lead` (JA) | 「教育エコシステム」 | SAJ公認スキー学校・レッスン内容のゲスト向け記述 (`messages/ja.json:97`; `index.html:194–195`) |
| `sanctuary.lead` + HTML fallbacks | pippu-era / 未同期 | JSON と `index.html:108–109` 一致（霧ヶ峰パノラマ・ファミリー向け地形） |
| `sanctuary.ctaBundle` fallback | 「料金・入浴券バンドル」 | 「料金・こどもの日」 (`index.html:120` ↔ `messages/ja.json:57`) |
| EN parity | — | `guides.ecosystem.title/body`, `highlights.secondary.lead` aligned (`messages/en.json:96–97`, `151–152`) |

Mechanical re-run 2026-06-24: all `validate-mock-*.mjs` + `validate-skyticket-affiliate.mjs` + `validate-resort-guides-ids.mjs` exit 0.

## Mechanical validation table

| Script | Result | Notes |
|--------|--------|-------|
| `validate-mock-i18n.mjs` | exit 0 | `kirigamine-lp` 172 keys; 68 unused resort keys (WARN, reserved subpage keys) |
| `validate-mock-html-i18n.mjs` | exit 0 | 122 HTML keys OK (index + 3 subpages) |
| `validate-mock-lp-shell.mjs` | exit 0 | `id=kirigamine` + 3 subpages |
| `validate-mock-lp-copy.mjs` | exit 0 | No §1.1 inbound forbidden substrings |
| `validate-skyticket-affiliate.mjs` | exit 0 | Registry + `#access` wiring OK |
| `validate-resort-guides-ids.mjs` | exit 0 | Confirmed locally 2026-06-24 (`scripts/validate-resort-guides-ids.mjs`, 15 mappings) |

Re-run locally (PowerShell):

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
node scripts/validate-resort-guides-ids.mjs
```

## Rubric LP-Q1–LP-Q7 table with evidence

| ID | Result | Evidence |
|----|--------|----------|
| **LP-Q1** Mobile-first | **PASS** | `.btn` `min-height: 44px` (`mock.css:172–176`); `.lang-switch [data-lang-switch]` 44×44 (`../_shared/mock-i18n.css:8–11`); `.path-tile` `min-height: 10rem` (`mock.css:455–461`); 12-col path grid collapses to `span-12` below 640px (`mock.css:495–501`); `.hero-title` `clamp(2rem, 8vw, 3.75rem)` (`mock.css:249–257`); no fixed-width elements >400px on narrow viewports |
| **LP-Q2** Accessibility | **PASS** | `:focus-visible` on links/buttons (`../_shared/mock-i18n.css:30–40`); decorative hero `alt=""` (`index.html:39`); meaningful images use `data-i18n-attr="alt:…"` (`index.html:97–98`, `175–178`, etc.); `prefers-reduced-motion` disables pulse + scroll + btn transform (`mock.css:305–307`, `758–761`; `mock-i18n.css:42–44`); lang group `role="group"` + `aria-label` (`index.html:29–31`); sections `aria-labelledby` (`index.html:91`, `128`, `167`, …) |
| **LP-Q3** Strategy conversion | **PASS** | Hero CTAs → `#bundle` / `#live` (`index.html:49–51`); live strip immediately below hero (`index.html:56–89`); `#highlights` らくちんくん / kids park first scroll (`index.html:167–200`); `#paths` six tiles incl. food / onsen / stay (`index.html:132–163`); aligns with brief pillars family · value · wellness (`configs/lp-brief/kirigamine.yaml:26–32`) and strategy line (`registry.json:342–345`) |
| **LP-Q4** i18n | **PASS** | Mechanical validators exit 0; `data-mock-resort="kirigamine"` on index + subpages (`index.html:2`, `corridor-stay.html:2`, etc.); `../_shared/mock-i18n.js` on all pages; `?lang=en` supported via `mock-i18n.js` (`getLocaleFromUrl` / `document.documentElement.lang`) |
| **LP-Q5** Performance (static) | **PASS** | Hero `width`/`height` on all hero imgs (`index.html:39` `1920×1080`; subpages e.g. `nearby-food.html:36` `1200×1500`); `.live-pulse` infinite animation stopped under `prefers-reduced-motion` (`mock.css:305–307`); no autoplay GIFs; `next/image` N/A |
| **LP-Q6** Data separation | **PASS** | Facility copy in `messages/ja.json` + `messages/en.json`; registry single source for name/region/strategy/affiliate (`docs/mock-assets/registry.json:331–352`); access address/phone/rentacar strings in JSON `access.*` only (`messages/ja.json:168–178`); no prices hardcoded in HTML attributes |
| **LP-Q7** Copy tone | **PASS** | §1.1 spirit satisfied: headings are experience/place/action, not market segments. **JA** `guides.ecosystem.title` = 「家族にやさしい料金」(`messages/ja.json:151`). **JA** `highlights.secondary.lead` describes SAJ-certified lessons in plain guest language — no 「教育エコシステム」(`messages/ja.json:97`). **JA** `guides.ecosystem.body` states prices, こどもの日, and hours (`messages/ja.json:152`). HTML fallbacks synced (`index.html:108–109`, `120`, `194–195`, `313–318`). `validate-mock-lp-copy.mjs` exit 0; grep clean for エントリー層 / エコシステム / 裾野 / pippu residue in user-visible copy paths |

### Affiliate · map · brief alignment (supplemental)

| Check | Result | Evidence |
|-------|--------|----------|
| Skyticket `#access` block | **PASS** | Same shell as `pippu-lp`: `rentacar-link.css`, `skyticket-rentacar.js`, `data-skyticket-rentacar-block/link/pixel` (`index.html:13`, `380–401`, `423–424`); destination `kamisuwa_kirigamine_kogen` (`registry.json:350–351`) |
| Resort map links | **PASS** | Header + highlights CTA `../map.html?resort=kirigamine` (`index.html:22`, `188`); subpages idem (`corridor-stay.html:21`, `nearby-food.html:21`) |
| Brief strategy on hero/paths | **PASS** | Tagline/badges match brief hero (`messages/ja.json:14–17` ↔ `kirigamine.yaml:21–24`); paths cover pricing, access, today, food, onsen, stay |
| Other-resort ID grep | **PASS** (user-visible) | No `pippu` / `biei` / `比布` / `#Pippu` in rendered copy paths. **Internal** pippu-template keys remain in JSON/HTML wiring only (see WARN) |

## Blockers (if FAIL)

None.

## WARN (non-blocking)

| Item | Detail |
|------|--------|
| Pippu template key names | `corridorStay.regions.asahikawa`, spot ids `omo7`, `dormy`, `mount-city`, `yuyu`, `hokurei`, `pipicafe` in `messages/*.json` — values are Suwa/Kirigamine-correct; rename keys when convenient (`corridor-stay.html:81` `data-i18n="corridorStay.regions.asahikawa"`) |
| Hardcoded “Live” label | `index.html:61` — not in i18n JSON; EN page shows English chip amid JA dashboard |
| `<meta title>` / description | Hardcoded JA in `<head>` on all pages; runtime title swap depends on `mock-i18n.js` |
| Unused message keys | 68 keys (subpage namespaces) — expected for shell parity with `pippu-lp` |
| `sanctuary.eyebrow` | JA JSON uses English eyebrow 「Family Entry」(`messages/ja.json:47`) — cosmetic; not LP-Q7 strategy jargon |
| Archetype note | Brief `local-value` with pippu-style subpages is intentional per `kirigamine.yaml:16–17`; section set matches brief `subPages` |

## Ship gate footer

```
Mechanical validation exit 0
  + resort-qa-a11y PASS (LP-Q1–LP-Q7)          ← PASS (2026-06-24 re-eval)
  + resort-visual-evaluator PASS (LP-V1–V6)     ← prior PASS; reconfirm after copy change
  + Human Gate (Phase 8)
→ guides 配信・クライアント提示可（visual L3 reconfirm pending）
```

**a11y PASS alone is not ship.** Both L3 evaluators must PASS before guides delivery; visual gate should be reconfirmed after this copy pass (`lp_qa_reports/kirigamine_visual.md`).
