#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { dataDir, parseArgs, publicMapsDir, readJson, writeText } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const id = args.id;
if (!id) {
  console.error("Usage: --id <resort-id>");
  process.exit(1);
}

const hit = readJson(path.join(dataDir(id), "hitboxes-hero.json"));
const manifest = readJson(path.join(dataDir(id), "features.manifest.json"));
const typeById = Object.fromEntries(
  (manifest?.features || []).map((f) => [f.id, f.type]),
);
const features = (hit?.features || []).map((f) => ({
  id: f.id,
  type: f.type || typeById[f.id] || "trail",
  path: f.path,
}));

const w = hit?.hero?.width || 1024;
const h = hit?.hero?.height || 817;
const payload = JSON.stringify(features);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${id} — calibration QA</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    header { padding: 12px 16px; border-bottom: 1px solid #334155; }
    header p { font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.5; }
    .stage { position: relative; max-width: ${w}px; margin: 12px auto; line-height: 0; }
    img { width: 100%; height: auto; display: block; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .legend { padding: 12px 16px; font-size: 12px; color: #94a3b8; columns: 2; }
  </style>
</head>
<body>
  <header>
    <strong>calibration-qa — ${id}</strong>
    <p>緑=リフト / 青=コース。公式図の焼き込み線と端点が概ね一致するか目視（目安 ±20px）。停止設備はヒットボックスなしで可。</p>
  </header>
  <div class="stage">
    <img src="./${id}-hero.png" alt="hero" width="${w}" height="${h}" />
    <svg id="overlay" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"></svg>
  </div>
  <div class="legend" id="legend"></div>
  <script>
    const FEATURES = ${payload};
    const svg = document.getElementById("overlay");
    const legend = document.getElementById("legend");
    for (const f of FEATURES) {
      if (!f.path) continue;
      const color = f.type === "lift" ? "#22c55e" : "#38bdf8";
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", f.path);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", color);
      p.setAttribute("stroke-width", "3");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("opacity", "0.9");
      svg.appendChild(p);
      legend.innerHTML += "<div>" + f.id + "</div>";
    }
  </script>
</body>
</html>
`;

const out = path.join(publicMapsDir(id), "calibration-qa.html");
writeText(out, html);
console.log(`wrote ${out} (${features.length} paths)`);
