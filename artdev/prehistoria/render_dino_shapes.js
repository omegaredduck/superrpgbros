// artdev/prehistoria/render_dino_shapes.js — REAL DINOSAUR shape passes
// (Red: "look at what real dinosaurs look like"; take 1 was blobby).
// Technique: piecewise TOP/BOT silhouette profiles (the Apache lesson)
// — side view, horizontal theropod posture, correct proportions.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, dome, shadow, renderSheet, floor } = KIT;

function U(S) { const u = S / 160; return v => v * u; }
function pw(x, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / Math.max(1, x1 - x0);
  }
  return null;
}
// fill a TOP/BOT profile with vertical shading
// (steps in DEVICE space — no column/row gaps at any canvas size)
function body(put, X, x0, x1, TOP, BOT, cLt, c, cDk) {
  const u = X(1) - X(0);
  const st = u > 1 ? 1 / u : 1;
  for (let x = x0; x <= x1; x += st) {
    const top = pw(x, TOP), bot = pw(x, BOT);
    if (top == null || bot == null || bot <= top) continue;
    for (let y = top; y <= bot; y += st) {
      const ty = (y - top) / Math.max(1, bot - top);
      let cc = mix(cLt, c, clamp(ty * 1.7, 0, 1));
      cc = mix(cc, cDk, clamp((ty - 0.55) * 1.8, 0, 1));
      put(Math.round(X(x)), Math.round(X(y)), cc);
    }
  }
}
// theropod leg: thigh -> knee(forward) -> ankle(back) -> toes(forward), digitigrade Z
function theroLeg(put, X, hx, hy, sc, cLt, c, cDk, far) {
  const K = far ? 0.82 : 1;
  const kx = hx + 9 * sc, ky = hy + 16 * sc;   // knee forward
  const ax = hx + 2 * sc, ay = hy + 30 * sc;   // ankle back
  const fx = hx + 10 * sc, fy = hy + 38 * sc;  // foot forward
  stroke(put, X(hx), X(hy), X(kx), X(ky), X(8 * sc * K), () => (far ? cDk : c));   // thigh
  stroke(put, X(kx), X(ky), X(ax), X(ay), X(4.4 * sc * K), () => (far ? cDk : mix(c, cDk, 0.35))); // shin
  stroke(put, X(ax), X(ay), X(fx), X(fy), X(3 * sc * K), () => (far ? cDk : mix(c, cDk, 0.5)));    // metatarsus
  // toes + raised sickle claw
  for (let k = 0; k <= 2; k++) stroke(put, X(fx), X(fy), X(fx + (4 + k * 3) * sc), X(fy + 2 * sc), X(1.6 * sc), () => (far ? mix(P.claw, cDk, 0.5) : P.claw));
  if (!far) { stroke(put, X(fx - 2 * sc), X(fy - 2 * sc), X(fx - 1 * sc), X(fy - 7 * sc), X(2 * sc), () => P.claw); } // sickle held up
}

// ============ 1 RAPTOR — deinonychus build, horizontal balance beam
function raptor160(put, S) {
  const X = U(S); floor(put, S, 31); shadow(put, X(84), X(132), X(44), X(6));
  const cLt = P.dinoOLt, c = P.dinoO, cDk = P.dinoODk;
  // far leg first (behind body)
  theroLeg(put, X, 92, 90, 1.05, cLt, c, cDk, true);
  // BODY + stiff tail: one continuous horizontal silhouette
  const TOP = [[4, 70], [30, 69], [56, 67], [76, 62], [92, 58], [104, 58], [114, 62], [120, 66]];
  const BOT = [[4, 74], [30, 76], [56, 80], [76, 88], [92, 96], [104, 96], [114, 90], [120, 84]];
  body(put, X, 4, 120, TOP, BOT, cLt, c, cDk);
  // tail feather fringe (subtle, accurate)
  for (let x = 8; x <= 40; x += 4) stroke(put, X(x), X(pw(x, BOT)), X(x - 2), X(pw(x, BOT) + 4), X(1), () => mix(c, cDk, 0.5));
  // back stripes
  for (let x = 48; x <= 100; x += 10) { for (let i = 0; i <= 6; i++) put(Math.round(X(x - i * 0.4)), Math.round(X(pw(x, TOP) + i)), cDk); }
  // near leg
  theroLeg(put, X, 96, 92, 1.1, cLt, c, cDk, false);
  // folded arms w/ feather fringe
  stroke(put, X(112), X(76), X(122), X(84), X(3), () => c);
  stroke(put, X(122), X(84), X(118), X(90), X(2), () => cDk);
  for (let k = 0; k < 3; k++) stroke(put, X(114 + k * 3), X(80 + k * 2), X(111 + k * 3), X(86 + k * 2), X(1), () => mix(c, cDk, 0.5));
  // S-neck up-forward
  stroke(put, X(118), X(68), X(124), X(58), X(9), () => c);
  stroke(put, X(124), X(58), X(131), X(50), X(7.4), () => mix(cLt, c, 0.4));
  // head: long low skull, open jaw
  const HTOP = [[126, 42], [134, 40], [144, 42], [154, 46]];
  const HBOT = [[126, 52], [136, 52], [146, 50], [154, 48]];
  body(put, X, 126, 154, HTOP, HBOT, cLt, c, cDk);
  // lower jaw dropped
  for (let x = 136; x <= 152; x++) { const t = (x - 136) / 16; for (let y = 52 + t * 2; y <= 56 + t * 1; y++) put(Math.round(X(x)), Math.round(X(y)), mix(c, cDk, 0.5 + t * 0.3)); }
  row(put, Math.round(X(51.5)), X(138), X(153), () => P.night); // mouth gap
  [[140], [145], [150]].forEach(([tx2]) => { stroke(put, X(tx2), X(51.5), X(tx2), X(53.5), X(0.9), () => P.tooth); stroke(put, X(tx2 + 2), X(55), X(tx2 + 2), X(53.5), X(0.9), () => P.tooth); });
  put(Math.round(X(133)), Math.round(X(44)), P.eye); put(Math.round(X(133.8)), Math.round(X(44.4)), P.night);
  stroke(put, X(152), X(44), X(155), X(45), X(1), () => cDk); // snout tip
  // head feather crest hint
  for (let k = 0; k < 4; k++) stroke(put, X(127 + k * 2), X(41), X(125 + k * 2), X(36), X(1), () => mix(c, cDk, 0.4));
}

// ============ 2 TRICERATOPS — the head is a third of the animal
function trike160(put, S) {
  const X = U(S); floor(put, S, 32); shadow(put, X(78), X(134), X(52), X(7));
  const cLt = P.dinoBLt, c = P.dinoB, cDk = P.dinoBDk;
  // far legs
  stroke(put, X(52), X(100), X(48), X(128), X(8), () => cDk); // rear far
  stroke(put, X(96), X(102), X(94), X(126), X(7), () => cDk); // front far
  // body barrel: hips high, shoulders lower
  const TOP = [[14, 92], [28, 78], [46, 66], [66, 62], [86, 64], [102, 70]];
  const BOT = [[14, 98], [28, 108], [46, 118], [66, 120], [86, 116], [102, 108]];
  body(put, X, 14, 102, TOP, BOT, cLt, c, cDk);
  // skin creases
  [[36], [56], [76]].forEach(([sx2]) => { for (let i = 0; i <= 8; i++) put(Math.round(X(sx2 + i * 0.2)), Math.round(X(pw(sx2, TOP) + 4 + i * 4)), mix(cDk, c, 0.4)); });
  // near legs — columns w/ toes
  stroke(put, X(60), X(104), X(58), X(132), X(9), () => c);
  ell(put, X(58), X(133), X(6), X(3), (tx, ty) => mix(cLt, cDk, ty)); [[54, 135], [58, 136], [62, 135]].forEach(([nx, ny]) => put(Math.round(X(nx)), Math.round(X(ny)), P.horn));
  stroke(put, X(102), X(104), X(103), X(130), X(8), () => mix(c, cDk, 0.25));
  ell(put, X(103), X(131), X(5.4), X(3), (tx, ty) => mix(cLt, cDk, ty)); [[100, 133], [104, 134], [107, 132]].forEach(([nx, ny]) => put(Math.round(X(nx)), Math.round(X(ny)), P.horn));
  // massive skull: brow ridge down to beak
  const HTOP = [[108, 56], [122, 58], [136, 68], [148, 82]];
  const HBOT = [[108, 90], [124, 94], [140, 96], [148, 98]];
  body(put, X, 108, 148, HTOP, HBOT, cLt, c, cDk);
  // FRILL: drawn AFTER the skull — one solid shield sweeping up-back
  for (let a = -0.5; a <= 2.5; a += 0.02) {
    const fr = 27 - Math.abs(Math.sin(a * 1.6)) * 3;
    const fx = 112 - Math.cos(a - 0.9) * fr * 0.8, fy = 60 - Math.sin(a - 0.9) * fr;
    stroke(put, X(112), X(62), X(fx), X(fy), X(1.8), () => mix(P.dinoRLt, P.dinoRDk, clamp(a / 2.5 * 0.6 + 0.15, 0, 1)));
  }
  // frill rim + epoccipital studs
  for (let a = -0.5; a <= 2.5; a += 0.3) {
    const fx = 112 - Math.cos(a - 0.9) * 22, fy = 60 - Math.sin(a - 0.9) * 27;
    ell(put, X(fx), X(fy), X(1.8), X(1.8), () => P.hornDk);
  }
  // BROW HORNS — two long continuous tapered curves, forward over the eyes
  [[126, 60, 142, 32, 3.6, 0], [132, 62, 150, 40, 3, 0.15]].forEach(([bx, by, tx2, ty2, w, fd]) => {
    let px2 = bx, py2 = by;
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      const nx = bx + (tx2 - bx) * t + Math.sin(t * 1.8) * 3;
      const ny = by + (ty2 - by) * t;
      stroke(put, X(px2), X(py2), X(nx), X(ny), X(Math.max(1.2, w * (1 - t * 0.6))), () => mix(P.horn, P.hornDk, t * 0.45 + fd));
      px2 = nx; py2 = ny;
    }
  });
  // beak (parrot hook)
  for (let x = 146; x <= 156; x++) { const t = (x - 146) / 10; for (let y = 86 + t * 6; y <= 98 - t * 2; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.horn, P.hornDk, t)); }
  stroke(put, X(156), X(92), X(154), X(97), X(1.6), () => P.hornDk);
  row(put, Math.round(X(94)), X(134), X(150), () => mix(cDk, P.night, 0.4)); // mouthline
  // nose horn (short) on the snout
  stroke(put, X(142), X(80), X(146), X(70), X(2.6), () => P.horn);
  ell(put, X(125), X(70), X(2), X(2.2), () => P.eye); put(Math.round(X(125.5)), Math.round(X(70.4)), P.night);
  // short tail
  const TT = [[2, 96], [14, 92]], TB = [[2, 100], [14, 98]];
  body(put, X, 2, 14, TT, TB, cLt, c, cDk);
}

// ============ 3 STEGOSAURUS — tiny head, peaked hips, thagomizer
function stego160(put, S) {
  const X = U(S); floor(put, S, 33); shadow(put, X(80), X(134), X(50), X(7));
  const cLt = P.dinoGLt, c = P.dinoG, cDk = P.dinoGDk;
  // far legs
  stroke(put, X(58), X(96), X(54), X(128), X(8), () => cDk);   // rear far (long)
  stroke(put, X(106), X(102), X(104), X(126), X(6), () => cDk); // front far (short)
  // body: arch peaks over the HIPS (rear third)
  const TOP = [[18, 84], [34, 72], [52, 60], [68, 58], [88, 66], [106, 80], [122, 90]];
  const BOT = [[18, 92], [34, 102], [52, 112], [68, 114], [88, 112], [106, 106], [122, 100]];
  body(put, X, 18, 122, TOP, BOT, cLt, c, cDk);
  // belly shade
  for (let x = 40; x <= 104; x++) put(Math.round(X(x)), Math.round(X(pw(x, BOT) - 1)), mix(P.belly, cDk, 0.35));
  // near legs: rear = tall pillar, front = short
  stroke(put, X(64), X(100), X(62), X(132), X(9), () => c);
  ell(put, X(62), X(133), X(5.4), X(2.6), (tx, ty) => mix(cLt, cDk, ty));
  stroke(put, X(112), X(102), X(112), X(128), X(6.4), () => mix(c, cDk, 0.2));
  ell(put, X(112), X(129), X(4.4), X(2.4), (tx, ty) => mix(cLt, cDk, ty));
  // tiny head LOW at the ground, grazing height
  const HTOP = [[122, 88], [134, 90], [146, 94]];
  const HBOT = [[122, 100], [134, 100], [146, 100]];
  body(put, X, 122, 146, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(146), X(97), X(151), X(98), X(2.4), () => P.hornDk); // beak
  put(Math.round(X(136)), Math.round(X(92)), P.eye); put(Math.round(X(136.8)), Math.round(X(92.4)), P.night);
  // PLATES — two alternating rows, biggest over the hips
  const plateAt = (px2, h, dark) => {
    const base = pw(px2, TOP); if (base == null) return;
    for (let i = 0; i <= h; i++) {
      const t = i / h, w = 6 * (1 - Math.abs(t - 0.35) * 1.4);
      if (w <= 0) continue;
      row(put, Math.round(X(base - i)), X(px2 - w), X(px2 + w), (tx) => mix(dark ? P.dinoR : P.dinoRLt, P.dinoRDk, clamp(tx + t * 0.4, 0, 1)));
    }
  };
  [[26, 12], [42, 18], [58, 24], [74, 24], [92, 18], [108, 12]].forEach(([px2, h]) => plateAt(px2, h, false));
  [[34, 14], [50, 21], [66, 25], [83, 21], [100, 14]].forEach(([px2, h]) => plateAt(px2, h, true));
  // tail down to THAGOMIZER — carried level, spikes up-back
  const TT = [[2, 76], [18, 84]], TB = [[2, 84], [18, 92]];
  body(put, X, 2, 18, TT, TB, cLt, c, cDk);
  [[2, 62, 3], [10, 58, 3], [0, 74, 2.6], [8, 70, 2.6]].forEach(([sx2, sy2, w]) => stroke(put, X(sx2 + 4), X(80), X(sx2), X(sy2), X(w), () => mix(P.horn, P.hornDk, 0.25)));
}

const LIST = [
  { n: 1, name: 'RAPTOR', role: 'shape pass — horizontal, stiff tail, Z-legs', draw: raptor160 },
  { n: 2, name: 'TRICERATOPS', role: 'shape pass — giant skull + frill one piece', draw: trike160 },
  { n: 3, name: 'STEGOSAURUS', role: 'shape pass — hip peak, low head, plates', draw: stego160 },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'dino_shapes.png', title: 'PREHISTORIA — REAL DINO SHAPE PASSES (approve before the 20-sheet)', S: 160, cols: 3, scale: 2 });
}
module.exports = { raptor160, trike160, stego160, pw, body, theroLeg };
