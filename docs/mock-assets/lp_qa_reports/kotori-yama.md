# LP QA Report — kotori-yama

**Evaluator:** resort-qa-a11y (L3)  
**Date:** 2026-07-02  
**Target:** `docs/mock-assets/kotori-yama-lp/`  
**Rubric:** `lp_mock_requirements.md` LP-Q1–Q9  
**Archetype:** `local-value` (brief: `configs/lp-brief/kotori-yama.yaml`)

---

## Verdict: **FAIL**

Do not ship. Return to `resort-template-implementer` for copy, layout, and i18n fixes.  
**Note:** a11y PASS alone is not ship — `resort-visual-evaluator` (LP-V1–V6) must also PASS.

---

## Rubric summary

| Item | Result | Notes |
|------|--------|-------|
| LP-Q1 Mobile-first | **FAIL** | `#highlights` secondary card overlaps primary CTA (see Q8) |
| LP-Q2 Accessibility | **PASS** | Focus rings, aria, reduced-motion, lang group |
| LP-Q3 Strategy conversion | **PASS** | Hero → pass/live ≤1 tap; strategy aligned |
| LP-Q4 i18n | **FAIL** | JA in EN rentacar block; hardcoded price labels |
| LP-Q5 Performance | **PASS** | Hero `width`/`height`; pulse guarded |
| LP-Q6 Data separation | **FAIL** | `Day`/`Bundle` in HTML; rentacar eyebrow = strategy paste |
| LP-Q7 Copy tone | **FAIL** | Internal jargon + `インバウンド` in user copy |
| LP-Q8 Layout integrity | **FAIL** | `highlight-secondary` overlay pattern (kirigamine-class) |
| LP-Q9 JAPOW detail | **PASS** | `japowResortId` 159 · registry · validators exit 0 |

---

## Machine validation (2026-07-02)

| Script | Result |
|--------|--------|
| `validate-mock-i18n.mjs` | PASS (126 keys) |
| `validate-mock-html-i18n.mjs` | PASS (145 HTML keys) |
| `validate-mock-lp-shell.mjs` | PASS |
| `validate-mock-lp-copy.mjs` | PASS |
| `validate-skyticket-affiliate.mjs` | PASS |
| `validate-resort-guides-ids.mjs` | PASS |
| `validate-mock-japow-detail.mjs` | PASS (source) |

`validate-mock-japow-detail.mjs --public` not run (no guides sync in this audit).

---

## Top issues (fix order)

### 1. LP-Q7 / LP-Q8 — Internal copy + highlight overlay (blockers)

**Copy tone (LP-Q7):** User-facing `messages/*.json` still reads like a strategy deck, not guest copy.

- `guides.summer.body` (JA): **「子連れインバウンド」** — market-segment term forbidden in LP JSON (§1.1).
- `pass.noticeTitle`: **「戦略メモ：」**; bodies reference **レポート**, **提言**, **LP案** across `pass`, `rental`, `family`, `workation`, `guides.*`.
- EN mirrors: `Strategy note:`, `(report …)`, `(LP concept)`, `(LP)` in the same sections.

`validate-mock-lp-copy.mjs` exits 0 because its substring list does not catch `子連れインバウンド`, `戦略メモ`, `レポート`, or `提言`. L3 still **FAIL**.

**Layout (LP-Q8 / LP-Q1):** `mock.css` `.highlight-secondary` uses `margin-top: -2.5rem` (mobile) and `position: absolute; bottom: 0` (≥1024px) with `z-index: 2` on `.highlight-duet`. This is the documented kirigamine incident pattern: the secondary card can sit over `.highlight-primary-body` and its gold CTA (`highlights.primary.cta`). Refactor to vertical stack on mobile; no negative-margin / absolute overlap on interactive elements.

### 2. LP-Q4 — EN locale rentacar block shows Japanese

With `?lang=en`, `access.rentacarEyebrow` / `rentacarLink` / `rentacarNote` / `rentacarHint` render Japanese strings in `messages/en.json` (synced intentionally by `buildRentacarCopy`, but LP-Q4 FAIL example: **EN page JA mix**). Eyebrow text is also the resort **strategy** line, not a rentacar label — it overwrites the HTML fallback「新幹線＋レンタカー」.

### 3. LP-Q6 — HTML hardcoding

`index.html` price cards use hardcoded **Day** / **Bundle** labels (lines ~213–217) without `data-i18n`. Move to `messages/*.json` or shared UI keys.

---

## LP-Q2 detail (PASS)

- `_shared/mock-i18n.css`: `:focus-visible` on links, buttons, lang switch; `aria-current` on active lang.
- Sections use `aria-labelledby` / `aria-label`; hero decorative images `alt=""`; content images use `data-i18n-attr="alt:…"`.
- `prefers-reduced-motion: reduce` disables pulse animation and hover transforms (`mock.css` + shared CSS).
- `footer.guideNotice`, `nav.mapHint` wired via `data-i18n` (shared UI merge).

---

## LP-Q3 detail (PASS)

- Hero CTAs: `#pass` (料金・パス) + `#live` (本日) — matches `local-value` strategy (private hill + snow debut + onsen loop).
- `#paths` has 6 tiles; `#highlights` appears within first scroll after live strip.
- Conversion to tickets/pricing: hero → `#pass` in one tap.

---

## LP-Q9 detail (PASS)

| Check | Value |
|-------|-------|
| `registry.id` | `kotori-yama` |
| `japowResortId` | `159` |
| `resort-guides.guides["159"].registryId` | `kotori-yama` |
| `NAME_SUBSTRINGS` | `["小鳥山"]` |
| Detail URL (JA) | `https://guides.japowserch.com/kotori-yama/` |
| Detail URL (EN) | `https://guides.japowserch.com/kotori-yama/?lang=en` |
| `affiliates.rentacar` | `shinjo_station` |
| Map link | `../map.html?resort=kotori-yama` |

---

## Handoff to implementer

1. Rewrite strategy/report strings in `messages/ja.json` and `messages/en.json` to experience-first guest copy (§1.1); remove `インバウンド` from LP JSON.
2. Fix `#highlights` layout: stack `highlight-duet` on mobile; remove negative margin / absolute overlap on CTAs.
3. Localize rentacar block for EN (or document fleet exception — until then Q4 stays FAIL).
4. i18n-wrap price card labels; fix `access.rentacarEyebrow` content.
5. Re-run machine validators + this L3 audit + `resort-visual-evaluator`.

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → guides / JAPOW 詳細 shippable
```

**Current:** resort-qa-a11y **FAIL** (Q1, Q4, Q6, Q7, Q8).
