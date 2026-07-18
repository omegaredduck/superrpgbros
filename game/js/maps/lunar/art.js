// ============================================================================
// game/js/maps/lunar/art.js — LUNAR STATION (realm 8) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #4 7 8 9 10 11 12 18 20
// + scuttler #1 (the brood sac's hatchling), THE OVERMIND final
// (render_lunar_boss_final.js — the canon), ALL 20 decor, tiles #1 2 3 4 5 8 10
// (the scene-plan PNG uses the lab tile for THE LABS, so it ships too).
// Same pixel-plotting contract as world_art.js; ranger_art primitives.
// buildInto(ctx) registers through the SAME helpers core mobs use.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- lunar palette (space_kit.js L, verbatim) ----------------------------
  var L = {
    OUT: '#0c0e16',
    moon: '#b0b4c2', moonLt: '#dde0ea', moonDk: '#787e94', moonDkk: '#4a4f64',
    hull: '#e2e6ee', hullMd: '#b6bcd0', hullDk: '#828aa6', hullDkk: '#4e5470',
    space: '#0e1020', spaceLt: '#1c2038',
    xeno: '#5fd668', xenoLt: '#b8ffb0', xenoDk: '#2a8e3c', xenoDkk: '#14522a',
    acid: '#b8f04a', acidDk: '#6ea01c',
    void: '#8a5fd6', voidLt: '#c8a8ff', voidDk: '#4c2c8e',
    holo: '#4adcf0', holoLt: '#c8f8ff', holoDk: '#1f88a8',
    warn: '#ff9a3a', warnLt: '#ffd08a', warnDk: '#b85a14',
    red: '#ff4b4e', redLt: '#ffb0a8', redDk: '#9e2028',
    steel: '#8a94a6', steelLt: '#c7cdd6', steelDk: '#454e63', steelDkk: '#2b3245',
    foil: '#e8b23a', foilLt: '#ffe8a0', foilDk: '#96641c',
    visor: '#1a2c48', visorLt: '#3a6f9e',
    white: '#f4f4f4', oil: '#0a0b12',
    flesh: '#c8a8b8', fleshDk: '#8e6a80'
  };

  // ---- shared shape helpers (space_kit lineage — ES6 kept, browser-safe) ---
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
    ell(put, x, y, r, r, (tx, ty) => mix(c || L.steel, cdk || L.steelDkk, 0.25 + ty * 0.6));
    put(Math.round(x), Math.round(y), cdk || L.steelDkk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => L.oil); }
  function visor(put, cx, cy, rx, ry, base, lt) {
    ell(put, cx, cy, rx, ry, (tx, ty) => {
      let b = mix(lt || L.visorLt, base || L.visor, clamp(ty * 1.3, 0, 1));
      if (tx < 0.35 && ty < 0.4) b = mix(b, '#ffffff', 0.45);
      return b;
    });
  }
  function hover(put, cx, cy, w, c) {
    ell(put, cx, cy, w, w * 0.28, () => (c || L.holoDk));
    ell(put, cx, cy - 1, w * 0.6, w * 0.16, () => (c ? mix(c, '#ffffff', 0.4) : L.holo));
  }
  function panel(put, x0, y0, x1, y1) {
    plate(put, x0, y0, x1, y1, L.hullMd, L.hull, L.hullDkk);
    stroke(put, x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, 1, () => L.hullDk);
    [[x0 + 3, y0 + 3], [x1 - 3, y0 + 3], [x0 + 3, y1 - 3], [x1 - 3, y1 - 3]].forEach(([x, y]) => put(Math.round(x), Math.round(y), L.hullDkk));
  }
  function chitin(put, cx, cy, rx, ry, base, lt, dk) {
    ell(put, cx, cy, rx, ry, (tx, ty) => {
      let b = mix(lt, base, clamp(ty * 1.2, 0, 1));
      b = mix(b, dk, clamp((ty - 0.55) * 1.4, 0, 1));
      if (Math.sin(tx * 9) > 0.55) b = mix(b, dk, 0.35);
      return b;
    });
  }
  function star(put, x, y, c) { put(x, y, c || '#ffffff'); put(x + 1, y, c || '#ffffff'); put(x - 1, y, c || '#ffffff'); put(x, y + 1, c || '#ffffff'); put(x, y - 1, c || '#ffffff'); }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (Red picks #4 7 8 9 10 11 12 18 20 + #1) ====
  // #1 · SCUTTLER — palm-sized xeno crab; the brood sac's cheap swarm.
  function drawScuttler(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.16);
    [-1, 1].forEach(s => [[-0.1, 0.2], [0.0, 0.24], [0.1, 0.22], [0.18, 0.16]].forEach(([oy, len]) => {
      stroke(put, cx + s * S * 0.08, cy + oy * S * 0.4, cx + s * S * len, cy + oy * S * 0.4 - S * 0.06, 2, () => L.xenoDk);
      stroke(put, cx + s * S * len, cy + oy * S * 0.4 - S * 0.06, cx + s * S * (len + 0.05), cy + oy * S * 0.4 + S * 0.06, 2, () => L.xenoDkk);
    }));
    chitin(put, cx, cy, S * 0.13, S * 0.1, L.xeno, L.xenoLt, L.xenoDkk);
    stroke(put, cx + S * 0.1, cy + S * 0.04, cx + S * 0.2, cy + S * 0.12, S * 0.025, (t) => mix(L.xeno, L.xenoDkk, t));
    [[-0.05, -0.03], [0.0, -0.05], [0.05, -0.03]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.red));
  }
  // #4 · GREY WATCHER — classic grey; telekinetic aimed bolts.
  function drawGreyWatcher(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    for (let y = 0; y < S * 0.26; y++) {
      const t = y / (S * 0.26), w = S * (0.045 + t * 0.02);
      row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => mix(L.moonLt, L.moonDk, t + Math.abs(tx - 0.5) * 0.4));
    }
    stroke(put, cx - S * 0.045, cy + S * 0.02, cx - S * 0.14, cy + S * 0.14, S * 0.018, () => L.moonDk);
    stroke(put, cx + S * 0.045, cy + S * 0.02, cx + S * 0.14, cy - S * 0.08, S * 0.018, () => L.moon);
    dome(put, cx, cy - S * 0.14, S * 0.1, S * 0.09, L.moon, L.moonLt, L.moonDk);
    ell(put, cx, cy - S * 0.06, S * 0.05, S * 0.03, (tx, ty) => mix(L.moon, L.moonDk, ty));
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.045, cy - S * 0.14, S * 0.032, S * 0.045, () => L.oil);
      put(Math.round(cx + s * S * 0.035), Math.round(cy - S * 0.16), L.holoLt);
    });
    ell(put, cx + S * 0.17, cy - S * 0.11, S * 0.04, S * 0.04, (tx, ty) => mix(L.holoLt, L.holoDk, ty));
    for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.17 + Math.cos(a) * S * 0.06), Math.round(cy - S * 0.11 + Math.sin(a) * S * 0.06), L.holo);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy + S * 0.24, cx + s * S * 0.05, cy + S * 0.34, S * 0.02, () => L.moonDk));
  }
  // #7 · BROOD SAC — pulsing egg; hatches Scuttlers when you get close.
  function drawBroodSac(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.22);
    for (let y = 0; y < S * 0.34; y++) {
      const t = y / (S * 0.34);
      const w = S * (0.06 + Math.sin(Math.min(1, t * 1.1) * Math.PI) * 0.12);
      row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w, (tx) => {
        let b = mix(L.fleshDk, L.flesh, Math.sin(tx * Math.PI));
        b = mix(b, L.voidDk, t * 0.4);
        return b;
      });
    }
    [[-0.05, -0.16, 0.0, -0.02], [0.05, -0.16, 0.0, -0.02], [0.0, -0.18, -0.06, -0.06], [0.0, -0.18, 0.06, -0.06]].forEach(([a, b2, c, d]) =>
      stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.acid));
    ell(put, cx + S * 0.03, cy + S * 0.0, S * 0.05, S * 0.04, (tx, ty) => mix(L.voidDk, L.fleshDk, 0.5 + ty * 0.3));
    [[-0.1, -0.06], [0.08, 0.05], [-0.04, 0.1]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.05, cy + oy * S + S * 0.06, 1, () => L.voidDk));
    [-0.14, -0.05, 0.06, 0.14].forEach(o => stroke(put, cx + o * S, cy + S * 0.16, cx + o * S * 1.6, cy + S * 0.24, S * 0.02, (t) => mix(L.fleshDk, L.voidDk, t)));
    ell(put, cx + S * 0.26, cy + S * 0.2, S * 0.05, S * 0.03, (tx, ty) => mix(L.flesh, L.fleshDk, ty));
  }
  // #8 · SENTRY DRONE — station security flyer; aimed laser bursts.
  function drawSentryDrone(put, S) {
    const cx = S * 0.5, cy = S * 0.46;
    hover(put, cx, S * 0.78, S * 0.12);
    dome(put, cx, cy, S * 0.16, S * 0.08, L.hullMd, L.hull, L.hullDkk);
    plate(put, cx - S * 0.1, cy - S * 0.08, cx + S * 0.1, cy - S * 0.02, L.hullDk, L.hullMd, L.hullDkk);
    optic(put, cx, cy - S * 0.05, S * 0.035, L.redDk, L.red, L.redLt);
    [-1, 1].forEach(s => {
      plate(put, cx + s * S * 0.16 - S * 0.03, cy - S * 0.02, cx + s * S * 0.16 + S * 0.03, cy + S * 0.05, L.steel, L.steelLt, L.steelDkk);
      put(Math.round(cx + s * S * 0.16), Math.round(cy + S * 0.07), L.holo);
    });
    stroke(put, cx, cy + S * 0.06, cx, cy + S * 0.12, S * 0.02, () => L.steelDk);
    stroke(put, cx - S * 0.02, cy + S * 0.13, cx - S * 0.16, cy + S * 0.3, 2, () => L.red);
    stroke(put, cx - S * 0.02, cy + S * 0.13, cx - S * 0.16, cy + S * 0.3, 1, () => L.redLt);
    row(put, Math.round(cy + S * 0.02), cx - S * 0.14, cx + S * 0.14, () => L.warn);
    stroke(put, cx + S * 0.06, cy - S * 0.08, cx + S * 0.1, cy - S * 0.16, 1, () => L.steelDk);
    put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.17), L.red);
  }
  // #9 · HAYWIRE TURRET — wall-mount turret gone rogue; sweeping beam.
  function drawHaywireTurret(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    plate(put, cx - S * 0.2, cy + S * 0.14, cx + S * 0.2, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
    [[-0.16, 0.26], [0.16, 0.26]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.hullDkk));
    stroke(put, cx, cy + S * 0.14, cx - S * 0.04, cy + S * 0.02, S * 0.035, () => L.steelDk);
    bolt(put, cx - S * 0.04, cy + S * 0.0, S * 0.025, L.steel, L.steelDkk);
    plate(put, cx - S * 0.14, cy - S * 0.1, cx + S * 0.08, cy + S * 0.0, L.steel, L.steelLt, L.steelDkk);
    [[-0.02], [0.035]].forEach(([oy]) => stroke(put, cx - S * 0.14, cy - S * 0.05 + oy * S, cx - S * 0.28, cy - S * 0.05 + oy * S, S * 0.018, () => L.steelDk));
    optic(put, cx + S * 0.03, cy - S * 0.05, S * 0.026, L.warnDk, L.warn, L.warnLt);
    [[0.06, -0.14], [-0.06, -0.12]].forEach(([ox, oy]) => { put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.warnLt); put(Math.round(cx + ox * S + 2), Math.round(cy + oy * S - 2), L.warn); });
    for (let a = -0.5; a < 0.3; a += 0.1) {
      const bx = cx - S * 0.28 - Math.cos(a) * S * 0.14, by = cy - S * 0.03 + Math.sin(a) * S * 0.16;
      put(Math.round(bx), Math.round(by), a > 0.1 ? L.redLt : L.redDk);
    }
    stroke(put, cx - S * 0.28, cy - S * 0.032, cx - S * 0.44, cy + S * 0.04, 2, () => L.red);
  }
  // #10 · ASTRO-REVENANT — dead crew in a drifting suit; slow reaching grab.
  function drawAstroRevenant(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    hover(put, cx, S * 0.84, S * 0.1, L.voidDk);
    plate(put, cx - S * 0.1, cy - S * 0.08, cx + S * 0.12, cy + S * 0.14, L.hull, L.hullMd, L.hullDkk);
    plate(put, cx - S * 0.05, cy - S * 0.03, cx + S * 0.05, cy + S * 0.04, L.steelDk, L.steel, L.oil);
    put(Math.round(cx - S * 0.02), Math.round(cy), L.red); put(Math.round(cx + S * 0.02), Math.round(cy), L.holo);
    stroke(put, cx + S * 0.08, cy - S * 0.06, cx + S * 0.16, cy + S * 0.04, 2, () => L.hullDk);
    dome(put, cx, cy - S * 0.17, S * 0.085, S * 0.08, L.hull, '#ffffff', L.hullDk);
    visor(put, cx, cy - S * 0.16, S * 0.06, S * 0.05, '#0e2a1a', L.xenoDk);
    stroke(put, cx - S * 0.03, cy - S * 0.2, cx + S * 0.02, cy - S * 0.12, 1, () => '#ffffff');
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.025), Math.round(cy - S * 0.165), L.xeno));
    stroke(put, cx - S * 0.1, cy - S * 0.02, cx - S * 0.26, cy + S * 0.02, S * 0.035, () => L.hullMd);
    ell(put, cx - S * 0.28, cy + S * 0.03, S * 0.028, S * 0.024, () => L.hullDk);
    stroke(put, cx + S * 0.12, cy + S * 0.0, cx + S * 0.24, cy - S * 0.06, S * 0.035, () => L.hullDk);
    stroke(put, cx - S * 0.02, cy + S * 0.14, cx - S * 0.06, cy + S * 0.3, S * 0.032, () => L.hullMd);
    stroke(put, cx + S * 0.06, cy + S * 0.14, cx + S * 0.1, cy + S * 0.26, S * 0.028, () => L.hullDk);
    ell(put, cx - S * 0.065, cy + S * 0.32, S * 0.03, S * 0.02, () => L.oil);
    plate(put, cx - S * 0.09, cy - S * 0.06, cx - S * 0.05, cy - S * 0.03, L.red, L.redLt, L.redDk);
  }
  // #11 · MAGNETRON — floating magnet-core; PULLS you toward it.
  function drawMagnetron(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    hover(put, cx, S * 0.8, S * 0.11);
    ell(put, cx, cy, S * 0.14, S * 0.14, (tx, ty) => mix(L.steelLt, L.steelDkk, ty));
    ell(put, cx, cy, S * 0.08, S * 0.08, (tx, ty) => mix(L.holoLt, L.holoDk, ty));
    plate(put, cx - S * 0.2, cy - S * 0.06, cx - S * 0.1, cy + S * 0.06, L.red, L.redLt, L.redDk);
    plate(put, cx + S * 0.1, cy - S * 0.06, cx + S * 0.2, cy + S * 0.06, L.holoDk, L.holo, L.visor);
    [-1, 1].forEach(s => {
      for (let a = -0.8; a <= 0.8; a += 0.4) {
        for (let t = 0; t < 1; t += 0.12) {
          const px = cx + s * (S * 0.4 - t * S * 0.2), py = cy + a * S * (0.24 - t * 0.12);
          put(Math.round(px), Math.round(py), t > 0.7 ? L.holoLt : L.holoDk);
        }
      }
    });
    [[0.32, -0.14], [-0.34, 0.1]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, L.steel, L.steelLt, L.steelDkk));
    put(Math.round(cx), Math.round(cy - S * 0.02), '#ffffff');
  }
  // #12 · LUNA LEAPER — bounding alien; sails in low-grav arcs onto marks.
  function drawLunaLeaper(put, S) {
    const cx = S * 0.5, cy = S * 0.42;
    ell(put, cx + S * 0.14, S * 0.86, S * 0.1, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? L.warn : null; });
    chitin(put, cx, cy, S * 0.12, S * 0.1, L.void, L.voidLt, L.voidDk);
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.08, cy + S * 0.05, cx + s * S * 0.2, cy - S * 0.02, S * 0.035, () => L.voidDk);
      stroke(put, cx + s * S * 0.2, cy - S * 0.02, cx + s * S * 0.16, cy + S * 0.12, S * 0.03, () => L.voidDk);
      [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.16, cy + S * 0.12, cx + s * S * 0.16 + k * S * 0.02, cy + S * 0.16, 1, () => L.voidLt));
    });
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy - S * 0.04, cx + s * S * 0.12, cy - S * 0.1, S * 0.02, () => L.voidDk));
    dome(put, cx, cy - S * 0.1, S * 0.08, S * 0.06, L.void, L.voidLt, L.voidDk);
    stroke(put, cx - S * 0.05, cy - S * 0.075, cx + S * 0.05, cy - S * 0.075, 1, () => L.oil);
    [-1, 1].forEach(s => { ell(put, cx + s * S * 0.045, cy - S * 0.125, S * 0.02, S * 0.022, () => L.acid); put(Math.round(cx + s * S * 0.045), Math.round(cy - S * 0.13), L.oil); });
    for (let t = 0.1; t < 0.9; t += 0.14) put(Math.round(cx - S * 0.16 - t * S * 0.2), Math.round(cy + S * 0.1 + t * t * S * 0.3), L.voidLt);
  }
  // #18 · ORBITAL MINE — drifting proximity bomb; beeps, then BOOM.
  function drawOrbitalMine(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    hover(put, cx, S * 0.8, S * 0.1, L.redDk);
    dome(put, cx, cy, S * 0.14, S * 0.14, L.steelDk, L.steel, L.steelDkk);
    for (let a = 0; a < 6.28; a += 0.785) {
      const sx = cx + Math.cos(a) * S * 0.14, sy = cy + Math.sin(a) * S * 0.14;
      stroke(put, sx, sy, cx + Math.cos(a) * S * 0.21, cy + Math.sin(a) * S * 0.21, S * 0.022, (t) => mix(L.steel, L.steelDkk, t));
      put(Math.round(cx + Math.cos(a) * S * 0.22), Math.round(cy + Math.sin(a) * S * 0.22), L.warn);
    }
    optic(put, cx, cy - S * 0.02, S * 0.035, L.redDk, L.red, L.redLt);
    row(put, Math.round(cy + S * 0.06), cx - S * 0.1, cx + S * 0.1, () => L.warn);
    for (let a = 0; a < 6.28; a += 0.22) put(Math.round(cx + Math.cos(a) * S * 0.34), Math.round(cy + Math.sin(a) * S * 0.3), (a * 7 | 0) % 2 ? L.redDk : null);
    [[0.2, -0.26], [0.26, -0.2]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S - S * 0.03, 1, () => L.redLt));
  }
  // #20 · STAR HORROR — elite void tentacle beast; sweep cones.
  function drawStarHorror(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    hover(put, cx, S * 0.84, S * 0.14, L.voidDk);
    chitin(put, cx, cy, S * 0.16, S * 0.14, '#2c1c4c', L.void, L.oil);
    let seed = 9; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < 10; i++) {
      const a = rnd() * 6.28, r = rnd() * S * 0.1;
      put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.85), rnd() > 0.5 ? '#ffffff' : L.voidLt);
    }
    optic(put, cx, cy - S * 0.02, S * 0.05, L.voidDk, L.warn, L.warnLt);
    for (let a = 0.3; a < 6.3; a += 0.785) {
      let px = cx + Math.cos(a) * S * 0.15, py = cy + Math.sin(a) * S * 0.13;
      let ang = a;
      for (let seg = 0; seg < 5; seg++) {
        const nx = px + Math.cos(ang) * S * 0.055, ny = py + Math.sin(ang) * S * 0.05;
        stroke(put, px, py, nx, ny, S * (0.03 - seg * 0.004), (t) => mix(L.void, '#2c1c4c', t + seg * 0.15));
        px = nx; py = ny; ang += 0.45;
      }
      put(Math.round(px), Math.round(py), L.voidLt);
    }
    [[-0.1, 0.16], [0.12, 0.18]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.06, 1, () => L.voidDk));
  }

  // ============= BOSS: SPECIMEN ZERO · THE OVERMIND (canon final) ===========
  function drawOvermind(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    hover(put, cx, S * 0.9, S * 0.18, L.voidDk);
    ell(put, cx, S * 0.885, S * 0.11, S * 0.03, () => L.void);
    // dangling cable-tentacles (torn loose from the floor)
    [[-0.16, 0.3, -0.26, 0.42], [-0.06, 0.32, -0.08, 0.46], [0.08, 0.32, 0.14, 0.44], [0.18, 0.3, 0.28, 0.4]].forEach(([a, b2, c, d], i) => {
      for (let t = 0; t < 1; t += 0.09) {
        const px = cx + lerp(a, c, t) * S + Math.sin(t * 6 + i) * S * 0.015;
        const py = cy + lerp(b2, d, t) * S;
        ell(put, px, py, S * (0.02 - t * 0.008), S * 0.016, (tx, ty) => mix(L.steelDk, L.oil, ty + t * 0.3));
      }
      put(Math.round(cx + c * S), Math.round(cy + d * S), i % 2 ? L.holo : L.warn);
    });
    // tank base collar + cap
    plate(put, cx - S * 0.2, cy + S * 0.22, cx + S * 0.2, cy + S * 0.32, L.steel, L.steelLt, L.steelDkk);
    row(put, Math.round(cy + S * 0.25), cx - S * 0.2, cx + S * 0.2, () => L.warn);
    plate(put, cx - S * 0.18, cy - S * 0.38, cx + S * 0.18, cy - S * 0.28, L.steel, L.steelLt, L.steelDkk);
    [[-0.12], [0.0], [0.12]].forEach(([o], i) => put(Math.round(cx + o * S), Math.round(cy - S * 0.33), [L.holo, L.red, L.holo][i]));
    [[-0.08], [0.08]].forEach(([o]) => { stroke(put, cx + o * S, cy - S * 0.38, cx + o * S + S * 0.02, cy - S * 0.46, 1, () => L.holoDk); });
    // glass cylinder w/ murky fluid
    for (let y = Math.round(cy - S * 0.28); y < cy + S * 0.22; y++) {
      const t = (y - (cy - S * 0.28)) / (S * 0.5);
      row(put, y, cx - S * 0.17, cx + S * 0.17, (tx) => {
        let b = mix(L.visorLt, L.visor, Math.abs(tx - 0.5) * 2);
        b = mix(b, '#0e3a2a', 0.45);
        if (tx < 0.12) b = mix(b, '#ffffff', 0.25);
        if (Math.sin(t * 20 + tx * 6) > 0.92) b = mix(b, '#4a8a6a', 0.4);
        return b;
      });
    }
    [[-0.1, 0.14], [-0.08, 0.02], [0.11, 0.1], [0.09, -0.06], [0.0, 0.18]].forEach(([ox, oy]) => {
      ell(put, cx + ox * S, cy + oy * S, S * 0.012, S * 0.012, () => '#7ac2a0');
    });
    // THE BRAIN — huge, wrinkled, veined with psychic light
    dome(put, cx, cy - S * 0.08, S * 0.14, S * 0.13, L.flesh, mix(L.flesh, '#ffffff', 0.45), L.fleshDk);
    dome(put, cx - S * 0.07, cy - S * 0.14, S * 0.07, S * 0.055, mix(L.flesh, '#ffffff', 0.3), '#ffffff', L.fleshDk);
    dome(put, cx + S * 0.07, cy - S * 0.13, S * 0.065, S * 0.05, L.flesh, mix(L.flesh, '#ffffff', 0.4), L.fleshDk);
    [[-0.1, -0.12, -0.02, -0.04], [-0.04, -0.18, 0.04, -0.08], [0.03, -0.05, 0.11, -0.13], [-0.09, -0.02, 0.0, 0.02]].forEach(([a, b2, c, d]) =>
      stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 2, () => L.fleshDk));
    [[-0.11, -0.08, -0.05, -0.15], [0.06, -0.16, 0.11, -0.07], [-0.02, -0.01, 0.05, -0.06]].forEach(([a, b2, c, d]) =>
      stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.voidLt));
    stroke(put, cx, cy + S * 0.04, cx - S * 0.02, cy + S * 0.18, S * 0.03, (t) => mix(L.fleshDk, '#0e3a2a', t));
    // the grafted EYE — lidless, violet, wired in
    ell(put, cx, cy + S * 0.05, S * 0.065, S * 0.06, () => L.fleshDk);
    optic(put, cx, cy + S * 0.05, S * 0.048, L.voidDk, L.void, L.voidLt);
    [[-0.06, 0.04], [0.06, 0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S * 2, cy + oy * S + S * 0.04, 1, () => L.steelDk));
    // THE CRACK — long fracture down the glass, fluid weeping out
    stroke(put, cx + S * 0.09, cy - S * 0.26, cx + S * 0.14, cy - S * 0.08, 1, () => '#ffffff');
    stroke(put, cx + S * 0.14, cy - S * 0.08, cx + S * 0.12, cy + S * 0.08, 1, () => '#dcecff');
    stroke(put, cx + S * 0.12, cy + S * 0.06, cx + S * 0.16, cy - S * 0.02, 1, () => '#dcecff');
    stroke(put, cx + S * 0.13, cy + S * 0.08, cx + S * 0.15, cy + S * 0.24, 1, () => '#4a8a6a');
    ell(put, cx + S * 0.16, cy + S * 0.3, S * 0.04, S * 0.014, () => '#2a5a44');
    // psychic halo rings + orbiting telekinetic debris
    for (let a = 0; a < 6.28; a += 0.14) {
      const px = cx + Math.cos(a) * S * 0.32, py = cy - S * 0.04 + Math.sin(a) * S * 0.28;
      if ((a * 9 | 0) % 2 === 0) put(Math.round(px), Math.round(py), L.voidLt);
    }
    [[-0.36, -0.2, 0.025], [0.38, -0.1, 0.02], [-0.32, 0.14, 0.018], [0.3, 0.26, 0.022]].forEach(([ox, oy, r]) => {
      dome(put, cx + ox * S, cy + oy * S, r * S, r * S * 0.8, L.steel, L.steelLt, L.steelDkk);
      for (let a = 0; a < 6.28; a += 1.2) put(Math.round(cx + ox * S + Math.cos(a) * S * 0.035), Math.round(cy + oy * S + Math.sin(a) * S * 0.03), L.voidDk);
    });
    star(put, Math.round(cx - S * 0.4), Math.round(cy - S * 0.34), L.voidLt);
    star(put, Math.round(cx + S * 0.42), Math.round(cy + S * 0.06), L.voidLt);
  }

  // ======================= DECOR (ALL 20) ===================================
  function drawLander(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.28);
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.12, cy + S * 0.08, cx + s * S * 0.26, cy + S * 0.28, S * 0.02, () => L.steel);
      ell(put, cx + s * S * 0.27, cy + S * 0.3, S * 0.05, S * 0.02, (tx, ty) => mix(L.steelLt, L.steelDk, ty));
    });
    for (let y = 0; y < S * 0.14; y++) row(put, Math.round(cy + y), cx - S * 0.18, cx + S * 0.18, (tx) => {
      const crinkle = Math.sin(tx * 22 + y * 3) > 0.2;
      return mix(crinkle ? L.foilLt : L.foil, L.foilDk, y / (S * 0.14) * 0.6);
    });
    plate(put, cx - S * 0.12, cy - S * 0.18, cx + S * 0.12, cy + S * 0.0, L.hullMd, L.hull, L.hullDkk);
    dome(put, cx, cy - S * 0.2, S * 0.1, S * 0.05, L.hullMd, L.hull, L.hullDk);
    visor(put, cx + S * 0.05, cy - S * 0.1, S * 0.03, S * 0.028);
    plate(put, cx - S * 0.08, cy - S * 0.1, cx - S * 0.01, cy - S * 0.02, L.hullDk, L.hullMd, L.hullDkk);
    stroke(put, cx, cy - S * 0.24, cx, cy - S * 0.32, 1, () => L.steel);
    put(Math.round(cx), Math.round(cy - S * 0.33), L.red);
    for (let y = 0; y < S * 0.05; y++) row(put, Math.round(cy + S * 0.14 + y), cx - S * 0.04 - y * 0.5, cx + S * 0.04 + y * 0.5, (tx) => mix(L.steelDk, L.steelDkk, tx));
  }
  function drawRover(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.26);
    [-0.18, 0.16].forEach(o => {
      const wx = cx + o * S;
      ell(put, wx, cy + S * 0.12, S * 0.08, S * 0.08, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.14 && d <= 0.25 ? L.steelDk : null; });
      for (let a = 0; a < 6.28; a += 0.6) stroke(put, wx, cy + S * 0.12, wx + Math.cos(a) * S * 0.07, cy + S * 0.12 + Math.sin(a) * S * 0.07, 1, () => L.steel);
    });
    plate(put, cx - S * 0.24, cy - S * 0.0, cx + S * 0.24, cy + S * 0.06, L.foil, L.foilLt, L.foilDk);
    plate(put, cx - S * 0.1, cy - S * 0.12, cx - S * 0.02, cy - S * 0.0, L.hullMd, L.hull, L.hullDkk);
    plate(put, cx + S * 0.08, cy - S * 0.08, cx + S * 0.18, cy - S * 0.0, L.steelDk, L.steel, L.steelDkk);
    put(Math.round(cx + S * 0.12), Math.round(cy - S * 0.05), L.holo);
    stroke(put, cx - S * 0.2, cy - S * 0.0, cx - S * 0.24, cy - S * 0.14, 1, () => L.steel);
    dome(put, cx - S * 0.25, cy - S * 0.16, S * 0.035, S * 0.02, L.hull, '#ffffff', L.hullDk);
    [[-0.34, 0.2], [-0.4, 0.21]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S, 1, () => L.moonDk));
  }
  function drawFlag(put, S) {
    const cx = S * 0.46;
    shadow(put, S, cx + S * 0.06, S * 0.1);
    dome(put, cx, S * 0.84, S * 0.08, S * 0.03, L.moon, L.moonLt, L.moonDkk);
    stroke(put, cx, S * 0.24, cx, S * 0.84, S * 0.016, () => L.steelLt);
    stroke(put, cx, S * 0.24, cx + S * 0.24, S * 0.24, S * 0.012, () => L.steel);
    for (let y = 0; y < S * 0.16; y++) {
      const t = y / (S * 0.16);
      row(put, Math.round(S * 0.25 + y), cx + S * 0.01, cx + S * 0.24 - (t > 0.8 ? (t - 0.8) * S * 0.2 : 0), (tx) => {
        let b = mix(L.hull, L.hullMd, t + tx * 0.2);
        if (Math.floor(t * 5) % 2 === 0 && tx > 0.4) b = mix(L.redLt, L.hullMd, 0.5);
        if (tx < 0.35 && t < 0.5) b = mix(L.visorLt, L.hullMd, 0.4);
        return b;
      });
    }
    star(put, Math.round(cx + S * 0.06), Math.round(S * 0.29), '#ffffff');
    [[0.14, 0.88], [0.22, 0.85], [0.3, 0.88]].forEach(([ox, oy]) => ell(put, S * 0.36 + ox * S, S * oy, S * 0.02, S * 0.01, () => L.moonDkk));
  }
  function drawCryoPods(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.3);
    [[-0.24, false], [0.0, true], [0.24, false]].forEach(([o, open]) => {
      const px = cx + o * S;
      for (let y = 0; y < S * 0.4; y++) {
        const t = y / (S * 0.4);
        const w = S * (0.055 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.035);
        row(put, Math.round(cy - S * 0.2 + y), px - w, px + w, (tx) => mix(L.hull, L.hullDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.6));
      }
      if (open) {
        for (let y = 0; y < S * 0.28; y++) {
          const t = y / (S * 0.28), w = S * (0.035 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.022);
          row(put, Math.round(cy - S * 0.14 + y), px - w, px + w, () => mix(L.space, L.oil, t));
        }
        ell(put, px, cy + S * 0.22, S * 0.06, S * 0.02, () => mix(L.holoLt, L.hullMd, 0.6));
        put(Math.round(px - 2), Math.round(cy - S * 0.02), L.xeno);
      } else {
        visor(put, px, cy - S * 0.05, S * 0.035, S * 0.09, '#12303a', L.holoDk);
        ell(put, px, cy - S * 0.03, S * 0.02, S * 0.05, () => mix(L.visor, L.oil, 0.4));
        put(Math.round(px), Math.round(cy + S * 0.14), L.holo);
      }
    });
  }
  function drawConsole(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.24, cy - S * 0.04, cx + S * 0.24, cy + S * 0.16, L.hullMd, L.hull, L.hullDkk);
    for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy - S * 0.12 + y), cx - S * 0.24 + y * 0.4, cx + S * 0.24 - y * 0.4, (tx) => mix(L.steelDk, L.steel, y / (S * 0.08) * 0.5 + Math.abs(tx - 0.5) * 0.2));
    plate(put, cx - S * 0.2, cy - S * 0.1, cx - S * 0.04, cy - S * 0.02, L.visor, L.visorLt, L.oil);
    [[-0.18, -0.07], [-0.12, -0.05], [-0.08, -0.08]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S, 1, () => L.holo));
    plate(put, cx + S * 0.04, cy - S * 0.1, cx + S * 0.2, cy - S * 0.02, '#2a1414', L.redDk, L.oil);
    stroke(put, cx + S * 0.06, cy - S * 0.055, cx + S * 0.18, cy - S * 0.055, 1, () => L.red);
    for (let r = 0; r < 2; r++) for (let c2 = 0; c2 < 8; c2++)
      put(Math.round(cx - S * 0.17 + c2 * S * 0.05), Math.round(cy + S * 0.04 + r * S * 0.05), [L.holo, L.warn, L.red, L.xeno][((r * 8 + c2) * 7) % 4]);
    [[0.22, 0.0], [0.25, -0.03]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.warnLt));
  }
  function drawHoloTable(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.24);
    ell(put, cx, cy + S * 0.08, S * 0.18, S * 0.06, (tx, ty) => mix(L.steelLt, L.steelDkk, ty + Math.abs(tx - 0.5) * 0.3));
    plate(put, cx - S * 0.06, cy + S * 0.1, cx + S * 0.06, cy + S * 0.22, L.steelDk, L.steel, L.steelDkk);
    ell(put, cx, cy + S * 0.06, S * 0.14, S * 0.04, () => L.visor);
    for (let y = 0; y < S * 0.3; y++) {
      const t = 1 - y / (S * 0.3);
      row(put, Math.round(cy + S * 0.04 - y), cx - S * 0.14 * t - S * 0.02, cx + S * 0.14 * t + S * 0.02, (tx) => {
        if ((tx * 8 + y * 0.5) % 1 < 0.4) return mix(L.holo, L.space, 0.55 + t * 0.15);
        return null;
      });
    }
    [[-0.06, -0.14], [0.04, -0.18], [0.0, -0.1]].forEach(([ox, oy]) => plate(put, cx + ox * S - S * 0.02, cy + oy * S - S * 0.015, cx + ox * S + S * 0.02, cy + oy * S + S * 0.015, L.holoLt, '#ffffff', L.holoDk));
    stroke(put, cx - S * 0.06, cy - S * 0.14, cx + S * 0.04, cy - S * 0.18, 1, () => L.holoLt);
    put(Math.round(cx + S * 0.04), Math.round(cy - S * 0.22), L.red);
  }
  function drawCargoStack(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.26);
    panel(put, cx - S * 0.22, cy - S * 0.04, cx + S * 0.04, cy + S * 0.2);
    panel(put, cx - S * 0.16, cy - S * 0.22, cx - S * 0.0, cy - S * 0.04);
    stroke(put, cx - S * 0.09, cy - S * 0.04, cx - S * 0.09, cy + S * 0.2, 2, () => L.warn);
    stroke(put, cx - S * 0.08, cy - S * 0.22, cx - S * 0.08, cy - S * 0.04, 2, () => L.warnDk);
    plate(put, cx - S * 0.2, cy + S * 0.0, cx - S * 0.14, cy + S * 0.04, L.holoDk, L.holo, L.visor);
    for (let y = 0; y < S * 0.22; y++) {
      const t = y / (S * 0.22), w = S * (0.07 + Math.sin(t * Math.PI) * 0.012);
      row(put, Math.round(cy - S * 0.0 + y), cx + S * 0.14 - w + S * 0.02, cx + S * 0.14 + w + S * 0.02, (tx) => mix(L.hull, L.hullDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    [0.04, 0.16].forEach(yy => row(put, Math.round(cy + yy * S), cx + S * 0.08, cx + S * 0.24, () => L.holoDk));
    stroke(put, cx + S * 0.16, cy - S * 0.04, cx + S * 0.16, cy - S * 0.0, 2, () => L.steelDk);
    put(Math.round(cx + S * 0.14), Math.round(cy + S * 0.1), L.visor); put(Math.round(cx + S * 0.18), Math.round(cy + S * 0.1), L.visor);
  }
  function drawO2Rack(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.24, cy - S * 0.2, cx + S * 0.24, cy + S * 0.24, L.steelDk, L.steel, L.steelDkk);
    [[-0.16, true], [-0.05, true], [0.06, false], [0.17, true]].forEach(([o, full]) => {
      const px = cx + o * S;
      for (let y = 0; y < S * 0.32; y++) {
        const t = y / (S * 0.32), w = S * (0.032 + Math.sin(Math.min(1, t * 1.2) * Math.PI) * 0.012);
        row(put, Math.round(cy - S * 0.14 + y), px - w, px + w, (tx) => mix(full ? L.hull : L.hullDk, full ? L.hullDk : L.steelDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
      }
      dome(put, px, cy - S * 0.16, S * 0.018, S * 0.014, L.steel, L.steelLt, L.steelDkk);
      put(Math.round(px), Math.round(cy + S * 0.2), full ? L.holo : L.red);
    });
    [[-0.02], [0.12]].forEach(([oy]) => row(put, Math.round(cy + oy * S), cx - S * 0.22, cx + S * 0.22, () => L.steelDkk));
  }
  function drawSolarArray(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.2);
    stroke(put, cx, cy + S * 0.02, cx, cy + S * 0.32, S * 0.02, () => L.steel);
    plate(put, cx - S * 0.08, cy + S * 0.3, cx + S * 0.08, cy + S * 0.34, L.steelDk, L.steel, L.steelDkk);
    for (let y = 0; y < S * 0.24; y++) {
      const t = y / (S * 0.24), off = t * S * 0.1;
      row(put, Math.round(cy - S * 0.22 + y), cx - S * 0.26 + off, cx + S * 0.2 + off, (tx) => {
        let b = mix('#1c3a6e', '#0e2044', t * 0.4 + Math.abs(tx - 0.5) * 0.2);
        if ((tx * 6) % 1 < 0.08 || (t * 4) % 1 < 0.1) b = L.steelLt;
        if (tx > 0.7 && t < 0.3) b = mix(b, '#ffffff', 0.35);
        return b;
      });
    }
    [[0.05, -0.12], [0.09, -0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.oil));
    stroke(put, cx + S * 0.03, cy - S * 0.14, cx + S * 0.11, cy - S * 0.07, 1, () => L.oil);
  }
  function drawCommsDish(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.22);
    plate(put, cx - S * 0.1, cy + S * 0.2, cx + S * 0.1, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
    stroke(put, cx, cy + S * 0.2, cx - S * 0.06, cy - S * 0.02, S * 0.025, () => L.steel);
    ell(put, cx - S * 0.08, cy - S * 0.14, S * 0.2, S * 0.13, (tx, ty) => {
      let b = mix(L.hull, L.hullDk, (1 - ty) * 0.7 + Math.abs(tx - 0.5) * 0.3);
      if (((tx * 7) % 1 < 0.08) || ((ty * 5) % 1 < 0.1)) b = L.hullMd;
      return b;
    });
    stroke(put, cx - S * 0.08, cy - S * 0.14, cx + S * 0.04, cy - S * 0.26, S * 0.014, () => L.steelDk);
    ell(put, cx + S * 0.05, cy - S * 0.27, S * 0.02, S * 0.02, (tx, ty) => mix(L.warnLt, L.warnDk, ty));
    [[0.16, -0.34, 0.03], [0.22, -0.4, 0.05], [0.28, -0.46, 0.07]].forEach(([ox, oy, r]) => {
      for (let a = -0.8; a < 0.8; a += 0.3) put(Math.round(cx + ox * S + Math.cos(a) * r * S), Math.round(cy + oy * S + Math.sin(a) * r * S), L.holoDk);
    });
  }
  function drawAirlock(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    plate(put, cx - S * 0.26, cy - S * 0.28, cx + S * 0.26, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
    dome(put, cx, cy, S * 0.18, S * 0.18, L.steel, L.steelLt, L.steelDkk);
    for (let a = 0; a < 6.28; a += 0.785) bolt(put, cx + Math.cos(a) * S * 0.15, cy + Math.sin(a) * S * 0.15, S * 0.014, L.steelLt, L.steelDkk);
    for (let a = 0; a < 6.28; a += 0.1) put(Math.round(cx + Math.cos(a) * S * 0.07), Math.round(cy + Math.sin(a) * S * 0.07), L.warn);
    [0, 1.05, 2.1].forEach(a => stroke(put, cx - Math.cos(a) * S * 0.06, cy - Math.sin(a) * S * 0.06, cx + Math.cos(a) * S * 0.06, cy + Math.sin(a) * S * 0.06, 2, () => L.warnDk));
    visor(put, cx, cy - S * 0.11, S * 0.035, S * 0.03);
    for (let x = -0.24; x < 0.26; x += 0.04) { put(Math.round(cx + x * S), Math.round(cy - S * 0.26), (x * 25 | 0) % 2 ? L.warn : L.oil); put(Math.round(cx + x * S), Math.round(cy + S * 0.28), (x * 25 | 0) % 2 ? L.warn : L.oil); }
    put(Math.round(cx + S * 0.2), Math.round(cy - S * 0.2), L.red);
    put(Math.round(cx - S * 0.2), Math.round(cy - S * 0.2), L.holo);
  }
  function drawBeacon(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.12);
    stroke(put, cx, S * 0.4, cx, S * 0.84, S * 0.02, () => L.steelDk);
    plate(put, cx - S * 0.07, S * 0.82, cx + S * 0.07, S * 0.86, L.steel, L.steelLt, L.steelDkk);
    plate(put, cx - S * 0.05, S * 0.3, cx + S * 0.05, S * 0.4, L.steelDk, L.steel, L.steelDkk);
    dome(put, cx, S * 0.28, S * 0.05, S * 0.05, L.red, L.redLt, L.redDk);
    put(Math.round(cx - 1), Math.round(S * 0.26), '#ffffff');
    [-1, 1].forEach(s => {
      for (let t = 0; t < 1; t += 0.14) {
        const w = t * S * 0.05;
        stroke(put, cx + s * (S * 0.05 + t * S * 0.24), S * 0.29 - w, cx + s * (S * 0.05 + t * S * 0.24), S * 0.29 + w, 1, () => (t > 0.6 ? L.redDk : L.red));
      }
    });
    [[0.34, 0.32], [-0.36, 0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(S * oy), L.redLt));
  }
  function drawHydroponics(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.26, cy - S * 0.02, cx + S * 0.26, cy + S * 0.1, L.hullMd, L.hull, L.hullDkk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.2, cy + S * 0.1, cx + s * S * 0.2, cy + S * 0.24, S * 0.02, () => L.steelDk));
    stroke(put, cx - S * 0.24, cy - S * 0.24, cx + S * 0.24, cy - S * 0.24, S * 0.02, () => L.steelDk);
    for (let x = -0.2; x < 0.22; x += 0.08) put(Math.round(cx + x * S), Math.round(cy - S * 0.22), '#d88aff');
    [[-0.2], [-0.12]].forEach(([o]) => {
      stroke(put, cx + o * S, cy - S * 0.02, cx + o * S, cy - S * 0.1, 1, () => '#4a8a3a');
      ell(put, cx + o * S, cy - S * 0.11, S * 0.025, S * 0.02, (tx, ty) => mix('#7ac25a', '#3a6e2c', ty));
    });
    [[0.02, 0.14], [0.12, 0.1], [0.2, 0.16]].forEach(([o, hgt]) => {
      for (let t = 0; t < 1; t += 0.08) {
        const vx = cx + o * S + Math.sin(t * 9) * S * 0.02, vy = cy - S * 0.02 - t * hgt * S * 2;
        ell(put, vx, vy, S * 0.014, S * 0.012, (tx, ty) => mix(L.void, L.voidDk, ty + t * 0.3));
      }
      ell(put, cx + o * S, cy - S * 0.02 - hgt * S * 2, S * 0.025, S * 0.02, (tx, ty) => mix(L.acid, L.acidDk, ty));
    });
    stroke(put, cx + S * 0.24, cy + S * 0.04, cx + S * 0.32, cy + S * 0.2, S * 0.018, (t) => mix(L.voidDk, L.void, t));
  }
  function drawHiveResin(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    chitin(put, cx, cy + S * 0.08, S * 0.26, S * 0.18, '#3a2c50', L.void, L.oil);
    chitin(put, cx - S * 0.12, cy - S * 0.06, S * 0.14, S * 0.12, '#3a2c50', L.void, L.oil);
    [[-0.2, -0.12, 0.16, -0.26], [0.0, -0.16, 0.26, -0.1]].forEach(([a, b2, c, d]) => {
      for (let t = 0; t < 1; t += 0.07) {
        const px = lerp(cx + a * S, cx + c * S, t), py = lerp(cy + b2 * S, cy + d * S, t) - Math.sin(t * Math.PI) * S * 0.1;
        ell(put, px, py, S * 0.022, S * 0.018, (tx, ty) => mix(L.void, '#2a1c40', ty + (t * 5 % 1) * 0.3));
      }
    });
    [[-0.08, 0.04], [0.1, 0.1], [0.02, -0.04], [0.18, 0.0]].forEach(([ox, oy]) => {
      ell(put, cx + ox * S, cy + oy * S, S * 0.028, S * 0.024, (tx, ty) => mix(L.acid, L.acidDk, ty));
      put(Math.round(cx + ox * S - 1), Math.round(cy + oy * S - 1), L.xenoLt);
    });
    plate(put, cx + S * 0.16, cy + S * 0.14, cx + S * 0.28, cy + S * 0.22, L.hullDk, L.hullMd, L.hullDkk);
    stroke(put, cx + S * 0.16, cy + S * 0.14, cx + S * 0.1, cy + S * 0.1, S * 0.03, () => '#3a2c50');
  }
  function drawCrashedProbe(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    dome(put, cx, cy + S * 0.1, S * 0.28, S * 0.08, L.moon, L.moonLt, L.moonDkk);
    [[-0.3, 0.04], [0.32, 0.06], [-0.2, -0.04]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.moonDk));
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const px = lerp(cx - S * 0.06, cx + S * 0.14, t), py = lerp(cy + S * 0.08, cy - S * 0.2, t);
      ell(put, px, py, S * (0.09 - t * 0.02), S * 0.05, (tx, ty) => {
        let b = mix(L.foil, L.foilDk, ty + t * 0.2);
        if (Math.sin(tx * 12 + i) > 0.5) b = mix(b, L.foilLt, 0.4);
        return b;
      });
    }
    ell(put, cx - S * 0.26, cy - S * 0.02, S * 0.09, S * 0.05, (tx, ty) => mix(L.hull, L.hullDk, (1 - ty) * 0.6));
    stroke(put, cx + S * 0.14, cy - S * 0.22, cx + S * 0.22, cy - S * 0.3, 1, () => L.steel);
    stroke(put, cx + S * 0.22, cy - S * 0.3, cx + S * 0.28, cy - S * 0.28, 1, () => L.steelDk);
    put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.14), L.red);
  }
  function drawCrater(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    ell(put, cx, cy, S * 0.3, S * 0.15, (tx, ty) => {
      const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
      if (d > 0.55 && d <= 1) return mix(L.moonLt, L.moonDk, ty);
      return null;
    });
    ell(put, cx, cy + S * 0.01, S * 0.22, S * 0.1, (tx, ty) => mix(L.moonDk, L.moonDkk, (1 - ty) * 0.4 + 0.3));
    ell(put, cx + S * 0.03, cy + S * 0.03, S * 0.12, S * 0.05, () => L.moonDkk);
    for (let a = 0; a < 6.28; a += 0.55) {
      const rr = S * (0.32 + (a * 7 % 1) * 0.06);
      stroke(put, cx + Math.cos(a) * S * 0.28, cy + Math.sin(a) * S * 0.14, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5, 1, () => L.moonLt);
    }
    dome(put, cx - S * 0.05, cy + S * 0.02, S * 0.03, S * 0.02, L.moonDk, L.moon, L.moonDkk);
  }
  function drawMoonRocks(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.28);
    const h = (n) => { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); };
    [[-0.12, 0.0, 0.16, 0.12], [0.1, 0.04, 0.12, 0.09], [-0.02, -0.12, 0.1, 0.08], [0.22, -0.02, 0.07, 0.05]].forEach(([ox, oy, rx, ry]) => {
      ell(put, cx + ox * S, cy + oy * S, rx * S, ry * S, (tx, ty) => {
        let b = mix(L.moonLt, L.moonDk, clamp(ty * 1.2, 0, 1));
        if (h(tx * 9 + ty * 7 + ox * 20) > 0.8) b = mix(b, L.moonDkk, 0.4);
        if (tx < 0.2 && ty < 0.35) b = mix(b, '#ffffff', 0.3);
        return b;
      });
    });
    [[-0.14, -0.02], [-0.1, 0.02], [-0.06, 0.05]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.holoLt));
  }
  function drawLabBench(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.26, cy - S * 0.0, cx + S * 0.26, cy + S * 0.08, L.hull, '#ffffff', L.hullDk);
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.2 - S * 0.02, cy + S * 0.08, cx + s * S * 0.2 + S * 0.02, cy + S * 0.24, L.steelDk, L.steel, L.steelDkk));
    stroke(put, cx - S * 0.16, cy - S * 0.0, cx - S * 0.13, cy - S * 0.12, S * 0.02, () => L.steelDk);
    stroke(put, cx - S * 0.13, cy - S * 0.12, cx - S * 0.16, cy - S * 0.16, S * 0.016, () => L.steel);
    ell(put, cx - S * 0.16, cy - S * 0.02, S * 0.035, S * 0.014, () => L.steelDkk);
    visor(put, cx + S * 0.0, cy - S * 0.08, S * 0.035, S * 0.06, '#0e3020', L.xenoDk);
    ell(put, cx + S * 0.0, cy - S * 0.07, S * 0.014, S * 0.018, (tx, ty) => mix(L.xeno, L.xenoDkk, ty));
    plate(put, cx - S * 0.025, cy - S * 0.15, cx + S * 0.025, cy - S * 0.13, L.steel, L.steelLt, L.steelDkk);
    [[0.12, -0.05], [0.16, -0.08], [0.14, -0.02]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S + S * 0.03, 1, () => L.holoLt));
    ell(put, cx + S * 0.14, cy - S * 0.0, S * 0.03, S * 0.01, () => '#1c4030');
    [[0.2, 0.04], [0.26, 0.1], [0.3, 0.18]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.012, S * 0.008, () => L.acidDk));
    plate(put, cx - S * 0.06, cy + S * 0.01, cx + S * 0.02, cy + S * 0.05, L.visor, L.visorLt, L.oil);
    stroke(put, cx - S * 0.05, cy + S * 0.03, cx + S * 0.01, cy + S * 0.03, 1, () => L.holo);
  }
  function drawJumpPad(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    ell(put, cx, cy, S * 0.22, S * 0.09, (tx, ty) => mix(L.steelLt, L.steelDkk, ty + Math.abs(tx - 0.5) * 0.3));
    ell(put, cx, cy - S * 0.015, S * 0.17, S * 0.06, (tx, ty) => mix(L.visor, L.oil, ty));
    [[0.0, 0.02], [0.0, -0.06], [0.0, -0.14]].forEach(([ox, oy], i) => {
      const w = S * (0.1 - i * 0.02);
      stroke(put, cx - w, cy + oy * S, cx, cy + oy * S - S * 0.05, S * 0.02, () => (i === 2 ? L.holoLt : L.holo));
      stroke(put, cx, cy + oy * S - S * 0.05, cx + w, cy + oy * S, S * 0.02, () => (i === 2 ? L.holoLt : L.holo));
    });
    for (let y = 0; y < S * 0.34; y++) {
      if (y % 4 < 2) continue;
      row(put, Math.round(cy - S * 0.2 - y * 0.8), cx - S * 0.08, cx + S * 0.08, (tx) => (Math.abs(tx - 0.5) > 0.42 ? L.holoDk : null));
    }
    for (let a = 0; a < 6.28; a += 0.3) put(Math.round(cx + Math.cos(a) * S * 0.24), Math.round(cy + Math.sin(a) * S * 0.1), (a * 5 | 0) % 2 ? L.warn : L.oil);
    star(put, Math.round(cx), Math.round(cy - S * 0.4), L.holoLt);
  }
  function drawReactorCore(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.16, S * 0.74, cx + S * 0.16, S * 0.86, L.steel, L.steelLt, L.steelDkk);
    plate(put, cx - S * 0.14, S * 0.14, cx + S * 0.14, S * 0.24, L.steel, L.steelLt, L.steelDkk);
    [[-0.1], [0.1]].forEach(([o]) => put(Math.round(cx + o * S), Math.round(S * 0.2), L.red));
    for (let y = S * 0.24; y < S * 0.74; y++) {
      const t = (y - S * 0.24) / (S * 0.5);
      row(put, Math.round(y), cx - S * 0.1, cx + S * 0.1, (tx) => {
        const core = Math.abs(tx - 0.5) < 0.18 + Math.sin(t * 14) * 0.06;
        if (core) return mix(L.holoLt, L.holo, Math.abs(Math.sin(t * 9 + tx * 5)));
        let b = mix(L.visorLt, L.visor, Math.abs(tx - 0.5) * 2);
        return mix(b, L.holoDk, 0.3);
      });
    }
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.14, S * 0.78, cx + s * S * 0.3, S * 0.84, S * 0.025, () => L.steelDk);
      put(Math.round(cx + s * S * 0.3), Math.round(S * 0.85), L.holo);
    });
    [[0.16, 0.34], [-0.18, 0.5], [0.14, 0.62]].forEach(([ox, oy]) => star(put, Math.round(cx + ox * S), Math.round(S * oy), L.holoLt));
  }

  // ======================= TILES (#1 2 3 4 5 8 10) ==========================
  function tileFn(base) {
    return (put, S) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x, y, S); if (c) put(x, y, c); } };
  }
  const drawRegolith = tileFn((x, y, T) => {
    let b = mix(L.moon, L.moonDk, 0.25 + h2(x >> 2, y >> 2, 1) * 0.45);
    if (h2(x, y, 2) > 0.96) b = mix(b, L.moonDkk, 0.5);
    if (h2(x, y, 3) > 0.99) b = L.moonLt;
    const gx = Math.floor(x / 22), gy = Math.floor(y / 22);
    if (h2(gx, gy, 5) > 0.8) {
      const ix = x % 22 - 11, iy = y % 22 - 11;
      if (Math.abs(ix) < 3 && Math.abs(iy) < 5 && (iy % 2 === 0)) b = mix(b, L.moonDkk, 0.6);
    }
    return b;
  });
  const drawHullDeck = tileFn((x, y, T) => {
    const bw = T / 2, bh = T / 2;
    let b = mix(L.hull, L.hullMd, 0.2 + h2(Math.floor(x / bw), Math.floor(y / bh), 10) * 0.4);
    if (x % bw < 1.4 || y % bh < 1.4) b = L.hullDkk;
    if ((x % bw > bw - 6 && y % bh < 6)) b = L.hullDk;
    if (h2(x, y, 12) > 0.995) b = '#ffffff';
    return b;
  });
  const drawDeckGrate = tileFn((x, y, T) => {
    let b = mix(L.steelDk, L.steelDkk, 0.3 + h2(x >> 1, y >> 1, 20) * 0.4);
    if ((x % 8 < 3) && (y % 8 < 3)) return mix(L.space, L.oil, 0.5);
    if (x % 8 === 3 || y % 8 === 3) b = mix(b, L.steel, 0.4);
    if (h2(x, y, 22) > 0.993) b = L.holoDk;
    return b;
  });
  const drawLabTile = tileFn((x, y, T) => {
    let b = mix('#eef1f6', '#ccd2e0', 0.2 + h2(x >> 3, y >> 3, 30) * 0.3);
    if (x % (T / 2) < 1.2 || y % (T / 2) < 1.2) b = L.holoDk;
    if (h2(x >> 4, y >> 4, 32) > 0.88 && (x + y) % 7 < 2) b = mix(b, L.acidDk, 0.25);
    return b;
  });
  const drawHiveFloor = tileFn((x, y, T) => {
    let b = mix('#3a2c50', '#241a38', 0.3 + h2(x >> 1, y >> 1, 40) * 0.5);
    const gx = Math.floor(x / 12), gy = Math.floor(y / 12);
    let minD = 99, minD2 = 99;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const px = (gx + ox) * 12 + h2(gx + ox, gy + oy, 41) * 9, py = (gy + oy) * 12 + h2(gx + ox, gy + oy, 42) * 9;
      const d = Math.hypot(x - px, y - py);
      if (d < minD) { minD2 = minD; minD = d; } else if (d < minD2) minD2 = d;
    }
    if (minD2 - minD < 1.6) b = mix(L.void, '#241a38', 0.4);
    if (minD < 2 && h2(gx, gy, 44) > 0.72) b = L.acidDk;
    return b;
  });
  const drawWarnDeck = tileFn((x, y, T) => {
    let b = mix(L.hullMd, L.hullDk, 0.3 + h2(x >> 2, y >> 2, 70) * 0.3);
    if (x % (T / 2) < 1.4 || y % (T / 2) < 1.4) b = L.hullDkk;
    const inX = x % (T / 2), inY = y % (T / 2);
    if (inY < 7) b = (Math.floor((inX + inY) / 5) % 2 === 0) ? L.warn : L.oil;
    if (h2(x, y, 72) > 0.995) b = L.warnLt;
    return b;
  });
  const drawReactorPlate = tileFn((x, y, T) => {
    let b = mix(L.steelDk, L.steelDkk, 0.35 + h2(x >> 1, y >> 1, 90) * 0.4);
    const dx = x % T - T / 2, dy = y % T - T / 2, rad = Math.hypot(dx, dy);
    [T * 0.2, T * 0.36].forEach((rr, i) => { if (Math.abs(rad - rr) < 1.6) b = mix(L.holo, L.holoDk, h2(x, y, 91 + i) * 0.6); });
    if (rad < 3) b = L.holoLt;
    const ang = Math.atan2(dy, dx);
    if (Math.abs(rad - T * 0.28) < 4 && Math.abs(Math.sin(ang * 6)) > 0.9) b = L.warnDk;
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var LUN_ART = {
    L: L,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (9) + the scuttler hatchling ----
      ctx.spr('greyWatcherHi', MS, MS, drawGreyWatcher);
      ctx.spr('broodSacHi', MS, MS, drawBroodSac);
      ctx.spr('sentryDroneHi', MS, MS, drawSentryDrone);
      ctx.spr('haywireTurretHi', MS, MS, drawHaywireTurret);
      ctx.spr('astroRevenantHi', MS, MS, drawAstroRevenant);
      ctx.spr('magnetronHi', MS, MS, drawMagnetron);
      ctx.spr('lunaLeaperHi', MS, MS, drawLunaLeaper);
      ctx.spr('orbitalMineHi', MS, MS, drawOrbitalMine);
      ctx.spr('starHorrorHi', MS, MS, drawStarHorror);
      ctx.spr('scuttlerHi', MS, MS, drawScuttler);
      ctx.MOB_HI.greyWatcher = 'greyWatcherHi';     ctx.MOB_DISPLAY.greyWatcher = 52;
      ctx.MOB_HI.broodSac = 'broodSacHi';           ctx.MOB_DISPLAY.broodSac = 56;
      ctx.MOB_HI.sentryDrone = 'sentryDroneHi';     ctx.MOB_DISPLAY.sentryDrone = 50;
      ctx.MOB_HI.haywireTurret = 'haywireTurretHi'; ctx.MOB_DISPLAY.haywireTurret = 54;
      ctx.MOB_HI.astroRevenant = 'astroRevenantHi'; ctx.MOB_DISPLAY.astroRevenant = 54;
      ctx.MOB_HI.magnetron = 'magnetronHi';         ctx.MOB_DISPLAY.magnetron = 52;
      ctx.MOB_HI.lunaLeaper = 'lunaLeaperHi';       ctx.MOB_DISPLAY.lunaLeaper = 50;
      ctx.MOB_HI.orbitalMine = 'orbitalMineHi';     ctx.MOB_DISPLAY.orbitalMine = 48;
      ctx.MOB_HI.starHorror = 'starHorrorHi';       ctx.MOB_DISPLAY.starHorror = 60;
      ctx.MOB_HI.scuttler = 'scuttlerHi';           ctx.MOB_DISPLAY.scuttler = 30;
      // ---- boss: SPECIMEN ZERO · THE OVERMIND (canon final, 128px) ----
      ctx.spr('specimenzeroHi', 128, 128, drawOvermind);
      ctx.BOSS_HI.specimenzero = { key: 'specimenzeroHi', size: 128, display: 150, bodyW: 64, bodyH: 76 };
      // ---- decor (ALL 20) ----
      ctx.spr('lnLander', 64, 64, drawLander);
      ctx.spr('lnRover', 64, 64, drawRover);
      ctx.spr('lnFlag', 64, 64, drawFlag);
      ctx.spr('lnCryo', 64, 64, drawCryoPods);
      ctx.spr('lnConsole', 64, 64, drawConsole);
      ctx.spr('lnHolo', 64, 64, drawHoloTable);
      ctx.spr('lnCargo', 64, 64, drawCargoStack);
      ctx.spr('lnO2', 64, 64, drawO2Rack);
      ctx.spr('lnSolar', 64, 64, drawSolarArray);
      ctx.spr('lnDish', 64, 64, drawCommsDish);
      ctx.spr('lnAirlock', 64, 64, drawAirlock);
      ctx.spr('lnBeacon', 64, 64, drawBeacon);
      ctx.spr('lnHydro', 64, 64, drawHydroponics);
      ctx.spr('lnResin', 64, 64, drawHiveResin);
      ctx.spr('lnProbe', 64, 64, drawCrashedProbe);
      ctx.spr('lnCrater', 64, 64, drawCrater);
      ctx.spr('lnRocks', 64, 64, drawMoonRocks);
      ctx.spr('lnBench', 64, 64, drawLabBench);
      ctx.spr('lnPad', 64, 64, drawJumpPad);
      ctx.spr('lnReactor', 64, 64, drawReactorCore);
      // ---- tiles (6 picks + the scene-plan lab tile) ----
      ctx.tex('lnregolith', 48, 48, drawRegolith);
      ctx.tex('lnhull', 48, 48, drawHullDeck);
      ctx.tex('lngrate', 48, 48, drawDeckGrate);
      ctx.tex('lnlab', 48, 48, drawLabTile);
      ctx.tex('lnhive', 48, 48, drawHiveFloor);
      ctx.tex('lnwarn', 48, 48, drawWarnDeck);
      ctx.tex('lnreactor', 48, 48, drawReactorPlate);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = LUN_ART;
  root.LUNAR_ART = LUN_ART;
})(typeof window !== 'undefined' ? window : this);
