import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");
export const MAPS_ROOT = path.join(ROOT, "maps");

export function resortDir(id) {
  return path.join(MAPS_ROOT, id);
}

export function dataDir(id) {
  return path.join(resortDir(id), "data");
}

export function publicMapsDir(id) {
  return path.join(resortDir(id), "public", "maps");
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeText(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value, "utf8");
}

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

export const KNOWN = {
  "sapporo-kokusai": {
    id: "sapporo-kokusai",
    name_ja: "札幌国際スキー場",
    name_en: "Sapporo Kokusai Ski Resort",
    officialSlopemapUrl: "https://www.sapporo-kokusai.jp/slopes/images/slopemap.png",
    lpReferenceDir: path.join(
      ROOT,
      "docs",
      "mock-assets",
      "sapporo-kokusai-lp",
      "reference",
    ),
    lpHeroPath: path.join(
      ROOT,
      "docs",
      "mock-assets",
      "images",
      "maps",
      "sapporo-kokusai-hero.png",
    ),
    lpLayoutPath: path.join(
      ROOT,
      "docs",
      "mock-assets",
      "sapporo-kokusai-lp",
      "reference",
      "official-map-layout.json",
    ),
  },
};
