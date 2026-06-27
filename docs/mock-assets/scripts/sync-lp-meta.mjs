#!/usr/bin/env node
/** Sync index.html title/meta from messages/ja.json meta */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOCK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const IDS = ["sanokura", "niwa", "horaguchi"];

for (const id of IDS) {
  const dir = path.join(MOCK, `${id}-lp`);
  const ja = JSON.parse(fs.readFileSync(path.join(dir, "messages", "ja.json"), "utf8"));
  let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${ja.meta.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${ja.meta.description}" />`,
  );
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  console.log(`✓ ${id} title/meta`);
}
