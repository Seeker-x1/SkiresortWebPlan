/**
 * ヒットボックス → lift-markers.json（hero 1024×790 空間）
 *
 * 優先: hitboxes-hero-v5.json（features あり）→ hitboxes-hero-v4.json
 * フォールバック: sichinohe-hero-traced.svg + overlay（1536→790 変換・ズレやすい）
 *
 * Usage: node scripts/sync-hero-hitboxes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const SRC_W = 1536;
const SRC_H = 1024;
const DST_W = 1024;
const DST_H = 790;
const SX = DST_W / SRC_W;
const SY = DST_H / SRC_H;

function round(n) {
  return Math.round(n * 10) / 10;
}

function scalePoint(x, y) {
  return [round(x * SX), round(y * SY)];
}

function scalePath(d) {
  return d.replace(/-?\d*\.?\d+/g, (num) => {
    const n = parseFloat(num);
    if (Number.isNaN(n)) return num;
    const idx = d.indexOf(num);
    const before = d.slice(Math.max(0, idx - 2), idx);
    const isY =
      /[Vv]/.test(before) ||
      (d.slice(0, idx).match(/[MLCQTAHVZ]/gi) || []).length % 2 === 0;
    void isY;
    return String(round(n * (d.lastIndexOf(num) === idx ? 1 : 1)));
  });
}

/** Scale SVG path by alternating x/y after each command letter group */
function scalePathD(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  const out = [];
  let i = 0;
  let coordToggle = 0;

  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) {
      out.push(t);
      const cmd = t.toUpperCase();
      i += 1;
      if (cmd === "Z") continue;
      const params =
        cmd === "M" || cmd === "L" || cmd === "T"
          ? 2
          : cmd === "H"
            ? 1
            : cmd === "V"
              ? 1
              : cmd === "C"
                ? 6
                : cmd === "S" || cmd === "Q"
                  ? 4
                  : cmd === "A"
                    ? 7
                    : 2;
      let p = 0;
      while (p < params && i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
        const n = parseFloat(tokens[i]);
        if (cmd === "H") {
          out.push(String(round(n * SX)));
        } else if (cmd === "V") {
          out.push(String(round(n * SY)));
        } else if (cmd === "A") {
          if (p === 0 || p === 1) out.push(String(round(n * (p === 0 ? SX : SY))));
          else out.push(tokens[i]);
        } else {
          out.push(String(round(n * (coordToggle % 2 === 0 ? SX : SY))));
          coordToggle += 1;
        }
        p += 1;
        i += 1;
      }
      if (cmd === "M") coordToggle = 0;
      continue;
    }
    i += 1;
  }
  return out.join(" ");
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(MAP_DIR, name), "utf-8"));
}

const manifest = readJson("features.manifest.json");

function pickDirectHitboxes() {
  const v5 = path.join(MAP_DIR, "hitboxes-hero-v5.json");
  const v4 = path.join(MAP_DIR, "hitboxes-hero-v4.json");
  if (fs.existsSync(v5)) {
    const data = JSON.parse(fs.readFileSync(v5, "utf-8"));
    if ((data.features ?? []).length > 0) return { file: v5, data };
  }
  if (fs.existsSync(v4)) {
    return { file: v4, data: JSON.parse(fs.readFileSync(v4, "utf-8")) };
  }
  return null;
}

const picked = pickDirectHitboxes();
if (picked) {
  const direct = picked.data;
  const lifts = [];
  const trails = [];
  for (const f of direct.features ?? []) {
    const entry = {
      id: f.id,
      label: f.label ?? manifest.features.find((m) => m.id === f.id)?.label ?? f.id,
      source: f.source ?? "illustrated-hero 手トレース",
      path: f.path,
      stations: f.stations ?? [],
    };
    if (f.type === "lift" || f.id.startsWith("lift-")) lifts.push(entry);
    else trails.push(entry);
  }
  const out = {
    schemaVersion: direct.schemaVersion ?? "2026-06-08",
    coordinateAuthority: direct.coordinateAuthority ?? "illustrated-hero 直トレース",
    projection: "illustrated-hero-baked-lines",
    hero: direct.hero ?? manifest.heroImage,
    lifts,
    trails,
  };
  fs.writeFileSync(path.join(MAP_DIR, "lift-markers.json"), JSON.stringify(out, null, 2) + "\n", "utf-8");
  console.log("wrote lift-markers.json from", path.basename(picked.file));
  console.log("lifts:", lifts.length, "trails:", trails.length);
  process.exit(0);
}

const overlay = readJson("overlay-paths.json");
const layout = readJson("official-map-layout.json");
const tracedSvg = fs.readFileSync(
  path.join(__dirname, "..", "web", "public", "maps", "sichinohe-hero-traced.svg"),
  "utf-8",
);

function extractPath(id) {
  const re = new RegExp(`id="${id}"[^>]*\\sd="([^"]+)"`, "i");
  const m = tracedSvg.match(re);
  if (!m) {
    const re2 = new RegExp(`<path[^>]*id="${id}"[^>]*d="([^"]+)"`, "i");
    return tracedSvg.match(re2)?.[1] ?? null;
  }
  return m[1];
}

function extractCircleCenter(circleId) {
  const re = new RegExp(
    `<circle[^>]*id="${circleId}"[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"`,
    "i",
  );
  const m = tracedSvg.match(re);
  if (!m) throw new Error(`missing circle ${circleId} in traced svg`);
  return [parseFloat(m[1]), parseFloat(m[2])];
}

function extractGroupFirstPathD(groupId) {
  const re = new RegExp(
    `<g[^>]*id="${groupId}"[^>]*>[\\s\\S]*?<path[^>]*d="([^"]+)"`,
    "i",
  );
  const m = tracedSvg.match(re);
  if (!m) throw new Error(`missing group path for ${groupId}`);
  return m[1];
}

function invert3(m) {
  const a = m[0][0],
    b = m[0][1],
    c = m[0][2];
  const d = m[1][0],
    e = m[1][1],
    f = m[1][2];
  const g = m[2][0],
    h = m[2][1],
    i = m[2][2];

  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) throw new Error("singular matrix");
  const invDet = 1 / det;

  return [
    [A * invDet, D * invDet, G * invDet],
    [B * invDet, E * invDet, H * invDet],
    [C * invDet, F * invDet, I * invDet],
  ];
}

function multiplyMatVec(inv, v) {
  return [
    inv[0][0] * v[0] + inv[0][1] * v[1] + inv[0][2] * v[2],
    inv[1][0] * v[0] + inv[1][1] * v[1] + inv[1][2] * v[2],
    inv[2][0] * v[0] + inv[2][1] * v[1] + inv[2][2] * v[2],
  ];
}

function computeAffine(srcPts, dstPts) {
  const [[x1, y1], [x2, y2], [x3, y3]] = srcPts;
  const [[X1, Y1], [X2, Y2], [X3, Y3]] = dstPts;
  const M = [
    [x1, y1, 1],
    [x2, y2, 1],
    [x3, y3, 1],
  ];
  const inv = invert3(M);
  const ax = multiplyMatVec(inv, [X1, X2, X3]); // [a,b,c]
  const ay = multiplyMatVec(inv, [Y1, Y2, Y3]); // [d,e,f]
  return { a: ax[0], b: ax[1], c: ax[2], d: ay[0], e: ay[1], f: ay[2] };
}

function liftLine(id, bottom, top, source) {
  const [bx, by] = scalePoint(bottom[0], bottom[1]);
  const [tx, ty] = scalePoint(top[0], top[1]);
  const entry = layout.lifts.find((l) => l.id === id);
  return {
    id,
    label: manifest.features.find((f) => f.id === id)?.label ?? id,
    source,
    path: `M ${bx} ${by} L ${tx} ${ty}`,
    stations: [
      [bx, by],
      [tx, ty],
    ],
  };
}

function transformPathMLOnly(d, affine) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) {
      const cmd = t.toUpperCase();
      out.push(t);
      i += 1;
      if (cmd === "Z") continue;

      if (cmd === "M" || cmd === "L") {
        const x = parseFloat(tokens[i]);
        const y = parseFloat(tokens[i + 1]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          throw new Error(`bad numeric in ${cmd} path`);
        }
        const X = affine.a * x + affine.b * y + affine.c;
        const Y = affine.d * x + affine.e * y + affine.f;
        out.push(round(X), round(Y));
        i += 2;
        continue;
      }
      throw new Error(`unsupported svg path command: ${cmd}`);
    }
    i += 1;
  }
  return out.join(" ");
}

// ---- traced svg (1536×1024) → hero png (1024×790) の座標変換 ----
const srcPairBottom = extractCircleCenter("lift-pair-bottom");
const srcPairTop = extractCircleCenter("lift-pair-top");
const srcPonyBottom = extractCircleCenter("lift-pony-bottom");
const srcPonyTop = extractCircleCenter("lift-pony-top");

const dstPairBottomCp = overlay.controlPoints?.["lift-pair-bottom"]?.target;
const dstPairTopCp = overlay.controlPoints?.["lift-pair-top"]?.target;
const dstPonyBottomCp = overlay.controlPoints?.["lift-pony-bottom"]?.target;
const dstPonyTopCp = overlay.controlPoints?.["lift-pony-top"]?.target;
if (!dstPairBottomCp || !dstPairTopCp || !dstPonyBottomCp || !dstPonyTopCp) {
  throw new Error("missing overlay controlPoints target for lift endpoints");
}

const dstPairBottom = [dstPairBottomCp[0] * SX, dstPairBottomCp[1] * SY];
const dstPairTop = [dstPairTopCp[0] * SX, dstPairTopCp[1] * SY];
const dstPonyBottom = [dstPonyBottomCp[0] * SX, dstPonyBottomCp[1] * SY];
const dstPonyTop = [dstPonyTopCp[0] * SX, dstPonyTopCp[1] * SY];

const affine = computeAffine(
  [srcPairBottom, srcPairTop, srcPonyBottom],
  [dstPairBottom, dstPairTop, dstPonyBottom],
);

function transformPoint(x, y) {
  return [affine.a * x + affine.b * y + affine.c, affine.d * x + affine.e * y + affine.f];
}

const pairOverlay = overlay.features["lift-pair"];
const ponyOverlay = overlay.features["lift-pony"];

const pairLiftRawPath = extractGroupFirstPathD("lift-pair");
const ponyLiftRawPath = extractGroupFirstPathD("lift-pony");

const pairLiftStations = [
  transformPoint(srcPairBottom[0], srcPairBottom[1]),
  transformPoint(srcPairTop[0], srcPairTop[1]),
].map(([x, y]) => [round(x), round(y)]);

const ponyLiftStations = [
  transformPoint(srcPonyBottom[0], srcPonyBottom[1]),
  transformPoint(srcPonyTop[0], srcPonyTop[1]),
].map(([x, y]) => [round(x), round(y)]);

const pairLift = {
  id: "lift-pair",
  label: manifest.features.find((f) => f.id === "lift-pair")?.label ?? "ペアリフト",
  source: pairOverlay.source,
  path: transformPathMLOnly(pairLiftRawPath, affine),
  stations: pairLiftStations,
};

const ponyLift = {
  id: "lift-pony",
  label: manifest.features.find((f) => f.id === "lift-pony")?.label ?? "ポニーリフト",
  source: ponyOverlay.source,
  path: transformPathMLOnly(ponyLiftRawPath, affine),
  stations: ponyLiftStations,
};

const TRAIL_MAP = {
  "trail-intermediate": { tracedId: "trail-1", source: "official-map-layout コース1 + illustrated-hero" },
  "trail-upper": { tracedId: "trail-2", source: "official-map-layout コース2 + illustrated-hero" },
  "trail-champion": { tracedId: "trail-3", source: "official-map-layout コース3 + illustrated-hero" },
  "trail-forest": { tracedId: "trail-4", source: "official-map-layout コース4 + illustrated-hero" },
  "trail-pony": { tracedId: "trail-5", source: "official-map-layout コース5 + illustrated-hero" },
};

const trails = Object.entries(TRAIL_MAP).map(([id, { tracedId, source }]) => {
  const raw = extractPath(tracedId);
  if (!raw) throw new Error(`missing traced path ${tracedId}`);
  const entry = manifest.features.find((f) => f.id === id);
  return {
    id,
    label: entry?.label ?? id,
    source,
    path: transformPathMLOnly(raw, affine),
    stations: [],
  };
});

const out = {
  schemaVersion: "2026-06-07",
  coordinateAuthority: "official-map-layout.json + overlay-paths.json scaled 1536×1024 → 1024×790",
  projection: "illustrated-hero-baked-lines",
  hero: manifest.heroImage,
  alignment: {
    scale: { sx: SX, sy: SY },
    sourceCanvas: { width: SRC_W, height: SRC_H },
    targetCanvas: { width: DST_W, height: DST_H },
  },
  lifts: [pairLift, ponyLift],
  trails,
};

fs.writeFileSync(path.join(MAP_DIR, "lift-markers.json"), JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log("wrote lift-markers.json");
console.log("lifts:", out.lifts.length, "trails:", out.trails.length);
