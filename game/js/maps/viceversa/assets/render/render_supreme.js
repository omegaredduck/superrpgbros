// artdev/underworld/render_supreme.js — VICE VERSA holy boss:
// THE SUPREME BEING. 10 work-ups on a parameterized supreme(put,S,p).
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, lick, soulMote } = KIT;

const G = {
  marble: '#f2efe6', marbleDk: '#a8a496', gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a', wing: '#f8f6ee', wingDk: '#b0aa98',
  sky: '#a8d8f0', skyDk: '#4a7a9a', skin: '#f0c8a8', skinDk: '#b08a62', white: '#ffffff', ink: '#2a2420'
};
function U(S) { const u = S / 160; return v => v * u; }
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
  for (let a = 0; a < 6.28; a += 0.05) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
}
function rays(put, cx, cy, r0, r1, n, c) {
  for (let k = 0; k < n; k++) { const a = (k / n) * 6.28; stroke(put, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.1, () => c); }
}
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + seed * 157) % 1000) / 1000 * S, y = ((i * 683 + seed * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}

// p: face:'elder'|'blank'|'stern' · beard:bool · hair:'long'|'none'
//    haloS:'ring'|'sun'|'triple'|'none' · wings:0|2|4|6 · crown:bool
//    held:'staff'|'sword'|'orb'|'scales'|'bolt'|'bless'|'orbscepter'
//    robe:'white'|'gold'|'sky' · hover:bool · goldBody:bool · rayAura:bool
function supreme(put, S, p) {
  p = p || {};
  const X = U(S);
  lightMotes(put, S, 6, p.seed || 0);
  const robeC = p.robe === 'gold' ? [G.goldLt, G.goldDk] : p.robe === 'sky' ? ['#d8ecf8', '#6a92ac'] : [G.white, G.wingDk];
  const skin = p.goldBody ? '#f6e0a0' : G.skin, skinDk = p.goldBody ? G.goldDk : G.skinDk;
  if (!p.hover) shadow(put, X(80), X(148), X(30), X(5));

  // ---- RAY AURA behind
  if (p.rayAura) { rays(put, X(80), X(70), X(40), X(56), 14, mix(G.holy, H.night, 0.42)); rays(put, X(80), X(70), X(36), X(46), 14, mix(G.holyLt, H.night, 0.3)); }

  // ---- WINGS
  const wn = p.wings || 0;
  if (wn >= 2) { wing(put, X(58), X(52), -1, X(26), G.wing, G.wingDk); wing(put, X(102), X(52), 1, X(26), G.wing, G.wingDk); }
  if (wn >= 4) { wing(put, X(60), X(76), -1, X(19), G.wing, G.wingDk); wing(put, X(100), X(76), 1, X(19), G.wing, G.wingDk); }
  if (wn >= 6) { wing(put, X(62), X(96), -1, X(14), G.wing, G.wingDk); wing(put, X(98), X(96), 1, X(14), G.wing, G.wingDk); }

  // ---- ROBE BODY (tall, regal)
  for (let y = 52; y <= (p.hover ? 128 : 142); y++) {
    const t = (y - 52) / 90;
    let w = 13 + t * 15;
    if (p.hover && y > 108) w *= Math.max(0.15, 1 - (y - 108) / 26); // taper to light
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(robeC[0], robeC[1], clamp(tx * 1.2 + t * 0.3, 0, 1)));
  }
  if (!p.hover) row(put, Math.round(X(142)), X(52), X(108), () => G.goldDk); // hem trim
  else for (let i = 0; i < 4; i++) put(Math.round(X(80 + Math.sin(i * 2.1) * 3)), Math.round(X(130 + i * 4)), mix(G.holy, H.night, 0.25 + i * 0.15));
  // gold sash + trim
  stroke(put, X(68), X(64), X(92), X(70), X(2.6), () => G.gold);
  stroke(put, X(80), X(52), X(80), X(96), X(1), () => mix(robeC[1], G.goldDk, 0.4)); // center seam
  // chest emblem
  ell(put, X(80), X(78), X(4.4), X(5), (tx, ty) => mix(G.white, G.holy, ty));
  rays(put, X(80), X(78), X(6), X(9), 8, mix(G.holy, robeC[1], 0.3));

  // ---- ARMS + HELD
  const held = p.held || 'bless';
  if (held === 'staff') {
    stroke(put, X(94), X(60), X(108), X(76), X(4), () => robeC[1]); // sleeve
    ell(put, X(110), X(79), X(3.4), X(3.4), () => skin);
    stroke(put, X(112), X(136), X(112), X(30), X(2.4), () => G.goldDk);
    ell(put, X(112), X(26), X(5), X(5), (tx, ty) => mix(G.white, G.holyDk, tx + ty * 0.4)); // light orb top
    rays(put, X(112), X(26), X(7), X(11), 8, G.holyLt);
    stroke(put, X(66), X(60), X(54), X(78), X(4), () => robeC[1]);
    ell(put, X(52), X(81), X(3.4), X(3.4), () => skin);
  } else if (held === 'sword') {
    stroke(put, X(94), X(60), X(110), X(70), X(4), () => robeC[1]);
    ell(put, X(112), X(72), X(3.4), X(3.4), () => skin);
    stroke(put, X(114), X(70), X(132), X(24), X(3), () => G.white);
    stroke(put, X(114), X(70), X(132), X(24), X(1.2), () => G.holyLt);
    stroke(put, X(108), X(66), X(122), X(74), X(2.2), () => G.goldDk);
    stroke(put, X(66), X(60), X(54), X(78), X(4), () => robeC[1]);
    ell(put, X(52), X(81), X(3.4), X(3.4), () => skin);
  } else if (held === 'orb') {
    // both hands cradling a world-orb
    stroke(put, X(66), X(60), X(60), X(84), X(4), () => robeC[1]);
    stroke(put, X(94), X(60), X(100), X(84), X(4), () => robeC[1]);
    ell(put, X(80), X(94), X(11), X(11), (tx, ty) => mix('#bfeaff', G.skyDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
    ell(put, X(76), X(90), X(3.4), X(2.4), () => '#7ab04a'); ell(put, X(85), X(97), X(2.6), X(2), () => '#7ab04a'); // continents
    halo(put, X(80), X(84), X(13));
    ell(put, X(62), X(88), X(3.4), X(3), () => skin); ell(put, X(98), X(88), X(3.4), X(3), () => skin);
  } else if (held === 'scales') {
    stroke(put, X(94), X(60), X(110), X(72), X(4), () => robeC[1]);
    ell(put, X(112), X(74), X(3.4), X(3.4), () => skin);
    stroke(put, X(112), X(74), X(112), X(60), X(1.4), () => G.goldDk);
    stroke(put, X(100), X(62), X(124), X(58), X(1.8), () => G.gold);
    [[100, 62, 72], [124, 58, 68]].forEach(([px2, py0, py1]) => {
      [[-5], [5]].forEach(([o]) => stroke(put, X(px2), X(py0), X(px2 + o), X(py1), X(0.8), () => G.goldDk));
      for (let yy = 0; yy <= 3; yy++) row(put, Math.round(X(py1 + yy)), X(px2 - 8 + yy), X(px2 + 8 - yy), (tx) => mix(G.goldLt, G.goldDk, tx));
    });
    stroke(put, X(66), X(60), X(54), X(78), X(4), () => robeC[1]);
    ell(put, X(52), X(81), X(3.4), X(3.4), () => skin);
  } else if (held === 'bolt') {
    stroke(put, X(94), X(60), X(112), X(48), X(4), () => robeC[1]);
    ell(put, X(114), X(45), X(3.4), X(3.4), () => skin);
    // jagged lightning held aloft
    let bx = 116, by = 42;
    [[8, -10], [-5, -8], [9, -9], [-4, -7]].forEach(([dx, dy]) => { stroke(put, X(bx), X(by), X(bx + dx), X(by + dy), X(2), () => '#fff6b0'); bx += dx; by += dy; });
    put(Math.round(X(bx)), Math.round(X(by)), G.white);
    stroke(put, X(66), X(60), X(54), X(78), X(4), () => robeC[1]);
    ell(put, X(52), X(81), X(3.4), X(3.4), () => skin);
  } else if (held === 'orbscepter') {
    // regalia: orb in left, scepter in right
    stroke(put, X(94), X(60), X(108), X(74), X(4), () => robeC[1]);
    ell(put, X(110), X(77), X(3.4), X(3.4), () => skin);
    stroke(put, X(111), X(96), X(111), X(48), X(2), () => G.gold);
    ell(put, X(111), X(44), X(4), X(4), (tx, ty) => mix(G.goldLt, G.goldDk, tx + ty * 0.4));
    put(Math.round(X(111)), Math.round(X(39)), G.holyLt);
    stroke(put, X(66), X(60), X(56), X(80), X(4), () => robeC[1]);
    ell(put, X(54), X(84), X(3.4), X(3), () => skin);
    ell(put, X(54), X(78), X(5), X(5), (tx, ty) => mix('#bfeaff', G.skyDk, tx + ty * 0.4));
    stroke(put, X(54), X(72), X(54), X(70), X(1.2), () => G.gold); stroke(put, X(52.5), X(71), X(55.5), X(71), X(1.2), () => G.gold);
  } else { // bless — both palms out
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 14), X(60), X(80 + sd * 30), X(74), X(4), () => robeC[1]);
      ell(put, X(80 + sd * 33), X(76), X(3.6), X(4.4), (tx, ty) => mix(skin, skinDk, ty * 0.5));
      rays(put, X(80 + sd * 33), X(76), X(6), X(9), 6, mix(G.holyLt, H.night, 0.25));
    });
  }

  // ---- HEAD
  ell(put, X(80), X(40), X(10), X(10), (tx, ty) => mix(p.face === 'blank' ? G.holyLt : skin, p.face === 'blank' ? G.holyDk : skinDk, clamp(tx * 1.05 + ty * 0.45 - 0.3, 0, 1)));
  if (p.face === 'blank') {
    // featureless light — just two brighter points
    put(Math.round(X(76)), Math.round(X(39)), G.white); put(Math.round(X(84)), Math.round(X(39)), G.white);
  } else {
    put(Math.round(X(76)), Math.round(X(39)), G.ink); put(Math.round(X(84)), Math.round(X(39)), G.ink);
    if (p.face === 'stern') { stroke(put, X(73), X(36), X(78), X(37), X(1.2), () => skinDk); stroke(put, X(82), X(37), X(87), X(36), X(1.2), () => skinDk); }
    else { stroke(put, X(77), X(45), X(83), X(45), X(1), () => '#c07a5a'); } // gentle mouth
  }
  if (p.hair === 'long') { for (let y = 34; y <= 56; y++) { row(put, Math.round(X(y)), X(88), X(93 + Math.sin((y - 34) * 0.4) * 1.6), (tx) => mix(G.white, G.wingDk, tx)); row(put, Math.round(X(y)), X(67 - Math.sin((y - 34) * 0.4) * 1.6), X(72), (tx) => mix(G.white, G.wingDk, 1 - tx)); } }
  ell(put, X(80), X(32), X(9), X(4), (tx, ty) => mix(G.white, G.wingDk, tx)); // white hair top
  if (p.beard) {
    for (let y = 44; y <= 66; y++) { const t = (y - 44) / 22, w = 7 * (1 - t * 0.55); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(G.white, G.wingDk, clamp(tx * 0.9 + t * 0.3, 0, 1))); }
    stroke(put, X(76), X(48), X(76), X(58), X(0.8), () => G.wingDk); stroke(put, X(84), X(48), X(84), X(58), X(0.8), () => G.wingDk); // beard strands
  }
  // ---- CROWN / HALO
  if (p.crown) {
    row(put, Math.round(X(29)), X(71), X(89), () => G.gold);
    [[72, 24], [80, 21], [88, 24]].forEach(([cx2, cy2]) => { stroke(put, X(cx2), X(29), X(cx2), X(cy2), X(2), () => G.gold); put(Math.round(X(cx2)), Math.round(X(cy2 - 1)), G.holyLt); });
    put(Math.round(X(80)), Math.round(X(31)), '#c83a5a'); // ruby
  }
  const hs = p.haloS || 'ring';
  if (hs === 'ring') halo(put, X(80), X(24), X(12));
  else if (hs === 'sun') { ell(put, X(80), X(40), X(0), X(0), () => G.white); rays(put, X(80), X(38), X(13), X(20), 12, G.gold); halo(put, X(80), X(24), X(11)); }
  else if (hs === 'triple') { halo(put, X(80), X(22), X(14)); halo(put, X(80), X(18), X(9)); halo(put, X(80), X(15), X(5)); }
}

const LIST = [
  { n: 1, name: 'THE ELDER', role: 'white beard, sun halo, light staff', draw: (p, S) => supreme(p, S, { beard: true, hair: 'long', haloS: 'sun', held: 'staff', robe: 'white', rayAura: true, seed: 1 }) },
  { n: 2, name: 'THE RADIANT', role: 'faceless light, triple halo, hovers', draw: (p, S) => supreme(p, S, { face: 'blank', haloS: 'triple', held: 'bless', robe: 'gold', hover: true, rayAura: true, seed: 2 }) },
  { n: 3, name: 'SERAPH KING', role: 'SIX wings, blade of light', draw: (p, S) => supreme(p, S, { wings: 6, held: 'sword', robe: 'white', crown: true, seed: 3 }) },
  { n: 4, name: 'JUDGE ETERNAL', role: 'stern, crown, the scales', draw: (p, S) => supreme(p, S, { face: 'stern', beard: true, crown: true, held: 'scales', robe: 'gold', seed: 4 }) },
  { n: 5, name: 'THE SHEPHERD', role: 'kind elder, crook, two wings', draw: (p, S) => supreme(p, S, { beard: true, held: 'staff', wings: 2, robe: 'sky', seed: 5 }) },
  { n: 6, name: 'STORMFATHER', role: 'zeus energy — bolt held high', draw: (p, S) => supreme(p, S, { beard: true, hair: 'long', face: 'stern', held: 'bolt', robe: 'sky', haloS: 'none', rayAura: true, seed: 6 }) },
  { n: 7, name: 'WORLD BEARER', role: 'cradles the world-orb', draw: (p, S) => supreme(p, S, { beard: true, held: 'orb', robe: 'white', haloS: 'ring', wings: 2, seed: 7 }) },
  { n: 8, name: 'GOLDEN COLOSSUS', role: 'living gold statue-god', draw: (p, S) => supreme(p, S, { goldBody: true, robe: 'gold', face: 'blank', held: 'sword', haloS: 'sun', seed: 8 }) },
  { n: 9, name: 'THE HOVERING LIGHT', role: 'four wings, no feet, blessing', draw: (p, S) => supreme(p, S, { wings: 4, hover: true, held: 'bless', face: 'blank', haloS: 'ring', robe: 'white', rayAura: true, seed: 9 }) },
  { n: 10, name: 'KING OF KINGS', role: 'crown + orb + scepter + 4 wings', draw: (p, S) => supreme(p, S, { crown: true, held: 'orbscepter', wings: 4, beard: true, robe: 'gold', haloS: 'ring', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'supreme_options.png', title: 'VICE VERSA — SUPREME BEING (holy boss) — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { supreme, LIST };
