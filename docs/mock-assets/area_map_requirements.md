# 周辺エリアマップ — 最終要件書

**Date:** 2026-06-14  
**Author:** `resort-design-director` (L1)  
**Input:** `docs/mock-assets/area_map_ux_spec.md`, `docs/mock-assets/AREA_MAP_BKKDW_AGENT_BRIEF.md`  
**Output path:** `docs/mock-assets/area_map_requirements.md`  
**対象:** 美瑛 LP モック — `docs/mock-assets/area-map.html` 周辺 POI マップ（Leaflet）  
**対象外:** 七戸 `/map`（`map-*` 艦隊）、ルート `src/` 本番 UI

---

## 1. 確定案

### **案 B — Alpine Clarity 調停型**（Map-Primary + Slim Rail）

BKKDW Organic Drop-off の **地図主役・全体俯瞰・統一ドット・地図上ポップアップ** を採用し、美瑛 LP 固有の **スキー場起点ナラティブ** と **特集回遊** を薄いレール／ポップアップ secondary CTA で維持する。

### 案 C からの取り込み（v2 スコープ内）

| 要素 | 採用 | 不採用（Phase 2） |
|------|------|-------------------|
| `boundsProfiles` によるレイヤー別 `fitBounds` | ✅ | — |
| 遠方 food 除外（町内クラスター） | ✅ | — |
| リング色ドット（food / onsen / anchor） | — | v3 で検討 |
| `centerAnchorId` 固定 zoom（現行 Plan A） | — | `fitBounds` に一本化 |

### レイアウト確定値

| ブレークポイント | 地図 | レール / リスト |
|------------------|------|-----------------|
| Desktop **≥1024px** | **70%** 幅, `min-height: min(72vh, 720px)` | **30%** — フィルタ + 番号リスト |
| Tablet **768–1023px** | 上 **65%** | 下 **35%** |
| Mobile スタンドアロン | 上 **60dvh** | 下リスト |
| Mobile **embed** | iframe **100%** 高 | FAB → 下部シート（リストのみ） |

---

## 2. Self-Critique（3案レビュー）

### 案 A — BKKDW 忠実型

| 観点 | 評価 |
|------|------|
| **強み** | BKKDW との差分最小。ポップアップ単独詳細で情報階層が明快。実装・L3 が直線的。 |
| **弱み** | スキー場 LP の「特集を読む」回遊が popup のみに依存。町民スキー場の起点感がリスト順序以外に弱い。 |
| **棄却理由** | 美瑛モックは単なる POI ファインダーではなく **雪遊び後の回遊プランナー**。特集導線の欠落はコンバージョン上のリスク。 |

### 案 B — Alpine Clarity 調停型 ★採用

| 観点 | 評価 |
|------|------|
| **強み** | BKKDW の Map-first / Popup-primary を満たしつつ、LP 既存資産（nearby-food / nearby-onsen 特集）と整合。CTA 階層を Primary（VIEW MAP）/ Secondary（特集 Ghost）で分離可能。 |
| **弱み** | レールに secondary 導線があると「ポップアップが主」が薄れるリスク → **要件でレールから `.area-detail` を廃止**し、特集リンクは popup 内のみに限定して緩和。 |
| **採用理由** | UX spec 推奨と一致。V5 ブランド一貫性・V6 ベンチマーク整合のバランスが最良。 |

### 案 C — クラスター俯瞰型

| 観点 | 評価 |
|------|------|
| **強み** | 美瑛の二極地理（町内 / 白金）に `boundsProfiles` で最適俯瞰。food+onsen 同時の制御が明確。 |
| **弱み** | リング色ドットは「統一ピン」原則と矛盾しやすく、カテゴリ PNG 復帰への足がかりになる。実装・評価コスト増。 |
| **棄却理由** | **boundsProfiles のみ案 B にマージ**。リング色は v2 では採用しない。 |

### Director 判断の一行

> **BKKDW の地図 UX を骨格とし、美瑛 LP の回遊は popup secondary + リスト順序（スキー先頭）で足す。縮尺は案 C の boundsProfiles でクラスター制御する。**

---

## 3. 機能要件（Must）

### 3.1 俯瞰と縮尺

- [ ] **F1** 初回表示: 表示中レイヤーの全ピンが viewport 内に収まる（`fitBounds` + padding）。
- [ ] **F2** レイヤー切替後: ポップアップを閉じ、`fitBounds` を再実行。
- [ ] **F3** ピン / リスト選択時: **ズーム変更禁止**。ポップアップが clip される場合のみ Leaflet `autoPan` / 最小 `panTo`。
- [ ] **F4** `boundsProfiles`（`biei-area.json`）でレイヤー組合せごとに fit 対象と `maxZoom` を制御（案 C ロジック継承）。
- [ ] **F5** 現行の `centerAnchorId` + 固定 `setView` / `flyTo` + `selectionZoom` は **廃止**。

### 3.2 ピン

- [ ] **F6** 統一ドットピン（`L.divIcon`）。カテゴリ別 PNG（Mapular）は v2 で使用しない。
- [ ] **F7** 通常: 外円 20px / 内ドット 6px。active: 24px / 8px。`id: ski`: 常時 24px / 8px。
- [ ] **F8** 色: 外円 `#1a1f26`（`--area-text`）、内ドット `#5a6f85`（`--area-accent`）。リング色なし。

### 3.3 ポップアップ（主詳細）

- [ ] **F9** ピン click / リスト click → 地図上ポップアップ open。`selectedId` 双方向同期。
- [ ] **F10** 必須フィールド: **名前**（`label`）、**カテゴリ**（`UI.category.*`）。
- [ ] **F11** 任意フィールド（データがある場合のみ DOM 出力）: `district`, `phone`, `website`。
- [ ] **F12** Primary CTA: **VIEW MAP →** — `googleMapsUrl(mapsQuery)`、新規タブ、`min-height: 44px`。
- [ ] **F13** Secondary CTA（food / onsen のみ）: **特集を読む** — ghost スタイル。Primary の下に配置。
- [ ] **F14** 地図空白 click / **Esc** → ポップアップ close + `selectedId` null。
- [ ] **F15** 右レール `.area-detail` は **非表示（廃止）**。詳細はポップアップのみ。

### 3.4 リストレール

- [ ] **F16** 番号付きリストは選択の代替経路。`ski` → `biei-station` → 他の順でソート。
- [ ] **F17** リスト選択時もポップアップ open（レール内に詳細パネルを出さない）。

### 3.5 レイヤー・埋め込み

- [ ] **F18** レイヤー: 飲食 / 温泉 / 拠点（既存維持）。デフォルト `food,anchor`。
- [ ] **F19** LP embed: 親 `.map-layer-btn` + `postMessage` 連携（既存 `map-embed-layers.js` 維持・拡張可）。
- [ ] **F20** embed モバイル: 地図 100% 高 + FAB リストシート。シートは **リスト専用**（詳細モーダル禁止）。

### 3.6 データ

- [ ] **F21** `biei-area.json` に `phone` / `website` / `district` 追加（代表 **3 件以上** にサンプル。他は省略可）。
- [ ] **F22** `schemaVersion` 更新。後方互換（新フィールド省略可）。
- [ ] **F23** 根拠なき座標追加禁止。既存 `source` 維持。

---

## 4. ビジュアル受け入れ基準（V1–V5）

L3 `resort-visual-evaluator` は本節を `area_map_qa_visual.md` のルーブリックとして使用する。

### V1 タイポグラフィ階層（必須）

| 要件 | 合格条件 |
|------|----------|
| ポップアップタイトル | `0.9375rem`–`1rem`, weight 700。1 行または 2 行 clamp。 |
| カテゴリ / 地区 | `0.6875rem`–`0.75rem`, `--area-muted` または popup 内 `#c5cdd6`。 |
| リスト | mono 番号 → Syne eyebrow → title の 3 段（現行維持）。 |
| CTA | Syne または Noto、uppercase / letter-spacing でボタンと本文を分離。 |
| **FAIL** | ポップアップ内がすべて同一 `font-size` の平坦羅列。 |

### V2 余白リズム（必須）

| 要件 | 合格条件 |
|------|----------|
| 地図ステージ | Desktop で shell 内 **≥70%** 幅。`min-height: min(72vh, 720px)`。 |
| ポップアップ | padding `0.75rem 1rem`; フィールド間 `0.35rem`–`0.5rem`; CTA 上 `0.75rem`。 |
| 地図フレーム | `2px solid var(--area-accent)` + `border-radius: 0.5rem`（スタンドアロン）。 |
| 8px グリッド | padding / gap が 4 の倍数。 |
| **FAIL** | 地図 : レールが 60:40 以下（地図が過小）。 |

### V3 写真・ビジュアルアセット（必須）

| 要件 | 合格条件 |
|------|----------|
| 地図タイル | Carto **light** / Positron 等の淡色タイル。**標準カラー OSM は不可**。 |
| ピン | 統一ドットのみ。デフォルト Leaflet 青ピン・カテゴリ PNG は **不可**。 |
| ポップアップ | BKKDW 型ダークカード `#1a1f26` + 白文字 `#fafbfc`。幅 `min(280px, calc(100vw - 48px))`。 |
| **FAIL** | カテゴリ別 Mapular PNG が残存。タイルが高彩度 OSM のまま。 |

### V4 マイクロインタラクション（必須）

| 要件 | 合格条件 |
|------|----------|
| 選択 | ピン scale 1.2–1.25。`transition` ≤ 0.2s。 |
| ポップアップ | 出現は Leaflet 既定 + CSS（過剰バウンス禁止）。 |
| レイヤー切替 | `fitBounds` animate; `prefers-reduced-motion` 時は `animate: false`。 |
| 禁止 | 選択時 `flyTo` ズームイン。BKKDW ネオンのフラッシュアニメ。 |
| LP チップ | 既存 `--ease: cubic-bezier(0.22, 1, 0.36, 1)` 維持。 |

### V5 ブランド一貫性（必須）

| 要件 | 合格条件 |
|------|----------|
| トークン | `--area-accent: #5a6f85`, `--area-text: #1a1f26`, `--area-bg: #f4f6f8` を主軸。 |
| CTA Primary | `--area-accent` 背景。Secondary ghost は border のみ。 |
| BKKDW 色 | `#E2FC07` ネオンイエロー **使用禁止**。 |
| 絵文字 | UI アイコン代わりに使用禁止。`↗` / `→` は typographic suffix のみ可。 |
| LP 整合 | 親ページ `.map-layer-btn[aria-pressed=true]` の `#1a2332` と popup ダークカードが同系統。 |
| **FAIL** | ネオンイエロー採用。絵文字ピン。トークン未使用のハードコード乱立。 |

### V6 ベンチマーク整合（推奨・WARN 可）

識別可能な 3–5 要素:

1. 全ピン俯瞰の初期 `fitBounds`
2. 統一ドットピン
3. 地図上ダークポップアップ + **VIEW MAP →**
4. 地図 ≥70% の Map-first レイアウト
5. 淡色タイル

---

## 5. a11y 最低要件（L3 委譲用サマリ）

| ID | 要件 |
|----|------|
| A1 | ポップアップ `role="dialog"` + `aria-labelledby`（タイトル id） |
| A2 | 閉じるボタン `aria-label`（i18n） |
| A3 | VIEW MAP CTA に `aria-label`（i18n。例: 「Google マップで開く」） |
| A4 | CTA / 閉じる / リスト / FAB ≥ 44px |
| A5 | `:focus-visible` 2px outline |
| A6 | Esc でポップアップ閉じる（focus trap 不要） |
| A7 | `prefers-reduced-motion` で fitBounds / pin transition 無効 |

---

## 6. インタラクション状態遷移（確定）

```
[Overview]
  fitBounds(visiblePins per boundsProfile)
  popup: closed
  selectedId: null

  → pin click | list click
[Selected]
  selectedId: set
  popup: open on map (autoPan if clipped)
  zoom: unchanged

  → map blank click | Esc | layer change
[Overview]
```

レイヤー変更時は必ず Selected → Overview に戻してから fitBounds。

---

## 7. boundsProfiles 確定表

`biei-area.json` — fitBounds 対象と `maxZoom`（案 B + 案 C マージ）

| Profile | 条件 | include / exclude | maxZoom |
|---------|------|-------------------|---------|
| `skiFood` | food + anchor（onsen off） | food + anchor; exclude 遠方 food 3件, `blue-pond` | 14 |
| `onsen` | onsen only | onsen のみ | 13 |
| `onsenAnchor` | onsen + anchor | onsen + anchor; exclude `ski`, `blue-pond` | 12 |
| `foodOnsen` | food + onsen（+anchor） | 町内 food + 白金 onsen; exclude 遠方 food, `blue-pond` | 10 |
| `anchorAll` | anchor only | anchor 全件 | 11 |

`centerAnchorId` / 固定 zoom は **使用しない**。常に `fitBounds(featuresForBounds(profile))`。

---

## 8. ポップアップ DOM（確定テンプレート）

```html
<div class="area-map-popup" role="dialog" aria-labelledby="area-popup-title-{id}">
  <button type="button" class="area-map-popup__close" data-i18n-attr="aria-label:popup.close">×</button>
  <h3 class="area-map-popup__title" id="area-popup-title-{id}">{label}</h3>
  <p class="area-map-popup__category">{categoryLabel}</p>
  <!-- 以下、データがある場合のみ -->
  <p class="area-map-popup__district">{district}</p>
  <a class="area-map-popup__phone" href="tel:{phone}">{phone}</a>
  <a class="area-map-popup__web" href="{website}" target="_blank" rel="noopener">{websiteLabel} ↗</a>
  <a class="area-map-popup__cta" href="{googleMapsUrl}">{viewMapLabel}</a>
  <!-- food / onsen のみ -->
  <a class="area-map-popup__guide" href="{guideHref}">{readGuideLabel}</a>
</div>
```

**CTA 優先順位:** `__cta`（Primary）> `__guide`（Secondary ghost）。空フィールドの行は出力しない。

---

## 9. 禁止事項（再掲）

1. 選択時 `flyTo` / `setView` ズームイン  
2. リスト選択 → 地図を覆う全画面 sheet / modal（embed FAB はリストのみ）  
3. カテゴリ別 PNG ピン（v2）  
4. 根拠なき POI 座標  
5. 七戸 `/map` SVG オーバーレイの流用  
6. BKKDW ネオンイエローそのままコピー  
7. 標準カラー OSM タイルのまま出荷  

---

## 10. L2 実装ファイル（参照）

| パス | 変更内容 |
|------|----------|
| `_shared/area-map.js` | popup, fitBounds, divIcon, 状態遷移, boundsProfiles |
| `_shared/area-map.css` | 70/30 レイアウト, popup, dot pin, フレーム |
| `area-map.html` | 構造調整（`.area-detail` 削除可） |
| `data/maps/biei-area.json` | phone/website/district, boundsProfiles 更新 |
| `_shared/map-embed-layers.js` | 必要なら popup 連携 |
| `biei-lp/mock.css` | embed 高さ（地図主役。リストは FAB） |

---

## 11. 検証 URL

```bash
npx serve docs/mock-assets -p 3456
```

| URL | 確認 |
|-----|------|
| `/area-map.html?resort=biei` | 70/30, fitBounds, popup |
| `…&layers=food,onsen,anchor` | foodOnsen profile, maxZoom 10 |
| `…&embed=1&layers=food,anchor` | FAB + popup offset |
| `biei-lp/nearby-food.html` | iframe + 地図で見る |

---

## 12. 出荷ゲート

```
resort-i18n-spec + resort-map-bridge → resort-spec-handoff → resort-template-implementer
→ resort-qa-a11y PASS + resort-visual-evaluator PASS（V1 or V5 FAIL = 出荷不可）
```

**七戸 `map-*` 艦隊は起動しない。**

---

## 13. 次エージェント

```
@resort-i18n-spec
@resort-map-bridge
入力: 本 requirements.md
→ area_map_i18n.md / area_map_data_contract.md（並列可）

@resort-spec-handoff
→ area_map_handoff_checklist.md
```
