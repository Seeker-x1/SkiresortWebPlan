# resorts/Sichinohe-CyoueiSki（七戸町営スキー場サイト／関連計画）

親フォルダ: **`SkiresortWebPlan/`**（スキーリゾート Web 関連プロジェクトの置き場）

公式サイト実装は **`web/`** の Next.js アプリ。戦略・エージェント定義は **`agents/`**。

## 開発

```bash
cd web
npm install
npm run dev
```

- ビルド: `npm run build`
- Lint: `npm run lint`

Node.js **20 以上**（CI は 22）。

## リポジトリ構成

| パス | 内容 |
|------|------|
| `web/` | Next.js（App Router・TypeScript・Tailwind） |
| `agents/` | IA・プロンプト・レジストリ・ロードマップ |
| `AGENTS.md` | エージェント運用の入口 |

## CI

GitHub にプッシュすると `.github/workflows/ci.yml` が **`web/` で `lint` と `build`** を実行します。

## ホスティング（推奨: Vercel）

1. GitHub にリポジトリを作成してプッシュする。  
2. [Vercel](https://vercel.com) で Import → このリポジトリを選択。  
3. **Root Directory** を `web` に設定する。  
4. Framework Preset は Next.js のままデプロイ。

環境変数のテンプレは `web/.env.example`。

## 内部資料

戦略レポートなどの **`.docx` は Git に含めない**（`.gitignore` で除外）。ローカルで保管する。

## ライセンス

未定（クライアント／町の方針に合わせて追記）。
