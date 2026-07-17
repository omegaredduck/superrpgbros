// artdev/colosseum/render_colosseum_boss.js — 10 numbered THE EDITOR
// work-ups (emperor who runs the games). ONE parameterized emperor()
// draw (sheriff/swampWitch pattern) — combos/recolors = param tweaks.
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, galea, laurel } = KIT;

// p: {
//   toga:[base,lt,dk], sash, sashC, trim, build (width), tall,
//   skin:[base,dk], laurelC ('gold'|'green'|null), crownSpikes,
//   beard, hairC, mask (gold half-mask), hood,
//   gesture: 'thumbsDown'|'thumbsUp'|'scroll'|'goblet'|'strings'|'sword'|'stylus',
//   cape:[c,cDk]|null, rings, eyeC, eyeGlow, gluttonJowls
// }
function emperor(put, S, p) {
  const cx = S * 0.5, T = p.tall || 1;
  const y = (v) => S * (1 - (1 - v) * T);
  const skin = p.skin || [C.skin, C.skinDk];
  const toga = p.toga;
  shadow(put, S, cx, S * 0.26);
  // ---- cape behind
  if (p.cape) {
    for (let yy = y(0.42); yy < S * 0.8; yy++) {
      const t = (yy - y(0.42)) / (S * 0.8 - y(0.42));
      const w = S * (0.1 + t * 0.1) * (p.build || 1);
      row(put, Math.round(yy), cx - w, cx + w, (tx) => (tx < 0.16 || tx > 0.84 ? mix(p.cape[0], p.cape[1], clamp(tx + t * 0.3, 0, 1)) : null));
    }
  }
  // ---- toga body (full length robe)
  for (let yy = y(0.4); yy < S * 0.84; yy++) {
    const t = (yy - y(0.4)) / (S * 0.84 - y(0.4));
    const w = S * (0.085 + t * 0.075) * (p.build || 1) * (p.gluttonJowls && t < 0.5 ? 1.18 : 1);
    row(put, Math.round(yy), cx - w, cx + w, (tx) => {
      let b = mix(toga[1], toga[0], clamp(tx * 1.25, 0, 1));
      if (tx > 0.76) b = mix(b, toga[2], 0.6);
      // drape folds
      if (((tx * 9) | 0) % 3 === 0 && t > 0.25) b = mix(b, toga[2], 0.25);
      return b;
    });
  }
  // hem trim
  row(put, Math.round(S * 0.83), cx - S * 0.16 * (p.build || 1), cx + S * 0.16 * (p.build || 1), () => p.trim || C.gold);
  // ---- sash (imperial purple diagonal)
  if (p.sash !== false) {
    for (let t = 0; t < 1; t += 0.02) {
      const sx = cx - S * 0.07 + t * S * 0.13, sy = y(0.42) + t * S * 0.22;
      stroke(put, sx, sy, sx + S * 0.012, sy + S * 0.012, S * 0.032, () => mix(p.sashC || C.purple, C.purpleDk, t * 0.5));
    }
  }
  // ---- arms + THE GESTURE (right arm is the verdict arm)
  const armY = y(0.47);
  const g = p.gesture;
  // left arm: holds robe fold / goblet / ledger
  if (g === 'goblet') {
    stroke(put, cx - S * 0.08, armY, cx - S * 0.16, y(0.42), S * 0.024, () => toga[0]);
    ell(put, cx - S * 0.175, y(0.4), S * 0.028, S * 0.02, (tx, ty) => mix(C.goldLt, C.goldDk, tx + ty * 0.3));
    stroke(put, cx - S * 0.175, y(0.42), cx - S * 0.175, y(0.44), 2, () => C.goldDk);
    put(Math.round(cx - S * 0.18), Math.round(y(0.395)), '#8a1622'); // wine
  } else if (g === 'scroll' || g === 'stylus') {
    stroke(put, cx - S * 0.08, armY, cx - S * 0.15, y(0.52), S * 0.024, () => toga[0]);
    plate(put, cx - S * 0.2, y(0.5), cx - S * 0.1, y(0.55), C.bone, '#fff8e0', C.boneDk); // ledger/scroll
    [0.515, 0.53].forEach(ly => row(put, Math.round(y(ly)), cx - S * 0.185, cx - S * 0.115, () => C.marbleDkk));
  } else {
    stroke(put, cx - S * 0.08, armY, cx - S * 0.13, y(0.58), S * 0.024, () => toga[0]);
    ell(put, cx - S * 0.135, y(0.6), S * 0.018, S * 0.016, (tx, ty) => mix(skin[0], skin[1], tx + ty));
  }
  // right arm gesture
  if (g === 'thumbsDown' || g === 'thumbsUp') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.19, y(0.4), S * 0.026, () => toga[0]);
    // fist
    ell(put, cx + S * 0.21, y(0.385), S * 0.026, S * 0.024, (tx, ty) => mix(skin[0], skin[1], tx + ty * 0.4));
    // thumb
    const dir = g === 'thumbsDown' ? 1 : -1;
    stroke(put, cx + S * 0.21, y(0.385) + dir * S * 0.02, cx + S * 0.21, y(0.385) + dir * S * 0.055, S * 0.014, () => skin[0]);
    if (p.rings) put(Math.round(cx + S * 0.2), Math.round(y(0.39)), C.goldLt);
  } else if (g === 'strings') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.18, y(0.38), S * 0.026, () => toga[0]);
    ell(put, cx + S * 0.2, y(0.37), S * 0.024, S * 0.02, (tx, ty) => mix(skin[0], skin[1], tx + ty * 0.4));
    // golden puppet strings falling from fingers
    [-0.01, 0.015, 0.045].forEach((dx, i) => {
      stroke(put, cx + S * (0.19 + dx), y(0.375), cx + S * (0.2 + dx * 1.6), y(0.55 + i * 0.04), 1, () => C.goldLt);
      // tiny gladiator marionette on middle string
      if (i === 1) { ell(put, cx + S * 0.225, y(0.6), S * 0.014, S * 0.018, (tx, ty) => mix(C.crimsonLt, C.crimsonDk, ty)); put(Math.round(cx + S * 0.225), Math.round(y(0.575)), skin[0]); }
    });
  } else if (g === 'sword') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.17, y(0.36), S * 0.026, () => toga[0]);
    stroke(put, cx + S * 0.18, y(0.35), cx + S * 0.25, y(0.22), 2.8, () => C.ironLt);
    stroke(put, cx + S * 0.165, y(0.37), cx + S * 0.2, y(0.345), 2.2, () => C.goldDk); // guard
  } else if (g === 'stylus') {
    stroke(put, cx + S * 0.08, armY, cx + S * 0.16, y(0.42), S * 0.024, () => toga[0]);
    stroke(put, cx + S * 0.165, y(0.415), cx + S * 0.21, y(0.36), 1.8, () => C.bronzeLt); // stylus pen
    put(Math.round(cx + S * 0.213), Math.round(y(0.355)), C.oil); // ink tip
  } else { // scroll default right arm rests
    stroke(put, cx + S * 0.08, armY, cx + S * 0.13, y(0.58), S * 0.024, () => toga[0]);
  }
  // ---- head
  const hy = y(0.33);
  ell(put, cx, hy, S * 0.056, S * 0.06, (tx, ty) => mix(skin[0], skin[1], clamp(tx + ty * 0.3, 0, 1)));
  if (p.gluttonJowls) { ell(put, cx, hy + S * 0.03, S * 0.06, S * 0.035, (tx, ty) => mix(skin[0], skin[1], clamp(tx + ty * 0.4, 0, 1))); }
  // eyes
  const eyeC = p.eyeC || C.oil;
  optic(put, cx - S * 0.02, hy - S * 0.01, S * 0.01, C.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
  optic(put, cx + S * 0.02, hy - S * 0.01, S * 0.01, C.oil, eyeC, p.eyeGlow ? eyeC : '#fff');
  if (p.eyeGlow) { put(Math.round(cx - S * 0.02), Math.round(hy - S * 0.01), eyeC); put(Math.round(cx + S * 0.02), Math.round(hy - S * 0.01), eyeC); }
  // gold half-mask
  if (p.mask) {
    for (let yy = hy - S * 0.05; yy < hy + S * 0.005; yy++) {
      const t = (yy - (hy - S * 0.05)) / (S * 0.055);
      row(put, Math.round(yy), cx - S * 0.052, cx + S * 0.052, (tx) => mix(C.goldLt, C.goldDk, clamp(tx * 1.1 + t * 0.2, 0, 1)));
    }
    put(Math.round(cx - S * 0.02), Math.round(hy - S * 0.01), C.oil);
    put(Math.round(cx + S * 0.02), Math.round(hy - S * 0.01), C.oil);
  }
  // mouth — smug line
  row(put, Math.round(hy + S * (p.gluttonJowls ? 0.022 : 0.032)), cx - S * 0.016, cx + S * 0.012, () => C.oil);
  // beard
  if (p.beard) for (let yy = 0; yy < S * 0.045; yy++) {
    const t = yy / (S * 0.045);
    row(put, Math.round(hy + S * 0.028 + yy), cx - S * 0.04 * (1 - t * 0.4), cx + S * 0.04 * (1 - t * 0.4), (tx) => mix(p.hairC || '#c8c4b8', '#8a867a', clamp(tx + t * 0.3, 0, 1)));
  }
  // hood
  if (p.hood) {
    ell(put, cx, hy - S * 0.012, S * 0.07, S * 0.062, (tx, ty) => (ty < 0.52 ? mix(p.toga[2], p.toga[0], clamp(tx, 0, 1)) : null));
  }
  // hair fringe
  if (!p.hood) for (let x = -0.045; x <= 0.045; x += 0.012) put(Math.round(cx + x * S), Math.round(hy - S * 0.05), p.hairC || '#6a5436');
  // ---- laurel crown
  if (p.laurelC === 'gold') { laurel(put, cx, hy - S * 0.035, S * 0.062, C.goldLt); laurel(put, cx, hy - S * 0.03, S * 0.058, C.gold); }
  else if (p.laurelC === 'green') laurel(put, cx, hy - S * 0.032, S * 0.06, '#5a7e46');
  // radiate crown spikes (sun-god pretender)
  if (p.crownSpikes) for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.017, hy - S * 0.05, cx + i * S * 0.022, hy - S * 0.085, 1.6, () => C.goldLt);
}

const V = {
  classic: {
    toga: ['#e8e2d4', '#faf6ec', '#b0a890'], sashC: C.purple, trim: C.gold,
    laurelC: 'gold', gesture: 'thumbsDown', rings: true, hairC: '#6a5436',
  },
  golden: {
    toga: [C.gold, C.goldLt, C.goldDk], sash: false, trim: C.crimson,
    laurelC: 'gold', crownSpikes: true, gesture: 'sword', cape: [C.crimson, C.crimsonDk],
    eyeC: C.goldLt, eyeGlow: true, skin: ['#e8c898', '#b89058'],
  },
  mad: {
    toga: ['#d8d0c0', '#f0e8d8', '#a09880'], sashC: C.crimson, trim: C.goldDk,
    laurelC: 'green', gesture: 'goblet', hairC: '#3a2c1a', eyeC: '#7a2a8a', eyeGlow: true, build: 0.95,
  },
  philosopher: {
    toga: ['#8a8272', '#b0a890', '#5a5446'], sashC: C.purpleDk, trim: C.boneDk,
    laurelC: null, beard: true, hairC: '#c8c4b8', gesture: 'scroll',
  },
  consul: {
    toga: [C.crimson, C.crimsonLt, C.crimsonDk], sash: false, trim: C.gold,
    laurelC: 'gold', gesture: 'sword', cape: [C.purpleDk, '#1c0a24'], build: 1.15,
    skin: [C.skin, C.skinDk], hairC: '#3a2c1a',
  },
  glutton: {
    toga: [C.purple, C.purpleLt, C.purpleDk], sashC: C.gold, trim: C.gold,
    laurelC: 'gold', gesture: 'goblet', gluttonJowls: true, build: 1.35, rings: true, hairC: '#4a3a24',
  },
  regent: {
    toga: [C.purpleDk, C.purple, '#160820'], sash: false, trim: C.goldDk,
    hood: true, mask: true, gesture: 'thumbsDown', eyeC: C.goldLt, eyeGlow: true,
  },
  puppeteer: {
    toga: ['#2e2a3a', '#4a4460', '#1a1826'], sashC: C.gold, trim: C.goldLt,
    laurelC: 'gold', gesture: 'strings', eyeC: C.goldLt, eyeGlow: true, hairC: '#1a1826', tall: 1.06,
  },
  verdigris: {
    toga: [C.bronze, C.bronzeLt, C.bronzeDk], sash: false, trim: '#4a8a6a',
    laurelC: 'gold', gesture: 'thumbsUp', skin: ['#7aa88a', '#4a7a5a'], eyeC: '#c8ffc2', eyeGlow: true, build: 1.2,
  },
  editor: {
    toga: ['#3a3444', '#5a5468', '#221e2c'], sashC: C.crimson, trim: C.gold,
    laurelC: 'gold', gesture: 'stylus', hairC: '#2a2434', eyeC: C.crimsonLt, eyeGlow: true,
    // the ledger of who lives + dies rides in the left hand (scroll pose)
  },
};
// editor variant: left hand carries the ledger — reuse scroll left-arm by gesture flag
V.editor.gesture = 'stylus';

const LIST = [
  { n: 1, name: 'CLASSIC CAESAR', role: 'white toga, verdict thumb', draw: (p, S) => emperor(p, S, V.classic) },
  { n: 2, name: 'GOLDEN GOD', role: 'radiate crown, gilded', draw: (p, S) => emperor(p, S, V.golden) },
  { n: 3, name: 'THE MAD ONE', role: 'wine + violet stare', draw: (p, S) => emperor(p, S, V.mad) },
  { n: 4, name: 'PHILOSOPHER', role: 'grey beard, scroll', draw: (p, S) => emperor(p, S, V.philosopher) },
  { n: 5, name: 'WAR CONSUL', role: 'crimson, blade drawn', draw: (p, S) => emperor(p, S, V.consul) },
  { n: 6, name: 'THE GLUTTON', role: 'purple, goblet, rings', draw: (p, S) => emperor(p, S, V.glutton) },
  { n: 7, name: 'SHADOW REGENT', role: 'hood + gold mask', draw: (p, S) => emperor(p, S, V.regent) },
  { n: 8, name: 'THE PUPPETEER', role: 'gold strings, marionette', draw: (p, S) => emperor(p, S, V.puppeteer) },
  { n: 9, name: 'VERDIGRIS KING', role: 'living bronze statue', draw: (p, S) => emperor(p, S, V.verdigris) },
  { n: 10, name: 'THE INK EDITOR', role: 'ledger + stylus, dark robes', draw: (p, S) => emperor(p, S, V.editor) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_boss_options.png', title: 'THE EDITOR — 10 WORK-UPS (combo + recolor welcome)', S: 160, cols: 5 });
}
module.exports = { emperor, V, LIST };
