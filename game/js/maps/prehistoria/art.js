// ============================================================================
// game/js/maps/prehistoria/art.js — PREHISTORIA (realm 19) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: TAKE-2 real-anatomy dinos
// (#1 RAPTOR · #2 COMPY SWARM · #3 TRICERATOPS · #4 STEGOSAURUS · #5
// PTERODACTYL · #6 DILOPHOSAURUS · #20 BRACHIOSAURUS) + the 6 RECOLOR
// variants (ptero exempt) + THE PRIMORDIAL (dragon160 #10 final params + an
// IGNITED P2 state) + THE HATCH 4 entrance frames + 20 decor + 10 tiles.
// LOST-WORLD mood: fern jungle, tar + bone, an angry volcano sky.
// PORTING GOTCHA kept: body() fills step in DEVICE SPACE (moiré fix at S>160).
// Texture keys are ALL prefixed 'prehistoria*' / 'phtile*' — unique game-wide.
// HEX COLORS ARE 6-DIGIT (RANGER_ART.mix breaks on #abc).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- prehistoria palette (prehistoria_kit.js P, verbatim) -----------------
  var P = {
    OUT: '#0c0e08',
    jungle: '#2e4a20', jungleLt: '#4a7232', jungleDk: '#16260e',
    mud: '#4a3a24', mudLt: '#6e5838', mudDk: '#241a0e',
    tar: '#1a161c', tarLt: '#322c36', tarGloss: '#4a4452',
    ash: '#5a5254', volcano: '#c8452a',
    dinoG: '#5a7a34', dinoGLt: '#86ac54', dinoGDk: '#2c3e16',
    dinoO: '#c87a2e', dinoOLt: '#e8a858', dinoODk: '#6a3c10',
    dinoB: '#4a6a7a', dinoBLt: '#74a0b2', dinoBDk: '#243642',
    dinoR: '#a8442e', dinoRLt: '#d2724e', dinoRDk: '#541e10',
    belly: '#d8c898', bellyDk: '#a89468',
    fur: '#8a6a3e', furLt: '#b2905e', furDk: '#4a3618',
    bone: '#e2d8c0', boneDk: '#8a8268', horn: '#d8ccb0', hornDk: '#6a6048',
    claw: '#e8e0cc', tooth: '#f4eee0',
    amber: '#e8a83a', amberLt: '#ffd478',
    venom: '#8ae83a', venomDk: '#3a7a10',
    fern: '#3e7a2e', fernLt: '#6aac4e',
    skin: '#c89468', skinDk: '#8a5e38',
    night: '#10140a', white: '#f4f2ea', eye: '#e8c83a'
  };

  // ---- shared kit helpers (prehistoria_kit lineage) -------------------------
  function shadow(put, cx, cy, rx, ry) { ell(put, cx, cy, rx, ry, function () { return P.OUT; }); }
  function fern(put, cx, cy, s, c, cLt) {
    for (var a = -1.2; a <= 1.2; a += 0.4) {
      for (var i = 0; i <= 8; i++) {
        var t = i / 8;
        var fx = cx + Math.sin(a) * t * s, fy = cy - Math.cos(a * 0.6) * t * s + t * t * s * 0.25;
        put(Math.round(fx), Math.round(fy), mix(cLt || P.fernLt, c || P.fern, t));
        if (i % 2) { put(Math.round(fx - 1), Math.round(fy), c || P.fern); put(Math.round(fx + 1), Math.round(fy), c || P.fern); }
      }
    }
  }
  function floor(put, S, seed) {
    for (var i = 0; i < 6; i++) {
      var x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S, y = S * 0.86 + ((i * 683) % 1000) / 1000 * S * 0.1;
      put(Math.round(x), Math.round(y), mix(P.fern, P.night, 0.4 + (i % 3) * 0.15));
    }
    for (var j = 0; j < 4; j++) {
      var x2 = ((j * 379 + (seed || 0) * 97) % 1000) / 1000 * S;
      put(Math.round(x2), Math.round(S * 0.1 + (j * 53) % 40), mix('#c8d46a', P.night, 0.6));
    }
  }

  // ---- REAL DINO shape passes (render_dino_shapes.js) -----------------------
  function U(S) { var u = S / 160; return function (v) { return v * u; }; }
  function pw(x, pts) {
    for (var i = 0; i < pts.length - 1; i++) {
      var x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1];
      if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / Math.max(1, x1 - x0);
    }
    return null;
  }
  // fill a TOP/BOT profile with vertical shading — steps in DEVICE space (no gaps)
  function body(put, X, x0, x1, TOP, BOT, cLt, c, cDk) {
    var u = X(1) - X(0);
    var st = u > 1 ? 1 / u : 1;
    for (var x = x0; x <= x1; x += st) {
      var top = pw(x, TOP), bot = pw(x, BOT);
      if (top == null || bot == null || bot <= top) continue;
      for (var y = top; y <= bot; y += st) {
        var ty = (y - top) / Math.max(1, bot - top);
        var cc = mix(cLt, c, clamp(ty * 1.7, 0, 1));
        cc = mix(cc, cDk, clamp((ty - 0.55) * 1.8, 0, 1));
        put(Math.round(X(x)), Math.round(X(y)), cc);
      }
    }
  }
  function theroLeg(put, X, hx, hy, sc, cLt, c, cDk, far) {
    var K = far ? 0.82 : 1;
    var kx = hx + 9 * sc, ky = hy + 16 * sc;
    var ax = hx + 2 * sc, ay = hy + 30 * sc;
    var fx = hx + 10 * sc, fy = hy + 38 * sc;
    stroke(put, X(hx), X(hy), X(kx), X(ky), X(8 * sc * K), function () { return (far ? cDk : c); });
    stroke(put, X(kx), X(ky), X(ax), X(ay), X(4.4 * sc * K), function () { return (far ? cDk : mix(c, cDk, 0.35)); });
    stroke(put, X(ax), X(ay), X(fx), X(fy), X(3 * sc * K), function () { return (far ? cDk : mix(c, cDk, 0.5)); });
    for (var k = 0; k <= 2; k++) stroke(put, X(fx), X(fy), X(fx + (4 + k * 3) * sc), X(fy + 2 * sc), X(1.6 * sc), function () { return (far ? mix(P.claw, cDk, 0.5) : P.claw); });
    if (!far) { stroke(put, X(fx - 2 * sc), X(fy - 2 * sc), X(fx - 1 * sc), X(fy - 7 * sc), X(2 * sc), function () { return P.claw; }); }
  }
  var mp = function (pts, ox, oy, sc) { return pts.map(function (q) { return [ox + q[0] * sc, oy + q[1] * sc]; }); };

  // ================================ MOBS =====================================
  // 1 RAPTOR — deinonychus build, horizontal balance beam
  function raptor160(put, S) {
    var X = U(S); floor(put, S, 31); shadow(put, X(84), X(132), X(44), X(6));
    var cLt = P.dinoOLt, c = P.dinoO, cDk = P.dinoODk;
    theroLeg(put, X, 92, 90, 1.05, cLt, c, cDk, true);
    var TOP = [[4, 70], [30, 69], [56, 67], [76, 62], [92, 58], [104, 58], [114, 62], [120, 66]];
    var BOT = [[4, 74], [30, 76], [56, 80], [76, 88], [92, 96], [104, 96], [114, 90], [120, 84]];
    body(put, X, 4, 120, TOP, BOT, cLt, c, cDk);
    for (var x = 8; x <= 40; x += 4) stroke(put, X(x), X(pw(x, BOT)), X(x - 2), X(pw(x, BOT) + 4), X(1), function () { return mix(c, cDk, 0.5); });
    for (var x2 = 48; x2 <= 100; x2 += 10) { for (var i = 0; i <= 6; i++) put(Math.round(X(x2 - i * 0.4)), Math.round(X(pw(x2, TOP) + i)), cDk); }
    theroLeg(put, X, 96, 92, 1.1, cLt, c, cDk, false);
    stroke(put, X(112), X(76), X(122), X(84), X(3), function () { return c; });
    stroke(put, X(122), X(84), X(118), X(90), X(2), function () { return cDk; });
    for (var k = 0; k < 3; k++) stroke(put, X(114 + k * 3), X(80 + k * 2), X(111 + k * 3), X(86 + k * 2), X(1), function () { return mix(c, cDk, 0.5); });
    stroke(put, X(118), X(68), X(124), X(58), X(9), function () { return c; });
    stroke(put, X(124), X(58), X(131), X(50), X(7.4), function () { return mix(cLt, c, 0.4); });
    var HTOP = [[126, 42], [134, 40], [144, 42], [154, 46]];
    var HBOT = [[126, 52], [136, 52], [146, 50], [154, 48]];
    body(put, X, 126, 154, HTOP, HBOT, cLt, c, cDk);
    for (var xj = 136; xj <= 152; xj++) { var t = (xj - 136) / 16; for (var yj = 52 + t * 2; yj <= 56 + t * 1; yj++) put(Math.round(X(xj)), Math.round(X(yj)), mix(c, cDk, 0.5 + t * 0.3)); }
    row(put, Math.round(X(51.5)), X(138), X(153), function () { return P.night; });
    [[140], [145], [150]].forEach(function (q) { stroke(put, X(q[0]), X(51.5), X(q[0]), X(53.5), X(0.9), function () { return P.tooth; }); stroke(put, X(q[0] + 2), X(55), X(q[0] + 2), X(53.5), X(0.9), function () { return P.tooth; }); });
    put(Math.round(X(133)), Math.round(X(44)), P.eye); put(Math.round(X(133.8)), Math.round(X(44.4)), P.night);
    stroke(put, X(152), X(44), X(155), X(45), X(1), function () { return cDk; });
    for (var kc = 0; kc < 4; kc++) stroke(put, X(127 + kc * 2), X(41), X(125 + kc * 2), X(36), X(1), function () { return mix(c, cDk, 0.4); });
  }
  // small theropod — shared by the compy swarm
  function miniThero(put, X, ox, oy, sc, cLt, c, cDk, o) {
    o = o || {};
    var TOP = mp([[0, 10], [16, 9], [26, 6], [34, 4], [40, 6]], ox, oy, sc);
    var BOT = mp([[0, 12], [16, 13], [26, 16], [34, 18], [40, 15]], ox, oy, sc);
    theroLeg(put, X, ox + 27 * sc, oy + 15 * sc, sc * 0.42, cLt, c, cDk, true);
    body(put, X, TOP[0][0], TOP[TOP.length - 1][0], TOP, BOT, cLt, c, cDk);
    theroLeg(put, X, ox + 30 * sc, oy + 16 * sc, sc * 0.46, cLt, c, cDk, false);
    stroke(put, X(ox + 39 * sc), X(oy + 7 * sc), X(ox + 44 * sc), X(oy + (o.headUp ? -2 : 1) * sc), X(3 * sc), function () { return c; });
    var hy = oy + (o.headUp ? -4 : -1) * sc;
    ell(put, X(ox + 47 * sc), X(hy), X(4 * sc), X(2.6 * sc), function (tx, ty) { return mix(cLt, cDk, ty); });
    stroke(put, X(ox + 50 * sc), X(hy + 0.5 * sc), X(ox + 54 * sc), X(hy + sc), X(1.6 * sc), function () { return cDk; });
    put(Math.round(X(ox + 46 * sc)), Math.round(X(hy - sc)), o.eyeC || P.eye);
  }
  // 2 COMPY SWARM
  function drawCompies(put, S) {
    var X = U(S); floor(put, S, 42);
    shadow(put, X(60), X(96), X(20), X(3)); shadow(put, X(104), X(116), X(18), X(3)); shadow(put, X(44), X(126), X(16), X(3));
    miniThero(put, X, 34, 66, 0.9, P.dinoGLt, P.dinoG, P.dinoGDk, { headUp: true });
    miniThero(put, X, 80, 90, 0.75, mix(P.dinoGLt, P.dinoOLt, 0.4), mix(P.dinoG, P.dinoO, 0.4), P.dinoGDk, {});
    miniThero(put, X, 20, 100, 0.65, P.dinoGLt, P.dinoG, P.dinoGDk, { headUp: true });
    fern(put, X(136), X(120), X(11));
  }
  // 3 TRICERATOPS — the head is a third of the animal
  function trike160(put, S) {
    var X = U(S); floor(put, S, 32); shadow(put, X(78), X(134), X(52), X(7));
    var cLt = P.dinoBLt, c = P.dinoB, cDk = P.dinoBDk;
    stroke(put, X(52), X(100), X(48), X(128), X(8), function () { return cDk; });
    stroke(put, X(96), X(102), X(94), X(126), X(7), function () { return cDk; });
    var TOP = [[14, 92], [28, 78], [46, 66], [66, 62], [86, 64], [102, 70]];
    var BOT = [[14, 98], [28, 108], [46, 118], [66, 120], [86, 116], [102, 108]];
    body(put, X, 14, 102, TOP, BOT, cLt, c, cDk);
    [[36], [56], [76]].forEach(function (q) { for (var i = 0; i <= 8; i++) put(Math.round(X(q[0] + i * 0.2)), Math.round(X(pw(q[0], TOP) + 4 + i * 4)), mix(cDk, c, 0.4)); });
    stroke(put, X(60), X(104), X(58), X(132), X(9), function () { return c; });
    ell(put, X(58), X(133), X(6), X(3), function (tx, ty) { return mix(cLt, cDk, ty); }); [[54, 135], [58, 136], [62, 135]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), P.horn); });
    stroke(put, X(102), X(104), X(103), X(130), X(8), function () { return mix(c, cDk, 0.25); });
    ell(put, X(103), X(131), X(5.4), X(3), function (tx, ty) { return mix(cLt, cDk, ty); }); [[100, 133], [104, 134], [107, 132]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), P.horn); });
    var HTOP = [[108, 56], [122, 58], [136, 68], [148, 82]];
    var HBOT = [[108, 90], [124, 94], [140, 96], [148, 98]];
    body(put, X, 108, 148, HTOP, HBOT, cLt, c, cDk);
    for (var a = -0.5; a <= 2.5; a += 0.02) {
      var fr = 27 - Math.abs(Math.sin(a * 1.6)) * 3;
      var fx = 112 - Math.cos(a - 0.9) * fr * 0.8, fy = 60 - Math.sin(a - 0.9) * fr;
      stroke(put, X(112), X(62), X(fx), X(fy), X(1.8), (function (aa) { return function () { return mix(P.dinoRLt, P.dinoRDk, clamp(aa / 2.5 * 0.6 + 0.15, 0, 1)); }; })(a));
    }
    for (var a2 = -0.5; a2 <= 2.5; a2 += 0.3) { var fx2 = 112 - Math.cos(a2 - 0.9) * 22, fy2 = 60 - Math.sin(a2 - 0.9) * 27; ell(put, X(fx2), X(fy2), X(1.8), X(1.8), function () { return P.hornDk; }); }
    [[126, 60, 142, 32, 3.6, 0], [132, 62, 150, 40, 3, 0.15]].forEach(function (q) {
      var bx = q[0], by = q[1], tx2 = q[2], ty2 = q[3], w = q[4], fd = q[5], px2 = bx, py2 = by;
      for (var i = 1; i <= 12; i++) {
        var t = i / 12;
        var nx = bx + (tx2 - bx) * t + Math.sin(t * 1.8) * 3;
        var ny = by + (ty2 - by) * t;
        stroke(put, X(px2), X(py2), X(nx), X(ny), X(Math.max(1.2, w * (1 - t * 0.6))), (function (tt) { return function () { return mix(P.horn, P.hornDk, tt * 0.45 + fd); }; })(t));
        px2 = nx; py2 = ny;
      }
    });
    for (var xb = 146; xb <= 156; xb++) { var tb = (xb - 146) / 10; for (var yb = 86 + tb * 6; yb <= 98 - tb * 2; yb++) put(Math.round(X(xb)), Math.round(X(yb)), mix(P.horn, P.hornDk, tb)); }
    stroke(put, X(156), X(92), X(154), X(97), X(1.6), function () { return P.hornDk; });
    row(put, Math.round(X(94)), X(134), X(150), function () { return mix(cDk, P.night, 0.4); });
    stroke(put, X(142), X(80), X(146), X(70), X(2.6), function () { return P.horn; });
    ell(put, X(125), X(70), X(2), X(2.2), function () { return P.eye; }); put(Math.round(X(125.5)), Math.round(X(70.4)), P.night);
    var TT = [[2, 96], [14, 92]], TB = [[2, 100], [14, 98]];
    body(put, X, 2, 14, TT, TB, cLt, c, cDk);
  }
  // 4 STEGOSAURUS — tiny head, peaked hips, thagomizer
  function stego160(put, S) {
    var X = U(S); floor(put, S, 33); shadow(put, X(80), X(134), X(50), X(7));
    var cLt = P.dinoGLt, c = P.dinoG, cDk = P.dinoGDk;
    stroke(put, X(58), X(96), X(54), X(128), X(8), function () { return cDk; });
    stroke(put, X(106), X(102), X(104), X(126), X(6), function () { return cDk; });
    var TOP = [[18, 84], [34, 72], [52, 60], [68, 58], [88, 66], [106, 80], [122, 90]];
    var BOT = [[18, 92], [34, 102], [52, 112], [68, 114], [88, 112], [106, 106], [122, 100]];
    body(put, X, 18, 122, TOP, BOT, cLt, c, cDk);
    for (var x = 40; x <= 104; x++) put(Math.round(X(x)), Math.round(X(pw(x, BOT) - 1)), mix(P.belly, cDk, 0.35));
    stroke(put, X(64), X(100), X(62), X(132), X(9), function () { return c; });
    ell(put, X(62), X(133), X(5.4), X(2.6), function (tx, ty) { return mix(cLt, cDk, ty); });
    stroke(put, X(112), X(102), X(112), X(128), X(6.4), function () { return mix(c, cDk, 0.2); });
    ell(put, X(112), X(129), X(4.4), X(2.4), function (tx, ty) { return mix(cLt, cDk, ty); });
    var HTOP = [[122, 88], [134, 90], [146, 94]];
    var HBOT = [[122, 100], [134, 100], [146, 100]];
    body(put, X, 122, 146, HTOP, HBOT, cLt, c, cDk);
    stroke(put, X(146), X(97), X(151), X(98), X(2.4), function () { return P.hornDk; });
    put(Math.round(X(136)), Math.round(X(92)), P.eye); put(Math.round(X(136.8)), Math.round(X(92.4)), P.night);
    var plateAt = function (px2, h, dark) {
      var base = pw(px2, TOP); if (base == null) return;
      for (var i = 0; i <= h; i++) {
        var t = i / h, w = 6 * (1 - Math.abs(t - 0.35) * 1.4);
        if (w <= 0) continue;
        row(put, Math.round(X(base - i)), X(px2 - w), X(px2 + w), (function (tt) { return function (tx) { return mix(dark ? P.dinoR : P.dinoRLt, P.dinoRDk, clamp(tx + tt * 0.4, 0, 1)); }; })(t));
      }
    };
    [[26, 12], [42, 18], [58, 24], [74, 24], [92, 18], [108, 12]].forEach(function (q) { plateAt(q[0], q[1], false); });
    [[34, 14], [50, 21], [66, 25], [83, 21], [100, 14]].forEach(function (q) { plateAt(q[0], q[1], true); });
    var TT = [[2, 76], [18, 84]], TB = [[2, 84], [18, 92]];
    body(put, X, 2, 18, TT, TB, cLt, c, cDk);
    [[2, 62, 3], [10, 58, 3], [0, 74, 2.6], [8, 70, 2.6]].forEach(function (q) { stroke(put, X(q[0] + 4), X(80), X(q[0]), X(q[1]), X(q[2]), function () { return mix(P.horn, P.hornDk, 0.25); }); });
  }
  // 5 PTERANODON
  function drawPtero(put, S) {
    var X = U(S); floor(put, S, 45);
    ell(put, X(80), X(126), X(18), X(4), function () { return '#08090a'; });
    [[-1], [1]].forEach(function (q) {
      var sd = q[0];
      var shx = 80 + sd * 6, wrx = 80 + sd * 30, tipx = 80 + sd * 66;
      stroke(put, X(shx), X(58), X(wrx), X(44), X(2.6), function () { return P.furDk; });
      stroke(put, X(wrx), X(44), X(tipx), X(70), X(2), function () { return P.furDk; });
      for (var i = 0; i <= 14; i++) {
        var t = i / 14;
        var bx = shx + (wrx - shx) * t, by2 = 58 + (44 - 58) * t;
        stroke(put, X(80 + sd * 4), X(66), X(bx), X(by2), X(1.2), (function (tt) { return function () { return mix('#b06a4a', '#5a2e1a', 0.3 + tt * 0.3); }; })(t));
      }
      for (var i2 = 0; i2 <= 16; i2++) {
        var t2 = i2 / 16;
        var bx2 = wrx + (tipx - wrx) * t2, by3 = 44 + (70 - 44) * t2;
        stroke(put, X(80 + sd * (8 + t2 * 10)), X(66 + t2 * 4), X(bx2), X(by3), X(1.1), (function (tt) { return function () { return mix('#b06a4a', '#5a2e1a', 0.35 + tt * 0.35); }; })(t2));
      }
    });
    ell(put, X(80), X(64), X(7), X(9), function (tx, ty) { return mix('#d29a6e', '#6a3e22', clamp(tx + ty * 0.5 - 0.15, 0, 1)); });
    stroke(put, X(78), X(72), X(74), X(80), X(1.8), function () { return '#6a3e22'; });
    stroke(put, X(82), X(72), X(86), X(80), X(1.8), function () { return '#6a3e22'; });
    stroke(put, X(80), X(56), X(82), X(48), X(5), function () { return '#d29a6e'; });
    ell(put, X(84), X(44), X(6), X(4.4), function (tx, ty) { return mix('#e2b088', '#6a3e22', ty); });
    for (var ib = 0; ib <= 10; ib++) { var tbk = ib / 10; stroke(put, X(88 + tbk * 18), X(44 + tbk * 5), X(88 + tbk * 18), X(45 + tbk * 5), X(2.6 * (1 - tbk * 0.75)), (function (tt) { return function () { return mix('#e2b088', '#8a4e2a', tt * 0.5); }; })(tbk)); }
    var cx2 = 80, cy2 = 41;
    for (var ic = 1; ic <= 9; ic++) { var tc = ic / 9; var nx = 80 - tc * 22, ny = 41 - tc * 8; stroke(put, X(cx2), X(cy2), X(nx), X(ny), X(3.4 * (1 - tc * 0.7)), (function (tt) { return function () { return mix(P.dinoRLt, P.dinoRDk, tt * 0.4); }; })(tc)); cx2 = nx; cy2 = ny; }
    put(Math.round(X(82)), Math.round(X(42.5)), P.eye); put(Math.round(X(82.6)), Math.round(X(42.8)), P.night);
  }
  // 6 DILOPHOSAURUS — twin round crests
  function drawDilo(put, S) {
    var X = U(S); floor(put, S, 46); shadow(put, X(80), X(130), X(38), X(5));
    var cLt = P.dinoGLt, c = P.dinoG, cDk = P.dinoGDk;
    theroLeg(put, X, 86, 88, 1.0, cLt, c, cDk, true);
    var TOP = [[4, 66], [30, 65], [56, 62], [76, 58], [92, 56], [104, 58], [112, 62]];
    var BOT = [[4, 70], [30, 72], [56, 78], [76, 86], [92, 92], [104, 90], [112, 84]];
    body(put, X, 4, 112, TOP, BOT, cLt, c, cDk);
    theroLeg(put, X, 90, 90, 1.05, cLt, c, cDk, false);
    stroke(put, X(106), X(72), X(114), X(80), X(2.6), function () { return c; });
    stroke(put, X(110), X(64), X(118), X(48), X(7.4), function () { return c; });
    stroke(put, X(118), X(48), X(124), X(40), X(6), function () { return mix(cLt, c, 0.4); });
    var HTOP = [[120, 33], [130, 31], [142, 33], [150, 37]];
    var HBOT = [[120, 43], [132, 43], [144, 41], [150, 40]];
    body(put, X, 120, 150, HTOP, HBOT, cLt, c, cDk);
    stroke(put, X(144), X(37), X(147), X(39), X(1.4), function () { return cDk; });
    row(put, Math.round(X(42)), X(132), X(149), function () { return P.night; });
    [[136], [141], [146]].forEach(function (q) { stroke(put, X(q[0]), X(42), X(q[0]), X(44), X(0.8), function () { return P.tooth; }); });
    put(Math.round(X(127)), Math.round(X(35)), P.eye); put(Math.round(X(127.6)), Math.round(X(35.4)), P.night);
    [[0, P.dinoRLt, P.dinoRDk], [3, '#d2886e', '#6a2e1a']].forEach(function (q) {
      var off = q[0], c1 = q[1], c2 = q[2];
      for (var a = 0.2; a <= 2.9; a += 0.06) put(Math.round(X(129 + off + Math.cos(a) * -8)), Math.round(X(31 - Math.sin(a) * 9)), mix(c1, c2, Math.abs(a - 1.55) / 1.5));
      for (var a2 = 0.3; a2 <= 2.8; a2 += 0.1) put(Math.round(X(129 + off + Math.cos(a2) * -6)), Math.round(X(31 - Math.sin(a2) * 7)), mix(c1, c2, 0.5));
    });
  }
  // 20 BRACHIOSAURUS — the colossus
  function drawBrachio(put, S) {
    var X = U(S); floor(put, S, 60); shadow(put, X(72), X(140), X(48), X(6));
    var cLt = '#a8b284', c = '#6e7a50', cDk = '#323a1e';
    stroke(put, X(44), X(104), X(42), X(138), X(9), function () { return cDk; });
    stroke(put, X(92), X(100), X(94), X(136), X(10), function () { return cDk; });
    var TOP = [[16, 96], [36, 84], [60, 74], [84, 66], [102, 64]];
    var BOT = [[16, 102], [36, 112], [60, 120], [84, 118], [102, 108]];
    body(put, X, 16, 102, TOP, BOT, cLt, c, cDk);
    var TT = [[0, 92], [16, 96]], TB = [[0, 98], [16, 102]];
    body(put, X, 0, 16, TT, TB, cLt, c, cDk);
    stroke(put, X(52), X(106), X(50), X(140), X(10), function () { return c; });
    ell(put, X(50), X(141), X(6.4), X(3), function (tx, ty) { return mix(cLt, cDk, ty); });
    stroke(put, X(98), X(102), X(100), X(138), X(11), function () { return mix(c, cDk, 0.15); });
    ell(put, X(100), X(139), X(7), X(3), function (tx, ty) { return mix(cLt, cDk, ty); });
    var nx2 = 104, ny2 = 70;
    for (var i = 1; i <= 16; i++) {
      var t = i / 16;
      var nx = 104 + Math.sin(t * 1.2) * 28, ny = 70 - t * 52;
      stroke(put, X(nx2), X(ny2), X(nx), X(ny), X(Math.max(4, 11 * (1 - t * 0.55))), (function (tt) { return function () { return mix(c, cDk, tt * 0.25); }; })(t));
      nx2 = nx; ny2 = ny;
    }
    ell(put, X(nx2 + 4), X(ny2 - 2), X(7), X(4.4), function (tx, ty) { return mix(cLt, cDk, ty); });
    for (var a = 0.4; a <= 2.7; a += 0.2) put(Math.round(X(nx2 + 1 + Math.cos(a) * -4)), Math.round(X(ny2 - 6 - Math.sin(a) * 3)), mix(cLt, c, 0.4));
    stroke(put, X(nx2 + 10), X(ny2 - 1), X(nx2 + 14), X(ny2), X(2.2), function () { return cDk; });
    put(Math.round(X(nx2 + 3)), Math.round(X(ny2 - 4)), P.eye);
    fern(put, X(150), X(16), X(12), P.fern, P.fernLt);
    put(Math.round(X(140)), Math.round(X(34)), P.fernLt);
  }

  // ---- RECOLOR variants (render_prehistoria_recolors.js hue-shift) ----------
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgb2hex(r, g, b) { return '#' + [r, g, b].map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (mx === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h, s, l];
  }
  function hsl2rgb(h, s, l) {
    if (s === 0) { var v = l * 255; return [v, v, v]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    var f = function (t) { t = ((t % 1) + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  function shifted(deg, satM, litA) {
    var cache = {};
    return function (c) {
      if (cache[c]) return cache[c];
      var rgb = hex2rgb(c), hsl = rgb2hsl(rgb[0], rgb[1], rgb[2]);
      var h = hsl[0], s = hsl[1], l = hsl[2], out;
      if (s < 0.13) out = c;
      else { h += deg / 360; s = Math.max(0, Math.min(1, s * satM)); l = Math.max(0, Math.min(1, l + litA)); var o = hsl2rgb(h, s, l); out = rgb2hex(o[0], o[1], o[2]); }
      cache[c] = out; return out;
    };
  }
  function recolored(draw, deg, satM, litA) {
    var sh = shifted(deg, satM, litA);
    return function (put, S) { draw(function (x, y, c) { put(x, y, sh(c)); }, S); };
  }

  // ============ THE PRIMORDIAL — dragon160 #10 (render_dragon_final O) =======
  function dragon160(put, S, o) {
    o = o || {};
    var X = U(S);
    var cLt = o.scaleLt || '#d2724e', c = o.scale || '#a8442e', cDk = o.scaleDk || '#541e10';
    var belly = o.belly || '#e8c88a', bellyDk = o.bellyDk || '#a88a4e';
    var memb = o.memb || mix(c, '#000000', 0.25), membDk = o.membDk || mix(cDk, '#000000', 0.3);
    if (!o.noFloor) floor(put, S, o.seed || 0);
    shadow(put, X(76), X(140), X(46), X(6));
    var wingBone = function (ax, ay, pts, wc) {
      var px2 = ax, py2 = ay;
      pts.forEach(function (q) { stroke(put, X(px2), X(py2), X(q[0]), X(q[1]), X(q[2]), function () { return wc; }); px2 = q[0]; py2 = q[1]; });
    };
    var drawWing = function (ax, ay, sc, boneC, mC, mD) {
      wingBone(ax, ay, [[ax - 8 * sc, ay - 22 * sc, 3.4 * sc], [ax - 18 * sc, ay - 34 * sc, 2.6 * sc]], boneC);
      var wrist = [ax - 18 * sc, ay - 34 * sc];
      var tips = [[ax - 58 * sc, ay - 26 * sc], [ax - 52 * sc, ay - 6 * sc], [ax - 40 * sc, ay + 6 * sc]];
      for (var g = 0; g < tips.length; g++) {
        var from = g === 0 ? wrist : tips[g - 1];
        var steps = Math.max(18, Math.ceil(S / 5));
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          var ex = from[0] + (tips[g][0] - from[0]) * t, ey = from[1] + (tips[g][1] - from[1]) * t;
          stroke(put, X(ax - 6 * sc), X(ay - 4 * sc), X(ex), X(ey), X(1.6), (function (tt) { return function () { return mix(mC, mD, 0.3 + tt * 0.35); }; })(t));
        }
      }
      tips.forEach(function (q) { stroke(put, X(wrist[0]), X(wrist[1]), X(q[0]), X(q[1]), X(1.8 * sc), function () { return boneC; }); });
      stroke(put, X(wrist[0]), X(wrist[1]), X(wrist[0] - 3), X(wrist[1] - 4), X(1.4), function () { return P.claw; });
    };
    drawWing(96, 56, 0.9, mix(cDk, '#000000', 0.2), mix(memb, '#000000', 0.25), mix(membDk, '#000000', 0.3));
    if (!o.wyvern) { stroke(put, X(88), X(78), X(94), X(102), X(6), function () { return cDk; }); stroke(put, X(94), X(102), X(90), X(122), X(4), function () { return cDk; }); }
    stroke(put, X(58), X(88), X(66), X(112), X(8), function () { return cDk; });
    stroke(put, X(66), X(112), X(60), X(132), X(5), function () { return cDk; });
    for (var k = 0; k <= 2; k++) stroke(put, X(60), X(132), X(64 + k * 4), X(135), X(2), function () { return mix(P.claw, cDk, 0.5); });
    var tx2 = 42, ty2 = 80;
    for (var it = 1; it <= 20; it++) {
      var t = it / 20;
      var nx = 42 - t * 40 + Math.sin(t * 3.6) * 6, ny = 80 - Math.sin(t * 2.2) * 26 + t * 8;
      stroke(put, X(tx2), X(ty2), X(nx), X(ny), X(Math.max(1.6, 9 * (1 - t * 0.8))), (function (tt) { return function () { return mix(c, cDk, tt * 0.4); }; })(t));
      tx2 = nx; ty2 = ny;
    }
    for (var it2 = 0; it2 <= 6; it2++) { var t2 = it2 / 6; row(put, Math.round(X(ty2 - 5 + it2 * 1.6)), X(tx2 - (4 - Math.abs(t2 - 0.5) * 6)), X(tx2 + (4 - Math.abs(t2 - 0.5) * 6)), (function (tt) { return function (tk) { return mix(cLt, cDk, tk + tt * 0.3); }; })(t2)); }
    var TOP = [[40, 66], [58, 60], [78, 56], [96, 54], [104, 58]];
    var BOT = [[40, 92], [58, 98], [78, 96], [96, 84], [104, 76]];
    body(put, X, 40, 104, TOP, BOT, cLt, c, cDk);
    for (var xb = 44; xb <= 100; xb += 3) { var by = pw(xb, BOT) - 2; row(put, Math.round(X(by)), X(xb - 1.4), X(xb + 1.4), (function (xx) { return function (tk) { return mix(belly, bellyDk, tk + ((xx / 3) % 2) * 0.2); }; })(xb)); row(put, Math.round(X(by - 3)), X(xb - 1.2), X(xb + 1.2), (function (xx) { return function (tk) { return mix(belly, bellyDk, tk * 0.6 + ((xx / 3) % 2) * 0.2); }; })(xb)); }
    if (o.cracks) { [[54, 70, 62, 80], [70, 64, 76, 76], [86, 62, 90, 72]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(1.2), function () { return (o.crackC || P.volcano); }); put(Math.round(X(q[2])), Math.round(X(q[3])), '#ffd24a'); }); }
    if (o.feathered) { for (var xf = 44; xf <= 100; xf += 5) stroke(put, X(xf), X(pw(xf, TOP) + 2), X(xf - 3), X(pw(xf, TOP) + 8), X(1.2), function () { return mix(cLt, cDk, 0.35); }); }
    if (!o.wyvern) {
      stroke(put, X(94), X(76), X(102), X(96), X(6.4), function () { return c; });
      stroke(put, X(102), X(96), X(98), X(118), X(4.4), function () { return mix(c, cDk, 0.3); });
      for (var k2 = 0; k2 <= 2; k2++) stroke(put, X(98), X(118), X(102 + k2 * 4), X(121), X(2.2), function () { return P.claw; });
    }
    stroke(put, X(64), X(86), X(74), X(108), X(9), function () { return c; });
    ell(put, X(66), X(92), X(7), X(8), function (tk, ty3) { return mix(cLt, c, clamp(tk + ty3 * 0.5, 0, 1)); });
    stroke(put, X(74), X(108), X(68), X(128), X(5.4), function () { return mix(c, cDk, 0.3); });
    stroke(put, X(68), X(128), X(76), X(134), X(4), function () { return mix(c, cDk, 0.45); });
    for (var k3 = 0; k3 <= 2; k3++) stroke(put, X(76), X(134), X(82 + k3 * 4), X(136), X(2.4), function () { return P.claw; });
    drawWing(88, 54, 1.15, cDk, memb, membDk);
    var nx3 = 100, ny3 = 60;
    [[110, 48, 11], [118, 38, 9], [124, 32, 8]].forEach(function (q) { stroke(put, X(nx3), X(ny3), X(q[0]), X(q[1]), X(q[2]), function () { return c; }); nx3 = q[0]; ny3 = q[1]; });
    [[104, 58], [110, 50], [116, 42]].forEach(function (q) { row(put, Math.round(X(q[1])), X(q[0] - 2.4), X(q[0] + 2.4), function (tk) { return mix(belly, bellyDk, tk); }); });
    var HTOP = [[116, 24], [128, 20], [140, 22], [152, 28]];
    var HBOT = [[116, 36], [130, 38], [142, 38], [152, 34]];
    body(put, X, 116, 152, HTOP, HBOT, cLt, c, cDk);
    var JTOP = [[122, 40], [136, 44], [148, 48]];
    var JBOT = [[122, 46], [138, 51], [148, 53]];
    body(put, X, 122, 148, JTOP, JBOT, mix(cLt, c, 0.3), mix(c, cDk, 0.2), cDk);
    for (var xm = 126; xm <= 147; xm++) { var y0 = 36 + (xm - 126) * 0.12, y1 = pw(xm, JTOP); if (y1 > y0 + 2) for (var ym = y0 + 2; ym <= y1 - 1; ym++) put(Math.round(X(xm)), Math.round(X(ym)), mix('#2a0a10', P.night, 0.3)); }
    [[130], [136], [142], [147]].forEach(function (q) { stroke(put, X(q[0]), X(37 + (q[0] - 126) * 0.1), X(q[0]), X(39.5 + (q[0] - 126) * 0.1), X(0.9), function () { return P.tooth; }); });
    [[128], [134], [140]].forEach(function (q) { stroke(put, X(q[0]), X(pw(q[0], JTOP)), X(q[0]), X(pw(q[0], JTOP) - 2.4), X(0.9), function () { return P.tooth; }); });
    ell(put, X(124), X(28), X(2.2), X(2.4), function () { return (o.eyeC || P.eye); });
    put(Math.round(X(124.6)), Math.round(X(28.4)), P.night);
    stroke(put, X(120), X(24), X(128), X(23), X(1.8), function () { return cDk; });
    ell(put, X(146), X(26), X(1.4), X(1.8), function () { return cDk; });
    var hs = o.horns || 'swept';
    if (hs === 'swept') {
      [[0, 3.4], [4, 2.6]].forEach(function (q) { var off = q[0], w = q[1], hx = 118 + off, hy = 22; for (var i = 1; i <= 8; i++) { var t = i / 8; var nx = 118 + off - t * 16, ny = 22 - t * 10 + t * t * 6; stroke(put, X(hx), X(hy), X(nx), X(ny), X(w * (1 - t * 0.6)), (function (tt) { return function () { return mix(P.horn, P.hornDk, tt * 0.5); }; })(t)); hx = nx; hy = ny; } });
    }
    [[108, 44], [100, 52], [90, 52], [78, 52], [66, 56], [52, 62], [44, 66]].forEach(function (q, i) { var base = i < 2 ? q[1] : pw(q[0], TOP) - 1; stroke(put, X(q[0]), X(base + 2), X(q[0] - 2), X(base - 5 - (i === 3 ? 2 : 0)), X(2), function () { return mix(P.horn, P.hornDk, 0.35); }); });
    if (o.breath === 'fire') {
      for (var i = 0; i <= 16; i++) { var t = i / 16; var bw = 2 + t * 7; ell(put, X(152 + t * 26 * 0.35 + t * 8), X(44 + t * 14), X(bw * 0.7), X(bw * 0.5), (function (tt) { return function (tk) { return mix('#ffd24a', P.volcano, clamp(tt * 0.8 + tk * 0.3, 0, 1)); }; })(t)); }
      put(Math.round(X(151)), Math.round(X(43)), '#ffffff');
    }
  }
  var PRIMORDIAL_O = { scale: '#8a6a3e', scaleLt: '#b8925e', scaleDk: '#42301a', belly: '#e0d0a0', bellyDk: '#948a5e', feathered: true, horns: 'swept', breath: 'fire', seed: 80 };
  function drawPrimordial(put, S) { dragon160(put, S, PRIMORDIAL_O); }
  // P2 IGNITED state — feathers alight (ember cracks + brighter belly glow)
  function drawPrimordialIgnited(put, S) {
    var o = {}; for (var k in PRIMORDIAL_O) o[k] = PRIMORDIAL_O[k];
    o.cracks = true; o.crackC = '#ff9a3f'; o.scaleLt = '#d29a52'; o.belly = '#ffdca0'; o.eyeC = '#ff9a3f';
    dragon160(put, S, o);
  }

  // ---- THE HATCH — 4 entrance frames (render_hatch_frames.js, no black bg) --
  function hatchNest(put, X) {
    for (var a = 0; a < 6.28; a += 0.03) {
      var rr = 84 + Math.sin(a * 9) * 4;
      for (var w = 0; w < 12; w++) put(Math.round(X(110 + Math.cos(a) * (rr - w))), Math.round(X(196 + Math.sin(a) * (rr - w) * 0.22 - w * 0.7)), mix(P.mudLt, P.mudDk, (w / 12) * 0.7 + (Math.sin(a * 13) + 1) / 6));
    }
  }
  function hatchDragon(put, S) {
    var dS = 150, ox = Math.round((S - dS) / 2) + 4, oy = 34, u = S / 220;
    var o = {}; for (var k in PRIMORDIAL_O) o[k] = PRIMORDIAL_O[k]; o.noFloor = true;
    dragon160(function (x, y, c) { put(x + Math.round(ox * u), y + Math.round(oy * u), c); }, Math.round(dS * u), o);
  }
  function eggHalf(put, X, side, ox, flash) {
    for (var y = 16; y <= 202; y++) {
      var t = (y - 110) / 96;
      if (Math.abs(t) > 1) continue;
      var w = 66 * Math.sqrt(1 - t * t) * (y < 110 ? 0.92 : 1);
      var splitX = 110 + Math.sin(y * 0.3) * 4;
      var x0 = 110 - w, x1 = 110 + w;
      if (side < 0) x1 = Math.min(x1, splitX);
      if (side > 0) x0 = Math.max(x0, splitX);
      if (x1 <= x0) continue;
      for (var x = x0; x <= x1; x++) {
        var tx = (x - (110 - w)) / (2 * w);
        var c = mix(P.white, P.bellyDk, clamp(tx * 1.2 + Math.abs(t) * 0.25, 0, 1));
        if (flash) c = mix(c, '#ffffff', 0.62);
        put(Math.round(X(x + ox)), Math.round(X(y)), c);
      }
      if (side !== 0) { var ex = side < 0 ? x1 : x0; put(Math.round(X(ex + ox)), Math.round(X(y)), flash ? '#ffffff' : P.bellyDk); }
    }
    if (!flash) [[84, 90], [130, 74], [96, 140], [128, 150], [76, 160], [140, 116]].forEach(function (q) {
      if (side < 0 && q[0] > 110) return; if (side > 0 && q[0] < 110) return;
      put(Math.round(X(q[0] + ox)), Math.round(X(q[1])), P.bellyDk); put(Math.round(X(q[0] + 4 + ox)), Math.round(X(q[1] + 3)), mix(P.bellyDk, P.white, 0.3));
    });
  }
  function hatchFrame(F) {
    return function (put, S) {
      var X = function (v) { return v * S / 220; };
      hatchNest(put, X);
      if (F === 1) {
        eggHalf(put, X, 0, 0, false);
        stroke(put, X(110), X(30), X(108), X(70), X(1.2), function () { return P.bellyDk; });
      } else if (F === 2) {
        eggHalf(put, X, 0, 0, false);
        for (var y = 22; y <= 198; y += 2) { var sx2 = 110 + Math.sin(y * 0.3) * 4; put(Math.round(X(sx2)), Math.round(X(y)), '#2a1a08'); put(Math.round(X(sx2 + 1)), Math.round(X(y)), mix(P.volcano, '#ffd24a', (y % 6) / 6)); }
      } else if (F === 3) {
        hatchDragon(put, S);
        eggHalf(put, X, -1, -44, true);
        eggHalf(put, X, 1, 44, true);
        [[30, 60], [24, 110], [34, 160], [190, 60], [196, 110], [186, 160]].forEach(function (q) { stroke(put, X(q[0] - 6), X(q[1]), X(q[0] + 6), X(q[1]), X(1.4), function () { return '#ffffff'; }); });
      } else {
        hatchDragon(put, S);
        [[36, 80], [30, 130], [44, 170], [184, 76], [192, 126], [178, 168], [110, 30]].forEach(function (q, i) {
          put(Math.round(X(q[0])), Math.round(X(q[1])), i % 2 ? '#ffffff' : mix('#ffffff', '#10140a', 0.5));
        });
      }
    };
  }

  // ============================= DECOR (20) ==================================
  function dFerns(put, S) {
    var X = U(S); floor(put, S, 61); shadow(put, X(80), X(124), X(30), X(5));
    fern(put, X(80), X(110), X(38), P.fern, P.fernLt);
    fern(put, X(52), X(116), X(26), mix(P.fern, P.jungleDk, 0.3), P.fern);
    fern(put, X(110), X(114), X(28), mix(P.fern, P.jungleDk, 0.2), P.fernLt);
    [[44, 100], [118, 96]].forEach(function (q) { for (var a = 0; a < 4.6; a += 0.3) put(Math.round(X(q[0] + Math.cos(a) * (4 - a * 0.5))), Math.round(X(q[1] + Math.sin(a) * (4 - a * 0.5))), P.fernLt); });
  }
  function dCycad(put, S) {
    var X = U(S); floor(put, S, 62); shadow(put, X(80), X(126), X(24), X(5));
    for (var y = 78; y <= 122; y++) { var t = (y - 78) / 44, w = 10 - t * 2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (yy) { return function (tx) { return mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((yy % 6) < 3 ? 0.2 : 0), 0, 1)); }; })(y)); }
    for (var y2 = 82; y2 <= 118; y2 += 6) for (var xx = -8; xx <= 8; xx += 4) put(Math.round(X(80 + xx + ((y2 / 6) % 2) * 2)), Math.round(X(y2)), P.mudDk);
    for (var a = -2.9; a <= -0.2; a += 0.22) {
      var px2 = 80, py2 = 78;
      for (var i = 1; i <= 10; i++) {
        var t2 = i / 10;
        var nx = 80 + Math.cos(a) * t2 * 42, ny = 78 + Math.sin(a) * t2 * 26 + t2 * t2 * 14;
        stroke(put, X(px2), X(py2), X(nx), X(ny), X(2.2 * (1 - t2 * 0.5)), (function (tt) { return function () { return mix(P.fernLt, P.jungleDk, tt * 0.6); }; })(t2));
        if (i > 2) { stroke(put, X(nx), X(ny), X(nx - 2), X(ny - 3), X(0.8), function () { return P.fern; }); stroke(put, X(nx), X(ny), X(nx + 1), X(ny - 3.4), X(0.8), function () { return P.fern; }); }
        px2 = nx; py2 = ny;
      }
    }
  }
  function dCanopy(put, S) {
    var X = U(S); floor(put, S, 63); shadow(put, X(80), X(128), X(30), X(5));
    stroke(put, X(80), X(126), X(78), X(70), X(7), function () { return P.mud; });
    stroke(put, X(78), X(88), X(62), X(72), X(3.4), function () { return P.mudDk; });
    stroke(put, X(79), X(80), X(96), X(66), X(3.4), function () { return P.mudDk; });
    [[80, 52, 44, 14], [64, 44, 26, 10], [98, 46, 24, 9], [80, 36, 22, 8]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)); });
      for (var k = 0; k < 7; k++) put(Math.round(X(q[0] - q[2] * 0.7 + k * q[2] * 0.23)), Math.round(X(q[1] - q[3] * 0.4 + (k % 3))), P.fernLt);
    });
    [[52, 58, 20], [104, 56, 24], [86, 60, 16]].forEach(function (q) { for (var i = 0; i <= q[2]; i++) put(Math.round(X(q[0] + Math.sin(i * 0.4) * 1.4)), Math.round(X(q[1] + i)), mix(P.fern, P.jungleDk, 0.3)); });
  }
  function dTar(put, S) {
    var X = U(S); floor(put, S, 64);
    ell(put, X(80), X(102), X(42), X(17), function (tx, ty) { return mix(P.tarLt, P.tar, clamp(tx * 0.9 + ty * 0.7, 0, 1)); });
    ell(put, X(64), X(94), X(11), X(4), function () { return P.tarGloss; });
    for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 43)), Math.round(X(102 + Math.sin(a) * 18)), mix(P.mud, P.mudDk, (Math.sin(a * 4) + 1) / 2));
    [[68, 106], [94, 108], [82, 98]].forEach(function (q) { for (var a2 = 0; a2 < 6.28; a2 += 0.5) put(Math.round(X(q[0] + Math.cos(a2) * 3)), Math.round(X(q[1] + Math.sin(a2) * 1.8)), P.tarGloss); });
    for (var kk = 0; kk < 4; kk++) { var rx = 92 + kk * 5; for (var ar = 3.4; ar <= 5.4; ar += 0.1) put(Math.round(X(rx + Math.cos(ar) * 8)), Math.round(X(102 + Math.sin(ar) * 9)), mix(P.bone, P.boneDk, kk * 0.15)); }
    stroke(put, X(58), X(100), X(54), X(90), X(2.4), function () { return P.horn; });
    ell(put, X(46), X(104), X(5), X(3.4), function (tx, ty) { return mix(P.bone, P.boneDk, tx); }); put(Math.round(X(45)), Math.round(X(103)), P.night);
  }
  function dVent(put, S) {
    var X = U(S); floor(put, S, 65);
    var vx = 40, vy = 118;
    [[18, -6], [14, -2], [20, 4], [16, -4], [18, 2]].forEach(function (q) { stroke(put, X(vx), X(vy), X(vx + q[0]), X(vy + q[1]), X(3), function () { return P.night; }); stroke(put, X(vx + 1), X(vy + 1), X(vx + q[0]), X(vy + q[1] + 1), X(1.4), function () { return P.volcano; }); vx += q[0]; vy += q[1]; });
    for (var i = 0; i <= 20; i++) put(Math.round(X(42 + i * 4)), Math.round(X(117 + Math.sin(i) * 3)), mix(P.volcano, '#ffd24a', (i % 3) / 3));
    [[60, 108], [96, 104]].forEach(function (q) {
      for (var i2 = 0; i2 <= 12; i2++) { var t = i2 / 12; ell(put, X(q[0] + Math.sin(t * 5) * 4), X(q[1] - t * 60), X(3 + t * 7), X(2.4 + t * 4), (function (tt) { return function (tx) { return mix('#6a6266', '#2e2a2c', clamp(0.3 + tt * 0.5 + tx * 0.2, 0, 1)); }; })(t)); }
    });
    [[70, 60], [88, 44], [58, 36]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), P.volcano); });
    [[38, 124, 6], [116, 120, 8]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[2] * 0.6), function (tx, ty) { return mix('#4a4246', '#221e20', tx + ty * 0.4); }); });
  }
  function dNest(put, S) {
    var X = U(S); floor(put, S, 66); shadow(put, X(80), X(122), X(34), X(5));
    for (var a = 0; a < 6.28; a += 0.04) {
      var rr = 30 + Math.sin(a * 7) * 2;
      for (var w = 0; w < 7; w++) put(Math.round(X(80 + Math.cos(a) * (rr - w))), Math.round(X(104 + Math.sin(a) * (rr - w) * 0.45 - w * 0.8)), mix(P.mudLt, P.mudDk, (w / 7) * 0.7 + (Math.sin(a * 13) + 1) / 6));
    }
    for (var kk = 0; kk < 14; kk++) { var a2 = kk / 14 * 6.28; stroke(put, X(80 + Math.cos(a2) * 28), X(104 + Math.sin(a2) * 12), X(80 + Math.cos(a2) * 34), X(104 + Math.sin(a2) * 15), X(1), function () { return P.belly; }); }
    [[68, 98, 7, 9], [82, 96, 7.4, 9.4], [94, 100, 6.4, 8.4]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix(P.white, P.bellyDk, clamp(tx + ty * 0.4 - 0.25, 0, 1)); });
      put(Math.round(X(q[0] - 2)), Math.round(X(q[1] - 2)), P.bellyDk); put(Math.round(X(q[0] + 2)), Math.round(X(q[1] + 3)), P.bellyDk);
    });
    stroke(put, X(90), X(94), X(96), X(97), X(0.9), function () { return P.mudDk; });
    stroke(put, X(96), X(97), X(93), X(100), X(0.9), function () { return P.mudDk; });
  }
  function dRibcage(put, S) {
    var X = U(S); floor(put, S, 67); shadow(put, X(80), X(126), X(44), X(5));
    stroke(put, X(18), X(74), X(142), X(82), X(4), function () { return P.bone; });
    [[24], [40], [56], [72], [88], [104], [120]].forEach(function (q, i) {
      for (var a = -1.5; a <= 0.2; a += 0.04) {
        var rx = q[0] + Math.cos(a) * (26 - i * 1.2) * 0.5 + 6, ry = 78 + (i % 2) + Math.sin(a) * -(30 - i * 1.4);
        put(Math.round(X(rx)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6));
        put(Math.round(X(rx + 1)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6 + 0.2));
      }
    });
    ell(put, X(146), X(94), X(11), X(8), function (tx, ty) { return mix(P.bone, P.boneDk, clamp(tx + ty * 0.5 - 0.2, 0, 1)); });
    ell(put, X(143), X(92), X(2.6), X(3), function () { return P.night; });
    row(put, Math.round(X(99)), X(140), X(156), function () { return P.boneDk; });
    [[40, 48], [88, 46]].forEach(function (q) { for (var i = 0; i <= 10; i++) put(Math.round(X(q[0] + Math.sin(i * 0.5) * 2)), Math.round(X(q[1] + i * 2)), P.fern); });
  }
  function dAmber(put, S) {
    var X = U(S); floor(put, S, 68); shadow(put, X(80), X(122), X(24), X(5));
    ell(put, X(80), X(116), X(26), X(8), function (tx, ty) { return mix('#5a5246', '#2a2620', tx + ty * 0.4); });
    for (var y = 66; y <= 112; y++) {
      var t = (y - 66) / 46;
      var w = 20 * Math.sin(t * 2.6 + 0.3) + 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (tt) { return function (tx) { return mix(P.amberLt, mix(P.amber, '#8a5410', 0.5), clamp(Math.abs(tx - 0.35) * 1.3 + tt * 0.3, 0, 1)); }; })(t));
    }
    ell(put, X(70), X(78), X(6), X(9), function () { return mix(P.amberLt, P.white, 0.4); });
    ell(put, X(84), X(92), X(6), X(4.4), function () { return '#3a2a10'; });
    stroke(put, X(78), X(90), X(74), X(86), X(1), function () { return '#3a2a10'; });
    stroke(put, X(78), X(94), X(73), X(96), X(1), function () { return '#3a2a10'; });
    stroke(put, X(90), X(90), X(95), X(86), X(1), function () { return '#3a2a10'; });
    for (var kk = 0; kk < 5; kk++) { var a = kk / 5 * 6.28; stroke(put, X(80 + Math.cos(a) * 10), X(88 + Math.sin(a) * 12), X(80 + Math.cos(a) * 16), X(88 + Math.sin(a) * 18), X(0.8), function () { return mix(P.amberLt, P.amber, 0.4); }); }
  }
  function dBoulders(put, S) {
    var X = U(S); floor(put, S, 69); shadow(put, X(80), X(126), X(40), X(6));
    [[56, 100, 24, 18], [96, 106, 20, 14], [124, 98, 12, 10], [36, 112, 12, 8]].forEach(function (q) {
      var bx = q[0], by = q[1], bw = q[2], bh = q[3];
      ell(put, X(bx), X(by), X(bw), X(bh), function (tx, ty) { return mix('#8a8276', '#423e36', clamp(tx * 1.05 + ty * 0.6 - 0.2, 0, 1)); });
      for (var mx = -bw * 0.8; mx <= bw * 0.8; mx += 2) { var my = by - bh * Math.sqrt(Math.max(0, 1 - Math.pow(mx / bw, 2))) + 1; put(Math.round(X(bx + mx)), Math.round(X(my)), mix(P.fernLt, P.fern, (Math.abs(mx) / bw))); put(Math.round(X(bx + mx)), Math.round(X(my + 1)), P.fern); }
      stroke(put, X(bx - bw * 0.3), X(by - 2), X(bx - bw * 0.1), X(by + bh * 0.4), X(0.9), function () { return '#423e36'; });
    });
    fern(put, X(140), X(120), X(10));
  }
  function dReeds(put, S) {
    var X = U(S); floor(put, S, 70);
    for (var x = 0; x < S; x++) { var yy = 0.82 * S + Math.sin(x / S * 6) * 1.4; for (var y = yy; y < Math.min(S, yy + 0.1 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.4 + (y - yy) / (0.1 * S) * 0.4)); }
    [[40, 44, 1], [56, 30, 1.2], [72, 38, 1.1], [88, 26, 1.3], [104, 40, 1], [120, 34, 1.15]].forEach(function (q) {
      var rx = q[0], topY = q[1], w = q[2];
      for (var y2 = topY; y2 <= 128; y2 += 5) {
        stroke(put, X(rx + Math.sin(y2 * 0.05) * 2), X(y2), X(rx + Math.sin((y2 + 5) * 0.05) * 2), X(Math.min(128, y2 + 5)), X(2 * w), (function (yy) { return function () { return mix('#6a9a4a', '#2e4a1e', (yy % 10) < 5 ? 0.2 : 0.45); }; })(y2));
        put(Math.round(X(rx + Math.sin(y2 * 0.05) * 2 - 2 * w)), Math.round(X(y2)), '#8ac86a');
      }
      for (var i = 0; i <= 4; i++) row(put, Math.round(X(topY - 5 + i)), X(rx - i * 0.6), X(rx + i * 0.6), (function (ii) { return function () { return mix('#a8843a', '#6a5018', ii / 5); }; })(i));
    });
  }
  function dLog(put, S) {
    var X = U(S); floor(put, S, 71); shadow(put, X(80), X(124), X(44), X(6));
    for (var x = 28; x <= 132; x++) {
      var t = (x - 28) / 104;
      for (var y = 92 - 14 + Math.sin(t * 8) * 1; y <= 92 + 14; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.mudLt, P.mudDk, clamp((y - 78) / 28 * 1.1 + ((x % 9) < 1 ? 0.2 : 0), 0, 1)));
    }
    ell(put, X(30), X(92), X(7), X(13), function (tx) { return mix('#1c1208', '#0a0602', tx); });
    for (var rr = 3; rr <= 12; rr += 3) { for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(132 + Math.cos(a) * rr * 0.5)), Math.round(X(92 + Math.sin(a) * rr)), mix(P.belly, P.mudDk, rr / 14)); }
    stroke(put, X(60), X(78), X(56), X(66), X(3.4), function () { return P.mudDk; });
    stroke(put, X(100), X(78), X(106), X(70), X(3), function () { return P.mudDk; });
    for (var mx = 40; mx <= 90; mx += 6) put(Math.round(X(mx)), Math.round(X(79 + (mx % 3))), P.fern);
    put(Math.round(X(28)), Math.round(X(90)), P.eye); put(Math.round(X(32)), Math.round(X(90)), P.eye);
  }
  function dTermite(put, S) {
    var X = U(S); floor(put, S, 72); shadow(put, X(80), X(128), X(26), X(5));
    [[80, 30, 14], [62, 62, 9], [98, 58, 8]].forEach(function (q) {
      var tx2 = q[0], topY = q[1], w = q[2];
      for (var y = topY; y <= 124; y++) {
        var t = (y - topY) / (124 - topY);
        var ww = w * (0.4 + t * 0.8) + Math.sin(y * 0.4) * 1.4;
        row(put, Math.round(X(y)), X(tx2 - ww), X(tx2 + ww), (function (yy) { return function (tx) { return mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((yy % 7) < 2 ? 0.18 : 0), 0, 1)); }; })(y));
      }
    });
    [[76, 70], [86, 92], [70, 104], [92, 112], [80, 48]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(2.4), X(3), function () { return '#1c1208'; }); });
    for (var i = 0; i <= 12; i++) put(Math.round(X(96 + i * 3)), Math.round(X(120 + Math.sin(i) * 2)), '#c8b490');
  }
  function dGinkgo(put, S) {
    var X = U(S); floor(put, S, 73); shadow(put, X(80), X(128), X(28), X(5));
    stroke(put, X(80), X(126), X(82), X(66), X(6), function () { return '#6a5a3a'; });
    stroke(put, X(81), X(90), X(64), X(74), X(3), function () { return '#5a4a2e'; });
    stroke(put, X(82), X(78), X(100), X(64), X(3), function () { return '#5a4a2e'; });
    [[80, 48, 36, 13], [62, 56, 20, 9], [102, 54, 20, 9]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix('#e8c848', '#8a6a14', clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)); });
    });
    for (var kk = 0; kk < 12; kk++) { var lx = 52 + (kk * 41) % 58, ly = 42 + (kk * 23) % 20; stroke(put, X(lx), X(ly), X(lx - 2), X(ly - 3), X(1), function () { return '#ffe89a'; }); stroke(put, X(lx), X(ly), X(lx + 2), X(ly - 3), X(1), function () { return '#ffe89a'; }); }
    [[46, 84], [116, 78], [98, 100], [60, 106]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), '#ffd868'); put(Math.round(X(q[0] + 1)), Math.round(X(q[1] + 1)), '#c8a030'); });
  }
  function dSkullRock(put, S) {
    var X = U(S); floor(put, S, 74); shadow(put, X(80), X(130), X(40), X(6));
    for (var y = 52; y <= 124; y++) {
      var t = (y - 52) / 72;
      var w = 36 * (1 - Math.abs(t - 0.35) * 0.8) + 6;
      row(put, Math.round(X(y)), X(78 - w), X(78 + w), (function (tt) { return function (tx) { return mix('#b0a890', '#4a4436', clamp(tx * 1.15 + tt * 0.3, 0, 1)); }; })(t));
    }
    ell(put, X(62), X(76), X(9), X(11), function () { return '#0e0c06'; });
    ell(put, X(94), X(76), X(9), X(11), function () { return '#0e0c06'; });
    put(Math.round(X(94)), Math.round(X(78)), P.eye);
    ell(put, X(78), X(96), X(6), X(8), function () { return '#1c1810'; });
    for (var tx2 = 48; tx2 <= 108; tx2 += 8) { for (var i = 0; i <= 6; i++) row(put, Math.round(X(118 + i)), X(tx2 - (3 - i * 0.4)), X(tx2 + (3 - i * 0.4)), (function (ii) { return function () { return mix(P.bone, P.boneDk, ii / 7); }; })(i)); }
    stroke(put, X(70), X(56), X(76), X(70), X(1), function () { return '#4a4436'; });
    stroke(put, X(96), X(60), X(90), X(72), X(1), function () { return '#4a4436'; });
    for (var iv = 0; iv <= 12; iv++) put(Math.round(X(48 + Math.sin(iv * 0.5) * 2)), Math.round(X(60 + iv * 3)), P.fern);
  }
  function dGeyser(put, S) {
    var X = U(S); floor(put, S, 75);
    [[80, 112, 34, 10, '#7ac8c0'], [80, 100, 22, 6, '#9ae0d8'], [80, 92, 12, 4, '#c8f0ea']].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), (function (cc) { return function (tx, ty) { return mix(cc, '#2e5a54', clamp(tx + ty * 0.5 - 0.2, 0, 1)); }; })(q[4]));
      for (var a = 0; a < 6.28; a += 0.08) put(Math.round(X(q[0] + Math.cos(a) * q[2])), Math.round(X(q[1] + Math.sin(a) * q[3])), mix('#d8d0b8', '#8a8268', (Math.sin(a * 5) + 1) / 2));
    });
    for (var i = 0; i <= 24; i++) { var t = i / 24; var w = 3 - t * 1 + Math.sin(t * 9) * 1; row(put, Math.round(X(88 - t * 62)), X(80 - w), X(80 + w), (function (tt) { return function (tx) { return mix('#e8f8f4', '#8ac8c0', clamp(tx + tt * 0.3, 0, 1)); }; })(t)); }
    [[70, 30], [92, 24], [80, 14]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(7), X(4.4), function (tx, ty) { return mix('#d8e8e4', '#7a9a96', clamp(0.3 + tx * 0.3 + ty * 0.3, 0, 1)); }); });
    [[64, 52], [96, 46], [58, 70]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), '#c8f0ea'); });
  }
  function dConifer(put, S) {
    var X = U(S); floor(put, S, 76); shadow(put, X(80), X(130), X(22), X(4));
    stroke(put, X(80), X(128), X(80), X(30), X(4.4), function () { return '#5a4228'; });
    [[36, 26], [50, 22], [64, 18], [78, 14], [92, 10]].forEach(function (q) {
      [[-1], [1]].forEach(function (s2) {
        var sd = s2[0], px2 = 80, py2 = q[0];
        for (var i = 1; i <= 6; i++) { var t = i / 6; var nx = 80 + sd * t * q[1], ny = q[0] + Math.sin(t * 2.6) * 5; stroke(put, X(px2), X(py2), X(nx), X(ny), X(2 * (1 - t * 0.5)), (function (tt) { return function () { return mix(P.jungle, P.jungleDk, tt * 0.4); }; })(t)); px2 = nx; py2 = ny; }
        ell(put, X(px2), X(py2), X(4.4), X(3), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, tx + ty * 0.4); });
      });
    });
    ell(put, X(80), X(26), X(5), X(4), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, ty); });
    [[70, 40], [92, 52]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(2.4), X(3.4), function (tx, ty) { return mix(P.mudLt, P.mudDk, tx + ty * 0.3); }); });
  }
  function dWallow(put, S) {
    var X = U(S); floor(put, S, 77);
    ell(put, X(80), X(104), X(44), X(18), function (tx, ty) { return mix('#a89068', '#5a4a2e', clamp(tx * 0.9 + ty * 0.6, 0, 1)); });
    [[52, 96, 62, 102], [98, 94, 108, 100], [64, 114, 74, 112], [96, 112, 104, 116]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(0.9), function () { return '#42351c'; }); });
    ell(put, X(80), X(104), X(26), X(10), function (tx, ty) { return mix(P.mudLt, P.mudDk, clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, X(72), X(100), X(8), X(3), function () { return mix(P.mudLt, '#c8b490', 0.4); });
    [[34, 124, 0.9], [52, 116, 1], [70, 110, 1.1]].forEach(function (q) {
      [[-3, 0], [0, -2], [3, 0]].forEach(function (o) { ell(put, X(q[0] + o[0] * q[2]), X(q[1] + o[1] * q[2]), X(1.8 * q[2]), X(2.6 * q[2]), function () { return '#42351c'; }); });
      ell(put, X(q[0]), X(q[1] + 3 * q[2]), X(2.6 * q[2]), X(2 * q[2]), function () { return '#42351c'; });
    });
    stroke(put, X(96), X(98), X(106), X(96), X(2), function () { return P.dinoGDk; });
    for (var a = 0; a < 6.28; a += 0.3) put(Math.round(X(84 + Math.cos(a) * 12)), Math.round(X(106 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, 0.5));
  }
  function dBloom(put, S) {
    var X = U(S); floor(put, S, 78); shadow(put, X(80), X(126), X(22), X(4));
    stroke(put, X(80), X(124), X(78), X(84), X(3.4), function () { return '#3e6a2a'; });
    [[64, 104], [94, 100]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(9), X(4), function (tx, ty) { return mix(P.fernLt, P.fern, tx + ty * 0.3); }); });
    for (var kk = 0; kk < 8; kk++) {
      var a = kk / 8 * 6.28;
      for (var i = 0; i <= 10; i++) {
        var t = i / 10;
        ell(put, X(78 + Math.cos(a) * t * 22), X(74 + Math.sin(a) * t * 14 - t * 4), X(6 * (1 - t * 0.4)), X(4 * (1 - t * 0.4)), (function (tt) { return function (tx, ty) { return mix('#f0d8e8', '#b06a9a', clamp(tt * 0.7 + tx * 0.3, 0, 1)); }; })(t));
      }
    }
    ell(put, X(78), X(70), X(7), X(5), function (tx, ty) { return mix(P.amberLt, P.amber, tx + ty * 0.4); });
    for (var a2 = 0; a2 < 6.28; a2 += 0.7) put(Math.round(X(78 + Math.cos(a2) * 4)), Math.round(X(69 + Math.sin(a2) * 2.6)), '#8a5410');
    stroke(put, X(84), X(78), X(85), X(86), X(1), function () { return mix(P.amberLt, P.white, 0.3); });
    put(Math.round(X(98)), Math.round(X(58)), '#c8e8f0'); put(Math.round(X(100)), Math.round(X(57)), '#c8e8f0');
  }
  function dCrater(put, S) {
    var X = U(S); floor(put, S, 79);
    ell(put, X(80), X(106), X(38), X(15), function (tx, ty) { return mix('#3a3234', '#141012', clamp(Math.abs(tx - 0.5) * -1.4 + 1 + ty * 0.3, 0, 1)); });
    for (var a = 0; a < 6.28; a += 0.06) { var rr = 39 + Math.sin(a * 6) * 2; put(Math.round(X(80 + Math.cos(a) * rr)), Math.round(X(106 + Math.sin(a) * (rr * 0.42))), mix('#6a5a4a', '#2e2620', (Math.sin(a * 3) + 1) / 2)); }
    ell(put, X(80), X(104), X(12), X(8), function (tx, ty) { return mix('#5a4a52', '#241e22', clamp(tx + ty * 0.5 - 0.2, 0, 1)); });
    [[74, 100, 80, 106], [84, 100, 88, 106], [78, 108, 84, 104]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(1), function () { return P.volcano; }); });
    put(Math.round(X(78)), Math.round(X(103)), '#ffd24a');
    for (var i = 0; i <= 10; i++) put(Math.round(X(84 + Math.sin(i * 0.6) * 3)), Math.round(X(94 - i * 4)), mix('#6a6266', P.night, 0.4 + i * 0.05));
    [[38, 92, 3], [122, 96, 4], [50, 124, 2.4], [114, 124, 3]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[2] * 0.7), function (tx, ty) { return mix('#5a4a52', '#241e22', tx); }); });
    [[30, 16, 44, 26], [104, 10, 116, 20], [70, 8, 78, 15]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(1.4), function () { return P.volcano; }); put(Math.round(X(q[2] + 1)), Math.round(X(q[3] + 1)), '#ffd24a'); });
  }
  function dRoost(put, S) {
    var X = U(S); floor(put, S, 80); shadow(put, X(80), X(132), X(24), X(5));
    for (var y = 28; y <= 128; y++) {
      var t = (y - 28) / 100;
      var w = 10 + t * 8 + Math.sin(y * 0.3) * 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (yy) { return function (tx) { return mix('#8a8276', '#3a362e', clamp(tx * 1.25 + ((yy % 11) < 2 ? 0.2 : 0), 0, 1)); }; })(y));
    }
    [[64, 60], [96, 84], [68, 100]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[0] + (q[0] < 80 ? -8 : 8)), X(q[1] + 2), X(2.4), function () { return '#5a544a'; }); });
    for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 13)), Math.round(X(26 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, (Math.sin(a * 9) + 1) / 2));
    ell(put, X(80), X(20), X(5), X(3.4), function (tx, ty) { return mix('#6a4a3a', '#2e1c14', ty); });
    stroke(put, X(84), X(18), X(92), X(12), X(1.8), function () { return '#2e1c14'; });
    stroke(put, X(76), X(18), X(70), X(13), X(1.6), function () { return '#2e1c14'; });
    stroke(put, X(78), X(15), X(72), X(11), X(1.2), function () { return '#4a3226'; });
    [[70, 34], [88, 40]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[0] + 1), X(q[1] + 12), X(1.6), function () { return mix(P.white, '#8a8268', 0.3); }); });
  }

  // ============================== TILES (10) =================================
  function h2t(ix, iy, seed) { var s = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
  function sn(x, y, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    var a = h2t(ix, iy, seed), b = h2t(ix + 1, iy, seed), c = h2t(ix, iy + 1, seed), d = h2t(ix + 1, iy + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function printStamp(put, cx, cy, sc, ang, c) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    var T = function (ox, oy) { return [cx + ox * ca - oy * sa, cy + ox * sa + oy * ca]; };
    [[-3, -2], [0, -3.4], [3, -2]].forEach(function (q) { var pp = T(q[0] * sc, q[1] * sc); ell(put, pp[0], pp[1], 1.6 * sc, 2.4 * sc, function () { return c; }); });
    var h = T(0, 1.4 * sc); ell(put, h[0], h[1], 2.2 * sc, 1.8 * sc, function () { return c; });
  }
  function tJungle(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 20, y / 20, 81) * 0.6 + sn(x / 6, y / 6, 82) * 0.4;
      put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 22; k++) {
      var gx = h2t(k, 3, 83) * S, gy = h2t(k, 7, 83) * S;
      stroke(put, gx, gy, gx + (h2t(k, 11, 83) - 0.5) * 3, gy - 3, 0.8, (function (kk) { return function () { return mix('#7aa04a', '#2e4a1e', h2t(kk, 13, 83)); }; })(k));
    }
    [[0.3, 0.7], [0.75, 0.25]].forEach(function (q) { put(Math.round(q[0] * S), Math.round(q[1] * S), '#c8d46a'); });
  }
  function tMud(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 24, y / 24, 84) * 0.65 + sn(x / 8, y / 8, 85) * 0.35;
      put(x, y, mix(P.mudLt, P.mudDk, clamp(n * 1.25, 0, 1)));
    }
    printStamp(put, S * 0.28, S * 0.3, S * 0.02, 0.4, '#241a0e');
    printStamp(put, S * 0.55, S * 0.52, S * 0.02, 0.6, '#241a0e');
    printStamp(put, S * 0.78, S * 0.76, S * 0.02, 0.5, '#241a0e');
    printStamp(put, S * 0.35, S * 0.8, S * 0.014, -1.2, '#2e2212');
  }
  function tFernMeadow(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 16, y / 16, 86) * 0.55 + sn(x / 5, y / 5, 87) * 0.45;
      put(x, y, mix('#5a8a3a', '#26421a', clamp(n * 1.25, 0, 1)));
    }
    for (var k = 0; k < 12; k++) {
      var fx = h2t(k, 17, 88) * S, fy = h2t(k, 19, 88) * S;
      for (var a = 0; a < 3.6; a += 0.4) put(Math.round(fx + Math.cos(a) * (3 - a * 0.5)), Math.round(fy + Math.sin(a) * (3 - a * 0.5)), '#8ac86a');
    }
  }
  function tRiverbed(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 18, y / 18, 89);
      put(x, y, mix('#8a8276', '#42403a', clamp(n * 1.2, 0, 1)));
    }
    for (var k = 0; k < 16; k++) {
      var px2 = h2t(k, 23, 90) * S, py2 = h2t(k, 29, 90) * S, pr = 3 + h2t(k, 31, 90) * 6;
      ell(put, px2, py2, pr, pr * 0.7, function (tx, ty) { return mix('#a89a86', '#4a443a', clamp(tx * 1.1 + ty * 0.6 - 0.2, 0, 1)); });
    }
  }
  function tAsh(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 26, y / 26, 91) * 0.6 + sn(x / 9, y / 9, 92) * 0.4;
      put(x, y, mix('#6a6266', '#2e2a2c', clamp(n * 1.3, 0, 1)));
    }
    [[0.2, 0.4], [0.66, 0.2], [0.8, 0.7], [0.4, 0.85]].forEach(function (q, i) { put(Math.round(q[0] * S), Math.round(q[1] * S), i % 2 ? P.volcano : '#ffd24a'); });
    var cx2 = S * 0.1, cy2 = S * 0.6;
    for (var i2 = 0; i2 < 8; i2++) { var nx = cx2 + 8 + h2t(i2, 37, 93) * 6, ny = cy2 + (h2t(i2, 41, 93) - 0.5) * 10; stroke(put, cx2, cy2, nx, ny, 1, (function (ii) { return function () { return mix(P.volcano, '#8a2808', h2t(ii, 43, 93)); }; })(i2)); cx2 = nx; cy2 = ny; }
  }
  function tTarSeep(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 22, y / 22, 94) * 0.6 + sn(x / 7, y / 7, 95) * 0.4;
      var c = mix(P.mud, P.mudDk, clamp(n * 1.2, 0, 1));
      if (n > 0.72) c = mix(P.tarLt, P.tar, (n - 0.72) * 3);
      put(x, y, c);
    }
    [[0.3, 0.35], [0.7, 0.62]].forEach(function (q) { for (var a = 0; a < 6.28; a += 0.5) put(Math.round(q[0] * S + Math.cos(a) * 2.4), Math.round(q[1] * S + Math.sin(a) * 1.4), P.tarGloss); });
  }
  function tBoneField(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 20, y / 20, 96) * 0.7 + sn(x / 6, y / 6, 97) * 0.3;
      put(x, y, mix('#5a4a3a', '#241c12', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 8; k++) {
      var bx = h2t(k, 47, 98) * S, by = h2t(k, 53, 98) * S, a = h2t(k, 59, 98) * 6.28, ln = 4 + h2t(k, 61, 98) * 8;
      stroke(put, bx, by, bx + Math.cos(a) * ln, by + Math.sin(a) * ln, 1.6, (function (kk) { return function () { return mix(P.bone, P.boneDk, h2t(kk, 67, 98) * 0.5); }; })(k));
      ell(put, bx, by, 1.4, 1.4, function () { return P.boneDk; });
    }
    ell(put, S * 0.7, S * 0.3, S * 0.04, S * 0.034, function (tx, ty) { return mix(P.bone, P.boneDk, tx + ty * 0.4); });
    put(Math.round(S * 0.685), Math.round(S * 0.295), '#241c12');
  }
  function tTrail(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var band = Math.abs(y - S * 0.5 - Math.sin(x / S * 6.28) * S * 0.08);
      var n = sn(x / 18, y / 18, 99) * 0.5 + sn(x / 6, y / 6, 100) * 0.5;
      if (band < S * 0.22) put(x, y, mix('#a8906a', '#5a4a2e', clamp(n * 1.1 + band / (S * 0.3), 0, 1)));
      else put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.25, 0, 1)));
    }
    for (var k = 0; k < 7; k++) {
      var tx2 = (k + 0.5) / 7 * S, ty2 = S * 0.5 + Math.sin(tx2 / S * 6.28) * S * 0.08 + (h2t(k, 71, 101) - 0.5) * S * 0.16;
      printStamp(put, tx2, ty2, S * 0.013 + h2t(k, 73, 101) * S * 0.008, h2t(k, 79, 101) * 1.2 - 0.6 + 1.57, '#42351c');
    }
  }
  function tSwamp(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var flow = sn(x / 26 + y / 70, y / 18, 102) * 0.6 + sn(x / 8, y / 8, 103) * 0.4;
      var c = mix('#3a5a4a', '#122018', clamp(flow * 1.3, 0, 1));
      if (flow > 0.76) c = mix(c, '#7aa886', 0.5);
      put(x, y, c);
    }
    [[0.25, 0.3, 6], [0.68, 0.6, 8], [0.85, 0.18, 5]].forEach(function (q) {
      ell(put, q[0] * S, q[1] * S, q[2], q[2] * 0.7, function (tx, ty) { return mix('#5a8a4a', '#2a4a22', clamp(tx + ty * 0.4 - 0.2, 0, 1)); });
      stroke(put, q[0] * S, q[1] * S, q[0] * S + q[2] * 0.8, q[1] * S - q[2] * 0.3, 1, function () { return '#122018'; });
    });
    for (var a = 0; a < 6.28; a += 0.4) put(Math.round(S * 0.45 + Math.cos(a) * 4), Math.round(S * 0.8 + Math.sin(a) * 2.4), '#7aa886');
  }
  function tCrater(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 24, y / 24, 104) * 0.6 + sn(x / 7, y / 7, 105) * 0.4;
      put(x, y, mix('#4a4246', '#1c181a', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 5; k++) {
      var cx2 = S * 0.75, cy2 = S * 0.25;
      var a = k / 5 * 6.28 + 0.4;
      for (var i = 0; i < 5; i++) {
        var nx = cx2 + Math.cos(a + (h2t(i, 83, 106 + k) - 0.5)) * S * 0.09, ny = cy2 + Math.sin(a + (h2t(i, 89, 106 + k) - 0.5)) * S * 0.09;
        stroke(put, cx2, cy2, nx, ny, 1, (function (ii) { return function () { return (ii < 2 ? mix(P.volcano, '#1c181a', 0.3) : '#0e0c0d'); }; })(i));
        cx2 = nx; cy2 = ny;
      }
    }
    ell(put, S * 0.75, S * 0.25, 3.4, 2.6, function (tx, ty) { return mix(P.volcano, '#8a2808', tx + ty * 0.4); });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var PH_ART = {
    P: P,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (7) ----
      ctx.spr('prehistoriaRaptorHi', MS, MS, raptor160);
      ctx.spr('prehistoriaCompyHi', MS, MS, drawCompies);
      ctx.spr('prehistoriaTrikeHi', MS, MS, trike160);
      ctx.spr('prehistoriaStegoHi', MS, MS, stego160);
      ctx.spr('prehistoriaPteroHi', MS, MS, drawPtero);
      ctx.spr('prehistoriaDiloHi', MS, MS, drawDilo);
      ctx.spr('prehistoriaBrachioHi', MS, MS, drawBrachio);
      // ---- recolor variants (ptero EXEMPT — 6 only) ----
      ctx.spr('prehistoriaRaptorJungleHi', MS, MS, recolored(raptor160, 85, 0.95, -0.02));   // orange->green
      ctx.spr('prehistoriaCompyRustHi', MS, MS, recolored(drawCompies, -85, 1.05, 0));        // green->rust
      ctx.spr('prehistoriaTrikeMossHi', MS, MS, recolored(trike160, -140, 0.9, 0.01));        // blue->olive
      ctx.spr('prehistoriaStegoEmberHi', MS, MS, recolored(stego160, -95, 1.05, 0));          // green->ember
      ctx.spr('prehistoriaDiloMidnightHi', MS, MS, recolored(drawDilo, 130, 0.8, -0.05));     // green->indigo
      ctx.spr('prehistoriaBrachioStormHi', MS, MS, recolored(drawBrachio, 130, 0.85, -0.02)); // sage->slate
      ctx.MOB_HI.raptor = 'prehistoriaRaptorHi';        ctx.MOB_DISPLAY.raptor = 50;
      ctx.MOB_HI.compy = 'prehistoriaCompyHi';          ctx.MOB_DISPLAY.compy = 28;
      ctx.MOB_HI.trike = 'prehistoriaTrikeHi';          ctx.MOB_DISPLAY.trike = 64;
      ctx.MOB_HI.stego = 'prehistoriaStegoHi';          ctx.MOB_DISPLAY.stego = 62;
      ctx.MOB_HI.ptero = 'prehistoriaPteroHi';          ctx.MOB_DISPLAY.ptero = 54;
      ctx.MOB_HI.dilo = 'prehistoriaDiloHi';            ctx.MOB_DISPLAY.dilo = 50;
      ctx.MOB_HI.brachio = 'prehistoriaBrachioHi';      ctx.MOB_DISPLAY.brachio = 110;
      // ---- boss: THE PRIMORDIAL (160px canvas) + P2 IGNITED state ----
      ctx.spr('prehistoriaPrimordialHi', 160, 160, drawPrimordial);
      ctx.spr('prehistoriaPrimordialIgnitedHi', 160, 160, drawPrimordialIgnited);
      ctx.BOSS_HI.primordial = { key: 'prehistoriaPrimordialHi', size: 160, display: 140, bodyW: 52, bodyH: 62 };
      // ---- THE HATCH: 4 entrance frames (egg towering -> crack -> reveal -> flash) ----
      ctx.spr('prehistoriaHatch1', 160, 160, hatchFrame(1));
      ctx.spr('prehistoriaHatch2', 160, 160, hatchFrame(2));
      ctx.spr('prehistoriaHatch3', 160, 160, hatchFrame(3));
      ctx.spr('prehistoriaHatch4', 160, 160, hatchFrame(4));
      // ---- decor (20) ----
      ctx.spr('phdFerns', 64, 64, dFerns);
      ctx.spr('phdCycad', 64, 64, dCycad);
      ctx.spr('phdCanopy', 64, 64, dCanopy);
      ctx.spr('phdTar', 64, 64, dTar);
      ctx.spr('phdVent', 64, 64, dVent);
      ctx.spr('phdNest', 64, 64, dNest);
      ctx.spr('phdRibcage', 64, 64, dRibcage);
      ctx.spr('phdAmber', 64, 64, dAmber);
      ctx.spr('phdBoulders', 64, 64, dBoulders);
      ctx.spr('phdReeds', 64, 64, dReeds);
      ctx.spr('phdLog', 64, 64, dLog);
      ctx.spr('phdTermite', 64, 64, dTermite);
      ctx.spr('phdGinkgo', 64, 64, dGinkgo);
      ctx.spr('phdSkullRock', 64, 64, dSkullRock);
      ctx.spr('phdGeyser', 64, 64, dGeyser);
      ctx.spr('phdConifer', 64, 64, dConifer);
      ctx.spr('phdWallow', 64, 64, dWallow);
      ctx.spr('phdBloom', 64, 64, dBloom);
      ctx.spr('phdCrater', 64, 64, dCrater);
      ctx.spr('phdRoost', 64, 64, dRoost);
      // ---- tiles (10) ----
      ctx.tex('phtJungle', 48, 48, tJungle);
      ctx.tex('phtMud', 48, 48, tMud);
      ctx.tex('phtFern', 48, 48, tFernMeadow);
      ctx.tex('phtRiverbed', 48, 48, tRiverbed);
      ctx.tex('phtAsh', 48, 48, tAsh);
      ctx.tex('phtTarSeep', 48, 48, tTarSeep);
      ctx.tex('phtBone', 48, 48, tBoneField);
      ctx.tex('phtTrail', 48, 48, tTrail);
      ctx.tex('phtSwamp', 48, 48, tSwamp);
      ctx.tex('phtCrater', 48, 48, tCrater);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PH_ART;
  root.PREHISTORIA_ART = PH_ART;
})(typeof window !== 'undefined' ? window : this);
