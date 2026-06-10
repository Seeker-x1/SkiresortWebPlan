# G2 チェックリスト — 着手順一本化

> **目的**: LAAX 簡易版の核（[`laax_gap_spec.md`](./laax_gap_spec.md) §G2）を閉じる。  
> **完了宣言**: 本書の **必須項目がすべて ✅** + **ゲート 3 本 PASS**（下記 §6）。  
> **更新**: 2026-06-08（手トレース・コース4・色統一反映後）

**関連 spec（読む順）**

1. [`docs/laax_gap_spec.md`](./laax_gap_spec.md) §G2 — LAAX 判定目標  
2. [`resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md) — 状態遷移・G2-1〜6  
3. [`.cursor/rules/lift-map-no-fake-overlays.mdc`](../.cursor/rules/lift-map-no-fake-overlays.mdc) — A 方式幾何

---

## 0. 現在地サマリ

| 領域 | 状態 |
|------|------|
| イラスト本番（A 方式・焼き込み） | ✅ `sichinohe-hero.png` 1024×790 |
| ヒットボックス（直トレース） | ✅ リフト2 + コース5（`hitboxes-hero-v4.json`） |
| インタラクション骨格（R1–R6, I1–I5） | ✅ Phase E 再評価 PASS（2026-06-08） |
| 凡例・埋め込み・コース色 | ✅ 実装済み（L5 evaluator は G3 可） |
| 幾何マスタ `trails.geojson` | ✅ 5コース・`hero-pixel`・`source` 付き（`sync-trails-geojson.mjs`） |
| キャリブ QA 記録 | ✅ D2–D3 PASS（§9 記録済み） |
| L5 トークン統一（トップ ↔ `/map`） | ✅ spec + トークン + C3 フォント + `qa_report_map_l5.md` PASS |
| a11y / i18n（マップ） | ✅ UI 文言 `map.*`（ja/en）。API ラベルはデータ側 |

---

## 1. 着手順（この順でやる）

```
Phase A  幾何・データの締め（ブロッカー）
    ↓
Phase B  体験の穴埋め（埋め込み・停止表現・色の運用）
    ↓
Phase C  ブランド統一（L5）
    ↓
Phase D  人間 QA（キャリブ ±20px）
    ↓
Phase E  ゲート（16 + 18 + code-reviewer）
```

| Phase | 目安 | 担当 | ブロックするもの |
|-------|------|------|------------------|
| **A** | 0.5〜1日 | 人間トレース + `map-ui-implementer` | すべて |
| **B** | 1〜2日 | `map-ui-implementer` | C, E |
| **C** | 1〜2日 | `resort-map-bridge` → `map-ui-implementer` | E（L5） |
| **D** | 0.5日 | 担当者 + あなた | E |
| **E** | 0.5日 | `map-ux-evaluator` / `map-interaction-evaluator` / `code-reviewer` | **G2 完了宣言** |

---

## 2. Phase A — 幾何・データ（最優先）

| # | タスク | 状態 | 合格条件 | 成果物 / コマンド |
|---|--------|------|----------|-------------------|
| A1 | 全 feature が `features.manifest.json` にある | ✅ | リフト2 + コース5（`trail-forest` 含む） | `features.manifest.json` |
| A2 | ヒットボックス直トレース（1024×790） | ✅ | `hitboxes-hero-v4.json` が正 | `trace-hitboxes.html` |
| A3 | `lift-markers.json` 同期 | ✅ | `node scripts/sync-hero-hitboxes.mjs` | `web/data/map/lift-markers.json` |
| A4 | **`trails.geojson` を5コースに揃える** | ✅ | 各 feature に `source`・id が manifest と一致（`trail-forest` 含む） | `node scripts/sync-trails-geojson.mjs` |
| A5 | `lifts.geojson` 全本数 | ✅ | ペア OSM、ポニー `source` 付き（要現地確認注記あり） | `lifts.geojson` |
| A6 | 本番 `/map` に未検証 SVG 線を出さない（A 方式） | ✅ | 焼き込み + 透明ヒット + 選択時ハイライトのみ | `MapHitboxes.tsx` |
| A7 | `map-preview.html` 再生成 | ✅ | ルート + 七戸両方 | `node scripts/build-map-preview.mjs` |

**A4 のやり方（推奨）**

- ヒットボックス path をマスタとする（WGS84 は別途 OSM がある場合のみ更新、無ければ `properties.source` に「illustrated-hero 手トレース」と明記）
- `trail-forest` を `trails.geojson` に追加（`hitboxes-hero-v4.json` から）

---

## 3. Phase B — 体験（G2 機能）

| # | タスク | 状態 | 合格条件 | 参照 |
|---|--------|------|----------|------|
| B1 | `/map` フルビューア | ✅ | `LiftMapViewer` + サイドバー | — |
| B2 | `/courses` 埋め込み | ✅ | `CoursesMapEmbed` | G2-3 |
| B3 | 埋め込み **≥50dvh**（375px） | ✅ | スクロール前にマップが半画面以上 | G2-3 — `verify-b3-embed.mjs` PASS（2026-06-08） |
| B4 | 凡例（サイドバー内） | ✅ | stage 内 bottom overlay なし | G2-4, `MapLegend.tsx` |
| B5 | コース色 = イラスト色 | ✅ | 初級緑 / 中級赤 / 上級紫 / リフト黒 | `feature-colors.ts` |
| B6 | 停止時の見え方 | ✅ | 停止リフト = グレー破線（未選択でも表示）。稼働中は選択時のみ種別色 | `map-colors.ts` `MapHitboxes.tsx` |
| B7 | モック status → 線・バッジ反映 | ✅ | `status.json` 変更で線・バッジが連動（例: `lift-pony` 停止） | G2 L3 目標 |
| B8 | `map-preview` parity | ✅ | リスト・タップ・rail 内詳細 | G2-6 |
| B9 | 「マップを全画面で」導線（embed） | ✅ | `/courses` → `/map` | `MapOverlayChrome.tsx` `showFullMapLink` |

---

## 4. Phase C — ブランド統一（L5）

| # | タスク | 状態 | 合格条件 | 担当 |
|---|--------|------|----------|------|
| C1 | **`resort-map-bridge` spec** | ✅ | `docs/map_integration_spec.md`（トークン表） | L1 `resort-map-bridge` |
| C2 | `/map` 背景・chrome を `--alpine` / `--canvas` に接続 | ✅ | `#0c1220` 卒業 → `--map-stage-bg` / `--map-rail-bg` | `HeroMapCanvas`, `LiftMapViewer` |
| C3 | フォント Syne + Noto / 数値 mono | ✅ | `.map-type-display` / `body` / `mono` | `award-design-system.css`, lift-map/* |
| C4 | 絵文字フィルタ撤廃 | ✅ | `MapOverlayChrome` → `MapFilterIcons.tsx` SVG | a11y C3 |
| C5 | フォーカスリング | ✅ | `focus-visible` on 地図・リスト・FAB（`map-focus-ring`） | a11y C1 |

> i18n（C4 以外の文言 `messages` 化）は **G3 必須**だが、G2 の L5 を厳しく見るなら Phase C 後半で着手可。

---

## 5. Phase D — キャリブ QA（人間ゲート）

| # | タスク | 状態 | 合格条件 |
|---|--------|------|----------|
| D1 | `calibration-qa.html` を **1024×790** viewBox に合わせる | ✅ | 静的版・`hitboxes-hero-v4` 埋め込み（5500） |
| D2 | 端点 ±20px 目視 | ✅ | リフト上下駅・各コース番号丸付近 |
| D3 | 担当者 OK を記録 | ✅ | 本ファイル §9 |
| **D1v5** | `calibration-qa.html` を **1024×1024** layout-v5 に合わせる | ✅ | `sichinohe-hero-v5.png` + `hitboxes-hero-v5.json`（7 features） |
| **D2v5** | layout-v5 端点 ±20px 目視 | ✅ | リフト駅・コース path 全本 |
| **D3v5** | layout-v5 担当者 OK | ✅ | 本ファイル §9（2026-06-09） |

**ツール**

- トップ静的: http://localhost:5500/preview/index.html  
- コースガイド静的: http://localhost:5500/preview/courses.html  
- **コースとマップの違い（HTML）**: http://localhost:5500/preview/courses-vs-map.html  
- **QA評価サマリー（HTML）**: http://localhost:5500/preview/qa-map-evaluation.html  
- マップ操作確認: http://localhost:5500/maps/map-preview.html  
- キャリブ QA: http://localhost:5500/maps/calibration-qa.html（**推奨**・API 不要）  
- トレース: http://localhost:5500/maps/trace-hitboxes.html  
- サイト同期: `npm run preview:site`（`messages/ja.json` → `public/preview/`）  
- マップ再生成: `npm run preview:map`（map + calibration-qa + **site 同期**）  
- 七戸 dev のみ: http://localhost:3000/maps/calibration-qa.html（`cd resorts/Sichinohe-CyoueiSki/web && npm run dev`）

---

## 6. Phase E — 評価ゲート（G2 完了の最後）

| 順 | エージェント | 見るもの | FAIL 時 |
|----|-------------|----------|---------|
| 1 | `code-reviewer` | 幾何・`source`・A 方式違反なし | Phase A に戻る |
| 2 | `map-ux-evaluator` | R1–R6（`/map` + embed + preview） | Phase B/C |
| 3 | `map-interaction-evaluator` | I1–I5 + **G2-1〜6** | `map-interaction-spec-g2.md` |

**G2-1〜6 早見表**（[`map-interaction-spec-g2.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md) §8）

| ID | 要点 |
|----|------|
| G2-1 | リスト選択で地図面積不変・サイドバー内詳細 |
| G2-2 | コース path タップ → ポップアップなし |
| G2-3 | `/courses` 初期 50dvh 以上マップ |
| G2-4 | 凡例が地図基部を覆わない |
| G2-5 | embed 選択でマップ高さが縮まない |
| G2-6 | `map-preview` parity |

---

## 7. G2 完了時の LAAX スコア（目標）

| ID | G2 完了時の目標 | いま |
|----|-----------------|------|
| L1 | **PARTIAL**（2D イラストで地形が読める） | 🟡 イラストあり、キャリブ QA PASS |
| L2 | **PASS**（全リフト・公開コース選択可） | 🟡 ヒットボックス OK、geo マスタ整備済み |
| L3 | **PASS**（モックでも色反映） | 🟡 停止リフト表現 OK・evaluator 未 |
| L4 | **FAIL 許容**（種別ピルのみ） | ✅ 許容範囲 |
| L5 | **PASS**（トークン統一） | ✅ `qa_report_map_l5.md` 2026-06-08 |

---

## 8. 次のアクション（G2 後）

1. ~~**B3** — `/courses` 375px 50dvh~~ ✅ 2026-06-08  
2. ~~**C5** — フォーカスリング~~ ✅ 2026-06-08  
3. ~~**G2 完了宣言**~~ ✅ 2026-06-08（§9）  
4. **G3** — API ラベル i18n、admin、SSE 等（[`laax_gap_spec.md`](./laax_gap_spec.md) §G3）

---

## 9. 完了記録（記入欄）

| 項目 | 日付 | 担当 | 結果 |
|------|------|------|------|
| キャリブ QA ±20px | 2026-06-08 | ユーザー | **PASS** — `map-preview` 全コースタップ OK、`calibration-qa`（5500）端点 ±20px 目視 OK |
| **キャリブ QA layout-v5** | 2026-06-09 | ユーザー | **PASS** — `sichinohe-hero-v5.png` 1024×1024 + `hitboxes-hero-v5.json` 直トレース 7本、端点 ±20px 目視 OK |
| code-reviewer layout-v5 | 2026-06-09 | Phase E | **PASS** — A 方式・v5 ヒットボックス・1024 座標（`qa_report_map.md` §layout-v5） |
| map-ux-evaluator layout-v5 | 2026-06-09 | Phase E | **PASS** — R1–R6（v5 rail オーバーレイ + MAP_FIT_SCALE） |
| map-interaction-evaluator layout-v5 | 2026-06-09 | Phase E | **PASS** — I1–I5、G2-1〜6 |
| **layout-v5 出荷ゲート** | 2026-06-09 | — | **完了** — キャリブ + 3 evaluator PASS |
| code-reviewer | 2026-06-08 | Phase E | **PASS** — A 方式・`source`・v4 ヒットボックス（`qa_report_map.md` §Phase E） |
| map-ux-evaluator | 2026-06-08 | Phase E | **PASS** — R1–R6（R3/G2-3 は実機 WARN） |
| map-interaction-evaluator | 2026-06-08 | Phase E | **PASS** — I1–I5、G2-1〜6（G2-3 実機 WARN） |
| C5 フォーカスリング | 2026-06-08 | L2 | **PASS** — `map-focus-ring` / `map-focus-ring--on-dark`（地図ヒットボックス・FAB・フィルタ・リスト・凡例・モバイルシート） |
| B3 embed 50dvh（375px） | 2026-06-08 | L2 | **PASS** — `CoursesMapEmbed lead`、可視 488px ≥ 406px（`verify-b3-embed.mjs`） |
| L5 map evaluator | 2026-06-08 | L3 | **PASS** — `qa_report_map_l5.md`（トークン・C3・i18n） |
| マップ UI i18n | 2026-06-08 | L2 | **PASS** — `messages/map.*` ja+en |
| **G2 完了宣言** | 2026-06-08 | — | **完了** — Phase A–E + L5/C3/i18n 記録済み |
| UI 整理セッション | 2026-06-09 | ユーザー指定 | レール分割・QuickNav ADEF・凡例削除・コースデフォルト・preview 同期 |
| **G6 spec ユーザー承認** | 2026-06-08 | ユーザー | **OK** — [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md) |
| map-ux-evaluator（G6） | 2026-06-08 | 16 | **PASS** — R1–R6 + G6-1,3,7（[`qa_report_map.md`](./qa_report_map.md) §G6） |
| map-interaction-evaluator（G6） | 2026-06-08 | 18 | **PASS** — I1–I5 + G6-2,4,5,6。G2-4 **WAIVED** |
| **G6 出荷ゲート** | 2026-06-08 | — | **完了** — spec OK + 16 PASS + 18 PASS |
| トップ hero 採用 | 2026-06-08 | ユーザー | **案 A** — `docs/preview/hero-mock-a-blue.png` → `resorts/Sichinohe-CyoueiSki/web/public/images/hero-sichinohe.png` |
| **トップ hero L1 spec** | 2026-06-09 | 01+05 | [`home-hero-spec.md`](../resorts/Sichinohe-CyoueiSki/docs/home-hero-spec.md) — §6 **案 A 承認済** |
| resort-visual-evaluator（hero 案 A） | 2026-06-08 | V3 | **PASS**（WARN: 1536×1024 のみ）— [`qa_report_visual.md`](./qa_report_visual.md) |
| hero reduced-motion CSS | 2026-06-08 | L2（06） | `award-rise` / `animate-rise` / scroll title 無効化 |
| resort-qa-a11y（七戸 `/`） | 2026-06-08 | L3 | **PASS**（再評価）— Q1–Q6（[`qa_report.md`](./qa_report.md)） |
| トップ i18n L2 | 2026-06-08 | 06 | `home.*` / `a11y.*` messages 化 |
| **L2 ビルド修正** | 2026-06-08 | 06 | `/courses` → `redirect({ href, locale })` — `npm run build` 緑 |
| **L2 デッドコード削除** | 2026-06-08 | 19 | `MapLegend` / `MapLocationPanel` 削除（G6 凡例免除） |
| **L1 導線 spec 同期** | 2026-06-08 | bridge | [`map_integration_spec.md`](./map_integration_spec.md) §6 → G6 |
| **hero 1920×1080** | 2026-06-08 | 06 | Lanczos upscale — visual WARN 解消 |
| **サイト i18n L2** | 2026-06-08 | 06 | `today.*` messages + `resort-data.en.json` + `getResortData(locale)` |
| **全ページ i18n L2** | 2026-06-08 | 06 | access/contact/news/tickets/lessons/stay/deals/plan/* + liveCam + loading |
| **G4 UI 再有効化** | 2026-06-08 | 19 | G6 後ユーザー承認 — 検索・難易度・GPS・ライブバッジ（`map-interaction-spec-g4.md`） |
| **G4 evaluator 再評価** | 2026-06-08 | 16+18 | **PASS** — [`qa_report_map.md`](./qa_report_map.md) §G4 再評価 |
| **preview G3/G4 同期** | 2026-06-08 | L2 | `build-map-preview.mjs` — 検索・難易度・GPS・ライブバッジ |

---

## 10. G3 以降

- ~~サイドバー検索・status 手運用~~ → ✅ [`g3_checklist.md`](./g3_checklist.md)（2026-06-08 完了）
- **G6 UI レイアウト正本** → [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md)（**承認済・出荷ゲート PASS** 2026-06-08）
- **G4**: SSE/ポーリング本番、DB、GPS、難易度フィルタ → [`laax_gap_spec.md`](./laax_gap_spec.md) §G4（**G6 §6 承認まで UI 載せ禁止**）
