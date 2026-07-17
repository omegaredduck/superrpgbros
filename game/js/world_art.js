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

  // ------------------------------------ TRAIN-YARD MOB ROSTER (M4.7) --------
  // The user's sheet (2026-07-14): 8 yard-flavored mobs replace the grasslands
  // four IN THIS BIOME (old mobs keep their data for the future grasslands
  // map). Same 48px canvas + front-facing style as the originals.
  var Y = {
    coal: '#232630', coalLt: '#3a3f4d', coalDk: '#15171f',
    glowO: '#ff9a3d', glowOLt: '#ffd34d',
    boxR: '#8a3b2e', boxRLt: '#a85643', boxRDk: '#5e2117',
    zomb: '#4fd07a', zombDk: '#2e9e57', navy: '#2b3a67', navyLt: '#41528a', navyDk: '#1d2947',
    sigRed: '#ff2a2a', pole: '#9aa7b8', poleDk: '#5a6678',
    imp: '#b13e53', impLt: '#e06b7f', impDk: '#7a1f38',
    chomp: '#7c8494', chompLt: '#a4adc0', chompDk: '#4c5262',
    mole: '#6a707c', moleLt: '#8b93a2', moleDk: '#454a56',
    hat: '#ffd23e', hatDk: '#c89a1e', dyn: '#c8332a', dynDk: '#8a1f1a',
    dirt: '#5b4636', dirtLt: '#7d6450',
    smoke: '#6a707c', smokeLt: '#9aa2b2', smokeDk: '#3f434e',
    redEye: '#ff3b30'
  };

  // 1 · COAL GOLEM — a lumpy mass of coal, orange fire glowing in the cracks.
  function drawCoalGolem(put, S) {
    var cx = S * 0.5;
    var lumps = [[0, 0.62, 0.34, 0.3], [-0.22, 0.42, 0.2, 0.18], [0.22, 0.42, 0.2, 0.18],
                 [0, 0.32, 0.22, 0.18], [-0.3, 0.66, 0.16, 0.16], [0.3, 0.66, 0.16, 0.16]];
    lumps.forEach(function (L) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], function (tx, ty) {
        var b = mix(Y.coalLt, Y.coal, clamp(ty * 1.2, 0, 1));
        if (tx > 0.75) b = mix(b, Y.coalDk, 0.5);
        return b;
      });
    });
    // glowing fissures
    stroke(put, cx - S * 0.12, S * 0.52, cx - S * 0.02, S * 0.62, 1.4, function () { return Y.glowO; });
    stroke(put, cx + S * 0.08, S * 0.56, cx + S * 0.18, S * 0.68, 1.4, function () { return Y.glowO; });
    stroke(put, cx - S * 0.04, S * 0.7, cx + S * 0.06, S * 0.78, 1.2, function () { return mix(Y.glowO, Y.coal, 0.3); });
    // burning eyes
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.11, S * 0.4, S * 0.05, S * 0.04, function () { return Y.glowO; });
      put(Math.round(cx + sgn * S * 0.11), Math.round(S * 0.4), Y.glowOLt);
    });
  }

  // 4 · BOXCAR BRUTE — a boxcar COME ALIVE: a tall ribbed box on iron feet,
  // its sliding door hanging open as a huge tooth-lined maw (user sheet #4).
  function drawBoxcarBrute(put, S) {
    var x0 = S * 0.18, x1 = S * 0.82, y0 = S * 0.14, y1 = S * 0.8;
    // roof lip
    row(put, Math.round(y0) - 2, x0 - 1, x1 + 1, function () { return Y.boxRDk; });
    row(put, Math.round(y0) - 1, x0 - 1, x1 + 1, function () { return Y.boxRLt; });
    // tall box body
    for (var y = Math.round(y0); y < Math.round(y1); y++) {
      var t = (y - y0) / (y1 - y0);
      row(put, y, x0, x1, function (tx, xx) {
        var b = mix(Y.boxR, Y.boxRDk, clamp(t * 0.8, 0, 1));
        if (tx < 0.12) b = mix(b, Y.boxRLt, 0.5);
        if (xx % 5 === 0) b = mix(b, Y.boxRDk, 0.4);       // plank ribs
        return b;
      });
    }
    // iron feet
    [-1, 1].forEach(function (sgn) {
      var fx = S * 0.5 + sgn * S * 0.17;
      for (var fy = Math.round(y1); fy < Math.round(S * 0.93); fy++)
        row(put, fy, fx - S * 0.075, fx + S * 0.075, function (tx) { return mix(P.iron, P.ironDk, 0.3 + tx * 0.4); });
    });
    // angry eyes under heavy plank brows
    [-1, 1].forEach(function (sgn) {
      row(put, Math.round(S * 0.24), S * 0.5 + sgn * S * 0.08 - S * 0.07, S * 0.5 + sgn * S * 0.08 + S * 0.07, function () { return Y.boxRDk; });
      ell(put, S * 0.5 + sgn * S * 0.13, S * 0.31, S * 0.055, S * 0.05, function () { return P.tooth; });
      put(Math.round(S * 0.5 + sgn * S * 0.13), Math.round(S * 0.31), P.eye);
    });
    // the DOOR MAW — the bottom HALF of the box gapes open, ringed in teeth
    var my0 = S * 0.44, my1 = S * 0.76;
    row(put, Math.round(my0) - 1, S * 0.22, S * 0.78, function () { return P.ironDk; });   // door track
    for (var yy = Math.round(my0); yy < Math.round(my1); yy++) {
      var mt = (yy - my0) / (my1 - my0);
      row(put, yy, S * 0.24, S * 0.76, function (tx) { return mix('#200e0e', P.black, clamp(mt + tx * 0.2, 0, 1)); });
    }
    for (var ti = 0; ti < 5; ti++) {
      var txp = Math.round(S * 0.26 + ti * S * 0.11);
      // upper fangs (2px wide, 3 deep)
      for (var fy2 = 0; fy2 < 3 - (ti % 2); fy2++) { put(txp, Math.round(my0) + fy2, P.tooth); put(txp + 1, Math.round(my0) + fy2, P.tooth); }
      // lower fangs offset half a step
      var bxp = Math.round(S * 0.31 + ti * S * 0.11);
      for (var fy3 = 0; fy3 < 2 + (ti % 2); fy3++) { put(bxp, Math.round(my1) - 1 - fy3, P.tooth); put(bxp + 1, Math.round(my1) - 1 - fy3, P.tooth); }
    }
  }

  // 7 · CONDUCTOR ZOMBIE — the old crew never clocked out. Green face, navy
  // cap + coat, one milky eye, a little gold watch swinging from a hand.
  // M4.9 (user): drawn BIGGER + THICKER than the base yard mobs — reads like an
  // elite (wider coat, broader shoulders, chunkier head + cap). Paired with a
  // larger on-screen size (textures.js MOB_DISPLAY.conductorZombie).
  function drawConductorZombie(put, S) {
    var cx = S * 0.5;
    // coat — broad shoulders at the top, tapering to a heavy hem
    for (var y = Math.round(S * 0.46); y < Math.round(S * 0.92); y++) {
      var t = (y - S * 0.46) / (S * 0.46);
      var hw = R.lerp(S * 0.27, S * 0.33, Math.sin(clamp(0.15 + t * 0.85, 0, 1) * Math.PI * 0.9));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(Y.navy, Y.navyDk, clamp(t, 0, 1));
        if (tx < 0.15) b = mix(b, Y.navyLt, 0.5);
        if (tx > 0.86) b = mix(b, Y.navyDk, 0.4);
        return b;
      });
    }
    // gold buttons (double-breasted, wider set)
    for (var i = 0; i < 3; i++) [-1, 1].forEach(function (sgn) {
      put(Math.round(cx + sgn * S * 0.06), Math.round(S * (0.55 + i * 0.11)), '#f0c96a');
    });
    // zombie head — chunkier
    ell(put, cx, S * 0.34, S * 0.185, S * 0.17, function (tx, ty) {
      var b = mix(Y.zomb, Y.zombDk, clamp(ty * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, Y.zombDk, 0.5);
      return b;
    });
    // eyes: one dead-white, one X-scar
    ell(put, cx - S * 0.07, S * 0.33, S * 0.038, S * 0.038, function () { return P.tooth; });
    put(Math.round(cx - S * 0.07), Math.round(S * 0.33), P.eye);
    stroke(put, cx + S * 0.03, S * 0.30, cx + S * 0.10, S * 0.37, 1, function () { return Y.zombDk; });
    stroke(put, cx + S * 0.10, S * 0.30, cx + S * 0.03, S * 0.37, 1, function () { return Y.zombDk; });
    // crooked mouth + stitch
    for (var mx = -3; mx <= 3; mx++) put(Math.round(cx + mx * 2), Math.round(S * 0.42 + (mx % 2)), Y.zombDk);
    // conductor cap — broader to crown the bigger head
    for (var cy = Math.round(S * 0.17); cy < Math.round(S * 0.26); cy++)
      row(put, cy, cx - S * 0.19, cx + S * 0.19, function (tx) { return mix(Y.navyLt, Y.navy, tx); });
    row(put, Math.round(S * 0.25), cx - S * 0.19, cx + S * 0.19, function () { return '#d7a13a'; });
    ell(put, cx, S * 0.275, S * 0.2, S * 0.024, function () { return P.black; });   // visor
    // arm + the little watch
    stroke(put, cx + S * 0.22, S * 0.54, cx + S * 0.34, S * 0.64, S * 0.05, function () { return Y.navyDk; });
    put(Math.round(cx + S * 0.35), Math.round(S * 0.68), '#f0c96a');
    ell(put, cx + S * 0.35, S * 0.73, S * 0.05, S * 0.05, function (tx, ty) { return mix('#f0c96a', '#d7a13a', ty); });
    put(Math.round(cx + S * 0.35), Math.round(S * 0.73), P.tooth);
  }

  // 11 · CROSSING CREEP — a possessed crossbuck: striped pole, X arms, two
  // red signal lights for eyes (they're what shoots).
  function drawCrossingCreep(put, S) {
    var cx = S * 0.5;
    // striped pole body
    for (var y = Math.round(S * 0.34); y < Math.round(S * 0.9); y++) {
      var hw = S * 0.06 + (y > S * 0.82 ? S * 0.05 : 0);   // flared base
      row(put, y, cx - hw, cx + hw, function (tx, xx) {
        var stripe = Math.floor((y) / 5) % 2 === 0;
        var b = stripe ? P.tooth : Y.sigRed;
        return mix(b, P.black, tx > 0.7 ? 0.25 : 0);
      });
    }
    // crossbuck X arms
    stroke(put, cx - S * 0.3, S * 0.14, cx + S * 0.3, S * 0.3, S * 0.05, function (tx) { return mix(P.tooth, '#cfd4dc', tx); });
    stroke(put, cx - S * 0.3, S * 0.3, cx + S * 0.3, S * 0.14, S * 0.05, function (tx) { return mix(P.tooth, '#cfd4dc', tx); });
    // signal-light EYES on a head bracket
    ell(put, cx, S * 0.36, S * 0.13, S * 0.06, function () { return Y.poleDk; });
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.11, S * 0.37, S * 0.06, S * 0.06, function (tx, ty) { return mix(Y.sigRed, '#7a0f0f', ty); });
      put(Math.round(cx + sgn * S * 0.11 - 1), Math.round(S * 0.36 - 1), '#ffb0a8');
    });
    // little grasping stub arms
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.07, S * 0.58, cx + sgn * S * 0.2, S * 0.52, S * 0.035, function () { return Y.poleDk; });
    });
  }

  // 13 · FURNACE IMP — a stoker demon: horns, furnace-grate belly glowing
  // from the inside, a little shovel over one shoulder.
  function drawFurnaceImp(put, S) {
    var cx = S * 0.5;
    // body
    for (var y = Math.round(S * 0.34); y < Math.round(S * 0.86); y++) {
      var t = (y - S * 0.34) / (S * 0.52);
      var hw = S * (0.14 + 0.12 * Math.sin(clamp(0.2 + t * 0.8, 0, 1) * Math.PI));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(Y.imp, Y.impDk, clamp(t, 0, 1));
        if (tx < 0.18) b = mix(b, Y.impLt, 0.45);
        return b;
      });
    }
    // furnace grate belly: dark hatch + glowing bars
    for (var gy = Math.round(S * 0.56); gy < Math.round(S * 0.78); gy++)
      row(put, gy, cx - S * 0.13, cx + S * 0.13, function () { return Y.impDk; });
    for (var bx = -2; bx <= 2; bx++) {
      for (var gy2 = Math.round(S * 0.58); gy2 < Math.round(S * 0.76); gy2++) {
        if (bx % 2 === 0) put(Math.round(cx + bx * S * 0.05), gy2, mix(Y.glowO, Y.glowOLt, ((gy2 % 4) / 4)));
      }
    }
    // head + horns + eyes + grin
    ell(put, cx, S * 0.28, S * 0.13, S * 0.11, function (tx, ty) { return mix(Y.impLt, Y.imp, clamp(ty * 1.2, 0, 1)); });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.1, S * 0.2, cx + sgn * S * 0.17, S * 0.08, S * 0.03, function () { return P.bone; });
      ell(put, cx + sgn * S * 0.05, S * 0.26, S * 0.03, S * 0.028, function () { return Y.glowOLt; });
      put(Math.round(cx + sgn * S * 0.05), Math.round(S * 0.26), P.eye);
    });
    for (var tm = -2; tm <= 2; tm++) put(Math.round(cx + tm * 2), Math.round(S * 0.33), tm % 2 ? P.tooth : Y.impDk);
    // shovel over the shoulder
    stroke(put, cx + S * 0.14, S * 0.5, cx + S * 0.32, S * 0.16, S * 0.025, function () { return P.wood; });
    ell(put, cx + S * 0.33, S * 0.12, S * 0.05, S * 0.065, function (tx, ty) { return mix(P.steelLt, P.steelDk, ty); });
  }

  // 16 · COUPLING CHOMPER — a knuckle-coupler head on a chain, all teeth.
  function drawCouplingChomper(put, S) {
    var cx = S * 0.5, cy = S * 0.46;
    // chain tail (links trailing down-left)
    for (var li = 0; li < 3; li++) {
      var lx = cx - S * (0.26 + li * 0.09), ly = S * (0.66 + li * 0.09);
      for (var a = 0; a < Math.PI * 2; a += 0.5)
        put(Math.round(lx + Math.cos(a) * S * 0.035), Math.round(ly + Math.sin(a) * S * 0.045), li % 2 ? P.steel : P.steelDk);
    }
    // the head — a heavy steel ball
    ell(put, cx, cy, S * 0.3, S * 0.28, function (tx, ty) {
      var b = mix(Y.chomp, Y.chompDk, clamp(ty * 1.15, 0, 1));
      if (tx < 0.2 && ty < 0.35) b = mix(b, Y.chompLt, 0.55);
      return b;
    });
    // rivets
    [[-0.2, -0.16], [0.2, -0.16], [0, -0.24]].forEach(function (r2) {
      put(Math.round(cx + r2[0] * S), Math.round(cy + r2[1] * S), Y.chompLt);
    });
    // eyes — small, mean
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.1, cy - S * 0.1, S * 0.028, S * 0.028, function () { return P.tooth; });
      put(Math.round(cx + sgn * S * 0.1), Math.round(cy - S * 0.1), P.eye);
    });
    // the MAW — gaping dark mouth, two rows of jagged teeth
    ell(put, cx, cy + S * 0.08, S * 0.22, S * 0.14, function (tx, ty) { return mix('#14161f', P.black, ty * 0.5); });
    for (var ti = 0; ti < 6; ti++) {
      var txp = cx - S * 0.17 + ti * S * 0.068;
      put(Math.round(txp), Math.round(cy - S * 0.03), P.tooth); put(Math.round(txp), Math.round(cy - S * 0.02), P.tooth);
      put(Math.round(txp + 2), Math.round(cy + S * 0.18), P.tooth); put(Math.round(txp + 2), Math.round(cy + S * 0.17), P.tooth);
    }
    // coupler pin sticking up
    row(put, Math.round(cy - S * 0.3), cx - S * 0.03, cx + S * 0.03, function () { return P.steelDk; });
    row(put, Math.round(cy - S * 0.33), cx - S * 0.045, cx + S * 0.045, function () { return P.steel; });
  }

  // 19 · DYNAMITE MOLE — a hard-hatted saboteur half out of his dirt mound,
  // a red stick of dynamite strapped to his back, fuse sparking. (He detonates
  // on contact — the data flag `detonate`.)
  function drawDynamiteMole(put, S) {
    var cx = S * 0.5;
    // dirt mound
    for (var y = Math.round(S * 0.62); y < Math.round(S * 0.92); y++) {
      var t = (y - S * 0.62) / (S * 0.3);
      var hw = R.lerp(S * 0.2, S * 0.4, t);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(Y.dirtLt, Y.dirt, clamp(t + tx * 0.2, 0, 1));
        return b;
      });
    }
    // mole body rising out
    ell(put, cx, S * 0.5, S * 0.16, S * 0.2, function (tx, ty) {
      var b = mix(Y.moleLt, Y.mole, clamp(ty * 1.1, 0, 1));
      if (tx > 0.75) b = mix(b, Y.moleDk, 0.5);
      return b;
    });
    // snout + teeth + squint eyes
    ell(put, cx, S * 0.47, S * 0.07, S * 0.05, function () { return '#d8a0a8'; });
    put(Math.round(cx - 2), Math.round(S * 0.52), P.tooth); put(Math.round(cx + 2), Math.round(S * 0.52), P.tooth);
    [-1, 1].forEach(function (sgn) {
      row(put, Math.round(S * 0.41), cx + sgn * S * 0.07 - 1, cx + sgn * S * 0.07 + 1, function () { return P.eye; });
    });
    // digging claws on the mound rim
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.18, S * 0.62, S * 0.055, S * 0.04, function () { return '#d8a0a8'; });
      for (var c = -1; c <= 1; c++) put(Math.round(cx + sgn * S * 0.18 + c * 2), Math.round(S * 0.6), P.tooth);
    });
    // yellow hard hat
    ell(put, cx, S * 0.34, S * 0.13, S * 0.08, function (tx, ty) { return mix(Y.hat, Y.hatDk, clamp(ty * 1.4 - 0.3, 0, 1)); });
    row(put, Math.round(S * 0.38), cx - S * 0.15, cx + S * 0.15, function () { return Y.hatDk; });
    // dynamite on the back + sparking fuse
    for (var dy = Math.round(S * 0.36); dy < Math.round(S * 0.56); dy++)
      row(put, dy, cx + S * 0.17, cx + S * 0.23, function (tx) { return mix(Y.dyn, Y.dynDk, tx); });
    stroke(put, cx + S * 0.2, S * 0.35, cx + S * 0.24, S * 0.28, 1, function () { return P.bone; });
    put(Math.round(cx + S * 0.25), Math.round(S * 0.26), Y.glowOLt);
    put(Math.round(cx + S * 0.27), Math.round(S * 0.25), Y.glowO);
  }

  // 20 · SMOG SERPENT — stack smoke that learned to hate: a coiling column
  // of smog with burning red eyes.
  function drawSmogSerpent(put, S) {
    var cx = S * 0.5;
    // billowing base cloud
    [[-0.22, 0.82, 0.18, 0.1], [0.2, 0.84, 0.2, 0.11], [0, 0.86, 0.24, 0.12]].forEach(function (L) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], function (tx, ty) { return mix(Y.smoke, Y.smokeDk, ty); });
    });
    // serpentine column (S-curve of puffs, thinner as it rises)
    for (var i = 0; i <= 8; i++) {
      var t = i / 8;
      var px = cx + Math.sin(t * Math.PI * 1.6) * S * 0.14;
      var py = S * (0.78 - t * 0.5);
      var r2 = S * (0.16 - t * 0.06);
      ell(put, px, py, r2, r2 * 0.85, function (tx, ty) {
        var b = mix(Y.smokeLt, Y.smoke, clamp(ty + t * 0.3, 0, 1));
        if (tx > 0.7) b = mix(b, Y.smokeDk, 0.45);
        return b;
      });
    }
    // head puff + burning eyes + smoke wisps
    var hx = cx + Math.sin(Math.PI * 1.6) * S * 0.14, hy = S * 0.28;
    ell(put, hx, hy, S * 0.13, S * 0.11, function (tx, ty) { return mix(Y.smokeLt, Y.smoke, ty); });
    [-1, 1].forEach(function (sgn) {
      ell(put, hx + sgn * S * 0.05, hy - S * 0.01, S * 0.03, S * 0.024, function () { return Y.redEye; });
      put(Math.round(hx + sgn * S * 0.05), Math.round(hy - S * 0.01), '#ffd0a0');
    });
    // jagged smoke mouth
    for (var mi = -2; mi <= 2; mi++) put(Math.round(hx + mi * 2), Math.round(hy + S * 0.06 + Math.abs(mi % 2)), Y.smokeDk);
    // drifting wisps
    ell(put, hx + S * 0.16, hy - S * 0.1, S * 0.045, S * 0.03, function () { return mix(Y.smokeLt, Y.smoke, 0.4); });
    ell(put, hx - S * 0.18, hy + S * 0.04, S * 0.04, S * 0.026, function () { return mix(Y.smokeLt, Y.smoke, 0.5); });
  }

  // ------------------------------------------------- FREIGHT CARS (M4.7) ----
  // ONE model each + several recolors (user, 2026-07-14): a covered-hopper
  // GRAIN CAR (ref: GBRX covered hopper — long slab body, sloped bottom bays,
  // roof walkway, end ladders, reflector dashes) and a sliding-door BOXCAR
  // (ref: L&N boxcar — ribbed sides, big center door, end ladders). Palettes
  // are passed in so recolors are data, not new art. Shared bogie helper.
  function drawBogie(put, cx, yTop, H) {
    var wr = H * 0.085;
    // truck frame
    row(put, Math.round(yTop), cx - wr * 2.6, cx + wr * 2.6, function () { return P.ironDk; });
    row(put, Math.round(yTop) + 1, cx - wr * 2.4, cx + wr * 2.4, function () { return P.iron; });
    [-1.3, 1.3].forEach(function (o) {
      var wx = cx + o * wr;
      ell(put, wx, yTop + wr, wr, wr, function (tx, ty) { return mix(P.iron, P.ironDk, 0.3 + ty * 0.5); });
      ell(put, wx, yTop + wr, wr * 0.35, wr * 0.35, function () { return P.steelDk; });
      put(Math.round(wx), Math.round(yTop + wr), P.steelLt);
    });
  }

  // GRAIN CAR — pal: { body, bodyLt, bodyDk, mark } (mark = lettering shade)
  function drawGrainCar(put, W, H, pal) {
    pal = pal || { body: '#e6e9ee', bodyLt: '#f7f9fc', bodyDk: '#b9bfc9', mark: '#3b414f' };
    var topY = H * 0.14, botY = H * 0.6, sillY = H * 0.72;
    // roof walkway strip + rail dots
    row(put, Math.round(topY) - 3, W * 0.06, W * 0.94, function () { return mix(pal.bodyDk, P.ironDk, 0.35); });
    row(put, Math.round(topY) - 2, W * 0.05, W * 0.95, function () { return pal.bodyLt; });
    for (var rx = W * 0.1; rx < W * 0.9; rx += W * 0.08) put(Math.round(rx), Math.round(topY) - 4, P.ironDk);
    // main slab body
    for (var y = Math.round(topY); y < Math.round(botY); y++) {
      var t = (y - topY) / (botY - topY);
      row(put, y, W * 0.045, W * 0.955, function (tx, xx) {
        var b = mix(pal.body, pal.bodyDk, clamp(t * 0.75, 0, 1));
        if (t < 0.16) b = mix(b, pal.bodyLt, 0.55);
        // vertical panel seams
        var seam = xx % Math.round(W * 0.115);
        if (seam === 0 || seam === 1) b = mix(b, pal.bodyDk, 0.55);
        return b;
      });
    }
    // sloped hopper bays (3 trapezoids) under the slab
    var bays = 3, bw = (W * 0.82) / bays;
    for (var bi = 0; bi < bays; bi++) {
      var bx0 = W * 0.09 + bi * bw;
      for (var y2 = Math.round(botY); y2 < Math.round(sillY); y2++) {
        var bt = (y2 - botY) / (sillY - botY);
        var inset = bw * 0.32 * bt;
        row(put, y2, bx0 + inset, bx0 + bw - inset, function (tx) {
          var b = mix(pal.bodyDk, P.ironDk, 0.25 + bt * 0.45);
          if (tx < 0.15) b = mix(b, pal.body, 0.35);
          return b;
        });
      }
    }
    // underframe sill + yellow reflector dashes (ref photo)
    row(put, Math.round(sillY), W * 0.05, W * 0.95, function () { return P.ironDk; });
    for (var dx = W * 0.08; dx < W * 0.92; dx += W * 0.09)
      row(put, Math.round(sillY) - 2, dx, dx + W * 0.03, function () { return P.brassLt; });
    // end ladders
    [W * 0.055, W * 0.945].forEach(function (lx) {
      for (var ly = Math.round(topY) - 2; ly < Math.round(sillY); ly += 2) put(Math.round(lx), ly, P.ironDk);
      for (var ry2 = Math.round(topY) + 2; ry2 < Math.round(sillY) - 2; ry2 += 5)
        row(put, ry2, lx - 2, lx + 2, function () { return P.iron; });
    });
    // reporting marks: small stacked dashes left + BIG marks center-left
    for (var mrow = 0; mrow < 3; mrow++)
      row(put, Math.round(topY + H * 0.08 + mrow * 3), W * 0.12, W * 0.2, function () { return pal.mark; });
    row(put, Math.round(topY + H * 0.16), W * 0.3, W * 0.46, function () { return pal.mark; });   // "GBRX"
    row(put, Math.round(topY + H * 0.16) + 1, W * 0.3, W * 0.46, function () { return pal.mark; });
    row(put, Math.round(topY + H * 0.24), W * 0.3, W * 0.42, function () { return pal.mark; });   // number
    // bogies
    drawBogie(put, W * 0.18, sillY + 1, H);
    drawBogie(put, W * 0.82, sillY + 1, H);
  }

  // BOXCAR — pal: { body, bodyLt, bodyDk, door, mark }
  function drawBoxcar(put, W, H, pal) {
    pal = pal || { body: '#8a3b2e', bodyLt: '#a85643', bodyDk: '#5e2117', door: '#93463a', mark: '#f4f4f4' };
    var topY = H * 0.12, botY = H * 0.7, sillY = H * 0.72;
    // roof strip
    row(put, Math.round(topY) - 2, W * 0.04, W * 0.96, function () { return mix(pal.bodyDk, P.ironDk, 0.3); });
    row(put, Math.round(topY) - 1, W * 0.04, W * 0.96, function () { return pal.bodyLt; });
    // ribbed slab body
    for (var y = Math.round(topY); y < Math.round(botY); y++) {
      var t = (y - topY) / (botY - topY);
      row(put, y, W * 0.04, W * 0.96, function (tx, xx) {
        var b = mix(pal.body, pal.bodyDk, clamp(t * 0.8, 0, 1));
        if (t < 0.14) b = mix(b, pal.bodyLt, 0.5);
        var rib = xx % Math.round(W * 0.045);
        if (rib === 0) b = mix(b, pal.bodyDk, 0.4);            // side ribs
        return b;
      });
    }
    // big center sliding door (inset shade + top/bottom door tracks + handle)
    var dx0 = W * 0.39, dx1 = W * 0.61;
    for (var y3 = Math.round(topY + 2); y3 < Math.round(botY - 1); y3++) {
      var dt = (y3 - topY) / (botY - topY);
      row(put, y3, dx0, dx1, function (tx) {
        var b = mix(pal.door, pal.bodyDk, clamp(dt * 0.9, 0, 1));
        if (tx < 0.08 || tx > 0.92) b = mix(b, pal.bodyDk, 0.6);   // door frame
        if (Math.abs(tx - 0.5) < 0.02) b = mix(b, pal.bodyDk, 0.35); // center seam
        return b;
      });
    }
    row(put, Math.round(topY + 1), dx0 - 3, dx1 + 3, function () { return P.ironDk; });   // top track
    row(put, Math.round(botY - 1), dx0 - 3, dx1 + 3, function () { return P.ironDk; });   // bottom track
    for (var hy = Math.round(topY + H * 0.24); hy < Math.round(topY + H * 0.32); hy++) put(Math.round(dx0 + 3), hy, P.ironDk); // handle
    // lettering: road name left-top + circle herald right ("The Old Reliable" feel)
    row(put, Math.round(topY + H * 0.1), W * 0.09, W * 0.3, function () { return pal.mark; });
    row(put, Math.round(topY + H * 0.16), W * 0.09, W * 0.24, function () { return pal.mark; });
    row(put, Math.round(topY + H * 0.38), W * 0.09, W * 0.18, function () { return pal.mark; });  // small data
    var hx = W * 0.78, hyc = topY + H * 0.2, hr = H * 0.085;
    for (var a = 0; a < Math.PI * 2; a += 0.18)
      put(Math.round(hx + Math.cos(a) * hr), Math.round(hyc + Math.sin(a) * hr), pal.mark);
    row(put, Math.round(hyc), hx - hr * 0.5, hx + hr * 0.5, function () { return pal.mark; });
    // underframe + end ladders + bogies
    row(put, Math.round(sillY), W * 0.04, W * 0.96, function () { return P.ironDk; });
    [W * 0.05, W * 0.95].forEach(function (lx) {
      for (var ly = Math.round(topY); ly < Math.round(sillY); ly += 2) put(Math.round(lx), ly, P.ironDk);
      for (var ry3 = Math.round(topY) + 2; ry3 < Math.round(sillY) - 2; ry3 += 5)
        row(put, ry3, lx - 2, lx + 2, function () { return P.iron; });
    });
    drawBogie(put, W * 0.17, sillY + 1, H);
    drawBogie(put, W * 0.83, sillY + 1, H);
  }

  // ------------------------------------------- THE CONDUCTOR (M4.7 boss) ----
  // User pick 2026-07-14: option #6 "GRIM LINE" from artdev/render_conductor.js
  // (near-black greatcoat + red trim, ghost-blue caged lantern staff, red
  // glowing eyes, pocket watch held out at DOUBLE size — his SCHEDULE focus).
  // Front-facing, drawn at S=128. Keep in sync with the artdev script.
  var CC = {
    coat: '#232838', coatLt: '#39415c', coatDk: '#0c0d12',
    trim: '#b13e53', trimLt: '#ff3b30',
    navyDk: '#1d2947', navyDkk: '#131b31',
    gold: '#d7a13a', goldLt: '#f0c96a',
    eyeGlow: '#ff4a3d', eyeCore: '#ffd0a0', redB: '#ff3b30',
    skin: '#e8b796', skinDk: '#c98f6b', skinLt: '#f2d0b0',
    stache: '#d8dce4', stacheDk: '#9aa3b2',
    white: '#f4f4f4', black: '#0c0d12',
    boot: '#1c1f2b', bootLt: '#333a4d',
    ghost: '#8fd6ff', ghostLt: '#d8f3ff'
  };
  function drawConductor(put, S) {
    var cx = S * 0.5;
    var o = { belly: 0.4, height: 0.7, coatLen: 0.7, mustW: 0.45, capH: 0.6, watchScale: 2 };
    var topY = S * (0.06 + (1 - o.height) * 0.08);
    var capH = S * (0.075 + o.capH * 0.045);
    var headR = S * 0.115;
    var headCy = topY + capH + headR * 0.85;
    var shoulderY = headCy + headR * 1.05;
    var coatBot = S * (0.62 + o.coatLen * 0.3);
    var bootTop = S * 0.86, bootBot = S * 0.97;
    var bellyW = S * (0.19 + o.belly * 0.115);
    // legs / boots
    [-1, 1].forEach(function (sgn) {
      var lx = cx + sgn * S * 0.085;
      for (var y = Math.round(coatBot - S * 0.04); y < bootTop; y++)
        row(put, y, lx - S * 0.055, lx + S * 0.055, function (tx) { return mix(CC.navyDk, CC.navyDkk, 0.3 + tx * 0.4); });
      for (var y2 = bootTop; y2 < bootBot; y2++)
        row(put, y2, lx - S * 0.065 - (y2 > bootBot - 3 ? S * 0.02 : 0), lx + S * 0.065, function (tx) { return mix(CC.bootLt, CC.boot, 0.3 + tx * 0.5); });
    });
    // coat body
    for (var y3 = Math.round(shoulderY); y3 < Math.round(coatBot); y3++) {
      var t = (y3 - shoulderY) / (coatBot - shoulderY);
      var bulge = Math.sin(clamp(t * 1.25, 0, 1) * Math.PI);
      var hw = R.lerp(S * 0.16, bellyW, bulge);
      if (t > 0.75) hw *= 1 + (t - 0.75) * 0.5;                    // greatcoat flare
      row(put, y3, cx - hw, cx + hw, function (tx) {
        var b = mix(CC.coat, CC.coatDk, clamp(t * 0.9, 0, 1));
        if (tx < 0.18) b = mix(b, CC.coatLt, 0.5);
        if (tx > 0.84) b = mix(b, CC.coatDk, 0.55);
        if (Math.abs(tx - 0.38) < 0.02 || Math.abs(tx - 0.62) < 0.02) b = mix(b, CC.coatDk, 0.5);
        return b;
      });
    }
    // hem trim
    row(put, Math.round(coatBot) - 1, cx - S * 0.18, cx + S * 0.18, function () { return CC.trim; });
    // double-breasted RED buttons
    for (var i = 0; i < 3; i++) {
      var by = shoulderY + (coatBot - shoulderY) * (0.22 + i * 0.2);
      [-1, 1].forEach(function (sgn) {
        ell(put, cx + sgn * S * 0.055, by, S * 0.016, S * 0.016, function (tx, ty) { return mix(CC.trimLt, CC.trim, ty); });
      });
    }
    // arms
    var armY = shoulderY + S * 0.03;
    var rHandX = cx - S * (0.24 + o.belly * 0.05), rHandY = armY + S * 0.19;
    stroke(put, cx - S * 0.14, armY, rHandX, rHandY, S * 0.055, function () { return mix(CC.coat, CC.coatDk, 0.35); });
    ell(put, rHandX, rHandY, S * 0.028, S * 0.028, function () { return CC.skin; });
    var lHandX = cx + S * (0.24 + o.belly * 0.04);
    var lHandY = armY + S * 0.1;                                     // watch held OUT
    stroke(put, cx + S * 0.14, armY, lHandX, lHandY, S * 0.055, function () { return mix(CC.coat, CC.coatDk, 0.45); });
    ell(put, lHandX, lHandY, S * 0.028, S * 0.028, function () { return CC.skin; });
    // THE POCKET WATCH — double size (user), crown + ticks + hands
    var wR = S * 0.032 * o.watchScale;
    var watchY = lHandY + S * 0.04 + wR;
    for (var ci = 1; ci <= 3; ci++) put(Math.round(lHandX), Math.round(lHandY + ci * (S * 0.013)), CC.goldLt);
    ell(put, lHandX, watchY, wR, wR, function (tx, ty) { return mix(CC.goldLt, CC.gold, 0.2 + ty * 0.6); });
    ell(put, lHandX, watchY, wR * 0.62, wR * 0.62, function () { return CC.white; });
    put(Math.round(lHandX), Math.round(watchY - wR - 1), CC.goldLt);
    for (var a = 0; a < 12; a++) {
      var ang = a / 12 * Math.PI * 2;
      put(Math.round(lHandX + Math.cos(ang) * wR * 0.52), Math.round(watchY + Math.sin(ang) * wR * 0.52), CC.stacheDk);
    }
    stroke(put, lHandX, watchY, lHandX, watchY - wR * 0.42, 1.2, function () { return CC.black; });
    stroke(put, lHandX, watchY, lHandX + wR * 0.3, watchY + wR * 0.12, 1.2, function () { return CC.black; });
    put(Math.round(lHandX), Math.round(watchY), CC.trim);
    // lantern staff (ghost-blue flame in an iron cage)
    var staffX = rHandX - S * 0.015;
    var staffTop = topY + S * 0.02, staffBot = bootBot - S * 0.02;
    for (var sy = Math.round(staffTop + S * 0.14); sy < staffBot; sy++) {
      put(Math.round(staffX), sy, mix(P.ironDk, P.iron, (sy % 5) / 5));
      put(Math.round(staffX) + 1, sy, P.ironDk);
    }
    var lanCy = staffTop + S * 0.08, lanR = S * 0.052;
    ell(put, staffX, lanCy, lanR, lanR * 1.25, function (tx, ty) { return mix(CC.ghostLt, CC.ghost, clamp(ty * 1.3, 0, 1)); });
    for (var by2 = Math.round(lanCy - lanR * 1.25); by2 <= Math.round(lanCy + lanR * 1.25); by2++) put(Math.round(staffX), by2, P.ironDk);
    row(put, Math.round(lanCy - lanR * 1.35), staffX - lanR, staffX + lanR, function () { return P.iron; });
    row(put, Math.round(lanCy + lanR * 1.3), staffX - lanR * 0.8, staffX + lanR * 0.8, function () { return P.iron; });
    put(Math.round(staffX), Math.round(lanCy - lanR * 1.6), CC.gold);
    // head: collar, bowtie, face, mustache, cap
    row(put, Math.round(shoulderY - S * 0.012), cx - S * 0.05, cx + S * 0.05, function () { return CC.white; });
    ell(put, cx, shoulderY + S * 0.005, S * 0.028, S * 0.018, function (tx, ty) { return mix(CC.trimLt, CC.trim, ty); });
    ell(put, cx, headCy, headR, headR * 1.02, function (tx, ty) {
      var b = mix(CC.skinLt, CC.skin, clamp(ty * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, CC.skinDk, 0.5);
      return b;
    });
    var eyeY = headCy - headR * 0.18, eyeX = headR * 0.42;
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * eyeX, eyeY, S * 0.024, S * 0.017, function (tx, ty) { return mix(CC.eyeGlow, CC.redB, ty); });
      put(Math.round(cx + sgn * eyeX), Math.round(eyeY), CC.eyeCore);
      row(put, Math.round(eyeY - S * 0.028), cx + sgn * eyeX - S * 0.028, cx + sgn * eyeX + S * 0.028, function () { return P.OUT; });
    });
    var mW = headR * (0.7 + o.mustW * 0.65), mY = headCy + headR * 0.32;
    ell(put, cx, mY, mW, headR * 0.28, function (tx, ty) {
      var b = mix(CC.stache, CC.stacheDk, clamp(ty * 1.1 - 0.2, 0, 1));
      if (Math.abs(tx - 0.5) < 0.06 && ty < 0.4) b = CC.skinDk;
      return b;
    });
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * mW * 0.9, mY + headR * 0.12, headR * 0.16, headR * 0.14, function () { return CC.stache; }); });
    for (var cy2 = Math.round(topY); cy2 < Math.round(topY + capH); cy2++) {
      var ct = (cy2 - topY) / capH;
      var chw = R.lerp(headR * 0.92, headR * 1.12, Math.sin(clamp(ct * 1.1, 0, 1) * Math.PI * 0.5));
      row(put, cy2, cx - chw, cx + chw, function (tx) {
        var b = mix(CC.coatLt, CC.coat, clamp(ct * 1.2, 0, 1));
        if (tx < 0.2) b = mix(b, CC.coatLt, 0.4);
        return b;
      });
    }
    row(put, Math.round(topY + capH - 2), cx - headR * 1.12, cx + headR * 1.12, function () { return CC.trim; });
    row(put, Math.round(topY + capH - 3), cx - headR * 1.12, cx + headR * 1.12, function () { return CC.trimLt; });
    ell(put, cx, topY + capH * 0.5, S * 0.022, S * 0.02, function (tx, ty) { return mix(CC.trimLt, CC.trim, ty); });
    ell(put, cx, topY + capH + S * 0.008, headR * 1.02, S * 0.022, function () { return CC.black; });
  }

  // ==========================================================================
  // M5.0 — THE GROVE (user picks 2026-07-14/15): lush enchanted forest biome.
  // 8-mob roster + minis, grove tiles/props, the HEARTWOOD (boss arrival tree),
  // and the falling ancient trunk. Same 48px front-facing style as the yard.
  // Fliers (pixies / moonmoth / bumblebrutes) take a `frame` param (0/1) for
  // the 2-frame WING FLAP (user: "animate pixies and moonmoth with flopping
  // wings"); textures.js builds <key> + <key>b and updateMob toggles them.
  // ==========================================================================
  var G = {
    leaf: '#38b764', leafLt: '#8ff0a5', leafDk: '#1f6e3f', leafDkk: '#14492a',
    vine: '#2e9e57', vineDk: '#1f6e3f',
    capRed: '#d95763', capRedLt: '#f28d9a', capRedDk: '#9e2835',
    cream: '#f4e3c2', creamDk: '#d8bf94',
    glow: '#6ff0e0', glowLt: '#c8fff4', glowDk: '#2fa998',
    honey: '#ffcd75', honeyLt: '#ffe3a8', honeyDk: '#d7a13a',
    pixie: '#ff77a8', pixieLt: '#ffc2d8', pixieDk: '#c2437a',
    moth: '#e8e8f4', mothDk: '#b0b0cc', mothDkk: '#7d7d9c',
    stone: '#7c8494', stoneLt: '#a4adc0', stoneDk: '#4c5262',
    moss2: '#3f7a3c', mossLt2: '#63b25a', mossDk2: '#274d26',
    bee: '#ffd23e', beeDk: '#c89a1e',
    water: '#41a6f6', waterLt: '#8fd6ff', waterDk: '#2569a8',
    grass: '#2f6e42', grassLt: '#3f8a52', grassDkk: '#225232',
    skin2: '#e8b796', skinLt2: '#f2d0b0'
  };

  // 2 · PUFFCAP WADDLER — slow toddling mushroom; SPLITS into 10 minis on death.
  function drawPuffcap(put, S) {
    var cx = S * 0.5;
    [[0.16, 0.3], [0.85, 0.42], [0.8, 0.2]].forEach(function (p2) {
      put(Math.round(S * p2[0]), Math.round(S * p2[1]), G.capRedLt);
      put(Math.round(S * p2[0]) + 1, Math.round(S * p2[1]) + 1, G.cream);
    });
    for (var y = Math.round(S * 0.5); y < Math.round(S * 0.88); y++) {
      var t = (y - S * 0.5) / (S * 0.38);
      var hw = S * (0.13 + 0.05 * Math.sin(t * Math.PI));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(G.cream, G.creamDk, clamp(t * 0.9, 0, 1));
        if (tx > 0.75) b = mix(b, G.creamDk, 0.5);
        return b;
      });
    }
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * S * 0.1, S * 0.89, S * 0.06, S * 0.035, function () { return G.creamDk; }); });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.15, S * 0.62, cx + sgn * S * 0.24, S * 0.68, S * 0.04, function () { return G.creamDk; });
    });
    [-1, 1].forEach(function (sgn) {
      row(put, Math.round(S * 0.585), cx + sgn * S * 0.07 - 2, cx + sgn * S * 0.07 + 2, function () { return P.eye; });
    });
    ell(put, cx, S * 0.66, S * 0.018, S * 0.014, function () { return G.capRedDk; });
    for (var cy = Math.round(S * 0.2); cy < Math.round(S * 0.52); cy++) {
      var ct = (cy - S * 0.2) / (S * 0.32);
      var chw = S * 0.34 * Math.sin(clamp(0.18 + ct * 0.82, 0, 1) * Math.PI * 0.62);
      row(put, cy, cx - chw, cx + chw, function (tx) {
        var b = mix(G.capRedLt, G.capRed, clamp(ct * 1.3, 0, 1));
        if (tx < 0.18) b = mix(b, G.capRedLt, 0.5);
        if (tx > 0.85) b = mix(b, G.capRedDk, 0.4);
        return b;
      });
    }
    row(put, Math.round(S * 0.51), cx - S * 0.33, cx + S * 0.33, function () { return G.capRedDk; });
    [[-0.16, 0.3, 0.045], [0.1, 0.25, 0.055], [0.24, 0.4, 0.035], [-0.05, 0.42, 0.03]].forEach(function (sp) {
      ell(put, cx + sp[0] * S, S * sp[1], S * sp[2], S * sp[2] * 0.8, function () { return G.cream; });
    });
  }

  // PUFFCAP MINI — the split children; pal = { cap, capLt, capDk } (4 recolors).
  function drawPuffcapMini(put, S, pal) {
    var cx = S * 0.5;
    // little stem + feet
    for (var y = Math.round(S * 0.55); y < Math.round(S * 0.85); y++) {
      var t = (y - S * 0.55) / (S * 0.3);
      var hw = S * (0.12 + 0.03 * Math.sin(t * Math.PI));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(G.cream, G.creamDk, clamp(t, 0, 1));
        if (tx > 0.72) b = mix(b, G.creamDk, 0.5);
        return b;
      });
    }
    [-1, 1].forEach(function (sgn) { ell(put, cx + sgn * S * 0.09, S * 0.86, S * 0.06, S * 0.04, function () { return G.creamDk; }); });
    // angry little eyes (the babies are MAD)
    [-1, 1].forEach(function (sgn) {
      put(Math.round(cx + sgn * S * 0.08), Math.round(S * 0.63), P.eye);
      put(Math.round(cx + sgn * S * 0.08) + (sgn > 0 ? -1 : 1), Math.round(S * 0.63), P.eye);
      row(put, Math.round(S * 0.59), cx + sgn * S * 0.08 - 2, cx + sgn * S * 0.08 + 2, function () { return pal.capDk; });
    });
    for (var m2 = -1; m2 <= 1; m2++) put(Math.round(cx + m2 * 2), Math.round(S * 0.72), G.creamDk);
    // cap
    for (var cy = Math.round(S * 0.22); cy < Math.round(S * 0.58); cy++) {
      var ct = (cy - S * 0.22) / (S * 0.36);
      var chw = S * 0.36 * Math.sin(clamp(0.2 + ct * 0.8, 0, 1) * Math.PI * 0.6);
      row(put, cy, cx - chw, cx + chw, function (tx) {
        var b = mix(pal.capLt, pal.cap, clamp(ct * 1.3, 0, 1));
        if (tx < 0.2) b = mix(b, pal.capLt, 0.5);
        if (tx > 0.85) b = mix(b, pal.capDk, 0.4);
        return b;
      });
    }
    row(put, Math.round(S * 0.57), cx - S * 0.34, cx + S * 0.34, function () { return pal.capDk; });
    [[-0.14, 0.34, 0.05], [0.12, 0.3, 0.055], [0.02, 0.46, 0.035]].forEach(function (sp) {
      ell(put, cx + sp[0] * S, S * sp[1], S * sp[2], S * sp[2] * 0.8, function () { return G.cream; });
    });
  }

  // 7 · PIXIE — blink trickster (pink) / BLOOM PIXIE (blue resurrectionist).
  // pal = { main, lt, dk }; frame 0 = wings UP, frame 1 = wings swept DOWN.
  function drawPixie(put, S, pal, frame) {
    var p2 = pal, cx = S * 0.54, cy = S * 0.42;
    // blink afterimage + sparkle trail
    ell(put, S * 0.18, S * 0.62, S * 0.07, S * 0.09, function (tx, ty) {
      return (Math.round(tx * 10) + Math.round(ty * 10)) % 2 === 0 ? p2.dk : p2.main;
    });
    [[0.1, 0.5], [0.26, 0.72], [0.3, 0.52]].forEach(function (sp) {
      put(Math.round(S * sp[0]), Math.round(S * sp[1]), p2.lt);
    });
    // wings — the FLAP frames
    [-1, 1].forEach(function (sgn) {
      if (frame) ell(put, cx + sgn * S * 0.16, cy + S * 0.02, S * 0.1, S * 0.09, function (tx, ty) { return mix(p2.lt, '#ffffff', 0.3 + ty * 0.3); });
      else ell(put, cx + sgn * S * 0.15, cy - S * 0.1, S * 0.11, S * 0.15, function (tx, ty) { return mix(p2.lt, '#ffffff', 0.3 + ty * 0.3); });
    });
    // tunic body
    for (var y = Math.round(cy - S * 0.02); y < Math.round(cy + S * 0.2); y++) {
      var t = (y - cy + S * 0.02) / (S * 0.22);
      var hw = R.lerp(S * 0.07, S * 0.12, t);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(p2.main, p2.dk, clamp(t, 0, 1));
        if (tx < 0.25) b = mix(b, p2.lt, 0.45);
        return b;
      });
    }
    stroke(put, cx - S * 0.03, cy + S * 0.2, cx - S * 0.07, cy + S * 0.32, S * 0.025, function () { return G.skin2; });
    stroke(put, cx + S * 0.04, cy + S * 0.2, cx + S * 0.08, cy + S * 0.3, S * 0.025, function () { return G.skin2; });
    ell(put, cx, cy - S * 0.1, S * 0.09, S * 0.085, function (tx, ty) { return mix(G.skinLt2, G.skin2, ty); });
    ell(put, cx - S * 0.02, cy - S * 0.17, S * 0.09, S * 0.045, function (tx) { return mix(p2.dk, p2.main, tx); });
    stroke(put, cx + S * 0.06, cy - S * 0.19, cx + S * 0.13, cy - S * 0.24, S * 0.03, function () { return p2.dk; });
    [-1, 1].forEach(function (sgn) { put(Math.round(cx + sgn * S * 0.04), Math.round(cy - S * 0.11), P.eye); });
    for (var m2 = -2; m2 <= 2; m2++) put(Math.round(cx + m2), Math.round(cy - S * 0.055 + (Math.abs(m2) === 2 ? -1 : 0)), G.capRedDk);
    // sparkle-shot fan + casting hand
    [[0.78, 0.3], [0.84, 0.42], [0.8, 0.55]].forEach(function (sp) {
      put(Math.round(S * sp[0]), Math.round(S * sp[1]), p2.lt);
      put(Math.round(S * sp[0]) - 1, Math.round(S * sp[1]), p2.main);
    });
    stroke(put, cx + S * 0.1, cy + S * 0.04, cx + S * 0.2, cy, S * 0.03, function () { return G.skin2; });
  }

  // 8 · MOSS GOLEM — big tanky chaser (user: plain tank, no tricks).
  function drawMossGolem(put, S) {
    var cx = S * 0.5;
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.2, S * 0.42, cx + sgn * S * 0.36, S * 0.74, S * 0.09,
             function (t) { return mix(G.stone, G.stoneDk, 0.3 + t * 0.4); });
      ell(put, cx + sgn * S * 0.37, S * 0.78, S * 0.08, S * 0.06, function (tx, ty) { return mix(G.stoneLt, G.stone, ty); });
    });
    ell(put, cx, S * 0.56, S * 0.26, S * 0.24, function (tx, ty) {
      var b = mix(G.stone, G.stoneDk, clamp(ty * 1.1, 0, 1));
      if (tx < 0.2) b = mix(b, G.stoneLt, 0.5);
      return b;
    });
    ell(put, cx, S * 0.3, S * 0.18, S * 0.14, function (tx, ty) {
      var b = mix(G.stoneLt, G.stone, clamp(ty * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, G.stoneDk, 0.45);
      return b;
    });
    stroke(put, cx - S * 0.14, S * 0.52, cx - S * 0.05, S * 0.62, 1.2, function () { return G.stoneDk; });
    stroke(put, cx + S * 0.08, S * 0.58, cx + S * 0.16, S * 0.68, 1.2, function () { return G.stoneDk; });
    [[-0.14, 0.44, 0.1, 0.05], [0.12, 0.68, 0.11, 0.05], [0.02, 0.2, 0.09, 0.04], [-0.2, 0.66, 0.07, 0.04]].forEach(function (mp) {
      ell(put, cx + mp[0] * S, S * mp[1], S * mp[2], S * mp[3], function (tx, ty) { return mix(G.mossLt2, G.moss2, ty); });
    });
    for (var i = -2; i <= 2; i++) {
      stroke(put, cx + i * S * 0.05, S * 0.38, cx + i * S * 0.05, S * 0.44 + Math.abs(i % 2) * 2, 1.4, function () { return G.moss2; });
    }
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.07, S * 0.28, S * 0.035, S * 0.03, function () { return G.glow; });
      put(Math.round(cx + sgn * S * 0.07), Math.round(S * 0.28), P.eye);
    });
    stroke(put, cx + S * 0.02, S * 0.16, cx + S * 0.02, S * 0.1, 1.2, function () { return G.vine; });
    ell(put, cx + S * 0.05, S * 0.09, S * 0.035, S * 0.025, function () { return G.leafLt; });
    ell(put, cx - S * 0.01, S * 0.08, S * 0.03, S * 0.022, function () { return G.leaf; });
  }

  // 9 · SEEDLING TURRET — rooted snap-plant; radial GOLD seed bursts.
  function drawSeedlingTurret(put, S) {
    var cx = S * 0.5;
    [[-0.28, 0.82], [0.28, 0.82], [-0.16, 0.86], [0.16, 0.86]].forEach(function (L) {
      stroke(put, cx, S * 0.84, cx + L[0] * S * 1.3, S * (L[1] - 0.12), S * 0.05,
             function (t) { return mix(G.leaf, G.leafDk, t); });
    });
    ell(put, cx, S * 0.88, S * 0.2, S * 0.07, function (tx, ty) { return mix(P.barkLt, P.bark, ty); });
    for (var i = 0; i <= 10; i++) {
      var t = i / 10;
      var x = cx + Math.sin(t * Math.PI * 1.2) * S * 0.05;
      var y = S * (0.84 - t * 0.42);
      ell(put, x, y, S * 0.035, S * 0.03, function () { return mix(G.vine, G.vineDk, t * 0.5); });
    }
    var hx = cx + Math.sin(Math.PI * 1.2) * S * 0.05, hy = S * 0.34;
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ell(put, hx + Math.cos(a) * S * 0.13, hy + Math.sin(a) * S * 0.13, S * 0.055, S * 0.045,
          function (tx, ty) { return mix(G.honeyLt, G.honey, ty); });
    }
    ell(put, hx, hy, S * 0.12, S * 0.11, function (tx, ty) {
      var b = mix(G.leafLt, G.leaf, clamp(ty * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, G.leafDk, 0.4);
      return b;
    });
    ell(put, hx, hy + S * 0.02, S * 0.06, S * 0.05, function () { return G.leafDkk; });
    put(Math.round(hx - 2), Math.round(hy + S * 0.02), G.honey);
    put(Math.round(hx + 2), Math.round(hy + S * 0.01), G.honey);
    [[0.2, 0.14], [0.78, 0.16], [0.86, 0.5], [0.12, 0.44]].forEach(function (sp) {
      put(Math.round(S * sp[0]), Math.round(S * sp[1]), G.honeyDk);
      put(Math.round(S * sp[0]) + 1, Math.round(S * sp[1]) + 1, G.honey);
    });
  }

  // 14 · SNAPDRAGON — rooted dragon-flower; aimed PINK petal-bolt fans.
  function drawSnapdragon(put, S) {
    var bx = S * 0.3;
    [[-0.14, -0.3], [0.12, 0.3], [0, 0]].forEach(function (L) {
      stroke(put, bx, S * 0.88, bx + L[0] * S + L[1] * S * 0.4, S * 0.76, S * 0.05,
             function (t) { return mix(G.leaf, G.leafDk, t); });
    });
    ell(put, bx, S * 0.9, S * 0.14, S * 0.05, function (tx, ty) { return mix(P.barkLt, P.bark, ty); });
    for (var i = 0; i <= 14; i++) {
      var t = i / 14;
      var x = R.lerp(bx, S * 0.68, t) + Math.sin(t * Math.PI) * S * 0.06;
      var y = S * (0.86 - t * 0.5) - Math.sin(t * Math.PI * 0.9) * S * 0.1;
      ell(put, x, y, S * (0.045 - t * 0.012), S * 0.035, function () { return mix(G.vine, G.vineDk, t * 0.4); });
    }
    [3, 6, 9, 12].forEach(function (i2) {
      var t = i2 / 14;
      var x = R.lerp(bx, S * 0.68, t) + Math.sin(t * Math.PI) * S * 0.06;
      var y = S * (0.86 - t * 0.5) - Math.sin(t * Math.PI * 0.9) * S * 0.1;
      put(Math.round(x), Math.round(y - S * 0.05), G.leafDk);
    });
    var hx = S * 0.7, hy = S * 0.32;
    for (var a = 0.6; a < Math.PI * 2; a += Math.PI / 3.2) {
      ell(put, hx - S * 0.06 + Math.cos(a + Math.PI) * S * 0.1, hy + Math.sin(a + Math.PI) * S * 0.1,
          S * 0.055, S * 0.04, function (tx, ty) { return mix(G.pixieLt, G.pixie, ty); });
    }
    ell(put, hx, hy - S * 0.035, S * 0.12, S * 0.06, function (tx, ty) {
      var b = mix(G.capRedLt, G.capRed, clamp(ty * 1.2, 0, 1));
      if (tx < 0.3) b = mix(b, G.capRedLt, 0.4);
      return b;
    });
    ell(put, hx + S * 0.02, hy + S * 0.075, S * 0.1, S * 0.045, function (tx, ty) { return mix(G.capRed, G.capRedDk, ty); });
    ell(put, hx + S * 0.04, hy + S * 0.02, S * 0.07, S * 0.035, function () { return P.black; });
    put(Math.round(hx + S * 0.09), Math.round(hy - S * 0.005), P.tooth);
    put(Math.round(hx + S * 0.03), Math.round(hy - S * 0.005), P.tooth);
    put(Math.round(hx + S * 0.06), Math.round(hy + S * 0.05), P.tooth);
    put(Math.round(hx - S * 0.05), Math.round(hy - S * 0.05), G.honeyLt);
    put(Math.round(hx - S * 0.05) + 1, Math.round(hy - S * 0.05), P.eye);
  }

  // 15 · BUMBLEBRUTE — armored guardian bee; immortal while his minis live.
  // frame 0 = wings raised, frame 1 = wings flat-out mid-beat.
  function drawBumblebrute(put, S, frame) {
    var cx = S * 0.5, cy = S * 0.52;
    [-1, 1].forEach(function (sgn) {
      if (frame) ell(put, cx + sgn * S * 0.19, cy - S * 0.16, S * 0.13, S * 0.045, function (tx, ty) { return mix('#ffffff', G.glowLt, 0.4 + ty * 0.3); });
      else ell(put, cx + sgn * S * 0.13, cy - S * 0.24, S * 0.1, S * 0.055, function (tx, ty) { return mix('#ffffff', G.glowLt, 0.4 + ty * 0.3); });
    });
    for (var y = Math.round(cy - S * 0.16); y < Math.round(cy + S * 0.26); y++) {
      var t = (y - cy + S * 0.16) / (S * 0.42);
      var hw = S * 0.28 * Math.sin(clamp(0.12 + t * 0.88, 0, 1) * Math.PI * 0.85);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var stripe = Math.floor((y - cy + S * 0.16) / (S * 0.085)) % 2 === 0;
        var b = stripe ? mix(G.bee, G.beeDk, clamp(t * 0.7, 0, 1)) : mix('#2a2d3a', P.black, t * 0.5);
        if (tx < 0.15) b = mix(b, stripe ? G.honeyLt : '#4a4e60', 0.5);
        return b;
      });
    }
    stroke(put, cx, cy + S * 0.27, cx, cy + S * 0.36, S * 0.04, function (t) { return mix(G.honeyDk, P.black, t); });
    ell(put, cx, cy - S * 0.22, S * 0.14, S * 0.1, function (tx, ty) {
      var b = mix(G.stoneLt, G.stone, clamp(ty * 1.2, 0, 1));
      if (tx < 0.25) b = mix(b, '#cdd6e2', 0.5);
      return b;
    });
    row(put, Math.round(cy - S * 0.22), cx - S * 0.13, cx + S * 0.13, function () { return G.stoneDk; });
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.06, cy - S * 0.18, S * 0.03, S * 0.026, function () { return '#ff3b30'; });
      put(Math.round(cx + sgn * S * 0.06), Math.round(cy - S * 0.18), '#ffd0a0');
    });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.05, cy - S * 0.3, cx + sgn * S * 0.1, cy - S * 0.38, 1.2, function () { return P.black; });
      put(Math.round(cx + sgn * S * 0.1), Math.round(cy - S * 0.39), G.honey);
    });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.16, cy + S * 0.18, cx + sgn * S * 0.24, cy + S * 0.28, S * 0.03, function () { return P.black; });
    });
  }

  // BUMBLEBRUTE MINI — his summoned wards. pal = { body, dk } stripe recolor.
  function drawBumblebruteMini(put, S, pal, frame) {
    var cx = S * 0.5, cy = S * 0.52;
    [-1, 1].forEach(function (sgn) {
      if (frame) ell(put, cx + sgn * S * 0.2, cy - S * 0.06, S * 0.13, S * 0.05, function (tx, ty) { return mix('#ffffff', G.glowLt, 0.35 + ty * 0.3); });
      else ell(put, cx + sgn * S * 0.13, cy - S * 0.18, S * 0.1, S * 0.06, function (tx, ty) { return mix('#ffffff', G.glowLt, 0.35 + ty * 0.3); });
    });
    for (var y = Math.round(cy - S * 0.14); y < Math.round(cy + S * 0.2); y++) {
      var t = (y - cy + S * 0.14) / (S * 0.34);
      var hw = S * 0.24 * Math.sin(clamp(0.15 + t * 0.85, 0, 1) * Math.PI * 0.85);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var stripe = Math.floor((y - cy + S * 0.14) / (S * 0.08)) % 2 === 0;
        var b = stripe ? mix(pal.body, pal.dk, clamp(t * 0.7, 0, 1)) : mix('#2a2d3a', P.black, t * 0.5);
        if (tx < 0.18) b = mix(b, '#ffffff', 0.25);
        return b;
      });
    }
    stroke(put, cx, cy + S * 0.21, cx, cy + S * 0.3, S * 0.035, function (t) { return mix(pal.dk, P.black, t); });
    // cross eyes + antennae straight on the body (no armor plate — just a grunt)
    [-1, 1].forEach(function (sgn) {
      put(Math.round(cx + sgn * S * 0.08), Math.round(cy - S * 0.06), P.eye);
      put(Math.round(cx + sgn * S * 0.08), Math.round(cy - S * 0.06) - 1, P.eye);
    });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.04, cy - S * 0.2, cx + sgn * S * 0.09, cy - S * 0.3, 1.1, function () { return P.black; });
      put(Math.round(cx + sgn * S * 0.09), Math.round(cy - S * 0.31), pal.body);
    });
  }

  // 20 · MOONMOTH — fast squishy chaser. frame 0 = wings spread, 1 = mid-beat.
  function drawMoonmoth(put, S, frame) {
    var cx = S * 0.5, cy = S * 0.5;
    var wf = frame ? 0.55 : 1;                      // wing fold factor
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.21 * wf, cy - S * 0.1, S * 0.18 * wf, S * 0.16, function (tx, ty) {
        var b = mix(G.moth, G.mothDk, clamp(ty * 1.05, 0, 1));
        if ((sgn > 0 ? tx : 1 - tx) < 0.25) b = mix(b, '#ffffff', 0.35);
        return b;
      });
      ell(put, cx + sgn * S * 0.17 * wf, cy + S * 0.14, S * 0.13 * wf, S * 0.12, function (tx, ty) {
        return mix(G.moth, G.mothDkk, clamp(ty * 1.1, 0, 1));
      });
    });
    // moon spots (both wings)
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.22 * wf, cy - S * 0.1, S * 0.05 * wf, S * 0.05, function (tx, ty) { return mix(G.glowLt, G.glow, ty); });
      ell(put, cx + sgn * S * 0.16 * wf, cy + S * 0.15, S * 0.035 * wf, S * 0.03, function () { return G.glowDk; });
    });
    ell(put, cx, cy + S * 0.02, S * 0.06, S * 0.17, function (tx, ty) {
      var b = mix(G.mothDk, G.mothDkk, clamp(ty * 1.1, 0, 1));
      if (tx < 0.3) b = mix(b, G.moth, 0.4);
      return b;
    });
    ell(put, cx, cy - S * 0.1, S * 0.075, S * 0.05, function (tx, ty) { return mix('#ffffff', G.moth, ty); });
    ell(put, cx, cy - S * 0.17, S * 0.05, S * 0.045, function (tx, ty) { return mix(G.moth, G.mothDk, ty); });
    [-1, 1].forEach(function (sgn) { put(Math.round(cx + sgn * S * 0.025), Math.round(cy - S * 0.17), G.glow); });
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.02, cy - S * 0.21, cx + sgn * S * 0.09, cy - S * 0.32, 1.2, function () { return G.mothDk; });
      for (var f = 1; f <= 3; f++)
        put(Math.round(cx + sgn * (S * 0.02 + f * S * 0.023)), Math.round(cy - S * 0.21 - f * S * 0.037 + 1), G.mothDkk);
    });
  }

  // ------------------------------------------------ GROVE TILES + PROPS -----
  // Seamless lush-grass tile (deterministic hash scatter — no RNG).
  function drawGroveGrass(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var h = ((x * 7 + y * 13) * 31 + x * y) % 97;
      var b = G.grass;
      if (h < 14) b = G.grassLt;
      else if (h < 22) b = G.grassDkk;
      put(x, y, b);
    }
    // grass blades
    for (var i = 0; i < 26; i++) {
      var bx = (i * 37 + 11) % W, by = (i * 53 + 7) % H;
      put(bx, by, G.leafDk); put(bx, (by + H - 1) % H, G.leaf);
    }
    // tiny flowers + glow motes
    [[7, 9, G.pixieLt], [29, 33, G.honeyLt], [41, 14, '#ffffff'], [17, 40, G.glow]].forEach(function (f) {
      put(f[0], f[1], f[2]);
    });
  }

  // Border hedge band (like yardwall) — dense canopy edge.
  function drawGroveWall(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var h = ((x * 11 + y * 17) * 23 + x) % 89;
      var t = y / H;
      var b = mix(G.leafDk, G.leafDkk, t);
      if (h < 18) b = mix(G.leaf, G.leafDk, t);
      if (h > 80) b = G.leafDkk;
      put(x, y, b);
    }
    for (var i = 0; i < 8; i++) {
      var bx = (i * 19 + 5) % W;
      put(bx, 2 + (i % 3), G.leafLt);                 // canopy highlights
    }
  }

  // A big front-facing grove tree (scatter prop; walls are visual-only).
  function drawGroveTree(put, S) {
    var cx = S * 0.5;
    // trunk
    for (var y = Math.round(S * 0.62); y < Math.round(S * 0.95); y++) {
      var t = (y - S * 0.62) / (S * 0.33);
      var hw = S * (0.07 + t * 0.05);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.barkLt, P.bark, clamp(0.3 + t * 0.6, 0, 1));
        if (Math.abs(tx - 0.6) < 0.08) b = mix(b, P.barkDk, 0.5);
        return b;
      });
    }
    // canopy — stacked leaf blobs
    [[0, 0.36, 0.34, 0.24], [-0.22, 0.46, 0.2, 0.15], [0.22, 0.46, 0.2, 0.15],
     [-0.12, 0.24, 0.18, 0.13], [0.12, 0.22, 0.17, 0.12], [0, 0.14, 0.13, 0.1]].forEach(function (L, i2) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], function (tx, ty) {
        var b = mix(G.leaf, G.leafDk, clamp(ty * 1.2, 0, 1));
        if (tx < 0.25) b = mix(b, G.leafLt, 0.45);
        if ((Math.round(tx * 14) + Math.round(ty * 10) + i2) % 7 === 0) b = mix(b, G.leafLt, 0.4);
        return b;
      });
    });
    // a few glow motes in the leaves
    put(Math.round(cx - S * 0.15), Math.round(S * 0.3), G.glowLt);
    put(Math.round(cx + S * 0.18), Math.round(S * 0.4), G.honeyLt);
  }

  // Glowing mushroom cluster (decor prop; pulsed by the scene).
  function drawGlowShroom(put, S) {
    [[0.34, 0.62, 0.16, 0.5], [0.64, 0.7, 0.12, 0.62], [0.5, 0.8, 0.09, 0.74]].forEach(function (M) {
      var mx = S * M[0], capY = S * M[1], capR = S * M[2], stemTop = S * M[3];
      // stem
      for (var y = Math.round(capY); y < Math.round(S * 0.92); y++)
        row(put, y, mx - capR * 0.3, mx + capR * 0.3, function (tx) { return mix(G.cream, G.creamDk, tx); });
      // glowing cap
      for (var cy = Math.round(capY - capR * 0.9); cy < Math.round(capY); cy++) {
        var t = (cy - (capY - capR * 0.9)) / (capR * 0.9);
        var hw = capR * Math.sin(clamp(0.25 + t * 0.75, 0, 1) * Math.PI * 0.6);
        row(put, cy, mx - hw, mx + hw, function (tx) {
          var b = mix(G.glowLt, G.glow, clamp(t * 1.2, 0, 1));
          if (tx > 0.8) b = mix(b, G.glowDk, 0.4);
          return b;
        });
      }
      put(Math.round(mx), Math.round(capY - capR * 0.5), '#ffffff');
    });
  }

  // THE HEARTWOOD — the arena's colossal ancient tree; the Grovekeeper steps
  // out of the glowing seam in its trunk (arrival cinematic).
  function drawHeartwood(put, S) {
    var cx = S * 0.5;
    // root flare
    [-1, 1].forEach(function (sgn) {
      stroke(put, cx + sgn * S * 0.1, S * 0.88, cx + sgn * S * 0.26, S * 0.97, S * 0.07,
             function (t) { return mix(P.bark, P.barkDk, t); });
    });
    // massive trunk
    for (var y = Math.round(S * 0.42); y < Math.round(S * 0.96); y++) {
      var t = (y - S * 0.42) / (S * 0.54);
      var hw = S * (0.13 + t * 0.08);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.barkLt, P.bark, clamp(0.25 + t * 0.55, 0, 1));
        if (Math.abs(tx - 0.28) < 0.05 || Math.abs(tx - 0.74) < 0.05) b = mix(b, P.barkDk, 0.5);
        if (tx < 0.12) b = mix(b, P.barkLt, 0.4);
        return b;
      });
    }
    // the DOOR SEAM — a faint glowing crack up the middle of the trunk
    for (var sy = Math.round(S * 0.52); sy < Math.round(S * 0.9); sy++) {
      if (sy % 3 !== 0) put(Math.round(cx + Math.sin(sy * 0.4) * 1.5), sy, mix(G.glowDk, G.glow, (sy % 7) / 7));
    }
    // knot eyes (the tree WATCHES)
    [-1, 1].forEach(function (sgn) {
      ell(put, cx + sgn * S * 0.08, S * 0.5, S * 0.025, S * 0.02, function () { return P.barkDk; });
    });
    // colossal canopy
    [[0, 0.28, 0.42, 0.2], [-0.3, 0.36, 0.22, 0.14], [0.3, 0.36, 0.22, 0.14],
     [-0.16, 0.16, 0.22, 0.13], [0.16, 0.15, 0.21, 0.12], [0, 0.07, 0.16, 0.09]].forEach(function (L, i2) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], function (tx, ty) {
        var b = mix(G.leaf, G.leafDk, clamp(ty * 1.25, 0, 1));
        if (tx < 0.22) b = mix(b, G.leafLt, 0.5);
        if ((Math.round(tx * 16) + Math.round(ty * 12) + i2 * 3) % 8 === 0) b = mix(b, G.leafLt, 0.35);
        return b;
      });
    });
    // fireflies in the canopy
    [[0.24, 0.2], [0.72, 0.26], [0.5, 0.1], [0.34, 0.34]].forEach(function (f) {
      put(Math.round(S * f[0]), Math.round(S * f[1]), G.glowLt);
    });
  }

  // ---------------- GROVE DECORATIONS (user picks 2026-07-15) ---------------
  // 14 of the 20-option decor sheet: 1 ancient oak · 3 willow · 4 toadstool ·
  // 5 fairy ring · 6 lily pond · 7 boulders · 8 hollow stump · 9 wildflowers ·
  // 10 pixie lanterns · 11 stone arch · 12 runestone · 13 mossy log ·
  // 17 wisp spring · 19 ivy obelisk. All 64px props scattered by setupGrove.
  var DC = {
    birch: '#e8e4da', birchDk: '#b8b4aa',
    water: '#41a6f6', waterLt: '#8fd6ff', waterDk: '#2569a8',
    purple: '#8f3fb5', purpleLt: '#c078e0'
  };

  function dAncientOak(put, S) {
    var cx = S * 0.5;
    for (var y = Math.round(S * 0.55); y < Math.round(S * 0.95); y++) {
      var t = (y - S * 0.55) / (S * 0.4);
      var wob = Math.sin(y * 0.35) * S * 0.02;
      var hw = S * (0.1 + t * 0.09);
      row(put, y, cx - hw + wob, cx + hw + wob, function (tx) {
        var b = mix(P.barkLt, P.bark, 0.3 + t * 0.6);
        if (Math.abs(tx - 0.35) < 0.07 || Math.abs(tx - 0.7) < 0.06) b = mix(b, P.barkDk, 0.55);
        return b;
      });
    }
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.08, S * 0.92, cx + s * S * 0.24, S * 0.98, S * 0.05, function (t) { return mix(P.bark, P.barkDk, t); }); });
    [[0, 0.34, 0.36, 0.17], [-0.26, 0.42, 0.18, 0.12], [0.26, 0.42, 0.18, 0.12], [-0.12, 0.2, 0.2, 0.12], [0.14, 0.19, 0.18, 0.11]].forEach(function (L, i) {
      ell(put, cx + L[0] * S, S * L[1], S * L[2], S * L[3], function (tx, ty) {
        var b = mix(G.leaf, G.leafDk, clamp(ty * 1.2, 0, 1));
        if (tx < 0.22) b = mix(b, G.leafLt, 0.45);
        if ((Math.round(tx * 12) + Math.round(ty * 9) + i) % 7 === 0) b = mix(b, G.leafLt, 0.35);
        return b;
      });
    });
    ell(put, cx - S * 0.04, S * 0.66, S * 0.045, S * 0.05, function () { return P.barkDk; });
  }

  function dWillow(put, S) {
    var cx = S * 0.5;
    for (var y = Math.round(S * 0.5); y < Math.round(S * 0.95); y++)
      row(put, y, cx - S * 0.05, cx + S * 0.05, function (tx) { return mix(P.barkLt, P.barkDk, 0.3 + tx * 0.5); });
    ell(put, cx, S * 0.32, S * 0.34, S * 0.2, function (tx, ty) { return mix(G.leaf, G.leafDk, clamp(ty * 1.1, 0, 1)); });
    for (var i = -4; i <= 4; i++) {
      var vx = cx + i * S * 0.085;
      var len = S * (0.34 + ((i + 9) % 3) * 0.09);
      stroke(put, vx, S * 0.36, vx + Math.sin(i) * 2, S * 0.36 + len, 1.6, function (t) { return mix(G.leafLt, G.leafDk, t); });
    }
  }

  function dToadstool(put, S) {
    var cx = S * 0.5;
    for (var y = Math.round(S * 0.5); y < Math.round(S * 0.92); y++) {
      var t = (y - S * 0.5) / (S * 0.42);
      var hw = S * (0.1 + 0.03 * Math.sin(t * Math.PI));
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(G.cream, G.creamDk, t);
        if (tx > 0.7) b = mix(b, G.creamDk, 0.5);
        return b;
      });
    }
    for (var cy = Math.round(S * 0.14); cy < Math.round(S * 0.54); cy++) {
      var ct = (cy - S * 0.14) / (S * 0.4);
      var chw = S * 0.42 * Math.sin(clamp(0.15 + ct * 0.85, 0, 1) * Math.PI * 0.62);
      row(put, cy, cx - chw, cx + chw, function (tx) {
        var b = mix(G.capRedLt, G.capRed, clamp(ct * 1.3, 0, 1));
        if (tx < 0.16) b = mix(b, G.capRedLt, 0.5);
        if (tx > 0.86) b = mix(b, G.capRedDk, 0.4);
        return b;
      });
    }
    [[-0.24, 0.26, 0.06], [0.05, 0.2, 0.07], [0.28, 0.32, 0.05], [-0.06, 0.4, 0.045]].forEach(function (sp) {
      ell(put, cx + sp[0] * S, S * sp[1], S * sp[2], S * sp[2] * 0.8, function () { return G.cream; });
    });
  }

  function dFairyRing(put, S) {
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 4.5) {
      var mx = S * 0.5 + Math.cos(a) * S * 0.32, my = S * 0.62 + Math.sin(a) * S * 0.2;
      row(put, Math.round(my), mx - 2, mx + 2, function () { return G.cream; });
      row(put, Math.round(my) - 1, mx - 2, mx + 2, function () { return G.cream; });
      ell(put, mx, my - 3, S * 0.05, S * 0.03, function (tx, ty) {
        return mix(a % 2 < 1 ? G.capRedLt : G.glowLt, a % 2 < 1 ? G.capRed : G.glow, ty);
      });
    }
    for (var i = 0; i < 22; i++) {
      var a2 = i * 1.7, r2 = (i % 5) * S * 0.045;
      var x = Math.round(S * 0.5 + Math.cos(a2) * r2), y = Math.round(S * 0.62 + Math.sin(a2) * r2 * 0.6);
      if ((x + y) % 3 === 0) put(x, y, G.glowDk);
    }
  }

  function dLilyPond(put, S) {
    ell(put, S * 0.5, S * 0.62, S * 0.4, S * 0.26, function (tx, ty) {
      var b = mix(DC.waterLt, DC.water, clamp(ty * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, DC.waterDk, 0.5);
      return b;
    });
    ell(put, S * 0.5, S * 0.62, S * 0.34, S * 0.2, function (tx, ty) { return mix(DC.water, DC.waterDk, ty * 0.7); });
    stroke(put, S * 0.3, S * 0.56, S * 0.44, S * 0.53, 1, function () { return DC.waterLt; });
    stroke(put, S * 0.56, S * 0.7, S * 0.7, S * 0.68, 1, function () { return DC.waterLt; });
    [[0.36, 0.62], [0.62, 0.56], [0.55, 0.72]].forEach(function (p2) {
      ell(put, S * p2[0], S * p2[1], S * 0.07, S * 0.04, function (tx, ty) { return mix(G.leafLt, G.leaf, ty); });
    });
    ell(put, S * 0.62, S * 0.55, S * 0.03, S * 0.02, function () { return G.pixieLt; });
    put(Math.round(S * 0.62), Math.round(S * 0.54), G.pixie);
  }

  function dBoulders(put, S) {
    [[0.36, 0.66, 0.22, 0.17], [0.66, 0.72, 0.16, 0.12], [0.52, 0.5, 0.13, 0.1]].forEach(function (B) {
      ell(put, S * B[0], S * B[1], S * B[2], S * B[3], function (tx, ty) {
        var b = mix(G.stone, G.stoneDk, clamp(ty * 1.1, 0, 1));
        if (tx < 0.25) b = mix(b, G.stoneLt, 0.5);
        return b;
      });
    });
    [[0.3, 0.58, 0.08], [0.55, 0.44, 0.06], [0.66, 0.66, 0.07]].forEach(function (M2) {
      ell(put, S * M2[0], S * M2[1], S * M2[2], S * M2[2] * 0.6, function (tx, ty) { return mix(G.mossLt2, G.moss2, ty); });
    });
  }

  function dHollowStump(put, S) {
    var cx = S * 0.5;
    for (var y = Math.round(S * 0.42); y < Math.round(S * 0.88); y++) {
      var t = (y - S * 0.42) / (S * 0.46);
      var hw = S * (0.2 + t * 0.05);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(P.barkLt, P.bark, 0.3 + t * 0.55);
        if (Math.abs(tx - 0.3) < 0.06 || Math.abs(tx - 0.72) < 0.05) b = mix(b, P.barkDk, 0.5);
        return b;
      });
    }
    ell(put, cx, S * 0.42, S * 0.21, S * 0.08, function (tx, ty) { return mix(G.creamDk, G.cream, tx); });
    for (var r2 = 1; r2 <= 2; r2++)
      for (var a = 0; a < Math.PI * 2; a += 0.35)
        put(Math.round(cx + Math.cos(a) * S * 0.055 * r2), Math.round(S * 0.42 + Math.sin(a) * S * 0.02 * r2), G.creamDk);
    ell(put, cx, S * 0.44, S * 0.07, S * 0.035, function (tx, ty) { return mix(G.glowLt, G.glow, ty); });
    put(Math.round(cx + S * 0.1), Math.round(S * 0.35), G.glowLt);
  }

  function dFlowerBed(put, S) {
    ell(put, S * 0.5, S * 0.68, S * 0.38, S * 0.2, function (tx, ty) { return mix(G.moss2, G.leafDkk, ty * 0.8); });
    var cols = [G.pixie, G.honey, G.glowLt, G.pixieLt, '#f4f4f4'];
    for (var i = 0; i < 16; i++) {
      var fx = S * 0.18 + (i * 37 % Math.round(S * 0.64));
      var fy = S * 0.54 + (i * 23 % Math.round(S * 0.26));
      stroke(put, fx, fy + 4, fx, fy, 1, function () { return G.leaf; });
      put(Math.round(fx), Math.round(fy), cols[i % cols.length]);
      put(Math.round(fx) + 1, Math.round(fy), cols[(i + 2) % cols.length]);
    }
  }

  function dLanterns(put, S) {
    stroke(put, S * 0.2, S * 0.9, S * 0.24, S * 0.2, S * 0.035, function (t) { return mix(P.bark, P.barkDk, t); });
    stroke(put, S * 0.24, S * 0.24, S * 0.82, S * 0.34, S * 0.025, function (t) { return mix(P.bark, P.woodDk, t); });
    [[0.4, 0.28, G.honey, G.honeyLt], [0.58, 0.31, G.glow, G.glowLt], [0.74, 0.33, G.pixie, G.pixieLt]].forEach(function (L) {
      var lx = S * L[0], ly = S * L[1] + S * 0.1;
      stroke(put, lx, ly - S * 0.08, lx, ly - S * 0.03, 1, function () { return G.creamDk; });
      ell(put, lx, ly, S * 0.045, S * 0.055, function (tx, ty) { return mix(L[3], L[2], ty); });
      row(put, Math.round(ly - S * 0.055), lx - 2, lx + 2, function () { return P.woodDk; });
    });
  }

  function dStoneArch(put, S) {
    [-1, 1].forEach(function (s) {
      var px = S * 0.5 + s * S * 0.26;
      for (var y = Math.round(S * 0.34); y < Math.round(S * 0.9); y++) {
        row(put, y, px - S * 0.06, px + S * 0.06, function (tx) {
          var b = mix(G.stoneLt, G.stone, 0.3 + tx * 0.5);
          if (y % 7 === 0) b = mix(b, G.stoneDk, 0.5);
          return b;
        });
      }
    });
    for (var a = Math.PI; a <= Math.PI * 2; a += 0.06) {
      var x = S * 0.5 + Math.cos(a) * S * 0.26, y = S * 0.34 + Math.sin(a) * S * 0.18;
      for (var w2 = -3; w2 <= 3; w2++) put(Math.round(x), Math.round(y + w2), mix(G.stoneLt, G.stone, Math.abs(w2) / 3));
    }
    [[0.28, 0.5], [0.72, 0.66], [0.5, 0.19]].forEach(function (M2) {
      ell(put, S * M2[0], S * M2[1], S * 0.05, S * 0.03, function (tx, ty) { return mix(G.mossLt2, G.moss2, ty); });
    });
  }

  function dRunestone(put, S) {
    var cx = S * 0.5;
    for (var y = Math.round(S * 0.18); y < Math.round(S * 0.9); y++) {
      var t = (y - S * 0.18) / (S * 0.72);
      var hw = S * (0.13 + t * 0.07) * (t < 0.1 ? 0.6 + t * 4 : 1);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(G.stoneLt, G.stone, 0.25 + t * 0.5);
        if (tx > 0.78) b = mix(b, G.stoneDk, 0.5);
        return b;
      });
    }
    [[0, 0.32], [0.04, 0.46], [-0.05, 0.6], [0.02, 0.74]].forEach(function (R2, i) {
      var rx = cx + R2[0] * S, ry = S * R2[1];
      stroke(put, rx - 3, ry, rx + 3, ry, 1, function () { return G.glow; });
      if (i % 2) stroke(put, rx, ry - 3, rx, ry + 3, 1, function () { return G.glow; });
      else stroke(put, rx - 2, ry - 3, rx + 2, ry + 3, 1, function () { return G.glowLt; });
    });
    ell(put, cx, S * 0.9, S * 0.2, S * 0.05, function (tx, ty) { return mix(G.moss2, G.leafDkk, ty); });
  }

  function dMossyLog(put, S) {
    for (var y = Math.round(S * 0.52); y < Math.round(S * 0.74); y++) {
      var t = Math.abs(y - S * 0.63) / (S * 0.11);
      row(put, y, S * 0.1, S * 0.9, function (tx) {
        var b = mix(P.barkLt, P.bark, 0.2 + t * 0.7);
        if ((Math.round(tx * 40) + y) % 9 === 0) b = mix(b, P.barkDk, 0.5);
        return b;
      });
    }
    ell(put, S * 0.1, S * 0.63, S * 0.035, S * 0.11, function (tx, ty) { return mix(G.cream, G.creamDk, ty); });
    [[0.3, 0.5], [0.62, 0.72], [0.78, 0.52]].forEach(function (M2) {
      ell(put, S * M2[0], S * M2[1], S * 0.08, S * 0.045, function (tx, ty) { return mix(G.mossLt2, G.moss2, ty); });
    });
    ell(put, S * 0.4, S * 0.47, S * 0.035, S * 0.025, function (tx, ty) { return mix(G.capRedLt, G.capRed, ty); });
  }

  function dWispSpring(put, S) {
    ell(put, S * 0.5, S * 0.72, S * 0.24, S * 0.13, function (tx, ty) { return mix(G.stoneLt, G.stoneDk, ty); });
    ell(put, S * 0.5, S * 0.7, S * 0.17, S * 0.08, function (tx, ty) { return mix(G.glowLt, DC.water, ty); });
    for (var a = 0; a < Math.PI * 2; a += 0.5)
      put(Math.round(S * 0.5 + Math.cos(a) * S * 0.22), Math.round(S * 0.72 + Math.sin(a) * S * 0.12), G.stone);
    [[0.46, 0.56], [0.54, 0.46], [0.48, 0.34], [0.56, 0.24]].forEach(function (M2, i) {
      put(Math.round(S * M2[0]), Math.round(S * M2[1]), i % 2 ? G.glowLt : G.glow);
    });
  }

  function dObelisk(put, S) {
    var cx = S * 0.52;
    for (var y = Math.round(S * 0.26); y < Math.round(S * 0.9); y++) {
      var t = (y - S * 0.26) / (S * 0.64);
      var hw = S * (0.11 + t * 0.04);
      row(put, y, cx - hw, cx + hw, function (tx) {
        var b = mix(G.stoneLt, G.stone, 0.25 + t * 0.5);
        if (y % 9 === 0) b = mix(b, G.stoneDk, 0.5);
        if (tx > 0.8) b = mix(b, G.stoneDk, 0.4);
        return b;
      });
    }
    for (var x2 = -4; x2 <= 4; x2++) put(Math.round(cx + x2 * 1.6), Math.round(S * 0.26 - Math.abs(x2 % 3)), G.stoneLt);
    for (var seg = 0; seg <= 12; seg++) {
      var t2 = seg / 12;
      var x = cx + Math.sin(t2 * Math.PI * 2.4) * S * 0.1, y2 = S * 0.88 - t2 * S * 0.56;
      put(Math.round(x), Math.round(y2), G.leaf);
      if (seg % 3 === 0) ell(put, x + 2, y2, S * 0.028, S * 0.02, function () { return G.leafLt; });
    }
  }

  // The FALLEN TRUNK — the falling-tree hazard's lingering wall (horizontal).
  function drawFallenTrunk(put, W, H) {
    var midY = H * 0.52;
    // main log body
    for (var y = Math.round(H * 0.18); y < Math.round(H * 0.86); y++) {
      var t = Math.abs(y - midY) / (H * 0.34);
      for (var x = Math.round(W * 0.03); x < Math.round(W * 0.97); x++) {
        var grain = ((x * 5 + y * 3) % 23) < 3;
        var b = mix(P.barkLt, P.bark, clamp(0.2 + t * 0.7, 0, 1));
        if (grain) b = mix(b, P.barkDk, 0.45);
        if (y < H * 0.3) b = mix(b, P.barkLt, 0.3);
        put(x, y, b);
      }
    }
    // sawn ring end (left)
    ell(put, W * 0.05, midY, W * 0.035, H * 0.32, function (tx, ty) { return mix(G.cream, G.creamDk, ty); });
    for (var r2 = 1; r2 <= 3; r2++) {
      for (var a = 0; a < Math.PI * 2; a += 0.4) {
        put(Math.round(W * 0.05 + Math.cos(a) * W * 0.008 * r2), Math.round(midY + Math.sin(a) * H * 0.09 * r2), G.creamDk);
      }
    }
    // splintered end (right)
    for (var sy2 = Math.round(H * 0.2); sy2 < Math.round(H * 0.84); sy2 += 3) {
      var len = 3 + ((sy2 * 7) % 6);
      row(put, sy2, W * 0.96, W * 0.96 + len, function () { return G.creamDk; });
    }
    // branch stubs + moss
    stroke(put, W * 0.3, H * 0.2, W * 0.33, H * 0.02, H * 0.1, function (t) { return mix(P.bark, P.barkDk, t); });
    stroke(put, W * 0.68, H * 0.84, W * 0.72, H * 0.98, H * 0.09, function (t) { return mix(P.bark, P.barkDk, t); });
    [[0.2, 0.3, 0.06], [0.52, 0.72, 0.07], [0.82, 0.32, 0.05]].forEach(function (mp) {
      ell(put, W * mp[0], H * mp[1], W * mp[2], H * 0.12, function (tx, ty) { return mix(G.mossLt2, G.moss2, ty); });
    });
  }


  // ==========================================================================
  // M5.6 — THE GRAVEYARD (biome 3, user picks 2026-07-15): moonlit cemetery,
  // gothic dread. Roster of 8 (Ghoul · Rattlebones · Bone Archer · Tomb Golem ·
  // Corpse Bloater · Banshee · Mummy · Necro Acolyte), THE GRAVEKEEPER boss + a
  // GRIM REAPER, 17 planned decor props, and graveyard ground/path tiles.
  // Ported faithfully from the approved concept renders (artdev/graveyard/*.py):
  // those draw on an 80-grid, so every function scales by u = S/80 and reuses a
  // small parity toolkit (gyRect/gyDisc/gyEll/gyLine/gyShell/gyLimb/gyEye) that
  // mirrors the python primitives. Outline is added by textures.js (spr).
  // ==========================================================================
  var GY = {
    bone:  ['#b0a47e', '#e6dcc0', '#f7f1dc'],
    ghoul: ['#585c64', '#8a8e96', '#b8bcc4'],
    rot:   ['#36522e', '#688c4a', '#96b66e'],
    rot2:  ['#465c3a', '#7a965c', '#a8c480'],
    ghost: ['#568492', '#96ced6', '#d8f4f8'],
    ecto:  ['#1e7858', '#5cd696', '#beffd2'],
    stone: ['#4a4e5c', '#787c8a', '#aaaebe'],
    stone2:['#3c3e4a', '#626674', '#9296a6'],
    dirt:  ['#3e2c1e', '#624630', '#866646'],
    moss:  ['#2c4a2a', '#547a40', '#789e5a'],
    purp:  ['#382252', '#644286', '#9a70be'],
    band:  ['#968a68', '#cabe98', '#e4dab8'],
    gold:  ['#966e28', '#d6a842', '#fade78'],
    wood:  ['#48321f', '#6e4c30', '#926c42'],
    dwood: ['#282016', '#42321f', '#604a30'],
    sheet: ['#9696a6', '#c8c8d6', '#eeeef6'],
    cloth: ['#282836', '#424256', '#64647c'],
    iron:  ['#1c1e28', '#343746', '#5c6074'],
    robe:  ['#1a140e', '#302620', '#4a3c2e'],
    darkc: ['#0a0a0e', '#16141a', '#26242c'],
    leath: ['#3a2618', '#5c4028', '#7e5c3a'],
    hole:  '#14101c', eye: '#12131f',
    grn:   '#96ff96', red: '#e84642', cy: '#96f0eb',
    org:   '#ff962c', orgLt: '#ffd682', purGlow: '#be78ff', runG: '#78ff96', runP: '#b060ec',
    white: '#f4f4fa', gas: '#78dc96'
  };

  // ---- 80-grid parity toolkit (coords are already S-scaled by the caller) ----
  function gyRect(put, x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    if (x1 < x0) { var t = x0; x0 = x1; x1 = t; } if (y1 < y0) { var s = y0; y0 = y1; y1 = s; }
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) put(x, y, c);
  }
  function gyDisc(put, cx, cy, r, c) { ell(put, cx, cy, r, r, function () { return c; }); }
  function gyEll(put, cx, cy, rx, ry, c) { ell(put, cx, cy, rx, ry, function () { return c; }); }
  function gyLine(put, x0, y0, x1, y1, c, w) { stroke(put, x0, y0, x1, y1, (w || 1), function () { return c; }); }
  function gyShell(put, cx, cy, rx, ry, ramp, lx, ly) {
    lx = (lx == null ? -0.66 : lx); ly = (ly == null ? -0.66 : ly);
    var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry), x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var nx = (x - cx) / rx, ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1.0) { var d = nx * lx + ny * ly; put(x, y, d > 0.34 ? ramp[2] : (d < -0.30 ? ramp[0] : ramp[1])); }
    }
  }
  function gyLimb(put, x0, y0, x1, y1, r, ramp) {
    stroke(put, x0, y0, x1, y1, r * 2, function () { return ramp[0]; });
    stroke(put, x0, y0, x1, y1, Math.max(r * 2 - 1.4, 1), function () { return ramp[1]; });
    stroke(put, x0 - 0.6, y0 - 0.6, x1 - 0.6, y1 - 0.6, Math.max(r * 2 - 3, 0.8), function () { return ramp[2]; });
  }
  function gyEye(put, x, y, c, r) { r = r || 1.4; gyDisc(put, x, y, r, c); put(Math.round(x - 0.5), Math.round(y - 0.5), '#ffffff'); }

  // ----------------------------------------------------- GRAVEYARD MOBS ------
  // GHOUL (#2) — fast lunger: hunched grey body, long clawed arms, red eyes.
  function drawGhoul(put, S) {
    var u = S / 80, G2 = GY.ghoul;
    gyLimb(put, 34 * u, 52 * u, 30 * u, 70 * u, 3 * u, G2); gyLimb(put, 46 * u, 52 * u, 50 * u, 70 * u, 3 * u, G2);
    gyShell(put, 40 * u, 46 * u, 11 * u, 11 * u, G2);
    for (var i = 0; i < 4; i++) gyDisc(put, (34 + i) * u, (40 - i * 0.5) * u, 1.3 * u, G2[0]);
    gyLimb(put, 31 * u, 42 * u, 20 * u, 62 * u, 3 * u, G2); gyLimb(put, 49 * u, 42 * u, 58 * u, 60 * u, 3 * u, G2);
    [[20, 62, -1], [58, 60, 1]].forEach(function (c) {
      for (var j = 0; j < 3; j++) gyLine(put, c[0] * u, c[1] * u, (c[0] + c[2] * 3) * u, (c[1] + 4 + j * 1.5) * u, '#d2d2dc', 1);
    });
    gyShell(put, 40 * u, 34 * u, 7 * u, 6 * u, G2);
    gyLine(put, 33 * u, 36 * u, 47 * u, 36 * u, GY.hole, 1.2);
    for (var xx = 34; xx < 47; xx += 2) { put(Math.round(xx * u), Math.round(36 * u), '#e6e6eb'); put(Math.round(xx * u), Math.round(37 * u), '#e6e6eb'); }
    gyEye(put, 36 * u, 32 * u, GY.red); gyEye(put, 44 * u, 32 * u, GY.red);
  }

  // RATTLEBONES (#3) — swarm skeleton: spine + ribs, skull, green eye-glow.
  function drawSkeletonBody(put, u) {
    gyRect(put, 39 * u, 32 * u, 41 * u, 52 * u, GY.bone[1]);        // spine
    for (var i = 0, ry = 35; ry < 50; i++, ry += 3) {
      var w = 8 - i;
      gyLine(put, 40 * u, ry * u, (40 - w) * u, (ry + 3) * u, GY.bone[0], 1);
      gyLine(put, 41 * u, ry * u, (41 + w) * u, (ry + 3) * u, GY.bone[0], 1);
    }
    gyShell(put, 40 * u, 50 * u, 6 * u, 4 * u, GY.bone);            // pelvis
  }
  function drawRattlebones(put, S) {
    var u = S / 80;
    drawSkeletonBody(put, u);
    gyLimb(put, 35 * u, 34 * u, 26 * u, 48 * u, 2 * u, GY.bone); gyLimb(put, 45 * u, 34 * u, 54 * u, 48 * u, 2 * u, GY.bone);
    gyDisc(put, 26 * u, 48 * u, 1.6 * u, GY.bone[1]); gyDisc(put, 54 * u, 48 * u, 1.6 * u, GY.bone[1]);
    gyLimb(put, 37 * u, 53 * u, 34 * u, 70 * u, 2.2 * u, GY.bone); gyLimb(put, 43 * u, 53 * u, 46 * u, 70 * u, 2.2 * u, GY.bone);
    gyShell(put, 40 * u, 25 * u, 7 * u, 7 * u, GY.bone);            // skull
    gyDisc(put, 36 * u, 25 * u, 1.7 * u, GY.hole); gyDisc(put, 44 * u, 25 * u, 1.7 * u, GY.hole);
    put(Math.round(36 * u), Math.round(24 * u), GY.grn); put(Math.round(44 * u), Math.round(24 * u), GY.grn);
    gyDisc(put, 36 * u, 24 * u, 1.1, GY.grn); gyDisc(put, 44 * u, 24 * u, 1.1, GY.grn);
    gyRect(put, 39 * u, 27 * u, 41 * u, 29 * u, GY.hole);
    for (var xx = 36; xx < 45; xx += 2) put(Math.round(xx * u), Math.round(31 * u), GY.hole);
  }

  // BONE ARCHER (#4) — skeleton drawing a wooden bow, arrow nocked, green eyes.
  function drawBoneArcher(put, S) {
    var u = S / 80;
    gyLimb(put, 38 * u, 52 * u, 34 * u, 70 * u, 2.2 * u, GY.bone); gyLimb(put, 44 * u, 52 * u, 48 * u, 70 * u, 2.2 * u, GY.bone);
    gyRect(put, 39 * u, 32 * u, 41 * u, 52 * u, GY.bone[1]);
    for (var i = 0, ry = 35; ry < 49; i++, ry += 3) { var w = 7 - i; gyLine(put, 41 * u, ry * u, (41 + w) * u, (ry + 3) * u, GY.bone[0], 1); }
    gyShell(put, 40 * u, 25 * u, 7 * u, 7 * u, GY.bone);
    gyDisc(put, 37 * u, 25 * u, 1.6 * u, GY.hole); gyDisc(put, 44 * u, 25 * u, 1.6 * u, GY.hole);
    put(Math.round(37 * u), Math.round(24 * u), GY.grn); put(Math.round(44 * u), Math.round(24 * u), GY.grn);
    gyDisc(put, 37 * u, 24 * u, 1, GY.grn); gyDisc(put, 44 * u, 24 * u, 1, GY.grn);
    for (var xx = 37; xx < 45; xx += 2) put(Math.round(xx * u), Math.round(30 * u), GY.hole);
    gyLimb(put, 36 * u, 34 * u, 22 * u, 40 * u, 2 * u, GY.bone);    // bow arm
    for (var a = -9; a <= 9; a++) { var yy = 40 + a, bx = 18 + (1 - (a / 10) * (a / 10)) * 4; put(Math.round(bx * u), Math.round(yy * u), GY.wood[1]); put(Math.round((bx - 1) * u), Math.round(yy * u), GY.wood[0]); }
    gyLine(put, 18 * u, 31 * u, 18 * u, 49 * u, '#dcdcdc', 1);      // string
    gyLimb(put, 44 * u, 34 * u, 30 * u, 42 * u, 2 * u, GY.bone);    // draw arm
    gyLine(put, 20 * u, 40 * u, 40 * u, 40 * u, GY.wood[2], 1); gyDisc(put, 20 * u, 40 * u, 1.2 * u, '#e6e6e6');
    put(Math.round(41 * u), Math.round(39 * u), GY.gold[1]); put(Math.round(41 * u), Math.round(41 * u), GY.gold[1]);
  }

  // TOMB GOLEM (#7) — regen tank: stone body, embedded RIP headstone, moss, green eyes.
  function drawTombGolem(put, S) {
    var u = S / 80, ST = GY.stone, S2 = GY.stone2;
    gyRect(put, 30 * u, 58 * u, 50 * u, 71 * u, ST[0]);
    gyShell(put, 40 * u, 46 * u, 15 * u, 15 * u, ST);
    gyRect(put, 26 * u, 40 * u, 54 * u, 58 * u, ST[1]);
    gyLine(put, 34 * u, 42 * u, 38 * u, 56 * u, S2[0], 1); gyLine(put, 46 * u, 40 * u, 44 * u, 54 * u, S2[0], 1); gyLine(put, 40 * u, 44 * u, 40 * u, 58 * u, S2[0], 1);
    gyRect(put, 44 * u, 30 * u, 56 * u, 44 * u, S2[1]); gyRect(put, 44 * u, 30 * u, 56 * u, 33 * u, S2[2]);   // headstone shoulder
    put(Math.round(49 * u), Math.round(36 * u), GY.hole); put(Math.round(50 * u), Math.round(36 * u), GY.hole);
    gyRect(put, 20 * u, 42 * u, 28 * u, 60 * u, ST[1]); gyRect(put, 52 * u, 42 * u, 60 * u, 60 * u, ST[1]);   // slab arms
    gyRect(put, 20 * u, 42 * u, 22 * u, 60 * u, ST[2]); gyRect(put, 58 * u, 42 * u, 60 * u, 60 * u, ST[0]);
    gyRect(put, 34 * u, 26 * u, 46 * u, 38 * u, ST[1]); gyRect(put, 34 * u, 26 * u, 46 * u, 28 * u, ST[2]);   // head
    gyEye(put, 37 * u, 32 * u, GY.grn); gyEye(put, 43 * u, 32 * u, GY.grn);
    for (var xx = 28; xx < 53; xx += 2) put(Math.round(xx * u), Math.round(40 * u), GY.moss[1]);
    for (var hx = 35; hx < 46; hx += 2) put(Math.round(hx * u), Math.round(26 * u), GY.moss[1]);
    gyDisc(put, 30 * u, 41 * u, 1.5 * u, GY.moss[0]); gyDisc(put, 50 * u, 41 * u, 1.5 * u, GY.moss[1]);
  }

  // CORPSE BLOATER (#9) — death gas burst: huge bruised belly, glowing cracks, gas.
  function drawCorpseBloater(put, S) {
    var u = S / 80;
    gyLimb(put, 33 * u, 58 * u, 31 * u, 70 * u, 2.4 * u, GY.rot); gyLimb(put, 47 * u, 58 * u, 49 * u, 70 * u, 2.4 * u, GY.rot);
    gyShell(put, 40 * u, 48 * u, 16 * u, 15 * u, GY.rot2);
    [[33, 44, 3], [48, 50, 3.5], [40, 55, 3], [45, 42, 2.5], [34, 54, 2]].forEach(function (b) { gyDisc(put, b[0] * u, b[1] * u, b[2] * u, '#463060'); });
    gyLine(put, 36 * u, 40 * u, 44 * u, 58 * u, '#78ff96', 1); gyLine(put, 44 * u, 44 * u, 50 * u, 54 * u, '#78ff96', 1);
    gyShell(put, 40 * u, 30 * u, 6 * u, 6 * u, GY.rot); gyEye(put, 37 * u, 30 * u, GY.grn); gyRect(put, 42 * u, 29 * u, 44 * u, 31 * u, GY.hole);
    gyLine(put, 36 * u, 34 * u, 44 * u, 35 * u, '#1e321e', 1);
    gyLimb(put, 26 * u, 44 * u, 20 * u, 54 * u, 2 * u, GY.rot2); gyLimb(put, 54 * u, 44 * u, 60 * u, 52 * u, 2 * u, GY.rot2);
    [[24, 38, 4], [56, 40, 4], [40, 20, 5]].forEach(function (g) { gyDisc(put, g[0] * u, g[1] * u, g[2] * u, GY.gas); });
  }

  // BANSHEE (#10) — wail cone: streaming ghost gown, hollow eyes, sound rings.
  function drawBanshee(put, S) {
    var u = S / 80, GH = GY.ghost;
    for (var yy = 30; yy < 64; yy++) {
      var t = (yy - 30) / 34, w = Math.round(5 + t * 16);
      gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, GH[1]);
      gyRect(put, (40 - w) * u, yy * u, (40 - w + 2) * u, yy * u, GH[2]); gyRect(put, (40 + w - 2) * u, yy * u, (40 + w) * u, yy * u, GH[0]);
    }
    [-8, -5, 5, 8].forEach(function (hx) { gyLine(put, (40 + hx) * u, 26 * u, (40 + hx * 2) * u, 44 * u, GH[2], 1); });
    gyShell(put, 40 * u, 26 * u, 7 * u, 8 * u, ['#96b2c4', '#c8dee6', '#e8f5fa']);
    gyDisc(put, 37 * u, 25 * u, 1.6 * u, GY.hole); gyDisc(put, 43 * u, 25 * u, 1.6 * u, GY.hole);
    gyEll(put, 40 * u, 31 * u, 2 * u, 3 * u, GY.hole);
    gyLimb(put, 28 * u, 40 * u, 20 * u, 52 * u, 2 * u, GH); gyLimb(put, 52 * u, 40 * u, 60 * u, 52 * u, 2 * u, GH);
    for (var ri = 0; ri < 3; ri++) { var r = 12 + ri * 4; for (var a = -40; a <= 40; a += 6) { var rx = 58 + r * Math.cos(a * Math.PI / 180), rry = 30 + r * Math.sin(a * Math.PI / 180); put(Math.round(rx * u), Math.round(rry * u), '#c8f0fa'); } }
    // fade the hem
    for (var fy = 58; fy < 64; fy++) { var f = (64 - fy) / 6; for (var fx = 24; fx < 56; fx++) { if (Math.random() < 1 - f) continue; } }
  }

  // MUMMY (#16) — curse tank: wrapped bandages, trailing wrap, orange eye-slit, amulet.
  function drawMummy(put, S) {
    var u = S / 80, B = GY.band;
    gyLimb(put, 35 * u, 54 * u, 33 * u, 71 * u, 3 * u, B); gyLimb(put, 45 * u, 54 * u, 47 * u, 71 * u, 3 * u, B);
    gyShell(put, 40 * u, 46 * u, 11 * u, 14 * u, B);
    for (var yy = 34; yy < 60; yy += 3) gyLine(put, 30 * u, yy * u, 50 * u, (yy + 1) * u, B[0], 1);
    gyLimb(put, 30 * u, 40 * u, 18 * u, 44 * u, 3 * u, B); gyLimb(put, 50 * u, 40 * u, 62 * u, 44 * u, 3 * u, B);
    gyDisc(put, 18 * u, 44 * u, 2.4 * u, B[1]); gyDisc(put, 62 * u, 44 * u, 2.4 * u, B[1]);
    gyLine(put, 62 * u, 44 * u, 68 * u, 54 * u, B[2], 1); gyLine(put, 64 * u, 44 * u, 70 * u, 50 * u, B[1], 1);
    gyShell(put, 40 * u, 30 * u, 8 * u, 8 * u, B);
    for (var hy = 24; hy < 37; hy += 3) gyLine(put, 32 * u, hy * u, 48 * u, (hy + 1) * u, B[0], 1);
    gyRect(put, 35 * u, 30 * u, 45 * u, 32 * u, GY.hole); put(Math.round(38 * u), Math.round(31 * u), GY.org); put(Math.round(42 * u), Math.round(31 * u), GY.org);
    gyDisc(put, 38 * u, 31 * u, 1, GY.orgLt); gyDisc(put, 42 * u, 31 * u, 1, GY.orgLt);
    gyDisc(put, 40 * u, 42 * u, 2.4 * u, GY.gold[1]); put(Math.round(40 * u), Math.round(42 * u), GY.gold[2]); gyDisc(put, 40 * u, 42 * u, 1, GY.grn);
  }

  // NECRO ACOLYTE (#18) — raises corpses: purple robe, hooded, green tome glow.
  function drawNecroAcolyte(put, S) {
    var u = S / 80, PU = GY.purp;
    for (var yy = 28; yy < 64; yy++) {
      var t = (yy - 28) / 36, w = Math.round(5 + t * 15);
      gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, PU[1]);
      gyRect(put, (40 - w) * u, yy * u, (40 - w + 2) * u, yy * u, PU[2]); gyRect(put, (40 + w - 2) * u, yy * u, (40 + w) * u, yy * u, PU[0]);
    }
    gyShell(put, 40 * u, 28 * u, 9 * u, 9 * u, PU);
    gyEll(put, 40 * u, 30 * u, 5 * u, 6 * u, GY.hole);
    put(Math.round(38 * u), Math.round(30 * u), GY.grn); put(Math.round(42 * u), Math.round(30 * u), GY.grn);
    gyDisc(put, 38 * u, 30 * u, 1, GY.grn); gyDisc(put, 42 * u, 30 * u, 1, GY.grn);
    for (var bx = 28; bx < 53; bx += 3) put(Math.round(bx * u), Math.round(44 * u), GY.bone[2]);
    gyLimb(put, 30 * u, 40 * u, 38 * u, 48 * u, 3 * u, PU); gyLimb(put, 50 * u, 40 * u, 42 * u, 48 * u, 3 * u, PU);
    gyRect(put, 36 * u, 44 * u, 44 * u, 52 * u, GY.wood[1]); gyRect(put, 36 * u, 44 * u, 44 * u, 45 * u, GY.wood[2]);   // tome
    gyDisc(put, 40 * u, 48 * u, 2.6 * u, '#78ff96'); gyDisc(put, 40 * u, 48 * u, 4 * u, '#3ca868');
    [[40, 40], [34, 42], [46, 42]].forEach(function (r) { put(Math.round(r[0] * u), Math.round(r[1] * u), GY.grn); });
  }

  // ------------------------------------------------ THE GRAVEKEEPER (boss) ---
  // Faceless hood + burning orange eyes, tattered brown robes, rune sashes,
  // keyring, green-flame iron lantern, skull-faced Necronomicon. 96px canvas.
  function drawGravekeeper(put, S) {
    var u = S / 80, RB = GY.robe, DK = GY.darkc, LE = GY.leath, IR = GY.iron;
    // lower drape shadow
    for (var y = 40; y < 77; y++) { var t = (y - 40) / 37, w = Math.round(9 + t * 15); var cut = ((Math.floor(y / 2)) % 2) * (y > 66 ? 3 : 0); gyRect(put, (40 - w + cut) * u, y * u, (40 + w - cut) * u, y * u, DK[1]); }
    // main robe
    for (var y2 = 30; y2 < 75; y2++) {
      var t2 = (y2 - 30) / 45, w2 = Math.round(8 + t2 * 13), cut2 = 0;
      if (y2 > 66) cut2 = ((Math.floor(y2 / 2)) % 2 ? 0 : 4) + ((Math.floor(y2 / 3)) % 2 ? 3 : 0);
      gyRect(put, (40 - w2 + cut2) * u, y2 * u, (40 + w2 - cut2) * u, y2 * u, RB[1]);
      gyRect(put, (40 - w2 + cut2) * u, y2 * u, (40 - w2 + cut2 + 2) * u, y2 * u, RB[2]);
      gyRect(put, (40 + w2 - cut2 - 2) * u, y2 * u, (40 + w2 - cut2) * u, y2 * u, RB[0]);
    }
    // center dark drape
    for (var y3 = 44; y3 < 76; y3++) { var t3 = (y3 - 44) / 32, w3 = Math.round(3 + t3 * 5); gyRect(put, (40 - w3) * u, y3 * u, (40 + w3) * u, y3 * u, DK[1]); }
    // rune sashes (purple + green)
    [[34, GY.runP], [46, GY.runG]].forEach(function (sx) {
      for (var y = 34; y < 70; y++) { put(Math.round(sx[0] * u), Math.round(y * u), LE[0]); put(Math.round((sx[0] + 1) * u), Math.round(y * u), LE[1]); }
      for (var yg = 37; yg < 68; yg += 4) { put(Math.round(sx[0] * u), Math.round(yg * u), sx[1]); put(Math.round((sx[0] + 1) * u), Math.round(yg * u), sx[1]); }
    });
    // shoulder cape
    for (var y4 = 28; y4 < 46; y4++) { var t4 = (y4 - 28) / 18, w4 = Math.round(11 + t4 * 4); var cut4 = y4 > 40 ? ((Math.floor(y4 / 2)) % 2 ? 0 : 3) : 0; gyRect(put, (40 - w4 + cut4) * u, y4 * u, (40 + w4 - cut4) * u, y4 * u, DK[1]); gyRect(put, (40 - w4 + cut4) * u, y4 * u, (40 - w4 + cut4 + 2) * u, y4 * u, DK[2]); }
    gyRect(put, 32 * u, 29 * u, 48 * u, 32 * u, DK[2]);      // collar
    // chest straps X + belt
    gyLine(put, 32 * u, 34 * u, 48 * u, 48 * u, LE[1], 1); gyLine(put, 48 * u, 34 * u, 32 * u, 48 * u, LE[1], 1);
    gyRect(put, 30 * u, 49 * u, 50 * u, 53 * u, LE[1]); gyRect(put, 30 * u, 49 * u, 50 * u, 50 * u, LE[2]);
    gyRect(put, 38 * u, 49 * u, 42 * u, 53 * u, GY.gold[1]); gyRect(put, 39 * u, 50 * u, 41 * u, 52 * u, GY.gold[0]);   // buckle
    gyRect(put, 44 * u, 50 * u, 50 * u, 58 * u, LE[1]); gyRect(put, 30 * u, 51 * u, 35 * u, 57 * u, LE[0]);            // pouches
    // keyring
    gyDisc(put, 50 * u, 56 * u, 2.4 * u, GY.gold[1]);
    [[52, 58], [54, 57], [53, 60]].forEach(function (k) { gyLine(put, 50 * u, 57 * u, k[0] * u, k[1] * u, GY.gold[0], 1); gyDisc(put, k[0] * u, k[1] * u, 1, GY.gold[1]); });
    // boots
    gyRect(put, 33 * u, 72 * u, 39 * u, 77 * u, RB[0]); gyRect(put, 41 * u, 72 * u, 47 * u, 77 * u, RB[0]);
    // right arm + lantern
    gyLimb(put, 49 * u, 36 * u, 55 * u, 56 * u, 3 * u, RB); gyDisc(put, 55 * u, 57 * u, 2.2 * u, LE[1]);
    gyRect(put, 51 * u, 60 * u, 59 * u, 72 * u, IR[0]); gyRect(put, 52 * u, 61 * u, 58 * u, 71 * u, IR[1]);
    gyRect(put, 53 * u, 63 * u, 57 * u, 70 * u, '#183c2a'); gyDisc(put, 55 * u, 67 * u, 2 * u, '#78ff96'); gyDisc(put, 55 * u, 67 * u, 3.4 * u, '#3ca868');
    gyRect(put, 51 * u, 59 * u, 59 * u, 61 * u, IR[2]); gyRect(put, 50 * u, 72 * u, 60 * u, 74 * u, IR[0]);
    // left arm raised + Necronomicon
    gyLimb(put, 31 * u, 36 * u, 20 * u, 34 * u, 3 * u, RB); gyDisc(put, 18 * u, 34 * u, 2.4 * u, LE[1]);
    gyRect(put, 10 * u, 24 * u, 26 * u, 40 * u, LE[0]); gyRect(put, 11 * u, 23 * u, 25 * u, 39 * u, LE[1]);
    gyRect(put, 17 * u, 23 * u, 19 * u, 39 * u, LE[0]);      // open spine
    gyRect(put, 13 * u, 25 * u, 17 * u, 37 * u, GY.bone[2]); gyRect(put, 19 * u, 25 * u, 23 * u, 37 * u, GY.bone[1]);   // pages
    gyShell(put, 15 * u, 30 * u, 3 * u, 3 * u, GY.bone); gyDisc(put, 14 * u, 30 * u, 0.9, GY.red); gyDisc(put, 16 * u, 30 * u, 0.9, GY.red); put(Math.round(15 * u), Math.round(32 * u), GY.hole);
    for (var ry = 26; ry < 37; ry += 3) { put(Math.round(21 * u), Math.round(ry * u), GY.runP); put(Math.round(22 * u), Math.round((ry + 1) * u), GY.runG); }
    for (var cy = 40; cy < 50; cy += 2) gyDisc(put, 12 * u, cy * u, 1, IR[2]);   // chain
    for (var j = 0, fy = 22; fy > 10; j++, fy -= 2) { gyDisc(put, 17 * u, fy * u, (2.6 - j * 0.3) * u, '#78ff96'); gyDisc(put, (15 + (j % 2) * 3) * u, (fy - 1) * u, 1.4 * u, '#beffd2'); }
    gyDisc(put, 17 * u, 15 * u, 2 * u, '#beffd2');
    // hood
    for (var hy = 10; hy < 34; hy++) { var ht = (hy - 10) / 24, hw = Math.round(3 + ht * 11); gyRect(put, (40 - hw) * u, hy * u, (40 + hw) * u, hy * u, RB[1]); gyRect(put, (40 - hw) * u, hy * u, (40 - hw + 2) * u, hy * u, RB[2]); gyRect(put, (40 + hw - 2) * u, hy * u, (40 + hw) * u, hy * u, RB[0]); }
    for (var i2 = 0, py = 6; py < 12; i2++, py++) gyRect(put, (40 - i2) * u, py * u, (40 + i2) * u, py * u, RB[1]);
    gyEll(put, 40 * u, 23 * u, 5 * u, 7 * u, '#09080c');     // face void
    [[37, -1], [43, 1]].forEach(function (ex) { gyDisc(put, ex[0] * u, 23 * u, 1.6 * u, GY.org); put(Math.round(ex[0] * u), Math.round(22 * u), GY.orgLt); gyDisc(put, ex[0] * u, 23 * u, 2.8 * u, '#5a3a12'); gyDisc(put, ex[0] * u, 23 * u, 1.4 * u, GY.org); });
  }

  // GRIM REAPER — Reaper's March: tall black cloak, hollow hood, green scythe.
  function drawReaper(put, S) {
    var u = S / 80, DK = GY.darkc;
    for (var y = 22; y < 74; y++) {
      var t = (y - 22) / 52, w = Math.round(5 + t * 16), cut = y > 64 ? ((Math.floor(y / 2)) % 2 ? 0 : 4) : 0;
      gyRect(put, (40 - w + cut) * u, y * u, (40 + w - cut) * u, y * u, DK[1]);
      gyRect(put, (40 - w + cut) * u, y * u, (40 - w + cut + 2) * u, y * u, DK[2]); gyRect(put, (40 + w - cut - 2) * u, y * u, (40 + w - cut) * u, y * u, DK[0]);
    }
    // hood
    for (var hy = 12; hy < 30; hy++) { var ht = (hy - 12) / 18, hw = Math.round(3 + ht * 8); gyRect(put, (40 - hw) * u, hy * u, (40 + hw) * u, hy * u, DK[1]); }
    for (var i2 = 0, py = 8; py < 13; i2++, py++) gyRect(put, (40 - i2) * u, py * u, (40 + i2) * u, py * u, DK[1]);
    gyEll(put, 40 * u, 22 * u, 4 * u, 6 * u, '#050508');
    gyDisc(put, 38 * u, 22 * u, 1.4 * u, GY.grn); gyDisc(put, 42 * u, 22 * u, 1.4 * u, GY.grn);
    gyDisc(put, 38 * u, 22 * u, 2.6 * u, '#2a6a3a'); gyDisc(put, 42 * u, 22 * u, 2.6 * u, '#2a6a3a'); gyDisc(put, 38 * u, 22 * u, 1.2 * u, GY.grn); gyDisc(put, 42 * u, 22 * u, 1.2 * u, GY.grn);
    // bony hands
    gyDisc(put, 24 * u, 46 * u, 2 * u, GY.bone[1]); gyDisc(put, 56 * u, 44 * u, 2 * u, GY.bone[1]);
    // scythe: long snath + green blade
    gyLine(put, 58 * u, 60 * u, 60 * u, 12 * u, GY.wood[1], 1.4);
    for (var a = 200; a <= 320; a += 6) { var bx = 60 + 16 * Math.cos(a * Math.PI / 180), by = 14 + 12 * Math.sin(a * Math.PI / 180); gyDisc(put, bx * u, by * u, 1.4 * u, '#78ff96'); gyDisc(put, bx * u, by * u, 0.9, '#beffd2'); }
  }

  // -------------------------------------------------- GRAVEYARD TILE + PATH --
  // Seamless dark cemetery ground — packed earth + patchy dead grass (hash scatter).
  function drawGraveGround(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var h = ((x * 7 + y * 13) * 31 + x * y) % 100;
      var b = '#2a2e26';
      if (h < 30) b = '#242820'; else if (h < 55) b = '#30342a'; else if (h < 70) b = '#2e2a22';
      if (h > 92) b = '#3a4030';                       // dead-grass fleck
      if (h > 97) b = '#4a4038';                       // pebble
      put(x, y, b);
    }
  }
  // Winding lantern path tile — pale packed dirt (drawn as a band by the scene).
  function drawGravePath(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var h = ((x * 11 + y * 5) * 17 + x * y) % 100;
      var b = '#5a4a36';
      if (h < 35) b = '#4e4030'; else if (h < 60) b = '#645034'; else if (h > 90) b = '#6e5a3e';
      put(x, y, b);
    }
  }

  // ------------------------------------------------- GRAVEYARD DECOR (17) ----
  // All 64px props. Ported from render_decor.py (u = S/80). moss_top/slab shared.
  function gyMossTop(put, u, x0, x1, y) { for (var xx = Math.round(x0); xx < Math.round(x1); xx += 2) { if ((xx * 5) % 3 === 0) { put(Math.round(xx * u), Math.round(y * u), GY.moss[1]); put(Math.round((xx + 1) * u), Math.round((y - 1) * u), GY.moss[0]); } } }
  function gySlab(put, u, cx, w, ytop, ybot, ramp, roundTop) {
    ramp = ramp || GY.stone; roundTop = (roundTop !== false);
    for (var y = Math.round(ytop); y <= Math.round(ybot); y++) {
      var ww = w;
      if (roundTop && y < ytop + w) { var dy = ytop + w - y; ww = (w * w - dy * dy > 0) ? Math.round(Math.sqrt(w * w - dy * dy)) : 0; }
      gyRect(put, (cx - ww) * u, y * u, (cx + ww) * u, y * u, ramp[1]);
      gyRect(put, (cx - ww) * u, y * u, (cx - ww + 2) * u, y * u, ramp[2]); gyRect(put, (cx + ww - 2) * u, y * u, (cx + ww) * u, y * u, ramp[0]);
    }
  }
  // 1 HEADSTONE
  function dHeadstone(put, S) { var u = S / 80; gyRect(put, 26 * u, 66 * u, 54 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 28, 52, 66); gySlab(put, u, 40, 13, 32, 68, GY.stone, true); gyLine(put, 44 * u, 40 * u, 42 * u, 60 * u, GY.stone2[0], 1); gyRect(put, 34 * u, 40 * u, 46 * u, 42 * u, GY.hole); gyRect(put, 35 * u, 46 * u, 45 * u, 48 * u, GY.hole); gyRect(put, 34 * u, 52 * u, 46 * u, 54 * u, GY.hole); gyMossTop(put, u, 29, 51, 34); }
  // 2 CROSS GRAVE
  function dCrossGrave(put, S) { var u = S / 80; for (var yy = 58; yy < 72; yy++) { var w = Math.round(6 + (yy - 58) * 1.4); gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, GY.dirt[1]); } gyMossTop(put, u, 26, 54, 58); gyRect(put, 36 * u, 24 * u, 44 * u, 60 * u, GY.stone[1]); gyRect(put, 28 * u, 34 * u, 52 * u, 42 * u, GY.stone[1]); gyRect(put, 36 * u, 24 * u, 38 * u, 60 * u, GY.stone[2]); gyRect(put, 42 * u, 26 * u, 44 * u, 60 * u, GY.stone[0]); gyDisc(put, 40 * u, 33 * u, 2 * u, GY.stone[2]); gyMossTop(put, u, 37, 43, 50); }
  // 3 BROKEN STONE
  function dBrokenStone(put, S) { var u = S / 80; gyRect(put, 22 * u, 66 * u, 58 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 24, 56, 66); gySlab(put, u, 32, 10, 50, 68, GY.stone, false); gyLine(put, 26 * u, 54 * u, 40 * u, 50 * u, GY.stone2[0], 1); gyLine(put, 40 * u, 50 * u, 34 * u, 58 * u, GY.stone2[0], 1); for (var yy = 60; yy < 68; yy++) gyRect(put, 44 * u, yy * u, 66 * u, yy * u, GY.stone[1]); gyRect(put, 44 * u, 60 * u, 66 * u, 62 * u, GY.stone[2]); gyRect(put, 44 * u, 66 * u, 66 * u, 68 * u, GY.stone[0]); }
  // 4 CRYPT / MAUSOLEUM (landmark)
  function dCrypt(put, S) { var u = S / 80; gyRect(put, 16 * u, 64 * u, 64 * u, 71 * u, GY.stone[0]); gyRect(put, 18 * u, 34 * u, 62 * u, 66 * u, GY.stone[1]); gyRect(put, 18 * u, 34 * u, 20 * u, 66 * u, GY.stone[2]); gyRect(put, 60 * u, 34 * u, 62 * u, 66 * u, GY.stone[0]); for (var i = 0, yy = 22; yy < 34; i++, yy++) { var w = Math.round((yy - 22) * 1.9 + 4); gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, GY.stone[1]); } gyRect(put, 39 * u, 12 * u, 41 * u, 24 * u, GY.stone2[2]); gyRect(put, 35 * u, 15 * u, 45 * u, 18 * u, GY.stone2[2]); [24, 56].forEach(function (cxx) { gyRect(put, (cxx - 2) * u, 36 * u, (cxx + 2) * u, 64 * u, GY.stone[2]); gyRect(put, (cxx + 1) * u, 36 * u, (cxx + 2) * u, 64 * u, GY.stone[0]); }); for (var dy = 44; dy < 66; dy++) { var dw = dy > 48 ? 6 : Math.round((dy - 44) * 1.4); gyRect(put, (40 - dw) * u, dy * u, (40 + dw) * u, dy * u, '#12101a'); } put(Math.round(44 * u), Math.round(56 * u), GY.grn); gyMossTop(put, u, 20, 60, 36); }
  // 5 IRON GATE (entrance anchor)
  function dIronGate(put, S) { var u = S / 80, IR = GY.iron; [18, 62].forEach(function (cxx) { gyRect(put, (cxx - 5) * u, 30 * u, (cxx + 5) * u, 70 * u, GY.stone[1]); gyRect(put, (cxx - 5) * u, 30 * u, (cxx - 3) * u, 70 * u, GY.stone[2]); gyRect(put, (cxx - 6) * u, 26 * u, (cxx + 6) * u, 30 * u, GY.stone[2]); gyDisc(put, cxx * u, 22 * u, 4 * u, GY.stone2[1]); }); for (var a = 180; a <= 360; a += 4) { var ax = 40 + 22 * Math.cos(a * Math.PI / 180), ay = 30 + 14 * Math.sin(a * Math.PI / 180); put(Math.round(ax * u), Math.round(ay * u), IR[2]); put(Math.round(ax * u), Math.round((ay + 1) * u), IR[1]); } for (var bx = 26; bx < 55; bx += 5) { gyRect(put, bx * u, 32 * u, (bx + 1) * u, 68 * u, IR[1]); put(Math.round(bx * u), Math.round(30 * u), IR[2]); } gyRect(put, 24 * u, 46 * u, 56 * u, 48 * u, IR[1]); gyRect(put, 24 * u, 60 * u, 56 * u, 62 * u, IR[1]); }
  // 6 IRON FENCE (destructible wall divider)
  // IRON FENCE — DESTRUCTIBLE (user 2026-07-15): three damage states swap in as
  // you shoot it. dmg 0 = intact · 1 = bent, a bar gone, spears knocked · 2 =
  // mangled, half the bars gone/leaning, top rail snapped, rubble at the base.
  function drawFence(put, S, dmg) {
    var u = S / 80, IR = GY.iron;
    var gone = dmg >= 2 ? { 16: 1, 37: 1, 58: 1 } : (dmg >= 1 ? { 51: 1 } : {});
    var bent = dmg >= 2 ? { 23: 5, 44: -4, 65: 4 } : (dmg >= 1 ? { 30: 3, 16: -3 } : {});
    for (var bx = 16; bx < 66; bx += 7) {
      if (gone[bx]) continue;
      var lean = bent[bx] || 0;
      if (lean) {                                          // a bent bar (leaned, spear gone)
        gyLine(put, bx * u, 70 * u, (bx + lean) * u, 41 * u, IR[1], 1.8);
        put(Math.round((bx + lean) * u), Math.round(41 * u), IR[2]);
      } else {                                             // an intact bar + spear top
        gyRect(put, bx * u, 40 * u, (bx + 1) * u, 70 * u, IR[1]);
        put(Math.round(bx * u), Math.round(40 * u), IR[2]);
        if (dmg < 2) { put(Math.round(bx * u), Math.round(36 * u), IR[2]); put(Math.round((bx - 1) * u), Math.round(38 * u), IR[2]); put(Math.round((bx + 1) * u), Math.round(38 * u), IR[2]); }
      }
    }
    // rails — the top rail snaps when mangled
    if (dmg >= 2) { gyRect(put, 14 * u, 46 * u, 34 * u, 48 * u, IR[1]); gyLine(put, 34 * u, 47 * u, 42 * u, 52 * u, IR[0], 1.4); }
    else gyRect(put, 14 * u, 46 * u, 66 * u, 48 * u, IR[1]);
    gyRect(put, 14 * u, 62 * u, 66 * u, 64 * u, IR[1]);     // bottom rail holds
    gyRect(put, 16 * u, 68 * u, 66 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 16, 66, 68);
    if (dmg >= 2) { [[24, 68], [40, 70], [54, 69]].forEach(function (rb) { gyDisc(put, rb[0] * u, rb[1] * u, 1.6 * u, IR[0]); }); }  // rubble
  }
  function dIronFence(put, S) { drawFence(put, S, 0); }
  function dIronFenceD1(put, S) { drawFence(put, S, 1); }
  function dIronFenceD2(put, S) { drawFence(put, S, 2); }
  // VERTICAL fence — the fence seen down its length (a north-south divider):
  // you look at the TOP of it. A continuous double top-rail runs down the tile;
  // spear finials poke out to both sides at each post. Same 3 damage states.
  function drawFenceTop(put, S, dmg) {
    var u = S / 80, IR = GY.iron;
    var gone = dmg >= 2 ? { 20: 1, 44: 1 } : (dmg >= 1 ? { 36: 1 } : {});
    var bent = dmg >= 2 ? { 28: 4, 52: -3 } : (dmg >= 1 ? { 60: 3 } : {});
    // the top rail runs down the middle (double line = readable width)
    gyRect(put, 38 * u, 10 * u, 42 * u, 70 * u, IR[1]);
    gyRect(put, 38 * u, 10 * u, 39 * u, 70 * u, IR[2]);   // lit left edge
    gyRect(put, 41 * u, 10 * u, 42 * u, 70 * u, IR[0]);   // shade right edge
    // posts down the run — a cap block + spear tips poking left & right
    for (var py = 12; py < 70; py += 8) {
      if (gone[py]) continue;
      var lean = bent[py] || 0;
      var cy = py, cxL = 33 + lean, cxR = 47 + lean;
      gyRect(put, 36 * u, cy * u, 44 * u, (cy + 2) * u, IR[1]);       // cap block across the rail
      gyRect(put, 36 * u, cy * u, 44 * u, (cy + 1) * u, IR[2]);       // lit top of cap
      if (dmg < 2 || !lean) {                                        // spear finials to the sides
        put(Math.round(cxL * u), Math.round((cy + 1) * u), IR[2]); put(Math.round((cxL - 1) * u), Math.round((cy + 1) * u), IR[1]);
        put(Math.round(cxR * u), Math.round((cy + 1) * u), IR[2]); put(Math.round((cxR + 1) * u), Math.round((cy + 1) * u), IR[1]);
      }
    }
    // faint iron shadow either side of the rail
    gyRect(put, 35 * u, 10 * u, 36 * u, 70 * u, IR[0]);
    gyRect(put, 44 * u, 10 * u, 45 * u, 70 * u, IR[0]);
    if (dmg >= 2) {                                                  // a snapped, leaning section + rubble
      gyLine(put, 40 * u, 38 * u, 50 * u, 46 * u, IR[1], 1.8);
      [[33, 30], [48, 52], [40, 62]].forEach(function (rb) { gyDisc(put, rb[0] * u, rb[1] * u, 1.6 * u, IR[0]); });
    }
  }
  function dIronFenceTop(put, S) { drawFenceTop(put, S, 0); }
  function dIronFenceTopD1(put, S) { drawFenceTop(put, S, 1); }
  function dIronFenceTopD2(put, S) { drawFenceTop(put, S, 2); }
  // 7 DEAD TREE (canopy anchor)
  function dDeadTree(put, S) { var u = S / 80, DW = GY.dwood; gyRect(put, 26 * u, 64 * u, 54 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 28, 52, 64); gyLimb(put, 40 * u, 68 * u, 40 * u, 34 * u, 4 * u, DW); gyLimb(put, 40 * u, 66 * u, 30 * u, 70 * u, 2 * u, DW); gyLimb(put, 40 * u, 66 * u, 50 * u, 70 * u, 2 * u, DW); [[40, 44, 24, 30], [40, 40, 56, 26], [40, 36, 44, 18], [40, 48, 52, 40], [40, 50, 28, 44]].forEach(function (b) { gyLimb(put, b[0] * u, b[1] * u, b[2] * u, b[3] * u, 2 * u, DW); gyLine(put, b[2] * u, b[3] * u, (b[2] - 4) * u, (b[3] - 4) * u, DW[0], 1); gyLine(put, b[2] * u, b[3] * u, (b[2] + 4) * u, (b[3] - 3) * u, DW[0], 1); }); gyDisc(put, 40 * u, 40 * u, 3 * u, DW[0]); }
  // 10 COFFIN
  function dCoffin(put, S) { var u = S / 80, DW = GY.dwood, IR = GY.iron; gyRect(put, 20 * u, 66 * u, 60 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 22, 58, 66); gyRect(put, 26 * u, 44 * u, 54 * u, 64 * u, DW[1]); [[26, 44, 22, 52], [22, 52, 26, 64], [54, 44, 58, 52], [58, 52, 54, 64]].forEach(function (e) { gyLine(put, e[0] * u, e[1] * u, e[2] * u, e[3] * u, DW[1], 1.4); }); for (var yy = 44; yy < 65; yy++) { gyRect(put, 22 * u, yy * u, 26 * u, yy * u, DW[1]); gyRect(put, 54 * u, yy * u, 58 * u, yy * u, DW[1]); } gyRect(put, 26 * u, 44 * u, 54 * u, 47 * u, DW[2]); gyRect(put, 26 * u, 61 * u, 54 * u, 64 * u, DW[0]); gyRect(put, 34 * u, 44 * u, 36 * u, 64 * u, IR[1]); gyRect(put, 44 * u, 44 * u, 46 * u, 64 * u, IR[1]); gyLine(put, 26 * u, 54 * u, 54 * u, 54 * u, '#78ff96', 1); gyDisc(put, 40 * u, 40 * u, 3 * u, GY.gold[1]); put(Math.round(40 * u), Math.round(40 * u), GY.grn); }
  // 11 ANGEL STATUE (landmark)
  function dAngel(put, S) { var u = S / 80, ANG = ['#686e7c', '#969caa', '#c4c8d6']; gyRect(put, 26 * u, 60 * u, 54 * u, 71 * u, GY.stone[0]); gyRect(put, 28 * u, 54 * u, 52 * u, 62 * u, GY.stone[1]); gyRect(put, 28 * u, 54 * u, 30 * u, 62 * u, GY.stone[2]); for (var yy = 36; yy < 58; yy++) { var w = Math.round(4 + (yy - 36) * 0.5); gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, ANG[1]); gyRect(put, (40 - w) * u, yy * u, (40 - w + 1) * u, yy * u, ANG[2]); gyRect(put, (40 + w - 1) * u, yy * u, (40 + w) * u, yy * u, ANG[0]); } [-1, 1].forEach(function (side) { for (var i = 0; i < 5; i++) { gyLine(put, 40 * u, 38 * u, (40 + side * (6 + i * 2)) * u, (30 - i * 2) * u, ANG[2], 1); gyLine(put, 40 * u, 40 * u, (40 + side * (7 + i * 2)) * u, (36 - i) * u, ANG[0], 1); } }); gyDisc(put, 40 * u, 32 * u, 4 * u, ANG[1]); for (var a = 0; a < 360; a += 30) put(Math.round((40 + 6 * Math.cos(a * Math.PI / 180)) * u), Math.round((28 + 3 * Math.sin(a * Math.PI / 180)) * u), GY.gold[1]); gyLimb(put, 34 * u, 42 * u, 44 * u, 50 * u, 2 * u, ANG); gyLimb(put, 46 * u, 42 * u, 38 * u, 50 * u, 2 * u, ANG); gyMossTop(put, u, 29, 51, 54); }
  // 12 OBELISK (tall monument)
  function dObeliskGY(put, S) { var u = S / 80; gyRect(put, 30 * u, 64 * u, 50 * u, 71 * u, GY.stone[0]); gyRect(put, 33 * u, 58 * u, 47 * u, 66 * u, GY.stone[1]); gyRect(put, 33 * u, 58 * u, 35 * u, 66 * u, GY.stone[2]); for (var yy = 20; yy < 58; yy++) { var t = (yy - 20) / 38, w = Math.round(3 + t * 5); gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, GY.stone[1]); gyRect(put, (40 - w) * u, yy * u, (40 - w + 1) * u, yy * u, GY.stone[2]); gyRect(put, (40 + w - 1) * u, yy * u, (40 + w) * u, yy * u, GY.stone[0]); } for (var i = 0, py = 14; py < 20; i++, py++) gyRect(put, (40 - i) * u, py * u, (40 + i) * u, py * u, GY.stone[2]); put(Math.round(40 * u), Math.round(13 * u), GY.gold[2]); gyLine(put, 41 * u, 30 * u, 39 * u, 50 * u, GY.stone2[0], 1); gyMossTop(put, u, 33, 47, 64); }
  // 13 SARCOPHAGUS (tomb)
  function dSarcophagus(put, S) { var u = S / 80, S2 = GY.stone2; gyRect(put, 18 * u, 66 * u, 62 * u, 71 * u, GY.stone[0]); gyRect(put, 20 * u, 52 * u, 60 * u, 68 * u, GY.stone[1]); gyRect(put, 20 * u, 52 * u, 22 * u, 68 * u, GY.stone[2]); gyRect(put, 58 * u, 52 * u, 60 * u, 68 * u, GY.stone[0]); gyRect(put, 18 * u, 46 * u, 62 * u, 54 * u, GY.stone[2]); gyRect(put, 18 * u, 46 * u, 62 * u, 48 * u, '#c8ccda'); gyDisc(put, 40 * u, 44 * u, 3 * u, S2[2]); gyRect(put, 36 * u, 47 * u, 44 * u, 52 * u, S2[1]); gyLimb(put, 36 * u, 48 * u, 40 * u, 50 * u, 1 * u, S2); gyLimb(put, 44 * u, 48 * u, 40 * u, 50 * u, 1 * u, S2); for (var xx = 24; xx < 57; xx += 4) put(Math.round(xx * u), Math.round(60 * u), GY.hole); gyMossTop(put, u, 20, 58, 52); }
  // 15 LAMP POST (light source)
  function dLampPost(put, S) { var u = S / 80, IR = GY.iron; gyRect(put, 34 * u, 66 * u, 46 * u, 71 * u, GY.stone[0]); gyRect(put, 38 * u, 30 * u, 42 * u, 68 * u, IR[1]); gyRect(put, 38 * u, 30 * u, 39 * u, 68 * u, IR[2]); gyLine(put, 40 * u, 32 * u, 40 * u, 26 * u, IR[1], 1); gyRect(put, 34 * u, 20 * u, 46 * u, 32 * u, IR[0]); gyRect(put, 36 * u, 22 * u, 44 * u, 30 * u, '#183c2a'); gyDisc(put, 40 * u, 26 * u, 3 * u, '#78ff96'); gyDisc(put, 40 * u, 26 * u, 4.5 * u, '#3ca868'); gyRect(put, 35 * u, 18 * u, 45 * u, 20 * u, IR[1]); put(Math.round(40 * u), Math.round(16 * u), IR[2]); gyDisc(put, 40 * u, 68 * u, 7 * u, '#2e4a34'); }
  // 16 CANDLES (offering light)
  function dCandles(put, S) { var u = S / 80; gyRect(put, 26 * u, 64 * u, 54 * u, 71 * u, GY.stone[1]); gyRect(put, 26 * u, 64 * u, 54 * u, 66 * u, GY.stone[2]); [[34, 20], [40, 24], [46, 18], [30, 12], [50, 12]].forEach(function (c) { var top = 64 - c[1]; gyRect(put, (c[0] - 2) * u, top * u, (c[0] + 2) * u, 64 * u, '#e0dcce'); gyRect(put, (c[0] - 2) * u, top * u, (c[0] - 1) * u, 64 * u, '#f5f2e8'); gyLine(put, c[0] * u, top * u, c[0] * u, (top - 2) * u, '#281e14', 1); gyDisc(put, c[0] * u, (top - 3) * u, 1.6 * u, '#ffd278'); put(Math.round(c[0] * u), Math.round((top - 4) * u), '#fff5c8'); }); }
  // 17 CELTIC CROSS (monument)
  function dCelticCross(put, S) { var u = S / 80, S2 = GY.stone2; for (var yy = 60; yy < 72; yy++) { var w = Math.round(6 + (yy - 60)); gyRect(put, (40 - w) * u, yy * u, (40 + w) * u, yy * u, GY.dirt[1]); } gyMossTop(put, u, 28, 52, 60); gyRect(put, 37 * u, 20 * u, 43 * u, 64 * u, GY.stone[1]); gyRect(put, 37 * u, 20 * u, 39 * u, 64 * u, GY.stone[2]); gyRect(put, 26 * u, 32 * u, 54 * u, 38 * u, GY.stone[1]); gyRect(put, 26 * u, 32 * u, 54 * u, 34 * u, GY.stone[2]); for (var a = 0; a < 360; a += 6) { put(Math.round((40 + 11 * Math.cos(a * Math.PI / 180)) * u), Math.round((35 + 11 * Math.sin(a * Math.PI / 180)) * u), GY.stone[2]); put(Math.round((40 + 8 * Math.cos(a * Math.PI / 180)) * u), Math.round((35 + 8 * Math.sin(a * Math.PI / 180)) * u), GY.stone[0]); } gyDisc(put, 40 * u, 35 * u, 2 * u, S2[2]); for (var ky = 42; ky < 60; ky += 4) gyRect(put, 38 * u, ky * u, 42 * u, ky * u, S2[0]); }
  // 18 DEAD WREATH (offering)
  function dWreath(put, S) { var u = S / 80; gySlab(put, u, 40, 8, 54, 70, GY.stone, false); gyRect(put, 34 * u, 50 * u, 46 * u, 52 * u, GY.hole); for (var a = 0; a < 360; a += 10) { var wx = 40 + 11 * Math.cos(a * Math.PI / 180), wy = 44 + 11 * Math.sin(a * Math.PI / 180); gyDisc(put, wx * u, wy * u, 2 * u, GY.moss[0]); if (a % 30 === 0) gyDisc(put, wx * u, wy * u, 1.6 * u, '#966070'); } for (var a2 = 0; a2 < 360; a2 += 16) put(Math.round((40 + 11 * Math.cos(a2 * Math.PI / 180)) * u), Math.round((44 + 11 * Math.sin(a2 * Math.PI / 180)) * u), GY.moss[1]); gyRect(put, 26 * u, 66 * u, 54 * u, 71 * u, GY.dirt[1]); gyMossTop(put, u, 28, 52, 66); }
  // 19 COBWEB (corner accent)
  function dCobweb(put, S) { var u = S / 80, web = '#c0c4d0', cx = 20, cy = 20; for (var a = 0; a < 95; a += 12) { var ex = cx + 56 * Math.cos(a * Math.PI / 180), ey = cy + 56 * Math.sin(a * Math.PI / 180); gyLine(put, cx * u, cy * u, ex * u, ey * u, web, 1); } for (var r = 10; r < 58; r += 9) { for (var a2 = 0; a2 < 92; a2 += 4) { put(Math.round((cx + r * Math.cos(a2 * Math.PI / 180)) * u), Math.round((cy + r * Math.sin(a2 * Math.PI / 180)) * u), web); } } gyDisc(put, 44 * u, 44 * u, 3 * u, '#1e1a28'); put(Math.round(43 * u), Math.round(44 * u), GY.red); put(Math.round(45 * u), Math.round(44 * u), GY.red); }
  // 20 GRAVE FUNGUS (glow clutter)
  function dGraveFungus(put, S) { var u = S / 80, DW = GY.dwood; gyRect(put, 20 * u, 64 * u, 60 * u, 70 * u, DW[1]); gyRect(put, 20 * u, 64 * u, 60 * u, 66 * u, DW[2]); gyMossTop(put, u, 22, 58, 64); gyEll(put, 24 * u, 64 * u, 4 * u, 3 * u, DW[0]); [[32, 52, 6], [44, 48, 7], [52, 56, 5], [38, 60, 4], [26, 58, 4]].forEach(function (c) { gyRect(put, (c[0] - 1) * u, c[1] * u, (c[0] + 1) * u, 64 * u, '#d2d7cd'); gyShell(put, c[0] * u, c[1] * u, c[2] * u, c[2] * 0.7 * u, GY.ecto); gyDisc(put, c[0] * u, c[1] * u, c[2] * 0.4 * u, '#d2ffe1'); gyDisc(put, c[0] * u, c[1] * u, (c[2] + 2) * u, '#3ca868'); }); }

  var API = {
    P: P,
    drawSlime: drawSlime, drawBrute: drawBrute, drawSpitter: drawSpitter, drawWarlock: drawWarlock, drawBoss: drawBoss,
    drawGravel: drawGravel, drawYardWall: drawYardWall, drawTrack: drawTrack, drawTunnel: drawTunnel, drawLoco: drawLoco,
    drawGrainCar: drawGrainCar, drawBoxcar: drawBoxcar, drawConductor: drawConductor,
    drawCoalGolem: drawCoalGolem, drawBoxcarBrute: drawBoxcarBrute,
    drawConductorZombie: drawConductorZombie, drawCrossingCreep: drawCrossingCreep,
    drawFurnaceImp: drawFurnaceImp, drawCouplingChomper: drawCouplingChomper,
    drawDynamiteMole: drawDynamiteMole, drawSmogSerpent: drawSmogSerpent,
    // M5.0 — THE GROVE
    G: G,
    drawPuffcap: drawPuffcap, drawPuffcapMini: drawPuffcapMini, drawPixie: drawPixie,
    drawMossGolem: drawMossGolem, drawSeedlingTurret: drawSeedlingTurret,
    drawSnapdragon: drawSnapdragon, drawBumblebrute: drawBumblebrute,
    drawBumblebruteMini: drawBumblebruteMini, drawMoonmoth: drawMoonmoth,
    drawGroveGrass: drawGroveGrass, drawGroveWall: drawGroveWall,
    drawGroveTree: drawGroveTree, drawGlowShroom: drawGlowShroom,
    drawHeartwood: drawHeartwood, drawFallenTrunk: drawFallenTrunk,
    // grove decor picks (2026-07-15): 1 3 4 5 6 7 8 9 10 11 12 13 17 19
    dAncientOak: dAncientOak, dWillow: dWillow, dToadstool: dToadstool,
    dFairyRing: dFairyRing, dLilyPond: dLilyPond, dBoulders: dBoulders,
    dHollowStump: dHollowStump, dFlowerBed: dFlowerBed, dLanterns: dLanterns,
    dStoneArch: dStoneArch, dRunestone: dRunestone, dMossyLog: dMossyLog,
    dWispSpring: dWispSpring,
    dObelisk: dObelisk,
    // M5.6 — THE GRAVEYARD
    GY: GY,
    drawGhoul: drawGhoul, drawRattlebones: drawRattlebones, drawBoneArcher: drawBoneArcher,
    drawTombGolem: drawTombGolem, drawCorpseBloater: drawCorpseBloater, drawBanshee: drawBanshee,
    drawMummy: drawMummy, drawNecroAcolyte: drawNecroAcolyte,
    drawGravekeeper: drawGravekeeper, drawReaper: drawReaper,
    drawGraveGround: drawGraveGround, drawGravePath: drawGravePath,
    dHeadstone: dHeadstone, dCrossGrave: dCrossGrave, dBrokenStone: dBrokenStone,
    dCrypt: dCrypt, dIronGate: dIronGate, dIronFence: dIronFence, dDeadTree: dDeadTree,
    dCoffin: dCoffin, dAngel: dAngel, dObeliskGY: dObeliskGY, dSarcophagus: dSarcophagus,
    dIronFenceD1: dIronFenceD1, dIronFenceD2: dIronFenceD2,
    dIronFenceTop: dIronFenceTop, dIronFenceTopD1: dIronFenceTopD1, dIronFenceTopD2: dIronFenceTopD2,
    dLampPost: dLampPost, dCandles: dCandles, dCelticCross: dCelticCross,
    dWreath: dWreath, dCobweb: dCobweb, dGraveFungus: dGraveFungus
  };

  // ============================================================================
  // M5.7 THE ROBOTICS FACTORY — art ported from artdev/factory/* (approved).
  // Wrapped in an isolated IIFE so its local palette/helpers cannot collide with
  // the module-scope names above. Merged into API via Object.assign below.
  // ============================================================================
  var FACTORY_ART = (function () {
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;
const F = {
  OUT: '#141620',
  chrome: '#eef2f7', chromeMd: '#b8c2d0',
  steelLt: '#c7cdd6', steel: '#8a94a6', steelMd: '#697386', steelDk: '#454e63', steelDkk: '#2b3245',
  iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a',
  gun: '#3d4456', gunDk: '#242a38',
  brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
  copper: '#e08b4c', copperLt: '#ffbf8a', copperDk: '#9c5222',
  hazard: '#ffcd45', hazardDk: '#20212c',
  cyan: '#41d6f6', cyanLt: '#c2fbff', cyanDk: '#1f78a8',
  blue: '#5f8bde', blueLt: '#a8c8ff', blueDk: '#2f4f9c',
  red: '#ff4b3e', redLt: '#ffb0a0', redDk: '#9e2422',
  green: '#5fe86b', greenLt: '#c8ffc2', greenDk: '#2b9e3a',
  molten: '#ff7d3a', moltenLt: '#ffd34d', moltenDk: '#c23a1a', ember: '#ff5a2a',
  rubber: '#2a2d38', rubberLt: '#474c5e', rubberDk: '#16171d',
  glass: '#16233d', glassLt: '#3a5f96',
  white: '#f4f4f4', purple: '#a06bd6', purpleLt: '#d6b8ff',
  rust: '#a5623a', rustDk: '#653a20', oil: '#101119',
  labcoat: '#f0f2f6', labcoatDk: '#c2c8d4', labShadow: '#a9b0be', skin: '#e8b796', skinDk: '#c68a63',
  hairW: '#eef1f6', hairWDk: '#b8c0cc'
};

function plate(put, x0, y0, x1, y1, base, hi, dk) {
  x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
  for (let y = y0; y < y1; y++) {
    const vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
    row(put, y, x0, x1, (tx) => {
      let b = mix(hi, base, clamp(vt * 1.15, 0, 1));
      b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
      if (tx < 0.13) b = mix(b, hi, 0.55);
      if (tx > 0.9) b = mix(b, dk, 0.5);
      return b;
    });
  }
}
function dome(put, cx, cy, rx, ry, base, hi, dk) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    let b = mix(hi, base, clamp(ty * 1.25, 0, 1));
    b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
    if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
    if (tx > 0.82) b = mix(b, dk, 0.4);
    return b;
  });
}
function bolt(put, x, y, r, c, cdk) {
  ell(put, x, y, r, r, (tx, ty) => mix(c || F.steel, cdk || F.steelDkk, 0.25 + ty * 0.6));
  put(Math.round(x), Math.round(y), cdk || F.steelDkk);
}
function optic(put, cx, cy, r, cDk, c, cLt) {
  ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 <= 0.25 ? cDk : null));
  ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
  ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
  put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
}
function hazard(put, x0, y0, x1, y1, a, b) {
  const per = Math.max(3, Math.round((x1 - x0) * 0.14));
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++)
      put(x, y, (Math.floor((x + y) / per) % 2 === 0) ? a : b);
}
function tread(put, x0, x1, yTop, yBot) {
  plate(put, x0, yTop, x1, yBot, F.rubber, F.rubberLt, F.rubberDk);
  const seg = Math.max(4, Math.round((x1 - x0) * 0.11));
  for (let x = Math.round(x0); x < x1; x += seg) for (let y = Math.round(yTop); y < yBot; y++) put(x, y, F.rubberDk);
  const r = (yBot - yTop) * 0.5;
  [x0 + r, x1 - r].forEach(cx => { ell(put, cx, (yTop + yBot) / 2, r * 0.85, r * 0.85, (tx, ty) => mix(F.steel, F.steelDkk, ty)); bolt(put, cx, (yTop + yBot) / 2, r * 0.32, F.steelLt, F.steelDk); });
}
function vent(put, x0, x1, y, n) { for (let i = 0; i < n; i++) row(put, y + i * 2, x0, x1, () => F.gunDk); }
function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => F.oil); }
function cable(put, x0, y0, x1, y1, c) {
  stroke(put, x0, y0, x1, y1, Math.max(2, 3), (t) => mix(c, F.oil, 0.3 + 0.4 * Math.abs(Math.sin(t * 6))));
}
function drawSparkbot(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  // hover jet glow beneath
  ell(put, cx, S * 0.7, S * 0.11, S * 0.05, () => F.cyanDk);
  ell(put, cx, S * 0.68, S * 0.07, S * 0.03, () => F.cyanLt);
  // little arms with spark tips
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.14, cy, cx + s * S * 0.3, cy - S * 0.06, S * 0.03, () => F.steelMd);
    ell(put, cx + s * S * 0.32, cy - S * 0.07, S * 0.03, S * 0.03, () => F.brass);
    [0, 1, 2].forEach(k => put(Math.round(cx + s * (S * 0.34 + k * 3)), Math.round(cy - S * 0.09 - k * 2), F.moltenLt));
  });
  // round chassis
  dome(put, cx, cy, S * 0.2, S * 0.19, F.steel, F.chrome, F.steelDk);
  // seam + bolts
  row(put, Math.round(cy), cx - S * 0.19, cx + S * 0.19, () => F.steelDk);
  [-1, 1].forEach(s => bolt(put, cx + s * S * 0.13, cy - S * 0.1, S * 0.02, F.steelLt, F.steelDk));
  // single big optic
  optic(put, cx, cy + S * 0.01, S * 0.09, F.cyanDk, F.cyan, F.cyanLt);
  // antenna
  stroke(put, cx, cy - S * 0.18, cx + S * 0.03, cy - S * 0.32, S * 0.02, () => F.steelMd);
  ell(put, cx + S * 0.035, cy - S * 0.33, S * 0.025, S * 0.025, () => F.red);
}

// 2 · BOLT BEETLE — domed shell scuttling on treads; rams the player.
function drawBoltBeetle(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  tread(put, cx - S * 0.26, cx + S * 0.26, S * 0.72, S * 0.86);
  // carapace shell (two halves, brass seam)
  dome(put, cx, cy, S * 0.28, S * 0.24, F.gun, F.steel, F.gunDk);
  for (let y = Math.round(cy - S * 0.22); y < cy + S * 0.18; y++) put(Math.round(cx), y, F.brass);
  // rivets around the rim
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.5) bolt(put, cx + Math.cos(a) * -S * 0.26, cy - Math.sin(a) * S * 0.2, S * 0.017, F.brassLt, F.brassDk);
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.5) bolt(put, cx + Math.cos(a) * S * 0.26, cy - Math.sin(a) * S * 0.2, S * 0.017, F.brassLt, F.brassDk);
  // ram mandibles up front
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.14, cy + S * 0.2, cx + s * S * 0.26, cy + S * 0.28, S * 0.04, () => F.chromeMd));
  // twin red optics under the lip
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.11, cy + S * 0.12, S * 0.045, F.redDk, F.red, F.redLt));
}

// 3 · RIVETER — squat tripod turret; fires aimed rivet bursts.
function drawRiveter(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.22);
  // tripod legs
  [-1, 0, 1].forEach(s => stroke(put, cx + s * S * 0.02, cy + S * 0.12, cx + s * S * 0.22, S * 0.9, S * 0.035, (t) => mix(F.steelMd, F.steelDk, t)));
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.22, S * 0.9, S * 0.04, S * 0.02, () => F.steelDk));
  // turret body drum
  dome(put, cx, cy, S * 0.2, S * 0.17, F.steel, F.chrome, F.steelDk);
  vent(put, cx - S * 0.12, cx + S * 0.12, cy + S * 0.06, 4);
  // ammo hopper on top
  plate(put, cx - S * 0.08, cy - S * 0.28, cx + S * 0.08, cy - S * 0.14, F.brass, F.brassLt, F.brassDk);
  [-0.04, 0.04].forEach(o => bolt(put, cx + o * S, cy - S * 0.2, S * 0.02, F.chrome, F.steelDk));
  // big rivet-gun barrel pointing right
  plate(put, cx + S * 0.14, cy - S * 0.05, cx + S * 0.42, cy + S * 0.06, F.gun, F.steel, F.gunDk);
  ell(put, cx + S * 0.42, cy + S * 0.005, S * 0.035, S * 0.05, () => F.oil);
  optic(put, cx, cy - S * 0.02, S * 0.05, F.redDk, F.red, F.redLt);
}

// 4 · ARC WELDER — mobile arm robot; strikes with a live welding arc.
function drawArcWelder(put, S) {
  const cx = S * 0.44, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // wheeled base
  plate(put, cx - S * 0.16, S * 0.7, cx + S * 0.16, S * 0.84, F.steelMd, F.steel, F.steelDkk);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.12, S * 0.86, S * 0.06, S * 0.06, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); bolt(put, cx + s * S * 0.12, S * 0.86, S * 0.02, F.steel, F.steelDk); });
  // torso column
  plate(put, cx - S * 0.1, cy - S * 0.06, cx + S * 0.1, S * 0.72, F.steel, F.chrome, F.steelDk);
  vent(put, cx - S * 0.07, cx + S * 0.07, cy + S * 0.06, 5);
  // head with welder's visor slit
  dome(put, cx, cy - S * 0.16, S * 0.11, S * 0.1, F.gun, F.steel, F.gunDk);
  row(put, Math.round(cy - S * 0.16), cx - S * 0.08, cx + S * 0.08, () => F.cyanLt);
  // articulated arm reaching right, holding torch with arc
  stroke(put, cx + S * 0.06, cy, cx + S * 0.26, cy + S * 0.06, S * 0.04, () => F.steelMd);
  stroke(put, cx + S * 0.26, cy + S * 0.06, cx + S * 0.38, cy - S * 0.04, S * 0.035, () => F.gun);
  ell(put, cx + S * 0.39, cy - S * 0.05, S * 0.03, S * 0.03, () => F.copper);
  // electric arc sparks off the torch tip
  [[0.44, -0.1], [0.5, -0.02], [0.46, 0.05], [0.53, -0.12]].forEach(p => { put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.cyanLt); put(Math.round(cx + p[0] * S) + 1, Math.round(cy + p[1] * S), F.white); });
  stroke(put, cx + S * 0.4, cy - S * 0.05, cx + S * 0.5, cy - S * 0.1, 1.4, () => F.cyan);
}

// 5 · CONVEYOR CENTIPEDE — segmented crawler that rides the belts.
function drawCentipede(put, S) {
  const y = S * 0.52;
  shadow(put, S, S * 0.5, S * 0.3);
  const segs = 5;
  for (let i = segs - 1; i >= 0; i--) {
    const cx = S * (0.24 + i * 0.12);
    // little wheels
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.03, y + S * 0.11, S * 0.028, S * 0.028, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)));
    dome(put, cx, y, S * 0.075, S * 0.08, i === segs - 1 ? F.copper : F.steel, i === segs - 1 ? F.copperLt : F.chrome, i === segs - 1 ? F.copperDk : F.steelDk);
    // connecting joint
    if (i < segs - 1) plate(put, cx + S * 0.06, y - S * 0.015, cx + S * 0.09, y + S * 0.02, F.gunDk, F.gun, F.oil);
  }
  // head segment (rightmost) — mandibles + optic
  const hx = S * (0.24 + (segs - 1) * 0.12);
  [-1, 1].forEach(s => stroke(put, hx + S * 0.06, y + s * S * 0.03, hx + S * 0.13, y + s * S * 0.06, S * 0.02, () => F.chromeMd));
  optic(put, hx + S * 0.03, y - S * 0.005, S * 0.035, F.redDk, F.red, F.redLt);
  // tail spark
  put(Math.round(S * 0.2), Math.round(y - S * 0.02), F.cyanLt);
}

// 6 · PISTON RAM — heavy block with a hydraulic hammer that slams down.
function drawPistonRam(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  shadow(put, S, cx, S * 0.24);
  // heavy tracked base
  tread(put, cx - S * 0.3, cx + S * 0.3, S * 0.78, S * 0.92);
  // body block
  plate(put, cx - S * 0.24, cy - S * 0.02, cx + S * 0.24, S * 0.78, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.24, S * 0.7, cx + S * 0.24, S * 0.77, F.hazard, F.hazardDk);
  // bolts
  [-0.2, 0.2].forEach(o => [0.05, 0.5].forEach(v => bolt(put, cx + o * S, cy + v * S * 0.3, S * 0.02, F.steelLt, F.steelDk)));
  // hydraulic piston tower + hammer head
  plate(put, cx - S * 0.09, S * 0.16, cx + S * 0.09, cy, F.gun, F.steel, F.gunDk);
  plate(put, cx - S * 0.06, S * 0.22, cx + S * 0.06, cy, F.chromeMd, F.chrome, F.steel); // shiny rod
  plate(put, cx - S * 0.2, S * 0.06, cx + S * 0.2, S * 0.2, F.iron, F.steel, F.ironDk); // hammer block
  hazard(put, cx - S * 0.2, S * 0.06, cx + S * 0.2, S * 0.11, F.hazard, F.hazardDk);
  // twin optics
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.1, cy + S * 0.05, S * 0.04, F.redDk, F.red, F.redLt));
}

// 7 · SCRAP HULK — a lumbering mass of welded-scrap; the tank.
function drawScrapHulk(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // mismatched legs
  [-1, 1].forEach(s => { plate(put, cx + s * S * 0.08 - S * 0.06, S * 0.66, cx + s * S * 0.08 + S * 0.06, S * 0.9, s < 0 ? F.rust : F.steelMd, F.steel, F.rustDk); ell(put, cx + s * S * 0.08, S * 0.91, S * 0.08, S * 0.03, () => F.oil); });
  // bulky asymmetric torso from junk plates
  dome(put, cx, cy, S * 0.32, S * 0.26, F.steelMd, F.steelLt, F.steelDkk);
  plate(put, cx - S * 0.28, cy - S * 0.1, cx - S * 0.05, cy + S * 0.14, F.rust, F.copperLt, F.rustDk);
  plate(put, cx + S * 0.02, cy - S * 0.18, cx + S * 0.26, cy + S * 0.02, F.gun, F.steel, F.gunDk);
  // welds + rivets scattered
  for (let k = 0; k < 8; k++) bolt(put, cx + (Math.sin(k * 2.3)) * S * 0.22, cy + Math.cos(k * 1.7) * S * 0.16, S * 0.016, F.brassLt, F.brassDk);
  // big scrap-plate arm/fist
  plate(put, cx + S * 0.22, cy - S * 0.02, cx + S * 0.36, cy + S * 0.22, F.iron, F.steel, F.ironDk);
  // mismatched glowing optics (one big, one small)
  optic(put, cx - S * 0.08, cy - S * 0.06, S * 0.06, F.moltenDk, F.molten, F.moltenLt);
  optic(put, cx + S * 0.08, cy - S * 0.04, S * 0.03, F.moltenDk, F.molten, F.moltenLt);
  // exhaust smoke stub
  ell(put, cx - S * 0.16, cy - S * 0.24, S * 0.03, S * 0.05, () => F.gunDk);
}

// 8 · VOLT COIL — stationary tesla tower; radial lightning bursts.
function drawVoltCoil(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // base platform
  plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.2, S * 0.9, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.2, S * 0.86, cx + S * 0.2, S * 0.9, F.hazard, F.hazardDk);
  // insulator stack (ceramic rings)
  for (let i = 0; i < 4; i++) { const yy = S * (0.72 - i * 0.1); dome(put, cx, yy, S * 0.09 - i * S * 0.008, S * 0.035, F.chromeMd, F.white, F.steel); }
  // copper coil windings
  for (let i = 0; i < 7; i++) { const yy = S * (0.68 - i * 0.045); row(put, Math.round(yy), cx - S * 0.06, cx + S * 0.06, (tx) => mix(F.copperLt, F.copperDk, tx)); }
  // top toroid sphere
  dome(put, cx, S * 0.3, S * 0.13, S * 0.11, F.chromeMd, F.chrome, F.steel);
  // arcing lightning off the sphere
  [-1, 1].forEach(s => {
    let px = cx, py = S * 0.24;
    for (let k = 0; k < 5; k++) { const nx = px + s * S * (0.04 + Math.random() * 0), ny = py - S * 0.05; stroke(put, px, py, cx + s * S * (0.05 + k * 0.05), S * 0.26 - k * S * 0.04 + (k % 2) * S * 0.03, 1.4, () => F.cyanLt); px = cx + s * S * (0.05 + k * 0.05); py = S * 0.26 - k * S * 0.04; }
  });
  optic(put, cx, S * 0.3, S * 0.05, F.cyanDk, F.cyan, F.cyanLt);
}

// 9 · HIVE DRONE — quadrotor flyer with an underslung optic.
function drawHiveDrone(put, S) {
  const cx = S * 0.5, cy = S * 0.44;
  shadow(put, S, cx, S * 0.16);
  // arms + rotors (motion blur discs)
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(d => {
    const ax = cx + d[0] * S * 0.26, ay = cy + d[1] * S * 0.14;
    stroke(put, cx + d[0] * S * 0.08, cy + d[1] * S * 0.05, ax, ay, S * 0.028, () => F.gun);
    ell(put, ax, ay, S * 0.13, S * 0.03, () => F.steelDk); // blur disc
    ell(put, ax, ay, S * 0.13, S * 0.03, (tx) => (Math.floor(tx * 8) % 2 ? F.steelLt : null));
    bolt(put, ax, ay, S * 0.02, F.steel, F.steelDk);
  });
  // central body
  dome(put, cx, cy, S * 0.15, S * 0.12, F.steel, F.chrome, F.steelDk);
  hazard(put, cx - S * 0.1, cy - S * 0.11, cx + S * 0.1, cy - S * 0.06, F.hazard, F.hazardDk);
  // underslung gimbal camera
  ell(put, cx, cy + S * 0.13, S * 0.06, S * 0.055, (tx, ty) => mix(F.gun, F.gunDk, ty));
  optic(put, cx, cy + S * 0.14, S * 0.035, F.redDk, F.red, F.redLt);
  // status LED
  put(Math.round(cx + S * 0.08), Math.round(cy - S * 0.02), F.green);
}

// 10 · LASER TRIPOD — tall sniper; charges a beam from a big lens.
function drawLaserTripod(put, S) {
  const cx = S * 0.5, cy = S * 0.36;
  shadow(put, S, cx, S * 0.2);
  [-1, 0, 1].forEach(s => stroke(put, cx + s * S * 0.015, cy + S * 0.1, cx + s * S * 0.2, S * 0.9, S * 0.03, (t) => mix(F.steel, F.steelDk, t)));
  // slim head housing
  plate(put, cx - S * 0.13, cy - S * 0.1, cx + S * 0.13, cy + S * 0.12, F.gun, F.steel, F.gunDk);
  plate(put, cx - S * 0.1, cy - S * 0.02, cx + S * 0.18, cy + S * 0.04, F.steelMd, F.steel, F.steelDkk); // barrel
  vent(put, cx - S * 0.1, cx + S * 0.1, cy + S * 0.07, 3);
  // big charging lens at the muzzle
  optic(put, cx + S * 0.19, cy + S * 0.01, S * 0.07, F.redDk, F.red, F.redLt);
  // charge beam hint
  stroke(put, cx + S * 0.26, cy + S * 0.01, cx + S * 0.44, cy + S * 0.01, 2, () => F.redLt);
  // sensor fin on top
  stroke(put, cx, cy - S * 0.1, cx, cy - S * 0.22, S * 0.02, () => F.steelMd);
  ell(put, cx, cy - S * 0.23, S * 0.02, S * 0.02, () => F.cyan);
}

// 11 · FORGE HOUND — quadruped hunter with a molten reactor core.
function drawForgeHound(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.26);
  // 4 piston legs
  [[-0.22, 1], [-0.1, 1], [0.12, 1], [0.24, 1]].forEach((p, i) => {
    stroke(put, cx + p[0] * S, cy + S * 0.1, cx + p[0] * S + (i < 2 ? -1 : 1) * S * 0.02, S * 0.88, S * 0.03, () => F.steelMd);
    ell(put, cx + p[0] * S, S * 0.89, S * 0.035, S * 0.02, () => F.oil);
  });
  // sleek body
  dome(put, cx, cy, S * 0.28, S * 0.15, F.gun, F.steel, F.gunDk);
  // molten seams glowing between plates
  [-0.1, 0.05, 0.18].forEach(o => stroke(put, cx + o * S, cy - S * 0.12, cx + o * S - S * 0.02, cy + S * 0.12, 1.6, () => F.molten));
  // reactor core in the chest
  optic(put, cx - S * 0.05, cy + S * 0.02, S * 0.06, F.moltenDk, F.molten, F.moltenLt);
  // head lunging forward with jaw
  dome(put, cx + S * 0.26, cy - S * 0.04, S * 0.1, S * 0.08, F.steel, F.chrome, F.steelDk);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.3, cy - S * 0.04 + s * S * 0.03, cx + S * 0.4, cy - S * 0.02 + s * S * 0.05, S * 0.02, () => F.chromeMd)); // jaw
  optic(put, cx + S * 0.28, cy - S * 0.06, S * 0.03, F.moltenDk, F.moltenLt, F.white);
  // ear antennae
  [-1, 1].forEach(s => stroke(put, cx + S * 0.24, cy - S * 0.1, cx + S * 0.22 + s * S * 0.02, cy - S * 0.2, 1.4, () => F.steelMd));
  // tail exhaust with ember
  stroke(put, cx - S * 0.26, cy - S * 0.02, cx - S * 0.36, cy - S * 0.12, S * 0.025, () => F.gun);
  ell(put, cx - S * 0.37, cy - S * 0.13, S * 0.025, S * 0.025, () => F.ember);
}

// 12 · BUZZSAW UNIT — a rolling frame around a huge circular sawblade.
function drawBuzzsaw(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.24);
  // frame arms holding the blade
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.28, cy + S * 0.28, cx + s * S * 0.14, cy, S * 0.04, () => F.gun); ell(put, cx + s * S * 0.28, cy + S * 0.3, S * 0.05, S * 0.05, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); });
  plate(put, cx - S * 0.16, cy + S * 0.14, cx + S * 0.16, cy + S * 0.26, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.16, cy + S * 0.14, cx + S * 0.16, cy + S * 0.19, F.hazard, F.hazardDk);
  // the sawblade
  ell(put, cx, cy - S * 0.04, S * 0.32, S * 0.32, (tx, ty) => mix(F.chrome, F.steel, clamp(ty, 0, 1)));
  ell(put, cx, cy - S * 0.04, S * 0.26, S * 0.26, () => F.steelDk);
  // teeth around the rim
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    const tx = cx + Math.cos(a) * S * 0.32, ty = cy - S * 0.04 + Math.sin(a) * S * 0.32;
    stroke(put, tx, ty, cx + Math.cos(a + 0.1) * S * 0.37, cy - S * 0.04 + Math.sin(a + 0.1) * S * 0.37, 1.6, () => F.chrome);
  }
  // hub + optic
  ell(put, cx, cy - S * 0.04, S * 0.11, S * 0.11, (tx, ty) => mix(F.gun, F.gunDk, ty));
  optic(put, cx, cy - S * 0.04, S * 0.05, F.redDk, F.red, F.redLt);
  // spark flick
  [[0.3, 0.2], [-0.28, -0.18]].forEach(p => put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.moltenLt));
}

// 13 · MAG-CRANE — treaded crane with a magnetic horseshoe claw; pulls you in.
function drawMagCrane(put, S) {
  const cx = S * 0.42, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  tread(put, cx - S * 0.22, cx + S * 0.18, S * 0.78, S * 0.9);
  // cab
  plate(put, cx - S * 0.16, cy, cx + S * 0.1, S * 0.78, F.hazard, F.brassLt, F.brassDk);
  hazard(put, cx - S * 0.16, cy, cx + S * 0.1, cy + S * 0.05, F.hazardDk, F.hazard);
  plate(put, cx - S * 0.12, cy + S * 0.1, cx + S * 0.02, cy + S * 0.24, F.glass, F.glassLt, F.oil); // window
  // crane boom to the right
  stroke(put, cx + S * 0.04, cy - S * 0.02, cx + S * 0.34, cy - S * 0.22, S * 0.045, () => F.steelMd);
  // lattice detail
  for (let k = 0; k < 5; k++) { const t = k / 5; stroke(put, lerp(cx + S * 0.06, cx + S * 0.32, t), lerp(cy, cy - S * 0.2, t) + S * 0.03, lerp(cx + S * 0.06, cx + S * 0.32, t) + S * 0.02, lerp(cy, cy - S * 0.2, t) - S * 0.03, 1.2, () => F.steelDk); }
  // dangling cable + magnet
  stroke(put, cx + S * 0.34, cy - S * 0.22, cx + S * 0.34, cy + S * 0.02, 1.6, () => F.oil);
  // horseshoe electromagnet
  plate(put, cx + S * 0.27, cy + S * 0.02, cx + S * 0.41, cy + S * 0.1, F.red, F.redLt, F.redDk);
  [cx + S * 0.28, cx + S * 0.4].forEach(px => plate(put, px - S * 0.02, cy + S * 0.1, px + S * 0.02, cy + S * 0.2, F.steel, F.chrome, F.steelDk));
  // magnetic field arcs
  [-1, 1].forEach(s => stroke(put, cx + S * 0.34 + s * S * 0.05, cy + S * 0.22, cx + S * 0.34, cy + S * 0.28, 1.2, () => F.cyanLt));
  optic(put, cx - S * 0.07, cy + S * 0.05, S * 0.03, F.redDk, F.red, F.redLt);
}

// 14 · COOLANT TANK — wheeled tank spraying freezing coolant (slow field).
function drawCoolantTank(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.14, S * 0.85, S * 0.07, S * 0.07, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); bolt(put, cx + s * S * 0.14, S * 0.85, S * 0.02, F.steel, F.steelDk); });
  // cylindrical coolant tank
  for (let y = Math.round(cy - S * 0.2); y < S * 0.78; y++) { const t = (y - (cy - S * 0.2)) / (S * 0.78 - (cy - S * 0.2)); row(put, y, cx - S * 0.18, cx + S * 0.14, (tx) => { let b = mix(F.blueLt, F.blue, clamp(tx * 1.3, 0, 1)); b = mix(b, F.blueDk, clamp((tx - 0.6) * 1.2, 0, 1)); return b; }); }
  // frost bands
  [0.1, 0.4, 0.7].forEach(v => row(put, Math.round(cy - S * 0.2 + v * S * 0.4), cx - S * 0.18, cx + S * 0.14, () => F.white));
  // gauge
  ell(put, cx - S * 0.02, cy, S * 0.04, S * 0.04, () => F.white); put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.02), F.red);
  // spray nozzle top-right + vapor
  stroke(put, cx + S * 0.1, cy - S * 0.16, cx + S * 0.26, cy - S * 0.24, S * 0.03, () => F.steelMd);
  ell(put, cx + S * 0.27, cy - S * 0.25, S * 0.03, S * 0.03, () => F.chrome);
  for (let k = 0; k < 6; k++) { const px = cx + S * (0.3 + k * 0.03), py = cy - S * 0.25 + Math.sin(k) * S * 0.04; put(Math.round(px), Math.round(py), F.cyanLt); put(Math.round(px), Math.round(py) + 1, F.white); }
  optic(put, cx - S * 0.08, cy + S * 0.1, S * 0.03, F.cyanDk, F.cyan, F.cyanLt);
}

// 15 · NANO SWARM — a loose cluster of cube nanobots; splits when killed.
function drawNanoSwarm(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // scattered cubes forming a rough body
  const cubes = [[0, 0, 0.16], [-0.18, -0.06, 0.1], [0.16, -0.1, 0.11], [-0.1, 0.16, 0.09], [0.14, 0.14, 0.1], [-0.22, 0.08, 0.06], [0.24, 0.02, 0.07], [0.02, -0.22, 0.08], [-0.06, -0.02, 0.12]];
  cubes.forEach((c, i) => {
    const bx = cx + c[0] * S, by = cy + c[1] * S, r = c[2] * S;
    const pal = i % 3 === 0 ? [F.cyan, F.cyanLt, F.cyanDk] : [F.steel, F.chrome, F.steelDk];
    plate(put, bx - r, by - r, bx + r, by + r, pal[0], pal[1], pal[2]);
    // circuit trace on the cube face
    row(put, Math.round(by), bx - r * 0.7, bx + r * 0.7, () => pal[2]);
    put(Math.round(bx), Math.round(by), F.greenLt);
  });
  // free-floating motes drifting off
  [[-0.3, -0.14], [0.32, -0.2], [-0.28, 0.24], [0.3, 0.24]].forEach(p => { put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.cyanLt); put(Math.round(cx + p[0] * S) + 2, Math.round(cy + p[1] * S) + 1, F.cyan); });
  // a couple of collective optics
  optic(put, cx - S * 0.02, cy - S * 0.02, S * 0.04, F.cyanDk, F.cyan, F.cyanLt);
}

// 16 · WARFRAME — bipedal battle mech with shoulder cannons (heavy threat).
function drawWarframe(put, S) {
  const cx = S * 0.5, cy = S * 0.42;
  shadow(put, S, cx, S * 0.26);
  // reverse-joint legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.09, cy + S * 0.16, cx + s * S * 0.17, cy + S * 0.34, S * 0.05, () => F.steelMd);
    stroke(put, cx + s * S * 0.17, cy + S * 0.34, cx + s * S * 0.1, S * 0.86, S * 0.045, () => F.steel);
    plate(put, cx + s * S * 0.1 - S * 0.06, S * 0.86, cx + s * S * 0.1 + S * 0.06, S * 0.92, F.gun, F.steel, F.gunDk); // foot
  });
  // hip block
  plate(put, cx - S * 0.14, cy + S * 0.12, cx + S * 0.14, cy + S * 0.22, F.gun, F.steel, F.gunDk);
  // torso
  dome(put, cx, cy, S * 0.2, S * 0.16, F.steel, F.chrome, F.steelDk);
  plate(put, cx - S * 0.05, cy - S * 0.02, cx + S * 0.05, cy + S * 0.1, F.hazard, F.brassLt, F.hazardDk); // core panel
  optic(put, cx, cy + S * 0.03, S * 0.045, F.cyanDk, F.cyan, F.cyanLt);
  // shoulder cannons
  [-1, 1].forEach(s => { plate(put, cx + s * S * 0.16 - S * 0.06, cy - S * 0.14, cx + s * S * 0.16 + S * 0.06, cy - S * 0.02, F.iron, F.steel, F.ironDk); ell(put, cx + s * S * 0.22, cy - S * 0.08, S * 0.025, S * 0.03, () => F.oil); });
  // small head with visor
  dome(put, cx, cy - S * 0.18, S * 0.07, S * 0.06, F.gun, F.steel, F.gunDk);
  row(put, Math.round(cy - S * 0.18), cx - S * 0.05, cx + S * 0.05, () => F.red);
}

// 17 · REPAIR UNIT — hover medic drone; welds allies back together (healer).
function drawRepairUnit(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.16);
  // hover ring
  ell(put, cx, cy + S * 0.24, S * 0.16, S * 0.05, () => F.greenDk);
  ell(put, cx, cy + S * 0.23, S * 0.12, S * 0.03, () => F.greenLt);
  // white-and-green body (medic livery)
  dome(put, cx, cy, S * 0.18, S * 0.16, F.chromeMd, F.white, F.steel);
  // green cross emblem
  plate(put, cx - S * 0.015, cy - S * 0.08, cx + S * 0.015, cy + S * 0.02, F.green, F.greenLt, F.greenDk);
  plate(put, cx - S * 0.05, cy - S * 0.045, cx + S * 0.05, cy - S * 0.015, F.green, F.greenLt, F.greenDk);
  // two repair arms with a wrench + a welding beam
  stroke(put, cx - S * 0.12, cy + S * 0.06, cx - S * 0.26, cy + S * 0.16, S * 0.03, () => F.steelMd);
  plate(put, cx - S * 0.3, cy + S * 0.14, cx - S * 0.24, cy + S * 0.2, F.chrome, F.white, F.steel); // wrench head
  stroke(put, cx + S * 0.12, cy + S * 0.06, cx + S * 0.24, cy + S * 0.16, S * 0.03, () => F.steelMd);
  // healing beam
  stroke(put, cx + S * 0.24, cy + S * 0.16, cx + S * 0.34, cy + S * 0.26, 2, () => F.greenLt);
  [[0.36, 0.28], [0.3, 0.22]].forEach(p => put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.white));
  // optic
  optic(put, cx, cy - S * 0.12, S * 0.035, F.greenDk, F.green, F.greenLt);
}

// 18 · PURGE FLAMER — treaded unit with a flamethrower; sweeps a fire cone.
function drawPurgeFlamer(put, S) {
  const cx = S * 0.42, cy = S * 0.52;
  shadow(put, S, cx, S * 0.22);
  tread(put, cx - S * 0.22, cx + S * 0.16, S * 0.78, S * 0.92);
  // armored body
  plate(put, cx - S * 0.18, cy - S * 0.04, cx + S * 0.12, S * 0.78, F.iron, F.steel, F.ironDk);
  hazard(put, cx - S * 0.18, cy - S * 0.04, cx + S * 0.12, cy + S * 0.02, F.hazard, F.hazardDk);
  // fuel tanks on the back
  [-0.13, -0.05].forEach(o => { for (let y = Math.round(cy); y < S * 0.72; y++) row(put, y, cx + o * S - S * 0.03, cx + o * S + S * 0.03, (tx) => mix(F.red, F.redDk, tx)); ell(put, cx + o * S, cy - S * 0.02, S * 0.03, S * 0.02, () => F.redLt); });
  // flamethrower nozzle right
  stroke(put, cx + S * 0.08, cy + S * 0.02, cx + S * 0.24, cy + S * 0.02, S * 0.035, () => F.gun);
  ell(put, cx + S * 0.25, cy + S * 0.02, S * 0.03, S * 0.035, () => F.oil);
  // fire cone
  for (let k = 0; k < 22; k++) {
    const t = k / 22, fx = cx + S * (0.28 + t * 0.24), spread = S * (0.02 + t * 0.12);
    const fy = cy + S * 0.02 + (Math.sin(k * 1.7) * spread);
    const c = t < 0.4 ? F.white : t < 0.7 ? F.moltenLt : F.molten;
    put(Math.round(fx), Math.round(fy), c); put(Math.round(fx), Math.round(fy) + 1, mix(c, F.ember, 0.5));
  }
  optic(put, cx - S * 0.1, cy + S * 0.06, S * 0.03, F.moltenDk, F.molten, F.moltenLt);
}

// 19 · BULWARK DRONE — hovers and projects a hex energy shield (guard).
function drawBulwark(put, S) {
  const cx = S * 0.42, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  ell(put, cx, cy + S * 0.24, S * 0.14, S * 0.045, () => F.blueDk);
  ell(put, cx, cy + S * 0.23, S * 0.1, S * 0.028, () => F.blueLt);
  // stout body
  dome(put, cx, cy, S * 0.17, S * 0.16, F.steelMd, F.steel, F.steelDkk);
  // shield emitter dishes
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.13, cy - S * 0.02, S * 0.04, S * 0.06, (tx, ty) => mix(F.blue, F.blueDk, ty)));
  optic(put, cx, cy + S * 0.01, S * 0.045, F.blueDk, F.blue, F.blueLt);
  // the projected hex shield to the right (semi-transparent look via dither)
  const shx = cx + S * 0.3, shy = cy;
  for (let y = Math.round(shy - S * 0.28); y < shy + S * 0.28; y++) for (let x = Math.round(shx - S * 0.1); x < shx + S * 0.12; x++) {
    const dy = (y - shy) / (S * 0.28), dx = (x - shx) / (S * 0.14);
    if (dx * dx + dy * dy <= 1 && (x + y) % 2 === 0) put(x, y, Math.abs(dx) > 0.7 ? F.cyanLt : F.cyan);
  }
  // hex frame lines
  stroke(put, shx, shy - S * 0.28, shx + S * 0.11, shy, 1.4, () => F.cyanLt);
  stroke(put, shx + S * 0.11, shy, shx, shy + S * 0.28, 1.4, () => F.cyanLt);
}

// 20 · OVERSEER EYE — a floating security sensor; marks and buffs the swarm.
function drawOverseer(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.18);
  // articulated stalk arms/sensors radiating
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const ex = cx + Math.cos(a) * S * 0.28, ey = cy + Math.sin(a) * S * 0.26;
    stroke(put, cx + Math.cos(a) * S * 0.16, cy + Math.sin(a) * S * 0.15, ex, ey, S * 0.022, () => F.steelMd);
    ell(put, ex, ey, S * 0.03, S * 0.03, () => F.gun);
    put(Math.round(ex), Math.round(ey), (a < 3 ? F.red : F.green));
  }
  // armored eyeball housing
  dome(put, cx, cy, S * 0.24, S * 0.22, F.steel, F.chrome, F.steelDk);
  // iris shutter ring
  ell(put, cx, cy, S * 0.16, S * 0.15, () => F.gunDk);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) stroke(put, cx + Math.cos(a) * S * 0.16, cy + Math.sin(a) * S * 0.15, cx + Math.cos(a) * S * 0.1, cy + Math.sin(a) * S * 0.09, 1.6, () => F.steelDk);
  // the glowing purple iris
  optic(put, cx, cy, S * 0.09, F.purple, F.purpleLt, F.white);
  // scanning laser cross
  put(Math.round(cx), Math.round(cy - S * 0.02), F.white);
  // brow plate
  plate(put, cx - S * 0.2, cy - S * 0.24, cx + S * 0.2, cy - S * 0.18, F.hazard, F.brassLt, F.hazardDk);
}

// ========================================================================
function hash(a, b) { const n = Math.sin((a % 997) * 12.9 + (b % 997) * 78.2) * 43758.5; return n - Math.floor(n); }
function weather(put, x0, y0, x1, y1) { for (let y = Math.round(y0); y < y1; y++) for (let x = Math.round(x0); x < x1; x++) if (hash(x, y) > 0.9) put(x, y, hash(x + 1, y) > 0.5 ? F.rust : F.rustDk); }

function mechLegs(put, S, cx, acc) {
  [-1, 1].forEach(s => {
    // thigh
    plate(put, cx + s * S * 0.04, S * 0.55, cx + s * S * 0.17, S * 0.7, F.steelMd, F.steel, F.steelDkk);
    // knee joint
    ell(put, cx + s * S * 0.13, S * 0.7, S * 0.05, S * 0.05, (tx, ty) => mix(F.gun, F.gunDk, ty));
    // shin
    plate(put, cx + s * S * 0.07, S * 0.7, cx + s * S * 0.18, S * 0.86, F.iron, F.steel, F.ironDk);
    plate(put, cx + s * S * 0.09, S * 0.72, cx + s * S * 0.15, S * 0.8, acc, F.copperLt, F.rustDk); // accent shin panel
    weather(put, cx + s * S * 0.07, S * 0.7, cx + s * S * 0.18, S * 0.86);
    // big foot
    plate(put, cx + s * S * 0.03, S * 0.86, cx + s * S * 0.21, S * 0.92, F.gun, F.steel, F.gunDk);
    hazard(put, cx + s * S * 0.03, S * 0.9, cx + s * S * 0.21, S * 0.92, F.hazard, F.hazardDk);
    // hydraulic piston
    stroke(put, cx + s * S * 0.05, S * 0.58, cx + s * S * 0.1, S * 0.72, S * 0.02, () => F.chromeMd);
  });
}
function mechTorso(put, S, cx, o) {
  // pelvis
  plate(put, cx - S * 0.16, S * 0.5, cx + S * 0.16, S * 0.58, F.gun, F.steel, F.gunDk);
  // main chest block
  plate(put, cx - S * 0.22, S * 0.28, cx + S * 0.22, S * 0.52, F.steelMd, F.steelLt, F.steelDkk);
  weather(put, cx - S * 0.22, S * 0.28, cx + S * 0.22, S * 0.52);
  // orange shoulder yokes / accent panels
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.12, S * 0.29, cx + s * S * 0.22, S * 0.4, o.acc, F.copperLt, F.rustDk));
  // cockpit
  if (o.cockpit === 'core') { ell(put, cx, S * 0.4, S * 0.1, S * 0.11, () => F.gunDk); optic(put, cx, S * 0.4, S * 0.07, F.moltenDk, F.molten, F.moltenLt); }
  else {
    plate(put, cx - S * 0.1, S * 0.32, cx + S * 0.1, S * 0.48, F.gunDk, F.gun, F.oil); // canopy frame
    plate(put, cx - S * 0.08, S * 0.34, cx + S * 0.08, S * 0.46, F.glass, F.glassLt, F.oil); // glass
    // tiny pilot silhouette (the engineer) in the cockpit
    ell(put, cx, S * 0.4, S * 0.03, S * 0.035, () => F.labcoat);
    ell(put, cx, S * 0.37, S * 0.02, S * 0.02, () => F.hairW); // wild hair
    put(Math.round(cx - S * 0.008), Math.round(S * 0.375), F.red); put(Math.round(cx + S * 0.012), Math.round(S * 0.375), F.red); // red eyes
    if (o.cockpit === 'open') { /* raised canopy hint */ stroke(put, cx - S * 0.08, S * 0.32, cx - S * 0.12, S * 0.24, 1.6, () => F.glassLt); }
    else { stroke(put, cx - S * 0.06, S * 0.35, cx + S * 0.06, S * 0.35, 1, () => F.glassLt); } // reflection
  }
  // vents + label plate
  vent(put, cx - S * 0.19, cx - S * 0.13, S * 0.44, 3);
  plate(put, cx + S * 0.11, S * 0.42, cx + S * 0.2, S * 0.48, F.chromeMd, F.chrome, F.steel);
  // 'G.E.-01' marking
  [0, 1, 2].forEach(i => put(Math.round(cx + S * 0.13 + i * 2), Math.round(S * 0.45), F.gunDk));
  // rivets
  [[-0.2, 0.3], [0.2, 0.3], [-0.2, 0.5], [0.2, 0.5]].forEach(p => bolt(put, cx + p[0] * S, S * p[1], S * 0.014, F.steelLt, F.steelDk));
}
function mechHead(put, S, cx, o) {
  const hy = S * 0.22;
  plate(put, cx - S * 0.07, hy - S * 0.03, cx + S * 0.07, hy + S * 0.05, F.gun, F.steel, F.gunDk); // head box
  if (o.head === 'cyclops') optic(put, cx, hy + S * 0.01, S * 0.045, F.redDk, F.red, F.redLt);
  else if (o.head === 'twin') [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, hy + S * 0.01, S * 0.022, F.redDk, F.red, F.redLt));
  else { // visor slit (default, matches ref) + antenna cluster
    plate(put, cx - S * 0.06, hy, cx + S * 0.06, hy + S * 0.02, F.oil, F.gunDk, F.oil);
    for (let x = cx - S * 0.055; x < cx + S * 0.055; x += 2) put(Math.round(x), Math.round(hy + S * 0.01), F.cyan);
  }
  // antenna cluster
  [-1, 0, 1].forEach(s => { stroke(put, cx + s * S * 0.03, hy - S * 0.03, cx + s * S * 0.05, hy - S * 0.1 - Math.abs(s) * S * 0.01, 1.4, () => F.steelMd); ell(put, cx + s * S * 0.05, hy - S * 0.1 - Math.abs(s) * S * 0.01, S * 0.012, S * 0.012, () => (s ? F.red : F.cyan)); });
}
// ---- weapon arms -------------------------------------------------------
function pauldron(put, S, x, y, acc) { dome(put, x, y, S * 0.09, S * 0.08, F.steelMd, F.steelLt, F.steelDkk); plate(put, x - S * 0.06, y - S * 0.02, x + S * 0.06, y + S * 0.02, acc, F.copperLt, F.rustDk); weather(put, x - S * 0.08, y - S * 0.06, x + S * 0.08, y + S * 0.06); }
function armGatling(put, S, x, acc) {
  plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); // housing
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) ell(put, x + Math.cos(a) * S * 0.025, S * 0.6 + Math.sin(a) * S * 0.025, S * 0.014, S * 0.014, () => F.oil); // barrel ring
  ell(put, x, S * 0.6, S * 0.02, S * 0.02, () => F.steelDk);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; plate(put, x + Math.cos(a) * S * 0.03 - S * 0.008, S * 0.56, x + Math.cos(a) * S * 0.03 + S * 0.008, S * 0.72, F.steelMd, F.steel, F.steelDkk); }
}
function armCannon(put, S, x, acc) { plate(put, x - S * 0.06, S * 0.42, x + S * 0.06, S * 0.54, F.gun, F.steel, F.gunDk); plate(put, x - S * 0.04, S * 0.54, x + S * 0.04, S * 0.74, F.steelMd, F.steel, F.steelDkk); ell(put, x, S * 0.75, S * 0.045, S * 0.05, () => F.oil); ell(put, x, S * 0.75, S * 0.02, S * 0.02, () => F.molten); plate(put, x - S * 0.05, S * 0.6, x + S * 0.05, S * 0.63, acc, F.copperLt, F.rustDk); }
function armDrill(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); for (let y = S * 0.56; y < S * 0.78; y++) { const t = (y - S * 0.56) / 0.22 / S; const hw = lerp(S * 0.06, S * 0.005, (y - S * 0.56) / (S * 0.22)); row(put, Math.round(y), x - hw, x + hw, (tx) => { let b = mix(F.chrome, F.steelDk, tx); if ((Math.round(y) + Math.round((tx - 0.5) * 8)) % 4 < 2) b = mix(b, F.steelDkk, 0.5); return b; }); } }
function armClaw(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); [-1, 0, 1].forEach(s => stroke(put, x + s * S * 0.03, S * 0.56, x + s * S * 0.07, S * 0.72, S * 0.02, () => F.chromeMd)); [-1, 0, 1].forEach(s => stroke(put, x + s * S * 0.07, S * 0.72, x + s * S * 0.05, S * 0.78, S * 0.015, () => F.steel)); optic(put, x, S * 0.5, S * 0.02, F.cyanDk, F.cyan, F.cyanLt); }
function armMissile(put, S, x, acc) { plate(put, x - S * 0.06, S * 0.44, x + S * 0.06, S * 0.66, F.gun, F.steel, F.gunDk); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const mx = x - S * 0.03 + c * S * 0.06, my = S * 0.48 + r * S * 0.09; ell(put, mx, my, S * 0.022, S * 0.022, () => F.oil); put(Math.round(mx), Math.round(my), F.red); } plate(put, x - S * 0.06, S * 0.44, x + S * 0.06, S * 0.46, acc, F.copperLt, F.rustDk); }
function armBuzzsaw(put, S, x, acc) { plate(put, x - S * 0.04, S * 0.42, x + S * 0.04, S * 0.56, F.gun, F.steel, F.gunDk); ell(put, x, S * 0.68, S * 0.1, S * 0.1, (tx, ty) => mix(F.chrome, F.steel, ty)); ell(put, x, S * 0.68, S * 0.04, S * 0.04, () => F.gunDk); for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) stroke(put, x + Math.cos(a) * S * 0.1, S * 0.68 + Math.sin(a) * S * 0.1, x + Math.cos(a) * S * 0.13, S * 0.68 + Math.sin(a) * S * 0.13, 1.4, () => F.chrome); }
function armFist(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); plate(put, x - S * 0.08, S * 0.56, x + S * 0.08, S * 0.74, F.iron, F.steel, F.ironDk); for (let k = 0; k < 4; k++) plate(put, x - S * 0.07 + k * S * 0.037, S * 0.56, x - S * 0.05 + k * S * 0.037, S * 0.6, F.steelDk, F.steelMd, F.oil); weather(put, x - S * 0.08, S * 0.56, x + S * 0.08, S * 0.74); }
const ARMS = { gatling: armGatling, cannon: armCannon, drill: armDrill, claw: armClaw, missile: armMissile, buzzsaw: armBuzzsaw, fist: armFist };
function mechBack(put, S, cx, kind) {
  if (kind === 'thrusters') [-1, 1].forEach(s => { plate(put, cx + s * S * 0.2, S * 0.34, cx + s * S * 0.27, S * 0.5, F.steelDk, F.steel, F.steelDkk); ell(put, cx + s * S * 0.235, S * 0.51, S * 0.03, S * 0.025, () => F.cyan); });
  else if (kind === 'stacks') [-1, 1].forEach(s => { for (let y = S * 0.2; y < S * 0.32; y++) row(put, Math.round(y), cx + s * S * 0.18, cx + s * S * 0.22, () => F.gunDk); ell(put, cx + s * S * 0.2, S * 0.2, S * 0.02, S * 0.015, () => F.oil); put(Math.round(cx + s * S * 0.2), Math.round(S * 0.18), F.ember); });
  else if (kind === 'missiles') [-1, 1].forEach(s => { plate(put, cx + s * S * 0.18, S * 0.26, cx + s * S * 0.28, S * 0.38, F.iron, F.steel, F.ironDk); for (let k = 0; k < 3; k++) { const my = S * 0.28 + k * S * 0.035; ell(put, cx + s * S * 0.26, my, S * 0.014, S * 0.014, () => F.red); } });
}
function drawMech(put, S, o) {
  shadow(put, S, S * 0.5, S * 0.26, S * 0.94);
  const cx = S * 0.5;
  if (o.back) mechBack(put, S, cx, o.back);
  mechLegs(put, S, cx, o.acc);
  // shoulders + arms
  [-1, 1].forEach(s => {
    const type = s < 0 ? o.left : o.right, ax = cx + s * S * 0.26;
    pauldron(put, S, ax, S * 0.3, o.acc);
    (ARMS[type] || armGatling)(put, S, ax, o.acc);
  });
  mechTorso(put, S, cx, o);
  mechHead(put, S, cx, o);
}

// ---- factory TILES (seamless, deterministic hash — no Math.random) ----
function fhash(x, y){ return ((x*73856093) ^ (y*19349663)) >>> 0; }
function drawFactoryFloor(put, W, H){
  for (var y=0;y<H;y++) for (var x=0;x<W;x++){
    var h=fhash(x,y)%100, b=F.steelDk;
    if (h<34) b=F.steelDkk; else if (h<64) b=F.steelDk; else if (h<80) b=F.iron; else if (h<93) b=F.ironDk;
    if (h>96) b=F.steelMd;
    put(x,y,b);
  }
  // panel seams every 24, rivets at panel corners every 12
  for (var yy=0;yy<H;yy++){ if (yy%24===0) for (var xx=0;xx<W;xx++) put(xx,yy,F.oil); }
  for (var xx2=0;xx2<W;xx2++){ if (xx2%24===0) for (var yy2=0;yy2<H;yy2++) put(xx2,yy2,F.oil); }
  for (var ry=6;ry<H;ry+=12) for (var rx=6;rx<W;rx+=12){ put(rx,ry,F.steelLt); put(rx,ry+1,F.steelDkk); }
}
function drawFactoryCatwalk(put, W, H){
  for (var y=0;y<H;y++) for (var x=0;x<W;x++){
    // grate bars every 6px, dark gaps between
    var bar = (x%6)<3, b = bar ? (F.steel) : F.oil;
    var h=fhash(x*3,y)%100; if (bar && h>82) b=F.steelLt; if (bar && h<20) b=F.steelMd;
    put(x,y,b);
  }
  // cross ribs
  for (var yy=0;yy<H;yy+=8) for (var xx=0;xx<W;xx++) put(xx,yy,F.steelDkk);
}
function drawFactoryHazard(put, W, H){
  var per=8;
  for (var y=0;y<H;y++) for (var x=0;x<W;x++)
    put(x,y,(Math.floor((x+y)/per)%2===0)?F.hazard:F.hazardDk);
}
function drawBeltTile(put, W, H){
  // flush rubber travelator; full-width yellow chevrons pointing up-belt, base
  // every 16px (divides 48). Apex at center; edges meet across tiles -> a WIDE
  // tileSprite reads as one continuous airport-walkway surface, seamless scroll.
  for (var y=0;y<H;y++) for (var x=0;x<W;x++){
    var h=fhash(x,y*2)%100; put(x,y,(h<50?F.rubber:F.rubberDk));
  }
  var half=W/2;
  for (var cy=0;cy<H;cy+=16){
    for (var x=0;x<W;x++){
      var yy=(cy + Math.round(Math.abs(x-half)*0.6))%H;
      put(x,yy,F.hazard); put(x,(yy+1)%H,F.hazard); put(x,(yy+2)%H,F.brassDk);
    }
  }
}
// ---- boss aliases (approved picks) ----
function drawEngineer(put, S){ drawOverseer(put, S); }
function drawMechBoss(put, S){ drawMech(put, S, { acc: F.hazard, left: "drill", right: "gatling", head: "visor", cockpit: "open", back: "stacks" }); }


return {
  drawSparkbot: drawSparkbot, drawHiveDrone: drawHiveDrone, drawArcWelder: drawArcWelder,
  drawScrapHulk: drawScrapHulk, drawBuzzsaw: drawBuzzsaw, drawMagCrane: drawMagCrane,
  drawForgeHound: drawForgeHound, drawCoolantTank: drawCoolantTank, drawBulwark: drawBulwark,
  drawRepairUnit: drawRepairUnit, drawWarframe: drawWarframe, drawPurgeFlamer: drawPurgeFlamer,
  drawEngineer: drawEngineer, drawMech: drawMechBoss,
  drawFactoryFloor: drawFactoryFloor, drawFactoryCatwalk: drawFactoryCatwalk,
  drawFactoryHazard: drawFactoryHazard, drawBeltTile: drawBeltTile
};
})();

  Object.assign(API, FACTORY_ART);

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.WORLD_ART = API;
})(typeof window !== 'undefined' ? window : this);
