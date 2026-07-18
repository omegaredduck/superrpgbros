// ============================================================================
// ninja_art.js — hi-fi 64px procedural pixel art for the NINJA class
// (2026-07-17). "ONI KING" (Red's pick, boss-grade sheet #07): near-black gi +
// cloak with crimson accents, a RED fanged oni half-mask, glowing AMBER eyes,
// bone-gold HORNS off the hood, a shuriken cocked in the throwing hand. Same
// contract as ranger_art.js / class_art.js: pure put(x,y,'#hex') plotting,
// idle+walk frames driven by {frame,t}. Depends on RANGER_ART primitives.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('./ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, lerp = R.lerp, rowSpan = R.rowSpan, ellipseFill = R.ellipseFill, stroke = R.stroke;

  // Oni King palette. NOTE: the SILV_* keys drive the body/cloak/hood (now
  // near-black-crimson) and TEAL_* drive the ACCENTS (now crimson) — the body
  // code below is palette-driven, so only these values change the whole look.
  var C = {
    OUT: '#0d0710',
    SILV_HI: '#3a2028', SILV: '#241318', SILV_MD: '#180c11', SILV_DK: '#100810', SILV_XD: '#080409',
    TEAL_HI: '#ff6a6a', TEAL: '#e84545', TEAL_DK: '#8a2028',
    MASK: '#241018', MASK_DK: '#120809',
    SASH: '#2a1418', SASH_DK: '#150a0c',
    EYE: '#ffc24a', EYE_HI: '#ffe8a0', STEEL: '#e2c49a', STEEL_DK: '#a08050',
    ONI: '#c02828', ONI_HI: '#e84545', ONI_DK: '#7a1818', FANG: '#f4f0e8',
    HORN: '#e2c49a', HORN_HI: '#f4e2b0', HORN_DK: '#9a7038'
  };

  // a small 4-point shuriken star at (x,y)
  function shuriken(put, x, y, r) {
    x = Math.round(x); y = Math.round(y);
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 2;
      var tx = Math.round(x + Math.cos(a) * r), ty = Math.round(y + Math.sin(a) * r);
      R.stroke(put, x, y, tx, ty, 1, function () { return C.STEEL; });
      put(tx, ty, C.STEEL_DK);
    }
    put(x, y, C.SILV_DK); put(x, y - 1, C.STEEL_DK);
  }

  function drawBody(put, S, opts) {
    opts = opts || {}; var t = opts.t || 0, walking = opts.frame === 'walk';
    var u = S / 16, cx = S * 0.5, theta = t * Math.PI * 2;
    var bob = 0, legL = 0, legR = 0, sway = 0, breathe = 0;
    if (walking) { bob = -Math.abs(Math.sin(theta)) * 0.9 * u; legL = Math.sin(theta); legR = Math.sin(theta + Math.PI); sway = Math.sin(theta) * 1.1 * u; }
    else { breathe = Math.sin(theta) * 0.5 * u; bob = Math.sin(theta) * 0.3 * u; sway = Math.sin(theta) * 0.7 * u; }

    var hoodTop = S * 0.075 + bob, hoodBot = S * 0.31 + bob;
    var faceTop = S * 0.155 + bob, faceBot = S * 0.30 + bob;
    var shoulderY = S * 0.335 + bob, waistY = S * 0.55 + bob + breathe * 0.4;
    var hemY = S * 0.72 + bob, hipY = S * 0.66 + bob, footY = S * 0.955;

    // -- two shuriken slung over the LEFT shoulder (behind) --
    (function () {
      var qx = cx - S * 0.15, qy = shoulderY - S * 0.05;
      for (var i = 0; i < 2; i++) shuriken(put, qx - i * u * 1.6, qy - i * u * 1.1, Math.max(2, u * 1.2));
    })();

    // -- legs + boots (slate/silver) --
    function drawLeg(sign, swing) {
      var legW = S * 0.075, baseX = cx + sign * S * 0.072, swingX = swing * S * 0.028;
      var lift = walking ? Math.max(0, swing) * S * 0.05 : 0, topY = hipY, botY = footY - lift, x = baseX + swingX;
      for (var y = Math.round(topY); y < Math.round(botY); y++) {
        var tv = (y - topY) / (botY - topY), col = mix(C.SILV_MD, C.SILV_DK, 0.2 + tv * 0.5);
        rowSpan(put, y, x - legW / 2, x + legW / 2, function (tx) { return tx < 0.28 ? mix(col, C.SILV, 0.5) : col; });
      }
      var bootTop = botY - S * 0.06, bw = legW * 1.5;
      for (var by = Math.round(bootTop); by < Math.round(botY); by++)
        rowSpan(put, by, x - bw * 0.35, x + bw * 0.72, function (tx) { return mix(C.SILV_XD, C.OUT, 0.3 + tx * 0.4); });
      // teal shin wrap
      put(Math.round(x), Math.round(botY - S * 0.11), C.TEAL); put(Math.round(x) - 1, Math.round(botY - S * 0.11), C.TEAL_DK);
    }
    drawLeg(-1, legL); drawLeg(1, legR);

    // -- cloak body (pale silver, teal rim, folds, swaying hem) --
    function cloakHalf(y) {
      if (y < shoulderY) return lerp(S * 0.14, S * 0.205, (y - (shoulderY - S * 0.03)) / (S * 0.06));
      if (y < waistY) return lerp(S * 0.205, S * 0.165, (y - shoulderY) / (waistY - shoulderY));
      return lerp(S * 0.165, S * 0.22, (y - waistY) / (hemY - waistY));
    }
    for (var y = Math.round(shoulderY - S * 0.02); y < Math.round(hemY + S * 0.02); y++) {
      var half = cloakHalf(y), hemLocal = clamp((y - waistY) / (hemY - waistY), 0, 1), s = sway * hemLocal;
      var vt = (y - shoulderY) / (hemY - shoulderY), hemPull = 0;
      if (y > hemY - S * 0.055) hemPull = (y - (hemY - S * 0.055)) / (S * 0.055) * S * 0.03;
      rowSpan(put, y, cx - half + s + hemPull * 0.4, cx + half + s - hemPull * 0.4, function (tx) {
        var base = mix(C.SILV_HI, C.SILV, clamp(vt * 1.4, 0, 1));
        base = mix(base, C.SILV_DK, clamp((vt - 0.5) * 1.2, 0, 1));
        if (tx < 0.16) base = mix(base, C.TEAL_HI, 0.35);        // teal-tinged left rim light
        if (tx > 0.86) base = mix(base, C.SILV_XD, 0.55);
        var f1 = Math.abs(tx - 0.4), f2 = Math.abs(tx - 0.66);
        if (f1 < 0.05) base = mix(base, C.SILV_DK, 0.5);
        if (f2 < 0.05) base = mix(base, C.SILV_DK, 0.45);
        return base;
      });
    }

    // -- obi sash + teal knot at the waist --
    (function () {
      var by = Math.round(waistY), h = Math.max(1, Math.round(u * 1.2)), half = cloakHalf(waistY) * 0.98;
      for (var k = 0; k < h; k++) rowSpan(put, by + k, cx - half, cx + half, function (tx) { return mix(C.SASH, C.SASH_DK, 0.3 + tx * 0.5); });
      var kw = Math.max(2, Math.round(u * 1.4));
      for (var yy = 0; yy < h + 1; yy++) rowSpan(put, by + yy, cx - kw / 2, cx + kw / 2, function () { return C.TEAL; });
      put(Math.round(cx), by + Math.floor(h / 2), C.TEAL_DK);
      // hanging knot tail
      for (var ty = 0; ty < Math.round(S * 0.11); ty++) put(Math.round(cx), by + h + ty, mix(C.TEAL, C.TEAL_DK, ty / (S * 0.11)));
    })();

    // -- shoulder mantle (darker silver hood-collar) --
    (function () {
      for (var y = Math.round(shoulderY - S * 0.03); y < Math.round(shoulderY + S * 0.06); y++) {
        var vt = (y - (shoulderY - S * 0.03)) / (S * 0.09), half = lerp(S * 0.15, S * 0.20, vt);
        rowSpan(put, y, cx - half, cx + half, function (tx) {
          var b = mix(C.SILV_MD, C.SILV_XD, 0.3 + vt * 0.4);
          if (tx < 0.2) b = mix(b, C.SILV, 0.5); if (tx > 0.85) b = mix(b, C.OUT, 0.4); return b;
        });
      }
    })();

    // -- REAR (throw) arm cocked back, a shuriken pinched in the hand --
    (function () {
      var shHalf = cloakHalf(shoulderY), armW = Math.max(2, S * 0.078);
      function sleeve(x0, y0, x1, y1, shade) { stroke(put, x0, y0, x1, y1, armW, function () { return mix(C.SILV, C.SILV_DK, shade); }); }
      function wrap(x0, y0, x1, y1) { stroke(put, x0, y0, x1, y1, armW * 0.8, function () { return C.SASH; }); }
      var dsX = cx - shHalf * 0.6, dsY = shoulderY + S * 0.03;
      var deX = cx - S * 0.185, deY = bob + S * 0.47;                 // elbow out
      var dhX = cx - S * 0.03, dhY = bob + S * 0.40;                  // hand cocked near the jaw
      sleeve(dsX, dsY, deX, deY, 0.5); wrap(deX, deY, dhX, dhY);
      ellipseFill(put, dhX, dhY, u * 0.95, u * 0.95, function () { return C.SILV_XD; });   // gloved hand
      shuriken(put, dhX - u * 0.2, dhY - u * 0.6, Math.max(2, u * 1.3));                    // held star
    })();

    // -- hood (pale silver) --
    function hoodHalf(y) { var tt = (y - hoodTop) / (hoodBot - hoodTop), e = Math.sin(clamp(tt, 0, 1) * Math.PI * 0.5); return lerp(S * 0.055, S * 0.185, e); }
    for (var hy = Math.round(hoodTop); hy < Math.round(hoodBot); hy++) {
      var hh = hoodHalf(hy), vt2 = (hy - hoodTop) / (hoodBot - hoodTop);
      rowSpan(put, hy, cx - hh, cx + hh, function (tx) {
        var b = mix(C.SILV_HI, C.SILV, clamp(vt2 * 1.3, 0, 1));
        b = mix(b, C.SILV_MD, clamp((vt2 - 0.55) * 1.3, 0, 1));
        if (tx < 0.16) b = mix(b, C.STEEL, 0.6); if (tx > 0.84) b = mix(b, C.SILV_XD, 0.55); return b;
      });
    }

    // -- ONI HORNS emerging from the hood (bone-gold, curving up-out) --
    (function () {
      var baseY = Math.round(hoodTop + S * 0.06), n = Math.max(3, Math.round(S * 0.14));
      for (var side = -1; side <= 1; side += 2) {
        for (var k = 0; k < n; k++) {
          var tt = k / n;
          var x = Math.round(cx + side * (S * 0.07 + tt * tt * S * 0.07)), y = Math.round(baseY - k);
          put(x, y, mix(C.HORN, C.HORN_DK, tt));
          put(x - side, y, C.HORN_DK);
          if (tt < 0.55) put(x - side, y, mix(C.HORN, C.HORN_DK, 0.5 + tt));   // thicker base
          if (k === n - 1) put(x, y - 1, C.HORN_HI);                            // tip glint
        }
      }
    })();

    // -- ONI FACE: dark upper, glowing AMBER eyes, RED fanged half-mask --
    (function () {
      var fcx = cx, fcy = (faceTop + faceBot) / 2, frx = S * 0.105, fry = S * 0.088;
      ellipseFill(put, fcx, fcy, frx, fry, function (tx, ty) { return mix(C.MASK, C.MASK_DK, clamp(ty * 0.9 + 0.1, 0, 1)); });
      // amber glowing eyes (upper-middle)
      var eyeY = Math.round(fcy - fry * 0.08);
      var ew = Math.max(1, Math.round(u * 1.0)), exo = Math.max(1, Math.round(frx * 0.5));
      for (var i = 0; i < 2; i++) {
        var ex = Math.round(fcx) + (i ? exo : -exo) - Math.floor(ew / 2);
        for (var xx = 0; xx < ew; xx++) put(ex + xx, eyeY, C.EYE);
        put(ex, eyeY, C.EYE_HI);
      }
      // red oni half-mask over the lower face
      var mTop = Math.round(fcy + fry * 0.22);
      for (var yy = mTop; yy < Math.round(fcy + fry * 0.98); yy++) {
        var span = frx * Math.sqrt(Math.max(0, 1 - Math.pow((yy - fcy) / fry, 2)));
        rowSpan(put, yy, fcx - span, fcx + span, function (tx) { return mix(C.ONI_HI, C.ONI_DK, 0.15 + tx * 0.55); });
      }
      // white fangs along the mask's top edge
      for (var fk = -2; fk <= 2; fk++) {
        if (fk === 0) continue;
        var fxp = Math.round(fcx + fk * frx * 0.34);
        put(fxp, mTop, C.FANG); put(fxp, mTop + 1, C.FANG);
      }
    })();
  }

  // held/thrown SHURIKEN sprite (used for both the in-hand weapon and the
  // projectile texture — scales to the canvas W×H). A 4-blade steel star.
  function drawShurikenHi(put, W, H) {
    var cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.44;
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 2 + Math.PI / 8;
      var tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r;
      stroke(put, cx, cy, tx, ty, 2, function () { return C.STEEL; });
      stroke(put, cx, cy, tx, ty, 1, function () { return C.HORN_HI; });   // bright core edge
      put(Math.round(tx), Math.round(ty), C.STEEL_DK);
    }
    ellipseFill(put, cx, cy, r * 0.32, r * 0.32, function () { return C.STEEL; });
    put(Math.round(cx), Math.round(cy), C.MASK_DK);                        // center hole
    put(Math.round(cx - r * 0.15), Math.round(cy - r * 0.15), C.HORN_HI);  // glint
  }

  var NINJA_ART = { C: C, drawBody: drawBody, drawShuriken: shuriken, drawShurikenHi: drawShurikenHi };
  if (typeof module !== 'undefined' && module.exports) module.exports = NINJA_ART;
  root.NINJA_ART = NINJA_ART;
  // Register into CLASS_ART so textures.buildClassModels builds the ninja like
  // the wizard/knight (loads AFTER class_art.js, BEFORE textures.js).
  if (root.CLASS_ART) { root.CLASS_ART.drawNinjaBody = drawBody; root.CLASS_ART.drawShurikenHi = drawShurikenHi; }
})(typeof window !== 'undefined' ? window : this);
