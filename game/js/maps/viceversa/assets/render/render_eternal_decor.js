// artdev/underworld/render_eternal_decor.js — ETERNAL STRUGGLE decor
// sheet: 20 candidates. 8 hell-side, 8 holy-side, 4 river/no-man's-land.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, horns, lick, soulMote, cracks, embers } = KIT;

const G = {
  marble: '#f2efe6', marbleDk: '#a8a496', gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a', wing: '#f8f6ee', wingDk: '#b0aa98',
  sky: '#a8d8f0', ink: '#2a2420', white: '#ffffff'
};
function U(S) { const u = S / 160; return v => v * u; }
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S, y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}

// ============ HELL SIDE (1-8)
// 1 BONE PILE
function dBones(put, S) {
  const X = U(S); embers(put, S, 5, 1); shadow(put, X(80), X(118), X(32), X(6));
  ell(put, X(80), X(106), X(32), X(12), (tx, ty) => mix('#6a5a48', '#2a2018', clamp(tx + ty * 0.6, 0, 1))); // mound
  // long bones crisscross
  [[52, 96, 76, 104], [86, 104, 112, 94], [64, 108, 92, 112], [98, 108, 118, 104]].forEach(([x0, y0, x1, y1]) => {
    stroke(put, X(x0), X(y0), X(x1), X(y1), X(2.4), () => H.bone);
    ell(put, X(x0), X(y0), X(2.4), X(2.4), () => H.boneDk); ell(put, X(x1), X(y1), X(2.4), X(2.4), () => H.boneDk);
  });
  // skulls
  [[68, 92, 7], [98, 96, 6], [82, 84, 8]].forEach(([sx2, sy2, sr]) => {
    ell(put, X(sx2), X(sy2), X(sr), X(sr * 0.95), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx * 0.9 + ty * 0.5 - 0.25, 0, 1)));
    ell(put, X(sx2 - sr * 0.35), X(sy2 - sr * 0.1), X(sr * 0.24), X(sr * 0.3), () => H.night);
    ell(put, X(sx2 + sr * 0.35), X(sy2 - sr * 0.1), X(sr * 0.24), X(sr * 0.3), () => H.night);
    row(put, Math.round(X(sy2 + sr * 0.55)), X(sx2 - sr * 0.4), X(sx2 + sr * 0.4), () => H.boneDk);
  });
  put(Math.round(X(82 - 3)), Math.round(X(83)), H.lava); // one skull's socket glows
}

// 2 OBSIDIAN SPIRE
function dSpire(put, S) {
  const X = U(S); embers(put, S, 6, 2); shadow(put, X(80), X(126), X(22), X(5));
  // jagged tapering spire
  for (let y = 24; y <= 122; y++) {
    const t = (y - 24) / 98;
    const w = 2 + t * 18 + Math.sin(y * 0.5) * 1.4;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(H.obsidLt, H.obsidDk, clamp(tx * 1.35 + t * 0.15, 0, 1)));
  }
  // glass edge highlights + fel veins
  for (let y = 30; y <= 116; y += 3) put(Math.round(X(80 - (2 + (y - 24) / 98 * 18))), Math.round(X(y)), '#6a5a7a');
  [[76, 60, 72, 84], [84, 70, 88, 96], [80, 40, 78, 58]].forEach(([x0, y0, x1, y1]) => { stroke(put, X(x0), X(y0), X(x1), X(y1), X(1), () => H.fel); put(Math.round(X(x1)), Math.round(X(y1)), H.felLt); });
  // shards floating
  [[56, 46], [106, 60], [102, 34]].forEach(([ox, oy]) => { for (let k = 0; k < 5; k++) put(Math.round(X(ox + k * 0.7)), Math.round(X(oy + k)), k % 2 ? H.obsidLt : '#6a5a7a'); });
}

// 3 LAVA GEYSER
function dGeyser(put, S) {
  const X = U(S); embers(put, S, 8, 3);
  // pool
  ell(put, X(80), X(112), X(30), X(10), (tx, ty) => mix(H.lava, H.lavaDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(80), X(110), X(20), X(6), (tx, ty) => mix(H.lavaLt, H.lava, tx));
  // crusted rim
  for (let a = 0; a < 6.28; a += 0.12) put(Math.round(X(80 + Math.cos(a) * 31)), Math.round(X(112 + Math.sin(a) * 11)), mix(H.rock, H.rockDk, (Math.sin(a * 3) + 1) / 2));
  // eruption column
  for (let i = 0; i <= 30; i++) {
    const t = i / 30, w = 6 - t * 2 + Math.sin(t * 9) * 1.4;
    row(put, Math.round(X(106 - t * 66)), X(80 - w), X(80 + w), (tx) => mix(H.lavaLt, H.lava, clamp(tx + t * 0.3, 0, 1)));
  }
  // blobs thrown out
  [[58, 52, 4], [102, 44, 3.4], [92, 66, 2.6], [66, 72, 2.4]].forEach(([bx, by, br]) => { ell(put, X(bx), X(by), X(br), X(br * 1.2), (tx, ty) => mix(H.lavaLt, H.lava, ty)); });
  lick(put, X(80), X(36), X(7), H.lava, H.lavaLt);
}

// 4 SOUL CAGE
function dCage(put, S) {
  const X = U(S); embers(put, S, 5, 4);
  // gallows arm
  stroke(put, X(40), X(122), X(40), X(28), X(3.4), () => H.ironDk);
  stroke(put, X(40), X(30), X(92), X(34), X(3), () => H.ironDk);
  stroke(put, X(52), X(30), X(66), X(44), X(2), () => H.iron); // brace
  // chain
  for (let y = 36; y <= 54; y += 4) ell(put, X(92), X(y), X(2), X(2.6), () => '#8a8e9a');
  // hanging cage (dome top)
  for (let a = 3.14; a <= 6.28; a += 0.05) put(Math.round(X(92 + Math.cos(a) * 18)), Math.round(X(64 + Math.sin(a) * 10)), H.iron);
  [[-18], [-9], [0], [9], [18]].forEach(([o]) => stroke(put, X(92 + o), X(62), X(92 + o * 0.8), X(102), X(1.6), () => (o % 2 ? H.iron : H.ironDk)));
  for (let a = 0; a < 3.14; a += 0.05) put(Math.round(X(92 + Math.cos(a + 3.14) * 15)), Math.round(X(102 + Math.sin(a + 3.14) * -4)), H.ironDk);
  row(put, Math.round(X(102)), X(78), X(106), () => H.ironDk);
  // souls inside pressing out
  soulMote(put, X(87), X(78), X(4.4), 0.15);
  soulMote(put, X(97), X(86), X(3.6), 0.25);
  // one escaping through the bars
  soulMote(put, X(112), X(66), X(3), 0.35);
  for (let i = 0; i <= 8; i++) put(Math.round(X(104 + i)), Math.round(X(74 - i * 0.8)), mix(H.soul, H.night, 0.35 + i * 0.06));
}

// 5 BRIMSTONE ARCH
function dArch(put, S) {
  const X = U(S); embers(put, S, 6, 5); shadow(put, X(80), X(126), X(34), X(5));
  // rough arch of stacked rock
  for (let a = 3.34; a <= 6.08; a += 0.045) {
    const ax = 80 + Math.cos(a) * 34, ay = 112 + Math.sin(a) * 58;
    ell(put, X(ax), X(ay), X(7 + Math.sin(a * 7) * 1.6), X(5), (tx, ty) => mix(H.rockLt, H.rockDk, clamp(tx * 1.2 + ty * 0.4, 0, 1)));
  }
  // horn spikes on the crown
  horns(put, X(80), X(54), X(12), H.hornDk, '#3a2e1a', 1.2);
  // fel glow inside the arch mouth
  for (let y = 78; y <= 118; y++) { const t = (y - 78) / 40, w = 20 * (1 - t * 0.15); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(mix(H.fel, H.night, 0.55), H.night, clamp(Math.abs(tx - 0.5) * 2 + t * 0.3, 0, 1))); }
  soulMote(put, X(80), X(100), X(3.4), 0.3);
  // skull keystone
  ell(put, X(80), X(56), X(6.5), X(6), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  ell(put, X(77.5), X(55), X(1.6), X(2), () => H.night); ell(put, X(82.5), X(55), X(1.6), X(2), () => H.night);
}

// 6 SPIKED WAR BANNER
function dHellBanner(put, S) {
  const X = U(S); embers(put, S, 5, 6); shadow(put, X(74), X(126), X(16), X(4));
  // spiked pole
  stroke(put, X(74), X(122), X(74), X(28), X(2.6), () => H.ironDk);
  stroke(put, X(74), X(28), X(74), X(20), X(1.8), () => H.iron);
  [[68, 34], [80, 34]].forEach(([sx2, sy2]) => stroke(put, X(74), X(38), X(sx2), X(sy2), X(1.6), () => H.iron)); // cross spikes
  put(Math.round(X(74)), Math.round(X(18)), H.lavaLt); // tip ember
  // torn banner w/ demon sigil
  for (let y = 40; y <= 92; y++) {
    const t = (y - 40) / 52;
    const xr = 74 + 34 - Math.sin(t * 8) * 2 - (t > 0.75 ? (t - 0.75) * 40 * ((y % 4) < 2 ? 1 : 0.4) : 0);
    row(put, Math.round(X(y)), X(76), X(xr), (tx) => mix('#7a1a18', '#2e0806', clamp(tx * 1.2 + t * 0.25, 0, 1)));
  }
  // fel sigil (horned circle)
  for (let a = 0; a < 6.28; a += 0.09) put(Math.round(X(92 + Math.cos(a) * 8)), Math.round(X(62 + Math.sin(a) * 9)), H.fel);
  horns(put, X(92), X(56), X(5), H.fel, H.felDk, 1);
  put(Math.round(X(89)), Math.round(X(61)), H.felLt); put(Math.round(X(95)), Math.round(X(61)), H.felLt);
  // chains + skull at the base
  ell(put, X(66), X(118), X(4.4), X(4), (tx, ty) => mix('#f2ecd8', H.boneDk, tx + ty * 0.3));
  for (let x = 60; x <= 88; x += 4) ell(put, X(x), X(122), X(1.8), X(1.4), () => '#5a5e68');
}

// 7 GARGOYLE IDOL
function dIdol(put, S) {
  const X = U(S); embers(put, S, 5, 7); shadow(put, X(80), X(126), X(24), X(5));
  plate(put, X(56), X(108), X(104), X(122), H.rock, H.rockLt, H.rockDk); // plinth
  row(put, Math.round(X(108)), X(56), X(104), () => H.rockDk);
  // squat idol: crouched demon, oversized head
  ell(put, X(80), X(92), X(17), X(14), (tx, ty) => mix(H.rockLt, H.rockDk, clamp(tx * 1.15 + ty * 0.5 - 0.1, 0, 1)));
  ell(put, X(80), X(68), X(14), X(12), (tx, ty) => mix(H.rockLt, H.rockDk, clamp(tx * 1.15 + ty * 0.45 - 0.15, 0, 1)));
  horns(put, X(80), X(60), X(12), H.rockLt, H.rockDk, 1.15);
  // gaping mouth — offering bowl of fire
  ell(put, X(80), X(74), X(8), X(5), () => H.night);
  lick(put, X(80), X(72), X(4.4), H.lava, H.lavaLt);
  put(Math.round(X(74)), Math.round(X(65)), H.lava); put(Math.round(X(86)), Math.round(X(65)), H.lava);
  // folded stone wings
  stroke(put, X(64), X(84), X(52), X(70), X(3.4), () => H.rockDk);
  stroke(put, X(96), X(84), X(108), X(70), X(3.4), () => H.rockDk);
  // claws over plinth edge
  [[66, 106], [70, 108], [90, 108], [94, 106]].forEach(([cx2, cy2]) => stroke(put, X(cx2), X(cy2), X(cx2), X(cy2 + 5), X(1.6), () => H.rockLt));
  // offerings at the base
  ell(put, X(60), X(118), X(3), X(2.4), () => H.gold); put(Math.round(X(59)), Math.round(X(117)), H.goldLt);
  ell(put, X(99), X(118), X(3.4), X(2.6), (tx, ty) => mix('#f2ecd8', H.boneDk, tx));
}

// 8 SKULL BRAZIER
function dBrazier(put, S) {
  const X = U(S); embers(put, S, 8, 8); shadow(put, X(80), X(126), X(18), X(4));
  // tripod legs
  [[68, 122], [92, 122], [80, 124]].forEach(([lx, ly]) => stroke(put, X(80), X(102), X(lx), X(ly), X(2.2), () => H.ironDk));
  // bowl
  for (let y = 92; y <= 104; y++) { const t = (y - 92) / 12, w = 18 - t * 8; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(H.iron, H.ironDk, clamp(tx * 1.25 + t * 0.25, 0, 1))); }
  row(put, Math.round(X(92)), X(62), X(98), () => '#6a6e7a');
  // giant skull sitting in the bowl, fire out of it
  ell(put, X(80), X(76), X(13), X(12.5), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx * 0.95 + ty * 0.5 - 0.25, 0, 1)));
  ell(put, X(75), X(74), X(3), X(3.6), () => H.night); ell(put, X(85), X(74), X(3), X(3.6), () => H.night);
  put(Math.round(X(75)), Math.round(X(74)), H.lava); put(Math.round(X(85)), Math.round(X(74)), H.lava);
  ell(put, X(80), X(82), X(2), X(2.4), () => H.night);
  row(put, Math.round(X(86)), X(74), X(86), () => H.boneDk);
  // flames from the cranium
  lick(put, X(72), X(58), X(6), H.lava, H.lavaLt);
  lick(put, X(80), X(52), X(9), H.lava, H.lavaLt);
  lick(put, X(88), X(58), X(6), H.ember, H.lavaLt);
}

// ============ HOLY SIDE (9-16)
// 9 MARBLE COLUMN
function dColumn(put, S) {
  const X = U(S); lightMotes(put, S, 5, 9); shadow(put, X(80), X(126), X(20), X(4));
  plate(put, X(60), X(114), X(100), X(122), G.marble, G.white, G.marbleDk); // base
  plate(put, X(64), X(108), X(96), X(114), G.marble, G.white, G.marbleDk);
  // fluted shaft
  for (let y = 40; y <= 108; y++) row(put, Math.round(X(y)), X(68), X(92), (tx) => mix(G.white, G.marbleDk, clamp(Math.abs(Math.sin(tx * 12.5)) * 0.35 + tx * 0.5, 0, 1)));
  // capital scrolls
  plate(put, X(62), X(32), X(98), X(40), G.marble, G.white, G.marbleDk);
  [[64, 36], [96, 36]].forEach(([sx2, sy2]) => { for (let a = 0; a < 5.2; a += 0.28) put(Math.round(X(sx2 + Math.cos(a) * (3.4 - a * 0.4))), Math.round(X(sy2 + Math.sin(a) * (3.4 - a * 0.4))), G.marbleDk); });
  // ivy + chip
  [[70, 100], [72, 92], [76, 84]].forEach(([vx, vy], i) => { ell(put, X(vx), X(vy), X(2.4), X(1.6), () => mix('#7ab04a', '#3e5a28', i * 0.2)); stroke(put, X(vx), X(vy + 2), X(vx - 1), X(vy + 8), X(0.8), () => '#4a6a30'); });
  stroke(put, X(88), X(52), X(92), X(58), X(1.6), () => G.marbleDk); // chipped notch
}

// 10 GOLDEN FOUNTAIN
function dFountain(put, S) {
  const X = U(S); lightMotes(put, S, 5, 10); shadow(put, X(80), X(126), X(30), X(5));
  // basin
  for (let y = 104; y <= 118; y++) { const t = (y - 104) / 14, w = 30 - t * 4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.25 + t * 0.2, 0, 1))); }
  ell(put, X(80), X(104), X(28), X(6), (tx, ty) => mix('#bfeaff', '#4a90b8', clamp(tx + ty * 0.5, 0, 1))); // water surface
  // pedestal + upper bowl
  stroke(put, X(80), X(104), X(80), X(84), X(4), () => G.gold);
  ell(put, X(80), X(82), X(13), X(4), (tx, ty) => mix(G.goldLt, G.goldDk, tx));
  ell(put, X(80), X(80), X(10), X(2.6), (tx) => mix('#bfeaff', '#4a90b8', tx));
  // jet + arcs of water
  stroke(put, X(80), X(78), X(80), X(58), X(1.8), () => '#d8f4ff');
  put(Math.round(X(80)), Math.round(X(56)), G.white);
  [[-1], [1]].forEach(([sd]) => { for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(X(80 + sd * t * 22)), Math.round(X(60 + t * t * 42)), mix('#bfeaff', '#4a90b8', t)); } });
  // glow + coins in the basin
  [[70, 110], [88, 112], [80, 114]].forEach(([cx2, cy2]) => put(Math.round(X(cx2)), Math.round(X(cy2)), G.goldLt));
  soulMote(put, X(60), X(96), X(2.4), 0.45); // a blessed soul bathing
}

// 11 PRAYER ALTAR
function dAltar(put, S) {
  const X = U(S); lightMotes(put, S, 6, 11); shadow(put, X(80), X(124), X(24), X(4));
  // stone table
  plate(put, X(54), X(88), X(106), X(96), G.marble, G.white, G.marbleDk);
  [[62], [96]].forEach(([lx]) => { for (let y = 96; y <= 118; y++) row(put, Math.round(X(y)), X(lx - 4), X(lx + 4), (tx) => mix(G.marble, G.marbleDk, tx)); });
  // white cloth runner
  for (let y = 84; y <= 92; y++) row(put, Math.round(X(y)), X(70), X(90), (tx) => mix(G.white, G.wingDk, clamp(tx * 0.8 + (y - 84) / 12, 0, 1)));
  // open holy book + candles
  for (let i = 0; i <= 6; i++) { const t = i / 6; row(put, Math.round(X(80 + t * 4)), X(66 + t * 2), X(80), (tx) => mix(G.white, G.wingDk, tx * 0.5)); row(put, Math.round(X(80 + t * 4)), X(80), X(94 - t * 2), (tx) => mix(G.holyLt, G.wingDk, (1 - tx) * 0.5)); }
  [[58, 74], [102, 74]].forEach(([cx2, cy2]) => { stroke(put, X(cx2), X(cy2 + 4), X(cx2), X(cy2 + 14), X(2.6), () => G.holyLt); lick(put, X(cx2), X(cy2), X(4), H.lava, H.lavaLt); });
  // light shaft from above
  for (let y = 20; y <= 80; y++) { const t = (y - 20) / 60; row(put, Math.round(X(y)), X(74 - t * 4), X(86 + t * 4), (tx) => (((tx * 8) | 0) % 3 === 0 ? mix(G.holy, H.night, 0.5 + t * 0.25) : mix(G.holy, H.night, 0.85))); }
}

// 12 STAINED GLASS ARCH
function dGlass(put, S) {
  const X = U(S); lightMotes(put, S, 5, 12); shadow(put, X(80), X(126), X(26), X(4));
  // arch frame
  for (let a = 3.24; a <= 6.18; a += 0.03) { const ax = 80 + Math.cos(a) * 28, ay = 96 + Math.sin(a) * 62; stroke(put, X(ax), X(ay), X(ax), X(ay), X(4), () => G.marbleDk); }
  [[52, 96, 52, 122], [108, 96, 108, 122]].forEach(([x0, y0, x1, y1]) => { for (let y = y0; y <= y1; y++) row(put, Math.round(X(y)), X(x0 - 2), X(x0 + 2), (tx) => mix(G.marble, G.marbleDk, tx)); });
  // stained glass panes inside (radial wedges of color)
  const cols = ['#c83a5a', '#3a7ac8', '#3aa85a', '#e8b03a', '#8a4ac8'];
  for (let y = 44; y <= 120; y++) {
    for (let x = 56; x <= 104; x++) {
      const dx = x - 80, dy = (y - 96) / 2.2;
      const rr = Math.hypot(dx, dy);
      if (rr < 25 && y > 96 - 55) {
        const seg = Math.floor(((Math.atan2(dy, dx) + 3.14159) / 6.28318) * 10) % 5;
        const lead = (Math.abs(dx) % 12 < 1) || (y % 16 < 1);
        put(Math.round(X(x)), Math.round(X(y)), lead ? '#2a2a30' : mix(cols[seg], H.night, 0.25 + (rr / 25) * 0.3));
      }
    }
  }
  // glowing center rose
  ell(put, X(80), X(84), X(6), X(6), (tx, ty) => mix(G.white, G.holy, tx + ty * 0.3));
  // light pooling through onto the floor
  ell(put, X(84), X(126), X(20), X(4), (tx, ty) => mix(mix('#c85a7a', H.night, 0.5), H.night, tx));
}

// 13 HOLY WAR BANNER
function dHolyBanner(put, S) {
  const X = U(S); lightMotes(put, S, 5, 13); shadow(put, X(74), X(126), X(16), X(4));
  // gold pole w/ cross finial
  stroke(put, X(74), X(122), X(74), X(26), X(2.6), () => G.goldDk);
  stroke(put, X(74), X(20), X(74), X(30), X(2), () => G.gold);
  stroke(put, X(70), X(24), X(78), X(24), X(2), () => G.gold);
  put(Math.round(X(74)), Math.round(X(18)), G.holyLt);
  // white/gold banner, clean edge (mirror of the torn hell one)
  for (let y = 34; y <= 90; y++) {
    const t = (y - 34) / 56;
    row(put, Math.round(X(y)), X(76), X(108 - Math.sin(t * 8) * 2), (tx) => mix(G.white, G.wingDk, clamp(tx * 1.1 + t * 0.2, 0, 1)));
  }
  row(put, Math.round(X(90)), X(76), X(106), () => G.goldDk); // gold fringe
  for (let x = 78; x <= 104; x += 4) stroke(put, X(x), X(90), X(x), X(95), X(1), () => G.gold);
  // radiant sun sigil
  ell(put, X(91), X(58), X(7), X(8), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; stroke(put, X(91 + Math.cos(a) * 9), X(58 + Math.sin(a) * 10), X(91 + Math.cos(a) * 13), X(58 + Math.sin(a) * 14), X(1), () => G.gold); }
  // flowers at the base
  [[64, 120], [70, 122], [82, 121]].forEach(([fx, fy], i) => { ell(put, X(fx), X(fy), X(1.8), X(1.4), () => (i % 2 ? '#e88ab0' : G.white)); stroke(put, X(fx), X(fy + 1), X(fx), X(fy + 4), X(0.7), () => '#4a6a30'); });
}

// 14 ANGEL STATUE
function dAngelStatue(put, S) {
  const X = U(S); lightMotes(put, S, 5, 14); shadow(put, X(80), X(126), X(24), X(5));
  plate(put, X(58), X(112), X(102), X(124), G.marble, G.white, G.marbleDk);
  // robed figure, sword point-down (guardian at rest)
  for (let y = 62; y <= 112; y++) { const t = (y - 62) / 50, w = 9 + t * 9; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(G.white, G.marbleDk, clamp(tx * 1.2 + t * 0.3, 0, 1))); }
  // marble wings folded high
  for (let i = 0; i <= 10; i++) { const t = i / 10; stroke(put, X(66), X(70), X(52 - t * 6), X(88 - t * 34), X(2.2 * (1 - t * 0.5)), () => mix(G.marble, G.marbleDk, t * 0.5)); }
  for (let i = 0; i <= 10; i++) { const t = i / 10; stroke(put, X(90), X(70), X(104 + t * 6), X(88 - t * 34), X(2.2 * (1 - t * 0.5)), () => mix(G.marble, G.marbleDk, t * 0.5)); }
  // head bowed
  ell(put, X(78), X(54), X(8.5), X(8.5), (tx, ty) => mix(G.white, G.marbleDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)));
  stroke(put, X(74), X(56), X(76), X(56), X(1), () => G.marbleDk); stroke(put, X(80), X(56), X(82), X(56), X(1), () => G.marbleDk); // closed eyes
  // sword point-down, hands on pommel
  stroke(put, X(78), X(96), X(78), X(120), X(2), () => '#c8ccd8');
  stroke(put, X(72), X(92), X(84), X(92), X(2), () => G.goldDk);
  ell(put, X(78), X(88), X(3.4), X(3), () => G.marble); // hands
  // moss + a real dove perched on the wing
  ell(put, X(102), X(56), X(3.4), X(2.6), (tx, ty) => mix(G.white, G.wingDk, ty));
  put(Math.round(X(99.5)), Math.round(X(55)), G.ink);
  [[64, 108], [92, 110]].forEach(([mx, my]) => ell(put, X(mx), X(my), X(2.6), X(1.4), () => '#5a8a3a'));
}

// 15 OLIVE TREE
function dOlive(put, S) {
  const X = U(S); lightMotes(put, S, 5, 15); shadow(put, X(80), X(124), X(26), X(5));
  // gnarled trunk
  for (let i = 0; i <= 24; i++) { const t = i / 24; const tx2 = 80 + Math.sin(t * 4.4) * 6; stroke(put, X(tx2), X(120 - t * 44), X(tx2), X(120 - t * 44), X(6 - t * 3), () => mix('#a89068', '#5a4a30', t * 0.4 + 0.15)); }
  stroke(put, X(76), X(96), X(62), X(80), X(3), () => '#8a7452');
  stroke(put, X(84), X(88), X(100), X(74), X(3), () => '#8a7452');
  // silver-green canopy blobs
  [[62, 64, 14], [84, 54, 17], [104, 66, 12], [76, 70, 12]].forEach(([cx2, cy2, cr]) => {
    ell(put, X(cx2), X(cy2), X(cr), X(cr * 0.75), (tx, ty) => mix('#a8c890', '#54704a', clamp(tx * 1.05 + ty * 0.6 - 0.2, 0, 1)));
    for (let k = 0; k < 6; k++) put(Math.round(X(cx2 - cr * 0.6 + k * cr * 0.24)), Math.round(X(cy2 - cr * 0.3 + (k % 3))), '#d8ecc0');
  });
  // olives
  [[70, 62], [90, 52], [100, 64], [80, 68]].forEach(([ox, oy]) => ell(put, X(ox), X(oy), X(1.6), X(1.8), () => '#3a4a20'));
  // white petals drifting + kneeling stone at roots
  [[46, 90], [116, 84], [58, 106]].forEach(([px2, py2]) => put(Math.round(X(px2)), Math.round(X(py2)), G.white));
  plate(put, X(94), X(114), X(112), X(120), G.marble, G.white, G.marbleDk);
}

// 16 BELL TOWER
function dBell(put, S) {
  const X = U(S); lightMotes(put, S, 5, 16); shadow(put, X(80), X(128), X(22), X(4));
  // tower shaft
  for (let y = 52; y <= 124; y++) row(put, Math.round(X(y)), X(62), X(98), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.25 + (y - 52) / 110, 0, 1)));
  // belfry opening
  for (let a = 3.24; a <= 6.18; a += 0.04) { const ax = 80 + Math.cos(a) * 13, ay = 74 + Math.sin(a) * 16; put(Math.round(X(ax)), Math.round(X(ay)), G.marbleDk); }
  for (let y = 62; y <= 88; y++) { const w = y < 74 ? Math.sqrt(Math.max(0, 169 - Math.pow((74 - y) * 1.2, 2))) : 13; row(put, Math.round(X(y)), X(80 - w), X(80 + w), () => '#241c2a'); }
  // golden bell mid-swing + clapper
  for (let y = 66; y <= 78; y++) { const t = (y - 66) / 12, w = 4 + t * 6; row(put, Math.round(X(y - 2)), X(84 - w + 4), X(84 + w + 4), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.2 + t * 0.2, 0, 1))); }
  put(Math.round(X(90)), Math.round(X(80)), G.goldDk);
  // roof spire + cross
  for (let y = 36; y <= 52; y++) { const w = (y - 36) * 1.5; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#8a5c3a', '#42280f', tx)); }
  stroke(put, X(80), X(26), X(80), X(36), X(1.6), () => G.gold);
  stroke(put, X(77), X(29), X(83), X(29), X(1.6), () => G.gold);
  // sound rings + doves startled
  [[16, 0.4], [24, 0.6]].forEach(([rr, fd]) => { for (let a = -0.9; a <= 0.9; a += 0.07) put(Math.round(X(102 + Math.cos(a) * rr * 0.6)), Math.round(X(72 + Math.sin(a) * rr)), mix(G.holyLt, H.night, fd)); });
  [[112, 50], [120, 44]].forEach(([bx, by]) => { stroke(put, X(bx - 3), X(by), X(bx), X(by - 2), X(1), () => G.white); stroke(put, X(bx), X(by - 2), X(bx + 3), X(by), X(1), () => G.white); });
}

// ============ RIVER + NO-MAN'S-LAND (17-20)
// 17 BOUNDARY OBELISK — half gold, half bone
function dObelisk(put, S) {
  const X = U(S); embers(put, S, 3, 17); lightMotes(put, S, 3, 27); shadow(put, X(80), X(126), X(18), X(4));
  // obelisk, split down the middle
  for (let y = 28; y <= 120; y++) {
    const t = (y - 28) / 92, w = 6 + t * 10;
    row(put, Math.round(X(y)), X(80 - w), X(80), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.4 + t * 0.2, 0, 1)));
    row(put, Math.round(X(y)), X(80), X(80 + w), (tx) => mix('#d8ccb0', '#6a5e48', clamp(tx * 1.3 + t * 0.25, 0, 1)));
  }
  stroke(put, X(80), X(28), X(80), X(120), X(1), () => H.night); // the seam
  // gold half: sun engraving · bone half: skull inlays
  ell(put, X(72), X(64), X(4), X(4.4), (tx, ty) => mix(G.holyLt, G.goldDk, tx + ty * 0.3));
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; put(Math.round(X(72 + Math.cos(a) * 6)), Math.round(X(64 + Math.sin(a) * 7)), G.goldLt); }
  [[88, 60, 3.4], [90, 84, 2.8]].forEach(([sx2, sy2, sr]) => {
    ell(put, X(sx2), X(sy2), X(sr), X(sr), (tx, ty) => mix('#f2ecd8', H.boneDk, tx + ty * 0.3));
    put(Math.round(X(sx2 - 1)), Math.round(X(sy2)), H.night); put(Math.round(X(sx2 + 1)), Math.round(X(sy2)), H.night);
  });
  // pyramidion split glow
  stroke(put, X(76), X(30), X(80), X(24), X(2), () => G.holyLt);
  stroke(put, X(84), X(30), X(80), X(24), X(2), () => H.fel);
  // both energies curling around it
  for (let i = 0; i <= 14; i++) { const t = i / 14; put(Math.round(X(66 - Math.sin(t * 5) * 4)), Math.round(X(110 - t * 60)), mix(G.holy, H.night, 0.3 + t * 0.4)); }
  for (let i = 0; i <= 14; i++) { const t = i / 14; put(Math.round(X(94 + Math.sin(t * 5) * 4)), Math.round(X(110 - t * 60)), mix(H.fel, H.night, 0.3 + t * 0.4)); }
}

// 18 SOUL GEYSER — river vent
function dSoulGeyser(put, S) {
  const X = U(S);
  // river patch
  for (let x = 0; x < S; x++) { const yy = 0.7 * S + Math.sin(x / S * 8) * 2.4; for (let y = yy; y < Math.min(S, yy + 0.24 * S); y++) put(x, Math.round(y), mix(H.soulDk, H.night, 0.28 + (y - yy) / (0.24 * S) * 0.5)); }
  // whirl mouth
  for (let a = 0; a < 12.56; a += 0.05) { const rr = 3 + a * 1.3; put(Math.round(X(80 + Math.cos(a) * rr)), Math.round(X(120 + Math.sin(a) * rr * 0.32)), mix(H.soulLt, H.soulDk, (a / 12.56))); }
  // column of souls erupting
  for (let i = 0; i <= 26; i++) {
    const t = i / 26, w = 5 - t * 1.4 + Math.sin(t * 8) * 1.2;
    row(put, Math.round(X(114 - t * 76)), X(80 - w + Math.sin(t * 6) * 3), X(80 + w + Math.sin(t * 6) * 3), (tx) => mix(H.soulLt, H.soul, clamp(tx + t * 0.3, 0, 1)));
  }
  // souls flung out at the top
  soulMote(put, X(64), X(40), X(4), 0.15);
  soulMote(put, X(96), X(34), X(3.4), 0.25);
  soulMote(put, X(80), X(24), X(4.4), 0.1);
  [[58, 52], [102, 48]].forEach(([sx2, sy2]) => { for (let i = 0; i <= 6; i++) put(Math.round(X(sx2 + i * 2)), Math.round(X(sy2 + i * 1.4)), mix(H.soul, H.night, 0.3 + i * 0.08)); });
}

// 19 FALLEN TITAN SWORD — no-man's-land monument
function dTitanSword(put, S) {
  const X = U(S); embers(put, S, 4, 19); lightMotes(put, S, 3, 29);
  // scorched crater it stands in
  ell(put, X(80), X(114), X(34), X(10), (tx, ty) => mix('#3a3028', '#16100c', clamp(tx + ty * 0.5, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.3) stroke(put, X(80 + Math.cos(a) * 32), X(114 + Math.sin(a) * 9), X(80 + Math.cos(a) * 40), X(114 + Math.sin(a) * 12), X(1), () => '#241c14');
  // giant blade plunged at an angle — half corroded, half bright
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const bx = 92 - t * 24, by = 108 - t * 82, w = 6 - t * 2.2;
    row(put, Math.round(X(by)), X(bx - w), X(bx), (tx) => mix('#e8ecf4', '#8a92a2', clamp(tx + t * 0.2, 0, 1)));
    row(put, Math.round(X(by)), X(bx), X(bx + w), (tx) => mix('#7a5a3a', '#3a2a18', clamp(tx + t * 0.2, 0, 1))); // rusted half
  }
  // crossguard + wrapped grip + pommel
  stroke(put, X(76), X(38), X(104), X(30), X(3.4), () => G.goldDk);
  stroke(put, X(88), X(30), X(84), X(16), X(2.6), () => '#5a3a2a');
  ell(put, X(83), X(13), X(3.4), X(3.4), (tx, ty) => mix(G.goldLt, G.goldDk, tx + ty * 0.3));
  // both sides pay tribute: gold wreath + bone offering at the base
  for (let a = 0; a < 6.28; a += 0.5) ell(put, X(64 + Math.cos(a) * 5), X(112 + Math.sin(a) * 2), X(1.6), X(1.2), () => (a < 3.14 ? G.gold : '#5a8a3a'));
  stroke(put, X(98), X(112), X(108), X(110), X(2), () => H.bone);
  ell(put, X(97), X(112), X(1.8), X(1.8), () => H.boneDk);
  // souls drift past it
  soulMote(put, X(50), X(60), X(2.6), 0.45);
}

// 20 BRIDGE LANTERN — golden post, skull post
function dLantern(put, S) {
  const X = U(S); embers(put, S, 3, 20); lightMotes(put, S, 3, 30);
  // two posts side by side (the pair that flanks each bridge end)
  // GOLDEN post
  stroke(put, X(56), X(122), X(56), X(56), X(3), () => G.goldDk);
  ell(put, X(56), X(124), X(8), X(3), (tx) => mix(G.goldLt, G.goldDk, tx));
  stroke(put, X(56), X(56), X(66), X(52), X(2), () => G.gold); // arm
  // lantern box w/ holy light
  plate(put, X(62), X(52), X(74), X(66), G.goldDk, G.gold, '#4a3208');
  ell(put, X(68), X(59), X(3.4), X(4.4), (tx, ty) => mix(G.white, G.holy, ty));
  put(Math.round(X(68)), Math.round(X(48)), G.holyLt);
  // BONE post
  stroke(put, X(104), X(122), X(104), X(58), X(3), () => H.boneDk);
  for (let y = 66; y <= 116; y += 9) ell(put, X(104), X(y), X(3), X(2), () => H.bone); // vertebrae stack
  ell(put, X(104), X(124), X(8), X(3), (tx) => mix(H.bone, H.boneDk, tx));
  stroke(put, X(104), X(58), X(94), X(54), X(2), () => H.boneDk);
  // skull lantern w/ soul-fire
  ell(put, X(90), X(60), X(6.5), X(6), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  ell(put, X(87.5), X(59), X(1.8), X(2.2), () => H.night); ell(put, X(92.5), X(59), X(1.8), X(2.2), () => H.night);
  put(Math.round(X(87.5)), Math.round(X(59)), H.soul); put(Math.round(X(92.5)), Math.round(X(59)), H.soul);
  lick(put, X(90), X(50), X(5), H.soul, H.soulLt);
  // shared cobble pad between them
  for (let x = 44; x <= 118; x += 7) ell(put, X(x + ((x / 7 | 0) % 2) * 3), X(127), X(3.4), X(1.6), () => mix('#6a6a78', '#3a3a46', (x % 14) / 14));
}

const LIST = [
  { n: 1, name: 'BONE PILE', role: 'hell — skull mound', draw: dBones },
  { n: 2, name: 'OBSIDIAN SPIRE', role: 'hell — fel-veined glass rock', draw: dSpire },
  { n: 3, name: 'LAVA GEYSER', role: 'hell — erupting vent', draw: dGeyser },
  { n: 4, name: 'SOUL CAGE', role: 'hell — hanging gibbet, souls inside', draw: dCage },
  { n: 5, name: 'BRIMSTONE ARCH', role: 'hell — horned gateway', draw: dArch },
  { n: 6, name: 'HELL BANNER', role: 'hell — torn, fel sigil', draw: dHellBanner },
  { n: 7, name: 'GARGOYLE IDOL', role: 'hell — fire-mouth shrine', draw: dIdol },
  { n: 8, name: 'SKULL BRAZIER', role: 'hell — flaming skull bowl', draw: dBrazier },
  { n: 9, name: 'MARBLE COLUMN', role: 'holy — fluted, ivy', draw: dColumn },
  { n: 10, name: 'GOLDEN FOUNTAIN', role: 'holy — blessed water', draw: dFountain },
  { n: 11, name: 'PRAYER ALTAR', role: 'holy — book, candles, light shaft', draw: dAltar },
  { n: 12, name: 'STAINED GLASS ARCH', role: 'holy — colored light pool', draw: dGlass },
  { n: 13, name: 'HOLY BANNER', role: 'holy — white/gold sun sigil', draw: dHolyBanner },
  { n: 14, name: 'ANGEL STATUE', role: 'holy — sword-down guardian', draw: dAngelStatue },
  { n: 15, name: 'OLIVE TREE', role: 'holy — silver-green, petals', draw: dOlive },
  { n: 16, name: 'BELL TOWER', role: 'holy — swinging gold bell', draw: dBell },
  { n: 17, name: 'BOUNDARY OBELISK', role: 'border — half gold half bone', draw: dObelisk },
  { n: 18, name: 'SOUL GEYSER', role: 'river — erupting soul vent', draw: dSoulGeyser },
  { n: 19, name: 'FALLEN TITAN SWORD', role: 'no-mans-land monument', draw: dTitanSword },
  { n: 20, name: 'BRIDGE LANTERN', role: 'bridge — gold post + skull post', draw: dLantern },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'eternal_decor_options.png', title: 'VICE VERSA — DECOR (8 hell / 8 holy / 4 river) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
