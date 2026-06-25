# guides.japowserch.com — JAPOWSERCH 連携 handoff

## 実行順

| 順 | リポジトリ | 内容 | 本番確認のタイミング |
|----|-----------|------|---------------------|
| **①** | **SkiresortWebPlan** | Vercel デプロイ + DNS + 16 LP 配信 | ① が完了してから |
| **②** | **JAPOWSERCH** | 「詳細確認」→ `guides.japowserch.com` 連携 | ① の URL が生きてから |

- ① が DNS 伝播待ちでも、**② のコード実装は並行可能**（`data/resort-guides.json` 同梱・`getResortGuideUrl` 配線）。
- **本番 E2E 確認**（ボタン → LP が開く）は ① の `https://guides.japowserch.com/{id}/` が 200 になってからで十分。

### ① SkiresortWebPlan チェックリスト

- [ ] `cd guides && node scripts/sync.mjs`（16 施設生成）
- [ ] Vercel プロジェクト（Root Directory = `guides`）
- [ ] カスタムドメイン `guides.japowserch.com` + DNS
- [ ] `https://guides.japowserch.com/biei/` が 200（他 10 施設も同様）
- [ ] `https://guides.japowserch.com/registry.json` · `/resort-guides.json` が 200

### ② JAPOWSERCH チェックリスト

- [ ] `data/resort-guides.json` + `getResortGuideUrl` をマップ UI に組み込み（DNS 待ち中でも可）
- [ ] mock 16 件: 詳細確認 → 新規タブで LP
- [ ] 未掲載施設: 従来どおり `scrollToCard`
- [ ] EN: `?lang=en` 付き URL
- [ ] ① 稼働後: 美瑛（50）等で E2E クリック確認

---

## 目的

JAPOWSERCH（別リポジトリ）のマップ UI から、各スキー場のガイド LP へ遷移する。LP HTML は JAPOWSERCH リポジトリに置かず、**SkiresortWebPlan** の `guides/` を Vercel でホストする。

## JAPOWSERCH 側の実装

### 「詳細確認」ボタン URL

```
https://guides.japowserch.com/{registry-id}/
```

英語 UI の場合:

```
https://guides.japowserch.com/{registry-id}/?lang=en
```

`registry-id` 一覧は下記 `registry.json` を参照。**`slug`（`biei-lp` 等）は使わない。**

### `data/resort-guides.json`（JAPOW マップ ID → registry-id）

SkiresortWebPlan ルートの `data/resort-guides.json` を **JAPOWSERCH リポジトリにコピー**する（または配信 URL から fetch）。

```
GET https://guides.japowserch.com/resort-guides.json
```

| japowResortId | registryId |
|---------------|------------|
| 8 | asahigaoka |
| 35 | otoifuji |
| 39 | shimukappu |
| 40 | minami-furano |
| 50 | biei |
| 58 | abashiri-lv |
| 60 | unabetsu |
| 65 | kiyosato |
| 66 | gokazan（※72 ではない） |
| 98 | sichinohe |
| 326 | tsunan |
| 284 | kirigamine |
| 36 | kamikawa-nakayama |
| 51 | pippu |

### 「詳細確認」ボタン分岐（JAPOWSERCH リポジトリ）

`data/resort-guides.json` を同梱（または fetch）し、次の形で URL を組み立てる。

```js
const RESORT_GUIDES = { /* resort-guides.json の内容 */ };

function getResortGuideUrl(resortId) {
  const g = RESORT_GUIDES.guides && RESORT_GUIDES.guides[String(resortId)];
  if (!g || !g.registryId) return null;
  const base = (RESORT_GUIDES.baseUrl || "").replace(/\/$/, "");
  const isEn = document.documentElement.lang === "en"
    || /-en\.html$/i.test(location.pathname);
  const q = isEn ? "?lang=en" : "";
  return base + "/" + g.registryId + "/" + q;
}

// 詳細確認クリック時
function onDetailClick(resortId) {
  const url = getResortGuideUrl(resortId);
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  scrollToCard(resortId);
}
```

参照実装（UMD）: SkiresortWebPlan `data/resort-guides.js` — `ResortGuides.getResortGuideUrl(id, RESORT_GUIDES)` / `openGuideOrFallback`

ロケール判定: `lang="en"` · `*-en.html` · `?lang=en` → `?lang=en` 付き URL。

**`baseUrl` は常に `https://guides.japowserch.com`（相対パスフォールバックなし）。**

### レジストリ取得（代替）

```
GET https://guides.japowserch.com/registry.json
```

CORS: `Access-Control-Allow-Origin: *`（静的 JSON 参照用）

レスポンス例（抜粋）:

```json
{
  "host": "https://guides.japowserch.com",
  "indexByJapowResortId": {
    "50": "biei"
  },
  "resorts": [
    {
      "id": "biei",
      "slug": "biei-lp",
      "japowResortId": 50,
      "guideUrl": "https://guides.japowserch.com/biei/",
      "guideUrlEn": "https://guides.japowserch.com/biei/?lang=en",
      "name": { "ja": "美瑛町民スキー場", "en": "Biei Town Ski Area" },
      "urls": {
        "map": "https://guides.japowserch.com/map.html?resort=biei"
      },
      "japowserch": {
        "detailButtonTarget": "guideUrl",
        "registryId": "biei"
      }
    }
  ]
}
```

### JAPOWSERCH マップピン → ガイド LP

マップ上の施設 ID（`japowResortId`）で引く:

```ts
const reg = await fetch(REGISTRY_URL).then((r) => r.json());
const registryId = reg.indexByJapowResortId[String(japowResortId)];
const resort = reg.resorts.find((r) => r.id === registryId);
const url = resort?.guideUrl; // 詳細確認ボタン
```

### 推奨コード（registry-id 指定）

```ts
const REGISTRY_URL = "https://guides.japowserch.com/registry.json";

async function getGuideUrl(resortId: string, locale: "ja" | "en") {
  const reg = await fetch(REGISTRY_URL).then((r) => r.json());
  const resort = reg.resorts.find((r) => r.id === resortId);
  if (!resort) return null;
  return locale === "en" ? resort.guideUrlEn : resort.guideUrl;
}

async function getGuideUrlByJapowId(japowResortId: number, locale: "ja" | "en") {
  const reg = await fetch(REGISTRY_URL).then((r) => r.json());
  const id = reg.indexByJapowResortId?.[String(japowResortId)];
  return id ? getGuideUrl(id, locale) : null;
}
```

キャッシュ: `registry.json` は `Cache-Control: max-age=300`。クライアント側でも 5 分程度キャッシュ可。

## 施設 ID 一覧（11）

| id | 施設名（JA） |
|----|-------------|
| `sichinohe` | 七戸町営スキー場 |
| `biei` | 美瑛町民スキー場 |
| `unabetsu` | ウナベツスキー場 |
| `kiyosato` | 清里町営緑スキー場 |
| `gokazan` | 五鹿山スキー場 |
| `tsunan` | マウンテンパーク津南 |
| `minami-furano` | 国設南ふらのスキー場 |
| `asahigaoka` | 倶知安町旭ヶ丘スキー場 |
| `otoifuji` | 音威富士スキー場 |
| `shimukappu` | 国設占冠中央スキー場 |
| `abashiri-lv` | 網走レークビュースキー場 |

JAPOWSERCH の内部 ID が上記と一致していることを確認すること。

`japowResortId` の正は **`data/resort-guides.json`**。sync 時に `docs/mock-assets/registry.json` へ反映される。

## デプロイ手順（SkiresortWebPlan）

**新規 `{id}-lp` 追加時:** [LP_FACTORY_PROCEDURE.md](../docs/mock-assets/LP_FACTORY_PROCEDURE.md) と [lp-factory-no-shortcuts.mdc](../.cursor/rules/lp-factory-no-shortcuts.mdc) を通す。検証未 PASS・他施設流用・アフィリエイト省略で push しない。

1. `docs/mock-assets/` で LP・マップを更新
2. `data/resort-guides.json` で JAPOW ID を管理
3. `cd guides && node scripts/sync.mjs`
4. `guides/` を Root Directory にした Vercel プロジェクトへ push / deploy
5. `guides.japowserch.com` で `/{id}/`・`/registry.json`・`/resort-guides.json` を確認

## フェーズ移行

| フェーズ | 内容 | URL |
|----------|------|-----|
| **現在** | 静的モック（日英） | 変更なし |
| **将来** | Next.js 本番（例: `resorts/Sichinohe-CyoueiSki/web/`） | **同じ** `/{id}/` を rewrite で差し替え |

JAPOWSERCH は URL 形をハードコードせず、`registry.json` の `urls.detail` を参照すること。

## 問い合わせ

- LP コンテンツ・マップ: SkiresortWebPlan `docs/mock-assets/`
- ホスト・ドメイン: `guides/` + Vercel
- 連携仕様: 本書 + `/registry.json`
