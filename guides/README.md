# guides/ — guides.japowserch.com 静的ホスト

JAPOWSERCH マップの「詳細確認」先。LP モックは `docs/mock-assets/` で制作し、本ディレクトリへ **ビルド同期** して Vercel 配信する。

## 実行順（運用）

1. **① 本リポジトリ（SkiresortWebPlan）** — Vercel + DNS + 16 LP を先に稼働させる
2. **② JAPOWSERCH** — マップ「詳細確認」ボタン連携（① の DNS 待ち中でもコード実装は並行可。本番確認は ① の URL が生きてから）

詳細: [HANDOFF.md](./HANDOFF.md#実行順)

## URL（固定）

| 種別 | URL |
|------|-----|
| ホスト | `https://guides.japowserch.com` |
| 施設 LP | `https://guides.japowserch.com/{registry-id}/` |
| 英語 | `?lang=en`（例: `/biei/?lang=en`） |
| ゲレンデマップ | `/map.html?resort={registry-id}` |
| 連携レジストリ | `/registry.json` |
| JAPOW 詳細マップ | `/resort-guides.json` · `/resort-guides.js` |

`registry-id` は `docs/mock-assets/registry.json` の `id`（`biei-lp` ではない）。

## Vercel 設定

1. 新規プロジェクト（または既存）を本リポジトリに接続
2. **Root Directory**: `guides`
3. **Framework Preset**: Other
4. Build: `node scripts/sync.mjs`（`vercel.json` に記載済み）
5. Output: `public`
6. ドメイン: `guides.japowserch.com` を割り当て

## ローカルプレビュー

```bash
cd guides
node scripts/sync.mjs   # public 生成（初回・更新時）
npm run dev             # http://localhost:3456
npm run validate        # mock-assets i18n + JAPOW 詳細契約
```

## ビルドのみ

```bash
cd guides
node scripts/sync.mjs
```

`docs/mock-assets/` → `guides/public/` にコピーし、パスを本番用に書き換える。

## ソースとの関係

| 開発 | 配信 |
|------|------|
| `guides/hub/` | `guides/public/index.html`（**索引のみ**） |
| `docs/mock-assets/{slug}-lp/` | `guides/public/{id}/` |
| `docs/mock-assets/_shared/` | `guides/public/_shared/` |
| 相対パス `../_shared/` | 絶対パス `/_shared/` |
| マップリンク | `/map.html?resort={id}` |
| ハブプレビュー | `/{id}/` |

**編集は `docs/mock-assets/` のみ。** `guides/public/` は生成物（`.gitignore`）。

## rewrites（vercel.json）

```json
{ "source": "/:resort", "destination": "/:resort/index.html" },
{ "source": "/:resort/", "destination": "/:resort/index.html" }
```

`npm run validate` で 11 施設・129 パスの 200 を確認可能。

## 将来の Next.js 差し替え

URL 形 `/{id}/` は変更しない。Vercel `rewrites` で Next アプリへ委譲可能:

```json
{
  "rewrites": [
    { "source": "/:id/", "destination": "https://next-app.vercel.app/:id/" }
  ]
}
```

詳細: [HANDOFF.md](./HANDOFF.md)
