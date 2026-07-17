// artdev/underworld/render_eye_blink.js — SUPREME BEING blink frames.
// Renders the composite boss (watcher eye + judge) with the eye's lid
// at a given state, no sheet chrome — raw frame for GIF assembly.
// usage: node render_eye_blink.js <open|half|closed> out.png
'use strict';
const sharp = require('sharp');
const KIT = require('./underworld_kit.js');
const { H } = KIT;
const { eyeGod } = require('./render_supreme_eye.js');
const { zeusGod } = require('./render_supreme_zeus.js');
const { P } = require('./render_supreme_final.js');
const { mix, stroke } = KIT;

const S = 200, SCALE = 2;
const px = Buffer.alloc(S * S * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return; const [r, g, b] = hex(c); const i = (y * S + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }

// bg
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, '#0e0a16');

const lid = process.argv[2] || 'open';
// the composite (same layout as render_supreme_entrance.js)
const eS = 115, eOX = Math.round((S - eS) / 2), eOY = -6;
eyeGod((x, y, c) => put(x + eOX, y + eOY, c), eS, { wings: 2, rayAura: true, lidState: lid, seed: 1 });
const holy = '#fff2c0';
[[-14, -8], [14, 8]].forEach(([o1, o2]) => {
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x0 = S / 2 + o1 * (1 - t) + o2 * t, y0 = S * 0.3 + t * S * 0.28;
    put(Math.round(x0), Math.round(y0), mix(holy, H.night, 0.35 + t * 0.25));
    put(Math.round(x0 + 1), Math.round(y0), mix(holy, H.night, 0.6 + t * 0.2));
  }
});
const zS = 115, zOX = Math.round((S - zS) / 2), zOY = Math.round(S * 0.34);
zeusGod((x, y, c) => put(x + zOX, y + zOY, c), zS, P);

sharp(px, { raw: { width: S, height: S, channels: 4 } })
  .resize(S * SCALE, S * SCALE, { kernel: 'nearest' })
  .png().toFile(process.argv[3] || ('blink_' + lid + '.png'))
  .then(() => console.log('frame', lid));
