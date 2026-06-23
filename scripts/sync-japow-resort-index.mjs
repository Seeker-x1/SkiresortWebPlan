#!/usr/bin/env node
/**
 * Build data/japow-resort-index.json from the JAPOW resort TSV snapshot.
 *
 * Source priority:
 *   1. JAPOW_RESORTS_TSV env (absolute path)
 *   2. ../JAPOWSERCH/RESORTS一覧.txt (sibling clone)
 *   3. data/japow-resort-index.tsv (committed snapshot)
 *
 * Usage: node scripts/sync-japow-resort-index.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_JSON = join(REPO_ROOT, "data", "japow-resort-index.json");
const COMMITTED_TSV = join(REPO_ROOT, "data", "japow-resort-index.tsv");
const SIBLING_TSV = join(REPO_ROOT, "..", "JAPOWSERCH", "RESORTS一覧.txt");

function resolveSourcePath() {
  if (process.env.JAPOW_RESORTS_TSV && existsSync(process.env.JAPOW_RESORTS_TSV)) {
    return process.env.JAPOW_RESORTS_TSV;
  }
  if (existsSync(SIBLING_TSV)) return SIBLING_TSV;
  if (existsSync(COMMITTED_TSV)) return COMMITTED_TSV;
  throw new Error(
    "No JAPOW resort TSV found. Commit data/japow-resort-index.tsv or clone JAPOWSERCH beside SkiresortWebPlan.",
  );
}

function parseTsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const header = lines[0].split("\t");
  const idIdx = header.indexOf("id");
  const nameIdx = header.indexOf("name");
  const prefIdx = header.indexOf("pref");
  const regionIdx = header.indexOf("region");
  if (idIdx < 0 || nameIdx < 0) {
    throw new Error("TSV must have id and name columns");
  }

  const resorts = {};
  for (const line of lines.slice(1)) {
    const cols = line.split("\t");
    const id = cols[idIdx]?.trim();
    const nameJa = cols[nameIdx]?.trim();
    if (!id || !nameJa) continue;
    resorts[id] = {
      nameJa,
      ...(prefIdx >= 0 && cols[prefIdx] ? { pref: cols[prefIdx].trim() } : {}),
      ...(regionIdx >= 0 && cols[regionIdx] ? { region: cols[regionIdx].trim() } : {}),
    };
  }
  return resorts;
}

function main() {
  const source = resolveSourcePath();
  const resorts = parseTsv(readFileSync(source, "utf8"));
  const payload = {
    schemaVersion: "2026-06-23",
    source: source.startsWith(REPO_ROOT) ? source.slice(REPO_ROOT.length + 1) : source,
    updatedAt: new Date().toISOString().slice(0, 10),
    resortCount: Object.keys(resorts).length,
    resorts,
  };
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`✓ ${OUT_JSON} (${payload.resortCount} resorts) ← ${payload.source}`);
}

main();
