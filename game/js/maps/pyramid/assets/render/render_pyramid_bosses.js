// artdev/pyramid/render_pyramid_bosses.js — TWO boss work-up sheets for the
// 2-phase PYRAMID PLUNDER boss: 10 PHARAOH forms (phase 1, curse-caster) +
// 10 ANUBIS GUARDIAN forms (phase 2, melee hunter). Red picks one of each.
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, wraps, trim, glyphs, horusEye, nemes, serpent, flame } = KIT;

// shared: jackal head (side-snout), scale s, colors
function jackalHead(put, cx, cy, s, base, lt, dk, eyeC) {
  dome(put, cx, cy, s, s * 0.9, base, lt, dk);
  stroke(put, cx - s * 0.7, cy + s * 0.15, cx - s * 1.7, cy + s * 0.4, s * 0.55, (t) => mix(base, dk, t * 0.7));
  put(Math.round(cx - s * 1.7), Math.round(cy + s * 0.55), dk);
  [-1, 1].forEach(k => stroke(put, cx + k * s * 0.45, cy - s * 0.7, cx + k * s * 0.8, cy - s * 1.8, s * 0.4, (t) => mix(base, dk, t * 0.5)));
  optic(put, cx - s * 0.25, cy - s * 0.1, s * 0.22, mix(eyeC, '#000000', 0.5), eyeC, mix(eyeC, '#ffffff', 0.6));
}
// crook + flail crossed over chest
function crookFlail(put, cx, cy, s) {
  stroke(put, cx - s, cy + s * 0.9, cx + s * 0.5, cy - s * 0.9, s * 0.16, () => E.lapis);
  for (let a = 3.6; a < 6; a += 0.25) put(Math.round(cx + s * 0.5 + Math.cos(a) * s * 0.3), Math.round(cy - s * 0.9 + Math.sin(a) * s * 0.3), E.lapisLt);
  stroke(put, cx + s, cy + s * 0.9, cx - s * 0.4, cy - s * 0.8, s * 0.16, () => E.goldDk);
  [-0.15, 0, 0.15].forEach(o => stroke(put, cx - s * 0.4 + o * s, cy - s * 0.8, cx - s * 0.55 + o * s * 1.4, cy - s * 1.4, s * 0.1, () => E.gold));
}

// ======================= PHARAOH FORMS (phase 1) =======================
// P1 · THE GILDED KING — classic gold death mask, blue nemes, regal.
function drawGildedKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // robe body
  for (let y = 0; y < S * 0.36; y++) { const t = y / (S * 0.36), w = S * (0.09 + t * 0.12); row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => { let b = mix(E.wrapLt, E.wrapDk, t); if (tx < 0.12 || tx > 0.88) b = mix(b, E.wrapDkk, 0.5); return b; }); }
  trim(put, cx - S * 0.2, cx + S * 0.2, Math.round(cy + S * 0.3), 4);
  // usekh collar
  for (let i = 0; i < 3; i++) trim(put, cx - S * (0.1 + i * 0.02), cx + S * (0.1 + i * 0.02), Math.round(cy - S * 0.02 + i * 4), 3);
  // gold mask + blue-gold nemes
  nemes(put, cx, cy - S * 0.2, S * 0.1, S * 0.14, E.lapis, E.gold);
  dome(put, cx, cy - S * 0.19, S * 0.075, S * 0.095, E.gold, E.goldLt, E.goldDkk);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.05, cy - S * 0.21, cx + s * S * 0.015, cy - S * 0.21, 2, () => E.oil); put(Math.round(cx + s * S * 0.032), Math.round(cy - S * 0.21), E.lapisLt); });
  stroke(put, cx, cy - S * 0.13, cx, cy - S * 0.09, S * 0.02, () => E.lapisDk); // braided beard
  // uraeus cobra on the brow
  stroke(put, cx, cy - S * 0.3, cx, cy - S * 0.34, 2, () => E.gold); put(Math.round(cx), Math.round(cy - S * 0.35), E.red);
  crookFlail(put, cx, cy + S * 0.1, S * 0.1);
  // curse sigil circling him
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + S * 0.28 + Math.sin(a) * S * 0.05), E.curse);
}
// P2 · THE HOLLOW KING — empty bandages, mask floating on darkness.
function drawHollowKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // unraveling wrap body w/ hollow core
  wraps(put, cx, cy + S * 0.1, S * 0.16, S * 0.22, 0.8);
  ell(put, cx, cy + S * 0.04, S * 0.09, S * 0.12, () => E.oil);
  [[0.02, 0.0], [-0.04, 0.08], [0.05, 0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.curse));
  // loose bandage tails whipping
  [[-0.16, -0.02, -0.3, -0.14], [0.16, 0.06, 0.32, -0.04], [-0.1, 0.28, -0.26, 0.34]].forEach(([a, b2, c, d]) =>
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, S * 0.03, (t) => mix(E.wrap, E.wrapDkk, t)));
  // the mask floats above the hollow neck, tilted
  dome(put, cx + S * 0.02, cy - S * 0.18, S * 0.08, S * 0.1, E.gold, E.goldLt, E.goldDkk);
  ell(put, cx + S * 0.02, cy - S * 0.13, S * 0.05, S * 0.03, () => E.goldDk);
  [-1, 1].forEach(s => ell(put, cx + S * 0.02 + s * S * 0.035, cy - S * 0.2, S * 0.022, S * 0.028, () => E.oil));
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.02 + s * S * 0.035), Math.round(cy - S * 0.2), E.curse));
  // gap of void between mask + body
  row(put, Math.round(cy - S * 0.07), cx - S * 0.05, cx + S * 0.09, () => E.oil);
}
// P3 · KHUFU-KA — hulking heavy mummy lord, colossal wraps.
function drawKhufuKa(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // massive wrapped torso
  wraps(put, cx, cy + S * 0.04, S * 0.22, S * 0.26, 0.9);
  // wrapped arms — one reaching
  wraps(put, cx - S * 0.26, cy - S * 0.02, S * 0.08, S * 0.16, 1.4);
  stroke(put, cx + S * 0.2, cy - S * 0.06, cx + S * 0.36, cy + S * 0.02, S * 0.06, (t) => mix(E.wrap, E.wrapDk, t));
  [-1, 0, 1].forEach(k => stroke(put, cx + S * 0.36, cy + S * 0.02, cx + S * 0.4, cy + S * 0.02 + k * S * 0.04, 2, () => E.wrapDkk));
  // collar + belt
  trim(put, cx - S * 0.14, cx + S * 0.14, Math.round(cy - S * 0.14), 5);
  trim(put, cx - S * 0.18, cx + S * 0.18, Math.round(cy + S * 0.12), 4);
  // squat head w/ khat hood + green burning gaze
  dome(put, cx, cy - S * 0.24, S * 0.1, S * 0.09, E.wrapDk, E.wrap, E.wrapDkk);
  row(put, Math.round(cy - S * 0.27), cx - S * 0.08, cx + S * 0.08, () => E.goldDk);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.24, S * 0.026, E.curseDk, E.curse, E.curseLt));
  // dragging loose wraps on the ground
  [[-0.2, 0.32], [0.1, 0.34]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.12, cy + oy * S + S * 0.03, S * 0.025, () => E.wrapDk));
}
// P4 · THE HERETIC — cracked mask, curse light POURING from the breaks.
function drawHeretic(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  for (let y = 0; y < S * 0.34; y++) { const t = y / (S * 0.34), w = S * (0.08 + t * 0.13); row(put, Math.round(cy - S * 0.0 + y), cx - w, cx + w, (tx) => { let b = mix(E.tomb, E.tombDk, t); if (tx < 0.15 || tx > 0.85) b = mix(b, E.oil, 0.5); return b; }); }
  // curse light seams down the robe
  [[-0.03, 0.06, -0.06, 0.3], [0.05, 0.04, 0.09, 0.28]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => E.curse));
  trim(put, cx - S * 0.09, cx + S * 0.09, Math.round(cy + S * 0.0), 3);
  // cracked mask — half gold, half shattered showing green skull
  dome(put, cx, cy - S * 0.18, S * 0.085, S * 0.105, E.gold, E.goldLt, E.goldDkk);
  for (let y = Math.round(cy - S * 0.28); y < cy - S * 0.08; y++) { const wob = Math.sin(y * 0.8) * 2; for (let x = 0; x < S * 0.07; x++) put(Math.round(cx + S * 0.01 + wob + x), y, x < 2 ? E.curse : mix(E.tombDk, E.oil, 0.5)); }
  ell(put, cx + S * 0.045, cy - S * 0.2, S * 0.02, S * 0.026, () => E.curseLt);
  ell(put, cx - S * 0.04, cy - S * 0.2, S * 0.022, S * 0.028, () => E.oil); put(Math.round(cx - S * 0.04), Math.round(cy - S * 0.2), E.curse);
  // broken atef crown
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy - S * 0.29, cx + s * S * 0.1, cy - S * 0.38, S * 0.03, () => E.wrapDk));
  stroke(put, cx, cy - S * 0.3, cx, cy - S * 0.42, S * 0.035, () => E.goldDk);
  put(Math.round(cx), Math.round(cy - S * 0.43), E.curseLt);
  // clawed hand w/ curse orb
  stroke(put, cx - S * 0.12, cy + S * 0.1, cx - S * 0.24, cy + S * 0.0, S * 0.04, () => E.tombDk);
  ell(put, cx - S * 0.27, cy - S * 0.04, S * 0.05, S * 0.05, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
}
// P5 · SORCERER KING — tall white crown, was-scepter, floating scroll.
function drawSorcererKing(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  for (let y = 0; y < S * 0.32; y++) { const t = y / (S * 0.32), w = S * (0.08 + t * 0.12); row(put, Math.round(cy + y - S * 0.02), cx - w, cx + w, (tx) => { let b = mix(E.lapisLt, E.lapisDk, t); if (tx < 0.15 || tx > 0.85) b = mix(b, '#0e1e4a', 0.5); return b; }); }
  // gold star-stipple on the robe
  for (let i = 0; i < 9; i++) put(Math.round(cx - S * 0.1 + (i * 37 % 100) / 100 * S * 0.2), Math.round(cy + S * 0.04 + (i * 61 % 100) / 100 * S * 0.22), E.gold);
  trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(cy - S * 0.02), 3);
  // head + tall hedjet crown
  dome(put, cx, cy - S * 0.12, S * 0.065, S * 0.07, E.skin, '#e8b088', E.skinDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.13), E.curse));
  for (let y = 0; y < S * 0.2; y++) { const t = y / (S * 0.2), w = S * (0.052 - t * 0.03); row(put, Math.round(cy - S * 0.36 + y), cx - w, cx + w, (tx) => mix(E.wrapLt, E.wrapDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5)); }
  ell(put, cx, cy - S * 0.37, S * 0.022, S * 0.022, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  // was-scepter
  stroke(put, cx + S * 0.15, cy - S * 0.26, cx + S * 0.15, cy + S * 0.3, S * 0.018, () => E.goldDk);
  stroke(put, cx + S * 0.15, cy - S * 0.26, cx + S * 0.2, cy - S * 0.3, S * 0.022, () => E.gold);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.15, cy + S * 0.3, cx + S * 0.15 + s * S * 0.025, cy + S * 0.33, 2, () => E.goldDk));
  // floating unrolled scroll w/ burning glyphs
  plate(put, cx - S * 0.34, cy - S * 0.1, cx - S * 0.16, cy + S * 0.02, E.wrapLt, '#fffbe8', E.wrapDk);
  glyphs(put, cx - S * 0.32, cy - S * 0.08, cx - S * 0.18, cy + S * 0.0, E.curseDk);
  [[-0.34, -0.12], [-0.16, -0.12]].forEach(([ox]) => ell(put, cx + ox * S, cy - S * 0.1, S * 0.014, S * 0.03, () => E.wrapDk));
}
// P6 · THE CHILD KING — small, doll-like, wrong. Oversized mask.
function drawChildKing(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.14);
  // tiny body
  for (let y = 0; y < S * 0.2; y++) { const t = y / (S * 0.2), w = S * (0.05 + t * 0.07); row(put, Math.round(cy + y), cx - w, cx + w, (tx) => mix(E.wrapLt, E.wrapDk, t)); }
  trim(put, cx - S * 0.1, cx + S * 0.1, Math.round(cy + S * 0.18), 3);
  // oversized golden mask (half the sprite)
  dome(put, cx, cy - S * 0.14, S * 0.13, S * 0.16, E.gold, E.goldLt, E.goldDkk);
  nemes(put, cx, cy - S * 0.26, S * 0.12, S * 0.1, E.lapis, E.gold);
  // big serene eyes — one leaks a black tear
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.05, cy - S * 0.16, S * 0.03, S * 0.035, () => E.wrapLt); put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.16), E.oil); });
  stroke(put, cx + S * 0.05, cy - S * 0.12, cx + S * 0.05, cy - S * 0.02, 2, () => E.oil);
  stroke(put, cx - S * 0.02, cy - S * 0.05, cx + S * 0.02, cy - S * 0.05, 1, () => E.goldDkk);
  // toy-like crook, dragging flail
  stroke(put, cx - S * 0.12, cy + S * 0.06, cx - S * 0.12, cy - S * 0.08, 2, () => E.lapis);
  for (let a = 3.4; a < 5.6; a += 0.3) put(Math.round(cx - S * 0.12 + Math.cos(a) * S * 0.03), Math.round(cy - S * 0.08 + Math.sin(a) * S * 0.03), E.lapisLt);
  stroke(put, cx + S * 0.12, cy + S * 0.1, cx + S * 0.2, cy + S * 0.24, 2, () => E.goldDk);
  // small hovering wisps of curse
  [[-0.2, -0.2], [0.22, -0.16], [0.0, -0.38]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.curse));
}
// P7 · SERPENT PHARAOH — uraeus king, cobras coiling his arms.
function drawSerpentPharaoh(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  for (let y = 0; y < S * 0.34; y++) { const t = y / (S * 0.34), w = S * (0.08 + t * 0.12); row(put, Math.round(cy + y - S * 0.02), cx - w, cx + w, (tx) => { let b = mix(E.turq, E.turqDk, t); if (tx < 0.15 || tx > 0.85) b = mix(b, '#0e3a34', 0.5); return b; }); }
  // scale pattern
  for (let i = 0; i < 12; i++) put(Math.round(cx - S * 0.08 + (i * 43 % 100) / 100 * S * 0.16), Math.round(cy + S * 0.06 + (i * 29 % 100) / 100 * S * 0.2), E.turqLt);
  trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(cy - S * 0.02), 3);
  // head + big flared uraeus crown of cobras
  dome(put, cx, cy - S * 0.13, S * 0.065, S * 0.07, E.skin, '#e8b088', E.skinDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.14), E.gold));
  for (let k = -2; k <= 2; k++) {
    const bx = cx + k * S * 0.035;
    stroke(put, bx, cy - S * 0.2, bx + k * S * 0.01, cy - S * 0.32, S * 0.02, (t) => mix(E.gold, E.goldDk, t));
    dome(put, bx + k * S * 0.012, cy - S * 0.33, S * 0.018, S * 0.02, k % 2 ? E.turq : E.gold, E.goldLt, E.turqDk);
    put(Math.round(bx + k * S * 0.012), Math.round(cy - S * 0.34), E.red);
  }
  // live cobras coiling both arms
  [-1, 1].forEach(s => {
    serpent(put, cx + s * S * 0.2, cy + S * 0.06, S * 0.16, 2.4, S * 0.03, (t, ty) => mix(E.turqLt, E.turqDk, ty + t * 0.2));
    dome(put, cx + s * S * 0.28, cy - S * 0.02, S * 0.028, S * 0.024, E.turq, E.turqLt, E.turqDk);
    put(Math.round(cx + s * S * 0.28), Math.round(cy - S * 0.03), E.red);
  });
}
// P8 · THE JUDGE — feather crown, scales raised, stern executioner of souls.
function drawJudgeKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  for (let y = 0; y < S * 0.34; y++) { const t = y / (S * 0.34), w = S * (0.085 + t * 0.115); row(put, Math.round(cy + y - S * 0.02), cx - w, cx + w, (tx) => { let b = mix(E.wrapLt, E.wrapDk, t); if (tx > 0.44 && tx < 0.56) b = mix(b, E.red, 0.5); return b; }); }
  trim(put, cx - S * 0.085, cx + S * 0.085, Math.round(cy - S * 0.02), 3);
  dome(put, cx, cy - S * 0.13, S * 0.07, S * 0.075, E.skin, '#e8b088', E.skinDk);
  stroke(put, cx - S * 0.045, cy - S * 0.155, cx + S * 0.045, cy - S * 0.155, 2, () => E.oil); // stern brow
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.14), E.lapisDk));
  // twin maat-feather crown
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.03, cy - S * 0.2, cx + s * S * 0.05, cy - S * 0.4, S * 0.03, (t) => mix(E.turqLt, E.turqDk, t)); stroke(put, cx + s * S * 0.03, cy - S * 0.2, cx + s * S * 0.055, cy - S * 0.38, 1, () => E.turqDk); });
  trim(put, cx - S * 0.06, cx + S * 0.06, Math.round(cy - S * 0.215), 3);
  // raised golden scales (his weapon)
  stroke(put, cx - S * 0.18, cy + S * 0.14, cx - S * 0.18, cy - S * 0.24, S * 0.016, () => E.goldDk);
  stroke(put, cx - S * 0.3, cy - S * 0.22, cx - S * 0.06, cy - S * 0.26, S * 0.014, () => E.gold);
  [[-0.3, -0.22], [-0.06, -0.26]].forEach(([ox, oy]) => { ell(put, cx + ox * S, cy + oy * S + S * 0.08, S * 0.045, S * 0.018, (tx, ty) => mix(E.goldLt, E.goldDkk, ty)); [-1, 1].forEach(k => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + k * S * 0.03, cy + oy * S + S * 0.08, 1, () => E.goldDkk)); });
  ell(put, cx - S * 0.3, cy - S * 0.12, S * 0.02, S * 0.018, () => E.red); // a heart being weighed
  // ankh in the other hand
  stroke(put, cx + S * 0.16, cy + S * 0.12, cx + S * 0.16, cy - S * 0.04, 2, () => E.gold);
  stroke(put, cx + S * 0.12, cy - S * 0.04, cx + S * 0.2, cy - S * 0.04, 2, () => E.gold);
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + S * 0.16 + Math.cos(a) * S * 0.022), Math.round(cy - S * 0.075 + Math.sin(a) * S * 0.028), E.goldLt);
}
// P9 · SWARM KING — his body is dissolving into a locust storm.
function drawSwarmKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // intact lower robe
  for (let y = S * 0.1; y < S * 0.32; y++) { const t = (y - S * 0.1) / (S * 0.22), w = S * (0.11 + t * 0.09); row(put, Math.round(cy + y), cx - w, cx + w, (tx) => mix(E.wrap, E.wrapDkk, t * 0.7)); }
  trim(put, cx - S * 0.19, cx + S * 0.19, Math.round(cy + S * 0.3), 3);
  // torso half-dissolved: solid left, scattering right
  dome(put, cx - S * 0.03, cy + S * 0.02, S * 0.11, S * 0.13, E.wrap, E.wrapLt, E.wrapDkk);
  let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 30; i++) {
    const t = rnd();
    const x = cx + S * 0.04 + t * S * 0.34, y = cy - S * 0.06 + (rnd() - 0.4) * S * 0.3;
    ell(put, x, y, S * 0.016, S * 0.01, (tx, ty) => mix(E.sandDk, E.tombDk, ty));
    if (rnd() > 0.7) put(Math.round(x + 2), Math.round(y - 1), E.sandLt);
  }
  // gold mask intact but eye sockets streaming bugs
  dome(put, cx - S * 0.02, cy - S * 0.16, S * 0.075, S * 0.09, E.gold, E.goldLt, E.goldDkk);
  nemes(put, cx - S * 0.02, cy - S * 0.24, S * 0.07, S * 0.05, E.lapis, E.gold);
  [-1, 1].forEach(s => ell(put, cx - S * 0.02 + s * S * 0.032, cy - S * 0.17, S * 0.02, S * 0.024, () => E.oil));
  [[0.04, -0.13], [0.08, -0.1], [0.12, -0.14]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.013, S * 0.008, () => E.tombDk));
  put(Math.round(cx - S * 0.05), Math.round(cy - S * 0.17), E.curse);
}
// P10 · OSIRIAN KING — green-skinned risen god-king, atef crown.
function drawOsirianKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // shroud-wrapped body (mummiform, arms crossed)
  wraps(put, cx, cy + S * 0.1, S * 0.13, S * 0.24, 0.6);
  trim(put, cx - S * 0.12, cx + S * 0.12, Math.round(cy + S * 0.28), 3);
  crookFlail(put, cx, cy + S * 0.04, S * 0.09);
  // green face of the risen god
  dome(put, cx, cy - S * 0.15, S * 0.07, S * 0.08, '#5a9e5a', '#8ecf8a', '#2c6e34');
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.045, cy - S * 0.17, cx + s * S * 0.015, cy - S * 0.17, 1, () => E.oil); });
  stroke(put, cx, cy - S * 0.09, cx, cy - S * 0.05, S * 0.018, () => E.lapisDk); // false beard
  // atef crown: tall cone + side plumes
  for (let y = 0; y < S * 0.16; y++) { const t = y / (S * 0.16), w = S * (0.04 - t * 0.022); row(put, Math.round(cy - S * 0.36 + y), cx - w, cx + w, (tx) => mix(E.wrapLt, E.wrapDk, t * 0.5)); }
  ell(put, cx, cy - S * 0.37, S * 0.018, S * 0.018, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy - S * 0.22, cx + s * S * 0.07, cy - S * 0.36, S * 0.024, (t) => mix(E.turqLt, E.turqDk, t)));
  // resurrection light from below
  ell(put, cx, cy + S * 0.32, S * 0.18, S * 0.03, () => E.curseDk);
  [[-0.12, 0.26], [0.14, 0.24]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.curseLt));
}

// ======================= ANUBIS FORMS (phase 2) =======================
// A1 · WARDEN OF SCALES — classic Anubis, was-staff + belt scales.
function drawWarden(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy + S * 0.16, cx + s * S * 0.09, cy + S * 0.34, S * 0.04, () => E.jackal));
  // kilt + torso
  for (let y = 0; y < S * 0.12; y++) { const t = y / (S * 0.12), w = S * (0.1 + t * 0.04); row(put, Math.round(cy + S * 0.06 + y), cx - w, cx + w, (tx) => mix(E.gold, E.goldDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.4)); }
  plate(put, cx - S * 0.1, cy - S * 0.12, cx + S * 0.1, cy + S * 0.06, E.jackal, E.jackalLt, E.jackalDk);
  trim(put, cx - S * 0.1, cx + S * 0.1, Math.round(cy - S * 0.12), 4);
  // arms: one holds tall was-staff
  stroke(put, cx - S * 0.1, cy - S * 0.08, cx - S * 0.2, cy + S * 0.08, S * 0.035, () => E.jackal);
  stroke(put, cx + S * 0.1, cy - S * 0.08, cx + S * 0.2, cy + S * 0.04, S * 0.035, () => E.jackalDk);
  stroke(put, cx - S * 0.21, cy - S * 0.3, cx - S * 0.21, cy + S * 0.34, S * 0.018, () => E.goldDk);
  stroke(put, cx - S * 0.21, cy - S * 0.3, cx - S * 0.16, cy - S * 0.34, S * 0.022, () => E.gold);
  // scales dangling from the belt
  stroke(put, cx + S * 0.06, cy + S * 0.1, cx + S * 0.06, cy + S * 0.16, 1, () => E.goldDkk);
  ell(put, cx + S * 0.06, cy + S * 0.18, S * 0.03, S * 0.012, (tx, ty) => mix(E.goldLt, E.goldDkk, ty));
  jackalHead(put, cx, cy - S * 0.24, S * 0.075, E.jackal, E.jackalLt, E.jackalDk, E.gold);
}
// A2 · THE EXECUTIONER — twin khopesh berserker.
function drawExecutioner(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.07, cy + S * 0.14, cx + s * S * 0.11, cy + S * 0.32, S * 0.045, () => E.jackal));
  // broad battle-scarred torso
  plate(put, cx - S * 0.13, cy - S * 0.14, cx + S * 0.13, cy + S * 0.1, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.08, cy - S * 0.1, cx + S * 0.02, cy + S * 0.02, 1, () => E.curse); // glowing scar
  trim(put, cx - S * 0.13, cx + S * 0.13, Math.round(cy + S * 0.06), 3);
  // both arms raised w/ khopesh blades
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy - S * 0.1, cx + s * S * 0.26, cy - S * 0.2, S * 0.04, () => E.jackalDk);
    stroke(put, cx + s * S * 0.26, cy - S * 0.2, cx + s * S * 0.3, cy - S * 0.32, S * 0.022, () => E.goldDk);
    for (let a = 0; a < 1.4; a += 0.14) {
      const bx2 = cx + s * (S * 0.3 + Math.sin(a) * S * 0.09), by2 = cy - S * 0.32 - (1 - Math.cos(a)) * S * 0.08;
      ell(put, bx2, by2, S * 0.022, S * 0.018, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.3));
    }
  });
  jackalHead(put, cx, cy - S * 0.26, S * 0.08, E.jackal, E.jackalLt, E.jackalDk, E.red);
  // battle stance dust
  [[-0.2, 0.34], [0.22, 0.32]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
}
// A3 · COLOSSUS — the obsidian statue itself walks.
function drawColossusAnubis(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.12 - S * 0.05, cy + S * 0.12, cx + s * S * 0.12 + S * 0.05, cy + S * 0.34, E.obsidian, E.jackalLt, E.oil));
  plate(put, cx - S * 0.18, cy - S * 0.16, cx + S * 0.18, cy + S * 0.12, E.obsidian, E.jackalLt, E.oil);
  glyphs(put, cx - S * 0.15, cy - S * 0.12, cx + S * 0.15, cy + S * 0.08, E.curseDk);
  trim(put, cx - S * 0.18, cx + S * 0.18, Math.round(cy - S * 0.16), 5);
  // cracked joints leaking curse light
  [[-0.12, 0.12], [0.1, -0.02]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.05, cy + oy * S + S * 0.08, 1, () => E.curse));
  // heavy stone arms
  [-1, 1].forEach(s => { plate(put, cx + s * S * 0.26 - S * 0.05, cy - S * 0.14, cx + s * S * 0.26 + S * 0.05, cy + S * 0.14, E.obsidian, E.jackalLt, E.oil); dome(put, cx + s * S * 0.26, cy + S * 0.17, S * 0.06, S * 0.05, E.obsidian, E.jackalLt, E.oil); });
  jackalHead(put, cx, cy - S * 0.28, S * 0.085, E.obsidian, E.jackalLt, E.oil, E.curse);
  // gold pectoral
  for (let i = 0; i < 2; i++) trim(put, cx - S * (0.09 + i * 0.03), cx + S * (0.09 + i * 0.03), Math.round(cy - S * 0.1 + i * 4), 3);
}
// A4 · THE HUNTER — lean, low, all-fours pounce stance.
function drawHunterAnubis(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  // low lean body stretched forward
  ell(put, cx + S * 0.02, cy, S * 0.22, S * 0.1, (tx, ty) => mix(E.jackalLt, E.jackalDk, clamp(ty * 1.25, 0, 1)));
  // four braced limbs w/ claws
  [[-0.2, -0.06], [-0.08, 0.02], [0.1, 0.02], [0.22, -0.04]].forEach(([o, k], i) => {
    stroke(put, cx + o * S, cy + S * 0.04, cx + (o + k) * S, cy + S * 0.22, S * 0.032, () => (i % 2 ? E.jackal : E.jackalDk));
    [-1, 0, 1].forEach(c => stroke(put, cx + (o + k) * S, cy + S * 0.22, cx + (o + k) * S + c * S * 0.02, cy + S * 0.26, 1, () => E.bone));
  });
  // neck stretched + head low, jaws open
  stroke(put, cx - S * 0.2, cy - S * 0.04, cx - S * 0.3, cy - S * 0.1, S * 0.05, () => E.jackal);
  jackalHead(put, cx - S * 0.32, cy - S * 0.12, S * 0.06, E.jackal, E.jackalLt, E.jackalDk, E.red);
  // open jaw fangs
  stroke(put, cx - S * 0.4, cy - S * 0.08, cx - S * 0.34, cy - S * 0.04, S * 0.03, () => E.jackalDk);
  [[-0.4, -0.07], [-0.37, -0.05]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.bone));
  // whip tail high
  stroke(put, cx + S * 0.22, cy - S * 0.04, cx + S * 0.36, cy - S * 0.18, S * 0.022, (t) => mix(E.jackal, E.jackalDk, t));
  // gold anklets
  [[-0.28, 0.16], [0.32, 0.16]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.03, cy + oy * S, 2, () => E.gold));
}
// A5 · WARRIOR PRIEST — gold cuirass + tall spear + shield.
function drawWarriorPriest(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy + S * 0.16, cx + s * S * 0.08, cy + S * 0.32, S * 0.038, () => E.jackal));
  // gold scale cuirass
  plate(put, cx - S * 0.11, cy - S * 0.12, cx + S * 0.11, cy + S * 0.08, E.gold, E.goldLt, E.goldDkk);
  for (let yy = 0; yy < 5; yy++) for (let xx = -2; xx <= 2; xx++) put(Math.round(cx + xx * S * 0.04), Math.round(cy - S * 0.08 + yy * S * 0.035), E.goldDk);
  // red cape edge
  stroke(put, cx - S * 0.12, cy - S * 0.1, cx - S * 0.18, cy + S * 0.18, S * 0.04, (t) => mix(E.red, E.redDk, t));
  // spear + horus shield
  stroke(put, cx + S * 0.18, cy - S * 0.38, cx + S * 0.18, cy + S * 0.32, S * 0.016, () => E.stoneDk);
  for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy - S * 0.44 + y), cx + S * 0.18 - y * 0.3, cx + S * 0.18 + y * 0.3, () => mix(E.goldLt, E.goldDk, y / (S * 0.08)));
  ell(put, cx - S * 0.22, cy + S * 0.02, S * 0.07, S * 0.1, (tx, ty) => mix(E.lapisLt, E.lapisDk, ty));
  horusEye(put, cx - S * 0.22, cy + S * 0.0, S * 0.025, E.goldLt, E.goldDkk);
  jackalHead(put, cx, cy - S * 0.24, S * 0.075, E.jackal, E.jackalLt, E.jackalDk, E.gold);
  // crested helm band
  trim(put, cx - S * 0.06, cx + S * 0.06, Math.round(cy - S * 0.3), 3);
}
// A6 · THE DEVOURER — ammit-blooded: croc jaw, heavier, wrong.
function drawDevourer(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, cy + S * 0.14, cx + s * S * 0.12, cy + S * 0.32, S * 0.05, () => E.jackalDk));
  // massive hunched torso
  dome(put, cx, cy + S * 0.0, S * 0.17, S * 0.18, E.jackal, E.jackalLt, E.jackalDk);
  // scaled belly plates (croc)
  for (let i = 0; i < 4; i++) row(put, Math.round(cy + S * 0.02 + i * S * 0.04), cx - S * 0.09, cx + S * 0.09, () => mix(E.curseDk, E.jackalDk, 0.5));
  // head: jackal ears but a huge CROC jaw
  dome(put, cx, cy - S * 0.2, S * 0.08, S * 0.07, E.jackal, E.jackalLt, E.jackalDk);
  [-1, 1].forEach(k => stroke(put, cx + k * S * 0.04, cy - S * 0.26, cx + k * S * 0.06, cy - S * 0.34, S * 0.028, () => E.jackal));
  // long toothed snout
  stroke(put, cx - S * 0.06, cy - S * 0.18, cx - S * 0.28, cy - S * 0.14, S * 0.05, (t) => mix(E.curseDk, E.jackalDk, t * 0.5));
  stroke(put, cx - S * 0.06, cy - S * 0.13, cx - S * 0.26, cy - S * 0.08, S * 0.04, (t) => mix(E.jackalDk, E.oil, t * 0.5));
  for (let i = 0; i < 5; i++) { put(Math.round(cx - S * 0.09 - i * S * 0.04), Math.round(cy - S * 0.15), E.bone); put(Math.round(cx - S * 0.11 - i * S * 0.035), Math.round(cy - S * 0.11), E.bone); }
  optic(put, cx + S * 0.01, cy - S * 0.22, S * 0.024, E.redDk, E.red, E.redLt);
  // claw arms dragging
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.16, cy - S * 0.02, cx + s * S * 0.28, cy + S * 0.16, S * 0.045, () => E.jackal); [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.28, cy + S * 0.16, cx + s * S * 0.28 + k * S * 0.025, cy + S * 0.22, 2, () => E.bone)); });
  // devoured hearts glow in the belly
  ell(put, cx, cy + S * 0.06, S * 0.03, S * 0.026, (tx, ty) => mix(E.redLt, E.redDk, ty));
}
// A7 · SHADOW JACKAL — semi-ethereal curse-smoke body.
function drawShadowJackal(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // smoke wisps rising off the whole form
  let seed = 5; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 16; i++) {
    const x = cx + (rnd() - 0.5) * S * 0.4, y = cy + (rnd() - 0.6) * S * 0.5;
    ell(put, x, y, S * 0.03 * rnd() + S * 0.012, S * 0.02, (tx, ty) => mix(E.curseDk, E.obsidian, ty + rnd() * 0.3));
  }
  // body of layered dark smoke
  dome(put, cx, cy + S * 0.06, S * 0.16, S * 0.2, E.obsidian, mix(E.curseDk, E.obsidian, 0.5), E.oil);
  dome(put, cx, cy + S * 0.2, S * 0.2, S * 0.12, E.obsidian, mix(E.curseDk, E.obsidian, 0.6), E.oil);
  // it has no legs — trails away at the base
  [[-0.14, 0.3], [0.0, 0.34], [0.14, 0.3]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S + S * 0.06, S * 0.025, (t) => mix(E.obsidian, E.curseDk, t)));
  jackalHead(put, cx, cy - S * 0.18, S * 0.08, E.obsidian, mix(E.curse, E.obsidian, 0.6), E.oil, E.curse);
  // burning pawprints it leaves
  [[-0.32, 0.36], [0.3, 0.38]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.022, S * 0.012, () => E.curseDk));
  // solid gold collar — the only physical thing
  trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(cy - S * 0.08), 4);
}
// A8 · DUNE REAPER — scythe-armed harvester of the unjudged.
function drawDuneReaper(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy + S * 0.14, cx + s * S * 0.09, cy + S * 0.32, S * 0.04, () => E.jackal));
  // wrapped reaper robes over jackal frame
  for (let y = 0; y < S * 0.28; y++) { const t = y / (S * 0.28), w = S * (0.09 + t * 0.1); row(put, Math.round(cy - S * 0.1 + y), cx - w, cx + w, (tx) => { let b = mix(E.wrapDk, E.wrapDkk, t); if (tx < 0.15 || tx > 0.85) b = mix(b, E.oil, 0.4); return b; }); }
  trim(put, cx - S * 0.09, cx + S * 0.09, Math.round(cy - S * 0.1), 3);
  jackalHead(put, cx, cy - S * 0.22, S * 0.075, E.jackal, E.jackalLt, E.jackalDk, E.flame);
  // the great scythe: gold khopesh blade on a long staff
  stroke(put, cx - S * 0.26, cy + S * 0.32, cx + S * 0.16, cy - S * 0.34, S * 0.02, () => E.stoneDkk);
  for (let a = 0; a < 1.8; a += 0.12) {
    const bx2 = cx + S * 0.16 + Math.sin(a) * S * 0.16, by2 = cy - S * 0.34 + (1 - Math.cos(a)) * S * 0.1;
    ell(put, bx2, by2, S * 0.026, S * 0.02, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.25));
  }
  // souls (sand wisps) drawn toward the blade
  [[0.34, -0.16], [0.4, -0.24], [0.3, -0.3]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
}
// A9 · GATEKEEPER — giant ankh-key + soul chains.
function drawGatekeeper(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy + S * 0.16, cx + s * S * 0.09, cy + S * 0.33, S * 0.042, () => E.jackal));
  plate(put, cx - S * 0.12, cy - S * 0.12, cx + S * 0.12, cy + S * 0.1, E.jackal, E.jackalLt, E.jackalDk);
  trim(put, cx - S * 0.12, cx + S * 0.12, Math.round(cy - S * 0.12), 4);
  // chains crossing the chest, padlock charms
  stroke(put, cx - S * 0.12, cy - S * 0.1, cx + S * 0.12, cy + S * 0.08, S * 0.016, (t) => (Math.floor(t * 14) % 2 ? E.goldDk : E.goldLt));
  stroke(put, cx + S * 0.12, cy - S * 0.1, cx - S * 0.12, cy + S * 0.08, S * 0.016, (t) => (Math.floor(t * 14) % 2 ? E.goldDk : E.goldLt));
  // the GIANT ankh key over one shoulder
  stroke(put, cx + S * 0.2, cy + S * 0.3, cx + S * 0.2, cy - S * 0.22, S * 0.03, () => E.gold);
  stroke(put, cx + S * 0.13, cy - S * 0.22, cx + S * 0.27, cy - S * 0.22, S * 0.028, () => E.gold);
  for (let a = 0; a < 6.28; a += 0.25) put(Math.round(cx + S * 0.2 + Math.cos(a) * S * 0.045), Math.round(cy - S * 0.3 + Math.sin(a) * S * 0.05), E.goldLt);
  // key teeth at the base
  [[0.16], [0.24]].forEach(([o]) => stroke(put, cx + o * S, cy + S * 0.3, cx + o * S, cy + S * 0.26, 2, () => E.goldDk));
  // dangling chain w/ a caged soul-wisp
  stroke(put, cx - S * 0.14, cy + S * 0.02, cx - S * 0.22, cy + S * 0.2, S * 0.014, (t) => (Math.floor(t * 10) % 2 ? E.goldDk : E.goldLt));
  ell(put, cx - S * 0.23, cy + S * 0.24, S * 0.03, S * 0.035, (tx, ty) => mix(E.turqLt, E.turqDk, ty));
  jackalHead(put, cx, cy - S * 0.24, S * 0.075, E.jackal, E.jackalLt, E.jackalDk, E.turq);
}
// A10 · GOD-KING FUSION — the pharaoh's mask fused onto the jackal.
function drawGodKing(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.07, cy + S * 0.14, cx + s * S * 0.1, cy + S * 0.32, S * 0.045, () => E.jackal));
  // regal torso: jackal body in the king's regalia
  plate(put, cx - S * 0.12, cy - S * 0.12, cx + S * 0.12, cy + S * 0.1, E.jackal, E.jackalLt, E.jackalDk);
  for (let i = 0; i < 3; i++) trim(put, cx - S * (0.1 + i * 0.02), cx + S * (0.1 + i * 0.02), Math.round(cy - S * 0.12 + i * 4), 3);
  for (let y = 0; y < S * 0.1; y++) { const t = y / (S * 0.1), w = S * (0.1 + t * 0.05); row(put, Math.round(cy + S * 0.08 + y), cx - w, cx + w, (tx) => { const st = Math.floor(tx * 8) % 2; return mix(st ? E.gold : E.lapis, E.oil, t * 0.3); }); }
  // jackal head WEARING the cracked gold mask + nemes
  nemes(put, cx, cy - S * 0.26, S * 0.1, S * 0.1, E.lapis, E.gold);
  jackalHead(put, cx, cy - S * 0.26, S * 0.07, E.gold, E.goldLt, E.goldDkk, E.curse);
  // crack across the mask leaking curse
  stroke(put, cx - S * 0.03, cy - S * 0.33, cx + S * 0.02, cy - S * 0.2, 1, () => E.curse);
  // crook + flail now WEAPONS, held wide
  stroke(put, cx - S * 0.14, cy - S * 0.06, cx - S * 0.28, cy - S * 0.26, S * 0.025, () => E.lapis);
  for (let a = 3.4; a < 5.8; a += 0.25) put(Math.round(cx - S * 0.28 + Math.cos(a) * S * 0.04), Math.round(cy - S * 0.26 + Math.sin(a) * S * 0.04), E.lapisLt);
  stroke(put, cx + S * 0.14, cy - S * 0.06, cx + S * 0.26, cy - S * 0.22, S * 0.025, () => E.goldDk);
  [-0.02, 0.02, 0.06].forEach(o => stroke(put, cx + S * 0.26 + o * S, cy - S * 0.22, cx + S * 0.3 + o * S * 1.5, cy - S * 0.34, S * 0.014, () => E.gold));
}

// ========================================================================
const PHARAOHS = [
  { n: 1, name: 'THE GILDED KING', role: 'classic death mask', draw: drawGildedKing },
  { n: 2, name: 'THE HOLLOW KING', role: 'empty wraps + mask', draw: drawHollowKing },
  { n: 3, name: 'KHUFU-KA', role: 'hulking mummy lord', draw: drawKhufuKa },
  { n: 4, name: 'THE HERETIC', role: 'cracked, curse leaking', draw: drawHeretic },
  { n: 5, name: 'SORCERER KING', role: 'scroll + was-scepter', draw: drawSorcererKing },
  { n: 6, name: 'THE CHILD KING', role: 'small + wrong', draw: drawChildKing },
  { n: 7, name: 'SERPENT PHARAOH', role: 'cobra king', draw: drawSerpentPharaoh },
  { n: 8, name: 'THE JUDGE', role: 'scales + feather crown', draw: drawJudgeKing },
  { n: 9, name: 'SWARM KING', role: 'dissolving into locusts', draw: drawSwarmKing },
  { n: 10, name: 'OSIRIAN KING', role: 'green risen god', draw: drawOsirianKing },
];
const ANUBIS = [
  { n: 1, name: 'WARDEN OF SCALES', role: 'classic anubis', draw: drawWarden },
  { n: 2, name: 'THE EXECUTIONER', role: 'twin khopesh', draw: drawExecutioner },
  { n: 3, name: 'COLOSSUS', role: 'living statue', draw: drawColossusAnubis },
  { n: 4, name: 'THE HUNTER', role: 'feral four-legged', draw: drawHunterAnubis },
  { n: 5, name: 'WARRIOR PRIEST', role: 'spear + shield', draw: drawWarriorPriest },
  { n: 6, name: 'THE DEVOURER', role: 'ammit croc-jaw', draw: drawDevourer },
  { n: 7, name: 'SHADOW JACKAL', role: 'curse-smoke form', draw: drawShadowJackal },
  { n: 8, name: 'DUNE REAPER', role: 'great scythe', draw: drawDuneReaper },
  { n: 9, name: 'GATEKEEPER', role: 'ankh key + chains', draw: drawGatekeeper },
  { n: 10, name: 'GOD-KING FUSION', role: 'mask fused on jackal', draw: drawGodKing },
];

(async () => {
  await renderSheet({ list: PHARAOHS, out: process.argv[2] || 'pyramid_boss_pharaoh.png', title: 'PYRAMID BOSS PHASE 1 — PHARAOH FORMS (pick 1)', S: 160, cols: 5 });
  await renderSheet({ list: ANUBIS, out: process.argv[3] || 'pyramid_boss_anubis.png', title: 'PYRAMID BOSS PHASE 2 — ANUBIS GUARDIAN FORMS (pick 1)', S: 160, cols: 5 });
})().catch(e => { console.error(e); process.exit(1); });
