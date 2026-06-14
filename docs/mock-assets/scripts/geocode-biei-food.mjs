const places = [
  ["junpei", "洋食とCafe じゅんぺい 美瑛町本町4丁目4-10"],
  ["biei-farm", "美瑛放牧酪農場 美瑛町字新星平和5235"],
  ["aruno", "あるうのぱいん 美瑛町大村村山1087-16"],
  ["chiyoda", "ファームレストラン千代田 美瑛町"],
  ["ferme", "フェルム ラ・テール 美瑛町大村村山"],
  ["between", "BETWEEN THE BREAD 道の駅 白金ビルケ 美瑛町"],
  ["gosh", "自家焙煎珈琲店 Gosh 美馬牛"],
  ["asperge", "美瑛選果 美瑛町大町2丁目"],
  ["sabo", "美瑛茶房 美瑛町中町1丁目3-26"],
  ["santouka", "らーめん山頭火 美瑛町大町2丁目6-37"],
  ["ski", "美瑛町民スキー場 大村村山"],
  ["blue-pond", "青い池 美瑛町白金"],
  ["biei-station", "美瑛駅 富良野線 北海道"],
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
    hit ? `${hit.lat},${hit.lon} | ${hit.name || hit.display_name.slice(0, 100)}` : "NOT FOUND",
  );
  await sleep(1100);
}
