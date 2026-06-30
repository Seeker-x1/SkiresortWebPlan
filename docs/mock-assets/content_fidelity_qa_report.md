# Content Fidelity Disclaimer — L3 QA / a11y Report

**Date:** 2026-06-30  
**Evaluator:** `resort-qa-a11y`  
**Spec:** [content_fidelity_disclaimer_spec.md](./content_fidelity_disclaimer_spec.md)  
**Baseline:** [lp_mock_requirements.md](./lp_mock_requirements.md) LP-Q1–Q4 · LP-Q7 · `sichinohe-lp/` canonical  
**Scope:** Spec readiness for L2 (`resort-template-implementer`) — **not** unimplemented UI

---

## Executive verdict

| Gate | Result |
|------|--------|
| **Spec ready for L2** | **PASS** |
| **Recommended production default** | **案 B** |
| **`guideNotice` size** | **12px (`0.75rem`)** |
| **Map nav hint (`nav.mapHint`)** | **Yes — desktop nav; optional on mobile** |

Minor L2 handoff notes are listed below; none block implementation.

> **Ship reminder:** a11y PASS alone does not ship guides. `resort-visual-evaluator` must PASS on notice visual hierarchy (`content_fidelity_visual_report.md`).

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → root template UI shippable
```

---

## Adapted rubric (spec-focused)

### LP-Q1 Mobile-first (adapted: Option B nav density @ 375px)

| Check | Result | Notes |
|-------|--------|-------|
| 375px horizontal scroll | **PASS** | `guideNotice` max-width `42rem` + `.inner` padding; footer placement avoids hero overlap |
| Touch targets ≥ 44px | **PASS** | Notices are non-interactive text; footer Google Map link inherits `:focus-visible` from `mock-i18n.css` |
| Option B nav density @ 375px | **PASS** | `sichinohe-lp/mock.css`: `.nav { display: none }` below 768px — `nav.mapHint` does **not** render in mobile header. Header row = logo + lang switch only |
| Option C sticky band | **FAIL** (reject for default) | Would stack with existing `position: sticky` header (`top: 1.75rem`) and `sync.mjs` strips `mock-banner` on publish — unsuitable as guides default |

**LP-Q1 verdict:** **PASS** for recommended Option B. Option C disqualified as production default.

---

### LP-Q2 Accessibility (notice readable; focus on links)

| Check | Result | Notes |
|-------|--------|-------|
| Notice readable | **PASS** | Draft copy is plain language; 12px + `line-height: 1.75` + `--muted` matches existing `.footer-location` tier (13px) — legible for disclaimer footnotes |
| 11px floor | **FAIL** if chosen | Below body whisper tier; risky on 375px for JA multi-clause `guideNotice` |
| Interactive focus | **PASS** (with L2 note) | Footer map link and map topbar back link must keep `:focus-visible`; map fidelity block is static — recommend `role="note"` + `aria-live="off"` (decorative badge: `aria-hidden="true"` on「概略」glyph, full text in `map.fidelityNotice`) |
| Reduced motion | **PASS** | Notices introduce no animation |

**LP-Q2 verdict:** **PASS** at 12px; L2 should add semantic `role="note"` on fidelity blocks.

---

### LP-Q3 Conversion path (disclaimer must not block hero CTA)

| Check | Result | Notes |
|-------|--------|-------|
| Hero → CTA unobstructed (A / B) | **PASS** | `guideNotice` in footer above `footer-location`; `sampleDataNote` under `.freshness` — one line, no overlay |
| Hero → CTA (C) | **FAIL** | Sticky top band competes with hero viewport and LP-Q8 overlap risk (spec §4 案 C 短所と一致) |
| Map pre-warning vs conversion | **PASS** | `nav.mapHint` is `title` or subtle span — does not insert extra tap step before hero CTA |

**LP-Q3 verdict:** **PASS** for Options A and B.

---

### LP-Q4 i18n (ja / en parity)

| Check | Result | Notes |
|-------|--------|-------|
| Draft JA / EN pairs | **PASS** | §3.1–3.3 strings are semantically aligned; keys scoped to `_shared/messages/ui.*.json` per §5 |
| Key plan | **PASS** | `footer.guideNotice`, `map.fidelityNotice`, `hero.sampleDataNote`, `nav.mapHint` — facility JSON not required |
| Legacy「LP」removal | **PASS** (spec) / **FAIL** (current assets) | Spec §1 correctly inventories residues: `map.html` title「LP案モック」, `index.html` footer fallback「LP案モック」, `resort-map.js` hardcoded UI — L2 cleanup in scope |
| `map.html` hardcoded JA | **WARN** | Tab labels / legend still JA-only today; fidelity notice wiring is additive — full map i18n is separate debt |

**LP-Q4 verdict:** **PASS** on proposed copy and key structure.

---

### LP-Q7 Copy tone (no LP / inbound jargon)

| Check | Result | Notes |
|-------|--------|-------|
| No「LP」「モック」「landing page」in §3 drafts | **PASS** | Uses 施設ガイド / resort guide / preview / 制作中の案 |
| No inbound / strategy jargon | **PASS** | No インバウンド, FIT, market-segment headings |
| `nav.mapHint`「未検証」/ unverified | **PASS** | Technical honesty, not internal「モック」label; acceptable for C-layer pre-warning |
| Terminology table §1 | **PASS** | Clear internal vs external boundary |

**LP-Q7 verdict:** **PASS** — proposed copy is sufficient; optional polish only (see §6 Q3).

---

## Spec §6 — required answers

### 1. Production guides default: A / B / C?

**選択: 案 B（フッター + マップナビ補足 + マップページ注意）**

**理由**

- **C 層（空間データ）**は安全・導線誤認リスクが高く、`lift-map-no-fake-overlays` と整合。マップページ内の `map.fidelityNotice` は必須。
- 案 A だけでは、デスクトップで「ゲレンデマップ」クリック前に C 層の予告がなく、フッターまで気づかない（spec 短所の通り）。
- 案 C は `guides/scripts/sync.mjs` が `mock-banner` を削除する運用と矛盾し、常時 sticky は LP-Q3 / LP-Q8 リスク。クライアントプレビュー専用に留める。
- 案 B の `nav.mapHint` は **768px 未満では nav 非表示**（`sichinohe-lp` 実測）のため 375px 密度を悪化させない。モバイルは `#paths` タイル → `map.html` 直後の注意で C 層をカバー（spec「モバイル省略可」と整合）。

---

### 2. `guideNotice` 推奨フォントサイズ（11 / 12 / 13px）

**推奨: 12px（`0.75rem`）**

| Size | Assessment |
|------|------------|
| 11px | **Reject** — JA 2 文 disclaimer below readable floor on 375px |
| **12px** | **Adopt** — matches spec §4, `.mock-banner` tier, footer legal-text convention |
| 13px | Acceptable if visual L3 requests bump; slightly competes with `.footer-location` (13px) hierarchy |

Use `line-height: 1.75`, `color: var(--muted)`, `max-width: 42rem` as spec states.

---

### 3. 文案は十分か / 修正要否

**十分 — 実装可（軽微な任意改善のみ）**

| Key | Assessment |
|-----|------------|
| `footer.guideNotice` | Clear: 制作中 / preview, AI imagery, official sources for operations |
| `map.fidelityNotice` | Strong C-layer message; no LP jargon |
| `hero.sampleDataNote` | Minimal; does not alarm when live data replaces samples |
| `nav.mapHint` | Short pre-click cue |

**任意改善（ブロッカーではない）**

- EN `guideNotice`: "each venue's" → "the resort's" when single-facility page (guides are per-resort) — clearer but not required.
- `nav.mapHint` EN: align with map notice — e.g. "Approximate map" instead of "may be unverified" — reduces duplicate tone.
- L2 must **replace** remaining user-facing「LP」in `map.html` title, footer fallbacks, and `guides.backLink` per §1 inventory.

---

### 4. マップ注意は map ページのみで足りるか、ナビ補足も必要か

**map ページ内 `map.fidelityNotice` + stage バッジ「概略」は必須。**

**`nav.mapHint` は案 B 採用時に推奨 — デスクトップ（≥768px）のみ。**

| Context | Recommendation |
|---------|----------------|
| `map.html` load | **Required** — primary C-layer disclosure |
| Desktop header nav | **Recommended** — `title` attribute minimum; optional `0.625rem` span if visual L3 approves |
| Mobile (nav hidden) | **Not required** — users reach map via `#paths` tile; first screen on map satisfies duty to warn |
| `#paths` map tile subtitle | **Optional L2** — `paths.map.hint` if product wants symmetry; not blocking |

Map-only (案 A) is **minimum viable** but **under-warns** desktop users before navigation — insufficient for default guides policy.

---

### 5. `sampleDataNote` — 常時 vs デモフラグ時のみ

**推奨: デモ / サンプル数値時のみ表示**

| Mode | Behavior |
|------|----------|
| Sample / mock hero stats (current `hero.statValue` placeholders) | Show `hero.sampleDataNote` under `.freshness` |
| Live feed wired (real snow / hours from API or verified JSON) | **Hide** note — avoids false alarm |

**L2 handoff:** add explicit trigger in `registry.json` (e.g. `contentSample: true`) or derive from data source field; spec §5 should name the flag in implementation checklist. Do **not** show permanently once live data ships.

---

## Current asset snapshot (evaluation context)

| Asset | Relevant finding |
|-------|------------------|
| `sichinohe-lp/index.html` | Hero CTA clear; footer still has「LP案モック」HTML fallback; no `guideNotice` yet |
| `sichinohe-lp/mock.css` | Nav hidden &lt;768px; `.btn` min-height 44px; footer muted typography established |
| `map.html` | Title/description contain「LP案モック」; no fidelity notice block yet |
| `_shared/messages/ui.ja.json` | No fidelity keys yet — expected pre-L2 |

---

## L2 handoff checklist (non-blocking)

1. Add keys to `ui.ja.json` / `ui.en.json` per §3.
2. Wire `index.html` footer `<p class="footer-notice" data-i18n="footer.guideNotice">` above `footer-location`.
3. Wire `map.html` topbar notice + optional stage badge; fix title to drop「LP」.
4. Implement `validate-content-fidelity-notice.mjs` + LP-Q10 entry in `lp_mock_requirements.md`.
5. `sampleDataNote` gated by `contentSample` (or equivalent).
6. Desktop: `nav.mapHint` via `title` on map link (lowest a11y risk) or spec span pattern.
7. Strip user-facing「LP」from published HTML/JS per §1 table.

---

## Summary table

| Item | Result |
|------|--------|
| LP-Q1 (Option B @ 375px) | PASS |
| LP-Q2 | PASS |
| LP-Q3 | PASS (A/B) |
| LP-Q4 | PASS |
| LP-Q7 | PASS |
| **Spec → L2** | **PASS** |
| **Default option** | **B** |
| **`guideNotice` size** | **12px** |
| **Map nav hint** | **Yes (desktop); map page required** |
| **`sampleDataNote`** | **Demo flag only** |

---

*Next: `resort-visual-evaluator` → `content_fidelity_visual_report.md` (LP-V2 · V5 hierarchy).*
