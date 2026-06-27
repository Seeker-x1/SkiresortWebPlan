#!/usr/bin/env node
/**
 * Generate Cursor agent handoff prompt after research report is saved.
 *
 * Usage:
 *   node scripts/lp-factory/cursor-handoff.mjs --rank 22
 *   node scripts/lp-factory/cursor-handoff.mjs --id nishikawa
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/japow-lookup.mjs";
import { loadBatch, getByRank, getById, updateResort, saveBatch } from "./lib/batch-io.mjs";

function parseArgs(argv) {
  const opts = { batch: "configs/lp-batch/batch-21-30.json", rank: null, id: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--rank") opts.rank = Number(argv[++i]);
    else if (a === "--id") opts.id = argv[++i];
    else if (a === "--batch") opts.batch = argv[++i];
  }
  if (opts.rank == null && !opts.id) {
    console.error("Usage: cursor-handoff.mjs --rank N | --id slug");
    process.exit(1);
  }
  return opts;
}

function findReport(item) {
  if (item.reportPath) {
    const p = path.join(ROOT, item.reportPath);
    if (fs.existsSync(p)) return p;
  }
  if (item.id) {
    const inbox = path.join(ROOT, "docs", "research", "inbox", `${item.id}.md`);
    if (fs.existsSync(inbox)) return inbox;
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv);
  const { abs, data } = loadBatch(opts.batch);
  const item = opts.rank != null ? getByRank(data, opts.rank) : getById(data, opts.id);
  if (!item) throw new Error("Resort not found in batch.");

  const reportPath = findReport(item);
  if (!reportPath) {
    console.error(`No report found. Save to docs/research/inbox/${item.id}.md first.`);
    process.exit(1);
  }

  const relReport = path.relative(ROOT, reportPath).replace(/\\/g, "/");
  const relBrief = item.id ? `configs/lp-brief/${item.id}.yaml` : "(create from report §0)";

  const prompt = `テンプレートに沿って詳細ボタンまで実装。チャット内に画像を貼らない。

@docs/mock-assets/LP_FACTORY_PROCEDURE.md §0.2 標準パイプラインを **Step 1〜12 まで** 実施。

## 入力
- 戦略レポート: \`${relReport}\`
- バッチ優先順位: #${item.rank}
- registry id（案）: \`${item.id ?? "レポート §0 から確定"}\`
- japowResortId（案）: ${item.japowResortId ?? "レポート §0 / data/japow-resort-index で確認"}
- brief 出力先: \`${relBrief}\`

## ルール
- LP Factory 禁止事項（lp-factory-no-shortcuts）厳守
- 画像: Gemini MCP（不可時はユーザー確認）
- 検証 8 本 PASS → guides sync → JAPOWSERCH resort-guides 同期
- push はユーザーが明示した場合のみ

## レポート全文
（以下を LP Factory の入力として使う）

---
${fs.readFileSync(reportPath, "utf8")}
`;

  const outDir = path.join(ROOT, "docs", "research", "handoffs");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${String(item.rank).padStart(2, "0")}-${item.id ?? "unknown"}-cursor.txt`);
  fs.writeFileSync(outFile, prompt, "utf8");

  updateResort(data, item.rank, {
    status: "lp",
    reportPath: relReport,
  });
  saveBatch(abs, data);

  console.error(`Wrote ${path.relative(ROOT, outFile)}`);
  process.stdout.write(prompt);
}

main();
