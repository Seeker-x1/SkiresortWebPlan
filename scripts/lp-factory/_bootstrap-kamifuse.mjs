#!/usr/bin/env node
/** One-off bootstrap: biei-lp template → kamifuse-lp messages */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LP = join(ROOT, "docs/mock-assets/kamifuse-lp");
const BIEI = join(ROOT, "docs/mock-assets/biei-lp");

function patchJa(base) {
  return {
    ...base,
    meta: {
      title: "釜臥山スキー場",
      description: "陸奥湾へ向かって滑る本州最北端の絶景——ねこプリンカフェとナイターで冬の非日常を。",
    },
    logo: "釜臥山スキー場",
    hero: {
      eyebrow: "青森県 · むつ市大湊",
      title: "釜臥山<br />スキー場",
      tagline: "陸奥湾へ向かって滑る、本州最北端の絶景ゲレンデ。",
      badgeFree: "小学生以下 無料",
      ctaToday: "今日の運営",
      updatedAt: "6/28 9:00",
    },
    transit: {
      eyebrow: "Drive",
      title: "海が見える、<br />ドライブの先。",
      lead: "大湊ICから車で約15分。眼下に広がる陸奥湾と護衛艦の港——他にはない「海辺のダウンヒル」へ。レンタカーで下北半島を回る旅の拠点にも。",
      ctaAccess: "アクセス・駐車場",
      ctaRental: "レンタカー案内",
      imgAlt: "陸奥湾を見下ろす雪道——大湊から釜臥山スキー場へ",
    },
    paths: {
      today: { label: "今日", title: "今日の運営" },
      access: { label: "アクセス", title: "大湊からの道" },
      wellness: { label: "カフェ", title: "ねこプリン・絶景" },
      pricing: { label: "料金", title: "日券・ナイター" },
      bluePond: { label: "夜景", title: "光のアゲハチョウ" },
      food: { label: "グルメ", title: "大湊飲食10選" },
      onsen: { label: "温泉", title: "周辺温泉10選" },
    },
    highlights: {
      eyebrow: "釜臥山の魅力",
      title: "ここが違う",
      primary: {
        title: "海へ向かって滑る絶景",
        lead: "晴天時は八甲田から北海道まで見渡せる大パノラマ。眼下に広がる陸奥湾と大湊の港——全国でも稀有な「海辺のダウンヒル」体験。",
        cta: "ゲレンデマップ",
        imgAlt: "陸奥湾を見下ろすゲレンデ——釜臥山の絶景滑走",
      },
      secondary: {
        title: "ねこプリンで有名なカフェ",
        lead: "センターハウス「Re:lax+kitchen」のねこプリン（平日限定が多い——要確認）。スキーをしない方もリフトで絶景とスイーツを楽しむ来場者が増えています。",
        cta: "カフェ・絶景ガイド",
      },
    },
    recovery: {
      eyebrow: "温活・回復",
      title: "滑ったあと、<br />大湊グルメへ。",
      lead: "朝7時から営業の「あらそば」味噌ラーメン、大湊吉田ベーカリーのアンバターサンド、海軍コロッケの居酒屋——スキー後の定番ルート。",
      whisper: "むつ矢立温泉や斗南温泉「美人の湯」で冷えた体を温めるのもおすすめ。",
      ctaFood: "周辺飲食10選",
      ctaOnsen: "周辺温泉10選",
      imgAlt: "大湊の味噌ラーメン——スキー後の温活ランチ",
    },
    journey: {
      eyebrow: "Ominato Loop",
      title: "大湊から始まる、<br />一日の回遊",
      lead: "絶景スキーと港町グルメ、ミリタリー史、夜景まで——むつ市大湊エリアを一日で巡るモデル。",
      steps: {
        "01": { title: "朝ラー", body: "あらそばで味噌ラーメン——早朝から地元民の定番" },
        "02": {
          title: "絶景滑走",
          body: "釜臥山で陸奥湾ビューのダウンヒル、またはカフェでねこプリン",
          linkLabel: "カフェ・絶景ガイド",
        },
        "03": {
          title: "港町ランチ",
          body: "吉田ベーカリー、アンバターサンドと海鮮",
          linkLabel: "周辺飲食ガイド",
          linkOnsen: "周辺温泉ガイド",
        },
        "04": { title: "北洋館", body: "海上自衛隊の歴史資料館——入場無料（冬季要確認）" },
        "05": {
          title: "夜景・温泉",
          body: "むつ市街「光のアゲハチョウ」と矢立温泉——冬の締めくくり",
          linkLabel: "夜景ガイドを読む",
        },
      },
    },
    guides: {
      wellness: {
        title: "ねこプリンと絶景カフェ",
        body: "Re:lax+kitchen のねこプリンと青クリームソーダ——SNSでも話題。平日限定・売切れあり。リフト券のみで絶景デッキへ。",
        thumbAlt: "ねこプリンと窓越しの雪景色——釜臥山センターハウス",
      },
      walk: {
        title: "大湊から車で15分",
        body: "下北半島ドライブの拠点。大湊IC経由でアクセス。冬季はスタッドレスタイヤ必須——海沿いは路面状況に注意。",
      },
      responsible: {
        title: "海辺のゲレンデマナー",
        body: "リフト間の徒歩移動区間あり（第2→第1リフト約50m）。湿雪の日は体力消耗に注意。公式の運行・積雪情報を出発前に確認。",
        hashtags: ["#KamifuseSki", "#MutsuBayView", "#ShimokitaWinter"],
      },
      bluePond: {
        title: "光のアゲハチョウ — むつ夜景",
        body: "展望台から見下ろす市街の灯りが蝶の羽のように広がる——冬のナイター営業中はゲレンデからも夜景を楽しめます。",
        thumbAlt: "むつ市街の夜景「光のアゲハチョウ」——陸奥湾に挟まれた灯り",
      },
      food: {
        title: "大湊飲食10選 — スキーの前後に",
        body: "味噌ラーメン・海軍コロッケ・地場海鮮——港町ならではのグルメをピックアップ。",
        thumbAlt: "大湊の味噌ラーメン——朝ラーから夜の居酒屋まで",
      },
      onsen: {
        title: "周辺温泉10選 — 雪見入浴",
        body: "矢立温泉、奥薬研温泉、斗南温泉——スキー後の日帰り入浴スポット。",
        thumbAlt: "雪景色と温泉——下北の温活",
      },
    },
    featuredSpot: {
      eyebrow: "Night view",
      title: "光のアゲハチョウ",
      lead: "むつ市街の灯りが陸奥湾に沿って蝶の形に——冬の釜臥山ナイターとセットで。",
      cta: "夜景ガイド",
      imgAlt: "冬の夜、ゲレンデから見下ろすむつ市街の灯り",
    },
    access: {
      postal: "〒035-0096",
      line: "青森県むつ市大字大湊字大川守44-5",
      note: "大湊ICから車で約15分 · むつ市営",
      phone: "TEL 0175-24-1881",
      places: "",
      rentacarEyebrow: "下北・青森圏",
      rentacarLink: "新青森駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "大湊・下北半島周遊向け",
    },
    footer: {
      copyright: "© 釜臥山スキー場（むつ市）",
      location: "〒035-0096 青森県むつ市大字大湊字大川守44-5",
    },
  };
}

function patchEn(base) {
  return {
    ...base,
    meta: {
      title: "Mount Kamifuse Ski Area",
      description: "Honshu's northernmost ski hill with Mutsu Bay panoramas, cat pudding cafe, and night skiing.",
    },
    logo: "Mount Kamifuse Ski Area",
    hero: {
      eyebrow: "Mutsu, Aomori · Ominato",
      title: "Mount<br />Kamifuse",
      tagline: "Ski toward the sea at Honshu's northern edge—a rare ocean-view downhill.",
      badgeFree: "Kids lift free",
      ctaToday: "Today's status",
      updatedAt: "Jun 28 9:00",
    },
    transit: {
      eyebrow: "Drive",
      title: "Where the road<br />meets the bay.",
      lead: "About 15 minutes from Ominato IC. Mutsu Bay and the naval port unfold below—a downhill run you won't find elsewhere. A natural base for Shimokita drives.",
      ctaAccess: "Access & parking",
      ctaRental: "Rental car info",
      imgAlt: "Snowy coastal road overlooking Mutsu Bay—approach to Kamifuse",
    },
    paths: {
      today: { label: "Today", title: "Today's operations" },
      access: { label: "Access", title: "From Ominato" },
      wellness: { label: "Cafe", title: "Cat pudding & views" },
      pricing: { label: "Tickets", title: "Day & night passes" },
      bluePond: { label: "Night", title: "Agehacho lights" },
      food: { label: "Food", title: "Ominato dining 10" },
      onsen: { label: "Onsen", title: "Nearby hot springs" },
    },
    highlights: {
      eyebrow: "Why Kamifuse",
      title: "What sets it apart",
      primary: {
        title: "Downhill toward the ocean",
        lead: "On clear days, panoramas stretch from the Hakkoda range toward Hokkaido. Mutsu Bay and Ominato port lie right below—a rare seaside downhill in Japan.",
        cta: "Trail map",
        imgAlt: "Groomed slope overlooking Mutsu Bay at Kamifuse",
      },
      secondary: {
        title: "Famous cat pudding cafe",
        lead: "Re:lax+kitchen's cat-shaped pudding draws visitors who come just for the view and sweets. Weekday-only slots are common—check before you go.",
        cta: "Cafe & view guide",
      },
    },
    recovery: {
      eyebrow: "Warm up",
      title: "After skiing,<br />Ominato eats.",
      lead: "Morning miso ramen at Arasoba (opens 7:00), butter sandwiches at Yoshida Bakery, navy croquettes at local izakaya—classic après routes.",
      whisper: "Day-trip soaks at Mutsu Yatate Onsen or Tonan Onsen pair well with a ski day.",
      ctaFood: "Nearby dining guide",
      ctaOnsen: "Nearby onsen guide",
      imgAlt: "Steaming miso ramen in Ominato after skiing",
    },
    journey: {
      eyebrow: "Ominato Loop",
      title: "A full day from<br />the port town",
      lead: "Combine ocean-view skiing, harbor food, maritime history, and night lights in one Shimokita loop.",
      steps: {
        "01": { title: "Morning ramen", body: "Miso ramen at Arasoba—a local early-bird staple" },
        "02": {
          title: "Bay-view runs",
          body: "Downhill with Mutsu Bay below, or cat pudding at the center house",
          linkLabel: "Cafe & view guide",
        },
        "03": {
          title: "Harbor lunch",
          body: "Yoshida Bakery butter sandwiches and seafood",
          linkLabel: "Dining guide",
          linkOnsen: "Onsen guide",
        },
        "04": { title: "Hoppokan museum", body: "Maritime Self-Defense Force history—free entry (check winter hours)" },
        "05": {
          title: "Night lights & onsen",
          body: "Mutsu's Agehacho city lights and Yatate Onsen to finish",
          linkLabel: "Night view guide",
        },
      },
    },
    guides: {
      wellness: {
        title: "Cat pudding & view cafe",
        body: "Re:lax+kitchen cat pudding and blue cream soda—often weekday-only and sell out early. Lift tickets reach the view deck without gear.",
        thumbAlt: "Cat pudding with snowy slope view through the lodge window",
      },
      walk: {
        title: "15 minutes from Ominato",
        body: "Gateway for Shimokita drives via Ominato IC. Studless tires required in winter—watch coastal road conditions.",
      },
      responsible: {
        title: "Seaside slope etiquette",
        body: "Walk between Lift 2 and Lift 1 (~50 m). Heavy wet snow can be tiring. Confirm lift and snow reports before you travel.",
        hashtags: ["#KamifuseSki", "#MutsuBayView", "#ShimokitaWinter"],
      },
      bluePond: {
        title: "Agehacho — Mutsu night lights",
        body: "City lights spread like butterfly wings over the bay—visible from night skiing on the hill.",
        thumbAlt: "Mutsu city lights at night—the Agehacho view",
      },
      food: {
        title: "Ominato dining 10 — before & after",
        body: "Miso ramen, navy croquettes, local seafood—harbor-town picks for your ski day.",
        thumbAlt: "Ominato miso ramen—from morning to izakaya night",
      },
      onsen: {
        title: "Nearby onsen 10 — snow-view soaks",
        body: "Yatate, Okuyakken, and Tonan onsen—day-trip baths after skiing.",
        thumbAlt: "Snow and steam—Shimokita onsen recovery",
      },
    },
    featuredSpot: {
      eyebrow: "Night view",
      title: "Agehacho lights",
      lead: "Mutsu's butterfly-shaped city glow pairs with Kamifuse night skiing.",
      cta: "Night view guide",
      imgAlt: "City lights viewed from the snowy slope at night",
    },
    access: {
      postal: "〒035-0096",
      line: "44-5 Okawamori, Ominato, Mutsu, Aomori",
      note: "~15 min by car from Ominato IC · Mutsu City operated",
      phone: "TEL +81-175-24-1881",
      places: "",
      rentacarEyebrow: "Shimokita · Aomori",
      rentacarLink: "Book a rental car at Shin-Aomori Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ominato and Shimokita peninsula loops",
    },
    footer: {
      copyright: "© Mount Kamifuse Ski Area (Mutsu City)",
      location: "44-5 Okawamori, Ominato, Mutsu, Aomori 035-0096",
    },
  };
}

function deepMerge(a, b) {
  if (!b) return a;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object") {
      out[k] = deepMerge(a[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function replaceBieiStrings(obj) {
  const s = JSON.stringify(obj)
    .replace(/美瑛町民スキー場/g, "釜臥山スキー場")
    .replace(/美瑛 LP/g, "釜臥山 LP")
    .replace(/美瑛町/g, "むつ市")
    .replace(/美瑛/g, "釜臥山")
    .replace(/Biei Town Ski Area/g, "Mount Kamifuse Ski Area")
    .replace(/Biei LP/g, "Kamifuse LP")
    .replace(/Biei/g, "Kamifuse")
    .replace(/青い池/g, "光のアゲハチョウ")
    .replace(/Blue Pond/g, "Agehacho night view")
    .replace(/Shirogane Blue Pond/g, "Mutsu Agehacho")
    .replace(/#BieiWinterAesthetic/g, "#KamifuseSki")
    .replace(/#SnowGlobeVillage/g, "#MutsuBayView")
    .replace(/#WinterWellnessHokkaido/g, "#ShimokitaWinter")
    .replace(/#BluePondBiei/g, "#KamifuseSki")
    .replace(/#ShiroganeBluePond/g, "#MutsuBayView")
    .replace(/lp-mock-biei/g, "lp-mock-kamifuse")
    .replace(/resort=biei/g, "resort=kamifuse")
    .replace(/data-mock-resort=\\"biei\\"/g, 'data-mock-resort=\\"kamifuse\\"');
  return JSON.parse(s);
}

const jaBase = replaceBieiStrings(JSON.parse(readFileSync(join(BIEI, "messages/ja.json"), "utf8")));
const enBase = replaceBieiStrings(JSON.parse(readFileSync(join(BIEI, "messages/en.json"), "utf8")));

writeFileSync(join(LP, "messages/ja.json"), JSON.stringify(deepMerge(jaBase, patchJa(jaBase)), null, 2) + "\n", "utf8");
writeFileSync(join(LP, "messages/en.json"), JSON.stringify(deepMerge(enBase, patchEn(enBase)), null, 2) + "\n", "utf8");

// HTML + subpages bulk replace
for (const file of readdirSync(LP)) {
  const fp = join(LP, file);
  if (!statSync(fp).isFile() || !/\.(html|css|md)$/i.test(file)) continue;
  let html = readFileSync(fp, "utf8");
  html = html
    .replace(/data-mock-resort="biei"/g, 'data-mock-resort="kamifuse"')
    .replace(/resort=biei/g, "resort=kamifuse")
    .replace(/lp-mock-biei/g, "lp-mock-kamifuse")
    .replace(/美瑛町民スキー場/g, "釜臥山スキー場")
    .replace(/美瑛町民<br \/>スキー場/g, "釜臥山<br />スキー場")
    .replace(/Biei Town Ski Area/g, "Mount Kamifuse Ski Area")
    .replace(/blue-pond\.html/g, "night-view.html")
    .replace(/snow-play\.html/g, "cafe-view.html");
  writeFileSync(fp, html, "utf8");
}

console.log("✓ kamifuse messages + HTML patched");
