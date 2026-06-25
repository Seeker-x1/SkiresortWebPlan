# LP モック — L2 Handoff Checklist

**Date:** 2026-06-23  
**Author:** `resort-spec-handoff` (L1→L2)  
**Frozen input:** [lp_mock_requirements.md](./lp_mock_requirements.md)  
**Implementer:** `@resort-template-implementer`  
**L3 evaluators:** `@resort-qa-a11y`, `@resort-visual-evaluator`  
**Canonical テンプレ:** `sichinohe-lp`（`transit-onsen`）

---

## 0. 実装順序

```
Phase 1  複製 — アーキタイプに応じた {id}-lp/ 作成（他 id 残骸削除）
Phase 1.5  画像 — lp-mock-{id}-*.png（専用 AI PNG）+ map hero PNG
Phase 2  i18n — messages/ja.json + en.json（レポート由来）
Phase 3  HTML — data-i18n 配線・セクション取捨
Phase 4  CSS — mock.css トークン調整
Phase 5  マップ — data/maps/{id}.json + hero PNG（任意 area-map）
Phase 6  registry — registry.json, resort-guides.json, JAPOW 詳細連携（J1–J6）
Phase 6.5  アフィリエイト — apply-rentacar-affiliate.mjs + validate-skyticket
Phase 7  機械検証 — validate-mock-*.mjs + validate-resort-guides-ids + validate-mock-japow-detail
Phase 8  L3 — qa-a11y + visual-evaluator
Phase 9  Human Gate — 事実確認
```

**禁止:** 他施設 PNG 流用 · SVG/落書き画像 · アフィリエイト省略 · 検証未 PASS で push。詳細は [`.cursor/rules/lp-factory-no-shortcuts.mdc`](../../.cursor/rules/lp-factory-no-shortcuts.mdc)。

---

## 1. 新規施設チェックリスト

### 1.1 ディレクトリ・命名

- [ ] `id` = registry の kebab-case（`sapporo-kokusai`）
- [ ] `slug` = `{id}-lp`
- [ ] 複製元が [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) §3 と一致

### 1.2 `index.html`

- [ ] `data-mock-resort="{id}"`
- [ ] `mock-i18n.js` / `mock-i18n.css` 読み込み
- [ ] `data-lang-switch` × 2（ja / en）
- [ ] `../map.html?resort={id}` ナビリンク
- [ ] ユーザー向け文言は `data-i18n*` のみ

### 1.3 `messages/*.json`

- [ ] ja/en キー parity（検証スクリプト）
- [ ] `meta.title`, `meta.description`
- [ ] `hero.*` に戦略 tagline / badge
- [ ] `access.*`, `footer.*` 住所・電話

### 1.4 `mock.css`

- [ ] `:root` トークン（`--accent` 等）を施設トーンに調整
- [ ] `.section`, `.inner`, `.heading-lg`, `.hero-title` を維持
- [ ] `@media (prefers-reduced-motion: reduce)` ブロック

### 1.5 画像・アフィリエイト

- [ ] `lp-mock-{id}-*.png` は**施設専用**フォトリアル AI PNG（他 `{id}` のコピー禁止）
- [ ] `images/maps/{id}-hero.png` は焼き込み線イラスト PNG
- [ ] `apply-rentacar-affiliate.mjs` 実行済み
- [ ] `registry.json` に `affiliates.rentacar`
- [ ] `index.html` に Skyticket ブロック（`skyticket-rentacar.js` 等）

### 1.6 配信・JAPOW 詳細ボタン

- [ ] `registry.json` エントリ（`id` / `slug` / `name` / `strategy`）
- [ ] `data/resort-guides.json`（`japowResortId` → `registryId`）
- [ ] `node scripts/validate-resort-guides-ids.mjs` exit 0
- [ ] `node docs/mock-assets/scripts/validate-mock-japow-detail.mjs` exit 0
- [ ] `node guides/scripts/sync.mjs` → `validate-mock-japow-detail.mjs --public` exit 0
- [ ] 仕様: [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md)

---

## 2. L3 前の自己確認（implementer）

### LP-Q 自己確認

| ID | 確認 |
|----|------|
| LP-Q1 | 375px DevTools、横スクロールなし、CTA 44px |
| LP-Q2 | Tab 移動でフォーカス可視、lang group label |
| LP-Q3 | 戦略1行が hero + paths にある |
| LP-Q4 | **8 つ**の validate スクリプト exit 0（copy + skyticket + japow-detail 含む） |
| LP-Q5 | ヒーロー width/height 属性あり |
| LP-Q7 | validate-mock-lp-copy.mjs exit 0（§1.1 禁止表現なし） |
| LP-Q8 | 375px で `#highlights` の CTA がカードに被らない（`highlight-duet` grid） |
| LP-Q9 | JAPOW 詳細: resort-guides + sync + URL 契約（`validate-mock-japow-detail.mjs`） |

### LP-V 自己確認

| ID | 確認 |
|----|------|
| LP-V1 | Syne 見出し + mono 数値 |
| LP-V2 | `--section` 統一 |
| LP-V3 | ヒーローオーバーレイで文字読める |
| LP-V4 | path-tile / btn の hover |
| LP-V5 | `--accent` 使用、絵文字なし |
| LP-V6 | 不要セクション削除済み |

---

## 3. L3 出荷ゲート

```
implementer Phase 8 完了（機械検証 exit 0）
  → @resort-qa-a11y     → lp_qa_report.md または lp_qa_reports/{id}.md
  → @resort-visual-evaluator → lp_qa_visual.md または lp_qa_reports/{id}_visual.md
  → 両方 PASS → guides sync & クライアント提示可
```

| FAIL | 対応 |
|------|------|
| LP-V1 or LP-V5 | mock.css / タイポ修正 |
| LP-Q1–Q9 | i18n・a11y・導線・コピー・**CTA 被り**・**JAPOW 詳細**修正 |
| 機械検証 | スクリプト出力に従い修正 |

**テンプレート新設時:** まず **canonical**（`sichinohe-lp` 等）に L3 を通してから、他施設を複製する。

---

## 4. 検証手順

```bash
node scripts/validate-resort-guides-ids.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
node guides/scripts/sync.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public
npx serve docs/mock-assets -p 3456
```

| # | URL | 確認 |
|---|-----|------|
| 1 | `/{slug}/index.html` | JA デフォルト |
| 2 | `?lang=en` | EN・html lang |
| 3 | 375px | レイアウト・タップ |
| 4 | Tab | フォーカスリング |
| 5 | `/map.html?resort={id}` | マップリンク |

---

**Handoff ステータス:** ✅ L1 凍結 — L2 実装・L3 評価開始可
