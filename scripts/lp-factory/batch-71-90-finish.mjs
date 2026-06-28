#!/usr/bin/env node
/**
 * Poll batch 71-90: build LPs when inbox ready, ensure PNGs, validate when complete.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const BATCH_PATH = join(ROOT, "configs/lp-batch/batch-71-90.json");
const INBOX = join(ROOT, "docs/research/inbox");
const VALIDATORS = [
  "node docs/mock-assets/scripts/validate-mock-i18n.mjs",
  "node docs/mock-assets/scripts/validate-mock-html-i18n.mjs",
  "node docs/mock-assets/scripts/validate-mock-lp-shell.mjs",
  "node docs/mock-assets/scripts/validate-mock-lp-copy.mjs",
  "node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs",
  "node docs/mock-assets/scripts/validate-mock-japow-detail.mjs",
];

function loadBatch() {
  return JSON.parse(readFileSync(BATCH_PATH, "utf8"));
}

function saveBatch(data) {
  writeFileSync(BATCH_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function allReady(batch) {
  return batch.resorts.every((r) => existsSync(join(INBOX, `${r.id}.md`)));
}

function allLp(batch) {
  return batch.resorts.every((r) =>
    existsSync(join(ROOT, "docs/mock-assets", `${r.id}-lp`, "index.html")),
  );
}

function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function buildReady() {
  run("node scripts/lp-factory/batch-71-90-build.mjs --all");
  const batch = loadBatch();
  const ids = batch.resorts
    .filter((r) => existsSync(join(ROOT, "docs/mock-assets", `${r.id}-lp`)))
    .map((r) => r.id)
    .join(" ");
  if (ids) {
    run(`node scripts/lp-factory/cleanup-lp-residue.mjs ${ids}`);
    run(`node scripts/lp-factory/ensure-lp-pngs.mjs ${ids}`);
  }
  run("node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs");
}

function validateAll() {
  for (const v of VALIDATORS) run(v);
  run("node guides/scripts/sync.mjs");
  run("node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public");
  run("node scripts/validate-resort-guides-ids.mjs");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const maxMin = Number(process.env.BATCH_WAIT_MIN || 180);
  const start = Date.now();
  let lastBuild = 0;

  while (Date.now() - start < maxMin * 60 * 1000) {
    const batch = loadBatch();
    const ready = batch.resorts.filter((r) => existsSync(join(INBOX, `${r.id}.md`))).length;
    console.error(`\n[${new Date().toISOString()}] inbox ${ready}/20`);

    if (Date.now() - lastBuild > 120_000 || ready === 20) {
      buildReady();
      lastBuild = Date.now();
    }

    if (allReady(batch) && allLp(batch)) {
      console.error("\n✓ All 20 ready — validating...");
      validateAll();
      for (const r of batch.resorts) {
        r.status = "shipped";
        r.updatedAt = new Date().toISOString().slice(0, 10);
      }
      saveBatch(batch);
      console.error("\n✓ Batch 71-90 ready for lp:ship");
      return;
    }

    if (allReady(batch) && !allLp(batch)) buildReady();

    await sleep(allReady(batch) ? 5000 : 90_000);
  }

  console.error("\n✗ Timeout — run again after deep-research completes");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
