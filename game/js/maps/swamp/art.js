// ============================================================================
// game/js/maps/swamp/art.js — WITCH'S SWAMP (realm 12) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 4 5 6 8 11 13
// 14 17 19 20, THE BREWMISTRESS (render_swamp_boss_final.js — #4: brew-
// stained robes, crooked point hat, iron ladle staff, toad familiar), the
// HEX TOTEM mechanic object, 9 decor + the croc-skull landmark, tiles #1 2
// 3 5 6 8 9 10. Bayou-witch mood: black water, wisp light, brew green —
// spooky but ALIVE (frogs, fireflies), not dead-grey.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- swamp palette (swamp_kit.js S, verbatim) -----------------------------
  var S = {
    OUT: '#0a0e08',
    bog: '#4a5e38', bogLt: '#6e8452', bogDk: '#2c3a20', bogDkk: '#182210',
    murk: '#2a3e30', murkLt: '#3e5a46', murkDk: '#16241c',
    witch: '#7a4aa0', witchLt: '#b088d8', witchDk: '#44245e', witchDkk: '#2a1440',
    brew: '#9ee83f', brewLt: '#d8ffa0', brewDk: '#5a9e18',
    wisp: '#7fe8d8', wispLt: '#d8fff4', wispDk: '#3a9e8c',
    mud: '#5a4632', mudLt: '#7e6448', mudDk: '#3a2c1c',
    wood: '#6e5438', woodLt: '#94744e', woodDk: '#44301c', woodDkk: '#281a0e',
    bone: '#e0d8c0', boneDk: '#a89e80',
    blood: '#a02830', rot: '#8a9e4a',
    oil: '#060a06', white: '#f4f4f4'
  };

  // ---- shared helpers (swamp_kit lineage — ES6 kept) ------------------------
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
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, () => S.oil); }
  function reeds(put, cx, baseY, n, h) {
    for (let i = 0; i < n; i++) {
      const x = cx + (i - n / 2) * 3.2, lean = (i % 3 - 1) * 0.12;
      for (let y = 0; y < h * (0.7 + (i % 4) * 0.1); y++) put(Math.round(x + lean * y), Math.round(baseY - y), i % 2 ? S.bogLt : S.bog);
      if (i % 2 === 0) { const ty = baseY - h * (0.7 + (i % 4) * 0.1); ell(put, x + lean * (baseY - ty), ty - 3, 2, 4.4, (tx, tty) => mix(S.mudLt, S.mudDk, tty)); }
    }
  }
  function mossDrape(put, x1, y1, x2, y2, n) {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = lerp(x1, x2, t), y0 = lerp(y1, y2, t);
      const len = 8 + ((i * 7) % 12);
      for (let d = 0; d < len; d++) put(Math.round(x + Math.sin(d * 0.4 + i) * 1.4), Math.round(y0 + d), d % 3 ? S.bog : S.rot);
    }
  }
  function rune(put, x, y, c) { put(x, y, c); put(x - 2, y - 2, c); put(x + 2, y - 2, c); put(x, y - 4, c); put(x - 1, y + 2, c); put(x + 1, y + 2, c); }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ================= MOBS (#1 2 4 5 6 8 11 13 14 17 19 20) =================
  function drawBogling(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.2);
    ell(put, cx, Sz * 0.6, Sz * 0.13, Sz * 0.15, (tx, ty) => mix(S.mudLt, S.mudDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
    [[-0.1, 0.72], [0.02, 0.76], [0.11, 0.7]].forEach(([dx, dy]) => stroke(put, cx + dx * Sz, Sz * dy, cx + dx * Sz, Sz * (dy + 0.06), 2.4, () => S.mud));
    [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.14, Sz * 0.58, Sz * 0.045, Sz * 0.06, (tx, ty) => mix(S.mud, S.mudDk, tx + ty * 0.3)));
    ell(put, cx, Sz * 0.46, Sz * 0.1, Sz * 0.045, (tx, ty) => mix(S.bogLt, S.bogDk, tx + ty * 0.4));
    optic(put, cx - Sz * 0.045, Sz * 0.54, Sz * 0.016, S.oil, S.oil, S.brew);
    optic(put, cx + Sz * 0.045, Sz * 0.54, Sz * 0.016, S.oil, S.oil, S.brew);
    for (let t = -1; t <= 1; t += 0.14) put(Math.round(cx + t * Sz * 0.05), Math.round(Sz * 0.63 + (1 - t * t) * 2), S.oil);
  }
  function drawLeech(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.26);
    for (let t = 0; t <= 1; t += 0.02) {
      const x = cx + (t - 0.5) * Sz * 0.5;
      const y = Sz * 0.62 - Math.sin(t * Math.PI) * Sz * 0.22;
      const r = Sz * (0.05 + Math.sin(t * Math.PI) * 0.035);
      ell(put, x, y, r, r * 0.85, (tx, ty) => {
        let b = mix('#5a3a4e', '#2e1c28', clamp(tx * 0.8 + ty * 0.6, 0, 1));
        if (Math.abs((t * 12) % 1) < 0.14) b = mix(b, '#000', 0.35);
        return b;
      });
    }
    ell(put, cx + Sz * 0.25, Sz * 0.6, Sz * 0.05, Sz * 0.05, (tx, ty) => mix(S.blood, '#4e0a12', clamp((Math.abs(tx - 0.5) + Math.abs(ty - 0.5)) * 2, 0, 1)));
    ell(put, cx + Sz * 0.25, Sz * 0.6, Sz * 0.02, Sz * 0.02, () => S.oil);
    put(Math.round(cx + Sz * 0.19), Math.round(Sz * 0.52), S.brew);
    put(Math.round(cx + Sz * 0.23), Math.round(Sz * 0.5), S.brew);
    put(Math.round(cx - Sz * 0.1), Math.round(Sz * 0.68), S.brewLt);
  }
  function drawSkeeters(put, Sz) {
    const cx = Sz * 0.5, cy = Sz * 0.48;
    shadow(put, Sz, cx, Sz * 0.2);
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, r = Sz * (0.06 + (i % 5) * 0.035);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.75;
      put(Math.round(x), Math.round(y), S.oil); put(Math.round(x + 1), Math.round(y), S.oil);
      put(Math.round(x - 1), Math.round(y - 1), S.wispLt); put(Math.round(x + 2), Math.round(y - 1), S.wispLt);
      if (i % 3 === 0) put(Math.round(x + 2), Math.round(y + 1), S.blood);
    }
    ell(put, cx, cy, Sz * 0.05, Sz * 0.035, (tx, ty) => mix('#4a4438', S.oil, tx + ty * 0.3));
    [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.05, cy - Sz * 0.03, Sz * 0.04, Sz * 0.018, () => S.wispLt));
    stroke(put, cx + Sz * 0.04, cy + Sz * 0.01, cx + Sz * 0.1, cy + Sz * 0.03, 1, () => S.blood);
    optic(put, cx - Sz * 0.02, cy - Sz * 0.01, Sz * 0.01, S.oil, S.oil, S.blood);
  }
  function drawTurtle(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.3);
    dome(put, cx, Sz * 0.56, Sz * 0.2, Sz * 0.15, S.bogDk, S.bog, S.bogDkk);
    for (let a = 0; a < 6.283; a += 1.05) put(Math.round(cx + Math.cos(a) * Sz * 0.11), Math.round(Sz * 0.53 + Math.sin(a) * Sz * 0.07), S.bogDkk);
    ell(put, cx, Sz * 0.48, Sz * 0.05, Sz * 0.035, (tx, ty) => mix(S.rot, S.bogDk, ty));
    ell(put, cx, Sz * 0.66, Sz * 0.21, Sz * 0.045, (tx, ty) => mix(S.mudLt, S.mudDk, ty));
    stroke(put, cx + Sz * 0.18, Sz * 0.6, cx + Sz * 0.3, Sz * 0.54, Sz * 0.045, () => mix(S.bogLt, S.bogDk, 0.3));
    ell(put, cx + Sz * 0.32, Sz * 0.52, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bogLt, S.bogDk, tx * 0.5 + ty * 0.5));
    stroke(put, cx + Sz * 0.35, Sz * 0.5, cx + Sz * 0.39, Sz * 0.47, 2, () => S.boneDk);
    stroke(put, cx + Sz * 0.35, Sz * 0.53, cx + Sz * 0.39, Sz * 0.56, 2, () => S.boneDk);
    optic(put, cx + Sz * 0.31, Sz * 0.5, Sz * 0.011, S.oil, S.oil, S.brew);
    [[-0.16, 0.68], [0.08, 0.7]].forEach(([dx, dy]) => ell(put, cx + dx * Sz, Sz * dy, Sz * 0.04, Sz * 0.03, (tx, ty) => mix(S.bog, S.bogDkk, ty)));
  }
  function drawWitchling(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.2);
    for (let y = Sz * 0.42; y < Sz * 0.82; y++) {
      const t = (y - Sz * 0.42) / (Sz * 0.4), w = Sz * (0.055 + t * 0.085);
      row(put, Math.round(y), cx - w, cx + w, (tx) => mix(S.witch, S.witchDkk, clamp(tx * 1.1 + t * 0.3, 0, 1)));
    }
    row(put, Math.round(Sz * 0.6), cx - Sz * 0.08, cx + Sz * 0.08, () => S.woodLt);
    ell(put, cx, Sz * 0.36, Sz * 0.06, Sz * 0.06, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx + ty * 0.4, 0, 1)));
    optic(put, cx - Sz * 0.022, Sz * 0.355, Sz * 0.012, S.oil, S.oil, S.brew);
    optic(put, cx + Sz * 0.022, Sz * 0.355, Sz * 0.012, S.oil, S.oil, S.brew);
    for (let y = 0; y < Sz * 0.16; y++) {
      const t = y / (Sz * 0.16), w = Sz * 0.075 * (1 - t * 0.92);
      row(put, Math.round(Sz * 0.32 - y), cx - w + t * Sz * 0.03, cx + w + t * Sz * 0.03, (tx) => mix(S.witchLt, S.witchDk, tx + t * 0.3));
    }
    stroke(put, cx + Sz * 0.08, Sz * 0.5, cx + Sz * 0.16, Sz * 0.42, Sz * 0.02, () => S.witchDk);
    stroke(put, cx + Sz * 0.16, Sz * 0.42, cx + Sz * 0.2, Sz * 0.36, 1.6, () => S.woodDk);
    rune(put, Math.round(cx + Sz * 0.23), Math.round(Sz * 0.32), S.witchLt);
  }
  function drawMyconid(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.22);
    ell(put, cx, Sz * 0.62, Sz * 0.09, Sz * 0.13, (tx, ty) => mix('#c8bc9a', '#8a8064', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.1, Sz * 0.62, Sz * 0.035, Sz * 0.05, (tx, ty) => mix('#b0a582', '#7a7058', tx + ty * 0.3)));
    dome(put, cx, Sz * 0.42, Sz * 0.17, Sz * 0.1, S.witch, S.witchLt, S.witchDkk);
    [[-0.08, 0.38], [0.05, 0.35], [0.11, 0.4], [-0.02, 0.41]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.witchLt));
    for (let x = -0.13; x <= 0.13; x += 0.025) stroke(put, cx + x * Sz, Sz * 0.46, cx + x * Sz * 1.1, Sz * 0.485, 1, () => S.witchDkk);
    stroke(put, cx - Sz * 0.045, Sz * 0.55, cx - Sz * 0.015, Sz * 0.55, 1.4, () => S.oil);
    stroke(put, cx + Sz * 0.015, Sz * 0.55, cx + Sz * 0.045, Sz * 0.55, 1.4, () => S.oil);
    [[-0.2, 0.3], [0.2, 0.28], [-0.14, 0.2], [0.12, 0.16]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.witchLt));
  }
  function drawToad(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.28);
    ell(put, cx, Sz * 0.6, Sz * 0.17, Sz * 0.14, (tx, ty) => {
      let b = mix(S.bogLt, S.bogDk, clamp(tx * 0.8 + ty * 0.6, 0, 1));
      if ((tx * 9 | 0) % 3 === 0 && (ty * 7 | 0) % 2 === 0) b = mix(b, S.rot, 0.4);
      return b;
    });
    ell(put, cx, Sz * 0.66, Sz * 0.1, Sz * 0.06, (tx, ty) => mix('#d8d0a8', '#a89e78', ty));
    [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.16, Sz * 0.68, Sz * 0.055, Sz * 0.045, (tx, ty) => mix(S.bog, S.bogDkk, ty)));
    ell(put, cx, Sz * 0.44, Sz * 0.12, Sz * 0.07, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.7 + ty * 0.5, 0, 1)));
    ell(put, cx, Sz * 0.5, Sz * 0.06, Sz * 0.04, (tx, ty) => mix('#d8d0a8', '#a89e78', ty * 0.5));
    [-1, 1].forEach(s => { ell(put, cx + s * Sz * 0.08, Sz * 0.38, Sz * 0.028, Sz * 0.03, (tx, ty) => mix(S.bogLt, S.bogDk, ty)); optic(put, cx + s * Sz * 0.08, Sz * 0.38, Sz * 0.013, S.oil, S.oil, S.brew); });
    stroke(put, cx + Sz * 0.14, Sz * 0.5, cx + Sz * 0.22, Sz * 0.38, Sz * 0.02, () => S.bogDk);
    ell(put, cx + Sz * 0.24, Sz * 0.32, Sz * 0.035, Sz * 0.045, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx + ty * 0.4, 0, 1)));
    stroke(put, cx + Sz * 0.24, Sz * 0.26, cx + Sz * 0.24, Sz * 0.28, 2.4, () => S.woodLt);
    put(Math.round(cx + Sz * 0.23), Math.round(Sz * 0.3), '#ffffff');
  }
  function drawSerpent(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.3);
    for (let t = 0; t <= 1; t += 0.015) {
      const y = Sz * (0.78 - t * 0.42);
      const x = cx + Math.sin(t * 6.5) * Sz * 0.18 * (1 - t * 0.3);
      const r = Sz * (0.055 - t * 0.025);
      ell(put, x, y, r, r * 0.9, (tx, ty) => {
        let b = mix('#5a7a4a', '#2c4024', clamp(tx * 0.8 + ty * 0.5, 0, 1));
        if (Math.abs((t * 18) % 1) < 0.2) b = mix(b, '#1a2a16', 0.5);
        return b;
      });
    }
    const hx = cx + Math.sin(6.5) * Sz * 0.13, hy = Sz * 0.36;
    ell(put, hx, hy, Sz * 0.06, Sz * 0.05, (tx, ty) => mix('#6e9458', '#31481f', clamp(tx * 0.8 + ty * 0.4, 0, 1)));
    [-1, 1].forEach(s => ell(put, hx + s * Sz * 0.055, hy + Sz * 0.01, Sz * 0.025, Sz * 0.04, (tx, ty) => mix('#5a7a4a', '#2c4024', tx + ty * 0.3)));
    optic(put, hx - Sz * 0.02, hy - Sz * 0.005, Sz * 0.011, S.oil, S.oil, S.brew);
    optic(put, hx + Sz * 0.02, hy - Sz * 0.005, Sz * 0.011, S.oil, S.oil, S.brew);
    stroke(put, hx, hy + Sz * 0.04, hx, hy + Sz * 0.09, 1, () => S.blood);
    put(Math.round(hx - 1), Math.round(hy + Sz * 0.1), S.blood); put(Math.round(hx + 1), Math.round(hy + Sz * 0.1), S.blood);
  }
  function drawSprite(put, Sz) {
    const cx = Sz * 0.5, cy = Sz * 0.46;
    shadow(put, Sz, cx, Sz * 0.16);
    [-1, 1].forEach(s => { ell(put, cx + s * Sz * 0.08, cy - Sz * 0.05, Sz * 0.07, Sz * 0.025, () => S.wispLt); ell(put, cx + s * Sz * 0.07, cy - Sz * 0.005, Sz * 0.055, Sz * 0.02, () => S.wispDk); });
    ell(put, cx, cy + Sz * 0.03, Sz * 0.04, Sz * 0.07, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx + ty * 0.4, 0, 1)));
    dome(put, cx, cy - Sz * 0.06, Sz * 0.05, Sz * 0.035, S.brew, S.brewLt, S.brewDk);
    put(Math.round(cx), Math.round(cy - Sz * 0.09), '#ffffff');
    optic(put, cx - Sz * 0.015, cy - Sz * 0.025, Sz * 0.009, S.oil, S.oil, '#ffffff');
    optic(put, cx + Sz * 0.015, cy - Sz * 0.025, Sz * 0.009, S.oil, S.oil, '#ffffff');
    [[-0.14, 0.62], [0.13, 0.58], [0, 0.7]].forEach(([dx, dy]) => { put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.brewLt); put(Math.round(cx + dx * Sz), Math.round(Sz * dy - 2), S.brew); });
  }
  function drawImp(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.22);
    for (let y = Sz * 0.36; y < Sz * 0.72; y++) {
      const t = (y - Sz * 0.36) / (Sz * 0.36);
      const w = Sz * (0.11 + Math.sin(t * 3.14) * 0.035);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix(S.wispLt, S.wispDk, clamp(tx * 1.2 + t * 0.2, 0, 1));
        return mix(b, S.murkDk, 0.35);
      });
    }
    ell(put, cx, Sz * 0.36, Sz * 0.11, Sz * 0.03, (tx, ty) => mix(S.woodLt, S.woodDkk, ty));
    stroke(put, cx - Sz * 0.05, Sz * 0.44, cx - Sz * 0.02, Sz * 0.66, 1.2, () => '#ffffff');
    ell(put, cx, Sz * 0.55, Sz * 0.07, Sz * 0.08, (tx, ty) => mix(S.blood, '#5e0e16', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    [-1, 1].forEach(s => { stroke(put, cx + s * Sz * 0.03, Sz * 0.48, cx + s * Sz * 0.06, Sz * 0.44, 1.6, () => S.blood); });
    optic(put, cx - Sz * 0.025, Sz * 0.53, Sz * 0.012, S.oil, S.oil, S.brewLt);
    optic(put, cx + Sz * 0.025, Sz * 0.53, Sz * 0.012, S.oil, S.oil, S.brewLt);
    put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.58), '#d86470'); put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.58), '#d86470');
    stroke(put, cx + Sz * 0.08, Sz * 0.46, cx + Sz * 0.11, Sz * 0.52, 1, () => '#ffffff');
    plate(put, cx - Sz * 0.05, Sz * 0.6, cx + Sz * 0.05, Sz * 0.66, S.bone, '#fff', S.boneDk);
    rune(put, Math.round(cx), Math.round(Sz * 0.64), S.witchDk);
  }
  function drawMimic(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.3);
    for (let y = Sz * 0.42; y < Sz * 0.74; y++) {
      const t = (y - Sz * 0.42) / (Sz * 0.32);
      const w = Sz * (0.16 + Math.sin(t * 2.6) * 0.05);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix('#4a4e5a', '#1c1e26', clamp(tx * 1.1 + t * 0.25, 0, 1));
        if (tx < 0.2) b = mix(b, '#6e7480', 0.4);
        return b;
      });
    }
    ell(put, cx, Sz * 0.42, Sz * 0.17, Sz * 0.05, (tx, ty) => mix('#5a5e6a', '#24262e', ty));
    ell(put, cx, Sz * 0.42, Sz * 0.13, Sz * 0.035, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx * 0.8 + ty, 0, 1)));
    [[-0.06, 0.36], [0.04, 0.33], [0.1, 0.37], [0, 0.28]].forEach(([dx, dy]) => ell(put, cx + dx * Sz, Sz * dy, 2.6, 2.6, () => S.brew));
    for (let x = -0.14; x <= 0.14; x += 0.035) { for (let d = 0; d < 4; d++) row(put, Math.round(Sz * 0.47 + d), cx + x * Sz - (4 - d) * 0.5, cx + x * Sz + (4 - d) * 0.5, () => S.bone); }
    optic(put, cx - Sz * 0.04, Sz * 0.41, Sz * 0.02, '#fff', '#c8c8b0', S.oil);
    [-1, 0, 1].forEach(s => stroke(put, cx + s * Sz * 0.1, Sz * 0.74, cx + s * Sz * 0.13, Sz * 0.82, 2.6, () => '#1c1e26'));
    rune(put, Math.round(cx + Sz * 0.06), Math.round(Sz * 0.6), S.witchLt);
  }
  function drawMossback(put, Sz) {
    const cx = Sz * 0.5;
    shadow(put, Sz, cx, Sz * 0.34);
    ell(put, cx, Sz * 0.54, Sz * 0.21, Sz * 0.2, (tx, ty) => {
      let b = mix(S.bogLt, S.bogDkk, clamp(tx * 0.7 + ty * 0.6, 0, 1));
      if ((tx * 11 | 0) % 3 === 0 && (ty * 9 | 0) % 2 === 0) b = mix(b, S.rot, 0.5);
      return b;
    });
    for (let x = -0.16; x <= 0.18; x += 0.03) { const h = 4 + ((x * 100 | 0) % 5); for (let d = 0; d < h; d++) put(Math.round(cx + x * Sz), Math.round(Sz * 0.36 - d), d > h - 3 ? S.bogLt : S.bogDk); }
    stroke(put, cx + Sz * 0.1, Sz * 0.36, cx + Sz * 0.12, Sz * 0.24, 2.4, () => S.woodDk);
    ell(put, cx + Sz * 0.13, Sz * 0.2, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bog, S.bogDk, tx + ty * 0.3));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * Sz * 0.17, Sz * 0.5, cx + s * Sz * 0.29, Sz * 0.72, Sz * 0.05, (t) => mix(S.bog, S.bogDkk, t * 0.5));
      ell(put, cx + s * Sz * 0.3, Sz * 0.76, Sz * 0.065, Sz * 0.05, (tx, ty) => mix(S.bogDk, S.bogDkk, clamp(tx + ty * 0.4, 0, 1)));
    });
    ell(put, cx, Sz * 0.66, Sz * 0.1, Sz * 0.075, (tx, ty) => mix(S.bog, S.bogDkk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    optic(put, cx - Sz * 0.035, Sz * 0.65, Sz * 0.016, S.oil, S.oil, S.blood);
    stroke(put, cx + Sz * 0.02, Sz * 0.65, cx + Sz * 0.06, Sz * 0.65, 1.6, () => S.oil);
    put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.71), S.bone); put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.7), S.bone);
    put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.71), S.bone); put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.7), S.bone);
  }

  // ============ THE BREWMISTRESS — #4 (boss final) ===========================
  // swampWitch(put,Sz,o) with FINAL opts inlined: green skin, brew-stained
  // robes [brewDk, brew, bogDkk], crooked point hat, iron LADLE staff,
  // casting spark, fat toad familiar at her hem.
  function drawBrewmistress(put, Sz) {
    const sk = S.bogLt, skDk = S.bogDk;
    const rb = S.brewDk, rl = S.brew, rd = S.bogDkk;
    const cx = Sz * 0.48;
    const footY = Sz * 0.88, hipY = Sz * 0.62, shY = Sz * 0.4, headY = Sz * 0.29;
    shadow(put, Sz, Sz * 0.5, Sz * 0.32);
    // robe skirt to feet, ragged hem
    for (let y = shY; y < footY; y++) {
      const t = (y - shY) / (footY - shY);
      const w = Sz * (0.055 + t * 0.11);
      const wob = Math.sin(t * 9) * Sz * 0.008;
      row(put, Math.round(y), cx - w + wob, cx + w + wob, (tx) => {
        let b = mix(rl, rb, clamp(tx * 1.3, 0, 1));
        if (tx > 0.72) b = mix(b, rd, 0.6);
        if (t > 0.85 && Math.abs(Math.sin(tx * 20)) > 0.75) b = mix(b, rd, 0.7);
        return b;
      });
    }
    // rope belt + bone charm + shawl
    row(put, Math.round(hipY), cx - Sz * 0.085, cx + Sz * 0.085, () => S.woodLt);
    put(Math.round(cx), Math.round(hipY + 3), S.bone);
    ell(put, cx, shY + Sz * 0.02, Sz * 0.1, Sz * 0.04, (tx, ty) => mix(rd, rb, clamp(tx * 0.8 + ty, 0, 1)));
    // arms — right holds the ladle, left raised casting
    const armW = Sz * 0.02;
    const rx = cx + Sz * 0.17, ry = shY + Sz * 0.1;
    stroke(put, cx + Sz * 0.08, shY + Sz * 0.04, rx, ry, armW, (t) => mix(rb, rd, t * 0.5));
    ell(put, rx, ry, Sz * 0.018, Sz * 0.018, () => sk);
    const lx = cx - Sz * 0.16, ly = shY - Sz * 0.02;
    stroke(put, cx - Sz * 0.08, shY + Sz * 0.04, lx, ly, armW, (t) => mix(rb, rd, t * 0.5));
    ell(put, lx, ly, Sz * 0.018, Sz * 0.018, () => sk);
    rune(put, Math.round(lx - Sz * 0.02), Math.round(ly - Sz * 0.06), S.witchLt);
    // iron LADLE staff
    stroke(put, rx, ry, rx + Sz * 0.04, ry - Sz * 0.26, 2.4, () => S.woodDk);
    ell(put, rx + Sz * 0.05, ry - Sz * 0.29, Sz * 0.035, Sz * 0.025, (tx, ty) => mix('#5a5e6a', '#24262e', tx + ty * 0.3));
    ell(put, rx + Sz * 0.05, ry - Sz * 0.295, Sz * 0.022, Sz * 0.012, () => S.brew);
    // head — long nose, wart, crooked grin, brew-glow eyes
    const hr = Sz * 0.055;
    ell(put, cx, headY, hr, hr * 1.1, (tx, ty) => mix(sk, skDk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    stroke(put, cx + Sz * 0.02, headY + Sz * 0.005, cx + Sz * 0.055, headY + Sz * 0.025, 2, () => sk);
    put(Math.round(cx + Sz * 0.058), Math.round(headY + Sz * 0.03), skDk);
    put(Math.round(cx + Sz * 0.03), Math.round(headY + Sz * 0.035), skDk);
    optic(put, cx - Sz * 0.02, headY - Sz * 0.005, Sz * 0.012, S.oil, S.oil, S.brew);
    optic(put, cx + Sz * 0.022, headY - Sz * 0.005, Sz * 0.011, S.oil, S.oil, S.brew);
    for (let t = -1; t <= 1; t += 0.15) put(Math.round(cx + t * Sz * 0.03), Math.round(headY + Sz * 0.05 + (1 - t * t) * 1.4), S.oil);
    put(Math.round(cx - Sz * 0.012), Math.round(headY + Sz * 0.055), S.bone);
    // straggly grey hair
    [-1, 1].forEach(s => {
      for (let i = 0; i < 3; i++) {
        const x0 = cx + s * (hr - 1) + s * i;
        for (let d = 0; d < Sz * (0.1 + i * 0.03); d++) put(Math.round(x0 + Math.sin(d * 0.3 + i) * 1.6), Math.round(headY + d), i % 2 ? '#8a8e9a' : '#5a5e68');
      }
    });
    // crooked point hat
    ell(put, cx, headY - hr + Sz * 0.005, Sz * 0.11, Sz * 0.022, (tx, ty) => mix(rd, S.oil, clamp(tx * 0.8, 0, 1)));
    for (let y = 0; y < Sz * 0.17; y++) {
      const t = y / (Sz * 0.17), w = Sz * 0.062 * (1 - t * 0.9);
      const bend = Math.sin(t * 2.4) * Sz * 0.035;
      row(put, Math.round(headY - hr - y), cx - w + bend, cx + w + bend, (tx) => mix(rb, rd, clamp(tx * 1.2 + t * 0.2, 0, 1)));
    }
    row(put, Math.round(headY - hr - Sz * 0.01), cx - Sz * 0.055, cx + Sz * 0.055, () => S.woodLt);
    put(Math.round(cx + Sz * 0.055), Math.round(headY - hr - Sz * 0.165), rl);
    // the fat toad familiar at her hem
    ell(put, cx + Sz * 0.24, Sz * 0.84, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    optic(put, cx + Sz * 0.22, Sz * 0.82, Sz * 0.009, S.oil, S.oil, S.brew);
    optic(put, cx + Sz * 0.26, Sz * 0.82, Sz * 0.009, S.oil, S.oil, S.brew);
    // ambient wisp motes
    put(Math.round(Sz * 0.18), Math.round(Sz * 0.3), S.wispDk);
    put(Math.round(Sz * 0.82), Math.round(Sz * 0.5), S.brewDk);
  }

  // ---- HEX TOTEM (the mechanic object) --------------------------------------
  function drawHexTotem(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.22);
    const cx = Sz * 0.5;
    [[0.72, 'grim'], [0.58, 'moon'], [0.44, 'eye']].forEach(([yy, kind]) => {
      plate(put, cx - Sz * 0.1, Sz * (yy - 0.07), cx + Sz * 0.1, Sz * (yy + 0.07), S.wood, S.woodLt, S.woodDkk);
      if (kind === 'grim') { optic(put, cx - Sz * 0.04, Sz * (yy - 0.02), Sz * 0.014, S.oil, S.oil, S.witchLt); optic(put, cx + Sz * 0.04, Sz * (yy - 0.02), Sz * 0.014, S.oil, S.oil, S.witchLt); for (let t = -1; t <= 1; t += 0.25) put(Math.round(cx + t * Sz * 0.04), Math.round(Sz * (yy + 0.035)), S.oil); }
      if (kind === 'moon') for (let a = -1.2; a < 1.2; a += 0.08) put(Math.round(cx + Math.cos(a + 1.57) * Sz * 0.04), Math.round(Sz * yy + Math.sin(a + 1.57) * Sz * 0.04), S.wispLt);
      if (kind === 'eye') { ell(put, cx, Sz * yy, Sz * 0.045, Sz * 0.028, (tx, ty) => mix(S.bone, S.boneDk, ty)); optic(put, cx, Sz * yy, Sz * 0.014, S.oil, S.oil, S.witchLt); }
    });
    ell(put, cx, Sz * 0.32, Sz * 0.06, Sz * 0.05, (tx, ty) => mix(S.bone, S.boneDk, tx + ty * 0.3));
    [[-0.035, 0], [0.035, 0]].forEach(([dx]) => put(Math.round(cx + dx * Sz), Math.round(Sz * 0.315), S.oil));
    [-1, 1].forEach(s => { stroke(put, cx + s * Sz * 0.06, Sz * 0.3, cx + s * Sz * 0.13, Sz * 0.2, 1.6, () => S.witchDk); put(Math.round(cx + s * Sz * 0.13), Math.round(Sz * 0.19), S.witchLt); });
    rune(put, Math.round(cx), Math.round(Sz * 0.88), S.witchLt);
  }

  // ============================= DECOR (10) ==================================
  function drawHut(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.36);
    [[0.3, 0], [0.44, 0.02], [0.58, 0.01], [0.72, 0]].forEach(([x, o]) => stroke(put, Sz * (x + o), Sz * 0.62, Sz * x, Sz * 0.9, 3, () => S.woodDkk));
    for (let y = Sz * 0.38; y < Sz * 0.64; y++) {
      const t = (y - Sz * 0.38) / (Sz * 0.26);
      const lean = t * Sz * 0.02;
      row(put, Math.round(y), Sz * 0.26 + lean, Sz * 0.74 + lean, (tx) => {
        let b = mix(S.wood, S.woodDkk, clamp(tx * 0.8 + t * 0.3, 0, 1));
        if ((tx * 12 | 0) % 3 === 0) b = mix(b, S.woodDk, 0.6);
        return b;
      });
    }
    for (let y = 0; y < Sz * 0.16; y++) {
      const t = y / (Sz * 0.16), w = Sz * (0.3 - t * 0.24);
      row(put, Math.round(Sz * 0.38 - y), Sz * 0.5 - w - t * Sz * 0.04, Sz * 0.5 + w, (tx) => mix(S.bogDk, S.bogDkk, tx * 0.6 + t * 0.3));
    }
    plate(put, Sz * 0.42, Sz * 0.46, Sz * 0.52, Sz * 0.55, S.brewDk, S.brewLt, S.woodDkk);
    stroke(put, Sz * 0.47, Sz * 0.46, Sz * 0.47, Sz * 0.55, 1, () => S.woodDkk);
    plate(put, Sz * 0.6, Sz * 0.48, Sz * 0.68, Sz * 0.64, S.woodDkk, S.woodDk, S.oil);
    stroke(put, Sz * 0.62, Sz * 0.26, Sz * 0.62, Sz * 0.34, 3, () => '#4a4e5a');
    [[0.63, 0.2], [0.66, 0.14], [0.64, 0.08]].forEach(([x, y]) => put(Math.round(Sz * x), Math.round(Sz * y), S.wispDk));
    mossDrape(put, Sz * 0.26, Sz * 0.4, Sz * 0.4, Sz * 0.38, 4);
  }
  function drawBigCauldron(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.32);
    [[-0.14, 0.05], [0.1, 0.03], [-0.02, 0.07]].forEach(([dx, o]) => stroke(put, Sz * (0.5 + dx - 0.08), Sz * (0.82 + o), Sz * (0.5 + dx + 0.08), Sz * (0.8 + o), 3, () => S.woodDk));
    [[-0.06, 0.78], [0.04, 0.79], [0, 0.75]].forEach(([dx, dy]) => put(Math.round(Sz * (0.5 + dx)), Math.round(Sz * dy), '#ff9a3f'));
    for (let y = Sz * 0.4; y < Sz * 0.74; y++) {
      const t = (y - Sz * 0.4) / (Sz * 0.34);
      const w = Sz * (0.2 + Math.sin(t * 2.6) * 0.06);
      row(put, Math.round(y), Sz * 0.5 - w, Sz * 0.5 + w, (tx) => mix('#4a4e5a', '#16181e', clamp(tx * 1.1 + t * 0.25, 0, 1)));
    }
    ell(put, Sz * 0.5, Sz * 0.4, Sz * 0.21, Sz * 0.055, (tx, ty) => mix('#5a5e6a', '#24262e', ty));
    ell(put, Sz * 0.5, Sz * 0.4, Sz * 0.17, Sz * 0.04, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx * 0.8 + ty, 0, 1)));
    [[-0.08, 0.32], [0.05, 0.28], [0.11, 0.34], [-0.02, 0.22], [0.02, 0.15]].forEach(([dx, dy]) => ell(put, Sz * (0.5 + dx), Sz * dy, 2.6, 2.6, () => S.brew));
    stroke(put, Sz * 0.68, Sz * 0.38, Sz * 0.74, Sz * 0.28, 2, () => S.woodLt);
    ell(put, Sz * 0.75, Sz * 0.26, Sz * 0.025, Sz * 0.02, () => S.woodDk);
  }
  function drawSnag(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.26);
    const cx = Sz * 0.5;
    for (let y = Sz * 0.34; y < Sz * 0.88; y++) {
      const t = (y - Sz * 0.34) / (Sz * 0.54), w = Sz * (0.03 + t * 0.05);
      row(put, Math.round(y), cx - w, cx + w, (tx) => mix('#6a5a4a', '#2e241a', clamp(tx * 1.2 + t * 0.1, 0, 1)));
    }
    [[-0.25, 0.2, -0.1], [0.22, 0.16, 0.06], [-0.12, 0.1, -0.04], [0.3, 0.32, 0.18]].forEach(([tx2, ty2, mx]) => {
      for (let t = 0; t <= 1; t += 0.04) {
        const x = cx + lerp(0, tx2 * Sz, t) + Math.sin(t * 3) * mx * Sz;
        const y = Sz * 0.4 - t * (Sz * 0.4 - ty2 * Sz);
        stroke(put, x, y, x, y, Math.max(1, 3 * (1 - t)), () => mix('#5a4a3a', '#241c12', t * 0.7));
      }
    });
    ell(put, cx + Sz * 0.21, Sz * 0.14, Sz * 0.03, Sz * 0.025, () => S.oil);
    put(Math.round(cx + Sz * 0.245), Math.round(Sz * 0.135), S.oil);
  }
  function drawLilies(put, Sz) {
    ell(put, Sz * 0.5, Sz * 0.6, Sz * 0.38, Sz * 0.22, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
    [[0.36, 0.54, 0.1], [0.6, 0.5, 0.085], [0.52, 0.68, 0.11], [0.7, 0.66, 0.07], [0.3, 0.7, 0.06]].forEach(([x, y, r]) => {
      ell(put, Sz * x, Sz * y, Sz * r, Sz * r * 0.55, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
      stroke(put, Sz * x, Sz * y, Sz * (x + r * 0.9), Sz * y, 1.4, () => S.murkDk);
    });
    [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, -0.7]].forEach(([dx, dy]) => ell(put, Sz * 0.52 + dx * 4, Sz * 0.66 + dy * 3, 3, 2.4, () => '#e8c8e0'));
    put(Math.round(Sz * 0.52), Math.round(Sz * 0.66), '#ffd23f');
    put(Math.round(Sz * 0.38), Math.round(Sz * 0.52), S.brew); put(Math.round(Sz * 0.41), Math.round(Sz * 0.52), S.brew);
  }
  function drawReedsProp(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.24);
    ell(put, Sz * 0.5, Sz * 0.84, Sz * 0.2, Sz * 0.05, (tx, ty) => mix(S.mud, S.mudDk, ty));
    reeds(put, Sz * 0.5, Sz * 0.84, 9, Sz * 0.5);
    put(Math.round(Sz * 0.7), Math.round(Sz * 0.3), S.wisp); put(Math.round(Sz * 0.72), Math.round(Sz * 0.3), S.wisp);
    put(Math.round(Sz * 0.69), Math.round(Sz * 0.29), S.wispLt); put(Math.round(Sz * 0.73), Math.round(Sz * 0.29), S.wispLt);
  }
  function drawLog(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.32);
    for (let t = 0; t <= 1; t += 0.01) {
      const x = Sz * (0.15 + t * 0.7), y = Sz * (0.62 - t * 0.08);
      ell(put, x, y, Sz * 0.09, Sz * 0.08, (tx, ty) => {
        let b = mix(S.woodLt, S.woodDkk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
        if (Math.abs(Math.sin(t * 30)) > 0.92) b = mix(b, S.woodDkk, 0.4);
        return b;
      });
    }
    ell(put, Sz * 0.85, Sz * 0.54, Sz * 0.075, Sz * 0.07, (tx, ty) => mix(S.woodDk, S.oil, clamp((1 - Math.hypot(tx - 0.5, ty - 0.5) * 2) + 0.4, 0, 1)));
    put(Math.round(Sz * 0.84), Math.round(Sz * 0.53), S.brew); put(Math.round(Sz * 0.87), Math.round(Sz * 0.53), S.brew);
    [[0.3, 0.52], [0.42, 0.5], [0.55, 0.48]].forEach(([x, y]) => { ell(put, Sz * x, Sz * y, Sz * 0.035, Sz * 0.015, (tx, ty) => mix(S.rot, S.bogDk, ty)); });
    mossDrape(put, Sz * 0.2, Sz * 0.6, Sz * 0.5, Sz * 0.56, 4);
  }
  function drawRing(put, Sz) {
    ell(put, Sz * 0.5, Sz * 0.6, Sz * 0.34, Sz * 0.18, (tx, ty) => mix(S.bogDk, S.bogDkk, clamp(tx * 0.5 + ty * 0.7, 0, 1)));
    for (let a = 0; a < 6.283; a += 0.08) put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.26), Math.round(Sz * 0.6 + Math.sin(a) * Sz * 0.13), S.witchDk);
    for (let a = 0; a < 6.283; a += 0.7) {
      const x = Sz * 0.5 + Math.cos(a) * Sz * 0.28, y = Sz * 0.6 + Math.sin(a) * Sz * 0.145;
      stroke(put, x, y, x, y - Sz * 0.035, 2, () => S.bone);
      dome(put, x, y - Sz * 0.04, Sz * 0.03, Sz * 0.02, S.witch, S.witchLt, S.witchDkk);
      put(Math.round(x), Math.round(y - Sz * 0.05), S.witchLt);
    }
    [[0, 0.55], [-0.05, 0.62], [0.06, 0.6]].forEach(([dx, dy]) => put(Math.round(Sz * (0.5 + dx)), Math.round(Sz * dy), S.witchLt));
  }
  function drawBush(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.26);
    [[0, 0.6, 0.18, 0.14], [-0.14, 0.66, 0.12, 0.1], [0.14, 0.64, 0.13, 0.1], [0, 0.48, 0.13, 0.09]].forEach(([dx, dy, rx, ry]) =>
      ell(put, Sz * (0.5 + dx), Sz * dy, Sz * rx, Sz * ry, (tx, ty) => mix(S.bog, S.bogDkk, clamp(tx * 0.8 + ty * 0.6, 0, 1))));
    [[0.42, 0.52], [0.58, 0.58], [0.5, 0.66], [0.34, 0.62], [0.66, 0.5], [0.28, 0.42], [0.72, 0.38], [0.5, 0.3]].forEach(([x, y], i) => {
      put(Math.round(Sz * x), Math.round(Sz * y), i % 2 ? S.brewLt : '#ffd23f');
      if (i > 4) put(Math.round(Sz * x + 1), Math.round(Sz * y + 1), S.brewDk);
    });
  }
  function drawCrocSkull(put, Sz) {
    shadow(put, Sz, Sz * 0.5, Sz * 0.34);
    for (let t = 0; t <= 1; t += 0.015) {
      const x = Sz * (0.2 + t * 0.62), y = Sz * (0.5 - Math.sin(t * 2.4) * 0.06);
      ell(put, x, y, Sz * (0.05 + (1 - t) * 0.05), Sz * 0.045, (tx, ty) => mix(S.bone, S.boneDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    }
    ell(put, Sz * 0.34, Sz * 0.46, Sz * 0.035, Sz * 0.03, () => S.oil);
    for (let t = 0; t <= 1; t += 0.02) {
      const x = Sz * (0.24 + t * 0.56), y = Sz * (0.66 + Math.sin(t * 1.8) * 0.05);
      ell(put, x, y, Sz * (0.035 + (1 - t) * 0.03), Sz * 0.03, (tx, ty) => mix(S.boneDk, mix(S.boneDk, '#000', 0.3), tx + ty * 0.3));
    }
    for (let i = 0; i < 6; i++) { put(Math.round(Sz * (0.4 + i * 0.07)), Math.round(Sz * (0.545 - i * 0.004)), S.bone); put(Math.round(Sz * (0.4 + i * 0.07)), Math.round(Sz * (0.555 - i * 0.004)), S.bone); }
    for (let i = 0; i < 5; i++) { put(Math.round(Sz * (0.42 + i * 0.08)), Math.round(Sz * (0.63 + i * 0.006)), S.bone); }
    ell(put, Sz * 0.5, Sz * 0.78, Sz * 0.3, Sz * 0.06, (tx, ty) => mix(S.mud, S.mudDk, ty));
    stroke(put, Sz * 0.62, Sz * 0.76, Sz * 0.63, Sz * 0.68, 1.4, () => S.bogLt);
  }
  function drawCircle(put, Sz) {
    ell(put, Sz * 0.5, Sz * 0.58, Sz * 0.36, Sz * 0.2, (tx, ty) => mix(S.mudDk, S.bogDkk, clamp(tx * 0.5 + ty * 0.7, 0, 1)));
    for (let a = 0; a < 6.283; a += 0.04) {
      put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.3), Math.round(Sz * 0.58 + Math.sin(a) * Sz * 0.16), S.witchLt);
      put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.24), Math.round(Sz * 0.58 + Math.sin(a) * Sz * 0.128), S.witchDk);
    }
    const P5 = [];
    for (let i = 0; i < 5; i++) { const a = -1.57 + i * 1.257; P5.push([Sz * 0.5 + Math.cos(a) * Sz * 0.24, Sz * 0.58 + Math.sin(a) * Sz * 0.128]); }
    for (let i = 0; i < 5; i++) { const [x1, y1] = P5[i], [x2, y2] = P5[(i + 2) % 5]; stroke(put, x1, y1, x2, y2, 1.4, () => S.witch); }
    P5.forEach(([x, y]) => { put(Math.round(x), Math.round(y - 2), '#ffd23f'); stroke(put, x, y, x, y - 1, 2, () => S.bone); });
    rune(put, Math.round(Sz * 0.5), Math.round(Sz * 0.58), S.witchLt);
  }

  // ============================== TILES (8) ==================================
  function tileFn(fn) { return function (put, Sz) { for (let y = 0; y < Sz; y++) for (let x = 0; x < Sz; x++) { const c = fn(x, y); if (c) put(x, y, c); } }; }
  const tMoss = tileFn((x, y) => {
    const n = h2(x >> 1, y >> 1, 1), m = h2((x >> 3) + 5, y >> 3, 2);
    let b = mix(mix(S.bog, S.bogDk, n), S.bogDkk, m > 0.65 ? 0.6 : 0.1);
    if (h2(x + 4, y, 3) > 0.985) b = S.bogLt;
    if (h2(x, y + 8, 4) > 0.993) b = S.rot;
    return b;
  });
  const tMurk = tileFn((x, y) => {
    const w = Math.sin(x / 14 + Math.sin(y / 10) * 2) + Math.sin(y / 17);
    let b = mix(S.murk, S.murkDk, clamp(w * 0.35 + 0.5, 0, 1));
    if (w > 1.5) b = mix(b, S.murkLt, 0.7);
    if (h2(x, y, 5) > 0.996) b = S.wispDk;
    return b;
  });
  const tMud = tileFn((x, y) => {
    let b = mix(S.mud, S.mudDk, h2(x >> 2, y >> 2, 6) * 0.85);
    if (Math.sin(x / 8 + Math.sin(y / 15) * 3) > 0.88) b = mix(b, S.mudDk, 0.6);
    if (h2(x + 7, y + 2, 7) > 0.985) b = S.mudLt;
    return b;
  });
  const tPlanks = tileFn((x, y) => {
    const py = (y / 12) | 0, off = (py % 2) * 24;
    const ex = (x + off) % 48;
    let b = mix(S.wood, S.woodDk, h2(py * 5 + ((x + off) / 48 | 0), py, 8) * 0.75);
    b = mix(b, S.woodDkk, Math.abs(Math.sin(x * 0.5 + py * 2)) * 0.15);
    if (y % 12 < 1.4 || ex < 1.4) b = S.woodDkk;
    if (h2(x, y, 9) > 0.992) b = S.rot;
    return b;
  });
  const tLily = (function () {
    const base = tMurk;
    return function (put, Sz) {
      base(put, Sz);
      for (let i = 0; i < 5; i++) {
        const cx = Math.floor(h2(i, 3, 10) * Sz), cy = Math.floor(h2(i, 9, 11) * Sz);
        const r = 5 + (i % 3) * 3;
        for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
          if (xx * xx / (r * r) + yy * yy / (r * r * 0.36) <= 1) {
            const tx = (xx + r) / (2 * r);
            put((cx + xx + Sz) % Sz, (cy + yy + Sz) % Sz, mix(S.bogLt, S.bogDk, clamp(tx + h2(xx, yy, 12) * 0.3, 0, 1)));
          }
        }
        put(cx, cy, i % 2 ? '#e8c8e0' : S.bogDkk);
      }
    };
  })();
  const tAlgae = tileFn((x, y) => {
    const w = Math.sin(x / 14 + Math.sin(y / 10) * 2) + Math.sin(y / 17);
    let b = mix(S.murk, S.murkDk, clamp(w * 0.35 + 0.5, 0, 1));
    const sw = Math.abs(Math.sin(x / 19 + Math.sin(y / 12) * 3.2 + 1));
    if (sw > 0.9) b = mix(b, S.brew, 0.55 + h2(x, y, 13) * 0.3);
    else if (sw > 0.84) b = mix(b, S.brewDk, 0.4);
    if (h2(x + 2, y, 14) > 0.994) b = S.brewLt;
    return b;
  });
  const tRitual = (function () {
    return function (put, Sz) {
      for (let y = 0; y < Sz; y++) for (let x = 0; x < Sz; x++) {
        let b = mix('#4a3a34', '#2a201c', h2(x >> 2, y >> 2, 15) * 0.8);
        if (h2(x + 5, y + 5, 16) > 0.988) b = '#6a564e';
        put(x, y, b);
      }
      for (let i = 0; i < 3; i++) {
        const gx = Math.floor(h2(i, 21, 17) * (Sz - 12)) + 6, gy = Math.floor(h2(i, 27, 18) * (Sz - 12)) + 6;
        rune(put, gx, gy, i % 2 ? S.witchDk : S.witch);
      }
    };
  })();
  const tSeep = (function () {
    const base = tMud;
    return function (put, Sz) {
      base(put, Sz);
      for (let y = 0; y < Sz; y++) for (let x = 0; x < Sz; x++) {
        const p = Math.sin(x / 21 + Math.sin(y / 13) * 2.6) + Math.sin(y / 23 + 1);
        if (p > 1.15) {
          let b = mix(S.brew, S.brewDk, clamp((p - 1.15) * 1.4 + h2(x, y, 19) * 0.3, 0, 1));
          if (h2(x + 1, y + 1, 20) > 0.98) b = S.brewLt;
          put(x, y, b);
        } else if (p > 1.0) put(x, y, mix(S.mudDk, S.brewDk, 0.5));
      }
    };
  })();

  // ======================= REGISTRY buildArt hook ===========================
  var SW_ART = {
    S: S,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (12) ----
      ctx.spr('boglingHi', MS, MS, drawBogling);
      ctx.spr('giantLeechHi', MS, MS, drawLeech);
      ctx.spr('skeeterCloudHi', MS, MS, drawSkeeters);
      ctx.spr('snapjawTurtleHi', MS, MS, drawTurtle);
      ctx.spr('witchlingHi', MS, MS, drawWitchling);
      ctx.spr('sporecapMyconidHi', MS, MS, drawMyconid);
      ctx.spr('toadAlchemistHi', MS, MS, drawToad);
      ctx.spr('mireSerpentHi', MS, MS, drawSerpent);
      ctx.spr('glowcapSpriteHi', MS, MS, drawSprite);
      ctx.spr('bottledImpHi', MS, MS, drawImp);
      ctx.spr('cauldronMimicHi', MS, MS, drawMimic);
      ctx.spr('mossbackHi', MS, MS, drawMossback);
      ctx.MOB_HI.bogling = 'boglingHi';                 ctx.MOB_DISPLAY.bogling = 42;
      ctx.MOB_HI.giantLeech = 'giantLeechHi';           ctx.MOB_DISPLAY.giantLeech = 48;
      ctx.MOB_HI.skeeterCloud = 'skeeterCloudHi';       ctx.MOB_DISPLAY.skeeterCloud = 50;
      ctx.MOB_HI.snapjawTurtle = 'snapjawTurtleHi';     ctx.MOB_DISPLAY.snapjawTurtle = 54;
      ctx.MOB_HI.witchling = 'witchlingHi';             ctx.MOB_DISPLAY.witchling = 48;
      ctx.MOB_HI.sporecapMyconid = 'sporecapMyconidHi'; ctx.MOB_DISPLAY.sporecapMyconid = 52;
      ctx.MOB_HI.toadAlchemist = 'toadAlchemistHi';     ctx.MOB_DISPLAY.toadAlchemist = 54;
      ctx.MOB_HI.mireSerpent = 'mireSerpentHi';         ctx.MOB_DISPLAY.mireSerpent = 56;
      ctx.MOB_HI.glowcapSprite = 'glowcapSpriteHi';     ctx.MOB_DISPLAY.glowcapSprite = 40;
      ctx.MOB_HI.bottledImp = 'bottledImpHi';           ctx.MOB_DISPLAY.bottledImp = 46;
      ctx.MOB_HI.cauldronMimic = 'cauldronMimicHi';     ctx.MOB_DISPLAY.cauldronMimic = 58;
      ctx.MOB_HI.mossback = 'mossbackHi';               ctx.MOB_DISPLAY.mossback = 64;
      // ---- boss: THE BREWMISTRESS (128px canvas) ----
      ctx.spr('brewmistressHi', 128, 128, drawBrewmistress);
      ctx.BOSS_HI.brewmistress = { key: 'brewmistressHi', size: 128, display: 122, bodyW: 46, bodyH: 70 };
      // ---- the HEX TOTEM mechanic object ----
      ctx.spr('swTotem', 64, 64, drawHexTotem);
      // ---- decor (10) ----
      ctx.spr('swdHut', 64, 64, drawHut);
      ctx.spr('swdCauldron', 64, 64, drawBigCauldron);
      ctx.spr('swdSnag', 64, 64, drawSnag);
      ctx.spr('swdLilies', 64, 64, drawLilies);
      ctx.spr('swdReeds', 64, 64, drawReedsProp);
      ctx.spr('swdLog', 64, 64, drawLog);
      ctx.spr('swdRing', 64, 64, drawRing);
      ctx.spr('swdBush', 64, 64, drawBush);
      ctx.spr('swdCrocSkull', 64, 64, drawCrocSkull);
      ctx.spr('swdCircle', 64, 64, drawCircle);
      // ---- tiles ----
      ctx.tex('swmoss', 48, 48, tMoss);
      ctx.tex('swmurk', 48, 48, tMurk);
      ctx.tex('swmud', 48, 48, tMud);
      ctx.tex('swplanks', 48, 48, tPlanks);
      ctx.tex('swlily', 48, 48, tLily);
      ctx.tex('swalgae', 48, 48, tAlgae);
      ctx.tex('swritual', 48, 48, tRitual);
      ctx.tex('swseep', 48, 48, tSeep);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SW_ART;
  root.SWAMP_ART = SW_ART;
})(typeof window !== 'undefined' ? window : this);
