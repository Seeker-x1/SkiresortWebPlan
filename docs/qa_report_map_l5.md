# マップ L5 ブランド評価 — `map_integration_spec` 準拠

> **評価日**: 2026-06-08  
> **対象**: `resorts/Sichinohe-CyoueiSki/web/` — `/map`, `/courses` embed, `LiftMapViewer` 周辺  
> **参照**: [`map_integration_spec.md`](./map_integration_spec.md), [`g2_checklist.md`](./g2_checklist.md) Phase C

---

## Verdict

**PASS**

---

## ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **L5-1 カラートークン** | PASS | `--map-stage-bg`→`--canvas`、`--map-rail-bg`→`--alpine-dark`、`--map-chrome-nav`、`--alpine` フォーカス。本番 `#0c1220` 単色ステージなし（`HeroMapCanvas`, `LiftMapViewer`） |
| **L5-2 タイポグラフィ（C3）** | PASS | `.map-type-display`（Syne）— ヘッダー eyebrow・リゾート名・rail 見出し。`.map-type-body`（Noto）— リスト・凡例・フィルタ。`.map-type-mono` — 最終更新・詳細時刻（`award-design-system.css`, `MapOverlayChrome`, `MapStatusRail`） |
| **L5-3 トップ ↔ マップ一貫性** | PASS | ライト glass ヘッダー + `--ink`/`--muted`/`--border`。暗色 rail は `--alpine-dark` 系。トップの Alpine Clarity と矛盾する全面黒 UI なし |
| **L5-4 コース色** | PASS | `feature-colors.ts` / `ILLUSTRATION_COLORS` がイラスト焼き込み色と一致（初級緑・中級赤・上級紫・リフト黒） |
| **L5-5 アイコン** | PASS | `MapFilterIcons.tsx` SVG。絵文字フィルタなし（C4 継続） |
| **L5-6 i18n** | PASS | `messages/ja.json`・`en.json` の `map.*`。`useTranslations` / `useMapStatusLabel` で UI 文言を集約。`/en/map`・`/en/courses` で英語表示 |
| **L5-7 a11y フォーカス** | PASS | C5 `map-focus-ring` 全インタラクティブ要素に適用済み |

---

## WARN（出荷ブロック外）

| 項目 | 内容 |
|------|------|
| 静的 `map-preview.html` | オフライン用に日本語ハードコード（parity 用・本番 Next とは別） |
| API `feature.label` / `meta` キー | データ側は日本語のまま。UI ラベルのみ i18n |
| `feature.reason` | 運営メッセージは API 原文表示（G4 admin 連携後に検討） |

---

## 再発防止

- マップ UI 文言は **`messages/*.json` の `map` 名前空間のみ** に追加。コンポーネント直書き禁止。
- 見出し・eyebrow は **`.map-type-display`**、本文リストは **`.map-type-body`**、時刻は **`.map-type-mono`** を必ず付与。

---

## 関連チェックリスト更新

| 項目 | 状態 |
|------|------|
| C3 フォント | ✅ |
| L5 evaluator | ✅ 本ファイル |
| マップ i18n | ✅ `map.*` |
