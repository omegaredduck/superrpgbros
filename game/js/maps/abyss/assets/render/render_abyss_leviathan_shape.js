// artdev/abyss/render_abyss_leviathan_shape.js — THE LEVIATHAN, take 3.
// Canon anatomy (FF/Ryujin water dragon): ONE continuous serpent in an
// open C-coil, hand-placed waypoints (no parametric surprises): head
// top-left facing LEFT, body arches over the top, down the right,
// sweeps along the bottom, tail kicks out bottom-left with a fan.
// Whisker barbels, antler horns, mane frill, spine fin membrane.
'use strict';
const KIT = require('./abyss_kit.js');
const { A, mix, clamp, ell, row, stroke, optic, renderSheet, glowDot, fin, bubbles } = KIT;

function lev160(put, S, o) {
  o = o || {};
  const base = o.base || '#2e7a66';
  const lt = o.lt || '#6ec2a0';
  const dk = o.dk || '#123a30';
  const belly = o.belly || '#d8e8c8';
  const finC = o.finC || '#3aa0b8';
  const finDk = o.finDk || '#1a5468';
  const crest = o.crest || ['#e05a3a', '#8a2014'];
  const eyeC = o.eyeC || '#e0a832';
  const boneC = o.antler || '#d8ccac';
  const u = S / 160;
  const X = v => v * u;

  // ---- centerline waypoints (head→tail), clockwise open-C
  const PTS = [
    [44, 36], [62, 26], [90, 24], [116, 32], [132, 50],
    [137, 74], [129, 96], [110, 110], [84, 117], [58, 115], [40, 105],
  ];
  // catmull-rom sample
  const P = (t) => {
    const n = PTS.length - 1;
    const f = Math.min(t * n, n - 0.0001);
    const i = Math.floor(f), lt2 = f - i;
    const p0 = PTS[Math.max(0, i - 1)], p1 = PTS[i], p2 = PTS[i + 1], p3 = PTS[Math.min(n, i + 2)];
    const cr = (a, b, c, d, tt) => 0.5 * ((2 * b) + (-a + c) * tt + (2 * a - 5 * b + 4 * c - d) * tt * tt + (-a + 3 * b - 3 * c + d) * tt * tt * tt);
    return [cr(p0[0], p1[0], p2[0], p3[0], lt2), cr(p0[1], p1[1], p2[1], p3[1], lt2)];
  };
  const W = (t) => 8.5 + Math.sin(Math.min(t * 2.2, 1) * Math.PI * 0.5) * 3.2 - t * 9 * (t > 0.7 ? (t - 0.7) / 0.3 * 0.9 : 0) - t * 2; // neck 8.5 → mid ~11.5 → tail 2.5
  const N = (t) => { // outward normal for clockwise travel
    const [x0, y0] = P(Math.max(0, t - 0.01)), [x1, y1] = P(Math.min(1, t + 0.01));
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    return [dy / L, -dx / L];
  };
  const seg = (tx, ty) => {
    let b = mix(lt, base, clamp(ty * 1.5, 0, 1));
    b = mix(b, dk, clamp((ty - 0.42) * 1.5, 0, 1));
    if (tx > 0.86) b = mix(b, dk, 0.3);
    return b;
  };

  // ---- 1) spine fin membrane (outward side, behind body)
  for (let t = 0.06; t < 0.93; t += 0.005) {
    const [px, py] = P(t), [nx, ny] = N(t);
    const w = Math.max(2.5, W(t));
    const hgt = (8 + Math.sin(t * 30) * 1.8) * (1 - t * 0.35);
    stroke(put, X(px + nx * w * 0.7), X(py + ny * w * 0.7), X(px + nx * (w + hgt)), X(py + ny * (w + hgt)), X(2.2), () => mix(finC, finDk, 0.15 + Math.abs(Math.sin(t * 46)) * 0.5));
    if ((t * 46 | 0) % 3 === 0) stroke(put, X(px + nx * w * 0.7), X(py + ny * w * 0.7), X(px + nx * (w + hgt + 2.5)), X(py + ny * (w + hgt + 2.5)), X(1.1), () => finDk);
  }

  // ---- 2) tail fluke first (under the body end)
  const [tfx, tfy] = P(0.995);
  fin(put, X(tfx - 1), X(tfy + 1), X(tfx - 13), X(tfy + 9), X(tfx - 3), X(tfy + 12), finC, finDk);
  fin(put, X(tfx - 1), X(tfy), X(tfx - 14), X(tfy - 2), X(tfx - 9), X(tfy + 9), mix(finC, '#ffffff', 0.12), finDk);

  // ---- 3) body, tail→neck so the head end overlaps
  for (let t = 0.99; t >= 0.02; t -= 0.005) {
    const [px, py] = P(t);
    const w = Math.max(2.2, W(t));
    ell(put, X(px), X(py), X(w), X(w), seg);
    if ((t * 110 | 0) % 4 === 0 && t < 0.92 && t > 0.05) { // belly plates inward
      const [nx, ny] = N(t);
      stroke(put, X(px - nx * w * 0.5), X(py - ny * w * 0.5), X(px - nx * w * 0.95), X(py - ny * w * 0.95), X(2.8), () => mix(belly, dk, 0.22 + ((t * 110 | 0) % 8 === 0 ? 0.18 : 0)));
    }
    if ((t * 150 | 0) % 11 === 0) { const [nx, ny] = N(t); put(Math.round(X(px + nx * w * 0.35)), Math.round(X(py + ny * w * 0.35)), mix(lt, '#ffffff', 0.3)); } // scale glints
  }

  // ---- 4) HEAD at (44,36) facing LEFT
  const hx = 44, hy = 36;
  ell(put, X(hx), X(hy), X(10.5), X(8.5), seg);                 // skull
  ell(put, X(hx + 4), X(hy - 3), X(7.5), X(6.5), seg);          // brow mass
  // long snout w/ up-curled nose
  for (let t = 0; t <= 1; t += 0.08) {
    ell(put, X(hx - 8 - t * 13), X(hy - 0.5 - t * 2), X(5.8 - t * 2.2), X(4.4 - t * 1.5), seg);
  }
  ell(put, X(hx - 22.5), X(hy - 4), X(2.4), X(2), seg);          // nose bump
  put(Math.round(X(hx - 23.5)), Math.round(X(hy - 4)), A.oil);   // nostril
  // upper lip + fangs
  stroke(put, X(hx - 21.5), X(hy + 2), X(hx - 5), X(hy + 4), X(1.2), () => dk);
  for (let i = 0; i < 4; i++) stroke(put, X(hx - 19 + i * 4), X(hy + 2.5), X(hx - 19.6 + i * 4), X(hy + 6), X(1.1), () => A.white);
  // open lower jaw
  for (let t = 0; t <= 1; t += 0.1) {
    ell(put, X(hx - 5 - t * 13), X(hy + 8.5 + t * 4), X(4.4 - t * 1.7), X(2.9 - t * 1), (tx, ty) => mix(seg(tx, ty), dk, 0.2));
  }
  for (let i = 0; i < 3; i++) stroke(put, X(hx - 8 - i * 4), X(hy + 9.5 + i * 1.2), X(hx - 7.4 - i * 4), X(hy + 6.5 + i * 1.2), X(1.1), () => A.white);
  // maw interior
  for (let yy = hy + 4; yy < hy + 8.5; yy += 0.8) row(put, Math.round(X(yy)), X(hx - 16), X(hx - 5.5), (tx) => mix(A.pinkDk, A.ink, clamp(tx + 0.25, 0, 1)));
  if (o.jawGlow) glowDot(put, X(hx - 10.5), X(hy + 6), X(2.2), o.jawGlow, A.white);
  // eye + scowl
  optic(put, X(hx - 1.5), X(hy - 3), X(2.5), A.oil, eyeC, o.eyeGlow ? eyeC : '#fff');
  stroke(put, X(hx - 6.5), X(hy - 6.5), X(hx + 3.5), X(hy - 7), X(1.5), () => dk);

  // ---- MANE frill — fans BACK from the skull (to the upper-right)
  for (let a = -1.35; a <= 0.25; a += 0.16) {
    const mx = hx + 7, my = hy - 1;
    const ex = mx + Math.cos(a) * 13, ey = my + Math.sin(a) * 13;
    stroke(put, X(mx), X(my), X(ex), X(ey), X(2), () => (((a * 12) | 0) % 2 ? crest[0] : crest[1]));
    put(Math.round(X(ex)), Math.round(X(ey)), crest[0]);
  }
  // re-assert brow over mane roots
  ell(put, X(hx + 3), X(hy - 3), X(6.5), X(5.5), seg);
  optic(put, X(hx - 1.5), X(hy - 3), X(2.5), A.oil, eyeC, o.eyeGlow ? eyeC : '#fff');

  // ---- ANTLERS — branched, swept back over the mane
  const antler = (sx, sy) => {
    stroke(put, X(sx), X(sy), X(sx + 8), X(sy - 8), X(2.2), () => boneC);
    stroke(put, X(sx + 8), X(sy - 8), X(sx + 16), X(sy - 11), X(1.7), () => mix(boneC, '#8a7a5a', 0.3));
    stroke(put, X(sx + 5), X(sy - 5.5), X(sx + 8), X(sy - 13), X(1.4), () => mix(boneC, '#8a7a5a', 0.4));
    stroke(put, X(sx + 12), X(sy - 9.5), X(sx + 15), X(sy - 16), X(1.2), () => mix(boneC, '#8a7a5a', 0.45));
  };
  antler(hx + 2, hy - 8);
  antler(hx + 6, hy - 6.5);

  // ---- WHISKER BARBELS — flow back from the snout, drifting
  [[-2, 1], [2, 1.6]].forEach(([dy, amp]) => {
    const bx = hx - 20, by = hy + dy + 3;
    let px = bx, py = by;
    for (let t2 = 0.05; t2 <= 1; t2 += 0.05) {
      const nx2 = bx - 6 * t2 + 26 * t2 * t2;
      const ny2 = by + Math.sin(t2 * 4.6) * 3.4 * amp + 13 * t2;
      stroke(put, X(px), X(py), X(nx2), X(ny2), X(1.3 - t2 * 0.6), () => (t2 < 0.45 ? crest[0] : crest[1]));
      px = nx2; py = ny2;
    }
  });
  // chin barbel
  stroke(put, X(hx - 7), X(hy + 11), X(hx - 9.5), X(hy + 16.5), X(1.2), () => crest[1]);

  // ---- ambience
  bubbles(put, X(hx + 26), X(hy - 16), 4, 4);
  [[16, 70], [148, 44], [120, 140], [30, 140]].forEach(([mx, my]) => put(Math.round(X(mx)), Math.round(X(my)), '#2a4458'));
}

const LIST = [
  { n: 1, name: 'THE LEVIATHAN', role: 'water-dragon canon — take 3', draw: (p, S) => lev160(p, S, {}) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_leviathan_shape.png', title: 'THE LEVIATHAN — shape pass take 3', S: 160, cols: 1, scale: 3 });
}
module.exports = { lev160 };
