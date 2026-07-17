// artdev/sugar/render_sugar_mobs.js — 20 numbered SUGAR WORLD mob
// candidates, one PNG grid. Candy gone feral.
'use strict';
const KIT = require('./sugar_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, stripes, sprinkles, drip, gloss } = KIT;

// 1 · GUMMY BEAR — swarm chomper, translucent
function drawGummy(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  const c = G.red, cDk = G.redDk, cLt = G.redLt;
  // squat body
  ell(put, cx, S * 0.6, S * 0.11, S * 0.13, (tx, ty) => mix(cLt, c, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.1, S * 0.66, S * 0.035, S * 0.05, (tx, ty) => mix(c, cDk, tx)); ell(put, cx + s * S * 0.065, S * 0.72, S * 0.035, S * 0.04, (tx, ty) => mix(c, cDk, ty)); });
  // head + ears
  ell(put, cx, S * 0.42, S * 0.085, S * 0.08, (tx, ty) => mix(cLt, c, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.065, S * 0.35, S * 0.028, S * 0.028, (tx, ty) => mix(c, cDk, tx + ty * 0.3)));
  // gummy sheen
  gloss(put, cx - S * 0.02, S * 0.4, S * 0.08);
  // black bead eyes + BIG chomp mouth
  optic(put, cx - S * 0.03, S * 0.41, S * 0.009, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.03, S * 0.41, S * 0.009, G.oil, G.oil, '#ffffff');
  ell(put, cx, S * 0.46, S * 0.035, S * 0.025, () => cDk);
  [[-0.02], [0.012]].forEach(([dx]) => put(Math.round(cx + dx * S), Math.round(S * 0.445), G.white)); // teefs
}
// 2 · GINGERDEAD MAN — runner w/ candy-cane shiv
function drawGinger(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // gingerbread body — running pose
  const g = G.ginger, gDk = G.gingerDk, gLt = G.gingerLt;
  ell(put, cx, S * 0.52, S * 0.085, S * 0.1, (tx, ty) => mix(gLt, g, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  // running legs
  stroke(put, cx - S * 0.03, S * 0.6, cx - S * 0.12, S * 0.72, S * 0.032, () => g);
  stroke(put, cx + S * 0.03, S * 0.6, cx + S * 0.1, S * 0.78, S * 0.032, () => mix(g, gDk, 0.3));
  // arms — one w/ candy-cane shiv
  stroke(put, cx - S * 0.07, S * 0.48, cx - S * 0.16, S * 0.42, S * 0.028, () => g);
  stroke(put, cx + S * 0.07, S * 0.48, cx + S * 0.15, S * 0.38, S * 0.028, () => g);
  stroke(put, cx + S * 0.16, S * 0.37, cx + S * 0.22, S * 0.26, 2.6, stripes(G.red, G.white, 9));
  put(Math.round(cx + S * 0.225), Math.round(S * 0.25), G.white); // sharpened tip
  // head — icing face gone wrong
  ell(put, cx, S * 0.36, S * 0.07, S * 0.065, (tx, ty) => mix(gLt, g, clamp(tx + ty * 0.3, 0, 1)));
  // icing squiggle brow
  for (let x = -0.05; x <= 0.05; x += 0.01) put(Math.round(cx + x * S), Math.round(S * 0.31 + Math.sin(x * 90) * 1.6), G.cream);
  optic(put, cx - S * 0.025, S * 0.35, S * 0.009, G.oil, G.oil, '#ffffff');
  put(Math.round(cx + S * 0.025), Math.round(S * 0.35), G.oil); // one eye chipped off
  put(Math.round(cx + S * 0.03), Math.round(S * 0.345), gDk);
  // cracked grin
  stroke(put, cx - S * 0.03, S * 0.39, cx + S * 0.03, S * 0.385, 1.2, () => gDk);
  // gumdrop buttons
  [0.46, 0.52, 0.58].forEach((y, i) => put(Math.round(cx), Math.round(S * y), [G.red, G.lime, G.blue][i]));
}
// 3 · CANDY LANCER — cane-pole charger
function drawLancer(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // peppermint knight body
  ell(put, cx, S * 0.52, S * 0.09, S * 0.11, stripes(G.red, G.white, 7));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.8, S * 0.028, () => (s < 0 ? G.red : G.redDk)));
  // couched candy-cane lance
  stroke(put, cx - S * 0.02, S * 0.5, cx - S * 0.3, S * 0.56, 3, stripes(G.red, G.white, 14));
  for (let a = 0; a < 2.6; a += 0.25) put(Math.round(cx + S * 0.02 + Math.cos(a) * S * 0.035), Math.round(S * 0.47 - Math.sin(a) * S * 0.035), (a * 4 | 0) % 2 ? G.red : G.white); // crook
  put(Math.round(cx - S * 0.31), Math.round(S * 0.565), G.white); // tip
  // round helm w/ mint visor
  dome(put, cx, S * 0.37, S * 0.06, S * 0.06, G.mint, G.mintLt, G.mintDk);
  row(put, Math.round(S * 0.375), cx - S * 0.045, cx + S * 0.045, () => G.oil);
  gloss(put, cx, S * 0.35, S * 0.05);
}
// 4 · CHOCOLATE GOLEM — tank, breaks into squares
function drawChocGolem(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // blocky chocolate-bar body: segments
  for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 2; rx++) {
    const x0 = cx - S * 0.11 + rx * S * 0.115, y0 = S * 0.4 + ry * S * 0.115;
    plate(put, x0, y0, x0 + S * 0.1, y0 + S * 0.1, G.choc, G.chocLt, G.chocDk);
  }
  // arms — big chunk fists
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, S * 0.46, cx + s * S * 0.2, S * 0.6, S * 0.04, () => G.choc);
    plate(put, cx + s * S * 0.2 - S * 0.045, S * 0.58, cx + s * S * 0.2 + S * 0.045, S * 0.68, G.chocLt, '#b87a50', G.chocDk);
  });
  // legs
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.06 - S * 0.035, S * 0.74, cx + s * S * 0.06 + S * 0.035, S * 0.85, G.choc, G.chocLt, G.chocDk));
  // head — square w/ molten caramel eyes
  plate(put, cx - S * 0.05, S * 0.28, cx + S * 0.05, S * 0.38, G.choc, G.chocLt, G.chocDk);
  optic(put, cx - S * 0.022, S * 0.33, S * 0.01, G.chocDk, G.caramel, G.caramelLt);
  optic(put, cx + S * 0.022, S * 0.33, S * 0.01, G.chocDk, G.caramel, G.caramelLt);
  // one corner already bitten
  for (let i = 0; i < 4; i++) row(put, Math.round(S * 0.4 + i), cx + S * 0.06 + i, cx + S * 0.115, () => null);
  for (let i = 0; i < 5; i++) for (let a = 0; a < 3; a++) put(Math.round(cx + S * 0.07 + i * 2 + a), Math.round(S * 0.41 + i * 1.4), i % 2 ? G.chocDk : '#2a1408');
}
// 5 · JAWBREAKER — rolling armored ball
function drawJawbreaker(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // layered ball — bright bands, gentle shading only at the lower-right
  [[0.16, G.grape, G.grapeLt], [0.13, G.white, G.creamDk], [0.1, G.red, G.redLt], [0.07, G.yellow, G.yellowLt], [0.04, G.mint, G.mintLt]].forEach(([r, c, cLt]) => {
    ell(put, cx, S * 0.56, S * r, S * r, (tx, ty) => {
      let b = mix(cLt, c, clamp(tx * 0.9 + ty * 0.6, 0, 1));
      if (tx + ty > 1.25) b = mix(b, '#3a2a44', 0.3);
      return b;
    });
  });
  gloss(put, cx, S * 0.5, S * 0.14);
  // angry crack eyes
  stroke(put, cx - S * 0.06, S * 0.5, cx - S * 0.02, S * 0.53, 1.6, () => G.oil);
  stroke(put, cx + S * 0.06, S * 0.5, cx + S * 0.02, S * 0.53, 1.6, () => G.oil);
  // chip crack
  stroke(put, cx + S * 0.1, S * 0.44, cx + S * 0.14, S * 0.5, 1.2, () => G.oil);
  // motion dust
  [[-0.24, 0.66], [-0.28, 0.6]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.012, (tx) => mix(G.creamDk, G.cream, tx)));
}
// 6 · LOLLI TWIRLER — spinning zoner
function drawLolli(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // stick legs walking
  stroke(put, cx, S * 0.52, cx, S * 0.82, 2.6, () => G.white);
  stroke(put, cx + 1, S * 0.52, cx + 1, S * 0.82, 1, () => G.creamDk);
  // swirl head — big spiral lollipop
  ell(put, cx, S * 0.38, S * 0.13, S * 0.13, (tx, ty) => mix(G.pinkLt, G.pink, ty));
  for (let a = 0; a < 14; a += 0.05) {
    const r = S * 0.008 + a * S * 0.0088;
    put(Math.round(cx + Math.cos(a) * r), Math.round(S * 0.38 + Math.sin(a) * r), (a * 2 | 0) % 2 ? G.red : G.white);
  }
  gloss(put, cx, S * 0.32, S * 0.11);
  // no arms (Red) — just spin lines off the swirl
  [[-0.26, 0.36], [0.26, 0.44], [-0.22, 0.48]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 1.2, S * dy, 1.2, () => G.pinkLt));
  // face on the swirl
  optic(put, cx - S * 0.035, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.035, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
}
// 7 · GUMDROP — bouncy hopper, splits
function drawGumdrop(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // dome drop w/ sugar crust
  for (let y = S * 0.4; y < S * 0.72; y++) {
    const t = (y - S * 0.4) / (S * 0.32);
    const w = S * 0.14 * Math.sqrt(Math.max(0.05, t));
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(G.limeLt, G.lime, clamp(tx * 1.1 + (1 - t) * 0.2, 0, 1));
      if (tx > 0.8) b = mix(b, G.limeDk, 0.5);
      return b;
    });
  }
  // sugar crystals
  sprinkles(put, cx, S * 0.56, S * 0.1, S * 0.12, 10, 3);
  for (let i = 0; i < 8; i++) put(Math.round(cx - S * 0.1 + i * S * 0.028), Math.round(S * 0.44 + (i % 3) * 3), G.white);
  // face
  optic(put, cx - S * 0.04, S * 0.54, S * 0.01, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.04, S * 0.54, S * 0.01, G.oil, G.oil, '#ffffff');
  ell(put, cx, S * 0.6, S * 0.025, S * 0.018, () => G.limeDk);
  // bounce squash lines
  [[-0.18, 0.74], [0.18, 0.74]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 1.3, S * (dy + 0.02), 1.2, () => G.creamDk));
  // mini-drop budding off
  ell(put, cx + S * 0.17, S * 0.68, S * 0.04, S * 0.045, (tx, ty) => mix(G.limeLt, G.lime, tx + ty * 0.3));
}
// 8 · SODA SPRITE — fizzy flyer, spray cone
function drawSoda(put, S) {
  const cx = S * 0.5;
  // bottle-cap body hovering
  ell(put, cx, S * 0.52, S * 0.08, S * 0.05, (tx, ty) => mix('#e8e8f0', '#8a8aa0', clamp(tx + ty * 0.4, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.085), Math.round(S * 0.52 + Math.sin(a) * S * 0.055), '#6a6a80'); // crimped edge
  // fizz body under
  ell(put, cx, S * 0.6, S * 0.05, S * 0.06, (tx, ty) => mix(G.soda, G.blue, clamp(tx + ty * 0.3, 0, 1)));
  // face on cap
  optic(put, cx - S * 0.025, S * 0.51, S * 0.009, G.oil, G.blue, G.blueLt);
  optic(put, cx + S * 0.025, S * 0.51, S * 0.009, G.oil, G.blue, G.blueLt);
  // spray cone (telegraph vibes)
  for (let t = 0; t < 1; t += 0.1) {
    const w = t * S * 0.09;
    [[-1], [0], [1]].forEach(([s]) => put(Math.round(cx - S * 0.09 - t * S * 0.16), Math.round(S * 0.56 + s * w), G.soda));
  }
  // bubbles everywhere
  [[0.1, 0.4], [0.16, 0.34], [0.05, 0.3], [-0.08, 0.36], [0.2, 0.44]].forEach(([dx, dy], i) => {
    ell(put, cx + dx * S, S * dy, S * (0.012 + (i % 2) * 0.006), S * (0.012 + (i % 2) * 0.006), (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? G.blueLt : null));
  });
}
// 9 · ROCK CANDY CRAB — armored, shard volley
function drawCrab(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // crystal carapace
  ell(put, cx, S * 0.56, S * 0.13, S * 0.09, (tx, ty) => mix(G.grapeLt, G.grape, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // crystal facets sticking up
  [[-0.08, 0.44, 0.05], [0, 0.4, 0.06], [0.08, 0.44, 0.045]].forEach(([dx, dy, r]) => {
    for (let y = 0; y < S * r * 2; y++) { const t = y / (S * r * 2); row(put, Math.round(S * dy + y), cx + dx * S - S * r * t, cx + dx * S + S * r * t, (tx) => mix(G.grapeLt, G.grapeDk, tx + (1 - t) * 0.3)); }
  });
  put(Math.round(cx), Math.round(S * 0.41)), put(Math.round(cx), Math.round(S * 0.41), G.white);
  // legs
  for (let i = 0; i < 3; i++) [-1, 1].forEach(s => stroke(put, cx + s * S * 0.1, S * 0.6 + i * 2, cx + s * S * (0.18 + i * 0.02), S * (0.66 + i * 0.03), 1.6, () => G.grapeDk));
  // claws — crystal chunks
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, S * 0.52, cx + s * S * 0.2, S * 0.46, S * 0.02, () => G.grape);
    ell(put, cx + s * S * 0.22, S * 0.45, S * 0.035, S * 0.028, (tx, ty) => mix(G.grapeLt, G.grapeDk, tx + ty * 0.4));
  });
  optic(put, cx - S * 0.03, S * 0.52, S * 0.009, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.03, S * 0.52, S * 0.009, G.oil, G.oil, '#ffffff');
}
// 10 · LICORICE WHIP — lasher
function drawLico(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // twisted licorice body (rope twist)
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx + Math.sin(t * 3.5) * S * 0.05, py = S * 0.76 - t * S * 0.4;
    ell(put, px, py, S * 0.035, S * 0.028, (tx, ty) => {
      const tw = ((t * 16 + tx * 2) | 0) % 2;
      return mix(tw ? G.lico : G.licoLt, G.licoDk, clamp(tx + ty * 0.3, 0, 1));
    });
  }
  // head — cobra-hood licorice
  ell(put, cx + S * 0.02, S * 0.32, S * 0.055, S * 0.05, (tx, ty) => mix(G.licoLt, G.licoDk, clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx, S * 0.31, S * 0.009, G.oil, G.red, G.redLt);
  optic(put, cx + S * 0.04, S * 0.31, S * 0.009, G.oil, G.red, G.redLt);
  // whip arms lashing
  [[-1, 0.5], [1, 0.56]].forEach(([s, y0]) => {
    let px = cx + s * S * 0.04, py = S * y0;
    for (let t = 0; t < 1; t += 0.06) {
      const nx = cx + s * S * (0.04 + t * 0.26), ny = S * y0 + Math.sin(t * 7 + s) * S * 0.05 * (1 - t * 0.4);
      stroke(put, px, py, nx, ny, 1.8 - t, () => (t * 8 | 0) % 2 ? G.lico : G.licoLt);
      px = nx; py = ny;
    }
    put(Math.round(px), Math.round(py), G.red); // whip tip
  });
}
// 11 · COTTON DRIFT — sticky cloud, slows
function drawCotton(put, S) {
  const cx = S * 0.5;
  // cloud puffs
  [[0, 0.5, 0.11], [-0.1, 0.54, 0.08], [0.1, 0.54, 0.085], [-0.05, 0.44, 0.08], [0.06, 0.45, 0.075]].forEach(([dx, dy, r]) => {
    ell(put, cx + dx * S, S * dy, S * r, S * r * 0.85, (tx, ty) => mix(G.pinkLt, G.pink, clamp(tx * 0.7 + ty * 0.5, 0, 1)));
  });
  // wispy edges
  for (let a = 0; a < 6.28; a += 0.5) {
    const x = cx + Math.cos(a) * S * 0.14, y = S * 0.5 + Math.sin(a) * S * 0.1;
    stroke(put, x, y, x + Math.cos(a) * S * 0.04, y + Math.sin(a) * S * 0.03, 1.2, () => G.pinkLt);
  }
  // sleepy mean face
  stroke(put, cx - S * 0.05, S * 0.48, cx - S * 0.015, S * 0.485, 1.4, () => G.pinkDk);
  stroke(put, cx + S * 0.015, S * 0.485, cx + S * 0.05, S * 0.48, 1.4, () => G.pinkDk);
  ell(put, cx, S * 0.53, S * 0.02, S * 0.014, () => G.pinkDk);
  // sticky strands dangling
  [[-0.08], [0], [0.09]].forEach(([dx], i) => {
    stroke(put, cx + dx * S, S * 0.6, cx + dx * S + Math.sin(i * 2) * 3, S * (0.68 + i * 0.02), 1.1, () => G.pinkLt);
    put(Math.round(cx + dx * S + Math.sin(i * 2) * 3), Math.round(S * (0.69 + i * 0.02)), G.pink);
  });
}
// 12 · MINT GUARDIAN — spinning shield wall
function drawMint(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // legs + body behind shield
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.66, cx + s * S * 0.05, S * 0.8, S * 0.026, () => G.mintDk));
  ell(put, cx, S * 0.5, S * 0.07, S * 0.1, (tx, ty) => mix(G.mint, G.mintDk, tx + ty * 0.3));
  // giant peppermint-wheel shield front
  ell(put, cx, S * 0.52, S * 0.135, S * 0.135, (tx, ty) => {
    const a = Math.atan2(ty - 0.5, tx - 0.5);
    return ((a * 4 / Math.PI + 8) | 0) % 2 ? G.red : G.white;
  });
  ell(put, cx, S * 0.52, S * 0.04, S * 0.04, (tx, ty) => mix(G.white, G.creamDk, ty));
  gloss(put, cx - S * 0.02, S * 0.45, S * 0.11);
  // eyes peeking over
  optic(put, cx - S * 0.03, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.03, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
  // spin lines
  [[-0.19, 0.42], [0.19, 0.62]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 1.25, S * dy, 1.2, () => G.redLt));
}
// 13 · SOUR IMP — debuffer, sour spit
function drawSour(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // crystal-crusted imp body
  ell(put, cx, S * 0.56, S * 0.08, S * 0.09, (tx, ty) => mix(G.limeLt, G.lime, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  sprinkles(put, cx, S * 0.56, S * 0.06, S * 0.07, 8, 7);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.07, S * 0.6, cx + s * S * 0.12, S * 0.7, S * 0.02, () => G.lime); stroke(put, cx + s * S * 0.04, S * 0.64, cx + s * S * 0.05, S * 0.76, S * 0.02, () => G.limeDk); });
  // big head, puckered face
  ell(put, cx, S * 0.4, S * 0.075, S * 0.07, (tx, ty) => mix(G.limeLt, G.lime, clamp(tx + ty * 0.3, 0, 1)));
  // squeezed-shut sour eyes
  stroke(put, cx - S * 0.045, S * 0.385, cx - S * 0.015, S * 0.38, 1.6, () => G.limeDk);
  stroke(put, cx + S * 0.015, S * 0.38, cx + S * 0.045, S * 0.385, 1.6, () => G.limeDk);
  // pucker mouth spitting
  ell(put, cx, S * 0.43, S * 0.014, S * 0.016, () => G.limeDk);
  [[-0.06, 0.44], [-0.1, 0.42], [-0.14, 0.44]].forEach(([dx, dy], i) => put(Math.round(cx + dx * S), Math.round(S * dy), i % 2 ? G.yellowLt : G.lime)); // spit arc
  // little horns
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.34, cx + s * S * 0.07, S * 0.3, 1.6, () => G.limeDk));
}
// 14 · MARSHMALLOW BRUTE — elite, splits into minis
function drawMallow(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // big soft cylinder body
  for (let y = S * 0.34; y < S * 0.74; y++) {
    const t = (y - S * 0.34) / (S * 0.4);
    const w = S * (0.14 + Math.sin(t * Math.PI) * 0.02);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#fffdf6', G.creamDk, clamp(tx * 1.15, 0, 1));
      if (tx > 0.85) b = mix(b, '#b09880', 0.4);
      return b;
    });
  }
  ell(put, cx, S * 0.34, S * 0.14, S * 0.04, (tx, ty) => mix('#fffdf6', G.creamDk, tx)); // top
  // toasted patch
  ell(put, cx + S * 0.08, S * 0.62, S * 0.05, S * 0.06, (tx, ty) => mix(G.caramel, G.chocDk, tx + ty * 0.3));
  // stubby arms
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.17, S * 0.52, S * 0.045, S * 0.06, (tx, ty) => mix('#fffdf6', G.creamDk, tx + ty * 0.3)));
  // squishy angry face
  optic(put, cx - S * 0.045, S * 0.46, S * 0.011, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.045, S * 0.46, S * 0.011, G.oil, G.oil, '#ffffff');
  stroke(put, cx - S * 0.06, S * 0.42, cx - S * 0.02, S * 0.435, 1.6, () => G.creamDk);
  stroke(put, cx + S * 0.02, S * 0.435, cx + S * 0.06, S * 0.42, 1.6, () => G.creamDk);
  ell(put, cx, S * 0.55, S * 0.04, S * 0.025, () => '#b09880');
  // mini mallow escaping
  ell(put, cx + S * 0.24, S * 0.76, S * 0.035, S * 0.04, (tx, ty) => mix('#fffdf6', G.creamDk, tx));
  put(Math.round(cx + S * 0.23), Math.round(S * 0.75), G.oil); put(Math.round(cx + S * 0.25), Math.round(S * 0.75), G.oil);
}
// 15 · TAFFY STRETCHER — grabber, pulls
function drawTaffy(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // stretchy twisted body
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx + Math.sin(t * 2.8) * S * 0.03, py = S * 0.74 - t * S * 0.34;
    const w = S * (0.05 + Math.sin(t * 9) * 0.012);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      const band = ((t * 10) | 0) % 2;
      return mix(band ? G.orange : G.orangeLt, G.orangeDk, clamp(tx + ty * 0.3, 0, 1));
    });
  }
  // head
  ell(put, cx, S * 0.36, S * 0.06, S * 0.055, (tx, ty) => mix(G.orangeLt, G.orange, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.022, S * 0.35, S * 0.009, G.oil, G.oil, '#ffffff');
  optic(put, cx + S * 0.022, S * 0.35, S * 0.009, G.oil, G.oil, '#ffffff');
  // STRETCHED grabber arm — long taffy pull
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + S * (0.05 + t * 0.26), py = S * (0.44 + Math.sin(t * 2.5) * 0.02);
    const w = S * (0.024 - t * 0.012);
    ell(put, px, py, w, w, (tx, ty) => mix(G.orangeLt, G.orangeDk, tx));
  }
  // grabby hand
  ell(put, cx + S * 0.32, S * 0.45, S * 0.03, S * 0.028, (tx, ty) => mix(G.orange, G.orangeDk, ty));
  [[0.34, 0.42], [0.35, 0.45], [0.34, 0.48]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), G.orangeDk));
  // stretch strain lines
  [[0.14, 0.4], [0.2, 0.49]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.03) * S, S * dy, 1, () => G.orangeLt));
}
// 16 · CUPCAKE MIMIC — ambusher
function drawCupcake(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // wrapper base
  for (let y = S * 0.56; y < S * 0.78; y++) {
    const t = (y - S * 0.56) / (S * 0.22);
    const w = S * (0.13 - t * 0.035);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(G.blueLt, G.blue, clamp(tx * 1.1, 0, 1));
      if (((tx * 12) | 0) % 2) b = mix(b, G.blueDk, 0.35); // pleats
      return b;
    });
  }
  // frosting swirl top — CLOSED, sitting flush on the wrapper (Red:
  // no gap; it's a mimic — looks innocent until it opens)
  dome(put, cx - S * 0.01, S * 0.48, S * 0.135, S * 0.11, G.pink, G.pinkLt, G.pinkDk);
  drip(put, cx - S * 0.13, cx + S * 0.12, S * 0.555, G.pink, G.pinkDk);
  sprinkles(put, cx - S * 0.01, S * 0.45, S * 0.09, S * 0.06, 9, 11);
  // just a sly seam line where the maw hides
  stroke(put, cx - S * 0.09, S * 0.565, cx + S * 0.08, S * 0.57, 1.2, () => G.pinkDk);
  // one fang tip barely peeking
  put(Math.round(cx + S * 0.03), Math.round(S * 0.575), G.white);
  // cherry eye on a stalk
  stroke(put, cx + S * 0.06, S * 0.36, cx + S * 0.09, S * 0.3, 1.6, () => G.pinkDk);
  ell(put, cx + S * 0.1, S * 0.28, S * 0.025, S * 0.025, (tx, ty) => mix(G.redLt, G.redDk, tx + ty * 0.4));
  put(Math.round(cx + S * 0.095), Math.round(S * 0.275), G.oil);
}
// 17 · CANDY CORN PACK — dart triangles
function drawCorn(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // three candy corns flying in formation
  [[0, 0.54, 1.15], [-0.17, 0.42, 0.95], [0.17, 0.44, 1]].forEach(([dx, dy, sc]) => {
    const px = cx + dx * S, py = S * dy;
    // triangle: white tip → orange → yellow base (pointing left = dart)
    for (let x = 0; x < S * 0.15 * sc; x++) {
      const t = x / (S * 0.15 * sc);
      const h = Math.max(1.2, S * 0.055 * sc * t);
      const c = t < 0.25 ? G.white : t < 0.65 ? G.orange : G.yellow;
      const cLt = t < 0.25 ? '#ffffff' : t < 0.65 ? G.orangeLt : G.yellowLt;
      for (let y = -h; y <= h; y++) put(Math.round(px - S * 0.075 * sc + x), Math.round(py + y), mix(cLt, c, clamp(Math.abs(y) / (h + 0.5) + 0.25, 0, 1)));
    }
    // angry eye
    put(Math.round(px + S * 0.02 * sc), Math.round(py - 1), G.oil);
    put(Math.round(px + S * 0.03 * sc), Math.round(py - 1), G.oil);
    // dart lines
    stroke(put, px + S * 0.1 * sc, py, px + S * 0.15 * sc, py, 1.2, () => G.creamDk);
  });
}
// 18 · SPRINKLE WASP — flyer, strafes
function drawWasp(put, S) {
  const cx = S * 0.5;
  // donut-hole body w/ sprinkle stripes
  ell(put, cx, S * 0.52, S * 0.08, S * 0.06, (tx, ty) => mix(G.choc, G.chocDk, clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.01, S * 0.5, S * 0.055, S * 0.035, (tx, ty) => mix(G.pink, G.pinkDk, ty)); // frosting saddle
  sprinkles(put, cx, S * 0.5, S * 0.05, S * 0.03, 6, 5);
  // head
  ell(put, cx - S * 0.1, S * 0.5, S * 0.035, S * 0.032, (tx, ty) => mix(G.chocLt, G.chocDk, tx + ty * 0.3));
  optic(put, cx - S * 0.11, S * 0.49, S * 0.01, G.oil, G.yellow, G.yellowLt);
  // stinger — candy corn point
  for (let x = 0; x < S * 0.06; x++) { const t = x / (S * 0.06); const h = S * 0.016 * (1 - t); for (let y = -h; y <= h; y++) put(Math.round(cx + S * 0.08 + x), Math.round(S * 0.54 + y), t > 0.6 ? G.white : G.orange); }
  // wafer wings
  [[-0.02, -1], [0.04, -1]].forEach(([dx, s]) => {
    ell(put, cx + dx * S, S * 0.42, S * 0.05, S * 0.022, (tx, ty) => mix('#f8e8c8', G.creamDk, clamp(tx + ty * 0.4, 0, 1)));
    stroke(put, cx + (dx - 0.03) * S, S * 0.42, cx + (dx + 0.03) * S, S * 0.42, 0.8, () => G.creamDk);
  });
  // buzz lines
  [[0.16, 0.4], [0.18, 0.46]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.05) * S, S * (dy - 0.01), 1, () => G.creamDk));
}
// 19 · CARAMEL SLIME — sticky zoner, slow pools
function drawCaramel(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // gooey mound mid-slosh
  for (let y = S * 0.46; y < S * 0.72; y++) {
    const t = (y - S * 0.46) / (S * 0.26);
    const w = S * (0.06 + t * 0.11 + Math.sin(t * 8) * 0.008);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(G.caramelLt, G.caramel, clamp(tx * 1.1 + (1 - t) * 0.15, 0, 1));
      if (tx > 0.8) b = mix(b, G.caramelDk, 0.5);
      return b;
    });
  }
  gloss(put, cx - S * 0.03, S * 0.5, S * 0.07);
  // drippy pseudopods
  [[-0.15, 0.66], [0.16, 0.62]].forEach(([dx, dy]) => {
    for (let t = 0; t < 1; t += 0.15) ell(put, cx + dx * S + t * S * 0.05 * Math.sign(dx), S * dy + t * S * 0.07, S * (0.03 - t * 0.018), S * (0.024 - t * 0.012), (tx, ty) => mix(G.caramel, G.caramelDk, tx));
  });
  // trailing pool
  ell(put, cx - S * 0.14, S * 0.76, S * 0.12, S * 0.028, (tx, ty) => mix(G.caramel, G.caramelDk, clamp(tx + ty, 0, 1)));
  // slow-drowning face
  optic(put, cx - S * 0.03, S * 0.54, S * 0.01, G.caramelDk, G.oil, '#ffffff');
  optic(put, cx + S * 0.035, S * 0.545, S * 0.01, G.caramelDk, G.oil, '#ffffff');
  stroke(put, cx - S * 0.01, S * 0.6, cx + S * 0.02, S * 0.605, 1.4, () => G.caramelDk);
}
// 20 · SUGAR FIEND — elite crazed addict
function drawFiend(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // gaunt jittering body — pale, sugar-dusted
  ell(put, cx, S * 0.52, S * 0.07, S * 0.11, (tx, ty) => mix('#e8e0f0', '#a89ab8', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.035, S * 0.62, cx + s * S * (0.05 + 0.01 * s), S * 0.8, S * 0.022, () => '#a89ab8');
    // twitchy arms clutching
    stroke(put, cx + s * S * 0.06, S * 0.46, cx + s * S * 0.13, S * 0.54, S * 0.02, () => '#c8bcd8');
  });
  // clutched candy hoard
  [[-0.1, 0.56, G.red], [-0.05, 0.58, G.blue], [0.06, 0.57, G.lime], [0.11, 0.55, G.yellow]].forEach(([dx, dy, c]) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.02, (tx, ty) => mix(c, mix(c, '#000000', 0.4), ty)));
  // wild head — huge eyes, sugar-crusted grin
  ell(put, cx, S * 0.36, S * 0.07, S * 0.07, (tx, ty) => mix('#f0eaf8', '#a89ab8', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.028, S * 0.35, S * 0.014, G.oil, G.pink, G.pinkLt);
  optic(put, cx + S * 0.028, S * 0.345, S * 0.016, G.oil, G.pink, G.pinkLt); // mismatched = crazed
  // manic grin
  for (let x = -0.04; x <= 0.04; x += 0.008) put(Math.round(cx + x * S), Math.round(S * 0.415 + Math.abs(Math.sin(x * 80)) * 1.2), G.oil);
  for (let x = -0.03; x <= 0.03; x += 0.012) put(Math.round(cx + x * S), Math.round(S * 0.41), G.white);
  // sugar dust cloud + jitter lines
  sprinkles(put, cx, S * 0.36, S * 0.1, S * 0.08, 6, 13);
  [[-0.13, 0.32], [0.13, 0.3]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 1.2, S * (dy - 0.02), 1, () => '#c8bcd8'));
}

const LIST = [
  { n: 1, name: 'GUMMY BEAR', role: 'swarm chomper', draw: drawGummy },
  { n: 2, name: 'GINGERDEAD MAN', role: 'runner + cane shiv', draw: drawGinger },
  { n: 3, name: 'CANDY LANCER', role: 'cane-lance charger', draw: drawLancer },
  { n: 4, name: 'CHOCOLATE GOLEM', role: 'tank, chunk fists', draw: drawChocGolem },
  { n: 5, name: 'JAWBREAKER', role: 'rolling armored ball', draw: drawJawbreaker },
  { n: 6, name: 'LOLLI TWIRLER', role: 'spinning zoner', draw: drawLolli },
  { n: 7, name: 'GUMDROP', role: 'bouncy hopper, splits', draw: drawGumdrop },
  { n: 8, name: 'SODA SPRITE', role: 'fizzy flyer, spray cone', draw: drawSoda },
  { n: 9, name: 'ROCK CANDY CRAB', role: 'armored shard volley', draw: drawCrab },
  { n: 10, name: 'LICORICE WHIP', role: 'lasher, whip lanes', draw: drawLico },
  { n: 11, name: 'COTTON DRIFT', role: 'sticky slow cloud', draw: drawCotton },
  { n: 12, name: 'MINT GUARDIAN', role: 'peppermint shield wall', draw: drawMint },
  { n: 13, name: 'SOUR IMP', role: 'debuff spit', draw: drawSour },
  { n: 14, name: 'MALLOW BRUTE', role: 'elite, splits to minis', draw: drawMallow },
  { n: 15, name: 'TAFFY STRETCHER', role: 'grabber, pulls', draw: drawTaffy },
  { n: 16, name: 'CUPCAKE MIMIC', role: 'ambusher, frosting maw', draw: drawCupcake },
  { n: 17, name: 'CANDY CORN PACK', role: 'dart formation', draw: drawCorn },
  { n: 18, name: 'SPRINKLE WASP', role: 'flyer, strafes', draw: drawWasp },
  { n: 19, name: 'CARAMEL SLIME', role: 'sticky zoner, pools', draw: drawCaramel },
  { n: 20, name: 'SUGAR FIEND', role: 'elite crazed frenzy', draw: drawFiend },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_mob_options.png', title: 'SUGAR WORLD — MOB CANDIDATES (pick your roster, any count)', S: 160 });
}
module.exports = { LIST };
