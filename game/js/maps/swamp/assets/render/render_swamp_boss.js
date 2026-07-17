// artdev/swamp/render_swamp_boss.js — THE SWAMP WITCH: 10 numbered work-ups
// (Red's banked package). Parameterized swampWitch(put,S,o) for clean port.
'use strict';
const KIT = require('./swamp_kit.js');
const { S, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, rune, mossDrape } = KIT;

// o: { skin:[c,dk], robe:[base,lt,dk], hat:'point'|'hood'|'crown'|'mask'|'wisphair',
//      staff:'gnarled'|'ladle'|'none', mount:'none'|'cauldron', big, hunch, split,
//      familiar:'crow'|'toad'|'doll'|'none', eyes }
function swampWitch(put, Sz, o) {
  const [sk, skDk] = o.skin, [rb, rl, rd] = o.robe;
  const big = o.big ? 1.35 : 1;
  const cx = Sz * 0.48;
  const footY = Sz * 0.88, hipY = Sz * 0.62, shY = o.hunch ? Sz * 0.44 : Sz * 0.4, headY = o.hunch ? Sz * 0.34 : Sz * 0.29;
  const hx = o.hunch ? cx + Sz * 0.04 : cx; // hunched head forward
  shadow(put, Sz, Sz * 0.5, Sz * 0.32);

  // mount: floating cauldron under her
  if (o.mount === 'cauldron') {
    for (let y = Sz * 0.62; y < Sz * 0.84; y++) {
      const t = (y - Sz * 0.62) / (Sz * 0.22);
      const w = Sz * (0.15 + Math.sin(t * 2.6) * 0.045);
      row(put, Math.round(y), cx - w, cx + w, (tx) => mix('#4a4e5a', '#16181e', clamp(tx * 1.1 + t * 0.25, 0, 1)));
    }
    ell(put, cx, Sz * 0.62, Sz * 0.16, Sz * 0.045, (tx, ty) => mix('#5a5e6a', '#24262e', ty));
    ell(put, cx, Sz * 0.62, Sz * 0.12, Sz * 0.03, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx * 0.8 + ty, 0, 1)));
    // hover glow motes
    [[-0.18, 0.86], [0, 0.9], [0.16, 0.87]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.brew));
  }
  // robe (skirt to feet unless mounted)
  const skirtEnd = o.mount === 'cauldron' ? Sz * 0.66 : footY;
  for (let y = shY; y < skirtEnd; y++) {
    const t = (y - shY) / (skirtEnd - shY);
    const w = Sz * (0.055 + t * 0.11) * big;
    const wob = o.mount === 'none' || !o.mount ? Math.sin(t * 9) * Sz * 0.008 : 0;
    row(put, Math.round(y), cx - w + wob, cx + w + wob, (tx) => {
      let b = mix(rl, rb, clamp(tx * 1.3, 0, 1));
      if (tx > 0.72) b = mix(b, rd, 0.6);
      if (t > 0.85 && Math.abs(Math.sin(tx * 20)) > 0.75) b = mix(b, rd, 0.7); // ragged hem
      return b;
    });
  }
  // rope belt + charm
  row(put, Math.round(hipY), cx - Sz * 0.085 * big, cx + Sz * 0.085 * big, () => S.woodLt);
  put(Math.round(cx), Math.round(hipY + 3), S.bone);
  // shawl shoulders
  ell(put, cx, shY + Sz * 0.02, Sz * 0.1 * big, Sz * 0.04, (tx, ty) => mix(rd, rb, clamp(tx * 0.8 + ty, 0, 1)));

  // arms — one raised casting, one holding staff
  const armW = Sz * (o.big ? 0.03 : 0.02);
  const rx = cx + Sz * 0.17 * big, ry = shY + Sz * 0.1;
  stroke(put, cx + Sz * 0.08 * big, shY + Sz * 0.04, rx, ry, armW, (t) => mix(rb, rd, t * 0.5));
  ell(put, rx, ry, Sz * 0.018, Sz * 0.018, () => sk); // hand
  const lx = cx - Sz * 0.16 * big, ly = shY - Sz * 0.02;
  stroke(put, cx - Sz * 0.08 * big, shY + Sz * 0.04, lx, ly, armW, (t) => mix(rb, rd, t * 0.5));
  ell(put, lx, ly, Sz * 0.018, Sz * 0.018, () => sk);
  // casting spark over the raised (left) hand
  rune(put, Math.round(lx - Sz * 0.02), Math.round(ly - Sz * 0.06), S.witchLt);

  // staff in right hand
  if (o.staff === 'gnarled') {
    for (let t = 0; t <= 1; t += 0.04) {
      const x = rx + Sz * 0.02 + Math.sin(t * 7) * Sz * 0.012;
      const y = lerp(footY, ry - Sz * 0.22, t);
      stroke(put, x, y, x, y, 2.6, () => mix(S.woodLt, S.woodDkk, 0.3 + t * 0.4));
    }
    // crooked head + caught wisp
    stroke(put, rx + Sz * 0.02, ry - Sz * 0.22, rx + Sz * 0.06, ry - Sz * 0.27, 2.2, () => S.woodDk);
    ell(put, rx + Sz * 0.055, ry - Sz * 0.3, Sz * 0.02, Sz * 0.022, () => S.wisp);
    put(Math.round(rx + Sz * 0.05), Math.round(ry - Sz * 0.31), S.wispLt);
  } else if (o.staff === 'ladle') {
    stroke(put, rx, ry, rx + Sz * 0.04, ry - Sz * 0.26, 2.4, () => S.woodDk);
    ell(put, rx + Sz * 0.05, ry - Sz * 0.29, Sz * 0.035, Sz * 0.025, (tx, ty) => mix('#5a5e6a', '#24262e', tx + ty * 0.3));
    ell(put, rx + Sz * 0.05, ry - Sz * 0.295, Sz * 0.022, Sz * 0.012, () => S.brew);
  }

  // head
  const hr = Sz * 0.055;
  ell(put, hx, headY, hr, hr * 1.1, (tx, ty) => {
    if (o.split) return tx < 0.5 ? mix('#e8c8b0', '#b09078', ty * 0.5) : mix(sk, skDk, ty * 0.6);
    return mix(sk, skDk, clamp(tx * 0.9 + ty * 0.4, 0, 1));
  });
  // long crooked nose
  stroke(put, hx + Sz * 0.02, headY + Sz * 0.005, hx + Sz * 0.055, headY + Sz * 0.025, 2, () => o.split ? skDk : sk);
  put(Math.round(hx + Sz * 0.058), Math.round(headY + Sz * 0.03), skDk);
  // wart
  put(Math.round(hx + Sz * 0.03), Math.round(headY + Sz * 0.035), skDk);
  // eyes
  const ey = o.eyes || S.brew;
  optic(put, hx - Sz * 0.02, headY - Sz * 0.005, Sz * 0.012, S.oil, S.oil, ey);
  optic(put, hx + Sz * 0.022, headY - Sz * 0.005, Sz * 0.011, S.oil, S.oil, o.split ? S.witchLt : ey);
  // grin — crooked, one tooth
  for (let t = -1; t <= 1; t += 0.15) put(Math.round(hx + t * Sz * 0.03), Math.round(headY + Sz * 0.05 + (1 - t * t) * 1.4), S.oil);
  put(Math.round(hx - Sz * 0.012), Math.round(headY + Sz * 0.055), S.bone);
  if (o.split) stroke(put, hx, headY - hr, hx, headY + hr, 1, () => skDk);

  // hair — straggly, from under the hat
  [-1, 1].forEach(s => {
    for (let i = 0; i < 3; i++) {
      const x0 = hx + s * (hr - 1) + s * i;
      for (let d = 0; d < Sz * (0.1 + i * 0.03); d++) put(Math.round(x0 + Math.sin(d * 0.3 + i) * 1.6), Math.round(headY + d), o.hat === 'wisphair' ? (d % 3 ? S.wisp : S.wispLt) : (i % 2 ? '#8a8e9a' : '#5a5e68'));
    }
  });

  // hats
  if (o.hat === 'point') {
    // wide brim
    ell(put, hx, headY - hr + Sz * 0.005, Sz * 0.11, Sz * 0.022, (tx, ty) => mix(rd, S.oil, clamp(tx * 0.8, 0, 1)));
    // crooked cone
    for (let y = 0; y < Sz * 0.17; y++) {
      const t = y / (Sz * 0.17), w = Sz * 0.062 * (1 - t * 0.9);
      const bend = Math.sin(t * 2.4) * Sz * 0.035;
      row(put, Math.round(headY - hr - y), hx - w + bend, hx + w + bend, (tx) => mix(rb, rd, clamp(tx * 1.2 + t * 0.2, 0, 1)));
    }
    // hat band + buckle
    row(put, Math.round(headY - hr - Sz * 0.01), hx - Sz * 0.055, hx + Sz * 0.055, () => S.woodLt);
    // drooping tip
    put(Math.round(hx + Sz * 0.055), Math.round(headY - hr - Sz * 0.165), rl);
  } else if (o.hat === 'hood') {
    for (let a = -1.8; a < 1.8; a += 0.04) {
      const r = hr + Sz * 0.02;
      stroke(put, hx + Math.cos(a - 1.57) * r, headY + Math.sin(a - 1.57) * r * 1.1, hx + Math.cos(a - 1.57) * (r + Sz * 0.02), headY + Math.sin(a - 1.57) * (r + Sz * 0.02) * 1.1, 2, () => mix(rb, rd, Math.abs(a) / 1.8));
    }
  } else if (o.hat === 'crown') {
    // bone-antler moon crown
    row(put, Math.round(headY - hr - 2), hx - Sz * 0.045, hx + Sz * 0.045, () => S.bone);
    [-1, 1].forEach(s => { stroke(put, hx + s * Sz * 0.04, headY - hr, hx + s * Sz * 0.09, headY - hr - Sz * 0.08, 2, () => S.boneDk); stroke(put, hx + s * Sz * 0.07, headY - hr - Sz * 0.045, hx + s * Sz * 0.1, headY - hr - Sz * 0.06, 1.4, () => S.bone); });
    for (let a = -1.2; a < 1.2; a += 0.08) put(Math.round(hx + Math.cos(a - 1.57) * Sz * 0.035), Math.round(headY - hr - Sz * 0.05 + Math.sin(a - 1.57) * Sz * 0.035), S.wispLt); // moon disc
  } else if (o.hat === 'mask') {
    // raven-skull half mask
    ell(put, hx, headY - Sz * 0.005, Sz * 0.05, Sz * 0.035, (tx, ty) => mix(S.bone, S.boneDk, tx + ty * 0.3));
    stroke(put, hx + Sz * 0.03, headY + Sz * 0.005, hx + Sz * 0.09, headY + Sz * 0.03, 2.4, () => S.boneDk); // long beak
    optic(put, hx - Sz * 0.018, headY - Sz * 0.01, Sz * 0.011, S.oil, S.oil, o.eyes || S.witchLt);
    // feather ruff
    [-1, 1].forEach(s => { for (let i = 0; i < 4; i++) stroke(put, hx + s * (hr - 2), headY + i * 2, hx + s * (hr + 4 + i), headY - 4 + i * 3, 1.6, () => i % 2 ? S.witchDkk : '#22262e'); });
  }

  // familiars
  if (o.familiar === 'crow') {
    ell(put, cx - Sz * 0.22, shY - Sz * 0.02, Sz * 0.035, Sz * 0.03, (tx, ty) => mix('#3a3e4a', '#16181e', tx + ty * 0.3));
    put(Math.round(cx - Sz * 0.185), Math.round(shY - Sz * 0.025), S.boneDk);
    optic(put, cx - Sz * 0.23, shY - Sz * 0.028, Sz * 0.008, S.oil, S.oil, S.witchLt);
  } else if (o.familiar === 'toad') {
    ell(put, cx + Sz * 0.24, Sz * 0.84, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    optic(put, cx + Sz * 0.22, Sz * 0.82, Sz * 0.009, S.oil, S.oil, S.brew);
    optic(put, cx + Sz * 0.26, Sz * 0.82, Sz * 0.009, S.oil, S.oil, S.brew);
  } else if (o.familiar === 'doll') {
    // voodoo doll dangling from the left hand
    stroke(put, lx, ly + Sz * 0.01, lx, ly + Sz * 0.07, 1, () => S.woodLt);
    ell(put, lx, ly + Sz * 0.1, Sz * 0.02, Sz * 0.028, (tx, ty) => mix('#c8a878', '#8a6e48', tx + ty * 0.3));
    ell(put, lx, ly + Sz * 0.065, Sz * 0.014, Sz * 0.014, () => '#c8a878');
    put(Math.round(lx - 1), Math.round(ly + Sz * 0.06), S.oil);
    put(Math.round(lx + 1), Math.round(ly + Sz * 0.06), S.oil);
    // pins
    stroke(put, lx - 2, ly + Sz * 0.09, lx - 5, ly + Sz * 0.075, 1, () => S.blood);
    stroke(put, lx + 2, ly + Sz * 0.11, lx + 5, ly + Sz * 0.1, 1, () => '#8a8e9a');
  }
  // ambient wisp motes
  put(Math.round(Sz * 0.18), Math.round(Sz * 0.3), S.wispDk);
  put(Math.round(Sz * 0.82), Math.round(Sz * 0.5), S.brewDk);
}

const V = [
  { n: 1, name: 'THE CLASSIC HAG', role: 'green skin, point hat', o: { skin: [S.bogLt, S.bogDk], robe: [S.witch, S.witchLt, S.witchDkk], hat: 'point', staff: 'gnarled', familiar: 'crow' } },
  { n: 2, name: 'BOG CRONE', role: 'hunched, mud-caked', o: { skin: [S.mudLt, S.mudDk], robe: [S.bogDk, S.bog, S.bogDkk], hat: 'hood', staff: 'gnarled', hunch: true, familiar: 'toad', eyes: S.wisp } },
  { n: 3, name: 'MOON MOTHER', role: 'bone-antler crown', o: { skin: ['#d8c8c0', '#a09088'], robe: [S.witchDk, S.witch, S.witchDkk], hat: 'crown', staff: 'none', familiar: 'none', eyes: S.wispLt } },
  { n: 4, name: 'THE BREWMISTRESS', role: 'ladle + brew-stained', o: { skin: [S.bogLt, S.bogDk], robe: [S.brewDk, S.brew, S.bogDkk], hat: 'point', staff: 'ladle', familiar: 'toad' } },
  { n: 5, name: 'RAVEN MASK', role: 'skull mask + feathers', o: { skin: ['#c8b8a8', '#907e6e'], robe: ['#2a2e3a', '#4a4e5e', '#14161e'], hat: 'mask', staff: 'gnarled', familiar: 'crow', eyes: S.witchLt } },
  { n: 6, name: 'CAULDRON RIDER', role: 'floats in her pot', o: { skin: [S.bogLt, S.bogDk], robe: [S.witch, S.witchLt, S.witchDkk], hat: 'point', staff: 'ladle', mount: 'cauldron', familiar: 'none' } },
  { n: 7, name: 'VOODOO QUEEN', role: 'doll + pins', o: { skin: ['#8a6a4e', '#54402e'], robe: [S.blood, '#d86470', '#4e0a12'], hat: 'crown', staff: 'gnarled', familiar: 'doll', eyes: S.brewLt } },
  { n: 8, name: 'THE GRAND HAG', role: 'BIG — towering crone', o: { skin: [S.bogLt, S.bogDk], robe: [S.witchDk, S.witch, S.witchDkk], hat: 'point', staff: 'gnarled', big: true, familiar: 'crow' } },
  { n: 9, name: 'WISP WITCH', role: 'spectral, wisp hair', o: { skin: [S.wispLt, S.wispDk], robe: [S.wispDk, S.wisp, S.murkDk], hat: 'wisphair', staff: 'none', familiar: 'none', eyes: '#ffffff' } },
  { n: 10, name: 'TWO-FACED', role: 'half fair, half hag', o: { skin: [S.bogLt, S.bogDk], robe: [S.witch, S.witchLt, S.witchDkk], hat: 'point', staff: 'gnarled', split: true, familiar: 'crow' } },
];

if (require.main === module) renderSheet({
  list: V.map(v => ({ n: v.n, name: v.name, role: v.role, draw: (put, Sz) => swampWitch(put, Sz, v.o) })),
  out: process.argv[2] || 'swamp_boss_options.png',
  title: 'THE SWAMP WITCH — 10 WORK-UPS (pick one, or combo parts)',
  S: 160
});
module.exports = { swampWitch, V };
