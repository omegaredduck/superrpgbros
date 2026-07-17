// artdev/colosseum/render_colosseum_decor.js — 20 numbered COLOSSEUM
// decor candidates, one PNG grid. Imperial arena furniture + spectacle.
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, galea, laurel } = KIT;

// marble block texture fill
function marble(put, x0, y0, x1, y1) {
  for (let y = Math.round(y0); y < y1; y++) {
    const vt = (y - y0) / Math.max(1, y1 - y0);
    row(put, y, x0, x1, (tx) => {
      let b = mix(C.marbleLt, C.marble, clamp(tx * 1.2 + vt * 0.2, 0, 1));
      if (tx > 0.85) b = mix(b, C.marbleDk, 0.5);
      const n = Math.sin(tx * 40 + y * 3.1) * 43758.5453;
      if ((n - Math.floor(n)) > 0.94) b = mix(b, C.marbleDk, 0.3); // veining
      return b;
    });
  }
}
// fluted column shaft
function columnShaft(put, cx, y0, y1, w) {
  for (let y = Math.round(y0); y < y1; y++) {
    row(put, y, cx - w, cx + w, (tx) => {
      let b = mix(C.marbleLt, C.marble, clamp(tx * 1.3, 0, 1));
      if (tx > 0.8) b = mix(b, C.marbleDk, 0.55);
      if (((tx * 7) | 0) % 2 === 0) b = mix(b, C.marbleDk, 0.22); // flutes
      return b;
    });
  }
}

// 1 · EMPEROR'S BOX — purple canopy podium
function drawBox(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  marble(put, S * 0.2, S * 0.5, S * 0.8, S * 0.86);
  row(put, Math.round(S * 0.5), S * 0.18, S * 0.82, () => C.gold);
  // balustrade
  for (let i = 0; i < 7; i++) stroke(put, S * (0.24 + i * 0.09), S * 0.52, S * (0.24 + i * 0.09), S * 0.62, 2.2, () => C.marbleDk);
  row(put, Math.round(S * 0.52), S * 0.22, S * 0.78, () => C.marbleLt);
  // canopy
  for (let y = Math.round(S * 0.2); y < S * 0.32; y++) {
    const t = (y - S * 0.2) / (S * 0.12);
    row(put, y, cx - S * (0.3 + t * 0.05), cx + S * (0.3 + t * 0.05), (tx) => ((tx * 10 | 0) % 2 ? C.purple : C.purpleLt));
  }
  row(put, Math.round(S * 0.32), cx - S * 0.35, cx + S * 0.35, () => C.gold);
  [-0.32, 0.32].forEach(dx => stroke(put, cx + dx * S, S * 0.32, cx + dx * S, S * 0.5, 2.4, () => C.goldDk));
  // throne seat + SPQR shield
  plate(put, cx - S * 0.07, S * 0.56, cx + S * 0.07, S * 0.68, C.gold, C.goldLt, C.goldDk);
  ell(put, cx, S * 0.42, S * 0.05, S * 0.05, (tx, ty) => mix(C.crimson, C.crimsonDk, tx + ty * 0.3));
  laurel(put, cx, S * 0.42, S * 0.06, '#5a7e46');
}
// 2 · BEAST GATE — portcullis in arena wall
function drawGate(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  marble(put, S * 0.16, S * 0.3, S * 0.84, S * 0.86);
  // arch opening (dark)
  for (let y = Math.round(S * 0.42); y < S * 0.86; y++) {
    const t = (y - S * 0.42) / (S * 0.44);
    const w = S * 0.17 * (t < 0.25 ? Math.sqrt(Math.sin(t * 2 * Math.PI / 1.0 + 0.4)) : 1) || S * 0.17;
    row(put, y, cx - Math.min(S * 0.17, w * 1.4), cx + Math.min(S * 0.17, w * 1.4), (tx) => mix('#241812', C.oil, clamp(tx + t * 0.4, 0, 1)));
  }
  // portcullis bars
  for (let i = -2; i <= 2; i++) stroke(put, cx + i * S * 0.065, S * 0.44, cx + i * S * 0.065, S * 0.84, 2, () => C.ironDk);
  [0.52, 0.64, 0.76].forEach(y => row(put, Math.round(S * y), cx - S * 0.15, cx + S * 0.15, () => C.ironDk));
  // glowing beast eyes inside
  put(Math.round(cx - S * 0.04), Math.round(S * 0.6), C.gold); put(Math.round(cx - S * 0.01), Math.round(S * 0.6), C.gold);
  // keystone
  plate(put, cx - S * 0.05, S * 0.34, cx + S * 0.05, S * 0.42, C.marbleDk, C.marble, C.marbleDkk);
}
// 3 · MARBLE COLUMN — intact, capital + base
function drawColumn(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  columnShaft(put, cx, S * 0.24, S * 0.8, S * 0.085);
  plate(put, cx - S * 0.13, S * 0.14, cx + S * 0.13, S * 0.24, C.marble, C.marbleLt, C.marbleDk); // capital
  row(put, Math.round(S * 0.14), cx - S * 0.14, cx + S * 0.14, () => C.marbleLt);
  plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, C.marble, C.marbleLt, C.marbleDk);  // base
}
// 4 · BROKEN COLUMN — battle-worn stump
function drawBroken(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  columnShaft(put, cx, S * 0.44, S * 0.8, S * 0.09);
  // jagged top
  for (let x = -0.09; x <= 0.09; x += 0.012) {
    const h = 0.44 - Math.abs(Math.sin(x * 60)) * 0.06;
    for (let y = h; y < 0.47; y += 0.008) put(Math.round(cx + x * S), Math.round(S * y), C.marbleDk);
  }
  plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, C.marble, C.marbleLt, C.marbleDk);
  // fallen drum chunk beside
  ell(put, cx + S * 0.24, S * 0.8, S * 0.09, S * 0.055, (tx, ty) => mix(C.marble, C.marbleDk, clamp(tx + ty * 0.4, 0, 1)));
  for (let i = 0; i < 3; i++) stroke(put, cx + S * (0.17 + i * 0.05), S * 0.76, cx + S * (0.18 + i * 0.05), S * 0.84, 1, () => C.marbleDkk);
}
// 5 · BRONZE BRAZIER — standing fire bowl
function drawBrazier(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // tripod legs
  [[-0.12, 0.16], [0.12, 0.16], [0, -0.04]].forEach(([dx, dd]) => stroke(put, cx + dx * S * 0.4, S * 0.56, cx + dx * S + dd * 0, S * 0.84, 2.4, () => C.bronzeDk));
  [[-0.12], [0.12]].forEach(([dx]) => stroke(put, cx + dx * S * 0.4, S * 0.56, cx + dx * S, S * 0.84, 2.4, () => C.bronzeDk));
  // bowl
  for (let y = Math.round(S * 0.46); y < S * 0.58; y++) {
    const t = (y - S * 0.46) / (S * 0.12), w = S * (0.16 - t * 0.07);
    row(put, y, cx - w, cx + w, (tx) => mix(C.bronzeLt, C.bronzeDk, clamp(tx * 1.1 + t * 0.3, 0, 1)));
  }
  row(put, Math.round(S * 0.46), cx - S * 0.17, cx + S * 0.17, () => C.bronzeLt);
  // flames
  for (let i = -2; i <= 2; i++) {
    const fx = cx + i * S * 0.05, h = S * (0.12 - Math.abs(i) * 0.025);
    for (let t = 0; t < 1; t += 0.12) {
      const y = S * 0.44 - t * h, w = S * 0.02 * (1 - t);
      ell(put, fx + Math.sin(t * 7 + i) * 2, y, w, w * 1.4, (tx, ty) => (t > 0.6 ? '#ffd34d' : mix('#ff7d3a', '#c23a1a', ty)));
    }
  }
  put(Math.round(cx), Math.round(S * 0.28), '#ffe8a0');
}
// 6 · VICTORY BANNER — crimson vexillum
function drawBanner(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.16);
  stroke(put, cx, S * 0.14, cx, S * 0.86, 2.6, () => C.woodDk);
  stroke(put, cx - S * 0.16, S * 0.2, cx + S * 0.16, S * 0.2, 2.2, () => C.bronze); // crossbar
  // hanging banner
  for (let y = Math.round(S * 0.22); y < S * 0.62; y++) {
    const t = (y - S * 0.22) / (S * 0.4);
    const sway = Math.sin(t * 3) * S * 0.012;
    row(put, y, cx - S * 0.14 + sway, cx + S * 0.14 + sway, (tx) => {
      let b = mix(C.crimsonLt, C.crimson, clamp(tx * 1.2, 0, 1));
      if (tx > 0.82) b = mix(b, C.crimsonDk, 0.5);
      return b;
    });
  }
  // fringe
  for (let i = 0; i < 7; i++) stroke(put, cx - S * 0.12 + i * S * 0.04, S * 0.62, cx - S * 0.12 + i * S * 0.04, S * 0.67, 1.4, () => C.gold);
  // gold SPQR-ish glyphs + laurel
  laurel(put, cx, S * 0.34, S * 0.055, C.goldLt);
  [0.44, 0.5].forEach((y, i) => row(put, Math.round(S * y), cx - S * 0.07, cx + S * 0.07, () => (i ? C.goldDk : C.gold)));
  // spearhead finial
  stroke(put, cx, S * 0.14, cx, S * 0.08, 2, () => C.bronzeLt);
}
// 7 · GLADIATOR STATUE — bronze victor on plinth
function drawStatue(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  marble(put, cx - S * 0.14, S * 0.7, cx + S * 0.14, S * 0.86);
  // bronze figure — sword raised
  const b = [C.bronze, C.bronzeLt, C.bronzeDk];
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, S * 0.56, cx + s * S * 0.04, S * 0.7, S * 0.024, () => b[0]));
  for (let y = S * 0.4; y < S * 0.57; y++) {
    const t = (y - S * 0.4) / (S * 0.17), w = S * (0.06 + t * 0.012);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(b[1], b[2], clamp(tx * 1.1 + t * 0.2, 0, 1)));
  }
  stroke(put, cx + S * 0.05, S * 0.44, cx + S * 0.13, S * 0.32, S * 0.018, () => b[0]);
  stroke(put, cx + S * 0.13, S * 0.31, cx + S * 0.18, S * 0.2, 2.2, () => b[1]); // raised sword
  stroke(put, cx - S * 0.05, S * 0.44, cx - S * 0.12, S * 0.52, S * 0.018, () => b[0]);
  ell(put, cx, S * 0.36, S * 0.04, S * 0.045, (tx, ty) => mix(b[1], b[2], tx + ty * 0.3));
  galea(put, cx, S * 0.325, S * 0.045, [b[2], b[0]], b);
  // verdigris streaks
  [[0.02, 0.5], [-0.03, 0.6]].forEach(([dx, y]) => stroke(put, cx + dx * S, S * y, cx + dx * S, S * (y + 0.08), 1.2, () => '#4a8a6a'));
}
// 8 · WEAPON RACK — swords, spears, shield
function drawRack(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  [-0.2, 0.2].forEach(dx => stroke(put, cx + dx * S, S * 0.34, cx + dx * S, S * 0.84, 2.6, () => C.woodDk));
  [0.38, 0.6].forEach(y => stroke(put, cx - S * 0.22, S * y, cx + S * 0.22, S * y, 2.2, () => C.wood));
  // hung gladii
  [-0.1, 0].forEach(dx => { stroke(put, cx + dx * S, S * 0.4, cx + dx * S, S * 0.56, 1.8, () => C.ironLt); put(Math.round(cx + dx * S), Math.round(S * 0.4), C.gold); });
  // leaning pilum
  stroke(put, cx + S * 0.12, S * 0.38, cx + S * 0.16, S * 0.84, 1.6, () => C.wood);
  put(Math.round(cx + S * 0.115), Math.round(S * 0.36), C.ironLt);
  // shield leaning at base
  ell(put, cx - S * 0.12, S * 0.72, S * 0.08, S * 0.1, (tx, ty) => mix(C.crimson, C.crimsonDk, clamp(tx + ty * 0.3, 0, 1)));
  ell(put, cx - S * 0.12, S * 0.72, S * 0.025, S * 0.03, (tx, ty) => mix(C.gold, C.goldDk, ty));
}
// 9 · TRAPDOOR — arena floor hatch (ajar)
function drawTrapdoor(put, S) {
  const cx = S * 0.5;
  // sand around
  for (let y = Math.round(S * 0.3); y < S * 0.85; y++) row(put, y, S * 0.12, S * 0.88, (tx) => { const n = Math.sin(tx * 50 + y * 7) * 43758.5; return mix(C.sand, C.sandDk, (n - Math.floor(n)) * 0.4); });
  // frame
  plate(put, cx - S * 0.22, S * 0.44, cx + S * 0.22, S * 0.74, C.woodDk, C.wood, '#241812');
  // dark opening (half)
  for (let y = Math.round(S * 0.47); y < S * 0.71; y++) row(put, y, cx - S * 0.19, cx, (tx) => mix('#241812', C.oil, tx + 0.3));
  // door swung up
  for (let y = Math.round(S * 0.47); y < S * 0.71; y++) {
    const t = (y - S * 0.47) / (S * 0.24);
    row(put, y, cx + S * 0.01, cx + S * 0.19, (tx) => {
      let b = mix(C.woodLt, C.wood, clamp(tx * 1.2, 0, 1));
      if (((tx * 5) | 0) % 2 === 0) b = mix(b, C.woodDk, 0.35);
      return b;
    });
  }
  stroke(put, cx + S * 0.01, S * 0.47, cx + S * 0.01, S * 0.71, 1.6, () => C.ironDk); // hinge line
  put(Math.round(cx + S * 0.16), Math.round(S * 0.59), C.ironLt); // handle
  // claws reaching out
  [[-0.1, 0.5], [-0.05, 0.47]].forEach(([dx, y]) => stroke(put, cx + dx * S, S * (y + 0.06), cx + dx * S + 2, S * y, 1.4, () => '#3a2a14'));
}
// 10 · BONE PILE — the arena remembers
function drawBones(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // mound
  ell(put, cx, S * 0.72, S * 0.2, S * 0.09, (tx, ty) => mix(C.sandDk, C.sandDkk, clamp(tx + ty * 0.4, 0, 1)));
  // skull
  ell(put, cx - S * 0.06, S * 0.62, S * 0.055, S * 0.05, (tx, ty) => mix(C.bone, C.boneDk, clamp(tx + ty * 0.4, 0, 1)));
  put(Math.round(cx - S * 0.08), Math.round(S * 0.61), C.oil);
  put(Math.round(cx - S * 0.04), Math.round(S * 0.61), C.oil);
  for (let x = -0.09; x < -0.02; x += 0.014) put(Math.round(cx + x * S), Math.round(S * 0.66), C.boneDk); // teeth
  // ribs + long bones
  for (let i = 0; i < 3; i++) { const a = 0.5 + i * 0.5; stroke(put, cx + S * 0.04, S * 0.68, cx + S * (0.04 + Math.cos(a) * 0.12), S * (0.68 - Math.sin(a) * 0.07), 1.4, () => C.boneDk); }
  stroke(put, cx + S * 0.08, S * 0.74, cx + S * 0.2, S * 0.7, 2, () => C.bone);
  ell(put, cx + S * 0.21, S * 0.695, S * 0.015, S * 0.015, () => C.bone);
  stroke(put, cx - S * 0.18, S * 0.75, cx - S * 0.08, S * 0.77, 2, () => C.boneDk);
  // broken gladius stuck in the sand
  stroke(put, cx + S * 0.14, S * 0.56, cx + S * 0.12, S * 0.7, 1.8, () => C.ironLt);
  stroke(put, cx + S * 0.11, S * 0.57, cx + S * 0.17, S * 0.585, 1.6, () => C.leatherDk);
}
// 11 · SPINA OBELISK — central barrier monument
function drawObelisk(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // stepped base
  plate(put, cx - S * 0.16, S * 0.76, cx + S * 0.16, S * 0.86, C.marble, C.marbleLt, C.marbleDk);
  plate(put, cx - S * 0.11, S * 0.68, cx + S * 0.11, S * 0.76, C.marbleDk, C.marble, C.marbleDkk);
  // tapering shaft — rose granite
  for (let y = Math.round(S * 0.2); y < S * 0.68; y++) {
    const t = (y - S * 0.2) / (S * 0.48), w = S * (0.035 + t * 0.045);
    row(put, y, cx - w, cx + w, (tx) => {
      let b = mix('#c88a6a', '#8a5038', clamp(tx * 1.25, 0, 1));
      if (tx > 0.8) b = mix(b, '#5e3222', 0.5);
      if ((y % 9) === 0 && Math.abs(tx - 0.5) < 0.25) b = mix(b, '#5e3222', 0.4); // glyph nicks
      return b;
    });
  }
  // pyramidion — gilded
  for (let y = 0; y < S * 0.08; y++) { const t = y / (S * 0.08), w = S * 0.035 * t; row(put, Math.round(S * 0.12 + y), cx - w, cx + w, (tx) => mix(C.goldLt, C.goldDk, tx + (1 - t) * 0.3)); }
}
// 12 · LAUREL ARCH — victory arch
function drawArch(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  [-0.24, 0.24].forEach(dx => { columnShaft(put, cx + dx * S, S * 0.4, S * 0.84, S * 0.05); plate(put, cx + dx * S - S * 0.07, S * 0.84, cx + dx * S + S * 0.07, S * 0.88, C.marble, C.marbleLt, C.marbleDk); });
  // arch span
  for (let a = 0; a <= Math.PI; a += 0.03) {
    const x = cx + Math.cos(a) * S * 0.24, y = S * 0.4 - Math.sin(a) * S * 0.14;
    stroke(put, x, y, x, y + S * 0.05, 2.6, () => mix(C.marble, C.marbleDk, Math.abs(Math.cos(a))));
  }
  plate(put, cx - S * 0.32, S * 0.18, cx + S * 0.32, S * 0.28, C.marble, C.marbleLt, C.marbleDk); // attic
  laurel(put, cx, S * 0.24, S * 0.06, '#5a7e46');
  row(put, Math.round(S * 0.28), cx - S * 0.32, cx + S * 0.32, () => C.gold);
  // hanging laurel garland under the arch
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.14) put(Math.round(cx - Math.cos(a) * S * 0.2), Math.round(S * 0.42 + Math.sin(a) * S * 0.05), '#5a7e46');
}
// 13 · CHAIN POST — shackle anchor
function drawChains(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // iron post
  stroke(put, cx, S * 0.34, cx, S * 0.84, S * 0.036, () => C.ironDk);
  dome(put, cx, S * 0.33, S * 0.032, S * 0.026, C.iron, C.ironLt, C.ironDk);
  // chains draping to the ground both sides
  [[-1, 0.22], [1, 0.18]].forEach(([s, reach]) => {
    let px = cx + s * S * 0.02, py = S * 0.4;
    for (let t = 0; t < 1; t += 0.09) {
      const nx = cx + s * S * (0.02 + t * reach), ny = S * (0.4 + t * t * 0.4);
      ell(put, nx, ny, S * 0.014, S * 0.02, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.1 ? mix(C.ironLt, C.ironDk, tx) : null));
      px = nx; py = ny;
    }
    // shackle cuff at the end
    ell(put, cx + s * S * (0.02 + reach), S * 0.8, S * 0.03, S * 0.026, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? C.iron : null));
  });
}
// 14 · TORCH POLE — night games lighting
function drawTorch(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.14);
  stroke(put, cx, S * 0.3, cx, S * 0.86, 2.6, () => C.woodDk);
  // bracket + bowl
  stroke(put, cx, S * 0.34, cx + S * 0.08, S * 0.28, 2, () => C.bronzeDk);
  ell(put, cx + S * 0.09, S * 0.27, S * 0.045, S * 0.028, (tx, ty) => mix(C.bronzeLt, C.bronzeDk, tx + ty * 0.4));
  // flame
  for (let t = 0; t < 1; t += 0.14) {
    const y = S * 0.24 - t * S * 0.09, w = S * 0.024 * (1 - t);
    ell(put, cx + S * 0.09 + Math.sin(t * 8) * 1.5, y, w, w * 1.5, (tx, ty) => (t > 0.55 ? '#ffd34d' : mix('#ff7d3a', '#c23a1a', ty)));
  }
  put(Math.round(cx + S * 0.09), Math.round(S * 0.13), '#ffe8a0');
  // wrapped grip
  [0.44, 0.48, 0.52].forEach(y => row(put, Math.round(S * y), cx - S * 0.014, cx + S * 0.014, () => C.leather));
}
// 15 · MARBLE PLINTH — empty pedestal (loot spot?)
function drawPlinth(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  plate(put, cx - S * 0.16, S * 0.72, cx + S * 0.16, S * 0.84, C.marble, C.marbleLt, C.marbleDk);
  marble(put, cx - S * 0.12, S * 0.5, cx + S * 0.12, S * 0.72);
  plate(put, cx - S * 0.15, S * 0.44, cx + S * 0.15, S * 0.5, C.marble, C.marbleLt, C.marbleDk);
  // inscription lines
  [0.58, 0.62, 0.66].forEach((y, i) => row(put, Math.round(S * y), cx - S * (0.08 - i * 0.02), cx + S * (0.08 - i * 0.02), () => C.marbleDkk));
  // dust + a lone laurel left on top
  laurel(put, cx, S * 0.42, S * 0.05, '#5a7e46');
}
// 16 · CAGE WAGON — beast transport
function drawCage(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  // bed + wheels
  plate(put, cx - S * 0.26, S * 0.62, cx + S * 0.26, S * 0.7, C.wood, C.woodLt, C.woodDk);
  [[-0.17], [0.17]].forEach(([dx]) => {
    const wx = cx + dx * S, wy = S * 0.77;
    ell(put, wx, wy, S * 0.07, S * 0.07, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? mix(C.wood, C.woodDk, tx) : null));
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; stroke(put, wx - Math.cos(a) * S * 0.07, wy - Math.sin(a) * S * 0.07, wx + Math.cos(a) * S * 0.07, wy + Math.sin(a) * S * 0.07, 1.2, () => C.woodDk); }
  });
  // cage box + bars
  for (let y = Math.round(S * 0.36); y < S * 0.62; y++) row(put, y, cx - S * 0.24, cx + S * 0.24, (tx) => mix('#241812', C.oil, clamp(tx * 0.8 + 0.2, 0, 1)));
  plate(put, cx - S * 0.26, S * 0.33, cx + S * 0.26, S * 0.37, C.iron, C.ironLt, C.ironDk);
  for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.07, S * 0.36, cx + i * S * 0.07, S * 0.62, 2, () => C.iron);
  // beast eyes + claw
  put(Math.round(cx - S * 0.03), Math.round(S * 0.48), C.gold); put(Math.round(cx + S * 0.01), Math.round(S * 0.48), C.gold);
  stroke(put, cx + S * 0.1, S * 0.56, cx + S * 0.13, S * 0.6, 1.4, () => C.furDk);
}
// 17 · VELARIUM MAST — awning rig + sail shade
function drawMast(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.16);
  stroke(put, cx - S * 0.08, S * 0.2, cx - S * 0.08, S * 0.86, 2.8, () => C.woodDk);
  // angled boom
  stroke(put, cx - S * 0.08, S * 0.26, cx + S * 0.22, S * 0.34, 2.2, () => C.wood);
  // canvas sail triangle
  for (let y = Math.round(S * 0.35); y < S * 0.56; y++) {
    const t = (y - S * 0.35) / (S * 0.21);
    row(put, y, cx - S * 0.06 + t * S * 0.02, cx + S * (0.21 - t * 0.24), (tx) => {
      let b = mix('#f4e8c8', '#c8b088', clamp(tx + t * 0.3, 0, 1));
      if (((tx * 8) | 0) % 3 === 0) b = mix(b, C.crimsonLt, 0.25); // stripe
      return b;
    });
  }
  // rigging lines
  stroke(put, cx + S * 0.22, S * 0.34, cx + S * 0.14, S * 0.84, 1, () => C.leatherDk);
  stroke(put, cx - S * 0.08, S * 0.2, cx + S * 0.1, S * 0.56, 1, () => C.boneDk);
  // cleat
  put(Math.round(cx + S * 0.14), Math.round(S * 0.84), C.bronze);
}
// 18 · STANDS SECTION — crowd tier wedge
function drawStands(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.36);
  // three marble tiers
  [0, 1, 2].forEach(t => {
    const y0 = S * (0.3 + t * 0.18);
    marble(put, S * (0.14 + t * 0.04), y0, S * (0.86 - t * 0.04), y0 + S * 0.1);
    // crowd heads — colored dots
    for (let i = 0; i < 12 - t * 2; i++) {
      const hx = S * (0.18 + t * 0.05) + i * S * (0.055 + t * 0.004);
      const n = Math.sin(hx * 13.7 + t * 7) * 43758.5; const f = n - Math.floor(n);
      const cols = [C.crimsonLt, C.purpleLt, C.gold, C.skin, C.boneDk, C.skinDk];
      ell(put, hx, y0 - S * 0.02, S * 0.02, S * 0.024, (tx, ty) => mix(cols[(f * 6) | 0], C.oil, ty * 0.5));
      // waving arm here + there
      if (f > 0.7) stroke(put, hx + S * 0.01, y0 - S * 0.035, hx + S * 0.025, y0 - S * 0.06, 1.2, () => cols[(f * 6) | 0]);
    }
  });
  // front wall
  marble(put, S * 0.1, S * 0.78, S * 0.9, S * 0.86);
  row(put, Math.round(S * 0.78), S * 0.1, S * 0.9, () => C.gold);
}
// 19 · PALUS DUMMY — training post
function drawPalus(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.18);
  stroke(put, cx, S * 0.3, cx, S * 0.84, S * 0.05, () => C.wood);
  // hack marks
  [[0.4, -1], [0.48, 1], [0.56, -1], [0.62, 1]].forEach(([y, s]) => stroke(put, cx - s * S * 0.03, S * y, cx + s * S * 0.03, S * (y - 0.02), 1.4, () => C.woodDk));
  // strapped shield + old helm
  ell(put, cx - S * 0.02, S * 0.35, S * 0.05, S * 0.05, (tx, ty) => mix(C.bronze, C.bronzeDk, tx + ty * 0.3));
  galea(put, cx, S * 0.3, S * 0.05, [C.crimsonDk, C.crimson], [C.bronzeDk, C.bronze, '#3a2410']);
  ell(put, cx + S * 0.09, S * 0.52, S * 0.055, S * 0.075, (tx, ty) => mix(C.crimsonDk, '#3a0c0e', clamp(tx + ty * 0.3, 0, 1)));
  // straw base
  for (let i = -4; i <= 4; i++) stroke(put, cx + i * S * 0.02, S * 0.84, cx + i * S * 0.03, S * 0.78, 1, () => '#c8b060');
}
// 20 · SHE-WOLF STATUE — gilded Capitoline wolf
function drawWolf(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  marble(put, cx - S * 0.2, S * 0.7, cx + S * 0.2, S * 0.84);
  const g = [C.gold, C.goldLt, C.goldDk];
  // wolf body
  ell(put, cx + S * 0.02, S * 0.56, S * 0.14, S * 0.07, (tx, ty) => mix(g[1], g[2], clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [[-0.08], [0.1]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.6, cx + dx * S, S * 0.7, S * 0.02, () => g[0]));
  // head alert, looking left
  stroke(put, cx - S * 0.12, S * 0.54, cx - S * 0.17, S * 0.46, S * 0.03, () => g[0]);
  ell(put, cx - S * 0.185, S * 0.44, S * 0.04, S * 0.032, (tx, ty) => mix(g[1], g[2], tx + ty * 0.3));
  put(Math.round(cx - S * 0.22), Math.round(S * 0.445), g[2]);
  [[-0.2, 0.41], [-0.165, 0.405]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S + 1.4, S * (dy - 0.02), 1.4, () => g[0])); // ears
  put(Math.round(cx - S * 0.19), Math.round(S * 0.43), C.oil); // eye
  stroke(put, cx + S * 0.16, S * 0.55, cx + S * 0.22, S * 0.5, S * 0.014, () => g[0]); // tail
  // the twins beneath
  [[-0.03, 0.66], [0.05, 0.66]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.022, S * 0.02, (tx, ty) => mix(g[1], g[2], ty)));
}

const LIST = [
  { n: 1, name: 'EMPERORS BOX', role: 'purple canopy podium', draw: drawBox },
  { n: 2, name: 'BEAST GATE', role: 'portcullis + eyes', draw: drawGate },
  { n: 3, name: 'MARBLE COLUMN', role: 'intact, fluted', draw: drawColumn },
  { n: 4, name: 'BROKEN COLUMN', role: 'stump + fallen drum', draw: drawBroken },
  { n: 5, name: 'BRONZE BRAZIER', role: 'standing fire bowl', draw: drawBrazier },
  { n: 6, name: 'VICTORY BANNER', role: 'crimson vexillum', draw: drawBanner },
  { n: 7, name: 'GLADIATOR STATUE', role: 'bronze victor', draw: drawStatue },
  { n: 8, name: 'WEAPON RACK', role: 'swords + shield', draw: drawRack },
  { n: 9, name: 'TRAPDOOR', role: 'floor hatch, ajar', draw: drawTrapdoor },
  { n: 10, name: 'BONE PILE', role: 'skull + broken sword', draw: drawBones },
  { n: 11, name: 'SPINA OBELISK', role: 'granite + gilt tip', draw: drawObelisk },
  { n: 12, name: 'LAUREL ARCH', role: 'victory arch', draw: drawArch },
  { n: 13, name: 'CHAIN POST', role: 'shackle anchor', draw: drawChains },
  { n: 14, name: 'TORCH POLE', role: 'night games light', draw: drawTorch },
  { n: 15, name: 'MARBLE PLINTH', role: 'empty pedestal', draw: drawPlinth },
  { n: 16, name: 'CAGE WAGON', role: 'beast transport', draw: drawCage },
  { n: 17, name: 'VELARIUM MAST', role: 'awning rig + sail', draw: drawMast },
  { n: 18, name: 'STANDS SECTION', role: 'crowd tier wedge', draw: drawStands },
  { n: 19, name: 'PALUS DUMMY', role: 'training post', draw: drawPalus },
  { n: 20, name: 'SHE-WOLF STATUE', role: 'gilded wolf + twins', draw: drawWolf },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_decor_options.png', title: 'COLOSSEUM — DECOR CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
