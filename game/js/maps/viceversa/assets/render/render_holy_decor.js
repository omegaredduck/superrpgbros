// artdev/underworld/render_holy_decor.js — VICE VERSA holy-side decor:
// full 20-sheet (8 carried over from the mixed sheet + 12 new).
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, lick, soulMote, embers } = KIT;
const BASE = require('./render_eternal_decor.js').LIST;

const G = {
  marble: '#f2efe6', marbleDk: '#a8a496', gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a', wing: '#f8f6ee', wingDk: '#b0aa98',
  sky: '#a8d8f0', ink: '#2a2420', white: '#ffffff'
};
function U(S) { const u = S / 160; return v => v * u; }
const carried = n => BASE.find(e => e.n === n).draw;
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S, y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}
function halo(put, cx, cy, r) {
  for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
}

// 9 PEARLY GATE
function dGate(put, S) {
  const X = U(S); lightMotes(put, S, 5, 41); shadow(put, X(80), X(126), X(34), X(4));
  // gate posts
  [[46], [114]].forEach(([px2]) => {
    for (let y = 48; y <= 122; y++) row(put, Math.round(X(y)), X(px2 - 5), X(px2 + 5), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.2 + (y - 48) / 120, 0, 1)));
    ell(put, X(px2), X(46), X(6), X(5), (tx, ty) => mix(G.white, G.marbleDk, tx + ty * 0.4)); // pearl finial
    put(Math.round(X(px2 - 2)), Math.round(X(44)), G.white);
  });
  // arched golden bars
  for (let a = 3.34; a <= 6.08; a += 0.028) { const ax = 80 + Math.cos(a) * 32, ay = 92 + Math.sin(a) * 46; put(Math.round(X(ax)), Math.round(X(ay)), G.gold); put(Math.round(X(ax)), Math.round(X(ay + 1)), G.goldDk); }
  [[-24], [-16], [-8], [0], [8], [16], [24]].forEach(([o]) => {
    const topY = 92 - Math.sqrt(Math.max(0, 1 - (o / 32) * (o / 32))) * 46;
    stroke(put, X(80 + o), X(topY + 2), X(80 + o), X(122), X(1.6), () => (o % 16 ? G.gold : G.goldDk));
  });
  row(put, Math.round(X(96)), X(50), X(110), () => G.goldDk); // mid rail
  // glow beyond the bars
  for (let y = 60; y <= 120; y += 2) for (let x = 58; x <= 102; x += 3) if ((x + y) % 6 === 0) put(Math.round(X(x)), Math.round(X(y)), mix(G.holy, H.night, 0.62));
  soulMote(put, X(80), X(108), X(3), 0.35); // a soul waiting at the gate
}

// 10 GOLDEN FENCE — destructible (mirror of the bone fence)
function dGoldFence(put, S) {
  const X = U(S); lightMotes(put, S, 4, 42); shadow(put, X(80), X(122), X(40), X(4));
  [[36], [80], [124]].forEach(([px2]) => {
    stroke(put, X(px2), X(76), X(px2), X(118), X(3), () => G.gold);
    ell(put, X(px2), X(72), X(2.6), X(3.4), (tx, ty) => mix(G.goldLt, G.goldDk, tx + ty * 0.3)); // spear finial
    ell(put, X(px2), X(120), X(4), X(2), () => G.goldDk);
  });
  // twin rails w/ scrollwork curls
  [[86], [102]].forEach(([ry]) => row(put, Math.round(X(ry)), X(36), X(124), () => G.goldDk));
  [[52, 94], [80, 94], [108, 94]].forEach(([sx2, sy2]) => { for (let a = 0; a < 5.6; a += 0.24) put(Math.round(X(sx2 + Math.cos(a) * (4 - a * 0.4))), Math.round(X(sy2 + Math.sin(a) * (4 - a * 0.4))), G.gold); });
  // one bent bar (deterioration preview) + gleam
  stroke(put, X(94), X(86), X(98), X(102), X(1.4), () => G.goldDk);
  put(Math.round(X(37)), Math.round(X(80)), G.white);
}

// 11 SUNDIAL
function dSundial(put, S) {
  const X = U(S); lightMotes(put, S, 5, 43); shadow(put, X(80), X(122), X(26), X(5));
  // pedestal
  for (let y = 100; y <= 120; y++) { const t = (y - 100) / 20, w = 8 + t * 8; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.2 + t * 0.2, 0, 1))); }
  // dial plate
  ell(put, X(80), X(96), X(28), X(10), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx * 1.15 + ty * 0.4, 0, 1)));
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; put(Math.round(X(80 + Math.cos(a) * 24)), Math.round(X(96 + Math.sin(a) * 8.4)), G.goldDk); }
  // gnomon + cast shadow wedge
  stroke(put, X(80), X(96), X(88), X(78), X(2), () => G.goldDk);
  stroke(put, X(88), X(78), X(80), X(96), X(1), () => G.goldLt);
  for (let i = 0; i <= 10; i++) { const t = i / 10; stroke(put, X(80), X(96), X(64 - t * 2), X(100 + t * 2), X(1), () => mix(G.goldDk, '#4a3208', 0.5)); }
  // it is ALWAYS noon here — little sun mark glowing
  ell(put, X(80), X(90), X(2.6), X(1.8), () => G.holyLt);
}

// 12 DOVECOTE
function dDovecote(put, S) {
  const X = U(S); lightMotes(put, S, 5, 44); shadow(put, X(80), X(126), X(18), X(4));
  // post + white house
  stroke(put, X(80), X(126), X(80), X(96), X(3.4), () => '#a89068');
  for (let y = 62; y <= 96; y++) { const t = (y - 62) / 34, w = 16 - Math.abs(t - 0.5) * 2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.white, G.wingDk, clamp(tx * 1.15 + t * 0.2, 0, 1))); }
  // roof
  for (let y = 50; y <= 62; y++) { const w = (y - 50) * 1.6; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.gold, G.goldDk, tx)); }
  put(Math.round(X(80)), Math.round(X(47)), G.goldLt);
  // round doors + perch pegs
  [[70, 74], [90, 74], [80, 86]].forEach(([dx, dy]) => { ell(put, X(dx), X(dy), X(3.4), X(3.8), () => '#2a2434'); stroke(put, X(dx - 3), X(dy + 5), X(dx + 3), X(dy + 5), X(1.2), () => '#a89068'); });
  // doves: one in a door, one on the roof, one landing
  ell(put, X(80), X(86), X(2.6), X(2.4), (tx, ty) => mix(G.white, G.wingDk, ty)); put(Math.round(X(78.6)), Math.round(X(85)), G.ink);
  ell(put, X(72), X(48), X(3), X(2.6), (tx, ty) => mix(G.white, G.wingDk, ty)); put(Math.round(X(70)), Math.round(X(47)), G.ink);
  ell(put, X(106), X(60), X(3), X(2.4), () => G.white);
  stroke(put, X(103), X(58), X(98), X(54), X(1.2), () => G.wing);
  stroke(put, X(109), X(58), X(114), X(54), X(1.2), () => G.wing);
}

// 13 LILY GARDEN
function dLilies(put, S) {
  const X = U(S); lightMotes(put, S, 5, 45);
  // bed
  ell(put, X(80), X(108), X(36), X(12), (tx, ty) => mix('#4a6a38', '#22341a', clamp(tx + ty * 0.5, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.16) put(Math.round(X(80 + Math.cos(a) * 37)), Math.round(X(108 + Math.sin(a) * 12.6)), mix(G.marble, G.marbleDk, (Math.sin(a * 5) + 1) / 2)); // stone edging
  // lilies: stems + trumpet blooms
  [[58, 100, -0.3], [72, 92, 0.1], [88, 96, -0.1], [102, 102, 0.3], [80, 106, 0]].forEach(([lx, ly, lean]) => {
    stroke(put, X(lx), X(ly + 12), X(lx + lean * 10), X(ly - 8), X(1.4), () => '#3e6a2a');
    stroke(put, X(lx + lean * 5), X(ly), X(lx + 6), X(ly + 2), X(1), () => '#4a7a34'); // leaf
    // white trumpet w/ gold stamens
    const bx = lx + lean * 10, by = ly - 10;
    for (let k = -2; k <= 2; k++) stroke(put, X(bx), X(by + 2), X(bx + k * 2.6), X(by - 4), X(1.8), () => mix(G.white, G.wingDk, Math.abs(k) * 0.15));
    put(Math.round(X(bx)), Math.round(X(by - 1)), G.gold);
    put(Math.round(X(bx - 1)), Math.round(X(by - 3)), G.goldLt);
  });
  // butterflies of light
  [[52, 72], [104, 78]].forEach(([bx, by]) => { put(Math.round(X(bx - 1)), Math.round(X(by)), G.holyLt); put(Math.round(X(bx + 1)), Math.round(X(by)), G.holyLt); put(Math.round(X(bx)), Math.round(X(by + 1)), G.holy); });
}

// 14 SCRIPTURE TABLETS
function dTablets(put, S) {
  const X = U(S); lightMotes(put, S, 5, 46); shadow(put, X(80), X(124), X(28), X(5));
  // twin stone tablets, rounded tops, leaning together
  [[-1, 62], [1, 98]].forEach(([sd, cx2]) => {
    for (let y = 56; y <= 118; y++) {
      const o = (y - 56) * -sd * 0.08;
      let w = 15;
      if (y < 70) w = Math.sqrt(Math.max(0, 1 - Math.pow((70 - y) / 14, 2))) * 15;
      row(put, Math.round(X(y)), X(cx2 + o - w), X(cx2 + o + w), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.15 + (y - 56) / 100, 0, 1)));
    }
    // glowing script lines
    for (let ly = 74; ly <= 108; ly += 7) stroke(put, X(cx2 - 9 + (ly - 56) * -sd * 0.08), X(ly), X(cx2 + 9 + (ly - 56) * -sd * 0.08), X(ly), X(1), () => mix(G.holy, G.marbleDk, 0.25));
  });
  // light beam from above between them
  for (let y = 20; y <= 56; y++) { const t = (y - 20) / 36; row(put, Math.round(X(y)), X(76 - t * 2), X(84 + t * 2), (tx) => (((tx * 6) | 0) % 3 === 0 ? mix(G.holy, H.night, 0.5) : mix(G.holy, H.night, 0.85))); }
}

// 15 FLOATING HALO MONUMENT
function dHaloMon(put, S) {
  const X = U(S); lightMotes(put, S, 6, 47); shadow(put, X(80), X(124), X(20), X(4));
  // broken statue base — the halo remains, hovering
  plate(put, X(62), X(108), X(98), X(120), G.marble, G.white, G.marbleDk);
  for (let y = 96; y <= 108; y++) { const w = 10 - (y - 96) * 0.2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.marble, G.marbleDk, tx)); }
  stroke(put, X(74), X(96), X(86), X(92), X(1.4), () => G.marbleDk); // jagged break
  // the great golden halo floating
  for (let a = 0; a < 6.28; a += 0.02) {
    const hx = 80 + Math.cos(a) * 26, hy = 56 + Math.sin(a) * 10;
    put(Math.round(X(hx)), Math.round(X(hy)), mix(G.goldLt, G.gold, (Math.sin(a * 4) + 1) / 2));
    put(Math.round(X(hx)), Math.round(X(hy + 1)), G.goldDk);
  }
  for (let a = 0; a < 6.28; a += 0.32) put(Math.round(X(80 + Math.cos(a) * 30)), Math.round(X(56 + Math.sin(a) * 12.4)), mix(G.holy, H.night, 0.5)); // glow
  // light rain falling from it onto the stump
  for (let i = 0; i <= 8; i++) { const t = i / 8; stroke(put, X(70 + i * 2.6), X(64 + (i % 3) * 4), X(70 + i * 2.6), X(70 + (i % 3) * 4), X(0.7), () => mix(G.holyLt, H.night, 0.35 + t * 0.2)); }
}

// 16 TRUMPET MONUMENT
function dTrumpetMon(put, S) {
  const X = U(S); lightMotes(put, S, 5, 48); shadow(put, X(80), X(126), X(24), X(4));
  // marble cloud-swirl base
  ell(put, X(80), X(116), X(24), X(8), (tx, ty) => mix(G.marble, G.marbleDk, clamp(tx + ty * 0.4, 0, 1)));
  [[62, 112], [98, 112], [80, 120]].forEach(([cx2, cy2]) => ell(put, X(cx2), X(cy2), X(7), X(4), (tx, ty) => mix(G.white, G.marbleDk, tx * 0.6 + ty * 0.3)));
  // giant golden trumpet angled skyward
  stroke(put, X(66), X(104), X(96), X(64), X(3), () => G.gold);
  stroke(put, X(70), X(101), X(92), X(70), X(1.2), () => G.goldLt);
  // bell flare
  for (let i = 0; i <= 8; i++) { const t = i / 8; const bw = 3 + t * 8; stroke(put, X(96 + t * 8), X(64 - t * 10 - bw), X(96 + t * 8), X(64 - t * 10 + bw), X(1.6), () => mix(G.goldLt, G.goldDk, t * 0.5)); }
  // valves + mouthpiece
  [[76, 96], [80, 91], [84, 86]].forEach(([vx, vy]) => stroke(put, X(vx), X(vy), X(vx + 3), X(vy - 6), X(1.6), () => G.goldDk));
  ell(put, X(65), X(105), X(2.4), X(2.4), () => G.goldDk);
  // sound of the last day, rising
  [[14, 0.4], [22, 0.58], [30, 0.74]].forEach(([rr, fd]) => { for (let a = -1.1; a <= 0.3; a += 0.06) put(Math.round(X(108 + Math.cos(a) * rr)), Math.round(X(48 + Math.sin(a) * rr)), mix(G.holyLt, H.night, fd)); });
}

// 17 CHALICE PEDESTAL
function dChalice(put, S) {
  const X = U(S); lightMotes(put, S, 5, 49); shadow(put, X(80), X(126), X(20), X(4));
  // fluted pedestal
  for (let y = 92; y <= 122; y++) { const t = (y - 92) / 30, w = 9 + t * 7; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.marble, G.marbleDk, clamp(Math.abs(Math.sin(tx * 9.4)) * 0.3 + tx * 0.5 + t * 0.15, 0, 1))); }
  plate(put, X(66), X(88), X(94), X(93), G.marble, G.white, G.marbleDk);
  // golden chalice
  for (let y = 62; y <= 74; y++) { const t = (y - 62) / 12, w = 11 - t * 6; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.25 + t * 0.2, 0, 1))); }
  stroke(put, X(80), X(74), X(80), X(84), X(2.4), () => G.gold);
  ell(put, X(80), X(86), X(6), X(2.2), (tx) => mix(G.goldLt, G.goldDk, tx));
  // overflowing holy water down the sides
  ell(put, X(80), X(61), X(9), X(2.4), (tx) => mix('#d8f4ff', '#4a90b8', tx));
  [[70, 64, 66, 84], [90, 64, 94, 84]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 10; i++) { const t = i / 10; put(Math.round(X(x0 + (x1 - x0) * t)), Math.round(X(y0 + (y1 - y0) * t)), mix('#bfeaff', '#4a90b8', t)); } });
  // radiance
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; stroke(put, X(80 + Math.cos(a) * 12), X(58 + Math.sin(a) * 8), X(80 + Math.cos(a) * 16), X(58 + Math.sin(a) * 11), X(1), () => G.holy); }
  put(Math.round(X(76)), Math.round(X(58)), G.white);
}

// 18 CLOUD BANK
function dCloud(put, S) {
  const X = U(S); lightMotes(put, S, 5, 50);
  // grounded cloud puffs (holy side terrain furniture)
  [[54, 100, 20, 9], [86, 94, 24, 11], [114, 104, 16, 7], [70, 110, 18, 7]].forEach(([cx2, cy2, cw, ch]) => {
    ell(put, X(cx2), X(cy2), X(cw), X(ch), (tx, ty) => mix(G.white, '#b8c2d0', clamp(tx * 0.8 + ty * 0.9 - 0.35, 0, 1)));
    ell(put, X(cx2 - cw * 0.4), X(cy2 - ch * 0.5), X(cw * 0.4), X(ch * 0.6), (tx, ty) => mix(G.white, '#c8d2de', ty * 0.6));
    ell(put, X(cx2 + cw * 0.3), X(cy2 - ch * 0.6), X(cw * 0.45), X(ch * 0.65), (tx, ty) => mix(G.white, '#c8d2de', ty * 0.6));
  });
  // gold-lit underside
  [[54, 108], [86, 104], [114, 110]].forEach(([gx, gy]) => stroke(put, X(gx - 10), X(gy), X(gx + 10), X(gy), X(1.2), () => mix(G.gold, H.night, 0.35)));
  // a cherub-sized dent + tiny sleeping Z
  ell(put, X(86), X(90), X(7), X(3), () => '#c8d2de');
  put(Math.round(X(96)), Math.round(X(80)), G.holyLt); put(Math.round(X(99)), Math.round(X(77)), G.holy); put(Math.round(X(102)), Math.round(X(74)), mix(G.holy, H.night, 0.3));
}

// 19 BEACON OF LIGHT
function dBeacon(put, S) {
  const X = U(S); lightMotes(put, S, 6, 51); shadow(put, X(80), X(128), X(18), X(4));
  // white tower w/ gold bands
  for (let y = 56; y <= 124; y++) { const t = (y - 56) / 68, w = 9 + t * 6; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.white, G.wingDk, clamp(tx * 1.2 + t * 0.2, 0, 1))); }
  [[70], [92], [112]].forEach(([by]) => row(put, Math.round(X(by)), X(80 - (9 + (by - 56) / 68 * 6)), X(80 + (9 + (by - 56) / 68 * 6)), () => G.gold));
  // crystal at the top
  for (let y = 38; y <= 56; y++) { const w = (y < 47 ? (y - 38) : (56 - y)) * 1.1; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.holyLt, G.holyDk, clamp(tx * 1.1, 0, 1))); }
  // beams sweeping out
  [[-1, 0.25], [1, -0.15]].forEach(([sd, sl]) => {
    for (let i = 0; i <= 24; i++) { const t = i / 24; const bw = 1.4 + t * 6; for (let k = -1; k <= 1; k += 0.5) put(Math.round(X(80 + sd * (10 + t * 52))), Math.round(X(46 + sl * t * 40 + k * bw)), mix(G.holyLt, H.night, 0.42 + Math.abs(k) * 0.25 + t * 0.2)); }
  });
  put(Math.round(X(80)), Math.round(X(36)), G.white);
}

// 20 HHARP OF THE HOST — giant standing harp
function dGreatHarp(put, S) {
  const X = U(S); lightMotes(put, S, 5, 52); shadow(put, X(80), X(126), X(24), X(4));
  // marble base
  plate(put, X(58), X(114), X(106), X(124), G.marble, G.white, G.marbleDk);
  // gold frame: pillar + curved neck + soundboard
  stroke(put, X(64), X(114), X(64), X(38), X(3), () => G.gold);
  for (let a = -0.15; a <= 1.5; a += 0.04) put(Math.round(X(64 + Math.sin(a) * 40)), Math.round(X(40 + (1 - Math.cos(a)) * 34)), G.goldDk);
  stroke(put, X(64), X(114), X(102), X(102), X(3.4), () => G.gold);
  ell(put, X(64), X(36), X(3), X(3), (tx, ty) => mix(G.goldLt, G.goldDk, tx)); // scroll
  // strings — one glowing mid-note
  for (let k = 0; k < 8; k++) {
    const t = k / 7;
    stroke(put, X(68 + t * 32), X(44 + t * 26), X(68 + t * 30), X(112 - t * 8), X(0.7), () => (k === 4 ? G.holyLt : mix(G.white, G.wingDk, 0.25)));
  }
  // note motes rising from the glowing string
  [[96, 60], [102, 50], [107, 42]].forEach(([nx, ny], i) => { ell(put, X(nx), X(ny), X(1.8), X(1.5), () => mix(G.holyLt, H.night, i * 0.18)); stroke(put, X(nx + 1.6), X(ny), X(nx + 1.6), X(ny - 4), X(0.8), () => mix(G.holyLt, H.night, i * 0.18)); });
  // it plays itself — no player. spooky-holy.
}

const LIST = [
  { n: 1, name: 'MARBLE COLUMN', role: 'fluted, ivy', draw: carried(9) },
  { n: 2, name: 'GOLDEN FOUNTAIN', role: 'blessed water', draw: carried(10) },
  { n: 3, name: 'PRAYER ALTAR', role: 'book, candles, light shaft', draw: carried(11) },
  { n: 4, name: 'STAINED GLASS ARCH', role: 'colored light pool', draw: carried(12) },
  { n: 5, name: 'HOLY BANNER', role: 'white/gold sun sigil', draw: carried(13) },
  { n: 6, name: 'ANGEL STATUE', role: 'sword-down guardian', draw: carried(14) },
  { n: 7, name: 'OLIVE TREE', role: 'silver-green, petals', draw: carried(15) },
  { n: 8, name: 'BELL TOWER', role: 'swinging gold bell', draw: carried(16) },
  { n: 9, name: 'PEARLY GATE', role: 'gold bars, glow beyond', draw: dGate },
  { n: 10, name: 'GOLDEN FENCE', role: 'DESTRUCTIBLE (global rule)', draw: dGoldFence },
  { n: 11, name: 'SUNDIAL', role: 'always noon here', draw: dSundial },
  { n: 12, name: 'DOVECOTE', role: 'white bird house', draw: dDovecote },
  { n: 13, name: 'LILY GARDEN', role: 'stone-edged blooms', draw: dLilies },
  { n: 14, name: 'SCRIPTURE TABLETS', role: 'glowing script', draw: dTablets },
  { n: 15, name: 'HALO MONUMENT', role: 'hovering over a broken statue', draw: dHaloMon },
  { n: 16, name: 'TRUMPET MONUMENT', role: 'gold horn skyward', draw: dTrumpetMon },
  { n: 17, name: 'CHALICE PEDESTAL', role: 'overflowing holy water', draw: dChalice },
  { n: 18, name: 'CLOUD BANK', role: 'grounded cloud puffs', draw: dCloud },
  { n: 19, name: 'BEACON OF LIGHT', role: 'sweeping beams', draw: dBeacon },
  { n: 20, name: 'GREAT HARP', role: 'plays itself', draw: dGreatHarp },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'holy_decor_options.png', title: 'VICE VERSA — HOLY SIDE DECOR (20) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
