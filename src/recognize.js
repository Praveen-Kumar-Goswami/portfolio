/** Lightweight stroke matcher. Bounding box, closure, then a shifted/rotated template distance. */

const N = 64;
const MAX_DISTANCE = 0.34;
const MIN_MARGIN = 0.045;

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function bbox(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function resample(points, n) {
  if (!points || points.length < 2) return null;
  const seg = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = dist(points[i], points[i - 1]);
    total += len;
    seg.push(len);
  }
  if (total < 1e-3 || !seg.length) return null;
  const out = [];
  const step = total / (n - 1);
  let acc = 0;
  let index = 0;
  for (let i = 0; i < n; i++) {
    const target = Math.min(total, step * i);
    while (index < seg.length - 1 && acc + seg[index] < target - 1e-4) {
      acc += seg[index];
      index += 1;
    }
    const len = seg[index] || 1;
    const t = Math.max(0, Math.min(1, (target - acc) / len));
    const a = points[index];
    const b = points[Math.min(index + 1, points.length - 1)];
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

function normalize(points) {
  const sampled = resample(points, N);
  if (!sampled) return null;
  let cx = 0;
  let cy = 0;
  for (const p of sampled) {
    cx += p.x;
    cy += p.y;
  }
  cx /= N;
  cy /= N;
  let max = 0;
  const centered = sampled.map((p) => {
    const x = p.x - cx;
    const y = p.y - cy;
    max = Math.max(max, Math.hypot(x, y));
    return { x, y };
  });
  if (max < 1e-4) return null;
  return centered.map((p) => ({ x: p.x / max, y: p.y / max }));
}

function densify(corners, perEdge) {
  const out = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i];
    const b = corners[i + 1];
    for (let s = 0; s < perEdge; s++) {
      const t = s / perEdge;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  out.push(corners[corners.length - 1]);
  return out;
}

function circleRaw() {
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    pts.push({ x: Math.cos(a), y: Math.sin(a) });
  }
  return pts;
}

function polyRaw(sides) {
  const corners = [];
  for (let i = 0; i <= sides; i++) {
    const a = -Math.PI / 2 + (i % sides) * ((Math.PI * 2) / sides);
    corners.push({ x: Math.cos(a), y: Math.sin(a) });
  }
  return densify(corners, 18);
}

function rectRaw(aspect) {
  const hw = aspect / 2;
  const hh = 0.5;
  return densify(
    [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
      { x: -hw, y: -hh },
    ],
    16,
  );
}

const templates = {
  circle: normalize(circleRaw()),
  triangle: normalize(polyRaw(3)),
  rectangles: [1, 1.35, 1.75, 2.3, 3].map((aspect) => normalize(rectRaw(aspect))),
};

function pathDistance(user, tmpl, shift, cos, sin) {
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const p = user[(i + shift) % N];
    const x = tmpl[i].x * cos - tmpl[i].y * sin;
    const y = tmpl[i].x * sin + tmpl[i].y * cos;
    const dx = p.x - x;
    const dy = p.y - y;
    sum += Math.hypot(dx, dy);
  }
  return sum / N;
}

function bestScore(user, tmpl) {
  let best = Infinity;
  const rotations = 24;
  for (let rev = 0; rev < 2; rev++) {
    const path = rev ? user.slice().reverse() : user;
    for (let shift = 0; shift < N; shift += 2) {
      for (let k = 0; k < rotations; k++) {
        const ang = (k / rotations) * Math.PI * 2;
        const score = pathDistance(path, tmpl, shift, Math.cos(ang), Math.sin(ang));
        if (score < best) best = score;
      }
    }
  }
  return best;
}

export function matchShape(points, target) {
  if (!points || points.length < 10) return { ok: false, reason: 'small', scores: null };
  const box = bbox(points);
  const minSide = Math.min(box.w, box.h);
  const minRequired = 72;
  if (box.w < minRequired || box.h < minRequired) return { ok: false, reason: 'small', scores: null };
  const aspect = box.w / box.h;
  if (aspect > 3.3 || aspect < 1 / 3.3) return { ok: false, reason: 'flat', scores: null };

  const gap = dist(points[0], points[points.length - 1]);
  const gapLimit = minSide * 0.42;
  if (gap > gapLimit) return { ok: false, reason: 'open', scores: null };

  const closed = gap > 2 ? points.concat([points[0]]) : points;
  const user = normalize(closed);
  if (!user) return { ok: false, reason: 'small', scores: null };

  const scores = {
    circle: bestScore(user, templates.circle),
    triangle: bestScore(user, templates.triangle),
    rectangle: Math.min(...templates.rectangles.map((tmpl) => bestScore(user, tmpl))),
  };
  const ranked = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const [bestName, best] = ranked[0];
  const second = ranked[1][1];
  const ok = bestName === target && best < MAX_DISTANCE && second - best > MIN_MARGIN;
  return { ok, reason: ok ? 'match' : 'mismatch', scores, best: bestName };
}

export const SHAPE_LABEL = {
  circle: 'circle',
  triangle: 'triangle',
  rectangle: 'rectangle',
};
