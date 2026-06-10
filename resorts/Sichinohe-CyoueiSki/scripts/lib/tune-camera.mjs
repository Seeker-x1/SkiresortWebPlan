import { projectLngLat } from "./camera-project.mjs";

function dist(a, b) {
  return Math.hypot(a.px - b.px, a.py - b.py);
}

/**
 * GSI 正射の既知ピクセル（または手動 target）に合わせてカメラを探索
 */
export function tuneCamera(config, targets, lifts) {
  const pair = lifts.features.find((f) => f.properties.id === "lift-pair");
  const bottom = { lng: pair.geometry.coordinates[0][0], lat: pair.geometry.coordinates[0][1] };
  const top = {
    lng: pair.geometry.coordinates.at(-1)[0],
    lat: pair.geometry.coordinates.at(-1)[1],
  };

  const refW = targets.refWidth ?? 1920;
  const refH = targets.refHeight ?? 1280;
  const sx = config.image.width / refW;
  const sy = config.image.height / refH;

  const wantBottom = {
    px: targets.liftPairBottom[0] * sx,
    py: targets.liftPairBottom[1] * sy,
  };
  const wantTop = {
    px: targets.liftPairTop[0] * sx,
    py: targets.liftPairTop[1] * sy,
  };

  let best = null;
  let bestErr = Infinity;

  const headings = range(250, 320, 5);
  const tilts = range(40, 80, 5);
  const altitudes = range(600, 2200, 200);
  const fovs = [45, 50, 55, 60, 65];

  for (const headingDeg of headings) {
    for (const tiltDeg of tilts) {
      for (const altitudeM of altitudes) {
        for (const fovDeg of fovs) {
          const trial = {
            ...config,
            camera: { ...config.camera, headingDeg, tiltDeg, altitudeM, fovDeg },
          };
          const pBottom = projectLngLat(bottom.lng, bottom.lat, trial);
          const pTop = projectLngLat(top.lng, top.lat, trial);
          if (!pBottom.visible || !pTop.visible) continue;
          if (Number.isNaN(pBottom.px) || Number.isNaN(pTop.px)) continue;

          const err = dist(pBottom, wantBottom) + dist(pTop, wantTop);
          if (err < bestErr) {
            bestErr = err;
            best = { headingDeg, tiltDeg, altitudeM, fovDeg, err: Math.round(err) };
          }
        }
      }
    }
  }

  return best;
}

function range(start, end, step) {
  const out = [];
  for (let v = start; v <= end; v += step) out.push(v);
  return out;
}
