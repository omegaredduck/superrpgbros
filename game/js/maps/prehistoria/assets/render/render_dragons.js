// artdev/prehistoria/render_dragons.js — PREHISTORIA boss take 3:
// DRAGONS, 10 work-ups on dragon160(put,S,o) — western dragon, side
// profile, dino-lesson anatomy (profiles, Z-legs, real wing bones).
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, shadow, renderSheet, floor } = KIT;
const SH = require('./render_dino_shapes.js');
const { pw, body } = SH;

function U(S) { const u = S / 160; return v => v * u; }

// o: scale/scaleLt/scaleDk · belly/bellyDk · memb/membDk (wing membrane)
//    horns:'swept'|'ram'|'crown'|'antler' · breath:'fire'|'poison'|'bolt'|'frost'|null
//    wyvern:bool (2 legs) · skeletal:bool · cracks:bool crackC · feathered:bool
//    tailTip:'spade'|'spikes'|'club' · eyeC · seed
function dragon160(put, S, o) {
  o = o || {};
  const X = U(S);
  const cLt = o.scaleLt || '#d2724e', c = o.scale || '#a8442e', cDk = o.scaleDk || '#541e10';
  const belly = o.belly || '#e8c88a', bellyDk = o.bellyDk || '#a88a4e';
  const memb = o.memb || mix(c, '#000000', 0.25), membDk = o.membDk || mix(cDk, '#000000', 0.3);
  floor(put, S, o.seed || 0);
  shadow(put, X(76), X(140), X(46), X(6));

  // ---- FAR WING (behind, darker)
  const wingBone = (ax, ay, pts, wc) => {
    let px2 = ax, py2 = ay;
    pts.forEach(([nx, ny, w]) => { stroke(put, X(px2), X(py2), X(nx), X(ny), X(w), () => wc); px2 = nx; py2 = ny; });
  };
  const drawWing = (ax, ay, sc, boneC, mC, mD) => {
    // arm up-back, then three fingers fanning left
    wingBone(ax, ay, [[ax - 8 * sc, ay - 22 * sc, 3.4 * sc], [ax - 18 * sc, ay - 34 * sc, 2.6 * sc]], boneC);
    const wrist = [ax - 18 * sc, ay - 34 * sc];
    const tips = [[ax - 58 * sc, ay - 26 * sc], [ax - 52 * sc, ay - 6 * sc], [ax - 40 * sc, ay + 6 * sc]];
    // membrane: fill between fingers with graded strokes back to the body
    for (let g = 0; g < tips.length; g++) {
      const from = g === 0 ? wrist : tips[g - 1];
      const steps = Math.max(18, Math.ceil(S / 5)); // dense at any resolution — no moiré
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ex = from[0] + (tips[g][0] - from[0]) * t, ey = from[1] + (tips[g][1] - from[1]) * t;
        stroke(put, X(ax - 6 * sc), X(ay - 4 * sc), X(ex), X(ey), X(1.6), () => mix(mC, mD, 0.3 + t * 0.35));
      }
    }
    tips.forEach(([tx2, ty2]) => stroke(put, X(wrist[0]), X(wrist[1]), X(tx2), X(ty2), X(1.8 * sc), () => boneC));
    // wing claw
    stroke(put, X(wrist[0]), X(wrist[1]), X(wrist[0] - 3), X(wrist[1] - 4), X(1.4), () => P.claw);
  };
  drawWing(96, 56, 0.9, mix(cDk, '#000000', 0.2), mix(memb, '#000000', 0.25), mix(membDk, '#000000', 0.3));

  // ---- FAR LEGS
  if (!o.wyvern) { stroke(put, X(88), X(78), X(94), X(102), X(6), () => cDk); stroke(put, X(94), X(102), X(90), X(122), X(4), () => cDk); }
  stroke(put, X(58), X(88), X(66), X(112), X(8), () => cDk);
  stroke(put, X(66), X(112), X(60), X(132), X(5), () => cDk);
  for (let k = 0; k <= 2; k++) stroke(put, X(60), X(132), X(64 + k * 4), X(135), X(2), () => mix(P.claw, cDk, 0.5));

  // ---- TAIL (curls left + tip)
  let tx2 = 42, ty2 = 80;
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    const nx = 42 - t * 40 + Math.sin(t * 3.6) * 6, ny = 80 - Math.sin(t * 2.2) * 26 + t * 8;
    stroke(put, X(tx2), X(ty2), X(nx), X(ny), X(Math.max(1.6, 9 * (1 - t * 0.8))), () => (o.skeletal && i % 2 ? P.bone : mix(c, cDk, t * 0.4)));
    tx2 = nx; ty2 = ny;
  }
  if ((o.tailTip || 'spade') === 'spade') {
    for (let i = 0; i <= 6; i++) { const t = i / 6; row(put, Math.round(X(ty2 - 5 + i * 1.6)), X(tx2 - (4 - Math.abs(t - 0.5) * 6)), X(tx2 + (4 - Math.abs(t - 0.5) * 6)), (tk) => mix(cLt, cDk, tk + t * 0.3)); }
  } else if (o.tailTip === 'spikes') {
    [[-3, -6], [0, -8], [3, -6]].forEach(([ox, oy]) => stroke(put, X(tx2), X(ty2), X(tx2 + ox), X(ty2 + oy), X(1.8), () => P.horn));
  } else { ell(put, X(tx2), X(ty2 - 2), X(4.4), X(3.6), (tk, ty3) => mix(P.horn, P.hornDk, tk + ty3 * 0.4)); }

  // ---- BODY
  const TOP = [[40, 66], [58, 60], [78, 56], [96, 54], [104, 58]];
  const BOT = [[40, 92], [58, 98], [78, 96], [96, 84], [104, 76]];
  body(put, X, 40, 104, TOP, BOT, cLt, c, cDk);
  // belly plates
  for (let x = 44; x <= 100; x += 3) { const by = pw(x, BOT) - 2; row(put, Math.round(X(by)), X(x - 1.4), X(x + 1.4), (tk) => mix(belly, bellyDk, tk + ((x / 3) % 2) * 0.2)); row(put, Math.round(X(by - 3)), X(x - 1.2), X(x + 1.2), (tk) => mix(belly, bellyDk, tk * 0.6 + ((x / 3) % 2) * 0.2)); }
  if (o.skeletal) { // exposed ribs
    [[52], [62], [72], [82]].forEach(([rx]) => { for (let a = 0.3; a <= 2.6; a += 0.1) put(Math.round(X(rx + Math.cos(a) * 7)), Math.round(X(76 + Math.sin(a) * 14)), mix(P.bone, P.boneDk, Math.abs(a - 1.45) / 1.4)); });
  }
  if (o.cracks) { [[54, 70, 62, 80], [70, 64, 76, 76], [86, 62, 90, 72]].forEach(([x0, y0, x1, y1]) => { stroke(put, X(x0), X(y0), X(x1), X(y1), X(1.2), () => (o.crackC || P.volcano)); put(Math.round(X(x1)), Math.round(X(y1)), '#ffd24a'); }); }
  if (o.feathered) { for (let x = 44; x <= 100; x += 5) stroke(put, X(x), X(pw(x, TOP) + 2), X(x - 3), X(pw(x, TOP) + 8), X(1.2), () => mix(cLt, cDk, 0.35)); }

  // ---- NEAR LEGS (Z-build)
  if (!o.wyvern) {
    stroke(put, X(94), X(76), X(102), X(96), X(6.4), () => c);
    stroke(put, X(102), X(96), X(98), X(118), X(4.4), () => mix(c, cDk, 0.3));
    for (let k = 0; k <= 2; k++) stroke(put, X(98), X(118), X(102 + k * 4), X(121), X(2.2), () => P.claw);
  }
  stroke(put, X(64), X(86), X(74), X(108), X(9), () => c);
  ell(put, X(66), X(92), X(7), X(8), (tk, ty3) => mix(cLt, c, clamp(tk + ty3 * 0.5, 0, 1)));
  stroke(put, X(74), X(108), X(68), X(128), X(5.4), () => mix(c, cDk, 0.3));
  stroke(put, X(68), X(128), X(76), X(134), X(4), () => mix(c, cDk, 0.45));
  for (let k = 0; k <= 2; k++) stroke(put, X(76), X(134), X(82 + k * 4), X(136), X(2.4), () => P.claw);

  // ---- NEAR WING (foreground, brighter)
  drawWing(88, 54, 1.15, cDk, memb, membDk);

  // ---- NECK S-curve up-right
  let nx2 = 100, ny2 = 60;
  [[110, 48, 11], [118, 38, 9], [124, 32, 8]].forEach(([nx, ny, w]) => { stroke(put, X(nx2), X(ny2), X(nx), X(ny), X(w), () => c); nx2 = nx; ny2 = ny; });
  // neck belly plates
  [[104, 58], [110, 50], [116, 42]].forEach(([px2, py2]) => row(put, Math.round(X(py2)), X(px2 - 2.4), X(px2 + 2.4), (tk) => mix(belly, bellyDk, tk)));

  // ---- HEAD
  const HTOP = [[116, 24], [128, 20], [140, 22], [152, 28]];
  const HBOT = [[116, 36], [130, 38], [142, 38], [152, 34]];
  body(put, X, 116, 152, HTOP, HBOT, cLt, c, cDk);
  // open jaw
  const JTOP = [[122, 40], [136, 44], [148, 48]];
  const JBOT = [[122, 46], [138, 51], [148, 53]];
  body(put, X, 122, 148, JTOP, JBOT, mix(cLt, c, 0.3), mix(c, cDk, 0.2), cDk);
  // maw + teeth
  for (let x = 126; x <= 147; x++) { const y0 = 36 + (x - 126) * 0.12, y1 = pw(x, JTOP); if (y1 > y0 + 2) for (let y = y0 + 2; y <= y1 - 1; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#2a0a10', P.night, 0.3)); }
  [[130], [136], [142], [147]].forEach(([tt]) => { stroke(put, X(tt), X(37 + (tt - 126) * 0.1), X(tt), X(39.5 + (tt - 126) * 0.1), X(0.9), () => P.tooth); });
  [[128], [134], [140]].forEach(([tt]) => stroke(put, X(tt), X(pw(tt, JTOP)), X(tt), X(pw(tt, JTOP) - 2.4), X(0.9), () => P.tooth));
  // eye + brow + nostril
  ell(put, X(124), X(28), X(2.2), X(2.4), () => (o.eyeC || P.eye));
  put(Math.round(X(124.6)), Math.round(X(28.4)), P.night);
  stroke(put, X(120), X(24), X(128), X(23), X(1.8), () => cDk);
  ell(put, X(146), X(26), X(1.4), X(1.8), () => cDk);
  // ---- HORNS
  const hs = o.horns || 'swept';
  if (hs === 'swept') {
    [[0, 3.4], [4, 2.6]].forEach(([off, w]) => { let hx = 118 + off, hy = 22; for (let i = 1; i <= 8; i++) { const t = i / 8; const nx = 118 + off - t * 16, ny = 22 - t * 10 + t * t * 6; stroke(put, X(hx), X(hy), X(nx), X(ny), X(w * (1 - t * 0.6)), () => mix(P.horn, P.hornDk, t * 0.5)); hx = nx; hy = ny; } });
  } else if (hs === 'ram') {
    [[0], [3]].forEach(([off]) => { for (let a = -0.6; a <= 2.4; a += 0.12) { const t = (a + 0.6) / 3; stroke(put, X(116 + off - Math.cos(a) * 7), X(20 + Math.sin(a) * 7), X(116 + off - Math.cos(a) * 7), X(20 + Math.sin(a) * 7), X(3 * (1 - t * 0.6)), () => mix(P.horn, P.hornDk, t * 0.6)); } });
  } else if (hs === 'crown') {
    [[114, 14], [119, 10], [124, 12], [128, 16]].forEach(([cx3, cy3]) => stroke(put, X(cx3), X(22), X(cx3 - 1), X(cy3), X(2), () => mix(P.horn, P.hornDk, 0.3)));
  } else { // antler
    [[0], [4]].forEach(([off]) => {
      stroke(put, X(117 + off), X(21), X(108 + off), X(8), X(2.2), () => P.horn);
      stroke(put, X(112 + off), X(14), X(105 + off), X(12), X(1.6), () => P.hornDk);
      stroke(put, X(110 + off), X(11), X(104 + off), X(5), X(1.4), () => P.hornDk);
    });
  }
  // spine spikes down neck + back
  [[108, 44], [100, 52], [90, 52], [78, 52], [66, 56], [52, 62], [44, 66]].forEach(([sx2, sy2], i) => { const base = i < 2 ? sy2 : pw(sx2, TOP) - 1; stroke(put, X(sx2), X(base + 2), X(sx2 - 2), X(base - 5 - (i === 3 ? 2 : 0)), X(2), () => (o.skeletal ? P.bone : mix(P.horn, P.hornDk, 0.35))); });

  // ---- BREATH
  if (o.breath === 'fire') {
    for (let i = 0; i <= 16; i++) { const t = i / 16; const bw = 2 + t * 7; ell(put, X(152 + t * 26 * 0.35 + t * 8), X(44 + t * 14), X(bw * 0.7), X(bw * 0.5), (tk, ty3) => mix('#ffd24a', P.volcano, clamp(t * 0.8 + tk * 0.3, 0, 1))); }
    put(Math.round(X(151)), Math.round(X(43)), '#ffffff');
  } else if (o.breath === 'poison') {
    for (let i = 0; i <= 12; i++) { const t = i / 12; ell(put, X(152 + t * 22), X(46 + t * 10 + Math.sin(t * 8) * 2), X(2 + t * 4), X(1.6 + t * 2.6), (tk) => mix(P.venom, P.venomDk, clamp(t * 0.7 + tk * 0.3, 0, 1))); }
  } else if (o.breath === 'bolt') {
    let bx = 152, by = 44; [[8, 6], [-3, 5], [9, 6], [-2, 4], [8, 5]].forEach(([dx, dy], i) => { stroke(put, X(bx), X(by), X(bx + dx), X(by + dy), X(1.8), () => (i % 2 ? '#aef4ff' : '#ffffff')); bx += dx; by += dy; });
  } else if (o.breath === 'frost') {
    for (let i = 0; i <= 12; i++) { const t = i / 12; const fx = 152 + t * 24, fy = 45 + t * 11; put(Math.round(X(fx)), Math.round(X(fy)), mix('#d8f4ff', '#5a9ab8', t)); if (i % 3 === 0) { stroke(put, X(fx - 2), X(fy), X(fx + 2), X(fy), X(0.8), () => '#aedcf0'); stroke(put, X(fx), X(fy - 2), X(fx), X(fy + 2), X(0.8), () => '#aedcf0'); } }
  }
}

const LIST = [
  { n: 1, name: 'CRIMSON KING', role: 'classic red, fire breath', draw: (p, S) => dragon160(p, S, { breath: 'fire', seed: 71 }) },
  { n: 2, name: 'EMERALD WYRM', role: 'green, poison breath', draw: (p, S) => dragon160(p, S, { scale: '#4a8a3a', scaleLt: '#78b45e', scaleDk: '#1e4214', belly: '#d8e0a0', bellyDk: '#8a945a', breath: 'poison', horns: 'ram', seed: 72 }) },
  { n: 3, name: 'OBSIDIAN', role: 'black glass, ember cracks', draw: (p, S) => dragon160(p, S, { scale: '#3a3242', scaleLt: '#5c5268', scaleDk: '#16121c', belly: '#8a8296', bellyDk: '#4a4456', cracks: true, eyeC: P.volcano, seed: 73 }) },
  { n: 4, name: 'STORM DRAKE', role: 'slate blue, lightning breath', draw: (p, S) => dragon160(p, S, { scale: '#4a6a8a', scaleLt: '#78a0be', scaleDk: '#1e3446', belly: '#c8d8e8', bellyDk: '#7a92a8', breath: 'bolt', horns: 'crown', seed: 74 }) },
  { n: 5, name: 'BONE DRAGON', role: 'skeletal, exposed ribs', draw: (p, S) => dragon160(p, S, { scale: '#8a8268', scaleLt: '#b8b096', scaleDk: '#42402e', belly: '#d8d2c0', bellyDk: '#8a8470', skeletal: true, memb: '#5a5648', eyeC: P.venom, seed: 75 }) },
  { n: 6, name: 'GOLD HOARD', role: 'gilded, fire breath', draw: (p, S) => dragon160(p, S, { scale: '#c89a3a', scaleLt: '#ecc871', scaleDk: '#6a4a10', belly: '#f6e8c0', bellyDk: '#b09a62', breath: 'fire', horns: 'crown', seed: 76 }) },
  { n: 7, name: 'THE WYVERN', role: 'two-legged, sleeker', draw: (p, S) => dragon160(p, S, { wyvern: true, scale: '#7a4a8a', scaleLt: '#a878ba', scaleDk: '#3a1e46', belly: '#d8c0e0', bellyDk: '#8a70a0', tailTip: 'spikes', seed: 77 }) },
  { n: 8, name: 'FROST WYRM', role: 'white, ice breath', draw: (p, S) => dragon160(p, S, { scale: '#b8ccd8', scaleLt: '#e8f4fa', scaleDk: '#5a7a8a', belly: '#f0f8fc', bellyDk: '#98b2c0', breath: 'frost', horns: 'antler', eyeC: '#5ac8e8', seed: 78 }) },
  { n: 9, name: 'MAGMA TYRANT', role: 'lava-cracked, club tail (fits the volcano)', draw: (p, S) => dragon160(p, S, { scale: '#5a3a34', scaleLt: '#8a5c50', scaleDk: '#2a1610', belly: '#c88a58', bellyDk: '#7a4a24', cracks: true, breath: 'fire', tailTip: 'club', seed: 79 }) },
  { n: 10, name: 'THE PRIMORDIAL', role: 'feathered dino-dragon (native)', draw: (p, S) => dragon160(p, S, { scale: '#8a6a3e', scaleLt: '#b8925e', scaleDk: '#42301a', belly: '#e0d0a0', bellyDk: '#948a5e', feathered: true, horns: 'swept', breath: 'fire', seed: 80 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'dragon_options.png', title: 'PREHISTORIA — DRAGONS (boss) — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { dragon160, LIST };
