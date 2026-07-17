// artdev/lunar/render_lunar_boss_final.js — THE OVERMIND final boss art
// (Red's pick, boss sheet #2): a vast grafted brain in a cracked containment
// tank, floating on its own telekinesis, cables dangling like tentacles,
// debris orbiting. 2x scale approval render — THE CANON ART.
'use strict';
const KIT = require('./space_kit.js');
const { L, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, visor, hover, star } = KIT;

function drawOvermindFinal(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  // telekinetic hover glow instead of legs
  hover(put, cx, S * 0.9, S * 0.18, L.voidDk);
  ell(put, cx, S * 0.885, S * 0.11, S * 0.03, () => L.void);

  // dangling cable-tentacles (torn loose from the floor)
  [[-0.16, 0.3, -0.26, 0.42], [-0.06, 0.32, -0.08, 0.46], [0.08, 0.32, 0.14, 0.44], [0.18, 0.3, 0.28, 0.4]].forEach(([a, b2, c, d], i) => {
    for (let t = 0; t < 1; t += 0.09) {
      const px = cx + lerp(a, c, t) * S + Math.sin(t * 6 + i) * S * 0.015;
      const py = cy + lerp(b2, d, t) * S;
      ell(put, px, py, S * (0.02 - t * 0.008), S * 0.016, (tx, ty) => mix(L.steelDk, L.oil, ty + t * 0.3));
    }
    put(Math.round(cx + c * S), Math.round(cy + d * S), i % 2 ? L.holo : L.warn); // live ends sparking
  });

  // tank base collar + cap
  plate(put, cx - S * 0.2, cy + S * 0.22, cx + S * 0.2, cy + S * 0.32, L.steel, L.steelLt, L.steelDkk);
  row(put, Math.round(cy + S * 0.25), cx - S * 0.2, cx + S * 0.2, () => L.warn);
  plate(put, cx - S * 0.18, cy - S * 0.38, cx + S * 0.18, cy - S * 0.28, L.steel, L.steelLt, L.steelDkk);
  [[-0.12], [0.0], [0.12]].forEach(([o], i) => put(Math.round(cx + o * S), Math.round(cy - S * 0.33), [L.holo, L.red, L.holo][i]));
  // cap vents hissing
  [[-0.08], [0.08]].forEach(([o]) => { stroke(put, cx + o * S, cy - S * 0.38, cx + o * S + S * 0.02, cy - S * 0.46, 1, () => L.holoDk); });

  // glass cylinder w/ murky fluid
  for (let y = Math.round(cy - S * 0.28); y < cy + S * 0.22; y++) {
    const t = (y - (cy - S * 0.28)) / (S * 0.5);
    row(put, y, cx - S * 0.17, cx + S * 0.17, (tx) => {
      let b = mix(L.visorLt, L.visor, Math.abs(tx - 0.5) * 2);
      b = mix(b, '#0e3a2a', 0.45);
      if (tx < 0.12) b = mix(b, '#ffffff', 0.25); // glass edge shine
      if (Math.sin(t * 20 + tx * 6) > 0.92) b = mix(b, '#4a8a6a', 0.4); // bubbles line
      return b;
    });
  }
  // rising bubbles
  [[-0.1, 0.14], [-0.08, 0.02], [0.11, 0.1], [0.09, -0.06], [0.0, 0.18]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.012, S * 0.012, () => '#7ac2a0');
  });

  // THE BRAIN — huge, wrinkled, veined with psychic light
  dome(put, cx, cy - S * 0.08, S * 0.14, S * 0.13, L.flesh, mix(L.flesh, '#ffffff', 0.45), L.fleshDk);
  dome(put, cx - S * 0.07, cy - S * 0.14, S * 0.07, S * 0.055, mix(L.flesh, '#ffffff', 0.3), '#ffffff', L.fleshDk);
  dome(put, cx + S * 0.07, cy - S * 0.13, S * 0.065, S * 0.05, L.flesh, mix(L.flesh, '#ffffff', 0.4), L.fleshDk);
  // deep folds
  [[-0.1, -0.12, -0.02, -0.04], [-0.04, -0.18, 0.04, -0.08], [0.03, -0.05, 0.11, -0.13], [-0.09, -0.02, 0.0, 0.02]].forEach(([a, b2, c, d]) =>
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 2, () => L.fleshDk));
  // psychic veins glowing violet
  [[-0.11, -0.08, -0.05, -0.15], [0.06, -0.16, 0.11, -0.07], [-0.02, -0.01, 0.05, -0.06]].forEach(([a, b2, c, d]) =>
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.voidLt));
  // brainstem trailing down into the dark
  stroke(put, cx, cy + S * 0.04, cx - S * 0.02, cy + S * 0.18, S * 0.03, (t) => mix(L.fleshDk, '#0e3a2a', t));

  // the grafted EYE — lidless, violet, wired in
  ell(put, cx, cy + S * 0.05, S * 0.065, S * 0.06, () => L.fleshDk);
  optic(put, cx, cy + S * 0.05, S * 0.048, L.voidDk, L.void, L.voidLt);
  [[-0.06, 0.04], [0.06, 0.06]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S * 2, cy + oy * S + S * 0.04, 1, () => L.steelDk)); // wires into the eye

  // THE CRACK — long fracture down the glass, fluid weeping out
  stroke(put, cx + S * 0.09, cy - S * 0.26, cx + S * 0.14, cy - S * 0.08, 1, () => '#ffffff');
  stroke(put, cx + S * 0.14, cy - S * 0.08, cx + S * 0.12, cy + S * 0.08, 1, () => '#dcecff');
  stroke(put, cx + S * 0.12, cy + S * 0.06, cx + S * 0.16, cy - S * 0.02, 1, () => '#dcecff');
  stroke(put, cx + S * 0.13, cy + S * 0.08, cx + S * 0.15, cy + S * 0.24, 1, () => '#4a8a6a');
  ell(put, cx + S * 0.16, cy + S * 0.3, S * 0.04, S * 0.014, () => '#2a5a44');

  // psychic halo rings around the whole tank
  for (let a = 0; a < 6.28; a += 0.14) {
    const px = cx + Math.cos(a) * S * 0.32, py = cy - S * 0.04 + Math.sin(a) * S * 0.28;
    if ((a * 9 | 0) % 2 === 0) put(Math.round(px), Math.round(py), L.voidLt);
  }
  // orbiting telekinetic debris (low-grav!)
  [[-0.36, -0.2, 0.025], [0.38, -0.1, 0.02], [-0.32, 0.14, 0.018], [0.3, 0.26, 0.022]].forEach(([ox, oy, r]) => {
    dome(put, cx + ox * S, cy + oy * S, r * S, r * S * 0.8, L.steel, L.steelLt, L.steelDkk);
    for (let a = 0; a < 6.28; a += 1.2) put(Math.round(cx + ox * S + Math.cos(a) * S * 0.035), Math.round(cy + oy * S + Math.sin(a) * S * 0.03), L.voidDk);
  });
  star(put, Math.round(cx - S * 0.4), Math.round(cy - S * 0.34), L.voidLt);
  star(put, Math.round(cx + S * 0.42), Math.round(cy + S * 0.06), L.voidLt);
}

renderSheet({
  list: [{ n: 2, name: 'THE OVERMIND', role: 'grafted brain — final', draw: drawOvermindFinal }],
  out: process.argv[2] || 'lunar_boss_final.png',
  title: 'LUNAR STATION BOSS FINAL — THE OVERMIND',
  S: 160, cols: 1, scale: 2
}).catch(e => { console.error(e); process.exit(1); });
