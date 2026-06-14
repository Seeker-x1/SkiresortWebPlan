#!/usr/bin/env node
/** Remove mock-banner, footer.credit from resort LP HTML */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function stripHtml(html) {
  return html
    .replace(/<p class="mock-banner">[\s\S]*?<\/p>\s*/g, "")
    .replace(/\s*<p data-i18n="footer\.credit">[\s\S]*?<\/p>/g, "")
    .replace(/\s*<p class="note" data-i18n="note">[\s\S]*?<\/p>/g, "");
}

for (const dir of readdirSync(ROOT).filter((d) => d.endsWith("-lp"))) {
  const path = join(ROOT, dir, "index.html");
  writeFileSync(path, stripHtml(readFileSync(path, "utf8")), "utf8");
  console.log(`✓ ${dir}/index.html`);
}
