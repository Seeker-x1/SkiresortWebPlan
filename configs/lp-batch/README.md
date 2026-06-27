# LP Batch 21–30 — Gemini Gem → Cursor 自動化

## 1. 初回セットアップ（1 回）

1. Gemini で **Gem** を新規作成
2. `gem-system-prompt.md` の本文を Gem Instructions に貼る
3. Deep Research を ON
4. Gem が持つ **優先 22〜30 リスト** を `batch-21-30.json` に反映:

```bash
# Gem の表を TSV で保存して import（rank nameJa id japowId）
npm run lp:import-batch -- --file path/to/gem-list.tsv
```

手動 1 件:

```bash
npm run lp:batch-update -- --rank 22 --id example --nameJa "施設名" --japow 123
```

## 2. 1 施設あたりのループ（自動）

### A. フル自動（推奨）

`.env` に `GEMINI_API_KEY` を設定（`.env.example` 参照）。

```bash
# キュー確認
npm run lp:batch-status

# Deep Research API → inbox 保存 → commit → push → LP Automation 起動
npm run lp:deep-research -- --next --commit --push
```

既存スタブを本番レポートで上書きする場合:

```bash
npm run lp:deep-research -- --rank 21 --force --commit --push
```

### B. 手動 Gem UI（ゲレンデリサーチャー）

Gem Instructions = `gem-system-prompt.md` · Deep Research ON · 入力は **施設名だけ** で可。

```
新得山スキー場を調査して
```

詳細: [`gem-usage.md`](./gem-usage.md)

```bash
# Gem レポートを inbox に取り込み → push → LP Automation
npm run lp:import-report -- --id shintoku-yama --file report.md --commit --push
```

### C. LP 完了後

```bash
npm run lp:batch-update -- --rank 22 --status shipped
```

### D. Cursor 手動（Automation なし）

```bash
npm run lp:cursor-handoff -- --rank 22
# → docs/research/handoffs/22-{id}-cursor.txt を Cursor 新規チャットに貼る
```

## 3. status 値

| status | 意味 |
|--------|------|
| `pending` | 未着手 |
| `research` | Deep Research 中 |
| `lp` | Cursor で LP 実装中 |
| `shipped` | 詳細ボタンまで完了 |

## 4. 営業提案書（アウトバウンド用）

Deep Research 前でも、バッチ内の `salesAngle` からドラフトを生成:

```bash
npm run lp:sales-proposal -- --rank 21
npm run lp:sales-proposal -- --all
# → docs/research/sales-proposals/21-utoro-sales.md
```

## 5. 第21〜30位リスト（2026-06 確定）

| # | id | 施設 | JAPOW |
|---|-----|------|-------|
| 21 | utoro | ウトロスキー場 | 59 |
| 22 | shintoku-yama | 新得山スキー場 | 83 |
| 23 | tayama | 田山スキー場 | 116 |
| 24 | tomioka | 富岡スキー場 | 5 |
| 25 | kamifuse | 釜臥山スキー場 | 96 |
| 26 | hijiri-kogen | 聖高原スキー場 | 257 |
| 27 | kamoenokuni | 上ノ国町民スキー場 | 2 |
| 28 | sanokura | 三ノ倉スキー場 | 183 |
| 29 | niwa | 丹羽スキー場 | 6 |
| 30 | horaguchi | スノーパーク洞川 | 418 |

※ 西川町（nishikawa）は別バッチで LP 完了済み。本バッチはカテゴリー1ランキングに準拠。

## 6. 自動化パイプライン

| フェーズ | 自動化 | 担当 |
|----------|--------|------|
| 優先順位 22–30 決定 | Gem / 手動 | Gemini |
| **Deep Research** | **`npm run lp:deep-research`** | Gemini Interactions API |
| inbox → LP | Cursor Automation（main push） | Cloud Agent |
| 検証 8 本 + PR | Cloud Agent | LP_FACTORY §0.2 |

### 2 段 Automation（推奨）

| Automation | トリガー | 指示書 |
|------------|----------|--------|
| **Research** | 手動 / スケジュール | `configs/lp-batch/cloud-research-prompt.md` |
| **LP Factory** | main へ push（inbox 変更） | `configs/lp-batch/cloud-agent-prompt.md` |

Research Automation は `lp:deep-research --next --commit --push` を実行。push で LP Automation が連鎖起動。

Gem UI は API 障害時のフォールバック。

## 7. Cursor Automation（Cloud Agent）

**前提:** `configs/lp-batch/` · `scripts/lp-factory/` · `docs/research/inbox/` が **main に commit 済み**であること（Cloud Agent は push 時点の main を checkout する）。

| 項目 | 設定 |
|------|------|
| トリガー | `Seeker-x1/SkiresortWebPlan` へ **main へ push** |
| パス限定 | ネイティブ非対応 → プロンプト先頭で `detect-inbox-reports.mjs --since HEAD~1` によりゲート |
| 指示書 | `configs/lp-batch/cloud-agent-prompt.md` |
| 成果物 | ブランチ `lp-factory/{id}` + **PR to main**（main 直 push 禁止） |
| JAPOWSERCH | Cloud からは触らない · PR に手動 sync 記載 |

### 試験手順

```bash
# 1. インフラを main へ push（初回のみ）
git add configs/lp-batch scripts/lp-factory docs/research package.json
git commit -m "feat(lp-factory): batch queue, inbox automation scripts"
git push origin main

# 2. Gem レポートを inbox に保存して push
# docs/research/inbox/utoro.md
git add docs/research/inbox/utoro.md
git commit -m "research: utoro LP strategy report"
git push origin main
# → Automation が Cloud Agent を起動 · PR が開く

# 3. ローカルでゲート確認（push 前の dry-run）
npm run lp:detect-inbox -- --since HEAD~1
```

Automation 名: **LP Factory — research inbox → guide LP**（Automations エディタにドラフト済み）

