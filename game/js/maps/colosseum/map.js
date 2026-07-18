// ============================================================================
// game/js/maps/colosseum/map.js — COLOSSEUM (realm 14) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). Imperial arena at full
// roar: marble, sand, bronze, gold, crimson + purple — and DIVINITY HIMSELF
// presiding with his jeweled PIMP CUP. ROUND MAP, NO TOROIDAL WRAP (the
// campaign's one exception). THE PROGRAM is the signature map cycle. Numbers
// TUNE ME.
// ============================================================================
(function () {
  'use strict';

  // ---- "GLORY.EXE" — gaming techno + CRAZY PIANO SOLO (TAKE 2, Red-approved
  // "thats a banger"). Port of render_colosseum_theme.js as a section
  // composer: 140 BPM A minor (Am–F–C–G), 105 bars × 4 = 420 beats = EXACTLY
  // 180.0s. NO slow intro — kick, octave bass, hats AND trumpet fanfare all
  // from bar 0 over a crowd roar; hook lands ~7s → build → 24-bar DROP →
  // breather w/ piano teases → 28-BAR CRAZY PIANO SOLO → piano+lead duet drop
  // → octave-up finale → fanfare tag + final piano chord + roar. Crowd roars
  // at every section door. Chiptune voices only (pulse/tri, no sine).
  var GLORY_EXE = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [45, 41, 36, 43], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
    var HOOK = [
      [76, -1, 72, 76, 79, -1, 76, 72], [74, 72, 69, -1, 72, -1, 69, 65],
      [72, -1, 67, 72, 76, -1, 72, 79], [79, 78, 74, -1, 71, -1, 74, 79]
    ];
    var FAN = [[69, 69, 76, 74], [72, 76, 79, -1]];
    var SOLO = [
      [57, 60, 64, 67, 69, 72, 76, 79], [79, 76, 72, 69, 67, 64, 60, 57],
      [69, 72, 69, 76, 72, 79, 76, 81], [64, 69, 65, 71, 67, 72, 69, 74],
      [57, 58, 59, 60, 61, 62, 63, 64], [81, 79, 76, 72, 76, 72, 69, 72]
    ];
    var DOORS = { 4: 1, 20: 1, 28: 1, 52: 1, 56: 1, 84: 1, 92: 1, 100: 1 };
    var KK = m2n(26), HO = 'A7', HC = 'C8', SN = 'A#7';

    function sec(b) {
      if (b < 4) return { fanfare: true, kick: true, hats: true, bass: true };            // bar-0 full stack
      if (b < 20) return { kick: true, hats: true, bass: true, hook: true };              // hook ~7s
      if (b < 28) return { kick: true, hats: true, bass: true, stab: true, build: b >= 24, roll: b - 24 };
      if (b < 52) return { kick: true, hats: true, bass: true, hook: true, big: true, snares: true }; // DROP 1
      if (b < 56) return { pads: true, pianoTease: true };                                // breather
      if (b < 84) return { kick: true, hats: true, bass: true, solo: b - 56, snares: true }; // 28-bar PIANO SOLO
      if (b < 92) return { kick: true, hats: true, bass: true, hook: true, big: true, pianoToo: true, snares: true };
      if (b < 100) return { kick: true, hats: true, bass: true, hook: true, big: true, up: 12, pianoToo: true, snares: true };
      return { tag: b - 100 };                                                            // fanfare outro
    }

    var kick = [], hatO = [], hatC = [], bass = [], fan = [], leadA = [], leadB = [],
        piano = [], pad = [], build = [], sub = [], flavor = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), t = b % 4, root = ROOTS[t], chord = CH[t], up = s.up || 0;
      // four-on-the-floor kick
      if (s.kick) { for (var k = 0; k < 4; k++) kick.push([KK, 0.12], [null, 0.88]); }
      else if (b === 104) kick.push([KK, 0.12], [null, 3.88]);
      else kick.push([null, 4]);
      // open + closed hats
      if (s.hats) {
        for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [HO, 0.1], [null, 0.4]);
        for (var h2 = 0; h2 < 4; h2++) hatC.push([null, 0.25], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17]);
      } else { hatO.push([null, 4]); hatC.push([null, 4]); }
      // driving octave bass (8ths)
      if (s.bass) { for (var e = 0; e < 8; e++) { var oct = e % 2 ? 12 : 0; bass.push([m2n(root - 12 + oct), 0.42], [null, 0.08]); } }
      else bass.push([null, 4]);
      // trumpet fanfare — intro stabs + outro tag
      if (s.fanfare) {
        for (var i = 0; i < 4; i++) { var fm = FAN[b % 2][i]; if (fm > 0) fan.push([m2n(fm), 0.85], [null, 0.15]); else fan.push([null, 1]); }
      } else if (s.tag != null) {
        var tg = s.tag;
        if (tg === 0) fan.push([m2n(69), 0.8], [null, 0.2], [m2n(72), 0.8], [null, 0.2], [m2n(76), 0.9], [null, 1.1]);
        else if (tg === 1) fan.push([m2n(81), 1.8], [null, 2.2]);
        else if (tg === 4) fan.push([m2n(69), 0.8], [null, 3.2]);
        else fan.push([null, 4]);
      } else fan.push([null, 4]);
      // hook lead (8ths)
      if (s.hook) { for (var e2 = 0; e2 < 8; e2++) { var lm = HOOK[t][e2]; if (lm > 0) leadA.push([m2n(lm + up), 0.45], [null, 0.05]); else leadA.push([null, 0.5]); } }
      else leadA.push([null, 4]);
      // detune second voice (drop only)
      if (s.hook && s.big) { for (var e3 = 0; e3 < 8; e3++) { var lm2 = HOOK[t][e3]; if (lm2 > 0) leadB.push([m2n(lm2 + up), 0.45], [null, 0.05]); else leadB.push([null, 0.5]); } }
      else leadB.push([null, 4]);
      // CHIPTUNE PIANO — solo / duet / teases / final chord
      if (s.solo != null) { var pr = SOLO[s.solo % 6]; for (var e4 = 0; e4 < 8; e4++) piano.push([m2n(pr[e4] + 12), 0.46], [null, 0.04]); }
      else if (s.pianoTease) piano.push([null, 0.5], [m2n(chord[0] + 12), 0.5], [null, 1], [m2n(chord[2] + 12), 0.5], [null, 1.5]);
      else if (s.pianoToo) { for (var e5 = 0; e5 < 8; e5++) { var pm = HOOK[t][e5]; if (pm > 0) piano.push([m2n(pm + 12 + up), 0.4], [null, 0.1]); else piano.push([null, 0.5]); } }
      else if (s.tag === 2) piano.push([m2n(69), 4]);
      else if (s.tag === 3) piano.push([m2n(81), 4]);
      else if (s.tag === 4) piano.push([m2n(84), 4]);
      else piano.push([null, 4]);
      // gated pads / offbeat stabs
      if (s.pads) { for (var e6 = 0; e6 < 8; e6++) { if (e6 % 4 === 3) { pad.push([null, 0.5]); continue; } pad.push([m2n(chord[0]), 0.35], [null, 0.15]); } }
      else if (s.stab) pad.push([null, 1.5], [m2n(chord[1] + 12), 0.2], [null, 1.8], [m2n(chord[1] + 12), 0.2], [null, 0.3]);
      else pad.push([null, 4]);
      // snare backbeat + build roll
      if (s.build) {
        var den = 6 + s.roll * 3;
        for (var r2 = 0; r2 < den; r2++) build.push([SN, 0.08], [null, 4 / den - 0.08]);
      } else if (s.snares) {
        build.push([null, 1], [SN, 0.12], [null, 0.88], [null, 1], [SN, 0.12], [null, 0.88]);
      } else build.push([null, 4]);
      // drop sub layer
      sub.push(s.big ? [m2n(root - 12), 3.8] : [null, 3.8], [null, 0.2]);
      // section doors (rising blips) + final crowd hit
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (b === 104) flavor.push([m2n(88), 0.4], [null, 3.6]);
      else flavor.push([null, 4]);
    }

    var TR = [kick, hatO, hatC, bass, fan, leadA, leadB, piano, pad, build, sub, flavor];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 420) > 1e-6) throw new Error('GLORY.EXE track beat mismatch: ' + sum);
    });
    return {
      bpm: 140,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },
        { type: 'square',   vol: 0.014, notes: hatO },
        { type: 'square',   vol: 0.008, notes: hatC },
        { type: 'square',   vol: 0.09,  notes: bass },
        { type: 'square',   vol: 0.06,  notes: fan },     // trumpet fanfare
        { type: 'square',   vol: 0.055, notes: leadA },   // hook voice 1
        { type: 'sawtooth', vol: 0.03,  notes: leadB },   // detune voice 2
        { type: 'square',   vol: 0.05,  notes: piano },   // CHIPTUNE PIANO
        { type: 'square',   vol: 0.022, notes: pad },
        { type: 'square',   vol: 0.05,  notes: build },
        { type: 'triangle', vol: 0.08,  notes: sub },
        { type: 'triangle', vol: 0.05,  notes: flavor }
      ]
    };
  })();

  MAPS.register({
    id: 'colosseum',

    installData: function (DATA) {
      DATA.biomes.colosseum = {
        name: 'The Colosseum', tile: 'coltSand',
        mobs: ['gladiator', 'retiarius', 'warLion', 'shieldLegionary', 'beastHandler',
               'warElephant', 'minotaur', 'crowdFavorite', 'warHound', 'vestalCurser',
               'executioner', 'chariotRacer']
      };
      DATA.realms.colosseum = {
        name: 'The Colosseum', biome: 'colosseum', boss: 'divinityHimself',
        kind: 'colosseum', music: 'colosseum',
        // ROUND ARENA geometry (fractions of world) — NO WRAP.
        arena: { wallR: 0.42, trackR: 0.375, spawnR: 0.30, bossR: 0.05 },
        // THE PROGRAM — the signature map cycle. ALL TUNE ME.
        program: {
          stageMs: 20000, placardMs: 2000,
          order: ['beast', 'trapdoor', 'chariot', 'intermission'],
          beastWave: { count: 5, cap: 12, keys: ['warHound', 'warLion', 'gladiator'] },
          trapdoor: { setCount: 3, warnMs: 1400, openMs: 6000, fallDmg: 16 },
          chariot: { racers: 2, laps: 2 },
          intermission: { drops: 6, heal: 10 }
        }
      };

      // ---- the 12 mobs (Red picks: gladiator/retiarius/lion/legionary/handler/
      //      elephant/minotaur/favorite/hound/vestal/executioner + chariot) ----
      DATA.mobs.gladiator = { name: 'Gladiator', texture: 'colGladiatorHi', hp: 60, spd: 90, xp: 12, cost: 2,
        deathTint: 0xa02028, chase: { contactDmg: 10 },
        mapVerb: 'gladiatorSlash',
        slash: { everyMs: 4200, range: 150, warnMs: 550, halfRad: 0.6, dmg: 16, blockRad: 0.9 } };
      DATA.mobs.retiarius = { name: 'Retiarius', texture: 'colRetiariusHi', hp: 55, spd: 95, xp: 14, cost: 2,
        deathTint: 0x7a4e2e, chase: { contactDmg: 8 },
        mapVerb: 'retiariusNet',
        net: { everyMs: 5200, range: 300, warnMs: 800, netR: 60, rootMs: 700, jabMs: 500, jabDmg: 14 },
        unlockAt: 15 };
      DATA.mobs.warLion = { name: 'War Lion', texture: 'colLionHi', hp: 70, spd: 110, xp: 16, cost: 2,
        deathTint: 0xb08648, chase: { contactDmg: 12 },
        mapVerb: 'lionPounce',
        pounce: { everyMs: 4800, range: 360, warnMs: 800, len: 420, half: 26, dashMs: 340, dashSpeed: 460 },
        unlockAt: 20 };
      DATA.mobs.shieldLegionary = { name: 'Shield Legionary', texture: 'colLegionaryHi', hp: 130, spd: 42, xp: 20, cost: 3,
        deathTint: 0xa02028, chase: { contactDmg: 12 },
        mapVerb: 'legionaryBlock',
        block: { arcRad: 0.9, range: 44 },   // ~100° frontal block, flanks/back open
        unlockAt: 30 };
      DATA.mobs.beastHandler = { name: 'Beast Handler', texture: 'colHandlerHi', hp: 60, spd: 70, xp: 18, cost: 2,
        deathTint: 0x7a4e2e, chase: { contactDmg: 6 },
        mapVerb: 'handlerBuff',                            // whip-rally: mobs only, respects hitstop
        buff: { everyMs: 4600, range: 260, spdMult: 1.5, durMs: 3000 },
        maxConcurrent: 2, unlockAt: 35 };
      DATA.mobs.warElephant = { name: 'War Elephant', texture: 'colElephantHi', hp: 300, spd: 40, xp: 42, cost: 5,
        deathTint: 0x9a9aa2, chase: { contactDmg: 18 },
        mapVerb: 'elephantStampede',
        stampede: { everyMs: 6400, range: 480, warnMs: 1000, laneCount: 3, len: 560, half: 24,
                    stompRange: 150, stompR: 170, stompMs: 800, stompDmg: 20, laneDmg: 22 },
        maxConcurrent: 1, unlockAt: 60 };
      DATA.mobs.minotaur = { name: 'Minotaur', texture: 'colMinotaurHi', hp: 260, spd: 55, xp: 40, cost: 5,
        deathTint: 0x6e4a2e, chase: { contactDmg: 16 },
        mapVerb: 'minotaurCharge',
        charge: { everyMs: 5600, range: 480, warnMs: 900, len: 520, half: 26, chargeMs: 1100, chargeSpeed: 440,
                  slamR: 120, slamWarnMs: 550, slamDmg: 24 },
        maxConcurrent: 1, unlockAt: 65 };
      DATA.mobs.crowdFavorite = { name: 'Crowd Favorite', texture: 'colFavoriteHi', hp: 90, spd: 80, xp: 22, cost: 3,
        deathTint: 0xe0a832, chase: { contactDmg: 10 },
        mapVerb: 'favoriteTaunt',                          // cheer = brief sparkle shield (capped)
        taunt: { everyMs: 5000, tauntMs: 1200, shieldMs: 1400, shieldCdMs: 3200 },
        unlockAt: 40 };
      DATA.mobs.warHound = { name: 'War Hound', texture: 'colHoundHi', hp: 34, spd: 130, xp: 10, cost: 1,
        deathTint: 0x5a5048, chase: { contactDmg: 8 },
        mapVerb: 'houndLunge',                             // packs of 3–4, lunge-glint
        houndLunge: { everyMs: 3200, range: 260, warnMs: 450, dashMs: 260, dashSpeed: 430 },
        maxConcurrent: 4, unlockAt: 25 };
      DATA.mobs.vestalCurser = { name: 'Vestal Curser', texture: 'colVestalHi', hp: 65, spd: 55, xp: 18, cost: 3,
        deathTint: 0x8a4a9a, chase: { contactDmg: 6 },
        mapVerb: 'vestalGlyph',                            // glyph circles bloom → weaken zones
        glyph: { everyMs: 5400, range: 380, warnMs: 900, glyphR: 66, zoneMs: 4200, slowMult: 0.6, weakenMult: 0.7 },
        unlockAt: 45 };
      DATA.mobs.executioner = { name: 'Executioner', texture: 'colExecutionerHi', hp: 200, spd: 45, xp: 38, cost: 5,
        deathTint: 0x3a3a42, chase: { contactDmg: 16 },
        mapVerb: 'executionerSlam',
        exe: { everyMs: 5800, range: 200, warnMs: 950, slamR: 120, slamDmg: 26,
               cleaveMs: 400, cleaveHalf: 0.8, cleaveRange: 170, cleaveDmg: 18 },
        maxConcurrent: 2, unlockAt: 70 };
      DATA.mobs.chariotRacer = { name: 'Chariot Racer', texture: 'colChariotHi', hp: 120, spd: 150, xp: 26, cost: 4,
        deathTint: 0xa02028, chase: { contactDmg: 16 },
        mapVerb: 'chariotRun',                             // orbits the rim track, warned crossing lanes
        chariotRun: { orbitSpeed: 230, laneEveryMs: 3200, laneWarnMs: 900, laneHalf: 30, laneDmg: 20, laneLen: 900 },
        maxConcurrent: 2, unlockAt: 50 };

      // ---- DIVINITY HIMSELF (mapOwned golden god) --------------------------
      DATA.bosses.divinityHimself = {
        name: 'Divinity Himself', texture: 'divinityHimselfHi',
        hp: 4200, spd: 30, xp: 600, contactDmg: 22, deathTint: 0xe0a832,
        lootTable: 'divinityHimself',
        mapOwned: true, entranceMs: 3500,
        patterns: {
          verbEveryMs: 4800, phase2HpPct: 0.5,
          cupSplash:   { count: 3, scatter: 240, radius: 90, warnMs: 1000, dmg: 18,
                         slickMs: 4000, slickR: 84, slideMult: 1.5 },
          verdict:     { warnMs: 900, ringR: 74, chaseSpeed: 118, ringMs: 6000, tickMs: 600, dmg: 22 },
          tributeRain: { count: 5, scatter: 360, radius: 60, warnMs: 900, dmg: 14 },
          backhand:    { range: 280, warnMs: 800, halfRad: 0.6, dmg: 24, kb: 320 },
          wineFlood:   { warnMs: 1600, dmg: 30, ventMs: 3400, ventDmgMult: 1.5 },   // P1 SIGNATURE
          cupToss:     { warnMs: 1400, travelMs: 2200, hitR: 70, dmg: 22 },
          encore:      { hounds: 3 },
          deluge:      { rainCount: 8, rainRadius: 70, rainWarnMs: 1000, rainGapMs: 250, rainDmg: 16,
                         ringWarnMs: 1500, ringSpeed: 150, ringDmg: 28, ringMs: 2600,
                         ventMs: 5000, ventDmgMult: 1.5 },                          // P2 SIGNATURE
          sigEveryMs: 26000, sigFirstMs: 15000
        },
        title: 'THE HOST OF THE GAMES',
        hints: [
          "His wine SLICKS slide — cross them straight, never turn on the crimson.",
          "THE VERDICT's golden doom-ring chases slow; loop it through the mobs and it forgets you.",
          "Watch the sky when the crowd cheers — TRIBUTE RAIN scatters warned goblets.",
          "Read which HALF floods early: the WINE FLOOD alternates, warned long — flee the marked side.",
          "In Phase 2 his cup BOOMERANGS the rim — stay off the track when it flies.",
          "When the cup runs dry he's VENTED — that's your window, unload."
        ]
      };
      DATA.dropTables.divinityHimself = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.placardsting = { type: 'square', arp: [660, 880, 990, 1320], len: 0.5, vol: 0.14, limitMs: 600 };
      DATA.audio.sounds.portcullis = { type: 'sawtooth', freq: 220, freqEnd: 70, len: 0.7, vol: 0.14, limitMs: 800,
                                       noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.trapclunk = { type: 'square', freq: 240, freqEnd: 90, len: 0.25, vol: 0.15, limitMs: 300,
                                      noise: { vol: 0.07, hp: 700 } };
      DATA.audio.sounds.chariotrumble = { type: 'sawtooth', freq: 90, freqEnd: 140, len: 0.6, vol: 0.12, limitMs: 700,
                                          noise: { vol: 0.09, hp: 400 } };
      DATA.audio.sounds.lionroar = { type: 'sawtooth', freq: 150, freqEnd: 70, len: 0.7, vol: 0.15, limitMs: 800,
                                     noise: { vol: 0.07, hp: 300 } };
      DATA.audio.sounds.crowdroar = { type: 'sawtooth', freq: 200, freqEnd: 240, len: 0.9, vol: 0.1, limitMs: 1000,
                                      noise: { vol: 0.11, hp: 350 } };
      DATA.audio.sounds.crowdcheer = { type: 'square', arp: [520, 660, 780], len: 0.4, vol: 0.1, limitMs: 500,
                                       noise: { vol: 0.06, hp: 900 } };
      DATA.audio.sounds.roseplink = { type: 'triangle', freq: 900, freqEnd: 1400, len: 0.12, vol: 0.1, limitMs: 160 };
      DATA.audio.sounds.netwhoosh = { type: 'sawtooth', freq: 1600, freqEnd: 600, len: 0.25, vol: 0.09, limitMs: 300,
                                      noise: { vol: 0.07, hp: 2200 } };
      DATA.audio.sounds.elephanttrumpet = { type: 'sawtooth', freq: 300, freqEnd: 520, len: 0.6, vol: 0.15, limitMs: 700 };
      DATA.audio.sounds.minotaurbellow = { type: 'sawtooth', freq: 120, freqEnd: 80, len: 0.7, vol: 0.16, limitMs: 800,
                                           noise: { vol: 0.06, hp: 260 } };
      DATA.audio.sounds.exeslam = { type: 'square', freq: 320, freqEnd: 120, len: 0.35, vol: 0.16, limitMs: 400,
                                    noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.curseglyph = { type: 'sawtooth', freq: 2000, freqEnd: 1400, len: 0.6, vol: 0.07, limitMs: 700,
                                       noise: { vol: 0.05, hp: 2600 } };
      DATA.audio.sounds.verdicthorn = { type: 'sawtooth', freq: 160, freqEnd: 320, len: 0.7, vol: 0.14, limitMs: 800 };
      DATA.audio.sounds.cupsplash = { type: 'square', freq: 700, freqEnd: 160, len: 0.4, vol: 0.14, limitMs: 450,
                                      noise: { vol: 0.09, hp: 900 } };
      DATA.audio.sounds.waveroar = { type: 'sawtooth', freq: 80, freqEnd: 240, len: 0.9, vol: 0.15, limitMs: 1000,
                                     noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.cuptosswhoosh = { type: 'sawtooth', freq: 900, freqEnd: 1500, len: 0.3, vol: 0.09, limitMs: 350,
                                          noise: { vol: 0.06, hp: 1800 } };
      DATA.audio.sounds.liftcreak = { type: 'sawtooth', freq: 120, freqEnd: 60, len: 0.9, vol: 0.13, limitMs: 1000,
                                      noise: { vol: 0.05, hp: 300 } };
      DATA.audio.sounds.surfsplash = { type: 'sawtooth', freq: 260, freqEnd: 90, len: 0.8, vol: 0.15, limitMs: 900,
                                       noise: { vol: 0.12, hp: 600 } };
      DATA.audio.music.colosseum = GLORY_EXE;

      MAPS.addConsoleMap(DATA, { id: 'colosseum', name: 'THE COLOSSEUM',
        sub: 'the games never stop', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof COLOSSEUM_ART !== 'undefined') COLOSSEUM_ART.buildInto(ctx);
    },

    mobVerbs: {
      gladiatorSlash: function (scene, m, player, time) { return scene._colGladiator(m, player, time); },
      retiariusNet: function (scene, m, player, time) { return scene._colRetiarius(m, player, time); },
      lionPounce: function (scene, m, player, time) { return scene._colLion(m, player, time); },
      legionaryBlock: function (scene, m, player, time) { return scene._colLegionary(m, player, time); },
      handlerBuff: function (scene, m, player, time) { return scene._colHandler(m, player, time); },
      elephantStampede: function (scene, m, player, time) { return scene._colElephant(m, player, time); },
      minotaurCharge: function (scene, m, player, time) { return scene._colMinotaur(m, player, time); },
      favoriteTaunt: function (scene, m, player, time) { return scene._colFavorite(m, player, time); },
      houndLunge: function (scene, m, player, time) { return scene._colHound(m, player, time); },
      vestalGlyph: function (scene, m, player, time) { return scene._colVestal(m, player, time); },
      executionerSlam: function (scene, m, player, time) { return scene._colExecutioner(m, player, time); },
      chariotRun: function (scene, m, player, time) { return scene._colChariot(m, player, time); }
    },

    scene: (typeof COLOSSEUM_SCENE !== 'undefined') ? COLOSSEUM_SCENE : {}
  });
})();
