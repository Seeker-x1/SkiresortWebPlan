#!/usr/bin/env node
/**
 * Inject hotel affiliate IDs and sync deploy bundle to JAPOWSERCH.
 *
 * Config: configs/affiliates/hotels.json
 * Legacy: configs/affiliates/hotels-asahikawa.json (fallback marker only)
 * Env overrides: TRAVELPAYOUTS_MARKER, AGODA_CID, BOOKING_AID
 *
 * Usage:
 *   node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs
 *   node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs --check
 *   node docs/japow-chasers-guide/scripts/apply-hotel-affiliate-config.mjs --sync
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const CONFIG = join(root, "configs/affiliates/hotels.json");
const LEGACY_CONFIG = join(root, "configs/affiliates/hotels-asahikawa.json");
const HTML = join(root, "docs/japow-chasers-guide/preview-kit/hotel-compare.html");
const SHORTLIST_DIR = join(root, "configs/affiliates/hotel-shortlists");
const JAPOW_ROOT = join(root, "../JAPOWSERCH");
const DEPLOY_DIR = join(JAPOW_ROOT, "tools/hotel-compare");
const HUBS = ["asahikawa", "hakuba", "yuzawa"];

function loadEnvFile() {
  const envPath = join(root, ".env");
  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || line.trimStart().startsWith("#")) continue;
      const val = m[2].replace(/^["']|["']$/g, "").trim();
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  } catch {
    /* optional */
  }
}

function loadIds() {
  loadEnvFile();
  let cfg = {};
  try {
    cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
  } catch {
    try {
      cfg = JSON.parse(readFileSync(LEGACY_CONFIG, "utf8"));
    } catch {
      cfg = {};
    }
  }
  return {
    travelpayoutsMarker:
      process.env.TRAVELPAYOUTS_MARKER?.trim() ||
      cfg.travelpayoutsMarker?.trim() ||
      "",
    agodaCid: process.env.AGODA_CID?.trim() || cfg.agodaCid?.trim() || "",
    bookingAid: process.env.BOOKING_AID?.trim() || cfg.bookingAid?.trim() || "",
  };
}

function injectAff(html, ids) {
  const block = `      const AFF = {
        travelpayoutsMarker: "${ids.travelpayoutsMarker}",
        agodaCid: "${ids.agodaCid}",
        bookingAid: "${ids.bookingAid}",
      };`;
  if (!/const AFF = \{[\s\S]*?\};/m.test(html)) {
    throw new Error("AFF block not found in hotel-compare.html");
  }
  return html.replace(/const AFF = \{[\s\S]*?\};/m, block);
}

function syncDeploy(html, ids) {
  if (!existsSync(JAPOW_ROOT)) {
    console.warn("sync: JAPOWSERCH not found at", JAPOW_ROOT);
    return false;
  }
  const shortlistsDir = join(DEPLOY_DIR, "shortlists");
  mkdirSync(shortlistsDir, { recursive: true });

  let deployHtml = html.replace(
    'content="../../../configs/affiliates/hotel-shortlists/"',
    'content="./shortlists/"',
  );
  writeFileSync(join(DEPLOY_DIR, "index.html"), deployHtml, "utf8");

  writeFileSync(
    join(DEPLOY_DIR, "affiliate-config.json"),
    JSON.stringify(ids, null, 2) + "\n",
    "utf8",
  );

  for (const hub of HUBS) {
    copyFileSync(
      join(SHORTLIST_DIR, `${hub}.json`),
      join(shortlistsDir, `${hub}.json`),
    );
  }
  return true;
}

const checkOnly = process.argv.includes("--check");
const syncOnly = process.argv.includes("--sync");
const strict = process.argv.includes("--strict");
const ids = loadIds();
const required = strict
  ? ["travelpayoutsMarker", "agodaCid", "bookingAid"]
  : ["travelpayoutsMarker"];
const missing = required.filter((k) => !ids[k]);
const optionalMissing = ["agodaCid", "bookingAid"].filter((k) => !ids[k]);

if (checkOnly) {
  if (missing.length) {
    console.error("apply-hotel-affiliate-config: INCOMPLETE");
    for (const k of missing) console.error(`  missing ${k}`);
    console.error("");
    console.error("See docs/japow-chasers-guide/HOTEL_AFFILIATE_SETUP.md");
    process.exit(1);
  }
  if (optionalMissing.length && !strict) {
    console.warn("apply-hotel-affiliate-config: Phase 1 OK (marker only)");
    for (const k of optionalMissing) console.warn(`  optional missing ${k}`);
  } else {
    console.log("apply-hotel-affiliate-config: all IDs present");
  }
  process.exit(0);
}

let html = readFileSync(HTML, "utf8");
html = injectAff(html, ids);
writeFileSync(HTML, html, "utf8");

if (syncOnly || process.argv.includes("--sync")) {
  const ok = syncDeploy(html, ids);
  if (ok) console.log(`sync: wrote ${DEPLOY_DIR}`);
}

if (missing.length) {
  console.warn("apply-hotel-affiliate-config: wrote HTML but required IDs empty:");
  for (const k of missing) console.warn(`  - ${k}`);
  console.warn("Complete signup: docs/japow-chasers-guide/HOTEL_AFFILIATE_SETUP.md");
} else if (optionalMissing.length) {
  console.log(
    `apply-hotel-affiliate-config: OK — marker ${ids.travelpayoutsMarker} injected (Agoda/Booking direct IDs still empty)`,
  );
} else {
  console.log("apply-hotel-affiliate-config: OK — all IDs injected");
}

if (!process.argv.includes("--no-sync") && !syncOnly) {
  syncDeploy(html, ids);
}
