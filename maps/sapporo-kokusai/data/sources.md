# ゲレンデマップ用データソース — 札幌国際スキー場

> Map Factory pilot · `sapporo-kokusai` · 2026-07-18T05:45:23.891Z

## 座標

| 項目 | 値 | 出典 |
|------|-----|------|
| 中心 | 43.0730147, 141.0702386 | Nominatim（`way/672881398`） |
| bbox | S43.0672206 W141.0570121 N43.0787954 E141.0836871 | Nominatim boundingbox |
| OSM landuse | way/672881398（winter_sports） | Nominatim |

## リフト・コース（メタの正本）

| 項目 | 値 |
|------|-----|
| 正本 | 公式ゲレンデマップ |
| URL | https://www.sapporo-kokusai.jp/slopes/images/slopemap.png |
| レイアウト JSON | `official-map-layout.json`（7コース・5リフト） |
| hero | `sapporo-kokusai-hero.png`（1024×817・焼き込み線済み・Route C） |

## OSM（地理根拠・対照用）

| 種別 | 件数 | ファイル |
|------|------|----------|
| aerialway | 5 | `lifts.geojson` |
| piste:type | 31 | `trails.geojson` |
| raw | — | `reference/overpass-raw.json` |

> OSM 名称と公式名称の対応は人手で行う。OSM 幾何を公式イラストへ投影するには Gate A（control points ≥ 3）が別途必要。本パイロットの hero は **公式図 identity** のため、見た目の線は公式焼き込みが正本。

## 参照画像

| ファイル | 用途 | ユーザー表示 |
|----------|------|--------------|
| `public/maps/sapporo-kokusai-hero.png` | 本番 hero（公式図リサイズ） | 可（出荷時） |
| `public/maps/sapporo-kokusai-hero-official-full.png` | 公式原寸 | 非表示・参照 |
| `data/reference/gelanding-2016.webp` | 2016 拓扑照合 | 非表示 |

## ライセンス

- OpenStreetMap データ: ODbL。出典表示必須。
- 公式 slopemap: 札幌国際スキー場の著作物。利用条件は運営元確認。

## パイプライン状態

- [x] Step 1 名前解決
- [x] Step 2 根拠取得（OSM + 公式メタ）
- [x] Step 3 参照画像（LP 既存公式図をコピー）
- [ ] Step 4 Gate A — identity のためスキップ可 / Geo投影時は必須
- [x] Step 5 Gate B — hero 候補は公式図（過去 LP 承認 2026-07-06）。Map Factory signoff は未
- [ ] Step 6 ヒットボックストレース
- [ ] Step 7 calibration-qa ±20px
- [ ] Step 8–9 出荷
