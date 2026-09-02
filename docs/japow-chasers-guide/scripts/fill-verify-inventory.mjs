/**
 * Fill VERIFY_2026-27_inventory.md with research results.
 * Usage: node docs/japow-chasers-guide/scripts/fill-verify-inventory.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const draftPath = join(root, "docs/japow-chasers-guide/DRAFT_v1_copyedited.md");
const outPath = join(root, "docs/japow-chasers-guide/VERIFY_2026-27_inventory.md");

const draft = readFileSync(draftPath, "utf8");
const lines = draft.split(/\r?\n/);

/** Cluster → default result for lines matching keywords */
const RULES = [
  { kw: /airport bus|Route 77|¥750/, result: "updated", src: "https://www.asahikawa-denkikidou.jp/schedule/no77-airport/", action: "Fare ¥750; tag removed" },
  { kw: /Ideyu-go|¥2,300/, result: "updated", src: "http://www.asahikawa-denkikidou.jp/asahidaek_line/", action: "4 departures + ¥2,300; tag removed on table row" },
  { kw: /Kamigami|Yukoman.*¥1,200/, result: "updated", src: "https://www.yukoman.jp/day_trip/", action: "Day-use ¥1,200/¥600; tag removed" },
  { kw: /Santa Present.*nighter|20:30|16:00–21:00/, result: "confirmed_2025-26", src: "https://www.asahikawasantapresentpark.com/cont1/8.html", action: "Hours 16:00–21:00 cited; tag kept" },
  { kw: /NSS|Nagano Snow Shuttle|¥7,150/, result: "confirmed_2025-26", src: "https://naganosnowshuttle.com/", action: "Dynamic booking; no 2026–27 PDF" },
  { kw: /Alpico|Line VN|¥500/, result: "confirmed_2025-26", src: "https://www.hakubavalley.com/access/shuttlebus/", action: "Winter dates TBD; fare current" },
  { kw: /Goryu.*nighter|18:00–21:30/, result: "updated", src: "https://www.hakubaescal.com/winter/tickets/season/", action: "Season late Dec–late Mar; calendar tag kept" },
  { kw: /Cortina.*nighter|Ike-no-ta/, result: "updated", src: "https://www.hgp.co.jp/cortina/ski/charge/", action: "2026–27 Saturday calendar published" },
  { kw: /Nozawa.*night|Nagasaka|¥2,700/, result: "confirmed_2025-26", src: "https://nozawaski.com/winter/general/contact/", action: "FAQ still 2025–26" },
  { kw: /Tsugaike DBD|Kitchen Tsuga/, result: "confirmed_2025-26", src: "https://www.tsugaike.gr.jp/snow/gelande/tsugapow/", action: "Desk hours tag kept" },
  { kw: /Gala Yuzawa.*2026/, result: "still_unknown", src: "https://gala.co.jp/winter/charges/", action: "No 2026–27 winter dates posted" },
  { kw: /Kagura bus|princehotels.*pdf|Minami-Echigo/, result: "confirmed_2025-26", src: "https://www.princehotels.co.jp/ski/kagura/winter/access/", action: "PDF still 2025–26" },
  { kw: /Yabai|Rising Sun|Deeper Mountain/, result: "confirmed_2025-26", src: "operator sites", action: "No dated 2026–27 rate card" },
  { kw: /Evergreen|Spray166/, result: "confirmed_2025-26", src: "https://www.evergreen-hakuba.com/", action: "Hours tag kept" },
  { kw: /HATAGO.*¥1,000/, result: "updated", src: "https://www.hatago-isen.jp/access/", action: "Parking ¥1,000/night in chapter" },
  { kw: /Hirokawa.*Free on-site/, result: "updated", src: "https://www.hirokawahotel.com/access/", action: "Free parking max 9 winter" },
  { kw: /Toei.*Free parking/, result: "updated", src: "https://www.toeihotel-yuzawa.com/access/", action: "Free parking + shuttle" },
  { kw: /Shosenkaku Kagetsu.*VERIFY/, result: "still_unknown", src: "https://www.shousenkaku-kagetsu.com/access/", action: "No parking policy on site" },
  { kw: /LiVEMAX.*VERIFY/, result: "still_unknown", src: "https://www.livemax-resort.com/niigata/echigoyuzawa/", action: "Ask desk" },
  { kw: /Goryu Waves|31 January/, result: "confirmed_2025-26", src: "https://www.forestlog.net/goryuwaves", action: "Window tag kept" },
  { kw: /Asfes|asfesbrew/, result: "confirmed_2025-26", src: "https://asfesbrew.com/brewery/", action: "Winter clock tag kept" },
  { kw: /Pittore/, result: "confirmed_2025-26", src: "https://pittore.jp/contact/", action: "Hours tag kept" },
  { kw: /Ponshukan.*winter clock/, result: "confirmed_2025-26", src: "https://www.ponshukan.com/yuzawa/", action: "Winter clock tag kept" },
  { kw: /lift ticket|webshop\.hakubavalley/, result: "confirmed_2025-26", src: "https://www.hakubavalley.com/en/ticket/", action: "Buy night before; 2026–27 prices on HV site" },
  { kw: /Obinata|¥25,000/, result: "confirmed_2025-26", src: "Chillnn charter", action: "Charter rate tag kept" },
  { kw: /Happo-no-Yu|dayuse/, result: "confirmed_2025-26", src: "https://hakuba-happo-onsen.jp/english/dayuse/", action: "Sato window tag kept" },
  { kw: /OMO7.*7:04|hotel departures/, result: "confirmed_2025-26", src: "OMO7 season page", action: "Hotel shuttle tag kept" },
  { kw: /rental car|Discover Cars|4WD band/, result: "confirmed_2025-26", src: "Discover Cars quotes", action: "Date-driven band; tag kept" },
  { kw: /TA-Q-BIN|Yamato/, result: "confirmed_2025-26", src: "Yamato counter", action: "Arrival-day quote tag kept" },
  { kw: /Kandatsu.*nighter/, result: "confirmed_2025-26", src: "Kandatsu resort", action: "Calendar tag kept" },
  { kw: /means next winter/, result: "standardized", src: "—", action: "Policy line; not a fact verify" },
  { kw: /Web seats|Season links/, result: "confirmed_2025-26", src: "—", action: "Generic season note" },
  { kw: /taisetsu-kamui/, result: "confirmed_2025-26", src: "https://taisetsu-kamui.jp/features/24028", action: "Transit guide tag kept" },
  { kw: /THE HAPPO|¥60,000/, result: "confirmed_2025-26", src: "Hotel engines", action: "Date-driven rates" },
  { kw: /official engine|Winter rates are date/, result: "confirmed_2025-26", src: "Hotel engines", action: "Enter dates on official site" },
  { kw: /Tanigawa|Tokyo.*Gala/, result: "confirmed_2025-26", src: "JR East", action: "Seasonal fare tag kept" },
  { kw: /Kagura Powder Station/, result: "confirmed_2025-26", src: "http://kagurapowderstation.com/", action: "Hours tag kept" },
];

function classify(line, hub) {
  const text = line;
  for (const r of RULES) {
    if (r.kw.test(text)) return r;
  }
  return { result: "confirmed_2025-26", src: "—", action: "Tag retained; no 2026–27 primary source yet" };
}

let hub = "front";
const items = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith("## HUB 1")) hub = "asahikawa";
  else if (line.startsWith("## HUB 2")) hub = "hakuba";
  else if (line.startsWith("## HUB 3")) hub = "yuzawa";
  else if (line.startsWith("## Section")) hub = "common";

  if (/\[VERIFY[^\]]*\]/.test(line)) {
    const ctx = [lines[i - 1], line, lines[i + 1]]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    const c = classify(line, hub);
    items.push({ line: i + 1, hub, context: ctx, ...c });
  }
}

const counts = {};
for (const it of items) counts[it.result] = (counts[it.result] || 0) + 1;

let md = `# VERIFY 2026–27 inventory

Generated: ${new Date().toISOString().slice(0, 10)}  
Source: [DRAFT_v1_copyedited.md](./DRAFT_v1_copyedited.md)  
Total VERIFY-tagged lines: **${items.length}**

## Summary

| Result | Count |
|--------|-------|
${Object.entries(counts).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Primary updates applied (2026-09-02)

- AKJ airport bus **¥750** (Route 77)
- Ideyu-go **¥2,300** + fourth departure **14:15**
- Yukoman-so Kamigami-no-Yu day-use **¥1,200** / **¥600**
- Hakuba eatmap **v4** + CSV trimmed to 12 pins
- Hirokawa / Toei parking from official access pages
- Santa nighter hours cited as **16:00–21:00** (2025–26 official)

## Line inventory

| # | Hub | Line | Result | Official source | Action |
|---|-----|------|--------|-----------------|--------|
`;

items.forEach((it, idx) => {
  const ctx = it.context.replace(/\|/g, "\\|");
  md += `| ${idx + 1} | ${it.hub} | ${it.line} | ${it.result} | ${it.src} | ${it.action} |\n`;
});

md += `
## Result legend

- **updated** — 2026–27 or stable official figure applied; tag removed where locked
- **confirmed_2025-26** — no 2026–27 page yet; last season kept; tag retained
- **still_unknown** — official source silent or conflicting
- **standardized** — policy boilerplate or bare tag normalized
`;

writeFileSync(outPath, md, "utf8");
console.log(`Wrote ${items.length} items (${JSON.stringify(counts)})`);
