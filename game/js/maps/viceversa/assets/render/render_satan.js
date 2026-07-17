// artdev/underworld/render_satan.js — VICE VERSA hell boss: SATAN.
// 10 work-ups on a parameterized satan(put,S,p) — big demon lord.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, horns, batWing, tail, lick, soulMote, cracks, embers } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// p: skin/skinLt/skinDk · horns:'ram'|'long'|'crown'|'bull' · wings:bool
//    weapon:'trident'|'scythe'|'whip'|'sword'|'firehands'|'hook'
//    legs:'goat'|'armor'|'flame' · fire:'lava'|'fel' · goatHead:bool
//    fireCrown:bool · chains:bool · cape:bool · crackChest:bool
function satan(put, S, p) {
  p = p || {};
  const X = U(S);
  const skin = p.skin || H.demon, skinLt = p.skinLt || H.demonLt, skinDk = p.skinDk || H.demonDk;
  const fire = p.fire === 'fel' ? H.fel : H.lava, fireLt = p.fire === 'fel' ? H.felLt : H.lavaLt;
  embers(put, S, 7, p.seed || 0);
  shadow(put, X(80), X(148), X(34), X(6));

  // ---- WINGS behind
  if (p.wings) {
    batWing(put, X(56), X(52), -1, X(30), p.wingC || '#3a1220', '#1a0810');
    batWing(put, X(104), X(52), 1, X(30), p.wingC || '#3a1220', '#1a0810');
  }
  // ---- CAPE of fire behind torso
  if (p.cape) {
    for (let y = 46; y <= 118; y++) {
      const t = (y - 46) / 72, w = 16 + t * 16 + Math.sin(y * 0.4) * 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(mix(fire, H.night, 0.35), H.night, clamp(Math.abs(tx - 0.5) * 1.8 + t * 0.35, 0, 1)));
    }
    for (let k = 0; k < 5; k++) lick(put, X(52 + k * 14), X(118 + (k % 2) * 4), X(5), fire, fireLt);
  }

  // ---- TAIL
  tail(put, X(96), X(112), 1, X(34), skin, skinDk);

  // ---- LEGS
  if (p.legs === 'flame') {
    for (let y = 96; y <= 146; y++) {
      const t = (y - 96) / 50, w = 15 * (1 - t * 0.8) + Math.sin(y * 0.7) * 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(fireLt, fire, clamp(Math.abs(tx - 0.5) * 1.4 + t * 0.35, 0, 1)));
    }
    lick(put, X(70), X(100), X(5), fire, fireLt); lick(put, X(90), X(102), X(5), fire, fireLt);
  } else if (p.legs === 'armor') {
    [[68], [92]].forEach(([lx]) => {
      stroke(put, X(lx), X(108), X(lx), X(140), X(6), () => '#3a3444');
      ell(put, X(lx + 1), X(144), X(7), X(4), (tx, ty) => mix('#5a5468', '#1c1824', ty));
      put(Math.round(X(lx - 2)), Math.round(X(120)), '#6a6478'); // knee glint
    });
  } else { // goat
    [[68, -1], [92, 1]].forEach(([lx, sd]) => {
      stroke(put, X(lx), X(106), X(lx + sd * 2), X(122), X(5.4), () => mix(skin, skinDk, 0.3)); // thigh
      stroke(put, X(lx + sd * 2), X(122), X(lx - sd * 1), X(134), X(3.6), () => skinDk); // hock (reverse joint)
      stroke(put, X(lx - sd * 1), X(134), X(lx + sd * 1), X(144), X(3), () => mix(skinDk, H.night, 0.3)); // cannon
      // cloven hoof
      ell(put, X(lx + sd * 1), X(146), X(4), X(2.6), () => H.night);
      stroke(put, X(lx + sd * 1), X(144), X(lx + sd * 1), X(148), X(1), () => '#3a3440');
      // shag fur ticks
      for (let k = 0; k < 4; k++) stroke(put, X(lx + sd * 2 - 2 + k * 1.6), X(112 + k * 3), X(lx + sd * 2 - 3 + k * 1.6), X(116 + k * 3), X(1), () => skinDk);
    });
  }

  // ---- TORSO — massive V
  for (let y = 46; y <= 110; y++) {
    const t = (y - 46) / 64;
    const w = 24 - t * 12 + Math.sin(t * 3.14) * 2;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skinLt, skinDk, clamp(tx * 1.25 + t * 0.25, 0, 1)));
  }
  // abs / plate detail
  [[62], [74], [86]].forEach(([ay]) => stroke(put, X(70), X(ay + 14), X(90), X(ay + 14), X(0.9), () => mix(skinDk, H.night, 0.25)));
  stroke(put, X(80), X(58), X(80), X(100), X(0.9), () => mix(skinDk, H.night, 0.25));
  if (p.crackChest) cracks(put, X(80), X(70), X(30), 5, 2), put(Math.round(X(80)), Math.round(X(70)), fireLt);
  if (p.chains) {
    [[54, 52, 106, 96], [106, 52, 54, 96]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 18; i++) { const t = i / 18; if (i % 2 === 0) ell(put, X(x0 + (x1 - x0) * t), X(y0 + (y1 - y0) * t), X(2.4), X(1.8), () => (i % 4 ? '#5a5e68' : '#8a8e9a')); } });
    // soul lantern on the belt
    plate(put, X(88), X(100), X(98), X(112), '#4a4552', '#6a6e7a', '#221f28');
    ell(put, X(93), X(106), X(2.6), X(3.4), () => H.soulLt);
  }
  // ---- PAULDRON spikes (shoulders)
  ell(put, X(56), X(50), X(10), X(8), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(104), X(50), X(10), X(8), (tx, ty) => mix(skinLt, skinDk, clamp(tx + ty * 0.5, 0, 1)));
  [[52, 42], [60, 40], [100, 40], [108, 42]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2 + 8), X(sx2), X(sy2), X(2), () => H.hornDk));

  // ---- ARMS + WEAPON
  const wpn = p.weapon || 'trident';
  if (wpn === 'trident') {
    stroke(put, X(102), X(56), X(116), X(76), X(4.4), () => skin);
    ell(put, X(117), X(79), X(4), X(4), () => skinDk); // fist
    stroke(put, X(118), X(130), X(116), X(28), X(2.6), () => (p.goldWpn ? H.goldDk : H.ironDk));
    // prongs
    [[108, 20], [117, 12], [126, 20]].forEach(([px2, py2]) => { stroke(put, X(117), X(26), X(px2), X(py2), X(2), () => (p.goldWpn ? H.gold : H.iron)); put(Math.round(X(px2)), Math.round(X(py2 - 1)), fireLt); });
    stroke(put, X(58), X(56), X(48), X(78), X(4.4), () => skin);
    ell(put, X(46), X(81), X(4), X(4), () => skinDk);
  } else if (wpn === 'scythe') {
    stroke(put, X(102), X(56), X(118), X(70), X(4.4), () => skin);
    stroke(put, X(126), X(132), X(112), X(24), X(2.6), () => '#2a2030');
    for (let a = -0.2; a <= 1.5; a += 0.04) put(Math.round(X(112 + Math.cos(a) * 24)), Math.round(X(24 + Math.sin(a) * 10)), mix('#c8d0da', '#6a7280', (a + 0.2) / 1.7));
    stroke(put, X(58), X(56), X(50), X(80), X(4.4), () => skin);
    ell(put, X(120), X(74), X(4), X(4), () => skinDk); ell(put, X(49), X(83), X(4), X(4), () => skinDk);
  } else if (wpn === 'whip') {
    stroke(put, X(102), X(56), X(114), X(48), X(4.4), () => skin);
    let px2 = 116, py2 = 46;
    for (let i = 1; i <= 24; i++) {
      const t = i / 24, nx = 116 + Math.sin(t * 4.6) * 22 + t * 14, ny = 46 - t * 18 + Math.sin(t * 9) * 4;
      stroke(put, X(px2), X(py2), X(nx), X(ny), X(Math.max(1, 2.6 * (1 - t * 0.7))), () => mix(fire, fireLt, (i % 3) * 0.3));
      px2 = nx; py2 = ny;
    }
    lick(put, X(px2), X(py2 - 2), X(4.4), fire, fireLt);
    stroke(put, X(58), X(56), X(48), X(78), X(4.4), () => skin);
    ell(put, X(46), X(81), X(4), X(4), () => skinDk);
  } else if (wpn === 'sword') {
    stroke(put, X(102), X(56), X(118), X(68), X(4.4), () => skin);
    stroke(put, X(120), X(70), X(140), X(22), X(3.4), () => '#2a2030');
    stroke(put, X(120), X(70), X(140), X(22), X(1.2), () => fire); // molten core
    stroke(put, X(114), X(66), X(128), X(74), X(2.2), () => H.hornDk);
    stroke(put, X(58), X(56), X(48), X(78), X(4.4), () => skin);
    ell(put, X(46), X(81), X(4), X(4), () => skinDk);
  } else if (wpn === 'hook') {
    stroke(put, X(102), X(56), X(116), X(76), X(4.4), () => skin);
    for (let a = -0.4; a <= 3.4; a += 0.14) put(Math.round(X(120 + Math.cos(a) * 8)), Math.round(X(86 + Math.sin(a) * 8)), '#b8bcc8');
    for (let i = 0; i <= 10; i++) { if (i % 2 === 0) ell(put, X(118), X(78 - i * 4), X(2), X(1.6), () => '#5a5e68'); }
    stroke(put, X(58), X(56), X(48), X(78), X(4.4), () => skin);
    ell(put, X(46), X(81), X(4), X(4), () => skinDk);
  } else { // firehands
    [[-1, 46], [1, 114]].forEach(([sd, hx]) => {
      stroke(put, X(80 + sd * 22), X(56), X(hx), X(74), X(4.4), () => skin);
      ell(put, X(hx), X(78), X(5), X(5), (tx, ty) => mix(fireLt, fire, tx + ty * 0.4));
      lick(put, X(hx - 3), X(70), X(4), fire, fireLt);
      lick(put, X(hx + 3), X(68), X(5), fire, fireLt);
    });
  }

  // ---- HEAD
  if (p.goatHead) {
    // long goat skull face
    ell(put, X(80), X(34), X(11), X(11), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.1 + ty * 0.4 - 0.15, 0, 1)));
    for (let y = 38; y <= 52; y++) { const t = (y - 38) / 14, w = 6 * (1 - t * 0.4); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(skin, skinDk, clamp(tx * 1.2 + t * 0.3, 0, 1))); } // muzzle
    put(Math.round(X(77)), Math.round(X(50)), H.night); put(Math.round(X(83)), Math.round(X(50)), H.night); // nostrils
    // sideways goat eyes
    ell(put, X(72), X(33), X(3), X(2), () => fireLt); put(Math.round(X(72)), Math.round(X(33)), H.night);
    ell(put, X(88), X(33), X(3), X(2), () => fireLt); put(Math.round(X(88)), Math.round(X(33)), H.night);
    // beard tuft
    stroke(put, X(80), X(52), X(80), X(60), X(2.4), () => skinDk);
  } else {
    ell(put, X(80), X(36), X(11.5), X(11), (tx, ty) => mix(skinLt, skinDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
    // brow ridge + glowing eyes
    stroke(put, X(71), X(31), X(78), X(33), X(1.6), () => skinDk);
    stroke(put, X(82), X(33), X(89), X(31), X(1.6), () => skinDk);
    put(Math.round(X(74)), Math.round(X(35)), fireLt); put(Math.round(X(86)), Math.round(X(35)), fireLt);
    put(Math.round(X(74)), Math.round(X(36)), fire); put(Math.round(X(86)), Math.round(X(36)), fire);
    // sneer + fangs + goatee
    stroke(put, X(74), X(43), X(86), X(43), X(1.2), () => H.night);
    put(Math.round(X(75)), Math.round(X(44.5)), H.white); put(Math.round(X(85)), Math.round(X(44.5)), H.white);
    if (p.goatee !== false) { for (let y = 46; y <= 54; y++) { const w = 2.6 * (1 - (y - 46) / 9); row(put, Math.round(X(y)), X(80 - w), X(80 + w), () => mix(H.night, skinDk, 0.3)); } }
  }
  // ---- HORNS
  const hstyle = p.horns || 'long';
  if (hstyle === 'ram') {
    [[-1], [1]].forEach(([sd]) => { for (let a = -0.8; a <= 2.6; a += 0.07) { const t = (a + 0.8) / 3.4; stroke(put, X(80 + sd * (8 + Math.cos(a) * 9)), X(28 + Math.sin(a) * 9 - 4), X(80 + sd * (8 + Math.cos(a) * 9)), X(28 + Math.sin(a) * 9 - 4), X(3.4 * (1 - t * 0.6)), () => mix(H.horn, H.hornDk, t * 0.7)); } });
  } else if (hstyle === 'crown') {
    horns(put, X(80), X(28), X(12), H.horn, H.hornDk, 1.2);
    horns(put, X(80), X(30), X(7), H.horn, H.hornDk, 0.55);
    stroke(put, X(80), X(26), X(80), X(18), X(2), () => H.hornDk); // center spike
  } else if (hstyle === 'bull') {
    [[-1], [1]].forEach(([sd]) => { for (let i = 0; i <= 10; i++) { const t = i / 10; stroke(put, X(80 + sd * (10 + t * 16)), X(30 - Math.sin(t * 2.6) * 10), X(80 + sd * (10 + t * 16)), X(30 - Math.sin(t * 2.6) * 10), X(3.4 * (1 - t * 0.65)), () => mix(H.horn, H.hornDk, t * 0.6)); } });
  } else { // long — swept back and UP
    [[-1], [1]].forEach(([sd]) => { for (let i = 0; i <= 12; i++) { const t = i / 12; stroke(put, X(80 + sd * (7 + t * 10)), X(28 - t * 20 + t * t * 8), X(80 + sd * (7 + t * 10)), X(28 - t * 20 + t * t * 8), X(3 * (1 - t * 0.7)), () => mix(H.horn, H.hornDk, t * 0.7)); } });
  }
  if (p.fireCrown) { lick(put, X(72), X(20), X(5), fire, fireLt); lick(put, X(80), X(16), X(7), fire, fireLt); lick(put, X(88), X(20), X(5), fire, fireLt); }
}

const LIST = [
  { n: 1, name: 'CLASSIC DEVIL', role: 'red, ram horns, trident, goat legs', draw: (p, S) => satan(p, S, { horns: 'ram', weapon: 'trident', legs: 'goat', seed: 1 }) },
  { n: 2, name: 'THE ADVERSARY', role: 'black skin, wings, molten sword', draw: (p, S) => satan(p, S, { skin: '#3a2a34', skinLt: '#5c4652', skinDk: '#180e14', horns: 'long', weapon: 'sword', legs: 'goat', wings: true, seed: 2 }) },
  { n: 3, name: 'FEL LORD', role: 'fel-cracked hulk, bull horns, fel whip', draw: (p, S) => satan(p, S, { fire: 'fel', horns: 'bull', weapon: 'whip', legs: 'armor', crackChest: true, seed: 3 }) },
  { n: 4, name: 'SHADOW PRINCE', role: 'purple, crown horns, scythe, wings', draw: (p, S) => satan(p, S, { skin: H.demonP, skinLt: H.demonPLt, skinDk: H.demonPDk, horns: 'crown', weapon: 'scythe', legs: 'goat', wings: true, wingC: '#2a1030', seed: 4 }) },
  { n: 5, name: 'BRIMSTONE KING', role: 'lava-cracked, fire hands, fire crown', draw: (p, S) => satan(p, S, { skin: '#7a2a1e', skinLt: '#b04a2e', skinDk: '#3a1008', horns: 'long', weapon: 'firehands', legs: 'goat', crackChest: true, fireCrown: true, seed: 5 }) },
  { n: 6, name: 'THE GOAT', role: 'baphomet head, ram horns, trident', draw: (p, S) => satan(p, S, { goatHead: true, horns: 'ram', weapon: 'trident', legs: 'goat', skin: '#6a4a3a', skinLt: '#96705a', skinDk: '#322016', seed: 6 }) },
  { n: 7, name: 'IRON TYRANT', role: 'armored, crown horns, molten sword', draw: (p, S) => satan(p, S, { horns: 'crown', weapon: 'sword', legs: 'armor', skin: '#4a3444', skinLt: '#6e5266', skinDk: '#221420', cape: true, seed: 7 }) },
  { n: 8, name: 'HELLFIRE DJINN', role: 'flame column body, fire hands', draw: (p, S) => satan(p, S, { legs: 'flame', weapon: 'firehands', horns: 'long', fireCrown: true, seed: 8 }) },
  { n: 9, name: 'THE COLLECTOR', role: 'chained, soul lantern, gaoler hook', draw: (p, S) => satan(p, S, { chains: true, weapon: 'hook', horns: 'bull', legs: 'goat', skin: '#5a3a44', skinLt: '#86586a', skinDk: '#2a161e', seed: 9 }) },
  { n: 10, name: 'KING IN FLAME', role: 'fire cape + crown, GOLD trident, wings', draw: (p, S) => satan(p, S, { cape: true, fireCrown: true, wings: true, weapon: 'trident', goldWpn: true, horns: 'crown', legs: 'goat', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'satan_options.png', title: 'VICE VERSA — SATAN (hell boss) — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { satan, LIST };
