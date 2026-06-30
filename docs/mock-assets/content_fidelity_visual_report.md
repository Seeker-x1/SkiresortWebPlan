# コンテンツ信頼性注意書き — L3 ビジュアル評価

**Date:** 2026-06-30  
**Evaluator:** `resort-visual-evaluator` (L3)  
**Input spec:** `content_fidelity_disclaimer_spec.md`  
**Canonical CSS:** `sichinohe-lp/mock.css`  
**Scope:** `guides.japowserch.com` 静的ガイド（`{id}-lp/` · `map.html` · `area-map.html`）

---

## Verdict

**PASS** — L1 仕様はビジュアル実装可能。本レポートの **階層サイズ修正・案 C 本番禁止・DOM 順序** を L2 実装の必須条件として取り込むこと。

（案 C を本番デフォルトにした場合は **LP-V2 / LP-V5 FAIL** → 全体 FAIL）

---

## ルーブリック（配置案 × LP-V）

| ID | 案 A | 案 B | 案 C | 根拠 |
|----|------|------|------|------|
| **LP-V2** 余白 | PASS | PASS | **FAIL** | A/B はフッター・マップ帯のみで `--section` / `.site-footer { padding: 3rem 0 }` を侵食しない。C は全ページ先頭に `sticky` 帯を追加し、`.site-header { top: 1.75rem }` との二重 sticky・上端リズムを破壊。 |
| **LP-V5** ブランド | PASS | PASS | **FAIL** | A/B は `var(--muted)` · `var(--border)` · ライト面のみ。C は `.mock-banner` 継承（`#1a2438` ダーク帯・`z-index: 100`）で Alpine Clarity ライト基調と衝突。アラーム黄ではないが **常時プレビュー帯** は本番 guides のブランドノイズ。 |
| **視覚階層** | WARN | PASS | FAIL | 仕様案の `guideNotice` 0.75rem と `.site-footer` 0.875rem の組み合わせは **注意書き < 著作権** となり階層逆転。B はマップ二段（topbar + badge）で C 層を補強しつつ panic 表現なし。 |
| **LP-V1** | — | — | — | 本件は新規 legal テキスト階層のみ。既存 Display/H1 階層に触れないため影響なし。 |
| **LP-V3–V4** | — | — | — | 本件スコープ外（変更なし）。 |

---

## 配置案 A / B / C 比較

### 案 A — フッター集中

| 観点 | 評価 |
|------|------|
| LP-V2 | セクション padding 不変。フッター内 `margin` のみ（8px グリッド: `1.25rem` = 20px は canonical `.footer-location` と同型）。 |
| LP-V5 | ミュート legal・絵文字なし・accent-soft 帯なし。`.notice-banner`（左 accent ボーダー + ソフト背景）は **使わない** — 詳細ページ用で強すぎる。 |
| 階層 | フッター単独では A 層（AI 画像）には足りるが、マップ C 層の事前予告が弱い。 |
| 375px | ナビ密度増なし。PASS。 |

**判定:** 本番最低ライン。マップ導線の視覚予告が不足。

### 案 B — フッター + マップナビ補足 + stage バッジ（推奨）

| 観点 | 評価 |
|------|------|
| LP-V2 | 案 A と同フッター rhythm。`nav.mapHint` は `.eyebrow` 級（`0.625rem`）で nav `0.875rem` を汚さない。stage バッジは `.map-layer-btn` と同サイズ帯（`0.6875rem`）。 |
| LP-V5 | トークン色のみ。バッジは白半透明 + `var(--border)` — ネオン・絵文字・黄帯なし。 |
| 階層 | マップ: topbar 1 行（13px muted）> stage バッジ（11px uppercase）> 地図本体。index: `footer-notice` > `copyright` > `footer-location`。 |
| 375px | `nav.mapHint` は **デスクトップのみ**（`≥768px`）。モバイルは `title` / `aria-describedby` のみで LP-Q1 密度を守る。 |

**判定:** 本番 guides デフォルト。**PASS**

### 案 C — スティッキー細帯

| 観点 | 評価 |
|------|------|
| LP-V2 | **FAIL** — 全ページ上端に固定帯。ヒーロー `92svh` のファーストビューを常時占有。 |
| LP-V5 | **FAIL** — `.mock-banner` と同型ダーク sticky。`sync.mjs` が `mock-banner` 削除する方針と矛盾。本番 103 施設で常時表示は UX ノイズ。 |
| LP-Q8 | CTA 被りリスク（ヒーロー上端・sticky header との z-index 競合）。 |
| 用途 | **ローカル file:// プレビュー専用**（`body[data-preview-band]` 等のビルドフラグ）に限定可。 |

**判定:** `guides.japowserch.com` 本番デフォルトとして **FAIL（採用不可）**

---

## §6 質問への回答

### 1. 本番 guides デフォルトは A / B / C のどれか

**案 B（1 つ）**

- A 層はフッター `guideNotice` で十分だが、C 層（コース・リフト概略）は **マップページ到達前** に弱い予告が必要。
- 案 B は **topbar 注意 + stage バッジ** で C 層を panic なく強化。デスクトップ nav 補足は任意の第三層。
- 案 C は LP-V2/V5 FAIL。プレビュー帯は Alpine Clarity の編集デザインと両立しない。

### 2. `guideNotice` の推奨フォントサイズ

**0.8125rem（13px）** — canonical の `.footer-location` · `.map-layer-hint` · `.hero-stat-label` と同帯。

| サイズ | 判定 |
|--------|------|
| 11px (`0.6875rem`) | 長文 legal では可読性下限。著作権行との差が小さすぎる。 |
| **12px (`0.75rem`)** | `.freshness` と同型だが、現行 `.site-footer` 基底 14px より小さく **著作権より弱くなる**（階層逆転）。 |
| **13px (`0.8125rem`)** | **推奨。** `.lead` 最小 15px より弱く、著作権を 12px に下げれば階層成立。 |

**必須修正案:** `footer.copyright` を **0.75rem（12px）** に明示縮小し、注意書き（13px）> 著作権（12px）> 住所行（13px・リンク色のみ accent）とする。

### 3. 文案（LP / モック排除）で十分か

**十分（PASS）** — ユーザー向けに禁止語を含まない。軽微な EN 改善は任意:

- JA: 現行ドラフトのまま可。
- EN: *"This resort guide is a preview."* → 任意で *"This ski area guide is in preview."*（resort guide と ski area guide の統一）。**ブロッカーではない。**

`notice-banner` 級の強調コピー・絵文字・「⚠」は不要。

### 4. マップ注意は map ページのみで足りるか、nav 補足も必要か

**map ページ必須 + stage バッジ必須。nav 補足はデスクトップ任意。**

| 要素 | 必須 | 理由 |
|------|------|------|
| `map.fidelityNotice`（topbar 直下） | **必須** | C 層の主警告。クリック後すぐ読める。 |
| stage バッジ「概略」 | **必須** | 視線が地図に落ちたときの静的リマインダー。`.map-layer-btn` と同型でブランド整合。 |
| `nav.mapHint` | 任意（desktop） | 導線直前の予告。モバイル nav 非表示時は `title` で代替。なくても B の必須2点で C 層は視覚的に足りる。 |

**area-map.html:** 空間 POI が未検証の場合、同一 `map-fidelity-notice` パターンを topbar 下に流用（文言キーは別途 `areaMap.fidelityNotice` 可）。

### 5. `hero.sampleDataNote` は常時かデモフラグ時のみか

**デモフラグ時のみ**（`data-live-demo="true"` または JSON `hero.statValue` がサンプルソースのとき）。

- 常時表示は LP-V5 上「本番データ」の信頼を損ない、ヒーロー stat の視覚重量（`clamp(3.25rem, 16vw, 6rem)`）を汚す。
- 配置: `.freshness` 直下（案 A 通り）。
- サイズ: **0.75rem** · `color: var(--muted)` · italic なし · `font-mono` 不使用。

---

## 推奨実装仕様（L2 向け・数値確定）

### サイト共通 — `index.html` / 子ページ

| 項目 | 値 |
|------|-----|
| **DOM** | `footer.site-footer > .inner` 内、**先頭**に `p.footer-notice` → 続けて `div.footer-row` → `p.footer-location` |
| **セレクタ** | `p.footer-notice[data-i18n="footer.guideNotice"]` |
| **font-size** | `0.8125rem`（13px） |
| **line-height** | `1.65`（`.footer-location` 準拠） |
| **color** | `var(--muted)` |
| **max-width** | `42rem`（`672px`） |
| **margin** | `0 0 1.25rem`（フッター先頭。`--section` は触らない） |
| **著作権** | `.footer-meta p` → `font-size: 0.75rem`（12px）で注意書きより一段弱く |

```css
/* mock.css 追記案 — クラス名確定 */
.footer-notice {
  margin: 0 0 1.25rem;
  max-width: 42rem;
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--muted);
}
.site-footer .footer-meta p {
  font-size: 0.75rem;
  line-height: 1.5;
}
```

### ヒーロー — サンプル数値（デモ時のみ）

| 項目 | 値 |
|------|-----|
| **DOM** | `.hero-cta` 内、`.freshness` の直後 |
| **セレクタ** | `p.hero-sample-note[data-i18n="hero.sampleDataNote"]` |
| **font-size** | `0.75rem`（12px） |
| **表示** | `[data-live-demo="true"] .hero-sample-note { display: block }` / デフォルト `display: none` |

### ナビ — マップ補足（案 B・デスクトップ任意）

| 項目 | 値 |
|------|-----|
| **DOM** | `nav .nav > li` 内、ゲレンデマップ `<a>` の直後 |
| **セレクタ** | `span.nav-map-hint[data-i18n="nav.mapHint"]` |
| **font-size** | `0.625rem`（10px）— `.eyebrow` 級 |
| **表示** | `@media (min-width: 768px) { display: block }` / モバイル `display: none` |
| **モバイル代替** | `<a … data-i18n-attr="title:nav.mapHint">` |

### ゲレンデマップ — `map.html`

#### Topbar 注意（主）

| 項目 | 値 |
|------|-----|
| **DOM** | `header.map-topbar`（または同等）の **直後**、マップ stage の **前** |
| **セレクタ** | `p.map-fidelity-notice[data-i18n="map.fidelityNotice"]` |
| **font-size** | `0.8125rem`（13px） |
| **padding** | `0.625rem clamp(1.25rem, 4vw, 3rem)`（10px 縦 · `--inner` 横） |
| **background** | `var(--surface)` |
| **border** | `border-bottom: 1px solid var(--border)` |
| **color** | `var(--muted)` |
| **max-width** | なし（全幅帯） |

#### Stage バッジ（副）

| 項目 | 値 |
|------|-----|
| **DOM** | `.map-stage`（キャンバスラッパ）内、**先頭子要素** |
| **セレクタ** | `span.map-stage-badge[data-i18n="map.approxBadge"]`（キー名は L2 合意可） |
| **font-size** | `0.6875rem`（11px） |
| **font** | Syne, `font-weight: 700`, `letter-spacing: 0.12em`, `text-transform: uppercase` |
| **position** | `absolute; top: 0.75rem; left: 0.75rem; z-index: 10` |
| **surface** | `background: rgb(255 255 255 / 92%)`, `border: 1px solid var(--border)`, `border-radius: 999px`, `padding: 0.25rem 0.5rem` |
| **color** | `var(--muted)` — **accent 塗りつぶし禁止**（CTA と混同しない） |

---

## タイポ階層（確定）

```
.hero-title          clamp(2.75rem … 5rem)
.heading-lg          clamp(1.75rem … 2.75rem)
.lead                clamp(0.9375rem … 1.125rem)   ← 本文リード（最強）
.footer-notice       0.8125rem (13px) muted         ← 注意書き（リードより弱い）
.map-fidelity-notice 0.8125rem (13px) muted         ← マップ主警告（同帯）
.footer-location     0.8125rem (13px) muted         ← 住所（注意書きと同帯・リンクのみ accent）
.map-stage-badge     0.6875rem (11px) uppercase     ← 地図上ラベル（補助）
.footer-meta / ©     0.75rem (12px) muted            ← 著作権（最弱）
.nav-map-hint        0.625rem (10px)                ← ナビ補足（任意・最軽量）
```

---

## 案 C（sticky 帯）— 本番 guides 判定

| 質問 | 回答 |
|------|------|
| sticky band (C) は public guides で FAIL か | **はい — FAIL** |
| 理由 | LP-V2（上端リズム破壊）· LP-V5（ダーク mock-banner 再導入）· sync 方針矛盾 · LP-Q8 CTA 被りリスク |
| 許容範囲 | ローカルプレビュー・クライアントレビュー URL のみ。`guides.japowserch.com` 103 施設 sync には含めない |

---

## 仕様ギャップ（L1 → L2 引き渡し前に反映推奨）

1. **階層:** 仕様 §4 案 A/B の `guideNotice` 12px のままでは著作権 14px より弱く見える → 本レポートの **13px + 著作権 12px** に更新。
2. **DOM 順:** `footer-notice` を `footer-location` の上だけでなく、**著作権より上（フッター先頭）** と明記。
3. **案 C:** 仕様本文に「本番 guides 非採用（L3 FAIL）」を追記。
4. **`sampleDataNote`:** 表示条件を `data-live-demo` 等で L1 に固定。
5. **CSS クラス名:** `footer-notice` · `map-fidelity-notice` · `map-stage-badge` · `nav-map-hint` · `hero-sample-note` を仕様 §5 に列挙。

上記を L1 に反映すれば、L2 は追加判断なしで実装可能。

---

## Summary（実装者向け一行）

| 項目 | 推奨 |
|------|------|
| **Chosen option** | **B**（本番 guides デフォルト） |
| **guideNotice** | `0.8125rem` · `footer.site-footer > .inner > p.footer-notice` · `max-width: 42rem` |
| **copyright** | `0.75rem` · `.footer-meta p` |
| **map notice** | `0.8125rem` · `header.map-topbar + p.map-fidelity-notice` · 全幅帯 |
| **stage badge** | `0.6875rem` · `.map-stage > span.map-stage-badge` · 左上 absolute |
| **nav hint** | `0.625rem` · `span.nav-map-hint` · desktop only |
| **sample note** | `0.75rem` · `.hero-sample-note` · demo flag only |
| **sticky band C** | **FAIL** for `guides.japowserch.com` |

---

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → root template UI shippable
```

（本件は LP 静的ガイド向け L3 監査。上記ゲートは `lp_mock_requirements.md` §2 の guides 出荷ゲートに準拠。）
