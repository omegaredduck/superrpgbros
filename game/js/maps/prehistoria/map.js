// ============================================================================
// game/js/maps/prehistoria/map.js — PREHISTORIA (realm 19) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). LOST WORLD, not theme
// park: real-anatomy dinos, an angry meteor sky, a boss that hatches out of an
// egg bigger than it is. Numbers TUNE ME. Toroidal wrap both axes.
// ============================================================================
(function () {
  'use strict';

  // ---- "PRIMAL.EXE" — DARK TRANCE (TAKE 2, RED-APPROVED "perfect"). Port of
  // render_prehistoria_theme.js as a section composer: 140 BPM D minor
  // (bass D-D-Bb-A), 105 bars x 4 = 420 beats = EXACTLY 180.0s. NO INTRO —
  // four-on-the-floor kick + rolling 16th acid bass from bar 0. A grind ->
  // B acid arp rises -> C dark riff enters -> D tension (pads + arp octave up,
  // the KICK NEVER STOPS) + snare-roll build -> E THE DROP at bar 64 (riff +
  // high echo) -> F octave-doubled finale -> low-D ring-out at 180.0.
  var PRIMAL = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [38, 38, 34, 33];                              // D D Bb A (i i VI V — dark)
    var CH = [[50, 53, 57], [50, 53, 57], [46, 50, 53], [45, 49, 52]]; // Dm Dm Bb A(C# bite)
    var LEAD = [                                               // the dark riff, 8 eighths / bar%4
      [62, -1, 62, 65, 62, 68, 67, 65], [62, 62, 65, 67, 69, 70, 69, 65],
      [62, -1, 62, 65, 62, 68, 67, 61], [62, 65, 67, 69, 74, 74, 73, 73]
    ];
    var ARP = [0, 12, 3, 12, 7, 12, 10, 12, 0, 12, 3, 15, 7, 12, 10, 13]; // acid, octave-jumping
    function sec(b) {
      if (b < 16) return { kick: true, hats: b >= 2, bass: true };                          // A grind
      if (b < 32) return { kick: true, hats: true, bass: true, arp: true, stab: true };      // B acid rises
      if (b < 48) return { kick: true, hats: true, bass: true, arp: b % 4 >= 2, riff: true };// C dark riff
      if (b < 60) return { kick: true, hats: true, bass: true, arp: true, pads: true, up: 12 };            // D tension
      if (b < 64) return { kick: true, hats: true, bass: true, arp: true, pads: true, up: 12, build: b - 60 }; // D build tail
      if (b < 88) return { kick: true, hats: true, bass: true, arp: true, riff: true, lead: true, big: true }; // E DROP
      if (b < 104) return { kick: true, hats: true, bass: true, arp: true, riff: true, lead: true, big: true, up: 12 }; // F finale
      return { last: true };                                                                  // ring-out
    }
    var DOORS = { 16: 1, 32: 1, 48: 1, 64: 1, 88: 1 };
    var KK = m2n(26), HO = 'A7', HC = 'C8', SN = 'A#7';
    var kick = [], hatO = [], hatC = [], bass = [], arp = [], leadA = [], leadB = [],
        pad1 = [], pad2 = [], build = [], sub = [], flavor = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), t = b % 4, root = ROOTS[t], chord = CH[t], last = !!s.last;
      // four-on-the-floor (never stops — even through the tension)
      if (s.kick) { for (var k = 0; k < 4; k++) kick.push([KK, 0.12], [null, 0.88]); }
      else if (b === 104) kick.push([KK, 0.12], [null, 3.88]);                     // the last kick
      else kick.push([null, 4]);
      // offbeat open hats + 16th closed ticks
      if (s.hats) { for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [HO, 0.1], [null, 0.4]); } else hatO.push([null, 4]);
      if (s.hats && b >= 16) { for (var h2 = 0; h2 < 4; h2++) hatC.push([null, 0.25], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17]); } else hatC.push([null, 4]);
      // ACID BASS: 16th offbeats, octave pops, duck the kick
      if (s.bass) { for (var e = 0; e < 16; e++) { if (e % 4 === 0) { bass.push([null, 0.25]); continue; } var bm = root - 12 + ((e % 8 === 6) ? 12 : 0); bass.push([m2n(bm), 0.2], [null, 0.05]); } } else bass.push([null, 4]);
      // acid arp: 16ths, chord/octave jumps (+24, up an octave in D)
      if (s.arp) { for (var e2 = 0; e2 < 16; e2++) arp.push([m2n(root + 24 + (s.up || 0) + ARP[e2]), 0.21], [null, 0.04]); } else arp.push([null, 4]);
      // dark riff — twin detuned voices (drop + finale)
      if (s.riff || s.lead) {
        for (var e3 = 0; e3 < 8; e3++) {
          var lm = LEAD[t][e3];
          if (lm < 0) { leadA.push([null, 0.5]); leadB.push([null, 0.5]); continue; }
          leadA.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
          leadB.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
        }
      } else { leadA.push([null, 4]); leadB.push([null, 4]); }
      // tension pads (gated 8ths) / dark chord stabs
      if (s.pads) {
        for (var e5 = 0; e5 < 8; e5++) {
          if (e5 % 4 === 3) { pad1.push([null, 0.5]); pad2.push([null, 0.5]); continue; }
          pad1.push([m2n(chord[0]), 0.35], [null, 0.15]);
          pad2.push([m2n(chord[2]), 0.35], [null, 0.15]);
        }
      } else if (s.stab) {
        pad1.push([null, 1.5], [m2n(chord[1]), 0.2], [null, 1.8], [m2n(chord[1]), 0.2], [null, 0.3]);
        pad2.push([null, 1.5], [m2n(chord[2]), 0.2], [null, 1.8], [m2n(chord[2]), 0.2], [null, 0.3]);
      } else { pad1.push([null, 4]); pad2.push([null, 4]); }
      // snare-roll BUILD (D tail — accelerating density, the kick runs through)
      if (s.build != null && !last) { var den = [4, 6, 8, 16][s.build]; for (var r3 = 0; r3 < den; r3++) build.push([SN, 0.08], [null, 4 / den - 0.08]); } else build.push([null, 4]);
      // drop sub layer
      if (last) sub.push([m2n(root - 12), 3.8], [null, 0.2]);                      // low-D ring-out
      else sub.push(s.big ? [m2n(root - 12), 3.8] : [null, 3.8], [null, 0.2]);
      // section doors + dark stab accents + the final ring
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (last) flavor.push([null, 2.6], [m2n(74), 0.15], [null, 0.4], [m2n(74), 0.15], [null, 0.7]);
      else if (s.stab || s.riff) flavor.push([null, 1.5], [m2n(chord[1] + 12), 0.2], [null, 2.3]);
      else flavor.push([null, 4]);
    }
    var TR = [kick, hatO, hatC, bass, arp, leadA, leadB, pad1, pad2, build, sub, flavor];
    var beats = 0;
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (!beats) beats = sum;
      if (Math.abs(sum - beats) > 1e-6) throw new Error('PRIMAL.EXE track beat mismatch: ' + sum + ' vs ' + beats);
    });
    if (beats !== 420 || Math.abs(beats * 60 / 140 - 180) > 1e-9) throw new Error('PRIMAL.EXE not 180.0s: ' + beats + ' beats');
    return {
      bpm: 140,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },   // four-on-the-floor techno kick
        { type: 'square',   vol: 0.014, notes: hatO },   // offbeat open hats
        { type: 'square',   vol: 0.008, notes: hatC },   // 16th closed ticks
        { type: 'square',   vol: 0.095, notes: bass },   // ACID rolling bass
        { type: 'square',   vol: 0.03,  notes: arp },    // acid arp
        { type: 'square',   vol: 0.06,  notes: leadA },  // dark riff voice 1
        { type: 'sawtooth', vol: 0.032, notes: leadB },  // detune substitute voice 2
        { type: 'square',   vol: 0.024, notes: pad1 },   // tension pad / stab 1
        { type: 'square',   vol: 0.02,  notes: pad2 },   // tension pad / stab 2
        { type: 'square',   vol: 0.05,  notes: build },  // snare-roll build
        { type: 'triangle', vol: 0.08,  notes: sub },    // drop sub layer
        { type: 'triangle', vol: 0.05,  notes: flavor }  // doors + dark stabs + ring
      ]
    };
  })();

  MAPS.register({
    id: 'prehistoria',

    installData: function (DATA) {
      DATA.biomes.prehistoria = {
        name: 'Prehistoria', tile: 'phtJungle',
        mobs: ['raptor', 'compy', 'trike', 'stego', 'ptero', 'dilo', 'brachio']
      };
      DATA.realms.prehistoria = {
        name: 'Prehistoria', biome: 'prehistoria', boss: 'primordial',
        kind: 'prehistoria', music: 'prehistoria',
        // METEOR SHOWER cycle knobs (PLAN §2) — ALL TUNE ME
        meteor: { cycleMs: 15000, omenMs: 1600, waveCount: 5, impactWarnMs: 1000,
                  gapMs: 320, radius: 62, dmg: 20, puddleMs: 3200, puddleDmg: 5,
                  puddleTickMs: 700, neBias: 0.62, maxLive: 8, safeR: 150 },
        // BRACHIO neutral-until-provoked (PLAN §4, trap list)
        brachio: { neutralUntilProvoked: true, calmMs: 9000 },
        // RECOLOR spawn table — one variant per mob EXCEPT the pterodactyl (6 rows)
        recolorVariants: [
          { base: 'raptor',  name: 'Jungle Raptor',   tex: 'prehistoriaRaptorJungleHi',   tint: 0x6aac4e },
          { base: 'compy',   name: 'Rust Compies',    tex: 'prehistoriaCompyRustHi',      tint: 0xc87a2e },
          { base: 'trike',   name: 'Moss Triceratops',tex: 'prehistoriaTrikeMossHi',      tint: 0x7a8a3a },
          { base: 'stego',   name: 'Ember Stego',     tex: 'prehistoriaStegoEmberHi',     tint: 0xc8452a },
          { base: 'dilo',    name: 'Midnight Dilo',   tex: 'prehistoriaDiloMidnightHi',   tint: 0x4a4a8a },
          { base: 'brachio', name: 'Storm Brachio',   tex: 'prehistoriaBrachioStormHi',   tint: 0x5a6a7a }
        ]
      };

      // ---- the 7 mobs (Red picks #1 2 3 4 5 6 20; DINOS ONLY) ----
      DATA.mobs.raptor = { name: 'Raptor', texture: 'prehistoriaRaptorHi', hp: 55, spd: 132, xp: 16, cost: 2,
        deathTint: 0xc87a2e, chase: { contactDmg: 10 },
        skins: ['prehistoriaRaptorHi', 'prehistoriaRaptorJungleHi'],   // mixed recolor
        mapVerb: 'raptorLunge',                                        // warned sickle-claw mini-dash
        lunge: { range: 260, warnMs: 520, dashMs: 300, dashSpeed: 430, cooldownMs: 3600 },
        maxConcurrent: 5, unlockAt: 0 };
      DATA.mobs.compy = { name: 'Compy Swarm', texture: 'prehistoriaCompyHi', hp: 14, spd: 152, xp: 5, cost: 1,
        deathTint: 0x5a7a34, chase: { contactDmg: 4 },
        skins: ['prehistoriaCompyHi', 'prehistoriaCompyRustHi'],
        maxConcurrent: 8, unlockAt: 0 };
      DATA.mobs.trike = { name: 'Triceratops', texture: 'prehistoriaTrikeHi', hp: 180, spd: 60, xp: 26, cost: 3,
        deathTint: 0x4a6a7a, chase: { contactDmg: 12 },
        skins: ['prehistoriaTrikeHi', 'prehistoriaTrikeMossHi'],
        mapVerb: 'trikeCharge',                                        // warned shield-charge line, capped KB
        charge: { everyMs: 5200, range: 460, warnMs: 950, len: 520, half: 26, chargeMs: 1000, speed: 440, kb: 300, dmg: 20 },
        unlockAt: 25 };
      DATA.mobs.stego = { name: 'Stegosaurus', texture: 'prehistoriaStegoHi', hp: 240, spd: 42, xp: 32, cost: 4,
        deathTint: 0x5a7a34, chase: { contactDmg: 14 },
        skins: ['prehistoriaStegoHi', 'prehistoriaStegoEmberHi'],
        mapVerb: 'stegoSweep',                                         // warned thagomizer tail sweep (rear arc)
        sweep: { everyMs: 4600, range: 190, warnMs: 850, halfRad: 1.05, dmg: 20 },
        maxConcurrent: 2, unlockAt: 40 };
      DATA.mobs.ptero = { name: 'Pterodactyl', texture: 'prehistoriaPteroHi', hp: 42, spd: 116, xp: 16, cost: 2,
        deathTint: 0xb06a4a, float: true,                              // airborne diver — NO recolor (Red exempt), NO chase
        mapVerb: 'pteroDive',                                          // shadow marks the dive lane (valkyrie tech)
        dive: { everyMs: 4800, range: 460, warnMs: 950, len: 300, half: 30, diveMs: 340, speed: 480, dmg: 16 },
        maxConcurrent: 3, unlockAt: 30 };
      DATA.mobs.dilo = { name: 'Dilophosaurus', texture: 'prehistoriaDiloHi', hp: 70, spd: 82, xp: 20, cost: 3,
        deathTint: 0x5a7a34, chase: { contactDmg: 8 },
        skins: ['prehistoriaDiloHi', 'prehistoriaDiloMidnightHi'],
        mapVerb: 'diloSpit',                                           // warned venom arc -> lingering venom puddle
        spit: { everyMs: 5000, range: 420, count: 2, scatter: 120, radius: 60, warnMs: 900,
                dmg: 14, puddleMs: 3800, puddleDmg: 4, puddleTickMs: 800, slowMult: 0.6 },
        unlockAt: 35 };
      DATA.mobs.brachio = { name: 'Brachiosaurus', texture: 'prehistoriaBrachioHi', hp: 420, spd: 30, xp: 60, cost: 5,
        deathTint: 0x6e7a50, chase: { contactDmg: 18 },
        skins: ['prehistoriaBrachioHi', 'prehistoriaBrachioStormHi'],
        mapVerb: 'brachioStomp',                                       // NEUTRAL until provoked -> warned quake-stomp circle
        stomp: { everyMs: 4200, range: 220, warnMs: 1000, radius: 120, dmg: 22, wanderSpd: 34 },
        maxConcurrent: 1, unlockAt: 55 };

      // ---- THE PRIMORDIAL — feathered dino-dragon (mapOwned; hatches from the egg) ----
      DATA.bosses.primordial = {
        name: 'The Primordial', texture: 'prehistoriaPrimordialHi',
        hp: 4200, spd: 34, xp: 620, contactDmg: 22, deathTint: 0xc8452a,
        lootTable: 'primordial',
        mapOwned: true, entranceMs: 3600,                              // THE HATCH = 4 beats
        patterns: {
          verbEveryMs: 5200,
          tailLash:   { range: 210, warnMs: 850, halfRad: 0.9, dmg: 24 },
          fireBreath: { range: 320, warnMs: 1100, halfRad: 0.55, sweepRad: 1.1, steps: 6, gapMs: 130, dmg: 22 },
          wingGust:   { range: 300, warnMs: 900, halfRad: 0.7, dmg: 14, kb: 300 },   // CAPPED knockback (displacement tag)
          compyCall:  { everyMs: 15000, count: 3, cap: 10 },           // fromBoss, glow, NO drops
          dive:       { warnMs: 950, len: 520, half: 30, diveMs: 360, speed: 520, dmg: 22, count: 2 }, // P2 shadow strafes
          meteorCall: { count: 6, ringR: 200, warnMs: 1000, gapMs: 300, ventMs: 3400, ventDmgMult: 1.5 }, // SIGNATURE
          p2HpPct: 0.5,
          overclock:  { hpPct: 0.28, rateMult: 0.74 }
        },
        title: 'THE APEX HATCHLING',
        hints: [
          'Streaks in the sky mean stones are coming — stand OUTSIDE the warned circles.',
          'The lava puddles cool and fade; wait them out rather than wading through.',
          'His DIVE follows the shadow along its lane — step off the marked line.',
          'Dilos spit from the reeds and the venom LINGERS — never fight from a puddle.',
          'The big longneck is peaceful until you hit it; let it wander and it leaves you be.',
          'When his roar CALLS THE METEORS down, the last stone leaves him WINDED — unload.'
        ]
      };
      DATA.dropTables.primordial = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.meteoromen = { type: 'sawtooth', freq: 2600, freqEnd: 900, len: 0.7, vol: 0.07, limitMs: 800,
                                       noise: { vol: 0.05, hp: 2600 } };
      DATA.audio.sounds.meteorboom = { type: 'triangle', freq: 120, freqEnd: 40, len: 0.6, vol: 0.16, limitMs: 700,
                                       noise: { vol: 0.12, hp: 400 } };
      DATA.audio.sounds.lavasizzle = { type: 'sawtooth', freq: 1800, freqEnd: 1400, len: 0.5, vol: 0.06, limitMs: 600,
                                       noise: { vol: 0.05, hp: 3000 } };
      DATA.audio.sounds.raptorshriek = { type: 'square', freq: 1400, freqEnd: 700, len: 0.3, vol: 0.1, limitMs: 350,
                                         noise: { vol: 0.05, hp: 1800 } };
      DATA.audio.sounds.compychirp = { type: 'square', freq: 1800, freqEnd: 2200, len: 0.1, vol: 0.08, limitMs: 160 };
      DATA.audio.sounds.trikebellow = { type: 'sawtooth', freq: 140, freqEnd: 90, len: 0.6, vol: 0.14, limitMs: 700,
                                        noise: { vol: 0.06, hp: 300 } };
      DATA.audio.sounds.stegowhoosh = { type: 'square', freq: 500, freqEnd: 160, len: 0.28, vol: 0.13, limitMs: 320 };
      DATA.audio.sounds.pteroscreech = { type: 'square', freq: 2400, freqEnd: 1000, len: 0.28, vol: 0.09, limitMs: 320,
                                         noise: { vol: 0.05, hp: 2400 } };
      DATA.audio.sounds.dilospit = { type: 'sawtooth', freq: 1600, freqEnd: 600, len: 0.24, vol: 0.1, limitMs: 280,
                                     noise: { vol: 0.06, hp: 2000 } };
      DATA.audio.sounds.quakestomp = { type: 'triangle', freq: 90, freqEnd: 50, len: 0.7, vol: 0.16, limitMs: 800,
                                       noise: { vol: 0.08, hp: 260 } };
      DATA.audio.sounds.hatchcrack = { type: 'square', freq: 700, freqEnd: 200, len: 0.4, vol: 0.15, limitMs: 450,
                                       noise: { vol: 0.1, hp: 1200 } };
      DATA.audio.sounds.hatchflash = { type: 'square', arp: [880, 1100, 1320, 1760], len: 0.6, vol: 0.14, limitMs: 700 };
      DATA.audio.sounds.dragonroar = { type: 'sawtooth', freq: 160, freqEnd: 70, len: 0.9, vol: 0.17, limitMs: 1000,
                                       noise: { vol: 0.1, hp: 320 } };
      DATA.audio.sounds.tailwhoosh = { type: 'square', freq: 520, freqEnd: 140, len: 0.26, vol: 0.14, limitMs: 300 };
      DATA.audio.sounds.breathrake = { type: 'sawtooth', freq: 900, freqEnd: 400, len: 0.6, vol: 0.1, limitMs: 700,
                                       noise: { vol: 0.08, hp: 1400 } };
      DATA.audio.sounds.wingbuffet = { type: 'sawtooth', freq: 260, freqEnd: 120, len: 0.5, vol: 0.13, limitMs: 600,
                                       noise: { vol: 0.09, hp: 500 } };
      DATA.audio.sounds.ignitefwoosh = { type: 'sawtooth', freq: 300, freqEnd: 900, len: 0.5, vol: 0.12, limitMs: 600,
                                         noise: { vol: 0.08, hp: 1000 } };
      DATA.audio.sounds.windedsnort = { type: 'triangle', freq: 200, freqEnd: 90, len: 0.5, vol: 0.13, limitMs: 600 };
      DATA.audio.music.prehistoria = PRIMAL;

      MAPS.addConsoleMap(DATA, { id: 'prehistoria', name: 'PREHISTORIA',
        sub: 'the sky is falling', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof PREHISTORIA_ART !== 'undefined') PREHISTORIA_ART.buildInto(ctx);
    },

    mobVerbs: {
      raptorLunge:  function (scene, m, player, time) { return scene._phRaptor(m, player, time); },
      trikeCharge:  function (scene, m, player, time) { return scene._phTrike(m, player, time); },
      stegoSweep:   function (scene, m, player, time) { return scene._phStego(m, player, time); },
      pteroDive:    function (scene, m, player, time) { return scene._phPtero(m, player, time); },
      diloSpit:     function (scene, m, player, time) { return scene._phDilo(m, player, time); },
      brachioStomp: function (scene, m, player, time) { return scene._phBrachio(m, player, time); }
    },

    scene: (typeof PREHISTORIA_SCENE !== 'undefined') ? PREHISTORIA_SCENE : {}
  });
})();
