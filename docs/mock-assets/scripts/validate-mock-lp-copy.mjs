#!/usr/bin/env node
/**
 * LP user-facing copy must not use internal/strategy jargon (e.g. インバウンド).
 * Scans docs/mock-assets/{id}-lp/messages/*.json only.
 * Usage: node docs/mock-assets/scripts/validate-mock-lp-copy.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Substrings that must not appear in LP message JSON (user-facing). */
const JA_FORBIDDEN = [
  "インバウンドが求める",
  "インバウンド向け",
  "インバウンドに刺さる",
  "インバウンド観光客",
  "インバウンドにも",
  "インバウンドにとって",
  "インバウンドFIT",
  "インバウンド個人",
  "インバウンド・",
  "インバウンドの",
  "インバウンドが愛",
  "インバウンドが",
];

const EN_FORBIDDEN = [
  /what inbound guests want/i,
  /inbound-ready/i,
  /inbound guests/i,
  /inbound visitors/i,
  /inbound travelers/i,
  /inbound FIT/i,
  /for inbound/i,
  /inbound hook/i,
  /inbound dining/i,
  /inbound onsen/i,
  /inbound stay/i,
  /\binbound\b/i,
];

function findResortDirs() {
  return readdirSync(root).filter((name) => {
    const full = join(root, name);
    return statSync(full).isDirectory() && name.endsWith("-lp");
  });
}

function scanText(text, label) {
  const hits = [];
  for (const phrase of JA_FORBIDDEN) {
    if (text.includes(phrase)) hits.push(`JA:「${phrase}」`);
  }
  for (const re of EN_FORBIDDEN) {
    const m = text.match(re);
    if (m) hits.push(`EN:${m[0]}`);
  }
  return hits;
}

function scanJson(filePath) {
  return scanText(readFileSync(filePath, "utf8"), filePath);
}

function scanHtml(filePath) {
  const html = readFileSync(filePath, "utf8");
  // Only user-visible fallbacks: between tags, meta content, title — skip script/src
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  return scanText(stripped, filePath);
}

let failed = false;

for (const dir of findResortDirs()) {
  for (const locale of ["ja.json", "en.json"]) {
    const filePath = join(root, dir, "messages", locale);
    if (!statSync(filePath).isFile()) continue;
    const hits = scanJson(filePath);
    if (hits.length) {
      failed = true;
      console.error(`\n✗ ${dir}/messages/${locale}`);
      for (const h of [...new Set(hits)]) console.error(`  ${h}`);
    }
  }
  for (const f of readdirSync(join(root, dir)).filter((n) => n.endsWith(".html"))) {
    const filePath = join(root, dir, f);
    const hits = scanHtml(filePath);
    if (hits.length) {
      failed = true;
      console.error(`\n✗ ${dir}/${f}`);
      for (const h of [...new Set(hits)]) console.error(`  ${h}`);
    }
  }
}

if (failed) {
  console.error("\nvalidate-mock-lp-copy: FAIL — see lp_mock_requirements.md §コピートーン");
  process.exit(1);
}
console.log("validate-mock-lp-copy: PASS");
