#!/usr/bin/env node
/**
 * Generate sales proposal outline from batch sales angles (for outbound prep).
 *
 * Usage:
 *   node scripts/lp-factory/build-sales-proposal.mjs --rank 21
 *   node scripts/lp-factory/build-sales-proposal.mjs --all
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/japow-lookup.mjs";
import { loadBatch, getByRank } from "./lib/batch-io.mjs";

function parseArgs(argv) {
  const opts = { batch: "configs/lp-batch/batch-21-30.json", rank: null, all: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--rank") opts.rank = Number(argv[++i]);
    else if (argv[i] === "--all") opts.all = true;
    else if (argv[i] === "--batch") opts.batch = argv[++i];
  }
  return opts;
}

function buildProposal(item, batch) {
  return `# 営業提案書（ドラフト）— ${item.nameJa}

**優先順位:** #${item.rank} / カテゴリー1（自治体依存型）  
**registry id:** \`${item.id}\` · **JAPOW id:** ${item.japowResortId}  
**地域:** ${item.regionJa ?? "—"}

---

## 1. 現状の課題（デジタル対応の遅れ）

${item.digitalGap ?? "（バッチ定義を参照）"}

- 公式サイトを持たず、自治体ポータルやPDF・SNS散在に情報が依存
- インバウンド・新規客が **営業時間・運行・本日の雪** を確認しづらい
- 電話・役場への問い合わせ負担が積み上がりやすい

## 2. ポテンシャル（選定理由）

${item.salesAngle ?? "—"}

**バッチ選定基準との整合:**
${(batch.selectionCriteria ?? []).map((c) => `- ${c}`).join("\n")}

## 3. サブスク型サイト導入メリット

| メリット | 内容 |
|----------|------|
| 業務負担軽減 | ${item.subscriptionPitch ?? "ワンタップ運行更新・FAQ多言語化で電話対応削減"} |
| 集客増 | JAPOWマップ「詳細確認」→ \`guides.japowserch.com/${item.id}/\` 直結 |
| 営業差別化 | モックLP先行提示 → 導入イメージを即共有（LP Factory 実績21施設） |

## 4. 提案パッケージ（JAPOWSERCH）

1. **多言語ガイドLP**（ja/en）— ヒーロー・施設ファクト・アクセス
2. **ライブ風運行ダッシュボード**（変則営業・ナイター向け）— 該当時
3. **周辺エリア特集** — 飲食・温泉・広域周遊（Deep Research 連動）
4. **JAPOW 詳細ボタン連携** — マップカードから LP へ
5. **広域連携特集** — ${item.rank === 21 ? "ウナベツスキー場とセット提案" : "近隣メガリゾート送客導線"}

## 5. LP 実装方針（社内）

| 項目 | 案 |
|------|-----|
| archetype | \`${item.archetypeHint ?? "要 Deep Research"}\` |
| 複製元 | \`${item.copyFromHint ?? "shinjo-lp"}\` |
| brief | \`configs/lp-brief/${item.id}.yaml\` |

## 6. 次のアクション

1. \`npm run lp:research-prompt -- --rank ${item.rank}\` → Gem Deep Research
2. レポート → \`docs/research/inbox/${item.id}.md\`
3. \`npm run lp:cursor-handoff -- --rank ${item.rank}\` → LP Factory
4. モック URL を営業資料に添付

---
*Generated ${new Date().toISOString().slice(0, 10)} · batch ${batch.batchId}*
`;
}

function main() {
  const opts = parseArgs(process.argv);
  const { data } = loadBatch(opts.batch);
  const outDir = path.join(ROOT, "docs", "research", "sales-proposals");
  fs.mkdirSync(outDir, { recursive: true });

  const ranks =
    opts.all ? data.resorts.map((r) => r.rank) : opts.rank != null ? [opts.rank] : [];

  if (ranks.length === 0) {
    console.error("Usage: build-sales-proposal.mjs --rank N | --all");
    process.exit(1);
  }

  for (const rank of ranks) {
    const item = getByRank(data, rank);
    if (!item) continue;
    const md = buildProposal(item, data);
    const outPath = path.join(outDir, `${String(rank).padStart(2, "0")}-${item.id}-sales.md`);
    fs.writeFileSync(outPath, md, "utf8");
    console.log(path.relative(ROOT, outPath));
  }
}

main();
