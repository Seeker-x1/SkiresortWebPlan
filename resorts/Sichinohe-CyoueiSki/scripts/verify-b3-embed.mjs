/**
 * G2-3 / B3: /map full viewport map visible >= 50dvh at 375px before scroll.
 * Usage: node scripts/verify-b3-embed.mjs [baseUrl]
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const url = `${baseUrl.replace(/\/$/, "")}/ja/map`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
});

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector('[aria-label="ゲレンデマップ"]', { timeout: 30_000 });

  const result = await page.evaluate(() => {
    const section = document.querySelector('[aria-label="ゲレンデマップ"]');
    if (!section) return { error: "map section not found" };

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const dvh50 = vh * 0.5;
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(vh, rect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    return {
      viewport: { width: window.innerWidth, height: vh },
      blockHeight: rect.height,
      blockTop: rect.top,
      dvh50,
      visibleHeight,
      passVisible: visibleHeight >= dvh50 - 1,
      passBlockMin: rect.height >= dvh50 - 1,
    };
  });

  console.log(JSON.stringify({ url, ...result }, null, 2));
  const pass = result.passVisible && result.passBlockMin;
  process.exitCode = pass ? 0 : 1;
  if (!pass) {
    console.error(
      "FAIL: need visibleHeight >= dvh50 and blockHeight >= dvh50 before scroll",
    );
  } else {
    console.log("PASS: G2-3 / B3");
  }
} finally {
  await browser.close();
}
