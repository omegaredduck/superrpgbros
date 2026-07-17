// artdev/prehistoria/render_cavewoman.js — PREHISTORIA boss option B:
// cavewomen 10-sheet (Red). Amazon builds — strong + curvy, fur kit,
// stone-age weapons, dino trophies. Parameterized cavewoman(put,S,p).
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, plate, dome, shadow, renderSheet, floor } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// p: skin tones · hair:'mane'|'pony'|'braids'|'warhawk'|'bun' · hairC
//    paint:'stripes'|'hand'|'full'|'dots'|null · paintC
//    weapon:'spear'|'club'|'fists'|'teeth'|'axes'|'staff'|'sling'
//    pauldron:'skull'|null · cloak:bool · rexCrown:bool · old:bool · seed
function cavewoman(put, S, p) {
  p = p || {};
  const X = U(S);
  const skin = p.skin || '#d29468', skinLt = p.skinLt || '#f0ba8e', skinDk = p.skinDk || '#96603a';
  const hairC = p.old ? '#c8c2b2' : (p.hairC || '#2e1c10');
  floor(put, S, p.seed || 0);
  shadow(put, X(80), X(146), X(26), X(5));

  // ---- raptor-hide CLOAK behind
  if (p.cloak) {
    for (let y = 48; y <= 120; y++) {
      const t = (y - 48) / 72, w = 15 + t * 11 + Math.sin(y * 0.4) * 1.2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.dinoOLt, P.dinoODk, clamp(tx * 1.2 + t * 0.3, 0, 1)));
    }
    for (let x = 58; x <= 102; x += 6) stroke(put, X(x), X(116 + (x % 3)), X(x - 1), X(122 + (x % 3)), X(1.6), () => P.dinoODk);
  }
  // ---- long hair behind (before body)
  if (p.hair === 'mane') {
    for (let y = 22; y <= 84; y++) { const w = 10 + Math.sin(y * 0.25) * 2.4 - Math.max(0, y - 66) * 0.3; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(hairC, mix(hairC, '#000000', 0.55), clamp(tx + y / 110, 0, 1))); }
  } else if (p.hair === 'pony') {
    for (let i = 0; i <= 16; i++) { const t = i / 16; stroke(put, X(80 + Math.sin(t * 2.4) * 6 - 8), X(24 + t * 44), X(80 + Math.sin((t + 0.06) * 2.4) * 6 - 8), X(26 + t * 44), X(4.4 * (1 - t * 0.5)), () => mix(hairC, '#000000', t * 0.4)); }
  } else if (p.hair === 'braids') {
    [[-1], [1]].forEach(([sd]) => { for (let y = 30; y <= 78; y += 4) ell(put, X(80 + sd * 11 + Math.sin(y * 0.2) * 1.4), X(y), X(2.6), X(2.4), (tx, ty) => mix(hairC, '#000000', ((y / 4) % 2) * 0.3 + ty * 0.2)); put(Math.round(X(80 + sd * 11)), Math.round(X(80)), P.hornDk); });
  }

  // ---- LEGS + fur boots (long, strong)
  [[72, -1], [88, 1]].forEach(([lx, sd]) => {
    stroke(put, X(lx), X(104), X(lx + sd * 1), X(128), X(5.4), () => (sd < 0 ? skin : skinDk));
    ell(put, X(lx + sd * 1 - 1), X(120), X(3.4), X(4.4), (tx, ty) => mix(skinLt, skinDk, ty));
    for (let y = 130; y <= 142; y++) row(put, Math.round(X(y)), X(lx + sd * 1 - 4), X(lx + sd * 1 + 4), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.1 + ((y % 4) < 2 ? 0.22 : 0), 0, 1)));
    ell(put, X(lx + sd * 1), X(144), X(5), X(2.4), () => P.furDk);
  });

  // ---- FUR LOINCLOTH over strong hips
  for (let y = 94; y <= 114; y++) {
    const t = (y - 94) / 20, w = 14.5 - t * 4;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.15 + ((y % 4) < 2 ? 0.22 : 0) + t * 0.2, 0, 1)));
  }
  for (let x = 69; x <= 91; x += 5) stroke(put, X(x), X(112), X(x - 1), X(118), X(1.8), () => P.furDk);
  row(put, Math.round(X(94)), X(66), X(94), () => '#a8845a');

  // ---- TORSO — true hourglass: bust > underbust > waist < hips
  const WPROF = [[52, 12], [58, 13.5], [66, 13.5], [72, 9], [78, 7], [86, 10], [94, 13.5]];
  const wAt = (y) => { for (let i = 0; i < WPROF.length - 1; i++) { const [y0, w0] = WPROF[i], [y1, w1] = WPROF[i + 1]; if (y >= y0 && y <= y1) return w0 + (w1 - w0) * (y - y0) / (y1 - y0); } return 12; };
  for (let y = 52; y <= 96; y++) {
    const w = wAt(y);
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.2 + (y - 52) / 44 * 0.15, 0, 1)));
  }
  // fur bandeau — follows the BUST, not the whole torso
  [[74, -1], [86, 1]].forEach(([bx, sd]) => {
    ell(put, X(bx), X(62), X(6.8), X(6), (tx, ty) => mix(P.furLt, P.furDk, clamp(tx * 1.05 + ty * 0.55 - 0.15 + (((62 + ty * 6) | 0) % 4 < 2 ? 0.18 : 0), 0, 1)));
    // underline shadow so the bust reads round
    for (let a = 0.3; a <= 2.85; a += 0.12) put(Math.round(X(bx + Math.cos(a) * 6.4)), Math.round(X(63.5 + Math.sin(a) * 5.4)), mix(P.furDk, P.night, 0.25));
  });
  stroke(put, X(80), X(58), X(80), X(67), X(1.2), () => mix(P.furDk, P.night, 0.2)); // center seam
  stroke(put, X(70), X(57), X(64), X(50), X(1.4), () => '#a8845a'); // shoulder ties
  stroke(put, X(90), X(57), X(96), X(50), X(1.4), () => '#a8845a');
  // ab lines (she lifts)
  stroke(put, X(80), X(74), X(80), X(92), X(0.9), () => mix(skinDk, P.night, 0.1));
  [[80], [86]].forEach(([ay]) => stroke(put, X(75), X(ay), X(85), X(ay), X(0.8), () => mix(skinDk, skin, 0.4)));
  if (p.scars) stroke(put, X(72), X(76), X(84), X(88), X(1.2), () => mix('#a84a3a', skinDk, 0.4));
  const pc = p.paintC || '#c8452a';
  if (p.paint === 'stripes') [[76], [82]].forEach(([py2]) => stroke(put, X(70), X(py2), X(90), X(py2 + 2), X(1.8), () => mix(pc, skin, 0.2)));
  else if (p.paint === 'dots') [[72, 74], [88, 74], [76, 86], [84, 86]].forEach(([dx, dy]) => ell(put, X(dx), X(dy), X(1.6), X(1.6), () => pc));
  else if (p.paint === 'full') { for (let y = 72; y <= 94; y += 3) row(put, Math.round(X(y)), X(80 - 10), X(80 - 2), (tx) => mix(pc, skinDk, 0.3 + tx * 0.3)); }
  else if (p.paint === 'hand') { ell(put, X(80), X(80), X(3.4), X(3.8), () => pc); for (let k = -2; k <= 2; k++) stroke(put, X(80 + k * 1.8), X(76), X(80 + k * 2.2), X(72), X(1.2), () => pc); }
  // tooth necklace
  if (p.necklace !== false) for (let k = -3; k <= 3; k++) { const nx = 80 + k * 3.8, ny = 53 + (9 - k * k) * 0.3; stroke(put, X(nx), X(ny), X(nx - 0.4), X(ny + 3.4), X(1.2), () => (k % 2 ? P.claw : P.hornDk)); }
  if (p.pauldron === 'skull') {
    ell(put, X(60), X(52), X(9), X(7), (tx, ty) => mix(P.bone, P.boneDk, clamp(tx + ty * 0.5 - 0.15, 0, 1)));
    stroke(put, X(53), X(55), X(48), X(58), X(3.4), () => P.boneDk);
    ell(put, X(57), X(51), X(1.8), X(2.2), () => P.night);
  }

  // ---- ARMS + WEAPON (toned)
  const wpn = p.weapon || 'spear';
  ell(put, X(59), X(53), X(7.4), X(6.4), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  ell(put, X(101), X(53), X(7.4), X(6.4), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  if (wpn === 'spear') {
    stroke(put, X(103), X(54), X(114), X(64), X(5), () => skin);
    ell(put, X(116), X(68), X(3.6), X(3.4), () => skinDk);
    stroke(put, X(117), X(126), X(115), X(16), X(2.2), () => P.mudLt);
    for (let i = 0; i <= 6; i++) row(put, Math.round(X(10 + i)), X(112 + i * 0.5), X(118 - i * 0.2), () => P.horn);
    stroke(put, X(113), X(28), X(121), X(26), X(1), () => P.furDk);
    stroke(put, X(57), X(55), X(48), X(70), X(5), () => skin);
    ell(put, X(47), X(74), X(3.4), X(3.4), () => skinDk);
  } else if (wpn === 'club') {
    stroke(put, X(103), X(52), X(112), X(38), X(5), () => skin);
    stroke(put, X(112), X(38), X(109), X(26), X(4), () => skinLt);
    ell(put, X(108), X(23), X(3.6), X(3), () => skinDk);
    for (let i = 0; i <= 12; i++) { const t = i / 12; stroke(put, X(108 + t * 22), X(24 - t * 2), X(108 + t * 22), X(24 - t * 2), X(2.6 + t * 5), () => mix(P.mudLt, P.mudDk, clamp(t * 0.6 + ((i % 3) === 0 ? 0.15 : 0), 0, 1))); }
    stroke(put, X(57), X(55), X(48), X(70), X(5), () => skin);
    ell(put, X(47), X(74), X(3.4), X(3.4), () => skinDk);
  } else if (wpn === 'fists') {
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 21), X(55), X(80 + sd * 31), X(68), X(5), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 33), X(73), X(4.4), X(4), (tx, ty) => mix(skinLt, skinDk, ty));
      row(put, Math.round(X(71)), X(80 + sd * 33 - 3.4), X(80 + sd * 33 + 3.4), () => '#a8845a');
    });
  } else if (wpn === 'teeth') {
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 21), X(55), X(80 + sd * 30), X(72), X(5), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 31), X(76), X(3.4), X(3.4), () => skinDk);
      for (let i = 0; i <= 6; i++) row(put, Math.round(X(78 + i)), X(80 + sd * 31 - (1.8 - i * 0.26)), X(80 + sd * 31 + (1.8 - i * 0.26)), () => mix(P.tooth, P.hornDk, i / 8));
    });
  } else if (wpn === 'axes') {
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 21), X(55), X(80 + sd * 32), X(46), X(5), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 34), X(43), X(3.4), X(3), () => skinDk);
      stroke(put, X(80 + sd * 34), X(43), X(80 + sd * 40), X(31), X(2.2), () => P.mudLt);
      ell(put, X(80 + sd * 41), X(29), X(4), X(2.6), (tx) => mix('#8a8276', '#42403a', tx));
    });
  } else if (wpn === 'staff') {
    stroke(put, X(103), X(54), X(113), X(70), X(5), () => skin);
    ell(put, X(115), X(74), X(3.6), X(3.4), () => skinDk);
    stroke(put, X(116), X(128), X(117), X(12), X(2.2), () => P.mudLt);
    ell(put, X(117), X(8), X(4), X(3.6), (tx, ty) => mix(P.bone, P.boneDk, tx + ty * 0.4));
    put(Math.round(X(115.6)), Math.round(X(7)), P.night); put(Math.round(X(118.6)), Math.round(X(7)), P.night);
    stroke(put, X(57), X(55), X(48), X(70), X(5), () => skin);
    ell(put, X(47), X(74), X(3.4), X(3.4), () => skinDk);
  } else if (wpn === 'sling') {
    stroke(put, X(103), X(52), X(112), X(40), X(5), () => skin);
    for (let a = 0; a < 5.2; a += 0.12) put(Math.round(X(112 + Math.cos(a) * 16)), Math.round(X(34 + Math.sin(a) * 7)), mix(P.furDk, P.night, (a / 5.2) * 0.4));
    ell(put, X(112 + Math.cos(5.2) * 16), X(34 + Math.sin(5.2) * 7), X(3), X(2.4), (tx, ty) => mix('#8a8276', '#42403a', tx));
    stroke(put, X(57), X(55), X(48), X(70), X(5), () => skin);
    ell(put, X(47), X(74), X(3.4), X(3.4), () => skinDk);
  }

  // ---- HEAD
  stroke(put, X(80), X(44), X(80), X(52), X(5.4), () => skin);
  ell(put, X(80), X(34), X(9), X(9.5), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.05 + ty * 0.4 - 0.28, 0, 1)));
  // eyes + lashes + fierce brow
  put(Math.round(X(76)), Math.round(X(33)), P.night); put(Math.round(X(84)), Math.round(X(33)), P.night);
  stroke(put, X(74), X(31.4), X(77.4), X(31), X(0.9), () => mix(hairC, '#000000', 0.2));
  stroke(put, X(82.6), X(31), X(86), X(31.4), X(0.9), () => mix(hairC, '#000000', 0.2));
  stroke(put, X(78), X(40), X(82), X(40), X(1), () => '#a85a4a'); // lips
  if (p.paint) row(put, Math.round(X(35)), X(72), X(88), () => mix(pc, skin, 0.35));
  // hair top / crown
  if (p.rexCrown) {
    for (let y = 18; y <= 28; y++) { const t = (y - 18) / 10, w = 11 * (0.5 + t * 0.5); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.bone, P.boneDk, clamp(tx * 1.1 + t * 0.2, 0, 1))); }
    stroke(put, X(89), X(24), X(98), X(29), X(3.4), () => P.boneDk);
    ell(put, X(85), X(22), X(2), X(2.2), () => P.night);
    put(Math.round(X(85)), Math.round(X(22)), P.volcano);
    [[92, 30], [95, 31]].forEach(([tx2, ty2]) => stroke(put, X(tx2), X(ty2), X(tx2), X(ty2 + 2.6), X(1), () => P.tooth));
  } else if (p.hair === 'warhawk') {
    for (let x = 74; x <= 86; x += 2) stroke(put, X(x), X(26), X(x - 2), X(12 - Math.abs(x - 80) * 0.8), X(2.2), () => mix(p.hawkC || '#c8452a', '#5a1a0e', Math.abs(x - 80) / 9));
    for (let i = 0; i <= 10; i++) stroke(put, X(86 + i * 0.8), X(26 + i * 2.6), X(88 + i * 0.8), X(28 + i * 2.6), X(2), () => mix(hairC, '#000000', i / 12)); // fall behind
  } else if (p.hair === 'bun') {
    ell(put, X(80), X(23), X(7.4), X(3.4), (tx, ty) => mix(hairC, '#000000', tx * 0.5));
    ell(put, X(80), X(17), X(4), X(3.6), (tx, ty) => mix(hairC, '#000000', ty * 0.4));
    stroke(put, X(74), X(16), X(86), X(19), X(1), () => P.bone); // bone pin
  } else {
    // hairline over the head for mane/pony/braids
    ell(put, X(80), X(26), X(9.4), X(4.4), (tx, ty) => mix(hairC, '#000000', tx * 0.4 + ty * 0.2));
    if (p.hair === 'braids') { stroke(put, X(72), X(28), X(69, 34) || X(69), X(34), X(2.4), () => hairC); stroke(put, X(88), X(28), X(91), X(34), X(2.4), () => hairC); }
  }
  // flower or bone hairpin accent
  if (p.flower) { ell(put, X(72), X(27), X(2.4), X(2), () => '#e88ab0'); put(Math.round(X(72)), Math.round(X(26.4)), P.amberLt); }
}

const LIST = [
  { n: 1, name: 'THE HUNTRESS', role: 'stone spear, ponytail', draw: (p, S) => cavewoman(p, S, { weapon: 'spear', hair: 'pony', paint: 'dots', seed: 11 }) },
  { n: 2, name: 'CLUB QUEEN', role: 'knotted club, wild mane', draw: (p, S) => cavewoman(p, S, { weapon: 'club', hair: 'mane', seed: 12 }) },
  { n: 3, name: 'THE AMAZON', role: 'bare fists, wraps, scars', draw: (p, S) => cavewoman(p, S, { weapon: 'fists', hair: 'braids', scars: true, paint: 'stripes', skin: '#b87848', skinLt: '#e0a070', skinDk: '#7a4a24', seed: 13 }) },
  { n: 4, name: 'BONE PRIESTESS', role: 'skull staff, paint', draw: (p, S) => cavewoman(p, S, { weapon: 'staff', hair: 'bun', paint: 'hand', seed: 14 }) },
  { n: 5, name: 'TOOTH DANCER', role: 'twin rex-tooth daggers', draw: (p, S) => cavewoman(p, S, { weapon: 'teeth', hair: 'pony', paint: 'full', skin: '#a86a3e', skinLt: '#d29060', skinDk: '#6e3e1c', seed: 15 }) },
  { n: 6, name: 'WAR PAINT', role: 'warhawk, twin axes, ochre', draw: (p, S) => cavewoman(p, S, { weapon: 'axes', hair: 'warhawk', paint: 'stripes', seed: 16 }) },
  { n: 7, name: 'RAPTOR CLOAK', role: 'hide cloak + skull pauldron', draw: (p, S) => cavewoman(p, S, { weapon: 'axes', cloak: true, hair: 'mane', pauldron: 'skull', seed: 17 }) },
  { n: 8, name: 'ELDER QUEEN', role: 'grey + still ripped, staff', draw: (p, S) => cavewoman(p, S, { weapon: 'staff', old: true, hair: 'bun', scars: true, seed: 18 }) },
  { n: 9, name: 'SLING STAR', role: 'whirling sling, flower pin', draw: (p, S) => cavewoman(p, S, { weapon: 'sling', hair: 'braids', flower: true, seed: 19 }) },
  { n: 10, name: 'THE MATRIARCH', role: 'REX-SKULL CROWN + club + cloak', draw: (p, S) => cavewoman(p, S, { weapon: 'club', rexCrown: true, cloak: true, hair: 'mane', paint: 'stripes', seed: 20 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'cavewoman_options.png', title: 'PREHISTORIA — CAVEWOMEN (boss option B) — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { cavewoman, LIST };
