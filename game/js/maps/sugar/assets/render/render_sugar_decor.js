// artdev/sugar/render_sugar_decor.js — 20 numbered SUGAR WORLD decor
// candidates, mined from Red's concept art (cotton-candy trees, gumdrop
// trees, gingerbread houses, candy-cane fences, mushroom cottages,
// frosted mountains, marshmallows, lollipop groves, candy flowers...).
'use strict';
const KIT = require('./sugar_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, stripes, sprinkles, drip, gloss } = KIT;

// 1 · COTTON CANDY TREE
function drawCottonTree(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // trunk
  stroke(put, cx, S * 0.5, cx, S * 0.86, S * 0.035, () => G.choc);
  stroke(put, cx - S * 0.012, S * 0.55, cx - S * 0.012, S * 0.84, S * 0.01, () => G.chocLt);
  stroke(put, cx, S * 0.62, cx + S * 0.08, S * 0.52, S * 0.02, () => G.choc); // branch
  // cotton puff canopy (pink + blue)
  [[0, 0.3, 0.15, G.pink, G.pinkLt], [-0.12, 0.38, 0.1, G.blueLt, '#e0f4ff'], [0.12, 0.36, 0.11, G.pink, G.pinkLt], [0.02, 0.44, 0.09, G.pinkLt, '#ffe8f4']].forEach(([dx, dy, r, c, cLt]) => {
    ell(put, cx + dx * S, S * dy, S * r, S * r * 0.9, (tx, ty) => mix(cLt, c, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  });
  // wisp texture
  for (let a = 0; a < 6.28; a += 0.6) put(Math.round(cx + Math.cos(a) * S * 0.17), Math.round(S * 0.36 + Math.sin(a) * S * 0.13), G.pinkLt);
}
// 2 · GUMDROP TREE
function drawGumdropTree(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  stroke(put, cx, S * 0.44, cx, S * 0.86, S * 0.04, () => G.choc);
  [[-0.1, 0.55], [0.1, 0.52]].forEach(([dx, dy]) => stroke(put, cx, S * (dy + 0.1), cx + dx * S, S * dy, S * 0.022, () => G.choc));
  // green canopy
  ell(put, cx, S * 0.32, S * 0.17, S * 0.14, (tx, ty) => mix('#8ac862', '#4a8a3a', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // gumdrops studding it
  [[-0.1, 0.26, G.red], [0.02, 0.22, G.grape], [0.12, 0.28, G.orange], [-0.04, 0.34, G.yellow], [0.08, 0.38, G.red], [-0.13, 0.36, G.blue]].forEach(([dx, dy, c]) => {
    dome(put, cx + dx * S, S * dy, S * 0.032, S * 0.028, c, mix(c, '#ffffff', 0.45), mix(c, '#000000', 0.3));
    put(Math.round(cx + dx * S - 1), Math.round(S * dy - 2), G.white);
  });
}
// 3 · GINGERBREAD HOUSE
function drawGingerHouse(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  // walls
  for (let y = Math.round(S * 0.48); y < S * 0.84; y++) row(put, y, cx - S * 0.18, cx + S * 0.18, (tx) => {
    let b = mix(G.gingerLt, G.ginger, clamp(tx * 1.15, 0, 1));
    if (tx > 0.85) b = mix(b, G.gingerDk, 0.5);
    return b;
  });
  // icing roof
  for (let y = 0; y < S * 0.16; y++) {
    const t = y / (S * 0.16), w = S * (0.04 + t * 0.19);
    row(put, Math.round(S * 0.32 + y), cx - w, cx + w, (tx) => mix('#fffdf6', G.creamDk, clamp(tx * 0.9, 0, 1)));
  }
  drip(put, cx - S * 0.2, cx + S * 0.19, S * 0.48, '#fffdf6', G.creamDk);
  // candy shingle dots on roof
  [[-0.08, 0.38, G.red], [0.02, 0.35, G.lime], [0.1, 0.4, G.blue], [-0.02, 0.42, G.orange]].forEach(([dx, dy, c]) => put(Math.round(cx + dx * S), Math.round(S * dy), c));
  // door + windows + cane posts
  dome(put, cx, S * 0.76, S * 0.05, S * 0.09, G.choc, G.chocLt, G.chocDk);
  put(Math.round(cx + S * 0.03), Math.round(S * 0.76), G.yellow);
  [[-0.1], [0.1]].forEach(([dx]) => { plate(put, cx + dx * S - S * 0.035, S * 0.56, cx + dx * S + S * 0.035, S * 0.64, G.yellowLt, '#fffdf6', G.caramel); stroke(put, cx + dx * S, S * 0.56, cx + dx * S, S * 0.64, 1, () => G.gingerDk); });
  [[-0.21], [0.21]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.52, cx + dx * S, S * 0.84, 2.6, stripes(G.red, G.white, 8)));
  // icing seams
  for (let x = -0.16; x <= 0.16; x += 0.045) put(Math.round(cx + x * S), Math.round(S * 0.5 + Math.sin(x * 70) * 1.6), '#fffdf6');
}
// 4 · CANDY CANE FENCE
function drawFence(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // three cane posts
  [[-0.2], [0], [0.2]].forEach(([dx]) => {
    stroke(put, cx + dx * S, S * 0.45, cx + dx * S, S * 0.8, 3.2, stripes(G.red, G.white, 8));
    for (let a = Math.PI; a >= 0; a -= 0.12) {
      const px = cx + dx * S - 5 + Math.cos(-a) * 5, py = S * 0.45 + Math.sin(-a) * 5;
      stroke(put, px, py, px, py + 1, 2.8, () => ((a * 4 | 0) % 2 ? G.red : G.white));
    }
  });
  // ribbon rails
  [0.58, 0.7].forEach(y => {
    for (let x = -0.24; x < 0.24; x += 0.01) put(Math.round(cx + x * S), Math.round(S * (y + Math.sin(x * 30) * 0.008)), (x * 40 | 0) % 2 ? G.pinkLt : G.white);
  });
}
// 5 · MUSHROOM COTTAGE
function drawMushroom(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // stem house
  for (let y = Math.round(S * 0.5); y < S * 0.84; y++) {
    const t = (y - S * 0.5) / (S * 0.34);
    const w = S * (0.1 + t * 0.03);
    row(put, y, cx - w, cx + w, (tx) => mix('#fff4e0', G.creamDk, clamp(tx * 1.1, 0, 1)));
  }
  // red cap w/ white spots
  dome(put, cx, S * 0.42, S * 0.2, S * 0.15, G.red, G.redLt, G.redDk);
  [[-0.12, 0.36], [0.02, 0.3], [0.13, 0.38], [-0.03, 0.42]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.026, S * 0.02, () => G.white));
  // door + round window
  dome(put, cx, S * 0.76, S * 0.04, S * 0.08, G.choc, G.chocLt, G.chocDk);
  ell(put, cx + S * 0.07, S * 0.62, S * 0.025, S * 0.025, (tx, ty) => mix(G.yellowLt, G.caramel, ty));
  for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.07 + Math.cos(a) * S * 0.03), Math.round(S * 0.62 + Math.sin(a) * S * 0.03), G.chocDk);
}
// 6 · LOLLIPOP GROVE
function drawLolliGrove(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  [[-0.14, 0.34, 0.09, G.red], [0.1, 0.28, 0.11, G.grape], [0.02, 0.46, 0.07, G.orange]].forEach(([dx, dy, r, c]) => {
    stroke(put, cx + dx * S, S * (dy + r), cx + dx * S, S * 0.84, 2.4, () => G.white);
    ell(put, cx + dx * S, S * dy, S * r, S * r, (tx, ty) => mix(mix(c, '#ffffff', 0.35), c, ty));
    for (let a = 0; a < 12; a += 0.06) {
      const rr = 1 + a * (r * 10);
      put(Math.round(cx + dx * S + Math.cos(a) * rr * 0.55), Math.round(S * dy + Math.sin(a) * rr * 0.55), (a * 2 | 0) % 2 ? c : G.white);
    }
    gloss(put, cx + dx * S - S * 0.02, S * (dy - r * 0.4), S * r * 0.6);
  });
}
// 7 · FROSTED PEAK
function drawPeak(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  // strawberry mountain cone
  for (let y = 0; y < S * 0.5; y++) {
    const t = y / (S * 0.5), w = S * 0.28 * t;
    row(put, Math.round(S * 0.32 + y), cx - w, cx + w, (tx) => {
      let b = mix('#f0a0b8', '#c86a8a', clamp(tx * 1.1, 0, 1));
      if (tx > 0.82) b = mix(b, '#8a3a5a', 0.4);
      return b;
    });
  }
  // icing snow cap w/ drips
  for (let y = 0; y < S * 0.14; y++) {
    const t = y / (S * 0.14), w = S * 0.28 * ((S * 0.32 + y) - S * 0.32) / (S * 0.5) + S * 0.0;
    row(put, Math.round(S * 0.32 + y), cx - S * 0.28 * (y / (S * 0.5)), cx + S * 0.28 * (y / (S * 0.5)), (tx) => mix('#fffdf6', G.creamDk, tx * 0.6));
  }
  drip(put, cx - S * 0.08, cx + S * 0.08, S * 0.45, '#fffdf6', G.creamDk);
  // sprinkles on the snow
  sprinkles(put, cx, S * 0.4, S * 0.06, S * 0.05, 6, 17);
  // cherry summit
  ell(put, cx, S * 0.3, S * 0.028, S * 0.026, (tx, ty) => mix(G.redLt, G.redDk, tx + ty * 0.4));
  put(Math.round(cx - 1), Math.round(S * 0.29), G.white);
}
// 8 · MARSHMALLOW BOULDERS
function drawMallows(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  [[-0.12, 0.66, 0.09, 0], [0.1, 0.68, 0.075, 0.2], [0, 0.52, 0.08, -0.15]].forEach(([dx, dy, r, tilt]) => {
    for (let y = -r; y < r; y += 0.008) {
      const w = r * 0.95;
      row(put, Math.round(S * (dy + y)), cx + (dx - w + tilt * y) * S, cx + (dx + w + tilt * y) * S, (tx) => {
        let b = mix('#fffdf6', G.creamDk, clamp(tx * 1.05, 0, 1));
        return b;
      });
    }
    ell(put, cx + dx * S, S * (dy - r * 0.9), S * r * 0.95, S * 0.02, (tx, ty) => mix('#fffdf6', G.creamDk, tx * 0.5));
  });
  // one toasted
  ell(put, cx + S * 0.12, S * 0.64, S * 0.03, S * 0.025, (tx, ty) => mix(G.caramel, G.caramelDk, tx));
}
// 9 · CANDY FLOWERS
function drawFlowers(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  [[-0.14, 0.6, G.red, G.yellow], [0.02, 0.52, G.orange, G.grape], [0.15, 0.62, G.blue, G.pink]].forEach(([dx, dy, pc, cc]) => {
    stroke(put, cx + dx * S, S * (dy + 0.05), cx + dx * S, S * 0.82, 1.8, () => '#4a8a3a');
    fin(put, 0, 0, 0, 0, 0, 0); // noop guard
    // leaves
    ell(put, cx + dx * S + S * 0.025, S * 0.74, S * 0.02, S * 0.01, () => '#6aa84a');
    // petals
    for (let a = 0; a < 6.28; a += 0.9) ell(put, cx + dx * S + Math.cos(a) * S * 0.035, S * dy + Math.sin(a) * S * 0.035, S * 0.022, S * 0.022, (tx, ty) => mix(mix(pc, '#ffffff', 0.35), pc, ty));
    ell(put, cx + dx * S, S * dy, S * 0.018, S * 0.018, (tx, ty) => mix(mix(cc, '#ffffff', 0.3), cc, ty));
  });
}
function fin() {} // (unused guard)
// 10 · CHOCOLATE BRIDGE
function drawBridge(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  // arc bridge over choc river hint
  for (let x = -0.26; x <= 0.26; x += 0.008) {
    const y = 0.6 - Math.sin((x + 0.26) / 0.52 * Math.PI) * 0.1;
    stroke(put, cx + x * S, S * y, cx + x * S, S * (y + 0.07), 2, (t) => mix(G.chocLt, G.chocDk, Math.abs(x) * 2.4 + t * 0.3));
  }
  // plank lines
  for (let x = -0.24; x <= 0.24; x += 0.05) { const y = 0.6 - Math.sin((x + 0.26) / 0.52 * Math.PI) * 0.1; stroke(put, cx + x * S, S * y, cx + x * S, S * (y + 0.065), 1, () => G.chocDk); }
  // cane rails
  for (let x = -0.26; x <= 0.26; x += 0.016) {
    const y = 0.55 - Math.sin((x + 0.26) / 0.52 * Math.PI) * 0.1;
    put(Math.round(cx + x * S), Math.round(S * y), (x * 30 | 0) % 2 ? G.red : G.white);
  }
  [[-0.26], [0.26], [0]].forEach(([dx]) => { const y = 0.55 - Math.sin((dx + 0.26) / 0.52 * Math.PI) * 0.1; stroke(put, cx + dx * S, S * y, cx + dx * S, S * (0.6 - Math.sin((dx + 0.26) / 0.52 * Math.PI) * 0.1), 1.6, stripes(G.red, G.white, 4)); });
  // choc river below
  for (let y = Math.round(S * 0.72); y < S * 0.82; y++) row(put, y, cx - S * 0.3, cx + S * 0.3, (tx) => mix(G.chocLt, G.chocDk, clamp(tx + (y % 4) * 0.1, 0, 1)));
  [[-0.15, 0.75], [0.1, 0.78]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.06) * S, S * dy, 1, () => G.caramelLt)); // swirls
}
// 11 · SODA GEYSER
function drawGeyser(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // bottle-mouth crater
  ell(put, cx, S * 0.7, S * 0.11, S * 0.05, (tx, ty) => mix('#c8e8e0', '#5a9a8a', clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx, S * 0.69, S * 0.06, S * 0.022, () => G.soda);
  // fizz column
  for (let t = 0; t < 1; t += 0.05) {
    const w = S * (0.02 + t * 0.05);
    ell(put, cx + Math.sin(t * 9) * 2, S * (0.66 - t * 0.4), w, w * 0.8, (tx, ty) => mix('#f0fffc', G.soda, clamp(tx + ty * 0.3, 0, 1)));
  }
  // spray droplets
  [[-0.12, 0.3], [0.14, 0.26], [-0.06, 0.2], [0.06, 0.34], [0.18, 0.4]].forEach(([dx, dy]) => {
    ell(put, cx + dx * S, S * dy, S * 0.014, S * 0.014, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? G.blueLt : G.soda));
  });
}
// 12 · SUGAR CUBE PILE
function drawCubes(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  [[-0.1, 0.68, 0.09], [0.1, 0.7, 0.08], [0, 0.54, 0.085]].forEach(([dx, dy, r]) => {
    plate(put, cx + (dx - r) * S, S * (dy - r), cx + (dx + r) * S, S * (dy + r), '#fffdf6', '#ffffff', G.creamDk);
    // sparkle crust
    sprinkles(put, cx + dx * S, S * dy, S * r * 0.7, S * r * 0.7, 4, (dx * 100) | 0);
    for (let i = 0; i < 6; i++) put(Math.round(cx + (dx - r * 0.6) * S + i * r * S * 0.24), Math.round(S * (dy - r * 0.5) + (i % 3) * 3), '#ffffff');
  });
}
// 13 · DONUT ARCH
function drawDonut(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // half-buried donut torus
  for (let a = Math.PI; a >= 0; a -= 0.02) {
    const px = cx + Math.cos(a) * S * 0.2, py = S * 0.74 - Math.sin(a) * S * 0.26;
    ell(put, px, py, S * 0.055, S * 0.05, (tx, ty) => mix(G.caramelLt, G.caramelDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  }
  // pink glaze top half w/ drips
  for (let a = Math.PI * 0.85; a >= Math.PI * 0.15; a -= 0.02) {
    const px = cx + Math.cos(a) * S * 0.2, py = S * 0.74 - Math.sin(a) * S * 0.26;
    ell(put, px, py - S * 0.012, S * 0.05, S * 0.035, (tx, ty) => mix(G.pinkLt, G.pink, clamp(tx + ty * 0.4, 0, 1)));
  }
  sprinkles(put, cx, S * 0.48, S * 0.16, S * 0.05, 12, 23);
  drip(put, cx - S * 0.12, cx + S * 0.12, S * 0.52, G.pink, G.pinkDk);
}
// 14 · WAFER STACK
function drawWafers(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // stacked wafer slabs, slightly offset
  [[0, 0.76], [0.03, 0.68], [-0.02, 0.6], [0.02, 0.52]].forEach(([dx, y], i) => {
    plate(put, cx + (dx - 0.16) * S, S * y, cx + (dx + 0.16) * S, S * (y + 0.075), i % 2 ? '#f0d8b0' : '#e8c090', '#fff4dc', '#b08a58');
    // waffle grid
    for (let gx = -0.13; gx <= 0.13; gx += 0.045) stroke(put, cx + (dx + gx) * S, S * (y + 0.01), cx + (dx + gx) * S, S * (y + 0.065), 0.8, () => '#c8a068');
  });
  // cream oozing between
  [0.6, 0.68].forEach(y => { for (let x = -0.15; x <= 0.15; x += 0.02) put(Math.round(cx + x * S), Math.round(S * y - 1 + Math.sin(x * 40) * 1.2), '#fffdf6'); });
  // strawberry on top
  ell(put, cx, S * 0.48, S * 0.035, S * 0.03, (tx, ty) => mix(G.redLt, G.redDk, tx + ty * 0.3));
  put(Math.round(cx), Math.round(S * 0.455), '#4a8a3a');
}
// 15 · JELLY POND
function drawJelly(put, S) {
  const cx = S * 0.5;
  // wobbly jelly pool
  ell(put, cx, S * 0.66, S * 0.22, S * 0.12, (tx, ty) => {
    let b = mix(G.grapeLt, G.grape, clamp(tx * 0.9 + ty * 0.5, 0, 1));
    return b;
  });
  ell(put, cx, S * 0.62, S * 0.19, S * 0.08, (tx, ty) => mix(mix(G.grapeLt, '#ffffff', 0.3), G.grape, clamp(tx + ty * 0.4, 0, 1)));
  // wobble rings + shine
  for (let a = 0; a < 6.28; a += 0.35) put(Math.round(cx + Math.cos(a) * S * 0.13), Math.round(S * 0.62 + Math.sin(a) * S * 0.05), G.grapeLt);
  gloss(put, cx - S * 0.06, S * 0.58, S * 0.08);
  // trapped fruit chunks
  [[-0.08, 0.64, G.orange], [0.06, 0.66, G.lime], [0.01, 0.61, G.red]].forEach(([dx, dy, c]) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.014, (tx, ty) => mix(mix(c, '#ffffff', 0.3), c, ty)));
  // drips at edge
  drip(put, cx - S * 0.14, cx + S * 0.14, S * 0.74, G.grape, G.grapeDk);
}
// 16 · CANDY SIGNPOST
function drawSign(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  stroke(put, cx, S * 0.36, cx, S * 0.84, 3, stripes(G.red, G.white, 9));
  // two arrow signs (wafer)
  [[0.34, 1], [0.46, -1]].forEach(([y, dir]) => {
    const x0 = cx - S * 0.14 * (dir > 0 ? 0.3 : 1), x1 = cx + S * 0.14 * (dir > 0 ? 1 : 0.3);
    plate(put, x0, S * y, x1, S * (y + 0.07), '#f0d8b0', '#fff4dc', '#b08a58');
    // arrow point
    for (let i = 0; i < 6; i++) { const px = dir > 0 ? x1 + i : x0 - i; for (let yy = i; yy < 12 - i; yy++) put(Math.round(px), Math.round(S * y + yy - 1), '#e8c090'); }
    // icing text squiggle
    for (let x = x0 + 4; x < x1 - 4; x += 3) put(Math.round(x), Math.round(S * (y + 0.035)), G.pinkDk);
  });
  // gumdrop topper
  dome(put, cx, S * 0.33, S * 0.035, S * 0.03, G.lime, G.limeLt, G.limeDk);
}
// 17 · ICE CREAM BOULDER
function drawScoop(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // waffle cone tipped on its side
  for (let t = 0; t < 1; t += 0.04) {
    const w = S * 0.09 * (1 - t);
    ell(put, cx + S * (0.06 + t * 0.22), S * (0.66 + t * 0.06), w, w * 0.9, (tx, ty) => {
      let b = mix('#e8c090', '#b08a58', clamp(tx + ty * 0.4, 0, 1));
      return b;
    });
  }
  // waffle grid on cone
  for (let i = 0; i < 4; i++) stroke(put, cx + S * (0.1 + i * 0.05), S * 0.62, cx + S * (0.14 + i * 0.05), S * 0.74, 0.8, () => '#8a6438');
  // melting scoop
  ell(put, cx - S * 0.06, S * 0.6, S * 0.12, S * 0.11, (tx, ty) => mix('#fff0f6', G.pink, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  drip(put, cx - S * 0.16, cx + S * 0.05, S * 0.68, G.pink, G.pinkDk);
  // melt puddle
  ell(put, cx - S * 0.08, S * 0.8, S * 0.14, S * 0.03, (tx, ty) => mix(G.pinkLt, G.pink, tx));
  // cherry
  ell(put, cx - S * 0.08, S * 0.5, S * 0.025, S * 0.024, (tx, ty) => mix(G.redLt, G.redDk, tx + ty * 0.4));
}
// 18 · PEPPERMINT WHEEL
function drawWheel(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // giant peppermint disc leaning on a gumdrop
  ell(put, cx, S * 0.56, S * 0.16, S * 0.16, (tx, ty) => {
    const a = Math.atan2(ty - 0.5, tx - 0.5);
    return ((a * 4 / Math.PI + 8) | 0) % 2 ? G.red : G.white;
  });
  ell(put, cx, S * 0.56, S * 0.045, S * 0.045, (tx, ty) => mix(G.white, G.creamDk, ty));
  gloss(put, cx - S * 0.04, S * 0.46, S * 0.12);
  dome(put, cx + S * 0.14, S * 0.76, S * 0.05, S * 0.045, G.grape, G.grapeLt, G.grapeDk);
}
// 19 · TAFFY TWIST POST
function drawTaffyPost(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // twisted spiral column
  for (let t = 0; t < 1; t += 0.02) {
    const y = S * (0.84 - t * 0.5);
    const px = cx + Math.sin(t * 12) * S * 0.03;
    ell(put, px, y, S * 0.04, S * 0.022, (tx, ty) => {
      const band = ((t * 14) | 0) % 2;
      return mix(band ? G.orange : G.orangeLt, G.orangeDk, clamp(tx + ty * 0.3, 0, 1));
    });
  }
  // wrapper ends flaring top
  fin2(put, cx - S * 0.02, S * 0.32, cx - S * 0.1, S * 0.26, cx - S * 0.04, S * 0.38, G.orangeLt, G.orangeDk);
  fin2(put, cx + S * 0.02, S * 0.32, cx + S * 0.1, S * 0.24, cx + S * 0.05, S * 0.36, G.orange, G.orangeDk);
  function fin2(put2, x0, y0, x1, y1, x2, y2, c, cDk) {
    const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
    for (let y = minY; y <= maxY; y++) {
      const t = (y - minY) / Math.max(1, maxY - minY);
      const xa = x0 + (x1 - x0) * t, xb = x0 + (x2 - x0) * t;
      row(put2, Math.round(y), Math.min(xa, xb), Math.max(xa, xb), (tx) => mix(c, cDk, clamp(tx * 0.8 + t * 0.3, 0, 1)));
    }
  }
}
// 20 · GIANT CUPCAKE COTTAGE
function drawCupcakeHouse(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  // wrapper base w/ pleats
  for (let y = Math.round(S * 0.56); y < S * 0.84; y++) {
    const t = (y - S * 0.56) / (S * 0.28);
    const w = S * (0.19 - t * 0.045);
    row(put, y, cx - w, cx + w, (tx) => {
      let b = mix(G.mintLt, G.mint, clamp(tx * 1.1, 0, 1));
      if (((tx * 14) | 0) % 2) b = mix(b, G.mintDk, 0.35);
      return b;
    });
  }
  // frosting dome roof
  dome(put, cx, S * 0.42, S * 0.2, S * 0.16, G.pink, G.pinkLt, G.pinkDk);
  drip(put, cx - S * 0.19, cx + S * 0.18, S * 0.55, G.pink, G.pinkDk);
  sprinkles(put, cx, S * 0.38, S * 0.13, S * 0.09, 10, 29);
  // cherry chimney w/ smoke
  ell(put, cx + S * 0.04, S * 0.26, S * 0.035, S * 0.032, (tx, ty) => mix(G.redLt, G.redDk, tx + ty * 0.4));
  [[0.09, 0.2], [0.12, 0.15], [0.1, 0.1]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), G.creamDk));
  // door + window
  dome(put, cx, S * 0.76, S * 0.045, S * 0.08, G.choc, G.chocLt, G.chocDk);
  ell(put, cx - S * 0.1, S * 0.66, S * 0.028, S * 0.028, (tx, ty) => mix(G.yellowLt, G.caramel, ty));
}

const LIST = [
  { n: 1, name: 'COTTON CANDY TREE', role: 'pink-blue canopy', draw: drawCottonTree },
  { n: 2, name: 'GUMDROP TREE', role: 'studded canopy', draw: drawGumdropTree },
  { n: 3, name: 'GINGERBREAD HOUSE', role: 'icing roof + canes', draw: drawGingerHouse },
  { n: 4, name: 'CANDY CANE FENCE', role: 'posts + ribbon rails', draw: drawFence },
  { n: 5, name: 'MUSHROOM COTTAGE', role: 'red cap, lit window', draw: drawMushroom },
  { n: 6, name: 'LOLLIPOP GROVE', role: 'three swirls', draw: drawLolliGrove },
  { n: 7, name: 'FROSTED PEAK', role: 'berry mountain + icing', draw: drawPeak },
  { n: 8, name: 'MARSHMALLOW ROCKS', role: 'boulders, one toasted', draw: drawMallows },
  { n: 9, name: 'CANDY FLOWERS', role: 'petal patch', draw: drawFlowers },
  { n: 10, name: 'CHOC RIVER BRIDGE', role: 'arc + cane rails', draw: drawBridge },
  { n: 11, name: 'SODA GEYSER', role: 'fizz eruption', draw: drawGeyser },
  { n: 12, name: 'SUGAR CUBE PILE', role: 'sparkling blocks', draw: drawCubes },
  { n: 13, name: 'DONUT ARCH', role: 'half-buried, glazed', draw: drawDonut },
  { n: 14, name: 'WAFER STACK', role: 'cream-filled slabs', draw: drawWafers },
  { n: 15, name: 'JELLY POND', role: 'wobbling grape pool', draw: drawJelly },
  { n: 16, name: 'CANDY SIGNPOST', role: 'wafer arrows', draw: drawSign },
  { n: 17, name: 'MELTING SCOOP', role: 'tipped cone + puddle', draw: drawScoop },
  { n: 18, name: 'PEPPERMINT WHEEL', role: 'leaning giant disc', draw: drawWheel },
  { n: 19, name: 'TAFFY TWIST POST', role: 'spiral column', draw: drawTaffyPost },
  { n: 20, name: 'CUPCAKE COTTAGE', role: 'frosting-roof house', draw: drawCupcakeHouse },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_decor_options.png', title: 'SUGAR WORLD — DECOR CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
