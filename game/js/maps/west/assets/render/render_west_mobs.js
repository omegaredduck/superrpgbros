// artdev/west/render_west_mobs.js — 20 numbered WILD WEST TOWN mob
// candidates, one PNG grid. Outlaw gang + frontier critters.
'use strict';
const KIT = require('./west_kit.js');
const { W, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, hat, bandana, gun, badge } = KIT;

// helper: simple cowboy body (legs + torso + arms baseline)
function body(put, S, cx, o) {
  o = o || {};
  const coat = o.coat || [W.leather, W.leatherLt, W.leatherDk];
  // legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.84, S * 0.03, () => o.pants || W.navy);
    // boots
    plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.84, cx + s * S * 0.05 + S * 0.035, S * 0.88, W.leatherDk, W.leather, W.oil);
    put(Math.round(cx + s * S * 0.05), Math.round(S * 0.845), W.brass); // spur point
  });
  // torso
  for (let y = S * 0.42; y < S * 0.64; y++) {
    const t = (y - S * 0.42) / (S * 0.22), w = S * (0.085 + t * 0.01) * (o.wide || 1);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(coat[1], coat[0], clamp(tx * 1.3, 0, 1));
      if (tx > 0.72) b = mix(b, coat[2], 0.6);
      if (o.shirt && Math.abs(tx - 0.5) < 0.08 && t < 0.6) b = mix(b, o.shirt, 0.8);
      return b;
    });
  }
  // belt + buckle
  row(put, Math.round(S * 0.62), cx - S * 0.075, cx + S * 0.075, () => W.leatherDk);
  put(Math.round(cx), Math.round(S * 0.62), W.gold);
}

// 1 · GANG RUSTLER — knife-swarm bandit.
function drawRustler(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { coat: [W.shade, '#5a4a40', W.oil], shirt: W.red });
  // knife arm raised
  stroke(put, cx + S * 0.08, S * 0.46, cx + S * 0.16, S * 0.36, S * 0.02, () => W.shade);
  stroke(put, cx + S * 0.17, S * 0.34, cx + S * 0.21, S * 0.28, 2, () => W.ironLt);
  stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.13, S * 0.56, S * 0.02, () => W.shade);
  // head + low hat + bandana
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  bandana(put, cx, S * 0.37, S * 0.055, W.red, W.redDk);
  hat(put, cx, S * 0.3, S * 0.085, [W.leatherDk, W.leather, W.oil], 0.1);
}

// 2 · SIX-GUN BANDIT — aimed single shots.
function drawBandit(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { coat: [W.navy, W.navyLt, W.navyDk], shirt: '#c8bca0' });
  // gun arm extended
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.18, S * 0.45, S * 0.022, () => W.navy);
  gun(put, cx + S * 0.19, S * 0.445, S * 0.09);
  stroke(put, cx - S * 0.08, S * 0.47, cx - S * 0.12, S * 0.58, S * 0.02, () => W.navy);
  // head + bandana + hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  bandana(put, cx, S * 0.37, S * 0.055, W.navy, W.navyDk);
  hat(put, cx, S * 0.295, S * 0.09, [W.leather, W.leatherLt, W.leatherDk], -0.08);
  // muzzle spark
  put(Math.round(cx + S * 0.29), Math.round(S * 0.44), W.goldLt);
}

// 3 · DYNAMITE DAN — TNT lobber, fuse mortar.
function drawDan(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { coat: [W.red, W.redLt, W.redDk], shirt: '#c8bca0', wide: 1.15 });
  // TNT bundle raised overhead
  stroke(put, cx + S * 0.09, S * 0.45, cx + S * 0.15, S * 0.3, S * 0.024, () => W.red);
  [[-0.02, 0], [0.01, -0.01], [0.04, 0]].forEach(([dx, dy]) => plate(put, cx + S * (0.13 + dx), S * (0.22 + dy), cx + S * (0.155 + dx), S * (0.3 + dy), W.redDk, W.red, W.oil));
  // fuse spark
  stroke(put, cx + S * 0.14, S * 0.21, cx + S * 0.17, S * 0.17, 1.2, () => W.boneDk);
  put(Math.round(cx + S * 0.175), Math.round(S * 0.16), W.goldLt);
  put(Math.round(cx + S * 0.19), Math.round(S * 0.15), W.gold);
  stroke(put, cx - S * 0.09, S * 0.45, cx - S * 0.14, S * 0.55, S * 0.022, () => W.red);
  // wild face + mad grin, no hat — singed hair
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  for (let x = -0.05; x <= 0.05; x += 0.014) { const h = 3 + Math.abs(Math.sin(x * 90)) * 4; for (let d = 0; d < h; d++) put(Math.round(cx + x * S), Math.round(S * 0.29 - d), d > h - 2 ? W.ironDk : W.shade); }
  optic(put, cx - S * 0.02, S * 0.34, S * 0.013, W.oil, W.oil, W.goldLt);
  optic(put, cx + S * 0.02, S * 0.34, S * 0.013, W.oil, W.oil, W.goldLt);
  for (let t = -1; t <= 1; t += 0.2) put(Math.round(cx + t * S * 0.03), Math.round(S * 0.385 + (1 - t * t) * 1.6), W.oil);
}

// 4 · RATTLESNAKE — coiled striker, rattle warn.
function drawRattler(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  // coil (spiral)
  for (let a = 0; a < 13; a += 0.04) {
    const r = S * 0.05 + a * S * 0.012;
    const x = cx + Math.cos(a) * r, y = S * 0.64 + Math.sin(a) * r * 0.5;
    ell(put, x, y, S * 0.028, S * 0.024, (tx, ty) => {
      let b = mix('#b08e5a', '#6e5432', clamp(tx * 0.8 + ty * 0.5, 0, 1));
      if (Math.abs((a * 2.4) % 1) < 0.3) b = mix(b, '#4a3820', 0.6); // diamond pattern
      return b;
    });
  }
  // raised head
  stroke(put, cx + S * 0.1, S * 0.52, cx + S * 0.13, S * 0.36, S * 0.032, () => '#a8865a');
  ell(put, cx + S * 0.14, S * 0.33, S * 0.045, S * 0.035, (tx, ty) => mix('#b08e5a', '#6e5432', tx + ty * 0.4));
  optic(put, cx + S * 0.12, S * 0.325, S * 0.01, W.oil, W.oil, W.gold);
  stroke(put, cx + S * 0.18, S * 0.34, cx + S * 0.21, S * 0.35, 1, () => W.blood); // tongue
  // rattle raised + shake lines
  stroke(put, cx - S * 0.12, S * 0.6, cx - S * 0.18, S * 0.42, S * 0.02, () => '#a8865a');
  [[0, 0], [0.008, -0.045], [0.014, -0.085]].forEach(([dx, dy], i) => ell(put, cx - S * (0.19 + dx * 2), S * (0.4 + dy), S * (0.022 - i * 0.004), S * 0.025, (tx, ty) => mix(W.bone, W.boneDk, ty)));
  [[-0.26, 0.34], [-0.13, 0.3]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), W.boneDk));
}

// 5 · VULTURE — circling diver.
function drawVulture(put, S) {
  const cx = S * 0.5, cy = S * 0.42;
  shadow(put, S, cx, S * 0.18);
  // wings spread wide
  [-1, 1].forEach(s => {
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      stroke(put, cx + s * S * 0.04, cy, cx + s * S * (0.1 + t * 0.24), cy - S * (0.1 - t * 0.16), 2.6, () => t > 0.65 ? W.oil : '#3e342c');
    }
  });
  // body
  ell(put, cx, cy + S * 0.04, S * 0.06, S * 0.09, (tx, ty) => mix('#4a3e34', '#241c14', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // bald pink head on droopy neck
  stroke(put, cx, cy - S * 0.02, cx + S * 0.03, cy - S * 0.1, S * 0.02, () => '#c88a7a');
  ell(put, cx + S * 0.04, cy - S * 0.12, S * 0.032, S * 0.03, (tx, ty) => mix('#d8a090', '#a06858', tx + ty * 0.3));
  stroke(put, cx + S * 0.07, cy - S * 0.115, cx + S * 0.1, cy - S * 0.1, 2, () => W.boneDk); // hooked beak
  put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.095), W.boneDk);
  optic(put, cx + S * 0.035, cy - S * 0.125, S * 0.009, W.oil, W.oil, '#fff');
  // neck ruff
  ell(put, cx, cy - S * 0.015, S * 0.045, S * 0.02, (tx, ty) => mix('#5a4e42', '#2e261e', ty));
  // tail
  for (let i = -1; i <= 1; i++) stroke(put, cx + i * 2, cy + S * 0.12, cx + i * S * 0.03, cy + S * 0.2, 2, () => '#3e342c');
}

// 6 · TUMBLEWEED — wind-blown rolling hazard.
function drawTumbleweed(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.28);
  // tangled ball
  let seed = 5;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 40; i++) {
    const a1 = rnd() * 6.28, a2 = a1 + 0.8 + rnd() * 1.6;
    const r1 = S * (0.08 + rnd() * 0.14), r2 = S * (0.08 + rnd() * 0.14);
    stroke(put, cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1 * 0.9, cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2 * 0.9, 1.2, () => i % 3 ? '#a8865a' : '#6e5432');
  }
  // outer ring hint
  for (let a = 0; a < 6.283; a += 0.1) if (Math.sin(a * 7) > 0) put(Math.round(cx + Math.cos(a) * S * 0.21), Math.round(cy + Math.sin(a) * S * 0.19), '#8a6a40');
  // motion dust behind
  [[-0.32, 0.7], [-0.38, 0.62], [-0.34, 0.78]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.03, S * 0.02, () => W.sandLt));
  // hidden glint eyes (it's ALIVE)
  put(Math.round(cx - S * 0.03), Math.round(cy - S * 0.02), W.gold);
  put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.02), W.gold);
}

// 7 · GILA BRUTE — big beaded lizard charger.
function drawGila(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.32);
  // low heavy body
  for (let t = 0; t <= 1; t += 0.02) {
    const x = cx + (t - 0.5) * S * 0.5;
    const r = S * (0.085 - Math.abs(t - 0.45) * 0.07);
    ell(put, x, S * 0.6, r, r * 0.8, (tx, ty) => {
      const bead = (Math.floor(t * 18) + Math.floor(ty * 5)) % 2;
      let b = bead ? mix('#e88a4a', '#a85a28', tx) : mix('#3a2e28', '#1c1410', tx);
      return mix(b, '#000', ty * 0.3);
    });
  }
  // head w/ open jaw
  ell(put, cx + S * 0.28, S * 0.57, S * 0.06, S * 0.05, (tx, ty) => mix('#3a2e28', '#1c1410', tx * 0.5 + ty * 0.4));
  stroke(put, cx + S * 0.32, S * 0.55, cx + S * 0.38, S * 0.53, 2.4, () => '#3a2e28');
  stroke(put, cx + S * 0.32, S * 0.6, cx + S * 0.38, S * 0.62, 2.4, () => '#2a201a');
  put(Math.round(cx + S * 0.34), Math.round(S * 0.565), W.bone); put(Math.round(cx + S * 0.35), Math.round(S * 0.61), W.bone);
  optic(put, cx + S * 0.27, S * 0.55, S * 0.011, W.oil, W.oil, '#e88a4a');
  // stub legs + claws
  [[-0.15, 0.68], [0.08, 0.7], [0.22, 0.67]].forEach(([dx, dy]) => { ell(put, cx + dx * S, S * dy, S * 0.038, S * 0.03, (tx, ty) => mix('#3a2e28', '#1c1410', ty)); [-1, 0, 1].forEach(f => put(Math.round(cx + dx * S + f * 2), Math.round(S * dy + S * 0.028), W.bone)); });
  // fat tail
  for (let t = 0; t < 1; t += 0.05) ell(put, cx - S * (0.25 + t * 0.12), S * (0.6 - t * 0.02), S * (0.045 * (1 - t * 0.6)), S * 0.035, (tx, ty) => (Math.floor(t * 8) % 2) ? mix('#e88a4a', '#a85a28', ty) : mix('#3a2e28', '#1c1410', ty));
}

// 8 · CROOKED DEPUTY — shotgun cone blaster.
function drawDeputy(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { coat: ['#6e6252', '#968a76', '#443c30'], shirt: '#c8bca0' });
  badge(put, cx - S * 0.04, S * 0.47, S * 0.02, W.brass); // tarnished star
  // double-barrel held level
  stroke(put, cx + S * 0.06, S * 0.48, cx + S * 0.24, S * 0.46, S * 0.02, () => W.ironDk);
  stroke(put, cx + S * 0.06, S * 0.5, cx + S * 0.24, S * 0.48, S * 0.014, () => W.iron);
  stroke(put, cx + S * 0.02, S * 0.5, cx + S * 0.08, S * 0.52, S * 0.02, () => W.leather); // stock
  stroke(put, cx - S * 0.08, S * 0.47, cx - S * 0.02, S * 0.51, S * 0.02, () => '#6e6252');
  // cone spray hint
  [[0.3, 0.42], [0.33, 0.46], [0.31, 0.5]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), W.goldLt));
  // scruffy head + hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  stroke(put, cx + S * 0.008, S * 0.34, cx + S * 0.035, S * 0.34, 1.4, () => W.oil); // squint
  for (let x = -0.03; x <= 0.03; x += 0.01) put(Math.round(cx + x * S), Math.round(S * 0.39), W.shade); // stubble beard line
  hat(put, cx, S * 0.295, S * 0.088, ['#6e6252', '#968a76', '#443c30'], 0);
}

// 9 · CARD SHARK — razor-card arc volleys.
function drawShark(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { coat: [W.oil, '#3a3440', W.oil], shirt: '#f0ece0' });
  // string tie
  put(Math.round(cx), Math.round(S * 0.44), W.red); stroke(put, cx, S * 0.44, cx, S * 0.5, 1, () => W.red);
  // fan of cards in raised hand
  stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.16, S * 0.36, S * 0.02, () => W.oil);
  for (let i = 0; i < 5; i++) {
    const a = -0.7 + i * 0.32;
    const px = cx - S * 0.17 + Math.cos(a - 1.57) * S * 0.05, py = S * 0.34 + Math.sin(a - 1.57) * S * 0.05;
    plate(put, px - 3, py - 5, px + 3, py + 5, i % 2 ? W.white : '#e8e4d8', '#fff', W.boneDk);
    put(Math.round(px), Math.round(py), i % 2 ? W.red : W.oil);
  }
  // one card thrown (motion)
  plate(put, cx + S * 0.24, S * 0.42, cx + S * 0.3, S * 0.46, W.white, '#fff', W.boneDk);
  [[0.18, 0.45], [0.14, 0.46]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), W.boneDk));
  stroke(put, cx + S * 0.08, S * 0.46, cx + S * 0.16, S * 0.44, S * 0.02, () => W.oil);
  // slick head — flat-brim gambler hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix('#e8c8a8', '#b09070', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  stroke(put, cx - S * 0.015, S * 0.385, cx + S * 0.03, S * 0.383, 1.2, () => W.shade); // thin mustache
  ell(put, cx, S * 0.285, S * 0.085, S * 0.02, (tx, ty) => mix('#3a3440', W.oil, tx)); // flat brim
  plate(put, cx - S * 0.05, S * 0.22, cx + S * 0.05, S * 0.285, W.oil, '#3a3440', W.oil);
  row(put, Math.round(S * 0.265), cx - S * 0.05, cx + S * 0.05, () => W.red);
}

// 10 · LASSO WRANGLER — rope-pull snare.
function drawWrangler(put, S) {
  const cx = S * 0.46;
  shadow(put, S, S * 0.5, S * 0.24);
  body(put, S, cx, { coat: [W.leather, W.leatherLt, W.leatherDk], shirt: '#a8c0c8' });
  // chaps fringe
  [-1, 1].forEach(s => { for (let y = S * 0.64; y < S * 0.84; y += 3) put(Math.round(cx + s * S * 0.075), Math.round(y), W.leatherDk); });
  // spinning lasso overhead
  for (let a = 0; a < 6.283; a += 0.06) {
    const x = cx + S * 0.1 + Math.cos(a) * S * 0.16, y = S * 0.22 + Math.sin(a) * S * 0.055;
    put(Math.round(x), Math.round(y), a % 0.5 < 0.25 ? '#c8a060' : '#a8804a');
  }
  stroke(put, cx + S * 0.09, S * 0.45, cx + S * 0.11, S * 0.28, S * 0.02, () => W.leather);
  stroke(put, cx + S * 0.11, S * 0.28, cx + S * 0.13, S * 0.245, 1.4, () => '#c8a060');
  stroke(put, cx - S * 0.09, S * 0.46, cx - S * 0.13, S * 0.56, S * 0.02, () => W.leather);
  // head + hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skinDk, '#7a5636', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  hat(put, cx, S * 0.295, S * 0.09, [W.sand, W.sandLt, W.sandDk], 0.06);
}

// 11 · COYOTE — pack lunger.
function drawCoyote(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // crouched body
  ell(put, cx - S * 0.02, S * 0.58, S * 0.16, S * 0.09, (tx, ty) => mix('#b09468', '#6e5636', clamp(tx * 0.7 + ty * 0.6, 0, 1)));
  // chest lower (pounce-ready)
  ell(put, cx + S * 0.12, S * 0.62, S * 0.08, S * 0.07, (tx, ty) => mix('#c8ac80', '#7e6440', tx + ty * 0.4));
  // legs
  [[0.16, 0.66, 0.18, 0.78], [0.08, 0.66, 0.1, 0.8], [-0.12, 0.64, -0.18, 0.76], [-0.06, 0.64, -0.04, 0.78]].forEach(([x1, y1, x2, y2]) =>
    stroke(put, cx + x1 * S, S * y1, cx + x2 * S, S * y2, S * 0.02, () => '#8a6e46'));
  // head low + ears + snarl
  ell(put, cx + S * 0.21, S * 0.54, S * 0.055, S * 0.045, (tx, ty) => mix('#b09468', '#6e5636', tx * 0.5 + ty * 0.5));
  stroke(put, cx + S * 0.25, S * 0.55, cx + S * 0.31, S * 0.57, S * 0.024, () => '#a8885c'); // snout
  put(Math.round(cx + S * 0.315), Math.round(S * 0.575), W.oil);
  [[0.185, 0.49, -0.2], [0.23, 0.49, 0.2]].forEach(([dx, dy, ln]) => { for (let d = 0; d < 7; d++) put(Math.round(cx + dx * S + ln * d), Math.round(S * dy - d), '#8a6e46'); });
  optic(put, cx + S * 0.21, S * 0.53, S * 0.01, W.oil, W.oil, W.gold);
  // teeth
  put(Math.round(cx + S * 0.28), Math.round(S * 0.585), W.bone); put(Math.round(cx + S * 0.26), Math.round(S * 0.59), W.bone);
  // bushy tail
  for (let t = 0; t < 1; t += 0.06) ell(put, cx - S * (0.18 + t * 0.14), S * (0.56 - t * 0.06), S * (0.035 - t * 0.015), S * 0.028, (tx, ty) => mix('#a8885c', '#5e4626', ty + t * 0.3));
}

// 12 · PROSPECTOR — pickaxe swings + rock tosses.
function drawProspector(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { coat: ['#8a7a5e', '#b0a07e', '#544838'], shirt: W.red, wide: 1.1 });
  // pickaxe overhead
  stroke(put, cx - S * 0.1, S * 0.44, cx + S * 0.02, S * 0.24, 2.6, () => W.wood);
  for (let t = -1; t <= 1; t += 0.05) {
    const x = cx + S * 0.02 + t * S * 0.11, y = S * 0.24 + Math.abs(t) * S * 0.045;
    stroke(put, x, y, x, y, 2.4, () => W.ironDk);
  }
  stroke(put, cx + S * 0.09, S * 0.46, cx + S * 0.05, S * 0.3, S * 0.02, () => '#8a7a5e');
  // big grey beard + bald + tiny hat... prospector slouch hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  for (let y = 0; y < S * 0.08; y++) { const t = y / (S * 0.08), w = S * (0.05 + t * 0.02); row(put, Math.round(S * 0.38 + y), cx - w, cx + w, (tx) => mix('#d8d0c0', '#a8a090', tx * 0.6 + t * 0.3)); }
  optic(put, cx - S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#fff');
  hat(put, cx, S * 0.3, S * 0.08, ['#6e5e46', '#94825e', '#443a28'], 0.14);
  // gold nugget poking from pocket
  put(Math.round(cx - S * 0.05), Math.round(S * 0.6), W.goldLt);
}

// 13 · SALOON BRAWLER — drunk haymaker wobbler.
function drawBrawler(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // big lean body (mid-swing tilt)
  for (let y = S * 0.4; y < S * 0.66; y++) {
    const t = (y - S * 0.4) / (S * 0.26), w = S * 0.115;
    const lean = Math.sin(t * 2) * S * 0.03;
    row(put, Math.round(y), cx - w + lean, cx + w + lean, (tx) => {
      let b = mix('#c8bca0', '#8a7e62', clamp(tx * 1.2, 0, 1));
      if (t > 0.3 && Math.abs(tx - 0.3) < 0.08) b = W.navy; // suspender
      if (t > 0.3 && Math.abs(tx - 0.7) < 0.08) b = W.navy;
      return b;
    });
  }
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.05 + S * 0.02, S * 0.66, cx + s * S * 0.06, S * 0.86, S * 0.032, () => '#5e4a38'); });
  // haymaker fist wound up
  stroke(put, cx + S * 0.1, S * 0.44, cx + S * 0.22, S * 0.36, S * 0.028, () => '#c8bca0');
  ell(put, cx + S * 0.24, S * 0.34, S * 0.04, S * 0.035, (tx, ty) => mix(W.skin, W.skinDk, tx + ty * 0.3));
  stroke(put, cx - S * 0.1, S * 0.46, cx - S * 0.17, S * 0.52, S * 0.026, () => '#c8bca0');
  // bottle in the off hand
  stroke(put, cx - S * 0.18, S * 0.5, cx - S * 0.2, S * 0.44, 2.4, () => '#4a6e3a');
  ell(put, cx - S * 0.18, S * 0.52, S * 0.022, S * 0.03, (tx, ty) => mix('#5a8a48', '#2e4a24', tx + ty * 0.3));
  // flushed face, dazed swirl eyes
  ell(put, cx + S * 0.02, S * 0.34, S * 0.058, S * 0.062, (tx, ty) => mix('#e0a888', '#a87858', clamp(tx + ty * 0.3, 0, 1)));
  put(Math.round(cx + S * 0.05), Math.round(S * 0.36), '#d05a4a'); // red nose
  for (let a = 0; a < 5; a += 0.8) put(Math.round(cx - S * 0.005 + Math.cos(a) * 2.4), Math.round(S * 0.33 + Math.sin(a) * 2.4), W.oil);
  for (let a = 0.4; a < 5.4; a += 0.8) put(Math.round(cx + S * 0.045 + Math.cos(a) * 2.4), Math.round(S * 0.33 + Math.sin(a) * 2.4), W.oil);
  // bowler hat askew
  ell(put, cx - S * 0.005, S * 0.29, S * 0.065, S * 0.018, (tx, ty) => mix('#3a342c', W.oil, tx));
  dome(put, cx - S * 0.005, S * 0.275, S * 0.045, S * 0.035, '#3a342c', '#5a5244', W.oil);
}

// 14 · GATLING GUNNER — elite; deployed sweep lanes.
function drawGatling(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // gatling on tripod
  [[-0.1, 0.85], [0.06, 0.87], [0.16, 0.83]].forEach(([dx, dy]) => stroke(put, cx + S * 0.04, S * 0.66, cx + dx * S, S * dy, 2.4, () => W.ironDk));
  // barrel cluster (pointing right)
  for (let i = -1; i <= 1; i++) stroke(put, cx + S * 0.04, S * 0.6 + i * 3.2, cx + S * 0.3, S * 0.58 + i * 3.2, 2.2, () => i === 0 ? W.ironLt : W.iron);
  ell(put, cx + S * 0.05, S * 0.6, S * 0.045, S * 0.05, (tx, ty) => mix(W.ironLt, W.ironDk, clamp(tx + ty * 0.4, 0, 1))); // breech
  // crank + ammo hopper
  stroke(put, cx + S * 0.02, S * 0.56, cx - S * 0.02, S * 0.52, 2, () => W.brass);
  plate(put, cx + S * 0.02, S * 0.5, cx + S * 0.1, S * 0.56, W.wood, W.woodLt, W.woodDkk);
  // gunner crouched behind
  ell(put, cx - S * 0.12, S * 0.56, S * 0.07, S * 0.09, (tx, ty) => mix(W.navy, W.navyDk, clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.12, S * 0.44, S * 0.045, S * 0.05, (tx, ty) => mix(W.skin, W.skinDk, tx + ty * 0.3));
  optic(put, cx - S * 0.1, S * 0.435, S * 0.01, W.oil, W.oil, '#fff');
  hat(put, cx - S * 0.12, S * 0.4, S * 0.07, [W.navy, W.navyLt, W.navyDk], 0);
  stroke(put, cx - S * 0.07, S * 0.52, cx - S * 0.005, S * 0.54, S * 0.018, () => W.navy); // arm on crank
  // muzzle flashes
  [[0.33, 0.55], [0.35, 0.6]].forEach(([dx, dy]) => { put(Math.round(cx + dx * S), Math.round(S * dy), W.goldLt); put(Math.round(cx + dx * S + 2), Math.round(S * dy), W.gold); });
}

// 15 · LONGHORN — stampede lane charger.
function drawLonghorn(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.32);
  // heavy body
  ell(put, cx - S * 0.03, S * 0.56, S * 0.17, S * 0.11, (tx, ty) => {
    let b = mix('#8a5e3e', '#4e3220', clamp(tx * 0.8 + ty * 0.5, 0, 1));
    if ((tx * 5 | 0) % 2 && (ty * 3 | 0) % 2) b = mix(b, '#e8dcc8', 0.5); // patches
    return b;
  });
  // legs mid-charge
  [[0.1, 0.66, 0.16, 0.8], [0.02, 0.66, -0.02, 0.82], [-0.12, 0.64, -0.2, 0.76], [-0.08, 0.65, -0.1, 0.8]].forEach(([x1, y1, x2, y2]) =>
    stroke(put, cx + x1 * S, S * y1, cx + x2 * S, S * y2, S * 0.024, () => '#5e3e26'));
  // head lowered
  ell(put, cx + S * 0.17, S * 0.6, S * 0.07, S * 0.055, (tx, ty) => mix('#7a5236', '#42280f'.slice(0, 7), clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx + S * 0.21, S * 0.64, S * 0.04, S * 0.03, (tx, ty) => mix('#c8a888', '#8a6a4a', ty)); // muzzle
  put(Math.round(cx + S * 0.2), Math.round(S * 0.645), W.oil); put(Math.round(cx + S * 0.23), Math.round(S * 0.645), W.oil);
  optic(put, cx + S * 0.16, S * 0.585, S * 0.011, W.oil, W.oil, W.blood);
  // THE HORNS — huge spread
  [-1, 1].forEach(s => {
    for (let t = 0; t <= 1; t += 0.03) {
      const x = cx + S * 0.17 + s * t * S * 0.24;
      const y = S * 0.56 - Math.sin(t * 2.4) * S * 0.07 + (s < 0 ? t * S * 0.02 : 0);
      stroke(put, x, y, x, y, Math.max(1, 3.4 * (1 - t)), () => mix(W.bone, W.boneDk, t));
    }
  });
  // dust kicked up
  [[-0.28, 0.72], [-0.34, 0.66]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.035, S * 0.022, () => W.sandLt));
  // tail whip
  for (let t = 0; t < 1; t += 0.06) put(Math.round(cx - S * (0.2 + t * 0.1)), Math.round(S * (0.52 + Math.sin(t * 5) * 0.03)), '#5e3e26');
}

// 16 · DUST DEVIL — living whirlwind, flings grit.
function drawDustDevil(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // spiral column
  for (let y = 0; y < S * 0.55; y++) {
    const t = y / (S * 0.55);
    const w = S * (0.05 + t * 0.16);
    const off = Math.sin(y * 0.12) * S * 0.03 * (1 - t * 0.4);
    row(put, Math.round(S * 0.78 - y), cx - w + off, cx + w + off, (tx) => {
      const band = Math.abs(Math.sin(tx * 9 + y * 0.2));
      if (band < 0.28) return null;
      return mix(W.sandLt, W.sandDk, clamp(tx * 0.6 + band * 0.4 - t * 0.2, 0, 1));
    });
  }
  // flung debris
  [[0.26, 0.4, '#8a6a40'], [-0.28, 0.5, '#6e5432'], [0.3, 0.62, W.cactusDk], [-0.24, 0.28, '#8a6a40']].forEach(([dx, dy, c]) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), c); put(Math.round(cx + dx * S + 1), Math.round(S * dy + 1), c);
  });
  // angry eyes in the swirl
  optic(put, cx - S * 0.03, S * 0.45, S * 0.013, W.oil, W.oil, W.gold);
  optic(put, cx + S * 0.035, S * 0.45, S * 0.013, W.oil, W.oil, W.gold);
  // base dust puffs
  [[-0.14, 0.8], [0.12, 0.82], [0, 0.84]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.05, S * 0.025, () => W.sandLt));
}

// 17 · SNAKE-OIL DOC — buffs mobs with tonic.
function drawDoc(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { coat: ['#5e3a6e', '#8a5aa0', '#38204a'], shirt: '#f0ece0' });
  // tonic bottle raised, sparkling pour
  stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.15, S * 0.34, S * 0.02, () => '#5e3a6e');
  ell(put, cx - S * 0.165, S * 0.3, S * 0.028, S * 0.04, (tx, ty) => mix('#7ee0d0', '#2e8a7a', clamp(tx + ty * 0.4, 0, 1)));
  stroke(put, cx - S * 0.165, S * 0.25, cx - S * 0.165, S * 0.27, 2, () => W.woodLt);
  [[-0.13, 0.22], [-0.1, 0.19], [-0.15, 0.18]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#a8f0e4'));
  // suitcase of bottles at his feet
  plate(put, cx + S * 0.1, S * 0.74, cx + S * 0.26, S * 0.86, W.leather, W.leatherLt, W.leatherDk);
  [[0.14, 0.72], [0.19, 0.71], [0.23, 0.72]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#7ee0d0'));
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.13, S * 0.56, S * 0.02, () => '#5e3a6e');
  // slick head + tall hat
  ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix('#e8c8a8', '#b09070', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  optic(put, cx + S * 0.02, S * 0.34, S * 0.011, W.oil, W.oil, '#fff');
  stroke(put, cx - S * 0.02, S * 0.385, cx + S * 0.035, S * 0.382, 1.4, () => W.shade);
  ell(put, cx, S * 0.29, S * 0.08, S * 0.018, (tx, ty) => mix('#38204a', W.oil, tx));
  plate(put, cx - S * 0.045, S * 0.19, cx + S * 0.045, S * 0.29, '#38204a', '#5e3a6e', W.oil);
  row(put, Math.round(S * 0.265), cx - S * 0.045, cx + S * 0.045, () => '#7ee0d0');
}

// 18 · SCORPION — burrow + sting erupt.
function drawScorpion(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // body segments
  for (let t = 0; t <= 1; t += 0.05) {
    const x = cx - S * 0.08 + t * S * 0.2;
    ell(put, x, S * 0.62, S * (0.05 - t * 0.012), S * 0.035, (tx, ty) => mix('#c8863a', '#7a4a18', clamp(tx * 0.7 + ty * 0.5 + (Math.floor(t * 6) % 2) * 0.2, 0, 1)));
  }
  // tail curling up + over w/ stinger
  for (let t = 0; t <= 1; t += 0.04) {
    const a = t * 2.6;
    const x = cx - S * 0.1 - Math.sin(a) * S * 0.09 + t * S * 0.02;
    const y = S * 0.6 - (1 - Math.cos(a)) * S * 0.12;
    ell(put, x, y, S * (0.022 - t * 0.006), S * 0.02, (tx, ty) => mix('#c8863a', '#7a4a18', tx + ty * 0.3));
  }
  // stinger
  stroke(put, cx - S * 0.14, S * 0.34, cx - S * 0.1, S * 0.3, 2, () => W.oil);
  put(Math.round(cx - S * 0.095), Math.round(S * 0.295), W.blood);
  // pincers forward
  [-1, 1].forEach(s => {
    stroke(put, cx + S * 0.12, S * 0.62 + s * 2, cx + S * 0.2, S * 0.6 + s * S * 0.03, S * 0.02, () => '#a86a28');
    ell(put, cx + S * 0.22, S * 0.6 + s * S * 0.035, S * 0.03, S * 0.02, (tx, ty) => mix('#c8863a', '#7a4a18', tx + ty * 0.3));
  });
  // legs
  [-0.04, 0.02, 0.08].forEach(dx => [-1, 1].forEach(s => stroke(put, cx + dx * S, S * 0.63, cx + dx * S + s * S * 0.05, S * 0.7, 1.6, () => '#8a5a20')));
  optic(put, cx + S * 0.1, S * 0.6, S * 0.009, W.oil, W.oil, W.blood);
  // sand mound (burrow hint)
  ell(put, cx, S * 0.74, S * 0.2, S * 0.035, (tx, ty) => mix(W.sand, W.sandDk, ty));
}

// 19 · THE UNDERTAKER — elite; coffin slam, measures you.
function drawUndertaker(put, S) {
  const cx = S * 0.46;
  shadow(put, S, S * 0.5, S * 0.28);
  // long black coat, tall thin
  for (let y = S * 0.34; y < S * 0.86; y++) {
    const t = (y - S * 0.34) / (S * 0.52), w = S * (0.05 + t * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#2e2a32', W.oil, clamp(tx * 1.2, 0, 1));
      if (Math.abs(tx - 0.5) < 0.05 && t < 0.5) b = '#4a4652'; // button line
      return b;
    });
  }
  // coffin carried on one shoulder
  const cf = [[0.02, 0.22], [0.3, 0.34]];
  for (let t = 0; t <= 1; t += 0.01) {
    const x = cx + lerp(cf[0][0], cf[1][0], t) * S, y = S * lerp(cf[0][1], cf[1][1], t);
    const w = S * (0.045 + Math.sin(t * 3.14) * 0.02);
    stroke(put, x - w, y + w * 0.8, x + w, y - w * 0.8, 3, () => mix(W.woodDk, W.woodDkk, t * 0.5));
  }
  stroke(put, cx + S * 0.02, S * 0.22, cx + S * 0.3, S * 0.34, 1.4, () => W.woodLt); // lid seam
  stroke(put, cx + S * 0.06, S * 0.4, cx + S * 0.12, S * 0.3, S * 0.02, () => '#2e2a32'); // supporting arm
  // measuring tape dangling from other hand
  stroke(put, cx - S * 0.06, S * 0.42, cx - S * 0.12, S * 0.52, S * 0.018, () => '#2e2a32');
  for (let d = 0; d < S * 0.16; d += 2) put(Math.round(cx - S * 0.125), Math.round(S * 0.53 + d), d % 6 < 2 ? W.gold : W.bone);
  // gaunt pale head + stovepipe hat
  ell(put, cx, S * 0.28, S * 0.05, S * 0.058, (tx, ty) => mix('#d8d0c8', '#9a928a', clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.018, S * 0.275, S * 0.012, S * 0.014, () => W.shade); // sunken eyes
  ell(put, cx + S * 0.02, S * 0.275, S * 0.012, S * 0.014, () => W.shade);
  put(Math.round(cx - S * 0.018), Math.round(S * 0.275), '#fff');
  put(Math.round(cx + S * 0.02), Math.round(S * 0.275), '#fff');
  stroke(put, cx - S * 0.02, S * 0.32, cx + S * 0.02, S * 0.32, 1, () => W.oil); // flat line mouth
  ell(put, cx, S * 0.225, S * 0.07, S * 0.014, (tx, ty) => mix('#2e2a32', W.oil, tx));
  plate(put, cx - S * 0.04, S * 0.1, cx + S * 0.04, S * 0.225, W.oil, '#2e2a32', W.oil);
  row(put, Math.round(S * 0.2), cx - S * 0.04, cx + S * 0.04, () => '#4a4652');
}

// 20 · BOUNTY HUNTER — elite duelist; locks eyes, DRAWS.
function drawHunter(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // duster coat, wide stance
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.05, S * 0.6, cx + s * S * 0.08, S * 0.84, S * 0.03, () => W.shade);
    plate(put, cx + s * S * 0.08 - S * 0.03, S * 0.84, cx + s * S * 0.08 + S * 0.035, S * 0.88, W.leatherDk, W.leather, W.oil);
  });
  for (let y = S * 0.4; y < S * 0.66; y++) {
    const t = (y - S * 0.4) / (S * 0.26), w = S * (0.09 + t * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#6e5a48', '#463a2e', clamp(tx * 1.2, 0, 1));
      if (Math.abs(tx - 0.5) < 0.07 && t < 0.5) b = '#8a4a3a'; // shirt
      return b;
    });
  }
  // gun belt low + hand HOVERING at the holster (the draw stance)
  row(put, Math.round(S * 0.63), cx - S * 0.12, cx + S * 0.12, () => W.leatherDk);
  [[-0.06], [0.02], [0.09]].forEach(([dx]) => put(Math.round(cx + dx * S), Math.round(S * 0.635), W.brass)); // bullets
  gun(put, cx + S * 0.13, S * 0.68, S * 0.06, false); // holstered (angled down-ish)
  // hover hand — fingers spread over the grip
  ell(put, cx + S * 0.14, S * 0.6, S * 0.028, S * 0.022, (tx, ty) => mix(W.skin, W.skinDk, ty));
  [-1, 0, 1].forEach(f => stroke(put, cx + S * 0.14 + f * 2, S * 0.61, cx + S * 0.145 + f * 2.6, S * 0.645, 1.2, () => W.skin));
  stroke(put, cx - S * 0.09, S * 0.46, cx - S * 0.13, S * 0.58, S * 0.02, () => '#6e5a48');
  // poncho stripe across chest
  for (let t = 0; t < 1; t += 0.02) put(Math.round(cx - S * 0.09 + t * S * 0.18), Math.round(S * 0.46 + t * S * 0.06), t % 0.2 < 0.1 ? W.red : W.sand);
  // head: flat-crown hat LOW over the eyes, cigar
  ell(put, cx, S * 0.34, S * 0.055, S * 0.06, (tx, ty) => mix(W.skinDk, '#7a5636', clamp(tx + ty * 0.3, 0, 1)));
  // eyes in hat shadow — just glints
  row(put, Math.round(S * 0.33), cx - S * 0.045, cx + S * 0.045, () => W.shade);
  put(Math.round(cx - S * 0.02), Math.round(S * 0.33), W.gold);
  put(Math.round(cx + S * 0.02), Math.round(S * 0.33), W.gold);
  stroke(put, cx + S * 0.04, S * 0.375, cx + S * 0.09, S * 0.37, 1.6, () => W.woodDk); // cigar
  put(Math.round(cx + S * 0.095), Math.round(S * 0.37), '#ff6a3a');
  hat(put, cx, S * 0.3, S * 0.095, ['#3e3428', '#5e5240', W.oil], 0);
  // spur glints
  put(Math.round(cx - S * 0.11), Math.round(S * 0.86), W.goldLt);
}

const LIST = [
  { n: 1, name: 'GANG RUSTLER', role: 'knife swarm', draw: drawRustler },
  { n: 2, name: 'SIX-GUN BANDIT', role: 'aimed shots', draw: drawBandit },
  { n: 3, name: 'DYNAMITE DAN', role: 'TNT lobber', draw: drawDan },
  { n: 4, name: 'RATTLESNAKE', role: 'rattle-warn striker', draw: drawRattler },
  { n: 5, name: 'VULTURE', role: 'circling diver', draw: drawVulture },
  { n: 6, name: 'TUMBLEWEED', role: 'rolling hazard', draw: drawTumbleweed },
  { n: 7, name: 'GILA BRUTE', role: 'lizard charger', draw: drawGila },
  { n: 8, name: 'CROOKED DEPUTY', role: 'shotgun cone', draw: drawDeputy },
  { n: 9, name: 'CARD SHARK', role: 'razor-card volley', draw: drawShark },
  { n: 10, name: 'LASSO WRANGLER', role: 'rope-pull snare', draw: drawWrangler },
  { n: 11, name: 'COYOTE', role: 'pack lunger', draw: drawCoyote },
  { n: 12, name: 'PROSPECTOR', role: 'pickaxe + rocks', draw: drawProspector },
  { n: 13, name: 'SALOON BRAWLER', role: 'drunk haymaker', draw: drawBrawler },
  { n: 14, name: 'GATLING GUNNER', role: 'elite sweep lanes', draw: drawGatling },
  { n: 15, name: 'LONGHORN', role: 'stampede lanes', draw: drawLonghorn },
  { n: 16, name: 'DUST DEVIL', role: 'whirlwind zoner', draw: drawDustDevil },
  { n: 17, name: 'SNAKE-OIL DOC', role: 'buffs mobs', draw: drawDoc },
  { n: 18, name: 'SCORPION', role: 'burrow + sting', draw: drawScorpion },
  { n: 19, name: 'THE UNDERTAKER', role: 'elite coffin slam', draw: drawUndertaker },
  { n: 20, name: 'BOUNTY HUNTER', role: 'elite mini-duelist', draw: drawHunter },
];

renderSheet({ list: LIST, out: process.argv[2] || 'west_mob_options.png', title: 'WILD WEST TOWN — MOB CANDIDATES (pick your roster, any count)', S: 160 });
