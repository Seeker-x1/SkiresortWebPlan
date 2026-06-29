#!/usr/bin/env node
/**
 * Sync Skyticket rentacar: urlEn on destinations + per-resort ja/en access copy.
 * Source of truth: registry.json affiliates.rentacar → skyticket-rentacar.json
 *
 * Usage: node docs/mock-assets/scripts/sync-skyticket-rentacar-i18n.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mockRoot = join(__dirname, "..");
const repoRoot = join(mockRoot, "../..");

const CONFIG_PATHS = [
  join(mockRoot, "_shared/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "configs/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json"),
];

const REGISTRY_PATH = join(mockRoot, "registry.json");

export function deriveUrlEn(jaUrl) {
  const parsed = new URL(jaUrl);
  if (!parsed.pathname.startsWith("/en/")) {
    parsed.pathname = `/en${parsed.pathname}`;
  }
  return parsed.href;
}

function firstSegment(text) {
  if (!text) return "";
  return text.split(/[·|｜]/)[0].trim();
}

export function buildRentacarCopy(resort, destination) {
  const labelJa = destination.label.ja;
  const labelEn = destination.label.en;
  const regionJa = resort.region?.ja ?? "";
  const regionEn = resort.region?.en ?? "";
  const strategyJa = firstSegment(resort.strategy?.ja);
  const strategyEn = firstSegment(resort.strategy?.en);
  const nameJa = resort.name?.ja ?? resort.id;
  const nameEn = resort.name?.en ?? resort.id;

  return {
    ja: {
      rentacarEyebrow: strategyJa || regionJa || "レンタカー",
      rentacarLink: `${labelJa}でレンタカー予約`,
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: `${nameJa}周辺のドライブ向け`,
    },
    en: {
      rentacarEyebrow: strategyEn || regionEn || "Rental car",
      rentacarLink: `Book a rental car at ${labelEn}`,
      rentacarNote: "Skyticket (external site)",
      rentacarHint: `For ${nameEn} and surrounding drives`,
    },
  };
}

function linkMatchesLabel(link, labelEn) {
  if (!link || !labelEn) return false;
  const tokens = labelEn.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
  return tokens.some((t) => link.includes(t));
}

function patchConfig(config) {
  let changed = 0;
  for (const [id, dest] of Object.entries(config.destinations ?? {})) {
    if (!dest?.url) continue;
    for (const key of Object.keys(dest)) {
      if (!["url", "urlEn", "label"].includes(key)) {
        delete dest[key];
        changed++;
      }
    }
    if (!dest.urlEn) {
      dest.urlEn = deriveUrlEn(dest.url);
      changed++;
    }
    if (!dest.label?.en) {
      throw new Error(`destination ${id}: missing label.en`);
    }
  }
  return changed;
}

function patchMessages(json, copy, locale) {
  json.access = {
    ...json.access,
    ...copy[locale],
  };
  return json;
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
  console.log(`✓ urlEn on ${Object.keys(config.destinations).length} destinations (${configChanges} added)`);

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
      const next = copy[locale];

      const needsUpdate =
        locale === "en"
          ? !linkMatchesLabel(current.rentacarLink, destination.label.en) ||
            current.rentacarNote !== next.rentacarNote ||
            /[\u3040-\u30ff\u4e00-\u9fff]/.test(current.rentacarLink ?? "")
          : current.rentacarLink !== next.rentacarLink ||
            current.rentacarNote !== next.rentacarNote;

      if (needsUpdate) {
        writeFileSync(msgPath, `${JSON.stringify(patchMessages(json, copy, locale), null, 2)}\n`, "utf8");
        updated++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`✓ messages: ${updated} file(s) updated, ${skipped} unchanged`);
}

import { pathToFileURL } from "url";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
