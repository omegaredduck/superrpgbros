// artdev/colosseum/render_colosseum_lion_draft.js — THE CHARIOT LION on
// a full 160x160 canvas (Red liked the war-lion mob; it replaces the
// horse as the chariot's draft beast). Running pose: full-stride cat,
// big mane, streaming tuft tail. lion160(put,S,o) is the reusable draw.
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, optic, renderSheet } = KIT;

// o: { fur, furDk, furLt, mane, maneDk, eye, harness }
function lion160(put, S, o) {
  o = o || {};
  const fur = o.fur || C.fur;          // #b08648
  const furDk = o.furDk || C.furDk;    // #7a5a2c
  const furLt = o.furLt || '#d0a868';
  const maneC = o.mane || '#8a5a24';
  const maneDk = o.maneDk || '#5e3a14';
  const u = S / 160;
  const X = v => v * u, Y = v => v * u;

  const coat = (tx, ty) => {
    let b = mix(furLt, fur, clamp(ty * 1.6, 0, 1));
    b = mix(b, furDk, clamp((ty - 0.42) * 1.5, 0, 1));
    if (tx > 0.88) b = mix(b, furDk, 0.25);
    return b;
  };
  const darkCoat = (tx, ty) => mix(mix(fur, '#3a2a14', 0.45), mix(furDk, '#241808', 0.4), clamp(ty * 1.2, 0, 1));

  // ---- ground shadow
  if (!o.noShadow) ell(put, X(80), Y(146), X(64), Y(6), () => C.oil);

  // ---- legs: cat gallop — far pair darker, drawn first ----------------
  const legSeg = (pts, w, fill, pawC) => {
    for (let i = 0; i < pts.length - 1; i++)
      stroke(put, X(pts[i][0]), Y(pts[i][1]), X(pts[i + 1][0]), Y(pts[i + 1][1]), X(w * (1 - i * 0.18)), fill);
    const last = pts[pts.length - 1];
    // paw — rounded, with toe nicks
    ell(put, X(last[0]), Y(last[1]), X(4), Y(2.6), typeof pawC === 'function' ? pawC : fill);
    put(Math.round(X(last[0] - 2)), Math.round(Y(last[1] + 2)), '#1c1008');
    put(Math.round(X(last[0] + 1)), Math.round(Y(last[1] + 2)), '#1c1008');
  };
  // far hind — extended back (thick thigh, tapers to paw)
  legSeg([[112, 82], [128, 96], [140, 112], [150, 128]], 13.5, darkCoat);
  // far fore — reaching forward under the chest
  legSeg([[52, 84], [40, 102], [30, 118], [22, 132]], 11, darkCoat);

  // ---- BODY: sleek cat — chest deep behind mane, low-slung barrel, powerful hips
  ell(put, X(104), Y(76), X(26), Y(21), coat);       // hindquarters
  ell(put, X(78), Y(80), X(30), Y(19), coat);        // barrel (cats sag low mid-stride)
  ell(put, X(54), Y(78), X(20), Y(20), coat);        // chest
  // spine blend between barrel + hindquarters (kept low — no hump)
  ell(put, X(90), Y(72), X(18), Y(9), coat);
  // belly tuck (deep cat waist)
  stroke(put, X(62), Y(98), X(92), Y(92), X(2), () => furDk);
  stroke(put, X(92), Y(92), X(108), Y(88), X(1.6), () => furDk);

  // ---- near legs (full color)
  // near hind — driving off the ground (big cat thigh)
  ell(put, X(104), Y(84), X(13), Y(13), coat); // thigh mass blends into hip
  legSeg([[102, 84], [114, 100], [122, 116], [130, 130]], 14.5, coat);
  // near fore — fully extended forward (muscled forearm)
  ell(put, X(49), Y(86), X(9.5), Y(10), coat); // shoulder/forearm mass
  legSeg([[50, 86], [34, 100], [20, 112], [10, 124]], 12.5, coat);

  // ---- MANE: great ragged ruff ringing head + chest --------------------
  const mcx = 34, mcy = 58;
  for (let a = 0; a < Math.PI * 2; a += 0.16) {
    const rr = 21 + Math.sin(a * 3.2) * 3.5 + Math.sin(a * 7.1) * 2;
    const mx = mcx + Math.cos(a) * rr * 1.02, my = mcy + Math.sin(a) * rr * 0.95;
    // locks point away from face, swept back on top
    const sweep = a > 4.2 || a < 1.2 ? 7 : 4;
    stroke(put, X(mcx + Math.cos(a) * 12), Y(mcy + Math.sin(a) * 11), X(mx + sweep * 0.6), Y(my), X(4.2), (tx, ty) => (((a * 10) | 0) % 2 ? maneC : maneDk));
  }
  // mane core fill
  ell(put, X(mcx + 2), Y(mcy), X(17), Y(16), (tx, ty) => mix(maneC, maneDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  // mane continues down the chest between fore legs
  for (let i = 0; i < 5; i++) stroke(put, X(44 + i * 2), Y(72 + i * 3), X(46 + i * 2), Y(86 + i * 3.5), X(3), () => (i % 2 ? maneC : maneDk));

  // ---- HEAD: broad cat skull inside the mane, snarling ----------------
  ell(put, X(26), Y(56), X(11), Y(9.5), coat);                 // skull
  // muzzle block — squared cat muzzle
  ell(put, X(15), Y(60), X(7), Y(5.5), (tx, ty) => mix(furLt, fur, clamp(ty * 1.3, 0, 1)));
  // nose leather — bigger, reads at distance
  for (let hx = -2.2; hx <= 2.2; hx += 0.5) for (let hy = -1; hy <= 2; hy += 0.5) put(Math.round(X(9.5 + hx)), Math.round(Y(58 + hy)), '#1c0c04');
  // snarl mouth — open, fangs
  stroke(put, X(7.5), Y(62.5), X(20), Y(64), X(1.6), () => '#1c0c04');
  for (let hy = 0; hy < 3.4; hy += 0.5) { put(Math.round(X(11)), Math.round(Y(64.5 + hy)), C.white); put(Math.round(X(16)), Math.round(Y(64.5 + hy * 0.8)), C.white); } // fangs
  // jaw
  ell(put, X(14), Y(67), X(5.5), Y(3), (tx, ty) => mix(fur, furDk, ty));
  // muzzle wrinkle (snarl)
  stroke(put, X(11), Y(56.5), X(16), Y(55.5), X(0.9), () => furDk);
  // eye — golden, fierce
  optic(put, X(22), Y(52.5), X(2.4), '#1c0c04', o.eye || C.gold, C.goldLt);
  stroke(put, X(18.5), Y(50), X(25.5), Y(49.5), X(1.1), () => furDk); // brow scowl
  // ear — small round cat ear, pinned
  ell(put, X(33), Y(46), X(3.4), Y(3), (tx, ty) => mix(fur, furDk, tx + ty * 0.4));
  put(Math.round(X(33)), Math.round(Y(46)), '#3a2410');
  // whisker dots
  [[11, 60.5], [12.5, 61.5], [14, 60.8]].forEach(([wx, wy]) => put(Math.round(X(wx)), Math.round(Y(wy)), furDk));

  // ---- harness: chest strap + trace line back to the yoke -------------
  if (o.harness !== false) {
    stroke(put, X(40), Y(74), X(52), Y(90), X(2.4), () => C.leatherDk);
    stroke(put, X(52), Y(90), X(60), Y(88), X(2), () => C.leather);
    put(Math.round(X(46)), Math.round(Y(81)), C.gold); // harness boss
    // (trace line to the yoke is drawn by the RIG, not the lion)
  }

  // ---- TAIL: long cat tail streaming, dark tuft ------------------------
  let px2 = 128, py2 = 68;
  for (let t = 0; t < 1; t += 0.07) {
    const nx2 = 128 + t * 26, ny2 = 68 - t * 14 + Math.sin(t * 4.6) * 3;
    stroke(put, X(px2), Y(py2), X(nx2), Y(ny2), X(2.6 - t * 1.1), coat);
    px2 = nx2; py2 = ny2;
  }
  ell(put, X(155), Y(52), X(4), Y(5), (tx, ty) => mix(maneDk, '#3a2410', ty)); // tuft

  // ---- muscle + sheen pass
  ell(put, X(100), Y(66), X(11), Y(7), (tx, ty) => (tx + ty < 0.8 ? furLt : null));  // haunch highlight
  stroke(put, X(102), Y(84), X(110), Y(96), X(1.2), () => furDk);                     // stifle line
  ell(put, X(80), Y(70), X(11), Y(5), (tx, ty) => (ty < 0.5 ? mix(furLt, fur, 0.5) : null)); // rib sheen
  // dust kicks
  [[14, 128], [128, 134], [148, 132]].forEach(([dx2, dy2]) => ell(put, X(dx2), Y(dy2), X(4.5), Y(2.5), (tx) => mix(C.sandLt, C.sand, tx)));
}

const LIST = [
  { n: 1, name: 'CHARIOT LION', role: 'full-stride draft beast', draw: (p, S) => lion160(p, S, {}) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_lion_workup.png', title: 'THE CHARIOT LION — full-canvas shape pass', S: 160, cols: 1, scale: 3 });
}
module.exports = { lion160 };
