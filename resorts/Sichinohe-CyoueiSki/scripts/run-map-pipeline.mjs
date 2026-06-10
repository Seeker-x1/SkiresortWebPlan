#!/usr/bin/env node
/** 実座標マップパイプライン一括実行 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, script)], {
      stdio: "inherit",
      cwd: __dirname,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(script))));
  });
}

// レイアウト検証のみ（本番ヒーロー禁止）: node rasterize-hero-traced.mjs
// 本番ヒーロー更新: node build-hero-illustrated.mjs <pro-illustration.png>
// 地理基準: Google Earth Studio（画面非表示）+ skimap2012
// 1 Earth書き出し → import-earth-footage.mjs / 2 skimap / 3 イラスト配置
await run("fetch-lift-way.mjs");
await run("fetch-pony-lift.mjs");
await run("fetch-skimap-reference.mjs");
await run("project-camera.mjs");
await run("fit-overlay-similarity.mjs");
await run("align-hero-earth.mjs");
await run("build-map-preview.mjs");
await run("generate-illustration-brief.mjs");
console.log("pipeline done — open public/maps/map-preview.html (no server)");
console.log("Earth書き出し: node import-earth-footage.mjs --fit");
console.log("イラスト差し替え: node build-hero-illustrated.mjs <png> → control-points-hero-ai.json 調整");
