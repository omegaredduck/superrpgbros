// artdev/render_grove_mobs.js — render 20 numbered GROVE MOB candidates as a
// PNG grid for the user to pick from (precedent: vault safe, wizard/knight,
// THE CONDUCTOR). Enchanted-forest biome (lush, magical, danger inside
// beauty). Draws with the ranger_art primitives at the yard-mob 48px canvas
// so picked options port straight into world_art.js. Run in the container:
//   NODE_PATH=<global modules> node artdev/render_grove_mobs.js out.png
'use strict';
const path = require('path');
const R = require(path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
const sharp = require('sharp');

const mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan,
      stroke = R.stroke, lerp = R.lerp;

// grove palette — G (leafy greens, warm glow, mushroom reds, honey golds)
const G = {
  OUT: '#1a1c2c',
  leaf: '#38b764', leafLt: '#8ff0a5', leafDk: '#1f6e3f', leafDkk: '#14492a',
  vine: '#2e9e57', vineDk: '#1f6e3f',
  bark: '#5b4636', barkLt: '#7d6450', barkDk: '#3a2c22',
  wood: '#7a4a2b', woodDk: '#4d2f1c',
  moss: '#3f7a3c', mossLt: '#63b25a', mossDk: '#274d26',
  capRed: '#d95763', capRedLt: '#f28d9a', capRedDk: '#9e2835',
  cream: '#f4e3c2', creamDk: '#d8bf94',
  glow: '#6ff0e0', glowLt: '#c8fff4', glowDk: '#2fa998',
  honey: '#ffcd75', honeyLt: '#ffe3a8', honeyDk: '#d7a13a',
  pixie: '#ff77a8', pixieLt: '#ffc2d8', pixieDk: '#c2437a',
  moth: '#e8e8f4', mothDk: '#b0b0cc', mothDkk: '#7d7d9c',
  stone: '#7c8494', stoneLt: '#a4adc0', stoneDk: '#4c5262',
  dirt: '#5b4636', dirtLt: '#7d6450', dirtDk: '#3a2c22',
  boar: '#8a5a2e', boarLt: '#ab7a48', boarDk: '#5e3a1c',
  bee: '#ffd23e', beeDk: '#c89a1e', black: '#0c0d12',
  water: '#41a6f6', waterLt: '#8fd6ff', waterDk: '#2569a8',
  skin: '#e8b796',
  eye: '#12131f', tooth: '#f4f4f4', redEye: '#ff3b30', bone: '#e8e0c8',
  ember: '#ff7d3a', emberLt: '#ffd34d'
};

// --------------------------------------------------------------------------
// 1 · THORNLING — a bramble ball on stub legs, the grove's swarm filler.
function drawThornling(put, S) {
  const cx = S * 0.5, cy = S * 0.55, r = S * 0.26;
  // thorn spikes ringing the ball
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
    const sx = cx + Math.cos(a) * r * 0.9, sy = cy + Math.sin(a) * r * 0.9;
    stroke(put, sx, sy, cx + Math.cos(a) * (r + S * 0.11), cy + Math.sin(a) * (r + S * 0.11),
           S * 0.035, (t) => mix(G.leafDk, G.leafDkk, t));
  }
  // stub legs
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * r * 0.5, cy + r * 0.8, cx + sgn * r * 0.6, S * 0.92, S * 0.05,
           () => G.leafDkk);
  });
  // bramble ball body (woven look: darker weave lines)
  ell(put, cx, cy, r, r * 0.95, (tx, ty) => {
    let b = mix(G.leaf, G.leafDk, clamp(ty * 1.2, 0, 1));
    if (tx < 0.2) b = mix(b, G.leafLt, 0.45);
    return b;
  });
  stroke(put, cx - r * 0.7, cy - r * 0.2, cx + r * 0.5, cy + r * 0.55, 1.2, () => G.leafDkk);
  stroke(put, cx - r * 0.4, cy + r * 0.5, cx + r * 0.7, cy - r * 0.3, 1.2, () => G.leafDkk);
  // glow eyes
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * r * 0.38, cy - r * 0.15, S * 0.045, S * 0.04, () => G.glow);
    put(Math.round(cx + sgn * r * 0.38), Math.round(cy - r * 0.15), G.eye);
  });
  // cross little mouth
  for (let m = -2; m <= 2; m++) put(Math.round(cx + m * 2), Math.round(cy + r * 0.3 + (m % 2)), G.leafDkk);
}

// 2 · PUFFCAP WADDLER — a toddling mushroom; pops a spore cloud on death.
function drawPuffcap(put, S) {
  const cx = S * 0.5;
  // drifting spore motes
  [[0.16, 0.3], [0.85, 0.42], [0.8, 0.2]].forEach(p => {
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.capRedLt);
    put(Math.round(S * p[0]) + 1, Math.round(S * p[1]) + 1, G.cream);
  });
  // stem body
  for (let y = Math.round(S * 0.5); y < Math.round(S * 0.88); y++) {
    const t = (y - S * 0.5) / (S * 0.38);
    const hw = S * (0.13 + 0.05 * Math.sin(t * Math.PI));
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.cream, G.creamDk, clamp(t * 0.9, 0, 1));
      if (tx > 0.75) b = mix(b, G.creamDk, 0.5);
      return b;
    });
  }
  // stub feet
  [-1, 1].forEach(sgn => ell(put, cx + sgn * S * 0.1, S * 0.89, S * 0.06, S * 0.035, () => G.creamDk));
  // stub arms
  [-1, 1].forEach(sgn =>
    stroke(put, cx + sgn * S * 0.15, S * 0.62, cx + sgn * S * 0.24, S * 0.68, S * 0.04, () => G.creamDk));
  // sleepy eyes + tiny mouth on the stem
  [-1, 1].forEach(sgn => {
    row(put, Math.round(S * 0.585), cx + sgn * S * 0.07 - 2, cx + sgn * S * 0.07 + 2, () => G.eye);
  });
  ell(put, cx, S * 0.66, S * 0.018, S * 0.014, () => G.capRedDk);
  // big cap with white spots
  for (let y = Math.round(S * 0.2); y < Math.round(S * 0.52); y++) {
    const t = (y - S * 0.2) / (S * 0.32);
    const hw = S * 0.34 * Math.sin(clamp(0.18 + t * 0.82, 0, 1) * Math.PI * 0.62);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.capRedLt, G.capRed, clamp(t * 1.3, 0, 1));
      if (tx < 0.18) b = mix(b, G.capRedLt, 0.5);
      if (tx > 0.85) b = mix(b, G.capRedDk, 0.4);
      return b;
    });
  }
  row(put, Math.round(S * 0.51), cx - S * 0.33, cx + S * 0.33, () => G.capRedDk);
  // spots
  [[-0.16, 0.3, 0.045], [0.1, 0.25, 0.055], [0.24, 0.4, 0.035], [-0.05, 0.42, 0.03]].forEach(sp => {
    ell(put, cx + sp[0] * S, S * sp[1], S * sp[2], S * sp[2] * 0.8, () => G.cream);
  });
}

// 3 · GLIMMER WISP — a living firefly light; fires slow homing motes.
function drawGlimmerWisp(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // outer glow halo (dithered)
  for (let a = 0; a < Math.PI * 2; a += 0.22) {
    const rr = S * (0.3 + 0.04 * Math.sin(a * 3));
    const x = Math.round(cx + Math.cos(a) * rr), y = Math.round(cy + Math.sin(a) * rr);
    if ((x + y) % 2 === 0) put(x, y, G.glowDk);
  }
  // trailing wisps below
  stroke(put, cx - S * 0.05, cy + S * 0.2, cx - S * 0.16, S * 0.85, S * 0.03,
         (t) => mix(G.glow, G.glowDk, t));
  stroke(put, cx + S * 0.07, cy + S * 0.22, cx + S * 0.16, S * 0.78, S * 0.025,
         (t) => mix(G.glow, G.glowDk, t));
  // little wing hints
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.2, cy - S * 0.12, S * 0.09, S * 0.05, (tx, ty) =>
        mix(G.glowLt, G.glow, ty));
  });
  // bright core
  ell(put, cx, cy, S * 0.17, S * 0.19, (tx, ty) => {
    let b = mix(G.glowLt, G.glow, clamp(ty * 1.1, 0, 1));
    if (tx > 0.75) b = mix(b, G.glowDk, 0.4);
    return b;
  });
  ell(put, cx - S * 0.03, cy - S * 0.05, S * 0.06, S * 0.06, () => '#ffffff');
  // dot eyes on the core
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.06), Math.round(cy), G.eye));
  // homing mote it just fired
  ell(put, S * 0.82, S * 0.7, S * 0.035, S * 0.035, () => G.glowLt);
  put(Math.round(S * 0.78), Math.round(S * 0.74), G.glowDk);
}

// 4 · BRAMBLE BOAR — thorn-hide boar; telegraphed line charge.
function drawBrambleBoar(put, S) {
  const cy = S * 0.58;
  // legs
  [[0.3, 1], [0.42, 0], [0.62, 0], [0.74, 1]].forEach(L => {
    const lx = S * L[0];
    for (let y = Math.round(cy + S * 0.12); y < Math.round(S * 0.9); y++)
      row(put, y, lx - S * 0.035, lx + S * 0.035, (tx) => mix(G.boarDk, G.barkDk, tx));
    row(put, Math.round(S * 0.9), lx - S * 0.045, lx + S * 0.045, () => G.black); // hoof
  });
  // body (long, low)
  ell(put, S * 0.52, cy, S * 0.3, S * 0.2, (tx, ty) => {
    let b = mix(G.boarLt, G.boar, clamp(ty * 1.15, 0, 1));
    if (tx > 0.8) b = mix(b, G.boarDk, 0.5);
    return b;
  });
  // bramble ridge along the spine
  for (let i = 0; i < 5; i++) {
    const bx = S * (0.34 + i * 0.09), by = cy - S * 0.17 - (i % 2) * 2;
    stroke(put, bx, by + S * 0.04, bx - S * 0.02, by - S * 0.06, S * 0.03, () => G.leafDk);
  }
  // head (facing left) + snout + tusks
  ell(put, S * 0.24, cy + S * 0.02, S * 0.13, S * 0.12, (tx, ty) => mix(G.boar, G.boarDk, ty * 0.8));
  ell(put, S * 0.14, cy + S * 0.06, S * 0.06, S * 0.05, (tx, ty) => mix('#d8a0a8', '#a86a74', ty));
  [-1, 1].forEach(sgn => put(Math.round(S * 0.14 + sgn * 2), Math.round(cy + S * 0.06), G.black));
  // tusks curling up
  stroke(put, S * 0.16, cy + S * 0.1, S * 0.1, cy + S * 0.16, S * 0.03, () => G.bone);
  stroke(put, S * 0.1, cy + S * 0.16, S * 0.08, cy + S * 0.1, S * 0.025, () => G.tooth);
  // angry charge eye
  ell(put, S * 0.24, cy - S * 0.04, S * 0.032, S * 0.027, () => G.redEye);
  put(Math.round(S * 0.24), Math.round(cy - S * 0.04), '#ffd0a0');
  row(put, Math.round(cy - S * 0.085), S * 0.2, S * 0.28, () => G.OUT); // brow
  // pawing dust behind
  [[0.86, 0.82], [0.92, 0.76], [0.9, 0.88]].forEach(p =>
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.dirtLt));
}

// 5 · HONEYDEW SPRITE — flees and drips slowing honey puddles.
function drawHoneydewSprite(put, S) {
  const cx = S * 0.46, cy = S * 0.4;
  // honey puddle trail below
  ell(put, S * 0.68, S * 0.88, S * 0.14, S * 0.05, (tx, ty) => mix(G.honeyLt, G.honey, ty));
  ell(put, S * 0.82, S * 0.8, S * 0.07, S * 0.03, () => G.honey);
  // wings (upswept — she's mid-flee)
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.14, cy - S * 0.14, S * 0.1, S * 0.16, (tx, ty) => {
      const b = mix(G.pixieLt, G.glowLt, ty);
      return mix(b, '#ffffff', 0.25);
    });
  });
  // little dress body
  for (let y = Math.round(cy); y < Math.round(cy + S * 0.24); y++) {
    const t = (y - cy) / (S * 0.24);
    const hw = lerp(S * 0.06, S * 0.14, t);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.honey, G.honeyDk, clamp(t, 0, 1));
      if (tx < 0.25) b = mix(b, G.honeyLt, 0.5);
      return b;
    });
  }
  // legs kicking
  stroke(put, cx - S * 0.04, cy + S * 0.24, cx - S * 0.1, cy + S * 0.33, S * 0.025, () => G.skin);
  stroke(put, cx + S * 0.05, cy + S * 0.24, cx + S * 0.03, cy + S * 0.35, S * 0.025, () => G.skin);
  // head + bun
  ell(put, cx, cy - S * 0.09, S * 0.085, S * 0.08, (tx, ty) => mix('#f2d0b0', G.skin, ty));
  ell(put, cx, cy - S * 0.18, S * 0.05, S * 0.04, () => G.honeyDk);
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.035), Math.round(cy - S * 0.1), G.eye));
  // honey pot under one arm, dripping
  ell(put, cx + S * 0.17, cy + S * 0.12, S * 0.075, S * 0.07, (tx, ty) => mix(G.wood, G.woodDk, ty));
  row(put, Math.round(cy + S * 0.06), cx + S * 0.11, cx + S * 0.23, () => G.woodDk);
  ell(put, cx + S * 0.17, cy + S * 0.055, S * 0.045, S * 0.02, () => G.honey);
  stroke(put, cx + S * 0.19, cy + S * 0.19, cx + S * 0.21, cy + S * 0.3, 1.4, () => G.honey);
  put(Math.round(cx + S * 0.21), Math.round(cy + S * 0.33), G.honeyLt);
}

// 6 · ROOTMAW — buried jaws that surface under you and SNAP.
function drawRootmaw(put, S) {
  const cx = S * 0.5;
  // dirt mound
  for (let y = Math.round(S * 0.66); y < Math.round(S * 0.92); y++) {
    const t = (y - S * 0.66) / (S * 0.26);
    const hw = lerp(S * 0.24, S * 0.42, t);
    row(put, y, cx - hw, cx + hw, (tx) => mix(G.dirtLt, G.dirt, clamp(t + tx * 0.2, 0, 1)));
  }
  // cracked earth warn ring hint
  [[-0.36, 0.7], [0.34, 0.74], [-0.28, 0.86], [0.4, 0.86]].forEach(p =>
    stroke(put, cx + p[0] * S, S * p[1], cx + p[0] * S + 4, S * p[1] + 2, 1, () => G.dirtDk));
  // two woody jaws gaping in a V
  // lower jaw
  for (let y = Math.round(S * 0.52); y < Math.round(S * 0.7); y++) {
    const t = (y - S * 0.52) / (S * 0.18);
    const hw = lerp(S * 0.19, S * 0.1, t);
    row(put, y, cx - hw, cx + hw, (tx) => mix(G.bark, G.barkDk, clamp(t + tx * 0.2, 0, 1)));
  }
  // maw darkness
  ell(put, cx, S * 0.44, S * 0.16, S * 0.12, (tx, ty) => mix('#200e0e', G.black, ty * 0.6));
  // upper jaws — two root spikes arcing in from the sides
  stroke(put, cx - S * 0.26, S * 0.16, cx - S * 0.06, S * 0.4, S * 0.06,
         (t) => mix(G.barkLt, G.bark, t));
  stroke(put, cx + S * 0.26, S * 0.14, cx + S * 0.07, S * 0.4, S * 0.06,
         (t) => mix(G.barkLt, G.bark, t));
  // rootlet curls
  stroke(put, cx - S * 0.26, S * 0.16, cx - S * 0.33, S * 0.1, S * 0.03, () => G.bark);
  stroke(put, cx + S * 0.26, S * 0.14, cx + S * 0.34, S * 0.09, S * 0.03, () => G.bark);
  // teeth on both jaws — big bright fangs (they're the whole point)
  for (let ti = -2; ti <= 2; ti++) {
    const tx = Math.round(cx + ti * S * 0.06);
    for (let f = 0; f < 3; f++) { put(tx, Math.round(S * 0.52) + f, G.tooth); put(tx + 1, Math.round(S * 0.52) + f, G.tooth); }
    if (ti % 2 === 0) for (let f = 0; f < 3; f++) { put(tx + 1, Math.round(S * 0.35) + f, G.tooth); put(tx + 2, Math.round(S * 0.35) + f, G.tooth); }
  }
  // fang at each upper-jaw tip
  put(Math.round(cx - S * 0.07), Math.round(S * 0.41), G.tooth);
  put(Math.round(cx + S * 0.08), Math.round(S * 0.41), G.tooth);
  // glow eyes deep in the maw
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.06), Math.round(S * 0.43), G.glow));
}

// 7 · PIXIE TRICKSTER — blinks around you between shot fans.
// pal is optional (recolor hook — Red's pick: a BLUE second pixie).
function drawPixieTrickster(put, S, erase, pal) {
  const p = pal || { main: G.pixie, lt: G.pixieLt, dk: G.pixieDk };
  const cx = S * 0.54, cy = S * 0.42;
  // blink afterimage (ghost copy, dithered)
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    // sparse sparkle trail arc from old position
    }
  ell(put, S * 0.18, S * 0.62, S * 0.07, S * 0.09, (tx, ty) => {
    return (Math.round(tx * 10) + Math.round(ty * 10)) % 2 === 0 ? p.dk : p.main;
  });
  [[0.1, 0.5], [0.26, 0.72], [0.3, 0.52]].forEach(sp =>
    put(Math.round(S * sp[0]), Math.round(S * sp[1]), p.lt));
  // wings
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.15, cy - S * 0.1, S * 0.11, S * 0.15, (tx, ty) =>
        mix(p.lt, '#ffffff', 0.3 + ty * 0.3));
  });
  // body — little tunic
  for (let y = Math.round(cy - S * 0.02); y < Math.round(cy + S * 0.2); y++) {
    const t = (y - cy + S * 0.02) / (S * 0.22);
    const hw = lerp(S * 0.07, S * 0.12, t);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(p.main, p.dk, clamp(t, 0, 1));
      if (tx < 0.25) b = mix(b, p.lt, 0.45);
      return b;
    });
  }
  // legs
  stroke(put, cx - S * 0.03, cy + S * 0.2, cx - S * 0.07, cy + S * 0.32, S * 0.025, () => G.skin);
  stroke(put, cx + S * 0.04, cy + S * 0.2, cx + S * 0.08, cy + S * 0.3, S * 0.025, () => G.skin);
  // head with mischief grin + swept hair
  ell(put, cx, cy - S * 0.1, S * 0.09, S * 0.085, (tx, ty) => mix('#f2d0b0', G.skin, ty));
  ell(put, cx - S * 0.02, cy - S * 0.17, S * 0.09, S * 0.045, (tx, ty) => mix(p.dk, p.main, tx));
  stroke(put, cx + S * 0.06, cy - S * 0.19, cx + S * 0.13, cy - S * 0.24, S * 0.03, () => p.dk);
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.04), Math.round(cy - S * 0.11), G.eye));
  // wide grin
  for (let m = -2; m <= 2; m++) put(Math.round(cx + m), Math.round(cy - S * 0.055 + (Math.abs(m) === 2 ? -1 : 0)), G.capRedDk);
  // a fan of sparkle shots leaving her hand
  [[0.78, 0.3], [0.84, 0.42], [0.8, 0.55]].forEach(sp => {
    put(Math.round(S * sp[0]), Math.round(S * sp[1]), p.lt);
    put(Math.round(S * sp[0]) - 1, Math.round(S * sp[1]), p.main);
  });
  stroke(put, cx + S * 0.1, cy + S * 0.04, cx + S * 0.2, cy, S * 0.03, () => G.skin);
}

// 8 · MOSS GOLEM — regenerating boulder tank.
function drawMossGolem(put, S) {
  const cx = S * 0.5;
  // heavy arms (behind body)
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.2, S * 0.42, cx + sgn * S * 0.36, S * 0.74, S * 0.09,
           (t) => mix(G.stone, G.stoneDk, 0.3 + t * 0.4));
    ell(put, cx + sgn * S * 0.37, S * 0.78, S * 0.08, S * 0.06, (tx, ty) => mix(G.stoneLt, G.stone, ty)); // fist
  });
  // boulder body — stacked stones
  ell(put, cx, S * 0.56, S * 0.26, S * 0.24, (tx, ty) => {
    let b = mix(G.stone, G.stoneDk, clamp(ty * 1.1, 0, 1));
    if (tx < 0.2) b = mix(b, G.stoneLt, 0.5);
    return b;
  });
  ell(put, cx, S * 0.3, S * 0.18, S * 0.14, (tx, ty) => {
    let b = mix(G.stoneLt, G.stone, clamp(ty * 1.2, 0, 1));
    if (tx > 0.75) b = mix(b, G.stoneDk, 0.45);
    return b;
  });
  // stone cracks
  stroke(put, cx - S * 0.14, S * 0.52, cx - S * 0.05, S * 0.62, 1.2, () => G.stoneDk);
  stroke(put, cx + S * 0.08, S * 0.58, cx + S * 0.16, S * 0.68, 1.2, () => G.stoneDk);
  // moss patches (the regen tell — they GLOW faintly while healing)
  [[-0.14, 0.44, 0.1, 0.05], [0.12, 0.68, 0.11, 0.05], [0.02, 0.2, 0.09, 0.04],
   [-0.2, 0.66, 0.07, 0.04]].forEach(mp => {
    ell(put, cx + mp[0] * S, S * mp[1], S * mp[2], S * mp[3], (tx, ty) =>
        mix(G.mossLt, G.moss, ty));
  });
  // hanging moss beard
  for (let i = -2; i <= 2; i++) {
    stroke(put, cx + i * S * 0.05, S * 0.38, cx + i * S * 0.05, S * 0.44 + Math.abs(i % 2) * 2,
           1.4, () => G.moss);
  }
  // deep-set glow eyes
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.07, S * 0.28, S * 0.035, S * 0.03, () => G.glow);
    put(Math.round(cx + sgn * S * 0.07), Math.round(S * 0.28), G.eye);
  });
  // little sprout on top (he's ALIVE alive)
  stroke(put, cx + S * 0.02, S * 0.16, cx + S * 0.02, S * 0.1, 1.2, () => G.vine);
  ell(put, cx + S * 0.05, S * 0.09, S * 0.035, S * 0.025, () => G.leafLt);
  ell(put, cx - S * 0.01, S * 0.08, S * 0.03, S * 0.022, () => G.leaf);
}

// 9 · SEEDLING TURRET — rooted snap-plant, radial seed bursts.
function drawSeedlingTurret(put, S) {
  const cx = S * 0.5;
  // base leaves
  [[-0.28, 0.82, -0.4], [0.28, 0.82, 0.4], [-0.16, 0.86, -0.15], [0.16, 0.86, 0.15]].forEach(L => {
    stroke(put, cx, S * 0.84, cx + L[0] * S * 1.3, S * (L[1] - 0.12), S * 0.05,
           (t) => mix(G.leaf, G.leafDk, t));
  });
  // pot-mound of dirt
  ell(put, cx, S * 0.88, S * 0.2, S * 0.07, (tx, ty) => mix(G.dirtLt, G.dirt, ty));
  // stem (slight S-curve)
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = cx + Math.sin(t * Math.PI * 1.2) * S * 0.05;
    const y = S * (0.84 - t * 0.42);
    ell(put, x, y, S * 0.035, S * 0.03, () => mix(G.vine, G.vineDk, t * 0.5));
  }
  // bud head — open seed mouth
  const hx = cx + Math.sin(Math.PI * 1.2) * S * 0.05, hy = S * 0.34;
  // petal frill behind the head
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ell(put, hx + Math.cos(a) * S * 0.13, hy + Math.sin(a) * S * 0.13, S * 0.055, S * 0.045,
        (tx, ty) => mix(G.honeyLt, G.honey, ty));
  }
  ell(put, hx, hy, S * 0.12, S * 0.11, (tx, ty) => {
    let b = mix(G.leafLt, G.leaf, clamp(ty * 1.2, 0, 1));
    if (tx > 0.75) b = mix(b, G.leafDk, 0.4);
    return b;
  });
  // open mouth full of seeds
  ell(put, hx, hy + S * 0.02, S * 0.06, S * 0.05, () => G.leafDkk);
  put(Math.round(hx - 2), Math.round(hy + S * 0.02), G.honey);
  put(Math.round(hx + 2), Math.round(hy + S * 0.01), G.honey);
  // seeds spraying out radially
  [[0.2, 0.14], [0.78, 0.16], [0.86, 0.5], [0.12, 0.44]].forEach(p => {
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.honeyDk);
    put(Math.round(S * p[0]) + 1, Math.round(S * p[1]) + 1, G.honey);
  });
}

// 10 · LANTERN JACK — will-o'-wisp that PULLS you toward its light.
function drawLanternJack(put, S) {
  const cx = S * 0.44, cy = S * 0.42;
  // pull-swirl lines curving INTO the lantern
  const lx = cx + S * 0.26, ly = cy + S * 0.16;
  for (let a = 0; a < 3; a++) {
    const ang0 = a * 2.1;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const rr = lerp(S * 0.34, S * 0.08, t);
      const an = ang0 + t * 1.8;
      const x = Math.round(lx + Math.cos(an) * rr), y = Math.round(ly + Math.sin(an) * rr * 0.7);
      if (i % 2 === 0) put(x, y, mix(G.glowDk, G.glow, t));
    }
  }
  // wispy ghost body — tapering to trailing tatters
  for (let y = Math.round(cy - S * 0.06); y < Math.round(S * 0.86); y++) {
    const t = (y - cy + S * 0.06) / (S * 0.5);
    let hw = lerp(S * 0.13, S * 0.05, t);
    const wob = Math.sin(t * 9) * S * 0.02;
    if (t < 0.85) row(put, y, cx - hw + wob, cx + hw + wob, (tx) => {
      let b = mix(G.moth, G.mothDk, clamp(t * 1.1, 0, 1));
      if (tx < 0.2) b = mix(b, '#ffffff', 0.35);
      return b;
    });
    else if (y % 2 === 0) row(put, y, cx - hw + wob, cx + hw + wob, () => G.mothDkk); // tatter dither
  }
  // head
  ell(put, cx, cy - S * 0.12, S * 0.1, S * 0.095, (tx, ty) => mix('#ffffff', G.moth, ty));
  // hollow glow eyes
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.04, cy - S * 0.13, S * 0.026, S * 0.03, () => G.glowDk);
    put(Math.round(cx + sgn * S * 0.04), Math.round(cy - S * 0.12), G.glow);
  });
  // arm holding the lantern out
  stroke(put, cx + S * 0.08, cy, lx - S * 0.02, ly - S * 0.08, S * 0.04, () => G.mothDk);
  // the lantern — wood frame, glowing heart
  row(put, Math.round(ly - S * 0.1), lx - S * 0.05, lx + S * 0.05, () => G.woodDk);
  row(put, Math.round(ly + S * 0.08), lx - S * 0.045, lx + S * 0.045, () => G.woodDk);
  stroke(put, lx - S * 0.05, ly - S * 0.1, lx - S * 0.05, ly + S * 0.08, 1.2, () => G.wood);
  stroke(put, lx + S * 0.05, ly - S * 0.1, lx + S * 0.05, ly + S * 0.08, 1.2, () => G.wood);
  ell(put, lx, ly, S * 0.045, S * 0.055, (tx, ty) => mix(G.glowLt, G.glow, ty));
  put(Math.round(lx), Math.round(ly - S * 0.12), G.wood); // hook
}

// 11 · DRYAD ARCHER — bark-skinned archer, piercing thorn bursts.
function drawDryadArcher(put, S) {
  const cx = S * 0.46;
  // legs
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.05, S * 0.66, cx + sgn * S * 0.08, S * 0.9, S * 0.045,
           (t) => mix(G.bark, G.barkDk, t));
  });
  // slender bark body
  for (let y = Math.round(S * 0.38); y < Math.round(S * 0.68); y++) {
    const t = (y - S * 0.38) / (S * 0.3);
    const hw = S * (0.09 + 0.03 * Math.sin(t * Math.PI));
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.barkLt, G.bark, clamp(t * 0.9, 0, 1));
      if (tx < 0.25) b = mix(b, G.barkLt, 0.4);
      if (Math.abs(tx - 0.55) < 0.06) b = mix(b, G.barkDk, 0.4); // grain line
      return b;
    });
  }
  // leaf-skirt at the hip
  [-1, 0, 1].forEach(i => ell(put, cx + i * S * 0.07, S * 0.66, S * 0.05, S * 0.035, () => G.leaf));
  // head + leaf hair
  ell(put, cx, S * 0.3, S * 0.085, S * 0.08, (tx, ty) => mix(G.barkLt, G.bark, ty * 0.9));
  for (let i = -2; i <= 2; i++) {
    ell(put, cx + i * S * 0.045, S * 0.21 - Math.abs(i) * 1.5, S * 0.04, S * 0.03,
        () => (i % 2 ? G.leaf : G.leafLt));
  }
  // calm glow eyes
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.035), Math.round(S * 0.3), G.glow));
  // drawn bow (facing right) — arc + string + nocked thorn arrow
  const bx = cx + S * 0.2;
  for (let a = -1.1; a <= 1.1; a += 0.08) {
    const x = Math.round(bx + Math.cos(a) * S * 0.16), y = Math.round(S * 0.44 + Math.sin(a) * S * 0.2);
    put(x, y, G.wood); put(x + 1, y, G.woodDk);
  }
  stroke(put, bx + Math.cos(-1.1) * S * 0.16, S * 0.44 + Math.sin(-1.1) * S * 0.2,
         bx - S * 0.05, S * 0.44, 1, () => G.tooth);
  stroke(put, bx + Math.cos(1.1) * S * 0.16, S * 0.44 + Math.sin(1.1) * S * 0.2,
         bx - S * 0.05, S * 0.44, 1, () => G.tooth);
  stroke(put, bx - S * 0.06, S * 0.44, bx + S * 0.22, S * 0.44, 1.4, () => G.leafDk); // thorn arrow
  put(Math.round(bx + S * 0.23), Math.round(S * 0.44), G.leafLt);
  // bow arm
  stroke(put, cx + S * 0.07, S * 0.46, bx + S * 0.02, S * 0.44, S * 0.04, () => G.bark);
}

// 12 · SPORE SHAMBLER — elite moss-caked hulk; contact infects (DoT).
// Drawn BIG + THICK like the Conductor Zombie elite (pair with MOB_DISPLAY 60).
function drawSporeShambler(put, S) {
  const cx = S * 0.5;
  // hunched hulk body
  for (let y = Math.round(S * 0.3); y < Math.round(S * 0.9); y++) {
    const t = (y - S * 0.3) / (S * 0.6);
    const hw = lerp(S * 0.3, S * 0.24, Math.abs(t - 0.45) * 1.4);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.moss, G.mossDk, clamp(t * 1.1, 0, 1));
      if (tx < 0.15) b = mix(b, G.mossLt, 0.45);
      if (tx > 0.85) b = mix(b, G.mossDk, 0.4);
      return b;
    });
  }
  // dragging knuckle arms
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.24, S * 0.42, cx + sgn * S * 0.38, S * 0.82, S * 0.08,
           (t) => mix(G.moss, G.mossDk, 0.3 + t * 0.4));
    ell(put, cx + sgn * S * 0.38, S * 0.85, S * 0.07, S * 0.05, () => G.mossDk);
  });
  // mushrooms sprouting from the shoulders/back
  [[-0.2, 0.28], [0.16, 0.24], [0.3, 0.36]].forEach(mp => {
    const mx = cx + mp[0] * S, my = S * mp[1];
    stroke(put, mx, my + S * 0.05, mx, my, S * 0.03, () => G.cream);
    ell(put, mx, my - S * 0.015, S * 0.05, S * 0.035, (tx, ty) => mix(G.capRedLt, G.capRed, ty));
    put(Math.round(mx - 1), Math.round(my - S * 0.03), G.cream);
  });
  // sunken face — droopy glow eyes + slack jaw
  ell(put, cx, S * 0.4, S * 0.14, S * 0.1, (tx, ty) => mix(G.mossLt, G.moss, ty));
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.06, S * 0.385, S * 0.032, S * 0.028, () => G.honeyLt);
    put(Math.round(cx + sgn * S * 0.06), Math.round(S * 0.39), G.eye);
  });
  ell(put, cx, S * 0.47, S * 0.05, S * 0.035, () => G.mossDk); // slack mouth
  // spore motes puffing off him
  [[0.1, 0.16], [0.86, 0.3], [0.82, 0.14], [0.16, 0.34]].forEach(p => {
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.capRedLt);
    if ((p[0] * 10 | 0) % 2) put(Math.round(S * p[0]) + 1, Math.round(S * p[1]) - 1, G.cream);
  });
}

// 13 · THORN FALCON — strafing dive-bomber.
function drawThornFalcon(put, S) {
  const cx = S * 0.52, cy = S * 0.42;
  // motion streaks behind (it's mid-dive, banking left-down)
  [[0.86, 0.18], [0.9, 0.28], [0.82, 0.1]].forEach(p => {
    stroke(put, S * p[0], S * p[1], S * p[0] + S * 0.09, S * p[1] - S * 0.05, 1.2, () => G.mothDkk);
  });
  // swept-back far wing
  stroke(put, cx + S * 0.02, cy - S * 0.02, cx + S * 0.3, cy - S * 0.22, S * 0.07,
         (t) => mix(G.boar, G.boarDk, t));
  // body — a diving teardrop angled to lower-left
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = lerp(cx + S * 0.16, cx - S * 0.18, t);
    const y = lerp(cy - S * 0.1, cy + S * 0.18, t);
    const rr = S * (0.05 + 0.075 * Math.sin(clamp(t * 1.15, 0, 1) * Math.PI));
    ell(put, x, y, rr, rr * 0.9, (tx, ty) => {
      let b = mix(G.boarLt, G.boar, clamp(ty + t * 0.3, 0, 1));
      if (tx < 0.25) b = mix(b, G.honeyLt, 0.2);
      return b;
    });
  }
  // near wing swept up-right
  stroke(put, cx, cy + S * 0.02, cx + S * 0.24, cy - S * 0.3, S * 0.085,
         (t) => mix(G.boarLt, G.boar, t));
  // thorn feathers off the wingtips
  put(Math.round(cx + S * 0.27), Math.round(cy - S * 0.33), G.leafDk);
  put(Math.round(cx + S * 0.33), Math.round(cy - S * 0.24), G.leafDk);
  // tail feathers
  stroke(put, cx + S * 0.14, cy - S * 0.08, cx + S * 0.28, cy - S * 0.02, S * 0.045,
         (t) => mix(G.boar, G.boarDk, t));
  // head at the dive point — beak + eye
  const hx = cx - S * 0.18, hy = cy + S * 0.18;
  ell(put, hx, hy, S * 0.07, S * 0.06, (tx, ty) => mix(G.boarLt, G.boar, ty));
  stroke(put, hx - S * 0.04, hy + S * 0.03, hx - S * 0.12, hy + S * 0.09, S * 0.035,
         (t) => mix(G.honeyDk, G.honey, 1 - t)); // hooked beak
  put(Math.round(hx - S * 0.01), Math.round(hy - S * 0.01), G.redEye);
  // talons tucked
  put(Math.round(hx + S * 0.06), Math.round(hy + S * 0.08), G.honeyDk);
  put(Math.round(hx + S * 0.09), Math.round(hy + S * 0.1), G.honeyDk);
}

// 14 · SNAPDRAGON — anchored dragon-flower; the head lunges on its stem.
function drawSnapdragon(put, S) {
  const bx = S * 0.3;
  // root leaves
  [[-0.14, -0.3], [0.12, 0.3], [0, 0]].forEach(L => {
    stroke(put, bx, S * 0.88, bx + L[0] * S + L[1] * S * 0.4, S * 0.76, S * 0.05,
           (t) => mix(G.leaf, G.leafDk, t));
  });
  ell(put, bx, S * 0.9, S * 0.14, S * 0.05, (tx, ty) => mix(G.dirtLt, G.dirt, ty));
  // long stem whipping right (mid-lunge)
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const x = lerp(bx, S * 0.68, t) + Math.sin(t * Math.PI) * S * 0.06;
    const y = S * (0.86 - t * 0.5) - Math.sin(t * Math.PI * 0.9) * S * 0.1;
    ell(put, x, y, S * (0.045 - t * 0.012), S * 0.035, () => mix(G.vine, G.vineDk, t * 0.4));
  }
  // thorn studs along the stem
  [3, 6, 9, 12].forEach(i => {
    const t = i / 14;
    const x = lerp(bx, S * 0.68, t) + Math.sin(t * Math.PI) * S * 0.06;
    const y = S * (0.86 - t * 0.5) - Math.sin(t * Math.PI * 0.9) * S * 0.1;
    put(Math.round(x), Math.round(y - S * 0.05), G.leafDk);
  });
  // dragon head at the tip — open jaw lunging right
  const hx = S * 0.7, hy = S * 0.32;
  // petal frill behind the skull
  for (let a = 0.6; a < Math.PI * 2; a += Math.PI / 3.2) {
    ell(put, hx - S * 0.06 + Math.cos(a + Math.PI) * S * 0.1, hy + Math.sin(a + Math.PI) * S * 0.1,
        S * 0.055, S * 0.04, (tx, ty) => mix(G.pixieLt, G.pixie, ty));
  }
  // upper jaw
  ell(put, hx, hy - S * 0.035, S * 0.12, S * 0.06, (tx, ty) => {
    let b = mix(G.capRedLt, G.capRed, clamp(ty * 1.2, 0, 1));
    if (tx < 0.3) b = mix(b, G.capRedLt, 0.4);
    return b;
  });
  // lower jaw dropped open
  ell(put, hx + S * 0.02, hy + S * 0.075, S * 0.1, S * 0.045, (tx, ty) => mix(G.capRed, G.capRedDk, ty));
  // maw + fangs
  ell(put, hx + S * 0.04, hy + S * 0.02, S * 0.07, S * 0.035, () => G.black);
  put(Math.round(hx + S * 0.09), Math.round(hy - S * 0.005), G.tooth);
  put(Math.round(hx + S * 0.03), Math.round(hy - S * 0.005), G.tooth);
  put(Math.round(hx + S * 0.06), Math.round(hy + S * 0.05), G.tooth);
  // eye
  put(Math.round(hx - S * 0.05), Math.round(hy - S * 0.05), G.honeyLt);
  put(Math.round(hx - S * 0.05) + 1, Math.round(hy - S * 0.05), G.eye);
}

// 15 · BUMBLEBRUTE — armored bee tank dropping stinger mines.
function drawBumblebrute(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // dropped stinger mines behind
  [[0.12, 0.84], [0.24, 0.9]].forEach(p => {
    stroke(put, S * p[0], S * p[1], S * p[0] + 3, S * p[1] - 3, 1.4, () => G.honeyDk);
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.redEye);
  });
  // wings — small for the bulk (that's the joke)
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.13, cy - S * 0.24, S * 0.1, S * 0.055, (tx, ty) =>
        mix('#ffffff', G.glowLt, 0.4 + ty * 0.3));
  });
  // fat striped abdomen
  for (let y = Math.round(cy - S * 0.16); y < Math.round(cy + S * 0.26); y++) {
    const t = (y - cy + S * 0.16) / (S * 0.42);
    const hw = S * 0.28 * Math.sin(clamp(0.12 + t * 0.88, 0, 1) * Math.PI * 0.85);
    row(put, y, cx - hw, cx + hw, (tx) => {
      const stripe = Math.floor((y - cy + S * 0.16) / (S * 0.085)) % 2 === 0;
      let b = stripe ? mix(G.bee, G.beeDk, clamp(t * 0.7, 0, 1)) : mix('#2a2d3a', G.black, t * 0.5);
      if (tx < 0.15) b = mix(b, stripe ? G.honeyLt : '#4a4e60', 0.5);
      return b;
    });
  }
  // stinger
  stroke(put, cx, cy + S * 0.27, cx, cy + S * 0.36, S * 0.04, (t) => mix(G.honeyDk, G.black, t));
  // armored head plate
  ell(put, cx, cy - S * 0.22, S * 0.14, S * 0.1, (tx, ty) => {
    let b = mix(G.stoneLt, G.stone, clamp(ty * 1.2, 0, 1));
    if (tx < 0.25) b = mix(b, '#cdd6e2', 0.5);
    return b;
  });
  row(put, Math.round(cy - S * 0.22), cx - S * 0.13, cx + S * 0.13, () => G.stoneDk); // visor seam
  // eyes under the plate
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * S * 0.06, cy - S * 0.18, S * 0.03, S * 0.026, () => G.redEye);
    put(Math.round(cx + sgn * S * 0.06), Math.round(cy - S * 0.18), '#ffd0a0');
  });
  // antennae
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.05, cy - S * 0.3, cx + sgn * S * 0.1, cy - S * 0.38, 1.2, () => G.black);
    put(Math.round(cx + sgn * S * 0.1), Math.round(cy - S * 0.39), G.honey);
  });
  // stub legs
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.16, cy + S * 0.18, cx + sgn * S * 0.24, cy + S * 0.28, S * 0.03, () => G.black);
  });
}

// 16 · ACORN KNIGHT — front shield blocks head-on shots; flank it.
function drawAcornKnight(put, S) {
  const cx = S * 0.56, cy = S * 0.52;   // pushed right — the shield owns the left
  // acorn body
  for (let y = Math.round(cy - S * 0.1); y < Math.round(cy + S * 0.28); y++) {
    const t = (y - cy + S * 0.1) / (S * 0.38);
    const hw = S * 0.17 * Math.sin(clamp(0.25 + t * 0.75, 0, 1) * Math.PI * 0.78);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.honeyDk, G.wood, clamp(t * 1.1, 0, 1));
      if (tx < 0.2) b = mix(b, G.honeyLt, 0.35);
      return b;
    });
  }
  put(Math.round(cx), Math.round(cy + S * 0.3), G.woodDk); // acorn tip
  // oak-cap helm (the beret cap of the acorn, pulled low)
  for (let y = Math.round(cy - S * 0.26); y < Math.round(cy - S * 0.06); y++) {
    const t = (y - cy + S * 0.26) / (S * 0.2);
    const hw = lerp(S * 0.12, S * 0.2, Math.sin(t * Math.PI * 0.6));
    row(put, y, cx - hw, cx + hw, (tx, xx) => {
      let b = mix(G.barkLt, G.bark, clamp(t + tx * 0.2, 0, 1));
      if ((xx + y) % 3 === 0) b = mix(b, G.barkDk, 0.35);   // cap texture dots
      return b;
    });
  }
  row(put, Math.round(cy - S * 0.07), cx - S * 0.2, cx + S * 0.2, () => G.barkDk);
  put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.3), G.bark); // stalk
  // visor slit eyes under the cap
  row(put, Math.round(cy - S * 0.02), cx - S * 0.08, cx - S * 0.03, () => G.eye);
  row(put, Math.round(cy - S * 0.02), cx + S * 0.03, cx + S * 0.08, () => G.eye);
  // stub legs
  [-1, 1].forEach(sgn =>
    stroke(put, cx + sgn * S * 0.07, cy + S * 0.26, cx + sgn * S * 0.1, S * 0.9, S * 0.035, () => G.woodDk));
  // twig spear over the shoulder
  stroke(put, cx + S * 0.14, cy + S * 0.1, cx + S * 0.3, cy - S * 0.3, S * 0.025, () => G.wood);
  put(Math.round(cx + S * 0.31), Math.round(cy - S * 0.32), G.leafDk);
  // THE SHIELD — big bark roundshield held to the front (left)
  const shx = cx - S * 0.28, shy = cy + S * 0.02;
  ell(put, shx, shy, S * 0.11, S * 0.19, (tx, ty) => {
    let b = mix(G.barkLt, G.bark, clamp(ty * 1.1, 0, 1));
    if (tx < 0.3) b = mix(b, G.creamDk, 0.3);
    return b;
  });
  // wood-ring detail + iron boss
  ell(put, shx, shy, S * 0.065, S * 0.12, () => G.bark);
  ell(put, shx, shy, S * 0.03, S * 0.05, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
  stroke(put, cx - S * 0.12, cy + S * 0.04, shx + S * 0.06, shy, S * 0.035, () => G.wood); // shield arm
}

// 17 · WICKER WOLF — woven-twig wolf; howls to speed the pack.
function drawWickerWolf(put, S) {
  const cy = S * 0.56;
  // legs (twig bundles)
  [[0.3, 0.02], [0.4, -0.01], [0.6, -0.01], [0.7, 0.02]].forEach(L => {
    const lx = S * L[0];
    stroke(put, lx, cy + S * 0.1, lx + L[1] * S * 8, S * 0.9, S * 0.035,
           (t) => mix(G.barkLt, G.barkDk, t));
  });
  // body — woven trunk, head raised in a HOWL (muzzle up-left)
  ell(put, S * 0.52, cy, S * 0.26, S * 0.15, (tx, ty) => {
    let b = mix(G.barkLt, G.bark, clamp(ty * 1.1, 0, 1));
    return b;
  });
  // weave lines across the body
  for (let i = 0; i < 4; i++) {
    stroke(put, S * (0.32 + i * 0.11), cy - S * 0.12, S * (0.38 + i * 0.11), cy + S * 0.12,
           1.2, () => G.barkDk);
  }
  // ember glow leaking from the weave gaps
  [[0.44, 0.54], [0.56, 0.6], [0.64, 0.52]].forEach(p =>
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.ember));
  // tail — a swept twig broom
  stroke(put, S * 0.76, cy - S * 0.04, S * 0.9, cy - S * 0.16, S * 0.05,
         (t) => mix(G.bark, G.barkDk, t));
  put(Math.round(S * 0.91), Math.round(cy - S * 0.18), G.barkLt);
  // neck + howling head (tilted up-left)
  stroke(put, S * 0.34, cy - S * 0.06, S * 0.24, S * 0.3, S * 0.09,
         (t) => mix(G.barkLt, G.bark, t));
  ell(put, S * 0.23, S * 0.28, S * 0.08, S * 0.07, (tx, ty) => mix(G.barkLt, G.bark, ty));
  // muzzle open skyward
  stroke(put, S * 0.2, S * 0.24, S * 0.12, S * 0.14, S * 0.05, (t) => mix(G.bark, G.barkDk, t));
  stroke(put, S * 0.22, S * 0.3, S * 0.15, S * 0.24, S * 0.035, () => G.barkDk); // lower jaw
  put(Math.round(S * 0.14), Math.round(S * 0.17), G.tooth);
  // ears — twig snags
  stroke(put, S * 0.28, S * 0.24, S * 0.33, S * 0.16, S * 0.03, () => G.barkDk);
  // ember eye
  put(Math.round(S * 0.25), Math.round(S * 0.26), G.ember);
  put(Math.round(S * 0.25) + 1, Math.round(S * 0.26), G.emberLt);
  // howl notes rising
  [[0.06, 0.1], [0.1, 0.05]].forEach(p => {
    put(Math.round(S * p[0]), Math.round(S * p[1]), G.glowLt);
    put(Math.round(S * p[0]) + 1, Math.round(S * p[1]) + 1, G.glow);
  });
}

// 18 · ELDER SPROUT — tiny tree-sage; sprouts fresh Thornlings.
function drawElderSprout(put, S) {
  const cx = S * 0.46;
  // the summoned sproutling breaking ground at his feet
  ell(put, S * 0.78, S * 0.86, S * 0.09, S * 0.04, (tx, ty) => mix(G.dirtLt, G.dirt, ty));
  ell(put, S * 0.78, S * 0.78, S * 0.06, S * 0.05, (tx, ty) => mix(G.leaf, G.leafDk, ty));
  put(Math.round(S * 0.76), Math.round(S * 0.77), G.glow);
  put(Math.round(S * 0.8), Math.round(S * 0.77), G.glow);
  stroke(put, S * 0.74, S * 0.72, S * 0.7, S * 0.66, 1.2, () => G.leafDk); // first thorn
  // robe-like gnarled trunk body
  for (let y = Math.round(S * 0.42); y < Math.round(S * 0.88); y++) {
    const t = (y - S * 0.42) / (S * 0.46);
    const hw = lerp(S * 0.1, S * 0.19, t);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.barkLt, G.bark, clamp(t * 1.05, 0, 1));
      if (tx < 0.2) b = mix(b, G.barkLt, 0.4);
      if (Math.abs(tx - 0.6) < 0.05) b = mix(b, G.barkDk, 0.45); // bark seam
      return b;
    });
  }
  // mossy hem
  row(put, Math.round(S * 0.87), cx - S * 0.19, cx + S * 0.19, () => G.moss);
  // head — knotted burl with a long leaf-beard
  ell(put, cx, S * 0.34, S * 0.1, S * 0.09, (tx, ty) => mix(G.barkLt, G.bark, ty * 0.9));
  // leaf beard cascading
  for (let i = -2; i <= 2; i++) {
    ell(put, cx + i * S * 0.035, S * 0.44 + Math.abs(i) * 1.2, S * 0.032, S * 0.05,
        () => (i % 2 ? G.leaf : G.leafDk));
  }
  ell(put, cx, S * 0.52, S * 0.03, S * 0.045, () => G.leafLt); // beard tip
  // deep kind-but-tired glow eyes + heavy brows
  [-1, 1].forEach(sgn => {
    put(Math.round(cx + sgn * S * 0.04), Math.round(S * 0.33), G.glow);
    row(put, Math.round(S * 0.3), cx + sgn * S * 0.04 - 2, cx + sgn * S * 0.04 + 2, () => G.barkDk);
  });
  // canopy sprig hat
  stroke(put, cx, S * 0.26, cx - S * 0.02, S * 0.18, 1.4, () => G.bark);
  ell(put, cx - S * 0.04, S * 0.16, S * 0.045, S * 0.03, () => G.leafLt);
  ell(put, cx + S * 0.03, S * 0.14, S * 0.04, S * 0.028, () => G.leaf);
  // gnarled staff, raised — mid-summon glow at the tip
  stroke(put, cx + S * 0.18, S * 0.84, cx + S * 0.26, S * 0.3, S * 0.035,
         (t) => mix(G.woodDk, G.wood, t));
  stroke(put, cx + S * 0.26, S * 0.3, cx + S * 0.31, S * 0.24, S * 0.03, () => G.wood); // crook
  ell(put, cx + S * 0.32, S * 0.21, S * 0.035, S * 0.035, () => G.glowLt);
  // arm to the staff
  stroke(put, cx + S * 0.08, S * 0.56, cx + S * 0.19, S * 0.6, S * 0.045, () => G.bark);
}

// 19 · DEWDROP SLIME — crystal slime that splits in two on death.
function drawDewdropSlime(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // the two future halves peeking behind (foreshadowing the split)
  [[-0.3, 0.74], [0.32, 0.76]].forEach(p => {
    ell(put, cx + p[0] * S, S * p[1], S * 0.09, S * 0.075, (tx, ty) => {
      let b = mix(G.waterLt, G.water, clamp(ty * 1.2, 0, 1));
      if (tx < 0.3 && ty < 0.4) b = mix(b, '#ffffff', 0.4);
      return b;
    });
    put(Math.round(cx + p[0] * S - 1), Math.round(S * p[1]), G.eye);
    put(Math.round(cx + p[0] * S + 2), Math.round(S * p[1]), G.eye);
  });
  // main teardrop body
  for (let y = Math.round(S * 0.24); y < Math.round(cy + S * 0.2); y++) {
    const t = (y - S * 0.24) / (cy + S * 0.2 - S * 0.24);
    const hw = S * 0.24 * Math.sin(clamp(Math.pow(t, 0.7), 0, 1) * Math.PI * 0.62);
    row(put, y, cx - hw, cx + hw, (tx) => {
      let b = mix(G.waterLt, G.water, clamp(t * 1.15, 0, 1));
      if (tx > 0.8) b = mix(b, G.waterDk, 0.45);
      return b;
    });
  }
  // base squash
  ell(put, cx, cy + S * 0.18, S * 0.24, S * 0.06, (tx, ty) => mix(G.water, G.waterDk, ty));
  // glass highlight
  ell(put, cx - S * 0.09, S * 0.4, S * 0.05, S * 0.08, () => '#ffffff');
  put(Math.round(cx - S * 0.03), Math.round(S * 0.32), '#ffffff');
  // inner refracted leaf (something it swallowed)
  ell(put, cx + S * 0.06, cy + S * 0.04, S * 0.045, S * 0.03, () => mix(G.leaf, G.water, 0.45));
  // face
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.07), Math.round(cy - S * 0.02), G.eye));
  for (let m = -1; m <= 1; m++) put(Math.round(cx + m), Math.round(cy + S * 0.06), G.waterDk);
  // drip forming at the tip
  put(Math.round(cx), Math.round(S * 0.21), G.waterLt);
}

// 20 · MOONMOTH — phase-shimmers intangible on a rhythm.
function drawMoonmoth(put, S, erase) {
  const cx = S * 0.5, cy = S * 0.5;
  // BIG pale wings — the right one dissolving into phase dither
  [-1, 1].forEach(sgn => {
    // upper lobe
    ell(put, cx + sgn * S * 0.21, cy - S * 0.1, S * 0.18, S * 0.16, (tx, ty) => {
      let b = mix(G.moth, G.mothDk, clamp(ty * 1.05, 0, 1));
      if ((sgn > 0 ? tx : 1 - tx) < 0.25) b = mix(b, '#ffffff', 0.35);
      return b;
    });
    // lower lobe
    ell(put, cx + sgn * S * 0.17, cy + S * 0.14, S * 0.13, S * 0.12, (tx, ty) =>
        mix(G.moth, G.mothDkk, clamp(ty * 1.1, 0, 1)));
  });
  // phase dissolve: dither away the right wing's outer edge (erase only
  // pixels that are INSIDE the wing lobes — no spill into empty space)
  if (erase) for (let y = 0; y < S; y++) for (let x = Math.round(cx + S * 0.24); x < S; x++) {
    const inUp = Math.pow((x - (cx + S * 0.21)) / (S * 0.18), 2) + Math.pow((y - (cy - S * 0.1)) / (S * 0.16), 2) <= 1;
    const inLo = Math.pow((x - (cx + S * 0.17)) / (S * 0.13), 2) + Math.pow((y - (cy + S * 0.14)) / (S * 0.12), 2) <= 1;
    if ((inUp || inLo) && (x + y) % 2 === 0) erase(x, y);
  }
  // moon spots on the left wing
  ell(put, cx - S * 0.22, cy - S * 0.1, S * 0.05, S * 0.05, (tx, ty) => mix(G.glowLt, G.glow, ty));
  ell(put, cx - S * 0.22, cy - S * 0.1, S * 0.022, S * 0.022, () => G.mothDkk);
  ell(put, cx - S * 0.16, cy + S * 0.15, S * 0.035, S * 0.03, () => G.glowDk);
  // crescent marking
  for (let a = -0.9; a <= 0.9; a += 0.18)
    put(Math.round(cx - S * 0.3 + Math.cos(a) * S * 0.035), Math.round(cy + S * 0.02 + Math.sin(a) * S * 0.045), G.glowLt);
  // furry body
  ell(put, cx, cy + S * 0.02, S * 0.06, S * 0.17, (tx, ty) => {
    let b = mix(G.mothDk, G.mothDkk, clamp(ty * 1.1, 0, 1));
    if (tx < 0.3) b = mix(b, G.moth, 0.4);
    return b;
  });
  // fur ruff
  ell(put, cx, cy - S * 0.1, S * 0.075, S * 0.05, (tx, ty) => mix('#ffffff', G.moth, ty));
  // head + glow eyes + feather antennae
  ell(put, cx, cy - S * 0.17, S * 0.05, S * 0.045, (tx, ty) => mix(G.moth, G.mothDk, ty));
  [-1, 1].forEach(sgn => put(Math.round(cx + sgn * S * 0.025), Math.round(cy - S * 0.17), G.glow));
  [-1, 1].forEach(sgn => {
    stroke(put, cx + sgn * S * 0.02, cy - S * 0.21, cx + sgn * S * 0.09, cy - S * 0.32, 1.2, () => G.mothDk);
    for (let f = 1; f <= 3; f++)
      put(Math.round(cx + sgn * (S * 0.02 + f * S * 0.023)), Math.round(cy - S * 0.21 - f * S * 0.037 + 1), G.mothDkk);
  });
}

// --------------------------------------------------------------------------
const MOBS = [
  { n: 1,  name: 'THORNLING',        draw: drawThornling },
  { n: 2,  name: 'PUFFCAP WADDLER',  draw: drawPuffcap },
  { n: 3,  name: 'GLIMMER WISP',     draw: drawGlimmerWisp },
  { n: 4,  name: 'BRAMBLE BOAR',     draw: drawBrambleBoar },
  { n: 5,  name: 'HONEYDEW SPRITE',  draw: drawHoneydewSprite },
  { n: 6,  name: 'ROOTMAW',          draw: drawRootmaw },
  { n: 7,  name: 'PIXIE TRICKSTER',  draw: drawPixieTrickster },
  { n: 8,  name: 'MOSS GOLEM',       draw: drawMossGolem },
  { n: 9,  name: 'SEEDLING TURRET',  draw: drawSeedlingTurret },
  { n: 10, name: 'LANTERN JACK',     draw: drawLanternJack },
  { n: 11, name: 'DRYAD ARCHER',     draw: drawDryadArcher },
  { n: 12, name: 'SPORE SHAMBLER',   draw: drawSporeShambler },
  { n: 13, name: 'THORN FALCON',     draw: drawThornFalcon },
  { n: 14, name: 'SNAPDRAGON',       draw: drawSnapdragon },
  { n: 15, name: 'BUMBLEBRUTE',      draw: drawBumblebrute },
  { n: 16, name: 'ACORN KNIGHT',     draw: drawAcornKnight },
  { n: 17, name: 'WICKER WOLF',      draw: drawWickerWolf },
  { n: 18, name: 'ELDER SPROUT',     draw: drawElderSprout },
  { n: 19, name: 'DEWDROP SLIME',    draw: drawDewdropSlime },
  { n: 20, name: 'MOONMOTH',         draw: drawMoonmoth }
];

// --- FINAL ROSTER (Red's picks 2026-07-14): 2 7 8 9 14 15 20 + BLUE pixie ---
const BLUE_PIXIE_PAL = { main: '#41a6f6', lt: '#8fd6ff', dk: '#2569a8' };
const FINAL = [
  { n: 1, name: 'PUFFCAP WADDLER', draw: drawPuffcap },
  { n: 2, name: 'PIXIE TRICKSTER', draw: drawPixieTrickster },
  { n: 3, name: 'BLUE PIXIE',      draw: (put, S, er) => drawPixieTrickster(put, S, er, BLUE_PIXIE_PAL) },
  { n: 4, name: 'MOSS GOLEM',      draw: drawMossGolem },
  { n: 5, name: 'SEEDLING TURRET', draw: drawSeedlingTurret },
  { n: 6, name: 'SNAPDRAGON',      draw: drawSnapdragon },
  { n: 7, name: 'BUMBLEBRUTE',     draw: drawBumblebrute },
  { n: 8, name: 'MOONMOTH',        draw: drawMoonmoth }
];

async function main() {
  const final = process.argv.includes('--final');
  const LIST = final ? FINAL : MOBS;
  const S = 48, SCALE = 3, CELL = S * SCALE, PAD = 10, LABEL = 26;
  const COLS = final ? 4 : 5, ROWS = final ? 2 : 4;
  const GW = COLS * (CELL + PAD) + PAD, GH = ROWS * (CELL + LABEL + PAD) + PAD;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 15; grid[i * 4 + 1] = 15; grid[i * 4 + 2] = 27; grid[i * 4 + 3] = 255; }

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  LIST.forEach((m, idx) => {
    const cell = Buffer.alloc(S * S * 4);
    const alpha = Buffer.alloc(S * S);
    const put = (x, y, c) => {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= S || y >= S) return;
      const [r, g, b] = hex(c);
      const i = y * S + x;
      cell[i * 4] = r; cell[i * 4 + 1] = g; cell[i * 4 + 2] = b; cell[i * 4 + 3] = 255;
      alpha[i] = 255;
    };
    const erase = (x, y) => {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= S || y >= S) return;
      const i = y * S + x;
      cell[i * 4] = 0; cell[i * 4 + 1] = 0; cell[i * 4 + 2] = 0; cell[i * 4 + 3] = 0;
      alpha[i] = 0;
    };
    m.draw(put, S, erase);
    const [or_, og, ob] = hex(G.OUT);
    R.outlinePass(S, S, (x, y) => alpha[y * S + x],
      (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; });
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const ox = PAD + col * (CELL + PAD), oy = PAD + rowI * (CELL + LABEL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      const si = ((y / SCALE | 0) * S + (x / SCALE | 0)) * 4;
      if (cell[si + 3] === 0) continue;
      const di = ((oy + y) * GW + (ox + x)) * 4;
      grid[di] = cell[si]; grid[di + 1] = cell[si + 1]; grid[di + 2] = cell[si + 2]; grid[di + 3] = 255;
    }
  });

  const texts = LIST.map((m, idx) => {
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const x = PAD + col * (CELL + PAD) + CELL / 2;
    const y = PAD + rowI * (CELL + LABEL + PAD) + CELL + 18;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="13" font-weight="bold" fill="#ffcd75" text-anchor="middle">#${m.n} ${m.name}</text>`;
  }).join('');
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}">${texts}</svg>`);

  const out = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2] : (final ? 'grove_roster_final.png' : 'grove_mob_options.png');
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } })
    .composite([{ input: svg }])
    .png()
    .toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });
