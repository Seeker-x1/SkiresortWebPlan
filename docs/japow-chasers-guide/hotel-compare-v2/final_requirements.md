# Hotel Compare v2 — 確定要件（P2 · resort-design-director）

**日付:** 2026-09-03  
**採用案:** **A · Field Memo**（Long Document）— ユーザー確定  
**入力:** [design_concepts.md](./design_concepts.md) · [AFFILIATE_STATE.md](./AFFILIATE_STATE.md)  
**実装対象:** `docs/japow-chasers-guide/preview-kit/hotel-compare.html` → `JAPOWSERCH/tools/hotel-compare/index.html`

---

## Self-Critique（3 案 → 1 案）

| 案 | 強み | 弱み | 判定 |
|----|------|------|------|
| **A Field Memo** | ガイド続きの声・SaaS テンプレから最遠・白馬の車省略が自然 | 表派ユーザーは一覧性が落ちる | **採用** |
| B Trip Sheet | 初見の手順が明確 | ステップ UI = onboarding AI tell リスク高 | 不採用 |
| C Spec Sheet | 表の学習コスト低 | 現行延長に見えやすく、P1 の「構造変更」目的を弱める | 不採用 |

### 不採用案から取り込む要素

- **B:** checkout ≤ checkin の **インラインエラー**（日付状態の明示）
- **C:** リンク chip の **アクセシブル命名**（*"Book OMO7 on Agoda"* — 宿名をリンクテキストに含める）

---

## Hallmark 確定

| 項目 | 値 |
|------|-----|
| Verb | `hallmark redesign`（既存 HTML 境界内・単一ファイル） |
| Macrostructure | **02 · Long Document** |
| Genre | **Editorial / austere** |
| Nav | **N1 · Wordmark + 2 links** |
| Footer | **Ft2 · Inline rule single line** |
| 禁止 | hero 100vh センタリング · 3-column feature grid · 番号 eyebrow 横並び（gate 54）· 捏造 stat · italic 見出し |

### Pre-emit critique（採用案・実装前目標）

| 軸 | 点 | 根拠 |
|----|-----|------|
| **P** Philosophy | 5 | 「ガイド shortlist の予約メモ」という明確な why |
| **H** Hierarchy | 4 | 日付 → city search → 宿エントリ → 移動 → 開示の縦リズム |
| **E** Execution | 5 | 既存 japow トークン継承・トークン直書き禁止 |
| **S** Specificity | 5 | hub JSON / bookOfficialFirst / 白馬車省略はこのプロダクト固有 |
| **R** Restraint | 5 | 画像なし・アニメなし・accent 面積 ≤3% |
| **V** Variety | 5 | 現行 table+dashboard から Long Document へ構造転換 |

**実装スタンプ目標:** `/* Hallmark · macrostructure: Long Document · genre: editorial · pre-emit critique: P5 H4 E5 S5 R5 V5 */`

---

## ブランド / トークン方針

**決定: japowsearch 既存パレットを preserve。**  
hallmark の OKLCH 全面置換は行わない（pre-flight: `JAPOWSERCH/index.html` L33–34 と `hotel-compare` 既存 `:root` が一致）。実装は **既存変数名のみ** 参照し、新色は `--color-*` 別系統を増やさない。

### `:root` 確定値（変更不可 unless コントラスト FAIL）

```css
:root {
  /* Surfaces */
  --navy: #0b1628;
  --navy-mid: #132238;
  --navy-light: #1d3454;
  --card-bg: rgba(19, 34, 56, 0.92);

  /* Text */
  --text: #e8edf3;
  --text-dim: #8aa0b8;

  /* Accent (links, focus, active hub) */
  --accent: #4dd9c4;
  --accent2: #f5a623; /* Official-first label only — not a second page accent */

  /* Structure */
  --border: rgba(125, 170, 210, 0.18);
  --rule: rgba(125, 170, 210, 0.28); /* hairline section rules — slightly stronger than --border */

  /* Typography */
  --font-body: "Noto Sans", system-ui, sans-serif;
  --font-display: "DM Serif Display", Georgia, serif;

  /* Layout */
  --measure: 62ch;
  --space-section: 2rem;
}
```

### Typography（2+1）

| 役割 | トークン | 用法 |
|------|----------|------|
| Body | `--font-body` | 本文・フォーム・リンク |
| Display | `--font-display` | h1 のみ |
| （第三フォントなし） | — | Space Mono 等は **導入しない** |

| 要素 | size | weight | style |
|------|------|--------|-------|
| h1 | `clamp(1.5rem, 4vw, 2rem)` | 400 | **normal** |
| Section h2 | `1.05rem` | 600 | normal |
| Body | `1rem` / line-height 1.55 | 400 | normal |
| Eyebrow | `0.75rem`, letter-spacing 0.06em, uppercase | 400 | normal |
| Hotel entry title | `1.05rem` | 700 | normal |
| Meta / dim | `0.9rem` | 400 | normal · `--text-dim` |

**禁止:** h1/h2/h3 の italic · gradient text · `#fff` / `#000` 直書き

---

## DOM 骨格（セクション順・ランドマーク）

```html
<body>
  <header class="top-bar">           <!-- N1 -->
  <main class="shell">
    <p class="meta" id="hub-label">  <!-- eyebrow -->
    <h1 id="headline">
    <p class="lede" id="lede">

    <nav class="hub-switch" aria-label="Hub">  <!-- text links, not pills -->
    <section class="dates" aria-labelledby="dates-heading">
    <section class="city-search" aria-labelledby="city-heading">
    <section class="shortlist" aria-labelledby="shortlist-heading">
      <ol class="hotel-entries" id="entries">   <!-- numbered li per hotel -->
    <section class="mobility" id="mobility" hidden>  <!-- asahikawa|yuzawa only -->
    <footer class="page-foot">         <!-- Ft2 + disclosure -->
  </main>
</body>
```

**削除する現行 UI:** `.hub-tabs` pill buttons · `table.compare` · `.hotel-cards` 二重構造 · `.bulk` 2-column solid buttons

**JAPOWSERCH 版のみ維持:** `<script src="/assets/ga-config.js">` · `analytics.js`（preview-kit には付けない）

---

## コンテンツ契約（改変禁止）

| フィールド | ソース | ルール |
|------------|--------|--------|
| `headline`, `lede`, `title` | `hotel-shortlists/{hub}.json` | **一字一句変更しない** |
| `name`, `meta` | 各 hotel オブジェクト | 変更しない |
| `official`, `tripcom` | JSON | href そのまま・パラメータ付与禁止 |
| 配列順 | JSON | ガイド表順を維持 |

### Mobility コピー（ハードコード可・捏造 stat なし）

| Hub | 見出し h2 | 本文（section  intro） | リンク |
|-----|-----------|------------------------|--------|
| asahikawa | Getting around | Kamui and Santa Present Park need a car or bus from town. Same dates as your stay. | AKJ · Asahikawa Station（JSON label.en） |
| yuzawa | Getting around | 4WD helps on Myoko drive days. Pick up at the station knot. | Echigo-Yuzawa Station |
| hakuba | — | **セクション DOM なし** | — |

Discover Cars URL: `destination.url + ?a_aid=Jaapowsearch`（`build-discover-cars-link.mjs` の `linkStyle: "new"` と同型）

---

## アフィリエイト表示（設計判断）

### 状態マトリクス

| リンク種別 | トラッキング | 表示条件 | ラベル例 |
|------------|-------------|----------|----------|
| Official | なし | `h.official` あり | `Official site` |
| Trip.com | なし | `h.tripcom` あり | `Trip.com` |
| Agoda（行） | `cid` あり時のみ | `h.agoda` 非空 | `Agoda` + `aria-label="Book {name} on Agoda"` |
| Booking（行） | `aid` あり時のみ | `h.booking` 非空 | `Booking` + aria-label |
| Agoda city | `cid` あり時のみ | 常時 | 下記コピー |
| Booking city | `aid` あり時のみ | 常時 | 下記コピー |
| Discover Cars | **常時 tracked** | mobility セクション内のみ | `{label.en}`（例: Asahikawa Airport (AKJ)） |

### CID/AID が空のとき（現状）

**City search 段落（`city-search`）:**

> Search all of {bookingSs} on Booking.com or Agoda with your dates filled in. *(Affiliate IDs not configured yet — these links do not earn commission.)*

リンクテキスト:

- `Booking.com · city search`
- `Agoda · city search`

**行リンク:** Agoda/Booking は **出す**（非トラッキング URL）。文言に *"(no affiliate ID)"* は付けない（行が多くうるさい）。city 段落に集約。

### CID/AID が入ったとき

City 段落を:

> Search all of {bookingSs} on Booking.com or Agoda — affiliate links with your dates pre-filled.

に差し替え。URL に `aid` / `cid` が付く。

### Discover Cars

Mobility セクション直前に 1 行:

> Rental links below are affiliate-tracked (Discover Cars · Jaapowsearch).

### 開示文（footer · 確定英文）

```text
Affiliate disclosure: Discover Cars links on this page are affiliate-tracked (Post Affiliate Pro, Jaapowsearch). Booking.com and Agoda links earn commission only when affiliate IDs are configured; until then they open the OTA with your dates but without tracking. Official hotel sites and Trip.com links are never affiliate-wrapped — book direct when the rate is close, especially for ski shuttles or ryokan dinner plans. Full policy: https://japowsearch.com/affiliate-disclosure.html
```

`affiliate-disclosure.html` への `<a>` 必須。

**禁止:** 現行の *"some links on this page are affiliate-tracked (Agoda, Booking.com, Travelpayouts when configured)"* — 実態と矛盾するため削除。

---

## インタラクション状態

| 要素 | 必須状態 |
|------|----------|
| Hub text links | default · hover · `:focus-visible` · active（current hub = font-weight 700, color `--accent`） |
| Date inputs | default · focus-visible · invalid（checkout ≤ checkin） |
| Typographic / chip links | default · hover · focus-visible · disabled（日付無効時 `aria-disabled` + pointer-events none） |
| Discover Cars links | default · hover · focus-visible |

**不要:** loading spinner · success toast · hover scale

### 日付バリデーション

- `checkout <= checkin` → `#dates-error` 表示: *"Check-out must be after check-in."* · shortlist リンクと mobility リンクを disabled
- fetch shortlist 失敗 → `#load-error`: *"Could not load the hotel list for this hub. Try refreshing."*

---

## レスポンシブ（hallmark responsive.md）

| 幅 | 要件 |
|----|------|
| 320 / 375 / 414 / 768 | `html, body { overflow-x: clip; }` |
| すべて | クリック可能テキスト（リンク・hub switch）**1 行** — `white-space: nowrap` on hub row only if needed; hotel link row wraps to **2 rows max** with gap, not 7 identical "Agoda" stacks without context |
| ≤720 | Date fields: 2×2 grid（現行 date-bar と同型で可） |
| ≤720 | `.hotel-entries` 単列 — **table 復活禁止** |

---

## 受け入れ基準 V1–V5

### V1 Typography

- [ ] h1 のみ DM Serif Display · それ以外 Noto Sans
- [ ] すべての見出し `font-style: normal`
- [ ] CSS 内に `:root` ブロック外の hex/rgb/font-family 直書き **0 件**（grep 検証）

### V2 Hierarchy

- [ ] スクロールなしで **eyebrow → h1 → hub switch → dates** が上から読める
- [ ] 宿 1 件 = **番号 + 名前 + meta +（任意）Book official first + リンク行** の塊
- [ ] Mobility は shortlist **の後**（旭川・湯沢のみ）

### V3 Honesty

- [ ] 捏造の数値・星・割引・利用者数 **0**
- [ ] CID/AID 空のとき footer / city 段落が **tracked と主張しない**
- [ ] Discover Cars に `a_aid=Jaapowsearch` が付く（grep URL 出力）
- [ ] official / tripcom URL に query パラメータ追加 **0**

### V4 Mobile

- [ ] 320px で横スクロールなし
- [ ] フォーム要素すべて `<label>` 付き
- [ ] hub switch はキーボード Tab 可能 · `:focus-visible` 視認

### V5 Restraint

- [ ] 背景グラデーション・グロー・絵文字アイコン **0**
- [ ] `--accent` の面積はリンク・focus・current hub に限定（solid 大型 CTA 禁止）
- [ ] アニメーション **0**（transition は focus/hover の color/border のみ、≤200ms）

### V6 Brand continuity（追加）

- [ ] `JAPOWSERCH/index.html` と並べて同一サイトに見える（navy / accent / フォント）
- [ ] canonical `https://japowsearch.com/tools/hotel-compare` 維持

---

## 技術制約（実装者向け）

1. **単一 HTML** · ビルドツール追加禁止
2. **shortlist fetch** base: preview-kit `../../../configs/affiliates/hotel-shortlists/` · JAPOW `./shortlists/`
3. **affiliate-config.json** fetch 維持（JAPOW 相対 `./affiliate-config.json`）
4. **discover-cars.json** — preview-kit から `../../../configs/affiliates/discover-cars.json` を fetch。JAPOW には sync 先を P3 で定義（コピー or インライン）
5. **XSS:** hotel 名/meta を `innerHTML` テンプレートに流さない — `textContent` / DOM API
6. **sync 後:** `apply-hotel-affiliate-config.mjs --sync --check` exit 0

---

## 変更ファイル（P3 handoff 用プレビュー）

| 操作 | パス |
|------|------|
| 変更 | `docs/japow-chasers-guide/preview-kit/hotel-compare.html` |
| 変更 | `JAPOWSERCH/tools/hotel-compare/index.html` |
| 追加（任意） | `JAPOWSERCH/tools/hotel-compare/discover-cars.json`（configs からコピー） |
| 不変 | `configs/affiliates/hotel-shortlists/*.json`（スキーマ変更なし） |
| 不変 | `configs/affiliates/hotels.json`（CID/AID はユーザー入力待ち） |

---

## 次ステップ

→ **P3 `resort-spec-handoff`:** 本ドキュメントを [`handoff_checklist.md`](./handoff_checklist.md) にチェックリスト化  
→ **P4 実装** → P5/P6/P7 評価 → P8 同期・デプロイ
