/**
 * resort-brief-*.json → 英語MJプロンプト + 日本語制作指示書
 * 用法: node generate-illustration-brief.mjs [brief.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const OUT_DIR = path.join(MAP_DIR, "output");

const briefPath =
  process.argv[2] ?? path.join(MAP_DIR, "resort-brief-shichinohe.json");
const v = JSON.parse(fs.readFileSync(briefPath, "utf-8"));

function fill(tpl) {
  return tpl.replace(/\[([A-Z_0-9]+)\]/g, (_, key) => v[key] ?? `[${key}]`);
}

const enPrompt = fill(`Professional ski resort bird's-eye map illustration of [RESORT_NAME], [RESORT_NAME_JA].
Accurate topographic fidelity, not fantasy stylization.

=== GEOGRAPHY & SCALE (MANDATORY) ===
Elevation: base [BASE_ELEVATION_M]m, summit [TOP_ELEVATION_M]m, vertical drop [VERTICAL_DROP_M]m.
Mountain form: [MOUNTAIN_SHAPE].
Geographic layout: [BBOX_DESCRIPTION].
Scale anchor: [SCALE_REFERENCE]. Maintain true relative distances.

=== CAMERA & PERSPECTIVE (MANDATORY) ===
Oblique aerial view (ski resort map style, NOT flat satellite).
Camera heading [CAMERA_HEADING_DEG]° from north.
Camera tilt [CAMERA_TILT_DEG]° (0°=nadir, 90°=horizon).
Altitude ~[CAMERA_ALTITUDE_M]m AGL. Horizontal FOV [HORIZONTAL_FOV_DEG]°.
Single consistent vanishing perspective.

=== RUNS ===
[COURSE_SUMMARY]
[COURSE_DATA]

=== LIFTS ===
[LIFT_DATA]

=== FACILITIES ===
[FACILITY_DATA]

=== STYLE (MANDATORY) ===
[STYLE_REFERENCE]

=== LAYOUT (POSITION ONLY — NO COLORED LINES) ===
[LAYOUT_REFERENCE]
[COURSE_DATA]

=== ENVIRONMENT ===
Season: [SEASON]. Weather: [WEATHER]. Time: [TIME_OF_DAY].
Landscape: [LANDMARK_DATA]. Tone: [VISUAL_TONE]. Palette: [COLOR_PALETTE].
[REFERENCE_MAP_NOTE]

High-resolution pamphlet-quality resort map. Courses shown as natural snow/forest edges, never as thick green/red/black overlay lines.
--ar [ASPECT_RATIO] --style raw --v 6 --sref style-plate-v2`);

const enNegative = `wrong scale, distorted perspective, flat satellite, cartoon, scribble lines, child drawing,
thick colored course lines, numbered circle markers, legend bar, schematic map, vector overlay,
glowing neon trails, V-shaped course fan, lifts off terrain, summer green, text labels, blurry, question marks`;

const jaBrief = fill(`# ゲレンデ鳥瞰マップ 制作指示書

**案件**: [RESORT_NAME_JA]　**版**: [VERSION]　**発行**: [ISSUE_DATE]

## 1. 目的
現場に忠実な鳥瞰マップ。根拠なき線・装飾誇張は禁止。

## 2. 座標・縮尺・パース
| 項目 | 値 |
|------|-----|
| ベース／山頂 | [BASE_ELEVATION_M]m / [TOP_ELEVATION_M]m |
| Heading | [CAMERA_HEADING_DEG]° |
| Tilt | [CAMERA_TILT_DEG]° |
| 視点高度 | [CAMERA_ALTITUDE_M]m |
| 縮尺根拠 | [SCALE_REFERENCE] |
| 整合 | [GSI_ALIGNMENT_NOTE] |

## 3. 地形
[MOUNTAIN_SHAPE] / [BBOX_DESCRIPTION] / [LANDMARK_DATA]

## 4. コース
[COURSE_SUMMARY]

[COURSE_DATA]

## 5. リフト
[LIFT_DATA]

## 6. 施設
[FACILITY_DATA]

## 7. トーン
[SEASON] / [WEATHER] / [VISUAL_TONE] / [COLOR_PALETTE]

## 8. 参照
国土地理院正射・Earth Studio・skimap 2012・OSM way/631879096

## 9. 納品
[OUTPUT_WIDTH_PX]×[OUTPUT_HEIGHT_PX]px PNG。[REFERENCE_MAP_NOTE]

## 10. 窓口
[CLIENT_CONTACT]
`);

fs.mkdirSync(OUT_DIR, { recursive: true });
const slug = v.resort_id ?? "resort";
fs.writeFileSync(path.join(OUT_DIR, `${slug}-prompt-en.txt`), enPrompt + "\n\n--- NEGATIVE ---\n\n" + enNegative + "\n");
fs.writeFileSync(path.join(OUT_DIR, `${slug}-brief-ja.md`), jaBrief + "\n");
console.log("wrote", path.join(OUT_DIR, `${slug}-prompt-en.txt`));
console.log("wrote", path.join(OUT_DIR, `${slug}-brief-ja.md`));
