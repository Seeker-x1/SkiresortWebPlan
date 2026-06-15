# 周辺エリアマップ — QA / a11y レポート

**Date:** 2026-06-14  
**Evaluator:** `resort-qa-a11y` (L3)  
**対象:** `docs/mock-assets/area-map.html`（standalone + `embed=1`）、`biei-lp/nearby-food.html` iframe  
**基準:** `area_map_requirements.md` §3（F1–F23）、§5（A1–A7）、`area_map_handoff_checklist.md` §6–8  
**対象外:** 七戸 `/map`、`src/`

---

## Verdict

**PASS**

---

## ルーブリック（Q1–Q6 — モック適用版）

| ID | 結果 | 根拠 |
|----|------|------|
| **Q1** Mobile-first | **PASS** | 375px: スタンドアロン地図 `60dvh`、embed は地図 100% + FAB 44px（`.area-embed-list-fab`）。リスト・フィルタ・popup CTA は `min-height: 44px`。横スクロールなし（`min-width: 0` / `overflow: auto` on rail）。 |
| **Q2** Accessibility | **PASS** | `:focus-visible` 2px outline（フィルタ・リスト・popup・FAB・topbar）。`prefers-reduced-motion` で pin transition 無効、`fitBounds` は `animate: false`（`area-map.js` `prefersReducedMotion()`）。Lang switch: `aria-pressed` + `aria-current`。 |
| **Q3** Conversion path | **PASS** | ピン or リスト（1タップ）→ popup Primary CTA「地図で開く →」/「VIEW MAP →」（2タップで Google Maps）。food/onsen は ghost「特集を読む」で LP 特集へ。`.area-detail` 廃止済み。 |
| **Q4** i18n | **PASS** | `?lang=en` + `UI.en` で英語 UI。popup CTA は ja「地図で開く →」/ en「VIEW MAP →」分離。POI は JSON `{ja,en}`。`filterLabel` を `renderFilters()` で `aria-label` 注入（ハードコード `Filter` 除去）。 |
| **Q5** Performance | **PASS** | 無限アニメーションなし。初回 `fitBounds` 1回 + レイヤー変更時のみ再実行。Leaflet / Carto タイル CDN。PNG ピン fetch なし。 |
| **Q6** Data separation | **PASS** | POI 名・座標は `biei-area.json`。UI 文言は `area-map.js` `UI` のみ。`label` の UI 重複定義なし。 |

---

## 要件別 a11y（A1–A7）

| ID | 結果 | 根拠 |
|----|------|------|
| **A1** | **PASS** | `buildPopupHtml`: `role="dialog"` + `aria-labelledby="area-popup-title-{id}"` + `h3#area-popup-title-{id}` |
| **A2** | **PASS** | 閉じる `aria-label` = `t("popup.close")`（ja/en） |
| **A3** | **PASS** | CTA `aria-label` = `t("popup.viewMapAria", { name })` |
| **A4** | **PASS** | popup close / CTA / guide / filter / FAB / zoom control ≥ 44px。リスト `min-height: 44px` |
| **A5** | **PASS** | 全インタラクティブ要素に `:focus-visible` outline |
| **A6** | **PASS** | `keydown` Escape + 地図空白 click + × ボタンで `closePopup()`。focus trap 不要（要件通り） |
| **A7** | **PASS** | `prefers-reduced-motion` → pin `transition: none`、fitBounds `animate: false`、scroll `behavior: auto` |

---

## 機能スモーク（F1–F23 抜粋）

| ID | 結果 | 備考 |
|----|------|------|
| F1–F5 | **PASS** | `fitMapToProfile` のみ。選択時 zoom 不変。0件時フォールバック `setView` のみ許容 |
| F6–F8 | **PASS** | `L.divIcon` 統一ドット。PNG / `marker-icons.json` 参照なし |
| F9–F15 | **PASS** | popup 主詳細。Esc / 空白閉じ。`.area-detail` 非表示 + HTML 削除 |
| F16–F20 | **PASS** | ski 先頭ソート。embed FAB + `map-embed-layers.js` postMessage |
| F21–F23 | **PASS** | `schemaVersion: 2026-06-14-bkkdw`。サンプル POI ≥3。座標 `source` 維持 |

---

## 検証 URL（コードレビュー + 手順照合）

```bash
npx serve docs/mock-assets -p 3456
```

| # | URL | 確認 |
|---|-----|------|
| 1 | `/area-map.html?resort=biei` | 70/30、fitBounds、popup |
| 2 | `…&layers=food,onsen,anchor` | foodOnsen maxZoom 10 |
| 3 | `…&focus=junpei` | 初期 popup |
| 4 | `…&embed=1&layers=food,anchor` | FAB + postMessage |
| 5 | `…&lang=en` | VIEW MAP → |
| 6 | `/biei-lp/nearby-food.html` | embed focus |

---

## WARN（出荷ブロック外）

| 項目 | 内容 |
|------|------|
| W1 | food + onsen 同時 ON 時、maxZoom 10 で町内ピンが小さくなる（handoff §11 既知トレードオフ） |
| W2 | `hubBadge`（拠点バッジ）は popup 未実装（任意要件） |
| W3 | 手動ブラウザ実機確認は CI 外 — ローカル `npx serve` で最終目視推奨 |

---

## 再発防止

- リスト詳細をレールに復活させない（popup-only）。選択時 `flyTo` / zoom 変更を PR で grep 禁止。

---

## Ship gate

```
resort-qa-a11y PASS + resort-visual-evaluator PASS → mock LP 周辺マップ v2 出荷可
```

**本レポート:** ✅ PASS（`resort-visual-evaluator` の合否とセットで出荷判定）
