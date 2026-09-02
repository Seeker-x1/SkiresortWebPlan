/**
 * Extract [VERIFY 2026–27] and bare [VERIFY] lines from DRAFT for inventory.
 * Usage: node docs/japow-chasers-guide/scripts/extract-verify-inventory.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const draftPath = join(root, "docs/japow-chasers-guide/DRAFT_v1_copyedited.md");
const outPath = join(root, "docs/japow-chasers-guide/VERIFY_2026-27_inventory.md");

const draft = readFileSync(draftPath, "utf8");
const lines = draft.split(/\r?\n/);

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
      .slice(0, 200);
    items.push({
      line: i + 1,
      hub,
      context: ctx,
      raw: line.trim(),
    });
  }
}

let md = `# VERIFY 2026–27 inventory

Generated: ${new Date().toISOString().slice(0, 10)}  
Source: [DRAFT_v1_copyedited.md](./DRAFT_v1_copyedited.md)  
Total lines with VERIFY tags: **${items.length}**

| # | Hub | Line | Context | Result | Official source | Action |
|---|-----|------|---------|--------|-----------------|--------|
`;

items.forEach((it, idx) => {
  const ctx = it.context.replace(/\|/g, "\\|");
  md += `| ${idx + 1} | ${it.hub} | ${it.line} | ${ctx} | pending | | |\n`;
});

md += `
## Result legend

- **updated** — 2026–27 official published; DRAFT/HTML number or date changed; tag removed if fully locked
- **confirmed_2025-26** — no 2026–27 page yet; 2025–26 figure kept; tag retained
- **still_unknown** — official source missing or conflicting; tag retained
- **standardized** — bare \`[VERIFY]\` → \`[VERIFY 2026–27]\` only

## Notes

- Do not guess yen/clocks. If the operator has not posted 2026–27, keep last season + tag.
- Steves voice: tags stay as data flags beside numbers, not in spoken prose.
`;

writeFileSync(outPath, md, "utf8");
console.log(`Wrote ${items.length} items → ${outPath}`);
