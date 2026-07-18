#!/usr/bin/env node
/**
 * Map Factory Step 0–3 (auto / semi-auto)
 * docs/MAP_FACTORY_SPEC.md
 *
 * Usage:
 *   node scripts/map-factory/research.mjs --name "札幌国際スキー場"
 *   node scripts/map-factory/research.mjs --id sapporo-kokusai
 */
import fs from "node:fs";
import path from "node:path";
import {
  KNOWN,
  dataDir,
  ensureDir,
  parseArgs,
  publicMapsDir,
  readJson,
  resortDir,
  writeJson,
  writeText,
} from "./lib.mjs";

const UA = "SkiresortWebPlan-MapFactory/0.1 (+https://guides.japowserch.com)";

const args = parseArgs(process.argv.slice(2));
let id = args.id;
let name = args.name;

if (!id && name) {
  const hit = Object.values(KNOWN).find(
    (k) => k.name_ja === name || k.name_en === name || name.includes("札幌国際"),
  );
  if (hit) id = hit.id;
}

if (!id && !name) {
  console.error('Usage: --id <id> or --name "施設名"');
  process.exit(1);
}

if (!id) {
  console.error(`Unknown resort name: ${name}. Known: ${Object.keys(KNOWN).join(", ")}`);
  process.exit(1);
}

const known = KNOWN[id];
if (!known) {
  console.error(`No seed profile for id=${id}. Add to scripts/map-factory/lib.mjs KNOWN.`);
  process.exit(1);
}

name = name || known.name_ja;
const outRoot = resortDir(id);
const data = dataDir(id);
const pub = publicMapsDir(id);
const refDir = path.join(data, "reference");
ensureDir(data);
ensureDir(pub);
ensureDir(refDir);

console.log(`[map:research] id=${id} name=${name}`);

async function nominatim(q) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=5&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

async function overpass(bbox) {
  const { south, west, north, east } = bbox;
  const query = `[out:json][timeout:90];
(
  way["aerialway"](${south},${west},${north},${east});
  relation["aerialway"](${south},${west},${north},${east});
  way["piste:type"](${south},${west},${north},${east});
  relation["piste:type"](${south},${west},${north},${east});
);
out geom;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "data=" + encodeURIComponent(query),
  });
  const text = await res.text();
  if (!text.trimStart().startsWith("{")) {
    throw new Error(`Overpass non-JSON: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

function elementToFeature(el, kind) {
  if (!el.geometry?.length) return null;
  const coords = el.geometry.map((g) => [g.lon, g.lat]);
  const tags = el.tags || {};
  return {
    type: "Feature",
    properties: {
      id: `${kind}-osm-${el.id}`,
      kind,
      label_ja: tags.name || tags["name:ja"] || null,
      label_en: tags["name:en"] || null,
      osm_tags: tags,
      source: {
        type: "osm",
        id: `${el.type}/${el.id}`,
        retrieved_at: new Date().toISOString().slice(0, 10),
      },
    },
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  };
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

const candidates = await nominatim(name);
const primary = candidates[0];
if (!primary) {
  console.error("Nominatim: no results");
  process.exit(1);
}

const [south, north, west, east] = primary.boundingbox.map(Number);
const resolve = {
  id,
  name_ja: known.name_ja,
  name_en: known.name_en,
  center: { lat: Number(primary.lat), lng: Number(primary.lon) },
  center_source: "nominatim",
  osm: { type: primary.osm_type, id: primary.osm_id },
  bbox: { south, west, north, east },
  candidates: candidates.map((c) => ({
    display_name: c.display_name,
    lat: Number(c.lat),
    lng: Number(c.lon),
    osm_type: c.osm_type,
    osm_id: c.osm_id,
  })),
  researched_at: new Date().toISOString(),
};
writeJson(path.join(data, "resolve.json"), resolve);
console.log(`[map:research] center ${resolve.center.lat}, ${resolve.center.lng}`);

console.log("[map:research] Overpass aerialway + piste…");
const osmRaw = await overpass(resolve.bbox);
writeJson(path.join(refDir, "overpass-raw.json"), osmRaw);

const lifts = [];
const trails = [];
for (const el of osmRaw.elements || []) {
  if (el.type !== "way" || !el.geometry?.length) continue;
  if (el.tags?.aerialway) {
    const f = elementToFeature(el, "lift");
    if (f) lifts.push(f);
  }
  if (el.tags?.["piste:type"]) {
    const f = elementToFeature(el, "trail");
    if (f) trails.push(f);
  }
}

writeJson(path.join(data, "lifts.geojson"), {
  type: "FeatureCollection",
  features: lifts,
});
writeJson(path.join(data, "trails.geojson"), {
  type: "FeatureCollection",
  features: trails,
});
console.log(`[map:research] OSM lifts=${lifts.length} trails=${trails.length}`);

// Seed official layout features (metadata / Route C authority)
const layout = readJson(known.lpLayoutPath);
const lpFeatures = [];
if (layout) {
  for (const lift of layout.lifts || []) {
    lpFeatures.push({
      id: lift.id,
      type: "lift",
      label: lift.name.ja,
      label_en: lift.name.en,
      shortLabel: lift.name.ja,
      liftKind: lift.kind,
      meta: {
        距離: lift.lengthM != null ? `${lift.lengthM}m` : undefined,
        種別: lift.kind,
      },
      source: {
        type: "official",
        id: "sapporo-kokusai.jp/slopes",
        url: known.officialSlopemapUrl,
        retrieved_at: "2026-07-06",
      },
    });
  }
  for (const course of layout.courses || []) {
    lpFeatures.push({
      id: course.id,
      type: "trail",
      label: course.name.ja,
      label_en: course.name.en,
      shortLabel: course.name.ja,
      difficulty: course.difficulty,
      mapNumber: course.mapNumber,
      meta: {
        最大斜度: course.maxSlope,
        平均斜度: course.avgSlope,
        距離: course.length,
      },
      source: {
        type: "official",
        id: "sapporo-kokusai.jp/slopes",
        url: known.officialSlopemapUrl,
        retrieved_at: "2026-07-06",
      },
    });
  }
  writeJson(path.join(data, "official-map-layout.json"), layout);
}

const manifest = {
  schemaVersion: "2026-07-18",
  resortId: id,
  name: known.name_ja,
  name_en: known.name_en,
  route: "C",
  mapAsset: `/maps/${id}-hero.png`,
  heroImage: {
    src: `/maps/${id}-hero.png`,
    width: 1024,
    height: 817,
    viewBox: "0 0 1024 817",
    projection: "official-slopemap-direct",
    bakedLines: true,
    attribution: "公式ゲレンデマップ（sapporo-kokusai.jp）を hero に採用",
  },
  disclaimer:
    "コース・リフトは公式マップ内に描画済み。ヒットボックス確定後にタップ操作が可能になります。",
  sources: [
    "official-slopemap.png（https://www.sapporo-kokusai.jp/slopes/images/slopemap.png）",
    "OpenStreetMap Overpass（aerialway / piste:type in Nominatim bbox）",
    "gelanding-2016.webp（拓扑照合のみ・非正本）",
  ],
  features: lpFeatures,
};
writeJson(path.join(data, "features.manifest.json"), manifest);

// Route C: hero IS official map → identity transform (not geo projection)
writeJson(path.join(data, "transform.json"), {
  schemaVersion: "2026-07-18",
  type: "identity",
  route: "C",
  reason:
    "hero は公式 slopemap のリサイズであり、ピクセル空間が公式図そのもの。GeoJSON→画像投影は未実施（OSM は根拠対照用）。",
  hero: { width: 1024, height: 817, viewBox: "0 0 1024 817" },
  controlPointsRequired: false,
  geoProjection: null,
});

// Hitboxes: intentionally empty until Human Gate (no PIXEL guessing)
writeJson(path.join(data, "hitboxes-hero.json"), {
  schemaVersion: "2026-07-18",
  coordinateAuthority: `${id}-hero.png（公式図）直トレース予定`,
  status: "incomplete",
  hero: { width: 1024, height: 817, viewBox: "0 0 1024 817" },
  features: [],
  note: "MAP_FACTORY_SPEC Gate: 手トレースまたは色マスク抽出まで空。推測 path 禁止。",
});

writeJson(path.join(data, "status.json"), {
  schemaVersion: "2026-07-18",
  updatedAt: null,
  features: Object.fromEntries(
    lpFeatures.map((f) => [
      f.id,
      f.type === "lift" ? "unknown" : "unknown",
    ]),
  ),
});

writeJson(path.join(data, "signoff.json"), {
  id,
  calibration_qa: "pending",
  endpoint_tolerance_px: 20,
  visual_ok: false,
  approved_by: null,
  approved_at: null,
  notes:
    "Pilot research only. Hitboxes not traced. Do not ship to /map production.",
});

writeJson(path.join(data, "control-points.json"), {
  schemaVersion: "2026-07-18",
  route: "C",
  status: "not_required_for_identity",
  points: [],
  note: "Route C identity（公式図=hero）。Geo 投影を行う場合は ≥3 点必須。",
});

// Copy reference + hero assets from LP factory work
const copied = [];
const assetPairs = [
  [
    path.join(known.lpReferenceDir, "official-slopemap.png"),
    path.join(refDir, "official-slopemap.png"),
  ],
  [
    path.join(known.lpReferenceDir, "gelanding-2016.webp"),
    path.join(refDir, "gelanding-2016.webp"),
  ],
  [known.lpHeroPath, path.join(pub, `${id}-hero.png`)],
  [
    path.join(known.lpReferenceDir, "official-slopemap.png"),
    path.join(pub, `${id}-hero-official-full.png`),
  ],
];
for (const [src, dest] of assetPairs) {
  if (copyIfExists(src, dest)) copied.push(path.relative(outRoot, dest));
}
console.log(`[map:research] copied assets: ${copied.join(", ") || "(none)"}`);

writeText(
  path.join(data, "sources.md"),
  `# ゲレンデマップ用データソース — ${known.name_ja}

> Map Factory pilot · \`${id}\` · ${resolve.researched_at}

## 座標

| 項目 | 値 | 出典 |
|------|-----|------|
| 中心 | ${resolve.center.lat}, ${resolve.center.lng} | Nominatim（\`${primary.osm_type}/${primary.osm_id}\`） |
| bbox | S${south} W${west} N${north} E${east} | Nominatim boundingbox |
| OSM landuse | way/672881398（winter_sports） | Nominatim |

## リフト・コース（メタの正本）

| 項目 | 値 |
|------|-----|
| 正本 | 公式ゲレンデマップ |
| URL | ${known.officialSlopemapUrl} |
| レイアウト JSON | \`official-map-layout.json\`（7コース・5リフト） |
| hero | \`${id}-hero.png\`（1024×817・焼き込み線済み・Route C） |

## OSM（地理根拠・対照用）

| 種別 | 件数 | ファイル |
|------|------|----------|
| aerialway | ${lifts.length} | \`lifts.geojson\` |
| piste:type | ${trails.length} | \`trails.geojson\` |
| raw | — | \`reference/overpass-raw.json\` |

> OSM 名称と公式名称の対応は人手で行う。OSM 幾何を公式イラストへ投影するには Gate A（control points ≥ 3）が別途必要。本パイロットの hero は **公式図 identity** のため、見た目の線は公式焼き込みが正本。

## 参照画像

| ファイル | 用途 | ユーザー表示 |
|----------|------|--------------|
| \`public/maps/${id}-hero.png\` | 本番 hero（公式図リサイズ） | 可（出荷時） |
| \`public/maps/${id}-hero-official-full.png\` | 公式原寸 | 非表示・参照 |
| \`data/reference/gelanding-2016.webp\` | 2016 拓扑照合 | 非表示 |

## ライセンス

- OpenStreetMap データ: ODbL。出典表示必須。
- 公式 slopemap: 札幌国際スキー場の著作物。利用条件は運営元確認。

## パイプライン状態

- [x] Step 1 名前解決
- [x] Step 2 根拠取得（OSM + 公式メタ）
- [x] Step 3 参照画像（LP 既存公式図をコピー）
- [ ] Step 4 Gate A — identity のためスキップ可 / Geo投影時は必須
- [x] Step 5 Gate B — hero 候補は公式図（過去 LP 承認 2026-07-06）。Map Factory signoff は未
- [ ] Step 6 ヒットボックストレース
- [ ] Step 7 calibration-qa ±20px
- [ ] Step 8–9 出荷
`,
);

// Human-gate HTML: do not overwrite hand-maintained trace UI (file:// safe, embedded FEATURES)
const traceUi = path.join(pub, "trace-hitboxes.html");
const qaUi = path.join(pub, "calibration-qa.html");
if (!fs.existsSync(traceUi)) {
  console.warn(
    `[map:research] missing ${traceUi} — copy from maps/sapporo-kokusai or Sichinohe trace-hitboxes.html and embed FEATURES`,
  );
} else {
  console.log("[map:research] keep existing trace-hitboxes.html (not overwritten)");
}
if (!fs.existsSync(qaUi)) {
  writeText(
    qaUi,
    `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${known.name_ja} — calibration QA</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #111; color: #eee; }
    .stage { position: relative; max-width: 1024px; margin: 0 auto; line-height: 0; }
    img { width: 100%; height: auto; display: block; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    path { fill: none; stroke: #0ff; stroke-width: 3; }
    .warn { color: #f6c; padding: 12px 16px; }
  </style>
</head>
<body>
  <p class="warn">hitboxes-hero.json を同フォルダに置くか、HTTP サーバー経由で ../../data/ を読んでください。</p>
  <div class="stage">
    <img src="./${id}-hero.png" alt="hero" width="1024" height="817" />
    <svg id="overlay" viewBox="0 0 1024 817"></svg>
  </div>
  <script>
    (async () => {
      const paths = ["../../data/hitboxes-hero.json", "./hitboxes-hero.json"];
      for (const p of paths) {
        try {
          const data = await (await fetch(p)).json();
          const svg = document.getElementById("overlay");
          for (const f of data.features || []) {
            if (!f.path) continue;
            const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
            el.setAttribute("d", f.path);
            svg.appendChild(el);
          }
          return;
        } catch (_) {}
      }
    })();
  </script>
</body>
</html>
`,
  );
}

writeJson(path.join(outRoot, "pilot-status.json"), {
  id,
  spec: "docs/MAP_FACTORY_SPEC.md",
  phase: "P3-pilot-research",
  steps_done: ["0", "1", "2", "3"],
  steps_blocked: ["6", "7", "8", "9"],
  human_gates: {
    A: "not_required_for_route_C_identity",
    B: "hero_candidate_ready_signoff_pending",
    C: "pending",
  },
  osm: { lifts: lifts.length, trails: trails.length },
  shippable: false,
});

console.log(`[map:research] wrote ${outRoot}`);
console.log("[map:research] next: open public/maps/trace-hitboxes.html → then npm run map:validate -- --id " + id);
