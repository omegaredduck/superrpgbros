// artdev/prehistoria/render_caveman.js — PREHISTORIA boss take 2 per
// Red: "a 10 sheet of riped cavemen". Parameterized caveman(put,S,p) —
// jacked primal humans w/ stone-age kit and dino trophies.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, plate, dome, shadow, renderSheet, floor } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// p: skin/skinLt/skinDk · hair:'mane'|'mohawk'|'topknot'|'bald' · hairC
//    beard:'big'|'braid'|'none' · paint:'stripes'|'hand'|'full'|'dots'|null · paintC
//    weapon:'club'|'bone'|'spear'|'fists'|'teeth'|'axes'|'staff'
//    pauldron:'skull'|null · cloak:bool (raptor hide + hood) · rexHelm:bool
//    necklace:bool · scars:bool · old:bool · seed
function caveman(put, S, p) {
  p = p || {};
  const X = U(S);
  const skin = p.skin || '#c88a58', skinLt = p.skinLt || '#e8ae7e', skinDk = p.skinDk || '#8a5630';
  const hairC = p.old ? '#c8c2b2' : (p.hairC || '#3a2a18');
  floor(put, S, p.seed || 0);
  shadow(put, X(80), X(146), X(30), X(5));

  // ---- raptor-hide CLOAK behind
  if (p.cloak) {
    for (let y = 48; y <= 122; y++) {
      const t = (y - 48) / 74, w = 17 + t * 12 + Math.sin(y * 0.4) * 1.4;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.dinoOLt, P.dinoODk, clamp(tx * 1.2 + t * 0.3, 0, 1)));
    }
    for (let x = 56; x <= 104; x += 6) stroke(put, X(x), X(118 + (x % 3)), X(x - 1), X(124 + (x % 3)), X(1.6), () => P.dinoODk); // ragged hem
  }

  // ---- LEGS + fur boots
  [[70, -1], [90, 1]].forEach(([lx, sd]) => {
    stroke(put, X(lx), X(104), X(lx + sd * 2), X(126), X(7), () => (sd < 0 ? skin : skinDk));
    ell(put, X(lx + sd * 2 - 1), X(122), X(4.4), X(5), (tx, ty) => mix(skinLt, skinDk, ty)); // calf ball
    // fur boot wrap
    for (let y = 128; y <= 142; y++) row(put, Math.round(X(y)), X(lx + sd * 2 - 5), X(lx + sd * 2 + 5), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.1 + ((y % 4) < 2 ? 0.22 : 0), 0, 1)));
    ell(put, X(lx + sd * 2), X(144), X(6), X(2.6), () => P.furDk);
    stroke(put, X(lx + sd * 2 - 5), X(132), X(lx + sd * 2 + 5), X(134), X(1), () => '#a8845a'); // lace
  });

  // ---- FUR LOINCLOTH
  for (let y = 96; y <= 116; y++) {
    const t = (y - 96) / 20, w = 15 - t * 4;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.15 + ((y % 4) < 2 ? 0.22 : 0) + t * 0.2, 0, 1)));
  }
  for (let x = 68; x <= 92; x += 5) stroke(put, X(x), X(114), X(x - 1), X(120), X(1.8), () => P.furDk); // shaggy hem
  row(put, Math.round(X(96)), X(64), X(96), () => '#a8845a'); // hide belt
  if (p.necklace) { [[70, 100], [80, 103], [90, 100]].forEach(([nx, ny]) => 0); }

  // ---- JACKED TORSO (bare)
  for (let y = 52; y <= 98; y++) {
    const t = (y - 52) / 46;
    const w = 25 - t * 10;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.2 + t * 0.18, 0, 1)));
  }
  // traps + pec shelf + abs
  for (let y = 47; y <= 54; y++) { const w = 13 + (y - 47) * 2.2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.2, 0, 1))); }
  stroke(put, X(80), X(56), X(80), X(72), X(1), () => mix(skinDk, P.night, 0.12));
  for (let a = 3.4; a <= 6.0; a += 0.08) { put(Math.round(X(69 + Math.cos(a) * 10)), Math.round(X(68 + Math.sin(a) * -5)), mix(skinDk, skin, 0.4)); put(Math.round(X(91 + Math.cos(a) * 10)), Math.round(X(68 + Math.sin(a) * -5)), mix(skinDk, skin, 0.4)); }
  stroke(put, X(80), X(72), X(80), X(94), X(1), () => mix(skinDk, P.night, 0.12));
  [[78], [85]].forEach(([ay]) => stroke(put, X(72), X(ay), X(88), X(ay), X(0.9), () => mix(skinDk, skin, 0.35)));
  stroke(put, X(72), X(92), X(88), X(92), X(0.9), () => mix(skinDk, skin, 0.35));
  // chest hair tuft or scars
  if (p.scars) { stroke(put, X(68), X(58), X(84), X(76), X(1.4), () => mix('#a84a3a', skinDk, 0.35)); stroke(put, X(88), X(60), X(78), X(72), X(1.2), () => mix('#a84a3a', skinDk, 0.45)); }
  // war paint
  const pc = p.paintC || '#c8452a';
  if (p.paint === 'stripes') { [[60], [70]].forEach(([py2]) => stroke(put, X(66), X(py2), X(94), X(py2 + 3), X(2.2), () => mix(pc, skin, 0.15))); }
  else if (p.paint === 'hand') { ell(put, X(80), X(64), X(4), X(4.4), () => pc); for (let k = -2; k <= 2; k++) stroke(put, X(80 + k * 2), X(60), X(80 + k * 2.4), X(55), X(1.4), () => pc); }
  else if (p.paint === 'full') { for (let y = 52; y <= 96; y += 3) row(put, Math.round(X(y)), X(80 - (25 - (y - 52) / 46 * 10)), X(80 - (25 - (y - 52) / 46 * 10) + 8), (tx) => mix(pc, skinDk, 0.3 + tx * 0.3)); }
  else if (p.paint === 'dots') { [[70, 58], [90, 58], [66, 74], [94, 74], [74, 88], [86, 88]].forEach(([dx, dy]) => ell(put, X(dx), X(dy), X(1.8), X(1.8), () => pc)); }
  // trophy necklace (claws)
  if (p.necklace !== false) { for (let k = -3; k <= 3; k++) { const nx = 80 + k * 4.4, ny = 54 + Math.abs(k) * -0 + (9 - k * k) * 0.35; stroke(put, X(nx), X(ny), X(nx - 0.5), X(ny + 4), X(1.4), () => (k % 2 ? P.claw : P.hornDk)); } }

  // ---- dino-skull PAULDRON
  if (p.pauldron === 'skull') {
    ell(put, X(58), X(52), X(11), X(8), (tx, ty) => mix(P.bone, P.boneDk, clamp(tx + ty * 0.5 - 0.15, 0, 1)));
    stroke(put, X(50), X(56), X(44), X(60), X(4), () => P.boneDk); // snout hangs over arm
    ell(put, X(54), X(52), X(2.2), X(2.6), () => P.night);
    [[48, 58], [52, 60]].forEach(([tx2, ty2]) => stroke(put, X(tx2), X(ty2), X(tx2), X(ty2 + 3), X(1), () => P.tooth));
  }

  // ---- ARMS + WEAPON
  const wpn = p.weapon || 'club';
  // shoulder boulders
  ell(put, X(55), X(54), X(10), X(8.4), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  ell(put, X(105), X(54), X(10), X(8.4), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  if (wpn === 'club' || wpn === 'bone' || wpn === 'staff') {
    // right arm raised with the big stick
    stroke(put, X(107), X(52), X(117), X(38), X(7), () => skin);
    ell(put, X(113), X(44), X(5), X(4), (tx, ty) => mix(skinLt, skinDk, ty)); // bicep
    stroke(put, X(117), X(38), X(113), X(26), X(5.4), () => skinLt);
    ell(put, X(112), X(23), X(4.4), X(3.6), () => skinDk); // fist
    if (wpn === 'club') {
      // massive knotted club
      for (let i = 0; i <= 12; i++) { const t = i / 12; stroke(put, X(112 + t * 22), X(24 - t * 2), X(112 + t * 22), X(24 - t * 2), X(3 + t * 6), () => mix(P.mudLt, P.mudDk, clamp(t * 0.6 + ((i % 3) === 0 ? 0.15 : 0), 0, 1))); }
      [[126, 18], [132, 26], [138, 20]].forEach(([kx, ky]) => put(Math.round(X(kx)), Math.round(X(ky)), P.mudDk)); // knots
    } else if (wpn === 'bone') {
      stroke(put, X(112), X(24), X(140), X(16), X(3.4), () => P.bone);
      ell(put, X(142), X(14), X(4), X(3.4), () => P.boneDk); ell(put, X(144), X(18), X(3.4), X(3), () => P.boneDk); // femur knob
    } else { // staff
      stroke(put, X(112), X(130), X(114), X(14), X(2.4), () => P.mudLt);
      ell(put, X(114), X(10), X(4.4), X(4), (tx, ty) => mix(P.bone, P.boneDk, tx + ty * 0.4)); // topper skull
      put(Math.round(X(112.6)), Math.round(X(9)), P.night); put(Math.round(X(115.6)), Math.round(X(9)), P.night);
    }
    // left arm flexing
    stroke(put, X(53), X(56), X(43), X(70), X(7), () => skin);
    stroke(put, X(43), X(70), X(49), X(82), X(5.4), () => skinLt);
    ell(put, X(51), X(85), X(4), X(4), () => skinDk);
  } else if (wpn === 'spear') {
    stroke(put, X(107), X(54), X(119), X(66), X(7), () => skin);
    ell(put, X(121), X(70), X(4.4), X(4), () => skinDk);
    stroke(put, X(122), X(128), X(120), X(18), X(2.4), () => P.mudLt);
    for (let i = 0; i <= 6; i++) row(put, Math.round(X(12 + i)), X(117 + i * 0.5), X(123 - i * 0.2), () => P.horn); // knapped head
    stroke(put, X(118), X(30), X(126), X(28), X(1), () => P.furDk); // lashing
    stroke(put, X(53), X(56), X(43), X(72), X(7), () => skin);
    ell(put, X(42), X(76), X(4), X(4), () => skinDk);
  } else if (wpn === 'fists') {
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 27), X(56), X(80 + sd * 37), X(70), X(7), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 39), X(76), X(5.4), X(5), (tx, ty) => mix(skinLt, skinDk, ty)); // big fist
      // hide knuckle wraps
      row(put, Math.round(X(74)), X(80 + sd * 39 - 4), X(80 + sd * 39 + 4), () => '#a8845a');
      row(put, Math.round(X(77)), X(80 + sd * 39 - 4.4), X(80 + sd * 39 + 4.4), () => '#8a6a42');
    });
  } else if (wpn === 'teeth') {
    // twin rex-tooth daggers, held low
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 27), X(56), X(80 + sd * 36), X(74), X(7), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 37), X(78), X(4), X(4), () => skinDk);
      for (let i = 0; i <= 6; i++) row(put, Math.round(X(80 + i)), X(80 + sd * 37 - (2 - i * 0.3)), X(80 + sd * 37 + (2 - i * 0.3)), () => mix(P.tooth, P.hornDk, i / 8));
    });
  } else if (wpn === 'axes') {
    [[-1], [1]].forEach(([sd]) => {
      stroke(put, X(80 + sd * 27), X(56), X(80 + sd * 38), X(48), X(7), () => (sd < 0 ? skin : skinLt));
      ell(put, X(80 + sd * 40), X(45), X(4), X(3.6), () => skinDk);
      stroke(put, X(80 + sd * 40), X(45), X(80 + sd * 46), X(32), X(2.4), () => P.mudLt);
      ell(put, X(80 + sd * 47), X(30), X(4.4), X(3), (tx) => mix('#8a8276', '#42403a', tx)); // stone head
      stroke(put, X(80 + sd * 44), X(34), X(80 + sd * 50), X(33), X(1), () => P.furDk);
    });
  }

  // ---- HEAD (heavy brow, square jaw)
  stroke(put, X(80), X(42), X(80), X(50), X(8), () => skin); // bull neck
  ell(put, X(80), X(34), X(10), X(10.5), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.05 + ty * 0.4 - 0.25, 0, 1)));
  // heavy brow ridge
  row(put, Math.round(X(30)), X(72), X(88), () => skinDk);
  put(Math.round(X(75)), Math.round(X(33)), P.night); put(Math.round(X(85)), Math.round(X(33)), P.night);
  if (p.old) { stroke(put, X(72), X(38), X(76), X(38), X(0.8), () => skinDk); stroke(put, X(84), X(38), X(88), X(38), X(0.8), () => skinDk); } // wrinkles
  // face paint stripe across the eyes
  if (p.paint) row(put, Math.round(X(33)), X(71), X(89), () => mix(p.paintC || '#c8452a', skin, 0.25));
  stroke(put, X(80), X(36), X(80), X(39), X(1.2), () => skinDk); // nose
  // ---- BEARD / HAIR / HELM
  if (p.beard === 'big') {
    for (let y = 38; y <= 58; y++) { const t = (y - 38) / 20, w = 8.4 * (1 - t * 0.4); row(put, Math.round(X(y + 2)), X(80 - w), X(80 + w), (tx) => mix(hairC, mix(hairC, '#000000', 0.5), clamp(tx * 0.9 + t * 0.3, 0, 1))); }
    [[75], [80], [85]].forEach(([bx]) => stroke(put, X(bx), X(46), X(bx), X(58), X(0.8), () => mix(hairC, '#000000', 0.4)));
  } else if (p.beard === 'braid') {
    for (let y = 38; y <= 48; y++) { const w = 7 * (1 - (y - 38) / 14); row(put, Math.round(X(y + 2)), X(80 - w), X(80 + w), (tx) => mix(hairC, '#000000', tx * 0.5)); }
    for (let y = 50; y <= 64; y += 3) ell(put, X(80), X(y), X(2.4), X(2), () => mix(hairC, '#000000', (y % 6) / 10));
    put(Math.round(X(80)), Math.round(X(66)), P.hornDk); // bead
  } else {
    stroke(put, X(76), X(41), X(84), X(41), X(1.2), () => '#8a4a3a'); // grim mouth
  }
  if (p.rexHelm) {
    // rex skull worn as helm
    for (let y = 16; y <= 30; y++) { const t = (y - 16) / 14, w = 12 * (0.5 + t * 0.5); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.bone, P.boneDk, clamp(tx * 1.1 + t * 0.2, 0, 1))); }
    stroke(put, X(90), X(24), X(100), X(30), X(4), () => P.boneDk); // upper snout juts fwd
    [[94, 32], [98, 33]].forEach(([tx2, ty2]) => stroke(put, X(tx2), X(ty2), X(tx2), X(ty2 + 3), X(1.2), () => P.tooth));
    ell(put, X(86), X(21), X(2.4), X(2.6), () => P.night); // socket
    put(Math.round(X(86)), Math.round(X(21)), P.volcano); // ember in the socket
  } else if (p.hair === 'mane') {
    for (let y = 20; y <= 44; y++) { const w = 11 + Math.sin(y * 0.6) * 1.6 - Math.max(0, (y - 34)) * 0.4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => { const inFace = y > 26 && Math.abs(tx - 0.5) < 0.32; return inFace ? undefined : mix(hairC, mix(hairC, '#000000', 0.55), clamp(tx + (y - 20) / 30, 0, 1)); }); }
    // redraw face over mane center
    ell(put, X(80), X(34), X(7.4), X(8), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.05 + ty * 0.4 - 0.25, 0, 1)));
    row(put, Math.round(X(30)), X(74), X(86), () => skinDk);
    put(Math.round(X(76)), Math.round(X(33)), P.night); put(Math.round(X(84)), Math.round(X(33)), P.night);
    stroke(put, X(80), X(36), X(80), X(39), X(1.2), () => skinDk);
  } else if (p.hair === 'mohawk') {
    for (let x = 74; x <= 86; x += 2) stroke(put, X(x), X(25), X(x), X(14 - Math.abs(x - 80)), X(2), () => mix(p.hawkC || '#c8452a', '#5a1a0e', Math.abs(x - 80) / 8));
    for (let a = 3.4; a <= 6.0; a += 0.2) put(Math.round(X(80 + Math.cos(a) * 9.4)), Math.round(X(28 + Math.sin(a) * 6)), mix(hairC, '#000000', 0.3)); // shaved sides
  } else if (p.hair === 'topknot') {
    ell(put, X(80), X(24), X(8.4), X(4), (tx, ty) => mix(hairC, '#000000', tx * 0.5));
    ell(put, X(80), X(17), X(3.4), X(4), (tx, ty) => mix(hairC, '#000000', ty * 0.4));
    stroke(put, X(78), X(20), X(82), X(20), X(1), () => P.hornDk); // bone tie
  }
}

const LIST = [
  { n: 1, name: 'CLUB KING', role: 'giant knotted club, big beard', draw: (p, S) => caveman(p, S, { weapon: 'club', beard: 'big', hair: 'mane', seed: 1 }) },
  { n: 2, name: 'BONE CRUSHER', role: 'femur club, skull pauldron', draw: (p, S) => caveman(p, S, { weapon: 'bone', pauldron: 'skull', hair: 'topknot', beard: 'braid', skin: '#a86a3e', skinLt: '#d29060', skinDk: '#6e3e1c', seed: 2 }) },
  { n: 3, name: 'THE ALPHA', role: 'bare fists, knuckle wraps, scars', draw: (p, S) => caveman(p, S, { weapon: 'fists', hair: 'bald', beard: 'big', scars: true, paint: 'stripes', seed: 3 }) },
  { n: 4, name: 'SPEAR FATHER', role: 'stone spear, claw necklace', draw: (p, S) => caveman(p, S, { weapon: 'spear', hair: 'mane', beard: 'braid', paint: 'dots', seed: 4 }) },
  { n: 5, name: 'TOOTH DUELIST', role: 'twin rex-tooth daggers', draw: (p, S) => caveman(p, S, { weapon: 'teeth', hair: 'topknot', paint: 'hand', skin: '#b87848', skinLt: '#e0a070', skinDk: '#7a4a24', seed: 5 }) },
  { n: 6, name: 'WAR PAINT', role: 'ochre-covered berserker, twin axes', draw: (p, S) => caveman(p, S, { weapon: 'axes', hair: 'mohawk', paint: 'full', seed: 6 }) },
  { n: 7, name: 'RAPTOR CLOAK', role: 'hide cloak, stone axes', draw: (p, S) => caveman(p, S, { weapon: 'axes', cloak: true, hair: 'mane', beard: 'big', seed: 7 }) },
  { n: 8, name: 'OLD KING', role: 'grey + still ripped, skull staff', draw: (p, S) => caveman(p, S, { weapon: 'staff', old: true, beard: 'big', hair: 'mane', scars: true, seed: 8 }) },
  { n: 9, name: 'GRANITE FIST', role: 'painted giant, bare knuckle', draw: (p, S) => caveman(p, S, { weapon: 'fists', hair: 'topknot', paint: 'full', paintC: '#4a6a8a', skin: '#9a6a4a', skinLt: '#c89068', skinDk: '#5e3a20', seed: 9 }) },
  { n: 10, name: 'THE TYRANT KING', role: 'REX-SKULL HELM + club — the boss', draw: (p, S) => caveman(p, S, { weapon: 'club', rexHelm: true, beard: 'big', cloak: true, scars: true, paint: 'stripes', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'caveman_options.png', title: 'PREHISTORIA — RIPPED CAVEMEN (boss) — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { caveman, LIST };
