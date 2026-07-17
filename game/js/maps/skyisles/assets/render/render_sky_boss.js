// artdev/skyisles/render_sky_boss.js — 10 numbered GIANT-THUNDERBIRD boss
// work-ups for STORM SKY ISLES (Red's direction: a giant thunderbird).
//   RANGER_PATH=<ranger_art.js> node render_sky_boss.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, cloudBlob, zig, wing, gust } = KIT;

// big spread wing with individually drawn primaries
function bossWing(put, cx, cy, len, sweep, side, base, lt, dk, primaries) {
  ell(put, cx + side * len * 0.4, cy - sweep * 0.55, len * 0.46, len * 0.2, (tx, ty) => mix(lt, base, clamp(ty * 1.25, 0, 1)));
  const N = primaries || 7;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const bx = lerp(cx + side * len * 0.14, cx + side * len * 0.98, t);
    const by = lerp(cy - sweep * 0.28, cy - sweep, t);
    stroke(put, bx, by, bx + side * len * (0.1 + t * 0.12), by + len * (0.42 - t * 0.1), Math.max(2, len * 0.075), (tt) => mix(base, dk, 0.25 + tt * 0.75));
  }
}
function tailFan(put, cx, cy, n, len, base, dk) {
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * 0.12;
    stroke(put, cx, cy, cx + o * len * 2.2, cy + len, Math.max(2, len * 0.14), (t) => mix(base, dk, 0.3 + t * 0.7));
  }
}
function beakHead(put, cx, cy, r, base, lt, dk, beakC, beakDk, eyeC) {
  dome(put, cx, cy, r, r * 0.92, base, lt, dk);
  // hooked beak downward
  stroke(put, cx, cy + r * 0.35, cx, cy + r * 1.05, r * 0.5, (t) => mix(beakC, beakDk, t * 0.8));
  stroke(put, cx, cy + r * 1.0, cx - r * 0.14, cy + r * 1.3, r * 0.26, () => beakDk);
  // fierce brows + eyes
  [-1, 1].forEach(s => {
    stroke(put, cx + s * r * 0.75, cy - r * 0.45, cx + s * r * 0.1, cy - r * 0.3, Math.max(2, r * 0.18), () => dk);
    optic(put, cx + s * r * 0.42, cy - r * 0.12, r * 0.17, mix(eyeC, '#000000', 0.5), eyeC, '#ffffff');
  });
}

// 1 · STORM ROC — the classic: colossal blue eagle, gold crest, wings up.
function drawStormRoc(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.3);
  bossWing(put, cx - S * 0.06, cy - S * 0.06, S * 0.4, S * 0.26, -1, K.feather, K.featherLt, K.featherDkk);
  bossWing(put, cx + S * 0.06, cy - S * 0.06, S * 0.4, S * 0.26, 1, K.feather, K.featherLt, K.featherDkk);
  tailFan(put, cx, cy + S * 0.14, 5, S * 0.22, K.feather, K.featherDkk);
  dome(put, cx, cy + S * 0.02, S * 0.16, S * 0.2, K.featherDk, K.feather, K.featherDkk);
  // chest lightning sigil
  zig(put, cx - S * 0.02, cy - S * 0.04, cx + S * 0.03, cy + S * 0.12, 2, K.gold, K.goldLt);
  beakHead(put, cx, cy - S * 0.22, S * 0.1, K.featherDk, K.feather, K.featherDkk, K.gold, K.goldDk, K.volt);
  // gold crest feathers
  [[-0.06, -0.36], [0, -0.4], [0.06, -0.36]].forEach(([ox, oy]) =>
    stroke(put, cx + ox * S * 0.6, cy - S * 0.3, cx + ox * S * 2, cy + oy * S, S * 0.03, (t) => mix(K.gold, K.goldDk, t)));
  // talons gripping a bolt
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.07, cy + S * 0.2, cx + s * S * 0.07 + k * S * 0.03, cy + S * 0.28, 3, () => K.gold)));
  zig(put, cx - S * 0.18, cy + S * 0.3, cx + S * 0.2, cy + S * 0.26, 3, K.volt, K.voltLt);
}

// 2 · VOLTWING — sleek storm falcon; wing edges ARE lightning.
function drawVoltwing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // swept-back speed wings
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.22, cy - S * 0.04, S * 0.2, S * 0.09, (tx, ty) => mix(K.indigoLt, K.indigoDk, clamp(ty * 1.3, 0, 1)));
    zig(put, cx + s * S * 0.1, cy + S * 0.02, cx + s * S * 0.44, cy - S * 0.14, 2, K.volt, K.voltLt);
    zig(put, cx + s * S * 0.12, cy + S * 0.06, cx + s * S * 0.4, cy - S * 0.02, 2, K.volt, K.voltLt);
  });
  // aerodynamic body, nose down (diving)
  ell(put, cx, cy + S * 0.04, S * 0.11, S * 0.22, (tx, ty) => mix(K.indigo, K.indigoDk, clamp(ty * 1.2, 0, 1)));
  // streamline chevrons
  [0.0, 0.08, 0.16].forEach(o => stroke(put, cx - S * 0.06, cy + o * S, cx, cy + o * S + S * 0.04, 2, () => K.volt));
  // narrow head + needle beak downward
  dome(put, cx, cy - S * 0.16, S * 0.08, S * 0.08, K.indigo, K.indigoLt, K.indigoDk);
  stroke(put, cx, cy - S * 0.1, cx, cy + S * 0.0, S * 0.035, () => K.goldDk);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.18, S * 0.028, K.voltDk, K.volt, K.voltLt));
  // speed streaks + trailing bolt tail
  [-0.3, 0.3].forEach(o => stroke(put, cx + o * S, cy - S * 0.3, cx + o * S, cy - S * 0.16, 1, () => K.wind));
  zig(put, cx, cy + S * 0.26, cx, cy + S * 0.42, 2, K.volt, K.voltLt);
}

// 3 · THE THUNDERCLAP — condor with a storm-cloud collar, wings raised
//     to SLAM together.
function drawThunderclap(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.3);
  // wings raised high overhead (about to clap)
  [-1, 1].forEach(s => {
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      stroke(put, cx + s * S * 0.1, cy - S * 0.1,
        cx + s * S * (0.16 + t * 0.2), cy - S * (0.3 + t * 0.1) - (1 - Math.abs(t - 0.5) * 2) * S * 0.06,
        S * 0.045, (tt) => mix(K.thunder, K.thunderDkk, 0.3 + tt * 0.6));
    }
  });
  // clap spark between wingtips
  ell(put, cx, cy - S * 0.42, S * 0.03, S * 0.03, () => K.voltCore);
  zig(put, cx - S * 0.06, cy - S * 0.4, cx + S * 0.06, cy - S * 0.44, 1, K.volt, K.voltLt);
  // storm-cloud collar ruff
  cloudBlob(put, cx, cy - S * 0.12, S * 0.14, K.cloudMd, K.cloudLt, K.cloudDkk);
  // heavy body
  dome(put, cx, cy + S * 0.06, S * 0.17, S * 0.2, K.thunderDk, K.thunder, K.thunderDkk);
  // bald condor head, red-orange
  dome(put, cx, cy - S * 0.18, S * 0.08, S * 0.08, '#d86a3a', '#ffb078', '#8a3a1a');
  stroke(put, cx, cy - S * 0.12, cx, cy - S * 0.04, S * 0.04, (t) => mix(K.marbleLt, K.marbleDk, t));
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.2, S * 0.026, K.voltDk, K.volt, K.voltLt));
  // talons
  [-1, 1].forEach(s => [-1, 1].forEach(k =>
    stroke(put, cx + s * S * 0.08, cy + S * 0.24, cx + s * S * 0.08 + k * S * 0.03, cy + S * 0.32, 3, () => K.marbleDk)));
}

// 4 · TEMPEST OWL — vast storm owl; the eye of the hurricane in its face.
function drawTempestOwl(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // folded broad wings like a cloak
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.2, cy + S * 0.08, S * 0.14, S * 0.26, (tx, ty) => mix(K.cloudDk, K.cloudDkk, clamp(ty * 1.15, 0, 1))));
  // wide body
  dome(put, cx, cy + S * 0.08, S * 0.2, S * 0.24, K.cloudMd, K.cloud, K.cloudDkk);
  // chest speckles
  for (let i = 0; i < 16; i++) put(Math.round(cx + (h(i) - 0.5) * S * 0.24), Math.round(cy + S * 0.06 + (h(i + 40) - 0.5) * S * 0.24), K.cloudDkk);
  function h(n) { let x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); }
  // huge facial disc — a swirling hurricane
  dome(put, cx, cy - S * 0.16, S * 0.17, S * 0.15, K.cloudLt, '#ffffff', K.cloudMd);
  for (let a = 0; a < 9; a += 0.12) {
    const rr = S * 0.02 + a * S * 0.016;
    if (rr < S * 0.15) put(Math.round(cx + Math.cos(a) * rr), Math.round(cy - S * 0.16 + Math.sin(a) * rr * 0.8), K.cloudDk);
  }
  // two storm eyes + tiny beak
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.07, cy - S * 0.17, S * 0.045, K.skyDkk, K.sky, K.skyLt));
  stroke(put, cx, cy - S * 0.1, cx, cy - S * 0.06, 3, () => K.gold);
  // ear tufts crackling
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy - S * 0.28, cx + s * S * 0.18, cy - S * 0.38, S * 0.035, () => K.cloudDk);
    put(Math.round(cx + s * S * 0.19), Math.round(cy - S * 0.39), K.voltLt);
  });
  // talons on a branch of lightning
  zig(put, cx - S * 0.2, cy + S * 0.34, cx + S * 0.2, cy + S * 0.32, 3, K.volt, K.voltLt);
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.06, cy + S * 0.28, cx + s * S * 0.06 + k * S * 0.02, cy + S * 0.33, 2, () => K.gold)));
}

// 5 · SKYPIERCER — spear-beaked storm heron; a living lightning lance.
function drawSkypiercer(put, S) {
  const cx = S * 0.46, cy = S * 0.52;
  shadow(put, S, cx, S * 0.26);
  // long legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.16, cx + s * S * 0.08, cy + S * 0.4, S * 0.02, () => K.goldDk));
  // slim body
  ell(put, cx, cy + S * 0.06, S * 0.13, S * 0.16, (tx, ty) => mix(K.sky, K.skyDkk, clamp(ty * 1.2, 0, 1)));
  // swept narrow wings
  [-1, 1].forEach(s => bossWing(put, cx + s * S * 0.04, cy, S * 0.3, S * 0.2, s, K.sky, K.skyLt, K.skyDkk, 5));
  // S-curved neck
  stroke(put, cx, cy - S * 0.06, cx + S * 0.1, cy - S * 0.16, S * 0.05, () => K.sky);
  stroke(put, cx + S * 0.1, cy - S * 0.16, cx + S * 0.02, cy - S * 0.28, S * 0.045, () => K.skyLt);
  // dagger head + LANCE beak (long, edged in volt)
  dome(put, cx + S * 0.02, cy - S * 0.3, S * 0.06, S * 0.055, K.sky, K.skyLt, K.skyDkk);
  stroke(put, cx + S * 0.06, cy - S * 0.3, cx + S * 0.42, cy - S * 0.34, S * 0.028, () => K.gold);
  zig(put, cx + S * 0.3, cy - S * 0.36, cx + S * 0.46, cy - S * 0.34, 1, K.volt, K.voltLt);
  optic(put, cx + S * 0.02, cy - S * 0.31, S * 0.024, K.redDk, K.red, K.redLt);
  // crest plume back off the head
  stroke(put, cx - S * 0.02, cy - S * 0.34, cx - S * 0.14, cy - S * 0.42, S * 0.025, () => K.skyDkk);
}

// 6 · TWINSTORM — two-headed thunderbird; each head owns half the storm.
function drawTwinstorm(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.3);
  bossWing(put, cx - S * 0.08, cy - S * 0.04, S * 0.38, S * 0.24, -1, K.purple, K.purpleLt, K.purpleDk);
  bossWing(put, cx + S * 0.08, cy - S * 0.04, S * 0.38, S * 0.24, 1, K.sky, K.skyLt, K.skyDkk);
  tailFan(put, cx, cy + S * 0.16, 6, S * 0.2, K.indigo, K.indigoDk);
  // broad body split-toned down the middle
  dome(put, cx, cy + S * 0.04, S * 0.17, S * 0.2, K.indigo, K.indigoLt, K.indigoDk);
  for (let y = Math.round(cy - S * 0.14); y < cy + S * 0.22; y++) put(Math.round(cx), y, K.indigoDk);
  // two necks + heads
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, cy - S * 0.1, cx + s * S * 0.12, cy - S * 0.22, S * 0.05, () => (s < 0 ? K.purple : K.sky));
    beakHead(put, cx + s * S * 0.13, cy - S * 0.28, S * 0.07,
      s < 0 ? K.purple : K.sky, s < 0 ? K.purpleLt : K.skyLt, s < 0 ? K.purpleDk : K.skyDkk,
      K.gold, K.goldDk, s < 0 ? K.purpleLt : K.voltLt);
  });
  // arcing bolt between the heads
  zig(put, cx - S * 0.08, cy - S * 0.34, cx + S * 0.08, cy - S * 0.34, 2, K.volt, K.voltLt);
  // talons
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.07, cy + S * 0.22, cx + s * S * 0.07 + k * S * 0.03, cy + S * 0.3, 3, () => K.gold)));
}

// 7 · THE OLD VANE — ancient copper thunderbird; half statue, half alive,
//     lightning leaking from the seams.
function drawOldVane(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.28);
  // verdigris copper wings, panel seams
  [-1, 1].forEach(s => {
    bossWing(put, cx + s * S * 0.06, cy - S * 0.04, S * 0.36, S * 0.22, s, '#4fa88a', '#8ad6b8', '#2a6653');
    stroke(put, cx + s * S * 0.12, cy - S * 0.1, cx + s * S * 0.3, cy - S * 0.18, 1, () => K.copperDk);
  });
  // riveted copper body
  dome(put, cx, cy + S * 0.02, S * 0.15, S * 0.19, K.copper, K.copperLt, K.copperDk);
  [[-0.06, -0.04], [0.06, -0.04], [0, 0.08], [-0.05, 0.14], [0.05, 0.14]].forEach(([ox, oy]) => bolt(put, cx + ox * S, cy + oy * S, S * 0.014, K.copperLt, K.copperDk));
  // seam down the chest leaking volt light
  for (let y = Math.round(cy - S * 0.1); y < cy + S * 0.18; y += 2) put(Math.round(cx), y, K.voltLt);
  // weathercock head w/ arrow crest
  beakHead(put, cx, cy - S * 0.2, S * 0.09, K.copper, K.copperLt, K.copperDk, K.brass, K.brassDk, K.volt);
  // N-S-E-W arrow through the crest
  stroke(put, cx - S * 0.2, cy - S * 0.32, cx + S * 0.2, cy - S * 0.32, S * 0.02, () => K.iron);
  stroke(put, cx + S * 0.2, cy - S * 0.32, cx + S * 0.14, cy - S * 0.36, S * 0.02, () => K.iron);
  stroke(put, cx + S * 0.2, cy - S * 0.32, cx + S * 0.14, cy - S * 0.28, S * 0.02, () => K.iron);
  plate(put, cx - S * 0.26, cy - S * 0.34, cx - S * 0.2, cy - S * 0.3, K.brass, K.brassLt, K.brassDk);
  // cracked patina + arcs
  zig(put, cx - S * 0.12, cy + S * 0.06, cx - S * 0.2, cy + S * 0.14, 1, K.volt, K.voltLt);
  // perched on a broken vane pole
  stroke(put, cx, cy + S * 0.2, cx, cy + S * 0.4, S * 0.03, () => K.ironDk);
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.05, cy + S * 0.2, cx + s * S * 0.05 + k * S * 0.02, cy + S * 0.26, 2, () => K.brassDk)));
}

// 8 · NIMBUS TALON — a bird MADE of storm cloud; only talons + eyes solid.
function drawNimbusTalon(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // wings = rolling cloud banks
  cloudBlob(put, cx - S * 0.24, cy - S * 0.06, S * 0.17, K.cloudMd, K.cloudLt, K.thunderDk);
  cloudBlob(put, cx + S * 0.24, cy - S * 0.06, S * 0.17, K.cloudMd, K.cloudLt, K.thunderDk);
  // body cloud
  cloudBlob(put, cx, cy + S * 0.02, S * 0.2, K.thunder, K.cloud, K.thunderDkk);
  // rain falling from the underside
  for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.05, cy + S * 0.18, cx + i * S * 0.05 - S * 0.015, cy + S * 0.26, 1, () => K.sky);
  // head cloud w/ hooked wisp beak
  cloudBlob(put, cx, cy - S * 0.2, S * 0.11, K.cloudMd, K.cloudLt, K.thunderDk);
  stroke(put, cx, cy - S * 0.14, cx + S * 0.02, cy - S * 0.06, S * 0.035, (t) => mix(K.cloudLt, K.cloudDk, t));
  // burning volt eyes (the only hard light)
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.05, cy - S * 0.22, S * 0.036, K.voltDk, K.volt, K.voltLt));
  // SOLID gold talons hanging from the cloud belly
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy + S * 0.16, cx + s * S * 0.1, cy + S * 0.3, S * 0.03, () => K.goldDk);
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.1, cy + S * 0.3, cx + s * S * 0.1 + k * S * 0.035, cy + S * 0.37, 3, () => K.gold));
  });
  // internal lightning flashes
  zig(put, cx - S * 0.1, cy - S * 0.02, cx - S * 0.02, cy + S * 0.1, 2, K.volt, K.voltLt);
  zig(put, cx + S * 0.12, cy - S * 0.06, cx + S * 0.06, cy + S * 0.06, 1, K.volt, K.voltLt);
}

// 9 · VOIDCROW — night-storm raven; purple void where its heart should be.
function drawVoidcrow(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.28);
  // ragged black wings (torn trailing edges)
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.24, cy - S * 0.08, S * 0.2, S * 0.1, (tx, ty) => mix('#2a2d44', '#12131f', clamp(ty * 1.2, 0, 1)));
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      stroke(put, cx + s * S * (0.14 + t * 0.26), cy - S * 0.04,
        cx + s * S * (0.18 + t * 0.28), cy + S * (0.12 + (i % 2) * 0.05), S * 0.05, (tt) => mix('#232538', '#0c0d16', tt));
    }
  });
  // hunched body
  dome(put, cx, cy + S * 0.04, S * 0.15, S * 0.18, '#232538', '#3a3d5c', '#0c0d16');
  // the void heart — purple tear in the chest
  ell(put, cx, cy + S * 0.02, S * 0.06, S * 0.08, (tx, ty) => {
    const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2;
    return d < 0.12 ? K.purpleLt : mix(K.purple, K.purpleDk, d * 4);
  });
  [[0.08, -0.04], [-0.09, 0.06], [0.04, 0.12]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S + S * 0.02), K.purpleLt));
  // sleek head + long straight beak
  dome(put, cx, cy - S * 0.16, S * 0.08, S * 0.075, '#2a2d44', '#3a3d5c', '#12131f');
  stroke(put, cx, cy - S * 0.13, cx + S * 0.0, cy - S * 0.02, S * 0.032, (t) => mix('#3a3d5c', '#12131f', t));
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.18, S * 0.028, K.purpleDk, K.purple, K.purpleLt));
  // purple lightning halo
  zig(put, cx - S * 0.16, cy - S * 0.3, cx - S * 0.02, cy - S * 0.26, 1, K.purple, K.purpleLt);
  zig(put, cx + S * 0.16, cy - S * 0.32, cx + S * 0.04, cy - S * 0.26, 1, K.purple, K.purpleLt);
  // talons
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.06, cy + S * 0.2, cx + s * S * 0.06 + k * S * 0.025, cy + S * 0.28, 2, () => '#3a3d5c')));
}

// 10 · TOTEM THUNDERBIRD — angular painted-cedar spirit come to life.
function drawTotemThunderbird(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.3);
  // geometric stepped wings (formline style)
  [-1, 1].forEach(s => {
    [[0.1, -0.02, 0.34, 0.1], [0.14, -0.12, 0.3, 0.06], [0.18, -0.22, 0.24, 0.05]].forEach(([ox, oy, w, hgt]) =>
      plate(put, cx + s * ox * S, cy + oy * S - hgt * S, cx + s * (ox + w) * S, cy + oy * S, s < 0 ? K.red : K.red, K.redLt, K.redDk));
    // black formline edges
    [[0.1, -0.02, 0.34], [0.14, -0.12, 0.3], [0.18, -0.22, 0.24]].forEach(([ox, oy, w]) =>
      row(put, Math.round(cy + oy * S), cx + s * ox * S, cx + s * (ox + w) * S, () => K.oil));
  });
  // cedar body block
  plate(put, cx - S * 0.13, cy - S * 0.12, cx + S * 0.13, cy + S * 0.22, K.wood, K.woodLt, K.woodDkk);
  // painted chest: ovoid + U-forms
  ell(put, cx, cy + S * 0.04, S * 0.08, S * 0.06, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    return d > 0.55 ? K.oil : (d > 0.3 ? K.sky : K.red);
  });
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.09, cy + S * 0.14, cx + s * S * 0.05, cy + S * 0.18, 2, () => K.oil));
  // masked head w/ heavy brow + hooked painted beak
  plate(put, cx - S * 0.1, cy - S * 0.32, cx + S * 0.1, cy - S * 0.12, K.grassDk, K.grass, K.grassDkk);
  row(put, Math.round(cy - S * 0.24), cx - S * 0.1, cx + S * 0.1, () => K.oil);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.05, cy - S * 0.2, S * 0.03, K.oil, K.volt, K.voltLt));
  // big downturned beak
  stroke(put, cx, cy - S * 0.14, cx, cy - S * 0.02, S * 0.06, (t) => mix(K.gold, K.goldDk, t));
  row(put, Math.round(cy - S * 0.08), cx - S * 0.04, cx + S * 0.04, () => K.oil);
  // lightning held in each wing "hand"
  [-1, 1].forEach(s => zig(put, cx + s * S * 0.4, cy - S * 0.24, cx + s * S * 0.34, cy + S * 0.06, 2, K.volt, K.voltLt));
  // stubby legs
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.07 - S * 0.025, cy + S * 0.22, cx + s * S * 0.07 + S * 0.025, cy + S * 0.32, K.woodDk, K.wood, K.woodDkk));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'STORM ROC', role: 'the classic', draw: drawStormRoc },
  { n: 2, name: 'VOLTWING', role: 'lightning falcon', draw: drawVoltwing },
  { n: 3, name: 'THE THUNDERCLAP', role: 'wing-slam condor', draw: drawThunderclap },
  { n: 4, name: 'TEMPEST OWL', role: 'hurricane face', draw: drawTempestOwl },
  { n: 5, name: 'SKYPIERCER', role: 'lance heron', draw: drawSkypiercer },
  { n: 6, name: 'TWINSTORM', role: 'two-headed', draw: drawTwinstorm },
  { n: 7, name: 'THE OLD VANE', role: 'copper colossus', draw: drawOldVane },
  { n: 8, name: 'NIMBUS TALON', role: 'living cloud', draw: drawNimbusTalon },
  { n: 9, name: 'VOIDCROW', role: 'night storm', draw: drawVoidcrow },
  { n: 10, name: 'TOTEM THUNDERBIRD', role: 'awakened idol', draw: drawTotemThunderbird },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'sky_boss_options.png',
  title: 'STORM SKY ISLES — THUNDERBIRD BOSS WORK-UPS (pick 1, name it or keep mine)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
