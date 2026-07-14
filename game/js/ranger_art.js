// ============================================================================
// ranger_art.js — resolution-aware procedural pixel art of the Ranger.
// Faithful to the 16x16 original (green hood, skin face, teal cloak, slate
// legs, gold bow) but drawn parametrically so it gains real detail + shading
// at 32 / 64 / 128 / 160 px, with idle + walk animation frames.
//
// Pure pixel-plotting: every draw goes through put(x,y,'#rrggbb'). The SAME
// code runs in Node (raster->PNG preview) and in the browser (ctx.fillRect).
// ============================================================================
(function (root) {
  'use strict';

  // -- faithful palette (extends the game's PAL with shades) -----------------
  var C = {
    OUT:     '#1a1c2c',
    GRN_HI:  '#7ce890', GRN: '#38b764', GRN_MD: '#2b9455', GRN_DK: '#1f6e3f',
    TEAL_HI: '#3f9ba4', TEAL: '#257179', TEAL_DK: '#173f45',
    SKIN:    '#e8b796', SKIN_DK: '#c68a63', SKIN_HI: '#f6d3b0',
    SLATE:   '#3a4668', SLATE_DK: '#252b40', SLATE_HI: '#55628a',
    GOLD:    '#ffcd75', GOLD_DK: '#ef7d57', GOLD_HI: '#ffe9b0',
    WHITE:   '#f4f4f4', LEATHER: '#7a4a2b', LEATHER_DK: '#4d2f1c',
    STRING:  '#dfe6ea'
  };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // hex mix for smooth shading
  function mix(h1, h2, t) {
    var r1 = parseInt(h1.slice(1, 3), 16), g1 = parseInt(h1.slice(3, 5), 16), b1 = parseInt(h1.slice(5, 7), 16);
    var r2 = parseInt(h2.slice(1, 3), 16), g2 = parseInt(h2.slice(3, 5), 16), b2 = parseInt(h2.slice(5, 7), 16);
    var r = Math.round(lerp(r1, r2, t)), g = Math.round(lerp(g1, g2, t)), b = Math.round(lerp(b1, b2, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // fill an integer row span [xL,xR) at y, color from colorFn(tx in 0..1)
  function rowSpan(put, y, xL, xR, colorFn) {
    xL = Math.round(xL); xR = Math.round(xR);
    for (var x = xL; x < xR; x++) {
      var tx = xR > xL + 1 ? (x - xL) / (xR - xL - 1) : 0.5;
      var c = colorFn(tx, x);
      if (c) put(x, y, c);
    }
  }
  function ellipseFill(put, cx, cy, rx, ry, colorFn) {
    var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (var y = y0; y <= y1; y++) {
      var dy = (y + 0.5 - cy) / ry; if (Math.abs(dy) > 1) continue;
      var hw = rx * Math.sqrt(1 - dy * dy);
      rowSpan(put, y, cx - hw, cx + hw, function (tx) { return colorFn(tx, (y - y0) / (y1 - y0 || 1)); });
    }
  }
  // a thick round-capped line from (x0,y0) to (x1,y1) — used for limbs.
  function stroke(put, x0, y0, x1, y1, w, colorFn) {
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, steps = Math.ceil(len);
    var rr = w / 2, R2 = rr * rr, cr = Math.ceil(rr);
    for (var i = 0; i <= steps; i++) {
      var tt = i / steps, px = x0 + dx * tt, py = y0 + dy * tt;
      for (var oy = -cr; oy <= cr; oy++) for (var ox = -cr; ox <= cr; ox++)
        if (ox * ox + oy * oy <= R2) put(Math.round(px) + ox, Math.round(py) + oy, colorFn(tt, ox, oy));
    }
  }

  // ---------------------------------------------------------------- BODY ----
  // opts: { frame:'idle'|'walk', t: 0..1 phase }
  function drawBody(put, S, opts) {
    opts = opts || {}; var t = opts.t || 0, walking = opts.frame === 'walk';
    var u = S / 16;                       // original-unit
    var cx = S * 0.5;

    // animation drivers
    var theta = t * Math.PI * 2;
    var bob = 0, legL = 0, legR = 0, sway = 0, breathe = 0;
    if (walking) {
      bob = -Math.abs(Math.sin(theta)) * 0.9 * u;      // rise on mid-step
      legL = Math.sin(theta);                           // -1..1 swing
      legR = Math.sin(theta + Math.PI);
      sway = Math.sin(theta) * 1.1 * u;                 // cloak hem sway
    } else {
      breathe = Math.sin(theta) * 0.5 * u;              // gentle chest rise
      bob = Math.sin(theta) * 0.3 * u;
      sway = Math.sin(theta) * 0.7 * u;
    }

    // vertical anchors (fractions of S), shifted by bob
    var hoodTop = S * 0.075 + bob, hoodBot = S * 0.31 + bob;
    var faceTop = S * 0.155 + bob, faceBot = S * 0.30 + bob;
    var shoulderY = S * 0.335 + bob;
    var waistY = S * 0.55 + bob + breathe * 0.4;
    var hemY = S * 0.72 + bob;
    var hipY = S * 0.66 + bob;
    var footY = S * 0.955;

    // -- quiver: arrow nocks poking over the LEFT shoulder (behind) ----------
    (function () {
      var qx = cx - S * 0.15, qy = shoulderY - S * 0.02;
      var n = S >= 64 ? 3 : 2;
      for (var i = 0; i < n; i++) {
        var ax = qx - i * Math.max(1, u * 0.9), ay0 = qy - S * 0.14 - i * u * 0.5;
        var len = S * 0.13;
        for (var yy = 0; yy < len; yy++) {
          put(ax, ay0 + yy, mix(C.LEATHER, C.LEATHER_DK, yy / len)); // shaft
        }
        // gold nock + a tiny fletch
        put(ax, ay0 - 1, C.GOLD); put(ax, ay0, C.GOLD_HI);
        if (S >= 64) { put(ax - 1, ay0 + 2, C.WHITE); put(ax + 1, ay0 + 2, C.GRN_MD); }
      }
    })();

    // -- legs + boots --------------------------------------------------------
    function drawLeg(sign, swing) {
      var legW = S * 0.075;
      var baseX = cx + sign * S * 0.072;
      var swingX = swing * S * 0.028;
      var lift = walking ? Math.max(0, swing) * S * 0.05 : 0;   // forward leg lifts
      var topY = hipY, botY = footY - lift;
      var x = baseX + swingX;
      for (var y = Math.round(topY); y < Math.round(botY); y++) {
        var tv = (y - topY) / (botY - topY);
        var col = mix(C.SLATE, C.SLATE_DK, 0.2 + tv * 0.5);
        rowSpan(put, y, x - legW / 2, x + legW / 2, function (tx) {
          return tx < 0.28 ? mix(col, C.SLATE_HI, 0.5) : col;    // left highlight
        });
      }
      // boot
      var bootTop = botY - S * 0.06, bw = legW * 1.5;
      for (var by = Math.round(bootTop); by < Math.round(botY); by++) {
        rowSpan(put, by, x - bw * 0.35, x + bw * 0.72, function (tx) {
          return mix(C.SLATE_DK, C.OUT, 0.3 + tx * 0.4);
        });
      }
    }
    drawLeg(-1, legL);
    drawLeg(1, legR);

    // -- cloak body (teal, tapered, with vertical folds + swaying hem) -------
    function cloakHalf(y) {
      if (y < shoulderY) return lerp(S * 0.14, S * 0.205, (y - (shoulderY - S * 0.03)) / (S * 0.06));
      if (y < waistY) return lerp(S * 0.205, S * 0.165, (y - shoulderY) / (waistY - shoulderY));
      return lerp(S * 0.165, S * 0.22, (y - waistY) / (hemY - waistY)); // flare to hem
    }
    for (var y = Math.round(shoulderY - S * 0.02); y < Math.round(hemY + S * 0.02); y++) {
      var half = cloakHalf(y);
      var hemLocal = clamp((y - waistY) / (hemY - waistY), 0, 1);
      var s = sway * hemLocal;                          // hem sways more than shoulders
      var vt = (y - shoulderY) / (hemY - shoulderY);
      // pointed hem: a gentle central dip so the cloak ends in a soft V (drawn
      // as two symmetric halves that pull in toward the bottom rows)
      var hemPull = 0;
      if (y > hemY - S * 0.055) hemPull = (y - (hemY - S * 0.055)) / (S * 0.055) * S * 0.03;
      rowSpan(put, y, cx - half + s + hemPull * 0.4, cx + half + s - hemPull * 0.4, function (tx) {
        // base vertical shade
        var base = mix(C.TEAL_HI, C.TEAL, clamp(vt * 1.4, 0, 1));
        base = mix(base, C.TEAL_DK, clamp((vt - 0.5) * 1.2, 0, 1));
        // left rim light, right shadow
        if (tx < 0.18) base = mix(base, C.TEAL_HI, 0.6);
        if (tx > 0.86) base = mix(base, C.TEAL_DK, 0.55);
        // two fold shadows
        var f1 = Math.abs(tx - 0.4), f2 = Math.abs(tx - 0.66);
        if (f1 < 0.05) base = mix(base, C.TEAL_DK, 0.5);
        if (f2 < 0.05) base = mix(base, C.TEAL_DK, 0.45);
        return base;
      });
    }

    // -- belt + buckle at the waist -----------------------------------------
    (function () {
      var by = Math.round(waistY), h = Math.max(1, Math.round(u * 1.1));
      var half = cloakHalf(waistY) * 0.98;
      for (var k = 0; k < h; k++) rowSpan(put, by + k, cx - half, cx + half, function (tx) {
        return mix(C.LEATHER, C.LEATHER_DK, 0.3 + tx * 0.5);
      });
      // buckle
      var bkw = Math.max(2, Math.round(u * 1.6));
      for (var yy = 0; yy < h + 1; yy++) rowSpan(put, by + yy - 0, cx - bkw / 2, cx + bkw / 2, function () { return C.GOLD; });
      put(Math.round(cx), by + Math.floor(h / 2), C.GOLD_DK);
    })();

    // -- shoulders/mantle over the cloak top (a darker hood-collar) ----------
    (function () {
      for (var y = Math.round(shoulderY - S * 0.03); y < Math.round(shoulderY + S * 0.06); y++) {
        var vt = (y - (shoulderY - S * 0.03)) / (S * 0.09);
        var half = lerp(S * 0.15, S * 0.20, vt);
        rowSpan(put, y, cx - half, cx + half, function (tx) {
          var b = mix(C.GRN_MD, C.GRN_DK, 0.3 + vt * 0.4);
          if (tx < 0.2) b = mix(b, C.GRN, 0.5);
          if (tx > 0.85) b = mix(b, C.TEAL_DK, 0.4);
          return b;
        });
      }
    })();

    // -- REAR (draw) arm only — baked into the body: bent, hand pulled back to
    //    the cheek like a bowstring draw. The LEAD (bow) arm is a SEPARATE sprite
    //    (drawArm) that rotates toward the aim in-game, so the arm moves while the
    //    bow stays upright (a real archer's hold). Only hi-fi models have arms.
    (function () {
      var shHalf = cloakHalf(shoulderY), armW = Math.max(2, S * 0.078);
      function sleeve(x0, y0, x1, y1, shade) { stroke(put, x0, y0, x1, y1, armW, function () { return mix(C.TEAL, C.TEAL_DK, shade); }); }
      function bracer(x0, y0, x1, y1) {
        stroke(put, x0, y0, x1, y1, armW * 0.8, function () { return C.LEATHER; });
        put(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2), C.LEATHER_DK);
      }
      function hand(hx, hy, r) { ellipseFill(put, hx, hy, r, r, function (tx, ty) { return mix(C.SKIN, C.SKIN_DK, 0.2 + ty * 0.4); }); }
      var dsX = cx - shHalf * 0.6, dsY = shoulderY + S * 0.03;
      var swD = walking ? legR * S * 0.02 : 0;
      var deX = cx - S * 0.19, deY = bob + S * 0.5 + swD;                 // elbow out
      var dhX = cx - S * 0.02, dhY = bob + S * 0.415;                    // hand near jaw (the draw)
      sleeve(dsX, dsY, deX, deY, 0.5);
      bracer(deX, deY, dhX, dhY);
      hand(dhX, dhY, u * 1.0);
    })();

    // -- hood (green, rounded, pointed-ish) ----------------------------------
    function hoodHalf(y) {
      var tt = (y - hoodTop) / (hoodBot - hoodTop);          // 0 top .. 1 bottom
      // rounded top, widening to shoulders — ease
      var e = Math.sin(clamp(tt, 0, 1) * Math.PI * 0.5);
      return lerp(S * 0.055, S * 0.185, e);
    }
    for (var hy = Math.round(hoodTop); hy < Math.round(hoodBot); hy++) {
      var hh = hoodHalf(hy);
      var vt2 = (hy - hoodTop) / (hoodBot - hoodTop);
      rowSpan(put, hy, cx - hh, cx + hh, function (tx) {
        var b = mix(C.GRN_HI, C.GRN, clamp(vt2 * 1.3, 0, 1));
        b = mix(b, C.GRN_MD, clamp((vt2 - 0.55) * 1.3, 0, 1));
        if (tx < 0.16) b = mix(b, C.GRN_HI, 0.65);           // top-left sheen
        if (tx > 0.84) b = mix(b, C.GRN_DK, 0.55);           // right shadow
        return b;
      });
    }

    // -- face opening (skin inside the hood) with brow shadow + eyes ---------
    (function () {
      var fcx = cx, fcy = (faceTop + faceBot) / 2, frx = S * 0.105, fry = S * 0.088;
      ellipseFill(put, fcx, fcy, frx, fry, function (tx, ty) {
        var b = mix(C.SKIN_HI, C.SKIN, clamp(tx * 1.1, 0, 1));
        b = mix(b, C.SKIN_DK, clamp((ty - 0.5) * 1.3, 0, 1));   // chin/jaw shade
        if (ty < 0.16) b = mix(b, C.SKIN_DK, 0.4 * (1 - ty / 0.16)); // slim hood brow shadow
        return b;
      });
      // eyes — placed in the LOWER-middle of the face with a guaranteed skin
      // gap between them so they never merge into a bar at low res.
      var eyeY = Math.round(fcy + fry * 0.12);
      var ew = Math.max(1, Math.round(u * 0.8)), eh = Math.max(1, Math.round(u * 0.9));
      var exo = Math.max(1, Math.round(frx * 0.48));
      for (var i = 0; i < 2; i++) {
        var ex = Math.round(fcx) + (i ? exo : -exo) - Math.floor(ew / 2);
        for (var yy = 0; yy < eh; yy++) for (var xx = 0; xx < ew; xx++) put(ex + xx, eyeY + yy, C.OUT);
        if (S >= 64) put(ex, eyeY, C.STRING);                 // catchlight
      }
      // guarantee a lit skin pixel between the eyes so they stay separate
      put(Math.round(fcx), eyeY, C.SKIN_HI);
      if (S >= 96) put(Math.round(fcx), eyeY + 1, C.SKIN);    // little nose bridge
    })();
  }

  // ----------------------------------------------------------------- BOW ----
  // Drawn POINTING RIGHT (rotation 0 = aim 0), like the original 'bow' texture.
  // Recurve limbs (gold) + string, a grip in the middle. Canvas is S wide/tall.
  function drawBow(put, S) {
    // String on the LEFT (hand side), a single limb arc bulging RIGHT to a
    // point — a ")" bow, matching the original 'bow' convention (points right).
    var sx = S * 0.26;                          // string x
    var cy = S * 0.5;
    var R = S * 0.44;                            // half the limb span
    var bulge = S * 0.30;                        // how far the belly bulges right
    var limbW = Math.max(2, Math.round(S * 0.055));
    var topY = cy - R, botY = cy + R;
    var N = Math.max(48, Math.round(S * 2));
    for (var i = 0; i <= N; i++) {
      var v = i / N;                             // 0 top .. 1 bottom
      var y = topY + 2 * R * v;
      var x = sx + bulge * Math.sin(Math.PI * v);
      var tw = limbW * (0.45 + 0.55 * Math.sin(Math.PI * v)); // thin at tips, thick at belly
      for (var w = 0; w < tw; w++) {
        var c = w < tw * 0.34 ? C.GOLD_HI : (w > tw * 0.72 ? C.GOLD_DK : C.GOLD);
        put(Math.round(x - w), Math.round(y), c);   // thickness toward the interior/string
      }
    }
    // recurve hooks at the very tips (small outward flick)
    put(Math.round(sx + 1), Math.round(topY), C.GOLD_DK);
    put(Math.round(sx + 1), Math.round(botY), C.GOLD_DK);
    // string: vertical from top tip to bottom tip
    for (var y2 = Math.round(topY); y2 <= Math.round(botY); y2++) put(Math.round(sx), y2, C.STRING);
    put(Math.round(sx), Math.round(cy), C.OUT);   // nocking point
    // grip: leather wrap at the belly (rightmost middle)
    var gx = sx + bulge, gh = Math.round(S * 0.1);
    for (var yy = -gh; yy <= gh; yy++)
      for (var w2 = 0; w2 < limbW + 1; w2++) put(Math.round(gx) - w2, Math.round(cy) + yy, (yy % 2 ? C.LEATHER : C.LEATHER_DK));
  }

  // --------------------------------------------------------------- ARROW ----
  // POINTING RIGHT: gold-fletched shaft, steel head, like the original 'arrow'.
  function drawArrow(put, S, H) {
    var cy = Math.round((H || S) * 0.5), len = S * 0.9, x0 = S * 0.06;
    var shaftH = Math.max(1, Math.round(S * 0.05));
    // shaft
    for (var x = 0; x < len * 0.7; x++) for (var h = 0; h < shaftH; h++) {
      put(Math.round(x0 + x), cy - Math.floor(shaftH / 2) + h, h === 0 ? C.LEATHER : mix(C.LEATHER, C.LEATHER_DK, 0.6));
    }
    // head (triangle) at the right
    var hx = x0 + len * 0.7, hs = Math.max(2, Math.round(S * 0.12));
    for (var i = 0; i < hs; i++) {
      var hh = hs - i;
      for (var yy = -hh; yy <= hh; yy++) put(Math.round(hx + i), cy + Math.round(yy / 2), i < 1 ? C.WHITE : mix(C.SLATE_HI, C.WHITE, 0.5));
    }
    // fletching at the left (gold)
    var fs = Math.max(2, Math.round(S * 0.14));
    for (var f = 0; f < fs; f++) {
      var fh = Math.round((fs - f) * 0.8);
      for (var yy2 = -fh; yy2 <= fh; yy2++) put(Math.round(x0 + f - fs * 0.2), cy + yy2, yy2 < 0 ? C.GOLD_HI : C.GOLD);
    }
  }

  // ------------------------------------------------------------- ARM --------
  // The LEAD (bow) arm as its own sprite, drawn POINTING RIGHT with the SHOULDER
  // at the left (the pivot) and the HAND at the right. In-game it rotates to the
  // aim so the arm moves (down when you aim down) while the bow stays upright.
  // teal sleeve → leather bracer → bare hand, lit top-left.
  function drawArm(put, W, H) {
    var cy = H * 0.5, sx = H * 0.5, hx = W - H * 0.52, armW = H * 0.66;
    var midx = sx + (hx - sx) * 0.52;
    stroke(put, sx, cy, midx, cy, armW, function (tt) { return mix(C.TEAL_HI, C.TEAL, 0.35 + tt * 0.45); });   // upper sleeve
    stroke(put, midx, cy, hx, cy, armW * 0.82, function (tt) { return mix(C.LEATHER, C.LEATHER_DK, 0.2 + tt * 0.3); }); // bracer
    // bracer straps
    var strapx = midx + (hx - midx) * 0.45;
    put(Math.round(strapx), Math.round(cy - armW * 0.28), C.LEATHER_DK);
    put(Math.round(strapx), Math.round(cy + armW * 0.28), C.LEATHER_DK);
    ellipseFill(put, sx, cy, armW * 0.56, armW * 0.56, function (tx, ty) { return mix(C.TEAL_HI, C.TEAL, 0.3 + ty * 0.5); }); // shoulder cap
    ellipseFill(put, hx, cy, H * 0.34, H * 0.34, function (tx, ty) { return mix(C.SKIN, C.SKIN_DK, 0.2 + ty * 0.4); });      // hand
  }

  // ------------------------------------------------------------ OUTLINE -----
  // Add a 1px dark outline around the whole silhouette (reads on any ground),
  // matching the fully-outlined original. Host-agnostic: caller supplies
  // getA(x,y)->alpha 0..255 and set(x,y) to paint an outline pixel. This lets
  // the SAME code run over a Node raster buffer AND a browser canvas ImageData.
  function outlinePass(w, h, getA, set) {
    var edges = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (getA(x, y) !== 0) continue;                    // only fill transparent
      var near = false;
      for (var dy = -1; dy <= 1 && !near; dy++) for (var dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        var nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (getA(nx, ny) > 40) { near = true; break; }
      }
      if (near) edges.push([x, y]);
    }
    for (var e = 0; e < edges.length; e++) set(edges[e][0], edges[e][1]);
  }

  var API = { C: C, drawBody: drawBody, drawBow: drawBow, drawArrow: drawArrow, drawArm: drawArm, outlinePass: outlinePass,
              mix: mix, lerp: lerp, clamp: clamp, rowSpan: rowSpan, ellipseFill: ellipseFill, stroke: stroke };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.RANGER_ART = API;
})(typeof window !== 'undefined' ? window : this);
