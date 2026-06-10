# マップインタラクション体験仕様 — G5 追記（R6 cover・専用シェル・IA）

> **L1** | 2026-06-09  
> **親**: `map-interaction-spec-g2.md`（上書きしない）  
> **入力**: `qa_report_map.md` §E–F、`laax_gap_spec.md` 層 C

---

## 0. スコープ

| 項目 | G5 で追加 |
|------|-----------|
| R6 | scale=1 **cover fit**（letterbox 禁止） |
| `/map` | `MapPageShell` 専用フルビューポート（§E P1） |
| IA | `/courses` vs `/map` 役割定義（§F） |
| L1 資産 | **3D 風 2D 焼き込みイラスト** 維持（WebGL 不要） |

---

## 1. `/courses` vs `/map` — ユーザー向け役割

| ページ | 日本語名（nav 統一） | 主目的 | 副コンテンツ |
|--------|---------------------|--------|--------------|
| **`/map`** | **ゲレンデマップ** | ライブ運行確認（全画面） | コースガイドへのリンク |
| **`/courses`** | **コースガイド** | 距離・斜度・雪面スペック | 埋め込みマップ（プレビュー帯 +「全画面で」） |

**技術**: 同一 `LiftMapViewer`。差は `variant`（embed / full）、コピー、導線、シェル。

**禁止**: ナビで「コース」「マップ」だけ並べて同等に見せる（IA1 FAIL）。

---

## 2. R6 cover fit

| 状態 | 仕様 |
|------|------|
| scale=1 | **全体表示**（`coverDimensions` = contain + 16px pad）。地形図の端を切らない |
| scale>1 | 既存クランプ維持 |
| preview | `build-map-preview.mjs` の `fit()` も cover。`MIN_SCALE=1` |

---

## 3. `map-full` シェル（G5）

```
MapPageShell (fixed inset-0 z-60)
├── MapTopBar（ホーム / コースガイド / 言語）
└── LiftMapViewer h-full
```

通常 `SiteHeader` + `footer` は DOM に残るがシェルが覆う。body `overflow: hidden`。

---

## 4. 埋め込み（G5 IA 追記）

| 要素 | 仕様 |
|------|------|
| 説明帯 | `CoursesMapEmbed` 先頭 1 行（`coursesPage.intro`） |
| バッジ | chrome「プレビュー」 |
| 導線 |「ゲレンデマップを全画面で」→ `/map` |
| 全画面 | chrome「コースガイド（距離・斜度）」→ `/courses` |

---

## 5. 受け入れ（Given/When/Then）

1. **Given** 1280×800 `/map` **When** 初期表示 **Then** stage 内に letterbox 帯なし（R6）
2. **Given** `/courses` **When** 5 秒以内にユーザーが役割を説明 **Then**「マップ=運行、コース=数値」と言える（IA 手動）
3. **Given** 375px `map-preview` **When** 初期 **Then** rail 非表示、FAB のみ（R3）

---

## 6. エージェント

```
map-interaction-spec（本書）✅
  → map-ui-implementer
    → map-ux-evaluator（R6 再 PASS）
    → map-interaction-evaluator（I1–I5 維持）
```
