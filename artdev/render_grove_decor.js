// artdev/render_grove_decor.js — 20 numbered GROVE DECORATION candidates for
// the map-dressing pass (user 2026-07-15: "make a 20 sheet of decorations and
// assets ... so i can mix and match"). Picked options port into world_art.js
// and scatter through setupGrove. node artdev/render_grove_decor.js out.png
'use strict';
const path = require('path');
const R = require(path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
const sharp = require('sharp');
const mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

const C = {
  OUT: '#1a1c2c',
  leaf: '#38b764', leafLt: '#8ff0a5', leafDk: '#1f6e3f', leafDkk: '#14492a',
  bark: '#5b4636', barkLt: '#7d6450', barkDk: '#3a2c22', wood: '#7a4a2b', woodDk: '#4d2f1c',
  birch: '#e8e4da', birchDk: '#b8b4aa', birchMark: '#3a3c40',
  capRed: '#d95763', capRedLt: '#f28d9a', capRedDk: '#9e2835', cream: '#f4e3c2', creamDk: '#d8bf94',
  glow: '#6ff0e0', glowLt: '#c8fff4', glowDk: '#2fa998',
  honey: '#ffcd75', honeyLt: '#ffe3a8', honeyDk: '#d7a13a',
  pixie: '#ff77a8', pixieLt: '#ffc2d8',
  stone: '#7c8494', stoneLt: '#a4adc0', stoneDk: '#4c5262',
  moss: '#3f7a3c', mossLt: '#63b25a',
  water: '#41a6f6', waterLt: '#8fd6ff', waterDk: '#2569a8',
  purple: '#8f3fb5', purpleLt: '#c078e0'
};

// 1 · ANCIENT OAK — gnarled, wide, older than the realm
function dAncientOak(put, S) {
  const cx = S * 0.5;
  for (let y = Math.round(S * 0.55); y < Math.round(S * 0.95); y++) {
    const t = (y - S * 0.55) / (S * 0.4);
    const wob = Math.sin(y * 0.35) * S * 0.02;
    const hw = S * (0.1 + t * 0.09);
    row(put, y, cx - hw + wob, cx + hw + wob, tx => {
      let b = mix(C.barkLt, C.bark, 0.3 + t * 0.6);
      if (Math.abs(tx - 0.35) < 0.07 || Math.abs(tx - 0.7) < 0.06) b = mix(b, C.barkDk, 0.55);
      return b;
    });
  }
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.92, cx + s * S * 0.24, S * 0.98, S * 0.05, t => mix(C.bark, C.barkDk, t)));
  [[0, 0.34, 0.36, 0.17], [-0.26, 0.42, 0.18, 0.12], [0.26, 0.42, 0.18, 0.12], [-0.12, 0.2, 0.2, 0.12], [0.14, 0.19, 0.18, 0.11]].forEach((L, i) => {
    ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], (tx, ty) => {
      let b = mix(C.leaf, C.leafDk, clamp(ty * 1.2, 0, 1));
      if (tx < 0.22) b = mix(b, C.leafLt, 0.45);
      if ((Math.round(tx * 12) + Math.round(ty * 9) + i) % 7 === 0) b = mix(b, C.leafLt, 0.35);
      return b;
    });
  });
  ell(put, cx - S * 0.04, S * 0.66, S * 0.045, S * 0.05, () => C.barkDk);  // knot hollow
}

// 2 · BIRCH CLUSTER — three slim pale trunks
function dBirches(put, S) {
  [[0.3, 0.9, 0.28], [0.52, 1, 0.2], [0.72, 0.84, 0.34]].forEach(B => {
    const bx = S * B[0], top = S * B[2], h = S * B[1];
    for (let y = Math.round(top); y < Math.round(S * 0.96); y++) {
      const hw = S * 0.032;
      row(put, y, bx - hw, bx + hw, tx => {
        let b = mix(C.birch, C.birchDk, tx * 0.8);
        if ((y * 7 + Math.round(bx)) % 11 < 2) b = C.birchMark;
        return b;
      });
    }
    ell(put, bx, top, S * 0.11, S * 0.1, (tx, ty) => mix(C.leafLt, C.leaf, clamp(ty * 1.3, 0, 1)));
  });
}

// 3 · WEEPING WILLOW — drooping curtain
function dWillow(put, S) {
  const cx = S * 0.5;
  for (let y = Math.round(S * 0.5); y < Math.round(S * 0.95); y++)
    row(put, y, cx - S * 0.05, cx + S * 0.05, tx => mix(C.barkLt, C.barkDk, 0.3 + tx * 0.5));
  ell(put, cx, S * 0.32, S * 0.34, S * 0.2, (tx, ty) => mix(C.leaf, C.leafDk, clamp(ty * 1.1, 0, 1)));
  for (let i = -4; i <= 4; i++) {
    const vx = cx + i * S * 0.085;
    const len = S * (0.34 + ((i + 9) % 3) * 0.09);
    stroke(put, vx, S * 0.36, vx + Math.sin(i) * 2, S * 0.36 + len, 1.6, t => mix(C.leafLt, C.leafDk, t));
  }
}

// 4 · GIANT TOADSTOOL — canopy-sized mushroom
function dToadstool(put, S) {
  const cx = S * 0.5;
  for (let y = Math.round(S * 0.5); y < Math.round(S * 0.92); y++) {
    const t = (y - S * 0.5) / (S * 0.42);
    const hw = S * (0.1 + 0.03 * Math.sin(t * Math.PI));
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(C.cream, C.creamDk, t);
      if (tx > 0.7) b = mix(b, C.creamDk, 0.5);
      return b;
    });
  }
  for (let y = Math.round(S * 0.14); y < Math.round(S * 0.54); y++) {
    const t = (y - S * 0.14) / (S * 0.4);
    const hw = S * 0.42 * Math.sin(clamp(0.15 + t * 0.85, 0, 1) * Math.PI * 0.62);
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(C.capRedLt, C.capRed, clamp(t * 1.3, 0, 1));
      if (tx < 0.16) b = mix(b, C.capRedLt, 0.5);
      if (tx > 0.86) b = mix(b, C.capRedDk, 0.4);
      return b;
    });
  }
  [[-0.24, 0.26, 0.06], [0.05, 0.2, 0.07], [0.28, 0.32, 0.05], [-0.06, 0.4, 0.045]].forEach(sp =>
    ell(put, cx + sp[0] * S, S * sp[1], S * sp[2], S * sp[2] * 0.8, () => C.cream));
}

// 5 · FAIRY RING — a circle of little mushrooms
function dFairyRing(put, S) {
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4.5) {
    const mx = S * 0.5 + Math.cos(a) * S * 0.32, my = S * 0.62 + Math.sin(a) * S * 0.2;
    row(put, Math.round(my), mx - 2, mx + 2, () => C.cream);
    row(put, Math.round(my) - 1, mx - 2, mx + 2, () => C.cream);
    ell(put, mx, my - 3, S * 0.05, S * 0.03, (tx, ty) => mix(a % 2 < 1 ? C.capRedLt : C.glowLt, a % 2 < 1 ? C.capRed : C.glow, ty));
  }
  // faint glow inside the ring
  for (let i = 0; i < 22; i++) {
    const a2 = i * 1.7, r2 = (i % 5) * S * 0.045;
    const x = Math.round(S * 0.5 + Math.cos(a2) * r2), y = Math.round(S * 0.62 + Math.sin(a2) * r2 * 0.6);
    if ((x + y) % 3 === 0) put(x, y, C.glowDk);
  }
}

// 6 · LILY POND — water, pads, one bloom
function dLilyPond(put, S) {
  ell(put, S * 0.5, S * 0.62, S * 0.4, S * 0.26, (tx, ty) => {
    let b = mix(C.waterLt, C.water, clamp(ty * 1.2, 0, 1));
    if (tx > 0.75) b = mix(b, C.waterDk, 0.5);
    return b;
  });
  ell(put, S * 0.5, S * 0.62, S * 0.34, S * 0.2, (tx, ty) => mix(C.water, C.waterDk, ty * 0.7));
  stroke(put, S * 0.3, S * 0.56, S * 0.44, S * 0.53, 1, () => C.waterLt);   // ripple
  stroke(put, S * 0.56, S * 0.7, S * 0.7, S * 0.68, 1, () => C.waterLt);
  [[0.36, 0.62], [0.62, 0.56], [0.55, 0.72]].forEach(P2 => {
    ell(put, S * P2[0], S * P2[1], S * 0.07, S * 0.04, (tx, ty) => mix(C.leafLt, C.leaf, ty));
  });
  ell(put, S * 0.62, S * 0.55, S * 0.03, S * 0.02, () => C.pixieLt);       // the bloom
  put(Math.round(S * 0.62), Math.round(S * 0.54), C.pixie);
}

// 7 · MOSSY BOULDERS — a stone cluster
function dBoulders(put, S) {
  [[0.36, 0.66, 0.22, 0.17], [0.66, 0.72, 0.16, 0.12], [0.52, 0.5, 0.13, 0.1]].forEach(B => {
    ell(put, S * B[0], S * B[1], S * B[2], S * B[3], (tx, ty) => {
      let b = mix(C.stone, C.stoneDk, clamp(ty * 1.1, 0, 1));
      if (tx < 0.25) b = mix(b, C.stoneLt, 0.5);
      return b;
    });
  });
  [[0.3, 0.58, 0.08], [0.55, 0.44, 0.06], [0.66, 0.66, 0.07]].forEach(M2 => {
    ell(put, S * M2[0], S * M2[1], S * M2[2], S * M2[2] * 0.6, (tx, ty) => mix(C.mossLt, C.moss, ty));
  });
}

// 8 · HOLLOW STUMP — glowing heart
function dHollowStump(put, S) {
  const cx = S * 0.5;
  for (let y = Math.round(S * 0.42); y < Math.round(S * 0.88); y++) {
    const t = (y - S * 0.42) / (S * 0.46);
    const hw = S * (0.2 + t * 0.05);
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(C.barkLt, C.bark, 0.3 + t * 0.55);
      if (Math.abs(tx - 0.3) < 0.06 || Math.abs(tx - 0.72) < 0.05) b = mix(b, C.barkDk, 0.5);
      return b;
    });
  }
  ell(put, cx, S * 0.42, S * 0.21, S * 0.08, (tx, ty) => mix(C.creamDk, C.cream, tx));
  for (let r2 = 1; r2 <= 2; r2++)
    for (let a = 0; a < Math.PI * 2; a += 0.35)
      put(Math.round(cx + Math.cos(a) * S * 0.055 * r2), Math.round(S * 0.42 + Math.sin(a) * S * 0.02 * r2), C.creamDk);
  ell(put, cx, S * 0.44, S * 0.07, S * 0.035, (tx, ty) => mix(C.glowLt, C.glow, ty));   // the glow inside
  put(Math.round(cx + S * 0.1), Math.round(S * 0.35), C.glowLt);                        // escaping mote
}

// 9 · WILDFLOWER BED — mixed blooms
function dFlowerBed(put, S) {
  ell(put, S * 0.5, S * 0.68, S * 0.38, S * 0.2, (tx, ty) => mix(C.moss, C.leafDkk, ty * 0.8));
  const cols = [C.pixie, C.honey, C.glowLt, C.pixieLt, '#f4f4f4'];
  for (let i = 0; i < 16; i++) {
    const fx = S * 0.18 + (i * 37 % Math.round(S * 0.64));
    const fy = S * 0.54 + (i * 23 % Math.round(S * 0.26));
    stroke(put, fx, fy + 4, fx, fy, 1, () => C.leaf);
    put(Math.round(fx), Math.round(fy), cols[i % cols.length]);
    put(Math.round(fx) + 1, Math.round(fy), cols[(i + 2) % cols.length]);
  }
}

// 10 · PIXIE LANTERNS — glowing jars strung from a branch pole
function dLanterns(put, S) {
  stroke(put, S * 0.2, S * 0.9, S * 0.24, S * 0.2, S * 0.035, t => mix(C.bark, C.barkDk, t));
  stroke(put, S * 0.24, S * 0.24, S * 0.82, S * 0.34, S * 0.025, t => mix(C.bark, C.woodDk, t));
  [[0.4, 0.28, C.honey, C.honeyLt], [0.58, 0.31, C.glow, C.glowLt], [0.74, 0.33, C.pixie, C.pixieLt]].forEach(L => {
    const lx = S * L[0], ly = S * L[1] + S * 0.1;
    stroke(put, lx, ly - S * 0.08, lx, ly - S * 0.03, 1, () => C.creamDk);
    ell(put, lx, ly, S * 0.045, S * 0.055, (tx, ty) => mix(L[3], L[2], ty));
    row(put, Math.round(ly - S * 0.055), lx - 2, lx + 2, () => C.woodDk);
  });
}

// 11 · STONE ARCH — mossy ruin
function dStoneArch(put, S) {
  [-1, 1].forEach(s => {
    const px = S * 0.5 + s * S * 0.26;
    for (let y = Math.round(S * 0.34); y < Math.round(S * 0.9); y++) {
      row(put, y, px - S * 0.06, px + S * 0.06, tx => {
        let b = mix(C.stoneLt, C.stone, 0.3 + tx * 0.5);
        if (y % 7 === 0) b = mix(b, C.stoneDk, 0.5);
        return b;
      });
    }
  });
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.06) {
    const x = S * 0.5 + Math.cos(a) * S * 0.26, y = S * 0.34 + Math.sin(a) * S * 0.18;
    for (let w2 = -3; w2 <= 3; w2++) put(Math.round(x), Math.round(y + w2), mix(C.stoneLt, C.stone, Math.abs(w2) / 3));
  }
  [[0.28, 0.5], [0.72, 0.66], [0.5, 0.19]].forEach(M2 =>
    ell(put, S * M2[0], S * M2[1], S * 0.05, S * 0.03, (tx, ty) => mix(C.mossLt, C.moss, ty)));
}

// 12 · RUNESTONE — standing stone, glowing marks
function dRunestone(put, S) {
  const cx = S * 0.5;
  for (let y = Math.round(S * 0.18); y < Math.round(S * 0.9); y++) {
    const t = (y - S * 0.18) / (S * 0.72);
    const hw = S * (0.13 + t * 0.07) * (t < 0.1 ? 0.6 + t * 4 : 1);
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(C.stoneLt, C.stone, 0.25 + t * 0.5);
      if (tx > 0.78) b = mix(b, C.stoneDk, 0.5);
      return b;
    });
  }
  // runes
  [[0, 0.32], [0.04, 0.46], [-0.05, 0.6], [0.02, 0.74]].forEach((R2, i) => {
    const rx = cx + R2[0] * S, ry = S * R2[1];
    stroke(put, rx - 3, ry, rx + 3, ry, 1, () => C.glow);
    if (i % 2) stroke(put, rx, ry - 3, rx, ry + 3, 1, () => C.glow);
    else stroke(put, rx - 2, ry - 3, rx + 2, ry + 3, 1, () => C.glowLt);
  });
  ell(put, cx, S * 0.9, S * 0.2, S * 0.05, (tx, ty) => mix(C.moss, C.leafDkk, ty));
}

// 13 · MOSSY LOG — low fallen log (pure decor cousin of the hazard trunk)
function dMossyLog(put, S) {
  for (let y = Math.round(S * 0.52); y < Math.round(S * 0.74); y++) {
    const t = Math.abs(y - S * 0.63) / (S * 0.11);
    row(put, y, S * 0.1, S * 0.9, tx => {
      let b = mix(C.barkLt, C.bark, 0.2 + t * 0.7);
      if ((Math.round(tx * 40) + y) % 9 === 0) b = mix(b, C.barkDk, 0.5);
      return b;
    });
  }
  ell(put, S * 0.1, S * 0.63, S * 0.035, S * 0.11, (tx, ty) => mix(C.cream, C.creamDk, ty));
  [[0.3, 0.5], [0.62, 0.72], [0.78, 0.52]].forEach(M2 =>
    ell(put, S * M2[0], S * M2[1], S * 0.08, S * 0.045, (tx, ty) => mix(C.mossLt, C.moss, ty)));
  ell(put, S * 0.4, S * 0.47, S * 0.035, S * 0.025, (tx, ty) => mix(C.capRedLt, C.capRed, ty)); // hitchhiker shroom
}

// 14 · BRAMBLE PATCH — thorny tangle
function dBramble(put, S) {
  for (let i = 0; i < 7; i++) {
    const x0 = S * (0.15 + (i * 31 % 50) / 100), y0 = S * (0.5 + (i * 17 % 30) / 100);
    const x1 = x0 + S * (0.12 + (i % 3) * 0.08) * ((i % 2) ? 1 : -0.7), y1 = y0 - S * (0.06 + (i % 4) * 0.04);
    stroke(put, x0, y0, x1, y1, 1.8, t => mix(C.leafDk, C.leafDkk, t));
    put(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2) - 2, C.leafDkk);      // thorn
    put(Math.round(x1), Math.round(y1) - 2, C.leafDk);
  }
  [[0.34, 0.6], [0.6, 0.52]].forEach(B2 => {
    put(Math.round(S * B2[0]), Math.round(S * B2[1]), C.pixie);                    // berries
    put(Math.round(S * B2[0]) + 2, Math.round(S * B2[1]) + 1, C.capRedDk);
  });
}

// 15 · FERN CLUSTER
function dFerns(put, S) {
  [[0.32, -0.5], [0.5, 0], [0.68, 0.5], [0.42, -0.2], [0.58, 0.25]].forEach((F, i) => {
    const bx = S * F[0], lean = F[1];
    for (let seg = 0; seg <= 8; seg++) {
      const t = seg / 8;
      const x = bx + lean * t * S * 0.14, y = S * 0.85 - t * S * (0.34 + (i % 2) * 0.1);
      put(Math.round(x), Math.round(y), mix(C.leaf, C.leafDk, t));
      const fw = (1 - t) * S * 0.07;
      stroke(put, x - fw, y - fw * 0.4, x, y, 1, () => (seg % 2 ? C.leafLt : C.leaf));
      stroke(put, x + fw, y - fw * 0.4, x, y, 1, () => (seg % 2 ? C.leaf : C.leafLt));
    }
  });
}

// 16 · BUTTERFLY BUSH — flowering bush + visitors
function dButterflyBush(put, S) {
  ell(put, S * 0.5, S * 0.64, S * 0.3, S * 0.22, (tx, ty) => {
    let b = mix(C.leaf, C.leafDk, clamp(ty * 1.1, 0, 1));
    if (tx < 0.25) b = mix(b, C.leafLt, 0.4);
    return b;
  });
  for (let i = 0; i < 8; i++) {
    const fx = S * 0.3 + (i * 29 % Math.round(S * 0.4)), fy = S * 0.5 + (i * 19 % Math.round(S * 0.2));
    put(Math.round(fx), Math.round(fy), i % 2 ? C.purpleLt : C.pixieLt);
    put(Math.round(fx) + 1, Math.round(fy), C.purple);
  }
  [[0.28, 0.36, C.honeyLt], [0.66, 0.3, C.glowLt]].forEach(B2 => {
    const bx = S * B2[0], by = S * B2[1];
    put(Math.round(bx) - 1, Math.round(by) - 1, B2[2]); put(Math.round(bx) + 1, Math.round(by) - 1, B2[2]);
    put(Math.round(bx), Math.round(by), C.OUT);
  });
}

// 17 · WISP SPRING — tiny stone well, rising motes
function dWispSpring(put, S) {
  ell(put, S * 0.5, S * 0.72, S * 0.24, S * 0.13, (tx, ty) => mix(C.stoneLt, C.stoneDk, ty));
  ell(put, S * 0.5, S * 0.7, S * 0.17, S * 0.08, (tx, ty) => mix(C.glowLt, C.water, ty));
  for (let a = 0; a < Math.PI * 2; a += 0.5)
    put(Math.round(S * 0.5 + Math.cos(a) * S * 0.22), Math.round(S * 0.72 + Math.sin(a) * S * 0.12), C.stone);
  [[0.46, 0.56], [0.54, 0.46], [0.48, 0.34], [0.56, 0.24]].forEach((M2, i) => {
    put(Math.round(S * M2[0]), Math.round(S * M2[1]), i % 2 ? C.glowLt : C.glow);
  });
}

// 18 · ROOT SNARL — huge surface roots
function dRootSnarl(put, S) {
  [[0.14, 0.72, 0.5, 0.52, 0.88, 0.7], [0.2, 0.86, 0.5, 0.68, 0.84, 0.9], [0.3, 0.6, 0.55, 0.44, 0.76, 0.58]].forEach(R2 => {
    // two joined strokes: rise then fall (an arched root)
    stroke(put, S * R2[0], S * R2[1], S * R2[2], S * R2[3], S * 0.045, t => mix(C.barkLt, C.bark, t * 0.7));
    stroke(put, S * R2[2], S * R2[3], S * R2[4], S * R2[5], S * 0.045, t => mix(C.bark, C.barkDk, t * 0.7));
  });
  [[0.5, 0.4], [0.32, 0.68]].forEach(M2 =>
    ell(put, S * M2[0], S * M2[1], S * 0.05, S * 0.03, (tx, ty) => mix(C.mossLt, C.moss, ty)));
}

// 19 · IVY OBELISK — broken pillar swallowed by vines
function dObelisk(put, S) {
  const cx = S * 0.52;
  for (let y = Math.round(S * 0.26); y < Math.round(S * 0.9); y++) {
    const t = (y - S * 0.26) / (S * 0.64);
    const hw = S * (0.11 + t * 0.04);
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(C.stoneLt, C.stone, 0.25 + t * 0.5);
      if (y % 9 === 0) b = mix(b, C.stoneDk, 0.5);
      if (tx > 0.8) b = mix(b, C.stoneDk, 0.4);
      return b;
    });
  }
  // broken top (jagged)
  for (let x = -4; x <= 4; x++) put(Math.round(cx + x * 1.6), Math.round(S * 0.26 - Math.abs(x % 3)), C.stoneLt);
  // ivy winding up
  for (let seg = 0; seg <= 12; seg++) {
    const t = seg / 12;
    const x = cx + Math.sin(t * Math.PI * 2.4) * S * 0.1, y = S * 0.88 - t * S * 0.56;
    put(Math.round(x), Math.round(y), C.leaf);
    if (seg % 3 === 0) ell(put, x + 2, y, S * 0.028, S * 0.02, () => C.leafLt);
  }
}

// 20 · SLEEPING STONE GUARDIAN — a moss golem that never woke
function dSleeper(put, S) {
  const cx = S * 0.5;
  ell(put, cx, S * 0.66, S * 0.3, S * 0.2, (tx, ty) => {
    let b = mix(C.stone, C.stoneDk, clamp(ty * 1.1, 0, 1));
    if (tx < 0.2) b = mix(b, C.stoneLt, 0.45);
    return b;
  });
  ell(put, cx - S * 0.2, S * 0.54, S * 0.11, S * 0.09, (tx, ty) => mix(C.stoneLt, C.stone, ty)); // slumped head
  row(put, Math.round(S * 0.53), cx - S * 0.26, cx - S * 0.18, () => C.stoneDk);                  // shut eye
  [[0.06, 0.5, 0.12, 0.06], [0.24, 0.66, 0.09, 0.05], [-0.08, 0.74, 0.1, 0.05]].forEach(M2 =>
    ell(put, cx + M2[0] * S, S * M2[1], S * M2[2], S * M2[3], (tx, ty) => mix(C.mossLt, C.moss, ty)));
  ell(put, cx + S * 0.1, S * 0.48, S * 0.05, S * 0.035, (tx, ty) => mix(C.capRedLt, C.capRed, ty)); // shroom hat
  put(Math.round(cx - S * 0.3), Math.round(S * 0.6), C.glowDk);   // one faint dream-mote
}

const DECOR = [
  { n: 1, name: 'ANCIENT OAK', draw: dAncientOak },
  { n: 2, name: 'BIRCH CLUSTER', draw: dBirches },
  { n: 3, name: 'WEEPING WILLOW', draw: dWillow },
  { n: 4, name: 'GIANT TOADSTOOL', draw: dToadstool },
  { n: 5, name: 'FAIRY RING', draw: dFairyRing },
  { n: 6, name: 'LILY POND', draw: dLilyPond },
  { n: 7, name: 'MOSSY BOULDERS', draw: dBoulders },
  { n: 8, name: 'HOLLOW STUMP', draw: dHollowStump },
  { n: 9, name: 'WILDFLOWER BED', draw: dFlowerBed },
  { n: 10, name: 'PIXIE LANTERNS', draw: dLanterns },
  { n: 11, name: 'STONE ARCH', draw: dStoneArch },
  { n: 12, name: 'RUNESTONE', draw: dRunestone },
  { n: 13, name: 'MOSSY LOG', draw: dMossyLog },
  { n: 14, name: 'BRAMBLE PATCH', draw: dBramble },
  { n: 15, name: 'FERN CLUSTER', draw: dFerns },
  { n: 16, name: 'BUTTERFLY BUSH', draw: dButterflyBush },
  { n: 17, name: 'WISP SPRING', draw: dWispSpring },
  { n: 18, name: 'ROOT SNARL', draw: dRootSnarl },
  { n: 19, name: 'IVY OBELISK', draw: dObelisk },
  { n: 20, name: 'SLEEPING GUARDIAN', draw: dSleeper }
];

async function main() {
  const S = 64, SCALE = 2.4, CELL = Math.round(S * SCALE), PAD = 10, LABEL = 24;
  const COLS = 5, ROWS = 4;
  const GW = COLS * (CELL + PAD) + PAD, GH = ROWS * (CELL + LABEL + PAD) + PAD;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 15; grid[i * 4 + 1] = 15; grid[i * 4 + 2] = 27; grid[i * 4 + 3] = 255; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  DECOR.forEach((m, idx) => {
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
    m.draw(put, S);
    const [or_, og, ob] = hex(C.OUT);
    R.outlinePass(S, S, (x, y) => alpha[y * S + x],
      (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; });
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const ox = PAD + col * (CELL + PAD), oy = PAD + rowI * (CELL + LABEL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      const si = ((Math.min(S - 1, y / SCALE | 0)) * S + Math.min(S - 1, x / SCALE | 0)) * 4;
      if (cell[si + 3] === 0) continue;
      const di = ((oy + y) * GW + (ox + x)) * 4;
      grid[di] = cell[si]; grid[di + 1] = cell[si + 1]; grid[di + 2] = cell[si + 2]; grid[di + 3] = 255;
    }
  });

  const texts = DECOR.map((m, idx) => {
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const x = PAD + col * (CELL + PAD) + CELL / 2;
    const y = PAD + rowI * (CELL + LABEL + PAD) + CELL + 16;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="11" font-weight="bold" fill="#ffcd75" text-anchor="middle">#${m.n} ${m.name}</text>`;
  }).join('');
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}">${texts}</svg>`);
  const out = process.argv[2] || 'grove_decor_options.png';
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } }).composite([{ input: svg }]).png().toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });
