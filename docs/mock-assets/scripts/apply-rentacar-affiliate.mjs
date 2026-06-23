#!/usr/bin/env node
/**
 * Wire Skyticket rentacar affiliate blocks into mock LP index.html + messages.
 * Usage: node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "../..");

const AFFILIATE_BLOCK = `            <div class="access-affiliate" data-skyticket-rentacar-block>
              <p class="access-affiliate__eyebrow" data-i18n="access.rentacarEyebrow">RENTACAR_EYEBROW</p>
              <a
                href="#"
                class="access-affiliate__link"
                data-skyticket-rentacar-link
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                <img
                  src=""
                  alt=""
                  width="0"
                  height="1"
                  class="access-affiliate__pixel"
                  data-skyticket-rentacar-pixel
                  aria-hidden="true"
                />
                <span data-i18n="access.rentacarLink">RENTACAR_LINK</span>
              </a>
              <p class="access-affiliate__note" data-i18n="access.rentacarNote">RENTACAR_NOTE</p>
              <p class="access-affiliate__hint" data-i18n="access.rentacarHint">RENTACAR_HINT</p>
            </div>`;

const RESORT_COPY = {
  sichinohe: {
    rentacar: "shichinohetowada_station",
    ja: {
      rentacarEyebrow: "新幹線＋レンタカー",
      rentacarLink: "七戸十和田駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "十和田湖・八甲田・七戸周遊向け",
    },
    en: {
      rentacarEyebrow: "Shinkansen + rental car",
      rentacarLink: "Book a rental car at Shichinohe-Towada Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Towada Lake, Hakkoda, and Shichinohe loops",
    },
  },
  biei: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "富良野・美瑛周遊",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "美瑛・白金・層雲峡方面のドライブ向け",
    },
    en: {
      rentacarEyebrow: "Furano · Biei touring",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Biei, Shirogane, and Sounkyo drives",
    },
  },
  unabetsu: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "知床圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "斜里・知床方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Shiretoko gateway",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shari and Shiretoko drives",
    },
  },
  kiyosato: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "知床圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "緑駅・知床サロマ方面へ",
    },
    en: {
      rentacarEyebrow: "Shiretoko gateway",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Midori Station and Shiretoko–Saroma routes",
    },
  },
  gokazan: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "オホーツク圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "サロマ湖・遠軽・湧別周遊向け",
    },
    en: {
      rentacarEyebrow: "Okhotsk region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Lake Saroma, Engaru, and Yubetsu loops",
    },
  },
  tsunan: {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "雪国ドライブ",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "越後田中・湯沢方面の雪国周遊向け",
    },
    en: {
      rentacarEyebrow: "Snow-country drive",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Echigo-Tanaka and Yuzawa snow routes",
    },
  },
  "minami-furano": {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "十勝・富良野圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "かなやま湖・富良野方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Tokachi · Furano",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Lake Kanayama and Furano drives",
    },
  },
  asahigaoka: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "ニセコ圏",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "倶知安・ニセコ・小樽周遊向け",
    },
    en: {
      rentacarEyebrow: "Niseko gateway",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kutchan, Niseko, and Otaru loops",
    },
  },
  otoifuji: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "宗谷圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "音威子府・北見方面のロングドライブ向け",
    },
    en: {
      rentacarEyebrow: "Soya region",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Otoineppu and Kitami long drives",
    },
  },
  shimukappu: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "道央アクセス",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "占冠・トマム・富良野周遊向け",
    },
    en: {
      rentacarEyebrow: "Central Hokkaido",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shimukappu, Tomamu, and Furano routes",
    },
  },
  "abashiri-lv": {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "網走圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "網走・阿寒・知床方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Abashiri region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Abashiri, Akan, and Shiretoko drives",
    },
  },
  "sapporo-teine": {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "札幌圏",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "手稲・札幌市内・小樽周遊向け",
    },
    en: {
      rentacarEyebrow: "Sapporo gateway",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Teine, downtown Sapporo, and Otaru loops",
    },
  },
};

const NEW_DESTINATIONS = {
  asahikawa_airport: {
    url: "https://skyticket.jp/rentacar/hokkaido/asahikawa_airport/",
    label: { ja: "旭川空港", en: "Asahikawa Airport" },
  },
  memanbetsu_airport: {
    url: "https://skyticket.jp/rentacar/hokkaido/memanbetsu_airport/",
    label: { ja: "女満別空港", en: "Memanbetsu Airport" },
  },
  niigata_airport: {
    url: "https://skyticket.jp/rentacar/koushinetsu/niigata/niigata_airport/",
    label: { ja: "新潟空港", en: "Niigata Airport" },
  },
};

function patchIndexHtml(html, copy) {
  if (html.includes("data-skyticket-rentacar-block")) return html;

  if (!html.includes("affiliates/rentacar-link.css")) {
    html = html.replace(
      '<link rel="stylesheet" href="../_shared/mock-i18n.css" />',
      '<link rel="stylesheet" href="../_shared/mock-i18n.css" />\n  <link rel="stylesheet" href="../_shared/affiliates/rentacar-link.css" />',
    );
  }

  const block = AFFILIATE_BLOCK.replace("RENTACAR_EYEBROW", copy.ja.rentacarEyebrow)
    .replace("RENTACAR_LINK", copy.ja.rentacarLink)
    .replace("RENTACAR_NOTE", copy.ja.rentacarNote)
    .replace("RENTACAR_HINT", copy.ja.rentacarHint);

  const patched = html.replace(
    /(<div class="access-actions">[\s\S]*?<a href="tel:[^"]+" class="btn btn-ghost" data-i18n="common\.call">[\s\S]*?<\/a>)\s*(\n\s*<\/div>)/,
    `$1\n${block}$2`,
  );
  if (patched === html) {
    throw new Error("access-actions phone anchor not found");
  }
  html = patched;

  if (!html.includes("skyticket-rentacar.js")) {
    html = html.replace(
      '<script src="../_shared/mock-i18n.js"></script>',
      '<script src="../_shared/affiliates/skyticket-rentacar.js"></script>\n  <script src="../_shared/mock-i18n.js"></script>',
    );
  }
  return html;
}

function patchMessages(json, copy, locale) {
  const c = copy[locale];
  json.access = {
    ...json.access,
    rentacarEyebrow: c.rentacarEyebrow,
    rentacarLink: c.rentacarLink,
    rentacarNote: c.rentacarNote,
    rentacarHint: c.rentacarHint,
  };
  return json;
}

function patchConfig(config) {
  config.destinations = { ...config.destinations, ...NEW_DESTINATIONS };
  return config;
}

function patchRegistry(registry) {
  for (const resort of registry.resorts) {
    const copy = RESORT_COPY[resort.id];
    if (!copy) continue;
    resort.affiliates = { rentacar: copy.rentacar };
  }
  return registry;
}

const slugById = Object.fromEntries(
  readdirSync(root)
    .filter((n) => n.endsWith("-lp"))
    .map((slug) => {
      const html = readFileSync(join(root, slug, "index.html"), "utf8");
      const m = html.match(/data-mock-resort="([^"]+)"/);
      return [m?.[1], slug];
    })
    .filter(([id]) => id && RESORT_COPY[id]),
);

for (const [id, slug] of Object.entries(slugById)) {
  const copy = RESORT_COPY[id];
  const indexPath = join(root, slug, "index.html");
  const html = readFileSync(indexPath, "utf8");
  writeFileSync(indexPath, patchIndexHtml(html, copy), "utf8");

  for (const locale of ["ja", "en"]) {
    const msgPath = join(root, slug, "messages", `${locale}.json`);
    const json = JSON.parse(readFileSync(msgPath, "utf8"));
    writeFileSync(
      msgPath,
      `${JSON.stringify(patchMessages(json, copy, locale), null, 2)}\n`,
      "utf8",
    );
  }
  console.log(`✓ ${slug} (${id} → ${copy.rentacar})`);
}

const configPaths = [
  join(root, "_shared/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "configs/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json"),
];
for (const path of configPaths) {
  const config = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, `${JSON.stringify(patchConfig(config), null, 2)}\n`, "utf8");
}
console.log("✓ skyticket-rentacar.json destinations updated");

const registryPath = join(root, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
writeFileSync(registryPath, `${JSON.stringify(patchRegistry(registry), null, 2)}\n`, "utf8");
console.log("✓ registry.json affiliates updated");
