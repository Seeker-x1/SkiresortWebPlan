# LP モック — L2 Handoff Checklist

**Date:** 2026-06-25  
**Author:** `resort-spec-handoff` (L1→L2)  
**Frozen input:** [lp_mock_requirements.md](./lp_mock_requirements.md)  
**一次手順書:** [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) **§0.2 標準パイプライン**  
**Implementer:** `@resort-template-implementer`  
**L3 evaluators:** `@resort-qa-a11y`, `@resort-visual-evaluator`  
**参照実装:** `hinode-lp`（`shinjo-lp` 複製 · japow `52`）

---

## 0. 実装順序（テンプレ → 詳細ボタン）

```
Step 1   brief + japowResortId（RESORTS一覧.txt）
Step 2   アーキタイプ選定 → 複製元 LP 決定
Step 3   {id}-lp/ テンプレ複製 · 他 id 残骸削除
Step 4   専用 PNG（lp-mock-{id}-*.png + map hero）
Step 5   messages/ja.json + en.json
Step 6   HTML 配線 · mock.css
Step 7   data/maps/{id}.json
Step 8   registry.json + data/resort-guides.json
Step 9   apply-rentacar-affiliate.mjs
Step 10  機械検証 8 本（下記 §4）
Step 11  guides/scripts/sync.mjs + hub 件数
Step 12  JAPOWSERCH/data/resort-guides.json 同期
Step 13  L3 + Human Gate
```

**完了の定義:** [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) §0.1（詳細ボタンまで含む）

**禁止:** 他施設 PNG 流用 · SVG/落書き画像 · アフィリエイト省略 · 検証未 PASS で push · LP のみで「完了」宣言。  
詳細: [`.cursor/rules/lp-factory-no-shortcuts.mdc`](../../.cursor/rules/lp-factory-no-shortcuts.mdc)。

---

## 1. 新規施設チェックリスト

### 1.1 テンプレ複製

- [ ] `id` = registry の kebab-case（`hinode`）
- [ ] `slug` = `{id}-lp`
- [ ] 複製元が [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) §3 と一致
- [ ] 複製直後 grep: 他 `{id}`・施設名・ハッシュタグの残骸なし

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
- [ ] `validate-mock-lp-copy.mjs` PASS（インバウンド等の社内語禁止）

### 1.4 `mock.css`

- [ ] `:root` トークン（`--accent` 等）を施設トーンに調整
- [ ] `.section`, `.inner`, `.heading-lg`, `.hero-title` を維持
- [ ] `@media (prefers-reduced-motion: reduce)` ブロック

### 1.5 画像・アフィリエイト

- [ ] `lp-mock-{id}-*.png` は**施設専用**フォトリアル AI PNG
- [ ] `images/maps/{id}-hero.png` は焼き込み線イラスト PNG
- [ ] `apply-rentacar-affiliate.mjs` の `RESORT_COPY` に `{id}` 追加済み
- [ ] `registry.json` に `affiliates.rentacar`
- [ ] `index.html` に Skyticket ブロック

### 1.6 JAPOW「詳細」ボタン（必須）

- [ ] `registry.json` エントリ（`id` / `slug` / `japowResortId` / `guideUrl`）
- [ ] `data/resort-guides.json`（`"<japowId>": { "registryId": "{id}", "tier": "mock" }`）
- [ ] `scripts/validate-resort-guides-ids.mjs` の **`NAME_SUBSTRINGS`** に `{id}` を追加
- [ ] `node scripts/validate-resort-guides-ids.mjs` exit 0
- [ ] `node docs/mock-assets/scripts/validate-mock-japow-detail.mjs` exit 0
- [ ] `node guides/scripts/sync.mjs` → `validate-mock-japow-detail.mjs --public` exit 0
- [ ] `JAPOWSERCH/data/resort-guides.json` を SkiresortWebPlan と同期
- [ ] 仕様: [JAPOW_DETAIL_INTEGRATION.md](./JAPOW_DETAIL_INTEGRATION.md)

---

## 2. L3 前の自己確認（implementer）

### LP-Q 自己確認

| ID | 確認 |
|----|------|
| LP-Q1 | 375px DevTools、横スクロールなし、CTA 44px |
| LP-Q2 | Tab 移動でフォーカス可視、lang group label |
| LP-Q3 | 戦略1行が hero + paths にある |
| LP-Q4 | **8 つ**の validate スクリプト exit 0 |
| LP-Q5 | ヒーロー width/height 属性あり |
| LP-Q7 | validate-mock-lp-copy.mjs exit 0 |
| LP-Q8 | 375px で `#highlights` の CTA がカードに被らない |
| LP-Q9 | JAPOW 詳細: resort-guides + sync + JAPOWSERCH 同期 |

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
機械検証 8 本 exit 0
  → @resort-qa-a11y     → lp_qa_reports/{id}.md
  → @resort-visual-evaluator → lp_qa_reports/{id}_visual.md
  → 両方 PASS + Human Gate + JAPOWSERCH 同期
  → guides 配信・詳細ボタン連携可
```

---

## 4. 機械検証（8 コマンド）

```bash
node docs/mock-assets/scripts/validate-mock-i18n.mjs
node docs/mock-assets/scripts/validate-mock-html-i18n.mjs
node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs
node guides/scripts/sync.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public
```

| # | URL | 確認 |
|---|-----|------|
| 1 | `/{slug}/index.html` | JA デフォルト |
| 2 | `?lang=en` | EN・html lang |
| 3 | `https://guides.japowserch.com/{id}/` | sync 後（本番 or localhost） |
| 4 | JAPOW マップ「詳細確認」 | `{id}/` または `?lang=en` |

---

**Handoff ステータス:** ✅ L1 凍結 — テンプレ複製から詳細ボタンまで 1 パイプライン
