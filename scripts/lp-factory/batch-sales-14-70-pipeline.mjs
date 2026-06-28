#!/usr/bin/env node
/**
 * Full pipeline: Deep Research → LP build → validate → ship (batch sales 14-70).
 * Usage: node scripts/lp-factory/batch-sales-14-70-pipeline.mjs [--from-rank 51] [--no-ship]
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const BATCH = "configs/lp-batch/batch-sales-14-70.json";

function parseArgs() {
  const opts = { fromRank: 14, ship: true };
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--from-rank") opts.fromRank = Number(process.argv[++i]);
    else if (process.argv[i] === "--no-ship") opts.ship = false;
  }
  return opts;
}

function run(cmd) {
  console.error(`\n▶ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function main() {
  const opts = parseArgs();
  const batch = JSON.parse(readFileSync(join(ROOT, BATCH), "utf8"));
  const pending = batch.resorts
    .filter((r) => r.rank >= opts.fromRank && r.id !== "nishiwaigawa-yuda")
    .sort((a, b) => a.rank - b.rank);

  for (const resort of pending) {
    const inbox = join(ROOT, "docs/research/inbox", `${resort.id}.md`);
    if (!existsSync(inbox)) {
      run(
        `npm run lp:deep-research -- --batch ${BATCH} --rank ${resort.rank} --prompt marketing`,
      );
    }
    run(`node scripts/lp-factory/batch-sales-14-70-build.mjs --rank ${resort.rank}`);
  }

  run("node scripts/validate-resort-guides-ids.mjs");
  if (opts.ship) {
    run(
      'npm run lp:ship -- -m "feat(guides): batch sales 14-70 mock LPs and JAPOW detail links"',
    );
  }
  console.error("\n✓ Pipeline complete");
}

main();
