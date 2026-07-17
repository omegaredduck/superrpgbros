// artdev/castle/render_castle_boss.js — 10 numbered VAMPIRE JOUSTER boss
// work-ups (Red's direction: a vampire jouster on a horse). Side profile,
// mount + rider + couched lance, each a different knight/steed fantasy.
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, cape, batIcon } = KIT;

// shared horse profile: body/legs/neck/head facing LEFT; cols = {body, lt, dk, hoof}
// opts: {skeletal, flame, mist, wings, armored}
function horse(put, cx, cy, S, cols, opts) {
  opts = opts || {};
  const B = cols.body, L = cols.lt, D = cols.dk;
  // legs (gallop pose)
  const legs = [[-0.2, -0.3, 0.06], [-0.12, -0.02, 0.2], [0.14, 0.02, 0.2], [0.22, 0.32, 0.1]];
  legs.forEach(([o, k, lift]) => {
    stroke(put, cx + o * S, cy + S * 0.08, cx + (o + k * 0.4) * S, cy + S * (0.26 - lift * 0.3), S * 0.032, () => D);
    if (!opts.mist) ell(put, cx + (o + k * 0.4) * S, cy + S * (0.27 - lift * 0.3), S * 0.022, S * 0.014, () => cols.hoof || G.oil);
    if (opts.flame) put(Math.round(cx + (o + k * 0.4) * S), Math.round(cy + S * (0.29 - lift * 0.3)), G.candle);
  });
  // body barrel
  ell(put, cx, cy, S * 0.24, S * 0.11, (tx, ty) => {
    let b = mix(L, D, clamp(ty * 1.25, 0, 1));
    if (opts.skeletal && Math.sin(tx * 16) > 0.45) b = mix(b, G.bone, 0.55); // rib shadows
    return b;
  });
  if (opts.mist) { // dissolve hindquarters
    for (let i = 0; i < 4; i++) ell(put, cx + S * (0.18 + i * 0.05), cy + S * 0.04 + (i % 2) * S * 0.03, S * 0.045, S * 0.03, (tx, ty) => mix(G.moon, G.night, ty + i * 0.15));
  }
  // neck + head
  stroke(put, cx - S * 0.18, cy - S * 0.04, cx - S * 0.3, cy - S * 0.2, S * 0.07, () => B);
  dome(put, cx - S * 0.32, cy - S * 0.22, S * 0.055, S * 0.05, B, L, D);
  stroke(put, cx - S * 0.36, cy - S * 0.2, cx - S * 0.43, cy - S * 0.16, S * 0.035, (t) => mix(B, D, t));
  // ears / horn
  stroke(put, cx - S * 0.3, cy - S * 0.27, cx - S * 0.29, cy - S * 0.32, 2, () => D);
  // eye
  put(Math.round(cx - S * 0.33), Math.round(cy - S * 0.23), cols.eye || G.blood);
  put(Math.round(cx - S * 0.335), Math.round(cy - S * 0.225), cols.eye || G.blood);
  // mane
  for (let t = 0; t < 1; t += 0.14) {
    const mx = lerp(cx - S * 0.29, cx - S * 0.14, t), my = lerp(cy - S * 0.26, cy - S * 0.1, t);
    stroke(put, mx, my, mx + S * 0.05, my - S * 0.05, S * 0.025, (tt) => opts.flame ? mix(G.candleLt, G.blood, tt) : mix(cols.mane || D, G.oil, tt * 0.5));
  }
  // tail
  for (let i = 0; i < 3; i++)
    stroke(put, cx + S * 0.23, cy - S * 0.02 + i * 2, cx + S * 0.36 + i * S * 0.01, cy + S * 0.1 + i * S * 0.03, S * 0.02,
      (t) => opts.flame ? mix(G.candle, G.blood, t) : mix(cols.mane || D, G.oil, t * 0.6));
  // wings (bat) if any
  if (opts.wings) {
    stroke(put, cx + S * 0.02, cy - S * 0.08, cx + S * 0.2, cy - S * 0.3, S * 0.04, (t) => mix(G.fur, G.furDk, t));
    stroke(put, cx + S * 0.16, cy - S * 0.26, cx + S * 0.3, cy - S * 0.12, S * 0.03, (t) => mix(G.furDk, G.oil, t));
    stroke(put, cx + S * 0.05, cy - S * 0.1, cx + S * 0.19, cy - S * 0.28, 1, () => G.oil);
  }
  // barding (armor plates) if armored
  if (opts.armored) {
    plate(put, cx - S * 0.16, cy - S * 0.1, cx + S * 0.12, cy - S * 0.02, G.iron, G.silver, G.ironDkk);
    dome(put, cx - S * 0.33, cy - S * 0.25, S * 0.05, S * 0.04, G.silver, G.moonLt, G.ironDk); // chanfron
    put(Math.round(cx - S * 0.33), Math.round(cy - S * 0.23), G.blood);
  }
}
// rider: seated knight torso + helm + couched lance pointing LEFT; cols {armor, lt, dk, cloth}
function rider(put, cx, cy, S, cols, opts) {
  opts = opts || {};
  const A = cols.armor, L = cols.lt, D = cols.dk;
  // seated leg
  stroke(put, cx - S * 0.02, cy - S * 0.1, cx - S * 0.04, cy + S * 0.04, S * 0.035, () => D);
  ell(put, cx - S * 0.05, cy + S * 0.06, S * 0.025, S * 0.018, () => G.oil);
  // torso
  plate(put, cx - S * 0.07, cy - S * 0.26, cx + S * 0.07, cy - S * 0.1, A, L, D);
  // cloth tabard stripe
  if (cols.cloth) stroke(put, cx, cy - S * 0.24, cx, cy - S * 0.11, S * 0.03, () => cols.cloth);
  // cape flying behind
  cape(put, cx + S * 0.1, cy - S * 0.26, S * 0.08, S * 0.18, cols.cape || G.blood, cols.capeDk || G.wine);
  // helm
  if (opts.headless) {
    ell(put, cx, cy - S * 0.28, S * 0.045, S * 0.018, () => G.oil);
    [[0.0, -0.33], [0.02, -0.38]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.014, (tx, ty) => mix(G.velvetDk, G.oil, ty)));
  } else {
    dome(put, cx, cy - S * 0.32, S * 0.05, S * 0.05, A, L, D);
    row(put, Math.round(cy - S * 0.32), cx - S * 0.04, cx + S * 0.04, () => G.oil);
    put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.32), cols.eye || G.blood);
    // crest/plume
    if (opts.crown) { [-1, 0, 1].forEach(k => stroke(put, cx + k * S * 0.025, cy - S * 0.37, cx + k * S * 0.035, cy - S * 0.42, 2, () => G.gold)); }
    else stroke(put, cx + S * 0.02, cy - S * 0.37, cx + S * 0.1, cy - S * 0.42, S * 0.02, () => (cols.plume || G.blood));
  }
  // couched LANCE — long, pointing left-down past the horse's head
  const lx0 = cx + S * 0.06, ly0 = cy - S * 0.16;
  stroke(put, lx0, ly0, cx - S * 0.48, cy - S * 0.04, S * 0.02, (t) => mix(cols.lance || G.woodLt, G.woodDkk, t * 0.4));
  // vamplate cone at the grip
  ell(put, cx - S * 0.02, cy - S * 0.14, S * 0.035, S * 0.03, (tx, ty) => mix(L, D, ty));
  // lance tip
  stroke(put, cx - S * 0.48, cy - S * 0.04, cx - S * 0.53, cy - S * 0.028, S * 0.016, () => G.silver);
  put(Math.round(cx - S * 0.53), Math.round(cy - S * 0.025), '#ffffff');
  // arm to the grip
  stroke(put, cx + S * 0.02, cy - S * 0.2, cx - S * 0.01, cy - S * 0.145, S * 0.028, () => D);
}

function make(name, role, horseCols, horseOpts, riderCols, riderOpts, extra) {
  return { name, role, draw: (put, S) => {
    const cx = S * 0.52, cy = S * 0.55;
    shadow(put, S, cx, S * 0.3);
    horse(put, cx, cy, S, horseCols, horseOpts);
    rider(put, cx + S * 0.02, cy - S * 0.06, S, riderCols, riderOpts);
    if (extra) extra(put, S, cx, cy);
  } };
}

const LIST = [
  { n: 1, ...make('CRIMSON LANCER', 'classic knight', { body: G.night, lt: G.nightLt, dk: G.oil, mane: G.oil }, {}, { armor: G.blood, lt: G.bloodLt, dk: G.wine, cape: G.night, capeDk: G.oil }, {}) },
  { n: 2, ...make('NIGHTMARE COURSER', 'flaming steed', { body: '#2a1218', lt: '#4c2028', dk: G.oil, eye: G.candle }, { flame: true }, { armor: G.ironDk, lt: G.iron, dk: G.ironDkk, cape: G.blood, capeDk: G.wine, plume: G.candle }, {},
    (put, S, cx, cy) => { [[-0.1, -0.34], [0.0, -0.38]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.candleLt)); }) },
  { n: 3, ...make('THE PALE RIDER', 'skeletal steed', { body: G.pale, lt: '#ffffff', dk: G.paleDk, mane: G.moonDk, eye: G.moon }, { skeletal: true }, { armor: G.bone, lt: '#ffffff', dk: G.boneDk, cape: G.moonDk, capeDk: G.night, eye: G.moon }, {}) },
  { n: 4, ...make('DUSKWING CHARGER', 'bat-winged mount', { body: G.fur, lt: G.furLt, dk: G.furDk }, { wings: true }, { armor: G.velvet, lt: G.velvetLt, dk: G.velvetDk, cape: G.night, capeDk: G.oil }, {}) },
  { n: 5, ...make('THE BLOOD BARON', 'heavy barded', { body: G.woodDkk, lt: G.wood, dk: G.oil }, { armored: true }, { armor: G.iron, lt: G.silver, dk: G.ironDkk, cloth: G.blood, cape: G.blood, capeDk: G.wine }, {},
    (put, S, cx, cy) => { batIcon(put, cx + S * 0.02, cy - S * 0.18, S * 0.02, G.gold); }) },
  { n: 6, ...make('MIST STALLION', 'half-vapor steed', { body: G.moon, lt: G.moonLt, dk: G.moonDk, eye: '#ffffff' }, { mist: true }, { armor: G.nightLt, lt: G.moon, dk: G.night, cape: G.moonDk, capeDk: G.night, eye: G.moonLt }, {}) },
  { n: 7, ...make('THE TOURNEY KING', 'gold-crowned champion', { body: '#3a2a4c', lt: G.velvetLt, dk: G.oil, mane: G.gold }, {}, { armor: G.gold, lt: G.goldLt, dk: G.goldDkk, cloth: G.velvet, cape: G.velvet, capeDk: G.velvetDk }, { crown: true }) },
  { n: 8, ...make('THE HEADLESS TILT', 'dullahan jouster', { body: G.night, lt: G.nightLt, dk: G.oil, eye: G.gGreen }, {}, { armor: G.ironDk, lt: G.iron, dk: G.oil, cape: G.velvetDk, capeDk: G.oil }, { headless: true },
    (put, S, cx, cy) => { dome(put, cx + S * 0.14, cy - S * 0.1, S * 0.032, S * 0.03, G.vskin, '#ffffff', G.vskinDk); put(Math.round(cx + S * 0.13), Math.round(cy - S * 0.105), G.gGreen); put(Math.round(cx + S * 0.155), Math.round(cy - S * 0.105), G.gGreen); }) },
  { n: 9, ...make('THE VELVET DUCHESS', 'duelist countess', { body: '#ffffff', lt: '#ffffff', dk: G.paleDk, mane: G.blood, hoof: G.goldDk }, {}, { armor: G.velvet, lt: G.velvetLt, dk: G.velvetDk, cape: G.blood, capeDk: G.wine, lance: G.silver }, {},
    (put, S, cx, cy) => { for (let i = 0; i < 4; i++) stroke(put, cx + S * 0.02, cy - S * 0.4 + i, cx + S * 0.12 + i * S * 0.01, cy - S * 0.32 + i * S * 0.02, 2, () => G.oil); }) },
  { n: 10, ...make('DREAD CENTAUR', 'vampire IS the steed', { body: G.wine, lt: G.blood, dk: G.oil, eye: G.candle }, {}, { armor: G.wine, lt: G.blood, dk: G.oil, cape: G.oil, capeDk: G.oil, eye: G.candle }, {},
    (put, S, cx, cy) => { // fuse rider into horse: no saddle gap, spinal ridge
      for (let t = 0; t < 1; t += 0.1) put(Math.round(lerp(cx - S * 0.1, cx + S * 0.16, t)), Math.round(cy - S * 0.1 - Math.sin(t * 3) * S * 0.02), G.bloodDk);
    }) },
];
LIST.forEach((m, i) => { m.role = m.role; });

renderSheet({
  list: LIST,
  out: process.argv[2] || 'castle_boss_options.png',
  title: 'VAMPIRE CASTLE — JOUSTER BOSS WORK-UPS (mounted; pick 1)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
