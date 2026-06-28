#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MOCK = path.join(ROOT, "docs", "mock-assets");

const [id, from] = process.argv.slice(2);
if (!id || !from) {
  console.error("Usage: node _scaffold-one.mjs <id> <from-lp-folder-without-path>");
  process.exit(1);
}
const fromId = from.replace(/-lp$/, "");

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
    for (const [fromStr, toStr] of pairs) {
      text = text.split(fromStr).join(toStr);
    }
    fs.writeFileSync(p, text, "utf8");
  }
}

const srcDir = path.join(MOCK, from);
const destDir = path.join(MOCK, `${id}-lp`);
if (!fs.existsSync(srcDir)) {
  console.error(`Missing template: ${srcDir}`);
  process.exit(1);
}
if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
copyDir(srcDir, destDir);
for (const name of fs.readdirSync(destDir)) {
  if (name.startsWith(`lp-mock-${fromId}-`) && name.endsWith(".png")) {
    fs.renameSync(
      path.join(destDir, name),
      path.join(destDir, name.replace(`lp-mock-${fromId}-`, `lp-mock-${id}-`)),
    );
  }
}
replaceInTree(destDir, [
  [`data-mock-resort="${fromId}"`, `data-mock-resort="${id}"`],
  [`?resort=${fromId}`, `?resort=${id}`],
  [`lp-mock-${fromId}-`, `lp-mock-${id}-`],
  [fromId, id],
]);
console.log(`✓ scaffolded ${id}-lp from ${from}`);
