#!/usr/bin/env node
/**
 * Generate Gemini Deep Research prompt for the next (or specified) batch resort.
 *
 * Usage:
 *   node scripts/lp-factory/build-deep-research-prompt.mjs --next
 *   node scripts/lp-factory/build-deep-research-prompt.mjs --rank 22
 *   node scripts/lp-factory/build-deep-research-prompt.mjs --id nishikawa
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, searchJapowResorts } from "./lib/japow-lookup.mjs";
import { updateResort, saveBatch } from "./lib/batch-io.mjs";
import {
  buildResortPrompt,
  parseBatchArgs,
  loadBatchItem,
  slugify,
} from "./lib/prompt-builder.mjs";

function parseArgs(argv) {
  const batchOpts = parseBatchArgs(argv);
  const opts = { ...batchOpts, write: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--stdout-only") opts.write = false;
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/lp-factory/build-deep-research-prompt.mjs [--next | --rank N | --id slug] [--batch path]`);
      process.exit(0);
    }
  }
  if (!opts.next && opts.rank == null && !opts.id && !opts.name) {
    console.error("Specify --name, --next, --rank N, or --id slug.");
    process.exit(1);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv);
  const { abs, data, item } = loadBatchItem(opts);

  if (!item.nameJa) {
    console.error("⚠ rank", item.rank, "has no nameJa — fill configs/lp-batch/batch-21-30.json first.");
    process.exit(1);
  }

  if (item.japowResortId == null && item.nameJa) {
    const hits = searchJapowResorts(item.nameJa);
    if (hits.length === 1) {
      item.japowResortId = hits[0].id;
      console.error(`ℹ Auto-suggested japowResortId ${hits[0].id} (${hits[0].nameJa})`);
    } else if (hits.length > 1) {
      console.error("ℹ Multiple JAPOW matches — verify manually:");
      for (const h of hits.slice(0, 5)) console.error(`  ${h.id}: ${h.nameJa} (${h.pref})`);
    }
  }

  const prompt = buildResortPrompt(item, data);

  if (opts.write) {
    const outDir = path.join(ROOT, "docs", "research", "prompts");
    fs.mkdirSync(outDir, { recursive: true });
    const outId = item.id ?? slugify(item.nameJa);
    const outPath = path.join(outDir, `${String(item.rank).padStart(2, "0")}-${outId}.md`);
    fs.writeFileSync(outPath, prompt, "utf8");
    console.error(`Wrote ${path.relative(ROOT, outPath)}`);
  }

  if (item.status === "pending") {
    updateResort(data, item.rank, { status: "research" });
    saveBatch(abs, data);
  }

  process.stdout.write(prompt);
}

main();
