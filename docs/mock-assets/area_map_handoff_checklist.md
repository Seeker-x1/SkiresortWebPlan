# 周辺エリアマップ — L2 Handoff Checklist

**Date:** 2026-06-14  
**Author:** `resort-spec-handoff` (L1→L2)  
**Frozen inputs:**

| Doc | Path |
|-----|------|
| Requirements | `docs/mock-assets/area_map_requirements.md` |
| i18n | `docs/mock-assets/area_map_i18n.md` |
| Data contract | `docs/mock-assets/area_map_data_contract.md` |

**Implementer:** `@resort-template-implementer`  
**L3 evaluators:** `@resort-qa-a11y`, `@resort-visual-evaluator`  
**対象外:** 七戸 `map-*` 艦隊、`resorts/Sichinohe-CyoueiSki/web/`、ルート `src/`

---

## 0. 確定デザイン（1 行）

**案 B — Alpine Clarity 調停型:** BKKDW 型 **fitBounds 俯瞰 + 統一ドット + 地図上ダークポップアップ** を主とし、特集回遊は popup secondary CTA のみ。地図 70% / レール 30%。

---

## 1. 実装順序（推奨）

```
Phase 1  データ — biei-area.json スキーマ更新・廃止フィールド削除
Phase 2  ピン   — divIcon 統一ドット、PNG / marker-icons 参照除去
Phase 3  縮尺   — fitBounds 一本化（setView/flyTo/selectionZoom 削除）
Phase 4  ポップアップ — bindPopup / L.popup、Esc・空白閉じ、UI.popup i18n
Phase 5  レイアウト — 70/30 CSS、.area-detail 廃止、地図フレーム
Phase 6  埋め込み — embed FAB・postMessage・focus 同期の回帰確認
Phase 7  手動検証 → L3 起動
```

---

## 2. ファイル別チェックリスト

### 2.1 `docs/mock-assets/data/maps/biei-area.json`

- [ ] `schemaVersion` → `"2026-06-14-bkkdw"`
- [ ] **削除:** `center`, `zoom`, `hubAnchorId`, `viewports` 全体
- [ ] **boundsProfiles 簡素化** — 各 profile から `centerAnchorId`, `centerMode`, `zoom`, `selectionZoom`, `ensureAnchorIds` を削除
- [ ] **boundsProfiles maxZoom 確定:**

| profile | maxZoom |
|---------|---------|
| `skiFood` | 14 |
| `onsen` | 13 |
| `onsenAnchor` | 12 |
| `foodOnsen` | 10 |
| `anchorAll` | 11 |

- [ ] **サンプル POI 拡張（≥3 件）:**
  - `junpei` — `district`, `phone`
  - `sabo` — `district`, `website`
  - `ao-no-bi-yuyu` — `phone` または `website`
  - `ski` — `district`（拠点バッジ検証）
- [ ] 既存 POI の `lat`/`lon`/`source` を変更しない

---

### 2.2 `docs/mock-assets/_shared/area-map.js`

#### 削除・廃止

- [ ] `markerManifest` / `ICON_BASE` / `makeIcon`（PNG パス）— divIcon に置換
- [ ] `panToFeature` の `flyTo` / `setView` ズームイン
- [ ] `fitMapToProfile` 内の `centerAnchorId` / `centerMode` / 固定 `setView` 分岐
- [ ] `renderDetail()` と `.area-detail` 更新ロジック
- [ ] `UI.openMaps`, `UI.readGuide`（トップ）, `UI.detailPick`
- [ ] `fetch(marker-icons.json)`（不要なら削除）

#### 追加・変更

- [ ] `UI.popup.*` ネームスペース（`area_map_i18n.md` §6.1 コピペ）
- [ ] `filterHint`, `mapHint` 文言更新
- [ ] `makeDotIcon(feature, active)` — `L.divIcon`（20/24px、ski 常時 24px）
- [ ] `fitMapToProfile()` — **fitBounds のみ**（data contract §5.3）
- [ ] `buildPopupHtml(feature)` — requirements §8 テンプレート
- [ ] `openPopupForFeature(feature)` — リスト・ピン共通。`autoPan: true`, zoom 不変
- [ ] `closePopup()` — `selectedId = null`、マーカー style 同期
- [ ] `select(id, opts)` — popup open + リスト `aria-current`（ズーム変更なし）
- [ ] 地図 `click` — 空白で `closePopup`
- [ ] `keydown` — `Escape` で `closePopup`
- [ ] `afterLayerChange()` — popup close → `fitBounds`
- [ ] `listDistrict(feature)` — `district` → `region` → category フォールバック
- [ ] `sortForList()` — ski → biei-station → 他（維持）
- [ ] `googleMapsUrl` — `mapsQuery || pick(label)`（contract §6.1）
- [ ] `initEmbedMessaging()` — 維持。focus 受信時 popup open
- [ ] 0 件 fitBounds フォールバック: `[43.5897, 142.4449]`, zoom `12`

#### ポップアップ DOM 要件

- [ ] `role="dialog"` + `aria-labelledby="area-popup-title-{id}"`
- [ ] 閉じる `aria-label` = `t("popup.close")`
- [ ] CTA `aria-label` = `t("popup.viewMapAria", { name })`
- [ ] `phone` / `website` / `district`（または `region`）— 存在時のみ要素出力
- [ ] food / onsen のみ `popup.readGuide` ghost リンク
- [ ] anchor（ski 等）— `popup.hubBadge` をカテゴリ行に併記可（任意）

---

### 2.3 `docs/mock-assets/_shared/area-map.css`

#### レイアウト（70/30）

- [ ] Desktop `≥1024px`: `.area-stage` **flex: 1 1 70%**（または `flex: 7`）、`.area-rail` **flex: 0 0 30%**（max 30%）
- [ ] `.area-stage` `min-height: min(72vh, 720px)`（スタンドアロン）
- [ ] Tablet `768–1023px`: column、地図 **65%** / リスト **35%**
- [ ] Mobile スタンドアロン: 地図 **60dvh**
- [ ] embed: 地図 100% 高、FAB シートはリストのみ（既存パターン維持）

#### 統一ドットピン

- [ ] `.area-dot-pin` — 外円 `#1a1f26`、内ドット `#5a6f85`（CSS または inline SVG）
- [ ] `.area-dot-pin--active` — scale 1.2–1.25
- [ ] `.area-dot-pin--ski` — ベース 24px

#### ポップアップ（BKKDW 型）

- [ ] `.area-map-popup` — bg `#1a1f26`, color `#fafbfc`, width `min(280px, calc(100vw - 48px))`
- [ ] `.area-map-popup__title` — `0.9375rem`–`1rem`, weight 700
- [ ] `.area-map-popup__category`, `__district` — `0.6875rem`–`0.75rem`, `#c5cdd6`
- [ ] `.area-map-popup__cta` — `min-height: 44px`, bg `var(--area-accent)`, 全幅
- [ ] `.area-map-popup__guide` — ghost、border のみ、Primary の下
- [ ] `.area-map-popup__close` — `min-height: 44px`, `:focus-visible` outline
- [ ] Leaflet `.leaflet-popup-content-wrapper` 上書き — 角丸・パディング・シャドウ
- [ ] embed モバイル: popup `offset` で FAB と非重複（`[0, -44]` 等）

#### 地図フレーム

- [ ] `.area-leaflet-wrap` — `border: 2px solid var(--area-accent)`, `border-radius: 0.5rem`（スタンドアロン）
- [ ] embed 時は親 `.map-embed` に委譲（二重枠回避）

#### 廃止

- [ ] `.area-detail` — `display: none` または HTML ごと削除
- [ ] `.area-pin`, `.area-pin--active`, `.area-pin-tooltip` — PNG 時代のスタイル削除可
- [ ] Mapular PNG 参照用スタイル

#### モーション

- [ ] `@media (prefers-reduced-motion: reduce)` — pin transition / fitBounds animate 無効

---

### 2.4 `docs/mock-assets/area-map.html`

- [ ] `<div class="area-detail" id="area-detail">` **削除**
- [ ] Leaflet CSS/JS CDN — 維持（head 内 script 推奨）
- [ ] レール構造: `area-filters` + `area-list` のみ

---

### 2.5 `docs/mock-assets/_shared/map-embed-layers.js`

- [ ] `postMessage` 初回後の layer/focus 同期 — **維持**
- [ ] focus 受信時 iframe 内で popup が開くこと（リロード不要）
- [ ] 親「地図で見る」と popup「地図で開く →」の役割分離を壊さない
- [ ] （任意）レイヤー変更時 `focus: null` 送信

---

### 2.6 `docs/mock-assets/biei-lp/mock.css`

- [ ] `.map-embed` — 地図主役（高さは iframe 100% 前提。過大 50dvh が残っていれば **32dvh 前後** に調整可）
- [ ] `.map-embed iframe { width:100%; height:100%; border:0 }` — 維持

---

### 2.7 触らない（除非バグ修正）

| パス | 理由 |
|------|------|
| `resorts/Sichinohe-CyoueiSki/**` | 七戸マップ艦隊対象外 |
| `src/**` | ルート本番テンプレ対象外 |
| `_shared/icons/marker-*.png` | v2 未使用（削除は任意・Phase 2 後） |

---

## 3. デザイントークン（凍結）

```css
:root {
  --area-bg: #f4f6f8;
  --area-rail-bg: #fff;
  --area-rail-border: #e2e6ec;
  --area-text: #1a1f26;
  --area-muted: #5c6570;
  --area-accent: #5a6f85;
  --area-popup-bg: #1a1f26;
  --area-popup-fg: #fafbfc;
  --area-popup-muted: #c5cdd6;
}
```

| 用途 | 値 |
|------|-----|
| タイル URL | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` |
| LP chip pressed | `#1a2332`（親 `mock.css`） |
| **禁止色** | `#E2FC07`（BKKDW ネオン） |

---

## 4. 状態遷移（実装者用）

| イベント | 処理 |
|----------|------|
| load / layer change | `closePopup()` → `fitMapToProfile(true)` |
| pin click | `select(id, { pan: false })` |
| list click | `select(id, { fromList: true, pan: false })` |
| map blank click | `closePopup()` |
| Esc | `closePopup()` |
| postMessage focus | `select(focus, { pan: false })` |

**禁止:** `select` 内での `flyTo` / zoom 変更。

---

## 5. 禁止事項（L2 厳守）

1. 選択時ズームイン（`flyTo`, `setView` で level 変更）
2. カテゴリ別 PNG / `marker-icons.json` 依存の復活
3. `.area-detail` サイドパネル詳細の復活
4. リスト選択 → 地図を覆う全画面モーダル（FAB リストシート以外）
5. 根拠なき POI 座標の追加・変更
6. 標準カラー OSM タイル
7. 七戸 `/map` SVG・手置き座標の流用
8. `#E2FC07` ネオンイエロー
9. POI `label` を `UI` オブジェクトに重複定義
10. ja UI に `VIEW MAP →` のみ（en 専用文言）

---

## 6. 完了条件（Definition of Done）

### 機能（F1–F23）

| ID | 完了判定 |
|----|----------|
| F1–F5 | 初回・レイヤ切替で fitBounds。選択時 zoom 不変 |
| F6–F8 | divIcon 統一ドットのみ表示 |
| F9–F15 | ポップアップ主詳細。`.area-detail` なし |
| F16–F17 | リスト↔ピン同期、リストでも popup |
| F18–F20 | レイヤー・embed・FAB 回帰 OK |
| F21–F23 | JSON サンプル ≥3、schemaVersion 更新、source 維持 |

### ビジュアル（L3 前の自己確認）

| ID | 自己確認 |
|----|----------|
| V1 | ポップアップ 3 段タイポ |
| V2 | Desktop 地図 ≥70% |
| V3 | 淡色タイル + ドットのみ + ダーク popup |
| V4 | 選択 zoom なし、reduced-motion |
| V5 | トークン一致、ネオンなし |

### a11y（L3 前の自己確認）

| ID | 自己確認 |
|----|----------|
| A1–A3 | dialog / aria-labelledby / CTA aria-label |
| A4–A5 | 44px / focus-visible |
| A6–A7 | Esc 閉じる / reduced-motion |

---

## 7. 検証手順

```bash
npx serve docs/mock-assets -p 3456
```

| # | URL | 確認 |
|---|-----|------|
| 1 | `/area-map.html?resort=biei` | 70/30、全ピン俯瞰、popup、ski 先頭 |
| 2 | `…&layers=food,onsen,anchor` | foodOnsen maxZoom 10、広域俯瞰 |
| 3 | `…&layers=onsen` | 白金クラスターのみ |
| 4 | `…&focus=junpei` | 初期 popup、zoom 不変 |
| 5 | `…&embed=1&layers=food,anchor` | FAB、popup、postMessage |
| 6 | `…&lang=en` | VIEW MAP →、英語 UI |
| 7 | `/biei-lp/nearby-food.html` | 地図で見る → embed focus |
| 8 | 375px 幅 | 地図可視、popup CTA 44px、FAB 44px |

**手動チェック:**

- [ ] ピンタップ → ダーク popup → VIEW MAP / 地図で開く → が Google Maps を開く
- [ ] 空白タップ / Esc で popup 閉じる
- [ ] レイヤー切替で popup 閉じ + 再 fitBounds
- [ ] カテゴリ PNG がネットワークタブに出ない

---

## 8. L3 出荷ゲート

```
implementer 完了
  → @resort-qa-a11y     → docs/mock-assets/area_map_qa_report.md
  → @resort-visual-evaluator → docs/mock-assets/area_map_qa_visual.md
  → 両方 PASS で mock LP マップ v2 出荷可
```

| FAIL 条件 | ブロッカー |
|-----------|------------|
| V1 or V5 | ビジュアル再実装 |
| Q1–Q6 いずれか | a11y 修正 |
| F1–F5 | fitBounds ロジック再確認 |

**七戸 `map-ux-evaluator` は起動しない**（周辺 POI 専用ゲート）。

---

## 9. L3 依頼文（コピペ）

```
@resort-template-implementer
docs/mock-assets/area_map_handoff_checklist.md に従い BKKDW 型周辺マップ v2 を実装。
確認: npx serve docs/mock-assets -p 3456

@resort-qa-a11y
@resort-visual-evaluator
対象: area-map.html（standalone + embed）
基準: area_map_requirements.md
出力: area_map_qa_report.md / area_map_qa_visual.md
```

---

## 10. 参照ドキュメント一覧

| 用途 | パス |
|------|------|
| UX 三案 | `area_map_ux_spec.md` |
| 要件・V1–V5 | `area_map_requirements.md` |
| UI キー・文言 | `area_map_i18n.md` |
| JSON 契約 | `area_map_data_contract.md` |
| 元ブリーフ | `AREA_MAP_BKKDW_AGENT_BRIEF.md` |

---

## 11. 既知のトレードオフ（L3 に伝える）

| 状況 | 期待挙動 | 備考 |
|------|----------|------|
| food + onsen 同時 ON | maxZoom 10 広域。町内ピンは小さくなる | BKKDW 全市俯瞰と同型。WARN 可 |
| 遠方 food（between 等） | bounds から除外済み | skiFood / foodOnsen profile |
| リング色ドット | v2 非採用 | Phase 3 検討 |

---

**Handoff ステータス:** ✅ L1 凍結完了 — L2 実装開始可
