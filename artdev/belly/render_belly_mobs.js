// artdev/belly/render_belly_mobs.js — 20 numbered BELLY OF THE BEAST
// mob candidates, one PNG grid. Everything the titan whale ever
// swallowed: drowned crews, sea creatures, and the gut itself.
// Red pre-requested: fishermen (drowned), lobsters, sea snakes, a
// starfish, a mermaid — "shit like that".
'use strict';
const KIT = require('./belly_kit.js');
const { B, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glowDot, tentacle, fin, drips, wisps } = KIT;

// 1 · DROWNED FISHERMAN — gaff + hooked lure, acid-eaten slicker
function drawFisherman(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // waders + boots
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.045, S * 0.58, cx + s * S * 0.05, S * 0.82, S * 0.036, () => '#3a4a3a');
    plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, '#2a3628', '#3a4a3a', B.oil);
  });
  // slicker coat — drowned yellow, ACID-EATEN (ragged holes)
  for (let y = S * 0.4; y < S * 0.6; y++) {
    const t = (y - S * 0.4) / (S * 0.2), w = S * (0.085 + t * 0.02);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      if (t > 0.5 && ((tx * 11 + y * 0.7) | 0) % 5 === 0) return null; // eaten holes
      let b = mix('#c8b04a', '#8a7628', clamp(tx * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, '#5a4c14', 0.5);
      if (((tx * 9) | 0) % 4 === 0 && t > 0.4) b = mix(b, B.acidDk, 0.4); // acid stains
      return b;
    });
  }
  // rod arm — bent rod, glowing lure dangled at you
  stroke(put, cx + S * 0.08, S * 0.45, cx + S * 0.15, S * 0.36, S * 0.02, () => '#c8b04a');
  for (let t = 0; t < 1; t += 0.06) { const px = cx + S * (0.16 + t * 0.1), py = S * (0.35 - t * 0.1 + t * t * 0.06); put(Math.round(px), Math.round(py), B.woodDk); }
  stroke(put, cx + S * 0.26, S * 0.31, cx + S * 0.24, S * 0.5, 0.8, () => B.sailDk); // line
  glowDot(put, cx + S * 0.24, S * 0.52, S * 0.011, B.red, B.redLt); // hooked lure
  // gaff hook arm
  stroke(put, cx - S * 0.08, S * 0.45, cx - S * 0.15, S * 0.56, S * 0.02, () => '#c8b04a');
  stroke(put, cx - S * 0.155, S * 0.56, cx - S * 0.14, S * 0.64, 1.6, () => B.brassDk);
  // head — sou'wester + pale drowned face, gut-glow eyes
  ell(put, cx, S * 0.34, S * 0.052, S * 0.055, (tx, ty) => mix(B.skinPale, B.skinPaleDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.018, S * 0.33, S * 0.009, B.oil, B.acid, B.acidLt);
  optic(put, cx + S * 0.018, S * 0.33, S * 0.009, B.oil, B.acid, B.acidLt);
  ell(put, cx, S * 0.3, S * 0.065, S * 0.028, (tx, ty) => mix('#c8b04a', '#8a7628', tx + ty * 0.3));
  dome(put, cx, S * 0.285, S * 0.045, S * 0.03, '#c8b04a', '#e0cc70', '#8a7628');
  stroke(put, cx + S * 0.05, S * 0.3, cx + S * 0.085, S * 0.33, 1.6, () => '#8a7628');
  wisps(put, cx - S * 0.12, S * 0.32, 3);
}
// 2 · GUT LOBSTER — big claws, snip charge
function drawLobster(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // segmented tail curling behind
  for (let i = 0; i < 5; i++) {
    const sx = cx + S * (0.08 + i * 0.038), sy = S * (0.58 + i * 0.022);
    ell(put, sx, sy, S * (0.05 - i * 0.007), S * (0.04 - i * 0.005), (tx, ty) => mix(B.shell, B.shellDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  }
  fin(put, cx + S * 0.27, S * 0.68, cx + S * 0.34, S * 0.64, cx + S * 0.32, S * 0.74, B.shell, B.shellDk);
  // carapace w/ wet gloss
  ell(put, cx - S * 0.02, S * 0.54, S * 0.09, S * 0.07, (tx, ty) => {
    let b = mix(B.shellLt, B.shellDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
    if (ty < 0.3) b = mix(b, '#ff9a6a', 0.3);
    return b;
  });
  for (let i = 0; i < 4; i++) stroke(put, cx - S * 0.04 + i * S * 0.035, S * 0.6, cx - S * 0.06 + i * S * 0.04, S * 0.7, 1.2, () => B.shellDk);
  // HUGE claws forward — one open, one closed
  [[-0.16, 0.46, 1], [-0.14, 0.62, 0]].forEach(([dx, dy, open]) => {
    stroke(put, cx - S * 0.08, S * 0.54, cx + dx * S, S * dy, S * 0.024, () => B.shell);
    ell(put, cx + (dx - 0.06) * S, S * dy, S * 0.05, S * 0.035, (tx, ty) => mix(B.shellLt, B.shellDk, clamp(tx + ty * 0.4, 0, 1)));
    if (open) {
      fin(put, cx + (dx - 0.1) * S, S * (dy - 0.03), cx + (dx - 0.14) * S, S * (dy - 0.05), cx + (dx - 0.08) * S, S * (dy - 0.01), B.shellLt, B.shellDk);
      fin(put, cx + (dx - 0.1) * S, S * (dy + 0.03), cx + (dx - 0.14) * S, S * (dy + 0.05), cx + (dx - 0.08) * S, S * (dy + 0.01), B.shell, B.shellDk);
    } else { put(Math.round(cx + (dx - 0.1) * S), Math.round(S * dy), B.shellDk); }
  });
  // stalk eyes + antennae
  [[-0.05], [0.01]].forEach(([dx]) => { stroke(put, cx + dx * S, S * 0.49, cx + dx * S, S * 0.45, 1.2, () => B.shellDk); optic(put, cx + dx * S, S * 0.44, S * 0.007, B.oil, B.oil, '#fff'); });
  [[-1], [1]].forEach(([s]) => stroke(put, cx - S * 0.02, S * 0.48, cx - S * 0.02 + s * S * 0.14, S * 0.36, 0.9, () => B.shellLt));
}
// 3 · SEA SNAKE — banded venom S-strike out of the flesh folds
function drawSeaSnake(put, S) {
  const cx = S * 0.5;
  // flesh fold it slithers out of
  ell(put, cx + S * 0.2, S * 0.6, S * 0.1, S * 0.09, (tx, ty) => mix(B.meat, B.fleshDk, clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx + S * 0.18, S * 0.58, S * 0.045, S * 0.04, () => B.oil);
  // long banded S-body
  for (let t = 0; t < 1; t += 0.025) {
    const px = cx + S * 0.18 - t * S * 0.42, py = S * 0.55 + Math.sin(t * 7.5) * S * 0.07 * (1 - t * 0.3);
    const w = S * (0.016 + Math.sin(Math.min(t * 2.2, 1) * Math.PI * 0.6) * 0.016);
    ell(put, px, py, w, w, (tx, ty) => {
      const band = ((t * 22) | 0) % 2 === 0;
      return band ? mix('#2a3a44', '#101a20', ty) : mix('#c8d0d4', '#7a8a90', ty);
    });
  }
  // head raised to strike
  ell(put, cx - S * 0.25, S * 0.46, S * 0.032, S * 0.026, (tx, ty) => mix('#2a3a44', '#101a20', tx + ty * 0.3));
  optic(put, cx - S * 0.265, S * 0.45, S * 0.007, B.oil, '#d8e84a', '#f8ffb0');
  stroke(put, cx - S * 0.28, S * 0.475, cx - S * 0.31, S * 0.485, 0.9, () => B.redLt); // tongue
  put(Math.round(cx - S * 0.275), Math.round(S * 0.51), B.acid);
  put(Math.round(cx - S * 0.275), Math.round(S * 0.54), B.acid);
}
// 4 · CRIMSON STARFISH — leaps + latches on your face
function drawStarfish(put, S) {
  const cx = S * 0.5, cy = S * 0.52; shadow(put, S, cx, S * 0.22);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    for (let t = 0; t < 1; t += 0.06) {
      const w = S * (0.055 - t * 0.038);
      ell(put, cx + Math.cos(a) * t * S * 0.19, cy + Math.sin(a) * t * S * 0.19, w, w, (tx, ty) => mix('#e05a3a', '#8a2014', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
    }
    for (let t = 0.15; t < 0.95; t += 0.2) put(Math.round(cx + Math.cos(a) * t * S * 0.19), Math.round(cy + Math.sin(a) * t * S * 0.19 - 1), '#ff9a6a');
  }
  ell(put, cx, cy, S * 0.055, S * 0.05, (tx, ty) => mix('#e05a3a', '#8a2014', clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx, cy - S * 0.005, S * 0.013, B.oil, B.gold, B.goldLt);
  [[1, 0.6], [4, 0.7]].forEach(([i]) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    [0.35, 0.55, 0.75].forEach(tt => put(Math.round(cx + Math.cos(a) * tt * S * 0.19), Math.round(cy + Math.sin(a) * tt * S * 0.19 + 2), B.gloss));
  });
  // leap squelch
  [[-0.18, 0.75], [0.16, 0.78]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.01, (tx) => mix(B.meatLt, B.meat, tx)));
}
// 5 · MERMAID — song charm, beckons you into the acid
function drawMermaid(put, S) {
  const cx = S * 0.5;
  // rib-chunk perch
  ell(put, cx + S * 0.06, S * 0.74, S * 0.14, S * 0.08, (tx, ty) => mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // scaled tail curling off it
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx + S * (0.02 + t * 0.2), py = S * (0.62 + Math.sin(t * 2.6) * 0.06 + t * 0.04);
    const w = S * (0.05 - t * 0.032);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      let b = mix(B.scale, B.scaleDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (((t * 16) | 0) % 2) b = mix(b, B.scaleLt, 0.3);
      return b;
    });
  }
  fin(put, cx + S * 0.23, S * 0.68, cx + S * 0.32, S * 0.62, cx + S * 0.3, S * 0.76, B.scaleLt, B.scaleDk);
  // torso
  for (let y = S * 0.44; y < S * 0.62; y++) {
    const t = (y - S * 0.44) / (S * 0.18), w = S * (0.045 + t * 0.015);
    row(put, Math.round(y), cx - S * 0.02 - w, cx - S * 0.02 + w, (tx) => mix(B.skin, B.skinDk, clamp(tx * 1.1 + t * 0.2, 0, 1)));
  }
  [[-0.05], [0.005]].forEach(([dx]) => ell(put, cx + dx * S, S * 0.5, S * 0.018, S * 0.014, (tx, ty) => mix('#c87a8a', '#7a3a4a', tx + ty)));
  // one arm beckoning
  stroke(put, cx - S * 0.05, S * 0.48, cx - S * 0.14, S * 0.4, S * 0.015, () => B.skin);
  stroke(put, cx + S * 0.01, S * 0.48, cx + S * 0.05, S * 0.58, S * 0.014, () => B.skin);
  // head + streaming hair
  ell(put, cx - S * 0.03, S * 0.4, S * 0.042, S * 0.045, (tx, ty) => mix(B.skin, B.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.045, S * 0.39, S * 0.008, B.oil, B.glow, B.glowLt);
  ell(put, cx - S * 0.035, S * 0.425, S * 0.008, S * 0.01, () => B.ink); // singing O
  for (let t = 0; t < 1; t += 0.06) {
    const hx = cx + S * (0.0 + t * 0.1), hy = S * (0.36 + t * 0.22 + Math.sin(t * 6) * 0.015);
    stroke(put, hx, hy, hx + S * 0.03, hy + S * 0.02, S * 0.014, () => (t * 10 | 0) % 2 ? '#6a2a4a' : '#4a1a34');
  }
  // song notes
  [[-0.16, 0.32], [-0.22, 0.26], [-0.12, 0.24]].forEach(([dx, dy], i) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), B.glowLt);
    stroke(put, cx + dx * S + 1, S * dy, cx + dx * S + 1, S * dy - 4, 0.9, () => B.glowLt);
    if (i === 1) put(Math.round(cx + dx * S + 3), Math.round(S * dy - 5), B.white);
  });
}
// 6 · SWALLOWED PIRATE — the ship's crew, cutlass, still fighting
function drawPirate(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // boots + torn breeches
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, S * 0.58, cx + s * S * 0.05, S * 0.8, S * 0.034, () => '#4a3a5a');
    plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.8, cx + s * S * 0.05 + S * 0.035, S * 0.86, B.woodDk, B.wood, B.oil);
  });
  // striped shirt + coat
  for (let y = S * 0.4; y < S * 0.58; y++) {
    const t = (y - S * 0.4) / (S * 0.18), w = S * (0.08 + t * 0.015);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = ((y / (S * 0.022)) | 0) % 2 ? mix(B.white, B.sailDk, tx) : mix(B.red, B.redDk, tx);
      if (tx > 0.8 || tx < 0.2) b = mix('#5a2a2a', '#341418', tx); // coat flaps
      return b;
    });
  }
  // sash + cutlass arm raised
  row(put, Math.round(S * 0.56), cx - S * 0.08, cx + S * 0.08, (tx) => mix(B.gold, B.goldDk, tx));
  stroke(put, cx + S * 0.08, S * 0.44, cx + S * 0.17, S * 0.34, S * 0.018, () => '#5a2a2a');
  // cutlass — curved blade
  for (let t = 0; t < 1; t += 0.05) {
    const bx = cx + S * (0.17 + t * 0.12), by = S * (0.33 - t * 0.1 + t * t * 0.05);
    stroke(put, bx, by, bx + 2, by + 1, 1.6, () => t > 0.85 ? B.white : '#c8d0d4');
  }
  ell(put, cx + S * 0.17, S * 0.345, S * 0.018, S * 0.014, (tx, ty) => mix(B.gold, B.goldDk, ty)); // guard
  // hook hand other side
  stroke(put, cx - S * 0.08, S * 0.44, cx - S * 0.14, S * 0.52, S * 0.017, () => '#5a2a2a');
  stroke(put, cx - S * 0.145, S * 0.52, cx - S * 0.13, S * 0.58, 1.6, () => B.brass);
  // head — bandana + beard + gold tooth grin
  ell(put, cx, S * 0.34, S * 0.05, S * 0.052, (tx, ty) => mix(B.skin, B.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  for (let y = S * 0.36; y < S * 0.4; y++) row(put, Math.round(y), cx - S * 0.035, cx + S * 0.035, (tx) => mix('#3a2418', '#1a0e08', tx)); // beard
  dome(put, cx, S * 0.31, S * 0.05, S * 0.026, B.red, B.redLt, B.redDk); // bandana
  stroke(put, cx + S * 0.05, S * 0.31, cx + S * 0.085, S * 0.35, 1.4, () => B.redDk); // bandana tail
  optic(put, cx - S * 0.018, S * 0.335, S * 0.008, B.oil, B.oil, '#fff');
  put(Math.round(cx + S * 0.018), Math.round(S * 0.335), B.ink); // eyepatch
  stroke(put, cx + S * 0.005, S * 0.32, cx + S * 0.035, S * 0.325, 0.9, () => B.ink);
  put(Math.round(cx - S * 0.01), Math.round(S * 0.365), B.goldLt); // gold tooth
}
// 7 · SKELETON DECKHAND — crew of ships swallowed long ago
function drawDeckhand(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // leg bones
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.035, S * 0.6, cx + s * S * 0.045, S * 0.8, S * 0.018, () => B.bone);
    ell(put, cx + s * S * 0.045, S * 0.82, S * 0.028, S * 0.014, (tx, ty) => mix(B.bone, B.boneDk, tx));
  });
  // ribcage torso w/ tattered vest
  for (let i = 0; i < 5; i++) {
    const y = S * (0.44 + i * 0.032);
    stroke(put, cx - S * (0.07 - i * 0.008), y, cx + S * (0.07 - i * 0.008), y + 1, S * 0.014, () => mix(B.bone, B.boneDk, i * 0.15));
  }
  stroke(put, cx, S * 0.42, cx, S * 0.6, S * 0.014, () => B.boneDk); // spine
  // tattered vest scraps
  [[-0.08, 0.44], [0.07, 0.5]].forEach(([dx, dy]) => fin(put, cx + dx * S, S * dy, cx + (dx - 0.02) * S, S * (dy + 0.1), cx + (dx + 0.03) * S, S * (dy + 0.08), '#4a3a5a', '#2a1e34'));
  // arms — one w/ rusted boarding axe
  stroke(put, cx - S * 0.07, S * 0.46, cx - S * 0.16, S * 0.56, S * 0.013, () => B.bone);
  stroke(put, cx + S * 0.07, S * 0.46, cx + S * 0.15, S * 0.38, S * 0.013, () => B.bone);
  stroke(put, cx + S * 0.15, S * 0.38, cx + S * 0.15, S * 0.28, S * 0.012, () => B.woodDk);
  fin(put, cx + S * 0.15, S * 0.28, cx + S * 0.22, S * 0.3, cx + S * 0.15, S * 0.34, '#8a6a4a', B.brassDk); // rust axe head
  // skull — jaw agape
  ell(put, cx, S * 0.34, S * 0.048, S * 0.05, (tx, ty) => mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.018, S * 0.33, S * 0.011, S * 0.013, () => B.oil);
  ell(put, cx + S * 0.018, S * 0.33, S * 0.011, S * 0.013, () => B.oil);
  put(Math.round(cx - S * 0.018), Math.round(S * 0.332), B.glow); // dead glints
  put(Math.round(cx + S * 0.018), Math.round(S * 0.332), B.glow);
  ell(put, cx, S * 0.395, S * 0.026, S * 0.018, (tx, ty) => mix(B.boneDk, B.oil, ty)); // dropped jaw
  for (let i = -2; i <= 2; i++) put(Math.round(cx + i * S * 0.012), Math.round(S * 0.375), B.tooth);
}
// 8 · SHIP RAT PACK — swarm off the wreck
function drawRats(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // three rats mid-scurry
  [[-0.14, 0.6, 1], [0.06, 0.55, -1], [0.16, 0.68, 1]].forEach(([dx, dy, dir], i) => {
    const rx = cx + dx * S, ry = S * dy, sc = 1 - i * 0.12;
    // body
    ell(put, rx, ry, S * 0.055 * sc, S * 0.035 * sc, (tx, ty) => {
      let b = mix('#6a5a4a', '#342a20', clamp(tx * (dir > 0 ? 1 : -1) * 0.5 + 0.5 + ty * 0.4, 0, 1));
      return b;
    });
    // head + ears + nose
    ell(put, rx + dir * S * 0.05 * sc, ry - S * 0.012, S * 0.028 * sc, S * 0.022 * sc, (tx, ty) => mix('#6a5a4a', '#342a20', tx + ty * 0.3));
    ell(put, rx + dir * S * 0.035 * sc, ry - S * 0.035, S * 0.012 * sc, S * 0.012 * sc, (tx, ty) => mix('#8a7460', '#4a3a2c', ty));
    put(Math.round(rx + dir * S * 0.075 * sc), Math.round(ry - S * 0.014), '#e88a9a'); // nose
    optic(put, rx + dir * S * 0.055 * sc, ry - S * 0.02, S * 0.006, B.oil, B.red, B.redLt);
    // naked tail
    for (let t = 0; t < 1; t += 0.08) put(Math.round(rx - dir * S * (0.05 + t * 0.09) * sc), Math.round(ry + Math.sin(t * 5) * S * 0.015), '#c88a8a');
    // feet skitter
    [[-0.02], [0.02]].forEach(([fx]) => stroke(put, rx + fx * S, ry + S * 0.03, rx + fx * S - dir * S * 0.012, ry + S * 0.05, 1, () => '#342a20'));
  });
  // nibbled hardtack crumb
  ell(put, cx - S * 0.02, S * 0.72, S * 0.02, S * 0.012, (tx, ty) => mix(B.sail, B.sailDk, tx));
}
// 9 · BILGE PARROT — the crew's parrot, dive-pecks, screeches
function drawParrot(put, S) {
  const cx = S * 0.5;
  // perch: broken spar w/ rope
  stroke(put, cx - S * 0.2, S * 0.72, cx + S * 0.22, S * 0.66, S * 0.02, () => B.wood);
  stroke(put, cx + S * 0.1, S * 0.64, cx + S * 0.12, S * 0.74, 1.2, () => B.rope);
  // body — ragged red macaw gone feral
  ell(put, cx, S * 0.48, S * 0.06, S * 0.09, (tx, ty) => {
    let b = mix(B.red, B.redDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
    if (ty > 0.7) b = mix(b, B.gold, 0.3);
    return b;
  });
  // wing flared
  fin(put, cx + S * 0.04, S * 0.42, cx + S * 0.17, S * 0.5, cx + S * 0.06, S * 0.56, '#3a6ac8', '#1a3a7a');
  fin(put, cx + S * 0.05, S * 0.44, cx + S * 0.14, S * 0.44, cx + S * 0.05, S * 0.52, B.red, B.redDk);
  // tail feathers down past the spar
  for (let i = -1; i <= 1; i++) stroke(put, cx + S * 0.01 + i * 2, S * 0.56, cx + S * (0.02 + i * 0.02), S * 0.72, 1.4, () => i === 0 ? '#3a6ac8' : B.redDk);
  // head cocked, mean eye
  ell(put, cx - S * 0.01, S * 0.37, S * 0.04, S * 0.042, (tx, ty) => mix(B.red, B.redDk, clamp(tx + ty * 0.3, 0, 1)));
  ell(put, cx - S * 0.03, S * 0.36, S * 0.018, S * 0.02, (tx, ty) => mix(B.white, B.sailDk, ty)); // face patch
  optic(put, cx - S * 0.028, S * 0.36, S * 0.008, B.oil, B.gold, B.goldLt);
  // big hooked beak open mid-screech
  fin(put, cx - S * 0.045, S * 0.385, cx - S * 0.1, S * 0.4, cx - S * 0.04, S * 0.415, '#c8d0d4', '#5a6068');
  fin(put, cx - S * 0.045, S * 0.415, cx - S * 0.08, S * 0.435, cx - S * 0.035, S * 0.43, '#8a929a', '#3a4048');
  // screech lines
  [[-0.14, 0.36], [-0.16, 0.4]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx - 0.03) * S, S * dy, 1, () => B.white));
  // claws
  [[-0.02], [0.03]].forEach(([fx]) => stroke(put, cx + fx * S, S * 0.56, cx + fx * S, S * 0.66, 1.2, () => '#8a8268'));
}
// 10 · GUT CRAB — armored scuttler, blocks frontal
function drawCrab(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // wide carapace — barnacled, gut-stained
  ell(put, cx, S * 0.54, S * 0.13, S * 0.085, (tx, ty) => {
    let b = mix('#a86a3a', '#5a3014', clamp(tx * 0.9 + ty * 0.5, 0, 1));
    if (ty < 0.25) b = mix(b, '#d89a5a', 0.35);
    if (((tx * 13 + ty * 7) | 0) % 6 === 0) b = mix(b, B.meatDk, 0.3); // gut stains
    return b;
  });
  // barnacle bumps on shell
  [[-0.06, 0.48], [0.04, 0.46], [0.09, 0.52]].forEach(([dx, dy]) => { ell(put, cx + dx * S, S * dy, S * 0.014, S * 0.01, (tx, ty) => mix(B.bone, B.boneDk, ty)); put(Math.round(cx + dx * S), Math.round(S * dy), B.oil); });
  // legs both sides
  for (let i = 0; i < 3; i++) {
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.11, S * (0.56 + i * 0.02), cx + s * S * (0.19 + i * 0.015), S * (0.62 + i * 0.035), 1.5, () => '#7a4620');
      stroke(put, cx + s * S * (0.19 + i * 0.015), S * (0.62 + i * 0.035), cx + s * S * (0.16 + i * 0.015), S * (0.7 + i * 0.03), 1.3, () => '#5a3014');
    });
  }
  // shield claws held up front
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.09, S * 0.64, S * 0.05, S * 0.04, (tx, ty) => mix('#c87a3a', '#5a3014', clamp(tx + ty * 0.4, 0, 1)));
    fin(put, cx + s * S * 0.11, S * 0.61, cx + s * S * 0.15, S * 0.58, cx + s * S * 0.12, S * 0.64, '#d89a5a', '#5a3014');
  });
  // stalk eyes
  [[-0.03], [0.03]].forEach(([dx]) => { stroke(put, cx + dx * S, S * 0.47, cx + dx * S, S * 0.42, 1.3, () => '#7a4620'); optic(put, cx + dx * S, S * 0.41, S * 0.008, B.oil, B.oil, '#fff'); });
  // angry bubbles
  [[-0.01, 0.5]].forEach(([dx, dy]) => wisps(put, cx + dx * S, S * dy - 8, 2));
}
// 11 · ACID SLUG — digestive slime lobber, burn trail
function drawSlug(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // slime trail behind
  for (let t = 0; t < 1; t += 0.08) ell(put, cx + S * (0.1 + t * 0.2), S * (0.7 + t * 0.02), S * 0.03 * (1 - t * 0.5), S * 0.012, (tx) => mix(B.acid, B.acidDk, tx * 0.7 + t * 0.3));
  // fat glossy body
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx - S * 0.12 + t * S * 0.26, py = S * 0.62 - Math.sin(t * Math.PI) * S * 0.05;
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.05);
    ell(put, px, py, w, w * 0.9, (tx, ty) => {
      let b = mix(B.acid, B.acidDk, clamp(tx * 0.8 + ty * 0.6, 0, 1));
      if (ty < 0.3) b = mix(b, B.acidLt, 0.45); // wet sheen
      if (((t * 12) | 0) % 3 === 0) b = mix(b, B.bileDk, 0.3); // mottling
      return b;
    });
  }
  // raised head end + eye stalks
  ell(put, cx - S * 0.13, S * 0.54, S * 0.04, S * 0.045, (tx, ty) => mix(B.acid, B.acidDk, clamp(tx + ty * 0.4, 0, 1)));
  [[-0.17, -0.01], [-0.14, -0.03]].forEach(([dx, dy]) => {
    stroke(put, cx + dx * S + S * 0.02, S * 0.52, cx + dx * S, S * (0.46 + dy), 1.2, () => B.acidDk);
    glowDot(put, cx + dx * S, S * (0.45 + dy), S * 0.006, B.bile, B.acidLt);
  });
  // acid glob mid-lob
  glowDot(put, cx - S * 0.24, S * 0.38, S * 0.016, B.acid, B.acidLt);
  drips(put, cx - S * 0.24, S * 0.42, 2);
}
// 12 · BILE JELLY — drifting stinger, pops on contact
function drawJelly(put, S) {
  const cx = S * 0.5;
  // bell — sickly bile glow
  dome(put, cx, S * 0.38, S * 0.13, S * 0.11, B.bile, '#e8f47a', B.bileDk);
  ell(put, cx, S * 0.36, S * 0.09, S * 0.06, (tx, ty) => mix('#e8f47a', B.bile, ty));
  glowDot(put, cx, S * 0.34, S * 0.015, '#e8f47a', B.white);
  // gut-acid core visible inside
  ell(put, cx, S * 0.4, S * 0.04, S * 0.03, (tx, ty) => mix(B.acid, B.acidDk, ty));
  // trailing stingers
  for (let i = -3; i <= 3; i++) {
    const tx0 = cx + i * S * 0.035;
    for (let t = 0; t < 1; t += 0.06) {
      const px = tx0 + Math.sin(t * 6 + i) * S * 0.014, py = S * 0.46 + t * S * 0.34;
      put(Math.round(px), Math.round(py), t % 0.24 < 0.12 ? '#e8f47a' : B.bileDk);
    }
  }
  [[-0.08, 0.66], [0.06, 0.74], [0.11, 0.6]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.white));
}
// 13 · BARNACLE TURRET — latched to the gut wall, spits acid (NOT PICKED)
function drawBarnacle(put, S) {
  const cx = S * 0.5;
  // flesh wall patch it grips
  for (let y = S * 0.55; y < S * 0.8; y++) {
    const t = (y - S * 0.55) / (S * 0.25);
    row(put, Math.round(y), cx - S * 0.2, cx + S * 0.2, (tx) => {
      let b = mix(B.meat, B.fleshDk, clamp(tx * 0.7 + t * 0.4, 0, 1));
      if (((tx * 9 + y * 0.3) | 0) % 4 === 0) b = mix(b, B.meatLt, 0.25); // wet folds
      return b;
    });
  }
  // volcano-shell cluster: one big + two small
  [[0, 0.58, 0.09], [-0.13, 0.66, 0.05], [0.12, 0.68, 0.045]].forEach(([dx, dy, r]) => {
    for (let y = S * (dy - r * 0.9); y < S * (dy + r * 0.6); y++) {
      const t = (y - S * (dy - r * 0.9)) / (S * r * 1.5);
      const w = S * r * (0.4 + t * 0.6);
      row(put, Math.round(y), cx + dx * S - w, cx + dx * S + w, (tx) => {
        let b = mix(B.bone, B.boneDkk, clamp(tx * 1.1, 0, 1));
        if (((tx * 8) | 0) % 2) b = mix(b, B.boneDk, 0.5); // plate ridges
        return b;
      });
    }
    // maw hole
    ell(put, cx + dx * S, S * (dy - r * 0.75), S * r * 0.45, S * r * 0.3, () => B.oil);
  });
  // the big one's feather-arm out, acid spit arc
  for (let t = 0; t < 1; t += 0.08) {
    const px = cx + Math.sin(t * 3) * S * 0.02, py = S * (0.49 - t * 0.06);
    stroke(put, px, py, px + S * 0.03, py - S * 0.02, 1, () => B.shellDk);
  }
  glowDot(put, cx - S * 0.02, S * 0.36, S * 0.013, B.acid, B.acidLt);
  drips(put, cx - S * 0.02, S * 0.4, 3);
  optic(put, cx + S * 0.028, S * 0.545, S * 0.008, B.oil, B.red, B.redLt); // eye in the maw
}
// 14 · GUT SHARK — swallowed whole, hunts the acid pools
function drawShark(put, S) {
  const cx = S * 0.5;
  // acid pool
  ell(put, cx + S * 0.02, S * 0.68, S * 0.24, S * 0.06, (tx, ty) => mix(B.acid, B.acidDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // body arcing out of the pool
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx - S * 0.16 + t * S * 0.36, py = S * 0.56 + Math.sin(t * 2.4) * S * 0.03;
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.05);
    ell(put, px, py, w, w * 0.85, (tx, ty) => {
      let b = mix('#7a8a9a', '#3a4452', clamp(ty * 1.4, 0, 1));
      if (ty > 0.6) b = mix(b, B.white, 0.35);
      if (((t * 14) | 0) % 5 === 0) b = mix(b, B.acidDk, 0.3); // acid burns
      return b;
    });
  }
  // head + jaws breaching at you
  ell(put, cx - S * 0.18, S * 0.53, S * 0.05, S * 0.045, (tx, ty) => mix('#7a8a9a', '#3a4452', tx + ty * 0.3));
  // open jaw w/ teeth rows
  for (let y = S * 0.52; y < S * 0.6; y++) {
    const t = (y - S * 0.52) / (S * 0.08);
    row(put, Math.round(y), cx - S * (0.26 - t * 0.03), cx - S * 0.17, (tx) => mix(B.meatDk, B.redDk, tx * 0.5));
  }
  for (let i = 0; i < 5; i++) { put(Math.round(cx - S * (0.25 - i * 0.016)), Math.round(S * 0.525), B.tooth); put(Math.round(cx - S * (0.24 - i * 0.016)), Math.round(S * 0.595), B.tooth); }
  optic(put, cx - S * 0.16, S * 0.5, S * 0.009, B.oil, B.oil, '#fff');
  // dorsal + tail
  fin(put, cx, S * 0.5, cx + S * 0.06, S * 0.36, cx - S * 0.05, S * 0.5, '#5a6a7a', '#2a3440');
  fin(put, cx + S * 0.2, S * 0.56, cx + S * 0.3, S * 0.44, cx + S * 0.28, S * 0.62, '#5a6a7a', '#2a3440');
  // pool ripples
  [[-0.14, 0.68], [0.18, 0.7]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.07) * S, S * dy, 1, () => B.acidLt));
}
// 15 · HAGFISH — slime-coil zoner, chokes the lanes
function drawHagfish(put, S) {
  const cx = S * 0.5;
  // slime blob base
  ell(put, cx + S * 0.05, S * 0.68, S * 0.16, S * 0.05, (tx, ty) => mix('#a8c8b0', '#5a7a62', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // knotted pink-grey body — writhing overhand knot
  const path = [[-0.2, 0.55], [-0.08, 0.45], [0.06, 0.5], [0.12, 0.6], [0.02, 0.64], [-0.06, 0.58], [0.04, 0.52], [0.16, 0.48], [0.24, 0.54]];
  for (let i = 0; i < path.length - 1; i++) {
    const [x0, y0] = path[i], [x1, y1] = path[i + 1];
    for (let t = 0; t < 1; t += 0.07) {
      const w = S * 0.026;
      ell(put, cx + (x0 + (x1 - x0) * t) * S, S * (y0 + (y1 - y0) * t), w, w * 0.9, (tx, ty) => {
        let b = mix('#c8a0a8', '#6a4a52', clamp(tx * 0.8 + ty * 0.5, 0, 1));
        if (ty < 0.3) b = mix(b, B.gloss, 0.4); // slick sheen
        return b;
      });
    }
  }
  // eyeless head + tooth rasp + barbels
  ell(put, cx - S * 0.21, S * 0.53, S * 0.032, S * 0.028, (tx, ty) => mix('#c8a0a8', '#6a4a52', tx + ty * 0.3));
  ell(put, cx - S * 0.235, S * 0.535, S * 0.012, S * 0.012, () => B.meatDk); // rasp mouth
  for (let a = 0; a < 6.28; a += 1.05) put(Math.round(cx - S * 0.235 + Math.cos(a) * 2), Math.round(S * 0.535 + Math.sin(a) * 2), B.tooth);
  [[-1, -0.02], [1, 0.02], [-1, 0.04]].forEach(([s, dy]) => stroke(put, cx - S * 0.23, S * (0.52 + dy), cx - S * 0.27, S * (0.51 + dy + s * 0.01), 0.9, () => '#6a4a52'));
  // slime strands dripping off the coils
  [[-0.05, 0.62], [0.1, 0.64], [0.2, 0.58]].forEach(([dx, dy]) => { stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy + 0.08), 1, () => '#a8c8b0'); put(Math.round(cx + dx * S), Math.round(S * (dy + 0.1)), '#d8f0e0'); });
}
// 16 · LAMPREY — launches + latches, drains you
function drawLamprey(put, S) {
  const cx = S * 0.5;
  // body S-curve lunging up-forward
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx + S * (0.18 - t * 0.34), py = S * (0.66 - t * 0.22 + Math.sin(t * 5) * 0.03 * (1 - t));
    const w = S * (0.02 + Math.sin(Math.min(t * 2, 1) * Math.PI * 0.6) * 0.022);
    ell(put, px, py, w, w, (tx, ty) => {
      let b = mix('#5a6a8a', '#242c44', clamp(tx + ty * 0.4, 0, 1));
      if (((t * 18) | 0) % 4 === 0) b = mix(b, '#8a9ab8', 0.25);
      return b;
    });
  }
  // gill ports down the neck
  for (let i = 0; i < 5; i++) put(Math.round(cx - S * (0.1 + i * 0.018)), Math.round(S * (0.5 - i * 0.014)), B.oil);
  // the MOUTH — front-facing sucker disc ringed with teeth
  ell(put, cx - S * 0.18, S * 0.42, S * 0.05, S * 0.05, (tx, ty) => mix(B.meatLt, B.meatDk, clamp((Math.hypot(tx - 0.5, ty - 0.5) * 2), 0, 1)));
  ell(put, cx - S * 0.18, S * 0.42, S * 0.022, S * 0.022, () => B.oil); // throat
  for (let a = 0; a < 6.28; a += 0.45) {
    put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.035), Math.round(S * 0.42 + Math.sin(a) * S * 0.035), B.tooth);
    if ((a * 2 | 0) % 2) put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.018), Math.round(S * 0.42 + Math.sin(a) * S * 0.018), B.gold);
  }
  optic(put, cx - S * 0.14, S * 0.38, S * 0.008, B.oil, B.red, B.redLt);
  // launch splash
  [[0.16, 0.68], [0.22, 0.64]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.05) * S, S * (dy + 0.02), 1, () => B.acidLt));
}
// 17 · GUT WORM — erupts from the flesh floor (warned)
function drawWorm(put, S) {
  const cx = S * 0.5;
  // flesh floor + burst crater
  for (let y = S * 0.62; y < S * 0.82; y++) {
    const t = (y - S * 0.62) / (S * 0.2);
    row(put, Math.round(y), cx - S * 0.24, cx + S * 0.24, (tx) => {
      const hole = Math.abs(tx - 0.5) < 0.14 - t * 0.06;
      if (hole && t < 0.5) return null;
      let b = mix(B.meat, B.fleshDk, clamp(tx * 0.6 + t * 0.5, 0, 1));
      return b;
    });
  }
  // crater rim chunks
  [[-0.1, 0.62], [0.09, 0.61], [-0.04, 0.6], [0.03, 0.63]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.018, S * 0.012, (tx, ty) => mix(B.meatLt, B.meatDk, ty)));
  // worm column erupting
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + Math.sin(t * 2.5) * S * 0.02, py = S * (0.62 - t * 0.3);
    const w = S * (0.055 - t * 0.012);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      let b = mix('#c88a7a', '#6a3a30', clamp(tx * 0.9 + ty * 0.4, 0, 1));
      if (((t * 14) | 0) % 2) b = mix(b, '#e8aa96', 0.3); // segment rings
      return b;
    });
  }
  // tri-jaw open flower head
  const hy = S * 0.32;
  [[-1, 0], [1, 0], [0, -1]].forEach(([sx, sy]) => {
    fin(put, cx + Math.sin(0) * S * 0.02, hy, cx + sx * S * 0.08, hy + sy * S * 0.02 - S * 0.06, cx + sx * S * 0.03, hy - S * 0.01, B.meatLt, B.meatDk);
  });
  ell(put, cx, hy, S * 0.03, S * 0.026, () => B.oil); // throat
  for (let a = 0; a < 6.28; a += 0.7) put(Math.round(cx + Math.cos(a) * S * 0.022), Math.round(hy + Math.sin(a) * S * 0.02), B.tooth);
  // debris + drips
  [[-0.16, 0.5], [0.15, 0.46], [0.1, 0.55]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.meatLt));
  drips(put, cx + S * 0.06, hy + S * 0.04, 2);
}
// 18 · KRILL CLOUD — the whale's dinner, bites back in a swarm
function drawKrill(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // dozens of tiny krill — bright comma shapes, no cloud mud behind
  let seed = 9;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 30; i++) {
    const a = rnd() * 6.28, r = Math.sqrt(rnd()) * S * 0.18;
    const kx = cx + Math.cos(a) * r, ky = cy + Math.sin(a) * r * 0.8;
    const dir = rnd() > 0.5 ? 1 : -1;
    const big = 1 + rnd() * 0.6;
    // curved shrimp body: head blob + arched tail
    ell(put, kx, ky, 2.4 * big, 1.8 * big, (tx, ty) => mix('#ffb0a0', '#c85a52', clamp(tx + ty * 0.4, 0, 1)));
    stroke(put, kx + dir * 2 * big, ky, kx + dir * 5 * big, ky + 2.5 * big, 1.4 * big, () => '#e88a7a');
    stroke(put, kx + dir * 5 * big, ky + 2.5 * big, kx + dir * 6 * big, ky + 4 * big, 1, () => '#c85a52'); // tail fan
    put(Math.round(kx - dir * big), Math.round(ky - big), B.oil); // eye
    // antennae + leg flicks
    stroke(put, kx - dir * 2 * big, ky - big, kx - dir * 5 * big, ky - 3 * big, 0.8, () => '#ffd0c0');
    if (i % 2 === 0) put(Math.round(kx + dir * big), Math.round(ky + 2.4 * big), '#ffd0c0');
  }
  // bright leaders surging at the front edge
  [[-0.2, -0.02], [-0.24, 0.06], [-0.19, 0.13]].forEach(([dx, dy]) => {
    ell(put, cx + dx * S, cy + dy * S, 3.4, 2.4, (tx, ty) => mix('#ffd0c0', '#e88a7a', ty));
    stroke(put, cx + dx * S + 3, cy + dy * S, cx + dx * S + 7, cy + dy * S + 3, 1.6, () => '#e88a7a');
    put(Math.round(cx + dx * S - 2), Math.round(cy + dy * S - 1), B.oil);
    stroke(put, cx + dx * S - 3, cy + dy * S - 2, cx + dx * S - 7, cy + dy * S - 4, 0.8, () => '#ffd0c0');
  });
  // motion streaks
  [[0.14, -0.08], [0.2, 0.02], [0.16, 0.12]].forEach(([dx, dy]) => stroke(put, cx + dx * S, cy + dy * S, cx + (dx + 0.06) * S, cy + dy * S, 1, () => mix(B.meatLt, B.fleshDk, 0.4)));
}
// 19 · FLESH POLYP — gut growth, vents stun gas, pops krill out
function drawPolyp(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // stalk rooted in floor
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + Math.sin(t * 2) * S * 0.02, py = S * (0.78 - t * 0.24);
    const w = S * (0.045 - t * 0.01);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      let b = mix(B.meat, B.fleshDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
      if (((t * 10) | 0) % 2) b = mix(b, B.meatLt, 0.25); // ring folds
      return b;
    });
  }
  // bulb head — swollen, veined, translucent
  dome(put, cx + S * 0.01, S * 0.44, S * 0.085, S * 0.095, B.meatLt, B.gloss, B.meatDk);
  // veins
  [[-0.05, 0.4, -0.08, 0.48], [0.04, 0.38, 0.08, 0.46], [0, 0.36, -0.02, 0.44]].forEach(([x0, y0, x1, y1]) => stroke(put, cx + x0 * S, S * y0, cx + x1 * S, S * y1, 1, () => B.vein));
  // puckered vent mouth on top
  ell(put, cx + S * 0.01, S * 0.36, S * 0.02, S * 0.014, (tx, ty) => mix(B.meatDk, B.oil, ty));
  // gas burp cloud
  wisps(put, cx + S * 0.01, S * 0.32, 4);
  ell(put, cx + S * 0.03, S * 0.24, S * 0.026, S * 0.016, (tx) => mix(B.bile, B.bileDk, tx));
  // krill silhouettes inside the bulb (about to pop)
  [[-0.02, 0.44], [0.04, 0.47]].forEach(([dx, dy]) => { stroke(put, cx + dx * S, S * dy, cx + dx * S + 3, S * dy + 1, 1.2, () => B.fleshDk); put(Math.round(cx + dx * S), Math.round(S * dy)), B.oil; });
}
// 20 · CURSED FIGUREHEAD — the ship's wooden mermaid, walking
function drawFigurehead(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // broken hull chunk she drags — her "base"
  for (let y = S * 0.68; y < S * 0.8; y++) {
    const t = (y - S * 0.68) / (S * 0.12);
    row(put, Math.round(y), cx - S * (0.1 - t * 0.02), cx + S * (0.12 - t * 0.03), (tx) => {
      let b = mix(B.wood, B.woodDk, clamp(tx * 1.1 + t * 0.3, 0, 1));
      if (((tx * 7) | 0) % 3 === 0) b = mix(b, B.woodLt, 0.3); // planks
      return b;
    });
  }
  [[-0.06], [0.04]].forEach(([dx]) => put(Math.round(cx + dx * S), Math.round(S * 0.72), B.brass)); // nail heads
  // carved tail merging into the hull chunk
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + S * (0.0 + t * 0.03), py = S * (0.68 - t * 0.14);
    const w = S * (0.065 - t * 0.02);
    ell(put, px, py, w, w * 0.7, (tx, ty) => {
      let b = mix(B.woodLt, B.woodDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
      if (((t * 12) | 0) % 2) b = mix(b, B.wood, 0.5); // carved scale bands
      return b;
    });
  }
  // torso — cracked painted wood
  for (let y = S * 0.4; y < S * 0.55; y++) {
    const t = (y - S * 0.4) / (S * 0.15), w = S * (0.05 + t * 0.012);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#d8b890', '#8a6a48', clamp(tx * 1.1 + t * 0.2, 0, 1)); // faded paint skin
      return b;
    });
  }
  stroke(put, cx - S * 0.01, S * 0.44, cx + S * 0.02, S * 0.54, 1, () => B.woodDk); // long crack
  // arms — one splintered stump, one reaching
  stroke(put, cx - S * 0.05, S * 0.43, cx - S * 0.13, S * 0.36, S * 0.015, () => '#d8b890');
  [[-0.14, 0.35], [-0.15, 0.37]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.woodLt)); // splinter fingers
  stroke(put, cx + S * 0.045, S * 0.44, cx + S * 0.09, S * 0.5, S * 0.014, () => '#b89468');
  put(Math.round(cx + S * 0.1), Math.round(S * 0.52), B.woodDk); // stump end
  // head — serene carved face, peeling gilt hair, DEAD GLOW EYES
  ell(put, cx, S * 0.34, S * 0.045, S * 0.05, (tx, ty) => mix('#d8b890', '#8a6a48', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.016, S * 0.33, S * 0.008, B.oil, B.violet, B.violetLt);
  optic(put, cx + S * 0.016, S * 0.33, S * 0.008, B.oil, B.violet, B.violetLt);
  stroke(put, cx - S * 0.012, S * 0.37, cx + S * 0.012, S * 0.37, 0.9, () => B.woodDk); // carved flat mouth
  // gilt hair swept back, flaking
  for (let t = 0; t < 1; t += 0.09) {
    stroke(put, cx - S * 0.03 + t * S * 0.02, S * (0.3 + t * 0.01), cx + S * (0.05 + t * 0.04), S * (0.32 + t * 0.08), 1.6, () => (t * 10 | 0) % 2 ? B.gold : B.goldDk);
  }
  [[0.09, 0.42], [0.12, 0.38]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.goldLt)); // flakes falling
  // violet curse wisps
  [[-0.09, 0.28], [0.08, 0.26]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.violetLt));
}

const LIST = [
  { n: 1, name: 'DROWNED FISHERMAN', role: 'gaff + hooked lure', draw: drawFisherman },
  { n: 2, name: 'GUT LOBSTER', role: 'snip charge, big claws', draw: drawLobster },
  { n: 3, name: 'SEA SNAKE', role: 'venom S-strike from the folds', draw: drawSeaSnake },
  { n: 4, name: 'CRIMSON STARFISH', role: 'leaps + latches', draw: drawStarfish },
  { n: 5, name: 'MERMAID', role: 'song charm, beckons', draw: drawMermaid },
  { n: 6, name: 'SWALLOWED PIRATE', role: 'cutlass slasher, ship crew', draw: drawPirate },
  { n: 7, name: 'SKELETON DECKHAND', role: 'old crews, boarding axe', draw: drawDeckhand },
  { n: 8, name: 'SHIP RAT PACK', role: 'swarm off the wreck', draw: drawRats },
  { n: 9, name: 'BILGE PARROT', role: 'dive pecks, screeches', draw: drawParrot },
  { n: 10, name: 'GUT CRAB', role: 'armored, blocks frontal', draw: drawCrab },
  { n: 11, name: 'ACID SLUG', role: 'lobber, burn puddles', draw: drawSlug },
  { n: 12, name: 'BILE JELLY', role: 'drifting stinger', draw: drawJelly },
  { n: 13, name: 'BARNACLE TURRET', role: 'wall spitter (NOT PICKED)', draw: drawBarnacle },
  // ROSTER (Red 2026-07-17): ALL EXCEPT 13 14 15 20 — 16 mobs.
  { n: 14, name: 'GUT SHARK', role: 'acid-pool ambusher', draw: drawShark },
  { n: 15, name: 'HAGFISH', role: 'slime coils choke lanes', draw: drawHagfish },
  { n: 16, name: 'LAMPREY', role: 'launches + latches, drains', draw: drawLamprey },
  { n: 17, name: 'GUT WORM', role: 'erupts underfoot (warned)', draw: drawWorm },
  { n: 18, name: 'KRILL CLOUD', role: 'drifting bite swarm', draw: drawKrill },
  { n: 19, name: 'FLESH POLYP', role: 'gas vent growth, pops krill', draw: drawPolyp },
  { n: 20, name: 'CURSED FIGUREHEAD', role: 'elite carved walker', draw: drawFigurehead },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'belly_mob_options.png', title: 'BELLY OF THE BEAST — MOB CANDIDATES (pick your roster, any count)', S: 160 });
}
module.exports = { LIST };
