const query = `
[out:json][timeout:25];
(
  way["aerialway"](40.68,141.10,40.75,141.22);
  way["piste:type"](40.68,141.10,40.75,141.22);
  node["aerialway"](40.68,141.10,40.75,141.22);
);
out body geom;
`;

const res = await fetch("https://overpass.kumi.systems/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "resorts/Sichinohe-CyoueiSki-research/1.0",
  },
  body: `data=${encodeURIComponent(query)}`,
});
const data = await res.json();
const fs = await import("node:fs");
const outPath = new URL("../_osm_shichinohe.json", import.meta.url);
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

for (const el of data.elements ?? []) {
  const tags = el.tags ?? {};
  const kind = tags.aerialway ?? tags["piste:type"] ?? el.type;
  const name = tags.name ?? tags.ref ?? "";
  const pts = el.geometry?.length ?? 0;
  console.log(`${el.type}\t${kind}\t${name}\t${pts}pts`);
}
console.log("total", data.elements?.length ?? 0);
