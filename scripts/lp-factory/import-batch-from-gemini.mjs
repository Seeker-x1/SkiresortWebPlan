#!/usr/bin/env node
/**
 * Import ranks 22-30 from Gemini master list (TSV or markdown table paste).
 *
 * Usage:
 *   node scripts/lp-factory/import-batch-from-gemini.mjs --file path/to/paste.txt
 *   type paste.txt | node scripts/lp-factory/import-batch-from-gemini.mjs
 *
 * Expected columns (tab or | separated):
 *   rank | nameJa | id | japowResortId
 * Header row optional. Lines starting with # ignored.
 */
import fs from "node:fs";
import readline from "node:readline";
import { searchJapowResorts } from "./lib/japow-lookup.mjs";
import { loadBatch, updateResort, saveBatch } from "./lib/batch-io.mjs";

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const parts = trimmed.includes("\t")
    ? trimmed.split("\t")
    : trimmed.split("|").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const rank = Number(parts[0].replace(/[^\d]/g, ""));
  if (!Number.isFinite(rank) || rank < 22 || rank > 30) return null;
  const nameJa = parts[1]?.trim() || null;
  const id = parts[2]?.trim() || null;
  let japow = parts[3] ? Number(parts[3].replace(/[^\d]/g, "")) : null;
  if (!japow && nameJa) {
    const hits = searchJapowResorts(nameJa);
    if (hits.length === 1) japow = hits[0].id;
  }
  return { rank, nameJa, id, japowResortId: japow };
}

async function readInput(filePath) {
  const lines = [];
  if (filePath) {
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) lines.push(line);
  } else {
    const rl = readline.createInterface({ input: process.stdin });
    for await (const line of rl) lines.push(line);
  }
  return lines;
}

async function main() {
  const fileArg = process.argv.indexOf("--file");
  const filePath = fileArg >= 0 ? process.argv[fileArg + 1] : null;
  const { abs, data } = loadBatch("configs/lp-batch/batch-21-30.json");
  const lines = await readInput(filePath);
  let count = 0;
  for (const line of lines) {
    const row = parseLine(line);
    if (!row) continue;
    updateResort(data, row.rank, {
      nameJa: row.nameJa,
      id: row.id,
      japowResortId: row.japowResortId,
      status: "pending",
    });
    console.log(`#${row.rank} ← ${row.nameJa} (${row.id ?? "id?"}) japow=${row.japowResortId ?? "?"}`);
    count++;
  }
  if (count === 0) {
    console.error("No rows imported. Expected: rank\\tnameJa\\tid\\tjapowId");
    process.exit(1);
  }
  saveBatch(abs, data);
  console.log(`\nImported ${count} rows → ${abs}`);
}

main();
