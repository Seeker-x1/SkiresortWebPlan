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

3. 新規ガイド追加時は `data/resort-guides.json` と `docs/mock-assets/registry.json` を **同じ id** で更新し:

   ```bash
   node scripts/validate-resort-guides-ids.mjs
   ```

**推測で id を書かない。** CI（`.github/workflows/guides-validate.yml`）が失敗する。

## ぴっぷの例

| JAPOW id | 施設名（TSV） |
|----------|----------------|
| 48 | 中富良野北星スキー場 ← ぴっぷではない |
| **51** | **ぴっぷスキー場** |
