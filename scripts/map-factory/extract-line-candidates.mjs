#!/usr/bin/env node
/**
 * Route C: color-mask → morph close (dashes) → skeleton → split at junctions
 * Human only assigns candidate → feature in assign-hitboxes.html
 *
 * Usage: node scripts/map-factory/extract-line-candidates.mjs --id sapporo-kokusai
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  ROOT,
  dataDir,
  ensureDir,
  parseArgs,
  publicMapsDir,
  readJson,
  writeJson,
  writeText,
} from "./lib.mjs";

const require = createRequire(
  path.join(ROOT, "resorts/Sichinohe-CyoueiSki/scripts/package.json"),
);
const sharp = require("sharp");

const args = parseArgs(process.argv.slice(2));
const id = args.id;
if (!id) {
  console.error("Usage: --id <resort-id>");
  process.exit(1);
}

const pub = publicMapsDir(id);
const data = dataDir(id);
const heroPath = path.join(pub, `${id}-hero.png`);
const outDir = path.join(data, "line-extract");
ensureDir(outDir);

/**
 * Sapporo Kokusai official slopemap (and similar JP maps):
 * - advanced: black solid
 * - intermediate: red solid
 * - beginner: green solid / green dashed
 * - lift: cyan/blue DASHED (not orange — orange is icons / 禁止エリア)
 */
const CLASSES = {
  // closeR: morph-close radius to bridge dashes. Keep SMALL on solid
  // parallels so adjacent same-color courses do not fuse into one blob.
  advanced: {
    closeR: 1,
    minSkelPts: 18,
    minLenPx: 20,
    test: (r, g, b) => {
      const m = Math.max(r, g, b);
      return m < 70 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
    },
  },
  intermediate: {
    closeR: 1,
    minSkelPts: 16,
    minLenPx: 18,
    test: (r, g, b) => r > 160 && g < 100 && b < 110 && r - g > 70,
  },
  beginner: {
    closeR: 3, // green dashes
    minSkelPts: 14,
    minLenPx: 16,
    test: (r, g, b) => g > 110 && r < 100 && b < 130 && g - r > 50 && g >= b - 20,
  },
  lift: {
    // Pure cyan dashes (r≈0). Exclude pale blue 禁止エリア fills (r>100).
    closeR: 9,
    minSkelPts: 12,
    minLenPx: 40,
    test: (r, g, b) =>
      r < 50 && g > 120 && g < 200 && b > 200 && b - r > 140,
  },
};

const { data: rgba, info } = await sharp(heroPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
console.log(`[extract] ${id} ${W}x${H}`);

function pix(mask, x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return 0;
  return mask[y * W + x];
}
function setPix(mask, x, y, v) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  mask[y * W + x] = v;
}

/** Dilate binary mask with disk radius r */
function dilate(mask, r) {
  if (r <= 0) return mask.slice();
  const out = new Uint8Array(mask.length);
  const r2 = r * r;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          setPix(out, x + dx, y + dy, 1);
        }
      }
    }
  }
  return out;
}

/** Erode binary mask with disk radius r */
function erode(mask, r) {
  if (r <= 0) return mask.slice();
  const out = new Uint8Array(mask.length);
  const r2 = r * r;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let ok = 1;
      for (let dy = -r; dy <= r && ok; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          if (!pix(mask, x + dx, y + dy)) {
            ok = 0;
            break;
          }
        }
      }
      out[y * W + x] = ok;
    }
  }
  return out;
}

/** Morphological close = dilate then erode (bridges dashes) */
function morphClose(mask, r) {
  return erode(dilate(mask, r), r);
}

/**
 * Zhang-Suen thinning (skeleton). Operates in-place copy.
 * https://rosettacode.org/wiki/Zhang-Suen_thinning_algorithm
 */
function skeletonize(mask) {
  let img = mask.slice();
  const N = (x, y) => pix(img, x, y);
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const toClear = [];
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (!N(x, y)) continue;
          const p2 = N(x, y - 1);
          const p3 = N(x + 1, y - 1);
          const p4 = N(x + 1, y);
          const p5 = N(x + 1, y + 1);
          const p6 = N(x, y + 1);
          const p7 = N(x - 1, y + 1);
          const p8 = N(x - 1, y);
          const p9 = N(x - 1, y - 1);
          const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9];
          const B = neighbors.reduce((a, v) => a + v, 0);
          if (B < 2 || B > 6) continue;
          let A = 0;
          for (let i = 0; i < 8; i++) {
            if (!neighbors[i] && neighbors[(i + 1) % 8]) A++;
          }
          if (A !== 1) continue;
          if (step === 0) {
            if (p2 * p4 * p6 !== 0) continue;
            if (p4 * p6 * p8 !== 0) continue;
          } else {
            if (p2 * p4 * p8 !== 0) continue;
            if (p2 * p6 * p8 !== 0) continue;
          }
          toClear.push([x, y]);
        }
      }
      if (toClear.length) {
        changed = true;
        for (const [x, y] of toClear) img[y * W + x] = 0;
      }
    }
  }
  return img;
}

function nbr8(x, y, mask) {
  const o = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      if (pix(mask, x + dx, y + dy)) o.push([x + dx, y + dy]);
    }
  }
  return o;
}

function degree(x, y, mask) {
  return nbr8(x, y, mask).length;
}

/**
 * Connected components on skeleton, then split each at junctions.
 * Keeps parallel same-color courses as separate blobs when they never touch.
 */
function components(mask, minPixels = 1) {
  const seen = new Uint8Array(W * H);
  const comps = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (!mask[p] || seen[p]) continue;
      const pixels = [];
      const stack = [[x, y]];
      seen[p] = 1;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        pixels.push([cx, cy]);
        for (const [nx, ny] of nbr8(cx, cy, mask)) {
          const np = ny * W + nx;
          if (seen[np]) continue;
          seen[np] = 1;
          stack.push([nx, ny]);
        }
      }
      if (pixels.length >= minPixels) comps.push(pixels);
    }
  }
  return comps;
}

function maskFromPixels(pixels) {
  const m = new Uint8Array(W * H);
  for (const [x, y] of pixels) m[y * W + x] = 1;
  return m;
}

/** Split one skeleton component into polylines at junctions / endpoints */
function skeletonToPolylines(skel, minPts) {
  const nodes = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!pix(skel, x, y)) continue;
      const d = degree(x, y, skel);
      if (d === 1 || d >= 3) nodes.push([x, y]);
    }
  }
  const usedEdge = new Set();
  const key = (a, b) => {
    const aK = `${a[0]},${a[1]}`;
    const bK = `${b[0]},${b[1]}`;
    return aK < bK ? `${aK}|${bK}` : `${bK}|${aK}`;
  };
  const polylines = [];

  function walk(start, firstStep) {
    const path = [start];
    let prev = start;
    let cur = firstStep;
    usedEdge.add(key(start, firstStep));
    path.push(cur);
    while (true) {
      const d = degree(cur[0], cur[1], skel);
      if (d !== 2 && path.length > 2) break;
      const opts = nbr8(cur[0], cur[1], skel).filter(
        ([nx, ny]) => !(nx === prev[0] && ny === prev[1]),
      );
      const next = opts.find((n) => !usedEdge.has(key(cur, n)));
      if (!next) break;
      usedEdge.add(key(cur, next));
      prev = cur;
      cur = next;
      path.push(cur);
      if (degree(cur[0], cur[1], skel) !== 2) break;
    }
    return path;
  }

  const seeds = nodes.length
    ? nodes
    : (() => {
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (pix(skel, x, y)) return [[x, y]];
          }
        }
        return [];
      })();

  for (const [x, y] of seeds) {
    for (const n of nbr8(x, y, skel)) {
      if (usedEdge.has(key([x, y], n))) continue;
      const path = walk([x, y], n);
      if (path.length >= minPts) polylines.push(path);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!pix(skel, x, y)) continue;
      for (const n of nbr8(x, y, skel)) {
        if (usedEdge.has(key([x, y], n))) continue;
        const path = walk([x, y], n);
        if (path.length >= minPts) polylines.push(path);
      }
    }
  }
  return polylines;
}

function simplify(pts, minDist2 = 36) {
  if (pts.length <= 2) return pts;
  const out = [pts[0]];
  let last = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const dx = p[0] - last[0];
    const dy = p[1] - last[1];
    if (dx * dx + dy * dy >= minDist2) {
      out.push(p);
      last = p;
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function pathD(pts) {
  if (pts.length < 2) return "";
  return pts
    .map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`)
    .join(" ");
}

// --- build raw masks ---
/** @type {Map<string, Uint8Array>} */
const rawMasks = new Map();
for (const name of Object.keys(CLASSES)) rawMasks.set(name, new Uint8Array(W * H));

const counts = Object.fromEntries(Object.keys(CLASSES).map((k) => [k, 0]));
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const a = rgba[i + 3];
    if (a < 200) continue;
    // skip near-white
    if (r > 235 && g > 235 && b > 235) continue;
    for (const [name, cls] of Object.entries(CLASSES)) {
      if (cls.test(r, g, b)) {
        rawMasks.get(name)[y * W + x] = 1;
        counts[name]++;
        break;
      }
    }
  }
}
console.log("[extract] raw pixels", counts);

const candidates = [];
let cid = 0;
/** closed masks for preview */
const previewMasks = new Map();

for (const [clsName, cfg] of Object.entries(CLASSES)) {
  const raw = rawMasks.get(clsName);
  // Bridge dashes only — do NOT erode after (that killed thin red/green strokes)
  const closed = morphClose(raw, cfg.closeR);
  previewMasks.set(clsName, closed);

  // Skeletonize per connected component so fused blobs stay local
  const blobs = components(closed, 12);
  let segCount = 0;
  let kept = 0;
  for (const blob of blobs) {
    const blobMask = maskFromPixels(blob);
    const skel = skeletonize(blobMask);
    const polys = skeletonToPolylines(skel, 6);
    segCount += polys.length;
    for (const poly of polys) {
      if (poly.length < cfg.minSkelPts) continue;
      const pts = simplify(poly, clsName === "lift" ? 20 : 30);
      if (pts.length < 2) continue;
      let len = 0;
      for (let i = 1; i < pts.length; i++) {
        len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      }
      if (len < cfg.minLenPx && poly.length < cfg.minSkelPts * 1.5) continue;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      candidates.push({
        id: `cand-${String(++cid).padStart(3, "0")}`,
        class: clsName,
        pixelCount: poly.length,
        pointCount: pts.length,
        lengthPx: Math.round(len),
        bbox: {
          minX: Math.min(...xs),
          minY: Math.min(...ys),
          maxX: Math.max(...xs),
          maxY: Math.max(...ys),
        },
        path: pathD(pts),
        points: pts,
      });
      kept++;
    }
  }
  console.log(
    `[extract] ${clsName}: closeR=${cfg.closeR} blobs=${blobs.length} segs≈${segCount} kept=${kept}`,
  );
}

// Prefer longer candidates first in UI
candidates.sort((a, b) => b.lengthPx - a.lengthPx);
// re-id after sort for stable display by length
candidates.forEach((c, i) => {
  c.id = `cand-${String(i + 1).padStart(3, "0")}`;
});

writeJson(path.join(outDir, "candidates.json"), {
  schemaVersion: "2026-07-18",
  resortId: id,
  hero: { width: W, height: H, file: `${id}-hero.png` },
  method:
    "color-mask → morph-close(dashes) → erode(separate parallels) → Zhang-Suen skeleton → junction split",
  classes: counts,
  notes: [
    "Lifts on this map are cyan/blue dashed, not orange.",
    "Orange pixels are icons / 禁止エリア — ignored for lift class.",
    "Same-color parallels are split at skeleton junctions; assign each cand separately.",
  ],
  candidates,
});

// Preview: closed masks tinted
const overlay = Buffer.alloc(W * H * 4, 0);
const classColor = {
  advanced: [20, 20, 20, 210],
  intermediate: [230, 40, 40, 200],
  beginner: [20, 180, 60, 200],
  lift: [30, 160, 240, 220],
};
for (const [cls, mask] of previewMasks) {
  const c = classColor[cls];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const o = i * 4;
    // later classes overwrite; draw lifts last by iteration order — re-draw lifts on top
    overlay[o] = c[0];
    overlay[o + 1] = c[1];
    overlay[o + 2] = c[2];
    overlay[o + 3] = c[3];
  }
}
const maskPng = await sharp(overlay, {
  raw: { width: W, height: H, channels: 4 },
})
  .png()
  .toBuffer();
await sharp(heroPath)
  .composite([{ input: maskPng, blend: "over" }])
  .png()
  .toFile(path.join(outDir, "color-mask-preview.png"));
fs.copyFileSync(
  path.join(outDir, "color-mask-preview.png"),
  path.join(pub, "color-mask-preview.png"),
);

// Skeleton overlay for debugging parallels/dashes
const skelOverlay = Buffer.alloc(W * H * 4, 0);
for (const c of candidates) {
  const col =
    c.class === "lift"
      ? [0, 200, 255, 255]
      : c.class === "beginner"
        ? [0, 255, 80, 255]
        : c.class === "intermediate"
          ? [255, 60, 60, 255]
          : [40, 40, 40, 255];
  for (const [x, y] of c.points) {
    const o = (y * W + x) * 4;
    skelOverlay[o] = col[0];
    skelOverlay[o + 1] = col[1];
    skelOverlay[o + 2] = col[2];
    skelOverlay[o + 3] = col[3];
  }
}
const skelPng = await sharp(skelOverlay, {
  raw: { width: W, height: H, channels: 4 },
})
  .png()
  .toBuffer();
await sharp(heroPath)
  .composite([{ input: skelPng, blend: "over" }])
  .png()
  .toFile(path.join(pub, "skeleton-preview.png"));

const manifest = readJson(path.join(data, "features.manifest.json"));
const features = (manifest?.features || []).map((f) => ({
  id: f.id,
  type: f.type,
  label: f.label,
  difficulty: f.difficulty || null,
  optional: f.hitboxRequired === false || f.operationalStatus === "stopped",
  suggestedClass:
    f.type === "lift"
      ? "lift"
      : f.difficulty === "advanced"
        ? "advanced"
        : f.difficulty === "beginner"
          ? "beginner"
          : f.difficulty
            ? "intermediate"
            : null,
}));

const candJson = JSON.stringify(candidates);
const featJson = JSON.stringify(features);

writeText(
  path.join(pub, "assign-hitboxes.html"),
  `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${id} — 線候補の紐づけ</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100dvh; display: flex; flex-direction: column; }
    .bar { padding: 10px 12px; border-bottom: 1px solid #334155; }
    .bar h1 { font-size: 14px; }
    .bar p { font-size: 11px; color: #94a3b8; margin-top: 6px; line-height: 1.5; }
    .bar button { margin-top: 8px; margin-right: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid #475569; background: #1e293b; color: #f8fafc; cursor: pointer; }
    .bar button.primary { background: #166534; border-color: #16a34a; }
    .main { flex: 1; display: grid; grid-template-columns: 1fr 340px; min-height: 0; }
    .stage-wrap { overflow: auto; padding: 12px; }
    .stage { position: relative; display: inline-block; max-width: 100%; line-height: 0; }
    .stage img { display: block; width: 100%; height: auto; }
    .stage svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    path.cand { fill: none; stroke-width: 3.5; stroke-linecap: round; cursor: pointer; opacity: 0.7; }
    path.cand:hover, path.cand.sel { opacity: 1; stroke-width: 6; }
    path.cand.assigned { opacity: 0.3; stroke-dasharray: 5 4; }
    .filter { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .filter button { font-size: 11px; padding: 4px 8px; }
    .filter button.on { background: #334155; }
    .panel { border-left: 1px solid #334155; padding: 12px; overflow: auto; font-size: 12px; }
    .panel h2 { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin: 12px 0 8px; }
    .panel h2:first-child { margin-top: 0; }
    .feat { padding: 6px 8px; border-radius: 6px; border: 1px solid transparent; margin-bottom: 4px; cursor: pointer; }
    .feat:hover { background: #1e293b; }
    .feat.sel { border-color: #38bdf8; background: #1e3a5f; }
    .feat.done { color: #86efac; }
    .feat.opt { color: #64748b; }
    pre { background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 8px; font-size: 10px; white-space: pre-wrap; max-height: 200px; overflow: auto; }
    .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; }
    .hint { font-size: 11px; color: #94a3b8; line-height: 1.45; }
  </style>
</head>
<body>
  <header class="bar">
    <h1>色抽出（破線クローズ＋骨格分割）→ 紐づけ — ${id}</h1>
    <p>
      リフト=<strong>青破線</strong>（橙は無視）。並列同色は別候補に分割。
      作業: 右で地物を選ぶ → 候補をクリック（<strong>Shift+クリックでセグメント追加</strong>＝破線の継ぎ足し）。
      フィルタでクラス絞り込み可。
    </p>
    <button type="button" id="toggleMask">色マスク</button>
    <button type="button" id="toggleSkel">骨格プレビュー画像</button>
    <button type="button" id="clearAssign">紐づけ解除</button>
    <button type="button" class="primary" id="download">JSON保存</button>
    <div class="filter" id="filters"></div>
  </header>
  <div class="main">
    <div class="stage-wrap">
      <div class="stage" id="stage">
        <img id="hero" src="./${id}-hero.png" width="${W}" height="${H}" alt="hero" />
        <img id="mask" src="./color-mask-preview.png" width="${W}" height="${H}" alt="mask" hidden style="position:absolute;inset:0;width:100%;height:auto;opacity:.5;pointer-events:none" />
        <img id="skelImg" src="./skeleton-preview.png" width="${W}" height="${H}" alt="skel" hidden style="position:absolute;inset:0;width:100%;height:auto;opacity:.7;pointer-events:none" />
        <svg id="svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
    </div>
    <aside class="panel">
      <h2>凡例</h2>
      <div><span class="swatch" style="background:#1e1e1e"></span>advanced 黒</div>
      <div><span class="swatch" style="background:#e62828"></span>intermediate 赤</div>
      <div><span class="swatch" style="background:#14b43c"></span>beginner 緑（破線含む）</div>
      <div><span class="swatch" style="background:#1ea0f0"></span>lift 青破線</div>
      <p class="hint" style="margin-top:8px">橙は禁止エリア／アイコンなのでリフト候補にしません。</p>
      <h2>地物</h2>
      <div id="featList"></div>
      <h2>選択中候補</h2>
      <div id="candInfo">（線をクリック）</div>
      <h2>出力 ${candidates.length} candidates</h2>
      <pre id="out"></pre>
    </aside>
  </div>
  <script>
    const CANDIDATES = ${candJson};
    const FEATURES = ${featJson};
    const COLORS = {
      advanced: "#111111",
      intermediate: "#e62828",
      beginner: "#14b43c",
      lift: "#1ea0f0",
    };
    const svg = document.getElementById("svg");
    const featList = document.getElementById("featList");
    const candInfo = document.getElementById("candInfo");
    const out = document.getElementById("out");
    const maskImg = document.getElementById("mask");
    const skelImg = document.getElementById("skelImg");
    const filtersEl = document.getElementById("filters");

    let selCand = null;
    let selFeat = FEATURES.find((f) => !f.optional)?.id || FEATURES[0]?.id;
    /** @type {Record<string, string[]>} featureId -> candidateIds (multi for dashed) */
    const assign = {};
    const classOn = { advanced: true, intermediate: true, beginner: true, lift: true };

    for (const cls of Object.keys(classOn)) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = cls;
      b.className = "on";
      b.onclick = () => {
        classOn[cls] = !classOn[cls];
        b.classList.toggle("on", classOn[cls]);
        renderCands();
      };
      filtersEl.appendChild(b);
    }

    FEATURES.forEach((f) => {
      const el = document.createElement("div");
      el.className = "feat" + (f.optional ? " opt" : "");
      el.dataset.id = f.id;
      el.dataset.base =
        (f.type === "lift" ? "[L] " : "[T] ") + f.label +
        (f.suggestedClass ? " · " + f.suggestedClass : "") +
        (f.optional ? "（任意）" : "");
      el.textContent = el.dataset.base;
      el.onclick = () => {
        selFeat = f.id;
        renderFeats();
      };
      featList.appendChild(el);
    });

    function allAssignedCandIds() {
      const s = new Set();
      for (const ids of Object.values(assign)) {
        for (const id of ids) s.add(id);
      }
      return s;
    }

    function renderFeats() {
      featList.querySelectorAll(".feat").forEach((el) => {
        el.classList.toggle("sel", el.dataset.id === selFeat);
        const n = (assign[el.dataset.id] || []).length;
        el.classList.toggle("done", n > 0);
        el.textContent = n > 1 ? el.dataset.base + " ×" + n : el.dataset.base;
      });
    }

    function renderCands() {
      const taken = allAssignedCandIds();
      svg.innerHTML = "";
      for (const c of CANDIDATES) {
        if (!classOn[c.class]) continue;
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", c.path);
        p.setAttribute("stroke", COLORS[c.class] || "#fff");
        p.classList.add("cand");
        if (c.id === selCand) p.classList.add("sel");
        if (taken.has(c.id)) p.classList.add("assigned");
        p.onclick = (e) => {
          e.stopPropagation();
          selCand = c.id;
          candInfo.textContent = c.id + " · " + c.class + " · " + c.lengthPx + "px"
            + (e.shiftKey ? " （追加）" : "");
          if (selFeat) link(selFeat, selCand, e.shiftKey);
          renderCands();
        };
        svg.appendChild(p);
      }
      buildOut();
    }

    function link(featId, candId, append) {
      const feat = FEATURES.find((f) => f.id === featId);
      if (feat?.optional) return;
      // remove cand from any other feature
      for (const [fid, ids] of Object.entries(assign)) {
        assign[fid] = ids.filter((id) => id !== candId);
        if (!assign[fid].length) delete assign[fid];
      }
      const cur = assign[featId] ? [...assign[featId]] : [];
      if (append) {
        if (!cur.includes(candId)) cur.push(candId);
      } else {
        cur.length = 0;
        cur.push(candId);
      }
      assign[featId] = cur;
      renderFeats();
      renderCands();
    }

    function mergePaths(cands) {
      // Join SVG path strings; order by descending length (good enough for hitboxes)
      const sorted = [...cands].sort((a, b) => b.lengthPx - a.lengthPx);
      return sorted.map((c) => c.path).join(" ");
    }

    function buildOut() {
      const features = [];
      for (const f of FEATURES) {
        if (f.optional) continue;
        const ids = assign[f.id];
        if (!ids?.length) continue;
        const cands = ids.map((id) => CANDIDATES.find((x) => x.id === id)).filter(Boolean);
        if (!cands.length) continue;
        const pts = cands.flatMap((c) => c.points);
        features.push({
          id: f.id,
          type: f.type,
          label: f.label,
          source: "color-extract v2 + human-assign",
          path: mergePaths(cands),
          stations: f.type === "lift" && pts.length >= 2
            ? [cands[0].points[0], cands[0].points[cands[0].points.length - 1]]
            : [],
          extractClass: cands[0].class,
          candidateIds: ids,
        });
      }
      const required = FEATURES.filter((f) => !f.optional);
      const payload = {
        schemaVersion: "2026-07-18",
        coordinateAuthority: "${id}-hero.png color-extract-v2 assign",
        status: required.every((f) => assign[f.id]?.length) ? "complete" : "incomplete",
        hero: { width: ${W}, height: ${H}, viewBox: "0 0 ${W} ${H}" },
        features,
        assignment: assign,
      };
      out.textContent = JSON.stringify(payload, null, 2);
      return payload;
    }

    document.getElementById("toggleMask").onclick = () => { maskImg.hidden = !maskImg.hidden; };
    document.getElementById("toggleSkel").onclick = () => { skelImg.hidden = !skelImg.hidden; };
    document.getElementById("clearAssign").onclick = () => {
      if (selFeat) delete assign[selFeat];
      renderFeats();
      renderCands();
    };
    document.getElementById("download").onclick = () => {
      const payload = buildOut();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "hitboxes-hero.json";
      a.click();
    };

    renderFeats();
    renderCands();
  </script>
</body>
</html>
`,
);

console.log(`[extract] candidates=${candidates.length}`);
console.log(`[extract] UI → ${path.join(pub, "assign-hitboxes.html")}`);
console.log(`[extract] mask → color-mask-preview.png / skeleton-preview.png`);
