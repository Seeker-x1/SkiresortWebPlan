#!/usr/bin/env node
/**
 * Sync Skyticket rentacar: JA link copy on all LP locales + destination labels.
 * Source of truth: registry.json affiliates.rentacar → skyticket-rentacar.json
 *
 * Usage: node docs/mock-assets/scripts/sync-skyticket-rentacar-i18n.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mockRoot = join(__dirname, "..");
const repoRoot = join(mockRoot, "../..");

const CONFIG_PATHS = [
  join(mockRoot, "_shared/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "configs/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json"),
];

const REGISTRY_PATH = join(mockRoot, "registry.json");

const RENTACAR_KEYS = ["rentacarEyebrow", "rentacarLink", "rentacarNote", "rentacarHint"];

function firstSegment(text) {
  if (!text) return "";
  return text.split(/[·|｜]/)[0].trim();
}

export function buildRentacarCopy(resort, destination) {
  const labelJa = destination.label.ja;
  const regionJa = resort.region?.ja ?? "";
  const strategyJa = firstSegment(resort.strategy?.ja);
  const nameJa = resort.name?.ja ?? resort.id;

  const ja = {
    rentacarEyebrow: strategyJa || regionJa || "レンタカー",
    rentacarLink: `${labelJa}でレンタカー予約`,
    rentacarNote: "スカイチケット（外部サイト）",
    rentacarHint: `${nameJa}周辺のドライブ向け`,
  };

  return { ja, en: { ...ja } };
}

function patchConfig(config) {
  let changed = 0;
  for (const [id, dest] of Object.entries(config.destinations ?? {})) {
    if (!dest?.url) continue;
    for (const key of Object.keys(dest)) {
      if (!["url", "label"].includes(key)) {
        delete dest[key];
        changed++;
      }
    }
    if (!dest.label?.en) {
      throw new Error(`destination ${id}: missing label.en`);
    }
  }
  return changed;
}

function patchMessages(json, copy) {
  json.access = {
    ...json.access,
    ...copy,
  };
  return json;
}

function rentacarCopyMatches(access, expected) {
  return RENTACAR_KEYS.every((key) => access[key] === expected[key]);
}

function main() {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  const canonicalPath = CONFIG_PATHS[0];
  const config = JSON.parse(readFileSync(canonicalPath, "utf8"));

  const configChanges = patchConfig(config);
  const canonicalBody = `${JSON.stringify(config, null, 2)}\n`;
  for (const path of CONFIG_PATHS) {
    writeFileSync(path, canonicalBody, "utf8");
  }
  console.log(
    `✓ ${Object.keys(config.destinations).length} destinations (${configChanges} config field(s) cleaned)`,
  );

  let updated = 0;
  let skipped = 0;

  for (const resort of registry.resorts) {
    const destId = resort.affiliates?.rentacar;
    if (!destId) continue;

    const destination = config.destinations[destId];
    if (!destination) {
      console.error(`✗ ${resort.id}: unknown destination ${destId}`);
      process.exit(1);
    }

    const copy = buildRentacarCopy(resort, destination);
    const msgDir = join(mockRoot, resort.slug, "messages");

    for (const locale of ["ja", "en"]) {
      const msgPath = join(msgDir, `${locale}.json`);
      if (!existsSync(msgPath)) continue;

      const json = JSON.parse(readFileSync(msgPath, "utf8"));
      const current = json.access ?? {};

      if (!rentacarCopyMatches(current, copy.ja)) {
        writeFileSync(
          msgPath,
          `${JSON.stringify(patchMessages(json, copy.ja), null, 2)}\n`,
          "utf8",
        );
        updated++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`✓ messages: ${updated} file(s) updated, ${skipped} unchanged`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
