#!/usr/bin/env node
/**
 * Apply LP layout fixes (sichinohe lessons) to mock LPs.
 *
 * Usage:
 *   node docs/mock-assets/scripts/apply-lp-layout-fix.mjs --id {registryId}
 *   (default: apply to all mock LPs under docs/mock-assets)
 *
 * Fixes:
 * - Wire ../_shared/lp-layout.css after mock.css
 * - map-embed-cta-row on nearby-food / nearby-onsen
 * - Replace placeholder href="#" on index.html (logo, CTAs, path tiles)
 * - Remove sticky header top:1.75rem from mock.css (lp-layout owns header offset)
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LP_LAYOUT_LINE = '  <link rel="stylesheet" href="../_shared/lp-layout.css" />';

function parseArgs(argv) {
  const opts = { id: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") opts.id = argv[++i];
  }
  return opts;
}

const opts = parseArgs(process.argv);
const targetLpDirs = opts.id
  ? [join(ROOT, `${opts.id}-lp`)]
  : readdirSync(ROOT, { withFileTypes: true })
      .filter((ent) => ent.isDirectory() && ent.name.endsWith("-lp"))
      .map((ent) => join(ROOT, ent.name));

function walkHtmlFiles(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "_shared" || ent.name === "scripts") continue;
      walkHtmlFiles(p, out);
    } else if (ent.name.endsWith(".html")) {
      out.push(p);
    }
  }
  return out;
}

function isLpHtml(path) {
  return /-lp[\\/]/.test(path) && !path.includes("_shared");
}

function resortIdFromHtml(html) {
  const m = html.match(/data-mock-resort="([^"]+)"/);
  return m?.[1] ?? null;
}

function insertLpLayout(html) {
  if (html.includes("lp-layout.css")) return html;
  if (!html.includes('href="mock.css"')) return html;
  return html.replace(
    /(<link rel="stylesheet" href="mock\.css" \/>)(\r?\n)/,
    `$1$2${LP_LAYOUT_LINE}$2`,
  );
}

function fixMapEmbedCtaRow(html) {
  return html.replace(
    /<div style="margin-top:1\.5rem; display:flex; flex-wrap:wrap; gap:0\.75rem">(\s*<a[^>]+class="btn[^"]*"[^>]+data-i18n="nearby(?:Food|Onsen)\.mapCta")/g,
    '<div class="map-embed-cta-row">$1',
  );
}

function todayHashTarget(html) {
  if (/id="live"[\s>]/.test(html) || /data-i18n="nav\.live"/.test(html)) return "#live";
  if (/id="guides"[\s>]/.test(html) || /data-i18n="nav\.guides"/.test(html)) return "#guides";
  if (/id="pass"[\s>]/.test(html) || /data-i18n="nav\.pass"/.test(html)) return "#pass";
  return "#paths";
}

function fixIndexHrefs(html, resortId) {
  if (!resortId) return html;
  let out = html;
  const today = todayHashTarget(html);

  out = out.replace(/<a href="#" class="logo"/g, '<a href="./" class="logo"');

  out = out.replace(
    /<a href="#" class="btn btn-primary" data-i18n="hero\.ctaToday"/g,
    `<a href="${today}" class="btn btn-primary" data-i18n="hero.ctaToday"`,
  );
  out = out.replace(
    /<a href="#" class="btn btn-primary" data-i18n="transit\.ctaToday"/g,
    `<a href="${today}" class="btn btn-primary" data-i18n="transit.ctaToday"`,
  );

  out = out.replace(
    /(<a href="#") class="path-tile([^"]*)"([^>]*>\s*<span class="path-tile__label" data-i18n="paths\.today\.label")/g,
    `<a href="${today}" class="path-tile$2"$3`,
  );

  out = out.replace(
    /(<a href="#") class="path-tile([^"]*)"([^>]*>\s*<span class="path-tile__label" data-i18n="paths\.map\.label")/g,
    `<a href="../map.html?resort=${resortId}" class="path-tile$2"$3`,
  );

  if (/id="access"[\s>]/.test(html)) {
    out = out.replace(
      /<a href="#" class="btn btn-primary"([^>]*data-i18n="highlights\.primary\.cta")/g,
      '<a href="#access" class="btn btn-primary"$1',
    );
  }

  return out;
}

function fixMockCss(content) {
  let out = content;
  out = out.replace(
    /(\.site-header\s*\{[^}]*?)top:\s*1\.75rem;\s*/s,
    "$1",
  );
  out = out.replace(
    /(#food-map,\s*\r?\n#onsen-map\s*\{\s*\r?\n\s*)scroll-margin-top:\s*5\.5rem;/g,
    "$1scroll-margin-top: var(--lp-header-offset, 3.5rem);",
  );
  return out;
}

const stats = {
  htmlLayout: 0,
  htmlCtaRow: 0,
  htmlHrefs: 0,
  mockCss: 0,
};

for (const lpDir of targetLpDirs) {
  const htmlFiles = walkHtmlFiles(lpDir);
  for (const file of htmlFiles) {
    if (!isLpHtml(file)) continue;
    const before = readFileSync(file, "utf8");
    let after = insertLpLayout(before);
    if (after !== before) stats.htmlLayout++;

    const name = file.replace(/\\/g, "/");
    if (name.endsWith("/nearby-food.html") || name.endsWith("/nearby-onsen.html")) {
      const rowFixed = fixMapEmbedCtaRow(after);
      if (rowFixed !== after) {
        stats.htmlCtaRow++;
        after = rowFixed;
      }
    }

    if (name.endsWith("/index.html")) {
      const id = resortIdFromHtml(after);
      const hrefFixed = fixIndexHrefs(after, id);
      if (hrefFixed !== after) {
        stats.htmlHrefs++;
        after = hrefFixed;
      }
    }

    if (after !== before) writeFileSync(file, after, "utf8");
  }
}

for (const lpDir of targetLpDirs) {
  const cssPath = join(lpDir, "mock.css");
  try {
    statSync(cssPath);
  } catch {
    continue;
  }
  const before = readFileSync(cssPath, "utf8");
  const after = fixMockCss(before);
  if (after !== before) {
    writeFileSync(cssPath, after, "utf8");
    stats.mockCss++;
  }
}

console.log("apply-lp-layout-fix:");
console.log(`  scope: ${opts.id ? `--id ${opts.id}` : "all mock LPs"}`);
console.log(`  lp-layout.css wired: ${stats.htmlLayout} HTML`);
console.log(`  map-embed-cta-row:   ${stats.htmlCtaRow} HTML`);
console.log(`  index href fixes:    ${stats.htmlHrefs} HTML`);
console.log(`  mock.css header:     ${stats.mockCss} files`);
