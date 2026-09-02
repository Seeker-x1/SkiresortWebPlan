/**
 * Capture eat-map PNGs from public Google My Maps viewer URLs.
 * Usage: node docs/japow-chasers-guide/scripts/capture-eatmap-png.mjs [--hub asahikawa|hakuba|yuzawa|all]
 */
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const assetsDir = join(root, "docs/japow-chasers-guide/assets");

const MAPS = {
  asahikawa: {
    url: "https://www.google.com/maps/d/viewer?mid=1H9fAIBhcInblW99U2jBObN4dOxJ_2G4",
    out: "japow-guide-asahikawa-eatmap-v1.png",
  },
  hakuba: {
    url: "https://www.google.com/maps/d/viewer?mid=1tVmXYHtX8whQCDnpJaKf4-wWDjDXi5A",
    out: "japow-guide-hakuba-eatmap-v4.png",
  },
  yuzawa: {
    url: "https://www.google.com/maps/d/viewer?mid=1bjlmgLYwn82CK3FxtxdDwZ6u4u-sc_w",
    out: "japow-guide-yuzawa-eatmap-v1.png",
  },
};

const hubArg = process.argv.find((a) => a.startsWith("--hub="))?.split("=")[1]
  ?? (process.argv.includes("--hub") ? process.argv[process.argv.indexOf("--hub") + 1] : "all");

const targets = hubArg === "all" ? Object.keys(MAPS) : [hubArg];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "playwright not installed. Run: npm install -D playwright && npx playwright install chromium",
  );
  process.exit(2);
}

mkdirSync(assetsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1200 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

for (const hub of targets) {
  const cfg = MAPS[hub];
  if (!cfg) {
    console.error(`Unknown hub: ${hub}`);
    continue;
  }
  const outPath = join(assetsDir, cfg.out);
  console.log(`Capturing ${hub} → ${cfg.out}`);
  try {
    await page.goto(cfg.url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  ✓ saved ${outPath}`);
  } catch (e) {
    console.error(`  ✗ ${hub}: ${e.message}`);
  }
}

await browser.close();
console.log("Done.");
