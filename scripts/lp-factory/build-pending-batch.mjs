#!/usr/bin/env node
/**
 * Build all pending sales-ranking LPs (batch 51-70 + 93-100). No trail maps.
 * Usage: node scripts/lp-factory/build-pending-batch.mjs [--scaffold-only]
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
const BATCH_PATHS = [
  "configs/lp-batch/batch-sales-14-70.json",
  "configs/lp-batch/batch-91-100.json",
];
const BRIEF_DIR = join(ROOT, "configs/lp-brief");
const REGISTRY_PATH = join(MOCK, "registry.json");
const GUIDES_PATH = join(ROOT, "data/resort-guides.json");
const VALIDATE_IDS = join(ROOT, "scripts/validate-resort-guides-ids.mjs");
const APPLY_RENTACAR = join(MOCK, "scripts/apply-rentacar-affiliate.mjs");

const SKIP_IDS = new Set(["nishiwaigawa-yuda", "shibetsu-kaneyama", "akagiyama", "kamikawa-nakayama", "nakafuranokita-hoshi"]);

const RENTACAR = {
  "wassamu-higashiyama": "asahikawa_airport",
  "oketo-minamigaoka": "memanbetsu_airport",
  socchidake: "asahikawa_airport",
  taikozan: "asahikawa_airport",
  taisei: "asahikawa_airport",
  "shinbo-family": "komatsu_airport_kanazawa",
  fuyutorigoe: "niigata_airport",
  hakugindai: "asahikawa_airport",
  "takayanagi-garuru": "niigata_airport",
  kunimidaira: "morioka_station",
  "mikawa-onsen": "niigata_airport",
  "bibai-kokusetsu": "chitose_international_airport",
  "inosawa-shimin": "asahikawa_airport",
  yakushiyama: "shinjo_station",
  tenkamori: "shinjo_station",
  inagawa: "shinjo_station",
  gosannen: "shinjo_station",
  "soyujima-229": "shichinohetowada_station",
  "takinoue-sakuragaoka": "memanbetsu_airport",
  shimokawa: "asahikawa_airport",
  "shizenkoen-swiss": "kansai_international_airport",
  "muroran-danpara": "chitose_international_airport",
  akenogaoka: "chitose_international_airport",
  "rubeshibe-happodai": "memanbetsu_airport",
  usazawa: "morioka_station",
  ohotakedake: "shichinohetowada_station",
  akiyama: "shinjo_station",
  kujuo: "komatsu_airport_kanazawa",
};

const RENTACAR_COPY = {
  asahikawa_airport: {
    ja: { rentacarEyebrow: "旭川空港＋レンタカー", rentacarLink: "旭川空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "富良野·美瑛·層雲峡周遊向け" },
    en: { rentacarEyebrow: "Asahikawa Airport + rental car", rentacarLink: "Book a rental car at Asahikawa Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Furano, Biei, and Sounkyo drives" },
  },
  memanbetsu_airport: {
    ja: { rentacarEyebrow: "女満別空港＋レンタカー", rentacarLink: "女満別空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "オホーツク·網走周遊向け" },
    en: { rentacarEyebrow: "Memanbetsu Airport + rental car", rentacarLink: "Book a rental car at Memanbetsu Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Okhotsk and Abashiri drives" },
  },
  niigata_airport: {
    ja: { rentacarEyebrow: "新潟空港＋レンタカー", rentacarLink: "新潟空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "新潟県内周遊向け" },
    en: { rentacarEyebrow: "Niigata Airport + rental car", rentacarLink: "Book a rental car at Niigata Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Niigata prefecture drives" },
  },
  chitose_international_airport: {
    ja: { rentacarEyebrow: "新千歳空港＋レンタカー", rentacarLink: "新千歳空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "道央·道南周遊向け" },
    en: { rentacarEyebrow: "New Chitose Airport + rental car", rentacarLink: "Book a rental car at New Chitose Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For central and southern Hokkaido drives" },
  },
  komatsu_airport_kanazawa: {
    ja: { rentacarEyebrow: "小松空港＋レンタカー", rentacarLink: "小松空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "北陸·福井周遊向け" },
    en: { rentacarEyebrow: "Komatsu Airport + rental car", rentacarLink: "Book a rental car at Komatsu Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Hokuriku and Fukui drives" },
  },
  morioka_station: {
    ja: { rentacarEyebrow: "盛岡駅＋レンタカー", rentacarLink: "盛岡駅でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "岩手·秋田周遊向け" },
    en: { rentacarEyebrow: "Morioka Station + rental car", rentacarLink: "Book a rental car at Morioka Station", rentacarNote: "Skyticket (external site)", rentacarHint: "For Iwate and Akita drives" },
  },
  shinjo_station: {
    ja: { rentacarEyebrow: "新庄駅＋レンタカー", rentacarLink: "新庄駅でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "山形·最上周遊向け" },
    en: { rentacarEyebrow: "Shinjo Station + rental car", rentacarLink: "Book a rental car at Shinjo Station", rentacarNote: "Skyticket (external site)", rentacarHint: "For Yamagata and Mogami drives" },
  },
  shichinohetowada_station: {
    ja: { rentacarEyebrow: "七戸十和田駅＋レンタカー", rentacarLink: "七戸十和田駅でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "青森南部·十和田周遊向け" },
    en: { rentacarEyebrow: "Shichinohe-Towada Station + rental car", rentacarLink: "Book a rental car at Shichinohe-Towada Station", rentacarNote: "Skyticket (external site)", rentacarHint: "For southern Aomori and Towada drives" },
  },
  kansai_international_airport: {
    ja: { rentacarEyebrow: "関西空港＋レンタカー", rentacarLink: "関西空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "京都·丹後周遊向け" },
    en: { rentacarEyebrow: "Kansai Airport + rental car", rentacarLink: "Book a rental car at Kansai Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Kyoto and Tango drives" },
  },
};

const NAME_SUBSTRINGS_EXTRA = {
  "wassamu-higashiyama": ["和寒東山", "東山"],
  "oketo-minamigaoka": ["南ヶ丘", "置戸"],
  socchidake: ["そっち岳"],
  taikozan: ["太鼓山"],
  taisei: ["大成"],
  "shinbo-family": ["新保ファミリー", "新保"],
  fuyutorigoe: ["冬鳥越"],
  hakugindai: ["白銀台"],
  "takayanagi-garuru": ["高柳ガルル", "ガルル"],
  kunimidaira: ["国見平"],
  "mikawa-onsen": ["三川温泉"],
  "bibai-kokusetsu": ["美唄国設", "美唄"],
  "inosawa-shimin": ["伊ノ沢市民", "伊ノ沢"],
  yakushiyama: ["薬師山"],
  tenkamori: ["天下森"],
  inagawa: ["稲川"],
  gosannen: ["後三年"],
  "soyujima-229": ["創遊村229", "229"],
  "takinoue-sakuragaoka": ["桜ヶ丘", "滝上"],
  shimokawa: ["下川"],
  "shizenkoen-swiss": ["スイス村", "森林公園"],
  "muroran-danpara": ["だんパラ", "室蘭"],
  akenogaoka: ["明野ヶ丘", "明野"],
  "rubeshibe-happodai": ["八方台", "留辺蘂"],
  usazawa: ["兎沢"],
  ohotakedake: ["於法岳"],
  akiyama: ["秋山"],
  kujuo: ["莇生田"],
};

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
    if (!/\.(html|css|json)$/i.test(name)) continue;
    let text = readFileSync(p, "utf8");
    let orig = text;
    for (const [from, to] of pairs) text = text.split(from).join(to);
    if (text !== orig) writeFileSync(p, text, "utf8");
  }
}

function patchIndexNoMap(lpDir) {
  const indexPath = join(lpDir, "index.html");
  if (!existsSync(indexPath)) return;
  let html = readFileSync(indexPath, "utf8");
  html = html.replace(/\s*<li><a href="\.\.\/map\.html\?resort=[^"]+"[^>]*>[^<]*<\/a><\/li>\n?/g, "\n");
  writeFileSync(indexPath, html, "utf8");
}

function parseReportMeta(id) {
  const p = join(ROOT, "docs/research/inbox", `${id}.md`);
  if (!existsSync(p)) return {};
  const text = readFileSync(p, "utf8");
  const m = {};
  const ja = text.match(/戦略1行 \(ja\)\s*\|\s*(.+?)\s*\|/);
  const en = text.match(/戦略1行 \(en\)\s*\|\s*(.+?)\s*\|/);
  if (ja) m.strategyJa = ja[1].trim();
  if (en) m.strategyEn = en[1].trim();
  return m;
}

function regionEn(regionJa) {
  if (regionJa.includes("北海道")) return "Hokkaido";
  if (regionJa.includes("岩手")) return "Iwate";
  if (regionJa.includes("秋田")) return "Akita";
  if (regionJa.includes("青森")) return "Aomori";
  if (regionJa.includes("新潟")) return "Niigata";
  if (regionJa.includes("福井")) return "Fukui";
  if (regionJa.includes("京都")) return "Kyoto";
  if (regionJa.includes("山形")) return "Yamagata";
  return regionJa;
}

function scaffold(id, fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const dest = join(MOCK, `${id}-lp`);
  const src = join(MOCK, fromLp);
  if (!existsSync(src)) throw new Error(`Missing template ${fromLp}`);
  if (existsSync(dest)) return;
  copyTree(src, dest);
  replaceInTree(dest, [
    [`data-mock-resort="${fromId}"`, `data-mock-resort="${id}"`],
    [`?resort=${fromId}`, `?resort=${id}`],
    [`lp-mock-${fromId}-`, `lp-mock-${id}-`],
    [fromLp, `${id}-lp`],
    [fromId, id],
  ]);
  patchIndexNoMap(dest);
}

function cloneTemplatePngs(id, fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const dest = join(MOCK, `${id}-lp`);
  const src = join(MOCK, fromLp);
  for (const k of ["hero", "transit", "night", "family"]) {
    const from = join(src, `lp-mock-${fromId}-${k}.png`);
    const to = join(dest, `lp-mock-${id}-${k}.png`);
    if (existsSync(from) && !existsSync(to)) cpSync(from, to);
  }
}

function getSourceMeta(fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const registry = loadJson(REGISTRY_PATH);
  const r = registry.resorts.find((x) => x.id === fromId);
  return { fromId, nameJa: r?.name?.ja || fromId, nameEn: r?.name?.en || fromId };
}

function localizeMessages(id, resort, fromLp) {
  const meta = parseReportMeta(id);
  const { fromId, nameJa: srcJa, nameEn: srcEn } = getSourceMeta(fromLp);
  const lpDir = join(MOCK, `${id}-lp`);
  for (const locale of ["ja", "en"]) {
    const srcPath = join(MOCK, fromLp, "messages", `${locale}.json`);
    const destPath = join(lpDir, "messages", `${locale}.json`);
    if (!existsSync(srcPath)) continue;
    let text = readFileSync(srcPath, "utf8");
    const isJa = locale === "ja";
    const dstName = isJa ? resort.nameJa : resort.nameEn;
    text = text.split(srcJa).join(resort.nameJa);
    text = text.split(srcEn).join(resort.nameEn);
    text = text.split(fromId).join(id);
    text = text.split(`lp-mock-${fromId}-`).join(`lp-mock-${id}-`);
    text = text.replace(/インバウンド/g, "海外からの旅行者");
    text = text.replace(/inbound visitors/gi, "overseas visitors");
    text = text.replace(/inbound/gi, "overseas");
    const json = JSON.parse(text);
    json.meta = {
      title: dstName.replace(/<br \/>/g, ""),
      description: isJa
        ? meta.strategyJa || `${resort.regionJa}——${resort.salesAngle}`
        : meta.strategyEn || resort.salesAngle,
    };
    json.logo = dstName.replace(/スキー場$/, "").replace(/ Ski Area$/, "") || dstName;
    if (json.hero) {
      json.hero.eyebrow = isJa ? resort.regionJa : regionEn(resort.regionJa);
      const short = dstName.replace(/スキー場$/, "").replace(/ Ski Area$/, "");
      json.hero.title = isJa ? `${short}<br />スキー場` : `${short}<br />Ski Area`;
      json.hero.tagline = isJa ? meta.strategyJa || resort.salesAngle : meta.strategyEn || resort.salesAngle;
    }
    if (json.footer) {
      json.footer.copyright = isJa ? `© ${resort.nameJa} — LP案モック` : `© ${resort.nameEn} — mock LP`;
    }
    writeFileSync(destPath, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
}

function addRegistry(resort) {
  const registry = loadJson(REGISTRY_PATH);
  const meta = parseReportMeta(resort.id);
  const existing = registry.resorts.find((r) => r.id === resort.id);
  const entry = {
    id: resort.id,
    slug: `${resort.id}-lp`,
    name: { ja: resort.nameJa, en: resort.nameEn },
    region: { ja: resort.regionJa, en: regionEn(resort.regionJa) },
    strategy: { ja: meta.strategyJa || resort.salesAngle, en: meta.strategyEn || resort.salesAngle },
    guidePath: `/${resort.id}/`,
    guideUrl: `https://guides.japowserch.com/${resort.id}/`,
    japowResortId: resort.japowResortId,
    guideTier: "mock",
    affiliates: RENTACAR[resort.id] ? { rentacar: RENTACAR[resort.id] } : undefined,
  };
  if (existing) Object.assign(existing, entry);
  else registry.resorts.push(entry);
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n", "utf8");
}

function addGuides(resort) {
  const guides = loadJson(GUIDES_PATH);
  guides.guides[String(resort.japowResortId)] = { registryId: resort.id, tier: "mock" };
  writeFileSync(GUIDES_PATH, JSON.stringify(guides, null, 2) + "\n", "utf8");
}

function patchNameSubstrings() {
  let text = readFileSync(VALIDATE_IDS, "utf8");
  const inserts = [];
  for (const [id, subs] of Object.entries(NAME_SUBSTRINGS_EXTRA)) {
    const key = id.includes("-") ? `"${id}"` : id;
    if (text.includes(`${key}:`)) continue;
    inserts.push(`  ${key}: [${subs.map((s) => JSON.stringify(s)).join(", ")}],`);
  }
  if (inserts.length) {
    text = text.replace(/(\n};\n\nfunction loadJson)/, `\n${inserts.join("\n")}\n$1`);
    writeFileSync(VALIDATE_IDS, text, "utf8");
  }
}

function patchRentacarScript() {
  let text = readFileSync(APPLY_RENTACAR, "utf8");
  const blocks = [];
  for (const [id, dest] of Object.entries(RENTACAR)) {
    if (text.includes(`"${id}":`) || text.includes(`${id}: {`)) continue;
    const copy = RENTACAR_COPY[dest] || RENTACAR_COPY.asahikawa_airport;
    blocks.push(`  "${id}": {
    rentacar: "${dest}",
    ja: ${JSON.stringify(copy.ja, null, 6).replace(/\n/g, "\n    ")},
    en: ${JSON.stringify(copy.en, null, 6).replace(/\n/g, "\n    ")},
  },`);
  }
  if (blocks.length) {
    text = text.replace(/(  banjoga: \{[\s\S]*?  \},\n)(};)/, `$1${blocks.join("\n")}\n$2`);
    writeFileSync(APPLY_RENTACAR, text, "utf8");
  }
}

function isPending(resort) {
  if (SKIP_IDS.has(resort.id)) return false;
  const guides = loadJson(GUIDES_PATH).guides;
  const registry = loadJson(REGISTRY_PATH);
  const hasLp = existsSync(join(MOCK, `${resort.id}-lp`, "index.html"));
  const hasReg = registry.resorts.some((r) => r.id === resort.id);
  const g = guides[String(resort.japowResortId)];
  return !(hasLp && hasReg && g?.registryId === resort.id);
}

const resorts = [];
for (const bp of BATCH_PATHS) {
  for (const r of loadJson(join(ROOT, bp)).resorts) {
    if (isPending(r)) resorts.push(r);
  }
}

patchNameSubstrings();
patchRentacarScript();

let built = 0;
for (const resort of resorts) {
  const fromLp = resort.copyFromHint || "shinjo-lp";
  console.log(`\n▶ #${resort.rank} ${resort.id} ← ${fromLp}`);
  try {
    scaffold(resort.id, fromLp);
    cloneTemplatePngs(resort.id, fromLp);
    addRegistry(resort);
    addGuides(resort);
    localizeMessages(resort.id, resort, fromLp);
    built++;
  } catch (e) {
    console.error(`✗ ${resort.id}: ${e.message}`);
  }
}

execSync("node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs", { cwd: ROOT, stdio: "inherit" });
console.log(`\n✓ Built ${built}/${resorts.length} pending LPs`);
