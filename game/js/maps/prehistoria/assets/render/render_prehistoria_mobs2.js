// artdev/prehistoria/render_prehistoria_mobs2.js — PREHISTORIA mobs
// TAKE 2: 20 candidates, ALL DINOSAURS (Red), real anatomy via the
// approved shape-pass technique (TOP/BOT profiles, Z-legs, horizontal
// theropod posture). Shape passes: render_dino_shapes.js.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, dome, shadow, renderSheet, fern, floor } = KIT;
const SH = require('./render_dino_shapes.js');
const { raptor160, trike160, stego160, pw, body, theroLeg } = SH;

function U(S) { const u = S / 160; return v => v * u; }
const mp = (pts, ox, oy, sc) => pts.map(([x, y]) => [ox + x * sc, oy + y * sc]);

// small theropod at (ox,oy) scale sc — shared by compys/troodon/etc
function miniThero(put, X, ox, oy, sc, cLt, c, cDk, o) {
  o = o || {};
  const TOP = mp([[0, 10], [16, 9], [26, 6], [34, 4], [40, 6]], ox, oy, sc);
  const BOT = mp([[0, 12], [16, 13], [26, 16], [34, 18], [40, 15]], ox, oy, sc);
  theroLeg(put, X, ox + 27 * sc, oy + 15 * sc, sc * 0.42, cLt, c, cDk, true);
  body(put, X, TOP[0][0], TOP[TOP.length - 1][0], TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, ox + 30 * sc, oy + 16 * sc, sc * 0.46, cLt, c, cDk, false);
  stroke(put, X(ox + 39 * sc), X(oy + 7 * sc), X(ox + 44 * sc), X(oy + (o.headUp ? -2 : 1) * sc), X(3 * sc), () => c); // neck
  const hy = oy + (o.headUp ? -4 : -1) * sc;
  ell(put, X(ox + 47 * sc), X(hy), X(4 * sc), X(2.6 * sc), (tx, ty) => mix(cLt, cDk, ty));
  stroke(put, X(ox + 50 * sc), X(hy + 0.5 * sc), X(ox + 54 * sc), X(hy + sc), X(1.6 * sc), () => cDk); // snout
  put(Math.round(X(ox + 46 * sc)), Math.round(X(hy - sc)), o.eyeC || P.eye);
}

// 2 COMPY SWARM
function drawCompies(put, S) {
  const X = U(S); floor(put, S, 42);
  shadow(put, X(60), X(96), X(20), X(3)); shadow(put, X(104), X(116), X(18), X(3)); shadow(put, X(44), X(126), X(16), X(3));
  miniThero(put, X, 34, 66, 0.9, P.dinoGLt, P.dinoG, P.dinoGDk, { headUp: true });
  miniThero(put, X, 80, 90, 0.75, mix(P.dinoGLt, P.dinoOLt, 0.4), mix(P.dinoG, P.dinoO, 0.4), P.dinoGDk, {});
  miniThero(put, X, 20, 100, 0.65, P.dinoGLt, P.dinoG, P.dinoGDk, { headUp: true });
  fern(put, X(136), X(120), X(11));
}

// 5 PTERANODON — real proportions: huge wing-finger membranes, long crest
function drawPtero(put, S) {
  const X = U(S); floor(put, S, 45);
  ell(put, X(80), X(126), X(18), X(4), () => '#08090a'); // dive shadow
  // wing skeleton: shoulder->wrist->giant 4th finger tip
  [[-1], [1]].forEach(([sd]) => {
    const shx = 80 + sd * 6, wrx = 80 + sd * 30, tipx = 80 + sd * 66;
    stroke(put, X(shx), X(58), X(wrx), X(44), X(2.6), () => P.furDk);   // arm to wrist
    stroke(put, X(wrx), X(44), X(tipx), X(70), X(2), () => P.furDk);    // wing finger
    // membrane: fills from body line to the bone
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const bx = shx + (wrx - shx) * t, by2 = 58 + (44 - 58) * t;
      stroke(put, X(80 + sd * 4), X(66), X(bx), X(by2), X(1.2), () => mix('#b06a4a', '#5a2e1a', 0.3 + t * 0.3));
    }
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const bx = wrx + (tipx - wrx) * t, by2 = 44 + (70 - 44) * t;
      stroke(put, X(80 + sd * (8 + t * 10)), X(66 + t * 4), X(bx), X(by2), X(1.1), () => mix('#b06a4a', '#5a2e1a', 0.35 + t * 0.35));
    }
  });
  // torso (small!) + legs tucked into membrane
  ell(put, X(80), X(64), X(7), X(9), (tx, ty) => mix('#d29a6e', '#6a3e22', clamp(tx + ty * 0.5 - 0.15, 0, 1)));
  stroke(put, X(78), X(72), X(74), X(80), X(1.8), () => '#6a3e22');
  stroke(put, X(82), X(72), X(86), X(80), X(1.8), () => '#6a3e22');
  // head: long toothless beak + LONG backswept crest (one blade)
  stroke(put, X(80), X(56), X(82), X(48), X(5), () => '#d29a6e'); // neck
  ell(put, X(84), X(44), X(6), X(4.4), (tx, ty) => mix('#e2b088', '#6a3e22', ty));
  for (let i = 0; i <= 10; i++) { const t = i / 10; stroke(put, X(88 + t * 18), X(44 + t * 5), X(88 + t * 18), X(45 + t * 5), X(2.6 * (1 - t * 0.75)), () => mix('#e2b088', '#8a4e2a', t * 0.5)); } // beak fwd-down
  let cx2 = 80, cy2 = 41;
  for (let i = 1; i <= 9; i++) { const t = i / 9; const nx = 80 - t * 22, ny = 41 - t * 8; stroke(put, X(cx2), X(cy2), X(nx), X(ny), X(3.4 * (1 - t * 0.7)), () => mix(P.dinoRLt, P.dinoRDk, t * 0.4)); cx2 = nx; cy2 = ny; } // crest back-up
  put(Math.round(X(82)), Math.round(X(42.5)), P.eye); put(Math.round(X(82.6)), Math.round(X(42.8)), P.night);
}

// 6 DILOPHOSAURUS — twin round crests (the real ones), lean build
function drawDilo(put, S) {
  const X = U(S); floor(put, S, 46); shadow(put, X(80), X(130), X(38), X(5));
  const cLt = P.dinoGLt, c = P.dinoG, cDk = P.dinoGDk;
  theroLeg(put, X, 86, 88, 1.0, cLt, c, cDk, true);
  const TOP = [[4, 66], [30, 65], [56, 62], [76, 58], [92, 56], [104, 58], [112, 62]];
  const BOT = [[4, 70], [30, 72], [56, 78], [76, 86], [92, 92], [104, 90], [112, 84]];
  body(put, X, 4, 112, TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, 90, 90, 1.05, cLt, c, cDk, false);
  stroke(put, X(106), X(72), X(114), X(80), X(2.6), () => c); // arm
  // long neck up + narrow skull w/ notched snout
  stroke(put, X(110), X(64), X(118), X(48), X(7.4), () => c);
  stroke(put, X(118), X(48), X(124), X(40), X(6), () => mix(cLt, c, 0.4));
  const HTOP = [[120, 33], [130, 31], [142, 33], [150, 37]];
  const HBOT = [[120, 43], [132, 43], [144, 41], [150, 40]];
  body(put, X, 120, 150, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(144), X(37), X(147), X(39), X(1.4), () => cDk); // premax notch
  row(put, Math.round(X(42)), X(132), X(149), () => P.night);
  [[136], [141], [146]].forEach(([tx2]) => stroke(put, X(tx2), X(42), X(tx2), X(44), X(0.8), () => P.tooth));
  put(Math.round(X(127)), Math.round(X(35)), P.eye); put(Math.round(X(127.6)), Math.round(X(35.4)), P.night);
  // TWIN semicircular crests
  [[0, P.dinoRLt, P.dinoRDk], [3, '#d2886e', '#6a2e1a']].forEach(([off, c1, c2]) => {
    for (let a = 0.2; a <= 2.9; a += 0.06) put(Math.round(X(129 + off + Math.cos(a) * -8)), Math.round(X(31 - Math.sin(a) * 9)), mix(c1, c2, Math.abs(a - 1.55) / 1.5));
    for (let a = 0.3; a <= 2.8; a += 0.1) put(Math.round(X(129 + off + Math.cos(a) * -6)), Math.round(X(31 - Math.sin(a) * 7)), mix(c1, c2, 0.5));
  });
}

// 7 ANKYLOSAURUS
function drawAnkylo(put, S) {
  const X = U(S); floor(put, S, 47); shadow(put, X(78), X(132), X(52), X(6));
  const cLt = P.mudLt, c = P.mud, cDk = P.mudDk;
  // club tail first (left)
  stroke(put, X(24), X(90), X(10), X(86), X(4.4), () => c);
  ell(put, X(6), X(84), X(6.4), X(5.4), (tx, ty) => mix(P.horn, P.hornDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  ell(put, X(11), X(82), X(3.4), X(3), (tx, ty) => mix(P.horn, P.hornDk, ty));
  // far stub legs
  [[48], [104]].forEach(([lx]) => stroke(put, X(lx), X(106), X(lx - 2), X(128), X(6), () => cDk));
  // low WIDE body
  const TOP = [[24, 86], [44, 76], [72, 70], [100, 72], [122, 80], [134, 88]];
  const BOT = [[24, 94], [44, 106], [72, 114], [100, 114], [122, 106], [134, 98]];
  body(put, X, 24, 134, TOP, BOT, cLt, c, cDk);
  // armor bands (transverse arcs) + osteoderm studs
  [[38], [56], [74], [92], [110]].forEach(([bx]) => { for (let i = 0; i <= 10; i++) { const yy = pw(bx, TOP) + i * (pw(bx, BOT) - pw(bx, TOP)) / 10; put(Math.round(X(bx + Math.sin(i * 0.6) * 1.4)), Math.round(X(yy)), mix(cDk, P.night, 0.2)); } });
  for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) {
    const ax = 40 + k * 18 + r * 8, ay = pw(ax, TOP) + 4 + r * 9;
    if (ay) ell(put, X(ax), X(ay), X(2.6), X(1.8), (tx, ty) => mix(P.horn, P.hornDk, tx + ty * 0.4));
  }
  // side spikes along the flank
  [[40, 100], [58, 106], [78, 108], [98, 107], [116, 101]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2), X(sx2 - 3), X(sy2 + 7), X(2.4), () => mix(P.horn, P.hornDk, 0.3)));
  // near stub legs
  [[62], [116]].forEach(([lx]) => { stroke(put, X(lx), X(108), X(lx), X(130), X(6.4), () => c); ell(put, X(lx), X(131), X(4.4), X(2.4), () => cDk); });
  // small triangular head w/ horns at the back corners
  const HTOP = [[134, 84], [144, 86], [152, 90]];
  const HBOT = [[134, 98], [144, 98], [152, 96]];
  body(put, X, 134, 152, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(136), X(84), X(133), X(78), X(2), () => P.hornDk);
  stroke(put, X(140), X(97), X(138), X(102), X(1.8), () => P.hornDk);
  put(Math.round(X(142)), Math.round(X(89)), P.eye);
}

// 8 PACHYCEPHALOSAURUS — head-down charge
function drawPachy(put, S) {
  const X = U(S); floor(put, S, 48); shadow(put, X(80), X(130), X(36), X(5));
  const cLt = P.dinoOLt, c = P.dinoO, cDk = P.dinoODk;
  theroLeg(put, X, 78, 88, 1.05, cLt, c, cDk, true);
  // body horizontal, tail high for balance
  const TOP = [[6, 58], [30, 58], [52, 56], [72, 55], [90, 58], [102, 64]];
  const BOT = [[6, 62], [30, 66], [52, 74], [72, 84], [90, 86], [102, 82]];
  body(put, X, 6, 102, TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, 82, 88, 1.1, cLt, c, cDk, false);
  stroke(put, X(96), X(72), X(104), X(80), X(2.4), () => c); // small arm
  // neck curves DOWN — dome leading
  stroke(put, X(100), X(66), X(112), X(74), X(7), () => c);
  stroke(put, X(112), X(74), X(120), X(80), X(6), () => mix(cLt, c, 0.4));
  // dome skull: thick bone cap + spike fringe on the rear rim
  dome(put, X(128), X(84), X(10), P.horn, mix(P.horn, P.white, 0.35), P.hornDk);
  for (let a = 2.2; a <= 4.2; a += 0.3) stroke(put, X(128 + Math.cos(a) * 10), X(83 + Math.sin(a) * 9), X(128 + Math.cos(a) * 15), X(83 + Math.sin(a) * 13), X(1.8), () => P.hornDk); // fringe spikes
  ell(put, X(133), X(92), X(5.4), X(3.4), (tx, ty) => mix(cLt, cDk, ty)); // muzzle below
  stroke(put, X(138), X(93), X(142), X(94), X(2), () => cDk);
  put(Math.round(X(128)), Math.round(X(90)), P.eye); put(Math.round(X(128.6)), Math.round(X(90.4)), P.night);
  // impact lines ahead
  [[150, 82], [152, 88], [150, 94]].forEach(([ix, iy]) => stroke(put, X(146), X(88), X(ix), X(iy), X(1.1), () => mix(P.white, P.night, 0.5)));
}

// 9 SPINOSAURUS — sail + croc skull, wading
function drawSpino(put, S) {
  const X = U(S); floor(put, S, 49);
  for (let x = 0; x < S; x++) { const yy = 0.8 * S + Math.sin(x / S * 7) * 1.4; for (let y = yy; y < Math.min(S, yy + 0.12 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.35 + (y - yy) / (0.12 * S) * 0.4)); }
  const cLt = P.dinoBLt, c = P.dinoB, cDk = P.dinoBDk;
  theroLeg(put, X, 76, 92, 1.15, cLt, c, cDk, true);
  // long body + long finned tail
  const TOP = [[2, 78], [24, 74], [48, 66], [70, 62], [90, 62], [104, 66], [114, 70]];
  const BOT = [[2, 84], [24, 86], [48, 92], [70, 100], [90, 102], [104, 96], [114, 88]];
  body(put, X, 2, 114, TOP, BOT, cLt, c, cDk);
  // tail fin (deep paddle)
  for (let x = 2; x <= 34; x++) { const t = (x - 2) / 32; for (let y = pw(x, BOT); y <= pw(x, BOT) + 10 * (1 - t); y++) put(Math.round(X(x)), Math.round(X(y)), mix(c, cDk, 0.4 + t * 0.3)); }
  // THE SAIL — tall semicircle of spines over the back
  for (let x = 36; x <= 96; x++) {
    const t = (x - 36) / 60;
    const h = Math.sin(t * 3.14) * 30;
    const base = pw(x, TOP);
    for (let y = 1; y <= h; y++) put(Math.round(X(x)), Math.round(X(base - y)), mix(P.dinoRLt, P.dinoRDk, clamp(y / Math.max(1, h) * 0.85 + ((x % 7) < 1 ? 0.25 : 0), 0, 1)));
  }
  theroLeg(put, X, 82, 94, 1.2, cLt, c, cDk, false);
  // big clawed arms reaching toward water
  stroke(put, X(104), X(76), X(116), X(92), X(4), () => c);
  [[116, 96], [119, 95], [121, 92]].forEach(([fx, fy]) => stroke(put, X(116), X(92), X(fx), X(fy + 3), X(1.6), () => P.claw));
  // neck + long croc skull angled down at the water
  stroke(put, X(112), X(66), X(122), X(70), X(7), () => c);
  const HTOP = [[120, 64], [132, 66], [146, 72], [154, 77]];
  const HBOT = [[120, 76], [134, 78], [148, 81], [154, 82]];
  body(put, X, 120, 154, HTOP, HBOT, cLt, c, cDk);
  row(put, Math.round(X(78.5)), X(130), X(153), () => P.night);
  [[134], [139], [144], [149]].forEach(([tx2]) => { stroke(put, X(tx2), X(78.5), X(tx2), X(80), X(0.8), () => P.tooth); });
  put(Math.round(X(126)), Math.round(X(68)), P.eye);
  stroke(put, X(150), X(74), X(152), X(76), X(1.2), () => cDk); // notch
  // splash ring where it hunts
  for (let a = 0; a < 6.28; a += 0.25) put(Math.round(X(134 + Math.cos(a) * 9)), Math.round(X(130 + Math.sin(a) * 3)), mix('#c8e8f0', P.night, 0.5));
}

// 10 PARASAUROLOPHUS — tube crest, mid-stampede
function drawParasaur(put, S) {
  const X = U(S); floor(put, S, 50); shadow(put, X(80), X(130), X(36), X(5));
  const cLt = P.dinoGLt, c = P.dinoG, cDk = P.dinoGDk;
  theroLeg(put, X, 82, 86, 1.15, cLt, c, cDk, true);
  const TOP = [[4, 62], [30, 60], [56, 56], [78, 54], [96, 56], [108, 62]];
  const BOT = [[4, 68], [30, 72], [56, 80], [78, 88], [96, 90], [108, 84]];
  body(put, X, 4, 108, TOP, BOT, cLt, c, cDk);
  for (let x = 40; x <= 100; x++) put(Math.round(X(x)), Math.round(X(pw(x, BOT) - 1)), mix(P.belly, cDk, 0.3)); // pale belly line
  theroLeg(put, X, 86, 88, 1.2, cLt, c, cDk, false);
  // hanging forearms (it sprints bipedal)
  stroke(put, X(102), X(70), X(110), X(82), X(3), () => c);
  stroke(put, X(98), X(70), X(104), X(84), X(2.6), () => cDk);
  // neck up + duckbill head
  stroke(put, X(106), X(60), X(116), X(44), X(7), () => c);
  const HTOP = [[112, 36], [124, 36], [134, 40]];
  const HBOT = [[112, 46], [126, 47], [134, 46]];
  body(put, X, 112, 134, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(132), X(44), X(140), X(46), X(2.6), () => P.hornDk); // bill
  // TUBE CREST sweeping back
  let cx2 = 116, cy2 = 36;
  for (let i = 1; i <= 10; i++) { const t = i / 10; const nx = 116 - t * 22, ny = 36 - t * 10 + t * t * 6; stroke(put, X(cx2), X(cy2), X(nx), X(ny), X(3.6 * (1 - t * 0.5)), () => mix(P.dinoRLt, P.dinoRDk, t * 0.4)); cx2 = nx; cy2 = ny; }
  put(Math.round(X(118)), Math.round(X(39)), P.eye); put(Math.round(X(118.6)), Math.round(X(39.4)), P.night);
  // stampede dust + herd shadow behind
  for (let a = 0; a < 6.28; a += 0.45) put(Math.round(X(16 + Math.cos(a) * 7)), Math.round(X(116 + Math.sin(a) * 3)), mix(P.mudLt, P.night, 0.5));
  ell(put, X(30), X(40), X(14), X(5), () => mix(cDk, P.night, 0.5)); stroke(put, X(42), X(36), X(50), X(30), X(2.4), () => mix(cDk, P.night, 0.5));
}

// 11 CARNOTAURUS — bull horns, tiny arms, sprinter
function drawCarno(put, S) {
  const X = U(S); floor(put, S, 51); shadow(put, X(80), X(130), X(40), X(5));
  const cLt = P.dinoRLt, c = P.dinoR, cDk = P.dinoRDk;
  theroLeg(put, X, 84, 86, 1.2, cLt, c, cDk, true);
  const TOP = [[4, 64], [30, 62], [56, 58], [78, 54], [96, 54], [108, 58], [116, 64]];
  const BOT = [[4, 68], [30, 72], [56, 80], [78, 90], [96, 92], [108, 88], [116, 80]];
  body(put, X, 4, 116, TOP, BOT, cLt, c, cDk);
  // osteoderm rows along the flank
  for (let x = 24; x <= 104; x += 8) { put(Math.round(X(x)), Math.round(X(pw(x, TOP) + 6)), cDk); put(Math.round(X(x + 3)), Math.round(X(pw(x, TOP) + 12)), cDk); }
  theroLeg(put, X, 88, 88, 1.25, cLt, c, cDk, false);
  // comically tiny arms (accurate!)
  stroke(put, X(110), X(74), X(115), X(78), X(2), () => c);
  // short deep bulldog skull
  stroke(put, X(114), X(62), X(122), X(52), X(9), () => c);
  const HTOP = [[118, 40], [128, 38], [138, 42]];
  const HBOT = [[118, 56], [130, 58], [138, 54]];
  body(put, X, 118, 138, HTOP, HBOT, cLt, c, cDk);
  row(put, Math.round(X(54)), X(124), X(137), () => P.night);
  [[127], [132], [136]].forEach(([tx2]) => stroke(put, X(tx2), X(54), X(tx2), X(56), X(0.9), () => P.tooth));
  // BULL HORNS over the eyes, jutting sideways-up
  stroke(put, X(122), X(40), X(116), X(32), X(3), () => P.hornDk);
  stroke(put, X(130), X(40), X(136), X(31), X(3), () => P.horn);
  put(Math.round(X(126)), Math.round(X(44)), P.eye); put(Math.round(X(126.6)), Math.round(X(44.4)), P.night);
  [[20, 100], [26, 108]].forEach(([dx, dy]) => { for (let a = 0; a < 6.28; a += 0.6) put(Math.round(X(dx + Math.cos(a) * 4)), Math.round(X(dy + Math.sin(a) * 2)), mix(P.mudLt, P.night, 0.5)); });
}

// 12 GALLIMIMUS — ostrich sprinter
function drawGalli(put, S) {
  const X = U(S); floor(put, S, 52); shadow(put, X(80), X(128), X(30), X(4));
  const cLt = '#d8c090', c = '#a89058', cDk = '#5a4a24';
  // long far leg extended (full sprint)
  stroke(put, X(74), X(78), X(56), X(94), X(5), () => cDk);
  stroke(put, X(56), X(94), X(64), X(116), X(3), () => cDk);
  stroke(put, X(64), X(116), X(58), X(126), X(2.2), () => cDk);
  // compact body
  const TOP = [[16, 66], [40, 64], [62, 58], [80, 54], [92, 56]];
  const BOT = [[16, 70], [40, 74], [62, 80], [80, 84], [92, 80]];
  body(put, X, 16, 92, TOP, BOT, cLt, c, cDk);
  // near leg driving forward
  stroke(put, X(80), X(80), X(96), X(92), X(5.4), () => c);
  stroke(put, X(96), X(92), X(90), X(112), X(3.2), () => mix(c, cDk, 0.4));
  stroke(put, X(90), X(112), X(100), X(124), X(2.4), () => mix(c, cDk, 0.5));
  for (let k = 0; k <= 2; k++) stroke(put, X(100), X(124), X(104 + k * 2), X(126), X(1.2), () => P.claw);
  // slim arms tucked
  stroke(put, X(84), X(68), X(92), X(74), X(2), () => cDk);
  // LONG neck + tiny beaked head
  stroke(put, X(90), X(60), X(100), X(38), X(5.4), () => c);
  ell(put, X(104), X(32), X(5.4), X(3.4), (tx, ty) => mix(cLt, cDk, ty));
  stroke(put, X(108), X(32), X(116), X(33), X(1.8), () => cDk); // toothless beak
  put(Math.round(X(103)), Math.round(X(30.5)), P.eye); put(Math.round(X(103.6)), Math.round(X(30.8)), P.night);
  // speed lines
  [[20, 50], [16, 62], [24, 74]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 14), X(ly), X(1), () => mix(P.white, P.night, 0.6)));
}

// 13 THERIZINOSAURUS — pot belly, scythe claws
function drawTheri(put, S) {
  const X = U(S); floor(put, S, 53); shadow(put, X(78), X(132), X(34), X(5));
  const cLt = P.furLt, c = P.fur, cDk = P.furDk;
  // upright pear body (herbivore theropod)
  for (let y = 58; y <= 112; y++) {
    const t = (y - 58) / 54;
    const w = 10 + Math.sin(t * 2.6) * 14;
    row(put, Math.round(X(y)), X(74 - w), X(74 + w), (tx) => mix(cLt, cDk, clamp(tx * 1.25 + t * 0.2, 0, 1)));
  }
  // shaggy feather ticks
  for (let k = 0; k < 12; k++) { const fx = 58 + (k * 37) % 34, fy = 70 + (k * 53) % 40; stroke(put, X(fx), X(fy), X(fx - 2), X(fy + 4), X(1), () => cDk); }
  // fan tail
  for (let a = 2.5; a <= 3.8; a += 0.14) stroke(put, X(60), X(104), X(60 + Math.cos(a) * 20), X(104 + Math.sin(a) * 14), X(2.4), () => mix(c, cDk, (a - 2.5)));
  // legs (stout)
  stroke(put, X(66), X(110), X(62), X(130), X(6), () => cDk);
  stroke(put, X(84), X(110), X(88), X(130), X(6), () => c);
  // long neck + tiny head
  stroke(put, X(78), X(58), X(86), X(36), X(5), () => c);
  ell(put, X(90), X(30), X(5), X(3.4), (tx, ty) => mix(cLt, cDk, ty));
  stroke(put, X(94), X(31), X(100), X(32), X(1.6), () => cDk);
  put(Math.round(X(89)), Math.round(X(28.5)), P.eye);
  // ARMS + THE CLAWS (three per hand, huge)
  [[58, 74, -1], [94, 74, 1]].forEach(([ax, ay, sd]) => {
    stroke(put, X(74 + sd * 12), X(70), X(ax + sd * 10), X(ay + 14), X(3.4), () => c);
    for (let k = 0; k < 3; k++) {
      let px2 = ax + sd * 10, py2 = ay + 14;
      for (let i = 1; i <= 6; i++) { const t = i / 6; const nx = px2 + sd * 3, ny = py2 + 4 - k * 1 + t * 2; stroke(put, X(px2), X(py2), X(nx), X(ny), X(2 * (1 - t * 0.5)), () => mix(P.claw, P.hornDk, t * 0.4)); px2 = nx; py2 = ny; }
    }
  });
}

// 14 ALLOSAURUS — the mid-size apex
function drawAllo(put, S) {
  const X = U(S); floor(put, S, 54); shadow(put, X(80), X(132), X(44), X(6));
  const cLt = '#b09a6a', c = '#7a683e', cDk = '#3a3018';
  theroLeg(put, X, 84, 90, 1.25, cLt, c, cDk, true);
  const TOP = [[2, 68], [28, 66], [54, 62], [78, 56], [96, 54], [110, 58], [118, 64]];
  const BOT = [[2, 72], [28, 76], [54, 84], [78, 94], [96, 98], [110, 92], [118, 84]];
  body(put, X, 2, 118, TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, 88, 92, 1.3, cLt, c, cDk, false);
  // 3-fingered arms (bigger than a rex's)
  stroke(put, X(108), X(74), X(118), X(86), X(3.4), () => c);
  for (let k = 0; k < 3; k++) stroke(put, X(118), X(86), X(121 + k * 2), X(90 + k), X(1.4), () => P.claw);
  // neck + deep skull w/ brow crests
  stroke(put, X(114), X(64), X(122), X(52), X(9), () => c);
  const HTOP = [[118, 38], [128, 36], [140, 40], [150, 46]];
  const HBOT = [[118, 54], [132, 56], [144, 54], [150, 50]];
  body(put, X, 118, 150, HTOP, HBOT, cLt, c, cDk);
  row(put, Math.round(X(52)), X(128), X(149), () => P.night);
  [[132], [137], [142], [147]].forEach(([tx2]) => { stroke(put, X(tx2), X(52), X(tx2), X(54.5), X(1), () => P.tooth); stroke(put, X(tx2 + 2), X(56), X(tx2 + 2), X(54.5), X(0.9), () => P.tooth); });
  // brow crest horns (lacrimal ridges — allosaurus signature)
  stroke(put, X(126), X(38), X(123), X(32), X(2.4), () => P.dinoRDk);
  stroke(put, X(132), X(37), X(130), X(31), X(2.2), () => P.dinoRDk);
  put(Math.round(X(128)), Math.round(X(42)), P.eye); put(Math.round(X(128.6)), Math.round(X(42.4)), P.night);
}

// 15 IGUANODON — thumb-spike brawler
function drawIguano(put, S) {
  const X = U(S); floor(put, S, 55); shadow(put, X(78), X(132), X(40), X(6));
  const cLt = '#9ab27a', c = '#6a8248', cDk = '#324018';
  // heavy body, semi-upright
  const TOP = [[8, 74], [32, 66], [58, 58], [80, 54], [98, 56], [110, 62]];
  const BOT = [[8, 80], [32, 88], [58, 98], [80, 104], [98, 102], [110, 92]];
  stroke(put, X(70), X(96), X(62), X(128), X(8), () => cDk); // far leg
  body(put, X, 8, 110, TOP, BOT, cLt, c, cDk);
  stroke(put, X(76), X(98), X(72), X(130), X(9), () => c); // near leg
  ell(put, X(72), X(131), X(6), X(3), (tx, ty) => mix(cLt, cDk, ty));
  // heavy forearm planted + one arm RAISED showing the THUMB SPIKE
  stroke(put, X(98), X(80), X(104), X(104), X(4.4), () => mix(c, cDk, 0.25));
  ell(put, X(104), X(106), X(3.4), X(2), () => cDk);
  stroke(put, X(104), X(70), X(118), X(58), X(4), () => c);
  ell(put, X(120), X(56), X(3.4), X(3), () => mix(cLt, c, 0.4)); // hand
  stroke(put, X(121), X(53), X(125), X(45), X(2.6), () => P.horn); // THE thumb spike
  // neck + boxy herbivore head w/ beak
  stroke(put, X(108), X(62), X(118), X(50), X(7), () => c);
  const HTOP = [[116, 40], [128, 40], [138, 44]];
  const HBOT = [[116, 52], [130, 53], [138, 52]];
  body(put, X, 116, 138, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(136), X(50), X(142), X(51), X(2.2), () => P.hornDk);
  put(Math.round(X(122)), Math.round(X(43)), P.eye); put(Math.round(X(122.6)), Math.round(X(43.4)), P.night);
  fern(put, X(24), X(126), X(11));
}

// 16 OVIRAPTOR — crested egg thief (still a dino, still a menace)
function drawOvi(put, S) {
  const X = U(S); floor(put, S, 56); shadow(put, X(76), X(126), X(26), X(4));
  const cLt = '#d8b45e', c = '#c8a04a', cDk = '#6a5018';
  theroLeg(put, X, 74, 84, 0.9, cLt, c, cDk, true);
  const TOP = [[24, 62], [44, 60], [62, 56], [78, 54], [90, 57]];
  const BOT = [[24, 66], [44, 70], [62, 76], [78, 84], [90, 80]];
  body(put, X, 24, 90, TOP, BOT, cLt, c, cDk);
  // tail feather fan
  for (let a = 2.6; a <= 3.7; a += 0.12) stroke(put, X(26), X(64), X(26 + Math.cos(a) * 18), X(64 + Math.sin(a) * 12), X(2.2), () => mix(c, cDk, (a - 2.6)));
  theroLeg(put, X, 78, 86, 0.95, cLt, c, cDk, false);
  // arms hugging the STOLEN EGG
  ell(put, X(94), X(78), X(5.4), X(6.5), (tx, ty) => mix(P.white, P.bellyDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  put(Math.round(X(93)), Math.round(X(76)), P.bellyDk); put(Math.round(X(96)), Math.round(X(80)), P.bellyDk);
  stroke(put, X(88), X(72), X(96), X(82), X(2.4), () => c);
  // S-neck + parrot head w/ tall round casque
  stroke(put, X(88), X(58), X(96), X(44), X(5), () => c);
  ell(put, X(100), X(38), X(6), X(4.4), (tx, ty) => mix(cLt, cDk, ty));
  for (let a = 0.2; a <= 2.9; a += 0.07) put(Math.round(X(99 + Math.cos(a) * -5)), Math.round(X(34 - Math.sin(a) * 7)), mix(P.dinoRLt, P.dinoRDk, Math.abs(a - 1.55) / 1.6)); // casque
  stroke(put, X(105), X(39), X(110), X(41), X(2.2), () => P.hornDk); // hooked beak
  put(Math.round(X(99)), Math.round(X(36.5)), P.eye); put(Math.round(X(99.6)), Math.round(X(36.8)), P.night);
  // robbed nest
  ell(put, X(128), X(116), X(14), X(5), (tx, ty) => mix(P.mudLt, P.mudDk, ty));
  ell(put, X(124), X(114), X(3), X(3.6), (tx, ty) => mix(P.white, P.bellyDk, tx));
  [[22, 46], [18, 58]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 10), X(ly), X(1), () => mix(P.white, P.night, 0.6)));
}

// 17 TROODON — big-eyed night pack
function drawTroodon(put, S) {
  const X = U(S); floor(put, S, 57);
  // night vignette
  for (let y = 0; y < S * 0.3; y++) row(put, Math.round(y), 0, S - 1, () => mix('#0a0c14', P.night, 0.5));
  put(Math.round(S * 0.85), Math.round(S * 0.12), P.white); // moon dot
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(S * 0.85 + Math.cos(a) * 4), Math.round(S * 0.12 + Math.sin(a) * 4), mix(P.white, P.night, 0.6));
  shadow(put, X(80), X(126), X(30), X(4));
  const cLt = '#7a8a9a', c = '#4a5866', cDk = '#222c36';
  theroLeg(put, X, 84, 86, 0.95, cLt, c, cDk, true);
  const TOP = [[10, 66], [34, 65], [58, 62], [78, 58], [94, 56], [104, 60]];
  const BOT = [[10, 70], [34, 72], [58, 78], [78, 86], [94, 88], [104, 82]];
  body(put, X, 10, 104, TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, 88, 88, 1.0, cLt, c, cDk, false);
  stroke(put, X(98), X(72), X(106), X(80), X(2.4), () => c);
  stroke(put, X(102), X(62), X(110), X(50), X(6), () => c);
  const HTOP = [[106, 42], [116, 40], [128, 43], [136, 47]];
  const HBOT = [[106, 51], [118, 51], [130, 50], [136, 49]];
  body(put, X, 106, 136, HTOP, HBOT, cLt, c, cDk);
  row(put, Math.round(X(50.5)), X(120), X(135), () => P.night);
  // HUGE night eye
  ell(put, X(114), X(45), X(3), X(3.2), () => P.night);
  ell(put, X(114), X(45), X(2), X(2.2), () => '#c8e83a');
  put(Math.round(X(113.5)), Math.round(X(44.4)), P.white);
  // second pack member's glow eyes in the dark background
  put(Math.round(X(28)), Math.round(X(44)), '#c8e83a'); put(Math.round(X(33)), Math.round(X(44)), '#c8e83a');
  ell(put, X(30), X(50), X(10), X(4), () => mix(cDk, P.night, 0.5));
}

// 18 KENTROSAURUS — the spike hedgehog
function drawKentro(put, S) {
  const X = U(S); floor(put, S, 58); shadow(put, X(80), X(132), X(44), X(6));
  const cLt = '#b2906a', c = '#7a5c3a', cDk = '#3a2a14';
  stroke(put, X(60), X(98), X(56), X(128), X(7), () => cDk);
  stroke(put, X(102), X(102), X(100), X(126), X(5.4), () => cDk);
  const TOP = [[14, 82], [34, 70], [56, 60], [76, 60], [96, 68], [114, 80], [126, 90]];
  const BOT = [[14, 90], [34, 100], [56, 110], [76, 112], [96, 108], [114, 102], [126, 98]];
  body(put, X, 14, 126, TOP, BOT, cLt, c, cDk);
  stroke(put, X(66), X(102), X(64), X(132), X(8), () => c);
  stroke(put, X(108), X(104), X(108), X(128), X(6), () => mix(c, cDk, 0.25));
  // small plates on the FRONT half only
  [[92, 10], [104, 8], [114, 6]].forEach(([px2, h]) => { const base = pw(px2, TOP); for (let i = 0; i <= h; i++) { const t = i / h, w = 3.4 * (1 - Math.abs(t - 0.35) * 1.5); if (w > 0) row(put, Math.round(X(base - i)), X(px2 - w), X(px2 + w), (tx) => mix(P.dinoRLt, P.dinoRDk, tx + t * 0.4)); } });
  // SPIKES from mid-back all the way down the tail
  [[80, 60, 20], [66, 62, 22], [52, 64, 22], [38, 70, 20], [26, 76, 18], [14, 82, 16], [4, 84, 14]].forEach(([sx2, sy2, ln]) => {
    stroke(put, X(sx2), X(sy2 + 4), X(sx2 - ln * 0.5), X(sy2 - ln * 0.8), X(2.8), () => mix(P.horn, P.hornDk, 0.2));
    stroke(put, X(sx2 - ln * 0.4), X(sy2 - ln * 0.6), X(sx2 - ln * 0.5), X(sy2 - ln * 0.8), X(1.4), () => P.hornDk);
  });
  // shoulder spike (kentro signature)
  stroke(put, X(96), X(90), X(112), X(78), X(3), () => P.horn);
  // tiny low head
  const HTOP = [[126, 88], [138, 90], [146, 94]];
  const HBOT = [[126, 98], [138, 99], [146, 99]];
  body(put, X, 126, 146, HTOP, HBOT, cLt, c, cDk);
  stroke(put, X(146), X(96), X(150), X(97), X(2), () => P.hornDk);
  put(Math.round(X(134)), Math.round(X(92)), P.eye);
}

// 19 BARYONYX — river fisher
function drawBary(put, S) {
  const X = U(S); floor(put, S, 59);
  for (let x = 0; x < S; x++) { const yy = 0.76 * S + Math.sin(x / S * 6) * 1.6; for (let y = yy; y < Math.min(S, yy + 0.16 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.35 + (y - yy) / (0.16 * S) * 0.4)); }
  const cLt = '#a8a072', c = '#6e6844', cDk = '#34301a';
  // crouched over the water
  theroLeg(put, X, 70, 88, 1.05, cLt, c, cDk, true);
  const TOP = [[2, 60], [26, 58], [50, 56], [72, 54], [88, 58], [98, 64]];
  const BOT = [[2, 64], [26, 68], [50, 76], [72, 86], [88, 90], [98, 86]];
  body(put, X, 2, 98, TOP, BOT, cLt, c, cDk);
  theroLeg(put, X, 74, 90, 1.1, cLt, c, cDk, false);
  // hook-claw arm plunged toward water w/ FISH speared
  stroke(put, X(90), X(74), X(104), X(96), X(3.6), () => c);
  stroke(put, X(104), X(96), X(108), X(104), X(2.4), () => mix(c, cDk, 0.4));
  stroke(put, X(108), X(104), X(112), X(98), X(2.2), () => P.claw); // the giant hook claw
  ell(put, X(114), X(96), X(5), X(2.4), (tx) => mix('#8ab2c8', '#3a5a6a', tx)); // fish wriggling
  stroke(put, X(119), X(95), X(122), X(93), X(1.4), () => '#3a5a6a');
  // low neck + gharial snout skimming the surface
  stroke(put, X(96), X(66), X(106), X(74), X(6.4), () => c);
  const HTOP = [[104, 70], [118, 74], [134, 80], [146, 85]];
  const HBOT = [[104, 80], [120, 84], [136, 88], [146, 90]];
  body(put, X, 104, 146, HTOP, HBOT, cLt, c, cDk);
  row(put, Math.round(X(86.5)), X(116), X(145), () => P.night);
  [[120], [126], [132], [138], [143]].forEach(([tx2]) => stroke(put, X(tx2), X(86.5), X(tx2), X(88), X(0.7), () => P.tooth));
  put(Math.round(X(110)), Math.round(X(74)), P.eye);
  // ripples
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(X(116 + Math.cos(a) * 10)), Math.round(X(124 + Math.sin(a) * 3)), mix('#c8e8f0', P.night, 0.55));
}

// 20 BRACHIOSAURUS — the colossus
function drawBrachio(put, S) {
  const X = U(S); floor(put, S, 60); shadow(put, X(72), X(140), X(48), X(6));
  const cLt = '#a8b284', c = '#6e7a50', cDk = '#323a1e';
  // far legs
  stroke(put, X(44), X(104), X(42), X(138), X(9), () => cDk);
  stroke(put, X(92), X(100), X(94), X(136), X(10), () => cDk);
  // body: shoulders HIGHER than hips (brachio signature)
  const TOP = [[16, 96], [36, 84], [60, 74], [84, 66], [102, 64]];
  const BOT = [[16, 102], [36, 112], [60, 120], [84, 118], [102, 108]];
  body(put, X, 16, 102, TOP, BOT, cLt, c, cDk);
  // tail (shorter, held off ground)
  const TT = [[0, 92], [16, 96]], TB = [[0, 98], [16, 102]];
  body(put, X, 0, 16, TT, TB, cLt, c, cDk);
  // near legs: front pillar LONGER
  stroke(put, X(52), X(106), X(50), X(140), X(10), () => c);
  ell(put, X(50), X(141), X(6.4), X(3), (tx, ty) => mix(cLt, cDk, ty));
  stroke(put, X(98), X(102), X(100), X(138), X(11), () => mix(c, cDk, 0.15));
  ell(put, X(100), X(139), X(7), X(3), (tx, ty) => mix(cLt, cDk, ty));
  // NECK sweeping up like a crane
  let nx2 = 104, ny2 = 70;
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    const nx = 104 + Math.sin(t * 1.2) * 28, ny = 70 - t * 52;
    stroke(put, X(nx2), X(ny2), X(nx), X(ny), X(Math.max(4, 11 * (1 - t * 0.55))), () => mix(c, cDk, t * 0.25));
    nx2 = nx; ny2 = ny;
  }
  // small head w/ dome crest nostril bump
  ell(put, X(nx2 + 4), X(ny2 - 2), X(7), X(4.4), (tx, ty) => mix(cLt, cDk, ty));
  for (let a = 0.4; a <= 2.7; a += 0.2) put(Math.round(X(nx2 + 1 + Math.cos(a) * -4)), Math.round(X(ny2 - 6 - Math.sin(a) * 3)), mix(cLt, c, 0.4)); // nasal dome
  stroke(put, X(nx2 + 10), X(ny2 - 1), X(nx2 + 14), X(ny2), X(2.2), () => cDk);
  put(Math.round(X(nx2 + 3)), Math.round(X(ny2 - 4)), P.eye);
  // canopy it grazes + falling leaf
  fern(put, X(150), X(16), X(12), P.fern, P.fernLt);
  put(Math.round(X(140)), Math.round(X(34)), P.fernLt);
}

const LIST = [
  { n: 1, name: 'RAPTOR', role: 'pack lunger, sickle claw', draw: raptor160 },
  { n: 2, name: 'COMPY SWARM', role: 'tiny chasers', draw: drawCompies },
  { n: 3, name: 'TRICERATOPS', role: 'warned shield charge', draw: trike160 },
  { n: 4, name: 'STEGOSAURUS', role: 'tank, thagomizer sweep', draw: stego160 },
  { n: 5, name: 'PTERODACTYL', role: 'shadow-marked diver', draw: drawPtero },
  { n: 6, name: 'DILOPHOSAURUS', role: 'twin crests, venom spit', draw: drawDilo },
  { n: 7, name: 'ANKYLOSAURUS', role: 'armored, club-tail swing', draw: drawAnkylo },
  { n: 8, name: 'PACHYCEPHALOSAURUS', role: 'dome headbutt charge', draw: drawPachy },
  { n: 9, name: 'SPINOSAURUS', role: 'elite river hunter', draw: drawSpino },
  { n: 10, name: 'PARASAUROLOPHUS', role: 'herd stampeder', draw: drawParasaur },
  { n: 11, name: 'CARNOTAURUS', role: 'bull-horn sprint charger', draw: drawCarno },
  { n: 12, name: 'GALLIMIMUS', role: 'flock sprinter', draw: drawGalli },
  { n: 13, name: 'THERIZINOSAURUS', role: 'scythe-claw sweeps', draw: drawTheri },
  { n: 14, name: 'ALLOSAURUS', role: 'mid apex predator', draw: drawAllo },
  { n: 15, name: 'IGUANODON', role: 'thumb-spike brawler', draw: drawIguano },
  { n: 16, name: 'OVIRAPTOR', role: 'egg thief, spawns trouble', draw: drawOvi },
  { n: 17, name: 'TROODON', role: 'night pack, glow eyes', draw: drawTroodon },
  { n: 18, name: 'KENTROSAURUS', role: 'spike hedgehog', draw: drawKentro },
  { n: 19, name: 'BARYONYX', role: 'river fisher, hook claw', draw: drawBary },
  { n: 20, name: 'BRACHIOSAURUS', role: 'colossus — stomps if provoked', draw: drawBrachio },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'prehistoria_mob_options2.png', title: 'PREHISTORIA — MOBS TAKE 2 (real dinos only) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
