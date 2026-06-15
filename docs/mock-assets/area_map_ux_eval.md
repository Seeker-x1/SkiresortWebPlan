# 周辺エリアマップ — UX 評価レポート

**Date:** 2026-06-15（A2 評価 FAIL 記録 → `ee84627` 実装・再評価 PASS）  
**Evaluator:** L3 横断レビュー（`resort-template-implementer` 実装 + コード検証）  
**基準:** `area_map_ux_spec.md` §2、`area_map_m1_a1_handoff.md`、`area_map_a2_fixed_anchor_handoff.md`、`area_map_p1_popup_handoff.md`  
**対象:** `area-map.html` standalone、`nearby-food.html` / `nearby-onsen.html` embed

---

## Verdict

**PASS（条件付き）** — A2 は実装前 FAIL → `ee84627` で是正済み。本番 JS に A2 コード反映を確認。

| ゲート | 結果 |
|--------|------|
| **M1** standalone タイル表示 | **PASS** ✅ CSS 確定高さ + `invalidateSize` |
| **A2** 固定拠点リスト分離 + マップ下部トグル | **PASS** ✅ |
| **P1** ポップアップ（× / 白カード / Google CTA） | **PASS** ✅ |
| **R1** レールリスト可読高さ | **PASS** ✅（`area_map_r1_fix.md`） |
| U1–U3 / J2-a | **PASS** ✅（回帰なし） |
| 厳格総合 | **PASS** — visual/a11y L3 は別途 |

---

## M1 — standalone タイル表示

| # | 観点 | 結果 | 根拠 |
|---|------|------|------|
| 1 | 1440px タイル | **PASS** | `.area-shell` / `.area-stage` に `height: var(--area-map-widget-max)` |
| 2 | `.area-leaflet-map` 高さ | **PASS** | `min-height: 10rem` + 親 100% |
| 3 | embed 回帰 | **PASS** | embed チェーンは変更なし |

---

## A2 — 固定拠点（スキー場・駅）

参照: `area_map_a2_fixed_anchor_handoff.md`

### A2 評価ゲート（実装前・2026-06-15）

**確認 URL:** https://guides.japowserch.com/area-map.html?resort=biei&layers=food,anchor  
**方法:** ユーザー報告スクリーンショット + コードレビュー（`sortForList`）

| # | 観点 | 結果 | メモ |
|---|------|------|------|
| 1 | リスト 01/02 が ski / station | **FAIL** | `sortForList` が `[...hubs, ...rest]` で先頭固定 |
| 2 | 可視 3 行が拠点 2 + 他 1 で潰れる | **FAIL** | レール高さ制約下で回遊 POI が読めない |
| 3 | 件数に固定拠点含む | **FAIL** | 「13件」表示（リスト対象は 11 のはず） |
| 4 | マップ下部トグル | **FAIL** | 未実装 |
| 5 | 地図ピン（スキー場・駅） | — | 要件どおり表示でよい（リスト除外が論点） |

**A2 ゲート総合: FAIL** → `area_map_a2_fixed_anchor_handoff.md` 実装へ進行。

---

### A2 再評価（実装後 `ee84627`・本番 JS 確認）

**確認:** `guides.japowserch.com/_shared/area-map.js` に `FIXED_ANCHOR_IDS` + `sortForList` filter を確認（2026-06-15）。

| # | 観点 | 結果 | 根拠 |
|---|------|------|------|
| 1 | リスト 01/02 | **PASS** | `sortForList` が `FIXED_ANCHOR_IDS` を除外 |
| 2 | 可視行が回遊 POI のみ | **PASS** | 先頭が飲食 or 青い池等 |
| 3 | 件数 | **PASS** | `spotCount` はリスト対象のみ（11件） |
| 4 | マップ下部トグル | **PASS** | `.area-map-fixed-toggles`（standalone） |
| 5 | 拠点レイヤー OFF + トグル ON | **PASS** | `markersForRender()` / `isFeatureOnMap()` |
| 6 | embed | **PASS** | トグル非表示・固定ピン常時 ON |

**A2 ゲート総合: PASS** ✅

---

## P1 — ポップアップ

| # | 観点 | 結果 | 根拠 |
|---|------|------|------|
| 1 | × クローズ | **PASS** | `getContainer` 委譲 + `disableClickPropagation` |
| 2 | 白地・黒枠 | **PASS** | `--area-popup-bg: #fff` + `1.5px` border |
| 3 | CTA 文言 | **PASS** | 「Google マップで開く →」 |
| 4 | ボタン形状 | **PASS** | `border-radius: 0`、細身 CTA |
| 5 | コントラスト | **PASS** | Primary 黒地白字 / Secondary 白地黒枠 |

---

## ジャーニー（抜粋・回帰）

### J3 popup CTA

| 観点 | 結果 |
|------|------|
| Google マップ明示 CTA | **PASS** |
| 「特集を読む」 | **PASS**（U2 維持） |

### J5 フルサイズマップ

| 観点 | 結果 |
|------|------|
| レールリスト可読性 | **PASS**（R1） |
| リスト先頭が回遊 POI | **PASS**（A2） |

---

## 手動確認（デプロイ後）

```bash
cd guides && node scripts/sync.mjs && npm run dev
```

| URL | 確認 |
|-----|------|
| `/area-map.html?resort=biei&layers=food,anchor` | タイル・リスト 01・下部チェック・popup × |
| `/biei/nearby-food.html` | embed 地図・FAB・postMessage |

本番: https://guides.japowserch.com/area-map.html?resort=biei&layers=food,anchor

---

## Ship gate

```
UX: PASS（M1/A2/P1/R1）
+ resort-qa-a11y PASS + resort-visual-evaluator PASS → mock LP 出荷可
```

---

## 変更サマリ

| ファイル | 変更 |
|----------|------|
| `area-map.js` | A2 固定拠点、P1 popup 委譲、embed FAB 再初期化 |
| `area-map.css` | M1 高さ、P1 白ポップアップ、A2 下部トグル |
| `biei-area.json` | `fixedOnMap` / `listExclude` |
| `area_map_ux_spec.md` | §5.2 白カードトークン |
