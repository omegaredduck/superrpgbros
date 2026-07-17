// artdev/castle/render_pale_riders.js — 10 PALE RIDER variations (Red asked
// for a second boss sheet anchored on his pick). SOLID regular horses — no
// skeletal holes. Varies armor, helm, cape, barding, lance, glow.
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, cape } = KIT;

function paleRider(put, S, o) {
  const cx = S * 0.54, cy = S * 0.56;
  const HC = o.horse || G.pale, HL = o.horseLt || '#ffffff', HD = o.horseDk || G.paleDk;
  const eyeC = o.eye || G.moon;
  shadow(put, S, cx, S * 0.32);

  // ---- solid pale horse ----
  const UPPER = S * 0.11, LOWER = S * 0.12;
  [{ hip: -0.2, a1: 2.3, a2: 1.85 }, { hip: -0.11, a1: 2.0, a2: 1.6 },
   { hip: 0.14, a1: 1.2, a2: 1.55 }, { hip: 0.23, a1: 0.85, a2: 1.2 }].forEach(({ hip, a1, a2 }) => {
    const hx = cx + hip * S, hy = cy + S * 0.07;
    const kx = hx + Math.cos(a1) * UPPER, ky = hy + Math.sin(a1) * UPPER;
    const fx = kx + Math.cos(a2) * LOWER, fy = ky + Math.sin(a2) * LOWER;
    stroke(put, hx, hy, kx, ky, S * 0.034, () => HC);
    stroke(put, kx, ky, fx, fy, S * 0.026, () => HD);
    ell(put, fx, fy + S * 0.008, S * 0.022, S * 0.014, () => G.oil);
  });
  ell(put, cx, cy, S * 0.26, S * 0.12, (tx, ty) => {
    let b = mix(HL, HD, clamp(ty * 1.15, 0, 1));
    if (Math.sin(tx * 15) > 0.72 && tx > 0.3 && tx < 0.85 && ty > 0.35) b = mix(b, HD, 0.3);
    if (tx < 0.12) b = mix(b, HC, 0.5);
    return b;
  });
  dome(put, cx + S * 0.18, cy - S * 0.01, S * 0.08, S * 0.08, HC, HL, HD);
  dome(put, cx - S * 0.17, cy - S * 0.01, S * 0.07, S * 0.07, HC, HL, HD);
  // caparison (cloth skirt over the horse) if any
  if (o.caparison) {
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14);
      row(put, Math.round(cy + S * 0.0 + y), cx - S * 0.22, cx + S * 0.24, (tx) => {
        if (t > 0.65 && Math.floor(tx * 12) % 2) return null; // dagged hem
        let b = mix(o.caparison, o.caparisonDk || G.night, t * 0.5 + Math.abs(tx - 0.5) * 0.3);
        return b;
      });
    }
    row(put, Math.round(cy + S * 0.0), cx - S * 0.22, cx + S * 0.24, () => o.trim || G.gold);
  }
  // neck + head
  stroke(put, cx - S * 0.18, cy - S * 0.04, cx - S * 0.3, cy - S * 0.2, S * 0.062, () => HC);
  dome(put, cx - S * 0.34, cy - S * 0.25, S * 0.058, S * 0.052, HC, HL, HD);
  stroke(put, cx - S * 0.38, cy - S * 0.23, cx - S * 0.47, cy - S * 0.17, S * 0.042, (t) => mix(HC, HD, t * 0.5));
  dome(put, cx - S * 0.47, cy - S * 0.165, S * 0.026, S * 0.024, HC, HL, HD);
  put(Math.round(cx - S * 0.485), Math.round(cy - S * 0.165), HD);
  [[-0.325], [-0.355]].forEach(([ox]) => stroke(put, cx + ox * S, cy - S * 0.28, cx + ox * S + S * 0.008, cy - S * 0.34, S * 0.016, () => HD));
  // chanfron (head armor) if armored horse
  if (o.chanfron) {
    plate(put, cx - S * 0.38, cy - S * 0.28, cx - S * 0.3, cy - S * 0.2, G.silver, G.moonLt, G.ironDk);
    stroke(put, cx - S * 0.36, cy - S * 0.31, cx - S * 0.36, cy - S * 0.36, S * 0.014, () => o.trim || G.gold); // spike
  }
  optic(put, cx - S * 0.345, cy - S * 0.255, S * 0.016, mix(eyeC, '#000000', 0.5), eyeC, mix(eyeC, '#ffffff', 0.6));
  stroke(put, cx - S * 0.39, cy - S * 0.24, cx - S * 0.44, cy - S * 0.18, 1, () => G.silverDk);
  // mane
  for (let t = 0; t < 1; t += 0.12) {
    const mx = lerp(cx - S * 0.31, cx - S * 0.13, t), my = lerp(cy - S * 0.27, cy - S * 0.1, t);
    stroke(put, mx, my, mx + S * 0.045, my - S * 0.06, S * 0.022, (tt) => mix(o.mane || G.moonLt, o.maneDk || G.moonDk, tt));
  }
  // tail
  for (let i = 0; i < 4; i++)
    stroke(put, cx + S * 0.25, cy - S * 0.03 + i * 2, cx + S * 0.39 + i * S * 0.01, cy + S * 0.1 + i * S * 0.035, S * 0.02, (t) => mix(o.mane || G.moon, o.maneDk || G.moonDk, t));

  // ---- rider ----
  const rx = cx + S * 0.04, ry = cy - S * 0.08;
  const AC = o.armor || G.bone, AL = o.armorLt || '#ffffff', AD = o.armorDk || G.boneDk;
  // cape
  for (let i = 0; i < 5; i++)
    stroke(put, rx + S * 0.06, ry - S * 0.2 + i * 2.5, rx + S * 0.26 + i * S * 0.015, ry + S * 0.02 + i * S * 0.045, S * 0.028, (t) => {
      return (o.tattered && t > 0.75 && (i % 2)) ? null : mix(o.cape || G.moonDk, o.capeDk || G.night, t);
    });
  // seated leg
  stroke(put, rx - S * 0.02, ry - S * 0.08, rx - S * 0.05, ry + S * 0.08, S * 0.032, () => AD);
  ell(put, rx - S * 0.06, ry + S * 0.1, S * 0.026, S * 0.018, () => G.oil);
  // torso
  plate(put, rx - S * 0.075, ry - S * 0.3, rx + S * 0.075, ry - S * 0.1, AC, AL, AD);
  if (o.tabard) stroke(put, rx, ry - S * 0.28, rx, ry - S * 0.11, S * 0.032, () => o.tabard);
  if (o.ribs) [0.14, 0.18, 0.22].forEach(v => stroke(put, rx - S * 0.055, ry - S * v - S * 0.03, rx + S * 0.055, ry - S * v - S * 0.01, 1, () => AD));
  dome(put, rx + S * 0.09, ry - S * 0.28, S * 0.045, S * 0.04, AC, AL, AD);
  // helm variants
  if (o.helm === 'hood') {
    dome(put, rx, ry - S * 0.37, S * 0.06, S * 0.06, o.cape || G.moonDk, mix(o.cape || G.moonDk, '#ffffff', 0.3), G.night);
    ell(put, rx - S * 0.01, ry - S * 0.36, S * 0.035, S * 0.032, () => G.oil);
    [[-0.02], [0.015]].forEach(([ox]) => put(Math.round(rx + ox * S), Math.round(ry - S * 0.365), eyeC));
  } else if (o.helm === 'skull') {
    dome(put, rx, ry - S * 0.37, S * 0.05, S * 0.05, G.bone, '#ffffff', G.boneDk);
    [[-0.02], [0.015]].forEach(([ox]) => { ell(put, rx + ox * S, ry - S * 0.375, S * 0.014, S * 0.016, () => G.oil); put(Math.round(rx + ox * S), Math.round(ry - S * 0.375), eyeC); });
    for (let k = -1; k <= 1; k++) put(Math.round(rx + k * S * 0.012), Math.round(ry - S * 0.335), G.boneDk);
  } else {
    dome(put, rx, ry - S * 0.37, S * 0.055, S * 0.055, AC, AL, AD);
    row(put, Math.round(ry - S * 0.37), rx - S * 0.045, rx + S * 0.045, () => G.oil);
    [[-0.02], [0.015]].forEach(([ox]) => put(Math.round(rx + ox * S), Math.round(ry - S * 0.37), eyeC));
    if (o.helm === 'crown') [-1, 0, 1].forEach(k => stroke(put, rx + k * S * 0.028, ry - S * 0.415, rx + k * S * 0.038, ry - S * 0.465, 2, () => o.trim || G.gold));
    else { stroke(put, rx + S * 0.02, ry - S * 0.415, rx + S * 0.12, ry - S * 0.46, S * 0.022, (t) => mix(o.plume || G.moonLt, o.plumeDk || G.moonDk, t)); }
  }
  // lance held high
  const lTipX = cx - S * 0.6, lTipY = cy - S * 0.36;
  stroke(put, rx + S * 0.06, ry - S * 0.22, lTipX, lTipY, S * 0.036, () => G.night);
  stroke(put, rx + S * 0.06, ry - S * 0.22, lTipX, lTipY, S * 0.022, (t) => mix(o.lance || '#ffffff', o.lanceDk || G.paleDk, t * 0.45));
  ell(put, rx, ry - S * 0.19, S * 0.042, S * 0.034, (tx, ty) => mix(AC, AD, ty));
  stroke(put, lTipX, lTipY, lTipX - S * 0.06, lTipY + S * 0.012, S * 0.018, () => mix(eyeC, '#ffffff', 0.5));
  put(Math.round(lTipX - S * 0.06), Math.round(lTipY + S * 0.015), '#ffffff');
  for (let t = 0.6; t < 0.92; t += 0.08)
    stroke(put, lerp(rx, lTipX, t), lerp(ry - S * 0.22, lTipY, t) - S * 0.01,
      lerp(rx, lTipX, t) + S * 0.025, lerp(ry - S * 0.22, lTipY, t) - S * 0.04, S * 0.014, () => (t * 12 | 0) % 2 ? (o.pennon || G.moonDk) : (o.pennon2 || G.pale));
  ell(put, rx + S * 0.01, ry - S * 0.195, S * 0.02, S * 0.018, (tx, ty) => mix(AC, AD, ty));
  // reins
  for (let t = 0.1; t < 0.95; t += 0.09) put(Math.round(lerp(rx - S * 0.04, cx - S * 0.36, t)), Math.round(lerp(ry - S * 0.15, cy - S * 0.2, t) + Math.sin(t * 3.14) * S * 0.03), (t * 11 | 0) % 2 ? G.silverDk : G.silver);
  // shield on the far side if any
  if (o.shield) {
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14), w = S * (0.05 - (t > 0.7 ? (t - 0.7) * 0.14 : 0));
      row(put, Math.round(ry - S * 0.22 + y), rx + S * 0.1 - w, rx + S * 0.1 + w, (tx) => mix(o.shield, o.shieldDk || G.night, t + Math.abs(tx - 0.5) * 0.4));
    }
    optic(put, rx + S * 0.1, ry - S * 0.16, S * 0.018, mix(eyeC, '#000000', 0.5), eyeC, '#ffffff');
  }
  // banner pole if any
  if (o.banner) {
    stroke(put, rx + S * 0.12, ry + S * 0.06, rx + S * 0.2, ry - S * 0.5, S * 0.014, () => G.woodDk);
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14), reach = S * (0.14 - (t > 0.7 ? (t - 0.7) * 0.3 : 0));
      row(put, Math.round(ry - S * 0.48 + y), rx + S * 0.2, rx + S * 0.2 + reach, (tx) => mix(o.banner, o.bannerDk || G.night, t * 0.5));
    }
  }
  // mist kicked up
  [[0.34, 0.28], [0.42, 0.24]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.02, (tx, ty) => mix(G.moon, G.night, ty + 0.3)));
}

const V = [
  { n: 1, name: 'THE MOURNER', role: 'tattered + moonlit', o: { tattered: true } },
  { n: 2, name: 'THE WHITE KNIGHT', role: 'silver plate + caparison', o: { armor: G.silver, armorLt: '#ffffff', armorDk: G.silverDk, caparison: '#e8ecf4', caparisonDk: G.paleDk, trim: G.silver, cape: '#dce4f0', capeDk: G.paleDk, eye: G.moon } },
  { n: 3, name: 'SEPULCHER LORD', role: 'crowned + gold trim', o: { helm: 'crown', trim: G.gold, tabard: G.gold, caparison: G.bone, caparisonDk: G.boneDk, cape: G.night, capeDk: G.oil, eye: G.gold } },
  { n: 4, name: 'GRAVE BANNERET', role: 'carries his banner', o: { banner: G.moonDk, bannerDk: G.night, tabard: G.moonDk, tattered: true } },
  { n: 5, name: 'WINTER LANCER', role: 'frost-blue accents', o: { horse: '#e8f0f8', horseLt: '#ffffff', horseDk: '#a8c0d8', mane: '#c8e8ff', maneDk: '#6f9fd0', armor: '#d8e8f4', armorDk: '#8fb0c8', cape: '#4a72a0', capeDk: '#26405e', eye: '#9fdcff', lance: '#e8f4ff' } },
  { n: 6, name: 'BLOOD-TIPPED', role: 'crimson cape + red glow', o: { cape: G.blood, capeDk: G.wine, plume: G.blood, plumeDk: G.wine, pennon: G.blood, eye: G.blood, tabard: G.blood } },
  { n: 7, name: 'THE HOODED TILT', role: 'shrouded, no helm', o: { helm: 'hood', tattered: true, cape: G.nightLt, capeDk: G.oil, eye: G.moonLt } },
  { n: 8, name: 'MOONLIT PALADIN', role: 'shield + glow lance', o: { shield: G.moonDk, shieldDk: G.night, lance: G.moonLt, lanceDk: G.moonDk, trim: G.silver, eye: G.moonLt } },
  { n: 9, name: 'THE BONE HERALD', role: 'skull-faced rider', o: { helm: 'skull', ribs: true, tattered: true, cape: G.boneDk, capeDk: G.woodDkk, eye: G.candle } },
  { n: 10, name: 'KING OF THE LISTS', role: 'full regalia + barding', o: { helm: 'crown', chanfron: true, caparison: G.velvet, caparisonDk: G.velvetDk, trim: G.gold, tabard: G.gold, cape: G.velvet, capeDk: G.velvetDk, shield: G.velvet, eye: G.gold, pennon: G.gold, pennon2: G.velvetLt } },
];

module.exports = { paleRider, V };

if (require.main === module) {
  renderSheet({
    list: V.map(v => ({ n: v.n, name: v.name, role: v.role, draw: (put, S) => paleRider(put, S, v.o) })),
    out: process.argv[2] || 'pale_rider_options.png',
    title: 'THE PALE RIDER — 10 VARIATIONS (solid horses; pick 1)',
    S: 160, cols: 5
  }).catch(e => { console.error(e); process.exit(1); });
}
