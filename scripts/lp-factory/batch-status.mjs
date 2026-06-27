#!/usr/bin/env node
/**
 * Show batch queue status.
 *
 * Usage: node scripts/lp-factory/batch-status.mjs [--batch path]
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/japow-lookup.mjs";
import { loadBatch, getNextPending } from "./lib/batch-io.mjs";

function parseArgs(argv) {
  const opts = { batch: "configs/lp-batch/batch-21-30.json" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--batch") opts.batch = argv[++i];
  }
  return opts;
}

function reportExists(item) {
  if (item.reportPath && fs.existsSync(path.join(ROOT, item.reportPath))) return true;
  if (!item.id) return false;
  const inbox = path.join(ROOT, "docs", "research", "inbox", `${item.id}.md`);
  return fs.existsSync(inbox);
}

function main() {
  const { data } = loadBatch(parseArgs(process.argv).batch);
  const next = getNextPending(data);

  console.log(`\n${data.batchId} — ${data.description}\n`);
  console.log("rank | status    | id              | nameJa                    | japow | report");
  console.log("-----|-----------|-----------------|---------------------------|-------|--------");

  for (const r of data.resorts) {
    const rep = reportExists(r) ? "✓" : "·";
    console.log(
      `${String(r.rank).padStart(4)} | ${(r.status ?? "pending").padEnd(9)} | ${(r.id ?? "—").padEnd(15)} | ${(r.nameJa ?? "—").slice(0, 25).padEnd(25)} | ${String(r.japowResortId ?? "—").padEnd(5)} | ${rep}`,
    );
  }

  if (next) {
    console.log(`\n→ Next: #${next.rank} ${next.nameJa ?? "(name pending)"}`);
    console.log(`  npm run lp:research-prompt -- --rank ${next.rank}`);
  } else {
    console.log("\n→ All items shipped or no pending entries.");
  }
  console.log("");
}

main();
