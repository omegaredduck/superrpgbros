// ============================================================================
// game/js/maps/lunar/map.js — LUNAR STATION (realm 8) data + registration.
// Every pick is Red's (PLAN.md, Map-4 bundle locked 2026-07-16). Numbers TUNE
// ME, pitched a notch above the castle (realm 8). LOW GRAVITY is the map
// system — the knobs live in realm.lowGrav. SPECIMEN ZERO is a psychic
// zone-caster (boss contract: ground overlays, ZERO projectile spam).
// ============================================================================
(function () {
  'use strict';

  // ---- "SEA OF TRANQUILITY" — 8-bit zero-G wonder (Red-approved WAV).
  // Port of assets/render/render_lunar_theme.js as a section composer:
  // 72 BPM, C Lydian, 54 bars = 216 beats = EXACTLY 180.0s. Ten monophonic
  // chip voices, EXACTLY 4 beats per bar per track (asserted). Drifting pads,
  // starlight 16th arps, a glass-bell melody, then THE MENACE: a deep drone,
  // a tritone, alien clicks in the vents, a heartbeat — and an uneasy return
  // where one note stays wrong. Ends on a ringing bell and a single click.
  var SEA_OF_TRANQUILITY = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    // wonder: C Lydian pads | menace: darkened clusters w/ tritone
    var W_PADS = [[48, 55, 64, 71], [45, 52, 62, 69], [41, 48, 60, 66], [43, 50, 62, 67]];
    var M_PADS = [[48, 54, 58, 63], [46, 51, 58, 61], [44, 51, 56, 60], [47, 53, 56, 62]];
    var BELL_A = [
      [84, -1, 79, -1, 83, -1, -1, 76], [81, -1, -1, 76, 79, -1, -1, -1],
      [78, -1, 83, -1, 86, -1, 84, -1], [79, -1, -1, -1, 74, -1, 76, -1]
    ];
    var BELL_B = [
      [88, -1, 86, -1, 83, -1, 84, -1], [86, -1, -1, 81, 83, -1, -1, -1],
      [90, -1, 88, -1, 86, -1, 83, -1], [84, -1, -1, -1, 79, -1, 83, -1]
    ];
    function sec(b) {
      if (b < 8) return { pads: 'W', arp: b >= 2 };
      if (b < 20) return { pads: 'W', arp: true, bells: 'A' };
      if (b < 28) return { pads: 'M', arp: true, bells: 'A', drone: b >= 24, clicks: b >= 24, dim: true };
      if (b < 38) return { pads: 'W', arp: true, bells: 'B', high: true };
      if (b < 48) return { pads: 'M', drone: true, clicks: true, menace: true };
      return { pads: 'W', arp: b < 52, bells: b < 52 ? 'A' : null, drone: true, clicks: b % 2 === 0, uneasy: true };
    }
    var CHIMES = { 8: 1, 20: 1, 28: 1, 38: 1, 48: 1 };
    var CLICK_OFF = [0.3, 1.1, 1.7, 2.6, 3.2, 3.7];
    var pad1 = [], pad2 = [], pad3 = [], pad4 = [], arp = [], bell = [],
        accents = [], drone = [], clicks = [], heart = [];
    for (var b = 0; b < 54; b++) {
      var s = sec(b), t = b % 4, isLast = b === 53;
      var pad = (s.pads === 'W' ? W_PADS : M_PADS)[t];
      // wide slow pads (whole-bar holds, four voices)
      pad1.push([m2n(pad[0]), 4]); pad2.push([m2n(pad[1]), 4]);
      pad3.push([m2n(pad[2]), 4]); pad4.push([m2n(pad[3]), 4]);
      // shimmering 16th arps drifting up (the starlight)
      if (s.arp && !isLast) {
        for (var e = 0; e < 16; e++) {
          var am = pad[e % 4] + 24 + (e >= 8 ? 12 : 0);
          if (s.dim && e % 5 === 0) am -= 1;
          arp.push([m2n(am), 0.25]);
        }
      } else arp.push([null, 4]);
      // glass-bell melody (eighths, sparse)
      var line = s.bells === 'A' ? BELL_A[t] : s.bells === 'B' ? BELL_B[t] : null;
      if (line && !isLast) {
        for (var e2 = 0; e2 < 8; e2++) {
          var bm = line[e2];
          if (bm < 0) { bell.push([null, 0.5]); continue; }
          if (s.uneasy && (b + e2) % 7 === 0) bm -= 1;          // the wrong note that stays
          bell.push([m2n(bm + (s.high ? 12 : 0)), 0.5]);
        }
      } else bell.push([null, 4]);
      // section-door chime · the menace tritone · the final ringing bell
      if (isLast) accents.push([null, 1], [m2n(95), 3]);
      else if (CHIMES[b]) accents.push([m2n(96), 4]);
      else if (s.menace && t === 2) accents.push([m2n(42), 4]); // the tritone
      else accents.push([null, 4]);
      // menace drone: deep whole-bar hold
      drone.push(s.drone ? [m2n(36), 4] : [null, 4]);
      // alien clicks skittering in the vents (+ the very last click)
      if (isLast) clicks.push([null, 3.2], ['G7', 0.1], [null, 0.7]);
      else if (s.clicks) {
        var rests = [0.3, 0.7, 0.5, 0.8, 0.5, 0.4];
        for (var ci = 0; ci < 6; ci++) {
          clicks.push([null, rests[ci]]);
          clicks.push([(b * 7 + ci) % 3 !== 0 ? 'G7' : null, 0.1]);
        }
        clicks.push([null, 0.2]);
      } else clicks.push([null, 4]);
      // heartbeat under the menace (lub… DUB)
      if (s.menace && !isLast) heart.push([m2n(34), 0.18], [null, 1.22], [m2n(38), 0.18], [null, 2.42]);
      else heart.push([null, 4]);
    }
    var TR = [pad1, pad2, pad3, pad4, arp, bell, accents, drone, clicks, heart];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 216) > 1e-6) throw new Error('SEA OF TRANQUILITY track beat mismatch: ' + sum);
    });
    return {
      bpm: 72,
      tracks: [
        { type: 'triangle', vol: 0.055, notes: pad1 },    // pad low
        { type: 'triangle', vol: 0.05,  notes: pad2 },
        { type: 'square',   vol: 0.022, notes: pad3 },    // pad shimmer
        { type: 'square',   vol: 0.018, notes: pad4 },
        { type: 'square',   vol: 0.026, notes: arp },     // starlight 16ths
        { type: 'triangle', vol: 0.1,   notes: bell },    // glass-bell melody
        { type: 'triangle', vol: 0.07,  notes: accents }, // chimes + tritone + final bell
        { type: 'triangle', vol: 0.11,  notes: drone },   // the menace drone
        { type: 'square',   vol: 0.02,  notes: clicks },  // vent clicks
        { type: 'triangle', vol: 0.15,  notes: heart }    // heartbeat
      ]
    };
  })();

  MAPS.register({
    id: 'lunar',

    installData: function (DATA) {
      DATA.biomes.lunar = {
        name: 'Lunar Station', tile: 'lnregolith',
        mobs: ['greyWatcher', 'broodSac', 'sentryDrone', 'haywireTurret',
               'astroRevenant', 'magnetron', 'lunaLeaper', 'orbitalMine', 'starHorror']
      };
      DATA.realms.lunar = {
        name: 'Lunar Station', biome: 'lunar', boss: 'specimenzero',
        kind: 'lunar', music: 'lunar',
        // LOW GRAVITY knobs (PLAN §2) — ALL TUNE ME
        lowGrav: { kbMult: 2.0, kbGlideMs: 450,               // knockback drifts ~2× + hangs
                   glideGain: 0.5, glideDecay: 0.86,          // dodge/momentum glide
                   padAirMs: 700, padCooldownMs: 1500,        // jump pads
                   dustEveryMs: 240, dustLifeMs: 900 }        // dust puffs
      };
      // ---- the 9 mobs (Red kept all picks #4 7 8 9 10 11 12 18 20) ----
      DATA.mobs.greyWatcher = { name: 'Grey Watcher', texture: 'greyWatcherHi', hp: 40, spd: 55, xp: 14, cost: 2,
        deathTint: 0x8a5fd6, chase: { contactDmg: 8 },
        shoot: { range: 340, dmg: 12, projSpeed: 240, cooldownMs: 1700,
                 count: 1, spreadDeg: 0, lifeMs: 2600, tint: 0x4adcf0, texture: 'orbShot' } };
      DATA.mobs.broodSac = { name: 'Brood Sac', texture: 'broodSacHi', hp: 90, spd: 10, xp: 26, cost: 3,
        deathTint: 0xb8f04a, chase: { contactDmg: 4 },
        mapVerb: 'broodSac',                                  // dormant → hatches waves
        sac: { triggerRange: 210, crackMs: 700, waveEveryMs: 3200, perWave: 3, cap: 8 },
        maxConcurrent: 3, unlockAt: 25 };
      DATA.mobs.scuttler = { name: 'Scuttler', texture: 'scuttlerHi', hp: 14, spd: 118, xp: 3, cost: 1,
        deathTint: 0x5fd668, chase: { contactDmg: 6 } };      // hatchling — not in the spawn pool
      DATA.mobs.sentryDrone = { name: 'Sentry Drone', texture: 'sentryDroneHi', hp: 46, spd: 88, xp: 16, cost: 2,
        deathTint: 0xff4b4e, float: true,
        shoot: { range: 320, dmg: 10, projSpeed: 280, cooldownMs: 2000,
                 count: 3, spreadDeg: 14, lifeMs: 2200, tint: 0xff4b4e, texture: 'orbShot' },
        unlockAt: 20 };
      DATA.mobs.haywireTurret = { name: 'Haywire Turret', texture: 'haywireTurretHi', hp: 110, spd: 8, xp: 24, cost: 3,
        deathTint: 0xff9a3a, chase: { contactDmg: 6 },
        mapVerb: 'turretSweep',                               // rooted; sweeping beam arcs
        sweep: { everyMs: 5200, range: 420, warnMs: 900, gapMs: 260, arcs: 3,
                 stepRad: 0.5, len: 380, half: 22, dmg: 14 },
        maxConcurrent: 3, unlockAt: 40 };
      DATA.mobs.astroRevenant = { name: 'Astro-Revenant', texture: 'astroRevenantHi', hp: 70, spd: 40, xp: 22, cost: 3,
        deathTint: 0x8a5fd6, float: true, chase: { contactDmg: 10 },
        mapVerb: 'revenantGrab',                              // brief hold + damage
        grab: { range: 52, holdMs: 900, cooldownMs: 5200, dmg: 7 },
        unlockAt: 50 };
      DATA.mobs.magnetron = { name: 'Magnetron', texture: 'magnetronHi', hp: 85, spd: 34, xp: 26, cost: 4,
        deathTint: 0x4adcf0, float: true, chase: { contactDmg: 12 },
        // M7k AUDIT fix: renamed from `pull` — that key armed core updateMob's
        // mag-crane pull verb (nextPullAt = NaN). Scene update reads magnetPull.
        magnetPull: { radius: 260, spd: 85 },                 // constant drag (scene update)
        maxConcurrent: 2, unlockAt: 60 };
      DATA.mobs.lunaLeaper = { name: 'Luna Leaper', texture: 'lunaLeaperHi', hp: 44, spd: 70, xp: 16, cost: 2,
        deathTint: 0x8a5fd6,
        mapVerb: 'lunaLeap',                                  // low-grav arcs onto marks
        hop: { everyMs: 4200, range: 520, airMs: 750, landRadius: 60, dmg: 14 },
        unlockAt: 30 };
      DATA.mobs.orbitalMine = { name: 'Orbital Mine', texture: 'orbitalMineHi', hp: 20, spd: 60, xp: 10, cost: 2,
        deathTint: 0xff9a3a, float: true,
        mapVerb: 'orbitalMine',                               // drifts, beeps, BOOM; shootable
        mine: { armRange: 120, fuseMs: 1400, radius: 110, dmg: 22 },
        maxConcurrent: 4, unlockAt: 35 };
      DATA.mobs.starHorror = { name: 'Star Horror', texture: 'starHorrorHi', hp: 200, spd: 44, xp: 40, cost: 5,
        deathTint: 0x4c2c8e, float: true, chase: { contactDmg: 16 },
        mapVerb: 'horrorCone',                                // tentacle sweep cones
        cone: { everyMs: 5600, range: 260, warnMs: 950, halfRad: 0.55, dmg: 20 },
        maxConcurrent: 2, unlockAt: 75 };

      // ---- SPECIMEN ZERO · THE OVERMIND (mapOwned psychic zone-caster;
      // NO projectiles — every source is a warned ground overlay) ----
      DATA.bosses.specimenzero = {
        name: 'Specimen Zero', texture: 'specimenzeroHi',
        hp: 2800, spd: 26, xp: 420, contactDmg: 16, deathTint: 0x8a5fd6,
        lootTable: 'specimenzero',
        mapOwned: true, entranceMs: 3000,
        patterns: {
          tkBarrage:        { everyMs: 6000, count: 5, warnMs: 1150, radius: 68, dmg: 20, scatter: 190 },
          mindLash:         { everyMs: 8200, warnMs: 1100, range: 400, halfRad: 0.46, dmg: 24 },
          gravityWell:      { everyMs: 10500, warnMs: 1000, radius: 140, pullMs: 3000, pullSpd: 150, dmg: 22 },
          cableSweep:       { everyMs: 7400, count: 3, spreadRad: 0.55, len: 280, half: 20,
                              warnMs: 900, gapMs: 240, dmg: 18 },
          psychicScream:    { everyMs: 12000, growMs: 2400, maxR: 430, dmg: 20 },
          containmentPurge: { everyMs: 20000, firstDelayMs: 14000, sectors: 6, warnMs: 1300,
                              gapMs: 650, dmg: 26, ventMs: 3500, ventDmgMult: 1.5 },
          broodCall:        { everyMs: 12000, count: 4, cap: 8 },
          overclock:        { hpPct: 0.3, spdMult: 1.3, rateMult: 0.75 }
        },
        title: 'THE OVERMIND',
        hints: [
          'A grafted BRAIN in a cracked tank, hovering on its own mind. Every attack paints the floor first.',
          'TK BARRAGE — circles bloom and wreckage slams down. Walk out before they fill.',
          'GRAVITY WELL blooms where you stand and DRAGS you in — sprint against the pull.',
          'PSYCHIC SCREAM is a ring that expands from the tank. Outrun it; never stand still.',
          'Close range is a trap — its torn floor cables whip along warned lanes.',
          'CONTAINMENT PURGE vents the arena sector by sector: find the cold pocket. Then the glass FRACTURES — unload.'
        ]
      };
      DATA.dropTables.specimenzero = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.padlaunch = { type: 'square', arp: [440, 660, 990], len: 0.22, vol: 0.15, limitMs: 250 };
      DATA.audio.sounds.gravthump = { type: 'triangle', freq: 180, freqEnd: 50, len: 0.22, vol: 0.18, limitMs: 250,
                                      noise: { vol: 0.05, hp: 500 } };
      DATA.audio.sounds.airlockhiss = { type: 'triangle', freq: 90, freqEnd: 70, len: 0.5, vol: 0.05, limitMs: 700,
                                        noise: { vol: 0.12, hp: 2400 } };
      DATA.audio.sounds.psibolt = { type: 'square', freq: 700, freqEnd: 1250, len: 0.18, vol: 0.12, limitMs: 200 };
      DATA.audio.sounds.minebeep = { type: 'square', freq: 1400, freqEnd: 1400, len: 0.07, vol: 0.13, limitMs: 120 };
      DATA.audio.sounds.screamring = { type: 'sawtooth', freq: 300, freqEnd: 950, len: 0.8, vol: 0.14, limitMs: 900,
                                       noise: { vol: 0.04, hp: 2000 } };
      DATA.audio.sounds.purgevent = { type: 'sawtooth', freq: 160, freqEnd: 90, len: 0.6, vol: 0.14, limitMs: 700,
                                      noise: { vol: 0.14, hp: 1400 } };
      DATA.audio.sounds.powerdown = { type: 'sawtooth', freq: 420, freqEnd: 36, len: 1.4, vol: 0.2, limitMs: 1600 };
      DATA.audio.sounds.eyeignite = { type: 'triangle', freq: 220, freqEnd: 940, len: 0.5, vol: 0.16, limitMs: 600 };
      DATA.audio.music.lunar = SEA_OF_TRANQUILITY;

      MAPS.addConsoleMap(DATA, { id: 'lunar', name: 'LUNAR STATION',
        sub: 'something is awake in the reactor wing', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof LUNAR_ART !== 'undefined') LUNAR_ART.buildInto(ctx);
    },

    mobVerbs: {
      broodSac: function (scene, m, player, time) { return scene._lunBroodSac(m, player, time); },
      turretSweep: function (scene, m, player, time) { return scene._lunTurret(m, player, time); },
      revenantGrab: function (scene, m, player, time) { return scene._lunRevenant(m, player, time); },
      lunaLeap: function (scene, m, player, time) { return scene._lunLeaper(m, player, time); },
      orbitalMine: function (scene, m, player, time) { return scene._lunMine(m, player, time); },
      horrorCone: function (scene, m, player, time) { return scene._lunHorror(m, player, time); }
    },

    scene: (typeof LUNAR_SCENE !== 'undefined') ? LUNAR_SCENE : {}
  });
})();
