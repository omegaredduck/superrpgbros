// artdev/carnival/render_carnival_boss.js — THE RINGMASTER: 10 numbered
// work-ups (Red's banked package: the carnival's master of ceremonies).
// Parameterized ringmaster(put,S,o) so the picked look ports cleanly.
'use strict';
const KIT = require('./carnival_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, optic, shadow, renderSheet, grin } = KIT;

// o: { coat:[base,lt,dk], trim, tall, brute, face:'show'|'clown'|'skull'|'void'|'split',
//      hat:'top'|'tiny'|'crooked', weapon:'whip'|'cane'|'megaphone'|'strings'|'none',
//      arms4, eyes, float }
function ringmaster(put, S, o) {
  const [cb, cl, cd] = o.coat, trim = o.trim || C.glow;
  const H = o.tall ? 1.18 : 1, W = o.brute ? 1.45 : o.tall ? 0.85 : 1;
  const cx = S * 0.48;
  const footY = S * 0.9, hipY = S * (0.9 - 0.28 * H), shY = S * (0.9 - 0.48 * H), headY = S * (0.9 - 0.575 * H);
  shadow(put, S, S * 0.5, S * 0.3);

  // legs (jodhpurs + boots)
  if (!o.float) [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.045 * W, hipY, cx + s * S * 0.055 * W, footY - S * 0.06, S * 0.032 * W, (t) => mix(C.night, C.oil, t * 0.5));
    plate(put, cx + s * S * 0.055 * W - S * 0.032, footY - S * 0.07, cx + s * S * 0.055 * W + S * 0.032, footY, C.oil, C.ironDk, C.oil);
  });
  else { // floating: coat tapers to wisps
    for (let y = hipY; y < footY; y++) { const t = (y - hipY) / (footY - hipY); const w = S * 0.08 * W * (1 - t) * (1 + 0.3 * Math.sin(t * 12)); if (w > 1) row(put, Math.round(y), cx - w, cx + w, (tx) => mix(cd, C.oil, t)); }
  }
  // tailcoat body
  for (let y = shY; y < hipY + S * 0.02; y++) {
    const t = (y - shY) / (hipY - shY);
    const w = S * (0.1 - t * 0.025) * W;
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(cl, cb, clamp(tx * 1.4, 0, 1));
      if (tx > 0.75) b = mix(b, cd, 0.6);
      if (Math.abs(tx - 0.5) < 0.06) b = mix(b, C.cream, t < 0.5 ? 0.7 : 0); // shirt front
      return b;
    });
  }
  // coat tails flaring behind
  [-1, 1].forEach(s => {
    for (let y = hipY; y < footY - S * 0.04; y++) {
      const t = (y - hipY) / (footY - hipY);
      const x0 = cx + s * S * (0.05 + t * 0.075) * W;
      stroke(put, x0, y, x0 + s * S * 0.02, y, S * 0.02 * (1 - t * 0.4), () => mix(cb, cd, t * 0.8));
    }
  });
  // trim buttons
  [0.25, 0.45, 0.65].forEach(t => put(Math.round(cx), Math.round(lerp(shY, hipY, t)), trim));
  row(put, Math.round(hipY), cx - S * 0.07 * W, cx + S * 0.07 * W, () => trim); // sash
  // epaulettes
  [-1, 1].forEach(s => {
    const px = cx + s * S * 0.1 * W;
    ell(put, px, shY + S * 0.01, S * 0.038 * W, S * 0.025, (tx, ty) => mix(trim, mix(trim, '#000', 0.5), clamp(tx + ty * 0.5, 0, 1)));
    for (let d = 0; d < 4; d++) put(Math.round(px + s * S * 0.03), Math.round(shY + S * 0.03 + d * 2), trim);
  });

  // arms
  const armW = S * (o.brute ? 0.035 : 0.022);
  const rH = S * 0.52 * (2 - H); // hand heights scale
  // right arm raised (showman) — holds weapon
  const rx = cx + S * 0.16 * W, ry = shY - S * 0.06;
  stroke(put, cx + S * 0.09 * W, shY + S * 0.03, rx, ry, armW, (t) => mix(cl, cd, t * 0.6));
  ell(put, rx, ry, S * 0.02, S * 0.02, () => C.paint); // glove
  // left arm out low
  const lx = cx - S * 0.15 * W, ly = shY + S * 0.14;
  stroke(put, cx - S * 0.09 * W, shY + S * 0.03, lx, ly, armW, (t) => mix(cl, cd, t * 0.6));
  ell(put, lx, ly, S * 0.02, S * 0.02, () => C.paint);
  // extra arm pair (4-armed impresario)
  if (o.arms4) {
    const r2x = cx + S * 0.17 * W, r2y = shY + S * 0.18;
    stroke(put, cx + S * 0.08 * W, shY + S * 0.08, r2x, r2y, armW * 0.9, (t) => mix(cl, cd, t * 0.6));
    ell(put, r2x, r2y, S * 0.018, S * 0.018, () => C.paint);
    stroke(put, r2x, r2y, r2x + S * 0.02, r2y - S * 0.14, 2, () => C.woodDkk); // cane
    put(Math.round(r2x + S * 0.02), Math.round(r2y - S * 0.15), trim);
    const l2x = cx - S * 0.17 * W, l2y = shY + S * 0.2;
    stroke(put, cx - S * 0.08 * W, shY + S * 0.08, l2x, l2y, armW * 0.9, (t) => mix(cl, cd, t * 0.6));
    ell(put, l2x, l2y, S * 0.018, S * 0.018, () => C.paint);
    // megaphone in lower left
    for (let i = 0; i < 8; i++) { const t = i / 7; ell(put, l2x - S * 0.02 - t * S * 0.06, l2y + t * S * 0.01, S * (0.008 + t * 0.02), S * (0.008 + t * 0.018), (tx, ty) => mix(C.redLt, C.redDk, tx + ty * 0.3)); }
  }

  // head
  const hr = S * 0.055;
  const faceCol = o.face === 'clown' || o.face === 'split' ? C.paint : o.face === 'skull' ? '#e8e4d8' : o.face === 'void' ? C.oil : '#d8c8a8';
  ell(put, cx, headY, hr, hr * 1.1, (tx, ty) => {
    if (o.face === 'split') return tx < 0.5 ? mix(C.paint, C.paintDk, ty * 0.5) : mix('#d8c8a8', '#a89478', ty * 0.5);
    return mix(faceCol, mix(faceCol, '#000000', 0.35), clamp(tx * 0.8 + ty * 0.4, 0, 1));
  });
  // faces
  const eyes = o.eyes || C.glow;
  if (o.face === 'void') {
    optic(put, cx - S * 0.02, headY, S * 0.013, C.oil, C.oil, eyes);
    optic(put, cx + S * 0.02, headY, S * 0.013, C.oil, C.oil, eyes);
  } else if (o.face === 'skull') {
    ell(put, cx - S * 0.022, headY - S * 0.005, S * 0.016, S * 0.02, () => C.oil);
    ell(put, cx + S * 0.022, headY - S * 0.005, S * 0.016, S * 0.02, () => C.oil);
    put(Math.round(cx - S * 0.022), Math.round(headY - S * 0.005), eyes);
    put(Math.round(cx + S * 0.022), Math.round(headY - S * 0.005), eyes);
    put(Math.round(cx), Math.round(headY + S * 0.02), C.oil);
    for (let x = -0.03; x <= 0.03; x += 0.012) { put(Math.round(cx + x * S), Math.round(headY + S * 0.042), C.oil); put(Math.round(cx + x * S), Math.round(headY + S * 0.048), C.oil); }
  } else if (o.face === 'clown') {
    optic(put, cx - S * 0.022, headY - S * 0.004, S * 0.012, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.022, headY - S * 0.004, S * 0.012, C.oil, C.oil, '#ffffff');
    put(Math.round(cx), Math.round(headY + S * 0.012), C.red);
    grin(put, cx, headY + S * 0.032, S * 0.032, false, C.blood, true);
    put(Math.round(cx - S * 0.022), Math.round(headY + S * 0.018), C.teal); // tear
  } else if (o.face === 'split') {
    optic(put, cx - S * 0.022, headY - S * 0.004, S * 0.012, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.022, headY - S * 0.004, S * 0.011, C.oil, C.oil, eyes);
    grin(put, cx - S * 0.012, headY + S * 0.032, S * 0.02, false, C.blood, true);
    stroke(put, cx + S * 0.01, headY + S * 0.034, cx + S * 0.035, headY + S * 0.032, 1.4, () => C.oil);
    stroke(put, cx, headY - hr, cx, headY + hr, 1, () => mix(faceCol, '#000', 0.5)); // seam
  } else { // show
    optic(put, cx - S * 0.02, headY - S * 0.002, S * 0.011, C.oil, C.oil, eyes);
    optic(put, cx + S * 0.02, headY - S * 0.002, S * 0.011, C.oil, C.oil, eyes);
    // waxed mustache
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.004, headY + S * 0.024, cx + s * S * 0.038, headY + S * 0.018, 1.8, () => C.oil); put(Math.round(cx + s * S * 0.042), Math.round(headY + S * 0.014), C.oil); });
    grin(put, cx, headY + S * 0.036, S * 0.022, false, C.redDkk, false);
  }
  // hat
  if (o.hat === 'top' || o.hat === 'crooked') {
    const lean = o.hat === 'crooked' ? S * 0.02 : 0;
    plate(put, cx - S * 0.075, headY - hr - S * 0.01, cx + S * 0.075, headY - hr + S * 0.012, C.night, C.violetDk, C.oil);
    for (let y = 0; y < S * 0.11; y++) {
      const t = y / (S * 0.11);
      const xoff = lean * t;
      row(put, Math.round(headY - hr - S * 0.01 - y), cx - S * 0.05 + xoff, cx + S * 0.05 + xoff, (tx) => mix(C.night, C.oil, clamp(tx * 1.2, 0, 1)));
    }
    row(put, Math.round(headY - hr - S * 0.035), cx - S * 0.05 + lean * 0.25, cx + S * 0.05 + lean * 0.25, () => o.coat === undefined ? C.red : o.coat[0]); // hat band matches coat
  } else if (o.hat === 'tiny') {
    plate(put, cx - S * 0.035, headY - hr - S * 0.005, cx + S * 0.035, headY - hr + S * 0.008, C.night, C.violetDk, C.oil);
    plate(put, cx - S * 0.022, headY - hr - S * 0.05, cx + S * 0.022, headY - hr, C.night, C.violetDk, C.oil);
  }

  // ---- weapons ----
  if (o.weapon === 'whip') {
    // whip curling from the raised hand
    let px = rx, py = ry;
    const pts = [[0.09, -0.06], [0.17, -0.02], [0.2, 0.09], [0.13, 0.16], [0.2, 0.24]];
    pts.forEach(([dx, dy], i) => {
      const nx = rx + dx * S, ny = ry + dy * S + S * 0.02 * Math.sin(i * 3);
      stroke(put, px, py, nx, ny, Math.max(1, 2.6 - i * 0.5), () => i < 2 ? C.woodDk : '#8a5a30');
      px = nx; py = ny;
    });
    put(Math.round(px), Math.round(py), C.red); // popper
  } else if (o.weapon === 'cane') {
    stroke(put, rx, ry + S * 0.01, rx + S * 0.015, ry - S * 0.18, 2.4, () => C.woodDkk);
    ell(put, rx + S * 0.015, ry - S * 0.19, S * 0.016, S * 0.016, () => trim);
  } else if (o.weapon === 'megaphone') {
    for (let i = 0; i < 10; i++) { const t = i / 9; ell(put, rx + S * 0.02 + t * S * 0.07, ry - S * 0.02 - t * S * 0.04, S * (0.008 + t * 0.026), S * (0.008 + t * 0.024), (tx, ty) => mix(C.redLt, C.redDk, tx + ty * 0.3)); }
    // shout lines
    [[0.13, -0.1], [0.15, -0.05], [0.14, 0.0]].forEach(([dx, dy]) => put(Math.round(rx + dx * S), Math.round(ry + dy * S), C.glowLt));
  } else if (o.weapon === 'strings') {
    // marionette crossbar + strings to a tiny dangling clown puppet
    stroke(put, rx - S * 0.05, ry - S * 0.05, rx + S * 0.07, ry - S * 0.08, 2, () => C.wood);
    stroke(put, rx + S * 0.01, ry - S * 0.1, rx + S * 0.01, ry - S * 0.03, 2, () => C.wood);
    [[-0.04, -0.055], [0.06, -0.075]].forEach(([dx, dy]) => {
      const sx = rx + dx * S, sy = ry + dy * S;
      for (let t = 0; t < 1; t += 0.06) put(Math.round(lerp(sx, rx + S * 0.01, 0.5) + (dx < 0 ? -1 : 1) * Math.sin(t * 3) * 2), Math.round(sy + t * S * 0.16), C.creamDk);
    });
    // puppet
    const pxx = rx + S * 0.01, pyy = ry + S * 0.12;
    ell(put, pxx, pyy, S * 0.022, S * 0.028, (tx, ty) => mix(C.violet, C.violetDk, tx + ty * 0.3));
    ell(put, pxx, pyy - S * 0.03, S * 0.014, S * 0.015, () => C.paint);
    put(Math.round(pxx - 1), Math.round(pyy - S * 0.032), C.oil); put(Math.round(pxx + 1), Math.round(pyy - S * 0.032), C.oil);
  }
  // spotlight pool under him
  for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * 0.5 + Math.cos(a) * S * 0.28), Math.round(S * 0.9 + Math.sin(a) * S * 0.05), C.glowDk);
}

const V = [
  { n: 1, name: 'THE CLASSIC', role: 'red tailcoat + whip', o: { coat: [C.red, C.redLt, C.redDkk], face: 'show', hat: 'top', weapon: 'whip' } },
  { n: 2, name: 'THE TALL ONE', role: 'too tall, too thin', o: { coat: [C.night, C.violetDk, C.oil], trim: C.teal, tall: true, face: 'void', hat: 'top', weapon: 'cane', eyes: C.teal } },
  { n: 3, name: 'SPLIT-FACE', role: 'half showman half clown', o: { coat: [C.violet, C.violetLt, C.violetDk], face: 'split', hat: 'crooked', weapon: 'whip' } },
  { n: 4, name: 'THE PUPPETEER', role: 'marionette strings', o: { coat: [C.night, C.violet, C.oil], trim: C.violetLt, face: 'show', hat: 'top', weapon: 'strings', eyes: C.violetLt } },
  { n: 5, name: 'THE BRUTE', role: 'strongman-master, tiny hat', o: { coat: [C.red, C.redLt, C.redDkk], brute: true, face: 'show', hat: 'tiny', weapon: 'megaphone' } },
  { n: 6, name: 'THE FACELESS', role: 'void under the hat', o: { coat: [C.redDk, C.red, C.redDkk], face: 'void', hat: 'top', weapon: 'cane', eyes: C.glow } },
  { n: 7, name: 'GRAVE SHOWMAN', role: 'skull-faced spirit', o: { coat: [C.teal, C.tealLt, C.tealDk], trim: C.cream, face: 'skull', hat: 'crooked', weapon: 'whip', float: true, eyes: C.teal } },
  { n: 8, name: 'JESTER KING', role: 'clown-painted royal', o: { coat: [C.glowDk, C.glow, C.woodDkk], trim: C.violet, face: 'clown', hat: 'crooked', weapon: 'cane' } },
  { n: 9, name: 'THE IMPRESARIO', role: 'FOUR arms, all showman', o: { coat: [C.red, C.redLt, C.redDkk], face: 'show', hat: 'top', weapon: 'whip', arms4: true } },
  { n: 10, name: 'MIDNIGHT MC', role: 'black + gold, glow grin', o: { coat: [C.night, C.violetDk, C.oil], trim: C.glow, face: 'clown', hat: 'top', weapon: 'megaphone', eyes: C.glow } },
];

if (require.main === module) renderSheet({
  list: V.map(v => ({ n: v.n, name: v.name, role: v.role, draw: (put, S) => ringmaster(put, S, v.o) })),
  out: process.argv[2] || 'carnival_boss_options.png',
  title: 'THE RINGMASTER — 10 WORK-UPS (pick one, or combo parts)',
  S: 160
});
module.exports = { ringmaster, V };
