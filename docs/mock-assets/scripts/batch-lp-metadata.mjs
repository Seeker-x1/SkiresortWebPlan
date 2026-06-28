#!/usr/bin/env node
/**
 * Batch LP metadata scaffold: registry + resort-guides + map JSON + image slot report.
 *
 * Usage:
 *   node docs/mock-assets/scripts/batch-lp-metadata.mjs --id banjoga
 *   node docs/mock-assets/scripts/batch-lp-metadata.mjs --list-remaining
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../..");
const MOCK_ASSETS = join(REPO_ROOT, "docs/mock-assets");
const BATCH_PATH = join(REPO_ROOT, "configs/lp-batch/batch-31-50.json");
const BRIEF_DIR = join(REPO_ROOT, "configs/lp-brief");
const REGISTRY_PATH = join(MOCK_ASSETS, "registry.json");
const GUIDES_PATH = join(REPO_ROOT, "data/resort-guides.json");
const MAPS_DIR = join(MOCK_ASSETS, "data/maps");
const MAP_TEMPLATE_PATH = join(MAPS_DIR, "abirayama.json");
const JAPOW_INDEX_PATH = join(REPO_ROOT, "data/japow-resort-index.json");

/** Remaining batch-31-50 resorts (no {id}-lp/ yet) → Skyticket rentacar destination key */
export const RENTACAR_MAP = {
  banjoga: "kamisuwa_kirigamine_kogen",
  wakamatsu: "memanbetsu_airport",
  hirogawara: "kansai_international_airport",
  "nanao-korosa": "komatsu_airport_kanazawa",
  bifuka: "asahikawa_airport",
  koyasan: "kansai_international_airport",
  kyowa: "shinjo_station",
  "ringo-kyowagoku": "yamaguchi_ube_airport",
  "chateau-shiozawa": "niigata_airport",
  "morioka-ikari": "morioka_station",
  kaneyama: "shinjo_station",
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { listRemaining: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--id") opts.id = args[++i];
    else if (a === "--list-remaining") opts.listRemaining = true;
    else if (a.startsWith("--id=")) opts.id = a.slice(5);
  }
  if (!opts.id && !opts.listRemaining) {
    console.error("Usage: batch-lp-metadata.mjs --id {registry-id}");
    console.error("       batch-lp-metadata.mjs --list-remaining");
    process.exit(1);
  }
  return opts;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readBrief(id) {
  const path = join(BRIEF_DIR, `${id}.yaml`);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf8");
  const pick = (re) => text.match(re)?.[1]?.trim() ?? "";
  return {
    path,
    regionEn: pick(/^\s*en:\s*(.+)$/m),
    strategyJa: pick(/strategy:\s*\n\s*ja:\s*(.+)/),
    strategyEn: pick(/strategy:\s*\n[\s\S]*?\s*en:\s*(.+)/),
    copyFrom: pick(/copyFrom:\s*(\S+)/),
  };
}

function normalize(s) {
  return String(s).replace(/\s/g, "");
}

/** Default substring candidates from JAPOW nameJa (mirrors validate-resort-guides-ids.mjs). */
function suggestNameSubstrings(nameJa) {
  let core = normalize(nameJa);
  for (const suffix of ["スキー場", "スキー荘", "スキー園", "スキーリゾート", "スキー"]) {
    if (core.endsWith(suffix)) {
      core = core.slice(0, -suffix.length);
      break;
    }
  }
  if (core.length < 2) core = normalize(nameJa);
  return [core];
}

function formatNameSubstringsEntry(registryId, subs) {
  const key = registryId.includes("-") ? `"${registryId}"` : registryId;
  const quoted = subs.map((s) => JSON.stringify(s)).join(", ");
  return `  ${key}: [${quoted}],`;
}

function getBatchResort(id) {
  const batch = loadJson(BATCH_PATH);
  const resort = batch.resorts.find((r) => r.id === id);
  if (!resort) {
    console.error(`✗ ${id} not found in ${BATCH_PATH}`);
    process.exit(1);
  }
  return resort;
}

function listExistingLpIds() {
  return readdirSync(MOCK_ASSETS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.endsWith("-lp"))
    .map((d) => d.name.replace(/-lp$/, ""));
}

function getRemainingBatchResorts() {
  const batch = loadJson(BATCH_PATH);
  const existing = new Set(listExistingLpIds());
  return batch.resorts.filter((r) => !existing.has(r.id));
}

function resolveCopyFrom(resort, brief) {
  const hint = brief?.copyFrom || resort.copyFromHint || "";
  const slug = hint.endsWith("-lp") ? hint : `${hint.replace(/-lp$/, "")}-lp`;
  return slug;
}

function listImageSlots(id, copyFromSlug) {
  const templateDir = join(MOCK_ASSETS, copyFromSlug);
  if (!existsSync(templateDir)) {
    return { copyFrom: copyFromSlug, slots: [], error: `template not found: ${copyFromSlug}` };
  }
  const sourceId = copyFromSlug.replace(/-lp$/, "");
  const prefix = `lp-mock-${sourceId}-`;
  const slots = readdirSync(templateDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".png"))
    .map((name) => name.replace(`lp-mock-${sourceId}-`, `lp-mock-${id}-`))
    .sort();
  slots.unshift(`images/maps/${id}-hero.png`);
  return { copyFrom: copyFromSlug, sourceId, slots };
}

function addRegistryEntry(registry, resort, brief, rentacar) {
  if (registry.resorts.some((r) => r.id === resort.id)) {
    console.log(`registry: ${resort.id} already exists (skip)`);
    return false;
  }
  const strategyJa = brief?.strategyJa || resort.salesAngle || "";
  const strategyEn = brief?.strategyEn || "";
  const regionEn = brief?.regionEn || "";
  registry.resorts.push({
    id: resort.id,
    slug: `${resort.id}-lp`,
    name: { ja: resort.nameJa, en: resort.nameEn },
    region: { ja: resort.regionJa, en: regionEn },
    strategy: { ja: strategyJa, en: strategyEn },
    guidePath: `/${resort.id}/`,
    guideUrl: `https://guides.japowserch.com/${resort.id}/`,
    japowResortId: resort.japowResortId,
    guideTier: "mock",
    affiliates: rentacar ? { rentacar } : undefined,
  });
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`✓ registry + ${resort.id}`);
  return true;
}

function addResortGuidesEntry(guides, resort) {
  const key = String(resort.japowResortId);
  if (guides.guides[key]) {
    console.log(`resort-guides: ${key} already mapped → ${guides.guides[key].registryId} (skip)`);
    return false;
  }
  guides.guides[key] = { registryId: resort.id, tier: "mock" };
  writeFileSync(GUIDES_PATH, `${JSON.stringify(guides, null, 2)}\n`, "utf8");
  console.log(`✓ resort-guides ${key} → ${resort.id}`);
  return true;
}

function createMapJson(resort, brief) {
  const mapPath = join(MAPS_DIR, `${resort.id}.json`);
  if (existsSync(mapPath)) {
    console.log(`map JSON: ${resort.id}.json already exists (skip)`);
    return false;
  }
  const template = loadJson(MAP_TEMPLATE_PATH);
  const sources = [
    `LP batch #${resort.rank}`,
    `configs/lp-batch/batch-31-50.json`,
  ];
  if (brief?.path) sources.push(brief.path.replace(/\\/g, "/").replace(/^.*configs\//, "configs/"));
  const now = new Date();
  const updatedAt = `${now.toISOString().slice(0, 10)}T12:00:00+09:00`;
  const map = {
    ...template,
    id: resort.id,
    name: { ja: resort.nameJa, en: resort.nameEn },
    sources,
    updatedAt,
    hero: {
      ...template.hero,
      src: `images/maps/${resort.id}-hero.png`,
    },
  };
  writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`, "utf8");
  console.log(`✓ map JSON data/maps/${resort.id}.json`);
  return true;
}

function printImageSlotsReport(resort, brief) {
  const copyFrom = resolveCopyFrom(resort, brief);
  const report = listImageSlots(resort.id, copyFrom);
  console.log("\n--- image slots ---");
  console.log(`copyFrom: ${report.copyFrom}`);
  if (report.error) {
    console.log(`⚠ ${report.error}`);
    return report;
  }
  for (const slot of report.slots) console.log(`  ${slot}`);
  return report;
}

function printNameSubstringsSuggestion(resort) {
  const index = loadJson(JAPOW_INDEX_PATH);
  const japow = index.resorts?.[String(resort.japowResortId)];
  if (!japow?.nameJa) {
    console.log(`\n--- NAME_SUBSTRINGS ---`);
    console.log(`⚠ japow id ${resort.japowResortId} not in index`);
    return null;
  }
  const subs = suggestNameSubstrings(japow.nameJa);
  console.log("\n--- NAME_SUBSTRINGS (add to scripts/validate-resort-guides-ids.mjs) ---");
  console.log(
    `${formatNameSubstringsEntry(resort.id, subs)}  // id ${resort.japowResortId} · JAPOW「${japow.nameJa}」`,
  );
  return { registryId: resort.id, japowId: resort.japowResortId, nameJa: japow.nameJa, subs };
}

function processResort(id, { write = true } = {}) {
  const resort = getBatchResort(id);
  const brief = readBrief(id);
  const rentacar = RENTACAR_MAP[id];
  if (!rentacar && getRemainingBatchResorts().some((r) => r.id === id)) {
    console.warn(`⚠ no RENTACAR_MAP entry for ${id}`);
  }

  console.log(`\n=== ${resort.id} (batch #${resort.rank}) ===`);
  console.log(`japowResortId: ${resort.japowResortId}`);
  console.log(`rentacar: ${rentacar ?? "(none)"}`);

  if (write) {
    const registry = loadJson(REGISTRY_PATH);
    addRegistryEntry(registry, resort, brief, rentacar);
    const guides = loadJson(GUIDES_PATH);
    addResortGuidesEntry(guides, resort);
    createMapJson(resort, brief);
  }

  const imageReport = printImageSlotsReport(resort, brief);
  const nameSuggestion = printNameSubstringsSuggestion(resort);
  return { resort, rentacar, imageReport, nameSuggestion };
}

function printRemainingSummary() {
  const remaining = getRemainingBatchResorts();
  console.log(`batch-31-50 remaining: ${remaining.length} resorts\n`);
  const summary = [];
  for (const resort of remaining) {
    const result = processResort(resort.id, { write: false });
    summary.push({
      id: resort.id,
      rank: resort.rank,
      japowResortId: resort.japowResortId,
      rentacar: RENTACAR_MAP[resort.id] ?? null,
      copyFrom: result.imageReport.copyFrom,
      imageSlots: result.imageReport.slots ?? [],
      nameSubstrings: result.nameSuggestion?.subs ?? [],
    });
  }
  return summary;
}

const opts = parseArgs();

if (opts.listRemaining) {
  printRemainingSummary();
} else {
  processResort(opts.id);
}
