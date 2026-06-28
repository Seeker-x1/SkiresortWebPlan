#!/usr/bin/env node
/**
 * Batch 71-90 LP Factory pipeline: scaffold, brief, map, registry, i18n stub, NAME_SUBSTRINGS.
 * Usage: node scripts/lp-factory/batch-71-90-build.mjs [--rank N] [--all] [--metadata-only]
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  cpSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MOCK = join(ROOT, "docs/mock-assets");
const BATCH_PATH = join(ROOT, "configs/lp-batch/batch-71-90.json");
const BRIEF_DIR = join(ROOT, "configs/lp-brief");
const MAPS_DIR = join(MOCK, "data/maps");
const REGISTRY_PATH = join(MOCK, "registry.json");
const GUIDES_PATH = join(ROOT, "data/resort-guides.json");
const VALIDATE_IDS = join(ROOT, "scripts/validate-resort-guides-ids.mjs");
const JAPOW_INDEX = join(ROOT, "data/japow-resort-index.json");

const COPY_FROM = {
  "hanakasa-kogen": "abashiri-lv-lp",
  "toma-choei": "kiyosato-lp",
  "ueno-no": "sichinohe-lp",
  "nihonmatsu-shiozawa": "shinjo-lp",
  "tateyama-alpine": "tayama-lp",
  "dogoyama-kogen": "horaguchi-lp",
  shakotan: "biei-lp",
  akago: "shinjo-lp",
  "anzo-koen": "gokazan-lp",
  "imakane-tane": "shinjo-lp",
  "shibetsu-hinata": "shinjo-lp",
  tochio: "shinjo-lp",
  "kushibiki-taranokidai": "shinjo-lp",
  saroma: "utoro-lp",
  "nakadomari-miyanozawa": "abashiri-lv-lp",
  hobetsu: "gokazan-lp",
  odai: "shinjo-lp",
  yokone: "minami-furano-lp",
  okoppe: "utoro-lp",
  shirataka: "horaguchi-lp",
};

const RENTACAR = {
  "hanakasa-kogen": "shinjo_station",
  "toma-choei": "asahikawa_airport",
  "ueno-no": "morioka_station",
  "nihonmatsu-shiozawa": "shinjo_station",
  "tateyama-alpine": "komatsu_airport_kanazawa",
  "dogoyama-kogen": "yamaguchi_ube_airport",
  shakotan: "chitose_international_airport",
  akago: "kansai_international_airport",
  "anzo-koen": "kansai_international_airport",
  "imakane-tane": "hakodate_onuma_matsumae",
  "shibetsu-hinata": "asahikawa_airport",
  tochio: "niigata_airport",
  "kushibiki-taranokidai": "shinjo_station",
  saroma: "memanbetsu_airport",
  "nakadomari-miyanozawa": "shichinohetowada_station",
  hobetsu: "chitose_international_airport",
  odai: "shinjo_station",
  yokone: "shinjo_station",
  okoppe: "memanbetsu_airport",
  shirataka: "shinjo_station",
};

const NAME_SUBSTRINGS_EXTRA = {
  "hanakasa-kogen": ["花笠高原", "花笠"],
  "toma-choei": ["当麻町営", "当麻"],
  "ueno-no": ["上野々", "上野野"],
  "nihonmatsu-shiozawa": ["二本松塩沢", "塩沢"],
  "tateyama-alpine": ["立山山岳", "立山"],
  "dogoyama-kogen": ["道後山高原", "道後山"],
  shakotan: ["積丹", "野外スポーツ林"],
  akago: ["赤子山", "赤子"],
  "anzo-koen": ["安蔵公園", "安蔵"],
  "imakane-tane": ["今金町種川", "種川"],
  "shibetsu-hinata": ["士別日向", "日向"],
  tochio: ["とちおファミリー", "とちお"],
  "kushibiki-taranokidai": ["櫛引たらのきだい", "たらのきだい"],
  saroma: ["佐呂間町営", "佐呂間"],
  "nakadomari-miyanozawa": ["中泊宮野沢", "宮野沢"],
  hobetsu: ["穂別"],
  odai: ["大台"],
  yokone: ["横根"],
  okoppe: ["興部町営", "興部"],
  shirataka: ["白鷹町営", "白鷹"],
};

function parseArgs() {
  const opts = { all: false, metadataOnly: false, ranks: [] };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--all") opts.all = true;
    else if (argv[i] === "--metadata-only") opts.metadataOnly = true;
    else if (argv[i] === "--rank") opts.ranks.push(Number(argv[++i]));
  }
  return opts;
}

function loadJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function copyTree(src, dest, skipPng = true) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (skipPng && name.endsWith(".png")) continue;
    const s = join(src, name);
    const d = join(dest, name);
    if (statSync(s).isDirectory()) copyTree(s, d, skipPng);
    else cpSync(s, d);
  }
}

function replaceInTree(dir, pairs) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      replaceInTree(p, pairs);
      continue;
    }
    if (!/\.(html|css|json|md)$/i.test(name)) continue;
    let text = readFileSync(p, "utf8");
    let orig = text;
    for (const [from, to] of pairs) {
      text = text.split(from).join(to);
    }
    if (text !== orig) writeFileSync(p, text, "utf8");
  }
}

function scaffold(id, fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const dest = join(MOCK, `${id}-lp`);
  const src = join(MOCK, fromLp);
  if (!existsSync(src)) throw new Error(`Missing template ${fromLp}`);
  if (existsSync(dest)) return { skipped: true };
  copyTree(src, dest);
  replaceInTree(dest, [
    [`data-mock-resort="${fromId}"`, `data-mock-resort="${id}"`],
    [`?resort=${fromId}`, `?resort=${id}`],
    [`lp-mock-${fromId}-`, `lp-mock-${id}-`],
    [`images/maps/${fromId}-hero`, `images/maps/${id}-hero`],
    [fromLp, `${id}-lp`],
    [fromId, id],
  ]);
  return { skipped: false };
}

function writeBrief(resort, fromLp) {
  mkdirSync(BRIEF_DIR, { recursive: true });
  const path = join(BRIEF_DIR, `${resort.id}.yaml`);
  if (existsSync(path)) return;
  const regionEn = resort.regionJa.includes("北海道")
    ? "Hokkaido"
    : resort.regionJa.split("県")[0] + (resort.regionJa.includes("県") ? "" : "");
  const yaml = `resortId: ${resort.id}
schemaVersion: "2026-06-28"

name:
  ja: ${resort.nameJa}
  en: ${resort.nameEn}
region:
  ja: ${resort.regionJa}
  en: ${resort.regionJa}
japowResortId: ${resort.japowResortId}

strategy:
  ja: ${resort.salesAngle}
  en: ${resort.salesAngle}
archetype: ${resort.archetypeHint || "local-value"}

audience: both

map:
  sources: ["docs/research/inbox/${resort.id}.md", "LP batch #${resort.rank}"]
  heroImage: images/maps/${resort.id}-hero.png
  copyFrom: ${fromLp}

humanReview:
  - japowResortId ${resort.japowResortId}
`;
  writeFileSync(path, yaml, "utf8");
}

function writeMapJson(resort) {
  const mapPath = join(MAPS_DIR, `${resort.id}.json`);
  if (existsSync(mapPath)) return;
  const template = existsSync(join(MAPS_DIR, "abirayama.json"))
    ? loadJson(join(MAPS_DIR, "abirayama.json"))
    : {
        schemaVersion: "2026-06-28",
        disclaimer: {
          ja: "コース・リフトはイラスト内に描画済み。リストで運行状況を確認できます（概略図・現地表示優先）。",
          en: "Trails and lifts are drawn in the illustration. Use the list for status (schematic; on-site signage prevails).",
        },
        viewBox: "0 0 1024 1024",
        bakedLines: true,
        features: [],
      };
  const map = {
    ...template,
    id: resort.id,
    name: { ja: resort.nameJa, en: resort.nameEn },
    sources: [`LP batch #${resort.rank}`, `configs/lp-batch/batch-71-90.json`],
    updatedAt: new Date().toISOString().slice(0, 10) + "T12:00:00+09:00",
    hero: { ...template.hero, src: `images/maps/${resort.id}-hero.png` },
  };
  writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n", "utf8");
}

function addRegistry(resort) {
  const registry = loadJson(REGISTRY_PATH);
  if (registry.resorts.some((r) => r.id === resort.id)) return;
  registry.resorts.push({
    id: resort.id,
    slug: `${resort.id}-lp`,
    name: { ja: resort.nameJa, en: resort.nameEn },
    region: { ja: resort.regionJa, en: resort.regionJa },
    strategy: { ja: resort.salesAngle, en: resort.salesAngle },
    guidePath: `/${resort.id}/`,
    guideUrl: `https://guides.japowserch.com/${resort.id}/`,
    japowResortId: resort.japowResortId,
    guideTier: "mock",
    affiliates: RENTACAR[resort.id] ? { rentacar: RENTACAR[resort.id] } : undefined,
  });
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n", "utf8");
}

function addGuides(resort) {
  const guides = loadJson(GUIDES_PATH);
  const key = String(resort.japowResortId);
  if (guides.guides[key]) return;
  guides.guides[key] = { registryId: resort.id, tier: "mock" };
  writeFileSync(GUIDES_PATH, JSON.stringify(guides, null, 2) + "\n", "utf8");
}

function patchNameSubstrings() {
  let text = readFileSync(VALIDATE_IDS, "utf8");
  for (const [id, subs] of Object.entries(NAME_SUBSTRINGS_EXTRA)) {
    if (text.includes(`${id}:`) || text.includes(`"${id}":`)) continue;
    const key = id.includes("-") ? `"${id}"` : id;
    const line = `  ${key}: [${subs.map((s) => JSON.stringify(s)).join(", ")}],`;
    text = text.replace(
      /(\s+kaneyama: \[[^\]]+\],)\n(\};\n\nfunction loadJson)/,
      `$1\n${line}\n$2`,
    );
  }
  writeFileSync(VALIDATE_IDS, text, "utf8");
}

function getSourceMeta(fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const registry = loadJson(REGISTRY_PATH);
  const r = registry.resorts.find((x) => x.id === fromId);
  return { fromId, nameJa: r?.name?.ja || fromId, nameEn: r?.name?.en || fromId };
}

function localizeMessages(id, resort, fromLp) {
  const { fromId, nameJa: srcJa, nameEn: srcEn } = getSourceMeta(fromLp);
  const lpDir = join(MOCK, `${id}-lp`);
  for (const locale of ["ja", "en"]) {
    const srcPath = join(MOCK, fromLp, "messages", `${locale}.json`);
    const destPath = join(lpDir, "messages", `${locale}.json`);
    if (!existsSync(srcPath)) continue;
    let text = readFileSync(srcPath, "utf8");
    const isJa = locale === "ja";
    const srcName = isJa ? srcJa : srcEn;
    const dstName = isJa ? resort.nameJa : resort.nameEn;
    // Remove source facility name fragments
    text = text.split(srcName).join(dstName);
    text = text.split(srcJa).join(resort.nameJa);
    text = text.split(srcEn).join(resort.nameEn);
    text = text.split(fromId).join(id);
    text = text.split(fromLp).join(`${id}-lp`);
    text = text.split(`lp-mock-${fromId}-`).join(`lp-mock-${id}-`);
    const json = JSON.parse(text);
    json.meta = {
      title: dstName.replace(/<br \/>/g, ""),
      description: isJa
        ? `${resort.regionJa}——${resort.salesAngle}`
        : `${resort.regionJa} — ${resort.salesAngle}`,
    };
    json.logo = dstName.replace(/<br \/>/g, "");
    if (json.hero) {
      json.hero.eyebrow = isJa ? `${resort.regionJa}` : resort.regionJa;
      json.hero.title = isJa
        ? dstName.includes("<br")
          ? dstName
          : dstName.replace(/スキー場$/, "<br />スキー場")
        : dstName.replace(/ Ski Area$/, "<br />Ski Area");
      json.hero.tagline = isJa ? resort.salesAngle : resort.salesAngle;
    }
    if (json.footer) {
      json.footer.copyright = isJa
        ? `© ${resort.nameJa} — LP案モック`
        : `© ${resort.nameEn} — mock LP`;
    }
    writeFileSync(destPath, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
  execSync(`node docs/mock-assets/scripts/sync-lp-meta-batch.mjs ${id}`, { cwd: ROOT, stdio: "pipe" });
}

function updateBatchStatus(resort, status) {
  const batch = loadJson(BATCH_PATH);
  const item = batch.resorts.find((r) => r.rank === resort.rank);
  if (item) {
    item.status = status;
    item.updatedAt = new Date().toISOString().slice(0, 10);
  }
  writeFileSync(BATCH_PATH, JSON.stringify(batch, null, 2) + "\n", "utf8");
}

function processResort(resort, opts) {
  const inbox = join(ROOT, "docs/research/inbox", `${resort.id}.md`);
  if (!existsSync(inbox)) {
    console.log(`⏳ #${resort.rank} ${resort.id}: waiting for inbox`);
    return { id: resort.id, rank: resort.rank, research: "pending", lp: "pending" };
  }
  const fromLp = COPY_FROM[resort.id];
  if (!fromLp) throw new Error(`No copyFrom for ${resort.id}`);
  console.log(`\n▶ #${resort.rank} ${resort.id} ← ${fromLp}`);
  const sc = scaffold(resort.id, fromLp);
  writeBrief(resort, fromLp);
  writeMapJson(resort);
  addRegistry(resort);
  addGuides(resort);
  if (!opts.metadataOnly && !sc.skipped) {
    localizeMessages(resort.id, resort, fromLp);
  }
  updateBatchStatus(resort, "lp-built");
  return { id: resort.id, rank: resort.rank, research: "done", lp: "built" };
}

const opts = parseArgs();
const batch = loadJson(BATCH_PATH);
const targets = opts.all
  ? batch.resorts
  : opts.ranks.length
    ? batch.resorts.filter((r) => opts.ranks.includes(r.rank))
    : batch.resorts;

patchNameSubstrings();
const results = [];
for (const resort of targets) {
  try {
    results.push(processResort(resort, opts));
  } catch (e) {
    console.error(`✗ #${resort.rank} ${resort.id}: ${e.message}`);
    results.push({ id: resort.id, rank: resort.rank, research: "error", lp: "error" });
  }
}
console.log("\n--- summary ---");
for (const r of results) console.log(`#${r.rank} ${r.id}: research=${r.research} lp=${r.lp}`);
