// artdev/crystal/render_crystal_decor.js — 20 numbered CRYSTAL CAVERNS
// decoration candidates, one PNG grid. Sparkle-adventure cave props.
'use strict';
const KIT = require('./crystal_kit.js');
const { K, GEMS, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, shadow, renderSheet, shard, sparkle, rockBase } = KIT;

// 1 · GIANT GEM CLUSTER — the map's centerpiece prop.
function drawCluster(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  rockBase(put, S * 0.5, S * 0.82, S * 0.3, S * 0.09);
  shard(put, S * 0.5, S * 0.84, S * 0.09, S * 0.62, 0, GEMS[0]);
  shard(put, S * 0.34, S * 0.84, S * 0.07, S * 0.42, -0.16, GEMS[2]);
  shard(put, S * 0.66, S * 0.84, S * 0.07, S * 0.46, 0.14, GEMS[1]);
  shard(put, S * 0.24, S * 0.85, S * 0.045, S * 0.24, -0.3, GEMS[1]);
  shard(put, S * 0.76, S * 0.85, S * 0.045, S * 0.26, 0.28, GEMS[0]);
  sparkle(put, S * 0.44, S * 0.3, K.pinkLt); sparkle(put, S * 0.68, S * 0.48, K.cyanLt); sparkle(put, S * 0.3, S * 0.55, K.purpleLt);
}

// 2 · CRYSTAL PILLAR — floor-to-ceiling faceted column.
function drawPillar(put, S) {
  shadow(put, S, S * 0.5, S * 0.2);
  for (let y = S * 0.04; y < S * 0.92; y++) {
    const w = S * (0.1 + 0.03 * Math.sin(y / S * 9));
    row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => {
      let b = mix(K.cyanLt, K.cyan, clamp(tx * 1.4, 0, 1));
      if (tx > 0.68) b = mix(b, K.cyanDk, 0.7);
      if (Math.abs((y / S * 7) % 1 - tx) < 0.08) b = mix(b, '#ffffff', 0.5);
      return b;
    });
  }
  ell(put, S * 0.5, S * 0.92, S * 0.2, S * 0.05, (tx, ty) => mix(K.rockLt, K.rockDk, ty));
  ell(put, S * 0.5, S * 0.05, S * 0.17, S * 0.045, (tx, ty) => mix(K.rockDk, K.rockDkk, ty));
  sparkle(put, S * 0.42, S * 0.3, K.cyanLt); sparkle(put, S * 0.58, S * 0.62, '#ffffff');
}

// 3 · GLOW MUSHROOMS — luminous cap cluster.
function drawShrooms(put, S) {
  shadow(put, S, S * 0.5, S * 0.28);
  rockBase(put, S * 0.5, S * 0.86, S * 0.26, S * 0.07);
  [[0.38, 0.5, 0.14, K.cyan, K.cyanLt], [0.6, 0.42, 0.17, K.pink, K.pinkLt], [0.5, 0.66, 0.1, K.green, K.greenLt], [0.72, 0.64, 0.09, K.cyan, K.cyanLt], [0.28, 0.68, 0.08, K.purple, K.purpleLt]].forEach(([x, y, r, c, lt]) => {
    plate(put, S * x - S * 0.02, S * y, S * x + S * 0.02, S * 0.86, '#d8cfe8', '#f4f0fa', K.rockDk);
    dome(put, S * x, S * y, S * r, S * r * 0.7, c, lt, mix(c, '#000000', 0.45));
    for (let dx = -r; dx < r; dx += 0.05) put(Math.round(S * (x + dx)), Math.round(S * y + 1), lt);
    put(Math.round(S * x), Math.round(S * (y - r * 0.45)), '#ffffff');
  });
  sparkle(put, S * 0.5, S * 0.3, K.greenLt);
}

// 4 · STALAGMITES — rock spike group (floor).
function drawStalagmites(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  [[0.5, 0.6, 0.11], [0.32, 0.42, 0.09], [0.68, 0.38, 0.085], [0.2, 0.26, 0.06], [0.8, 0.24, 0.055]].forEach(([x, h, w]) => {
    for (let y = 0; y < S * h; y++) {
      const t = y / (S * h), ww = S * w * (1 - t * 0.92);
      row(put, Math.round(S * 0.88 - y), S * x - ww, S * x + ww, (tx) => mix(K.rockLt, K.rockDkk, clamp(tx * 1.2 + t * 0.15, 0, 1)));
    }
  });
  ell(put, S * 0.5, S * 0.88, S * 0.36, S * 0.06, (tx, ty) => mix(K.rock, K.rockDkk, ty));
  put(Math.round(S * 0.47), Math.round(S * 0.34), K.pink); put(Math.round(S * 0.66), Math.round(S * 0.56), K.cyan);
}

// 5 · UNDERGROUND POOL — glowing cave water.
function drawPool(put, S) {
  ell(put, S * 0.5, S * 0.6, S * 0.4, S * 0.24, (tx, ty) => mix(K.rockDk, K.rockDkk, ty));
  ell(put, S * 0.5, S * 0.6, S * 0.34, S * 0.19, (tx, ty) => {
    let b = mix('#2a6ea0', '#123252', clamp(tx * 0.5 + ty * 0.8, 0, 1));
    const rip = Math.sin(tx * 22) * Math.sin(ty * 16);
    if (rip > 0.82) b = mix(b, K.cyanLt, 0.5);
    return b;
  });
  ell(put, S * 0.42, S * 0.54, S * 0.07, S * 0.03, () => '#bfe8ff');
  shard(put, S * 0.2, S * 0.44, S * 0.04, S * 0.2, -0.2, GEMS[1]);
  shard(put, S * 0.82, S * 0.5, S * 0.035, S * 0.16, 0.22, GEMS[2]);
  sparkle(put, S * 0.62, S * 0.62, K.cyanLt);
}

// 6 · GEM VEIN WALL — rock chunk shot through with ore veins.
function drawVein(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  ell(put, S * 0.5, S * 0.58, S * 0.36, S * 0.32, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
  [[0.3, 0.4, 0.62, 0.72, K.pink], [0.42, 0.32, 0.7, 0.5, K.cyan], [0.28, 0.62, 0.56, 0.84, K.amber]].forEach(([x1, y1, x2, y2, c]) => {
    stroke(put, S * x1, S * y1, S * x2, S * y2, 3, () => c);
    stroke(put, S * x1, S * y1, S * x2, S * y2, 1, () => mix(c, '#ffffff', 0.5));
  });
  [[0.36, 0.5], [0.6, 0.62], [0.52, 0.38]].forEach(([x, y]) => { put(Math.round(S * x), Math.round(S * y), '#ffffff'); });
}

// 7 · MINE CART — abandoned, heaped with raw gems.
function drawCart(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  // rails
  stroke(put, S * 0.1, S * 0.88, S * 0.9, S * 0.84, 2, () => K.rockDkk);
  stroke(put, S * 0.1, S * 0.94, S * 0.9, S * 0.9, 2, () => K.rockDkk);
  // cart box
  plate(put, S * 0.28, S * 0.5, S * 0.72, S * 0.76, '#6a5140', '#8a6e58', '#3a2c20');
  stroke(put, S * 0.28, S * 0.52, S * 0.72, S * 0.52, 2, () => '#8a6e58');
  [0.34, 0.5, 0.66].forEach(x => stroke(put, S * x, S * 0.5, S * x, S * 0.76, 1, () => '#3a2c20'));
  // wheels
  [0.36, 0.64].forEach(x => { ell(put, S * x, S * 0.8, S * 0.055, S * 0.055, (tx, ty) => mix('#555a66', '#22242c', ty)); bolt(put, S * x, S * 0.8, S * 0.015, '#9aa2b0', '#555a66'); });
  // gem heap
  [[0.38, 0.46, 0], [0.5, 0.4, 1], [0.62, 0.47, 2], [0.45, 0.5, 3], [0.57, 0.52, 4]].forEach(([x, y, g]) => shard(put, S * x, S * y + S * 0.06, S * 0.035, S * 0.12, (x - 0.5) * 0.6, GEMS[g]));
  sparkle(put, S * 0.5, S * 0.32, '#ffffff');
}

// 8 · CRYSTAL ARCH — a gateway grown from gems.
function drawArch(put, S) {
  shadow(put, S, S * 0.5, S * 0.36);
  for (let a = 0; a <= Math.PI; a += 0.02) {
    const x = S * 0.5 - Math.cos(a) * S * 0.3, y = S * 0.84 - Math.sin(a) * S * 0.56;
    const w = S * (0.05 + 0.015 * Math.sin(a * 7));
    row(put, Math.round(y), x - w, x + w, (tx) => mix(K.purpleLt, K.purpleDk, clamp(tx * 1.3, 0, 1)));
  }
  [[0.2, 0.84], [0.8, 0.84]].forEach(([x, y]) => rockBase(put, S * x, S * y, S * 0.11, S * 0.05));
  shard(put, S * 0.5, S * 0.3, S * 0.03, S * 0.14, 0, GEMS[0]);
  shard(put, S * 0.32, S * 0.44, S * 0.025, S * 0.1, -0.25, GEMS[1]);
  shard(put, S * 0.68, S * 0.44, S * 0.025, S * 0.1, 0.25, GEMS[1]);
  sparkle(put, S * 0.5, S * 0.12, K.purpleLt);
}

// 9 · OPEN GEODE — split boulder, sparkling hollow.
function drawGeode(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  ell(put, S * 0.5, S * 0.6, S * 0.34, S * 0.28, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.7 + ty * 0.7, 0, 1)));
  ell(put, S * 0.5, S * 0.6, S * 0.25, S * 0.2, (tx, ty) => mix(K.voidDk, K.void, clamp(1 - (Math.abs(tx - 0.5) + Math.abs(ty - 0.5)), 0, 1)));
  for (let a = 0; a < 6.28; a += 0.5) {
    const x = S * 0.5 + Math.cos(a) * S * 0.19, y = S * 0.6 + Math.sin(a) * S * 0.15;
    shard(put, x, y + S * 0.05, S * 0.022, S * 0.08, Math.cos(a) * 0.3, GEMS[Math.floor((a * 2) % 5)]);
  }
  sparkle(put, S * 0.5, S * 0.58, '#ffffff');
}

// 10 · CRYSTAL FLOWERS — a bed of tiny gem blooms.
function drawFlowers(put, S) {
  ell(put, S * 0.5, S * 0.72, S * 0.36, S * 0.14, (tx, ty) => mix(K.rock, K.rockDkk, ty));
  [[0.3, 0.6, 0], [0.5, 0.52, 1], [0.68, 0.62, 2], [0.4, 0.72, 3], [0.6, 0.74, 4], [0.22, 0.74, 1], [0.78, 0.72, 0]].forEach(([x, y, g]) => {
    const [c, lt] = GEMS[g];
    stroke(put, S * x, S * y, S * x, S * y + S * 0.09, 1, () => K.greenDk);
    for (let a = 0; a < 6.28; a += 1.05) put(Math.round(S * x + Math.cos(a) * 2.4), Math.round(S * y + Math.sin(a) * 2.4), c);
    put(Math.round(S * x), Math.round(S * y), lt);
  });
  sparkle(put, S * 0.5, S * 0.42, K.pinkLt);
}

// 11 · LUMINOUS MOSS — glowing moss shelf on rock.
function drawMoss(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  ell(put, S * 0.5, S * 0.62, S * 0.32, S * 0.26, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
  ell(put, S * 0.46, S * 0.44, S * 0.26, S * 0.12, (tx, ty) => {
    const n = Math.sin(tx * 30) * Math.sin(ty * 24);
    return mix(n > 0.3 ? K.greenLt : K.green, K.greenDk, clamp(ty * 1.1, 0, 1));
  });
  [[0.3, 0.4], [0.5, 0.36], [0.62, 0.44], [0.4, 0.48]].forEach(([x, y]) => put(Math.round(S * x), Math.round(S * y), '#ffffff'));
  sparkle(put, S * 0.66, S * 0.3, K.greenLt);
}

// 12 · CHANDELIER STALACTITE — ceiling gem cluster (hangs).
function drawChandelier(put, S) {
  row(put, Math.round(S * 0.06), S * 0.14, S * 0.86, () => K.rockDkk);
  row(put, Math.round(S * 0.08), S * 0.1, S * 0.9, () => K.rockDk);
  const down = (cx, topY, w, h, cols) => {
    const [c, lt, dk] = cols;
    for (let y = 0; y < h; y++) {
      const t = y / h, ww = w * (1 - t * 0.9);
      row(put, Math.round(topY + y), cx - ww, cx + ww, (tx) => { let b = mix(lt, c, clamp(t * 0.9, 0, 1)); if (tx > 0.7) b = mix(b, dk, 0.6); return b; });
    }
    put(Math.round(cx), Math.round(topY + h), '#ffffff');
  };
  down(S * 0.5, S * 0.08, S * 0.09, S * 0.5, GEMS[2]);
  down(S * 0.34, S * 0.08, S * 0.06, S * 0.34, GEMS[0]);
  down(S * 0.66, S * 0.08, S * 0.06, S * 0.36, GEMS[1]);
  down(S * 0.22, S * 0.08, S * 0.04, S * 0.2, GEMS[1]);
  down(S * 0.78, S * 0.08, S * 0.04, S * 0.22, GEMS[0]);
  sparkle(put, S * 0.5, S * 0.68, K.purpleLt); sparkle(put, S * 0.3, S * 0.5, K.pinkLt);
}

// 13 · GEM PEDESTAL — carved stand w/ floating prize gem.
function drawPedestal(put, S) {
  shadow(put, S, S * 0.5, S * 0.24);
  plate(put, S * 0.34, S * 0.82, S * 0.66, S * 0.9, K.rockLt, '#8a80a0', K.rockDkk);
  plate(put, S * 0.42, S * 0.56, S * 0.58, S * 0.82, K.rock, K.rockLt, K.rockDkk);
  plate(put, S * 0.36, S * 0.5, S * 0.64, S * 0.58, K.rockLt, '#8a80a0', K.rockDkk);
  // floating gem (diamond)
  const gy = S * 0.3;
  for (let y = -10; y <= 12; y++) {
    const t = Math.abs(y) / (y < 0 ? 10 : 12), w = S * 0.085 * (1 - t);
    row(put, Math.round(gy + y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(K.pinkLt, tx > 0.6 ? K.pinkDk : K.pink, clamp(tx + t * 0.3, 0, 1)));
  }
  put(Math.round(S * 0.47), Math.round(gy - 4), '#ffffff');
  // glow motes under it
  [[0.44, 0.46], [0.56, 0.44], [0.5, 0.49]].forEach(([x, y]) => put(Math.round(S * x), Math.round(S * y), K.pinkLt));
  sparkle(put, S * 0.62, S * 0.2, '#ffffff');
}

// 14 · ROCK RUBBLE — collapsed boulder pile.
function drawRubble(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  [[0.4, 0.7, 0.16, 0.12], [0.62, 0.72, 0.13, 0.1], [0.5, 0.56, 0.12, 0.1], [0.28, 0.76, 0.09, 0.07], [0.74, 0.78, 0.07, 0.06]].forEach(([x, y, rx, ry]) => ell(put, S * x, S * y, S * rx, S * ry, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.7 + ty * 0.7, 0, 1))));
  shard(put, S * 0.56, S * 0.56, S * 0.03, S * 0.1, 0.2, GEMS[3]);
  put(Math.round(S * 0.42), Math.round(S * 0.64), K.amber);
}

// 15 · PRISM LIGHT SHAFT — a beam splitting into colors.
function drawLightShaft(put, S) {
  // beam from top-left
  stroke(put, S * 0.2, S * 0.04, S * 0.5, S * 0.6, 4, () => '#f4f0da');
  stroke(put, S * 0.2, S * 0.04, S * 0.5, S * 0.6, 1, () => '#ffffff');
  rockBase(put, S * 0.5, S * 0.82, S * 0.2, S * 0.07);
  shard(put, S * 0.5, S * 0.84, S * 0.07, S * 0.3, 0.05, GEMS[1]);
  // split rainbow beams out
  [[0.8, 0.3, K.pink], [0.86, 0.5, K.amber], [0.84, 0.72, K.green]].forEach(([x, y, c]) => { stroke(put, S * 0.52, S * 0.58, S * x, S * y, 2, () => c); });
  sparkle(put, S * 0.52, S * 0.56, '#ffffff');
}

// 16 · LANTERN POST — old miners' lantern, still burning.
function drawLantern(put, S) {
  shadow(put, S, S * 0.5, S * 0.18);
  stroke(put, S * 0.46, S * 0.24, S * 0.46, S * 0.88, 3, () => '#6a5140');
  stroke(put, S * 0.46, S * 0.26, S * 0.66, S * 0.3, 2, () => '#6a5140');
  // lantern body
  plate(put, S * 0.6, S * 0.32, S * 0.72, S * 0.48, '#555a66', '#9aa2b0', '#22242c');
  ell(put, S * 0.66, S * 0.4, S * 0.04, S * 0.06, () => K.amberLt);
  put(Math.round(S * 0.66), Math.round(S * 0.4), '#ffffff');
  dome(put, S * 0.66, S * 0.31, S * 0.05, S * 0.035, '#555a66', '#9aa2b0', '#22242c');
  // glow halo dots
  for (let a = 0; a < 6.28; a += 0.9) put(Math.round(S * 0.66 + Math.cos(a) * S * 0.09), Math.round(S * 0.4 + Math.sin(a) * S * 0.09), K.amber);
  rockBase(put, S * 0.47, S * 0.88, S * 0.1, S * 0.045);
}

// 17 · FOSSIL WALL — ancient spiral in the rock.
function drawFossil(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  ell(put, S * 0.5, S * 0.58, S * 0.35, S * 0.3, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
  for (let a = 0; a < 12.2; a += 0.05) {
    const r = S * 0.02 + a * S * 0.014;
    put(Math.round(S * 0.5 + Math.cos(a) * r), Math.round(S * 0.56 + Math.sin(a) * r * 0.8), '#c8bfa8');
  }
  for (let a = 0; a < 12.2; a += 0.6) {
    const r = S * 0.02 + a * S * 0.014;
    stroke(put, S * 0.5 + Math.cos(a) * r, S * 0.56 + Math.sin(a) * r * 0.8, S * 0.5 + Math.cos(a) * (r + S * 0.03), S * 0.56 + Math.sin(a) * (r + S * 0.03) * 0.8, 1, () => '#a89e88');
  }
  put(Math.round(S * 0.3), Math.round(S * 0.42), K.cyan);
}

// 18 · SINGING CRYSTALS — chime cluster with sound rings.
function drawSinging(put, S) {
  shadow(put, S, S * 0.5, S * 0.26);
  rockBase(put, S * 0.5, S * 0.84, S * 0.22, S * 0.07);
  shard(put, S * 0.42, S * 0.86, S * 0.045, S * 0.34, -0.08, GEMS[1]);
  shard(put, S * 0.56, S * 0.86, S * 0.055, S * 0.42, 0.06, GEMS[1]);
  shard(put, S * 0.66, S * 0.86, S * 0.035, S * 0.24, 0.2, GEMS[1]);
  // sound rings
  [0.16, 0.24, 0.32].forEach((r, i) => {
    for (let a = -1.1; a < 1.1; a += 0.05) put(Math.round(S * (0.56 + Math.cos(a - 1.57) * r)), Math.round(S * (0.42 + Math.sin(a - 1.57) * r * 0.8)), i === 2 ? K.cyanDk : K.cyanLt);
  });
  sparkle(put, S * 0.56, S * 0.38, '#ffffff');
}

// 19 · CRYSTAL BRIDGE CHUNK — grown walkway segment.
function drawBridge(put, S) {
  shadow(put, S, S * 0.5, S * 0.36);
  for (let x = S * 0.1; x < S * 0.9; x++) {
    const t = (x - S * 0.1) / (S * 0.8);
    const y = S * 0.6 - Math.sin(t * Math.PI) * S * 0.1;
    row(put, Math.round(y), x, x + 1, () => mix(K.purpleLt, K.purple, t));
    for (let d = 1; d < S * 0.08; d++) put(Math.round(x), Math.round(y + d), mix(K.purple, K.purpleDk, d / (S * 0.08)));
  }
  shard(put, S * 0.18, S * 0.62, S * 0.04, S * 0.16, -0.1, GEMS[2]);
  shard(put, S * 0.82, S * 0.62, S * 0.04, S * 0.16, 0.1, GEMS[2]);
  [[0.35, 0.48], [0.5, 0.44], [0.65, 0.48]].forEach(([x, y]) => shard(put, S * x, S * y + S * 0.05, S * 0.018, S * 0.06, 0, GEMS[0]));
  rockBase(put, S * 0.14, S * 0.78, S * 0.1, S * 0.05); rockBase(put, S * 0.86, S * 0.78, S * 0.1, S * 0.05);
  sparkle(put, S * 0.5, S * 0.36, K.purpleLt);
}

// 20 · VOID FISSURE — dark crack seeded with voidgems (boss-arena flavor).
function drawFissure(put, S) {
  ell(put, S * 0.5, S * 0.6, S * 0.4, S * 0.26, (tx, ty) => mix(K.rock, K.rockDkk, ty));
  // jagged crack
  let px = S * 0.18, py = S * 0.52;
  [[0.3, 0.6], [0.44, 0.54], [0.56, 0.64], [0.7, 0.58], [0.84, 0.66]].forEach(([x, y]) => {
    stroke(put, px, py, S * x, S * y, 5, () => K.voidDk);
    stroke(put, px, py, S * x, S * y, 2, () => K.void);
    px = S * x; py = S * y;
  });
  shard(put, S * 0.36, S * 0.56, S * 0.03, S * 0.12, -0.15, [K.void, K.voidLt, K.voidDk]);
  shard(put, S * 0.62, S * 0.62, S * 0.035, S * 0.14, 0.12, [K.void, K.voidLt, K.voidDk]);
  put(Math.round(S * 0.36), Math.round(S * 0.44), K.pink);
  put(Math.round(S * 0.62), Math.round(S * 0.48), K.pink);
  sparkle(put, S * 0.5, S * 0.4, K.voidLt);
}

const LIST = [
  { n: 1, name: 'GEM CLUSTER', role: 'centerpiece', draw: drawCluster },
  { n: 2, name: 'CRYSTAL PILLAR', role: 'floor-to-ceiling', draw: drawPillar },
  { n: 3, name: 'GLOW MUSHROOMS', role: 'light source', draw: drawShrooms },
  { n: 4, name: 'STALAGMITES', role: 'rock spikes', draw: drawStalagmites },
  { n: 5, name: 'GLOWING POOL', role: 'cave water', draw: drawPool },
  { n: 6, name: 'GEM VEIN WALL', role: 'ore rock', draw: drawVein },
  { n: 7, name: 'MINE CART', role: 'abandoned dig', draw: drawCart },
  { n: 8, name: 'CRYSTAL ARCH', role: 'gateway', draw: drawArch },
  { n: 9, name: 'OPEN GEODE', role: 'split boulder', draw: drawGeode },
  { n: 10, name: 'CRYSTAL FLOWERS', role: 'gem blooms', draw: drawFlowers },
  { n: 11, name: 'GLOW MOSS', role: 'luminous shelf', draw: drawMoss },
  { n: 12, name: 'CHANDELIER', role: 'ceiling cluster', draw: drawChandelier },
  { n: 13, name: 'GEM PEDESTAL', role: 'floating prize', draw: drawPedestal },
  { n: 14, name: 'ROCK RUBBLE', role: 'cave-in pile', draw: drawRubble },
  { n: 15, name: 'PRISM SHAFT', role: 'split light beam', draw: drawLightShaft },
  { n: 16, name: 'LANTERN POST', role: 'miners were here', draw: drawLantern },
  { n: 17, name: 'FOSSIL WALL', role: 'ancient spiral', draw: drawFossil },
  { n: 18, name: 'SINGING CRYSTALS', role: 'chime cluster', draw: drawSinging },
  { n: 19, name: 'CRYSTAL BRIDGE', role: 'grown walkway', draw: drawBridge },
  { n: 20, name: 'VOID FISSURE', role: 'boss-arena crack', draw: drawFissure },
];

renderSheet({ list: LIST, out: process.argv[2] || 'crystal_decor_options.png', title: 'CRYSTAL CAVERNS — DECORATION CANDIDATES (use at will or pick favorites)', S: 160 });
