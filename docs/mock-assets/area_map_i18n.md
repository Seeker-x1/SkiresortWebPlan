# 周辺エリアマップ i18n Spec — `resort-i18n-spec` (L1)

**Date:** 2026-06-14  
**Input:** `docs/mock-assets/area_map_requirements.md`  
**Output:** `docs/mock-assets/area_map_i18n.md`  
**対象:** `docs/mock-assets/_shared/area-map.js`, `area-map.html`, LP embed（`biei-lp/nearby-*.html` + `mock-i18n.js`）  
**対象外:** 七戸 `/map`, ルート `src/messages/`

---

## 1. ロケール方針

| 項目 | 規則 |
|------|------|
| **対応言語** | `ja`（既定）, `en` |
| **切替 UI** | `area-map.html` の `[data-lang-switch]` + LP の `.lang-switch`（既存） |
| **永続化** | `localStorage.mock-lp-locale`（既存キー維持） |
| **URL** | `?lang=en` — iframe `src` / スタンドアロン直リンクに付与。親 LP が EN のとき embed に伝播 |
| **html lang** | `document.documentElement.lang` = `ja` \| `en`（`syncDocumentLang()` 維持） |
| **POI 本文** | `biei-area.json` 内 `{ ja, en }` オブジェクト（`label`, `shortLabel`, `district`, `region`） |
| **UI クローム** | `area-map.js` の `UI.ja` / `UI.en` のみ。POI 名を UI に重複定義しない |

### 翻訳境界

```
biei-area.json     → POI 固有名・地区・検索クエリ（mapsQuery は単一言語文字列可）
area-map.js UI     → ボタン・ポップアップ・フィルタ・エラー・aria-label
biei-lp messages   → LP セクション見出し・レイヤーチップ・「地図で見る」リンク（親ページのみ）
```

LP の `.food-spot__map-link` 文言（「地図で見る」）は **親ページ** の `mock-i18n` が担当。iframe 内ポップアップ CTA とは別キー。

---

## 2. `area-map.js` — `UI` オブジェクトキー（凍結案）

### 2.1 トップレベル

| キー | 用途 | 変更 |
|------|------|------|
| `backHub` | 索引リンク | 維持 |
| `backLp` | LP 戻る | 維持 |
| `title` | レール見出し | 維持 |
| `lead` | レールリード | 維持 |
| `filterAll` | 全表示 | 維持 |
| `filterFood` | 飲食レイヤー | 維持 |
| `filterOnsen` | 温泉レイヤー | 維持 |
| `filterAnchor` | 拠点レイヤー | 維持 |
| `filterHint` | フィルタ下ヒント | **更新**（fitBounds 俯瞰） |
| `mapHint` | 地図下ヒント | **更新**（ポップアップ主） |
| `spotCount` | `{n}件` / `{n} spots` | 維持 |
| `embedListFab` | FAB 開く | 維持 |
| `embedListFabClose` | FAB 閉じる | 維持 |
| `railLabel` | リスト `aria-label` | 維持 |
| `loadError` | データ読込失敗 | 維持 |
| `needHttp` | file:// 警告 | 維持 |
| `leafletError` | Leaflet 失敗 | 維持 |
| `openMaps` | — | **廃止** → `popup.viewMap` / `popup.viewMapAria` |
| `readGuide` | — | **移動** → `popup.readGuide` |
| `detailPick` | — | **廃止**（`.area-detail` 廃止） |

### 2.2 新規 `popup` ネームスペース

| キー | DOM / 用途 |
|------|------------|
| `popup.close` | 閉じるボタン `aria-label` |
| `popup.closeVisible` | 閉じるボタン表示文字（`×` のみなら省略可） |
| `popup.viewMap` | Primary CTA **表示テキスト** |
| `popup.viewMapAria` | Primary CTA `aria-label`（名前含む） |
| `popup.readGuide` | Secondary ghost CTA（food / onsen） |
| `popup.readGuideAria` | Secondary `aria-label` |
| `popup.website` | 公式リンク前置ラベル（`公式サイト ↗` の「公式サイト」部） |
| `popup.phoneAria` | `tel:` リンク `aria-label` テンプレ `{phone}` |
| `popup.hubBadge` | 拠点ポップアップ用バッジ（`id: ski` 等） |

`t()` 呼び出し例: `t("popup.viewMap")`, `t("popup.viewMapAria", { name: pick(feature.label) })`

### 2.3 `category`（既存キー維持）

`UI.{locale}.category.{categoryKey}` — POI の `category` フィールドと 1:1。新規カテゴリ追加時は **ja/en 両方** 必須。

| categoryKey | ja | en |
|-------------|----|----|
| `anchor` | 拠点 | Hub |
| `dairy` | 乳製品 | Dairy |
| `wagyu` | 和牛 | Wagyu |
| `bakery` | パン・菓子 | Bakery |
| `western` | 洋食 | Western |
| `burger` | バーガー | Burger |
| `cafe` | カフェ | Café |
| `fine-dining` | フレンチ | French |
| `ramen` | ラーメン | Ramen |
| `onsen-hotel` | 温泉ホテル | Onsen hotel |
| `onsen-day` | 日帰り温泉 | Day bath |
| `onsen-ryokan` | 高級旅館 | Ryokan |
| `onsen-public` | 公衆浴場 | Public bath |
| `onsen-mountain` | 山の温泉 | Mountain onsen |
| `onsen-sauna` | サウナ | Sauna |
| `onsen-roten` | 野湯・露天 | Wild roten |
| `ski` | スキー場 | Ski area |
| `transit` | 駅 | Station |
| `view` | 絶景 | View |

### 2.4 リスト eyebrow

| ソース | 優先順位 |
|--------|----------|
| `feature.district` | 1 — `pick(district)` |
| `feature.region` | 2 — 温泉既存フィールド（`pick(region)`） |
| `UI.category.*` | 3 — フォールバック |

---

## 3. 文言表（ja / en）

### 3.1 ポップアップ（必須）

| UI キー | ja | en | 備考 |
|---------|----|----|------|
| `popup.close` | ポップアップを閉じる | Close popup | `aria-label` |
| `popup.viewMap` | 地図で開く → | VIEW MAP → | Primary CTA 表示。BKKDW 型 EN は大文字 |
| `popup.viewMapAria` | {name}を Google マップで開く | Open {name} in Google Maps | `{name}` = `pick(label)` |
| `popup.readGuide` | 特集を読む | Read guide | Secondary ghost |
| `popup.readGuideAria` | {name}の特集記事を読む | Read the guide for {name} | food / onsen のみ |
| `popup.website` | 公式サイト | Official site | 後ろに ` ↗` を typographic で付与 |
| `popup.phoneAria` | 電話 {phone} に発信 | Call {phone} | 表示は生の `phone` 文字列 |
| `popup.hubBadge` | 拠点 | Hub | ski / 駅 / 青い池 |

### 3.2 クローム・フィルタ（更新分）

| UI キー | ja | en |
|---------|----|----|
| `filterHint` | 表示中のスポットがすべて地図に収まります。温泉のみのときは白金方面に切り替わります | All visible spots fit on the map. Onsen-only snaps to Shirogane area |
| `mapHint` | ピンをタップすると地図上に詳細が表示されます | Tap a pin to see details on the map |

### 3.3 既存維持（参照）

| UI キー | ja | en |
|---------|----|----|
| `title` | 周辺マップ | Area map |
| `lead` | 町民スキー場を起点に、周辺の飲食・温泉・拠点を重ねて回遊を設計 | Layer food, onsen, and hubs around Biei Town Ski Area |
| `filterFood` | 飲食 | Food |
| `filterOnsen` | 温泉 | Onsen |
| `filterAnchor` | 拠点 | Hubs |
| `embedListFab` | スポット一覧 | Spot list |
| `embedListFabClose` | 一覧を閉じる | Close list |

---

## 4. LP 親ページ（`mock-i18n`）— 境界のみ

area-map iframe **外** の文言。`area-map.js` では触らない。

| キー（既存想定） | ja | en | 備考 |
|------------------|----|----|------|
| `nearbyFood.spotMapLink` | 地図で見る | View on map | リスト内リンク。popup CTA とは別 |
| `nearbyFood.mapLayers.food` | 飲食 | Food | `.map-layer-btn` |
| `nearbyFood.mapLayers.onsen` | 温泉 | Onsen |
| `nearbyFood.mapLayers.anchor` | 拠点 | Hubs |
| `nearbyOnsen.*` | （food と同構造） | | |

**整合ルール:** 親「地図で見る」= リストから embed へフォーカス。popup「地図で開く →」= Google Maps 外部。混同しない。

---

## 5. a11y ラベル（i18n 必須）

| 要素 | キー | ja 例 |
|------|------|-------|
| ポップアップ | `role="dialog"` + `aria-labelledby="area-popup-title-{id}"` | タイトル = `pick(label)` |
| 閉じる | `popup.close` | ポップアップを閉じる |
| VIEW MAP CTA | `popup.viewMapAria` | じゅんぺいを Google マップで開く |
| 公式サイト | `aria-label="{popup.website}: {hostname}"` | 実装で host 抽出可 |
| 電話 | `popup.phoneAria` | 電話 0166-… に発信 |
| リスト FAB | 表示テキストそのもの | `embedListFab` / `embedListFabClose` |
| フィルタボタン | `aria-pressed` | 表示テキスト = `filterFood` 等 |

**Esc 閉じる:** 文言不要。`popup.close` と同義の操作。

---

## 6. 実装メモ（L2）

### 6.1 `UI` オブジェクト差分（コピペ用）

```javascript
// 追加・変更（ja 側。en は上表どおり）
popup: {
  close: "ポップアップを閉じる",
  viewMap: "地図で開く →",
  viewMapAria: "{name}を Google マップで開く",
  readGuide: "特集を読む",
  readGuideAria: "{name}の特集記事を読む",
  website: "公式サイト",
  phoneAria: "電話 {phone} に発信",
  hubBadge: "拠点",
},
filterHint: "表示中のスポットがすべて地図に収まります。温泉のみのときは白金方面に切り替わります",
mapHint: "ピンをタップすると地図上に詳細が表示されます",
```

```javascript
// en
popup: {
  close: "Close popup",
  viewMap: "VIEW MAP →",
  viewMapAria: "Open {name} in Google Maps",
  readGuide: "Read guide",
  readGuideAria: "Read the guide for {name}",
  website: "Official site",
  phoneAria: "Call {phone}",
  hubBadge: "Hub",
},
filterHint: "All visible spots fit on the map. Onsen-only snaps to Shirogane area",
mapHint: "Tap a pin to see details on the map",
```

### 6.2 ポップアップ内カテゴリ行

表示: `t("category." + feature.category)` のみ。複数カテゴリ結合（`洋食 · カフェ`）は **v2 では行わない**（1 POI = 1 category キー）。

### 6.3 地区行

1. `pick(feature.district)` が非空 → `.area-map-popup__district`
2. 否则 `pick(feature.region)`（温泉）
3. 両方空 → 要素非出力

### 6.4 将来 `src/` 移植時

- ルート `messages/ja.json` に `areaMap.*` ネームスペースを追加
- モックの `UI` オブジェクトは implementer が JSON から生成するか、初版はインライン維持可

---

## 7. 禁止

1. POI `label` を `UI` に重複定義  
2. 絵文字を UI ラベルに使用（`→` `↗` は可）  
3. ja 画面に未翻訳の英語 CTA のみ出す（`VIEW MAP →` は **en 専用**）  
4. `messages` と `UI` で同一文言を二重管理（LP 固有は mock-i18n、マップ内は UI）

---

## 8. 次エージェント

```
@resort-spec-handoff
入力: area_map_requirements.md + 本 i18n.md + area_map_data_contract.md
```
