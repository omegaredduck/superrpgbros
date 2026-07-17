// artdev/neon/render_neon_decor.js — 20 numbered NEON CITY decor
// candidates, one PNG grid. Rooftop furniture in the rain.
'use strict';
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glow, visor, rain, glitchBar } = KIT;

// 1 · HOLO BILLBOARD — big animated ad
function drawBillboard(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 1); shadow(put, S, cx, S * 0.28);
  [[-0.14], [0.14]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.6, cx + dx * S, S * 0.82, 2.6, () => N.gunDk));
  plate(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.6, N.nightDk, N.nightLt, N.oil);
  glow(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.3, 1, N.pink);
  glow(put, cx - S * 0.2, S * 0.6, cx + S * 0.2, S * 0.6, 1, N.cyan);
  // holo face ad w/ scanlines
  ell(put, cx - S * 0.06, S * 0.44, S * 0.07, S * 0.08, (tx, ty) => ((ty * 12 | 0) % 2 ? mix(N.pinkLt, N.night, 0.4) : mix(N.pink, N.night, 0.5)));
  [[0.06, 0.38], [0.06, 0.44], [0.06, 0.5]].forEach(([dx, dy], i) => row(put, Math.round(S * dy), cx + dx * S, cx + (dx + 0.1 - i * 0.02) * S, () => [N.cyanLt, N.cyan, N.cyanDk][i]));
  put(Math.round(cx - S * 0.085), Math.round(S * 0.42), N.white); put(Math.round(cx - S * 0.035), Math.round(S * 0.42), N.white);
}
// 2 · RAMEN SIGN — vertical neon
function drawRamen(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 2); shadow(put, S, cx, S * 0.2);
  plate(put, cx - S * 0.06, S * 0.24, cx + S * 0.06, S * 0.76, N.nightDk, N.nightLt, N.oil);
  // vertical glyph blocks (neon)
  [[0.3, N.pink], [0.42, N.cyan], [0.54, N.amber], [0.66, N.pink]].forEach(([y, c]) => {
    glow(put, cx - S * 0.03, S * y, cx + S * 0.03, S * y, 1, c);
    glow(put, cx, S * (y - 0.03), cx, S * (y + 0.03), 1, c);
  });
  // steam bowl icon top
  ell(put, cx, S * 0.2, S * 0.035, S * 0.02, (tx, ty) => mix(N.amberLt, N.amber, ty));
  [[-0.01, 0.15], [0.015, 0.13]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), N.white));
  // flicker patch (one glyph dark)
  plate(put, cx - S * 0.025, S * 0.52, cx + S * 0.025, S * 0.56, N.nightDk, N.night, N.oil);
}
// 3 · AC CLUSTER — humming units
function drawAC(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 3); shadow(put, S, cx, S * 0.28);
  [[-0.1, 0.62, 1], [0.09, 0.64, 0.9], [0, 0.5, 0.95]].forEach(([dx, dy, sc]) => {
    plate(put, cx + (dx - 0.09 * sc) * S, S * (dy - 0.06 * sc), cx + (dx + 0.09 * sc) * S, S * (dy + 0.06 * sc), N.concrete, N.concreteLt, N.concreteDk);
    // fan circle
    ell(put, cx + dx * S, S * dy, S * 0.035 * sc, S * 0.035 * sc, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.15 ? N.concreteDk : N.nightDk));
    [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([fx, fy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S + fx * S * 0.028 * sc, S * dy + fy * S * 0.028 * sc, 1.2, () => N.gun));
    // drip stain
    stroke(put, cx + (dx + 0.06) * S, S * (dy + 0.06 * sc), cx + (dx + 0.06) * S, S * (dy + 0.12), 1, () => N.concreteDk);
  });
}
// 4 · SAT DISH — tilted uplink
function drawDish(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 4); shadow(put, S, cx, S * 0.24);
  stroke(put, cx, S * 0.55, cx, S * 0.8, 2.6, () => N.gunDk);
  [[-0.08], [0.08]].forEach(([dx]) => stroke(put, cx, S * 0.72, cx + dx * S, S * 0.82, 1.8, () => N.gunDk));
  // dish (tilted ellipse)
  for (let t = 0; t < 1; t += 0.04) {
    const w = S * 0.14 * Math.sin(t * Math.PI);
    row(put, Math.round(S * (0.32 + t * 0.24)), cx - S * 0.05 - w * 0.6 + t * S * 0.1, cx - S * 0.05 + w + t * S * 0.1, (tx) => mix(N.chromeLt, N.chromeDk, clamp(tx * 1.2 + t * 0.2, 0, 1)));
  }
  // feed arm + blink
  stroke(put, cx - S * 0.02, S * 0.44, cx + S * 0.08, S * 0.38, 1.4, () => N.gun);
  glow(put, cx + S * 0.09, S * 0.37, cx + S * 0.09, S * 0.37, 1.4, N.redN);
}
// 5 · WATER TANK — rooftop classic
function drawTank(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 5); shadow(put, S, cx, S * 0.26);
  [[-0.12, -0.16], [0.12, 0.16], [-0.04, -0.06], [0.04, 0.06]].forEach(([t, b]) => stroke(put, cx + t * S, S * 0.56, cx + b * S, S * 0.84, 2.2, () => N.rust));
  for (let y = Math.round(S * 0.3); y < S * 0.56; y++) {
    row(put, y, cx - S * 0.15, cx + S * 0.15, (tx) => {
      let b = mix('#5a5044', '#38302a', clamp(tx * 1.25, 0, 1));
      const px = tx * 30; if ((px | 0) % 6 === 0) b = mix(b, '#241e18', 0.5);
      return b;
    });
  }
  [0.34, 0.5].forEach(y => row(put, Math.round(S * y), cx - S * 0.15, cx + S * 0.15, () => N.oil));
  for (let y2 = 0; y2 < S * 0.07; y2++) { const t = y2 / (S * 0.07), w = S * (0.16 - t * 0.12); row(put, Math.round(S * 0.23 + y2), cx - w, cx + w, (tx) => mix('#4a4238', '#2a241e', tx)); }
  // graffiti tag
  glow(put, cx - S * 0.08, S * 0.44, cx + S * 0.02, S * 0.4, 1, N.pink);
}
// 6 · ANTENNA ARRAY — blinking spires
function drawAntenna(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 6); shadow(put, S, cx, S * 0.2);
  plate(put, cx - S * 0.1, S * 0.74, cx + S * 0.1, S * 0.82, N.concrete, N.concreteLt, N.concreteDk);
  [[-0.06, 0.3, N.redN], [0.02, 0.22, N.amber], [0.08, 0.4, N.redN]].forEach(([dx, top, c]) => {
    stroke(put, cx + dx * S, S * 0.75, cx + dx * S, S * top, 1.6, () => N.gun);
    [[0.06], [0.12]].forEach(([o]) => stroke(put, cx + dx * S - S * 0.02, S * (top + o), cx + dx * S + S * 0.02, S * (top + o), 1, () => N.gunDk));
    glow(put, cx + dx * S, S * (top - 0.015), cx + dx * S, S * (top - 0.015), 1.3, c);
  });
  // guy wires
  stroke(put, cx + S * 0.02, S * 0.22, cx + S * 0.12, S * 0.74, 0.8, () => N.concreteDk);
  stroke(put, cx + S * 0.02, S * 0.22, cx - S * 0.09, S * 0.74, 0.8, () => N.concreteDk);
}
// 7 · VENDO-MAT — glowing drink machine
function drawVending(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 7); shadow(put, S, cx, S * 0.22);
  plate(put, cx - S * 0.1, S * 0.36, cx + S * 0.1, S * 0.78, '#1a3a5a', '#2e5a8a', N.oil);
  glow(put, cx - S * 0.1, S * 0.36, cx - S * 0.1, S * 0.78, 0.8, N.cyan);
  // drink window rows
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const bx = cx - S * 0.06 + c * S * 0.05, by = S * 0.42 + r * S * 0.08;
    plate(put, bx - S * 0.016, by - S * 0.025, bx + S * 0.016, by + S * 0.025, [N.pink, N.amber, N.green][((r + c) % 3)], N.white, N.nightDk);
  }
  // dispense slot + coin glow
  plate(put, cx - S * 0.06, S * 0.7, cx + S * 0.06, S * 0.75, N.nightDk, N.night, N.oil);
  put(Math.round(cx + S * 0.07), Math.round(S * 0.62), N.amberLt);
  // buzzing top sign
  glow(put, cx - S * 0.08, S * 0.33, cx + S * 0.08, S * 0.33, 1, N.cyan);
}
// 8 · POWER NEXUS — transformer + cable spaghetti
function drawPower(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 8); shadow(put, S, cx, S * 0.26);
  plate(put, cx - S * 0.09, S * 0.46, cx + S * 0.09, S * 0.7, N.gun, N.chrome, N.gunDk);
  [0.5, 0.56, 0.62].forEach(y => row(put, Math.round(S * y), cx - S * 0.07, cx + S * 0.07, () => N.gunDk)); // fins
  // insulator stack
  [[-0.05], [0.05]].forEach(([dx]) => { for (let i = 0; i < 3; i++) ell(put, cx + dx * S, S * (0.42 - i * 0.03), S * 0.02, S * 0.012, (tx, ty) => mix('#8a7a5a', '#5a4e38', ty)); });
  // cable spaghetti out both sides
  for (let i = 0; i < 3; i++) {
    for (let t = 0; t < 1; t += 0.05) {
      put(Math.round(cx - S * 0.09 - t * S * 0.18), Math.round(S * (0.5 + i * 0.05) + Math.sin(t * 6 + i) * 4 + t * 14), N.oil);
      put(Math.round(cx + S * 0.09 + t * S * 0.16), Math.round(S * (0.52 + i * 0.04) + Math.sin(t * 5 + i) * 4 + t * 12), i === 1 ? N.rust : N.oil);
    }
  }
  // hazard sign + spark
  plate(put, cx - S * 0.03, S * 0.53, cx + S * 0.03, S * 0.59, N.amber, N.amberLt, N.amberDk);
  stroke(put, cx - S * 0.008, S * 0.54, cx + S * 0.008, S * 0.575, 1.2, () => N.oil);
  put(Math.round(cx + S * 0.11), Math.round(S * 0.44), N.cyanLt);
  put(Math.round(cx + S * 0.13), Math.round(S * 0.42), N.amberLt);
}
// 9 · VENT STACK — steam chimneys
function drawVent(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 9); shadow(put, S, cx, S * 0.24);
  [[-0.08, 0.5], [0.06, 0.44]].forEach(([dx, top]) => {
    for (let y = Math.round(S * top); y < S * 0.78; y++) row(put, y, cx + (dx - 0.045) * S, cx + (dx + 0.045) * S, (tx) => {
      let b = mix('#6a6a7a', '#3a3a46', clamp(tx * 1.2, 0, 1));
      if ((y | 0) % 7 === 0) b = mix(b, '#26262e', 0.5);
      return b;
    });
    ell(put, cx + dx * S, S * top, S * 0.05, S * 0.018, (tx, ty) => mix('#8a8a9a', '#4a4a56', tx));
    // steam puffs
    for (let t = 0; t < 1; t += 0.2) ell(put, cx + dx * S + Math.sin(t * 5) * 4, S * (top - 0.04 - t * 0.12), S * (0.02 + t * 0.02), S * (0.015 + t * 0.015), (tx) => mix('#c8c8d4', N.night, clamp(t + tx * 0.3, 0, 0.9)));
  });
}
// 10 · FIRE ESCAPE — zigzag stairs chunk
function drawEscape(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 10); shadow(put, S, cx, S * 0.2);
  // platform frames
  [[0.32], [0.52], [0.72]].forEach(([y], i) => {
    row(put, Math.round(S * y), cx - S * 0.14, cx + S * 0.14, () => N.rust);
    row(put, Math.round(S * (y + 0.01)), cx - S * 0.14, cx + S * 0.14, () => '#4a2e1c');
    for (let x = -0.12; x <= 0.12; x += 0.04) stroke(put, cx + x * S, S * (y - 0.05), cx + x * S, S * y, 1, () => N.rust); // railing bars
    row(put, Math.round(S * (y - 0.05)), cx - S * 0.13, cx + S * 0.13, () => N.rust);
    // zigzag stair
    if (i < 2) for (let t = 0; t < 1; t += 0.12) put(Math.round(cx + (i % 2 ? -1 : 1) * (S * 0.12 - t * S * 0.24)), Math.round(S * (y + 0.02 + t * 0.16)), N.rust);
  });
  [[-0.14], [0.14]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.27, cx + dx * S, S * 0.78, 1.6, () => '#4a2e1c'));
  // hanging laundry bonus
  stroke(put, cx - S * 0.1, S * 0.4, cx + S * 0.04, S * 0.42, 0.8, () => N.concreteDk);
  [[-0.06, N.pink], [0, N.cyan]].forEach(([dx, c]) => plate(put, cx + dx * S - S * 0.015, S * 0.42, cx + dx * S + S * 0.015, S * 0.47, mix(c, N.night, 0.5), mix(c, N.night, 0.3), N.nightDk));
}
// 11 · DRONE DOCK — charging pad
function drawDock(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 11); shadow(put, S, cx, S * 0.26);
  // pad
  ell(put, cx, S * 0.68, S * 0.16, S * 0.05, (tx, ty) => mix(N.concreteLt, N.concreteDk, clamp(tx + ty * 0.3, 0, 1)));
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * S * 0.13), Math.round(S * 0.68 + Math.sin(a) * S * 0.04), a % 1 < 0.5 ? N.amber : N.amberDk);
  glow(put, cx, S * 0.66, cx, S * 0.66, 1.2, N.green);
  // docked drone (sleeping)
  dome(put, cx, S * 0.6, S * 0.06, S * 0.045, N.gun, N.chrome, N.gunDk);
  visor(put, cx, S * 0.6, S * 0.025, mix(N.redN, N.night, 0.5), mix(N.redNLt, N.night, 0.5));
  // charge post + cable
  stroke(put, cx + S * 0.18, S * 0.5, cx + S * 0.18, S * 0.7, 2.2, () => N.gunDk);
  glow(put, cx + S * 0.18, S * 0.48, cx + S * 0.18, S * 0.48, 1.3, N.green);
  for (let t = 0; t < 1; t += 0.08) put(Math.round(cx + S * (0.18 - t * 0.12)), Math.round(S * (0.62 + Math.sin(t * 5) * 0.02)), N.oil);
}
// 12 · HOLO SAKURA — projected tree
function drawSakura(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 12);
  // projector base
  plate(put, cx - S * 0.05, S * 0.72, cx + S * 0.05, S * 0.78, N.gun, N.chrome, N.gunDk);
  glow(put, cx, S * 0.71, cx, S * 0.71, 1.4, N.pink);
  // holo trunk (scanline)
  for (let y = S * 0.42; y < S * 0.72; y += 2) row(put, Math.round(y), cx - S * 0.015, cx + S * 0.015, () => mix(N.pink, N.night, 0.55));
  stroke(put, cx, S * 0.5, cx - S * 0.08, S * 0.42, 1.2, () => mix(N.pink, N.night, 0.5));
  stroke(put, cx, S * 0.48, cx + S * 0.09, S * 0.4, 1.2, () => mix(N.pink, N.night, 0.5));
  // blossom cloud (dotted holo)
  for (let i = 0; i < 40; i++) {
    const a = i * 2.4, r = ((i * 7919) % 100) / 100;
    const x = cx + Math.cos(a) * S * 0.13 * r, y = S * 0.36 + Math.sin(a) * S * 0.09 * r;
    if (i % 3) put(Math.round(x), Math.round(y), i % 2 ? mix(N.pinkLt, N.night, 0.3) : mix(N.pink, N.night, 0.4));
  }
  // falling holo petals
  [[0.12, 0.52], [-0.1, 0.56], [0.05, 0.62]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), N.pinkLt));
}
// 13 · DUMPSTER NEST — rat kingdom
function drawDumpster(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 13); shadow(put, S, cx, S * 0.26);
  plate(put, cx - S * 0.15, S * 0.52, cx + S * 0.15, S * 0.72, '#2e5a3a', '#4a8a5a', N.oil);
  // lid ajar w/ trash
  for (let t = 0; t < 1; t += 0.05) row(put, Math.round(S * (0.5 - t * 0.03)), cx - S * 0.15 + t * S * 0.02, cx + S * 0.15 - t * S * 0.01, (tx) => (t < 0.15 ? mix('#3a6a46', '#1e3a26', tx) : null));
  // trash overflow
  [[-0.08, 0.49, N.amber], [0.02, 0.47, N.concreteLt], [0.09, 0.5, N.pink]].forEach(([dx, dy, c]) => ell(put, cx + dx * S, S * dy, S * 0.025, S * 0.018, (tx, ty) => mix(c, mix(c, '#000000', 0.5), tx + ty)));
  // glowing rat eyes underneath
  [[-0.1], [0.05]].forEach(([dx]) => { put(Math.round(cx + dx * S), Math.round(S * 0.74), N.greenLt); put(Math.round(cx + dx * S + 2), Math.round(S * 0.74), N.greenLt); });
  // stink lines
  [[-0.05, 0.42], [0.06, 0.4]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S + 2, S * (dy - 0.05), 0.9, () => N.concreteDk));
}
// 14 · SKYLIGHT — glowing glass pyramid
function drawSkylight(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 14); shadow(put, S, cx, S * 0.3);
  // glass pyramid lit from below
  for (let y = 0; y < S * 0.22; y++) {
    const t = y / (S * 0.22), w = S * 0.2 * t;
    row(put, Math.round(S * 0.42 + y), cx - w, cx + w, (tx) => {
      let b = mix(mix(N.amberLt, N.night, 0.3), mix(N.amber, N.night, 0.5), clamp(tx * 1.2, 0, 1));
      if (Math.abs(tx - 0.5) < 0.02 || tx < 0.04 || tx > 0.96) b = N.gunDk; // frame
      return b;
    });
  }
  row(put, Math.round(S * 0.64), cx - S * 0.21, cx + S * 0.21, () => N.gunDk);
  // light shaft up
  for (let y = S * 0.28; y < S * 0.42; y += 2) row(put, Math.round(y), cx - S * 0.04, cx + S * 0.04, (tx) => mix(N.amberLt, N.night, 0.6 + tx * 0.2));
  // silhouettes below (party!)
  [[-0.08], [0.02], [0.1]].forEach(([dx]) => ell(put, cx + dx * S, S * 0.58, S * 0.015, S * 0.02, () => N.oil));
}
// 15 · SPOTLIGHT RIG — sweeping beam
function drawSpotlight(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 15); shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.08, S * 0.68, cx + S * 0.08, S * 0.76, N.gun, N.chrome, N.gunDk);
  stroke(put, cx, S * 0.56, cx, S * 0.68, 2.6, () => N.gunDk);
  // lamp head tilted
  ell(put, cx + S * 0.03, S * 0.52, S * 0.05, S * 0.04, (tx, ty) => mix(N.chrome, N.gunDk, tx + ty * 0.3));
  // beam cone sweeping up-right
  for (let t = 0; t < 1; t += 0.05) {
    const w = t * S * 0.07;
    for (let o = -1; o <= 1; o += 0.5) put(Math.round(cx + S * 0.07 + t * S * 0.22), Math.round(S * 0.48 - t * S * 0.22 + o * w), mix(N.white, N.night, 0.35 + t * 0.5));
  }
  glow(put, cx + S * 0.07, S * 0.5, cx + S * 0.07, S * 0.5, 1.6, N.white);
}
// 16 · HOLO MASCOT — giant projected cat
function drawMascot(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 16);
  // projector
  plate(put, cx - S * 0.06, S * 0.74, cx + S * 0.06, S * 0.8, N.gun, N.chrome, N.gunDk);
  glow(put, cx, S * 0.73, cx, S * 0.73, 1.4, N.cyan);
  // giant scanline cat (waving maneki style)
  const catC = (tx) => ((tx * 14 | 0) % 2 ? mix(N.cyan, N.night, 0.5) : mix(N.cyanLt, N.night, 0.42));
  for (let y = S * 0.4; y < S * 0.72; y += 2) {
    const t = (y - S * 0.4) / (S * 0.32);
    const w = S * (0.1 + t * 0.05);
    row(put, Math.round(y), cx - w, cx + w, catC);
  }
  ell(put, cx, S * 0.34, S * 0.1, S * 0.09, (tx, ty) => ((ty * 10 | 0) % 2 ? mix(N.cyan, N.night, 0.5) : mix(N.cyanLt, N.night, 0.42)));
  // ears
  [[-1], [1]].forEach(([s]) => { for (let i = 0; i < 7; i++) row(put, Math.round(S * 0.27 + i), cx + s * S * (0.09 - i * 0.004) - 3, cx + s * S * (0.09 - i * 0.004) + 3, catC); });
  // face
  put(Math.round(cx - S * 0.035), Math.round(S * 0.33), N.white); put(Math.round(cx + S * 0.035), Math.round(S * 0.33), N.white);
  stroke(put, cx - S * 0.01, S * 0.36, cx + S * 0.01, S * 0.36, 1, () => N.white);
  // waving paw + coin
  ell(put, cx + S * 0.13, S * 0.42, S * 0.035, S * 0.03, catC);
  ell(put, cx - S * 0.1, S * 0.55, S * 0.03, S * 0.03, (tx, ty) => mix(N.amberLt, N.amberDk, ty));
  // glitch band
  glitchBar(put, cx, S * 0.5, S * 0.12, mix(N.pink, N.night, 0.4), mix(N.cyan, N.night, 0.4));
}
// 17 · TARP SHANTY — rooftop squat
function drawShanty(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 17); shadow(put, S, cx, S * 0.28);
  // frame + tarp roof
  [[-0.14], [0.12]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.5, cx + dx * S, S * 0.76, 2, () => N.rust));
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1);
    row(put, Math.round(S * 0.42 + y), cx - S * (0.18 - t * 0.02), cx + S * (0.16 - t * 0.01), (tx) => {
      let b = mix('#2e6a8a', '#16394a', clamp(tx * 1.2, 0, 1));
      if (((tx * 10) | 0) % 4 === 0) b = mix(b, '#0e2836', 0.4); // tarp folds
      return b;
    });
  }
  // walls: mixed scrap
  plate(put, cx - S * 0.14, S * 0.52, cx - S * 0.02, S * 0.76, N.concrete, N.concreteLt, N.concreteDk);
  plate(put, cx - S * 0.02, S * 0.52, cx + S * 0.12, S * 0.76, N.rust, '#9a6a4a', '#4a2e1c');
  // doorway blanket + lantern
  for (let y = S * 0.58; y < S * 0.76; y++) row(put, Math.round(y), cx + S * 0.02, cx + S * 0.08, (tx) => mix(N.purpleDk, N.nightDk, tx));
  glow(put, cx - S * 0.08, S * 0.56, cx - S * 0.08, S * 0.56, 1.3, N.amber);
  // milk crate seat
  plate(put, cx + S * 0.16, S * 0.7, cx + S * 0.22, S * 0.76, '#8a2a2a', '#c85a4a', N.oil);
}
// 18 · ELEVATOR SHED — roof access
function drawShed(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 18); shadow(put, S, cx, S * 0.28);
  for (let y = Math.round(S * 0.4); y < S * 0.78; y++) row(put, y, cx - S * 0.13, cx + S * 0.13, (tx) => {
    let b = mix(N.concreteLt, N.concreteDk, clamp(tx * 1.2, 0, 1));
    if ((y | 0) % 9 === 0) b = mix(b, N.oil, 0.3);
    return b;
  });
  plate(put, cx - S * 0.15, S * 0.34, cx + S * 0.15, S * 0.4, N.concreteDk, N.concrete, N.oil);
  // door + keypad glow
  plate(put, cx - S * 0.05, S * 0.52, cx + S * 0.05, S * 0.78, N.gun, N.chrome, N.gunDk);
  row(put, Math.round(S * 0.64), cx - S * 0.04, cx + S * 0.04, () => N.gunDk);
  glow(put, cx + S * 0.08, S * 0.6, cx + S * 0.08, S * 0.6, 1.2, N.green);
  // stairwell sign
  glow(put, cx - S * 0.1, S * 0.45, cx - S * 0.02, S * 0.45, 0.9, N.redN);
  // roof pipe
  stroke(put, cx + S * 0.13, S * 0.4, cx + S * 0.13, S * 0.3, 2, () => N.rust);
}
// 19 · CELL TOWER — caged column
function drawCell(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 19); shadow(put, S, cx, S * 0.2);
  // lattice column
  for (let y = S * 0.24; y < S * 0.8; y += 3) {
    row(put, Math.round(y), cx - S * 0.04, cx + S * 0.04, (tx) => ((tx * 6 | 0) % 3 === 0 ? N.gun : null));
  }
  [[-0.04], [0.04]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.24, cx + dx * S, S * 0.8, 1.4, () => N.gunDk));
  for (let y = S * 0.28; y < S * 0.78; y += S * 0.08) { stroke(put, cx - S * 0.04, y, cx + S * 0.04, y + S * 0.04, 1, () => N.gun); stroke(put, cx + S * 0.04, y, cx - S * 0.04, y + S * 0.04, 1, () => N.gun); }
  // panel antennas top
  [[-0.07], [0], [0.07]].forEach(([dx]) => plate(put, cx + dx * S - S * 0.012, S * 0.18, cx + dx * S + S * 0.012, S * 0.26, N.chrome, N.chromeLt, N.chromeDk));
  glow(put, cx, S * 0.16, cx, S * 0.16, 1.4, N.redN);
  // signal rings
  for (let r = 1; r <= 2; r++) for (let a = -1; a < 1; a += 0.2) put(Math.round(cx + Math.cos(a - 1.57) * S * 0.05 * r), Math.round(S * 0.16 + Math.sin(a - 1.57) * S * 0.05 * r), mix(N.cyanLt, N.night, 0.4 + r * 0.2));
}
// 20 · HOLO KOI POOL — zen glitch pond
function drawKoi(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 20);
  // shallow rooftop pool
  ell(put, cx, S * 0.62, S * 0.2, S * 0.1, (tx, ty) => mix('#16394a', '#0a1c26', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  ell(put, cx, S * 0.6, S * 0.18, S * 0.08, (tx, ty) => mix('#1e4a5e', '#0e2836', clamp(tx + ty * 0.4, 0, 1)));
  ringRipple(put, cx - S * 0.06, S * 0.58, S * 0.04);
  ringRipple(put, cx + S * 0.08, S * 0.62, S * 0.03);
  function ringRipple(put2, x, y, r) { for (let a = 0; a < 6.28; a += 0.5) put2(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.4), mix(N.cyanLt, N.night, 0.55)); }
  // holo koi (scanline orange fish)
  [[-0.05, 0.6, 1], [0.07, 0.585, -1]].forEach(([dx, dy, dir]) => {
    for (let t = 0; t < 1; t += 0.08) {
      const w = S * 0.014 * Math.sin(t * Math.PI);
      row(put, Math.round(S * dy + Math.sin(t * 4) * 1.5), cx + dx * S + dir * t * S * 0.07 - w, cx + dx * S + dir * t * S * 0.07 + w, (tx) => ((t * 12 | 0) % 2 ? mix(N.amber, N.night, 0.35) : mix(N.amberLt, N.night, 0.3)));
    }
  });
  // pool edge glow
  for (let a = 0; a < 6.28; a += 0.25) put(Math.round(cx + Math.cos(a) * S * 0.2), Math.round(S * 0.62 + Math.sin(a) * S * 0.1), a % 0.5 < 0.25 ? mix(N.purple, N.night, 0.4) : mix(N.purpleDk, N.night, 0.4));
}

const LIST = [
  { n: 1, name: 'HOLO BILLBOARD', role: 'giant animated ad', draw: drawBillboard },
  { n: 2, name: 'RAMEN SIGN', role: 'vertical neon, flicker', draw: drawRamen },
  { n: 3, name: 'AC CLUSTER', role: 'humming units', draw: drawAC },
  { n: 4, name: 'SAT DISH', role: 'tilted uplink', draw: drawDish },
  { n: 5, name: 'WATER TANK', role: 'rusty rooftop classic', draw: drawTank },
  { n: 6, name: 'ANTENNA ARRAY', role: 'blinking spires', draw: drawAntenna },
  { n: 7, name: 'VENDO-MAT', role: 'glowing drink machine', draw: drawVending },
  { n: 8, name: 'POWER NEXUS', role: 'transformer + cables', draw: drawPower },
  { n: 9, name: 'VENT STACK', role: 'steam chimneys', draw: drawVent },
  { n: 10, name: 'FIRE ESCAPE', role: 'zigzag + laundry', draw: drawEscape },
  { n: 11, name: 'DRONE DOCK', role: 'charging pad', draw: drawDock },
  { n: 12, name: 'HOLO SAKURA', role: 'projected tree', draw: drawSakura },
  { n: 13, name: 'DUMPSTER NEST', role: 'rat kingdom', draw: drawDumpster },
  { n: 14, name: 'SKYLIGHT', role: 'lit glass pyramid', draw: drawSkylight },
  { n: 15, name: 'SPOTLIGHT RIG', role: 'sweeping beam', draw: drawSpotlight },
  { n: 16, name: 'HOLO MASCOT', role: 'giant glitch cat', draw: drawMascot },
  { n: 17, name: 'TARP SHANTY', role: 'rooftop squat', draw: drawShanty },
  { n: 18, name: 'ELEVATOR SHED', role: 'roof access', draw: drawShed },
  { n: 19, name: 'CELL TOWER', role: 'caged column', draw: drawCell },
  { n: 20, name: 'HOLO KOI POOL', role: 'zen glitch pond', draw: drawKoi },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_decor_options.png', title: 'NEON CITY — DECOR CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
