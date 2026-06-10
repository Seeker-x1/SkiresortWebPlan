# ヒーローマップ実座標キャリブレーション手順書



七戸町営スキー場（`40.69839, 141.099714`）の **実座標ベースヒーロー画像** と **SVG オーバーレイ** を一致させるワークフロー。



---



## 0. 成果物一覧



| ファイル | 内容 |

|----------|------|

| `web/public/maps/sichinohe-hero-gsi.png` | 国土地理院正射写真（自動生成・現行） |

| `web/public/maps/sichinohe-hero-earthstudio.png` | Earth Studio 冬景斜め俯瞰（本番差し替え先） |

| `web/data/map/hero-meta.json` | bbox・解像度・投影方式 |

| `web/data/map/overlay-paths.json` | OSM / アフィン投影 SVG path |

| `web/data/map/control-points.json` | ペアリフト OSM 端点ピクセル |

| `web/data/map/control-points-manual.json` | Earth Studio 用手動コントロール点 |

| `web/data/map/reference/skimap-2012.jpg` | skimap 2012 参照（自動取得済み） |



**QA ページ**: `http://localhost:3000/maps/calibration-qa.html`



---



## 1. 一括パイプライン（GSI 正射・いま動いている）



```bash

cd resorts/Sichinohe-CyoueiSki/scripts

npm install

node run-map-pipeline.mjs

```



内訳:



1. `build-hero-gsi.mjs` — GSI タイル合成 → `sichinohe-hero-gsi.png`

2. `calibrate-overlay.mjs` — OSM GeoJSON → `overlay-paths.json`（線形 bbox 投影）

3. `fetch-skimap-reference.mjs` — skimap 2012 参照画像



確認:



```bash

cd ../web && npm run dev

# → /ja/map

# → /maps/calibration-qa.html

```



### ペアリフト地面コントロール点（OSM 確定値）



| ID | 緯度経度 | GSI 上ピクセル |

|----|----------|----------------|

| `lift-pair-bottom`（下駅・東） | `141.0997309, 40.69845` | `[1539, 400]` |

| `lift-pair-top`（上駅・西） | `141.0952757, 40.6976589` | `[383, 822]` |



`calibrate-overlay.mjs` はこの 2 点を自動検証ログに出力する。



### 角度はいつ重要か？



| ヒーロー種別 | 角度の要否 | オーバーレイ合わせ |
|--------------|------------|-------------------|
| **GSI 正射**（現行） | **不要**（真上なので角度という概念がない） | `calibrate-overlay.mjs` で **自動一致** |
| **斜め俯瞰写真**（Earth Studio / Blender 等） | **必須** | 画像の角度 = `camera.json` の角度が一致しないとズレる |



**結論**: 斜め写真を使うときだけ角度が命。いまの GSI 正射ルートでは角度を気にしなくてよい。



### 七戸の「マップとして読みやすい」角度の目安（斜めにする場合）



skimap 2012 は **ベース（南東）から山頂（北西）を見上げるイラスト** に近い。実写で再現するなら:



| パラメータ | 目安 | 確認方法 |
|------------|------|----------|
| **Heading** | 280〜320°（西〜北西を向く） | ペアリフト（東→西）が画面で **対角線** になる |
| **Tilt** | 70〜85°（**0°=真下, 90°=水平**） | skimap 的な斜め俯瞰は **75°前後**（ほぼ水平に近い） |
| **Altitude** | 800〜1500 m AGL | ゲレンデ全体が画面に入る |



`/maps/calibration-qa.html` で skimap を 50% 重ね、**ペアリフトの向き**が同じかを見るのが最短 QA。



---



## 2. 方式 B — 斜め俯瞰（任意・Earth Studio が使えない場合はスキップ可）



> **Google Earth（デスクトップ）では書き出せない。** 斜め静止画の書き出しは Earth Studio 専用だが、アカウント承認・ブラウザ制限で使えないことが多い。**本番は §1 の GSI 正射で問題ない。**



### Earth Studio が使えないときの代替



| 優先 | 手段 | 角度 | 自動化 |
|------|------|------|--------|
| ★ 推奨（今） | **GSI 正射 + hillshade** | 不要 | 100%（済） |
| 次点 | **Blender ヘッドレス** | `camera.json` で指定 | 85%（未実装） |
| 参考 | Mapbox Static（pitch/bearing） | API パラメータ | トークン要 |



斜めにこだわるなら **Blender** の方が Earth Studio より再現性が高い（同じ `camera.json` → `project-camera.mjs` が使える）。



### 2.1 プロジェクト設定（Earth Studio を使える場合のみ）



### 2.1 プロジェクト設定



1. [Google Earth Studio](https://www.google.com/earth/studio/) を開く

2. 検索: **`40.69839, 141.099714`**（七戸町営スキー場・ベース付近）

3. カメラ目安:



| パラメータ | 推奨値 | 意図 |

|------------|--------|------|

| Altitude | 1.2〜1.8 km | 斜面全体が入る |

| Pitch | 55〜65° | 俯瞰（真上は GSI と同じなので不要） |

| Heading | 250〜310° を試す | ペアリフト（東→西）が画面で対角に見える角度 |

| 時期 | **1〜3月** | 積雪。雲量最小のフレームを選ぶ |



4. フレームを止め、リフト線が skimap 2012 と同じ向き（下東→上西）になるか目視



### 2.2 書き出し



- 解像度: **3840×2560** 以上（Web 用に後で 1920 幅へ縮小可）

- 形式: PNG（最高品質）

- ファイル名: `sichinohe-hero-earthstudio.png`

- 配置: `web/public/maps/`



`features.manifest.json` を更新:



```json

"heroImage": {

  "src": "/maps/sichinohe-hero-earthstudio.png",

  "width": 3840,

  "height": 2560,

  "viewBox": "0 0 3840 2560"

}

```



### 2.2 Earth Studio URL から角度を取り込む（推奨）



Viewport で **Copy Location URL** したリンクをそのまま渡せる:



```bash

node parse-earth-studio-url.mjs --url="https://earth.google.com/studio/@40.69908,141.10739,292a,20y,268h,78t"

node project-camera.mjs

```



URL 形式: `@緯度,経度,高度a,画角y,方位h,傾きt`



| サフィックス | 意味 |
|--------------|------|
| `a` | カメラ高度（m） |
| `y` | 水平画角の **半分**（→ 水平 FOV = 2×y） |
| `h` | Heading（北=0°） |
| `t` | Tilt（**0°=真下, 90°=水平**） |



七戸の例（ユーザー提供）:



```

40.69908, 141.10739 | 高度 292m | FOV 40° | Heading 268° | Tilt 78.4°

```



→ ほぼ水平に近い斜め俯瞰（skimap 系）。ペアリフトは画面内で右下→左上の対角になる。



#### URL を貼っても視点が動かないとき



`@40.69908, 141.10739, 292a, 20y, 268h, 78.4t` **の断片だけでは動きません。**



| よくあるミス | 正しい操作 |
|--------------|------------|
| 検索バーに `@...` を貼る | 検索は地名のみ。カメラは属性パネルかフル URL |
| 緯度欄に `@40.69908,...` 全体を貼る | **数値だけ**入れる（下表） |
| スペース入り `@40.69908, 141.10739` | カンマ直後スペースなしのフル URL |
| Viewport 未フォーカスで Ctrl+V | 地球ビューをクリック（青枠）してからペースト |



**手入力（確実）** — Attributes パネル:



| グループ | 属性 | 値 |
|----------|------|-----|
| Camera Position | Latitude | `40.6990810811416` |
| | Longitude | `141.1073872446019` |
| | Altitude | `292.067` |
| Camera Rotation | Heading | `268.021` |
| | Tilt | `78.410` |



詳細: [earth-studio-manual-entry.md](../resorts/Sichinohe-CyoueiSki/web/data/map/earth-studio-manual-entry.md)



### 2.3 地面コントロール点（自動 — Figma 不要）



`web/data/map/camera.json` にカメラパラメータを書き、OSM 座標からピクセルを自動計算する。



```bash

node project-camera.mjs --tune    # GSI 端点に合わせて camera.json を初期チューニング

node project-camera.mjs           # → control-points-manual.json

node project-camera.mjs --fit     # 続けて fit-overlay-affine も実行

```



`camera.json` の主なキー:



| キー | 意味 |

|------|------|

| `camera.position` | 基準点 `[lng, lat]` |

| `camera.altitudeM` | 地上高 AGL |

| `camera.headingDeg` | 方位（北=0°） |

| `camera.tiltDeg` | 傾き（0=水平, 90=真下 = Earth Studio Tilt） |

| `camera.fovDeg` | 垂直画角 |

| `controlPoints[].from` | `lifts.lift-pair.start` など OSM 自動解決 |



Earth Studio 書き出し後は `.esp` のカメラ値を `camera.json` に転記し `--tune` なしで再実行。  
微調整は `headingDeg` / `tiltDeg` を ±5° 動かす（Figma より速い）。



手動フォールバック: `control-points-manual.example.json` に直接 `px/py` を書いても可。



### 2.4 アフィン変換で OSM 線を再投影



斜め写真は bbox 線形投影が効かない。**3 点以上** からアフィン変換:



```bash

node fit-overlay-affine.mjs

# または

node fit-overlay-affine.mjs --input=../web/data/map/control-points-manual.json

```



出力: `overlay-paths.json`（`projection: "affine-from-control-points"`）



### 2.5 OSM への合わせ込みチェックリスト



- [ ] ペアリフト端点マーカーが実写のリフト基部／山頂駅に重なる（±20px）

- [ ] ポニーリフト（skimap 右下 180m）が短い黒線位置と一致

- [ ] 上級者コース（チャンピオン）が skimap 青線と同じ山面（右林側）

- [ ] `/maps/calibration-qa.html` で skimap 50% 重ねて確認



---



## 3. 方式 C — Blender（最高イラスト品質）



1. DEM: 国土地理院または Mapbox Terrain を Blender GIS で import

2. bbox: `hero-meta.json` の `bbox` を使用

3. 雪マテリアル + 太陽光 315° / 45°（GSI hillshade と合わせる）

4. カメラ: Earth Studio §2.1 と同じ Altitude / Pitch / Heading

5. Cycles レンダー → `sichinohe-hero-earthstudio.png` 相当として配置

6. **§2.3〜2.4** と同じく `control-points-manual.json` → `fit-overlay-affine.mjs`



---



## 4. skimap 2012 との半透明比較（QA）



自動取得:



```bash

node fetch-skimap-reference.mjs

# → web/data/map/reference/skimap-2012.jpg

```



### Web QA



`/maps/calibration-qa.html` で:



- 下層: GSI 正射（または Earth Studio PNG）

- 中層: skimap 参照（チェックボックス）

- 上層: OSM 投影オーバーレイ（スライダーで不透明度調整）



### Figma / Photoshop



1. 下層: ヒーロー PNG

2. 上層: `skimap-2012.jpg` — **不透明度 50%**

3. チェック:

   - [ ] ペアリフト 408m の上下関係

   - [ ] ポニー 180m が右下ベース付近

   - [ ] 上級者（青）が右林側

   - [ ] 中級者（橙）がリフト左

4. ズレたコースは `trails.geojson` を修正 → `calibrate-overlay.mjs` 再実行



参照: [skimap.org/SkiAreas/view/1345](https://www.skimap.org/SkiAreas/view/1345)



---



## 5. コース GeoJSON の更新フロー



```

skimap 照合 / 現地確認

    ↓

trails.geojson, lifts.geojson 編集

    ↓

calibrate-overlay.mjs   （GSI 正射）

  または

fit-overlay-affine.mjs  （Earth Studio 斜め）

    ↓

/maps/calibration-qa.html で目視

    ↓

/ja/map で本番確認

```



---



## 6. 品質ゲート（公開前）



| 検証 | 合格目安 |

|------|----------|

| ペアリフト端点 | OSM 点と SVG マーカーが **画面上 20px 以内** |

| skimap 比較 | 主要コースの上下関係が一致 |

| 現場確認 | 町営担当が「概ね合っている」と口頭 OK |

| 表示 | 免責を「実写ベース・skimap 照合済み」に更新 |



---



## 7. トラブルシュート



| 現象 | 対処 |

|------|------|

| GSI タイルが真っ白 | `build-hero-gsi.mjs` の zoom を 16 に下げる |

| オーバーレイがずれる（正射） | `hero-meta.json` の bbox を 10m 単位で調整して再実行 |

| Earth Studio と OSM が合わない | `control-points-manual.json` + `fit-overlay-affine.mjs` |

| skimap 取得失敗 | `fetch-skimap-reference.mjs` 再実行（`files.skimap.org` URL） |

| 夏の GSI が映えない | Earth Studio 冬景に差し替え（§2） |



関連: [ELEVATION_ILLUSTRATION_MODEL.md](./ELEVATION_ILLUSTRATION_MODEL.md)


