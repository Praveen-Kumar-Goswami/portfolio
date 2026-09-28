import { matchShape } from '../src/recognize.js';

function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function noise(points, amount, seed) {
  const r = rng(seed);
  return points.map((p) => ({
    x: p.x + (r() - 0.5) * amount,
    y: p.y + (r() - 0.5) * amount,
  }));
}

function circle(cx, cy, rad, n = 72) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad * 0.92 });
  }
  return pts;
}

function rectangle(cx, cy, w, h, rot) {
  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
    [-w / 2, -h / 2],
  ].map(([x, y]) => ({
    x: cx + x * Math.cos(rot) - y * Math.sin(rot),
    y: cy + x * Math.sin(rot) + y * Math.cos(rot),
  }));
  const out = [];
  for (let i = 0; i < corners.length - 1; i++) {
    for (let s = 0; s < 16; s++) {
      const t = s / 16;
      out.push({
        x: corners[i].x + (corners[i + 1].x - corners[i].x) * t,
        y: corners[i].y + (corners[i + 1].y - corners[i].y) * t,
      });
    }
  }
  out.push(corners[corners.length - 1]);
  return out;
}

function polygon(cx, cy, rx, ry, sides, rot = -Math.PI / 2) {
  const corners = [];
  for (let i = 0; i <= sides; i++) {
    const a = rot + (i % sides) * ((Math.PI * 2) / sides);
    corners.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  const out = [];
  for (let i = 0; i < corners.length - 1; i++) {
    for (let s = 0; s < 16; s++) {
      const t = s / 16;
      out.push({
        x: corners[i].x + (corners[i + 1].x - corners[i].x) * t,
        y: corners[i].y + (corners[i + 1].y - corners[i].y) * t,
      });
    }
  }
  out.push(corners[corners.length - 1]);
  return out;
}

function arc(cx, cy, rad) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 1.35;
    pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
  }
  return pts;
}

function scribble(seed) {
  const r = rng(seed);
  const pts = [{ x: 200, y: 200 }];
  for (let i = 0; i < 40; i++) {
    const prev = pts[pts.length - 1];
    pts.push({ x: prev.x + (r() - 0.5) * 50, y: prev.y + (r() - 0.5) * 50 });
  }
  return pts;
}

const cases = [
  ['clean circle', circle(400, 300, 90), 'circle', true],
  ['noisy circle', noise(circle(220, 240, 100), 10, 3), 'circle', true],
  ['circle not triangle', circle(400, 300, 90), 'triangle', false],
  ['clean triangle', polygon(360, 280, 100, 90, 3), 'triangle', true],
  ['noisy triangle', noise(polygon(360, 280, 110, 80, 3, 0.4), 12, 9), 'triangle', true],
  ['wide rectangle', rectangle(300, 300, 220, 110, 0.2), 'rectangle', true],
  ['noisy rectangle', noise(rectangle(280, 260, 200, 120, -0.4), 12, 5), 'rectangle', true],
  ['square', rectangle(300, 300, 150, 150, 0.5), 'rectangle', true],
  ['rectangle not circle', rectangle(300, 300, 220, 110, 0.2), 'circle', false],
  ['open arc', arc(300, 300, 90), 'circle', false],
  ['tiny circle', circle(100, 100, 20), 'circle', false],
  ['scribble', scribble(2), 'circle', false],
];

let failed = 0;
for (const [name, points, target, expect] of cases) {
  const result = matchShape(points, target);
  const pass = result.ok === expect;
  if (!pass) failed += 1;
  const scores = result.scores
    ? Object.entries(result.scores).map(([k, v]) => `${k}:${v.toFixed(3)}`).join(' ')
    : result.reason;
  console.log(`${pass ? 'ok' : 'FAIL'}  ${name}  -> ${result.ok ? 'match' : result.reason}  ${scores}`);
}
if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('all shape tests passed');
