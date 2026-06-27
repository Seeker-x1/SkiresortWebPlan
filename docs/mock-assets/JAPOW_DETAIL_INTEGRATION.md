# JAPOW「詳細確認」ボタン — LP テンプレート連携仕様

> **境界:** 本ドキュメントは **SkiresortWebPlan 側（guides 配信まで）** のテンプレート契約。JAPOWSERCH リポジトリのマップ UI 実装は [guides/HANDOFF.md](../../guides/HANDOFF.md) §② を参照。  
> **関連:** [LP_FACTORY_PROCEDURE.md](./LP_FACTORY_PROCEDURE.md) Phase 7 · [lp_mock_requirements.md](./lp_mock_requirements.md) LP-Q9 · [data/resort-guides.js](../../data/resort-guides.js)

---

## 1. 目的

JAPOW マップの施設カード「**詳細確認**」クリック時:

1. `resort-guides.json` に載っている `japowResortId` → **新規タブ**で `https://guides.japowserch.com/{registry-id}/` を開く
2. 英語 UI → `?lang=en` 付き URL
3. 未掲載施設 → `null` → JAPOW 側は従来どおり `scrollToCard`

LP Factory の **出荷ゲート**は、上記 1・2 が成立するデータと静的配信までを含む。

---

## 2. 三ファイル契約（正本）

| ファイル | 役割 | 編集タイミング |
|----------|------|----------------|
| `docs/mock-assets/registry.json` | `id`（registry-id）・`slug`・施設メタ・`japowResortId`（sync 後） | Phase 7 |
| `data/resort-guides.json` | JAPOW マップ ID → `registryId` の **正本** | Phase 7（`japowResortId` は推測禁止） |
| `data/japow-resort-index.json` | JAPOW 公式 ID 一覧（`sync-japow-resort-index.mjs` 生成） | ID 照合のみ |

**`slug`（`biei-lp`）は URL に使わない。** 詳細ボタンは常に **`registry.id`**（`biei`）。

---

## 3. URL 契約（固定）

| 種別 | パターン | 例（美瑛 id=50） |
|------|----------|------------------|
| 日本語 LP | `{baseUrl}/{registryId}/` | `https://guides.japowserch.com/biei/` |
| 英語 LP | `{baseUrl}/{registryId}/?lang=en` | `https://guides.japowserch.com/biei/?lang=en` |
| ゲレンデマップ | `{baseUrl}/map.html?resort={registryId}` | `/map.html?resort=biei` |
| 連携 JSON | `{baseUrl}/resort-guides.json` | CORS `*` · cache 300s |
| レジストリ | `{baseUrl}/registry.json` | `indexByJapowResortId` 含む |
| UMD ヘルパ | `{baseUrl}/resort-guides.js` | `ResortGuides.getResortGuideUrl` |

`baseUrl` は **常に** `https://guides.japowserch.com`（相対パスフォールバック禁止）。

### 3.1 URL 組み立て（JAPOWSERCH 側）

```js
// 推奨: UMD を guides から fetch
// <script src="https://guides.japowserch.com/resort-guides.js"></script>

function onDetailClick(japowResortId) {
  const opened = ResortGuides.openGuideOrFallback(
    japowResortId,
    RESORT_GUIDES,      // fetch("/resort-guides.json") の結果
    scrollToCard,
    { target: "_blank" },
  );
}
```

参照: [`data/resort-guides.js`](../../data/resort-guides.js)

---

## 4. sync 後の配信物（`guides/public/`）

`node guides/scripts/sync.mjs` が生成:

| パス | 内容 |
|------|------|
| `/{id}/index.html` | LP（`{slug}/` からコピー、パス書換済み） |
| `/registry.json` | `guideUrl` / `guideUrlEn` / `indexByJapowResortId` / `japowserch.detailButtonTarget` |
| `/resort-guides.json` | JAPOW 向け handoff（`guides[japowId].registryId` + 拡張メタ） |
| `/resort-guides.js` | `data/resort-guides.js` のコピー |

`registry.json` 各 resort の必須フィールド（sync 生成）:

```json
{
  "id": "biei",
  "japowResortId": 50,
  "guideUrl": "https://guides.japowserch.com/biei/",
  "guideUrlEn": "https://guides.japowserch.com/biei/?lang=en",
  "japowserch": {
    "detailButtonTarget": "guideUrl",
    "registryId": "biei",
    "mapByJapowResortId": true
  }
}
```

---

## 5. 新規施設チェックリスト（LP Factory Phase 7–9）

1. JAPOW 公式 ID を `JAPOWSERCH/RESORTS一覧.txt` で確認（推測禁止）
2. `data/resort-guides.json` に `"<japowId>": { "registryId": "{id}", "tier": "mock" }` を追加
3. `docs/mock-assets/registry.json` に resort オブジェクトを追加（`id` / `slug` / `japowResortId` / `affiliates`）
4. `scripts/validate-resort-guides-ids.mjs` の **`NAME_SUBSTRINGS`** に `{id}` を追加 → `node scripts/validate-resort-guides-ids.mjs` exit 0
5. `{id}-lp/index.html` が存在（sync が `public/{id}/` にコピー）
6. 機械検証（8 本）— [lp_mock_handoff_checklist.md](./lp_mock_handoff_checklist.md) §4
7. **`JAPOWSERCH/data/resort-guides.json` を SkiresortWebPlan と同一に同期**（詳細ボタン本番成立）
8. JAPOW マップで「詳細確認」→ `https://guides.japowserch.com/{id}/` を確認

```bash
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs
node guides/scripts/sync.mjs
node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public
```

ローカル E2E（sync 後）:

```bash
cd guides && npm run dev
# http://localhost:3456/{id}/
# http://localhost:3456/{id}/?lang=en
# http://localhost:3456/resort-guides.json
```

---

## 6. L3 評価 — LP-Q9

| ID | 合格条件 |
|----|----------|
| LP-Q9a | `validate-mock-japow-detail.mjs` exit 0（ソース契約） |
| LP-Q9b | `sync.mjs` 後 `validate-mock-japow-detail.mjs --public` exit 0 |
| LP-Q9c | `JAPOWSERCH/data/resort-guides.json` が SkiresortWebPlan と一致 |
| LP-Q9d | 375px で LP 表示 · `?lang=en` で `html[lang=en]` · 詳細ボタン URL 一致 |

**FAIL → guides 配信・JAPOW 詳細ボタン連携不可。**

---

## 7. よくあるミス

| ミス | 結果 |
|------|------|
| `slug` を URL に使う（`/biei-lp/`） | 404 |
| `japowResortId` を推測で記入 | 別施設の LP に飛ぶ |
| `resort-guides.json` のみ更新し `registry.json` 未追加 | sync 失敗 or 未配信 |
| guides 未 sync のまま JAPOW 本番確認 | 404（DNS 以前でもデータ不整合は先に潰す） |
| `baseUrl` を相対パスにする | JAPOW ドメインから guides に届かない |

---

## 8. 掲載施設一覧（2026-06）

`data/resort-guides.json` と `registry.json` が一致していること。件数変更時は本表と hub メッセージを同期。**18 施設。**

| japowResortId | registryId |
|---------------|------------|
| 8 | asahigaoka |
| 35 | otoifuji |
| 36 | kamikawa-nakayama |
| 39 | shimukappu |
| 40 | minami-furano |
| 50 | biei |
| 51 | pippu |
| 52 | hinode |
| 58 | abashiri-lv |
| 60 | unabetsu |
| 65 | kiyosato |
| 66 | gokazan |
| 98 | sichinohe |
| 163 | shinjo |
| 284 | kirigamine |
| 326 | tsunan |
| 453 | sapporo-kokusai |
| 454 | sapporo-teine |

---

**ステータス:** L1 凍結 — 新規 LP は LP-Q9 + 本チェックリスト必須
