// ============================================================================
// game/js/maps/abyss/map.js — THE ABYSS (realm 15) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). Crush-depth trench:
// bioluminescence against the dark + a giant electric serpent. Numbers TUNE ME.
// Signature systems: THE UNDERTOW (directional pull toward the nearest DROP)
// and DESTRUCTIBLE CORAL (4-state deterioration + staged regrow).
// ============================================================================
(function () {
  'use strict';

  // ---- "UNDER THE TRENCH" — Under-the-Sea CALYPSO (TAKE 2, RED-APPROVED
  // "that it"). Port of render_abyss_theme.js as a section composer: 120 BPM,
  // C major (C-F-G-C / Am-F-C-G), 90 bars x 4 = 360 beats = EXACTLY 180.0s.
  // Steel-drum chiptune hook + offbeat skank + walking calypso bass + shaker/
  // clave + horn call-and-response → half-time LAGOON bridge → key-up (+2)
  // party finale w/ gliss flourishes → big gliss + splash tag. NO SLOW INTRO.
  var UNDER_THE_TRENCH = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var CHORD = { C: [60, 64, 67], F: [57, 60, 65], G: [55, 59, 62], Am: [57, 60, 64] };
    var ROOT = { C: 36, F: 41, G: 43, Am: 33 }, FIFTH = { C: 43, F: 48, G: 38, Am: 40 };
    var PROG_A = ['C', 'F', 'G', 'C'], PROG_B = ['Am', 'F', 'C', 'G'];
    // bouncy Under-the-Sea steel hook (8th grid, syncopated) — -1 = rest
    var TUNE_A = [
      [72, -1, 76, 79, -1, 76, 79, -1], [81, 79, 77, -1, 77, -1, 76, 74],
      [74, -1, 71, 74, -1, 71, 74, 76], [72, -1, 76, -1, 72, -1, -1, -1],
      [72, -1, 76, 79, -1, 76, 79, 81], [84, -1, 81, -1, 77, 79, 81, -1],
      [79, 77, 76, -1, 74, -1, 71, 69], [72, -1, -1, 72, 76, 72, -1, -1]
    ];
    var CALL_B = [
      [76, 79, 81, -1, -1, -1, -1, -1], [-1, -1, -1, -1, 77, 76, 74, -1],
      [72, 76, 79, -1, -1, -1, -1, -1], [-1, -1, -1, -1, 74, 76, 79, -1]
    ];
    var RESP_B = [
      [-1, -1, -1, -1, 64, 65, 67, -1], [69, -1, 67, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, 64, 67, 72, -1], [71, -1, 67, -1, -1, -1, -1, -1]
    ];
    var LAGOON = [[76, 74, 72, 74], [77, 76, 74, 72], [76, 74, 72, 69], [67, 69, 71, 74]];
    function sec(b) {
      if (b < 18) return { groove: true, tuneA: true };                                  // straight in — the hook
      if (b < 34) return { groove: true, tuneB: true, prog: 'B' };                        // call + response
      if (b < 42) return { groove: true, bassSolo: true, percBreak: true };              // walking-bass + perc break
      if (b < 58) return { groove: true, tuneA: true, horns: true };                     // full band reprise
      if (b < 66) return { lagoon: true };                                                // half-time LAGOON bridge
      if (b < 82) return { groove: true, tuneA: true, horns: true, up: 2, party: true };  // key-up (+2) finale
      return { tag: b - 82 };                                                             // big tag + splash
    }
    var steel = [], horn = [], skank = [], bass = [], kick = [], perc = [];
    var KK = 36, HC = 84;
    for (var b = 0; b < 90; b++) {
      var s = sec(b), t = b % 4;
      var prog = s.prog === 'B' ? PROG_B : PROG_A;
      var ch = prog[t], up = s.up || 0;
      var chord = CHORD[ch].map(function (m) { return m + up; });
      var root = ROOT[ch] + up, fifth = FIFTH[ch] + up;
      // ---- STEEL DRUM lead / lagoon / tag
      if (s.tuneA) {
        TUNE_A[b % 8].forEach(function (m) { steel.push(m > 0 ? [m2n(m + up), 0.5] : [null, 0.5]); });
      } else if (s.tuneB) {
        CALL_B[b % 4].forEach(function (m) { steel.push(m > 0 ? [m2n(m), 0.5] : [null, 0.5]); });
      } else if (s.lagoon) {
        LAGOON[b % 4].forEach(function (m) { steel.push([m2n(m), 1]); });
      } else if (s.tag != null) {
        if (s.tag < 7) { TUNE_A[s.tag % 8].forEach(function (m) { steel.push(m > 0 ? [m2n(m + 2), 0.5] : [null, 0.5]); }); }
        else { steel.push([m2n(74), 1.4], [m2n(78), 1.3], [m2n(81), 1.3]); }               // final gliss chord tail
      } else steel.push([null, 4]);
      // ---- HORN response / pads
      if (s.tuneB) {
        RESP_B[b % 4].forEach(function (m) { horn.push(m > 0 ? [m2n(m), 0.5] : [null, 0.5]); });
      } else if (s.horns) {
        horn.push([null, 2], [m2n(chord[0] - 12), 1], [m2n(chord[2] - 12), 1]);
      } else if (s.tag != null && s.tag >= 7) {
        horn.push([m2n(62), 2], [m2n(66), 2]);
      } else horn.push([null, 4]);
      // ---- SKANK chords on the offbeats (the calypso "chick")
      if (s.groove || (s.tag != null && s.tag < 7)) {
        var sk = (s.tag != null) ? [62, 66, 69] : chord;
        for (var e = 0; e < 4; e++) skank.push([null, 0.5], [m2n(sk[e % sk.length] + 12), 0.2], [null, 0.3]);
      } else if (s.lagoon) {
        skank.push([m2n(chord[1] + 12), 1.9], [null, 0.1], [m2n(chord[2] + 12), 1.9], [null, 0.1]);
      } else skank.push([null, 4]);
      // ---- WALKING BASS (calypso bounce): root · 5th · 6th · 5th
      if (s.groove || (s.tag != null && s.tag < 7)) {
        var br = (s.tag != null) ? 38 : root, bf = (s.tag != null) ? 45 : fifth;
        if (s.bassSolo) {
          [0, 4, 7, 9, 12, 9, 7, 4].forEach(function (iv) { bass.push([m2n(br + iv), 0.45], [null, 0.05]); });
        } else {
          bass.push([m2n(br), 0.8], [null, 0.2], [m2n(bf), 0.8], [null, 0.2],
            [m2n(br + 9), 0.8], [null, 0.2], [m2n(bf), 0.8], [null, 0.2]);
        }
      } else if (s.lagoon) {
        bass.push([m2n(root), 1.8], [null, 0.2], [m2n(fifth), 1.8], [null, 0.2]);
      } else bass.push([null, 4]);
      // ---- KICK on 1 + 3 (+ the final downbeat)
      if (s.groove || s.lagoon || (s.tag != null && s.tag < 7)) {
        kick.push([m2n(KK), 0.12], [null, 1.88], [m2n(KK), 0.12], [null, 1.88]);
      } else if (s.tag != null) {
        kick.push([m2n(KK), 0.12], [null, 3.88]);
      } else kick.push([null, 4]);
      // ---- PERC: shaker 16ths (+ clave feel via accents), sparse in lagoon
      if (s.lagoon) {
        for (var e2 = 0; e2 < 8; e2++) perc.push([m2n(HC), 0.06], [null, 0.44]);
      } else {
        for (var e3 = 0; e3 < 16; e3++) perc.push([m2n(HC), 0.06], [null, 0.19]);
      }
    }
    var TR = [steel, horn, skank, bass, kick, perc];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 360) > 1e-6) throw new Error('UNDER THE TRENCH track beat mismatch: ' + sum);
    });
    return {
      bpm: 120,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: steel },   // steel-drum hook (tri = bright bell)
        { type: 'square',   vol: 0.05,  notes: horn },     // horn-section answers
        { type: 'square',   vol: 0.03,  notes: skank },    // offbeat skank chords
        { type: 'triangle', vol: 0.11,  notes: bass },     // walking calypso bass
        { type: 'triangle', vol: 0.12,  notes: kick },     // calypso kick 1+3
        { type: 'square',   vol: 0.012, notes: perc }      // 16th shaker/clave
      ]
    };
  })();

  MAPS.register({
    id: 'abyss',

    installData: function (DATA) {
      DATA.biomes.abyss = {
        name: 'The Abyss', tile: 'absilt',
        mobs: ['ghostJelly', 'swordfish', 'voltEel', 'vampireSquid', 'crimsonStarfish',
               'drownedDiver', 'ghostFisherman', 'trenchLobster', 'bandedSeaSnake',
               'lanternSnail', 'krakenSpawn']
      };
      DATA.realms.abyss = {
        name: 'The Abyss', biome: 'abyss', boss: 'voltWyrm',
        kind: 'abyss', music: 'abyss',
        // THE UNDERTOW — signature map cycle (PLAN §2). ALL TUNE ME.
        undertow: { cycleMs: 30000, warnMs: 2000, pullMs: 8000, force: 150,
                    anchorR: 150, pitDmg: 22, ejectIframeMs: 1000, ejectPush: 260 },
        // DESTRUCTIBLE CORAL (PLAN §3). ALL TUNE ME.
        coral: { hpPerState: 20, hp: 80, regrowMs: 45000, regrowStepMs: 11000, shrapnelR: 90, shrapnelDmg: 0 }
      };

      // ---- the 11 mobs (Red picks #4 5 7 8 11 12 13 15 16 17 19) ----
      DATA.mobs.ghostJelly = { name: 'Ghost Jelly', texture: 'abyssJellyHi', hp: 30, spd: 55, xp: 8, cost: 1,
        deathTint: 0x8a5adc, float: true, chase: { contactDmg: 7 },
        mapVerb: 'jellyDrift',                                 // slow sinusoidal drift; contact sting
        drift: { wander: 0.9, approach: 0.35 },
        unlockAt: 0 };
      DATA.mobs.swordfish = { name: 'Swordfish', texture: 'abyssSwordHi', hp: 55, spd: 95, xp: 16, cost: 2,
        deathTint: 0x6a8ab0, chase: { contactDmg: 8 },
        mapVerb: 'swordLance',                                 // thin lane telegraph → high-speed charge (wraps)
        lance: { everyMs: 5200, range: 460, warnMs: 900, len: 560, half: 20, chargeMs: 900, speed: 520 },
        unlockAt: 15 };
      DATA.mobs.voltEel = { name: 'Volt Eel', texture: 'abyssVoltHi', hp: 48, spd: 70, xp: 16, cost: 2,
        deathTint: 0xd8e84a, chase: { contactDmg: 7 },
        mapVerb: 'voltZap',                                    // coils → expanding shock-ring → zap
        zap: { everyMs: 4600, range: 300, coilMs: 800, ringMs: 700, maxR: 150, dmg: 14 },
        unlockAt: 20 };
      DATA.mobs.vampireSquid = { name: 'Vampire Squid', texture: 'abyssSquidHi', hp: 50, spd: 80, xp: 18, cost: 2,
        deathTint: 0x6a2a3a,
        shoot: { range: 340, dmg: 10, projSpeed: 220, cooldownMs: 1800,
                 count: 1, spreadDeg: 0, lifeMs: 2600, tint: 0x41d6f6, texture: 'orbShot' },
        mapVerb: 'squidInk',                                   // when hurt → ink blot + jet away
        ink: { cloudR: 90, cloudMs: 2400, slowMult: 0.6, jetSpeed: 360, jetMs: 340, cooldownMs: 3200 },
        unlockAt: 25 };
      DATA.mobs.crimsonStarfish = { name: 'Crimson Starfish', texture: 'abyssStarfishHi', hp: 34, spd: 60, xp: 12, cost: 1,
        deathTint: 0xe05a3a, chase: { contactDmg: 6 },
        mapVerb: 'starLatch',                                  // warned hop-arc → latch (SHORT player slow)
        latch: { range: 240, warnMs: 550, hopMs: 340, hopSpeed: 430,
                 latchMs: 900, slowMult: 0.5, breakDist: 120, cooldownMs: 4200 },
        unlockAt: 15 };
      DATA.mobs.drownedDiver = { name: 'Drowned Diver', texture: 'abyssDiverHi', hp: 90, spd: 45, xp: 22, cost: 3,
        deathTint: 0xc8963c, chase: { contactDmg: 9 },
        mapVerb: 'diverHarpoon',                               // aim-line → harpoon pulls YOU a step in (capped)
        harpoon: { everyMs: 5000, range: 420, warnMs: 900, pull: 150, cooldownTag: 'reel' },
        unlockAt: 35 };
      DATA.mobs.ghostFisherman = { name: 'Ghost Fisherman', texture: 'abyssFishermanHi', hp: 80, spd: 48, xp: 22, cost: 3,
        deathTint: 0xc8b04a, chase: { contactDmg: 8 },
        mapVerb: 'fishermanCast',                              // lure onto warned circle → yank drags the hooked
        cast: { everyMs: 5400, range: 440, warnMs: 950, radius: 60, pull: 160, cooldownTag: 'reel' },
        unlockAt: 40 };
      DATA.mobs.trenchLobster = { name: 'Trench Lobster', texture: 'abyssLobsterHi', hp: 150, spd: 55, xp: 28, cost: 3,
        deathTint: 0xe06a4a, chase: { contactDmg: 12 },
        mapVerb: 'lobsterCharge',                              // claws up → snip-charge lane; ARMORED frontal
        charge: { everyMs: 5600, range: 480, warnMs: 950, len: 520, half: 26, chargeMs: 1000, speed: 440,
                  frontArmor: 0.4, frontDeg: 70 },
        unlockAt: 45 };
      DATA.mobs.bandedSeaSnake = { name: 'Banded Sea Snake', texture: 'abyssSnakeHi', hp: 70, spd: 75, xp: 20, cost: 3,
        deathTint: 0x2a3a44, chase: { contactDmg: 9 },
        mapVerb: 'snakeStrike',                                // S-coil → warned strike cone + venom slow
        strike: { everyMs: 5000, range: 300, warnMs: 900, halfRad: 0.55, dmg: 14,
                  venomMs: 2600, venomMult: 0.6 },
        unlockAt: 50 };
      DATA.mobs.lanternSnail = { name: 'Lantern Snail', texture: 'abyssSnailHi', hp: 40, spd: 30, xp: 14, cost: 2,
        deathTint: 0x7df9d8, float: false,                     // harmless mender — NO chase (keg lesson)
        mapVerb: 'snailHeal',                                  // mends nearby mobs — priority target
        mend: { everyMs: 2600, range: 260, heal: 12, fleeRange: 170 },
        maxConcurrent: 2, unlockAt: 30 };
      DATA.mobs.krakenSpawn = { name: 'Kraken Spawn', texture: 'abyssKrakenHi', hp: 240, spd: 20, xp: 42, cost: 4,
        deathTint: 0x7a3a5a, chase: { contactDmg: 14 },
        mapVerb: 'krakenSlam',                                 // anchored; telegraphed tentacle-slam lanes in sequence
        slam: { everyMs: 5200, range: 460, count: 3, warnMs: 950, gapMs: 500, len: 300, half: 34, dmg: 18 },
        maxConcurrent: 1, unlockAt: 60 };

      // ---- THE VOLT WYRM · THE LEVIATHAN (mapOwned segmented serpent) ----
      DATA.bosses.voltWyrm = {
        name: 'The Volt Wyrm', texture: 'abyssWyrmHead',
        hp: 4200, spd: 60, xp: 620, contactDmg: 26, deathTint: 0xd8e84a,
        lootTable: 'voltWyrm',
        mapOwned: true, entranceMs: 3400,
        // segmented body: head entity + N followers + tail (follow-the-leader)
        segments: { count: 11, spacing: 34, brushDmg: 8, segHitMult: 0.55,
                    waveAmp: 46, waveLen: 220, headWeave: 60 },
        patterns: {
          verbEveryMs: 5200,
          snapStrike:    { warnMs: 900, len: 620, half: 30, dmg: 24, lungeMs: 500, speed: 620 },
          voltDischarge: { points: 3, warnMs: 850, ringMs: 750, maxR: 150, gapMs: 260, dmg: 18 },
          tailWhip:      { warnMs: 850, range: 300, halfRad: 0.9, dmg: 20 },
          deepDive:      { warnMs: 1000, shadowMs: 1600, breachR: 150, breachWarnMs: 950, breachDmg: 26,
                           ventMs: 3600, ventDmgMult: 1.5 },                                  // SIGNATURE P1
          liveWire:      { warnMs: 800, activeMs: 3000, shockDmg: 16 },
          chainLightning:{ warnMs: 850, arcs: 3, half: 22, dmg: 18 },
          serpentUndertow:{ warnMs: 900, activeMs: 4000, pull: 130, snapDmg: 20 },
          maelstrom:     { dives: 3, warnMs: 900, breachR: 140, gapMs: 700, latticeRings: 4, latticeGap: 320,
                           dmg: 24, ventMs: 4200, ventDmgMult: 1.5 },                         // SIGNATURE P2
          phase2Pct: 0.5,
          overclock:   { hpPct: 0.25, rateMult: 0.75 }
        },
        title: 'THE LEVIATHAN',
        hints: [
          "The body stings, but the HEAD kills — punish the antlered skull, not the coil.",
          "The coil is an arrow: he strikes where it points. When his scales GLOW, stand in the ring gaps.",
          "Track his shadow gliding under the floor — a DEEP DIVE breaches where you stand.",
          "Anchored cover beats the undertow — and beats his. Don't get swept into a live-wire coil.",
          "CHAIN LIGHTNING leaps his body to the volt eels; kill the eels to starve it.",
          "After a breach he's BEACHED and winded — unload while he untangles."
        ]
      };
      DATA.dropTables.voltWyrm = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.undertowrumble = { type: 'sawtooth', freq: 70, freqEnd: 130, len: 0.9, vol: 0.14, limitMs: 1000,
                                           noise: { vol: 0.08, hp: 300 } };
      DATA.audio.sounds.currentwhoosh = { type: 'sawtooth', freq: 240, freqEnd: 90, len: 0.6, vol: 0.09, limitMs: 700,
                                          noise: { vol: 0.06, hp: 1800 } };
      DATA.audio.sounds.coralcrack = { type: 'square', freq: 900, freqEnd: 300, len: 0.2, vol: 0.12, limitMs: 250,
                                       noise: { vol: 0.07, hp: 1600 } };
      DATA.audio.sounds.coralburst = { type: 'square', freq: 1200, freqEnd: 200, len: 0.35, vol: 0.14, limitMs: 400,
                                       noise: { vol: 0.1, hp: 1200 } };
      DATA.audio.sounds.coralregrow = { type: 'triangle', freq: 300, freqEnd: 700, len: 0.4, vol: 0.1, limitMs: 500 };
      DATA.audio.sounds.sonarping = { type: 'triangle', freq: 1400, freqEnd: 1400, len: 0.25, vol: 0.12, limitMs: 300 };
      DATA.audio.sounds.jellyzap = { type: 'square', freq: 1800, freqEnd: 900, len: 0.15, vol: 0.09, limitMs: 220 };
      DATA.audio.sounds.lancewhoosh = { type: 'sawtooth', freq: 500, freqEnd: 140, len: 0.25, vol: 0.13, limitMs: 300 };
      DATA.audio.sounds.shockhum = { type: 'sawtooth', freq: 220, freqEnd: 260, len: 0.5, vol: 0.08, limitMs: 600 };
      DATA.audio.sounds.inkpuff = { type: 'triangle', freq: 400, freqEnd: 120, len: 0.3, vol: 0.1, limitMs: 350 };
      DATA.audio.sounds.latchsquelch = { type: 'square', freq: 320, freqEnd: 620, len: 0.16, vol: 0.12, limitMs: 220 };
      DATA.audio.sounds.abyssharpoon = { type: 'square', freq: 260, freqEnd: 120, len: 0.2, vol: 0.13, limitMs: 260 };
      DATA.audio.sounds.lureyank = { type: 'square', freq: 500, freqEnd: 900, len: 0.18, vol: 0.12, limitMs: 240 };
      DATA.audio.sounds.lobstersnip = { type: 'square', freq: 700, freqEnd: 300, len: 0.18, vol: 0.12, limitMs: 240 };
      DATA.audio.sounds.snakehiss = { type: 'sawtooth', freq: 2400, freqEnd: 1200, len: 0.3, vol: 0.07, limitMs: 350,
                                      noise: { vol: 0.06, hp: 3000 } };
      DATA.audio.sounds.snailchime = { type: 'triangle', freq: 900, freqEnd: 1300, len: 0.3, vol: 0.1, limitMs: 350 };
      DATA.audio.sounds.krakenslam = { type: 'sawtooth', freq: 120, freqEnd: 60, len: 0.6, vol: 0.15, limitMs: 700,
                                       noise: { vol: 0.08, hp: 400 } };
      DATA.audio.sounds.wyrmsnap = { type: 'square', freq: 500, freqEnd: 140, len: 0.25, vol: 0.15, limitMs: 300 };
      DATA.audio.sounds.wyrmcharge = { type: 'sawtooth', freq: 160, freqEnd: 520, len: 0.7, vol: 0.12, limitMs: 800 };
      DATA.audio.sounds.wyrmdischarge = { type: 'square', freq: 1400, freqEnd: 300, len: 0.4, vol: 0.14, limitMs: 450,
                                          noise: { vol: 0.09, hp: 1400 } };
      DATA.audio.sounds.wyrmbreach = { type: 'sawtooth', freq: 90, freqEnd: 300, len: 0.9, vol: 0.16, limitMs: 1000,
                                       noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.wyrmroar = { type: 'sawtooth', freq: 110, freqEnd: 70, len: 0.8, vol: 0.16, limitMs: 900,
                                     noise: { vol: 0.08, hp: 300 } };
      DATA.audio.music.abyss = UNDER_THE_TRENCH;

      MAPS.addConsoleMap(DATA, { id: 'abyss', name: 'THE ABYSS',
        sub: 'crush depth, living light', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof ABYSS_ART !== 'undefined') ABYSS_ART.buildInto(ctx);
    },

    mobVerbs: {
      jellyDrift: function (scene, m, player, time) { return scene._abJelly(m, player, time); },
      swordLance: function (scene, m, player, time) { return scene._abSword(m, player, time); },
      voltZap: function (scene, m, player, time) { return scene._abVolt(m, player, time); },
      squidInk: function (scene, m, player, time) { return scene._abSquid(m, player, time); },
      starLatch: function (scene, m, player, time) { return scene._abStar(m, player, time); },
      diverHarpoon: function (scene, m, player, time) { return scene._abDiver(m, player, time); },
      fishermanCast: function (scene, m, player, time) { return scene._abFisher(m, player, time); },
      lobsterCharge: function (scene, m, player, time) { return scene._abLobster(m, player, time); },
      snakeStrike: function (scene, m, player, time) { return scene._abSnake(m, player, time); },
      snailHeal: function (scene, m, player, time) { return scene._abSnail(m, player, time); },
      krakenSlam: function (scene, m, player, time) { return scene._abKraken(m, player, time); }
    },

    scene: (typeof ABYSS_SCENE !== 'undefined') ? ABYSS_SCENE : {}
  });
})();
