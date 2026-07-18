// ============================================================================
// game/js/maps/pirate/map.js — PIRATE SHIP (realm 9) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-16). THE PIVOT: mobs are
// LIVING pirates + sea creatures — the ghost element belongs to CAPTAIN
// KRAKEN's summon only. Numbers TUNE ME, pitched a notch above lunar.
// ============================================================================
(function () {
  'use strict';

  // ---- "THE KRAKEN'S SHANTY" — 8-bit sea shanty gone ghostly (Red-approved
  // WAV). Port of assets/render/render_pirate_theme.js as a section composer:
  // 100 BPM D dorian, 75 bars = 300 beats = EXACTLY 180.0s. Ten monophonic
  // chip voices, EXACTLY 4 beats per bar per track (asserted). Concertina
  // lead + chord pumps, stomp-and-clap engine, crew "HEY!" shouts, driving
  // root-fifth bass → ghost-choir pads creep in → THE FATHOMS (sonar blips,
  // a bending wail) → ghostly chorus → the final rowdy octave-up chorus →
  // one last HEY! and a ghost breath.
  var KRAKENS_SHANTY = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [38, 41, 36, 38], CH = [[62, 65, 69], [65, 69, 72], [60, 64, 67], [62, 65, 69]];
    var MEL_V = [
      [62, -1, 62, 64, 65, -1, 64, 62], [65, -1, 65, 67, 69, -1, 67, 65],
      [67, 67, 64, 64, 60, -1, 62, 64], [62, -1, 60, 58, 62, -1, -1, -1]
    ];
    var MEL_C = [
      [69, -1, 69, 67, 65, 67, 69, -1], [72, -1, 72, 69, 67, -1, 65, 67],
      [69, 67, 65, 64, 62, 64, 65, 67], [62, -1, 62, -1, 62, -1, -1, -1]
    ];
    function sec(b) {
      if (b < 8) return { mel: 'V' };
      if (b < 20) return { drums: true, bass: true, mel: 'V', box2: true };
      if (b < 28) return { drums: true, bass: true, mel: 'C', box2: true, hey: true };
      if (b < 40) return { drums: true, bass: true, mel: 'V', box2: true, ghost: true };
      if (b < 48) return { drums: 'half', bass: true, mel: null, ghost: true, fathoms: true };
      if (b < 56) return { drums: true, bass: true, mel: 'C', box2: true, hey: true, ghost: true };
      if (b < 68) return { drums: true, bass: true, mel: 'C', box2: true, hey: true, up: 12 };
      return { drums: b < 72, bass: true, mel: b < 72 ? 'V' : null, ghost: true };
    }
    var DOORS = { 8: 1, 20: 1, 28: 1, 40: 1, 48: 1, 56: 1, 68: 1 };
    var BASS_P = [0, 0, 7, 0, 0, 7, 0, 5];
    var bass = [], lead = [], pump1 = [], pump2 = [], stomp = [], clap = [],
        shout = [], ghost1 = [], ghost2 = [], deep = [];
    var ST = m2n(26), CL = 'A#7';
    for (var b = 0; b < 75; b++) {
      var s = sec(b), t = b % 4, isLast = b === 74;
      var root = ROOTS[t], chord = CH[t];
      // driving root-fifth bass on 8ths
      if (s.bass && !isLast) { for (var e = 0; e < 8; e++) bass.push([m2n(root + BASS_P[e]), 0.5]); }
      else bass.push([null, 4]);
      // concertina melody (8ths)
      var line = s.mel === 'V' ? MEL_V[t] : s.mel === 'C' ? MEL_C[t] : null;
      if (line && !isLast) {
        for (var e2 = 0; e2 < 8; e2++) {
          var m = line[e2];
          lead.push(m < 0 ? [null, 0.5] : [m2n(m + (s.up || 0)), 0.5]);
        }
      } else lead.push([null, 4]);
      // squeeze-box chord pumps on the offbeats (two reed voices)
      if (s.box2 && !isLast) {
        for (var e3 = 0; e3 < 4; e3++) {
          pump1.push([null, 0.5], [m2n(chord[2]), 0.25], [null, 0.25]);
          pump2.push([null, 0.5], [m2n(chord[1]), 0.25], [null, 0.25]);
        }
      } else { pump1.push([null, 4]); pump2.push([null, 4]); }
      // stomp-and-clap engine
      if (s.drums === 'half') { stomp.push([ST, 0.15], [null, 3.85]); clap.push([null, 4]); }
      else if (s.drums && !isLast) {
        stomp.push([ST, 0.15], [null, 1.85], [ST, 0.15], [null, 1.2], [ST, 0.12], [null, 0.53]);
        clap.push([null, 1], [CL, 0.08], [null, 1.92], [CL, 0.08], [null, 0.92]);
      } else { stomp.push([null, 4]); clap.push([null, 4]); }
      // crew HEY! + the section-door swell + the finale
      if (isLast) shout.push([null, 1], [m2n(50), 0.25], [null, 0.75], [m2n(74), 2]);
      else if (DOORS[b]) shout.push([m2n(chord[0] - 12), 1.4], [null, 2.6]);
      else if (s.hey && t % 2 === 1) shout.push([null, 1.5], [m2n(50), 0.25], [null, 2.25]);
      else shout.push([null, 4]);
      // ghost-choir pads
      ghost1.push(s.ghost ? [m2n(root + 24), 4] : [null, 4]);
      ghost2.push(s.ghost ? [m2n(root + 27), 4] : [null, 4]);
      // THE FATHOMS: sonar blips + the wail bending down
      if (s.fathoms) {
        if (t === 1) deep.push([m2n(62), 4]);
        else if (t === 3) deep.push([m2n(61), 4]);
        else deep.push([null, 1.2], [m2n(86), 0.3], [null, 2.5]);
      } else deep.push([null, 4]);
    }
    var TR = [bass, lead, pump1, pump2, stomp, clap, shout, ghost1, ghost2, deep];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 300) > 1e-6) throw new Error("KRAKEN'S SHANTY track beat mismatch: " + sum);
    });
    return {
      bpm: 100,
      tracks: [
        { type: 'triangle', vol: 0.13,  notes: bass },    // root-fifth drive
        { type: 'square',   vol: 0.075, notes: lead },    // concertina lead
        { type: 'square',   vol: 0.028, notes: pump1 },   // reed pumps
        { type: 'square',   vol: 0.024, notes: pump2 },
        { type: 'triangle', vol: 0.16,  notes: stomp },   // boot stomps
        { type: 'square',   vol: 0.02,  notes: clap },    // claps
        { type: 'square',   vol: 0.06,  notes: shout },   // HEY! + section doors
        { type: 'square',   vol: 0.02,  notes: ghost1 },  // ghost choir
        { type: 'square',   vol: 0.016, notes: ghost2 },
        { type: 'triangle', vol: 0.06,  notes: deep }     // fathoms sonar + wail
      ]
    };
  })();

  MAPS.register({
    id: 'pirate',

    installData: function (DATA) {
      DATA.biomes.pirate = {
        name: 'Pirate Ship', tile: 'pxdeck',
        mobs: ['deckhand', 'cutlassCorsair', 'powderMonkey', 'saltyGull', 'sirenWake',
               'krakenArm', 'makoLeaper', 'drunkenSwab', 'harpooner', 'inkpotOcto']
      };
      DATA.realms.pirate = {
        name: 'Pirate Ship', biome: 'pirate', boss: 'captainkraken',
        kind: 'pirate', music: 'pirate',
        // THE ROCKING DECK knobs (PLAN §2) — ALL TUNE ME
        swell: { periodMs: 12000, leanMs: 1600, slideMs: 3200, slideForce: 120,
                 barrels: 3, barrelSpeed: 170, barrelDmg: 14,
                 maxPullPerFrame: 220 }                        // siren+swell stack cap
      };
      // ---- the 10 mobs (Red picks #1 4 5 6 8 10 11 12 15 16 — LIVING crew) --
      DATA.mobs.deckhand = { name: 'Deckhand', texture: 'deckhandHi', hp: 26, spd: 100, xp: 6, cost: 1,
        deathTint: 0xc2452e, chase: { contactDmg: 8 } };
      DATA.mobs.cutlassCorsair = { name: 'Cutlass Corsair', texture: 'cutlassCorsairHi', hp: 75, spd: 78, xp: 20, cost: 3,
        deathTint: 0x7a3a2e, chase: { contactDmg: 13 },
        lunge: { range: 240, windupMs: 650, dashMs: 240, dashSpeed: 390, cooldownMs: 3200 },
        unlockAt: 20 };
      DATA.mobs.powderMonkey = { name: 'Powder Monkey', texture: 'powderMonkeyHi', hp: 24, spd: 135, xp: 12, cost: 2,
        deathTint: 0xff9a3a,
        mapVerb: 'powderKeg',                                 // sprint → fuse → BOOM; shootable
        keg: { armRange: 90, fuseMs: 1200, radius: 100, dmg: 22 },
        maxConcurrent: 3, unlockAt: 30 };
      DATA.mobs.deckKeg = { name: 'Powder Keg', texture: 'pxRum', hp: 14, spd: 0, xp: 4, cost: 1,
        deathTint: 0xff9a3a,                                  // no chase — a keg doesn't bite
        mapVerb: 'deckKeg',                                   // the boss's toss — not in the pool
        keg: { armRange: 0, fuseMs: 2200, radius: 110, dmg: 24 } };
      DATA.mobs.saltyGull = { name: 'Salty Gull', texture: 'saltyGullHi', hp: 30, spd: 120, xp: 12, cost: 2,
        deathTint: 0x9fc4e8, float: true, chase: { contactDmg: 8 },
        lunge: { range: 280, windupMs: 500, dashMs: 260, dashSpeed: 430, cooldownMs: 2800 },
        unlockAt: 15 };
      DATA.mobs.sirenWake = { name: 'Siren of the Wake', texture: 'sirenWakeHi', hp: 80, spd: 40, xp: 28, cost: 4,
        deathTint: 0x3a7a5a, float: true, chase: { contactDmg: 8 },
        mapVerb: 'sirenSong',                                 // song windows PULL you in
        song: { everyMs: 6000, songMs: 2200, radius: 300, spd: 95 },
        maxConcurrent: 2, unlockAt: 55 };
      DATA.mobs.krakenArm = { name: 'Kraken Arm', texture: 'krakenArmHi', hp: 130, spd: 10, xp: 30, cost: 4,
        deathTint: 0x7e3a5c, chase: { contactDmg: 12 },
        mapVerb: 'krakenArm',                                 // erupts, sweeps, withdraws
        arm: { warnMs: 900, holeR: 40, upMs: 6000, sweepEveryMs: 2600,
               sweepLen: 240, sweepHalf: 20, sweepWarnMs: 800, sweepDmg: 14 },
        maxConcurrent: 2, unlockAt: 45 };
      DATA.mobs.makoLeaper = { name: 'Mako Leaper', texture: 'makoLeaperHi', hp: 55, spd: 75, xp: 18, cost: 2,
        deathTint: 0x46586e,
        mapVerb: 'makoLeap',                                  // arcs onto marked circles
        hop: { everyMs: 4000, range: 540, airMs: 700, landRadius: 62, dmg: 16 },
        unlockAt: 35 };
      DATA.mobs.drunkenSwab = { name: 'Drunken Swab', texture: 'drunkenSwabHi', hp: 42, spd: 92, xp: 10, cost: 1,
        deathTint: 0x3a6e4a, chase: { contactDmg: 9 },
        mapVerb: 'swabWobble',                                // erratic zig-zag path
        unlockAt: 10 };
      DATA.mobs.harpooner = { name: 'Harpooner', texture: 'harpoonerHi', hp: 65, spd: 45, xp: 24, cost: 3,
        deathTint: 0xc2a038, chase: { contactDmg: 8 },
        mapVerb: 'harpoonLine',                               // lane shot; hit = brief PIN
        harpoon: { everyMs: 5600, range: 420, warnMs: 900, len: 400, half: 18, dmg: 16, pinMs: 800 },
        maxConcurrent: 3, unlockAt: 50 };
      DATA.mobs.inkpotOcto = { name: 'Inkpot Octo', texture: 'inkpotOctoHi', hp: 90, spd: 32, xp: 26, cost: 3,
        deathTint: 0xb06a8e, chase: { contactDmg: 10 },
        mapVerb: 'inkSpray',                                  // slippery ink slicks
        ink: { everyMs: 4800, range: 380, warnMs: 800, radius: 70, lifeMs: 4500 },
        maxConcurrent: 2, unlockAt: 60 };

      // ---- CAPTAIN KRAKEN (mapOwned; ground overlays, no projectile spam) --
      DATA.bosses.captainkraken = {
        name: 'Captain Kraken', texture: 'captainkrakenHi',
        hp: 3200, spd: 62, xp: 460, contactDmg: 18, deathTint: 0x7e3a5c,
        lootTable: 'captainkraken',
        mapOwned: true, entranceMs: 3000,
        patterns: {
          cutlassCombo:   { everyMs: 6400, warnMs: 800, range: 170, halfRad: 0.6, dmg: 22 },
          tentacleSlam:   { everyMs: 8600, count: 5, stepPx: 95, radius: 62,
                            warnMs: 1000, gapMs: 240, dmg: 22 },
          kegToss:        { everyMs: 10000, count: 3, scatter: 150 },
          boardingCrew:   { everyMs: 13000, deckhands: 3, cap: 10 },
          hardSwell:      { everyMs: 16000 },
          ghostBroadside: { everyMs: 24000, firstDelayMs: 15000, surfaceMs: 1800,
                            waves: 2, lanesPerWave: 3, half: 26, warnMs: 1300,
                            waveGapMs: 1800, dmg: 24, ventMs: 3500, ventDmgMult: 1.5 },
          overclock:      { hpPct: 0.3, spdMult: 1.25, rateMult: 0.75, swellPeriodMult: 0.55 }
        },
        title: 'CAPTAIN KRAKEN',
        hints: [
          'A living captain with a KRAKEN for a left arm. The parrot is the only honest thing aboard.',
          'CUTLASS COMBO — the cone flashes TWICE, and the second slash re-aims. Keep moving through it.',
          'TENTACLE SLAM marches a line of circles at you — step OFF the line, never down it.',
          'His kegs beep before they blow. Shoot them early; the blast serves anyone standing close.',
          'He commands the sea: when the deck heels HARD, do not get pinned at the low rail.',
          'THE GHOST SHIP answers his call — gunport lanes rake the deck in two waves. When it sinks he is WINDED: unload.'
        ]
      };
      DATA.dropTables.captainkraken = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.deckcreak = { type: 'sawtooth', freq: 120, freqEnd: 70, len: 0.9, vol: 0.1, limitMs: 1100 };
      DATA.audio.sounds.swellgroan = { type: 'sawtooth', freq: 70, freqEnd: 45, len: 1.2, vol: 0.14, limitMs: 1400,
                                       noise: { vol: 0.05, hp: 400 } };
      DATA.audio.sounds.barrelrumble = { type: 'triangle', freq: 80, freqEnd: 60, len: 0.8, vol: 0.14, limitMs: 900,
                                         noise: { vol: 0.08, hp: 300 } };
      DATA.audio.sounds.kegfuse = { type: 'square', freq: 1500, freqEnd: 1500, len: 0.07, vol: 0.12, limitMs: 130 };
      DATA.audio.sounds.harpoonthunk = { type: 'triangle', freq: 320, freqEnd: 90, len: 0.16, vol: 0.18, limitMs: 220,
                                         noise: { vol: 0.06, hp: 1800 } };
      DATA.audio.sounds.gullshriek = { type: 'square', freq: 1800, freqEnd: 900, len: 0.25, vol: 0.1, limitMs: 350 };
      DATA.audio.sounds.tentacleslam = { type: 'triangle', freq: 140, freqEnd: 40, len: 0.5, vol: 0.22, limitMs: 600,
                                         noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.ghostmoan = { type: 'sawtooth', freq: 180, freqEnd: 320, len: 1.4, vol: 0.12, limitMs: 1600,
                                      noise: { vol: 0.04, hp: 2200 } };
      DATA.audio.sounds.broadside = { type: 'sawtooth', freq: 200, freqEnd: 60, len: 0.5, vol: 0.2, limitMs: 600,
                                      noise: { vol: 0.12, hp: 900 } };
      DATA.audio.sounds.parrotsquawk = { type: 'square', arp: [1200, 1600, 1100], len: 0.3, vol: 0.12, limitMs: 400 };
      DATA.audio.music.pirate = KRAKENS_SHANTY;

      MAPS.addConsoleMap(DATA, { id: 'pirate', name: 'PIRATE SHIP',
        sub: 'the crew wants your bones; the Captain wants your soul', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof PIRATE_ART !== 'undefined') PIRATE_ART.buildInto(ctx);
    },

    mobVerbs: {
      powderKeg: function (scene, m, player, time) { return scene._pirMonkey(m, player, time); },
      deckKeg: function (scene, m, player, time) { return scene._pirKeg(m, player, time); },
      sirenSong: function (scene, m, player, time) { return scene._pirSiren(m, player, time); },
      krakenArm: function (scene, m, player, time) { return scene._pirKrakenArm(m, player, time); },
      makoLeap: function (scene, m, player, time) { return scene._pirMako(m, player, time); },
      swabWobble: function (scene, m, player, time) { return scene._pirSwab(m, player, time); },
      harpoonLine: function (scene, m, player, time) { return scene._pirHarpooner(m, player, time); },
      inkSpray: function (scene, m, player, time) { return scene._pirOcto(m, player, time); }
    },

    scene: (typeof PIRATE_SCENE !== 'undefined') ? PIRATE_SCENE : {}
  });
})();
