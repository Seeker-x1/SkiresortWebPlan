# 外部参照 — Webプロンプト（Cloude/Webプロンプト）

ローカルパス（リポジトリからの相対）:

`../../Webプロンプト`（= `Cloude/Webプロンプト`）

## 取得コマンド（PowerShell）

```powershell
powershell -NoProfile -File "..\..\Webプロンプト\Get-WebPrompt.ps1" -Number 3
```

`-Number` は **1〜9**（スクリプト内 `ValidateRange` に準拠）。

---

## テンプレ一覧（内容要約）と本プロジェクトでの使いどころ

| # | ロール（スクリプト上） | 出力・用途の要約 | 推奨する本リポジトリエージェントID |
|---|------------------------|------------------|--------------------------------------|
| 1 | Principal Architect (Vercel) | サイトマップ、ユーザーフロー3本、データモデル、API、30+コンポーネント一覧、ワイヤー、スタック、パフォーマンス予算、SEO | **01**（IA確定後）、**06**（スタック・実装）、**04**（SEO骨子） |
| 2 | Apple Design Director | デザインシステム、トークン、コンポーネント仕様、WCAG AA | **05** |
| 3 | Ogilvy Conversion Copywriter | ページ別ヒーロー・機能・証明・FAQ・フッター、感情トリガー | **03** |
| 4 | Frontend Architect | マルチステップフォーム、動的計算、検索フィルタ、ダッシュボード、認証、React構造 | **06**（フォーム・検索実装時）、**12**（運営コンソールUIの複雑化時） |
| 5 | Figma Make 用プロンプト変換 | 技術仕様 → Figma Make 向け5プロンプト | **05** と併用（ビジュアルプロトタイプ時） |
| 6 | Motion Designer (Apple) | スクロール・ホバー・遷移・アニメーション文章仕様 | **05**（任意・ブランド強化時） |
| 7 | Responsive Design Specialist | 375/768/1440 ブレークポイントごとのレイアウト・タイポ・ナビ | **05**、**01** |
| 8 | Full-Stack Architect | CMS/API/DB、認証、リアルタイム、キャッシュ、Supabase言及 | **06**、**08**（ハブ連携）、**02**（今日データ） |
| 9 | QA Engineer (Google) | 仕様レビューチェックリスト（CWV、a11y、SEO、セキュリティ等） | **07**（法務・表示と併走）、**06**（リリース前） |

---

## 七戸町営スキー場に貼るときのプレースホルダ例（テンプレ1向け）

スクリプト出力に渡す前に、角括弧を埋めるとブレが減る。

- `[WEBSITE TYPE]` → Official ski resort website (Shichinohe Town, Aomori, Japan)
- `[AUDIENCE]` → Inbound powder skiers + families/beginners + domestic transit travelers
- `[LIST 3-5]` → Today snow/lift status, dual audience paths, Shinkansen access, tickets/rental, local onsen journey (with disclaimers)
- `[RESPONSIVE/SEO/PERFORMANCE]` → Mobile-first, JSON-LD, Core Web Vitals conscious

---

## メンテナンス

- `Webプロンプト` 側にファイルが増えたら、本ドキュメントのパスとテーブルを更新する。
- **REGISTRY** に載せない理由: 外部パスかつユーザー環境依存のため、**参照ドキュメント**としてのみリンクする。
