#!/usr/bin/env node
/**
 * Sequential Deep Research for all pending items in a batch file.
 * Usage: node scripts/lp-factory/run-batch-research-seq.mjs --batch configs/lp-batch/batch-sales-14-70.json
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadBatch } from "./lib/batch-io.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const opts = { batch: "configs/lp-batch/batch-sales-14-70.json", startRank: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--batch") opts.batch = argv[++i];
    else if (a === "--from-rank") opts.startRank = Number(argv[++i]);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv);
  const { data } = loadBatch(opts.batch);
  const pending = data.resorts
    .filter((r) => r.status === "pending" || r.status === "research")
    .filter((r) => opts.startRank == null || r.rank >= opts.startRank)
    .sort((a, b) => a.rank - b.rank);

  console.error(`Batch ${data.batchId}: ${pending.length} resorts to research`);

  for (const item of pending) {
    const inbox = path.join(ROOT, "docs", "research", "inbox", `${item.id}.md`);
    try {
      execSync(
        `npm run lp:deep-research -- --batch ${opts.batch} --rank ${item.rank} --prompt marketing`,
        { cwd: ROOT, stdio: "inherit", encoding: "utf8" },
      );
      console.error(`✓ Done rank ${item.rank} ${item.nameJa}`);
    } catch (e) {
      console.error(`✗ Failed rank ${item.rank}: ${e.message}`);
      process.exit(1);
    }
  }
  console.error("✓ Batch research complete");
}

main();
