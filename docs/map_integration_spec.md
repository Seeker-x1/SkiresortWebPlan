# マップ統合 spec — ルートテンプレ ↔ 七戸 `/map`

> **L1** | `resort-map-bridge` 成果物 | 2026-06-08  
> 実装: `map-ui-implementer`（`resorts/Sichinohe-CyoueiSki/web/`）

---

## 1. 目的

トップ（Alpine Clarity / Award テンプレ）と `/map` を **同一ブランド世界** に揃える（`laax_gap_spec` L5）。

---

## 2. デザイントークン（七戸）

| トークン | 値 | 用途 |
|----------|-----|------|
| `--canvas` | `#f7f9fb` | ページ背景・**マップステージ背景** |
| `--alpine-dark` | `#1a4d42` | サイドバー・ナビピル・ヒーローグラデ下端 |
| `--alpine` | `#2d6b7a` | アクセント・リンク・選択リング |
| `--forest` | `#2d5a4a` | 補助アクセント |
| `--ink` | `#1c2434` | 本文 |
| `--border` | `#e2e8f0` | 枠線 |

### マップ専用（`award-design-system.css`）

| トークン | 参照 | 用途 |
|----------|------|------|
| `--map-stage-bg` | `var(--canvas)` | `HeroMapCanvas` 余白 |
| `--map-rail-bg` | `var(--alpine-dark)` | サイドバー・モバイルシート |
| `--map-chrome-nav` | `color-mix(in srgb, var(--alpine-dark) 92%, transparent)` | 上部フィルタピル |

### コース難易度色（イラスト焼き込みと一致）

| 種別 | 変数 | 値 |
|------|------|-----|
| 初級 | `--trail-beginner` | `#2fa84a` |
| 中級 | `--trail-intermediate` | `#d62839` |
| 上級 | `--trail-advanced` | `#6d28d9` |
| リフト | `--lift-line` | `#1a1a1a` |

実装: `feature-colors.ts`（コード側マスタ）

---

## 3. タイポグラフィ

| 要素 | フォント |
|------|----------|
| マップヘッダー resort 名 | `--award-font-display`（Syne） |
| リスト・凡例 | `--award-font-body`（Noto Sans JP） |
| 最終更新・数値 | `--award-font-mono`（IBM Plex Mono） |

---

## 4. コンポーネント適用表

| コンポーネント | 背景 | テキスト |
|----------------|------|----------|
| `HeroMapCanvas` | `--map-stage-bg` | — |
| `MapStatusRail` | `--map-rail-bg` | 白 / 85% |
| `MapOverlayChrome` header | 白 glass 75% | `--ink` |
| `MapOverlayChrome` nav | `--map-chrome-nav` | 白 |
| `CoursesMapEmbed` shell | `--map-rail-bg` 枠 + stage |

---

## 5. 禁止

- **`sichinohe-hero.png` をトップヒーロー・Bento・任意の非 `/map` UI に使う**（ゲレンデマップ専用）
- **`hero-slope.png` に戻す・勝手に差し替える**（承認済みは `hero-sichinohe.png`。`docs/asset_brief.md` §8）
- `hero-sichinohe.png` にマップイラスト（`sichinohe-hero.png`）をコピーする
- ステージ背景 `#0c1220` 単色のまま出荷（G2 ブロック）
- フィルタアイコン絵文字（SVG + ラベル）
- トップと無関係な `slate-900` 単色マップ UI

### 資産の役割分担

| ファイル | 用途のみ |
|----------|----------|
| `public/images/hero-sichinohe.png` | トップヒーロー（承認済み実写・コース線なし） |
| `public/images/hero-slope.png` | 旧ストック（**使用しない**。差し替え禁止） |
| `public/images/hero-sichinohe.svg` | フォールバック用ベクター（通常は未使用） |
| `public/maps/sichinohe-hero.png` | `/map`・`map-preview`・キャリブ QA のみ |

---

## 6. 導線（G6 同期 — 2026-06-08）

| 起点 | リンク先 |
|------|----------|
| 七戸 `/courses` | **恒久リダイレクト** → `/[locale]/map`（`redirect({ href: "/map" })`） |
| 七戸 `/map` | `MapPageShell` 全画面 — **split rail**（地図｜`MapStatusRail` 横並び） |
| `MapQuickNav`（layout chrome） | **ADEF 4列**: ホーム / ライブカメラ / アクセス / 今日の運営 |
| レール内タブ | **コース｜リフト**（初期 **コース**）。地図上フィルタ帯・凡例 **なし** |
| トップ `PathMagnet`「Terrain」 | `/[locale]/map` |
| ルート `public/preview` | 静的プレビュー（本番 IA とは別。`npm run preview:site`） |

**IA ラベル（七戸）**: nav「ゲレンデマップ」=`/map` — [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md) §0–§2

**G6 禁止（再掲）**: `/courses` 独立 embed・地図上 `MapLegend`・6ピル LAAX フィルタ帯・リスト選択時の地図上 bottom sheet

**静的プレビュー同期**: `npm run preview:site`（`messages/ja.json` → `public/preview/` + `docs/preview/`）。`preview:map` の末尾でも自動実行。

---

## 7. 受け入れ（L5 PASS）

1. `/map` ステージ余白が canvas 系（黒一色でない）
2. サイドバーが alpine-dark 系
3. ヘッダー glass がトップ `SiteHeader` と同系統
4. `map-ux-evaluator` / `resort-visual-evaluator` が PASS
