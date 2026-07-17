// artdev/colosseum/render_colosseum_mobs.js — 20 numbered COLOSSEUM mob
// candidates, one PNG grid. Gladiators, beasts + arena spectacle.
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, galea, scutum, spear, laurel } = KIT;

// shared human base (tunic + sandals)
function body(put, S, cx, o) {
  o = o || {};
  const tun = o.tunic || [C.leather, C.leatherLt, C.leatherDk];
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, S * 0.6, cx + s * S * 0.05, S * 0.84, S * 0.028, () => o.legs || C.skin);
    plate(put, cx + s * S * 0.05 - S * 0.028, S * 0.84, cx + s * S * 0.05 + S * 0.032, S * 0.87, C.leatherDk, C.leather, C.oil);
    // greave
    if (o.greaves) stroke(put, cx + s * S * 0.045, S * 0.68, cx + s * S * 0.05, S * 0.83, S * 0.03, () => C.bronze);
  });
  for (let y = S * 0.42; y < S * 0.62; y++) {
    const t = (y - S * 0.42) / (S * 0.2), w = S * (0.08 + t * 0.02) * (o.wide || 1);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(tun[1], tun[0], clamp(tx * 1.3, 0, 1));
      if (tx > 0.72) b = mix(b, tun[2], 0.6);
      if (o.bare && t < 0.45) b = mix(C.skin, C.skinDk, tx); // bare chest
      return b;
    });
  }
  row(put, Math.round(S * 0.6), cx - S * 0.085 * (o.wide || 1), cx + S * 0.085 * (o.wide || 1), () => C.leatherDk);
  put(Math.round(cx), Math.round(S * 0.6), C.gold);
}
function head(put, S, cx, cy) {
  ell(put, cx, cy, S * 0.052, S * 0.056, (tx, ty) => mix(C.skin, C.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.018, cy - S * 0.005, S * 0.01, C.oil, C.oil, '#fff');
  optic(put, cx + S * 0.018, cy - S * 0.005, S * 0.01, C.oil, C.oil, '#fff');
}

// 1 · GLADIATOR — sword + shield, warned slash
function drawGladiator(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.crimson, C.crimsonLt, C.crimsonDk], greaves: true });
  scutum(put, cx - S * 0.16, S * 0.52, S * 0.07, S * 0.12, C.crimson, C.crimsonLt, C.crimsonDk, C.gold);
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.17, S * 0.37, S * 0.02, () => C.skin);
  stroke(put, cx + S * 0.17, S * 0.36, cx + S * 0.24, S * 0.26, 2.6, () => C.ironLt); // gladius raised
  head(put, S, cx, S * 0.35);
  galea(put, cx, S * 0.31, S * 0.06, [C.crimson, C.crimsonLt]);
}
// 2 · RETIARIUS — net + trident
function drawRetiarius(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.leather, C.leatherLt, C.leatherDk], bare: true });
  // shoulder guard
  dome(put, cx - S * 0.07, S * 0.43, S * 0.045, S * 0.035, C.bronze, C.bronzeLt, C.bronzeDk);
  spear(put, cx + S * 0.06, S * 0.6, cx + S * 0.2, S * 0.28, C.wood, C.ironLt);
  [-1, 0, 1].forEach(s => stroke(put, cx + S * 0.2 + s * 3, S * 0.28, cx + S * 0.2 + s * 4, S * 0.24, 1.4, () => C.ironLt)); // trident tines
  // net swirl
  for (let a = 0; a < 6.2; a += 0.3) { const r = S * (0.05 + a * 0.012); put(Math.round(cx - S * 0.16 + Math.cos(a) * r), Math.round(S * 0.45 + Math.sin(a) * r * 0.7), C.boneDk); }
  head(put, S, cx, S * 0.35);
}
// 3 · SECUTOR — smooth helm chaser
function drawSecutor(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.iron, C.ironLt, C.ironDk], greaves: true, wide: 1.05 });
  scutum(put, cx - S * 0.15, S * 0.52, S * 0.065, S * 0.11, C.iron, C.ironLt, C.ironDk, C.bronze);
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.2, S * 0.47, S * 0.02, () => C.skin);
  stroke(put, cx + S * 0.2, S * 0.47, cx + S * 0.28, S * 0.47, 2.4, () => C.ironLt);
  // smooth egg helm w/ eye holes
  dome(put, cx, S * 0.33, S * 0.062, S * 0.07, C.iron, C.ironLt, C.ironDk);
  put(Math.round(cx - S * 0.02), Math.round(S * 0.33), C.oil); put(Math.round(cx + S * 0.02), Math.round(S * 0.33), C.oil);
}
// 4 · WAR LION — pounce lanes
function drawLion(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // body crouched
  ell(put, cx + S * 0.02, S * 0.6, S * 0.17, S * 0.1, (tx, ty) => mix(C.fur, C.furDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.1, S * 0.66, cx + s * S * 0.13, S * 0.78, S * 0.028, () => C.fur));
  stroke(put, cx + S * 0.18, S * 0.58, cx + S * 0.27, S * 0.48, S * 0.015, () => C.fur); // tail
  put(Math.round(cx + S * 0.28), Math.round(S * 0.47), C.furDk);
  // mane + head forward
  ell(put, cx - S * 0.14, S * 0.5, S * 0.095, S * 0.095, (tx, ty) => mix('#8a5a24', '#5e3a14', clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.15, S * 0.5, S * 0.055, S * 0.05, (tx, ty) => mix(C.fur, C.furDk, tx + ty * 0.3));
  optic(put, cx - S * 0.17, S * 0.485, S * 0.009, C.oil, C.gold, C.goldLt);
  optic(put, cx - S * 0.12, S * 0.485, S * 0.009, C.oil, C.gold, C.goldLt);
  row(put, Math.round(S * 0.53), cx - S * 0.185, cx - S * 0.14, () => C.oil); // snarl
  [[-0.2, 0.54], [-0.185, 0.555]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), C.white)); // fangs
}
// 5 · CHARIOT RACER — circling lanes
function drawChariot(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  // wheel
  const wy = S * 0.68, wx = cx + S * 0.08;
  ell(put, wx, wy, S * 0.1, S * 0.1, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? mix(C.gold, C.goldDk, tx) : null));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * S * 0.1, wy - Math.sin(a) * S * 0.1, wx + Math.cos(a) * S * 0.1, wy + Math.sin(a) * S * 0.1, 1.2, () => C.goldDk); }
  // car
  plate(put, cx - S * 0.08, S * 0.48, cx + S * 0.18, S * 0.62, C.crimson, C.crimsonLt, C.crimsonDk);
  row(put, Math.round(S * 0.49), cx - S * 0.08, cx + S * 0.18, () => C.gold);
  // horse foreparts left
  ell(put, cx - S * 0.22, S * 0.52, S * 0.09, S * 0.06, (tx, ty) => mix('#6e4a2e', '#4a2e1a', tx + ty * 0.4));
  stroke(put, cx - S * 0.29, S * 0.5, cx - S * 0.33, S * 0.4, S * 0.03, () => '#6e4a2e');
  ell(put, cx - S * 0.34, S * 0.38, S * 0.035, S * 0.028, (tx, ty) => mix('#6e4a2e', '#4a2e1a', ty));
  [-1, 1].forEach(s => stroke(put, cx - S * (0.24 + 0.03 * s), S * 0.57, cx - S * (0.26 + 0.04 * s), S * 0.7, S * 0.018, () => '#5a3a22'));
  // driver
  ell(put, cx + S * 0.04, S * 0.42, S * 0.04, S * 0.045, (tx, ty) => mix(C.skin, C.skinDk, tx));
  stroke(put, cx + S * 0.02, S * 0.46, cx - S * 0.12, S * 0.5, 1.2, () => C.leatherDk); // reins
}
// 6 · STAND ARCHER — volleys from above
function drawArcher(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.purple, C.purpleLt, C.purpleDk] });
  // bow drawn
  for (let a = -1.1; a <= 1.1; a += 0.05) put(Math.round(cx + S * 0.16 + Math.cos(a) * S * 0.09 - S * 0.04), Math.round(S * 0.45 + Math.sin(a) * S * 0.11), C.wood);
  stroke(put, cx + S * 0.12 + S * 0.09 - S * 0.04, S * 0.34, cx + S * 0.12 + S * 0.05, S * 0.56, 1, () => C.boneDk); // string
  stroke(put, cx + S * 0.02, S * 0.45, cx + S * 0.2, S * 0.45, 1.6, () => C.woodLt); // arrow
  put(Math.round(cx + S * 0.21), Math.round(S * 0.45), C.ironLt);
  head(put, S, cx, S * 0.35);
  stroke(put, cx - S * 0.05, S * 0.31, cx + S * 0.05, S * 0.31, 2, () => C.purpleDk); // headband
}
// 7 · SHIELD LEGIONARY — frontal block wall
function drawLegionary(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { tunic: [C.crimson, C.crimsonLt, C.crimsonDk], greaves: true });
  head(put, S, cx, S * 0.34);
  galea(put, cx, S * 0.3, S * 0.058, [C.gold, C.goldLt], [C.iron, C.ironLt, C.ironDk]);
  // TOWER scutum front + center
  scutum(put, cx, S * 0.55, S * 0.11, S * 0.17, C.crimson, C.crimsonLt, C.crimsonDk, C.gold);
  stroke(put, cx, S * 0.4, cx, S * 0.7, 1.2, () => C.gold); // spine
  spear(put, cx + S * 0.14, S * 0.66, cx + S * 0.2, S * 0.3, C.wood, C.ironLt);
}
// 8 · PILUM THRALL — thrown spear lanes
function drawThrall(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: ['#8a8272', '#b0a890', '#5a5446'], bare: true });
  // chained cuff
  stroke(put, cx - S * 0.1, S * 0.55, cx - S * 0.15, S * 0.62, 1.4, () => C.ironDk);
  // pilum cocked overhead
  stroke(put, cx + S * 0.08, S * 0.46, cx + S * 0.13, S * 0.32, S * 0.02, () => C.skin);
  spear(put, cx - S * 0.02, S * 0.34, cx + S * 0.26, S * 0.26, C.wood, C.ironLt);
  head(put, S, cx, S * 0.35);
  stroke(put, cx - S * 0.045, S * 0.315, cx + S * 0.045, S * 0.32, 1.6, () => C.leatherDk);
}
// 9 · BEAST HANDLER — buffs beasts, whip
function drawHandler(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.leather, C.leatherLt, C.leatherDk] });
  head(put, S, cx, S * 0.35);
  // hood
  ell(put, cx, S * 0.33, S * 0.06, S * 0.05, (tx, ty) => (ty < 0.55 ? mix(C.leatherDk, C.leather, tx) : null));
  // whip curling
  let px = cx + S * 0.09, py = S * 0.5;
  for (let t = 0; t < 1; t += 0.04) { const x = px + t * S * 0.22, y = py - Math.sin(t * 6.5) * S * 0.07 * (1 - t); put(Math.round(x), Math.round(y), t < 0.15 ? C.leatherDk : C.leather); }
  // meat chunk lure
  ell(put, cx - S * 0.14, S * 0.56, S * 0.03, S * 0.024, (tx, ty) => mix(C.blood, C.crimsonDk, tx));
}
// 10 · WAR ELEPHANT — elite stampede
function drawElephant(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.36);
  // massive body
  ell(put, cx + S * 0.03, S * 0.52, S * 0.2, S * 0.16, (tx, ty) => mix('#9a9aa2', '#5e5e6a', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [-0.12, 0.14].forEach(dx => stroke(put, cx + dx * S, S * 0.62, cx + dx * S, S * 0.8, S * 0.045, () => '#8a8a94'));
  // head + ears + trunk
  ell(put, cx - S * 0.2, S * 0.42, S * 0.085, S * 0.08, (tx, ty) => mix('#9a9aa2', '#6a6a76', tx + ty * 0.3));
  ell(put, cx - S * 0.13, S * 0.38, S * 0.06, S * 0.075, (tx, ty) => mix('#8a8a94', '#5e5e6a', ty));
  let tx0 = cx - S * 0.27, ty0 = S * 0.46;
  for (let t = 0; t < 1; t += 0.06) put(Math.round(tx0 - Math.sin(t * 2.2) * S * 0.03), Math.round(ty0 + t * S * 0.2), '#8a8a94');
  stroke(put, cx - S * 0.24, S * 0.47, cx - S * 0.3, S * 0.52, S * 0.016, () => C.bone); // tusk
  optic(put, cx - S * 0.21, S * 0.4, S * 0.008, C.oil, C.oil, '#fff');
  // war tower (howdah)
  plate(put, cx - S * 0.02, S * 0.26, cx + S * 0.14, S * 0.38, C.crimson, C.crimsonLt, C.crimsonDk);
  row(put, Math.round(S * 0.27), cx - S * 0.02, cx + S * 0.14, () => C.gold);
  // armor skirt
  row(put, Math.round(S * 0.55), cx - S * 0.13, cx + S * 0.19, () => C.bronze);
  row(put, Math.round(S * 0.57), cx - S * 0.13, cx + S * 0.19, () => C.bronzeDk);
}
// 11 · MINOTAUR — elite charge + slam
function drawMinotaur(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  body(put, S, cx, { tunic: [C.furDk, C.fur, '#4a3418'], bare: true, wide: 1.3 });
  // bull head
  ell(put, cx, S * 0.33, S * 0.075, S * 0.07, (tx, ty) => mix('#6e4a2e', '#3e2814', clamp(tx + ty * 0.4, 0, 1)));
  ell(put, cx, S * 0.37, S * 0.04, S * 0.03, (tx, ty) => mix('#a8865a', '#6e5432', ty)); // muzzle
  [[-1, 0], [1, 0]].forEach(([s]) => {
    stroke(put, cx + s * S * 0.07, S * 0.3, cx + s * S * 0.13, S * 0.24, S * 0.02, () => C.bone);
    stroke(put, cx + s * S * 0.13, S * 0.24, cx + s * S * 0.15, S * 0.19, S * 0.014, () => C.boneDk);
  });
  optic(put, cx - S * 0.025, S * 0.32, S * 0.01, C.oil, C.crimson, C.crimsonLt);
  optic(put, cx + S * 0.025, S * 0.32, S * 0.01, C.oil, C.crimson, C.crimsonLt);
  put(Math.round(cx - S * 0.015), Math.round(S * 0.375), C.gold); // nose ring
  put(Math.round(cx + S * 0.015), Math.round(S * 0.375), C.gold);
  // great axe
  stroke(put, cx + S * 0.12, S * 0.52, cx + S * 0.22, S * 0.3, 2.6, () => C.woodDk);
  ell(put, cx + S * 0.24, S * 0.3, S * 0.05, S * 0.035, (tx, ty) => mix(C.ironLt, C.ironDk, tx + ty * 0.4));
}
// 12 · SAND WRAITH — dead gladiator ghost
function drawWraith(put, S) {
  const cx = S * 0.5;
  // rising sand column into torso
  for (let y = S * 0.82; y > S * 0.55; y--) {
    const t = (S * 0.82 - y) / (S * 0.27), w = S * (0.02 + t * 0.07);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.sand, C.ghost, clamp(t * 0.9 + tx * 0.1, 0, 1)));
  }
  for (let y = S * 0.55; y > S * 0.4; y--) {
    const w = S * 0.085;
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.ghost, '#5a8088', clamp(tx * 1.2, 0, 1)));
  }
  // ghost gladius + arm
  stroke(put, cx + S * 0.08, S * 0.48, cx + S * 0.18, S * 0.4, S * 0.018, () => C.ghost);
  stroke(put, cx + S * 0.18, S * 0.39, cx + S * 0.26, S * 0.3, 2.2, () => C.ghostLt);
  // head w/ galea silhouette
  ell(put, cx, S * 0.34, S * 0.05, S * 0.055, (tx, ty) => mix(C.ghostLt, C.ghost, clamp(tx + ty * 0.3, 0, 1)));
  galea(put, cx, S * 0.3, S * 0.055, ['#5a8088', C.ghost], ['#5a8088', C.ghost, '#3a545a']);
  optic(put, cx - S * 0.018, S * 0.335, S * 0.009, C.oil, C.ghostLt, '#fff');
  optic(put, cx + S * 0.018, S * 0.335, S * 0.009, C.oil, C.ghostLt, '#fff');
  // sand drift flecks
  [[-0.14, 0.7], [0.12, 0.62], [-0.08, 0.5], [0.16, 0.75]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), C.sandLt));
}
// 13 · CROWD FAVORITE — showboat, crowd-shielded
function drawFavorite(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.gold, C.goldLt, C.goldDk], greaves: true });
  // both arms raised to the crowd
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.46, cx + s * S * 0.17, S * 0.32, S * 0.02, () => C.skin));
  stroke(put, cx + S * 0.17, S * 0.33, cx + S * 0.24, S * 0.24, 2.4, () => C.ironLt); // sword up
  head(put, S, cx, S * 0.35);
  laurel(put, cx, S * 0.33, S * 0.055, '#5a7e46');
  // sparkle fans
  [[-0.24, 0.3], [0.28, 0.36], [-0.2, 0.42]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), C.goldLt));
  // rose at feet
  put(Math.round(cx - S * 0.1), Math.round(S * 0.83), C.crimsonLt);
}
// 14 · FIRE JUGGLER — halftime show, flame circles
function drawJuggler(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { tunic: [C.purple, C.purpleLt, C.purpleDk], bare: false });
  head(put, S, cx, S * 0.35);
  // juggled torches arc
  [[-0.16, 0.3], [0, 0.22], [0.16, 0.3]].forEach(([dx, dy]) => {
    stroke(put, cx + dx * S, S * (dy + 0.06), cx + dx * S, S * (dy + 0.12), 1.6, () => C.wood);
    ell(put, cx + dx * S, S * dy, S * 0.022, S * 0.03, (tx, ty) => mix('#ffd34d', '#ff7d3a', ty));
    put(Math.round(cx + dx * S), Math.round(S * (dy - 0.035)), '#ffe8a0');
  });
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.46, cx + s * S * 0.14, S * 0.36, S * 0.018, () => C.skin));
}
// 15 · DRUM MASTER — speeds the games (buffer)
function drawDrummer(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { tunic: [C.crimsonDk, C.crimson, '#3a0c0e'] });
  // big drum
  for (let y = Math.round(S * 0.52); y < S * 0.68; y++) row(put, y, cx - S * 0.11, cx + S * 0.11, (tx) => mix(C.wood, C.woodDk, clamp(tx * 1.2, 0, 1)));
  ell(put, cx, S * 0.52, S * 0.11, S * 0.03, (tx, ty) => mix(C.bone, C.boneDk, tx));
  stroke(put, cx - S * 0.11, S * 0.55, cx + S * 0.11, S * 0.62, 1, () => C.goldDk); // rope
  // sticks mid-hit
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.14, S * 0.4, cx + s * S * 0.05, S * 0.5, 1.6, () => C.woodLt); put(Math.round(cx + s * S * 0.14), Math.round(S * 0.39), C.boneDk); });
  head(put, S, cx, S * 0.33);
  // speed lines
  [[-0.22, 0.46], [0.22, 0.46]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 1.25, S * dy, 1, () => C.goldLt));
}
// 16 · WAR HOUND — pack lunger
function drawHound(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  ell(put, cx + S * 0.03, S * 0.6, S * 0.13, S * 0.075, (tx, ty) => mix('#5a5048', '#322c26', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.64, cx + s * S * 0.1, S * 0.76, S * 0.022, () => '#4a423c'));
  stroke(put, cx + S * 0.15, S * 0.58, cx + S * 0.22, S * 0.52, S * 0.012, () => '#4a423c');
  // spiked collar
  ell(put, cx - S * 0.1, S * 0.53, S * 0.045, S * 0.04, (tx, ty) => mix(C.leatherDk, C.oil, ty));
  [[-0.15, 0.5], [-0.12, 0.485], [-0.08, 0.49]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), C.ironLt));
  // head lunging low
  ell(put, cx - S * 0.16, S * 0.5, S * 0.05, S * 0.042, (tx, ty) => mix('#5a5048', '#322c26', tx + ty * 0.3));
  optic(put, cx - S * 0.17, S * 0.485, S * 0.008, C.oil, C.crimson, C.crimsonLt);
  row(put, Math.round(S * 0.525), cx - S * 0.2, cx - S * 0.15, () => C.oil);
  put(Math.round(cx - S * 0.2), Math.round(S * 0.535), C.white);
}
// 17 · GATE KEEPER — opens beast gates (spawner)
function drawKeeper(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // portcullis gate behind
  plate(put, cx - S * 0.16, S * 0.3, cx + S * 0.16, S * 0.72, C.marbleDk, C.marble, C.marbleDkk);
  for (let i = -2; i <= 2; i++) stroke(put, cx + i * S * 0.055, S * 0.34, cx + i * S * 0.055, S * 0.7, 1.8, () => C.ironDk);
  [0.42, 0.54, 0.66].forEach(y => row(put, Math.round(S * y), cx - S * 0.13, cx + S * 0.13, () => C.ironDk));
  // keeper in front w/ lever + horn
  body(put, S, cx - S * 0.12, { tunic: [C.iron, C.ironLt, C.ironDk] });
  head(put, S, cx - S * 0.12, S * 0.35);
  stroke(put, cx - S * 0.04, S * 0.5, cx + S * 0.04, S * 0.38, 2.2, () => C.wood); // lever
  put(Math.round(cx + S * 0.045), Math.round(S * 0.37), C.crimsonLt);
  // glowing eyes in the dark gate
  put(Math.round(cx + S * 0.07), Math.round(S * 0.5), C.gold); put(Math.round(cx + S * 0.1), Math.round(S * 0.5), C.gold);
}
// 18 · BRONZE COLOSSUS — elite statue awakens
function drawColossus(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // plinth
  plate(put, cx - S * 0.14, S * 0.76, cx + S * 0.14, S * 0.86, C.marble, C.marbleLt, C.marbleDk);
  // bronze body — verdigris streaks
  for (let y = S * 0.34; y < S * 0.76; y++) {
    const t = (y - S * 0.34) / (S * 0.42), w = S * (0.1 - t * 0.015);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(C.bronzeLt, C.bronze, clamp(tx * 1.3, 0, 1));
      if (tx > 0.7) b = mix(b, C.bronzeDk, 0.6);
      if ((tx * 9 | 0) % 4 === 1 && t > 0.3) b = mix(b, '#4a8a6a', 0.4); // verdigris
      return b;
    });
  }
  // head + glow crack
  dome(put, cx, S * 0.28, S * 0.07, S * 0.075, C.bronze, C.bronzeLt, C.bronzeDk);
  stroke(put, cx - S * 0.02, S * 0.24, cx + S * 0.03, S * 0.34, 1, () => C.goldLt); // waking crack
  optic(put, cx - S * 0.025, S * 0.28, S * 0.01, C.bronzeDk, C.goldLt, '#fff');
  optic(put, cx + S * 0.025, S * 0.28, S * 0.01, C.bronzeDk, C.goldLt, '#fff');
  // raised fist
  stroke(put, cx + S * 0.09, S * 0.45, cx + S * 0.17, S * 0.3, S * 0.03, () => C.bronze);
  ell(put, cx + S * 0.18, S * 0.27, S * 0.04, S * 0.04, (tx, ty) => mix(C.bronzeLt, C.bronzeDk, tx + ty * 0.3));
}
// 19 · VESTAL CURSER — curse circles caster
function drawVestal(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // robed figure
  for (let y = S * 0.4; y < S * 0.84; y++) {
    const t = (y - S * 0.4) / (S * 0.44), w = S * (0.055 + t * 0.075);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(C.marbleLt, C.marble, clamp(tx * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, C.marbleDk, 0.55);
      return b;
    });
  }
  head(put, S, cx, S * 0.35);
  // veil
  ell(put, cx, S * 0.32, S * 0.06, S * 0.045, (tx, ty) => (ty < 0.5 ? mix(C.marbleLt, C.marble, tx) : null));
  // curse orb + glyph ring
  ell(put, cx + S * 0.14, S * 0.44, S * 0.032, S * 0.032, (tx, ty) => mix(C.purpleLt, C.purpleDk, tx + ty * 0.4));
  for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.14 + Math.cos(a) * S * 0.055), Math.round(S * 0.44 + Math.sin(a) * S * 0.055), C.purpleLt);
  // brazier flame purple
  stroke(put, cx - S * 0.14, S * 0.56, cx - S * 0.14, S * 0.64, 2, () => C.bronzeDk);
  ell(put, cx - S * 0.14, S * 0.53, S * 0.02, S * 0.028, (tx, ty) => mix(C.purpleLt, C.purple, ty));
}
// 20 · THUMBS-DOWN EXECUTIONER — elite axe slam
function drawExecutioner(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  body(put, S, cx, { tunic: [C.oil, '#3a3a42', '#000000'], wide: 1.25 });
  // hood
  ell(put, cx, S * 0.33, S * 0.065, S * 0.07, (tx, ty) => mix('#3a3a42', C.oil, clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx - S * 0.02, S * 0.335, S * 0.008, C.oil, C.crimson, C.crimsonLt);
  optic(put, cx + S * 0.02, S * 0.335, S * 0.008, C.oil, C.crimson, C.crimsonLt);
  // huge two-hand axe overhead
  stroke(put, cx - S * 0.02, S * 0.5, cx + S * 0.06, S * 0.2, 2.8, () => C.woodDk);
  [-1, 1].forEach(s => {
    for (let a = -0.9; a <= 0.9; a += 0.06) put(Math.round(cx + S * 0.06 + s * Math.cos(a) * S * 0.06), Math.round(S * 0.22 + Math.sin(a) * S * 0.045), C.ironLt);
    ell(put, cx + S * 0.06 + s * S * 0.045, S * 0.22, S * 0.028, S * 0.04, (tx, ty) => mix(C.ironLt, C.ironDk, tx + ty * 0.3));
  });
  // thumbs-down emblem
  put(Math.round(cx), Math.round(S * 0.47), C.crimsonLt);
  stroke(put, cx - S * 0.01, S * 0.47, cx + S * 0.01, S * 0.5, 1.6, () => C.crimsonLt);
}

const LIST = [
  { n: 1, name: 'GLADIATOR', role: 'warned slash melee', draw: drawGladiator },
  { n: 2, name: 'RETIARIUS', role: 'net snare + trident', draw: drawRetiarius },
  { n: 3, name: 'SECUTOR', role: 'relentless chaser', draw: drawSecutor },
  { n: 4, name: 'WAR LION', role: 'pounce lanes', draw: drawLion },
  { n: 5, name: 'CHARIOT RACER', role: 'circling run lanes', draw: drawChariot },
  { n: 6, name: 'STAND ARCHER', role: 'volley from the stands', draw: drawArcher },
  { n: 7, name: 'SHIELD LEGIONARY', role: 'frontal block wall', draw: drawLegionary },
  { n: 8, name: 'PILUM THRALL', role: 'thrown spear lanes', draw: drawThrall },
  { n: 9, name: 'BEAST HANDLER', role: 'buffs beasts, whip', draw: drawHandler },
  { n: 10, name: 'WAR ELEPHANT', role: 'elite stampede + tower', draw: drawElephant },
  { n: 11, name: 'MINOTAUR', role: 'elite charge + slam', draw: drawMinotaur },
  { n: 12, name: 'SAND WRAITH', role: 'fallen gladiator ghost', draw: drawWraith },
  { n: 13, name: 'CROWD FAVORITE', role: 'showboat, crowd-shielded', draw: drawFavorite },
  { n: 14, name: 'FIRE JUGGLER', role: 'flame circle lobber', draw: drawJuggler },
  { n: 15, name: 'DRUM MASTER', role: 'speeds nearby mobs', draw: drawDrummer },
  { n: 16, name: 'WAR HOUND', role: 'pack lunger', draw: drawHound },
  { n: 17, name: 'GATE KEEPER', role: 'opens beast gates', draw: drawKeeper },
  { n: 18, name: 'BRONZE COLOSSUS', role: 'elite waking statue', draw: drawColossus },
  { n: 19, name: 'VESTAL CURSER', role: 'curse circle caster', draw: drawVestal },
  { n: 20, name: 'EXECUTIONER', role: 'elite axe slam', draw: drawExecutioner },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_mob_options.png', title: 'COLOSSEUM — MOB CANDIDATES (pick your roster, any count)', S: 160 });
}
module.exports = { LIST };
