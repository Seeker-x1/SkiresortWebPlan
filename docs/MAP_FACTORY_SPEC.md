# Map Factory — ゲレンデ名 → 七戸レベルコースマップ

> **層**: L1（仕様のみ・コード禁止）  
> **目的**: ゲレンデ名を入力したとき、**七戸町営スキー場 `/map` と同等品質**のコース／リフトマップを再現可能な手順で出荷する工場を定義する。  
> **非目的**: LP Factory の模式図（`docs/mock-assets/data/maps/{id}.json`）や、AI背景に後付けした推測 SVG 線の量産。  
> **参照実装**: `resorts/Sichinohe-CyoueiSki/web/`（本番マップ）  
> **品質ゲート**: [`.cursor/rules/lift-map-no-fake-overlays.mdc`](../.cursor/rules/lift-map-no-fake-overlays.mdc) · [`hero-illustration-style.mdc`](../resorts/Sichinohe-CyoueiSki/.cursor/rules/hero-illustration-style.mdc)  
> **関連**: [LP_FACTORY_PROCEDURE.md](./mock-assets/LP_FACTORY_PROCEDURE.md)（別パイプライン） · [AREA_MAP_FACTORY_SPEC.md](./mock-assets/AREA_MAP_FACTORY_SPEC.md)（周辺施設マップ・別物）

---

## 0. 一言の方針

> **根拠のある線だけを真実にし、絵はその線に従わせる（または線を絵に焼き込む）。**  
> ゲレンデ名だけでは出荷しない。名前のあとに **根拠幾何の取得 → 人のキャリブ／hero 確定 → 投影と QA** まで通ったものだけを七戸レベルと呼ぶ。

---

## 1. スコープと非スコープ

### 1.1 スコープ（Map Factory が作るもの）

| 成果物 | 説明 |
|--------|------|
| 校正済み hero 画像 | コース／リフトの見た目が焼き込み、または投影根拠と一致 |
| ヒットボックス | インタラクション用 SVG path（透明または細い投影線。glow 禁止） |
| 地物メタデータ | id / 名称 / 難易度 / リフト種別 / `source` |
| 変換パラメータ | bbox または 3点以上アフィン（`camera.json` / `control-points`） |
| QA 証跡 | `calibration-qa` 結果・目視 OK 記録 |
| 出荷ゲート通過フラグ | 下記 DoD をすべて満たしたものだけ `/map` 相当に載せる |

### 1.2 非スコープ（別システム）

| 対象 | 理由 |
|------|------|
| LP Factory の `map.html?resort={id}` 模式図 | 位相模式・非ジオ参照。マーケ LP 用 |
| Antigravity 系「AI背景 + 手置き path」 | 座標系なし。出荷禁止パターン |
| 運行ステータスのセンサー自動取得 | 編集（admin）入力。マップ幾何とは分離 |
| ルート `src/` 汎用テンプレの見た目リデザイン | UI 艦隊（resort-* / map-*）の管轄 |

### 1.3 品質の定義（「七戸レベル」）

次をすべて満たすこと。

1. 各リフト／コースに **検証可能な `source`** がある（OSM way ID / skimap / 公式図 / 現地確定トレースのいずれか）
2. ベース画像が **GSI正射 / Earth Studio 実写 / 焼き込みイラスト** のいずれか（未キャリブ AI 絵のみは不可）
3. 端点が `calibration-qa` で **±20px 以内**
4. 見た目のコース線が **根拠幾何と一致**（後付け推測 path ではない）
5. 人が **目視 OK** を記録している
6. 太い角丸・発光グローターの SVG 線を「マップ表現」として使っていない

---

## 2. Definition of Done

新規施設 `{id}` は、次がすべて YES のときのみ「Map Factory 完了」。

| # | 完了条件 | 確認 |
|---|----------|------|
| M1 | `sources.md`（または同等）に座標・OSM/skimap/公式図・参照画像が記載 | 文書レビュー |
| M2 | `lifts.geojson` / `trails.geojson`（または hitboxes + manifest）の各 feature に `source` | スキーマ検証 |
| M3 | 参照画像（Earth Studio または GSI）がリポジトリ内に存在し、ユーザー非表示用途が明記 | ファイル存在 |
| M4 | control points ≥ 3、または GSI bbox 線形投影が定義済み | JSON 検証 |
| M5 | hero 本番画像が確定（焼き込み or 投影一致） | manifest `heroImage` |
| M6 | hitboxes が hero 座標系で存在し、QA ±20px | `calibration-qa.html` |
| M7 | 人の目視 OK が記録されている | `signoff` フィールドまたは PR コメント |
| M8 | 出荷ゲートスクリプトが exit 0 | `map:validate --id {id}`（実装後） |

**「名前で GeoJSON が取れた」「きれいな絵ができた」だけでは未完了。**

---

## 3. 標準パイプライン（順序固定）

```
Step 0   入力: ゲレンデ名（必須）[+ 任意: 公式URL / skimap ID / 緯度経度]
Step 1   解決: 名前 → {id, center, bbox 候補}
Step 2   根拠取得（自動）: OSM / OpenSkiMap / skimap 参照
Step 3   参照画像（半自動）: GSI正射 or Earth Studio 書き出し
Step 4   Human Gate A: control points ≥ 3 をクリック確定
Step 5   Human Gate B: hero 確定（焼き込みイラスト or 校正済み実写）
Step 6   投影・ヒットボックス生成（自動）
Step 7   QA（自動 + 人目視）: calibration-qa ±20px
Step 8   メタ配線: features.manifest / status 枠 / i18n ラベル
Step 9   出荷ゲート: validate 全通 → /map 相当にのみ公開
```

順序を飛ばさない。特に **Step 4・5 を自動でスキップして出荷することを禁止**する。

---

## 4. 入出力契約

### 4.1 CLI（目標インターフェース）

```bash
# 調査・根拠取得まで（自動）
npm run map:research -- --name "七戸町営スキー場"
# または
npm run map:research -- --id sichinohe

# キャリブ UI を開く（Human Gate A）
npm run map:calibrate -- --id sichinohe

# hero 取り込み + hitbox 同期（Human Gate B のあと）
npm run map:ingest-hero -- --id sichinohe --file path/to/hero.png

# 投影・プレビュー・QA
npm run map:build -- --id sichinohe
npm run map:validate -- --id sichinohe
```

実装初期は七戸既存スクリプト（`resorts/Sichinohe-CyoueiSki/scripts/*.mjs`）をこの契約にラップしてよい。新規施設は `resorts/{ResortDir}/` または共有 `maps/{id}/` のどちらかに置くが、**データスキーマは共通**とする。

### 4.2 ディレクトリ配置（推奨）

施設ごと:

```
resorts/{ResortDir}/
  web/
    data/map/
      sources.md                 # 根拠の人間可読まとめ（必須）
      camera.json                # Earth Studio 使用時
      control-points-*.json      # Human Gate A 成果
      lifts.geojson
      trails.geojson
      features.manifest.json
      hitboxes-hero.json
      status.json                # 運行枠（初期はすべて unknown/closed 可）
      signoff.json               # 目視 OK・日時・担当
    public/maps/
      {id}-hero.png              # 本番（ユーザー表示）
      {id}-hero-earthstudio.png  # 参照のみ・非表示
      {id}-hero-gsi.png          # 参照のみ・非表示（使う場合）
      calibration-qa.html
      trace-hitboxes.html
```

LP mock の `docs/mock-assets/data/maps/{id}.json` とは**同期しない**（別品質帯）。

### 4.3 `sources.md` 必須項目

| 項目 | 例 |
|------|-----|
| 中心座標 | lat/lng + 出典（OpenSkiMap 等） |
| リフト | OSM way ID 一覧 |
| コース | OSM way ID または公式図トレース由来の説明 |
| 参照地図 | skimap URL / 公式PDF |
| 地理基準 | Earth Studio / GSI のどちらかとファイル名 |
| ライセンス | ODbL 等の表示義務メモ |

### 4.4 GeoJSON feature 必須プロパティ

```json
{
  "type": "Feature",
  "properties": {
    "id": "lift-pair",
    "kind": "lift",
    "label_ja": "ペアリフト",
    "label_en": "Pair Lift",
    "difficulty": null,
    "source": {
      "type": "osm",
      "id": "way/631879096",
      "retrieved_at": "2026-07-18"
    }
  },
  "geometry": { "type": "LineString", "coordinates": [[lng, lat], ...] }
}
```

| `source.type` | 意味 | 出荷可否 |
|---------------|------|----------|
| `osm` | OSM way/node | 可（ID必須） |
| `skimap` | skimap 図からのトレース | 可（URL + トレース日） |
| `official` | 公式図・現地確定 | 可（文書リンク） |
| `derived` | 上記から投影・変換のみ | 可（親 source を明記） |
| `ai_guess` / 欠落 | 推測 | **不可** |

### 4.5 `signoff.json`

```json
{
  "id": "sichinohe",
  "calibration_qa": "pass",
  "endpoint_tolerance_px": 20,
  "visual_ok": true,
  "approved_by": "human",
  "approved_at": "2026-07-18T12:00:00+09:00",
  "notes": "pair lift endpoints match earthstudio ±12px"
}
```

`visual_ok: true` なしでは Step 9 を通さない。

---

## 5. 画像ソース別の許可ルート

リポジトリルールと同型。工場はここで分岐する。

| 画像種別 | 線の根拠 | 合格条件 | Human Gate |
|----------|----------|----------|------------|
| **A. GSI正射** | GeoJSON を bbox 線形投影 | 端点 ±20px | 主に bbox確認（点クリックは補助） |
| **B. Earth Studio / 斜め実写** | `camera.json` + control points ≥ 3 のアフィン以上 | 端点 ±20px、可能なら skimap 50%重ね | **Gate A 必須** |
| **C. イラスト** | **線は画像に焼き込み済み**。SVG は透明ヒットのみ | ヒットが焼き込み線に沿う ±20px | **Gate B 必須**（絵の確定） |
| **D. 未キャリブ AI 絵 + 後付け path** | なし | — | **禁止・出荷不可** |

### 5.1 禁止パターン（再掲）

1. 手置きピクセル座標（`PIXEL = { ... }` や LLM が当てた `M x,y C ...`）を本番線とする  
2. 2点相似変換だけでコース全体を投影する  
3. 太い角丸・発光グロー SVG をマップ表現として採用する  
4. 根拠のない幾何を `overlay-paths.json` / `trails.geojson` に書く  
5. AI にゲレンデ全体を描かせ、コース位置が公式とずれたものを「あとから path で直す」

### 5.2 イラスト路線（Route C）の正しい手順

1. レイアウト根拠（公式図トレース / 校正済み実写投影）を固定  
2. コース・リフト線はそのレイアウトに従って **画像内に焼き込み**  
3. AI は **余白（空・林・雪原）のみ** 可。コース領域の再生成禁止  
4. ヒットボックスは次のいずれか  
   - **推奨:** `npm run map:extract-lines -- --id {id}` で色マスク抽出 → `assign-hitboxes.html` で cand→地物を紐づけのみ人手  
   - フォールバック: `trace-hitboxes.html` で全線手トレース  
5. SVG の見える太線コースは使わない（ヒットは透明）

色クラスは **施設ごとの `data/palette.json`** に置く（札幌国際の例: 黒/赤/緑/青破線。橙はアイコンなので lift にしない）。  
前処理: morph-close（破線）→ 成分ごと骨格化 → 分岐でセグメント分割。  
抽出結果は **候補** であり、地物IDへの割当と目視 signoff なしでは出荷しない。

### 5.3 色抽出の汎用性（どこまで効くか）

**結論: 色抽出は「全国共通アルゴリズム」ではない。Route C の省力化レイヤであり、施設ごとにパレット校正が必要。**

| 層 | 全国共通か | 内容 |
|----|------------|------|
| **幾何の正本** | ○（方式は共通） | OSM / 公式図トレース / 現地 — `source` 必須 |
| **投影・QA・signoff** | ○ | transform / ±20px / Human Gates |
| **色→候補ポリライン** | ✕（施設ごと） | `palette.json` の色・破線幅・除外色 |
| **cand→地物の紐づけ UI** | ○ | 操作は共通、候補はパレット依存 |

公式イラストの「書き方」は施設ごとに違う。

| ばらつき | 例 | 対応 |
|----------|-----|------|
| 難易度色 | 黒/赤/緑 とは限らない（青=上級、数字ラベルのみ等） | 施設で `palette.json` をサンプリング |
| リフト表現 | 青破線 / 黒実線 / アイコン列のみ / 線なし | パレット or 手トレースフォールバック |
| 破線ピッチ | ギャップ 3px〜20px | `closeR` を施設ごとに調整 |
| 塗りとの混同 | 禁止エリアの薄い青、影、アンチエイリアス | exclude 条件・彩度下限 |
| 並列同色 | 赤が2本密着 | 骨格分岐 + 人手で別 cand を別地物へ |
| 線が絵に無い | 模式図・写真のみ | **色抽出不可** → Route A/B または手トレース |

**汎用に寄せる正しい投資順**

1. まず Route A/B（OSM + 正射/Earth）で幾何を取る — 色に依存しない  
2. Route C が必要な施設だけ、公式図から **5分パレット校正**（数点クリックで RGB サンプル → `palette.json`）  
3. 色抽出が崩れる施設は、最初から `trace-hitboxes.html`（手トレース）に落とす  

「ゲレンデ名だけ入れれば全国の公式イラストから線が取れる」は **目指さない**。  
目指すのは「名前 → 根拠幾何取得は共通 / イラスト省力化はパレット付きオプション」。

---

## 6. Human Gates（省略不可）

### 6.1 Gate A — キャリブレーション

| 項目 | 内容 |
|------|------|
| 誰が | 人（エージェント不可で「完了」扱いしない） |
| 何を | 参照画像と hero／作業画像の対応点を **3点以上** |
| 推奨点 | リフト下駅・上駅・明確な地形角・建物隅 |
| UI | `calibration` ページ（クリックで JSON 書き出し） |
| 完了条件 | 再投影プレビューで主要端点が目視一致 |

### 6.2 Gate B — hero 確定

| 項目 | 内容 |
|------|------|
| 誰が | 人（デザイン／運営） |
| 何を | 本番表示する1枚の確定 |
| Route A/B | 実写／正射をそのまま、または軽微な色調整のみ |
| Route C | 焼き込み済みイラスト。コース幾何を AI に再発明させない |
| 完了条件 | manifest の `heroImage` がこのファイルを指し、以後のヒットはこれ基準 |

### 6.3 Gate C — 目視サインオフ

| 項目 | 内容 |
|------|------|
| 誰が | 人 |
| 何を | `calibration-qa` + 実機 `/map` 相当プレビュー |
| 完了条件 | `signoff.json` の `visual_ok: true` |

---

## 7. 自動工程の仕様

### 7.1 Step 1 — 名前解決

入力: `--name` または `--id`

出力:

```json
{
  "id": "sichinohe",
  "name_ja": "七戸町営スキー場",
  "name_en": "Sichinohe Municipal Ski Area",
  "center": { "lat": 40.69839, "lng": 141.099714 },
  "center_source": "openskimap",
  "candidates": []
}
```

曖昧な場合は候補一覧を出し、**人に1つ選ばせてから** Step 2 へ進む（勝手に最尤で出荷しない）。

### 7.2 Step 2 — 根拠幾何の取得

| ソース | 取得対象 |
|--------|----------|
| Overpass / OSM | `aerialway=*`、`piste:type=*` |
| OpenSkiMap | ski area center、run 参照 |
| skimap.org | 参照パンフレット画像（幾何の補助・人間確認用） |

最低要件:

- リフトが **1本以上** `source.type=osm` で取れる、または  
- 公式図／skimap からの **人によるトレース計画**が `sources.md` に書かれている  

リフト0・コース0のまま Step 3 以降へ進むことを禁止する。

### 7.3 Step 3 — 参照画像

優先順:

1. 既存の校正済み参照（施設に既にある場合）  
2. Earth Studio（カメラURLを人が貼る → スクリプトが footage 取り込み）  
3. GSI 正射（bbox が取れる場合）

Earth Studio のカメラ合わせ自体は **人の作業**（工場は URL パースと保存を自動化）。

### 7.4 Step 6 — 投影とヒットボックス

| 入力 | 処理 | 出力 |
|------|------|------|
| GeoJSON + bbox | 線形投影 | 画像座標 path |
| GeoJSON + control points ≥ 3 | アフィン（またはそれ以上） | 画像座標 path |
| 焼き込み hero | トレース UI / 色マスク抽出 | `hitboxes-hero.json` |

ヒットボックス生成後は必ず Step 7 へ。プレビューだけ見て出荷しない。

### 7.5 Step 7 — QA

自動チェック:

- 全 feature に `source` あり  
- control points 数 ≥ 3（Route B）または bbox 定義（Route A）  
- 端点誤差の計測が可能ならレポート出力  
- glow / 手置き PIXEL パターンの静的禁止（検出できれば fail）

人チェック:

- `calibration-qa.html` で端点確認  
- 公式図または skimap との大まかな一致  

### 7.6 Step 9 — 出荷ゲート

`map:validate` が fail なら:

- `/map` 本番に載せない  
- guides の「校正済みマップ」扱いにもしない  
- LP 模式図へのフォールバックは可だが、**同一品質と表記しない**

---

## 8. インタラクションと見た目（マップ UI）

幾何工場の出力を表示する UI は既存の map 艦隊に従う。

| 層 | 担当 | 成果 |
|----|------|------|
| L1 | `map-interaction-spec` | 状態遷移 |
| L2 | `map-ui-implementer` | 実装 |
| L3 | `map-ux-evaluator` + `map-interaction-evaluator` | PASS/FAIL |

工場が保証するのは **データの正しさ**。UI の合格は別ゲート。  
リスト選択で地図上に bottom sheet を出す等の禁止は既存ルールに従う。

表示ルール（データ側）:

- イラスト Route C: 見えるコース線は hero 焼き込み。SVG はヒット用  
- 実写 Route A/B: 細い投影 SVG は可。glow・極太・角丸「落書き線」は不可  
- ラベルは manifest / i18n。画像内の偽ラベル焼き込みは最小限

---

## 9. LP Factory との関係

| | Map Factory（本書） | LP Factory map |
|--|---------------------|----------------|
| URL例 | 施設 `/map`、将来の校正済みビューア | `guides.../map.html?resort={id}` |
| 線の性格 | ジオ参照・根拠付き | 位相模式・手置き可（ただし「模式」と割り切る） |
| 入力 | 名前 + 根拠取得 + Human Gates | brief + 手書き path 文字列 |
| 七戸 | 参照実装そのもの | mock は手同期・ジェネレータ除外 |

同一 `{id}` でも **模式図ジェネレータと校正データを混ぜない**。

### 9.1 LP への昇格手順（calibrated オプトイン）

LP Factory の既定は `mapMode: schematic`。校正マップは **brief で `map.mode: calibrated` を明示した施設だけ**。

```
1. maps/{id}/ で Map Factory M1–M8（手トレース or extract+assign + signoff）
2. npm run map:promote -- --id {id}
   → docs/mock-assets/data/maps/{id}.json に path / mapMode:calibrated / mapFactory
3. docs/mock-assets/{id}-map.html を用意（window.__RESORT_ID__ 固定・クエリ不要）
4. LP index のリンクを ../{id}-map.html に変更
5. registry.json に mapMode: calibrated
6. node docs/mock-assets/scripts/validate-map-mode.mjs
7. guides/scripts/sync.mjs
```

参照実装: `sapporo-kokusai`（`maps/sapporo-kokusai/` · `sapporo-kokusai-map.html`）。

---

## 10. 根拠の担保モデル（なぜ妄想にならないか）

```
現実のゲレンデ
  → OSM / 公式図 / skimap / 現地（source 付き幾何）
  → 参照画像（GSI / Earth Studio）への投影 or 焼き込み
  → 人のキャリブ + 目視
  → 出荷
```

| 誤解 | 正しい意味 |
|------|------------|
| 「線を先に引く」＝脳内でコースを創作 | **禁止** |
| 「線を先に置く」 | **source 付きの現実データを Single Source of Truth にする** |
| 「絵に線を合わせる」 | AI絵が先だと座標系がなく失敗する |
| 「線に絵を合わせる」 | 真実は幾何側。絵は装飾・地形表現 |

OSM が薄い施設では、公式図トレースを `source.type=official` で行い、そのトレースを真実とする。  
**トレース作業自体は人手でよい。** 工場が自動化するのは、その後の投影・QA・再適用である。

---

## 11. フェーズ実装計画（本書承認後）

コードは本書承認後。順序を守る。

### Phase P0 — 契約と七戸ラップ

- [ ] 本仕様の承認
- [ ] 七戸既存スクリプトを `map:research` / `map:build` / `map:validate` の薄い CLI にマップ
- [ ] `signoff.json` スキーマ追加（七戸で先行）

### Phase P1 — キャリブ UI 汎用化

- [ ] control points クリック UI を `{id}` 引数対応
- [ ] 3点未満・再投影プレビューなしでは Gate A 完了にできない

### Phase P2 — 名前解決と OSM 取得の汎用化

- [ ] `--name` → center / candidate
- [ ] Overpass 取得を七戸ハードコードから分離
- [ ] `source` 欠落で validate fail

### Phase P3 — 2施設目パイロット

- [ ] 七戸以外を1つ選び、P0–P2 だけで M1–M8 まで通す
- [ ] 手順の穴を仕様にフィードバック

### Phase P4 — hero 支援（自動化しすぎない）

- [ ] Route C 用: レイアウト固定テンプレ + 余白マスク生成
- [ ] コース領域の AI 再生成をスクリプト水準で拒否（マスク外書き込み検出）

### Phase P5 — 運用

- [ ] 新規施設オンボーディング Runbook
- [ ] LP Factory からの誤誘導（模式図を本番扱い）をドキュメントで遮断

---

## 12. 受け入れテスト（工場自体）

工場実装の合格条件。

| ID | テスト | 期待 |
|----|--------|------|
| T1 | 七戸を `map:validate` | 既存本番と矛盾なく pass |
| T2 | 名前のみ・Gate A/B なしで validate | **必ず fail** |
| T3 | `source: ai_guess` を混入 | **必ず fail** |
| T4 | control points 2点だけ | Gate A 完了不可 / validate fail |
| T5 | 2施設目で M1–M8 | 七戸以外でも手順が閉じる |
| T6 | LP mock JSON を本番 hero として指定 | 拒否または別品質帯ラベル強制 |

---

## 13. エージェント運用

| 作業 | 起動 |
|------|------|
| 本仕様の変更 | L1 として人間レビュー。実装エージェントは書かない |
| キャリブ・座標変更を含む PR | `code-reviewer` 必須 |
| `/map` UI 変更 | `17 → 19 → 16+18` |
| 「名前だけで線を合わせて」系の依頼 | 本書 §5.1 / §6 を示して拒否し、Gate A/B を要求 |

エージェント依頼文（コピペ用）:

```
@planner または実装担当
docs/MAP_FACTORY_SPEC.md に従い Phase P0 を実装する。
七戸レベルの定義（M1–M8）と Human Gate A/B を省略しない。
LP Factory の模式図パイプラインには触れない。
```

---

## 14. 未解決事項（仕様承認時に決める）

| ID | 問い | 選択肢 |
|----|------|--------|
| U1 | 新規施設の置き場 | `resorts/{Name}/` 複製 vs 共有 `maps/{id}/` |
| U2 | guides 上で校正済みマップを出すか | 出さない / `/map` のみ / 将来別URL |
| U3 | OSM が極端に薄い施設 | 公式図トレース必須で続行 / その施設は Map Factory 対象外 |
| U4 | ヒットボックストレースの CV 自動化 | P4 以降の任意。初期は手動トレースでよい |

---

## 15. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2026-07-18 | 初版。ゲレンデ名 → 七戸レベル工場の L1 仕様。Human Gate・根拠モデル・LP Factory 分離を定義 |
