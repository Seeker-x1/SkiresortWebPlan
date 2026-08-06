#!/usr/bin/env node
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { join } from "node:path";

const LOG = join(process.cwd(), "debug-50bfb1.log");
const NPM = "npx --yes npm@10.9.2";

function log(hypothesisId, message, data) {
  appendFileSync(
    LOG,
    `${JSON.stringify({
      sessionId: "50bfb1",
      runId: "dependabot-fix",
      hypothesisId,
      location: "scripts/fix-dependabot-lockfiles.mjs",
      message,
      data,
      timestamp: Date.now(),
    })}\n`,
  );
}

const branches = [
  {
    branch: "dependabot/npm_and_yarn/root-minor-patch-b131c243c1",
    pr: 39,
    dir: "",
  },
  {
    branch: "dependabot/npm_and_yarn/NanakoCyoueiSki/web/nanako-web-minor-patch-f04c92d0e5",
    pr: 40,
    dir: "NanakoCyoueiSki/web",
  },
  {
    branch:
      "dependabot/npm_and_yarn/resorts/Sichinohe-CyoueiSki/web/sichinohe-web-minor-patch-49a52e9947",
    pr: 41,
    dir: "resorts/Sichinohe-CyoueiSki/web",
  },
];

for (const item of branches) {
  execSync(`git checkout ${item.branch}`, { stdio: "inherit" });
  try {
    execSync("git merge origin/main --no-edit", { stdio: "inherit" });
  } catch {
    log("E", "merge conflict", { branch: item.branch, pr: item.pr });
    process.exit(1);
  }

  const cwd = item.dir ? join(process.cwd(), item.dir) : process.cwd();
  let ciExit = 0;
  let auditExit = 0;
  let ciError = "";

  try {
    execSync(`${NPM} install`, { cwd, stdio: "inherit" });
    execSync(`${NPM} ci`, { cwd, stdio: "inherit" });
    execSync(`${NPM} audit --audit-level=high`, { cwd, stdio: "inherit" });
  } catch (e) {
    ciExit = e.status ?? 1;
    ciError = String(e.stderr || e.stdout || e.message).slice(0, 500);
    try {
      execSync(`${NPM} audit --audit-level=high`, { cwd, stdio: "pipe" });
    } catch (ae) {
      auditExit = ae.status ?? 1;
    }
  }

  const diff = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  if (diff) {
    execSync("git add package-lock.json NanakoCyoueiSki/web/package-lock.json resorts/Sichinohe-CyoueiSki/web/package-lock.json", {
      stdio: "inherit",
    });
    execSync('git commit -m "chore(deps): sync lockfile with main (npm 10.9.2)"', {
      stdio: "inherit",
    });
    execSync(`git push origin ${item.branch}`, { stdio: "inherit" });
  }

  log("E", "dependabot branch fixed", {
    branch: item.branch,
    pr: item.pr,
    ciExit,
    auditExit,
    ciError,
    pushed: Boolean(diff),
  });
}

execSync("git checkout main", { stdio: "inherit" });
console.log("Done. See debug-50bfb1.log");
