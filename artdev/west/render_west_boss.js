// artdev/west/render_west_boss.js — 10 numbered OUTLAW SHERIFF work-ups.
// ONE parameterized sheriff() draw (ringmaster/swampWitch pattern) so any
// combo/recolor is a param tweak, not a redraw.
'use strict';
const KIT = require('./west_kit.js');
const { W, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, hat, bandana, gun, badge } = KIT;

// p: {
//   duster:[base,lt,dk], shirt, pants, hatCols:[base,lt,dk], hatTilt,
//   skin:[base,dk], build (torso width mult), tall (height mult),
//   badgeC, badgeSide (-1 left / 1 right / 0 none),
//   guns: 'drawn'|'twin'|'big'|'holstered'|'rifle',
//   cigar, scar, eyepatch, poncho:[c,cDk]|null, mustache: 'none'|'thick'|'long',
//   eyeC (iris/glow), eyeGlow, beard, goldTooth, spurGlint, chaps
// }
function sheriff(put, S, p) {
  const cx = S * 0.5, T = p.tall || 1;
  const y = (v) => S * (1 - (1 - v) * T); // stretch upward from feet
  const skin = p.skin || [W.skin, W.skinDk];
  shadow(put, S, cx, S * 0.24);
  // ---- legs + chaps + boots
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.045, y(0.6), cx + s * S * 0.055, S * 0.84, S * 0.034, () => p.pants || W.navyDk);
    if (p.chaps) stroke(put, cx + s * S * 0.05, y(0.62), cx + s * S * 0.062, S * 0.82, S * 0.045, () => W.leatherDk);
    plate(put, cx + s * S * 0.055 - S * 0.035, S * 0.84, cx + s * S * 0.055 + S * 0.04, S * 0.885, W.leatherDk, W.leather, W.oil);
    if (p.spurGlint !== false) put(Math.round(cx + s * S * 0.09), Math.round(S * 0.855), W.goldLt);
  });
  // ---- duster coat (long, split tails)
  const d = p.duster;
  for (let yy = y(0.4); yy < S * 0.8; yy++) {
    const t = (yy - y(0.4)) / (S * 0.8 - y(0.4));
    let w = S * (0.09 + t * 0.075) * (p.build || 1);
    if (t > 0.55) { // split tails flare
      const split = Math.abs(0.5 - 0.5) ; // center split
      w = S * (0.09 + t * 0.09) * (p.build || 1);
    }
    row(put, Math.round(yy), cx - w, cx + w, (tx) => {
      if (t > 0.5 && Math.abs(tx - 0.5) < 0.07) return null; // coat split shows legs
      let b = mix(d[1], d[0], clamp(tx * 1.3, 0, 1));
      if (tx > 0.74) b = mix(b, d[2], 0.6);
      if (t < 0.42 && Math.abs(tx - 0.5) < 0.1 && p.shirt) b = mix(b, p.shirt, 0.85);
      if (t > 0.15 && t < 0.2) b = mix(b, d[2], 0.3); // yoke seam
      return b;
    });
  }
  // lapels
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, y(0.415), cx + s * S * 0.075, y(0.52), 1.6, () => d[2]));
  // belt + buckle
  row(put, Math.round(y(0.585)), cx - S * 0.08 * (p.build || 1), cx + S * 0.08 * (p.build || 1), () => W.leatherDk);
  ell(put, cx, y(0.585), S * 0.016, S * 0.014, () => W.gold);
  // gun belt slung
  stroke(put, cx - S * 0.08, y(0.6), cx + S * 0.08, y(0.635), 2.2, () => W.leather);
  // ---- arms + guns
  const armY = y(0.465);
  if (p.guns === 'drawn') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.19, y(0.45), S * 0.024, () => d[0]);
    gun(put, cx + S * 0.2, y(0.445), S * 0.1);
    stroke(put, cx - S * 0.08, armY, cx - S * 0.13, y(0.57), S * 0.022, () => d[0]);
  } else if (p.guns === 'twin') {
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.08, armY, cx + s * S * 0.19, y(0.45), S * 0.024, () => d[0]);
      gun(put, cx + s * S * 0.2, y(0.445), S * 0.1, s === -1);
    });
  } else if (p.guns === 'big') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.17, y(0.46), S * 0.028, () => d[0]);
    // oversized hand cannon
    stroke(put, cx + S * 0.17, y(0.455), cx + S * 0.36, y(0.455), S * 0.055, () => W.ironDk);
    stroke(put, cx + S * 0.17, y(0.44), cx + S * 0.36, y(0.44), S * 0.02, () => W.ironLt);
    ell(put, cx + S * 0.2, y(0.47), S * 0.03, S * 0.03, (tx, ty) => mix(W.ironLt, W.ironDk, tx + ty * 0.3));
    put(Math.round(cx + S * 0.37), Math.round(y(0.45)), W.goldLt);
    stroke(put, cx - S * 0.08, armY, cx - S * 0.13, y(0.57), S * 0.022, () => d[0]);
  } else if (p.guns === 'rifle') {
    stroke(put, cx - S * 0.1, y(0.5), cx + S * 0.14, y(0.43), S * 0.024, () => d[0]);
    stroke(put, cx - S * 0.06, y(0.52), cx + S * 0.26, y(0.41), S * 0.02, () => W.woodDk); // stock+barrel line
    stroke(put, cx + S * 0.08, y(0.435), cx + S * 0.3, y(0.4), S * 0.014, () => W.iron);
    ell(put, cx + S * 0.02, y(0.47), S * 0.02, S * 0.028, () => W.iron); // lever loop
  } else { // holstered — hands hovering at hips, high-noon stance
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.08, armY, cx + s * S * 0.13, y(0.585), S * 0.022, () => d[0]);
      ell(put, cx + s * S * 0.135, y(0.6), S * 0.02, S * 0.018, (tx, ty) => mix(skin[0], skin[1], tx + ty)); // hand
      // holster w/ grip
      plate(put, cx + s * S * 0.1 - S * 0.02, y(0.62), cx + s * S * 0.1 + S * 0.02, y(0.7), W.leatherDk, W.leather, W.oil);
      stroke(put, cx + s * S * 0.09, y(0.615), cx + s * S * 0.12, y(0.6), 2, () => W.leatherDk);
      put(Math.round(cx + s * S * 0.1), Math.round(y(0.615)), W.ironLt);
    });
  }
  // ---- poncho overlay
  if (p.poncho) {
    for (let yy = y(0.41); yy < y(0.56); yy++) {
      const t = (yy - y(0.41)) / (y(0.56) - y(0.41));
      const w = S * (0.055 + t * 0.13);
      row(put, Math.round(yy), cx - w, cx + w, (tx) => {
        let b = mix(p.poncho[0], p.poncho[1], clamp(tx * 1.1 + t * 0.2, 0, 1));
        if ((((tx * 14) | 0) + ((t * 8) | 0)) % 4 === 0) b = mix(b, W.bone, 0.25); // weave stripe
        return b;
      });
    }
    for (let i = 0; i < 9; i++) { const fx = cx - S * 0.125 + i * S * 0.031; stroke(put, fx, y(0.555), fx, y(0.58), 1, () => p.poncho[1]); } // fringe
  }
  // ---- badge
  if (p.badgeSide) badge(put, cx + p.badgeSide * S * 0.045, y(0.45), S * 0.026, p.badgeC || W.gold);
  // ---- head
  const hy = y(0.335);
  ell(put, cx, hy, S * 0.058, S * 0.062, (tx, ty) => mix(skin[0], skin[1], clamp(tx + ty * 0.3, 0, 1)));
  // eyes
  const eyeC = p.eyeC || W.oil;
  if (p.eyepatch) {
    stroke(put, cx - S * 0.055, hy - S * 0.03, cx + S * 0.055, hy - S * 0.015, 1.2, () => W.oil);
    ell(put, cx - S * 0.02, hy - S * 0.012, S * 0.016, S * 0.017, () => W.oil);
    optic(put, cx + S * 0.02, hy - S * 0.012, S * 0.011, W.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
  } else {
    optic(put, cx - S * 0.02, hy - S * 0.012, S * 0.011, W.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
    optic(put, cx + S * 0.02, hy - S * 0.012, S * 0.011, W.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
  }
  if (p.eyeGlow) { put(Math.round(cx - S * 0.02), Math.round(hy - S * 0.012), p.eyeC); put(Math.round(cx + S * 0.02), Math.round(hy - S * 0.012), p.eyeC); }
  // scar
  if (p.scar) { stroke(put, cx + S * 0.035, hy - S * 0.045, cx + S * 0.05, hy + S * 0.01, 1, () => W.blood); }
  // mustache / beard
  if (p.mustache === 'thick') stroke(put, cx - S * 0.03, hy + S * 0.02, cx + S * 0.03, hy + S * 0.02, S * 0.016, () => p.hairC || W.shade);
  if (p.mustache === 'long') { [-1, 1].forEach(s => { stroke(put, cx, hy + S * 0.018, cx + s * S * 0.045, hy + S * 0.03, S * 0.012, () => p.hairC || W.shade); stroke(put, cx + s * S * 0.045, hy + S * 0.03, cx + s * S * 0.05, hy + S * 0.055, S * 0.009, () => p.hairC || W.shade); }); }
  if (p.beard) { for (let yy = 0; yy < S * 0.05; yy++) { const t = yy / (S * 0.05); row(put, Math.round(hy + S * 0.025 + yy), cx - S * 0.045 * (1 - t * 0.5), cx + S * 0.045 * (1 - t * 0.5), (tx) => mix(p.hairC || W.shade, W.oil, clamp(tx + t * 0.3, 0, 1))); } }
  // mouth / gold tooth
  if (!p.beard && p.mustache === 'none') { row(put, Math.round(hy + S * 0.03), cx - S * 0.018, cx + S * 0.018, () => W.oil); if (p.goldTooth) put(Math.round(cx + S * 0.008), Math.round(hy + S * 0.033), W.goldLt); }
  else if (p.goldTooth) put(Math.round(cx + S * 0.008), Math.round(hy + S * 0.038), W.goldLt);
  // cigar
  if (p.cigar) {
    stroke(put, cx + S * 0.025, hy + S * 0.028, cx + S * 0.07, hy + S * 0.02, S * 0.013, () => W.leatherDk);
    put(Math.round(cx + S * 0.075), Math.round(hy + S * 0.018), W.redLt);
    [[0.085, -0.01], [0.09, -0.035], [0.083, -0.06]].forEach(([dx, dy]) => put(Math.round(cx + S * dx), Math.round(hy + S * dy), '#9aa0aa'));
  }
  // ---- hat
  hat(put, cx, hy - S * 0.048, S * (p.hatW || 0.095), p.hatCols, p.hatTilt || 0);
  if (p.hatBadge) badge(put, cx, hy - S * 0.06, S * 0.014, W.gold);
}

const V = {
  classic: {
    duster: [W.leatherDk, W.leather, W.oil], shirt: '#c8bca0', pants: W.navyDk,
    hatCols: [W.leatherDk, W.leather, W.oil], hatTilt: 0.06, badgeSide: -1, badgeC: W.gold,
    guns: 'holstered', cigar: true, mustache: 'thick',
  },
  night: {
    duster: [W.shade, '#5a4a40', W.oil], shirt: W.oil, pants: W.oil,
    hatCols: [W.oil, W.shade, '#000000'], hatTilt: 0, badgeSide: -1, badgeC: W.iron,
    guns: 'twin', eyeC: W.red, eyeGlow: true, mustache: 'none',
  },
  bigIron: {
    duster: [W.navy, W.navyLt, W.navyDk], shirt: W.red, pants: W.navyDk,
    hatCols: [W.navyDk, W.navy, W.oil], hatTilt: -0.08, badgeSide: -1, badgeC: W.gold,
    guns: 'big', build: 1.2, mustache: 'thick', scar: true,
  },
  whiteHat: {
    duster: ['#d8d0bc', '#f4eee0', '#a89e88'], shirt: W.navy, pants: W.navyDk,
    hatCols: ['#d8d0bc', '#fff8e8', '#a89e88'], hatTilt: 0, badgeSide: -1, badgeC: W.gold, hatBadge: true,
    guns: 'holstered', goldTooth: true, mustache: 'none', cigar: true,
  },
  poncho: {
    duster: [W.leather, W.leatherLt, W.leatherDk], shirt: null, pants: '#5a4430',
    hatCols: [W.sandDk, W.sand, W.woodDkk], hatTilt: 0.12, hatW: 0.105, badgeSide: 0,
    guns: 'holstered', poncho: ['#8a5a34', '#4a2e1a'], beard: true, cigar: true, mustache: 'none',
  },
  eyepatch: {
    duster: [W.redDk, W.red, W.oil], shirt: '#c8bca0', pants: W.oil,
    hatCols: [W.oil, W.shade, '#000000'], hatTilt: -0.1, badgeSide: 1, badgeC: W.brass,
    guns: 'drawn', eyepatch: true, mustache: 'long', hairC: W.ironDk,
  },
  rifleman: {
    duster: ['#4e5a44', '#6e8060', '#2c3626'], shirt: '#c8bca0', pants: W.leatherDk,
    hatCols: [W.leather, W.leatherLt, W.leatherDk], hatTilt: 0, badgeSide: -1, badgeC: W.iron,
    guns: 'rifle', beard: true, hairC: '#8a6a48', chaps: true,
  },
  giant: {
    duster: [W.ironDk, W.iron, W.oil], shirt: W.blood, pants: W.oil,
    hatCols: [W.ironDk, W.iron, W.oil], hatTilt: 0, badgeSide: -1, badgeC: W.blood,
    guns: 'twin', build: 1.35, tall: 1.12, mustache: 'thick', hairC: W.oil, scar: true, goldTooth: true,
  },
  dandy: {
    duster: ['#6a3a5a', '#9a5e86', '#3a1e30'], shirt: '#f0e0b8', pants: W.oil,
    hatCols: ['#3a1e30', '#6a3a5a', W.oil], hatTilt: -0.05, badgeSide: -1, badgeC: W.gold,
    guns: 'drawn', mustache: 'long', hairC: W.oil, goldTooth: true, cigar: false,
  },
  ghost: {
    duster: ['#7a8a8e', '#b0c0c4', '#46545a'], shirt: W.bone, pants: '#46545a',
    hatCols: ['#46545a', '#7a8a8e', '#2a3438'], hatTilt: 0.05, badgeSide: -1, badgeC: '#cfe8ff',
    guns: 'holstered', eyeC: '#41d6f6', eyeGlow: true, skin: ['#c8d4cc', '#8a9a90'], mustache: 'none', beard: false, scar: true,
  },
};

const LIST = [
  { n: 1, name: 'CLASSIC CROOKED', role: 'cigar + tin star', draw: (p, S) => sheriff(p, S, V.classic) },
  { n: 2, name: 'NIGHT RIDER', role: 'all black, red glare', draw: (p, S) => sheriff(p, S, V.night) },
  { n: 3, name: 'BIG IRON', role: 'hand cannon', draw: (p, S) => sheriff(p, S, V.bigIron) },
  { n: 4, name: 'WHITE HAT', role: 'clean look, dirty soul', draw: (p, S) => sheriff(p, S, V.whiteHat) },
  { n: 5, name: 'PONCHO DRIFTER', role: 'no badge, no name', draw: (p, S) => sheriff(p, S, V.poncho) },
  { n: 6, name: 'ONE-EYE', role: 'eyepatch, gun drawn', draw: (p, S) => sheriff(p, S, V.eyepatch) },
  { n: 7, name: 'RIFLEMAN', role: 'lever-action + chaps', draw: (p, S) => sheriff(p, S, V.rifleman) },
  { n: 8, name: 'THE GIANT', role: 'huge frame, twin guns', draw: (p, S) => sheriff(p, S, V.giant) },
  { n: 9, name: 'THE DANDY', role: 'plum coat, waxed tips', draw: (p, S) => sheriff(p, S, V.dandy) },
  { n: 10, name: 'PALE MARSHAL', role: 'ghost-gray, cyan glare', draw: (p, S) => sheriff(p, S, V.ghost) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'west_boss_options.png', title: 'THE OUTLAW SHERIFF — 10 WORK-UPS (combo + recolor welcome)', S: 160, cols: 5 });
}
module.exports = { sheriff, V, LIST };
