// artdev/belly/render_belly_boss.js — TITAN WHALE boss work-ups.
// Pose LOCKED: #2 HEAD-ON MAW (faces the arena, mouth = the wall).
// whaleGod(put, S, p) fully parameterized; 10 numbered looks.
'use strict';
const KIT = require('./belly_kit.js');
const { B, mix, clamp, ell, row, stroke, renderSheet, fin, glowDot } = KIT;

function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

// ---- the parameterized whale (head-on, beached, mouth agape) ----
function whaleGod(put, S, p) {
  p = p || {};
  const u = S / 200, X = v => v * u;
  const hideC = p.hide || '#4a6a8a', hideDk = p.hideDk || '#1a2a3e', hideLt = p.hideLt || '#6a8aa8';
  const belly = p.belly || '#c8d0d4', bellyDk = p.bellyDk || '#7a8a90';
  const eyeC = p.eye || '#d84a4a', eyeLt = p.eyeLt || '#ff9a8a';
  const seed = p.seed || 1;
  const blockhead = !!p.blockhead; // sperm-whale square top
  const mouthTeeth = !!p.teeth;    // teeth instead of baleen

  function hide(tx, ty, x, y) {
    let b = mix(hideC, hideDk, clamp(tx * 0.6 + ty * 0.7, 0, 1));
    b = mix(mix(hideLt, b, clamp(ty * 2.2, 0, 1)), b, 0.55); // top light
    // mottling
    if (p.mottle && h2(x >> 3, y >> 3, seed) > 0.82) b = mix(b, hideLt, 0.3);
    // bio glow spots
    return b;
  }
  if (!p.noSand) {
    for (let y = Math.round(X(160)); y < S; y++) row(put, y, 0, S, (tx) => mix('#e0c88a', '#b09454', clamp((y / u - 160) / 40 + tx * 0.2, 0, 1)));
  }
  // head mass
  const yTop = Math.round(X(14)), yBot = Math.round(X(154));
  for (let y = yTop; y <= yBot; y++) {
    const t = (y - yTop) / Math.max(1, yBot - yTop);
    let w;
    if (blockhead) w = X(78 * Math.min(1, 0.82 + t * 0.3)); // square sides
    else w = X(30 + Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5) * 64);
    const chin = t > 0.62;
    row(put, y, X(100) - w, X(100) + w, (tx) => {
      const edge = Math.abs(tx - 0.5) * 2;
      const dx = Math.round(X(100) - w + tx * 2 * w), dy = y;
      if (chin && edge < 0.92 && !p.noChin) {
        let b = mix(belly, bellyDk, clamp(edge * 0.5 + (t - 0.62), 0, 1));
        if (p.chinPleats && (dy % Math.max(3, Math.round(X(5))) === 0)) b = mix(b, bellyDk, 0.5); // throat pleats
        return b;
      }
      return hide(edge * 0.7, t, dx, dy);
    });
  }
  // blockhead brow ledge
  if (blockhead) {
    for (let y = yTop; y < yTop + X(8); y++) row(put, Math.round(y), X(100) - X(76), X(100) + X(76), (tx) => mix(hideLt, hideC, clamp(Math.abs(tx - 0.5) * 2 + (y - yTop) / X(8) * 0.5, 0, 1)));
  }
  // MOUTH AGAPE
  const my0 = Math.round(X(108)), my1 = Math.round(X(150));
  for (let y = my0; y <= my1; y++) {
    const t = (y - my0) / (my1 - my0);
    const w = X((0.35 + Math.sin(Math.min(t * 1.3, 1) * Math.PI) * 0.65) * (p.mouthW || 56));
    row(put, y, X(100) - w, X(100) + w, (tx) => mix(p.maw || '#3a1218', B.oil, clamp(Math.abs(tx - 0.5) * 1.4 + t * 0.4, 0, 1)));
  }
  if (mouthTeeth) {
    // teeth INSIDE the maw: anchored to the dark mouth's own boundary
    const mw = p.mouthW || 56;
    const wAt = t => (0.35 + Math.sin(Math.min(t * 1.3, 1) * Math.PI) * 0.65) * mw;
    const bounds = dx => { // maw top/bottom (200-space y) at horizontal offset dx
      let tT = null, tB = null;
      for (let t = 0; t <= 1; t += 0.01) if (wAt(t) >= Math.abs(dx) + 2) { if (tT === null) tT = t; tB = t; }
      return tT === null ? null : [108 + tT * 42, 108 + tB * 42];
    };
    for (let i = -6; i <= 6; i++) { // upper row — hangs DOWN into the dark
      const dx = i * 6.5, bb = bounds(dx);
      if (!bb) continue;
      const len = 6.5 + (6 - Math.abs(i)) * 0.7;
      const tx0 = X(100 + dx);
      fin(put, tx0, X(bb[0] + len), tx0 - X(2), X(bb[0] + 0.5), tx0 + X(2), X(bb[0] + 0.5), B.tooth, '#8a8268');
    }
    for (let i = -6; i <= 5; i++) { // lower row — points UP into the dark, half-pitch offset
      const dx = i * 6.5 + 3.25, bb = bounds(dx);
      if (!bb) continue;
      const len = 5 + (5.5 - Math.abs(i + 0.5)) * 0.6;
      const tx0 = X(100 + dx);
      fin(put, tx0, X(bb[1] - len), tx0 - X(1.8), X(bb[1] - 0.5), tx0 + X(1.8), X(bb[1] - 0.5), B.tooth, '#6a6248');
    }
  } else {
    for (let i = -8; i <= 8; i++) stroke(put, X(100 + i * 6), X(110), X(100 + i * 6.3), X(120 + (8 - Math.abs(i)) * 0.8), 1.2, () => p.baleenC || '#4a4238');
  }
  // uvula glow deep in the throat (arena tell light)
  if (p.throatGlow) glowDot(put, X(100), X(126), X(4), p.throatGlow, B.white);
  // eyes low on the sides
  [[-1], [1]].forEach(([s]) => {
    const ex = X(100 + s * 70), ey = X(104);
    ell(put, ex, ey, X(5), X(6), () => B.oil);
    ell(put, ex - X(1.2), ey - X(1.6), X(1.6), X(1.8), () => eyeLt);
    // brow wrinkles
    stroke(put, ex - s * X(2), ey - X(9), ex + s * X(8), ey - X(12), 1.2, () => hideDk);
  });
  // blowhole spray
  if (!p.noSpray) [[96, 8], [102, 4], [108, 9], [100, 12]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), B.white));
  // barnacle crust
  const bn = p.barnacles != null ? p.barnacles : 3;
  let bs = seed;
  const rnd = () => { bs = (bs * 1103515245 + 12345) & 0x7fffffff; return bs / 0x7fffffff; };
  for (let i = 0; i < bn * 3; i++) {
    const bx2 = 40 + rnd() * 120, by2 = 24 + rnd() * 70;
    ell(put, X(bx2), X(by2), X(2.6 + rnd() * 2), X(2 + rnd() * 1.4), (tx, ty) => mix(B.bone, B.boneDk, clamp(ty + tx * 0.3, 0, 1)));
    put(Math.round(X(bx2)), Math.round(X(by2)), B.oil);
  }
  // scars
  (p.scars || []).forEach(([sx, sy, ex2, ey2]) => {
    stroke(put, X(sx), X(sy), X(ex2), X(ey2), X(1.4), () => mix(belly, hideDk, 0.3));
    stroke(put, X(sx) + 1, X(sy) + 1, X(ex2) + 1, X(ey2) + 1, X(0.6), () => hideDk);
  });
  // sucker-ring scars (kraken)
  (p.suckerScars || []).forEach(([sx, sy, r]) => {
    for (let a = 0; a < 6.28; a += 0.5) put(Math.round(X(sx) + Math.cos(a) * X(r)), Math.round(X(sy) + Math.sin(a) * X(r) * 0.8), mix(belly, hideDk, 0.4));
  });
  // harpoons stuck in the brow
  for (let i = 0; i < (p.harpoons || 0); i++) {
    const hx = X(60 + i * 26 + (i % 2) * 8), hy = X(30 + (i % 3) * 10);
    stroke(put, hx, hy, hx + X(10), hy - X(22), X(1.6), () => B.woodDk);
    fin(put, hx, hy, hx - X(3), hy - X(5), hx + X(3), hy - X(4), '#8a929e', '#4a525e');
    stroke(put, hx + X(10), hy - X(22), hx + X(14), hy - X(26), X(1), () => B.rope); // trailing line
  }
  // kelp/weed drape off the brow
  for (let i = 0; i < (p.kelp || 0); i++) {
    const kx = X(52 + i * 32), ky = X(20 + (i % 2) * 8);
    for (let t = 0; t < 1; t += 0.06) put(Math.round(kx + Math.sin(t * 5 + i) * X(2.5)), Math.round(ky + t * X(26)), (t * 8 | 0) % 2 ? '#4a6a2a' : '#243a12');
  }
  // bio glow dots (abyssal gene)
  for (let i = 0; i < (p.bioDots || 0); i++) {
    const gx = 46 + ((i * 37) % 110), gy = 26 + ((i * 53) % 66);
    glowDot(put, X(gx), X(gy), X(1.4), p.bioC || B.glow, B.glowLt);
  }
  // gold crust flecks (it ate the treasure)
  for (let i = 0; i < (p.goldFlecks || 0); i++) {
    const gx = 44 + ((i * 41) % 112), gy = 30 + ((i * 67) % 60);
    put(Math.round(X(gx)), Math.round(X(gy)), i % 2 ? B.gold : B.goldLt);
  }
  // carved glowing runes
  if (p.runes) {
    [[70, 40], [100, 30], [130, 40], [85, 60], [115, 60]].forEach(([rx, ry], i) => {
      const rc = p.runeC || B.glow;
      stroke(put, X(rx - 4), X(ry), X(rx + 4), X(ry), 1.2, () => rc);
      stroke(put, X(rx), X(ry - 4), X(rx + (i % 2 ? 3 : -3)), X(ry + 4), 1.2, () => rc);
      put(Math.round(X(rx)), Math.round(X(ry - 5)), B.white);
    });
  }
  // coral/anemone growth
  if (p.reef) {
    [[60, 34], [104, 22], [142, 38]].forEach(([rx, ry], i) => {
      for (let a = -0.5; a < 3.6; a += 0.55) stroke(put, X(rx), X(ry), X(rx + Math.cos(a) * 7), X(ry - Math.abs(Math.sin(a)) * 8), X(1.6), () => (i % 2 ? '#e05a3a' : '#c87a8a'));
      put(Math.round(X(rx)), Math.round(X(ry - 2)), '#ff9a6a');
    });
  }
  // orca eye patches
  if (p.orcaPatch) [[-1], [1]].forEach(([s]) => {
    ell(put, X(100 + s * 62), X(88), X(10), X(6), (tx, ty) => mix('#f4f4f4', '#b8c2d0', clamp(tx + ty * 0.4, 0, 1)));
  });
  // sand mound
  if (!p.noSand) for (let x = 0; x < S; x += 3) put(x, Math.round(X(159)), '#f0dca8');
}

// ---- 10 looks ----
const LOOKS = [
  { n: 1, name: 'BLUE TITAN', role: 'classic blue, baleen wall', p: { hide: '#4a6a8a', hideLt: '#6a8aa8', hideDk: '#1a2a3e', mottle: 1, chinPleats: 1, barnacles: 2, seed: 3 } },
  { n: 2, name: 'THE PALE ONE', role: 'white legend, old harpoons', p: { hide: '#c8ccd0', hideLt: '#eef2f4', hideDk: '#6a7278', belly: '#e8ecee', bellyDk: '#9aa4aa', maw: '#4a2028', harpoons: 3, scars: [[58, 44, 84, 52], [120, 36, 146, 48], [76, 70, 96, 76]], barnacles: 1, eye: '#d84a4a', seed: 7 } },
  { n: 3, name: 'BARNACLE KING', role: 'crusted + kelp drape', p: { hide: '#5a6a5a', hideLt: '#7a8a72', hideDk: '#242e22', barnacles: 8, kelp: 4, chinPleats: 1, seed: 11 } },
  { n: 4, name: 'ORCA DRESS', role: 'black hide, white patches, TEETH', p: { hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12', belly: '#f4f4f4', bellyDk: '#b8c2d0', teeth: 1, orcaPatch: 1, barnacles: 0, seed: 13 } },
  { n: 5, name: 'SPERM BLOCKHEAD', role: 'square brow, toothed jaw', p: { blockhead: 1, hide: '#6a625a', hideLt: '#8a8078', hideDk: '#2e2a24', teeth: 1, mouthW: 44, scars: [[64, 40, 92, 46]], suckerScars: [[130, 50, 6], [142, 62, 4]], barnacles: 2, seed: 17 } },
  { n: 6, name: 'SCAR VETERAN', role: 'kraken-marked survivor', p: { hide: '#5a6a7a', hideLt: '#7a8a9a', hideDk: '#222c38', scars: [[56, 36, 88, 46], [108, 30, 138, 42], [70, 62, 92, 70], [118, 58, 142, 66]], suckerScars: [[66, 48, 7], [80, 56, 5], [128, 48, 6], [140, 58, 4]], barnacles: 3, seed: 19 } },
  { n: 7, name: 'ABYSSAL STRAIN', role: 'deep gene, bio lights', p: { hide: '#1a2230', hideLt: '#2e3a4e', hideDk: '#0a0e16', belly: '#3a4658', bellyDk: '#222c3a', bioDots: 9, bioC: '#41d6f6', throatGlow: '#41d6f6', eye: '#41d6f6', eyeLt: '#c2fbff', barnacles: 1, seed: 23 } },
  { n: 8, name: 'GOLD HOARDER', role: 'treasure crusted in the hide', p: { hide: '#4a5a6a', hideLt: '#6a7a8a', hideDk: '#1c2630', goldFlecks: 14, throatGlow: '#e0a832', scars: [[70, 44, 90, 50]], barnacles: 2, eye: '#e0a832', eyeLt: '#f8d878', seed: 29 } },
  { n: 9, name: 'REEF BACK', role: 'coral garden grown on it', p: { hide: '#3a6a6a', hideLt: '#5a8a86', hideDk: '#14302e', reef: 1, barnacles: 5, kelp: 2, chinPleats: 1, seed: 31 } },
  { n: 10, name: 'RUNE LEVIATHAN', role: 'carved old-god glow', p: { hide: '#3a3a52', hideLt: '#56567a', hideDk: '#16162a', runes: 1, runeC: '#7df9d8', throatGlow: '#7df9d8', eye: '#7df9d8', eyeLt: '#d8fff2', barnacles: 1, seed: 37 } },
];

const LIST = LOOKS.map(L => ({ n: L.n, name: L.name, role: L.role, draw: (put, S) => whaleGod(put, S, L.p) }));

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'belly_boss_options.png', title: 'TITAN WHALE — 10 LOOKS (head-on maw pose) — pick a number', S: 200, cols: 5, scale: 2 });
}
module.exports = { whaleGod, LOOKS, LIST };
