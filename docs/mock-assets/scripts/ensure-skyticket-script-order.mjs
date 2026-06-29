#!/usr/bin/env node
/**
 * mock-i18n must load before skyticket-rentacar.js so locale + mock-i18n-ready fire first.
 * Usage: node docs/mock-assets/scripts/ensure-skyticket-script-order.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

export function ensureSkyticketScriptOrder(html) {
  const wrongOrder =
    /<script src="([^"]*skyticket-rentacar\.js)"><\/script>\s*<script src="([^"]*mock-i18n\.js)"><\/script>/g;
  return html.replace(
    wrongOrder,
    '<script src="$2"></script>\n  <script src="$1"></script>',
  );
}

function main() {
  const mockRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  let fixed = 0;

  for (const dir of readdirSync(mockRoot).filter((n) => n.endsWith("-lp"))) {
    const htmlPath = join(mockRoot, dir, "index.html");
    const html = readFileSync(htmlPath, "utf8");
    if (!html.includes("skyticket-rentacar.js")) continue;
    const next = ensureSkyticketScriptOrder(html);
    if (next !== html) {
      writeFileSync(htmlPath, next, "utf8");
      fixed += 1;
      console.log(`✓ ${dir}`);
    }
  }

  console.log(
    fixed
      ? `Fixed script order in ${fixed} LP(s)`
      : "All LPs already have correct script order",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
