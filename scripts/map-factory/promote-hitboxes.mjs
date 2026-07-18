#!/usr/bin/env node
/**
 * Merge Map Factory hitboxes into guides mock map JSON (LP map viewer).
 * Usage: node scripts/map-factory/promote-hitboxes.mjs --id sapporo-kokusai
 */
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  dataDir,
  parseArgs,
  publicMapsDir,
  readJson,
  writeJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const id = args.id;
if (!id) {
  console.error("Usage: --id <resort-id>");
  process.exit(1);
}

const data = dataDir(id);
const hit = readJson(path.join(data, "hitboxes-hero.json"));
const status = readJson(path.join(data, "status.json"));
const signoff = readJson(path.join(data, "signoff.json"));
const manifest = readJson(path.join(data, "features.manifest.json"));

if (!hit?.features?.length) {
  console.error("No hitboxes features");
  process.exit(1);
}
if (signoff?.visual_ok !== true) {
  console.error("signoff.visual_ok must be true before promote");
  process.exit(1);
}

const guidesMapPath = path.join(
  ROOT,
  "docs",
  "mock-assets",
  "data",
  "maps",
  `${id}.json`,
);
const guidesMap = readJson(guidesMapPath);
if (!guidesMap) {
  console.error("Missing guides map JSON:", guidesMapPath);
  process.exit(1);
}

const pathById = Object.fromEntries(
  hit.features.map((f) => [f.id, { path: f.path, stations: f.stations || [] }]),
);

const difficultyColor = {
  advanced: "#1a1a1a",
  intermediate: "#d62839",
  beginner: "#2fa84a",
};

guidesMap.updatedAt = new Date().toISOString();
guidesMap.bakedLines = true;
guidesMap.mapMode = "calibrated";
guidesMap.mapHref = `${id}-map.html`;
guidesMap.mapFactory = {
  package: `maps/${id}`,
  signoffAt: signoff.approved_at,
  hitboxSource: hit.coordinateAuthority,
  route: manifest?.route || "C",
};
guidesMap.sources = Array.from(
  new Set([
    ...(guidesMap.sources || []),
    `Map Factory hitboxes (${hit.coordinateAuthority})`,
    `signoff ${signoff.approved_at}`,
  ]),
);

guidesMap.features = (guidesMap.features || []).map((f) => {
  const next = { ...f };
  const hb = pathById[f.id];
  if (hb?.path) {
    next.path = hb.path;
    if (hb.stations?.length) next.stations = hb.stations;
  }
  const st = status?.features?.[f.id];
  if (st) next.status = st === "unknown" ? next.status : st;
  if (f.id === "lift-snow-escalator") {
    next.status = "stopped";
  }
  return next;
});

// Ensure stopped escalator remains even without path
const hasEsc = guidesMap.features.some((f) => f.id === "lift-snow-escalator");
if (!hasEsc) {
  console.warn("lift-snow-escalator missing from guides map features");
}

writeJson(guidesMapPath, guidesMap);

// Factory-local export for standalone viewer
const exportPath = path.join(data, "map-viewer.json");
writeJson(exportPath, {
  ...guidesMap,
  hero: {
    ...guidesMap.hero,
    src: `./${id}-hero.png`,
  },
});

// Copy hero next to viewer if needed
const pub = publicMapsDir(id);
const heroSrc = path.join(pub, `${id}-hero.png`);
const mockHero = path.join(
  ROOT,
  "docs",
  "mock-assets",
  "images",
  "maps",
  `${id}-hero.png`,
);
if (fs.existsSync(heroSrc) && !fs.existsSync(mockHero)) {
  fs.copyFileSync(heroSrc, mockHero);
}

console.log(`[promote] wrote ${guidesMapPath}`);
console.log(
  `[promote] paths=`,
  guidesMap.features.filter((f) => f.path).map((f) => f.id).join(", "),
);
console.log(
  `[promote] stopped=`,
  guidesMap.features.filter((f) => f.status === "stopped").map((f) => f.id).join(", ") || "(none)",
);
void difficultyColor;
