#!/usr/bin/env node
/**
 * Wire Skyticket rentacar affiliate blocks into mock LP index.html + messages.
 * Usage: node docs/mock-assets/scripts/apply-rentacar-affiliate.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "../..");

const AFFILIATE_BLOCK = `            <div class="access-affiliate" data-skyticket-rentacar-block>
              <p class="access-affiliate__eyebrow" data-i18n="access.rentacarEyebrow">RENTACAR_EYEBROW</p>
              <a
                href="#"
                class="access-affiliate__link"
                data-skyticket-rentacar-link
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                <img
                  src=""
                  alt=""
                  width="0"
                  height="1"
                  class="access-affiliate__pixel"
                  data-skyticket-rentacar-pixel
                  aria-hidden="true"
                />
                <span data-i18n="access.rentacarLink">RENTACAR_LINK</span>
              </a>
              <p class="access-affiliate__note" data-i18n="access.rentacarNote">RENTACAR_NOTE</p>
              <p class="access-affiliate__hint" data-i18n="access.rentacarHint">RENTACAR_HINT</p>
            </div>`;

const RESORT_COPY = {
  sichinohe: {
    rentacar: "shichinohetowada_station",
    ja: {
      rentacarEyebrow: "新幹線＋レンタカー",
      rentacarLink: "七戸十和田駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "十和田湖・八甲田・七戸周遊向け",
    },
    en: {
      rentacarEyebrow: "Shinkansen + rental car",
      rentacarLink: "Book a rental car at Shichinohe-Towada Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Towada Lake, Hakkoda, and Shichinohe loops",
    },
  },
  biei: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "富良野・美瑛周遊",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "美瑛・白金・層雲峡方面のドライブ向け",
    },
    en: {
      rentacarEyebrow: "Furano · Biei touring",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Biei, Shirogane, and Sounkyo drives",
    },
  },
  unabetsu: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "知床圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "斜里・知床方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Shiretoko gateway",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shari and Shiretoko drives",
    },
  },
  kiyosato: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "知床圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "緑駅・知床サロマ方面へ",
    },
    en: {
      rentacarEyebrow: "Shiretoko gateway",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Midori Station and Shiretoko–Saroma routes",
    },
  },
  gokazan: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "オホーツク圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "サロマ湖・遠軽・湧別周遊向け",
    },
    en: {
      rentacarEyebrow: "Okhotsk region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Lake Saroma, Engaru, and Yubetsu loops",
    },
  },
  tsunan: {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "雪国ドライブ",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "越後田中・湯沢方面の雪国周遊向け",
    },
    en: {
      rentacarEyebrow: "Snow-country drive",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Echigo-Tanaka and Yuzawa snow routes",
    },
  },
  "minami-furano": {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "十勝・富良野圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "かなやま湖・富良野方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Tokachi · Furano",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Lake Kanayama and Furano drives",
    },
  },
  asahigaoka: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "ニセコ圏",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "倶知安・ニセコ・小樽周遊向け",
    },
    en: {
      rentacarEyebrow: "Niseko gateway",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kutchan, Niseko, and Otaru loops",
    },
  },
  otoifuji: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "宗谷圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "音威子府・北見方面のロングドライブ向け",
    },
    en: {
      rentacarEyebrow: "Soya region",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Otoineppu and Kitami long drives",
    },
  },
  shimukappu: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "道央アクセス",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "占冠・トマム・富良野周遊向け",
    },
    en: {
      rentacarEyebrow: "Central Hokkaido",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shimukappu, Tomamu, and Furano routes",
    },
  },
  "abashiri-lv": {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "網走圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "網走・阿寒・知床方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Abashiri region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Abashiri, Akan, and Shiretoko drives",
    },
  },
  "sapporo-teine": {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "札幌圏",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "手稲・札幌市内・小樽周遊向け",
    },
    en: {
      rentacarEyebrow: "Sapporo gateway",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Teine, downtown Sapporo, and Otaru loops",
    },
  },
  pippu: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "上川・旭川圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "比布・旭川市内周遊向け",
    },
    en: {
      rentacarEyebrow: "Kamikawa · Asahikawa",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Pippu and Asahikawa city loops",
    },
  },
  "sapporo-kokusai": {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "札幌圏",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "定山渓・小樽・札幌国際周遊向け",
    },
    en: {
      rentacarEyebrow: "Sapporo gateway",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kokusai, Jozankei, and Otaru routes",
    },
  },
  "kamikawa-nakayama": {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "上川・層雲峡圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "層雲峡・上川町内周遊向け",
    },
    en: {
      rentacarEyebrow: "Kamikawa · Sounkyo",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Sounkyo and Kamikawa town loops",
    },
  },
  kirigamine: {
    rentacar: "kamisuwa_kirigamine_kogen",
    ja: {
      rentacarEyebrow: "諏訪・中央道圏",
      rentacarLink: "諏訪IC周辺でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "霧ヶ峰線・冬期通行規制に注意",
    },
    en: {
      rentacarEyebrow: "Suwa · Chuo Expressway",
      rentacarLink: "Rent a car near Suwa IC",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "Watch winter closures on Kirigamine road",
    },
  },
  shinjo: {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "新幹線＋レンタカー",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "最上・肘折温泉・スキー場周遊向け",
    },
    en: {
      rentacarEyebrow: "Shinkansen + rental car",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Mogami, Tsuruoka Onsen, and ski-hill loops",
    },
  },
  hinode: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "富良野・旭川圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "富良野・美瑛・十勝岳方面の周遊向け",
    },
    en: {
      rentacarEyebrow: "Furano · Asahikawa",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Furano, Biei, and Tokachi peak drives",
    },
  },
  takaho: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "新千歳＋レンタカー",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "恵庭・沼田・ほろしん温泉周遊向け",
    },
    en: {
      rentacarEyebrow: "New Chitose + rental car",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Eniwa, Numata, and Horoshin Onsen loops",
    },
  },
  "koshi-kogen": {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "新幹線＋レンタカー",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "長岡・山古志・蓬平温泉周遊向け",
    },
    en: {
      rentacarEyebrow: "Shinkansen + rental car",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Nagaoka, Yamakoshi, and Yomogi-hira Onsen",
    },
  },
  nishikawa: {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "山形・最上圏",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "西川IC・月山・山形市内周遊向け",
    },
    en: {
      rentacarEyebrow: "Yamagata · Mogami",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Nishikawa IC, Mt. Gassan, and Yamagata city loops",
    },
  },
  utoro: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "知床圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "斜里・知床・ウトロ周遊向け",
    },
    en: {
      rentacarEyebrow: "Shiretoko gateway",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shari, Shiretoko, and Utoro loops",
    },
  },
  "shintoku-yama": {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "十勝・道東",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "トマム・帯広・新得周遊向け",
    },
    en: {
      rentacarEyebrow: "Tokachi · Doto",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Tomamu, Obihiro, and Shintoku drives",
    },
  },
  tayama: {
    rentacar: "morioka_station",
    ja: {
      rentacarEyebrow: "岩手・八幡平",
      rentacarLink: "盛岡駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "安比・八幡平・田山周遊向け",
    },
    en: {
      rentacarEyebrow: "Iwate · Hachimantai",
      rentacarLink: "Book a rental car at Morioka Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Appi, Hachimantai, and Tayama drives",
    },
  },
  tomioka: {
    rentacar: "hakodate_onuma_matsumae",
    ja: {
      rentacarEyebrow: "道南・函館圏",
      rentacarLink: "函館空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "乙部・厚沢部・函館周遊向け",
    },
    en: {
      rentacarEyebrow: "Southern Hokkaido · Hakodate",
      rentacarLink: "Book a rental car at Hakodate Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Otobe, Atsushibe, and Hakodate drives",
    },
  },
  sanokura: {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "会津・喜多方",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "喜多方・猪苗代・会津若松周遊向け",
    },
    en: {
      rentacarEyebrow: "Aizu · Kitakata",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kitakata, Inawashiro, and Aizu-Wakamatsu drives",
    },
  },
  niwa: {
    rentacar: "hakodate_onuma_matsumae",
    ja: {
      rentacarEyebrow: "道南·檜山",
      rentacarLink: "函館空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "北檜山·大成·函館周遊向け",
    },
    en: {
      rentacarEyebrow: "Southern Hokkaido · Hakodate",
      rentacarLink: "Book a rental car at Hakodate Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kitahiyama, Taisei, and Hakodate drives",
    },
  },
  "sado-taira": {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "佐渡・新潟圏",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "両津港フェリー連携・島内周遊向け",
    },
    en: {
      rentacarEyebrow: "Sado · Niigata gateway",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ryotsu ferry link and island drives",
    },
  },
  "monbetsu-ooyama": {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "オホーツク圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "紋別・網走・流氷観光周遊向け",
    },
    en: {
      rentacarEyebrow: "Okhotsk region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Mombetsu, Abashiri, and drift-ice touring",
    },
  },
  katsurasawa: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "新千歳＋レンタカー",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "札幌・三笠・桂沢湖周遊向け",
    },
    en: {
      rentacarEyebrow: "New Chitose + rental car",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Sapporo, Mikasa, and Lake Katsurazawa loops",
    },
  },
  horaguchi: {
    rentacar: "kansai_international_airport",
    ja: {
      rentacarEyebrow: "関西発",
      rentacarLink: "関西空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "大阪·奈良·吉野山周遊向け",
    },
    en: {
      rentacarEyebrow: "From Kansai",
      rentacarLink: "Book a rental car at Kansai Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Osaka, Nara, and Yoshino drives",
    },
  },
  kamifuse: {
    rentacar: "shichinohetowada_station",
    ja: {
      rentacarEyebrow: "下北・青森圏",
      rentacarLink: "七戸十和田駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "大湊・下北半島周遊向け",
    },
    en: {
      rentacarEyebrow: "Shimokita · Aomori",
      rentacarLink: "Book a rental car at Shichinohe-Towada Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ominato and Shimokita peninsula loops",
    },
  },
  "hijiri-kogen": {
    rentacar: "kamisuwa_kirigamine_kogen",
    ja: {
      rentacarEyebrow: "長野・松本圏",
      rentacarLink: "松本駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "麻績IC・白馬・志賀周遊向け",
    },
    en: {
      rentacarEyebrow: "Nagano · Matsumoto",
      rentacarLink: "Book a rental car at Matsumoto Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Omachi IC, Hakuba, and Shiga drives",
    },
  },
  kamoenokuni: {
    rentacar: "hakodate_onuma_matsumae",
    ja: {
      rentacarEyebrow: "道南・檜山",
      rentacarLink: "函館空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "上ノ国・湯ノ岱周遊向け",
    },
    en: {
      rentacarEyebrow: "Southern Hokkaido · Hiyama",
      rentacarLink: "Book a rental car at Hakodate Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kaminokuni and Yunotai loops",
    },
  },
  yunodai: {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "新幹線＋レンタカー",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "肘折温泉・湯の台周遊向け",
    },
    en: {
      rentacarEyebrow: "Shinkansen + rental car",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Hijiori Onsen and Yunodai loops",
    },
  },
  matsushiro: {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "新潟圏ドライブ",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "まつだい・松之山・越後妻有周遊向け",
    },
    en: {
      rentacarEyebrow: "Niigata region drive",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Matsudai, Matsunoyama, and Echigo-Tsumari loops",
    },
  },
  iouzan: {
    rentacar: "komatsu_airport_kanazawa",
    ja: {
      rentacarEyebrow: "金沢観光圏",
      rentacarLink: "小松空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "金沢市街・湯涌温泉周遊向け",
    },
    en: {
      rentacarEyebrow: "Kanazawa gateway",
      rentacarLink: "Book a rental car at Komatsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kanazawa city and Yuwa Onsen loops",
    },
  },
  hirogawara: {
    rentacar: "kansai_international_airport",
    ja: {
      rentacarEyebrow: "関西発",
      rentacarLink: "関西空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "京都·鞍馬·貴船周遊向け",
    },
    en: {
      rentacarEyebrow: "From Kansai",
      rentacarLink: "Book a rental car at Kansai Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kyoto, Kurama, and Kibune loops",
    },
  },
  "nanao-korosa": {
    rentacar: "komatsu_airport_kanazawa",
    ja: {
      rentacarEyebrow: "北陸·能登圏",
      rentacarLink: "小松空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "七尾·和倉温泉·能登周遊向け",
    },
    en: {
      rentacarEyebrow: "Hokuriku · Noto",
      rentacarLink: "Book a rental car at Komatsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Nanao, Wakura Onsen, and Noto drives",
    },
  },
  wakamatsu: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "オホーツク圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "北見・網走・オホーツク周遊向け",
    },
    en: {
      rentacarEyebrow: "Okhotsk region",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kitami, Abashiri, and Okhotsk loops",
    },
  },
  banjoga: {
    rentacar: "kamisuwa_kirigamine_kogen",
    ja: {
      rentacarEyebrow: "長野・上田圏",
      rentacarLink: "上諏訪・霧ヶ峰でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "上田・菅平・美ヶ原周遊向け",
    },
    en: {
      rentacarEyebrow: "Nagano · Ueda region",
      rentacarLink: "Book a rental car at Kamisuwa · Kirigamine",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ueda, Sugadaira, and Utsukushigahara loops",
    },
  },
  abirayama: {
    rentacar: "chitose_international_airport",
    ja: {
      rentacarEyebrow: "新千歳＋レンタカー",
      rentacarLink: "新千歳空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "安平・苫小牧・空港前後の雪遊び向け",
    },
    en: {
      rentacarEyebrow: "New Chitose + rental car",
      rentacarLink: "Book a rental car at New Chitose Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Abira, Tomakomai, and pre/post-flight snow loops",
    },
  },
  "tono-akabane": {
    rentacar: "morioka_station",
    ja: {
      rentacarEyebrow: "岩手・遠野圏",
      rentacarLink: "盛岡駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "遠野・釜石・花巻周遊向け",
    },
    en: {
      rentacarEyebrow: "Iwate · Tono region",
      rentacarLink: "Book a rental car at Morioka Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Tono, Kamaishi, and Hanamaki loops",
    },
  },
  toshigamine: {
    rentacar: "yamaguchi_ube_airport",
    ja: {
      rentacarEyebrow: "中国・山口圏",
      rentacarLink: "山口宇部空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "阿東・津和野周遊向け",
    },
    en: {
      rentacarEyebrow: "Chugoku · Yamaguchi",
      rentacarLink: "Book a rental car at Yamaguchi Ube Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ato and Tsuwano loops",
    },
  },
  hirogawara: {
    rentacar: "kansai_international_airport",
    ja: {
      rentacarEyebrow: "京都·洛北圏",
      rentacarLink: "関西空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "京都市内·鞍馬·貴船周遊向け",
    },
    en: {
      rentacarEyebrow: "Kyoto · Rakuhoku",
      rentacarLink: "Book a rental car at Kansai Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kyoto city, Kurama, and Kibune loops",
    },
  },
  "nanao-korosa": {
    rentacar: "komatsu_airport_kanazawa",
    ja: {
      rentacarEyebrow: "能登·北陸圏",
      rentacarLink: "小松空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "七尾·能登半島周遊向け",
    },
    en: {
      rentacarEyebrow: "Noto · Hokuriku",
      rentacarLink: "Book a rental car at Komatsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Nanao and Noto Peninsula loops",
    },
  },
  bifuka: {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "旭川空港圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "名寄·士別·美深周遊向け",
    },
    en: {
      rentacarEyebrow: "Asahikawa Airport area",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Nayoro, Shibetsu, and Bifuka loops",
    },
  },
  koyasan: {
    rentacar: "kansai_international_airport",
    ja: {
      rentacarEyebrow: "関西·高野山圏",
      rentacarLink: "関西空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "高野山·橋本·和歌山周遊向け",
    },
    en: {
      rentacarEyebrow: "Kansai · Koyasan",
      rentacarLink: "Book a rental car at Kansai Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Koyasan, Hashimoto, and Wakayama loops",
    },
  },
  kyowa: {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "秋田·大仙圏",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "大仙·協和·秋田市圏周遊向け",
    },
    en: {
      rentacarEyebrow: "Akita · Daisen",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Daisen, Kyowa, and Akita city loops",
    },
  },
  "ringo-kyowagoku": {
    rentacar: "yamaguchi_ube_airport",
    ja: {
      rentacarEyebrow: "中国山地圏",
      rentacarLink: "山口宇部空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "庄原·三次周遊向け",
    },
    en: {
      rentacarEyebrow: "Chugoku Mountains",
      rentacarLink: "Book a rental car at Yamaguchi Ube Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shobara and Miyoshi loops",
    },
  },
  "chateau-shiozawa": {
    rentacar: "niigata_airport",
    ja: {
      rentacarEyebrow: "湯沢·南魚沼圏",
      rentacarLink: "新潟空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "塩沢·六日町·湯沢周遊向け",
    },
    en: {
      rentacarEyebrow: "Yuzawa · Minami-Uonuma",
      rentacarLink: "Book a rental car at Niigata Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Shiozawa, Muikamachi, and Yuzawa loops",
    },
  },
  "morioka-ikari": {
    rentacar: "morioka_station",
    ja: {
      rentacarEyebrow: "岩手·盛岡圏",
      rentacarLink: "盛岡駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "盛岡市街·雫石周遊向け",
    },
    en: {
      rentacarEyebrow: "Iwate · Morioka",
      rentacarLink: "Book a rental car at Morioka Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Morioka city and Shizukuishi loops",
    },
  },
  kaneyama: {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "奥会津·只見圏",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "金山町·只見線周遊向け",
    },
    en: {
      rentacarEyebrow: "Oku-Aizu · Tadami",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kaneyama and Tadami Line loops",
    },
  },
  "toma-choei": {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "旭川·当麻圏",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "旭山動物園·当麻·層雲峡周遊向け",
    },
    en: {
      rentacarEyebrow: "Asahikawa · Toma",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Asahiyama Zoo, Toma, and Sounkyo drives",
    },
  },
  "ueno-no": {
    rentacar: "morioka_station",
    ja: {
      rentacarEyebrow: "盛岡·鳴子圏",
      rentacarLink: "盛岡駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "鳴子温泉·大崎市周遊向け",
    },
    en: {
      rentacarEyebrow: "Morioka · Naruko",
      rentacarLink: "Book a rental car at Morioka Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Naruko Onsen and Osaki drives",
    },
  },
  "nishiwaigawa-yuda": {
    rentacar: "morioka_station",
    ja: {
      rentacarEyebrow: "北上線＋レンタカー",
      rentacarLink: "盛岡駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "湯田温泉峡·夏油高原周遊向け",
    },
    en: {
      rentacarEyebrow: "Kitakami Line + rental car",
      rentacarLink: "Book a rental car at Morioka Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Yuda Onsenkyo and regional loops",
    },
  },
  "nakafuranokita-hoshi": {
    rentacar: "asahikawa_airport",
    ja: {
      rentacarEyebrow: "旭川空港＋レンタカー",
      rentacarLink: "旭川空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "富良野·美瑛·層雲峡周遊向け",
    },
    en: {
      rentacarEyebrow: "Asahikawa Airport + rental car",
      rentacarLink: "Book a rental car at Asahikawa Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Furano, Biei, and Sounkyo drives",
    },
  },
  "hanakasa-kogen": {
    rentacar: "shinjo_station",
    ja: {
      rentacarEyebrow: "山形·銀山圏",
      rentacarLink: "新庄駅でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "銀山温泉·尾花沢·蔵王周遊向け",
    },
    en: {
      rentacarEyebrow: "Yamagata · Ginzan",
      rentacarLink: "Book a rental car at Shinjo Station",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Ginzan, Obanazawa, and Zao drives",
    },
  },
  wakamatsu: {
    rentacar: "memanbetsu_airport",
    ja: {
      rentacarEyebrow: "北見·網走圏",
      rentacarLink: "女満別空港でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "北見市街·オホーツク周遊向け",
    },
    en: {
      rentacarEyebrow: "Kitami · Abashiri",
      rentacarLink: "Book a rental car at Memanbetsu Airport",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Kitami city and Okhotsk loops",
    },
  },
  banjoga: {
    rentacar: "kamisuwa_kirigamine_kogen",
    ja: {
      rentacarEyebrow: "上田·菅平圏",
      rentacarLink: "上諏訪·霧ヶ峰でレンタカー予約",
      rentacarNote: "スカイチケット（外部サイト）",
      rentacarHint: "菅平高原·上田周遊向け",
    },
    en: {
      rentacarEyebrow: "Ueda · Sugadaira",
      rentacarLink: "Book a rental car at Kamisuwa · Kirigamine",
      rentacarNote: "Skyticket (external site)",
      rentacarHint: "For Sugadaira and Ueda loops",
    },
  },
  "shibetsu-kaneyama": {
    rentacar: "memanbetsu_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "akagiyama": {
    rentacar: "takasaki_station",
    ja: {
          "rentacarEyebrow": "高崎駅＋レンタカー",
          "rentacarLink": "高崎駅でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "赤城山・前橋周遊向け"
    },
    en: {
          "rentacarEyebrow": "Takasaki Station + rental car",
          "rentacarLink": "Book a rental car at Takasaki Station",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Mt. Akagi and Maebashi loops"
    },
  },
  "wassamu-higashiyama": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "oketo-minamigaoka": {
    rentacar: "memanbetsu_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "socchidake": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "taikozan": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "taisei": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "shinbo-family": {
    rentacar: "komatsu_airport_kanazawa",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "fuyutorigoe": {
    rentacar: "niigata_airport",
    ja: {
          "rentacarEyebrow": "新潟空港＋レンタカー",
          "rentacarLink": "新潟空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "新潟県内周遊向け"
    },
    en: {
          "rentacarEyebrow": "Niigata Airport + rental car",
          "rentacarLink": "Book a rental car at Niigata Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Niigata prefecture drives"
    },
  },
  "hakugindai": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "takayanagi-garuru": {
    rentacar: "niigata_airport",
    ja: {
          "rentacarEyebrow": "新潟空港＋レンタカー",
          "rentacarLink": "新潟空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "新潟県内周遊向け"
    },
    en: {
          "rentacarEyebrow": "Niigata Airport + rental car",
          "rentacarLink": "Book a rental car at Niigata Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Niigata prefecture drives"
    },
  },
  "kunimidaira": {
    rentacar: "morioka_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "mikawa-onsen": {
    rentacar: "niigata_airport",
    ja: {
          "rentacarEyebrow": "新潟空港＋レンタカー",
          "rentacarLink": "新潟空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "新潟県内周遊向け"
    },
    en: {
          "rentacarEyebrow": "Niigata Airport + rental car",
          "rentacarLink": "Book a rental car at Niigata Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Niigata prefecture drives"
    },
  },
  "bibai-kokusetsu": {
    rentacar: "chitose_international_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "inosawa-shimin": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "yakushiyama": {
    rentacar: "shinjo_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "tenkamori": {
    rentacar: "shinjo_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "inagawa": {
    rentacar: "shinjo_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "gosannen": {
    rentacar: "shinjo_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "soyujima-229": {
    rentacar: "shichinohetowada_station",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "takinoue-sakuragaoka": {
    rentacar: "memanbetsu_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "shimokawa": {
    rentacar: "asahikawa_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "根室・標津・網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Nemuro, Shibetsu, and Abashiri drives"
    },
  },
  "shizenkoen-swiss": {
    rentacar: "kansai_international_airport",
    ja: {
          "rentacarEyebrow": "関西空港＋レンタカー",
          "rentacarLink": "関西空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "京都·丹後周遊向け"
    },
    en: {
          "rentacarEyebrow": "Kansai Airport + rental car",
          "rentacarLink": "Book a rental car at Kansai Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Kyoto and Tango drives"
    },
  },
  "muroran-danpara": {
    rentacar: "chitose_international_airport",
    ja: {
          "rentacarEyebrow": "新千歳空港＋レンタカー",
          "rentacarLink": "新千歳空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "道央·道南周遊向け"
    },
    en: {
          "rentacarEyebrow": "New Chitose Airport + rental car",
          "rentacarLink": "Book a rental car at New Chitose Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For central and southern Hokkaido drives"
    },
  },
  "akenogaoka": {
    rentacar: "chitose_international_airport",
    ja: {
          "rentacarEyebrow": "新千歳空港＋レンタカー",
          "rentacarLink": "新千歳空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "道央·道南周遊向け"
    },
    en: {
          "rentacarEyebrow": "New Chitose Airport + rental car",
          "rentacarLink": "Book a rental car at New Chitose Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For central and southern Hokkaido drives"
    },
  },
  "rubeshibe-happodai": {
    rentacar: "memanbetsu_airport",
    ja: {
          "rentacarEyebrow": "女満別空港＋レンタカー",
          "rentacarLink": "女満別空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "オホーツク·網走周遊向け"
    },
    en: {
          "rentacarEyebrow": "Memanbetsu Airport + rental car",
          "rentacarLink": "Book a rental car at Memanbetsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Okhotsk and Abashiri drives"
    },
  },
  "usazawa": {
    rentacar: "morioka_station",
    ja: {
          "rentacarEyebrow": "盛岡駅＋レンタカー",
          "rentacarLink": "盛岡駅でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "岩手·秋田周遊向け"
    },
    en: {
          "rentacarEyebrow": "Morioka Station + rental car",
          "rentacarLink": "Book a rental car at Morioka Station",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Iwate and Akita drives"
    },
  },
  "ohotakedake": {
    rentacar: "shichinohetowada_station",
    ja: {
          "rentacarEyebrow": "七戸十和田駅＋レンタカー",
          "rentacarLink": "七戸十和田駅でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "青森南部·十和田周遊向け"
    },
    en: {
          "rentacarEyebrow": "Shichinohe-Towada Station + rental car",
          "rentacarLink": "Book a rental car at Shichinohe-Towada Station",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For southern Aomori and Towada drives"
    },
  },
  "akiyama": {
    rentacar: "shinjo_station",
    ja: {
          "rentacarEyebrow": "新庄駅＋レンタカー",
          "rentacarLink": "新庄駅でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "山形·最上周遊向け"
    },
    en: {
          "rentacarEyebrow": "Shinjo Station + rental car",
          "rentacarLink": "Book a rental car at Shinjo Station",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Yamagata and Mogami drives"
    },
  },
  "kujuo": {
    rentacar: "komatsu_airport_kanazawa",
    ja: {
          "rentacarEyebrow": "小松空港＋レンタカー",
          "rentacarLink": "小松空港でレンタカー予約",
          "rentacarNote": "スカイチケット（外部サイト）",
          "rentacarHint": "北陸·福井周遊向け"
    },
    en: {
          "rentacarEyebrow": "Komatsu Airport + rental car",
          "rentacarLink": "Book a rental car at Komatsu Airport",
          "rentacarNote": "Skyticket (external site)",
          "rentacarHint": "For Hokuriku and Fukui drives"
    },
  },
};

const NEW_DESTINATIONS = {
  asahikawa_airport: {
    url: "https://skyticket.jp/rentacar/hokkaido/asahikawa_airport/",
    label: { ja: "旭川空港", en: "Asahikawa Airport" },
  },
  memanbetsu_airport: {
    url: "https://skyticket.jp/rentacar/hokkaido/memanbetsu_airport/",
    label: { ja: "女満別空港", en: "Memanbetsu Airport" },
  },
  niigata_airport: {
    url: "https://skyticket.jp/rentacar/koushinetsu/niigata/niigata_airport/",
    label: { ja: "新潟空港", en: "Niigata Airport" },
  },
  kamisuwa_kirigamine_kogen: {
    url: "https://skyticket.jp/rentacar/koushinetsu/nagano/kamisuwa_shimosuwa_okaya_kirigamine_utsukusigahara_kogen/",
    label: { ja: "上諏訪・霧ヶ峰", en: "Kamisuwa · Kirigamine" },
  },
  shinjo_station: {
    url: "https://skyticket.jp/rentacar/tohoku/yamagata/shinjo_station/",
    label: { ja: "新庄駅", en: "Shinjo Station" },
  },
  morioka_station: {
    url: "https://skyticket.jp/rentacar/tohoku/iwate/morioka_station/",
    label: { ja: "盛岡駅", en: "Morioka Station" },
  takasaki_station: {
    url: "https://skyticket.jp/rentacar/kanto/gunma/takasaki_station/",
    label: { ja: "高崎駅", en: "Takasaki Station" },
  },
  },
    hakodate_onuma_matsumae: {
      url: "https://skyticket.jp/rentacar/hokkaido/hakodate_onuma_matsumae/",
      label: { ja: "函館・大沼・松前", en: "Hakodate · Onuma · Matsumae" },
    },
    kansai_international_airport: {
      url: "https://skyticket.jp/rentacar/kansai/kansai_international_airport/",
      label: { ja: "関西空港", en: "Kansai Airport" },
    },
    komatsu_airport_kanazawa: {
      url: "https://skyticket.jp/rentacar/hokuriku/ishikawa/komatsu_airport_kanazawa_airport/",
      label: { ja: "小松空港", en: "Komatsu Airport" },
    },
    yamaguchi_ube_airport: {
      url: "https://skyticket.jp/rentacar/chugoku/yamaguchi/yamaguchi_ube_airport/",
      label: { ja: "山口宇部空港", en: "Yamaguchi Ube Airport" },
    },
};

function patchIndexHtml(html, copy) {
  if (html.includes("data-skyticket-rentacar-block")) return html;

  if (!html.includes("affiliates/rentacar-link.css")) {
    html = html.replace(
      '<link rel="stylesheet" href="../_shared/mock-i18n.css" />',
      '<link rel="stylesheet" href="../_shared/mock-i18n.css" />\n  <link rel="stylesheet" href="../_shared/affiliates/rentacar-link.css" />',
    );
  }

  const block = AFFILIATE_BLOCK.replace("RENTACAR_EYEBROW", copy.ja.rentacarEyebrow)
    .replace("RENTACAR_LINK", copy.ja.rentacarLink)
    .replace("RENTACAR_NOTE", copy.ja.rentacarNote)
    .replace("RENTACAR_HINT", copy.ja.rentacarHint);

  const patched = html.replace(
    /(<div class="access-actions">[\s\S]*?<a href="tel:[^"]+" class="btn btn-ghost" data-i18n="common\.call">[\s\S]*?<\/a>)\s*(\n\s*<\/div>)/,
    `$1\n${block}$2`,
  );
  if (patched === html) {
    throw new Error("access-actions phone anchor not found");
  }
  html = patched;

  if (!html.includes("skyticket-rentacar.js")) {
    html = html.replace(
      '<script src="../_shared/mock-i18n.js"></script>',
      '<script src="../_shared/affiliates/skyticket-rentacar.js"></script>\n  <script src="../_shared/mock-i18n.js"></script>',
    );
  }
  return html;
}

function patchMessages(json, copy, locale) {
  const c = copy[locale];
  json.access = {
    ...json.access,
    rentacarEyebrow: c.rentacarEyebrow,
    rentacarLink: c.rentacarLink,
    rentacarNote: c.rentacarNote,
    rentacarHint: c.rentacarHint,
  };
  return json;
}

function patchConfig(config) {
  config.destinations = { ...config.destinations, ...NEW_DESTINATIONS };
  return config;
}

function patchRegistry(registry) {
  for (const resort of registry.resorts) {
    const copy = RESORT_COPY[resort.id];
    if (!copy) continue;
    resort.affiliates = { rentacar: copy.rentacar };
  }
  return registry;
}

const slugById = Object.fromEntries(
  readdirSync(root)
    .filter((n) => n.endsWith("-lp"))
    .map((slug) => {
      const html = readFileSync(join(root, slug, "index.html"), "utf8");
      const m = html.match(/data-mock-resort="([^"]+)"/);
      return [m?.[1], slug];
    })
    .filter(([id]) => id && RESORT_COPY[id]),
);

for (const [id, slug] of Object.entries(slugById)) {
  const copy = RESORT_COPY[id];
  const indexPath = join(root, slug, "index.html");
  const html = readFileSync(indexPath, "utf8");
  writeFileSync(indexPath, patchIndexHtml(html, copy), "utf8");

  for (const locale of ["ja", "en"]) {
    const msgPath = join(root, slug, "messages", `${locale}.json`);
    const json = JSON.parse(readFileSync(msgPath, "utf8"));
    writeFileSync(
      msgPath,
      `${JSON.stringify(patchMessages(json, copy, locale), null, 2)}\n`,
      "utf8",
    );
  }
  console.log(`✓ ${slug} (${id} → ${copy.rentacar})`);
}

const configPaths = [
  join(root, "_shared/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "configs/affiliates/skyticket-rentacar.json"),
  join(repoRoot, "resorts/Sichinohe-CyoueiSki/web/data/affiliates/skyticket-rentacar.json"),
];
for (const path of configPaths) {
  const config = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, `${JSON.stringify(patchConfig(config), null, 2)}\n`, "utf8");
}
console.log("✓ skyticket-rentacar.json destinations updated");

const registryPath = join(root, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
writeFileSync(registryPath, `${JSON.stringify(patchRegistry(registry), null, 2)}\n`, "utf8");
console.log("✓ registry.json affiliates updated");
