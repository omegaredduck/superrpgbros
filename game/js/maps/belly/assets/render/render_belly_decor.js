// artdev/belly/render_belly_decor.js — 20 numbered BELLY OF THE BEAST
// decor candidates, one PNG grid. Two families: the GUT ITSELF
// (ribs, flesh, acid, veins) and the SWALLOWED SHIP + everything
// else the whale ever ate.
'use strict';
const KIT = require('./belly_kit.js');
const { B, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glowDot, tentacle, fin, drips, wisps } = KIT;

// 1 · RIB ARCH — vault segment you walk under
function dRibArch(put, S) {
  const cx = S * 0.5;
  [-1, 1].forEach(s => {
    for (let t = 0; t < 1; t += 0.03) {
      const a = t * Math.PI * 0.5;
      const px = cx + s * Math.sin(a) * S * 0.26, py = S * 0.84 - Math.cos(0) * 0 - Math.sin(t * Math.PI * 0.5) * 0; // placeholder
    }
  });
  // two ribs curving to meet at top
  [-1, 1].forEach(s => {
    for (let t = 0; t < 1; t += 0.02) {
      const px = cx + s * S * (0.26 - t * 0.22), py = S * (0.86 - t * 0.6 + t * t * 0.12);
      const w = S * (0.035 - t * 0.014);
      ell(put, px, py, w, w * 0.8, (tx, ty) => {
        let b = mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
        if (((t * 14) | 0) % 5 === 0) b = mix(b, B.boneDkk, 0.3); // age cracks
        return b;
      });
    }
  });
  // meeting knuckle at the crown
  ell(put, cx, S * 0.26, S * 0.05, S * 0.035, (tx, ty) => mix(B.bone, B.boneDk, clamp(tx + ty * 0.4, 0, 1)));
  // flesh gum where ribs root
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.26, S * 0.86, S * 0.07, S * 0.035, (tx, ty) => mix(B.meat, B.fleshDk, tx + ty * 0.3)));
  drips(put, cx - S * 0.02, S * 0.3, 2);
}
// 2 · FLESH SPIRE — stomach papilla stalagmite
function dSpire(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.16);
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx + Math.sin(t * 3) * S * 0.02, py = S * (0.84 - t * 0.5);
    const w = S * (0.075 - t * 0.055);
    ell(put, px, py, w, w * 0.7, (tx, ty) => {
      let b = mix(B.meat, B.fleshDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
      if (((t * 16) | 0) % 2) b = mix(b, B.meatLt, 0.3); // wet ring folds
      return b;
    });
  }
  glowDot(put, cx + Math.sin(3) * S * 0.02, S * 0.32, S * 0.01, B.meatLt, B.gloss); // wet tip
  drips(put, cx, S * 0.36, 2);
}
// 3 · ACID POOL — bubbling digestive pond
function dAcidPool(put, S) {
  const cx = S * 0.5;
  ell(put, cx, S * 0.64, S * 0.22, S * 0.09, (tx, ty) => {
    const d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
    let b = mix(B.acidLt, B.acid, clamp(d * 1.3, 0, 1));
    b = mix(b, B.acidDk, clamp((d - 0.7) * 3, 0, 1));
    return b;
  });
  // flesh rim
  for (let a = 0; a < 6.28; a += 0.06) {
    const rr = 1 + Math.sin(a * 7) * 0.04;
    put(Math.round(cx + Math.cos(a) * S * 0.22 * rr), Math.round(S * 0.64 + Math.sin(a) * S * 0.09 * rr), B.meatDk);
  }
  // bubbles + burst rings
  [[-0.1, 0.62, 0.014], [0.06, 0.66, 0.01], [0.13, 0.61, 0.008]].forEach(([dx, dy, r]) => {
    ell(put, cx + dx * S, S * dy, S * r, S * r * 0.7, (tx, ty) => mix(B.acidLt, B.acid, ty));
    put(Math.round(cx + dx * S), Math.round(S * (dy - r * 0.8)), B.white);
  });
  wisps(put, cx - S * 0.04, S * 0.56, 3);
}
// 4 · VEIN CLUSTER — glowing vein web across the floor
function dVeins(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  // flesh mound
  ell(put, cx, cy, S * 0.2, S * 0.12, (tx, ty) => mix(B.meat, B.fleshDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)));
  // branching veins w/ pulse glow
  const branch = (x0, y0, a, len, w, depth) => {
    const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len * 0.55;
    stroke(put, x0, y0, x1, y1, w, () => B.vein);
    stroke(put, x0, y0, x1, y1, Math.max(1, w * 0.4), () => '#8ab0e8');
    if (depth > 0) { branch(x1, y1, a - 0.55, len * 0.62, w * 0.7, depth - 1); branch(x1, y1, a + 0.5, len * 0.66, w * 0.7, depth - 1); }
  };
  branch(cx, cy + S * 0.04, -Math.PI / 2 - 0.3, S * 0.11, S * 0.016, 3);
  branch(cx - S * 0.02, cy + S * 0.02, Math.PI - 0.4, S * 0.09, S * 0.013, 2);
  branch(cx + S * 0.03, cy + S * 0.03, -0.3, S * 0.09, S * 0.013, 2);
  glowDot(put, cx, cy + S * 0.04, S * 0.012, '#8ab0e8', '#c8e0ff'); // pulse node
}
// 5 · BALEEN CURTAIN — hanging filter plates
function dBaleen(put, S) {
  const cx = S * 0.5;
  // gum ridge at top
  for (let y = S * 0.2; y < S * 0.28; y++) row(put, Math.round(y), cx - S * 0.24, cx + S * 0.24, (tx) => mix(B.meat, B.fleshDk, clamp(tx * 0.8 + (y - S * 0.2) / (S * 0.08) * 0.3, 0, 1)));
  // hanging plates
  for (let i = -5; i <= 5; i++) {
    const px = cx + i * S * 0.042;
    const len = S * (0.34 + Math.sin(i * 2.7) * 0.05);
    for (let y = S * 0.28; y < S * 0.28 + len; y++) {
      const t = (y - S * 0.28) / len;
      const w = S * 0.014 * (1 - t * 0.6);
      row(put, Math.round(y), px - w + Math.sin(t * 4 + i) * 2, px + w + Math.sin(t * 4 + i) * 2, (tx) => {
        let b = mix('#4a4238', '#241e14', clamp(tx + t * 0.4, 0, 1));
        if (i % 2 === 0) b = mix(b, '#6a6252', 0.3);
        return b;
      });
    }
    // frayed bristle tip
    stroke(put, px + Math.sin(1 + i) * 2, S * 0.28 + len, px + Math.sin(1 + i) * 2 - 1, S * 0.28 + len + S * 0.03, 0.9, () => '#8a8268');
  }
  drips(put, cx + S * 0.1, S * 0.32, 2);
}
// 6 · BROKEN MAST — snapped, crow's nest tilted
function dMast(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.14);
  // mast trunk, leaning
  for (let t = 0; t < 1; t += 0.02) {
    const px = cx - S * 0.04 + t * S * 0.1, py = S * (0.86 - t * 0.56);
    const w = S * (0.035 - t * 0.008);
    ell(put, px, py, w, w * 0.6, (tx, ty) => {
      let b = mix(B.wood, B.woodDk, clamp(tx * 1.1, 0, 1));
      if (((t * 20) | 0) % 4 === 0) b = mix(b, B.woodLt, 0.3); // grain
      return b;
    });
  }
  // snapped jagged top
  [[0.05, 0.3, 4], [0.08, 0.28, 3], [0.03, 0.27, 3]].forEach(([dx, dy, h]) => {
    for (let i = 0; i < h; i++) put(Math.round(cx + dx * S + i), Math.round(S * dy - i * 2), B.woodLt);
  });
  // crow's nest ring hanging tilted mid-mast
  for (let a = 0; a < 6.28; a += 0.12) {
    put(Math.round(cx + S * 0.02 + Math.cos(a) * S * 0.075), Math.round(S * 0.5 + Math.sin(a) * S * 0.028 + Math.cos(a) * S * 0.012), B.woodDk);
  }
  for (let y = 0; y < S * 0.05; y++) row(put, Math.round(S * 0.5 + y), cx + S * 0.02 - S * 0.075 + y * 0.4, cx + S * 0.02 + S * 0.075 - y * 0.2, (tx) => ((tx * 10 | 0) % 3 === 0 ? B.woodDk : mix(B.wood, B.woodDk, tx)));
  // torn rigging lines
  stroke(put, cx - S * 0.02, S * 0.42, cx - S * 0.16, S * 0.62, 0.9, () => B.rope);
  stroke(put, cx + S * 0.05, S * 0.38, cx + S * 0.18, S * 0.56, 0.9, () => B.ropeDk);
  stroke(put, cx + S * 0.18, S * 0.56, cx + S * 0.17, S * 0.62, 0.8, () => B.ropeDk); // dangling end
}
// 7 · TORN SAIL — canvas rigged between rib stumps
function dSail(put, S) {
  const cx = S * 0.5;
  // two rib stump posts
  [-0.2, 0.22].forEach(dx => {
    for (let t = 0; t < 1; t += 0.05) {
      const w = S * (0.026 - t * 0.008);
      ell(put, cx + dx * S, S * (0.78 - t * 0.4), w, w * 0.7, (tx, ty) => mix(B.bone, B.boneDk, tx + ty * 0.3));
    }
  });
  // sail canvas sagging between, torn holes + ragged bottom
  for (let y = S * 0.42; y < S * 0.72; y++) {
    const t = (y - S * 0.42) / (S * 0.3);
    const sag = Math.sin(t * Math.PI) * 0; // top edge sag handled below
    row(put, Math.round(y), cx - S * 0.19, cx + S * 0.21, (tx) => {
      const localY = t + Math.sin(tx * 6) * 0.04;
      if (localY < Math.sin(tx * Math.PI) * -0.06 + 0.06) return null; // top curve
      if (t > 0.75 && ((tx * 13) | 0) % 3 === 0) return null; // ragged hem
      if (((tx * 17 + y * 0.5) | 0) % 23 === 0 && t > 0.25 && t < 0.7) return null; // tears
      let b = mix(B.sail, B.sailDk, clamp(tx * 0.9 + t * 0.35, 0, 1));
      if (((y | 0) % 7) === 0) b = mix(b, B.sailDk, 0.3); // seams
      return b;
    });
  }
  // acid burn edges on one tear
  [[0.02, 0.6], [0.06, 0.64]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.acidDk));
  // lashings
  stroke(put, cx - S * 0.19, S * 0.44, cx - S * 0.2, S * 0.4, 1, () => B.rope);
  stroke(put, cx + S * 0.2, S * 0.44, cx + S * 0.22, S * 0.4, 1, () => B.rope);
}
// 8 · SHIPS WHEEL — half-sunk in the flesh floor
function dWheel(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // flesh mound swallowing the lower third
  // wheel ring
  for (let a = 0; a < 6.28; a += 0.03) {
    const px = cx + Math.cos(a) * S * 0.16, py = cy + Math.sin(a) * S * 0.16;
    if (py > S * 0.66) continue; // sunk below
    ell(put, px, py, S * 0.016, S * 0.016, (tx, ty) => mix(B.wood, B.woodDk, clamp(tx + ty * 0.4, 0, 1)));
  }
  // spokes + handles
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + 0.2;
    const hx = cx + Math.cos(a) * S * 0.21, hy = cy + Math.sin(a) * S * 0.21;
    if (cy + Math.sin(a) * S * 0.15 < S * 0.66) {
      stroke(put, cx, cy, cx + Math.cos(a) * S * 0.15, cy + Math.sin(a) * S * 0.15, 1.8, () => B.woodDk);
      if (hy < S * 0.66) { stroke(put, cx + Math.cos(a) * S * 0.16, cy + Math.sin(a) * S * 0.16, hx, hy, 2.2, () => B.wood); put(Math.round(hx), Math.round(hy), B.woodLt); }
    }
  }
  // brass hub
  ell(put, cx, cy, S * 0.035, S * 0.035, (tx, ty) => mix(B.brassLt, B.brassDk, clamp(tx + ty * 0.5, 0, 1)));
  put(Math.round(cx), Math.round(cy), B.brassDk);
  // flesh lapping over the sunk edge
  for (let y = S * 0.64; y < S * 0.72; y++) {
    const t = (y - S * 0.64) / (S * 0.08);
    row(put, Math.round(y), cx - S * (0.22 + t * 0.02), cx + S * (0.22 + t * 0.02), (tx) => mix(B.meat, B.fleshDk, clamp(tx * 0.7 + t * 0.4, 0, 1)));
  }
  ell(put, cx - S * 0.1, S * 0.645, S * 0.03, S * 0.012, (tx, ty) => mix(B.meatLt, B.meat, ty)); // lapping fold
}
// 9 · CARGO CRATES — stenciled stack
function dCrates(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  const crate = (x0, y0, w, h, tone) => {
    plate(put, x0, y0, x0 + w, y0 + h, tone === 0 ? B.wood : '#9a6a40', B.woodLt, B.woodDk);
    // plank lines + frame
    for (let i = 1; i < 3; i++) row(put, Math.round(y0 + h * i / 3), x0 + 1, x0 + w - 1, () => B.woodDk);
    stroke(put, x0, y0, x0 + w, y0 + h, 1, () => B.woodDk); // diagonal brace
    [[x0 + 2, y0 + 2], [x0 + w - 3, y0 + 2], [x0 + 2, y0 + h - 3], [x0 + w - 3, y0 + h - 3]].forEach(([nx, ny]) => put(Math.round(nx), Math.round(ny), B.brass));
  };
  crate(cx - S * 0.19, S * 0.52, S * 0.2, S * 0.2, 0);
  crate(cx + S * 0.03, S * 0.56, S * 0.17, S * 0.16, 1);
  crate(cx - S * 0.08, S * 0.36, S * 0.16, S * 0.15, 1);
  // stencil mark
  ell(put, cx - S * 0.09, S * 0.6, S * 0.03, S * 0.03, () => null);
  stroke(put, cx - S * 0.13, S * 0.58, cx - S * 0.05, S * 0.58, 1, () => B.ink);
  stroke(put, cx - S * 0.13, S * 0.62, cx - S * 0.05, S * 0.62, 1, () => B.ink);
  stroke(put, cx - S * 0.13, S * 0.58, cx - S * 0.13, S * 0.62, 1, () => B.ink);
  stroke(put, cx - S * 0.05, S * 0.58, cx - S * 0.05, S * 0.62, 1, () => B.ink);
  // one burst crate corner spilling hardtack
  [[0.16, 0.72], [0.19, 0.74], [0.14, 0.75]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.014, S * 0.008, (tx, ty) => mix(B.sail, B.sailDk, tx)));
}
// 10 · RUM BARREL — leaking amber
function dBarrel(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.16);
  // barrel on its side? upright w/ tap
  for (let y = S * 0.4; y < S * 0.74; y++) {
    const t = (y - S * 0.4) / (S * 0.34);
    const bulge = Math.sin(t * Math.PI) * S * 0.025;
    row(put, Math.round(y), cx - S * 0.1 - bulge, cx + S * 0.1 + bulge, (tx) => {
      let b = mix(B.wood, B.woodDk, clamp(tx * 1.15, 0, 1));
      if (((tx * 9) | 0) % 2) b = mix(b, B.woodLt, 0.18); // staves
      return b;
    });
  }
  // hoops
  [0.45, 0.56, 0.68].forEach(fy => {
    const t = (fy - 0.4) / 0.34, bulge = Math.sin(t * Math.PI) * S * 0.025;
    row(put, Math.round(S * fy), cx - S * 0.1 - bulge, cx + S * 0.1 + bulge, (tx) => mix('#8a8a92', '#4a4a52', tx));
  });
  // lid ellipse
  ell(put, cx, S * 0.4, S * 0.1, S * 0.028, (tx, ty) => mix(B.woodLt, B.woodDk, clamp(tx + ty * 0.5, 0, 1)));
  // bung tap + amber leak pooling
  put(Math.round(cx - S * 0.11), Math.round(S * 0.6), B.brassDk);
  stroke(put, cx - S * 0.115, S * 0.61, cx - S * 0.12, S * 0.66, 1.2, () => B.gold);
  ell(put, cx - S * 0.13, S * 0.76, S * 0.05, S * 0.016, (tx, ty) => mix(B.goldLt, B.goldDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)));
  put(Math.round(cx - S * 0.12), Math.round(S * 0.7), B.goldLt);
  // XXX brand
  stroke(put, cx - S * 0.03, S * 0.5, cx + S * 0.01, S * 0.545, 1, () => B.woodDk);
  stroke(put, cx + S * 0.01, S * 0.5, cx - S * 0.03, S * 0.545, 1, () => B.woodDk);
  stroke(put, cx + S * 0.025, S * 0.5, cx + S * 0.065, S * 0.545, 1, () => B.woodDk);
  stroke(put, cx + S * 0.065, S * 0.5, cx + S * 0.025, S * 0.545, 1, () => B.woodDk);
}
// 11 · TREASURE CHEST — burst open, gold spill
function dChest(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // base box
  plate(put, cx - S * 0.15, S * 0.56, cx + S * 0.15, S * 0.74, B.wood, B.woodLt, B.woodDk);
  for (let i = 1; i < 3; i++) row(put, Math.round(S * 0.56 + (S * 0.18) * i / 3), cx - S * 0.14, cx + S * 0.14, () => B.woodDk);
  // brass banding + lock
  [[-0.09], [0.09]].forEach(([dx]) => { for (let y = S * 0.56; y < S * 0.74; y++) put(Math.round(cx + dx * S), Math.round(y), B.brass); });
  plate(put, cx - S * 0.025, S * 0.56, cx + S * 0.025, S * 0.62, B.brass, B.brassLt, B.brassDk);
  // lid thrown open behind
  for (let t = 0; t < 1; t += 0.06) {
    const yy = S * (0.56 - t * 0.14);
    row(put, Math.round(yy), cx - S * (0.15 - t * 0.02), cx + S * (0.15 - t * 0.02), (tx) => {
      let b = mix(B.woodLt, B.woodDk, clamp(tx * 1.1 + t * 0.2, 0, 1));
      return b;
    });
  }
  // gold heaped inside + spilling front
  ell(put, cx, S * 0.56, S * 0.12, S * 0.04, (tx, ty) => mix(B.goldLt, B.goldDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [[-0.08, 0.76], [0.02, 0.78], [0.1, 0.76], [-0.02, 0.8], [0.16, 0.79]].forEach(([dx, dy]) => { ell(put, cx + dx * S, S * dy, S * 0.012, S * 0.008, (tx, ty) => mix(B.goldLt, B.goldDk, ty)); });
  [[-0.05, 0.54], [0.06, 0.545]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), B.white)); // glints
  // one pearl string over the rim
  for (let t = 0; t < 1; t += 0.14) put(Math.round(cx + S * (0.1 + t * 0.05)), Math.round(S * (0.58 + t * 0.1)), '#e8e0d0');
}
// 12 · ANCHOR + CHAIN — flukes buried in flesh
function dAnchor(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // shank
  stroke(put, cx, S * 0.3, cx, S * 0.72, S * 0.024, () => '#5a626e');
  stroke(put, cx - S * 0.003, S * 0.3, cx - S * 0.003, S * 0.72, S * 0.008, () => '#8a929e');
  // stock crossbar
  stroke(put, cx - S * 0.11, S * 0.38, cx + S * 0.11, S * 0.38, S * 0.02, () => '#4a525e');
  // ring + chain going up-off
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(cx + Math.cos(a) * S * 0.026), Math.round(S * 0.28 + Math.sin(a) * S * 0.026), '#8a929e');
  for (let i = 0; i < 5; i++) {
    const lx = cx + S * (0.04 + i * 0.045), ly = S * (0.24 - i * 0.026);
    for (let a = 0; a < 6.28; a += 0.5) put(Math.round(lx + Math.cos(a) * 3), Math.round(ly + Math.sin(a) * 2), i % 2 ? '#6a727e' : '#4a525e');
  }
  // curved arms + flukes buried in a flesh mound
  for (let s = -1; s <= 1; s += 2) {
    for (let t = 0; t < 1; t += 0.04) {
      const a = Math.PI / 2 + s * t * 1.3;
      const px = cx + Math.cos(a) * -s * S * 0.13 * s + s * Math.sin(t * 1.4) * S * 0.13, py = S * 0.72 - Math.sin(t * 1.7) * S * 0.0 + -Math.cos(t * 1.5) * S * 0.0;
    }
    // simpler: arc arms
    for (let t = 0; t < 1; t += 0.03) {
      const px = cx + s * Math.sin(t * 1.5) * S * 0.14, py = S * (0.72 - Math.sin(t * Math.PI) * 0.06 + t * 0.0);
      ell(put, px, py - (t > 0.6 ? (t - 0.6) * S * 0.12 : 0), S * 0.014, S * 0.012, (tx, ty) => mix('#6a727e', '#3a424e', tx + ty * 0.3));
    }
    // fluke tip
    fin(put, cx + s * S * 0.14, S * 0.66, cx + s * S * 0.19, S * 0.6, cx + s * S * 0.12, S * 0.62, '#8a929e', '#4a525e');
  }
  // flesh mound over one fluke + rust streaks
  ell(put, cx + S * 0.15, S * 0.68, S * 0.07, S * 0.035, (tx, ty) => mix(B.meat, B.fleshDk, tx + ty * 0.3));
  [[0.01, 0.45], [-0.012, 0.55]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy + 0.06), 1, () => '#a5623a'));
}
// 13 · TIPPED CANNON — barnacled bronze
function dCannon(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // barrel tipped diagonal, muzzle up-left
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx + S * (0.16 - t * 0.32), py = S * (0.68 - t * 0.22);
    const w = S * (0.055 - t * 0.02);
    ell(put, px, py, w, w * 0.9, (tx, ty) => {
      let b = mix('#7a6a4a', '#3a3020', clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty < 0.3) b = mix(b, '#a89464', 0.35); // bronze sheen
      return b;
    });
  }
  // muzzle mouth
  ell(put, cx - S * 0.165, S * 0.455, S * 0.032, S * 0.028, (tx, ty) => mix('#3a3020', B.oil, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)));
  ell(put, cx - S * 0.165, S * 0.455, S * 0.016, S * 0.014, () => B.oil);
  // reinforcement rings
  [0.2, 0.5, 0.8].forEach(ft => {
    const px = cx + S * (0.16 - ft * 0.32), py = S * (0.68 - ft * 0.22);
    ell(put, px, py, S * (0.055 - ft * 0.02) + 1, (S * (0.055 - ft * 0.02)) * 0.9 + 1, (tx, ty) => (Math.hypot(tx - 0.5, ty - 0.5) * 2 > 0.82 ? mix('#a89464', '#3a3020', ty) : null));
  });
  // broken carriage wheel beside
  for (let a = 0; a < 6.28; a += 0.1) put(Math.round(cx + S * 0.2 + Math.cos(a) * S * 0.05), Math.round(S * 0.72 + Math.sin(a) * S * 0.05 * 0.5), B.woodDk);
  stroke(put, cx + S * 0.16, S * 0.72, cx + S * 0.24, S * 0.72, 1.2, () => B.wood);
  // barnacle crust patches
  [[0.05, 0.62], [0.1, 0.68], [-0.04, 0.58]].forEach(([dx, dy]) => { ell(put, cx + dx * S, S * dy, S * 0.016, S * 0.012, (tx, ty) => mix(B.bone, B.boneDk, ty)); put(Math.round(cx + dx * S), Math.round(S * dy), B.oil); });
  // one cannonball half-sunk
  dome(put, cx + S * 0.02, S * 0.76, S * 0.028, S * 0.02, '#3a424e', '#6a727e', B.oil);
}
// 14 · WRECKED DINGHY — rowboat with a bite-sized hole
function dDinghy(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // hull side profile, tilted
  for (let y = S * 0.52; y < S * 0.7; y++) {
    const t = (y - S * 0.52) / (S * 0.18);
    const wl = S * (0.24 - t * 0.1), wr = S * (0.22 - t * 0.08);
    row(put, Math.round(y), cx - wl, cx + wr, (tx) => {
      // the HOLE — ragged gap right of center
      if (t > 0.2 && t < 0.85 && tx > 0.58 && tx < 0.78 && ((tx * 40 + y) | 0) % 9 !== 0) return null;
      let b = mix(B.wood, B.woodDk, clamp(t * 0.9 + Math.abs(tx - 0.4) * 0.3, 0, 1));
      if (((y | 0) % 5) === 0) b = mix(b, B.woodLt, 0.25); // lapped planks
      return b;
    });
  }
  // gunwale rim
  row(put, Math.round(S * 0.52), cx - S * 0.24, cx + S * 0.22, (tx) => mix(B.woodLt, B.wood, tx));
  // prow + stern curls
  stroke(put, cx - S * 0.24, S * 0.52, cx - S * 0.27, S * 0.46, 2, () => B.wood);
  stroke(put, cx + S * 0.22, S * 0.52, cx + S * 0.24, S * 0.47, 2, () => B.woodDk);
  // snapped oar leaning out
  stroke(put, cx + S * 0.08, S * 0.5, cx + S * 0.2, S * 0.32, 1.8, () => B.woodLt);
  fin(put, cx + S * 0.2, S * 0.32, cx + S * 0.24, S * 0.26, cx + S * 0.17, S * 0.28, B.wood, B.woodDk);
  // bench plank visible through gap
  row(put, Math.round(S * 0.56), cx - S * 0.1, cx + S * 0.02, (tx) => mix(B.woodLt, B.wood, tx));
  // acid pool it sits in
  ell(put, cx, S * 0.72, S * 0.2, S * 0.035, (tx, ty) => mix(B.acid, B.acidDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)));
}
// 15 · LOBSTER TRAP — wooden pot, something's inside
function dTrap(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.18);
  // half-cylinder slat cage
  for (let a = 0; a < Math.PI; a += 0.045) {
    const px = cx + Math.cos(a + Math.PI) * S * 0.16, py = S * 0.66 - Math.sin(a) * S * 0.14;
    put(Math.round(px), Math.round(py), B.woodDk);
  }
  // vertical slats
  for (let i = -3; i <= 3; i++) {
    const px = cx + i * S * 0.045;
    const h = Math.sqrt(Math.max(0, 1 - Math.pow(i / 3.6, 2))) * S * 0.14;
    stroke(put, px, S * 0.66, px, S * 0.66 - h, 1.6, () => (i % 2 ? B.wood : B.woodDk));
  }
  // horizontal slats
  [0.03, 0.07, 0.11].forEach(dh => {
    const w = Math.sqrt(Math.max(0, 1 - Math.pow(dh / 0.14, 2))) * S * 0.155;
    row(put, Math.round(S * 0.66 - S * dh), cx - w, cx + w, (tx) => ((tx * 12 | 0) % 2 ? null : B.wood));
  });
  // base board
  row(put, Math.round(S * 0.66), cx - S * 0.17, cx + S * 0.17, (tx) => mix(B.wood, B.woodDk, tx));
  row(put, Math.round(S * 0.67), cx - S * 0.17, cx + S * 0.17, (tx) => mix(B.woodDk, B.oil, tx));
  // eyes glowing inside the dark
  ell(put, cx + S * 0.02, S * 0.6, S * 0.06, S * 0.05, () => B.oil);
  put(Math.round(cx), Math.round(S * 0.6), B.red); put(Math.round(cx + S * 0.035), Math.round(S * 0.6), B.red);
  // rope + cork floats
  stroke(put, cx - S * 0.15, S * 0.54, cx - S * 0.22, S * 0.42, 1, () => B.rope);
  [[-0.23, 0.4], [-0.2, 0.36]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.016, S * 0.012, (tx, ty) => mix('#d87a5a', '#8a3a2a', ty)));
}
// 16 · GHOST NET — tangled net + cork floats
function dNet(put, S) {
  const cx = S * 0.5;
  // draped net mesh — two sagging spans
  for (let i = 0; i <= 6; i++) {
    // verticals w/ sag
    const px = cx - S * 0.2 + i * S * 0.066;
    for (let t = 0; t < 1; t += 0.04) {
      const py = S * (0.34 + t * 0.34) + Math.sin(t * Math.PI) * S * 0.03 * Math.sin(i * 1.2);
      put(Math.round(px + Math.sin(t * 5 + i) * 2), Math.round(py), (i + (t * 10 | 0)) % 2 ? B.rope : B.ropeDk);
    }
  }
  for (let j = 0; j <= 5; j++) {
    const py = S * (0.36 + j * 0.062);
    for (let t = 0; t < 1; t += 0.03) {
      const px = cx - S * 0.2 + t * S * 0.4;
      put(Math.round(px), Math.round(py + Math.sin(t * Math.PI) * S * 0.035 + Math.sin(t * 8 + j) * 1.5), (j + (t * 12 | 0)) % 2 ? B.ropeDk : B.rope);
    }
  }
  // cork floats along the top edge
  for (let i = 0; i < 4; i++) ell(put, cx - S * 0.16 + i * S * 0.1, S * 0.335 + Math.sin(i * 1.2) * 3, S * 0.018, S * 0.013, (tx, ty) => mix('#d87a5a', '#8a3a2a', clamp(tx + ty * 0.4, 0, 1)));
  // snagged fish bones + a boot caught in it
  stroke(put, cx - S * 0.06, S * 0.5, cx + S * 0.0, S * 0.52, 1.2, () => B.bone);
  [[-0.03, 0.49], [-0.01, 0.51], [0.01, 0.5]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy + 0.025), 0.9, () => B.boneDk));
  // old boot
  plate(put, cx + S * 0.08, S * 0.58, cx + S * 0.14, S * 0.66, '#3a3028', '#5a5048', B.oil);
  plate(put, cx + S * 0.08, S * 0.64, cx + S * 0.17, S * 0.67, '#241c16', '#3a3028', B.oil);
}
// 17 · PREY SKELETON — giant fish picked clean
function dSkeleton(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // spine arc
  for (let t = 0; t < 1; t += 0.02) {
    const px = cx - S * 0.24 + t * S * 0.48, py = S * 0.56 + Math.sin(t * Math.PI) * -S * 0.06;
    ell(put, px, py, S * 0.012, S * 0.01, (tx, ty) => mix(B.bone, B.boneDk, tx + ty * 0.3));
  }
  // rib pairs off the spine
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    const px = cx - S * 0.24 + t * S * 0.48, py = S * 0.56 + Math.sin(t * Math.PI) * -S * 0.06;
    const len = Math.sin(t * Math.PI) * S * 0.11 + S * 0.02;
    stroke(put, px, py, px - len * 0.2, py + len, 1.3, () => (i % 2 ? B.bone : B.boneDk));
  }
  // skull w/ jaw + eye hole
  ell(put, cx - S * 0.27, S * 0.55, S * 0.05, S * 0.04, (tx, ty) => mix(B.bone, B.boneDk, clamp(tx * 0.8 + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.285, S * 0.54, S * 0.012, S * 0.013, () => B.oil);
  stroke(put, cx - S * 0.31, S * 0.575, cx - S * 0.24, S * 0.585, 1.4, () => B.boneDk); // jaw
  for (let i = 0; i < 3; i++) put(Math.round(cx - S * (0.3 - i * 0.018)), Math.round(S * 0.57), B.tooth);
  // tail fin bones fanned
  [[-0.02, -0.06], [0, -0.02], [-0.01, 0.03]].forEach(([dxa, dya]) => stroke(put, cx + S * 0.24, S * 0.56, cx + S * (0.3 + dxa), S * (0.56 + dya * 2), 1.1, () => B.boneDk));
  // one rib snapped on the floor
  stroke(put, cx + S * 0.04, S * 0.7, cx + S * 0.1, S * 0.72, 1.2, () => B.bone);
}
// 18 · KELP WAD — half-digested seaweed tangle
function dKelp(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // heaped tangle
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7, r = S * (0.04 + (i % 3) * 0.03);
    const bx = cx + Math.cos(a) * r * 1.4, by = S * 0.62 + Math.sin(a) * r * 0.6;
    for (let t = 0; t < 1; t += 0.05) {
      const px = bx + Math.cos(a + t * 3) * S * 0.06 * t, py = by + Math.sin(a + t * 3) * S * 0.03 * t - t * S * 0.05;
      ell(put, px, py, S * 0.016, S * 0.01, (tx, ty) => {
        let b = mix('#4a6a2a', '#243a12', clamp(tx + ty * 0.4, 0, 1));
        if (i % 3 === 0) b = mix(b, B.acidDk, 0.45); // digested patches
        return b;
      });
    }
  }
  // limp fronds flopping out
  [[-0.14, 1], [0.12, -1], [0.02, 1]].forEach(([dx, s], i) => {
    for (let t = 0; t < 1; t += 0.04) {
      const px = cx + dx * S + s * t * S * 0.12, py = S * 0.62 + t * S * 0.14 + Math.sin(t * 6) * 2;
      ell(put, px, py, S * (0.014 - t * 0.006), S * 0.008, (tx, ty) => mix('#5a7a3a', '#2a4218', tx));
    }
  });
  // air bladder pods + acid drips
  [[-0.06, 0.54], [0.08, 0.56]].forEach(([dx, dy]) => { ell(put, cx + dx * S, S * dy, S * 0.012, S * 0.01, (tx, ty) => mix('#8aa84a', '#4a6a2a', ty)); put(Math.round(cx + dx * S), Math.round(S * (dy - 0.012)), '#aac86a'); });
  drips(put, cx + S * 0.02, S * 0.6, 2);
}
// 19 · AMBERGRIS BOULDER — waxy glowing lump (treasure of the gut)
function dAmbergris(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // waxy lumpy boulder
  [[0, 0.6, 0.13, 0.1], [-0.09, 0.64, 0.08, 0.06], [0.1, 0.66, 0.07, 0.05], [0.02, 0.52, 0.07, 0.05]].forEach(([dx, dy, rx, ry]) => {
    ell(put, cx + dx * S, S * dy, S * rx, S * ry, (tx, ty) => {
      let b = mix('#b8a878', '#6a5a3a', clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty < 0.3) b = mix(b, '#e0d0a0', 0.4); // waxy sheen
      return b;
    });
  });
  // marbled swirls
  [[-0.06, 0.58, 0.05], [0.04, 0.63, 0.06], [0.0, 0.55, 0.04]].forEach(([dx, dy, len]) => {
    for (let t = 0; t < 1; t += 0.08) put(Math.round(cx + dx * S + Math.cos(t * 4) * S * len * t), Math.round(S * dy + Math.sin(t * 4) * S * len * 0.5 * t), '#8a7a52');
  });
  // faint golden aura dots
  for (let a = 0; a < 6.28; a += 0.6) put(Math.round(cx + Math.cos(a) * S * 0.17), Math.round(S * 0.6 + Math.sin(a) * S * 0.12), mix(B.gold, B.fleshDk, 0.6));
  glowDot(put, cx + S * 0.03, S * 0.56, S * 0.008, B.goldLt, B.white);
  // tiny prospector pick left stuck in it (someone tried)
  stroke(put, cx - S * 0.1, S * 0.56, cx - S * 0.14, S * 0.48, 1.3, () => B.wood);
  fin(put, cx - S * 0.14, S * 0.48, cx - S * 0.18, S * 0.5, cx - S * 0.12, S * 0.45, '#8a929e', '#4a525e');
}
// 20 · LANTERN RIG — the crew's strung-up ship lanterns
function dLanterns(put, S) {
  const cx = S * 0.5;
  // rope strung between two hooks
  for (let t = 0; t < 1; t += 0.02) {
    const px = cx - S * 0.24 + t * S * 0.48, py = S * 0.36 + Math.sin(t * Math.PI) * S * 0.07;
    put(Math.round(px), Math.round(py), (t * 20 | 0) % 2 ? B.rope : B.ropeDk);
  }
  [[-0.24], [0.24]].forEach(([dx]) => { stroke(put, cx + dx * S, S * 0.36, cx + dx * S, S * 0.3, 1.4, () => B.brassDk); put(Math.round(cx + dx * S), Math.round(S * 0.3), B.brass); });
  // three hanging lanterns
  [[-0.13, 0.44], [0.0, 0.47], [0.13, 0.44]].forEach(([dx, dy], i) => {
    const lx = cx + dx * S, ly = S * dy;
    stroke(put, lx, ly - S * 0.045, lx, ly - S * 0.075 + Math.sin(i) * 1, 1, () => B.ropeDk); // hang cord
    // cage
    dome(put, lx, ly - S * 0.045, S * 0.022, S * 0.012, B.brass, B.brassLt, B.brassDk); // cap
    for (let y = ly - S * 0.04; y < ly + S * 0.035; y++) {
      const t = (y - (ly - S * 0.04)) / (S * 0.075);
      const w = S * 0.022 * (0.7 + Math.sin(t * Math.PI) * 0.45);
      row(put, Math.round(y), lx - w, lx + w, (tx) => {
        if (((tx * 5) | 0) === 1 || ((tx * 5) | 0) === 3) return mix(B.goldLt, B.gold, t); // glass glow
        return mix(B.brass, B.brassDk, clamp(tx * 1.2, 0, 1)); // frame bars
      });
    }
    ell(put, lx, ly + S * 0.04, S * 0.016, S * 0.008, (tx, ty) => mix(B.brass, B.brassDk, tx)); // base
    glowDot(put, lx, ly, S * 0.008, B.goldLt, B.white); // flame
    // light pool glow beneath
    ell(put, lx, ly + S * 0.1, S * 0.045, S * 0.014, (tx) => mix(mix(B.gold, B.fleshDk, 0.65), B.fleshDk, tx));
  });
}

const LIST = [
  { n: 1, name: 'RIB ARCH', role: 'bone vault landmark', draw: dRibArch },
  { n: 2, name: 'FLESH SPIRE', role: 'papilla stalagmite', draw: dSpire },
  { n: 3, name: 'ACID POOL', role: 'bubbling digestive pond', draw: dAcidPool },
  { n: 4, name: 'VEIN CLUSTER', role: 'glowing vein web', draw: dVeins },
  { n: 5, name: 'BALEEN CURTAIN', role: 'hanging filter plates', draw: dBaleen },
  { n: 6, name: 'BROKEN MAST', role: 'snapped, tilted crows nest', draw: dMast },
  { n: 7, name: 'TORN SAIL', role: 'canvas rigged on rib stumps', draw: dSail },
  { n: 8, name: 'SHIPS WHEEL', role: 'half-sunk in the floor', draw: dWheel },
  { n: 9, name: 'CARGO CRATES', role: 'stenciled stack, one burst', draw: dCrates },
  { n: 10, name: 'RUM BARREL', role: 'leaking amber', draw: dBarrel },
  { n: 11, name: 'TREASURE CHEST', role: 'burst open, gold spill', draw: dChest },
  { n: 12, name: 'ANCHOR + CHAIN', role: 'fluke buried in flesh', draw: dAnchor },
  { n: 13, name: 'TIPPED CANNON', role: 'barnacled bronze', draw: dCannon },
  { n: 14, name: 'WRECKED DINGHY', role: 'rowboat, bitten hull', draw: dDinghy },
  { n: 15, name: 'LOBSTER TRAP', role: 'something is inside', draw: dTrap },
  { n: 16, name: 'GHOST NET', role: 'tangled net + floats', draw: dNet },
  { n: 17, name: 'PREY SKELETON', role: 'giant fish picked clean', draw: dSkeleton },
  { n: 18, name: 'KELP WAD', role: 'half-digested tangle', draw: dKelp },
  { n: 19, name: 'AMBERGRIS BOULDER', role: 'waxy treasure lump', draw: dAmbergris },
  { n: 20, name: 'LANTERN RIG', role: 'crew-strung ship lights', draw: dLanterns },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'belly_decor_options.png', title: 'BELLY OF THE BEAST — DECOR (20 candidates) — pick numbers', S: 160 });
}
module.exports = { LIST };
