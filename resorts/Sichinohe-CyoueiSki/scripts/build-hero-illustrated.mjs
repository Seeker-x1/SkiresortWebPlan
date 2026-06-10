#!/usr/bin/env node
/**
 * 手順3: GSI + skimap を下絵にしたイラストの配置・トレース記録
 * 実際の画像生成は Figma / AI img2img。本スクリプトは配置とメタ更新のみ。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "web");
const maps = path.join(root, "public", "maps");
const data = path.join(root, "data", "map");

const src = process.argv[2];
if (!src) {
  console.error("usage: node build-hero-illustrated.mjs <path-to-illustrated.png>");
  process.exit(1);
}

const hero = path.join(maps, "sichinohe-hero.png");
const archive = path.join(maps, "sichinohe-hero-v2.png");
fs.copyFileSync(src, hero);
fs.copyFileSync(src, archive);

const trace = {
  schemaVersion: "2026-06-05",
  output: "/maps/sichinohe-hero.png",
  archive: "/maps/sichinohe-hero-v2.png",
  styleReference: "/maps/sichinohe-hero-illustrated.png",
  terrainReference: "/maps/sichinohe-hero-gsi.png",
  layoutReference: "data/map/reference/skimap-2012.jpg",
  method: "AI img2img — GSI terrain + skimap layout + illustrated style",
  generatedAt: new Date().toISOString().slice(0, 10),
};

fs.writeFileSync(
  path.join(data, "hero-illustrated-trace.json"),
  JSON.stringify(trace, null, 2) + "\n"
);

console.log("deployed illustrated hero →", hero);
console.log("trace → hero-illustrated-trace.json");
console.log("next: update control-points-hero-ai.json → fit-overlay-similarity → align-hero-gsi");
