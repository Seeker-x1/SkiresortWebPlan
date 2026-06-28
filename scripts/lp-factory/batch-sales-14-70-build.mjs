#!/usr/bin/env node
/**
 * Batch sales 14-70 LP build: scaffold, registry, guides, i18n, rentacar — NO trail maps.
 * Usage: node scripts/lp-factory/batch-sales-14-70-build.mjs [--all] [--rank N]
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
const BATCH_PATH = join(ROOT, "configs/lp-batch/batch-sales-14-70.json");
const BRIEF_DIR = join(ROOT, "configs/lp-brief");
const REGISTRY_PATH = join(MOCK, "registry.json");
const GUIDES_PATH = join(ROOT, "data/resort-guides.json");
const VALIDATE_IDS = join(ROOT, "scripts/validate-resort-guides-ids.mjs");
const JAPOW_INDEX = join(ROOT, "data/japow-resort-index.json");
const APPLY_RENTACAR = join(MOCK, "scripts/apply-rentacar-affiliate.mjs");

const RENTACAR = {
  "shibetsu-kaneyama": "memanbetsu_airport",
  akagiyama: "takasaki_station",
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
};

const NAME_SUBSTRINGS_EXTRA = {
  "shibetsu-kaneyama": ["標津町営金山", "金山"],
  akagiyama: ["赤城山"],
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
};

const RENTACAR_COPY = {
  memanbetsu_airport: {
    ja: { rentacarEyebrow: "女満別空港＋レンタカー", rentacarLink: "女満別空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "根室・標津・網走周遊向け" },
    en: { rentacarEyebrow: "Memanbetsu Airport + rental car", rentacarLink: "Book a rental car at Memanbetsu Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Nemuro, Shibetsu, and Abashiri drives" },
  },
  takasaki_station: {
    ja: { rentacarEyebrow: "高崎駅＋レンタカー", rentacarLink: "高崎駅でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "赤城山・前橋周遊向け" },
    en: { rentacarEyebrow: "Takasaki Station + rental car", rentacarLink: "Book a rental car at Takasaki Station", rentacarNote: "Skyticket (external site)", rentacarHint: "For Mt. Akagi and Maebashi loops" },
  },
  niigata_airport: {
    ja: { rentacarEyebrow: "新潟空港＋レンタカー", rentacarLink: "新潟空港でレンタカー予約", rentacarNote: "スカイチケット（外部サイト）", rentacarHint: "新潟県内周遊向け" },
    en: { rentacarEyebrow: "Niigata Airport + rental car", rentacarLink: "Book a rental car at Niigata Airport", rentacarNote: "Skyticket (external site)", rentacarHint: "For Niigata prefecture drives" },
  },
};

function parseArgs() {
  const opts = { all: false, ranks: [], force: false };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === "--all") opts.all = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--rank") opts.ranks.push(Number(process.argv[++i]));
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

function scaffold(id, fromLp, force) {
  const fromId = fromLp.replace(/-lp$/, "");
  const dest = join(MOCK, `${id}-lp`);
  const src = join(MOCK, fromLp);
  if (!existsSync(src)) throw new Error(`Missing template ${fromLp}`);
  if (existsSync(dest) && !force) return { skipped: true };
  if (existsSync(dest) && force) {
    execSync(`rm -rf "${dest}"`, { cwd: ROOT, shell: true, stdio: "pipe" });
  }
  copyTree(src, dest);
  replaceInTree(dest, [
    [`data-mock-resort="${fromId}"`, `data-mock-resort="${id}"`],
    [`?resort=${fromId}`, `?resort=${id}`],
    [`lp-mock-${fromId}-`, `lp-mock-${id}-`],
    [fromLp, `${id}-lp`],
    [fromId, id],
  ]);
  patchIndexNoMap(dest);
  return { skipped: false };
}

function cloneTemplatePngs(id, fromLp) {
  const fromId = fromLp.replace(/-lp$/, "");
  const dest = join(MOCK, `${id}-lp`);
  const src = join(MOCK, fromLp);
  const kinds = ["hero", "transit", "night", "family"];
  for (const k of kinds) {
    const from = join(src, `lp-mock-${fromId}-${k}.png`);
    const to = join(dest, `lp-mock-${id}-${k}.png`);
    if (existsSync(from) && !existsSync(to)) cpSync(from, to);
  }
}

function writeBrief(resort, fromLp) {
  mkdirSync(BRIEF_DIR, { recursive: true });
  const path = join(BRIEF_DIR, `${resort.id}.yaml`);
  if (existsSync(path)) return;
  const meta = parseReportMeta(resort.id);
  writeFileSync(
    path,
    `resortId: ${resort.id}
schemaVersion: "2026-06-28"
name:
  ja: ${resort.nameJa}
  en: ${resort.nameEn}
japowResortId: ${resort.japowResortId}
strategy:
  ja: ${meta.strategyJa || resort.salesAngle}
  en: ${meta.strategyEn || resort.salesAngle}
copyFrom: ${fromLp}
`,
    "utf8",
  );
}

function regionEn(regionJa) {
  if (regionJa.includes("北海道")) return "Hokkaido";
  if (regionJa.includes("岩手")) return "Iwate";
  if (regionJa.includes("秋田")) return "Akita";
  if (regionJa.includes("青森")) return "Aomori";
  if (regionJa.includes("山形")) return "Yamagata";
  if (regionJa.includes("新潟")) return "Niigata";
  if (regionJa.includes("福井")) return "Fukui";
  if (regionJa.includes("群馬")) return "Gunma";
  return regionJa;
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
  for (const [id, subs] of Object.entries(NAME_SUBSTRINGS_EXTRA)) {
    if (text.includes(`"${id}":`) || text.includes(`${id}: [`)) continue;
    const key = id.includes("-") ? `"${id}"` : id;
    const line = `  ${key}: [${subs.map((s) => JSON.stringify(s)).join(", ")}],`;
    text = text.replace(/(\s+"nakafuranokita-hoshi": \[[^\]]+\],)\n(\};)/, `$1\n${line}\n$2`);
  }
  writeFileSync(VALIDATE_IDS, text, "utf8");
}

function patchRentacarScript() {
  let text = readFileSync(APPLY_RENTACAR, "utf8");
  const blocks = [];
  for (const [id, dest] of Object.entries(RENTACAR)) {
    if (text.includes(`"${id}":`) || text.includes(`${id}: {`)) continue;
    const copy = RENTACAR_COPY[dest] || RENTACAR_COPY.memanbetsu_airport;
    blocks.push(`  "${id}": {
    rentacar: "${dest}",
    ja: ${JSON.stringify(copy.ja, null, 6).replace(/\n/g, "\n    ")},
    en: ${JSON.stringify(copy.en, null, 6).replace(/\n/g, "\n    ")},
  },`);
  }
  if (blocks.length) {
    text = text.replace(
      /(  banjoga: \{[\s\S]*?  \},\n)(};)/,
      `$1${blocks.join("\n")}\n$2`,
    );
  }
  writeFileSync(APPLY_RENTACAR, text, "utf8");
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

function processResort(resort, opts) {
  const inbox = join(ROOT, "docs/research/inbox", `${resort.id}.md`);
  if (!existsSync(inbox)) {
    console.log(`⏳ #${resort.rank} ${resort.id}: waiting for inbox`);
    return { rank: resort.rank, id: resort.id, status: "no-report" };
  }
  const fromLp = resort.copyFromHint || "shinjo-lp";
  console.log(`\n▶ #${resort.rank} ${resort.id} ← ${fromLp}`);
  scaffold(resort.id, fromLp, opts.force);
  cloneTemplatePngs(resort.id, fromLp);
  writeBrief(resort, fromLp);
  addRegistry(resort);
  addGuides(resort);
  localizeMessages(resort.id, resort, fromLp);
  return { rank: resort.rank, id: resort.id, status: "built" };
}

const opts = parseArgs();
const batch = loadJson(BATCH_PATH);
const targets = opts.all
  ? batch.resorts.filter((r) => r.id !== "nishiwaigawa-yuda" || opts.force)
  : opts.ranks.length
    ? batch.resorts.filter((r) => opts.ranks.includes(r.rank))
    : batch.resorts;

patchNameSubstrings();
patchRentacarScript();
execSync("node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs", { cwd: ROOT, stdio: "inherit" });

const results = [];
for (const resort of targets) {
  if (resort.id === "nishiwaigawa-yuda" && existsSync(join(MOCK, "nishiwaigawa-yuda-lp/index.html"))) {
    results.push({ rank: resort.rank, id: resort.id, status: "skip-done" });
    continue;
  }
  try {
    results.push(processResort(resort, opts));
  } catch (e) {
    console.error(`✗ #${resort.rank} ${resort.id}: ${e.message}`);
    results.push({ rank: resort.rank, id: resort.id, status: "error" });
  }
}
console.log("\n--- summary ---");
for (const r of results) console.log(`#${r.rank} ${r.id}: ${r.status}`);
