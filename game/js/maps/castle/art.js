// ============================================================================
// game/js/maps/castle/art.js — VAMPIRE CASTLE (realm 7) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #3 5 7 9 13 15 18 20,
// THE PALE KING (render_pale_riders.js variation #10 KING OF THE LISTS —
// castle_boss_final.png canon), ALL 20 decor, tiles #1–5 ONLY. Plus the
// armor-piece mini (the Animated Armor's reassembly tech). Same pixel
// contract as world_art.js; ranger_art primitives.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- gothic castle palette (gothic_kit.js G, verbatim) -------------------
  var G = {
    OUT: '#100c14',
    stone: '#8a84a0', stoneLt: '#b8b2cc', stoneDk: '#5a5470', stoneDkk: '#363044',
    blood: '#c22e3e', bloodLt: '#f06a6a', bloodDk: '#7e1626', wine: '#58101e',
    moon: '#9fb8e8', moonLt: '#dce8ff', moonDk: '#5a72b0', night: '#1a1830', nightLt: '#2c2a4c',
    velvet: '#5c3a78', velvetLt: '#8f68b0', velvetDk: '#38204c',
    gold: '#e8b23a', goldLt: '#ffe8a0', goldDk: '#96641c', goldDkk: '#5c3a0e',
    candle: '#ffb84a', candleLt: '#fff0b0', candleDk: '#c2691a',
    wood: '#6e4a30', woodLt: '#9e7248', woodDk: '#452c18', woodDkk: '#2a1a0c',
    pale: '#cfd2e0', paleDk: '#9a9eb8', bone: '#e8e0c8', boneDk: '#a89e7e',
    vskin: '#d8d8e4', vskinDk: '#a8a8c0',
    iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a', silver: '#c8d0dc', silverDk: '#8a94a6',
    gRed: '#d04848', gBlue: '#4868d0', gGreen: '#48b068', gAmber: '#d0a848',
    white: '#f4f4f4', oil: '#0c0a10',
    fur: '#4a4256', furLt: '#6e6684', furDk: '#2c2638'
  };

  // ---- shared helpers ------------------------------------------------------
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
    ell(put, x, y, r, r, (tx, ty) => mix(c || G.stone, cdk || G.stoneDkk, 0.25 + ty * 0.6));
    put(Math.round(x), Math.round(y), cdk || G.stoneDkk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => G.oil); }
  function candleFlame(put, cx, cy, s) {
    ell(put, cx, cy, s * 0.5, s, (tx, ty) => mix(G.candle, G.candleDk, ty));
    ell(put, cx, cy + s * 0.2, s * 0.26, s * 0.5, (tx, ty) => mix(G.candleLt, G.candle, ty));
    put(Math.round(cx), Math.round(cy + s * 0.3), '#ffffff');
  }
  function cape(put, cx, cy, w, h, base, dk) {
    [-1, 1].forEach(s => {
      stroke(put, cx + s * w * 0.4, cy, cx + s * w * 0.75, cy - h * 0.35, w * 0.3, (t) => mix(base, dk, t * 0.5));
    });
    for (let y = 0; y < h; y++) {
      const t = y / h, ww = w * (0.55 + t * 0.55);
      row(put, Math.round(cy + y), cx - ww, cx + ww, (tx) => {
        let b = mix(base, dk, clamp(t * 1.1, 0, 1));
        if (Math.sin(tx * 12) > 0.6) b = mix(b, dk, 0.35);
        return b;
      });
    }
  }
  function batIcon(put, cx, cy, s, c) {
    ell(put, cx, cy, s * 0.3, s * 0.36, () => c);
    [-1, 1].forEach(k => {
      stroke(put, cx + k * s * 0.2, cy, cx + k * s * 1.1, cy - s * 0.5, s * 0.34, () => c);
      stroke(put, cx + k * s * 0.9, cy - s * 0.3, cx + k * s * 1.2, cy + s * 0.25, s * 0.22, () => c);
    });
    [-1, 1].forEach(k => stroke(put, cx + k * s * 0.14, cy - s * 0.3, cx + k * s * 0.22, cy - s * 0.55, 1, () => c));
  }
  function lancet(put, cx, yTop, w, h, fn) {
    for (let y = 0; y < h; y++) {
      const t = y / h;
      let ww;
      if (t < 0.3) { const a = t / 0.3; ww = w * Math.sqrt(Math.max(0, a * (2 - a))); }
      else ww = w;
      row(put, Math.round(yTop + y), cx - ww, cx + ww, (tx) => fn(tx, t));
    }
  }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (Red's picks #3 5 7 9 13 15 18 20) =========
  function drawGargoyle(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.16, cy + S * 0.2, cx + S * 0.16, cy + S * 0.3, G.stoneDk, G.stone, G.stoneDkk);
    dome(put, cx, cy + S * 0.06, S * 0.14, S * 0.15, G.stone, G.stoneLt, G.stoneDkk);
    [-1, 1].forEach(s => {
      dome(put, cx + s * S * 0.13, cy - S * 0.04, S * 0.07, S * 0.06, G.stoneLt, G.stoneLt, G.stoneDk);
      stroke(put, cx + s * S * 0.15, cy + S * 0.0, cx + s * S * 0.18, cy + S * 0.18, S * 0.035, () => G.stoneDk);
      [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.18, cy + S * 0.18, cx + s * S * 0.18 + k * S * 0.02, cy + S * 0.22, 1, () => G.stoneDkk));
    });
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.1, cy - S * 0.08, cx + s * S * 0.3, cy - S * 0.24, S * 0.04, (t) => mix(G.stone, G.stoneDkk, t));
      stroke(put, cx + s * S * 0.28, cy - S * 0.2, cx + s * S * 0.32, cy + S * 0.02, S * 0.03, (t) => mix(G.stoneDk, G.stoneDkk, t));
    });
    dome(put, cx, cy - S * 0.14, S * 0.08, S * 0.075, G.stone, G.stoneLt, G.stoneDk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy - S * 0.19, cx + s * S * 0.1, cy - S * 0.28, S * 0.028, () => G.stoneDk));
    stroke(put, cx - S * 0.04, cy - S * 0.08, cx + S * 0.04, cy - S * 0.08, 2, () => G.stoneDkk);
    [-1, 1].forEach(k => put(Math.round(cx + k * S * 0.035 - 1), Math.round(cy - S * 0.085), G.bone));
    [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, cy - S * 0.15, S * 0.024, G.bloodDk, G.blood, G.bloodLt));
    stroke(put, cx + S * 0.05, cy + S * 0.02, cx + S * 0.1, cy + S * 0.12, 1, () => G.stoneDkk);
  }
  function drawBloodMaiden(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    shadow(put, S, cx, S * 0.16);
    for (let y = 0; y < S * 0.34; y++) {
      const t = y / (S * 0.34), w = S * (0.07 + t * 0.14);
      row(put, Math.round(cy + y - S * 0.02), cx - w, cx + w, (tx) => {
        let b = mix(G.blood, G.wine, t);
        if (tx < 0.12 || tx > 0.88) b = mix(b, G.oil, 0.4);
        if (Math.sin(tx * 9 + t * 6) > 0.75) b = mix(b, G.bloodDk, 0.4);
        return b;
      });
    }
    dome(put, cx, cy - S * 0.1, S * 0.065, S * 0.07, G.vskin, '#ffffff', G.vskinDk);
    dome(put, cx - S * 0.01, cy - S * 0.15, S * 0.08, S * 0.05, G.night, G.nightLt, G.oil);
    for (let i = 0; i < 4; i++) stroke(put, cx - S * 0.06, cy - S * 0.12 + i, cx - S * 0.14 - i * S * 0.01, cy + S * 0.08 + i * S * 0.03, S * 0.025, (t) => mix(G.nightLt, G.oil, t));
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.026), Math.round(cy - S * 0.11), G.blood));
    stroke(put, cx - S * 0.02, cy - S * 0.065, cx + S * 0.02, cy - S * 0.065, 1, () => G.bloodDk);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.055), G.white));
    ell(put, cx + S * 0.18, cy - S * 0.06, S * 0.05, S * 0.05, (tx, ty) => mix(G.bloodLt, G.bloodDk, ty));
    put(Math.round(cx + S * 0.16), Math.round(cy - S * 0.08), '#ffffff');
    stroke(put, cx + S * 0.18, cy - S * 0.01, cx + S * 0.18, cy + S * 0.08, 1, () => G.blood);
    ell(put, cx + S * 0.18, cy + S * 0.3, S * 0.06, S * 0.02, (tx, ty) => mix(G.blood, G.wine, ty));
  }
  function drawHalberdGuard(put, S) {
    const cx = S * 0.46, cy = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.045, cy + S * 0.14, cx + s * S * 0.06, cy + S * 0.3, S * 0.028, () => G.boneDk));
    for (let y = 0; y < S * 0.2; y++) {
      const t = y / (S * 0.2), w = S * (0.085 - t * 0.01);
      row(put, Math.round(cy - S * 0.04 + y), cx - w, cx + w, (tx) => {
        let b = mix(G.velvet, G.velvetDk, t);
        if (tx > 0.4 && tx < 0.6) b = mix(G.blood, G.bloodDk, t);
        return b;
      });
    }
    plate(put, cx - S * 0.09, cy - S * 0.1, cx + S * 0.09, cy + S * 0.0, G.iron, G.silver, G.ironDkk);
    [-1, 1].forEach(s => dome(put, cx + s * S * 0.11, cy - S * 0.09, S * 0.045, S * 0.04, G.silver, G.moonLt, G.ironDk));
    dome(put, cx, cy - S * 0.18, S * 0.07, S * 0.07, G.silver, G.moonLt, G.ironDk);
    ell(put, cx, cy - S * 0.16, S * 0.045, S * 0.04, (tx, ty) => mix(G.bone, G.boneDk, ty));
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.17), G.blood));
    stroke(put, cx - S * 0.07, cy - S * 0.22, cx + S * 0.07, cy - S * 0.22, 2, () => G.ironDk);
    put(Math.round(cx), Math.round(cy - S * 0.25), G.blood);
    stroke(put, cx - S * 0.16, cy + S * 0.06, cx + S * 0.3, cy + S * 0.0, S * 0.02, () => G.wood);
    stroke(put, cx + S * 0.3, cy + S * 0.0, cx + S * 0.4, cy - S * 0.012, S * 0.022, () => G.silver);
    for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy - S * 0.06 + y), cx + S * 0.26, cx + S * 0.26 + S * (0.05 - Math.abs(y - S * 0.04) / S * 0.7), () => mix(G.silver, G.silverDk, y / (S * 0.08)));
  }
  function drawPortraitPhantom(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    plate(put, cx - S * 0.24, cy - S * 0.3, cx + S * 0.24, cy + S * 0.26, G.goldDk, G.gold, G.goldDkk);
    plate(put, cx - S * 0.2, cy - S * 0.26, cx + S * 0.2, cy + S * 0.22, G.night, G.nightLt, G.oil);
    for (let y = Math.round(cy - S * 0.26); y < cy + S * 0.22; y++)
      row(put, y, cx - S * 0.2, cx + S * 0.2, (tx) => (Math.sin(tx * 6 + y * 0.1) > 0.6 ? G.nightLt : null));
    dome(put, cx, cy + S * 0.1, S * 0.12, S * 0.12, G.nightLt, G.velvet, G.oil);
    dome(put, cx, cy - S * 0.02, S * 0.1, S * 0.1, G.velvet, G.velvetLt, G.velvetDk);
    ell(put, cx, cy - S * 0.09, S * 0.07, S * 0.025, () => G.white);
    stroke(put, cx + S * 0.08, cy - S * 0.02, cx + S * 0.26, cy + S * 0.1, S * 0.035, (t) => mix(G.velvetLt, G.velvetDk, t));
    ell(put, cx + S * 0.27, cy + S * 0.12, S * 0.028, S * 0.024, () => G.vskin);
    dome(put, cx, cy - S * 0.16, S * 0.065, S * 0.07, G.vskin, '#ffffff', G.vskinDk);
    ell(put, cx, cy - S * 0.21, S * 0.06, S * 0.025, (tx, ty) => mix(G.nightLt, G.oil, tx));
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.025, cy - S * 0.165, S * 0.016, S * 0.02, () => G.oil));
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.17), G.moon));
    [[-0.1, 0.02], [0.12, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.05, 1, () => G.nightLt));
  }
  function drawInitiate(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    cape(put, cx, cy - S * 0.12, S * 0.14, S * 0.34, G.night, G.oil);
    for (let y = 0; y < S * 0.3; y++) {
      const t = y / (S * 0.3), w = S * (0.06 + t * 0.05);
      row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
        let b = mix(G.nightLt, G.night, t);
        if (tx > 0.44 && tx < 0.56 && t < 0.5) b = G.white;
        return b;
      });
    }
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, cy + S * 0.26, cx + s * S * 0.05, cy + S * 0.34, S * 0.022, () => G.oil));
    dome(put, cx, cy - S * 0.12, S * 0.06, S * 0.065, G.vskin, '#ffffff', G.vskinDk);
    ell(put, cx, cy - S * 0.165, S * 0.055, S * 0.025, (tx, ty) => mix(G.nightLt, G.oil, ty));
    stroke(put, cx - S * 0.05, cy - S * 0.16, cx - S * 0.02, cy - S * 0.12, 1, () => G.oil);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.024), Math.round(cy - S * 0.125), G.blood));
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.08), G.white));
    stroke(put, cx + S * 0.07, cy + S * 0.02, cx + S * 0.18, cy - S * 0.06, S * 0.025, () => G.night);
    ell(put, cx + S * 0.22, cy - S * 0.08, S * 0.035, S * 0.025, (tx, ty) => mix(G.bloodLt, G.bloodDk, ty));
    [[0.28, -0.1], [0.33, -0.12]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.blood));
    for (let t = 0; t < 1; t += 0.1) put(Math.round(cx + S * (0.3 - t * 0.25)), Math.round(cy + S * (0.1 - Math.sin(t * 6) * 0.03)), G.bloodLt);
  }
  function drawDireRats(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.22);
    [[-0.14, 0.02, 1], [0.1, -0.02, -1], [0.0, 0.12, 1]].forEach(([ox, oy, dir]) => {
      const rx = cx + ox * S, ry = cy + oy * S;
      ell(put, rx, ry, S * 0.1, S * 0.055, (tx, ty) => mix(G.furLt, G.furDk, clamp(ty * 1.3, 0, 1)));
      dome(put, rx + dir * S * 0.09, ry - S * 0.01, S * 0.04, S * 0.032, G.fur, G.furLt, G.furDk);
      stroke(put, rx + dir * S * 0.12, ry, rx + dir * S * 0.16, ry + S * 0.008, S * 0.02, () => G.furDk);
      ell(put, rx + dir * S * 0.07, ry - S * 0.04, S * 0.016, S * 0.018, () => G.fur);
      put(Math.round(rx + dir * S * 0.1), Math.round(ry - S * 0.015), G.blood);
      put(Math.round(rx + dir * S * 0.165), Math.round(ry + S * 0.01), G.vskin);
      for (let t = 0; t < 1; t += 0.08) put(Math.round(rx - dir * S * (0.1 + t * 0.14)), Math.round(ry + Math.sin(t * 7) * S * 0.02), G.vskinDk);
      [[-0.04], [0.03]].forEach(([o]) => stroke(put, rx + o * S, ry + S * 0.04, rx + o * S + S * 0.015, ry + S * 0.07, 1, () => G.vskinDk));
    });
    [[-0.3, 0.0], [0.28, -0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S - S * 0.06, cy + oy * S, 1, () => G.furDk));
  }
  function drawAnimatedArmor(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    [-1, 1].forEach(s => {
      plate(put, cx + s * S * 0.11 - S * 0.045, cy + S * 0.12, cx + s * S * 0.11 + S * 0.045, cy + S * 0.3, G.iron, G.silver, G.ironDkk);
      dome(put, cx + s * S * 0.11, cy + S * 0.32, S * 0.055, S * 0.03, G.ironDk, G.iron, G.ironDkk);
    });
    plate(put, cx - S * 0.16, cy - S * 0.16, cx + S * 0.16, cy + S * 0.12, G.iron, G.silver, G.ironDkk);
    row(put, Math.round(cy - S * 0.04), cx - S * 0.16, cx + S * 0.16, () => G.ironDkk);
    bolt(put, cx, cy - S * 0.1, S * 0.02, G.gold, G.goldDk);
    plate(put, cx - S * 0.07, cy - S * 0.3, cx + S * 0.07, cy - S * 0.16, G.silver, G.moonLt, G.ironDk);
    row(put, Math.round(cy - S * 0.24), cx - S * 0.055, cx + S * 0.055, () => G.oil);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.24), G.blood));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.07, cy - S * 0.3, cx + s * S * 0.1, cy - S * 0.36, S * 0.02, () => G.goldDk));
    for (let y = 0; y < S * 0.3; y++) {
      const t = y / (S * 0.3), w = S * (0.075 - (t > 0.8 ? (t - 0.8) * 0.25 : 0));
      row(put, Math.round(cy - S * 0.14 + y), cx - S * 0.26 - w, cx - S * 0.26 + w, (tx) => mix(G.velvet, G.velvetDk, t + Math.abs(tx - 0.5) * 0.3));
    }
    bolt(put, cx - S * 0.26, cy - S * 0.02, S * 0.025, G.gold, G.goldDk);
    stroke(put, cx + S * 0.18, cy - S * 0.06, cx + S * 0.28, cy + S * 0.1, S * 0.028, () => G.woodDk);
    dome(put, cx + S * 0.29, cy + S * 0.13, S * 0.045, S * 0.04, G.iron, G.silver, G.ironDkk);
    for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.29 + Math.cos(a) * S * 0.05), Math.round(cy + S * 0.13 + Math.sin(a) * S * 0.045), G.silver);
  }
  // the crawling PIECE the armor bursts into (reassembly tech)
  function drawArmorPiece(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.16);
    // a helm dragging itself by one gauntlet
    dome(put, cx + S * 0.04, cy, S * 0.11, S * 0.1, G.silver, G.moonLt, G.ironDk);
    row(put, Math.round(cy - S * 0.01), cx - S * 0.05, cx + S * 0.13, () => G.oil);
    put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.01), G.blood);
    stroke(put, cx - S * 0.05, cy + S * 0.02, cx - S * 0.2, cy + S * 0.06, S * 0.035, () => G.ironDk);
    [-1, 0, 1].forEach(k => stroke(put, cx - S * 0.2, cy + S * 0.06, cx - S * 0.24, cy + S * 0.06 + k * S * 0.03, 2, () => G.silverDk));
    // scrape marks
    [[0.14, 0.1], [0.2, 0.12]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.05, cy + oy * S, 1, () => G.stoneDkk));
  }
  function drawCrimsonDuelist(put, S) {
    const cx = S * 0.48, cy = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    cape(put, cx + S * 0.02, cy - S * 0.1, S * 0.13, S * 0.3, G.blood, G.wine);
    for (let y = 0; y < S * 0.26; y++) {
      const t = y / (S * 0.26), w = S * (0.055 + t * 0.03);
      row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
        let b = mix(G.night, G.oil, t);
        if (tx > 0.42 && tx < 0.58 && t < 0.4) b = mix(G.gold, G.goldDk, t * 2);
        return b;
      });
    }
    stroke(put, cx - S * 0.03, cy + S * 0.22, cx - S * 0.14, cy + S * 0.32, S * 0.028, () => G.oil);
    stroke(put, cx + S * 0.03, cy + S * 0.22, cx + S * 0.12, cy + S * 0.3, S * 0.028, () => G.night);
    dome(put, cx, cy - S * 0.12, S * 0.06, S * 0.065, G.vskin, '#ffffff', G.vskinDk);
    for (let y = 0; y < S * 0.045; y++) row(put, Math.round(cy - S * 0.145 + y), cx - S * 0.055, cx + S * 0.055, (tx) => (tx < 0.5 ? mix(G.blood, G.bloodDk, y / (S * 0.045)) : null));
    ell(put, cx, cy - S * 0.185, S * 0.075, S * 0.028, (tx, ty) => mix(G.nightLt, G.oil, ty));
    stroke(put, cx + S * 0.06, cy - S * 0.2, cx + S * 0.15, cy - S * 0.26, S * 0.02, () => G.blood);
    put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.125), G.blood);
    put(Math.round(cx + S * 0.025), Math.round(cy - S * 0.125), G.oil);
    stroke(put, cx + S * 0.06, cy + S * 0.0, cx + S * 0.4, cy - S * 0.04, S * 0.014, () => G.silver);
    put(Math.round(cx + S * 0.4), Math.round(cy - S * 0.045), '#ffffff');
    for (let a = 0; a < 6.28; a += 0.7) put(Math.round(cx + S * 0.08 + Math.cos(a) * S * 0.025), Math.round(cy + S * 0.0 + Math.sin(a) * S * 0.025), G.gold);
    stroke(put, cx - S * 0.06, cy + S * 0.02, cx - S * 0.16, cy - S * 0.08, S * 0.022, () => G.night);
  }

  // ================== BOSS — THE PALE KING (pale rider var #10, canon) ======
  function drawPaleKing(put, S) {
    const o = {
      helm: 'crown', chanfron: true, caparison: G.velvet, caparisonDk: G.velvetDk,
      trim: G.gold, tabard: G.gold, cape: G.velvet, capeDk: G.velvetDk,
      shield: G.velvet, eye: G.gold, pennon: G.gold, pennon2: G.velvetLt
    };
    const cx = S * 0.54, cy = S * 0.56;
    const HC = G.pale, HL = '#ffffff', HD = G.paleDk;
    const eyeC = o.eye;
    shadow(put, S, cx, S * 0.32);
    // ---- solid pale horse ----
    const UPPER = S * 0.11, LOWER = S * 0.12;
    [{ hip: -0.2, a1: 2.3, a2: 1.85 }, { hip: -0.11, a1: 2.0, a2: 1.6 },
     { hip: 0.14, a1: 1.2, a2: 1.55 }, { hip: 0.23, a1: 0.85, a2: 1.2 }].forEach(({ hip, a1, a2 }) => {
      const hx = cx + hip * S, hy = cy + S * 0.07;
      const kx = hx + Math.cos(a1) * UPPER, ky = hy + Math.sin(a1) * UPPER;
      const fx = kx + Math.cos(a2) * LOWER, fy = ky + Math.sin(a2) * LOWER;
      stroke(put, hx, hy, kx, ky, S * 0.034, () => HC);
      stroke(put, kx, ky, fx, fy, S * 0.026, () => HD);
      ell(put, fx, fy + S * 0.008, S * 0.022, S * 0.014, () => G.oil);
    });
    ell(put, cx, cy, S * 0.26, S * 0.12, (tx, ty) => {
      let b = mix(HL, HD, clamp(ty * 1.15, 0, 1));
      if (Math.sin(tx * 15) > 0.72 && tx > 0.3 && tx < 0.85 && ty > 0.35) b = mix(b, HD, 0.3);
      if (tx < 0.12) b = mix(b, HC, 0.5);
      return b;
    });
    dome(put, cx + S * 0.18, cy - S * 0.01, S * 0.08, S * 0.08, HC, HL, HD);
    dome(put, cx - S * 0.17, cy - S * 0.01, S * 0.07, S * 0.07, HC, HL, HD);
    // velvet caparison w/ dagged hem + gold trim
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14);
      row(put, Math.round(cy + y), cx - S * 0.22, cx + S * 0.24, (tx) => {
        if (t > 0.65 && Math.floor(tx * 12) % 2) return null;
        return mix(o.caparison, o.caparisonDk, t * 0.5 + Math.abs(tx - 0.5) * 0.3);
      });
    }
    row(put, Math.round(cy), cx - S * 0.22, cx + S * 0.24, () => o.trim);
    // neck + head
    stroke(put, cx - S * 0.18, cy - S * 0.04, cx - S * 0.3, cy - S * 0.2, S * 0.062, () => HC);
    dome(put, cx - S * 0.34, cy - S * 0.25, S * 0.058, S * 0.052, HC, HL, HD);
    stroke(put, cx - S * 0.38, cy - S * 0.23, cx - S * 0.47, cy - S * 0.17, S * 0.042, (t) => mix(HC, HD, t * 0.5));
    dome(put, cx - S * 0.47, cy - S * 0.165, S * 0.026, S * 0.024, HC, HL, HD);
    put(Math.round(cx - S * 0.485), Math.round(cy - S * 0.165), HD);
    [[-0.325], [-0.355]].forEach(([ox]) => stroke(put, cx + ox * S, cy - S * 0.28, cx + ox * S + S * 0.008, cy - S * 0.34, S * 0.016, () => HD));
    // chanfron
    plate(put, cx - S * 0.38, cy - S * 0.28, cx - S * 0.3, cy - S * 0.2, G.silver, G.moonLt, G.ironDk);
    stroke(put, cx - S * 0.36, cy - S * 0.31, cx - S * 0.36, cy - S * 0.36, S * 0.014, () => o.trim);
    optic(put, cx - S * 0.345, cy - S * 0.255, S * 0.016, mix(eyeC, '#000000', 0.5), eyeC, mix(eyeC, '#ffffff', 0.6));
    stroke(put, cx - S * 0.39, cy - S * 0.24, cx - S * 0.44, cy - S * 0.18, 1, () => G.silverDk);
    for (let t = 0; t < 1; t += 0.12) {
      const mx = lerp(cx - S * 0.31, cx - S * 0.13, t), my = lerp(cy - S * 0.27, cy - S * 0.1, t);
      stroke(put, mx, my, mx + S * 0.045, my - S * 0.06, S * 0.022, (tt) => mix(G.moonLt, G.moonDk, tt));
    }
    for (let i = 0; i < 4; i++)
      stroke(put, cx + S * 0.25, cy - S * 0.03 + i * 2, cx + S * 0.39 + i * S * 0.01, cy + S * 0.1 + i * S * 0.035, S * 0.02, (t) => mix(G.moon, G.moonDk, t));
    // ---- rider ----
    const rx = cx + S * 0.04, ry = cy - S * 0.08;
    const AC = G.bone, AL = '#ffffff', AD = G.boneDk;
    for (let i = 0; i < 5; i++)
      stroke(put, rx + S * 0.06, ry - S * 0.2 + i * 2.5, rx + S * 0.26 + i * S * 0.015, ry + S * 0.02 + i * S * 0.045, S * 0.028, (t) => mix(o.cape, o.capeDk, t));
    stroke(put, rx - S * 0.02, ry - S * 0.08, rx - S * 0.05, ry + S * 0.08, S * 0.032, () => AD);
    ell(put, rx - S * 0.06, ry + S * 0.1, S * 0.026, S * 0.018, () => G.oil);
    plate(put, rx - S * 0.075, ry - S * 0.3, rx + S * 0.075, ry - S * 0.1, AC, AL, AD);
    stroke(put, rx, ry - S * 0.28, rx, ry - S * 0.11, S * 0.032, () => o.tabard);
    dome(put, rx + S * 0.09, ry - S * 0.28, S * 0.045, S * 0.04, AC, AL, AD);
    // crowned helm
    dome(put, rx, ry - S * 0.37, S * 0.055, S * 0.055, AC, AL, AD);
    row(put, Math.round(ry - S * 0.37), rx - S * 0.045, rx + S * 0.045, () => G.oil);
    [[-0.02], [0.015]].forEach(([ox]) => put(Math.round(rx + ox * S), Math.round(ry - S * 0.37), eyeC));
    [-1, 0, 1].forEach(k => stroke(put, rx + k * S * 0.028, ry - S * 0.415, rx + k * S * 0.038, ry - S * 0.465, 2, () => o.trim));
    // lance held high w/ spiral pennon
    const lTipX = cx - S * 0.6, lTipY = cy - S * 0.36;
    stroke(put, rx + S * 0.06, ry - S * 0.22, lTipX, lTipY, S * 0.036, () => G.night);
    stroke(put, rx + S * 0.06, ry - S * 0.22, lTipX, lTipY, S * 0.022, (t) => mix('#ffffff', G.paleDk, t * 0.45));
    ell(put, rx, ry - S * 0.19, S * 0.042, S * 0.034, (tx, ty) => mix(AC, AD, ty));
    stroke(put, lTipX, lTipY, lTipX - S * 0.06, lTipY + S * 0.012, S * 0.018, () => mix(eyeC, '#ffffff', 0.5));
    put(Math.round(lTipX - S * 0.06), Math.round(lTipY + S * 0.015), '#ffffff');
    for (let t = 0.6; t < 0.92; t += 0.08)
      stroke(put, lerp(rx, lTipX, t), lerp(ry - S * 0.22, lTipY, t) - S * 0.01,
        lerp(rx, lTipX, t) + S * 0.025, lerp(ry - S * 0.22, lTipY, t) - S * 0.04, S * 0.014, () => (t * 12 | 0) % 2 ? o.pennon : o.pennon2);
    ell(put, rx + S * 0.01, ry - S * 0.195, S * 0.02, S * 0.018, (tx, ty) => mix(AC, AD, ty));
    // reins
    for (let t = 0.1; t < 0.95; t += 0.09) put(Math.round(lerp(rx - S * 0.04, cx - S * 0.36, t)), Math.round(lerp(ry - S * 0.15, cy - S * 0.2, t) + Math.sin(t * 3.14) * S * 0.03), (t * 11 | 0) % 2 ? G.silverDk : G.silver);
    // velvet shield
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14), w = S * (0.05 - (t > 0.7 ? (t - 0.7) * 0.14 : 0));
      row(put, Math.round(ry - S * 0.22 + y), rx + S * 0.1 - w, rx + S * 0.1 + w, (tx) => mix(o.shield, G.night, t + Math.abs(tx - 0.5) * 0.4));
    }
    optic(put, rx + S * 0.1, ry - S * 0.16, S * 0.018, mix(eyeC, '#000000', 0.5), eyeC, '#ffffff');
    // mist kicked up
    [[0.34, 0.28], [0.42, 0.24]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.02, (tx, ty) => mix(G.moon, G.night, ty + 0.3)));
  }

  // ======================= DECOR (ALL 20) — ports ===========================
  function drawThrone(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.22, S * 0.78, cx + S * 0.22, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
    for (let y = 0; y < S * 0.44; y++) {
      const t = y / (S * 0.44);
      let w = S * 0.13; if (t < 0.3) { const a = t / 0.3; w = S * 0.13 * Math.sqrt(a * (2 - a)); }
      row(put, Math.round(S * 0.16 + y), cx - w, cx + w, (tx) => mix(G.woodDk, G.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.4));
    }
    for (let y = 0; y < S * 0.3; y++) {
      const t = y / (S * 0.3);
      let w = S * 0.08; if (t < 0.3) { const a = t / 0.3; w = S * 0.08 * Math.sqrt(a * (2 - a)); }
      row(put, Math.round(S * 0.26 + y), cx - w, cx + w, (tx) => mix(G.blood, G.wine, t + Math.abs(tx - 0.5) * 0.3));
    }
    plate(put, cx - S * 0.15, S * 0.6, cx + S * 0.15, S * 0.68, G.wood, G.woodLt, G.woodDkk);
    [-1, 1].forEach(s => {
      plate(put, cx + s * S * 0.15 - S * 0.025, S * 0.5, cx + s * S * 0.15 + S * 0.025, S * 0.66, G.woodDk, G.wood, G.woodDkk);
      dome(put, cx + s * S * 0.15, S * 0.49, S * 0.03, S * 0.022, G.gold, G.goldLt, G.goldDk);
    });
    ell(put, cx, S * 0.14, S * 0.03, S * 0.022, () => G.oil);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.02, S * 0.14, cx + s * S * 0.06, S * 0.11, S * 0.02, () => G.oil));
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.12 - S * 0.02, S * 0.68, cx + s * S * 0.12 + S * 0.02, S * 0.78, G.woodDk, G.wood, G.woodDkk));
  }
  function drawCoffin(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.26);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.14, cy + S * 0.12, cx + s * S * 0.2, cy + S * 0.24, S * 0.02, () => G.woodDk); stroke(put, cx + s * S * 0.14, cy + S * 0.12, cx + s * S * 0.08, cy + S * 0.24, S * 0.02, () => G.woodDkk); });
    const pts = [[-0.3, 0], [-0.16, -0.1], [0.26, -0.06], [0.3, 0.02], [0.2, 0.1], [-0.22, 0.08]];
    for (let y = -0.1; y < 0.12; y += 0.01) {
      const yy = cy + y * S;
      let x0 = 99, x1 = -99;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((y >= Math.min(a[1], b[1])) && (y <= Math.max(a[1], b[1])) && Math.abs(b[1] - a[1]) > 0.001) {
          const t = (y - a[1]) / (b[1] - a[1]); const x = a[0] + (b[0] - a[0]) * t;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        }
      }
      if (x1 > x0) row(put, Math.round(yy), cx + x0 * S, cx + x1 * S, (tx) => mix(G.woodLt, G.woodDkk, (y + 0.1) / 0.22 * 0.7 + Math.abs(tx - 0.5) * 0.3));
    }
    stroke(put, cx - S * 0.16, cy - S * 0.1, cx + S * 0.26, cy - S * 0.06, S * 0.02, () => G.oil);
    stroke(put, cx - S * 0.14, cy - S * 0.085, cx + S * 0.1, cy - S * 0.055, S * 0.012, () => G.wine);
    stroke(put, cx, cy - S * 0.02, cx, cy + S * 0.06, 2, () => G.gold);
    stroke(put, cx - S * 0.03, cy + S * 0.0, cx + S * 0.03, cy + S * 0.0, 2, () => G.gold);
    [[-0.26, 0.02], [0.26, 0.02]].forEach(([ox, oy]) => bolt(put, cx + ox * S, cy + oy * S, S * 0.015, G.gold, G.goldDk));
  }
  function drawCandelabra(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.12);
    stroke(put, cx, S * 0.32, cx, S * 0.84, S * 0.022, () => G.goldDk);
    dome(put, cx, S * 0.86, S * 0.09, S * 0.03, G.goldDk, G.gold, G.goldDkk);
    [[0.32, 0.16], [0.42, 0.11], [0.52, 0.06]].forEach(([yy, reach]) => {
      [-1, 1].forEach(s => {
        stroke(put, cx, S * yy, cx + s * S * reach, S * (yy - 0.05), S * 0.016, () => G.goldDk);
        stroke(put, cx + s * S * reach, S * (yy - 0.05), cx + s * S * reach, S * (yy - 0.1), S * 0.016, () => G.gold);
        candleFlame(put, cx + s * S * reach, S * (yy - 0.13), S * 0.03);
        stroke(put, cx + s * S * reach, S * (yy - 0.1), cx + s * S * reach, S * (yy - 0.115), S * 0.014, () => G.bone);
      });
    });
    candleFlame(put, cx, S * 0.27, S * 0.035);
    stroke(put, cx, S * 0.3, cx, S * 0.32, S * 0.016, () => G.bone);
    [[-0.16, 0.28], [0.11, 0.38]].forEach(([ox, oy]) => stroke(put, cx + ox * S, S * oy, cx + ox * S, S * oy + S * 0.04, 1, () => G.bone));
  }
  function drawChandelierDecor(put, S) {
    const cx = S * 0.5, cy = S * 0.4;
    for (let y = 0; y < S * 0.12; y += 4) ell(put, cx, S * 0.06 + y, S * 0.013, S * 0.018, () => (y / 4) % 2 ? G.goldDk : G.gold);
    ell(put, cx, cy, S * 0.22, S * 0.06, (tx, ty) => mix(G.gold, G.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
    ell(put, cx, cy - S * 0.06, S * 0.12, S * 0.035, (tx, ty) => mix(G.goldLt, G.goldDk, ty));
    [[-0.22, 0], [-0.11, -0.02], [0, -0.03], [0.11, -0.02], [0.22, 0]].forEach(([ox, oy]) => {
      stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, S * 0.016, () => G.bone);
      candleFlame(put, cx + ox * S, cy + oy * S - S * 0.08, S * 0.03);
    });
    for (let i = -3; i <= 3; i++) {
      stroke(put, cx + i * S * 0.06, cy + S * 0.05, cx + i * S * 0.06, cy + S * 0.12, 1, () => G.silver);
      ell(put, cx + i * S * 0.06, cy + S * 0.14, S * 0.015, S * 0.022, (tx, ty) => mix(G.moonLt, G.moonDk, ty));
    }
    ell(put, cx, S * 0.86, S * 0.2, S * 0.05, () => mix(G.candle, G.night, 0.75));
  }
  function drawGrandMirror(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    for (let y = 0; y < S * 0.56; y++) {
      const t = y / (S * 0.56);
      let w = S * 0.17; if (t < 0.25) { const a = t / 0.25; w = S * 0.17 * Math.sqrt(a * (2 - a)); }
      row(put, Math.round(S * 0.16 + y), cx - w, cx + w, (tx) => {
        const edge = tx < 0.1 || tx > 0.9 || t > 0.94;
        if (edge) return mix(G.gold, G.goldDkk, Math.abs(tx - 0.5) + t * 0.3);
        let b = mix(G.nightLt, G.night, t);
        if (Math.abs(tx - 0.32) < 0.1) b = mix(b, G.moon, 0.45);
        return b;
      });
    }
    plate(put, cx - S * 0.14, S * 0.72, cx + S * 0.14, S * 0.78, G.wood, G.woodLt, G.woodDkk);
    dome(put, cx, S * 0.13, S * 0.05, S * 0.035, G.gold, G.goldLt, G.goldDk);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(S * 0.38), G.bloodDk));
  }
  function drawPortraitRow(put, S) {
    const cx = S * 0.5;
    plate(put, cx - S * 0.32, S * 0.2, cx + S * 0.32, S * 0.8, G.nightLt, G.stoneDk, G.night);
    [[-0.21, 0.34, G.velvet], [0.0, 0.3, G.blood], [0.21, 0.34, G.moonDk]].forEach(([ox, top, robe]) => {
      const px = cx + ox * S;
      plate(put, px - S * 0.085, S * top, px + S * 0.085, S * (top + 0.3), G.goldDk, G.gold, G.goldDkk);
      plate(put, px - S * 0.065, S * (top + 0.02), px + S * 0.065, S * (top + 0.28), G.night, G.nightLt, G.oil);
      dome(put, px, S * (top + 0.1), S * 0.03, S * 0.032, G.vskin, '#ffffff', G.vskinDk);
      dome(put, px, S * (top + 0.19), S * 0.045, S * 0.06, robe, mix(robe, '#ffffff', 0.3), G.oil);
      [-1, 1].forEach(s => put(Math.round(px + s * S * 0.012), Math.round(S * (top + 0.095)), G.blood));
    });
    plate(put, cx - S * 0.32, S * 0.3, cx - S * 0.24, S * 0.62, G.goldDk, G.gold, G.goldDkk);
    plate(put, cx - S * 0.305, S * 0.32, cx - S * 0.255, S * 0.6, G.oil, G.night, G.oil);
    row(put, Math.round(S * 0.78), cx - S * 0.32, cx + S * 0.32, () => G.woodDk);
  }
  function drawBanquetTable(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.3);
    plate(put, cx - S * 0.3, cy - S * 0.1, cx + S * 0.3, cy + S * 0.08, G.blood, G.bloodLt, G.wine);
    row(put, Math.round(cy - S * 0.1), cx - S * 0.3, cx + S * 0.3, () => G.bloodLt);
    for (let x = -0.28; x < 0.3; x += 0.06) stroke(put, cx + x * S, cy + S * 0.08, cx + x * S, cy + S * 0.2, S * 0.02, (t) => mix(G.blood, G.wine, t));
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.26 - S * 0.02, cy + S * 0.18, cx + s * S * 0.26 + S * 0.02, cy + S * 0.28, G.woodDk, G.wood, G.woodDkk));
    stroke(put, cx, cy - S * 0.14, cx, cy - S * 0.1, 2, () => G.goldDk);
    candleFlame(put, cx, cy - S * 0.17, S * 0.028);
    [[-0.18, -0.12], [0.14, -0.13]].forEach(([ox, oy]) => {
      stroke(put, cx + ox * S, cy + oy * S + S * 0.03, cx + ox * S, cy + oy * S + S * 0.06, 2, () => G.goldDk);
      ell(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.022, S * 0.014, (tx, ty) => mix(G.gold, G.goldDk, ty));
      put(Math.round(cx + ox * S), Math.round(cy + oy * S + S * 0.015), G.blood);
    });
    ell(put, cx + S * 0.24, cy - S * 0.115, S * 0.05, S * 0.018, (tx, ty) => mix(G.silver, G.silverDk, ty));
    dome(put, cx + S * 0.24, cy - S * 0.14, S * 0.028, S * 0.02, G.boneDk, G.bone, G.woodDkk);
  }
  function drawGreatOrgan(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.28);
    [[-0.26, 0.36], [-0.17, 0.46], [-0.08, 0.56], [0.02, 0.62], [0.12, 0.56], [0.21, 0.46], [0.3, 0.36]].forEach(([o, h]) => {
      plate(put, cx + o * S - S * 0.035, S * 0.82 - h * S, cx + o * S + S * 0.035, S * 0.7, G.silver, G.moonLt, G.ironDkk);
      ell(put, cx + o * S, S * 0.82 - h * S + S * 0.02, S * 0.014, S * 0.01, () => G.oil);
    });
    plate(put, cx - S * 0.3, S * 0.7, cx + S * 0.34, S * 0.78, G.woodDk, G.wood, G.woodDkk);
    plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.24, S * 0.86, G.wood, G.woodLt, G.woodDkk);
    for (let x = -0.18; x < 0.22; x += 0.02) put(Math.round(cx + x * S), Math.round(S * 0.8), Math.floor(x * 50) % 2 ? G.oil : G.white);
    plate(put, cx - S * 0.08, S * 0.88, cx + S * 0.12, S * 0.92, G.woodDk, G.wood, G.woodDkk);
    ell(put, cx + S * 0.02, S * 0.18, S * 0.03, S * 0.02, () => G.oil);
    [-1, 1].forEach(s => stroke(put, cx + S * 0.02 + s * S * 0.02, S * 0.18, cx + S * 0.02 + s * S * 0.07, S * 0.15, S * 0.02, () => G.oil));
    [[-0.3, 0.66], [0.34, 0.66]].forEach(([ox, oy]) => candleFlame(put, cx + ox * S, S * oy, S * 0.026));
  }
  function drawLancetWindow(put, S) {
    const cx = S * 0.5;
    const panes = [G.gRed, G.gBlue, G.gGreen, G.gAmber];
    lancet(put, cx, S * 0.12, S * 0.19, S * 0.6, (tx, t) => mix(G.stone, G.stoneDk, t * 0.5 + Math.abs(tx - 0.5)));
    lancet(put, cx, S * 0.15, S * 0.15, S * 0.54, (tx, t) => {
      let b = panes[(Math.floor(tx * 3) + Math.floor(t * 4)) % 4];
      b = mix(b, '#ffffff', 0.15 + 0.2 * Math.sin(tx * 4 + t * 3));
      if ((tx * 3) % 1 < 0.1 || (t * 4) % 1 < 0.06) b = G.ironDkk;
      return b;
    });
    for (let y = 0; y < S * 0.2; y++) {
      const t = y / (S * 0.2);
      row(put, Math.round(S * 0.7 + y), cx - S * (0.15 + t * 0.12) + S * 0.14, cx + S * (0.15 + t * 0.12) + S * 0.14, (tx) => {
        if ((tx * 5 + t * 2) % 1 < 0.5) return mix(G.moonLt, G.night, 0.55 + t * 0.2);
        return null;
      });
    }
    ell(put, cx + S * 0.14, S * 0.9, S * 0.24, S * 0.04, () => mix(G.moon, G.night, 0.5));
  }
  function drawGothicColumn(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    plate(put, cx - S * 0.13, S * 0.8, cx + S * 0.13, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
    [-0.06, 0, 0.06].forEach(o => {
      for (let y = S * 0.26; y < S * 0.8; y++)
        row(put, Math.round(y), cx + o * S - S * 0.035, cx + o * S + S * 0.035, (tx) => mix(G.stoneLt, G.stoneDk, Math.abs(tx - 0.5) * 1.4 + (o + 0.06) * 2));
    });
    plate(put, cx - S * 0.14, S * 0.18, cx + S * 0.14, S * 0.28, G.stoneLt, G.moonLt, G.stoneDk);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(S * 0.22), G.oil));
    stroke(put, cx - S * 0.03, S * 0.25, cx + S * 0.03, S * 0.25, 1, () => G.stoneDkk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.2, cx + s * S * 0.08, S * 0.16, 2, () => G.stoneDk));
    stroke(put, cx + S * 0.13, S * 0.42, cx + S * 0.2, S * 0.38, S * 0.016, () => G.ironDk);
    candleFlame(put, cx + S * 0.21, S * 0.34, S * 0.04);
  }
  function drawLibraryStack(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.26, S * 0.16, cx + S * 0.26, S * 0.86, G.woodDk, G.wood, G.woodDkk);
    [0.22, 0.38, 0.54, 0.7].forEach(sy => {
      plate(put, cx - S * 0.24, S * (sy + 0.12), cx + S * 0.24, S * (sy + 0.14), G.wood, G.woodLt, G.woodDkk);
      let x = -0.22, i = 0;
      while (x < 0.2) {
        const w = 0.025 + ((i * 37) % 3) * 0.008;
        const cols = [G.blood, G.velvet, G.moonDk, G.gGreen, G.woodLt][(i * 13) % 5];
        const h = 0.1 - ((i * 7) % 3) * 0.015;
        plate(put, cx + x * S, S * (sy + 0.12 - h), cx + (x + w) * S, S * (sy + 0.12), cols, mix(cols, '#ffffff', 0.25), mix(cols, '#000000', 0.4));
        x += w + 0.006; i++;
      }
    });
    plate(put, cx + S * 0.3, S * 0.3, cx + S * 0.38, S * 0.4, G.blood, G.bloodLt, G.wine);
    stroke(put, cx + S * 0.3, S * 0.3, cx + S * 0.3, S * 0.4, 1, () => G.gold);
    stroke(put, cx - S * 0.3, S * 0.86, cx - S * 0.18, S * 0.2, S * 0.014, () => G.woodLt);
    stroke(put, cx - S * 0.34, S * 0.86, cx - S * 0.22, S * 0.2, S * 0.014, () => G.woodLt);
    for (let t = 0.1; t < 1; t += 0.12) put(Math.round(cx - S * 0.32 + t * S * 0.12), Math.round(S * (0.86 - t * 0.66)), G.woodLt);
  }
  function drawArmorDisplay(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
    stroke(put, cx, S * 0.3, cx, S * 0.8, S * 0.016, () => G.woodDk);
    plate(put, cx - S * 0.09, S * 0.38, cx + S * 0.09, S * 0.56, G.silver, G.moonLt, G.ironDk);
    stroke(put, cx, S * 0.4, cx, S * 0.54, 1, () => G.ironDkk);
    dome(put, cx, S * 0.3, S * 0.055, S * 0.055, G.silver, G.moonLt, G.ironDk);
    row(put, Math.round(S * 0.3), cx - S * 0.04, cx + S * 0.04, () => G.oil);
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.1, S * 0.4, cx + s * S * 0.14, S * 0.54, S * 0.028, () => G.silverDk);
      dome(put, cx + s * S * 0.145, S * 0.56, S * 0.022, S * 0.02, G.silver, G.moonLt, G.ironDk);
    });
    stroke(put, cx + S * 0.2, S * 0.24, cx + S * 0.24, S * 0.8, S * 0.014, () => G.wood);
    for (let y = 0; y < S * 0.07; y++) row(put, Math.round(S * 0.2 + y), cx + S * 0.185, cx + S * 0.185 + S * (0.04 - Math.abs(y - S * 0.035) / S * 0.6), () => G.silver);
    for (let y = 0; y < S * 0.06; y++) row(put, Math.round(S * 0.56 + y), cx - S * (0.08 + y / S * 0.2), cx + S * (0.08 + y / S * 0.2), (tx) => mix(G.silverDk, G.ironDkk, y / (S * 0.06)));
  }
  function drawBloodFountain(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.3);
    ell(put, cx, cy + S * 0.12, S * 0.28, S * 0.1, (tx, ty) => mix(G.stoneLt, G.stoneDkk, ty + Math.abs(tx - 0.5) * 0.4));
    ell(put, cx, cy + S * 0.1, S * 0.24, S * 0.075, (tx, ty) => {
      let b = mix(G.bloodLt, G.wine, clamp(ty * 1.3, 0, 1));
      if (Math.sin(tx * 12 + ty * 5) > 0.75) b = mix(b, G.bloodLt, 0.6);
      return b;
    });
    plate(put, cx - S * 0.03, cy - S * 0.14, cx + S * 0.03, cy + S * 0.06, G.stone, G.stoneLt, G.stoneDkk);
    ell(put, cx, cy - S * 0.16, S * 0.12, S * 0.045, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
    ell(put, cx, cy - S * 0.175, S * 0.09, S * 0.03, (tx, ty) => mix(G.bloodLt, G.wine, ty));
    dome(put, cx, cy - S * 0.26, S * 0.045, S * 0.04, G.stone, G.stoneLt, G.stoneDk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy - S * 0.3, cx + s * S * 0.05, cy - S * 0.34, 2, () => G.stoneDk));
    stroke(put, cx, cy - S * 0.24, cx, cy - S * 0.2, 2, () => G.blood);
    [-1, 1].forEach(s => { for (let t = 0; t < 1; t += 0.1) put(Math.round(cx + s * t * S * 0.1), Math.round(cy - S * 0.22 + t * t * S * 0.06), G.bloodLt); });
    [[-0.2, 0.16], [0.22, 0.18]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.05, 1, () => G.blood));
  }
  function drawWeepingStatue(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    plate(put, cx - S * 0.14, S * 0.8, cx + S * 0.14, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
    for (let y = 0; y < S * 0.46; y++) {
      const t = y / (S * 0.46), w = S * (0.06 + t * 0.09);
      row(put, Math.round(S * 0.34 + y), cx - w, cx + w, (tx) => {
        let b = mix(G.stoneLt, G.stoneDk, t * 0.8 + Math.abs(tx - 0.5) * 0.4);
        if (Math.sin(tx * 8 + t * 10) > 0.8) b = mix(b, G.stoneDkk, 0.4);
        return b;
      });
    }
    dome(put, cx, S * 0.32, S * 0.07, S * 0.07, G.stone, G.stoneLt, G.stoneDk);
    ell(put, cx, S * 0.34, S * 0.05, S * 0.035, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.025, S * 0.37, cx + s * S * 0.035, S * 0.48, 1, () => G.blood);
      put(Math.round(cx + s * S * 0.035), Math.round(S * 0.49), G.bloodLt);
    });
    ell(put, cx - S * 0.08, S * 0.7, S * 0.03, S * 0.02, () => G.gGreen);
  }
  function drawPortcullis(put, S) {
    const cx = S * 0.5;
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.26 - S * 0.06, S * 0.2, cx + s * S * 0.26 + S * 0.06, S * 0.88, G.stone, G.stoneLt, G.stoneDkk));
    for (let a = 0.1; a < Math.PI - 0.1; a += 0.06) {
      const x = cx - Math.cos(a) * S * 0.26, y = S * 0.24 - Math.sin(a) * S * 0.1;
      ell(put, x, y, S * 0.035, S * 0.035, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
    }
    for (let y = S * 0.26; y < S * 0.88; y++) row(put, Math.round(y), cx - S * 0.2, cx + S * 0.2, () => mix(G.night, G.oil, (y - S * 0.26) / (S * 0.6)));
    for (let x = -0.18; x <= 0.18; x += 0.06) {
      stroke(put, cx + x * S, S * 0.26, cx + x * S, S * 0.6, S * 0.018, () => G.ironDk);
      stroke(put, cx + x * S, S * 0.6, cx + x * S, S * 0.66, S * 0.012, () => G.iron);
      put(Math.round(cx + x * S), Math.round(S * 0.665), G.silver);
    }
    [0.32, 0.44, 0.56].forEach(yy => stroke(put, cx - S * 0.18, S * yy, cx + S * 0.18, S * yy, S * 0.016, () => G.iron));
    [-1, 1].forEach(s => { for (let y = 0; y < S * 0.14; y += 4) ell(put, cx + s * S * 0.14, S * 0.14 + y, S * 0.01, S * 0.014, () => (y / 4) % 2 ? G.silverDk : G.silver); });
  }
  function drawCrimsonRunner(put, S) {
    // a tiling carpet segment (used as a tileable strip)
    for (let y = 0; y < S; y++) {
      row(put, y, 0, S, (tx) => {
        if (tx < 0.07 || tx > 0.93) return mix(G.gold, G.goldDk, (y % 9) / 9);
        let b = mix(G.blood, G.wine, 0.3 + (y % 5) * 0.06);
        const px = tx * 10, py = y / 8;
        if (Math.sin(px * 2) * Math.sin(py * 2) > 0.55) b = mix(b, G.bloodDk, 0.6);
        return b;
      });
    }
  }
  function drawGreatHearth(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    plate(put, cx - S * 0.28, S * 0.2, cx + S * 0.28, S * 0.86, G.stone, G.stoneLt, G.stoneDkk);
    plate(put, cx - S * 0.3, S * 0.34, cx + S * 0.3, S * 0.4, G.stoneLt, G.moonLt, G.stoneDk);
    for (let y = 0; y < S * 0.4; y++) {
      const t = y / (S * 0.4);
      let w = S * 0.18; if (t < 0.3) { const a = t / 0.3; w = S * 0.18 * Math.sqrt(a * (2 - a)); }
      row(put, Math.round(S * 0.42 + y), cx - w, cx + w, () => mix(G.night, G.oil, t));
    }
    [[0, 0.72, 0.07], [-0.08, 0.75, 0.05], [0.08, 0.76, 0.045]].forEach(([ox, yy, s]) => {
      ell(put, cx + ox * S, S * yy, s * S * 0.6, s * S * 1.4, (tx, ty) => mix(G.gGreen, '#1c5c30', ty));
      ell(put, cx + ox * S, S * (yy + 0.02), s * S * 0.3, s * S * 0.7, (tx, ty) => mix('#c8ffd8', G.gGreen, ty));
    });
    stroke(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.82, S * 0.03, () => G.woodDkk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.14, S * 0.76, cx + s * S * 0.14, S * 0.84, S * 0.016, () => G.ironDk));
    [[-0.2], [0.2]].forEach(([o]) => { dome(put, cx + o * S, S * 0.31, S * 0.028, S * 0.026, G.bone, '#ffffff', G.boneDk); [-1, 1].forEach(s => put(Math.round(cx + o * S + s * S * 0.01), Math.round(S * 0.305), G.oil)); });
    candleFlame(put, cx, S * 0.28, S * 0.03);
  }
  function drawWineRack(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.28);
    [[-0.14, 0.02], [0.16, 0.04]].forEach(([ox, oy]) => {
      const bx = cx + ox * S, by = cy + oy * S;
      for (let x = -0.11; x < 0.11; x += 0.01) {
        const t = (x + 0.11) / 0.22;
        const h = S * (0.09 + Math.sin(t * Math.PI) * 0.02);
        for (let y = -h; y < h; y++) put(Math.round(bx + x * S), Math.round(by + y), mix(G.woodLt, G.woodDkk, Math.abs(y) / h * 0.7 + 0.1));
      }
      [-0.07, 0.07].forEach(o => { for (let y = -S * 0.1; y < S * 0.1; y++) put(Math.round(bx + o * S), Math.round(by + y), G.ironDk); });
      ell(put, bx, by, S * 0.02, S * 0.02, (tx, ty) => mix(G.wine, G.oil, ty));
    });
    plate(put, cx - S * 0.26, cy - S * 0.34, cx + S * 0.28, cy - S * 0.1, G.woodDk, G.wood, G.woodDkk);
    for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 5; rx++) {
      const bx = cx - S * 0.2 + rx * S * 0.1, by = cy - S * 0.29 + ry * S * 0.075;
      ell(put, bx, by, S * 0.022, S * 0.022, (tx, ty) => {
        const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2;
        return d < 0.2 ? ((rx + ry) % 3 === 0 ? G.blood : G.night) : mix(G.woodDkk, G.oil, 0.5);
      });
    }
    stroke(put, cx + S * 0.1, cy - S * 0.22, cx + S * 0.1, cy - S * 0.14, 1, () => G.blood);
  }
  function drawJoustList(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.3);
    plate(put, cx - S * 0.34, cy - S * 0.02, cx + S * 0.34, cy + S * 0.1, G.wood, G.woodLt, G.woodDkk);
    row(put, Math.round(cy - S * 0.02), cx - S * 0.34, cx + S * 0.34, () => G.woodLt);
    for (let y = 0; y < S * 0.12; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * 0.34, cx + S * 0.34, (tx) => {
      const st = Math.floor(tx * 14) % 2;
      return mix(st ? G.blood : G.bone, G.oil, y / (S * 0.12) * 0.4);
    });
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.32, cy - S * 0.34, cx + s * S * 0.32, cy + S * 0.2, S * 0.016, () => G.woodDk);
      ell(put, cx + s * S * 0.32, cy - S * 0.36, S * 0.014, S * 0.014, (tx, ty) => mix(G.goldLt, G.goldDk, ty));
      for (let y = 0; y < S * 0.12; y++) {
        const t = y / (S * 0.12);
        const reach = S * (0.12 - (t > 0.7 ? (t - 0.7) * 0.24 : 0));
        row(put, Math.round(cy - S * 0.32 + y), cx + s * S * 0.32, cx + s * S * 0.32 + s * reach, (tx) => mix(s < 0 ? G.blood : G.velvet, G.oil, t * 0.4));
      }
      batIcon(put, cx + s * S * 0.37, cy - S * 0.27, S * 0.025, G.gold);
    });
    [[-0.02], [0.02]].forEach(([o]) => stroke(put, cx - S * 0.26 + o * S * 3, cy + S * 0.2, cx - S * 0.2 + o * S * 3, cy - S * 0.24, S * 0.012, () => G.woodLt));
  }
  function drawBatRoost(put, S) {
    const cx = S * 0.5;
    plate(put, cx - S * 0.34, S * 0.24, cx + S * 0.34, S * 0.34, G.woodDk, G.wood, G.woodDkk);
    stroke(put, cx - S * 0.34, S * 0.24, cx + S * 0.34, S * 0.24, 2, () => G.woodLt);
    let seed = 3; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < 9; i++) {
      const bx = cx - S * 0.3 + i * S * 0.075 + (rnd() - 0.5) * S * 0.02;
      const len = S * (0.1 + rnd() * 0.05);
      stroke(put, bx, S * 0.34, bx, S * 0.34 + len * 0.3, 1, () => G.furDk);
      for (let y = 0; y < len; y++) {
        const t = y / len, w = S * 0.025 * Math.sin(Math.min(1, t * 1.3) * Math.PI);
        row(put, Math.round(S * 0.34 + len * 0.3 + y), bx - w, bx + w, (tx) => mix(G.furLt, G.furDk, t * 0.6 + Math.abs(tx - 0.5)));
      }
      if (i === 5) { put(Math.round(bx - 1), Math.round(S * 0.34 + len * 0.75), G.blood); put(Math.round(bx + 1), Math.round(S * 0.34 + len * 0.75), G.blood); }
    }
    ell(put, cx + S * 0.05, S * 0.86, S * 0.06, S * 0.02, (tx, ty) => mix(G.bone, G.boneDk, ty));
    batIcon(put, cx + S * 0.28, S * 0.56, S * 0.05, G.fur);
  }

  // ======================= TILES (#1–5 ONLY) ================================
  function tileFn(base) {
    return (put, S) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x, y, S); if (c) put(x, y, c); } };
  }
  const drawFlagstone = tileFn((x, y, T) => {
    const bh = T / 4, bw = T / 2, rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
    const bx = Math.floor((x + off) / bw);
    let b = mix(G.stone, G.stoneDk, 0.25 + h2(bx + 3, rowI, 7) * 0.5);
    b = mix(b, G.stoneDkk, h2(x, y, 8) * 0.2);
    if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
    if (h2(x, y, 9) > 0.995) b = G.stoneLt;
    return b;
  });
  const drawBallroom = tileFn((x, y, T) => {
    const cs = T / 4, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    const alt = (cxi + cyi) % 2 === 0;
    let b = alt ? mix('#e0e0e8', '#b8b8c8', 0.2 + h2(cxi, cyi, 12) * 0.3) : mix('#26243a', G.oil, 0.3 + h2(cxi, cyi, 13) * 0.3);
    if (Math.sin((x + y) * 0.35) > 0.94) b = mix(b, '#ffffff', alt ? 0.5 : 0.2);
    if (x % cs < 1 || y % cs < 1) b = mix(b, G.night, 0.6);
    return b;
  });
  const drawParquet = tileFn((x, y, T) => {
    const s = 8, gx = Math.floor(x / s), gy = Math.floor(y / s);
    const diag = (gx + gy) % 2 === 0;
    const inX = x % s, inY = y % s;
    const stripe = diag ? inX : inY;
    let b = mix(G.wood, G.woodDk, 0.2 + h2(gx, gy, 20) * 0.4);
    if (Math.sin(stripe * 1.2 + h2(gx, gy, 21) * 6) > 0.5) b = mix(b, G.woodDkk, 0.35);
    if ((diag ? inY : inX) < 1) b = G.woodDkk;
    return b;
  });
  const drawCourtyard = tileFn((x, y, T) => {
    const cs = T / 5, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    const jx = (h2(cxi, cyi, 30) - 0.5) * 3, jy = (h2(cxi, cyi, 31) - 0.5) * 3;
    const dx = (x % cs) - cs / 2 - jx, dy = (y % cs) - cs / 2 - jy;
    const d = Math.sqrt(dx * dx + dy * dy) / (cs * 0.6);
    if (d > 1) return G.night;
    let b = mix(G.stoneLt, G.stoneDk, 0.25 + h2(cxi, cyi, 32) * 0.5 + d * 0.3);
    if (dy < -cs * 0.15 && d < 0.7) b = mix(b, G.moon, 0.25);
    return b;
  });
  const drawBloodstone = tileFn((x, y, T) => {
    const bh = T / 4, bw = T / 2, rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
    let b = mix(G.stone, G.stoneDk, 0.3 + h2(Math.floor((x + off) / bw), rowI, 40) * 0.4);
    if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
    const s1 = h2(x >> 3, y >> 3, 44);
    if (s1 > 0.72) {
      const local = Math.sin(x * 0.7) * Math.sin(y * 0.8);
      if (local > -0.2) b = mix(b, s1 > 0.88 ? G.wine : G.bloodDk, 0.55);
    }
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var CAS_ART = {
    G: G,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (8) + the armor piece mini ----
      ctx.spr('gargoyleHi', MS, MS, drawGargoyle);
      ctx.spr('bloodMaidenHi', MS, MS, drawBloodMaiden);
      ctx.spr('halberdGuardHi', MS, MS, drawHalberdGuard);
      ctx.spr('portraitPhantomHi', MS, MS, drawPortraitPhantom);
      ctx.spr('vampInitiateHi', MS, MS, drawInitiate);
      ctx.spr('direRatsHi', MS, MS, drawDireRats);
      ctx.spr('animatedArmorHi', MS, MS, drawAnimatedArmor);
      ctx.spr('armorPieceHi', MS, MS, drawArmorPiece);
      ctx.spr('crimsonDuelistHi', MS, MS, drawCrimsonDuelist);
      ctx.MOB_HI.gargoyle = 'gargoyleHi';               ctx.MOB_DISPLAY.gargoyle = 118;
      ctx.MOB_HI.bloodMaiden = 'bloodMaidenHi';         ctx.MOB_DISPLAY.bloodMaiden = 113;
      ctx.MOB_HI.halberdGuard = 'halberdGuardHi';       ctx.MOB_DISPLAY.halberdGuard = 113;
      ctx.MOB_HI.portraitPhantom = 'portraitPhantomHi'; ctx.MOB_DISPLAY.portraitPhantom = 109;
      ctx.MOB_HI.vampInitiate = 'vampInitiateHi';       ctx.MOB_DISPLAY.vampInitiate = 109;
      ctx.MOB_HI.direRats = 'direRatsHi';               ctx.MOB_DISPLAY.direRats = 101;
      ctx.MOB_HI.animatedArmor = 'animatedArmorHi';     ctx.MOB_DISPLAY.animatedArmor = 130;
      // M7k AUDIT fix: armorReborn had no HI entry — the reassembled armor
      // rendered ~96px with a corner hitbox. Same sheet + display as the base.
      ctx.MOB_HI.armorReborn = 'animatedArmorHi';       ctx.MOB_DISPLAY.armorReborn = 130;
      ctx.MOB_HI.armorPiece = 'armorPieceHi';           ctx.MOB_DISPLAY.armorPiece = 80;
      ctx.MOB_HI.crimsonDuelist = 'crimsonDuelistHi';   ctx.MOB_DISPLAY.crimsonDuelist = 113;
      // ---- boss: WIDE mounted sprite (generous body — m6e hitbox lesson) ----
      ctx.spr('palekingHi', 128, 128, drawPaleKing);
      ctx.BOSS_HI.paleking = { key: 'palekingHi', size: 128, display: 170, bodyW: 100, bodyH: 60 };
      // ---- decor (ALL 20) ----
      ctx.spr('caThrone', 64, 64, drawThrone);
      ctx.spr('caCoffin', 64, 64, drawCoffin);
      ctx.spr('caCandelabra', 64, 64, drawCandelabra);
      ctx.spr('caChandelier', 64, 64, drawChandelierDecor);
      ctx.spr('caMirror', 64, 64, drawGrandMirror);
      ctx.spr('caPortraits', 64, 64, drawPortraitRow);
      ctx.spr('caBanquet', 64, 64, drawBanquetTable);
      ctx.spr('caOrgan', 64, 64, drawGreatOrgan);
      ctx.spr('caWindow', 64, 64, drawLancetWindow);
      ctx.spr('caColumn', 64, 64, drawGothicColumn);
      ctx.spr('caLibrary', 64, 64, drawLibraryStack);
      ctx.spr('caArmorStand', 64, 64, drawArmorDisplay);
      ctx.spr('caFountain', 64, 64, drawBloodFountain);
      ctx.spr('caStatue', 64, 64, drawWeepingStatue);
      ctx.spr('caGate', 64, 64, drawPortcullis);
      ctx.spr('caHearth', 64, 64, drawGreatHearth);
      ctx.spr('caWine', 64, 64, drawWineRack);
      ctx.spr('caJoustList', 64, 64, drawJoustList);
      ctx.spr('caRoost', 64, 64, drawBatRoost);
      // the crimson runner is a TILE (the carpet strip)
      ctx.tex('carunner', 48, 48, drawCrimsonRunner);
      // ---- tiles (#1–5 ONLY) ----
      ctx.tex('caflagstone', 48, 48, drawFlagstone);
      ctx.tex('caballroom', 48, 48, drawBallroom);
      ctx.tex('caparquet', 48, 48, drawParquet);
      ctx.tex('cacourtyard', 48, 48, drawCourtyard);
      ctx.tex('cabloodstone', 48, 48, drawBloodstone);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CAS_ART;
  root.CASTLE_ART = CAS_ART;
})(typeof window !== 'undefined' ? window : this);
