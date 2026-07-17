// artdev/underworld/render_supreme_eye.js — SUPREME BEING take 2 per
// Red: "what if he looked more like a eye with huge wings".
// 10 work-ups on eyeGod(put,S,p) — a colossal eye borne on wings.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, renderSheet, lick, soulMote } = KIT;

const G = {
  gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a',
  wing: '#f8f6ee', wingDk: '#b0aa98', sky: '#a8d8f0', skyDk: '#4a7a9a',
  white: '#ffffff', ink: '#2a2420'
};
function U(S) { const u = S / 160; return v => v * u; }
function bigWing(put, ax, ay, sd, s, lift, c, cDk) {
  // huge feathered wing: 4 layered rows of long feathers sweeping up+out
  for (let layer = 0; layer < 4; layer++) {
    const ls = s * (1 - layer * 0.18);
    for (let i = 0; i <= 11; i++) {
      const t = i / 11;
      const wx = ax + sd * t * ls * 1.6;
      const wy = ay - Math.sin(t * 2.6) * ls * (lift - layer * 0.16) + layer * s * 0.18;
      stroke(put, ax + sd * t * ls * 0.35, ay + layer * s * 0.16, wx, wy + ls * 0.26, Math.max(1, s * 0.075), () => mix(layer === 0 ? G.white : c, cDk, t * 0.5 + layer * 0.14));
    }
  }
}
function halo(put, cx, cy, r) {
  for (let a = 0; a < 6.28; a += 0.05) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
}
function rays(put, cx, cy, r0, r1, n, c) {
  for (let k = 0; k < n; k++) { const a = (k / n) * 6.28; stroke(put, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.1, () => c); }
}
function lightMotes(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + seed * 157) % 1000) / 1000 * S, y = ((i * 683 + seed * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.32 + (i % 4) * 0.14));
  }
}

// p: irisC/irisDk · pupil:'round'|'slit'|'star'|'bolt'|'galaxy'
//    wings:2|4|'ring' · wingC · haloS:'ring'|'triple'|'none' · rayAura
//    lidState:'open'|'half'|'closed' · goldLids · lashes · tears
//    orbitEyes · ophanRing · flameLids · seed
function eyeGod(put, S, p) {
  p = p || {};
  const X = U(S);
  lightMotes(put, S, 6, p.seed || 0);
  const EX = 80, EY = p.wings === 'ring' ? 80 : 74;
  const irisC = p.irisC || G.gold, irisDk = p.irisDk || G.goldDk;
  const wingC = p.wingC || G.wing;

  // ---- AURA
  if (p.rayAura) { rays(put, X(EX), X(EY), X(42), X(58), 16, mix(G.holy, H.night, 0.42)); }

  // ---- WINGS
  if (p.wings === 'ring') {
    // wings arranged radially around the eye
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * 6.28 + 0.39;
      const ax = EX + Math.cos(a) * 30, ay = EY + Math.sin(a) * 24;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        stroke(put, X(ax), X(ay), X(ax + Math.cos(a + (t - 0.5) * 0.7) * 26), X(ay + Math.sin(a + (t - 0.5) * 0.7) * 20), X(1.6), () => mix(t < 0.2 ? G.white : wingC, G.wingDk, t * 0.6));
      }
    }
  } else {
    bigWing(put, X(58), X(EY - 8), -1, X(34), 1.05, wingC, p.wingDk2 || G.wingDk);
    bigWing(put, X(102), X(EY - 8), 1, X(34), 1.05, wingC, p.wingDk2 || G.wingDk);
    if (p.wings === 4) {
      bigWing(put, X(60), X(EY + 14), -1, X(24), 0.75, wingC, p.wingDk2 || G.wingDk);
      bigWing(put, X(100), X(EY + 14), 1, X(24), 0.75, wingC, p.wingDk2 || G.wingDk);
    }
  }

  // ---- OPHAN RING (golden wheel studded with small eyes)
  if (p.ophanRing) {
    for (let a = 0; a < 6.28; a += 0.02) {
      const rx = EX + Math.cos(a) * 34, ry = EY + Math.sin(a) * 30;
      put(Math.round(X(rx)), Math.round(X(ry)), mix(G.goldLt, G.goldDk, (Math.sin(a * 6) + 1) / 2));
    }
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * 6.28;
      const rx = EX + Math.cos(a) * 34, ry = EY + Math.sin(a) * 30;
      ell(put, X(rx), X(ry), X(2.8), X(2.2), () => G.white);
      put(Math.round(X(rx)), Math.round(X(ry)), p.irisC ? irisC : G.skyDk);
    }
  }

  // ---- THE EYE (almond sclera)
  const RW = 26, RH = 17;
  for (let y = -RH; y <= RH; y++) {
    const t = Math.abs(y) / RH;
    const w = RW * Math.sqrt(Math.max(0, 1 - t * t));
    row(put, Math.round(X(EY + y)), X(EX - w), X(EX + w), (tx) => mix(G.white, '#c8c2b0', clamp(Math.abs(tx - 0.5) * 1.1 + t * 0.45, 0, 1)));
  }
  // lid state controls visible iris
  const lid = p.lidState || 'open';
  // ---- IRIS + PUPIL
  if (lid !== 'closed') {
    const IR = lid === 'half' ? 9 : 11;
    ell(put, X(EX), X(EY), X(IR + 2), X(IR + 2), (tx, ty) => mix(mix(irisC, G.white, 0.3), irisDk, clamp((tx + ty) * 0.8, 0, 1))); // limbal ring blend
    ell(put, X(EX), X(EY), X(IR), X(IR), (tx, ty) => mix(mix(irisC, '#ffffff', 0.25), irisDk, clamp(tx * 1.15 + ty * 0.5 - 0.2, 0, 1)));
    // iris striations
    for (let a = 0; a < 6.28; a += 0.32) stroke(put, X(EX + Math.cos(a) * IR * 0.45), X(EY + Math.sin(a) * IR * 0.45), X(EX + Math.cos(a) * IR * 0.9), X(EY + Math.sin(a) * IR * 0.9), X(0.7), () => mix(irisDk, irisC, (Math.sin(a * 4) + 1) / 2));
    // pupil
    const pu = p.pupil || 'round';
    if (pu === 'slit') { for (let y = -7; y <= 7; y++) { const w = 2.2 * (1 - Math.abs(y) / 8); row(put, Math.round(X(EY + y)), X(EX - w), X(EX + w), () => H.night); } }
    else if (pu === 'star') { for (let k = 0; k < 4; k++) { const a = k / 4 * 6.28 + 0.785; stroke(put, X(EX), X(EY), X(EX + Math.cos(a) * 6), X(EY + Math.sin(a) * 6), X(1.6), () => H.night); } ell(put, X(EX), X(EY), X(2.4), X(2.4), () => H.night); }
    else if (pu === 'bolt') { let bx = EX - 2, by = EY - 5; [[3, 4], [-2, 3], [3, 4]].forEach(([dx, dy]) => { stroke(put, X(bx), X(by), X(bx + dx), X(by + dy), X(1.6), () => H.night); bx += dx; by += dy; }); put(Math.round(X(EX)), Math.round(X(EY)), '#fff6b0'); }
    else if (pu === 'galaxy') { for (let i = 0; i <= 30; i++) { const t = i / 30; put(Math.round(X(EX + Math.cos(t * 12) * t * 6)), Math.round(X(EY + Math.sin(t * 12) * t * 5)), i % 3 ? '#2a1a4a' : G.white); } }
    else ell(put, X(EX), X(EY), X(4.4), X(4.4), () => H.night);
    // glint
    ell(put, X(EX - 4), X(EY - 4), X(2.2), X(1.8), () => G.white);
  }
  // ---- LIDS
  const lidC = p.goldLids ? G.gold : '#e8d8c0', lidDk = p.goldLids ? G.goldDk : '#a08a68';
  // upper lid arc
  const lidDrop = lid === 'closed' ? RH * 1.7 : lid === 'half' ? RH * 0.9 : RH * 0.35;
  for (let x = -RW; x <= RW; x++) {
    const t = Math.abs(x) / RW;
    const edge = EY - RH * Math.sqrt(Math.max(0, 1 - t * t));
    const lidY = edge + lidDrop * Math.sqrt(Math.max(0, 1 - t * t));
    for (let y = edge - 2; y <= lidY; y++) put(Math.round(X(EX + x)), Math.round(X(y)), mix(lidC, lidDk, clamp((y - edge + 2) / Math.max(1, lidDrop) * 0.7 + t * 0.3, 0, 1)));
  }
  if (lid === 'closed') stroke(put, X(EX - RW * 0.8), X(EY + 2), X(EX + RW * 0.8), X(EY + 2), X(1.2), () => lidDk);
  // lower lid rim
  for (let x = -RW; x <= RW; x++) { const t = Math.abs(x) / RW; const edge = EY + RH * Math.sqrt(Math.max(0, 1 - t * t)); put(Math.round(X(EX + x)), Math.round(X(edge)), lidDk); }
  // lashes
  if (p.lashes) { for (let k = -3; k <= 3; k++) { const lx = EX + k * 7; const t = Math.abs(k) / 3.5; const edge = EY - RH * Math.sqrt(Math.max(0, 1 - (Math.abs(k * 7) / RW) ** 2)); stroke(put, X(lx), X(edge), X(lx + k * 1.2), X(edge - 6 + t * 2), X(1.2), () => lidDk); } }
  // flame lids
  if (p.flameLids) { for (let k = -2; k <= 2; k++) lick(put, X(EX + k * 10), X(EY - RH - 4 - (k % 2) * 3), X(4.4), H.lava, H.lavaLt); }

  // ---- TEARS of light
  if (p.tears) {
    [[-10], [10]].forEach(([o]) => {
      for (let i = 0; i <= 3; i++) { ell(put, X(EX + o), X(EY + RH + 6 + i * 9), X(1.8), X(2.8), () => mix(G.holyLt, H.night, i * 0.2)); }
      soulMote(put, X(EX + o), X(EY + RH + 40), X(2.4), 0.35);
    });
  }
  // ---- ORBITING mini-eyes
  if (p.orbitEyes) {
    [[36, 40, 0.8], [124, 44, 0.8], [46, 116, 0.7], [116, 112, 0.7]].forEach(([ox, oy, sc]) => {
      ell(put, X(ox), X(oy), X(7 * sc), X(4.6 * sc), (tx, ty) => mix(G.white, '#c8c2b0', clamp(Math.abs(tx - 0.5) * 1.2 + ty * 0.4, 0, 1)));
      ell(put, X(ox), X(oy), X(2.6 * sc), X(2.6 * sc), () => irisC);
      put(Math.round(X(ox)), Math.round(X(oy)), H.night);
    });
  }
  // ---- HALO
  const hs = p.haloS || 'ring';
  if (hs === 'ring') halo(put, X(EX), X(EY - RH - (p.wings === 'ring' ? 22 : 14)), X(13));
  else if (hs === 'triple') { halo(put, X(EX), X(EY - RH - 12), X(15)); halo(put, X(EX), X(EY - RH - 17), X(10)); halo(put, X(EX), X(EY - RH - 21), X(5)); }
}

const LIST = [
  { n: 1, name: 'THE WATCHER', role: 'gold iris, two HUGE wings', draw: (p, S) => eyeGod(p, S, { wings: 2, rayAura: true, seed: 1 }) },
  { n: 2, name: 'ALL-SEEING', role: 'sky iris, four wings, sun rays', draw: (p, S) => eyeGod(p, S, { wings: 4, irisC: G.sky, irisDk: G.skyDk, rayAura: true, seed: 2 }) },
  { n: 3, name: 'THE OPHAN', role: 'golden wheel studded w/ eyes', draw: (p, S) => eyeGod(p, S, { wings: 2, ophanRing: true, irisC: G.sky, irisDk: G.skyDk, seed: 3 }) },
  { n: 4, name: 'WEEPING GRACE', role: 'cries tears of light', draw: (p, S) => eyeGod(p, S, { wings: 2, tears: true, lidState: 'half', lashes: true, seed: 4 }) },
  { n: 5, name: 'BURNING GAZE', role: 'flame lids, slit pupil', draw: (p, S) => eyeGod(p, S, { wings: 2, flameLids: true, pupil: 'slit', irisC: '#ff9a3a', irisDk: '#8a3808', seed: 5 }) },
  { n: 6, name: 'THE CONGREGATION', role: 'mini-eyes orbit the great eye', draw: (p, S) => eyeGod(p, S, { wings: 4, orbitEyes: true, seed: 6 }) },
  { n: 7, name: 'THE DORMANT', role: 'lid CLOSED + lashes (opens to fight)', draw: (p, S) => eyeGod(p, S, { wings: 2, lidState: 'closed', lashes: true, haloS: 'triple', seed: 7 }) },
  { n: 8, name: 'STORM PUPIL', role: 'lightning-bolt pupil', draw: (p, S) => eyeGod(p, S, { wings: 4, pupil: 'bolt', irisC: '#8a9ab0', irisDk: '#3a4a5e', rayAura: true, seed: 8 }) },
  { n: 9, name: 'GOLD-LIDDED', role: 'gold armor lids, star pupil', draw: (p, S) => eyeGod(p, S, { wings: 4, goldLids: true, pupil: 'star', seed: 9 }) },
  { n: 10, name: 'THE INFINITE', role: 'galaxy pupil, WING RING', draw: (p, S) => eyeGod(p, S, { wings: 'ring', pupil: 'galaxy', irisC: '#9a8ae0', irisDk: '#3a2a6a', haloS: 'ring', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'supreme_eye_options.png', title: 'SUPREME BEING take 2 — THE EYE w/ huge wings — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { eyeGod, LIST };
