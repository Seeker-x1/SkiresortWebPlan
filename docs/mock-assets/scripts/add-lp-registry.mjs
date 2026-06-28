#!/usr/bin/env node
/**
 * Add registry + resort-guides entries for a mock LP (idempotent).
 * Usage: node docs/mock-assets/scripts/add-lp-registry.mjs --id tono-akabane --japow 117 --nameJa "..." --nameEn "..." --regionJa "..." --regionEn "..." --strategyJa "..." --strategyEn "..." --rentacar morioka_station
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const registryPath = join(root, "docs/mock-assets/registry.json");
const guidesPath = join(root, "data/resort-guides.json");

function parseArgs() {
  const opts = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      opts[key] = args[++i];
    }
  }
  if (!opts.id || !opts.japow) {
    console.error("Usage: add-lp-registry.mjs --id {id} --japow {n} [--nameJa ...] [--rentacar ...]");
    process.exit(1);
  }
  return opts;
}

const opts = parseArgs();
const id = opts.id;
const japow = Number(opts.japow);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (registry.resorts.some((r) => r.id === id)) {
  console.log(`registry: ${id} already exists`);
} else {
  registry.resorts.push({
    id,
    slug: `${id}-lp`,
    name: { ja: opts.nameJa || id, en: opts.nameEn || id },
    region: { ja: opts.regionJa || "", en: opts.regionEn || "" },
    strategy: { ja: opts.strategyJa || "", en: opts.strategyEn || "" },
    guidePath: `/${id}/`,
    guideUrl: `https://guides.japowserch.com/${id}/`,
    japowResortId: japow,
    guideTier: "mock",
    affiliates: opts.rentacar ? { rentacar: opts.rentacar } : undefined,
  });
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`✓ registry + ${id}`);
}

const guides = JSON.parse(readFileSync(guidesPath, "utf8"));
const key = String(japow);
if (guides.guides[key]) {
  console.log(`resort-guides: ${key} already mapped`);
} else {
  guides.guides[key] = { registryId: id, tier: "mock" };
  writeFileSync(guidesPath, `${JSON.stringify(guides, null, 2)}\n`, "utf8");
  console.log(`✓ resort-guides ${key} → ${id}`);
}
