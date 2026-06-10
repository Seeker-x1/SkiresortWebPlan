/** 2D アフィン変換（lng/lat ↔ pixel） */

export function solveAffine(srcPts, dstPts) {
  // src: [lng, lat], dst: [px, py] — 最低 3 点
  if (srcPts.length < 3 || dstPts.length < 3) {
    throw new Error("need >= 3 control points");
  }
  const n = Math.min(srcPts.length, dstPts.length);
  const rows = [];
  const b = [];
  for (let i = 0; i < n; i++) {
    const [lng, lat] = srcPts[i];
    const [px, py] = dstPts[i];
    rows.push([lng, lat, 1, 0, 0, 0]);
    b.push(px);
    rows.push([0, 0, 0, lng, lat, 1]);
    b.push(py);
  }
  const x = leastSquares(rows, b);
  return {
    a: x[0],
    b: x[1],
    c: x[2],
    d: x[3],
    e: x[4],
    f: x[5],
  };
}

function leastSquares(A, b) {
  const m = A.length;
  const n = A[0].length;
  const AtA = Array.from({ length: n }, () => Array(n).fill(0));
  const Atb = Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      Atb[j] += A[i][j] * b[i];
      for (let k = 0; k < n; k++) AtA[j][k] += A[i][j] * A[i][k];
    }
  }
  return gaussianElimination(AtA, Atb);
}

function gaussianElimination(mat, vec) {
  const n = vec.length;
  const a = mat.map((row) => [...row]);
  const b = [...vec];
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    }
    [a[col], a[pivot]] = [a[pivot], a[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    const div = a[col][col] || 1e-12;
    for (let j = col; j < n; j++) a[col][j] /= div;
    b[col] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col];
      for (let j = col; j < n; j++) a[r][j] -= factor * a[col][j];
      b[r] -= factor * b[col];
    }
  }
  return b;
}

export function projectAffine(lng, lat, m) {
  return {
    x: m.a * lng + m.b * lat + m.c,
    y: m.d * lng + m.e * lat + m.f,
  };
}

export function lineStringToAffinePath(coords, m) {
  return coords
    .map(([lng, lat], i) => {
      const { x, y } = projectAffine(lng, lat, m);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
