#!/usr/bin/env node
/**
 * Remove all internal mock / evaluation labels from LP messages and hub.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDES_ROOT = join(ROOT, "..", "..", "guides");
const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));

const bySlug = Object.fromEntries(registry.resorts.map((r) => [r.slug, r]));

function pickDescription(data, locale) {
  const tag = data.hero?.tagline;
  const lead = data.hero?.lead;
  if (tag && lead && tag !== lead) return `${tag} ${lead}`.slice(0, 160);
  return (lead || tag || "").slice(0, 160);
}

function cleanResortMessages(data, resort, locale) {
  const name = resort.name[locale];
  delete data.banner;
  data.meta.title = name;
  data.meta.description = pickDescription(data, locale) || name;
  data.footer.copyright = `© ${name}`;
  delete data.footer.credit;
  return data;
}

for (const dir of readdirSync(ROOT).filter((d) => d.endsWith("-lp"))) {
  const resort = bySlug[dir];
  if (!resort) {
    console.warn(`skip ${dir}: not in registry`);
    continue;
  }
  for (const locale of ["ja", "en"]) {
    const path = join(ROOT, dir, "messages", `${locale}.json`);
    const data = JSON.parse(readFileSync(path, "utf8"));
    writeFileSync(path, JSON.stringify(cleanResortMessages(data, resort, locale), null, 2) + "\n", "utf8");
  }
  console.log(`✓ ${dir}`);
}

const hubJa = {
  meta: {
    title: "スキー場ガイド — 11施設",
    description: "北海道・東北・新潟のスキー場ガイド。施設情報・アクセス・ゲレンデマップ。",
  },
  hero: {
    eyebrow: "JAPOWSERCH",
    title: "スキー場ガイド<br />11施設",
    lead: "各スキー場のガイドページへ。",
  },
  table: {
    name: "施設名",
    region: "地域",
    strategy: "特徴",
    preview: "ガイド",
    map: "マップ",
  },
  back: "ガイド一覧に戻る",
  lang: { switch: "言語切替" },
};

const hubEn = {
  meta: {
    title: "Ski Resort Guides — 11 Resorts",
    description: "Guides for ski areas in Hokkaido, Tohoku, and Niigata. Resort info, access, and trail maps.",
  },
  hero: {
    eyebrow: "JAPOWSERCH",
    title: "Ski Resort Guides<br />11 Resorts",
    lead: "Open each resort guide page.",
  },
  table: {
    name: "Resort",
    region: "Region",
    strategy: "Highlights",
    preview: "Guide",
    map: "Map",
  },
  back: "Back to guides",
  lang: { switch: "Language" },
};

writeFileSync(join(GUIDES_ROOT, "hub", "messages", "hub.ja.json"), JSON.stringify(hubJa, null, 2) + "\n", "utf8");
writeFileSync(join(GUIDES_ROOT, "hub", "messages", "hub.en.json"), JSON.stringify(hubEn, null, 2) + "\n", "utf8");
console.log("✓ guides/hub/messages");
