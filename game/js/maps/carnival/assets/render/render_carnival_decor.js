// artdev/carnival/render_carnival_decor.js — 20 numbered HAUNTED CARNIVAL
// decoration candidates, one PNG grid. Faded midway props at midnight.
'use strict';
const KIT = require('./carnival_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, stripes, bunting, grin } = KIT;

// 1 · THE BIG TOP — striped circus tent (centerpiece).
function drawBigTop(put, S) {
  shadow(put, S, S * 0.5, S * 0.4);
  // tent cone
  for (let y = S * 0.3; y < S * 0.62; y++) {
    const t = (y - S * 0.3) / (S * 0.32), w = S * 0.38 * t;
    row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => {
      const band = Math.floor(tx * 8 * t + 0.01);
      return mix(band % 2 ? C.red : C.cream, band % 2 ? C.redDk : C.creamDk, tx * 0.4 + t * 0.3);
    });
  }
  // walls
  for (let y = S * 0.62; y < S * 0.82; y++) {
    row(put, Math.round(y), S * 0.14, S * 0.86, (tx) => {
      const band = Math.floor(tx * 9);
      return mix(band % 2 ? C.redDk : C.creamDk, band % 2 ? C.redDkk : C.creamDkk, (y - S * 0.62) / (S * 0.2));
    });
  }
  // dark entry flap
  for (let y = S * 0.66; y < S * 0.82; y++) { const t = (y - S * 0.66) / (S * 0.16); row(put, Math.round(y), S * 0.5 - S * 0.06 * (1 - t * 0.2), S * 0.5 + S * 0.06 * (1 - t * 0.2), () => C.oil); }
  // pole + tattered flag
  stroke(put, S * 0.5, S * 0.14, S * 0.5, S * 0.3, 2, () => C.woodDkk);
  [[0, 0], [1, 1], [2, 0], [3, 2], [4, 1]].forEach(([i, o]) => row(put, Math.round(S * 0.15 + i), S * 0.5, S * 0.5 + S * 0.06 - i * 1.2 - o, () => C.red));
  put(Math.round(S * 0.5), Math.round(S * 0.13), C.glow);
}

// 2 · TICKET BOOTH — striped kiosk, TICKETS sign.
function drawTicketBooth(put, S) {
  shadow(put, S, S * 0.5, S * 0.26);
  stripes(put, S * 0.3, S * 0.42, S * 0.7, S * 0.84, S * 0.08, C.red, C.cream);
  // window
  plate(put, S * 0.38, S * 0.52, S * 0.62, S * 0.68, C.oil, C.night, C.oil);
  optic(put, S * 0.5, S * 0.6, S * 0.015, C.oil, C.oil, C.glow); // something inside
  // counter + roof
  row(put, Math.round(S * 0.68), S * 0.36, S * 0.64, () => C.wood);
  for (let y = S * 0.32; y < S * 0.44; y++) { const t = (y - S * 0.32) / (S * 0.12); const w = S * (0.28 - t * 0.06); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redLt, C.redDk, tx * 0.6 + t * 0.3)); }
  // sign
  plate(put, S * 0.34, S * 0.2, S * 0.66, S * 0.3, C.glowDk, C.glow, C.woodDkk);
  [0.4, 0.46, 0.52, 0.58].forEach(x => stroke(put, S * x, S * 0.23, S * x, S * 0.27, 1.4, () => C.oil));
}

// 3 · DEAD CAROUSEL — slumped canopy, frozen horses.
function drawCarousel(put, S) {
  shadow(put, S, S * 0.5, S * 0.38);
  // canopy (sagging)
  for (let y = S * 0.24; y < S * 0.4; y++) {
    const t = (y - S * 0.24) / (S * 0.16), w = S * (0.1 + t * 0.26);
    row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => {
      const band = Math.floor(tx * 8);
      let b = mix(band % 2 ? C.violet : C.cream, band % 2 ? C.violetDk : C.creamDk, t * 0.5);
      if (Math.sin(tx * 20) > 0.6) b = mix(b, '#000000', 0.2); // sag shadows
      return b;
    });
  }
  // platform
  ell(put, S * 0.5, S * 0.78, S * 0.36, S * 0.08, (tx, ty) => mix(C.wood, C.woodDkk, clamp(tx * 0.5 + ty, 0, 1)));
  // center column
  stroke(put, S * 0.5, S * 0.38, S * 0.5, S * 0.74, S * 0.03, () => C.glowDk);
  // two frozen horses on poles
  [[0.32, 0.56], [0.66, 0.6]].forEach(([x, y]) => {
    stroke(put, S * x, S * 0.4, S * x, S * (y + 0.12), 1.6, () => C.ironLt);
    ell(put, S * x, S * y, S * 0.06, S * 0.035, (tx, ty) => mix('#e8e0ec', '#b0a4bc', tx + ty * 0.3));
    ell(put, S * (x + 0.05), S * (y - 0.045), S * 0.025, S * 0.02, () => '#d8d0e0');
    put(Math.round(S * (x + 0.05)), Math.round(S * (y - 0.05)), C.teal);
  });
  put(Math.round(S * 0.5), Math.round(S * 0.22), C.glow);
}

// 4 · RUSTED FERRIS — background wheel, one cabin swinging.
function drawFerrisProp(put, S) {
  shadow(put, S, S * 0.5, S * 0.34);
  const cx = S * 0.5, cy = S * 0.42;
  for (let a = 0; a < 6.283; a += 0.015) put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.3), mix(C.iron, C.ironDk, Math.abs(Math.sin(a * 3))));
  for (let a = 0; a < 6.283; a += 0.524) stroke(put, cx, cy, cx + Math.cos(a) * S * 0.29, cy + Math.sin(a) * S * 0.29, 1.2, () => C.ironDk);
  // support legs
  stroke(put, cx, cy, cx - S * 0.18, S * 0.88, 3, () => C.iron);
  stroke(put, cx, cy, cx + S * 0.18, S * 0.88, 3, () => C.iron);
  ell(put, cx, cy, S * 0.035, S * 0.035, (tx, ty) => mix(C.ironLt, C.ironDk, ty));
  // cabins — one dangling crooked
  for (let a = 0.5; a < 6.283; a += 1.047) {
    const gx = cx + Math.cos(a) * S * 0.3, gy = cy + Math.sin(a) * S * 0.3;
    plate(put, gx - 4, gy, gx + 4, gy + 8, C.red, C.redLt, C.redDkk);
  }
  const dx = cx + Math.cos(2.6) * S * 0.3, dy = cy + Math.sin(2.6) * S * 0.3;
  stroke(put, dx, dy, dx + 5, dy + 9, 1.2, () => C.ironDk);
  plate(put, dx + 2, dy + 9, dx + 10, dy + 17, C.glowDk, C.glow, C.woodDkk); // crooked lit cabin
}

// 5 · MILK BOTTLE BOOTH — knock-em-down game stand.
function drawBottleBooth(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  // stand
  plate(put, S * 0.22, S * 0.5, S * 0.78, S * 0.82, C.wood, C.woodLt, C.woodDkk);
  stripes(put, S * 0.22, S * 0.3, S * 0.78, S * 0.42, S * 0.07, C.teal, C.cream); // awning
  row(put, Math.round(S * 0.42), S * 0.2, S * 0.8, () => C.tealDk);
  // shelf + bottle pyramids
  row(put, Math.round(S * 0.56), S * 0.26, S * 0.74, () => C.woodDk);
  [[0.34, 0], [0.5, 1], [0.66, 0]].forEach(([x, fallen]) => {
    if (fallen) { ell(put, S * x, S * 0.54, S * 0.035, S * 0.018, (tx, ty) => mix('#e8e4d8', '#b0aa96', ty)); return; }
    [[0, -0.005], [-0.022, 0.04], [0.022, 0.04]].forEach(([dx, dy]) => {
      ell(put, S * (x + dx), S * (0.5 + dy), S * 0.016, S * 0.028, (tx, ty) => mix('#e8e4d8', '#b0aa96', tx + ty * 0.3));
      put(Math.round(S * (x + dx)), Math.round(S * (0.475 + dy)), '#b0aa96');
    });
  });
  // counter balls
  [0.4, 0.47].forEach(x => ell(put, S * x, S * 0.79, S * 0.02, S * 0.02, (tx, ty) => mix(C.red, C.redDk, tx + ty * 0.4)));
}

// 6 · DART BALLOON WALL — pop-a-balloon board.
function drawDartWall(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  plate(put, S * 0.24, S * 0.26, S * 0.76, S * 0.78, C.woodDk, C.wood, C.woodDkk);
  // balloons grid (some popped = limp strings)
  let i = 0;
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 4; gx++) {
    const x = S * (0.32 + gx * 0.12), y = S * (0.36 + gy * 0.14);
    i++;
    if ((gx + gy) % 3 === 2) { // popped
      for (let t = 0; t < 1; t += 0.1) put(Math.round(x + Math.sin(t * 5) * 2), Math.round(y + t * S * 0.05), C.creamDk);
      continue;
    }
    const c = [C.red, C.glow, C.teal, C.violet][i % 4];
    ell(put, x, y, S * 0.032, S * 0.04, (tx, ty) => mix(mix(c, '#ffffff', 0.3), mix(c, '#000000', 0.3), clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  }
  // stray darts stuck in the board
  [[0.28, 0.6], [0.6, 0.3]].forEach(([x, y]) => { stroke(put, S * x, S * y, S * (x + 0.05), S * (y - 0.03), 1.4, () => C.ironLt); put(Math.round(S * x), Math.round(S * y), C.red); });
  row(put, Math.round(S * 0.8), S * 0.2, S * 0.8, () => C.woodDkk); // counter
}

// 7 · HIGH STRIKER — strength tester tower + bell.
function drawStriker(put, S) {
  shadow(put, S, S * 0.5, S * 0.2);
  // tower
  for (let y = S * 0.14; y < S * 0.82; y++) { const w = S * 0.035; row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redLt, C.redDk, tx)); }
  // gradations
  for (let y = S * 0.2; y < S * 0.78; y += S * 0.06) row(put, Math.round(y), S * 0.46, S * 0.54, () => C.cream);
  // bell on top
  dome(put, S * 0.5, S * 0.11, S * 0.05, S * 0.04, C.glow, C.glowLt, C.glowDk);
  // puck stuck mid-way
  plate(put, S * 0.46, S * 0.48, S * 0.54, S * 0.52, C.iron, C.ironLt, C.ironDk);
  // base + mallet
  plate(put, S * 0.36, S * 0.82, S * 0.64, S * 0.88, C.wood, C.woodLt, C.woodDkk);
  stroke(put, S * 0.62, S * 0.86, S * 0.74, S * 0.7, 2.6, () => C.wood);
  ell(put, S * 0.76, S * 0.66, S * 0.05, S * 0.04, (tx, ty) => mix(C.ironLt, C.ironDk, clamp(tx + ty * 0.4, 0, 1)));
  // "666" score plate :) keep it subtle — glow plate
  plate(put, S * 0.42, S * 0.14, S * 0.58, S * 0.18, C.glowDk, C.glow, C.woodDkk);
}

// 8 · POPCORN CART — glass-box wagon, spilled kernels.
function drawPopcornCart(put, S) {
  shadow(put, S, S * 0.5, S * 0.28);
  // glass box
  plate(put, S * 0.3, S * 0.36, S * 0.7, S * 0.62, C.night, C.violetDk, C.oil);
  [0.34, 0.66].forEach(x => stroke(put, S * x, S * 0.36, S * x, S * 0.62, 1.4, () => C.glowDk));
  row(put, Math.round(S * 0.36), S * 0.28, S * 0.72, () => C.glowDk);
  // heaped popcorn inside
  for (let i = 0; i < 40; i++) {
    const x = S * (0.33 + (i * 37 % 100) / 100 * 0.34), y = S * (0.5 + (i * 53 % 100) / 100 * 0.09);
    put(Math.round(x), Math.round(y), i % 3 ? C.glowLt : '#fff8e0');
  }
  // lamp inside still on
  put(Math.round(S * 0.5), Math.round(S * 0.42), C.glow); put(Math.round(S * 0.5), Math.round(S * 0.41), C.glowLt);
  // cart body + wheels
  plate(put, S * 0.28, S * 0.62, S * 0.72, S * 0.74, C.red, C.redLt, C.redDkk);
  [0.36, 0.64].forEach(x => { ell(put, S * x, S * 0.78, S * 0.05, S * 0.05, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.13 && d <= 0.25 ? C.glowDk : null; }); });
  // spilled kernels
  [[0.2, 0.85], [0.26, 0.88], [0.78, 0.84]].forEach(([x, y]) => put(Math.round(S * x), Math.round(S * y), C.glowLt));
}

// 9 · COTTON CANDY STAND — pink cloud rack.
function drawCandyStand(put, S) {
  shadow(put, S, S * 0.5, S * 0.26);
  plate(put, S * 0.3, S * 0.44, S * 0.7, S * 0.8, C.pink, '#ffc8e0', mix(C.pink, '#000', 0.5));
  stripes(put, S * 0.26, S * 0.28, S * 0.74, S * 0.4, S * 0.08, C.pink, C.cream);
  row(put, Math.round(S * 0.4), S * 0.24, S * 0.76, () => mix(C.pink, '#000', 0.4));
  // rack of candy cones
  [[0.38, 0.52], [0.5, 0.5], [0.62, 0.53]].forEach(([x, y]) => {
    stroke(put, S * x, S * (y + 0.1), S * x, S * y, 2, () => C.cream);
    ell(put, S * x, S * (y - 0.03), S * 0.04, S * 0.045, (tx, ty) => mix('#ffd8ec', C.pink, clamp(tx * 0.7 + ty * 0.5, 0, 1)));
  });
  // window sign
  grin(put, S * 0.5, S * 0.7, S * 0.05, false, mix(C.pink, '#000', 0.55), false);
  optic(put, S * 0.44, S * 0.64, S * 0.013, C.oil, C.oil, '#ffffff');
  optic(put, S * 0.56, S * 0.64, S * 0.013, C.oil, C.oil, '#ffffff');
}

// 10 · FORTUNE WAGON — gypsy trailer, glowing window.
function drawWagon(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  // rounded wagon body
  for (let y = S * 0.34; y < S * 0.72; y++) {
    const t = (y - S * 0.34) / (S * 0.38);
    const w = S * (0.3 * Math.sqrt(1 - (t - 1) * (t - 1) * 0.25));
    row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.violet, C.violetDk, clamp(tx * 1.1 + t * 0.2, 0, 1)));
  }
  // roof arc
  for (let y = S * 0.28; y < S * 0.36; y++) { const t = (y - S * 0.28) / (S * 0.08); const w = S * (0.2 + t * 0.11); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redDk, C.redDkk, tx * 0.5)); }
  // glowing round window with an eye
  ell(put, S * 0.5, S * 0.5, S * 0.07, S * 0.07, (tx, ty) => mix(C.glowLt, C.glowDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  optic(put, S * 0.5, S * 0.5, S * 0.022, C.oil, C.violetDk, C.oil);
  // wheels
  [0.32, 0.68].forEach(x => { for (let a = 0; a < 6.283; a += 0.05) put(Math.round(S * x + Math.cos(a) * S * 0.06), Math.round(S * 0.76 + Math.sin(a) * S * 0.06), C.glowDk); ell(put, S * x, S * 0.76, S * 0.015, S * 0.015, () => C.glow); });
  // steps + moons painted on
  plate(put, S * 0.44, S * 0.72, S * 0.56, S * 0.76, C.wood, C.woodLt, C.woodDkk);
  put(Math.round(S * 0.34), Math.round(S * 0.42), C.glow); put(Math.round(S * 0.66), Math.round(S * 0.44), C.tealLt);
}

// 11 · HALL OF MIRRORS — jagged mirror-maze entry.
function drawMirrors(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  plate(put, S * 0.2, S * 0.3, S * 0.8, S * 0.82, C.night, C.violetDk, C.oil);
  // three mirror panels — teal glass with warped reflections
  [[0.3, 1], [0.5, -1], [0.7, 1]].forEach(([x, warp]) => {
    for (let y = S * 0.38; y < S * 0.76; y++) {
      const t = (y - S * 0.38) / (S * 0.38);
      const wob = Math.sin(t * 8) * warp * S * 0.008;
      row(put, Math.round(y), S * x - S * 0.055 + wob, S * x + S * 0.055 + wob, (tx) => mix(C.tealLt, C.tealDk, clamp(tx * 1.2 + t * 0.2, 0, 1)));
    }
    // a wrong reflection in the middle panel
    if (warp < 0) { optic(put, S * x, S * 0.52, S * 0.013, C.oil, C.oil, C.red); optic(put, S * (x + 0.03), S * 0.52, S * 0.013, C.oil, C.oil, C.red); }
  });
  // marquee
  plate(put, S * 0.24, S * 0.22, S * 0.76, S * 0.32, C.glowDk, C.glow, C.woodDkk);
  [0.3, 0.4, 0.5, 0.6, 0.7].forEach(x => put(Math.round(S * x), Math.round(S * 0.27), C.oil));
}

// 12 · FUNHOUSE MOUTH — giant clown-face doorway.
function drawFunhouse(put, S) {
  shadow(put, S, S * 0.5, S * 0.36);
  // face wall
  ell(put, S * 0.5, S * 0.5, S * 0.36, S * 0.34, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // hair
  [-1, 1].forEach(s => ell(put, S * (0.5 + s * 0.32), S * 0.32, S * 0.09, S * 0.1, (tx, ty) => mix(C.teal, C.tealDk, tx + ty * 0.3)));
  // eyes — spinning spirals
  [[-0.13, 0], [0.13, 0]].forEach(([dx]) => {
    for (let a = 0; a < 9; a += 0.12) {
      const r = a * S * 0.006;
      put(Math.round(S * (0.5 + dx) + Math.cos(a) * r), Math.round(S * 0.4 + Math.sin(a) * r), a % 1 < 0.5 ? C.oil : C.red);
    }
  });
  put(Math.round(S * 0.5), Math.round(S * 0.47), C.red); // nose
  // the MOUTH = the door (black arch with teeth)
  for (let y = S * 0.56; y < S * 0.82; y++) {
    const t = (y - S * 0.56) / (S * 0.26);
    const w = S * 0.14 * Math.sqrt(1 - t * t * 0.4);
    row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, () => C.oil);
  }
  // teeth rim
  for (let x = -0.12; x <= 0.12; x += 0.04) { for (let d = 0; d < 5; d++) row(put, Math.round(S * 0.56 + d), S * (0.5 + x) - (5 - d) * 0.5, S * (0.5 + x) + (5 - d) * 0.5, () => C.white); }
  grin(put, S * 0.5, S * 0.585, S * 0.16, false, C.blood, false);
}

// 13 · BUNTING POLES — flag line between two posts.
function drawBunting(put, S) {
  shadow(put, S, S * 0.5, S * 0.34);
  [0.18, 0.82].forEach(x => { stroke(put, S * x, S * 0.3, S * x, S * 0.86, 3, () => C.woodDk); put(Math.round(S * x), Math.round(S * 0.29), C.glow); });
  bunting(put, S * 0.18, S * 0.32, S * 0.82, S * 0.32, 7, [C.red, C.glow, C.teal, C.violet, C.cream]);
  // one fallen flag on the ground
  for (let d = 0; d < 4; d++) row(put, Math.round(S * 0.84 + d), S * 0.45 - d, S * 0.45 + 4 - d, () => C.redDk);
}

// 14 · STRING LIGHTS — lamp post, half the bulbs dead.
function drawLights(put, S) {
  shadow(put, S, S * 0.5, S * 0.2);
  stroke(put, S * 0.5, S * 0.2, S * 0.5, S * 0.88, 3.4, () => C.ironDk);
  ell(put, S * 0.5, S * 0.88, S * 0.08, S * 0.03, (tx, ty) => mix(C.iron, C.ironDk, ty));
  // cross arm + two strings sweeping down
  stroke(put, S * 0.34, S * 0.24, S * 0.66, S * 0.24, 2.4, () => C.ironDk);
  [[-1, 0.34], [1, 0.66]].forEach(([s, x0]) => {
    for (let t = 0; t <= 1; t += 0.02) {
      const x = lerp(S * x0, S * (0.5 + s * 0.42), t), y = S * 0.24 + Math.sin(t * Math.PI * 0.5) * S * 0.4;
      put(Math.round(x), Math.round(y), C.ironDk);
      if (Math.floor(t * 10) % 2 === 0 && (t * 100) % 10 < 2) {
        const dead = (Math.floor(t * 10) + (s > 0 ? 1 : 0)) % 3 === 0;
        ell(put, x, y + 3, 2.4, 3, () => dead ? C.ironDk : C.glow);
        if (!dead) put(Math.round(x), Math.round(y + 2), C.glowLt);
      }
    }
  });
  // head lamp flickering
  dome(put, S * 0.5, S * 0.17, S * 0.05, S * 0.04, C.glow, C.glowLt, C.glowDk);
}

// 15 · CAGE WAGON — sideshow cage, bars bent OUTWARD.
function drawCage(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  plate(put, S * 0.22, S * 0.34, S * 0.78, S * 0.72, C.night, C.violetDk, C.oil);
  // bars — two bent apart
  for (let i = 0; i < 7; i++) {
    const x = S * (0.27 + i * 0.077);
    if (i === 3) { // bent pair
      for (let y = S * 0.36; y < S * 0.7; y++) { const t = (y - S * 0.36) / (S * 0.34); put(Math.round(x - Math.sin(t * 3.14) * S * 0.04), Math.round(y), C.ironLt); }
      continue;
    }
    if (i === 4) { for (let y = S * 0.36; y < S * 0.7; y++) { const t = (y - S * 0.36) / (S * 0.34); put(Math.round(x + Math.sin(t * 3.14) * S * 0.045), Math.round(y), C.ironLt); } continue; }
    stroke(put, x, S * 0.36, x, S * 0.7, 1.8, () => C.iron);
  }
  row(put, Math.round(S * 0.35), S * 0.22, S * 0.78, () => C.glowDk);
  row(put, Math.round(S * 0.7), S * 0.22, S * 0.78, () => C.glowDk);
  // wheels + "DANGER" plaque
  [0.32, 0.68].forEach(x => { for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * x + Math.cos(a) * S * 0.055), Math.round(S * 0.78 + Math.sin(a) * S * 0.055), C.woodDk); });
  plate(put, S * 0.38, S * 0.24, S * 0.62, S * 0.3, C.redDk, C.red, C.redDkk);
}

// 16 · PRIZE WALL — hanging teddies + prize shelf.
function drawPrizes(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  plate(put, S * 0.22, S * 0.26, S * 0.78, S * 0.8, C.woodDk, C.wood, C.woodDkk);
  row(put, Math.round(S * 0.3), S * 0.22, S * 0.78, () => C.woodDkk);
  // hanging teddies row (one missing — empty hook)
  [[0.32, '#a8825a'], [0.46, C.pink], [0.74, C.teal]].forEach(([x, c]) => {
    stroke(put, S * x, S * 0.3, S * x, S * 0.36, 1.2, () => C.creamDk);
    ell(put, S * x, S * 0.42, S * 0.045, S * 0.05, (tx, ty) => mix(mix(c, '#fff', 0.15), mix(c, '#000', 0.35), clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    [-1, 1].forEach(s => ell(put, S * x + s * S * 0.035, S * 0.375, S * 0.016, S * 0.016, () => mix(c, '#000', 0.2)));
    optic(put, S * x - S * 0.015, S * 0.415, S * 0.007, C.oil, C.oil, '#ffffff');
    optic(put, S * x + S * 0.015, S * 0.415, S * 0.007, C.oil, C.oil, '#ffffff');
  });
  stroke(put, S * 0.6, S * 0.3, S * 0.6, S * 0.36, 1.2, () => C.creamDk); put(Math.round(S * 0.6), Math.round(S * 0.37), C.ironLt); // empty hook
  // shelf of small prizes
  row(put, Math.round(S * 0.62), S * 0.26, S * 0.74, () => C.woodDkk);
  [[0.34, C.glow], [0.46, C.red], [0.58, C.violet], [0.68, C.teal]].forEach(([x, c]) => ell(put, S * x, S * 0.585, S * 0.025, S * 0.03, (tx, ty) => mix(mix(c, '#fff', 0.2), mix(c, '#000', 0.3), tx + ty * 0.3)));
}

// 17 · DUNK TANK — water tank, target arm, something IN the water.
function drawDunk(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  // tank
  plate(put, S * 0.28, S * 0.46, S * 0.72, S * 0.82, C.tealDk, C.teal, C.oil);
  // water with ripples + eyes peeking
  for (let y = S * 0.5; y < S * 0.78; y++) row(put, Math.round(y), S * 0.31, S * 0.69, (tx) => {
    const w = Math.sin(tx * 14 + y * 0.3);
    return mix('#1c4a74', '#0e2440', clamp(0.5 + w * 0.3, 0, 1));
  });
  optic(put, S * 0.45, S * 0.56, S * 0.013, C.oil, C.oil, C.glow);
  optic(put, S * 0.55, S * 0.56, S * 0.013, C.oil, C.oil, C.glow);
  // seat plank above (empty, swinging)
  stroke(put, S * 0.5, S * 0.3, S * 0.5, S * 0.4, 1.6, () => C.ironDk);
  plate(put, S * 0.4, S * 0.4, S * 0.6, S * 0.44, C.wood, C.woodLt, C.woodDkk);
  // target arm + bullseye
  stroke(put, S * 0.72, S * 0.5, S * 0.88, S * 0.42, 2.4, () => C.iron);
  [[0.05, C.red], [0.032, C.cream], [0.015, C.red]].forEach(([r, c]) => ell(put, S * 0.88, S * 0.4, S * r, S * r, () => c));
}

// 18 · SIDESHOW POSTERS — leaning board of faded acts.
function drawPosters(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  plate(put, S * 0.2, S * 0.24, S * 0.8, S * 0.84, C.woodDk, C.wood, C.woodDkk);
  // three posters
  [[0.26, 0.3, C.cream, C.red], [0.45, 0.28, '#d8d2c0', C.violet], [0.63, 0.32, C.cream, C.teal]].forEach(([x, y, paper, ink], i) => {
    plate(put, S * x, S * y, S * (x + 0.15), S * (y + 0.4), mix(paper, '#000', 0.12), paper, mix(paper, '#000', 0.4));
    // peeling corner
    stroke(put, S * (x + 0.15), S * (y + 0.4), S * (x + 0.11), S * (y + 0.35), 1.6, () => mix(paper, '#000', 0.3));
    // act image hint
    if (i === 0) { optic(put, S * (x + 0.075), S * (y + 0.14), S * 0.02, C.oil, C.oil, ink); grin(put, S * (x + 0.075), S * (y + 0.22), S * 0.03, false, ink, false); }
    if (i === 1) { stroke(put, S * (x + 0.04), S * (y + 0.3), S * (x + 0.11), S * (y + 0.08), 2, () => ink); } // strongman pose line
    if (i === 2) { for (let a = 0; a < 6; a += 0.4) put(Math.round(S * (x + 0.075) + Math.cos(a) * S * 0.03), Math.round(S * (y + 0.16) + Math.sin(a) * S * 0.03), ink); }
    // title bars
    row(put, Math.round(S * (y + 0.05)), S * (x + 0.02), S * (x + 0.13), () => ink);
  });
}

// 19 · CALLIOPE ORGAN — steam organ wagon, pipes exhaling.
function drawCalliope(put, S) {
  shadow(put, S, S * 0.5, S * 0.3);
  // wagon body — carved red and gold
  plate(put, S * 0.24, S * 0.44, S * 0.76, S * 0.78, C.red, C.redLt, C.redDkk);
  plate(put, S * 0.28, S * 0.48, S * 0.72, S * 0.6, C.glowDk, C.glow, C.woodDkk);
  // keyboard — playing itself
  row(put, Math.round(S * 0.66), S * 0.3, S * 0.7, () => C.white);
  [0.34, 0.42, 0.5, 0.58, 0.66].forEach((x, i) => stroke(put, S * x, S * 0.66, S * x, S * (i % 2 ? 0.68 : 0.64), 2, () => C.oil));
  // pipes ascending
  [[0.32, 0.16], [0.41, 0.1], [0.5, 0.06], [0.59, 0.1], [0.68, 0.16]].forEach(([x, top]) => {
    for (let y = S * top; y < S * 0.46; y++) row(put, Math.round(y), S * x - S * 0.025, S * x + S * 0.025, (tx) => mix(C.glowLt, C.glowDk, clamp(tx * 1.3, 0, 1)));
    ell(put, S * x, S * top, S * 0.025, S * 0.012, () => C.oil);
    // steam puff
    put(Math.round(S * x), Math.round(S * (top - 0.04)), C.tealLt); put(Math.round(S * x + 2), Math.round(S * (top - 0.06)), C.tealLt);
  });
  // wheels
  [0.34, 0.66].forEach(x => { for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * x + Math.cos(a) * S * 0.06), Math.round(S * 0.82 + Math.sin(a) * S * 0.06), C.glowDk); });
}

// 20 · TILTED TEACUP — spinner ride cup, dumped over.
function drawTeacup(put, S) {
  shadow(put, S, S * 0.5, S * 0.32);
  // round ride base plate
  ell(put, S * 0.5, S * 0.78, S * 0.32, S * 0.08, (tx, ty) => mix(C.violet, C.violetDk, clamp(tx * 0.6 + ty, 0, 1)));
  // big teacup tipped on its side
  for (let y = S * 0.4; y < S * 0.68; y++) {
    const t = (y - S * 0.4) / (S * 0.28);
    const w = S * (0.22 - t * 0.1);
    row(put, Math.round(y), S * 0.46 - w, S * 0.46 + w, (tx) => {
      const band = Math.floor((tx * 2 + t) * 3);
      return mix(band % 2 ? C.teal : C.cream, band % 2 ? C.tealDk : C.creamDk, tx * 0.6 + t * 0.3);
    });
  }
  // rim (tilted ellipse) + dark inside
  ell(put, S * 0.46, S * 0.42, S * 0.22, S * 0.05, (tx, ty) => mix(C.cream, C.creamDk, ty));
  ell(put, S * 0.46, S * 0.43, S * 0.18, S * 0.035, () => C.oil);
  // handle
  for (let a = -1.3; a < 1.3; a += 0.05) put(Math.round(S * 0.72 + Math.cos(a) * S * 0.06), Math.round(S * 0.52 + Math.sin(a) * S * 0.08), C.tealDk);
  // painted swirl + glow eyes peeking from inside
  for (let a = 0; a < 7; a += 0.15) { const r = a * S * 0.006; put(Math.round(S * 0.42 + Math.cos(a) * r), Math.round(S * 0.56 + Math.sin(a) * r * 0.7), C.pink); }
  optic(put, S * 0.42, S * 0.43, S * 0.011, C.oil, C.oil, C.glow);
  optic(put, S * 0.5, S * 0.435, S * 0.011, C.oil, C.oil, C.glow);
}

const LIST = [
  { n: 1, name: 'THE BIG TOP', role: 'striped tent', draw: drawBigTop },
  { n: 2, name: 'TICKET BOOTH', role: 'entry kiosk', draw: drawTicketBooth },
  { n: 3, name: 'DEAD CAROUSEL', role: 'frozen ride', draw: drawCarousel },
  { n: 4, name: 'RUSTED FERRIS', role: 'skyline wheel', draw: drawFerrisProp },
  { n: 5, name: 'BOTTLE BOOTH', role: 'game stand', draw: drawBottleBooth },
  { n: 6, name: 'DART WALL', role: 'game stand', draw: drawDartWall },
  { n: 7, name: 'HIGH STRIKER', role: 'strength tower', draw: drawStriker },
  { n: 8, name: 'POPCORN CART', role: 'lit wagon', draw: drawPopcornCart },
  { n: 9, name: 'CANDY STAND', role: 'pink stall', draw: drawCandyStand },
  { n: 10, name: 'FORTUNE WAGON', role: 'seer trailer', draw: drawWagon },
  { n: 11, name: 'HALL OF MIRRORS', role: 'maze entry', draw: drawMirrors },
  { n: 12, name: 'FUNHOUSE MOUTH', role: 'clown doorway', draw: drawFunhouse },
  { n: 13, name: 'BUNTING POLES', role: 'flag line', draw: drawBunting },
  { n: 14, name: 'STRING LIGHTS', role: 'half-dead bulbs', draw: drawLights },
  { n: 15, name: 'CAGE WAGON', role: 'bars bent OUT', draw: drawCage },
  { n: 16, name: 'PRIZE WALL', role: 'hanging teddies', draw: drawPrizes },
  { n: 17, name: 'DUNK TANK', role: 'something inside', draw: drawDunk },
  { n: 18, name: 'SIDESHOW POSTERS', role: 'faded acts', draw: drawPosters },
  { n: 19, name: 'CALLIOPE ORGAN', role: 'plays itself', draw: drawCalliope },
  { n: 20, name: 'TILTED TEACUP', role: 'dumped ride cup', draw: drawTeacup },
];

renderSheet({ list: LIST, out: process.argv[2] || 'carnival_decor_options.png', title: 'HAUNTED CARNIVAL — DECORATION CANDIDATES (use at will or pick favorites)', S: 160 });
