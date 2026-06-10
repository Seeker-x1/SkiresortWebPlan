const queries = [
  "七戸町営スキー場",
  "Shichinohe Town Ski Area Aomori",
  "字左組 七戸町 スキー",
];

for (const q of queries) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q,
    format: "json",
    limit: "5",
  })}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "resorts/Sichinohe-CyoueiSki-research/1.0 (contact: local-dev)" },
  });
  const data = await res.json();
  console.log("\n===", q, "===");
  console.log(JSON.stringify(data, null, 2));
}
