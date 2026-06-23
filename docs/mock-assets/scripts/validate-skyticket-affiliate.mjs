#!/usr/bin/env node
/**
 * Keeps Skyticket rentacar affiliate config in sync across mock LPs and resort web apps.
 * Usage: node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const mockRoot = join(repoRoot, "docs/mock-assets");

const CONFIG_PATHS = [
  join(mockRoot, "_shared/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "configs/affiliates/skyticket-rentacar.json"),
  join(
    repoRoot,
    "resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json",
  ),
];

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

let failed = false;
const canonical = JSON.stringify(loadJson(CONFIG_PATHS[0]));

for (const path of CONFIG_PATHS.slice(1)) {
  const body = JSON.stringify(loadJson(path));
  if (body !== canonical) {
    failed = true;
    console.error(`✗ skyticket-rentacar.json out of sync: ${path}`);
  }
}

const registry = loadJson(join(mockRoot, "registry.json"));
const config = loadJson(CONFIG_PATHS[0]);
for (const resort of registry.resorts) {
  const dest = resort.affiliates?.rentacar;
  if (!dest) {
    failed = true;
    console.error(`✗ registry ${resort.id}: missing affiliates.rentacar`);
    continue;
  }
  if (!config.destinations?.[dest]) {
    failed = true;
    console.error(
      `✗ registry ${resort.id}: unknown affiliates.rentacar "${dest}"`,
    );
  }
}

for (const dir of readdirSync(mockRoot).filter((n) => n.endsWith("-lp"))) {
  const htmlPath = join(mockRoot, dir, "index.html");
  if (!statSync(htmlPath).isFile()) continue;
  const html = readFileSync(htmlPath, "utf8");
  const resortId = html.match(/data-mock-resort="([^"]+)"/)?.[1];
  const resort = registry.resorts.find((r) => r.id === resortId);
  if (!resort?.affiliates?.rentacar) continue;

  const checks = [
    ["skyticket-rentacar.js", /skyticket-rentacar\.js/],
    ["rentacar-link.css", /affiliates\/rentacar-link\.css/],
    ["data-skyticket-rentacar-link", /data-skyticket-rentacar-link/],
    ["data-skyticket-rentacar-block", /data-skyticket-rentacar-block/],
  ];
  for (const [name, re] of checks) {
    if (!re.test(html)) {
      failed = true;
      console.error(`✗ ${dir}: missing ${name}`);
    }
  }
  if (/valuecommerce\.com/.test(html)) {
    failed = true;
    console.error(`✗ ${dir}: hardcoded ValueCommerce URL (use template)`);
  }
}

if (failed) {
  console.error("\nSkyticket affiliate validation FAILED");
  process.exit(1);
}

console.log("✓ skyticket-rentacar configs in sync");
console.log("✓ registry destinations valid");
console.log("✓ LP affiliate wiring OK");
console.log("\nValidation PASSED");
