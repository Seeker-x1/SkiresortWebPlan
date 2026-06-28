#!/usr/bin/env node
/**
 * Fail if resort-guides.json maps a JAPOW id to the wrong facility.
 * Requires data/japow-resort-index.json (run sync-japow-resort-index.mjs).
 *
 * Usage: node scripts/validate-resort-guides-ids.mjs
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const INDEX_PATH = join(REPO_ROOT, "data", "japow-resort-index.json");
const GUIDES_PATH = join(REPO_ROOT, "data", "resort-guides.json");
const REGISTRY_PATH = join(REPO_ROOT, "docs", "mock-assets", "registry.json");

/** registryId → substring that must appear in JAPOW nameJa for that id */
const NAME_SUBSTRINGS = {
  asahigaoka: ["旭ヶ丘"],
  otoifuji: ["音威富士"],
  shimukappu: ["占冠"],
  "minami-furano": ["南ふらの"],
  biei: ["美瑛"],
  "abashiri-lv": ["網走レークビュー", "レークビュー"],
  unabetsu: ["ウナベツ"],
  kiyosato: ["清里", "緑スキー"],
  gokazan: ["五鹿山"],
  "sapporo-kokusai": ["札幌国際"],
  "sapporo-teine": ["テイネ", "サッポロテイネ"],
  pippu: ["ぴっぷ", "比布"],
  sichinohe: ["七戸"],
  tsunan: ["津南"],
  kirigamine: ["霧ヶ峰", "霧ケ峰"],
  "kamikawa-nakayama": ["中山", "上川町営"],
  shinjo: ["新庄市民", "新庄"],
  takaho: ["高穂"],
  hinode: ["日の出"],
  utoro: ["ウトロ"],
  "shintoku-yama": ["新得山"],
  nishikawa: ["西川町民", "西川"],
  "koshi-kogen": ["古志高原"],
  "sado-taira": ["平", "佐渡市営"],
  katsurasawa: ["桂沢"],
  kamoenokuni: ["上ノ国町民"],
  tomioka: ["富岡"],
  niwa: ["丹羽"],
  kamifuse: ["釜臥山"],
  tayama: ["田山"],
  sanokura: ["三ノ倉"],
  "hijiri-kogen": ["聖高原"],
  horaguchi: ["スノーパーク洞川"],
  yunodai: ["湯の台"],
  matsushiro: ["松代ファミリー", "松代"],
  toshigamine: ["十種ヶ峰", "十種"],
  "monbetsu-ooyama": ["大山", "紋別市営"],
  iouzan: ["医王山", "金沢市営"],
  "tono-akabane": ["赤羽根", "遠野市"],
  abirayama: ["安平山", "安平町"],
  banjoga: ["番所ヶ原", "番所"],
  wakamatsu: ["北見若松", "若松"],
  hirogawara: ["京都広河原", "広河原"],
  "nanao-korosa": ["七尾コロサ", "コロサ"],
  bifuka: ["美深"],
  koyasan: ["高野山"],
  kyowa: ["協和", "大仙"],
  "ringo-kyowagoku": ["りんご今日話国", "今日話国"],
  "chateau-shiozawa": ["シャトー塩沢", "塩沢"],
  "morioka-ikari": ["盛岡市立生出", "生出"],
  kaneyama: ["フェアリーランドかねやま", "かねやま"],
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

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalize(s) {
  return String(s).replace(/\s/g, "");
}

/** Default substring candidates from JAPOW nameJa (manual aliases may still be needed). */
function suggestNameSubstrings(nameJa) {
  let core = normalize(nameJa);
  for (const suffix of ["スキー場", "スキー荘", "スキー園", "スキーリゾート", "スキー"]) {
    if (core.endsWith(suffix)) {
      core = core.slice(0, -suffix.length);
      break;
    }
  }
  if (core.length < 2) core = normalize(nameJa);
  return [core];
}

function formatNameSubstringsEntry(registryId, subs) {
  const key = /^[a-z0-9-]+$/.test(registryId) && registryId.includes("-")
    ? `"${registryId}"`
    : registryId;
  const quoted = subs.map((s) => JSON.stringify(s)).join(", ");
  return `  ${key}: [${quoted}],`;
}

function nameMatches(japowNameJa, registryId) {
  const subs = NAME_SUBSTRINGS[registryId];
  if (!subs?.length) {
    return {
      ok: false,
      reason: `missing NAME_SUBSTRINGS for registryId "${registryId}"`,
      suggest: suggestNameSubstrings(japowNameJa),
    };
  }
  const j = normalize(japowNameJa);
  const hit = subs.find((sub) => j.includes(normalize(sub)));
  if (!hit) {
    return {
      ok: false,
      reason: `JAPOW name「${japowNameJa}」does not contain any of [${subs.join(", ")}]`,
    };
  }
  return { ok: true };
}

function main() {
  if (!existsSync(INDEX_PATH)) {
    console.error(`✗ Missing ${INDEX_PATH} — run: node scripts/sync-japow-resort-index.mjs`);
    process.exit(1);
  }

  const index = loadJson(INDEX_PATH);
  const guides = loadJson(GUIDES_PATH);
  const registry = loadJson(REGISTRY_PATH);
  const errors = [];
  const suggestions = [];

  const guideEntries = Object.entries(guides.guides || {});
  const registryById = new Map(registry.resorts.map((r) => [r.id, r]));

  for (const [japowId, entry] of guideEntries) {
    const resort = index.resorts?.[japowId];
    if (!resort) {
      errors.push(`resort-guides id ${japowId} (${entry.registryId}): not in japow-resort-index`);
      continue;
    }

    const reg = registryById.get(entry.registryId);
    if (!reg) {
      errors.push(`resort-guides registryId "${entry.registryId}" not in registry.json`);
      continue;
    }

    if (Number(reg.japowResortId) !== Number(japowId)) {
      errors.push(
        `registry ${entry.registryId}: japowResortId=${reg.japowResortId} but resort-guides key is ${japowId}`,
      );
    }

    const nm = nameMatches(resort.nameJa, entry.registryId);
    if (!nm.ok) {
      errors.push(`id ${japowId} → ${entry.registryId}: ${nm.reason}`);
      if (nm.suggest?.length) {
        suggestions.push({
          japowId,
          registryId: entry.registryId,
          nameJa: resort.nameJa,
          subs: nm.suggest,
        });
      }
    }
  }

  for (const r of registry.resorts) {
    if (r.japowResortId == null) {
      errors.push(`registry ${r.id}: missing japowResortId`);
      continue;
    }
    const g = guides.guides[String(r.japowResortId)];
    if (!g) {
      errors.push(`registry ${r.id}: japowResortId ${r.japowResortId} missing from resort-guides.json`);
    } else if (g.registryId !== r.id) {
      errors.push(
        `registry ${r.id}: japowResortId ${r.japowResortId} maps to ${g.registryId} in resort-guides`,
      );
    }
  }

  const guideIds = new Set(guideEntries.map(([k]) => k));
  const registryIds = new Set(registry.resorts.map((r) => String(r.japowResortId)));
  for (const id of guideIds) {
    if (!registryIds.has(id)) {
      errors.push(`resort-guides id ${id} has no matching registry.japowResortId`);
    }
  }

  if (errors.length) {
    console.error("validate-resort-guides-ids: FAIL\n");
    for (const e of errors) console.error(`  ✗ ${e}`);
    if (suggestions.length) {
      console.error("\nAdd to NAME_SUBSTRINGS in scripts/validate-resort-guides-ids.mjs:");
      for (const s of suggestions) {
        console.error(`${formatNameSubstringsEntry(s.registryId, s.subs)}  // id ${s.japowId} · JAPOW「${s.nameJa}」`);
      }
      console.error(
        "\nIf the suggested substring is ambiguous (e.g. 中山), add manual aliases. See data/README-japow-ids.md.",
      );
    }
    console.error(
      "\nFix checklist: (1) japow id in data/japow-resort-index.tsv · (2) registry.json + data/resort-guides.json · (3) NAME_SUBSTRINGS above · LP_FACTORY Step 8.",
    );
    process.exit(1);
  }

  console.log(`validate-resort-guides-ids: PASS (${guideEntries.length} mappings)`);
}

main();
