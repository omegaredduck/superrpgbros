// artdev/pyramid/render_pyramid_boss_final.js — NEFERU-KA final boss art:
// Phase 1 THE CHILD KING (Red's pick, pharaoh sheet #6) + Phase 2 THE
// EXECUTIONER (anubis sheet #2). One approval sheet, both forms, 2x scale.
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, wraps, trim, glyphs, horusEye, nemes, flame } = KIT;

// Phase 1 — THE CHILD KING, refined: floating, curse wisps, toy crook.
function drawChildKingFinal(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  // he FLOATS — no ground contact, a curse-light pool below
  ell(put, cx, S * 0.9, S * 0.16, S * 0.035, () => E.oil);
  ell(put, cx, S * 0.885, S * 0.1, S * 0.02, () => E.curseDk);
  // little slippered feet dangling
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.045, cy + S * 0.235, S * 0.03, S * 0.018, (tx, ty) => mix(E.gold, E.goldDkk, ty)));
  // tiny royal body — white gown w/ gold hem
  for (let y = 0; y < S * 0.22; y++) {
    const t = y / (S * 0.22), w = S * (0.05 + t * 0.08);
    row(put, Math.round(cy + y), cx - w, cx + w, (tx) => {
      let b = mix(E.wrapLt, E.wrapDk, t * 0.8);
      if (tx < 0.12 || tx > 0.88) b = mix(b, E.wrapDkk, 0.5);
      return b;
    });
  }
  trim(put, cx - S * 0.12, cx + S * 0.12, Math.round(cy + S * 0.2), 4);
  // tiny arms: one holds the toy crook, one drags the flail
  stroke(put, cx - S * 0.07, cy + S * 0.04, cx - S * 0.13, cy + S * 0.1, S * 0.025, () => E.wrapDk);
  stroke(put, cx + S * 0.07, cy + S * 0.04, cx + S * 0.13, cy + S * 0.12, S * 0.025, () => E.wrapDk);
  // usekh collar
  for (let i = 0; i < 2; i++) trim(put, cx - S * (0.06 + i * 0.02), cx + S * (0.06 + i * 0.02), Math.round(cy - S * 0.005 + i * 4), 3);
  // THE OVERSIZED MASK — half his height, serene and wrong
  dome(put, cx, cy - S * 0.16, S * 0.145, S * 0.175, E.gold, E.goldLt, E.goldDkk);
  nemes(put, cx, cy - S * 0.29, S * 0.135, S * 0.115, E.lapis, E.gold);
  // uraeus cobra
  stroke(put, cx, cy - S * 0.34, cx, cy - S * 0.395, S * 0.02, () => E.gold);
  dome(put, cx, cy - S * 0.405, S * 0.02, S * 0.022, E.gold, E.goldLt, E.goldDk);
  put(Math.round(cx), Math.round(cy - S * 0.41), E.red);
  // big serene almond eyes — hollow, one weeping black
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.055, cy - S * 0.185, S * 0.035, S * 0.04, () => E.wrapLt);
    ell(put, cx + s * S * 0.055, cy - S * 0.185, S * 0.02, S * 0.026, () => E.oil);
    put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.19), E.curse);
    stroke(put, cx + s * S * 0.09, cy - S * 0.205, cx + s * S * 0.02, cy - S * 0.21, 2, () => E.goldDkk); // kohl brow
  });
  // the black tear
  stroke(put, cx + S * 0.055, cy - S * 0.14, cx + S * 0.055, cy - S * 0.02, S * 0.014, () => E.oil);
  ell(put, cx + S * 0.055, cy - S * 0.005, S * 0.012, S * 0.016, () => E.oil);
  // small flat mouth + chin braid
  stroke(put, cx - S * 0.025, cy - S * 0.065, cx + S * 0.025, cy - S * 0.065, 2, () => E.goldDkk);
  stroke(put, cx, cy - S * 0.045, cx, cy + S * 0.0, S * 0.016, () => E.lapisDk);
  // toy crook (little) + dragging flail
  stroke(put, cx - S * 0.145, cy + S * 0.12, cx - S * 0.145, cy - S * 0.04, S * 0.018, () => E.lapis);
  for (let a = 3.3; a < 5.7; a += 0.25) put(Math.round(cx - S * 0.145 + Math.cos(a) * S * 0.032), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.032), E.lapisLt);
  stroke(put, cx + S * 0.135, cy + S * 0.13, cx + S * 0.2, cy + S * 0.27, S * 0.016, () => E.goldDk);
  [-0.015, 0.015, 0.045].forEach(o => stroke(put, cx + S * 0.2 + o * S, cy + S * 0.27, cx + S * 0.22 + o * S * 1.5, cy + S * 0.33, S * 0.01, () => E.gold));
  // curse wisps orbiting him
  [[-0.24, -0.3], [0.26, -0.24], [-0.28, 0.04], [0.3, 0.08], [0.0, -0.5]].forEach(([ox, oy], i) => {
    const px = Math.round(cx + ox * S), py = Math.round(cy + oy * S);
    ell(put, px, py, S * 0.016, S * 0.02, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
    put(px, py - 3, E.curse);
  });
}

// Phase 2 — THE EXECUTIONER, refined: taller, cape of wraps, twin khopesh.
function drawExecutionerFinal(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // torn wrap-cape streaming (the child's gown, outgrown)
  for (let i = 0; i < 5; i++)
    stroke(put, cx - S * 0.02, cy - S * 0.12 + i * 2.5, cx - S * 0.26 - i * S * 0.012, cy + S * 0.1 + i * S * 0.04, S * 0.032, (t) => mix(E.wrap, E.wrapDkk, t));
  // legs braced wide
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy + S * 0.12, cx + s * S * 0.13, cy + S * 0.3, S * 0.05, () => E.jackal);
    ell(put, cx + s * S * 0.14, cy + S * 0.32, S * 0.05, S * 0.025, (tx, ty) => mix(E.jackalDk, E.oil, ty));
    trim(put, cx + s * S * 0.13 - S * 0.03, cx + s * S * 0.13 + S * 0.03, Math.round(cy + S * 0.22), 3); // anklets
  });
  // gold-striped war kilt
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * (0.11 + t * 0.05);
    row(put, Math.round(cy + S * 0.06 + y), cx - w, cx + w, (tx) => {
      const st = Math.floor(tx * 9) % 2;
      return mix(st ? E.gold : E.lapisDk, E.oil, t * 0.35);
    });
  }
  // broad scarred torso
  plate(put, cx - S * 0.14, cy - S * 0.16, cx + S * 0.14, cy + S * 0.08, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.09, cy - S * 0.12, cx + S * 0.03, cy + S * 0.02, 2, () => E.curse); // the glowing scar
  stroke(put, cx + S * 0.05, cy - S * 0.08, cx + S * 0.1, cy - S * 0.02, 1, () => E.curseDk);
  // pectoral collar + child's-mask TROPHY on the belt
  for (let i = 0; i < 2; i++) trim(put, cx - S * (0.1 + i * 0.025), cx + S * (0.1 + i * 0.025), Math.round(cy - S * 0.16 + i * 4), 3);
  dome(put, cx - S * 0.06, cy + S * 0.1, S * 0.032, S * 0.04, E.gold, E.goldLt, E.goldDkk);
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.06 + s * 2), Math.round(cy + S * 0.09), E.oil));
  // both arms raised with khopesh blades
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.13, cy - S * 0.12, cx + s * S * 0.3, cy - S * 0.24, S * 0.045, () => E.jackalDk);
    trim(put, cx + s * S * 0.2 - S * 0.025, cx + s * S * 0.2 + S * 0.025, Math.round(cy - S * 0.19), 3); // armband
    stroke(put, cx + s * S * 0.3, cy - S * 0.24, cx + s * S * 0.34, cy - S * 0.4, S * 0.024, () => E.goldDkk);
    for (let a = 0; a < 1.5; a += 0.1) {
      const bx2 = cx + s * (S * 0.34 + Math.sin(a) * S * 0.11), by2 = cy - S * 0.4 - (1 - Math.cos(a)) * S * 0.1;
      ell(put, bx2, by2, S * 0.026, S * 0.02, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.28));
    }
    // curse light dripping off the blade tips
    put(Math.round(cx + s * S * 0.42), Math.round(cy - S * 0.5), E.curse);
  });
  // jackal head — snarling, red-eyed, gold ear-caps
  dome(put, cx, cy - S * 0.28, S * 0.09, S * 0.085, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.07, cy - S * 0.26, cx - S * 0.19, cy - S * 0.22, S * 0.05, (t) => mix(E.jackal, E.jackalDk, t * 0.7));
  // snarl: bared fangs along the snout
  [[-0.12, -0.235], [-0.15, -0.225], [-0.09, -0.24]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.bone));
  stroke(put, cx - S * 0.1, cy - S * 0.25, cx - S * 0.18, cy - S * 0.24, 1, () => E.oil);
  [-1, 1].forEach(k => {
    stroke(put, cx + k * S * 0.05, cy - S * 0.34, cx + k * S * 0.085, cy - S * 0.46, S * 0.038, (t) => mix(E.jackal, E.jackalDk, t * 0.5));
    trim(put, cx + k * S * 0.07 - S * 0.018, cx + k * S * 0.07 + S * 0.018, Math.round(cy - S * 0.43), 2); // gold ear caps
  });
  optic(put, cx - S * 0.03, cy - S * 0.3, S * 0.026, E.redDk, E.red, E.redLt);
  // black tear line under the eye — HIS tell, same as the mask's
  stroke(put, cx - S * 0.03, cy - S * 0.27, cx - S * 0.03, cy - S * 0.22, 1, () => E.oil);
}

renderSheet({
  list: [
    { n: 1, name: 'NEFERU-KA', role: 'phase 1 — THE ETERNAL CHILD', draw: drawChildKingFinal },
    { n: 2, name: 'THE EXECUTIONER', role: 'phase 2 — his true form', draw: drawExecutionerFinal },
  ],
  out: process.argv[2] || 'pyramid_boss_final.png',
  title: 'PYRAMID BOSS FINAL — NEFERU-KA, THE ETERNAL CHILD -> THE EXECUTIONER',
  S: 160, cols: 2, scale: 2
}).catch(e => { console.error(e); process.exit(1); });
