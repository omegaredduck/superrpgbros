// artdev/render_factory_engineer.js — 10 work-ups of THE GRAND ENGINEER (boss
// phase 1): Einstein-type mad scientist, white lab coat, RED glowing eyes, wild
// hair. Numbered sheet for Red to pick from (note 12/13).
'use strict';
const K = require('./factory_kit.js');
const { F, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, vent, shadow, renderSheet } = K;

// ---- shared character parts --------------------------------------------
function legs(put, S, cx) {
  [-1, 1].forEach(s => {
    plate(put, cx + s * 0.02 * S, S * 0.7, cx + s * 0.02 * S + s * 0.09 * S, S * 0.9, F.gunDk, F.gun, F.oil);
    ell(put, cx + s * 0.06 * S, S * 0.91, S * 0.06, S * 0.028, () => F.oil); // shoe
  });
}
function coat(put, S, cx, accent, longCoat) {
  const top = S * 0.33, waist = S * 0.55, hem = longCoat ? S * 0.8 : S * 0.72;
  for (let y = Math.round(top); y < Math.round(hem); y++) {
    let half;
    if (y < waist) half = lerp(S * 0.15, S * 0.14, (y - top) / (waist - top));
    else half = lerp(S * 0.14, S * 0.21, (y - waist) / (hem - waist));
    const vt = (y - top) / (hem - top);
    row(put, y, cx - half, cx + half, (tx) => {
      let b = mix(F.labcoat, F.labcoatDk, clamp(vt * 0.7, 0, 1));
      if (tx < 0.14) b = mix(b, F.white, 0.6);
      if (tx > 0.86) b = mix(b, F.labShadow, 0.6);
      if (Math.abs(tx - 0.5) < 0.03) b = mix(b, F.labShadow, 0.7); // center opening
      return b;
    });
  }
  // inner shirt + accent tie
  for (let y = Math.round(S * 0.35); y < Math.round(waist); y++) row(put, y, cx - S * 0.03, cx + S * 0.03, () => F.steelDk);
  for (let y = Math.round(S * 0.36); y < Math.round(S * 0.5); y++) { const w = lerp(S * 0.012, S * 0.022, (y - S * 0.36) / (S * 0.14)); row(put, y, cx - w, cx + w, () => accent); }
  // lapels
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.02, S * 0.34, cx + s * S * 0.1, S * 0.46, S * 0.02, () => F.labShadow));
  // pocket lines + a pen
  [-1, 1].forEach(s => row(put, Math.round(S * 0.58), cx + s * S * 0.06, cx + s * S * 0.12, () => F.labShadow));
  put(Math.round(cx - S * 0.09), Math.round(S * 0.56), accent); // breast-pocket pen
  // buttons
  [0.5, 0.62].forEach(v => bolt(put, cx, S * v, S * 0.012, F.labShadow, F.oil));
}
function arms(put, S, cx, o) {
  // rear/left sleeve down the side
  stroke(put, cx - S * 0.13, S * 0.36, cx - S * 0.17, S * 0.6, S * 0.055, () => mix(F.labcoat, F.labcoatDk, 0.4));
  glove(put, S, cx - S * 0.17, S * 0.62, o.gauntlet === 'left');
  // right arm depends on pose
  if (o.pose === 'cross') {
    stroke(put, cx + S * 0.13, S * 0.36, cx - S * 0.02, S * 0.5, S * 0.055, () => mix(F.labcoat, F.labcoatDk, 0.3));
    glove(put, S, cx - S * 0.04, S * 0.5, o.gauntlet === 'right');
  } else if (o.pose === 'hips') {
    stroke(put, cx + S * 0.13, S * 0.36, cx + S * 0.19, S * 0.48, S * 0.05, () => mix(F.labcoat, F.labcoatDk, 0.3));
    stroke(put, cx + S * 0.19, S * 0.48, cx + S * 0.12, S * 0.54, S * 0.05, () => mix(F.labcoat, F.labcoatDk, 0.3));
    glove(put, S, cx + S * 0.12, S * 0.55, o.gauntlet === 'right');
  } else { // holding a prop out to the right
    stroke(put, cx + S * 0.13, S * 0.37, cx + S * 0.22, S * 0.52, S * 0.05, () => mix(F.labcoat, F.labcoatDk, 0.3));
    glove(put, S, cx + S * 0.24, S * 0.54, o.gauntlet === 'right');
  }
}
function glove(put, S, x, y, robotic) {
  if (robotic) { plate(put, x - S * 0.04, y - S * 0.04, x + S * 0.04, y + S * 0.05, F.steel, F.chrome, F.steelDk); [-1, 1].forEach(s => stroke(put, x + s * S * 0.02, y + S * 0.04, x + s * S * 0.03, y + S * 0.09, S * 0.015, () => F.steelMd)); optic(put, x, y, S * 0.015, F.cyanDk, F.cyan, F.cyanLt); }
  else ell(put, x, y, S * 0.045, S * 0.05, (tx, ty) => mix(F.rubberLt, F.rubberDk, 0.3 + ty * 0.5));
}
function head(put, S, cx, o) {
  const hy = S * 0.2;
  // neck
  plate(put, cx - S * 0.03, S * 0.28, cx + S * 0.03, S * 0.34, F.skinDk, F.skin, F.skinDk);
  // face
  ell(put, cx, hy, S * 0.09, S * 0.1, (tx, ty) => { let b = mix(F.skin, F.skinDk, clamp(ty * 0.9, 0, 1)); if (tx < 0.25) b = mix(b, '#f6d3b0', 0.4); return b; });
  // ears
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.09, hy + S * 0.01, S * 0.02, S * 0.03, () => F.skinDk));
  // RED glowing eyes (or goggles over them)
  if (o.eyes === 'goggles' || o.eyes === 'welder') {
    const gc = o.eyes === 'welder' ? F.molten : F.cyan, gd = o.eyes === 'welder' ? F.moltenDk : F.cyanDk, gl = o.eyes === 'welder' ? F.moltenLt : F.cyanLt;
    plate(put, cx - S * 0.09, hy - S * 0.02, cx + S * 0.09, hy + S * 0.03, F.gunDk, F.gun, F.oil); // goggle band
    [-1, 1].forEach(s => { ell(put, cx + s * S * 0.045, hy + S * 0.005, S * 0.032, S * 0.03, () => F.steelDk); optic(put, cx + s * S * 0.045, hy + S * 0.005, S * 0.018, gd, gc, gl); });
    // still hint red behind if goggles clear? keep glow only
  } else {
    [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, hy + S * 0.005, S * 0.022, F.redDk, F.red, F.redLt));
    // manic brows
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.02, hy - S * 0.03, cx + s * S * 0.07, hy - S * 0.045, 1.6, () => F.hairWDk));
  }
  if (o.eyes === 'monocle') { ell(put, cx + S * 0.04, hy + S * 0.005, S * 0.03, S * 0.03, () => F.brass); stroke(put, cx + S * 0.06, hy + S * 0.02, cx + S * 0.08, S * 0.3, 1.2, () => F.brassDk); }
  // nose
  put(Math.round(cx), Math.round(hy + S * 0.03), F.skinDk);
  // mouth / facial hair
  if (o.face === 'mustache') { for (let k = -4; k <= 4; k++) put(Math.round(cx + k * 1.4), Math.round(hy + S * 0.055 + Math.abs(k) * 0.4), F.hairW); }
  else if (o.face === 'beard') { for (let yy = 0; yy < S * 0.05; yy++) row(put, Math.round(hy + S * 0.05 + yy), cx - S * 0.06 + yy * 0.3, cx + S * 0.06 - yy * 0.3, () => F.hairW); }
  else if (o.face === 'grin') { for (let k = -3; k <= 3; k++) put(Math.round(cx + k * 2), Math.round(hy + S * 0.06), F.white); row(put, Math.round(hy + S * 0.055), cx - S * 0.04, cx + S * 0.04, () => F.oil); }
  else { row(put, Math.round(hy + S * 0.06), cx - S * 0.025, cx + S * 0.025, () => F.skinDk); }
  hair(put, S, cx, hy, o.hair);
}
function hair(put, S, cx, hy, style) {
  const top = hy - S * 0.09, c = F.hairW, d = F.hairWDk;
  if (style === 'bald') { dome(put, cx, hy - S * 0.05, S * 0.085, S * 0.06, F.skin, '#f6d3b0', F.skinDk); [-1, 1].forEach(s => { for (let k = 0; k < 4; k++) ell(put, cx + s * S * (0.08 + k * 0.015), hy - S * 0.02 + k * 3, S * 0.03, S * 0.025, () => (k % 2 ? c : d)); }); return; }
  if (style === 'einstein') { // wide fluffy cloud
    for (let a = -Math.PI * 0.95; a < Math.PI * 0.05; a += 0.28) { const rr = S * (0.11 + 0.03 * Math.sin(a * 3)); ell(put, cx + Math.cos(a) * S * 0.11, top + S * 0.03 + Math.sin(a) * S * 0.05, rr, rr * 0.85, (tx, ty) => mix(c, d, ty)); }
    [-1, 1].forEach(s => { for (let k = 0; k < 5; k++) ell(put, cx + s * S * (0.12 + k * 0.02), hy - S * 0.06 + k * S * 0.03, S * 0.035, S * 0.03, () => (k % 2 ? c : d)); }); // side puffs
    return;
  }
  if (style === 'spiky' || style === 'tesla') {
    dome(put, cx, hy - S * 0.04, S * 0.09, S * 0.06, c, F.white, d);
    for (let k = -4; k <= 4; k++) { const bx = cx + k * S * 0.02; stroke(put, bx, hy - S * 0.06, bx + k * S * 0.01, top - S * 0.04 - Math.abs(k) * 1, S * 0.02, () => (k % 2 ? c : d)); }
    if (style === 'tesla') [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, top - S * 0.03, cx + s * S * 0.11, top - S * 0.09, 1.4, () => F.cyanLt));
    return;
  }
  if (style === 'mohawk') { dome(put, cx, hy - S * 0.03, S * 0.085, S * 0.05, F.skin, '#f6d3b0', F.skinDk); for (let k = -1; k <= 5; k++) stroke(put, cx, hy - S * 0.05, cx, top - S * 0.05 + k * 2, S * 0.03, () => c); return; }
  if (style === 'long') { dome(put, cx, hy - S * 0.05, S * 0.09, S * 0.06, c, F.white, d); [-1, 1].forEach(s => { for (let y = hy - S * 0.05; y < hy + S * 0.12; y++) row(put, Math.round(y), cx + s * S * 0.07, cx + s * S * 0.11, () => (Math.round(y) % 4 < 2 ? c : d)); }); return; }
  // sidepart (comparatively tidy but still wild wisps)
  dome(put, cx, hy - S * 0.04, S * 0.09, S * 0.06, c, F.white, d);
  stroke(put, cx - S * 0.06, hy - S * 0.08, cx + S * 0.09, hy - S * 0.05, 1.4, () => d);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, hy - S * 0.06, cx + s * S * 0.12, hy - S * 0.1, 1.4, () => c));
}
// ---- props (drawn near the right hand at ~cx+0.24, 0.54) ----------------
function propWrench(put, S, cx) { const x = cx + S * 0.24; stroke(put, x, S * 0.56, x + S * 0.04, S * 0.78, S * 0.03, () => F.chromeMd); [S * 0.5, S * 0.78].forEach((yy, i) => { const px2 = x - i * S * 0.04; ell(put, px2, yy, S * 0.045, S * 0.04, () => F.steel); ell(put, px2, yy, S * 0.02, S * 0.02, () => F.gunDk); }); }
function propTablet(put, S, cx) { const x = cx + S * 0.24; plate(put, x - S * 0.06, S * 0.44, x + S * 0.06, S * 0.62, F.gunDk, F.gun, F.oil); plate(put, x - S * 0.045, S * 0.46, x + S * 0.045, S * 0.6, F.glass, F.glassLt, F.oil); [0.48, 0.52, 0.56].forEach(v => row(put, Math.round(S * v), x - S * 0.035, x + S * 0.02, () => F.cyan)); put(Math.round(x + S * 0.02), Math.round(S * 0.5), F.red); }
function propCoil(put, S, cx) { const x = cx + S * 0.24; stroke(put, x, S * 0.58, x, S * 0.44, S * 0.02, () => F.brassDk); for (let i = 0; i < 5; i++) row(put, Math.round(S * (0.44 - i * 0.02)), x - S * 0.03, x + S * 0.03, (t) => mix(F.copperLt, F.copperDk, t)); ell(put, x, S * 0.33, S * 0.045, S * 0.045, () => F.cyanDk); optic(put, x, S * 0.33, S * 0.03, F.cyanDk, F.cyan, F.cyanLt); [-1, 1].forEach(s => stroke(put, x, S * 0.31, x + s * S * 0.05, S * 0.25, 1.4, () => F.cyanLt)); }
function propRemote(put, S, cx) { const x = cx + S * 0.24; plate(put, x - S * 0.05, S * 0.5, x + S * 0.05, S * 0.62, F.red, F.redLt, F.redDk); ell(put, x, S * 0.49, S * 0.018, S * 0.018, () => F.steelLt); stroke(put, x, S * 0.49, x + S * 0.02, S * 0.42, 1.4, () => F.steelMd); [-0.02, 0.02].forEach(o => put(Math.round(x + o * S), Math.round(S * 0.55), F.hazard)); }
function propVial(put, S, cx) { const x = cx + S * 0.24; for (let y = S * 0.48; y < S * 0.62; y++) row(put, Math.round(y), x - S * 0.03, x + S * 0.03, (t) => mix(F.cyanLt, F.cyan, clamp(t, 0, 1))); ell(put, x, S * 0.62, S * 0.03, S * 0.02, () => F.cyanDk); plate(put, x - S * 0.02, S * 0.44, x + S * 0.02, S * 0.48, F.copper, F.copperLt, F.copperDk); ell(put, x, S * 0.5, S * 0.012, S * 0.012, () => F.white); }
function propRivetGun(put, S, cx) { const x = cx + S * 0.22; plate(put, x - S * 0.02, S * 0.5, x + S * 0.02, S * 0.66, F.gun, F.steel, F.gunDk); plate(put, x - S * 0.01, S * 0.52, x + S * 0.14, S * 0.56, F.steelMd, F.steel, F.steelDkk); ell(put, x + S * 0.15, S * 0.54, S * 0.02, S * 0.025, () => F.oil); plate(put, x - S * 0.05, S * 0.48, x + S * 0.03, S * 0.52, F.copper, F.brassLt, F.copperDk); }
function propBlueprint(put, S, cx) { const x = cx + S * 0.23; plate(put, x - S * 0.07, S * 0.46, x + S * 0.07, S * 0.62, F.blueDk, F.blue, F.oil); for (let y = S * 0.48; y < S * 0.6; y += 3) row(put, Math.round(y), x - S * 0.05, x + S * 0.05, () => F.blueLt); plate(put, x - S * 0.03, S * 0.5, x + S * 0.02, S * 0.56, '#0d2417', F.cyan, F.oil); }
function propController(put, S, cx) { const x = cx + S * 0.24; plate(put, x - S * 0.06, S * 0.52, x + S * 0.06, S * 0.6, F.gunDk, F.gun, F.oil); [-1, 1].forEach(s => ell(put, x + s * S * 0.035, S * 0.51, S * 0.014, S * 0.014, () => F.hazard)); put(Math.round(x), Math.round(S * 0.56), F.green); // little companion drone above
  ell(put, x + S * 0.04, S * 0.36, S * 0.05, S * 0.04, (tx, ty) => mix(F.steel, F.steelDk, ty)); optic(put, x + S * 0.04, S * 0.37, S * 0.02, F.redDk, F.red, F.redLt); stroke(put, x + S * 0.02, S * 0.5, x + S * 0.04, S * 0.4, 1, () => F.cyan); }
function backpack(put, S, cx, kind) {
  if (kind === 'tank') { [-1, 1].forEach(s => { for (let y = S * 0.36; y < S * 0.62; y++) row(put, Math.round(y), cx + s * S * 0.15, cx + s * S * 0.2, (t) => mix(F.copper, F.copperDk, t)); ell(put, cx + s * S * 0.175, S * 0.36, S * 0.025, S * 0.02, () => F.copperLt); }); }
  else if (kind === 'jet') { [-1, 1].forEach(s => { plate(put, cx + s * S * 0.14, S * 0.36, cx + s * S * 0.2, S * 0.56, F.steelMd, F.steel, F.steelDk); ell(put, cx + s * S * 0.17, S * 0.58, S * 0.025, S * 0.02, () => F.molten); }); }
  else if (kind === 'antenna') { plate(put, cx - S * 0.13, S * 0.36, cx + S * 0.13, S * 0.5, F.gun, F.steel, F.gunDk); stroke(put, cx + S * 0.1, S * 0.36, cx + S * 0.14, S * 0.22, 1.4, () => F.steelMd); ell(put, cx + S * 0.14, S * 0.21, S * 0.018, S * 0.018, () => F.red); vent(put, cx - S * 0.1, cx + S * 0.05, S * 0.42, 3); }
}
function drawScientist(put, S, o) {
  shadow(put, S, S * 0.5, S * 0.19, S * 0.92);
  const cx = S * 0.5;
  if (o.back) backpack(put, S, cx, o.back);
  legs(put, S, cx);
  coat(put, S, cx, o.accent, o.long);
  arms(put, S, cx, o);
  if (o.pose === 'prop' && o.prop && PROPS[o.prop]) PROPS[o.prop](put, S, cx);
  head(put, S, cx, o);
}
const PROPS = { wrench: propWrench, tablet: propTablet, coil: propCoil, remote: propRemote, vial: propVial, rivetgun: propRivetGun, blueprint: propBlueprint, controller: propController };

const LIST = [
  { n: 1, name: 'THE TINKERER', role: 'goggles + giant wrench', draw: (p, S) => drawScientist(p, S, { accent: F.red, hair: 'einstein', eyes: 'goggles', face: 'mustache', prop: 'wrench', pose: 'prop' }) },
  { n: 2, name: 'THE THEORIST', role: 'Einstein + blueprint', draw: (p, S) => drawScientist(p, S, { accent: F.blue, hair: 'einstein', eyes: 'red', face: 'mustache', prop: 'blueprint', pose: 'prop' }) },
  { n: 3, name: 'THE SPARKMASTER', role: 'tesla hair + coil', draw: (p, S) => drawScientist(p, S, { accent: F.cyan, hair: 'tesla', eyes: 'red', face: 'clean', prop: 'coil', pose: 'prop', back: 'antenna' }) },
  { n: 4, name: 'THE MECHANIST', role: 'welder goggles + robotic arm', draw: (p, S) => drawScientist(p, S, { accent: F.molten, hair: 'spiky', eyes: 'welder', face: 'beard', prop: 'rivetgun', pose: 'prop', gauntlet: 'right' }) },
  { n: 5, name: 'THE OVERSEER', role: 'antenna pack + tablet', draw: (p, S) => drawScientist(p, S, { accent: F.hazard, hair: 'sidepart', eyes: 'goggles', face: 'clean', prop: 'tablet', pose: 'prop', back: 'antenna' }) },
  { n: 6, name: 'THE GRIZZLED', role: 'monocle + long coat', draw: (p, S) => drawScientist(p, S, { accent: F.brass, hair: 'bald', eyes: 'monocle', face: 'beard', prop: 'wrench', pose: 'prop', long: true }) },
  { n: 7, name: 'THE ROCKETEER', role: 'jetpack + rivet gun', draw: (p, S) => drawScientist(p, S, { accent: F.red, hair: 'spiky', eyes: 'goggles', face: 'clean', prop: 'rivetgun', pose: 'prop', back: 'jet' }) },
  { n: 8, name: 'THE PUPPETEER', role: 'controller + drone', draw: (p, S) => drawScientist(p, S, { accent: F.green, hair: 'mohawk', eyes: 'red', face: 'grin', prop: 'controller', pose: 'prop' }) },
  { n: 9, name: 'THE CHEMIST', role: 'coolant vial', draw: (p, S) => drawScientist(p, S, { accent: F.cyan, hair: 'long', eyes: 'goggles', face: 'clean', prop: 'vial', pose: 'prop', back: 'tank' }) },
  { n: 10, name: 'THE COMMANDER', role: 'arms crossed, blazing eyes', draw: (p, S) => drawScientist(p, S, { accent: F.red, hair: 'einstein', eyes: 'red', face: 'mustache', pose: 'cross', long: true }) }
];

renderSheet({ list: LIST, out: process.argv[2] || 'factory_boss_engineer.png', cols: 5, title: 'BIOME 4 · THE GRAND ENGINEER — 10 PHASE-1 WORK-UPS  (mad scientist; pick one)' })
  .catch(e => { console.error(e); process.exit(1); });
