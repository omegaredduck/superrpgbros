// artdev/prehistoria/render_rex_shape.js — THE TYRANT KING (T. rex)
// full-canvas shape pass. Parameterized rex160(put,S,o) — real rex
// anatomy: massive deep skull, thick S-neck, horizontal spine over
// huge hips, tiny two-finger arms, freight-train tail.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, shadow, renderSheet, floor } = KIT;
const SH = require('./render_dino_shapes.js');
const { pw, body } = SH;

function U(S) { const u = S / 160; return v => v * u; }

function rex160(put, S, o) {
  o = o || {};
  const X = U(S);
  const cLt = o.cLt || '#8a7a52', c = o.c || '#5a4e32', cDk = o.cDk || '#2a2414';
  const belly = o.belly || P.belly;
  if (!o.noFloor) floor(put, S, 88);
  shadow(put, X(78), X(140), X(52), X(7));

  // ---- far leg (behind body)
  const fl = { hx: 70, hy: 92 };
  stroke(put, X(fl.hx), X(fl.hy), X(fl.hx + 14), X(fl.hy + 22), X(13), () => cDk); // thigh
  stroke(put, X(fl.hx + 14), X(fl.hy + 22), X(fl.hx + 6), X(fl.hy + 40), X(7), () => cDk); // shin
  stroke(put, X(fl.hx + 6), X(fl.hy + 40), X(fl.hx + 16), X(fl.hy + 46), X(5), () => cDk); // meta
  for (let k = 0; k <= 2; k++) stroke(put, X(fl.hx + 16), X(fl.hy + 46), X(fl.hx + 23 + k * 4), X(fl.hy + 48), X(2.6), () => mix(P.claw, cDk, 0.5));

  // ---- TAIL + TORSO silhouette (freight train)
  const TOP = [[2, 66], [22, 62], [42, 56], [60, 50], [78, 46], [92, 48], [102, 54]];
  const BOT = [[2, 72], [22, 78], [42, 88], [60, 98], [78, 100], [92, 92], [102, 82]];
  body(put, X, 2, 102, TOP, BOT, cLt, c, cDk);
  // belly underline + skin creases
  for (let x = 46; x <= 96; x++) put(Math.round(X(x)), Math.round(X(pw(x, BOT) - 1)), mix(belly, cDk, 0.4));
  [[36], [52], [68], [84]].forEach(([sx2]) => { for (let i = 0; i <= 7; i++) put(Math.round(X(sx2 + i * 0.3)), Math.round(X(pw(sx2, TOP) + 6 + i * 4)), mix(cDk, c, 0.45)); });
  if (o.scars) { stroke(put, X(48), X(66), X(60), X(78), X(1.4), () => mix('#c86a5a', cDk, 0.3)); stroke(put, X(54), X(64), X(64), X(74), X(1.2), () => mix('#c86a5a', cDk, 0.4)); }

  // ---- near leg (massive drumstick)
  const nl = { hx: 76, hy: 94 };
  stroke(put, X(nl.hx), X(nl.hy), X(nl.hx + 15), X(nl.hy + 20), X(15), () => c);
  ell(put, X(nl.hx + 6), X(nl.hy + 8), X(11), X(12), (tx, ty) => mix(cLt, c, clamp(tx + ty * 0.5, 0, 1))); // thigh mass
  stroke(put, X(nl.hx + 15), X(nl.hy + 20), X(nl.hx + 7), X(nl.hy + 38), X(8), () => mix(c, cDk, 0.3));
  stroke(put, X(nl.hx + 7), X(nl.hy + 38), X(nl.hx + 17), X(nl.hy + 45), X(5.4), () => mix(c, cDk, 0.45));
  for (let k = 0; k <= 2; k++) stroke(put, X(nl.hx + 17), X(nl.hy + 45), X(nl.hx + 25 + k * 4), X(nl.hy + 47), X(3), () => P.claw);

  // ---- tiny two-finger arms (iconic)
  stroke(put, X(96), X(68), X(104), X(74), X(3.4), () => c);
  stroke(put, X(104), X(74), X(103), X(79), X(2.4), () => mix(c, cDk, 0.3));
  [[105, 81], [102, 82]].forEach(([fx, fy]) => put(Math.round(X(fx)), Math.round(X(fy)), P.claw));

  // ---- thick S-neck
  stroke(put, X(98), X(60), X(106), X(46), X(15), () => c);
  stroke(put, X(106), X(46), X(112), X(38), X(12), () => mix(cLt, c, 0.35));

  // ---- THE SKULL — deep, boxy, brow ridges
  const HTOP = [[104, 24], [116, 20], [134, 22], [150, 28]];
  const HBOT = [[104, 40], [118, 44], [136, 46], [150, 44]];
  body(put, X, 104, 150, HTOP, HBOT, cLt, c, cDk);
  // upper teeth
  row(put, Math.round(X(45)), X(122), X(149), () => P.night);
  [[124, 3], [129, 4], [134, 3.4], [139, 4], [144, 3], [148, 2.6]].forEach(([tx2, ln]) => { for (let i = 0; i <= ln; i++) row(put, Math.round(X(45 + i)), X(tx2 - (1.4 - i * 0.25)), X(tx2 + (1.4 - i * 0.25)), () => P.tooth); });
  // LOWER JAW — open, hinged at the cheek
  const JTOP = [[112, 50], [128, 56], [144, 62]];
  const JBOT = [[112, 58], [130, 66], [144, 70]];
  body(put, X, 112, 144, JTOP, JBOT, mix(cLt, c, 0.3), mix(c, cDk, 0.2), cDk);
  [[120, 3], [126, 3.4], [132, 3], [138, 2.6]].forEach(([tx2, ln]) => { for (let i = 0; i <= ln; i++) row(put, Math.round(X(pw(tx2, JTOP) - i)), X(tx2 - (1.3 - i * 0.25)), X(tx2 + (1.3 - i * 0.25)), () => P.tooth); });
  // maw shadow between jaws
  for (let x = 116; x <= 143; x++) { const y0 = 45 + (x - 116) * 0.1, y1 = pw(x, JTOP); if (y1 > y0 + 4) for (let y = y0 + 4; y <= y1 - 1; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#2a0a10', P.night, 0.4)); }
  // brow ridge + eye + nostril
  stroke(put, X(110), X(26), X(118), X(24), X(2.6), () => cDk);
  ell(put, X(115), X(30), X(2.4), X(2.6), () => o.eyeC || P.eye);
  put(Math.round(X(115.6)), Math.round(X(30.4)), P.night);
  ell(put, X(144), X(32), X(1.6), X(2), () => cDk);
  // cheek ridge
  stroke(put, X(120), X(38), X(128), X(40), X(2), () => mix(cDk, c, 0.4));

  // ---- optional regalia (for TYRANT KING work-ups)
  if (o.crown) {
    // bone crown lashed to the skull
    row(put, Math.round(X(18)), X(108), X(128), () => P.boneDk);
    [[110, 12], [117, 8], [124, 12]].forEach(([cx2, cy2]) => { stroke(put, X(cx2), X(18), X(cx2), X(cy2), X(2.4), () => P.bone); put(Math.round(X(cx2)), Math.round(X(cy2 - 1)), P.horn); });
  }
  if (o.roar) {
    [[152, 26], [156, 34], [154, 44]].forEach(([rx, ry]) => stroke(put, X(rx), X(ry), X(rx + 4), X(ry), X(1.2), () => mix(P.white, P.night, 0.5)));
  }
}

const LIST = [
  { n: 1, name: 'THE TYRANT KING', role: 'T. rex shape pass — approve first', draw: (p, S) => rex160(p, S, { roar: true }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'rex_shape.png', title: 'THE TYRANT KING — REX SHAPE PASS', S: 160, cols: 1, scale: 3 });
}
module.exports = { rex160 };
