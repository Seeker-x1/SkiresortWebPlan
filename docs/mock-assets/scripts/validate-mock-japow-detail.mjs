#!/usr/bin/env node
/**
 * Validates LP ↔ JAPOW「詳細確認」連携契約.
 *
 * Usage:
 *   node docs/mock-assets/scripts/validate-mock-japow-detail.mjs          # source (mock-assets + data/)
 *   node docs/mock-assets/scripts/validate-mock-japow-detail.mjs --public # guides/public after sync
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const MOCK_ROOT = join(REPO_ROOT, "docs", "mock-assets");
const GUIDES_PUBLIC = join(REPO_ROOT, "guides", "public");
const HOST = "https://guides.japowserch.com";
const checkPublic = process.argv.includes("--public");

const require = createRequire(import.meta.url);

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function guideUrl(registryId, locale = "ja") {
  const base = `${HOST}/${registryId}/`;
  return locale === "en" ? `${base}?lang=en` : base;
}

function simulateGetResortGuideUrl(japowId, resortGuides, locale = "ja") {
  const g = resortGuides.guides?.[String(japowId)];
  if (!g?.registryId) return null;
  const base = (resortGuides.baseUrl || HOST).replace(/\/$/, "");
  const q = locale === "en" ? "?lang=en" : "";
  return `${base}/${g.registryId}/${q}`;
}

function validateSource() {
  const errors = [];
  const registryPath = join(MOCK_ROOT, "registry.json");
  const guidesPath = join(REPO_ROOT, "data", "resort-guides.json");
  const helperPath = join(REPO_ROOT, "data", "resort-guides.js");

  if (!existsSync(registryPath)) errors.push("missing docs/mock-assets/registry.json");
  if (!existsSync(guidesPath)) errors.push("missing data/resort-guides.json");
  if (!existsSync(helperPath)) errors.push("missing data/resort-guides.js");
  if (errors.length) return errors;

  const registry = loadJson(registryPath);
  const resortGuides = loadJson(guidesPath);
  const guideEntries = Object.entries(resortGuides.guides || {});
  const registryById = new Map(registry.resorts.map((r) => [r.id, r]));

  if (resortGuides.baseUrl !== HOST) {
    errors.push(`resort-guides.json baseUrl must be ${HOST} (got ${resortGuides.baseUrl})`);
  }

  for (const resort of registry.resorts) {
    const lpIndex = join(MOCK_ROOT, resort.slug, "index.html");
    if (!existsSync(lpIndex)) {
      errors.push(`registry ${resort.id}: missing ${resort.slug}/index.html`);
    }

    const japowId = resort.japowResortId;
    if (japowId == null) {
      errors.push(`registry ${resort.id}: missing japowResortId`);
      continue;
    }

    const g = resortGuides.guides[String(japowId)];
    if (!g) {
      errors.push(`registry ${resort.id}: japowResortId ${japowId} not in resort-guides.json`);
      continue;
    }
    if (g.registryId !== resort.id) {
      errors.push(
        `registry ${resort.id}: resort-guides[${japowId}].registryId=${g.registryId}`,
      );
    }

    const expectedJa = guideUrl(resort.id, "ja");
    const expectedEn = guideUrl(resort.id, "en");
    if (resort.guideUrl && resort.guideUrl !== expectedJa) {
      errors.push(`registry ${resort.id}: guideUrl=${resort.guideUrl} expected ${expectedJa}`);
    }
    if (resort.guidePath && resort.guidePath !== `/${resort.id}/`) {
      errors.push(`registry ${resort.id}: guidePath=${resort.guidePath} expected /${resort.id}/`);
    }

    const simJa = simulateGetResortGuideUrl(japowId, resortGuides, "ja");
    const simEn = simulateGetResortGuideUrl(japowId, resortGuides, "en");
    if (simJa !== expectedJa) {
      errors.push(`getResortGuideUrl(${japowId}) ja=${simJa} expected ${expectedJa}`);
    }
    if (simEn !== expectedEn) {
      errors.push(`getResortGuideUrl(${japowId}) en=${simEn} expected ${expectedEn}`);
    }
  }

  for (const [japowId, entry] of guideEntries) {
    if (!registryById.has(entry.registryId)) {
      errors.push(`resort-guides[${japowId}]: unknown registryId ${entry.registryId}`);
    }
  }

  const registryJapowIds = new Set(
    registry.resorts.filter((r) => r.japowResortId != null).map((r) => String(r.japowResortId)),
  );
  for (const [japowId] of guideEntries) {
    if (!registryJapowIds.has(japowId)) {
      errors.push(`resort-guides id ${japowId} has no registry.japowResortId`);
    }
  }

  return errors;
}

function validatePublic() {
  const errors = [];
  const publicRoot = GUIDES_PUBLIC;
  if (!existsSync(join(publicRoot, "registry.json"))) {
    return ["guides/public missing — run: node guides/scripts/sync.mjs"];
  }

  const registry = loadJson(join(publicRoot, "registry.json"));
  const resortGuides = loadJson(join(publicRoot, "resort-guides.json"));

  if (!existsSync(join(publicRoot, "resort-guides.js"))) {
    errors.push("guides/public/resort-guides.js missing (sync should copy data/resort-guides.js)");
  }

  if (!registry.indexByJapowResortId || typeof registry.indexByJapowResortId !== "object") {
    errors.push("public/registry.json missing indexByJapowResortId");
  }

  for (const resort of registry.resorts) {
    const lpDir = join(publicRoot, resort.id, "index.html");
    if (!existsSync(lpDir)) {
      errors.push(`public/${resort.id}/index.html missing`);
    }

    const japowKey = String(resort.japowResortId);
    if (registry.indexByJapowResortId?.[japowKey] !== resort.id) {
      errors.push(
        `indexByJapowResortId[${japowKey}] expected ${resort.id} got ${registry.indexByJapowResortId?.[japowKey]}`,
      );
    }

    const expectedJa = guideUrl(resort.id, "ja");
    const expectedEn = guideUrl(resort.id, "en");
    if (resort.guideUrl !== expectedJa) {
      errors.push(`public registry ${resort.id}: guideUrl mismatch`);
    }
    if (resort.guideUrlEn !== expectedEn) {
      errors.push(`public registry ${resort.id}: guideUrlEn mismatch`);
    }

    const js = resort.japowserch;
    if (!js || js.detailButtonTarget !== "guideUrl" || js.registryId !== resort.id) {
      errors.push(`public registry ${resort.id}: japowserch contract incomplete`);
    }

    const g = resortGuides.guides?.[japowKey];
    if (!g || g.registryId !== resort.id) {
      errors.push(`public resort-guides[${japowKey}] registryId mismatch`);
    }
    if (g?.guideUrl && g.guideUrl !== expectedJa) {
      errors.push(`public resort-guides[${japowKey}].guideUrl mismatch`);
    }
  }

  // UMD helper matches JSON
  try {
    const ResortGuides = require(join(publicRoot, "resort-guides.js"));
    for (const resort of registry.resorts) {
      const url = ResortGuides.getResortGuideUrl(resort.japowResortId, resortGuides);
      if (url !== guideUrl(resort.id, "ja")) {
        errors.push(`ResortGuides.getResortGuideUrl(${resort.japowResortId}) mismatch`);
      }
    }
  } catch (e) {
    errors.push(`resort-guides.js load failed: ${e.message}`);
  }

  return errors;
}

function main() {
  const errors = checkPublic ? validatePublic() : validateSource();
  const label = checkPublic ? "validate-mock-japow-detail (--public)" : "validate-mock-japow-detail";

  if (errors.length) {
    console.error(`${label}: FAIL\n`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error("\nSee docs/mock-assets/JAPOW_DETAIL_INTEGRATION.md");
    process.exit(1);
  }

  const registry = loadJson(
    join(checkPublic ? GUIDES_PUBLIC : MOCK_ROOT, "registry.json"),
  );
  console.log(`${label}: PASS (${registry.resorts.length} resorts)`);
}

main();
