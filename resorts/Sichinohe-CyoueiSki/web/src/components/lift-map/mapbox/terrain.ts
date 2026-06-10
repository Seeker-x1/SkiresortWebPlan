import type mapboxgl from "mapbox-gl";

/** 国土地理院 標高タイル URL パターン（参考・直接 setTerrain には非対応） */
export const GSI_ELEV_TILE_URL =
  "https://tiles.gsj.jp/tiles/elev/{z}/{x}/{y}.png";

/**
 * Mapbox Terrain-DEM（全球・衛星スタイルと組み合わせ可能）
 * GSI タイルはグレースケール PNG のため Mapbox の raster-dem 仕様と異なる。
 * 国土地理院 DEM を使う場合は Terrain-RGB への変換パイプラインまたは
 * Cesium の日本語タイル連携を別途検討する。
 */
export function enableMapboxTerrain(
  map: mapboxgl.Map,
  exaggeration = 1.8,
): void {
  if (map.getSource("mapbox-dem")) return;

  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration });
}

export function enableAtmosphere(map: mapboxgl.Map): void {
  if (map.getLayer("sky")) return;

  map.addLayer({
    id: "sky",
    type: "sky",
    paint: {
      "sky-type": "atmosphere",
      "sky-atmosphere-sun": [0.0, 90.0],
      "sky-atmosphere-sun-intensity": 12,
    },
  });
}

/**
 * 将来: GSI 標高をラスター表示のみ重ねる（地形メッシュには未使用）
 */
export function addGsiElevRasterPreview(map: mapboxgl.Map): void {
  if (map.getSource("gsi-elev-preview")) return;

  map.addSource("gsi-elev-preview", {
    type: "raster",
    tiles: [GSI_ELEV_TILE_URL],
    tileSize: 256,
    maxzoom: 18,
    attribution: "© 国土地理院",
  });

  map.addLayer({
    id: "gsi-elev-preview",
    type: "raster",
    source: "gsi-elev-preview",
    paint: { "raster-opacity": 0 },
    layout: { visibility: "none" },
  });
}
