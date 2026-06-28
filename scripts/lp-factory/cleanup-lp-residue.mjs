#!/usr/bin/env node
/** Remove copyFrom facility residue from {id}-lp after batch scaffold. */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MOCK = join(ROOT, "docs/mock-assets");
const REGISTRY = join(MOCK, "registry.json");

const TARGETS = process.argv.slice(2);
if (!TARGETS.length) {
  console.error("Usage: cleanup-lp-residue.mjs <id> [id...]");
  process.exit(1);
}

const COPY_FROM = {
  "hanakasa-kogen": "abashiri-lv",
  "toma-choei": "kiyosato",
  "ueno-no": "sichinohe",
  "nihonmatsu-shiozawa": "shinjo",
  "tateyama-alpine": "tayama",
  "dogoyama-kogen": "horaguchi",
  shakotan: "biei",
  akago: "shinjo",
  "anzo-koen": "gokazan",
  "imakane-tane": "shinjo",
  "shibetsu-hinata": "shinjo",
  tochio: "shinjo",
  "kushibiki-taranokidai": "shinjo",
  saroma: "utoro",
  "nakadomari-miyanozawa": "abashiri-lv",
  hobetsu: "gokazan",
  odai: "shinjo",
  yokone: "minami-furano",
  okoppe: "utoro",
  shirataka: "horaguchi",
};

const reg = JSON.parse(readFileSync(REGISTRY, "utf8"));
const byId = Object.fromEntries(reg.resorts.map((r) => [r.id, r]));

function pairsFor(id) {
  const fromId = COPY_FROM[id];
  if (!fromId) return [];
  const src = byId[fromId];
  const dst = byId[id];
  if (!src || !dst) return [];
  const out = [
    [src.name.ja, dst.name.ja],
    [src.name.en, dst.name.en],
    [fromId, id],
    [`${fromId}-lp`, `${id}-lp`],
    [`lp-mock-${fromId}-`, `lp-mock-${id}-`],
    [src.region?.ja || "", dst.region?.ja || ""],
  ];
  // Common fragments
  if (fromId === "kiyosato") {
    out.push(["清里町営緑スキー場", dst.name.ja], ["清里町", "当麻町"], ["緑スキー", "当麻山"], ["Kiyosato", dst.name.en.split(" ")[0] || dst.name.en]);
  }
  if (fromId === "sichinohe") {
    out.push(
      ["七戸町営スキー場", dst.name.ja],
      ["七戸町", "大崎市"],
      ["七戸十和田", "鳴子温泉"],
      ["七戸の魅力", "鳴子温泉の魅力"],
      ["七戸周辺", "鳴子温泉郷"],
      ["東八甲田温泉", "滝の湯"],
      ["八甲田", "鳴子温泉"],
      ["大崎市営", dst.name.ja.replace("スキー場", "")],
      ["Ueno-no-Towada", "Naruko-Onsen"],
      ["Higashi-Hakkoda", "Taki-no-Yu"],
      ["Hakkoda", "Naruko"],
      ["Sichinohe", "Ueno-no"],
    );
  }
  if (fromId === "abashiri-lv") {
    out.push(["網走レークビュー", dst.name.ja.split("スキー")[0]], ["網走", dst.region?.ja?.split("県")[1]?.split("市")[0] || ""]);
  }
  if (fromId === "shinjo") {
    out.push(["新庄市民スキー場", dst.name.ja], ["新庄市", dst.region?.ja || ""], ["新庄駅", "最寄駅"]);
  }
  return out.filter(([a]) => a);
}

function walkReplace(dir, pairs) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkReplace(p, pairs);
    else if (/\.(html|json|css|md)$/i.test(name)) {
      let t = readFileSync(p, "utf8");
      const o = t;
      for (const [a, b] of pairs) if (a && b) t = t.split(a).join(b);
      if (t !== o) writeFileSync(p, t, "utf8");
    }
  }
}

for (const id of TARGETS) {
  const dir = join(MOCK, `${id}-lp`);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    continue;
  }
  walkReplace(dir, pairsFor(id));
  console.log(`✓ cleaned ${id}-lp`);
}
