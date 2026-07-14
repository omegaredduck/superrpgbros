// ============================================================================
// world_art.js — resolution-aware procedural pixel art for the HI-FI WORLD test
// (train yard): faithful higher-fidelity redraws of the four mobs + the boss,
// plus train-yard tiles (gravel, wall), rail track, tunnel mouth, and a
// locomotive. Same pure pixel-plotting contract as ranger_art.js; reuses its
// drawing primitives (ellipseFill / rowSpan / stroke / mix). Runs in Node
// (preview) and the browser (Phaser canvas) unchanged.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('./ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke;

  var P = {
    OUT: '#1a1c2c',
    // slime greens
    sLt: '#8ff0a5', s1: '#4fd07a', s2: '#2e9e57', s3: '#1f6e3f',
    // brute reds
    bLt: '#e06b7f', b1: '#b13e53', b2: '#7a1f38', b3: '#511325',
    // spitter / warlock purples
    pLt: '#c078e0', p1: '#8f3fb5', p2: '#5d275d', p3: '#38163a',
    wLt: '#a05fc0', w1: '#6a2f80', w2: '#3d1a4a',
    // shared
    eye: '#12131f', gleam: '#eaf7ff', tooth: '#f4f4f4', skin: '#e8b796',
    glow: '#9be3ff', cyan: '#6ff0e0', bone: '#e8e0c8',
    // wood / bark
    wood: '#7a4a2b', woodDk: '#4d2f1c', bark: '#5b4636', barkDk: '#3a2c22', barkLt: '#7d6450',
    moss: '#3f7a3c', mossLt: '#63b25a',
    // metals / yard
    steel: '#9aa7b8', steelLt: '#cdd6e2', steelDk: '#5a6678', iron: '#3b414f', ironDk: '#23272f',
    rust: '#8a4b2a', rustLt: '#b76b3a',
    gravel1: '#4a4d55', gravel2: '#3a3d44', gravel3: '#5a5e68', gravelStone: '#787c86',
    brass: '#d7a13a', brassLt: '#f0c96a', ember: '#ff7d3a', emberLt: '#ffd34d',
    concrete: '#6b7079', concreteDk: '#3f434b', black: '#0c0d12'
  };

  // ------------------------------------------------------------ MOBS --------
  // SLIME — a glossy green gel dome with big eyes (faithful to the 16px slime).
  function drawSlime(put, S) {
    var cx = S * 0.5, topY = S * 0.30, by = S * 0.9, w = S * 0.42;
    for (var y = Math.round(topY); y < Math.round(by); y++) {
      var t = (y - topY) / (by - topY);
      var hw = w * Math.pow(Math.sin(clamp(0.18 + t * 0.9, 0, 1) * Math.PI * 0.5), 0.62);
      // wobbly base
      if (t > 0.9) hw *= 1 + 0.06 * Math.sin(y * 1.7);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.s1, P.s2, clamp(t * 1.15, 0, 1));
        b = mix(b, P.s3, clamp((t - 0.55) * 1.3, 0, 1));
        if (tx < 0.22) b = mix(b, P.sLt, 0.45);
        if (tx > 0.85) b = mix(b, P.s3, 0.5);
        return b;
      });
    }
    ell(put, cx - S * 0.13, topY + S * 0.13, S * 0.1, S * 0.055, function () { return P.sLt; }); // gloss
    // eyes
    var ey = topY + S * 0.26, ex = S * 0.13, er = S * 0.075;
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * ex, ey, er, er * 1.15, function () { return P.eye; });
      put(Math.round(cx + sgn * ex - er * 0.4), Math.round(ey - er * 0.4), P.gleam);
      put(Math.round(cx + sgn * ex - er * 0.4) + 1, Math.round(ey - er * 0.4), P.gleam);
    });
    // little smile
    var my = ey + S * 0.16;
    for (var i = -2; i <= 2; i++) put(Math.round(cx + i * (S * 0.03)), Math.round(my + Math.abs(i) * 0.6), P.s3);
  }

  // BRUTE — a hulking red bruiser: massive rounded shoulders, sunken head,
  // heavy brow, white eyes, tusks, huge fists, stubby legs.
  function drawBrute(put, S) {
    var cx = S * 0.5;
    // stubby legs
    [-1, 1].forEach(function (sgn) {
      for (var y = Math.round(S * 0.8); y < Math.round(S * 0.95); y++)
        row(put, y, cx + sgn * S * 0.13 - S * 0.08, cx + sgn * S * 0.13 + S * 0.08, function (tx) { return mix(P.b2, P.b3, 0.3 + tx * 0.4); });
    });
    // hulking torso: widest at the shoulders (top), tapering to the waist, with
    // a rounded bottom — a curved silhouette, not a box.
    var topY = S * 0.24, botY = S * 0.84;
    for (var y = Math.round(topY); y < Math.round(botY); y++) {
      var t = (y - topY) / (botY - topY);
      // shoulder bulge near t~0.18, gentle taper after
      var hw = S * (0.2 + 0.19 * Math.sin(clamp(0.12 + t * 0.86, 0, 1) * Math.PI));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.b1, P.b2, clamp(t * 1.05, 0, 1));
        b = mix(b, P.b3, clamp((t - 0.6) * 1.2, 0, 1));
        if (tx < 0.16) b = mix(b, P.bLt, 0.45);
        if (tx > 0.86) b = mix(b, P.b3, 0.5);
        return b;
      });
    }
    // arms from the shoulders to big fists
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.34, S * 0.34, cx + sgn * S * 0.42, S * 0.62, S * 0.12, function () { return mix(P.b2, P.b1, 0.4); });
      ell(put, cx + sgn * S * 0.44, S * 0.68, S * 0.11, S * 0.11, function (tx, ty) { return mix(P.b1, P.b3, 0.2 + ty * 0.5); });
      // knuckle line
      put(Math.round(cx + sgn * S * 0.44), Math.round(S * 0.66), P.b3);
    });
    // sunken head: a darker recess between the shoulders, heavy brow, eyes, tusks
    var hy = S * 0.32;
    ell(put, cx, hy + S * 0.02, S * 0.19, S * 0.13, function (tx, ty) { return mix(P.b2, P.b3, 0.3 + ty * 0.5); }); // head mass
    row(put, Math.round(hy - S * 0.04), cx - S * 0.15, cx + S * 0.15, function () { return P.b3; });                 // brow
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.08, hy + S * 0.01, S * 0.045, S * 0.038, function () { return P.tooth; });
      put(Math.round(cx + sgn * S * 0.08), Math.round(hy + S * 0.01), P.eye);
    });
    // tusks jutting up from the jaw
    [-1, 1].forEach(function (sgn) { var tx0 = Math.round(cx + sgn * S * 0.06), ty0 = Math.round(hy + S * 0.1); put(tx0, ty0, P.tooth); put(tx0, ty0 - 1, P.tooth); put(tx0 + sgn, ty0 - 2, P.bone); });
  }

  // SPITTER — squat purple sac with a big toothy maw (it shoots).
  function drawSpitter(put, S) {
    var cx = S * 0.5, topY = S * 0.28, by = S * 0.9, w = S * 0.44;
    for (var y = Math.round(topY); y < Math.round(by); y++) {
      var t = (y - topY) / (by - topY);
      var hw = w * Math.pow(Math.sin(clamp(0.2 + t * 0.85, 0, 1) * Math.PI * 0.5), 0.55);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.p1, P.p2, clamp(t * 1.1, 0, 1));
        if (tx < 0.2) b = mix(b, P.pLt, 0.4);
        if (tx > 0.85) b = mix(b, P.p3, 0.5);
        return b;
      });
    }
    // eyes (upper)
    var ey = topY + S * 0.16, ex = S * 0.14;
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * ex, ey, S * 0.05, S * 0.06, function () { return P.emberLt; }); put(Math.round(cx + sgn * ex), Math.round(ey), P.eye); });
    // big maw
    var my = topY + S * 0.42, mw = S * 0.26, mh = S * 0.16;
    ell(put, cx, my, mw, mh, function (tx, ty) { return mix('#2a0f2e', P.black, ty * 0.5); });
    // teeth ring
    for (var a = 0; a < 10; a++) {
      var ang = Math.PI + (a / 9) * Math.PI; // lower arc
      put(Math.round(cx + Math.cos(ang) * mw * 0.86), Math.round(my + Math.sin(-ang) * mh * 0.7 + mh * 0.1), P.tooth);
    }
    for (var a2 = 0; a2 < 6; a2++) put(Math.round(cx - mw * 0.7 + a2 * (mw * 1.4 / 5)), Math.round(my - mh * 0.7), P.tooth);
  }

  // WARLOCK — a dark-purple hooded caster with glowing cyan eyes + an orb hand.
  function drawWarlock(put, S) {
    var cx = S * 0.5;
    // long robe (trapezoid to the floor)
    for (var y = Math.round(S * 0.34); y < Math.round(S * 0.94); y++) {
      var t = (y - S * 0.34) / (S * 0.6);
      var hw = R.lerp(S * 0.16, S * 0.3, t);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.w1, P.w2, clamp(t * 1.2, 0, 1));
        if (tx < 0.16) b = mix(b, P.wLt, 0.4);
        if (tx > 0.86) b = mix(b, P.w2, 0.6);
        if (Math.abs(tx - 0.5) < 0.05) b = mix(b, P.w2, 0.5); // center seam
        return b;
      });
    }
    // hood (pointed)
    for (var hy = Math.round(S * 0.14); hy < Math.round(S * 0.4); hy++) {
      var ht = (hy - S * 0.14) / (S * 0.26);
      var hw2 = R.lerp(S * 0.05, S * 0.2, Math.sin(clamp(ht, 0, 1) * Math.PI * 0.5));
      row(put, hy, cx - hw2, cx + hw2, function (tx) {
        var b = mix(P.w1, P.w2, clamp(ht * 1.3, 0, 1));
        if (tx < 0.18) b = mix(b, P.wLt, 0.5);
        if (tx > 0.84) b = mix(b, P.w2, 0.6);
        return b;
      });
    }
    // dark face void + glowing eyes
    ell(put, cx, S * 0.31, S * 0.12, S * 0.08, function () { return P.black; });
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * S * 0.05, S * 0.31, S * 0.025, S * 0.03, function () { return P.cyan; }); });
    // sleeves + a conjured orb at one hand
    stroke(put, cx + S * 0.14, S * 0.44, cx + S * 0.26, S * 0.6, S * 0.08, function () { return P.w2; });
    ell(put, cx + S * 0.3, S * 0.62, S * 0.07, S * 0.07, function (tx, ty) { return mix(P.glow, '#3b5dc9', ty); });
    ell(put, cx + S * 0.3, S * 0.62, S * 0.03, S * 0.03, function () { return P.tooth; });
  }

  // BOSS — The Grovekeeper: a hulking treant. Bark trunk, glowing eyes, branch
  // arms, mossy brow, root feet. Drawn on a bigger canvas.
  function drawBoss(put, S) {
    var cx = S * 0.5;
    // roots / feet
    [-1, 0, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.16, S * 0.82, cx + sgn * S * 0.24, S * 0.96, S * 0.07, function () { return mix(P.bark, P.barkDk, 0.4); });
    });
    // trunk body
    for (var y = Math.round(S * 0.34); y < Math.round(S * 0.86); y++) {
      var t = (y - S * 0.34) / (S * 0.52);
      var hw = R.lerp(S * 0.28, S * 0.22, t);
      row(put, y, cx - hw, cx + hw, function (tx, xx) {
        var b = mix(P.bark, P.barkDk, clamp(t * 0.9, 0, 1));
        if (tx < 0.18) b = mix(b, P.barkLt, 0.5);
        if (tx > 0.84) b = mix(b, P.barkDk, 0.5);
        // vertical bark grooves
        var g = Math.abs(((xx * 0.7) % 6) - 3);
        if (g < 0.7) b = mix(b, P.barkDk, 0.5);
        return b;
      });
    }
    // branch arms
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.24, S * 0.44, cx + sgn * S * 0.44, S * 0.34, S * 0.06, function () { return P.bark; });
      stroke(put, cx + sgn * S * 0.4, S * 0.36, cx + sgn * S * 0.48, S * 0.22, S * 0.04, function () { return P.barkDk; });
    });
    // leafy canopy — a mound of clustered foliage lumps crowning the trunk
    // (replaces the old flat "bowl"), lit top-left.
    var lumps = [[-0.2, 0.2, 0.16], [0.18, 0.2, 0.16], [0, 0.13, 0.19], [-0.32, 0.28, 0.12], [0.32, 0.28, 0.12], [0, 0.28, 0.2]];
    lumps.forEach(function (L) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[2] * 0.85, function (tx, ty) {
        var b = mix(P.mossLt, P.moss, clamp(ty * 1.1, 0, 1));
        b = mix(b, P.barkDk, clamp((ty - 0.7) * 1.5, 0, 1));
        if (tx < 0.3 && ty < 0.4) b = mix(b, '#8fe07a', 0.4);   // top-left highlight
        return b;
      });
    });
    // glowing eyes + maw
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * S * 0.1, S * 0.46, S * 0.04, S * 0.05, function () { return P.emberLt; }); put(Math.round(cx + sgn * S * 0.1), Math.round(S * 0.46), P.ember); });
    for (var mx = -3; mx <= 3; mx++) put(Math.round(cx + mx * S * 0.03), Math.round(S * 0.6 + Math.abs(mx) * 0.5), P.black);
  }

  // ------------------------------------------------------- YARD TILES -------
  // deterministic pseudo-noise so tiles are seamless + repeatable (no RNG).
  function hash(x, y) { var h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

  function drawGravel(put, W, H) {
    // fine per-pixel ballast — tiles invisibly (noise discontinuities read as
    // more gravel, not a seam). A few subtle specks; NO big clumps (they made
    // the tiling obvious). Oil stains are added in-scene, not baked per-tile.
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x, y), n2 = hash(x * 5 + 1, y * 5 + 1);
      var b = n < 0.42 ? P.gravel2 : (n < 0.8 ? P.gravel1 : P.gravel3);
      if (n2 > 0.95) b = P.gravelStone;          // tiny bright fleck
      else if (n2 < 0.05) b = P.ironDk;          // tiny dark fleck
      put(x, y, b);
    }
  }

  function drawYardWall(put, W, H) {
    // concrete barrier with a rusty steel cap + rivets
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x * 2, y * 2);
      var b = mix(P.concrete, P.concreteDk, 0.3 + n * 0.4);
      if (y < 3) b = mix(P.iron, P.ironDk, 0.4);         // steel cap
      if (y >= 3 && y < 5) b = P.rust;
      put(x, y, b);
    }
    for (var rx = 4; rx < W; rx += 8) { put(rx, 1, P.steelLt); put(rx, H - 3, P.rustLt); }
    // seams
    for (var sy = 8; sy < H; sy += 12) for (var x2 = 0; x2 < W; x2++) put(x2, sy, P.concreteDk);
  }

  // TRACK — a horizontal segment tileable in X: gravel ballast, two steel rails,
  // wooden ties. Height H is the full track band.
  function drawTrack(put, W, H) {
    // ballast
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x + 100, y + 50);
      put(x, y, n < 0.5 ? P.gravel2 : (n < 0.85 ? P.gravel1 : P.gravel3));
    }
    // ties (sleepers) — one per tile so they space evenly when tiled in X
    var tieW = Math.max(3, Math.round(H * 0.14)), gap = W;
    for (var tx = 0; tx < W; tx += gap) {
      for (var yy = Math.round(H * 0.12); yy < Math.round(H * 0.88); yy++)
        for (var xx = 0; xx < tieW; xx++) put((tx + xx) % W, yy, mix(P.wood, P.woodDk, 0.3 + ((yy % 2)) * 0.3));
    }
    // two rails
    [0.3, 0.7].forEach(function (fr) {
      var ry = Math.round(H * fr);
      for (var x = 0; x < W; x++) {
        put(x, ry - 1, P.steelLt); put(x, ry, P.steel); put(x, ry + 1, P.steelDk);
      }
    });
  }

  // TUNNEL MOUTH — a front-facing arched stone portal the train bursts from.
  // A concrete surround with a black arch opening (semicircle top + straight
  // sides), rim highlight, a keystone, and hazard stripes on the lintel.
  function drawTunnel(put, W, H) {
    var cx = W * 0.5, floorY = H * 0.9, archTop = H * 0.28, rx = W * 0.34;
    var springY = H * 0.55;                 // where the arch springs from vertical sides
    // concrete surround
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x * 3, y * 3);
      put(x, y, mix(P.concrete, P.concreteDk, 0.3 + n * 0.45));
    }
    // black opening: vertical sides below springline + semicircle above
    for (var y2 = 0; y2 < H; y2++) {
      var halfW;
      if (y2 >= floorY) continue;
      if (y2 >= springY) halfW = rx;                          // straight walls
      else {                                                  // arch
        var dy = (springY - y2) / (springY - archTop);
        if (dy > 1) continue;
        halfW = rx * Math.sqrt(clamp(1 - dy * dy, 0, 1));
      }
      for (var x2 = Math.round(cx - halfW); x2 < Math.round(cx + halfW); x2++) {
        var edge = 1 - Math.abs(x2 - cx) / (halfW || 1);
        put(x2, y2, mix('#141824', P.black, clamp(edge * 1.2, 0, 1))); // darker toward center
      }
    }
    // stone rim around the opening
    for (var a = 0; a <= Math.PI; a += 0.02) {                 // arch rim
      var xr = Math.round(cx - rx * Math.cos(a)), yr = Math.round(springY - (springY - archTop) * Math.sin(a));
      put(xr, yr, P.steelLt); put(xr, yr - 1, P.steelDk);
    }
    for (var yy = Math.round(springY); yy < Math.round(floorY); yy++) { put(Math.round(cx - rx), yy, P.steelLt); put(Math.round(cx + rx), yy, P.steelLt); }
    // keystone
    for (var ky = Math.round(archTop - H * 0.05); ky < Math.round(archTop + H * 0.06); ky++)
      row(put, ky, cx - W * 0.05, cx + W * 0.05, function () { return mix(P.steel, P.steelDk, 0.4); });
    // hazard stripes on the lintel top
    for (var hx = 0; hx < W; hx++) put(hx, 2, Math.floor(hx / 5) % 2 === 0 ? P.brassLt : P.ironDk);
    for (var hx2 = 0; hx2 < W; hx2++) put(hx2, 3, Math.floor(hx2 / 5) % 2 === 0 ? P.brass : P.ironDk);
  }

  // LOCOMOTIVE — side view facing RIGHT. Boiler, cab, stack, headlight,
  // cowcatcher, wheels. W wide, H tall.
  function drawLoco(put, W, H) {
    var baseY = H * 0.78;
    // main body / boiler
    for (var y = Math.round(H * 0.28); y < Math.round(baseY); y++) {
      var t = (y - H * 0.28) / (baseY - H * 0.28);
      row(put, Math.round(y), W * 0.08, W * 0.86, function (tx) {
        var b = mix(P.iron, P.ironDk, 0.2 + t * 0.6);
        if (tx < 0.5 && y < H * 0.4) b = mix(b, P.steelLt, 0.25 * (1 - tx * 2)); // top sheen
        return b;
      });
    }
    // boiler bands
    for (var bx = W * 0.14; bx < W * 0.7; bx += W * 0.12) for (var yy = Math.round(H * 0.3); yy < Math.round(baseY); yy++) put(Math.round(bx), yy, P.ironDk);
    // cab (rear, taller) with a window
    for (var y2 = Math.round(H * 0.16); y2 < Math.round(baseY); y2++)
      row(put, y2, W * 0.64, W * 0.86, function (tx) { return mix(P.b2, P.b3, 0.3 + tx * 0.4); }); // red cab
    for (var wy = Math.round(H * 0.24); wy < Math.round(H * 0.42); wy++)
      row(put, wy, W * 0.69, W * 0.8, function () { return P.glow; }); // window
    // smokestack + dome
    for (var sy = Math.round(H * 0.04); sy < Math.round(H * 0.3); sy++) row(put, sy, W * 0.16, W * 0.24, function () { return P.ironDk; });
    ell(put, W * 0.2, H * 0.06, W * 0.06, H * 0.04, function () { return P.iron; });
    ell(put, W * 0.34, H * 0.24, W * 0.04, H * 0.05, function () { return P.brass; }); // steam dome
    // headlight (front, glowing) + cowcatcher
    ell(put, W * 0.86, H * 0.42, W * 0.05, H * 0.09, function (tx, ty) { return mix(P.emberLt, P.ember, ty); });
    for (var cyy = Math.round(H * 0.5); cyy < Math.round(baseY); cyy++) {
      var fw = (cyy - H * 0.5) / (baseY - H * 0.5);
      row(put, cyy, W * 0.86, W * 0.86 + W * 0.1 * (1 - fw) + 2, function () { return P.steelDk; }); // cowcatcher wedge
    }
    // running board + red stripe
    for (var lx = 0; lx < W; lx++) { put(lx, Math.round(baseY), P.brass); put(lx, Math.round(baseY) - 1, P.b1); }
    // wheels
    [0.22, 0.4, 0.58, 0.74].forEach(function (fr) {
      var wx = W * fr, wr = H * 0.13;
      ell(put, wx, baseY + wr * 0.5, wr, wr, function (tx, ty) { return mix(P.iron, P.ironDk, 0.3 + ty * 0.5); });
      ell(put, wx, baseY + wr * 0.5, wr * 0.4, wr * 0.4, function () { return P.steelDk; });
      put(Math.round(wx), Math.round(baseY + wr * 0.5), P.brassLt);
    });
  }

  var API = {
    P: P,
    drawSlime: drawSlime, drawBrute: drawBrute, drawSpitter: drawSpitter, drawWarlock: drawWarlock, drawBoss: drawBoss,
    drawGravel: drawGravel, drawYardWall: drawYardWall, drawTrack: drawTrack, drawTunnel: drawTunnel, drawLoco: drawLoco
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.WORLD_ART = API;
})(typeof window !== 'undefined' ? window : this);
