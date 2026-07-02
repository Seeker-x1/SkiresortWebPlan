/**
 * EN addresses: plain English line + administrative-unit ruby row (ja order).
 * Ruby units = 北海道 / 上川郡 / 美瑛町 / 字大村村山 など（単語単位・大字順）。
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function placesRow(units) {
  return units
    .map(([en, ja]) => `<span class="place-unit"><ruby>${ja}<rt>${en}</rt></ruby></span>`)
    .join("");
}

/** slug → EN line (western order) + places (ja administrative order, large → small) */
const EN_ADDRESSES = {
  "abashiri-lv-lp": {
    postal: "099-2421, Japan",
    line: "Yobito 28-3, Abashiri, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Abashiri", "網走市"],
      ["Yobito 28-3", "字呼人28-3"],
    ],
  },
  "asahigaoka-lp": {
    postal: "044-0083, Japan",
    line: "Asahi 37-1, Kutchan, Abuta-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Abuta-gun", "虻田郡"],
      ["Kutchan", "倶知安町"],
      ["Asahi 37-1", "字旭37番地1"],
    ],
  },
  "biei-lp": {
    postal: "071-0218, Japan",
    line: "Omura-Murayama, Biei-cho, Kamikawa-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Kamikawa-gun", "上川郡"],
      ["Biei-cho", "美瑛町"],
      ["Omura-Murayama", "字大村村山"],
    ],
  },
  "gokazan-lp": {
    postal: "099-6323, Japan",
    line: "Kitahei Village Section 2, No. 100, Yubetsu, Mombetsu-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Mombetsu-gun", "紋別郡"],
      ["Yubetsu", "湧別町"],
      ["Kitahei Village Section 2, No. 100", "北兵村二区100番地"],
    ],
  },
  "kiyosato-lp": {
    postal: "099-4525, Japan",
    line: "Midori 51-1, Kiyosato, Shari-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Shari-gun", "斜里郡"],
      ["Kiyosato", "清里町"],
      ["Midori 51-1", "緑町51-1"],
    ],
  },
  "minami-furano-lp": {
    postal: "079-2402, Japan",
    line: "Kito, Minami-Furano, Sorachi-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Sorachi-gun", "空知郡"],
      ["Minami-Furano", "南富良野町"],
      ["Kito", "字幾寅"],
    ],
  },
  "otoifuji-lp": {
    postal: "098-2501, Japan",
    line: "Otoifuke 200-6, Otoifuke, Nakagawa-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Nakagawa-gun", "中川郡"],
      ["Otoifuke", "音威子府村"],
      ["Otoifuke 200-6", "字音威子府200-6"],
    ],
  },
  "shimukappu-lp": {
    postal: "079-2201, Japan",
    line: "Chuo, Shimukappu, Yubari-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Yubari-gun", "勇払郡"],
      ["Shimukappu", "占冠村"],
      ["Chuo", "字中央"],
    ],
  },
  "sichinohe-lp": {
    postal: "039-2568, Japan",
    line: "Hidarikumi 106-5, Sichinohe, Kamikita-gun, Aomori",
    places: [
      ["Aomori", "青森県"],
      ["Kamikita-gun", "上北郡"],
      ["Sichinohe", "七戸町"],
      ["Hidarikumi 106-5", "字左組106-5"],
    ],
  },
  "tsunan-lp": {
    postal: "949-8122, Japan",
    line: "Kamigo Kamida Ko 1745-1, Tsunan, Nakauonuma-gun, Niigata",
    places: [
      ["Niigata", "新潟県"],
      ["Nakauonuma-gun", "中魚沼郡"],
      ["Tsunan", "津南町"],
      ["Kamigo Kamida Ko 1745-1", "大字上郷上田甲1745-1"],
    ],
  },
  "unabetsu-lp": {
    postal: "099-4122, Japan",
    line: "Minehama 110, Shari, Shari-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Shari-gun", "斜里郡"],
      ["Shari", "斜里町"],
      ["Minehama 110", "字峰浜110番地"],
    ],
  },
  "nakagawa-town-lp": {
    postal: "098-0321, Japan",
    line: "540 Nakagawa, Nakagawa-cho, Nakagawa-gun, Hokkaido",
    places: [
      ["Hokkaido", "北海道"],
      ["Nakagawa-gun", "中川郡"],
      ["Nakagawa-cho", "中川町"],
      ["Nakagawa 540", "字中川540"],
    ],
  },
};

const dirs = readdirSync(ROOT).filter((d) => d.endsWith("-lp"));

for (const dir of dirs) {
  const spec = EN_ADDRESSES[dir];
  if (!spec) throw new Error(`missing address spec: ${dir}`);

  const enPath = join(ROOT, dir, "messages", "en.json");
  const jaPath = join(ROOT, dir, "messages", "ja.json");
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const ja = JSON.parse(readFileSync(jaPath, "utf8"));

  en.access.postal = spec.postal;
  en.access.line = spec.line;
  en.access.places = placesRow(spec.places);
  en.footer.location = `${spec.postal.split(",")[0]} · ${spec.line}`;

  ja.access.places = "";

  writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n", "utf8");
  writeFileSync(jaPath, JSON.stringify(ja, null, 2) + "\n", "utf8");
  console.log(`✓ ${dir}`);
}

console.log(`\n${dirs.length} resorts updated`);
