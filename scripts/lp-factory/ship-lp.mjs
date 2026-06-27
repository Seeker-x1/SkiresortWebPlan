#!/usr/bin/env node
/**
 * LP Factory 出荷: 検証 8 本 → guides sync → SkiresortWebPlan push → JAPOWSERCH 同期 push
 *
 * Usage:
 *   npm run lp:ship
 *   npm run lp:ship -- --id shintoku-yama --message "feat(guides): add Shintokuyama mock LP (japow 83)"
 *   npm run lp:ship -- --no-japow   # SkiresortWebPlan のみ（JAPOWSERCH パス不明時）
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const JAPOW_ROOT =
  process.env.JAPOWSERCH_ROOT ?? path.resolve(ROOT, "..", "JAPOWSERCH");

const VALIDATORS = [
  "node docs/mock-assets/scripts/validate-mock-i18n.mjs",
  "node docs/mock-assets/scripts/validate-mock-html-i18n.mjs",
  "node docs/mock-assets/scripts/validate-mock-lp-shell.mjs",
  "node docs/mock-assets/scripts/validate-mock-lp-copy.mjs",
  "node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs",
  "node docs/mock-assets/scripts/validate-mock-japow-detail.mjs",
];

function parseArgs(argv) {
  const opts = {
    id: null,
    message: null,
    noJapow: false,
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") opts.id = argv[++i];
    else if (a === "--message" || a === "-m") opts.message = argv[++i];
    else if (a === "--no-japow") opts.noJapow = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: npm run lp:ship [-- --id registry-id -m "commit message"] [--no-japow] [--dry-run]`);
      process.exit(0);
    }
  }
  return opts;
}

function defaultMessage(id) {
  if (!id) return "feat(guides): LP Factory ship — mock LP and JAPOW detail links";
  return `feat(guides): add ${id} mock LP and JAPOW detail link`;
}

function run(cmd, cwd = ROOT, dryRun = false) {
  console.error(`▶ ${cmd}`);
  if (dryRun) return "";
  execSync(cmd, { cwd, stdio: "inherit", encoding: "utf8" });
}

function shipSkiresortWebPlan(message, dryRun) {
  const status = dryRun ? "M\n" : execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
  if (!dryRun && !status.trim()) {
    console.error("✓ SkiresortWebPlan: nothing to commit");
    return;
  }

  if (!dryRun) {
    execSync("git add -A", { cwd: ROOT, stdio: "inherit" });
    try {
      execSync("git reset HEAD -- .tmp-japow-rg.json", { cwd: ROOT, stdio: "inherit" });
    } catch {
      /* untracked only */
    }
    const staged = execSync("git diff --cached --name-only", { cwd: ROOT, encoding: "utf8" }).trim();
    if (!staged) {
      console.error("✓ SkiresortWebPlan: nothing staged");
      return;
    }
    execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: ROOT, stdio: "inherit" });
    execSync("git push origin HEAD", { cwd: ROOT, stdio: "inherit" });
  }
  console.error("✓ SkiresortWebPlan pushed → Vercel guides deploy (sync.mjs on build)");
}

function shipJapowserch(dryRun) {
  if (!existsSync(JAPOW_ROOT)) {
    console.error(`⚠ JAPOWSERCH not found at ${JAPOW_ROOT} — set JAPOWSERCH_ROOT or use --no-japow`);
    return;
  }

  const src = path.join(ROOT, "data", "resort-guides.json");
  const dest = path.join(JAPOW_ROOT, "data", "resort-guides.json");
  const srcText = readFileSync(src, "utf8");
  const destText = existsSync(dest) ? readFileSync(dest, "utf8") : "";

  if (srcText === destText) {
    console.error("✓ JAPOWSERCH resort-guides.json already in sync");
    const ahead = dryRun
      ? ""
      : execSync("git status --porcelain data/resort-guides.json", {
          cwd: JAPOW_ROOT,
          encoding: "utf8",
        }).trim();
    if (!ahead) return;
  }

  if (!dryRun) {
    copyFileSync(src, dest);
    execSync("git fetch fork main", { cwd: JAPOW_ROOT, stdio: "inherit" });
    try {
      execSync("git checkout fork/main", { cwd: JAPOW_ROOT, stdio: "inherit" });
    } catch {
      execSync("git checkout -B main-sync fork/main", { cwd: JAPOW_ROOT, stdio: "inherit" });
    }
    copyFileSync(src, dest);
    execSync("git add data/resort-guides.json", { cwd: JAPOW_ROOT, stdio: "inherit" });
    const staged = execSync("git diff --cached --name-only", {
      cwd: JAPOW_ROOT,
      encoding: "utf8",
    }).trim();
    if (staged) {
      execSync('git commit -m "sync: resort-guides.json from SkiresortWebPlan"', {
        cwd: JAPOW_ROOT,
        stdio: "inherit",
      });
      execSync("git push fork HEAD:main", { cwd: JAPOW_ROOT, stdio: "inherit" });
    }
  }
  console.error("✓ JAPOWSERCH fork/main pushed — detail button fallback JSON updated");
}

function main() {
  const opts = parseArgs(process.argv);
  const message = opts.message ?? defaultMessage(opts.id);

  console.error("");
  console.error("═══════════════════════════════════════════════════");
  console.error(" LP Factory ship (validate → sync → push → deploy)");
  console.error("═══════════════════════════════════════════════════");

  for (const cmd of VALIDATORS) run(cmd, ROOT, opts.dryRun);
  run("node guides/scripts/sync.mjs", ROOT, opts.dryRun);
  run("node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public", ROOT, opts.dryRun);

  shipSkiresortWebPlan(message, opts.dryRun);

  if (!opts.noJapow) {
    shipJapowserch(opts.dryRun);
  }

  console.error("");
  console.error("✓ Ship complete — guides.japowserch.com deploys via Vercel on push");
}

main();
