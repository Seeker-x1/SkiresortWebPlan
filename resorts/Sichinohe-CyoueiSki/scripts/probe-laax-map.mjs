/**
 * LAAX /map のビューポート・キャンバス占有を計測
 * node scripts/probe-laax-map.mjs
 */
import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

const browser = await chromium.launch({ headless: true });

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  try {
    await page.goto("https://www.laax.com/en/map", {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForTimeout(8000);

    const report = await page.evaluate(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const canvases = [...document.querySelectorAll("canvas")].map((c) => {
        const r = c.getBoundingClientRect();
        return {
          clientW: Math.round(r.width),
          clientH: Math.round(r.height),
          pctW: Math.round((r.width / vw) * 100),
          pctH: Math.round((r.height / vh) * 100),
        };
      });
      return { vw, vh, canvases };
    });

    console.log(`\n=== ${vp.name} ${vp.width}x${vp.height} ===`);
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error(vp.name, e.message);
  } finally {
    await page.close();
  }
}

await browser.close();
