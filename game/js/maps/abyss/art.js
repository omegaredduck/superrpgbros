// ============================================================================
// game/js/maps/abyss/art.js — THE ABYSS (realm 15) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #4 5 7 8 11 12 13 15
// 16 17 19, THE VOLT WYRM (render_abyss_boss_final.js #6 on the take-3
// leviathan skeleton — charged yellow-green water dragon, SEGMENTED into
// head / body (normal · charged · live-wire) / tail sprites), the DESTRUCTIBLE
// CORAL 4-state set, 15 decor (lighthouse keeps its beam), tiles #1 2 4 5 7 8
// 10. Crush-depth trench mood: near-dark, drowned rust vs bio glow.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- abyss palette (abyss_kit.js A, 6-digit only) -------------------------
  var A = {
    OUT: '#060a12',
    deep: '#0c1626', deepLt: '#1a2c48', deepDk: '#050a14',
    rock: '#2a3648', rockLt: '#465872', rockDk: '#141c2a',
    flesh: '#8a96a8', fleshLt: '#c2ccd8', fleshDk: '#4a5666',
    pink: '#c87a8a', pinkLt: '#e8aab8', pinkDk: '#7a3a4a',
    bio: '#41d6f6', bioLt: '#c2fbff', bioDk: '#1f78a8',
    glow: '#7df9d8', glowLt: '#d8fff2', glowDk: '#2a9a7a',
    violet: '#8a5adc', violetLt: '#c8aaff', violetDk: '#4a2a8a',
    red: '#d84a4a', redLt: '#ff9a8a', redDk: '#7a1a22',
    rust: '#8a5a3a', rustLt: '#b8845a', rustDk: '#4a2e1c',
    brass: '#c8963c', brassLt: '#f0cc80', brassDk: '#6e4a1c',
    shell: '#b0a890', shellDk: '#6e6852',
    ink: '#141020', bone: '#d8d4c0',
    white: '#e8f4f8', oil: '#040608',
    gold: '#e0a832'
  };
  // VOLT WYRM palette (render_abyss_boss2.js V.volt)
  var V = {
    base: '#3a4a2a', lt: '#7a9a4a', dk: '#1a240e', belly: '#c8d888',
    finC: '#d8e84a', finDk: '#6a7218', crest: ['#d8e84a', '#6a7218'],
    eyeC: '#f8ffb0', jawGlow: '#d8e84a', antler: '#c8c890',
    arcA: '#d8e84a', arcB: '#f8ffb0'
  };

  // ---- shared helpers (swamp lineage + abyss_kit glowDot/tentacle/fin/bubbles) --
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      row(put, y, x0, x1, (function (vt2) { return function (tx) {
        var b = mix(hi, base, clamp(vt2 * 1.15, 0, 1));
        b = mix(b, dk, clamp((vt2 - 0.55) * 1.25, 0, 1));
        if (tx < 0.13) b = mix(b, hi, 0.55);
        if (tx > 0.9) b = mix(b, dk, 0.5);
        return b;
      }; })(vt));
    }
  }
  function dome(put, cx, cy, rx, ry, base, hi, dk) {
    ell(put, cx, cy, rx, ry, function (tx, ty) {
      var b = mix(hi, base, clamp(ty * 1.25, 0, 1));
      b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
      if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
      if (tx > 0.82) b = mix(b, dk, 0.4);
      return b;
    });
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null); });
    ell(put, cx, cy, r * 1.12, r * 1.12, function () { return c; });
    ell(put, cx, cy, r * 0.66, r * 0.66, function () { return cLt; });
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, function () { return A.oil; }); }
  function glowDot(put, cx, cy, r, c, cLt) {
    for (var a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * r * 1.8), Math.round(cy + Math.sin(a) * r * 1.8), mix(c, A.deep, 0.55));
    ell(put, cx, cy, r, r, function () { return c; });
    put(Math.round(cx), Math.round(cy), cLt || A.bioLt);
  }
  function tentacle(put, x0, y0, x1, y1, w, c, cDk, waves) {
    var dx = x1 - x0, dy = y1 - y0;
    var nx = -dy, ny = dx; var L = Math.hypot(dx, dy) || 1;
    for (var t = 0; t < 1; t += 0.03) {
      var s = Math.sin(t * (waves || 6)) * 0.08 * (1 - t);
      var px = x0 + dx * t + nx / L * s * L, py = y0 + dy * t + ny / L * s * L;
      ell(put, px, py, w * (1 - t * 0.75), w * (1 - t * 0.75), (function (t2) { return function (tx, ty) { return mix(c, cDk, clamp(tx + ty * 0.4, 0, 1)); }; })(t));
    }
  }
  function fin(put, x0, y0, x1, y1, x2, y2, c, cDk) {
    var minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
    for (var y = minY; y <= maxY; y++) {
      var t = (y - minY) / Math.max(1, maxY - minY);
      var xa = x0 + (x1 - x0) * t, xb = x0 + (x2 - x0) * t;
      row(put, Math.round(y), Math.min(xa, xb), Math.max(xa, xb), (function (t2) { return function (tx) { return mix(c, cDk, clamp(tx * 0.8 + t2 * 0.3, 0, 1)); }; })(t));
    }
  }
  function bubbles(put, cx, cy, n, spread) {
    for (var i = 0; i < n; i++) {
      var bx = cx + Math.sin(i * 2.7) * (spread || 6), by = cy - i * 5 - (i % 2) * 2;
      put(Math.round(bx), Math.round(by), A.bioLt);
      if (i % 2 === 0) put(Math.round(bx + 1), Math.round(by), A.deepLt);
    }
  }
  function h2(x, y, s) { var n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ================= MOBS (#4 5 7 8 11 12 13 15 16 17 19) =================
  // 4 · GHOST JELLY
  function drawJelly(put, S) {
    var cx = S * 0.5;
    dome(put, cx, S * 0.38, S * 0.13, S * 0.11, A.violet, A.violetLt, A.violetDk);
    ell(put, cx, S * 0.36, S * 0.09, S * 0.06, function (tx, ty) { return mix(A.violetLt, A.violet, ty); });
    glowDot(put, cx, S * 0.34, S * 0.015, A.violetLt, A.white);
    for (var i = -3; i <= 3; i++) {
      var tx0 = cx + i * S * 0.035;
      for (var t = 0; t < 1; t += 0.06) {
        var px = tx0 + Math.sin(t * 6 + i) * S * 0.014, py = S * 0.46 + t * S * 0.34;
        put(Math.round(px), Math.round(py), t % 0.24 < 0.12 ? A.violetLt : A.violet);
      }
    }
    [[-0.08, 0.66], [0.06, 0.74], [0.11, 0.6]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), A.white); });
  }
  // 5 · SWORDFISH
  function drawSword(put, S) {
    var cx = S * 0.5;
    for (var t = 0; t < 1; t += 0.04) {
      var px = cx + S * (0.2 - t * 0.3), py = S * (0.42 + t * 0.16);
      var w = S * (0.02 + Math.sin(t * Math.PI) * 0.05);
      ell(put, px, py, w, w * 0.8, function (tx, ty) {
        var b = mix('#6a8ab0', '#2a3e58', clamp(ty * 1.3, 0, 1));
        if (ty < 0.35) b = mix(b, '#a8c8e8', 0.4);
        return b;
      });
    }
    stroke(put, cx - S * 0.1, S * 0.58, cx - S * 0.3, S * 0.66, 2, function () { return A.bone; });
    fin(put, cx + S * 0.08, S * 0.42, cx + S * 0.16, S * 0.28, cx + S * 0.02, S * 0.4, '#4a6a90', '#2a3e58');
    fin(put, cx + S * 0.2, S * 0.46, cx + S * 0.3, S * 0.4, cx + S * 0.28, S * 0.54, '#4a6a90', '#2a3e58');
    optic(put, cx - S * 0.06, S * 0.55, S * 0.009, A.oil, A.oil, '#ffffff');
    [[0.3, 0.4], [0.34, 0.48]].forEach(function (d) { stroke(put, cx + d[0] * S, S * d[1], cx + (d[0] + 0.08) * S, S * (d[1] - 0.02), 1, function () { return A.deepLt; }); });
  }
  // 7 · VOLT EEL
  function drawVolt(put, S) {
    var cx = S * 0.5;
    for (var a = 0; a < 10; a += 0.05) {
      var r = S * 0.05 + a * S * 0.013;
      var x = cx + Math.cos(a + 1) * r, y = S * 0.55 + Math.sin(a + 1) * r * 0.55;
      ell(put, x, y, S * 0.026, S * 0.023, (function (a2) { return function (tx, ty) {
        var b = mix('#4a5a3a', '#242e1a', clamp(tx + ty * 0.4, 0, 1));
        if ((a2 * 3 | 0) % 3 === 0) b = mix(b, '#d8e84a', 0.3);
        return b;
      }; })(a));
    }
    ell(put, cx - S * 0.14, S * 0.4, S * 0.04, S * 0.032, function (tx, ty) { return mix('#4a5a3a', '#242e1a', tx + ty * 0.3); });
    optic(put, cx - S * 0.15, S * 0.39, S * 0.008, A.oil, '#d8e84a', '#f8ffb0');
    [[0.12, 0.35], [-0.2, 0.6], [0.2, 0.68]].forEach(function (d, i) {
      var px = cx + d[0] * S, py = S * d[1];
      for (var s = 0; s < 4; s++) { var nx = px + (i % 2 ? 4 : -4) + Math.sin(s * 7) * 3, ny = py - 4; stroke(put, px, py, nx, ny, 1, (function (s2) { return function () { return s2 % 2 ? '#f8ffb0' : '#d8e84a'; }; })(s)); px = nx; py = ny; }
    });
  }
  // 8 · VAMPIRE SQUID
  function drawVampSquid(put, S) {
    var cx = S * 0.5;
    ell(put, cx + S * 0.12, S * 0.62, S * 0.14, S * 0.1, function (tx, ty) { return mix(A.ink, A.deepDk, clamp(tx + ty * 0.3, 0, 1)); });
    ell(put, cx + S * 0.2, S * 0.54, S * 0.08, S * 0.06, function (tx) { return mix(A.ink, A.deepDk, tx); });
    dome(put, cx - S * 0.04, S * 0.38, S * 0.09, S * 0.12, '#6a2a3a', '#a04a5a', '#3a1220');
    optic(put, cx - S * 0.06, S * 0.44, S * 0.018, A.oil, A.bio, A.bioLt);
    for (var i = -3; i <= 3; i++) {
      var ax = cx - S * 0.04 + i * S * 0.028;
      stroke(put, ax, S * 0.48, ax + i * S * 0.012, S * 0.66, S * 0.016, (function (i2) { return function () { return i2 % 2 ? '#6a2a3a' : '#4a1a28'; }; })(i));
    }
    for (var y = S * 0.5; y < S * 0.62; y += 2) row(put, Math.round(y), cx - S * 0.12, cx + S * 0.06, function (tx) { return ((tx * 8 | 0) % 2 ? null : mix('#4a1a28', A.ink, tx)); });
    [[-0.13, 0.66], [-0.04, 0.68], [0.05, 0.66]].forEach(function (d) { glowDot(put, cx + d[0] * S, S * d[1], S * 0.008, A.bio, A.bioLt); });
  }
  // 11 · CRIMSON STARFISH
  function drawStarfish(put, S) {
    var cx = S * 0.5, cy = S * 0.52; shadow(put, S, cx, S * 0.22);
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      for (var t = 0; t < 1; t += 0.06) {
        var w = S * (0.055 - t * 0.038);
        var px = cx + Math.cos(a) * t * S * 0.19, py = cy + Math.sin(a) * t * S * 0.19;
        ell(put, px, py, w, w, function (tx, ty) { return mix('#e05a3a', '#8a2014', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
      }
      for (var t2 = 0.15; t2 < 0.95; t2 += 0.2) put(Math.round(cx + Math.cos(a) * t2 * S * 0.19), Math.round(cy + Math.sin(a) * t2 * S * 0.19 - 1), '#ff9a6a');
    }
    ell(put, cx, cy, S * 0.055, S * 0.05, function (tx, ty) { return mix('#e05a3a', '#8a2014', clamp(tx + ty * 0.4, 0, 1)); });
    optic(put, cx, cy - S * 0.005, S * 0.013, A.oil, A.gold, '#f8d878');
    [[1, 0.6], [4, 0.7]].forEach(function (d) {
      var a2 = -Math.PI / 2 + d[0] * (Math.PI * 2 / 5);
      [0.35, 0.55, 0.75].forEach(function (tt) { put(Math.round(cx + Math.cos(a2) * tt * S * 0.19), Math.round(cy + Math.sin(a2) * tt * S * 0.19 + 2), A.pinkLt); });
    });
    [[-0.18, 0.75], [0.16, 0.78]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.02, S * 0.01, function (tx) { return mix(A.deepLt, A.deep, tx); }); });
  }
  // 12 · DROWNED DIVER
  function drawDiver(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.045, S * 0.6, cx + s * S * 0.05, S * 0.82, S * 0.034, function () { return A.rustDk; });
      plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, A.brassDk, A.brass, A.oil);
    });
    for (var y = S * 0.42; y < S * 0.62; y++) {
      var t = (y - S * 0.42) / (S * 0.2), w = S * (0.09 + t * 0.01);
      row(put, Math.round(y), cx - w, cx + w, (function (yy) { return function (tx) {
        var b = mix('#8a8272', '#4a4438', clamp(tx * 1.2, 0, 1));
        if ((yy | 0) % 6 === 0) b = mix(b, '#3a3428', 0.4);
        return b;
      }; })(y));
    }
    plate(put, cx - S * 0.05, S * 0.44, cx + S * 0.05, S * 0.52, A.brass, A.brassLt, A.brassDk);
    stroke(put, cx - S * 0.06, S * 0.4, cx - S * 0.12, S * 0.52, 1.6, function () { return A.rustDk; });
    dome(put, cx, S * 0.35, S * 0.07, S * 0.075, A.brass, A.brassLt, A.brassDk);
    ell(put, cx, S * 0.36, S * 0.035, S * 0.035, function (tx) { return mix('#0a1a12', A.oil, tx); });
    glowDot(put, cx - S * 0.008, S * 0.355, S * 0.009, A.glow, A.glowLt);
    [[-0.055], [0.055]].forEach(function (d) { ell(put, cx + d[0] * S, S * 0.36, S * 0.012, S * 0.014, function (tx, ty) { return mix(A.brassDk, A.oil, ty); }); });
    stroke(put, cx + S * 0.08, S * 0.56, cx + S * 0.22, S * 0.3, 2, function () { return A.rust; });
    stroke(put, cx + S * 0.22, S * 0.3, cx + S * 0.245, S * 0.255, 2.4, function () { return A.fleshLt; });
    stroke(put, cx - S * 0.07, S * 0.42, cx - S * 0.1, S * 0.56, 1.4, function () { return '#3a5a3a'; });
    bubbles(put, cx + S * 0.02, S * 0.28, 4, 3);
  }
  // 13 · GHOST FISHERMAN
  function drawFisherman(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.045, S * 0.58, cx + s * S * 0.05, S * 0.82, S * 0.036, function () { return '#3a4a3a'; });
      plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, '#2a3628', '#3a4a3a', A.oil);
    });
    for (var y = S * 0.4; y < S * 0.6; y++) {
      var t = (y - S * 0.4) / (S * 0.2), w = S * (0.085 + t * 0.02);
      row(put, Math.round(y), cx - w, cx + w, (function (t2) { return function (tx) {
        var b = mix('#c8b04a', '#8a7628', clamp(tx * 1.2, 0, 1));
        if (tx > 0.75) b = mix(b, '#5a4c14', 0.5);
        if (((tx * 9) | 0) % 4 === 0 && t2 > 0.4) b = mix(b, '#4a6a4a', 0.35);
        return b;
      }; })(t));
    }
    stroke(put, cx + S * 0.08, S * 0.45, cx + S * 0.15, S * 0.36, S * 0.02, function () { return '#c8b04a'; });
    for (var t3 = 0; t3 < 1; t3 += 0.06) { var px = cx + S * (0.16 + t3 * 0.1), py = S * (0.35 - t3 * 0.1 + t3 * t3 * 0.06); put(Math.round(px), Math.round(py), A.rustDk); }
    stroke(put, cx + S * 0.26, S * 0.31, cx + S * 0.24, S * 0.5, 0.8, function () { return A.deepLt; });
    glowDot(put, cx + S * 0.24, S * 0.52, S * 0.011, A.red, A.redLt);
    stroke(put, cx - S * 0.08, S * 0.45, cx - S * 0.15, S * 0.56, S * 0.02, function () { return '#c8b04a'; });
    stroke(put, cx - S * 0.155, S * 0.56, cx - S * 0.14, S * 0.64, 1.6, function () { return A.rust; });
    ell(put, cx, S * 0.34, S * 0.052, S * 0.055, function (tx, ty) { return mix(A.flesh, A.fleshDk, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, cx - S * 0.018, S * 0.33, S * 0.009, A.oil, A.glow, A.glowLt);
    optic(put, cx + S * 0.018, S * 0.33, S * 0.009, A.oil, A.glow, A.glowLt);
    ell(put, cx, S * 0.3, S * 0.065, S * 0.028, function (tx, ty) { return mix('#c8b04a', '#8a7628', tx + ty * 0.3); });
    dome(put, cx, S * 0.285, S * 0.045, S * 0.03, '#c8b04a', '#e0cc70', '#8a7628');
    stroke(put, cx + S * 0.05, S * 0.3, cx + S * 0.085, S * 0.33, 1.6, function () { return '#8a7628'; });
    bubbles(put, cx - S * 0.1, S * 0.3, 3, 3);
  }
  // 15 · TRENCH LOBSTER
  function drawLobster(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    for (var i = 0; i < 5; i++) {
      var sx = cx + S * (0.08 + i * 0.038), sy = S * (0.58 + i * 0.022);
      ell(put, sx, sy, S * (0.05 - i * 0.007), S * (0.04 - i * 0.005), function (tx, ty) { return mix('#c84a3a', '#6e2014', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    }
    fin(put, cx + S * 0.27, S * 0.68, cx + S * 0.34, S * 0.64, cx + S * 0.32, S * 0.74, '#c84a3a', '#6e2014');
    ell(put, cx - S * 0.02, S * 0.54, S * 0.09, S * 0.07, function (tx, ty) {
      var b = mix('#e06a4a', '#8a2a1a', clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty < 0.3) b = mix(b, '#ff9a6a', 0.3);
      return b;
    });
    for (var j = 0; j < 4; j++) stroke(put, cx - S * 0.04 + j * S * 0.035, S * 0.6, cx - S * 0.06 + j * S * 0.04, S * 0.7, 1.2, function () { return '#8a2a1a'; });
    [[-0.16, 0.46, 1], [-0.14, 0.62, 0]].forEach(function (d) {
      var dx = d[0], dy = d[1], open = d[2];
      stroke(put, cx - S * 0.08, S * 0.54, cx + dx * S, S * dy, S * 0.024, function () { return '#c84a3a'; });
      ell(put, cx + (dx - 0.06) * S, S * dy, S * 0.05, S * 0.035, function (tx, ty) { return mix('#e06a4a', '#8a2a1a', clamp(tx + ty * 0.4, 0, 1)); });
      if (open) {
        fin(put, cx + (dx - 0.1) * S, S * (dy - 0.03), cx + (dx - 0.14) * S, S * (dy - 0.05), cx + (dx - 0.08) * S, S * (dy - 0.01), '#e06a4a', '#8a2a1a');
        fin(put, cx + (dx - 0.1) * S, S * (dy + 0.03), cx + (dx - 0.14) * S, S * (dy + 0.05), cx + (dx - 0.08) * S, S * (dy + 0.01), '#c84a3a', '#6e2014');
      } else put(Math.round(cx + (dx - 0.1) * S), Math.round(S * dy), '#6e2014');
    });
    [[-0.05], [0.01]].forEach(function (d) { stroke(put, cx + d[0] * S, S * 0.49, cx + d[0] * S, S * 0.45, 1.2, function () { return '#8a2a1a'; }); optic(put, cx + d[0] * S, S * 0.44, S * 0.007, A.oil, A.oil, '#ffffff'); });
    [-1, 1].forEach(function (s) { stroke(put, cx - S * 0.02, S * 0.48, cx - S * 0.02 + s * S * 0.14, S * 0.36, 0.9, function () { return '#e06a4a'; }); });
  }
  // 16 · BANDED SEA SNAKE
  function drawSeaSnake(put, S) {
    var cx = S * 0.5;
    for (var t = 0; t < 1; t += 0.025) {
      var px = cx - S * 0.22 + t * S * 0.42, py = S * 0.55 + Math.sin(t * 7.5) * S * 0.07 * (1 - t * 0.3);
      var w = S * (0.016 + Math.sin(Math.min(t * 2.2, 1) * Math.PI * 0.6) * 0.016);
      ell(put, px, py, w, w, (function (t2) { return function (tx, ty) {
        var band = ((t2 * 22) | 0) % 2 === 0;
        return band ? mix('#2a3a44', '#101a20', ty) : mix('#c8d0d4', '#7a8a90', ty);
      }; })(t));
    }
    fin(put, cx + S * 0.2, S * 0.52, cx + S * 0.28, S * 0.47, cx + S * 0.27, S * 0.58, '#2a3a44', '#101a20');
    ell(put, cx - S * 0.23, S * 0.5, S * 0.032, S * 0.026, function (tx, ty) { return mix('#2a3a44', '#101a20', tx + ty * 0.3); });
    optic(put, cx - S * 0.245, S * 0.49, S * 0.007, A.oil, '#d8e84a', '#f8ffb0');
    stroke(put, cx - S * 0.26, S * 0.515, cx - S * 0.29, S * 0.525, 0.9, function () { return A.redLt; });
    put(Math.round(cx - S * 0.255), Math.round(S * 0.55), '#aef65a');
    put(Math.round(cx - S * 0.255), Math.round(S * 0.58), '#aef65a');
  }
  // 17 · LANTERN SNAIL
  function drawSnail(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    for (var t = 0; t < 1; t += 0.06) {
      var px = cx - S * 0.14 + t * S * 0.28, py = S * 0.66;
      ell(put, px, py, S * 0.035, S * 0.025, function (tx, ty) { return mix(A.glowDk, '#1a4a3a', ty); });
    }
    [[-0.16, -0.01], [-0.13, 0.015]].forEach(function (d) {
      stroke(put, cx + d[0] * S, S * 0.64, cx + (d[0] - 0.03) * S, S * (0.56 + d[1]), 1.2, function () { return A.glowDk; });
      glowDot(put, cx + (d[0] - 0.035) * S, S * (0.55 + d[1]), S * 0.006, A.glow, A.glowLt);
    });
    for (var a = 0; a < 12; a += 0.06) {
      var r = S * 0.015 + a * S * 0.0085;
      var x = cx + S * 0.04 + Math.cos(a + 2) * r, y = S * 0.52 + Math.sin(a + 2) * r * 0.85;
      put(Math.round(x), Math.round(y), (a * 2 | 0) % 2 ? A.glowLt : A.glow);
    }
    ell(put, cx + S * 0.04, S * 0.52, S * 0.045, S * 0.04, function (tx, ty) { return mix(A.glow, A.glowDk, clamp(tx + ty * 0.4, 0, 1)); });
    glowDot(put, cx + S * 0.04, S * 0.5, S * 0.014, A.glowLt, A.white);
    [[0.1, 0.4], [0, 0.36], [0.08, 0.3]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), A.glowLt); });
  }
  // 19 · KRAKEN SPAWN
  function drawKraken(put, S) {
    var cx = S * 0.5;
    dome(put, cx, S * 0.34, S * 0.12, S * 0.16, '#7a3a5a', '#aa5a80', '#3a1428');
    optic(put, cx - S * 0.05, S * 0.4, S * 0.016, A.oil, A.red, A.redLt);
    optic(put, cx + S * 0.05, S * 0.4, S * 0.016, A.oil, A.red, A.redLt);
    tentacle(put, cx - S * 0.08, S * 0.48, cx - S * 0.32, S * 0.62, S * 0.03, '#7a3a5a', '#3a1428', 5);
    tentacle(put, cx - S * 0.05, S * 0.5, cx - S * 0.18, S * 0.8, S * 0.03, '#7a3a5a', '#3a1428', 6);
    tentacle(put, cx, S * 0.51, cx + S * 0.04, S * 0.84, S * 0.032, '#8a4666', '#3a1428', 4);
    tentacle(put, cx + S * 0.05, S * 0.5, cx + S * 0.2, S * 0.78, S * 0.03, '#7a3a5a', '#3a1428', 6);
    tentacle(put, cx + S * 0.08, S * 0.48, cx + S * 0.33, S * 0.6, S * 0.03, '#8a4666', '#3a1428', 5);
    tentacle(put, cx + S * 0.1, S * 0.44, cx + S * 0.3, S * 0.36, S * 0.026, '#7a3a5a', '#3a1428', 7);
    [[-0.2, 0.6], [-0.12, 0.7], [0.12, 0.68], [0.24, 0.64]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), A.pinkLt); });
  }

  // ================= THE VOLT WYRM — segmented serpent =================
  function segShade(tx, ty) {
    var b = mix(V.lt, V.base, clamp(ty * 1.5, 0, 1));
    b = mix(b, V.dk, clamp((ty - 0.42) * 1.5, 0, 1));
    if (tx > 0.86) b = mix(b, V.dk, 0.3);
    return b;
  }
  // antlered dragon HEAD (facing left) — ported from lev160 head block, filling the canvas
  function drawWyrmHead(put, S) {
    var u = S / 160, X = function (v) { return v * u; };
    var hx = 88, hy = 74;                              // head recentred to fill the 128/canvas
    // skull + brow
    ell(put, X(hx), X(hy), X(21), X(17), segShade);
    ell(put, X(hx + 8), X(hy - 6), X(15), X(13), segShade);
    // long snout
    for (var t = 0; t <= 1; t += 0.06) ell(put, X(hx - 16 - t * 26), X(hy - 1 - t * 4), X(11.6 - t * 4.4), X(8.8 - t * 3), segShade);
    ell(put, X(hx - 45), X(hy - 8), X(4.8), X(4), segShade);
    put(Math.round(X(hx - 47)), Math.round(X(hy - 8)), A.oil);
    // upper lip + fangs
    stroke(put, X(hx - 43), X(hy + 4), X(hx - 10), X(hy + 8), X(2.4), function () { return V.dk; });
    for (var f = 0; f < 4; f++) stroke(put, X(hx - 38 + f * 8), X(hy + 5), X(hx - 39 + f * 8), X(hy + 12), X(2.2), function () { return '#ffffff'; });
    // open lower jaw
    for (var tj = 0; tj <= 1; tj += 0.1) ell(put, X(hx - 10 - tj * 26), X(hy + 17 + tj * 8), X(8.8 - tj * 3.4), X(5.8 - tj * 2), function (tx, ty) { return mix(segShade(tx, ty), V.dk, 0.2); });
    for (var fj = 0; fj < 3; fj++) stroke(put, X(hx - 16 - fj * 8), X(hy + 19 + fj * 2.4), X(hx - 14.8 - fj * 8), X(hy + 13 + fj * 2.4), X(2.2), function () { return '#ffffff'; });
    // maw interior + glow
    for (var yy = hy + 8; yy < hy + 17; yy += 1.4) row(put, Math.round(X(yy)), X(hx - 32), X(hx - 11), function (tx) { return mix(A.pinkDk, A.ink, clamp(tx + 0.25, 0, 1)); });
    glowDot(put, X(hx - 21), X(hy + 12), X(4.4), V.jawGlow, A.white);
    // eye
    optic(put, X(hx - 3), X(hy - 6), X(5), A.oil, V.eyeC, V.eyeC);
    stroke(put, X(hx - 13), X(hy - 13), X(hx + 7), X(hy - 14), X(3), function () { return V.dk; });
    // MANE frill (fans back, upper-right)
    for (var am = -1.35; am <= 0.25; am += 0.12) {
      var mx = hx + 14, my = hy - 2;
      var ex = mx + Math.cos(am) * 26, ey = my + Math.sin(am) * 26;
      stroke(put, X(mx), X(my), X(ex), X(ey), X(3.4), (function (a2) { return function () { return ((a2 * 12) | 0) % 2 ? V.crest[0] : V.crest[1]; }; })(am));
      put(Math.round(X(ex)), Math.round(X(ey)), V.crest[0]);
    }
    ell(put, X(hx + 6), X(hy - 6), X(13), X(11), segShade);
    optic(put, X(hx - 3), X(hy - 6), X(5), A.oil, V.eyeC, V.eyeC);
    // ANTLERS
    var antler = function (sx, sy) {
      stroke(put, X(sx), X(sy), X(sx + 16), X(sy - 16), X(3.4), function () { return V.antler; });
      stroke(put, X(sx + 16), X(sy - 16), X(sx + 32), X(sy - 22), X(2.6), function () { return mix(V.antler, '#8a7a5a', 0.3); });
      stroke(put, X(sx + 10), X(sy - 11), X(sx + 16), X(sy - 26), X(2.2), function () { return mix(V.antler, '#8a7a5a', 0.4); });
      stroke(put, X(sx + 24), X(sy - 19), X(sx + 30), X(sy - 32), X(1.8), function () { return mix(V.antler, '#8a7a5a', 0.45); });
    };
    antler(hx + 4, hy - 16); antler(hx + 12, hy - 13);
    // WHISKER BARBELS (flow back from the snout)
    [[-4, 1], [4, 1.6]].forEach(function (d) {
      var bx = hx - 40, by = hy + d[0] + 6, px = bx, py = by;
      for (var t2 = 0.05; t2 <= 1; t2 += 0.05) {
        var nx2 = bx - 12 * t2 + 52 * t2 * t2;
        var ny2 = by + Math.sin(t2 * 4.6) * 6.8 * d[1] + 26 * t2;
        stroke(put, X(px), X(py), X(nx2), X(ny2), X(2.6 - t2 * 1.2), (function (t3) { return function () { return t3 < 0.45 ? V.crest[0] : V.crest[1]; }; })(t2));
        px = nx2; py = ny2;
      }
    });
    stroke(put, X(hx - 14), X(hy + 22), X(hx - 19), X(hy + 33), X(2.2), function () { return V.crest[1]; });
    // crackle arcs off the crown
    boltArc(put, X, hx + 20, hy - 30, 20, -0.9);
    bubbles(put, X(hx + 40), X(hy - 40), 4, 5);
  }
  function boltArc(put, X, x0, y0, len, ang) {
    var px = x0, py = y0;
    for (var s = 0; s < 4; s++) {
      var nx = px + Math.cos(ang) * len / 4 + (s % 2 ? 4 : -4) * Math.sin(ang);
      var ny = py + Math.sin(ang) * len / 4 + (s % 2 ? -4 : 4) * Math.cos(ang);
      stroke(put, Math.round(px), Math.round(py), Math.round(nx), Math.round(ny), 1.4, (function (s2) { return function () { return s2 % 2 ? V.arcB : V.arcA; }; })(s));
      px = nx; py = ny;
    }
    put(Math.round(px), Math.round(py), '#ffffff');
  }
  // one BODY segment cross-section: spine-fin membrane on top, belly plate under,
  // scaled coil ring. `mode`: 0 normal · 1 charged · 2 live-wire.
  function bodySegment(put, S, mode) {
    var cx = S * 0.5, cy = S * 0.52;
    var lt = mode ? mix(V.lt, '#ffffff', mode === 2 ? 0.34 : 0.16) : V.lt;
    var base = mode ? mix(V.base, V.finC, mode === 2 ? 0.4 : 0.2) : V.base;
    // coil disc
    ell(put, cx, cy, S * 0.3, S * 0.28, function (tx, ty) {
      var b = mix(lt, base, clamp(ty * 1.4, 0, 1));
      b = mix(b, V.dk, clamp((ty - 0.5) * 1.4, 0, 1));
      if (tx > 0.85) b = mix(b, V.dk, 0.3);
      return b;
    });
    // belly plates (inner underside)
    for (var i = -2; i <= 2; i++) row(put, Math.round(cy + S * 0.12 + i * 2), cx - S * 0.16, cx + S * 0.16, function (tx) { return mix(V.belly, V.dk, 0.2 + Math.abs(tx - 0.5) * 0.4); });
    // spine-fin membrane fanning up
    for (var f = -3; f <= 3; f++) {
      var fx = cx + f * S * 0.07;
      var hgt = S * (0.16 - Math.abs(f) * 0.012);
      stroke(put, fx, cy - S * 0.22, fx, cy - S * 0.22 - hgt, 2.2, (function (f2) { return function () { return (f2 % 2) ? V.finC : V.finDk; }; })(f));
    }
    // scale glints
    [[-0.1, -0.02], [0.08, 0.04], [-0.02, 0.1]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(cy + d[1] * S), mix(lt, '#ffffff', 0.3)); });
    if (mode === 1) { boltArc(put, function (v) { return v; }, cx + S * 0.22, cy - S * 0.18, S * 0.16, -0.7); }
    if (mode === 2) {
      boltArc(put, function (v) { return v; }, cx + S * 0.24, cy - S * 0.14, S * 0.2, -0.6);
      boltArc(put, function (v) { return v; }, cx - S * 0.24, cy + S * 0.1, S * 0.18, 2.4);
    }
  }
  function drawWyrmBody(put, S) { bodySegment(put, S, 0); }
  function drawWyrmBodyCharged(put, S) { bodySegment(put, S, 1); }
  function drawWyrmBodyWire(put, S) { bodySegment(put, S, 2); }
  // TAIL segment with fluke
  function drawWyrmTail(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    for (var t = 0; t < 1; t += 0.05) {
      var px = cx - S * 0.18 + t * S * 0.3, py = cy - S * 0.02 + Math.sin(t * 2) * S * 0.03;
      var w = S * (0.16 - t * 0.13);
      ell(put, px, py, w, w, segShade);
    }
    // fluke fins
    fin(put, cx + S * 0.12, cy, cx + S * 0.36, cy - S * 0.2, cx + S * 0.28, cy + S * 0.06, V.finC, V.finDk);
    fin(put, cx + S * 0.12, cy, cx + S * 0.34, cy + S * 0.22, cx + S * 0.28, cy - S * 0.02, mix(V.finC, '#ffffff', 0.12), V.finDk);
    // spine-fin roots
    for (var f = -2; f <= 1; f++) stroke(put, cx + f * S * 0.06 - S * 0.06, cy - S * 0.14, cx + f * S * 0.06 - S * 0.06, cy - S * 0.14 - S * 0.1, 2, function () { return V.finDk; });
  }

  // ================= DESTRUCTIBLE CORAL (4 states) =================
  var CORAL_C = { base: '#c86a8a', lt: '#e8a0b8', dk: '#6e2a44', glow: A.pinkLt };
  function coralPristine(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    dome(put, cx, S * 0.56, S * 0.28, S * 0.24, CORAL_C.base, CORAL_C.lt, CORAL_C.dk);
    for (var a = 0; a < Math.PI; a += 0.16) {
      for (var t = 0.1; t < 0.95; t += 0.04) {
        var rr = S * (0.08 + t * 0.18);
        var px = cx + Math.cos(a + Math.sin(t * 9) * 0.18) * rr;
        var py = S * 0.54 - Math.sin(a + Math.sin(t * 9) * 0.18) * rr * 0.72;
        put(Math.round(px), Math.round(py), CORAL_C.dk);
      }
    }
    [[-0.14, 0.44], [0.06, 0.36], [0.16, 0.5], [-0.03, 0.52]].forEach(function (d) { glowDot(put, cx + d[0] * S, S * d[1], S * 0.01, CORAL_C.glow, A.white); });
  }
  function coralCracked(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    dome(put, cx, S * 0.58, S * 0.25, S * 0.2, CORAL_C.base, CORAL_C.lt, CORAL_C.dk);
    // fracture lines
    stroke(put, cx - S * 0.12, S * 0.4, cx + S * 0.06, S * 0.66, 1.6, function () { return A.oil; });
    stroke(put, cx + S * 0.1, S * 0.42, cx - S * 0.02, S * 0.68, 1.4, function () { return A.oil; });
    for (var a = 0; a < Math.PI; a += 0.22) {
      for (var t = 0.1; t < 0.9; t += 0.05) {
        var rr = S * (0.07 + t * 0.14);
        put(Math.round(cx + Math.cos(a) * rr), Math.round(S * 0.56 - Math.sin(a) * rr * 0.7), CORAL_C.dk);
      }
    }
    [[-0.1, 0.48], [0.1, 0.5]].forEach(function (d) { glowDot(put, cx + d[0] * S, S * d[1], S * 0.008, CORAL_C.glow, A.white); });
  }
  function coralCrumbling(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    dome(put, cx, S * 0.64, S * 0.2, S * 0.13, mix(CORAL_C.base, CORAL_C.dk, 0.3), CORAL_C.base, CORAL_C.dk);
    // broken chunks around
    [[-0.16, 0.62, 0.05], [0.15, 0.6, 0.045], [0.05, 0.5, 0.04]].forEach(function (d) {
      ell(put, cx + d[0] * S, S * d[1], S * d[2], S * d[2] * 0.7, function (tx, ty) { return mix(CORAL_C.dk, A.oil, clamp(tx + ty * 0.4, 0, 1)); });
    });
    stroke(put, cx - S * 0.08, S * 0.5, cx + S * 0.06, S * 0.62, 1.4, function () { return A.oil; });
    glowDot(put, cx, S * 0.58, S * 0.006, CORAL_C.glow, A.white);
  }
  function coralRubble(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    ell(put, cx, S * 0.72, S * 0.22, S * 0.07, function (tx, ty) { return mix(CORAL_C.dk, A.oil, clamp(tx * 0.8 + ty * 0.5, 0, 1)); });
    [[-0.12, 0.7, 0.04], [0.02, 0.72, 0.05], [0.14, 0.71, 0.035], [-0.04, 0.66, 0.03]].forEach(function (d) {
      ell(put, cx + d[0] * S, S * d[1], S * d[2], S * d[2] * 0.8, function (tx, ty) { return mix(mix(CORAL_C.base, CORAL_C.dk, 0.5), A.oil, clamp(tx + ty * 0.4, 0, 1)); });
    });
  }

  // ============================= DECOR (15) ==================================
  function drawWreck(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.36);
    for (var t = 0; t < 1; t += 0.03) {
      var px = cx - S * 0.28 + t * S * 0.56, py = S * 0.78 - Math.sin(t * Math.PI) * S * 0.06;
      ell(put, px, py, S * 0.02, S * 0.035, function (tx, ty) { return mix(A.rustLt, A.rustDk, clamp(tx + ty * 0.4, 0, 1)); });
    }
    [-0.2, -0.08, 0.04, 0.16].forEach(function (dx, i) {
      for (var t2 = 0; t2 < 1; t2 += 0.05) {
        var px2 = cx + dx * S + Math.sin(t2 * 1.3) * S * 0.06, py2 = S * 0.74 - t2 * S * 0.36;
        if (i === 2 && t2 > 0.6) break;
        ell(put, px2, py2, S * 0.014, S * 0.014, function (tx, ty) { return mix(A.rust, A.rustDk, tx + ty * 0.3); });
      }
    });
    for (var y = S * 0.56; y < S * 0.74; y++) {
      var t3 = (y - S * 0.56) / (S * 0.18);
      row(put, Math.round(y), cx - S * 0.28 + t3 * S * 0.03, cx - S * 0.02, (function (yy) { return function (tx) {
        var b = mix(A.rustLt, A.rustDk, clamp(tx * 1.1, 0, 1));
        if ((yy | 0) % 5 === 0) b = mix(b, A.oil, 0.4);
        return b;
      }; })(y));
    }
    stroke(put, cx - S * 0.2, S * 0.4, cx - S * 0.22, S * 0.56, 1.4, function () { return '#3a5a3a'; });
    stroke(put, cx + 0.04 * S, S * 0.46, cx + 0.05 * S, S * 0.6, 1.4, function () { return '#3a5a3a'; });
    glowDot(put, cx + S * 0.16, S * 0.5, S * 0.01, A.bio, A.bioLt);
    bubbles(put, cx, S * 0.36, 3, 4);
  }
  function drawBell(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    for (var y = S * 0.34; y < S * 0.7; y++) {
      var t = (y - S * 0.34) / (S * 0.36), w = S * (0.07 + t * 0.09);
      row(put, Math.round(y), cx - w, cx + w, (function (yy, t2) { return function (tx) {
        var b = mix(A.brassLt, A.brassDk, clamp(tx * 1.15 + t2 * 0.15, 0, 1));
        if ((yy | 0) % 8 === 0) b = mix(b, A.brassDk, 0.4);
        return b;
      }; })(y, t));
    }
    row(put, Math.round(S * 0.7), cx - S * 0.17, cx + S * 0.17, function () { return A.rustDk; });
    for (var i = -2; i <= 2; i++) put(Math.round(cx + i * S * 0.06), Math.round(S * 0.68), A.oil);
    ell(put, cx, S * 0.48, S * 0.05, S * 0.05, function (tx) { return mix(A.brassDk, A.oil, tx); });
    ell(put, cx, S * 0.48, S * 0.035, S * 0.035, function (tx, ty) { return mix('#ffd88a', '#8a6418', tx + ty * 0.4); });
    put(Math.round(cx - 1), Math.round(S * 0.47), '#fff0c8');
    ell(put, cx, S * 0.3, S * 0.02, S * 0.016, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.1 ? A.rustDk : null); });
    for (var yc = S * 0.08; yc < S * 0.28; yc += 5) { put(Math.round(cx), Math.round(yc), A.rust); put(Math.round(cx + 1), Math.round(yc + 2), A.rustDk); }
    bubbles(put, cx + S * 0.12, S * 0.34, 4, 3);
  }
  function drawAnchor(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    stroke(put, cx, S * 0.26, cx, S * 0.66, S * 0.03, function () { return A.rust; });
    stroke(put, cx - S * 0.008, S * 0.26, cx - S * 0.008, S * 0.66, S * 0.01, function () { return A.rustLt; });
    stroke(put, cx - S * 0.11, S * 0.32, cx + S * 0.11, S * 0.32, S * 0.024, function () { return A.rustDk; });
    ell(put, cx, S * 0.24, S * 0.028, S * 0.026, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.12 ? mix(A.rust, A.rustDk, tx) : null); });
    for (var a = 0.15; a < 1.35; a += 0.05) { ell(put, cx - Math.sin(a) * S * 0.14, S * 0.66 - (Math.cos(a) - 1) * S * 0.12, S * 0.016, S * 0.016, function (tx, ty) { return mix(A.rust, A.rustDk, tx + ty * 0.3); }); }
    fin(put, cx - S * 0.15, S * 0.5, cx - S * 0.2, S * 0.44, cx - S * 0.1, S * 0.48, A.rust, A.rustDk);
    for (var a2 = 0.15; a2 < 0.9; a2 += 0.05) { ell(put, cx + Math.sin(a2) * S * 0.14, S * 0.66 - (Math.cos(a2) - 1) * S * 0.12, S * 0.016, S * 0.016, function (tx, ty) { return mix(A.rustDk, A.oil, tx + ty * 0.3); }); }
    ell(put, cx + S * 0.15, S * 0.72, S * 0.1, S * 0.045, function (tx, ty) { return mix('#4a5468', '#2a3242', clamp(tx + ty * 0.4, 0, 1)); });
    [[0.01, 0.4], [-0.02, 0.52], [0.02, 0.6]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), A.shell); });
  }
  function drawChest(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.13, S * 0.56, cx + S * 0.13, S * 0.72, A.rustDk, A.rust, A.oil);
    [0.6, 0.66].forEach(function (y) { row(put, Math.round(S * y), cx - S * 0.13, cx + S * 0.13, function () { return A.brassDk; }); });
    for (var y2 = S * 0.42; y2 < S * 0.52; y2++) {
      var t = (y2 - S * 0.42) / (S * 0.1);
      row(put, Math.round(y2), cx - S * (0.13 - t * 0.02), cx + S * (0.13 - t * 0.02), (function (t2) { return function (tx) { return mix(A.rust, A.rustDk, clamp(tx + t2 * 0.3, 0, 1)); }; })(t));
    }
    ell(put, cx, S * 0.55, S * 0.1, S * 0.035, function (tx, ty) { return mix('#f8d878', '#8a6418', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [[-0.06, 0.535], [0, 0.525], [0.055, 0.535]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), '#fff0c8'); });
    glowDot(put, cx, S * 0.53, S * 0.008, '#ffd88a', '#fff0c8');
    [[-0.18, 0.72], [0.17, 0.74], [0.2, 0.7]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.012, S * 0.008, function (tx) { return mix('#f8d878', '#8a6418', tx); }); });
    put(Math.round(cx - S * 0.05), Math.round(S * 0.47), A.brass);
  }
  function drawKelp(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [[-0.12, 0.9, 0.05], [0.02, 1, 0], [0.14, 0.8, -0.04]].forEach(function (d) {
      var dx = d[0], hMult = d[1], sway = d[2];
      for (var t = 0; t < 1; t += 0.025) {
        var px = cx + dx * S + Math.sin(t * 5 + dx * 20) * S * (0.02 + t * 0.03) + t * sway * S;
        var py = S * 0.86 - t * S * 0.72 * hMult;
        ell(put, px, py, S * 0.016, S * 0.01, function (tx, ty) { return mix('#4a7a3a', '#1e3a18', clamp(tx + ty * 0.4, 0, 1)); });
        if ((t * 20 | 0) % 3 === 0) fin(put, px, py, px + S * 0.055, py - S * 0.02, px + S * 0.04, py + S * 0.02, '#5a9a42', '#2a4a1e');
        if ((t * 20 | 0) % 5 === 4) put(Math.round(px - 2), Math.round(py), '#8ac862');
      }
    });
    bubbles(put, cx + S * 0.06, S * 0.2, 3, 3);
  }
  function drawTubeworms(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    ell(put, cx, S * 0.7, S * 0.13, S * 0.07, function (tx, ty) { return mix(A.rockLt, A.rockDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [[-0.08, -0.06, 0.9], [-0.02, 0.01, 1], [0.05, 0.03, 0.8], [0.1, 0.09, 0.7], [-0.13, -0.12, 0.65]].forEach(function (d) {
      var x0 = d[0], x1 = d[1], h = d[2];
      for (var t = 0; t < 1; t += 0.05) {
        var px = cx + (x0 + (x1 - x0) * t) * S, py = S * 0.68 - t * S * 0.3 * h;
        ell(put, px, py, S * 0.02, S * 0.014, function (tx, ty) { return mix('#e8e4d8', '#9a968a', clamp(tx + ty * 0.3, 0, 1)); });
      }
      var tipx = cx + x1 * S, tipy = S * 0.68 - S * 0.3 * h;
      for (var i = -2; i <= 2; i++) stroke(put, tipx, tipy, tipx + i * 2.2, tipy - S * 0.035, 1.3, (function (i2) { return function () { return i2 % 2 ? A.red : A.redDk; }; })(i));
    });
  }
  function drawSmoker(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    for (var y = S * 0.3; y < S * 0.82; y++) {
      var t = (y - S * 0.3) / (S * 0.52), w = S * (0.035 + t * 0.1 + Math.sin(t * 9) * 0.008);
      row(put, Math.round(y), cx - w, cx + w, (function (t2) { return function (tx) {
        var b = mix('#3a3040', '#16121c', clamp(tx * 1.1 + t2 * 0.1, 0, 1));
        if (((tx * 10) | 0) % 4 === 0) b = mix(b, '#5a4a5a', 0.3);
        return b;
      }; })(t));
    }
    ell(put, cx, S * 0.3, S * 0.03, S * 0.014, function (tx) { return mix('#ff7d3a', '#7a1a0a', tx); });
    for (var t3 = 0; t3 < 1; t3 += 0.07) {
      var px = cx + Math.sin(t3 * 4) * S * 0.03 * (1 + t3), py = S * 0.28 - t3 * S * 0.2;
      ell(put, px, py, S * (0.02 + t3 * 0.03), S * (0.015 + t3 * 0.02), (function (t4) { return function (tx) { return mix('#2a2430', A.ink, clamp(tx + t4 * 0.4, 0, 0.9)); }; })(t3));
    }
    [[-0.07, 0.4], [0.08, 0.5]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), '#ff9a5a'); });
    ell(put, cx + S * 0.14, S * 0.78, S * 0.025, S * 0.016, function (tx) { return mix('#d8d4c8', '#8a8678', tx); });
  }
  function drawWhaleFall(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.34);
    for (var t = 0; t < 1; t += 0.05) {
      var px = cx - S * 0.26 + t * S * 0.52, py = S * 0.72 + Math.sin(t * Math.PI) * S * 0.015;
      ell(put, px, py, S * 0.022, S * 0.018, function (tx, ty) { return mix(A.bone, '#8a8670', clamp(tx + ty * 0.4, 0, 1)); });
    }
    [-0.18, -0.09, 0, 0.09, 0.18].forEach(function (dx, i) {
      var h = 0.3 - Math.abs(dx) * 0.5;
      for (var t2 = 0; t2 < 1; t2 += 0.04) {
        var px2 = cx + dx * S + Math.sin(t2 * 1.5) * S * 0.05 * (dx < 0 ? -1 : 1);
        var py2 = S * 0.7 - t2 * S * h;
        ell(put, px2, py2, S * 0.011, S * 0.011, function (tx, ty) { return mix(A.bone, '#8a8670', tx + ty * 0.3); });
      }
    });
    ell(put, cx - S * 0.3, S * 0.68, S * 0.08, S * 0.06, function (tx, ty) { return mix(A.bone, '#6e6a58', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    ell(put, cx - S * 0.35, S * 0.66, S * 0.02, S * 0.016, function () { return A.oil; });
    [[-0.1, 0.72], [0.06, 0.7], [0.16, 0.73]].forEach(function (d) { glowDot(put, cx + d[0] * S, S * d[1], S * 0.005, A.glow, A.glowLt); });
  }
  function drawClam(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    for (var y = S * 0.58; y < S * 0.72; y++) {
      var t = (y - S * 0.58) / (S * 0.14), w = S * (0.16 - t * 0.05);
      row(put, Math.round(y), cx - w, cx + w, (function (t2) { return function (tx) {
        var b = mix(A.shell, A.shellDk, clamp(tx * 1.1 + t2 * 0.2, 0, 1));
        if (((tx * 12) | 0) % 3 === 0) b = mix(b, '#8a8268', 0.4);
        return b;
      }; })(t));
    }
    for (var y2 = S * 0.42; y2 < S * 0.56; y2++) {
      var t3 = (y2 - S * 0.42) / (S * 0.14), w2 = S * (0.05 + t3 * 0.11);
      row(put, Math.round(y2), cx - w2, cx + w2, (function (t4) { return function (tx) {
        var b = mix('#c8c0a8', A.shellDk, clamp(tx * 1.1 + (1 - t4) * 0.3, 0, 1));
        if (((tx * 12) | 0) % 3 === 0) b = mix(b, '#8a8268', 0.35);
        return b;
      }; })(t3));
    }
    for (var x = -0.14; x <= 0.14; x += 0.01) {
      put(Math.round(cx + x * S), Math.round(S * 0.565 + Math.sin(x * 60) * 1.8), '#3a9a9a');
      put(Math.round(cx + x * S), Math.round(S * 0.575 + Math.sin(x * 60 + 1) * 1.8), '#1e5a5e');
    }
    ell(put, cx, S * 0.55, S * 0.028, S * 0.026, function (tx, ty) { return mix('#f8f4ff', '#b0aac8', clamp(tx + ty * 0.4, 0, 1)); });
    glowDot(put, cx - S * 0.008, S * 0.542, S * 0.006, '#ffffff', '#ffffff');
  }
  function drawSub(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    for (var t = 0; t < 1; t += 0.03) {
      var px = cx - S * 0.2 + t * S * 0.42, py = S * 0.66 - t * S * 0.14;
      var w = S * (0.03 + Math.sin(t * Math.PI) * 0.075);
      ell(put, px, py, w, w * 0.85, function (tx, ty) {
        var b = mix('#c8a83a', '#6e5a14', clamp(ty * 1.3, 0, 1));
        if (ty > 0.7) b = mix(b, A.rustDk, 0.5);
        return b;
      });
    }
    plate(put, cx + S * 0.02, S * 0.42, cx + S * 0.1, S * 0.5, '#c8a83a', '#e8cc70', '#6e5a14');
    [[0, 1], [1, 0], [0, -1]].forEach(function (d) { stroke(put, cx + S * 0.24, S * 0.5, cx + S * 0.24 + d[0] * S * 0.04, S * 0.5 + d[1] * S * 0.04, 1.6, function () { return A.rustDk; }); });
    ell(put, cx - S * 0.12, S * 0.6, S * 0.028, S * 0.028, function (tx) { return mix(A.deepDk, A.oil, tx); });
    stroke(put, cx - S * 0.06, S * 0.56, cx, S * 0.62, 1, function () { return A.oil; });
    ell(put, cx - S * 0.22, S * 0.72, S * 0.09, S * 0.04, function (tx, ty) { return mix('#4a5468', '#2a3242', tx + ty * 0.3); });
    bubbles(put, cx + S * 0.06, S * 0.4, 3, 3);
  }
  function drawCrates(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    var crate = function (x0, y0, w, h, tilt, burst) {
      for (var y = 0; y < h; y++) {
        row(put, Math.round(y0 + y), x0 + tilt * y, x0 + w + tilt * y, (function (yy) { return function (tx) {
          var b = mix(A.rustLt, A.rustDk, clamp(tx * 1.1 + yy / h * 0.2, 0, 1));
          if (((tx * 6) | 0) % 5 === 0 || yy % Math.round(h * 0.9) < 1.2) b = mix(b, A.oil, 0.4);
          return b;
        }; })(y));
      }
      stroke(put, x0, y0, x0 + w, y0 + h, 1, function () { return A.rustDk; });
      if (burst) fin(put, x0 + w * 0.5, y0, x0 + w * 0.3, y0 - h * 0.4, x0 + w * 0.75, y0 - h * 0.3, A.rust, A.rustDk);
    };
    crate(cx - S * 0.22, S * 0.58, S * 0.16, S * 0.14, 0, false);
    crate(cx + S * 0.02, S * 0.6, S * 0.15, S * 0.13, 0.04, true);
    crate(cx - S * 0.1, S * 0.44, S * 0.14, S * 0.12, -0.03, false);
    [[0.06, 0.56], [0.12, 0.54], [0.09, 0.5]].forEach(function (d) { glowDot(put, cx + d[0] * S, S * d[1], S * 0.007, A.glow, A.glowLt); });
  }
  function drawCannon(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    plate(put, cx - S * 0.1, S * 0.6, cx + S * 0.12, S * 0.7, A.rustDk, A.rust, A.oil);
    [[-0.05], [0.07]].forEach(function (d) { ell(put, cx + d[0] * S, S * 0.72, S * 0.035, S * 0.035, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.12 ? mix(A.rust, A.rustDk, tx) : null); }); });
    for (var t = 0; t < 1; t += 0.05) {
      var px = cx + S * 0.04 - t * S * 0.26, py = S * 0.58 - t * S * 0.14, w = S * (0.038 - t * 0.012);
      ell(put, px, py, w, w, function (tx, ty) { return mix('#3a4048', '#14181e', clamp(tx + ty * 0.4, 0, 1)); });
    }
    ell(put, cx - S * 0.22, S * 0.44, S * 0.026, S * 0.026, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.1 ? '#14181e' : A.oil); });
    [[0, 0.55], [-0.08, 0.5], [-0.15, 0.47]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), A.shell); });
    stroke(put, cx + S * 0.1, S * 0.58, cx + S * 0.12, S * 0.48, 1.3, function () { return '#3a5a3a'; });
    [[0.16, 0.72], [0.2, 0.74], [0.18, 0.69]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.018, S * 0.018, function (tx, ty) { return mix('#3a4048', '#14181e', tx + ty); }); });
  }
  function drawAnemone(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    [[-0.14, 0.66, A.pink, A.pinkLt], [0.02, 0.7, A.violet, A.violetLt], [0.15, 0.64, A.bio, A.bioLt]].forEach(function (d) {
      var ax = cx + d[0] * S, ay = S * d[1], c = d[2], cLt = d[3];
      ell(put, ax, ay + S * 0.03, S * 0.035, S * 0.025, function (tx, ty) { return mix(c, A.deepDk, clamp(ty + tx * 0.3, 0, 1)); });
      for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI - Math.PI;
        var wob = Math.sin(i * 2.7) * 0.02;
        stroke(put, ax, ay, ax + Math.cos(a) * S * (0.05 + wob), ay + Math.sin(a) * S * 0.055 - S * 0.01, 1.3, (function (i2) { return function () { return i2 % 2 ? c : cLt; }; })(i));
        put(Math.round(ax + Math.cos(a) * S * (0.055 + wob)), Math.round(ay + Math.sin(a) * S * 0.06 - S * 0.012), cLt);
      }
    });
    ell(put, cx + S * 0.02, S * 0.6, S * 0.022, S * 0.014, function (tx) { return ((tx * 3 | 0) % 2 ? '#e86a2a' : '#f4f4f4'); });
  }
  function drawLighthouse(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.34);
    for (var t = 0; t < 1; t += 0.025) {
      var px = cx - S * 0.26 + t * S * 0.5, py = S * 0.72 - t * S * 0.24, w = S * (0.075 - t * 0.03);
      ell(put, px, py, w, w * 0.9, (function (t2) { return function (tx, ty) {
        var stripe = ((t2 * 8) | 0) % 2 === 0;
        return stripe ? mix('#c84a3a', '#6e2014', clamp(tx + ty * 0.4, 0, 1)) : mix('#e8e4d8', '#9a968a', clamp(tx + ty * 0.4, 0, 1));
      }; })(t));
    }
    ell(put, cx + S * 0.26, S * 0.46, S * 0.045, S * 0.045, function (tx, ty) { return mix('#3a4048', '#14181e', tx + ty * 0.3); });
    glowDot(put, cx + S * 0.26, S * 0.455, S * 0.018, '#ffd88a', '#fff0c8');
    for (var t3 = 0; t3 < 1; t3 += 0.06) {
      var px3 = cx + S * (0.3 + t3 * 0.16), py3 = S * (0.44 - t3 * 0.1);
      put(Math.round(px3), Math.round(py3), mix('#ffd88a', A.deep, 0.4 + t3 * 0.5));
      put(Math.round(px3), Math.round(py3 + 3 + t3 * 6), mix('#ffd88a', A.deep, 0.5 + t3 * 0.5));
    }
    ell(put, cx - S * 0.3, S * 0.76, S * 0.06, S * 0.035, function (tx) { return mix('#7a8a90', '#3a464e', tx); });
    stroke(put, cx - S * 0.1, S * 0.6, cx - S * 0.12, S * 0.5, 1.4, function () { return '#3a5a3a'; });
  }

  // ============================== TILES (7) ==================================
  function n2(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function tileFn(fn) { return function (put, Sz) { for (var y = 0; y < Sz; y++) for (var x = 0; x < Sz; x++) { var c = fn(x, y); if (c) put(x, y, c); } }; }
  var tSilt = tileFn(function (x, y) {
    var b = mix('#3a4458', '#232c3e', n2(x * 0.06, y * 0.06) * 0.8);
    var rip = Math.sin((y + Math.sin(x * 0.04) * 6) * 0.3);
    if (rip > 0.8) b = mix(b, '#1a2230', 0.3);
    if (n2(x, y) > 0.985) b = mix(b, '#5a6a86', 0.5);
    if (n2(x + 5, y) > 0.993) b = mix(b, A.bio, 0.35);
    return b;
  });
  var tBasalt = tileFn(function (x, y) {
    var cs = 48 * 0.2, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    var d1 = 9e9, d2 = 9e9, id = 0;
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      var px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      var d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 5 + (cyi + j); } else if (d < d2) d2 = d;
    }
    var b = mix('#2e3646', '#181e2a', n2(id, id * 2) * 0.7 + n2(x * 0.15, y * 0.15) * 0.2);
    if (Math.sqrt(d2) - Math.sqrt(d1) < 2) b = mix(b, '#0a0e16', 0.7);
    return b;
  });
  var tBlackSand = tileFn(function (x, y) {
    var b = mix('#20242e', '#101218', n2(x * 0.07, y * 0.07) * 0.8);
    var rip = Math.sin((y + Math.sin(x * 0.06) * 7) * 0.4);
    if (rip > 0.65) b = mix(b, '#080a10', 0.4);
    if (rip < -0.75) b = mix(b, '#3a4050', 0.35);
    if (n2(x, y) > 0.988) b = mix(b, '#6a7288', 0.5);
    return b;
  });
  var tShellGravel = tileFn(function (x, y) {
    var b = mix('#5a5a52', '#383832', n2(x * 0.5, y * 0.5) * 0.6);
    var f = n2(Math.floor(x / 4), Math.floor(y / 4));
    if (f > 0.55) b = mix(b, f > 0.85 ? '#c8c0a8' : '#8a8672', 0.65);
    if (n2(x + 3, y + 7) > 0.96) b = mix(b, '#e8e0c8', 0.6);
    if (n2(x + 9, y + 2) > 0.988) b = mix(b, A.pinkLt, 0.4);
    return b;
  });
  var tVentRock = tileFn(function (x, y) {
    var cs = 48 * 0.24, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    var d1 = 9e9, d2 = 9e9;
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      var px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      var d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    var b = mix('#2a2430', '#141018', n2(x * 0.1, y * 0.1) * 0.6);
    var edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 2.6) b = mix(b, n2(x, y) > 0.35 ? '#ff7d3a' : '#c23a1a', 0.7);
    else if (edge < 4.5) b = mix(b, '#5a2a1a', 0.4);
    return b;
  });
  var tReef = tileFn(function (x, y) {
    var patch = n2(Math.floor(x / 11), Math.floor(y / 11));
    var cols = ['#8a4a6a', '#4a7a8a', '#8a6a4a', '#5a6a9a', '#7a8a5a'];
    var b = mix(cols[(patch * 5) | 0], '#241c2a', 0.35 + n2(x * 0.3, y * 0.3) * 0.35);
    if (n2(x * 1.3, y * 1.3) > 0.88) b = mix(b, '#e8d8e0', 0.35);
    if (n2(x + 4, y + 9) > 0.985) b = mix(b, A.bioLt, 0.5);
    return b;
  });
  var tDrop = tileFn(function (x, y) {
    var d = n2(x * 0.05, y * 0.05);
    var b = mix('#10141e', '#04060a', clamp(0.3 + d * 0.5 + (x + y) / (48 * 2) * 0.4, 0, 1));
    if (n2(x + 1, y + 3) > 0.992) b = mix(b, '#3a4458', 0.6);
    if (n2(x + 8, y + 8) > 0.997) b = mix(b, A.bioDk, 0.5);
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var AB_ART = {
    A: A, V: V,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (11) ----
      ctx.spr('abyssJellyHi', MS, MS, drawJelly);
      ctx.spr('abyssSwordHi', MS, MS, drawSword);
      ctx.spr('abyssVoltHi', MS, MS, drawVolt);
      ctx.spr('abyssSquidHi', MS, MS, drawVampSquid);
      ctx.spr('abyssStarfishHi', MS, MS, drawStarfish);
      ctx.spr('abyssDiverHi', MS, MS, drawDiver);
      ctx.spr('abyssFishermanHi', MS, MS, drawFisherman);
      ctx.spr('abyssLobsterHi', MS, MS, drawLobster);
      ctx.spr('abyssSnakeHi', MS, MS, drawSeaSnake);
      ctx.spr('abyssSnailHi', MS, MS, drawSnail);
      ctx.spr('abyssKrakenHi', MS, MS, drawKraken);
      ctx.MOB_HI.ghostJelly = 'abyssJellyHi';           ctx.MOB_DISPLAY.ghostJelly = 48;
      ctx.MOB_HI.swordfish = 'abyssSwordHi';            ctx.MOB_DISPLAY.swordfish = 54;
      ctx.MOB_HI.voltEel = 'abyssVoltHi';               ctx.MOB_DISPLAY.voltEel = 50;
      ctx.MOB_HI.vampireSquid = 'abyssSquidHi';         ctx.MOB_DISPLAY.vampireSquid = 52;
      ctx.MOB_HI.crimsonStarfish = 'abyssStarfishHi';   ctx.MOB_DISPLAY.crimsonStarfish = 42;
      ctx.MOB_HI.drownedDiver = 'abyssDiverHi';         ctx.MOB_DISPLAY.drownedDiver = 54;
      ctx.MOB_HI.ghostFisherman = 'abyssFishermanHi';   ctx.MOB_DISPLAY.ghostFisherman = 54;
      ctx.MOB_HI.trenchLobster = 'abyssLobsterHi';      ctx.MOB_DISPLAY.trenchLobster = 52;
      ctx.MOB_HI.bandedSeaSnake = 'abyssSnakeHi';       ctx.MOB_DISPLAY.bandedSeaSnake = 50;
      ctx.MOB_HI.lanternSnail = 'abyssSnailHi';         ctx.MOB_DISPLAY.lanternSnail = 40;
      ctx.MOB_HI.krakenSpawn = 'abyssKrakenHi';         ctx.MOB_DISPLAY.krakenSpawn = 62;
      // ---- boss: THE VOLT WYRM (head is the boss model; body/tail are segments) ----
      ctx.spr('abyssWyrmHead', 128, 128, drawWyrmHead);
      ctx.BOSS_HI.voltWyrm = { key: 'abyssWyrmHead', size: 128, display: 150, bodyW: 52, bodyH: 46 };
      ctx.spr('abyssWyrmBody', 96, 96, drawWyrmBody);
      ctx.spr('abyssWyrmBodyCharged', 96, 96, drawWyrmBodyCharged);
      ctx.spr('abyssWyrmBodyWire', 96, 96, drawWyrmBodyWire);
      ctx.spr('abyssWyrmTail', 96, 96, drawWyrmTail);
      // ---- DESTRUCTIBLE CORAL — 4 damage states ----
      ctx.spr('abyssCoral0', 64, 64, coralPristine);
      ctx.spr('abyssCoral1', 64, 64, coralCracked);
      ctx.spr('abyssCoral2', 64, 64, coralCrumbling);
      ctx.spr('abyssCoral3', 64, 64, coralRubble);
      // ---- decor (15) ----
      ctx.spr('abdWreck', 64, 64, drawWreck);
      ctx.spr('abdBell', 64, 64, drawBell);
      ctx.spr('abdAnchor', 64, 64, drawAnchor);
      ctx.spr('abdChest', 64, 64, drawChest);
      ctx.spr('abdKelp', 64, 64, drawKelp);
      ctx.spr('abdTubeworms', 64, 64, drawTubeworms);
      ctx.spr('abdSmoker', 64, 64, drawSmoker);
      ctx.spr('abdWhaleFall', 64, 64, drawWhaleFall);
      ctx.spr('abdClam', 64, 64, drawClam);
      ctx.spr('abdSub', 64, 64, drawSub);
      ctx.spr('abdCrates', 64, 64, drawCrates);
      ctx.spr('abdCannon', 64, 64, drawCannon);
      ctx.spr('abdAnemone', 64, 64, drawAnemone);
      ctx.spr('abdLighthouse', 64, 64, drawLighthouse);
      // ---- tiles (7) ----
      ctx.tex('absilt', 48, 48, tSilt);
      ctx.tex('abbasalt', 48, 48, tBasalt);
      ctx.tex('abblacksand', 48, 48, tBlackSand);
      ctx.tex('abshell', 48, 48, tShellGravel);
      ctx.tex('abvent', 48, 48, tVentRock);
      ctx.tex('abreef', 48, 48, tReef);
      ctx.tex('abdrop', 48, 48, tDrop);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AB_ART;
  root.ABYSS_ART = AB_ART;
})(typeof window !== 'undefined' ? window : this);
