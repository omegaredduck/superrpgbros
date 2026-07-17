// artdev/prehistoria/render_prehistoria_mobs.js — PREHISTORIA mob
// sheet: 20 candidates. Dinos, megafauna, tar, and the tribe.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, fern, dinoLeg, floor } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// 1 RAPTOR — pack lunger
function drawRaptor(put, S) {
  const X = U(S); floor(put, S, 1); shadow(put, X(80), X(122), X(30), X(5));
  // body horizontal, tail out
  for (let x = 34; x <= 106; x++) {
    const t = (x - 34) / 72;
    const top = 78 - Math.sin(t * 3.14) * 14, bot = 96 + Math.sin(t * 2.6) * 2;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoOLt, P.dinoODk, clamp((y - top) / Math.max(1, bot - top) * 1.2, 0, 1)));
  }
  // tail stiff back
  for (let i = 0; i <= 14; i++) { const t = i / 14; stroke(put, X(36 - t * 0), X(84), X(36 - t * 24), X(80 - t * 6), X(4.4 * (1 - t * 0.7)), () => mix(P.dinoO, P.dinoODk, t * 0.5)); }
  // back stripes
  [[48], [60], [72], [84]].forEach(([sx2]) => { for (let i = 0; i <= 5; i++) put(Math.round(X(sx2 - i * 0.5)), Math.round(X(66 + i)), P.dinoODk); });
  // legs — one raised (mid-sprint)
  dinoLeg(put, X(62), X(94), X(28), -1, P.dinoO, P.dinoODk);
  dinoLeg(put, X(88), X(92), X(26), 1, P.dinoOLt, P.dinoODk);
  // sickle claw flash on raised foot
  stroke(put, X(90), X(112), X(96), X(108), X(2), () => P.claw);
  // neck + head
  stroke(put, X(104), X(76), X(116), X(62), X(7), () => P.dinoO);
  ell(put, X(122), X(58), X(10), X(6.5), (tx, ty) => mix(P.dinoOLt, P.dinoODk, clamp((1 - tx) * 0.6 + ty * 0.6, 0, 1)));
  stroke(put, X(130), X(60), X(138), X(62), X(3.4), () => P.dinoODk); // snout
  row(put, Math.round(X(62)), X(122), X(137), () => P.night); // jawline
  [[126], [131], [136]].forEach(([tx2]) => stroke(put, X(tx2), X(62), X(tx2), X(64.5), X(0.9), () => P.tooth));
  put(Math.round(X(120)), Math.round(X(56)), P.eye); put(Math.round(X(120.8)), Math.round(X(56.4)), P.night);
  // arms tucked
  stroke(put, X(102), X(82), X(110), X(88), X(2.2), () => P.dinoODk);
  fern(put, X(24), X(122), X(10));
}

// 2 COMPY SWARM — tiny chasers
function drawCompies(put, S) {
  const X = U(S); floor(put, S, 2);
  [[46, 92, 1, 1], [80, 78, 0.85, -1], [108, 96, 1.1, 1], [66, 110, 0.75, -1]].forEach(([cx2, cy2, sc, sd]) => {
    shadow(put, X(cx2), X(cy2 + 22 * sc), X(12 * sc), X(3 * sc));
    // little body
    ell(put, X(cx2), X(cy2 + 8 * sc), X(7 * sc), X(6 * sc), (tx, ty) => mix(P.dinoGLt, P.dinoGDk, clamp(tx + ty * 0.6 - 0.2, 0, 1)));
    stroke(put, X(cx2 - sd * 6 * sc), X(cy2 + 10 * sc), X(cx2 - sd * 16 * sc), X(cy2 + 4 * sc), X(2 * sc), () => P.dinoG); // tail
    // neck + head up
    stroke(put, X(cx2 + sd * 4 * sc), X(cy2 + 4 * sc), X(cx2 + sd * 8 * sc), X(cy2 - 6 * sc), X(2.6 * sc), () => P.dinoG);
    ell(put, X(cx2 + sd * 10 * sc), X(cy2 - 8 * sc), X(4 * sc), X(3 * sc), (tx, ty) => mix(P.dinoGLt, P.dinoGDk, ty));
    stroke(put, X(cx2 + sd * 13 * sc), X(cy2 - 7 * sc), X(cx2 + sd * 17 * sc), X(cy2 - 6 * sc), X(1.4 * sc), () => P.dinoGDk); // beaky snout
    put(Math.round(X(cx2 + sd * 9 * sc)), Math.round(X(cy2 - 9 * sc)), P.eye);
    // legs scurrying
    dinoLeg(put, X(cx2 - 2 * sc), X(cy2 + 12 * sc), X(10 * sc), -1, P.dinoG, P.dinoGDk);
    dinoLeg(put, X(cx2 + 4 * sc), X(cy2 + 12 * sc), X(9 * sc), 1, P.dinoGLt, P.dinoGDk);
  });
  fern(put, X(136), X(118), X(11));
}

// 3 TRICERATOPS — shield charger
function drawTrike(put, S) {
  const X = U(S); floor(put, S, 3); shadow(put, X(78), X(126), X(38), X(6));
  // heavy body
  for (let x = 30; x <= 100; x++) {
    const t = (x - 30) / 70;
    const top = 74 - Math.sin(t * 3.14) * 12, bot = 108;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoBLt, P.dinoBDk, clamp((y - top) / 40 * 1.1, 0, 1)));
  }
  stroke(put, X(32), X(90), X(16), X(100), X(6), () => P.dinoB); // tail
  // legs — columns
  [[44], [62], [82], [96]].forEach(([lx], i) => { stroke(put, X(lx), X(104), X(lx - 1), X(122), X(5.4), () => (i % 2 ? P.dinoBDk : mix(P.dinoB, P.dinoBDk, 0.4))); ell(put, X(lx - 1), X(124), X(4.4), X(2.4), () => P.hornDk); });
  // frill (big shield disc)
  ell(put, X(106), X(66), X(16), X(20), (tx, ty) => mix(P.dinoRLt, P.dinoRDk, clamp(tx * 0.8 + ty * 0.6 - 0.1, 0, 1)));
  for (let a = -1.4; a <= 1.4; a += 0.35) put(Math.round(X(106 + Math.cos(a) * 15)), Math.round(X(66 + Math.sin(a) * 19)), P.hornDk); // frill studs
  // head + beak
  ell(put, X(120), X(76), X(12), X(10), (tx, ty) => mix(P.dinoBLt, P.dinoBDk, clamp((1 - tx) * 0.5 + ty * 0.6, 0, 1)));
  stroke(put, X(130), X(82), X(138), X(88), X(4), () => P.hornDk); // beak
  put(Math.round(X(122)), Math.round(X(72)), P.eye); put(Math.round(X(122.8)), Math.round(X(72.4)), P.night);
  // THREE horns
  stroke(put, X(112), X(58), X(108), X(44), X(3), () => P.horn);
  stroke(put, X(122), X(60), X(126), X(46), X(3), () => P.horn);
  stroke(put, X(128), X(72), X(136), X(66), X(2.6), () => P.horn);
  // charge dust
  [[20, 112], [26, 118]].forEach(([dx, dy]) => { for (let a = 0; a < 6.28; a += 0.6) put(Math.round(X(dx + Math.cos(a) * 4)), Math.round(X(dy + Math.sin(a) * 2.4)), mix(P.mudLt, P.night, 0.5)); });
}

// 4 STEGO — tail-spike tank
function drawStego(put, S) {
  const X = U(S); floor(put, S, 4); shadow(put, X(80), X(126), X(38), X(6));
  // arched body
  for (let x = 28; x <= 118; x++) {
    const t = (x - 28) / 90;
    const top = 84 - Math.sin(t * 3.14) * 26, bot = 108;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoGLt, P.dinoGDk, clamp((y - top) / 46 * 1.15, 0, 1)));
  }
  // back plates (two rows, offset)
  for (let k = 0; k < 6; k++) {
    const px2 = 40 + k * 14, py2 = 84 - Math.sin(((px2 - 28) / 90) * 3.14) * 26;
    for (let i = 0; i <= 10; i++) { const t = i / 10; row(put, Math.round(X(py2 - 14 + i * 1.4)), X(px2 - (5 - Math.abs(t - 0.5) * 8)), X(px2 + (5 - Math.abs(t - 0.5) * 8)), (tx) => mix(P.dinoRLt, P.dinoRDk, clamp(tx + t * 0.3, 0, 1))); }
  }
  // legs
  [[44], [60], [86], [102]].forEach(([lx], i) => { stroke(put, X(lx), X(104), X(lx), X(122), X(5), () => (i % 2 ? P.dinoGDk : mix(P.dinoG, P.dinoGDk, 0.4))); });
  // tiny head low
  stroke(put, X(116), X(94), X(128), X(102), X(6), () => P.dinoG);
  ell(put, X(132), X(104), X(7), X(5), (tx, ty) => mix(P.dinoGLt, P.dinoGDk, ty));
  put(Math.round(X(132)), Math.round(X(102)), P.eye);
  // THAGOMIZER — 4 tail spikes mid-swing
  stroke(put, X(30), X(94), X(14), X(84), X(5), () => P.dinoGDk);
  [[16, 74], [10, 80], [8, 90], [12, 96]].forEach(([sx2, sy2]) => stroke(put, X(16), X(86), X(sx2), X(sy2), X(2.2), () => P.horn));
  // swing arc hint
  for (let a = 1.8; a <= 2.9; a += 0.1) put(Math.round(X(30 + Math.cos(a) * 26)), Math.round(X(92 + Math.sin(a) * 14)), mix(P.white, P.night, 0.6));
}

// 5 PTERODACTYL — shadow diver
function drawPtero(put, S) {
  const X = U(S); floor(put, S, 5);
  // dive shadow marker below
  ell(put, X(84), X(122), X(16), X(4), (tx, ty) => mix('#000000', P.night, 0.3));
  // wings spread wide (membrane)
  [[-1], [1]].forEach(([sd]) => {
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      stroke(put, X(80), X(58), X(80 + sd * (10 + t * 48)), X(48 + Math.sin(t * 2.4) * 10 + t * 14), X(1.4), () => mix(P.dinoRLt, P.dinoRDk, 0.3 + t * 0.4));
    }
    stroke(put, X(80), X(56), X(80 + sd * 34), X(44), X(2.6), () => P.dinoRDk); // leading bone
    stroke(put, X(80 + sd * 34), X(44), X(80 + sd * 58), X(64), X(2.2), () => P.dinoRDk);
  });
  // body + head crest + beak
  ell(put, X(80), X(64), X(8), X(11), (tx, ty) => mix(P.dinoRLt, P.dinoRDk, clamp(tx + ty * 0.5 - 0.15, 0, 1)));
  ell(put, X(80), X(48), X(6), X(5.4), (tx, ty) => mix(P.dinoRLt, P.dinoRDk, ty));
  stroke(put, X(82), X(44), X(92), X(38), X(2.4), () => P.dinoRDk); // crest back
  stroke(put, X(76), X(50), X(64), X(58), X(2.6), () => P.horn); // long beak (angled down-left = diving)
  put(Math.round(X(77)), Math.round(X(47)), P.eye);
  // dangling talons
  [[76, 74], [84, 74]].forEach(([tx2, ty2]) => { stroke(put, X(tx2), X(ty2), X(tx2 - 1), X(ty2 + 7), X(1.6), () => P.dinoRDk); put(Math.round(X(tx2 - 1)), Math.round(X(ty2 + 8)), P.claw); });
  // dive lines
  [[52, 28], [64, 22], [96, 24]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 3), X(ly + 10), X(1), () => mix(P.white, P.night, 0.6)));
}

// 6 DILOPHOSAURUS — venom spitter
function drawDilo(put, S) {
  const X = U(S); floor(put, S, 6); shadow(put, X(74), X(122), X(26), X(5));
  // body like raptor but upright
  for (let x = 40; x <= 92; x++) {
    const t = (x - 40) / 52;
    const top = 82 - Math.sin(t * 3.14) * 10, bot = 100;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoGLt, P.dinoGDk, clamp((y - top) / 24 * 1.1, 0, 1)));
  }
  stroke(put, X(42), X(88), X(22), X(80), X(4.4), () => P.dinoG);
  dinoLeg(put, X(60), X(96), X(26), -1, P.dinoG, P.dinoGDk);
  dinoLeg(put, X(80), X(96), X(24), 1, P.dinoGLt, P.dinoGDk);
  // neck up + head
  stroke(put, X(88), X(80), X(96), X(58), X(6), () => P.dinoG);
  ell(put, X(102), X(52), X(9), X(6), (tx, ty) => mix(P.dinoGLt, P.dinoGDk, ty));
  stroke(put, X(109), X(54), X(118), X(56), X(3), () => P.dinoGDk);
  put(Math.round(X(100)), Math.round(X(50)), P.eye);
  // FRILL flared (the jurassic park move)
  for (let a = -2.4; a <= 0.6; a += 0.16) {
    const fx = 100 + Math.cos(a) * 16, fy = 52 + Math.sin(a) * 13;
    stroke(put, X(100), X(52), X(fx), X(fy), X(1.2), () => mix('#e8a83a', '#a8442e', (Math.sin(a * 3) + 1) / 2));
  }
  // venom glob arc + splat
  for (let i = 0; i <= 10; i++) { const t = i / 10; put(Math.round(X(118 + t * 22)), Math.round(X(54 - Math.sin(t * 3.14) * 12 + t * 26)), mix(P.venom, P.venomDk, t * 0.4)); }
  ell(put, X(142), X(84), X(4), X(2), () => P.venom);
  put(Math.round(X(140)), Math.round(X(81)), mix(P.venom, P.white, 0.4));
}

// 7 ANKYLO — armored club tail
function drawAnkylo(put, S) {
  const X = U(S); floor(put, S, 7); shadow(put, X(82), X(124), X(38), X(6));
  // low wide dome body
  for (let x = 36; x <= 120; x++) {
    const t = (x - 36) / 84;
    const top = 92 - Math.sin(t * 3.14) * 20, bot = 110;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.mudLt, P.mudDk, clamp((y - top) / 34 * 1.15, 0, 1)));
  }
  // armor osteoderms (rows of studs)
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) {
    const ax = 48 + k * 12 + r * 4, ay = 92 - Math.sin(((ax - 36) / 84) * 3.14) * 20 + 5 + r * 7;
    ell(put, X(ax), X(ay), X(2.6), X(2), (tx, ty) => mix(P.horn, P.hornDk, tx + ty * 0.4));
  }
  // side spikes
  [[44, 100], [60, 104], [78, 105], [96, 104], [110, 100]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2), X(sx2 - 4), X(sy2 + 8), X(2.2), () => P.horn));
  // stub legs
  [[52], [70], [90], [106]].forEach(([lx]) => stroke(put, X(lx), X(108), X(lx), X(120), X(4.4), () => P.mudDk));
  // head (small, beaked, armored brow)
  ell(put, X(126), X(90), X(8), X(6), (tx, ty) => mix(P.mudLt, P.mudDk, ty));
  row(put, Math.round(X(86)), X(120), X(132), () => P.hornDk);
  put(Math.round(X(127)), Math.round(X(88)), P.eye);
  // CLUB TAIL raised mid-swing
  stroke(put, X(38), X(98), X(20), X(84), X(4.4), () => P.mud);
  ell(put, X(14), X(78), X(8), X(7), (tx, ty) => mix(P.horn, P.hornDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  [[8, 74], [12, 70], [20, 72]].forEach(([kx, ky]) => put(Math.round(X(kx)), Math.round(X(ky)), P.hornDk));
  for (let a = 2.0; a <= 3.1; a += 0.12) put(Math.round(X(30 + Math.cos(a) * 24)), Math.round(X(86 + Math.sin(a) * 12)), mix(P.white, P.night, 0.6));
}

// 8 PACHY — headbutt charger
function drawPachy(put, S) {
  const X = U(S); floor(put, S, 8); shadow(put, X(76), X(124), X(26), X(5));
  // leaning-forward body (mid charge)
  for (let x = 44; x <= 100; x++) {
    const t = (x - 44) / 56;
    const top = 76 + t * 8 - Math.sin(t * 3.14) * 8, bot = 100 - t * 2;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoOLt, P.dinoODk, clamp((y - top) / 22 * 1.1, 0, 1)));
  }
  stroke(put, X(46), X(84), X(26), X(72), X(4.4), () => P.dinoO); // tail up for balance
  dinoLeg(put, X(64), X(96), X(26), -1, P.dinoO, P.dinoODk);
  dinoLeg(put, X(84), X(94), X(26), 1, P.dinoOLt, P.dinoODk);
  // head DOWN — dome first
  stroke(put, X(98), X(80), X(110), X(84), X(6), () => P.dinoO);
  dome(put, X(120), X(84), X(10), P.horn, mix(P.horn, P.white, 0.3), P.hornDk);
  // dome stud ring
  for (let a = -1.2; a <= 1.2; a += 0.4) put(Math.round(X(120 + Math.cos(a + 3.14) * 10)), Math.round(X(84 + Math.sin(a + 3.14) * 9)), P.hornDk);
  ell(put, X(124), X(92), X(5), X(3.4), (tx, ty) => mix(P.dinoOLt, P.dinoODk, ty)); // snout below dome
  put(Math.round(X(120)), Math.round(X(90)), P.eye);
  // impact star ahead
  [[140, 84], [146, 80], [146, 90]].forEach(([ix, iy]) => stroke(put, X(136), X(85), X(ix), X(iy), X(1.2), () => mix(P.white, P.night, 0.4)));
  [[34, 106], [40, 112]].forEach(([dx, dy]) => { for (let a = 0; a < 6.28; a += 0.7) put(Math.round(X(dx + Math.cos(a) * 3.4)), Math.round(X(dy + Math.sin(a) * 2)), mix(P.mudLt, P.night, 0.5)); });
}

// 9 SPINOSAUR — elite river hunter
function drawSpino(put, S) {
  const X = U(S); floor(put, S, 9);
  // water strip
  for (let x = 0; x < S; x++) { const yy = 0.78 * S + Math.sin(x / S * 7) * 1.6; for (let y = yy; y < Math.min(S, yy + 0.14 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.35 + (y - yy) / (0.14 * S) * 0.4)); }
  // body wading
  for (let x = 30; x <= 104; x++) {
    const t = (x - 30) / 74;
    const top = 74 - Math.sin(t * 3.14) * 10, bot = 116;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoBLt, P.dinoBDk, clamp((y - top) / 46 * 1.15, 0, 1)));
  }
  // SAIL
  for (let x = 40; x <= 92; x++) {
    const t = (x - 40) / 52;
    const h = Math.sin(t * 3.14) * 26;
    for (let y = 0; y <= h; y++) put(Math.round(X(x)), Math.round(X(70 - Math.sin(t * 3.14) * 8 - y)), mix(P.dinoRLt, P.dinoRDk, clamp(y / Math.max(1, h) * 0.9 + 0.1, 0, 1)));
  }
  for (let k = 0; k < 6; k++) { const sx2 = 44 + k * 8; stroke(put, X(sx2), X(66 - Math.sin(((sx2 - 40) / 52) * 3.14) * 8), X(sx2 + 2), X(66 - Math.sin(((sx2 - 40) / 52) * 3.14) * 8 - Math.sin(((sx2 - 40) / 52) * 3.14) * 24), X(0.9), () => P.dinoRDk); } // sail spines
  stroke(put, X(32), X(90), X(14), X(100), X(5.4), () => P.dinoB); // tail into water
  // croc head low over water
  stroke(put, X(102), X(80), X(112), X(92), X(7), () => P.dinoB);
  ell(put, X(120), X(96), X(9), X(5.4), (tx, ty) => mix(P.dinoBLt, P.dinoBDk, ty));
  stroke(put, X(128), X(98), X(142), X(99), X(3.4), () => P.dinoBDk); // long croc snout
  row(put, Math.round(X(99.5)), X(126), X(141), () => P.night);
  [[128], [133], [138]].forEach(([tx2]) => stroke(put, X(tx2), X(99.5), X(tx2), X(101.5), X(0.8), () => P.tooth));
  put(Math.round(X(118)), Math.round(X(93)), P.eye);
  // fish jumping away
  stroke(put, X(146), X(112), X(150), X(106), X(1.6), () => '#8ab2c8');
}

// 10 PARASAUR — herd stampeder
function drawParasaur(put, S) {
  const X = U(S); floor(put, S, 10); shadow(put, X(78), X(124), X(30), X(5));
  // running body
  for (let x = 36; x <= 100; x++) {
    const t = (x - 36) / 64;
    const top = 78 - Math.sin(t * 3.14) * 12, bot = 102;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.dinoGLt, P.dinoGDk, clamp((y - top) / 26 * 1.05, 0, 1)));
  }
  ell(put, X(70), X(96), X(20), X(7), (tx, ty) => mix(P.belly, P.bellyDk, ty)); // belly
  stroke(put, X(38), X(86), X(16), X(74), X(5), () => P.dinoG); // tail
  dinoLeg(put, X(58), X(98), X(26), -1, P.dinoG, P.dinoGDk);
  dinoLeg(put, X(84), X(96), X(26), 1, P.dinoGLt, P.dinoGDk);
  stroke(put, X(96), X(80), X(106), X(64), X(5.4), () => P.dinoG); // neck
  // duckbill head + backswept CREST
  ell(put, X(112), X(58), X(8), X(5.4), (tx, ty) => mix(P.dinoGLt, P.dinoGDk, ty));
  stroke(put, X(118), X(60), X(126), X(62), X(3), () => P.hornDk); // bill
  stroke(put, X(108), X(54), X(94), X(44), X(3.4), () => P.dinoRDk); // crest
  put(Math.round(X(110)), Math.round(X(56)), P.eye);
  // stampede dust + more silhouettes behind
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(X(28 + Math.cos(a) * 6)), Math.round(X(110 + Math.sin(a) * 3)), mix(P.mudLt, P.night, 0.55));
  [[40, 50, 0.4], [130, 46, 0.35]].forEach(([hx, hy, fd]) => { ell(put, X(hx), X(hy), X(10), X(4.4), () => mix(P.dinoGDk, P.night, fd + 0.25)); stroke(put, X(hx + 8), X(hy - 2), X(hx + 13), X(hy - 6), X(2), () => mix(P.dinoGDk, P.night, fd + 0.25)); });
}

// 11 CAVE SPEARMAN — tribal poker
function drawSpearman(put, S) {
  const X = U(S); floor(put, S, 11); shadow(put, X(76), X(126), X(20), X(4));
  // legs + fur wrap
  stroke(put, X(70), X(96), X(66), X(120), X(4), () => P.skin);
  stroke(put, X(82), X(96), X(86), X(120), X(4), () => P.skinDk);
  for (let y = 88; y <= 100; y++) row(put, Math.round(X(y)), X(64), X(88), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.1 + ((y % 3) === 0 ? 0.25 : 0), 0, 1)));
  // torso
  for (let y = 62; y <= 88; y++) { const t = (y - 62) / 26, w = 11 - t * 2; row(put, Math.round(X(y)), X(76 - w), X(76 + w), (tx) => mix(P.skin, P.skinDk, clamp(tx * 1.15 + t * 0.2, 0, 1))); }
  // fur sash
  for (let i = 0; i <= 14; i++) { const t = i / 14; stroke(put, X(66 + t * 20), X(64 + t * 22), X(68 + t * 20), X(66 + t * 22), X(2.6), () => mix(P.fur, P.furDk, t * 0.4)); }
  // arms + stone spear
  stroke(put, X(86), X(66), X(100), X(56), X(3.4), () => P.skin);
  stroke(put, X(112), X(96), X(94), X(30), X(2), () => P.mudLt); // shaft
  for (let i = 0; i <= 5; i++) row(put, Math.round(X(26 + i)), X(92 + i * 0.7), X(96 - i * 0.2), () => P.horn); // knapped point
  stroke(put, X(66), X(66), X(58), X(80), X(3.4), () => P.skinDk);
  // head: shaggy hair + bone necklace
  ell(put, X(76), X(52), X(9), X(9.5), (tx, ty) => mix(P.skin, P.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)));
  for (let y = 42; y <= 52; y++) row(put, Math.round(X(y)), X(67 + Math.abs(Math.sin(y)) * 2), X(85 - Math.abs(Math.cos(y)) * 2), (tx) => mix('#3a2a18', '#1a0f08', tx));
  put(Math.round(X(73)), Math.round(X(52)), P.night); put(Math.round(X(80)), Math.round(X(52)), P.night);
  [[70, 60], [76, 62], [82, 60]].forEach(([nx, ny]) => put(Math.round(X(nx)), Math.round(X(ny)), P.bone));
  // face paint stripe
  stroke(put, X(70), X(48), X(83), X(48), X(1), () => P.dinoRLt);
}

// 12 CAVE SLINGER — rock lobber
function drawSlinger(put, S) {
  const X = U(S); floor(put, S, 12); shadow(put, X(78), X(126), X(18), X(4));
  stroke(put, X(72), X(98), X(70), X(120), X(3.6), () => P.skinDk);
  stroke(put, X(84), X(98), X(88), X(118), X(3.6), () => P.skin);
  for (let y = 90; y <= 102; y++) row(put, Math.round(X(y)), X(68), X(90), (tx) => mix(P.furLt, P.furDk, clamp(tx + ((y % 3) === 0 ? 0.25 : 0), 0, 1)));
  for (let y = 66; y <= 90; y++) { const t = (y - 66) / 24, w = 10 - t * 2; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(P.skin, P.skinDk, clamp(tx * 1.15 + t * 0.2, 0, 1))); }
  // sling whirling overhead (arc + pouch + rock)
  stroke(put, X(84), X(68), X(92), X(56), X(3), () => P.skin);
  for (let a = 0; a < 5.4; a += 0.12) put(Math.round(X(92 + Math.cos(a) * 18)), Math.round(X(48 + Math.sin(a) * 8)), mix(P.furDk, P.night, (a / 5.4) * 0.4));
  ell(put, X(92 + Math.cos(5.4) * 18), X(48 + Math.sin(5.4) * 8), X(3.4), X(2.6), (tx, ty) => mix(P.ash, P.mudDk, tx + ty * 0.4)); // loaded rock
  stroke(put, X(72), X(68), X(64), X(80), X(3), () => P.skinDk);
  // head: topknot + ochre dots
  ell(put, X(78), X(56), X(8.5), X(9), (tx, ty) => mix(P.skin, P.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)));
  ell(put, X(78), X(46), X(4), X(3.4), (tx, ty) => mix('#3a2a18', '#1a0f08', tx));
  put(Math.round(X(75)), Math.round(X(56)), P.night); put(Math.round(X(81)), Math.round(X(56)), P.night);
  [[72, 60], [78, 62], [84, 60]].forEach(([dx, dy]) => put(Math.round(X(dx)), Math.round(X(dy)), P.dinoOLt));
  // rock pile at feet
  [[60, 120], [66, 122], [63, 117]].forEach(([rx, ry]) => ell(put, X(rx), X(ry), X(3), X(2.2), (tx, ty) => mix(P.ash, P.mudDk, tx)));
}

// 13 BONE SHAMAN — tribal caster
function drawShaman(put, S) {
  const X = U(S); floor(put, S, 13); shadow(put, X(76), X(126), X(20), X(4));
  // robe of hides
  for (let y = 66; y <= 122; y++) { const t = (y - 66) / 56, w = 9 + t * 11; row(put, Math.round(X(y)), X(76 - w), X(76 + w), (tx) => mix(P.furLt, P.furDk, clamp(tx * 1.15 + t * 0.3 + ((y % 4) === 0 ? 0.18 : 0), 0, 1))); }
  // bone pauldrons + necklace
  [[62, 70], [90, 70]].forEach(([bx, by]) => { stroke(put, X(bx - 4), X(by), X(bx + 4), X(by), X(2.6), () => P.bone); ell(put, X(bx - 5), X(by), X(1.6), X(1.6), () => P.boneDk); ell(put, X(bx + 5), X(by), X(1.6), X(1.6), () => P.boneDk); });
  [[68, 78], [76, 81], [84, 78]].forEach(([nx, ny]) => stroke(put, X(nx), X(ny), X(nx), X(ny + 4), X(1.2), () => P.bone));
  // SKULL HELM (dino skull worn as mask)
  ell(put, X(76), X(50), X(11), X(9), (tx, ty) => mix(P.bone, P.boneDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  stroke(put, X(84), X(54), X(94), X(56), X(3), () => P.boneDk); // snout of the skull
  ell(put, X(72), X(50), X(2.6), X(3), () => P.night); ell(put, X(81), X(50), X(2.6), X(3), () => P.night);
  put(Math.round(X(72)), Math.round(X(50)), P.venom); put(Math.round(X(81)), Math.round(X(50)), P.venom); // glow eyes within
  [[68, 42], [76, 40], [84, 42]].forEach(([hx, hy]) => stroke(put, X(hx), X(hy), X(hx), X(hy - 6), X(1.6), () => P.hornDk)); // horn crown
  // staff w/ amber orb
  stroke(put, X(98), X(120), X(102), X(44), X(2.2), () => P.mudLt);
  ell(put, X(103), X(38), X(5.4), X(5.4), (tx, ty) => mix(P.amberLt, P.amber, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  put(Math.round(X(101)), Math.round(X(36)), P.white);
  // trapped bug silhouette in the amber!
  put(Math.round(X(103)), Math.round(X(38)), P.night); put(Math.round(X(104)), Math.round(X(39)), P.night);
  // spirit glyph circles rising
  for (let a = 0; a < 6.28; a += 0.28) put(Math.round(X(48 + Math.cos(a) * 7)), Math.round(X(66 + Math.sin(a) * 5)), mix(P.venom, P.night, 0.45));
  for (let a = 0; a < 6.28; a += 0.36) put(Math.round(X(42 + Math.cos(a) * 5)), Math.round(X(46 + Math.sin(a) * 3.4)), mix(P.venom, P.night, 0.6));
}

// 14 SABERTOOTH — pounce ambusher
function drawSaber(put, S) {
  const X = U(S); floor(put, S, 14); shadow(put, X(80), X(122), X(32), X(5));
  // crouched cat body
  for (let x = 34; x <= 110; x++) {
    const t = (x - 34) / 76;
    const top = 84 - Math.sin(t * 3.14) * 12 - t * 6, bot = 104 + Math.sin(t * 2) * 2;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.furLt, P.furDk, clamp((y - top) / 24 * 1.1, 0, 1)));
  }
  // shoulder hump + stripes
  [[52], [64], [76]].forEach(([sx2]) => { for (let i = 0; i <= 5; i++) put(Math.round(X(sx2 - i * 0.4)), Math.round(X(74 + i)), P.furDk); });
  stroke(put, X(36), X(92), X(22), X(86), X(3.4), () => P.fur); // short tail
  // legs coiled
  stroke(put, X(50), X(102), X(44), X(118), X(4.4), () => P.furDk);
  stroke(put, X(66), X(104), X(62), X(118), X(4), () => P.fur);
  stroke(put, X(94), X(102), X(96), X(118), X(4.4), () => P.furDk);
  ell(put, X(43), X(120), X(4), X(2.4), () => P.furDk); ell(put, X(97), X(120), X(4), X(2.4), () => P.furDk);
  // head low, jaw open, SABERS
  ell(put, X(118), X(78), X(11), X(9), (tx, ty) => mix(P.furLt, P.furDk, clamp((1 - tx) * 0.5 + ty * 0.5, 0, 1)));
  ell(put, X(127), X(82), X(5.4), X(3.4), (tx, ty) => mix(P.belly, P.bellyDk, ty)); // muzzle
  put(Math.round(X(129)), Math.round(X(80)), P.night); // nose
  put(Math.round(X(117)), Math.round(X(74)), P.eye); put(Math.round(X(117.8)), Math.round(X(74.4)), P.night);
  stroke(put, X(112), X(70), X(108), X(64), X(2), () => P.fur); // ear
  // the sabers
  stroke(put, X(124), X(87), X(121), X(98), X(2), () => P.tooth);
  stroke(put, X(130), X(87), X(128), X(97), X(2), () => P.tooth);
  row(put, Math.round(X(86)), X(120), X(132), () => P.night); // open jaw shadow
  // pounce lines
  [[24, 70], [30, 62]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 10), X(ly + 4), X(1), () => mix(P.white, P.night, 0.6)));
}

// 15 TERROR BIRD — sprint pecker
function drawTerrorBird(put, S) {
  const X = U(S); floor(put, S, 15); shadow(put, X(78), X(124), X(24), X(5));
  // tall bird body
  ell(put, X(74), X(78), X(18), X(16), (tx, ty) => mix('#7a5a8a', '#3a2a44', clamp(tx + ty * 0.5 - 0.2, 0, 1)));
  // feather tail poof
  [[56, 70], [52, 78], [54, 86]].forEach(([fx, fy]) => stroke(put, X(fx + 6), X(fy), X(fx), X(fy - 3), X(2.6), () => '#5a4268'));
  // stubby wings
  stroke(put, X(84), X(76), X(92), X(84), X(3.4), () => '#5a4268');
  // LONG legs mid-sprint
  stroke(put, X(70), X(92), X(60), X(110), X(3.4), () => P.dinoODk);
  stroke(put, X(60), X(110), X(66), X(124), X(2.6), () => P.dinoO);
  for (let k = -1; k <= 1; k++) stroke(put, X(66), X(124), X(70 + k * 3), X(127), X(1.2), () => P.claw);
  stroke(put, X(80), X(92), X(92), X(104), X(3.4), () => P.dinoODk);
  stroke(put, X(92), X(104), X(88), X(120), X(2.6), () => P.dinoO);
  // neck + big hatchet head
  stroke(put, X(80), X(66), X(86), X(48), X(5.4), () => '#6a4a7a');
  ell(put, X(92), X(42), X(9), X(7), (tx, ty) => mix('#8a6a9a', '#3a2a44', clamp((1 - tx) * 0.5 + ty * 0.5, 0, 1)));
  // HUGE hooked beak
  for (let i = 0; i <= 8; i++) { const t = i / 8; stroke(put, X(99 + t * 12), X(40 + t * 3), X(99 + t * 12), X(46 - t * 2), X(1.4), () => mix(P.dinoOLt, P.dinoODk, t * 0.5)); }
  stroke(put, X(111), X(43), X(109), X(48), X(1.6), () => P.dinoODk); // hook
  put(Math.round(X(90)), Math.round(X(40)), P.eye); put(Math.round(X(90.8)), Math.round(X(40.4)), P.night);
  // peck impact ahead
  [[122, 52], [126, 46], [126, 58]].forEach(([ix, iy]) => stroke(put, X(118), X(51), X(ix), X(iy), X(1), () => mix(P.white, P.night, 0.5)));
  // speed lines
  [[34, 60], [30, 74]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 12), X(ly), X(1), () => mix(P.white, P.night, 0.62)));
}

// 16 GIANT DRAGONFLY — flyer swarm
function drawDragonfly(put, S) {
  const X = U(S); floor(put, S, 16);
  [[70, 62, 1], [116, 92, 0.7], [38, 100, 0.6]].forEach(([cx2, cy2, sc]) => {
    // 4 wings shimmer
    [[-1, -0.5], [1, -0.5], [-1, 0.4], [1, 0.4]].forEach(([sd, tilt]) => {
      for (let i = 0; i <= 8; i++) { const t = i / 8; stroke(put, X(cx2), X(cy2), X(cx2 + sd * (6 + t * 20) * sc), X(cy2 + tilt * (4 + t * 8) * sc - 4 * sc), X(1), () => mix('#c8e8f0', P.night, 0.35 + t * 0.35)); }
    });
    // long segmented body
    for (let k = 0; k < 6; k++) ell(put, X(cx2 - k * 5 * sc), X(cy2 + k * 2.4 * sc), X(2.6 * sc), X(2 * sc), (tx, ty) => mix('#4ac8b2', '#1a6a5a', (k / 6) + ty * 0.3));
    // head + big eyes
    ell(put, X(cx2 + 4 * sc), X(cy2 - 2 * sc), X(3.4 * sc), X(3 * sc), (tx, ty) => mix('#4ac8b2', '#1a6a5a', ty));
    put(Math.round(X(cx2 + 3 * sc)), Math.round(X(cy2 - 4 * sc)), P.eye);
    put(Math.round(X(cx2 + 6 * sc)), Math.round(X(cy2 - 3 * sc)), P.eye);
  });
}

// 17 TITAN BOA — constrictor ambush
function drawBoa(put, S) {
  const X = U(S); floor(put, S, 17);
  // hanging from a branch
  stroke(put, X(10), X(30), X(150), X(22), X(4.4), () => P.mudDk);
  fern(put, X(30), X(30), X(9), P.fern, P.fernLt); fern(put, X(120), X(26), X(10), P.fern, P.fernLt);
  // coils looping down
  let px2 = 90, py2 = 26;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const nx = 90 + Math.sin(t * 7.5) * (16 + t * 10), ny = 26 + t * 74;
    stroke(put, X(px2), X(py2), X(nx), X(ny), X(6 - t * 1.4), () => mix('#8a9a4a', '#3e4a1a', (Math.sin(t * 15) + 1) / 2 * 0.5 + 0.15));
    px2 = nx; py2 = ny;
  }
  // diamond pattern hints
  for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(X(90 + Math.sin(t * 7.5) * (16 + t * 10))), Math.round(X(26 + t * 74)), '#c8b45a'); }
  // head hanging, jaw unhinged
  ell(put, X(px2), X(py2 + 6), X(8), X(6.5), (tx, ty) => mix('#9aac5a', '#3e4a1a', clamp(tx + ty * 0.5 - 0.2, 0, 1)));
  ell(put, X(px2 - 2), X(py2 + 13), X(4.4), X(4), () => '#2a1014'); // open maw
  [[px2 - 4, py2 + 10], [px2 + 1, py2 + 11]].forEach(([fx, fy]) => stroke(put, X(fx), X(fy), X(fx), X(fy + 3), X(1), () => P.tooth));
  put(Math.round(X(px2 - 3)), Math.round(X(py2 + 4)), P.eye); put(Math.round(X(px2 + 3)), Math.round(X(py2 + 4)), P.eye);
  // forked tongue
  stroke(put, X(px2 - 2), X(py2 + 17), X(px2 - 4), X(py2 + 22), X(0.8), () => P.dinoRLt);
  stroke(put, X(px2 - 2), X(py2 + 17), X(px2), X(py2 + 22), X(0.8), () => P.dinoRLt);
}

// 18 MAMMOTH — elite tank
function drawMammoth(put, S) {
  const X = U(S); floor(put, S, 18); shadow(put, X(78), X(128), X(40), X(6));
  // massive shaggy body
  for (let x = 26; x <= 112; x++) {
    const t = (x - 26) / 86;
    const top = 66 - Math.sin(t * 2.6) * 14, bot = 112;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.furLt, P.furDk, clamp((y - top) / 50 * 1.15, 0, 1)));
  }
  // shag fringe
  for (let x = 30; x <= 108; x += 4) stroke(put, X(x), X(110), X(x - 1), X(118), X(1.4), () => P.furDk);
  // dome head + trunk
  dome(put, X(112), X(62), X(13), P.fur, P.furLt, P.furDk);
  let tx2 = 122, ty2 = 74;
  for (let i = 0; i <= 12; i++) { const t = i / 12; const nx = 122 + Math.sin(t * 2.2) * 10 + t * 4, ny = 74 + t * 40; stroke(put, X(tx2), X(ty2), X(nx), X(ny), X(4.4 - t * 2), () => mix(P.fur, P.furDk, t * 0.4)); tx2 = nx; ty2 = ny; }
  // TUSKS — huge curved
  [[1.2], [0.8]].forEach(([len], i) => {
    let bx = 116, by = 82 + i * 3;
    for (let k = 0; k <= 12; k++) { const t = k / 12; const nx = 116 + Math.sin(t * 2.4) * 26 * len + t * 8, ny = 82 + i * 3 + Math.sin(t * 3.14) * 10 - t * 20 * len; stroke(put, X(bx), X(by), X(nx), X(ny), X(3.4 - t * 1.6), () => mix(P.tooth, P.hornDk, t * 0.35 + i * 0.15)); bx = nx; by = ny; }
  });
  put(Math.round(X(108)), Math.round(X(60)), P.eye); put(Math.round(X(108.8)), Math.round(X(60.4)), P.night);
  stroke(put, X(100), X(52), X(96), X(44), X(3), () => P.furDk); // ear tuft
  // pillar legs
  [[42], [62], [86], [104]].forEach(([lx], i) => { stroke(put, X(lx), X(108), X(lx), X(126), X(6), () => (i % 2 ? P.furDk : mix(P.fur, P.furDk, 0.4))); ell(put, X(lx), X(128), X(5), X(2.4), () => P.hornDk); });
}

// 19 TAR LURKER — the pit grabs
function drawTarLurker(put, S) {
  const X = U(S); floor(put, S, 19);
  // tar pool glossy
  ell(put, X(80), X(102), X(42), X(18), (tx, ty) => mix(P.tarLt, P.tar, clamp(tx * 0.9 + ty * 0.7, 0, 1)));
  ell(put, X(66), X(94), X(10), X(4), () => P.tarGloss); // sheen
  for (let a = 0; a < 6.28; a += 0.12) put(Math.round(X(80 + Math.cos(a) * 43)), Math.round(X(102 + Math.sin(a) * 19)), mix(P.mud, P.mudDk, (Math.sin(a * 4) + 1) / 2));
  // bubbles
  [[64, 106], [96, 108], [84, 98]].forEach(([bx, by]) => { for (let a = 0; a < 6.28; a += 0.5) put(Math.round(X(bx + Math.cos(a) * 3)), Math.round(X(by + Math.sin(a) * 1.8)), P.tarGloss); });
  // the lurker: eyes + spine ridge breaking the surface
  ell(put, X(80), X(88), X(14), X(5), (tx, ty) => mix(P.tarLt, P.tar, ty));
  [[74], [86]].forEach(([ex]) => { ell(put, X(ex), X(86), X(2.6), X(2.2), () => P.eye); put(Math.round(X(ex)), Math.round(X(86)), P.night); });
  [[60, 92], [52, 96], [100, 94], [108, 98]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2), X(sx2 - 2), X(sy2 - 5), X(1.8), () => P.tar));
  // tar arm reaching OUT for a skeleton half-sunk
  stroke(put, X(102), X(90), X(120), X(76), X(3.4), () => P.tar);
  [[122, 72], [125, 75], [124, 79]].forEach(([fx, fy]) => stroke(put, X(120), X(76), X(fx), X(fy), X(1.4), () => P.tarLt));
  // victim bones at the edge
  stroke(put, X(38), X(112), X(48), X(110), X(1.8), () => P.bone);
  ell(put, X(36), X(112), X(2), X(2), () => P.boneDk);
  ell(put, X(52), X(96), X(3.4), X(3), (tx, ty) => mix(P.bone, P.boneDk, tx)); // skull sinking
  put(Math.round(X(51)), Math.round(X(95.5)), P.night);
}

// 20 EGG THIEF — oviraptor runner
function drawEggThief(put, S) {
  const X = U(S); floor(put, S, 20); shadow(put, X(76), X(122), X(24), X(4));
  // nest robbed behind
  ell(put, X(126), X(112), X(16), X(6), (tx, ty) => mix(P.mudLt, P.mudDk, ty));
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(X(126 + Math.cos(a) * 15)), Math.round(X(112 + Math.sin(a) * 5.4)), P.mudDk);
  ell(put, X(122), X(110), X(3.4), X(4), (tx, ty) => mix(P.white, P.bellyDk, tx + ty * 0.3)); // one egg left
  // sprinting body (like compy but bigger, crest)
  for (let x = 46; x <= 92; x++) {
    const t = (x - 46) / 46;
    const top = 82 - Math.sin(t * 3.14) * 10, bot = 98;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#c8a04a', '#6a5018', clamp((y - top) / 18 * 1.1, 0, 1)));
  }
  stroke(put, X(48), X(88), X(28), X(78), X(4), () => '#a8843a');
  dinoLeg(put, X(62), X(94), X(24), -1, '#c8a04a', '#6a5018');
  dinoLeg(put, X(80), X(92), X(24), 1, '#d8b45e', '#6a5018');
  // neck + parrot head w/ crest
  stroke(put, X(88), X(78), X(94), X(62), X(5), () => '#c8a04a');
  ell(put, X(99), X(56), X(7), X(5.4), (tx, ty) => mix('#d8b45e', '#6a5018', ty));
  stroke(put, X(104), X(58), X(110), X(60), X(2.6), () => P.hornDk); // beak
  stroke(put, X(97), X(50), X(94), X(42), X(2.4), () => P.dinoRLt); // crest
  put(Math.round(X(97)), Math.round(X(54)), P.eye);
  // THE STOLEN EGG hugged in its arms
  ell(put, X(90), X(84), X(5.4), X(6.5), (tx, ty) => mix(P.white, P.bellyDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  stroke(put, X(86), X(80), X(94), X(86), X(2), () => '#a8843a'); // arm over egg
  // speckles on the egg
  put(Math.round(X(89)), Math.round(X(82)), P.bellyDk); put(Math.round(X(92)), Math.round(X(86)), P.bellyDk);
  // panic lines
  [[36, 66], [32, 78]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 10), X(ly), X(1), () => mix(P.white, P.night, 0.6)));
}

const LIST = [
  { n: 1, name: 'RAPTOR', role: 'pack lunger, sickle claw', draw: drawRaptor },
  { n: 2, name: 'COMPY SWARM', role: 'tiny chasers', draw: drawCompies },
  { n: 3, name: 'TRICERATOPS', role: 'warned shield charge', draw: drawTrike },
  { n: 4, name: 'STEGO', role: 'tank, thagomizer sweep', draw: drawStego },
  { n: 5, name: 'PTERODACTYL', role: 'shadow-marked diver', draw: drawPtero },
  { n: 6, name: 'DILOPHOSAURUS', role: 'frill flare + venom spit', draw: drawDilo },
  { n: 7, name: 'ANKYLO', role: 'armored, club-tail swing', draw: drawAnkylo },
  { n: 8, name: 'PACHY', role: 'dome headbutt charge', draw: drawPachy },
  { n: 9, name: 'SPINOSAUR', role: 'elite river hunter', draw: drawSpino },
  { n: 10, name: 'PARASAUR', role: 'herd stampeder (map hazard tie-in)', draw: drawParasaur },
  { n: 11, name: 'CAVE SPEARMAN', role: 'tribal poker', draw: drawSpearman },
  { n: 12, name: 'CAVE SLINGER', role: 'rock lobber', draw: drawSlinger },
  { n: 13, name: 'BONE SHAMAN', role: 'skull helm, amber staff caster', draw: drawShaman },
  { n: 14, name: 'SABERTOOTH', role: 'pounce ambusher', draw: drawSaber },
  { n: 15, name: 'TERROR BIRD', role: 'sprint pecker', draw: drawTerrorBird },
  { n: 16, name: 'GIANT DRAGONFLY', role: 'flyer swarm', draw: drawDragonfly },
  { n: 17, name: 'TITAN BOA', role: 'hangs from branches, drops', draw: drawBoa },
  { n: 18, name: 'MAMMOTH', role: 'elite tusk tank', draw: drawMammoth },
  { n: 19, name: 'TAR LURKER', role: 'grabs from the pits', draw: drawTarLurker },
  { n: 20, name: 'EGG THIEF', role: 'steals eggs, spawns trouble', draw: drawEggThief },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'prehistoria_mob_options.png', title: 'PREHISTORIA — MOBS (20 candidates) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
