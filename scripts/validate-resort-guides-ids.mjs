#!/usr/bin/env node
/**
 * Fail if resort-guides.json maps a JAPOW id to the wrong facility.
 * Requires data/japow-resort-index.json (run sync-japow-resort-index.mjs).
 *
 * Usage: node scripts/validate-resort-guides-ids.mjs
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const INDEX_PATH = join(REPO_ROOT, "data", "japow-resort-index.json");
const GUIDES_PATH = join(REPO_ROOT, "data", "resort-guides.json");
const REGISTRY_PATH = join(REPO_ROOT, "docs", "mock-assets", "registry.json");

/** registryId → substring that must appear in JAPOW nameJa for that id */
const NAME_SUBSTRINGS = {
  asahigaoka: ["旭ヶ丘"],
  otoifuji: ["音威富士"],
  shimukappu: ["占冠"],
  "minami-furano": ["南ふらの"],
  biei: ["美瑛"],
  "abashiri-lv": ["網走レークビュー", "レークビュー"],
  unabetsu: ["ウナベツ"],
  kiyosato: ["清里", "緑スキー"],
  gokazan: ["五鹿山"],
  "sapporo-kokusai": ["札幌国際"],
  "sapporo-teine": ["テイネ", "サッポロテイネ"],
  pippu: ["ぴっぷ", "比布"],
  sichinohe: ["七戸"],
  tsunan: ["津南"],
  kirigamine: ["霧ヶ峰", "霧ケ峰"],
};

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalize(s) {
  return String(s).replace(/\s/g, "");
}

function nameMatches(japowNameJa, registryId) {
  const subs = NAME_SUBSTRINGS[registryId];
  if (!subs?.length) {
    return { ok: false, reason: `missing NAME_SUBSTRINGS for registryId "${registryId}"` };
  }
  const j = normalize(japowNameJa);
  const hit = subs.find((sub) => j.includes(normalize(sub)));
  if (!hit) {
    return {
      ok: false,
      reason: `JAPOW name「${japowNameJa}」does not contain any of [${subs.join(", ")}]`,
    };
  }
  return { ok: true };
}

function main() {
  if (!existsSync(INDEX_PATH)) {
    console.error(`✗ Missing ${INDEX_PATH} — run: node scripts/sync-japow-resort-index.mjs`);
    process.exit(1);
  }

  const index = loadJson(INDEX_PATH);
  const guides = loadJson(GUIDES_PATH);
  const registry = loadJson(REGISTRY_PATH);
  const errors = [];

  const guideEntries = Object.entries(guides.guides || {});
  const registryById = new Map(registry.resorts.map((r) => [r.id, r]));

  for (const [japowId, entry] of guideEntries) {
    const resort = index.resorts?.[japowId];
    if (!resort) {
      errors.push(`resort-guides id ${japowId} (${entry.registryId}): not in japow-resort-index`);
      continue;
    }

    const reg = registryById.get(entry.registryId);
    if (!reg) {
      errors.push(`resort-guides registryId "${entry.registryId}" not in registry.json`);
      continue;
    }

    if (Number(reg.japowResortId) !== Number(japowId)) {
      errors.push(
        `registry ${entry.registryId}: japowResortId=${reg.japowResortId} but resort-guides key is ${japowId}`,
      );
    }

    const nm = nameMatches(resort.nameJa, entry.registryId);
    if (!nm.ok) {
      errors.push(`id ${japowId} → ${entry.registryId}: ${nm.reason}`);
    }
  }

  for (const r of registry.resorts) {
    if (r.japowResortId == null) {
      errors.push(`registry ${r.id}: missing japowResortId`);
      continue;
    }
    const g = guides.guides[String(r.japowResortId)];
    if (!g) {
      errors.push(`registry ${r.id}: japowResortId ${r.japowResortId} missing from resort-guides.json`);
    } else if (g.registryId !== r.id) {
      errors.push(
        `registry ${r.id}: japowResortId ${r.japowResortId} maps to ${g.registryId} in resort-guides`,
      );
    }
  }

  const guideIds = new Set(guideEntries.map(([k]) => k));
  const registryIds = new Set(registry.resorts.map((r) => String(r.japowResortId)));
  for (const id of guideIds) {
    if (!registryIds.has(id)) {
      errors.push(`resort-guides id ${id} has no matching registry.japowResortId`);
    }
  }

  if (errors.length) {
    console.error("validate-resort-guides-ids: FAIL\n");
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(
      "\nFix: look up id in data/japow-resort-index.tsv (sync from JAPOWSERCH/RESORTS一覧.txt), then update data/resort-guides.json + registry.json together.",
    );
    process.exit(1);
  }

  console.log(`validate-resort-guides-ids: PASS (${guideEntries.length} mappings)`);
}

main();
