// artdev/underworld/render_supreme_zeus.js — SUPREME BEING take 3 per
// Red: bottom-half robe, JACKED, greek god Zeus vibes. 10 work-ups on
// zeusGod(put,S,p) — heroic muscled torso, draped lower robe.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, renderSheet, lick } = KIT;

const G = {
  gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a',
  wing: '#f8f6ee', wingDk: '#b0aa98', sky: '#a8d8f0', skyDk: '#4a7a9a',
  white: '#ffffff', ink: '#2a2420'
};
function U(S) { const u = S / 160; return v => v * u; }
function halo(put, cx, cy, r) {
  for (let a = 0; a < 6.28; a += 0.05) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
}
function rays(put, cx, cy, r0, r1, n, c) {
  for (let k = 0; k < n; k++) { const a = (k / n) * 6.28; stroke(put, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.1, () => c); }
}
function wing(put, ax, ay, sd, s, c, cDk) {
  for (let layer = 0; layer < 3; layer++) {
    const ls = s * (1 - layer * 0.22);
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      stroke(put, ax + sd * t * ls * 0.4, ay + layer * s * 0.2, ax + sd * t * ls * 1.5, ay - Math.sin(t * 3.14) * ls * (0.9 - layer * 0.18) + layer * s * 0.22 + ls * 0.3, Math.max(1, s * 0.09), () => mix(layer ? c : G.white, cDk, t * 0.55 + layer * 0.15));
    }
  }
}
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + seed * 157) % 1000) / 1000 * S, y = ((i * 683 + seed * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}
// jagged bolt from (x0,y0) roughly toward dir
function bolt(put, X, x0, y0, segs, c1, c2) {
  let bx = x0, by = y0;
  segs.forEach(([dx, dy], i) => { stroke(put, X(bx), X(by), X(bx + dx), X(by + dy), X(2), () => (i % 2 ? c1 : c2)); bx += dx; by += dy; });
  return [bx, by];
}

// p: skin/skinLt/skinDk · beard:'white'|'dark'|'none' · hair:'long'|'short'
//    laurel · haloS:'ring'|'sun'|'none' · crown
//    held:'boltup'|'boltspear'|'staff'|'sword'|'orbarm'|'scales'|'crackle'
//    robe:'white'|'gold'|'sky' · sash · wings · rayAura · stormEyes · scar
function zeusGod(put, S, p) {
  p = p || {};
  const X = U(S);
  lightMotes(put, S, 6, p.seed || 0);
  const skin = p.skin || '#e8b088', skinLt = p.skinLt || '#f8d0a8', skinDk = p.skinDk || '#a06a44';
  const robeC = p.robe === 'gold' ? [G.goldLt, G.goldDk] : p.robe === 'sky' ? ['#d8ecf8', '#6a92ac'] : [G.white, G.wingDk];
  shadow_(put, X, S);
  function shadow_(put, X) { ell(put, X(80), X(148), X(30), X(5), (tx, ty) => mix('#000000', '#000000', 0)); }
  // redo shadow via kit-style soft
  for (let y = -4; y <= 4; y++) row(put, Math.round(X(148 + y * 0.6)), X(80 - 30 * Math.sqrt(1 - Math.abs(y) / 5)), X(80 + 30 * Math.sqrt(1 - Math.abs(y) / 5)), () => '#0a060a');

  if (p.rayAura) { rays(put, X(80), X(60), X(44), X(58), 14, mix(G.holy, H.night, 0.42)); }
  if (p.wings) { wing(put, X(56), X(50), -1, X(24), G.wing, G.wingDk); wing(put, X(104), X(50), 1, X(24), G.wing, G.wingDk); }

  // ---- LOWER ROBE (waist down, heavy drape)
  for (let y = 90; y <= 142; y++) {
    const t = (y - 90) / 52;
    const w = 15 + t * 14;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => {
      const fold = Math.abs(Math.sin(tx * 12.5)) * 0.22;
      return mix(robeC[0], robeC[1], clamp(tx * 1.1 + t * 0.3 + fold, 0, 1));
    });
  }
  row(put, Math.round(X(142)), X(51), X(109), () => G.goldDk); // hem trim
  // waist wrap + knot
  for (let y = 88; y <= 96; y++) row(put, Math.round(X(y)), X(64), X(96), (tx) => mix(robeC[0], robeC[1], clamp(tx * 1.3, 0, 1)));
  row(put, Math.round(X(88)), X(64), X(96), () => G.gold);
  ell(put, X(66), X(92), X(3.4), X(3), (tx, ty) => mix(robeC[0], robeC[1], ty)); // knot
  stroke(put, X(66), X(95), X(62), X(108), X(2.4), () => robeC[1]); // hanging fold tail
  // sandaled feet peeking
  [[70], [90]].forEach(([fx]) => { ell(put, X(fx), X(145), X(5.4), X(2.6), (tx, ty) => mix(skin, skinDk, ty)); stroke(put, X(fx - 3), X(144), X(fx + 3), X(144), X(0.8), () => '#8a5c2a'); });

  // ---- JACKED TORSO (V-taper, pecs, abs)
  for (let y = 46; y <= 90; y++) {
    const t = (y - 46) / 44;
    const w = 24 - t * 9;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.2 + t * 0.18, 0, 1)));
  }
  // traps up to neck
  for (let y = 42; y <= 48; y++) { const w = 12 + (y - 42) * 2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.2, 0, 1))); }
  // pec definition
  stroke(put, X(80), X(50), X(80), X(66), X(1), () => mix(skinDk, H.night, 0.15));
  for (let a = 3.4; a <= 6.0; a += 0.08) { put(Math.round(X(68 + Math.cos(a) * 9)), Math.round(X(62 + Math.sin(a) * -5)), mix(skinDk, skin, 0.4)); put(Math.round(X(92 + Math.cos(a) * 9)), Math.round(X(62 + Math.sin(a) * -5)), mix(skinDk, skin, 0.4)); }
  put(Math.round(X(72)), Math.round(X(60)), skinDk); put(Math.round(X(88)), Math.round(X(60)), skinDk); // nips
  // abs 2x3
  stroke(put, X(80), X(66), X(80), X(88), X(1), () => mix(skinDk, H.night, 0.15));
  [[72], [79]].forEach(([ay]) => stroke(put, X(72), X(ay + 0), X(88), X(ay), X(0.9), () => mix(skinDk, skin, 0.3)));
  stroke(put, X(72), X(86), X(88), X(86), X(0.9), () => mix(skinDk, skin, 0.3));
  // obliques
  stroke(put, X(69), X(74), X(72), X(86), X(0.9), () => mix(skinDk, skin, 0.35));
  stroke(put, X(91), X(74), X(88), X(86), X(0.9), () => mix(skinDk, skin, 0.35));
  if (p.scar) stroke(put, X(70), X(54), X(84), X(70), X(1.2), () => mix('#c86a5a', skinDk, 0.4));
  if (p.sash) { for (let i = 0; i <= 20; i++) { const t = i / 20; stroke(put, X(64 + t * 32), X(48 + t * 40), X(66 + t * 32), X(50 + t * 40), X(3), () => mix(p.sashC || '#c8302a', '#5a1210', t * 0.5)); } }

  // ---- ARMS (deltoid boulders + flexed)
  const held = p.held || 'boltup';
  // left arm (viewer left): varies
  ell(put, X(54), X(50), X(9.5), X(8), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1))); // delt
  ell(put, X(106), X(50), X(9.5), X(8), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  if (held === 'boltup') {
    // right arm raised w/ bolt overhead
    stroke(put, X(108), X(48), X(116), X(34), X(6), () => skin); // upper
    ell(put, X(113), X(40), X(4.4), X(3.6), (tx, ty) => mix(skinLt, skinDk, ty)); // bicep ball
    stroke(put, X(116), X(34), X(112), X(22), X(4.4), () => skinLt); // forearm
    ell(put, X(111), X(20), X(4), X(3.4), () => skinDk); // fist
    const end = bolt(put, X, 108, 18, [[10, -6], [-6, -5], [11, -5]], '#fff6b0', G.white);
    put(Math.round(X(end[0])), Math.round(X(end[1])), G.white);
    bolt(put, X, 114, 22, [[-8, 5], [6, 5]], mix('#fff6b0', H.night, 0.3), mix(G.white, H.night, 0.3));
    // left arm down-flexed
    stroke(put, X(52), X(54), X(44), X(72), X(6), () => skin);
    stroke(put, X(44), X(72), X(50), X(86), X(4.6), () => skinLt);
    ell(put, X(52), X(89), X(4), X(4), () => skinDk);
  } else if (held === 'boltspear') {
    stroke(put, X(108), X(50), X(118), X(70), X(6), () => skin);
    ell(put, X(120), X(74), X(4.2), X(4), () => skinDk);
    // lightning spear held vertical
    bolt(put, X, 121, 128, [[4, -22], [-6, -20], [5, -22], [-4, -18], [5, -20]], '#fff6b0', G.white);
    stroke(put, X(52), X(54), X(44), X(74), X(6), () => skin);
    ell(put, X(42), X(77), X(4), X(4), () => skinDk);
  } else if (held === 'staff') {
    stroke(put, X(108), X(50), X(118), X(72), X(6), () => skin);
    ell(put, X(119), X(76), X(4.2), X(4), () => skinDk);
    stroke(put, X(120), X(134), X(120), X(30), X(2.4), () => G.goldDk);
    ell(put, X(120), X(26), X(5), X(5), (tx, ty) => mix(G.white, G.holyDk, tx + ty * 0.4));
    rays(put, X(120), X(26), X(7), X(11), 8, G.holyLt);
    stroke(put, X(52), X(54), X(44), X(74), X(6), () => skin);
    ell(put, X(42), X(77), X(4), X(4), () => skinDk);
  } else if (held === 'sword') {
    stroke(put, X(108), X(50), X(120), X(64), X(6), () => skin);
    ell(put, X(122), X(67), X(4.2), X(4), () => skinDk);
    stroke(put, X(124), X(64), X(142), X(20), X(3.4), () => G.white);
    stroke(put, X(124), X(64), X(142), X(20), X(1.4), () => G.holyLt);
    stroke(put, X(118), X(60), X(132), X(68), X(2.2), () => G.goldDk);
    stroke(put, X(52), X(54), X(44), X(74), X(6), () => skin);
    ell(put, X(42), X(77), X(4), X(4), () => skinDk);
  } else if (held === 'orbarm') {
    // world orb tucked under left arm, right hand blessing
    stroke(put, X(108), X(48), X(118), X(36), X(6), () => skin);
    ell(put, X(120), X(32), X(4.4), X(4.4), (tx, ty) => mix(skinLt, skinDk, ty * 0.5));
    rays(put, X(120), X(32), X(6), X(9), 6, mix(G.holyLt, H.night, 0.25));
    stroke(put, X(52), X(54), X(46), X(76), X(6), () => skin);
    ell(put, X(46), X(84), X(9), X(9), (tx, ty) => mix('#bfeaff', G.skyDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
    ell(put, X(43), X(81), X(2.6), X(2), () => '#7ab04a');
    ell(put, X(50), X(87), X(2.2), X(1.8), () => '#7ab04a');
  } else if (held === 'scales') {
    // arm held OUT — the scales dangle from the end of his fist (Red)
    stroke(put, X(108), X(50), X(122), X(58), X(6), () => skin);
    ell(put, X(125), X(60), X(4.2), X(4), () => skinDk); // fist
    stroke(put, X(125), X(63), X(125), X(70), X(1.2), () => G.goldDk); // hanging ring chain
    ell(put, X(125), X(64), X(1.8), X(1.4), () => G.gold); // ring in the fist
    stroke(put, X(111), X(72), X(139), X(70), X(1.8), () => G.gold); // beam below the hand
    ell(put, X(125), X(71), X(2), X(1.8), () => G.goldLt); // pivot
    [[111, 72, 84], [139, 70, 82]].forEach(([px2, py0, py1]) => {
      [[-5], [5]].forEach(([o]) => stroke(put, X(px2), X(py0), X(px2 + o), X(py1), X(0.8), () => G.goldDk));
      for (let yy = 0; yy <= 3; yy++) row(put, Math.round(X(py1 + yy)), X(px2 - 7 + yy), X(px2 + 7 - yy), (tx) => mix(G.goldLt, G.goldDk, tx));
    });
    stroke(put, X(52), X(54), X(44), X(74), X(6), () => skin);
    ell(put, X(42), X(77), X(4), X(4), () => skinDk);
  } else { // crackle — both fists sparking
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 26), X(52), X(80 + sd * 34), X(72), X(6), () => skin);
      ell(put, X(80 + sd * 36), X(76), X(4.4), X(4.4), () => skinDk);
      bolt(put, X, 80 + sd * 36, 70, [[sd * 5, -6], [sd * -4, -5], [sd * 5, -6]], '#fff6b0', G.white);
    });
  }

  // ---- HEAD (proud, squared jaw)
  stroke(put, X(80), X(40), X(80), X(46), X(7), () => skin); // neck
  ell(put, X(80), X(32), X(9.5), X(10), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.05 + ty * 0.4 - 0.25, 0, 1)));
  put(Math.round(X(76)), Math.round(X(31)), p.stormEyes ? '#aef4ff' : G.ink);
  put(Math.round(X(84)), Math.round(X(31)), p.stormEyes ? '#aef4ff' : G.ink);
  if (p.stormEyes) { put(Math.round(X(76)), Math.round(X(30)), G.white); put(Math.round(X(84)), Math.round(X(30)), G.white); }
  stroke(put, X(73), X(28.5), X(78), X(29), X(1.2), () => mix(G.white, G.wingDk, 0.4)); // white brows
  stroke(put, X(82), X(29), X(87), X(28.5), X(1.2), () => mix(G.white, G.wingDk, 0.4));
  // hair
  if (p.hair === 'long') { for (let y = 26; y <= 46; y++) { row(put, Math.round(X(y)), X(87), X(92 + Math.sin((y - 26) * 0.4) * 1.6), (tx) => mix(G.white, G.wingDk, tx)); row(put, Math.round(X(y)), X(68 - Math.sin((y - 26) * 0.4) * 1.6), X(73), (tx) => mix(G.white, G.wingDk, 1 - tx)); } }
  ell(put, X(80), X(24), X(9), X(4.4), (tx, ty) => mix(G.white, G.wingDk, tx + ty * 0.3)); // swept crown of hair
  // beard
  if (p.beard === 'white') {
    for (let y = 34; y <= 56; y++) { const t = (y - 34) / 22, w = 8 * (1 - t * 0.45); row(put, Math.round(X(y + 2)), X(80 - w), X(80 + w), (tx) => mix(G.white, G.wingDk, clamp(tx * 0.9 + t * 0.3, 0, 1))); }
    [[75], [80], [85]].forEach(([bx]) => stroke(put, X(bx), X(42), X(bx), X(56), X(0.8), () => G.wingDk));
    stroke(put, X(76), X(35), X(84), X(35), X(1), () => '#c07a5a'); // mouth over beard? mouth hidden — mustache line
  } else if (p.beard === 'dark') {
    for (let y = 34; y <= 50; y++) { const t = (y - 34) / 16, w = 8 * (1 - t * 0.45); row(put, Math.round(X(y + 2)), X(80 - w), X(80 + w), (tx) => mix('#6a5a4a', '#3a2f24', clamp(tx * 0.9 + t * 0.3, 0, 1))); }
  } else {
    stroke(put, X(77), X(38), X(83), X(38), X(1.1), () => '#b06a4a'); // firm mouth
    stroke(put, X(80), X(33), X(80), X(36), X(1), () => skinDk); // nose
  }
  // laurel / crown / halo
  if (p.laurel) { [[-1], [1]].forEach(([sd]) => { for (let k = 0; k < 5; k++) ell(put, X(80 + sd * (5 + k * 2.6)), X(24 - k * 1.2), X(2.2), X(1.4), () => mix('#8aa86a', '#3e5a28', k * 0.15)); }); }
  if (p.crown) { row(put, Math.round(X(20)), X(72), X(88), () => G.gold); [[74, 16], [80, 14], [86, 16]].forEach(([cx2, cy2]) => { stroke(put, X(cx2), X(20), X(cx2), X(cy2), X(1.8), () => G.gold); put(Math.round(X(cx2)), Math.round(X(cy2 - 1)), G.holyLt); }); }
  const hs = p.haloS || 'none';
  if (hs === 'ring') halo(put, X(80), X(16), X(11));
  else if (hs === 'sun') { rays(put, X(80), X(28), X(13), X(19), 12, G.gold); halo(put, X(80), X(16), X(10)); }
}

const LIST = [
  { n: 1, name: 'THUNDER FATHER', role: 'classic zeus — bolt raised', draw: (p, S) => zeusGod(p, S, { beard: 'white', hair: 'long', held: 'boltup', laurel: true, rayAura: true, seed: 1 }) },
  { n: 2, name: 'THE ALMIGHTY', role: 'clean-shaven, halo, gold robe', draw: (p, S) => zeusGod(p, S, { beard: 'none', held: 'crackle', robe: 'gold', haloS: 'ring', seed: 2 }) },
  { n: 3, name: 'BRONZE TITAN', role: 'bronze skin, laurel, light staff', draw: (p, S) => zeusGod(p, S, { skin: '#c88a4a', skinLt: '#e8b070', skinDk: '#7a4a1e', beard: 'dark', laurel: true, held: 'staff', seed: 3 }) },
  { n: 4, name: 'MARBLE GOD', role: 'living statue, stern', draw: (p, S) => zeusGod(p, S, { skin: '#e2ded2', skinLt: '#f6f2e8', skinDk: '#9a968a', beard: 'white', held: 'sword', robe: 'white', haloS: 'ring', seed: 4 }) },
  { n: 5, name: 'GOLDEN ZEUS', role: 'gold body, sun halo, bolt spear', draw: (p, S) => zeusGod(p, S, { skin: '#e8c060', skinLt: '#ffe8a0', skinDk: '#9a7020', beard: 'white', held: 'boltspear', haloS: 'sun', robe: 'gold', seed: 5 }) },
  { n: 6, name: 'STORMBRINGER', role: 'storm eyes, fists crackling', draw: (p, S) => zeusGod(p, S, { beard: 'white', hair: 'long', stormEyes: true, held: 'crackle', robe: 'sky', rayAura: true, seed: 6 }) },
  { n: 7, name: 'THE PATRIARCH', role: 'world under arm, blessing hand', draw: (p, S) => zeusGod(p, S, { beard: 'white', held: 'orbarm', haloS: 'ring', seed: 7 }) },
  { n: 8, name: 'WAR FATHER', role: 'scarred, red sash, light blade', draw: (p, S) => zeusGod(p, S, { beard: 'dark', scar: true, sash: true, held: 'sword', seed: 8 }) },
  { n: 9, name: 'SKY KING', role: 'winged, bolt spear, sky robe', draw: (p, S) => zeusGod(p, S, { beard: 'white', wings: true, held: 'boltspear', robe: 'sky', haloS: 'ring', seed: 9 }) },
  { n: 10, name: 'JUDGE OLYMPUS', role: 'crowned, the scales, stern', draw: (p, S) => zeusGod(p, S, { beard: 'white', crown: true, held: 'scales', robe: 'gold', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'supreme_zeus_options.png', title: 'SUPREME BEING take 3 — JACKED zeus vibes, bottom-half robe — pick', S: 160, cols: 5, scale: 2 });
}
module.exports = { zeusGod, LIST };
