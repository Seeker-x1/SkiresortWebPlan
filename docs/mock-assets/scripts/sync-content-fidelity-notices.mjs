#!/usr/bin/env node
/**
 * Option B — content fidelity notices + remove user-facing "LP" labels.
 * Usage: node docs/mock-assets/scripts/sync-content-fidelity-notices.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(join(ROOT, "registry.json"), "utf8"));
const bySlug = Object.fromEntries(registry.resorts.map((r) => [r.slug, r]));

const FOOTER_NOTICE =
  '      <p class="footer-notice" role="note" data-i18n="footer.guideNotice">本ガイドは制作中の案です。写真・イラストは雰囲気の参考であり、実際のゲレンデ・施設と異なる場合があります。料金・営業・道路規制は各施設の公式情報を優先してください。</p>\n';

const NAV_MAP_RE =
  /<li><a href="\.\.\/map\.html\?resort=([^"]+)" data-i18n="nav\.map">([^<]*)<\/a><\/li>/g;

const NAV_MAP_REPLACEMENT = (_, resortId, label) =>
  `<li class="nav-map-item"><a href="../map.html?resort=${resortId}" data-i18n="nav.map" data-i18n-attr="title:nav.mapHint">${label}</a><span class="nav-map-hint" data-i18n="nav.mapHint" aria-hidden="true">概略（未検証の場合あり）</span></li>`;

function cleanLpText(text) {
  return text
    .replace(/\s*[—–-]\s*LP案モック/g, "")
    .replace(/\s*[—–-]\s*LP mock/gi, "")
    .replace(/ LP に戻る/g, "ガイドトップへ戻る")
    .replace(/^Back to .+ LP$/im, "Back to guide home");
}

function walkJson(obj) {
  if (typeof obj === "string") return cleanLpText(obj);
  if (Array.isArray(obj)) return obj.map(walkJson);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = walkJson(v);
    return out;
  }
  return obj;
}

function patchFooterNotice(html) {
  if (html.includes('data-i18n="footer.guideNotice"')) return html;
  return html.replace(
    /(<footer class="site-footer">\s*<div class="inner">)\s*/,
    `$1\n${FOOTER_NOTICE}`,
  );
}

function patchNavMap(html) {
  if (html.includes("nav-map-item")) return html;
  return html.replace(NAV_MAP_RE, NAV_MAP_REPLACEMENT);
}

function patchHtmlFile(path) {
  let html = readFileSync(path, "utf8");
  const before = html;
  html = cleanLpText(html);
  if (path.endsWith("index.html")) {
    html = patchNavMap(html);
  }
  if (html.includes('class="site-footer"')) {
    html = patchFooterNotice(html);
  }
  if (html !== before) {
    writeFileSync(path, html, "utf8");
    return true;
  }
  return false;
}

function cleanResortCopyright(data, resort, locale) {
  const name = resort.name[locale];
  if (data.footer?.copyright) {
    data.footer.copyright = cleanLpText(data.footer.copyright);
    if (data.footer.copyright.includes("LP")) {
      data.footer.copyright = `© ${name}`;
    }
  }
  return walkJson(data);
}

let htmlChanged = 0;
let jsonChanged = 0;

for (const dir of readdirSync(ROOT).filter((d) => d.endsWith("-lp"))) {
  const resort = bySlug[dir];

  for (const locale of ["ja", "en"]) {
    const path = join(ROOT, dir, "messages", `${locale}.json`);
    if (!statSync(path).isFile()) continue;
    const raw = readFileSync(path, "utf8");
    let data = JSON.parse(raw);
    data = resort ? cleanResortCopyright(data, resort, locale) : walkJson(data);
    const next = JSON.stringify(data, null, 2) + "\n";
    if (next !== raw) {
      writeFileSync(path, next, "utf8");
      jsonChanged++;
    }
  }

  for (const file of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".html"))) {
    if (patchHtmlFile(join(ROOT, dir, file))) htmlChanged++;
  }
  console.log(`✓ ${dir}${resort ? "" : " (no registry — LP labels only)"}`);
}

for (const top of ["map.html", "area-map.html"]) {
  const path = join(ROOT, top);
  if (!statSync(path).isFile()) continue;
  let html = readFileSync(path, "utf8");
  const cleaned = cleanLpText(html);
  if (cleaned !== html) {
    writeFileSync(path, cleaned, "utf8");
    htmlChanged++;
    console.log(`✓ ${top}`);
  }
}

console.log(`\nDone: ${jsonChanged} message files, ${htmlChanged} HTML files updated`);
