const places = [
  ["ao-no-bi-yuyu", "碧の美 ゆゆ 白金温泉 美瑛"],
  ["park-hills", "美瑛白金四季の森ホテルパークヒルズ 白金温泉"],
  ["tsuewasure", "湯処 杖忘れの湯 白金温泉 美瑛"],
  ["mori-no-ryotei", "森の旅亭 びえい 白金温泉"],
  ["mori-no-shizuku", "森の雫 RIN 白金温泉 美瑛"],
  ["kokumin", "白金温泉 美瑛町国民保養センター"],
  ["ryounkaku", "十勝岳温泉 湯元 凌雲閣 上富良野"],
  ["hakuginso", "吹上温泉保養センター 白銀荘 上富良野"],
  ["fukiage-roten", "吹上露天の湯 上富良野"],
  ["yukoma", "旭岳温泉 湯元 湧駒荘 東川町"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [id, q] of places) {
  const url =
    "https://nominatim.openstreetmap.org/search?q=" +
    encodeURIComponent(q) +
    "&format=json&limit=1&countrycodes=jp";
  const res = await fetch(url, { headers: { "User-Agent": "SkiresortWebPlan/1.0" } });
  const data = await res.json();
  const hit = data[0];
  console.log(
    id,
    hit ? `${hit.lat},${hit.lon} | ${hit.name || hit.display_name.slice(0, 90)}` : "NOT FOUND",
  );
  await sleep(1100);
}
