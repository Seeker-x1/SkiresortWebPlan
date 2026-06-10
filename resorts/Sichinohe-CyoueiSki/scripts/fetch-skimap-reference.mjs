/**
 * skimap.org から 2012 マップ画像を取得（og:image / picture タグから解析）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "web", "data", "map", "reference");

const FALLBACK = "https://files.skimap.org/lf7tyuibyf3x0ffw332soaolh7z6";

function extractImageUrl(html) {
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (og?.[1]) return og[1];
  const img = html.match(/src="(https:\/\/files\.skimap\.org\/[^"]+)"/i);
  return img?.[1] ?? FALLBACK;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pageRes = await fetch("https://www.skimap.org/SkiAreas/view/1345", {
    headers: { "User-Agent": "resorts/Sichinohe-CyoueiSki-research/1.0" },
  });
  const html = await pageRes.text();
  const url = extractImageUrl(html);

  const res = await fetch(url, {
    headers: { "User-Agent": "resorts/Sichinohe-CyoueiSki-research/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`fetch failed ${res.status} ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error(`image too small: ${buf.length}`);

  const out = path.join(OUT_DIR, "skimap-2012.jpg");
  fs.writeFileSync(out, buf);
  fs.writeFileSync(
    path.join(OUT_DIR, "skimap-meta.json"),
    JSON.stringify(
      {
        url,
        skimapId: 12147,
        year: 2012,
        bytes: buf.length,
        fetchedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log("saved", out, buf.length, "bytes from", url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

