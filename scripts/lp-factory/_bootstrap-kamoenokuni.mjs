#!/usr/bin/env node
/** Bootstrap kamoenokuni-lp from kiyosato-lp */
import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "docs/mock-assets/kiyosato-lp");
const LP = join(ROOT, "docs/mock-assets/kamoenokuni-lp");

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
  meta: { title: "上ノ国町民スキー場", description: "リフト無料 · 12–13時休止 · 湯ノ岱温泉とワイナリー" },
  logo: "上ノ国町民スキー場",
  hero: {
    eyebrow: "北海道上ノ国町 · 湯ノ岱",
    title: "上ノ国町民<br />スキー場",
    tagline: "リフト無料——12:00–13:00は運行休止。ルールを知って、湯ノ岱とセットで。",
    badgePrice: "利用料 無料",
    badgeNight: "ナイター 〜21:00",
    ctaTrip: "湯ノ岱周遊プラン",
    ctaLive: "本日の運行",
  },
  live: {
    ariaLabel: "本日の運行ダッシュボード",
    chipOpen: "要確認 · Tバー2 · ロープ1",
    chipPowder: "圧雪 · パウダー",
    chipPark: "12:00–13:00 休止",
    lineNote: "更新 6/28 9:00 · 日曜17:00終了",
  },
  transit: {
    eyebrow: "Yunotai",
    title: "湯ノ岱の、<br />無料ゲレンデ。",
    lead: "上ノ国町湯ノ岱地区。Tバー2基・ロープトウ1基のみ——チェアリフトはありません。無料ながら圧雪・ナイター完備。12:00–13:00は全リフト休止（昼休み）。",
    specs: ["利用料 無料", "9:00–21:00（日曜17:00）", "湯ノ岱温泉至近"],
    ctaAccess: "アクセス・駐車場",
    ctaPricing: "運行ルール",
    imgAlt: "湯ノ岱の無料町民スキー場——Tバーとロープトウ",
  },
  paths: {
    today: { label: "今日", title: "リフト・積雪" },
    access: { label: "アクセス", title: "湯ノ岱へ" },
    slopes: { label: "ゲレンデ", title: "Tバー・コース" },
    nearby: { label: "周辺", title: "温泉・ワイナリー" },
  },
  highlights: {
    eyebrow: "ここが違う",
    title: "無料 × 独特ルール",
    primary: {
      title: "12–13時は全リフト休止",
      lead: "正午から1時間、Tバー・ロープトウは完全停止——スタッフの昼休み兼メンテナンス。遠方から来る場合は必ず事前確認。英語表記の案内板イメージで混乱を防ぐ。",
      cta: "本日の運行",
      imgAlt: "山小屋前の運行案内——上ノ国の独特ルール",
    },
    secondary: {
      title: "表面リフトのみ",
      lead: "Tバー2基・ロープトウ1基。初心者・ボード客には難易度が高め——コツを掴めば無料で300m級のバーンを楽しめます。",
      cta: "アクセス・駐車場",
    },
  },
  nap: {
    eyebrow: "Yunotai Loop",
    title: "昼休みは、<br />温泉とランチへ。",
    lead: "12:00–13:00のリフト休止時間に、隣接する湯ノ岱温泉（炭酸泉）や cafe iroha、上ノ国ワイナリーへ——スキー場単体ではなく湯ノ岱トライアングルで回遊。",
    cta: "周辺マップ",
    imgAlt: "湯ノ岱温泉の外観——スキー後の炭酸泉",
  },
  recovery: {
    eyebrow: "Onsen · Wine",
    title: "滑ったあと、<br />湯ノ岱へ。",
    lead: "評価の高い炭酸泉「湯ノ岱温泉」、廃校リノベの「上ノ国ワイナリー＆サテライトオフィス」——無料スキーのあと、エリア消費の核。",
    noticeTitle: "Tバー・ロープトウについて：",
    noticeBody: "チェアリフトはありません。初めての方はスタッフに声をかけて。日曜は17:00終了。積雪・天候で営業変動あり。",
    cta: "手ぶら・宿泊プラン",
    imgAlt: "上ノ国ワイナリー——湯ノ岱地区のリノベ施設",
  },
  trip: {
    eyebrow: "Yunotai Day",
    title: "無料スキー、<br />有料の温浴とワイン。",
    lead: "午前：無料ゲレンデ → 12時：リフト休止で温泉ランチ → 午後：再開後ナイターまで——湯ノ岱モデル。",
    badge: "FREE LIFT · YUNOTAI LOOP",
    steps: {
      "01": { title: "湯ノ岱到着", body: "駐車場からゲレンデへ" },
      "02": { title: "午前滑走", body: "Tバー・ロープトウ · 無料" },
      "03": { title: "12–13 休止", body: "湯ノ岱温泉 · cafe iroha" },
      "04": { title: "午後〜ナイター", body: "再開後21:00まで（日曜17:00）" },
      "05": { title: "ワイナリー", body: "上ノ国ワイナリー見学・試飲" },
    },
  },
  guides: {
    transit: {
      title: "12–13時休止の読み方",
      body: "毎日正午から1時間、全表面リフトが停止。メンテナンスとスタッフ休憩——遠方・初来場者向けに英語併記の運行表をページ上部で強調。",
    },
    night: {
      title: "ナイターと日曜短縮",
      body: "月〜土は21:00まで。日曜・祝日は17:00終了——カレンダー表示で一目確認。",
    },
    handsfree: {
      title: "手ぶら・宿泊",
      body: "用具レンタルは限定的——近隣宿と連携した手ぶらプランは要確認。湯ノ岱温泉宿泊とセットが定番。",
    },
  },
  access: {
    postal: "〒049-0562",
    line: "北海道檜山郡上ノ国町字湯ノ岱240",
    note: "函館本線 上ノ国駅から車約20分 · 駐車場あり",
    phone: "TEL 0139-55-2230（上ノ国町）",
    places: "",
    rentacarEyebrow: "道南・檜山",
    rentacarLink: "函館空港でレンタカー予約",
    rentacarNote: "スカイチケット（外部サイト）",
    rentacarHint: "上ノ国・湯ノ岱周遊向け",
  },
  footer: {
    copyright: "© 上ノ国町民スキー場",
    location: "〒049-0562 北海道檜山郡上ノ国町字湯ノ岱240",
  },
};

const en = {
  meta: { title: "Kaminokuni Town Ski Area", description: "Free lifts · noon break 12:00–13:00 · Yunotai onsen & winery" },
  logo: "Kaminokuni Town Ski Area",
  hero: {
    eyebrow: "Kaminokuni, Hokkaido · Yunotai",
    title: "Kaminokuni<br />Town Ski",
    tagline: "Free lift access—lifts stop 12:00–13:00 daily. Know the rules, pair with Yunotai.",
    badgePrice: "Free",
    badgeNight: "Night skiing until 21:00",
    ctaTrip: "Yunotai loop plan",
    ctaLive: "Today's status",
  },
  live: {
    ariaLabel: "Today's operations dashboard",
    chipOpen: "Check locally · 2 T-bars · 1 rope",
    chipPowder: "Groomed · powder",
    chipPark: "12:00–13:00 lift break",
    lineNote: "Updated Jun 28 9:00 · Sun closes 17:00",
  },
  transit: {
    eyebrow: "Yunotai",
    title: "The free hill<br />at Yunotai.",
    lead: "In Kaminokuni's Yunotai district—two T-bars and one rope tow, no chairlifts. Free grooming and night lighting. All lifts stop 12:00–13:00 for lunch break.",
    specs: ["Free access", "9:00–21:00 (Sun until 17:00)", "Yunotai Onsen nearby"],
    ctaAccess: "Access & parking",
    ctaPricing: "Operating rules",
    imgAlt: "Free municipal hill with T-bars and rope tow at Yunotai",
  },
  paths: {
    today: { label: "Today", title: "Lifts & snow" },
    access: { label: "Access", title: "Getting to Yunotai" },
    slopes: { label: "Slopes", title: "T-bars & courses" },
    nearby: { label: "Nearby", title: "Onsen · winery" },
  },
  highlights: {
    eyebrow: "What to know",
    title: "Free · unique rules",
    primary: {
      title: "No lifts 12:00–13:00",
      lead: "One hour at noon—all surface lifts stop for staff break and maintenance. Check before traveling from far away; bilingual signage helps avoid surprises.",
      cta: "Today's status",
      imgAlt: "Operations notice at the lodge—Kaminokuni's local rules",
    },
    secondary: {
      title: "Surface lifts only",
      lead: "Two T-bars and one rope tow—tricky for first-timers and snowboarders. Once you get the hang, enjoy ~300m runs for free.",
      cta: "Access & parking",
    },
  },
  nap: {
    eyebrow: "Yunotai loop",
    title: "Lunch break<br />means onsen.",
    lead: "Use the noon lift break for Yunotai Onsen (carbonated spring), cafe iroha, or Kaminokuni Winery—the Yunotai triangle, not the hill alone.",
    cta: "Area map",
    imgAlt: "Yunotai Onsen exterior—carbonated hot spring after skiing",
  },
  recovery: {
    eyebrow: "Onsen · wine",
    title: "After skiing,<br />Yunotai waits.",
    lead: "Highly rated Yunotai Onsen and the renovated Kaminokuni Winery & Satellite Office—the spend anchors after free skiing.",
    noticeTitle: "About T-bars & rope tow:",
    noticeBody: "No chairlifts. Ask staff if you're new. Sundays close at 17:00. Hours vary with snow and weather.",
    cta: "Stay & hands-free info",
    imgAlt: "Kaminokuni Winery—renovated schoolhouse in Yunotai",
  },
  trip: {
    eyebrow: "Yunotai day",
    title: "Free skiing,<br />paid warmth & wine.",
    lead: "Morning runs → noon break at the onsen → afternoon and night skiing until 21:00—a Yunotai day model.",
    badge: "FREE LIFT · YUNOTAI LOOP",
    steps: {
      "01": { title: "Arrive Yunotai", body: "Parking to the base" },
      "02": { title: "Morning runs", body: "T-bars & rope · free" },
      "03": { title: "12–13 break", body: "Yunotai Onsen · cafe iroha" },
      "04": { title: "Afternoon & night", body: "Until 21:00 (Sun 17:00)" },
      "05": { title: "Winery", body: "Kaminokuni Winery tour & tasting" },
    },
  },
  guides: {
    transit: {
      title: "Reading the noon break",
      body: "Every day from noon for one hour, all surface lifts stop—for maintenance and staff rest. Highlight bilingual hours at the top for visitors.",
    },
    night: {
      title: "Night skiing & Sunday hours",
      body: "Mon–Sat until 21:00. Sundays and some holidays until 17:00—show on a calendar at a glance.",
    },
    handsfree: {
      title: "Hands-free & stays",
      body: "Limited rental on site—confirm hands-free packages with nearby lodges. Yunotai Onsen stays are the classic pairing.",
    },
  },
  access: {
    postal: "〒049-0562",
    line: "240 Yunotai, Kaminokuni, Hokkaido",
    note: "~20 min by car from Kaminokuni Station · parking available",
    phone: "TEL +81-139-55-2230 (Kaminokuni Town)",
    places: "",
    rentacarEyebrow: "Southern Hokkaido · Hiyama",
    rentacarLink: "Book a rental car at Hakodate Airport",
    rentacarNote: "Skyticket (external site)",
    rentacarHint: "For Kaminokuni and Yunotai loops",
  },
  footer: {
    copyright: "© Kaminokuni Town Ski Area",
    location: "240 Yunotai, Kaminokuni, Hokkaido 049-0562",
  },
};

writeFileSync(join(LP, "messages/ja.json"), JSON.stringify(ja, null, 2) + "\n");
writeFileSync(join(LP, "messages/en.json"), JSON.stringify(en, null, 2) + "\n");

for (const file of readdirSync(LP)) {
  const fp = join(LP, file);
  if (!statSync(fp).isFile() || !/\.(html|css|png)$/i.test(file)) continue;
  if (file.endsWith(".png")) {
    if (file.includes("kiyosato")) {
      const newName = file.replace(/kiyosato/g, "kamoenokuni");
      copyFileSync(fp, join(LP, newName));
    }
    continue;
  }
  if (!/\.(html|css)$/i.test(file)) continue;
  let html = readFileSync(fp, "utf8");
  html = html
    .replace(/data-mock-resort="kiyosato"/g, 'data-mock-resort="kamoenokuni"')
    .replace(/resort=kiyosato/g, "resort=kamoenokuni")
    .replace(/lp-mock-kiyosato/g, "lp-mock-kamoenokuni")
    .replace(/清里町営緑スキー場/g, "上ノ国町民スキー場")
    .replace(/清里町営<br \/>緑スキー場/g, "上ノ国町民<br />スキー場")
    .replace(/Kiyosato Midori/g, "Kaminokuni Town")
    .replace(/kiyosato/g, "kamoenokuni");
  writeFileSync(fp, html, "utf8");
}

console.log("✓ kamoenokuni-lp bootstrapped");
