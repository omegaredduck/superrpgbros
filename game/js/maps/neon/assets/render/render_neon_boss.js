// artdev/neon/render_neon_boss.js — KINGPIN.EXE: 10 DIFFERENT
// helicopter designs (Red: "come up with your own helicopter ideals").
// Each a distinct airframe, not a livery. #1 = the Apache-style take-3.
'use strict';
const SHAPE = require('./render_neon_heli_shape.js');
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, plate, dome, optic, renderSheet, glow, visor } = KIT;

// ---- shared bits ---------------------------------------------------------
function rotorBlur(put, S, cx, cy, halfW) {
  row(put, Math.round(cy), cx - halfW, cx + halfW, (tx) => mix('#828a9a', N.night, 0.55 + Math.abs(tx - 0.5) * 0.4));
  ell(put, cx, cy, S * 0.028, S * 0.014, (tx, ty) => mix('#6e7a5e', '#2a301f', ty));
}
function metalFill(lt, base, dk) {
  return (tx, ty) => { let b = mix(lt, base, clamp(ty * 1.5, 0, 1)); return mix(b, dk, clamp((ty - 0.5) * 1.5, 0, 1)); };
}
function skids(put, S, x0, x1, y) {
  [[x0 + S * 0.04], [x1 - S * 0.04]].forEach(([sx]) => stroke(put, sx, y - S * 0.07, sx - S * 0.015, y, S * 0.011, () => '#20242c'));
  stroke(put, x0, y, x1, y, S * 0.012, () => '#4a5060');
  stroke(put, x0, y + S * 0.009, x1, y + S * 0.009, S * 0.006, () => '#181c24');
}
function kingpinSil(put, S, cx, cy, sc) { // fat suit + fedora + cigar
  sc = sc || 1;
  ell(put, cx, cy + S * 0.025 * sc, S * 0.026 * sc, S * 0.02 * sc, () => '#0a1018');
  ell(put, cx, cy, S * 0.016 * sc, S * 0.014 * sc, () => '#0a1018');
  row(put, Math.round(cy - S * 0.012 * sc), cx - S * 0.024 * sc, cx + S * 0.024 * sc, () => '#0a1018');
  put(Math.round(cx + S * 0.022 * sc), Math.round(cy + S * 0.002), N.amber);
}
function rainCell(put, S, seed) {
  for (let i = 0; i < 7; i++) {
    const rx = ((i * 47 + seed * 31) % 160) / 160 * S, ry = ((i * 83) % 110) / 160 * S;
    stroke(put, rx, ry, rx - S * 0.012, ry + S * 0.04, 0.8, () => mix(N.cyanLt, N.night, 0.74));
  }
}

// 1 · WARLORD — the Apache-style tandem gunship
function drawWarlord(put, S) { SHAPE.heli160(put, S, {}); }

// 2 · GOLIATH — twin-rotor heavy lifter + slung cargo
function drawGoliath(put, S) {
  const cx = S * 0.5; rainCell(put, S, 2);
  rotorBlur(put, S, cx - S * 0.2, S * 0.17, S * 0.26);
  rotorBlur(put, S, cx + S * 0.22, S * 0.14, S * 0.26);
  const M = metalFill('#7a7e8e', '#4e5262', '#262a36');
  // long banana body (front low, rear raised)
  for (let x = -0.3; x <= 0.32; x += 1 / S) {
    const t = (x + 0.3) / 0.62;
    const top = S * (0.3 - t * 0.08 + Math.sin(t * 3) * 0.01);
    const bot = S * (0.44 - t * 0.04);
    for (let y = top; y <= bot; y++) put(Math.round(cx + x * S), Math.round(y), M((x + 0.3) / 0.62, (y - top) / Math.max(1, bot - top)));
  }
  // rotor pylons
  stroke(put, cx - S * 0.2, S * 0.28, cx - S * 0.2, S * 0.18, S * 0.02, () => '#262a36');
  stroke(put, cx + S * 0.22, S * 0.26, cx + S * 0.22, S * 0.15, S * 0.02, () => '#262a36');
  // cockpit front + windows row
  for (let x = -0.29; x < -0.22; x += 1 / S) for (let y = S * 0.3; y < S * 0.36; y++) put(Math.round(cx + x * S), Math.round(y), mix('#7ab8d8', '#27455c', (y - S * 0.3) / (S * 0.06)));
  kingpinSil(put, S, cx - S * 0.25, S * 0.33, 0.8);
  [[-0.14], [-0.05], [0.04], [0.13]].forEach(([dx]) => plate(put, cx + dx * S - S * 0.015, S * 0.31, cx + dx * S + S * 0.015, S * 0.345, '#27455c', '#7ab8d8', '#14222e'));
  // winch + shipping container
  stroke(put, cx, S * 0.45, cx, S * 0.6, 1.2, () => '#565e6a');
  plate(put, cx - S * 0.11, S * 0.6, cx + S * 0.11, S * 0.72, '#7a3a2a', '#a85a3e', '#3e1c14');
  for (let x = -0.09; x <= 0.09; x += 0.02) stroke(put, cx + x * S, S * 0.6, cx + x * S, S * 0.72, 0.8, () => '#3e1c14');
  glow(put, cx - S * 0.11, S * 0.72, cx + S * 0.11, S * 0.72, 0.9, N.amber, N.amberLt);
}
// 3 · HORNET — tiny agile w/ side gun bench
function drawHornet(put, S) {
  const cx = S * 0.5; rainCell(put, S, 3);
  rotorBlur(put, S, cx, S * 0.3, S * 0.22);
  stroke(put, cx, S * 0.3, cx, S * 0.36, S * 0.014, () => '#26241c');
  // egg body
  ell(put, cx, S * 0.46, S * 0.1, S * 0.085, metalFill('#8a8256', '#5e5638', '#302c1a'));
  // big bubble canopy
  for (let a = 1.4; a < 4.6; a += 0.05) {
    const px = cx - S * 0.04 + Math.cos(a) * S * 0.07, py = S * 0.44 + Math.sin(a) * S * 0.06;
    put(Math.round(px), Math.round(py), mix('#8ac4e2', '#2a4a62', clamp((py - S * 0.38) / (S * 0.12), 0, 1)));
  }
  kingpinSil(put, S, cx - S * 0.045, S * 0.44, 0.9);
  // tail boom + fin
  stroke(put, cx + S * 0.09, S * 0.46, cx + S * 0.3, S * 0.42, S * 0.012, () => '#5e5638');
  stroke(put, cx + S * 0.3, S * 0.42, cx + S * 0.3, S * 0.36, S * 0.012, () => '#302c1a');
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(cx + S * 0.31 + Math.cos(a) * S * 0.035), Math.round(S * 0.39 + Math.sin(a) * S * 0.035), mix('#828a9a', N.night, 0.5));
  // side bench + two goons w/ SMGs
  plate(put, cx - S * 0.1, S * 0.52, cx + S * 0.06, S * 0.55, '#302c1a', '#5e5638', '#181608');
  [[-0.06], [0.01]].forEach(([dx]) => { ell(put, cx + dx * S, S * 0.5, S * 0.014, S * 0.016, () => '#0a1018'); stroke(put, cx + dx * S - S * 0.02, S * 0.51, cx + dx * S - S * 0.04, S * 0.5, 1.2, () => '#12161c'); });
  skids(put, S, cx - S * 0.12, cx + S * 0.08, S * 0.6);
  glow(put, cx - S * 0.1, S * 0.565, cx + S * 0.06, S * 0.565, 0.9, N.green, N.greenLt);
}
// 4 · WIDOW — coaxial stealth wedge, no tail rotor
function drawWidow(put, S) {
  const cx = S * 0.5; rainCell(put, S, 4);
  // stacked coaxial rotors
  rotorBlur(put, S, cx, S * 0.24, S * 0.24);
  rotorBlur(put, S, cx, S * 0.28, S * 0.2);
  stroke(put, cx, S * 0.28, cx, S * 0.36, S * 0.016, () => '#0e0e14');
  // faceted wedge body (angular stealth panels)
  const M = (tx, ty) => { const f = ((tx * 4 | 0) + (ty * 3 | 0)) % 2; return mix(f ? '#26262e' : '#33333d', '#101018', ty * 0.7); };
  for (let x = -0.24; x <= 0.26; x += 1 / S) {
    const t = (x + 0.24) / 0.5;
    const top = S * (0.38 + Math.abs(t - 0.45) * 0.06);
    const bot = S * (0.56 - Math.abs(t - 0.5) * 0.1);
    for (let y = top; y <= bot; y++) put(Math.round(cx + x * S), Math.round(y), M(t, (y - top) / Math.max(1, bot - top)));
  }
  // slit canopy
  for (let x = -0.14; x < -0.02; x += 1 / S) for (let y = S * 0.41; y < S * 0.445; y++) put(Math.round(cx + x * S), Math.round(y), mix(N.purple, '#141020', (y - S * 0.41) / (S * 0.035)));
  kingpinSil(put, S, cx - S * 0.08, S * 0.428, 0.62);
  // sharp tail spike
  for (let x = 0.26; x <= 0.4; x += 1 / S) { const t = (x - 0.26) / 0.14; const mid = S * 0.46; const h = S * 0.03 * (1 - t); for (let y = mid - h; y <= mid + h; y++) put(Math.round(cx + x * S), Math.round(y), mix('#2a2a34', '#101018', Math.abs(y - mid) / Math.max(1, h))); }
  // weapon bay slit + purple edge glow
  row(put, Math.round(S * 0.54), cx - S * 0.14, cx + S * 0.08, () => '#0a0a10');
  glow(put, cx - S * 0.22, S * 0.565, cx + S * 0.2, S * 0.545, 0.9, N.purple, N.purpleLt);
  put(Math.round(cx + S * 0.41), Math.round(S * 0.46), N.redN);
}
// 5 · JUNKYARD — scrap-built, caged fan, mismatched panels
function drawJunkyard(put, S) {
  const cx = S * 0.5; rainCell(put, S, 5);
  rotorBlur(put, S, cx, S * 0.26, S * 0.24);
  // bent mast + wire stays
  stroke(put, cx + S * 0.01, S * 0.26, cx - S * 0.01, S * 0.36, S * 0.014, () => '#4a3a26');
  stroke(put, cx - S * 0.01, S * 0.3, cx - S * 0.14, S * 0.4, 0.8, () => '#565e6a');
  stroke(put, cx - S * 0.01, S * 0.3, cx + S * 0.13, S * 0.42, 0.8, () => '#565e6a');
  // patchwork body
  [[-0.16, 0.38, 0.14, 0.1, '#6a4a2e'], [-0.02, 0.36, 0.12, 0.12, '#4e5262'], [0.08, 0.4, 0.12, 0.09, '#5a6450'], [-0.08, 0.46, 0.16, 0.08, '#7a3a2a']].forEach(([dx, dy, w, h, c]) => {
    plate(put, cx + (dx - w / 2) * S, S * dy, cx + (dx + w / 2) * S, S * (dy + h), c, mix(c, '#ffffff', 0.2), mix(c, '#000000', 0.45));
  });
  // rivet dots + duct tape X
  [[-0.12, 0.4], [0, 0.38], [0.1, 0.42], [-0.04, 0.5]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#8a92a2'));
  stroke(put, cx - S * 0.06, S * 0.44, cx - S * 0.01, S * 0.49, 1.6, () => '#8a8a7a');
  stroke(put, cx - S * 0.01, S * 0.44, cx - S * 0.06, S * 0.49, 1.6, () => '#8a8a7a');
  // exposed engine + sputter smoke
  ell(put, cx + S * 0.05, S * 0.35, S * 0.03, S * 0.022, (tx, ty) => mix('#7a4a2e', '#2e1c10', ty));
  [[0.1, 0.3], [0.13, 0.26], [0.12, 0.22]].forEach(([dx, dy], i) => ell(put, cx + dx * S, S * dy, S * (0.012 + i * 0.005), S * 0.01, (tx) => mix('#3a3a42', N.night, 0.4 + tx * 0.3)));
  // windshield = salvaged car glass (cracked)
  plate(put, cx - S * 0.17, S * 0.4, cx - S * 0.08, S * 0.46, '#27455c', '#7ab8d8', '#14222e');
  stroke(put, cx - S * 0.15, S * 0.41, cx - S * 0.1, S * 0.45, 0.8, () => '#c8d8e8');
  kingpinSil(put, S, cx - S * 0.12, S * 0.435, 0.7);
  // caged tail fan
  stroke(put, cx + S * 0.14, S * 0.44, cx + S * 0.3, S * 0.4, S * 0.014, () => '#4a3a26');
  for (let a = 0; a < 6.28; a += 0.5) { const px = cx + S * 0.31 + Math.cos(a) * S * 0.045, py = S * 0.38 + Math.sin(a) * S * 0.045; put(Math.round(px), Math.round(py), '#565e6a'); }
  [[0, 1], [1, 0], [0.7, 0.7], [-0.7, 0.7]].forEach(([fx, fy]) => stroke(put, cx + S * 0.31, S * 0.38, cx + S * 0.31 + fx * S * 0.04, S * 0.38 + fy * S * 0.04, 1, () => '#3a3a42'));
  skids(put, S, cx - S * 0.18, cx + S * 0.1, S * 0.58);
  glow(put, cx - S * 0.16, S * 0.545, cx + S * 0.08, S * 0.545, 0.9, N.amber, N.amberLt);
}
// 6 · SPECTER — ducted-fan VTOL interceptor (no main rotor)
function drawSpecter(put, S) {
  const cx = S * 0.5; rainCell(put, S, 6);
  // twin duct rings
  [[-0.2, 0.34], [0.22, 0.34]].forEach(([dx, dy]) => {
    for (let a = 0; a < 6.28; a += 0.1) {
      const px = cx + dx * S + Math.cos(a) * S * 0.07, py = S * dy + Math.sin(a) * S * 0.035;
      put(Math.round(px), Math.round(py), '#3a4254');
      put(Math.round(px), Math.round(py + 1), '#1c2230');
    }
    row(put, Math.round(S * dy), cx + dx * S - S * 0.05, cx + dx * S + S * 0.05, (tx) => mix('#828a9a', N.night, 0.5 + Math.abs(tx - 0.5) * 0.4)); // fan blur
  });
  // sleek interceptor body
  for (let x = -0.16; x <= 0.18; x += 1 / S) {
    const t = (x + 0.16) / 0.34;
    const top = S * (0.38 + Math.abs(t - 0.35) * 0.05);
    const bot = S * (0.52 - Math.abs(t - 0.5) * 0.06);
    for (let y = top; y <= bot; y++) {
      const ty = (y - top) / Math.max(1, bot - top);
      put(Math.round(cx + x * S), Math.round(y), mix('#3e4e6e', '#16203a', ty));
    }
  }
  // duct arms
  stroke(put, cx - S * 0.12, S * 0.42, cx - S * 0.19, S * 0.37, S * 0.015, () => '#1c2230');
  stroke(put, cx + S * 0.14, S * 0.42, cx + S * 0.21, S * 0.37, S * 0.015, () => '#1c2230');
  // wraparound visor canopy
  for (let x = -0.12; x < 0.02; x += 1 / S) for (let y = S * 0.4; y < S * 0.435; y++) put(Math.round(cx + x * S), Math.round(y), mix('#4a8aff', '#101c3a', (y - S * 0.4) / (S * 0.035)));
  kingpinSil(put, S, cx - S * 0.05, S * 0.42, 0.6);
  // strobes + spotlight
  glow(put, cx - S * 0.2, S * 0.3, cx - S * 0.2, S * 0.3, 1.3, N.redN, N.redNLt);
  glow(put, cx + S * 0.22, S * 0.3, cx + S * 0.22, S * 0.3, 1.3, '#4a8aff', '#b0d0ff');
  for (let t = 0; t < 1; t += 0.07) { const w = t * 7; for (let ox = -1; ox <= 1; ox += 0.5) put(Math.round(cx + (t * 0.1 - 0.02) * S + ox * w), Math.round(S * (0.53 + t * 0.28)), mix('#e8ecf4', N.night, 0.5 + t * 0.38)); }
  put(Math.round(cx + S * 0.2), Math.round(S * 0.46), N.redN); // tail light
}
// 7 · MAMMOTH — armored twin-minigun brute
function drawMammoth(put, S) {
  const cx = S * 0.5; rainCell(put, S, 7);
  rotorBlur(put, S, cx, S * 0.22, S * 0.28);
  stroke(put, cx, S * 0.22, cx, S * 0.3, S * 0.02, () => '#1e222a');
  // slab body — heavy armor with bolt lines
  for (let x = -0.24; x <= 0.24; x += 1 / S) {
    const t = (x + 0.24) / 0.48;
    const top = S * 0.32, bot = S * (0.58 - Math.abs(t - 0.5) * 0.08);
    for (let y = top; y <= bot; y++) {
      const ty = (y - top) / Math.max(1, bot - top);
      let b = mix('#5a5e6a', '#23262e', ty);
      if ((y | 0) % 9 === 0) b = mix(b, '#14161c', 0.4);
      put(Math.round(cx + x * S), Math.round(y), b);
    }
  }
  [[-0.2, 0.36], [-0.1, 0.36], [0.02, 0.36], [0.12, 0.36], [0.2, 0.36]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#8a92a2')); // bolts
  // narrow slit canopy w/ armored frame
  plate(put, cx - S * 0.16, S * 0.38, cx - S * 0.02, S * 0.42, '#27455c', '#6aa8cc', '#14222e');
  stroke(put, cx - S * 0.16, S * 0.38, cx - S * 0.02, S * 0.38, 1.4, () => '#14161c');
  kingpinSil(put, S, cx - S * 0.09, S * 0.4, 0.6);
  // TWIN SIDE MINIGUNS (rotary barrels)
  [[-0.27, 0.48], [0.25, 0.48]].forEach(([dx, dy], i) => {
    plate(put, cx + dx * S - S * 0.02, S * (dy - 0.03), cx + dx * S + S * 0.02, S * (dy + 0.03), '#2e343e', '#4a5460', '#12161c');
    for (let b2 = -1; b2 <= 1; b2++) stroke(put, cx + dx * S + (i ? 1 : -1) * S * 0.02, S * dy + b2 * 2, cx + dx * S + (i ? 1 : -1) * S * 0.08, S * dy + b2 * 2, 1.1, () => (b2 ? '#12161c' : '#3a4048'));
    put(Math.round(cx + dx * S + (i ? 1 : -1) * S * 0.085), Math.round(S * dy), N.amberLt);
  });
  // stub tail + heavy skids
  stroke(put, cx + S * 0.24, S * 0.44, cx + S * 0.36, S * 0.4, S * 0.02, () => '#23262e');
  for (let a = 0; a < 6.28; a += 0.35) put(Math.round(cx + S * 0.37 + Math.cos(a) * S * 0.04), Math.round(S * 0.38 + Math.sin(a) * S * 0.04), mix('#828a9a', N.night, 0.5));
  skids(put, S, cx - S * 0.22, cx + S * 0.16, S * 0.66);
  glow(put, cx - S * 0.22, S * 0.6, cx + S * 0.2, S * 0.6, 1.1, N.redN, N.redNLt);
}
// 8 · DRAGONFLY — sleek racer, long tail, big glass
function drawDragonfly(put, S) {
  const cx = S * 0.5; rainCell(put, S, 8);
  rotorBlur(put, S, cx - S * 0.06, S * 0.28, S * 0.2);
  stroke(put, cx - S * 0.06, S * 0.28, cx - S * 0.06, S * 0.35, S * 0.012, () => '#1c1424');
  // teardrop body
  for (let x = -0.2; x <= 0.1; x += 1 / S) {
    const t = (x + 0.2) / 0.3;
    const mid = S * 0.45, h = S * (0.02 + Math.sin(t * Math.PI) * 0.055);
    for (let y = mid - h; y <= mid + h; y++) {
      const ty = (y - (mid - h)) / Math.max(1, h * 2);
      put(Math.round(cx + x * S), Math.round(y), mix('#8a4aff', '#2a1050', ty));
    }
  }
  // huge glass nose (front 60%)
  for (let x = -0.19; x < -0.05; x += 1 / S) {
    const t = (x + 0.19) / 0.14;
    const mid = S * 0.45, h = S * (0.02 + Math.sin(((x + 0.2) / 0.3) * Math.PI) * 0.05) * 0.8;
    for (let y = mid - h; y <= mid + h; y++) put(Math.round(cx + x * S), Math.round(y), mix('#9ad8f0', '#2a4a62', (y - (mid - h)) / Math.max(1, h * 2)));
  }
  kingpinSil(put, S, cx - S * 0.12, S * 0.44, 0.75);
  // long whip tail + V fin
  for (let t = 0; t <= 1; t += 0.03) { const px = cx + S * (0.1 + t * 0.28), py = S * (0.44 - t * 0.02); ell(put, px, py, S * (0.012 - t * 0.008), S * (0.012 - t * 0.008), () => mix('#8a4aff', '#2a1050', t)); }
  stroke(put, cx + S * 0.38, S * 0.42, cx + S * 0.42, S * 0.37, 1.4, () => N.purple);
  stroke(put, cx + S * 0.38, S * 0.42, cx + S * 0.42, S * 0.45, 1.4, () => N.purpleDk);
  // racing trim + speed lines
  glow(put, cx - S * 0.18, S * 0.5, cx + S * 0.08, S * 0.485, 0.9, N.pink, N.pinkLt);
  [[-0.3, 0.42], [-0.32, 0.47]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx - 0.06) * S, S * dy, 1.2, () => mix(N.pinkLt, N.night, 0.5)));
  skids(put, S, cx - S * 0.14, cx + S * 0.04, S * 0.55);
}
// 9 · HIVE — drone-carrier, open belly bays
function drawHive(put, S) {
  const cx = S * 0.5; rainCell(put, S, 9);
  rotorBlur(put, S, cx, S * 0.2, S * 0.26);
  stroke(put, cx, S * 0.2, cx, S * 0.28, S * 0.018, () => '#1c2418');
  // boxy carrier body
  for (let x = -0.22; x <= 0.22; x += 1 / S) {
    const t = (x + 0.22) / 0.44;
    const top = S * 0.3, bot = S * 0.52;
    for (let y = top; y <= bot; y++) {
      const ty = (y - top) / (bot - top);
      let b = mix('#5a6a4a', '#26301e', ty);
      if ((y | 0) % 11 === 0) b = mix(b, '#141a10', 0.35);
      put(Math.round(cx + x * S), Math.round(y), b);
    }
  }
  // cockpit slit
  plate(put, cx - S * 0.2, S * 0.33, cx - S * 0.08, S * 0.37, '#27455c', '#7ab8d8', '#14222e');
  kingpinSil(put, S, cx - S * 0.14, S * 0.35, 0.6);
  // OPEN BELLY BAYS w/ drones dropping
  [[-0.12], [0], [0.12]].forEach(([dx], i) => {
    plate(put, cx + dx * S - S * 0.04, S * 0.52, cx + dx * S + S * 0.04, S * 0.56, '#141a10', '#26301e', '#0a0e08');
    // bay doors open
    stroke(put, cx + dx * S - S * 0.04, S * 0.56, cx + dx * S - S * 0.06, S * 0.6, 1.2, () => '#3a4630');
    stroke(put, cx + dx * S + S * 0.04, S * 0.56, cx + dx * S + S * 0.06, S * 0.6, 1.2, () => '#3a4630');
    // mini drone below (dropping)
    const dy = 0.62 + i * 0.05;
    row(put, Math.round(S * dy), cx + dx * S - S * 0.025, cx + dx * S + S * 0.025, (tx) => mix('#828a9a', N.night, 0.5));
    dome(put, cx + dx * S, S * (dy + 0.02), S * 0.016, S * 0.013, '#3a4254', '#5a6274', '#1c2230');
    put(Math.round(cx + dx * S), Math.round(S * (dy + 0.02)), N.redN);
  });
  // tail
  stroke(put, cx + S * 0.22, S * 0.4, cx + S * 0.36, S * 0.36, S * 0.014, () => '#26301e');
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + S * 0.37 + Math.cos(a) * S * 0.035), Math.round(S * 0.35 + Math.sin(a) * S * 0.035), mix('#828a9a', N.night, 0.5));
  glow(put, cx - S * 0.22, S * 0.3, cx + S * 0.22, S * 0.3, 0.9, N.green, N.greenLt);
}
// 10 · REAPER — all-black scythe blades, red glare
function drawReaper(put, S) {
  const cx = S * 0.5; rainCell(put, S, 10);
  // scythe rotor: curved blades visible (not blur)
  [[0, 1], [1.05, 1], [2.1, 1]].forEach(([a0]) => {
    for (let t = 0; t < 1; t += 0.04) {
      const a = a0 + t * 0.9;
      const px = cx + Math.cos(a) * S * 0.24 * t, py = S * 0.26 + Math.sin(a) * S * 0.1 * t;
      stroke(put, px, py, px + 1, py, 1.6 - t, () => (t > 0.7 ? '#3a0a12' : '#1a1a22'));
    }
  });
  ell(put, cx, S * 0.26, S * 0.025, S * 0.015, (tx, ty) => mix('#3a3a44', '#0e0e14', ty));
  stroke(put, cx, S * 0.26, cx, S * 0.34, S * 0.014, () => '#0e0e14');
  // hooded body — cowl shape
  for (let x = -0.2; x <= 0.2; x += 1 / S) {
    const t = (x + 0.2) / 0.4;
    const top = S * (0.36 + Math.abs(t - 0.4) * 0.08);
    const bot = S * (0.6 - Math.abs(t - 0.5) * 0.16);
    for (let y = top; y <= bot; y++) {
      const ty = (y - top) / Math.max(1, bot - top);
      put(Math.round(cx + x * S), Math.round(y), mix('#22222c', '#0a0a10', ty));
    }
  }
  // glowing red visor slit (the "face")
  glow(put, cx - S * 0.14, S * 0.42, cx - S * 0.02, S * 0.415, 1.1, N.redN, N.redNLt);
  kingpinSil(put, S, cx - S * 0.07, S * 0.46, 0.7);
  // skeletal landing claws
  [[-0.12], [0.06]].forEach(([dx]) => {
    stroke(put, cx + dx * S, S * 0.58, cx + dx * S - S * 0.02, S * 0.66, 1.4, () => '#1a1a22');
    [[-0.02], [0.01]].forEach(([o]) => stroke(put, cx + dx * S - S * 0.02, S * 0.66, cx + dx * S + o * S - S * 0.02, S * 0.7, 1.1, () => '#33333d'));
  });
  // spiked tail + red beacon
  for (let t = 0; t <= 1; t += 0.04) { const px = cx + S * (0.2 + t * 0.2), py = S * (0.46 - t * 0.04); ell(put, px, py, S * (0.014 - t * 0.009), S * (0.014 - t * 0.009), () => mix('#22222c', '#0a0a10', t)); }
  [[0.3, 0.42], [0.34, 0.415], [0.38, 0.412]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy - 0.025), 1, () => '#33333d'));
  glow(put, cx + S * 0.4, S * 0.41, cx + S * 0.4, S * 0.41, 1.2, N.redN, N.redNLt);
  // exhaust embers
  [[0.16, 0.52], [0.2, 0.55]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#8a1020'));
}

const LIST = [
  { n: 1, name: 'WARLORD', role: 'apache-style tandem gunship', draw: drawWarlord },
  { n: 2, name: 'GOLIATH', role: 'twin-rotor lifter + cargo', draw: drawGoliath },
  { n: 3, name: 'HORNET', role: 'tiny agile + goon bench', draw: drawHornet },
  { n: 4, name: 'WIDOW', role: 'coaxial stealth wedge', draw: drawWidow },
  { n: 5, name: 'JUNKYARD', role: 'scrap-built sputterer', draw: drawJunkyard },
  { n: 6, name: 'SPECTER', role: 'ducted-fan interceptor', draw: drawSpecter },
  { n: 7, name: 'MAMMOTH', role: 'armored twin miniguns', draw: drawMammoth },
  { n: 8, name: 'DRAGONFLY', role: 'sleek racer, whip tail', draw: drawDragonfly },
  { n: 9, name: 'HIVE', role: 'drone-carrier, open bays', draw: drawHive },
  { n: 10, name: 'REAPER', role: 'black scythe-blade wraith', draw: drawReaper },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_boss_options.png', title: 'KINGPIN.EXE — 10 HELICOPTER DESIGNS (combo + recolor welcome)', S: 190, cols: 5 });
}
module.exports = { LIST };
