// artdev/colosseum/render_colosseum_chariots.js — 10 CHARIOT RACER
// work-ups (Red rejected the first cramped draw). ONE parameterized
// chariot(put,S,p) in clean SIDE PROFILE so combos/recolors are param
// tweaks. Horse gallops LEFT, car + driver behind.
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, galea, laurel } = KIT;

// p: {
//   horse:[base,dk] | 'skeletal' | 'ghost', horseArmor, horsePlume,
//   twin (two horses staggered), car:[base,lt,dk], carTrim, plated,
//   wheel:[c,dk], scythes, flames, spokes,
//   driver:{tunic, helm:'galea'|'hood'|'laurel'|'none', crest, whip, spear},
//   ghostly (whole rig translucent-ish palette), dust
// }
function horseDraw(put, S, hx, hy, p, back) {
  const gh = p.horse === 'ghost', sk = p.horse === 'skeletal';
  const base = gh ? C.ghost : sk ? C.bone : p.horse[0];
  const dk = gh ? '#5a8088' : sk ? C.boneDk : p.horse[1];
  const lt = gh ? C.ghostLt : sk ? '#f4eee0' : mix(base, '#ffffff', 0.28);
  const shade = (c) => back ? mix(c, '#000000', 0.18) : c;
  const H = (tx, ty) => shade(sk
    ? mix(lt, dk, clamp(tx * 0.7 + ty * 0.6, 0, 1))
    : mix(lt, base, clamp(ty * 1.4, 0, 1)) === lt ? lt : shade(mix(mix(lt, base, clamp(ty * 1.4, 0, 1)), dk, clamp((ty - 0.45) * 1.3, 0, 1) + tx * 0.15)));
  const coat = (tx, ty) => { let b = mix(lt, base, clamp(ty * 1.5, 0, 1)); b = mix(b, dk, clamp((ty - 0.4) * 1.4, 0, 1)); if (tx > 0.85) b = mix(b, dk, 0.3); return shade(b); };
  // ---- body: chest + barrel + haunches (galloping stretch)
  ell(put, hx + S * 0.085, hy - S * 0.005, S * 0.062, S * 0.06, coat);   // haunches (rump, higher)
  ell(put, hx - S * 0.005, hy + S * 0.005, S * 0.085, S * 0.052, coat);  // barrel
  ell(put, hx - S * 0.085, hy - S * 0.002, S * 0.055, S * 0.055, coat);  // chest (deep)
  // ---- hind legs (extended back in gallop) — two segments + hoof
  const leg = (x0, y0, x1, y1, x2, y2, w, front) => {
    stroke(put, hx + x0 * S, hy + y0 * S, hx + x1 * S, hy + y1 * S, S * w, (t) => shade(front ? base : dk));
    stroke(put, hx + x1 * S, hy + y1 * S, hx + x2 * S, hy + y2 * S, S * w * 0.7, () => shade(front ? base : dk));
    put(Math.round(hx + x2 * S), Math.round(hy + y2 * S + 1), shade(sk ? C.boneDk : '#241812')); // hoof
    put(Math.round(hx + x2 * S - 1), Math.round(hy + y2 * S + 1), shade(sk ? C.boneDk : '#241812'));
  };
  leg(0.1, 0.035, 0.155, 0.09, 0.21, 0.135, 0.024, false);   // far hind — kicked back
  leg(0.085, 0.04, 0.12, 0.1, 0.15, 0.16, 0.026, true);      // near hind
  leg(-0.075, 0.04, -0.1, 0.1, -0.085, 0.16, 0.022, false);  // far fore — reaching down
  leg(-0.09, 0.035, -0.13, 0.08, -0.185, 0.115, 0.024, true);// near fore — extended fwd
  // ---- neck: arched, tapering into the head
  for (let t = 0; t < 1; t += 0.04) {
    const nx = hx - S * (0.1 + t * 0.085), ny = hy - S * (0.02 + t * 0.075 + Math.sin(t * 2.4) * 0.012);
    const w = S * (0.048 - t * 0.02);
    ell(put, nx, ny, w, w * 0.9, coat);
  }
  // ---- head: jaw + face + muzzle, ears pricked
  const hdx = hx - S * 0.2, hdy = hy - S * 0.1;
  ell(put, hdx, hdy, S * 0.036, S * 0.032, coat);                          // jaw/cheek
  for (let t = 0; t < 1; t += 0.1) ell(put, hdx - t * S * 0.038, hdy + t * S * 0.012, S * (0.026 - t * 0.008), S * (0.024 - t * 0.008), coat); // face taper
  ell(put, hdx - S * 0.048, hdy + S * 0.016, S * 0.014, S * 0.012, (tx, ty) => shade(mix(dk, '#241812', ty))); // muzzle
  put(Math.round(hdx - S * 0.055), Math.round(hdy + S * 0.012), shade('#241812'));  // nostril
  optic(put, hdx - S * 0.005, hdy - S * 0.008, S * 0.007, C.oil, sk || gh ? (gh ? C.ghostLt : C.crimson) : '#3a2214', '#fff');
  [[-0.005, -0.03, 0.012, -0.055], [0.018, -0.028, 0.032, -0.05]].forEach(([x0, y0, x1, y1]) =>
    stroke(put, hdx + x0 * S, hdy + y0 * S, hdx + x1 * S, hdy + y1 * S, S * 0.011, () => shade(base))); // ears
  // bridle
  stroke(put, hdx - S * 0.03, hdy + S * 0.02, hdx + S * 0.015, hdy - S * 0.002, 1, () => shade(C.leatherDk));
  // ---- mane: flowing back along the arch (or plume)
  if (p.horsePlume) {
    for (let i = 0; i < 4; i++) stroke(put, hdx + S * 0.02 + i, hdy - S * 0.04, hdx + S * 0.035 + i * 2.2, hdy - S * 0.085, 1.8, () => shade(p.carTrim || C.crimsonLt));
  }
  if (!sk) for (let t = 0; t < 1; t += 0.07) {
    const mx = hx - S * (0.095 + t * 0.075), my = hy - S * (0.055 + t * 0.065);
    stroke(put, mx, my, mx + S * (0.03 + t * 0.012), my - S * 0.008 + Math.sin(t * 9) * 2, S * 0.012, () => shade(sk ? C.boneDk : mix(dk, '#1c1008', 0.4)));
  }
  // ---- skeletal ribs
  if (sk) [[-0.045], [-0.01], [0.025], [0.06]].forEach(([dx]) => stroke(put, hx + dx * S, hy - S * 0.035, hx + dx * S + 2, hy + S * 0.03, 1, () => C.boneDk));
  // ---- tail: streaming back in the wind
  for (let i = 0; i < 4; i++) {
    stroke(put, hx + S * 0.135, hy - S * 0.02 + i, hx + S * (0.21 + i * 0.008), hy + S * (0.005 + i * 0.014) + Math.sin(i * 2.1) * 2, S * 0.011, () => shade(sk ? C.boneDk : mix(dk, '#1c1008', 0.35)));
  }
  // ---- belly + hindquarter muscle highlights
  stroke(put, hx - S * 0.05, hy + S * 0.045, hx + S * 0.05, hy + S * 0.048, 1, () => shade(dk)); // belly line
  ell(put, hx + S * 0.08, hy - S * 0.015, S * 0.028, S * 0.02, (tx, ty) => (tx < 0.5 && ty < 0.5 ? shade(lt) : null)); // haunch sheen
  // ---- armor drape
  if (p.horseArmor) { for (let y = -0.03; y < 0.045; y += 0.015) row(put, Math.round(hy + y * S), hx - S * 0.07, hx + S * 0.075, (tx) => shade(mix(C.bronzeLt, C.bronzeDk, tx + (y + 0.03) * 6))); }
}
function chariot(put, S, p) {
  const cy = S * 0.58;
  const gh = p.ghostly;
  shadow(put, S, S * 0.5, S * 0.3);
  // yoke pole first (behind everything)
  stroke(put, S * 0.32, cy + S * 0.02, S * 0.6, cy + S * 0.06, S * 0.014, () => gh ? '#5a8088' : C.woodDk);
  // horses
  if (p.twin) horseDraw(put, S, S * 0.3, cy - S * 0.06, p, true);
  horseDraw(put, S, S * 0.32, cy, p);
  // wheel
  const wx = S * 0.72, wy = cy + S * 0.13, wr = S * 0.105;
  const wc = p.wheel[0], wd = p.wheel[1];
  ell(put, wx, wy, wr, wr, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.15 ? mix(wc, wd, tx) : null));
  for (let i = 0; i < (p.spokes || 4); i++) { const a = i * Math.PI / (p.spokes || 4); stroke(put, wx - Math.cos(a) * wr, wy - Math.sin(a) * wr, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, 1.4, () => wd); }
  ell(put, wx, wy, S * 0.018, S * 0.018, () => C.ironDk);
  // scythe blades on the hub
  if (p.scythes) [[1, 0], [-0.5, 0.87], [-0.5, -0.87]].forEach(([ca, sa]) => {
    stroke(put, wx + ca * wr * 1.05, wy + sa * wr * 1.05, wx + ca * wr * 1.55, wy + sa * wr * 1.35, 2.2, () => C.ironLt);
  });
  // flaming wheel
  if (p.flames) for (let a = 0; a < 6.28; a += 0.35) {
    const fx = wx + Math.cos(a) * wr * 1.2, fy = wy + Math.sin(a) * wr * 1.2;
    put(Math.round(fx), Math.round(fy), '#ff7d3a'); put(Math.round(fx + 1), Math.round(fy - 1), '#ffd34d');
  }
  // car body (behind wheel top half)
  const car = p.car;
  for (let y = cy - S * 0.08; y < cy + S * 0.1; y++) {
    const t = (y - (cy - S * 0.08)) / (S * 0.18);
    const x0 = S * 0.6 - (1 - t) * S * 0.02, x1 = S * 0.84;
    row(put, Math.round(y), x0, x1, (tx) => {
      let b = mix(car[1], car[0], clamp(tx * 1.2, 0, 1));
      if (tx > 0.8) b = mix(b, car[2], 0.55);
      if (p.plated && (tx * 8 | 0) % 3 === 0) b = mix(b, car[2], 0.35);
      return b;
    });
  }
  row(put, Math.round(cy - S * 0.08), S * 0.58, S * 0.84, () => p.carTrim || C.gold); // rail trim
  if (p.plated) [0.63, 0.7, 0.77].forEach(x => { for (let y = cy - S * 0.06; y < cy + S * 0.08; y += 3) put(Math.round(S * x), Math.round(y), C.ironLt); }); // rivets
  // driver
  const d = p.driver, dx = S * 0.72, dy = cy - S * 0.14;
  // torso leaning fwd
  stroke(put, dx + S * 0.015, dy + S * 0.1, dx - S * 0.025, dy, S * 0.045, () => gh ? C.ghost : d.tunic[0]);
  row(put, Math.round(dy + S * 0.02), dx - S * 0.05, dx + S * 0.005, () => gh ? '#5a8088' : d.tunic[1]);
  // arms: rein arm fwd, whip/spear arm up-back
  stroke(put, dx - S * 0.02, dy + S * 0.02, dx - S * 0.12, dy + S * 0.05, S * 0.016, () => gh ? C.ghost : C.skin);
  stroke(put, dx - S * 0.12, dy + S * 0.05, S * 0.34, cy - S * 0.05, 1, () => C.leatherDk); // reins
  if (d.whip) {
    stroke(put, dx + S * 0.01, dy + S * 0.02, dx + S * 0.08, dy - S * 0.06, S * 0.016, () => gh ? C.ghost : C.skin);
    let px0 = dx + S * 0.09, py0 = dy - S * 0.07;
    for (let t = 0; t < 1; t += 0.05) put(Math.round(px0 + t * S * 0.1 - Math.sin(t * 5) * S * 0.02), Math.round(py0 - Math.sin(t * 3.4) * S * 0.06), gh ? C.ghostLt : C.leather);
  }
  if (d.spear) { stroke(put, dx + S * 0.01, dy + S * 0.02, dx + S * 0.07, dy - S * 0.07, S * 0.016, () => gh ? C.ghost : C.skin); stroke(put, dx + S * 0.11, dy + S * 0.02, dx - S * 0.02, dy - S * 0.14, 2, () => C.wood); put(Math.round(dx - S * 0.03), Math.round(dy - S * 0.155), C.ironLt); }
  // head + helm
  const hy2 = dy - S * 0.045;
  ell(put, dx - S * 0.005, hy2, S * 0.035, S * 0.038, (tx, ty) => gh ? mix(C.ghostLt, C.ghost, tx) : mix(C.skin, C.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, dx - S * 0.018, hy2 - S * 0.004, S * 0.006, C.oil, gh ? C.ghostLt : C.oil, '#fff');
  if (d.helm === 'galea') galea(put, dx - 0.005 * S, hy2 - S * 0.028, S * 0.038, d.crest || [C.crimson, C.crimsonLt]);
  if (d.helm === 'hood') ell(put, dx - S * 0.005, hy2 - S * 0.01, S * 0.042, S * 0.035, (tx, ty) => (ty < 0.6 ? mix('#3a3a42', C.oil, tx) : null));
  if (d.helm === 'laurel') laurel(put, dx - S * 0.005, hy2 - S * 0.012, S * 0.038, '#5a7e46');
  // dust kick
  if (p.dust !== false) [[0.86, 0.7], [0.9, 0.66], [0.88, 0.74]].forEach(([x, y]) => ell(put, S * x, S * y, S * 0.02, S * 0.014, (tx, ty) => mix(C.sandLt, C.sand, tx)));
}

const V = {
  crimson: { horse: ['#6e4a2e', '#4a2e1a'], car: [C.crimson, C.crimsonLt, C.crimsonDk], wheel: [C.gold, C.goldDk], driver: { tunic: [C.crimson, C.crimsonLt], helm: 'galea', crest: [C.crimson, C.crimsonLt], whip: true }, horsePlume: true },
  blues: { horse: ['#4a4e58', '#2e3038'], car: ['#2e5a8a', '#5a8ac0', '#1a3450'], carTrim: '#c8e0f8', wheel: [C.ironLt, C.ironDk], spokes: 6, driver: { tunic: ['#2e5a8a', '#5a8ac0'], helm: 'none', whip: true }, dust: true },
  greens: { horse: ['#b09468', '#7a6034'], car: ['#3e6a34', '#6a9a58', '#24401c'], carTrim: C.goldLt, wheel: [C.wood, C.woodDk], driver: { tunic: ['#3e6a34', '#6a9a58'], helm: 'none', whip: true } },
  scythed: { horse: ['#3a3a42', '#1c1c22'], horseArmor: true, car: [C.iron, C.ironLt, C.ironDk], plated: true, wheel: [C.iron, C.ironDk], scythes: true, spokes: 6, driver: { tunic: [C.iron, C.ironLt], helm: 'galea', crest: [C.ironDk, C.iron], spear: true } },
  biga: { horse: ['#e8e0d0', '#b0a890'], twin: true, car: [C.gold, C.goldLt, C.goldDk], carTrim: C.crimsonLt, wheel: [C.gold, C.goldDk], spokes: 6, driver: { tunic: [C.purple, C.purpleLt], helm: 'galea', crest: [C.gold, C.goldLt], whip: true }, horsePlume: true },
  funeral: { horse: 'skeletal', car: [C.purpleDk, C.purple, '#1c0a24'], carTrim: C.purpleLt, wheel: ['#3a3a42', C.oil], driver: { tunic: ['#3a3a42', '#5a5a66'], helm: 'hood' }, dust: false },
  flame: { horse: ['#8a3a1a', '#521e0a'], car: ['#c23a1a', '#ff7d3a', '#701c08'], carTrim: '#ffd34d', wheel: ['#701c08', '#3a0e04'], flames: true, driver: { tunic: ['#c23a1a', '#ff7d3a'], helm: 'none', whip: true }, horsePlume: true },
  juggernaut: { horse: ['#5a4a3a', '#38291c'], horseArmor: true, car: [C.bronze, C.bronzeLt, C.bronzeDk], plated: true, wheel: [C.bronzeDk, C.oil], spokes: 8, driver: { tunic: [C.bronze, C.bronzeLt], helm: 'galea', crest: [C.bronzeDk, C.bronze], spear: true } },
  ghost: { horse: 'ghost', ghostly: true, car: ['#5a8088', C.ghost, '#3a545a'], carTrim: C.ghostLt, wheel: ['#5a8088', '#2c4046'], driver: { tunic: [C.ghost, C.ghostLt], helm: 'galea', crest: ['#5a8088', C.ghost] }, dust: false },
  parade: { horse: ['#f0ead8', '#c0b8a0'], car: ['#f0ead8', '#fffcf0', '#b8b09a'], carTrim: C.gold, wheel: [C.gold, C.goldDk], spokes: 6, driver: { tunic: ['#f0ead8', '#fffcf0'], helm: 'laurel', whip: false }, horsePlume: true },
};

const LIST = [
  { n: 1, name: 'CRIMSON CLASSIC', role: 'red team standard', draw: (p, S) => chariot(p, S, V.crimson) },
  { n: 2, name: 'BLUE TEAM SPRINTER', role: 'lean racing rig', draw: (p, S) => chariot(p, S, V.blues) },
  { n: 3, name: 'GREEN TEAM RUNNER', role: 'farm-stock racer', draw: (p, S) => chariot(p, S, V.greens) },
  { n: 4, name: 'SCYTHED WAR CART', role: 'blade hubs, armored', draw: (p, S) => chariot(p, S, V.scythed) },
  { n: 5, name: 'GOLDEN BIGA', role: 'twin white horses', draw: (p, S) => chariot(p, S, V.biga) },
  { n: 6, name: 'FUNERAL CART', role: 'skeletal horse, hooded', draw: (p, S) => chariot(p, S, V.funeral) },
  { n: 7, name: 'FLAME WHEELER', role: 'burning wheels', draw: (p, S) => chariot(p, S, V.flame) },
  { n: 8, name: 'BRONZE JUGGERNAUT', role: 'plated heavy', draw: (p, S) => chariot(p, S, V.juggernaut) },
  { n: 9, name: 'GHOST CHARIOT', role: 'spectral racer', draw: (p, S) => chariot(p, S, V.ghost) },
  { n: 10, name: 'PARADE CHARIOT', role: 'white + gold + laurel', draw: (p, S) => chariot(p, S, V.parade) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_chariot_options.png', title: 'CHARIOT RACER — 10 WORK-UPS (combo + recolor welcome)', S: 190, cols: 5 });
}
module.exports = { chariot, V, LIST };
