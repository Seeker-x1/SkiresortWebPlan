# elevation-illustration — 標高忠実イラスト生成パイプライン

設計書: [`docs/ELEVATION_ILLUSTRATION_MODEL.md`](../../docs/ELEVATION_ILLUSTRATION_MODEL.md)

## 概要

国土地理院 DEM 等から **地形真理層（L1）** を作り、ルールベース／学習 **イラスト化層（L2）** でゲレンデマップを生成する。

Mapbox 衛星タイルは使わない。

## ディレクトリ（予定）

```
ingest/     DEM ダウンロード・クリップ
analyze/    hillshade, slope, curvature, contours
stylize/    SVG / PNG イラスト出力
validate/   標高・リフト端点 QA
styles/     色・線幅トークン
```

## 七戸町営スキー場（パイロット）

| 項目 | 値 |
|------|-----|
| 中心 | 40.69839, 141.099714 |
| 標高 | 88〜210 m |
| bbox（初期） | 141.094, 40.696, 141.102, 40.700 |

## ステータス

| 段階 | 状態 |
|------|------|
| L1 ingest（DEM 取得） | 未実装 |
| L1 analyze（hillshade/curvature） | 未実装 |
| L2 v1 ルールスタイル | 未実装 |
| L2 v2 学習モデル | 未着手 |
| Web `/map` 統合 | Mapbox 3D（要トークン）— 差し替え予定 |

## 開発者向けメモ

- GSI 標高タイル PNG は `analyze` 前に GeoTIFF 等へ正規化が必要
- OSM リフト: `resorts/Sichinohe-CyoueiSki/scripts/fetch-lift-way.mjs`
- 出力は `web/public/maps/{resort-slug}/` と `features.manifest.json` に接続
