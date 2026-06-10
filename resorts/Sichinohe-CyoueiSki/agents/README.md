# エージェント構成（七戸サイト／全国ハブ連動）

このディレクトリは、七戸町営スキー場の公式サイトと **japowserch.com** を軸にした全国ゲレンデ連動を並列進行するための**役割別エージェント定義**です。各 `*.prompt.md` を Cursor／Claude Code のカスタムエージェントやサブタスクに割り当ててください。

**運用の起点**: プロジェクト直下 [**`AGENTS.md`**](../AGENTS.md)（早見表）／[**`REGISTRY.yaml`**](./REGISTRY.yaml)（機械可読）／[**`ORCHESTRATION.md`**](./ORCHESTRATION.md)（プリセット手順）／[**`AGENT_LAYOUT.md`**](./AGENT_LAYOUT.md)（**体験・実装・評価の三層**）。

## マップ UI 三層（2026-06 追加）

| 層 | ID | ファイル |
|----|-----|----------|
| L1 体験 | 17 | [17-map-interaction-spec.prompt.md](./17-map-interaction-spec.prompt.md) |
| L2 実装 | 19 | [19-map-ui-implementer.prompt.md](./19-map-ui-implementer.prompt.md) |
| L3 評価 | 16, 18 | [16-map-ux-evaluator.prompt.md](./16-map-ux-evaluator.prompt.md) / [18-map-interaction-evaluator.prompt.md](./18-map-interaction-evaluator.prompt.md) |

## 単体サイト（ゲレンデ公式）

| ファイル | 担当 |
|----------|------|
| [01-information-architecture.prompt.md](./01-information-architecture.prompt.md) | サイトマップ・ナビ・ページテンプレ・コンポーネント一覧 |
| [02-realtime-operations-data.prompt.md](./02-realtime-operations-data.prompt.md) | 積雪・運行・気象データ・更新ワークフロー・CMS項目 |
| [03-content-copy-i18n.prompt.md](./03-content-copy-i18n.prompt.md) | 日英コピー・トーン・危機対応文言・免責 |
| [04-seo-performance-marketing.prompt.md](./04-seo-performance-marketing.prompt.md) | 長尾SEO・構造化データ・マイクロウェザー連動要件 |
| [05-design-accessibility.prompt.md](./05-design-accessibility.prompt.md) | UIキット・写真方針・アクセシビリティ・モバイル |
| [06-implementation-engineering.prompt.md](./06-implementation-engineering.prompt.md) | スタック選定・実装・性能・デプロイ |
| [07-stakeholder-compliance.prompt.md](./07-stakeholder-compliance.prompt.md) | 町・関係温泉・第三者表記・アフィリエイト表示の確認 |
| [12-admin-console-line-integration.prompt.md](./12-admin-console-line-integration.prompt.md) | 運営向け低難易度更新コンソール・LINE連携（Webhook／LIFF） |

## 全国プラットフォーム（japowserch.com）

| ファイル | 担当 |
|----------|------|
| [08-data-platform-ingestion-ranking.prompt.md](./08-data-platform-ingestion-ranking.prompt.md) | 収集パイプライン・正規化・並列化・ランキング/API |
| [09-map-popup-and-embed.prompt.md](./09-map-popup-and-embed.prompt.md) | 地図ポップアップ・公式サイト埋め込みウィジェット |
| [10-monetization-packaging-affiliate.prompt.md](./10-monetization-packaging-affiliate.prompt.md) | 初期10万円パッケージ・サブスクSLA・ASP／アフィリエイト |
| [11-partner-resort-onboarding.prompt.md](./11-partner-resort-onboarding.prompt.md) | 新規ゲレンデオンボーディング・並列ロールアウト |

## アワード水準デザイン（タイポグラフィ特化）

| ファイル | 担当 |
|----------|------|
| [13-award-typography-design-system.prompt.md](./13-award-typography-design-system.prompt.md) | タイポ・余白・改行・視覚的階層の監修 |
| [14-award-motion-microinteraction.prompt.md](./14-award-motion-microinteraction.prompt.md) | スクロール演出・マイクロインタラクション |
| [15-award-rollout-qa.prompt.md](./15-award-rollout-qa.prompt.md) | 全ページ適用・完成QA |
| [AWARD_TYPOGRAPHY_DESIGN_SYSTEM.md](./AWARD_TYPOGRAPHY_DESIGN_SYSTEM.md) | 仕様書（3アプローチ比較・選定・トークン） |
| [AWARD_COMPLETION_PLAYBOOK.md](./AWARD_COMPLETION_PLAYBOOK.md) | 完成までのフェーズ手順 |

## 設計ドキュメント

| ファイル | 内容 |
|----------|------|
| [MASTER_SUMMARY_AND_ROADMAP.md](./MASTER_SUMMARY_AND_ROADMAP.md) | **項目別総まとめ・フェーズ別ロードマップ（1日スプリント含む）** |
| [REFERENCE_WEB_PROMPTS.md](./REFERENCE_WEB_PROMPTS.md) | **`Webプロンプト/Get-WebPrompt.ps1`（1〜9）とエージェントIDの対応** |
| [SITE_SKELETON_AND_IA.md](./SITE_SKELETON_AND_IA.md) | 七戸公式サイトの情報設計骨格 |
| [PLATFORM_VISION_JAPOWSEARCH.md](./PLATFORM_VISION_JAPOWSEARCH.md) | ハブ連動・マップ・収益モデルの展望 |
| [DATA_MODEL_NORMALIZED_RESORT.md](./DATA_MODEL_NORMALIZED_RESORT.md) | 全国共通・正規化データモデル（ドラフト） |
| [ADMIN_CONSOLE_AND_LINE_UPDATES.md](./ADMIN_CONSOLE_AND_LINE_UPDATES.md) | 運営コンソールUX原則・LINE自動更新の論理構成 |
