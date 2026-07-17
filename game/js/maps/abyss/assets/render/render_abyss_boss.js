// artdev/abyss/render_abyss_boss.js — 10 numbered THE LEVIATHAN
// work-ups. ONE parameterized leviathan() draw (sheriff/emperor
// pattern) — serpentine sea titan; combos/recolors = param tweaks.
'use strict';
const KIT = require('./abyss_kit.js');
const { A, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glowDot, tentacle, fin, bubbles } = KIT;

// p: {
//   scale:[base,lt,dk], belly, ghost (translucent), bone (skeletal),
//   headType: 'dragon'|'eel'|'angler'|'blunt', horns, crest:[c,cDk],
//   finStyle: 'sail'|'spines'|'ribbon'|'none',
//   eyeC, eyeGlow, jawGlow, photophores, lure, whiskers,
//   plates (armor bands), coils (2|3), tailFan, extraHeads
// }
function leviathan(put, S, p) {
  const base = p.scale[0], lt = p.scale[1], dk = p.scale[2];
  const belly = p.belly || lt;
  const seg = (tx, ty) => {
    let b = mix(lt, base, clamp(ty * 1.4, 0, 1));
    b = mix(b, dk, clamp((ty - 0.45) * 1.4, 0, 1));
    if (ty > 0.75) b = mix(b, belly, 0.4);
    if (tx > 0.86) b = mix(b, dk, 0.3);
    return p.ghost ? mix(b, A.deep, 0.35) : b;
  };
  // ---- serpent body: big S through the cell (2 visible arcs + tail)
  const path = (t) => { // 0..1 along the serpent
    const x = S * (0.82 - t * 0.66) + Math.sin(t * 9) * S * 0.02;
    const y = S * 0.62 + Math.sin(t * Math.PI * (p.coils || 2) + 0.6) * S * 0.17;
    return [x + Math.sin(t * 20) * 0, y];
  };
  // tail first (behind)
  for (let t = 1; t > 0.72; t -= 0.015) {
    const [px, py] = path(t);
    const w = S * (0.075 * (1 - t) / 0.28 + 0.008);
    ell(put, px, py, w, w, p.bone ? (tx, ty) => mix(A.bone, '#8a8670', tx + ty * 0.4) : seg);
  }
  if (p.tailFan) {
    const [tx0, ty0] = path(1);
    fin(put, tx0, ty0, tx0 + S * 0.09, ty0 - S * 0.06, tx0 + S * 0.07, ty0 + S * 0.07, p.crest ? p.crest[0] : base, dk);
  }
  // main body arcs
  for (let t = 0.72; t > 0.04; t -= 0.008) {
    const [px, py] = path(t);
    const w = S * (0.045 + Math.sin(Math.min((1 - t) * 1.8, 1) * Math.PI * 0.5) * 0.05);
    if (p.bone && (t * 40 | 0) % 3 === 0) { // skeletal: vertebrae + ribs
      ell(put, px, py, w * 0.55, w * 0.55, (tx, ty) => mix(A.bone, '#8a8670', tx + ty * 0.4));
      stroke(put, px, py - w * 0.6, px - 2, py + w * 0.9, 1.2, () => '#a8a088');
      stroke(put, px, py - w * 0.6, px + 3, py + w * 0.9, 1.2, () => '#8a8670');
      continue;
    }
    if (!p.bone) ell(put, px, py, w, w, seg);
    // armor plates
    if (p.plates && (t * 30 | 0) % 3 === 0) {
      row(put, Math.round(py - w * 0.7), px - w * 0.8, px + w * 0.8, () => mix(dk, A.oil, 0.3));
      row(put, Math.round(py - w * 0.5), px - w * 0.9, px + w * 0.9, () => lt);
    }
    // dorsal fin work
    if ((t * 26 | 0) % 2 === 0 && t > 0.1 && t < 0.68) {
      const [nx, ny] = path(t - 0.008);
      const upx = px, upy = py - w;
      if (p.finStyle === 'spines') stroke(put, upx, upy, upx + (nx - px) * 2, upy - S * (0.045 + Math.sin(t * 12) * 0.015), 1.6, () => (p.crest ? p.crest[1] : dk));
      if (p.finStyle === 'sail' && (t * 26 | 0) % 4 === 0) fin(put, upx, upy + 1, upx - S * 0.02, upy - S * 0.07, upx + S * 0.035, upy - S * 0.02, p.crest ? p.crest[0] : base, p.crest ? p.crest[1] : dk);
      if (p.finStyle === 'ribbon') stroke(put, upx, upy, upx + Math.sin(t * 25) * 3, upy - S * 0.035, 2.2, () => mix(p.crest ? p.crest[0] : lt, dk, Math.abs(Math.sin(t * 14))));
    }
    // photophore row
    if (p.photophores && (t * 40 | 0) % 4 === 0) put(Math.round(px), Math.round(py + w * 0.75), A.bio);
  }
  // ---- head at path(0.04), facing left
  const [hx, hy] = path(0.03);
  const hw = S * 0.105;
  if (p.headType === 'dragon') {
    ell(put, hx, hy, hw, hw * 0.82, p.bone ? (tx, ty) => mix(A.bone, '#8a8670', tx + ty * 0.3) : seg);
    // snout
    for (let t = 0; t < 1; t += 0.1) ell(put, hx - S * (0.06 + t * 0.075), hy + S * 0.012 + t * S * 0.012, hw * (0.6 - t * 0.3), hw * (0.5 - t * 0.25), p.bone ? (tx, ty) => mix(A.bone, '#8a8670', tx + ty * 0.3) : seg);
    // jaw open
    stroke(put, hx - S * 0.155, hy + S * 0.045, hx - S * 0.02, hy + S * 0.055, 1.8, () => A.oil);
    for (let i = 0; i < 5; i++) { put(Math.round(hx - S * (0.14 - i * 0.024)), Math.round(hy + S * 0.038), A.white); put(Math.round(hx - S * (0.13 - i * 0.024)), Math.round(hy + S * 0.062), A.white); }
    // nostril steam
    put(Math.round(hx - S * 0.15), Math.round(hy - S * 0.005), dk);
  } else if (p.headType === 'eel') {
    ell(put, hx, hy, hw * 0.9, hw * 0.7, seg);
    for (let t = 0; t < 1; t += 0.12) ell(put, hx - S * (0.05 + t * 0.06), hy + t * S * 0.008, hw * (0.7 - t * 0.3), hw * (0.55 - t * 0.2), seg);
    // hinged gape w/ needle teeth
    for (let a = -0.5; a < 0.5; a += 0.1) put(Math.round(hx - S * 0.11 + Math.cos(a) * S * 0.03), Math.round(hy + S * 0.03 + Math.sin(a) * S * 0.03), A.ink);
    for (let i = 0; i < 6; i++) { stroke(put, hx - S * (0.13 - i * 0.016), hy + S * 0.01, hx - S * (0.135 - i * 0.016), hy + S * 0.04, 0.9, () => A.white); }
  } else if (p.headType === 'angler') {
    ell(put, hx, hy, hw * 1.15, hw, seg);
    // huge downlit jaw
    for (let y = hy; y < hy + S * 0.075; y++) {
      const t = (y - hy) / (S * 0.075);
      row(put, Math.round(y), hx - S * (0.13 - t * 0.03), hx + S * 0.02, (tx) => mix(A.ink, A.pinkDk, tx * 0.4));
    }
    for (let i = 0; i < 7; i++) { stroke(put, hx - S * (0.12 - i * 0.02), hy, hx - S * (0.125 - i * 0.02), hy + S * 0.03, 1, () => A.white); stroke(put, hx - S * (0.11 - i * 0.02), hy + S * 0.075, hx - S * (0.105 - i * 0.02), hy + S * 0.045, 1, () => A.white); }
    // lure
    stroke(put, hx - S * 0.02, hy - S * 0.075, hx - S * 0.14, hy - S * 0.16, 1.4, () => dk);
    glowDot(put, hx - S * 0.155, hy - S * 0.175, S * 0.018, A.glow, A.glowLt);
  } else { // blunt (whale-ish ram head)
    ell(put, hx - S * 0.03, hy, hw * 1.25, hw * 0.9, seg);
    stroke(put, hx - S * 0.16, hy + S * 0.03, hx - S * 0.01, hy + S * 0.045, 1.6, () => A.oil);
    for (let i = 0; i < 4; i++) put(Math.round(hx - S * (0.13 - i * 0.03)), Math.round(hy + S * 0.038), A.white);
  }
  // eye
  const eyeC = p.eyeC || A.gold || '#e0a832';
  optic(put, hx - S * 0.025, hy - S * 0.025, S * 0.014, A.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
  if (p.eyeGlow) put(Math.round(hx - S * 0.025), Math.round(hy - S * 0.025), eyeC);
  // horns
  if (p.horns) {
    stroke(put, hx + S * 0.02, hy - S * 0.05, hx + S * 0.07, hy - S * 0.12, S * 0.016, () => (p.bone ? A.bone : mix(lt, A.white, 0.3)));
    stroke(put, hx + S * 0.05, hy - S * 0.04, hx + S * 0.11, hy - S * 0.09, S * 0.013, () => (p.bone ? '#a8a088' : mix(base, A.white, 0.2)));
  }
  // whiskers
  if (p.whiskers) [[-1, 0.02], [1, 0.04]].forEach(([s, dy]) => {
    for (let t = 0; t < 1; t += 0.1) put(Math.round(hx - S * (0.1 + t * 0.09)), Math.round(hy + S * dy + Math.sin(t * 6) * S * 0.02 * s), p.crest ? p.crest[0] : lt);
  });
  // jaw glow (inner light)
  if (p.jawGlow) glowDot(put, hx - S * 0.08, hy + S * 0.045, S * 0.012, p.jawGlow, A.white);
  // head crest
  if (p.crest && p.finStyle !== 'none') fin(put, hx + S * 0.04, hy - S * 0.05, hx + S * 0.1, hy - S * 0.13, hx + S * 0.12, hy - S * 0.04, p.crest[0], p.crest[1]);
  // extra heads (hydra)
  if (p.extraHeads) {
    [[0.28, -0.14, 0.75], [0.3, 0.13, 0.7]].forEach(([tPos, dy, sc]) => {
      const [nx, ny] = path(tPos);
      // neck
      for (let t = 0; t < 1; t += 0.08) ell(put, nx - t * S * 0.1, ny + dy * S * t, S * 0.03 * sc, S * 0.03 * sc, seg);
      const hx2 = nx - S * 0.1, hy2 = ny + dy * S;
      ell(put, hx2, hy2, hw * 0.6 * sc, hw * 0.5 * sc, seg);
      for (let t = 0; t < 1; t += 0.15) ell(put, hx2 - S * (0.03 + t * 0.04), hy2 + t * S * 0.008, hw * (0.4 - t * 0.15) * sc, hw * (0.32 - t * 0.12) * sc, seg);
      optic(put, hx2 - S * 0.01, hy2 - S * 0.012, S * 0.008, A.oil, eyeC, '#fff');
      stroke(put, hx2 - S * 0.07, hy2 + S * 0.02, hx2 - S * 0.01, hy2 + S * 0.025, 1.2, () => A.ink);
    });
  }
  // ambient bubbles
  bubbles(put, hx + S * 0.1, hy - S * 0.12, 3, 4);
}

const V = {
  serpentKing: {
    scale: ['#2a6a5a', '#5aaa8a', '#123a30'], belly: '#c8d8c0',
    headType: 'dragon', horns: true, crest: ['#e05a3a', '#8a2014'], finStyle: 'sail',
    eyeC: '#e0a832', coils: 2, tailFan: true, whiskers: false,
  },
  deepDragon: {
    scale: ['#28407a', '#4a6ab8', '#101c40'], belly: '#8ab0d8',
    headType: 'dragon', horns: true, crest: [A.bio, A.bioDk], finStyle: 'spines',
    eyeC: A.bio, eyeGlow: true, photophores: true, coils: 2, tailFan: true, jawGlow: A.bio,
  },
  anglerTitan: {
    scale: ['#3a3040', '#5a5064', '#16121c'], belly: '#6a6074',
    headType: 'angler', finStyle: 'ribbon', crest: [A.pink, A.pinkDk],
    eyeC: A.glow, eyeGlow: true, lure: true, photophores: true, coils: 2,
  },
  plated: {
    scale: ['#5a6a72', '#8a9aa4', '#2a343a'], belly: '#c2ccd0',
    headType: 'blunt', plates: true, finStyle: 'spines', crest: ['#8a9aa4', '#2a343a'],
    eyeC: '#e05a3a', coils: 2, tailFan: true, horns: true,
  },
  trenchEel: {
    scale: ['#4a6a3a', '#7a9a5a', '#22361a'], belly: '#a8b888',
    headType: 'eel', finStyle: 'ribbon', crest: ['#7a9a5a', '#22361a'],
    eyeC: '#d8e84a', eyeGlow: true, coils: 3, whiskers: true,
  },
  hydra: {
    scale: ['#6a2a4a', '#9a5a7a', '#3a1228'], belly: '#c8a0b0',
    headType: 'dragon', extraHeads: true, finStyle: 'spines', crest: ['#9a5a7a', '#3a1228'],
    eyeC: '#e0a832', coils: 2, tailFan: true,
  },
  ghost: {
    scale: ['#4a7a8a', '#8ac8d8', '#1e3a44'], belly: '#c8ecf4', ghost: true,
    headType: 'dragon', finStyle: 'ribbon', crest: ['#8ac8d8', '#1e3a44'],
    eyeC: A.bioLt, eyeGlow: true, photophores: true, coils: 2, jawGlow: A.bioLt,
  },
  boneWyrm: {
    scale: [A.bone, '#f4f0e0', '#8a8670'], bone: true,
    headType: 'dragon', horns: true, finStyle: 'none',
    eyeC: A.glow, eyeGlow: true, coils: 2,
  },
  stormMaw: {
    scale: ['#2a3a4a', '#4a5e74', '#101a24'], belly: '#7a8ea0',
    headType: 'blunt', finStyle: 'sail', crest: ['#d8e84a', '#6a7218'],
    eyeC: '#d8e84a', eyeGlow: true, coils: 2, tailFan: true, photophores: true, jawGlow: '#d8e84a',
  },
  crimsonQueen: {
    scale: ['#8a2030', '#c85a5a', '#40101a'], belly: '#e8a898',
    headType: 'eel', horns: true, finStyle: 'sail', crest: ['#f0cc80', '#8a5a1e'],
    eyeC: '#f0cc80', eyeGlow: true, coils: 3, tailFan: true, whiskers: true,
  },
};

const LIST = [
  { n: 1, name: 'SERPENT KING', role: 'sea-green classic', draw: (p, S) => leviathan(p, S, V.serpentKing) },
  { n: 2, name: 'DEEP DRAGON', role: 'blue, spined, glowing', draw: (p, S) => leviathan(p, S, V.deepDragon) },
  { n: 3, name: 'ANGLER TITAN', role: 'lure + nightmare jaw', draw: (p, S) => leviathan(p, S, V.anglerTitan) },
  { n: 4, name: 'PLATED LEVIATHAN', role: 'armored ram-head', draw: (p, S) => leviathan(p, S, V.plated) },
  { n: 5, name: 'TRENCH EEL', role: 'moray gape, whiskers', draw: (p, S) => leviathan(p, S, V.trenchEel) },
  { n: 6, name: 'HYDRA OF THE DEEP', role: 'three heads', draw: (p, S) => leviathan(p, S, V.hydra) },
  { n: 7, name: 'GHOST LEVIATHAN', role: 'translucent, lit', draw: (p, S) => leviathan(p, S, V.ghost) },
  { n: 8, name: 'BONE WYRM', role: 'skeletal, green stare', draw: (p, S) => leviathan(p, S, V.boneWyrm) },
  { n: 9, name: 'STORM MAW', role: 'charged ram-head', draw: (p, S) => leviathan(p, S, V.stormMaw) },
  { n: 10, name: 'CRIMSON QUEEN', role: 'red coils, gold crest', draw: (p, S) => leviathan(p, S, V.crimsonQueen) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_boss_options.png', title: 'THE LEVIATHAN — 10 WORK-UPS (combo + recolor welcome)', S: 190, cols: 5 });
}
module.exports = { leviathan, V, LIST };
