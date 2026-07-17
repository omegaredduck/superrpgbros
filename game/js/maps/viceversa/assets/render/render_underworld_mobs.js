// artdev/underworld/render_underworld_mobs.js — THE UNDERWORLD mob
// sheet: 20 candidates. Red's brief: demons, imps, succubi, a river of
// souls + skeletons, ghouls, spirits, ghosts, etc.
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, horns, batWing, tail, lick, soulMote, cracks, embers } = KIT;

function U(S) { const u = S / 160; return v => v * u; }

// 1 IMP — pitchfork poker swarm
function drawImp(put, S) {
  const X = U(S); embers(put, S, 6, 1); shadow(put, X(78), X(122), X(18), X(4));
  batWing(put, X(66), X(74), -1, X(16), H.demonDk, '#40100c');
  batWing(put, X(90), X(74), 1, X(16), H.demonDk, '#40100c');
  tail(put, X(88), X(100), 1, X(26), H.demon, H.demonDk);
  // legs + body
  [[70], [86]].forEach(([lx]) => stroke(put, X(lx), X(98), X(lx - 1), X(116), X(3), () => H.demonDk));
  ell(put, X(78), X(86), X(14), X(16), (tx, ty) => mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.6 - 0.25, 0, 1)));
  ell(put, X(78), X(94), X(8), X(6), () => mix(H.demon, H.demonLt, 0.3)); // belly
  // head + horns + grin
  ell(put, X(78), X(62), X(11), X(10), (tx, ty) => mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
  horns(put, X(78), X(56), X(9), H.horn, H.hornDk, 0.8);
  put(Math.round(X(73)), Math.round(X(60)), H.lavaLt); put(Math.round(X(83)), Math.round(X(60)), H.lavaLt);
  stroke(put, X(72), X(66), X(84), X(66), X(1), () => H.night);
  [[74], [78], [82]].forEach(([tx2]) => put(Math.round(X(tx2)), Math.round(X(67)), H.white)); // teeth
  // pitchfork
  stroke(put, X(58), X(112), X(52), X(58), X(2), () => H.iron);
  [[46, 46], [52, 42], [58, 46]].forEach(([px2, py2]) => stroke(put, X(52), X(56), X(px2), X(py2), X(1.6), () => H.iron));
  ell(put, X(60), X(96), X(3), X(3), () => H.demon); // hand on haft
}

// 2 FIRE IMP — fireball lobber
function drawFireImp(put, S) {
  const X = U(S); embers(put, S, 9, 2); shadow(put, X(82), X(122), X(18), X(4));
  tail(put, X(92), X(100), 1, X(24), '#e86a1e', H.lavaDk);
  [[74], [90]].forEach(([lx]) => stroke(put, X(lx), X(98), X(lx - 1), X(116), X(3), () => H.lavaDk));
  ell(put, X(82), X(86), X(14), X(15), (tx, ty) => mix('#ffa03a', H.lavaDk, clamp(tx * 1.1 + ty * 0.6 - 0.2, 0, 1)));
  cracks(put, X(82), X(88), X(18), 4, 1);
  ell(put, X(82), X(62), X(10.5), X(10), (tx, ty) => mix('#ffb45a', H.lavaDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
  // flame hair
  lick(put, X(76), X(50), X(6), H.lava, H.lavaLt); lick(put, X(84), X(47), X(8), H.lava, H.lavaLt); lick(put, X(90), X(51), X(5), H.ember, H.lavaLt);
  put(Math.round(X(77)), Math.round(X(60)), H.white); put(Math.round(X(87)), Math.round(X(60)), H.white);
  stroke(put, X(77), X(66), X(87), X(65), X(1), () => H.night);
  // wind-up fireball held high
  ell(put, X(56), X(56), X(9), X(9), (tx, ty) => mix(H.lavaLt, H.lava, clamp(tx + ty * 0.5, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.8) lick(put, X(56 + Math.cos(a) * 9), X(56 + Math.sin(a) * 9), X(3.4), H.lava, H.lavaLt);
  stroke(put, X(66), X(84), X(58), X(64), X(3), () => '#e8862a'); // raised arm
}

// 3 SUCCUBUS — heart-charm lure
function drawSuccubus(put, S) {
  const X = U(S); embers(put, S, 5, 3);
  batWing(put, X(66), X(66), -1, X(20), H.demonPDk, '#2a0a30');
  batWing(put, X(94), X(66), 1, X(20), H.demonPDk, '#2a0a30');
  // legs
  stroke(put, X(74), X(100), X(72), X(124), X(3.4), () => H.paleDk);
  stroke(put, X(86), X(100), X(88), X(124), X(3.4), () => H.paleDk);
  ell(put, X(71), X(126), X(3.4), X(2), () => H.night); ell(put, X(89), X(126), X(3.4), X(2), () => H.night); // heels
  // dress bodice
  for (let y = 72; y <= 102; y++) { const t = (y - 72) / 30, w = 10 - Math.sin(t * 2.4) * 3 + t * 4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#3a1030', '#14040f', clamp(tx * 1.2 + t * 0.3, 0, 1))); }
  // arms — one blowing a kiss
  stroke(put, X(70), X(76), X(58), X(88), X(2.8), () => H.pale);
  stroke(put, X(90), X(76), X(96), X(64), X(2.8), () => H.pale);
  ell(put, X(97), X(61), X(2.6), X(2.4), () => H.pale);
  // head + hair + little horns
  ell(put, X(80), X(58), X(10), X(10), (tx, ty) => mix('#f0c0d2', H.paleDk, clamp(tx * 1.05 + ty * 0.45 - 0.3, 0, 1)));
  for (let y = 48; y <= 74; y++) { const t = (y - 48) / 26; row(put, Math.round(X(y)), X(86 + Math.sin(t * 3) * 3), X(93 + t * 2), (tx) => mix('#6a1a4a', '#2a0818', tx + t * 0.2)); } // hair fall
  ell(put, X(76), X(50), X(8), X(4), (tx, ty) => mix('#7a2456', '#2a0818', tx)); // fringe
  horns(put, X(80), X(50), X(6), '#f0d8e8', '#8a5a78', 0.7);
  put(Math.round(X(76)), Math.round(X(57)), H.demonP); put(Math.round(X(84)), Math.round(X(57)), H.demonP);
  put(Math.round(X(76)), Math.round(X(56)), H.white);
  stroke(put, X(78), X(62.5), X(82), X(62.5), X(1), () => '#a02a4a'); // lips
  tail(put, X(90), X(98), 1, X(28), H.demonP, H.demonPDk);
  // floating charm hearts
  [[104, 52, 1], [112, 44, 0.75], [119, 38, 0.55]].forEach(([hx, hy, sc]) => {
    ell(put, X(hx - 2 * sc), X(hy), X(2.6 * sc), X(2.4 * sc), () => mix('#ff4a7a', H.night, 1 - sc));
    ell(put, X(hx + 2 * sc), X(hy), X(2.6 * sc), X(2.4 * sc), () => mix('#ff4a7a', H.night, 1 - sc));
    stroke(put, X(hx - 4 * sc), X(hy + 1), X(hx), X(hy + 5 * sc), X(1.6 * sc), () => mix('#e02a5a', H.night, 1 - sc));
    stroke(put, X(hx + 4 * sc), X(hy + 1), X(hx), X(hy + 5 * sc), X(1.6 * sc), () => mix('#e02a5a', H.night, 1 - sc));
  });
}

// 4 DEMON BRUTE — knuckle-walking slammer
function drawBrute(put, S) {
  const X = U(S); embers(put, S, 5, 4); shadow(put, X(80), X(126), X(34), X(6));
  // huge torso, small hips
  for (let y = 56; y <= 108; y++) { const t = (y - 56) / 52, w = 26 - t * 12; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(H.demonLt, H.demonDk, clamp(tx * 1.25 + t * 0.25, 0, 1))); }
  // massive arms to the ground (knuckles)
  stroke(put, X(56), X(66), X(40), X(108), X(8), () => H.demon);
  stroke(put, X(100), X(66), X(116), X(108), X(8), () => H.demon);
  ell(put, X(38), X(114), X(8), X(6), (tx, ty) => mix(H.demonLt, H.demonDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, X(118), X(114), X(8), X(6), (tx, ty) => mix(H.demonLt, H.demonDk, clamp(tx + ty * 0.5, 0, 1)));
  [[34, 40, 44], [114, 120, 124]].forEach(([k1, k2, k3]) => [k1, k2, k3].forEach(kx => put(Math.round(X(kx)), Math.round(X(111)), H.demonDk)));
  // squat legs
  stroke(put, X(68), X(104), X(66), X(122), X(5), () => H.demonDk);
  stroke(put, X(88), X(104), X(90), X(122), X(5), () => H.demonDk);
  // head low between shoulders
  ell(put, X(78), X(52), X(12), X(10), (tx, ty) => mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.5 - 0.15, 0, 1)));
  horns(put, X(78), X(46), X(11), H.horn, H.hornDk, 1.1);
  put(Math.round(X(72)), Math.round(X(50)), H.felLt); put(Math.round(X(84)), Math.round(X(50)), H.felLt);
  // FEL cracks glowing across the chest
  [[64, 78, 72, 88], [88, 72, 94, 84], [74, 92, 70, 100]].forEach(([x0, y0, x1, y1]) => { stroke(put, X(x0), X(y0), X(x1), X(y1), X(1.2), () => H.fel); put(Math.round(X(x1)), Math.round(X(y1)), H.felLt); });
  row(put, Math.round(X(57)), X(71), X(85), () => H.night);
  [[73, 58], [79, 58], [83, 58]].forEach(([tx2, ty2]) => stroke(put, X(tx2), X(ty2), X(tx2), X(ty2 - 3), X(1.4), () => H.white)); // underbite tusks
  // back spikes + chest scar
  [[64, 44], [74, 40], [86, 41], [94, 46]].forEach(([sx2, sy2]) => stroke(put, X(sx2), X(sy2 + 8), X(sx2), X(sy2), X(2), () => H.hornDk));
  stroke(put, X(70), X(74), X(86), X(86), X(1.4), () => H.demonDk);
}

// 5 HELLHOUND — flame-maned pack lunger
function drawHound(put, S) {
  const X = U(S); embers(put, S, 7, 5); shadow(put, X(80), X(120), X(30), X(5));
  // body (side profile, crouched to pounce)
  for (let x = 46; x <= 112; x++) {
    const t = (x - 46) / 66;
    const top = 84 - Math.sin(t * 3.14) * 14 - (1 - t) * 6, bot = 102 + Math.sin(t * 2) * 3;
    for (let y = top; y <= bot; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#3a2028', '#140a10', clamp((y - top) / Math.max(1, bot - top) * 1.2, 0, 1)));
  }
  // flame mane along the spine
  for (let x = 50; x <= 104; x += 7) lick(put, X(x), X(70 - Math.sin((x - 46) / 66 * 3.14) * 12), X(5.5), H.lava, H.lavaLt);
  // legs (crouched)
  stroke(put, X(56), X(100), X(48), X(118), X(3.4), () => '#241016');
  stroke(put, X(66), X(102), X(62), X(118), X(3.4), () => '#140a10');
  stroke(put, X(98), X(102), X(104), X(118), X(3.4), () => '#241016');
  stroke(put, X(108), X(98), X(116), X(116), X(3.4), () => '#140a10');
  // head + jaw
  ell(put, X(38), X(80), X(12), X(9), (tx, ty) => mix('#42242c', '#140a10', clamp(tx * 0.7 + ty * 0.6 - 0.1, 0, 1)));
  stroke(put, X(28), X(84), X(20), X(88), X(4), () => '#2a1218'); // snout
  row(put, Math.round(X(87)), X(20), X(34), () => H.night);
  [[24], [29], [34]].forEach(([tx2]) => stroke(put, X(tx2), X(87), X(tx2), X(90), X(1.2), () => H.white));
  put(Math.round(X(34)), Math.round(X(77)), H.lavaLt); // eye
  stroke(put, X(40), X(70), X(43), X(63), X(2), () => '#2a1218'); // ear
  // fire drool + tail flame
  put(Math.round(X(22)), Math.round(X(92)), H.ember);
  lick(put, X(118), X(84), X(6), H.lava, H.lavaLt);
}

// 6 SKELETON WARRIOR — sword + shield classic
function drawSkeleton(put, S) {
  const X = U(S); embers(put, S, 4, 6); shadow(put, X(78), X(126), X(22), X(4));
  // legs
  [[70], [86]].forEach(([lx]) => { stroke(put, X(lx), X(94), X(lx), X(106), X(2.6), () => H.bone); ell(put, X(lx), X(107), X(2), X(2), () => H.boneDk); stroke(put, X(lx), X(108), X(lx - 1), X(120), X(2.4), () => H.bone); ell(put, X(lx), X(122), X(4), X(2), () => H.boneDk); });
  // pelvis + spine
  ell(put, X(78), X(92), X(8), X(4.4), (tx, ty) => mix(H.bone, H.boneDk, ty));
  stroke(put, X(78), X(70), X(78), X(90), X(2.4), () => H.bone);
  // ribcage
  for (let k = 0; k < 4; k++) { const ry = 72 + k * 5; for (let a = 0.35; a <= 2.8; a += 0.09) put(Math.round(X(78 + Math.cos(a) * (12 - k))), Math.round(X(ry + Math.sin(a) * 2.4)), mix(H.bone, H.boneDk, k * 0.14)); }
  // arms
  stroke(put, X(66), X(70), X(56), X(84), X(2.2), () => H.bone);
  stroke(put, X(90), X(70), X(102), X(80), X(2.2), () => H.bone);
  // skull
  ell(put, X(78), X(56), X(9.5), X(9), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx * 0.9 + ty * 0.55 - 0.3, 0, 1)));
  for (let y = 62; y <= 66; y++) row(put, Math.round(X(y)), X(73), X(83), (tx) => mix(H.bone, H.boneDk, (y - 62) / 5)); // jaw
  ell(put, X(74.5), X(55), X(2.4), X(2.8), () => H.night); ell(put, X(81.5), X(55), X(2.4), X(2.8), () => H.night);
  put(Math.round(X(74)), Math.round(X(55)), H.soul); put(Math.round(X(81)), Math.round(X(55)), H.soul); // soul-lit sockets
  [[75], [78], [81]].forEach(([tx2]) => stroke(put, X(tx2), X(63), X(tx2), X(65), X(0.8), () => H.night));
  // notched sword raised
  stroke(put, X(104), X(78), X(122), X(38), X(2.6), () => '#b8bcc8');
  stroke(put, X(108), X(70), X(114), X(72), X(1.6), () => H.ironDk); // notch shadow
  stroke(put, X(100), X(80), X(108), X(76), X(2), () => H.gold); // crossguard
  // round shield
  ell(put, X(52), X(86), X(11), X(12), (tx, ty) => mix(H.iron, H.ironDk, clamp(tx * 1.1 + ty * 0.4 - 0.1, 0, 1)));
  ell(put, X(52), X(86), X(4), X(4.4), (tx, ty) => mix(H.gold, H.goldDk, tx));
  for (let a = 0; a < 6.28; a += 0.7) put(Math.round(X(52 + Math.cos(a) * 9.4)), Math.round(X(86 + Math.sin(a) * 10.4)), H.ironDk);
}

// 7 SKELETON ARCHER — flaming arrows
function drawArcher(put, S) {
  const X = U(S); embers(put, S, 5, 7); shadow(put, X(76), X(126), X(20), X(4));
  // legs + pelvis + spine + ribs (leaner)
  [[68, -2], [84, 2]].forEach(([lx, o]) => { stroke(put, X(lx), X(96), X(lx + o), X(120), X(2.4), () => H.bone); ell(put, X(lx + o), X(122), X(3.6), X(2), () => H.boneDk); });
  ell(put, X(76), X(94), X(7), X(4), (tx, ty) => mix(H.bone, H.boneDk, ty));
  stroke(put, X(76), X(72), X(76), X(92), X(2.2), () => H.bone);
  for (let k = 0; k < 3; k++) for (let a = 0.4; a <= 2.75; a += 0.1) put(Math.round(X(76 + Math.cos(a) * (10 - k))), Math.round(X(74 + k * 5 + Math.sin(a) * 2))), 0;
  for (let k = 0; k < 3; k++) for (let a = 0.4; a <= 2.75; a += 0.1) put(Math.round(X(76 + Math.cos(a) * (10 - k))), Math.round(X(74 + k * 5 + Math.sin(a) * 2)), mix(H.bone, H.boneDk, k * 0.16));
  // skull w/ hood scrap
  ell(put, X(76), X(58), X(9), X(8.6), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx * 0.9 + ty * 0.5 - 0.3, 0, 1)));
  for (let y = 48; y <= 56; y++) row(put, Math.round(X(y)), X(67 + (56 - y) * 0.4), X(85), (tx) => mix('#42242c', '#1a0c10', tx)); // ragged hood
  ell(put, X(73), X(57.5), X(2.2), X(2.6), () => H.night); ell(put, X(80), X(57.5), X(2.2), X(2.6), () => H.night);
  put(Math.round(X(73)), Math.round(X(57)), H.lava); put(Math.round(X(80)), Math.round(X(57)), H.lava);
  // bow drawn — arc + string + flaming arrow
  for (let a = -1.1; a <= 1.1; a += 0.04) put(Math.round(X(52 + Math.cos(a) * 26 * 0.55)), Math.round(X(80 + Math.sin(a) * 26)), H.hornDk);
  stroke(put, X(59), X(55), X(59), X(105), X(0.8), () => H.ashLt); // string (drawn back at arrow)
  stroke(put, X(59), X(80), X(70), X(80), X(0.8), () => H.ashLt);
  stroke(put, X(44), X(80), X(70), X(80), X(1.6), () => H.hornDk); // arrow shaft
  lick(put, X(40), X(80), X(5), H.lava, H.lavaLt); // flaming tip
  stroke(put, X(70), X(78), X(74), X(80), X(1.4), () => H.bone); // draw hand
  stroke(put, X(64), X(70), X(52), X(80), X(2), () => H.bone); // bow arm
  // quiver on back
  plate(put, X(88), X(70), X(96), X(92), '#4a2a1a', '#6a4228', '#241208');
  [[90, 66], [93, 64], [96, 67]].forEach(([qx, qy]) => { stroke(put, X(qx), X(qy), X(qx), X(70), X(1), () => H.hornDk); put(Math.round(X(qx)), Math.round(X(qy - 1)), H.ember); });
}

// 8 GHOUL — hunched flesh-eater
function drawGhoul(put, S) {
  const X = U(S); embers(put, S, 4, 8); shadow(put, X(80), X(124), X(26), X(5));
  // hunched back mass
  for (let y = 54; y <= 118; y++) {
    const t = (y - 54) / 64, w = 10 + Math.sin(t * 2.6) * 12 + t * 2;
    row(put, Math.round(X(y)), X(84 - w), X(84 + w), (tx) => mix('#8aa07a', '#3a4a30', clamp(tx * 1.25 + t * 0.3, 0, 1)));
  }
  // spine nubs on the hump
  [[88, 58], [93, 64], [96, 71], [98, 79]].forEach(([sx2, sy2]) => put(Math.round(X(sx2)), Math.round(X(sy2)), '#c8d4b0'));
  // long claw arms reaching forward-down
  stroke(put, X(72), X(76), X(50), X(104), X(3.4), () => '#6a8058');
  stroke(put, X(78), X(82), X(58), X(112), X(3.2), () => '#54683f');
  [[46, 108], [48, 112], [52, 114]].forEach(([cx2, cy2]) => stroke(put, X(50), X(106), X(cx2 - 2), X(cy2), X(1.2), () => H.bone));
  [[54, 116], [58, 118], [62, 117]].forEach(([cx2, cy2]) => stroke(put, X(58), X(112), X(cx2), X(cy2 + 2), X(1.2), () => H.bone));
  // legs folded under
  stroke(put, X(90), X(112), X(96), X(122), X(3.4), () => '#54683f');
  // low-slung head, drooling maw
  ell(put, X(66), X(62), X(11), X(9), (tx, ty) => mix('#9ab288', '#465838', clamp(tx * 0.9 + ty * 0.6 - 0.15, 0, 1)));
  ell(put, X(60), X(67), X(7), X(4.4), () => '#2a1014'); // open maw
  [[56], [60], [64]].forEach(([tx2]) => stroke(put, X(tx2), X(65), X(tx2), X(68), X(1), () => H.white));
  stroke(put, X(58), X(71), X(57), X(78), X(1), () => '#b0e0c8'); // drool
  put(Math.round(X(62)), Math.round(X(58)), H.white); put(Math.round(X(70)), Math.round(X(58)), H.white);
  put(Math.round(X(62)), Math.round(X(58.8)), H.night); put(Math.round(X(70)), Math.round(X(58.8)), H.night);
  // gnawed bone dropped
  stroke(put, X(96), X(120), X(108), X(116), X(2), () => H.bone);
  ell(put, X(95), X(120), X(2), X(2), () => H.boneDk); ell(put, X(109), X(116), X(2), X(2), () => H.boneDk);
}

// 9 GHOST — the classic, phases through shelves of rock
function drawGhost(put, S) {
  const X = U(S); embers(put, S, 4, 9);
  // wavy sheet body
  for (let y = 46; y <= 112; y++) {
    const t = (y - 46) / 66, w = 20 - t * 2 + Math.sin(t * 6) * 2;
    row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(mix('#e8f4f2', '#8ab2ac', clamp(tx * 1.15 + t * 0.35, 0, 1)), H.night, t * 0.35));
  }
  // scalloped hem
  for (let k = 0; k < 5; k++) { const hx = 62 + k * 9; for (let a = 3.34; a <= 6.1; a += 0.12) put(Math.round(X(hx + Math.cos(a) * 4.5)), Math.round(X(112 + Math.sin(a) * 5)), mix('#a8c8c2', H.night, 0.35)); }
  // arms up "boo"
  stroke(put, X(60), X(70), X(46), X(58), X(4.4), () => '#c8dedb');
  stroke(put, X(100), X(70), X(114), X(58), X(4.4), () => '#c8dedb');
  ell(put, X(44), X(55), X(3.4), X(3), () => '#e8f4f2'); ell(put, X(116), X(55), X(3.4), X(3), () => '#e8f4f2');
  // face — hollow eyes + wailing mouth
  ell(put, X(72), X(62), X(3.4), X(5), () => H.night); ell(put, X(88), X(62), X(3.4), X(5), () => H.night);
  ell(put, X(80), X(76), X(4.4), X(6.5), () => H.night);
  put(Math.round(X(71)), Math.round(X(60)), '#8ab2ac'); put(Math.round(X(87)), Math.round(X(60)), '#8ab2ac');
}

// 10 WRAITH — hooded spirit, sickle swipe
function drawWraith(put, S) {
  const X = U(S); embers(put, S, 5, 10);
  // tattered floating robe
  for (let y = 44; y <= 116; y++) {
    const t = (y - 44) / 72, w = 9 + t * 16 + Math.sin(t * 5) * 2;
    row(put, Math.round(X(y)), X(76 - w), X(76 + w), (tx) => mix('#2e2440', '#0e0a18', clamp(tx * 1.25 + t * 0.2, 0, 1)));
  }
  // ragged hem tails
  [[62, 116, 58, 128], [74, 116, 74, 130], [88, 116, 92, 126]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0), X(x1), X(y1), X(2.4), () => '#1a1228'));
  // hood + void face w/ green glow eyes
  ell(put, X(76), X(50), X(12), X(11), (tx, ty) => mix('#3a2e52', '#120c20', clamp(tx * 1.1 + ty * 0.4, 0, 1)));
  ell(put, X(76), X(53), X(8), X(7), () => H.night);
  put(Math.round(X(72)), Math.round(X(52)), '#52d858'); put(Math.round(X(80)), Math.round(X(52)), '#52d858');
  put(Math.round(X(72)), Math.round(X(51)), '#b0ffb4'); put(Math.round(X(80)), Math.round(X(51)), '#b0ffb4');
  // skeletal hands + sickle
  stroke(put, X(64), X(72), X(52), X(80), X(2.4), () => '#2e2440');
  [[48, 80], [50, 84]].forEach(([bx, by]) => stroke(put, X(52), X(80), X(bx - 2), X(by), X(1.2), () => H.bone));
  stroke(put, X(88), X(72), X(100), X(76), X(2.4), () => '#2e2440');
  stroke(put, X(100), X(76), X(104), X(60), X(1.8), () => H.hornDk); // handle
  for (let a = -0.4; a <= 1.5; a += 0.06) put(Math.round(X(104 + Math.cos(a) * 14)), Math.round(X(56 + Math.sin(a) * 8 - 4)), '#c8d0da'); // sickle blade
  // soul drift off the hem
  soulMote(put, X(52), X(104), X(2.6), 0.45);
}

// 11 SOUL WISP — strays from the river
function drawSoulWisp(put, S) {
  const X = U(S); embers(put, S, 4, 11);
  // river hint at the bottom
  for (let x = 0; x < S; x++) { const yy = 0.82 * S + Math.sin(x / S * 9) * 2; for (let y = yy; y < yy + 0.1 * S; y++) put(x, Math.round(y), mix(H.soulDk, H.night, 0.35 + (y - yy) / (0.1 * S) * 0.4)); }
  [[30, 0.15], [78, 0.05], [124, 0.2]].forEach(([mx, fd]) => soulMote(put, X(mx), X(136), X(3), fd + 0.3));
  // main wisp trio rising
  soulMote(put, X(78), X(66), X(9), 0);
  soulMote(put, X(56), X(88), X(6), 0.2);
  soulMote(put, X(100), X(92), X(5), 0.3);
  // trails back to the river
  [[78, 78, 74, 118], [56, 96, 50, 122], [100, 99, 106, 120]].forEach(([x0, y0, x1, y1]) => {
    for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(X(x0 + (x1 - x0) * t + Math.sin(t * 6) * 3)), Math.round(X(y0 + (y1 - y0) * t)), mix(H.soul, H.night, 0.35 + t * 0.45)); }
  });
  // wailing face on the big one
  ell(put, X(78), X(64), X(1.6), X(2.4), () => H.night); // already has dots; deepen mouth
  ell(put, X(78), X(70), X(2), X(2.6), () => mix(H.night, H.soulDk, 0.3));
}

// 12 CHAIN GAOLER — hooks + drag
function drawGaoler(put, S) {
  const X = U(S); embers(put, S, 5, 12); shadow(put, X(80), X(126), X(26), X(5));
  // heavy robed body
  for (let y = 62; y <= 122; y++) { const t = (y - 62) / 60, w = 14 + t * 10; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#4a3a3a', '#1c1214', clamp(tx * 1.25 + t * 0.25, 0, 1))); }
  // chain harness Xs
  [[58, 70, 102, 112], [102, 70, 58, 112]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 16; i++) { const t = i / 16; if (i % 2 === 0) ell(put, X(x0 + (x1 - x0) * t), X(y0 + (y1 - y0) * t), X(2), X(1.5), () => (i % 4 ? '#5a5e68' : '#8a8e9a')); } });
  // iron mask head
  ell(put, X(80), X(50), X(11), X(11), (tx, ty) => mix('#6a6e7a', '#23262e', clamp(tx * 1.1 + ty * 0.5 - 0.1, 0, 1)));
  row(put, Math.round(X(48)), X(72), X(88), () => '#1a1c22'); // eye slit
  put(Math.round(X(75)), Math.round(X(48)), H.lava); put(Math.round(X(85)), Math.round(X(48)), H.lava);
  [[74, 56], [80, 57], [86, 56]].forEach(([rx, ry]) => put(Math.round(X(rx)), Math.round(X(ry)), '#8a8e9a')); // rivets
  horns(put, X(80), X(42), X(8), '#8a8e9a', '#3a3e48', 0.6);
  // whirling chains w/ hooks
  [[-1, 40, 78], [1, 120, 70]].forEach(([sd, ex, ey]) => {
    for (let i = 0; i <= 14; i++) { const t = i / 14; if (i % 2 === 0) ell(put, X(80 + sd * 20 + (ex - 80 - sd * 20) * t), X(80 + (ey - 80) * t + Math.sin(t * 3.14) * sd * 10), X(2.2), X(1.7), () => (i % 4 ? '#5a5e68' : '#8a8e9a')); }
    // hook
    for (let a = 0; a <= 3.6; a += 0.22) put(Math.round(X(ex + Math.cos(a + sd) * 5)), Math.round(X(ey + Math.sin(a + sd) * 5)), '#b8bcc8');
  });
}

// 13 BANSHEE — scream cone
function drawBanshee(put, S) {
  const X = U(S); embers(put, S, 4, 13);
  // scream rings first (radiating right)
  [[18, 0.35], [27, 0.5], [36, 0.68], [45, 0.8]].forEach(([rr, fd]) => { for (let a = -0.75; a <= 0.75; a += 0.045) put(Math.round(X(96 + Math.cos(a) * rr)), Math.round(X(56 + Math.sin(a) * rr)), mix('#d2f2ff', H.night, fd)); });
  // flowing spirit gown (drifts left)
  for (let y = 48; y <= 118; y++) {
    const t = (y - 48) / 70, w = 8 + t * 15;
    const ox = -Math.sin(t * 2.4) * 10 * t;
    row(put, Math.round(X(y)), X(72 + ox - w), X(72 + ox + w), (tx) => mix('#c2d8e8', '#4a6478', clamp(tx * 1.1 + t * 0.45, 0, 1)));
  }
  // long streaming hair
  for (let k = 0; k < 6; k++) {
    for (let i = 0; i <= 18; i++) { const t = i / 18; put(Math.round(X(70 - k * 2.2 - t * 26 + Math.sin(t * 5 + k) * 3)), Math.round(X(40 + k * 2 + t * 10)), mix('#e8f2fa', H.night, 0.15 + t * 0.5)); }
  }
  // gaunt face mid-wail
  ell(put, X(80), X(46), X(9), X(10), (tx, ty) => mix('#eef6fa', '#8aa2b2', clamp(tx * 1.05 + ty * 0.4 - 0.25, 0, 1)));
  ell(put, X(77), X(43), X(2.2), X(3.2), () => H.night); ell(put, X(85), X(43), X(2.2), X(3.2), () => H.night);
  ell(put, X(82), X(52), X(3.4), X(5), () => H.night); // wide open mouth
  // reaching hand
  stroke(put, X(64), X(66), X(50), X(60), X(2.6), () => '#c2d8e8');
  [[46, 56], [45, 60], [47, 64]].forEach(([fx, fy]) => stroke(put, X(50), X(60), X(fx), X(fy), X(1), () => '#eef6fa'));
}

// 14 LAVA SLIME — magma blob, splits
function drawLavaSlime(put, S) {
  const X = U(S); embers(put, S, 8, 14);
  // molten pool
  ell(put, X(80), X(116), X(32), X(7), (tx, ty) => mix(H.lava, H.lavaDk, clamp(tx + ty * 0.5, 0, 1)));
  // blob w/ crust top + molten core
  ell(put, X(80), X(88), X(26), X(23), (tx, ty) => mix(H.lavaLt, H.lavaDk, clamp(tx * 1.05 + ty * 0.8 - 0.35, 0, 1)));
  for (let y = 66; y <= 80; y++) { const t = (y - 66) / 14, w = Math.sqrt(1 - Math.pow(1 - t, 2)) * 24; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#42242c', '#1e1014', clamp(tx * 1.1, 0, 1))); } // crust cap
  cracks(put, X(80), X(74), X(26), 5, 3);
  // dripping gobs
  [[56, 104, 3], [104, 106, 2.4]].forEach(([gx, gy, gr]) => { ell(put, X(gx), X(gy), X(gr), X(gr * 1.3), (tx, ty) => mix(H.lavaLt, H.lava, ty)); });
  // eyes in the melt
  ell(put, X(72), X(90), X(3), X(4), () => '#42242c'); ell(put, X(90), X(90), X(3), X(4), () => '#42242c');
  put(Math.round(X(71)), Math.round(X(88.6)), H.lavaLt); put(Math.round(X(89)), Math.round(X(88.6)), H.lavaLt);
  // mini-slime already splitting off
  ell(put, X(118), X(108), X(8), X(7), (tx, ty) => mix(H.lavaLt, H.lavaDk, clamp(tx + ty * 0.7 - 0.2, 0, 1)));
  put(Math.round(X(116)), Math.round(X(107)), '#42242c'); put(Math.round(X(121)), Math.round(X(107)), '#42242c');
}

// 15 TORMENTOR — whip-crack zoner
function drawTormentor(put, S) {
  const X = U(S); embers(put, S, 5, 15); shadow(put, X(74), X(126), X(20), X(4));
  // lean purple demon
  [[68, -2], [82, 2]].forEach(([lx, o]) => { stroke(put, X(lx), X(96), X(lx + o), X(112), X(3), () => H.demonPDk); stroke(put, X(lx + o), X(112), X(lx + o - 2), X(124), X(2.6), () => H.demonPDk); }); // digitigrade legs
  for (let y = 62; y <= 98; y++) { const t = (y - 62) / 36, w = 10 - t * 3; row(put, Math.round(X(y)), X(75 - w), X(75 + w), (tx) => mix(H.demonPLt, H.demonPDk, clamp(tx * 1.2 + t * 0.25, 0, 1))); }
  tail(put, X(80), X(98), 1, X(24), H.demonP, H.demonPDk);
  // head: narrow, swept horns
  ell(put, X(75), X(52), X(8.5), X(9), (tx, ty) => mix(H.demonPLt, H.demonPDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)));
  [[-1], [1]].forEach(([sd]) => { for (let i = 0; i <= 8; i++) { const t = i / 8; stroke(put, X(75 + sd * (5 + t * 10)), X(46 - t * 4 + t * t * 6), X(75 + sd * (5 + t * 10)), X(46 - t * 4 + t * t * 6), X(1.8 * (1 - t * 0.6)), () => mix(H.horn, H.hornDk, t)); } });
  put(Math.round(X(71)), Math.round(X(51)), H.felLt); put(Math.round(X(79)), Math.round(X(51)), H.felLt);
  // whip arm cracking overhead — FEL whip in S
  stroke(put, X(84), X(68), X(96), X(56), X(2.6), () => H.demonP);
  let px2 = 96, py2 = 56;
  for (let i = 1; i <= 22; i++) {
    const t = i / 22, nx = 96 + Math.sin(t * 5.2) * 26 + t * 8, ny = 56 - t * 22 + Math.sin(t * 8) * 5;
    stroke(put, X(px2), X(py2), X(nx), X(ny), X(Math.max(1, 2.2 * (1 - t * 0.7))), () => mix(H.fel, H.felLt, (i % 3) * 0.3));
    px2 = nx; py2 = ny;
  }
  lick(put, X(px2), X(py2 - 2), X(4), H.fel, H.felLt); // cracking FEL tip
  // off arm
  stroke(put, X(66), X(68), X(58), X(80), X(2.4), () => H.demonP);
}

// 16 WINGED TERROR — dive bomber
function drawTerror(put, S) {
  const X = U(S); embers(put, S, 5, 16);
  // big spread wings (diving down-forward)
  batWing(put, X(66), X(58), -1, X(26), '#3a2a44', '#180f20');
  batWing(put, X(98), X(58), 1, X(26), '#3a2a44', '#180f20');
  // body plunging head-down
  for (let i = 0; i <= 20; i++) { const t = i / 20; const w = 9 * (1 - t * 0.55); ell(put, X(82 - t * 4), X(58 + t * 34), X(w), X(3), (tx, ty) => mix('#5a4470', '#221530', clamp(tx + t * 0.3, 0, 1))); }
  // head at the bottom w/ gaping maw + horns
  ell(put, X(76), X(98), X(9), X(8), (tx, ty) => mix('#6a5484', '#221530', clamp(tx + ty * 0.5 - 0.1, 0, 1)));
  ell(put, X(74), X(104), X(5), X(3.4), () => '#2a1014');
  [[71], [75], [79]].forEach(([tx2]) => stroke(put, X(tx2), X(102), X(tx2), X(105), X(1), () => H.white));
  put(Math.round(X(72)), Math.round(X(95)), H.lavaLt); put(Math.round(X(80)), Math.round(X(95)), H.lavaLt);
  horns(put, X(76), X(93), X(7), H.horn, H.hornDk, 0.7);
  // talons tucked + dive lines
  [[92, 74], [96, 80]].forEach(([tx2, ty2]) => { stroke(put, X(tx2), X(ty2), X(tx2 + 4), X(ty2 + 6), X(1.6), () => '#3a2a44'); put(Math.round(X(tx2 + 5)), Math.round(X(ty2 + 8)), H.bone); });
  [[52, 30], [66, 24], [84, 22]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + 4), X(ly + 12), X(1), () => mix(H.ash, H.night, 0.45)));
}

// 17 HELL KNIGHT — armored charger
function drawHellKnight(put, S) {
  const X = U(S); embers(put, S, 5, 17); shadow(put, X(78), X(128), X(24), X(5));
  // legs
  [[70], [88]].forEach(([lx]) => { stroke(put, X(lx), X(96), X(lx), X(120), X(5), () => '#2e2430'); ell(put, X(lx + 1), X(124), X(6), X(3.4), (tx, ty) => mix('#5a4a5e', '#1a1220', ty)); });
  // cuirass — black iron w/ lava seams
  for (let y = 62; y <= 98; y++) { const t = (y - 62) / 36, w = 17 - t * 5; row(put, Math.round(X(y)), X(79 - w), X(79 + w), (tx) => mix('#4a3a50', '#16101c', clamp(tx * 1.3 + t * 0.25, 0, 1))); }
  stroke(put, X(79), X(64), X(79), X(96), X(1), () => H.fel); // fel seam
  [[68, 74, 88, 74], [70, 86, 88, 86]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0), X(x1), X(y1), X(0.8), () => mix(H.fel, H.felDk, 0.3)));
  // pauldrons w/ spikes
  [[-1, 60], [1, 98]].forEach(([sd, ax]) => { ell(put, X(ax), X(66), X(9), X(8), (tx, ty) => mix('#5a4a5e', '#1a1220', clamp(tx + ty * 0.5, 0, 1))); stroke(put, X(ax), X(60), X(ax + sd * 4), X(52), X(2), () => H.hornDk); });
  // horned helm w/ lava glow visor
  dome(put, X(79), X(52), X(10), '#5a4a5e', '#38283e', '#16101c');
  row(put, Math.round(X(52)), X(70), X(88), () => H.night);
  row(put, Math.round(X(53)), X(71), X(87), () => H.fel);
  horns(put, X(79), X(44), X(10), H.horn, H.hornDk, 1);
  // greatsword planted, both hands
  stroke(put, X(108), X(38), X(108), X(112), X(3), () => '#b8bcc8');
  stroke(put, X(108), X(38), X(108), X(70), X(1), () => H.fel); // fel fuller
  stroke(put, X(100), X(72), X(116), X(72), X(2.4), () => H.goldDk);
  ell(put, X(108), X(116), X(2.6), X(2.6), () => H.goldDk);
  stroke(put, X(96), X(76), X(106), X(80), X(3.4), () => '#38283e'); // arm to hilt
}

// 18 SIN EATER — soul gobbler elite
function drawSinEater(put, S) {
  const X = U(S); embers(put, S, 5, 18); shadow(put, X(80), X(128), X(32), X(6));
  // bloated body
  ell(put, X(80), X(92), X(30), X(28), (tx, ty) => mix('#a06a48', '#42200e', clamp(tx * 1.1 + ty * 0.6 - 0.25, 0, 1)));
  // BELLY MOUTH — huge, souls swirling in
  ell(put, X(80), X(98), X(18), X(12), () => '#1c0a10');
  for (let a = 0; a < 6.28; a += 0.5) { const tx2 = 80 + Math.cos(a) * 16, ty2 = 98 + Math.sin(a) * 10; stroke(put, X(tx2), X(ty2), X(tx2 - Math.cos(a) * 4), X(ty2 - Math.sin(a) * 3), X(1.6), () => H.white); } // tooth ring
  // souls spiraling into the maw
  for (let i = 0; i <= 26; i++) { const t = i / 26; put(Math.round(X(80 + Math.cos(t * 8) * (30 - t * 26))), Math.round(X(88 + Math.sin(t * 8) * (18 - t * 14))), mix(H.soul, H.night, 0.2 + t * 0.4)); }
  soulMote(put, X(44), X(70), X(4.4), 0.25);
  soulMote(put, X(118), X(76), X(3.6), 0.35);
  // stub arms + squat legs
  stroke(put, X(52), X(80), X(42), X(92), X(4.4), () => '#8a5636');
  stroke(put, X(108), X(80), X(118), X(92), X(4.4), () => '#8a5636');
  stroke(put, X(64), X(116), X(62), X(126), X(4.4), () => '#6a3e20');
  stroke(put, X(96), X(116), X(98), X(126), X(4.4), () => '#6a3e20');
  // tiny head on top, blissful
  ell(put, X(80), X(60), X(9), X(8), (tx, ty) => mix('#b87e54', '#42200e', clamp(tx + ty * 0.5 - 0.15, 0, 1)));
  horns(put, X(80), X(55), X(6), H.horn, H.hornDk, 0.6);
  stroke(put, X(75), X(59), X(78), X(58), X(1), () => H.night); stroke(put, X(82), X(58), X(85), X(59), X(1), () => H.night); // closed happy eyes
  ell(put, X(80), X(63), X(2.4), X(1.4), () => H.night);
}

// 19 FERRY HAND — the boatman's crew
function drawFerryHand(put, S) {
  const X = U(S); embers(put, S, 4, 19);
  // soul river + punt hull
  for (let x = 0; x < S; x++) { const yy = 0.72 * S + Math.sin(x / S * 7) * 2; for (let y = yy; y < Math.min(S, yy + 0.16 * S); y++) put(x, Math.round(y), mix(H.soulDk, H.night, 0.3 + (y - yy) / (0.16 * S) * 0.5)); }
  soulMote(put, X(30), X(124), X(3), 0.4); soulMote(put, X(124), X(128), X(2.6), 0.5);
  for (let x = 40; x <= 124; x++) { const t = (x - 40) / 84; const top = 108 - Math.sin(t * 3.14) * 4; for (let y = top; y <= 118 - Math.abs(t - 0.5) * 8; y++) put(Math.round(X(x)), Math.round(X(y)), mix('#3a2a1a', '#140c06', clamp((y - top) / 10, 0, 1))); }
  // cloaked skeleton standing in the punt
  for (let y = 54; y <= 106; y++) { const t = (y - 54) / 52, w = 8 + t * 8; row(put, Math.round(X(y)), X(72 - w), X(72 + w), (tx) => mix('#4a4038', '#1a140e', clamp(tx * 1.2 + t * 0.3, 0, 1))); }
  // skull under hood
  ell(put, X(72), X(48), X(9), X(9), (tx, ty) => mix('#3a3028', '#140f0a', clamp(tx + ty * 0.4, 0, 1)));
  ell(put, X(72), X(50), X(6), X(5.5), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx + ty * 0.5 - 0.2, 0, 1)));
  put(Math.round(X(70)), Math.round(X(49)), H.soul); put(Math.round(X(75)), Math.round(X(49)), H.soul);
  // pole (oar) planted in the river
  stroke(put, X(94), X(30), X(102), X(122), X(2), () => H.hornDk);
  stroke(put, X(84), X(70), X(95), X(62), X(2), () => H.bone); // bone arm to pole
  stroke(put, X(84), X(60), X(94), X(44), X(2), () => H.bone); // upper hand
  // lantern hanging off the prow — soul-lit
  stroke(put, X(44), X(96), X(38), X(88), X(1.4), () => H.hornDk);
  plate(put, X(34), X(88), X(42), X(98), '#4a4552', '#6a6e7a', '#221f28');
  ell(put, X(38), X(93), X(2.4), X(3), () => H.soulLt);
}

// 20 SOUL SERPENT — surfaces from the river
function drawSoulSerpent(put, S) {
  const X = U(S); embers(put, S, 4, 20);
  // river across the cell
  for (let x = 0; x < S; x++) { const yy = 0.66 * S + Math.sin(x / S * 6) * 2.4; for (let y = yy; y < Math.min(S, yy + 0.22 * S); y++) put(x, Math.round(y), mix(H.soulDk, H.night, 0.28 + (y - yy) / (0.22 * S) * 0.5)); }
  // serpent: two arcs breaking the surface + head rising
  [[34, 62, 20], [76, 58, 16]].forEach(([cx2, cy2, rr], gi) => {
    for (let a = 3.34; a <= 6.08; a += 0.03) {
      const sx2 = cx2 + Math.cos(a) * rr, sy2 = 106 + Math.sin(a) * rr * 0.9;
      stroke(put, X(sx2), X(sy2), X(sx2), X(sy2), X(6 - gi), () => mix('#7ae8d2', '#1e5a50', clamp((Math.cos(a) + 1) / 2 + 0.2, 0, 1)));
    }
  });
  // spectral fins on arcs
  [[26, 84], [40, 82], [72, 86], [84, 86]].forEach(([fx, fy]) => stroke(put, X(fx), X(fy), X(fx + 2), X(fy - 8), X(1.4), () => mix(H.soulLt, H.night, 0.3)));
  // neck + skull-faced head
  for (let i = 0; i <= 16; i++) { const t = i / 16; ell(put, X(108 + Math.sin(t * 1.8) * 8), X(104 - t * 42), X(6 - t * 1.4), X(4), (tx) => mix('#7ae8d2', '#1e5a50', clamp(tx + t * 0.2, 0, 1))); }
  ell(put, X(116), X(56), X(8), X(7), (tx, ty) => mix('#d2fff2', '#3a8a7a', clamp(tx * 0.9 + ty * 0.5 - 0.2, 0, 1)));
  stroke(put, X(122), X(60), X(128), X(63), X(3), () => '#3a8a7a'); // jaw
  put(Math.round(X(113)), Math.round(X(54)), H.night); put(Math.round(X(119)), Math.round(X(54)), H.night); // hollow sockets
  [[124, 58], [127, 60]].forEach(([tx2, ty2]) => put(Math.round(X(tx2)), Math.round(X(ty2)), H.white)); // fangs
  // trapped faces along the body
  [[34, 92], [76, 94]].forEach(([fx, fy]) => { put(Math.round(X(fx - 2)), Math.round(X(fy)), H.night); put(Math.round(X(fx + 2)), Math.round(X(fy)), H.night); ell(put, X(fx), X(fy + 3), X(1.4), X(1.8), () => H.night); });
  // ripples
  [[52, 108], [96, 112]].forEach(([rx, ry]) => { for (let a = 0; a < 6.28; a += 0.2) put(Math.round(X(rx + Math.cos(a) * 8)), Math.round(X(ry + Math.sin(a) * 2.4)), mix(H.soulLt, H.night, 0.55)); });
}

const LIST = [
  { n: 1, name: 'IMP', role: 'pitchfork swarm', draw: drawImp },
  { n: 2, name: 'FIRE IMP', role: 'fireball lobber', draw: drawFireImp },
  { n: 3, name: 'SUCCUBUS', role: 'charm-kiss lure', draw: drawSuccubus },
  { n: 4, name: 'DEMON BRUTE', role: 'fel-cracked slammer', draw: drawBrute },
  { n: 5, name: 'HELLHOUND', role: 'flame-mane pack lunger', draw: drawHound },
  { n: 6, name: 'SKELETON WARRIOR', role: 'sword + shield', draw: drawSkeleton },
  { n: 7, name: 'SKELETON ARCHER', role: 'flaming arrows', draw: drawArcher },
  { n: 8, name: 'GHOUL', role: 'hunched claw lunger', draw: drawGhoul },
  { n: 9, name: 'GHOST', role: 'classic — phases through walls', draw: drawGhost },
  { n: 10, name: 'WRAITH', role: 'hooded sickle spirit', draw: drawWraith },
  { n: 11, name: 'SOUL WISP', role: 'strays from the river', draw: drawSoulWisp },
  { n: 12, name: 'CHAIN GAOLER', role: 'hook chains, drags you', draw: drawGaoler },
  { n: 13, name: 'BANSHEE', role: 'scream cone', draw: drawBanshee },
  { n: 14, name: 'LAVA SLIME', role: 'magma blob, splits', draw: drawLavaSlime },
  { n: 15, name: 'TORMENTOR', role: 'FEL-whip zoner', draw: drawTormentor },
  { n: 16, name: 'WINGED TERROR', role: 'dive bomber', draw: drawTerror },
  { n: 17, name: 'HELL KNIGHT', role: 'fel-forged charger', draw: drawHellKnight },
  { n: 18, name: 'SIN EATER', role: 'belly-maw soul gobbler', draw: drawSinEater },
  { n: 19, name: 'FERRY HAND', role: 'boatman crew, pole strikes', draw: drawFerryHand },
  { n: 20, name: 'SOUL SERPENT', role: 'surfaces from the river', draw: drawSoulSerpent },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'underworld_mob_options.png', title: 'THE UNDERWORLD — MOBS (20 candidates) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
