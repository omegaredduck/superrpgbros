// artdev/pirate/render_pirate_scene.js — PLANNED scene for the PIRATE SHIP:
// one huge moored galleon in a cove; the deck is the battlefield (ROCKING
// DECK mechanic). ~2400x2400 -> 900px.
'use strict';
const KIT = require('./pirate_kit.js');
const { P, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 940;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function rect(x0, y0, x1, y1, fn) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, fn(x, y)); }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }
const Pt = (fx, fy) => [Math.round(fx * W), Math.round(fy * W)];

// base: night sea
rect(0, 0, W, W, (x, y) => {
  const s1 = Math.sin(x * 0.05 + y * 0.03) + Math.sin(y * 0.06 - x * 0.02);
  let b = mix(P.seaLt, P.sea, 0.45 + s1 * 0.2);
  if (s1 > 1.3) b = mix(b, P.moonLt, 0.4);
  if (h2(x, y, 3) > 0.998) b = P.moonLt;
  return b;
});
// cove beach (west edge)
rect(0, 0, Math.round(W * 0.16), W, (x, y) => {
  const edge = W * (0.13 + Math.sin(y * 0.02) * 0.02);
  if (x > edge) return null;
  let b = mix('#d9c08a', '#a8905e', 0.2 + h2(x >> 2, y >> 2, 55) * 0.4);
  if (x > edge - 8) b = mix(b, '#f0dca8', 0.5); // wet line
  return b;
});
// dock from beach to ship
rect(...Pt(0.13, 0.47), ...Pt(0.3, 0.53), (x, y) => {
  let b = mix('#9a8262', '#6e5a42', 0.25 + h2(Math.floor(x / 12), 3, 75) * 0.4);
  if (x % 12 < 1.4) return P.woodDkk;
  return b;
});
// THE SHIP — big hull occupying center/east, bow to the north
function inShip(x, y) {
  const cxS = W * 0.6, W2 = W * 0.26;
  const t = clamp((y - W * 0.06) / (W * 0.88), 0, 1);
  // hull width profile: pointed bow (t=0), widest mid, rounded stern (t=1)
  let half;
  if (t < 0.22) half = W2 * Math.sqrt(t / 0.22) * 0.9;
  else if (t > 0.85) half = W2 * (0.9 - (t - 0.85) * 2.2);
  else half = W2 * 0.9;
  return Math.abs(x - cxS) < half && y > W * 0.06 && y < W * 0.94 ? { t, cxS, half } : null;
}
rect(Math.round(W * 0.3), Math.round(W * 0.04), W, W, (x, y) => {
  const s = inShip(x, y);
  if (!s) return null;
  // hull rim
  if (Math.abs(Math.abs(x - s.cxS) - s.half) < 7) return mix(P.woodDkk, P.oil, h2(x, y, 8) * 0.4);
  // deck planks (vertical planks along the ship)
  const pw = 14;
  let b = mix(P.deck, P.deckDk, 0.2 + h2(Math.floor((x - s.cxS) / pw), Math.floor(y / 90), 15) * 0.35);
  if ((x - s.cxS + 500) % pw < 1.2) b = P.woodDkk;
  // quarterdeck (stern, polished) + foredeck (bow, storm deck)
  if (s.t > 0.72) b = mix('#b8956a', '#8a6a48', 0.25 + h2(x >> 2, y >> 2, 25) * 0.3);
  if (s.t < 0.3) b = mix('#57402c', '#33251a', 0.3 + h2(x >> 2, y >> 2, 105) * 0.35);
  return b;
});

// ---- decor + labels ----
const MARKS = [];
function decor(fx, fy, r, c, cDk, label) { const [x, y] = Pt(fx, fy); dot(x, y, r, c, cDk); if (label) MARKS.push([x, y, label]); }
// beach spawn + cove props
decor(0.06, 0.5, 5, '#d9c08a', '#a8905e', 'SPAWN — the cove');
decor(0.05, 0.38, 4, P.wood, P.woodDkk, '6 rowboat ashore');
decor(0.08, 0.62, 4, P.wood, P.woodDkk, '16 nets + crates');
decor(0.2, 0.5, 4, P.brass, P.brassDk, '15 lanterns (dock)');
// gangplank + rails
decor(0.31, 0.5, 4, P.woodLt, P.woodDkk, 'gangplank');
[[0.44, 0.36], [0.76, 0.36], [0.44, 0.64], [0.76, 0.64]].forEach(([fx, fy], i) => decor(fx, fy, 3, P.woodLt, P.woodDk, i === 0 ? '11 rails all round' : null));
// FOREDECK (bow, arena)
decor(0.6, 0.12, 6, P.woodLt, P.woodDkk, '12 FIGUREHEAD (bow)');
decor(0.6, 0.2, 5, P.iron, P.ironDk, '13 capstan');
decor(0.52, 0.26, 4, P.brass, P.brassDk, '15');
MARKS.push([...Pt(0.68, 0.24), 'BOSS ARENA — storm deck']);
// midship
decor(0.6, 0.42, 6, P.wood, P.woodDkk, '2 MAINMAST + 14 rigging');
decor(0.52, 0.48, 5, P.woodDk, P.oil, '4 cargo hatch');
[[0.48, 0.56], [0.72, 0.56]].forEach(([fx, fy], i) => decor(fx, fy, 4, P.cannon, P.cannonDk, i === 0 ? '3 cannon rows both rails' : null));
decor(0.68, 0.44, 4, P.sail, P.sailDkk, '18 tattered sail');
decor(0.66, 0.5, 3, P.red, P.redDk, '19 parrot perch');
decor(0.54, 0.38, 4, P.wood, P.woodDkk, '8 rum barrels');
// below-deck pocket (galley/hammocks zone marked midship-west)
decor(0.46, 0.62, 5, '#8a4a3a', '#3a1c16', '9 galley + 20 hammocks (hold pocket)');
// quarterdeck (stern)
decor(0.6, 0.82, 6, P.woodLt, P.woodDkk, "1 SHIP'S WHEEL (helm)");
decor(0.52, 0.78, 4, P.sail, P.sailDk, '10 chart table');
decor(0.68, 0.78, 4, P.gold, P.goldDk, '7 treasure chest');
decor(0.6, 0.9, 4, P.woodDk, P.oil, "9 captain's cabin doors");
decor(0.7, 0.88, 3, P.brass, P.brassDk, '15');
// crow's nest + plank
decor(0.6, 0.36, 4, P.wood, P.woodDkk, "5 crow's nest (mast top)");
decor(0.85, 0.56, 4, P.woodLt, P.woodDk, '17 THE PLANK (starboard)');
// the summoning spot — ghost ship surfaces to starboard
MARKS.push([...Pt(0.9, 0.3), 'GHOST SHIP surfaces here (boss summon)']);
// kraken tentacle entrance spot
MARKS.push([...Pt(0.42, 0.14), 'tentacle THROWS the captain aboard']);

const zone = (fx, fy, t, sub) => {
  const [x, y] = Pt(fx, fy);
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="17" font-weight="bold" fill="#ffffff" stroke="#0a1014" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>` +
    (sub ? `<text x="${x}" y="${y + 16}" font-family="monospace" font-size="11" fill="#5fe8c2" stroke="#0a1014" stroke-width="2.5" paint-order="stroke" text-anchor="middle">${sub}</text>` : '');
};
const marks = MARKS.map(([x, y, t]) => `<text x="${x + 9}" y="${y - 7}" font-family="monospace" font-size="10" fill="#ffe3a8" stroke="#0a1014" stroke-width="2.5" paint-order="stroke">${t}</text>`).join('');
const svg = Buffer.from(`<svg width="${W}" height="${Hh}">
${zone(0.09, 0.3, 'THE COVE', 'beach spawn + dock')}
${zone(0.6, 0.065, 'THE FOREDECK (BOSS)', 'storm deck — tentacle entrance')}
${zone(0.6, 0.56, 'MIDSHIP', 'mast + hatch + cannon rows')}
${zone(0.6, 0.73, 'THE QUARTERDECK', 'helm + charts + cabin')}
${zone(0.88, 0.14, '', '')}
${marks}
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#0e1a24"/>
<text x="${W / 2}" y="${W + 16}" font-family="monospace" font-size="13" font-weight="bold" fill="#5fe8c2" text-anchor="middle">PIRATE SHIP — PLANNED SCENE (ROCKING DECK: the whole ship tilts on a swell clock, everything slides · wrap ON)</text>
<text x="${W / 2}" y="${W + 32}" font-family="monospace" font-size="11" fill="#8a6a48" text-anchor="middle">decor#: 1 wheel · 2 mast · 3 cannons · 4 hatch · 5 nest · 6 rowboat · 7 chest · 8 rum · 9 galley · 10 charts · 11 rails · 12 figurehead · 13 capstan · 14 rigging · 15 lanterns · 16 nets · 17 plank · 18 sail · 19 parrot · 20 hammocks</text>
</svg>`);

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: svg }]).png()
  .toFile(process.argv[2] || 'pirate_scene_plan.png')
  .then(() => console.log('wrote scene plan'));
