# ゲレンデマップ用データソース

## 座標（確定版・MVP）

| 項目 | 値 | 出典 |
|------|-----|------|
| 中心 | 40.69839, 141.099714 | OpenSkiMap `ski_areas.csv` |
| 標高 | 88〜210 m | tenki.jp / 公式概要 |
| ペアリフト（OSM） | way/631879096 | OpenStreetMap（1本のみ） |
| 参考イラストマップ | 2012年版 | [skimap.org/SkiAreas/view/1345](https://www.skimap.org/SkiAreas/view/1345) |
| **地理基準（内部）** | Earth Studio 書き出し | `sichinohe-hero-earthstudio.png` |

## ヒーロー画像 + SVG オーバーレイ

| ファイル | 内容 |
|----------|------|
| `public/maps/sichinohe-hero.png` | **本番** パンフレット風俯瞰イラスト |
| `public/maps/sichinohe-hero-earthstudio.png` | Google Earth Studio 参照（**画面非表示・キャリブ用**） |
| `reference/skimap-2012.jpg` | skimap 2012 パンフレット |
| `control-points-earth.json` | Earth 画像上のリフト端点 |
| `control-points-hero-ai.json` | イラスト上のリフト端点 |
| `lift-markers.json` | イラスト座標系のリフト線 |

> 国土地理院正射はビルド用に残す場合があるが **ユーザー画面には出さない**。

## 推奨パイプライン

```bash
# Earth Studio でカメラ合わせ → footage 書き出し
node scripts/import-earth-footage.mjs --fit

node scripts/fetch-skimap-reference.mjs
# control-points-earth.json / control-points-hero-ai.json を目視調整
node scripts/fit-overlay-similarity.mjs
node scripts/align-hero-earth.mjs
node scripts/build-map-preview.mjs
```

## 免責

OSM / OpenSkiMap データは ODbL 等のライセンスに従い、出典表示が必要です。公開前に運営元でレイアウトを確認してください。
