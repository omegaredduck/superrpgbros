// artdev/prehistoria/render_prehistoria_decor.js — PREHISTORIA decor
// sheet: 20 candidates. Primordial jungle, tar, volcano omens — no
// modern anything, no tribes (dinos-only world per Red).
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, plate, dome, shadow, renderSheet, fern, floor } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// 1 GIANT FERN CLUSTER
function dFerns(put, S) {
  const X = U(S); floor(put, S, 61); shadow(put, X(80), X(124), X(30), X(5));
  fern(put, X(80), X(110), X(38), P.fern, P.fernLt);
  fern(put, X(52), X(116), X(26), mix(P.fern, P.jungleDk, 0.3), P.fern);
  fern(put, X(110), X(114), X(28), mix(P.fern, P.jungleDk, 0.2), P.fernLt);
  // fiddleheads
  [[44, 100], [118, 96]].forEach(([fx, fy]) => { for (let a = 0; a < 4.6; a += 0.3) put(Math.round(X(fx + Math.cos(a) * (4 - a * 0.5))), Math.round(X(fy + Math.sin(a) * (4 - a * 0.5))), P.fernLt); });
}

// 2 CYCAD PALM
function dCycad(put, S) {
  const X = U(S); floor(put, S, 62); shadow(put, X(80), X(126), X(24), X(5));
  // pineapple trunk
  for (let y = 78; y <= 122; y++) { const t = (y - 78) / 44, w = 10 - t * 2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((y % 6) < 3 ? 0.2 : 0), 0, 1))); }
  for (let y = 82; y <= 118; y += 6) for (let x = -8; x <= 8; x += 4) put(Math.round(X(80 + x + ((y / 6) % 2) * 2)), Math.round(X(y)), P.mudDk); // diamond scars
  // frond crown
  for (let a = -2.9; a <= -0.2; a += 0.22) {
    let px2 = 80, py2 = 78;
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const nx = 80 + Math.cos(a) * t * 42, ny = 78 + Math.sin(a) * t * 26 + t * t * 14;
      stroke(put, X(px2), X(py2), X(nx), X(ny), X(2.2 * (1 - t * 0.5)), () => mix(P.fernLt, P.jungleDk, t * 0.6));
      if (i > 2) { stroke(put, X(nx), X(ny), X(nx - 2), X(ny - 3), X(0.8), () => P.fern); stroke(put, X(nx), X(ny), X(nx + 1), X(ny - 3.4), X(0.8), () => P.fern); }
      px2 = nx; py2 = ny;
    }
  }
}

// 3 CANOPY TREE
function dCanopy(put, S) {
  const X = U(S); floor(put, S, 63); shadow(put, X(80), X(128), X(30), X(5));
  stroke(put, X(80), X(126), X(78), X(70), X(7), () => P.mud);
  stroke(put, X(78), X(88), X(62), X(72), X(3.4), () => P.mudDk);
  stroke(put, X(79), X(80), X(96), X(66), X(3.4), () => P.mudDk);
  // umbrella canopy layers
  [[80, 52, 44, 14], [64, 44, 26, 10], [98, 46, 24, 9], [80, 36, 22, 8]].forEach(([cx2, cy2, cw, ch]) => {
    ell(put, X(cx2), X(cy2), X(cw), X(ch), (tx, ty) => mix(P.jungleLt, P.jungleDk, clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)));
    for (let k = 0; k < 7; k++) put(Math.round(X(cx2 - cw * 0.7 + k * cw * 0.23)), Math.round(X(cy2 - ch * 0.4 + (k % 3))), P.fernLt);
  });
  // hanging vines
  [[52, 58, 20], [104, 56, 24], [86, 60, 16]].forEach(([vx, vy, ln]) => { for (let i = 0; i <= ln; i++) put(Math.round(X(vx + Math.sin(i * 0.4) * 1.4)), Math.round(X(vy + i)), mix(P.fern, P.jungleDk, 0.3)); });
}

// 4 TAR PIT
function dTar(put, S) {
  const X = U(S); floor(put, S, 64);
  ell(put, X(80), X(102), X(42), X(17), (tx, ty) => mix(P.tarLt, P.tar, clamp(tx * 0.9 + ty * 0.7, 0, 1)));
  ell(put, X(64), X(94), X(11), X(4), () => P.tarGloss);
  for (let a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 43)), Math.round(X(102 + Math.sin(a) * 18)), mix(P.mud, P.mudDk, (Math.sin(a * 4) + 1) / 2));
  // bubbles
  [[68, 106], [94, 108], [82, 98]].forEach(([bx, by]) => { for (let a = 0; a < 6.28; a += 0.5) put(Math.round(X(bx + Math.cos(a) * 3)), Math.round(X(by + Math.sin(a) * 1.8)), P.tarGloss); });
  // half-sunk ribcage + one desperate horn
  for (let k = 0; k < 4; k++) { const rx = 92 + k * 5; for (let a = 3.4; a <= 5.4; a += 0.1) put(Math.round(X(rx + Math.cos(a) * 8)), Math.round(X(102 + Math.sin(a) * 9)), mix(P.bone, P.boneDk, k * 0.15)); }
  stroke(put, X(58), X(100), X(54), X(90), X(2.4), () => P.horn);
  // warning: sinking trike skull
  ell(put, X(46), X(104), X(5), X(3.4), (tx, ty) => mix(P.bone, P.boneDk, tx)); put(Math.round(X(45)), Math.round(X(103)), P.night);
}

// 5 VOLCANIC VENT
function dVent(put, S) {
  const X = U(S); floor(put, S, 65);
  // fissure crack
  let vx = 40, vy = 118;
  [[18, -6], [14, -2], [20, 4], [16, -4], [18, 2]].forEach(([dx, dy]) => { stroke(put, X(vx), X(vy), X(vx + dx), X(vy + dy), X(3), () => P.night); stroke(put, X(vx + 1), X(vy + 1), X(vx + dx), X(vy + dy + 1), X(1.4), () => P.volcano); vx += dx; vy += dy; });
  // glow along the crack
  for (let i = 0; i <= 20; i++) put(Math.round(X(42 + i * 4)), Math.round(X(117 + Math.sin(i) * 3)), mix(P.volcano, '#ffd24a', (i % 3) / 3));
  // smoke columns
  [[60, 108], [96, 104]].forEach(([sx2, sy2]) => {
    for (let i = 0; i <= 12; i++) { const t = i / 12; ell(put, X(sx2 + Math.sin(t * 5) * 4), X(sy2 - t * 60), X(3 + t * 7), X(2.4 + t * 4), (tx, ty) => mix('#6a6266', '#2e2a2c', clamp(0.3 + t * 0.5 + tx * 0.2, 0, 1))); }
  });
  // ember sparks
  [[70, 60], [88, 44], [58, 36]].forEach(([ex, ey]) => put(Math.round(X(ex)), Math.round(X(ey)), P.volcano));
  // scorched rocks
  [[38, 124, 6], [116, 120, 8]].forEach(([rx, ry, rr]) => ell(put, X(rx), X(ry), X(rr), X(rr * 0.6), (tx, ty) => mix('#4a4246', '#221e20', tx + ty * 0.4)));
}

// 6 GIANT NEST
function dNest(put, S) {
  const X = U(S); floor(put, S, 66); shadow(put, X(80), X(122), X(34), X(5));
  // mounded twig ring
  for (let a = 0; a < 6.28; a += 0.04) {
    const rr = 30 + Math.sin(a * 7) * 2;
    for (let w = 0; w < 7; w++) put(Math.round(X(80 + Math.cos(a) * (rr - w))), Math.round(X(104 + Math.sin(a) * (rr - w) * 0.45 - w * 0.8)), mix(P.mudLt, P.mudDk, (w / 7) * 0.7 + (Math.sin(a * 13) + 1) / 6));
  }
  // straw ticks
  for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; stroke(put, X(80 + Math.cos(a) * 28), X(104 + Math.sin(a) * 12), X(80 + Math.cos(a) * 34), X(104 + Math.sin(a) * 15), X(1), () => P.belly); }
  // eggs
  [[68, 98, 7, 9], [82, 96, 7.4, 9.4], [94, 100, 6.4, 8.4]].forEach(([ex, ey, ew, eh]) => {
    ell(put, X(ex), X(ey), X(ew), X(eh), (tx, ty) => mix(P.white, P.bellyDk, clamp(tx + ty * 0.4 - 0.25, 0, 1)));
    put(Math.round(X(ex - 2)), Math.round(X(ey - 2)), P.bellyDk); put(Math.round(X(ex + 2)), Math.round(X(ey + 3)), P.bellyDk);
  });
  // one hatching — crack + peeking snout
  stroke(put, X(90), X(94), X(96), X(97), X(0.9), () => P.mudDk);
  stroke(put, X(96), X(97), X(93), X(100), X(0.9), () => P.mudDk);
}

// 7 TITAN RIBCAGE
function dRibcage(put, S) {
  const X = U(S); floor(put, S, 67); shadow(put, X(80), X(126), X(44), X(5));
  // spine beam
  stroke(put, X(18), X(74), X(142), X(82), X(4), () => P.bone);
  [[24], [40], [56], [72], [88], [104], [120]].forEach(([bx], i) => {
    // each rib: big arc down into the ground
    for (let a = -1.5; a <= 0.2; a += 0.04) {
      const rx = bx + Math.cos(a) * (26 - i * 1.2) * 0.5 + 6, ry = 78 + (i % 2) + Math.sin(a) * -(30 - i * 1.4);
      put(Math.round(X(rx)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6));
      put(Math.round(X(rx + 1)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6 + 0.2));
    }
  });
  // skull at the end, half buried
  ell(put, X(146), X(94), X(11), X(8), (tx, ty) => mix(P.bone, P.boneDk, clamp(tx + ty * 0.5 - 0.2, 0, 1)));
  ell(put, X(143), X(92), X(2.6), X(3), () => P.night);
  row(put, Math.round(X(99)), X(140), X(156), () => P.boneDk);
  // vines reclaiming it
  [[40, 48], [88, 46]].forEach(([vx, vy]) => { for (let i = 0; i <= 10; i++) put(Math.round(X(vx + Math.sin(i * 0.5) * 2)), Math.round(X(vy + i * 2)), P.fern); });
}

// 8 AMBER BOULDER
function dAmber(put, S) {
  const X = U(S); floor(put, S, 68); shadow(put, X(80), X(122), X(24), X(5));
  // glowing amber mass on a rock base
  ell(put, X(80), X(116), X(26), X(8), (tx, ty) => mix('#5a5246', '#2a2620', tx + ty * 0.4));
  for (let y = 66; y <= 112; y++) {
    const t = (y - 66) / 46;
    const w = 20 * Math.sin(t * 2.6 + 0.3) + 2;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(P.amberLt, mix(P.amber, '#8a5410', 0.5), clamp(Math.abs(tx - 0.35) * 1.3 + t * 0.3, 0, 1)));
  }
  ell(put, X(70), X(78), X(6), X(9), () => mix(P.amberLt, P.white, 0.4)); // glow window
  // THE BUG inside (big beetle silhouette)
  ell(put, X(84), X(92), X(6), X(4.4), () => '#3a2a10');
  stroke(put, X(78), X(90), X(74), X(86), X(1), () => '#3a2a10');
  stroke(put, X(78), X(94), X(73), X(96), X(1), () => '#3a2a10');
  stroke(put, X(90), X(90), X(95), X(86), X(1), () => '#3a2a10');
  // inner light rays
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; stroke(put, X(80 + Math.cos(a) * 10), X(88 + Math.sin(a) * 12), X(80 + Math.cos(a) * 16), X(88 + Math.sin(a) * 18), X(0.8), () => mix(P.amberLt, P.amber, 0.4)); }
}

// 9 MOSSY BOULDERS
function dBoulders(put, S) {
  const X = U(S); floor(put, S, 69); shadow(put, X(80), X(126), X(40), X(6));
  [[56, 100, 24, 18], [96, 106, 20, 14], [124, 98, 12, 10], [36, 112, 12, 8]].forEach(([bx, by, bw, bh]) => {
    ell(put, X(bx), X(by), X(bw), X(bh), (tx, ty) => mix('#8a8276', '#423e36', clamp(tx * 1.05 + ty * 0.6 - 0.2, 0, 1)));
    // moss cap
    for (let mx = -bw * 0.8; mx <= bw * 0.8; mx += 2) { const my = by - bh * Math.sqrt(Math.max(0, 1 - (mx / bw) ** 2)) + 1; put(Math.round(X(bx + mx)), Math.round(X(my)), mix(P.fernLt, P.fern, (Math.abs(mx) / bw))); put(Math.round(X(bx + mx)), Math.round(X(my + 1)), P.fern); }
    stroke(put, X(bx - bw * 0.3), X(by - 2), X(bx - bw * 0.1), X(by + bh * 0.4), X(0.9), () => '#423e36'); // crack
  });
  fern(put, X(140), X(120), X(10));
}

// 10 HORSETAIL REEDS
function dReeds(put, S) {
  const X = U(S); floor(put, S, 70);
  // waterline
  for (let x = 0; x < S; x++) { const yy = 0.82 * S + Math.sin(x / S * 6) * 1.4; for (let y = yy; y < Math.min(S, yy + 0.1 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.4 + (y - yy) / (0.1 * S) * 0.4)); }
  // segmented reeds
  [[40, 44, 1], [56, 30, 1.2], [72, 38, 1.1], [88, 26, 1.3], [104, 40, 1], [120, 34, 1.15]].forEach(([rx, topY, w]) => {
    for (let y = topY; y <= 128; y += 5) {
      stroke(put, X(rx + Math.sin(y * 0.05) * 2), X(y), X(rx + Math.sin((y + 5) * 0.05) * 2), X(Math.min(128, y + 5)), X(2 * w), () => mix('#6a9a4a', '#2e4a1e', (y % 10) < 5 ? 0.2 : 0.45));
      put(Math.round(X(rx + Math.sin(y * 0.05) * 2 - 2 * w)), Math.round(X(y)), '#8ac86a'); // node ring
    }
    // cone tip
    for (let i = 0; i <= 4; i++) row(put, Math.round(X(topY - 5 + i)), X(rx - i * 0.6), X(rx + i * 0.6), () => mix('#a8843a', '#6a5018', i / 5));
  });
}

// 11 HOLLOW LOG
function dLog(put, S) {
  const X = U(S); floor(put, S, 71); shadow(put, X(80), X(124), X(44), X(6));
  // fallen trunk w/ hollow end
  for (let x = 28; x <= 132; x++) {
    const t = (x - 28) / 104;
    for (let y = 92 - 14 + Math.sin(t * 8) * 1; y <= 92 + 14; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.mudLt, P.mudDk, clamp((y - 78) / 28 * 1.1 + ((x % 9) < 1 ? 0.2 : 0), 0, 1)));
  }
  // hollow mouth (dark ellipse) + rings on the cut end
  ell(put, X(30), X(92), X(7), X(13), (tx, ty) => mix('#1c1208', '#0a0602', tx));
  for (let rr = 3; rr <= 12; rr += 3) { for (let a = 0; a < 6.28; a += 0.1) put(Math.round(X(132 + Math.cos(a) * rr * 0.5)), Math.round(X(92 + Math.sin(a) * rr)), mix(P.belly, P.mudDk, rr / 14)); }
  // broken branch stubs + moss + tiny eyes inside the hollow
  stroke(put, X(60), X(78), X(56), X(66), X(3.4), () => P.mudDk);
  stroke(put, X(100), X(78), X(106), X(70), X(3), () => P.mudDk);
  for (let mx = 40; mx <= 90; mx += 6) put(Math.round(X(mx)), Math.round(X(79 + (mx % 3))), P.fern);
  put(Math.round(X(28)), Math.round(X(90)), P.eye); put(Math.round(X(32)), Math.round(X(90)), P.eye);
}

// 12 TERMITE SPIRE
function dTermite(put, S) {
  const X = U(S); floor(put, S, 72); shadow(put, X(80), X(128), X(26), X(5));
  // gnarled mud towers
  [[80, 30, 14], [62, 62, 9], [98, 58, 8]].forEach(([tx2, topY, w]) => {
    for (let y = topY; y <= 124; y++) {
      const t = (y - topY) / (124 - topY);
      const ww = w * (0.4 + t * 0.8) + Math.sin(y * 0.4) * 1.4;
      row(put, Math.round(X(y)), X(tx2 - ww), X(tx2 + ww), (tx) => mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((y % 7) < 2 ? 0.18 : 0), 0, 1)));
    }
  });
  // entrance holes
  [[76, 70], [86, 92], [70, 104], [92, 112], [80, 48]].forEach(([hx, hy]) => ell(put, X(hx), X(hy), X(2.4), X(3), () => '#1c1208'));
  // termite specks trail
  for (let i = 0; i <= 12; i++) put(Math.round(X(96 + i * 3)), Math.round(X(120 + Math.sin(i) * 2)), '#c8b490');
}

// 13 GINKGO TREE
function dGinkgo(put, S) {
  const X = U(S); floor(put, S, 73); shadow(put, X(80), X(128), X(28), X(5));
  stroke(put, X(80), X(126), X(82), X(66), X(6), () => '#6a5a3a');
  stroke(put, X(81), X(90), X(64), X(74), X(3), () => '#5a4a2e');
  stroke(put, X(82), X(78), X(100), X(64), X(3), () => '#5a4a2e');
  // golden fan canopy
  [[80, 48, 36, 13], [62, 56, 20, 9], [102, 54, 20, 9]].forEach(([cx2, cy2, cw, ch]) => {
    ell(put, X(cx2), X(cy2), X(cw), X(ch), (tx, ty) => mix('#e8c848', '#8a6a14', clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)));
  });
  // fan-leaf ticks
  for (let k = 0; k < 12; k++) { const lx = 52 + (k * 41) % 58, ly = 42 + (k * 23) % 20; stroke(put, X(lx), X(ly), X(lx - 2), X(ly - 3), X(1), () => '#ffe89a'); stroke(put, X(lx), X(ly), X(lx + 2), X(ly - 3), X(1), () => '#ffe89a'); }
  // falling golden leaves
  [[46, 84], [116, 78], [98, 100], [60, 106]].forEach(([fx, fy]) => { put(Math.round(X(fx)), Math.round(X(fy)), '#ffd868'); put(Math.round(X(fx + 1)), Math.round(X(fy + 1)), '#c8a030'); });
}

// 14 SKULL ROCK
function dSkullRock(put, S) {
  const X = U(S); floor(put, S, 74); shadow(put, X(80), X(130), X(40), X(6));
  // giant weathered rex skull as terrain
  for (let y = 52; y <= 124; y++) {
    const t = (y - 52) / 72;
    const w = 36 * (1 - Math.abs(t - 0.35) * 0.8) + 6;
    row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix('#b0a890', '#4a4436', clamp(tx * 1.15 + t * 0.3, 0, 1)));
  }
  // eye socket caves (dark, one glows faintly — something lives there)
  ell(put, X(62), X(76), X(9), X(11), () => '#0e0c06');
  ell(put, X(94), X(76), X(9), X(11), () => '#0e0c06');
  put(Math.round(X(94)), Math.round(X(78)), P.eye);
  // nasal opening + tooth row base
  ell(put, X(78), X(96), X(6), X(8), () => '#1c1810');
  for (let tx2 = 48; tx2 <= 108; tx2 += 8) { for (let i = 0; i <= 6; i++) row(put, Math.round(X(118 + i)), X(tx2 - (3 - i * 0.4)), X(tx2 + (3 - i * 0.4)), () => mix(P.bone, P.boneDk, i / 7)); }
  // weather cracks + vines
  stroke(put, X(70), X(56), X(76), X(70), X(1), () => '#4a4436');
  stroke(put, X(96), X(60), X(90), X(72), X(1), () => '#4a4436');
  for (let i = 0; i <= 12; i++) put(Math.round(X(48 + Math.sin(i * 0.5) * 2)), Math.round(X(60 + i * 3)), P.fern);
}

// 15 GEYSER SPRING
function dGeyser(put, S) {
  const X = U(S); floor(put, S, 75);
  // mineral terrace pools
  [[80, 112, 34, 10, '#7ac8c0'], [80, 100, 22, 6, '#9ae0d8'], [80, 92, 12, 4, '#c8f0ea']].forEach(([cx2, cy2, cw, ch, c]) => {
    ell(put, X(cx2), X(cy2), X(cw), X(ch), (tx, ty) => mix(c, '#2e5a54', clamp(tx + ty * 0.5 - 0.2, 0, 1)));
    for (let a = 0; a < 6.28; a += 0.08) put(Math.round(X(cx2 + Math.cos(a) * cw)), Math.round(X(cy2 + Math.sin(a) * ch)), mix('#d8d0b8', '#8a8268', (Math.sin(a * 5) + 1) / 2));
  });
  // eruption column + steam
  for (let i = 0; i <= 24; i++) { const t = i / 24; const w = 3 - t * 1 + Math.sin(t * 9) * 1; row(put, Math.round(X(88 - t * 62)), X(80 - w), X(80 + w), (tx) => mix('#e8f8f4', '#8ac8c0', clamp(tx + t * 0.3, 0, 1))); }
  [[70, 30], [92, 24], [80, 14]].forEach(([sx2, sy2]) => ell(put, X(sx2), X(sy2), X(7), X(4.4), (tx, ty) => mix('#d8e8e4', '#7a9a96', clamp(0.3 + tx * 0.3 + ty * 0.3, 0, 1))));
  // droplets
  [[64, 52], [96, 46], [58, 70]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), '#c8f0ea'));
}

// 16 ARAUCARIA CONIFER
function dConifer(put, S) {
  const X = U(S); floor(put, S, 76); shadow(put, X(80), X(130), X(22), X(4));
  stroke(put, X(80), X(128), X(80), X(30), X(4.4), () => '#5a4228');
  // whorled branch tiers, sparse and high (monkey puzzle)
  [[36, 26], [50, 22], [64, 18], [78, 14], [92, 10]].forEach(([ty2, ln]) => {
    [[-1], [1]].forEach(([sd]) => {
      let px2 = 80, py2 = ty2;
      for (let i = 1; i <= 6; i++) { const t = i / 6; const nx = 80 + sd * t * ln, ny = ty2 + Math.sin(t * 2.6) * 5; stroke(put, X(px2), X(py2), X(nx), X(ny), X(2 * (1 - t * 0.5)), () => mix(P.jungle, P.jungleDk, t * 0.4)); px2 = nx; py2 = ny; }
      // needle tufts at tip
      ell(put, X(px2), X(py2), X(4.4), X(3), (tx, ty) => mix(P.jungleLt, P.jungleDk, tx + ty * 0.4));
    });
  });
  ell(put, X(80), X(26), X(5), X(4), (tx, ty) => mix(P.jungleLt, P.jungleDk, ty)); // crown tuft
  // cones
  [[70, 40], [92, 52]].forEach(([cx2, cy2]) => ell(put, X(cx2), X(cy2), X(2.4), X(3.4), (tx, ty) => mix(P.mudLt, P.mudDk, tx + ty * 0.3)));
}

// 17 MUD WALLOW
function dWallow(put, S) {
  const X = U(S); floor(put, S, 77);
  // cracked dry rim
  ell(put, X(80), X(104), X(44), X(18), (tx, ty) => mix('#a89068', '#5a4a2e', clamp(tx * 0.9 + ty * 0.6, 0, 1)));
  [[52, 96, 62, 102], [98, 94, 108, 100], [64, 114, 74, 112], [96, 112, 104, 116]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0), X(x1), X(y1), X(0.9), () => '#42351c'));
  // wet center
  ell(put, X(80), X(104), X(26), X(10), (tx, ty) => mix(P.mudLt, P.mudDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(72), X(100), X(8), X(3), () => mix(P.mudLt, '#c8b490', 0.4)); // sheen
  // BIG footprints leading in (three-toed)
  [[34, 124, 0.9], [52, 116, 1], [70, 110, 1.1]].forEach(([fx, fy, sc]) => {
    [[-3, 0], [0, -2], [3, 0]].forEach(([ox, oy]) => ell(put, X(fx + ox * sc), X(fy + oy * sc), X(1.8 * sc), X(2.6 * sc), () => '#42351c'));
    ell(put, X(fx), X(fy + 3 * sc), X(2.6 * sc), X(2 * sc), () => '#42351c');
  });
  // shed skin scrap + wallow ripples
  stroke(put, X(96), X(98), X(106), X(96), X(2), () => P.dinoGDk);
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(X(84 + Math.cos(a) * 12)), Math.round(X(106 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, 0.5));
}

// 18 PRIMORDIAL BLOOM
function dBloom(put, S) {
  const X = U(S); floor(put, S, 78); shadow(put, X(80), X(126), X(22), X(4));
  stroke(put, X(80), X(124), X(78), X(84), X(3.4), () => '#3e6a2a');
  [[64, 104], [94, 100]].forEach(([lx, ly]) => { ell(put, X(lx), X(ly), X(9), X(4), (tx, ty) => mix(P.fernLt, P.fern, tx + ty * 0.3)); });
  // giant magnolia-ish flower
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * 6.28;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      ell(put, X(78 + Math.cos(a) * t * 22), X(74 + Math.sin(a) * t * 14 - t * 4), X(6 * (1 - t * 0.4)), X(4 * (1 - t * 0.4)), (tx, ty) => mix('#f0d8e8', '#b06a9a', clamp(t * 0.7 + tx * 0.3, 0, 1)));
    }
  }
  ell(put, X(78), X(70), X(7), X(5), (tx, ty) => mix(P.amberLt, P.amber, tx + ty * 0.4)); // center boss
  for (let a = 0; a < 6.28; a += 0.7) put(Math.round(X(78 + Math.cos(a) * 4)), Math.round(X(69 + Math.sin(a) * 2.6)), '#8a5410');
  // sweet drip + hovering pollinator dot
  stroke(put, X(84), X(78), X(85), X(86), X(1), () => mix(P.amberLt, P.white, 0.3));
  put(Math.round(X(98)), Math.round(X(58)), '#c8e8f0'); put(Math.round(X(100)), Math.round(X(57)), '#c8e8f0');
}

// 19 METEOR CRATER — the omen
function dCrater(put, S) {
  const X = U(S); floor(put, S, 79);
  // scorched crater bowl
  ell(put, X(80), X(106), X(38), X(15), (tx, ty) => mix('#3a3234', '#141012', clamp(Math.abs(tx - 0.5) * -1.4 + 1 + ty * 0.3, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.06) { const rr = 39 + Math.sin(a * 6) * 2; put(Math.round(X(80 + Math.cos(a) * rr)), Math.round(X(106 + Math.sin(a) * (rr * 0.42))), mix('#6a5a4a', '#2e2620', (Math.sin(a * 3) + 1) / 2)); }
  // the glowing rock itself
  ell(put, X(80), X(104), X(12), X(8), (tx, ty) => mix('#5a4a52', '#241e22', clamp(tx + ty * 0.5 - 0.2, 0, 1)));
  [[74, 100, 80, 106], [84, 100, 88, 106], [78, 108, 84, 104]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0), X(x1), X(y1), X(1), () => P.volcano));
  put(Math.round(X(78)), Math.round(X(103)), '#ffd24a');
  // smoke wisp + scattered ejecta
  for (let i = 0; i <= 10; i++) put(Math.round(X(84 + Math.sin(i * 0.6) * 3)), Math.round(X(94 - i * 4)), mix('#6a6266', P.night, 0.4 + i * 0.05));
  [[38, 92, 3], [122, 96, 4], [50, 124, 2.4], [114, 124, 3]].forEach(([rx, ry, rr]) => ell(put, X(rx), X(ry), X(rr), X(rr * 0.7), (tx, ty) => mix('#5a4a52', '#241e22', tx)));
  // MORE STREAKS IN THE SKY (the omen of the map cycle)
  [[30, 16, 44, 26], [104, 10, 116, 20], [70, 8, 78, 15]].forEach(([x0, y0, x1, y1]) => { stroke(put, X(x0), X(y0), X(x1), X(y1), X(1.4), () => P.volcano); put(Math.round(X(x1 + 1)), Math.round(X(y1 + 1)), '#ffd24a'); });
}

// 20 ROOST SPIRE
function dRoost(put, S) {
  const X = U(S); floor(put, S, 80); shadow(put, X(80), X(132), X(24), X(5));
  // sheer rock pillar
  for (let y = 28; y <= 128; y++) {
    const t = (y - 28) / 100;
    const w = 10 + t * 8 + Math.sin(y * 0.3) * 2;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#8a8276', '#3a362e', clamp(tx * 1.25 + ((y % 11) < 2 ? 0.2 : 0), 0, 1)));
  }
  // ledges
  [[64, 60], [96, 84], [68, 100]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + (lx < 80 ? -8 : 8)), X(ly + 2), X(2.4), () => '#5a544a'));
  // nest on top + sitting pterosaur silhouette
  for (let a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 13)), Math.round(X(26 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, (Math.sin(a * 9) + 1) / 2));
  ell(put, X(80), X(20), X(5), X(3.4), (tx, ty) => mix('#6a4a3a', '#2e1c14', ty)); // body
  stroke(put, X(84), X(18), X(92), X(12), X(1.8), () => '#2e1c14'); // folded wing
  stroke(put, X(76), X(18), X(70), X(13), X(1.6), () => '#2e1c14');
  stroke(put, X(78), X(15), X(72), X(11), X(1.2), () => '#4a3226'); // crest+beak
  // guano streaks (real roost energy)
  [[70, 34], [88, 40]].forEach(([gx, gy]) => stroke(put, X(gx), X(gy), X(gx + 1), X(gy + 12), X(1.6), () => mix(P.white, '#8a8268', 0.3)));
}

const LIST = [
  { n: 1, name: 'GIANT FERNS', role: 'jungle filler cluster', draw: dFerns },
  { n: 2, name: 'CYCAD PALM', role: 'pineapple trunk, frond crown', draw: dCycad },
  { n: 3, name: 'CANOPY TREE', role: 'umbrella layers, vines', draw: dCanopy },
  { n: 4, name: 'TAR PIT', role: 'bubbling, half-sunk bones', draw: dTar },
  { n: 5, name: 'VOLCANIC VENT', role: 'glowing fissure, smoke', draw: dVent },
  { n: 6, name: 'GIANT NEST', role: 'eggs, one hatching', draw: dNest },
  { n: 7, name: 'TITAN RIBCAGE', role: 'walk-through skeleton', draw: dRibcage },
  { n: 8, name: 'AMBER BOULDER', role: 'glowing, bug inside', draw: dAmber },
  { n: 9, name: 'MOSSY BOULDERS', role: 'rock cover cluster', draw: dBoulders },
  { n: 10, name: 'HORSETAIL REEDS', role: 'riverbank segmented reeds', draw: dReeds },
  { n: 11, name: 'HOLLOW LOG', role: 'something lives inside', draw: dLog },
  { n: 12, name: 'TERMITE SPIRE', role: 'mud towers', draw: dTermite },
  { n: 13, name: 'GINKGO TREE', role: 'golden fan leaves', draw: dGinkgo },
  { n: 14, name: 'SKULL ROCK', role: 'rex-skull landmark', draw: dSkullRock },
  { n: 15, name: 'GEYSER SPRING', role: 'terrace pools + eruption', draw: dGeyser },
  { n: 16, name: 'ARAUCARIA', role: 'tall whorled conifer', draw: dConifer },
  { n: 17, name: 'MUD WALLOW', role: 'cracked rim, footprints', draw: dWallow },
  { n: 18, name: 'PRIMORDIAL BLOOM', role: 'giant flower', draw: dBloom },
  { n: 19, name: 'METEOR CRATER', role: 'THE OMEN — streaks in the sky', draw: dCrater },
  { n: 20, name: 'ROOST SPIRE', role: 'pterosaur nest pillar', draw: dRoost },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'prehistoria_decor_options.png', title: 'PREHISTORIA — DECOR (20 candidates) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
