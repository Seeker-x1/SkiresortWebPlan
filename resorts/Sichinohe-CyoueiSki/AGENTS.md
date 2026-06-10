# エージェント管理（resorts/Sichinohe-CyoueiSki）

このリポジトリでは **`agents/*.prompt.md`** を役割別プロンプトとして固定し、Cursor／Claude Code のサブエージェントやチャットにそのまま割り当てます。

## すぐ使う順序

1. **[agents/REGISTRY.yaml](agents/REGISTRY.yaml)** で ID・用途・関連ドキュメントを確認する。  
2. 該当する **`agents/NN-*.prompt.md`** の「システムプロンプト」ブロックをコピーしてエージェントに渡す。  
3. 並列／順序は **[agents/ORCHESTRATION.md](agents/ORCHESTRATION.md)** を参照。  
4. 全体の項目一覧・ロードマップは **[agents/MASTER_SUMMARY_AND_ROADMAP.md](agents/MASTER_SUMMARY_AND_ROADMAP.md)**。  
5. **`Webプロンプト/Get-WebPrompt.ps1`（1〜9）** を併用する場合は **[agents/REFERENCE_WEB_PROMPTS.md](agents/REFERENCE_WEB_PROMPTS.md)** でエージェントIDと対応づける。

## ID 早見表

| ID | 役割 | プロンプト |
|----|------|------------|
| 01 | IA・サイトマップ | [agents/01-information-architecture.prompt.md](agents/01-information-architecture.prompt.md) |
| 02 | 運行・雪・CMS・データ項目 | [agents/02-realtime-operations-data.prompt.md](agents/02-realtime-operations-data.prompt.md) |
| 03 | コピー・多言語 | [agents/03-content-copy-i18n.prompt.md](agents/03-content-copy-i18n.prompt.md) |
| 04 | SEO・計測 | [agents/04-seo-performance-marketing.prompt.md](agents/04-seo-performance-marketing.prompt.md) |
| 05 | デザイン・アクセシビリティ | [agents/05-design-accessibility.prompt.md](agents/05-design-accessibility.prompt.md) |
| 06 | 実装・インフラ | [agents/06-implementation-engineering.prompt.md](agents/06-implementation-engineering.prompt.md) |
| 07 | コンプライアンス | [agents/07-stakeholder-compliance.prompt.md](agents/07-stakeholder-compliance.prompt.md) |
| 08 | 全国データ基盤・ランキング | [agents/08-data-platform-ingestion-ranking.prompt.md](agents/08-data-platform-ingestion-ranking.prompt.md) |
| 09 | マップ・埋め込み | [agents/09-map-popup-and-embed.prompt.md](agents/09-map-popup-and-embed.prompt.md) |
| 10 | 価格パッケージ・アフィリエイト | [agents/10-monetization-packaging-affiliate.prompt.md](agents/10-monetization-packaging-affiliate.prompt.md) |
| 11 | パートナーオンボーディング | [agents/11-partner-resort-onboarding.prompt.md](agents/11-partner-resort-onboarding.prompt.md) |
| 12 | 運営コンソール・LINE | [agents/12-admin-console-line-integration.prompt.md](agents/12-admin-console-line-integration.prompt.md) |
| **13** | **アワード水準タイポ監修** | [agents/13-award-typography-design-system.prompt.md](agents/13-award-typography-design-system.prompt.md) |
| **14** | **アワード水準モーション** | [agents/14-award-motion-microinteraction.prompt.md](agents/14-award-motion-microinteraction.prompt.md) |
| **15** | **アワード完成QA・ロールアウト** | [agents/15-award-rollout-qa.prompt.md](agents/15-award-rollout-qa.prompt.md) |

**アワードデザイン仕様**: [agents/AWARD_TYPOGRAPHY_DESIGN_SYSTEM.md](agents/AWARD_TYPOGRAPHY_DESIGN_SYSTEM.md)　**完成手順**: [agents/AWARD_COMPLETION_PLAYBOOK.md](agents/AWARD_COMPLETION_PLAYBOOK.md)

## Cursor でのおすすめ

- チャットで **「REGISTRY の 06 で実装計画」** のように ID を指定する。  
- デザイン完成は **「REGISTRY 13 → 14 → 06 → 15」**（[ORCHESTRATION アワードプリセット](agents/ORCHESTRATION.md)）。  
- `agents/` 配下を編集するときは `.cursor/rules/ski-agents.mdc` がレジストリ参照を促します。

## 変更管理

- エージェントを追加・改名したら **`agents/REGISTRY.yaml`** と本ファイルの早見表を同一内容に更新する。  
- 設計ドキュメントのみ更新した場合は REGISTRY の `design_docs` を追随させる。
