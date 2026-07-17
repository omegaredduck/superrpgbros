// artdev/underworld/render_hell_decor.js — VICE VERSA hell-side decor:
// full 20-sheet (8 carried over from the mixed sheet + 12 new).
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, plate, dome, optic, shadow, renderSheet, horns, lick, soulMote, cracks, embers } = KIT;
const BASE = require('./render_eternal_decor.js').LIST;

function U(S) { const u = S / 160; return v => v * u; }
const carried = n => BASE.find(e => e.n === n).draw;

// 9 PENTAGRAM CIRCLE — fel summoning ring
function dPentagram(put, S) {
  const X = U(S); embers(put, S, 5, 21);
  // scorched ring on the ground (perspective ellipse)
  for (let a = 0; a < 6.28; a += 0.025) put(Math.round(X(80 + Math.cos(a) * 40)), Math.round(X(92 + Math.sin(a) * 16)), mix(H.fel, H.felDk, (Math.sin(a * 5) + 1) / 2));
  for (let a = 0; a < 6.28; a += 0.03) put(Math.round(X(80 + Math.cos(a) * 34)), Math.round(X(92 + Math.sin(a) * 13.6)), mix(H.fel, H.night, 0.45));
  // star (5 chords)
  for (let k = 0; k < 5; k++) {
    const a0 = -1.5708 + k * 2.513, a1 = -1.5708 + ((k + 2) % 5) * 2.513;
    for (let i = 0; i <= 30; i++) { const t = i / 30; put(Math.round(X(80 + (Math.cos(a0) + (Math.cos(a1) - Math.cos(a0)) * t) * 38)), Math.round(X(92 + (Math.sin(a0) + (Math.sin(a1) - Math.sin(a0)) * t) * 15.2)), H.fel); }
  }
  // candle nubs at the points
  for (let k = 0; k < 5; k++) { const a = -1.5708 + k * 2.513; const cx2 = 80 + Math.cos(a) * 40, cy2 = 92 + Math.sin(a) * 16; stroke(put, X(cx2), X(cy2 - 4), X(cx2), X(cy2), X(2), () => '#2a1a20'); lick(put, X(cx2), X(cy2 - 7), X(3), H.fel, H.felLt); }
  // something rising in the middle
  for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(X(80 + Math.sin(t * 6) * 3)), Math.round(X(88 - t * 26)), mix(H.fel, H.night, 0.25 + t * 0.5)); }
  ell(put, X(80), X(58), X(3), X(3.4), () => mix(H.felLt, H.fel, 0.4));
}

// 10 BONE FENCE — destructible (global fence rule)
function dBoneFence(put, S) {
  const X = U(S); embers(put, S, 4, 22); shadow(put, X(80), X(122), X(40), X(4));
  // femur posts + rib rails
  [[36], [80], [124]].forEach(([px2]) => {
    stroke(put, X(px2), X(78), X(px2), X(118), X(3), () => H.bone);
    ell(put, X(px2 - 2), X(76), X(3), X(2.6), () => H.boneDk); ell(put, X(px2 + 2), X(76), X(3), X(2.6), () => H.boneDk); // knob top
    ell(put, X(px2), X(120), X(4), X(2), () => H.boneDk);
  });
  // rails: curved ribs
  [[88], [104]].forEach(([ry]) => {
    for (let x = 36; x <= 124; x++) put(Math.round(X(x)), Math.round(X(ry + Math.sin((x - 36) / 88 * 6.28) * 3)), mix(H.bone, H.boneDk, ((x / 6 | 0) % 2) * 0.4));
  });
  // skull on the center post + crack (deterioration preview)
  ell(put, X(80), X(70), X(5.5), X(5), (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
  ell(put, X(78), X(69), X(1.4), X(1.8), () => H.night); ell(put, X(82), X(69), X(1.4), X(1.8), () => H.night);
  stroke(put, X(118), X(84), X(112), X(96), X(0.8), () => H.boneDk); // crack in rail
}

// 11 BURNING DEAD TREE
function dBurnTree(put, S) {
  const X = U(S); embers(put, S, 9, 23); shadow(put, X(80), X(124), X(22), X(4));
  // twisted dead trunk
  for (let i = 0; i <= 26; i++) { const t = i / 26; const tx2 = 80 + Math.sin(t * 3.6) * 7; stroke(put, X(tx2), X(120 - t * 56), X(tx2), X(120 - t * 56), X(5.5 - t * 3.4), () => mix('#3a2820', '#140c08', t * 0.3 + 0.2)); }
  // clawing branches
  [[76, 76, 54, 52], [84, 70, 108, 44], [80, 88, 104, 74], [78, 92, 52, 82]].forEach(([x0, y0, x1, y1]) => {
    stroke(put, X(x0), X(y0), X(x1), X(y1), X(2.2), () => '#241610');
    stroke(put, X(x1), X(y1), X(x1 + (x1 > 80 ? 6 : -6)), X(y1 - 6), X(1.4), () => '#180e0a');
  });
  // fire eating the crown
  lick(put, X(54), X(46), X(6), H.lava, H.lavaLt);
  lick(put, X(84), X(56), X(8), H.lava, H.lavaLt);
  lick(put, X(108), X(40), X(7), H.ember, H.lavaLt);
  lick(put, X(70), X(60), X(5), H.lava, H.lavaLt);
  // glowing scar line up the trunk
  for (let i = 0; i <= 18; i++) { const t = i / 18; put(Math.round(X(80 + Math.sin(t * 3.6) * 7)), Math.round(X(118 - t * 52)), mix(H.lava, H.lavaDk, (i % 3) / 3)); }
}

// 12 HELLMOUTH PIT — hands reaching out
function dPit(put, S) {
  const X = U(S); embers(put, S, 5, 24);
  // pit hole
  ell(put, X(80), X(96), X(34), X(15), (tx, ty) => mix('#2a0a10', '#0a0204', clamp(tx * 0.6 + ty * 0.8, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 35)), Math.round(X(96 + Math.sin(a) * 15.6)), mix(H.rockLt, H.rockDk, (Math.sin(a * 4) + 1) / 2));
  // inner glow ring
  for (let a = 0; a < 6.28; a += 0.07) put(Math.round(X(80 + Math.cos(a) * 26)), Math.round(X(96 + Math.sin(a) * 11)), mix(H.lava, H.night, 0.5));
  // desperate hands reaching from inside
  [[62, 90, -0.3], [80, 86, 0], [98, 92, 0.3]].forEach(([hx, hy, lean]) => {
    stroke(put, X(hx), X(hy + 8), X(hx + lean * 10), X(hy - 6), X(2.6), () => mix(H.demonDk, H.night, 0.2));
    // fingers
    for (let f = -2; f <= 2; f++) stroke(put, X(hx + lean * 10), X(hy - 6), X(hx + lean * 10 + f * 2.2), X(hy - 12 - Math.abs(f) * -1), X(1.1), () => H.demonDk);
  });
  // one hand grips the rim
  [[46, 88], [50, 86], [54, 87]].forEach(([fx, fy]) => stroke(put, X(fx), X(fy + 4), X(fx), X(fy), X(1.4), () => H.demon));
  soulMote(put, X(108), X(72), X(2.6), 0.4);
}

// 13 DEMON THRONE
function dThrone(put, S) {
  const X = U(S); embers(put, S, 5, 25); shadow(put, X(80), X(126), X(26), X(5));
  // dais steps
  plate(put, X(48), X(114), X(112), X(122), H.obsid, H.obsidLt, H.obsidDk);
  plate(put, X(56), X(106), X(104), X(114), H.obsid, H.obsidLt, H.obsidDk);
  // seat + high back w/ horn finials
  plate(put, X(64), X(84), X(96), X(106), '#2a1a2e', '#44304a', '#140c18');
  for (let y = 40; y <= 84; y++) { const t = (y - 40) / 44; const w = 14 + Math.sin(t * 2.8) * 3; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix('#3a2440', '#160c1c', clamp(tx * 1.3 + t * 0.15, 0, 1))); }
  horns(put, X(80), X(40), X(14), H.hornDk, '#2a1e0e', 1.25);
  // skull crest + fel gems
  ell(put, X(80), X(48), X(5), X(4.6), (tx, ty) => mix('#f2ecd8', H.boneDk, tx + ty * 0.3));
  put(Math.round(X(78)), Math.round(X(47)), H.fel); put(Math.round(X(82)), Math.round(X(47)), H.fel);
  [[68, 62], [92, 62]].forEach(([gx, gy]) => { ell(put, X(gx), X(gy), X(2), X(2.4), () => H.fel); put(Math.round(X(gx)), Math.round(X(gy - 1)), H.felLt); });
  // armrests w/ claw ends
  stroke(put, X(62), X(84), X(58), X(98), X(3.4), () => '#2a1a2e');
  stroke(put, X(98), X(84), X(102), X(98), X(3.4), () => '#2a1a2e');
  [[56, 100], [104, 100]].forEach(([cx2, cy2]) => { for (let f = -1; f <= 1; f++) stroke(put, X(cx2), X(cy2), X(cx2 + f * 2.4), X(cy2 + 5), X(1.2), () => H.hornDk); });
}

// 14 IMPALED SPIKES
function dSpikes(put, S) {
  const X = U(S); embers(put, S, 5, 26); shadow(put, X(80), X(124), X(34), X(5));
  // cluster of angled iron spikes
  [[48, 118, 40, 54, 3], [68, 120, 66, 42, 3.4], [90, 120, 96, 48, 3.2], [110, 118, 120, 60, 2.8], [80, 122, 82, 66, 2.4]].forEach(([x0, y0, x1, y1, w]) => {
    stroke(put, X(x0), X(y0), X(x1), X(y1), X(w), () => mix(H.iron, H.ironDk, 0.3));
    stroke(put, X((x0 + x1) / 2), X((y0 + y1) / 2), X(x1), X(y1), X(w * 0.5), () => '#6a6e7a');
    put(Math.round(X(x1)), Math.round(X(y1)), '#b8bcc8');
  });
  // rocky base mound
  ell(put, X(80), X(118), X(34), X(8), (tx, ty) => mix(H.rockLt, H.rockDk, clamp(tx + ty * 0.5, 0, 1)));
  // skulls + helmet trophies on two spikes
  ell(put, X(66), X(52), X(5), X(4.6), (tx, ty) => mix('#f2ecd8', H.boneDk, tx + ty * 0.3));
  ell(put, X(64), X(51), X(1.3), X(1.6), () => H.night); ell(put, X(68.5), X(51), X(1.3), X(1.6), () => H.night);
  dome(put, X(96), X(56), X(5), '#8a92a2', '#4a4e5c', '#23262e'); // dented helm
  stroke(put, X(92), X(58), X(100), X(58), X(1), () => '#23262e');
  // crows? no — embers drifting
  put(Math.round(X(52)), Math.round(X(40)), H.ember);
}

// 15 CROOKED GRAVES
function dGraves(put, S) {
  const X = U(S); embers(put, S, 4, 27);
  // mounds
  [[52, 108, 16], [92, 112, 18], [124, 106, 12]].forEach(([mx, my, mw]) => ell(put, X(mx), X(my), X(mw), X(5), (tx, ty) => mix('#3a2a24', '#180f0c', tx + ty * 0.4)));
  // crooked headstones (one cross, one slab, one broken)
  // slab
  for (let y = 74; y <= 104; y++) { const o = (y - 74) * 0.22; row(put, Math.round(X(y)), X(44 + o), X(62 + o), (tx) => mix(H.ash, H.ashDk, clamp(tx * 1.2 + (y - 74) / 44, 0, 1))); }
  for (let a = 3.14; a <= 6.28; a += 0.1) put(Math.round(X(53 + Math.cos(a) * 9)), Math.round(X(74 + Math.sin(a) * 6)), H.ashDk);
  [[48, 84], [50, 90]].forEach(([lx, ly]) => stroke(put, X(lx + 2), X(ly), X(lx + 10), X(ly), X(0.8), () => H.ashDk)); // illegible lines
  // cross (leaning hard)
  stroke(put, X(88), X(112), X(96), X(70), X(3), () => '#4a3a2a');
  stroke(put, X(86), X(82), X(104), X(78), X(2.6), () => '#4a3a2a');
  // broken stub + fallen top
  for (let y = 92; y <= 106; y++) row(put, Math.round(X(y)), X(118), X(132), (tx) => mix(H.ash, H.ashDk, tx));
  stroke(put, X(118), X(92), X(132), X(88), X(1.2), () => H.ashDk); // jagged break
  for (let y = 112; y <= 118; y++) row(put, Math.round(X(y)), X(128), X(142), (tx) => mix(H.ashDk, '#241f28', tx));
  // a hand out of the center mound + soul leaving
  for (let f = -2; f <= 2; f++) stroke(put, X(92), X(106), X(92 + f * 2.2), X(99), X(1.1), () => '#8aa07a');
  soulMote(put, X(104), X(84), X(2.6), 0.4);
}

// 16 CHAINED COFFIN — upright, rattling
function dCoffin(put, S) {
  const X = U(S); embers(put, S, 5, 28); shadow(put, X(80), X(126), X(20), X(4));
  // hexagonal coffin standing up
  const prof = [[36, 8], [48, 13], [72, 15], [116, 10], [122, 8]];
  for (let y = 36; y <= 122; y++) {
    let w = 8;
    for (let i = 0; i < prof.length - 1; i++) { const [y0, w0] = prof[i], [y1, w1] = prof[i + 1]; if (y >= y0 && y <= y1) w = w0 + (w1 - w0) * (y - y0) / (y1 - y0); }
    row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix('#4a2a3a', '#1a0c14', clamp(tx * 1.3 + (y - 36) / 130, 0, 1)));
  }
  stroke(put, X(78), X(38), X(78), X(120), X(1), () => '#12060c'); // lid seam
  // chains wrapped (two diagonals w/ padlock)
  [[62, 56, 94, 70], [62, 92, 94, 78]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 14; i++) { const t = i / 14; if (i % 2 === 0) ell(put, X(x0 + (x1 - x0) * t), X(y0 + (y1 - y0) * t), X(2.2), X(1.7), () => (i % 4 ? '#5a5e68' : '#8a8e9a')); } });
  plate(put, X(73), X(70), X(83), X(80), H.gold, H.goldLt, H.goldDk);
  put(Math.round(X(78)), Math.round(X(74)), H.night);
  // rattle lines + one plank sprung w/ fel light
  [[58, 48], [98, 52], [58, 100], [98, 96]].forEach(([rx, ry]) => stroke(put, X(rx), X(ry), X(rx + (rx < 78 ? -4 : 4)), X(ry), X(1), () => mix(H.ash, H.night, 0.5)));
  stroke(put, X(84), X(44), X(88), X(40), X(1.4), () => H.fel);
  put(Math.round(X(89)), Math.round(X(39)), H.felLt);
}

// 17 WAR DRUM
function dDrum(put, S) {
  const X = U(S); embers(put, S, 5, 29); shadow(put, X(80), X(126), X(26), X(5));
  // big skin drum on clawed legs
  [[60, 122], [100, 122], [80, 125]].forEach(([lx, ly]) => stroke(put, X(80), X(108), X(lx), X(ly), X(2.6), () => H.ironDk));
  for (let y = 86; y <= 112; y++) row(put, Math.round(X(y)), X(52), X(108), (tx) => mix('#5a2a20', '#200c08', clamp(tx * 1.25 + (y - 86) / 40, 0, 1)));
  ell(put, X(80), X(86), X(28), X(8), (tx, ty) => mix('#d8c8a8', '#8a7a5a', clamp(tx + ty * 0.6, 0, 1))); // hide head
  // lacing Xs around the shell
  for (let x = 54; x <= 106; x += 8) { stroke(put, X(x), X(90), X(x + 4), X(108), X(1), () => '#c8a878'); stroke(put, X(x + 4), X(90), X(x), X(108), X(1), () => '#c8a878'); }
  // bone beaters crossed on top + impact ring
  stroke(put, X(64), X(70), X(88, 84) || X(88), X(84), X(2.2), () => H.bone);
  stroke(put, X(96), X(70), X(72), X(84), X(2.2), () => H.bone);
  ell(put, X(63), X(68), X(3), X(3), () => H.boneDk); ell(put, X(97), X(68), X(3), X(3), () => H.boneDk);
  for (let a = 0; a < 6.28; a += 0.14) put(Math.round(X(80 + Math.cos(a) * 14)), Math.round(X(86 + Math.sin(a) * 3.4)), mix(H.lava, H.night, 0.5));
  // fel sigil on the shell
  for (let a = 0; a < 6.28; a += 0.16) put(Math.round(X(80 + Math.cos(a) * 6)), Math.round(X(100 + Math.sin(a) * 6)), H.fel);
}

// 18 MAGMA POOL
function dMagma(put, S) {
  const X = U(S); embers(put, S, 8, 30);
  // irregular pool
  for (let y = 84; y <= 122; y++) {
    const t = (y - 84) / 38;
    const w = (30 + Math.sin(y * 0.5) * 5) * Math.sin(t * 3.14);
    row(put, Math.round(X(y)), X(78 - w), X(78 + w), (tx) => mix(H.lavaLt, H.lava, clamp(Math.abs(tx - 0.5) * 1.6 + t * 0.2, 0, 1)));
  }
  // crust islands + rim
  [[64, 100, 7], [92, 108, 6], [80, 94, 4]].forEach(([ix, iy, ir]) => ell(put, X(ix), X(iy), X(ir), X(ir * 0.5), (tx, ty) => mix('#42242c', '#1e1014', tx + ty * 0.4)));
  for (let a = 0; a < 6.28; a += 0.09) { const rr = 30 + Math.sin(a * 4) * 5; put(Math.round(X(78 + Math.cos(a) * rr)), Math.round(X(103 + Math.sin(a) * rr * 0.62)), mix(H.rock, H.rockDk, (Math.sin(a * 3) + 1) / 2)); }
  // bubbles + pops
  [[70, 106], [88, 100], [96, 112]].forEach(([bx, by]) => { for (let a = 0; a < 6.28; a += 0.4) put(Math.round(X(bx + Math.cos(a) * 3)), Math.round(X(by + Math.sin(a) * 1.6)), H.lavaLt); });
  lick(put, X(64), X(94), X(4), H.lava, H.lavaLt);
}

// 19 WEAPON RACK — hell armory
function dRack(put, S) {
  const X = U(S); embers(put, S, 4, 31); shadow(put, X(80), X(124), X(30), X(4));
  // A-frame rack
  stroke(put, X(48), X(122), X(60), X(60), X(3), () => '#3a2418');
  stroke(put, X(112), X(122), X(100), X(60), X(3), () => '#3a2418');
  stroke(put, X(56), X(64), X(104), X(64), X(2.6), () => '#241610');
  stroke(put, X(50), X(100), X(110), X(100), X(2.2), () => '#241610');
  // leaning weapons: cleaver, trident, axe, scythe
  stroke(put, X(62), X(118), X(66), X(56), X(2), () => H.ironDk); // trident haft
  [[62, 50], [66, 46], [70, 50]].forEach(([px2, py2]) => stroke(put, X(66), X(56), X(px2), X(py2), X(1.4), () => H.iron));
  stroke(put, X(80), X(118), X(80), X(58), X(2), () => '#3a2a18'); // axe haft
  for (let a = -0.5; a <= 0.5; a += 0.08) put(Math.round(X(80 + Math.cos(a) * 10)), Math.round(X(60 + Math.sin(a) * 8)), '#8a92a2');
  ell(put, X(87), X(60), X(4), X(6), (tx) => mix('#b8bcc8', '#4a4e5c', tx));
  stroke(put, X(96), X(118), X(94), X(52), X(2), () => '#241610'); // scythe
  for (let a = -0.3; a <= 1.3; a += 0.06) put(Math.round(X(94 + Math.cos(a) * 13)), Math.round(X(50 + Math.sin(a) * 6)), '#c8d0da');
  // shield leaning at the base w/ fel sigil
  ell(put, X(52), X(110), X(9), X(11), (tx, ty) => mix('#5a2a20', '#200c08', clamp(tx + ty * 0.4, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.2) put(Math.round(X(52 + Math.cos(a) * 4)), Math.round(X(110 + Math.sin(a) * 5)), H.fel);
}

// 20 EMBER SWARM ROOST — bat-nest stack
function dRoost(put, S) {
  const X = U(S); embers(put, S, 7, 32); shadow(put, X(80), X(126), X(20), X(4));
  // hanging rock finger from cell top
  for (let y = 0; y <= 56; y++) { const t = y / 56; const w = 16 * (1 - t * 0.75) + Math.sin(y * 0.6) * 1.4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(H.rockLt, H.rockDk, clamp(tx * 1.3 + t * 0.2, 0, 1))); }
  // bats hanging (folded teardrops)
  [[68, 40], [80, 52], [92, 42], [74, 58]].forEach(([bx, by]) => {
    ell(put, X(bx), X(by + 3), X(3), X(4.4), (tx, ty) => mix('#3a2a44', '#140c1c', tx + ty * 0.3));
    stroke(put, X(bx), X(by - 1), X(bx), X(by + 1), X(1), () => '#140c1c');
    put(Math.round(X(bx - 1)), Math.round(X(by + 2)), H.lava); put(Math.round(X(bx + 1)), Math.round(X(by + 2)), H.lava);
  });
  // one taking off
  ell(put, X(112), X(70), X(3), X(2.6), () => '#3a2a44');
  stroke(put, X(109), X(70), X(102), X(64), X(1.4), () => '#241830');
  stroke(put, X(115), X(70), X(122), X(64), X(1.4), () => '#241830');
  // guano-splattered rock + bones below
  ell(put, X(80), X(120), X(18), X(6), (tx, ty) => mix(H.rockLt, H.rockDk, tx + ty * 0.4));
  [[72, 116], [86, 114]].forEach(([gx, gy]) => put(Math.round(X(gx)), Math.round(X(gy)), '#c8c2b0'));
  stroke(put, X(92), X(120), X(100), X(118), X(1.6), () => H.bone);
}

const LIST = [
  { n: 1, name: 'BONE PILE', role: 'skull mound', draw: carried(1) },
  { n: 2, name: 'OBSIDIAN SPIRE', role: 'fel-veined glass rock', draw: carried(2) },
  { n: 3, name: 'LAVA GEYSER', role: 'erupting vent', draw: carried(3) },
  { n: 4, name: 'SOUL CAGE', role: 'hanging gibbet, souls inside', draw: carried(4) },
  { n: 5, name: 'BRIMSTONE ARCH', role: 'horned gateway', draw: carried(5) },
  { n: 6, name: 'HELL BANNER', role: 'torn, fel sigil', draw: carried(6) },
  { n: 7, name: 'GARGOYLE IDOL', role: 'fire-mouth shrine', draw: carried(7) },
  { n: 8, name: 'SKULL BRAZIER', role: 'flaming skull bowl', draw: carried(8) },
  { n: 9, name: 'PENTAGRAM CIRCLE', role: 'fel summoning ring', draw: dPentagram },
  { n: 10, name: 'BONE FENCE', role: 'DESTRUCTIBLE (global rule)', draw: dBoneFence },
  { n: 11, name: 'BURNING DEAD TREE', role: 'clawing, aflame', draw: dBurnTree },
  { n: 12, name: 'HELLMOUTH PIT', role: 'hands reach from it', draw: dPit },
  { n: 13, name: 'DEMON THRONE', role: 'horned obsidian seat', draw: dThrone },
  { n: 14, name: 'IMPALED SPIKES', role: 'trophy spikes', draw: dSpikes },
  { n: 15, name: 'CROOKED GRAVES', role: 'mounds + hand out', draw: dGraves },
  { n: 16, name: 'CHAINED COFFIN', role: 'upright, rattling', draw: dCoffin },
  { n: 17, name: 'WAR DRUM', role: 'bone beaters, fel sigil', draw: dDrum },
  { n: 18, name: 'MAGMA POOL', role: 'crusted, bubbling', draw: dMagma },
  { n: 19, name: 'WEAPON RACK', role: 'hell armory', draw: dRack },
  { n: 20, name: 'BAT ROOST', role: 'hanging rock + bats', draw: dRoost },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'hell_decor_options.png', title: 'VICE VERSA — HELL SIDE DECOR (20) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
