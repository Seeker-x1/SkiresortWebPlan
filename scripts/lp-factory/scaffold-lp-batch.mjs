#!/usr/bin/env node
/** One-off scaffold: copy LP template → new id, rename PNGs, bulk replace ids in HTML/CSS */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MOCK = path.join(ROOT, "docs", "mock-assets");

const JOBS = [
  { id: "sanokura", from: "shinjo-lp", fromId: "shinjo" },
  { id: "niwa", from: "minami-furano-lp", fromId: "minami-furano" },
  { id: "horaguchi", from: "tsunan-lp", fromId: "tsunan" },
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replaceInTree(dir, pairs) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      replaceInTree(p, pairs);
      continue;
    }
    if (!/\.(html|css|json)$/i.test(name)) continue;
    let text = fs.readFileSync(p, "utf8");
    for (const [from, to] of pairs) {
      text = text.split(from).join(to);
    }
    fs.writeFileSync(p, text, "utf8");
  }
}

for (const job of JOBS) {
  const srcDir = path.join(MOCK, job.from);
  const destDir = path.join(MOCK, `${job.id}-lp`);
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  copyDir(srcDir, destDir);
  for (const name of fs.readdirSync(destDir)) {
    if (name.startsWith(`lp-mock-${job.fromId}-`) && name.endsWith(".png")) {
      const next = name.replace(`lp-mock-${job.fromId}-`, `lp-mock-${job.id}-`);
      fs.renameSync(path.join(destDir, name), path.join(destDir, next));
    }
  }
  replaceInTree(destDir, [
    [`data-mock-resort="${job.fromId}"`, `data-mock-resort="${job.id}"`],
    [`?resort=${job.fromId}`, `?resort=${job.id}`],
    [`lp-mock-${job.fromId}-`, `lp-mock-${job.id}-`],
    [job.fromId, job.id],
  ]);
  console.log(`✓ scaffolded ${job.id}-lp from ${job.from}`);
}
