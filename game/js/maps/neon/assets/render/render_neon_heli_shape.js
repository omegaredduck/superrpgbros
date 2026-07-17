// artdev/neon/render_neon_heli_shape.js — KINGPIN.EXE's APACHE, take 3.
// Clean piecewise profile (no column-sweep mush): angular AH-64
// silhouette from Red's references — Longbow dome, tandem stepped
// canopy w/ readable Kingpin, TADS nose, chin gun, nacelle, stub wing,
// slim boom, fin + stabilizer + tail rotor + tail wheel.
'use strict';
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, plate, optic, renderSheet, glow } = KIT;

// piecewise-linear profile helper
function pw(x, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / Math.max(1, x1 - x0);
  }
  return null;
}

function heli160(put, S, o) {
  o = o || {};
  const hull = o.hull || '#4a5442';
  const hullLt = o.hullLt || '#6e7a5e';
  const hullDk = o.hullDk || '#2a301f';
  const trim = o.trim || N.pink;
  const trimLt = o.trimLt || N.pinkLt;
  const u = S / 160;
  const X = v => v * u;

  // ---- LONGBOW DOME + mast (above rotor)
  ell(put, X(76), X(15), X(10), X(4.2), (tx, ty) => mix(hullLt, hullDk, clamp(tx * 0.5 + ty * 0.9, 0, 1)));
  put(Math.round(X(70)), Math.round(X(13)), mix(hullLt, '#ffffff', 0.3));
  stroke(put, X(76), X(19), X(76), X(28), X(2.4), () => hullDk);
  // ---- ROTOR: thin blur disc + two crisp blades + hub
  row(put, Math.round(X(28)), X(12), X(146), (tx) => mix('#828a9a', N.night, 0.55 + Math.abs(tx - 0.5) * 0.4));
  stroke(put, X(30), X(24), X(122), X(31), X(1.4), () => '#5a626e');
  stroke(put, X(122), X(25), X(30), X(32), X(1.4), () => '#495060');
  ell(put, X(76), X(28), X(4.4), X(2.2), (tx, ty) => mix(hullLt, hullDk, ty));

  // ---- FUSELAGE by profile: top(x), bot(x) — angular Apache lines
  const TOP = [[14, 54], [22, 52], [30, 47], [50, 43], [52, 37], [74, 39], [76, 40], [98, 44], [100, 50], [136, 47], [150, 46]];
  const BOT = [[14, 64], [24, 68], [40, 70], [70, 70], [86, 66], [98, 58], [136, 54], [150, 52]];
  for (let x = 14; x <= 150; x++) {
    const top = pw(x, TOP), bot = pw(x, BOT);
    if (top == null || bot == null || bot <= top) continue;
    for (let y = top; y <= bot; y++) {
      const ty = (y - top) / Math.max(1, bot - top);
      let b = mix(hullLt, hull, clamp(ty * 1.6, 0, 1));
      b = mix(b, hullDk, clamp((ty - 0.5) * 1.6, 0, 1));
      put(Math.round(X(x)), Math.round(X(y)), b);
    }
    // panel seams at real joints only
    if ([30, 52, 74, 98].includes(x)) for (let y = top + 1; y <= bot - 1; y += 1) put(Math.round(X(x)), Math.round(X(y)), mix(hullDk, '#000000', 0.25));
  }
  // belly line accent
  for (let x = 24; x <= 96; x++) { const bot = pw(x, BOT); put(Math.round(X(x)), Math.round(X(bot)), hullDk); }

  // ---- TAIL FIN (swept, crisp) + stabilizer + tail rotor + wheel
  for (let y = 30; y <= 47; y++) {
    const t = (y - 30) / 17;
    row(put, Math.round(X(y * 0 + y)), X(134 + t * 4), X(143 + t * 3), (tx) => mix(hullLt, hullDk, clamp(t * 0.8 + tx * 0.3, 0, 1)));
  }
  plate(put, X(126), X(50), X(148), X(53), hull, hullLt, hullDk); // stabilizer
  for (let a = 0; a < 6.28; a += 0.18) put(Math.round(X(146 + Math.cos(a) * 8)), Math.round(X(37 + Math.sin(a) * 8)), mix('#828a9a', N.night, 0.5));
  ell(put, X(146), X(37), X(1.8), X(1.8), () => hullDk);
  stroke(put, X(138), X(54), X(136), X(63), X(1.6), () => hullDk); // tail wheel strut
  ell(put, X(136), X(65), X(2.4), X(2.4), (tx, ty) => mix('#2a2e38', '#0a0c10', ty));

  // ---- TADS NOSE turret — crisp drum
  ell(put, X(15), X(58), X(5), X(6.5), (tx, ty) => mix('#39404c', '#161a20', clamp(tx * 0.7 + ty * 0.5, 0, 1)));
  plate(put, X(12.5), X(53.5), X(17.5), X(57), '#2a303a', '#4a5260', '#12161c');
  optic(put, X(14.5), X(55), X(1.7), '#0a0c10', N.cyan, N.cyanLt);
  optic(put, X(15), X(61), X(1.5), '#0a0c10', N.redN, N.redNLt);

  // ---- CANOPY: bright angular glass, stepped, Kingpin readable
  // front (gunner) pane
  for (let x = 31; x <= 50; x++) {
    const top = pw(x, [[31, 47.5], [50, 44]]);
    for (let y = top; y <= 56; y++) {
      const ty = (y - top) / (56 - top);
      put(Math.round(X(x)), Math.round(X(y)), mix('#7ab8d8', '#27455c', clamp(ty * 1.3, 0, 1)));
    }
  }
  // rear (pilot) pane — raised
  for (let x = 53; x <= 71; x++) {
    const top = pw(x, [[53, 38.5], [71, 40.5]]);
    for (let y = top; y <= 54; y++) {
      const ty = (y - top) / (54 - top);
      put(Math.round(X(x)), Math.round(X(y)), mix('#8ac4e2', '#2a4a62', clamp(ty * 1.3, 0, 1)));
    }
  }
  // frames — thin, crisp
  stroke(put, X(31), X(47.5), X(50), X(44), X(1), () => '#141a22');
  stroke(put, X(50.5), X(44), X(52.5), X(38.5), X(1.2), () => '#141a22');
  stroke(put, X(53), X(38.5), X(71), X(40.5), X(1), () => '#141a22');
  stroke(put, X(71.5), X(40.5), X(71.5), X(54), X(1.2), () => '#141a22');
  stroke(put, X(51.5), X(38.5), X(51.5), X(56), X(1.2), () => '#141a22');
  stroke(put, X(31), X(47.5), X(31), X(56), X(1), () => '#141a22');
  // gunner silhouette (small, crisp, 1px clear of frames)
  ell(put, X(41), X(51.5), X(2.2), X(2), () => '#0a1018');
  ell(put, X(41), X(54), X(3), X(2), () => '#0a1018');
  // THE KINGPIN — rear seat: fat body, fedora, cigar ember
  ell(put, X(61.5), X(50), X(4.2), X(3.2), () => '#0a1018');
  ell(put, X(61.5), X(45.8), X(2.6), X(2.2), () => '#0a1018');
  row(put, Math.round(X(43.8)), X(58), X(65.5), () => '#0a1018'); // brim
  put(Math.round(X(65)), Math.round(X(46)), N.amber);
  put(Math.round(X(66)), Math.round(X(45.2)), N.amberLt);

  // ---- ENGINE NACELLE (crisp box above spine, behind canopy)
  plate(put, X(74), X(36), X(96), X(43), hullLt, mix(hullLt, '#ffffff', 0.18), hullDk);
  ell(put, X(97), X(39.5), X(2.4), X(2.8), (tx) => mix('#1c2026', '#0a0c10', tx));
  [[100, 38.5], [103, 37.8]].forEach(([hx2, hy2]) => put(Math.round(X(hx2)), Math.round(X(hy2)), mix(N.purple, N.night, 0.45)));

  // ---- STUB WING + stores (below mid fuselage, clean separation)
  plate(put, X(56), X(58), X(90), X(62), hull, hullLt, hullDk);
  // hellfire rack: 2 crisp missiles
  [[58, 64.5], [58, 68]].forEach(([px2, py2]) => {
    stroke(put, X(px2), X(py2), X(px2 + 11), X(py2), X(2), () => '#3a4048');
    put(Math.round(X(px2)), Math.round(X(py2)), N.amberDk);
    put(Math.round(X(px2 + 11)), Math.round(X(py2)), '#6a7280'); // fin
  });
  // rocket pod
  for (let x = 74; x <= 88; x++) { for (let y = 63.5; y <= 69.5; y++) { const ty = (y - 63.5) / 6; put(Math.round(X(x)), Math.round(X(y)), mix('#565e50', '#23281c', clamp(ty * 1.2, 0, 1))); } }
  ell(put, X(74), X(66.5), X(1.2), X(3), () => '#0c0e12');
  [[73.5, 65], [73.5, 68]].forEach(([ox, oy]) => put(Math.round(X(ox)), Math.round(X(oy)), '#0c0e12'));
  put(Math.round(X(73.5)), Math.round(X(66.5)), N.amber);

  // ---- CHIN GUN — crisp M230
  stroke(put, X(38), X(70), X(38), X(75), X(2.2), () => hullDk);
  plate(put, X(34), X(75), X(44), X(78.5), '#2e343e', '#4a5460', '#12161c');
  stroke(put, X(34), X(76.5), X(22), X(79), X(1.6), () => '#12161c');
  put(Math.round(X(21)), Math.round(X(79.5)), N.redNLt);

  // ---- MAIN WHEELS — struts off the belly
  [[36], [66]].forEach(([wx2]) => {
    stroke(put, X(wx2), X(70), X(wx2 - 1), X(80), X(1.8), () => hullDk);
    ell(put, X(wx2 - 1), X(82.5), X(3), X(3), (tx, ty) => mix('#30343e', '#0c0e12', clamp(tx * 0.4 + ty * 0.7, 0, 1)));
    put(Math.round(X(wx2 - 2)), Math.round(X(81.5)), '#565e6a');
  });

  // ---- NEON UNDERGLOW + searchlight (Kingpin's touch)
  glow(put, X(30), X(71.5), X(94), X(67), 1, trim, trimLt);
  for (let t = 0; t < 1; t += 0.05) {
    const w = t * 8;
    for (let ox = -1; ox <= 1; ox += 0.4) put(Math.round(X(36 - t * 20 + ox * w)), Math.round(X(80 + t * 46)), mix('#e8ecf4', N.night, 0.52 + t * 0.36));
  }
  glow(put, X(36), X(79), X(36), X(79), 1.3, '#e8ecf4', '#ffffff');

  // ---- lights + rain
  put(Math.round(X(13)), Math.round(X(52)), N.redN);
  put(Math.round(X(149)), Math.round(X(45)), N.green);
  glow(put, X(76), X(12), X(76), X(12), 1, N.redN, N.redNLt);
  for (let i = 0; i < 7; i++) {
    const rx = (i * 47) % 160, ry = (i * 83) % 110;
    stroke(put, X(rx), X(ry), X(rx - 2), X(ry + 6), X(0.8), () => mix(N.cyanLt, N.night, 0.74));
  }
}

const LIST = [
  { n: 1, name: 'KINGPIN APACHE', role: 'AH-64 — take 3, clean profile', draw: (p, S) => heli160(p, S, {}) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_heli_shape.png', title: 'KINGPIN.EXE APACHE — shape pass take 3', S: 160, cols: 1, scale: 3 });
}
module.exports = { heli160 };
