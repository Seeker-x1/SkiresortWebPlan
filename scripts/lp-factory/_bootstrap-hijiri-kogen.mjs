#!/usr/bin/env node
/** Bootstrap hijiri-kogen-lp from kamikawa-nakayama-lp */
import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "docs/mock-assets/kamikawa-nakayama-lp");
const LP = join(ROOT, "docs/mock-assets/hijiri-kogen-lp");

function cpDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dest, name);
    if (statSync(s).isDirectory()) cpDir(s, d);
    else copyFileSync(s, d);
  }
}

if (!statSync(LP, { throwIf: false })?.isDirectory()) cpDir(SRC, LP);

const ja = {
  meta: { title: "聖高原スキー場", description: "白馬・志賀の混雑を避ける、家族のためのプライベート・スノーパーク。" },
  logo: "聖高原スキー場",
  nav: { freemium: "料金", tour: "周遊" },
  hero: {
    eyebrow: "長野県麻績村 · 長野道麻績IC",
    title: "聖高原<br />スキー場",
    tagline: "巨大リゾートの混雑を避け、家族でゆっくり滑れる——県内屈指のコスパ。",
    badgePrice: "休日 ¥3,000",
    badgeNight: "定休 · ナイターなし",
    badgeCourses: "ペアリフト1基",
    ctaFreemium: "料金・シーズン券",
    ctaLive: "本日のコンディション",
  },
  live: {
    ariaLabel: "本日の運営ダッシュボード",
    subtitle: "リフト・積雪の目安",
    updatedAt: "更新 6/28 9:00",
    lift: { label: "第1ペアリフト", value: "運行中", note: "321m · 1基のみ" },
    snow: { label: "雪質", value: "要確認", note: "標高1,000m · 天然雪" },
    night: { label: "営業", value: "8:40–16:30", note: "ナイターなし" },
    parking: { label: "駐車場", value: "無料", note: "約100〜200台 · 麻績IC約15分" },
  },
  sanctuary: {
    eyebrow: "Family Park",
    title: "リフト1基、<br />迷子にならない。",
    lead: "扇状に広がる3コースがすべてベースに合流——小さなお子さん連れでも見守りやすい、昭和レトロなローカルゲレンデ。北アルプス・戸隠・妙高を一望する展望台も。",
    specs: ["A上級270m · B中級270m · C初級260m", "そり専用50m（無料）", "親子シーズン券 ¥15,000"],
    noticeTitle: "運営について：",
    noticeBody: "ゲレンデ内に常時営業のレストランはありません。昼食は聖レイクサイド館など近隣施設へ。積雪・暖冬により営業期間は変動します——出発前に公式確認を。",
    ctaFreemium: "料金を見る",
    imgAlt: "360度パノラマの小さなゲレンデ——聖高原スキー場",
  },
  paths: {
    freemium: { label: "料金", title: "日券・シーズン券" },
    access: { label: "アクセス", title: "麻績ICから15分" },
    today: { label: "今日", title: "リフト・積雪" },
    tour: { label: "周遊", title: "湖・温泉・グルメ" },
    map: { label: "マップ", title: "3コース・1リフト" },
  },
  highlights: {
    eyebrow: "ここが違う",
    title: "混雑しない安心感",
    primary: {
      title: "白馬・志賀の避難所",
      lead: "近隣メガリゾートが混雑・高騰するシーズンに、休日大人3,000円・親子シーズン券15,000円——ファミリーが自分のペースで滑れる「プライベート感」。",
      cta: "ゲレンデマップ",
      imgAlt: "空いたバーンで家族が滑る——聖高原の緩斜面",
    },
    secondary: {
      title: "360度の大パノラマ",
      lead: "山頂展望台から善光寺平・北アルプス・戸隠・妙高・黒姫まで——標高差131mの小さなゲレンデながら、景色はリゾート級。",
      cta: "周遊ルートを見る",
    },
  },
  freemium: {
    eyebrow: "Pricing",
    title: "県内屈指の<br />コスパ。",
    lead: "休日大人3,000円・小人2,000円。平日はさらに安く——4時間券2,000円から。第3日曜は中学生以下リフト無料（スキー子供の日）。",
    specs: ["親子シーズン券 ¥15,000", "駐車場無料", "回数券は自分で入鋏"],
    cta: "アクセス・営業時間",
    imgAlt: "昭和レトロなリフト券売り場——聖高原の入鋏スタイル",
  },
  wellness: {
    eyebrow: "After Ski",
    title: "滑ったあと、<br />聖湖と温泉へ。",
    lead: "聖レイクサイド館の洋食ランチ、みたらし温泉、古民家カフェ精晴堂——ゲレンデに食堂がなくても、車15分圏の回遊で一日を完結。",
    leadStation: "無料休憩所を拠点に、近隣飲食と温泉をセットで案内。",
    cta: "周遊ルートを見る",
    imgAlt: "聖湖と北アルプス——スキー後の高原散策",
  },
  tour: {
    eyebrow: "Omi Loop",
    title: "麻績IC発、<br />半日ファミリー。",
    lead: "午前：聖高原で3コース → 昼：聖レイクサイド館 → 午後：みたらし温泉——混雑を避けた長野ドライブモデル。",
    badge: "HIJIRI · FAMILY VALUE",
    steps: {
      "01": { title: "麻績IC", body: "長野道から約15分 · 駐車場無料" },
      "02": { title: "聖高原", body: "1基リフトで3コース · そりエリア" },
      "03": { title: "ランチ", body: "聖レイクサイド館 · 小松屋食堂" },
      "04": { title: "温泉", body: "みたらし温泉 · 草湯温泉冠着荘" },
      "05": { title: "帰路", body: "長野市・松本方面へ" },
    },
    cta: "アクセス詳細",
  },
  access: {
    postal: "〒399-7700",
    line: "長野県東筑摩郡麻績村麻5889-1",
    note: "長野自動車道 麻績ICより約15分 · 聖高原駅からバス・タクシー約15分",
    phone: "TEL 0263-67-2145",
    places: "",
    rentacarEyebrow: "長野・松本圏",
    rentacarLink: "松本駅でレンタカー予約",
    rentacarNote: "スカイチケット（外部サイト）",
    rentacarHint: "麻績IC・白馬・志賀周遊向け",
  },
  footer: {
    copyright: "© 聖高原スキー場（麻績村）",
    location: "〒399-7700 長野県東筑摩郡麻績村麻5889-1",
  },
};

const en = {
  meta: { title: "Hijiri Kogen Ski Area", description: "A quiet family snow park away from Hakuba and Shiga crowds." },
  logo: "Hijiri Kogen Ski Area",
  nav: { freemium: "Tickets", tour: "Loop" },
  hero: {
    eyebrow: "Omi, Nagano · Omachi IC",
    title: "Hijiri<br />Kogen",
    tagline: "Skip the mega-resort crowds—affordable, uncrowded skiing for families.",
    badgePrice: "Weekend ¥3,000",
    badgeNight: "No night skiing",
    badgeCourses: "1 pair lift",
    ctaFreemium: "Tickets & season pass",
    ctaLive: "Today's status",
  },
  live: {
    ariaLabel: "Today's operations dashboard",
    subtitle: "Lift and snow at a glance",
    updatedAt: "Updated Jun 28 9:00",
    lift: { label: "Pair lift", value: "Operating", note: "321m · single lift only" },
    snow: { label: "Snow", value: "Check locally", note: "1,000m base · natural snow" },
    night: { label: "Hours", value: "8:40–16:30", note: "No night skiing" },
    parking: { label: "Parking", value: "Free", note: "~100–200 spaces · ~15 min from Omachi IC" },
  },
  sanctuary: {
    eyebrow: "Family park",
    title: "One lift,<br />easy to watch.",
    lead: "Three fan-shaped courses all return to one base—hard to get separated, with Showa-era local charm. Summit views span the Northern Alps and Myoko.",
    specs: ["A advanced 270m · B intermediate 270m · C beginner 260m", "Free sled hill 50m", "Parent-child season ¥15,000"],
    noticeTitle: "Good to know:",
    noticeBody: "No full-time slope restaurant—lunch at Sei Lakeside Hall and nearby spots. Hours vary with snow—confirm before you go.",
    ctaFreemium: "See ticket prices",
    imgAlt: "Compact ski hill with panoramic Alps views",
  },
  paths: {
    freemium: { label: "Tickets", title: "Day & season passes" },
    access: { label: "Access", title: "15 min from Omachi IC" },
    today: { label: "Today", title: "Lift & snow" },
    tour: { label: "Loop", title: "Lake · onsen · food" },
    map: { label: "Map", title: "3 courses · 1 lift" },
  },
  highlights: {
    eyebrow: "Why here",
    title: "Quiet and affordable",
    primary: {
      title: "Escape the mega-resorts",
      lead: "When Hakuba and Shiga get pricey and packed, weekend adults pay ¥3,000 and parent-child season passes ¥15,000—ski at your family's pace.",
      cta: "Trail map",
      imgAlt: "Family on an uncrowded groomed run",
    },
    secondary: {
      title: "360° panorama",
      lead: "From the summit lookout: Zenkoji Plain, the Northern Alps, Togakushi, Myoko, and Kurohime—big views from a small hill.",
      cta: "See the loop route",
    },
  },
  freemium: {
    eyebrow: "Pricing",
    title: "Nagano's<br />value leader.",
    lead: "Weekend adults ¥3,000, children ¥2,000. Weekdays cost less—4-hour tickets from ¥2,000. Third Sunday: free lifts for junior high and under.",
    specs: ["Parent-child season ¥15,000", "Free parking", "Punch your own ticket stub"],
    cta: "Access & hours",
    imgAlt: "Retro ticket counter at a local ski hill",
  },
  wellness: {
    eyebrow: "After ski",
    title: "Lake, food,<br />and onsen.",
    lead: "Lunch at Sei Lakeside Hall, Mitaraishi Onsen, farmhouse cafe Seiseido—no slope cafeteria, but a 15-minute drive completes the day.",
    leadStation: "Use the free rest hut as your hub for nearby food and baths.",
    cta: "See the loop route",
    imgAlt: "Lake Sei and the Northern Alps after skiing",
  },
  tour: {
    eyebrow: "Omi loop",
    title: "Half-day<br />family drive.",
    lead: "Morning runs at Hijiri → lunch at Sei Lakeside → afternoon soak at Mitaraishi—a Nagano day trip without crowds.",
    badge: "HIJIRI · FAMILY VALUE",
    steps: {
      "01": { title: "Omachi IC", body: "~15 min on the Nagano Expressway · free parking" },
      "02": { title: "Hijiri Kogen", body: "One lift · three courses · sled hill" },
      "03": { title: "Lunch", body: "Sei Lakeside Hall · Komatsuya diner" },
      "04": { title: "Onsen", body: "Mitaraishi · Kanshukaku at Kusayu" },
      "05": { title: "Return", body: "Toward Nagano city or Matsumoto" },
    },
    cta: "Access details",
  },
  access: {
    postal: "〒399-7700",
    line: "5889-1 Aza, Omi, Nagano",
    note: "~15 min from Omachi IC · ~15 min by bus/taxi from Hijiri-Kogen Station",
    phone: "TEL +81-263-67-2145",
    places: "",
    rentacarEyebrow: "Nagano · Matsumoto",
    rentacarLink: "Book a rental car at Matsumoto Station",
    rentacarNote: "Skyticket (external site)",
    rentacarHint: "For Omachi IC, Hakuba, and Shiga drives",
  },
  footer: {
    copyright: "© Hijiri Kogen Ski Area (Omi Village)",
    location: "5889-1 Aza, Omi, Nagano 399-7700",
  },
};

writeFileSync(join(LP, "messages/ja.json"), JSON.stringify(ja, null, 2) + "\n");
writeFileSync(join(LP, "messages/en.json"), JSON.stringify(en, null, 2) + "\n");

for (const file of readdirSync(LP)) {
  const fp = join(LP, file);
  if (!statSync(fp).isFile() || !/\.(html|css)$/i.test(file)) continue;
  let html = readFileSync(fp, "utf8");
  html = html
    .replace(/data-mock-resort="kamikawa-nakayama"/g, 'data-mock-resort="hijiri-kogen"')
    .replace(/resort=kamikawa-nakayama/g, "resort=hijiri-kogen")
    .replace(/lp-mock-kamikawa-nakayama/g, "lp-mock-hijiri-kogen")
    .replace(/上川町営中山スキー場/g, "聖高原スキー場")
    .replace(/上川町営<br \/>中山スキー場/g, "聖高原<br />スキー場")
    .replace(/Kamikawa Nakayama/g, "Hijiri Kogen")
    .replace(/kamikawa-nakayama/g, "hijiri-kogen");
  writeFileSync(fp, html, "utf8");
}

let css = readFileSync(join(LP, "mock.css"), "utf8");
css = css.replace(/上川町営中山スキー場/g, "聖高原スキー場");
if (!css.includes("--accent:")) {
  css = css.replace(":root {", ":root {\n  --bg: #f7f9f4;\n  --accent: #4a7c59;\n  --accent-soft: #e8f0e4;");
}
writeFileSync(join(LP, "mock.css"), css);
console.log("✓ hijiri-kogen-lp bootstrapped");
