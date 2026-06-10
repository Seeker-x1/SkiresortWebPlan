# QA / A11y 評価レポート — 七戸サイト全站

> **Agent**: `resort-qa-a11y`（L3）  
> **Date**: 2026-06-10（全站再評価）  
> **Target**: `resorts/Sichinohe-CyoueiSki/web/src/app/[locale]/**` + 共有コンポーネント  
> **前回**: 2026-06-08 トップ `/` のみ PASS  
> **L2 前提**: 全コンテンツページ i18n + G4 マップ UI 再マウント + `resort-data.en.json`

---

## 総合判定: **PASS**

全 `[locale]` ルート（16 ページ + `/courses` リダイレクト）を Q1–Q6 で再評価。ブロッカーなし。

**ビジュアル**: `resort-visual-evaluator` ヒーロー **PASS**（解像度 WARN 解消済 2026-06-08）

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → サイト UI 出荷可
```

---

## 評価範囲

| ルート | metadata i18n | 本文 i18n | 備考 |
|--------|---------------|-----------|------|
| `/` | `meta` template | `home.*` | CinematicHero 版 |
| `/today` | ✅ | `today.*` | `AwardPageShell` |
| `/access` | ✅ | `access.*` | |
| `/contact` | ✅ | `contact.*` | |
| `/news` | ✅ | `news.*` | |
| `/tickets-rental` | ✅ | `ticketsRental.*` | 表 `aria-label` + `scope` |
| `/lessons-events` | ✅ | `lessonsEvents.*` | |
| `/stay-local` | ✅ | `stayLocal.*` | |
| `/lift-deals` | ✅ | `liftDeals.*` | |
| `/faq` | ✅ | `faq.*` | |
| `/live-cams` | ✅ | `liveCams.*` | `LiveCamFrame` status i18n |
| `/map` | ✅ `map.page` | `map.*` | G4 レール・検索・難易度・GPS |
| `/plan/*`（3） | ✅ | `plan.*` | |
| `/courses` | — | — | `/map` 恒久リダイレクト |
| `loading.tsx` | — | `common.loading*` | |
| `/admin` | — | JA 固定 | スタッフ用（locale 外）— 評価対象外 |

---

## ルーブリック（全站）

### Q1 Mobile-first — **PASS**

| 項目 | 判定 | 根拠 |
|------|------|------|
| タッチターゲット ≥ 44px | PASS | `LangSwitcher` `min-h-11 min-w-11`。`AwardButton` 52px。`MapQuickNav` `min-h-11` |
| 375px 横スクロールなし | PASS | `.home-canvas { overflow-x: clip }`。`AwardPageShell` / 表は横スクロール containment |
| マップレール行 | WARN（非ブロック） | リスト行 `py-2.5` は密 UI（≈40px）。FAB・QuickNav・言語切替は 44px 以上 |

### Q2 Accessibility — **PASS**

| 項目 | 判定 | 根拠 |
|------|------|------|
| フォーカスリング | PASS | `globals.css` `.reveal-trigger:focus-visible`。マップ `mapFocusRing` 全インタラクティブ |
| 画像 `alt` | PASS | 装飾 `alt=""`。意味ある画像は `messages` キー |
| `prefers-reduced-motion` | PASS | rise / reveal 無効化 |
| 言語切替 a11y | PASS | `lang.switch` + `aria-current` + `role` group |
| スキップリンク | PASS | `a11y.skipToContent`（`layout.tsx`） |
| `/map` レール | PASS | 検索 `aria-label`、難易度 `aria-pressed`、タブ `role="tablist"` / `aria-selected`、リスト `aria-pressed` |
| 表 | PASS | `tickets-rental` `aria-label` + `th scope="col"` |

### Q3 Conversion path — **PASS**

| ページ | 導線 |
|--------|------|
| `/` | ヒーロー Primary → `/today` 1タップ。PathMagnet → 料金・マップ |
| コンテンツ | `SiteHeader` + `MapQuickNav`（/map）で主要導線 ≤3 タップ |
| `/map` | QuickNav A–F + レール選択 → 詳細（stage 内、sheet なし） |

### Q4 i18n — **PASS**

| 項目 | 判定 | 根拠 |
|------|------|------|
| ルーティング | PASS | `next-intl` ja / en、`generateStaticParams` |
| ページシェル | PASS | 全コンテンツ `getTranslations` + `AwardPageShell` |
| 動的データ | PASS | `getResortData()` → `resolveDataLocale` + `resort-data.en.json` |
| マップ UI | PASS | `map.*` namespace（検索・難易度・ライブ・GPS） |
| 残存固定 JA（非ブロック） | 許容 | `SkiResortJsonLd` description、`feature.label`（manifest）、admin UI、`CinematicHero` 空 snapshot フォールバック |

### Q5 Performance — **PASS**

| 項目 | 判定 | 根拠 |
|------|------|------|
| ヒーロー | PASS | `next/image` + `priority` 1920×1080 |
| アニメーション | PASS | `prefers-reduced-motion` ガード |
| ビルド | PASS | `npm run build` 2026-06-10 green（44 static routes） |

### Q6 Data separation — **PASS**

| 項目 | 判定 | 根拠 |
|------|------|------|
| 価格・本文 | PASS | `resort-data.json` / `resort-data.en.json` |
| UI 文言 | PASS | `messages/ja.json` / `en.json` |
| マップ status | PASS | `data/map/status.json`（locale 非依存の運行データ） |

---

## マップ（`/map`）— a11y 拡張（resort-qa-a11y 管轄分）

| 項目 | 判定 |
|------|------|
| G4 ライブバッジ（SSE） | PASS — `MapTopBar` transport=sse 時表示 |
| 検索・難易度 | PASS — レール内のみ、地図 overlay なし |
| GPS | PASS — `MapLocationPanel` レール内、permission 文言 i18n |

レイアウト・インタラクション詳細は [`qa_report_map.md`](./qa_report_map.md)（map-ux / map-interaction evaluator）。

---

## G4-1 実機（関連）

| 項目 | 結果 |
|------|------|
| admin POST → SSE | **PASS** 2279ms（2026-06-10） |
| スクリプト | `resorts/Sichinohe-CyoueiSki/scripts/verify-g4-1-sse.mjs` |

---

## 残タスク（出荷ブロック外）

- `SkiResortJsonLd` / `feature.label` の locale 別文案（SEO・任意）
- admin 更新時の en JSON 自動同期
- 未使用レガシーコンポーネント（`AudienceSplitCards` 等）の削除整理

---

## 再発防止

1. **新規 `[locale]` ページ** — `messages` キー → `generateMetadata` → `AwardPageShell` の順で追加  
2. **マップ UI** — 検索・フィルタはレール state のみ（stage overlay 禁止）  
3. **出荷前** — 本レポート（全站）+ `qa_report_visual.md` + `qa_report_map.md` の3点セット
