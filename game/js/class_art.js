// ============================================================================
// class_art.js — hi-fi 64px procedural pixel art for the WIZARD and KNIGHT
// (2026-07-14). The user picked these from rendered design grids:
//   WIZARD = "Starweaver" (grid #3): deep-navy robe scattered with gold stars,
//            wide-brim pointed hat WITH stars on the cone (user add), gold
//            hem trim + belt. Staff = dark oak shaft crowned with a GOLD STAR.
//   KNIGHT = "Dark Knight" (grid #6): gunmetal plate, RED eye-glow in the
//            visor slit, spiked pauldrons, short horns, red chest emblem.
//            Sword = long gunmetal blade, red-gem crossguard.
// Same contract as ranger_art.js: pure pixel-plotting through put(x,y,'#hex'),
// runs in Node (design previews) and the browser (textures.js builds the
// spritesheets at boot). Idle + walk frames driven by {frame:'idle'|'walk',
// t:0..1} exactly like RANGER_ART.drawBody, so textures.js reuses one builder.
// Depends on RANGER_ART for the shared primitives (loads after it).
// ============================================================================
(function (root) {
  'use strict';

  var R = (typeof module !== 'undefined' && module.exports)
    ? require('./ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, lerp = R.lerp;
  var rowSpan = R.rowSpan, ellipseFill = R.ellipseFill, stroke = R.stroke;

  var C = {
    OUT: '#1a1c2c',
    // starweaver navy family + gold
    NAVY_HI: '#3b5dc9', NAVY: '#29366f', NAVY_DK: '#1f2a52', NAVY_XD: '#141b38',
    GOLD: '#ffcd75', GOLD_DK: '#ef7d57', GOLD_HI: '#ffe9b0',
    SKIN: '#e8b796', SKIN_DK: '#c68a63', SKIN_HI: '#f6d3b0',
    LEATHER: '#7a4a2b', LEATHER_DK: '#4d2f1c',
    WHITE: '#f4f4f4',
    // dark-knight gunmetal family + red
    STEEL: '#94b0c2', STEEL_MD: '#566c86', IRON: '#333c57', IRON_XD: '#12141f',
    RED: '#b13e53', RED_GLOW: '#ff5a5a', RED_HI: '#ffb0b0'
  };

  // a 5px gold star (+ white heart when bright) — the starweaver's signature
  function star(put, x, y, bright) {
    x = Math.round(x); y = Math.round(y);
    put(x, y, bright ? C.WHITE : C.GOLD_HI);
    put(x - 1, y, C.GOLD); put(x + 1, y, C.GOLD);
    put(x, y - 1, C.GOLD); put(x, y + 1, C.GOLD);
  }

  // ======================================================== WIZARD (body) ===
  function drawWizardBody(put, S, opts) {
    opts = opts || {}; var t = opts.t || 0, walking = opts.frame === 'walk';
    var u = S / 16, cx = S * 0.5;
    var theta = t * Math.PI * 2;
    var bob = 0, legL = 0, legR = 0, sway = 0, breathe = 0;
    if (walking) {
      bob = -Math.abs(Math.sin(theta)) * 0.9 * u;
      legL = Math.sin(theta); legR = Math.sin(theta + Math.PI);
      sway = Math.sin(theta) * 1.2 * u;
    } else {
      breathe = Math.sin(theta) * 0.5 * u;
      bob = Math.sin(theta) * 0.3 * u;
      sway = Math.sin(theta) * 0.7 * u;
    }
    // star twinkle phase: stars breathe brightness on idle, shimmer on walk
    var twinkle = Math.sin(theta * (walking ? 2 : 1));

    var faceTop = S * 0.16 + bob, faceBot = S * 0.30 + bob;
    var shoulderY = S * 0.345 + bob;
    var waistY = S * 0.55 + bob + breathe * 0.4;
    var hemY = S * 0.85 + bob;                     // long robe — boots peek out
    var hipY = S * 0.70 + bob;
    var footY = S * 0.955;

    // -- legs + boots (mostly hidden by the robe; feet peek + stride shows) --
    function drawLeg(sign, swing) {
      var legW = S * 0.07;
      var x = cx + sign * S * 0.07 + swing * S * 0.03;
      var lift = walking ? Math.max(0, swing) * S * 0.025 : 0;   // small — boots must stay visible under the hem
      var botY = footY - lift;
      for (var y = Math.round(hipY); y < Math.round(botY); y++) {
        var tv = (y - hipY) / (botY - hipY);
        rowSpan(put, y, x - legW / 2, x + legW / 2, function (tx) {
          return mix(C.NAVY_DK, C.NAVY_XD, 0.3 + tv * 0.5 + (tx > 0.7 ? 0.2 : 0));
        });
      }
      var bootTop = botY - S * 0.05, bw = legW * 1.5;
      for (var by = Math.round(bootTop); by < Math.round(botY); by++) {
        rowSpan(put, by, x - bw * 0.35, x + bw * 0.7, function (tx) {
          return mix(C.IRON, C.OUT, 0.3 + tx * 0.4);
        });
      }
    }
    drawLeg(-1, legL); drawLeg(1, legR);

    // -- robe (navy, flared, swaying hem, gold trim band) --------------------
    function robeHalf(y) {
      if (y < shoulderY) return lerp(S * 0.13, S * 0.20, (y - (shoulderY - S * 0.03)) / (S * 0.06));
      if (y < waistY) return lerp(S * 0.20, S * 0.155, (y - shoulderY) / (waistY - shoulderY));
      return lerp(S * 0.155, S * 0.235, (y - waistY) / (hemY - waistY));   // wide flare
    }
    for (var y = Math.round(shoulderY - S * 0.02); y < Math.round(hemY); y++) {
      var half = robeHalf(y);
      var hemLocal = clamp((y - waistY) / (hemY - waistY), 0, 1);
      var s = sway * hemLocal;
      var vt = (y - shoulderY) / (hemY - shoulderY);
      var trim = y >= hemY - S * 0.035;                        // gold hem band
      rowSpan(put, y, cx - half + s, cx + half + s, function (tx) {
        if (trim) return mix(C.GOLD, C.GOLD_DK, 0.15 + tx * 0.4);
        var base = mix(C.NAVY_HI, C.NAVY, clamp(vt * 1.5, 0, 1));
        base = mix(base, C.NAVY_DK, clamp((vt - 0.4) * 1.2, 0, 1));
        base = mix(base, C.NAVY_XD, clamp((vt - 0.75) * 1.6, 0, 1));
        if (tx < 0.16) base = mix(base, C.NAVY_HI, 0.55);
        if (tx > 0.86) base = mix(base, C.NAVY_XD, 0.55);
        var f1 = Math.abs(tx - 0.38), f2 = Math.abs(tx - 0.66);
        if (f1 < 0.045 && vt > 0.25) base = mix(base, C.NAVY_XD, 0.5);
        if (f2 < 0.045 && vt > 0.25) base = mix(base, C.NAVY_XD, 0.45);
        return base;
      });
    }
    // gold stars scattered on the robe (sway with the hem; twinkle)
    [[-0.45, 0.62, 0], [0.4, 0.68, 1], [-0.15, 0.78, 2], [0.55, 0.8, 0], [0.1, 0.6, 1]]
      .forEach(function (sp, i) {
        var sy = S * sp[1] + bob;
        var hemL = clamp((sy - waistY) / (hemY - waistY), 0, 1);
        var sx = cx + sp[0] * robeHalf(sy) * 0.8 + sway * hemL;
        star(put, sx, sy, twinkle > 0.3 && (i % 2 === 0));
      });

    // -- belt + gold buckle ---------------------------------------------------
    (function () {
      var by = Math.round(waistY), h = Math.max(2, Math.round(u * 1.1));
      var half = robeHalf(waistY) * 0.98;
      for (var k = 0; k < h; k++) rowSpan(put, by + k, cx - half, cx + half, function (tx) {
        return mix(C.LEATHER_DK, C.OUT, 0.2 + tx * 0.4);
      });
      var bkw = Math.max(2, Math.round(u * 1.6));
      for (var yy = 0; yy < h + 1; yy++) rowSpan(put, by + yy, cx - bkw / 2, cx + bkw / 2, function () { return C.GOLD; });
      put(Math.round(cx), by + Math.floor(h / 2), C.GOLD_DK);
    })();

    // -- baked sleeve arms: rear hangs, lead bends toward the staff side ------
    (function () {
      var armW = Math.max(2, S * 0.075);
      function sleeve(x0, y0, x1, y1, shade) {
        stroke(put, x0, y0, x1, y1, armW, function () { return mix(C.NAVY, C.NAVY_XD, shade); });
      }
      function hand(hx, hy) {
        ellipseFill(put, hx, hy, u * 0.72, u * 0.72, function (tx, ty) { return mix(C.SKIN, C.SKIN_DK, 0.2 + ty * 0.4); });
      }
      var swD = walking ? legR * S * 0.02 : 0;
      // rear (left) arm: hangs along the robe
      sleeve(cx - S * 0.16, shoulderY + S * 0.03, cx - S * 0.185, bob + S * 0.5 + swD, 0.55);
      hand(cx - S * 0.185, bob + S * 0.525 + swD);
      // lead (right) arm: STRETCHED OUT to the side (user 2026-07-14, ref
      // image: a wandering wizard planting his staff at arm's length) — the
      // staff stands at this hand, clear of the robe, not overlapping the body.
      sleeve(cx + S * 0.16, shoulderY + S * 0.03, cx + S * 0.295, bob + S * 0.42 - swD, 0.4);
      hand(cx + S * 0.305, bob + S * 0.435 - swD);
    })();

    // -- face (bare head under the hat brim) ----------------------------------
    (function () {
      var fcx = cx, fcy = (faceTop + faceBot) / 2, frx = S * 0.10, fry = S * 0.085;
      ellipseFill(put, fcx, fcy, frx, fry, function (tx, ty) {
        var b = mix(C.SKIN_HI, C.SKIN, clamp(tx * 1.1, 0, 1));
        b = mix(b, C.SKIN_DK, clamp((ty - 0.5) * 1.3, 0, 1));
        if (ty < 0.2) b = mix(b, C.SKIN_DK, 0.35 * (1 - ty / 0.2));   // brim shadow
        return b;
      });
      var eyeY = Math.round(fcy + fry * 0.1);
      var ew = Math.max(1, Math.round(u * 0.8)), eh = Math.max(1, Math.round(u * 0.9));
      var exo = Math.max(1, Math.round(frx * 0.48));
      for (var i = 0; i < 2; i++) {
        var ex = Math.round(fcx) + (i ? exo : -exo) - Math.floor(ew / 2);
        for (var yy = 0; yy < eh; yy++) for (var xx = 0; xx < ew; xx++) put(ex + xx, eyeY + yy, C.OUT);
        put(ex, eyeY, '#bfe3ff');                              // arcane catchlight
      }
      put(Math.round(fcx), eyeY, C.SKIN_HI);
    })();

    // -- the STARWEAVER HAT: wide brim + tilted cone + gold band + STARS ------
    (function () {
      var brimY = faceTop - S * 0.005;
      var tipY = brimY - S * 0.24;
      var tilt = S * -0.07;                                   // tip leans left (as picked)
      var baseHalf = S * 0.115;
      for (var y = Math.round(tipY); y < Math.round(brimY); y++) {
        var tt = (y - tipY) / (brimY - tipY);                 // 0 tip → 1 base
        var bend = tilt * Math.pow(1 - tt, 1.6) + sway * 0.15 * (1 - tt);
        var half = lerp(S * 0.014, baseHalf, Math.pow(tt, 0.85));
        rowSpan(put, y, cx + bend - half, cx + bend + half, function (tx) {
          var b = mix(C.NAVY, C.NAVY_DK, clamp(tt * 1.3, 0, 1));
          if (tx < 0.2) b = mix(b, C.NAVY_HI, 0.5);
          if (tx > 0.82) b = mix(b, C.NAVY_XD, 0.5);
          return b;
        });
      }
      // gold band above the brim
      for (var by2 = Math.round(brimY - S * 0.035); by2 < Math.round(brimY); by2++)
        rowSpan(put, by2, cx - baseHalf * 0.92, cx + baseHalf * 0.92, function (tx) {
          return mix(C.GOLD, C.GOLD_DK, 0.15 + tx * 0.4);
        });
      // wide brim
      var brimHalf = S * 0.19, bh = Math.max(2, Math.round(S / 26));
      for (var y3 = 0; y3 < bh; y3++)
        rowSpan(put, Math.round(brimY) + y3, cx - brimHalf + sway * 0.1, cx + brimHalf + sway * 0.1, function (tx) {
          return mix(C.NAVY, C.NAVY_XD, 0.25 + Math.abs(tx - 0.35) * 0.5);
        });
      // STARS ON THE HAT (user 2026-07-14: "some of the stars from his chest
      // on his hat also") — two on the cone + one riding the very tip.
      star(put, cx + tilt * 0.45 - S * 0.03, tipY + (brimY - tipY) * 0.42, twinkle > 0);
      star(put, cx + tilt * 0.15 + S * 0.045, tipY + (brimY - tipY) * 0.72, twinkle < 0);
      star(put, cx + tilt + sway * 0.15, tipY - S * 0.015, true);   // tip star — always lit
    })();
  }

  // ======================================================== WIZARD (staff) ==
  // Drawn POINTING RIGHT (rotation 0 = aim 0) like every held texture. The
  // upright carry in updatePlayer stands it up with -90°. Dark oak shaft,
  // gold ferrules, crowned with a BIG GOLD STAR head at the right end.
  function drawStaffHi(put, W, H) {
    var cy = H * 0.5;
    var x0 = W * 0.04, x1 = W * 0.80;                          // shaft span
    var shaftW = Math.max(2, Math.round(H * 0.14));   // skinny walking staff (user 2026-07-14)
    stroke(put, x0, cy, x1, cy, shaftW, function (t2, ox, oy) {
      var b = mix(C.LEATHER, C.LEATHER_DK, 0.25 + t2 * 0.35);
      if (oy < -shaftW * 0.2) b = mix(b, '#9a6a44', 0.5);      // top-light
      return b;
    });
    // butt cap + two gold ferrules (slim, riding the skinny shaft)
    stroke(put, x0, cy, x0 + W * 0.02, cy, shaftW * 1.2, function () { return C.GOLD_DK; });
    stroke(put, W * 0.30, cy, W * 0.325, cy, shaftW * 1.25, function () { return C.GOLD; });
    stroke(put, W * 0.60, cy, W * 0.625, cy, shaftW * 1.25, function () { return C.GOLD; });
    // star head: soft navy glow, then a fat 4-point gold star
    var hx = W * 0.88, r = H * 0.42;
    ellipseFill(put, hx, cy, r, r, function (tx, ty) {
      var d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      return d > 0.85 ? null : mix(C.NAVY_HI, C.NAVY_DK, d);
    });
    function ray(dx, dy, len) {
      stroke(put, hx, cy, hx + dx * len, cy + dy * len, Math.max(2, H * 0.16),
        function (t3) { return mix(C.GOLD_HI, C.GOLD, t3); });
    }
    ray(1, 0, r * 0.95); ray(-1, 0, r * 0.95); ray(0, 1, r * 0.95); ray(0, -1, r * 0.95);
    ray(0.7, 0.7, r * 0.5); ray(-0.7, 0.7, r * 0.5); ray(0.7, -0.7, r * 0.5); ray(-0.7, -0.7, r * 0.5);
    ellipseFill(put, hx, cy, r * 0.22, r * 0.22, function () { return C.WHITE; });
  }

  // ======================================================== KNIGHT (body) ===
  function drawKnightBody(put, S, opts) {
    opts = opts || {}; var t = opts.t || 0, walking = opts.frame === 'walk';
    var u = S / 16, cx = S * 0.5;
    var theta = t * Math.PI * 2;
    var bob = 0, legL = 0, legR = 0, breathe = 0;
    if (walking) {
      bob = -Math.abs(Math.sin(theta)) * 0.8 * u;              // heavier gait than the ranger
      legL = Math.sin(theta); legR = Math.sin(theta + Math.PI);
    } else {
      breathe = Math.sin(theta) * 0.4 * u;
      bob = Math.sin(theta) * 0.25 * u;
    }
    // the red visor glow breathes on idle, burns steady on walk
    var glowT = walking ? 1 : (Math.sin(theta) * 0.5 + 0.5);

    var helmTop = S * 0.06 + bob, helmBot = S * 0.315 + bob;
    var shoulderY = S * 0.345 + bob;
    var waistY = S * 0.58 + bob + breathe * 0.4;
    var fauldBot = S * 0.68 + bob;
    var hipY = S * 0.66 + bob;
    var footY = S * 0.955;

    // -- legs: dark greaves + iron sabatons -----------------------------------
    function drawLeg(sign, swing) {
      var legW = S * 0.085;
      var x = cx + sign * S * 0.075 + swing * S * 0.028;
      var lift = walking ? Math.max(0, swing) * S * 0.05 : 0;
      var botY = footY - lift;
      for (var y = Math.round(hipY); y < Math.round(botY); y++) {
        var tv = (y - hipY) / (botY - hipY);
        rowSpan(put, y, x - legW / 2, x + legW / 2, function (tx) {
          var col = mix(C.IRON, C.IRON_XD, 0.25 + tv * 0.55);
          if (tx < 0.28) col = mix(col, C.STEEL_MD, 0.45);      // left edge light
          // knee plate seam
          if (Math.abs(tv - 0.45) < 0.05) col = mix(col, C.OUT, 0.4);
          return col;
        });
      }
      var bootTop = botY - S * 0.06, bw = legW * 1.45;
      for (var by = Math.round(bootTop); by < Math.round(botY); by++) {
        rowSpan(put, by, x - bw * 0.35, x + bw * 0.72, function (tx) {
          return mix(C.IRON_XD, C.OUT, 0.3 + tx * 0.4);
        });
      }
    }
    drawLeg(-1, legL); drawLeg(1, legR);

    // -- cuirass: gunmetal, center ridge, red emblem; faulds below the belt ---
    function torsoHalf(y) {
      if (y < waistY) return lerp(S * 0.155, S * 0.125, (y - shoulderY) / (waistY - shoulderY));
      return lerp(S * 0.125, S * 0.15, (y - waistY) / (fauldBot - waistY));   // faulds flare back out
    }
    for (var y = Math.round(shoulderY - S * 0.02); y < Math.round(fauldBot); y++) {
      var half = torsoHalf(y);
      var vt = (y - shoulderY) / (fauldBot - shoulderY);
      var isFauld = y > waistY + u * 1.2;
      rowSpan(put, y, cx - half, cx + half, function (tx) {
        var base = mix(C.STEEL_MD, C.IRON, clamp(vt * 1.4, 0, 1));
        base = mix(base, C.IRON_XD, clamp((vt - 0.5) * 1.3, 0, 1));
        if (tx < 0.15) base = mix(base, C.STEEL, 0.45);          // rim light
        if (tx > 0.85) base = mix(base, C.IRON_XD, 0.55);
        if (Math.abs(tx - 0.5) < 0.035 && !isFauld) base = mix(base, C.STEEL_MD, 0.5);  // ridge
        if (isFauld) {
          // horizontal plate cuts on the faulds
          if (((y - waistY) % Math.max(2, Math.round(u * 1.4))) < 1) base = mix(base, C.OUT, 0.4);
        }
        return base;
      });
    }
    // red chest emblem
    ellipseFill(put, cx, shoulderY + S * 0.085, S * 0.032, S * 0.032, function (tx, ty) {
      return mix(C.RED, '#7a1f38', ty * 0.6);
    });
    put(Math.round(cx), Math.round(shoulderY + S * 0.075), C.RED_HI);
    // belt: near-black with a red buckle
    (function () {
      var by = Math.round(waistY), h = Math.max(2, Math.round(u * 1.1));
      var half = torsoHalf(waistY) * 0.99;
      for (var k = 0; k < h; k++) rowSpan(put, by + k, cx - half, cx + half, function (tx) {
        return mix(C.IRON_XD, C.OUT, 0.3 + tx * 0.3);
      });
      var bkw = Math.max(2, Math.round(u * 1.5));
      for (var yy = 0; yy < h; yy++) rowSpan(put, by + yy, cx - bkw / 2, cx + bkw / 2, function () { return C.RED; });
    })();

    // -- baked rear arm: dark gauntlet bent to the off side (sword is held) ---
    (function () {
      var armW = Math.max(2, S * 0.08);
      var swD = walking ? legR * S * 0.02 : 0;
      stroke(put, cx - S * 0.15, shoulderY + S * 0.035, cx - S * 0.195, bob + S * 0.5 + swD, armW,
        function (t2) { return mix(C.IRON, C.IRON_XD, 0.3 + t2 * 0.4); });
      ellipseFill(put, cx - S * 0.195, bob + S * 0.525 + swD, u * 0.8, u * 0.8,
        function (tx, ty) { return mix(C.STEEL_MD, C.IRON_XD, 0.3 + ty * 0.5); });  // fist
    })();

    // -- spiked pauldrons ------------------------------------------------------
    (function () {
      for (var f = -1; f <= 1; f += 2) {
        var px = cx + f * S * 0.175, py = shoulderY + S * 0.01, r = S * 0.07;
        // spike first (pauldron dome overlaps its root) — angled OUTWARD, away
        // from the helm horns, so the two never read as one antenna cluster
        stroke(put, px + f * r * 0.4, py - r * 0.35, px + f * r * 1.6, py - r * 1.05, Math.max(2, S * 0.028),
          function (t2) { return mix(C.STEEL, C.STEEL_MD, t2); });
        put(Math.round(px + f * r * 1.65), Math.round(py - r * 1.1), C.WHITE);   // glint
        ellipseFill(put, px, py, r, r * 0.85, function (tx, ty) {
          var b = mix(C.STEEL_MD, C.IRON, 0.2 + ty * 0.65);
          if (ty < 0.3 && tx < 0.5) b = mix(b, C.STEEL, 0.4);
          return b;
        });
      }
    })();

    // -- HELM: full gunmetal helm, short horns, RED GLOW in the visor slit ----
    (function () {
      function helmHalf(y) {
        var tt = (y - helmTop) / (helmBot - helmTop);
        var e = Math.sin(clamp(tt, 0, 1) * Math.PI * 0.5);
        return lerp(S * 0.045, S * 0.125, e);
      }
      // short horns first (helm dome overlaps their roots) — kept stubby so
      // they stay clear of the outward pauldron spikes
      for (var f = -1; f <= 1; f += 2) {
        var hx0 = cx + f * S * 0.1, hy0 = helmTop + S * 0.085;
        stroke(put, hx0, hy0, hx0 + f * S * 0.05, hy0 - S * 0.06, Math.max(2, S * 0.03),
          function (t2) { return mix(C.STEEL_MD, C.IRON, t2); });
        put(Math.round(hx0 + f * S * 0.055), Math.round(hy0 - S * 0.065), C.STEEL);
      }
      for (var y = Math.round(helmTop); y < Math.round(helmBot); y++) {
        var hh = helmHalf(y);
        var vt2 = (y - helmTop) / (helmBot - helmTop);
        rowSpan(put, y, cx - hh, cx + hh, function (tx) {
          var b = mix(C.STEEL_MD, C.IRON, clamp(vt2 * 1.25, 0, 1));
          if (tx < 0.18) b = mix(b, C.STEEL, 0.45);
          if (tx > 0.82) b = mix(b, C.IRON_XD, 0.5);
          return b;
        });
      }
      // visor slit + breathing red glow
      var vy = Math.round(helmTop + (helmBot - helmTop) * 0.62);
      var vHalf = helmHalf(vy) * 0.72;
      for (var k = 0; k < 2; k++) rowSpan(put, vy + k, cx - vHalf, cx + vHalf, function () { return C.OUT; });
      var eye = mix(C.RED, C.RED_GLOW, glowT);
      var exo = Math.max(2, Math.round(S * 0.045));
      put(Math.round(cx - exo), vy, eye); put(Math.round(cx - exo) + 1, vy, eye);
      put(Math.round(cx + exo), vy, eye); put(Math.round(cx + exo) - 1, vy, eye);
      if (glowT > 0.6) { put(Math.round(cx - exo), vy + 1, C.RED); put(Math.round(cx + exo), vy + 1, C.RED); }
      // chin vents
      var cvy = vy + Math.max(2, Math.round(u * 1.4));
      for (var i = -1; i <= 1; i++) put(Math.round(cx + i * 2), cvy, C.OUT);
    })();
  }

  // ======================================================== KNIGHT (sword) ==
  // POINTING RIGHT: dark pommel + wrapped grip at the LEFT (hand end), iron
  // crossguard with a red gem, then a long gunmetal blade with a bright edge
  // to a white tip. The held sprite sweeps through meleeSwing's arc in-game.
  function drawSwordHi(put, W, H) {
    var cy = H * 0.5;
    var gripX0 = W * 0.02, gripX1 = W * 0.16, guardX = W * 0.20, tipX = W * 0.97;
    // pommel: red-gem cap
    ellipseFill(put, gripX0 + H * 0.12, cy, H * 0.18, H * 0.18, function (tx, ty) {
      return mix(C.RED, '#7a1f38', ty * 0.7);
    });
    // wrapped grip
    stroke(put, gripX0 + H * 0.2, cy, gripX1, cy, Math.max(2, H * 0.28), function (t2) {
      return (Math.floor(t2 * 6) % 2) ? C.IRON_XD : mix(C.LEATHER_DK, C.OUT, 0.3);
    });
    // crossguard: vertical iron bar with a red gem heart
    stroke(put, guardX, cy - H * 0.42, guardX, cy + H * 0.42, Math.max(2, H * 0.2), function (t2) {
      return mix(C.STEEL_MD, C.IRON, 0.25 + t2 * 0.4);
    });
    put(Math.round(guardX), Math.round(cy), C.RED_GLOW);
    put(Math.round(guardX), Math.round(cy) - 1, C.RED);
    put(Math.round(guardX), Math.round(cy) + 1, '#7a1f38');
    // blade: gunmetal with a dark fuller and a bright upper edge, tapering tip
    var bx0 = guardX + H * 0.12;
    for (var x = Math.round(bx0); x <= Math.round(tipX); x++) {
      var t2 = (x - bx0) / (tipX - bx0);
      var hw = Math.max(1, H * 0.24 * (t2 > 0.86 ? (1 - (t2 - 0.86) / 0.14) : 1));
      for (var dy = -Math.round(hw); dy <= Math.round(hw); dy++) {
        var fy = dy / (hw || 1);
        var c = mix(C.STEEL, C.STEEL_MD, 0.3 + Math.abs(fy) * 0.4);
        if (fy < -0.55) c = mix(C.WHITE, C.STEEL, 0.35);         // top edge light
        if (Math.abs(fy) < 0.18) c = mix(c, C.IRON, 0.5);        // fuller groove
        if (fy > 0.6) c = mix(c, C.IRON, 0.45);                  // bottom shade
        put(x, Math.round(cy) + dy, c);
      }
    }
    put(Math.round(tipX), Math.round(cy), C.WHITE);              // the point
  }

  var API = { C: C, drawWizardBody: drawWizardBody, drawStaffHi: drawStaffHi,
              drawKnightBody: drawKnightBody, drawSwordHi: drawSwordHi };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.CLASS_ART = API;
})(typeof window !== 'undefined' ? window : this);
