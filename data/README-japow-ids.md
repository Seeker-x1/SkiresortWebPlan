# JAPOW resort ID index

正本: `JAPOWSERCH/RESORTS一覧.txt`（JAPOW マップの `resort.id`）

## 更新手順

1. JAPOW 側で `RESORTS一覧.txt` を更新したら、ここにコピー:

   ```bash
   cp ../JAPOWSERCH/RESORTS一覧.txt data/japow-resort-index.tsv
   ```

2. JSON を再生成:

   ```bash
   node scripts/sync-japow-resort-index.mjs
   ```

3. 新規ガイド追加時は **3 ファイル**を同じ `registryId` / `japowId` で更新する:

   | ファイル | 内容 |
   |----------|------|
   | `data/resort-guides.json` | `"<japowId>": { "registryId": "{id}", "tier": "mock" }` |
   | `docs/mock-assets/registry.json` | resort オブジェクト（`japowResortId` 含む） |
   | `scripts/validate-resort-guides-ids.mjs` | `NAME_SUBSTRINGS` に `{id}` の名称サブストリング（JAPOW `nameJa` に含まれる文字列） |

   検証:

   ```bash
   node scripts/validate-resort-guides-ids.mjs
   ```

   `missing NAME_SUBSTRINGS` が出たら、スクリプト末尾の **コピペ用行** を `NAME_SUBSTRINGS` に追加。曖昧な名称（例: 中山）は手動で別名を足す（`kamikawa-nakayama` 参照）。

**推測で id を書かない。** CI（`.github/workflows/guides-validate.yml`）が失敗する。

## ぴっぷの例

| JAPOW id | 施設名（TSV） |
|----------|----------------|
| 48 | 中富良野北星スキー場 ← ぴっぷではない |
| **51** | **ぴっぷスキー場** |
