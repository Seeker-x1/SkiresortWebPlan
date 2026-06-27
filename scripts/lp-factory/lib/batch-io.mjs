import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./japow-lookup.mjs";

const DEFAULT_BATCH = path.join(ROOT, "configs", "lp-batch", "batch-21-30.json");

export function resolveBatchPath(arg) {
  if (!arg) return DEFAULT_BATCH;
  return path.isAbsolute(arg) ? arg : path.join(ROOT, arg);
}

export function loadBatch(batchPath = DEFAULT_BATCH) {
  const abs = resolveBatchPath(batchPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Batch file not found: ${abs}`);
  }
  return { abs, data: JSON.parse(fs.readFileSync(abs, "utf8")) };
}

export function saveBatch(abs, data) {
  fs.writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * @param {import('./batch-types.js').BatchFile} data
 * @param {number} rank
 * @param {Partial<import('./batch-types.js').BatchResort>} patch
 */
export function updateResort(data, rank, patch) {
  const item = data.resorts.find((r) => r.rank === rank);
  if (!item) throw new Error(`Rank ${rank} not found in batch`);
  Object.assign(item, patch, { updatedAt: new Date().toISOString().slice(0, 10) });
  return item;
}

export function getNextPending(data) {
  return data.resorts.find((r) => r.status === "pending" || r.status === "research");
}

export function getByRank(data, rank) {
  return data.resorts.find((r) => r.rank === rank) ?? null;
}

export function getById(data, id) {
  return data.resorts.find((r) => r.id === id) ?? null;
}
