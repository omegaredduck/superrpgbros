// ============================================================================
// game/js/maps/castle/map.js — VAMPIRE CASTLE (realm 7) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-15). Numbers TUNE ME, pitched
// a notch above pyramid (realm 7).
// ============================================================================
(function () {
  'use strict';

  // ---- "THE LAST WALTZ" — 8-bit elegant waltz gone wrong (Red-approved WAV).
  // Port of assets/render/render_castle_theme.js as a section composer:
  // TRUE 3/4 — 150 BPM, 150 bars × 3 beats = 450 beats = EXACTLY 180.0s.
  // Music box → grand C-major waltz → the SLIP (wrong notes + a ghost twin
  // voice) → C-minor waltz → ballroom horror (timpani + organ clusters) →
  // corrupted grand reprise → the box winds down broken.
  var LAST_WALTZ = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var A_ROOT = [48, 43, 45, 41], A_CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]];
    var B_ROOT = [48, 44, 41, 43], B_CH = [[60, 63, 67], [60, 63, 68], [56, 60, 65], [59, 62, 67]];
    var MEL_A = [
      [76, 79, 84], [83, 79, 76], [74, 77, 81], [79, -1, 74],
      [76, 79, 84], [86, 84, 81], [79, 77, 74], [72, -1, -1]
    ];
    var MEL_B = [
      [75, 79, 84], [84, 80, 75], [72, 75, 80], [79, -1, 75],
      [75, 72, 68], [67, 68, 72], [75, 79, 78], [79, -1, -1]
    ];
    function wrongify(m, b, e) { var h = (b * 7 + e * 13) % 17; if (h === 3) return m + 1; if (h === 9) return m - 1; if (h === 13) return m + 6; return m; }
    function sec(b) {
      if (b < 12) return { mode: 'box', mel: 'A' };
      if (b < 44) return { mode: 'waltz', mel: 'A', elegant: true };
      if (b < 60) return { mode: 'waltz', mel: 'A', slip: true };
      if (b < 92) return { mode: 'waltz', mel: 'B', dark: true };
      if (b < 108) return { mode: 'horror', mel: 'B' };
      if (b < 138) return { mode: 'waltz', mel: 'B', dark: true, slip: true, grand: true };
      return { mode: 'box', mel: 'B', dying: true };
    }
    var bass = [], timp = [], pah = [], organ = [], mel = [], ghost = [], harp = [];
    for (var b = 0; b < 150; b++) {
      var s = sec(b), t = b % 4;
      var root = (s.mel === 'A' ? A_ROOT : B_ROOT)[t];
      var chord = (s.mel === 'A' ? A_CH : B_CH)[t];
      var line = (s.mel === 'A' ? MEL_A : MEL_B)[b % 8];
      var heavy = s.mode === 'horror';
      if (s.mode === 'box') {
        // the music box: melody alone on the harp voice (bright triangles)
        bass.push([null, 3]); timp.push([null, 3]); pah.push([null, 3]);
        organ.push([null, 3]); mel.push([null, 3]); ghost.push([null, 3]);
        if (s.dying && b >= 144) {
          // winding down: only the downbeat tine survives (some of them wrong)
          var m0 = line[0] < 0 ? 84 : line[0] + 12;
          if ((b % 5) === 0) m0 += 1;
          harp.push([m2n(m0), 1], [null, 2]);
        } else {
          for (var e0 = 0; e0 < 3; e0++) {
            var mb = line[e0];
            if (mb < 0) { harp.push([null, 1]); continue; }
            if (s.dying && (b + e0) % 5 === 0) mb += 1;      // broken tine
            harp.push([m2n(mb + 12), 1]);
          }
        }
        continue;
      }
      // ---- the waltz engine: OOM (bass) pah pah (chords) ----
      bass.push([m2n(root), 0.85], [null, 2.15]);
      if (s.dark || heavy) timp.push([m2n(31), 0.3], [null, 2.7]);   // timpani thud (G1)
      else timp.push([null, 3]);
      pah.push([null, 1], [m2n(chord[1] + 12), 0.4], [null, 0.6], [m2n(chord[1] + 12), 0.4], [null, 0.6]);
      organ.push(heavy ? [m2n(root + 19), 2.85] : [null, 2.85], [null, 0.15]);
      // melody: 3 quarters (wrongified in the slips)
      var notes = [];
      for (var e = 0; e < 3; e++) {
        var m = line[e];
        if (m < 0) { notes.push(null); continue; }
        if (s.slip) m = wrongify(m, b, e);
        notes.push(m);
      }
      notes.forEach(function (m2) { mel.push(m2 === null ? [null, 1] : [m2n(m2), 1]); });
      // the ghost dancing partner — the same steps a breath behind
      if (s.slip || s.dark) {
        ghost.push([null, 0.1]);
        ghost.push(notes[0] === null ? [null, 0.97] : [m2n(notes[0]), 0.97]);
        ghost.push(notes[1] === null ? [null, 0.97] : [m2n(notes[1]), 0.97]);
        ghost.push(notes[2] === null ? [null, 0.96] : [m2n(notes[2]), 0.96]);
      } else ghost.push([null, 3]);
      // harp arpeggio eighths in the elegant/grand bars (grand = octave sparkle)
      if (s.elegant || s.grand) {
        for (var a2 = 0; a2 < 6; a2++) harp.push([m2n(chord[a2 % 3] + 12 + (a2 >= 3 ? 12 : 0)), 0.5]);
      } else harp.push([null, 3]);
    }
    var TR = [bass, timp, pah, organ, mel, ghost, harp];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 450) > 1e-6) throw new Error('LAST WALTZ track beat mismatch: ' + sum);
    });
    return {
      bpm: 150,
      tracks: [
        { type: 'triangle', vol: 0.12,  notes: bass },    // the OOM
        { type: 'triangle', vol: 0.13,  notes: timp },    // timpani (dark bars)
        { type: 'square',   vol: 0.030, notes: pah },     // pah-pah chord stabs
        { type: 'square',   vol: 0.028, notes: organ },   // horror organ cluster
        { type: 'square',   vol: 0.060, notes: mel },     // the waltz melody
        { type: 'square',   vol: 0.022, notes: ghost },   // the detuned ghost partner
        { type: 'triangle', vol: 0.045, notes: harp }     // music box + harp arps
      ]
    };
  })();

  MAPS.register({
    id: 'castle',

    installData: function (DATA) {
      DATA.biomes.castle = {
        name: 'Vampire Castle', tile: 'caflagstone',
        mobs: ['direRats', 'halberdGuard', 'gargoyle', 'portraitPhantom',
               'bloodMaiden', 'vampInitiate', 'animatedArmor', 'crimsonDuelist']
      };
      DATA.realms.castle = {
        name: 'Vampire Castle', biome: 'castle', boss: 'paleking',
        kind: 'castle', music: 'castle',
        // THE BLOOD MOON COURT knobs (PLAN §4) — ALL TUNE ME
        bloodMoon: {
          beams: { everyMs: 9000, sweepMs: 3000, half: 46, burnDmg: 4, burnTickMs: 500 },
          waltz: { everyMs: 26000, durMs: 3600, beatMs: 400, push: 60 },
          chandeliers: { warnMs: 900, radius: 84, dmg: 20, rehoistMs: 20000 }
        }
      };
      // ---- the 8 mobs (Red picks #3 5 7 9 13 15 18 20) + reassembly minis ----
      DATA.mobs.direRats = { name: 'Dire Rats', texture: 'direRatsHi', hp: 18, spd: 118, xp: 5, cost: 1,
        deathTint: 0x4a4256, chase: { contactDmg: 7 }, mapVerb: 'ratPack' };
      DATA.mobs.halberdGuard = { name: 'Halberd Guard', texture: 'halberdGuardHi', hp: 64, spd: 66, xp: 16, cost: 3,
        deathTint: 0xc8d0dc, chase: { contactDmg: 10 },
        mapVerb: 'halberdThrust', thrust: { everyMs: 4200, warnMs: 650, len: 250, half: 22, dmg: 18, range: 280 },
        unlockAt: 25 };
      DATA.mobs.gargoyle = { name: 'Gargoyle', texture: 'gargoyleHi', hp: 72, spd: 74, xp: 18, cost: 3,
        deathTint: 0x8a84a0, chase: { contactDmg: 10 },
        mapVerb: 'gargoylePerch',
        perchDive: { everyMs: 5200, diveMs: 700, radius: 76, dmg: 18, range: 340, resist: 0.5, chaseMs: 2600 },
        unlockAt: 30 };
      DATA.mobs.portraitPhantom = { name: 'Portrait Phantom', texture: 'portraitPhantomHi', hp: 48, spd: 92, xp: 20, cost: 3,
        deathTint: 0x8f68b0, chase: { contactDmg: 11 },
        mapVerb: 'phantomWall', wallBlink: { everyMs: 6000 }, unlockAt: 40 };
      DATA.mobs.bloodMaiden = { name: 'Blood Maiden', texture: 'bloodMaidenHi', hp: 56, spd: 46, xp: 22, cost: 4,
        deathTint: 0xc22e3e, chase: { contactDmg: 8 },
        // blood-orb lobs onto warned circles → damage pools (fire-circle tech, blood flavor)
        flameCircle: { range: 320, windupMs: 1000, radius: 80, dmg: 16, everyMs: 4400,
                       lingerMs: 1600, tickMs: 340, lingerDmg: 5, tint: 0xc22e3e },
        maxConcurrent: 3, unlockAt: 45 };
      DATA.mobs.vampInitiate = { name: 'Vampire Initiate', texture: 'vampInitiateHi', hp: 52, spd: 52, xp: 24, cost: 4,
        deathTint: 0xd8d8e4, chase: { contactDmg: 6 },
        mapVerb: 'lifesteal', bloodBolt: { everyMs: 2400, range: 380, projSpeed: 280, dmg: 12, lifeMs: 2400, heal: 12 },
        maxConcurrent: 3, unlockAt: 55 };
      DATA.mobs.animatedArmor = { name: 'Animated Armor', texture: 'animatedArmorHi', hp: 190, spd: 40, xp: 30, cost: 4,
        deathTint: 0xc8d0dc, chase: { contactDmg: 16 },
        // falls apart on death → the pieces crawl together → REASSEMBLES once
        split: { key: 'armorPiece', count: 3, ring: 26 }, unlockAt: 65 };
      DATA.mobs.armorPiece = { name: 'Armor Piece', texture: 'armorPieceHi', hp: 22, spd: 62, xp: 4, cost: 1,
        deathTint: 0x8a94a6, chase: { contactDmg: 6 }, mapVerb: 'armorPiece' };
      DATA.mobs.armorReborn = { name: 'Animated Armor', texture: 'animatedArmorHi', hp: 190, spd: 46, xp: 20, cost: 4,
        deathTint: 0xc8d0dc, chase: { contactDmg: 16 } };            // reborn at 40% — no second split
      DATA.mobs.crimsonDuelist = { name: 'Crimson Duelist', texture: 'crimsonDuelistHi', hp: 78, spd: 82, xp: 34, cost: 5,
        deathTint: 0xc22e3e,
        // strafing elite — the verb owns ALL movement (orbit + rapier lunges)
        mapVerb: 'duelist', rapier: { everyMs: 4200, warnMs: 600, dashMs: 300, len: 260, half: 16,
                                      dmg: 20, range: 300, orbit: 190 },
        maxConcurrent: 2, unlockAt: 80 };

      // ---- THE PALE KING — UNHORSED BY NO MAN (mounted jouster; mapOwned,
      // lanes/rings/zones ONLY — zero projectiles) ----
      DATA.bosses.paleking = {
        name: 'The Pale King', texture: 'palekingHi',
        hp: 2500, spd: 55, xp: 380, contactDmg: 24, deathTint: 0x9fb8e8,
        lootTable: 'paleking',
        mapOwned: true, entranceMs: 2600,
        patterns: {
          lancePass:      { everyMs: 6800, len: 900, half: 46, warnMs: 1300, dashMs: 620, dmg: 26 },
          carousel:       { everyMs: 13000, radius: 330, band: 64, warnMs: 1400, gallopMs: 2400, dmg: 24 },
          tiltCourt:      { everyMs: 18000, warnMs: 1300, dashMs: 620, half: 46, wallLingerMs: 1500 },
          waltzTrample:   { everyMs: 9000, warnMs: 1200, beatMs: 400, radius: 66, dmg: 18, scatter: 170 },
          pennonSweep:    { everyMs: 6200, warnMs: 800, range: 280, halfRad: 0.6, dmg: 22 },
          bloodMoonJoust: { everyMs: 17000, firstDelayMs: 11000, sweepMs: 2600, half: 40, dmg: 30,
                            ventMs: 3500, ventDmgMult: 1.5 },
          ratAdds:        { everyMs: 12000, count: 3, cap: 6 },
          overclock:      { hpPct: 0.3, spdMult: 1.25, rateMult: 0.8 }
        },
        title: 'UNHORSED BY NO MAN',
        hints: [
          'HE NEVER DISMOUNTS — every kill move is a LANE, a RING or a CIRCLE painted first. Trust the paint.',
          'LANCE PASS — a full-length lane flashes, then he thunders down it. Step OFF the lane (later he runs TWO).',
          'CAROUSEL — the ring lights the lists. Stand INSIDE or OUTSIDE the band, never on it.',
          'TILT OF THE COURT — spectral barriers split the yard; YOUR lane flashes. Slip through the gaps.',
          'WALTZ TRAMPLE — hoof-stomp circles land in 1-2-3 triplets. Keep stepping on the off-beat.',
          'BLOOD MOON JOUST — the moonbeam sweeps once like a clock hand; after it passes the horse REARS — unload.'
        ]
      };
      DATA.dropTables.paleking = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.gallop = { type: 'triangle', arp: [90, 120, 90, 140], len: 0.5, vol: 0.18, limitMs: 550,
                                   noise: { vol: 0.04, hp: 900 } };
      DATA.audio.sounds.lancecrack = { type: 'square', freq: 700, freqEnd: 180, len: 0.14, vol: 0.2, limitMs: 200,
                                       noise: { vol: 0.08, hp: 1800 } };
      DATA.audio.sounds.gatesmash = { type: 'sawtooth', freq: 160, freqEnd: 40, len: 0.6, vol: 0.3, limitMs: 800,
                                      noise: { vol: 0.16, hp: 700 } };
      DATA.audio.sounds.chandeliercrash = { type: 'square', arp: [1800, 1200, 700, 300], len: 0.5, vol: 0.2, limitMs: 600,
                                            noise: { vol: 0.12, hp: 2400 } };
      DATA.audio.sounds.beamhum = { type: 'sawtooth', freq: 110, freqEnd: 190, len: 1.0, vol: 0.11, limitMs: 1200 };
      DATA.audio.sounds.waltzswell = { type: 'triangle', arp: [523, 659, 784], len: 0.6, vol: 0.16, limitMs: 700 };
      DATA.audio.sounds.mirrorchime = { type: 'triangle', freq: 1560, freqEnd: 1240, len: 0.35, vol: 0.12, limitMs: 250 };
      DATA.audio.sounds.armorclatter = { type: 'square', arp: [220, 180, 260, 150], len: 0.4, vol: 0.16, limitMs: 500,
                                         noise: { vol: 0.08, hp: 1400 } };
      DATA.audio.sounds.khinch = { type: 'sawtooth', freq: 70, freqEnd: 130, len: 0.9, vol: 0.13, limitMs: 1100 };
      DATA.audio.music.castle = LAST_WALTZ;

      MAPS.addConsoleMap(DATA, { id: 'castle', name: 'VAMPIRE CASTLE',
        sub: 'the Pale King holds the lists', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof CASTLE_ART !== 'undefined') CASTLE_ART.buildInto(ctx);
    },

    mobVerbs: {
      gargoylePerch: function (scene, m, p, t) { return scene._casGargoyle(m, p, t); },
      halberdThrust: function (scene, m, p, t) { return scene._casHalberd(m, p, t); },
      phantomWall: function (scene, m, p, t) { return scene._casPhantom(m, p, t); },
      lifesteal: function (scene, m, p, t) { return scene._casLeech(m, p, t); },
      ratPack: function (scene, m, p, t) { return scene._casRatPack(m, p, t); },
      armorPiece: function (scene, m, p, t) { return scene._casArmorPiece(m, p, t); },
      duelist: function (scene, m, p, t) { return scene._casDuelist(m, p, t); }
    },

    scene: (typeof CASTLE_SCENE !== 'undefined') ? CASTLE_SCENE : {}
  });
})();
