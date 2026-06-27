#!/usr/bin/env node
/**
 * List research inbox reports that are candidates for LP Factory.
 *
 * Usage:
 *   node scripts/lp-factory/detect-inbox-reports.mjs
 *   node scripts/lp-factory/detect-inbox-reports.mjs --since HEAD~1
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const INBOX = path.join(ROOT, "docs", "research", "inbox");

function parseArgs(argv) {
  const opts = { since: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--since") opts.since = argv[++i];
  }
  return opts;
}

function registryIds() {
  const reg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "docs", "mock-assets", "registry.json"), "utf8"),
  );
  return new Set(reg.resorts.map((r) => r.id));
}

function changedInboxSince(ref) {
  try {
    const out = execSync(`git diff --name-only ${ref} HEAD -- docs/research/inbox/`, {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    return out ? out.split(/\r?\n/).filter((p) => p.endsWith(".md")) : [];
  } catch {
    return [];
  }
}

function main() {
  const opts = parseArgs(process.argv);
  const shipped = registryIds();
  const all = fs.existsSync(INBOX)
    ? fs.readdirSync(INBOX).filter((f) => f.endsWith(".md"))
    : [];

  const gitChanged = opts.since ? changedInboxSince(opts.since) : [];

  const reports = all.map((file) => {
    const id = file.replace(/\.md$/, "");
    return {
      id,
      path: `docs/research/inbox/${file}`,
      inRegistry: shipped.has(id),
      changedInPush: gitChanged.includes(`docs/research/inbox/${file}`),
    };
  });

  const pending = reports.filter((r) => !r.inRegistry);
  const payload = {
    inboxDir: "docs/research/inbox",
    totalMd: reports.length,
    pendingLp: pending,
    gitChangedSince: opts.since ?? null,
    gitChangedPaths: gitChanged,
  };

  console.log(JSON.stringify(payload, null, 2));
  if (pending.length === 0 && (!opts.since || gitChanged.length === 0)) {
    process.exit(0);
  }
}

main();
