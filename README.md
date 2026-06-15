# SkiresortWebPlan

スキー場 Web テンプレ（ルート `src/`）と、ゲレンデ別実装（`resorts/`）のモノレポです。

## 依存関係のインストール（npm）

**原則: `npm ci`。** lockfile（`package-lock.json`）と完全一致する依存だけを入れます。CI / Vercel も同じ方式です。

| いつ | コマンド |
|------|----------|
|  clone 後・日常の開発 | `npm ci` |
|  パッケージの追加・更新 | `npm install`（または `npm install <pkg>`）→ lockfile をコミット |
|  CI / 本番ビルド | `npm ci` のみ（`npm install` は使わない） |

`npm install` は lockfile を書き換えるため、意図しないバージョン解決やサプライチェーンリスクを避けるには、**更新目的のときだけ**使います。

### 対象ディレクトリ

| パス | 用途 |
|------|------|
| リポジトリルート | 汎用テンプレ（Next.js） |
| `resorts/Sichinohe-CyoueiSki/web/` | 七戸本番サイト |
| `resorts/Sichinohe-CyoueiSki/scripts/` | マップ preview 等のスクリプト |

各ディレクトリで `npm ci` を実行してください（ルートから一括インストールはできません）。

lockfile 更新後は **Node 22 付属の npm 10 系**（CI と同じ）で生成することを推奨します。

```bash
npx npm@10.9.2 install
npx npm@10.9.2 install   # 2 回目で lockfile 同期を確認
npx npm@10.9.2 ci
```

## セキュリティ

- **Dependabot**（`.github/dependabot.yml`）: 週次で npm / GitHub Actions の更新 PR
- **Dependabot lockfile sync**（`.github/workflows/dependabot-lockfile-sync.yml`）: Dependabot PR で lockfile が不完全なとき `npm@10.9.2` で自動修正
- **Security audit**（`.github/workflows/security-audit.yml`）: push / PR / 週次で `npm ci` + `npm audit --audit-level=high`

## 開発の入口

| 目的 | 参照 |
|------|------|
| ルートテンプレ | ルートで `npm ci` → `npm run dev` |
| 七戸本番 | [`resorts/Sichinohe-CyoueiSki/web/README.md`](resorts/Sichinohe-CyoueiSki/web/README.md) |
| ゲレンデ一覧 | [`resorts/README.md`](resorts/README.md) |
| エージェント運用 | [`AGENTS.md`](AGENTS.md) |
