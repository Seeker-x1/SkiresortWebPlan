/**
 * Generate schematic map JSON for all mock LP resorts.
 * Paths are topological schematics — NOT georeferenced (see disclaimer).
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "maps");

const DISCLAIMER = {
  ja: "コース・リフトはイラスト内に描画済み。リストで運行状況を確認できます（概略図・現地表示優先）。",
  en: "Trails and lifts are drawn in the illustration. Use the list for status (schematic; on-site signage prevails).",
};

function mapBase(id, name, sources, features) {
  return {
    schemaVersion: "2026-06-13",
    id,
    name,
    disclaimer: DISCLAIMER,
    sources,
    updatedAt: "2026-06-13T12:00:00+09:00",
    viewBox: "0 0 1024 1024",
    hero: {
      src: `images/maps/${id}-hero.png`,
      width: 1024,
      height: 1024,
      viewBox: "0 0 1024 1024",
    },
    bakedLines: true,
    features: features.map((f) => {
      const { path, stations, ...rest } = f;
      return rest;
    }),
  };
}

function lift(id, label, shortLabel, path, stations, meta, status = "operating") {
  return {
    id,
    type: "lift",
    status,
    liftKind: id.includes("rope") || id.includes("tow") ? "surface" : id.includes("gondola") || id.includes("ropeway") ? "gondola" : "pair",
    label,
    shortLabel,
    path,
    stations,
    meta,
  };
}

function trail(id, label, shortLabel, difficulty, path, meta, status = "open") {
  return {
    id,
    type: "trail",
    status,
    difficulty,
    label,
    shortLabel,
    path,
    meta,
  };
}

const MAPS = [
  mapBase(
    "sichinohe",
    { ja: "七戸町営スキー場", en: "Sichinohe Town Ski Area" },
    ["公式パンフレット地図", "features.manifest.json", "Skimap.org参考"],
    [
      lift("lift-pair", { ja: "ペアリフト", en: "Pair lift" }, { ja: "ペア", en: "Pair" },
        "M 200 300 L 230 240 L 260 180 L 285 130", [[200, 300], [285, 130]],
        { ja: { 所要: "約4分", 区分: "メイン" }, en: { Duration: "~4 min", Zone: "Main" } }),
      lift("lift-pony", { ja: "ポニーリフト", en: "Pony lift" }, { ja: "ポニー", en: "Pony" },
        "M 340 280 L 370 220", [[340, 280], [370, 220]],
        { ja: { 区分: "初級エリア" }, en: { Zone: "Beginner area" } }),
      trail("trail-champion", { ja: "チャンピオン（上級）", en: "Champion (advanced)" }, { ja: "チャンピオン", en: "Champion" },
        "advanced", "M 285 125 L 300 150 L 320 200 L 310 260 L 295 300",
        { ja: { 距離: "約400m", 雪面: "非圧雪", 最大斜度: "35°（要確認）" }, en: { Distance: "~400 m", Surface: "Ungroomed", "Max slope": "35° (verify)" } }),
      trail("trail-upper", { ja: "上部エリア（中〜上級）", en: "Upper (inter–advanced)" }, { ja: "上部", en: "Upper" },
        "intermediate-advanced", "M 270 130 L 250 180 L 235 240 L 220 295",
        { ja: { 雪面: "圧雪/非圧雪" }, en: { Surface: "Groomed / ungroomed" } }),
      trail("trail-intermediate", { ja: "中斜面コース（中級）", en: "Intermediate slope" }, { ja: "中斜面", en: "Intermediate" },
        "intermediate", "M 275 135 L 290 200 L 300 280",
        { ja: { 特徴: "カービング向け" }, en: { Feature: "Carving" } }),
      trail("trail-forest", { ja: "林間周回（初級・コース4）", en: "Forest loop (beginner)" }, { ja: "林間", en: "Forest" },
        "beginner", "M 180 120 L 140 160 L 120 220 L 150 280 L 200 300 L 240 290",
        { ja: { 特徴: "森を周回" }, en: { Feature: "Forest perimeter" } }),
      trail("trail-pony", { ja: "ポニー周辺（初級）", en: "Pony area (beginner)" }, { ja: "初級", en: "Beginner" },
        "beginner", "M 365 225 L 350 280 L 330 310",
        { ja: { 雪面: "圧雪" }, en: { Surface: "Groomed" } }),
    ],
  ),

  mapBase("biei", { ja: "美瑛町民スキー場", en: "Biei Town Ski Area" },
    ["美瑛町公式", "上川郡スキー場一覧"],
    [
      lift("lift-rope", { ja: "ロープトゥ", en: "Rope tow" }, { ja: "ロープ", en: "Rope" },
        "M 240 300 L 240 140", [[240, 300], [240, 140]],
        { ja: { 料金: "無料" }, en: { Price: "Free" } }),
      trail("trail-main", { ja: "メイン斜面（初〜中級）", en: "Main slope (beginner–intermediate)" }, { ja: "メイン", en: "Main" },
        "intermediate", "M 220 145 L 200 220 L 190 300",
        { ja: { 特徴: "緩斜面・全面ボード可" }, en: { Feature: "Gentle · boards allowed" } }),
      trail("trail-sled", { ja: "そり遊びエリア", en: "Sled area" }, { ja: "そり", en: "Sled" },
        "sled", "M 300 280 L 340 300 L 360 310", { ja: { 備考: "ゲレンデ横" }, en: { Note: "Beside slope" } }),
    ],
  ),

  mapBase("unabetsu", { ja: "ウナベツスキー場", en: "Unabetsu Ski Area" },
    ["斜里町公式", "知床斜里町観光協会ブログ"],
    [
      lift("lift-pair", { ja: "ペアリフト", en: "Pair lift" }, { ja: "ペア", en: "Pair" },
        "M 240 305 L 240 95", [[240, 305], [240, 95]],
        { ja: { ナイター: "カラマツ・センター" }, en: { "Night skiing": "Karamatsu · Center" } }),
      trail("trail-salmon", { ja: "サーモンコース", en: "Salmon course" }, { ja: "サーモン", en: "Salmon" },
        "advanced", "M 195 100 L 175 200 L 165 305",
        { ja: { 最大斜度: "31°", ナイター: "不可" }, en: { "Max slope": "31°", "Night skiing": "No" } }),
      trail("trail-center", { ja: "センターコース", en: "Center course" }, { ja: "センター", en: "Center" },
        "intermediate-advanced", "M 248 98 L 265 200 L 275 300",
        { ja: { 最大斜度: "29°", ナイター: "可" }, en: { "Max slope": "29°", "Night skiing": "Yes" } }),
      trail("trail-karamatsu", { ja: "カラマツコース", en: "Karamatsu course" }, { ja: "カラマツ", en: "Karamatsu" },
        "intermediate", "M 290 105 L 310 200 L 325 305",
        { ja: { 最大斜度: "25°", ナイター: "可" }, en: { "Max slope": "25°", "Night skiing": "Yes" } }),
    ],
  ),

  mapBase("kiyosato", { ja: "清里町営緑スキー場", en: "Kiyosato Midori Ski Area" },
    ["清里町公式", "SURF&SNOW", "北海道索道協会"],
    [
      lift("lift-single", { ja: "1人乗りリフト", en: "Single chair" }, { ja: "リフト", en: "Lift" },
        "M 235 300 L 250 220 L 265 120", [[235, 300], [265, 120]],
        { ja: { 本数: "1基" }, en: { Count: "1 lift" } }),
      trail("trail-intermediate", { ja: "中級コース", en: "Intermediate course" }, { ja: "中級", en: "Inter." },
        "intermediate", "M 268 125 L 280 200 L 290 295",
        { ja: { 比率: "中級50%", 特徴: "リフト沿いメインバーン" }, en: { Share: "50% inter.", Feature: "Main piste" } }),
      trail("trail-advanced", { ja: "上級コース", en: "Advanced course" }, { ja: "上級", en: "Adv." },
        "advanced", "M 255 120 L 230 180 L 210 260 L 200 300",
        { ja: { 最大斜度: "30°超", 比率: "上級50%" }, en: { "Max slope": "30°+", Share: "50% advanced" } }),
      trail("trail-base", { ja: "山麓緩斜面（そり・練習）", en: "Base gentle (sled/practice)" }, { ja: "山麓", en: "Base" },
        "beginner", "M 180 300 L 220 310 L 300 315", { ja: { 備考: "リフト非接続初級" }, en: { Note: "No lift · practice" } }),
    ],
  ),

  mapBase("gokazan", { ja: "五鹿山スキー場", en: "Gokazan Ski Area" },
    ["湧別町・沢口産業", "LP戦略レポート"],
    [
      lift("lift-single", { ja: "シングルリフト", en: "Single lift" }, { ja: "シングル", en: "Single" },
        "M 245 305 L 255 200 L 265 110", [[245, 305], [265, 110]],
        { ja: { ナイター: "可" }, en: { "Night skiing": "Yes" } }),
      trail("trail-okhotsk", { ja: "オホーツクコース", en: "Okhotsk course" }, { ja: "オホーツク", en: "Okhotsk" },
        "advanced", "M 268 115 L 290 200 L 300 300",
        { ja: { 最大斜度: "31°", 特徴: "上級者79%" }, en: { "Max slope": "31°", Feature: "79% advanced" } }),
      trail("trail-a", { ja: "コースA", en: "Course A" }, { ja: "A", en: "A" },
        "intermediate", "M 255 118 L 240 220 L 230 295", { ja: { 備考: "4コース構成" }, en: { Note: "1 of 4 courses" } }),
      trail("trail-b", { ja: "コースB", en: "Course B" }, { ja: "B", en: "B" },
        "intermediate", "M 260 120 L 275 210 L 285 290", {}),
      trail("trail-c", { ja: "コースC", en: "Course C" }, { ja: "C", en: "C" },
        "beginner", "M 270 125 L 300 250 L 310 305", {}),
    ],
  ),

  mapBase("tsunan", { ja: "マウンテンパーク津南", en: "Mountain Park Tsunan" },
    ["津南町・パノラマ合同会社", "機能転換戦略レポート"],
    [
      trail("trail-xc-main", { ja: "クロスカントリーコース", en: "Cross-country course" }, { ja: "XC", en: "XC" },
        "nordic", "M 120 280 L 180 200 L 260 150 L 340 120 L 380 180 L 350 260 L 280 300 L 180 310 Z",
        { ja: { 備考: "一般アルペン滑走休止", 利用: "事前申込" }, en: { Note: "No alpine skiing", Use: "Reservation required" } }, "hold"),
      trail("trail-roller", { ja: "ローラースキーコース（夏季）", en: "Roller ski course (summer)" }, { ja: "ローラー", en: "Roller" },
        "nordic", "M 140 300 L 220 250 L 300 220 L 360 250", { ja: { 季節: "夏" }, en: { Season: "Summer" } }, "closed"),
    ],
  ),

  mapBase("minami-furano", { ja: "国設南ふらのスキー場", en: "Kokusetsu Minami-Furano Ski Area" },
    ["南富良野町公式", "振興公社"],
    [
      lift("lift-ropeway", { ja: "ロープウェイ", en: "Ropeway" }, { ja: "ロープウェイ", en: "Ropeway" },
        "M 200 310 L 210 250 L 220 180", [[200, 310], [220, 180]],
        { ja: { 状態: "運行中" }, en: { Status: "Operating" } }),
      lift("lift-1", { ja: "第1リフト", en: "Lift 1" }, { ja: "第1", en: "L1" },
        "M 250 300 L 265 200 L 275 130", [[250, 300], [275, 130]],
        { ja: { 状態: "運行中" }, en: { Status: "Operating" } }),
      lift("lift-2", { ja: "第2リフト", en: "Lift 2" }, { ja: "第2", en: "L2" },
        "M 290 295 L 300 180 L 305 110", [[290, 295], [305, 110]],
        { ja: { 状態: "2026シーズン運休", 標高差: "215mまで" }, en: { Status: "Closed 2026 season", Vertical: "To 215 m" } }, "stopped"),
      trail("trail-main", { ja: "メインコース群（5コース）", en: "Main courses (5)" }, { ja: "メイン", en: "Main" },
        "intermediate", "M 275 135 L 260 220 L 245 300",
        { ja: { 最長: "800m（第2まで）", 最大斜度: "35°" }, en: { Longest: "800 m (to L2)", "Max slope": "35°" } }),
      trail("trail-hike", { ja: "ハイクアップ・パウダーゾーン（案）", en: "Hike-up powder zone (plan)" }, { ja: "ハイク", en: "Hike" },
        "advanced", "M 305 115 L 330 200 L 340 280", { ja: { 備考: "第2リフト沿線・未圧雪" }, en: { Note: "Along lift 2 · ungroomed" } }, "hold"),
      trail("trail-xc", { ja: "クロスカントリーコース", en: "XC course" }, { ja: "XC", en: "XC" },
        "nordic", "M 150 300 L 120 250 L 100 200", { ja: { 料金: "無料開放" }, en: { Price: "Free" } }, "open"),
    ],
  ),

  mapBase("asahigaoka", { ja: "倶知安町旭ヶ丘スキー場", en: "Kutchan Asahigaoka Ski Area" },
    ["倶知安町", "LP戦略レポート"],
    [
      lift("lift-pair", { ja: "ペアリフト", en: "Pair lift" }, { ja: "ペア", en: "Pair" },
        "M 240 300 L 250 220 L 258 150", [[240, 300], [258, 150]],
        { ja: { 待ち時間: "ほぼなし" }, en: { "Queue": "Minimal" } }),
      trail("trail-a", { ja: "コースA", en: "Course A" }, { ja: "A", en: "A" },
        "intermediate", "M 260 155 L 275 230 L 285 295",
        { ja: { 全長: "560m（2本計）", 最大斜度: "30°" }, en: { Length: "560 m (2 total)", "Max slope": "30°" } }),
      trail("trail-b", { ja: "コースB", en: "Course B" }, { ja: "B", en: "B" },
        "intermediate", "M 252 152 L 235 230 L 225 298", {}),
      trail("trail-sled", { ja: "そり専用ゾーン", en: "Sled-only zone" }, { ja: "そり", en: "Sled" },
        "sled", "M 320 260 L 360 290 L 380 310", { ja: { 特徴: "スキー斜面と区画" }, en: { Feature: "Separated from pistes" } }),
    ],
  ),

  mapBase("otoifuji", { ja: "音威富士スキー場", en: "Otoifuji Ski Area" },
    ["音威子府村公式", "LP戦略レポート"],
    [
      lift("lift-pair", { ja: "ペアリフト", en: "Pair lift" }, { ja: "ペア", en: "Pair" },
        "M 235 305 L 250 200 L 265 120", [[235, 305], [265, 120]],
        { ja: { 落差: "182m" }, en: { Vertical: "182 m" } }),
      trail("trail-main", { ja: "メインコース", en: "Main course" }, { ja: "メイン", en: "Main" },
        "advanced", "M 268 125 L 280 210 L 290 300",
        { ja: { 上級者: "84%", コース: "3本" }, en: { Advanced: "84%", Courses: "3" } }),
      trail("trail-forest", { ja: "林間コース", en: "Forest course" }, { ja: "林間", en: "Forest" },
        "intermediate-advanced", "M 255 130 L 220 200 L 200 280", { ja: { 特徴: "林間" }, en: { Feature: "Tree run" } }),
      trail("trail-sub", { ja: "サブコース", en: "Sub course" }, { ja: "サブ", en: "Sub" },
        "advanced", "M 270 128 L 300 220 L 310 295", {}),
    ],
  ),

  mapBase("shimukappu", { ja: "国設占冠中央スキー場", en: "Shimukappu Central Ski Area" },
    ["占冠村観光協会", "Snoway", "LP戦略レポート"],
    [
      lift("tow-1", { ja: "ロープトゥ第1", en: "Rope tow 1" }, { ja: "牽引1", en: "Tow 1" },
        "M 220 300 L 230 200 L 240 130", [[220, 300], [240, 130]],
        { ja: { 料金: "無料" }, en: { Price: "Free" } }),
      lift("tow-2", { ja: "ロープトゥ第2", en: "Rope tow 2" }, { ja: "牽引2", en: "Tow 2" },
        "M 280 295 L 275 180 L 270 125", [[280, 295], [270, 125]],
        { ja: { 備考: "当面第1のみの場合あり" }, en: { Note: "Sometimes tow 1 only" } }, "hold"),
      trail("trail-gs", { ja: "大回転コース（GS）", en: "GS course" }, { ja: "GS", en: "GS" },
        "advanced", "M 242 128 L 260 220 L 270 300",
        { ja: { 全長: "620m", 最大斜度: "25°" }, en: { Length: "620 m", "Max slope": "25°" } }),
      trail("trail-sl", { ja: "回転コース（SL）", en: "SL course" }, { ja: "SL", en: "SL" },
        "advanced", "M 268 125 L 285 210 L 295 295",
        { ja: { 全長: "420m" }, en: { Length: "420 m" } }),
      trail("trail-sled", { ja: "第6コース（そり・練習）", en: "Course 6 (sled/practice)" }, { ja: "そり", en: "Sled" },
        "sled", "M 300 280 L 340 300", { ja: { リフト: "なし" }, en: { Lift: "None" } }),
    ],
  ),

  mapBase("abashiri-lv", { ja: "網走レークビュースキー場", en: "Abashiri Lake View Ski Area" },
    ["網走市公式", "日専連オホーツク網走", "LP戦略レポート"],
    [
      lift("lift-pair", { ja: "ペアリフト", en: "Pair lift" }, { ja: "ペア", en: "Pair" },
        "M 238 310 L 248 220 L 258 100", [[238, 310], [258, 100]],
        { ja: { 長さ: "900m", 定員: "1,200人/時" }, en: { Length: "900 m", Capacity: "1,200/h" } }),
      trail("trail-1", { ja: "第1コース", en: "Course 1" }, { ja: "1", en: "1" },
        "beginner", "M 262 105 L 280 200 L 295 305", { ja: { レベル: "初級" }, en: { Level: "Beginner" } }),
      trail("trail-2", { ja: "第2コース", en: "Course 2" }, { ja: "2", en: "2" },
        "intermediate", "M 255 102 L 240 200 L 225 300", {}),
      trail("trail-3", { ja: "第3コース", en: "Course 3" }, { ja: "3", en: "3" },
        "intermediate", "M 260 100 L 270 190 L 280 290", {}),
      trail("trail-4", { ja: "第4コース", en: "Course 4" }, { ja: "4", en: "4" },
        "intermediate", "M 252 98 L 230 180 L 215 295", {}),
      trail("trail-5", { ja: "第5コース", en: "Course 5" }, { ja: "5", en: "5" },
        "intermediate", "M 265 98 L 285 175 L 300 285", {}),
      trail("trail-6", { ja: "第6コース（そり・練習）", en: "Course 6 (sled/practice)" }, { ja: "6·そり", en: "6·Sled" },
        "sled", "M 310 270 L 350 300 L 370 315", { ja: { リフト: "なし", 備考: "練習・そり" }, en: { Lift: "None", Note: "Practice/sled" } }),
    ],
  ),

  mapBase("pippu", { ja: "ぴっぷスキー場", en: "Pippu Ski Area" },
    ["比布町公式 pippu.ski", "LP戦略レポート"],
    [
      lift("lift-pair-2ab", { ja: "第2ペアリフト（A・B）", en: "Lift 2 pair (A·B)" }, { ja: "第2ペア", en: "L2" },
        "M 230 305 L 245 220 L 258 140", [[230, 305], [258, 140]],
        { ja: { 長さ: "617m", 状態: "運行中" }, en: { Length: "617 m", Status: "Operating" } }),
      lift("lift-pair-6", { ja: "第6ペアリフト", en: "Lift 6 pair" }, { ja: "第6", en: "L6" },
        "M 270 300 L 285 200 L 295 115", [[270, 300], [295, 115]],
        { ja: { 長さ: "1,181m", 状態: "運行中" }, en: { Length: "1,181 m", Status: "Operating" } }),
      lift("lift-rope-4", { ja: "第4ロープリフト", en: "Lift 4 rope tow" }, { ja: "第4", en: "L4" },
        "M 310 290 L 315 200", [[310, 290], [315, 200]],
        { ja: { 長さ: "150m", 区分: "初級" }, en: { Length: "150 m", Zone: "Beginner" } }),
      trail("trail-strawberry", { ja: "ストロベリーコース", en: "Strawberry course" }, { ja: "ストロベリー", en: "Strawberry" },
        "beginner", "M 292 120 L 275 200 L 260 300",
        { ja: { 全長: "2,200m", 最大斜度: "20°" }, en: { Length: "2,200 m", "Max slope": "20°" } }),
      trail("trail-family", { ja: "ファミリーコース", en: "Family course" }, { ja: "ファミリー", en: "Family" },
        "beginner", "M 300 125 L 320 220 L 335 305",
        { ja: { 全長: "2,000m", 平均斜度: "13°" }, en: { Length: "2,000 m", "Avg slope": "13°" } }),
      trail("trail-diamond", { ja: "ダイヤモンドコース", en: "Diamond course" }, { ja: "ダイヤモンド", en: "Diamond" },
        "intermediate", "M 288 118 L 305 210 L 318 298",
        { ja: { 全長: "1,500m", 平均斜度: "16°" }, en: { Length: "1,500 m", "Avg slope": "16°" } }),
      trail("trail-dynamic", { ja: "ダイナミックコース", en: "Dynamic course" }, { ja: "ダイナミック", en: "Dynamic" },
        "intermediate-advanced", "M 285 115 L 268 200 L 250 295",
        { ja: { 全長: "1,800m", 最大斜度: "25°" }, en: { Length: "1,800 m", "Max slope": "25°" } }),
      trail("trail-golden", { ja: "ゴールデンコース", en: "Golden course" }, { ja: "ゴールデン", en: "Golden" },
        "advanced", "M 280 112 L 265 190 L 255 280",
        { ja: { 全長: "1,200m", 最大斜度: "30°", ナイター: "一部不可" }, en: { Length: "1,200 m", "Max slope": "30°", "Night skiing": "Partial" } }),
      trail("trail-veteran", { ja: "深雪・ベテランコース", en: "Deep snow veteran course" }, { ja: "ベテラン", en: "Veteran" },
        "advanced", "M 278 110 L 258 180 L 240 270",
        { ja: { 全長: "1,300m", 最大斜度: "36°", 雪面: "非圧雪" }, en: { Length: "1,300 m", "Max slope": "36°", Surface: "Ungroomed" } }),
      trail("trail-kappa", { ja: "カッパコース（ナイター）", en: "Kappa course (night)" }, { ja: "カッパ", en: "Kappa" },
        "beginner", "M 320 280 L 340 300", { ja: { 全長: "600m", ナイター: "可" }, en: { Length: "600 m", "Night skiing": "Yes" } }),
      trail("trail-silver", { ja: "シルバーコース（ナイター）", en: "Silver course (night)" }, { ja: "シルバー", en: "Silver" },
        "intermediate", "M 315 275 L 330 250 L 345 230", { ja: { 全長: "700m", ナイター: "可" }, en: { Length: "700 m", "Night skiing": "Yes" } }),
    ],
  ),
];

mkdirSync(OUT, { recursive: true });
for (const m of MAPS) {
  if (m.id === "sichinohe") {
    console.log("⊘ sichinohe.json — kept hand-synced (calibrated hitboxes)");
    continue;
  }
  writeFileSync(join(OUT, `${m.id}.json`), JSON.stringify(m, null, 2) + "\n", "utf8");
  console.log(`✓ ${m.id}.json (${m.features.length} features, hero PNG)`);
}
console.log("\nHero images: docs/mock-assets/images/maps/{id}-hero.png");
console.log("Sichinohe uses images/maps/sichinohe-hero.png from docs/preview/sichinohe-hero-v5.png");
