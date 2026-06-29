#!/usr/bin/env node
/**
 * Keeps Skyticket rentacar affiliate config in sync across mock LPs and resort web apps.
 * Usage: node docs/mock-assets/scripts/validate-skyticket-affiliate.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buildRentacarCopy, deriveUrlEn } from "./sync-skyticket-rentacar-i18n.mjs";
import { ensureSkyticketScriptOrder } from "./ensure-skyticket-script-order.mjs";

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

const RENTACAR_KEYS = ["rentacarEyebrow", "rentacarLink", "rentacarNote", "rentacarHint"];

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function linkMatchesLabel(link, labelEn) {
  if (!link || !labelEn) return false;
  const tokens = labelEn.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
  return tokens.some((t) => link.includes(t));
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

for (const [id, dest] of Object.entries(config.destinations ?? {})) {
  if (!dest?.url) {
    failed = true;
    console.error(`✗ destination ${id}: missing url`);
    continue;
  }
  if (!dest.urlEn) {
    failed = true;
    console.error(`✗ destination ${id}: missing urlEn (run sync-skyticket-rentacar-i18n.mjs)`);
  } else if (!dest.urlEn.startsWith("https://skyticket.jp/en/rentacar/")) {
    failed = true;
    console.error(`✗ destination ${id}: urlEn must be skyticket.jp/en/rentacar/...`);
  }
  if (!dest.label?.ja || !dest.label?.en) {
    failed = true;
    console.error(`✗ destination ${id}: missing label.ja or label.en`);
  }
  for (const key of Object.keys(dest)) {
    if (!["url", "urlEn", "label"].includes(key)) {
      failed = true;
      console.error(`✗ destination ${id}: unexpected field "${key}"`);
    }
  }
}

for (const resort of registry.resorts) {
  const destId = resort.affiliates?.rentacar;
  if (!destId) {
    failed = true;
    console.error(`✗ registry ${resort.id}: missing affiliates.rentacar`);
    continue;
  }
  const destination = config.destinations?.[destId];
  if (!destination) {
    failed = true;
    console.error(`✗ registry ${resort.id}: unknown affiliates.rentacar "${destId}"`);
    continue;
  }

  const expected = buildRentacarCopy(resort, destination);
  for (const locale of ["ja", "en"]) {
    const msgPath = join(mockRoot, resort.slug, "messages", `${locale}.json`);
    if (!existsSync(msgPath)) {
      failed = true;
      console.error(`✗ ${resort.slug}: missing messages/${locale}.json`);
      continue;
    }
    const json = loadJson(msgPath);
    const access = json.access ?? {};
    for (const key of RENTACAR_KEYS) {
      if (!access[key]) {
        failed = true;
        console.error(`✗ ${resort.id} ${locale}: missing access.${key}`);
      }
    }
    if (locale === "en") {
      if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(access.rentacarLink ?? "")) {
        failed = true;
        console.error(`✗ ${resort.id} en: rentacarLink contains Japanese`);
      }
      if (!linkMatchesLabel(access.rentacarLink, destination.label.en)) {
        failed = true;
        console.error(
          `✗ ${resort.id} en: rentacarLink must mention "${destination.label.en}"`,
        );
      }
      if (access.rentacarNote !== expected.en.rentacarNote) {
        failed = true;
        console.error(`✗ ${resort.id} en: rentacarNote must be "${expected.en.rentacarNote}"`);
      }
    }
    if (locale === "ja" && access.rentacarLink !== expected.ja.rentacarLink) {
      failed = true;
      console.error(
        `✗ ${resort.id} ja: rentacarLink must be "${expected.ja.rentacarLink}"`,
      );
    }
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
  if (ensureSkyticketScriptOrder(html) !== html) {
    failed = true;
    console.error(
      `✗ ${dir}: mock-i18n.js must load before skyticket-rentacar.js (run ensure-skyticket-script-order.mjs)`,
    );
  }
}

if (failed) {
  console.error("\nSkyticket affiliate validation FAILED");
  console.error("Fix: node docs/mock-assets/scripts/sync-skyticket-rentacar-i18n.mjs");
  process.exit(1);
}

console.log("✓ skyticket-rentacar configs in sync");
console.log(`✓ ${Object.keys(config.destinations).length} destinations with urlEn + label.en`);
console.log(`✓ ${registry.resorts.length} resorts — ja/en rentacar copy aligned`);
console.log("✓ LP affiliate wiring OK");
console.log("\nValidation PASSED");
