#!/usr/bin/env node
/**
 * Ensure lp-mock-{id}-*.png and images/maps/{id}-hero.png exist by copying from copyFrom template.
 * Used when Gemini image quota is exhausted; replace with AI PNGs when available.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MOCK = join(ROOT, "docs/mock-assets");
const BATCH = JSON.parse(
  readFileSync(join(ROOT, "configs/lp-batch/batch-71-90.json"), "utf8"),
);

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

function pngRefsInHtml(lpDir, id) {
  const refs = new Set();
  for (const f of readdirSync(lpDir)) {
    if (!f.endsWith(".html")) continue;
    const html = readFileSync(join(lpDir, f), "utf8");
    for (const m of html.matchAll(/lp-mock-[a-z0-9-]+-\w+\.png/g)) refs.add(m[0]);
    for (const m of html.matchAll(new RegExp(`images/maps/${id}-hero\\.png`, "g")))
      refs.add(`images/maps/${id}-hero.png`);
  }
  return [...refs];
}

function ensureForId(id) {
  const fromLp = COPY_FROM[id];
  const lpDir = join(MOCK, `${id}-lp`);
  if (!existsSync(lpDir)) return { id, skipped: "no-lp-dir" };
  const fromId = fromLp.replace(/-lp$/, "");
  let n = 0;
  for (const ref of pngRefsInHtml(lpDir, id)) {
    if (ref.startsWith("images/")) {
      const dest = join(MOCK, ref);
      const src = join(MOCK, ref.replace(`${id}-hero`, `${fromId}-hero`));
      if (!existsSync(dest) && existsSync(src)) {
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(src, dest);
        n++;
      }
      continue;
    }
    const dest = join(lpDir, ref);
    const srcName = ref.replace(`lp-mock-${id}-`, `lp-mock-${fromId}-`);
    const src = join(MOCK, fromLp, srcName);
    if (!existsSync(dest) && existsSync(src)) {
      cpSync(src, dest);
      n++;
    }
  }
  const mapDest = join(MOCK, "images/maps", `${id}-hero.png`);
  const mapSrc = join(MOCK, "images/maps", `${fromId}-hero.png`);
  if (!existsSync(mapDest) && existsSync(mapSrc)) {
    mkdirSync(join(MOCK, "images/maps"), { recursive: true });
    cpSync(mapSrc, mapDest);
    n++;
  }
  return { id, copied: n };
}

const ids = process.argv.slice(2);
const targets = ids.length ? ids : BATCH.resorts.map((r) => r.id);
for (const id of targets) {
  const r = ensureForId(id);
  console.log(r.skipped ? `⏭ ${id}: ${r.skipped}` : `✓ ${id}: ${r.copied} png(s)`);
}
