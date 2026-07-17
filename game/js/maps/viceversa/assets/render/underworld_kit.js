// artdev/underworld/underworld_kit.js — shared palette + helpers for
// THE UNDERWORLD option sheets (brimstone, lava light, the river of souls).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const H = {
  OUT: '#0e0608',
  // brimstone + obsidian
  rock: '#3a2430', rockLt: '#5c3a4a', rockDk: '#1e1018',
  obsid: '#241a2c', obsidLt: '#44324e', obsidDk: '#120c18',
  ash: '#7a7280', ashLt: '#a29aae', ashDk: '#3a3440',
  // fire
  lava: '#ff6a1e', lavaLt: '#ffd24a', lavaDk: '#8a2808',
  ember: '#ff9a3a', emberLt: '#ffd8a0',
  // demon skins
  demon: '#c83a34', demonLt: '#f07a5a', demonDk: '#661410',
  demonP: '#8a3a9a', demonPLt: '#c87ae0', demonPDk: '#40104a',
  demonB: '#4a3a6a', demonBLt: '#7a64a8', demonBDk: '#241a38',
  // souls
  soul: '#6ae4c8', soulLt: '#d2fff2', soulDk: '#1e6a58',
  // fel (green demon energy)
  fel: '#5aff2e', felLt: '#ccffb0', felDk: '#1e7a10',
  // bits
  bone: '#e0d8c4', boneDk: '#8a8270',
  horn: '#e8d8b8', hornDk: '#7a6a4a',
  gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#7a5410',
  iron: '#4a4552', ironDk: '#221f28',
  pale: '#e0a8c0', paleDk: '#9a6280',
  night: '#160a12',
  white: '#fff2ea'
};

// pair of curved demon horns
function horns(put, cx, cy, s, c, cDk, flare) {
  const f = flare == null ? 1 : flare;
  [[-1], [1]].forEach(([sd]) => {
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const hx = cx + sd * (s * 0.5 + t * s * 0.55 * f + Math.sin(t * 2) * s * 0.12);
      const hy = cy - t * s * 1.05 + t * t * s * 0.3;
      stroke(put, hx, hy, hx, hy, Math.max(1, s * 0.22 * (1 - t * 0.72)), () => mix(c || H.horn, cDk || H.hornDk, t * 0.7));
    }
  });
}
// bat-membrane wing: sd=-1 left, +1 right; anchored at (ax,ay)
function batWing(put, ax, ay, sd, s, c, cDk) {
  const tips = [[sd * s * 1.35, -s * 0.75], [sd * s * 1.55, -s * 0.1], [sd * s * 1.25, s * 0.45]];
  // membrane fill: fans from anchor toward each gap
  for (let g = 0; g < tips.length - 1; g++) {
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x1 = ax + tips[g][0] + (tips[g + 1][0] - tips[g][0]) * t;
      const y1 = ay + tips[g][1] + (tips[g + 1][1] - tips[g][1]) * t - Math.sin(t * 3.14) * s * 0.18;
      stroke(put, ax, ay, x1, y1, 1.1, () => mix(c, cDk, 0.35 + t * 0.25));
    }
  }
  // fingers on top
  tips.forEach(([ox, oy]) => stroke(put, ax, ay, ax + ox, ay + oy, Math.max(1, s * 0.09), () => cDk));
  stroke(put, ax, ay, ax + sd * s * 0.5, ay - s * 0.85, Math.max(1, s * 0.11), () => cDk); // leading edge
}
// devil tail with arrow tip
function tail(put, x0, y0, sd, len, c, cDk) {
  let lx = x0, ly = y0;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const nx = x0 + sd * Math.sin(t * 2.6) * len * 0.55 + sd * t * len * 0.3;
    const ny = y0 + t * len * 0.5 - Math.sin(t * 3.14) * len * 0.14;
    stroke(put, lx, ly, nx, ny, Math.max(1, 2.4 * (1 - t * 0.5)), () => mix(c, cDk, t * 0.5));
    lx = nx; ly = ny;
  }
  // arrow tip
  stroke(put, lx, ly, lx + sd * 4, ly - 3, 1.4, () => cDk);
  stroke(put, lx, ly, lx + sd * 4, ly + 3, 1.4, () => cDk);
}
// small licking flame
function lick(put, cx, cy, s, c1, c2) {
  ell(put, cx, cy, s * 0.5, s, (tx, ty) => mix(c1, H.lavaDk, clamp(ty * 0.8 + Math.abs(tx - 0.5) * 0.9, 0, 1)));
  ell(put, cx, cy + s * 0.3, s * 0.24, s * 0.42, () => (c2 || H.lavaLt));
}
// drifting soul (tiny ghost face streak)
function soulMote(put, cx, cy, s, fade) {
  ell(put, cx, cy, s, s * 1.25, (tx, ty) => mix(mix(H.soulLt, H.night, fade), mix(H.soul, H.night, fade + 0.2), clamp(tx + ty * 0.5, 0, 1)));
  put(Math.round(cx - s * 0.35), Math.round(cy - s * 0.2), mix(H.night, H.soulDk, 0.4));
  put(Math.round(cx + s * 0.35), Math.round(cy - s * 0.2), mix(H.night, H.soulDk, 0.4));
}
// glowing lava cracks radiating on a body
function cracks(put, cx, cy, s, n, seed) {
  for (let k = 0; k < n; k++) {
    const a = (k / n) * 6.28 + (seed || 0);
    let lx = cx, ly = cy;
    for (let i = 0; i < 4; i++) {
      const nx = lx + Math.cos(a + Math.sin(i * 2.7) * 0.6) * s * 0.28;
      const ny = ly + Math.sin(a + Math.cos(i * 1.9) * 0.6) * s * 0.24;
      stroke(put, lx, ly, nx, ny, 1, () => mix(H.lava, H.lavaLt, (i % 2) * 0.5));
      lx = nx; ly = ny;
    }
  }
}
// floating embers in a cell
function embers(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S;
    const y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
    put(Math.round(x), Math.round(y), mix(i % 3 ? H.ember : H.lavaLt, H.night, 0.35 + (i % 4) * 0.14));
  }
}

module.exports = { R, H, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, horns, batWing, tail, lick, soulMote, cracks, embers };
