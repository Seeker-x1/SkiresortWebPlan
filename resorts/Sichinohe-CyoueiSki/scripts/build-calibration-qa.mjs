/**
 * 静的キャリブ QA（API 不要・5500 / file:// 対応）
 * Usage: node scripts/build-calibration-qa.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const MAPS_WEB = path.join(__dirname, "..", "web", "public", "maps");
const MAPS_ROOT = path.join(__dirname, "..", "..", "public", "maps");
const OUT_PATHS = [
  path.join(MAPS_WEB, "calibration-qa.html"),
  path.join(MAPS_ROOT, "calibration-qa.html"),
];
const TOLERANCE_PX = 20;

function loadHitboxes() {
  const v5 = path.join(MAP_DIR, "hitboxes-hero-v5.json");
  const v4 = path.join(MAP_DIR, "hitboxes-hero-v4.json");
  if (fs.existsSync(v5)) {
    const data = JSON.parse(fs.readFileSync(v5, "utf-8"));
    if ((data.features ?? []).length > 0) {
      return {
        data,
        heroFile: "sichinohe-hero-v5.png",
        hitboxFile: "hitboxes-hero-v5.json",
        layout: "layout-v5",
      };
    }
  }
  return {
    data: JSON.parse(fs.readFileSync(v4, "utf-8")),
    heroFile: "sichinohe-hero.png",
    hitboxFile: "hitboxes-hero-v4.json",
    layout: "layout-v4",
  };
}

const { data: hitboxes, heroFile, hitboxFile, layout } = loadHitboxes();
const heroW = hitboxes.hero?.width ?? 1024;
const heroH = hitboxes.hero?.height ?? 790;
const viewBox = hitboxes.hero?.viewBox ?? `0 0 ${heroW} ${heroH}`;

const bundle = {
  generatedAt: new Date().toISOString(),
  layout,
  heroFile,
  hitboxFile,
  tolerancePx: TOLERANCE_PX,
  hero: {
    width: heroW,
    height: heroH,
    viewBox,
    src: heroFile,
    srcHttp: `/maps/${heroFile}`,
  },
  hitboxes: hitboxes.features ?? [],
  coordinateAuthority: hitboxes.coordinateAuthority ?? "",
};

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>七戸マップ キャリブレーション QA — ${heroW}×${heroH}</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: "Noto Sans JP", system-ui, sans-serif;
      background: #f7f9fb;
      color: #1c2434;
      padding: 16px;
    }
    h1 { font-size: 16px; margin-bottom: 8px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 12px; line-height: 1.6; }
    .meta code { font-size: 11px; }
    .wrap {
      position: relative;
      max-width: min(${heroW}px, 100%);
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      aspect-ratio: ${heroW} / ${heroH};
    }
    #hero {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
    }
    #overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .controls {
      margin: 12px 0;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    label { font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
    a { color: #2d6b7a; }
    .legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; margin-top: 8px; }
    .legend span { display: inline-flex; align-items: center; gap: 4px; }
    .swatch { width: 12px; height: 12px; border-radius: 2px; }
    .err { color: #b91c1c; font-size: 13px; margin-top: 8px; }
    .checklist {
      margin-top: 16px;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      font-size: 13px;
      max-width: min(${heroW}px, 100%);
      margin-left: auto;
      margin-right: auto;
    }
    .checklist h2 { font-size: 13px; margin-bottom: 8px; }
    .checklist ul { padding-left: 1.2em; line-height: 1.7; color: #475569; }
    .checklist li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <h1>キャリブレーション QA — イラスト + ヒットボックス（${heroW}×${heroH}）</h1>
  <p class="meta">
    <strong>A 方式</strong>：コース・リフト線は <code>${heroFile}</code> に焼き込み済み。オーバーレイは
    <code>${hitboxFile}</code>（${bundle.hitboxes.length} features / ${layout}）。<br />
    根拠: ${bundle.coordinateAuthority || "—"}<br />
    合格: 端点・駅マーカーが焼き込み線の <strong>±${TOLERANCE_PX}px</strong> 以内。記録は <code>docs/g2_checklist.md</code> §9。<br />
    生成: ${bundle.generatedAt}
  </p>
  <div class="controls">
    <label><input type="range" id="opacity" min="0" max="100" value="70" /> ヒットボックス</label>
    <label><input type="checkbox" id="showEndpoints" checked /> 端点マーカー</label>
    <label><input type="checkbox" id="showTolerance" checked /> ±${TOLERANCE_PX}px 円</label>
    <label><input type="checkbox" id="showLabels" checked /> ID ラベル</label>
    <a href="map-preview.html">マッププレビュー</a>
    <a href="trace-hitboxes.html?version=v5">トレース</a>
    <a href="../preview/index.html">トッププレビュー</a>
  </div>
  <div class="legend" id="legend"></div>
  <div class="wrap" id="stage">
    <img id="hero" alt="七戸マップ イラスト" />
    <svg id="overlay" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet"></svg>
  </div>
  <p id="error" class="err" hidden></p>
  <section class="checklist" aria-label="目視チェックリスト">
    <h2>目視チェック（全部 OK で PASS）</h2>
    <ul>
      <li>ペアリフト：上駅・下駅が線の端点 ±${TOLERANCE_PX}px 以内</li>
      <li>ポニーリフト：上駅・下駅が線の端点 ±${TOLERANCE_PX}px 以内</li>
      <li>コース 1〜5：path が焼き込みコースの中心付近を通る（±${TOLERANCE_PX}px）</li>
      <li>ズーム 100% で SVG と PNG の pixel 比率が一致（にじみ・伸びなし）</li>
    </ul>
  </section>
  <script id="qa-data" type="application/json">${JSON.stringify(bundle)}</script>
  <script>
    const DATA = JSON.parse(document.getElementById("qa-data").textContent);
    const TOLERANCE = DATA.tolerancePx ?? ${TOLERANCE_PX};
    const COLORS = {
      lift: "#1a1a1a",
      "trail-intermediate": "#2fa84a",
      "trail-upper": "#d62839",
      "trail-champion": "#6d28d9",
      "trail-forest": "#2fa84a",
      "trail-pony": "#2fa84a",
      "lift-pair": "#1a1a1a",
      "lift-pony": "#1a1a1a",
    };
    const DEFAULT_TRAIL = "#2fa84a";

    const opacity = document.getElementById("opacity");
    const showEndpoints = document.getElementById("showEndpoints");
    const showTolerance = document.getElementById("showTolerance");
    const showLabels = document.getElementById("showLabels");
    const overlay = document.getElementById("overlay");
    const legend = document.getElementById("legend");
    const errEl = document.getElementById("error");
    const heroImg = document.getElementById("hero");

    function heroImageUrl() {
      if (location.protocol === "file:") return DATA.hero.src;
      return DATA.hero.srcHttp || "/maps/" + DATA.heroFile;
    }

    function colorFor(id, type) {
      return COLORS[id] ?? (type === "lift" ? COLORS.lift : DEFAULT_TRAIL);
    }

    function pathEndpoints(d) {
      const tokens = d.match(/[a-zA-Z]|-?\\d*\\.?\\d+/g) ?? [];
      const pts = [];
      let i = 0;
      while (i < tokens.length) {
        const t = tokens[i];
        if (/^[a-zA-Z]$/.test(t)) {
          const cmd = t.toUpperCase();
          i += 1;
          if (cmd === "M" || cmd === "L") {
            pts.push([parseFloat(tokens[i]), parseFloat(tokens[i + 1])]);
            i += 2;
          }
        } else i += 1;
      }
      return pts.length ? [pts[0], pts[pts.length - 1]] : [];
    }

    function stationPoints(f) {
      if (Array.isArray(f.stations) && f.stations.length) return f.stations;
      return pathEndpoints(f.path);
    }

    function render() {
      const vb = DATA.hero?.viewBox ?? "0 0 1024 1024";
      overlay.setAttribute("viewBox", vb);
      overlay.style.opacity = opacity.value / 100;
      legend.innerHTML = "";

      const hitboxes = DATA.hitboxes ?? [];
      let html = "";
      const seen = new Set();

      for (const f of hitboxes) {
        const c = colorFor(f.id, f.type);
        if (!seen.has(f.type)) {
          seen.add(f.type);
          legend.innerHTML += '<span><i class="swatch" style="background:' + c + '"></i>' + (f.type === "lift" ? "リフト" : "コース") + "</span>";
        }
        html += '<path d="' + f.path + '" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>';
        const points = stationPoints(f);
        if (showEndpoints.checked || showTolerance.checked) {
          points.forEach(([cx, cy], idx) => {
            if (showTolerance.checked) {
              html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + TOLERANCE + '" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.55"/>';
            }
            if (showEndpoints.checked) {
              html += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="' + c + '" stroke="#fff" stroke-width="2"/>';
              if (showLabels.checked && idx === 0) {
                html += '<text x="' + (cx + 10) + '" y="' + (cy - 6) + '" fill="' + c + '" font-size="11" font-weight="600">' + f.id + "</text>";
              }
            }
          });
        }
      }
      overlay.innerHTML = html;
    }

    opacity.oninput = () => { overlay.style.opacity = opacity.value / 100; };
    showEndpoints.onchange = render;
    showTolerance.onchange = render;
    showLabels.onchange = render;

    heroImg.addEventListener("error", () => {
      errEl.hidden = false;
      errEl.textContent =
        "イラストを読み込めませんでした（" +
        heroImageUrl() +
        "）。" +
        DATA.heroFile +
        " が同じ maps フォルダにあるか確認してください。";
    });
    heroImg.addEventListener("load", render);
    heroImg.src = heroImageUrl();
    render();
  </script>
</body>
</html>
`;

for (const out of OUT_PATHS) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf-8");
  console.log("wrote", out);
}

const heroSrc = path.join(MAPS_WEB, heroFile);
for (const dir of [MAPS_WEB, MAPS_ROOT]) {
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(heroSrc)) {
    fs.copyFileSync(heroSrc, path.join(dir, heroFile));
    console.log("copied hero →", path.join(dir, heroFile));
  }
  const hbSrc = path.join(MAP_DIR, hitboxFile);
  if (fs.existsSync(hbSrc)) {
    fs.copyFileSync(hbSrc, path.join(dir, hitboxFile));
    console.log("copied hitboxes →", path.join(dir, hitboxFile));
  }
}

console.log("");
console.log(`QA target: ${heroFile} ${heroW}×${heroH} (${layout})`);
console.log(`features: ${bundle.hitboxes.length}, tolerance: ±${TOLERANCE_PX}px`);
console.log("");
console.log("開き方:");
console.log("  file:///.../public/maps/calibration-qa.html");
console.log("  npm run preview:static  →  http://localhost:5500/maps/calibration-qa.html");
console.log("  cd resorts/resorts/Sichinohe-CyoueiSki/web && npm run dev  →  http://localhost:3000/maps/calibration-qa.html");
