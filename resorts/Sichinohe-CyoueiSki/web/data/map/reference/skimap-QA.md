# skimap 2012 照合手順

自動取得に失敗した場合の手動 QA。

## 1. 参照画像の入手

1. ブラウザで [skimap.org/SkiAreas/view/1345](https://www.skimap.org/SkiAreas/view/1345) を開く
2. **2012** マップを表示 → 画像を保存
3. `skimap-2012.jpg` としてこのフォルダに配置

## 2. Figma / Photoshop で比較

1. 下層: `public/maps/sichinohe-hero-earthstudio.png`（Google Earth Studio 書き出し）
2. 上層: `skimap-2012.jpg` — **不透明度 50%**
3. スケール・回転を合わせ（正射 vs イラストのため完全一致は不要）

## 3. チェックリスト

- [ ] ペアリフトの上下関係が同じ
- [ ] ポニー／初級エリアが同じ山面（東側ベース付近）
- [ ] チャンピオン（急斜面）の位置
- [ ] ズレたコースは `trails.geojson` を修正 → `node calibrate-overlay.mjs`

## 4. Web QA

`/maps/calibration-qa.html` で GSI + オーバーレイを重ねて確認。
