/** Web Mercator + bbox helpers for GSI tile stitching */

const TILE_SIZE = 256;

export function lngLatToTile(lng, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y, z };
}

export function tileBounds(x, y, z) {
  const n = 2 ** z;
  const lng1 = (x / n) * 360 - 180;
  const lng2 = ((x + 1) / n) * 360 - 180;
  const lat1 =
    (180 / Math.PI) *
    Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat2 =
    (180 / Math.PI) *
    Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
  return {
    west: lng1,
    east: lng2,
    north: lat1,
    south: lat2,
  };
}

/** lat/lng → pixel in stitched canvas (north-up, linear in lng/lat within bbox) */
export function projectToPixel(lng, lat, bbox, width, height) {
  const x = ((lng - bbox.west) / (bbox.east - bbox.west)) * width;
  const y = ((bbox.north - lat) / (bbox.north - bbox.south)) * height;
  return { x, y };
}

export function lineStringToPath(coords, bbox, width, height) {
  const parts = coords.map(([lng, lat], i) => {
    const { x, y } = projectToPixel(lng, lat, bbox, width, height);
    const cmd = i === 0 ? "M" : "L";
    return `${cmd} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return parts.join(" ");
}

export const GSI_SEAMLESS_PHOTO =
  "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg";

export const GSI_HILLSHADE =
  "https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png";
