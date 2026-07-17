// artdev/colosseum/render_colosseum_crowd_sample.js — SAMPLE of the
// crowd-ring art: a cross-section of the stands as seen past the arena
// wall. Individually drawn little fans — varied tunics, skin tones,
// poses (seated, cheering, waving banners, throwing roses).
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, plate, renderSheet } = KIT;

function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }

// one little fan, ~S*0.11 tall. pose: 0 seated · 1 cheering (arms up) ·
// 2 one-arm wave · 3 banner waver · 4 rose thrower
function fan(put, S, fx, fy, seed, dim) {
  const f = (k) => n2(seed * 13.7 + k, seed * 7.3);
  const tunics = [C.crimson, '#3e6a8a', C.gold, '#5a7e46', C.purple, '#b0a890', '#a06e42', C.crimsonDk];
  const skins = ['#d8a878', '#a87850', '#8a5a38', '#e8c898', '#6e4326'];
  const tun = tunics[(f(1) * 8) | 0], skin = skins[(f(2) * 5) | 0];
  const pose = (f(3) * 5) | 0;
  const dd = (c) => dim ? mix(c, '#141018', dim) : c;
  const h = S * 0.055; // torso height
  // torso
  for (let y = 0; y < h; y++) {
    const t = y / h, w = S * (0.014 + t * 0.006);
    row(put, Math.round(fy - y), fx - w, fx + w, (tx) => dd(mix(tun, '#241c14', clamp(tx * 0.8 + t * 0.25, 0, 0.55))));
  }
  // head
  ell(put, fx, fy - h - S * 0.014, S * 0.012, S * 0.013, (tx, ty) => dd(mix(skin, '#3a2414', clamp(tx * 0.7 + ty * 0.4, 0, 0.5))));
  // hair cap
  ell(put, fx, fy - h - S * 0.02, S * 0.011, S * 0.007, () => dd(f(4) > 0.5 ? '#2a1c10' : '#5a4430'));
  // arms per pose
  const aY = fy - h * 0.75;
  if (pose === 1) { // both up
    [-1, 1].forEach(s => stroke(put, fx + s * S * 0.012, aY, fx + s * S * 0.028, aY - S * 0.03, S * 0.007, () => dd(skin)));
  } else if (pose === 2) { // one wave
    stroke(put, fx + S * 0.012, aY, fx + S * 0.03, aY - S * 0.026, S * 0.007, () => dd(skin));
  } else if (pose === 3) { // banner
    stroke(put, fx + S * 0.012, aY, fx + S * 0.026, aY - S * 0.03, S * 0.006, () => dd(skin));
    stroke(put, fx + S * 0.028, aY - S * 0.055, fx + S * 0.028, aY - S * 0.028, S * 0.004, () => dd(C.woodDk));
    for (let y = 0; y < S * 0.02; y++) row(put, Math.round(aY - S * 0.052 + y), fx + S * 0.03, fx + S * 0.048 - y * 0.3, (tx) => dd(mix(C.crimsonLt, C.crimsonDk, tx)));
  } else if (pose === 4) { // rose toss
    stroke(put, fx - S * 0.012, aY, fx - S * 0.03, aY - S * 0.024, S * 0.007, () => dd(skin));
    put(Math.round(fx - S * 0.036), Math.round(aY - S * 0.032), dd(C.crimsonLt));
    put(Math.round(fx - S * 0.042), Math.round(aY - S * 0.044), dd(C.crimsonLt)); // rose mid-air
  }
  // seated fans get a lap line
  if (pose === 0) row(put, Math.round(fy - 1), fx - S * 0.016, fx + S * 0.016, () => dd(mix(tun, '#241c14', 0.4)));
}

function crowdSample(put, S) {
  // ---- backdrop: night-game sky above the top tier
  for (let y = 0; y < S; y++) row(put, y, 0, S, () => '#141221');
  // ---- velarium shade band at very top (striped canvas overhang)
  for (let y = 0; y < S * 0.09; y++) {
    row(put, y, 0, S, (tx) => ((tx * 14 | 0) % 2 ? '#c8b088' : '#a02028'));
  }
  for (let y = Math.round(S * 0.09); y < S * 0.13; y++) row(put, y, 0, S, () => mix('#141221', '#000000', 0.3)); // shade line
  // ---- three tiers, top (far) to bottom (near) — each: wall face + seat row + fans
  const tiers = [
    { y0: 0.13, h: 0.17, dim: 0.35, count: 11 },
    { y0: 0.33, h: 0.20, dim: 0.18, count: 9 },
    { y0: 0.56, h: 0.23, dim: 0, count: 7 },
  ];
  tiers.forEach((tier, ti) => {
    const yTop = S * tier.y0, yBot = S * (tier.y0 + tier.h);
    // marble seat step
    for (let y = Math.round(yTop); y < yBot; y++) {
      const t = (y - yTop) / (yBot - yTop);
      row(put, y, 0, S, (tx) => {
        let b = mix(C.marbleLt, C.marble, clamp(t * 1.3, 0, 1));
        b = mix(b, C.marbleDk, clamp((t - 0.6) * 1.6, 0, 1));
        const px2 = tx * S; if ((px2 % (S * 0.16)) < 1.6 && t > 0.55) b = mix(b, C.marbleDkk, 0.5); // seat joints
        return mix(b, '#141018', tier.dim);
      });
    }
    // riser shadow under the step
    row(put, Math.round(yBot), 0, S, () => mix(C.marbleDkk, '#000', 0.4));
    row(put, Math.round(yBot) + 1, 0, S, () => mix(C.marbleDkk, '#000', 0.55));
    // fans seated/standing on this tier (two staggered ranks)
    for (let r = 0; r < 2; r++) {
      const count = tier.count + r;
      for (let i = 0; i < count; i++) {
        const fx = S * (0.05 + (i + (r ? 0.5 : 0)) * (0.92 / count));
        const fy = yBot - S * 0.012 - r * S * 0.055;
        fan(put, S, fx, fy, ti * 31 + r * 17 + i, tier.dim + r * 0.08);
      }
    }
  });
  // ---- arena wall face (bottom band) + sand sliver
  for (let y = Math.round(S * 0.8); y < S * 0.94; y++) {
    const t = (y - S * 0.8) / (S * 0.14);
    row(put, y, 0, S, (tx) => {
      let b = mix(C.marble, C.marbleDk, clamp(t * 1.2, 0, 1));
      const px2 = tx * S;
      if ((px2 % (S * 0.13)) < 1.6) b = mix(b, C.marbleDkk, 0.5); // block joints
      if (t > 0.3 && t < 0.42 && ((px2 * 0.5) | 0) % 9 === 3) b = mix(b, C.goldDk, 0.4); // gilt studs
      return b;
    });
  }
  row(put, Math.round(S * 0.8), 0, S, () => C.marbleLt); // wall cap the crowd leans on
  row(put, Math.round(S * 0.807), 0, S, () => C.marbleDkk);
  // leaning fan arms over the cap
  [0.18, 0.45, 0.77].forEach((x, i) => {
    const skins = ['#d8a878', '#a87850', '#e8c898'];
    stroke(put, S * x, S * 0.8, S * (x + 0.02), S * 0.815, S * 0.008, () => skins[i]);
  });
  // crimson banner hanging on the wall face
  for (let y = Math.round(S * 0.815); y < S * 0.9; y++) {
    const t = (y - S * 0.815) / (S * 0.085);
    row(put, y, S * 0.6, S * 0.7 - t * S * 0.004, (tx) => mix(C.crimsonLt, C.crimsonDk, clamp(tx + t * 0.3, 0, 1)));
  }
  row(put, Math.round(S * 0.82), S * 0.6, S * 0.7, () => C.gold);
  // sand sliver at the very bottom
  for (let y = Math.round(S * 0.94); y < S; y++) row(put, y, 0, S, (tx) => mix(C.sandLt, C.sand, n2(tx * 40, y) * 0.5));
  // a thrown rose + goblet landed on the sand
  put(Math.round(S * 0.3), Math.round(S * 0.965), C.crimsonLt);
  put(Math.round(S * 0.31), Math.round(S * 0.972), '#5a7e46');
  ell(put, S * 0.72, S * 0.97, S * 0.012, S * 0.008, (tx, ty) => mix(C.goldLt, C.goldDk, tx));
  // ---- torch glow pools on the crowd (night games)
  [0.12, 0.88].forEach(x => {
    stroke(put, S * x, S * 0.13, S * x, S * 0.8, S * 0.006, () => C.bronzeDk);
    ell(put, S * x, S * 0.16, S * 0.014, S * 0.02, (tx, ty) => mix('#ffd34d', '#ff7d3a', ty));
    put(Math.round(S * x), Math.round(S * 0.135), '#ffe8a0');
  });
}

const LIST = [
  { n: 1, name: 'THE STANDS', role: 'crowd ring art sample', draw: (p, S) => crowdSample(p, S), noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_crowd_sample.png', title: 'COLOSSEUM CROWD — stands cross-section sample', S: 220, cols: 1, scale: 2 });
}
module.exports = { crowdSample, fan };
