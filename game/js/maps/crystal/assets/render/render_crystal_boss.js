// artdev/crystal/render_crystal_boss.js — THE SHARDLORD: 10 numbered
// crystal-knight work-ups (Red's banked package: crystal knight boss).
// Parameterized shardKnight(put,S,o) so the picked look ports cleanly.
'use strict';
const KIT = require('./crystal_kit.js');
const { K, GEMS, mix, clamp, ell, row, stroke, lerp, plate, shadow, renderSheet, shard, sparkle } = KIT;

const dk = c => mix(c, '#000000', 0.45);

// ---- parameterized crystal knight -----------------------------------------
// o: { gem:[c,lt,dkc], armor:[base,lt,dkc], bulky, slim, helm:'spike'|'horn'|'crown'|'visor',
//      weapon:'greatsword'|'mace'|'rapier'|'fists'|'scepter'|'twin'|'hammer'|'lance'|'none',
//      shield, core, cape, cluster, glowEyes }
function shardKnight(put, S, o) {
  const A = o.armor || [K.rock, K.rockLt, K.rockDkk];
  // o.multi: every geode/shard on him cycles a different gem color
  let _gi = 0; const G = () => o.multi ? GEMS[(_gi++) % 5] : o.gem;
  const g = o.gem;
  const [gc, glt] = g;
  const W = (o.bulky ? 1.3 : o.slim ? 0.78 : 1) * (o.giant ? 1.22 : 1);
  const cx = S * 0.46;
  const footY = o.giant ? S * 0.94 : S * 0.9, hipY = o.giant ? S * 0.58 : S * 0.6,
    shY = o.giant ? S * 0.3 : S * 0.36, headY = o.giant ? S * 0.26 : S * 0.24;
  shadow(put, S, S * 0.5, o.giant ? S * 0.44 : S * 0.34);
  // glowing fissure cracks in the rock armor (giant/final detail)
  const crack = (x1, y1, x2, y2, c) => { stroke(put, x1, y1, x2, y2, 2.2, () => dk(c)); stroke(put, x1, y1, x2, y2, 1, () => c); };

  // floating shard cape (behind)
  if (o.cape) [[-0.26, 0.4, -0.3], [-0.31, 0.55, -0.2], [-0.27, 0.7, -0.28], [-0.34, 0.44, -0.15]].forEach(([dx, dy, ln]) =>
    shard(put, cx + dx * S, S * dy + S * 0.1, S * 0.03, S * 0.12, ln, g));

  // legs — uniform segments, angles only
  [-1, 1].forEach(s => {
    const hx = cx + s * S * 0.055 * W, kx = cx + s * S * 0.07 * W, fx = cx + s * S * 0.08 * W;
    const kneeY = (hipY + footY) / 2;
    stroke(put, hx, hipY, kx, kneeY, S * (o.bulky ? 0.05 : 0.038), (t) => mix(A[1], A[2], t * 0.8));
    stroke(put, kx, kneeY, fx, footY, S * (o.bulky ? 0.048 : 0.036), (t) => mix(A[0], A[2], t * 0.6));
    // knee gem
    put(Math.round(kx), Math.round(kneeY), G()[1]);
    // boot
    plate(put, fx - S * 0.045 * W, footY - S * 0.02, fx + S * 0.05 * W, footY + S * 0.02, A[0], A[1], A[2]);
    shard(put, fx + s * S * 0.04 * W, footY, S * 0.014, S * 0.05, s * 0.5, G());
  });

  // torso — faceted plate
  for (let y = shY; y < hipY + S * 0.02; y++) {
    const t = (y - shY) / (hipY - shY);
    const w = S * (0.12 - t * 0.045) * W;
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(A[1], A[0], clamp(tx * 1.5, 0, 1));
      if (tx > 0.72) b = mix(b, A[2], 0.6);
      if (Math.abs(tx - 0.32) < 0.05 && !o.cluster) b = mix(b, A[1], 0.5); // facet line
      return b;
    });
  }
  // belt
  row(put, Math.round(hipY), cx - S * 0.08 * W, cx + S * 0.08 * W, () => A[2]);
  put(Math.round(cx), Math.round(hipY), glt);
  // chest core (exposed heart-gem)
  if (o.core) {
    const cw = o.rainbowCore ? S * 0.05 : S * 0.036, chh = o.rainbowCore ? S * 0.06 : S * 0.045;
    ell(put, cx, S * 0.45, cw, chh, (tx, ty) => {
      if (o.rainbowCore) {
        const a = Math.atan2(ty - 0.5, tx - 0.5); // angular rainbow facets
        const seg = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 5) % 5;
        const [c, lt] = GEMS[seg];
        const d = Math.hypot(tx - 0.5, ty - 0.5);
        return mix(lt, c, clamp(d * 2.2, 0, 1));
      }
      return mix(glt, gc, clamp(tx + ty * 0.5, 0, 1));
    });
    put(Math.round(cx - 1), Math.round(S * 0.44), '#ffffff'); put(Math.round(cx), Math.round(S * 0.45), '#ffffff');
    for (let a = 0; a < 6.28; a += 0.8) { const cc = o.rainbowCore ? GEMS[Math.floor(a) % 5][0] : gc; put(Math.round(cx + Math.cos(a) * (cw + S * 0.012)), Math.round(S * 0.45 + Math.sin(a) * (chh + S * 0.012)), cc); }
  } else if (!o.cluster) {
    // chest gem stud
    put(Math.round(cx), Math.round(S * 0.44), glt); put(Math.round(cx), Math.round(S * 0.45), gc);
  }
  // giant-final: glowing multicolor fissures radiating from the core
  if (o.giant && o.core) {
    crack(cx - S * 0.045, S * 0.44, cx - S * 0.1 * W, S * 0.38, GEMS[1][0]);
    crack(cx + S * 0.05, S * 0.43, cx + S * 0.1 * W, S * 0.36, GEMS[3][0]);
    crack(cx - S * 0.04, S * 0.49, cx - S * 0.09 * W, S * 0.55, GEMS[4][0]);
    crack(cx + S * 0.045, S * 0.5, cx + S * 0.08 * W, S * 0.57, GEMS[0][0]);
  }
  // cluster-body: raw shards jutting from torso
  if (o.cluster) [[-0.06, 0.42, -0.2], [0.05, 0.4, 0.25], [-0.02, 0.5, 0.05], [0.08, 0.52, 0.35], [-0.09, 0.55, -0.35]].forEach(([dx, dy, ln], i) =>
    shard(put, cx + dx * S, S * dy + S * 0.08, S * 0.025, S * 0.1, ln, GEMS[i % 5]));

  // pauldrons — outward shard spikes
  [-1, 1].forEach(s => {
    const px = cx + s * S * 0.115 * W, py = shY + S * 0.015;
    ell(put, px, py, S * 0.05 * W, S * 0.04, (tx, ty) => mix(A[1], A[2], clamp(tx * 0.8 + ty * 0.8, 0, 1)));
    shard(put, px + s * S * 0.03, py + S * 0.01, S * 0.02, S * 0.09, s * 0.45, G());
    if (o.bulky) shard(put, px + s * S * 0.055, py + S * 0.02, S * 0.014, S * 0.06, s * 0.6, G());
  });

  // arms
  const armW = S * (o.bulky ? 0.042 : 0.03);
  // left arm (shield side / off hand)
  const lx = cx - S * 0.14 * W, lhY = S * 0.52;
  stroke(put, cx - S * 0.11 * W, shY + S * 0.03, lx, lhY, armW, (t) => mix(A[1], A[2], t * 0.7));
  // right arm (weapon hand)
  const rx = cx + S * 0.14 * W, rhY = S * 0.52;
  stroke(put, cx + S * 0.11 * W, shY + S * 0.03, rx, rhY, armW, (t) => mix(A[1], A[2], t * 0.7));
  [[lx, lhY], [rx, rhY]].forEach(([x, y]) => ell(put, x, y, S * 0.022, S * 0.022, (tx, ty) => mix(A[1], A[2], ty)));

  // head + helm (giant: no neck — head sits directly ON the shoulders)
  ell(put, cx, headY, S * 0.052, S * 0.06, (tx, ty) => mix(A[1], A[0], clamp(tx * 1.2 + ty * 0.3, 0, 1)));
  // visor slit (glow)
  row(put, Math.round(headY + S * 0.005), cx - S * 0.035, cx + S * 0.035, () => o.glowEyes || glt);
  put(Math.round(cx - S * 0.018), Math.round(headY + S * 0.005), '#ffffff');
  if (o.helm === 'spike') {
    shard(put, cx, headY - S * 0.05, S * 0.018, S * 0.09, 0, g);
    shard(put, cx - S * 0.035, headY - S * 0.04, S * 0.012, S * 0.05, -0.3, g);
    shard(put, cx + S * 0.035, headY - S * 0.04, S * 0.012, S * 0.05, 0.3, g);
  } else if (o.helm === 'horn') {
    [-1, 1].forEach(s => shard(put, cx + s * S * 0.05, headY - S * 0.03, S * 0.015, S * 0.08, s * 0.55, G()));
  } else if (o.helm === 'crown') {
    row(put, Math.round(headY - S * 0.055), cx - S * 0.045, cx + S * 0.045, () => K.gold);
    [-0.035, 0, 0.035].forEach(dx => shard(put, cx + dx * S, headY - S * 0.055, S * 0.01, S * 0.045, 0, g));
  } else if (o.helm === 'visor') {
    row(put, Math.round(headY - S * 0.04), cx - S * 0.05, cx + S * 0.05, () => A[2]);
    row(put, Math.round(headY - S * 0.05), cx - S * 0.04, cx + S * 0.04, () => A[1]);
  }

  // ---- weapons ----
  const wY = rhY;
  if (o.weapon === 'greatsword') {
    // big faceted blade planted at his side, tip up
    for (let y = 0; y < S * 0.5; y++) {
      const t = y / (S * 0.5), w = S * 0.028 * (1 - t * 0.85);
      row(put, Math.round(S * 0.86 - y), rx + S * 0.06 - w, rx + S * 0.06 + w, (tx) => mix(glt, tx > 0.55 ? g[2] : gc, clamp(tx + t * 0.2, 0, 1)));
    }
    row(put, Math.round(wY + S * 0.02), rx + S * 0.005, rx + S * 0.115, () => K.gold); // crossguard
    stroke(put, rx + S * 0.06, wY + S * 0.03, rx + S * 0.06, wY + S * 0.09, 2, () => K.goldDk);
    put(Math.round(rx + S * 0.055), Math.round(S * 0.37), '#ffffff');
  } else if (o.weapon === 'mace') {
    stroke(put, rx, wY, rx + S * 0.02, wY - S * 0.16, 3, () => K.goldDk);
    ell(put, rx + S * 0.025, wY - S * 0.2, S * 0.04, S * 0.04, (tx, ty) => mix(g[1], g[2], clamp(tx + ty * 0.5, 0, 1)));
    for (let a = 0; a < 6.28; a += 0.75) shard(put, rx + S * 0.025 + Math.cos(a) * S * 0.035, wY - S * 0.2 + Math.sin(a) * S * 0.035 + S * 0.02, S * 0.01, S * 0.035, Math.cos(a) * 0.6, g);
  } else if (o.weapon === 'rapier') {
    stroke(put, rx, wY, rx + S * 0.05, wY - S * 0.32, 1.6, (t) => mix('#ffffff', gc, t));
    ell(put, rx, wY, S * 0.02, S * 0.02, () => K.gold);
    sparkle(put, rx + S * 0.05, wY - S * 0.33, glt);
  } else if (o.weapon === 'fists') {
    [[lx, lhY], [rx, rhY]].forEach(([x, y], i) => {
      ell(put, x, y, S * 0.045, S * 0.04, (tx, ty) => mix(A[1], A[2], clamp(tx * 0.7 + ty * 0.7, 0, 1)));
      shard(put, x + (i ? 1 : -1) * S * 0.02, y - S * 0.005, S * 0.012, S * 0.05, (i ? 1 : -1) * 0.3, G());
    });
  } else if (o.weapon === 'scepter') {
    stroke(put, rx, wY + S * 0.06, rx, wY - S * 0.22, 2.4, () => K.gold);
    shard(put, rx, wY - S * 0.22, S * 0.022, S * 0.09, 0, g);
    for (let a = 0; a < 6.28; a += 1.0) put(Math.round(rx + Math.cos(a) * S * 0.04), Math.round(wY - S * 0.26 + Math.sin(a) * S * 0.04), glt);
  } else if (o.weapon === 'twin') {
    [[lx, lhY, -1], [rx, rhY, 1]].forEach(([x, y, s]) => {
      for (let i = 0; i < S * 0.26; i++) {
        const t = i / (S * 0.26);
        const bx = x + s * (S * 0.02 + t * S * 0.09 * (1 + 0.15 * Math.sin(t * 9)));
        const by = y - i * 0.9;
        stroke(put, bx, by, bx + s * 2, by, 1.6, () => mix(glt, gc, t));
      }
      ell(put, x, y, S * 0.02, S * 0.02, () => K.goldDk);
    });
  } else if (o.weapon === 'hammer') {
    stroke(put, rx, wY + S * 0.04, rx + S * 0.03, wY - S * 0.2, 3, () => '#6a5140');
    plate(put, rx - S * 0.03, wY - S * 0.3, rx + S * 0.1, wY - S * 0.19, g[0], g[1], g[2]);
    shard(put, rx + S * 0.1, wY - S * 0.245, S * 0.016, S * 0.05, 0.8, g);
    put(Math.round(rx), Math.round(wY - S * 0.28), '#ffffff');
  } else if (o.weapon === 'lance') {
    for (let i = 0; i < S * 0.55; i++) {
      const t = i / (S * 0.55);
      stroke(put, rx + S * 0.02, wY + S * 0.14 - i, rx + S * 0.02, wY + S * 0.14 - i, Math.max(1, 3.4 * (1 - t)), () => mix(g[1], g[0], t));
    }
    ell(put, rx + S * 0.02, wY, S * 0.035, S * 0.03, (tx, ty) => mix(K.gold, K.goldDk, ty)); // guard cone
    put(Math.round(rx + S * 0.02), Math.round(wY - S * 0.4), '#ffffff');
  }
  // shield (off hand)
  if (o.shield) {
    for (let y = -S * 0.11; y < S * 0.13; y++) {
      const t = (y + S * 0.11) / (S * 0.24);
      const w = S * 0.055 * (t < 0.7 ? 1 : (1 - (t - 0.7) * 2.8));
      row(put, Math.round(lhY + y), lx - S * 0.02 - w, lx - S * 0.02 + w, (tx) => mix(A[1], tx > 0.6 ? A[2] : A[0], clamp(tx + t * 0.2, 0, 1)));
    }
    shard(put, lx - S * 0.02, lhY + S * 0.02, S * 0.016, S * 0.07, 0, g);
    put(Math.round(lx - S * 0.04), Math.round(lhY - S * 0.07), glt);
  }
  // ambient sparkles
  sparkle(put, cx - S * 0.2, S * 0.3, glt);
  sparkle(put, cx + S * 0.24, S * 0.6, '#ffffff');
}

const V = [
  { n: 1, name: 'THE CLASSIC', role: 'cyan plate + greatsword', o: { gem: GEMS[1], armor: ['#3a7e88', '#7ec8d0', '#173a40'], helm: 'spike', weapon: 'greatsword' } },
  { n: 2, name: 'THE BULWARK', role: 'amethyst tower shield', o: { gem: GEMS[2], armor: ['#5c4a86', '#9a86c8', '#2a2044'], bulky: true, helm: 'visor', weapon: 'mace', shield: true } },
  { n: 3, name: 'PRISM DUELIST', role: 'slim + light rapier', o: { gem: GEMS[0], armor: ['#8a8ca0', '#d0d2e0', '#3c3e50'], slim: true, helm: 'spike', weapon: 'rapier' } },
  { n: 4, name: 'GEODE COLOSSUS', role: 'rock hulk, bare core', o: { gem: GEMS[0], armor: [K.rock, K.rockLt, K.rockDkk], bulky: true, helm: 'horn', weapon: 'fists', core: true } },
  { n: 5, name: 'SHARD SOVEREIGN', role: 'crowned + shard cape', o: { gem: GEMS[2], armor: ['#4a4258', '#7a7090', '#241e30'], helm: 'crown', weapon: 'scepter', cape: true } },
  { n: 6, name: 'THE TWINBLADE', role: 'two jagged shard swords', o: { gem: GEMS[1], armor: ['#2f5e68', '#5e9aa4', '#12282c'], helm: 'horn', weapon: 'twin' } },
  { n: 7, name: 'AMBER WARLORD', role: 'amber plate + hammer', o: { gem: GEMS[3], armor: ['#8a6a2e', '#c8a45c', '#3e2c10'], bulky: true, helm: 'spike', weapon: 'hammer' } },
  { n: 8, name: 'VOIDGEM KNIGHT', role: 'dark armor, pink glow', o: { gem: [K.pink, K.pinkLt, K.pinkDk], armor: [K.void, K.voidLt, K.voidDk], helm: 'horn', weapon: 'greatsword', core: true, glowEyes: K.pink } },
  { n: 9, name: 'THE CAVALIER', role: 'rose plate + lance', o: { gem: GEMS[0], armor: ['#96506e', '#d090ac', '#482030'], helm: 'visor', weapon: 'lance', shield: true } },
  { n: 10, name: 'LIVING CLUSTER', role: 'raw gems, no armor', o: { gem: GEMS[2], armor: [K.rock, K.rockLt, K.rockDkk], helm: 'spike', weapon: 'fists', cluster: true, cape: true } },
];

if (require.main === module) renderSheet({
  list: V.map(v => ({ n: v.n, name: v.name, role: v.role, draw: (put, S) => shardKnight(put, S, v.o) })),
  out: process.argv[2] || 'crystal_boss_options.png',
  title: 'THE SHARDLORD — 10 WORK-UPS (pick one, or combo parts like the Captain)',
  S: 160
});
module.exports = { shardKnight, V };
