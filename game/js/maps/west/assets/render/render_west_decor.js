// artdev/west/render_west_decor.js — 20 numbered WILD WEST TOWN decor
// candidates, one PNG grid. Frontier-town buildings + street props.
'use strict';
const KIT = require('./west_kit.js');
const { W, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, hat, bandana, gun, badge } = KIT;

// ---- shared building helpers -------------------------------------------
// horizontal wood siding across a rect
function siding(put, x0, y0, x1, y1, base, lt, dk) {
  for (let y = Math.round(y0); y < y1; y++) {
    const plank = Math.floor((y - y0) / 4) % 2 === 0;
    row(put, y, x0, x1, (tx) => {
      let b = mix(lt, base, clamp(tx * 1.25, 0, 1));
      if (tx > 0.86) b = mix(b, dk, 0.5);
      if (plank && (y - Math.round(y0)) % 4 === 0) b = mix(b, dk, 0.45);
      return b;
    });
  }
}
// vertical plank wall
function vplanks(put, x0, y0, x1, y1, base, lt, dk) {
  for (let y = Math.round(y0); y < y1; y++) {
    row(put, y, x0, x1, (tx) => {
      let b = mix(lt, base, clamp(tx * 1.2, 0, 1));
      const px = tx * (x1 - x0);
      if ((px | 0) % 5 === 0) b = mix(b, dk, 0.5);
      if (tx > 0.9) b = mix(b, dk, 0.4);
      return b;
    });
  }
}
// dark doorway + window helpers
function doorway(put, cx, y0, w, h) {
  for (let y = y0; y < y0 + h; y++) row(put, Math.round(y), cx - w, cx + w, (tx) => mix('#241812', W.oil, clamp(tx + 0.2, 0, 1)));
}
function windowPane(put, cx, cy, w, h, lit) {
  for (let y = cy - h; y < cy + h; y++) row(put, Math.round(y), cx - w, cx + w, (tx, _) => lit ? mix(W.goldLt, W.gold, tx) : mix('#3a4450', '#1a2028', tx));
  stroke(put, cx - w, cy, cx + w, cy, 1, () => W.woodDkk);
  stroke(put, cx, cy - h, cx, cy + h, 1, () => W.woodDkk);
}
// pitched roof triangle
function roof(put, cx, yTop, half, h, base, dk) {
  for (let y = 0; y < h; y++) {
    const t = y / h, w = half * t;
    row(put, Math.round(yTop + y), cx - w, cx + w, (tx) => {
      let b = mix(base, dk, clamp(tx * 0.9 + t * 0.3, 0, 1));
      if (y % 3 === 0) b = mix(b, dk, 0.4); // shingle lines
      return b;
    });
  }
}

// ---- 1 · SALOON — swing doors, big false front -------------------------
function drawSaloon(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.36);
  siding(put, S * 0.14, S * 0.3, S * 0.86, S * 0.88, W.wood, W.woodLt, W.woodDk);
  // false front + trim
  plate(put, S * 0.1, S * 0.18, S * 0.9, S * 0.32, W.woodLt, '#c8a878', W.woodDk);
  row(put, Math.round(S * 0.18), S * 0.08, S * 0.92, () => W.woodDkk);
  // sign
  plate(put, S * 0.24, S * 0.2, S * 0.76, S * 0.29, W.shade, W.wood, W.oil);
  [[0.3,'S'],[0.38,'A'],[0.46,'L'],[0.54,'O'],[0.62,'O'],[0.7,'N']].forEach(([x]) => put(Math.round(S * x), Math.round(S * 0.245), W.goldLt));
  row(put, Math.round(S * 0.235), S * 0.28, S * 0.72, () => W.gold);
  row(put, Math.round(S * 0.255), S * 0.28, S * 0.72, () => W.goldDk);
  // porch awning
  plate(put, S * 0.12, S * 0.44, S * 0.88, S * 0.5, W.leatherDk, W.leather, W.oil);
  [-0.32, 0.32].forEach(dx => stroke(put, cx + dx * S, S * 0.5, cx + dx * S, S * 0.86, 2.2, () => W.woodDkk));
  // swing doors
  doorway(put, cx, S * 0.56, S * 0.09, S * 0.3);
  [-1, 1].forEach(s => {
    plate(put, cx + (s === -1 ? -S * 0.085 : S * 0.01), S * 0.6, cx + (s === -1 ? -S * 0.01 : S * 0.085), S * 0.76, W.woodLt, '#c8a878', W.woodDk);
  });
  windowPane(put, cx - S * 0.22, S * 0.62, S * 0.05, S * 0.06, true);
  windowPane(put, cx + S * 0.22, S * 0.62, S * 0.05, S * 0.06, true);
}

// ---- 2 · CLOCK TOWER — the HIGH NOON heart -----------------------------
function drawClockTower(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  vplanks(put, cx - S * 0.11, S * 0.34, cx + S * 0.11, S * 0.9, W.wood, W.woodLt, W.woodDk);
  // taper base
  vplanks(put, cx - S * 0.15, S * 0.74, cx + S * 0.15, S * 0.9, W.woodDk, W.wood, W.woodDkk);
  // clock house
  plate(put, cx - S * 0.14, S * 0.18, cx + S * 0.14, S * 0.36, W.woodLt, '#c8a878', W.woodDk);
  roof(put, cx, S * 0.06, S * 0.18, S * 0.12, W.redDk, W.oil);
  put(Math.round(cx), Math.round(S * 0.045), W.gold); // finial
  // clock face — hands at HIGH NOON
  ell(put, cx, S * 0.27, S * 0.085, S * 0.085, (tx, ty) => mix(W.bone, W.boneDk, clamp(tx * 0.6 + ty * 0.5, 0, 1)));
  ell(put, cx, S * 0.27, S * 0.093, S * 0.093, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.2 ? W.brass : null));
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; put(Math.round(cx + Math.cos(a) * S * 0.07), Math.round(S * 0.27 + Math.sin(a) * S * 0.07), W.oil); }
  stroke(put, cx, S * 0.27, cx, S * 0.21, 1.6, () => W.oil);          // both hands straight up
  stroke(put, cx - 1, S * 0.27, cx - 1, S * 0.225, 1.2, () => W.redDk);
  windowPane(put, cx, S * 0.5, S * 0.045, S * 0.055, false);
  doorway(put, cx, S * 0.78, S * 0.05, S * 0.12);
}

// ---- 3 · BANK — brick + vault vibes ------------------------------------
function drawBank(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.34);
  // brick block
  for (let y = Math.round(S * 0.3); y < S * 0.88; y++) {
    const ry = y - Math.round(S * 0.3);
    row(put, y, S * 0.16, S * 0.84, (tx) => {
      let b = mix('#b07050', '#7e4a34', clamp(tx * 1.2, 0, 1));
      if (ry % 5 === 0) b = mix(b, '#5a3222', 0.55);
      else if (((tx * 34 | 0) + (ry / 5 | 0) * 2) % 4 === 0) b = mix(b, '#5a3222', 0.4);
      return b;
    });
  }
  // stone pediment
  plate(put, S * 0.12, S * 0.2, S * 0.88, S * 0.32, W.boneDk, W.bone, '#8a8268');
  [[0.32,0],[0.4,0],[0.48,0],[0.56,0],[0.64,0]].forEach(([x]) => put(Math.round(S * (x + 0.02)), Math.round(S * 0.25), W.oil)); // BANK letters dots
  row(put, Math.round(S * 0.245), S * 0.34, S * 0.66, () => '#6a6450');
  // columns
  [-0.26, 0.26].forEach(dx => { plate(put, cx + dx * S - S * 0.03, S * 0.32, cx + dx * S + S * 0.03, S * 0.86, W.bone, '#fff8e0', W.boneDk); });
  // big door + gold dollar sign plate
  doorway(put, cx, S * 0.52, S * 0.09, S * 0.34);
  ell(put, cx, S * 0.44, S * 0.05, S * 0.05, (tx, ty) => mix(W.goldLt, W.goldDk, clamp(tx + ty * 0.4, 0, 1)));
  put(Math.round(cx), Math.round(S * 0.44), W.oil);
  windowPane(put, cx - S * 0.2, S * 0.44, S * 0.045, S * 0.05, false);
  windowPane(put, cx + S * 0.2, S * 0.44, S * 0.045, S * 0.05, false);
}

// ---- 4 · JAIL — barred window, iron door -------------------------------
function drawJail(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.32);
  // stone walls
  for (let y = Math.round(S * 0.34); y < S * 0.88; y++) {
    const ry = y - Math.round(S * 0.34);
    row(put, y, S * 0.18, S * 0.82, (tx) => {
      let b = mix('#9a9284', '#6a6458', clamp(tx * 1.15, 0, 1));
      if (ry % 7 === 0) b = mix(b, '#46423a', 0.55);
      else if (((tx * 20 | 0) + (ry / 7 | 0) * 3) % 5 === 0) b = mix(b, '#46423a', 0.35);
      return b;
    });
  }
  plate(put, S * 0.14, S * 0.26, S * 0.86, S * 0.36, W.woodDk, W.wood, W.woodDkk);
  // JAIL sign
  plate(put, S * 0.32, S * 0.28, S * 0.68, S * 0.345, W.bone, '#fff8e0', W.boneDk);
  row(put, Math.round(S * 0.31), S * 0.38, S * 0.62, () => W.oil);
  // iron door
  plate(put, cx - S * 0.08, S * 0.56, cx + S * 0.08, S * 0.86, W.iron, W.ironLt, W.ironDk);
  [0.6, 0.68, 0.76].forEach(y => row(put, Math.round(S * y), cx - S * 0.075, cx + S * 0.075, () => W.ironDk));
  put(Math.round(cx + S * 0.05), Math.round(S * 0.7), W.gold);
  // barred window
  doorway(put, cx - S * 0.2, S * 0.46, S * 0.055, S * 0.12);
  for (let i = -1; i <= 1; i++) stroke(put, cx - S * 0.2 + i * S * 0.03, S * 0.46, cx - S * 0.2 + i * S * 0.03, S * 0.58, 1.4, () => W.ironLt);
  doorway(put, cx + S * 0.2, S * 0.46, S * 0.055, S * 0.12);
  for (let i = -1; i <= 1; i++) stroke(put, cx + S * 0.2 + i * S * 0.03, S * 0.46, cx + S * 0.2 + i * S * 0.03, S * 0.58, 1.4, () => W.ironLt);
}

// ---- 5 · GALLOWS — grim platform ---------------------------------------
function drawGallows(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.34);
  // platform
  siding(put, S * 0.16, S * 0.62, S * 0.84, S * 0.74, W.wood, W.woodLt, W.woodDk);
  [-0.28, 0, 0.28].forEach(dx => stroke(put, cx + dx * S, S * 0.74, cx + dx * S, S * 0.88, 2.4, () => W.woodDk));
  // stairs
  for (let i = 0; i < 4; i++) plate(put, S * 0.74 + i * S * 0.035, S * (0.66 + i * 0.055), S * 0.86 + i * S * 0.02, S * (0.7 + i * 0.055), W.woodDk, W.wood, W.woodDkk);
  // post + beam
  stroke(put, cx - S * 0.22, S * 0.62, cx - S * 0.22, S * 0.18, 3, () => W.woodDk);
  stroke(put, cx - S * 0.24, S * 0.18, cx + S * 0.24, S * 0.18, 2.6, () => W.woodDk);
  stroke(put, cx - S * 0.22, S * 0.28, cx - S * 0.1, S * 0.18, 2, () => W.woodDkk); // brace
  // rope + noose
  stroke(put, cx + S * 0.14, S * 0.18, cx + S * 0.14, S * 0.36, 1.4, () => W.boneDk);
  ell(put, cx + S * 0.14, S * 0.42, S * 0.035, S * 0.05, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? mix(W.boneDk, '#8a7e5a', tx) : null));
  // trapdoor line
  row(put, Math.round(S * 0.68), cx - S * 0.05, cx + S * 0.12, () => W.oil);
}

// ---- 6 · WATER TOWER ----------------------------------------------------
function drawWaterTower(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // legs
  [[-0.18, -0.24], [0.18, 0.24], [-0.06, -0.1], [0.06, 0.1]].forEach(([t, b]) =>
    stroke(put, cx + t * S, S * 0.42, cx + b * S, S * 0.88, 2.2, () => W.woodDk));
  stroke(put, cx - S * 0.2, S * 0.66, cx + S * 0.2, S * 0.66, 1.6, () => W.woodDkk); // cross brace
  stroke(put, cx - S * 0.14, S * 0.52, cx + S * 0.14, S * 0.52, 1.6, () => W.woodDkk);
  // tank
  for (let y = Math.round(S * 0.2); y < S * 0.44; y++) {
    row(put, y, cx - S * 0.19, cx + S * 0.19, (tx) => {
      let b = mix(W.woodLt, W.wood, clamp(tx * 1.3, 0, 1));
      if (tx > 0.85) b = mix(b, W.woodDk, 0.6);
      const px = tx * 38; if ((px | 0) % 6 === 0) b = mix(b, W.woodDk, 0.5);
      return b;
    });
  }
  [0.24, 0.4].forEach(y => row(put, Math.round(S * y), cx - S * 0.19, cx + S * 0.19, () => W.ironDk)); // hoops
  // conical cap
  roof(put, cx, S * 0.1, S * 0.21, S * 0.1, W.woodDk, W.oil);
  // spout + drip
  stroke(put, cx, S * 0.44, cx, S * 0.52, 2, () => W.iron);
  put(Math.round(cx), Math.round(S * 0.55), W.navyLt);
  put(Math.round(cx), Math.round(S * 0.59), W.navyLt);
}

// ---- 7 · HITCHING POST --------------------------------------------------
function drawHitchingPost(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  [-0.24, 0.24].forEach(dx => stroke(put, cx + dx * S, S * 0.52, cx + dx * S, S * 0.84, 3, () => W.woodDk));
  stroke(put, cx - S * 0.28, S * 0.54, cx + S * 0.28, S * 0.54, 2.6, () => W.wood);
  row(put, Math.round(S * 0.53), cx - S * 0.28, cx + S * 0.28, () => W.woodLt);
  // tied rope loop
  stroke(put, cx - S * 0.08, S * 0.54, cx - S * 0.05, S * 0.66, 1.4, () => W.boneDk);
  ell(put, cx - S * 0.04, S * 0.69, S * 0.03, S * 0.035, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? W.boneDk : null));
  // trough-side horseshoe on post
  ell(put, cx + S * 0.24, S * 0.62, S * 0.028, S * 0.032, (tx, ty) => (ty < 0.75 && (tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.1 ? W.ironLt : null));
}

// ---- 8 · SAGUARO CACTUS -------------------------------------------------
function drawCactus(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  const body = (x0, y0, x1, y1, w) => stroke(put, x0, y0, x1, y1, w, () => W.cactus);
  body(cx, S * 0.86, cx, S * 0.24, S * 0.06);
  // ribs highlight
  stroke(put, cx - S * 0.02, S * 0.8, cx - S * 0.02, S * 0.26, 1.2, () => W.cactusLt);
  stroke(put, cx + S * 0.025, S * 0.8, cx + S * 0.025, S * 0.28, 1.2, () => W.cactusDk);
  // arms
  body(cx - S * 0.05, S * 0.52, cx - S * 0.16, S * 0.54, S * 0.045);
  body(cx - S * 0.16, S * 0.56, cx - S * 0.16, S * 0.36, S * 0.045);
  body(cx + S * 0.05, S * 0.62, cx + S * 0.15, S * 0.64, S * 0.045);
  body(cx + S * 0.15, S * 0.66, cx + S * 0.15, S * 0.46, S * 0.045);
  stroke(put, cx - S * 0.175, S * 0.52, cx - S * 0.175, S * 0.38, 1, () => W.cactusLt);
  stroke(put, cx + S * 0.135, S * 0.62, cx + S * 0.135, S * 0.48, 1, () => W.cactusLt);
  // spines
  for (let y = 0.28; y < 0.84; y += 0.07) { put(Math.round(cx - S * 0.065), Math.round(S * y), W.bone); put(Math.round(cx + S * 0.065), Math.round(S * (y + 0.03)), W.bone); }
  // flower crown
  ell(put, cx, S * 0.22, S * 0.025, S * 0.02, () => W.redLt);
  put(Math.round(cx), Math.round(S * 0.215), W.goldLt);
}

// ---- 9 · COVERED WAGON --------------------------------------------------
function drawWagon(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.36);
  // canvas bonnet
  for (let y = Math.round(S * 0.3); y < S * 0.56; y++) {
    const t = (y - S * 0.3) / (S * 0.26);
    const w = S * (0.3 + Math.sin(t * Math.PI) * 0.015);
    row(put, y, cx - w, cx + w, (tx) => {
      let b = mix('#fff4dc', '#cbb894', clamp(tx * 1.25, 0, 1));
      const px = tx * 60; if ((px | 0) % 12 === 0) b = mix(b, '#a89468', 0.45); // hoop ribs
      return b;
    });
  }
  // dark opening
  ell(put, cx + S * 0.26, S * 0.43, S * 0.05, S * 0.1, (tx, ty) => mix('#241812', W.oil, tx));
  // wood bed
  plate(put, cx - S * 0.32, S * 0.56, cx + S * 0.32, S * 0.68, W.wood, W.woodLt, W.woodDk);
  row(put, Math.round(S * 0.62), cx - S * 0.32, cx + S * 0.32, () => W.woodDk);
  // wheels
  [[-0.2, 0.09], [0.2, 0.11]].forEach(([dx, r]) => {
    const wx = cx + dx * S, wy = S * 0.76;
    ell(put, wx, wy, S * r, S * r, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? mix(W.leather, W.leatherDk, tx) : null));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * S * r, wy - Math.sin(a) * S * r, wx + Math.cos(a) * S * r, wy + Math.sin(a) * S * r, 1.2, () => W.woodDk); }
    ell(put, wx, wy, S * 0.018, S * 0.018, () => W.ironDk);
  });
  // tongue/hitch
  stroke(put, cx - S * 0.32, S * 0.64, cx - S * 0.44, S * 0.7, 1.8, () => W.woodDk);
}

// ---- 10 · BARREL STACK --------------------------------------------------
function drawBarrels(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.32);
  const barrel = (bx, by, r, h) => {
    for (let y = Math.round(by - h); y < by + h; y++) {
      const t = (y - (by - h)) / (2 * h);
      const w = r * (1 + Math.sin(t * Math.PI) * 0.14);
      row(put, y, bx - w, bx + w, (tx) => {
        let b = mix(W.woodLt, W.wood, clamp(tx * 1.25, 0, 1));
        if (tx > 0.85) b = mix(b, W.woodDk, 0.55);
        const px = tx * r * 2.2; if ((px | 0) % 4 === 0) b = mix(b, W.woodDk, 0.4);
        return b;
      });
    }
    [-0.55, 0.55].forEach(dy => row(put, Math.round(by + dy * h), bx - r * 1.1, bx + r * 1.1, () => W.ironDk));
  };
  barrel(cx - S * 0.13, S * 0.7, S * 0.1, S * 0.14);
  barrel(cx + S * 0.14, S * 0.7, S * 0.1, S * 0.14);
  barrel(cx, S * 0.44, S * 0.1, S * 0.14);
  // TNT crate beside
  plate(put, cx + S * 0.24, S * 0.74, cx + S * 0.4, S * 0.85, W.wood, W.woodLt, W.woodDk);
  stroke(put, cx + S * 0.24, S * 0.74, cx + S * 0.4, S * 0.85, 1, () => W.woodDkk);
  stroke(put, cx + S * 0.4, S * 0.74, cx + S * 0.24, S * 0.85, 1, () => W.woodDkk);
}

// ---- 11 · GENERAL STORE -------------------------------------------------
function drawStore(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.34);
  siding(put, S * 0.14, S * 0.32, S * 0.86, S * 0.88, '#8a7a5a', '#b0a078', '#5a4e38');
  // false front
  plate(put, S * 0.1, S * 0.2, S * 0.9, S * 0.34, '#b0a078', '#d0c098', '#5a4e38');
  row(put, Math.round(S * 0.2), S * 0.08, S * 0.92, () => W.woodDkk);
  row(put, Math.round(S * 0.27), S * 0.2, S * 0.8, () => W.redDk); // painted sign band
  row(put, Math.round(S * 0.28), S * 0.2, S * 0.8, () => W.red);
  // awning stripes
  for (let y = Math.round(S * 0.4); y < S * 0.48; y++) {
    row(put, y, S * 0.13, S * 0.87, (tx) => ((tx * 12 | 0) % 2 === 0 ? W.red : W.bone));
  }
  // display windows + door
  windowPane(put, cx - S * 0.2, S * 0.6, S * 0.075, S * 0.09, true);
  windowPane(put, cx + S * 0.2, S * 0.6, S * 0.075, S * 0.09, true);
  doorway(put, cx, S * 0.54, S * 0.06, S * 0.32);
  put(Math.round(cx + S * 0.04), Math.round(S * 0.7), W.gold);
  // goods out front: sack + crate
  ell(put, cx - S * 0.28, S * 0.83, S * 0.04, S * 0.05, (tx, ty) => mix('#cbb894', '#8a7a58', tx + ty * 0.3));
  plate(put, cx + S * 0.22, S * 0.78, cx + S * 0.34, S * 0.87, W.wood, W.woodLt, W.woodDk);
}

// ---- 12 · CHURCH --------------------------------------------------------
function drawChurch(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // body
  vplanks(put, cx - S * 0.2, S * 0.5, cx + S * 0.2, S * 0.88, '#e0d8c8', '#f4eee0', '#a89e88');
  roof(put, cx, S * 0.36, S * 0.24, S * 0.15, W.woodDk, W.oil);
  // steeple
  vplanks(put, cx - S * 0.06, S * 0.22, cx + S * 0.06, S * 0.4, '#e0d8c8', '#f4eee0', '#a89e88');
  roof(put, cx, S * 0.08, S * 0.085, S * 0.15, W.woodDkk, W.oil);
  // cross
  stroke(put, cx, S * 0.02, cx, S * 0.08, 1.4, () => W.gold);
  stroke(put, cx - S * 0.02, S * 0.045, cx + S * 0.02, S * 0.045, 1.4, () => W.gold);
  // bell window
  doorway(put, cx, S * 0.26, S * 0.03, S * 0.08);
  ell(put, cx, S * 0.3, S * 0.02, S * 0.022, (tx, ty) => mix(W.brass, W.goldDk, ty));
  // arched door + windows
  doorway(put, cx, S * 0.68, S * 0.05, S * 0.2);
  ell(put, cx, S * 0.68, S * 0.05, S * 0.04, (tx, ty) => (ty < 0.55 ? mix('#241812', W.oil, tx) : null));
  windowPane(put, cx - S * 0.13, S * 0.66, S * 0.03, S * 0.05, false);
  windowPane(put, cx + S * 0.13, S * 0.66, S * 0.03, S * 0.05, false);
}

// ---- 13 · WINDMILL ------------------------------------------------------
function drawWindmill(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // derrick legs
  [[-0.16, -0.22], [0.16, 0.22]].forEach(([t, b]) => stroke(put, cx + t * S, S * 0.34, cx + b * S, S * 0.88, 2.2, () => W.woodDk));
  stroke(put, cx - S * 0.19, S * 0.62, cx + S * 0.19, S * 0.62, 1.5, () => W.woodDkk);
  stroke(put, cx - S * 0.17, S * 0.45, cx + S * 0.17, S * 0.45, 1.5, () => W.woodDkk);
  stroke(put, cx - S * 0.19, S * 0.62, cx + S * 0.17, S * 0.45, 1.2, () => W.woodDkk);
  // fan blades
  const hub = [cx, S * 0.26];
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + 0.35;
    const bx = hub[0] + Math.cos(a) * S * 0.16, by = hub[1] + Math.sin(a) * S * 0.16;
    stroke(put, hub[0], hub[1], bx, by, 1.2, () => W.ironDk);
    // blade paddle
    const px = hub[0] + Math.cos(a) * S * 0.12, py = hub[1] + Math.sin(a) * S * 0.12;
    stroke(put, px - Math.sin(a) * S * 0.03, py + Math.cos(a) * S * 0.03, px + Math.sin(a) * S * 0.03, py - Math.cos(a) * S * 0.03, 3.4, () => mix('#c8bca0', '#8a7e64', (i % 3) * 0.3));
  }
  ell(put, hub[0], hub[1], S * 0.025, S * 0.025, (tx, ty) => mix(W.ironLt, W.ironDk, ty));
  // tail vane
  stroke(put, hub[0], hub[1], hub[0] + S * 0.2, hub[1] + S * 0.05, 1.4, () => W.iron);
  ell(put, hub[0] + S * 0.22, hub[1] + S * 0.055, S * 0.045, S * 0.028, (tx) => mix(W.red, W.redDk, tx));
}

// ---- 14 · WATER TROUGH --------------------------------------------------
function drawTrough(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.34);
  // trough box
  for (let y = Math.round(S * 0.56); y < S * 0.74; y++) {
    row(put, y, cx - S * 0.3, cx + S * 0.3, (tx) => {
      let b = mix(W.woodLt, W.wood, clamp(tx * 1.3, 0, 1));
      if (tx > 0.88) b = mix(b, W.woodDk, 0.6);
      const px = tx * 60; if ((px | 0) % 10 === 0) b = mix(b, W.woodDk, 0.5);
      return b;
    });
  }
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.3, S * 0.56, cx + s * S * 0.3, S * 0.78, 2.2, () => W.woodDk));
  // water surface
  for (let y = Math.round(S * 0.575); y < S * 0.62; y++) {
    row(put, y, cx - S * 0.27, cx + S * 0.27, (tx) => mix(W.navyLt, W.navy, clamp(tx + (y % 3) * 0.14, 0, 1)));
  }
  // glints
  [[-0.15, 0.585], [0.05, 0.595], [0.18, 0.585]].forEach(([dx, y]) => put(Math.round(cx + dx * S), Math.round(S * y), '#cfe8ff'));
  // pump handle at side
  stroke(put, cx - S * 0.36, S * 0.5, cx - S * 0.36, S * 0.74, 2.4, () => W.ironDk);
  stroke(put, cx - S * 0.42, S * 0.44, cx - S * 0.33, S * 0.5, 2, () => W.iron);
  stroke(put, cx - S * 0.35, S * 0.52, cx - S * 0.31, S * 0.56, 1.6, () => W.iron); // spout
}

// ---- 15 · WANTED BOARD --------------------------------------------------
function drawWanted(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  [-0.18, 0.18].forEach(dx => stroke(put, cx + dx * S, S * 0.3, cx + dx * S, S * 0.86, 2.6, () => W.woodDk));
  plate(put, cx - S * 0.24, S * 0.28, cx + S * 0.24, S * 0.62, W.wood, W.woodLt, W.woodDk);
  // posters
  const poster = (px, py, w, h, tilt) => {
    for (let y = 0; y < h; y++) row(put, Math.round(py + y), px - w + tilt * y, px + w + tilt * y, (tx) => mix('#f4e8c8', '#c8b088', clamp(tx + y / h * 0.3, 0, 1)));
    row(put, Math.round(py + 2), px - w * 0.7 + tilt, px + w * 0.7 + tilt, () => W.oil); // WANTED
    ell(put, px + tilt * h * 0.4, py + h * 0.45, w * 0.32, h * 0.2, (tx, ty) => mix(W.shade, W.oil, tx)); // mug
    row(put, Math.round(py + h * 0.78), px - w * 0.5 + tilt * h * 0.7, px + w * 0.5 + tilt * h * 0.7, () => W.goldDk); // $$$
  };
  poster(cx - S * 0.11, S * 0.31, S * 0.075, S * 0.24, 0);
  poster(cx + S * 0.11, S * 0.32, S * 0.075, S * 0.22, 0.06);
  // nails
  [[-0.11, 0.3], [0.09, 0.315]].forEach(([dx, y]) => put(Math.round(cx + dx * S), Math.round(S * y), W.ironLt));
}

// ---- 16 · RAIL CROSSING -------------------------------------------------
function drawRails(put, S) {
  const cx = S * 0.5;
  // rail bed diagonal across cell
  for (let i = -2; i < 12; i++) {
    // sleepers
    const y = S * 0.3 + i * S * 0.058, x0 = cx - S * 0.3 + i * S * 0.01;
    stroke(put, x0 - S * 0.1, y, x0 + S * 0.26, y + S * 0.02, S * 0.028, () => (i % 2 ? W.woodDk : '#4e3a26'));
  }
  // rails
  stroke(put, cx - S * 0.28, S * 0.24, cx - S * 0.13, S * 0.9, 3, () => W.iron);
  stroke(put, cx - S * 0.29, S * 0.24, cx - S * 0.145, S * 0.9, 1.2, () => W.ironLt);
  stroke(put, cx + S * 0.16, S * 0.22, cx + S * 0.3, S * 0.88, 3, () => W.iron);
  stroke(put, cx + S * 0.15, S * 0.22, cx + S * 0.29, S * 0.88, 1.2, () => W.ironLt);
  // crossbuck sign
  stroke(put, cx + S * 0.36, S * 0.4, cx + S * 0.36, S * 0.84, 2.4, () => W.woodDk);
  [[-1, 1], [1, -1]].forEach(([a, b]) => stroke(put, cx + S * 0.36 - S * 0.09 * a, S * 0.42 - S * 0.035 * b, cx + S * 0.36 + S * 0.09 * a, S * 0.42 + S * 0.035 * b, 3, () => W.bone));
  put(Math.round(cx + S * 0.36), Math.round(S * 0.42), W.oil);
}

// ---- 17 · BOARDWALK BENCH + LAMP ---------------------------------------
function drawBoardwalk(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.36);
  // boardwalk slab
  for (let y = Math.round(S * 0.7); y < S * 0.88; y++) {
    row(put, y, S * 0.1, S * 0.9, (tx) => {
      let b = mix(W.woodLt, W.wood, clamp(tx * 1.2, 0, 1));
      const px = tx * 80; if ((px | 0) % 9 === 0) b = mix(b, W.woodDk, 0.55);
      if ((y - Math.round(S * 0.7)) % 6 === 0) b = mix(b, W.woodDk, 0.3);
      return b;
    });
  }
  // bench
  plate(put, cx - S * 0.2, S * 0.56, cx + S * 0.08, S * 0.6, W.wood, W.woodLt, W.woodDk);
  plate(put, cx - S * 0.2, S * 0.44, cx + S * 0.08, S * 0.47, W.wood, W.woodLt, W.woodDk);
  [-0.17, 0.05].forEach(dx => { stroke(put, cx + dx * S, S * 0.47, cx + dx * S, S * 0.56, 1.6, () => W.woodDk); stroke(put, cx + dx * S, S * 0.6, cx + dx * S, S * 0.72, 2, () => W.woodDk); });
  // oil lamp post
  stroke(put, cx + S * 0.28, S * 0.28, cx + S * 0.28, S * 0.74, 2.4, () => W.ironDk);
  plate(put, cx + S * 0.24, S * 0.2, cx + S * 0.32, S * 0.3, W.iron, W.ironLt, W.ironDk);
  for (let y = Math.round(S * 0.22); y < S * 0.28; y++) row(put, y, cx + S * 0.253, cx + S * 0.307, (tx) => mix(W.goldLt, W.gold, tx)); // glow pane
  roof(put, cx + S * 0.28, S * 0.16, S * 0.055, S * 0.045, W.ironDk, W.oil);
  // glow halo dots
  [[0.22, 0.19], [0.34, 0.21], [0.28, 0.13]].forEach(([x, y]) => put(Math.round(cx + (x - 0.28) * S + S * 0.28), Math.round(S * y), W.goldLt));
}

// ---- 18 · MINE ENTRANCE -------------------------------------------------
function drawMine(put, S) {
  const cx = S * 0.5;
  // rock hill
  for (let y = Math.round(S * 0.3); y < S * 0.88; y++) {
    const t = (y - S * 0.3) / (S * 0.58);
    const w = S * (0.14 + t * 0.3);
    row(put, y, cx - w, cx + w, (tx) => {
      let b = mix('#a08a6a', '#6a583e', clamp(tx * 1.1 + (1 - t) * 0.2, 0, 1));
      if (((tx * 30 | 0) + (y * 2 | 0)) % 7 === 0) b = mix(b, '#4a3a26', 0.4);
      return b;
    });
  }
  // timber portal
  [-0.13, 0.13].forEach(dx => stroke(put, cx + dx * S, S * 0.52, cx + dx * S, S * 0.88, 3.4, () => W.woodDk));
  stroke(put, cx - S * 0.16, S * 0.52, cx + S * 0.16, S * 0.52, 3.4, () => W.wood);
  // dark mouth
  for (let y = Math.round(S * 0.56); y < S * 0.88; y++) {
    const t = (y - S * 0.56) / (S * 0.32);
    const w = S * 0.105 * (1 - t * 0.08);
    row(put, y, cx - w, cx + w, (tx) => mix('#241812', W.oil, clamp(tx * 0.6 + t, 0, 1)));
  }
  // cart tracks out of the mouth
  stroke(put, cx - S * 0.05, S * 0.88, cx - S * 0.07, S * 0.68, 1.2, () => W.ironLt);
  stroke(put, cx + S * 0.05, S * 0.88, cx + S * 0.07, S * 0.68, 1.2, () => W.ironLt);
  // DANGER sign
  plate(put, cx + S * 0.18, S * 0.6, cx + S * 0.34, S * 0.68, W.bone, '#fff8e0', W.boneDk);
  row(put, Math.round(S * 0.635), cx + S * 0.2, cx + S * 0.32, () => W.redDk);
}

// ---- 19 · BOOT HILL GRAVE -----------------------------------------------
function drawGrave(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // mound
  for (let y = Math.round(S * 0.72); y < S * 0.84; y++) {
    const t = (y - S * 0.72) / (S * 0.12);
    const w = S * (0.16 + t * 0.06);
    row(put, y, cx - w, cx + w, (tx) => mix('#8a6e48', '#5a462c', clamp(tx + t * 0.3, 0, 1)));
  }
  // wooden cross
  stroke(put, cx - S * 0.08, S * 0.3, cx - S * 0.08, S * 0.74, 3.2, () => W.woodDk);
  stroke(put, cx - S * 0.2, S * 0.42, cx + S * 0.04, S * 0.42, 3, () => W.wood);
  row(put, Math.round(S * 0.41), cx - S * 0.19, cx + S * 0.03, () => W.woodLt);
  // leaning boot on the grave (boot hill!)
  stroke(put, cx + S * 0.16, S * 0.6, cx + S * 0.14, S * 0.74, S * 0.035, () => W.leather);
  stroke(put, cx + S * 0.14, S * 0.74, cx + S * 0.22, S * 0.76, S * 0.028, () => W.leatherDk);
  put(Math.round(cx + S * 0.16), Math.round(S * 0.61), W.brass);
  // scrub tufts
  [[-0.3, 0.8], [0.3, 0.82], [0.05, 0.86]].forEach(([dx, y]) => {
    for (let i = -1; i <= 1; i++) stroke(put, cx + dx * S, S * y, cx + dx * S + i * 2, S * y - 4, 1, () => W.cactusDk);
  });
}

// ---- 20 · STAGECOACH ----------------------------------------------------
function drawStagecoach(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.38);
  // cab
  plate(put, cx - S * 0.26, S * 0.4, cx + S * 0.26, S * 0.64, W.red, W.redLt, W.redDk);
  row(put, Math.round(S * 0.4), cx - S * 0.26, cx + S * 0.26, () => W.goldDk); // gold trim
  row(put, Math.round(S * 0.63), cx - S * 0.26, cx + S * 0.26, () => W.goldDk);
  // window + curtain
  doorway(put, cx, S * 0.44, S * 0.055, S * 0.14);
  stroke(put, cx - S * 0.04, S * 0.44, cx - S * 0.04, S * 0.58, 1.4, () => W.gold);
  // door line + handle
  stroke(put, cx + S * 0.12, S * 0.42, cx + S * 0.12, S * 0.62, 1, () => W.redDk);
  put(Math.round(cx + S * 0.1), Math.round(S * 0.52), W.gold);
  // driver bench + luggage rail
  plate(put, cx - S * 0.3, S * 0.34, cx - S * 0.14, S * 0.4, W.leatherDk, W.leather, W.oil);
  plate(put, cx + S * 0.02, S * 0.32, cx + S * 0.24, S * 0.38, '#cbb894', '#f0e0b8', '#8a7a58'); // strongbox+bags
  stroke(put, cx + S * 0.02, S * 0.35, cx + S * 0.24, S * 0.35, 1, () => W.leatherDk);
  // wheels: rear big, front small
  [[-0.18, 0.105], [0.18, 0.085]].forEach(([dx, r]) => {
    const wx = cx + dx * S, wy = S * 0.76;
    ell(put, wx, wy, S * r, S * r, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.15 ? mix(W.gold, W.goldDk, tx + ty * 0.3) : null));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * S * r, wy - Math.sin(a) * S * r, wx + Math.cos(a) * S * r, wy + Math.sin(a) * S * r, 1.1, () => W.goldDk); }
    ell(put, wx, wy, S * 0.016, S * 0.016, () => W.ironDk);
  });
  // hitch
  stroke(put, cx - S * 0.28, S * 0.68, cx - S * 0.42, S * 0.72, 1.8, () => W.woodDk);
}

const LIST = [
  { n: 1, name: 'SALOON', role: 'big anchor building', draw: drawSaloon },
  { n: 2, name: 'CLOCK TOWER', role: 'HIGH NOON centerpiece', draw: drawClockTower },
  { n: 3, name: 'BANK', role: 'brick + gold door', draw: drawBank },
  { n: 4, name: 'JAIL', role: 'stone + barred windows', draw: drawJail },
  { n: 5, name: 'GALLOWS', role: 'grim platform', draw: drawGallows },
  { n: 6, name: 'WATER TOWER', role: 'tall landmark', draw: drawWaterTower },
  { n: 7, name: 'HITCHING POST', role: 'street filler', draw: drawHitchingPost },
  { n: 8, name: 'SAGUARO CACTUS', role: 'desert filler', draw: drawCactus },
  { n: 9, name: 'COVERED WAGON', role: 'street prop', draw: drawWagon },
  { n: 10, name: 'BARREL STACK', role: 'cover prop + TNT crate', draw: drawBarrels },
  { n: 11, name: 'GENERAL STORE', role: 'awning shopfront', draw: drawStore },
  { n: 12, name: 'CHURCH', role: 'white steeple', draw: drawChurch },
  { n: 13, name: 'WINDMILL', role: 'spinning derrick', draw: drawWindmill },
  { n: 14, name: 'WATER TROUGH', role: 'street prop + pump', draw: drawTrough },
  { n: 15, name: 'WANTED BOARD', role: 'poster wall', draw: drawWanted },
  { n: 16, name: 'RAIL CROSSING', role: 'tracks + crossbuck', draw: drawRails },
  { n: 17, name: 'BOARDWALK SET', role: 'bench + oil lamp', draw: drawBoardwalk },
  { n: 18, name: 'MINE ENTRANCE', role: 'timber portal', draw: drawMine },
  { n: 19, name: 'BOOT HILL GRAVE', role: 'cross + boot', draw: drawGrave },
  { n: 20, name: 'STAGECOACH', role: 'fancy red coach', draw: drawStagecoach },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'west_decor_options.png', title: 'WILD WEST TOWN — DECOR CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
