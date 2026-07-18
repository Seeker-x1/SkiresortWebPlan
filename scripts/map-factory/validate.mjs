#!/usr/bin/env node
/**
 * Map Factory M1–M8 gate (docs/MAP_FACTORY_SPEC.md)
 *
 * Usage: node scripts/map-factory/validate.mjs --id sapporo-kokusai
 */
import fs from "node:fs";
import path from "node:path";
import {
  dataDir,
  parseArgs,
  publicMapsDir,
  readJson,
  resortDir,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const id = args.id;
if (!id) {
  console.error("Usage: --id <resort-id>");
  process.exit(1);
}

const root = resortDir(id);
const data = dataDir(id);
const pub = publicMapsDir(id);

const checks = [];
function check(idKey, ok, detail) {
  checks.push({ id: idKey, ok: Boolean(ok), detail });
}

const sourcesMd = path.join(data, "sources.md");
const lifts = readJson(path.join(data, "lifts.geojson"));
const trails = readJson(path.join(data, "trails.geojson"));
const manifest = readJson(path.join(data, "features.manifest.json"));
const hitboxes = readJson(path.join(data, "hitboxes-hero.json"));
const transform = readJson(path.join(data, "transform.json"));
const control = readJson(path.join(data, "control-points.json"));
const signoff = readJson(path.join(data, "signoff.json"));
const hero = path.join(pub, `${id}-hero.png`);
const officialFull = path.join(pub, `${id}-hero-official-full.png`);
const refOfficial = path.join(data, "reference", "official-slopemap.png");

// M1
check("M1", fs.existsSync(sourcesMd), sourcesMd);

// M2 — each manifest feature has source; geojson features have source
let m2 = Boolean(manifest?.features?.length);
const missingSource = [];
for (const f of manifest?.features || []) {
  if (!f.source?.type || f.source.type === "ai_guess") {
    m2 = false;
    missingSource.push(f.id);
  }
}
for (const f of [...(lifts?.features || []), ...(trails?.features || [])]) {
  if (!f.properties?.source?.type || f.properties.source.type === "ai_guess") {
    m2 = false;
    missingSource.push(f.properties?.id || "?");
  }
}
check(
  "M2",
  m2,
  missingSource.length
    ? `missing/invalid source: ${missingSource.join(", ")}`
    : `manifest=${manifest?.features?.length ?? 0} osm_lifts=${lifts?.features?.length ?? 0} osm_trails=${trails?.features?.length ?? 0}`,
);

// M3 — reference image present
const m3 =
  fs.existsSync(refOfficial) ||
  fs.existsSync(officialFull) ||
  fs.existsSync(path.join(data, "reference", "gelanding-2016.webp"));
check("M3", m3, "official/reference raster");

// M4 — control points ≥3 OR identity/bbox transform
const identityOk =
  transform?.type === "identity" && transform?.route === "C";
const bboxOk = Boolean(transform?.geoProjection?.bbox);
const cps = control?.points?.length ?? 0;
const m4 = identityOk || bboxOk || cps >= 3;
check(
  "M4",
  m4,
  identityOk
    ? "identity Route C"
    : bboxOk
      ? "bbox projection"
      : `control points=${cps}`,
);

// M5 — hero exists + manifest points to it + baked or projection
const m5 =
  fs.existsSync(hero) &&
  Boolean(manifest?.heroImage?.src) &&
  (manifest.heroImage.bakedLines === true ||
    Boolean(manifest.heroImage.projection));
check("M5", m5, hero);

// M6 — hitboxes for every feature that requires one
// hitboxRequired:false / operationalStatus:stopped → path optional (grey-out OK)
const hitFeatures = hitboxes?.features || [];
const hitById = new Map(hitFeatures.map((f) => [f.id, f]));
const requiredFeatures = (manifest?.features || []).filter((f) => {
  if (f.hitboxRequired === false) return false;
  if (f.operationalStatus === "stopped" || f.operationalStatus === "retired") {
    return false;
  }
  return true;
});
const missingHit = requiredFeatures
  .map((f) => f.id)
  .filter((fid) => !hitById.get(fid)?.path);
const skippedOptional = (manifest?.features || [])
  .filter((f) => !requiredFeatures.some((r) => r.id === f.id))
  .map((f) => f.id);
const m6 = missingHit.length === 0 && requiredFeatures.length > 0;
check(
  "M6",
  m6,
  m6
    ? `hitboxes=${hitFeatures.length} required=${requiredFeatures.length}` +
      (skippedOptional.length ? ` optional_skip=${skippedOptional.join(",")}` : "")
    : `incomplete; missing=${missingHit.join(", ") || hitboxes?.status}`,
);

// M7 — visual signoff
const m7 = signoff?.visual_ok === true && Boolean(signoff?.approved_at);
check("M7", m7, signoff ? `visual_ok=${signoff.visual_ok}` : "no signoff.json");

// M8 — this script green only if M1–M7 all pass (and no ai_guess)
const hardFail = checks.some((c) => !c.ok);
check("M8", !hardFail, hardFail ? "blocked by earlier M*" : "all gates pass");

console.log(`\nMap Factory validate — ${id}\n`);
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.id}  ${c.detail}`);
}

const shippable = checks.every((c) => c.ok);
console.log(`\nshippable: ${shippable ? "YES" : "NO"}`);
console.log(`root: ${root}`);

if (!shippable) process.exit(1);
