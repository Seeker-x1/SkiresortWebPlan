#!/usr/bin/env node
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { join } from "node:path";

const LOG = join(process.cwd(), "debug-50bfb1.log");
const NPM = "npx --yes npm@10.9.2";

function log(hypothesisId, message, data) {
  const entry = {
    sessionId: "50bfb1",
    runId: "ci-repro",
    hypothesisId,
    location: "scripts/debug-ci-audit.mjs",
    message,
    data,
    timestamp: Date.now(),
  };
  appendFileSync(LOG, `${JSON.stringify(entry)}\n`);
}

const trees = [
  { name: "root-template", dir: "" },
  { name: "nanako-web", dir: "NanakoCyoueiSki/web" },
  { name: "sichinohe-web", dir: "resorts/Sichinohe-CyoueiSki/web" },
];

const gitSha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const gitBranch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
log("A", "git context", { gitSha, gitBranch });

for (const tree of trees) {
  const cwd = tree.dir ? join(process.cwd(), tree.dir) : process.cwd();
  let ciExit = 0;
  let auditExit = 0;
  let ciError = "";
  let auditOutput = "";
  let hasSwcHelpers = false;

  try {
    const lock = execSync("node -e \"const l=require('./package-lock.json'); console.log(JSON.stringify(l.packages||{}).includes('0.5.23'))\"", {
      cwd,
      encoding: "utf8",
    }).trim();
    hasSwcHelpers = lock === "true";
  } catch (e) {
    hasSwcHelpers = false;
  }

  try {
    execSync(`${NPM} ci`, { cwd, stdio: "pipe" });
  } catch (e) {
    ciExit = e.status ?? 1;
    ciError = String(e.stderr || e.stdout || e.message).slice(0, 500);
  }

  try {
    auditOutput = execSync(`${NPM} audit --audit-level=high`, {
      cwd,
      encoding: "utf8",
    }).trim();
  } catch (e) {
    auditExit = e.status ?? 1;
    auditOutput = String(e.stderr || e.stdout || e.message).slice(0, 500);
  }

  log("B", "tree result", {
    name: tree.name,
    dir: tree.dir || ".",
    hasSwcHelpers023: hasSwcHelpers,
    ciExit,
    auditExit,
    ciError,
    auditOutput,
  });
}

console.log("Wrote debug-50bfb1.log");
