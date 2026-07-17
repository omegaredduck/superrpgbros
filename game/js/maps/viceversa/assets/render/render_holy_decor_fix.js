// artdev/underworld/render_holy_decor_fix.js — VICE VERSA holy decor
// replacements for rejected #7 olive tree + #13 lily garden.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, shadow, renderSheet, lick } = KIT;
const G = {
  marble: '#f2efe6', marbleDk: '#a8a496', gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', wing: '#f8f6ee', wingDk: '#b0aa98', white: '#ffffff', ink: '#2a2420'
};
function U(S) { const u = S / 160; return v => v * u; }
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + seed * 157) % 1000) / 1000 * S, y = ((i * 683 + seed * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}

// 7 GRAND CANDELABRA — seven flames
function dCandelabra(put, S) {
  const X = U(S); lightMotes(put, S, 5, 61); shadow(put, X(80), X(126), X(26), X(4));
  // base + stem
  ell(put, X(80), X(122), X(14), X(4), (tx, ty) => mix(G.goldLt, G.goldDk, tx));
  ell(put, X(80), X(118), X(9), X(2.6), (tx) => mix(G.goldLt, G.goldDk, tx));
  stroke(put, X(80), X(118), X(80), X(84), X(3.4), () => G.gold);
  ell(put, X(80), X(96), X(4.4), X(3), (tx, ty) => mix(G.goldLt, G.goldDk, tx)); // stem knop
  // seven arms: clean U-curves from the stem junction to each cup
  const CUPS = [[46, 74], [57, 70], [68, 67], [80, 64], [92, 67], [103, 70], [114, 74]];
  CUPS.forEach(([cx2, cy2], i) => {
    if (i === 3) { stroke(put, X(80), X(84), X(80), X(cy2 + 8), X(2.4), () => G.gold); return; }
    let px2 = 80, py2 = 84;
    for (let k = 1; k <= 14; k++) {
      const t = k / 14;
      const nx = 80 + (cx2 - 80) * Math.sin(t * 1.5708);
      const ny = 84 + (cy2 + 8 - 84) * (1 - Math.cos(t * 1.5708)) + Math.sin(t * 3.1416) * 5;
      stroke(put, X(px2), X(py2), X(nx), X(ny), X(2), () => mix(G.gold, G.goldDk, Math.abs(i - 3) * 0.09));
      px2 = nx; py2 = ny;
    }
  });
  // candle cups + candles + flames: 7 across
  CUPS.forEach(([cx2, cy2]) => {
    ell(put, X(cx2), X(cy2 + 8), X(3), X(1.6), (tx) => mix(G.goldLt, G.goldDk, tx)); // cup
    stroke(put, X(cx2), X(cy2 + 6), X(cx2), X(cy2 - 2), X(2.4), () => G.white); // candle
    lick(put, X(cx2), X(cy2 - 6), X(4), H.lava, H.lavaLt);
  });
  // glow halo around the flames
  for (let a = 0; a < 6.28; a += 0.2) put(Math.round(X(80 + Math.cos(a) * 42)), Math.round(X(64 + Math.sin(a) * 12)), mix(G.holy, H.night, 0.62));
}

// 13 CHURCH PEWS — row of white benches
function dPews(put, S) {
  const X = U(S); lightMotes(put, S, 5, 62); shadow(put, X(80), X(126), X(38), X(4));
  // two pews in perspective (front + back)
  [[0, 96, 1], [1, 74, 0.82]].forEach(([back, by, sc]) => {
    const w = 44 * sc;
    // backrest
    for (let y = by - 18 * sc; y <= by - 8 * sc; y++) row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.white, G.wingDk, clamp(tx * 1.15 + (y - (by - 18 * sc)) / (22 * sc), 0, 1)));
    row(put, Math.round(X(by - 18 * sc)), X(80 - w), X(80 + w), () => G.goldDk); // gold trim rail
    // seat
    for (let y = by - 2 * sc; y <= by + 3 * sc; y++) row(put, Math.round(X(y)), X(80 - w - 2), X(80 + w + 2), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.2, 0, 1)));
    // end panels (scrolled)
    [[-1], [1]].forEach(([sd]) => {
      for (let y = by - 20 * sc; y <= by + 14 * sc; y++) row(put, Math.round(X(y)), X(80 + sd * w - 2), X(80 + sd * w + 2), (tx) => mix(G.marble, G.marbleDk, tx));
      for (let a = 0; a < 4.8; a += 0.3) put(Math.round(X(80 + sd * w + Math.cos(a) * (2.6 - a * 0.3))), Math.round(X(by - 20 * sc + Math.sin(a) * (2.6 - a * 0.3))), G.gold); // scroll top
    });
    // legs
    [[-w * 0.6], [w * 0.6]].forEach(([o]) => stroke(put, X(80 + o), X(by + 3 * sc), X(80 + o), X(by + 14 * sc), X(2.4), () => G.marbleDk));
  });
  // open hymnal left on the front pew + kneeler cushion
  for (let i = 0; i <= 5; i++) { const t = i / 5; row(put, Math.round(X(90 + t * 3)), X(58 + t * 1.4), X(70), (tx) => mix(G.white, G.wingDk, tx * 0.4)); row(put, Math.round(X(90 + t * 3)), X(70), X(82 - t * 1.4), (tx) => mix(G.holyLt, G.wingDk, (1 - tx) * 0.4)); }
  plate(put, X(92), X(108), X(116), X(114), '#8a2a3a', '#b04a5a', '#4a1018'); // red cushion
  // little light motes above (someone was just praying)
  [[64, 60], [80, 54]].forEach(([mx, my]) => put(Math.round(X(mx)), Math.round(X(my)), G.holyLt));
}

const LIST = [
  { n: 7, name: 'GRAND CANDELABRA', role: 'seven flames (replaces olive tree)', draw: dCandelabra },
  { n: 13, name: 'CHURCH PEWS', role: 'white benches (replaces lily garden)', draw: dPews },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'holy_decor_fix.png', title: 'VICE VERSA — HOLY DECOR replacements for 7 + 13', S: 160, cols: 2, scale: 2 });
}
module.exports = { LIST };
