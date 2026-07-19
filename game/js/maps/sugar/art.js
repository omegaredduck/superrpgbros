// ============================================================================
// game/js/maps/sugar/art.js — SUGAR WORLD (realm 16) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 3 5 6 7 11 12 14
// 16 17 (+ split-child + open-maw + jawbreaker-layer frames), SUGAR BEAR
// (render_sugar_boss_final.js — cotton-candy fluff, multi-color gumball armor,
// rainbow chest gem, twin peppermint ears, peppermint cane, RED GLOW EYES;
// plus a P2 disheveled variant), the CANDY PICKUP + destructible-FENCE states
// + candy shard, 20 decor, 5 ground tiles + the chocolate-river strip.
// Mood: PASTEL MENACE — adorable, glossy, and hostile; the bear smiles while
// his eyes glow. 6-DIGIT HEX ONLY (RANGER_ART.mix breaks on shorthand).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- sugar palette (sugar_kit.js G, verbatim) -----------------------------
  var G = {
    OUT: '#2a1420',
    cream: '#fff4e8', creamDk: '#e0c8b0',
    pink: '#ff9ac8', pinkLt: '#ffd0e8', pinkDk: '#c04a88',
    mint: '#7ae8c0', mintLt: '#c8fff0', mintDk: '#2a9a72',
    red: '#ff4a58', redLt: '#ff9aa0', redDk: '#a01828',
    orange: '#ff9a3a', orangeLt: '#ffd08a', orangeDk: '#b05a10',
    yellow: '#ffd83a', yellowLt: '#fff0a8', yellowDk: '#b08a10',
    lime: '#a8e83a', limeLt: '#d8ffa0', limeDk: '#5a9a10',
    blue: '#4ab8ff', blueLt: '#b0e0ff', blueDk: '#1a5aa8',
    grape: '#b06ae8', grapeLt: '#e0c0ff', grapeDk: '#5a2a90',
    choc: '#6a3a22', chocLt: '#9a6440', chocDk: '#3a1c0e',
    caramel: '#d8922a', caramelLt: '#ffc86a', caramelDk: '#8a5210',
    ginger: '#b87838', gingerLt: '#e0a860', gingerDk: '#7a4a1a',
    lico: '#2a2430', licoLt: '#4a4458', licoDk: '#14101c',
    white: '#ffffff', oil: '#1a0c14',
    soda: '#c8f0e8'
  };

  // ---- shared helpers (sugar_kit + swamp lineage) ---------------------------
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      row(put, y, x0, x1, (function (vt) { return function (tx) {
        var b = mix(hi, base, clamp(vt * 1.15, 0, 1));
        b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
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
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, function () { return G.oil; }); }
  // candy stripe helper — diagonal stripes across an ellipse fill
  function stripes(c1, c2, freq) {
    return function (tx, ty) { return ((((tx + ty) * (freq || 6)) | 0) % 2 ? c1 : c2); };
  }
  // sprinkle scatter
  function sprinkles(put, cx, cy, rx, ry, n, seedOff) {
    var cols = [G.red, G.blue, G.yellow, G.lime, G.grape, G.white];
    for (var i = 0; i < n; i++) {
      var a = (i * 2.4 + (seedOff || 0)), r = ((i * 7919) % 100) / 100;
      var x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      stroke(put, x, y, x + Math.cos(a * 3) * 2.4, y + Math.sin(a * 3) * 2.4, 1.3, (function (i) { return function () { return cols[i % 6]; }; })(i));
    }
  }
  // frosting drip edge along a top line
  function drip(put, x0, x1, y, c, cDk) {
    for (var x = x0; x < x1; x += 3) {
      var len = 3 + Math.abs(Math.sin(x * 1.7)) * 6;
      stroke(put, x, y, x, y + len, 2.2, (function () { return mix(c, cDk, 0.3); }));
      put(Math.round(x), Math.round(y + len + 1), cDk);
    }
  }
  // candy gloss highlight
  function gloss(put, cx, cy, r) {
    ell(put, cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.18, function () { return G.white; });
    put(Math.round(cx + r * 0.3), Math.round(cy - r * 0.5), G.white);
  }
  function n2(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }

  // ============ MOBS (#1 GUMMY BEAR · #2 GINGERDEAD MAN · #3 CANDY LANCER ·
  // #5 JAWBREAKER · #6 LOLLI TWIRLER · #7 GUMDROP · #11 COTTON DRIFT ·
  // #12 MINT GUARDIAN · #14 MALLOW BRUTE · #16 CUPCAKE MIMIC · #17 CANDY CORN)

  function drawGummy(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    var c = G.red, cDk = G.redDk, cLt = G.redLt;
    ell(put, cx, S * 0.6, S * 0.11, S * 0.13, function (tx, ty) { return mix(cLt, c, clamp(tx * 0.8 + ty * 0.5, 0, 1)); });
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.1, S * 0.66, S * 0.035, S * 0.05, function (tx, ty) { return mix(c, cDk, tx); }); ell(put, cx + s * S * 0.065, S * 0.72, S * 0.035, S * 0.04, function (tx, ty) { return mix(c, cDk, ty); }); });
    ell(put, cx, S * 0.42, S * 0.085, S * 0.08, function (tx, ty) { return mix(cLt, c, clamp(tx * 0.9 + ty * 0.4, 0, 1)); });
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.065, S * 0.35, S * 0.028, S * 0.028, function (tx, ty) { return mix(c, cDk, tx + ty * 0.3); }); });
    gloss(put, cx - S * 0.02, S * 0.4, S * 0.08);
    optic(put, cx - S * 0.03, S * 0.41, S * 0.009, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.03, S * 0.41, S * 0.009, G.oil, G.oil, '#ffffff');
    ell(put, cx, S * 0.46, S * 0.035, S * 0.025, function () { return cDk; });
    [[-0.02], [0.012]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * 0.445), G.white); });
  }
  function drawGinger(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    var g = G.ginger, gDk = G.gingerDk, gLt = G.gingerLt;
    ell(put, cx, S * 0.52, S * 0.085, S * 0.1, function (tx, ty) { return mix(gLt, g, clamp(tx * 0.9 + ty * 0.4, 0, 1)); });
    stroke(put, cx - S * 0.03, S * 0.6, cx - S * 0.12, S * 0.72, S * 0.032, function () { return g; });
    stroke(put, cx + S * 0.03, S * 0.6, cx + S * 0.1, S * 0.78, S * 0.032, function () { return mix(g, gDk, 0.3); });
    stroke(put, cx - S * 0.07, S * 0.48, cx - S * 0.16, S * 0.42, S * 0.028, function () { return g; });
    stroke(put, cx + S * 0.07, S * 0.48, cx + S * 0.15, S * 0.38, S * 0.028, function () { return g; });
    stroke(put, cx + S * 0.16, S * 0.37, cx + S * 0.22, S * 0.26, 2.6, stripes(G.red, G.white, 9));
    put(Math.round(cx + S * 0.225), Math.round(S * 0.25), G.white);
    ell(put, cx, S * 0.36, S * 0.07, S * 0.065, function (tx, ty) { return mix(gLt, g, clamp(tx + ty * 0.3, 0, 1)); });
    for (var x = -0.05; x <= 0.05; x += 0.01) put(Math.round(cx + x * S), Math.round(S * 0.31 + Math.sin(x * 90) * 1.6), G.cream);
    optic(put, cx - S * 0.025, S * 0.35, S * 0.009, G.oil, G.oil, '#ffffff');
    put(Math.round(cx + S * 0.025), Math.round(S * 0.35), G.oil);
    put(Math.round(cx + S * 0.03), Math.round(S * 0.345), gDk);
    stroke(put, cx - S * 0.03, S * 0.39, cx + S * 0.03, S * 0.385, 1.2, function () { return gDk; });
    [0.46, 0.52, 0.58].forEach(function (y, i) { put(Math.round(cx), Math.round(S * y), [G.red, G.lime, G.blue][i]); });
  }
  function drawGingerHalf(put, S) {           // top half crawling (split child)
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    var g = G.ginger, gDk = G.gingerDk, gLt = G.gingerLt;
    // torso only, dragging
    ell(put, cx, S * 0.6, S * 0.09, S * 0.075, function (tx, ty) { return mix(gLt, g, clamp(tx * 0.9 + ty * 0.4, 0, 1)); });
    // ragged crumbled bottom
    for (var x = -0.09; x <= 0.09; x += 0.02) put(Math.round(cx + x * S), Math.round(S * 0.68 + Math.abs(Math.sin(x * 60)) * 3), gDk);
    // dragging arms
    stroke(put, cx - S * 0.07, S * 0.56, cx - S * 0.17, S * 0.66, S * 0.026, function () { return g; });
    stroke(put, cx + S * 0.07, S * 0.56, cx + S * 0.17, S * 0.62, S * 0.026, function () { return g; });
    ell(put, cx, S * 0.44, S * 0.065, S * 0.06, function (tx, ty) { return mix(gLt, g, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, cx - S * 0.022, S * 0.43, S * 0.009, G.oil, G.red, G.redLt);
    put(Math.round(cx + S * 0.022), Math.round(S * 0.43), G.oil);
    stroke(put, cx - S * 0.028, S * 0.47, cx + S * 0.028, S * 0.472, 1.2, function () { return gDk; });
    for (var xx = -0.04; xx <= 0.04; xx += 0.012) put(Math.round(cx + xx * S), Math.round(S * 0.38 + Math.sin(xx * 90) * 1.4), G.cream);
  }
  function drawLancer(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    ell(put, cx, S * 0.52, S * 0.09, S * 0.11, stripes(G.red, G.white, 7));
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.8, S * 0.028, function () { return (s < 0 ? G.red : G.redDk); }); });
    stroke(put, cx - S * 0.02, S * 0.5, cx - S * 0.3, S * 0.56, 3, stripes(G.red, G.white, 14));
    for (var a = 0; a < 2.6; a += 0.25) put(Math.round(cx + S * 0.02 + Math.cos(a) * S * 0.035), Math.round(S * 0.47 - Math.sin(a) * S * 0.035), (a * 4 | 0) % 2 ? G.red : G.white);
    put(Math.round(cx - S * 0.31), Math.round(S * 0.565), G.white);
    dome(put, cx, S * 0.37, S * 0.06, S * 0.06, G.mint, G.mintLt, G.mintDk);
    row(put, Math.round(S * 0.375), cx - S * 0.045, cx + S * 0.045, function () { return G.oil; });
    gloss(put, cx, S * 0.35, S * 0.05);
  }
  function drawJawbreaker(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    [[0.16, G.grape, G.grapeLt], [0.13, G.white, G.creamDk], [0.1, G.red, G.redLt], [0.07, G.yellow, G.yellowLt], [0.04, G.mint, G.mintLt]].forEach(function (L) {
      var r = L[0], c = L[1], cLt = L[2];
      ell(put, cx, S * 0.56, S * r, S * r, function (tx, ty) {
        var b = mix(cLt, c, clamp(tx * 0.9 + ty * 0.6, 0, 1));
        if (tx + ty > 1.25) b = mix(b, '#3a2a44', 0.3);
        return b;
      });
    });
    gloss(put, cx, S * 0.5, S * 0.14);
    stroke(put, cx - S * 0.06, S * 0.5, cx - S * 0.02, S * 0.53, 1.6, function () { return G.oil; });
    stroke(put, cx + S * 0.06, S * 0.5, cx + S * 0.02, S * 0.53, 1.6, function () { return G.oil; });
    stroke(put, cx + S * 0.1, S * 0.44, cx + S * 0.14, S * 0.5, 1.2, function () { return G.oil; });
    [[-0.24, 0.66], [-0.28, 0.6]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.02, S * 0.012, function (tx) { return mix(G.creamDk, G.cream, tx); }); });
  }
  function drawLolli(put, S) {                 // LOLLI TWIRLER — NO ARMS (Red)
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    stroke(put, cx, S * 0.52, cx, S * 0.82, 2.6, function () { return G.white; });
    stroke(put, cx + 1, S * 0.52, cx + 1, S * 0.82, 1, function () { return G.creamDk; });
    ell(put, cx, S * 0.38, S * 0.13, S * 0.13, function (tx, ty) { return mix(G.pinkLt, G.pink, ty); });
    for (var a = 0; a < 14; a += 0.05) {
      var r = S * 0.008 + a * S * 0.0088;
      put(Math.round(cx + Math.cos(a) * r), Math.round(S * 0.38 + Math.sin(a) * r), (a * 2 | 0) % 2 ? G.red : G.white);
    }
    gloss(put, cx, S * 0.32, S * 0.11);
    [[-0.26, 0.36], [0.26, 0.44], [-0.22, 0.48]].forEach(function (d) { stroke(put, cx + d[0] * S, S * d[1], cx + d[0] * S * 1.2, S * d[1], 1.2, function () { return G.pinkLt; }); });
    optic(put, cx - S * 0.035, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.035, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
  }
  function drawGumdrop(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    for (var y = S * 0.4; y < S * 0.72; y++) {
      var t = (y - S * 0.4) / (S * 0.32);
      var w = S * 0.14 * Math.sqrt(Math.max(0.05, t));
      row(put, Math.round(y), cx - w, cx + w, (function (t) { return function (tx) {
        var b = mix(G.limeLt, G.lime, clamp(tx * 1.1 + (1 - t) * 0.2, 0, 1));
        if (tx > 0.8) b = mix(b, G.limeDk, 0.5);
        return b;
      }; })(t));
    }
    sprinkles(put, cx, S * 0.56, S * 0.1, S * 0.12, 10, 3);
    for (var i = 0; i < 8; i++) put(Math.round(cx - S * 0.1 + i * S * 0.028), Math.round(S * 0.44 + (i % 3) * 3), G.white);
    optic(put, cx - S * 0.04, S * 0.54, S * 0.01, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.04, S * 0.54, S * 0.01, G.oil, G.oil, '#ffffff');
    ell(put, cx, S * 0.6, S * 0.025, S * 0.018, function () { return G.limeDk; });
    [[-0.18, 0.74], [0.18, 0.74]].forEach(function (d) { stroke(put, cx + d[0] * S, S * d[1], cx + d[0] * S * 1.3, S * (d[1] + 0.02), 1.2, function () { return G.creamDk; }); });
  }
  function drawGumdropMini(put, S) {           // split child
    var cx = S * 0.5; shadow(put, S, cx, S * 0.16);
    for (var y = S * 0.46; y < S * 0.7; y++) {
      var t = (y - S * 0.46) / (S * 0.24);
      var w = S * 0.11 * Math.sqrt(Math.max(0.05, t));
      row(put, Math.round(y), cx - w, cx + w, (function (t) { return function (tx) { return mix(G.limeLt, G.lime, clamp(tx * 1.1 + (1 - t) * 0.2, 0, 1)); }; })(t));
    }
    for (var i = 0; i < 5; i++) put(Math.round(cx - S * 0.07 + i * S * 0.03), Math.round(S * 0.5 + (i % 2) * 2), G.white);
    optic(put, cx - S * 0.03, S * 0.58, S * 0.009, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.03, S * 0.58, S * 0.009, G.oil, G.oil, '#ffffff');
  }
  function drawCotton(put, S) {
    var cx = S * 0.5;
    [[0, 0.5, 0.11], [-0.1, 0.54, 0.08], [0.1, 0.54, 0.085], [-0.05, 0.44, 0.08], [0.06, 0.45, 0.075]].forEach(function (d) {
      ell(put, cx + d[0] * S, S * d[1], S * d[2], S * d[2] * 0.85, function (tx, ty) { return mix(G.pinkLt, G.pink, clamp(tx * 0.7 + ty * 0.5, 0, 1)); });
    });
    for (var a = 0; a < 6.28; a += 0.5) {
      var x = cx + Math.cos(a) * S * 0.14, y = S * 0.5 + Math.sin(a) * S * 0.1;
      stroke(put, x, y, x + Math.cos(a) * S * 0.04, y + Math.sin(a) * S * 0.03, 1.2, function () { return G.pinkLt; });
    }
    stroke(put, cx - S * 0.05, S * 0.48, cx - S * 0.015, S * 0.485, 1.4, function () { return G.pinkDk; });
    stroke(put, cx + S * 0.015, S * 0.485, cx + S * 0.05, S * 0.48, 1.4, function () { return G.pinkDk; });
    ell(put, cx, S * 0.53, S * 0.02, S * 0.014, function () { return G.pinkDk; });
    [[-0.08], [0], [0.09]].forEach(function (d, i) {
      stroke(put, cx + d[0] * S, S * 0.6, cx + d[0] * S + Math.sin(i * 2) * 3, S * (0.68 + i * 0.02), 1.1, function () { return G.pinkLt; });
      put(Math.round(cx + d[0] * S + Math.sin(i * 2) * 3), Math.round(S * (0.69 + i * 0.02)), G.pink);
    });
  }
  function drawMint(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.04, S * 0.66, cx + s * S * 0.05, S * 0.8, S * 0.026, function () { return G.mintDk; }); });
    ell(put, cx, S * 0.5, S * 0.07, S * 0.1, function (tx, ty) { return mix(G.mint, G.mintDk, tx + ty * 0.3); });
    ell(put, cx, S * 0.52, S * 0.135, S * 0.135, function (tx, ty) {
      var a = Math.atan2(ty - 0.5, tx - 0.5);
      return ((a * 4 / Math.PI + 8) | 0) % 2 ? G.red : G.white;
    });
    ell(put, cx, S * 0.52, S * 0.04, S * 0.04, function (tx, ty) { return mix(G.white, G.creamDk, ty); });
    gloss(put, cx - S * 0.02, S * 0.45, S * 0.11);
    optic(put, cx - S * 0.03, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.03, S * 0.37, S * 0.009, G.oil, G.oil, '#ffffff');
    [[-0.19, 0.42], [0.19, 0.62]].forEach(function (d) { stroke(put, cx + d[0] * S, S * d[1], cx + d[0] * S * 1.25, S * d[1], 1.2, function () { return G.redLt; }); });
  }
  function drawMallow(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    for (var y = S * 0.34; y < S * 0.74; y++) {
      var t = (y - S * 0.34) / (S * 0.4);
      var w = S * (0.14 + Math.sin(t * Math.PI) * 0.02);
      row(put, Math.round(y), cx - w, cx + w, function (tx) {
        var b = mix('#fffdf6', G.creamDk, clamp(tx * 1.15, 0, 1));
        if (tx > 0.85) b = mix(b, '#b09880', 0.4);
        return b;
      });
    }
    ell(put, cx, S * 0.34, S * 0.14, S * 0.04, function (tx, ty) { return mix('#fffdf6', G.creamDk, tx); });
    ell(put, cx + S * 0.08, S * 0.62, S * 0.05, S * 0.06, function (tx, ty) { return mix(G.caramel, G.chocDk, tx + ty * 0.3); });
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.17, S * 0.52, S * 0.045, S * 0.06, function (tx, ty) { return mix('#fffdf6', G.creamDk, tx + ty * 0.3); }); });
    optic(put, cx - S * 0.045, S * 0.46, S * 0.011, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.045, S * 0.46, S * 0.011, G.oil, G.oil, '#ffffff');
    stroke(put, cx - S * 0.06, S * 0.42, cx - S * 0.02, S * 0.435, 1.6, function () { return G.creamDk; });
    stroke(put, cx + S * 0.02, S * 0.435, cx + S * 0.06, S * 0.42, 1.6, function () { return G.creamDk; });
    ell(put, cx, S * 0.55, S * 0.04, S * 0.025, function () { return '#b09880'; });
  }
  function drawMallowMini(put, S) {            // split child
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    for (var y = S * 0.42; y < S * 0.7; y++) {
      var w = S * 0.1;
      row(put, Math.round(y), cx - w, cx + w, function (tx) { return mix('#fffdf6', G.creamDk, clamp(tx * 1.15, 0, 1)); });
    }
    ell(put, cx, S * 0.42, S * 0.1, S * 0.03, function (tx) { return mix('#fffdf6', G.creamDk, tx); });
    optic(put, cx - S * 0.035, S * 0.52, S * 0.01, G.oil, G.oil, '#ffffff');
    optic(put, cx + S * 0.035, S * 0.52, S * 0.01, G.oil, G.oil, '#ffffff');
    ell(put, cx, S * 0.6, S * 0.03, S * 0.02, function () { return '#b09880'; });
  }
  function drawCupcake(put, S) {               // SEALED mimic (looks innocent)
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    for (var y = S * 0.56; y < S * 0.78; y++) {
      var t = (y - S * 0.56) / (S * 0.22);
      var w = S * (0.13 - t * 0.035);
      row(put, Math.round(y), cx - w, cx + w, function (tx) {
        var b = mix(G.blueLt, G.blue, clamp(tx * 1.1, 0, 1));
        if (((tx * 12) | 0) % 2) b = mix(b, G.blueDk, 0.35);
        return b;
      });
    }
    dome(put, cx - S * 0.01, S * 0.48, S * 0.135, S * 0.11, G.pink, G.pinkLt, G.pinkDk);
    drip(put, cx - S * 0.13, cx + S * 0.12, S * 0.555, G.pink, G.pinkDk);
    sprinkles(put, cx - S * 0.01, S * 0.45, S * 0.09, S * 0.06, 9, 11);
    stroke(put, cx - S * 0.09, S * 0.565, cx + S * 0.08, S * 0.57, 1.2, function () { return G.pinkDk; });
    put(Math.round(cx + S * 0.03), Math.round(S * 0.575), G.white);  // one fang tip at the seam
    stroke(put, cx + S * 0.06, S * 0.36, cx + S * 0.09, S * 0.3, 1.6, function () { return G.pinkDk; });
    ell(put, cx + S * 0.1, S * 0.28, S * 0.025, S * 0.025, function (tx, ty) { return mix(G.redLt, G.redDk, tx + ty * 0.4); });
    put(Math.round(cx + S * 0.095), Math.round(S * 0.275), G.oil);
  }
  function drawCupcakeOpen(put, S) {           // ATTACK frame — maw open, fangs bared
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    for (var y = S * 0.58; y < S * 0.8; y++) {
      var t = (y - S * 0.58) / (S * 0.22);
      var w = S * (0.13 - t * 0.035);
      row(put, Math.round(y), cx - w, cx + w, function (tx) {
        var b = mix(G.blueLt, G.blue, clamp(tx * 1.1, 0, 1));
        if (((tx * 12) | 0) % 2) b = mix(b, G.blueDk, 0.35);
        return b;
      });
    }
    // frosting lid flipped up
    dome(put, cx - S * 0.01, S * 0.34, S * 0.135, S * 0.1, G.pink, G.pinkLt, G.pinkDk);
    sprinkles(put, cx - S * 0.01, S * 0.32, S * 0.09, S * 0.05, 9, 11);
    // gaping red maw
    ell(put, cx, S * 0.56, S * 0.115, S * 0.09, function (tx, ty) { return mix(G.redDk, G.oil, clamp(ty * 0.9, 0, 1)); });
    ell(put, cx, S * 0.58, S * 0.07, S * 0.05, function () { return '#4e0a12'; });
    // top + bottom fangs
    for (var i = 0; i < 5; i++) {
      var fx = cx + (i - 2) * S * 0.045;
      for (var d = 0; d < 5; d++) put(Math.round(fx), Math.round(S * 0.49 + d), G.white);
      for (var d2 = 0; d2 < 5; d2++) put(Math.round(fx + S * 0.022), Math.round(S * 0.65 - d2), G.white);
    }
    ell(put, cx + S * 0.1, S * 0.3, S * 0.025, S * 0.025, function (tx, ty) { return mix(G.redLt, G.red, tx + ty * 0.4); });
  }
  function drawCorn(put, S) {                  // CANDY CORN PACK — dart triangles
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [[0, 0.54, 1.15], [-0.17, 0.42, 0.95], [0.17, 0.44, 1]].forEach(function (F) {
      var dx = F[0], dy = F[1], sc = F[2];
      var px = cx + dx * S, py = S * dy;
      for (var x = 0; x < S * 0.15 * sc; x++) {
        var t = x / (S * 0.15 * sc);
        var h = Math.max(1.2, S * 0.055 * sc * t);
        var c = t < 0.25 ? G.white : t < 0.65 ? G.orange : G.yellow;
        var cLt = t < 0.25 ? '#ffffff' : t < 0.65 ? G.orangeLt : G.yellowLt;
        for (var y = -h; y <= h; y++) put(Math.round(px - S * 0.075 * sc + x), Math.round(py + y), mix(cLt, c, clamp(Math.abs(y) / (h + 0.5) + 0.25, 0, 1)));
      }
      put(Math.round(px + S * 0.02 * sc), Math.round(py - 1), G.oil);
      put(Math.round(px + S * 0.03 * sc), Math.round(py - 1), G.oil);
      stroke(put, px + S * 0.1 * sc, py, px + S * 0.15 * sc, py, 1.2, function () { return G.creamDk; });
    });
  }

  // ============ SUGAR BEAR — render_sugar_bear_shape.js bear160, FINAL params
  function bear160(put, S, o) {
    o = o || {};
    var fur = o.fur || '#c88a4a', furLt = o.furLt || '#e8b070', furDk = o.furDk || '#8a5424';
    var studs = o.studs || [G.lime, G.orange, G.grape, G.yellow, G.blue, G.red, G.grape];
    var beans = o.beans || [G.red, G.blue, G.orange, G.lime, G.yellow];
    var u = S / 160, X = function (v) { return v * u; };
    var coat = function (tx, ty) {
      var b = mix(furLt, fur, clamp(ty * 1.4, 0, 1));
      b = mix(b, furDk, clamp((ty - 0.45) * 1.4, 0, 1));
      if (tx > 0.86) b = mix(b, furDk, 0.3);
      return b;
    };
    ell(put, X(80), X(148), X(46), X(6), function () { return G.oil; });
    // LEGS
    stroke(put, X(64), X(112), X(52), X(134), X(12), coat);
    ell(put, X(50), X(140), X(12), X(8), coat);
    if (o.noFootStripe) {
      ell(put, X(48), X(141), X(6), X(4), function () { return G.pink; });
      [[43, 138], [48, 136.5], [53, 138]].forEach(function (b) { put(Math.round(X(b[0])), Math.round(X(b[1])), G.pinkLt); });
    } else ell(put, X(48), X(141), X(8), X(5), stripes(G.red, G.white, 5));
    stroke(put, X(96), X(112), X(104), X(136), X(12.5), coat);
    ell(put, X(106), X(142), X(12.5), X(8), coat);
    ell(put, X(104), X(142), X(6), X(4), function () { return G.pink; });
    [[98, 139], [104, 137.5], [110, 139]].forEach(function (b) { put(Math.round(X(b[0])), Math.round(X(b[1])), G.pinkLt); });
    // BODY
    for (var yy = 62; yy < 120; yy++) {
      var t = (yy - 62) / 58;
      var w = 22 + Math.sin(t * Math.PI * 0.62) * 14;
      row(put, Math.round(X(yy)), X(80 - w), X(80 + w), coat);
    }
    // BELLY CORE — lollipop swirl
    ell(put, X(80), X(94), X(10.5), X(10.5), function (tx, ty) { return mix(G.pinkLt, G.pink, ty); });
    for (var aa = 0; aa < 13; aa += 0.05) {
      var r0 = 1 + aa * 0.72;
      put(Math.round(X(80 + Math.cos(aa) * r0)), Math.round(X(94 + Math.sin(aa) * r0)), (aa * 2 | 0) % 2 ? (o.bellyC || G.red) : G.white);
    }
    // ARMS
    stroke(put, X(56), X(76), X(40), X(96), X(10), coat);
    ell(put, X(38), X(100), X(8.5), X(7), coat);
    stroke(put, X(104), X(76), X(120), X(88), X(10), coat);
    ell(put, X(123), X(90), X(8.5), X(7.5), coat);
    // peppermint cane
    stroke(put, X(126), X(96), X(126), X(52), X(4.5), stripes(G.red, G.white, 10));
    for (var ca = Math.PI; ca >= 0; ca -= 0.09) {
      var px2 = 126 - 9 + Math.cos(-ca) * 9, py2 = 52 + Math.sin(-ca) * 9;
      stroke(put, X(px2), X(py2), X(px2), X(py2 + 1), X(4), (function (ca) { return function () { return ((ca * 4 | 0) % 2 ? G.red : G.white); }; })(ca));
    }
    gloss(put, X(126), X(70), X(6));
    // HEAD
    ell(put, X(80), X(42), X(24), X(22), coat);
    ell(put, X(80), X(52), X(13), X(9.5), function (tx, ty) { return mix('#f0cc90', '#d8a860', clamp(tx * 0.9 + ty * 0.4, 0, 1)); });
    ell(put, X(80), X(48), X(4.5), X(4.2), function (tx, ty) { return mix(G.redLt, G.redDk, clamp(tx + ty * 0.4, 0, 1)); });   // cherry nose
    put(Math.round(X(78.5)), Math.round(X(46.5)), G.white);
    stroke(put, X(80), X(44), X(83), X(40), X(1.2), function () { return '#4a7a2a'; });
    for (var xs = -8; xs <= 8; xs += 0.5) put(Math.round(X(80 + xs)), Math.round(X(56 + (1 - (xs / 8) * (xs / 8)) * 3.2)), furDk);   // warm smile
    [[74, 57.5], [86, 57.5]].forEach(function (b) { put(Math.round(X(b[0])), Math.round(X(b[1])), furDk); });
    // GLOWING RED EYES + halo
    [[70], [90]].forEach(function (E) {
      var ex = E[0];
      for (var ga = 0; ga < 6.28; ga += 0.45) put(Math.round(X(ex + Math.cos(ga) * 4.6)), Math.round(X(38 + Math.sin(ga) * 4.6)), mix(G.red, fur, 0.55));
      ell(put, X(ex), X(38), X(3.2), X(3.2), function (tx, ty) { return mix(G.redLt, G.red, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2.4, 0, 1)); });
      put(Math.round(X(ex)), Math.round(X(38)), '#ffffff');
      put(Math.round(X(ex - 1)), Math.round(X(37)), G.redLt);
    });
    stroke(put, X(65), X(32), X(74), X(31), X(1.6), function () { return furDk; });
    stroke(put, X(86), X(31), X(95), X(32), X(1.6), function () { return furDk; });
    // TWIN PEPPERMINT-SWIRL EARS
    var pepperEar = function (ex) {
      ell(put, X(ex), X(22), X(9.5), X(9.5), function (tx, ty) {
        var a = Math.atan2(ty - 0.5, tx - 0.5);
        return ((a * 3 / Math.PI + 6) | 0) % 2 ? G.red : G.white;
      });
      gloss(put, X(ex), X(19), X(7));
    };
    pepperEar(58); pepperEar(102);
    // CANDY ARMOR STUDS
    var candy = function (sx, sy, rx, ry, c) {
      ell(put, X(sx), X(sy), X(rx), X(ry), function (tx, ty) {
        var b = mix(mix(c, '#ffffff', 0.42), c, clamp(tx * 0.5 + ty * 0.9, 0, 1));
        if (ty > 0.8) b = mix(b, mix(c, '#000000', 0.25), 0.5);
        return b;
      });
      put(Math.round(X(sx - rx * 0.35)), Math.round(X(sy - ry * 0.4)), G.white);
    };
    // depletion-aware stud count (o.studCount limits how many gumballs remain)
    var studPos = [[62, 70], [98, 70], [58, 88], [102, 96], [70, 112], [92, 112], [80, 68]];
    var nStuds = (o.studCount == null) ? studPos.length : Math.max(0, Math.min(studPos.length, o.studCount));
    for (var si = 0; si < nStuds; si++) candy(studPos[si][0], studPos[si][1], 4.6, 4.2, studs[si % studs.length]);
    [[68, 80], [92, 82], [50, 122]].forEach(function (b, i) { candy(b[0], b[1], 3.8, 2.4, beans[i % beans.length]); });
    // RAINBOW GEM centerpiece
    var gx0 = 80, gy0 = 76, bands = [G.red, G.orange, G.yellow, G.lime, G.blue, G.grape];
    ell(put, X(gx0), X(gy0), X(5.2), X(5.2), function (tx, ty) {
      var d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      var band = bands[Math.min(5, (d * 6) | 0)];
      return mix(mix(band, '#ffffff', 0.3), band, clamp(tx * 0.5 + ty * 0.8, 0, 1));
    });
    for (var fa = 0; fa < 6.28; fa += 1.05) stroke(put, X(gx0), X(gy0), X(gx0 + Math.cos(fa) * 5), X(gy0 + Math.sin(fa) * 5), X(0.8), function () { return '#ffffff'; });
    put(Math.round(X(gx0 - 1.5)), Math.round(X(gy0 - 2)), G.white);
    // MINI GUMMY BEARS stuck on
    [[66, 96, G.lime], [94, 90, G.orange], [44, 92, G.red]].forEach(function (b) {
      var sx = b[0], sy = b[1], c = b[2], gLt = mix(c, '#ffffff', 0.5);
      ell(put, X(sx), X(sy + 1.5), X(2.8), X(3.2), function (tx, ty) { return mix(gLt, c, clamp(ty + tx * 0.3, 0, 1)); });
      ell(put, X(sx), X(sy - 2.2), X(2.2), X(2.1), function (tx, ty) { return mix(gLt, c, ty); });
      put(Math.round(X(sx - 0.8)), Math.round(X(sy - 2.6)), G.white);
    });
    // sugar sparkle
    [[60, 60], [104, 62], [40, 84], [122, 100]].forEach(function (b) {
      put(Math.round(X(b[0])), Math.round(X(b[1])), '#ffffff');
      put(Math.round(X(b[0] + 1)), Math.round(X(b[1])), G.creamDk);
    });
    // P2: disheveled fluff spikes
    if (o.p2) {
      for (var da = 0; da < 6.28; da += 0.52) {
        var hx = 80 + Math.cos(da) * 25, hy = 82 + Math.sin(da) * 40;
        stroke(put, X(hx), X(hy), X(hx + Math.cos(da) * 6), X(hy + Math.sin(da) * 6), X(2.2), function () { return furLt; });
      }
    }
  }
  var BEAR_FINAL = {
    fur: G.pink, furLt: G.pinkLt, furDk: G.pinkDk, weapon: 'cane', noFootStripe: true,
    bellyC: G.blue, studs: [G.red, G.orange, G.yellow, G.lime, G.blue, G.grape, G.pink],
    beans: [G.lime, G.blue, G.orange]
  };
  function makeBear(over) { var o = {}; for (var k in BEAR_FINAL) o[k] = BEAR_FINAL[k]; if (over) for (var j in over) o[j] = over[j]; return o; }
  function drawBear(put, S) { bear160(put, S, makeBear()); }
  function drawBearP2(put, S) { bear160(put, S, makeBear({ fur: '#ff7ab0', furLt: '#ffc0dc', furDk: '#b03a70', p2: true })); }

  // ============ MAP MECHANIC SPRITES =========================================
  function drawCandy(put, S) {                 // CANDY PICKUP — wrapped, sparkling (FULL HEAL)
    var cx = S * 0.5, cy = S * 0.5;
    // wrapper twists
    [-1, 1].forEach(function (s) {
      var wx = cx + s * S * 0.26;
      for (var t = 0; t < 1; t += 0.12) put(Math.round(wx + s * t * S * 0.06), Math.round(cy - S * 0.12 + t * S * 0.24), s < 0 ? G.pinkLt : G.pink);
      stroke(put, cx + s * S * 0.14, cy, wx, cy - S * 0.1, 2, function () { return G.pink; });
      stroke(put, cx + s * S * 0.14, cy, wx, cy + S * 0.1, 2, function () { return G.pinkDk; });
    });
    // candy core
    ell(put, cx, cy, S * 0.17, S * 0.15, function (tx, ty) {
      var d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      var band = [G.red, G.orange, G.yellow, G.lime][Math.min(3, (d * 4) | 0)];
      return mix(mix(band, '#ffffff', 0.35), band, clamp(tx * 0.5 + ty * 0.7, 0, 1));
    });
    gloss(put, cx, cy - S * 0.02, S * 0.13);
    // sparkles
    [[0.2, 0.22], [0.78, 0.3], [0.72, 0.74], [0.24, 0.76], [0.5, 0.14]].forEach(function (d) {
      var x = S * d[0], y = S * d[1];
      put(Math.round(x), Math.round(y), '#ffffff');
      put(Math.round(x - 2), Math.round(y), G.pinkLt); put(Math.round(x + 2), Math.round(y), G.pinkLt);
      put(Math.round(x), Math.round(y - 2), G.pinkLt); put(Math.round(x), Math.round(y + 2), G.pinkLt);
    });
  }
  function fenceState(put, S, state) {         // 0 whole · 1 cracked · 2 shattering
    var cx = S * 0.5;
    if (state < 2) shadow(put, S, cx, S * 0.3);
    var lean = state === 1 ? 0.03 : 0;
    [[-0.2], [0], [0.2]].forEach(function (d, i) {
      if (state === 2 && i === 1) return;      // middle post gone
      var bx = cx + (d[0] + lean * (i - 1)) * S;
      stroke(put, bx, S * 0.45, bx, S * (state === 1 ? 0.78 : 0.8), 3.2, stripes(G.red, G.white, 8));
      for (var a = Math.PI; a >= 0; a -= 0.12) {
        var px = bx - 5 + Math.cos(-a) * 5, py = S * 0.45 + Math.sin(-a) * 5;
        stroke(put, px, py, px, py + 1, 2.8, (function (a) { return function () { return ((a * 4 | 0) % 2 ? G.red : G.white); }; })(a));
      }
    });
    if (state === 0) {
      [0.58, 0.7].forEach(function (y) { for (var x = -0.24; x < 0.24; x += 0.01) put(Math.round(cx + x * S), Math.round(S * (y + Math.sin(x * 30) * 0.008)), (x * 40 | 0) % 2 ? G.pinkLt : G.white); });
    } else if (state === 1) {
      // one rail snapped, cracks
      for (var x2 = -0.24; x2 < 0.05; x2 += 0.01) put(Math.round(cx + x2 * S), Math.round(S * (0.58 + Math.sin(x2 * 30) * 0.008)), (x2 * 40 | 0) % 2 ? G.pinkLt : G.white);
      [[-0.1, 0.5], [0.12, 0.62]].forEach(function (d) { stroke(put, cx + d[0] * S, S * d[1], cx + (d[0] + 0.05) * S, S * (d[1] + 0.06), 1.2, function () { return G.pinkDk; }); });
    } else {
      // shards flying
      [[-0.15, 0.5, G.red], [0.05, 0.44, G.white], [0.2, 0.56, G.pink], [-0.05, 0.62, G.pinkLt]].forEach(function (d) {
        ell(put, cx + d[0] * S, S * d[1], S * 0.03, S * 0.02, function () { return d[2]; });
      });
    }
  }
  function drawShard(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    [[0, 0, G.red], [0.18, -0.1, G.white], [-0.16, 0.12, G.pink]].forEach(function (d) {
      ell(put, cx + d[0] * S, cy + d[1] * S, S * 0.12, S * 0.07, function (tx, ty) { return mix(mix(d[2], '#ffffff', 0.3), d[2], ty); });
    });
  }

  // ============ DECOR (20) ===================================================
  function drawCottonTree(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    stroke(put, cx, S * 0.5, cx, S * 0.86, S * 0.035, function () { return G.choc; });
    stroke(put, cx - S * 0.012, S * 0.55, cx - S * 0.012, S * 0.84, S * 0.01, function () { return G.chocLt; });
    stroke(put, cx, S * 0.62, cx + S * 0.08, S * 0.52, S * 0.02, function () { return G.choc; });
    [[0, 0.3, 0.15, G.pink, G.pinkLt], [-0.12, 0.38, 0.1, G.blueLt, '#e0f4ff'], [0.12, 0.36, 0.11, G.pink, G.pinkLt], [0.02, 0.44, 0.09, G.pinkLt, '#ffe8f4']].forEach(function (d) {
      ell(put, cx + d[0] * S, S * d[1], S * d[2], S * d[2] * 0.9, (function (d) { return function (tx, ty) { return mix(d[4], d[3], clamp(tx * 0.8 + ty * 0.6, 0, 1)); }; })(d));
    });
    for (var a = 0; a < 6.28; a += 0.6) put(Math.round(cx + Math.cos(a) * S * 0.17), Math.round(S * 0.36 + Math.sin(a) * S * 0.13), G.pinkLt);
  }
  function drawGumdropTree(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    stroke(put, cx, S * 0.44, cx, S * 0.86, S * 0.04, function () { return G.choc; });
    [[-0.1, 0.55], [0.1, 0.52]].forEach(function (d) { stroke(put, cx, S * (d[1] + 0.1), cx + d[0] * S, S * d[1], S * 0.022, function () { return G.choc; }); });
    ell(put, cx, S * 0.32, S * 0.17, S * 0.14, function (tx, ty) { return mix('#8ac862', '#4a8a3a', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [[-0.1, 0.26, G.red], [0.02, 0.22, G.grape], [0.12, 0.28, G.orange], [-0.04, 0.34, G.yellow], [0.08, 0.38, G.red], [-0.13, 0.36, G.blue]].forEach(function (d) {
      dome(put, cx + d[0] * S, S * d[1], S * 0.032, S * 0.028, d[2], mix(d[2], '#ffffff', 0.45), mix(d[2], '#000000', 0.3));
      put(Math.round(cx + d[0] * S - 1), Math.round(S * d[1] - 2), G.white);
    });
  }
  function drawGingerHouse(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    for (var y = Math.round(S * 0.48); y < S * 0.84; y++) row(put, y, cx - S * 0.18, cx + S * 0.18, function (tx) {
      var b = mix(G.gingerLt, G.ginger, clamp(tx * 1.15, 0, 1));
      if (tx > 0.85) b = mix(b, G.gingerDk, 0.5);
      return b;
    });
    for (var y2 = 0; y2 < S * 0.16; y2++) {
      var t = y2 / (S * 0.16), w = S * (0.04 + t * 0.19);
      row(put, Math.round(S * 0.32 + y2), cx - w, cx + w, function (tx) { return mix('#fffdf6', G.creamDk, clamp(tx * 0.9, 0, 1)); });
    }
    drip(put, cx - S * 0.2, cx + S * 0.19, S * 0.48, '#fffdf6', G.creamDk);
    [[-0.08, 0.38, G.red], [0.02, 0.35, G.lime], [0.1, 0.4, G.blue], [-0.02, 0.42, G.orange]].forEach(function (d) { put(Math.round(cx + d[0] * S), Math.round(S * d[1]), d[2]); });
    dome(put, cx, S * 0.76, S * 0.05, S * 0.09, G.choc, G.chocLt, G.chocDk);
    put(Math.round(cx + S * 0.03), Math.round(S * 0.76), G.yellow);
    [[-0.1], [0.1]].forEach(function (d) { plate(put, cx + d[0] * S - S * 0.035, S * 0.56, cx + d[0] * S + S * 0.035, S * 0.64, G.yellowLt, '#fffdf6', G.caramel); });
    [[-0.21], [0.21]].forEach(function (d) { stroke(put, cx + d[0] * S, S * 0.52, cx + d[0] * S, S * 0.84, 2.6, stripes(G.red, G.white, 8)); });
  }
  function drawFence(put, S) { fenceState(put, S, 0); }
  function drawMushroom(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    for (var y = Math.round(S * 0.5); y < S * 0.84; y++) {
      var t = (y - S * 0.5) / (S * 0.34), w = S * (0.1 + t * 0.03);
      row(put, y, cx - w, cx + w, function (tx) { return mix('#fff4e0', G.creamDk, clamp(tx * 1.1, 0, 1)); });
    }
    dome(put, cx, S * 0.42, S * 0.2, S * 0.15, G.red, G.redLt, G.redDk);
    [[-0.12, 0.36], [0.02, 0.3], [0.13, 0.38], [-0.03, 0.42]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.026, S * 0.02, function () { return G.white; }); });
    dome(put, cx, S * 0.76, S * 0.04, S * 0.08, G.choc, G.chocLt, G.chocDk);
    ell(put, cx + S * 0.07, S * 0.62, S * 0.025, S * 0.025, function (tx, ty) { return mix(G.yellowLt, G.caramel, ty); });
  }
  function drawLolliGrove(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    [[-0.14, 0.34, 0.09, G.red], [0.1, 0.28, 0.11, G.grape], [0.02, 0.46, 0.07, G.orange]].forEach(function (d) {
      var dx = d[0], dy = d[1], r = d[2], c = d[3];
      stroke(put, cx + dx * S, S * (dy + r), cx + dx * S, S * 0.84, 2.4, function () { return G.white; });
      ell(put, cx + dx * S, S * dy, S * r, S * r, function (tx, ty) { return mix(mix(c, '#ffffff', 0.35), c, ty); });
      for (var a = 0; a < 12; a += 0.06) {
        var rr = 1 + a * (r * 10);
        put(Math.round(cx + dx * S + Math.cos(a) * rr * 0.55), Math.round(S * dy + Math.sin(a) * rr * 0.55), (a * 2 | 0) % 2 ? c : G.white);
      }
      gloss(put, cx + dx * S - S * 0.02, S * (dy - r * 0.4), S * r * 0.6);
    });
  }
  function drawPeak(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    for (var y = 0; y < S * 0.5; y++) {
      var t = y / (S * 0.5), w = S * 0.28 * t;
      row(put, Math.round(S * 0.32 + y), cx - w, cx + w, function (tx) {
        var b = mix('#f0a0b8', '#c86a8a', clamp(tx * 1.1, 0, 1));
        if (tx > 0.82) b = mix(b, '#8a3a5a', 0.4);
        return b;
      });
    }
    for (var y2 = 0; y2 < S * 0.14; y2++) row(put, Math.round(S * 0.32 + y2), cx - S * 0.28 * (y2 / (S * 0.5)), cx + S * 0.28 * (y2 / (S * 0.5)), function (tx) { return mix('#fffdf6', G.creamDk, tx * 0.6); });
    drip(put, cx - S * 0.08, cx + S * 0.08, S * 0.45, '#fffdf6', G.creamDk);
    sprinkles(put, cx, S * 0.4, S * 0.06, S * 0.05, 6, 17);
    ell(put, cx, S * 0.3, S * 0.028, S * 0.026, function (tx, ty) { return mix(G.redLt, G.redDk, tx + ty * 0.4); });
  }
  function drawMallows(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    [[-0.12, 0.66, 0.09, 0], [0.1, 0.68, 0.075, 0.2], [0, 0.52, 0.08, -0.15]].forEach(function (d) {
      var dx = d[0], dy = d[1], r = d[2], tilt = d[3];
      for (var y = -r; y < r; y += 0.008) {
        var w = r * 0.95;
        row(put, Math.round(S * (dy + y)), cx + (dx - w + tilt * y) * S, cx + (dx + w + tilt * y) * S, function (tx) { return mix('#fffdf6', G.creamDk, clamp(tx * 1.05, 0, 1)); });
      }
    });
    ell(put, cx + S * 0.12, S * 0.64, S * 0.03, S * 0.025, function (tx, ty) { return mix(G.caramel, G.caramelDk, tx); });
  }
  function drawFlowers(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    [[-0.14, 0.6, G.red, G.yellow], [0.02, 0.52, G.orange, G.grape], [0.15, 0.62, G.blue, G.pink]].forEach(function (d) {
      var dx = d[0], dy = d[1], pc = d[2], cc = d[3];
      stroke(put, cx + dx * S, S * (dy + 0.05), cx + dx * S, S * 0.82, 1.8, function () { return '#4a8a3a'; });
      ell(put, cx + dx * S + S * 0.025, S * 0.74, S * 0.02, S * 0.01, function () { return '#6aa84a'; });
      for (var a = 0; a < 6.28; a += 0.9) ell(put, cx + dx * S + Math.cos(a) * S * 0.035, S * dy + Math.sin(a) * S * 0.035, S * 0.022, S * 0.022, (function (pc) { return function (tx, ty) { return mix(mix(pc, '#ffffff', 0.35), pc, ty); }; })(pc));
      ell(put, cx + dx * S, S * dy, S * 0.018, S * 0.018, function (tx, ty) { return mix(mix(cc, '#ffffff', 0.3), cc, ty); });
    });
  }
  function drawBridge(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    for (var x = -0.26; x <= 0.26; x += 0.008) {
      var y = 0.6 - Math.sin((x + 0.26) / 0.52 * Math.PI) * 0.1;
      stroke(put, cx + x * S, S * y, cx + x * S, S * (y + 0.07), 2, (function (x) { return function (t) { return mix(G.chocLt, G.chocDk, Math.abs(x) * 2.4 + t * 0.3); }; })(x));
    }
    for (var x2 = -0.24; x2 <= 0.24; x2 += 0.05) { var y2 = 0.6 - Math.sin((x2 + 0.26) / 0.52 * Math.PI) * 0.1; stroke(put, cx + x2 * S, S * y2, cx + x2 * S, S * (y2 + 0.065), 1, function () { return G.chocDk; }); }
    for (var x3 = -0.26; x3 <= 0.26; x3 += 0.016) {
      var y3 = 0.55 - Math.sin((x3 + 0.26) / 0.52 * Math.PI) * 0.1;
      put(Math.round(cx + x3 * S), Math.round(S * y3), (x3 * 30 | 0) % 2 ? G.red : G.white);
    }
    for (var yy = Math.round(S * 0.72); yy < S * 0.82; yy++) row(put, yy, cx - S * 0.3, cx + S * 0.3, (function (yy) { return function (tx) { return mix(G.chocLt, G.chocDk, clamp(tx + (yy % 4) * 0.1, 0, 1)); }; })(yy));
  }
  function drawGeyser(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    ell(put, cx, S * 0.7, S * 0.11, S * 0.05, function (tx, ty) { return mix('#c8e8e0', '#5a9a8a', clamp(tx + ty * 0.4, 0, 1)); });
    ell(put, cx, S * 0.69, S * 0.06, S * 0.022, function () { return G.soda; });
    for (var t = 0; t < 1; t += 0.05) {
      var w = S * (0.02 + t * 0.05);
      ell(put, cx + Math.sin(t * 9) * 2, S * (0.66 - t * 0.4), w, w * 0.8, function (tx, ty) { return mix('#f0fffc', G.soda, clamp(tx + ty * 0.3, 0, 1)); });
    }
    [[-0.12, 0.3], [0.14, 0.26], [-0.06, 0.2], [0.06, 0.34], [0.18, 0.4]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.014, S * 0.014, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.12 ? G.blueLt : G.soda); }); });
  }
  function drawCubes(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    [[-0.1, 0.68, 0.09], [0.1, 0.7, 0.08], [0, 0.54, 0.085]].forEach(function (d) {
      var dx = d[0], dy = d[1], r = d[2];
      plate(put, cx + (dx - r) * S, S * (dy - r), cx + (dx + r) * S, S * (dy + r), '#fffdf6', '#ffffff', G.creamDk);
      sprinkles(put, cx + dx * S, S * dy, S * r * 0.7, S * r * 0.7, 4, (dx * 100) | 0);
    });
  }
  function drawDonut(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    for (var a = Math.PI; a >= 0; a -= 0.02) {
      var px = cx + Math.cos(a) * S * 0.2, py = S * 0.74 - Math.sin(a) * S * 0.26;
      ell(put, px, py, S * 0.055, S * 0.05, function (tx, ty) { return mix(G.caramelLt, G.caramelDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)); });
    }
    for (var a2 = Math.PI * 0.85; a2 >= Math.PI * 0.15; a2 -= 0.02) {
      var px2 = cx + Math.cos(a2) * S * 0.2, py2 = S * 0.74 - Math.sin(a2) * S * 0.26;
      ell(put, px2, py2 - S * 0.012, S * 0.05, S * 0.035, function (tx, ty) { return mix(G.pinkLt, G.pink, clamp(tx + ty * 0.4, 0, 1)); });
    }
    sprinkles(put, cx, S * 0.48, S * 0.16, S * 0.05, 12, 23);
    drip(put, cx - S * 0.12, cx + S * 0.12, S * 0.52, G.pink, G.pinkDk);
  }
  function drawWafers(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    [[0, 0.76], [0.03, 0.68], [-0.02, 0.6], [0.02, 0.52]].forEach(function (d, i) {
      plate(put, cx + (d[0] - 0.16) * S, S * d[1], cx + (d[0] + 0.16) * S, S * (d[1] + 0.075), i % 2 ? '#f0d8b0' : '#e8c090', '#fff4dc', '#b08a58');
      for (var gx = -0.13; gx <= 0.13; gx += 0.045) stroke(put, cx + (d[0] + gx) * S, S * (d[1] + 0.01), cx + (d[0] + gx) * S, S * (d[1] + 0.065), 0.8, function () { return '#c8a068'; });
    });
    ell(put, cx, S * 0.48, S * 0.035, S * 0.03, function (tx, ty) { return mix(G.redLt, G.redDk, tx + ty * 0.3); });
  }
  function drawJelly(put, S) {
    var cx = S * 0.5;
    ell(put, cx, S * 0.66, S * 0.22, S * 0.12, function (tx, ty) { return mix(G.grapeLt, G.grape, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    ell(put, cx, S * 0.62, S * 0.19, S * 0.08, function (tx, ty) { return mix(mix(G.grapeLt, '#ffffff', 0.3), G.grape, clamp(tx + ty * 0.4, 0, 1)); });
    for (var a = 0; a < 6.28; a += 0.35) put(Math.round(cx + Math.cos(a) * S * 0.13), Math.round(S * 0.62 + Math.sin(a) * S * 0.05), G.grapeLt);
    gloss(put, cx - S * 0.06, S * 0.58, S * 0.08);
    [[-0.08, 0.64, G.orange], [0.06, 0.66, G.lime], [0.01, 0.61, G.red]].forEach(function (d) { ell(put, cx + d[0] * S, S * d[1], S * 0.02, S * 0.014, function (tx, ty) { return mix(mix(d[2], '#ffffff', 0.3), d[2], ty); }); });
    drip(put, cx - S * 0.14, cx + S * 0.14, S * 0.74, G.grape, G.grapeDk);
  }
  function drawSign(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    stroke(put, cx, S * 0.36, cx, S * 0.84, 3, stripes(G.red, G.white, 9));
    [[0.34, 1], [0.46, -1]].forEach(function (d) {
      var y = d[0], dir = d[1];
      var x0 = cx - S * 0.14 * (dir > 0 ? 0.3 : 1), x1 = cx + S * 0.14 * (dir > 0 ? 1 : 0.3);
      plate(put, x0, S * y, x1, S * (y + 0.07), '#f0d8b0', '#fff4dc', '#b08a58');
      for (var i = 0; i < 6; i++) { var px = dir > 0 ? x1 + i : x0 - i; for (var yy = i; yy < 12 - i; yy++) put(Math.round(px), Math.round(S * y + yy - 1), '#e8c090'); }
    });
    dome(put, cx, S * 0.33, S * 0.035, S * 0.03, G.lime, G.limeLt, G.limeDk);
  }
  function drawScoop(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.28);
    for (var t = 0; t < 1; t += 0.04) {
      var w = S * 0.09 * (1 - t);
      ell(put, cx + S * (0.06 + t * 0.22), S * (0.66 + t * 0.06), w, w * 0.9, function (tx, ty) { return mix('#e8c090', '#b08a58', clamp(tx + ty * 0.4, 0, 1)); });
    }
    ell(put, cx - S * 0.06, S * 0.6, S * 0.12, S * 0.11, function (tx, ty) { return mix('#fff0f6', G.pink, clamp(tx * 0.8 + ty * 0.6, 0, 1)); });
    drip(put, cx - S * 0.16, cx + S * 0.05, S * 0.68, G.pink, G.pinkDk);
    ell(put, cx - S * 0.08, S * 0.5, S * 0.025, S * 0.024, function (tx, ty) { return mix(G.redLt, G.redDk, tx + ty * 0.4); });
  }
  function drawWheel(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    ell(put, cx, S * 0.56, S * 0.16, S * 0.16, function (tx, ty) {
      var a = Math.atan2(ty - 0.5, tx - 0.5);
      return ((a * 4 / Math.PI + 8) | 0) % 2 ? G.red : G.white;
    });
    ell(put, cx, S * 0.56, S * 0.045, S * 0.045, function (tx, ty) { return mix(G.white, G.creamDk, ty); });
    gloss(put, cx - S * 0.04, S * 0.46, S * 0.12);
    dome(put, cx + S * 0.14, S * 0.76, S * 0.05, S * 0.045, G.grape, G.grapeLt, G.grapeDk);
  }
  function drawTaffyPost(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    for (var t = 0; t < 1; t += 0.02) {
      var y = S * (0.84 - t * 0.5);
      var px = cx + Math.sin(t * 12) * S * 0.03;
      ell(put, px, y, S * 0.04, S * 0.022, (function (t) { return function (tx, ty) {
        var band = ((t * 14) | 0) % 2;
        return mix(band ? G.orange : G.orangeLt, G.orangeDk, clamp(tx + ty * 0.3, 0, 1));
      }; })(t));
    }
  }
  function drawCupcakeHouse(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    for (var y = Math.round(S * 0.56); y < S * 0.84; y++) {
      var t = (y - S * 0.56) / (S * 0.28), w = S * (0.19 - t * 0.045);
      row(put, y, cx - w, cx + w, function (tx) {
        var b = mix(G.mintLt, G.mint, clamp(tx * 1.1, 0, 1));
        if (((tx * 14) | 0) % 2) b = mix(b, G.mintDk, 0.35);
        return b;
      });
    }
    dome(put, cx, S * 0.42, S * 0.2, S * 0.16, G.pink, G.pinkLt, G.pinkDk);
    drip(put, cx - S * 0.19, cx + S * 0.18, S * 0.55, G.pink, G.pinkDk);
    sprinkles(put, cx, S * 0.38, S * 0.13, S * 0.09, 10, 29);
    ell(put, cx + S * 0.04, S * 0.26, S * 0.035, S * 0.032, function (tx, ty) { return mix(G.redLt, G.redDk, tx + ty * 0.4); });
    dome(put, cx, S * 0.76, S * 0.045, S * 0.08, G.choc, G.chocLt, G.chocDk);
    ell(put, cx - S * 0.1, S * 0.66, S * 0.028, S * 0.028, function (tx, ty) { return mix(G.yellowLt, G.caramel, ty); });
  }

  // ============ TILES (#2 path · #4 sprinkle · #7 cookie · #8 icing · #9 gummy
  //              + the chocolate-river scenery strip #3) ======================
  function fill(put, S, fn) { for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) put(x, y, fn(x, y)); }
  function tPath(put, S) {
    fill(put, S, function (x, y) {
      var ry = Math.floor(y / (S * 0.18));
      var off = (ry % 2) * S * 0.14;
      var pick = n2(Math.floor((x + off) / (S * 0.28)), ry);
      var base = pick > 0.66 ? G.pink : pick > 0.33 ? '#f0d8c0' : G.pinkLt;
      var b = mix(base, mix(base, '#8a4a5a', 0.5), n2(x * 0.1, y * 0.1) * 0.4);
      if (y % Math.round(S * 0.18) === 0 || (x + Math.round(off)) % Math.round(S * 0.28) === 0) b = mix(b, '#8a5a4a', 0.55);
      return b;
    });
  }
  function tSprinkle(put, S) {
    var cols = [G.red, G.blue, G.yellow, G.lime, G.grape, G.orange];
    fill(put, S, function (x, y) {
      var b = mix('#fff0f6', '#f0c8d8', n2(x * 0.06, y * 0.06) * 0.6);
      var cell = n2(Math.floor(x / 7), Math.floor(y / 7));
      if (cell > 0.55) {
        var bx = (Math.floor(x / 7) + 0.5) * 7, by = (Math.floor(y / 7) + 0.5) * 7;
        var ang = cell * 6.28, dx = x - bx, dy = y - by;
        var along = dx * Math.cos(ang) + dy * Math.sin(ang), across = -dx * Math.sin(ang) + dy * Math.cos(ang);
        if (Math.abs(along) < 2.8 && Math.abs(across) < 1) b = cols[(cell * 6) | 0];
      }
      return b;
    });
  }
  function tCookie(put, S) {
    fill(put, S, function (x, y) {
      var cs = S * 0.22;
      var cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
      var d1 = 9e9, d2 = 9e9, id = 0;
      for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
        var px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
        var d = (px - x) * (px - x) + (py - y) * (py - y);
        if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 7 + (cyi + j); } else if (d < d2) d2 = d;
      }
      var b = mix('#d8a05a', '#a87038', n2(id, id * 3) * 0.5 + n2(x * 0.15, y * 0.15) * 0.25);
      if (Math.sqrt(d2) - Math.sqrt(d1) < 2.4) b = mix(b, '#6a4218', 0.6);
      if (n2(x + 4, y + 9) > 0.965) b = mix(b, G.chocDk, 0.75);
      return b;
    });
  }
  function tIcing(put, S) {
    fill(put, S, function (x, y) {
      var b = mix('#ffffff', '#e0d0e0', n2(x * 0.04, y * 0.04) * 0.55);
      var drift = Math.sin((y + Math.sin(x * 0.05) * 6) * 0.25);
      if (drift > 0.8) b = mix(b, '#c8b8d0', 0.3);
      if (n2(x, y) > 0.988) b = '#ffffff';
      return b;
    });
  }
  function tGummy(put, S) {
    fill(put, S, function (x, y) {
      var b = mix(G.redLt, G.red, n2(x * 0.05, y * 0.05) * 0.7);
      var blob = n2(Math.floor(x / 20), Math.floor(y / 20));
      if (blob > 0.6) {
        var d = Math.hypot(x % 20 - 10, y % 20 - 10);
        if (d < 7) b = mix(b, '#ffd0d0', clamp(0.5 - d / 14, 0, 0.4));
      }
      if ((x + y) % 17 === 0) b = mix(b, G.redDk, 0.25);
      if (n2(x + 5, y + 5) > 0.993) b = mix(b, '#ffffff', 0.7);
      return b;
    });
  }
  function tRiver(put, S) {
    fill(put, S, function (x, y) {
      var b = mix(G.chocLt, G.chocDk, n2(x * 0.05, y * 0.05) * 0.7);
      var flow = Math.sin((x + Math.sin(y * 0.06) * 8) * 0.12 + y * 0.02);
      if (flow > 0.75) b = mix(b, G.caramelLt, 0.35);
      if (flow < -0.85) b = mix(b, '#2a1408', 0.5);
      if (n2(x + 3, y + 5) > 0.99) b = mix(b, G.caramelLt, 0.6);
      return b;
    });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var SUGAR_ART = {
    G: G,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (11 spawning + 3 split children + 1 open-maw frame) ----
      ctx.spr('sugGummyHi', MS, MS, drawGummy);
      ctx.spr('sugGingerHi', MS, MS, drawGinger);
      ctx.spr('sugGingerHalfHi', MS, MS, drawGingerHalf);
      ctx.spr('sugLancerHi', MS, MS, drawLancer);
      ctx.spr('sugJawHi', MS, MS, drawJawbreaker);
      ctx.spr('sugTwirlerHi', MS, MS, drawLolli);
      ctx.spr('sugGumdropHi', MS, MS, drawGumdrop);
      ctx.spr('sugGumdropMiniHi', MS, MS, drawGumdropMini);
      ctx.spr('sugCottonHi', MS, MS, drawCotton);
      ctx.spr('sugMintHi', MS, MS, drawMint);
      ctx.spr('sugMallowHi', MS, MS, drawMallow);
      ctx.spr('sugMallowMiniHi', MS, MS, drawMallowMini);
      ctx.spr('sugMimicHi', MS, MS, drawCupcake);
      ctx.spr('sugMimicOpenHi', MS, MS, drawCupcakeOpen);
      ctx.spr('sugCornHi', MS, MS, drawCorn);
      ctx.MOB_HI.gummyBear = 'sugGummyHi';       ctx.MOB_DISPLAY.gummyBear = 88;
      ctx.MOB_HI.gingerdead = 'sugGingerHi';     ctx.MOB_DISPLAY.gingerdead = 101;
      ctx.MOB_HI.gingerHalf = 'sugGingerHalfHi'; ctx.MOB_DISPLAY.gingerHalf = 71;
      ctx.MOB_HI.candyLancer = 'sugLancerHi';    ctx.MOB_DISPLAY.candyLancer = 105;
      ctx.MOB_HI.jawbreaker = 'sugJawHi';        ctx.MOB_DISPLAY.jawbreaker = 101;
      ctx.MOB_HI.lolliTwirler = 'sugTwirlerHi';  ctx.MOB_DISPLAY.lolliTwirler = 109;
      ctx.MOB_HI.gumdrop = 'sugGumdropHi';       ctx.MOB_DISPLAY.gumdrop = 92;
      ctx.MOB_HI.gumdropMini = 'sugGumdropMiniHi'; ctx.MOB_DISPLAY.gumdropMini = 63;
      ctx.MOB_HI.cottonDrift = 'sugCottonHi';    ctx.MOB_DISPLAY.cottonDrift = 105;
      ctx.MOB_HI.mintGuardian = 'sugMintHi';     ctx.MOB_DISPLAY.mintGuardian = 109;
      ctx.MOB_HI.mallowBrute = 'sugMallowHi';    ctx.MOB_DISPLAY.mallowBrute = 126;
      ctx.MOB_HI.mallowMini = 'sugMallowMiniHi'; ctx.MOB_DISPLAY.mallowMini = 88;
      ctx.MOB_HI.cupcakeMimic = 'sugMimicHi';    ctx.MOB_DISPLAY.cupcakeMimic = 101;
      ctx.MOB_HI.candyCorn = 'sugCornHi';        ctx.MOB_DISPLAY.candyCorn = 80;
      // ---- boss: SUGAR BEAR (P1 + P2 disheveled, 160px canvas) ----
      ctx.spr('sugBearHi', 160, 160, drawBear);
      ctx.spr('sugBearP2Hi', 160, 160, drawBearP2);
      ctx.BOSS_HI.sugarBear = { key: 'sugBearHi', size: 160, display: 120, bodyW: 48, bodyH: 62 };
      // ---- map mechanic sprites ----
      ctx.spr('sugCandy', 48, 48, drawCandy);
      ctx.spr('sugFence0', 64, 64, function (put, S) { fenceState(put, S, 0); });
      ctx.spr('sugFence1', 64, 64, function (put, S) { fenceState(put, S, 1); });
      ctx.spr('sugFence2', 64, 64, function (put, S) { fenceState(put, S, 2); });
      ctx.spr('sugShard', 32, 32, drawShard);
      // ---- decor (20) ----
      ctx.spr('sugdCottonTree', 64, 64, drawCottonTree);
      ctx.spr('sugdGumdropTree', 64, 64, drawGumdropTree);
      ctx.spr('sugdGingerHouse', 64, 64, drawGingerHouse);
      ctx.spr('sugdFence', 64, 64, drawFence);
      ctx.spr('sugdMushroom', 64, 64, drawMushroom);
      ctx.spr('sugdLolliGrove', 64, 64, drawLolliGrove);
      ctx.spr('sugdPeak', 64, 64, drawPeak);
      ctx.spr('sugdMallows', 64, 64, drawMallows);
      ctx.spr('sugdFlowers', 64, 64, drawFlowers);
      ctx.spr('sugdBridge', 64, 64, drawBridge);
      ctx.spr('sugdGeyser', 64, 64, drawGeyser);
      ctx.spr('sugdCubes', 64, 64, drawCubes);
      ctx.spr('sugdDonut', 64, 64, drawDonut);
      ctx.spr('sugdWafers', 64, 64, drawWafers);
      ctx.spr('sugdJelly', 64, 64, drawJelly);
      ctx.spr('sugdSign', 64, 64, drawSign);
      ctx.spr('sugdScoop', 64, 64, drawScoop);
      ctx.spr('sugdWheel', 64, 64, drawWheel);
      ctx.spr('sugdTaffy', 64, 64, drawTaffyPost);
      ctx.spr('sugdCupcakeHouse', 64, 64, drawCupcakeHouse);
      // ---- tiles (5 ground + the river strip) ----
      ctx.tex('sugSprinkle', 48, 48, tSprinkle);
      ctx.tex('sugPath', 48, 48, tPath);
      ctx.tex('sugCookie', 48, 48, tCookie);
      ctx.tex('sugIcing', 48, 48, tIcing);
      ctx.tex('sugGummy', 48, 48, tGummy);
      ctx.tex('sugRiver', 48, 48, tRiver);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SUGAR_ART;
  root.SUGAR_ART = SUGAR_ART;
})(typeof window !== 'undefined' ? window : this);
