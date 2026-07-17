// artdev/carnival/render_carnival_mobs.js — 20 numbered HAUNTED CARNIVAL
// mob candidates, one PNG grid. Creepy carnival crew + living attractions.
'use strict';
const KIT = require('./carnival_kit.js');
const { C, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, grin } = KIT;

const dk = c => mix(c, '#000000', 0.45);

// 1 · CREEPY CLOWN — shuffling grinner, oversized shoes.
function drawClown(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // shoes
  [[-1, 0], [1, 2]].forEach(([s, o]) => ell(put, cx + s * S * 0.09, S * 0.86 + o, S * 0.09, S * 0.035, (tx, ty) => mix(C.red, C.redDk, tx * 0.5 + ty)));
  // baggy suit
  for (let y = S * 0.44; y < S * 0.84; y++) {
    const t = (y - S * 0.44) / (S * 0.4);
    const w = S * (0.1 + Math.sin(t * 3.1) * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      const band = Math.floor((t * 4 + tx) * 2);
      return mix(band % 2 ? C.violet : C.glow, band % 2 ? C.violetDk : C.glowDk, tx * 0.6 + t * 0.3);
    });
  }
  // ruff collar
  for (let a = 0; a < 6.28; a += 0.5) ell(put, cx + Math.cos(a) * S * 0.07, S * 0.42 + Math.sin(a) * S * 0.02, S * 0.03, S * 0.02, () => C.cream);
  // head — white paint, big grin
  ell(put, cx, S * 0.32, S * 0.085, S * 0.095, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // hair tufts
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.09, S * 0.27, S * 0.035, S * 0.045, (tx, ty) => mix(C.teal, C.tealDk, ty)));
  optic(put, cx - S * 0.035, S * 0.3, S * 0.016, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.035, S * 0.3, S * 0.016, C.oil, C.oil, '#ffffff');
  put(Math.round(cx), Math.round(S * 0.33), C.red); // nose
  grin(put, cx, S * 0.36, S * 0.05, false, C.blood, true);
}

// 2 · BALLOON WISP — drifting haunted balloon, dangling string.
function drawBalloon(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  ell(put, cx, S * 0.34, S * 0.13, S * 0.16, (tx, ty) => {
    let b = mix(C.redLt, C.redDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
    if (tx < 0.3 && ty < 0.35) b = mix(b, '#ffffff', 0.35);
    return b;
  });
  // knot + string swaying to a hook
  put(Math.round(cx), Math.round(S * 0.51), C.redDk);
  for (let t = 0; t < 1; t += 0.02) put(Math.round(cx + Math.sin(t * 7) * S * 0.035), Math.round(S * 0.52 + t * S * 0.3), C.creamDk);
  // face pressed through the rubber
  optic(put, cx - S * 0.045, S * 0.31, S * 0.02, C.redDkk, C.redDkk, C.redLt);
  optic(put, cx + S * 0.045, S * 0.31, S * 0.02, C.redDkk, C.redDkk, C.redLt);
  grin(put, cx, S * 0.39, S * 0.05, false, C.redDkk, false);
}

// 3 · CARNY BARKER — top-hatted shill with a cane, herds you.
function drawBarker(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.88, S * 0.03, () => C.night));
  // coat
  for (let y = S * 0.4; y < S * 0.64; y++) {
    const t = (y - S * 0.4) / (S * 0.24), w = S * (0.09 + t * 0.04);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.redLt, C.redDk, clamp(tx * 1.2 + t * 0.2, 0, 1)));
  }
  row(put, Math.round(S * 0.44), cx - S * 0.03, cx + S * 0.03, () => C.glow); // waistcoat
  // arms: one raised with cane
  stroke(put, cx + S * 0.08, S * 0.44, cx + S * 0.17, S * 0.3, S * 0.025, () => C.redDk);
  stroke(put, cx + S * 0.17, S * 0.32, cx + S * 0.17, S * 0.6, 2.4, () => C.woodDkk);
  put(Math.round(cx + S * 0.17), Math.round(S * 0.3), C.glow);
  stroke(put, cx - S * 0.08, S * 0.44, cx - S * 0.13, S * 0.56, S * 0.025, () => C.redDk);
  // head + tall hat
  ell(put, cx, S * 0.32, S * 0.06, S * 0.065, (tx, ty) => mix('#d8c8a8', '#a89478', clamp(tx + ty * 0.4, 0, 1)));
  plate(put, cx - S * 0.075, S * 0.24, cx + S * 0.075, S * 0.265, C.night, C.violetDk, C.oil);
  plate(put, cx - S * 0.05, S * 0.1, cx + S * 0.05, S * 0.25, C.night, C.violet, C.oil);
  row(put, Math.round(S * 0.22), cx - S * 0.05, cx + S * 0.05, () => C.red); // hat band
  optic(put, cx - S * 0.025, S * 0.31, S * 0.013, C.oil, C.oil, C.glow);
  optic(put, cx + S * 0.025, S * 0.31, S * 0.013, C.oil, C.oil, C.glow);
  grin(put, cx, S * 0.345, S * 0.03, false, C.redDkk, false);
}

// 4 · POSSESSED TEDDY — prize gone wrong; one button eye.
function drawTeddy(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // body
  ell(put, cx, S * 0.62, S * 0.14, S * 0.16, (tx, ty) => mix('#a8825a', '#6e5236', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  ell(put, cx, S * 0.66, S * 0.06, S * 0.08, (tx, ty) => mix('#d8c0a0', '#a8926e', ty)); // belly patch
  // stitched tear across belly
  for (let t = -1; t <= 1; t += 0.2) { const x = cx + t * S * 0.05, y = S * 0.64 + t * t * S * 0.02; put(Math.round(x), Math.round(y), C.blood); put(Math.round(x), Math.round(y - 2), C.oil); }
  // arms + legs
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.15, S * 0.58, S * 0.05, S * 0.09, (tx, ty) => mix('#a8825a', '#5e4630', tx + ty * 0.3));
    ell(put, cx + s * S * 0.08, S * 0.8, S * 0.06, S * 0.05, (tx, ty) => mix('#8e6c48', '#5e4630', ty));
  });
  // head + torn ear
  ell(put, cx, S * 0.36, S * 0.11, S * 0.1, (tx, ty) => mix('#b8905e', '#75593a', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.09, S * 0.27, S * 0.04, S * 0.04, (tx, ty) => mix('#a8825a', '#5e4630', ty));
  // torn right ear: jagged
  [[0.07, 0.26], [0.1, 0.28], [0.08, 0.3]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(dy * S), '#5e4630'));
  // one button eye + one empty X
  optic(put, cx - S * 0.04, S * 0.34, S * 0.018, C.oil, C.oil, '#ffffff');
  stroke(put, cx + S * 0.025, S * 0.325, cx + S * 0.055, S * 0.355, 1.4, () => C.oil);
  stroke(put, cx + S * 0.055, S * 0.325, cx + S * 0.025, S * 0.355, 1.4, () => C.oil);
  // muzzle + stitched grin
  ell(put, cx, S * 0.4, S * 0.045, S * 0.03, (tx, ty) => mix('#d8c0a0', '#a8926e', ty));
  grin(put, cx, S * 0.405, S * 0.03, false, C.oil, false);
}

// 5 · STILT STALKER — impossibly tall striped-leg walker.
function drawStilt(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // stilt legs — striped, very long
  [-1, 1].forEach(s => {
    for (let y = S * 0.34; y < S * 0.9; y++) {
      const t = (y - S * 0.34) / (S * 0.56);
      const x = cx + s * S * (0.05 + t * 0.06);
      const band = Math.floor(y / (S * 0.045));
      stroke(put, x, y, x, y, 2.6, () => band % 2 ? C.red : C.cream);
    }
  });
  // tiny torso up high
  ell(put, cx, S * 0.26, S * 0.08, S * 0.09, (tx, ty) => mix(C.night, C.oil, ty));
  // long arms drooping
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, S * 0.24, cx + s * S * 0.14, S * 0.48, S * 0.016, () => C.night));
  // small pale head, wide eyes
  ell(put, cx, S * 0.14, S * 0.05, S * 0.055, (tx, ty) => mix(C.paint, C.paintDk, ty));
  optic(put, cx - S * 0.02, S * 0.13, S * 0.013, C.oil, C.oil, C.glow);
  optic(put, cx + S * 0.02, S * 0.13, S * 0.013, C.oil, C.oil, C.glow);
  grin(put, cx, S * 0.165, S * 0.025, true, C.oil, false); // upside-down smile
}

// 6 · POPCORN POLTERGEIST — a striped box boiling over with hot kernels.
function drawPopcorn(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // box
  for (let y = S * 0.5; y < S * 0.84; y++) {
    const t = (y - S * 0.5) / (S * 0.34), w = S * (0.13 - t * 0.03);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      const band = Math.floor(tx * 6);
      return mix(band % 2 ? C.red : C.cream, band % 2 ? C.redDk : C.creamDk, t * 0.5 + tx * 0.2);
    });
  }
  // angry face on the box
  optic(put, cx - S * 0.05, S * 0.62, S * 0.016, C.oil, C.oil, C.glow);
  optic(put, cx + S * 0.05, S * 0.62, S * 0.016, C.oil, C.oil, C.glow);
  grin(put, cx, S * 0.7, S * 0.045, true, C.oil, true);
  // boiling kernels erupting
  [[0, 0.42], [-0.09, 0.4], [0.09, 0.44], [-0.05, 0.32], [0.05, 0.3], [0, 0.24], [-0.12, 0.34], [0.13, 0.36]].forEach(([dx, dy], i) => {
    ell(put, cx + dx * S, S * dy, S * 0.028, S * 0.026, (tx, ty) => mix(i % 3 ? C.glowLt : '#fff8e0', C.glowDk, tx * 0.6 + ty * 0.5));
  });
  // heat sparks
  put(Math.round(cx - S * 0.02), Math.round(S * 0.18), C.glow); put(Math.round(cx + S * 0.07), Math.round(S * 0.2), C.glow);
}

// 7 · CAROUSEL STEED — impaled wooden horse, off its pole, still bobbing.
function drawSteed(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  // body (rocking pose)
  ell(put, cx, S * 0.52, S * 0.16, S * 0.09, (tx, ty) => mix('#e8e0ec', '#b0a4bc', clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  // legs frozen mid-gallop
  [[-0.1, 0.6, -0.16, 0.78], [-0.02, 0.6, -0.03, 0.82], [0.06, 0.6, 0.12, 0.74], [0.12, 0.58, 0.18, 0.7]].forEach(([x1, y1, x2, y2]) =>
    stroke(put, cx + x1 * S, y1 * S, cx + x2 * S, y2 * S, S * 0.022, () => '#c8bcd4'));
  // neck + head
  stroke(put, cx + S * 0.12, S * 0.48, cx + S * 0.19, S * 0.34, S * 0.045, () => '#d8d0e0');
  ell(put, cx + S * 0.21, S * 0.3, S * 0.055, S * 0.04, (tx, ty) => mix('#e8e0ec', '#b0a4bc', ty));
  stroke(put, cx + S * 0.25, S * 0.31, cx + S * 0.28, S * 0.33, S * 0.02, () => '#c8bcd4'); // muzzle
  // wild glow eye
  optic(put, cx + S * 0.21, S * 0.29, S * 0.014, C.oil, C.oil, C.teal);
  // mane + saddle
  for (let t = 0; t < 1; t += 0.1) put(Math.round(cx + S * (0.12 + t * 0.08)), Math.round(S * (0.44 - t * 0.1)), C.teal);
  plate(put, cx - S * 0.05, S * 0.44, cx + S * 0.04, S * 0.5, C.red, C.redLt, C.redDk);
  // broken pole stub through the saddle
  stroke(put, cx, S * 0.3, cx, S * 0.46, S * 0.018, () => C.glowDk);
  stroke(put, cx - S * 0.012, S * 0.3, cx + S * 0.012, S * 0.3, 2, () => C.glow);
}

// 8 · FORTUNE WRAITH — hooded seer, floating cards.
function drawFortune(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // robe
  for (let y = S * 0.34; y < S * 0.84; y++) {
    const t = (y - S * 0.34) / (S * 0.5), w = S * (0.06 + t * 0.1);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.violet, C.violetDk, clamp(tx * 1.1 + t * 0.3, 0, 1)));
  }
  // hood + void face
  ell(put, cx, S * 0.3, S * 0.075, S * 0.08, (tx, ty) => mix(C.violet, C.violetDk, clamp(tx + ty * 0.5, 0, 1)));
  ell(put, cx, S * 0.315, S * 0.045, S * 0.05, () => C.oil);
  optic(put, cx - S * 0.02, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
  optic(put, cx + S * 0.02, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
  // floating tarot cards orbit
  [[-0.2, 0.4, C.teal], [0.2, 0.36, C.red], [-0.16, 0.62, C.glow], [0.18, 0.6, C.violetLt]].forEach(([dx, dy, c]) => {
    plate(put, cx + dx * S - S * 0.025, S * dy - S * 0.04, cx + dx * S + S * 0.025, S * dy + S * 0.04, C.cream, '#fff', C.creamDk);
    put(Math.round(cx + dx * S), Math.round(S * dy), c);
    put(Math.round(cx + dx * S), Math.round(S * dy - 3), c);
  });
}

// 9 · RIDE RAT — greasy rat in a bumper car, ramming.
function drawRat(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  // bumper car
  ell(put, cx, S * 0.66, S * 0.17, S * 0.09, (tx, ty) => mix(C.teal, C.tealDk, clamp(tx * 0.8 + ty * 0.7, 0, 1)));
  ell(put, cx, S * 0.6, S * 0.13, S * 0.05, () => C.oil); // cockpit
  ell(put, cx, S * 0.73, S * 0.17, S * 0.03, (tx, ty) => mix(C.ironDk, C.oil, ty)); // rubber skirt
  // sparking antenna
  stroke(put, cx + S * 0.1, S * 0.62, cx + S * 0.13, S * 0.34, 1.6, () => C.iron);
  put(Math.round(cx + S * 0.13), Math.round(S * 0.33), C.glow); put(Math.round(cx + S * 0.15), Math.round(S * 0.3), C.glowLt);
  // rat driver
  ell(put, cx - S * 0.02, S * 0.52, S * 0.07, S * 0.06, (tx, ty) => mix('#8a7a6e', '#55483e', tx + ty * 0.3));
  ell(put, cx + S * 0.05, S * 0.48, S * 0.045, S * 0.04, (tx, ty) => mix('#9a8a7e', '#5e5044', ty)); // head
  ell(put, cx + S * 0.04, S * 0.44, S * 0.018, S * 0.02, () => '#8a7a6e'); // ear
  put(Math.round(cx + S * 0.08), Math.round(S * 0.475), C.pink); // nose
  optic(put, cx + S * 0.055, S * 0.47, S * 0.01, C.oil, C.oil, C.red);
  // tail out the back
  for (let t = 0; t < 1; t += 0.04) put(Math.round(cx - S * (0.12 + t * 0.12)), Math.round(S * (0.56 + Math.sin(t * 6) * 0.03)), C.pink);
}

// 10 · MIRROR MIME — pale copycat; mirrors your moves (invisible walls).
function drawMime(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.6, cx + s * S * 0.045, S * 0.88, S * 0.028, () => C.night));
  // striped shirt
  for (let y = S * 0.4; y < S * 0.62; y++) {
    const band = Math.floor((y - S * 0.4) / (S * 0.035));
    const w = S * 0.085;
    row(put, Math.round(y), cx - w, cx + w, (tx) => band % 2 ? mix(C.night, C.oil, tx * 0.4) : mix(C.paint, C.paintDk, tx * 0.6));
  }
  // arms pressing "the glass"
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, S * 0.44, cx + s * S * 0.16, S * 0.4, S * 0.022, () => C.night);
    ell(put, cx + s * S * 0.17, S * 0.39, S * 0.022, S * 0.022, () => C.paint); // white glove
  });
  // faint glass plane
  for (let y = S * 0.28; y < S * 0.6; y += 3) { put(Math.round(cx - S * 0.21), y, C.tealLt); put(Math.round(cx + S * 0.21), y, C.tealLt); }
  // head — white face, beret
  ell(put, cx, S * 0.32, S * 0.065, S * 0.07, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx * 0.7 + ty * 0.4, 0, 1)));
  ell(put, cx - S * 0.01, S * 0.255, S * 0.055, S * 0.025, (tx, ty) => mix(C.red, C.redDk, ty));
  // painted tear + dot eyes
  optic(put, cx - S * 0.025, S * 0.31, S * 0.011, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.025, S * 0.31, S * 0.011, C.oil, C.oil, '#ffffff');
  put(Math.round(cx - S * 0.025), Math.round(S * 0.345), C.teal);
  grin(put, cx, S * 0.36, S * 0.025, false, C.oil, false);
}

// 11 · TICKET TAKER — shambling booth ghoul, stub-chain whip.
function drawTicket(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // hunched body in a vest
  ell(put, cx, S * 0.56, S * 0.11, S * 0.14, (tx, ty) => mix('#6e7a6a', '#3c443a', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  plate(put, cx - S * 0.05, S * 0.46, cx + S * 0.05, S * 0.62, C.red, C.redLt, C.redDk); // vest
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.68, cx + s * S * 0.06, S * 0.88, S * 0.028, () => C.night));
  // ticket-chain whip arm
  stroke(put, cx + S * 0.09, S * 0.5, cx + S * 0.18, S * 0.42, S * 0.022, () => '#6e7a6a');
  for (let i = 0; i < 7; i++) {
    const t = i / 6, x = cx + S * (0.19 + t * 0.14), y = S * (0.42 + Math.sin(t * 5) * 0.05 + t * 0.12);
    plate(put, x - 3, y - 2, x + 3, y + 2, C.glow, C.glowLt, C.glowDk);
  }
  stroke(put, cx - S * 0.09, S * 0.5, cx - S * 0.14, S * 0.62, S * 0.022, () => '#6e7a6a');
  // head — sagging cap
  ell(put, cx, S * 0.36, S * 0.06, S * 0.065, (tx, ty) => mix('#8a967e', '#4c5648', clamp(tx + ty * 0.4, 0, 1)));
  plate(put, cx - S * 0.065, S * 0.3, cx + S * 0.065, S * 0.33, C.redDk, C.red, C.redDkk);
  optic(put, cx - S * 0.025, S * 0.36, S * 0.012, C.oil, C.oil, C.glow);
  optic(put, cx + S * 0.025, S * 0.36, S * 0.012, C.oil, C.oil, C.glow);
}

// 12 · STRONGMAN SHADE — mustachioed ghost of the strongman, barbell slam.
function drawStrongman(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // massive torso in a leotard
  for (let y = S * 0.38; y < S * 0.68; y++) {
    const t = (y - S * 0.38) / (S * 0.3), w = S * (0.14 - t * 0.03);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#d8c8b0', '#a08a6e', clamp(tx * 1.1, 0, 1));
      if (t > 0.35) { const band = Math.floor(tx * 4); b = band % 2 ? C.red : C.redDk; }
      return b;
    });
  }
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, S * 0.68, cx + s * S * 0.07, S * 0.86, S * 0.04, () => C.redDk));
  // arms hoisting the barbell overhead
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.12, S * 0.42, cx + s * S * 0.15, S * 0.24, S * 0.032, () => '#d8c8b0'));
  stroke(put, cx - S * 0.24, S * 0.2, cx + S * 0.24, S * 0.2, S * 0.02, () => C.iron);
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.26, S * 0.2, S * 0.055, S * 0.055, (tx, ty) => mix(C.ironLt, C.ironDk, clamp(tx + ty * 0.5, 0, 1))));
  // head + handlebar mustache
  ell(put, cx, S * 0.32, S * 0.06, S * 0.06, (tx, ty) => mix('#d8c8b0', '#a08a6e', clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx - S * 0.022, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
  optic(put, cx + S * 0.022, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.005, S * 0.35, cx + s * S * 0.045, S * 0.345, 2, () => C.oil); put(Math.round(cx + s * S * 0.05), Math.round(S * 0.34), C.oil); });
  // spectral fade at the feet
  for (let x = -0.1; x <= 0.1; x += 0.02) put(Math.round(cx + x * S), Math.round(S * 0.88), C.tealLt);
}

// 13 · COTTON CANDY BLOB — pink cloud ooze, sticky slow patches.
function drawCandy(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // fluffy mass
  [[0, 0.58, 0.17, 0.14], [-0.12, 0.52, 0.1, 0.09], [0.12, 0.5, 0.11, 0.09], [0, 0.44, 0.12, 0.09], [-0.08, 0.66, 0.1, 0.07], [0.09, 0.66, 0.09, 0.07]].forEach(([dx, dy, rx, ry]) =>
    ell(put, cx + dx * S, S * dy, S * rx, S * ry, (tx, ty) => mix('#ffc8e0', C.pink, clamp(tx * 0.8 + ty * 0.6, 0, 1))));
  // drips
  [[-0.1, 0.74], [0.04, 0.78], [0.13, 0.72]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy + 0.07), 2.4, () => C.pink));
  // buried paper cone poking out
  stroke(put, cx + S * 0.13, S * 0.42, cx + S * 0.19, S * 0.3, S * 0.02, () => C.cream);
  // face
  optic(put, cx - S * 0.05, S * 0.54, S * 0.015, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.05, S * 0.54, S * 0.015, C.oil, C.oil, '#ffffff');
  grin(put, cx, S * 0.6, S * 0.04, false, mix(C.pink, '#000000', 0.6), true);
}

// 14 · KNIFE JUGGLER — grinning tosser, arcing blades.
function drawJuggler(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.6, cx + s * S * 0.05, S * 0.88, S * 0.028, () => C.violetDk));
  // harlequin torso — diamond checks
  for (let y = S * 0.4; y < S * 0.62; y++) {
    const t = (y - S * 0.4) / (S * 0.22), w = S * 0.09;
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      const ch = (Math.floor(tx * 4) + Math.floor(t * 4)) % 2;
      return ch ? mix(C.violet, C.violetDk, tx * 0.5) : mix(C.glow, C.glowDk, t * 0.5);
    });
  }
  // arms up juggling
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.44, cx + s * S * 0.15, S * 0.34, S * 0.02, () => C.violet));
  // knives arcing overhead
  [[-0.16, 0.24, 0.6], [0, 0.14, 0], [0.16, 0.22, -0.6]].forEach(([dx, dy, lean]) => {
    const kx = cx + dx * S, ky = S * dy;
    stroke(put, kx - lean * 6, ky + 8, kx + lean * 6, ky - 8, 2.4, () => C.ironLt);
    put(Math.round(kx - lean * 8), Math.round(ky + 11), C.woodDk); put(Math.round(kx - lean * 7), Math.round(ky + 10), C.woodDk);
    put(Math.round(kx + lean * 6), Math.round(ky - 8), '#ffffff');
  });
  // head + jester hood
  ell(put, cx, S * 0.33, S * 0.06, S * 0.06, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx + ty * 0.4, 0, 1)));
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.03, S * 0.28, cx + s * S * 0.1, S * 0.2, S * 0.02, () => s < 0 ? C.violet : C.glow); put(Math.round(cx + s * S * 0.11), Math.round(S * 0.19), C.red); });
  optic(put, cx - S * 0.022, S * 0.32, S * 0.011, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.022, S * 0.32, S * 0.011, C.oil, C.oil, '#ffffff');
  grin(put, cx, S * 0.355, S * 0.03, false, C.blood, true);
}

// 15 · HALL SPECTER — warped funhouse reflection, stretches sideways.
function drawSpecter(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // warped body — wavy tall smear
  for (let y = S * 0.18; y < S * 0.84; y++) {
    const t = (y - S * 0.18) / (S * 0.66);
    const wob = Math.sin(t * 9) * S * 0.05;
    const w = S * (0.05 + 0.05 * Math.sin(t * 3.2));
    row(put, Math.round(y), cx + wob - w, cx + wob + w, (tx) => {
      let b = mix(C.tealLt, C.tealDk, clamp(tx * 0.8 + t * 0.4, 0, 1));
      if (Math.abs(tx - 0.5) < 0.12 && t < 0.3) b = mix(b, '#ffffff', 0.3);
      return b;
    });
  }
  // stretched face
  optic(put, cx - S * 0.02, S * 0.28, S * 0.013, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.045, S * 0.3, S * 0.013, C.oil, C.oil, '#ffffff');
  for (let t = -1; t <= 1; t += 0.1) put(Math.round(cx + S * 0.01 + t * S * 0.03), Math.round(S * 0.38 + t * t * S * 0.03), C.oil);
  // glass shard frame hints
  [[-0.2, 0.3], [0.22, 0.5], [-0.18, 0.66]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S + S * 0.04, S * dy - S * 0.06, 1.4, () => C.tealLt));
}

// 16 · WHACK-A-MOLE — pops from warned holes, bonks back.
function drawMole(put, S) {
  const cx = S * 0.5;
  // hole
  ell(put, cx, S * 0.72, S * 0.16, S * 0.06, () => C.oil);
  ell(put, cx, S * 0.7, S * 0.16, S * 0.05, (tx, ty) => ty > 0.5 ? null : mix(C.dirtLt, C.dirtDk, tx));
  // mole body popping up
  ell(put, cx, S * 0.5, S * 0.11, S * 0.16, (tx, ty) => mix('#7e6a56', '#4c3e30', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  // hard hat (it's learned to fight back)
  dome(put, cx, S * 0.36, S * 0.09, S * 0.05, C.glow, C.glowLt, C.glowDk);
  // squint eyes + big snout
  stroke(put, cx - S * 0.05, S * 0.42, cx - S * 0.02, S * 0.43, 1.6, () => C.oil);
  stroke(put, cx + S * 0.02, S * 0.43, cx + S * 0.05, S * 0.42, 1.6, () => C.oil);
  ell(put, cx, S * 0.47, S * 0.03, S * 0.024, (tx, ty) => mix(C.pink, mix(C.pink, '#000', 0.4), ty));
  // buck teeth
  put(Math.round(cx - 1), Math.round(S * 0.51), '#ffffff'); put(Math.round(cx + 1), Math.round(S * 0.51), '#ffffff');
  // claws gripping the rim + mallet
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.1, S * 0.64, S * 0.03, S * 0.02, () => '#9a8a7e'));
  stroke(put, cx + S * 0.13, S * 0.62, cx + S * 0.2, S * 0.44, 2.6, () => C.wood);
  plate(put, cx + S * 0.16, S * 0.36, cx + S * 0.25, S * 0.44, C.red, C.redLt, C.redDk);
}

// 17 · ORGAN GRINDER MONKEY — cymbal-clash stun rings.
function drawMonkey(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // body + fez
  ell(put, cx, S * 0.56, S * 0.09, S * 0.11, (tx, ty) => mix('#8a6a4e', '#54402e', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  plate(put, cx - S * 0.045, S * 0.6, cx + S * 0.045, S * 0.66, C.red, C.redLt, C.redDk); // vest
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.66, cx + s * S * 0.06, S * 0.8, S * 0.02, () => '#6e523a'));
  // tail curl
  for (let t = 0; t < 1; t += 0.04) put(Math.round(cx - S * (0.1 + Math.sin(t * 4) * 0.05)), Math.round(S * (0.62 - t * 0.12)), '#6e523a');
  // head
  ell(put, cx, S * 0.38, S * 0.07, S * 0.07, (tx, ty) => mix('#8a6a4e', '#54402e', clamp(tx + ty * 0.3, 0, 1)));
  ell(put, cx, S * 0.41, S * 0.045, S * 0.04, (tx, ty) => mix('#d8bc9a', '#a8886a', ty)); // muzzle
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.07, S * 0.35, S * 0.02, S * 0.025, () => '#6e523a'));
  optic(put, cx - S * 0.025, S * 0.365, S * 0.011, C.oil, C.oil, C.red);
  optic(put, cx + S * 0.025, S * 0.365, S * 0.011, C.oil, C.oil, C.red);
  // fez
  plate(put, cx - S * 0.035, S * 0.28, cx + S * 0.035, S * 0.33, C.red, C.redLt, C.redDk);
  stroke(put, cx + S * 0.035, S * 0.28, cx + S * 0.05, S * 0.25, 1.4, () => C.glow);
  // cymbals mid-clash + ring
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.13, S * 0.5, S * 0.045, S * 0.045, (tx, ty) => mix(C.glowLt, C.glowDk, clamp(tx + ty * 0.4, 0, 1)));
    stroke(put, cx + s * S * 0.07, S * 0.52, cx + s * S * 0.1, S * 0.51, S * 0.016, () => '#6e523a');
  });
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.2), Math.round(S * 0.5 + Math.sin(a) * S * 0.14), C.glowLt);
}

// 18 · GHOST TRAIN CAR — runaway dark-ride cart on phantom rails.
function drawTrain(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // phantom rails
  stroke(put, S * 0.1, S * 0.82, S * 0.9, S * 0.74, 1.6, () => C.tealLt);
  stroke(put, S * 0.1, S * 0.88, S * 0.9, S * 0.8, 1.6, () => C.tealLt);
  // cart body — spooky dark-ride tub with a demon face prow
  for (let y = S * 0.46; y < S * 0.72; y++) {
    const t = (y - S * 0.46) / (S * 0.26), w = S * (0.17 - t * 0.02);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.violetDk, C.night, clamp(tx * 0.9 + t * 0.4, 0, 1)));
  }
  // painted demon face on the front
  optic(put, cx + S * 0.1, S * 0.53, S * 0.02, C.redDk, C.red, C.glow);
  grin(put, cx + S * 0.09, S * 0.62, S * 0.05, false, C.red, true);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.09 + s * S * 0.05, S * 0.48, cx + S * 0.09 + s * S * 0.07, S * 0.43, 2, () => C.red)); // horns
  // wheels
  [-0.1, 0.08].forEach(dx => { ell(put, cx + dx * S, S * 0.74, S * 0.04, S * 0.04, (tx, ty) => mix(C.ironLt, C.ironDk, clamp(tx + ty * 0.5, 0, 1))); });
  // ghost flame trail
  [[-0.2, 0.5], [-0.26, 0.44], [-0.31, 0.5]].forEach(([dx, dy], i) => ell(put, cx + dx * S, S * dy, S * (0.03 - i * 0.006), S * (0.04 - i * 0.008), (tx, ty) => mix(C.tealLt, C.teal, ty)));
}

// 19 · THE TWINS — conjoined acrobats, elite; split + rejoin dashes.
function drawTwins(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  [-1, 1].forEach(s => {
    const bx = cx + s * S * 0.07;
    // legs
    stroke(put, bx, S * 0.6, bx + s * S * 0.02, S * 0.86, S * 0.026, () => C.night);
    // leotard torso
    for (let y = S * 0.4; y < S * 0.62; y++) {
      const t = (y - S * 0.4) / (S * 0.22), w = S * 0.055;
      row(put, Math.round(y), bx - w, bx + w, (tx) => s < 0 ? mix(C.red, C.redDk, tx * 0.7 + t * 0.2) : mix(C.teal, C.tealDk, tx * 0.7 + t * 0.2));
    }
    // outer arm raised showman-style
    stroke(put, bx + s * S * 0.05, S * 0.44, bx + s * S * 0.12, S * 0.3, S * 0.018, () => C.paint);
    put(Math.round(bx + s * S * 0.13), Math.round(S * 0.29), C.paint);
    // head
    ell(put, bx, S * 0.33, S * 0.05, S * 0.055, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx + ty * 0.4, 0, 1)));
    optic(put, bx - S * 0.018, S * 0.325, S * 0.01, C.oil, C.oil, s < 0 ? C.red : C.teal);
    optic(put, bx + S * 0.018, S * 0.325, S * 0.01, C.oil, C.oil, s < 0 ? C.red : C.teal);
    grin(put, bx, S * 0.355, S * 0.022, s < 0, C.oil, false); // one smiles, one frowns
    // slicked hair
    ell(put, bx, S * 0.29, S * 0.05, S * 0.02, () => C.oil);
  });
  // joined at the waist sash
  plate(put, cx - S * 0.12, S * 0.6, cx + S * 0.12, S * 0.65, C.glow, C.glowLt, C.glowDk);
}

// 20 · FERRIS PHANTOM — elite; a rolling ferris-wheel spirit, spoke beams.
function drawFerris(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // wheel rim (double)
  for (let a = 0; a < 6.283; a += 0.02) {
    put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.3), C.tealDk);
    put(Math.round(cx + Math.cos(a) * S * 0.27), Math.round(cy + Math.sin(a) * S * 0.27), C.teal);
  }
  // spokes
  for (let a = 0; a < 6.283; a += 0.785) stroke(put, cx, cy, cx + Math.cos(a) * S * 0.28, cy + Math.sin(a) * S * 0.28, 1.6, () => C.tealLt);
  // hanging cabins (little swinging boxes)
  for (let a = 0.39; a < 6.283; a += 0.785) {
    const gx = cx + Math.cos(a) * S * 0.29, gy = cy + Math.sin(a) * S * 0.29;
    plate(put, gx - 4, gy, gx + 4, gy + 7, a % 1.57 < 0.785 ? C.red : C.glow, C.glowLt, C.redDk);
  }
  // hub face — the spirit
  ell(put, cx, cy, S * 0.09, S * 0.09, (tx, ty) => mix(C.tealLt, C.tealDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  optic(put, cx - S * 0.03, cy - S * 0.01, S * 0.014, C.oil, C.oil, '#ffffff');
  optic(put, cx + S * 0.03, cy - S * 0.01, S * 0.014, C.oil, C.oil, '#ffffff');
  grin(put, cx, cy + S * 0.035, S * 0.035, false, C.oil, true);
  // ghost glow motes
  [[0.16, 0.16], [0.82, 0.3], [0.2, 0.8]].forEach(([fx, fy]) => put(Math.round(S * fx), Math.round(S * fy), C.tealLt));
}

const LIST = [
  { n: 1, name: 'CREEPY CLOWN', role: 'shuffling melee', draw: drawClown },
  { n: 2, name: 'BALLOON WISP', role: 'drifting popper', draw: drawBalloon },
  { n: 3, name: 'CARNY BARKER', role: 'herds you w/ cane', draw: drawBarker },
  { n: 4, name: 'POSSESSED TEDDY', role: 'prize gone wrong', draw: drawTeddy },
  { n: 5, name: 'STILT STALKER', role: 'tall lane strider', draw: drawStilt },
  { n: 6, name: 'POPCORN POLTERGEIST', role: 'hot kernel lobber', draw: drawPopcorn },
  { n: 7, name: 'CAROUSEL STEED', role: 'bobbing charger', draw: drawSteed },
  { n: 8, name: 'FORTUNE WRAITH', role: 'card caster', draw: drawFortune },
  { n: 9, name: 'RIDE RAT', role: 'bumper-car rammer', draw: drawRat },
  { n: 10, name: 'MIRROR MIME', role: 'invisible walls', draw: drawMime },
  { n: 11, name: 'TICKET TAKER', role: 'stub-chain whip', draw: drawTicket },
  { n: 12, name: 'STRONGMAN SHADE', role: 'barbell slam', draw: drawStrongman },
  { n: 13, name: 'COTTON CANDY BLOB', role: 'sticky slow ooze', draw: drawCandy },
  { n: 14, name: 'KNIFE JUGGLER', role: 'arcing blades', draw: drawJuggler },
  { n: 15, name: 'HALL SPECTER', role: 'warped stretcher', draw: drawSpecter },
  { n: 16, name: 'WHACK-A-MOLE', role: 'pops from holes', draw: drawMole },
  { n: 17, name: 'CYMBAL MONKEY', role: 'stun-ring clasher', draw: drawMonkey },
  { n: 18, name: 'GHOST TRAIN CAR', role: 'runaway rail cart', draw: drawTrain },
  { n: 19, name: 'THE TWINS', role: 'elite split acrobats', draw: drawTwins },
  { n: 20, name: 'FERRIS PHANTOM', role: 'elite rolling wheel', draw: drawFerris },
];

renderSheet({ list: LIST, out: process.argv[2] || 'carnival_mob_options.png', title: 'HAUNTED CARNIVAL — MOB CANDIDATES (pick your roster, any count)', S: 160 });
