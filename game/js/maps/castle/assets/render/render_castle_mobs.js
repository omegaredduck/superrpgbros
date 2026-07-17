// artdev/castle/render_castle_mobs.js — 20 numbered VAMPIRE CASTLE mob
// candidates, hi-fi 160x160, one PNG grid for Red to pick 8 from.
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, candleFlame, cape, batIcon } = KIT;

// 1 · CRYPT BAT — the cheap swarm flapper.
function drawCryptBat(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  batIcon(put, cx, cy, S * 0.22, G.fur);
  // relight with shading: body + wing membranes
  dome(put, cx, cy, S * 0.08, S * 0.1, G.fur, G.furLt, G.furDk);
  [-1, 1].forEach(k => {
    stroke(put, cx + k * S * 0.05, cy - S * 0.02, cx + k * S * 0.26, cy - S * 0.12, S * 0.07, (t) => mix(G.furLt, G.furDk, 0.3 + t * 0.6));
    stroke(put, cx + k * S * 0.2, cy - S * 0.08, cx + k * S * 0.28, cy + S * 0.06, S * 0.05, (t) => mix(G.fur, G.furDk, t));
    // finger bones
    stroke(put, cx + k * S * 0.06, cy - S * 0.03, cx + k * S * 0.25, cy - S * 0.11, 1, () => G.furDk);
  });
  [-1, 1].forEach(k => stroke(put, cx + k * S * 0.03, cy - S * 0.08, cx + k * S * 0.06, cy - S * 0.15, 2, () => G.fur));
  [-1, 1].forEach(k => put(Math.round(cx + k * S * 0.025), Math.round(cy - S * 0.02), G.blood));
  // tiny fangs
  [-1, 1].forEach(k => put(Math.round(cx + k * S * 0.015), Math.round(cy + S * 0.04), G.white));
}

// 2 · THRALL — hollow-eyed servant shambler; basic melee.
function drawThrall(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // stooped body in ragged livery
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.08 + t * 0.09);
    row(put, Math.round(cy - S * 0.02 + y + Math.sin(t * 3) * 2), cx - w + S * 0.02, cx + w + S * 0.02, (tx) => {
      let b = mix(G.velvet, G.velvetDk, t);
      if (tx > 0.42 && tx < 0.58) b = mix(b, G.gold, 0.25); // livery stripe
      if (t > 0.8 && Math.sin(tx * 18) > 0.3) return null; // ragged hem
      return b;
    });
  }
  // hanging arms
  stroke(put, cx - S * 0.08, cy + S * 0.02, cx - S * 0.15, cy + S * 0.2, S * 0.03, () => G.velvetDk);
  stroke(put, cx + S * 0.12, cy + S * 0.02, cx + S * 0.17, cy + S * 0.18, S * 0.03, () => G.velvetDk);
  [(-0.16), 0.18].forEach(o => ell(put, cx + o * S, cy + S * 0.21, S * 0.025, S * 0.02, () => G.pale));
  // drooping head, bite-marked neck
  dome(put, cx + S * 0.03, cy - S * 0.1, S * 0.07, S * 0.075, G.pale, G.moonLt, G.paleDk);
  [-1, 1].forEach(s => ell(put, cx + S * 0.03 + s * S * 0.028, cy - S * 0.11, S * 0.018, S * 0.02, () => G.night));
  [[0.08, -0.045], [0.095, -0.04]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.blood));
  stroke(put, cx + S * 0.0, cy - S * 0.05, cx + S * 0.06, cy - S * 0.05, 1, () => G.paleDk);
  // carrying a silver tray (still serving)
  ell(put, cx - S * 0.17, cy + S * 0.06, S * 0.06, S * 0.02, (tx, ty) => mix(G.silver, G.silverDk, ty));
  ell(put, cx - S * 0.17, cy + S * 0.035, S * 0.02, S * 0.018, (tx, ty) => mix(G.bloodLt, G.bloodDk, ty)); // goblet
}

// 3 · GARGOYLE — stone flyer; perches, then dive-bombs.
function drawGargoyle(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // crouched stone body on a ledge chunk
  plate(put, cx - S * 0.16, cy + S * 0.2, cx + S * 0.16, cy + S * 0.3, G.stoneDk, G.stone, G.stoneDkk);
  dome(put, cx, cy + S * 0.06, S * 0.14, S * 0.15, G.stone, G.stoneLt, G.stoneDkk);
  // hunched shoulders + clawed arms braced
  [-1, 1].forEach(s => {
    dome(put, cx + s * S * 0.13, cy - S * 0.04, S * 0.07, S * 0.06, G.stoneLt, G.stoneLt, G.stoneDk);
    stroke(put, cx + s * S * 0.15, cy + S * 0.0, cx + s * S * 0.18, cy + S * 0.18, S * 0.035, () => G.stoneDk);
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.18, cy + S * 0.18, cx + s * S * 0.18 + k * S * 0.02, cy + S * 0.22, 1, () => G.stoneDkk));
  });
  // folded bat wings (stone)
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.1, cy - S * 0.08, cx + s * S * 0.3, cy - S * 0.24, S * 0.04, (t) => mix(G.stone, G.stoneDkk, t));
    stroke(put, cx + s * S * 0.28, cy - S * 0.2, cx + s * S * 0.32, cy + S * 0.02, S * 0.03, (t) => mix(G.stoneDk, G.stoneDkk, t));
  });
  // horned demon head
  dome(put, cx, cy - S * 0.14, S * 0.08, S * 0.075, G.stone, G.stoneLt, G.stoneDk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy - S * 0.19, cx + s * S * 0.1, cy - S * 0.28, S * 0.028, () => G.stoneDk));
  stroke(put, cx - S * 0.04, cy - S * 0.08, cx + S * 0.04, cy - S * 0.08, 2, () => G.stoneDkk);
  [-1, 1].forEach(k => put(Math.round(cx + k * S * 0.035 - 1), Math.round(cy - S * 0.085), G.bone));
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, cy - S * 0.15, S * 0.024, G.bloodDk, G.blood, G.bloodLt));
  // crack about to wake
  stroke(put, cx + S * 0.05, cy + S * 0.02, cx + S * 0.1, cy + S * 0.12, 1, () => G.stoneDkk);
}

// 4 · MIRROR WRAITH — steps out of mirrors; blink-teleporter.
function drawMirrorWraith(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // the standing mirror it emerges from
  for (let y = 0; y < S * 0.52; y++) {
    const t = y / (S * 0.52);
    let ww = S * 0.16;
    if (t < 0.25) { const a = t / 0.25; ww = S * 0.16 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(S * 0.18 + y), cx - S * 0.1 - ww, cx - S * 0.1 + ww, (tx) => {
      let b = mix(G.nightLt, G.night, t);
      if (Math.abs(tx - 0.3) < 0.08) b = mix(b, G.moon, 0.5); // glass shine
      return b;
    });
  }
  // gilt frame
  for (let y = 0; y < S * 0.52; y += 2) {
    const t = y / (S * 0.52);
    let ww = S * 0.16; if (t < 0.25) { const a = t / 0.25; ww = S * 0.16 * Math.sqrt(a * (2 - a)); }
    put(Math.round(cx - S * 0.1 - ww - 1), Math.round(S * 0.18 + y), G.goldDk);
    put(Math.round(cx - S * 0.1 + ww + 1), Math.round(S * 0.18 + y), G.gold);
  }
  plate(put, cx - S * 0.2, S * 0.7, cx + S * 0.0, S * 0.74, G.wood, G.woodLt, G.woodDkk);
  // the wraith pulling itself OUT of the glass
  dome(put, cx + S * 0.1, cy - S * 0.08, S * 0.08, S * 0.09, G.moon, G.moonLt, G.moonDk);
  ell(put, cx + S * 0.1, cy - S * 0.06, S * 0.05, S * 0.05, () => G.night);
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.1 + s * S * 0.025), Math.round(cy - S * 0.07), G.moonLt));
  // trailing half-in-glass body
  stroke(put, cx + S * 0.04, cy + S * 0.0, cx - S * 0.06, cy + S * 0.1, S * 0.06, (t) => mix(G.moon, G.moonDk, t));
  // reaching claw
  stroke(put, cx + S * 0.14, cy + S * 0.0, cx + S * 0.28, cy + S * 0.08, S * 0.03, (t) => mix(G.moon, G.moonDk, t));
  [-1, 0, 1].forEach(k => stroke(put, cx + S * 0.28, cy + S * 0.08, cx + S * 0.31, cy + S * 0.08 + k * S * 0.025, 1, () => G.moonLt));
  // glass ripples where it exits
  [[0.02, -0.14], [0.0, 0.06]].forEach(([ox, oy]) => {
    for (let a = -0.9; a < 0.9; a += 0.25) put(Math.round(cx + ox * S + Math.cos(a) * S * 0.05), Math.round(cy + oy * S + Math.sin(a) * S * 0.06), G.moonLt);
  });
}

// 5 · BLOOD MAIDEN — vampire bride; lobs blood orbs that leave pools.
function drawBloodMaiden(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.16);
  // flowing gown
  for (let y = 0; y < S * 0.34; y++) {
    const t = y / (S * 0.34), w = S * (0.07 + t * 0.14);
    row(put, Math.round(cy + y - S * 0.02), cx - w, cx + w, (tx) => {
      let b = mix(G.blood, G.wine, t);
      if (tx < 0.12 || tx > 0.88) b = mix(b, G.oil, 0.4);
      if (Math.sin(tx * 9 + t * 6) > 0.75) b = mix(b, G.bloodDk, 0.4);
      return b;
    });
  }
  // pale shoulders + head
  dome(put, cx, cy - S * 0.1, S * 0.065, S * 0.07, G.vskin, '#ffffff', G.vskinDk);
  // long black hair sweeping
  dome(put, cx - S * 0.01, cy - S * 0.15, S * 0.08, S * 0.05, G.night, G.nightLt, G.oil);
  for (let i = 0; i < 4; i++) stroke(put, cx - S * 0.06, cy - S * 0.12 + i, cx - S * 0.14 - i * S * 0.01, cy + S * 0.08 + i * S * 0.03, S * 0.025, (t) => mix(G.nightLt, G.oil, t));
  // red eyes + smile w/ fangs
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.026), Math.round(cy - S * 0.11), G.blood));
  stroke(put, cx - S * 0.02, cy - S * 0.065, cx + S * 0.02, cy - S * 0.065, 1, () => G.bloodDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.055), G.white));
  // conjured blood orb + drip pool
  ell(put, cx + S * 0.18, cy - S * 0.06, S * 0.05, S * 0.05, (tx, ty) => mix(G.bloodLt, G.bloodDk, ty));
  put(Math.round(cx + S * 0.16), Math.round(cy - S * 0.08), '#ffffff');
  stroke(put, cx + S * 0.18, cy - S * 0.01, cx + S * 0.18, cy + S * 0.08, 1, () => G.blood);
  ell(put, cx + S * 0.18, cy + S * 0.3, S * 0.06, S * 0.02, (tx, ty) => mix(G.blood, G.wine, ty));
}

// 6 · COURT WOLF — dire wolf of the hunt; telegraphed pounce.
function drawCourtWolf(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  // crouched body coiled to leap
  ell(put, cx + S * 0.04, cy, S * 0.2, S * 0.11, (tx, ty) => mix(G.furLt, G.furDk, clamp(ty * 1.25, 0, 1)));
  dome(put, cx + S * 0.16, cy - S * 0.04, S * 0.09, S * 0.08, G.fur, G.furLt, G.furDk); // haunch
  // legs loaded
  [[-0.06, -0.14], [0.02, -0.02], [0.16, 0.06], [0.22, 0.12]].forEach(([o, k]) =>
    stroke(put, cx + o * S, cy + S * 0.06, cx + (o + (k < 0 ? -0.04 : 0.02)) * S, cy + S * 0.2, S * 0.03, () => G.furDk));
  // lowered head, ears flat, jaws parted
  stroke(put, cx - S * 0.12, cy - S * 0.02, cx - S * 0.22, cy + S * 0.02, S * 0.06, () => G.fur);
  dome(put, cx - S * 0.24, cy + S * 0.0, S * 0.065, S * 0.055, G.fur, G.furLt, G.furDk);
  stroke(put, cx - S * 0.29, cy + S * 0.02, cx - S * 0.36, cy + S * 0.04, S * 0.032, () => G.furDk);
  stroke(put, cx - S * 0.29, cy + S * 0.055, cx - S * 0.34, cy + S * 0.07, S * 0.022, () => G.furDk);
  [[-0.33, 0.035], [-0.31, 0.05]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.bone));
  [-0.01, 0.03].forEach(o => stroke(put, cx - S * 0.22 + o * S, cy - S * 0.05, cx - S * 0.2 + o * S, cy - S * 0.1, 2, () => G.fur));
  optic(put, cx - S * 0.23, cy - S * 0.02, S * 0.02, G.bloodDk, G.blood, G.bloodLt);
  // raised hackles + collar of the court
  for (let i = 0; i < 5; i++) stroke(put, cx - S * 0.08 + i * S * 0.05, cy - S * 0.1, cx - S * 0.09 + i * S * 0.05, cy - S * 0.16, 2, () => G.furDk);
  stroke(put, cx - S * 0.14, cy - S * 0.04, cx - S * 0.1, cy + S * 0.02, 2, () => G.blood);
  bolt(put, cx - S * 0.12, cy - S * 0.01, S * 0.012, G.gold, G.goldDk);
  // pounce arc hint
  for (let t = 0.1; t < 0.9; t += 0.16) put(Math.round(cx - S * 0.3 - t * S * 0.12), Math.round(cy - S * 0.1 - Math.sin(t * Math.PI) * S * 0.1), G.moonDk);
}

// 7 · HALBERD GUARD — skeletal castle guard; long telegraphed thrust lane.
function drawHalberdGuard(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // thrust lane telegraph
  for (let x = 0; x < S * 0.3; x += 5) row(put, Math.round(cy + S * 0.02), cx + S * 0.16 + x, cx + S * 0.18 + x, () => G.bloodDk);
  // legs + tabard
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.045, cy + S * 0.14, cx + s * S * 0.06, cy + S * 0.3, S * 0.028, () => G.boneDk));
  for (let y = 0; y < S * 0.2; y++) {
    const t = y / (S * 0.2), w = S * (0.085 - t * 0.01);
    row(put, Math.round(cy - S * 0.04 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.velvet, G.velvetDk, t);
      if (tx > 0.4 && tx < 0.6) b = mix(G.blood, G.bloodDk, t); // heraldic stripe
      return b;
    });
  }
  // cuirass + pauldrons
  plate(put, cx - S * 0.09, cy - S * 0.1, cx + S * 0.09, cy + S * 0.0, G.iron, G.silver, G.ironDkk);
  [-1, 1].forEach(s => dome(put, cx + s * S * 0.11, cy - S * 0.09, S * 0.045, S * 0.04, G.silver, G.moonLt, G.ironDk));
  // skull in an open sallet helm
  dome(put, cx, cy - S * 0.18, S * 0.07, S * 0.07, G.silver, G.moonLt, G.ironDk);
  ell(put, cx, cy - S * 0.16, S * 0.045, S * 0.04, (tx, ty) => mix(G.bone, G.boneDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.17), G.blood));
  stroke(put, cx - S * 0.07, cy - S * 0.22, cx + S * 0.07, cy - S * 0.22, 2, () => G.ironDk);
  put(Math.round(cx), Math.round(cy - S * 0.25), G.blood); // plume nub
  // the halberd — long haft + axe head + spike, held level for the thrust
  stroke(put, cx - S * 0.16, cy + S * 0.06, cx + S * 0.3, cy + S * 0.0, S * 0.02, () => G.wood);
  stroke(put, cx + S * 0.3, cy + S * 0.0, cx + S * 0.4, cy - S * 0.012, S * 0.022, () => G.silver);
  for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy - S * 0.06 + y), cx + S * 0.26, cx + S * 0.26 + S * (0.05 - Math.abs(y - S * 0.04) / S * 0.7), () => mix(G.silver, G.silverDk, y / (S * 0.08)));
}

// 8 · WAX HORROR — possessed candelabra; splashes hot wax (slow patches).
function drawWaxHorror(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // melted wax body base
  for (let y = 0; y < S * 0.14; y++) {
    const t = y / (S * 0.14), w = S * (0.06 + t * 0.12);
    row(put, Math.round(cy + S * 0.16 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.bone, G.boneDk, t * 0.7);
      if (Math.sin(tx * 11) > 0.5 && t > 0.4) b = mix(b, G.candleDk, 0.3);
      return b;
    });
  }
  // dripping wax streams
  [[-0.12, 0.2], [0.1, 0.22], [0.0, 0.24]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.08, 2, () => G.bone));
  // brass candelabra spine + arms
  stroke(put, cx, cy - S * 0.14, cx, cy + S * 0.18, S * 0.025, () => G.goldDk);
  [-1, 1].forEach(s => {
    stroke(put, cx, cy - S * 0.02, cx + s * S * 0.14, cy - S * 0.1, S * 0.02, () => G.goldDk);
    stroke(put, cx + s * S * 0.14, cy - S * 0.1, cx + s * S * 0.14, cy - S * 0.16, S * 0.02, () => G.gold);
  });
  // candles + flames
  [[-0.14, -0.2], [0, -0.28], [0.14, -0.2]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S + S * 0.05, cx + ox * S, cy + oy * S, S * 0.022, () => G.bone);
    candleFlame(put, cx + ox * S, cy + oy * S - S * 0.035, S * 0.035);
  });
  // a waxen face half-formed in the middle drips
  ell(put, cx, cy + S * 0.04, S * 0.05, S * 0.06, (tx, ty) => mix(G.bone, G.boneDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy + S * 0.03), G.candleDk));
  stroke(put, cx - S * 0.015, cy + S * 0.08, cx + S * 0.015, cy + S * 0.09, 1, () => G.candleDk);
  // hot wax splash mid-air
  [[0.22, 0.0], [0.26, 0.06]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.014, () => G.candleLt));
}

// 9 · PORTRAIT PHANTOM — nobles step OUT of their paintings; wall ambusher.
function drawPortraitPhantom(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // ornate frame on a wall
  plate(put, cx - S * 0.24, cy - S * 0.3, cx + S * 0.24, cy + S * 0.26, G.goldDk, G.gold, G.goldDkk);
  plate(put, cx - S * 0.2, cy - S * 0.26, cx + S * 0.2, cy + S * 0.22, G.night, G.nightLt, G.oil);
  // painted background
  for (let y = Math.round(cy - S * 0.26); y < cy + S * 0.22; y++)
    row(put, y, cx - S * 0.2, cx + S * 0.2, (tx) => (Math.sin(tx * 6 + y * 0.1) > 0.6 ? G.nightLt : null));
  // the noble LEANING OUT of the canvas — upper body 3D, lower still painted
  dome(put, cx, cy + S * 0.1, S * 0.12, S * 0.12, G.nightLt, G.velvet, G.oil); // flat painted lower
  // emerging torso + ruff collar
  dome(put, cx, cy - S * 0.02, S * 0.1, S * 0.1, G.velvet, G.velvetLt, G.velvetDk);
  ell(put, cx, cy - S * 0.09, S * 0.07, S * 0.025, () => G.white);
  // reaching arm over the frame edge
  stroke(put, cx + S * 0.08, cy - S * 0.02, cx + S * 0.26, cy + S * 0.1, S * 0.035, (t) => mix(G.velvetLt, G.velvetDk, t));
  ell(put, cx + S * 0.27, cy + S * 0.12, S * 0.028, S * 0.024, () => G.vskin);
  // pale head w/ crown-braid + hollow eyes
  dome(put, cx, cy - S * 0.16, S * 0.065, S * 0.07, G.vskin, '#ffffff', G.vskinDk);
  ell(put, cx, cy - S * 0.21, S * 0.06, S * 0.025, (tx, ty) => mix(G.nightLt, G.oil, tx));
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.025, cy - S * 0.165, S * 0.016, S * 0.02, () => G.oil));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.17), G.moon));
  // drips of paint where it tears free
  [[-0.1, 0.02], [0.12, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.05, 1, () => G.nightLt));
}

// 10 · PHANTOM ORGANIST — his dirge HASTENS every mob (tempo buffer).
function drawOrganist(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // pipe organ back
  [[-0.2, 0.34], [-0.12, 0.42], [-0.04, 0.5], [0.04, 0.5], [0.12, 0.42], [0.2, 0.34]].forEach(([o, h]) => {
    plate(put, cx + o * S - S * 0.03, cy + S * 0.16 - h * S, cx + o * S + S * 0.03, cy + S * 0.16, G.iron, G.silver, G.ironDkk);
    put(Math.round(cx + o * S), Math.round(cy + S * 0.16 - h * S + 2), G.oil);
  });
  // console/keys
  plate(put, cx - S * 0.2, cy + S * 0.14, cx + S * 0.2, cy + S * 0.22, G.woodDk, G.wood, G.woodDkk);
  for (let x = -0.18; x < 0.18; x += 0.024) put(Math.round(cx + x * S), Math.round(cy + S * 0.17), Math.floor(x * 42) % 2 ? G.oil : G.white);
  // the phantom: translucent robed back w/ raised arms
  dome(put, cx, cy + S * 0.0, S * 0.1, S * 0.13, G.moonDk, G.moon, G.night);
  dome(put, cx, cy - S * 0.14, S * 0.06, S * 0.06, G.moon, G.moonLt, G.moonDk);
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy - S * 0.04, cx + s * S * 0.16, cy + S * 0.12, S * 0.03, (t) => mix(G.moon, G.moonDk, t));
    ell(put, cx + s * S * 0.165, cy + S * 0.14, S * 0.022, S * 0.018, () => G.moonLt);
  });
  // music notes swirling out (the haste aura)
  [[-0.3, -0.1], [0.3, -0.14], [-0.26, -0.28], [0.24, -0.3], [0.0, -0.34]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, 1, () => G.gold);
    ell(put, cx + ox * S - S * 0.012, cy + oy * S, S * 0.014, S * 0.011, () => G.gold);
  });
}

// 11 · IRON MAIDEN — sarcophagus of spikes; snaps shut on you (ambusher).
function drawIronMaiden(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // body case, ajar
  for (let y = 0; y < S * 0.44; y++) {
    const t = y / (S * 0.44);
    const w = S * (0.1 + Math.sin(Math.min(1, t * 1.2) * Math.PI) * 0.06);
    row(put, Math.round(cy - S * 0.22 + y), cx - w - S * 0.05, cx + w - S * 0.05, (tx) => mix(G.iron, G.ironDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.5));
  }
  // serene woman's face sculpted on the lid
  dome(put, cx - S * 0.05, cy - S * 0.14, S * 0.05, S * 0.06, G.iron, G.silver, G.ironDkk);
  [-1, 1].forEach(s => stroke(put, cx - S * 0.05 + s * S * 0.02, cy - S * 0.15, cx - S * 0.05 + s * S * 0.005, cy - S * 0.15, 1, () => G.oil));
  // the door swung open showing SPIKES + red glow inside
  for (let y = 0; y < S * 0.4; y++) {
    const t = y / (S * 0.4), w = S * (0.07 + Math.sin(Math.min(1, t * 1.2) * Math.PI) * 0.04);
    row(put, Math.round(cy - S * 0.2 + y), cx + S * 0.04, cx + S * 0.04 + w, (tx) => mix(G.wine, G.oil, tx));
  }
  for (let i = 0; i < 6; i++) {
    stroke(put, cx + S * 0.05, cy - S * 0.16 + i * S * 0.06, cx + S * 0.1, cy - S * 0.15 + i * S * 0.06, 2, () => G.silver);
    stroke(put, cx - S * 0.01, cy - S * 0.16 + i * S * 0.06, cx - S * 0.06, cy - S * 0.15 + i * S * 0.06, 2, () => G.silverDk);
  }
  // hinges + a dripping stain below
  [[0.02, -0.18], [0.02, 0.1]].forEach(([ox, oy]) => bolt(put, cx + ox * S, cy + oy * S, S * 0.014, G.silver, G.ironDkk));
  ell(put, cx, cy + S * 0.28, S * 0.05, S * 0.016, () => G.wine);
  // little feet (it WALKS)
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.06 - S * 0.05, cy + S * 0.24, S * 0.028, S * 0.018, () => G.ironDkk));
}

// 12 · CRIMSON OOZE — blood slime; splits into droplets when killed.
function drawCrimsonOoze(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // glossy blood blob
  dome(put, cx, cy, S * 0.2, S * 0.15, G.blood, G.bloodLt, G.wine);
  ell(put, cx - S * 0.07, cy - S * 0.07, S * 0.05, S * 0.03, () => G.bloodLt);
  put(Math.round(cx - S * 0.08), Math.round(cy - S * 0.08), '#ffffff');
  // dripping edges
  [[-0.16, 0.1], [-0.02, 0.13], [0.12, 0.11]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.07, S * 0.025, (t) => mix(G.blood, G.wine, t));
    ell(put, cx + ox * S, cy + oy * S + S * 0.08, S * 0.016, S * 0.012, () => G.wine);
  });
  // eyes floating in the mass
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.06, cy - S * 0.02, S * 0.022, S * 0.025, () => G.white); put(Math.round(cx + s * S * 0.06), Math.round(cy - S * 0.015), G.oil); });
  // droplet children already splitting off
  [[-0.28, 0.06], [0.28, 0.02]].forEach(([ox, oy]) => {
    dome(put, cx + ox * S, cy + oy * S, S * 0.045, S * 0.035, G.blood, G.bloodLt, G.wine);
    put(Math.round(cx + ox * S - 2), Math.round(cy + oy * S - 2), G.bloodLt);
  });
  // trail
  ell(put, cx + S * 0.1, cy + S * 0.16, S * 0.09, S * 0.02, (tx, ty) => mix(G.wine, G.bloodDk, tx));
}

// 13 · VAMPIRE INITIATE — fledgling in a half-cape; blood bolt + self-heal.
function drawInitiate(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  cape(put, cx, cy - S * 0.12, S * 0.14, S * 0.34, G.night, G.oil);
  // slim body in dark dress-coat
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.06 + t * 0.05);
    row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.nightLt, G.night, t);
      if (tx > 0.44 && tx < 0.56 && t < 0.5) b = G.white; // shirt front
      return b;
    });
  }
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, cy + S * 0.26, cx + s * S * 0.05, cy + S * 0.34, S * 0.022, () => G.oil));
  // pale head, slick hair, red eyes, fangs
  dome(put, cx, cy - S * 0.12, S * 0.06, S * 0.065, G.vskin, '#ffffff', G.vskinDk);
  ell(put, cx, cy - S * 0.165, S * 0.055, S * 0.025, (tx, ty) => mix(G.nightLt, G.oil, ty));
  stroke(put, cx - S * 0.05, cy - S * 0.16, cx - S * 0.02, cy - S * 0.12, 1, () => G.oil); // widow's peak
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.024), Math.round(cy - S * 0.125), G.blood));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.08), G.white));
  // casting hand w/ blood bolt streaking
  stroke(put, cx + S * 0.07, cy + S * 0.02, cx + S * 0.18, cy - S * 0.06, S * 0.025, () => G.night);
  ell(put, cx + S * 0.22, cy - S * 0.08, S * 0.035, S * 0.025, (tx, ty) => mix(G.bloodLt, G.bloodDk, ty));
  [[0.28, -0.1], [0.33, -0.12]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.blood));
  // life siphon wisp curling back to him
  for (let t = 0; t < 1; t += 0.1) put(Math.round(cx + S * (0.3 - t * 0.25)), Math.round(cy + S * (0.1 - Math.sin(t * 6) * 0.03)), G.bloodLt);
}

// 14 · HUNCHBACK ALCHEMIST — lobs volatile flasks (AoE splash).
function drawHunchback(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.18);
  // hunched body w/ hump
  dome(put, cx + S * 0.04, cy + S * 0.04, S * 0.13, S * 0.14, G.wood, G.woodLt, G.woodDkk);
  dome(put, cx + S * 0.1, cy - S * 0.08, S * 0.09, S * 0.08, G.wood, G.woodLt, G.woodDk); // the hump
  // apron w/ stains
  for (let y = 0; y < S * 0.16; y++) row(put, Math.round(cy + S * 0.04 + y), cx - S * 0.06, cx + S * 0.1, (tx) => mix(G.bone, G.boneDk, y / (S * 0.16)));
  [[0.0, 0.1], [0.05, 0.16]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.gGreen));
  // head jutting forward w/ goggle
  dome(put, cx - S * 0.08, cy - S * 0.08, S * 0.06, S * 0.06, G.vskin, '#ffffff', G.vskinDk);
  ell(put, cx - S * 0.11, cy - S * 0.1, S * 0.025, S * 0.025, (tx, ty) => mix(G.gold, G.goldDk, ty));
  put(Math.round(cx - S * 0.11), Math.round(cy - S * 0.1), G.gGreen);
  put(Math.round(cx - S * 0.05), Math.round(cy - S * 0.1), G.oil);
  stroke(put, cx - S * 0.1, cy - S * 0.04, cx - S * 0.05, cy - S * 0.04, 1, () => G.vskinDk); // grin
  // bandolier of flasks
  stroke(put, cx - S * 0.05, cy - S * 0.02, cx + S * 0.1, cy + S * 0.14, S * 0.02, () => G.woodDkk);
  [[0.0, 0.03], [0.05, 0.08]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.024, () => G.gGreen));
  // arm mid-throw + flask arcing w/ fuse
  stroke(put, cx + S * 0.1, cy - S * 0.02, cx + S * 0.2, cy - S * 0.14, S * 0.03, () => G.wood);
  ell(put, cx + S * 0.26, cy - S * 0.22, S * 0.03, S * 0.038, (tx, ty) => mix(G.gGreen, '#1c5c30', ty));
  put(Math.round(cx + S * 0.26), Math.round(cy - S * 0.27), G.candleLt);
  // splash target ring
  ell(put, cx + S * 0.34, cy + S * 0.26, S * 0.08, S * 0.03, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.55 && d <= 1 ? G.gGreen : null; });
  // bowed legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.17, cx + s * S * 0.09, cy + S * 0.28, S * 0.03, () => G.woodDkk));
}

// 15 · DIRE RATS — a scurrying knot of castle rats; fast swarm.
function drawDireRats(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.22);
  // three rats in a pack
  [[-0.14, 0.02, 1], [0.1, -0.02, -1], [0.0, 0.12, 1]].forEach(([ox, oy, dir]) => {
    const rx = cx + ox * S, ry = cy + oy * S;
    ell(put, rx, ry, S * 0.1, S * 0.055, (tx, ty) => mix(G.furLt, G.furDk, clamp(ty * 1.3, 0, 1)));
    // head + ears + eye
    dome(put, rx + dir * S * 0.09, ry - S * 0.01, S * 0.04, S * 0.032, G.fur, G.furLt, G.furDk);
    stroke(put, rx + dir * S * 0.12, ry, rx + dir * S * 0.16, ry + S * 0.008, S * 0.02, () => G.furDk);
    ell(put, rx + dir * S * 0.07, ry - S * 0.04, S * 0.016, S * 0.018, () => G.fur);
    put(Math.round(rx + dir * S * 0.1), Math.round(ry - S * 0.015), G.blood);
    put(Math.round(rx + dir * S * 0.165), Math.round(ry + S * 0.01), G.vskin); // nose
    // naked tail
    for (let t = 0; t < 1; t += 0.08) put(Math.round(rx - dir * S * (0.1 + t * 0.14)), Math.round(ry + Math.sin(t * 7) * S * 0.02), G.vskinDk);
    // feet scurry
    [[-0.04], [0.03]].forEach(([o]) => stroke(put, rx + o * S, ry + S * 0.04, rx + o * S + S * 0.015, ry + S * 0.07, 1, () => G.vskinDk));
  });
  // motion streaks
  [[-0.3, 0.0], [0.28, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S - S * 0.06, cy + oy * S, 1, () => G.furDk));
}

// 16 · GLASS SAINT — stained-glass window sentinel; rooted prism beams.
function drawGlassSaint(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.18);
  // lancet window body — a saint figure of glass panes
  const panes = [G.gRed, G.gBlue, G.gGreen, G.gAmber];
  for (let y = 0; y < S * 0.52; y++) {
    const t = y / (S * 0.52);
    let ww = S * 0.14;
    if (t < 0.28) { const a = t / 0.28; ww = S * 0.14 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(cy - S * 0.28 + y), cx - ww, cx + ww, (tx) => {
      const px = Math.floor(tx * 4 + t * 5) % 4;
      let b = panes[(px + Math.floor(t * 3)) % 4];
      b = mix(b, '#ffffff', 0.12 + 0.2 * Math.sin(tx * 3 + t * 2));
      // leading lines
      if ((tx * 4 + t * 5) % 1 < 0.12 || (t * 6) % 1 < 0.08) b = G.ironDkk;
      return b;
    });
  }
  // halo of the saint figure — glowing amber circle at head level
  for (let a = 0; a < 6.28; a += 0.16) put(Math.round(cx + Math.cos(a) * S * 0.08), Math.round(cy - S * 0.18 + Math.sin(a) * S * 0.08), G.goldLt);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.18), G.white));
  // stone sill base
  plate(put, cx - S * 0.17, cy + S * 0.24, cx + S * 0.17, cy + S * 0.32, G.stone, G.stoneLt, G.stoneDkk);
  // prism beams refracting out
  [[-1, -0.06], [1, -0.02], [1, 0.12]].forEach(([s, oy], i) => {
    stroke(put, cx + s * S * 0.12, cy + oy * S, cx + s * S * 0.4, cy + oy * S + S * 0.06 * (i - 1), 2, () => panes[i]);
    stroke(put, cx + s * S * 0.12, cy + oy * S, cx + s * S * 0.4, cy + oy * S + S * 0.06 * (i - 1), 1, () => mix(panes[i], '#ffffff', 0.5));
  });
}

// 17 · HEADLESS KNIGHT — empty armor; sweeping greatsword cone.
function drawHeadlessKnight(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  // legs + faulds
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy + S * 0.12, cx + s * S * 0.08, cy + S * 0.28, S * 0.04, () => G.ironDk));
  for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy + S * 0.06 + y), cx - S * (0.1 + y / S * 0.3), cx + S * (0.1 + y / S * 0.3), (tx) => mix(G.iron, G.ironDkk, y / (S * 0.08)));
  // cuirass — NO HEAD, dark smoke curling from the neck hole
  plate(put, cx - S * 0.11, cy - S * 0.14, cx + S * 0.11, cy + S * 0.06, G.silver, G.moonLt, G.ironDk);
  stroke(put, cx, cy - S * 0.12, cx, cy + S * 0.02, 2, () => G.ironDkk);
  ell(put, cx, cy - S * 0.16, S * 0.045, S * 0.02, () => G.oil);
  [[0.0, -0.22], [0.03, -0.28], [-0.03, -0.33]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, (tx, ty) => mix(G.velvetDk, G.oil, ty)));
  // pauldrons + gauntlets
  [-1, 1].forEach(s => dome(put, cx + s * S * 0.135, cy - S * 0.12, S * 0.05, S * 0.045, G.silver, G.moonLt, G.ironDk));
  // two-handed greatsword mid-sweep + arc trace
  stroke(put, cx + S * 0.1, cy - S * 0.02, cx + S * 0.34, cy - S * 0.22, S * 0.03, () => G.silver);
  stroke(put, cx + S * 0.13, cy - S * 0.045, cx + S * 0.31, cy - S * 0.2, 1, () => '#ffffff');
  ell(put, cx + S * 0.09, cy + S * 0.0, S * 0.03, S * 0.02, (tx, ty) => mix(G.gold, G.goldDk, ty));
  for (let a = -0.6; a < 0.7; a += 0.14) put(Math.round(cx + Math.cos(a - 0.6) * S * 0.36), Math.round(cy - Math.sin(a - 0.6) * S * 0.24), G.moonDk);
  // heraldic tabard scrap
  stroke(put, cx - S * 0.06, cy - S * 0.06, cx - S * 0.02, cy + S * 0.04, S * 0.03, () => G.blood);
}

// 18 · ANIMATED ARMOR — the tank; slow colossus of plate + shield wall.
function drawAnimatedArmor(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // massive legs
  [-1, 1].forEach(s => {
    plate(put, cx + s * S * 0.11 - S * 0.045, cy + S * 0.12, cx + s * S * 0.11 + S * 0.045, cy + S * 0.3, G.iron, G.silver, G.ironDkk);
    dome(put, cx + s * S * 0.11, cy + S * 0.32, S * 0.055, S * 0.03, G.ironDk, G.iron, G.ironDkk);
  });
  // barrel cuirass
  plate(put, cx - S * 0.16, cy - S * 0.16, cx + S * 0.16, cy + S * 0.12, G.iron, G.silver, G.ironDkk);
  row(put, Math.round(cy - S * 0.04), cx - S * 0.16, cx + S * 0.16, () => G.ironDkk);
  bolt(put, cx, cy - S * 0.1, S * 0.02, G.gold, G.goldDk);
  // great helm w/ visor glow (empty inside)
  plate(put, cx - S * 0.07, cy - S * 0.3, cx + S * 0.07, cy - S * 0.16, G.silver, G.moonLt, G.ironDk);
  row(put, Math.round(cy - S * 0.24), cx - S * 0.055, cx + S * 0.055, () => G.oil);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.24), G.blood));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.07, cy - S * 0.3, cx + s * S * 0.1, cy - S * 0.36, S * 0.02, () => G.goldDk)); // crest wings
  // tower shield (left) + mace (right)
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.075 - (t > 0.8 ? (t - 0.8) * 0.25 : 0));
    row(put, Math.round(cy - S * 0.14 + y), cx - S * 0.26 - w, cx - S * 0.26 + w, (tx) => mix(G.velvet, G.velvetDk, t + Math.abs(tx - 0.5) * 0.3));
  }
  bolt(put, cx - S * 0.26, cy - S * 0.02, S * 0.025, G.gold, G.goldDk);
  stroke(put, cx + S * 0.18, cy - S * 0.06, cx + S * 0.28, cy + S * 0.1, S * 0.028, () => G.woodDk);
  dome(put, cx + S * 0.29, cy + S * 0.13, S * 0.045, S * 0.04, G.iron, G.silver, G.ironDkk);
  for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.29 + Math.cos(a) * S * 0.05), Math.round(cy + S * 0.13 + Math.sin(a) * S * 0.045), G.silver);
}

// 19 · CHANDELIER CREEP — lurks on ceilings; CRASHES DOWN on a marked circle.
function drawChandelierCreep(put, S) {
  const cx = S * 0.5, cy = S * 0.42;
  // chain from above
  for (let y = 0; y < S * 0.14; y += 4) { ell(put, cx, S * 0.04 + y, S * 0.014, S * 0.02, () => (y / 4) % 2 ? G.goldDk : G.gold); }
  // crown ring w/ candle arms
  ell(put, cx, cy, S * 0.2, S * 0.06, (tx, ty) => mix(G.gold, G.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
  [[-0.2, 0], [-0.1, -0.02], [0, -0.03], [0.1, -0.02], [0.2, 0]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, S * 0.018, () => G.bone);
    candleFlame(put, cx + ox * S, cy + oy * S - S * 0.08, S * 0.03);
  });
  // crystal drops — and hidden EYES among them
  [[-0.14, 0.08], [-0.05, 0.1], [0.05, 0.1], [0.14, 0.08]].forEach(([ox, oy], i) => {
    stroke(put, cx + ox * S, cy + S * 0.04, cx + ox * S, cy + oy * S + S * 0.05, 1, () => G.silver);
    if (i === 1 || i === 2) { ell(put, cx + ox * S, cy + oy * S + S * 0.07, S * 0.02, S * 0.024, () => G.white); put(Math.round(cx + ox * S), Math.round(cy + oy * S + S * 0.07), G.blood); }
    else ell(put, cx + ox * S, cy + oy * S + S * 0.07, S * 0.016, S * 0.022, (tx, ty) => mix(G.moonLt, G.moonDk, ty));
  });
  // grasping crystal claws folded under
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy + S * 0.12, cx + s * S * 0.14, cy + S * 0.22, S * 0.022, (t) => mix(G.moonLt, G.moonDk, t));
    [-1, 1].forEach(k => stroke(put, cx + s * S * 0.14, cy + S * 0.22, cx + s * S * 0.14 + k * S * 0.02, cy + S * 0.26, 1, () => G.moon));
  });
  // the drop-zone ring below
  ell(put, cx, S * 0.88, S * 0.16, S * 0.045, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? G.candle : null; });
}

// 20 · CRIMSON DUELIST — masked noble w/ rapier; strafing elite.
function drawCrimsonDuelist(put, S) {
  const cx = S * 0.48, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  cape(put, cx + S * 0.02, cy - S * 0.1, S * 0.13, S * 0.3, G.blood, G.wine);
  // fencing stance body
  for (let y = 0; y < S * 0.26; y++) {
    const t = y / (S * 0.26), w = S * (0.055 + t * 0.03);
    row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.night, G.oil, t);
      if (tx > 0.42 && tx < 0.58 && t < 0.4) b = mix(G.gold, G.goldDk, t * 2);
      return b;
    });
  }
  // lunging legs
  stroke(put, cx - S * 0.03, cy + S * 0.22, cx - S * 0.14, cy + S * 0.32, S * 0.028, () => G.oil);
  stroke(put, cx + S * 0.03, cy + S * 0.22, cx + S * 0.12, cy + S * 0.3, S * 0.028, () => G.night);
  // plague-doctor-ish crimson half-mask + plumed hat
  dome(put, cx, cy - S * 0.12, S * 0.06, S * 0.065, G.vskin, '#ffffff', G.vskinDk);
  for (let y = 0; y < S * 0.045; y++) row(put, Math.round(cy - S * 0.145 + y), cx - S * 0.055, cx + S * 0.055, (tx) => (tx < 0.5 ? mix(G.blood, G.bloodDk, y / (S * 0.045)) : null));
  ell(put, cx, cy - S * 0.185, S * 0.075, S * 0.028, (tx, ty) => mix(G.nightLt, G.oil, ty));
  stroke(put, cx + S * 0.06, cy - S * 0.2, cx + S * 0.15, cy - S * 0.26, S * 0.02, () => G.blood); // plume
  put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.125), G.blood);
  put(Math.round(cx + S * 0.025), Math.round(cy - S * 0.125), G.oil);
  // rapier extended in a perfect line + guard swirl
  stroke(put, cx + S * 0.06, cy + S * 0.0, cx + S * 0.4, cy - S * 0.04, S * 0.014, () => G.silver);
  put(Math.round(cx + S * 0.4), Math.round(cy - S * 0.045), '#ffffff');
  for (let a = 0; a < 6.28; a += 0.7) put(Math.round(cx + S * 0.08 + Math.cos(a) * S * 0.025), Math.round(cy + S * 0.0 + Math.sin(a) * S * 0.025), G.gold);
  // off hand flourish behind
  stroke(put, cx - S * 0.06, cy + S * 0.02, cx - S * 0.16, cy - S * 0.08, S * 0.022, () => G.night);
}

// ========================================================================
const LIST = [
  { n: 1, name: 'CRYPT BAT', role: 'swarm flapper', draw: drawCryptBat },
  { n: 2, name: 'THRALL', role: 'shambling melee', draw: drawThrall },
  { n: 3, name: 'GARGOYLE', role: 'perch + dive', draw: drawGargoyle },
  { n: 4, name: 'MIRROR WRAITH', role: 'blink ambusher', draw: drawMirrorWraith },
  { n: 5, name: 'BLOOD MAIDEN', role: 'blood lobs + pools', draw: drawBloodMaiden },
  { n: 6, name: 'COURT WOLF', role: 'telegraphed pounce', draw: drawCourtWolf },
  { n: 7, name: 'HALBERD GUARD', role: 'lane thruster', draw: drawHalberdGuard },
  { n: 8, name: 'WAX HORROR', role: 'hot-wax slow splash', draw: drawWaxHorror },
  { n: 9, name: 'PORTRAIT PHANTOM', role: 'wall ambusher', draw: drawPortraitPhantom },
  { n: 10, name: 'PHANTOM ORGANIST', role: 'HASTENS mobs', draw: drawOrganist },
  { n: 11, name: 'IRON MAIDEN', role: 'snap-shut ambusher', draw: drawIronMaiden },
  { n: 12, name: 'CRIMSON OOZE', role: 'splits on death', draw: drawCrimsonOoze },
  { n: 13, name: 'VAMPIRE INITIATE', role: 'lifesteal bolts', draw: drawInitiate },
  { n: 14, name: 'HUNCHBACK', role: 'flask lobber (AoE)', draw: drawHunchback },
  { n: 15, name: 'DIRE RATS', role: 'fast swarm pack', draw: drawDireRats },
  { n: 16, name: 'GLASS SAINT', role: 'rooted prism beams', draw: drawGlassSaint },
  { n: 17, name: 'HEADLESS KNIGHT', role: 'sword sweep cone', draw: drawHeadlessKnight },
  { n: 18, name: 'ANIMATED ARMOR', role: 'tank + shield', draw: drawAnimatedArmor },
  { n: 19, name: 'CHANDELIER CREEP', role: 'ceiling drop ambush', draw: drawChandelierCreep },
  { n: 20, name: 'CRIMSON DUELIST', role: 'strafing elite', draw: drawCrimsonDuelist },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'castle_mob_options.png',
  title: 'VAMPIRE CASTLE — MOB CANDIDATES (pick 8, tell me numbers to change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
