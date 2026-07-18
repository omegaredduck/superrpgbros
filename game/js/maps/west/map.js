// ============================================================================
// game/js/maps/west/map.js — WILD WEST TOWN (realm 13) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-16). Spaghetti-western
// frontier town at high noon: sun-bleached wood, packed dirt, gunmetal.
// Signature: HIGH NOON — EVERYBODY DRAWS (armed mobs freeze + telegraph one
// shot lane each → all fire on the last toll → dodged lanes fire BACK, env-
// credited → wind re-rolls). NOON EXPRESS rail hazard (yard-train tech).
// Boss: THE OUTLAW SHERIFF (2 phases). Toroidal wrap ON. Numbers TUNE ME.
// ============================================================================
(function () {
  'use strict';

  // ---- "HIGH NOON HOEDOWN" — 8-bit bluegrass (TAKE 1, RED-APPROVED "its
  // good"). Port of assets/render/render_west_theme.js as a section composer:
  // 140 BPM G-major hoedown (G G C G / G G D G), 105 bars × 4 = 420 beats =
  // EXACTLY 180.0s. Chiptune BANJO forward rolls around the high-G drone
  // (midi 79) + boom-chick tri bass + mandolin CHOP on 2&4, TUNE A → TUNE B
  // w/ train brushes → CRAZY BANJO BREAKDOWN (16th/chromatic runs) → stop-
  // time → 24-bar GUITAR SOLO → reprise + harmony → KEY-UP (+2) finale w/
  // crazy rolls → shave-and-a-haircut TAG + final G ring-out.
  var HIGH_NOON_HOEDOWN = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var PROG = ['G', 'G', 'C', 'G', 'G', 'G', 'D', 'G'];
    var CHORD = { G: [55, 59, 62], C: [55, 60, 64], D: [57, 62, 66] };
    var ROOT = { G: 43, C: 48, D: 50 }, FIFTH = { G: 50, C: 43, D: 45 };
    var DRONE = 79;
    function rollPattern(ch, alt) {
      var c = CHORD[ch];
      return alt ? [c[1] + 12, DRONE, c[2] + 12, c[1] + 12, DRONE, c[0] + 12, c[2] + 12, DRONE]
                 : [c[0] + 12, c[1] + 12, DRONE, c[0] + 12, c[2] + 12, DRONE, c[1] + 12, DRONE];
    }
    var TUNE_A = [
      [79, 78, 79, 76, 74, 72, 71, 69], [67, 69, 71, 72, 74, 76, 74, 71],
      [72, 74, 72, 71, 69, 67, 69, 71], [67, -1, 67, 74, 71, -1, 67, -1],
      [79, 78, 79, 76, 74, 72, 71, 69], [67, 69, 71, 72, 74, 76, 79, 76],
      [74, 76, 74, 72, 71, 72, 69, 71], [67, -1, 62, 64, 67, -1, -1, -1]
    ];
    var TUNE_B = [
      [83, -1, 81, 79, 81, 79, 76, 74], [79, 76, 74, 71, 74, -1, 79, -1],
      [84, -1, 84, 83, 81, 79, 81, 83], [79, -1, 74, 76, 79, -1, -1, -1],
      [83, -1, 81, 79, 81, 79, 76, 74], [79, 76, 74, 71, 67, 69, 71, 74],
      [76, 74, 72, 71, 69, 71, 67, 66], [67, -1, 67, -1, 67, -1, -1, -1]
    ];
    function crazyRun(ch, v) {
      var c = CHORD[ch];
      var runs = [
        [c[0] + 12, c[1] + 12, DRONE, c[2] + 12, c[1] + 12, DRONE, c[0] + 12, DRONE, c[2] + 12, DRONE, c[1] + 12, c[0] + 12, DRONE, c[1] + 12, c[2] + 12, DRONE],
        [67, 68, 69, 70, 71, DRONE, 74, DRONE, 76, DRONE, 74, 71, 69, DRONE, 67, DRONE],
        [79, DRONE, 78, DRONE, 76, DRONE, 74, DRONE, 72, 71, 69, 67, 66, 67, 69, 71],
        [c[0] + 12, c[2] + 12, c[1] + 12, DRONE, c[2] + 12, c[0] + 12, DRONE, c[1] + 12, DRONE, c[2] + 12, c[0] + 12, DRONE, c[1] + 12, c[2] + 12, DRONE, DRONE]
      ];
      return runs[((v % 4) + 4) % 4];
    }
    var SOLO = [
      [67, 69, 71, 74, 76, 74, 71, 69, 67, 69, 71, 74, 76, 79, 76, 74],
      [71, -1, -1, 74, -1, -1, 74, 76, 79, 76, 74, 71, 74, 71, 69, 71],
      [74, 76, 79, 76, 74, 71, 69, 71, 74, 76, 79, 81, 79, 76, 74, 76],
      [79, -1, -1, 76, -1, 74, -1, -1, 74, -1, 76, -1, -1, 79, -1, -1],
      [67, -1, 67, 66, 67, 69, 71, 72, 74, 72, 71, 69, 71, -1, 74, -1],
      [76, -1, -1, -1, 79, -1, -1, -1, 81, 79, 76, 74, 76, 79, 81, -1],
      [79, 81, 79, 76, 74, 76, 79, 81, 84, 81, 79, 76, 79, 76, 74, 71],
      [74, 74, -1, 74, 74, -1, 74, 76, 79, -1, 76, -1, 74, 71, 69, 67],
      [81, -1, -1, 83, -1, -1, 83, 81, 79, 76, 74, 76, 79, -1, -1, -1],
      [67, 71, 74, 79, 74, 71, 67, 62, 67, 71, 74, 79, 81, 79, 76, 74],
      [72, -1, 74, -1, 76, -1, 79, -1, 76, 74, 72, 71, 72, 74, 76, -1],
      [74, -1, 76, -1, 79, -1, -1, -1, 81, 79, 76, 74, 76, 74, 71, -1]
    ];
    function sec(b) {
      if (b < 4) return { intro: true, rhythm: b >= 2 };
      if (b < 20) return { rhythm: true, banjo: true, tune: 'A' };
      if (b < 36) return { rhythm: true, banjo: true, tune: 'B', train: true };
      if (b < 52) return { rhythm: true, crazy: true };
      if (b < 56) return { stoptime: true };
      if (b < 80) return { rhythm: true, solo: b - 56, backup: true };
      if (b < 88) return { rhythm: true, banjo: true, tune: 'A', harm: true };
      if (b < 100) return { rhythm: true, banjo: true, tune: 'A', harm: true, up: 2, crazyToo: true };
      return { tag: b - 100 };
    }
    var banjo = [], bass = [], chop = [], lead = [], flavor = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), ch = PROG[b % 8], chord = CHORD[ch], up = s.up || 0, e;
      // BANJO — always 16 sixteenths (0.25 ea = 4 beats)
      if (s.crazy) { var run = crazyRun(ch, b); for (e = 0; e < 16; e++) banjo.push([run[e] < 0 ? null : m2n(run[e]), 0.25]); }
      else if (s.banjo) { var pat = rollPattern(ch, b % 2 === 1); for (e = 0; e < 16; e++) banjo.push([m2n(pat[e % 8] + up), 0.25]); }
      else if (s.backup) { var pat2 = rollPattern(ch, true); for (e = 0; e < 16; e++) banjo.push([e % 2 === 0 ? m2n(pat2[(e / 2 | 0) % 8]) : null, 0.25]); }
      else if (s.crazyToo) { var run2 = crazyRun(ch, b); for (e = 0; e < 16; e++) banjo.push([run2[e] < 0 ? null : m2n(run2[e] + up), 0.25]); }
      else if (s.stoptime) { var st = [67, 71, 74, 79, 74, 71, 67, -1]; for (e = 0; e < 8; e++) banjo.push([st[e] < 0 ? null : m2n(st[e]), 0.5]); }
      else if (s.tag != null) { var tags = [[81, 78, 76, 74, 71, 69, 71, 74], [76, 74, 71, 69, 67, 69, 71, 67], [69, 66, 69, 71, 69, -1, -1, -1], [74, 81, -1, -1, -1, -1, -1, -1], [67, 71, 74, 79, -1, -1, -1, -1]]; var tg = tags[s.tag]; for (e = 0; e < 8; e++) banjo.push([tg[e] < 0 ? null : m2n(tg[e] + 2), 0.5]); }
      else banjo.push([null, 4]);
      // BASS — boom-chick (root beat1, fifth beat3)
      if (s.rhythm && !s.stoptime) bass.push([m2n(ROOT[ch] + up), 1], [null, 1], [m2n(FIFTH[ch] + up), 1], [null, 1]);
      else if (s.stoptime || (s.tag != null)) bass.push([m2n(ROOT[ch] + 2), 1], [null, 3]);
      else bass.push([null, 4]);
      // CHOP — mandolin on 2 & 4
      if (s.rhythm && !s.stoptime) chop.push([null, 1], [m2n(chord[1] + 12 + up), 0.5], [null, 0.5], [null, 1], [m2n(chord[2] + 12 + up), 0.5], [null, 0.5]);
      else chop.push([null, 4]);
      // LEAD — tune / solo melody
      if (s.solo != null) { var sl = SOLO[s.solo % 12]; for (e = 0; e < 16; e++) lead.push([sl[e] < 0 ? null : m2n(sl[e]), 0.25]); }
      else if (s.tune === 'A') { var la = TUNE_A[b % 8]; for (e = 0; e < 8; e++) lead.push([la[e] < 0 ? null : m2n(la[e] + up), 0.5]); }
      else if (s.tune === 'B') { var lb = TUNE_B[b % 8]; for (e = 0; e < 8; e++) lead.push([lb[e] < 0 ? null : m2n(lb[e]), 0.5]); }
      else lead.push([null, 4]);
      // FLAVOR — train brushes/whistle + low harmony
      if (s.train && b % 8 === 6) flavor.push([null, 2], [m2n(67), 1], [m2n(74), 1]);
      else if (s.harm && s.tune === 'A') { var la2 = TUNE_A[b % 8]; flavor.push([la2[0] < 0 ? null : m2n(la2[0] + up - 12), 2], [null, 2]); }
      else if (s.tag === 4) flavor.push([m2n(55), 2], [m2n(59), 1], [m2n(62), 1]);
      else flavor.push([null, 4]);
    }
    [banjo, bass, chop, lead, flavor].forEach(function (n, i) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 420) > 1e-6) throw new Error('HIGH NOON HOEDOWN track ' + i + ' beat mismatch: ' + sum);
    });
    return {
      bpm: 140,
      tracks: [
        { type: 'square',   vol: 0.05,  notes: banjo },   // banjo forward rolls + drone
        { type: 'triangle', vol: 0.10,  notes: bass },    // boom-chick bass
        { type: 'square',   vol: 0.028, notes: chop },    // mandolin chop on 2&4
        { type: 'square',   vol: 0.06,  notes: lead },    // fiddle-lead / guitar solo
        { type: 'triangle', vol: 0.04,  notes: flavor }   // train brushes + low harmony
      ]
    };
  })();

  MAPS.register({
    id: 'west',

    installData: function (DATA) {
      DATA.biomes.west = {
        name: 'Wild West Town', tile: 'wtsand',
        mobs: ['gangRustler', 'sixGunBandit', 'dynamiteDan', 'rattlesnake',
               'vulture', 'tumbleweed', 'scorpion', 'dustDevil']
      };
      DATA.realms.west = {
        name: 'Wild West Town', biome: 'west', boss: 'outlawSheriff',
        kind: 'west', music: 'west',
        // HIGH NOON: EVERYBODY DRAWS (PLAN §2) — ALL TUNE ME
        noon: { cycleMs: 35000, firstDelayMs: 14000, warnMs: 1500, tollGapMs: 700,
                tollCount: 3, laneCap: 8, laneHalf: 24, laneLen: 900, laneDmg: 22,
                returnDmg: 999, windShift: true },
        // NOON EXPRESS rail hazard (PLAN §3; yard-train tech) — offset from noon
        train: { cycleMs: 26000, firstDelayMs: 21000, warnMs: 2000, passMs: 2000,
                 speed: 940, railHalf: 22, cars: 5 }
      };

      // ---- the EIGHT mobs (Red picks #1 2 3 4 5 6 18 16) ----
      DATA.mobs.gangRustler = { name: 'Gang Rustler', texture: 'gangRustlerHi', hp: 24, spd: 122, xp: 8, cost: 1,
        deathTint: 0x7a4e2e, chase: { contactDmg: 8 },
        mapVerb: 'rustlerLunge',                              // knife-glint → short lunge
        // M7k AUDIT fix: def key renamed lunge → rustlerCharge; `lunge` collided
        // with core's ghoul-lunge verb (it armed its own lunge state on this mob).
        rustlerCharge: { range: 220, warnMs: 400, dashMs: 240, dashSpeed: 430, dmg: 9, cooldownMs: 2600 },
        maxConcurrent: 6, unlockAt: 0 };
      DATA.mobs.sixGunBandit = { name: 'Six-Gun Bandit', texture: 'sixGunBanditHi', hp: 40, spd: 78, xp: 14, cost: 2,
        deathTint: 0x2e4058,
        mapVerb: 'banditAim',                                 // thin aim-line → crack shot; strafes
        aim: { range: 380, warnMs: 600, dmg: 12, projSpeed: 300, cooldownMs: 2100, strafeSpeed: 90 },
        unlockAt: 12 };
      DATA.mobs.dynamiteDan = { name: 'Dynamite Dan', texture: 'dynamiteDanHi', hp: 55, spd: 60, xp: 18, cost: 2,
        deathTint: 0xa83028,
        mapVerb: 'danTNT',                                    // TNT lob → warned blast circle
        tnt: { range: 420, keepDist: 260, warnMs: 1200, radius: 74, dmg: 20, cooldownMs: 3400 },
        unlockAt: 22 };
      DATA.mobs.rattlesnake = { name: 'Rattlesnake', texture: 'rattlesnakeHi', hp: 34, spd: 66, xp: 14, cost: 2,
        deathTint: 0xb08e5a, chase: { contactDmg: 8 },
        mapVerb: 'snakeStrike',                               // rattle + shake → cone strike + venom slow
        strike: { range: 150, warnMs: 800, halfRad: 0.6, reach: 150, dmg: 14, venomMs: 1400, venomMult: 0.6, cooldownMs: 3200 },
        unlockAt: 18 };
      DATA.mobs.vulture = { name: 'Vulture', texture: 'vultureHi', hp: 30, spd: 108, xp: 14, cost: 2,
        deathTint: 0x4a3e34, float: true,
        mapVerb: 'vultureDive',                               // circles; shadow marks dive line → swoop
        dive: { orbitR: 180, orbitSpeed: 2.2, warnMs: 700, diveSpeed: 460, diveMs: 420, dmg: 12, cooldownMs: 3600 },
        unlockAt: 26 };
      DATA.mobs.tumbleweed = { name: 'Tumbleweed', texture: 'tumbleweedHi', hp: 16, spd: 130, xp: 6, cost: 1,
        deathTint: 0xa8865a, noonSkip: true, chase: { contactDmg: 6 },
        mapVerb: 'tumbleRoll',                                // rolls with the wind (re-rolled each noon)
        roll: { speed: 150 },
        unlockAt: 6 };
      DATA.mobs.scorpion = { name: 'Scorpion', texture: 'scorpionHi', hp: 30, spd: 74, xp: 14, cost: 2,
        deathTint: 0xc8863a,
        mapVerb: 'scorpionBurrow',                            // dust mound crawls → warned sting where it pops
        burrow: { crawlSpeed: 110, surfaceMs: 2200, stingRange: 70, stingWarnMs: 900, dmg: 16, venomMs: 1200, venomMult: 0.65, cooldownMs: 3800 },
        unlockAt: 30 };
      DATA.mobs.dustDevil = { name: 'Dust Devil', texture: 'dustDevilHi', hp: 46, spd: 52, xp: 16, cost: 2,
        deathTint: 0xc8a878, noonSkip: true,                  // zoner — NO chase (pushes, never touches for dmg)
        mapVerb: 'devilWhirl',                                // wanders; pushes player + deflects player shots; slow patches
        whirl: { wanderSpeed: 60, pushR: 110, push: 150, deflectR: 90, patchEveryMs: 1400, patchR: 60, patchMs: 2600, patchMult: 0.6, wanderMs: 2200 },
        maxConcurrent: 2, unlockAt: 34 };

      // ---- THE OUTLAW SHERIFF (mapOwned night-rider) ----
      DATA.bosses.outlawSheriff = {
        name: 'The Outlaw Sheriff', texture: 'westSheriffHi',
        hp: 4000, spd: 34, xp: 560, contactDmg: 20, deathTint: 0xd8d0bc,
        lootTable: 'outlawSheriff',
        mapOwned: true, entranceMs: 3200,
        patterns: {
          verbEveryMs: 5200,
          fanHammer:      { warnMs: 900, halfRad: 0.5, range: 360, shots: 5, dmg: 16, projSpeed: 270, spreadDeg: 70 },
          ricochet:       { warnMs: 1000, lanes: 2, half: 22, len: 520, dmg: 18 },
          dynamiteDeputy: { count: 3, warnMs: 1200, radius: 74, gapMs: 260, dmg: 20, stride: 130 },
          slideMs: 420, slideSpeed: 360,
          highNoon:       { tollCount: 3, tollGapMs: 600, trackMs: 1200, lockMs: 500, half: 26, len: 760, dmg: 44,
                            ventMs: 3200, ventDmgMult: 1.5 },
          posse:          { rustlers: 3 },
          thirteen:       { laneCount: 5, warnMs: 1700, tollGapMs: 260, half: 26, len: 760, dmg: 34,
                            ventMs: 4400, ventDmgMult: 1.5 },
          phase2Pct: 0.5,           // WHITE HAT burns off, red glare doubles
          sigEveryMs: 22000, sigFirstMs: 15000
        },
        title: 'THE OUTLAW SHERIFF',
        hints: [
          'FAN THE HAMMER paints a cone before the five-shot spread — duck it SIDEWAYS, not back.',
          'RICOCHET lanes BEND off the building walls — read the whole bent path, watch the seam.',
          'DYNAMITE DEPUTY kicks three fuses down the street — run PAST them, not away.',
          'When the bell tolls, YOUR feet are the target — the kill-shot lane locks on the LAST chime, so move then.',
          "P2: the WHITE HAT burns off and he calls the posse — after the volley he reloads, so unload everything.",
          'CLOCK STRIKES 13: the whole duel ground crisscrosses with lanes — weave the gaps, it is his longest reload.'
        ]
      };
      DATA.dropTables.outlawSheriff = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.noonbell    = { type: 'triangle', freq: 660, freqEnd: 640, len: 0.7, vol: 0.16, limitMs: 800 };
      DATA.audio.sounds.freezesting = { type: 'sawtooth', freq: 1400, freqEnd: 200, len: 0.5, vol: 0.09, limitMs: 600, noise: { vol: 0.05, hp: 1800 } };
      DATA.audio.sounds.lanefire    = { type: 'square', freq: 900, freqEnd: 260, len: 0.18, vol: 0.14, limitMs: 220, noise: { vol: 0.09, hp: 1600 } };
      DATA.audio.sounds.returnfire  = { type: 'square', freq: 1200, freqEnd: 400, len: 0.16, vol: 0.12, limitMs: 200, noise: { vol: 0.07, hp: 2000 } };
      DATA.audio.sounds.trainwhistle= { type: 'square', freq: 520, freqEnd: 500, len: 0.9, vol: 0.13, limitMs: 1000 };
      DATA.audio.sounds.trainrumble = { type: 'sawtooth', freq: 70, freqEnd: 110, len: 0.9, vol: 0.15, limitMs: 1000, noise: { vol: 0.11, hp: 300 } };
      DATA.audio.sounds.tntfuse     = { type: 'sawtooth', freq: 2400, freqEnd: 1800, len: 0.5, vol: 0.06, limitMs: 600, noise: { vol: 0.05, hp: 2600 } };
      DATA.audio.sounds.tntboom     = { type: 'sawtooth', freq: 120, freqEnd: 40, len: 0.5, vol: 0.16, limitMs: 550, noise: { vol: 0.11, hp: 400 } };
      DATA.audio.sounds.snakerattle = { type: 'square', freq: 1800, freqEnd: 1600, len: 0.4, vol: 0.06, limitMs: 500, noise: { vol: 0.08, hp: 3200 } };
      DATA.audio.sounds.vulturescreech = { type: 'sawtooth', freq: 1600, freqEnd: 900, len: 0.3, vol: 0.08, limitMs: 350 };
      DATA.audio.sounds.scorpionscrape = { type: 'sawtooth', freq: 300, freqEnd: 500, len: 0.35, vol: 0.07, limitMs: 400, noise: { vol: 0.06, hp: 900 } };
      DATA.audio.sounds.devilwhoosh = { type: 'sawtooth', freq: 600, freqEnd: 300, len: 0.5, vol: 0.07, limitMs: 600, noise: { vol: 0.07, hp: 1400 } };
      DATA.audio.sounds.tumblepop   = { type: 'square', freq: 700, freqEnd: 200, len: 0.2, vol: 0.11, limitMs: 250, noise: { vol: 0.06, hp: 1200 } };
      DATA.audio.sounds.fanhammer   = { type: 'square', freq: 1000, freqEnd: 300, len: 0.3, vol: 0.13, limitMs: 350, noise: { vol: 0.08, hp: 1600 } };
      DATA.audio.sounds.ricochettwang = { type: 'triangle', freq: 1400, freqEnd: 2200, len: 0.2, vol: 0.12, limitMs: 250 };
      DATA.audio.sounds.duelchime   = { type: 'triangle', freq: 990, freqEnd: 980, len: 0.3, vol: 0.14, limitMs: 350 };
      DATA.audio.sounds.lockshot    = { type: 'square', freq: 600, freqEnd: 120, len: 0.35, vol: 0.16, limitMs: 400, noise: { vol: 0.12, hp: 700 } };
      DATA.audio.sounds.hatburn     = { type: 'sawtooth', freq: 900, freqEnd: 200, len: 0.6, vol: 0.13, limitMs: 700, noise: { vol: 0.1, hp: 1000 } };
      DATA.audio.sounds.possewhistle= { type: 'square', freq: 1200, freqEnd: 1800, len: 0.4, vol: 0.12, limitMs: 450 };
      DATA.audio.sounds.horsewhinny = { type: 'sawtooth', freq: 500, freqEnd: 800, len: 0.5, vol: 0.12, limitMs: 600 };
      DATA.audio.sounds.doorsblast  = { type: 'sawtooth', freq: 180, freqEnd: 60, len: 0.5, vol: 0.17, limitMs: 550, noise: { vol: 0.13, hp: 500 } };
      DATA.audio.music.west = HIGH_NOON_HOEDOWN;

      MAPS.addConsoleMap(DATA, { id: 'west', name: 'WILD WEST TOWN',
        sub: 'the clock only strikes noon', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof WEST_ART !== 'undefined') WEST_ART.buildInto(ctx);
    },

    mobVerbs: {
      rustlerLunge:   function (scene, m, player, time) { return scene._wRustler(m, player, time); },
      banditAim:      function (scene, m, player, time) { return scene._wBandit(m, player, time); },
      danTNT:         function (scene, m, player, time) { return scene._wDan(m, player, time); },
      snakeStrike:    function (scene, m, player, time) { return scene._wSnake(m, player, time); },
      vultureDive:    function (scene, m, player, time) { return scene._wVulture(m, player, time); },
      tumbleRoll:     function (scene, m, player, time) { return scene._wTumble(m, player, time); },
      scorpionBurrow: function (scene, m, player, time) { return scene._wScorpion(m, player, time); },
      devilWhirl:     function (scene, m, player, time) { return scene._wDevil(m, player, time); }
    },

    scene: (typeof WEST_SCENE !== 'undefined') ? WEST_SCENE : {}
  });
})();
