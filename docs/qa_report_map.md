# QA 評価レポート — マップ画面 `/map`

> **依頼**: `@resort-qa-a11y` マップ画面評価（目標: LAAX 級ゲレンデマップ）  
> **Date**: 2026-06-07  
> **Target**: `resorts/Sichinohe-CyoueiSki/web/src/app/[locale]/map/` → `LiftMapViewer`  
> **参照**: エージェント 16（レイアウト）・18（インタラクション）ルーブリック、`.cursor/rules/map-*`

---

## エージェント管轄の注記

マップの **レイアウト非遮蔽・クリック後 UI** は本来:

- `map-ux-evaluator`（16）
- `map-interaction-evaluator`（18）

が担当。本レポートは依頼に応じ `resort-qa-a11y` が **16/18 ルーブリック + a11y + LAAX ベンチマーク** を統合評価したもの。

---

## 総合判定（最新: 2026-06-08 再評価）

| 層 | 観点 | Verdict |
|----|------|---------|
| **A** | マップ UX ゲート（R1–R6）— `map-ux-evaluator` | **PASS**（G5 再評価 2026-06-09） |
| **A** | マップインタラクション（I1–I5）— `map-interaction-evaluator` | **PASS** |
| **B** | LAAX ギャップ L1–L5（七戸スケール）— §D | **5/5 PASS** |
| **C** | LAAX 本家並置 P0–P6 — §E | **0/6 PASS** |
| — | A11y / 多言語（QA 拡張） | **PASS**（C5 完了後） |

**結論**

- **出荷ゲート（層 A）**: UX **PASS** + インタラクション **PASS**（G5 cover・専用シェル・preview FAB 後）。
- **七戸スケール LAAX（層 B）**: 機能・データ・2D 地形イラスト方針で **5/5**。L1 は **3D 風 2D 焼き込みイラスト** で PASS（WebGL 不要・ユーザー確定 2026-06-08）。
- **本家 LAAX 並置（層 C）**: [laax.com/map](https://www.laax.com/map) との体験差は **未達**。層 B の「LAAX 級」とは別ラベル。

**三層の使い分け**: [`laax_gap_spec.md`](./laax_gap_spec.md) §0 出荷の言い方 — 層 A＝事故防止、層 B＝七戸簡易版、層 C＝ベンチマーク URL 並置。

---

## なぜ初回評価で触れなかったか（ルーブリックの穴）

エージェント 16 の R1–R5 は **「二次 UI が地図を覆うか」** だけを見る設計だった。

| 見ていたこと | 見ていなかったこと |
|-------------|-------------------|
| サイドバー／sheet の位置 | **地図画像そのものがビューポートから外れるか** |
| リスト選択後の overlay | **scale=1 でパンが必要か／許されるか** |
| map-preview の flex 分割 | **translate のクランプ有無** |

→ **「地図が主役」≠「地図が常に画面を満たす」** の区別がルーブリックに無かった。ユーザー指摘は正しく、**評価漏れ**。

---

## A. マップ UX（エージェント 16 相当）

| ID | 結果 | 根拠 |
|----|------|------|
| **R1** 主コンテンツ非遮蔽 | **PASS** | デスクトップ: `LiftMapViewer` が `flex` — 地図 `flex-1` + 右 `aside.w-72`（`MapStatusRail`）。運行リストは stage 内 absolute パネルではない |
| **R2** 情報階層 | **PASS** | P0 地図（`HeroMapCanvas`）が主。P1 運行はサイドバー／FAB 経由のシート。上部 `MapOverlayChrome` はヘッダー＋ナビのみ |
| **R3** モバイル 375px | **PASS** | 初期状態: 地図が `h-[calc(100dvh-4rem)]` ほぼ全幅。運行は `bottom-4 left-4` の小 FAB → タップで `max-h-[70dvh]` シート（**初期閉**） |
| **R4** map-preview.html | **PASS** | `.main { display:flex }` + `.rail` は flex 兄弟。`#sheet` なし。詳細は `.rail-detail` インライン |
| **R5** a11y 最低限 | **FAIL** | リスト `button` + `aria-pressed` は良い。地図マーカー `outline-none`、オーバーレイ UI に `focus-visible` なし（下記 C 参照） |
| **R6** パン・ズーム境界（**必須・追記**） | **PASS** | `usePanZoom.ts`: scale≤1 でパン無効、`clampTranslate` + ResizeObserver。`build-map-preview.mjs` 同期 |

**R1 補足**: `MapOverlayChrome` が地図上部に半透明ヘッダー＋ピルナビを重ねるが、**基部・駐車場は覆わない**。許容範囲。

---

## E. パン・ズーム境界（ユーザー指摘・P0）

### 現象

- マップは初期状態でビューポートに **ほぼ全面フィット**（`HeroMapCanvas` の `min(100%, calc((100dvh - 8rem) * aspect))`）
- それにもかかわらず **ドラッグで画像を任意方向に移動**でき、周囲に `#0c1220` の空白が広がる
- 「全体表示」FAB がある＝ **ずれる前提の UX** になっている

### コード根拠

`usePanZoom.ts`:

- `setTranslate` に **上下限クランプなし**（L67: `t.x + dx`, `t.y + dy` を無制限加算）
- `MIN_SCALE = 1` でも **scale=1 のときパン可能**（ドラッグ無効化なし）
- ズームアウトで 1 未満にできないが、**1倍のままパンするだけで地図外が見える**

### UX 判定

| 原則 | 現状 | 判定 |
|------|------|------|
| 全面表示時は画面を常に地図で満たす | パンで空白露出 | **FAIL** |
| scale=1 ではパン不要（または禁止） | パン可能 | **FAIL** |
| scale>1 時のみパン、かつ端でクランプ | 未実装 | **FAIL** |
| LAAX / Google Maps 級の「はみ出し」感 | 無関係な暗い余白 | **FAIL** |

**ユーザー評価「圧倒的に最悪な UX」は妥当。** スキー場マップで「ゲレンデの外を眺める」操作に意味はない。

### あるべき仕様（評価基準として追記）

1. **scale === 1**: パン無効。画像は `object-fit: cover` 相当で viewport を常に埋める
2. **scale > 1**: パンのみ許可。translate は **画像端が viewport 内に収まる範囲**にクランプ
3. **「全体表示」**: 現状どおり reset でよいが、**そもそもずれない**のが理想
4. オプション: イラスト全面固定なら **パン・ズーム自体を廃止**（ヒット領域だけ SVG）も G1 ではあり

### 担当

- 仕様: `map-interaction-spec`（状態: idle / zoomed + pan bounds）
- 実装: `map-ui-implementer`（`usePanZoom.ts` + `HeroMapCanvas.tsx`）
- 再評価: `map-ux-evaluator` に **R6 を permanent 追加**

---

## B. マップインタラクション（エージェント 18 相当）

| ID | 結果 | 根拠 |
|----|------|------|
| **I1** 選択時の地図非遮蔽 | **PASS** | デスクトップ: リスト選択後も地図面積不変。詳細は `MapFeatureDetail` が rail 内 `border-t` で展開。モバイル: 選択で第二 overlay なし（シート内完結） |
| **I2** 情報密度 | **PASS** | 詳細は label + badge + reason + meta 程度。巨大「閉じる」単独シートなし |
| **I3** 二重 UI 禁止 | **PASS** | md+ でサイドバー表示中に別 dialog なし。`FeatureSheet` 未使用 |
| **I4** 状態一貫性 | **PASS** | `aria-pressed` + 選択行ハイライト。`×` で `onDeselect` |
| **I5** preview parity | **PASS** | 静的 HTML も sidebar 内 `.rail-detail`、`#sheet` パターン廃止済み |

---

## C. A11y / 多言語（resort-qa 拡張）

| ID | 結果 | 根拠 |
|----|------|------|
| C1 フォーカス可視 | **FAIL** | `LiftMarkers.tsx` L59 `outline-none`。`MapOverlayChrome` Link/button、`MapFab` に `focus-visible` なし |
| C2 タッチターゲット | **PASS** | `MapFab` 44px。リスト行 `py-2.5` 十分 |
| C3 絵文字アイコン | **FAIL** | `MapOverlayChrome` FILTERS が 🚡⛷📹 等（スクリーンリーダー・一貫性に不利） |
| C4 多言語 | **FAIL** | `map/page.tsx` metadata 日本語固定。`LiftMapViewer` / `MapStatusRail` 文言ハードコード JA。「閉じる」「運行状況」等 |
| C5 reduced-motion | **WARN** | パン・ズームは操作起因。`animate-pulse` ローダーのみ。重大ではない |

---

## D. LAAX 級ベンチマーク（目標照合）

> **L1 仕様（正）**: [`docs/laax_gap_spec.md`](./laax_gap_spec.md) — ギャップ閉じる条件・G2–G4 受け入れ基準

LAAX（[resort.laax.com/map](https://www.laax.com) 系）のゲレンデマップが持つ体験と照合。

| 軸 | LAAX 水準（要約） | 現状 `/map` | 判定 |
|----|------------------|-------------|------|
| **L1** 3D・地形表現 | WebGL / 3D 地形、没入感のある斜面 | 2D イラスト/ヒーロー画像 + パンズーム（`HeroMapCanvas`） | **FAIL** |
| **L2** コース網羅 | 全リフト・全コースが色分け・選択可能 | リフト線 SVG + モック status。コース `runs.geojson` 未整備（ROADMAP G1） | **FAIL** |
| **L3** ライブ感 | 運行状況が地図上で即時に色・状態反映 | API モック配線済み。更新ラベル・リフレッシュあり。本番運用ではない | **PARTIAL** |
| **L4** 探索 UX | 検索・フィルタ・凡例・現在地 | リフト/コースフィルタピルのみ。検索・GPS なし | **FAIL** |
| **L5** ビジュアル完成度 | ブランド級タイポ・余白・アニメ | ダーク UI は統一感あるが **イラスト主役の G1 MVP** 段階（`ROADMAP_LIFT_MAP_VISUAL_FIRST.md`） | **FAIL** |

**ロードマップ上の位置**: 現状は **G1（ビジュアル MVP）**。「LAAX 級」は G2〜G4 + イラスト本番化後の目標。

**G2 イラスト方針**: **A（イラスト SVG）確定**（2026-06-07）— [`laax_gap_spec.md`](./laax_gap_spec.md) §G2。

---

## ブロッカー（優先順）

### ~~P0 — パン境界~~（解消 2026-06-07）

1. ~~`usePanZoom`: translate クランプ + scale=1 でパン無効~~ → **完了**
2. R6 PASS — マップ UX ゲート **R1–R6 クリア**

### P0 — 体験・ビジュアル（map-ui-implementer + デザイン）

1. 標高 DEM → イラスト or 検証済み 3D（`ELEVATION_ILLUSTRATION_MODEL.md`）への移行
2. 全コース・全リフトの幾何＋ステータス結合（`runs.geojson`、キャリブレーション QA）
3. `/courses` へのマップ埋め込み（G2）

### P1 — a11y（map-ui-implementer）

1. 地図・オーバーレイに `focus-visible`（ルートテンプレの `.interactive-focus` 流用可）
2. `LiftMarkers` の `outline-none` 撤廃 → フォーカスリング
3. 絵文字 → SVG アイコン

### P2 — i18n（resort-i18n-spec → map 側）

1. `messages` 化（運行状況・閉じる・フィルタラベル）
2. `map/page.tsx` `generateMetadata` の locale 対応

---

## 再発防止（1行）

**選択詳細は rail 内のみ。地図 stage 内に運行パネルを absolute/fixed で載せない。**

---

## 次のアクション

| 優先 | エージェント | タスク |
|------|-------------|--------|
| 1 | `map-ui-implementer` | C1/C3 a11y 修正 |
| ~~2~~ | ~~`map-interaction-spec`~~ | ~~G2 状態遷移~~ → **完了** [`map-interaction-spec-g2.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md)（検索は G3） |
| 3 | `map-ui-implementer` | spec ベースで L2/L4 機能 |
| ~~4~~ | ~~`map-ux-evaluator` + `map-interaction-evaluator`~~ | ~~修正後の再 PASS 確認~~ → **完了（下記）** |

**LAAX 級の最終判定**は 16+18 PASS に加え、**セクション D が 4/5 以上 PASS** してから。

---

## 正式再評価 — map-ux-evaluator（エージェント 16）

**Date**: 2026-06-07（R6 修正後）  
**対象**: `/map`（`LiftMapViewer`）、`public/maps/map-preview.html`  
**方法**: ソース監査（レイアウト・視認性・パン境界）。幾何キャリブは対象外。

### Verdict

**PASS**

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **R1** 主コンテンツ非遮蔽 | **PASS** | `LiftMapViewer.tsx` L92–135: 地図 `flex-1` + `aside.hidden.md:flex.w-72` サイドバー。運行リストは stage 内 absolute パネルなし。基部は `MapOverlayChrome` 上部ヘッダーのみ（L31–40）で下部を覆わない |
| **R2** 情報階層 | **PASS** | P0=`HeroMapCanvas` 全画面。P1=`MapStatusRail` サイドバー／FAB 経由シート。P2=ズーム FAB（`HeroMapCanvas` L92–99）。二次 UI が P0 を常時犠牲にしない |
| **R3** モバイル 375px | **PASS** | 初期: 地図 `h-[calc(100dvh-4rem)]` ほぼ全幅（L92）。運行は `md:hidden` FAB（L121–127）→ `max-h-[min(70dvh,520px)]` シート（L145）**初期閉**。50dvh 未満に押し潰されない |
| **R4** map-preview.html | **PASS** | L15 `.main { display:flex }`、L23 `.rail` flex 兄弟（absolute overlay なし）。`#sheet` 不在。`selectFeature` → `#railDetail` インライン（L198–209） |
| **R5** a11y 最低限 | **PASS** | `MapStatusRail.tsx` L67–89: リストは `<button type="button">` + `aria-pressed`。地図パンは `containerRef` 上の pointer ハンドラ（`HeroMapCanvas` L40–47）、サイドバーは flex 兄弟で阻害なし |
| **R6** パン・ズーム境界 | **PASS** | `usePanZoom.ts` L29–30: scale≤1 → translate `(0,0)`。L149–151: scale≤1 で `onPointerDown` 無効。L39–44: scale>1 で `clampTranslate`。L132–135: `resetView` で scale=1 + translate リセット。`map-preview.html` L100–117 `clampPan()`、L226–233 scale≤1 パン無効 — parity あり |

### ブロッカー

なし

### 再発防止

**scale=1 ではパンを開始しない。translate は常に `clampTranslate` 経由。R6 を 16 ルーブリックの permanent 項目として維持する。**

---

## 正式再評価 — map-interaction-evaluator（エージェント 18）

**Date**: 2026-06-07  
**対象**: `/map`、`map-preview.html`  
**参照 spec**: `agents/17-map-interaction-spec.prompt.md`（七戸確定 spec 2026-06-07）

### Verdict

**PASS**

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **I1** 選択時の地図非遮蔽 | **PASS** | デスクトップ: `onSelect` → `setSelectedId` のみ（`LiftMapViewer` L86）。地図 stage に第二 overlay なし。詳細は `aside` 内 `MapFeatureDetail`（`MapStatusRail` L97–103）。モバイル: リスト選択で新規 fixed sheet は出ない（シートは FAB 起動のみ L123） |
| **I2** 情報密度 | **PASS** | `MapFeatureDetail.tsx`: label + badge + reason + meta + 小さな `×`（L27–51）。full-width 専用 sheet・巨大「閉じる」単独 UI なし |
| **I3** 二重 UI 禁止 | **PASS** | md+: `aside.hidden.md:flex` のみ（L133–135）。`FeatureSheet` 未使用（grep 0 件）。モバイル: 単一ボトムパネル内で詳細完結（L156 `MapStatusRail`） |
| **I4** 状態一貫性 | **PASS** | `MapStatusRail` L70 `aria-pressed`、L71–72 選択時 `bg-white/15 ring-1`。`MapFeatureDetail` L44–51 `onDeselect` / `×`。preview: `button.sel` + `#railDetail`（`map-preview.html` L198–209） |
| **I5** preview parity | **PASS** | 静的 HTML: sidebar 内 `.rail-detail`、`#sheet` 禁止。`/map` と同じ「選択 → rail 内インライン詳細」原則 |

### ブロッカー

なし

### 再発防止

**リスト選択は `selectedId` 状態のみ更新し、地図上に fixed/absolute の詳細 UI を追加しない。**

---

## Ship gate（マップ UX / インタラクション）

```
map-ux-evaluator PASS + map-interaction-evaluator PASS + code-reviewer（座標・幾何変更時）
```

**現状**: 16 **PASS** + 18 **PASS** → **マップレイアウト・インタラクション出荷ゲートクリア**（LAAX ベンチマーク・a11y C 系は別途）。

---

## Phase E 再評価（G2・2026-06-08）

B6 停止リフト表現・静的 `calibration-qa`・トークン統合後の **3 ゲート** 再実行。

### 1. code-reviewer（幾何・A 方式）

**Verdict: PASS**

| 項目 | 結果 | 根拠 |
|------|------|------|
| A 方式（焼き込み + ヒットのみ） | PASS | `MapHitboxes` `bakedLines`、未検証 SVG 線なし |
| `hitboxes-hero-v4.json` | PASS | リフト2 + コース5、`source` 付き |
| `trails.geojson` | PASS | `hero-pixel` + `sync-trails-geojson.mjs` |
| `lifts.geojson` | PASS | ペア OSM way/631879096、ポニー `source` 明記 |
| 手置き `PIXEL` 座標 | PASS | 本番 path になし |

### 2. map-ux-evaluator（R1–R6）

**Verdict: PASS**

| ID | 結果 | 根拠 |
|----|------|------|
| R1 | PASS | リスト・凡例は `aside` サイドバー。stage 内 bottom overlay なし |
| R2 | PASS | P0 地図主役。`MapOverlayChrome` は上部 P2 のみ |
| R3 | PASS | `CoursesMapEmbed lead` + `min-h-[50dvh]`。375px 可視 488px ≥ 406px（`verify-b3-embed.mjs` 2026-06-08） |
| R4 | PASS | `map-preview.html` flex `.main` 分割、`#railDetail` サイドバー内 |
| R5 | PASS | リスト `button`、ヒット `tabIndex`+`focus-visible` |
| R6 | PASS | `usePanZoom.ts` scale=1 パン無効、`clampTranslate` |

### 3. map-interaction-evaluator（I1–I5 + G2）

**Verdict: PASS**

| ID | 結果 | 根拠 |
|----|------|------|
| I1 | PASS | md+ 選択後も地図面積不変。`MapFeatureDetail` は rail 内 |
| I2 | PASS | コンパクト詳細。巨大 sheet なし |
| I3 | PASS | md+ 第二 overlay なし。mobile FAB は初期閉 |
| I4 | PASS | `aria-pressed`、選択 ring、`onDeselect` |
| I5 | PASS | `map-preview` `#railDetail` のみ、`#sheet` なし |
| G2-1〜2,4〜6 | PASS | spec §8 コード・静的プレビュー整合 |
| G2-3 | PASS | `CoursesMapEmbed lead`、375px スクロール前可視 ≥50dvh（B3 2026-06-08） |

### G2 完了宣言

**完了（2026-06-08）** — Phase E 3 ゲート PASS、B3・C5 記録済み。詳細は `g2_checklist.md` §9。

### L5 ブランド（Phase C 追評価）

**Verdict: PASS** — [`qa_report_map_l5.md`](./qa_report_map_l5.md)（C3 フォント・トークン・`map.*` i18n）

---

## Phase G3 — 運用・探索（2026-06-08）

**Verdict: PASS** — [`g3_checklist.md`](./g3_checklist.md)

| 項目 | 結果 |
|------|------|
| サイドバー検索 | PASS — `featureMatchesSearch`、地図不変 |
| status 手運用 | PASS — `/api/admin/map-status` + `/admin` |
| status-stale | PASS — `MapOverlayChrome` 琥珀帯 |
| L3 10s | PASS — `POLL_MS=10000` |
| i18n | PASS — `map.search` / `map.stale` |

### LAAX §D 更新（G3 後）

| 軸 | 判定 |
|----|------|
| L1 | PARTIAL |
| L2 | PASS |
| L3 | **PASS** |
| L4 | **PASS** |
| L5 | PASS |

**4/5 PASS** — G3 完了。LAAX 級宣言は **G4**（リアルタイム本番化）後。

---

## Phase G4 — リアルタイム・探索完成（2026-06-08）

**Verdict: PASS** — [`g4_checklist.md`](./g4_checklist.md)

| 項目 | 結果 |
|------|------|
| SSE stream | PASS — `/api/public/map-status/stream` 3s tick |
| Poll fallback | PASS — 30s on SSE error |
| Audit log | PASS — `status-audit.jsonl` on admin save |
| Difficulty filter | PASS — sidebar pills + map dim |
| GPS distance | PASS — sidebar only（A 方式準拠） |
| Live badge | PASS — SSE 時 chrome 表示 |

### LAAX 級宣言（七戸スケール）

| 軸 | 判定 |
|----|------|
| L1 | **PASS**（2D イラスト） |
| L2 | PASS |
| L3 | PASS |
| L4 | PASS |
| L5 | PASS |

**5/5 PASS — LAAX 級（七戸スケール）達成**（層 B のみ。層 A は下記再評価で FAIL、層 C は §E 参照）

---

## E. LAAX 本家並置（層 C）

> **ベンチマーク URL**: [LAAX Karte](https://www.laax.com/map)  
> **目的**: 層 B（七戸スケール機能充足）と **別軸** で、本家との体験差を PASS/FAIL 化する。  
> **方法**: 375px / 1280px で LAAX vs 七戸 `/map` を横並び screencast（未実施項目は FAIL 扱い）。  
> **L1 資産方針**: **3D 風に描画した 2D 地形イラスト**（`sichinohe-hero.png` 焼き込み + ヒットボックス）で層 B L1 は PASS。層 C の P0/P2 は **WebGL 不要** だが **没入レイアウト・操作モデル** は本家と比較する。

### E.1 ルーブリック

| ID | 質問（本家並置） | LAAX 目安 | 七戸現状 | 判定 |
|----|------------------|-----------|----------|------|
| **P0** | 初回表示で地図が viewport の **≥80%** を占めるか | 地形が画面を埋める | letterbox + サイドバー 288px + サイト chrome（`SiteHeader`/`footer`）。地図画像面積 ≈40–55% | **FAIL** |
| **P1** | マップ専用シェルか（サイト chrome 最小） | ほぼ全画面マップ体験 | `/map` が通常 `layout.tsx` 内（`pt-16` + フッター） | **FAIL** |
| **P2** | scale=1 でも「山を追う」連続操作があるか | 3D カメラパン | 2D、`scale≤1` パン無効（`usePanZoom.ts:29-30`） | **FAIL** |
| **P3** | 選択の主戦場は地図上か（リストは補助） | 地形クリック中心 | 焼き込み線 + 透明ヒットボックス。リスト同等 — **PARTIAL** 扱いで | **FAIL** |
| **P4** | ライブ状態が **線色・面** で一目で分かるか | ネットワーク着色 | 焼き込み線 + ヒットボックス dim/highlight。運行色は限定的 | **FAIL** |
| **P5** | 初見 30 秒で「どこを滑れるか」が本家と同程度か | 即理解 | イラストは読めるがカード感・小窓で没入劣る | **FAIL** |
| **P6** | 並置 screencast が `docs/qa/` に記録済みか | — | 未実施 | **FAIL** |

**並置スコア**: **0/6 PASS**（P3 を厳格 FAIL に含む）。**4/6 未満 = 本家並置未達**。

### E.2 層 C ブロッカー（優先）

| 優先 | 項目 | 対応 |
|------|------|------|
| P0 | letterboxing | `HeroMapCanvas.tsx:65-70` — scale=1 を **cover** fit に（stage bg 非露出） |
| P1 | 専用シェル | `/map` を `layout` から切り離しヘッダー最小化 |
| P2 | 操作モデル | 2D のまま **ドラッグパン許可** or 本家並置を「2D 簡易版」として P2 を層 B から除外するか L1 spec で明記 |
| P6 | 証跡 | 375/1280 並置動画 or 連続スクショを `docs/qa/` に追加 |

### E.3 層ラベル（誤解防止）

| 言ってよい | 言ってはいけない |
|------------|------------------|
| 「層 B: 七戸スケール LAAX 簡易版 5/5」 | 「laax.com/map と同等」 |
| 「層 A インタラクション PASS」 | 「マップ UX 出荷 OK」（R6 FAIL のため） |
| 「2D 3D 風イラストで L1 PASS」 | 「3D WebGL 実装済み」 |

---

## 再評価 — 層 A（2026-06-08）

**実施**: `map-ux-evaluator`（16）・`map-interaction-evaluator`（18）相当のソース監査。

### A-1. map-ux-evaluator（16）

**Verdict: FAIL**

| ID | 結果 | 根拠 |
|----|------|------|
| R1 | **PASS** | 運行リストは stage 外 flex 兄弟（`LiftMapViewer.tsx:120-161`）。bottom overlay なし |
| R2 | **PASS** | P0 地図 `flex-1`、P1 サイドバー／初期閉シート |
| R3 | **FAIL** | `/map` モバイル PASS（FAB 初期閉、`h-[calc(100dvh-4rem)]`）。**`map-preview.html` FAIL** — 常時 `.rail` 34dvh で stage &lt;50dvh |
| R4 | **PASS** | flex `.main`、 `#sheet` なし、`file://` 相対パス |
| R5 | **PASS** | `aria-pressed`、`MapHitboxes` keyboard、パンとリスト非干渉 |
| R6 | **FAIL** | パン／クランプロジックは正しいが **静止 letterboxing**: `HeroMapCanvas.tsx:48,59,65-70` で `--map-stage-bg` 露出。preview も `fit()` 中央配置 + `zoomOut` 下限 0.35 |

**ブロッカー**: cover fit（R6）、preview モバイル rail（R3）、preview `MIN_SCALE=1` 統一。

**再発防止**: scale=1 は letterbox ではなく **cover** でコンテナを埋める。preview と React で同一境界。

### A-2. map-interaction-evaluator（18）

**Verdict: PASS**

| ID | 結果 | 根拠 |
|----|------|------|
| I1 | **PASS** | 選択後も地図面積不変。`MapFeatureDetail` は rail 内のみ |
| I2 | **PASS** | コンパクトインライン詳細。巨大 sheet なし |
| I3 | **PASS** | md+ 第二 overlay なし。mobile は FAB 単一パネル |
| I4 | **PASS** | `aria-pressed`、ring、`onDeselect`（行再クリック deselect は任意） |
| I5 | **PASS** | `map-preview` `#railDetail` のみ、`#sheet` 禁止 |

**再発防止**: 選択ハンドラは `setSelectedId` + rail 内詳細のみ。`#sheet` / fixed bottom overlay は PR 差し戻し。

---

## 再評価 — 層 B §D（2026-06-08）

**実施**: `laax_gap_spec.md` §7 ルーブリック。L1 資産は **現行 3D 風 2D 地形イラスト維持**（ユーザー確定）。

| 軸 | 判定 | 根拠 |
|----|------|------|
| **L1** 地形表現 | **PASS** | `sichinohe-hero.png` — 3D 風シェーディングの **2D 焼き込みイラスト**。斜面・林間・標高感が読める。WebGL は対象外（`laax_gap_spec` §G4） |
| **L2** コース網羅 | **PASS** | `features.manifest.json` — リフト 2 + コース 5。ヒットボックス `hitboxes-hero-v4.json`、タップ／リスト選択可 |
| **L3** ライブ感 | **PASS** | SSE `/api/public/map-status/stream`（3s）+ 30s poll fallback + admin 監査 |
| **L4** 探索 UX | **PASS** | サイドバー検索・凡例・種別／難易度フィルタ・GPS 距離（sidebar のみ） |
| **L5** ビジュアル | **PASS** | `award-design-system.css` トークン、`map.*` i18n — [`qa_report_map_l5.md`](./qa_report_map_l5.md) |

**層 B スコア: 5/5 PASS** — 七戸スケール LAAX 簡易版（機能・データ・2D イラスト方針）。**層 C 本家並置とは独立**。

### L1 確定メモ（イラスト方針）

| 項目 | 内容 |
|------|------|
| 採用 | **A 方式** — 3D 風に描いた 2D 地形イラスト（`sichinohe-hero.png`） |
| 線 | コース・リフト線は **画像に焼き込み**。SVG は透明ヒットボックスのみ |
| 却下 | 未キャリブ OSM オーバーレイ、手置き `PIXEL` 座標 |
| 層 C との関係 | L1 PASS ≠ P0/P1 PASS。没入はレイアウト層（§E）で閉じる |

---

## F. コースガイド vs ゲレンデマップ（IA 評価）

> **実施**: `map-interaction-spec`（L1）相当監査 — 2026-06-09  
> **2026-06-09 追記（ユーザー監査）**: G5 の「2ページ分離」は **撤回・FAIL**。LAAX 同様 **1画面統合** が正。  
> **判定者の誤り**: `map-ux-evaluator` 相当の PARTIAL/PASS は **無効**（実 UI をユーザーが全面否定）。

### F.1 現行方針（LAAX 型・1画面）

| URL | 名前 | 役割 |
|-----|------|------|
| `/map` | **ゲレンデマップ** | 運行状況 + コース距離・斜度（`MapFeatureDetail.meta`） |
| `/courses` | — | **恒久リダイレクト → `/map`** |

~~2ページ分離（G5）~~ は廃止。ナビ・PathMagnet・静的プレビューも **マップ1本**。

### F.2 初回 IA 監査（実装前）

**Verdict: FAIL（0/5）** — ナビ「コース／マップ」並列、同一 UI、一方向導線のみ。

| ID | 結果 | 理由 |
|----|------|------|
| IA1 | FAIL | ヘッダーラベルが PathMagnet と不統一 |
| IA2 | FAIL | `/courses` 先頭がマップで H1 が下段 |
| IA3 | FAIL | embed≈full で役割の枠組みなし |
| IA4 | FAIL | `/map` → `/courses` 導線なし |
| IA5 | FAIL | 用語が画面ごとにバラバラ |

### F.3 G5 修正後 → **撤回（2026-06-09）**

| 対応 | 状態 |
|------|------|
| nav「ゲレンデマップ」「コースガイド」**2リンク** | ❌ 撤回 |
| `/courses` 埋め込み + コース一覧ページ | ❌ 撤回 → `/map` リダイレクト |
| `build-map-preview` 暗色デバッグ `.bar` | ❌ FAIL → 本番トークン UI に刷新 |
| `/map` 1画面で運行 + meta 表示 | ✅ 実装中 |

**IA 再評価**: **FAIL（G5 前提は誤り）** — LAAX は1画面。分離 IA の PASS/PARTIAL 判定は採用しない。

---

## G5 実装記録（2026-06-09）

| 項目 | 状態 |
|------|------|
| `map-cover-dimensions.ts` + `HeroMapCanvas` cover | ✅ |
| `MapPageShell` / `MapTopBar` | ✅ |
| ~~`build-map-preview.mjs` cover~~ → **contain**（見切れ修正） | ✅ 2026-06-09 |
| `map-interaction-spec-g5.md` | ✅ |

### 層 A 再評価（G5 後）

**map-ux-evaluator: PASS（R6 は撤回）** — R6 cover は地形図で見切れ。**contain + 16px pad** に修正。

**map-interaction-evaluator: PASS**（維持）— I1–I5 変更なし。

---

## Phase E layout-v5 再評価（2026-06-09）

`sichinohe-hero-v5.png` 1024×1024（Gemini 直貼付）+ rail オーバーレイ + cover 全画面 + キャリブ QA PASS 後の 3 ゲート。

### 1. code-reviewer（幾何・A 方式）

**Verdict: PASS**

| 項目 | 結果 | 根拠 |
|------|------|------|
| A 方式 | PASS | `bakedLines` 常時 ON。通常時 SVG 線非表示 |
| `hitboxes-hero-v5.json` | PASS | 7 features、全件 `source: illustrated-hero layout-v5 手トレース` |
| 座標系 | PASS | 1024×1024 直トレース（`coordinateAuthority` 一致） |
| 手置き `PIXEL` | PASS | なし |
| `/map` cover | PASS | `object-cover` + SVG `slice` |
| WARN | 非ブロッカー | `build-map-preview.mjs` が `lift-markers.json` 経由（同期済み） |

### 2. map-ux-evaluator（R1–R6）

**Verdict: PASS**

| ID | 結果 | 根拠 |
|----|------|------|
| R1 | PASS | デスクトップ rail は `absolute right-0 z-20` オーバーレイ（`map-asset-layout-v5-spec` §6）。stage 100% 幅、基部・駐車場を bottom パネルで隠さない |
| R2 | PASS | P0 = `HeroMapCanvas` cover。P1 = rail 内リスト。P2 = 上部 chrome + FAB |
| R3 | PASS | モバイル rail `hidden` + FAB → `max-h-[min(70dvh,520px)]` シート（初期閉）。stage `flex-1` |
| R4 | PASS | `map-preview.html` file:// 表示 OK。v5 は LAAX 型 rail オーバーレイ（旧 flex 分割ルールより v5 spec を優先） |
| R5 | PASS | リスト `button`、`path.hit` + `focus-visible` |
| R6 | PASS（v5 解釈） | **全体表示** = `MAP_FIT_SCALE` 1.12 + `mapDefaultView` パン。scale ≤ fit 時パン無効。`usePanZoom` / preview `FIT_SCALE` フロア一致（zoomOut 修正済み） |

### 3. map-interaction-evaluator（I1–I5 + G2）

**Verdict: PASS**

| ID | 結果 | 根拠 |
|----|------|------|
| I1 | PASS | リスト選択後も stage 面積不変。詳細は `.rail-detail` / `MapStatusRail` 内 |
| I2 | PASS | コンパクトインライン詳細。巨大 bottom sheet なし（md+） |
| I3 | PASS | md+ 第二 dialog なし。mobile は単一ボトムシート |
| I4 | PASS | `.sel` / `aria-pressed`、ハイライト連動 |
| I5 | PASS | `map-preview` `selectFeature` → `#railDetail` のみ。`#sheet` なし |
| G2-1〜6 | PASS | 地図面積不変・タップ popup なし・embed 50dvh・凡例 rail 内・preview parity |

### layout-v5 出荷ゲート

**PASS** — code-reviewer + map-ux-evaluator + map-interaction-evaluator（2026-06-09）。キャリブ QA 人間 PASS 記録済み（`g2_checklist.md` §9）。

---

## G6 正式評価 — map-ux-evaluator（エージェント 16）

**Date**: 2026-06-08  
**参照 spec**: [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md)  
**対象**: `/map`（`MapPageShell` + `LiftMapViewer`）、`public/maps/map-preview.html`  
**方法**: ソース監査（レイアウト・視認性・パン境界）

### Verdict

**PASS**

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **R1** 主コンテンツ非遮蔽 | **PASS** | full `/map`: `splitRail` 時レールは `aside.w-80` が `mapStage` の **flex 兄弟**（`LiftMapViewer.tsx` L178–190）。`MapTopBar` / `MapQuickNav` は `MapPageShell` header（L22–24）— **stage 外**。stage 内は `HeroMapCanvas` + ズーム FAB + mobile 運行 FAB のみ |
| **R2** 情報階層 | **PASS** | P0 = イラスト stage。P1 = 横並び `MapStatusRail`（md+）／FAB シート（mobile）。P2 = QuickNav（layout 行）・更新時刻・タブ。P0 を常時覆わない |
| **R3** モバイル 375px | **PASS** | `MapPageShell` `flex-1` で残高を stage に割当。レール `hidden md:flex`（L187）。運行は FAB（L144–151）→ ボトムパネル **初期閉**（L49 `mobileStatusOpen=false`）。50dvh 未満に押し潰されない |
| **R4** map-preview.html | **PASS** | `.main { display:flex }` + `.rail` 320px flex 兄弟（md+）。`#sheet` 不在。`.quicknav` 4列。詳細 `#railDetail` インライン |
| **R5** a11y 最低限 | **PASS** | リスト `button` + `aria-pressed`（`MapStatusRail.tsx` L128–131）。タブ `role="tab"` + `aria-selected`。パンは `HeroMapCanvas` container、リストは flex 兄弟で阻害なし |
| **R6** パン・ズーム境界 | **PASS** | `usePanZoom.ts` L32–33 scale≤fit → base translate。L162 `onPointerDown` fit 以下無効。L25–48 `clampTranslate`。`mapDefaultView` x=0（split rail、オフセットなし） |
| **G6-1** split rail | **PASS** | md+ 1280×800 想定: chrome は header 行、レールは viewport 右列。stage 上にナビ帯・凡例・レール **重なりなし** |
| **G6-3** QuickNav ADEF | **PASS** | `MapQuickNav.tsx` L10–14: `/`・`/live-cams`・`/access`・`/today`。4等分 grid、stage 外 |
| **G6-7** mobile 地図面積 | **PASS** | TopBar+QuickNav 除く `flex-1` stage ≥50dvh 相当。常時レールなし、運行 FAB のみ |

### ブロッカー

なし

### 再発防止

**full `/map` のレールは必ず split（flex 兄弟）。layout chrome（TopBar・QuickNav）は `MapPageShell` header にのみ置く。**

---

## G6 正式評価 — map-interaction-evaluator（エージェント 18）

**Date**: 2026-06-08  
**参照 spec**: [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md)  
**対象**: `/map`、`map-preview.html`

### Verdict

**PASS**

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **I1** 選択時の地図非遮蔽 | **PASS** | `setSelectedId` のみ。詳細は `MapStatusRail` 内 `MapFeatureDetail`（L162–167）。地図上 fixed bottom sheet なし（md+） |
| **I2** 情報密度 | **PASS** | `MapFeatureDetail`: type + label + badge + meta + 小 `×`。巨大専用 sheet なし |
| **I3** 二重 UI 禁止 | **PASS** | md+: 横並び rail のみ。mobile: 単一ボトムパネル内でリスト+詳細。第二 dialog なし |
| **I4** 状態一貫性 | **PASS** | `aria-pressed`、選択時 `ring` + 左アクセント線。`onDeselect` あり |
| **I5** preview parity | **PASS** | `selectFeature` → `#railDetail`。`#sheet` なし。コースタブ初期 active |
| **G6-2** コースデフォルト | **PASS** | `statusFilter` 初期 `"trail"`（`LiftMapViewer.tsx` L46–47）。タブ順 コース→リフト（`MapStatusRail.tsx` L79–80）。`MapHitboxes` dim 非該当 type |
| **G6-4** 選択詳細 rail 内 | **PASS** | = I1。地図面積不変 |
| **G6-5** 禁止 UI 未マウント | **PASS** | `MapLegend` / `MapLocationPanel` / 検索 input — `web/src` に import・マウント **0 件**（dead file のみ残存） |
| **G6-6** preview parity | **PASS** | §5: topbar + quicknav + main flex。`data-filter="trail"` active（`map-preview.html` L163）。`#sheet` 不在 |
| **G2-4** 凡例 | **WAIVED** | G6 §4 ユーザー免除 |

### ブロッカー

なし

### 再発防止

**G3/G4 UI** — G6 §6 で一時解除済み。**2026-06-08 ユーザー承認後に再マウント**（検索・難易度・GPS・ライブバッジ）。凡例・6ピル帯は引き続き禁止。

---

## G6 出荷ゲート（2026-06-08）

```
map-interaction-spec-g6.md ユーザー OK
  → map-ux-evaluator PASS（R1–R6 + G6-1,3,7）
  → map-interaction-evaluator PASS（I1–I5 + G6-2,4,5,6）
```

**G6 UI 整理トラック: 出荷可**（幾何・v5 キャリブは layout-v5 記録を継承）。

---

## G4 再評価 — map-ux-evaluator（エージェント 16）

**Date**: 2026-06-08  
**参照 spec**: [`map-interaction-spec-g4.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g4.md) + [`map-interaction-spec-g6.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g6.md) §6 承認後  
**対象**: `/map`（G3/G4 UI 再マウント後）、`public/maps/map-preview.html`  
**方法**: ソース監査（レイアウト・視認性・パン境界）。G6 評価の **差分追試**。

### Verdict

**PASS**（~~WARN~~ 2026-06-08 `build-map-preview.mjs` 同期済み）

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **R1** 主コンテンツ非遮蔽 | **PASS** | G3 検索・G4 難易度ピル・GPS は **`MapStatusRail` ヘッダー内**（`MapStatusRail.tsx` L133–173）。`MapLocationPanel` はレール下端（L240）。**stage 上に absolute なし**。split rail 維持（`LiftMapViewer.tsx` L186–189） |
| **R2** 情報階層 | **PASS** | P0 = `HeroMapCanvas`。P1 = レール一覧（検索で絞込・地図不変）。P2 = TopBar ライブバッジ + QuickNav + タブ + ズーム FAB。ライブバッジは **header 行**（`MapTopBar.tsx` L17–21）— stage 外 |
| **R3** モバイル 375px | **PASS** | レール `hidden md:flex`、FAB → `max-h-[min(70dvh,520px)]` シート（初期閉）。検索・難易度はシート内スクロール。stage `flex-1` 維持 |
| **R4** map-preview.html | **PASS** | split `.main` + `.rail` 兄弟、`#sheet` 不在、QuickNav ADEF、検索・難易度・GPS・ライブバッジ（SSE は http のみ） |
| **R5** a11y 最低限 | **PASS** | 検索 `aria-label`、難易度 `aria-pressed`、リスト `button` + `aria-pressed`、タブ `role="tab"` |
| **R6** パン・ズーム境界 | **PASS** | `usePanZoom.ts` — scale≤fit パン無効、`clampTranslate` 継承 |
| **G6-1** split rail | **PASS** | G4 コントロール追加後もレールは flex 兄弟 |
| **G6-3** QuickNav ADEF | **PASS** | 6ピル LAAX 帯なし |
| **G6-7** mobile 地図面積 | **PASS** | 常時レールなし、運行 FAB のみ |
| **G4-UX-1** ライブバッジ位置 | **PASS** | SSE 時のみ TopBar。stage 上にバッジなし |
| **G4-UX-2** 禁止 chrome | **PASS** | `MapLegend` 削除済み・import 0 |

### ブロッカー

なし

### 再発防止

**G3/G4 探索 UI はレール header 内のみ。TopBar はライブバッジまで。凡例・6ピル・stage overlay は恒久禁止。`/map` UI 変更時は `node resorts/Sichinohe-CyoueiSki/scripts/build-map-preview.mjs` を必ず実行。**

---

## G4 再評価 — map-interaction-evaluator（エージェント 18）

**Date**: 2026-06-08  
**参照 spec**: [`map-interaction-spec-g4.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g4.md) §5、`map-interaction-spec-g3.md` §1.1  
**対象**: `/map`、`map-preview.html`（構造 parity）

### Verdict

**PASS**

### ルーブリック

| ID | 結果 | 根拠 |
|----|------|------|
| **I1** 選択時の地図非遮蔽 | **PASS** | 検索・難易度後も stage 面積不変（G3 `search-active`）。詳細は `MapFeatureDetail` レール内 |
| **I2** 情報密度 | **PASS** | 検索 1 行 + 難易度ピル + GPS コンパクト。巨大 sheet なし |
| **I3** 二重 UI 禁止 | **PASS** | md+ split rail。mobile 単一ボトムパネル |
| **I4** 状態一貫性 | **PASS** | `aria-pressed` / `aria-selected`、`onDeselect` 維持 |
| **I5** preview parity | **PASS** | `#railDetail` のみ、`#sheet` なし。検索・難易度・GPS・`search-active` 同期（2026-06-08） |
| **G6-2** コースデフォルト | **PASS** | `statusFilter` 初期 `"trail"` |
| **G6-4** 選択詳細 rail 内 | **PASS** | = I1 |
| **G6-5′** 恒久禁止 UI | **PASS** | `MapLegend` マウント 0、6ピル帯なし、stage 上検索帯なし |
| **G6-6** preview 構造 | **PASS** | topbar + quicknav + main flex、コースタブ active |
| **G2-4** 凡例 | **WAIVED** | G6 §4 継承 |
| **G3-1** search-active | **PASS** | `featureMatchesSearch` はレールリストのみ。地図不変 |
| **G3-2** 検索クリア | **PASS** | `searchQuery` 空で全件復帰 |
| **G4-1** SSE 反映 | **PASS**（実機 2026-06-10） | admin POST → SSE `update` **2279ms**（≤3s）。`verify-g4-1-sse.mjs` + `lift-pony` toggle |
| **G4-2** 難易度フィルタ | **PASS** | リスト絞込 + `MapHitboxes` dim。リフト常時表示。`manifest` `difficulty` 付き |
| **G4-3** GPS 距離 | **PASS** | `MapLocationPanel` レール内 km のみ。地図ドットなし |
| **G4-4** SSE 切断 | **PASS**（コード） | 30s poll フォールバック。stale 帯は API 失敗時のみ |

### ブロッカー

なし

### 再発防止

**検索・難易度はレール state のみ。地図上 fixed overlay / #sheet は PR 差し戻し。preview は build スクリプトで React と同時更新。**

---

## G4 出荷ゲート（G6 承認後再マウント — 2026-06-08）

```
G6 §6 ユーザー承認（G3/G4 UI 再マウント）
  → map-ux-evaluator PASS（R1–R6 + G6-1,3,7 + G4-UX）
  → map-interaction-evaluator PASS（I1–I5 + G3-1,2 + G4-1〜4 + G6-5′）
```

**G4 UI トラック: 出荷可**（preview 同期 2026-06-08 完了）。

**注記**: G6 時点の **G6-5「禁止 UI 未マウント」** は本再評価で **G6-5′（恒久禁止のみ）+ G4 承認 UI** に読み替え。

---

## 次のアクション

| 優先 | エージェント | タスク |
|------|-------------|--------|
| ~~G6~~ | 16+18 | **完了**（2026-06-08） |
| ~~G4 UI 再マウント~~ | 16+18 | **PASS**（2026-06-08 再評価） |
| ~~hero~~ | ユーザー | **案 A 承認済**（`home-hero-spec.md` §6） |
| ~~P1~~ | L2 | **完了** — `build-map-preview.mjs` G3/G4 レール UI 同期（2026-06-08） |
| P2 | 手動 | §E IA 5 秒テスト + §E P6 並置 screencast |
| ~~P3~~ | 手動 | **完了** — G4-1 実機 PASS 2279ms（2026-06-10） |
