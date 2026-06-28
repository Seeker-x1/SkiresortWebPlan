#!/usr/bin/env node
/**
 * Copy LP template → {id}-lp/ with id/slug replacements (no PNG copy).
 * Usage: node docs/mock-assets/scripts/scaffold-lp.mjs --id tono-akabane --from abashiri-lv-lp --source-id abashiri-lv
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id") opts.id = args[++i];
    else if (args[i] === "--from") opts.from = args[++i];
    else if (args[i] === "--source-id") opts.sourceId = args[++i];
  }
  if (!opts.id || !opts.from) {
    console.error("Usage: scaffold-lp.mjs --id {registry-id} --from {slug}-lp [--source-id {old-id}]");
    process.exit(1);
  }
  opts.sourceId = opts.sourceId || opts.from.replace(/-lp$/, "");
  opts.dest = `${opts.id}-lp`;
  return opts;
}

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name.endsWith(".png")) continue;
    const s = join(src, name);
    const d = join(dest, name);
    if (statSync(s).isDirectory()) copyTree(s, d);
    else cpSync(s, d);
  }
}

function replaceInFile(path, pairs) {
  let text = readFileSync(path, "utf8");
  let orig = text;
  for (const [from, to] of pairs) {
    text = text.split(from).join(to);
  }
  if (text !== orig) writeFileSync(path, text, "utf8");
}

function walkReplace(dir, pairs) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkReplace(full, pairs);
    else if (/\.(html|json|css|md)$/i.test(name)) replaceInFile(full, pairs);
  }
}

const opts = parseArgs();
const srcDir = join(root, opts.from);
const destDir = join(root, opts.dest);

if (!existsSync(srcDir)) {
  console.error(`✗ Source not found: ${srcDir}`);
  process.exit(1);
}
if (existsSync(destDir)) {
  console.error(`✗ Destination exists: ${destDir}`);
  process.exit(1);
}

copyTree(srcDir, destDir);

const pairs = [
  [opts.from, opts.dest],
  [opts.sourceId, opts.id],
  [`lp-mock-${opts.sourceId}-`, `lp-mock-${opts.id}-`],
  [`images/maps/${opts.sourceId}-hero`, `images/maps/${opts.id}-hero`],
  [`map.html?resort=${opts.sourceId}`, `map.html?resort=${opts.id}`],
  [`data-mock-resort="${opts.sourceId}"`, `data-mock-resort="${opts.id}"`],
];

walkReplace(destDir, pairs);
console.log(`✓ scaffolded ${opts.dest} from ${opts.from} (${opts.sourceId} → ${opts.id})`);
