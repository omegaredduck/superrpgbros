// artdev/pirate/render_pirate_mobs.js — 20 numbered PIRATE SHIP mob
// candidates, hi-fi 160x160. REDONE per Red: LIVING pirates + sea creatures,
// NO ghosts — the ghost ship belongs to the BOSS (his summon event).
'use strict';
const KIT = require('./pirate_kit.js');
const { P, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, wisp, skull } = KIT;

// living-crew colors
const C = {
  skin: '#d8a070', skinLt: '#f0c898', skinDk: '#a87048',
  skin2: '#a8724e', skin2Dk: '#7a4e32',
  shirt: '#d8d2c0', shirtDk: '#a39a82',
  navy: '#2a4a6e', navyLt: '#4a7aa8', navyDk: '#182c44',
  vest: '#7a3a2e', vestDk: '#4e2018'
};

// pirate legs + boots helper
function legs(put, cx, cy, S, spread, c) {
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, cy, cx + s * S * spread, cy + S * 0.14, S * 0.028, () => (c || C.navyDk));
    ell(put, cx + s * S * (spread + 0.015), cy + S * 0.155, S * 0.032, S * 0.02, () => P.oil);
  });
}

// 1 · DECKHAND — scrawny swab w/ a mop; the cheap swarm.
function drawDeckhand(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  legs(put, cx, cy + S * 0.14, S, 0.07);
  // striped shirt
  dome(put, cx, cy + S * 0.03, S * 0.09, S * 0.12, C.shirt, '#ffffff', C.shirtDk);
  [0.0, 0.045, 0.09].forEach(o => row(put, Math.round(cy - S * 0.02 + o * S), cx - S * 0.08, cx + S * 0.08, () => C.navy));
  // head + red bandana
  dome(put, cx, cy - S * 0.13, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
  ell(put, cx, cy - S * 0.175, S * 0.07, S * 0.028, (tx, ty) => mix(P.red, P.redDk, ty));
  stroke(put, cx + S * 0.06, cy - S * 0.17, cx + S * 0.12, cy - S * 0.13, 2, () => P.redDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.13), P.oil));
  // worried mouth
  stroke(put, cx - S * 0.015, cy - S * 0.085, cx + S * 0.015, cy - S * 0.085, 1, () => C.skinDk);
  // mop held like a spear
  stroke(put, cx - S * 0.13, cy + S * 0.14, cx - S * 0.19, cy - S * 0.18, 2, () => P.woodDk);
  for (let k = -2; k <= 2; k++) stroke(put, cx - S * 0.19 + k, cy - S * 0.18, cx - S * 0.19 + k * 2, cy - S * 0.25, 1, () => C.shirtDk);
  // bucket at his feet
  for (let y = 0; y < S * 0.06; y++) row(put, Math.round(cy + S * 0.24 + y), cx + S * 0.1 - (S * 0.03 - y * 0.2), cx + S * 0.1 + (S * 0.03 - y * 0.2) + S * 0.02, (tx) => mix(P.wood, P.woodDkk, y / (S * 0.06)));
}

// 2 · CANNON CRAB — giant crab with a cannon-barrel shell; lobs cannonballs.
function drawCannonCrab(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => [[-0.06, 0.2], [0.04, 0.24], [0.14, 0.2]].forEach(([oy, len]) => {
    stroke(put, cx + s * S * 0.1, cy + oy * S * 0.5 + S * 0.06, cx + s * S * len, cy + oy * S * 0.5 + S * 0.14, 2, () => P.redDk);
  }));
  ell(put, cx, cy + S * 0.06, S * 0.13, S * 0.08, (tx, ty) => mix(P.redLt, P.redDk, clamp(ty * 1.2, 0, 1)));
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy + S * 0.04, cx + s * S * 0.22, cy - S * 0.0, S * 0.03, () => P.red);
    ell(put, cx + s * S * 0.25, cy - S * 0.02, S * 0.04, S * 0.03, (tx, ty) => mix(P.redLt, P.redDk, ty));
  });
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy + S * 0.02), P.oil));
  // cannon-barrel shell angled up
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const bx2 = lerp(cx + S * 0.08, cx - S * 0.12, t), by2 = lerp(cy + S * 0.0, cy - S * 0.22, t);
    ell(put, bx2, by2, S * (0.09 - t * 0.02), S * (0.07 - t * 0.015), (tx, ty) => mix(P.cannon, P.cannonDk, ty + Math.abs(tx - 0.5) * 0.4));
  }
  ell(put, cx - S * 0.13, cy - S * 0.235, S * 0.045, S * 0.035, () => P.oil);
  // cannonball arcing + lit fuse + target ring
  ell(put, cx - S * 0.24, cy - S * 0.36, S * 0.035, S * 0.035, (tx, ty) => mix(P.iron, P.cannonDk, ty));
  put(Math.round(cx + S * 0.04), Math.round(cy - S * 0.1), P.gold);
  ell(put, cx - S * 0.34, cy + S * 0.26, S * 0.07, S * 0.025, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.55 && d <= 1 ? P.redDk : null; });
}

// 3 · RIGGER — pirate swinging in on a rope; drops onto marked spots.
function drawRigger(put, S) {
  const cx = S * 0.5, cy = S * 0.44;
  for (let t = 0; t < 1; t += 0.06) put(Math.round(cx + Math.sin(t * 1.2 - 0.6) * S * 0.2), Math.round(S * 0.04 + t * S * 0.34), (t * 14 | 0) % 2 ? P.wood : P.woodDk);
  for (let a = -0.8; a < 0.9; a += 0.2) put(Math.round(cx + Math.sin(a) * S * 0.3), Math.round(S * 0.42 + (1 - Math.cos(a)) * S * 0.1), C.shirtDk);
  // swinging pirate, knife in teeth
  dome(put, cx + S * 0.08, cy + S * 0.06, S * 0.09, S * 0.11, C.navy, C.navyLt, C.navyDk);
  stroke(put, cx + S * 0.06, cy - S * 0.04, cx + S * 0.0, S * 0.36, S * 0.025, () => C.skin); // arm up the rope
  // kicking legs
  stroke(put, cx + S * 0.08, cy + S * 0.16, cx + S * 0.0, cy + S * 0.28, S * 0.028, () => C.navyDk);
  stroke(put, cx + S * 0.12, cy + S * 0.16, cx + S * 0.2, cy + S * 0.26, S * 0.028, () => C.navyDk);
  [(-0.005), 0.21].forEach(o => ell(put, cx + o * S, cy + S * 0.29 - (o > 0 ? S * 0.02 : 0), S * 0.03, S * 0.018, () => P.oil));
  // head + knife in teeth
  dome(put, cx + S * 0.08, cy - S * 0.06, S * 0.06, S * 0.06, C.skin, C.skinLt, C.skinDk);
  stroke(put, cx + S * 0.02, cy - S * 0.02, cx + S * 0.18, cy - S * 0.03, 2, () => P.moonLt); // blade
  ell(put, cx + S * 0.08, cy - S * 0.115, S * 0.055, S * 0.022, (tx, ty) => mix(C.navy, C.navyDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.08 + s * S * 0.025), Math.round(cy - S * 0.065), P.oil));
  // landing ring
  ell(put, cx - S * 0.12, S * 0.86, S * 0.09, S * 0.03, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? P.redDk : null; });
}

// 4 · CUTLASS CORSAIR — swashbuckler; slash-lunge melee.
function drawCorsair(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  stroke(put, cx - S * 0.02, cy + S * 0.12, cx - S * 0.14, cy + S * 0.28, S * 0.03, () => C.navyDk);
  stroke(put, cx + S * 0.04, cy + S * 0.12, cx + S * 0.12, cy + S * 0.26, S * 0.03, () => P.oil);
  // long coat + sash
  dome(put, cx, cy, S * 0.11, S * 0.14, C.vest, mix(C.vest, '#ffffff', 0.25), C.vestDk);
  stroke(put, cx - S * 0.08, cy - S * 0.06, cx + S * 0.08, cy + S * 0.1, S * 0.03, () => P.red);
  ell(put, cx, cy - S * 0.05, S * 0.03, S * 0.04, () => C.shirt); // shirt front
  // head + tricorn + eyepatch + gold tooth grin
  dome(put, cx, cy - S * 0.14, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
  for (let y = 0; y < S * 0.04; y++) row(put, Math.round(cy - S * 0.21 + y), cx - S * 0.08 + y * 0.5, cx + S * 0.08 - y * 0.5, () => (y < 2 ? P.woodDkk : P.oil));
  put(Math.round(cx - S * 0.028), Math.round(cy - S * 0.14), P.oil);
  stroke(put, cx - S * 0.05, cy - S * 0.17, cx - S * 0.005, cy - S * 0.17, 1, () => P.oil);
  put(Math.round(cx + S * 0.028), Math.round(cy - S * 0.145), P.oil);
  stroke(put, cx - S * 0.02, cy - S * 0.09, cx + S * 0.03, cy - S * 0.09, 1, () => C.skinDk);
  put(Math.round(cx + S * 0.01), Math.round(cy - S * 0.085), P.gold);
  put(Math.round(cx + S * 0.055), Math.round(cy - S * 0.1), P.gold); // earring
  // cutlass mid-slash + arc
  stroke(put, cx + S * 0.08, cy + S * 0.0, cx + S * 0.3, cy - S * 0.14, S * 0.022, () => P.moonLt);
  ell(put, cx + S * 0.08, cy + S * 0.015, S * 0.028, S * 0.02, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
  for (let a = -0.4; a < 0.9; a += 0.16) put(Math.round(cx + Math.cos(a - 0.5) * S * 0.32), Math.round(cy - Math.sin(a - 0.5) * S * 0.18), C.shirtDk);
}

// 5 · POWDER MONKEY — an actual monkey hauling a lit keg; kamikaze.
function drawPowderMonkey(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.18);
  // sprinting monkey
  dome(put, cx - S * 0.08, cy + S * 0.02, S * 0.075, S * 0.085, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  dome(put, cx - S * 0.1, cy - S * 0.09, S * 0.05, S * 0.05, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  ell(put, cx - S * 0.1, cy - S * 0.08, S * 0.03, S * 0.026, (tx, ty) => mix(C.skinLt, C.skin, ty)); // face patch
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.1 + s * S * 0.018), Math.round(cy - S * 0.09), P.oil));
  [-1, 1].forEach(s => ell(put, cx - S * 0.1 + s * S * 0.05, cy - S * 0.1, S * 0.016, S * 0.016, (tx, ty) => mix(C.skin2, C.skin2Dk, ty))); // ears
  // curling tail
  for (let a = 0; a < 3; a += 0.3) put(Math.round(cx - S * 0.16 + Math.cos(a + 1.5) * S * 0.05), Math.round(cy + S * 0.1 - a * 4), C.skin2Dk);
  // legs sprinting
  [[-0.14, 0.1, -0.22, 0.22], [-0.02, 0.1, 0.02, 0.2]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, S * 0.022, () => C.skin2Dk));
  // the keg — oversized, lit fuse
  for (let y = 0; y < S * 0.24; y++) {
    const t = y / (S * 0.24), w = S * (0.09 + Math.sin(t * Math.PI) * 0.022);
    row(put, Math.round(cy - S * 0.1 + y), cx + S * 0.12 - w, cx + S * 0.12 + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.4));
  }
  [0.0, 0.16].forEach(oy => row(put, Math.round(cy - S * 0.02 + oy * S), cx + S * 0.03, cx + S * 0.21, () => P.ironDk));
  skull(put, cx + S * 0.12, cy + S * 0.02, S * 0.025, P.oil);
  stroke(put, cx + S * 0.12, cy - S * 0.12, cx + S * 0.18, cy - S * 0.22, 2, () => P.woodDkk);
  // burning fuse spark
  ell(put, cx + S * 0.19, cy - S * 0.25, S * 0.02, S * 0.026, (tx, ty) => mix('#ffe08a', '#c2571a', ty));
  [[0.24, -0.3], [0.15, -0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.gold));
  stroke(put, cx - S * 0.04, cy - S * 0.0, cx + S * 0.05, cy - S * 0.05, S * 0.02, () => C.skin2); // hugging arm
}

// 6 · SALTY GULL — dive-bombing seabird; fast pecks.
function drawSaltyGull(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  ell(put, cx, cy, S * 0.09, S * 0.06, (tx, ty) => mix('#ffffff', C.shirtDk, ty));
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.06, cy - S * 0.02, cx + s * S * 0.3, cy - S * (s < 0 ? 0.14 : 0.04), S * 0.04, (t) => mix('#ffffff', '#8a94a6', t));
    stroke(put, cx + s * S * 0.26, cy - S * (s < 0 ? 0.12 : 0.03), cx + s * S * 0.36, cy - S * (s < 0 ? 0.1 : 0.0), S * 0.025, (t) => mix('#c8ced8', P.oil, t * 0.6));
  });
  dome(put, cx - S * 0.02, cy - S * 0.07, S * 0.045, S * 0.04, '#ffffff', '#ffffff', '#c8ced8');
  stroke(put, cx - S * 0.06, cy - S * 0.07, cx - S * 0.13, cy - S * 0.05, S * 0.02, () => P.brass);
  put(Math.round(cx - S * 0.12), Math.round(cy - S * 0.04), P.redDk); // beak spot
  put(Math.round(cx - S * 0.01), Math.round(cy - S * 0.08), P.oil);
  [-0.02, 0.02].forEach(o => stroke(put, cx + S * 0.08, cy + o * S + S * 0.02, cx + S * 0.16, cy + o * S + S * 0.06, 2, () => '#c8ced8'));
  [[-0.2, 0.2], [-0.1, 0.26], [0.0, 0.3]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S + S * 0.05, 1, () => C.shirtDk));
  // stolen cracker in a foot
  ell(put, cx + S * 0.04, cy + S * 0.07, S * 0.02, S * 0.014, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
}

// 7 · REEF BRUTE — barnacle-crusted sea troll; the tank.
function drawReefBrute(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.1, cy + S * 0.12, cx + s * S * 0.16, cy + S * 0.3, S * 0.05, () => P.barnDk); ell(put, cx + s * S * 0.17, cy + S * 0.32, S * 0.05, S * 0.025, () => P.oil); });
  dome(put, cx, cy - S * 0.0, S * 0.2, S * 0.18, P.barn, mix(P.barn, '#ffffff', 0.3), P.barnDk);
  // barnacles + coral horn
  [[-0.14, -0.1], [0.12, -0.12], [0.16, 0.06], [-0.16, 0.08], [0.0, 0.12]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.024, (tx, ty) => mix(P.sail, P.sailDkk, ty));
    put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.oil);
  });
  stroke(put, cx + S * 0.06, cy - S * 0.16, cx + S * 0.1, cy - S * 0.26, S * 0.03, (t) => mix(P.redLt, P.redDk, t)); // coral growth
  [[-0.06, -0.16], [0.08, -0.17]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.03, cy + oy * S + S * 0.16, 2, () => P.weedDk));
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.18, cy - S * 0.04, cx + s * S * 0.28, cy + S * 0.14, S * 0.045, () => P.barnDk); dome(put, cx + s * S * 0.29, cy + S * 0.18, S * 0.06, S * 0.05, P.barn, mix(P.barn, '#ffffff', 0.3), P.barnDk); });
  // angry living face
  ell(put, cx, cy - S * 0.1, S * 0.06, S * 0.05, (tx, ty) => mix(P.barn, P.barnDk, ty));
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.028, cy - S * 0.11, S * 0.016, P.redDk, P.red, P.redLt));
  stroke(put, cx - S * 0.025, cy - S * 0.065, cx + S * 0.025, cy - S * 0.06, 1, () => P.oil);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.015), Math.round(cy - S * 0.055), P.bone)); // tusks
}

// 8 · SIREN OF THE WAKE — her song PULLS you toward the rail.
function drawSiren(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  for (let a = 0; a < 5.5; a += 0.14) {
    const rr = S * 0.05 + a * S * 0.035;
    put(Math.round(cx - S * 0.26 + Math.cos(a + 1.2) * rr * 0.6), Math.round(cy + Math.sin(a + 1.2) * rr * 0.4), a > 4 ? P.moonLt : P.seaLt);
  }
  // scaled tail coiled on the rail
  stroke(put, cx + S * 0.02, cy + S * 0.16, cx + S * 0.2, cy + S * 0.28, S * 0.06, (t) => mix(P.seaLt, P.sea, t));
  [[0.28, 0.22], [0.31, 0.28]].forEach(([ox, oy]) => stroke(put, cx + S * 0.2, cy + S * 0.27, cx + ox * S + S * 0.05, cy + oy * S, 2, () => P.moon));
  for (let i = 0; i < 6; i++) put(Math.round(cx + S * 0.06 + i * S * 0.025), Math.round(cy + S * 0.19 + i * S * 0.015), P.moonLt); // scale glints
  // living torso + shell top
  dome(put, cx, cy + S * 0.02, S * 0.1, S * 0.14, C.skin, C.skinLt, C.skinDk);
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.04, cy - S * 0.02, S * 0.028, S * 0.022, (tx, ty) => mix(P.moonLt, P.moon, ty)));
  // head singing + long kelp-green hair
  dome(put, cx, cy - S * 0.13, S * 0.07, S * 0.07, C.skin, C.skinLt, C.skinDk);
  dome(put, cx + S * 0.02, cy - S * 0.18, S * 0.075, S * 0.045, P.weed, mix(P.weed, '#ffffff', 0.3), P.weedDk);
  for (let i = 0; i < 4; i++) stroke(put, cx + S * 0.06, cy - S * 0.16 + i * 2, cx + S * 0.14 + i * S * 0.01, cy + S * 0.02 + i * S * 0.03, S * 0.022, (t) => mix(P.weed, P.weedDk, t));
  ell(put, cx - S * 0.03, cy - S * 0.1, S * 0.02, S * 0.026, () => P.oil);
  put(Math.round(cx + S * 0.01), Math.round(cy - S * 0.15), P.oil);
  [[-0.3, -0.14], [-0.36, -0.02], [-0.28, 0.08]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, 1, () => P.moonLt);
    ell(put, cx + ox * S - S * 0.012, cy + oy * S, S * 0.014, S * 0.011, () => P.moonLt);
  });
}

// 9 · SWIVEL GUNNER — mans a rail gun; fires telegraphed deck lanes.
function drawSwivelGunner(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.24);
  for (let x = 0; x < S * 0.26; x += 6) row(put, Math.round(cy - S * 0.06), cx - S * 0.44 + x, cx - S * 0.41 + x, () => P.redDk);
  // swivel post + rail chunk
  plate(put, cx - S * 0.02, cy + S * 0.08, cx + S * 0.1, cy + S * 0.16, P.wood, P.woodLt, P.woodDkk);
  stroke(put, cx + S * 0.04, cy - S * 0.02, cx + S * 0.04, cy + S * 0.08, S * 0.025, () => P.ironDk);
  // gun barrel
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const bx2 = lerp(cx + S * 0.08, cx - S * 0.24, t), by2 = lerp(cy - S * 0.02, cy - S * 0.075, t);
    ell(put, bx2, by2, S * (0.045 + (t > 0.88 ? 0.01 : 0)), S * (0.04 + (t > 0.88 ? 0.008 : 0)), (tx, ty) => mix(P.cannon, P.cannonDk, ty));
  }
  ell(put, cx - S * 0.25, cy - S * 0.08, S * 0.025, S * 0.03, () => P.oil);
  // the gunner behind it — bracing
  dome(put, cx + S * 0.16, cy - S * 0.0, S * 0.09, S * 0.11, C.navy, C.navyLt, C.navyDk);
  legs(put, cx + S * 0.16, cy + S * 0.1, S, 0.06);
  dome(put, cx + S * 0.16, cy - S * 0.12, S * 0.06, S * 0.06, C.skin, C.skinLt, C.skinDk);
  ell(put, cx + S * 0.16, cy - S * 0.16, S * 0.065, S * 0.025, (tx, ty) => mix(P.red, P.redDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.16 + s * S * 0.025), Math.round(cy - S * 0.125), P.oil));
  stroke(put, cx + S * 0.1, cy - S * 0.04, cx + S * 0.05, cy - S * 0.02, S * 0.022, () => C.skin); // hands on the gun
  // linstock w/ burning match
  stroke(put, cx + S * 0.24, cy - S * 0.06, cx + S * 0.3, cy - S * 0.16, 2, () => P.woodDk);
  ell(put, cx + S * 0.305, cy - S * 0.18, S * 0.016, S * 0.02, (tx, ty) => mix('#ffe08a', '#c2571a', ty));
}

// 10 · KRAKEN ARM — a living tentacle bursts through the deck.
function drawKrakenArm(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  ell(put, cx, cy + S * 0.2, S * 0.18, S * 0.06, () => P.oil);
  for (let a = 0; a < 6.28; a += 0.5) stroke(put, cx + Math.cos(a) * S * 0.16, cy + S * 0.2 + Math.sin(a) * S * 0.05, cx + Math.cos(a) * S * 0.24, cy + S * 0.2 + Math.sin(a) * S * 0.08, 2, () => P.woodDk);
  let px = cx, py = cy + S * 0.18, ang = -1.5;
  for (let seg = 0; seg < 8; seg++) {
    const w = S * (0.085 - seg * 0.008);
    const nx = px + Math.cos(ang) * S * 0.08, ny = py + Math.sin(ang) * S * 0.075;
    stroke(put, px, py, nx, ny, w, (t) => mix('#7e3a5c', '#4a1f38', t * 0.4 + seg * 0.06));
    if (seg > 1) put(Math.round(px + Math.cos(ang + 1.57) * w * 0.5), Math.round(py + Math.sin(ang + 1.57) * w * 0.5), P.sailDk);
    px = nx; py = ny; ang += 0.42;
  }
  ell(put, px, py, S * 0.03, S * 0.026, (tx, ty) => mix('#b06a8e', '#7e3a5c', ty));
  [[0.02, -0.02], [0.08, -0.1], [0.1, -0.2]].forEach(([ox, oy]) => { ell(put, cx + ox * S + S * 0.02, cy + oy * S, S * 0.02, S * 0.016, (tx, ty) => mix(P.sail, P.sailDkk, ty)); put(Math.round(cx + ox * S + S * 0.02), Math.round(cy + oy * S), '#4a1f38'); });
  ell(put, cx, cy + S * 0.2, S * 0.24, S * 0.08, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.75 && d <= 1 ? P.redDk : null; });
  [[-0.16, 0.12], [0.18, 0.14]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.moonLt));
}

// 11 · MAKO LEAPER — a real shark that LEAPS across the deck in an arc.
function drawMakoLeaper(put, S) {
  const cx = S * 0.5, cy = S * 0.44;
  // leap arc + splash origin
  for (let t = 0.05; t < 0.95; t += 0.09) put(Math.round(cx - S * 0.36 + t * S * 0.72), Math.round(cy + S * 0.3 - Math.sin(t * Math.PI) * S * 0.26), P.seaLt);
  [[-0.38, 0.3], [-0.34, 0.34]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.moonLt));
  // shark mid-air, arched
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const bx2 = cx - S * 0.2 + t * S * 0.42;
    const by2 = cy - Math.sin(t * Math.PI) * S * 0.06 + t * S * 0.04;
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.045);
    ell(put, bx2, by2, w, w * 0.8, (tx, ty) => {
      let b = mix('#7a92aa', '#46586e', clamp(ty * 1.3, 0, 1));
      if (ty > 0.62) b = mix(b, '#e8eef4', 0.7); // white belly
      return b;
    });
  }
  // dorsal fin + tail
  stroke(put, cx - S * 0.02, cy - S * 0.08, cx + S * 0.02, cy - S * 0.17, S * 0.035, (t) => mix('#5c7288', '#46586e', t));
  stroke(put, cx + S * 0.2, cy + S * 0.02, cx + S * 0.28, cy - S * 0.1, S * 0.03, () => '#5c7288');
  stroke(put, cx + S * 0.2, cy + S * 0.02, cx + S * 0.28, cy + S * 0.1, S * 0.026, () => '#46586e');
  // head: jaws open mid-lunge
  stroke(put, cx - S * 0.2, cy - S * 0.015, cx - S * 0.3, cy - S * 0.05, S * 0.04, () => '#5c7288');
  stroke(put, cx - S * 0.19, cy + S * 0.03, cx - S * 0.28, cy + S * 0.06, S * 0.035, () => '#e8eef4');
  for (let t = 0; t < 1; t += 0.2) { put(Math.round(cx - S * 0.21 - t * S * 0.07), Math.round(cy - S * 0.03 + t * S * 0.008), '#ffffff'); put(Math.round(cx - S * 0.2 - t * S * 0.06), Math.round(cy + S * 0.035), '#ffffff'); }
  put(Math.round(cx - S * 0.17), Math.round(cy - S * 0.05), P.oil);
  // landing ring
  ell(put, cx + S * 0.3, cy + S * 0.36, S * 0.1, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? P.redDk : null; });
}

// 12 · DRUNKEN SWAB — staggering rum-soaked pirate; erratic wobble melee.
function drawDrunkenSwab(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // wobble trail
  for (let t = 0; t < 1; t += 0.2) put(Math.round(cx - S * 0.24 + t * S * 0.16), Math.round(cy + S * 0.28 + Math.sin(t * 9) * 3), P.deckDk);
  // tilted body
  legs(put, cx + S * 0.02, cy + S * 0.13, S, 0.09, P.woodDkk);
  for (let y = 0; y < S * 0.16; y++) {
    const t = y / (S * 0.16), tilt = Math.sin(t * 2) * S * 0.03;
    row(put, Math.round(cy - S * 0.02 + y), cx - S * 0.09 + tilt + S * 0.02, cx + S * 0.09 + tilt + S * 0.02, (tx) => {
      let b = mix(C.shirt, C.shirtDk, t);
      if (Math.floor(t * 5) % 2 === 0) b = mix(b, P.red, 0.4);
      return b;
    });
  }
  // lolling head, red nose, stubble
  dome(put, cx + S * 0.06, cy - S * 0.11, S * 0.065, S * 0.062, C.skin, C.skinLt, C.skinDk);
  put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.1), P.redLt); // nose
  [-1, 1].forEach(s => stroke(put, cx + S * 0.06 + s * S * 0.028, cy - S * 0.12, cx + S * 0.06 + s * S * 0.012, cy - S * 0.115, 1, () => P.oil)); // squint
  for (let i = 0; i < 5; i++) put(Math.round(cx + S * 0.03 + (i * 17 % 10)), Math.round(cy - S * 0.065 + (i * 7 % 4)), C.skinDk);
  ell(put, cx + S * 0.06, cy - S * 0.165, S * 0.05, S * 0.02, (tx, ty) => mix(C.navy, C.navyDk, ty)); // sagging cap
  // rum bottle raised + slosh
  stroke(put, cx + S * 0.12, cy + S * 0.0, cx + S * 0.2, cy - S * 0.1, S * 0.024, () => C.skin);
  for (let y = 0; y < S * 0.09; y++) {
    const t = y / (S * 0.09), w = S * (0.016 + Math.sin(Math.min(1, t * 1.4) * Math.PI) * 0.016);
    row(put, Math.round(cy - S * 0.22 + y), cx + S * 0.21 - w, cx + S * 0.21 + w, (tx) => mix('#3a6e4a', '#1c4028', t + Math.abs(tx - 0.5)));
  }
  put(Math.round(cx + S * 0.21), Math.round(cy - S * 0.24), P.sailDk); // cork
  // broken bottle in the other hand (the weapon)
  stroke(put, cx - S * 0.06, cy + S * 0.02, cx - S * 0.15, cy + S * 0.08, S * 0.024, () => C.skin);
  for (let k = -1; k <= 1; k++) stroke(put, cx - S * 0.17, cy + S * 0.09, cx - S * 0.2 + k * S * 0.015, cy + S * 0.13, 1, () => '#7ac2a0');
  // stink lines
  [[0.16, -0.28], [0.2, -0.24]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S - S * 0.03, 1, () => P.weedDk));
}

// 13 · NET CASTER — throws weighted nets; ROOTS you briefly.
function drawNetCaster(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  legs(put, cx, cy + S * 0.13, S, 0.07, P.woodDkk);
  // bare-chested fisher w/ sash
  dome(put, cx, cy + S * 0.0, S * 0.1, S * 0.13, C.skin2, mix(C.skin2, '#ffffff', 0.25), C.skin2Dk);
  stroke(put, cx - S * 0.07, cy - S * 0.06, cx + S * 0.07, cy + S * 0.08, S * 0.028, () => C.navy);
  // bald head + big beard
  dome(put, cx, cy - S * 0.13, S * 0.06, S * 0.06, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  dome(put, cx, cy - S * 0.075, S * 0.05, S * 0.035, '#4a3828', '#6e563a', '#2c2014');
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.024), Math.round(cy - S * 0.135), P.oil));
  put(Math.round(cx + S * 0.05), Math.round(cy - S * 0.1), P.gold);
  // the NET mid-flight — expanding mesh w/ weights
  const nx = cx + S * 0.22, ny = cy - S * 0.12;
  for (let a = 0; a < 6.28; a += 0.785) {
    stroke(put, nx, ny, nx + Math.cos(a) * S * 0.13, ny + Math.sin(a) * S * 0.1, 1, () => P.wood);
    put(Math.round(nx + Math.cos(a) * S * 0.135), Math.round(ny + Math.sin(a) * S * 0.105), P.ironDk); // weights
  }
  [S * 0.05, S * 0.09].forEach(rr => { for (let a = 0; a < 6.28; a += 0.5) put(Math.round(nx + Math.cos(a) * rr), Math.round(ny + Math.sin(a) * rr * 0.8), P.woodDk); });
  // throwing arm follow-through
  stroke(put, cx + S * 0.08, cy - S * 0.04, cx + S * 0.16, cy - S * 0.1, S * 0.026, () => C.skin2);
  // spare net on the shoulder
  for (let t = 0; t < 1; t += 0.14) put(Math.round(cx - S * 0.08 + t * S * 0.05), Math.round(cy - S * 0.06 + t * S * 0.12), P.woodDk);
}

// 14 · SHANTY SINGER — concertina man; his tune HASTENS the crew.
function drawShantySinger(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  legs(put, cx, cy + S * 0.14, S, 0.07);
  dome(put, cx, cy + S * 0.04, S * 0.12, S * 0.12, C.navy, C.navyLt, C.navyDk);
  // concertina bellows
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.1, cy + S * 0.0, cx + s * S * 0.2, cy + S * 0.04, S * 0.03, () => C.skin);
    plate(put, cx + s * S * 0.2 - S * 0.025, cy - S * 0.0, cx + s * S * 0.2 + S * 0.025, cy + S * 0.1, P.red, P.redLt, P.redDk);
  });
  for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.024, cy + S * 0.015, cx + i * S * 0.024, cy + S * 0.085, 1, () => (i % 2 ? P.brassDk : P.brassLt));
  // jolly bearded head singing
  dome(put, cx, cy - S * 0.12, S * 0.07, S * 0.07, C.skin, C.skinLt, C.skinDk);
  dome(put, cx, cy - S * 0.06, S * 0.055, S * 0.04, '#b8b2a0', '#d8d2c0', '#8a8472'); // grey beard
  ell(put, cx, cy - S * 0.085, S * 0.022, S * 0.028, () => P.oil);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, cy - S * 0.15, cx + s * S * 0.015, cy - S * 0.145, 1, () => C.skinDk));
  ell(put, cx, cy - S * 0.175, S * 0.065, S * 0.03, (tx, ty) => mix(C.navy, C.navyDk, tx));
  put(Math.round(cx), Math.round(cy - S * 0.2), P.moonLt); // pom
  // haste notes
  [[-0.28, -0.2], [0.28, -0.22], [-0.32, 0.02], [0.32, 0.0], [0.0, -0.3]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.045, 1, () => P.gold);
    ell(put, cx + ox * S - S * 0.012, cy + oy * S, S * 0.013, S * 0.01, () => P.gold);
  });
}

// 15 · HARPOONER — spears a telegraphed line; PINS you briefly.
function drawHarpooner(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  for (let x = 0; x < S * 0.3; x += 6) row(put, Math.round(cy - S * 0.06), cx + S * 0.14 + x, cx + S * 0.17 + x, () => P.redDk);
  legs(put, cx, cy + S * 0.14, S, 0.08, P.woodDkk);
  // oilskin coat
  dome(put, cx, cy + S * 0.02, S * 0.12, S * 0.14, '#c2a038', '#e8cd6a', '#8a6e1e');
  for (let y = 0; y < S * 0.1; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * (0.1 + y / S * 0.15), cx + S * (0.1 + y / S * 0.15), (tx) => mix('#c2a038', '#8a6e1e', Math.abs(tx - 0.5)));
  // sou'wester hat
  dome(put, cx, cy - S * 0.13, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
  ell(put, cx, cy - S * 0.17, S * 0.085, S * 0.032, (tx, ty) => mix('#c2a038', '#8a6e1e', ty));
  dome(put, cx, cy - S * 0.2, S * 0.05, S * 0.03, '#e8cd6a', '#ffe89a', '#8a6e1e');
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.135), P.oil));
  dome(put, cx, cy - S * 0.08, S * 0.04, S * 0.025, '#6e563a', '#8a6e48', '#4a3828'); // beard
  // harpoon drawn back
  stroke(put, cx - S * 0.16, cy + S * 0.1, cx + S * 0.26, cy - S * 0.08, S * 0.018, () => P.woodDk);
  stroke(put, cx + S * 0.26, cy - S * 0.08, cx + S * 0.34, cy - S * 0.115, S * 0.02, () => P.moonLt);
  [[0.3, -0.085], [0.31, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S - S * 0.03, cy + oy * S + S * 0.02, 1, () => P.moon));
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx - S * 0.12 + Math.cos(a) * S * 0.035), Math.round(cy + S * 0.12 + Math.sin(a) * S * 0.025), P.wood);
  stroke(put, cx - S * 0.1, cy + S * 0.1, cx + S * 0.02, cy + S * 0.02, 1, () => P.woodLt);
}

// 16 · INKPOT OCTO — octopus in a stew pot; sprays slick ink patches.
function drawInkpotOcto(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.22);
  // iron pot
  for (let y = 0; y < S * 0.18; y++) {
    const t = y / (S * 0.18), w = S * (0.14 + Math.sin(t * Math.PI * 0.5) * 0.02);
    row(put, Math.round(cy + S * 0.02 + y), cx - w, cx + w, (tx) => mix(P.iron, P.cannonDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
  }
  ell(put, cx, cy + S * 0.02, S * 0.15, S * 0.045, (tx, ty) => mix(P.cannonDk, P.oil, ty));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.15, cy + S * 0.06, cx + s * S * 0.2, cy + S * 0.1, S * 0.02, () => P.ironDk)); // handles
  // octopus head rising out
  dome(put, cx, cy - S * 0.1, S * 0.11, S * 0.11, '#b06a8e', '#d89ab8', '#7e3a5c');
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.05, cy - S * 0.12, S * 0.025, S * 0.03, () => '#ffffff'); put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.115), P.oil); });
  // tentacles slopping over the rim
  [[-0.14, 1], [0.14, 1], [-0.06, 1], [0.08, 1]].forEach(([o], i) => {
    let px = cx + o * S, py = cy + S * 0.0, ang = 1.2 + (i % 2) * 0.6;
    for (let seg = 0; seg < 4; seg++) {
      const nx2 = px + Math.cos(ang) * S * 0.05 * (o < 0 ? -1 : 1), ny2 = py + Math.sin(ang) * S * 0.05;
      stroke(put, px, py, nx2, ny2, S * (0.028 - seg * 0.005), (t) => mix('#b06a8e', '#7e3a5c', t));
      px = nx2; py = ny2; ang += 0.5;
    }
  });
  // ink spray + slick patch
  [[-0.24, -0.18], [-0.3, -0.12], [-0.27, -0.06]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.014, () => P.oil));
  ell(put, cx - S * 0.34, cy + S * 0.26, S * 0.08, S * 0.025, (tx, ty) => mix('#1c1e2c', P.oil, ty));
  put(Math.round(cx - S * 0.36), Math.round(cy + S * 0.25), P.moonDk ? P.moon : '#9fc4e8'); // slick shine
}

// 17 · MUSKETEER MATE — twin flintlocks; aimed paired shots.
function drawMusketeerMate(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  legs(put, cx, cy + S * 0.13, S, 0.08, P.oil);
  // vest + bandolier
  dome(put, cx, cy + S * 0.0, S * 0.1, S * 0.13, C.vest, mix(C.vest, '#ffffff', 0.25), C.vestDk);
  stroke(put, cx - S * 0.08, cy - S * 0.06, cx + S * 0.08, cy + S * 0.1, S * 0.02, () => P.woodDkk);
  [0.0, 0.25, 0.5, 0.75].forEach(t => put(Math.round(lerp(cx - S * 0.07, cx + S * 0.07, t)), Math.round(lerp(cy - S * 0.05, cy + S * 0.09, t)), P.brass));
  // head + headscarf + gold tooth
  dome(put, cx, cy - S * 0.13, S * 0.06, S * 0.06, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  ell(put, cx, cy - S * 0.17, S * 0.065, S * 0.028, (tx, ty) => mix(C.navy, C.navyDk, ty));
  stroke(put, cx + S * 0.055, cy - S * 0.165, cx + S * 0.1, cy - S * 0.12, 2, () => C.navyDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.026), Math.round(cy - S * 0.13), P.oil));
  stroke(put, cx - S * 0.018, cy - S * 0.085, cx + S * 0.02, cy - S * 0.085, 1, () => C.skin2Dk);
  put(Math.round(cx - S * 0.005), Math.round(cy - S * 0.08), P.gold);
  // twin flintlocks aimed both ways + muzzle sparks
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.09, cy - S * 0.02, cx + s * S * 0.2, cy - S * 0.04, S * 0.024, () => C.skin2);
    plate(put, cx + s * S * 0.2 - S * 0.01, cy - S * 0.065, cx + s * S * 0.2 + S * 0.05 * s, cy - S * 0.035, P.cannon, P.iron, P.cannonDk);
    stroke(put, cx + s * S * 0.2, cy - S * 0.035, cx + s * S * 0.19, cy + S * 0.0, S * 0.016, () => P.wood);
    put(Math.round(cx + s * S * 0.26), Math.round(cy - S * 0.05), P.gold);
  });
}

// 18 · LOOT MONKEY — flees with stolen loot; drops it all when caught.
function drawLootMonkey(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // coin trail behind
  [[-0.3, 0.24], [-0.22, 0.28], [-0.12, 0.26]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.013, (tx, ty) => mix(P.goldLt, P.goldDk, ty)));
  // sprinting monkey w/ a little vest
  dome(put, cx, cy + S * 0.04, S * 0.08, S * 0.09, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  plate(put, cx - S * 0.05, cy - S * 0.0, cx + S * 0.05, cy + S * 0.06, P.red, P.redLt, P.redDk);
  dome(put, cx - S * 0.02, cy - S * 0.08, S * 0.05, S * 0.05, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  ell(put, cx - S * 0.02, cy - S * 0.07, S * 0.03, S * 0.026, (tx, ty) => mix(C.skinLt, C.skin, ty));
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.02 + s * S * 0.018), Math.round(cy - S * 0.08), P.oil));
  [-1, 1].forEach(s => ell(put, cx - S * 0.02 + s * S * 0.05, cy - S * 0.09, S * 0.016, S * 0.016, (tx, ty) => mix(C.skin2, C.skin2Dk, ty)));
  // legs sprinting + curl tail
  [[-0.06, 0.12, -0.14, 0.24], [0.04, 0.12, 0.1, 0.22]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, S * 0.02, () => C.skin2Dk));
  for (let a = 0; a < 3; a += 0.3) put(Math.round(cx - S * 0.1 + Math.cos(a + 1.5) * S * 0.05), Math.round(cy + S * 0.08 - a * 4), C.skin2Dk);
  // ARMFULS of loot: goblet + pearls + crown over the shoulder
  ell(put, cx + S * 0.1, cy - S * 0.04, S * 0.045, S * 0.03, (tx, ty) => mix(P.goldLt, P.goldDk, ty)); // crown
  [[0.08, -0.07], [0.12, -0.07], [0.1, -0.09]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.02, 2, () => P.gold));
  stroke(put, cx + S * 0.06, cy + S * 0.04, cx + S * 0.16, cy + S * 0.1, 1, () => '#ffffff'); // pearl string
  [0.2, 0.5, 0.8].forEach(t => put(Math.round(lerp(cx + S * 0.06, cx + S * 0.16, t)), Math.round(lerp(cy + S * 0.04, cy + S * 0.1, t) - 1), '#ffffff'));
  stroke(put, cx + S * 0.02, cy + S * 0.0, cx + S * 0.08, cy - S * 0.03, S * 0.02, () => C.skin2); // clutching arm
  // sweat drops (panicking)
  [[0.06, -0.14], [-0.1, -0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), '#9fc4e8'));
}

// 19 · HOOKED BOSUN — elite; hook-chain YANKS you to him.
function drawHookedBosun(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // heavy coat
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.09 + t * 0.06);
    row(put, Math.round(cy - S * 0.04 + y), cx - w, cx + w, (tx) => {
      let b = mix(P.woodDk, P.woodDkk, t);
      if (tx > 0.44 && tx < 0.56 && t < 0.5) b = C.shirtDk;
      return b;
    });
  }
  stroke(put, cx - S * 0.1, cy - S * 0.06, cx + S * 0.1, cy + S * 0.02, S * 0.016, (t) => ((t * 12 | 0) % 2 ? P.iron : P.ironDk));
  // scarred living head + wide-brim hat
  dome(put, cx, cy - S * 0.14, S * 0.07, S * 0.07, C.skin, C.skinLt, C.skinDk);
  stroke(put, cx - S * 0.02, cy - S * 0.19, cx + S * 0.03, cy - S * 0.1, 1, () => C.skinDk);
  ell(put, cx, cy - S * 0.19, S * 0.1, S * 0.03, (tx, ty) => mix(P.woodDkk, P.oil, ty));
  dome(put, cx, cy - S * 0.22, S * 0.06, S * 0.03, P.woodDk, P.wood, P.woodDkk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.145), P.oil));
  stroke(put, cx - S * 0.02, cy - S * 0.095, cx + S * 0.025, cy - S * 0.095, 1, () => C.skinDk);
  // hook-chain flying out
  stroke(put, cx + S * 0.1, cy + S * 0.0, cx + S * 0.32, cy - S * 0.1, S * 0.014, (t) => ((t * 16 | 0) % 2 ? P.iron : P.ironDk));
  for (let a = 0; a < 3.6; a += 0.3) put(Math.round(cx + S * 0.34 + Math.cos(a + 2) * S * 0.035), Math.round(cy - S * 0.12 + Math.sin(a + 2) * S * 0.035), P.moonLt);
  put(Math.round(cx + S * 0.37), Math.round(cy - S * 0.09), '#ffffff');
  // cleaver in the off hand
  stroke(put, cx - S * 0.1, cy + S * 0.02, cx - S * 0.18, cy + S * 0.1, S * 0.025, () => P.woodDk);
  plate(put, cx - S * 0.26, cy + S * 0.06, cx - S * 0.17, cy + S * 0.14, P.moon, P.moonLt, P.iron);
}

// 20 · ANCHOR HULK — colossal strongman swinging the ship's anchor.
function drawAnchorHulk(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  for (let a = -0.6; a < 0.9; a += 0.14) put(Math.round(cx - Math.cos(a) * S * 0.36), Math.round(cy + S * 0.1 - Math.sin(a) * S * 0.2), P.redDk);
  // tree-trunk legs + striped trousers
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.1, cy + S * 0.12, cx + s * S * 0.16, cy + S * 0.3, S * 0.05, () => C.navyDk);
    ell(put, cx + s * S * 0.17, cy + S * 0.32, S * 0.05, S * 0.025, () => P.oil);
  });
  // massive bare torso + anchor tattoo
  dome(put, cx, cy - S * 0.0, S * 0.18, S * 0.17, C.skin2, mix(C.skin2, '#ffffff', 0.25), C.skin2Dk);
  stroke(put, cx - S * 0.06, cy - S * 0.04, cx - S * 0.06, cy + S * 0.04, 1, () => C.navyDk); // tattoo shank
  stroke(put, cx - S * 0.085, cy + S * 0.02, cx - S * 0.035, cy + S * 0.02, 1, () => C.navyDk);
  // small head + big jaw + wool cap
  dome(put, cx, cy - S * 0.2, S * 0.06, S * 0.055, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
  ell(put, cx, cy - S * 0.245, S * 0.055, S * 0.024, (tx, ty) => mix(P.red, P.redDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.024), Math.round(cy - S * 0.205), P.oil));
  stroke(put, cx - S * 0.02, cy - S * 0.165, cx + S * 0.02, cy - S * 0.165, 2, () => C.skin2Dk);
  // one arm hoisting THE ANCHOR overhead
  stroke(put, cx + S * 0.14, cy - S * 0.06, cx + S * 0.26, cy - S * 0.24, S * 0.05, () => C.skin2);
  stroke(put, cx + S * 0.28, cy - S * 0.44, cx + S * 0.28, cy - S * 0.2, S * 0.028, () => P.iron);
  dome(put, cx + S * 0.28, cy - S * 0.46, S * 0.03, S * 0.024, P.iron, P.moon, P.ironDk);
  for (let a = 0.4; a < 2.8; a += 0.2) put(Math.round(cx + S * 0.28 + Math.cos(a) * S * 0.07), Math.round(cy - S * 0.18 + Math.sin(a) * S * 0.05 - S * 0.02), P.iron);
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.28 + s * S * 0.07), Math.round(cy - S * 0.21), P.moon));
  // chain wrapped around the other fist
  stroke(put, cx - S * 0.16, cy - S * 0.02, cx - S * 0.26, cy + S * 0.12, S * 0.045, () => C.skin2);
  for (let a = 0; a < 6.28; a += 0.7) put(Math.round(cx - S * 0.27 + Math.cos(a) * S * 0.04), Math.round(cy + S * 0.14 + Math.sin(a) * S * 0.03), (a * 3 | 0) % 2 ? P.iron : P.ironDk);
}

// ========================================================================
const LIST = [
  { n: 1, name: 'DECKHAND', role: 'swarm filler', draw: drawDeckhand },
  { n: 2, name: 'CANNON CRAB', role: 'lobs cannonballs', draw: drawCannonCrab },
  { n: 3, name: 'RIGGER', role: 'swing + drop ambush', draw: drawRigger },
  { n: 4, name: 'CUTLASS CORSAIR', role: 'slash-lunge melee', draw: drawCorsair },
  { n: 5, name: 'POWDER MONKEY', role: 'keg kamikaze', draw: drawPowderMonkey },
  { n: 6, name: 'SALTY GULL', role: 'fast dive pecks', draw: drawSaltyGull },
  { n: 7, name: 'REEF BRUTE', role: 'tank', draw: drawReefBrute },
  { n: 8, name: 'SIREN OF THE WAKE', role: 'pull song', draw: drawSiren },
  { n: 9, name: 'SWIVEL GUNNER', role: 'deck-lane shots', draw: drawSwivelGunner },
  { n: 10, name: 'KRAKEN ARM', role: 'deck-burst ambush', draw: drawKrakenArm },
  { n: 11, name: 'MAKO LEAPER', role: 'arcing shark leap', draw: drawMakoLeaper },
  { n: 12, name: 'DRUNKEN SWAB', role: 'erratic wobbler', draw: drawDrunkenSwab },
  { n: 13, name: 'NET CASTER', role: 'net ROOTS you', draw: drawNetCaster },
  { n: 14, name: 'SHANTY SINGER', role: 'HASTENS crew', draw: drawShantySinger },
  { n: 15, name: 'HARPOONER', role: 'pin-line shot', draw: drawHarpooner },
  { n: 16, name: 'INKPOT OCTO', role: 'ink slick patches', draw: drawInkpotOcto },
  { n: 17, name: 'MUSKETEER MATE', role: 'twin aimed shots', draw: drawMusketeerMate },
  { n: 18, name: 'LOOT MONKEY', role: 'flees; drops loot', draw: drawLootMonkey },
  { n: 19, name: 'HOOKED BOSUN', role: 'hook YANKS you in', draw: drawHookedBosun },
  { n: 20, name: 'ANCHOR HULK', role: 'anchor arc elite', draw: drawAnchorHulk },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'pirate_mob_options.png',
  title: 'PIRATE SHIP — LIVING CREW CANDIDATES (pick 8; ghosts belong to the BOSS)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
