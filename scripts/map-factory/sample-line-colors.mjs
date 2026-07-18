#!/usr/bin/env node
import path from "node:path";
import { createRequire } from "node:module";
import { ROOT, parseArgs } from "./lib.mjs";

const require = createRequire(
  path.join(ROOT, "resorts/Sichinohe-CyoueiSki/scripts/package.json"),
);
const sharp = require("sharp");

const args = parseArgs(process.argv.slice(2));
const id = args.id || "sapporo-kokusai";
const imgPath =
  args.file ||
  path.join(ROOT, "maps", id, "public", "maps", `${id}-hero.png`);

const { data, info } = await sharp(imgPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

console.log("size", info.width, info.height);

const buckets = new Map();
const step = 4;
for (let y = 0; y < info.height; y += step) {
  for (let x = 0; x < info.width; x += step) {
    const i = (y * info.width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) continue;
    if (r > 230 && g > 230 && b > 230) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.2 && max > 160) continue;
    const key = [
      Math.round(r / 16) * 16,
      Math.round(g / 16) * 16,
      Math.round(b / 16) * 16,
    ].join(",");
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
}

const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
for (const [k, v] of top) console.log(String(v).padStart(6), k);
