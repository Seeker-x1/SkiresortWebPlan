import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "_shared", "icons");

for (const file of ["marker-ski-32.svg", "marker-ski-48.svg"]) {
  const svg = readFileSync(join(iconsDir, file), "utf8");
  const size = file.includes("32") ? 32 : 48;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  const out = join(iconsDir, file.replace(".svg", ".png"));
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
}
