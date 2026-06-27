#!/usr/bin/env node
/**
 * Update batch entry after filling from Gemini master list or completing a step.
 *
 * Usage:
 *   node scripts/lp-factory/batch-update.mjs --rank 22 --id foo --nameJa "..." --japow 123
 *   node scripts/lp-factory/batch-update.mjs --rank 21 --status shipped
 */
import { loadBatch, updateResort, saveBatch } from "./lib/batch-io.mjs";

function parseArgs(argv) {
  /** @type {Record<string, string | number | null>} */
  const opts = { batch: "configs/lp-batch/batch-21-30.json" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--batch") opts.batch = argv[++i];
    else if (a === "--rank") opts.rank = Number(argv[++i]);
    else if (a === "--id") opts.id = argv[++i];
    else if (a === "--nameJa") opts.nameJa = argv[++i];
    else if (a === "--nameEn") opts.nameEn = argv[++i];
    else if (a === "--japow") opts.japowResortId = Number(argv[++i]);
    else if (a === "--status") opts.status = argv[++i];
    else if (a === "--report") opts.reportPath = argv[++i];
    else if (a === "--notes") opts.notes = argv[++i];
  }
  if (opts.rank == null) {
    console.error("Usage: batch-update.mjs --rank N [--id ...] [--nameJa ...] [--japow N] [--status ...]");
    process.exit(1);
  }
  return opts;
}

function main() {
  const raw = parseArgs(process.argv);
  const rank = raw.rank;
  const { abs, data } = loadBatch(raw.batch);
  /** @type {Record<string, unknown>} */
  const patch = {};
  for (const key of ["id", "nameJa", "nameEn", "japowResortId", "status", "reportPath", "notes"]) {
    if (raw[key] !== undefined) patch[key] = raw[key];
  }
  const item = updateResort(data, rank, patch);
  saveBatch(abs, data);
  console.log(`Updated #${rank}:`, JSON.stringify(item, null, 2));
}

main();
