import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** @returns {Map<string, { id: number, nameJa: string, pref: string }>} */
export function loadJapowIndex() {
  const jsonPath = path.join(ROOT, "data", "japow-resort-index.json");
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  /** @type {Map<string, { id: number, nameJa: string, pref: string }>} */
  const byName = new Map();
  for (const [id, row] of Object.entries(raw.resorts)) {
    byName.set(normalizeName(row.nameJa), {
      id: Number(id),
      nameJa: row.nameJa,
      pref: row.pref,
    });
  }
  return byName;
}

function normalizeName(name) {
  return String(name)
    .replace(/\s+/g, "")
    .replace(/スキー場|スキーリゾート|ゲレンデ/g, "")
    .toLowerCase();
}

/**
 * @param {string} query Japanese resort name fragment
 * @returns {{ id: number, nameJa: string, pref: string }[]}
 */
export function searchJapowResorts(query) {
  const q = normalizeName(query);
  if (!q) return [];
  const index = loadJapowIndex();
  const hits = [];
  for (const row of index.values()) {
    const n = normalizeName(row.nameJa);
    if (n.includes(q) || q.includes(n)) hits.push(row);
  }
  return hits.sort((a, b) => a.id - b.id);
}

/**
 * @param {number} id
 */
export function getJapowResort(id) {
  const jsonPath = path.join(ROOT, "data", "japow-resort-index.json");
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const row = raw.resorts[String(id)];
  if (!row) return null;
  return { id, nameJa: row.nameJa, pref: row.pref, region: row.region };
}

export { ROOT };
