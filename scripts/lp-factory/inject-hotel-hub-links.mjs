#!/usr/bin/env node
/**
 * Inject hotel hub CTA block into mock LPs for Asahikawa / Hakuba / Yuzawa hubs.
 *
 * Usage:
 *   node scripts/lp-factory/inject-hotel-hub-links.mjs
 *   node scripts/lp-factory/inject-hotel-hub-links.mjs --check
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY = join(root, "docs/mock-assets/registry.json");
const HOTEL_COMPARE_BASE = "https://japowsearch.com/tools/hotel-compare?hub=";

const HUB_RESORTS = {
  asahikawa: [],
  hakuba: [],
  yuzawa: [],
};

function classifyResorts(registry) {
  for (const x of registry.resorts) {
    const rc = x.affiliates?.rentacar || "";
    if (/asahikawa/.test(rc)) HUB_RESORTS.asahikawa.push(x.id);
    if (/nagano|hakuba/.test(rc)) HUB_RESORTS.hakuba.push(x.id);
    if (/yuzawa/.test(rc)) HUB_RESORTS.yuzawa.push(x.id);
    const reg = x.region?.en || "";
    if (reg === "Nagano" && !HUB_RESORTS.hakuba.includes(x.id)) {
      HUB_RESORTS.hakuba.push(x.id);
    }
    if (reg === "Niigata" && !HUB_RESORTS.yuzawa.includes(x.id)) {
      HUB_RESORTS.yuzawa.push(x.id);
    }
  }
}

function hubForResort(id) {
  for (const [hub, ids] of Object.entries(HUB_RESORTS)) {
    if (ids.includes(id)) return hub;
  }
  return null;
}

function ctaBlock(hub) {
  const url = `${HOTEL_COMPARE_BASE}${hub}`;
  const labels = {
    asahikawa: { ja: "旭川ハブの宿を比較", en: "Compare Asahikawa hub hotels" },
    hakuba: { ja: "白馬ハブの宿を比較", en: "Compare Hakuba hub hotels" },
    yuzawa: { ja: "湯沢ハブの宿を比較", en: "Compare Yuzawa hub hotels" },
  };
  const L = labels[hub];
  return `            <div class="access-affiliate access-affiliate--hotel" data-hotel-hub="${hub}">
              <p class="access-affiliate__eyebrow" data-i18n="access.hotelHubEyebrow">Powder week · hub hotels</p>
              <a
                href="${url}"
                class="access-affiliate__link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="access.hotelHubLink"
              >${L.ja}</a>
              <p class="access-affiliate__note" data-i18n="access.hotelHubNote">Japowsearch hotel compare（外部）</p>
            </div>`;
}

const MARKER = 'data-hotel-hub="';
const checkOnly = process.argv.includes("--check");

const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
classifyResorts(registry);

let updated = 0;
let missing = 0;
const errors = [];

for (const resort of registry.resorts) {
  const hub = hubForResort(resort.id);
  if (!hub) continue;
  const lpDir = join(root, "docs/mock-assets", `${resort.id}-lp`);
  const htmlPath = join(lpDir, "index.html");
  if (!existsSync(htmlPath)) {
    missing++;
    continue;
  }
  let html = readFileSync(htmlPath, "utf8");
  if (html.includes(MARKER)) continue;

  const block = ctaBlock(hub);
  const anchor = "</div>\n          </div>\n        </div>\n      </div>\n    </section>";
  const rentacarEnd = html.indexOf('data-skyticket-rentacar-block');
  if (rentacarEnd === -1) {
    errors.push(`${resort.id}: no rentacar block`);
    continue;
  }
  const closeDiv = html.indexOf("</div>", html.indexOf("data-skyticket-rentacar-hint", rentacarEnd));
  if (closeDiv === -1) {
    const insertAfter = html.indexOf("data-skyticket-rentacar-block");
    const sectionEnd = html.indexOf("</div>", html.lastIndexOf("access-affiliate__hint", insertAfter));
    if (sectionEnd === -1) {
      errors.push(`${resort.id}: cannot find insert point`);
      continue;
    }
  }

  const hintIdx = html.indexOf('class="access-affiliate__hint"');
  if (hintIdx === -1) {
    errors.push(`${resort.id}: no hint line`);
    continue;
  }
  const insertAt = html.indexOf("</div>", hintIdx) + 6;
  if (checkOnly) {
    missing++;
    continue;
  }
  html = html.slice(0, insertAt) + "\n" + block + html.slice(insertAt);
  writeFileSync(htmlPath, html, "utf8");

  for (const locale of ["ja", "en"]) {
    const msgPath = join(lpDir, "messages", `${locale}.json`);
    if (!existsSync(msgPath)) continue;
    const messages = JSON.parse(readFileSync(msgPath, "utf8"));
    const labels = {
      asahikawa: {
        ja: { eyebrow: "旭川ハブ · 宿", link: "旭川ハブの宿を一括比較", note: "Japowsearch ホテル比較（外部）" },
        en: { eyebrow: "Asahikawa hub · stay", link: "Compare Asahikawa hub hotels", note: "Japowsearch hotel compare (external)" },
      },
      hakuba: {
        ja: { eyebrow: "白馬ハブ · 宿", link: "白馬ハブの宿を一括比較", note: "Japowsearch ホテル比較（外部）" },
        en: { eyebrow: "Hakuba hub · stay", link: "Compare Hakuba hub hotels", note: "Japowsearch hotel compare (external)" },
      },
      yuzawa: {
        ja: { eyebrow: "湯沢ハブ · 宿", link: "湯沢ハブの宿を一括比較", note: "Japowsearch ホテル比較（外部）" },
        en: { eyebrow: "Yuzawa hub · stay", link: "Compare Yuzawa hub hotels", note: "Japowsearch hotel compare (external)" },
      },
    };
    messages.access = messages.access || {};
    messages.access.hotelHubEyebrow = labels[hub][locale].eyebrow;
    messages.access.hotelHubLink = labels[hub][locale].link;
    messages.access.hotelHubNote = labels[hub][locale].note;
    writeFileSync(msgPath, JSON.stringify(messages, null, 2) + "\n", "utf8");
  }
  updated++;
}

if (checkOnly) {
  console.log(`inject-hotel-hub-links --check: ${missing} LPs still need hotel hub CTA`);
  process.exit(missing > 0 ? 1 : 0);
}

console.log(
  `inject-hotel-hub-links: updated ${updated} LPs (asahikawa ${HUB_RESORTS.asahikawa.length}, hakuba ${HUB_RESORTS.hakuba.length}, yuzawa ${HUB_RESORTS.yuzawa.length} in registry)`,
);
if (errors.length) {
  console.warn("warnings:", errors.join("; "));
}
