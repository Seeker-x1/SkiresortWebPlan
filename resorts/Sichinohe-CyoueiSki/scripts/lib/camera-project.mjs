/**
 * 斜め俯瞰カメラ（Earth Studio / Blender 互換）で lng/lat → 画像ピクセルへ投影
 *
 * - headingDeg: 北=0°, 東=90°（時計回り）
 * - tiltDeg: 0°=真下, 90°=水平（Earth Studio / Earth Web 互換）
 * - 画像: 原点左上, y 下向き
 */

const WGS84_A = 6_378_137.0;
const WGS84_E2 = 6.69437999014e-3;

function degToRad(d) {
  return (d * Math.PI) / 180;
}

export function geodeticToEcef(lng, lat, h = 0) {
  const lon = degToRad(lng);
  const latRad = degToRad(lat);
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const n = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  return {
    x: (n + h) * cosLat * Math.cos(lon),
    y: (n + h) * cosLat * Math.sin(lon),
    z: (n * (1 - WGS84_E2) + h) * sinLat,
  };
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-12) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function localEnuBasis(lng, lat) {
  const lon = degToRad(lng);
  const latRad = degToRad(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const up = { x: cosLat * cosLon, y: cosLat * sinLon, z: sinLat };
  const east = { x: -sinLon, y: cosLon, z: 0 };
  const north = { x: -sinLat * cosLon, y: -sinLat * sinLon, z: cosLat };
  return { up: normalize(up), east: normalize(east), north: normalize(north) };
}

function buildCameraBasis(camera) {
  const {
    position: [lng, lat],
    altitudeM,
    groundElevationM = 0,
    headingDeg,
    tiltDeg,
    rollDeg = 0,
  } = camera;

  const camH = groundElevationM + altitudeM;
  const position = geodeticToEcef(lng, lat, camH);
  const { up, east, north } = localEnuBasis(lng, lat);

  const heading = degToRad(headingDeg);
  const horiz = normalize({
    x: north.x * Math.cos(heading) + east.x * Math.sin(heading),
    y: north.y * Math.cos(heading) + east.y * Math.sin(heading),
    z: north.z * Math.cos(heading) + east.z * Math.sin(heading),
  });

  const tilt = degToRad(tiltDeg);
  const sinT = Math.sin(tilt);
  const cosT = Math.cos(tilt);
  const nadir = { x: -up.x, y: -up.y, z: -up.z };
  const forward = normalize({
    x: nadir.x * cosT + horiz.x * sinT,
    y: nadir.y * cosT + horiz.y * sinT,
    z: nadir.z * cosT + horiz.z * sinT,
  });

  let right = normalize(cross(forward, up));
  let camUp = normalize(cross(right, forward));

  if (rollDeg) {
    const roll = degToRad(rollDeg);
    const cosR = Math.cos(roll);
    const sinR = Math.sin(roll);
    right = normalize({
      x: right.x * cosR + camUp.x * sinR,
      y: right.y * cosR + camUp.y * sinR,
      z: right.z * cosR + camUp.z * sinR,
    });
    camUp = normalize(cross(right, forward));
  }

  return { position, forward, right, up: camUp };
}

function focalLengthPx(image, camera) {
  const fovDeg = camera.fovDeg ?? 60;
  const fov = degToRad(fovDeg);
  if (camera.fovAxis === "horizontal") {
    const fx = image.width / (2 * Math.tan(fov / 2));
    return { fx, fy: fx };
  }
  const fy = image.height / (2 * Math.tan(fov / 2));
  const fx = fy * (image.width / image.height);
  return { fx, fy };
}

/**
 * @param {number} lng
 * @param {number} lat
 * @param {{ image: object, camera: object }} config
 */
export function projectLngLat(lng, lat, config) {
  const { image, camera } = config;
  const groundH = camera.groundElevationM ?? config.groundElevationM ?? 0;
  const point = geodeticToEcef(lng, lat, groundH);
  const basis = buildCameraBasis(camera);

  const v = sub(point, basis.position);
  const x = dot(v, basis.right);
  const y = dot(v, basis.up);
  const z = dot(v, basis.forward);

  if (z <= 0.1) {
    return { px: NaN, py: NaN, visible: false, depth: z };
  }

  const { fx, fy } = focalLengthPx(image, camera);
  const cx = image.width / 2;
  const cy = image.height / 2;
  const px = cx + (fx * x) / z;
  const py = cy - (fy * y) / z;

  const margin = 100;
  const visible =
    px >= -margin &&
    px <= image.width + margin &&
    py >= -margin &&
    py <= image.height + margin;

  return { px, py, visible, depth: z };
}

export function projectControlPoints(config, points) {
  return points.map((p) => {
    const { px, py, visible, depth } = projectLngLat(p.lng, p.lat, config);
    return {
      ...p,
      px: Math.round(px * 10) / 10,
      py: Math.round(py * 10) / 10,
      visible,
      depth: Math.round(depth * 10) / 10,
    };
  });
}
