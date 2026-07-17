// artdev/neon/render_neon_hacker.js — TECHNO KID HACKER, 10 work-ups.
// New boss concept: aircraft crashes onto the helipad, the kid steps off.
// Parameterized kid-proportioned humanoid (big head, short frame) with
// swappable hair/hood/hat, eyewear, jacket, device, companion, aura.
'use strict';
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, plate, optic, shadow, renderSheet, glow, visor, rain, glitchBar } = KIT;

// ---------------------------------------------------------------- hacker
// p: skin, hairC, hairStyle: 'spike'|'dreads'|'messy'|'buzz'|'none'
//    hood: 'up'|'down'|null, cap: 'back'|null, phones: bool
//    eyes: 'goggles'|'visor'|'mask'|'mono'|'plain', eyeC
//    jak, jakLt, jakDk (jacket), pants, shoeLED, acc, accLt
//    device: 'deck'|'wristholo'|'tablet'|'keys'|null
//    companion: 'drone'|'rat'|null, pack: 'antenna'|'flat'|null
//    aura: 'glitch'|'panels'|'code'|null, poncho: bool, vest: bool
function hacker(put, S, p) {
  p = p || {};
  const u = S / 160, X = v => v * u;
  const skin = p.skin || N.skin;
  const skinDk = mix(skin, '#000000', 0.3);
  const jak = p.jak || '#2e2a48';
  const jakLt = p.jakLt || mix(jak, '#ffffff', 0.28);
  const jakDk = p.jakDk || mix(jak, '#000000', 0.42);
  const pants = p.pants || '#23283a';
  const acc = p.acc || N.cyan, accLt = p.accLt || N.cyanLt;
  const led = p.shoeLED || acc;

  // ---- AURA behind everything
  if (p.aura === 'glitch') {
    glitchBar(put, X(80), X(38), X(30), mix(acc, N.night, 0.45), mix(N.pink, N.night, 0.5));
    glitchBar(put, X(80), X(84), X(34), mix(N.pink, N.night, 0.5), mix(acc, N.night, 0.45));
    glitchBar(put, X(80), X(118), X(28), mix(acc, N.night, 0.5), mix(N.purple, N.night, 0.5));
  } else if (p.aura === 'panels') {
    [[38, 58, -1], [122, 58, 1]].forEach(([px2, py2, sd]) => {
      for (let y = -14; y <= 14; y++) row(put, Math.round(X(py2 + y)), X(px2 - 8 + sd * y * 0.28), X(px2 + 8 + sd * y * 0.28), (tx) => mix(mix(acc, N.night, 0.55), mix(acc, N.night, 0.8), tx));
      stroke(put, X(px2 - 8 - sd * 4), X(py2 - 14 * 1), X(px2 + 8 - sd * 4), X(py2 - 14), X(0.8), () => accLt);
    });
  } else if (p.aura === 'code') {
    for (let i = 0; i < 12; i++) {
      const cx2 = 26 + (i * 37) % 110, cy2 = 20 + (i * 53) % 100;
      put(Math.round(X(cx2)), Math.round(X(cy2)), mix(N.green, N.night, 0.35));
      put(Math.round(X(cx2)), Math.round(X(cy2 + 2)), mix(N.green, N.night, 0.6));
    }
  }

  shadow(put, X(80), X(140), X(26), X(5));

  // ---- COMPANION
  if (p.companion === 'drone') {
    // quad drone hovering left
    ell(put, X(34), X(40), X(7), X(3.4), (tx, ty) => mix('#4a5264', '#161a22', clamp(tx * 0.5 + ty * 0.8, 0, 1)));
    [[-8, -3], [8, -3]].forEach(([ox, oy]) => {
      row(put, Math.round(X(40 + oy)), X(34 + ox - 5), X(34 + ox + 5), () => mix('#828a9a', N.night, 0.55));
      put(Math.round(X(34 + ox)), Math.round(X(40 + oy)), '#20242e');
    });
    optic(put, X(34), X(41.5), X(1.6), '#0a0c10', acc, accLt);
    glow(put, X(34), X(45), X(34), X(45), 0.8, acc, accLt);
  } else if (p.companion === 'rat') {
    // cyber rat at his feet (ties to CYBER RATS mob)
    ell(put, X(112), X(135), X(8), X(4), (tx, ty) => mix('#4a4456', '#1c1824', clamp(tx * 0.6 + ty * 0.7, 0, 1)));
    ell(put, X(121), X(133), X(3.4), X(2.8), (tx, ty) => mix('#5a5468', '#241e2e', ty));
    put(Math.round(X(123)), Math.round(X(132)), N.redN);
    stroke(put, X(104), X(135), X(96), X(131), X(1), () => mix(acc, N.night, 0.3)); // glow tail
    put(Math.round(X(120)), Math.round(X(129.5)), '#5a5468'); // ear
  }

  // ---- LEGS + SNEAKERS (kid stance, slightly apart)
  [[72, -1], [88, 1]].forEach(([lx, sd]) => {
    for (let y = 100; y <= 128; y++) {
      const t = (y - 100) / 28;
      const w = 5.2 - t * 1.2;
      row(put, Math.round(X(y)), X(lx - w + sd * t * 1.5), X(lx + w + sd * t * 1.5), (tx) => mix(mix(pants, '#ffffff', 0.16), mix(pants, '#000000', 0.4), clamp(tx * 1.3 + t * 0.3, 0, 1)));
    }
    // chunky LED sneaker
    const sx = lx + sd * 1.5;
    ell(put, X(sx + sd * 2), X(133), X(8), X(4.4), (tx, ty) => mix('#e8ecf4', '#8a92a2', clamp(ty * 1.5 - 0.2, 0, 1)));
    row(put, Math.round(X(136.5)), X(sx - 6 + sd * 2), X(sx + 6 + sd * 2), () => '#20242e'); // sole
    glow(put, X(sx - 5 + sd * 2), X(135.4), X(sx + 5 + sd * 2), X(135.4), 0.9, led, mix(led, '#ffffff', 0.5));
    put(Math.round(X(sx - sd * 2)), Math.round(X(131)), '#20242e'); // lace patch
  });

  // ---- TORSO (oversized jacket / poncho / vest)
  if (p.poncho) {
    for (let y = 62; y <= 104; y++) {
      const t = (y - 62) / 42, w = 10 + t * 15;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(jakLt, jakDk, clamp(tx * 1.2 + t * 0.25, 0, 1)));
    }
    // circuit traces on the poncho
    [[70, 78, 92], [64, 96, 84], [96, 88, 100]].forEach(([x0, y0, x1]) => {
      stroke(put, X(x0), X(y0), X(x1), X(y0), X(0.9), () => mix(acc, jak, 0.25));
      stroke(put, X(x1), X(y0), X(x1), X(y0 + 7), X(0.9), () => mix(acc, jak, 0.25));
      put(Math.round(X(x1)), Math.round(X(y0 + 8)), accLt);
    });
    row(put, Math.round(X(104)), X(55), X(105), () => jakDk); // hem
  } else {
    // oversized jacket body
    for (let y = 62; y <= 102; y++) {
      const t = (y - 62) / 40, w = 12 + Math.sin(t * 3.14) * 3.4;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (tx) => mix(jakLt, jakDk, clamp(tx * 1.35 + t * 0.2, 0, 1)));
    }
    // zip + collar
    stroke(put, X(80), X(64), X(80), X(100), X(1), () => jakDk);
    put(Math.round(X(80)), Math.round(X(98)), acc);
    row(put, Math.round(X(63)), X(72), X(88), () => jakDk);
    if (p.vest) { // tech vest over jacket
      plate(put, X(70), X(66), X(90), X(88), '#20242e', '#3a4050', '#0c0e14');
      [[74, 72], [86, 72], [74, 82], [86, 82]].forEach(([vx, vy]) => plate(put, X(vx - 3), X(vy - 2.6), X(vx + 3), X(vy + 2.6), '#2c3242', '#495064', '#10141c'));
      put(Math.round(X(80)), Math.round(X(69)), acc);
    }
    // chest LED strip
    glow(put, X(72), X(90), X(88), X(90), 0.8, acc, accLt);
    // ARMS (jacket sleeves, hands in half-fist)
    [[-1, 64], [1, 96]].forEach(([sd, ax]) => {
      const x0 = 80 + sd * 13;
      stroke(put, X(x0), X(68), X(x0 + sd * 5), X(92), X(4.6), () => mix(jak, jakDk, 0.25));
      stroke(put, X(x0 + sd * 1), X(70), X(x0 + sd * 5), X(86), X(1.6), () => jakLt);
      ell(put, X(x0 + sd * 5.5), X(95), X(3), X(3), (tx, ty) => mix(skin, skinDk, ty)); // hand
    });
  }

  // ---- BACKPACK rig
  if (p.pack === 'antenna') {
    plate(put, X(94), X(66), X(103), X(90), '#2a3040', '#485068', '#10141e');
    stroke(put, X(100), X(66), X(104), X(40), X(1.2), () => '#6a7284');
    put(Math.round(X(104)), Math.round(X(38.5)), N.redN);
    glow(put, X(104), X(38.5), X(104), X(38.5), 0.8, N.redN, N.redNLt);
    [[70, 0], [78, 1], [86, 0]].forEach(([py2, on]) => put(Math.round(X(97)), Math.round(X(py2)), on ? acc : mix(acc, N.night, 0.6)));
  } else if (p.pack === 'flat') {
    plate(put, X(93), X(68), X(100), X(92), jakDk, mix(jakDk, '#ffffff', 0.2), '#0a0c12');
    stroke(put, X(96.5), X(70), X(96.5), X(90), X(0.9), () => mix(acc, jakDk, 0.3));
  }

  // ---- DEVICE
  if (p.device === 'deck') {
    // handheld cyberdeck held in front, both hands
    plate(put, X(66), X(92), X(94), X(102), '#20242e', '#3c4454', '#0a0c12');
    for (let gy = 94; gy <= 99; gy += 2.4) row(put, Math.round(X(gy)), X(69), X(91), (tx) => (((tx * 9) | 0) % 2) ? mix(acc, '#20242e', 0.35) : '#181c26');
    glow(put, X(68), X(93), X(92), X(93), 0.7, acc, accLt);
    ell(put, X(64), X(97), X(3), X(3), (tx, ty) => mix(skin, skinDk, ty));
    ell(put, X(96), X(97), X(3), X(3), (tx, ty) => mix(skin, skinDk, ty));
  } else if (p.device === 'wristholo') {
    // holo screen projected off the left wrist
    ell(put, X(63), X(93), X(3.2), X(3.2), (tx, ty) => mix(skin, skinDk, ty));
    plate(put, X(59), X(89), X(67), X(93), '#20242e', '#3c4454', '#0a0c12');
    for (let y = 70; y <= 86; y++) {
      const t = (y - 70) / 16;
      row(put, Math.round(X(y)), X(42 + t * 6), X(62 + t * 2), (tx) => mix(mix(acc, N.night, 0.35), mix(acc, N.night, 0.72), (tx * 5 | 0) % 2 ? 0.3 : 0.9));
    }
    stroke(put, X(42), X(70), X(62), X(70), X(0.8), () => accLt);
    stroke(put, X(62), X(89), X(58), X(87), X(0.8), () => mix(accLt, N.night, 0.3));
  } else if (p.device === 'tablet') {
    // big tablet under right arm
    plate(put, X(94), X(78), X(112), X(104), '#1a1e28', '#343c4c', '#080a10');
    plate(put, X(96.5), X(80.5), X(109.5), X(101.5), mix(acc, N.night, 0.6), mix(acc, N.night, 0.4), mix(acc, N.night, 0.8));
    glitchBar(put, X(103), X(88), X(6), mix(accLt, N.night, 0.2), mix(N.pink, N.night, 0.4));
  } else if (p.device === 'keys') {
    // floating holo keyboards both sides
    [[-1, 52], [1, 108]].forEach(([sd, kx]) => {
      for (let y = 92; y <= 100; y++) {
        const t = (y - 92) / 8;
        row(put, Math.round(X(y)), X(kx - 10 - sd * t * 3), X(kx + 10 - sd * t * 3), (tx) => ((tx * 7 | 0) % 2) ? mix(acc, N.night, 0.45) : mix(acc, N.night, 0.75));
      }
      stroke(put, X(kx - 10 - sd * 0), X(92), X(kx + 10), X(92), X(0.7), () => accLt);
    });
  }

  // ---- HEAD GROUP — sits ON the shoulders, hulk style, NO NECK:
  // the whole head/hair/eyewear group is drawn through a put shifted
  // down so the chin buries into the collar (head drawn after torso).
  const headGroup = (put) => {
  // ---- HEAD (big kid head)
  ell(put, X(80), X(44), X(15), X(15.5), (tx, ty) => mix(skin, skinDk, clamp(tx * 0.9 + ty * 0.55 - 0.25, 0, 1)));
  // ears
  if (!p.phones && p.hood !== 'up') { ell(put, X(65), X(46), X(2), X(3), () => skinDk); ell(put, X(95), X(46), X(2), X(3), () => skinDk); }
  // grin (cocky kid)
  stroke(put, X(74), X(53.5), X(82), X(54.5), X(0.9), () => mix(skinDk, '#000000', 0.4));
  put(Math.round(X(83)), Math.round(X(53.5)), mix(skinDk, '#000000', 0.4));
  put(Math.round(X(76)), Math.round(X(55.5)), '#ffffff'); // tooth glint

  // ---- HAIR / HOOD / CAP
  const hairC = p.hairC || N.hairC;
  if (p.hood === 'up') {
    for (let a = 3.14; a <= 6.28 + 0.35; a += 0.03) {
      const hx = 80 + Math.cos(a) * 17, hy = 46 + Math.sin(a) * 17.5;
      stroke(put, X(hx), X(hy), X(80 + Math.cos(a) * 12), X(46 + Math.sin(a) * 12), X(2.2), () => mix(jak, jakDk, 0.3));
    }
    row(put, Math.round(X(30)), X(70), X(90), () => jakLt); // hood top light
    stroke(put, X(63), X(46), X(66), X(60), X(2), () => jakDk);
    stroke(put, X(97), X(46), X(94), X(60), X(2), () => jakDk);
  } else if (p.hairStyle === 'spike') {
    ell(put, X(80), X(35), X(15), X(8), (tx, ty) => mix(mix(hairC, '#ffffff', 0.2), mix(hairC, '#000000', 0.5), clamp(tx + ty * 0.4, 0, 1)));
    [[68, 26, 64, 18], [76, 23, 75, 13], [85, 23, 88, 14], [93, 27, 99, 20]].forEach(([x0, y0, x1, y1]) => stroke(put, X(x0), X(y0 + 6), X(x1), X(y1), X(2.6), () => mix(hairC, '#000000', 0.22)));
  } else if (p.hairStyle === 'dreads') {
    ell(put, X(80), X(34), X(15), X(7.5), (tx, ty) => mix(mix(hairC, '#ffffff', 0.15), mix(hairC, '#000000', 0.55), clamp(tx + ty * 0.4, 0, 1)));
    [[66, 34, 60, 62], [71, 30, 68, 66], [89, 30, 92, 66], [94, 34, 100, 62]].forEach(([x0, y0, x1, y1], i) => {
      stroke(put, X(x0), X(y0), X(x1), X(y1), X(2.4), () => mix(hairC, '#000000', 0.3));
      // glowing cable tips
      put(Math.round(X(x1)), Math.round(X(y1 + 1)), i % 2 ? acc : N.pink);
      put(Math.round(X(x1)), Math.round(X(y1 + 2)), i % 2 ? accLt : N.pinkLt);
    });
  } else if (p.hairStyle === 'messy') {
    ell(put, X(80), X(34), X(16), X(9), (tx, ty) => mix(mix(hairC, '#ffffff', 0.18), mix(hairC, '#000000', 0.5), clamp(tx + ty * 0.35, 0, 1)));
    [[67, 30], [74, 26], [82, 25], [90, 27], [95, 31]].forEach(([hx, hy], i) => ell(put, X(hx), X(hy), X(4), X(3.4), () => mix(hairC, '#000000', i % 2 ? 0.15 : 0.35)));
  } else if (p.hairStyle === 'buzz') {
    ell(put, X(80), X(35), X(14.6), X(7), (tx, ty) => mix(mix(hairC, '#000000', 0.2), mix(hairC, '#000000', 0.6), clamp(tx + ty * 0.5, 0, 1)));
    // shaved circuit lines
    stroke(put, X(68), X(36), X(76), X(33), X(0.8), () => skinDk);
    stroke(put, X(76), X(33), X(76), X(30), X(0.8), () => skinDk);
  }
  if (p.cap === 'back') {
    ell(put, X(80), X(33), X(15), X(7.5), (tx, ty) => mix(mix(p.capC || N.purple, '#ffffff', 0.2), mix(p.capC || N.purple, '#000000', 0.45), clamp(tx * 0.9 + ty * 0.5, 0, 1)));
    // backwards brim
    for (let y = 30; y <= 35; y++) row(put, Math.round(X(y)), X(93), X(103 - (y - 30)), () => mix(p.capC || N.purple, '#000000', 0.3));
    put(Math.round(X(80)), Math.round(X(29)), mix(p.capC || N.purple, '#ffffff', 0.4)); // button
    row(put, Math.round(X(37)), X(67), X(93), () => mix(p.capC || N.purple, '#000000', 0.5)); // band
  }
  if (p.phones) {
    // big headphones
    stroke(put, X(65), X(40), X(80), X(30), X(2), () => '#20242e');
    stroke(put, X(80), X(30), X(95), X(40), X(2), () => '#20242e');
    ell(put, X(64), X(46), X(4), X(5.5), (tx, ty) => mix('#3a4254', '#12161e', clamp(tx + ty * 0.4, 0, 1)));
    ell(put, X(96), X(46), X(4), X(5.5), (tx, ty) => mix('#3a4254', '#12161e', clamp(tx + ty * 0.4, 0, 1)));
    put(Math.round(X(64)), Math.round(X(46)), acc); put(Math.round(X(96)), Math.round(X(46)), acc);
  }

  // ---- EYEWEAR
  const eyeC = p.eyeC || acc;
  if (p.eyes === 'goggles') {
    // AR goggles: two round lenses + strap
    row(put, Math.round(X(43)), X(64), X(96), () => '#20242e');
    [[73], [88]].forEach(([gx]) => {
      ell(put, X(gx), X(45), X(5.4), X(5), (tx, ty) => mix('#2a3040', '#10141c', clamp(tx + ty * 0.4, 0, 1)));
      // BLOODSHOT-EYE lenses: white sclera + red veins + manic iris/pupil
      ell(put, X(gx), X(45), X(3.8), X(3.5), (tx, ty) => mix('#f2ece2', '#cab8a6', clamp(tx * 0.7 + ty * 0.7 - 0.3, 0, 1)));
      stroke(put, X(gx - 3.2), X(43.2), X(gx - 1.4), X(44.4), X(0.7), () => '#c8342e');
      stroke(put, X(gx + 3.2), X(43.6), X(gx + 1.5), X(44.8), X(0.7), () => '#c8342e');
      stroke(put, X(gx - 3), X(46.8), X(gx - 1.2), X(45.7), X(0.7), () => '#d84a40');
      stroke(put, X(gx + 2.8), X(47), X(gx + 1.3), X(45.8), X(0.7), () => '#c8342e');
      ell(put, X(gx), X(45), X(1.6), X(1.6), () => eyeC);
      put(Math.round(X(gx)), Math.round(X(45)), '#0a0806');
    });
    row(put, Math.round(X(45)), X(78), X(83), () => '#20242e'); // bridge
  } else if (p.eyes === 'visor') {
    visor(put, X(80), X(45), X(13), eyeC, mix(eyeC, '#ffffff', 0.6));
  } else if (p.eyes === 'mask') {
    // lower-face LED mask + glowing eyes
    for (let y = 49; y <= 58; y++) row(put, Math.round(X(y)), X(69), X(91), (tx) => mix('#1c2028', '#0c0e14', clamp(tx * 1.2 + (y - 49) / 12, 0, 1)));
    // LED grin on mask
    [[73, 54], [76, 56], [80, 56.6], [84, 56], [87, 54]].forEach(([mx, my]) => put(Math.round(X(mx)), Math.round(X(my)), eyeC));
    ell(put, X(73.5), X(44), X(2.4), X(1.8), () => eyeC); ell(put, X(86.5), X(44), X(2.4), X(1.8), () => eyeC);
    put(Math.round(X(73)), Math.round(X(43.6)), '#ffffff'); put(Math.round(X(86)), Math.round(X(43.6)), '#ffffff');
  } else if (p.eyes === 'mono') {
    // single big scouter lens over one eye
    ell(put, X(87), X(44.5), X(6), X(5), (tx, ty) => mix('#2a3040', '#10141c', clamp(tx + ty * 0.4, 0, 1)));
    ell(put, X(87), X(44.5), X(4.2), X(3.4), (tx, ty) => mix(mix(eyeC, '#ffffff', 0.35), mix(eyeC, '#000000', 0.35), clamp(tx * 1.2, 0, 1)));
    stroke(put, X(93), X(44.5), X(96), X(44.5), X(1.4), () => '#20242e');
    ell(put, X(73.5), X(45), X(2.2), X(2.6), () => '#181420'); // bare eye
    put(Math.round(X(73)), Math.round(X(44.2)), '#ffffff');
  } else {
    // plain eyes
    ell(put, X(73.5), X(45), X(2.4), X(2.8), () => '#181420');
    ell(put, X(86.5), X(45), X(2.4), X(2.8), () => '#181420');
    put(Math.round(X(73)), Math.round(X(44)), '#ffffff');
    put(Math.round(X(86)), Math.round(X(44)), '#ffffff');
  }
  }; // end headGroup
  const HDY = Math.round(X(7)); // drop: chin overlaps the collar
  headGroup((x, y, c) => put(x, y + HDY, c));

  rain(put, S, 6, (p.seed || 0));
}

// ---------------------------------------------------------------- sheet
const LIST = [
  { n: 1, name: 'GLITCH', role: 'pink hoodie up + AR goggles + wrist holo', draw: (p, S) => hacker(p, S, { hood: 'up', jak: '#5a1440', jakLt: '#8a3068', jakDk: '#320a24', eyes: 'goggles', eyeC: N.cyan, device: 'wristholo', aura: 'glitch', seed: 1 }) },
  { n: 2, name: 'NULL', role: 'backwards cap + cyberdeck + spotter drone', draw: (p, S) => hacker(p, S, { cap: 'back', capC: '#2e3a5a', hairStyle: 'buzz', hairC: '#2a2030', eyes: 'plain', device: 'deck', companion: 'drone', acc: N.green, accLt: N.greenLt, jak: '#23283a', seed: 2 }) },
  { n: 3, name: 'ROOTKIT', role: 'cable dreads + glowing tips + holo keys', draw: (p, S) => hacker(p, S, { hairStyle: 'dreads', hairC: '#1c1626', eyes: 'visor', eyeC: N.pink, device: 'keys', acc: N.pink, accLt: N.pinkLt, jak: '#20242e', skin: N.skin2, seed: 3 }) },
  { n: 4, name: 'PIXEL', role: 'messy cyan hair + big glitched tablet', draw: (p, S) => hacker(p, S, { hairStyle: 'messy', hairC: N.hairC, eyes: 'plain', device: 'tablet', jak: '#3a2a10', jakLt: '#6a5224', jakDk: '#221806', acc: N.amber, accLt: N.amberLt, seed: 4 }) },
  { n: 5, name: 'DAEMON', role: 'hood + LED grin mask + antenna pack', draw: (p, S) => hacker(p, S, { hood: 'up', jak: '#181c2c', jakLt: '#323a54', jakDk: '#0c0e18', eyes: 'mask', eyeC: N.redN, pack: 'antenna', acc: N.redN, accLt: N.redNLt, aura: 'code', seed: 5 }) },
  { n: 6, name: 'FIREWALL', role: 'tech vest + goggles + hard glow', draw: (p, S) => hacker(p, S, { hairStyle: 'spike', hairC: '#e84a20', vest: true, eyes: 'goggles', eyeC: N.amber, device: 'deck', acc: N.amber, accLt: N.amberLt, jak: '#2e3a2a', jakLt: '#4e5e48', jakDk: '#1a2418', seed: 6 }) },
  { n: 7, name: 'STATIC', role: 'headphones + glitch aura + wrist holo', draw: (p, S) => hacker(p, S, { hairStyle: 'messy', hairC: '#d0d6e2', phones: true, eyes: 'plain', device: 'wristholo', aura: 'glitch', acc: N.purple, accLt: N.purpleLt, jak: '#2a2438', seed: 7 }) },
  { n: 8, name: 'CIPHER', role: 'circuit poncho + mono scouter lens', draw: (p, S) => hacker(p, S, { poncho: true, hairStyle: 'buzz', hairC: '#20182a', eyes: 'mono', eyeC: N.green, acc: N.green, accLt: N.greenLt, jak: '#28203a', jakLt: '#48406a', jakDk: '#140f20', skin: N.skin2, seed: 8 }) },
  { n: 9, name: 'WORM', role: 'jumpsuit kid + cyber rat pet + flat pack', draw: (p, S) => hacker(p, S, { hairStyle: 'spike', hairC: '#3ae86a', eyes: 'visor', eyeC: N.cyan, companion: 'rat', pack: 'flat', device: 'deck', jak: '#3a3040', pants: '#3a3040', acc: N.cyan, seed: 9 }) },
  { n: 10, name: 'ZERO-DAY', role: 'sleek suit + holo panels + floating keys', draw: (p, S) => hacker(p, S, { hairStyle: 'dreads', hairC: '#0e0a16', eyes: 'visor', eyeC: N.purple, device: 'keys', aura: 'panels', acc: N.purple, accLt: N.purpleLt, jak: '#16121e', jakLt: '#2e2840', jakDk: '#0a0812', pants: '#16121e', seed: 10 }) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_hacker_options.png', title: 'SOCIAL ENGINEER — techno kid hacker boss — pick a number', S: 160, cols: 5, scale: 2 });
}
module.exports = { hacker, LIST };
