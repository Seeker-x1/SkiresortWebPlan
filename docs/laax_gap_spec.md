# LAAX ギャップ仕様 — 七戸町営スキー場マップ

> **L1 体験仕様** | 2026-06-07  
> 入力: `docs/qa_report_map.md` §D、`docs/ROADMAP_LIFT_MAP_VISUAL_FIRST.md`  
> 参照ベンチマーク: [LAAX ゲレンデマップ](https://www.laax.com/en/map) 系（**コピー禁止・体験分解のみ**）  
> **コード禁止。** 実装前に本 spec + `map-interaction-spec` を承認すること。

---

## 0. 目的とスコープ

| 項目 | 内容 |
|------|------|
| 何を定義するか | LAAX 級体験との **ギャップ（L1–L5）** をフェーズ（G1–G4）ごとに閉じる条件 |
| 対象 | `resorts/Sichinohe-CyoueiSki/web/` の `/map`、`/courses` 埋め込み、ルートテンプレからの導線 |
| 対象外 | LAAX の WebGL エンジン複製、全世界リゾート 3D、Liftopia 連携 |
| 現在地 | **G1 ビジュアル MVP**（16/18 UX・操作ゲートは PASS、LAAX ベンチマークは未達） |

**出荷の言い方**

| ゲート | 意味 |
|--------|------|
| **マップ UX 出荷** | map-ux-evaluator R1–R6 + map-interaction-evaluator I1–I5 PASS（**現状クリア**） |
| **LAAX 級体験（層 B）** | 本 spec の **L1–L5 が当該フェーズで 4/5 以上 PASS**（G4 完了時） |
| **LAAX 本家並置（層 C）** | `qa_report_map.md` §E **P0–P6 が 4/6 以上 PASS**（[laax.com/map](https://www.laax.com/map) 並置） |

---

## 1. LAAX 体験分解（ベンチマーク）

LAAX から **盗む体験**（見た目のコピーではない）:

| # | LAAX にあること | 七戸での翻訳 |
|---|----------------|-------------|
| B1 | **地形が主役** — 斜面のうねりが一目で分かる | DEM 拘束イラスト or 検証済み 3D（`ELEVATION_ILLUSTRATION_MODEL.md`） |
| B2 | **全ネットワーク** — リフト・コースが色分けで選べる | `features.manifest` + 全リフト/公開コース SVG ヒットボックス |
| B3 | **ライブ on map** — 色・状態が地図上で即わかる | `map-status` → 線色・バッジ・サイドバー同期 |
| B4 | **探索** — 検索・フィルタ・凡例・（任意）現在地 | 種別フィルタ → 検索 → 凡例固定表示（GPS は G4+） |
| B5 | **ブランド完成度** — タイポ・余白・一貫トークン | ルート `Alpine Clarity+` 七戸パレットと `/map` 統一 |

---

## 2. ギャップマトリクス（L1–L5）

| ID | 軸 | LAAX 水準 | 現状（2026-06-07） | 判定 | 閉じるフェーズ |
|----|-----|-----------|-------------------|------|----------------|
| **L1** | 3D・地形表現 | WebGL / 3D 地形、没入斜面 | **3D 風 2D 焼き込みイラスト**（`sichinohe-hero.png`）+ パンズーム | **PASS**（2D） | **G2** 確定 2026-06-08 |
| **L2** | コース網羅 | 全リフト・全コース選択可能 | リフト SVG 一部、runs 未整備 | **FAIL** | **G2** |
| **L3** | ライブ感 | 地図上で即時色・状態 | API モック・更新ラベルあり | **PARTIAL** | **G3** |
| **L4** | 探索 UX | 検索・凡例・フィルタ | リフト/コースピルのみ | **FAIL** | **G3–G4** |
| **L5** | ビジュアル完成度 | ブランド級 UI | ダーク utilitarian、トップと別世界 | **FAIL** | **G2**（トークン統一） |

**ロードマップ対応**: [ROADMAP_LIFT_MAP_VISUAL_FIRST.md](./ROADMAP_LIFT_MAP_VISUAL_FIRST.md) の G1→G4 と **1:1**。

---

## 3. フェーズ別ターゲット（何を足すか）

### G1（現状維持・ベースライン）

**すでにあるもの**

- `/map` 2D、`HeroMapCanvas`、R6 パン境界
- サイドバー + インライン詳細（sheet 禁止）
- モック `map-status`、リフトフィルタピル

**G1 の LAAX スコア**: L3 PARTIAL のみ。L1/L2/L4/L5 = FAIL。**関係者デモ用。LAAX 級ではない。**

---

### G2 — プロダクト MVP（LAAX 簡易版の核）

**目標**: 「ゲレンデの全体像が読める」マップ。LAAX の **B2 + B5 の最小セット**。

#### G2 イラスト方針（確定 2026-06-07）

| 項目 | 内容 |
|------|------|
| **選択** | **A: イラスト SVG**（ユーザー確定） |
| 却下 | C（イラスト底 + OSM オーバーレイ）— G3/G4 で再検討可 |
| 主役ビジュアル | 1 枚のゲレンデイラスト（DEM 拘束パイプライン / 権利済み公式 / skimap トレース） |
| リフト・コース線 | **イラスト上に焼き込み**、または同一座標系の SVG パス。`lift-map-no-fake-overlays` 準拠 |
| インタラクション | 透明ヒットボックス（`data-feature-id`）のみ。未キャリブの OSM 線を本番 `/map` に重ねない |
| OSM の役割 | `lifts.geojson` / `runs.geojson` は **source 付きマスタ**とキャリブ参考。C 方式の投影オーバーレイは使わない |

| 成果物 | 仕様 |
|--------|------|
| イラスト本番 | `ELEVATION_ILLUSTRATION_MODEL` L1 拘束 + L2 スタイル v1、または権利済み公式/skimap トレース SVG（**A 方式**） |
| 幾何 | 全リフト path + 公開コース `runs.geojson`（各 `source` 必須） |
| feature-id | `features.manifest.json` — id / 種別 / 表示名 / status キー統一 |
| `/courses` | 先頭に `LiftMapViewer` 埋め込み（ヒーロー高さ、**地図が主役**） |
| トークン | `/map` をルート `--alpine` / `--alpine-dark` / `--canvas` に接続（`#0c1220` 単色卒業） |
| 凡例 | サイドバー上部 or 地図外固定（**stage 内 bottom overlay 禁止**） |

**G2 完了時の LAAX 判定目標**

| ID | 目標 |
|----|------|
| L2 | **PASS** — 公式本数のリフト・公開コースがタップ/リスト選択可 |
| L5 | **PASS** — トークン・タイポがトップと同系統 |
| L1 | **PARTIAL** — 2D イラストでも地形のうねりが読める（3D 不要） |
| L3 | **PASS** — モックでも色が地図線に反映 |
| L4 | **FAIL 許容** — フィルタピルのみ継続 |

**受け入れ基準（Given/When/Then）**

1. **Given** 公式に載る全リフトが manifest にある **When** ユーザーがリストで選択 **Then** サイドバー詳細 + 地図上ハイライト（第二 overlay なし）
2. **Given** `/courses` を開く **When** 初期表示 **Then** ビューポート上部 50% 以上がマップで、リストが地図を常時 50% 未満にしない
3. **Given** イラスト SVG **When** `calibration-qa` または目視 QA **Then** リフト端点 ±20px（キャリブレーション済み画像の場合）

**エージェント**

```
map-interaction-spec（G2 状態追記）✅
  → map-ui-implementer
    → map-ux-evaluator + map-interaction-evaluator
    → code-reviewer（幾何・source）
```

**G2 インタラクション spec**: [`resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md`](../resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md)（2026-06-07）

---

### G3 — 運用っぽい見え方（LAAX の B3 + B4 前半）

**目標**: 現場が更新した色が変わる。探索の最低限。

| 成果物 | 仕様 |
|--------|------|
| ステータス | `status.json` 手編集 or 最小 admin トグル → `/api/public/map-status` |
| 地図反映 | 停止 = グレー/ハッチ、運行 = 種別色（凡例と一致） |
| 更新表示 | ヘッダー「最終更新」+ 手動リフレッシュ（既存を本番データに） |
| 検索 | サイドバー内テキストフィルタ（リフト名・コース名、**地図上モーダル禁止**） |
| 凡例 | 稼働/停止/確認中 — 常時表示（折りたたみ可、初期開） |
| i18n | `messages` 化（map 艦隊 + `resort-i18n-spec` 連携） |

**G3 完了時の LAAX 判定目標**: **L1–L4 の 4/5 PASS**（L1 は 2D イラストで PASS 可。3D 必須ではない）

**状態遷移（追記）**

| 状態 | 地図 | サイドバー | 遷移 |
|------|------|------------|------|
| `search-active` | 変化なし | リストがクエリで絞り込み | 検索入力 |
| `status-stale` | 変化なし | ヘッダーに「更新失敗」帯 | API エラー |

**禁止（G3 でも継続）**

- リスト選択で fixed bottom sheet
- 根拠なき `overlay-paths.json` 手置き
- 絵文字フィルタアイコン（SVG + ラベル）

---

### G4 — リアルタイム（LAAX に近い運用感）

**目標**: 数十秒以内の反映。探索の完成。

| 成果物 | 仕様 |
|--------|------|
| API | 本番 `map-status`（DB or ファイルウォッチ）、監査ログ |
| 更新 | 30–60s ポーリング or SSE（仕様は `resort-live-status-spec` と整合） |
| L4 追加 | 現在地（任意・屋外 GPS 許諾時のみ）、コース難易度フィルタ |
| L1 オプション | 3D/WebGL は **別プロジェクト判断** — 2D イラスト本番で L1 PASS なら G4 出荷可 |

**G4 完了時**: **L1–L5 の 4/5 以上 PASS** = **「LAAX 級（七戸スケール）」** と呼んでよい。

---

## 4. インタラクション原則（全フェーズ共通）

`agents/17-map-interaction-spec.prompt.md` を **上書きしない** 追記:

| 原則 | LAAX との差 |
|------|-------------|
| P0 = 地図常時表示 | LAAX も地図主役。七戸は **sidebar + inline detail** で同等の P0 を維持 |
| 選択 | リスト or 地図タップ → **サイドバー内詳細のみ** |
| 検索（G3+） | サイドバー内。全画面検索モーダル禁止 |
| ズーム | R6 準拠。scale=1 パン無効、scale>1 クランプ |
| モバイル | FAB → 単一シート（初期閉）。選択で第二 overlay 禁止 |

---

## 5. データ・幾何契約（L2 閉じるための必須）

| ファイル | 役割 | ゲート |
|----------|------|--------|
| `web/data/map/features.manifest.json` | id ↔ 名称 ↔ lift/trail | G2 必須 |
| `web/data/map/lifts.geojson` | リフト線（source 付き） | G2 全本数 |
| `web/data/map/runs.geojson` | コース線（source 付き） | G2 公開分 |
| `web/public/maps/*.svg` or 焼き込み PNG | 主役ビジュアル | G2、`lift-map-no-fake-overlays` |
| `web/data/map/status.json` | 手運用ステータス | G3 |

**合格条件**: 各 feature に `source`（OSM way / skimap / 現地 / 公式）が無い PR は **code-reviewer FAIL**。

---

## 6. ビジュアル統合（L5）

| 要素 | ルートテンプレ | `/map` G2 以降 |
|------|----------------|----------------|
| 背景 | `--canvas` #F7F9FB | ステージ: `--alpine-dark` または `--canvas` 切替テーマ |
| アクセント | `--alpine` #2D6B7A | リフト線・FAB・バッジ |
| フォント | Syne + Noto | 見出し Syne、数値 IBM Plex Mono |
| ヘッダー | ライト glass | 地図上は **半透明 + トークン一致**（絵文字禁止） |

**成果物**: `docs/map_integration_spec.md`（`resort-map-bridge`）にトークン表を書き、map-ui-implementer が実装。

---

## 7. 評価ルーブリック（L3 エージェント拡張）

`docs/qa_report_map.md` §D を本番運用する。各リリースで記録。

| ID | PASS 条件（要約） |
|----|------------------|
| **L1** | 斜面のうねり・林間が **2D でも** 読める。**3D 風シェーディングの 2D 焼き込みイラスト可**（WebGL は G4 オプション） |
| **L2** | manifest の全リフト + 公開コースが選択可 |
| **L3** | ステータス変更が **10 秒以内**に線色/バッジに反映（G3+） |
| **L4** | 検索 + 凡例 + 種別フィルタがサイドバー/地図外で完結 |
| **L5** | トップと `/map` のトークン・タイポ一致、絵文字なし |

**判定**: フェーズ完了ごとに表を更新。G4 で 4/5 以上で **LAAX 級** と宣言。

---

## 8. 優先順位（実装キュー）

| 順 | タスク | フェーズ | エージェント |
|----|--------|----------|-------------|
| 1 | イラスト本番 SVG + feature-id | G2 | デザイン + map-ui-implementer + code-reviewer |
| 2 | runs.geojson + 全リフト幾何 | G2 | 06 + code-reviewer |
| 3 | `/courses` 埋め込み | G2 | map-interaction-spec → map-ui-implementer |
| 4 | マップトークン統一 | G2 | resort-map-bridge → map-ui-implementer |
| 5 | status.json 手運用 | G3 | 02 + map-ui-implementer |
| 6 | サイドバー検索 + 凡例常時 | G3 | map-interaction-spec → 19 |
| 7 | map i18n | G3 | resort-i18n-spec |
| 8 | 本番 API + SSE | G4 | 02 + 06 |

**やらないこと（G4 まで）**

- Mapbox 3D を品質目標に据える（`ROADMAP` 方針と矛盾）
- LAAX UI のピクセルコピー
- 未キャリブ SVG を `/map` に載せる

---

## 9. 関連ドキュメント

| ドキュメント | 関係 |
|-------------|------|
| [ROADMAP_LIFT_MAP_VISUAL_FIRST.md](./ROADMAP_LIFT_MAP_VISUAL_FIRST.md) | G0–G4 マイルストーン |
| [ELEVATION_ILLUSTRATION_MODEL.md](./ELEVATION_ILLUSTRATION_MODEL.md) | L1 地形真理層 |
| [UNIVERSAL_RESORT_MAP_SYSTEM_REQUIREMENTS.md](./UNIVERSAL_RESORT_MAP_SYSTEM_REQUIREMENTS.md) | データ変数 |
| [qa_report_map.md](./qa_report_map.md) §D | 初回ギャップ監査 |
| `resorts/Sichinohe-CyoueiSki/agents/17-map-interaction-spec.prompt.md` | 操作の正 |

---

## 10. 次のアクション

```
1. ~~map-interaction-spec — G2 状態遷移~~ ✅ `resorts/Sichinohe-CyoueiSki/docs/map-interaction-spec-g2.md`
2. resort-map-bridge — トークン統合 spec（L5）
3. イラスト制作 — DEM/skimap トレース → SVG + feature-id（A 方式）
4. map-ui-implementer — G2 チェックリストのみ実装（spec 承認済み・幾何準備後）
5. 再評価 — qa_report_map.md §D 更新
```

**G2 イラスト方針**: **A（イラスト SVG）確定**（2026-06-07）。
