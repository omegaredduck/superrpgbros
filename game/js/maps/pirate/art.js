// ============================================================================
// game/js/maps/pirate/art.js — PIRATE SHIP (realm 9) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 4 5 6 8 10 11 12
// 15 16 (LIVING crew — no ghosts), CAPTAIN KRAKEN (render_pirate_boss_final.js
// — the canon combo), the colossal entrance tentacle + the spectral broadside
// galleon (ghost teal EXCLUSIVE to these), ALL 20 decor, tiles #1 2 4 5 6 10.
// Same pixel-plotting contract as world_art.js; ranger_art primitives.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- pirate palette (pirate_kit.js P, verbatim) --------------------------
  var P = {
    OUT: '#0a1014',
    ghost: '#5fe8c2', ghostLt: '#c8fff0', ghostDk: '#2a9e86', ghostDkk: '#14523f',
    wood: '#8a6a48', woodLt: '#b8956a', woodDk: '#57402c', woodDkk: '#33251a',
    deck: '#a08258', deckDk: '#6e5638',
    sail: '#d8d2c0', sailDk: '#a39a82', sailDkk: '#6e6752',
    sea: '#16324a', seaLt: '#2a5a7e', moon: '#9fc4e8', moonLt: '#e0f0ff',
    brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
    gold: '#ffcd45', goldLt: '#ffedb0', goldDk: '#b07d1e',
    iron: '#5a6072', ironDk: '#363b4d', cannon: '#2a2d38', cannonDk: '#16181e',
    red: '#c2452e', redLt: '#f08a64', redDk: '#7e2416',
    barn: '#7a8a6a', barnDk: '#4a5a40', weed: '#3a7a5a', weedDk: '#1f4a34',
    bone: '#e8e0c8', boneDk: '#a89e7e',
    white: '#f4f4f4', oil: '#0a0c10'
  };
  // living-crew colors
  var C = {
    skin: '#d8a070', skinLt: '#f0c898', skinDk: '#a87048',
    skin2: '#a8724e', skin2Dk: '#7a4e32',
    shirt: '#d8d2c0', shirtDk: '#a39a82',
    navy: '#2a4a6e', navyLt: '#4a7aa8', navyDk: '#182c44',
    vest: '#7a3a2e', vestDk: '#4e2018',
    coat: '#5c1f28', coatLt: '#8a3a42', coatDk: '#38121a'
  };

  // ---- shared shape helpers (pirate_kit lineage — ES6 kept) ---------------
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
    ell(put, x, y, r, r, (tx, ty) => mix(c || P.iron, cdk || P.ironDk, 0.25 + ty * 0.6));
    put(Math.round(x), Math.round(y), cdk || P.ironDk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => P.oil); }
  function planks(put, x0, y0, x1, y1) {
    for (let y = Math.round(y0); y < y1; y++) {
      row(put, y, x0, x1, (tx) => {
        const seam = (y - y0) % 7 < 1;
        let b = mix(P.deck, P.deckDk, ((y * 13 + (tx * 97) | 0) % 17) / 17 * 0.5);
        if (seam) b = P.woodDkk;
        return b;
      });
    }
  }
  function skull(put, cx, cy, s, eyeC) {
    dome(put, cx, cy, s, s * 0.92, P.bone, '#ffffff', P.boneDk);
    ell(put, cx, cy + s * 0.55, s * 0.6, s * 0.35, (tx, ty) => mix(P.bone, P.boneDk, ty));
    [-1, 1].forEach(k => { ell(put, cx + k * s * 0.4, cy - s * 0.05, s * 0.26, s * 0.3, () => P.oil); put(Math.round(cx + k * s * 0.4), Math.round(cy - s * 0.1), eyeC || P.oil); });
    for (let k = -1; k <= 1; k++) put(Math.round(cx + k * s * 0.25), Math.round(cy + s * 0.6), P.boneDk);
    ell(put, cx, cy + s * 0.2, s * 0.14, s * 0.18, () => P.boneDk);
  }
  function legs(put, cx, cy, S, spread, c) {
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.04, cy, cx + s * S * spread, cy + S * 0.14, S * 0.028, () => (c || C.navyDk));
      ell(put, cx + s * S * (spread + 0.015), cy + S * 0.155, S * 0.032, S * 0.02, () => P.oil);
    });
  }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (#1 4 5 6 8 10 11 12 15 16) ================
  function drawDeckhand(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    legs(put, cx, cy + S * 0.14, S, 0.07);
    dome(put, cx, cy + S * 0.03, S * 0.09, S * 0.12, C.shirt, '#ffffff', C.shirtDk);
    [0.0, 0.045, 0.09].forEach(o => row(put, Math.round(cy - S * 0.02 + o * S), cx - S * 0.08, cx + S * 0.08, () => C.navy));
    dome(put, cx, cy - S * 0.13, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
    ell(put, cx, cy - S * 0.175, S * 0.07, S * 0.028, (tx, ty) => mix(P.red, P.redDk, ty));
    stroke(put, cx + S * 0.06, cy - S * 0.17, cx + S * 0.12, cy - S * 0.13, 2, () => P.redDk);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.13), P.oil));
    stroke(put, cx - S * 0.015, cy - S * 0.085, cx + S * 0.015, cy - S * 0.085, 1, () => C.skinDk);
    stroke(put, cx - S * 0.13, cy + S * 0.14, cx - S * 0.19, cy - S * 0.18, 2, () => P.woodDk);
    for (let k = -2; k <= 2; k++) stroke(put, cx - S * 0.19 + k, cy - S * 0.18, cx - S * 0.19 + k * 2, cy - S * 0.25, 1, () => C.shirtDk);
    for (let y = 0; y < S * 0.06; y++) row(put, Math.round(cy + S * 0.24 + y), cx + S * 0.1 - (S * 0.03 - y * 0.2), cx + S * 0.1 + (S * 0.03 - y * 0.2) + S * 0.02, (tx) => mix(P.wood, P.woodDkk, y / (S * 0.06)));
  }
  function drawCorsair(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    stroke(put, cx - S * 0.02, cy + S * 0.12, cx - S * 0.14, cy + S * 0.28, S * 0.03, () => C.navyDk);
    stroke(put, cx + S * 0.04, cy + S * 0.12, cx + S * 0.12, cy + S * 0.26, S * 0.03, () => P.oil);
    dome(put, cx, cy, S * 0.11, S * 0.14, C.vest, mix(C.vest, '#ffffff', 0.25), C.vestDk);
    stroke(put, cx - S * 0.08, cy - S * 0.06, cx + S * 0.08, cy + S * 0.1, S * 0.03, () => P.red);
    ell(put, cx, cy - S * 0.05, S * 0.03, S * 0.04, () => C.shirt);
    dome(put, cx, cy - S * 0.14, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
    for (let y = 0; y < S * 0.04; y++) row(put, Math.round(cy - S * 0.21 + y), cx - S * 0.08 + y * 0.5, cx + S * 0.08 - y * 0.5, () => (y < 2 ? P.woodDkk : P.oil));
    put(Math.round(cx - S * 0.028), Math.round(cy - S * 0.14), P.oil);
    stroke(put, cx - S * 0.05, cy - S * 0.17, cx - S * 0.005, cy - S * 0.17, 1, () => P.oil);
    put(Math.round(cx + S * 0.028), Math.round(cy - S * 0.145), P.oil);
    stroke(put, cx - S * 0.02, cy - S * 0.09, cx + S * 0.03, cy - S * 0.09, 1, () => C.skinDk);
    put(Math.round(cx + S * 0.01), Math.round(cy - S * 0.085), P.gold);
    put(Math.round(cx + S * 0.055), Math.round(cy - S * 0.1), P.gold);
    stroke(put, cx + S * 0.08, cy + S * 0.0, cx + S * 0.3, cy - S * 0.14, S * 0.022, () => P.moonLt);
    ell(put, cx + S * 0.08, cy + S * 0.015, S * 0.028, S * 0.02, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
    for (let a = -0.4; a < 0.9; a += 0.16) put(Math.round(cx + Math.cos(a - 0.5) * S * 0.32), Math.round(cy - Math.sin(a - 0.5) * S * 0.18), C.shirtDk);
  }
  function drawPowderMonkey(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.18);
    dome(put, cx - S * 0.08, cy + S * 0.02, S * 0.075, S * 0.085, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
    dome(put, cx - S * 0.1, cy - S * 0.09, S * 0.05, S * 0.05, C.skin2, mix(C.skin2, '#ffffff', 0.3), C.skin2Dk);
    ell(put, cx - S * 0.1, cy - S * 0.08, S * 0.03, S * 0.026, (tx, ty) => mix(C.skinLt, C.skin, ty));
    [-1, 1].forEach(s => put(Math.round(cx - S * 0.1 + s * S * 0.018), Math.round(cy - S * 0.09), P.oil));
    [-1, 1].forEach(s => ell(put, cx - S * 0.1 + s * S * 0.05, cy - S * 0.1, S * 0.016, S * 0.016, (tx, ty) => mix(C.skin2, C.skin2Dk, ty)));
    for (let a = 0; a < 3; a += 0.3) put(Math.round(cx - S * 0.16 + Math.cos(a + 1.5) * S * 0.05), Math.round(cy + S * 0.1 - a * 4), C.skin2Dk);
    [[-0.14, 0.1, -0.22, 0.22], [-0.02, 0.1, 0.02, 0.2]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, S * 0.022, () => C.skin2Dk));
    for (let y = 0; y < S * 0.24; y++) {
      const t = y / (S * 0.24), w = S * (0.09 + Math.sin(t * Math.PI) * 0.022);
      row(put, Math.round(cy - S * 0.1 + y), cx + S * 0.12 - w, cx + S * 0.12 + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.4));
    }
    [0.0, 0.16].forEach(oy => row(put, Math.round(cy - S * 0.02 + oy * S), cx + S * 0.03, cx + S * 0.21, () => P.ironDk));
    skull(put, cx + S * 0.12, cy + S * 0.02, S * 0.025, P.oil);
    stroke(put, cx + S * 0.12, cy - S * 0.12, cx + S * 0.18, cy - S * 0.22, 2, () => P.woodDkk);
    ell(put, cx + S * 0.19, cy - S * 0.25, S * 0.02, S * 0.026, (tx, ty) => mix('#ffe08a', '#c2571a', ty));
    [[0.24, -0.3], [0.15, -0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.gold));
    stroke(put, cx - S * 0.04, cy - S * 0.0, cx + S * 0.05, cy - S * 0.05, S * 0.02, () => C.skin2);
  }
  function drawSaltyGull(put, S) {
    const cx = S * 0.5, cy = S * 0.46;
    ell(put, cx, cy, S * 0.09, S * 0.06, (tx, ty) => mix('#ffffff', C.shirtDk, ty));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.06, cy - S * 0.02, cx + s * S * 0.3, cy - S * (s < 0 ? 0.14 : 0.04), S * 0.04, (t) => mix('#ffffff', '#8a94a6', t));
      stroke(put, cx + s * S * 0.26, cy - S * (s < 0 ? 0.12 : 0.03), cx + s * S * 0.36, cy - S * (s < 0 ? 0.1 : 0.0), S * 0.025, (t) => mix('#c8ced8', P.oil, t * 0.6));
    });
    dome(put, cx - S * 0.02, cy - S * 0.07, S * 0.045, S * 0.04, '#ffffff', '#ffffff', '#c8ced8');
    stroke(put, cx - S * 0.06, cy - S * 0.07, cx - S * 0.13, cy - S * 0.05, S * 0.02, () => P.brass);
    put(Math.round(cx - S * 0.12), Math.round(cy - S * 0.04), P.redDk);
    put(Math.round(cx - S * 0.01), Math.round(cy - S * 0.08), P.oil);
    [-0.02, 0.02].forEach(o => stroke(put, cx + S * 0.08, cy + o * S + S * 0.02, cx + S * 0.16, cy + o * S + S * 0.06, 2, () => '#c8ced8'));
    [[-0.2, 0.2], [-0.1, 0.26], [0.0, 0.3]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S + S * 0.05, 1, () => C.shirtDk));
    ell(put, cx + S * 0.04, cy + S * 0.07, S * 0.02, S * 0.014, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
  }
  function drawSiren(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    for (let a = 0; a < 5.5; a += 0.14) {
      const rr = S * 0.05 + a * S * 0.035;
      put(Math.round(cx - S * 0.26 + Math.cos(a + 1.2) * rr * 0.6), Math.round(cy + Math.sin(a + 1.2) * rr * 0.4), a > 4 ? P.moonLt : P.seaLt);
    }
    stroke(put, cx + S * 0.02, cy + S * 0.16, cx + S * 0.2, cy + S * 0.28, S * 0.06, (t) => mix(P.seaLt, P.sea, t));
    [[0.28, 0.22], [0.31, 0.28]].forEach(([ox, oy]) => stroke(put, cx + S * 0.2, cy + S * 0.27, cx + ox * S + S * 0.05, cy + oy * S, 2, () => P.moon));
    for (let i = 0; i < 6; i++) put(Math.round(cx + S * 0.06 + i * S * 0.025), Math.round(cy + S * 0.19 + i * S * 0.015), P.moonLt);
    dome(put, cx, cy + S * 0.02, S * 0.1, S * 0.14, C.skin, C.skinLt, C.skinDk);
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.04, cy - S * 0.02, S * 0.028, S * 0.022, (tx, ty) => mix(P.moonLt, P.moon, ty)));
    dome(put, cx, cy - S * 0.13, S * 0.07, S * 0.07, C.skin, C.skinLt, C.skinDk);
    dome(put, cx + S * 0.02, cy - S * 0.18, S * 0.075, S * 0.045, P.weed, mix(P.weed, '#ffffff', 0.3), P.weedDk);
    for (let i = 0; i < 4; i++) stroke(put, cx + S * 0.06, cy - S * 0.16 + i * 2, cx + S * 0.14 + i * S * 0.01, cy + S * 0.02 + i * S * 0.03, S * 0.022, (t) => mix(P.weed, P.weedDk, t));
    ell(put, cx - S * 0.03, cy - S * 0.1, S * 0.02, S * 0.026, () => P.oil);
    put(Math.round(cx + S * 0.01), Math.round(cy - S * 0.15), P.oil);
    [[-0.3, -0.14], [-0.36, -0.02], [-0.28, 0.08]].forEach(([ox, oy]) => {
      stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, 1, () => P.moonLt);
      ell(put, cx + ox * S - S * 0.012, cy + oy * S, S * 0.014, S * 0.011, () => P.moonLt);
    });
  }
  function drawKrakenArm(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    ell(put, cx, cy + S * 0.2, S * 0.18, S * 0.06, () => P.oil);
    for (let a = 0; a < 6.28; a += 0.5) stroke(put, cx + Math.cos(a) * S * 0.16, cy + S * 0.2 + Math.sin(a) * S * 0.05, cx + Math.cos(a) * S * 0.24, cy + S * 0.2 + Math.sin(a) * S * 0.08, 2, () => P.woodDk);
    let px = cx, py = cy + S * 0.18, ang = -1.5;
    for (let seg = 0; seg < 8; seg++) {
      const w = S * (0.085 - seg * 0.008);
      const nx = px + Math.cos(ang) * S * 0.08, ny = py + Math.sin(ang) * S * 0.075;
      stroke(put, px, py, nx, ny, w, (t) => mix('#7e3a5c', '#4a1f38', t * 0.4 + seg * 0.06));
      if (seg > 1) put(Math.round(px + Math.cos(ang + 1.57) * w * 0.5), Math.round(py + Math.sin(ang + 1.57) * w * 0.5), P.sailDk);
      px = nx; py = ny; ang += 0.42;
    }
    ell(put, px, py, S * 0.03, S * 0.026, (tx, ty) => mix('#b06a8e', '#7e3a5c', ty));
    [[0.02, -0.02], [0.08, -0.1], [0.1, -0.2]].forEach(([ox, oy]) => { ell(put, cx + ox * S + S * 0.02, cy + oy * S, S * 0.02, S * 0.016, (tx, ty) => mix(P.sail, P.sailDkk, ty)); put(Math.round(cx + ox * S + S * 0.02), Math.round(cy + oy * S), '#4a1f38'); });
    ell(put, cx, cy + S * 0.2, S * 0.24, S * 0.08, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.75 && d <= 1 ? P.redDk : null; });
    [[-0.16, 0.12], [0.18, 0.14]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.moonLt));
  }
  function drawMakoLeaper(put, S) {
    const cx = S * 0.5, cy = S * 0.44;
    for (let t = 0.05; t < 0.95; t += 0.09) put(Math.round(cx - S * 0.36 + t * S * 0.72), Math.round(cy + S * 0.3 - Math.sin(t * Math.PI) * S * 0.26), P.seaLt);
    [[-0.38, 0.3], [-0.34, 0.34]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), P.moonLt));
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const bx2 = cx - S * 0.2 + t * S * 0.42;
      const by2 = cy - Math.sin(t * Math.PI) * S * 0.06 + t * S * 0.04;
      const w = S * (0.03 + Math.sin(t * Math.PI) * 0.045);
      ell(put, bx2, by2, w, w * 0.8, (tx, ty) => {
        let b = mix('#7a92aa', '#46586e', clamp(ty * 1.3, 0, 1));
        if (ty > 0.62) b = mix(b, '#e8eef4', 0.7);
        return b;
      });
    }
    stroke(put, cx - S * 0.02, cy - S * 0.08, cx + S * 0.02, cy - S * 0.17, S * 0.035, (t) => mix('#5c7288', '#46586e', t));
    stroke(put, cx + S * 0.2, cy + S * 0.02, cx + S * 0.28, cy - S * 0.1, S * 0.03, () => '#5c7288');
    stroke(put, cx + S * 0.2, cy + S * 0.02, cx + S * 0.28, cy + S * 0.1, S * 0.026, () => '#46586e');
    stroke(put, cx - S * 0.2, cy - S * 0.015, cx - S * 0.3, cy - S * 0.05, S * 0.04, () => '#5c7288');
    stroke(put, cx - S * 0.19, cy + S * 0.03, cx - S * 0.28, cy + S * 0.06, S * 0.035, () => '#e8eef4');
    for (let t = 0; t < 1; t += 0.2) { put(Math.round(cx - S * 0.21 - t * S * 0.07), Math.round(cy - S * 0.03 + t * S * 0.008), '#ffffff'); put(Math.round(cx - S * 0.2 - t * S * 0.06), Math.round(cy + S * 0.035), '#ffffff'); }
    put(Math.round(cx - S * 0.17), Math.round(cy - S * 0.05), P.oil);
    ell(put, cx + S * 0.3, cy + S * 0.36, S * 0.1, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? P.redDk : null; });
  }
  function drawDrunkenSwab(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    for (let t = 0; t < 1; t += 0.2) put(Math.round(cx - S * 0.24 + t * S * 0.16), Math.round(cy + S * 0.28 + Math.sin(t * 9) * 3), P.deckDk);
    legs(put, cx + S * 0.02, cy + S * 0.13, S, 0.09, P.woodDkk);
    for (let y = 0; y < S * 0.16; y++) {
      const t = y / (S * 0.16), tilt = Math.sin(t * 2) * S * 0.03;
      row(put, Math.round(cy - S * 0.02 + y), cx - S * 0.09 + tilt + S * 0.02, cx + S * 0.09 + tilt + S * 0.02, (tx) => {
        let b = mix(C.shirt, C.shirtDk, t);
        if (Math.floor(t * 5) % 2 === 0) b = mix(b, P.red, 0.4);
        return b;
      });
    }
    dome(put, cx + S * 0.06, cy - S * 0.11, S * 0.065, S * 0.062, C.skin, C.skinLt, C.skinDk);
    put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.1), P.redLt);
    [-1, 1].forEach(s => stroke(put, cx + S * 0.06 + s * S * 0.028, cy - S * 0.12, cx + S * 0.06 + s * S * 0.012, cy - S * 0.115, 1, () => P.oil));
    for (let i = 0; i < 5; i++) put(Math.round(cx + S * 0.03 + (i * 17 % 10)), Math.round(cy - S * 0.065 + (i * 7 % 4)), C.skinDk);
    ell(put, cx + S * 0.06, cy - S * 0.165, S * 0.05, S * 0.02, (tx, ty) => mix(C.navy, C.navyDk, ty));
    stroke(put, cx + S * 0.12, cy + S * 0.0, cx + S * 0.2, cy - S * 0.1, S * 0.024, () => C.skin);
    for (let y = 0; y < S * 0.09; y++) {
      const t = y / (S * 0.09), w = S * (0.016 + Math.sin(Math.min(1, t * 1.4) * Math.PI) * 0.016);
      row(put, Math.round(cy - S * 0.22 + y), cx + S * 0.21 - w, cx + S * 0.21 + w, (tx) => mix('#3a6e4a', '#1c4028', t + Math.abs(tx - 0.5)));
    }
    put(Math.round(cx + S * 0.21), Math.round(cy - S * 0.24), P.sailDk);
    stroke(put, cx - S * 0.06, cy + S * 0.02, cx - S * 0.15, cy + S * 0.08, S * 0.024, () => C.skin);
    for (let k = -1; k <= 1; k++) stroke(put, cx - S * 0.17, cy + S * 0.09, cx - S * 0.2 + k * S * 0.015, cy + S * 0.13, 1, () => '#7ac2a0');
    [[0.16, -0.28], [0.2, -0.24]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S - S * 0.03, 1, () => P.weedDk));
  }
  function drawHarpooner(put, S) {
    const cx = S * 0.46, cy = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    for (let x = 0; x < S * 0.3; x += 6) row(put, Math.round(cy - S * 0.06), cx + S * 0.14 + x, cx + S * 0.17 + x, () => P.redDk);
    legs(put, cx, cy + S * 0.14, S, 0.08, P.woodDkk);
    dome(put, cx, cy + S * 0.02, S * 0.12, S * 0.14, '#c2a038', '#e8cd6a', '#8a6e1e');
    for (let y = 0; y < S * 0.1; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * (0.1 + y / S * 0.15), cx + S * (0.1 + y / S * 0.15), (tx) => mix('#c2a038', '#8a6e1e', Math.abs(tx - 0.5)));
    dome(put, cx, cy - S * 0.13, S * 0.065, S * 0.065, C.skin, C.skinLt, C.skinDk);
    ell(put, cx, cy - S * 0.17, S * 0.085, S * 0.032, (tx, ty) => mix('#c2a038', '#8a6e1e', ty));
    dome(put, cx, cy - S * 0.2, S * 0.05, S * 0.03, '#e8cd6a', '#ffe89a', '#8a6e1e');
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.135), P.oil));
    dome(put, cx, cy - S * 0.08, S * 0.04, S * 0.025, '#6e563a', '#8a6e48', '#4a3828');
    stroke(put, cx - S * 0.16, cy + S * 0.1, cx + S * 0.26, cy - S * 0.08, S * 0.018, () => P.woodDk);
    stroke(put, cx + S * 0.26, cy - S * 0.08, cx + S * 0.34, cy - S * 0.115, S * 0.02, () => P.moonLt);
    [[0.3, -0.085], [0.31, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S - S * 0.03, cy + oy * S + S * 0.02, 1, () => P.moon));
    for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx - S * 0.12 + Math.cos(a) * S * 0.035), Math.round(cy + S * 0.12 + Math.sin(a) * S * 0.025), P.wood);
    stroke(put, cx - S * 0.1, cy + S * 0.1, cx + S * 0.02, cy + S * 0.02, 1, () => P.woodLt);
  }
  function drawInkpotOcto(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.22);
    for (let y = 0; y < S * 0.18; y++) {
      const t = y / (S * 0.18), w = S * (0.14 + Math.sin(t * Math.PI * 0.5) * 0.02);
      row(put, Math.round(cy + S * 0.02 + y), cx - w, cx + w, (tx) => mix(P.iron, P.cannonDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    ell(put, cx, cy + S * 0.02, S * 0.15, S * 0.045, (tx, ty) => mix(P.cannonDk, P.oil, ty));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.15, cy + S * 0.06, cx + s * S * 0.2, cy + S * 0.1, S * 0.02, () => P.ironDk));
    dome(put, cx, cy - S * 0.1, S * 0.11, S * 0.11, '#b06a8e', '#d89ab8', '#7e3a5c');
    [-1, 1].forEach(s => { ell(put, cx + s * S * 0.05, cy - S * 0.12, S * 0.025, S * 0.03, () => '#ffffff'); put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.115), P.oil); });
    [[-0.14, 1], [0.14, 1], [-0.06, 1], [0.08, 1]].forEach(([o], i) => {
      let px = cx + o * S, py = cy + S * 0.0, ang = 1.2 + (i % 2) * 0.6;
      for (let seg = 0; seg < 4; seg++) {
        const nx2 = px + Math.cos(ang) * S * 0.05 * (o < 0 ? -1 : 1), ny2 = py + Math.sin(ang) * S * 0.05;
        stroke(put, px, py, nx2, ny2, S * (0.028 - seg * 0.005), (t) => mix('#b06a8e', '#7e3a5c', t));
        px = nx2; py = ny2; ang += 0.5;
      }
    });
    [[-0.24, -0.18], [-0.3, -0.12], [-0.27, -0.06]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.014, () => P.oil));
    ell(put, cx - S * 0.34, cy + S * 0.26, S * 0.08, S * 0.025, (tx, ty) => mix('#1c1e2c', P.oil, ty));
    put(Math.round(cx - S * 0.36), Math.round(cy + S * 0.25), '#9fc4e8');
  }

  // ============= BOSS: CAPTAIN KRAKEN (canon combo) =========================
  function drawCaptainKraken(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    const coat = C.coat, coatLt = C.coatLt, coatDk = C.coatDk;
    // boots
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.05, cy + S * 0.14, cx + s * S * 0.1, cy + S * 0.3, S * 0.032, () => P.oil);
      ell(put, cx + s * S * 0.11, cy + S * 0.315, S * 0.038, S * 0.02, () => P.oil);
    });
    // long captain's coat
    for (let y = 0; y < S * 0.32; y++) {
      const t = y / (S * 0.32), w = S * (0.1 + t * 0.08);
      row(put, Math.round(cy - S * 0.1 + y), cx - w, cx + w, (tx) => {
        let b = mix(coat, coatDk, t);
        if (tx < 0.14 || tx > 0.86) b = mix(b, coatLt, 0.35);
        if (tx > 0.44 && tx < 0.56 && t < 0.55) b = C.skinLt;
        return b;
      });
    }
    [0.0, 0.06, 0.12].forEach(oy => { put(Math.round(cx - S * 0.045), Math.round(cy - S * 0.02 + oy * S), P.gold); put(Math.round(cx + S * 0.045), Math.round(cy - S * 0.02 + oy * S), P.gold); });
    row(put, Math.round(cy + S * 0.12), cx - S * 0.13, cx + S * 0.13, () => P.woodDkk);
    bolt(put, cx, cy + S * 0.125, S * 0.02, P.gold, P.goldDk);
    // wide gold epaulettes
    [-1, 1].forEach(s => {
      plate(put, cx + s * S * 0.12 - S * 0.03, cy - S * 0.11, cx + s * S * 0.12 + S * 0.03, cy - S * 0.07, P.gold, P.goldLt, P.goldDk);
      [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.12 + k * S * 0.015, cy - S * 0.07, cx + s * S * 0.12 + k * S * 0.015, cy - S * 0.045, 1, () => P.goldDk));
    });
    // head + dark beard
    dome(put, cx, cy - S * 0.17, S * 0.068, S * 0.068, C.skin, C.skinLt, C.skinDk);
    dome(put, cx, cy - S * 0.115, S * 0.055, S * 0.045, '#3a2c22', mix('#3a2c22', '#ffffff', 0.25), mix('#3a2c22', '#000000', 0.4));
    put(Math.round(cx + S * 0.028), Math.round(cy - S * 0.175), P.oil);
    stroke(put, cx + S * 0.04, cy - S * 0.22, cx + S * 0.055, cy - S * 0.13, 1, () => C.skinDk);
    // tricorn + skull badge + red plume
    for (let y = 0; y < S * 0.05; y++) row(put, Math.round(cy - S * 0.26 + y), cx - S * 0.11 + y * 0.6, cx + S * 0.11 - y * 0.6, () => (y < 2 ? coatLt : coatDk));
    dome(put, cx, cy - S * 0.26, S * 0.06, S * 0.03, coat, coatLt, coatDk);
    skull(put, cx, cy - S * 0.255, S * 0.018, P.oil);
    stroke(put, cx + S * 0.08, cy - S * 0.28, cx + S * 0.17, cy - S * 0.34, S * 0.02, () => P.red);
    // cutlass (right hand)
    stroke(put, cx + S * 0.12, cy + S * 0.02, cx + S * 0.32, cy - S * 0.1, S * 0.02, () => P.moonLt);
    ell(put, cx + S * 0.115, cy + S * 0.03, S * 0.026, S * 0.02, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
    // the kraken TENTACLE arm (left)
    let px = cx - S * 0.12, py = cy + S * 0.0, ang = 2.6;
    for (let seg = 0; seg < 5; seg++) {
      const nx = px + Math.cos(ang) * S * 0.05, ny = py + Math.sin(ang) * S * 0.045;
      stroke(put, px, py, nx, ny, S * (0.03 - seg * 0.004), (t) => mix('#7e3a5c', '#4a1f38', t));
      px = nx; py = ny; ang += 0.45;
    }
    put(Math.round(px), Math.round(py), '#b06a8e');
    // BIG unmistakable eye patch + strap
    ell(put, cx - S * 0.028, cy - S * 0.175, S * 0.022, S * 0.024, () => P.oil);
    stroke(put, cx - S * 0.065, cy - S * 0.195, cx + S * 0.062, cy - S * 0.185, 1, () => P.oil);
    put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.168), '#2a2d38');
    // the parrot ON the epaulette (left shoulder)
    const qx = cx - S * 0.135, qy = cy - S * 0.155;
    ell(put, qx, qy + S * 0.02, S * 0.032, S * 0.045, (tx, ty) => mix(P.red, P.redDk, ty * 1.2));
    stroke(put, qx + S * 0.012, qy + S * 0.05, qx + S * 0.035, qy + S * 0.1, S * 0.016, (t) => mix('#2a8ec2', '#16324a', t));
    ell(put, qx + S * 0.008, qy + S * 0.008, S * 0.016, S * 0.028, (tx, ty) => mix('#e8b23a', P.redDk, ty));
    dome(put, qx - S * 0.005, qy - S * 0.028, S * 0.02, S * 0.019, P.red, P.redLt, P.redDk);
    ell(put, qx - S * 0.016, qy - S * 0.028, S * 0.009, S * 0.012, () => '#ffffff');
    put(Math.round(qx - S * 0.014), Math.round(qy - S * 0.032), P.oil);
    stroke(put, qx - S * 0.026, qy - S * 0.024, qx - S * 0.042, qy - S * 0.016, S * 0.011, () => P.gold);
    [-1, 1].forEach(s => stroke(put, qx + s * S * 0.006, qy + S * 0.045, qx + s * S * 0.01, qy + S * 0.058, 1, () => P.brassDk));
    stroke(put, qx - S * 0.05, qy - S * 0.06, qx - S * 0.065, qy - S * 0.075, 1, () => P.sail);
  }
  // COLOSSAL TENTACLE — the entrance FX (rises from the sea, throws him in).
  function drawColossalTentacle(put, S) {
    let px = S * 0.55, py = S * 0.96, ang = -1.65;
    for (let seg = 0; seg < 11; seg++) {
      const w = S * (0.15 - seg * 0.011);
      const nx = px + Math.cos(ang) * S * 0.1, ny = py + Math.sin(ang) * S * 0.095;
      stroke(put, px, py, nx, ny, w, (t) => mix('#7e3a5c', '#4a1f38', t * 0.4 + seg * 0.05));
      if (seg > 0 && seg < 9) {
        ell(put, px + Math.cos(ang + 1.57) * w * 0.45, py + Math.sin(ang + 1.57) * w * 0.45, S * 0.028, S * 0.022, (tx, ty) => mix(P.sail, P.sailDkk, ty));
      }
      px = nx; py = ny; ang += 0.24;
    }
    ell(put, px, py, S * 0.045, S * 0.04, (tx, ty) => mix('#b06a8e', '#7e3a5c', ty));
    // sea spray at the base
    [[0.3, 0.93], [0.75, 0.9], [0.42, 0.87], [0.68, 0.95]].forEach(([fx, fy]) => {
      ell(put, S * fx, S * fy, S * 0.03, S * 0.015, (tx, ty) => mix(P.moonLt, P.seaLt, ty));
    });
  }
  // THE GHOST SHIP — spectral broadside galleon (side-on; ghost teal ONLY here).
  function drawGhostShip(put, S) {
    const cy = S * 0.62;
    // hull silhouette
    for (let y = 0; y < S * 0.2; y++) {
      const t = y / (S * 0.2);
      const x0 = S * (0.08 + t * 0.06), x1 = S * (0.92 - t * 0.04);
      row(put, Math.round(cy + y), x0, x1, (tx) => {
        if ((y + Math.floor(tx * 30)) % 5 === 4) return null;          // spectral scanlines
        let b = mix(P.ghostDk, P.ghostDkk, t * 0.7);
        if (t < 0.15) b = P.ghost;
        return b;
      });
    }
    // gunports (glowing — the telegraph anchors)
    [0.2, 0.35, 0.5, 0.65, 0.8].forEach(fx => {
      ell(put, S * fx, cy + S * 0.09, S * 0.022, S * 0.02, (tx, ty) => mix(P.ghostLt, P.ghost, ty));
      put(Math.round(S * fx), Math.round(cy + S * 0.09), '#ffffff');
    });
    // three masts + tattered spectral sails
    [0.26, 0.5, 0.74].forEach((fx, i) => {
      const mx = S * fx, h = S * (0.36 + (i === 1 ? 0.1 : 0));
      stroke(put, mx, cy, mx, cy - h, S * 0.012, () => P.ghostDk);
      for (let y = 0; y < h * 0.55; y++) {
        const t = y / (h * 0.55);
        const w = S * (0.1 - t * 0.02) * (1 + (i === 1 ? 0.25 : 0));
        row(put, Math.round(cy - h + y + S * 0.04), mx - w, mx + w, (tx) => {
          if ((y + Math.floor(tx * 20)) % 4 === 3) return null;
          if (t > 0.7 && Math.sin(tx * 17) > 0.5) return null;         // tattered hems
          return mix(P.ghostLt, P.ghost, t + Math.abs(tx - 0.5) * 0.5);
        });
      }
    });
    // skull figurehead + wake glow
    skull(put, S * 0.06, cy + S * 0.02, S * 0.026, P.ghostLt);
    for (let x = 0; x < S; x += 3) put(x, Math.round(cy + S * 0.21), (x / 3 | 0) % 2 ? P.ghost : null);
  }

  // ======================= DECOR (ALL 20) ===================================
  function drawWheel(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.06, cy + S * 0.1, cx + S * 0.06, cy + S * 0.3, P.wood, P.woodLt, P.woodDkk);
    plate(put, cx - S * 0.1, cy + S * 0.28, cx + S * 0.1, cy + S * 0.34, P.woodDk, P.wood, P.woodDkk);
    for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * S * 0.16), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.16), P.woodDk);
    for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * S * 0.14), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.14), P.wood);
    for (let a = 0; a < 6.28; a += 0.785) {
      stroke(put, cx, cy - S * 0.04, cx + Math.cos(a) * S * 0.15, cy - S * 0.04 + Math.sin(a) * S * 0.15, 2, () => P.woodLt);
      stroke(put, cx + Math.cos(a) * S * 0.16, cy - S * 0.04 + Math.sin(a) * S * 0.16, cx + Math.cos(a) * S * 0.22, cy - S * 0.04 + Math.sin(a) * S * 0.22, S * 0.02, () => P.woodDk);
      ell(put, cx + Math.cos(a) * S * 0.23, cy - S * 0.04 + Math.sin(a) * S * 0.23, S * 0.014, S * 0.014, (tx, ty) => mix(P.woodLt, P.woodDkk, ty));
    }
    bolt(put, cx, cy - S * 0.04, S * 0.03, P.brass, P.brassDk);
  }
  function drawMainmast(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    for (let y = S * 0.06; y < S * 0.88; y++) row(put, Math.round(y), cx - S * 0.035, cx + S * 0.035, (tx) => mix(P.woodLt, P.woodDk, Math.abs(tx - 0.5) * 1.6 + (y / S) * 0.2));
    [0.24, 0.5, 0.74].forEach(yy => row(put, Math.round(S * yy), cx - S * 0.04, cx + S * 0.04, () => P.ironDk));
    stroke(put, cx - S * 0.3, S * 0.16, cx + S * 0.3, S * 0.16, S * 0.02, () => P.woodDk);
    for (let x = -0.28; x < 0.3; x += 0.02) {
      const sag = Math.abs(Math.sin(x * 12)) * S * 0.02;
      stroke(put, cx + x * S, S * 0.17, cx + x * S, S * 0.22 + sag, 2, () => mix(P.sail, P.sailDk, Math.abs(Math.sin(x * 9))));
    }
    [-0.2, 0, 0.2].forEach(o => stroke(put, cx + o * S, S * 0.17, cx + o * S, S * 0.23, 1, () => P.woodDkk));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.6, cx + s * S * 0.09, S * 0.58, 2, () => P.brassDk));
    for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + S * 0.1 + Math.cos(a) * S * 0.035), Math.round(S * 0.8 + Math.sin(a) * S * 0.025), P.wood);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.1, cx + s * S * 0.34, S * 0.86, 1, () => P.woodDkk));
  }
  function drawCannonRow(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.3);
    [[-0.16, 0], [0.14, 0.04]].forEach(([o, oy]) => {
      const gx = cx + o * S, gy = cy + oy * S;
      plate(put, gx - S * 0.07, gy + S * 0.02, gx + S * 0.09, gy + S * 0.1, P.wood, P.woodLt, P.woodDkk);
      [-0.03, 0.06].forEach(w => { ell(put, gx + w * S, gy + S * 0.12, S * 0.035, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.12 && d <= 0.25 ? P.woodDk : null; }); bolt(put, gx + w * S, gy + S * 0.12, S * 0.01, P.brass, P.brassDk); });
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        ell(put, lerp(gx + S * 0.06, gx - S * 0.12, t), lerp(gy + S * 0.0, gy - S * 0.1, t), S * (0.045 - t * 0.008 + (t > 0.88 ? 0.008 : 0)), S * 0.04, (tx, ty) => mix(P.cannon, P.cannonDk, ty));
      }
      ell(put, gx - S * 0.125, gy - S * 0.105, S * 0.022, S * 0.026, () => P.oil);
    });
    [[0.0, 0.16], [-0.03, 0.16], [0.03, 0.16], [0.0, 0.13]].forEach(([ox, oy]) => dome(put, cx + ox * S + S * 0.3, cy + oy * S, S * 0.022, S * 0.02, P.iron, P.moon, P.cannonDk));
    for (let y = 0; y < S * 0.06; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * 0.34 - (S * 0.028 - y * 0.2), cx - S * 0.34 + (S * 0.028 - y * 0.2), () => mix(P.wood, P.woodDkk, y / (S * 0.06)));
  }
  function drawCargoHatch(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    planks(put, cx - S * 0.32, cy - S * 0.24, cx + S * 0.32, cy + S * 0.26);
    plate(put, cx - S * 0.2, cy - S * 0.14, cx + S * 0.2, cy + S * 0.16, P.woodDk, P.wood, P.woodDkk);
    for (let y = Math.round(cy - S * 0.11); y < cy + S * 0.13; y++) {
      row(put, y, cx - S * 0.17, cx + S * 0.17, (tx) => {
        const gx = (tx * S * 0.34) % (S * 0.045), gy = (y - cy + S * 0.11) % (S * 0.045);
        if (gx < S * 0.02 || gy < S * 0.02) return mix(P.wood, P.woodDk, 0.3);
        return P.oil;
      });
    }
    [[-0.06, 0.0], [0.05, 0.04]].forEach(([ox, oy]) => { put(Math.round(cx + ox * S - 2), Math.round(cy + oy * S), P.gold); put(Math.round(cx + ox * S + 2), Math.round(cy + oy * S), P.gold); });
    [-1, 1].forEach(s => { for (let a = 0; a < 3.14; a += 0.3) put(Math.round(cx + s * S * 0.19 + Math.cos(a) * S * 0.02), Math.round(cy + Math.sin(a) * S * 0.025), P.wood); });
  }
  function drawCrowsNest(put, S) {
    const cx = S * 0.5;
    for (let y = S * 0.34; y < S * 0.9; y++) row(put, Math.round(y), cx - S * 0.025, cx + S * 0.025, (tx) => mix(P.woodLt, P.woodDk, Math.abs(tx - 0.5) * 1.6));
    for (let y = 0; y < S * 0.16; y++) {
      const t = y / (S * 0.16), w = S * (0.11 + Math.sin(t * Math.PI) * 0.01);
      row(put, Math.round(S * 0.2 + y), cx - w, cx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    [0.23, 0.32].forEach(yy => row(put, Math.round(S * yy), cx - S * 0.115, cx + S * 0.115, () => P.ironDk));
    stroke(put, cx + S * 0.06, S * 0.18, cx + S * 0.16, S * 0.14, S * 0.018, () => P.brass);
    dome(put, cx + S * 0.02, S * 0.185, S * 0.035, S * 0.02, P.red, P.redLt, P.redDk);
    stroke(put, cx, S * 0.06, cx, S * 0.2, 1, () => P.woodDk);
    for (let y = 0; y < S * 0.05; y++) row(put, Math.round(S * 0.07 + y), cx + 1, cx + S * 0.12 - y * 0.8, () => (y < 2 ? P.red : P.redDk));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.1, S * 0.36, cx + s * S * 0.3, S * 0.9, 1, () => P.woodDkk));
  }
  function drawRowboat(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.22, cy + S * 0.28, cx + s * S * 0.22, cy - S * 0.2, S * 0.02, () => P.ironDk);
      stroke(put, cx + s * S * 0.22, cy - S * 0.2, cx + s * S * 0.14, cy - S * 0.24, S * 0.018, () => P.ironDk);
      stroke(put, cx + s * S * 0.14, cy - S * 0.24, cx + s * S * 0.13, cy - S * 0.04, 1, () => P.sailDk);
    });
    for (let y = 0; y < S * 0.12; y++) {
      const t = y / (S * 0.12);
      const half = S * (0.2 - t * t * 0.08);
      row(put, Math.round(cy - S * 0.02 + y), cx - half, cx + half, (tx) => {
        let b = mix(P.wood, P.woodDkk, t * 0.6);
        if (Math.abs(tx - 0.5) > 0.44) b = P.woodDk;
        if ((tx * 9 | 0) % 2 === 0 && t < 0.3) b = mix(b, P.woodLt, 0.3);
        return b;
      });
    }
    row(put, Math.round(cy - S * 0.03), cx - S * 0.2, cx + S * 0.2, () => P.woodLt);
    [[-0.08], [0.06]].forEach(([o]) => row(put, Math.round(cy + S * 0.0), cx + o * S - S * 0.035, cx + o * S + S * 0.035, () => P.woodLt));
    stroke(put, cx - S * 0.16, cy - S * 0.1, cx + S * 0.18, cy + S * 0.04, 2, () => P.woodDk);
    stroke(put, cx + S * 0.16, cy - S * 0.1, cx - S * 0.18, cy + S * 0.04, 2, () => P.woodDk);
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.19, cy + S * 0.045, S * 0.025, S * 0.014, (tx, ty) => mix(P.woodLt, P.woodDk, ty)));
  }
  function drawTreasureChest(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.18, cy - S * 0.02, cx + S * 0.18, cy + S * 0.18, P.wood, P.woodLt, P.woodDkk);
    [(-0.12), 0, 0.12].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.18; y++) put(Math.round(cx + o * S), y, P.ironDk); });
    dome(put, cx, cy - S * 0.08, S * 0.19, S * 0.09, P.woodDk, P.wood, P.woodDkk);
    [(-0.12), 0, 0.12].forEach(o => { for (let a = 0.2; a < 2.9; a += 0.2) put(Math.round(cx + o * S + Math.cos(a) * S * 0.02), Math.round(cy - S * 0.08 - Math.sin(a) * S * 0.07), P.ironDk); });
    row(put, Math.round(cy - S * 0.015), cx - S * 0.17, cx + S * 0.17, () => P.goldLt);
    row(put, Math.round(cy - S * 0.005), cx - S * 0.15, cx + S * 0.15, () => '#fffbe0');
    [[-0.2, 0.16], [-0.24, 0.2], [0.2, 0.14], [0.24, 0.19], [0.0, 0.2]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.013, (tx, ty) => mix(P.goldLt, P.goldDk, ty)));
    ell(put, cx + S * 0.1, cy + S * 0.22, S * 0.014, S * 0.014, () => '#ffffff');
    plate(put, cx - S * 0.02, cy - S * 0.02, cx + S * 0.02, cy + S * 0.05, P.brass, P.brassLt, P.brassDk);
    for (let a = 0; a < 3.14; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.02), Math.round(cy + S * 0.07 - Math.sin(a) * S * 0.02), P.iron);
  }
  function drawRumBarrels(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.26);
    [[-0.13, 0.02], [0.13, 0.02]].forEach(([o, oy]) => {
      const bx = cx + o * S, by = cy + oy * S;
      for (let y = 0; y < S * 0.24; y++) {
        const t = y / (S * 0.24), w = S * (0.085 + Math.sin(t * Math.PI) * 0.018);
        row(put, Math.round(by - S * 0.06 + y), bx - w, bx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
      }
      [0.0, 0.1].forEach(o2 => row(put, Math.round(by - S * 0.0 + o2 * S), bx - S * 0.095, bx + S * 0.095, () => P.ironDk));
    });
    for (let x = -0.11; x < 0.11; x += 0.01) {
      const t = (x + 0.11) / 0.22, h = S * (0.07 + Math.sin(t * Math.PI) * 0.015);
      for (let y = -h; y < h; y++) put(Math.round(cx + x * S), Math.round(cy - S * 0.18 + y), mix(P.woodLt, P.woodDkk, Math.abs(y) / h * 0.7));
    }
    [-0.06, 0.06].forEach(o => { for (let y = -S * 0.075; y < S * 0.075; y++) put(Math.round(cx + o * S), Math.round(cy - S * 0.18 + y), P.ironDk); });
    ell(put, cx - S * 0.115, cy - S * 0.18, S * 0.015, S * 0.06, (tx, ty) => mix(P.woodDk, P.woodDkk, tx));
    stroke(put, cx - S * 0.13, cy + S * 0.06, cx - S * 0.18, cy + S * 0.06, 2, () => P.brassDk);
    stroke(put, cx - S * 0.185, cy + S * 0.07, cx - S * 0.185, cy + S * 0.12, 1, () => '#c89858');
    plate(put, cx - S * 0.22, cy + S * 0.13, cx - S * 0.15, cy + S * 0.2, P.iron, P.moon, P.ironDk);
    [0, 1, 2].forEach(i => { stroke(put, cx + S * 0.13 + i * 4, cy + S * 0.02, cx + S * 0.15 + i * 4, cy + S * 0.05, 1, () => P.woodDkk); stroke(put, cx + S * 0.15 + i * 4, cy + S * 0.02, cx + S * 0.13 + i * 4, cy + S * 0.05, 1, () => P.woodDkk); });
  }
  function drawGalleyStove(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.26);
    for (let y = 0; y < S * 0.2; y++) {
      row(put, Math.round(cy + S * 0.04 + y), cx - S * 0.18, cx + S * 0.18, (tx) => {
        const bh = 6, off = (Math.floor(y / bh) % 2) * 10;
        let b = mix('#8a4a3a', '#5c2c22', ((y / bh | 0) * 13 % 7) / 7 * 0.5);
        if (y % bh < 1 || ((tx * S * 0.36 + off) % 20) < 1.4) b = '#3a1c16';
        return b;
      });
    }
    for (let y = 0; y < S * 0.1; y++) {
      const t = y / (S * 0.1);
      let w = S * 0.07; if (t < 0.4) { const a2 = t / 0.4; w = S * 0.07 * Math.sqrt(a2 * (2 - a2)); }
      row(put, Math.round(cy + S * 0.1 + y), cx - w, cx + w, () => mix(P.oil, '#2a0e08', t));
    }
    ell(put, cx, cy + S * 0.17, S * 0.045, S * 0.02, (tx, ty) => mix('#ffb84a', '#c2571a', ty));
    put(Math.round(cx), Math.round(cy + S * 0.155), '#fff0b0');
    ell(put, cx, cy + S * 0.03, S * 0.13, S * 0.04, (tx, ty) => mix(P.iron, P.cannonDk, ty));
    for (let y = 0; y < S * 0.1; y++) {
      const t = y / (S * 0.1), w = S * (0.11 + Math.sin(t * Math.PI) * 0.012);
      row(put, Math.round(cy - S * 0.07 + y), cx - w, cx + w, (tx) => mix(P.iron, P.cannonDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    ell(put, cx, cy - S * 0.07, S * 0.1, S * 0.03, (tx, ty) => mix('#7a5c3a', '#57402c', ty));
    [[0.02, -0.14], [-0.04, -0.2], [0.05, -0.26]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.014, () => P.sailDk));
    stroke(put, cx + S * 0.1, cy - S * 0.09, cx + S * 0.17, cy - S * 0.18, 2, () => P.woodDk);
    stroke(put, cx - S * 0.22, cy - S * 0.22, cx - S * 0.22, cy - S * 0.1, 1, () => P.sailDk);
    ell(put, cx - S * 0.22, cy - S * 0.06, S * 0.025, S * 0.045, (tx, ty) => mix('#7a92aa', '#46586e', ty));
  }
  function drawChartTable(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.24, cy - S * 0.06, cx + S * 0.24, cy + S * 0.1, P.woodDk, P.wood, P.woodDkk);
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.18 - S * 0.02, cy + S * 0.1, cx + s * S * 0.18 + S * 0.02, cy + S * 0.26, P.woodDk, P.wood, P.woodDkk));
    plate(put, cx - S * 0.18, cy - S * 0.12, cx + S * 0.14, cy + S * 0.04, P.sail, '#f4efdf', P.sailDk);
    for (let t = 0; t < 1; t += 0.06) put(Math.round(cx - S * 0.14 + t * S * 0.2), Math.round(cy - S * 0.06 + Math.sin(t * 7) * S * 0.02), P.seaLt);
    for (let t = 0; t < 1; t += 0.12) put(Math.round(cx - S * 0.1 + t * S * 0.18), Math.round(cy - S * 0.02 + Math.sin(t * 4) * S * 0.012), P.redDk);
    stroke(put, cx + S * 0.07, cy - S * 0.045, cx + S * 0.1, cy - S * 0.015, 1, () => P.red);
    stroke(put, cx + S * 0.1, cy - S * 0.045, cx + S * 0.07, cy - S * 0.015, 1, () => P.red);
    for (let x = 0; x < S * 0.1; x++) put(Math.round(cx + S * 0.16 + x * 0.4), Math.round(cy - S * 0.1 + x * 0.1), P.sailDk);
    ell(put, cx + S * 0.18, cy + S * 0.0, S * 0.028, S * 0.028, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
    put(Math.round(cx + S * 0.18), Math.round(cy - S * 0.005), P.redDk);
    stroke(put, cx + S * 0.085, cy - S * 0.03, cx + S * 0.085, cy - S * 0.09, 1, () => P.moonLt);
    ell(put, cx + S * 0.085, cy - S * 0.1, S * 0.012, S * 0.01, () => P.brassDk);
    stroke(put, cx - S * 0.2, cy - S * 0.12, cx - S * 0.2, cy - S * 0.06, S * 0.014, () => P.bone);
    ell(put, cx - S * 0.2, cy - S * 0.145, S * 0.014, S * 0.02, (tx, ty) => mix('#ffe08a', '#c2571a', ty));
  }
  function drawShipRail(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    plate(put, cx - S * 0.32, cy - S * 0.08, cx + S * 0.32, cy - S * 0.02, P.woodLt, P.woodLt, P.woodDk);
    for (let x = -0.28; x <= 0.28; x += 0.08) {
      for (let y = 0; y < S * 0.16; y++) {
        const t = y / (S * 0.16), w = S * (0.014 + Math.sin(t * Math.PI) * 0.008);
        row(put, Math.round(cy - S * 0.02 + y), cx + x * S - w, cx + x * S + w, (tx) => mix(P.wood, P.woodDkk, t * 0.4 + Math.abs(tx - 0.5)));
      }
    }
    plate(put, cx - S * 0.32, cy + S * 0.14, cx + S * 0.32, cy + S * 0.2, P.wood, P.woodLt, P.woodDkk);
    for (let i = 0; i < 4; i++) stroke(put, cx + S * (0.12 + i * 0.06), cy - S * 0.08, cx + S * (0.2 + i * 0.03), cy - S * 0.34, 1, () => P.woodDkk);
    [0.14, 0.2, 0.26].forEach(yy => stroke(put, cx + S * 0.13, cy - S * (yy - 0.06) - S * 0.08, cx + S * 0.3, cy - S * yy - S * 0.02, 1, () => P.woodDk));
    for (let a = 0; a < 6.28; a += 0.1) {
      const rx = cx - S * 0.18 + Math.cos(a) * S * 0.055, ry = cy + S * 0.05 + Math.sin(a) * S * 0.055;
      put(Math.round(rx), Math.round(ry), Math.floor(a / 1.57) % 2 ? P.red : P.sail);
      put(Math.round(rx), Math.round(ry) + 1, Math.floor(a / 1.57) % 2 ? P.redDk : P.sailDk);
    }
  }
  function drawFigurehead(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const bx = lerp(cx + S * 0.24, cx - S * 0.06, t), by = lerp(cy + S * 0.3, cy - S * 0.1, t);
      ell(put, bx, by, S * (0.1 - t * 0.03), S * 0.05, (tx, ty) => {
        let b = mix(P.wood, P.woodDkk, ty + Math.abs(tx - 0.5) * 0.3);
        if ((t * 8 | 0) % 2 === 0) b = mix(b, P.woodLt, 0.2);
        return b;
      });
    }
    for (let t = 0; t < 1; t += 0.05) put(Math.round(lerp(cx + S * 0.26, cx - S * 0.04, t)), Math.round(lerp(cy + S * 0.24, cy - S * 0.08, t)), P.gold);
    dome(put, cx - S * 0.08, cy - S * 0.16, S * 0.055, S * 0.055, P.woodLt, '#d8bb90', P.woodDk);
    dome(put, cx - S * 0.05, cy - S * 0.22, S * 0.06, S * 0.035, P.gold, P.goldLt, P.goldDk);
    for (let i = 0; i < 3; i++) stroke(put, cx - S * 0.01 + i * 2, cy - S * 0.2, cx + S * 0.05 + i * 3, cy - S * 0.1 + i * 2, 2, () => P.goldDk);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      stroke(put, cx - S * 0.08 + t * S * 0.06, cy - S * 0.1 + t * S * 0.06, cx - S * 0.02 + t * S * 0.1, cy + S * 0.06 + t * S * 0.08, S * 0.025, (tt) => mix(P.woodLt, P.woodDk, tt));
    }
    stroke(put, cx - S * 0.1, cy - S * 0.1, cx - S * 0.02, cy - S * 0.02, S * 0.02, () => P.woodLt);
    put(Math.round(cx - S * 0.095), Math.round(cy - S * 0.165), P.oil);
    [[0.3, 0.32], [0.34, 0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S - S * 0.05), Math.round(cy + oy * S), P.moonLt));
  }
  function drawCapstan(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.24);
    for (let y = 0; y < S * 0.2; y++) {
      const t = y / (S * 0.2), w = S * (0.11 - Math.sin(t * Math.PI) * 0.02);
      row(put, Math.round(cy - S * 0.08 + y), cx - w, cx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.6));
    }
    ell(put, cx, cy - S * 0.09, S * 0.11, S * 0.035, (tx, ty) => mix(P.woodLt, P.woodDk, ty));
    [[-1, -0.02], [1, 0.02]].forEach(([s, oy]) => {
      stroke(put, cx + s * S * 0.1, cy - S * 0.06, cx + s * S * 0.32, cy - S * 0.06 + oy * S * 3, S * 0.022, () => P.wood);
      ell(put, cx + s * S * 0.33, cy - S * 0.06 + oy * S * 3, S * 0.016, S * 0.016, (tx, ty) => mix(P.woodLt, P.woodDk, ty));
    });
    for (let a = 0; a < 9.4; a += 0.35) {
      const rr = S * 0.115, yy = cy - S * 0.02 + (a / 9.4) * S * 0.1;
      put(Math.round(cx + Math.cos(a) * rr), Math.round(yy), (a * 3 | 0) % 2 ? P.iron : P.ironDk);
    }
    for (let t = 0; t < 1; t += 0.07) {
      ell(put, cx + S * 0.12 + t * S * 0.2, cy + S * 0.12 + t * S * 0.08, S * 0.014, S * 0.018, () => ((t * 12 | 0) % 2 ? P.iron : P.ironDk));
    }
    stroke(put, cx + S * 0.32, cy + S * 0.14, cx + S * 0.32, cy + S * 0.26, S * 0.016, () => P.iron);
    for (let a = 0.4; a < 2.8; a += 0.2) put(Math.round(cx + S * 0.32 + Math.cos(a) * S * 0.045), Math.round(cy + S * 0.28 + Math.sin(a) * S * 0.03 - S * 0.02), P.iron);
    dome(put, cx + S * 0.32, cy + S * 0.13, S * 0.018, S * 0.014, P.iron, P.moon, P.ironDk);
  }
  function drawRiggingWall(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    stroke(put, cx - S * 0.26, cy + S * 0.34, cx - S * 0.08, cy - S * 0.36, S * 0.014, () => P.woodDk);
    stroke(put, cx + S * 0.26, cy + S * 0.34, cx + S * 0.08, cy - S * 0.36, S * 0.014, () => P.woodDk);
    stroke(put, cx - S * 0.14, cy + S * 0.34, cx - S * 0.02, cy - S * 0.36, 1, () => P.woodDk);
    stroke(put, cx + S * 0.14, cy + S * 0.34, cx + S * 0.02, cy - S * 0.36, 1, () => P.woodDk);
    for (let t = 0.06; t < 0.95; t += 0.09) {
      const y = cy + S * 0.34 - t * S * 0.7;
      const halfW = S * (0.26 - t * 0.18);
      stroke(put, cx - halfW, y, cx + halfW, y, 1, () => P.wood);
    }
    [-0.26, -0.14, 0.14, 0.26].forEach(o => {
      ell(put, cx + o * S, cy + S * 0.36, S * 0.022, S * 0.022, (tx, ty) => mix(P.woodLt, P.woodDkk, ty));
      [[-1, 0], [1, 0], [0, 1]].forEach(([kx, ky]) => put(Math.round(cx + o * S + kx * 2), Math.round(cy + S * 0.36 + ky * 2), P.oil));
    });
    ell(put, cx + S * 0.06, cy - S * 0.06, S * 0.03, S * 0.018, (tx, ty) => mix('#6e6684', '#2c2638', ty));
    stroke(put, cx + S * 0.09, cy - S * 0.055, cx + S * 0.13, cy - S * 0.05, 1, () => '#8a8498');
    stroke(put, cx - S * 0.1, cy + S * 0.1, cx - S * 0.1, cy + S * 0.16, 1, () => P.sailDk);
    ell(put, cx - S * 0.1, cy + S * 0.185, S * 0.022, S * 0.028, (tx, ty) => mix(P.woodDk, P.oil, ty));
  }
  function drawDeckLantern(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.12);
    stroke(put, cx, S * 0.3, cx, S * 0.84, S * 0.022, () => P.woodDk);
    plate(put, cx - S * 0.07, S * 0.82, cx + S * 0.07, S * 0.88, P.wood, P.woodLt, P.woodDkk);
    stroke(put, cx, S * 0.3, cx + S * 0.12, S * 0.26, S * 0.016, () => P.woodDk);
    const lx = cx + S * 0.14, ly = S * 0.36;
    stroke(put, lx, S * 0.27, lx, S * 0.3, 1, () => P.brassDk);
    dome(put, lx, ly - S * 0.06, S * 0.045, S * 0.02, P.brass, P.brassLt, P.brassDk);
    for (let y = 0; y < S * 0.1; y++) {
      const t = y / (S * 0.1), w = S * (0.035 + Math.sin(t * Math.PI) * 0.012);
      row(put, Math.round(ly - S * 0.05 + y), lx - w, lx + w, (tx) => {
        if (Math.abs(tx - 0.5) > 0.4) return P.brassDk;
        return mix('#fff0b0', '#ffb84a', t + Math.abs(tx - 0.5));
      });
    }
    put(Math.round(lx), Math.round(ly), '#ffffff');
    dome(put, lx, ly + S * 0.055, S * 0.03, S * 0.014, P.brass, P.brassLt, P.brassDk);
    [[0.08, -0.04], [-0.07, 0.0], [0.02, 0.1], [0.0, -0.12]].forEach(([ox, oy]) => put(Math.round(lx + ox * S), Math.round(ly + oy * S), '#ffe08a'));
  }
  function drawNetsCrates(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.28);
    plate(put, cx - S * 0.2, cy - S * 0.04, cx + S * 0.0, cy + S * 0.16, P.wood, P.woodLt, P.woodDkk);
    stroke(put, cx - S * 0.2, cy - S * 0.04, cx + S * 0.0, cy + S * 0.16, 2, () => P.woodDk);
    stroke(put, cx + S * 0.0, cy - S * 0.04, cx - S * 0.2, cy + S * 0.16, 2, () => P.woodDk);
    plate(put, cx - S * 0.12, cy - S * 0.18, cx + S * 0.04, cy - S * 0.04, P.woodLt, P.sail, P.woodDk);
    for (let i = 0; i < 6; i++) stroke(put, cx + S * 0.02 + i * S * 0.04, cy - S * 0.1, cx + S * 0.06 + i * S * 0.04, cy + S * 0.18, 1, () => P.woodDk);
    for (let j = 0; j < 5; j++) stroke(put, cx + S * 0.02, cy - S * 0.06 + j * S * 0.05, cx + S * 0.26, cy - S * 0.1 + j * S * 0.055, 1, () => P.woodDk);
    [[0.08, -0.08], [0.2, -0.06]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, (tx, ty) => mix(P.red, P.redDk, ty)));
    ell(put, cx + S * 0.14, cy + S * 0.1, S * 0.035, S * 0.02, (tx, ty) => mix('#7a92aa', '#46586e', ty));
    put(Math.round(cx + S * 0.17), Math.round(cy + S * 0.095), P.oil);
    for (let a = 0; a < 6.28; a += 1.256) stroke(put, cx - S * 0.26, cy + S * 0.2, cx - S * 0.26 + Math.cos(a) * S * 0.03, cy + S * 0.2 + Math.sin(a) * S * 0.03, 2, () => P.redLt);
  }
  function drawThePlank(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    plate(put, cx - S * 0.34, cy - S * 0.04, cx - S * 0.06, cy + S * 0.02, P.woodLt, P.woodLt, P.woodDk);
    for (let x = -0.3; x <= -0.1; x += 0.08) {
      for (let y = 0; y < S * 0.12; y++) put(Math.round(cx + x * S), Math.round(cy + S * 0.02 + y), P.wood);
    }
    plate(put, cx - S * 0.34, cy + S * 0.14, cx - S * 0.06, cy + S * 0.2, P.wood, P.woodLt, P.woodDkk);
    for (let x = 0; x < S * 0.36; x++) {
      const t = x / (S * 0.36);
      row(put, Math.round(cy - S * 0.01 + Math.sin(t * 2) * S * 0.012), cx - S * 0.06 + x, cx - S * 0.05 + x, () => mix(P.woodLt, P.woodDk, t * 0.4));
    }
    stroke(put, cx - S * 0.06, cy + S * 0.01, cx + S * 0.3, cy + S * 0.02, 1, () => P.woodDkk);
    for (let y = 0; y < S * 0.1; y++) row(put, Math.round(cy + S * 0.26 + y), cx + S * 0.02, cx + S * 0.42, (tx) => {
      let b = mix(P.seaLt, P.sea, y / (S * 0.1));
      if (Math.sin(tx * 12 + y) > 0.7) b = mix(b, P.moonLt, 0.4);
      return b;
    });
    stroke(put, cx + S * 0.24, cy + S * 0.26, cx + S * 0.28, cy + S * 0.2, S * 0.025, (t) => mix('#5c7288', '#46586e', t));
    dome(put, cx + S * 0.27, cy - S * 0.045, S * 0.025, S * 0.02, '#ffffff', '#ffffff', '#c8ced8');
    put(Math.round(cx + S * 0.24), Math.round(cy - S * 0.05), P.brass);
  }
  function drawTatteredSail(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    stroke(put, cx - S * 0.34, cy - S * 0.24, cx + S * 0.34, cy - S * 0.28, S * 0.022, () => P.woodDk);
    for (let y = 0; y < S * 0.5; y++) {
      const t = y / (S * 0.5);
      row(put, Math.round(cy - S * 0.26 + y), cx - S * (0.3 - t * 0.06), cx + S * (0.3 - t * 0.1), (tx) => {
        if (t > 0.5 && Math.sin(tx * 23 + t * 9) > 0.82) return null;
        if (t > 0.8 && Math.floor(tx * 9) % 2 === 0) return null;
        let b = mix(P.sail, P.sailDk, t * 0.5 + Math.abs(Math.sin(tx * 6)) * 0.25);
        if (Math.abs(tx - 0.3) < 0.02 || Math.abs(tx - 0.7) < 0.02) b = P.sailDkk;
        return b;
      });
    }
    plate(put, cx - S * 0.06, cy - S * 0.08, cx + S * 0.06, cy + S * 0.02, P.sailDk, P.sail, P.sailDkk);
    [[-0.06, 1], [0.06, 1]].forEach(([o]) => { for (let y = -0.08; y < 0.02; y += 0.025) put(Math.round(cx + o * S), Math.round(cy + y * S), P.woodDkk); });
    [[-0.2, 0.24], [0.12, 0.22]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S + S * 0.08, 1, () => P.wood));
  }
  function drawParrotPerch(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.12);
    stroke(put, cx, S * 0.34, cx, S * 0.84, S * 0.02, () => P.woodDk);
    plate(put, cx - S * 0.08, S * 0.82, cx + S * 0.08, S * 0.88, P.wood, P.woodLt, P.woodDkk);
    stroke(put, cx - S * 0.14, S * 0.34, cx + S * 0.14, S * 0.34, S * 0.018, () => P.wood);
    const px = cx + S * 0.05, py = S * 0.24;
    ell(put, px, py + S * 0.02, S * 0.05, S * 0.07, (tx, ty) => mix(P.red, P.redDk, clamp(ty * 1.2, 0, 1)));
    stroke(put, px + S * 0.02, py + S * 0.06, px + S * 0.05, py + S * 0.16, S * 0.022, (t) => mix(P.seaLt, P.sea, t));
    ell(put, px - S * 0.01, py - S * 0.045, S * 0.032, S * 0.03, (tx, ty) => mix(P.red, P.redDk, ty));
    ell(put, px - S * 0.03, py - S * 0.045, S * 0.014, S * 0.018, () => '#ffffff');
    put(Math.round(px - S * 0.028), Math.round(py - S * 0.05), P.oil);
    stroke(put, px - S * 0.045, py - S * 0.04, px - S * 0.07, py - S * 0.028, S * 0.016, () => P.gold);
    ell(put, px + S * 0.012, py + S * 0.01, S * 0.025, S * 0.045, (tx, ty) => mix('#e8b23a', P.redDk, ty));
    [-1, 1].forEach(s => stroke(put, px + s * S * 0.012, py + S * 0.08, px + s * S * 0.02, py + S * 0.1, 1, () => P.brassDk));
    stroke(put, px - S * 0.1, py - S * 0.12, px - S * 0.14, py - S * 0.16, 1, () => P.sail);
    put(Math.round(px - S * 0.16), Math.round(py - S * 0.18), P.sail);
    ell(put, cx - S * 0.1, S * 0.325, S * 0.025, S * 0.014, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
  }
  function drawHammocks(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.3, cy - S * 0.24, cx + s * S * 0.3, cy + S * 0.3, S * 0.022, () => P.woodDk); });
    [[-0.1, 0.35], [0.08, 0.35]].forEach(([oy], i) => {
      const y0 = cy + oy * S;
      for (let t = 0; t < 1; t += 0.02) {
        const sag = Math.sin(t * Math.PI) * S * 0.08;
        const x = cx - S * 0.3 + t * S * 0.6;
        put(Math.round(x), Math.round(y0 + sag), mix(P.sail, P.sailDk, Math.abs(t - 0.5)));
        put(Math.round(x), Math.round(y0 + sag + 1), P.sailDk);
        if ((t * 20 | 0) % 4 === 0) put(Math.round(x), Math.round(y0 + sag + 2), P.sailDkk);
      }
      if (i === 1) {
        ell(put, cx - S * 0.02, y0 + S * 0.06, S * 0.09, S * 0.035, (tx, ty) => mix(P.sailDk, P.sailDkk, ty));
        [[0.1, -0.06], [0.14, -0.1]].forEach(([ox, oy2]) => {
          stroke(put, cx + ox * S, y0 + oy2 * S, cx + ox * S + S * 0.02, y0 + oy2 * S, 1, () => P.sail);
          stroke(put, cx + ox * S + S * 0.02, y0 + oy2 * S, cx + ox * S, y0 + oy2 * S + S * 0.015, 1, () => P.sail);
          stroke(put, cx + ox * S, y0 + oy2 * S + S * 0.015, cx + ox * S + S * 0.02, y0 + oy2 * S + S * 0.015, 1, () => P.sail);
        });
        ell(put, cx + S * 0.09, y0 + S * 0.08, S * 0.025, S * 0.018, () => P.oil);
      }
    });
    plate(put, cx - S * 0.12, cy + S * 0.2, cx + S * 0.08, cy + S * 0.32, P.woodDk, P.wood, P.woodDkk);
    row(put, Math.round(cy + S * 0.25), cx - S * 0.12, cx + S * 0.08, () => P.ironDk);
  }

  // ======================= TILES (#1 2 4 5 6 10) ============================
  function tileFn(base) {
    return (put, S) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x, y, S); if (c) put(x, y, c); } };
  }
  const drawMainDeck = tileFn((x, y, T) => {
    const ph = 7, off = (Math.floor(y / ph) % 3) * (T / 3);
    let b = mix(P.deck, P.deckDk, 0.2 + h2(Math.floor(y / ph), 0, 15) * 0.35);
    if (Math.sin((x + off) * 0.4 + Math.floor(y / ph) * 2) > 0.8) b = mix(b, P.woodDkk, 0.4);
    if (y % ph < 1 || (x + off) % (T / 1.5) < 1.4) b = P.woodDkk;
    if (h2(x, y, 17) > 0.995) b = mix(b, P.woodLt, 0.6);
    return b;
  });
  const drawQuarterdeck = tileFn((x, y, T) => {
    const ph = 6, off = (Math.floor(y / ph) % 2) * (T / 4);
    let b = mix(P.woodLt, P.wood, 0.2 + h2(Math.floor(y / ph), 1, 25) * 0.3);
    if (y % ph < 1 || (x + off) % (T / 2) < 1.2) b = P.woodDk;
    if (Math.sin((x - y) * 0.25) > 0.93) b = mix(b, '#e8cd9a', 0.4);
    return b;
  });
  const drawCargoGrate = tileFn((x, y, T) => {
    if ((x % 10 < 4) && (y % 10 < 4)) return mix(P.oil, '#050608', 0.5);
    let b = mix(P.wood, P.woodDk, 0.25 + h2(x >> 1, y >> 1, 45) * 0.4);
    if (x % 10 === 4 || y % 10 === 4) b = P.woodDkk;
    return b;
  });
  const drawCoveSand = tileFn((x, y, T) => {
    let b = mix('#d9c08a', '#a8905e', 0.2 + h2(x >> 2, y >> 2, 55) * 0.4);
    const rip = Math.sin(y * 0.4 + Math.sin(x * 0.1) * 2);
    if (rip > 0.8) b = mix(b, '#f0dca8', 0.5);
    if (h2(x, y, 57) > 0.993) b = mix(b, '#ffffff', 0.4);
    if (h2(x >> 3, y >> 3, 58) > 0.94 && (x + y) % 5 < 2) b = mix(b, P.weedDk, 0.3);
    return b;
  });
  const drawShallows = tileFn((x, y, T) => {
    const s1 = Math.sin(x * 0.14 + y * 0.1) + Math.sin(y * 0.16 - x * 0.05);
    let b = mix(P.seaLt, P.sea, 0.4 + s1 * 0.22);
    if (s1 > 1.2) b = mix(b, P.moonLt, 0.55);
    if (h2(x, y, 65) > 0.995) b = P.moonLt;
    if (h2(x >> 4, y >> 4, 66) > 0.8) b = mix(b, '#d9c08a', 0.25);
    return b;
  });
  const drawStormDeck = tileFn((x, y, T) => {
    const ph = 7, off = (Math.floor(y / ph) % 3) * (T / 3);
    let b = mix('#57402c', '#33251a', 0.3 + h2(Math.floor(y / ph), 5, 105) * 0.4);
    if (y % ph < 1 || (x + off) % (T / 1.5) < 1.4) b = P.oil;
    if (Math.sin((x + y * 0.5) * 0.22) > 0.9) b = mix(b, P.moon, 0.25);
    if (h2(x, y, 107) > 0.995) b = P.moonLt;
    return b;
  });

  // M7k AUDIT fix: the deck keg mob pointed at pxRum — a 64px DECOR canvas —
  // while mobModel assumes the 48px mob canvas (oversized render + hitbox
  // offset up-left). A proper 48×48 keg: one upright powder barrel, centered,
  // adapted from the pxRum stave/hoop drawing.
  function drawDeckKeg(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.2, S * 0.82);
    // bulged stave body
    const hh = S * 0.42;
    for (let y = 0; y < hh; y++) {
      const t = y / hh, w = S * (0.15 + Math.sin(t * Math.PI) * 0.05);
      row(put, Math.round(cy - hh / 2 + y), cx - w, cx + w,
        (tx) => mix(P.woodLt, P.woodDkk, t * 0.45 + Math.abs(tx - 0.5) * 0.6));
    }
    // stave seams
    [-0.09, 0, 0.09].forEach(o =>
      stroke(put, cx + o * S, cy - hh * 0.42, cx + o * S * 1.35, cy + hh * 0.42, 1, () => P.woodDk));
    // iron hoops (top / mid / bottom, following the bulge)
    [-0.16, 0.0, 0.16].forEach(o => {
      const t = o / 0.42 + 0.5, w = S * (0.15 + Math.sin(t * Math.PI) * 0.05);
      row(put, Math.round(cy + o * S), cx - w, cx + w,
        (tx) => mix(P.iron, P.ironDk, Math.abs(tx - 0.5) * 1.4));
    });
    // lid + lit fuse
    ell(put, cx, cy - hh / 2, S * 0.14, S * 0.045, (tx, ty) => mix(P.woodDk, P.woodDkk, ty));
    stroke(put, cx, cy - hh / 2 - 1, cx + S * 0.08, cy - hh / 2 - S * 0.09, 2, () => P.oil);
    put(Math.round(cx + S * 0.08), Math.round(cy - hh / 2 - S * 0.1), P.redLt);
    put(Math.round(cx + S * 0.09), Math.round(cy - hh / 2 - S * 0.11), P.goldLt);
    // powder-mark skull stencil
    skull(put, cx, cy + S * 0.02, S * 0.07);
  }

  // ======================= REGISTRY buildArt hook ===========================
  var PIR_ART = {
    P: P,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (10) ----
      ctx.spr('deckhandHi', MS, MS, drawDeckhand);
      ctx.spr('cutlassCorsairHi', MS, MS, drawCorsair);
      ctx.spr('powderMonkeyHi', MS, MS, drawPowderMonkey);
      ctx.spr('saltyGullHi', MS, MS, drawSaltyGull);
      ctx.spr('sirenWakeHi', MS, MS, drawSiren);
      ctx.spr('krakenArmHi', MS, MS, drawKrakenArm);
      ctx.spr('makoLeaperHi', MS, MS, drawMakoLeaper);
      ctx.spr('drunkenSwabHi', MS, MS, drawDrunkenSwab);
      ctx.spr('harpoonerHi', MS, MS, drawHarpooner);
      ctx.spr('inkpotOctoHi', MS, MS, drawInkpotOcto);
      ctx.spr('deckKegHi', MS, MS, drawDeckKeg);              // M7k AUDIT fix: 48px keg
      ctx.MOB_HI.deckhand = 'deckhandHi';             ctx.MOB_DISPLAY.deckhand = 105;
      ctx.MOB_HI.cutlassCorsair = 'cutlassCorsairHi'; ctx.MOB_DISPLAY.cutlassCorsair = 113;
      ctx.MOB_HI.powderMonkey = 'powderMonkeyHi';     ctx.MOB_DISPLAY.powderMonkey = 92;
      ctx.MOB_HI.saltyGull = 'saltyGullHi';           ctx.MOB_DISPLAY.saltyGull = 92;
      ctx.MOB_HI.sirenWake = 'sirenWakeHi';           ctx.MOB_DISPLAY.sirenWake = 113;
      ctx.MOB_HI.krakenArm = 'krakenArmHi';           ctx.MOB_DISPLAY.krakenArm = 126;
      ctx.MOB_HI.makoLeaper = 'makoLeaperHi';         ctx.MOB_DISPLAY.makoLeaper = 118;
      ctx.MOB_HI.drunkenSwab = 'drunkenSwabHi';       ctx.MOB_DISPLAY.drunkenSwab = 109;
      ctx.MOB_HI.harpooner = 'harpoonerHi';           ctx.MOB_DISPLAY.harpooner = 113;
      ctx.MOB_HI.inkpotOcto = 'inkpotOctoHi';         ctx.MOB_DISPLAY.inkpotOcto = 109;
      // M7k AUDIT fix: pxRum is a 64px decor canvas — mobModel assumes 48px
      ctx.MOB_HI.deckKeg = 'deckKegHi';               ctx.MOB_DISPLAY.deckKeg = 88;
      // ---- boss + his FX sprites (ghost teal EXCLUSIVE here) ----
      ctx.spr('captainkrakenHi', 96, 96, drawCaptainKraken);
      ctx.BOSS_HI.captainkraken = { key: 'captainkrakenHi', size: 96, display: 120, bodyW: 42, bodyH: 46 };
      ctx.spr('pxColossalTentacle', 96, 96, drawColossalTentacle);
      ctx.spr('pxGhostShip', 160, 160, drawGhostShip);
      // ---- decor (ALL 20) ----
      ctx.spr('pxWheel', 64, 64, drawWheel);
      ctx.spr('pxMast', 64, 64, drawMainmast);
      ctx.spr('pxCannons', 64, 64, drawCannonRow);
      ctx.spr('pxHatch', 64, 64, drawCargoHatch);
      ctx.spr('pxNest', 64, 64, drawCrowsNest);
      ctx.spr('pxRowboat', 64, 64, drawRowboat);
      ctx.spr('pxChest', 64, 64, drawTreasureChest);
      ctx.spr('pxRum', 64, 64, drawRumBarrels);
      ctx.spr('pxGalley', 64, 64, drawGalleyStove);
      ctx.spr('pxCharts', 64, 64, drawChartTable);
      ctx.spr('pxRail', 64, 64, drawShipRail);
      ctx.spr('pxFigurehead', 64, 64, drawFigurehead);
      ctx.spr('pxCapstan', 64, 64, drawCapstan);
      ctx.spr('pxRigging', 64, 64, drawRiggingWall);
      ctx.spr('pxLantern', 64, 64, drawDeckLantern);
      ctx.spr('pxNets', 64, 64, drawNetsCrates);
      ctx.spr('pxPlank', 64, 64, drawThePlank);
      ctx.spr('pxSail', 64, 64, drawTatteredSail);
      ctx.spr('pxParrot', 64, 64, drawParrotPerch);
      ctx.spr('pxHammocks', 64, 64, drawHammocks);
      // ---- tiles ----
      ctx.tex('pxdeck', 48, 48, drawMainDeck);
      ctx.tex('pxquarter', 48, 48, drawQuarterdeck);
      ctx.tex('pxgrate', 48, 48, drawCargoGrate);
      ctx.tex('pxsand', 48, 48, drawCoveSand);
      ctx.tex('pxsea', 48, 48, drawShallows);
      ctx.tex('pxstorm', 48, 48, drawStormDeck);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PIR_ART;
  root.PIRATE_ART = PIR_ART;
})(typeof window !== 'undefined' ? window : this);
