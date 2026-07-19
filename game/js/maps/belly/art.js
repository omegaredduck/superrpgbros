// ============================================================================
// game/js/maps/belly/art.js — BELLY OF THE BEAST (realm 20) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 3 4 5 6 7 8 9 10
// 11 12 16 17 18 19 (the 16-mob roster; 13/14/15/20 NEVER ported), THE TITAN
// WHALE (render_belly_boss_final.js — look #4 ORCA DRESS on the head-on maw
// pose: black hide, white eye patches + chin, TEETH-INSIDE-THE-MAW fix), the
// UVULA set piece + WRECK DECK hull, 20 decor, tiles #1 2 3 4 6 8 9 (acid
// shallows animated by phase-shifting the current highlights), + ARENA SAND
// stage art. JONAH-as-a-videogame mood: wet gut flesh, acid green, the
// swallowed ship's amber lantern light.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- belly palette (belly_kit.js B, verbatim) -----------------------------
  var B = {
    OUT: '#160a0c',
    flesh: '#8a3a48', fleshLt: '#c26a76', fleshDk: '#4a1620',
    meat: '#a84a52', meatLt: '#d8848a', meatDk: '#5a2028',
    gloss: '#e8a8b0',
    vein: '#5a7ab0', veinDk: '#2a3a60',
    acid: '#9ae83a', acidLt: '#d8ffa0', acidDk: '#4a7a10',
    bile: '#c8d84a', bileDk: '#6a721a',
    bone: '#e8dcc4', boneDk: '#948a6a', boneDkk: '#4a4432',
    wood: '#8a5a34', woodLt: '#b8845a', woodDk: '#46281a',
    rope: '#c8a86a', ropeDk: '#7a6034',
    brass: '#c8963c', brassLt: '#f0cc80', brassDk: '#6e4a1c',
    sail: '#d8ccb0', sailDk: '#8a8268',
    skin: '#c89478', skinDk: '#8a5e44', skinPale: '#a8b0a0', skinPaleDk: '#6a7462',
    scale: '#3a8a8a', scaleLt: '#6ac8c0', scaleDk: '#164a4e',
    shell: '#c84a3a', shellLt: '#e07a5a', shellDk: '#6e2014',
    glow: '#7df9d8', glowLt: '#d8fff2', glowDk: '#2a9a7a',
    gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a5e10',
    red: '#d84a4a', redLt: '#ff9a8a', redDk: '#7a1a22',
    violet: '#8a5adc', violetLt: '#c8aaff', violetDk: '#4a2a8a',
    ink: '#141020', oil: '#0a0608', white: '#f4eee4', tooth: '#f4eee0',
    water: '#2a6a8a', waterLt: '#5aaccc', waterDk: '#123a50'
  };

  // ---- shared helpers (swamp lineage + belly_kit) ---------------------------
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      row(put, y, x0, x1, (function (vt2) {
        return function (tx) {
          var b = mix(hi, base, clamp(vt2 * 1.15, 0, 1));
          b = mix(b, dk, clamp((vt2 - 0.55) * 1.25, 0, 1));
          if (tx < 0.13) b = mix(b, hi, 0.55);
          if (tx > 0.9) b = mix(b, dk, 0.5);
          return b;
        };
      })(vt));
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
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, function () { return B.oil; }); }
  function glowDot(put, cx, cy, r, c, cLt) {
    for (var a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * r * 1.8), Math.round(cy + Math.sin(a) * r * 1.8), mix(c, B.fleshDk, 0.55));
    ell(put, cx, cy, r, r, function () { return c; });
    put(Math.round(cx), Math.round(cy), cLt || B.glowLt);
  }
  function tentacle(put, x0, y0, x1, y1, w, c, cDk, waves) {
    var dx = x1 - x0, dy = y1 - y0, nx = -dy, ny = dx, L = Math.hypot(dx, dy) || 1;
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
  function drips(put, cx, cy, n) {
    for (var i = 0; i < n; i++) {
      var dx = cx + Math.sin(i * 2.7) * 5, dy = cy + i * 6 + (i % 2) * 3;
      put(Math.round(dx), Math.round(dy), B.acid);
      if (i % 2 === 0) put(Math.round(dx), Math.round(dy + 2), B.acidLt);
    }
  }
  function wisps(put, cx, cy, n) {
    for (var i = 0; i < n; i++) {
      var wx = cx + Math.sin(i * 2.1) * 6, wy = cy - i * 5;
      put(Math.round(wx), Math.round(wy), mix(B.bile, B.fleshDk, 0.5));
    }
  }
  function h2(x, y, s) { var n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ================= MOBS (#1 2 3 4 5 6 7 8 9 10 11 12 16 17 18 19) =========
  function drawFisherman(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.045, S * 0.58, cx + s * S * 0.05, S * 0.82, S * 0.036, function () { return '#3a4a3a'; });
      plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, '#2a3628', '#3a4a3a', B.oil);
    });
    for (var y = S * 0.4; y < S * 0.6; y++) {
      var t = (y - S * 0.4) / (S * 0.2), w = S * (0.085 + t * 0.02);
      row(put, Math.round(y), cx - w, cx + w, (function (t2, y2) {
        return function (tx) {
          if (t2 > 0.5 && ((tx * 11 + y2 * 0.7) | 0) % 5 === 0) return null;
          var b = mix('#c8b04a', '#8a7628', clamp(tx * 1.2, 0, 1));
          if (tx > 0.75) b = mix(b, '#5a4c14', 0.5);
          if (((tx * 9) | 0) % 4 === 0 && t2 > 0.4) b = mix(b, B.acidDk, 0.4);
          return b;
        };
      })(t, y));
    }
    stroke(put, cx + S * 0.08, S * 0.45, cx + S * 0.15, S * 0.36, S * 0.02, function () { return '#c8b04a'; });
    for (var t3 = 0; t3 < 1; t3 += 0.06) { var px = cx + S * (0.16 + t3 * 0.1), py = S * (0.35 - t3 * 0.1 + t3 * t3 * 0.06); put(Math.round(px), Math.round(py), B.woodDk); }
    stroke(put, cx + S * 0.26, S * 0.31, cx + S * 0.24, S * 0.5, 0.8, function () { return B.sailDk; });
    glowDot(put, cx + S * 0.24, S * 0.52, S * 0.011, B.red, B.redLt);
    stroke(put, cx - S * 0.08, S * 0.45, cx - S * 0.15, S * 0.56, S * 0.02, function () { return '#c8b04a'; });
    stroke(put, cx - S * 0.155, S * 0.56, cx - S * 0.14, S * 0.64, 1.6, function () { return B.brassDk; });
    ell(put, cx, S * 0.34, S * 0.052, S * 0.055, function (tx, ty) { return mix(B.skinPale, B.skinPaleDk, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, cx - S * 0.018, S * 0.33, S * 0.009, B.oil, B.acid, B.acidLt);
    optic(put, cx + S * 0.018, S * 0.33, S * 0.009, B.oil, B.acid, B.acidLt);
    ell(put, cx, S * 0.3, S * 0.065, S * 0.028, function (tx, ty) { return mix('#c8b04a', '#8a7628', tx + ty * 0.3); });
    dome(put, cx, S * 0.285, S * 0.045, S * 0.03, '#c8b04a', '#e0cc70', '#8a7628');
    stroke(put, cx + S * 0.05, S * 0.3, cx + S * 0.085, S * 0.33, 1.6, function () { return '#8a7628'; });
    wisps(put, cx - S * 0.12, S * 0.32, 3);
  }
  function drawLobster(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    for (var i = 0; i < 5; i++) {
      var sx = cx + S * (0.08 + i * 0.038), sy = S * (0.58 + i * 0.022);
      ell(put, sx, sy, S * (0.05 - i * 0.007), S * (0.04 - i * 0.005), function (tx, ty) { return mix(B.shell, B.shellDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    }
    fin(put, cx + S * 0.27, S * 0.68, cx + S * 0.34, S * 0.64, cx + S * 0.32, S * 0.74, B.shell, B.shellDk);
    ell(put, cx - S * 0.02, S * 0.54, S * 0.09, S * 0.07, function (tx, ty) {
      var b = mix(B.shellLt, B.shellDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty < 0.3) b = mix(b, '#ff9a6a', 0.3);
      return b;
    });
    for (var i2 = 0; i2 < 4; i2++) stroke(put, cx - S * 0.04 + i2 * S * 0.035, S * 0.6, cx - S * 0.06 + i2 * S * 0.04, S * 0.7, 1.2, function () { return B.shellDk; });
    [[-0.16, 0.46, 1], [-0.14, 0.62, 0]].forEach(function (a) {
      var dx = a[0], dy = a[1], open = a[2];
      stroke(put, cx - S * 0.08, S * 0.54, cx + dx * S, S * dy, S * 0.024, function () { return B.shell; });
      ell(put, cx + (dx - 0.06) * S, S * dy, S * 0.05, S * 0.035, function (tx, ty) { return mix(B.shellLt, B.shellDk, clamp(tx + ty * 0.4, 0, 1)); });
      if (open) {
        fin(put, cx + (dx - 0.1) * S, S * (dy - 0.03), cx + (dx - 0.14) * S, S * (dy - 0.05), cx + (dx - 0.08) * S, S * (dy - 0.01), B.shellLt, B.shellDk);
        fin(put, cx + (dx - 0.1) * S, S * (dy + 0.03), cx + (dx - 0.14) * S, S * (dy + 0.05), cx + (dx - 0.08) * S, S * (dy + 0.01), B.shell, B.shellDk);
      } else { put(Math.round(cx + (dx - 0.1) * S), Math.round(S * dy), B.shellDk); }
    });
    [[-0.05], [0.01]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.49, cx + a[0] * S, S * 0.45, 1.2, function () { return B.shellDk; }); optic(put, cx + a[0] * S, S * 0.44, S * 0.007, B.oil, B.oil, '#ffffff'); });
    [-1, 1].forEach(function (s) { stroke(put, cx - S * 0.02, S * 0.48, cx - S * 0.02 + s * S * 0.14, S * 0.36, 0.9, function () { return B.shellLt; }); });
  }
  function drawSeaSnake(put, S) {
    var cx = S * 0.5;
    ell(put, cx + S * 0.2, S * 0.6, S * 0.1, S * 0.09, function (tx, ty) { return mix(B.meat, B.fleshDk, clamp(tx + ty * 0.4, 0, 1)); });
    ell(put, cx + S * 0.18, S * 0.58, S * 0.045, S * 0.04, function () { return B.oil; });
    for (var t = 0; t < 1; t += 0.025) {
      var px = cx + S * 0.18 - t * S * 0.42, py = S * 0.55 + Math.sin(t * 7.5) * S * 0.07 * (1 - t * 0.3);
      var w = S * (0.016 + Math.sin(Math.min(t * 2.2, 1) * Math.PI * 0.6) * 0.016);
      ell(put, px, py, w, w, (function (t2) {
        return function (tx, ty) {
          var band = ((t2 * 22) | 0) % 2 === 0;
          return band ? mix('#2a3a44', '#101a20', ty) : mix('#c8d0d4', '#7a8a90', ty);
        };
      })(t));
    }
    ell(put, cx - S * 0.25, S * 0.46, S * 0.032, S * 0.026, function (tx, ty) { return mix('#2a3a44', '#101a20', tx + ty * 0.3); });
    optic(put, cx - S * 0.265, S * 0.45, S * 0.007, B.oil, '#d8e84a', '#f8ffb0');
    stroke(put, cx - S * 0.28, S * 0.475, cx - S * 0.31, S * 0.485, 0.9, function () { return B.redLt; });
    put(Math.round(cx - S * 0.275), Math.round(S * 0.51), B.acid);
    put(Math.round(cx - S * 0.275), Math.round(S * 0.54), B.acid);
  }
  function drawStarfish(put, S) {
    var cx = S * 0.5, cy = S * 0.52; shadow(put, S, cx, S * 0.22);
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
      for (var t = 0; t < 1; t += 0.06) {
        var w = S * (0.055 - t * 0.038);
        ell(put, cx + Math.cos(a) * t * S * 0.19, cy + Math.sin(a) * t * S * 0.19, w, w, function (tx, ty) { return mix('#e05a3a', '#8a2014', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
      }
      for (var t2 = 0.15; t2 < 0.95; t2 += 0.2) put(Math.round(cx + Math.cos(a) * t2 * S * 0.19), Math.round(cy + Math.sin(a) * t2 * S * 0.19 - 1), '#ff9a6a');
    }
    ell(put, cx, cy, S * 0.055, S * 0.05, function (tx, ty) { return mix('#e05a3a', '#8a2014', clamp(tx + ty * 0.4, 0, 1)); });
    optic(put, cx, cy - S * 0.005, S * 0.013, B.oil, B.gold, B.goldLt);
    [[1], [4]].forEach(function (arr) {
      var a2 = -Math.PI / 2 + arr[0] * (Math.PI * 2 / 5);
      [0.35, 0.55, 0.75].forEach(function (tt) { put(Math.round(cx + Math.cos(a2) * tt * S * 0.19), Math.round(cy + Math.sin(a2) * tt * S * 0.19 + 2), B.gloss); });
    });
    [[-0.18, 0.75], [0.16, 0.78]].forEach(function (a3) { ell(put, cx + a3[0] * S, S * a3[1], S * 0.02, S * 0.01, function (tx) { return mix(B.meatLt, B.meat, tx); }); });
  }
  function drawMermaid(put, S) {
    var cx = S * 0.5;
    ell(put, cx + S * 0.06, S * 0.74, S * 0.14, S * 0.08, function (tx, ty) { return mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    for (var t = 0; t < 1; t += 0.04) {
      var px = cx + S * (0.02 + t * 0.2), py = S * (0.62 + Math.sin(t * 2.6) * 0.06 + t * 0.04);
      var w = S * (0.05 - t * 0.032);
      ell(put, px, py, w, w * 0.8, (function (t2) {
        return function (tx, ty) {
          var b = mix(B.scale, B.scaleDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
          if (((t2 * 16) | 0) % 2) b = mix(b, B.scaleLt, 0.3);
          return b;
        };
      })(t));
    }
    fin(put, cx + S * 0.23, S * 0.68, cx + S * 0.32, S * 0.62, cx + S * 0.3, S * 0.76, B.scaleLt, B.scaleDk);
    for (var y = S * 0.44; y < S * 0.62; y++) {
      var ty2 = (y - S * 0.44) / (S * 0.18), w2 = S * (0.045 + ty2 * 0.015);
      row(put, Math.round(y), cx - S * 0.02 - w2, cx - S * 0.02 + w2, (function (ty3) { return function (tx) { return mix(B.skin, B.skinDk, clamp(tx * 1.1 + ty3 * 0.2, 0, 1)); }; })(ty2));
    }
    [[-0.05], [0.005]].forEach(function (a) { ell(put, cx + a[0] * S, S * 0.5, S * 0.018, S * 0.014, function (tx, ty) { return mix('#c87a8a', '#7a3a4a', tx + ty); }); });
    stroke(put, cx - S * 0.05, S * 0.48, cx - S * 0.14, S * 0.4, S * 0.015, function () { return B.skin; });
    stroke(put, cx + S * 0.01, S * 0.48, cx + S * 0.05, S * 0.58, S * 0.014, function () { return B.skin; });
    ell(put, cx - S * 0.03, S * 0.4, S * 0.042, S * 0.045, function (tx, ty) { return mix(B.skin, B.skinDk, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, cx - S * 0.045, S * 0.39, S * 0.008, B.oil, B.glow, B.glowLt);
    ell(put, cx - S * 0.035, S * 0.425, S * 0.008, S * 0.01, function () { return B.ink; });
    for (var t4 = 0; t4 < 1; t4 += 0.06) {
      var hx = cx + S * (0.0 + t4 * 0.1), hy = S * (0.36 + t4 * 0.22 + Math.sin(t4 * 6) * 0.015);
      stroke(put, hx, hy, hx + S * 0.03, hy + S * 0.02, S * 0.014, (function (t5) { return function () { return (t5 * 10 | 0) % 2 ? '#6a2a4a' : '#4a1a34'; }; })(t4));
    }
    [[-0.16, 0.32, 0], [-0.22, 0.26, 1], [-0.12, 0.24, 2]].forEach(function (a) {
      put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.glowLt);
      stroke(put, cx + a[0] * S + 1, S * a[1], cx + a[0] * S + 1, S * a[1] - 4, 0.9, function () { return B.glowLt; });
      if (a[2] === 1) put(Math.round(cx + a[0] * S + 3), Math.round(S * a[1] - 5), B.white);
    });
  }
  function drawPirate(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.04, S * 0.58, cx + s * S * 0.05, S * 0.8, S * 0.034, function () { return '#4a3a5a'; });
      plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.8, cx + s * S * 0.05 + S * 0.035, S * 0.86, B.woodDk, B.wood, B.oil);
    });
    for (var y = S * 0.4; y < S * 0.58; y++) {
      var t = (y - S * 0.4) / (S * 0.18), w = S * (0.08 + t * 0.015);
      row(put, Math.round(y), cx - w, cx + w, (function (y2) {
        return function (tx) {
          var b = ((y2 / (S * 0.022)) | 0) % 2 ? mix(B.white, B.sailDk, tx) : mix(B.red, B.redDk, tx);
          if (tx > 0.8 || tx < 0.2) b = mix('#5a2a2a', '#341418', tx);
          return b;
        };
      })(y));
    }
    row(put, Math.round(S * 0.56), cx - S * 0.08, cx + S * 0.08, function (tx) { return mix(B.gold, B.goldDk, tx); });
    stroke(put, cx + S * 0.08, S * 0.44, cx + S * 0.17, S * 0.34, S * 0.018, function () { return '#5a2a2a'; });
    for (var t2 = 0; t2 < 1; t2 += 0.05) {
      var bx = cx + S * (0.17 + t2 * 0.12), by = S * (0.33 - t2 * 0.1 + t2 * t2 * 0.05);
      stroke(put, bx, by, bx + 2, by + 1, 1.6, (function (t3) { return function () { return t3 > 0.85 ? B.white : '#c8d0d4'; }; })(t2));
    }
    ell(put, cx + S * 0.17, S * 0.345, S * 0.018, S * 0.014, function (tx, ty) { return mix(B.gold, B.goldDk, ty); });
    stroke(put, cx - S * 0.08, S * 0.44, cx - S * 0.14, S * 0.52, S * 0.017, function () { return '#5a2a2a'; });
    stroke(put, cx - S * 0.145, S * 0.52, cx - S * 0.13, S * 0.58, 1.6, function () { return B.brass; });
    ell(put, cx, S * 0.34, S * 0.05, S * 0.052, function (tx, ty) { return mix(B.skin, B.skinDk, clamp(tx + ty * 0.3, 0, 1)); });
    for (var y2 = S * 0.36; y2 < S * 0.4; y2++) row(put, Math.round(y2), cx - S * 0.035, cx + S * 0.035, function (tx) { return mix('#3a2418', '#1a0e08', tx); });
    dome(put, cx, S * 0.31, S * 0.05, S * 0.026, B.red, B.redLt, B.redDk);
    stroke(put, cx + S * 0.05, S * 0.31, cx + S * 0.085, S * 0.35, 1.4, function () { return B.redDk; });
    optic(put, cx - S * 0.018, S * 0.335, S * 0.008, B.oil, B.oil, '#ffffff');
    put(Math.round(cx + S * 0.018), Math.round(S * 0.335), B.ink);
    stroke(put, cx + S * 0.005, S * 0.32, cx + S * 0.035, S * 0.325, 0.9, function () { return B.ink; });
    put(Math.round(cx - S * 0.01), Math.round(S * 0.365), B.goldLt);
  }
  function drawDeckhand(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.035, S * 0.6, cx + s * S * 0.045, S * 0.8, S * 0.018, function () { return B.bone; });
      ell(put, cx + s * S * 0.045, S * 0.82, S * 0.028, S * 0.014, function (tx, ty) { return mix(B.bone, B.boneDk, tx); });
    });
    for (var i = 0; i < 5; i++) {
      var y = S * (0.44 + i * 0.032);
      stroke(put, cx - S * (0.07 - i * 0.008), y, cx + S * (0.07 - i * 0.008), y + 1, S * 0.014, (function (i2) { return function () { return mix(B.bone, B.boneDk, i2 * 0.15); }; })(i));
    }
    stroke(put, cx, S * 0.42, cx, S * 0.6, S * 0.014, function () { return B.boneDk; });
    [[-0.08, 0.44], [0.07, 0.5]].forEach(function (a) { fin(put, cx + a[0] * S, S * a[1], cx + (a[0] - 0.02) * S, S * (a[1] + 0.1), cx + (a[0] + 0.03) * S, S * (a[1] + 0.08), '#4a3a5a', '#2a1e34'); });
    stroke(put, cx - S * 0.07, S * 0.46, cx - S * 0.16, S * 0.56, S * 0.013, function () { return B.bone; });
    stroke(put, cx + S * 0.07, S * 0.46, cx + S * 0.15, S * 0.38, S * 0.013, function () { return B.bone; });
    stroke(put, cx + S * 0.15, S * 0.38, cx + S * 0.15, S * 0.28, S * 0.012, function () { return B.woodDk; });
    fin(put, cx + S * 0.15, S * 0.28, cx + S * 0.22, S * 0.3, cx + S * 0.15, S * 0.34, '#8a6a4a', B.brassDk);
    ell(put, cx, S * 0.34, S * 0.048, S * 0.05, function (tx, ty) { return mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.4, 0, 1)); });
    ell(put, cx - S * 0.018, S * 0.33, S * 0.011, S * 0.013, function () { return B.oil; });
    ell(put, cx + S * 0.018, S * 0.33, S * 0.011, S * 0.013, function () { return B.oil; });
    put(Math.round(cx - S * 0.018), Math.round(S * 0.332), B.glow);
    put(Math.round(cx + S * 0.018), Math.round(S * 0.332), B.glow);
    ell(put, cx, S * 0.395, S * 0.026, S * 0.018, function (tx, ty) { return mix(B.boneDk, B.oil, ty); });
    for (var i3 = -2; i3 <= 2; i3++) put(Math.round(cx + i3 * S * 0.012), Math.round(S * 0.375), B.tooth);
  }
  function drawRats(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    [[-0.14, 0.6, 1], [0.06, 0.55, -1], [0.16, 0.68, 1]].forEach(function (a, i) {
      var dx = a[0], dy = a[1], dir = a[2], rx = cx + dx * S, ry = S * dy, sc = 1 - i * 0.12;
      ell(put, rx, ry, S * 0.055 * sc, S * 0.035 * sc, (function (dir2) { return function (tx, ty) { return mix('#6a5a4a', '#342a20', clamp(tx * (dir2 > 0 ? 1 : -1) * 0.5 + 0.5 + ty * 0.4, 0, 1)); }; })(dir));
      ell(put, rx + dir * S * 0.05 * sc, ry - S * 0.012, S * 0.028 * sc, S * 0.022 * sc, function (tx, ty) { return mix('#6a5a4a', '#342a20', tx + ty * 0.3); });
      ell(put, rx + dir * S * 0.035 * sc, ry - S * 0.035, S * 0.012 * sc, S * 0.012 * sc, function (tx, ty) { return mix('#8a7460', '#4a3a2c', ty); });
      put(Math.round(rx + dir * S * 0.075 * sc), Math.round(ry - S * 0.014), '#e88a9a');
      optic(put, rx + dir * S * 0.055 * sc, ry - S * 0.02, S * 0.006, B.oil, B.red, B.redLt);
      for (var t = 0; t < 1; t += 0.08) put(Math.round(rx - dir * S * (0.05 + t * 0.09) * sc), Math.round(ry + Math.sin(t * 5) * S * 0.015), '#c88a8a');
      [[-0.02], [0.02]].forEach(function (fx) { stroke(put, rx + fx[0] * S, ry + S * 0.03, rx + fx[0] * S - dir * S * 0.012, ry + S * 0.05, 1, function () { return '#342a20'; }); });
    });
    ell(put, cx - S * 0.02, S * 0.72, S * 0.02, S * 0.012, function (tx) { return mix(B.sail, B.sailDk, tx); });
  }
  function drawParrot(put, S) {
    var cx = S * 0.5;
    stroke(put, cx - S * 0.2, S * 0.72, cx + S * 0.22, S * 0.66, S * 0.02, function () { return B.wood; });
    stroke(put, cx + S * 0.1, S * 0.64, cx + S * 0.12, S * 0.74, 1.2, function () { return B.rope; });
    ell(put, cx, S * 0.48, S * 0.06, S * 0.09, function (tx, ty) {
      var b = mix(B.red, B.redDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty > 0.7) b = mix(b, B.gold, 0.3);
      return b;
    });
    fin(put, cx + S * 0.04, S * 0.42, cx + S * 0.17, S * 0.5, cx + S * 0.06, S * 0.56, '#3a6ac8', '#1a3a7a');
    fin(put, cx + S * 0.05, S * 0.44, cx + S * 0.14, S * 0.44, cx + S * 0.05, S * 0.52, B.red, B.redDk);
    for (var i = -1; i <= 1; i++) stroke(put, cx + S * 0.01 + i * 2, S * 0.56, cx + S * (0.02 + i * 0.02), S * 0.72, 1.4, (function (i2) { return function () { return i2 === 0 ? '#3a6ac8' : B.redDk; }; })(i));
    ell(put, cx - S * 0.01, S * 0.37, S * 0.04, S * 0.042, function (tx, ty) { return mix(B.red, B.redDk, clamp(tx + ty * 0.3, 0, 1)); });
    ell(put, cx - S * 0.03, S * 0.36, S * 0.018, S * 0.02, function (tx, ty) { return mix(B.white, B.sailDk, ty); });
    optic(put, cx - S * 0.028, S * 0.36, S * 0.008, B.oil, B.gold, B.goldLt);
    fin(put, cx - S * 0.045, S * 0.385, cx - S * 0.1, S * 0.4, cx - S * 0.04, S * 0.415, '#c8d0d4', '#5a6068');
    fin(put, cx - S * 0.045, S * 0.415, cx - S * 0.08, S * 0.435, cx - S * 0.035, S * 0.43, '#8a929a', '#3a4048');
    [[-0.14, 0.36], [-0.16, 0.4]].forEach(function (a) { stroke(put, cx + a[0] * S, S * a[1], cx + (a[0] - 0.03) * S, S * a[1], 1, function () { return B.white; }); });
    [[-0.02], [0.03]].forEach(function (fx) { stroke(put, cx + fx[0] * S, S * 0.56, cx + fx[0] * S, S * 0.66, 1.2, function () { return '#8a8268'; }); });
  }
  function drawCrab(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    ell(put, cx, S * 0.54, S * 0.13, S * 0.085, function (tx, ty) {
      var b = mix('#a86a3a', '#5a3014', clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (ty < 0.25) b = mix(b, '#d89a5a', 0.35);
      if (((tx * 13 + ty * 7) | 0) % 6 === 0) b = mix(b, B.meatDk, 0.3);
      return b;
    });
    [[-0.06, 0.48], [0.04, 0.46], [0.09, 0.52]].forEach(function (a) { ell(put, cx + a[0] * S, S * a[1], S * 0.014, S * 0.01, function (tx, ty) { return mix(B.bone, B.boneDk, ty); }); put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.oil); });
    for (var i = 0; i < 3; i++) {
      [-1, 1].forEach(function (s) {
        stroke(put, cx + s * S * 0.11, S * (0.56 + i * 0.02), cx + s * S * (0.19 + i * 0.015), S * (0.62 + i * 0.035), 1.5, function () { return '#7a4620'; });
        stroke(put, cx + s * S * (0.19 + i * 0.015), S * (0.62 + i * 0.035), cx + s * S * (0.16 + i * 0.015), S * (0.7 + i * 0.03), 1.3, function () { return '#5a3014'; });
      });
    }
    [-1, 1].forEach(function (s) {
      ell(put, cx + s * S * 0.09, S * 0.64, S * 0.05, S * 0.04, function (tx, ty) { return mix('#c87a3a', '#5a3014', clamp(tx + ty * 0.4, 0, 1)); });
      fin(put, cx + s * S * 0.11, S * 0.61, cx + s * S * 0.15, S * 0.58, cx + s * S * 0.12, S * 0.64, '#d89a5a', '#5a3014');
    });
    [[-0.03], [0.03]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.47, cx + a[0] * S, S * 0.42, 1.3, function () { return '#7a4620'; }); optic(put, cx + a[0] * S, S * 0.41, S * 0.008, B.oil, B.oil, '#ffffff'); });
    wisps(put, cx - S * 0.01 * S / S, S * 0.5 - 8, 2);
  }
  function drawSlug(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    for (var t = 0; t < 1; t += 0.08) ell(put, cx + S * (0.1 + t * 0.2), S * (0.7 + t * 0.02), S * 0.03 * (1 - t * 0.5), S * 0.012, (function (t2) { return function (tx) { return mix(B.acid, B.acidDk, tx * 0.7 + t2 * 0.3); }; })(t));
    for (var t3 = 0; t3 < 1; t3 += 0.05) {
      var px = cx - S * 0.12 + t3 * S * 0.26, py = S * 0.62 - Math.sin(t3 * Math.PI) * S * 0.05;
      var w = S * (0.03 + Math.sin(t3 * Math.PI) * 0.05);
      ell(put, px, py, w, w * 0.9, (function (t4) {
        return function (tx, ty) {
          var b = mix(B.acid, B.acidDk, clamp(tx * 0.8 + ty * 0.6, 0, 1));
          if (ty < 0.3) b = mix(b, B.acidLt, 0.45);
          if (((t4 * 12) | 0) % 3 === 0) b = mix(b, B.bileDk, 0.3);
          return b;
        };
      })(t3));
    }
    ell(put, cx - S * 0.13, S * 0.54, S * 0.04, S * 0.045, function (tx, ty) { return mix(B.acid, B.acidDk, clamp(tx + ty * 0.4, 0, 1)); });
    [[-0.17, -0.01], [-0.14, -0.03]].forEach(function (a) {
      stroke(put, cx + a[0] * S + S * 0.02, S * 0.52, cx + a[0] * S, S * (0.46 + a[1]), 1.2, function () { return B.acidDk; });
      glowDot(put, cx + a[0] * S, S * (0.45 + a[1]), S * 0.006, B.bile, B.acidLt);
    });
    glowDot(put, cx - S * 0.24, S * 0.38, S * 0.016, B.acid, B.acidLt);
    drips(put, cx - S * 0.24, S * 0.42, 2);
  }
  function drawJelly(put, S) {
    var cx = S * 0.5;
    dome(put, cx, S * 0.38, S * 0.13, S * 0.11, B.bile, '#e8f47a', B.bileDk);
    ell(put, cx, S * 0.36, S * 0.09, S * 0.06, function (tx, ty) { return mix('#e8f47a', B.bile, ty); });
    glowDot(put, cx, S * 0.34, S * 0.015, '#e8f47a', B.white);
    ell(put, cx, S * 0.4, S * 0.04, S * 0.03, function (tx, ty) { return mix(B.acid, B.acidDk, ty); });
    for (var i = -3; i <= 3; i++) {
      var tx0 = cx + i * S * 0.035;
      for (var t = 0; t < 1; t += 0.06) {
        var px = tx0 + Math.sin(t * 6 + i) * S * 0.014, py = S * 0.46 + t * S * 0.34;
        put(Math.round(px), Math.round(py), t % 0.24 < 0.12 ? '#e8f47a' : B.bileDk);
      }
    }
    [[-0.08, 0.66], [0.06, 0.74], [0.11, 0.6]].forEach(function (a) { put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.white); });
  }
  function drawLamprey(put, S) {
    var cx = S * 0.5;
    for (var t = 0; t < 1; t += 0.03) {
      var px = cx + S * (0.18 - t * 0.34), py = S * (0.66 - t * 0.22 + Math.sin(t * 5) * 0.03 * (1 - t));
      var w = S * (0.02 + Math.sin(Math.min(t * 2, 1) * Math.PI * 0.6) * 0.022);
      ell(put, px, py, w, w, (function (t2) {
        return function (tx, ty) {
          var b = mix('#5a6a8a', '#242c44', clamp(tx + ty * 0.4, 0, 1));
          if (((t2 * 18) | 0) % 4 === 0) b = mix(b, '#8a9ab8', 0.25);
          return b;
        };
      })(t));
    }
    for (var i = 0; i < 5; i++) put(Math.round(cx - S * (0.1 + i * 0.018)), Math.round(S * (0.5 - i * 0.014)), B.oil);
    ell(put, cx - S * 0.18, S * 0.42, S * 0.05, S * 0.05, function (tx, ty) { return mix(B.meatLt, B.meatDk, clamp((Math.hypot(tx - 0.5, ty - 0.5) * 2), 0, 1)); });
    ell(put, cx - S * 0.18, S * 0.42, S * 0.022, S * 0.022, function () { return B.oil; });
    for (var a = 0; a < 6.28; a += 0.45) {
      put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.035), Math.round(S * 0.42 + Math.sin(a) * S * 0.035), B.tooth);
      if ((a * 2 | 0) % 2) put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.018), Math.round(S * 0.42 + Math.sin(a) * S * 0.018), B.gold);
    }
    optic(put, cx - S * 0.14, S * 0.38, S * 0.008, B.oil, B.red, B.redLt);
    [[0.16, 0.68], [0.22, 0.64]].forEach(function (a2) { stroke(put, cx + a2[0] * S, S * a2[1], cx + (a2[0] + 0.05) * S, S * (a2[1] + 0.02), 1, function () { return B.acidLt; }); });
  }
  function drawWorm(put, S) {
    var cx = S * 0.5;
    for (var y = S * 0.62; y < S * 0.82; y++) {
      var t = (y - S * 0.62) / (S * 0.2);
      row(put, Math.round(y), cx - S * 0.24, cx + S * 0.24, (function (t2) {
        return function (tx) {
          var hole = Math.abs(tx - 0.5) < 0.14 - t2 * 0.06;
          if (hole && t2 < 0.5) return null;
          return mix(B.meat, B.fleshDk, clamp(tx * 0.6 + t2 * 0.5, 0, 1));
        };
      })(t));
    }
    [[-0.1, 0.62], [0.09, 0.61], [-0.04, 0.6], [0.03, 0.63]].forEach(function (a) { ell(put, cx + a[0] * S, S * a[1], S * 0.018, S * 0.012, function (tx, ty) { return mix(B.meatLt, B.meatDk, ty); }); });
    for (var t3 = 0; t3 < 1; t3 += 0.05) {
      var px = cx + Math.sin(t3 * 2.5) * S * 0.02, py = S * (0.62 - t3 * 0.3);
      var w = S * (0.055 - t3 * 0.012);
      ell(put, px, py, w, w * 0.8, (function (t4) {
        return function (tx, ty) {
          var b = mix('#c88a7a', '#6a3a30', clamp(tx * 0.9 + ty * 0.4, 0, 1));
          if (((t4 * 14) | 0) % 2) b = mix(b, '#e8aa96', 0.3);
          return b;
        };
      })(t3));
    }
    var hy = S * 0.32;
    [[-1, 0], [1, 0], [0, -1]].forEach(function (a) { fin(put, cx, hy, cx + a[0] * S * 0.08, hy + a[1] * S * 0.02 - S * 0.06, cx + a[0] * S * 0.03, hy - S * 0.01, B.meatLt, B.meatDk); });
    ell(put, cx, hy, S * 0.03, S * 0.026, function () { return B.oil; });
    for (var a2 = 0; a2 < 6.28; a2 += 0.7) put(Math.round(cx + Math.cos(a2) * S * 0.022), Math.round(hy + Math.sin(a2) * S * 0.02), B.tooth);
    [[-0.16, 0.5], [0.15, 0.46], [0.1, 0.55]].forEach(function (a3) { put(Math.round(cx + a3[0] * S), Math.round(S * a3[1]), B.meatLt); });
    drips(put, cx + S * 0.06, hy + S * 0.04, 2);
  }
  function drawKrill(put, S) {
    var cx = S * 0.5, cy = S * 0.5, seed = 9;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (var i = 0; i < 30; i++) {
      var a = rnd() * 6.28, r = Math.sqrt(rnd()) * S * 0.18;
      var kx = cx + Math.cos(a) * r, ky = cy + Math.sin(a) * r * 0.8;
      var dir = rnd() > 0.5 ? 1 : -1, big = 1 + rnd() * 0.6;
      ell(put, kx, ky, 2.4 * big, 1.8 * big, function (tx, ty) { return mix('#ffb0a0', '#c85a52', clamp(tx + ty * 0.4, 0, 1)); });
      stroke(put, kx + dir * 2 * big, ky, kx + dir * 5 * big, ky + 2.5 * big, 1.4 * big, function () { return '#e88a7a'; });
      stroke(put, kx + dir * 5 * big, ky + 2.5 * big, kx + dir * 6 * big, ky + 4 * big, 1, function () { return '#c85a52'; });
      put(Math.round(kx - dir * big), Math.round(ky - big), B.oil);
      stroke(put, kx - dir * 2 * big, ky - big, kx - dir * 5 * big, ky - 3 * big, 0.8, function () { return '#ffd0c0'; });
      if (i % 2 === 0) put(Math.round(kx + dir * big), Math.round(ky + 2.4 * big), '#ffd0c0');
    }
    [[-0.2, -0.02], [-0.24, 0.06], [-0.19, 0.13]].forEach(function (a) {
      ell(put, cx + a[0] * S, cy + a[1] * S, 3.4, 2.4, function (tx, ty) { return mix('#ffd0c0', '#e88a7a', ty); });
      stroke(put, cx + a[0] * S + 3, cy + a[1] * S, cx + a[0] * S + 7, cy + a[1] * S + 3, 1.6, function () { return '#e88a7a'; });
      put(Math.round(cx + a[0] * S - 2), Math.round(cy + a[1] * S - 1), B.oil);
      stroke(put, cx + a[0] * S - 3, cy + a[1] * S - 2, cx + a[0] * S - 7, cy + a[1] * S - 4, 0.8, function () { return '#ffd0c0'; });
    });
    [[0.14, -0.08], [0.2, 0.02], [0.16, 0.12]].forEach(function (a) { stroke(put, cx + a[0] * S, cy + a[1] * S, cx + (a[0] + 0.06) * S, cy + a[1] * S, 1, function () { return mix(B.meatLt, B.fleshDk, 0.4); }); });
  }
  function drawPolyp(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    for (var t = 0; t < 1; t += 0.05) {
      var px = cx + Math.sin(t * 2) * S * 0.02, py = S * (0.78 - t * 0.24);
      var w = S * (0.045 - t * 0.01);
      ell(put, px, py, w, w * 0.8, (function (t2) {
        return function (tx, ty) {
          var b = mix(B.meat, B.fleshDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
          if (((t2 * 10) | 0) % 2) b = mix(b, B.meatLt, 0.25);
          return b;
        };
      })(t));
    }
    dome(put, cx + S * 0.01, S * 0.44, S * 0.085, S * 0.095, B.meatLt, B.gloss, B.meatDk);
    [[-0.05, 0.4, -0.08, 0.48], [0.04, 0.38, 0.08, 0.46], [0, 0.36, -0.02, 0.44]].forEach(function (a) { stroke(put, cx + a[0] * S, S * a[1], cx + a[2] * S, S * a[3], 1, function () { return B.vein; }); });
    ell(put, cx + S * 0.01, S * 0.36, S * 0.02, S * 0.014, function (tx, ty) { return mix(B.meatDk, B.oil, ty); });
    wisps(put, cx + S * 0.01, S * 0.32, 4);
    ell(put, cx + S * 0.03, S * 0.24, S * 0.026, S * 0.016, function (tx) { return mix(B.bile, B.bileDk, tx); });
    [[-0.02, 0.44], [0.04, 0.47]].forEach(function (a) { stroke(put, cx + a[0] * S, S * a[1], cx + a[0] * S + 3, S * a[1] + 1, 1.2, function () { return B.fleshDk; }); put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.oil); });
  }

  // ================= THE TITAN WHALE — boss (whaleGod, ORCA final) ==========
  function whaleGod(put, S, p) {
    p = p || {};
    var u = S / 200, X = function (v) { return v * u; };
    var hideC = p.hide || '#4a6a8a', hideDk = p.hideDk || '#1a2a3e', hideLt = p.hideLt || '#6a8aa8';
    var belly = p.belly || '#c8d0d4', bellyDk = p.bellyDk || '#7a8a90';
    var eyeLt = p.eyeLt || '#ff9a8a';
    var seed = p.seed || 1;
    var mouthTeeth = !!p.teeth;
    function hide(tx, ty, x, y) {
      var b = mix(hideC, hideDk, clamp(tx * 0.6 + ty * 0.7, 0, 1));
      b = mix(mix(hideLt, b, clamp(ty * 2.2, 0, 1)), b, 0.55);
      if (p.mottle && h2(x >> 3, y >> 3, seed) > 0.82) b = mix(b, hideLt, 0.3);
      return b;
    }
    var yTop = Math.round(X(14)), yBot = Math.round(X(154));
    for (var y = yTop; y <= yBot; y++) {
      var t = (y - yTop) / Math.max(1, yBot - yTop);
      var w = X(30 + Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5) * 64);
      var chin = t > 0.62;
      row(put, y, X(100) - w, X(100) + w, (function (t2, w2, y2, chin2) {
        return function (tx) {
          var edge = Math.abs(tx - 0.5) * 2;
          var dx = Math.round(X(100) - w2 + tx * 2 * w2), dy = y2;
          if (chin2 && edge < 0.92) {
            return mix(belly, bellyDk, clamp(edge * 0.5 + (t2 - 0.62), 0, 1));
          }
          return hide(edge * 0.7, t2, dx, dy);
        };
      })(t, w, y, chin));
    }
    var my0 = Math.round(X(108)), my1 = Math.round(X(150));
    for (var y2 = my0; y2 <= my1; y2++) {
      var t2 = (y2 - my0) / (my1 - my0);
      var w2 = X((0.35 + Math.sin(Math.min(t2 * 1.3, 1) * Math.PI) * 0.65) * (p.mouthW || 56));
      row(put, y2, X(100) - w2, X(100) + w2, (function (t3) { return function (tx) { return mix(p.maw || '#3a1218', B.oil, clamp(Math.abs(tx - 0.5) * 1.4 + t3 * 0.4, 0, 1)); }; })(t2));
    }
    if (mouthTeeth) {
      var mw = p.mouthW || 56;
      var wAt = function (tt) { return (0.35 + Math.sin(Math.min(tt * 1.3, 1) * Math.PI) * 0.65) * mw; };
      var bounds = function (dx) {
        var tT = null, tB = null;
        for (var tt = 0; tt <= 1; tt += 0.01) if (wAt(tt) >= Math.abs(dx) + 2) { if (tT === null) tT = tt; tB = tt; }
        return tT === null ? null : [108 + tT * 42, 108 + tB * 42];
      };
      for (var i = -6; i <= 6; i++) {
        var dx = i * 6.5, bb = bounds(dx);
        if (!bb) continue;
        var len = 6.5 + (6 - Math.abs(i)) * 0.7, tx0 = X(100 + dx);
        fin(put, tx0, X(bb[0] + len), tx0 - X(2), X(bb[0] + 0.5), tx0 + X(2), X(bb[0] + 0.5), B.tooth, '#8a8268');
      }
      for (var i2 = -6; i2 <= 5; i2++) {
        var dx2 = i2 * 6.5 + 3.25, bb2 = bounds(dx2);
        if (!bb2) continue;
        var len2 = 5 + (5.5 - Math.abs(i2 + 0.5)) * 0.6, tx1 = X(100 + dx2);
        fin(put, tx1, X(bb2[1] - len2), tx1 - X(1.8), X(bb2[1] - 0.5), tx1 + X(1.8), X(bb2[1] - 0.5), B.tooth, '#6a6248');
      }
    }
    if (p.throatGlow) glowDot(put, X(100), X(126), X(6), p.throatGlow, B.white);
    [[-1], [1]].forEach(function (arr) {
      var s = arr[0], ex = X(100 + s * 70), ey = X(104);
      ell(put, ex, ey, X(5), X(6), function () { return B.oil; });
      ell(put, ex - X(1.2), ey - X(1.6), X(1.6), X(1.8), function () { return eyeLt; });
      stroke(put, ex - s * X(2), ey - X(9), ex + s * X(8), ey - X(12), 1.2, function () { return hideDk; });
    });
    if (!p.noSpray) [[96, 8], [102, 4], [108, 9], [100, 12]].forEach(function (a) { put(Math.round(X(a[0])), Math.round(X(a[1])), B.white); });
    if (p.orcaPatch) [[-1], [1]].forEach(function (arr) {
      var s = arr[0];
      ell(put, X(100 + s * 62), X(88), X(10), X(6), function (tx, ty) { return mix('#f4f4f4', '#b8c2d0', clamp(tx + ty * 0.4, 0, 1)); });
    });
    // cheek SWELL tell (water gun)
    if (p.cheekSwell) [[-1], [1]].forEach(function (arr) {
      var s = arr[0];
      dome(put, X(100 + s * 84), X(112), X(16), X(14), '#2e343e', '#4a525e', '#12161e');
      glowDot(put, X(100 + s * 84), X(112), X(3), B.waterLt, B.white);
    });
    // gasping slack jaw (vent) — drooped water sheen at the maw
    if (p.gasp) {
      ell(put, X(100), X(150), X(40), X(10), function (tx, ty) { return mix(B.waterDk, B.oil, ty); });
      glowDot(put, X(88), X(146), X(2), B.waterLt, B.white);
      glowDot(put, X(114), X(148), X(2), B.waterLt, B.white);
    }
  }
  function drawTitanWhale(put, S) { whaleGod(put, S, { hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12', belly: '#f4f4f4', bellyDk: '#b8c2d0', teeth: 1, orcaPatch: 1, barnacles: 0, eye: '#d84a4a', eyeLt: '#ff9a8a', maw: '#3a1218', noSand: 1, seed: 13 }); }
  function drawTitanWhaleP2(put, S) { whaleGod(put, S, { hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12', belly: '#f4f4f4', bellyDk: '#b8c2d0', teeth: 1, orcaPatch: 1, barnacles: 0, eye: '#ff9a8a', eyeLt: '#ffd0c0', maw: '#5a1420', throatGlow: '#ff5a4a', noSand: 1, seed: 13 }); }
  function drawTitanWhaleSwell(put, S) { whaleGod(put, S, { hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12', belly: '#f4f4f4', bellyDk: '#b8c2d0', teeth: 1, orcaPatch: 1, barnacles: 0, eyeLt: '#ff9a8a', maw: '#3a1218', cheekSwell: 1, noSand: 1, seed: 13 }); }
  function drawTitanWhaleGasp(put, S) { whaleGod(put, S, { hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12', belly: '#f4f4f4', bellyDk: '#b8c2d0', teeth: 1, orcaPatch: 1, barnacles: 0, eyeLt: '#c8d0d4', maw: '#2a1218', gasp: 1, noSand: 1, seed: 13 }); }

  // ================= SET PIECES ============================================
  // THE UVULA — the gag trigger; a "hit me" pink set piece with a glow.
  function drawUvula(put, S) {
    var cx = S * 0.5;
    // gullet flesh arch above it
    for (var y = S * 0.12; y < S * 0.28; y++) {
      var t = (y - S * 0.12) / (S * 0.16);
      row(put, Math.round(y), cx - S * 0.34, cx + S * 0.34, (function (t2) { return function (tx) { return mix(B.flesh, B.fleshDk, clamp(Math.abs(tx - 0.5) * 1.2 + t2 * 0.4, 0, 1)); }; })(t));
    }
    // the hanging uvula bulb
    for (var t = 0; t < 1; t += 0.02) {
      var w = S * (0.06 + Math.sin(Math.min(t * 1.4, 1) * Math.PI) * 0.11);
      ell(put, cx, S * (0.28 + t * 0.5), w, w * 0.85, (function (t2) {
        return function (tx, ty) {
          var b = mix(B.gloss, B.flesh, clamp(t2 * 0.7 + Math.abs(tx - 0.5), 0, 1));
          if (ty < 0.3) b = mix(b, '#ffc8d0', 0.4);
          return b;
        };
      })(t));
    }
    glowDot(put, cx, S * 0.5, S * 0.03, '#ff9ab0', B.white);
    glowDot(put, cx - S * 0.05, S * 0.44, S * 0.012, '#ffc8d0', B.white);
    drips(put, cx + S * 0.02, S * 0.78, 2);
  }
  // WRECK DECK hull — the swallowed ship's platform (decor-composed spawn).
  function drawHull(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.4);
    // curved hull side
    for (var y = S * 0.34; y < S * 0.74; y++) {
      var t = (y - S * 0.34) / (S * 0.4);
      var w = S * (0.4 - Math.pow(t - 0.2, 2) * 0.5);
      row(put, Math.round(y), cx - w, cx + w, (function (t2, y2) {
        return function (tx) {
          var b = mix(B.wood, B.woodDk, clamp(t2 * 0.9 + Math.abs(tx - 0.5) * 0.4, 0, 1));
          if ((y2 | 0) % 6 === 0) b = mix(b, B.woodDkk || B.woodDk, 0.4);
          if (h2(tx * 40 | 0, y2, 3) > 0.93) b = mix(b, B.woodLt, 0.3);
          return b;
        };
      })(t, y));
    }
    // gunwale rail + a couple bracing ribs
    row(put, Math.round(S * 0.34), cx - S * 0.4, cx + S * 0.4, function (tx) { return mix(B.woodLt, B.wood, tx); });
    [-0.28, -0.1, 0.12, 0.3].forEach(function (dx) { stroke(put, cx + dx * S, S * 0.36, cx + dx * S, S * 0.7, 2, function () { return B.woodDk; }); });
    [[-0.2, 0.44], [0.24, 0.5]].forEach(function (a) { put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.brass); });
  }

  // ================= DECOR (20) — render_belly_decor ports =================
  function dRibArch(put, S) {
    var cx = S * 0.5;
    [-1, 1].forEach(function (s) {
      for (var t = 0; t < 1; t += 0.02) {
        var px = cx + s * S * (0.26 - t * 0.22), py = S * (0.86 - t * 0.6 + t * t * 0.12);
        var w = S * (0.035 - t * 0.014);
        ell(put, px, py, w, w * 0.8, (function (t2) {
          return function (tx, ty) {
            var b = mix(B.bone, B.boneDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
            if (((t2 * 14) | 0) % 5 === 0) b = mix(b, B.boneDkk, 0.3);
            return b;
          };
        })(t));
      }
    });
    ell(put, cx, S * 0.26, S * 0.05, S * 0.035, function (tx, ty) { return mix(B.bone, B.boneDk, clamp(tx + ty * 0.4, 0, 1)); });
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.26, S * 0.86, S * 0.07, S * 0.035, function (tx, ty) { return mix(B.meat, B.fleshDk, tx + ty * 0.3); }); });
    drips(put, cx - S * 0.02, S * 0.3, 2);
  }
  function dSpire(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.16);
    for (var t = 0; t < 1; t += 0.03) {
      var px = cx + Math.sin(t * 3) * S * 0.02, py = S * (0.84 - t * 0.5);
      var w = S * (0.075 - t * 0.055);
      ell(put, px, py, w, w * 0.7, (function (t2) {
        return function (tx, ty) {
          var b = mix(B.meat, B.fleshDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
          if (((t2 * 16) | 0) % 2) b = mix(b, B.meatLt, 0.3);
          return b;
        };
      })(t));
    }
    glowDot(put, cx + Math.sin(3) * S * 0.02, S * 0.32, S * 0.01, B.meatLt, B.gloss);
    drips(put, cx, S * 0.36, 2);
  }
  function dAcidPool(put, S) {
    var cx = S * 0.5;
    ell(put, cx, S * 0.64, S * 0.22, S * 0.09, function (tx, ty) {
      var d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      var b = mix(B.acidLt, B.acid, clamp(d * 1.3, 0, 1));
      b = mix(b, B.acidDk, clamp((d - 0.7) * 3, 0, 1));
      return b;
    });
    for (var a = 0; a < 6.28; a += 0.06) {
      var rr = 1 + Math.sin(a * 7) * 0.04;
      put(Math.round(cx + Math.cos(a) * S * 0.22 * rr), Math.round(S * 0.64 + Math.sin(a) * S * 0.09 * rr), B.meatDk);
    }
    [[-0.1, 0.62, 0.014], [0.06, 0.66, 0.01], [0.13, 0.61, 0.008]].forEach(function (a2) {
      ell(put, cx + a2[0] * S, S * a2[1], S * a2[2], S * a2[2] * 0.7, function (tx, ty) { return mix(B.acidLt, B.acid, ty); });
      put(Math.round(cx + a2[0] * S), Math.round(S * (a2[1] - a2[2] * 0.8)), B.white);
    });
    wisps(put, cx - S * 0.04, S * 0.56, 3);
  }
  function dVeins(put, S) {
    var cx = S * 0.5, cy = S * 0.58;
    ell(put, cx, cy, S * 0.2, S * 0.12, function (tx, ty) { return mix(B.meat, B.fleshDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)); });
    var branch = function (x0, y0, a, len, w, depth) {
      var x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len * 0.55;
      stroke(put, x0, y0, x1, y1, w, function () { return B.vein; });
      stroke(put, x0, y0, x1, y1, Math.max(1, w * 0.4), function () { return '#8ab0e8'; });
      if (depth > 0) { branch(x1, y1, a - 0.55, len * 0.62, w * 0.7, depth - 1); branch(x1, y1, a + 0.5, len * 0.66, w * 0.7, depth - 1); }
    };
    branch(cx, cy + S * 0.04, -Math.PI / 2 - 0.3, S * 0.11, S * 0.016, 3);
    branch(cx - S * 0.02, cy + S * 0.02, Math.PI - 0.4, S * 0.09, S * 0.013, 2);
    branch(cx + S * 0.03, cy + S * 0.03, -0.3, S * 0.09, S * 0.013, 2);
    glowDot(put, cx, cy + S * 0.04, S * 0.012, '#8ab0e8', '#c8e0ff');
  }
  function dBaleen(put, S) {
    var cx = S * 0.5;
    for (var y = S * 0.2; y < S * 0.28; y++) row(put, Math.round(y), cx - S * 0.24, cx + S * 0.24, (function (y2) { return function (tx) { return mix(B.meat, B.fleshDk, clamp(tx * 0.8 + (y2 - S * 0.2) / (S * 0.08) * 0.3, 0, 1)); }; })(y));
    for (var i = -5; i <= 5; i++) {
      var px = cx + i * S * 0.042, len = S * (0.34 + Math.sin(i * 2.7) * 0.05);
      for (var y3 = S * 0.28; y3 < S * 0.28 + len; y3++) {
        var t = (y3 - S * 0.28) / len, w = S * 0.014 * (1 - t * 0.6);
        row(put, Math.round(y3), px - w + Math.sin(t * 4 + i) * 2, px + w + Math.sin(t * 4 + i) * 2, (function (i2, t2) {
          return function (tx) {
            var b = mix('#4a4238', '#241e14', clamp(tx + t2 * 0.4, 0, 1));
            if (i2 % 2 === 0) b = mix(b, '#6a6252', 0.3);
            return b;
          };
        })(i, t));
      }
      stroke(put, px + Math.sin(1 + i) * 2, S * 0.28 + len, px + Math.sin(1 + i) * 2 - 1, S * 0.28 + len + S * 0.03, 0.9, function () { return '#8a8268'; });
    }
    drips(put, cx + S * 0.1, S * 0.32, 2);
  }
  function dMast(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.14);
    for (var t = 0; t < 1; t += 0.02) {
      var px = cx - S * 0.04 + t * S * 0.1, py = S * (0.86 - t * 0.56), w = S * (0.035 - t * 0.008);
      ell(put, px, py, w, w * 0.6, (function (t2) {
        return function (tx) {
          var b = mix(B.wood, B.woodDk, clamp(tx * 1.1, 0, 1));
          if (((t2 * 20) | 0) % 4 === 0) b = mix(b, B.woodLt, 0.3);
          return b;
        };
      })(t));
    }
    [[0.05, 0.3, 4], [0.08, 0.28, 3], [0.03, 0.27, 3]].forEach(function (a) {
      for (var i = 0; i < a[2]; i++) put(Math.round(cx + a[0] * S + i), Math.round(S * a[1] - i * 2), B.woodLt);
    });
    for (var a2 = 0; a2 < 6.28; a2 += 0.12) put(Math.round(cx + S * 0.02 + Math.cos(a2) * S * 0.075), Math.round(S * 0.5 + Math.sin(a2) * S * 0.028 + Math.cos(a2) * S * 0.012), B.woodDk);
    stroke(put, cx - S * 0.02, S * 0.42, cx - S * 0.16, S * 0.62, 0.9, function () { return B.rope; });
    stroke(put, cx + S * 0.05, S * 0.38, cx + S * 0.18, S * 0.56, 0.9, function () { return B.ropeDk; });
  }
  function dSail(put, S) {
    var cx = S * 0.5;
    [-0.2, 0.22].forEach(function (dx) {
      for (var t = 0; t < 1; t += 0.05) { var w = S * (0.026 - t * 0.008); ell(put, cx + dx * S, S * (0.78 - t * 0.4), w, w * 0.7, function (tx, ty) { return mix(B.bone, B.boneDk, tx + ty * 0.3); }); }
    });
    for (var y = S * 0.42; y < S * 0.72; y++) {
      var t = (y - S * 0.42) / (S * 0.3);
      row(put, Math.round(y), cx - S * 0.19, cx + S * 0.21, (function (t2, y2) {
        return function (tx) {
          var localY = t2 + Math.sin(tx * 6) * 0.04;
          if (localY < Math.sin(tx * Math.PI) * -0.06 + 0.06) return null;
          if (t2 > 0.75 && ((tx * 13) | 0) % 3 === 0) return null;
          if (((tx * 17 + y2 * 0.5) | 0) % 23 === 0 && t2 > 0.25 && t2 < 0.7) return null;
          var b = mix(B.sail, B.sailDk, clamp(tx * 0.9 + t2 * 0.35, 0, 1));
          if (((y2 | 0) % 7) === 0) b = mix(b, B.sailDk, 0.3);
          return b;
        };
      })(t, y));
    }
    [[0.02, 0.6], [0.06, 0.64]].forEach(function (a) { put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.acidDk); });
    stroke(put, cx - S * 0.19, S * 0.44, cx - S * 0.2, S * 0.4, 1, function () { return B.rope; });
    stroke(put, cx + S * 0.2, S * 0.44, cx + S * 0.22, S * 0.4, 1, function () { return B.rope; });
  }
  function dWheel(put, S) {
    var cx = S * 0.5, cy = S * 0.52;
    for (var a = 0; a < 6.28; a += 0.03) {
      var px = cx + Math.cos(a) * S * 0.16, py = cy + Math.sin(a) * S * 0.16;
      if (py > S * 0.66) continue;
      ell(put, px, py, S * 0.016, S * 0.016, function (tx, ty) { return mix(B.wood, B.woodDk, clamp(tx + ty * 0.4, 0, 1)); });
    }
    for (var i = 0; i < 8; i++) {
      var a2 = i * Math.PI / 4 + 0.2;
      var hx = cx + Math.cos(a2) * S * 0.21, hy = cy + Math.sin(a2) * S * 0.21;
      if (cy + Math.sin(a2) * S * 0.15 < S * 0.66) {
        stroke(put, cx, cy, cx + Math.cos(a2) * S * 0.15, cy + Math.sin(a2) * S * 0.15, 1.8, function () { return B.woodDk; });
        if (hy < S * 0.66) { stroke(put, cx + Math.cos(a2) * S * 0.16, cy + Math.sin(a2) * S * 0.16, hx, hy, 2.2, function () { return B.wood; }); put(Math.round(hx), Math.round(hy), B.woodLt); }
      }
    }
    ell(put, cx, cy, S * 0.035, S * 0.035, function (tx, ty) { return mix(B.brassLt, B.brassDk, clamp(tx + ty * 0.5, 0, 1)); });
    put(Math.round(cx), Math.round(cy), B.brassDk);
    for (var y = S * 0.64; y < S * 0.72; y++) {
      var t = (y - S * 0.64) / (S * 0.08);
      row(put, Math.round(y), cx - S * (0.22 + t * 0.02), cx + S * (0.22 + t * 0.02), (function (t2) { return function (tx) { return mix(B.meat, B.fleshDk, clamp(tx * 0.7 + t2 * 0.4, 0, 1)); }; })(t));
    }
  }
  function dCrates(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    var crate = function (x0, y0, w, h, tone) {
      plate(put, x0, y0, x0 + w, y0 + h, tone === 0 ? B.wood : '#9a6a40', B.woodLt, B.woodDk);
      for (var i = 1; i < 3; i++) row(put, Math.round(y0 + h * i / 3), x0 + 1, x0 + w - 1, function () { return B.woodDk; });
      stroke(put, x0, y0, x0 + w, y0 + h, 1, function () { return B.woodDk; });
      [[x0 + 2, y0 + 2], [x0 + w - 3, y0 + 2], [x0 + 2, y0 + h - 3], [x0 + w - 3, y0 + h - 3]].forEach(function (n) { put(Math.round(n[0]), Math.round(n[1]), B.brass); });
    };
    crate(cx - S * 0.19, S * 0.52, S * 0.2, S * 0.2, 0);
    crate(cx + S * 0.03, S * 0.56, S * 0.17, S * 0.16, 1);
    crate(cx - S * 0.08, S * 0.36, S * 0.16, S * 0.15, 1);
    [[0.16, 0.72], [0.19, 0.74], [0.14, 0.75]].forEach(function (a) { ell(put, cx + a[0] * S, S * a[1], S * 0.014, S * 0.008, function (tx) { return mix(B.sail, B.sailDk, tx); }); });
  }
  function dBarrel(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.16);
    for (var y = S * 0.4; y < S * 0.74; y++) {
      var t = (y - S * 0.4) / (S * 0.34), bulge = Math.sin(t * Math.PI) * S * 0.025;
      row(put, Math.round(y), cx - S * 0.1 - bulge, cx + S * 0.1 + bulge, function (tx) {
        var b = mix(B.wood, B.woodDk, clamp(tx * 1.15, 0, 1));
        if (((tx * 9) | 0) % 2) b = mix(b, B.woodLt, 0.18);
        return b;
      });
    }
    [0.45, 0.56, 0.68].forEach(function (fy) {
      var t = (fy - 0.4) / 0.34, bulge = Math.sin(t * Math.PI) * S * 0.025;
      row(put, Math.round(S * fy), cx - S * 0.1 - bulge, cx + S * 0.1 + bulge, function (tx) { return mix('#8a8a92', '#4a4a52', tx); });
    });
    ell(put, cx, S * 0.4, S * 0.1, S * 0.028, function (tx, ty) { return mix(B.woodLt, B.woodDk, clamp(tx + ty * 0.5, 0, 1)); });
    put(Math.round(cx - S * 0.11), Math.round(S * 0.6), B.brassDk);
    stroke(put, cx - S * 0.115, S * 0.61, cx - S * 0.12, S * 0.66, 1.2, function () { return B.gold; });
    ell(put, cx - S * 0.13, S * 0.76, S * 0.05, S * 0.016, function (tx, ty) { return mix(B.goldLt, B.goldDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)); });
    put(Math.round(cx - S * 0.12), Math.round(S * 0.7), B.goldLt);
  }
  function dChest(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.15, S * 0.56, cx + S * 0.15, S * 0.74, B.wood, B.woodLt, B.woodDk);
    for (var i = 1; i < 3; i++) row(put, Math.round(S * 0.56 + (S * 0.18) * i / 3), cx - S * 0.14, cx + S * 0.14, function () { return B.woodDk; });
    [[-0.09], [0.09]].forEach(function (a) { for (var y = S * 0.56; y < S * 0.74; y++) put(Math.round(cx + a[0] * S), Math.round(y), B.brass); });
    plate(put, cx - S * 0.025, S * 0.56, cx + S * 0.025, S * 0.62, B.brass, B.brassLt, B.brassDk);
    for (var t = 0; t < 1; t += 0.06) {
      var yy = S * (0.56 - t * 0.14);
      row(put, Math.round(yy), cx - S * (0.15 - t * 0.02), cx + S * (0.15 - t * 0.02), (function (t2) { return function (tx) { return mix(B.woodLt, B.woodDk, clamp(tx * 1.1 + t2 * 0.2, 0, 1)); }; })(t));
    }
    ell(put, cx, S * 0.56, S * 0.12, S * 0.04, function (tx, ty) { return mix(B.goldLt, B.goldDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [[-0.08, 0.76], [0.02, 0.78], [0.1, 0.76], [-0.02, 0.8], [0.16, 0.79]].forEach(function (a) { ell(put, cx + a[0] * S, S * a[1], S * 0.012, S * 0.008, function (tx, ty) { return mix(B.goldLt, B.goldDk, ty); }); });
    [[-0.05, 0.54], [0.06, 0.545]].forEach(function (a) { put(Math.round(cx + a[0] * S), Math.round(S * a[1]), B.white); });
  }
  function dAnchor(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    stroke(put, cx, S * 0.3, cx, S * 0.72, S * 0.024, function () { return '#5a626e'; });
    stroke(put, cx - S * 0.003, S * 0.3, cx - S * 0.003, S * 0.72, S * 0.008, function () { return '#8a929e'; });
    stroke(put, cx - S * 0.11, S * 0.38, cx + S * 0.11, S * 0.38, S * 0.02, function () { return '#4a525e'; });
    for (var a = 0; a < 6.28; a += 0.3) put(Math.round(cx + Math.cos(a) * S * 0.026), Math.round(S * 0.28 + Math.sin(a) * S * 0.026), '#8a929e');
    for (var i = 0; i < 5; i++) {
      var lx = cx + S * (0.04 + i * 0.045), ly = S * (0.24 - i * 0.026);
      for (var a2 = 0; a2 < 6.28; a2 += 0.5) put(Math.round(lx + Math.cos(a2) * 3), Math.round(ly + Math.sin(a2) * 2), i % 2 ? '#6a727e' : '#4a525e');
    }
    for (var s = -1; s <= 1; s += 2) {
      for (var t = 0; t < 1; t += 0.03) {
        var px = cx + s * Math.sin(t * 1.5) * S * 0.14, py = S * (0.72 - Math.sin(t * Math.PI) * 0.06);
        ell(put, px, py - (t > 0.6 ? (t - 0.6) * S * 0.12 : 0), S * 0.014, S * 0.012, function (tx, ty) { return mix('#6a727e', '#3a424e', tx + ty * 0.3); });
      }
      fin(put, cx + s * S * 0.14, S * 0.66, cx + s * S * 0.19, S * 0.6, cx + s * S * 0.12, S * 0.62, '#8a929e', '#4a525e');
    }
    ell(put, cx + S * 0.15, S * 0.68, S * 0.07, S * 0.035, function (tx, ty) { return mix(B.meat, B.fleshDk, tx + ty * 0.3); });
  }
  function dCannon(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    for (var t = 0; t < 1; t += 0.03) {
      var px = cx + S * (0.16 - t * 0.32), py = S * (0.68 - t * 0.22), w = S * (0.055 - t * 0.02);
      ell(put, px, py, w, w * 0.9, function (tx, ty) {
        var b = mix('#7a6a4a', '#3a3020', clamp(tx * 0.9 + ty * 0.5, 0, 1));
        if (ty < 0.3) b = mix(b, '#a89464', 0.35);
        return b;
      });
    }
    ell(put, cx - S * 0.165, S * 0.455, S * 0.032, S * 0.028, function (tx, ty) { return mix('#3a3020', B.oil, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)); });
    ell(put, cx - S * 0.165, S * 0.455, S * 0.016, S * 0.014, function () { return B.oil; });
    for (var a = 0; a < 6.28; a += 0.1) put(Math.round(cx + S * 0.2 + Math.cos(a) * S * 0.05), Math.round(S * 0.72 + Math.sin(a) * S * 0.05 * 0.5), B.woodDk);
    stroke(put, cx + S * 0.16, S * 0.72, cx + S * 0.24, S * 0.72, 1.2, function () { return B.wood; });
    [[0.05, 0.62], [0.1, 0.68], [-0.04, 0.58]].forEach(function (a2) { ell(put, cx + a2[0] * S, S * a2[1], S * 0.016, S * 0.012, function (tx, ty) { return mix(B.bone, B.boneDk, ty); }); put(Math.round(cx + a2[0] * S), Math.round(S * a2[1]), B.oil); });
    dome(put, cx + S * 0.02, S * 0.76, S * 0.028, S * 0.02, '#3a424e', '#6a727e', B.oil);
  }
  function dDinghy(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    for (var y = S * 0.52; y < S * 0.7; y++) {
      var t = (y - S * 0.52) / (S * 0.18), wl = S * (0.24 - t * 0.1), wr = S * (0.22 - t * 0.08);
      row(put, Math.round(y), cx - wl, cx + wr, (function (t2, y2) {
        return function (tx) {
          if (t2 > 0.2 && t2 < 0.85 && tx > 0.58 && tx < 0.78 && ((tx * 40 + y2) | 0) % 9 !== 0) return null;
          var b = mix(B.wood, B.woodDk, clamp(t2 * 0.9 + Math.abs(tx - 0.4) * 0.3, 0, 1));
          if (((y2 | 0) % 5) === 0) b = mix(b, B.woodLt, 0.25);
          return b;
        };
      })(t, y));
    }
    row(put, Math.round(S * 0.52), cx - S * 0.24, cx + S * 0.22, function (tx) { return mix(B.woodLt, B.wood, tx); });
    stroke(put, cx - S * 0.24, S * 0.52, cx - S * 0.27, S * 0.46, 2, function () { return B.wood; });
    stroke(put, cx + S * 0.22, S * 0.52, cx + S * 0.24, S * 0.47, 2, function () { return B.woodDk; });
    stroke(put, cx + S * 0.08, S * 0.5, cx + S * 0.2, S * 0.32, 1.8, function () { return B.woodLt; });
    fin(put, cx + S * 0.2, S * 0.32, cx + S * 0.24, S * 0.26, cx + S * 0.17, S * 0.28, B.wood, B.woodDk);
    ell(put, cx, S * 0.72, S * 0.2, S * 0.035, function (tx, ty) { return mix(B.acid, B.acidDk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2, 0, 1)); });
  }
  function dTrap(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.18);
    for (var a = 0; a < Math.PI; a += 0.045) put(Math.round(cx + Math.cos(a + Math.PI) * S * 0.16), Math.round(S * 0.66 - Math.sin(a) * S * 0.14), B.woodDk);
    for (var i = -3; i <= 3; i++) {
      var px = cx + i * S * 0.045, h = Math.sqrt(Math.max(0, 1 - Math.pow(i / 3.6, 2))) * S * 0.14;
      stroke(put, px, S * 0.66, px, S * 0.66 - h, 1.6, (function (i2) { return function () { return i2 % 2 ? B.wood : B.woodDk; }; })(i));
    }
    [0.03, 0.07, 0.11].forEach(function (dh) {
      var w = Math.sqrt(Math.max(0, 1 - Math.pow(dh / 0.14, 2))) * S * 0.155;
      row(put, Math.round(S * 0.66 - S * dh), cx - w, cx + w, function (tx) { return ((tx * 12 | 0) % 2 ? null : B.wood); });
    });
    row(put, Math.round(S * 0.66), cx - S * 0.17, cx + S * 0.17, function (tx) { return mix(B.wood, B.woodDk, tx); });
    ell(put, cx + S * 0.02, S * 0.6, S * 0.06, S * 0.05, function () { return B.oil; });
    put(Math.round(cx), Math.round(S * 0.6), B.red); put(Math.round(cx + S * 0.035), Math.round(S * 0.6), B.red);
    stroke(put, cx - S * 0.15, S * 0.54, cx - S * 0.22, S * 0.42, 1, function () { return B.rope; });
    [[-0.23, 0.4], [-0.2, 0.36]].forEach(function (a2) { ell(put, cx + a2[0] * S, S * a2[1], S * 0.016, S * 0.012, function (tx, ty) { return mix('#d87a5a', '#8a3a2a', ty); }); });
  }
  function dNet(put, S) {
    var cx = S * 0.5;
    for (var i = 0; i <= 6; i++) {
      var px = cx - S * 0.2 + i * S * 0.066;
      for (var t = 0; t < 1; t += 0.04) {
        var py = S * (0.34 + t * 0.34) + Math.sin(t * Math.PI) * S * 0.03 * Math.sin(i * 1.2);
        put(Math.round(px + Math.sin(t * 5 + i) * 2), Math.round(py), (i + (t * 10 | 0)) % 2 ? B.rope : B.ropeDk);
      }
    }
    for (var j = 0; j <= 5; j++) {
      var py2 = S * (0.36 + j * 0.062);
      for (var t2 = 0; t2 < 1; t2 += 0.03) {
        var px2 = cx - S * 0.2 + t2 * S * 0.4;
        put(Math.round(px2), Math.round(py2 + Math.sin(t2 * Math.PI) * S * 0.035 + Math.sin(t2 * 8 + j) * 1.5), (j + (t2 * 12 | 0)) % 2 ? B.ropeDk : B.rope);
      }
    }
    for (var i2 = 0; i2 < 4; i2++) ell(put, cx - S * 0.16 + i2 * S * 0.1, S * 0.335 + Math.sin(i2 * 1.2) * 3, S * 0.018, S * 0.013, function (tx, ty) { return mix('#d87a5a', '#8a3a2a', clamp(tx + ty * 0.4, 0, 1)); });
    plate(put, cx + S * 0.08, S * 0.58, cx + S * 0.14, S * 0.66, '#3a3028', '#5a5048', B.oil);
    plate(put, cx + S * 0.08, S * 0.64, cx + S * 0.17, S * 0.67, '#241c16', '#3a3028', B.oil);
  }
  function dSkeleton(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    for (var t = 0; t < 1; t += 0.02) {
      var px = cx - S * 0.24 + t * S * 0.48, py = S * 0.56 + Math.sin(t * Math.PI) * -S * 0.06;
      ell(put, px, py, S * 0.012, S * 0.01, function (tx, ty) { return mix(B.bone, B.boneDk, tx + ty * 0.3); });
    }
    for (var i = 1; i < 8; i++) {
      var t2 = i / 8, px2 = cx - S * 0.24 + t2 * S * 0.48, py2 = S * 0.56 + Math.sin(t2 * Math.PI) * -S * 0.06;
      var len = Math.sin(t2 * Math.PI) * S * 0.11 + S * 0.02;
      stroke(put, px2, py2, px2 - len * 0.2, py2 + len, 1.3, (function (i2) { return function () { return i2 % 2 ? B.bone : B.boneDk; }; })(i));
    }
    ell(put, cx - S * 0.27, S * 0.55, S * 0.05, S * 0.04, function (tx, ty) { return mix(B.bone, B.boneDk, clamp(tx * 0.8 + ty * 0.4, 0, 1)); });
    ell(put, cx - S * 0.285, S * 0.54, S * 0.012, S * 0.013, function () { return B.oil; });
    stroke(put, cx - S * 0.31, S * 0.575, cx - S * 0.24, S * 0.585, 1.4, function () { return B.boneDk; });
    for (var i3 = 0; i3 < 3; i3++) put(Math.round(cx - S * (0.3 - i3 * 0.018)), Math.round(S * 0.57), B.tooth);
  }
  function dKelp(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    for (var i = 0; i < 9; i++) {
      var a = i * 0.7, r = S * (0.04 + (i % 3) * 0.03);
      var bx = cx + Math.cos(a) * r * 1.4, by = S * 0.62 + Math.sin(a) * r * 0.6;
      for (var t = 0; t < 1; t += 0.05) {
        var px = bx + Math.cos(a + t * 3) * S * 0.06 * t, py = by + Math.sin(a + t * 3) * S * 0.03 * t - t * S * 0.05;
        ell(put, px, py, S * 0.016, S * 0.01, (function (i2) {
          return function (tx, ty) {
            var b = mix('#4a6a2a', '#243a12', clamp(tx + ty * 0.4, 0, 1));
            if (i2 % 3 === 0) b = mix(b, B.acidDk, 0.45);
            return b;
          };
        })(i));
      }
    }
    [[-0.14, 1], [0.12, -1], [0.02, 1]].forEach(function (a) {
      for (var t = 0; t < 1; t += 0.04) { var px = cx + a[0] * S + a[1] * t * S * 0.12, py = S * 0.62 + t * S * 0.14 + Math.sin(t * 6) * 2; ell(put, px, py, S * (0.014 - t * 0.006), S * 0.008, function (tx) { return mix('#5a7a3a', '#2a4218', tx); }); }
    });
    drips(put, cx + S * 0.02, S * 0.6, 2);
  }
  function dAmbergris(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    [[0, 0.6, 0.13, 0.1], [-0.09, 0.64, 0.08, 0.06], [0.1, 0.66, 0.07, 0.05], [0.02, 0.52, 0.07, 0.05]].forEach(function (a) {
      ell(put, cx + a[0] * S, S * a[1], S * a[2], S * a[3], function (tx, ty) {
        var b = mix('#b8a878', '#6a5a3a', clamp(tx * 0.9 + ty * 0.5, 0, 1));
        if (ty < 0.3) b = mix(b, '#e0d0a0', 0.4);
        return b;
      });
    });
    for (var a2 = 0; a2 < 6.28; a2 += 0.6) put(Math.round(cx + Math.cos(a2) * S * 0.17), Math.round(S * 0.6 + Math.sin(a2) * S * 0.12), mix(B.gold, B.fleshDk, 0.6));
    glowDot(put, cx + S * 0.03, S * 0.56, S * 0.008, B.goldLt, B.white);
    stroke(put, cx - S * 0.1, S * 0.56, cx - S * 0.14, S * 0.48, 1.3, function () { return B.wood; });
    fin(put, cx - S * 0.14, S * 0.48, cx - S * 0.18, S * 0.5, cx - S * 0.12, S * 0.45, '#8a929e', '#4a525e');
  }
  function dLanterns(put, S) {
    var cx = S * 0.5;
    for (var t = 0; t < 1; t += 0.02) { var px = cx - S * 0.24 + t * S * 0.48, py = S * 0.36 + Math.sin(t * Math.PI) * S * 0.07; put(Math.round(px), Math.round(py), (t * 20 | 0) % 2 ? B.rope : B.ropeDk); }
    [[-0.24], [0.24]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.36, cx + a[0] * S, S * 0.3, 1.4, function () { return B.brassDk; }); put(Math.round(cx + a[0] * S), Math.round(S * 0.3), B.brass); });
    [[-0.13, 0.44], [0.0, 0.47], [0.13, 0.44]].forEach(function (a, i) {
      var lx = cx + a[0] * S, ly = S * a[1];
      stroke(put, lx, ly - S * 0.045, lx, ly - S * 0.075 + Math.sin(i) * 1, 1, function () { return B.ropeDk; });
      dome(put, lx, ly - S * 0.045, S * 0.022, S * 0.012, B.brass, B.brassLt, B.brassDk);
      for (var y = ly - S * 0.04; y < ly + S * 0.035; y++) {
        var t = (y - (ly - S * 0.04)) / (S * 0.075), w = S * 0.022 * (0.7 + Math.sin(t * Math.PI) * 0.45);
        row(put, Math.round(y), lx - w, lx + w, (function (t2) {
          return function (tx) {
            if (((tx * 5) | 0) === 1 || ((tx * 5) | 0) === 3) return mix(B.goldLt, B.gold, t2);
            return mix(B.brass, B.brassDk, clamp(tx * 1.2, 0, 1));
          };
        })(t));
      }
      ell(put, lx, ly + S * 0.04, S * 0.016, S * 0.008, function (tx) { return mix(B.brass, B.brassDk, tx); });
      glowDot(put, lx, ly, S * 0.008, B.goldLt, B.white);
      ell(put, lx, ly + S * 0.1, S * 0.045, S * 0.014, function (tx) { return mix(mix(B.gold, B.fleshDk, 0.65), B.fleshDk, tx); });
    });
  }

  // ================= TILES (#1 2 3 4 6 8 9) ================================
  function tLining(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = h2(x >> 2, y >> 2, 1), n2 = h2(x >> 4, y >> 4, 2);
      var b = mix(B.flesh, B.fleshDk, 0.25 + n2 * 0.45);
      if (n > 0.9) b = mix(b, B.meatLt, 0.35);
      if (n < 0.06) b = mix(b, B.fleshDk, 0.5);
      put(x, y, b);
    }
    for (var i = 0; i < 5; i++) {
      var fx = (i * 53 + 20) % S, fy = (i * 37 + 30) % S;
      for (var t = 0; t < 1; t += 0.04) put(Math.round(fx + Math.cos(t * 3 + i) * 18 * t), Math.round(fy + Math.sin(t * 3 + i) * 10 * t), mix(B.meatLt, B.flesh, 0.5));
    }
  }
  function tFolds(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var wave = Math.sin((y + Math.sin(x * 0.05) * 8) * 0.12), n = h2(x >> 2, y >> 2, 3);
      var b = mix(B.meat, B.fleshDk, 0.4 + wave * 0.35);
      if (wave > 0.75) b = mix(b, B.meatLt, 0.4);
      if (n > 0.93) b = mix(b, B.gloss, 0.2);
      put(x, y, b);
    }
  }
  function tAcidFrame(phase) {
    return function (put, S) {
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
        var n = h2(x >> 3, y >> 3, 4), sw = Math.sin(x * 0.09 + y * 0.07 + phase);
        var b = mix(B.acid, B.acidDk, 0.35 + n * 0.4);
        if (sw > 0.8) b = mix(b, B.acidLt, 0.5);
        put(x, y, b);
      }
      for (var i = 0; i < 9; i++) {
        var bx = (i * 47 + 12 + phase * 6) % S | 0, by = (i * 71 + 25) % S;
        put(bx, by, B.acidLt); put((bx + 1) % S, by, B.acid); if (i % 3 === 0) put(bx, (by + S - 1) % S, B.white);
      }
    };
  }
  function tBones(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = h2(x >> 2, y >> 2, 5); put(x, y, mix(B.fleshDk, '#3a1218', 0.3 + n * 0.4)); }
    var seed = 5;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (var i = 0; i < 14; i++) {
      var bx = rnd() * S, by = rnd() * S, a = rnd() * 3.14, len = 6 + rnd() * 12;
      stroke(put, bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, 1.5 + rnd(), (function (rr) { return function () { return mix(B.bone, B.boneDk, rr * 0.5); }; })(rnd()));
      if (i % 3 === 0) ell(put, bx, by, 2.4, 2, function (tx, ty) { return mix(B.bone, B.boneDk, ty); });
      if (i % 5 === 0) { ell(put, bx + Math.cos(a) * len, by + Math.sin(a) * len, 3, 2.4, function (tx, ty) { return mix(B.boneDk, B.boneDkk, tx); }); put(Math.round(bx + Math.cos(a) * len), Math.round(by + Math.sin(a) * len), B.oil); }
    }
  }
  function tBarnacleCrust(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = h2(x >> 2, y >> 2, 9); put(x, y, mix(B.meatDk, B.fleshDk, 0.4 + n * 0.3)); }
    var seed = 11;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (var i = 0; i < 22; i++) {
      var bx = rnd() * S, by = rnd() * S, r = 3 + rnd() * 6;
      ell(put, bx, by, r, r * 0.8, function (tx, ty) { return mix(B.bone, B.boneDkk, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2 * 0.8 + ty * 0.3, 0, 1)); });
      ell(put, bx, by - r * 0.15, r * 0.3, r * 0.24, function () { return B.oil; });
    }
  }
  function tGristle(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = h2(x >> 2, y >> 2, 12), band = Math.sin(x * 0.16 + Math.sin(y * 0.04) * 3);
      var b = mix('#c8a898', '#8a6458', 0.35 + n * 0.3);
      if (band > 0.7) b = mix(b, '#e0c8b8', 0.35);
      if (n < 0.05) b = mix(b, B.fleshDk, 0.4);
      put(x, y, b);
    }
    for (var y2 = 0; y2 < S; y2++) for (var x2 = 56 * S / 160; x2 < 104 * S / 160; x2++) {
      var d = Math.abs(x2 - 80 * S / 160) / (24 * S / 160);
      if (h2(x2 >> 2, y2 >> 2, 13) > d * 0.8) put(x2 | 0, y2, mix('#e0c8b8', '#c8a898', d));
    }
  }
  function tBile(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = h2(x >> 3, y >> 3, 14), swirl = Math.sin(x * 0.06 + y * 0.09 + Math.sin(x * 0.03) * 2);
      var b = mix(B.bile, B.bileDk, 0.35 + n * 0.35);
      if (swirl > 0.75) b = mix(b, '#e8f47a', 0.45);
      if (swirl < -0.8) b = mix(b, B.acidDk, 0.3);
      put(x, y, b);
    }
    for (var i = 0; i < 4; i++) { var sx = (i * 43 + 15) % S, sy = (i * 61 + 30) % S; stroke(put, sx, sy, sx + 22, sy + 6, 1, function () { return '#f4ffb0'; }); }
  }
  // ARENA SAND — beach stage art (not a map-biome tile; the arena backdrop).
  function tSand(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = h2(x >> 1, y >> 1, 15), dune = Math.sin(x * 0.05 + y * 0.11);
      var b = mix('#e0c88a', '#b09454', 0.3 + n * 0.35);
      if (dune > 0.85) b = mix(b, '#f0dca8', 0.4);
      put(x, y, b);
    }
    [[28, 40, 0], [120, 90, 1], [70, 130, 0]].forEach(function (a) { ell(put, a[0] * S / 160, a[1] * S / 160, 2.6, 2, function (tx, ty) { return mix(a[2] % 2 ? '#e8b0a0' : B.bone, B.boneDk, ty); }); });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var BELLY_ART = {
    B: B,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (16) ----
      ctx.spr('bellyFishermanHi', MS, MS, drawFisherman);
      ctx.spr('bellyLobsterHi', MS, MS, drawLobster);
      ctx.spr('bellySeaSnakeHi', MS, MS, drawSeaSnake);
      ctx.spr('bellyStarfishHi', MS, MS, drawStarfish);
      ctx.spr('bellyMermaidHi', MS, MS, drawMermaid);
      ctx.spr('bellyPirateHi', MS, MS, drawPirate);
      ctx.spr('bellyDeckhandHi', MS, MS, drawDeckhand);
      ctx.spr('bellyRatsHi', MS, MS, drawRats);
      ctx.spr('bellyParrotHi', MS, MS, drawParrot);
      ctx.spr('bellyCrabHi', MS, MS, drawCrab);
      ctx.spr('bellySlugHi', MS, MS, drawSlug);
      ctx.spr('bellyJellyHi', MS, MS, drawJelly);
      ctx.spr('bellyLampreyHi', MS, MS, drawLamprey);
      ctx.spr('bellyWormHi', MS, MS, drawWorm);
      ctx.spr('bellyKrillHi', MS, MS, drawKrill);
      ctx.spr('bellyPolypHi', MS, MS, drawPolyp);
      ctx.MOB_HI.drownedFisherman = 'bellyFishermanHi'; ctx.MOB_DISPLAY.drownedFisherman = 109;
      ctx.MOB_HI.gutLobster = 'bellyLobsterHi';         ctx.MOB_DISPLAY.gutLobster = 113;
      ctx.MOB_HI.seaSnake = 'bellySeaSnakeHi';          ctx.MOB_DISPLAY.seaSnake = 105;
      ctx.MOB_HI.bellyStarfish = 'bellyStarfishHi';   ctx.MOB_DISPLAY.bellyStarfish = 92;
      ctx.MOB_HI.mermaid = 'bellyMermaidHi';            ctx.MOB_DISPLAY.mermaid = 109;
      ctx.MOB_HI.swallowedPirate = 'bellyPirateHi';     ctx.MOB_DISPLAY.swallowedPirate = 109;
      ctx.MOB_HI.skeletonDeckhand = 'bellyDeckhandHi';  ctx.MOB_DISPLAY.skeletonDeckhand = 105;
      ctx.MOB_HI.shipRatPack = 'bellyRatsHi';           ctx.MOB_DISPLAY.shipRatPack = 80;
      ctx.MOB_HI.bilgeParrot = 'bellyParrotHi';         ctx.MOB_DISPLAY.bilgeParrot = 88;
      ctx.MOB_HI.gutCrab = 'bellyCrabHi';               ctx.MOB_DISPLAY.gutCrab = 109;
      ctx.MOB_HI.acidSlug = 'bellySlugHi';              ctx.MOB_DISPLAY.acidSlug = 101;
      ctx.MOB_HI.bileJelly = 'bellyJellyHi';            ctx.MOB_DISPLAY.bileJelly = 97;
      ctx.MOB_HI.lamprey = 'bellyLampreyHi';            ctx.MOB_DISPLAY.lamprey = 101;
      ctx.MOB_HI.gutWorm = 'bellyWormHi';               ctx.MOB_DISPLAY.gutWorm = 113;
      ctx.MOB_HI.krillCloud = 'bellyKrillHi';           ctx.MOB_DISPLAY.krillCloud = 105;
      ctx.MOB_HI.fleshPolyp = 'bellyPolypHi';           ctx.MOB_DISPLAY.fleshPolyp = 105;
      // ---- boss: THE TITAN WHALE (screen-scale, 4 frames) ----
      ctx.spr('bellyTitanWhaleHi', 200, 200, drawTitanWhale);
      ctx.spr('bellyTitanWhaleP2', 200, 200, drawTitanWhaleP2);
      ctx.spr('bellyTitanWhaleSwell', 200, 200, drawTitanWhaleSwell);
      ctx.spr('bellyTitanWhaleGasp', 200, 200, drawTitanWhaleGasp);
      ctx.BOSS_HI.titanWhale = { key: 'bellyTitanWhaleHi', size: 200, display: 340, bodyW: 120, bodyH: 90 };
      // ---- set pieces ----
      ctx.spr('bellyUvula', 96, 96, drawUvula);
      ctx.spr('bellyHull', 96, 96, drawHull);
      // ---- decor (20) ----
      ctx.spr('bdRibArch', 64, 64, dRibArch);
      ctx.spr('bdSpire', 64, 64, dSpire);
      ctx.spr('bdAcidPool', 64, 64, dAcidPool);
      ctx.spr('bdVeins', 64, 64, dVeins);
      ctx.spr('bdBaleen', 64, 64, dBaleen);
      ctx.spr('bdMast', 64, 64, dMast);
      ctx.spr('bdSail', 64, 64, dSail);
      ctx.spr('bdWheel', 64, 64, dWheel);
      ctx.spr('bdCrates', 64, 64, dCrates);
      ctx.spr('bdBarrel', 64, 64, dBarrel);
      ctx.spr('bdChest', 64, 64, dChest);
      ctx.spr('bdAnchor', 64, 64, dAnchor);
      ctx.spr('bdCannon', 64, 64, dCannon);
      ctx.spr('bdDinghy', 64, 64, dDinghy);
      ctx.spr('bdTrap', 64, 64, dTrap);
      ctx.spr('bdNet', 64, 64, dNet);
      ctx.spr('bdSkeleton', 64, 64, dSkeleton);
      ctx.spr('bdKelp', 64, 64, dKelp);
      ctx.spr('bdAmbergris', 64, 64, dAmbergris);
      ctx.spr('bdLanterns', 64, 64, dLanterns);
      // ---- tiles (#1 2 3 4 6 8 9) + acid anim frames + arena sand stage ----
      ctx.tex('bellylining', 48, 48, tLining);
      ctx.tex('bellyfolds', 48, 48, tFolds);
      ctx.tex('bellyacid', 48, 48, tAcidFrame(0));
      ctx.tex('bellyacid2', 48, 48, tAcidFrame(2.1));
      ctx.tex('bellyacid3', 48, 48, tAcidFrame(4.2));
      ctx.tex('bellybone', 48, 48, tBones);
      ctx.tex('bellycrust', 48, 48, tBarnacleCrust);
      ctx.tex('bellygristle', 48, 48, tGristle);
      ctx.tex('bellybile', 48, 48, tBile);
      ctx.tex('bellyArenaSand', 48, 48, tSand);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = BELLY_ART;
  root.BELLY_ART = BELLY_ART;
})(typeof window !== 'undefined' ? window : this);
