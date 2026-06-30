# コンテンツ信頼性・注意書き — L1 仕様（評価用）

**Date:** 2026-06-29  
**Author:** L1（guides 施設ガイド艦隊）  
**対象:** `docs/mock-assets/{id}-lp/` · `map.html` · `area-map.html`（`guides.japowserch.com` 配信）  
**目的:** 写真・図・マップの「参考／未検証」をユーザーに誤解なく伝え、**「LP」という表記をユーザー向けコピーから排除**する。

---

## 1. 用語方針（ユーザー向けに「LP」を出さない）

| 禁止（ユーザー向け） | 推奨代替 |
|---------------------|----------|
| LP / LP案 / ランディングページ | **施設ガイド** / **ゲレンデガイド** / **JAPOW ガイド** |
| モック（単独） | **制作中** / **プレビュー** / **案**（文脈付き） |
| mock / landing page | **resort guide** / **ski area guide** / **preview** |

**内部**（リポジトリ・エージェント・`{id}-lp/` ディレクトリ名）は従来どおり可。  
**外部**（`messages/*.json` · `map.html` title · フッター · ナビ）は上表に統一。

### 現状の残存例（要置換）

- `map.html` `<title>`: 「ゲレンデマップ — LP案モック」
- 一部 `guides.backLink`: 「七戸 LP に戻る」
- 旧フッター: 「© … — LP案モック」（七戸は既に施設名のみ）

---

## 2. 信頼性の3層（何に注意書きが要るか）

| 層 | コンテンツ | リスク | 注意の強さ |
|----|------------|--------|------------|
| **A ビジュアル** | ヒーロー・セクション AI 画像 | 景観・施設外観の誤認 | 低〜中（フッターで足りる） |
| **B ライブ数値** | 積雪 cm・更新時刻・営業 CTA | 事実と異なる数値 | 中（該当ブロック横） |
| **C 空間データ** | `map.html` コース・リフト線・周辺 POI | 安全・導線の誤認 | **高**（マップ専用・目立つが panic ではない） |

根拠: `lp_mock_requirements.md` LP-V3（AI 画像可）· `lift-map-no-fake-overlays`（未検証線の本番禁止）。

---

## 3. 文案ドラフト（ja / en）

### 3.1 サイト共通（フッター `footer.guideNotice`）

**JA**
> 本ガイドは制作中の案です。写真・イラストは雰囲気の参考であり、実際のゲレンデ・施設と異なる場合があります。料金・営業・道路規制は各施設の公式情報を優先してください。

**EN**
> This resort guide is a preview. Photos and illustrations are for atmosphere only and may differ from the actual ski area. For hours, prices, and road conditions, rely on each venue’s official sources.

### 3.2 ゲレンデマップ（`map.html` トップバー直下 `map.fidelityNotice`）

**JA**
> コース・リフトの配置は概略です。正確な滑走区域・運行状況は、ゲレンデの公式サイトと現地の案内を正としてください。

**EN**
> Trail and lift positions are approximate. For accurate runs and lift status, follow the resort’s official site and on-mountain signage.

### 3.3 ライブ帯（ヒーロー `hero.sampleDataNote` — デモ数値のみ）

**JA**
> 表示中の数値はサンプルです。

**EN**
> Figures shown are sample data.

### 3.4 ナビ「ゲレンデマップ」直前（オプション `nav.mapHint`）

**JA**
> 概略マップ（未検証の場合あり）

**EN**
> Overview map (may be unverified)

---

## 4. 配置案（評価対象 — 3案）

ベースタイポ: `sichinohe-lp/mock.css` — body `1rem` / `line-height: 1.75` · `.lead-whisper` `0.875–1rem` · muted色。

### 案 A — フッター集中（最小侵襲）

| 要素 | 配置 | サイズ | スタイル案 |
|------|------|--------|------------|
| `guideNotice` | `footer.site-footer` 内、`footer-location` の上 | `0.75rem`（12px） | `color: var(--muted)` · max-width `42rem` |
| マップ注意 | `map.html` `.map-topbar` 直下 1 行 | `0.8125rem`（13px） | 背景 `var(--surface)` · 下 border |
| ライブ | ヒーロー `freshness` 直下 | `0.75rem` | italic なし |

**長所:** ヒーロー・CTA を汚さない。103 施設一括配線が容易（`_shared/messages/ui.*.json`）。  
**短所:** フッターまで気づかない。マップクリック前に C 層の警告が弱い。

### 案 B — フッター + マップナビ補足（推奨候補）

| 要素 | 配置 | サイズ |
|------|------|--------|
| `guideNotice` | 案 A と同じ | `0.75rem` |
| `nav.mapHint` | ヘッダー `nav` 内「ゲレンデマップ」リンクの `title` または visually subtle の `span`（モバイルは nav 折りたたみ時は省略可） | `0.625rem` eyebrow 級 |
| マップ注意 | 案 A と同じ + マップ stage 左上に小バッジ「概略」 | バッジ `0.6875rem` |

**長所:** マップ導線の直前で C 層を予告。フッターで A 層をカバー。  
**短所:** ナビがやや密になる（375px 要確認 LP-Q1）。

### 案 C — スティッキー細帯（制作中プレビュー向け）

| 要素 | 配置 | サイズ |
|------|------|--------|
| `guideNotice` | `body` 先頭 `sticky` 細帯（`mock-banner` 後継だが文言は「制作中の施設ガイド」） | `0.75rem` · padding `0.5rem 1rem` |
| マップ注意 | 案 B と同じ | 同左 |

**長所:** 全ページで最も目立つ。クライアントプレビュー向き。  
**短所:** `guides/scripts/sync.mjs` が現在 `mock-banner` を削除している — 本番 guides で常時表示は UX ノイズ。LP-Q8 CTA 被りリスク要検証。

---

## 5. 実装境界（L2 は本書承認後）

- 文案: `_shared/messages/ui.ja.json` / `ui.en.json`（共通）+ 施設固有は不要
- HTML: `index.html` フッターに `<p class="footer-notice" data-i18n="footer.guideNotice">`
- `map.html` / `resort-map.js`: トップバー下に `data-i18n` ブロック
- 検証: `validate-mock-html-i18n.mjs` + 新規 `validate-content-fidelity-notice.mjs`（キー存在）
- **LP-Q10**（新規）を `lp_mock_requirements.md` に追記予定

---

## 6. L3 評価依頼

| エージェント | 観点 | 出力 |
|--------------|------|------|
| `resort-qa-a11y` | LP-Q1–Q3 · i18n · 文案の誤解リスク · 案 A/B/C の a11y | `content_fidelity_qa_report.md` |
| `resort-visual-evaluator` | LP-V2 · V5 · 注意書きの視覚階層（本文より目立ちすぎないか） | `content_fidelity_visual_report.md` |

**評価者への質問（必ず回答）**

1. 案 A / B / C のどれを **本番 guides デフォルト** にすべきか（1 つ選択 + 理由）
2. `guideNotice` の **推奨フォントサイズ**（11px / 12px / 13px）
3. 「LP」「モック」を含まない上記文案で **十分か / 文言修正**
4. マップ注意は **map ページのみ** で足りるか、ナビ補足（案 B）も必要か
5. ライブ数値の `sampleDataNote` は **常時** か **デモフラグ時のみ** か

---

## 7. 参照

- `docs/mock-assets/lp_mock_requirements.md`
- `.cursor/rules/lift-map-no-fake-overlays.mdc`
- `docs/mock-assets/sichinohe-lp/`（canonical レイアウト）
