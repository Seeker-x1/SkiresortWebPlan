#!/usr/bin/env node
/**
 * Save a Gem Deep Research report (paste or file) to docs/research/inbox/.
 *
 * Usage:
 *   # Gem 出力をファイルに保存してから
 *   npm run lp:import-report -- --id shintoku-yama --file report.md --commit --push
 *
 *   # クリップボード経由（PowerShell）
 *   Get-Clipboard | node scripts/lp-factory/import-gem-report.mjs --id shintoku-yama --commit --push
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadBatch, updateResort, saveBatch, getById } from "./lib/batch-io.mjs";
import { validateReportMarkdown } from "./lib/gemini-deep-research.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INBOX = path.join(ROOT, "docs", "research", "inbox");

function parseArgs(argv) {
  const opts = {
    batch: "configs/lp-batch/batch-21-30.json",
    id: null,
    file: null,
    force: false,
    commit: false,
    push: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") opts.id = argv[++i];
    else if (a === "--file") opts.file = argv[++i];
    else if (a === "--batch") opts.batch = argv[++i];
    else if (a === "--force") opts.force = true;
    else if (a === "--commit") opts.commit = true;
    else if (a === "--push") {
      opts.commit = true;
      opts.push = true;
    } else if (a === "--help" || a === "-h") {
      console.log(`Usage: import-gem-report.mjs --id REGISTRY-ID [--file path] [--force] [--commit] [--push]

Read report from --file or stdin. Saves to docs/research/inbox/{id}.md`);
      process.exit(0);
    }
  }
  if (!opts.id) {
    console.error("Usage: import-gem-report.mjs --id REGISTRY-ID [--file path]");
    process.exit(1);
  }
  return opts;
}

function readInput(opts) {
  if (opts.file) {
    const p = path.isAbsolute(opts.file) ? opts.file : path.join(process.cwd(), opts.file);
    return fs.readFileSync(p, "utf8");
  }
  if (process.stdin.isTTY) {
    throw new Error("Provide --file or pipe report markdown on stdin.");
  }
  return fs.readFileSync(0, "utf8");
}

function normalizeReport(text) {
  let out = text.trim();
  if (out.startsWith("```markdown")) out = out.slice("```markdown".length).trimStart();
  if (out.startsWith("```")) out = out.slice(3).trimStart();
  if (out.endsWith("```")) out = out.slice(0, -3).trimEnd();
  return out;
}

function gitCommitAndPush(registryId, push) {
  const relInbox = `docs/research/inbox/${registryId}.md`;
  const relBatch = "configs/lp-batch/batch-21-30.json";
  execSync(`git add "${relInbox}" "${relBatch}"`, { cwd: ROOT, stdio: "inherit" });
  const msg = `research: ${registryId} Deep Research report (Gem)`;
  execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: ROOT, stdio: "inherit" });
  if (push) execSync("git push origin main", { cwd: ROOT, stdio: "inherit" });
}

function main() {
  const opts = parseArgs(process.argv);
  const registryId = opts.id;
  const outPath = path.join(INBOX, `${registryId}.md`);

  if (fs.existsSync(outPath) && !opts.force) {
    console.error(`⚠ Exists: ${path.relative(ROOT, outPath)} — use --force`);
    process.exit(1);
  }

  const report = normalizeReport(readInput(opts));
  const issues = validateReportMarkdown(report, registryId);
  if (issues.length) {
    console.error("ℹ Format notes (marketing Gem OK):", issues.join("; "));
  }

  fs.mkdirSync(INBOX, { recursive: true });
  const footer = `\n\n---\n*Imported from Gemini Gem · ${new Date().toISOString()}*\n`;
  const body = report.includes("*Imported from Gemini Gem") ? report : report + footer;
  fs.writeFileSync(outPath, body, "utf8");
  console.error(`✓ Wrote ${path.relative(ROOT, outPath)} (${body.length} chars)`);

  try {
    const { abs, data } = loadBatch(opts.batch);
    const item = getById(data, registryId);
    if (item) {
      updateResort(data, item.rank, {
        status: "research",
        reportPath: `docs/research/inbox/${registryId}.md`,
        researchCompletedAt: new Date().toISOString(),
      });
      saveBatch(abs, data);
      console.error(`✓ Batch rank #${item.rank} (${item.nameJa}) → research`);
    }
  } catch {
    console.error("ℹ Batch JSON not updated (id not in batch or batch missing)");
  }

  if (opts.commit) {
    gitCommitAndPush(registryId, opts.push);
    console.error(opts.push ? "✓ Pushed — LP Factory Automation may start." : "✓ Committed.");
  } else {
    console.error("\nNext: git add + commit + push → LP Factory builds the site");
    console.error(`  npm run lp:import-report -- --id ${registryId} --commit --push`);
  }
}

main();
