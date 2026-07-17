// artdev/prehistoria/render_hatch_frames.js — THE HATCH entrance frames
// (Red's spec): egg BIGGER than the dragon -> splits down the middle ->
// halves separate -> FLASH -> gone. usage: node render_hatch_frames.js <1-4> out.png
'use strict';
const sharp = require('sharp');
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke } = KIT;
const { dragon160 } = require('./render_dragons.js');
const { O } = require('./render_dragon_final.js');

const S = 220, SCALE = 2;
const px = Buffer.alloc(S * S * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return; const [r, g, b] = hex(c); const i = (y * S + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
const u = S / 220, X = v => v * u;

const F = parseInt(process.argv[2] || '1', 10);

// bg + nest
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, '#10140a');
for (let a = 0; a < 6.28; a += 0.03) {
  const rr = 84 + Math.sin(a * 9) * 4;
  for (let w = 0; w < 12; w++) put(Math.round(X(110 + Math.cos(a) * (rr - w))), Math.round(X(196 + Math.sin(a) * (rr - w) * 0.22 - w * 0.7)), mix(P.mudLt, P.mudDk, (w / 12) * 0.7 + (Math.sin(a * 13) + 1) / 6));
}

// the dragon (revealed frames 3+)
function drawDragon() {
  const dS = 150, ox = Math.round((S - dS) / 2) + 4, oy = 34;
  dragon160((x, y, c) => put(x + ox, y + oy, c), dS, { ...O, noFloor: true });
}
// giant egg (bigger than the dragon): center (110,110), rx 66, ry 96
function eggHalf(side, ox, flash) {
  // side: -1 left, +1 right, 0 whole
  for (let y = 16; y <= 202; y++) {
    const t = (y - 110) / 96;
    if (Math.abs(t) > 1) continue;
    let w = 66 * Math.sqrt(1 - t * t) * (y < 110 ? 0.92 : 1); // egg taper at top
    const splitX = 110 + Math.sin(y * 0.3) * 4; // jagged split line
    let x0 = 110 - w, x1 = 110 + w;
    if (side < 0) x1 = Math.min(x1, splitX);
    if (side > 0) x0 = Math.max(x0, splitX);
    if (x1 <= x0) continue;
    for (let x = x0; x <= x1; x++) {
      const tx = (x - (110 - w)) / (2 * w);
      let c = mix(P.white, P.bellyDk, clamp(tx * 1.2 + Math.abs(t) * 0.25, 0, 1));
      if (flash) c = mix(c, '#ffffff', 0.62);
      put(Math.round(X(x + ox)), Math.round(X(y)), c);
    }
    // split edge highlight
    if (side !== 0) { const ex = side < 0 ? x1 : x0; put(Math.round(X(ex + ox)), Math.round(X(y)), flash ? '#ffffff' : P.bellyDk); }
  }
  // speckles
  if (!flash) [[84, 90], [130, 74], [96, 140], [128, 150], [76, 160], [140, 116]].forEach(([sx2, sy2]) => {
    if (side < 0 && sx2 > 110) return; if (side > 0 && sx2 < 110) return;
    put(Math.round(X(sx2 + ox)), Math.round(X(sy2)), P.bellyDk); put(Math.round(X(sx2 + 4 + ox)), Math.round(X(sy2 + 3)), mix(P.bellyDk, P.white, 0.3));
  });
}

if (F === 1) {
  // whole giant egg, faint crack starting
  eggHalf(0, 0, false);
  stroke(put, X(110), X(30), X(108), X(70), X(1.2), () => P.bellyDk);
} else if (F === 2) {
  // crack runs the full height + glow inside
  eggHalf(0, 0, false);
  for (let y = 22; y <= 198; y += 2) { const sx2 = 110 + Math.sin(y * 0.3) * 4; put(Math.round(X(sx2)), Math.round(X(y)), '#2a1a08'); put(Math.round(X(sx2 + 1)), Math.round(X(y)), mix(P.volcano, '#ffd24a', (y % 6) / 6)); }
} else if (F === 3) {
  // halves separated + FLASHING, dragon revealed between
  drawDragon();
  eggHalf(-1, -44, true);
  eggHalf(1, 44, true);
  // flash rays off both halves
  [[30, 60], [24, 110], [34, 160], [190, 60], [196, 110], [186, 160]].forEach(([rx, ry]) => stroke(put, X(rx - 6), X(ry), X(rx + 6), X(ry), X(1.4), () => '#ffffff'));
} else {
  // halves GONE — dragon alone + fading sparkle remnants
  drawDragon();
  [[36, 80], [30, 130], [44, 170], [184, 76], [192, 126], [178, 168], [110, 30]].forEach(([sx2, sy2], i) => {
    put(Math.round(X(sx2)), Math.round(X(sy2)), i % 2 ? '#ffffff' : mix('#ffffff', '#10140a', 0.5));
    if (i % 2) { put(Math.round(X(sx2 + 1)), Math.round(X(sy2)), mix('#ffffff', '#10140a', 0.6)); put(Math.round(X(sx2)), Math.round(X(sy2 + 1)), mix('#ffffff', '#10140a', 0.6)); }
  });
}

sharp(px, { raw: { width: S, height: S, channels: 4 } })
  .resize(S * SCALE, S * SCALE, { kernel: 'nearest' })
  .png().toFile(process.argv[3] || ('hatch_' + F + '.png'))
  .then(() => console.log('frame', F));
