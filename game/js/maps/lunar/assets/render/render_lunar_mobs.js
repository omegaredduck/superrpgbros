// artdev/lunar/render_lunar_mobs.js — 20 numbered LUNAR STATION mob
// candidates, hi-fi 160x160, one PNG grid for Red to pick 8 from.
'use strict';
const KIT = require('./space_kit.js');
const { L, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, visor, hover, chitin, star } = KIT;

// 1 · SCUTTLER — palm-sized xeno crab; the cheap swarm.
function drawScuttler(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.16);
  // eight spindly legs
  [-1, 1].forEach(s => [[-0.1, 0.2], [0.0, 0.24], [0.1, 0.22], [0.18, 0.16]].forEach(([oy, len], i) => {
    stroke(put, cx + s * S * 0.08, cy + oy * S * 0.4, cx + s * S * len, cy + oy * S * 0.4 - S * 0.06, 2, () => L.xenoDk);
    stroke(put, cx + s * S * len, cy + oy * S * 0.4 - S * 0.06, cx + s * S * (len + 0.05), cy + oy * S * 0.4 + S * 0.06, 2, () => L.xenoDkk);
  }));
  // domed body
  chitin(put, cx, cy, S * 0.13, S * 0.1, L.xeno, L.xenoLt, L.xenoDkk);
  // tail curl
  stroke(put, cx + S * 0.1, cy + S * 0.04, cx + S * 0.2, cy + S * 0.12, S * 0.025, (t) => mix(L.xeno, L.xenoDkk, t));
  // eye cluster
  [[-0.05, -0.03], [0.0, -0.05], [0.05, -0.03]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.red));
}

// 2 · DRIFT SPORE — floating alien puffball; pops into a gas cloud.
function drawDriftSpore(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  hover(put, cx, S * 0.8, S * 0.1);
  // spherical spore body w/ pores
  chitin(put, cx, cy, S * 0.16, S * 0.16, L.void, L.voidLt, L.voidDk);
  let seed = 4; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 8; i++) {
    const a = rnd() * 6.28, r = rnd() * S * 0.1 + S * 0.03;
    ell(put, cx + Math.cos(a) * r, cy + Math.sin(a) * r, S * 0.018, S * 0.018, (tx, ty) => mix(L.acid, L.acidDk, ty));
  }
  // drifting tendrils below
  [-0.08, 0, 0.08].forEach((o, i) => stroke(put, cx + o * S, cy + S * 0.14, cx + o * S + (i - 1) * S * 0.04, cy + S * 0.28, 1, (t) => mix(L.voidLt, L.voidDk, t)));
  // gas wisps already leaking
  [[0.2, -0.1], [-0.22, 0.02]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.02, (tx, ty) => mix(L.acid, L.xenoDkk, ty + 0.4)));
}

// 3 · VOID HOUND — leaping predator; low-grav pounce arcs.
function drawVoidHound(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  // sleek eyeless body
  ell(put, cx + S * 0.02, cy, S * 0.2, S * 0.1, (tx, ty) => mix('#3a3d5c', '#16182c', clamp(ty * 1.2, 0, 1)));
  // elongated smooth head, no eyes, inner-jaw hint
  stroke(put, cx - S * 0.14, cy - S * 0.04, cx - S * 0.26, cy - S * 0.1, S * 0.055, () => '#2c2e48');
  dome(put, cx - S * 0.28, cy - S * 0.11, S * 0.07, S * 0.05, '#3a3d5c', '#565a80', '#16182c');
  stroke(put, cx - S * 0.33, cy - S * 0.09, cx - S * 0.38, cy - S * 0.07, S * 0.03, () => '#16182c');
  [[-0.34, -0.075], [-0.31, -0.06]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.white));
  // back spines
  for (let i = 0; i < 5; i++) stroke(put, cx - S * 0.08 + i * S * 0.06, cy - S * 0.09, cx - S * 0.09 + i * S * 0.06, cy - S * 0.15, 2, () => '#565a80');
  // coiled legs + whip tail w/ blade
  [[-0.1, -0.16], [0.06, 0.02], [0.16, 0.1]].forEach(([o, k]) => {
    stroke(put, cx + o * S, cy + S * 0.06, cx + (o + k * 0.4) * S, cy + S * 0.2, S * 0.03, () => '#2c2e48');
  });
  stroke(put, cx + S * 0.2, cy - S * 0.02, cx + S * 0.36, cy - S * 0.14, S * 0.02, (t) => mix('#3a3d5c', '#16182c', t));
  stroke(put, cx + S * 0.36, cy - S * 0.14, cx + S * 0.4, cy - S * 0.18, S * 0.025, () => L.void);
  // pounce arc dots
  for (let t = 0.1; t < 0.9; t += 0.16) put(Math.round(cx - S * 0.34 - t * S * 0.1), Math.round(cy - S * 0.16 - Math.sin(t * Math.PI) * S * 0.1), L.voidLt);
}

// 4 · GREY WATCHER — classic grey; telekinetic aimed bolts.
function drawGreyWatcher(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  // slender body
  for (let y = 0; y < S * 0.26; y++) {
    const t = y / (S * 0.26), w = S * (0.045 + t * 0.02);
    row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => mix(L.moonLt, L.moonDk, t + Math.abs(tx - 0.5) * 0.4));
  }
  // thin arms, one raised channeling
  stroke(put, cx - S * 0.045, cy + S * 0.02, cx - S * 0.14, cy + S * 0.14, S * 0.018, () => L.moonDk);
  stroke(put, cx + S * 0.045, cy + S * 0.02, cx + S * 0.14, cy - S * 0.08, S * 0.018, () => L.moon);
  // big head + huge black eyes
  dome(put, cx, cy - S * 0.14, S * 0.1, S * 0.09, L.moon, L.moonLt, L.moonDk);
  ell(put, cx, cy - S * 0.06, S * 0.05, S * 0.03, (tx, ty) => mix(L.moon, L.moonDk, ty)); // chin
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.045, cy - S * 0.14, S * 0.032, S * 0.045, () => L.oil);
    put(Math.round(cx + s * S * 0.035), Math.round(cy - S * 0.16), L.holoLt);
  });
  // telekinetic bolt forming at the raised hand
  ell(put, cx + S * 0.17, cy - S * 0.11, S * 0.04, S * 0.04, (tx, ty) => mix(L.holoLt, L.holoDk, ty));
  for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.17 + Math.cos(a) * S * 0.06), Math.round(cy - S * 0.11 + Math.sin(a) * S * 0.06), L.holo);
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy + S * 0.24, cx + s * S * 0.05, cy + S * 0.34, S * 0.02, () => L.moonDk));
}

// 5 · HIVE WARRIOR — xeno soldier; frontline melee.
function drawHiveWarrior(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // digitigrade legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.07, cy + S * 0.08, cx + s * S * 0.13, cy + S * 0.2, S * 0.035, () => L.xenoDk);
    stroke(put, cx + s * S * 0.13, cy + S * 0.2, cx + s * S * 0.1, cy + S * 0.32, S * 0.028, () => L.xenoDkk);
  });
  // segmented torso
  chitin(put, cx, cy - S * 0.02, S * 0.13, S * 0.16, L.xeno, L.xenoLt, L.xenoDkk);
  // scythe arms raised
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.11, cy - S * 0.08, cx + s * S * 0.24, cy - S * 0.18, S * 0.03, () => L.xenoDk);
    stroke(put, cx + s * S * 0.24, cy - S * 0.18, cx + s * S * 0.3, cy - S * 0.02, S * 0.025, (t) => mix(L.xenoDkk, L.oil, t * 0.5));
    put(Math.round(cx + s * S * 0.3), Math.round(cy - S * 0.0), L.white);
  });
  // crested head
  dome(put, cx, cy - S * 0.2, S * 0.075, S * 0.06, L.xeno, L.xenoLt, L.xenoDkk);
  stroke(put, cx, cy - S * 0.25, cx + S * 0.1, cy - S * 0.32, S * 0.03, (t) => mix(L.xenoDk, L.xenoDkk, t));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.035), Math.round(cy - S * 0.21), L.red));
  // mandibles
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy - S * 0.15, cx + s * S * 0.06, cy - S * 0.11, 2, () => L.xenoDkk));
}

// 6 · ACID SPITTER — lobs acid globs → sizzling pools.
function drawAcidSpitter(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  // squat bloated body
  chitin(put, cx, cy + S * 0.04, S * 0.17, S * 0.13, L.xenoDk, L.xeno, L.xenoDkk);
  // acid sacs glowing on the back
  [[-0.08, -0.04], [0.02, -0.07], [0.1, -0.03]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.045, S * 0.04, (tx, ty) => mix(L.acid, L.acidDk, ty));
    put(Math.round(cx + ox * S - 1), Math.round(cy + oy * S - 1), L.xenoLt);
  });
  // short legs
  [-1, 1].forEach(s => [[-0.05], [0.08]].forEach(([o]) => stroke(put, cx + s * S * 0.12, cy + S * 0.12 + o * S, cx + s * S * 0.18, cy + S * 0.2 + o * S, 2, () => L.xenoDkk)));
  // head thrown back mid-spit + glob arcing
  dome(put, cx - S * 0.12, cy - S * 0.06, S * 0.07, S * 0.06, L.xeno, L.xenoLt, L.xenoDkk);
  ell(put, cx - S * 0.15, cy - S * 0.1, S * 0.025, S * 0.03, () => L.oil); // open maw
  put(Math.round(cx - S * 0.1), Math.round(cy - S * 0.08), L.red);
  ell(put, cx - S * 0.24, cy - S * 0.22, S * 0.03, S * 0.035, (tx, ty) => mix(L.acid, L.acidDk, ty));
  [[-0.28, -0.28], [-0.21, -0.17]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.acid));
  // target pool ring
  ell(put, cx - S * 0.32, cy + S * 0.26, S * 0.07, S * 0.025, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.55 && d <= 1 ? L.acidDk : null; });
}

// 7 · BROOD SAC — pulsing egg; hatches Scuttlers when you get close.
function drawBroodSac(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.22);
  // fleshy egg
  for (let y = 0; y < S * 0.34; y++) {
    const t = y / (S * 0.34);
    const w = S * (0.06 + Math.sin(Math.min(1, t * 1.1) * Math.PI) * 0.12);
    row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w, (tx) => {
      let b = mix(L.fleshDk, L.flesh, Math.sin(tx * Math.PI));
      b = mix(b, L.voidDk, t * 0.4);
      return b;
    });
  }
  // glowing seams about to split open (four-petal top)
  [[-0.05, -0.16, 0.0, -0.02], [0.05, -0.16, 0.0, -0.02], [0.0, -0.18, -0.06, -0.06], [0.0, -0.18, 0.06, -0.06]].forEach(([a, b2, c, d]) =>
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.acid));
  // something moving inside (silhouette bump)
  ell(put, cx + S * 0.03, cy + S * 0.0, S * 0.05, S * 0.04, (tx, ty) => mix(L.voidDk, L.fleshDk, 0.5 + ty * 0.3));
  // membrane veins + base tendrils gripping the floor
  [[-0.1, -0.06], [0.08, 0.05], [-0.04, 0.1]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.05, cy + oy * S + S * 0.06, 1, () => L.voidDk));
  [-0.14, -0.05, 0.06, 0.14].forEach(o => stroke(put, cx + o * S, cy + S * 0.16, cx + o * S * 1.6, cy + S * 0.24, S * 0.02, (t) => mix(L.fleshDk, L.voidDk, t)));
  // one hatched shell nearby
  ell(put, cx + S * 0.26, cy + S * 0.2, S * 0.05, S * 0.03, (tx, ty) => mix(L.flesh, L.fleshDk, ty));
}

// 8 · SENTRY DRONE — station security flyer; aimed laser bursts.
function drawSentryDrone(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  hover(put, cx, S * 0.78, S * 0.12);
  // saucer chassis
  dome(put, cx, cy, S * 0.16, S * 0.08, L.hullMd, L.hull, L.hullDkk);
  plate(put, cx - S * 0.1, cy - S * 0.08, cx + S * 0.1, cy - S * 0.02, L.hullDk, L.hullMd, L.hullDkk);
  // sensor eye
  optic(put, cx, cy - S * 0.05, S * 0.035, L.redDk, L.red, L.redLt);
  // side thrusters
  [-1, 1].forEach(s => {
    plate(put, cx + s * S * 0.16 - S * 0.03, cy - S * 0.02, cx + s * S * 0.16 + S * 0.03, cy + S * 0.05, L.steel, L.steelLt, L.steelDkk);
    put(Math.round(cx + s * S * 0.16), Math.round(cy + S * 0.07), L.holo);
  });
  // under-barrel laser + beam
  stroke(put, cx, cy + S * 0.06, cx, cy + S * 0.12, S * 0.02, () => L.steelDk);
  stroke(put, cx - S * 0.02, cy + S * 0.13, cx - S * 0.16, cy + S * 0.3, 2, () => L.red);
  stroke(put, cx - S * 0.02, cy + S * 0.13, cx - S * 0.16, cy + S * 0.3, 1, () => L.redLt);
  // warning stripe + antenna
  row(put, Math.round(cy + S * 0.02), cx - S * 0.14, cx + S * 0.14, () => L.warn);
  stroke(put, cx + S * 0.06, cy - S * 0.08, cx + S * 0.1, cy - S * 0.16, 1, () => L.steelDk);
  put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.17), L.red);
}

// 9 · HAYWIRE TURRET — wall-mount turret gone rogue; sweeping beam.
function drawHaywireTurret(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // wall mount plate
  plate(put, cx - S * 0.2, cy + S * 0.14, cx + S * 0.2, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
  [[-0.16, 0.26], [0.16, 0.26]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.hullDkk));
  // articulated arm
  stroke(put, cx, cy + S * 0.14, cx - S * 0.04, cy + S * 0.02, S * 0.035, () => L.steelDk);
  bolt(put, cx - S * 0.04, cy + S * 0.0, S * 0.025, L.steel, L.steelDkk);
  // twin-barrel head, sparking
  plate(put, cx - S * 0.14, cy - S * 0.1, cx + S * 0.08, cy + S * 0.0, L.steel, L.steelLt, L.steelDkk);
  [[-0.02], [0.035]].forEach(([oy]) => stroke(put, cx - S * 0.14, cy - S * 0.05 + oy * S, cx - S * 0.28, cy - S * 0.05 + oy * S, S * 0.018, () => L.steelDk));
  optic(put, cx + S * 0.03, cy - S * 0.05, S * 0.026, L.warnDk, L.warn, L.warnLt);
  // damage sparks (haywire!)
  [[0.06, -0.14], [-0.06, -0.12]].forEach(([ox, oy]) => { put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.warnLt); put(Math.round(cx + ox * S + 2), Math.round(cy + oy * S - 2), L.warn); });
  // sweeping beam trace
  for (let a = -0.5; a < 0.3; a += 0.1) {
    const bx = cx - S * 0.28 - Math.cos(a) * S * 0.14, by = cy - S * 0.03 + Math.sin(a) * S * 0.16;
    put(Math.round(bx), Math.round(by), a > 0.1 ? L.redLt : L.redDk);
  }
  stroke(put, cx - S * 0.28, cy - S * 0.032, cx - S * 0.44, cy + S * 0.04, 2, () => L.red);
}

// 10 · ASTRO-REVENANT — dead crew in a drifting suit; slow reaching grab.
function drawAstroRevenant(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  hover(put, cx, S * 0.84, S * 0.1, L.voidDk);
  // drifting tilted suit body
  plate(put, cx - S * 0.1, cy - S * 0.08, cx + S * 0.12, cy + S * 0.14, L.hull, L.hullMd, L.hullDkk);
  // chest control box + tubes
  plate(put, cx - S * 0.05, cy - S * 0.03, cx + S * 0.05, cy + S * 0.04, L.steelDk, L.steel, L.oil);
  put(Math.round(cx - S * 0.02), Math.round(cy), L.red); put(Math.round(cx + S * 0.02), Math.round(cy), L.holo);
  stroke(put, cx + S * 0.08, cy - S * 0.06, cx + S * 0.16, cy + S * 0.04, 2, () => L.hullDk); // loose tube floats
  // helmet w/ CRACKED visor, green glow inside
  dome(put, cx, cy - S * 0.17, S * 0.085, S * 0.08, L.hull, '#ffffff', L.hullDk);
  visor(put, cx, cy - S * 0.16, S * 0.06, S * 0.05, '#0e2a1a', L.xenoDk);
  stroke(put, cx - S * 0.03, cy - S * 0.2, cx + S * 0.02, cy - S * 0.12, 1, () => '#ffffff'); // crack
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.165), L.xeno));
  // reaching arms, slow
  stroke(put, cx - S * 0.1, cy - S * 0.02, cx - S * 0.26, cy + S * 0.02, S * 0.035, () => L.hullMd);
  ell(put, cx - S * 0.28, cy + S * 0.03, S * 0.028, S * 0.024, () => L.hullDk);
  stroke(put, cx + S * 0.12, cy + S * 0.0, cx + S * 0.24, cy - S * 0.06, S * 0.035, () => L.hullDk);
  // dangling legs, one boot missing
  stroke(put, cx - S * 0.02, cy + S * 0.14, cx - S * 0.06, cy + S * 0.3, S * 0.032, () => L.hullMd);
  stroke(put, cx + S * 0.06, cy + S * 0.14, cx + S * 0.1, cy + S * 0.26, S * 0.028, () => L.hullDk);
  ell(put, cx - S * 0.065, cy + S * 0.32, S * 0.03, S * 0.02, () => L.oil);
  // little flag patch
  plate(put, cx - S * 0.09, cy - S * 0.06, cx - S * 0.05, cy - S * 0.03, L.red, L.redLt, L.redDk);
}

// 11 · MAGNETRON — floating magnet-core; PULLS you toward it.
function drawMagnetron(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  hover(put, cx, S * 0.8, S * 0.11);
  // horseshoe magnet body around a core
  ell(put, cx, cy, S * 0.14, S * 0.14, (tx, ty) => mix(L.steelLt, L.steelDkk, ty));
  ell(put, cx, cy, S * 0.08, S * 0.08, (tx, ty) => mix(L.holoLt, L.holoDk, ty));
  // pole shoes
  plate(put, cx - S * 0.2, cy - S * 0.06, cx - S * 0.1, cy + S * 0.06, L.red, L.redLt, L.redDk);
  plate(put, cx + S * 0.1, cy - S * 0.06, cx + S * 0.2, cy + S * 0.06, L.holoDk, L.holo, L.visor);
  // pull field lines curving inward
  [-1, 1].forEach(s => {
    for (let a = -0.8; a <= 0.8; a += 0.4) {
      for (let t = 0; t < 1; t += 0.12) {
        const px = cx + s * (S * 0.4 - t * S * 0.2), py = cy + a * S * (0.24 - t * 0.12);
        put(Math.round(px), Math.round(py), t > 0.7 ? L.holoLt : L.holoDk);
      }
    }
  });
  // debris being dragged in
  [[0.32, -0.14], [-0.34, 0.1]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, L.steel, L.steelLt, L.steelDkk));
  put(Math.round(cx), Math.round(cy - S * 0.02), '#ffffff');
}

// 12 · LUNA LEAPER — bounding alien; sails in low-grav arcs onto marked spots.
function drawLunaLeaper(put, S) {
  const cx = S * 0.5, cy = S * 0.42;
  // landing ring below
  ell(put, cx + S * 0.14, S * 0.86, S * 0.1, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? L.warn : null; });
  // mid-air frog-like alien, legs tucked
  chitin(put, cx, cy, S * 0.12, S * 0.1, L.void, L.voidLt, L.voidDk);
  // huge coiled hind legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy + S * 0.05, cx + s * S * 0.2, cy - S * 0.02, S * 0.035, () => L.voidDk);
    stroke(put, cx + s * S * 0.2, cy - S * 0.02, cx + s * S * 0.16, cy + S * 0.12, S * 0.03, () => L.voidDk);
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.16, cy + S * 0.12, cx + s * S * 0.16 + k * S * 0.02, cy + S * 0.16, 1, () => L.voidLt));
  });
  // small arms + wide grinning head
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy - S * 0.04, cx + s * S * 0.12, cy - S * 0.1, S * 0.02, () => L.voidDk));
  dome(put, cx, cy - S * 0.1, S * 0.08, S * 0.06, L.void, L.voidLt, L.voidDk);
  stroke(put, cx - S * 0.05, cy - S * 0.075, cx + S * 0.05, cy - S * 0.075, 1, () => L.oil);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.045, cy - S * 0.125, S * 0.02, S * 0.022, () => L.acid); put(Math.round(cx + s * S * 0.045), Math.round(cy - S * 0.13), L.oil); });
  // motion arc behind
  for (let t = 0.1; t < 0.9; t += 0.14) put(Math.round(cx - S * 0.16 - t * S * 0.2), Math.round(cy + S * 0.1 + t * t * S * 0.3), L.voidLt);
}

// 13 · PSI-LARVA — small psychic grub; projects a SLOWING field.
function drawPsiLarva(put, S) {
  const cx = S * 0.5, cy = S * 0.55;
  shadow(put, S, cx, S * 0.16);
  // slow-field bubble
  for (let a = 0; a < 6.28; a += 0.12) {
    const r = S * 0.3 + Math.sin(a * 5) * 2;
    put(Math.round(cx + Math.cos(a) * r), Math.round(cy - S * 0.04 + Math.sin(a) * r * 0.75), L.holoDk);
  }
  // segmented grub body
  [[-0.12, 0.05], [-0.04, 0.02], [0.05, 0.0], [0.13, 0.03]].forEach(([ox, oy], i) =>
    chitin(put, cx + ox * S, cy + oy * S, S * (0.07 - i * 0.005), S * 0.055, L.flesh, mix(L.flesh, '#ffffff', 0.4), L.fleshDk));
  // oversized pulsing brain-head
  dome(put, cx - S * 0.18, cy - S * 0.04, S * 0.08, S * 0.075, L.void, L.voidLt, L.voidDk);
  // brain folds
  [[-0.22, -0.08, -0.16, -0.1], [-0.24, -0.03, -0.15, -0.05]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.voidDk));
  [-0.2, -0.15].forEach(o => put(Math.round(cx + o * S), Math.round(cy + S * 0.0), L.holoLt));
  // psychic ripple rings
  [[0.0, -0.22], [0.05, -0.3]].forEach(([ox, oy], i) => {
    for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx - S * 0.18 + Math.cos(a) * S * (0.05 + i * 0.035)), Math.round(cy - S * 0.16 + oy * S * 0.3 + Math.sin(a) * S * (0.02 + i * 0.014)), L.holo);
  });
}

// 14 · CARAPACE BRUTE — armored alien tank.
function drawCarapaceBrute(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // heavy legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy + S * 0.1, cx + s * S * 0.18, cy + S * 0.3, S * 0.05, () => L.xenoDkk);
    ell(put, cx + s * S * 0.19, cy + S * 0.32, S * 0.05, S * 0.025, () => L.oil);
  });
  // massive plated shell body
  chitin(put, cx, cy - S * 0.02, S * 0.24, S * 0.2, L.xenoDk, L.xeno, L.xenoDkk);
  // overlapping armor ridges
  [[-0.12, 0.16], [-0.02, 0.2], [0.1, 0.16]].forEach(([o, w]) => {
    for (let a = Math.PI * 0.15; a < Math.PI * 0.85; a += 0.1)
      put(Math.round(cx + o * S + Math.cos(a) * w * S), Math.round(cy - S * 0.02 - Math.sin(a) * w * S * 0.8), L.xenoDkk);
  });
  // shell spikes
  [[-0.16, -0.16], [0.0, -0.22], [0.16, -0.16]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S * 1.3, cy + oy * S - S * 0.07, S * 0.03, (t) => mix(L.xenoDk, L.oil, t)));
  // small head low under the shell lip
  dome(put, cx, cy + S * 0.12, S * 0.07, S * 0.05, L.xeno, L.xenoLt, L.xenoDkk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy + S * 0.11), L.red));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.15, cx + s * S * 0.08, cy + S * 0.19, 2, () => L.xenoDkk));
  // cracked plate glow (old wound)
  stroke(put, cx + S * 0.08, cy - S * 0.12, cx + S * 0.14, cy - S * 0.02, 1, () => L.acid);
}

// 15 · PHASE STALKER — cloaking hunter; blinks in and out.
function drawPhaseStalker(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // decloaking: half the body is outline-only
  // solid half (left)
  chitin(put, cx - S * 0.06, cy, S * 0.11, S * 0.15, L.void, L.voidLt, L.voidDk);
  dome(put, cx - S * 0.08, cy - S * 0.18, S * 0.07, S * 0.06, L.void, L.voidLt, L.voidDk);
  [-0.11, -0.05].forEach(o => put(Math.round(cx + o * S), Math.round(cy - S * 0.19), L.holoLt));
  stroke(put, cx - S * 0.14, cy - S * 0.02, cx - S * 0.26, cy + S * 0.06, S * 0.03, () => L.voidDk);
  [-1, 0, 1].forEach(k => stroke(put, cx - S * 0.26, cy + S * 0.06, cx - S * 0.29, cy + S * 0.06 + k * S * 0.025, 1, () => L.voidLt));
  stroke(put, cx - S * 0.1, cy + S * 0.14, cx - S * 0.14, cy + S * 0.3, S * 0.03, () => L.voidDk);
  // phasing half (right): dotted outline + shimmer
  for (let a = -1.4; a < 1.5; a += 0.16) {
    const px = cx + S * 0.05 + Math.cos(a) * S * 0.1, py = cy + Math.sin(a) * S * 0.15;
    if ((a * 10 | 0) % 2 === 0) put(Math.round(px), Math.round(py), L.holo);
  }
  for (let a = -1.4; a < 1.5; a += 0.2) {
    const px = cx + S * 0.03 + Math.cos(a) * S * 0.06, py = cy - S * 0.18 + Math.sin(a) * S * 0.055;
    if ((a * 10 | 0) % 2 === 0) put(Math.round(px), Math.round(py), L.holoDk);
  }
  // shimmer sparkles
  [[0.14, -0.1], [0.18, 0.06], [0.1, 0.2]].forEach(([ox, oy]) => star(put, Math.round(cx + ox * S), Math.round(cy + oy * S), L.holoLt));
  // after-image trail
  for (let i = 0; i < 3; i++) ell(put, cx + S * 0.26 + i * S * 0.05, cy + S * 0.0, S * 0.03 - i * 4, S * 0.05 - i * 4, () => (i ? L.spaceLt : L.voidDk));
}

// 16 · SYMBIOTE HOST — taken crew member; the parasite JUMPS to empower
//      another mob when the host dies.
function drawSymbioteHost(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // shambling crew body in torn jumpsuit
  for (let y = 0; y < S * 0.28; y++) {
    const t = y / (S * 0.28), w = S * (0.07 + t * 0.05);
    row(put, Math.round(cy - S * 0.02 + y), cx - w + S * 0.02, cx + w + S * 0.02, (tx) => {
      let b = mix(L.warn, L.warnDk, t);
      if (tx > 0.4 && tx < 0.6 && t < 0.3) b = L.hull; // undershirt
      if (t > 0.8 && Math.sin(tx * 16) > 0.4) return null;
      return b;
    });
  }
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04 + S * 0.02, cy + S * 0.26, cx + s * S * 0.07 + S * 0.02, cy + S * 0.34, S * 0.025, () => L.warnDk));
  // arms — one human, one MUTATED into tendril
  stroke(put, cx - S * 0.07, cy + S * 0.02, cx - S * 0.15, cy + S * 0.14, S * 0.025, () => L.warnDk);
  stroke(put, cx + S * 0.1, cy + S * 0.0, cx + S * 0.22, cy - S * 0.08, S * 0.035, (t) => mix(L.void, L.voidDk, t));
  [[0.24, -0.1], [0.27, -0.06], [0.25, -0.02]].forEach(([ox, oy]) => stroke(put, cx + 0.22 * S, cy - 0.08 * S, cx + ox * S + S * 0.03, cy + oy * S, 2, () => L.voidLt));
  // head half-consumed: human face one side, symbiote mass the other
  dome(put, cx + S * 0.02, cy - S * 0.12, S * 0.065, S * 0.07, '#d8a888', '#f0c8a8', '#a87858');
  chitin(put, cx + S * 0.06, cy - S * 0.15, S * 0.05, S * 0.05, L.void, L.voidLt, L.voidDk);
  put(Math.round(cx - S * 0.015), Math.round(cy - S * 0.13), L.oil); // human eye
  put(Math.round(cx + S * 0.06), Math.round(cy - S * 0.15), L.acid); // symbiote eye
  // symbiote veins spreading down the neck
  [[0.05, -0.06], [0.02, -0.02]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S - S * 0.04, cx + ox * S - S * 0.03, cy + oy * S + S * 0.03, 1, () => L.voidDk));
  // the jump-arc hint: parasite leaping off toward another silhouette
  for (let t = 0.1; t < 0.9; t += 0.14) put(Math.round(cx + S * 0.1 + t * S * 0.24), Math.round(cy - S * 0.24 - Math.sin(t * Math.PI) * S * 0.08), L.acid);
  ell(put, cx + S * 0.34, cy - S * 0.22, S * 0.025, S * 0.02, (tx, ty) => mix(L.void, L.voidDk, ty));
}

// 17 · VENT CRAWLER — bursts out of floor vents beneath you.
function drawVentCrawler(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // floor vent grate (bent open)
  plate(put, cx - S * 0.2, cy + S * 0.14, cx + S * 0.2, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
  for (let x = -0.16; x < 0.17; x += 0.05) stroke(put, cx + x * S, cy + S * 0.16, cx + x * S, cy + S * 0.28, 2, () => L.oil);
  // grate flap flung up
  plate(put, cx + S * 0.1, cy - S * 0.02, cx + S * 0.24, cy + S * 0.12, L.hullDk, L.hullMd, L.hullDkk);
  // the crawler halfway out: long arms + snapping head
  chitin(put, cx - S * 0.02, cy + S * 0.02, S * 0.1, S * 0.09, L.xenoDk, L.xeno, L.xenoDkk);
  dome(put, cx - S * 0.04, cy - S * 0.1, S * 0.07, S * 0.055, L.xenoDk, L.xeno, L.xenoDkk);
  stroke(put, cx - S * 0.1, cy - S * 0.09, cx - S * 0.16, cy - S * 0.06, S * 0.03, () => L.xenoDkk);
  [[-0.13, -0.075], [-0.1, -0.06]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.white));
  put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.115), L.red);
  // gripping claws on the vent edge
  [[-0.16, 0.12], [0.1, 0.14]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S * 0.5, cy + S * 0.02, cx + ox * S, cy + oy * S, S * 0.028, () => L.xenoDk);
    [-1, 0, 1].forEach(k => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + k * S * 0.02, cy + oy * S + S * 0.03, 1, () => L.xenoLt));
  });
  // warn cracks radiating from the vent
  [[-0.26, 0.2], [0.28, 0.24]].forEach(([ox, oy]) => stroke(put, cx + ox * S * 0.7, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.03, 1, () => L.warnDk));
}

// 18 · ORBITAL MINE — drifting proximity bomb; beeps, then BOOM.
function drawOrbitalMine(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  hover(put, cx, S * 0.8, S * 0.1, L.redDk);
  // spiked sphere
  dome(put, cx, cy, S * 0.14, S * 0.14, L.steelDk, L.steel, L.steelDkk);
  for (let a = 0; a < 6.28; a += 0.785) {
    const sx = cx + Math.cos(a) * S * 0.14, sy = cy + Math.sin(a) * S * 0.14;
    stroke(put, sx, sy, cx + Math.cos(a) * S * 0.21, cy + Math.sin(a) * S * 0.21, S * 0.022, (t) => mix(L.steel, L.steelDkk, t));
    put(Math.round(cx + Math.cos(a) * S * 0.22), Math.round(cy + Math.sin(a) * S * 0.22), L.warn);
  }
  // blinking arm light + warning ring
  optic(put, cx, cy - S * 0.02, S * 0.035, L.redDk, L.red, L.redLt);
  row(put, Math.round(cy + S * 0.06), cx - S * 0.1, cx + S * 0.1, () => L.warn);
  // proximity radius ring
  for (let a = 0; a < 6.28; a += 0.22) put(Math.round(cx + Math.cos(a) * S * 0.34), Math.round(cy + Math.sin(a) * S * 0.3), (a * 7 | 0) % 2 ? L.redDk : null);
  // beep marks
  [[0.2, -0.26], [0.26, -0.2]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S - S * 0.03, 1, () => L.redLt));
}

// 19 · HIVE NURSE — spindly caretaker; knits wounded aliens back together.
function drawHiveNurse(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // tall thin robed-looking chitin body
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.05 + t * 0.07);
    row(put, Math.round(cy - S * 0.04 + y), cx - w, cx + w, (tx) => {
      let b = mix(L.flesh, L.fleshDk, t);
      if (Math.sin(tx * 7 + t * 8) > 0.7) b = mix(b, L.voidDk, 0.3);
      return b;
    });
  }
  // four thin healing arms weaving green threads
  [-1, 1].forEach(s => [[-0.1, -0.02], [-0.02, 0.08]].forEach(([oy, k]) => {
    stroke(put, cx + s * S * 0.07, cy + oy * S, cx + s * S * 0.22, cy + oy * S + k * S, S * 0.016, () => L.fleshDk);
    put(Math.round(cx + s * S * 0.23), Math.round(cy + oy * S + k * S), L.xenoLt);
  }));
  // threads arcing to a wounded scuttler beside her
  chitin(put, cx + S * 0.3, cy + S * 0.18, S * 0.07, S * 0.05, L.xenoDk, L.xeno, L.xenoDkk);
  for (let t = 0.1; t < 0.9; t += 0.12) put(Math.round(cx + S * 0.2 + t * S * 0.1), Math.round(cy - S * 0.02 + t * S * 0.18), L.xenoLt);
  // narrow hooded head w/ triple eyes
  dome(put, cx, cy - S * 0.13, S * 0.06, S * 0.075, L.flesh, mix(L.flesh, '#ffffff', 0.4), L.fleshDk);
  [[-0.025, -0.14], [0.0, -0.16], [0.025, -0.14]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.acid));
  // egg satchel at the hip
  ell(put, cx - S * 0.1, cy + S * 0.14, S * 0.05, S * 0.04, (tx, ty) => mix(L.void, L.voidDk, ty));
  [[-0.12, 0.12], [-0.08, 0.13]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.voidLt));
}

// 20 · STAR HORROR — elite void tentacle beast; heavy burst.
function drawStarHorror(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  hover(put, cx, S * 0.84, S * 0.14, L.voidDk);
  // central mass of void-flesh
  chitin(put, cx, cy, S * 0.16, S * 0.14, '#2c1c4c', L.void, L.oil);
  // starfield speckle INSIDE the body (it contains space)
  let seed = 9; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 10; i++) {
    const a = rnd() * 6.28, r = rnd() * S * 0.1;
    put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.85), rnd() > 0.5 ? '#ffffff' : L.voidLt);
  }
  // one great eye
  optic(put, cx, cy - S * 0.02, S * 0.05, L.voidDk, L.warn, L.warnLt);
  // eight tentacles radiating w/ curl
  for (let a = 0.3; a < 6.3; a += 0.785) {
    let px = cx + Math.cos(a) * S * 0.15, py = cy + Math.sin(a) * S * 0.13;
    let ang = a;
    for (let seg = 0; seg < 5; seg++) {
      const nx = px + Math.cos(ang) * S * 0.055, ny = py + Math.sin(ang) * S * 0.05;
      stroke(put, px, py, nx, ny, S * (0.03 - seg * 0.004), (t) => mix(L.void, '#2c1c4c', t + seg * 0.15));
      px = nx; py = ny; ang += 0.45;
    }
    put(Math.round(px), Math.round(py), L.voidLt);
  }
  // void drips
  [[-0.1, 0.16], [0.12, 0.18]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.06, 1, () => L.voidDk));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'SCUTTLER', role: 'swarm filler', draw: drawScuttler },
  { n: 2, name: 'DRIFT SPORE', role: 'pops into gas', draw: drawDriftSpore },
  { n: 3, name: 'VOID HOUND', role: 'low-grav pounce', draw: drawVoidHound },
  { n: 4, name: 'GREY WATCHER', role: 'aimed psi-bolts', draw: drawGreyWatcher },
  { n: 5, name: 'HIVE WARRIOR', role: 'melee soldier', draw: drawHiveWarrior },
  { n: 6, name: 'ACID SPITTER', role: 'lobs acid pools', draw: drawAcidSpitter },
  { n: 7, name: 'BROOD SAC', role: 'hatches swarm', draw: drawBroodSac },
  { n: 8, name: 'SENTRY DRONE', role: 'laser flyer', draw: drawSentryDrone },
  { n: 9, name: 'HAYWIRE TURRET', role: 'sweeping beam', draw: drawHaywireTurret },
  { n: 10, name: 'ASTRO-REVENANT', role: 'drifting grabber', draw: drawAstroRevenant },
  { n: 11, name: 'MAGNETRON', role: 'PULLS you in', draw: drawMagnetron },
  { n: 12, name: 'LUNA LEAPER', role: 'arcing lander', draw: drawLunaLeaper },
  { n: 13, name: 'PSI-LARVA', role: 'slow field', draw: drawPsiLarva },
  { n: 14, name: 'CARAPACE BRUTE', role: 'tank', draw: drawCarapaceBrute },
  { n: 15, name: 'PHASE STALKER', role: 'cloak + blink', draw: drawPhaseStalker },
  { n: 16, name: 'SYMBIOTE HOST', role: 'parasite jumps on death', draw: drawSymbioteHost },
  { n: 17, name: 'VENT CRAWLER', role: 'floor ambusher', draw: drawVentCrawler },
  { n: 18, name: 'ORBITAL MINE', role: 'drifting bomb', draw: drawOrbitalMine },
  { n: 19, name: 'HIVE NURSE', role: 'healer', draw: drawHiveNurse },
  { n: 20, name: 'STAR HORROR', role: 'elite burst', draw: drawStarHorror },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'lunar_mob_options.png',
  title: 'LUNAR STATION — MOB CANDIDATES (pick 8, tell me numbers to change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
