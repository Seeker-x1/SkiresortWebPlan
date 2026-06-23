#!/usr/bin/env node
/**
 * Validates LP mock HTML shell: i18n wiring, resort id, map links.
 * Usage: node docs/mock-assets/scripts/validate-mock-lp-shell.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function findResortDirs() {
  return readdirSync(root).filter((name) => {
    const full = join(root, name);
    return (
      statSync(full).isDirectory() &&
      name.endsWith("-lp") &&
      statSync(join(full, "index.html")).isFile()
    );
  });
}

function loadRegistry() {
  const reg = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
  const bySlug = new Map(reg.resorts.map((r) => [r.slug, r.id]));
  return { bySlug, ids: new Set(reg.resorts.map((r) => r.id)) };
}

function checkHtml(filePath, expectedId, errors, label) {
  const html = readFileSync(filePath, "utf8");

  if (!html.includes("mock-i18n.js")) {
    errors.push(`${label}: missing mock-i18n.js`);
  }
  if (!html.includes("mock-i18n.css")) {
    errors.push(`${label}: missing mock-i18n.css`);
  }
  if (!html.includes('data-lang-switch="ja"') || !html.includes('data-lang-switch="en"')) {
    errors.push(`${label}: missing data-lang-switch ja/en buttons`);
  }
  const resortAttr = html.match(/data-mock-resort="([^"]+)"/);
  if (!resortAttr) {
    errors.push(`${label}: missing data-mock-resort on <html>`);
  } else if (resortAttr[1] !== expectedId) {
    errors.push(`${label}: data-mock-resort="${resortAttr[1]}" expected "${expectedId}"`);
  }
  if (filePath.endsWith("index.html") && !html.includes(`map.html?resort=${expectedId}`)) {
    errors.push(`${label}: missing map.html?resort=${expectedId} link`);
  }
}

let failed = false;
const { bySlug } = loadRegistry();

for (const dir of findResortDirs()) {
  const errors = [];
  const expectedId = bySlug.get(dir);
  if (!expectedId) {
    failed = true;
    console.error(`\n✗ ${dir}: not in registry.json (slug)`);
    continue;
  }

  const indexPath = join(root, dir, "index.html");
  checkHtml(indexPath, expectedId, errors, `${dir}/index.html`);

  const htmlFiles = readdirSync(join(root, dir)).filter((f) => f.endsWith(".html") && f !== "index.html");
  for (const f of htmlFiles) {
    checkHtml(join(root, dir, f), expectedId, errors, `${dir}/${f}`);
  }

  if (errors.length) {
    failed = true;
    console.error(`\n✗ ${dir}`);
    for (const e of errors) console.error(`  ${e}`);
  } else {
    const extra = htmlFiles.length ? ` + ${htmlFiles.length} subpage(s)` : "";
    console.log(`✓ ${dir} (id=${expectedId}${extra})`);
  }
}

if (failed) {
  console.error("\nvalidate-mock-lp-shell: FAIL");
  process.exit(1);
}
console.log("\nvalidate-mock-lp-shell: PASS");
