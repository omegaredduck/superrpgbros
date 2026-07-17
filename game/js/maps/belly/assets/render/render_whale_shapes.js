// artdev/belly/render_whale_shapes.js — TITAN WHALE boss SHAPE PASS
// (big-beast rule: full-canvas silhouette first, details later).
// The boss is BEACHED + STUCK IN PLACE at the edge of the sand arena;
// the player circles in front of it dodging screen-scale attacks.
// 3 pose candidates — pick a number.
'use strict';
const KIT = require('./belly_kit.js');
const { B, mix, clamp, ell, row, stroke, renderSheet, fin } = KIT;

// shared whale hide shader
function hide(tx, ty) {
  let b = mix('#4a6a8a', '#1a2a3e', clamp(tx * 0.6 + ty * 0.7, 0, 1));
  return b;
}
function bellyC(tx) { return mix('#c8d0d4', '#7a8a90', clamp(tx, 0, 1)); }

// 1 · SIDE LOOMER — full side profile along the top edge, head left
function shapeSide(put, S) {
  const u = S / 200, X = v => v * u;
  // beach line
  for (let y = Math.round(X(150)); y < S; y++) row(put, y, 0, S, (tx) => mix('#e0c88a', '#b09454', clamp((y / u - 150) / 50 + tx * 0.2, 0, 1)));
  // body mass — huge horizontal loaf, DEVICE-SPACE column fill (no stripes)
  const x0 = Math.round(X(10)), x1 = Math.round(X(196));
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / Math.max(1, x1 - x0);
    // blunt head left: quick rise; long back arc; tail dip right
    const headEase = Math.min(1, t * 6);
    const topY = 92 - Math.sin(Math.pow(t, 0.75) * Math.PI) * 54 * headEase;
    const botY = 148 - Math.sin(t * Math.PI * 0.9) * 4;
    const yT = Math.round(X(topY)), yB = Math.round(X(botY));
    for (let y = yT; y < yB; y++) {
      const ty = (y - yT) / Math.max(1, yB - yT);
      put(x, y, ty > 0.7 && t < 0.82 ? bellyC(ty - 0.65 + t * 0.2) : hide(t * 0.7, ty));
    }
  }
  // mouth line — long jaw curve from the blunt front
  for (let t = 0; t < 1; t += 0.02) {
    const mx = X(12 + t * 58), my = X(120 + Math.sin(t * 2.6) * 6 + t * 6);
    ell(put, mx, my, X(1.4), X(1.2), () => B.oil);
  }
  ell(put, X(58), X(100), X(4.5), X(5.5), () => B.oil); // eye above jaw end
  put(Math.round(X(56.5)), Math.round(X(98)), B.white);
  // wrinkle folds behind the eye
  [[8, -6], [10, 4]].forEach(([ddx, ddy]) => stroke(put, X(58 + ddx), X(100 + ddy), X(58 + ddx * 2.2), X(100 + ddy * 1.5), 1.1, () => '#12202e'));
  // flipper mid-body flopped on sand
  fin(put, X(96), X(120), X(122), X(149), X(78), X(147), '#3a5a7a', '#12202e');
  // tail flukes right, lifted + half-buried
  fin(put, X(182), X(112), X(198), X(84), X(196), X(128), '#3a5a7a', '#12202e');
  fin(put, X(182), X(114), X(168), X(92), X(192), X(122), '#2a4a6a', '#12202e');
  // barnacle patches along the back
  [[92, 52], [120, 46], [66, 64]].forEach(([dx, dy]) => { ell(put, X(dx), X(dy), X(3), X(2.2), (tx, ty) => mix(B.bone, B.boneDk, ty)); put(Math.round(X(dx)), Math.round(X(dy)), B.oil); });
  // blowhole spray puff
  [[76, 30], [80, 24], [84, 28], [78, 20]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), B.white));
  // sand displacement mound at the belly line
  for (let x = 0; x < S; x += 3) put(x, Math.round(X(149)), '#f0dca8');
}
// 2 · HEAD-ON MAW — facing the arena, mouth agape = the backdrop wall
function shapeMaw(put, S) {
  const u = S / 200, X = v => v * u;
  for (let y = X(160); y < S; y++) row(put, Math.round(y), 0, S, (tx) => mix('#e0c88a', '#b09454', clamp((y / u - 160) / 40 + tx * 0.2, 0, 1)));
  // colossal head fills the frame — DEVICE-SPACE row fill (no stripes)
  const yTop = Math.round(X(14)), yBot = Math.round(X(144));
  for (let y = yTop; y <= yBot; y++) {
    const t = (y - yTop) / Math.max(1, yBot - yTop);
    const w = X(30 + Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5) * 64);
    const chin = t > 0.62;
    row(put, y, X(100) - w, X(100) + w, (tx) => {
      const edge = Math.abs(tx - 0.5) * 2;
      if (chin && edge < 0.92) return bellyC(edge * 0.5 + (t - 0.62));
      return hide(edge * 0.7, t);
    });
  }
  // MOUTH AGAPE — wide dark arch low on the face w/ baleen fringe
  for (let y = Math.round(X(108)); y <= Math.round(X(144)); y++) {
    const t = (y - X(108)) / (X(144) - X(108));
    const w = X((0.35 + Math.sin(Math.min(t * 1.3, 1) * Math.PI) * 0.65) * 56);
    row(put, y, X(100) - w, X(100) + w, (tx) => mix('#3a1218', B.oil, clamp(Math.abs(tx - 0.5) * 1.4 + t * 0.4, 0, 1)));
  }
  for (let i = -8; i <= 8; i++) stroke(put, X(100 + i * 6), X(110), X(100 + i * 6.3), X(120 + (8 - Math.abs(i)) * 0.8), 1.2, () => '#4a4238'); // baleen
  // eyes low on the sides
  ell(put, X(30), X(104), X(4.5), X(5.5), () => B.oil); put(Math.round(X(29)), Math.round(X(102)), B.redLt);
  ell(put, X(170), X(104), X(4.5), X(5.5), () => B.oil); put(Math.round(X(171)), Math.round(X(102)), B.redLt);
  // barnacle chin studs
  [[64, 140], [100, 148], [136, 140]].forEach(([dx, dy]) => { ell(put, X(dx), X(dy), X(3), X(2.2), (tx, ty) => mix(B.bone, B.boneDk, ty)); });
  // spray + sand mound
  [[96, 8], [102, 4], [108, 9]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), B.white));
  for (let x = 0; x < S; x += 3) put(x, Math.round(X(159)), '#f0dca8');
}
// 3 · THREE-QUARTER TITAN — head + shoulder looming from a corner
function shapeQuarter(put, S) {
  const u = S / 200, X = v => v * u;
  for (let y = X(150); y < S; y++) row(put, Math.round(y), 0, S, (tx) => mix('#e0c88a', '#b09454', clamp((y / u - 150) / 50 + tx * 0.2, 0, 1)));
  // body mass rising from top-right corner, head sweeping down-left
  for (let t = 0; t < 1; t += 0.012) {
    // spine curve: from corner (190,20) to chin (60,120)
    const sx = 190 - t * 130, sy = 18 + t * 74 + Math.sin(t * Math.PI) * 18;
    const r = 58 - t * 22;
    ell(put, X(sx), X(sy), X(r), X(r * 0.72), (tx, ty) => {
      const d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      if (d > 1) return null;
      return ty > 0.74 ? bellyC(ty - 0.6) : hide(tx * 0.8, ty + t * 0.15);
    });
  }
  // jaw line sweeping with the head + open mouth corner
  stroke(put, X(28), X(118), X(96), X(134), X(2.2), () => B.oil);
  for (let t = 0; t < 1; t += 0.05) {
    const py = X(120 + t * 16), w = X(Math.sin(t * Math.PI) * 20);
    row(put, Math.round(py), X(52) - w, X(52) + w, (tx) => mix('#3a1218', B.oil, clamp(Math.abs(tx - 0.5) + t * 0.4, 0, 1)));
  }
  // eye — big, tracking the player
  ell(put, X(66), X(96), X(7), X(8), () => B.oil);
  ell(put, X(64.5), X(94), X(2.4), X(2.8), () => B.white);
  // wrinkle folds around the eye + brow
  [[-14, -10], [-10, 8], [12, -12]].forEach(([ddx, ddy]) => stroke(put, X(66 + ddx), X(96 + ddy), X(66 + ddx * 1.8), X(96 + ddy * 1.6), 1.2, () => '#12202e'));
  // flipper slammed on the sand bottom-right
  fin(put, X(150), X(120), X(190), X(148), X(126), X(150), '#3a5a7a', '#12202e');
  // barnacle patches along the brow
  [[100, 44], [130, 34], [78, 66]].forEach(([dx, dy]) => { ell(put, X(dx), X(dy), X(3.4), X(2.6), (tx, ty) => mix(B.bone, B.boneDk, ty)); put(Math.round(X(dx)), Math.round(X(dy)), B.oil); });
  // spray
  [[176, 6], [182, 10], [170, 12]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), B.white));
  for (let x = 0; x < S; x += 3) put(x, Math.round(X(149)), '#f0dca8');
}

const LIST = [
  { n: 1, name: 'SIDE LOOMER', role: 'full profile along arena top', draw: shapeSide },
  { n: 2, name: 'HEAD-ON MAW', role: 'faces you, mouth = the wall', draw: shapeMaw },
  { n: 3, name: 'THREE-QUARTER TITAN', role: 'corner loomer, eye tracks', draw: shapeQuarter },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'whale_shape_options.png', title: 'TITAN WHALE (beached boss) — SHAPE PASS — pick a pose', S: 220, cols: 3, scale: 2 });
}
module.exports = { LIST };
