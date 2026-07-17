// artdev/swamp/render_swamp_tiles.js — 10 numbered WITCH'S SWAMP
// ground-tile candidates (seamless-ish 160px swatches).
'use strict';
const KIT = require('./swamp_kit.js');
const { S, mix, clamp, renderSheet, rune } = KIT;

function fill(put, Sz, fn) { for (let y = 0; y < Sz; y++) for (let x = 0; x < Sz; x++) { const c = fn(x, y, x / Sz, y / Sz); if (c) put(x, y, c); } }
function h2(x, y) { let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }

// 1 · BOG MOSS — base ground.
function tMoss(put, Sz) {
  fill(put, Sz, (x, y) => {
    const n = h2(x >> 1, y >> 1), m = h2((x >> 3) + 5, y >> 3);
    let b = mix(mix(S.bog, S.bogDk, n), S.bogDkk, m > 0.65 ? 0.6 : 0.1);
    if (h2(x + 4, y) > 0.985) b = S.bogLt;
    if (h2(x, y + 8) > 0.993) b = S.rot;
    return b;
  });
}
// 2 · MURK WATER — dark still swamp water.
function tMurk(put, Sz) {
  fill(put, Sz, (x, y) => {
    const w = Math.sin(x / 14 + Math.sin(y / 10) * 2) + Math.sin(y / 17);
    let b = mix(S.murk, S.murkDk, clamp(w * 0.35 + 0.5, 0, 1));
    if (w > 1.5) b = mix(b, S.murkLt, 0.7);
    if (h2(x, y) > 0.996) b = S.wispDk; // rare glints
    return b;
  });
}
// 3 · MUD FLAT — wet trodden mud.
function tMud(put, Sz) {
  fill(put, Sz, (x, y) => {
    let b = mix(S.mud, S.mudDk, h2(x >> 2, y >> 2) * 0.85);
    if (Math.sin(x / 8 + Math.sin(y / 15) * 3) > 0.88) b = mix(b, S.mudDk, 0.6); // boot ruts
    if (h2(x + 7, y + 2) > 0.985) b = S.mudLt;
    return b;
  });
}
// 4 · ROOT TANGLE — woven roots over dirt.
function tRoots(put, Sz) {
  fill(put, Sz, (x, y) => {
    let b = mix(S.mudDk, '#241a10', h2(x >> 2, y >> 2) * 0.7);
    const r1 = Math.abs(Math.sin(x / 13 + Math.sin(y / 7) * 2.2));
    const r2 = Math.abs(Math.sin(y / 11 - Math.sin(x / 9) * 1.8 + 2));
    if (r1 > 0.88) b = mix(S.wood, S.woodDk, h2(x >> 1, y >> 1));
    if (r2 > 0.92) b = mix(S.woodLt, S.woodDk, h2(x, y >> 1));
    return b;
  });
}
// 5 · PLANK PATH — swamp boardwalk.
function tPlanks(put, Sz) {
  fill(put, Sz, (x, y) => {
    const py = (y / 22) | 0, off = (py % 2) * 44;
    const ex = (x + off) % 88;
    let b = mix(S.wood, S.woodDk, h2(py * 5 + ((x + off) / 88 | 0), py) * 0.75);
    b = mix(b, S.woodDkk, Math.abs(Math.sin(x * 0.5 + py * 2)) * 0.15);
    if (y % 22 < 2 || ex < 2) b = S.woodDkk;
    if (h2(x, y) > 0.992) b = S.rot; // moss specks
    return b;
  });
}
// 6 · LILY SHALLOWS — pads on water.
function tLilies(put, Sz) {
  tMurk(put, Sz);
  for (let i = 0; i < 7; i++) {
    const cx = Math.floor(h2(i, 3) * Sz), cy = Math.floor(h2(i, 9) * Sz);
    const r = 8 + (i % 3) * 5;
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
      if (xx * xx / (r * r) + yy * yy / (r * r * 0.36) <= 1) {
        const tx = (xx + r) / (2 * r);
        put((cx + xx + Sz) % Sz, (cy + yy + Sz) % Sz, mix(S.bogLt, S.bogDk, clamp(tx + h2(xx, yy) * 0.3, 0, 1)));
      }
    }
    put(cx, cy, i % 2 ? '#e8c8e0' : S.bogDkk);
  }
}
// 7 · PEAT — dark spongy ground.
function tPeat(put, Sz) {
  fill(put, Sz, (x, y) => {
    const n = h2(x >> 1, y >> 1);
    let b = mix('#3a3226', '#1e1810', n * 0.8);
    if (h2(x + 3, y + 5) > 0.96) b = '#54483a';
    if (h2(x + 8, y + 1) > 0.99) b = S.rot;
    return b;
  });
}
// 8 · GLOW ALGAE — luminous swirls on murk.
function tAlgae(put, Sz) {
  fill(put, Sz, (x, y) => {
    const w = Math.sin(x / 14 + Math.sin(y / 10) * 2) + Math.sin(y / 17);
    let b = mix(S.murk, S.murkDk, clamp(w * 0.35 + 0.5, 0, 1));
    const sw = Math.abs(Math.sin(x / 19 + Math.sin(y / 12) * 3.2 + 1));
    if (sw > 0.9) b = mix(b, S.brew, 0.55 + h2(x, y) * 0.3);
    else if (sw > 0.84) b = mix(b, S.brewDk, 0.4);
    if (h2(x + 2, y) > 0.994) b = S.brewLt;
    return b;
  });
}
// 9 · RITUAL EARTH — packed dirt, scratched runes (boss arena).
function tRitual(put, Sz) {
  fill(put, Sz, (x, y) => {
    let b = mix('#4a3a34', '#2a201c', h2(x >> 2, y >> 2) * 0.8);
    if (h2(x + 5, y + 5) > 0.988) b = '#6a564e';
    return b;
  });
  // scratched glyphs
  for (let i = 0; i < 5; i++) {
    const gx = Math.floor(h2(i, 21) * (Sz - 20)) + 10, gy = Math.floor(h2(i, 27) * (Sz - 20)) + 10;
    rune(put, gx, gy, i % 2 ? S.witchDk : S.witch);
  }
  // faint ring arc
  for (let a = 0; a < 6.283; a += 0.05) put(Math.round(Sz / 2 + Math.cos(a) * Sz * 0.42), Math.round(Sz / 2 + Math.sin(a) * Sz * 0.42), S.witchDkk);
}
// 10 · TOXIC SEEP — brew-green ooze pockets.
function tSeep(put, Sz) {
  tMud(put, Sz);
  fill(put, Sz, (x, y) => {
    const p = Math.sin(x / 21 + Math.sin(y / 13) * 2.6) + Math.sin(y / 23 + 1);
    if (p > 1.15) {
      let b = mix(S.brew, S.brewDk, clamp((p - 1.15) * 1.4 + h2(x, y) * 0.3, 0, 1));
      if (h2(x + 1, y + 1) > 0.98) b = S.brewLt; // bubbles
      return b;
    }
    if (p > 1.0) return mix(S.mudDk, S.brewDk, 0.5);
    return null;
  });
}

const LIST = [
  { n: 1, name: 'BOG MOSS', role: 'base ground', draw: tMoss, noOutline: true },
  { n: 2, name: 'MURK WATER', role: 'still swamp', draw: tMurk, noOutline: true },
  { n: 3, name: 'MUD FLAT', role: 'wet mud', draw: tMud, noOutline: true },
  { n: 4, name: 'ROOT TANGLE', role: 'woven roots', draw: tRoots, noOutline: true },
  { n: 5, name: 'PLANK PATH', role: 'boardwalk', draw: tPlanks, noOutline: true },
  { n: 6, name: 'LILY SHALLOWS', role: 'pads on water', draw: tLilies, noOutline: true },
  { n: 7, name: 'PEAT', role: 'dark spongy', draw: tPeat, noOutline: true },
  { n: 8, name: 'GLOW ALGAE', role: 'luminous swirls', draw: tAlgae, noOutline: true },
  { n: 9, name: 'RITUAL EARTH', role: 'boss arena', draw: tRitual, noOutline: true },
  { n: 10, name: 'TOXIC SEEP', role: 'ooze pockets', draw: tSeep, noOutline: true },
];

renderSheet({ list: LIST, out: process.argv[2] || 'swamp_tile_options.png', title: "WITCH'S SWAMP — GROUND TILES (pick the spread)", S: 160 });
