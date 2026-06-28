#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const id of process.argv.slice(2)) {
  const ja = JSON.parse(readFileSync(join(root, `${id}-lp/messages/ja.json`), "utf8"));
  const p = join(root, `${id}-lp/index.html`);
  let html = readFileSync(p, "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${ja.meta.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${ja.meta.description}" />`,
  );
  writeFileSync(p, html, "utf8");
  console.log(`✓ ${id} title/meta`);
}
