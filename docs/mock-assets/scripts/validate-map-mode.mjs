#!/usr/bin/env node
/**
 * Enforce mapMode contract for LP maps.
 * - schematic (default): no Map Factory gate required
 * - calibrated: requires mapFactory.signoffAt + hitbox paths (or explicit optional skips)
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAPS = join(__dirname, "..", "data", "maps");
const REGISTRY = join(__dirname, "..", "registry.json");

let failed = 0;
function fail(msg) {
  console.error(`FAIL  ${msg}`);
  failed++;
}

const files = readdirSync(MAPS).filter(
  (f) => f.endsWith(".json") && !f.endsWith("-area.json"),
);

for (const file of files) {
  const id = file.replace(/\.json$/, "");
  const data = JSON.parse(readFileSync(join(MAPS, file), "utf8"));
  const mode = data.mapMode || (data.mapFactory ? "calibrated" : "schematic");

  if (mode !== "schematic" && mode !== "calibrated") {
    fail(`${id}: invalid mapMode=${mode}`);
    continue;
  }

  if (mode === "schematic") continue;

  // calibrated
  if (!data.mapFactory?.signoffAt) {
    fail(`${id}: calibrated requires mapFactory.signoffAt`);
  }
  if (!data.mapFactory?.hitboxSource) {
    fail(`${id}: calibrated requires mapFactory.hitboxSource`);
  }
  const withPath = (data.features || []).filter((f) => f.path);
  if (withPath.length < 1) {
    fail(`${id}: calibrated requires at least one feature.path`);
  }
  const pinned = join(__dirname, "..", `${id}-map.html`);
  if (!existsSync(pinned) && !data.mapHref) {
    fail(`${id}: calibrated should have ${id}-map.html or mapHref`);
  }
}

if (existsSync(REGISTRY)) {
  const reg = JSON.parse(readFileSync(REGISTRY, "utf8"));
  for (const r of reg.resorts || []) {
    if (r.mapMode === "calibrated") {
      const mapFile = join(MAPS, `${r.id}.json`);
      if (!existsSync(mapFile)) {
        fail(`registry ${r.id}: mapMode=calibrated but missing data/maps/${r.id}.json`);
        continue;
      }
      const data = JSON.parse(readFileSync(mapFile, "utf8"));
      const mode = data.mapMode || (data.mapFactory ? "calibrated" : "schematic");
      if (mode !== "calibrated") {
        fail(`registry ${r.id}: mapMode=calibrated but JSON is ${mode}`);
      }
    }
  }
}

if (failed) {
  console.error(`\nvalidate-map-mode: ${failed} error(s)`);
  process.exit(1);
}
console.log(`PASS  validate-map-mode (${files.length} maps)`);
