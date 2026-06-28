#!/usr/bin/env node
/**
 * Run Gemini Deep Research via Interactions API and save to docs/research/inbox/.
 *
 * Usage:
 *   npm run lp:deep-research -- --next
 *   npm run lp:deep-research -- --rank 22
 *   npm run lp:deep-research -- --id shintoku-yama --force
 *   npm run lp:deep-research -- --next --commit --push
 *
 * Requires GEMINI_API_KEY in .env or environment.
 * Docs: https://ai.google.dev/gemini-api/docs/interactions/deep-research
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { requireGeminiApiKey } from "./lib/load-env.mjs";
import {
  buildDeepResearchInput,
  parseBatchArgs,
  loadBatchItem,
  slugify,
} from "./lib/prompt-builder.mjs";
import { searchJapowResorts } from "./lib/japow-lookup.mjs";
import { updateResort, saveBatch } from "./lib/batch-io.mjs";
import {
  startDeepResearch,
  pollUntilComplete,
  extractReportText,
  validateReportMarkdown,
} from "./lib/gemini-deep-research.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INBOX = path.join(ROOT, "docs", "research", "inbox");

function parseArgs(argv) {
  const batchOpts = parseBatchArgs(argv);
  const opts = {
    ...batchOpts,
    agent: "deep-research-max-preview-04-2026",
    pollSec: 15,
    timeoutMin: 60,
    dryRun: false,
    force: false,
    commit: false,
    push: false,
    stdoutOnly: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--agent") opts.agent = argv[++i];
    else if (a === "--poll-sec") opts.pollSec = Number(argv[++i]);
    else if (a === "--timeout-min") opts.timeoutMin = Number(argv[++i]);
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--commit") opts.commit = true;
    else if (a === "--push") {
      opts.commit = true;
      opts.push = true;
    } else if (a === "--stdout-only") opts.stdoutOnly = true;
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/lp-factory/run-deep-research.mjs [--next | --rank N | --id slug] [options]

Options:
  --agent AGENT          deep-research-preview-04-2026 | deep-research-max-preview-04-2026 (default: max)
  --poll-sec N           Poll interval (default: 15)
  --timeout-min N        Max wait minutes (default: 60)
  --dry-run              Print prompt only, no API call
  --force                Overwrite existing inbox report
  --commit               Git commit inbox + batch after success
  --push                 Git commit and push to origin main (triggers LP Automation)
  --stdout-only          Print report to stdout instead of writing inbox
`);
      process.exit(0);
    }
  }

  if (!opts.next && opts.rank == null && !opts.id && !opts.name) {
    throw new Error("Specify --name, --next, --rank N, or --id slug.");
  }

  return opts;
}

function enrichJapowId(item) {
  if (item.japowResortId != null || !item.nameJa) return;
  const hits = searchJapowResorts(item.nameJa);
  if (hits.length === 1) {
    item.japowResortId = hits[0].id;
    console.error(`ℹ Auto-suggested japowResortId ${hits[0].id} (${hits[0].nameJa})`);
  } else if (hits.length > 1) {
    console.error("ℹ Multiple JAPOW matches — verify manually:");
    for (const h of hits.slice(0, 5)) console.error(`  ${h.id}: ${h.nameJa} (${h.pref})`);
  }
}

function normalizeReport(text, item) {
  let out = text.trim();
  if (out.startsWith("```markdown")) out = out.slice("```markdown".length).trimStart();
  if (out.startsWith("```")) out = out.slice(3).trimStart();
  if (out.endsWith("```")) out = out.slice(0, -3).trimEnd();

  const registryId = item.id ?? slugify(item.nameJa);
  const footer = `\n\n---\n*Deep Research via Gemini Interactions API · ${new Date().toISOString()} · batch rank #${item.rank}*\n`;
  if (!out.includes("*Deep Research via Gemini")) out += footer;
  return out;
}

function writeInboxReport(registryId, content) {
  fs.mkdirSync(INBOX, { recursive: true });
  const outPath = path.join(INBOX, `${registryId}.md`);
  fs.writeFileSync(outPath, content, "utf8");
  return outPath;
}

function gitCommitAndPush(registryId, rank, push, batchRel) {
  const relInbox = `docs/research/inbox/${registryId}.md`;
  const relBatch = batchRel ?? "configs/lp-batch/batch-21-30.json";
  execSync(`git add "${relInbox}" "${relBatch}"`, { cwd: ROOT, stdio: "inherit" });
  const msg = `research: ${registryId} Deep Research report (API, rank ${rank})`;
  execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: ROOT, stdio: "inherit" });
  if (push) {
    execSync("git push origin main", { cwd: ROOT, stdio: "inherit" });
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const { abs, data, item } = loadBatchItem(opts);

  if (!item.nameJa) {
    console.error("⚠ rank", item.rank, "has no nameJa — fill batch JSON first.");
    process.exit(1);
  }

  enrichJapowId(item);
  const registryId = item.id ?? slugify(item.nameJa);
  const inboxPath = path.join(INBOX, `${registryId}.md`);

  if (fs.existsSync(inboxPath) && !opts.force && !opts.dryRun) {
    console.error(`⚠ Inbox report exists: ${path.relative(ROOT, inboxPath)} — use --force to overwrite.`);
    process.exit(1);
  }

  const input = buildDeepResearchInput(item, data, opts.prompt ?? "marketing");

  if (opts.dryRun) {
    process.stdout.write(input);
    return;
  }

  const apiKey = requireGeminiApiKey();

  if (item.status === "pending") {
    updateResort(data, item.rank, { status: "research" });
    saveBatch(abs, data);
  }

  console.error(`▶ Deep Research #${item.rank} ${item.nameJa} (${registryId})`);
  console.error(`  agent: ${opts.agent}`);

  const started = await startDeepResearch({ apiKey, input, agent: opts.agent });
  const interactionId = started.id;
  if (!interactionId) {
    throw new Error(`No interaction id in response: ${JSON.stringify(started)}`);
  }
  console.error(`  interaction: ${interactionId}`);

  const completed = await pollUntilComplete({
    apiKey,
    id: interactionId,
    pollIntervalMs: opts.pollSec * 1000,
    timeoutMs: opts.timeoutMin * 60 * 1000,
    onProgress: (result) => {
      const stepCount = Array.isArray(result.steps) ? result.steps.length : 0;
      console.error(`  … status=${result.status} steps=${stepCount}`);
    },
  });

  const rawText = extractReportText(completed);
  if (!rawText) {
    throw new Error("Completed interaction has no report text in steps/outputs.");
  }

  const report = normalizeReport(rawText, item);
  const issues = validateReportMarkdown(report, registryId);
  if (issues.length) {
    console.error("⚠ Report validation warnings:", issues.join("; "));
  }

  if (opts.stdoutOnly) {
    process.stdout.write(report);
    return;
  }

  const outPath = writeInboxReport(registryId, report);
  console.error(`✓ Wrote ${path.relative(ROOT, outPath)} (${report.length} chars)`);

  updateResort(data, item.rank, {
    status: "research",
    reportPath: `docs/research/inbox/${registryId}.md`,
    researchInteractionId: interactionId,
    researchCompletedAt: new Date().toISOString(),
  });
  saveBatch(abs, data);

  if (opts.commit) {
    gitCommitAndPush(registryId, item.rank, opts.push, opts.batch);
    console.error(opts.push ? "✓ Committed and pushed — LP Factory Automation may start." : "✓ Committed locally.");
  } else {
    console.error("\nNext:");
    console.error(`  git add docs/research/inbox/${registryId}.md && git commit && git push`);
    console.error("  → Cursor Automation builds LP from inbox report");
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
