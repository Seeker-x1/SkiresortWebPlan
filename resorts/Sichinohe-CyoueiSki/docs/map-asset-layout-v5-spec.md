# ゲレンデマップ アセット・レイアウト v5 仕様（LAAX 解析準拠）

> **L1** | 2026-06-09  
> **入力**: ユーザー指示（LAAX 比率解析・座標維持・モバイル考慮）  
> **計測**: `scripts/probe-laax-map.mjs` → [laax.com/en/map](https://www.laax.com/en/map)  
> **コード禁止** — 本書承認後に `map-ui-implementer` + イラスト制作

---

## 1. LAAX がやっていること（計測事実）

| 項目 | モバイル 390×844 | デスクトップ 1280×800 |
|------|------------------|------------------------|
| 地形キャンバス | **390×844（100%×100%）** | **1280×800（100%×100%）** |
| 地形の letterbox | **なし** | **なし** |
| サイトヘッダー | `fixed` オーバーレイ（高さ ≈64px、z-60） | 同左 |
| リスト／フィルタ | 地形の上に浮く（地形幅を奪わない） | 同左 |
| 比率の扱い | **3D カメラが viewport に合わせて再フレーミング** | 同左 |

**要点**: LAAX は「固定アスペクトの1枚絵 + CSS fit」ではない。  
**WebGL 地形が常に viewport 全体を埋め、UI だけが上に載る。** 2D 焼き込みイラストで同じ体験を出すには、

1. **レイアウト** — stage を 100% にし、サイドバーは **flex で幅を取らない**（オーバーレイ）
2. **アセット** — ゲレンデ本体（v4）の座標は固定し、**周囲の余剰イラストがクロップを吸収**

CSS の contain / cover だけでは LAAX には届かない（前回の見切れ・余白問題の根本原因）。

---

## 2. 七戸の現状とギャップ

| 項目 | 現状 v4 | LAAX 相当 |
|------|---------|-----------|
| 画像 | `sichinohe-hero.png` **1024×790**（aspect ≈ **1.296**） | 動的 3D（固定 ratio なし） |
| 座標系 | `viewBox 0 0 1024 790` + `hitboxes-hero-v4.json` | — |
| デスクトップ stage | flex で **rail 288px を奪う** → stage aspect ≈ **1.32** | canvas **100%**（rail は上に載る） |
| モバイル | stage ほぼ全幅、rail は FAB + bottom sheet ✅ | 同型（LAAX もオーバーレイ） |
| scale=1 | contain + 16px pad → **余白** | **画面全体が地形** |
| 旧 cover | ゲレンデが **見切れる** | マージンだけが切れる |

**v4 のゲレンデ配置・線の詳細さ・ヒットボックスはそのまま使う。** 変えるのは **キャンバス外周の余剰画** と **UI レイアウト** のみ。

---

## 3. ターゲット viewport（七戸 `/map`）

`MapPageShell` + `MapTopBar` 前提（§E P1 済み）。

| ブレークポイント | 想定 CSS サイズ | stage 実効（topbar 除く） | stage aspect |
|------------------|-----------------|---------------------------|--------------|
| **モバイル** | 390×844 | 390 × **800**（topbar ≈44px） | **0.488** |
| **デスクトップ** | 1280×800 | 1280 × **756** | **1.693** |

rail をオーバーレイ化すると、デスクトップ stage は **1280×756（1.693）** まで広がる（現状 992×756 から改善）。

---

## 4. v5 アセット設計（LAAX 型・2D 翻訳）

### 4.1 方式: **「保護矩形 + 余剰マージン」**

```
┌──────────────────────────────────────┐  ← master canvas（v5）
│  margin: 空・遠景・林（コース線なし）   │
│    ┌────────────────────────┐        │
│    │  contentRect           │        │  ← v4 をそのまま配置
│    │  1024×790              │        │     コース・リフト線はここだけ
│    │  (既存レイアウト不変)    │        │
│    └────────────────────────┘        │
│  margin: 基部・雪原・ロッジ外観など      │
└──────────────────────────────────────┘
```

| フィールド | 値 |
|------------|-----|
| **master サイズ** | **1920×1920**（1:1、LAAX の「どちら向きでも full bleed」を静的に近似） |
| **contentRect** | x=**448**, y=**565**, w=**1024**, h=**790**（v4 を下寄せ配置。上に空マージン多め） |
| **viewBox** | `0 0 1920 1920` |
| **焼き込み線** | contentRect 内のみ（v4 ピクセルを **拡大・縮小・再配置しない**） |
| **余剰画** | コース線・リフト線 **追加禁止**。空・山稜・林・雪原・雲のみ |

**下寄せの理由（cover シミュレーション）**

- デスクトップ（aspect 1.69）で 1:1 を cover → **上下が切れる**
- モバイル（aspect 0.49）で 1:1 を cover → **左右が切れる**
- ゲレンデは画面下部に来る → **上側マージンを厚く**し、上下クロップでゲレンデが切れないようにする
- 左右クロップは林・空で吸収（コース番号は contentRect 内に収める）

### 4.2 ヒットボックス移行

| 項目 | 手順 |
|------|------|
| 座標変換 | 全 path に **+Δx=448, +Δy=565**（一括オフセット） |
| 根拠 | `illustrated-hero layout-v5 margin-offset from v4` |
| QA | `/maps/calibration-qa.html` で端点 ±20px |
| 禁止 | 2点相似・PIXEL 直書き・新コース線の推測 |

出力: `hitboxes-hero-v5.json`（v4 はアーカイブ保持）

### 4.3 manifest 追記

```json
{
  "heroImage": {
    "src": "/maps/sichinohe-hero-v5.png",
    "width": 1920,
    "height": 1920,
    "viewBox": "0 0 1920 1920",
    "projection": "official-map-layout-illustrated-v5",
    "contentRect": { "x": 448, "y": 565, "width": 1024, "height": 790 },
    "contentAnchor": "v4-layout-preserved",
    "attribution": "layout-v5 — v4 contentRect + margin art"
  }
}
```

---

## 5. フィット戦略（v5 納品後）

| 状態 | 仕様 |
|------|------|
| scale=1 | **cover**（LAAX 同様・letterbox 禁止） |
| クロップ対象 | **contentRect 外のマージンのみ**（QA で検証） |
| scale>1 | 既存 `usePanZoom` クランプ |
| padding | **0**（LAAX に余白パディングなし） |

`map-cover-dimensions.ts` は v5 納品後に cover に戻す。  
v4 の間は contain のまま（見切れ防止の暫定）。

---

## 6. レイアウト（LAAX 型オーバーレイ）

### 6.1 デスクトップ（md+）

```
MapPageShell (fixed inset-0)
├── MapTopBar (fixed overlay, z-70)
└── stage (100% × 100%)
    ├── HeroMapCanvas (z-0, cover v5)
    ├── MapOverlayChrome フィルタピル (floating, z-10)
    ├── FAB ズーム (z-10)
    └── MapStatusRail (absolute right-0 top-0 bottom-0 w-72, z-20, 半透明可)
```

**変更**: 現行の `flex` + `aside shrink-0` をやめ、**rail は地形の上**（LAAX の Lift パネルと同型）。

### 6.2 モバイル（&lt;md）

現状維持で LAAX と一致済み:

| 要素 | 仕様 |
|------|------|
| stage | **100%**（topbar 除く） |
| 運行リスト | FAB → bottom sheet（max 70dvh） |
| 初期 | リスト閉じ、**地形のみ** |

---

## 7. モバイル向けチェックリスト

| # | 検証 | 合格条件 |
|---|------|----------|
| M1 | 390×844 初期表示 | ゲレンデ全体（contentRect）が **見切れない** |
| M2 | FAB タップ | シートは **地形の上**。stage 高さは縮まない |
| M3 | 片手 | ズーム FAB ≥44px、シートは下からスワイプ閉じ |
| M4 | コース番号 | 左右クロップ後も 1,2,4,5,A が読める |
| M5 | 3G/省電力 | 静止画 1 枚 + SVG ヒットボックス（WebGL 不要） |

---

## 8. デスクトップ向けチェックリスト

| # | 検証 | 合格条件 |
|---|------|----------|
| D1 | 1280×800 初期表示 | stage **≥80%** viewport（§E P0） |
| D2 | rail 表示中 | 地形は **1280px 幅いっぱい**（rail は重ねる） |
| D3 | ペアリフト上端〜基部 | contentRect 内が **上下クロップ後も可視** |
| D4 | リスト選択 | 地形面積不変（I1 維持） |

---

## 9. 制作パイプライン（イラスト担当）

### 9.0 Cursor / AI イラスト — **やってはいけないこと**

| 過去の失敗 | 結果 |
|------------|------|
| Gemini でゲレンデ**全体**を生成 | コース配置が公式とズレ、`tune-hero-ai-geo.mjs` の **PIXEL 直書き**に逃げた |
| AI イラスト + SVG 線オーバーレイ | V字扇形・太い角丸線（**子どもの落書き同等**） |
| Cursor `GenerateImage` でマップ一式 | コース番号・リフト位置が毎回変わる。**本番不可** |

**v4 のゲレンデ画質は「Cursor 生成そのもの」ではなく、手トレース済みヒットボックスとセットで初めて成立している。**  
v5 でも **ゲレンデ本体を AI に描かせない**。

### 9.1 安全な方法（推奨）

```
node scripts/build-hero-v5-template.mjs
→ sichinohe-hero-v5-template.png   （v4 等倍貼付）
→ sichinohe-hero-v5-outpaint-mask.png （白=埋めていい領域）
```

| 手順 | 担当 | 内容 |
|------|------|------|
| 1 | **スクリプト** | v4 を (448,565) に等倍合成（済） |
| 2 | **人間 or Photoshop** | マスク**白領域のみ** Generative Fill / 手描きで空・林・雪原を延長 |
| 3 | **禁止** | 黒マスク（contentRect）内のピクセルを 1px でも変更 |
| 4 | **禁止** | 新しいコース線・リフト線・番号を AI に描かせる |
| 5 | **QA** | v4 と v5 を diff — contentRect 内は **完全一致** |
| 6 | 書き出し | `sichinohe-hero-v5.png`（1920×1920） |
| 7 | トレース | ヒットボックス +448,+565 → `hitboxes-hero-v5.json` |
| 8 | 目視 | ユーザー OK + calibration-qa ±20px |

**Cursor に任せるのはテンプレ生成と QA スクリプトまで。** 絵を仕上げるのは外部ツールか手作業。

### 9.2 納品前チェック（全部 YES）

- [ ] contentRect 内が v4 とピクセル一致（`sharp` diff で検証可）
- [ ] コース番号 1,2,4,5,A の位置が v4 と同じ
- [ ] マージンにコース線がない
- [ ] ユーザー目視 OK
- [ ] `/map` 本番には **ユーザー承認後のみ** 差し替え

---

## 10. 実装順序（承認後）

```
① map-interaction-spec（本書 §6 オーバーレイ rail）承認
② map-ui-implementer — LiftMapViewer レイアウト変更（コード、イラスト前でも可）
③ イラスト v5 納品
④ hitboxes-hero-v5.json + manifest 更新
⑤ map-cover-dimensions → cover（padding 0）
⑥ build-map-preview.mjs 同期
⑦ map-ux-evaluator — R6 / P0 再監査（375 + 1280）
```

---

## 11. 撤回する誤った前提

| 誤り | 正 |
|------|-----|
| 1024×790 を CSS で伸ばす | v5 マージンアートで viewport を満たす |
| rail を flex で幅奪い | LAAX 同様オーバーレイ |
| cover を v4 に適用 | マージンなし v4 では **必ず見切れ** |
| contain + pad を最終解 | **v5 までの暫定** のみ |

---

## 12. 参照

- LAAX 計測ログ: `node resorts/Sichinohe-CyoueiSki/scripts/probe-laax-map.mjs`
- 現行座標: `web/data/map/hitboxes-hero-v4.json`
- 品質ゲート: `.cursor/rules/lift-map-no-fake-overlays.mdc`
- 層 C: `docs/qa_report_map.md` §E
