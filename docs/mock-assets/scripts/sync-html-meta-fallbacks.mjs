#!/usr/bin/env node
/** Sync <title> and meta description fallbacks in LP index.html from ja.json meta */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const dir of readdirSync(ROOT).filter((d) => d.endsWith("-lp"))) {
  const ja = JSON.parse(readFileSync(join(ROOT, dir, "messages", "ja.json"), "utf8"));
  const path = join(ROOT, dir, "index.html");
  let html = readFileSync(path, "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${ja.meta.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${ja.meta.description.replace(/"/g, "&quot;")}"`,
  );
  writeFileSync(path, html, "utf8");
  console.log(`✓ ${dir}`);
}
