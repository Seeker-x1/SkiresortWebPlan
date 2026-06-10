# Resorts — ゲレンデ別実装

`SkiresortWebPlan` は **汎用テンプレ**（ルート `src/`・`docs/`）と、ここに並ぶ **ゲレンデ別プロジェクト** のモノレポです。

## ディレクトリ

| パス | 内容 |
|------|------|
| [`Sichinohe-CyoueiSki/`](./Sichinohe-CyoueiSki/) | 七戸町営スキー場 — 本番 Next.js（`web/`）・マップ艦隊・運用データ |
| `NanakoCyoueiSki/` | レガシー参照（ルート直下・触らない） |

## 新規ゲレンデの追加

1. `resorts/<ResortName>/web/` をテンプレから fork
2. `resorts/<ResortName>/.cursor/agents/` にマップ艦隊を配置（七戸を参照）
3. ルート `AGENTS.md` の resort 一覧を更新

## 開発（七戸）

```bash
cd resorts/Sichinohe-CyoueiSki/web
npm install
npm run dev
```

ルートからマップ preview 生成:

```bash
npm run preview:map
```

## Vercel（モノレポ）

| ゲレンデ | Vercel プロジェクト | Root Directory |
|----------|---------------------|----------------|
| 七戸 | `sichinohe-choei`（ルート `vercel.json`） | リポジトリルート — ビルドは `resorts/Sichinohe-CyoueiSki/web` |

2本目以降は **New Project → 同じ repo → Root Directory を `resorts/<名前>/web`** に設定。
