/**
 * ペアリフト2端点などから相似変換（回転・スケール・平行移動）を求め、lng/lat → pixel
 */

const R = 6_378_137;

function degToRad(d) {
  return (d * Math.PI) / 180;
}

/** 基準点からの東北オフセット（m） */
export function toEnuMeters(lng, lat, originLng, originLat) {
  const dLng = degToRad(lng - originLng);
  const dLat = degToRad(lat - originLat);
  const latRad = degToRad(originLat);
  const x = dLng * R * Math.cos(latRad);
  const y = dLat * R;
  return { x, y };
}

/**
 * 2点の地理座標・ピクセルから相似変換を構築
 * @returns {{ originLng, originLat, scale, cos, sin, tx, ty }}
 */
export function solveSimilarity(geoA, geoB, pxA, pxB) {
  const [lngA, latA] = geoA;
  const [lngB, latB] = geoB;
  const enuB = toEnuMeters(lngB, latB, lngA, latA);
  const gDist = Math.hypot(enuB.x, enuB.y);
  const pDist = Math.hypot(pxB[0] - pxA[0], pxB[1] - pxA[1]);
  if (gDist < 1e-6 || pDist < 1e-6) throw new Error("control points too close");

  const gAngle = Math.atan2(enuB.y, enuB.x);
  const pAngle = Math.atan2(pxB[1] - pxA[1], pxB[0] - pxA[0]);
  const rot = pAngle - gAngle;
  const scale = pDist / gDist;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  return {
    originLng: lngA,
    originLat: latA,
    scale,
    cos,
    sin,
    tx: pxA[0],
    ty: pxA[1],
  };
}

export function projectSimilarity(lng, lat, t) {
  const { x, y } = toEnuMeters(lng, lat, t.originLng, t.originLat);
  const sx = x * t.scale;
  const sy = y * t.scale;
  return {
    x: t.tx + t.cos * sx - t.sin * sy,
    y: t.ty + t.sin * sx + t.cos * sy,
  };
}

export function enuMetersToLngLat(x, y, originLng, originLat) {
  const latRad = degToRad(originLat);
  const dLng = x / (R * Math.cos(latRad));
  const dLat = y / R;
  return {
    lng: originLng + (dLng * 180) / Math.PI,
    lat: originLat + (dLat * 180) / Math.PI,
  };
}

export function inverseProjectSimilarity(px, py, t) {
  const dx = px - t.tx;
  const dy = py - t.ty;
  const sx = t.cos * dx + t.sin * dy;
  const sy = -t.sin * dx + t.cos * dy;
  return enuMetersToLngLat(sx / t.scale, sy / t.scale, t.originLng, t.originLat);
}

export function lineStringToSimilarityPath(coords, t) {
  return coords
    .map(([lng, lat], i) => {
      const { x, y } = projectSimilarity(lng, lat, t);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
