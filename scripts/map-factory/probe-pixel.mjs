#!/usr/bin/env node
/** Sample pixels around clickable lift-ish regions for threshold tuning */
import path from "node:path";
import { createRequire } from "node:module";
import { ROOT, parseArgs } from "./lib.mjs";

const require = createRequire(
  path.join(ROOT, "resorts/Sichinohe-CyoueiSki/scripts/package.json"),
);
const sharp = require("sharp");

const args = parseArgs(process.argv.slice(2));
const id = args.id || "sapporo-kokusai";
const imgPath = path.join(ROOT, "maps", id, "public", "maps", `${id}-hero.png`);
const { data, info } = await sharp(imgPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

function at(x, y) {
  const i = (y * info.width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

// Probe a grid and find cyan/blue-ish pixels that aren't forest
const hits = [];
for (let y = 40; y < info.height - 40; y += 2) {
  for (let x = 40; x < info.width - 40; x += 2) {
    const [r, g, b, a] = at(x, y);
    if (a < 200) continue;
    // blue-ish: B dominant or cyan
    if (b > 140 && b >= g - 10 && b > r + 30 && r < 180) {
      hits.push({ x, y, r, g, b });
    }
  }
}
console.log("blue-ish hits", hits.length);
// histogram of rounded colors
const buck = new Map();
for (const h of hits) {
  const k = [
    Math.round(h.r / 8) * 8,
    Math.round(h.g / 8) * 8,
    Math.round(h.b / 8) * 8,
  ].join(",");
  buck.set(k, (buck.get(k) || 0) + 1);
}
[...buck.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([k, v]) => console.log(v, k));

// Current lift test from extract
function liftTest(r, g, b) {
  const isCyan = b > 150 && g > 100 && r < 120 && b - r > 60 && g - r > 20;
  const isBlue = b > 170 && r < 100 && g < 160 && b - g > 20 && b - r > 80;
  return isCyan || isBlue;
}
let pass = 0;
for (const h of hits) if (liftTest(h.r, h.g, h.b)) pass++;
console.log("current liftTest pass", pass, "/", hits.length);

// Sample known gondola corridor roughly (diagonal base→summit on this map)
const corridor = [];
for (let t = 0; t < 1; t += 0.01) {
  const x = Math.round(280 + t * 200);
  const y = Math.round(700 - t * 420);
  corridor.push({ x, y, rgb: at(x, y) });
}
console.log("corridor samples:");
for (const c of corridor.filter((_, i) => i % 10 === 0)) {
  const [r, g, b] = c.rgb;
  console.log(c.x, c.y, r, g, b, "lift?", liftTest(r, g, b));
}
