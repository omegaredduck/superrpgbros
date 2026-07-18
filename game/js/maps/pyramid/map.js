// ============================================================================
// game/js/maps/pyramid/map.js — PYRAMID PLUNDER (realm 6) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-15). Numbers TUNE ME, pitched a
// notch above skyisles (realm 6). Two-phase boss rides the registry
// def.transform hook (engineer-cutscene precedent, map-owned).
// ============================================================================
(function () {
  'use strict';

  // ---- "THE ETERNAL CHILD" — 8-bit ancient-curse dread (Red-approved WAV).
  // Port of assets/render/render_pyramid_theme.js as a section composer:
  // 84 BPM, D hijaz, 63 bars = 252 beats = EXACTLY 180.0s. Eight monophonic
  // chip voices, EXACTLY 4 beats per bar per track (asserted). Drums faked:
  // heartbeat toms = short low triangles (lub-DUB), sand shaker = soft high
  // square ticks, tomb gong / dark bells = long low triangles.
  var ETERNAL_CHILD = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var CHANT = [[38, 45], [39, 46], [38, 45], [36, 43]];      // D2+A2 / Eb2+Bb2 / D / C2+G2
    var LEAD_A = [
      [62, -1, 63, 62, 66, -1, 62, -1], [63, -1, 62, 63, 60, -1, 58, -1],
      [62, 66, 67, 66, 63, 62, 63, -1], [62, -1, -1, -1, 58, 60, 62, -1]
    ];
    var LEAD_B = [
      [69, -1, 70, 69, 66, -1, 67, 66], [63, -1, 66, 63, 62, -1, 60, 58],
      [69, 70, 72, 70, 69, 66, 67, -1], [62, -1, 63, 62, 58, -1, 62, -1]
    ];
    function sec(b) {
      if (b < 8) return { drone: b >= 1, heart: b >= 4, chant: false, lead: null, shk: false, heavy: false };
      if (b < 20) return { drone: true, heart: true, chant: true, lead: null, shk: false, heavy: false };
      if (b < 32) return { drone: true, heart: true, chant: true, lead: 'A', shk: true, heavy: false };
      if (b < 40) return { drone: true, heart: true, chant: true, lead: null, shk: true, heavy: true, stabs: true };
      if (b < 54) return { drone: true, heart: true, chant: true, lead: 'B', shk: true, heavy: true };
      return { drone: true, heart: b < 60, chant: b < 58, lead: b >= 58 ? 'A' : null, shk: false, heavy: false };
    }
    var GONGS = { 0: 1, 8: 1, 20: 1, 32: 1, 40: 1, 54: 1 };
    var drone = [], chant1 = [], chant2 = [], heart = [], shk = [], stabs = [], lead = [], bell = [];
    for (var b = 0; b < 63; b++) {
      var s = sec(b), t = b % 4, c1 = CHANT[t][0], c2 = CHANT[t][1];
      var isLast = b === 62;
      // tomb drone — deep whole-bar hold
      drone.push(s.drone ? [m2n(c1 - 12), 4] : [null, 4]);
      // under-floor chant pair
      chant1.push(s.chant ? [m2n(c1), 4] : [null, 4]);
      chant2.push(s.chant ? [m2n(c2), 4] : [null, 4]);
      // heartbeat toms: lub-DUB on 1 & the and-of-2 (doubled when heavy)
      if (isLast) heart.push([m2n(26), 0.3], [null, 3.7]);                       // one last heartbeat
      else if (s.heart && s.heavy) heart.push([m2n(26), 0.22], [null, 1.28], [m2n(31), 0.22], [null, 0.28], [m2n(26), 0.22], [null, 1.28], [m2n(31), 0.22], [null, 0.28]);
      else if (s.heart) heart.push([m2n(26), 0.22], [null, 1.28], [m2n(31), 0.22], [null, 2.28]);
      else heart.push([null, 4]);
      // sand shaker — soft high 8th ticks
      if (s.shk && !isLast) { for (var e = 0; e < 8; e++) shk.push(['B6', 0.06], [null, 0.44]); }
      else shk.push([null, 4]);
      // dissonant dread stabs in the build
      if (s.stabs && (t === 1 || t === 3)) stabs.push([null, 2], [m2n(c1 + 13), 0.6], [null, 1.4]);
      else stabs.push([null, 4]);
      // snake-charmer lead w/ grace-note ornaments (half-step above, on 1 & 3)
      var line = s.lead === 'A' ? LEAD_A[t] : s.lead === 'B' ? LEAD_B[t] : null;
      if (line && !isLast) {
        for (var e2 = 0; e2 < 8; e2++) {
          var m = line[e2];
          if (m < 0) lead.push([null, 0.5]);
          else if (e2 === 0 || e2 === 4) lead.push([m2n(m + 1), 0.12], [m2n(m), 0.38]);
          else lead.push([m2n(m), 0.5]);
        }
      } else lead.push([null, 4]);
      // tomb gong at the section doors · dark bell tolls through the climax ·
      // the final bar: heartbeat, then the child's small high bell (WRONG on
      // purpose), then the gong fading alone
      if (isLast) bell.push([null, 1], [m2n(74), 1], [m2n(26), 2]);
      else if (GONGS[b]) bell.push([m2n(26), 4]);
      else if (b >= 40 && b < 54 && t === 0) bell.push([m2n(62), 4]);
      else bell.push([null, 4]);
    }
    var TR = [drone, chant1, chant2, heart, shk, stabs, lead, bell];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 252) > 1e-6) throw new Error('ETERNAL CHILD track beat mismatch: ' + sum);
    });
    return {
      bpm: 84,
      tracks: [
        { type: 'triangle', vol: 0.11,  notes: drone },   // tomb drone
        { type: 'square',   vol: 0.045, notes: chant1 },  // under-floor chant
        { type: 'square',   vol: 0.035, notes: chant2 },
        { type: 'triangle', vol: 0.15,  notes: heart },   // heartbeat toms
        { type: 'square',   vol: 0.018, notes: shk },     // sand shaker hiss
        { type: 'square',   vol: 0.04,  notes: stabs },   // dissonant dread stabs
        { type: 'square',   vol: 0.06,  notes: lead },    // snake-charmer hijaz lead
        { type: 'triangle', vol: 0.09,  notes: bell }     // gong + dark bells + the child's bell
      ]
    };
  })();

  MAPS.register({
    id: 'pyramid',

    installData: function (DATA) {
      DATA.biomes.pyramid = {
        name: 'Pyramid Plunder', tile: 'pydesert',
        mobs: ['scarab', 'jackalRunner', 'khopeshGuard', 'tombWeaver',
               'broodmother', 'apepSpawn', 'sandstoneGolem', 'ankhPriest']
      };
      DATA.realms.pyramid = {
        name: 'Pyramid Plunder', biome: 'pyramid', boss: 'neferuka',
        kind: 'pyramid', music: 'pyramid',
        // TREASURE & CURSE knobs (PLAN §4) — ALL TUNE ME
        curse: { lootXp: 60, urnXp: 8, buffMs: 4000, buffMult: 1.25,
                 dotMs: 3000, dotTickMs: 600, dotDmg: 2,
                 waveEvery: 3, pitGrow: 14,
                 trapCooldownMs: 2600, dartLen: 420, dartHalf: 26, dartWarnMs: 600, dartDmg: 14 }
      };
      // ---- the 8 mobs (Red picks #1 5 3 7 14 12 11 10) ----
      DATA.mobs.scarab = { name: 'Scarab', texture: 'scarabHi', hp: 16, spd: 105, xp: 4, cost: 1,
        deathTint: 0x2a5fc2, chase: { contactDmg: 6 } };
      DATA.mobs.broodmother = { name: 'Broodmother', texture: 'broodmotherHi', hp: 120, spd: 38, xp: 22, cost: 3,
        deathTint: 0x66e8a0, chase: { contactDmg: 12 },
        split: { key: 'scarab', count: 6, ring: 30 }, unlockAt: 45 };
      DATA.mobs.khopeshGuard = { name: 'Khopesh Guard', texture: 'khopeshGuardHi', hp: 66, spd: 72, xp: 18, cost: 3,
        deathTint: 0xe8e0c8, chase: { contactDmg: 12 },
        lunge: { range: 240, windupMs: 720, dashMs: 240, dashSpeed: 370, cooldownMs: 3400 },
        // periodic VISIBLE shield window — shots bounce ('BLOCKED'), gap is generous
        mapVerb: 'guardShield', shieldWindow: { everyMs: 5200, windowMs: 1400 },
        unlockAt: 30 };
      DATA.mobs.ankhPriest = { name: 'Ankh Priest', texture: 'ankhPriestHi', hp: 56, spd: 46, xp: 32, cost: 5,
        deathTint: 0x66e8a0, chase: { contactDmg: 6 },
        mend: { everyMs: 1700, radius: 155, amount: 14 }, maxConcurrent: 2, unlockAt: 70 };
      DATA.mobs.tombWeaver = { name: 'Tomb Weaver', texture: 'tombWeaverHi', hp: 58, spd: 52, xp: 20, cost: 3,
        deathTint: 0xe0d4b8, chase: { contactDmg: 8 },
        slowField: { everyMs: 2000, radius: 70, lifeMs: 3200, slowMult: 0.55 }, unlockAt: 40 };
      DATA.mobs.apepSpawn = { name: 'Apep Spawn', texture: 'apepSpawnHi', hp: 62, spd: 44, xp: 24, cost: 4,
        deathTint: 0x7a4fd0, chase: { contactDmg: 8 },
        // venom lobs onto warned circles → lingering poison puddle (fire-circle tech, curse flavor)
        flameCircle: { range: 320, windupMs: 1000, radius: 84, dmg: 18, everyMs: 4600,
                       lingerMs: 1400, tickMs: 320, lingerDmg: 5, tint: 0x66e8a0 },
        maxConcurrent: 3, unlockAt: 55 };
      DATA.mobs.jackalRunner = { name: 'Jackal Runner', texture: 'jackalRunnerHi', hp: 30, spd: 125, xp: 9, cost: 2,
        deathTint: 0x2c2434, chase: { contactDmg: 9 },
        mapVerb: 'jackalPack',                              // spawns in packs of 2–3
        unlockAt: 20 };
      DATA.mobs.sandstoneGolem = { name: 'Sandstone Golem', texture: 'sandstoneGolemHi', hp: 180, spd: 42, xp: 28, cost: 4,
        deathTint: 0xc2996a, chase: { contactDmg: 16 },
        mapVerb: 'golemPound', pound: { range: 200, everyMs: 4800, warnMs: 1000, radius: 90, dmg: 20 },
        unlockAt: 60 };

      // ---- NEFERU-KA — THE ETERNAL CHILD → THE EXECUTIONER (two-phase,
      // mapOwned, def.transform → registry bossTransform; NO projectiles) ----
      DATA.bosses.neferuka = {
        name: 'Neferu-Ka', texture: 'neferukaHi',
        hp: 1300, spd: 30, xp: 360, contactDmg: 18, deathTint: 0x66e8a0,
        lootTable: 'neferuka',
        mapOwned: true, transform: true,
        entranceMs: 3000, transformMs: 3200,
        // phase 2 body (the mech precedent — swap texture + resize the body)
        exec: { texture: 'executionerHi', display: 160, bodyW: 52, bodyH: 56,
                spdMult: 2.4, rateMult: 0.9 },
        patterns: {
          // ---- phase 1: THE ETERNAL CHILD (caster) ----
          curseSigils:   { everyMs: 5600, count: 3, warnMs: 1200, radius: 70, dmg: 20, scatter: 170 },
          maskGaze:      { everyMs: 7600, warnMs: 1100, range: 400, halfRad: 0.42, dmg: 24 },
          tantrumQuake:  { everyMs: 12000, tile: 112, warnMs: 1300, gapMs: 650, dmg: 20 },
          sandsOfAge:    { everyMs: 9000, count: 2, warnMs: 900, radius: 80, scatter: 160, lingerMs: 6000 },
          royalSummons:  { everyMs: 12000, count: 2, cap: 6 },
          // ---- phase 2: THE EXECUTIONER (melee hunter) ----
          crossSlash:    { everyMs: 7200, len: 760, half: 44, warnMs: 1300, dashMs: 480, dmg: 26 },
          whirlingBlades:{ everyMs: 10000, growMs: 2200, radius: 250, dmg: 30 },
          brand:         { everyMs: 6000, warnMs: 1500, radius: 74, dmg: 24 },
          guillotineLeap:{ everyMs: 8600, trackMs: 1000, lockMs: 600, radius: 96, dmg: 30 },
          judgmentFour:  { everyMs: 17000, firstDelayMs: 10000, warnMs: 900, gapMs: 550, half: 46,
                           ventMs: 3500, ventDmgMult: 1.5 },
          jackalPack:    { everyMs: 11000, count: 3, cap: 6 },
          overclock:     { hpPct: 0.35, spdMult: 1.2, rateMult: 0.8 }
        },
        title: 'THE ETERNAL CHILD',
        hints: [
          'A CHILD in a golden mask — serene, floating, wrong. Every spell paints the floor first.',
          'CURSE SIGILS bloom around you and blast. Walk out before they fill.',
          'MASK GAZE — the cone LOCKS where it glows. Step off the beam line before the eyes flare.',
          'TANTRUM QUAKE — the gold floor erupts in TWO alternating waves. Stand on the wave that already fired.',
          'SANDS OF AGE leave real quicksand — do not fight standing in it.',
          'KILL HIM AND HE GROWS UP. The Executioner strides out of the curse — phase two hunts you.'
        ],
        // phase-2 scouter sheet (shown at the transformation)
        execScouter: {
          name: 'The Executioner', texture: 'executionerHi',
          title: 'HIS TRUE FORM', hp: 1300, spd: 72, xp: 0, contactDmg: 18, deathTint: 0xc2452e,
          patterns: {},
          hints: [
            'TWIN KHOPESH, ZERO spells — every kill move paints a lane or a circle. Trust the paint.',
            'CROSS-SLASH — an X flashes through you; he dashes BOTH lanes in sequence. Stand in a wedge, not a lane.',
            'WHIRLING BLADES — he roots and a ring GROWS. Outrun it before it blows.',
            "EXECUTIONER'S BRAND — a sigil marks where you STOOD. Drop the zone and keep moving.",
            'GUILLOTINE LEAP — the circle tracks you, then LOCKS. Sprint the moment it flashes bright.',
            'JUDGMENT OF THE FOUR — the statues sweep beam-walls in sequence; after the fourth he KNEELS — unload.'
          ]
        }
      };
      DATA.dropTables.neferuka = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.lootchime = { type: 'triangle', arp: [1047, 1319, 1568], len: 0.35, vol: 0.16, limitMs: 300 };
      DATA.audio.sounds.cursewhisper = { type: 'sawtooth', freq: 90, freqEnd: 160, len: 1.0, vol: 0.12, limitMs: 1200,
                                         noise: { vol: 0.06, hp: 2600 } };
      DATA.audio.sounds.trapdart = { type: 'square', freq: 1300, freqEnd: 700, len: 0.09, vol: 0.14, limitMs: 150,
                                     noise: { vol: 0.05, hp: 3000 } };
      DATA.audio.sounds.sandgulp = { type: 'triangle', freq: 300, freqEnd: 70, len: 0.4, vol: 0.18, limitMs: 500 };
      DATA.audio.sounds.sigilbloom = { type: 'triangle', freq: 520, freqEnd: 880, len: 0.5, vol: 0.14, limitMs: 500 };
      DATA.audio.sounds.gazehum = { type: 'sawtooth', freq: 120, freqEnd: 240, len: 1.0, vol: 0.13, limitMs: 1200 };
      DATA.audio.sounds.transformhowl = { type: 'sawtooth', freq: 200, freqEnd: 55, len: 1.3, vol: 0.26, limitMs: 1500,
                                          noise: { vol: 0.1, hp: 800 } };
      DATA.audio.sounds.khopeshshing = { type: 'square', freq: 900, freqEnd: 1600, len: 0.12, vol: 0.13, limitMs: 140,
                                         noise: { vol: 0.05, hp: 2400 } };
      DATA.audio.sounds.statuebeam = { type: 'sawtooth', freq: 70, freqEnd: 300, len: 1.1, vol: 0.15, limitMs: 1300,
                                       noise: { vol: 0.05, hp: 1800 } };
      DATA.audio.music.pyramid = ETERNAL_CHILD;

      MAPS.addConsoleMap(DATA, { id: 'pyramid', name: 'PYRAMID PLUNDER',
        sub: 'Neferu-Ka waits below the seal', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof PYRAMID_ART !== 'undefined') PYRAMID_ART.buildInto(ctx);
    },

    mobVerbs: {
      guardShield: function (scene, m, player, time) { return scene._pyrGuardShield(m, player, time); },
      golemPound: function (scene, m, player, time) { return scene._pyrGolemPound(m, player, time); },
      jackalPack: function (scene, m, player, time) { return scene._pyrJackalPack(m, player, time); }
    },

    scene: (typeof PYRAMID_SCENE !== 'undefined') ? PYRAMID_SCENE : {}
  });
})();
