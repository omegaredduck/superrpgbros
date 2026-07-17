// artdev/underworld/render_holy_mobs.js — ETERNAL STRUGGLE holy-side
// mob sheet: 20 candidates. Angels + the armies of light (mirror army
// to the hell side across the river of souls).
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, soulMote, lick } = KIT;

const G = {
  marble: '#f2efe6', marbleDk: '#a8a496',
  robe: '#f6f2e8', robeDk: '#b8b0a0',
  skin: '#f0c8a8', skinDk: '#b08a62',
  gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  sky: '#a8d8f0', skyDk: '#4a7a9a',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a',
  wing: '#f8f6ee', wingDk: '#b0aa98',
  night: '#160a12', white: '#ffffff', ink: '#2a2420'
};

function U(S) { const u = S / 160; return v => v * u; }
// feathered wing: layered arcs; sd=-1 left +1 right
function wing(put, ax, ay, sd, s, c, cDk) {
  for (let layer = 0; layer < 3; layer++) {
    const ls = s * (1 - layer * 0.22);
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const wx = ax + sd * (t * ls * 1.5), wy = ay - Math.sin(t * 3.14) * ls * (0.9 - layer * 0.18) + layer * s * 0.22;
      stroke(put, ax + sd * t * ls * 0.4, ay + layer * s * 0.2, wx, wy + ls * 0.3, Math.max(1, s * 0.09), () => mix(layer ? c : G.white, cDk, t * 0.55 + layer * 0.15));
    }
  }
}
function halo(put, cx, cy, r) {
  for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
}
// drifting light motes
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S;
    const y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.3 + (i % 4) * 0.14));
  }
}
// little sun rays
function rays(put, cx, cy, r0, r1, n, c) {
  for (let k = 0; k < n; k++) { const a = (k / n) * 6.28; stroke(put, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.1, () => c); }
}

// 1 CHERUB — tiny bow flyer
function drawCherub(put, S) {
  const X = U(S); lightMotes(put, S, 6, 1);
  wing(put, X(68), X(72), -1, X(14), G.wing, G.wingDk);
  wing(put, X(92), X(72), 1, X(14), G.wing, G.wingDk);
  // chubby body + little legs kicking
  ell(put, X(80), X(84), X(13), X(14), (tx, ty) => mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.55 - 0.3, 0, 1)));
  ell(put, X(80), X(92), X(7), X(5), () => mix(G.skin, G.white, 0.25)); // belly
  stroke(put, X(72), X(96), X(68), X(106), X(3), () => G.skin);
  stroke(put, X(88), X(96), X(92), X(104), X(3), () => G.skin);
  // sash
  for (let y = 86; y <= 92; y++) row(put, Math.round(X(y)), X(68 + (y - 86)), X(92 - (92 - y) * 0.4), (tx) => mix('#8ac8e8', '#4a7a9a', tx));
  // head + curl + halo
  ell(put, X(80), X(60), X(10), X(9.5), (tx, ty) => mix('#f6d4b8', G.skinDk, clamp(tx * 1.0 + ty * 0.45 - 0.3, 0, 1)));
  ell(put, X(80), X(50), X(7), X(3.4), (tx, ty) => mix('#e8c060', '#8a6a20', tx)); // golden curls
  put(Math.round(X(80)), Math.round(X(46.5)), '#e8c060');
  halo(put, X(80), X(43), X(9));
  put(Math.round(X(76)), Math.round(X(59)), G.ink); put(Math.round(X(84)), Math.round(X(59)), G.ink);
  stroke(put, X(78), X(64), X(82), X(64), X(1), () => '#c07a5a'); // smile
  // little golden bow drawn
  for (let a = -1.0; a <= 1.0; a += 0.05) put(Math.round(X(52 + Math.cos(a) * 18 * 0.5)), Math.round(X(76 + Math.sin(a) * 18)), G.goldDk);
  stroke(put, X(57), X(59), X(57), X(93), X(0.8), () => G.wingDk);
  stroke(put, X(44), X(76), X(62), X(76), X(1.4), () => G.gold); // light arrow
  put(Math.round(X(42)), Math.round(X(76)), G.holyLt);
  stroke(put, X(66), X(78), X(58), X(76), X(2.4), () => G.skin); // arm
}

// 2 ANGEL SOLDIER — sword + halo classic
function drawAngel(put, S) {
  const X = U(S); lightMotes(put, S, 5, 2); shadow(put, X(78), X(126), X(22), X(4));
  wing(put, X(64), X(66), -1, X(22), G.wing, G.wingDk);
  wing(put, X(92), X(66), 1, X(22), G.wing, G.wingDk);
  // robe body
  for (let y = 66; y <= 118; y++) { const t = (y - 66) / 52, w = 11 + t * 8; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(G.robe, G.robeDk, clamp(tx * 1.2 + t * 0.3, 0, 1))); }
  row(put, Math.round(X(118)), X(59), X(97), () => G.goldDk); // hem trim
  // breastplate hint + belt
  for (let y = 68; y <= 84; y++) { const t = (y - 68) / 16, w = 10 - t * 2; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.3 + t * 0.3, 0, 1))); }
  row(put, Math.round(X(88)), X(68), X(88), () => G.goldDk);
  // arms: sword raised + palm out
  stroke(put, X(90), X(72), X(102), X(60), X(3), () => G.robeDk);
  stroke(put, X(104), X(62), X(104), X(28), X(2.6), () => '#e8ecf4');
  stroke(put, X(104), X(62), X(104), X(44), X(1), () => G.holyLt); // light edge
  stroke(put, X(98), X(64), X(110), X(64), X(2), () => G.gold);
  stroke(put, X(66), X(72), X(56), X(84), X(3), () => G.robeDk);
  ell(put, X(54), X(87), X(3), X(3), () => G.skin);
  // head + halo
  ell(put, X(78), X(56), X(9.5), X(9.5), (tx, ty) => mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.45 - 0.3, 0, 1)));
  ell(put, X(78), X(48), X(8), X(3.4), (tx) => mix('#a87a3a', '#5a3a12', tx)); // hair
  halo(put, X(78), X(41), X(10));
  put(Math.round(X(74.5)), Math.round(X(55)), G.ink); put(Math.round(X(81.5)), Math.round(X(55)), G.ink);
}

// 3 SERAPH — four wings, light lances
function drawSeraph(put, S) {
  const X = U(S); lightMotes(put, S, 6, 3);
  wing(put, X(66), X(56), -1, X(19), G.wing, G.wingDk);
  wing(put, X(94), X(56), 1, X(19), G.wing, G.wingDk);
  wing(put, X(68), X(78), -1, X(15), G.wing, G.wingDk);
  wing(put, X(92), X(78), 1, X(15), G.wing, G.wingDk);
  // hovering robed body, no legs — tapers to light
  for (let y = 58; y <= 112; y++) { const t = (y - 58) / 54, w = (12 - t * 7) * (1 + Math.sin(t * 2.6) * 0.15); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.holyLt, G.holyDk, clamp(tx * 1.05 + t * 0.5, 0, 1))); }
  for (let i = 0; i < 4; i++) put(Math.round(X(80 + Math.sin(i * 2.4) * 3)), Math.round(X(114 + i * 3)), mix(G.holy, H.night, 0.25 + i * 0.16));
  // veiled head — glowing blank face
  ell(put, X(80), X(48), X(9), X(10), (tx, ty) => mix(G.holyLt, G.holyDk, clamp(tx * 0.9 + ty * 0.5 - 0.35, 0, 1)));
  ell(put, X(76.5), X(47), X(1.6), X(2.6), () => G.gold); ell(put, X(83.5), X(47), X(1.6), X(2.6), () => G.gold);
  halo(put, X(80), X(35), X(11));
  halo(put, X(80), X(31), X(7));
  // light lances orbiting
  [[46, 84, -0.5], [114, 88, 0.5]].forEach(([lx, ly, aa]) => {
    stroke(put, X(lx - Math.cos(aa) * 12), X(ly - Math.sin(aa) * 12), X(lx + Math.cos(aa) * 12), X(ly + Math.sin(aa) * 12), X(1.6), () => G.holyLt);
    put(Math.round(X(lx + Math.cos(aa) * 13)), Math.round(X(ly + Math.sin(aa) * 13)), G.white);
  });
}

// 4 VALKYRIE — spear diver
function drawValkyrie(put, S) {
  const X = U(S); lightMotes(put, S, 5, 4);
  // diving pose: wings swept up, body angled down-left
  wing(put, X(88), X(52), 1, X(24), G.wing, G.wingDk);
  wing(put, X(98), X(64), 1, X(18), G.wing, G.wingDk);
  // body diagonal
  for (let i = 0; i <= 22; i++) { const t = i / 22; const w = 8 * (1 - t * 0.3); ell(put, X(92 - t * 34), X(58 + t * 30), X(w), X(3.4), (tx) => mix('#c8d4e8', '#5a6a8a', clamp(tx + t * 0.25, 0, 1))); }
  // skirt flare
  for (let i = 0; i <= 8; i++) { const t = i / 8; stroke(put, X(92), X(62), X(100 + t * 8), X(74 + t * 6), X(1.6), () => mix('#8ab0d8', '#3a5a7a', t)); }
  // helm w/ wings + face
  ell(put, X(52), X(94), X(8.5), X(8), (tx, ty) => mix('#e8ecf4', '#8a92a2', clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  ell(put, X(52), X(99), X(6), X(4), (tx, ty) => mix(G.skin, G.skinDk, tx)); // face below helm brim
  put(Math.round(X(49)), Math.round(X(98)), G.ink); put(Math.round(X(54)), Math.round(X(98)), G.ink);
  stroke(put, X(58), X(90), X(64), X(84), X(2.2), () => G.wingDk); // helm wing
  stroke(put, X(46), X(90), X(40), X(86), X(2.2), () => G.wingDk);
  // braid flying
  for (let i = 0; i <= 8; i++) put(Math.round(X(60 + i * 2.2)), Math.round(X(88 - i * 1.4)), i % 2 ? '#e8c060' : '#a8843a');
  // spear thrust down-left + dive lines
  stroke(put, X(74), X(72), X(30), X(122), X(2.2), () => G.goldDk);
  stroke(put, X(38), X(112), X(30), X(122), X(3.4), () => G.holyLt); // spearhead glow
  put(Math.round(X(28)), Math.round(X(124)), G.white);
  [[104, 30], [116, 42], [122, 58]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx - 8), X(ly + 10), X(1), () => mix(G.sky, H.night, 0.5)));
}

// 5 RADIANT HOUND — golden pack lunger
function drawRadiantHound(put, S) {
  const X = U(S); lightMotes(put, S, 6, 5); shadow(put, X(80), X(120), X(30), X(5));
  // body (mirror stance of the hellhound)
  for (let x = 48; x <= 114; x++) {
    const t = (x - 48) / 66;
    const top = 84 - Math.sin(t * 3.14) * 13 - t * 4, bot = 102 + Math.sin(t * 2) * 2;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#e8c878', '#8a6428', clamp((y - top) / Math.max(1, bot - top) * 1.15, 0, 1)));
  }
  // light mane along the spine
  for (let x = 56; x <= 108; x += 7) lick(put, X(x), X(70 - Math.sin((x - 48) / 66 * 3.14) * 11), X(5), G.holyLt, G.white);
  // legs
  stroke(put, X(58), X(100), X(52), X(118), X(3.4), () => '#b89448');
  stroke(put, X(68), X(102), X(64), X(118), X(3.4), () => '#8a6428');
  stroke(put, X(100), X(102), X(106), X(118), X(3.4), () => '#b89448');
  stroke(put, X(110), X(98), X(118), X(116), X(3.4), () => '#8a6428');
  // head (facing right — CHARGES the hell side)
  ell(put, X(122), X(80), X(11), X(9), (tx, ty) => mix('#f0d48a', '#8a6428', clamp((1 - tx) * 0.7 + ty * 0.6 - 0.1, 0, 1)));
  stroke(put, X(131), X(84), X(138), X(87), X(4), () => '#c8a050'); // snout
  put(Math.round(X(126)), Math.round(X(77)), G.white); put(Math.round(X(127)), Math.round(X(77.6)), G.ink); // eye
  stroke(put, X(118), X(71), X(115), X(64), X(2), () => '#b89448'); // ear
  halo(put, X(122), X(66), X(8)); // good boy halo
  lick(put, X(44), X(86), X(6), G.holyLt, G.white); // tail light
}

// 6 CRUSADER — warhammer zealot
function drawCrusader(put, S) {
  const X = U(S); lightMotes(put, S, 5, 6); shadow(put, X(78), X(128), X(24), X(5));
  // legs
  [[70], [88]].forEach(([lx]) => { stroke(put, X(lx), X(96), X(lx), X(120), X(5), () => '#8a8e9a'); ell(put, X(lx + 1), X(124), X(6), X(3.4), (tx, ty) => mix('#b8bcc8', '#3a3e48', ty)); });
  // tabard over mail
  for (let y = 62; y <= 98; y++) { const t = (y - 62) / 36, w = 16 - t * 4; row(put, Math.round(X(y)), X(79 - w), X(79 + w), (tx) => mix('#e8e4d8', '#a8a294', clamp(tx * 1.25 + t * 0.2, 0, 1))); }
  // red cross on the tabard
  stroke(put, X(79), X(68), X(79), X(92), X(3), () => '#c8302a');
  stroke(put, X(70), X(78), X(88), X(78), X(3), () => '#c8302a');
  // pauldrons
  ell(put, X(61), X(66), X(8), X(7), (tx, ty) => mix('#c8ccd8', '#4a4e5c', clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(97), X(66), X(8), X(7), (tx, ty) => mix('#c8ccd8', '#4a4e5c', clamp(tx + ty * 0.5, 0, 1)));
  // great helm w/ cross slit
  dome(put, X(79), X(52), X(10), '#d8dce8', '#8a92a2', '#3a3e48');
  stroke(put, X(79), X(48), X(79), X(58), X(1.6), () => '#1a1c22');
  row(put, Math.round(X(52)), X(72), X(86), () => '#1a1c22');
  // warhammer overhead two-handed
  stroke(put, X(92), X(70), X(108), X(50), X(3), () => '#6a4e2a');
  stroke(put, X(66), X(70), X(104), X(54), X(2.6), () => '#6a4e2a');
  plate(put, X(102), X(36), X(122), X(52), '#c8ccd8', '#f0f4fa', '#4a4e5c');
  stroke(put, X(112), X(52), X(112), X(58), X(2), () => G.holyLt); // blessed spark
}

// 7 TEMPLE ACOLYTE — battlefield healer
function drawAcolyte(put, S) {
  const X = U(S); lightMotes(put, S, 5, 7); shadow(put, X(78), X(126), X(20), X(4));
  // simple robe
  for (let y = 60; y <= 120; y++) { const t = (y - 60) / 60, w = 9 + t * 9; row(put, Math.round(X(y)), X(76 - w), X(76 + w), (tx) => mix('#d8cfc0', '#8a8070', clamp(tx * 1.2 + t * 0.3, 0, 1))); }
  row(put, Math.round(X(120)), X(58), X(94), () => G.goldDk);
  stroke(put, X(76), X(78), X(76), X(112), X(1.2), () => '#b8ae9c'); // robe fold
  // rope belt
  row(put, Math.round(X(90)), X(64), X(88), () => '#a8845a');
  stroke(put, X(84), X(90), X(86), X(100), X(1.2), () => '#a8845a');
  // hood down, tonsure head
  ell(put, X(76), X(52), X(9), X(9), (tx, ty) => mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.45 - 0.25, 0, 1)));
  for (let a = 2.8; a <= 6.6; a += 0.2) put(Math.round(X(76 + Math.cos(a) * 8.4)), Math.round(X(50 + Math.sin(a) * 8)), '#8a6a3a'); // hair ring
  put(Math.round(X(73)), Math.round(X(51)), G.ink); put(Math.round(X(79)), Math.round(X(51)), G.ink);
  // hands raised with healing light
  stroke(put, X(66), X(70), X(54), X(60), X(2.6), () => '#b8ae9c');
  stroke(put, X(86), X(70), X(98), X(60), X(2.6), () => '#b8ae9c');
  ell(put, X(52), X(57), X(2.6), X(2.4), () => G.skin); ell(put, X(100), X(57), X(2.6), X(2.4), () => G.skin);
  // healing burst between the hands
  rays(put, X(76), X(44), X(4), X(9), 8, G.holyLt);
  ell(put, X(76), X(44), X(3.4), X(3.4), (tx, ty) => mix(G.white, G.holy, tx + ty * 0.3));
  // green plus sparks drifting to allies
  [[46, 78], [108, 82]].forEach(([px2, py2]) => { stroke(put, X(px2 - 2), X(py2), X(px2 + 2), X(py2), X(1), () => '#7ae87a'); stroke(put, X(px2), X(py2 - 2), X(px2), X(py2 + 2), X(1), () => '#7ae87a'); });
}

// 8 PRAYER WISP — light motes (mirror of soul wisp)
function drawPrayerWisp(put, S) {
  const X = U(S); lightMotes(put, S, 5, 8);
  // shaft of light from above
  for (let y = 0; y < S * 0.75; y++) { const t = y / (S * 0.75); row(put, Math.round(y), X(70 - t * 4), X(92 + t * 4), (tx) => (((tx * 10) | 0) % 3 === 0 ? mix(G.holy, H.night, 0.55 + t * 0.2) : undefined) || mix(G.holy, H.night, 0.85)); }
  // main wisp trio ascending
  [[80, 56, 8, 0], [60, 84, 6, 0.2], [102, 90, 5, 0.3]].forEach(([mx, my, ms, fd]) => {
    ell(put, X(mx), X(my), X(ms), X(ms * 1.25), (tx, ty) => mix(mix(G.holyLt, H.night, fd), mix(G.holy, H.night, fd + 0.2), clamp(tx + ty * 0.5, 0, 1)));
    put(Math.round(X(mx - ms * 0.35)), Math.round(X(my - ms * 0.2)), mix(G.goldDk, G.holy, 0.3));
    put(Math.round(X(mx + ms * 0.35)), Math.round(X(my - ms * 0.2)), mix(G.goldDk, G.holy, 0.3));
    // serene closed-eye smile
    stroke(put, X(mx - 1.4), X(my + ms * 0.4), X(mx + 1.4), X(my + ms * 0.4), X(0.8), () => mix(G.goldDk, G.holy, 0.4));
  });
  // rising trails
  [[80, 68, 84, 112], [60, 92, 54, 120], [102, 97, 108, 118]].forEach(([x0, y0, x1, y1]) => {
    for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(X(x0 + (x1 - x0) * t + Math.sin(t * 6) * 3)), Math.round(X(y0 + (y1 - y0) * t)), mix(G.holy, H.night, 0.3 + t * 0.45)); }
  });
}

// 9 DOVE FLOCK — dive formation
function drawDoves(put, S) {
  const X = U(S); lightMotes(put, S, 5, 9);
  // three doves in a V, one big + two small
  [[80, 62, 1], [50, 84, 0.7], [112, 88, 0.7]].forEach(([dx, dy, sc]) => {
    // body + tail
    ell(put, X(dx), X(dy), X(9 * sc), X(6 * sc), (tx, ty) => mix(G.white, G.wingDk, clamp(tx * 0.9 + ty * 0.6 - 0.25, 0, 1)));
    for (let i = 0; i <= 4; i++) stroke(put, X(dx + 7 * sc), X(dy + 1 * sc), X(dx + (13 + i) * sc), X(dy + (4 + i * 1.4) * sc), X(1.2 * sc), () => mix(G.wing, G.wingDk, i * 0.2));
    // wings mid-flap
    for (let i = 0; i <= 7; i++) { const t = i / 7; stroke(put, X(dx - 2 * sc), X(dy - 2 * sc), X(dx - (4 + t * 12) * sc), X(dy - (8 + t * 6) * sc), X(1.3 * sc), () => mix(G.white, G.wingDk, t * 0.6)); }
    for (let i = 0; i <= 6; i++) { const t = i / 6; stroke(put, X(dx + 1 * sc), X(dy - 2 * sc), X(dx + (6 + t * 10) * sc), X(dy - (7 + t * 4) * sc), X(1.2 * sc), () => mix(G.wing, G.wingDk, t * 0.6)); }
    // head + beak
    ell(put, X(dx - 8 * sc), X(dy - 1 * sc), X(4 * sc), X(3.6 * sc), (tx, ty) => mix(G.white, G.wingDk, ty * 0.5));
    put(Math.round(X(dx - 9 * sc)), Math.round(X(dy - 2 * sc)), G.ink);
    stroke(put, X(dx - 12 * sc), X(dy - 0.5 * sc), X(dx - 14 * sc), X(dy), X(1.2 * sc), () => G.gold);
    // olive sprig on the leader
    if (sc === 1) { stroke(put, X(dx - 13), X(dy + 1), X(dx - 18), X(dy + 4), X(1), () => '#5a8a3a'); [[dx - 16, dy + 2], [dx - 18, dy + 5]].forEach(([ox, oy]) => ell(put, X(ox), X(oy), X(1.6), X(1), () => '#7ab04a')); }
  });
  // dive lines
  [[40, 40], [76, 34], [110, 46]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 5), X(ly + 12), X(1), () => mix(G.sky, H.night, 0.55)));
}

// 10 GUARDIAN STATUE — moves when unwatched
function drawGuardian(put, S) {
  const X = U(S); lightMotes(put, S, 4, 10); shadow(put, X(78), X(126), X(26), X(5));
  plate(put, X(56), X(114), X(102), X(124), G.marbleDk, G.marble, '#6a685e'); // plinth
  // marble angel, hands over face (peek-a-boo dread)
  wing(put, X(64), X(62), -1, X(18), G.marble, G.marbleDk);
  wing(put, X(92), X(62), 1, X(18), G.marble, G.marbleDk);
  for (let y = 60; y <= 114; y++) { const t = (y - 60) / 54, w = 10 + t * 8; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(G.marble, G.marbleDk, clamp(tx * 1.15 + t * 0.35, 0, 1))); }
  // robe folds
  [[70, 80, 68, 112], [78, 82, 78, 112], [86, 80, 88, 112]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0), X(x1), X(y1), X(1), () => G.marbleDk));
  // head bowed
  ell(put, X(78), X(52), X(9.5), X(9.5), (tx, ty) => mix('#f8f6ee', G.marbleDk, clamp(tx * 1.05 + ty * 0.5 - 0.3, 0, 1)));
  // hands covering the face
  ell(put, X(73), X(54), X(4), X(5.5), (tx, ty) => mix(G.marble, G.marbleDk, tx * 0.6 + ty * 0.3));
  ell(put, X(83), X(54), X(4), X(5.5), (tx, ty) => mix(G.marble, G.marbleDk, tx * 0.6 + ty * 0.3));
  stroke(put, X(68), X(60), X(72), X(66), X(2.4), () => G.marbleDk); // forearm
  stroke(put, X(88), X(60), X(84), X(66), X(2.4), () => G.marbleDk);
  // ONE EYE peeking between the fingers
  put(Math.round(X(78)), Math.round(X(53)), H.night);
  put(Math.round(X(78)), Math.round(X(52.3)), '#c83a34');
  // hairline cracks
  stroke(put, X(70), X(74), X(74), X(84), X(0.7), () => G.marbleDk);
  stroke(put, X(88), X(92), X(84), X(102), X(0.7), () => G.marbleDk);
}

// 11 THE JUDGE — floating scales, verdict zones
function drawJudge(put, S) {
  const X = U(S); lightMotes(put, S, 5, 11);
  // hovering golden scales — beam + chains + two pans
  ell(put, X(80), X(46), X(4), X(4), (tx, ty) => mix(G.goldLt, G.goldDk, tx + ty * 0.4)); // pivot orb
  stroke(put, X(80), X(38), X(80), X(44), X(2), () => G.gold); // finial
  stroke(put, X(46), X(52), X(114), X(44), X(2.2), () => G.gold); // tilted beam
  [[48, 52, 86], [112, 44, 78]].forEach(([px2, py0, py1]) => {
    [[-8], [8]].forEach(([o]) => stroke(put, X(px2), X(py0), X(px2 + o), X(py1), X(0.9), () => G.goldDk));
    // pan
    for (let yy = 0; yy <= 4; yy++) row(put, Math.round(X(py1 + yy)), X(px2 - 12 + yy * 1.6), X(px2 + 12 - yy * 1.6), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.2 + yy * 0.15, 0, 1)));
  });
  // a soul on the light pan, a feather on the heavy one
  soulMote(put, X(112), X(72), X(3.4), 0.15);
  stroke(put, X(44), X(82), X(52), X(80), X(1.2), () => G.white); // feather
  put(Math.round(X(52)), Math.round(X(80)), G.wingDk);
  // stern eye on the pivot
  ell(put, X(80), X(52), X(6), X(4), () => H.night);
  ell(put, X(80), X(52), X(2.4), X(2.4), () => G.holyLt);
  // verdict circles projected below
  for (let a = 0; a < 6.28; a += 0.09) put(Math.round(X(56 + Math.cos(a) * 14)), Math.round(X(112 + Math.sin(a) * 5)), mix(G.holy, H.night, 0.4));
  for (let a = 0; a < 6.28; a += 0.09) put(Math.round(X(104 + Math.cos(a) * 14)), Math.round(X(116 + Math.sin(a) * 5)), mix('#c83a34', H.night, 0.45));
  put(Math.round(X(56)), Math.round(X(112)), G.holyLt);
  put(Math.round(X(104)), Math.round(X(116)), '#ff6a5a');
}

// 12 HARP SIREN — charm chords (mirror succubus)
function drawHarpSiren(put, S) {
  const X = U(S); lightMotes(put, S, 5, 12);
  wing(put, X(64), X(64), -1, X(17), G.wing, G.wingDk);
  // seated angelic figure w/ great harp
  for (let y = 70; y <= 112; y++) { const t = (y - 70) / 42, w = 9 + t * 10; row(put, Math.round(X(y)), X(66 - w * 0.6), X(66 + w), (tx) => mix('#e8d8f0', '#9a7ab0', clamp(tx * 1.15 + t * 0.3, 0, 1))); }
  ell(put, X(66), X(56), X(8.5), X(8.5), (tx, ty) => mix(G.skin, G.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)));
  for (let y = 46; y <= 66; y++) row(put, Math.round(X(y)), X(71), X(76 + Math.sin((y - 46) * 0.4) * 2), (tx) => mix('#e8c060', '#8a6a20', tx)); // golden hair fall
  halo(put, X(66), X(42), X(8));
  put(Math.round(X(63)), Math.round(X(55)), G.ink); put(Math.round(X(69)), Math.round(X(55)), G.ink);
  // the harp: gold frame + strings
  stroke(put, X(84), X(38), X(84), X(112), X(2.6), () => G.gold); // pillar
  for (let a = -0.2; a <= 1.35; a += 0.05) put(Math.round(X(84 + Math.sin(a) * 30)), Math.round(X(40 + (1 - Math.cos(a)) * 26)), G.goldDk); // curved neck
  stroke(put, X(84), X(112), X(112), X(104), X(2.6), () => G.gold); // soundboard
  for (let k = 0; k < 7; k++) { const t = k / 6; stroke(put, X(88 + t * 22), X(46 + t * 18), X(88 + t * 21), X(110 - t * 4), X(0.7), () => mix(G.white, G.wingDk, 0.2)); }
  // playing arm + note charm stream
  stroke(put, X(74), X(72), X(90), X(78), X(2.4), () => G.skin);
  [[112, 60, 1], [120, 48, 0.75], [126, 38, 0.55]].forEach(([nx, ny, sc]) => {
    ell(put, X(nx), X(ny), X(2.2 * sc), X(1.8 * sc), () => mix('#ff8ab0', H.night, 1 - sc));
    stroke(put, X(nx + 2 * sc), X(ny), X(nx + 2 * sc), X(ny - 6 * sc), X(1 * sc), () => mix('#ff8ab0', H.night, 1 - sc));
  });
}

// 13 RELIQUARY — walking shrine
function drawReliquary(put, S) {
  const X = U(S); lightMotes(put, S, 5, 13); shadow(put, X(80), X(126), X(24), X(5));
  // little legs
  [[68], [92]].forEach(([lx]) => { stroke(put, X(lx), X(108), X(lx), X(120), X(3.4), () => G.goldDk); ell(put, X(lx), X(122), X(4), X(2.4), () => G.goldDk); });
  // gabled golden chest
  for (let y = 70; y <= 108; y++) row(put, Math.round(X(y)), X(52), X(108), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.25 + (y - 70) / 60, 0, 1)));
  for (let y = 56; y <= 70; y++) { const w = (y - 56) * 2.1; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#f6e0a0', G.goldDk, clamp(tx * 1.2, 0, 1))); } // roof
  stroke(put, X(80), X(50), X(80), X(56), X(1.6), () => G.gold); put(Math.round(X(80)), Math.round(X(48)), G.holyLt); // finial cross tip
  stroke(put, X(78), X(52), X(82), X(52), X(1.4), () => G.gold);
  // saint window glowing + gem studs
  plate(put, X(70), X(78), X(90), X(100), '#3a2a5a', '#5a4a8a', '#1a1030');
  ell(put, X(80), X(88), X(4), X(6), (tx, ty) => mix(G.holyLt, G.holy, ty)); // the relic light
  rays(put, X(80), X(88), X(6), X(10), 6, mix(G.holy, '#3a2a5a', 0.3));
  [[58, 76], [102, 76], [58, 102], [102, 102]].forEach(([gx, gy]) => { ell(put, X(gx), X(gy), X(2.4), X(2.4), () => '#c83a5a'); put(Math.round(X(gx - 1)), Math.round(X(gy - 1)), '#ff9ab0'); });
  // relic hand banner
  stroke(put, X(52), X(70), X(52), X(88), X(1), () => G.goldDk);
}

// 14 LIGHT ELEMENTAL — living sunburst
function drawLightElemental(put, S) {
  const X = U(S); lightMotes(put, S, 6, 14);
  rays(put, X(80), X(80), X(30), X(44), 12, mix(G.holy, H.night, 0.35));
  rays(put, X(80), X(80), X(26), X(34), 12, G.holy);
  // core orb
  ell(put, X(80), X(80), X(22), X(22), (tx, ty) => mix(G.white, G.holyDk, clamp(tx * 0.9 + ty * 0.7 - 0.35, 0, 1)));
  ell(put, X(80), X(80), X(14), X(14), (tx, ty) => mix(G.white, G.holy, clamp(tx + ty * 0.4 - 0.3, 0, 1)));
  // calm face
  stroke(put, X(73), X(76), X(76), X(76), X(1.2), () => G.goldDk);
  stroke(put, X(84), X(76), X(87), X(76), X(1.2), () => G.goldDk);
  stroke(put, X(77), X(86), X(83), X(86), X(1), () => G.goldDk);
  // orbiting sparks
  [[48, 60], [116, 66], [108, 108], [52, 104]].forEach(([ox, oy], i) => { ell(put, X(ox), X(oy), X(2.4), X(2.4), () => (i % 2 ? G.holyLt : G.white)); });
}

// 15 GOLDEN GOLEM — gilded tank
function drawGoldenGolem(put, S) {
  const X = U(S); lightMotes(put, S, 4, 15); shadow(put, X(80), X(128), X(32), X(6));
  // mirror of the brute — but built, not grown: blocky gold
  for (let y = 56; y <= 106; y++) { const t = (y - 56) / 50, w = 24 - t * 10; row(put, Math.round(X(y)), X(79 - w), X(79 + w), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.25 + t * 0.25, 0, 1))); }
  // seams (it's plated)
  [[62, 70], [79, 62], [96, 70]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2), X(sx2), X(sy2 + 30), X(0.8), () => '#6a4a10'));
  row(put, Math.round(X(78)), X(58), X(100), () => '#6a4a10');
  // arms — massive gauntlets
  stroke(put, X(56), X(66), X(42), X(104), X(7), () => mix(G.gold, G.goldDk, 0.25));
  stroke(put, X(102), X(66), X(116), X(104), X(7), () => mix(G.gold, G.goldDk, 0.25));
  ell(put, X(40), X(110), X(8), X(6), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(118), X(110), X(8), X(6), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)));
  // legs
  stroke(put, X(68), X(102), X(66), X(122), X(6), () => G.goldDk);
  stroke(put, X(90), X(102), X(92), X(122), X(6), () => G.goldDk);
  // head — serene mask w/ script brow
  ell(put, X(79), X(48), X(10), X(9), (tx, ty) => mix('#f6e0a0', G.goldDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
  stroke(put, X(73), X(46), X(76), X(46), X(1.2), () => '#6a4a10'); stroke(put, X(82), X(46), X(85), X(46), X(1.2), () => '#6a4a10'); // closed eyes
  stroke(put, X(76), X(52), X(82), X(52), X(0.8), () => '#6a4a10');
  row(put, Math.round(X(41)), X(72), X(86), () => G.holyLt); // glowing scripture band
  // holy core glowing in the chest
  ell(put, X(79), X(72), X(5), X(6), (tx, ty) => mix(G.white, G.holy, ty));
  rays(put, X(79), X(72), X(7), X(11), 6, mix(G.holy, G.gold, 0.4));
}

// 16 HERALD — trumpet blast cone
function drawHerald(put, S) {
  const X = U(S); lightMotes(put, S, 5, 16);
  wing(put, X(60), X(60), -1, X(18), G.wing, G.wingDk);
  wing(put, X(84), X(60), 1, X(18), G.wing, G.wingDk);
  // blast cone first (to the right)
  for (let i = 0; i <= 22; i++) { const t = i / 22; const cw = 3 + t * 16; for (let k = -1; k <= 1; k += 0.34) put(Math.round(X(106 + t * 40)), Math.round(X(64 + k * cw)), mix(G.holyLt, H.night, 0.42 + Math.abs(k) * 0.3 + t * 0.2)); }
  // robed flying body (banner robe trailing left)
  for (let y = 58; y <= 100; y++) { const t = (y - 58) / 42, w = 9 + t * 7; row(put, Math.round(X(y)), X(72 - w - t * 10), X(72 + w * 0.8), (tx) => mix('#e8e2f0', '#9a90b8', clamp(tx * 1.15 + t * 0.35, 0, 1))); }
  // head tilted into the horn
  ell(put, X(76), X(52), X(8.5), X(8.5), (tx, ty) => mix(G.skin, G.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)));
  halo(put, X(76), X(40), X(9));
  put(Math.round(X(74)), Math.round(X(51)), G.ink);
  ell(put, X(82), X(56), X(2), X(1.6), () => '#c07a5a'); // puffed cheek
  // long golden trumpet
  stroke(put, X(84), X(58), X(106), X(62), X(2.2), () => G.gold);
  for (let i = 0; i <= 6; i++) { const t = i / 6; const bw = 2 + t * 5; stroke(put, X(106 + t * 8), X(62 + t * 0.5 - bw), X(106 + t * 8), X(62 + t * 0.5 + bw), X(1.4), () => mix(G.goldLt, G.goldDk, t * 0.5)); }
  // banner hanging from the horn
  for (let y = 64; y <= 78; y++) row(put, Math.round(X(y)), X(96), X(106), (tx) => mix('#c8302a', '#6a1210', tx));
  stroke(put, X(96), X(70), X(106), X(70), X(1), () => G.goldLt); // banner cross bar
}

// 17 ZEALOT PIKEMAN — line charger
function drawZealot(put, S) {
  const X = U(S); lightMotes(put, S, 4, 17); shadow(put, X(74), X(126), X(22), X(4));
  // charge lane hint
  for (let x = 20; x <= 140; x += 8) put(Math.round(X(x)), Math.round(X(124)), mix(G.holy, H.night, 0.5));
  // running legs
  stroke(put, X(70), X(96), X(56), X(114), X(4), () => '#8a8e9a');
  stroke(put, X(78), X(96), X(90), X(112), X(4), () => '#6a6e7a');
  ell(put, X(54), X(117), X(5), X(3), () => '#3a3e48'); ell(put, X(93), X(115), X(5), X(3), () => '#3a3e48');
  // mail + tabard leaning into the run
  for (let y = 62; y <= 96; y++) { const t = (y - 62) / 34, w = 12 - t * 3; row(put, Math.round(X(y)), X(74 - w + t * 4), X(74 + w + t * 4), (tx) => mix('#e8e4d8', '#a8a294', clamp(tx * 1.2 + t * 0.25, 0, 1))); }
  stroke(put, X(76), X(68), X(80), X(90), X(2.4), () => '#c8302a'); // cross sash
  // kettle helm head down
  dome(put, X(72), X(52), X(9), '#c8ccd8', '#8a92a2', '#3a3e48');
  row(put, Math.round(X(54)), X(60), X(84), () => '#8a92a2'); // brim
  put(Math.round(X(69)), Math.round(X(57)), G.ink);
  // pike couched forward
  stroke(put, X(58), X(80), X(134), X(70), X(2), () => '#8a6a3a');
  stroke(put, X(134), X(70), X(142), X(69), X(2.6), () => G.holyLt);
  put(Math.round(X(143)), Math.round(X(69)), G.white);
  stroke(put, X(80), X(74), X(94), X(76), X(2.4), () => '#a8a294'); // grip arm
}

// 18 GRAIL BEARER — elite support
function drawGrail(put, S) {
  const X = U(S); lightMotes(put, S, 6, 18); shadow(put, X(78), X(126), X(22), X(4));
  // tall veiled figure
  for (let y = 52; y <= 120; y++) { const t = (y - 52) / 68, w = 8 + t * 12; row(put, Math.round(X(y)), X(74 - w), X(74 + w), (tx) => mix('#f0e8f6', '#a894c0', clamp(tx * 1.15 + t * 0.35, 0, 1))); }
  // veil over head — no face, just calm dark
  ell(put, X(74), X(48), X(10), X(11), (tx, ty) => mix('#f0e8f6', '#a894c0', clamp(tx * 1.1 + ty * 0.4, 0, 1)));
  ell(put, X(74), X(50), X(6), X(6), () => '#2a2434');
  // arms raising THE GRAIL overhead
  stroke(put, X(64), X(66), X(58), X(48), X(2.6), () => '#c8b8dc');
  stroke(put, X(84), X(66), X(90), X(48), X(2.6), () => '#c8b8dc');
  // the grail
  for (let y = 30; y <= 40; y++) { const t = (y - 30) / 10, w = 9 - t * 5; row(put, Math.round(X(y)), X(74 - w), X(74 + w), (tx) => mix(G.goldLt, G.goldDk, clamp(tx * 1.2 + t * 0.2, 0, 1))); }
  stroke(put, X(74), X(40), X(74), X(45), X(2), () => G.gold);
  ell(put, X(74), X(46), X(5), X(1.8), (tx) => mix(G.goldLt, G.goldDk, tx));
  // overflowing light
  rays(put, X(74), X(28), X(5), X(10), 8, G.holyLt);
  [[64, 34, 60, 44], [84, 34, 88, 44]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 8; i++) { const t = i / 8; put(Math.round(X(x0 + (x1 - x0) * t)), Math.round(X(y0 + (y1 - y0) * t)), mix(G.holyLt, H.night, t * 0.5)); } });
  // buff auras around allies' spots
  [[42, 100], [108, 104]].forEach(([ax, ay]) => { for (let a = 0; a < 6.28; a += 0.12) put(Math.round(X(ax + Math.cos(a) * 10)), Math.round(X(ay + Math.sin(a) * 3.4)), mix(G.gold, H.night, 0.45)); });
}

// 19 SAINT SPIRIT — benevolent ghost (mirror of the ghost)
function drawSaint(put, S) {
  const X = U(S); lightMotes(put, S, 4, 19);
  // sheet spirit but luminous + serene
  for (let y = 46; y <= 112; y++) {
    const t = (y - 46) / 66, w = 19 - t * 2 + Math.sin(t * 6) * 2;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(mix(G.holyLt, '#c8b880', clamp(tx * 1.15 + t * 0.35, 0, 1)), H.night, t * 0.3));
  }
  for (let k = 0; k < 5; k++) { const hx = 62 + k * 9; for (let a = 3.34; a <= 6.1; a += 0.12) put(Math.round(X(hx + Math.cos(a) * 4.5)), Math.round(X(112 + Math.sin(a) * 5)), mix('#c8b880', H.night, 0.35)); }
  halo(put, X(80), X(38), X(11));
  // hands pressed in prayer
  stroke(put, X(74), X(84), X(80), X(72), X(3), () => mix(G.holyLt, '#c8b880', 0.3));
  stroke(put, X(86), X(84), X(80), X(72), X(3), () => mix(G.holyLt, '#c8b880', 0.3));
  stroke(put, X(80), X(70), X(80), X(64), X(2.4), () => G.holyLt);
  // closed peaceful eyes + small smile
  stroke(put, X(70), X(58), X(74), X(58), X(1.2), () => G.goldDk);
  stroke(put, X(86), X(58), X(90), X(58), X(1.2), () => G.goldDk);
  stroke(put, X(77), X(66), X(83), X(66), X(1), () => G.goldDk);
}

// 20 ARCHON — big elite winged knight
function drawArchon(put, S) {
  const X = U(S); lightMotes(put, S, 5, 20); shadow(put, X(80), X(128), X(28), X(5));
  // four wings flared
  wing(put, X(60), X(52), -1, X(22), G.wing, G.wingDk);
  wing(put, X(100), X(52), 1, X(22), G.wing, G.wingDk);
  wing(put, X(62), X(74), -1, X(16), G.wing, G.wingDk);
  wing(put, X(98), X(74), 1, X(16), G.wing, G.wingDk);
  // full gold-white plate
  [[70], [90]].forEach(([lx]) => { stroke(put, X(lx), X(98), X(lx), X(122), X(5), () => '#c8b878'); ell(put, X(lx + 1), X(126), X(6), X(3.4), (tx, ty) => mix(G.goldLt, G.goldDk, ty)); });
  for (let y = 60; y <= 100; y++) { const t = (y - 60) / 40, w = 16 - t * 4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#f6f0dc', '#b09850', clamp(tx * 1.25 + t * 0.25, 0, 1))); }
  stroke(put, X(80), X(62), X(80), X(98), X(1), () => G.goldDk);
  ell(put, X(80), X(74), X(4.4), X(5.4), (tx, ty) => mix(G.white, G.holy, ty)); // chest light
  // pauldrons
  ell(put, X(62), X(64), X(9), X(8), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(98), X(64), X(9), X(8), (tx, ty) => mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)));
  // helm w/ light plume, faceless glow visor
  dome(put, X(80), X(50), X(10), '#f6f0dc', '#c8b878', '#8a7a3a');
  row(put, Math.round(X(50)), X(72), X(88), () => H.night);
  row(put, Math.round(X(51)), X(73), X(87), () => G.holyLt);
  lick(put, X(80), X(36), X(7), G.holyLt, G.white);
  // greatblade of light held wide
  stroke(put, X(100), X(74), X(118), X(66), X(3), () => '#c8b878');
  stroke(put, X(118), X(66), X(140), X(36), X(3), () => G.holyLt);
  stroke(put, X(118), X(66), X(140), X(36), X(1.2), () => G.white);
  stroke(put, X(112), X(70), X(124), X(60), X(2.2), () => G.goldDk); // guard
}

const LIST = [
  { n: 1, name: 'CHERUB', role: 'tiny bow flyer', draw: drawCherub },
  { n: 2, name: 'ANGEL SOLDIER', role: 'sword + halo classic', draw: drawAngel },
  { n: 3, name: 'SERAPH', role: 'four wings, light lances', draw: drawSeraph },
  { n: 4, name: 'VALKYRIE', role: 'spear diver', draw: drawValkyrie },
  { n: 5, name: 'RADIANT HOUND', role: 'golden pack lunger', draw: drawRadiantHound },
  { n: 6, name: 'CRUSADER', role: 'warhammer zealot', draw: drawCrusader },
  { n: 7, name: 'TEMPLE ACOLYTE', role: 'heals other mobs', draw: drawAcolyte },
  { n: 8, name: 'PRAYER WISP', role: 'light motes (soul-wisp mirror)', draw: drawPrayerWisp },
  { n: 9, name: 'DOVE FLOCK', role: 'dive formation', draw: drawDoves },
  { n: 10, name: 'GUARDIAN STATUE', role: 'moves only when unwatched', draw: drawGuardian },
  { n: 11, name: 'THE JUDGE', role: 'floating scales, verdict circles', draw: drawJudge },
  { n: 12, name: 'HARP SIREN', role: 'charm chords (succubus mirror)', draw: drawHarpSiren },
  { n: 13, name: 'RELIQUARY', role: 'walking shrine', draw: drawReliquary },
  { n: 14, name: 'LIGHT ELEMENTAL', role: 'living sunburst', draw: drawLightElemental },
  { n: 15, name: 'GOLDEN GOLEM', role: 'gilded tank', draw: drawGoldenGolem },
  { n: 16, name: 'HERALD', role: 'trumpet blast cone', draw: drawHerald },
  { n: 17, name: 'ZEALOT PIKEMAN', role: 'line charger', draw: drawZealot },
  { n: 18, name: 'GRAIL BEARER', role: 'elite — buffs + heals mobs', draw: drawGrail },
  { n: 19, name: 'SAINT SPIRIT', role: 'benevolent ghost (mirror)', draw: drawSaint },
  { n: 20, name: 'ARCHON', role: 'elite four-wing knight', draw: drawArchon },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'holy_mob_options.png', title: 'ETERNAL STRUGGLE — HOLY SIDE MOBS (20 candidates) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
