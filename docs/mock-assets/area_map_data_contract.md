# 周辺エリアマップ Data Contract — `resort-map-bridge` (L1)

**Date:** 2026-06-14  
**Input:** `docs/mock-assets/area_map_requirements.md`, `AREA_MAP_BKKDW_AGENT_BRIEF.md` §2  
**Output:** `docs/mock-assets/area_map_data_contract.md`  
**スコープ:** `docs/mock-assets/data/maps/*.json` 周辺 POI のみ  
**対象外:** 七戸 `/map` 座標・`overlay-paths.json`・`trails.geojson`・ルート `src/`

---

## 1. ブリッジ宣言

| 本件 | 七戸 `/map` |
|------|-------------|
| Leaflet + OSM 周辺 POI | リフト・コース SVG / GSI キャリブ |
| `biei-area.json` | `resorts/Sichinohe-CyoueiSki/web/public/maps/` |
| fitBounds 俯瞰 | ピンチズーム・パン境界 R6 |
| 統一ドットピン | コース線オーバーレイ |

**座標追加は既存 `source` 根拠がある場合のみ。** 手置き幾何の新規 POI は禁止。

---

## 2. ファイル配置

| パス | 役割 |
|------|------|
| `data/maps/{resortId}-area.json` | リゾート別 POI + boundsProfiles |
| `data/maps/biei-area.json` | 美瑛モック（参照実装） |
| `_shared/area-map.js` | 読込・fitBounds・popup レンダリング |
| `_shared/map-embed-layers.js` | 親 LP ↔ iframe `postMessage` |

読込 URL: `fetch(\`data/maps/${resortId}-area.json\`)`（`area-map.html` 基準相対）。

---

## 3. トップレベルスキーマ

```jsonc
{
  "schemaVersion": "2026-06-14-bkkdw",  // 必須。L2 で更新
  "id": "biei-area",                     // 必須。ファイル識別子
  "resortId": "biei",                    // 必須。URL ?resort= と一致
  "name": { "ja": "…", "en": "…" },      // 必須
  "disclaimer": { "ja": "…", "en": "…" },// 任意。スタンドアロン footer
  "sources": ["OpenStreetMap", "…"],     // 推奨。データ出典一覧
  "updatedAt": "ISO8601",                // 推奨
  "boundsProfiles": { … },               // 必須（§5）
  "anchors": [ PoiFeature, … ],        // 必須（空配列可）
  "food": [ PoiFeature, … ],             // 必須（空配列可）
  "onsen": [ PoiFeature, … ]             // 必須（空配列可）
}
```

### 3.1 廃止・非推奨（L2 で削除可）

| フィールド | 状態 | 理由 |
|------------|------|------|
| `center`, `zoom`, `hubAnchorId` | **廃止** | v2 は `fitBounds` のみ |
| `viewports.*` | **廃止** | Google embed 時代の遺物 |
| `boundsProfiles.*.centerAnchorId` | **廃止** | requirements §7 |
| `boundsProfiles.*.centerMode` | **廃止** | 同上 |
| `boundsProfiles.*.zoom`, `selectionZoom` | **廃止** | 同上 |
| `boundsProfiles.*.ensureAnchorIds` | **任意** | fitBounds 計算時にアンカー含有を補助する場合のみ |

---

## 4. POI フィールド（`PoiFeature`）

### 4.1 必須

| フィールド | 型 | 説明 |
|------------|-----|------|
| `id` | `string` | 安定 ID。URL `?focus=` / `#spot-` と一致 |
| `group` | `"food"` \| `"onsen"` \| `"anchor"` | レイヤーフィルタ |
| `category` | `string` | `UI.category.*` キー（§4.3） |
| `lat` | `number` | WGS84 |
| `lon` | `number` | WGS84 |
| `label` | `{ ja, en }` | ポップアップタイトル・リスト |
| `source` | `string` | 座標・情報の根拠（監査用） |

### 4.2 任意

| フィールド | 型 | UI 挙動 |
|------------|-----|---------|
| `shortLabel` | `{ ja, en }` | embed リスト短縮名。省略時 `label` |
| `mapsQuery` | `string` | Google Maps 検索クエリ。省略時 `pick(label)` |
| `district` | `{ ja, en }` | ポップアップ地区行 |
| `region` | `{ ja, en }` | 温泉既存。`district` 無し時のフォールバック |
| `phone` | `string` | E.164 不要。`tel:` 用生文字列。無ければ行非表示 |
| `website` | `string` (URL) | 公式サイト。無ければ行非表示 |
| `type` | `string` | レガシー `"anchor"`。新規依存禁止 |

**ルール:** `phone` / `website` は **公開情報のみ**。モックは **≥3 POI** にサンプル付与（§8）。

### 4.3 `category` 許容値（凍結）

```
anchor, dairy, wagyu, bakery, western, burger, cafe, fine-dining, ramen,
onsen-hotel, onsen-day, onsen-ryokan, onsen-public, onsen-mountain,
onsen-sauna, onsen-roten, ski, transit, view
```

未知キー → implementer は `category` 文字列をそのまま表示（フォールバック）。L3 前に i18n 追加。

### 4.4 完全例（拡張後）

```json
{
  "id": "junpei",
  "group": "food",
  "category": "western",
  "lat": 43.5893234,
  "lon": 142.4681529,
  "source": "OpenStreetMap",
  "label": { "ja": "洋食とCafe じゅんぺい", "en": "Yoshoku & Cafe Junpei" },
  "shortLabel": { "ja": "じゅんぺい", "en": "Junpei" },
  "mapsQuery": "洋食とCafe じゅんぺい 美瑛町",
  "district": { "ja": "美瑛町", "en": "Biei" },
  "phone": "0166-92-1234",
  "website": "https://example.com/junpei"
}
```

---

## 5. `boundsProfiles` 契約

レイヤー組合せ → `resolveBoundsProfile()` → `featuresForBounds()` → `fitBounds`.

### 5.1 プロファイル定義

| profile | 発火条件（activeLayers） | includeGroups | excludeFoodIds | excludeAnchorIds | maxZoom |
|---------|-------------------------|---------------|----------------|------------------|---------|
| `skiFood` | food + anchor, onsen off | food, anchor | `between`, `chiyoda`, `gosh` | `blue-pond` | **14** |
| `onsen` | onsen only | onsen | — | — | **13** |
| `onsenAnchor` | onsen + anchor, food off | onsen, anchor | — | `ski`, `blue-pond` | **12** |
| `foodOnsen` | food + onsen | food, onsen, anchor | `between`, `chiyoda`, `gosh` | `blue-pond` | **10** |
| `anchorAll` | anchor only | anchor | — | — | **11** |

**優先順位（`resolveBoundsProfile`）:**

1. `food && onsen` → `foodOnsen`
2. `onsen && !food && !anchor` → `onsen`
3. `onsen && !food && anchor` → `onsenAnchor`
4. `anchor && !food && !onsen` → `anchorAll`
5. 既定 → `skiFood`

### 5.2 プロファイル JSON 形

```jsonc
"skiFood": {
  "includeGroups": ["food", "anchor"],
  "excludeFoodIds": ["between", "chiyoda", "gosh"],
  "excludeAnchorIds": ["blue-pond"],
  "maxZoom": 14
}
```

| キー | 型 | 必須 |
|------|-----|------|
| `includeGroups` | `string[]` | はい |
| `excludeFoodIds` | `string[]` | いいえ |
| `excludeAnchorIds` | `string[]` | いいえ |
| `includeAnchorIds` | `string[]` | いいえ（含める anchor のみに限定するとき） |
| `maxZoom` | `number` | はい |

### 5.3 fitBounds 実装規則

```javascript
const feats = featuresForBounds(profile);
const bounds = L.latLngBounds(feats.map(f => [f.lat, f.lon]));
map.fitBounds(bounds, {
  padding: embed ? [32, 32] : [48, 48],
  maxZoom: profile.maxZoom,
  animate: !prefersReducedMotion(),
});
```

- 表示ピン **0 件** → 美瑛町中心 `[43.5897, 142.4449]` zoom `12`（フォールバック定数を `area-map.js` に保持可）
- 選択時 **zoom 変更禁止**（`autoPan` のみ）

---

## 6. Google Maps URL 規則

### 6.1 VIEW MAP CTA（Primary）

**方式 A（推奨）— Search API:**

```
https://www.google.com/maps/search/?api=1&query={encodeURIComponent(mapsQuery)}
```

- `mapsQuery` = `feature.mapsQuery || pick(feature.label)`
- `target="_blank"`, `rel="noopener noreferrer"`

**方式 B — 座標（mapsQuery 無し・将来）:**

```
https://www.google.com/maps/search/?api=1&query={lat},{lon}
```

v2 は **方式 A を既定**。方式 B は handoff で明示されない限り使わない。

### 6.2 電話

```
href="tel:{phone}"
```

表示テキスト = `phone` 生文字列。スペース・ハイフンはデータ側のまま。

### 6.3 公式サイト

```
href="{website}" target="_blank" rel="noopener noreferrer"
```

表示 = `UI.popup.website` + ` ↗`

---

## 7. ランタイム統合

### 7.1 URL パラメータ

|  param | 既定 | 説明 |
|--------|------|------|
| `resort` | `biei` | `{resortId}-area.json` を選択 |
| `layers` | `food,anchor` | カンマ区切り `food`, `onsen`, `anchor` |
| `embed` | — | `1` で iframe モード |
| `lang` | `localStorage` | `ja` \| `en` |
| `focus` | — | 初期選択 POI `id`（レイヤーに含まれる場合 popup open） |

### 7.2 親 LP postMessage

```javascript
// 親 → iframe
{ source: "map-embed-layers", layers: ["food","anchor"], focus: "junpei" | null }

// iframe → 親
{ source: "area-map", type: "ready" }
```

データ契約上、親は `focus` に **有効な `id`** のみ送る。存在しない id は無視。

### 7.3 リストソート（表示順）

1. `id: ski`
2. `id: biei-station`
3. その他（データ配列順または lat 近接 — implementer は現行 `sortForList` 維持可）

---

## 8. モック移行 — サンプル POI（L2 必須）

以下 **3 件以上** に `phone` または `website` を追加すること。

| id | group | 追加フィールド（提案） |
|----|-------|------------------------|
| `junpei` | food | `district`, `phone`（公開番号はプレースホルダ可） |
| `sabo` | food | `district`, `website` |
| `ao-no-bi-yuyu` | onsen | `region` 既存 + `phone` または `website` |
| `ski` | anchor | `district: { ja: "美瑛町", en: "Biei" }`（拠点バッジ検証用） |

プレースホルダ電話は `0166-XX-XXXX` 形式で可。本番前に公式情報へ差し替え。

### schemaVersion 更新

```
"schemaVersion": "2026-06-14-bkkdw"
```

後方互換: `phone` / `website` / `district` 省略の POI は有効。読込側はフィールド存在チェックのみ。

---

## 9. バリデーション（implementer / L3）

| チェック | 合格 |
|----------|------|
| 全 POI に `id`, `lat`, `lon`, `label.ja`, `group`, `category`, `source` | 必須 |
| 重複 `id` なし | 必須 |
| `lat` ∈ [41, 46], `lon` ∈ [139, 146]（北海道周辺 sanity） | 推奨 |
| `boundsProfiles` 5 件揃い | 必須 |
| `phone` / `website` サンプル ≥3 POI | 必須（F21） |
| 廃止フィールド削除後も JSON parse 成功 | 必須 |

---

## 10. 禁止

1. 根拠なき `lat`/`lon` 追加・変更  
2. 七戸リフトマップ資産の混在  
3. `overlay-paths` 形式のピクセル座標  
4. カテゴリ別 PNG ピンを data contract で要求  
5. `mapsQuery` に個人情報・非公開住所  

---

## 11. 次エージェント

```
@resort-spec-handoff
入力: area_map_requirements.md + area_map_i18n.md + 本 data_contract.md
→ area_map_handoff_checklist.md
```
