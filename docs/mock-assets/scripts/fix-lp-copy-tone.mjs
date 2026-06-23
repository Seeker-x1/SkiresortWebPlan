#!/usr/bin/env node
/**
 * One-shot migration: remove inbound jargon from LP messages and HTML fallbacks.
 * Run: node docs/mock-assets/scripts/fix-lp-copy-tone.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const JA_RULES = [
  [/インバウンド向け厳選/g, "厳選"],
  [/インバウンド向け/g, ""],
  [/インバウンド観光客/g, "訪れる旅人"],
  [/インバウンドに刺さる/g, "人気の"],
  [/インバウンドにも/g, "国内外でも"],
  [/インバウンドにとって/g, "旅人にとって"],
  [/インバウンドが愛する/g, "人気の"],
  [/インバウンドが/g, ""],
  [/インバウンド・/g, ""],
  [/インバウンドの/g, ""],
  [/インバウンド初級者/g, "初めてのゲスト"],
  [/インバウンドFIT/g, "個人旅行"],
  [/インバウンド/g, ""],
  [/——{2,}/g, "——"],
  [/、、/g, "、"],
  [/  +/g, " "],
];

const EN_RULES = [
  [/Inbound-ready\s+/gi, ""],
  [/for inbound guests/gi, ""],
  [/for inbound visitors/gi, ""],
  [/for inbound travelers/gi, ""],
  [/for independent inbound travelers/gi, "for self-planned trips"],
  [/inbound FIT guests/gi, "independent travelers"],
  [/inbound FIT/gi, "independent travel"],
  [/inbound visitors/gi, "visitors"],
  [/inbound travelers/gi, "travelers"],
  [/inbound guests/gi, "guests"],
  [/inbound dining/gi, "dining"],
  [/inbound onsen/gi, "onsen"],
  [/inbound stay/gi, "stays"],
  [/inbound hook/gi, "highlight"],
  [/Inbound /g, ""],
  [/ inbound/gi, ""],
  [/for inbound/gi, ""],
  [/\s{2,}/g, " "],
  [/— —/g, "—"],
];

function applyRules(text, rules) {
  let out = text;
  for (const [re, rep] of rules) out = out.replace(re, rep);
  return out;
}

for (const dir of readdirSync(root).filter((n) => n.endsWith("-lp"))) {
  const dirPath = join(root, dir);
  for (const locale of ["ja.json", "en.json"]) {
    const path = join(dirPath, "messages", locale);
    if (!statSync(path).isFile()) continue;
    const raw = readFileSync(path, "utf8");
    const rules = locale === "ja.json" ? JA_RULES : EN_RULES;
    const next = applyRules(raw, rules);
    if (next !== raw) {
      writeFileSync(path, next, "utf8");
      console.log(`fixed ${dir}/messages/${locale}`);
    }
  }
  for (const f of readdirSync(dirPath).filter((n) => n.endsWith(".html"))) {
    const path = join(dirPath, f);
    const raw = readFileSync(path, "utf8");
    const next = applyRules(raw, JA_RULES);
    if (next !== raw) {
      writeFileSync(path, next, "utf8");
      console.log(`fixed ${dir}/${f}`);
    }
  }
}
