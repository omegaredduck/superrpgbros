// ============================================================================
// game/js/maps/viceversa/map.js — VICE VERSA (realm 18) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-16). SPLIT map: HELL west /
// HOLY east, RIVER OF SOULS between, ONE bridge. FACTION WARFARE (hell + holy
// mobs damage each other; mob-vs-mob kills give the player NOTHING — farm
// guard). WRAP-LEASH: crossing the E-W wrap seam DROPS pursuers; the bridge
// preserves chases. DOUBLE BOSS: SATAN (hell arena) + SUPREME BEING (holy
// arena), each hard-leashed; beat one → PORTAL opens; beat both → clear.
// Numbers TUNE ME.
// ============================================================================
(function () {
  'use strict';

  // ---- "ETERNAL WAR.EXE" — EPIC/BUILDING/INTENSE 8-bit (RED-APPROVED "thats
  // great"). Port of render_eternal_theme.js as a section composer: 152 BPM,
  // E minor (Em-C-G-D), 114 bars × 4 = 456 beats = EXACTLY 180.0s. NO slow
  // intro — war drums + dark hook from bar 0, then it BUILDS: A war hook →
  // B + tri counter → C octave lift → D THE BUILD (choir drone, toms, rising
  // line steps up each pass, marching rolls) → E key-lift climax (+2) →
  // F THE WAR (gallop bass; HOLY CALL answered by HELL ANSWER) → G finale.
  var ETERNAL_WAR = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var BARS = 114;
    var ROOTS = [40, 36, 43, 38];                                   // Em C G D
    var CHORDS = [[52, 55, 59], [48, 52, 55], [50, 55, 59], [50, 54, 57]];
    var ARPN = [[52, 55, 59, 64], [48, 52, 55, 60], [55, 59, 62, 67], [50, 54, 57, 62]];
    // hook / counter / rising line / holy call / hell answer — 4-beat cells
    var HOOK = [[64, 1], [67, 0.5], [71, 0.5], [69, 1], [64, 1]];
    var COUNTER = [[76, 2], [79, 1], [78, 1]];
    var RISE = [[52, 1], [55, 1], [59, 1], [62, 1]];
    var HOLY_CALL = [[76, 0.5], [79, 0.5], [83, 1], [81, 1], [79, 1]];
    var HELL_ANSWER = [[52, 0.5], [50, 0.5], [47, 1], [48, 1], [40, 1]];

    function sec(bar) {
      return bar < 16 ? 'A' : bar < 32 ? 'B' : bar < 48 ? 'C' : bar < 64 ? 'D'
           : bar < 80 ? 'E' : bar < 98 ? 'F' : 'G';
    }
    function inten(s) { return s === 'A' ? 0 : s === 'B' ? 1 : s === 'C' ? 2 : s === 'D' ? 2 : s === 'E' ? 3 : s === 'F' ? 4 : 5; }

    var KK = m2n(28), SN = m2n(40), HH = m2n(90);
    var kick = [], snare = [], hats = [], bass = [], pad1 = [], pad2 = [],
        arp = [], leadA = [], leadB = [], toms = [], sub = [];
    function seq(track, cell, tr, oct) {
      var used = 0;
      cell.forEach(function (nd) { track.push([m2n(nd[0] + (tr || 0) + (oct || 0)), nd[1] * 0.95], [null, nd[1] * 0.05]); used += nd[1]; });
      if (used < 4) track.push([null, 4 - used]);
    }

    for (var b = 0; b < BARS; b++) {
      var s = sec(b), ci = b % 4, I = inten(s), last = b === BARS - 1;
      var TR = s === 'E' || s === 'G' ? 2 : 0;                       // key lift in climax + finale
      var root = ROOTS[ci] + TR, chord = CHORDS[ci].map(function (m) { return m + TR; }),
          arpc = ARPN[ci].map(function (m) { return m + TR; });
      // ---- kick: four-on-the-floor (extra 8ths in the war) ----
      if (last) { kick.push([KK, 0.12], [null, 3.88]); }
      else for (var k = 0; k < 4; k++) {
        kick.push([KK, 0.12], [null, 0.88]);
        if (I >= 4 && (k === 1 || k === 3)) { kick[kick.length - 1] = [null, 0.38]; kick.push([KK, 0.12], [null, 0.38]); }
      }
      // ---- snare: 2 + 4 ----
      snare.push([null, 1], [SN, 0.1], [null, 0.9], [null, 1], [SN, 0.1], [null, 0.9]);
      // ---- hats: offbeat 8ths (denser as it builds) ----
      var hn = I >= 2 ? 8 : 4, hd = 4 / hn;
      for (var h = 0; h < hn; h++) hats.push([null, hd * 0.5], [HH, hd * 0.2], [null, hd * 0.3]);
      // ---- bass: 8ths, gallop 16ths in the war ----
      if (last) { bass.push([m2n(root - 12), 3.6], [null, 0.4]); }
      else if (I >= 4) { for (var e = 0; e < 16; e++) bass.push([m2n(root - 12 + (e % 8 === 6 ? 12 : 0)), 0.2], [null, 0.05]); }
      else { var pat = [0, 0, 12, 0, 0, 12, 0, 12]; for (var e2 = 0; e2 < 8; e2++) bass.push([m2n(root - 12 + pat[e2]), 0.42], [null, 0.08]); }
      // ---- choir pads: two voices held ----
      pad1.push([m2n(chord[0]), last ? 3.4 : 3.9], [null, last ? 0.6 : 0.1]);
      pad2.push([m2n(chord[2]), last ? 3.4 : 3.9], [null, last ? 0.6 : 0.1]);
      // ---- arp: 16ths from B on (skip A + D-drone) ----
      if (!last && s !== 'A' && s !== 'D') { var an = [0, 1, 2, 3, 2, 1]; for (var a = 0; a < 16; a++) arp.push([m2n(arpc[an[a % 6] % 4] + 12), 0.22], [null, 0.03]); }
      else arp.push([null, 4]);
      // ---- toms: war toms in A/B/D/G ----
      if (!last && (s === 'A' || s === 'B' || s === 'D' || s === 'G')) { toms.push([null, 0.5], [m2n(29), 0.1], [null, 1.4], [m2n(31), 0.1], [null, 1.9]); }
      else toms.push([null, 4]);
      // ---- sub: low root drone in the heavy sections ----
      sub.push([(I >= 3 || s === 'D') ? m2n(root - 24) : null, last ? 3.4 : 3.9], [null, last ? 0.6 : 0.1]);
      // ---- leads: per-section ----
      if (last) { leadA.push([m2n(64), 3.4], [null, 0.6]); leadB.push([m2n(52), 3.4], [null, 0.6]); }
      else if (s === 'A') { seq(leadA, HOOK, 0); leadB.push([null, 4]); }
      else if (s === 'B') { seq(leadA, HOOK, 0); seq(leadB, COUNTER, 0); }
      else if (s === 'C') { seq(leadA, HOOK, 12); leadB.push([null, 4]); }
      else if (s === 'D') { seq(leadA, RISE, ((b - 48) >> 2) * 2); seq(leadB, RISE, ((b - 48) >> 2) * 2 + 12); }
      else if (s === 'E') { seq(leadA, HOOK, 2); seq(leadB, COUNTER, 2); }
      else if (s === 'F') { seq(leadA, HOLY_CALL, 0); seq(leadB, HELL_ANSWER, 0); }
      else { seq(leadA, HOOK, 12); seq(leadB, COUNTER, 0); }
    }

    var TR2 = [kick, snare, hats, bass, pad1, pad2, arp, leadA, leadB, toms, sub];
    TR2.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 456) > 1e-6) throw new Error('ETERNAL WAR track beat mismatch: ' + sum);
    });
    return {
      bpm: 152,
      tracks: [
        { type: 'triangle', vol: 0.18,  notes: kick },
        { type: 'square',   vol: 0.05,  notes: snare },
        { type: 'square',   vol: 0.012, notes: hats },
        { type: 'square',   vol: 0.10,  notes: bass },
        { type: 'square',   vol: 0.05,  notes: pad1 },
        { type: 'square',   vol: 0.04,  notes: pad2 },
        { type: 'square',   vol: 0.03,  notes: arp },
        { type: 'square',   vol: 0.06,  notes: leadA },
        { type: 'sawtooth', vol: 0.035, notes: leadB },
        { type: 'triangle', vol: 0.07,  notes: toms },
        { type: 'triangle', vol: 0.08,  notes: sub }
      ]
    };
  })();

  MAPS.register({
    id: 'viceversa',
    worldSize: 3600,                                                // BIG (~1.5× standard)

    installData: function (DATA) {
      DATA.biomes.viceversa = {
        name: 'Vice Versa', tile: 'vvtBrimstone',
        mobs: ['vvImp', 'vvFireImp', 'vvSuccubus', 'vvBrute', 'vvSkeleton', 'vvGhost',
               'vvGaoler', 'vvTormentor', 'vvCherub', 'vvAngel', 'vvSeraph', 'vvValkyrie',
               'vvAcolyte', 'vvStatue', 'vvSiren', 'vvHerald', 'vvArchon']
      };
      DATA.realms.viceversa = {
        name: 'Vice Versa', biome: 'viceversa', boss: 'satan',
        bosses: ['satan', 'supremeBeing'], kind: 'viceversa', music: 'viceversa',
        // FACTION WARFARE (PLAN §2) — mob-vs-mob at full value, NO player credit
        factionCfg: { crossDamage: true, mobKillCredit: 'none', dmg: 9, tickMs: 500,
                      range: 46, maxBrawlers: 12 },
        // WRAP-LEASH (PLAN §2) — E-W seam drops chases; N-S never; bridge preserves
        wrapLeashCfg: { dropOnEWSeam: true, deaggroMs: 1600 },
        // DOUBLE BOSS portal (PLAN §6) — opens on first kill, clear on both
        portalCfg: { opensOnFirstBossKill: true },
        // both destructible fences reuse the shared deterioration helper
        fenceCfg: { hp: 30, states: 3, regrowMs: Infinity }
      };

      // ================= HELL ROSTER (8) — faction 'hell' =================
      DATA.mobs.vvImp = { name: 'Imp', texture: 'vvImpHi', hp: 24, spd: 108, xp: 7, cost: 1,
        faction: 'hell', deathTint: 0xc83a34, chase: { contactDmg: 6 },
        mapVerb: 'impPoke', poke: { range: 150, warnMs: 400, dashMs: 200, dashSpeed: 380, dmg: 8, cooldownMs: 2600 } };
      DATA.mobs.vvFireImp = { name: 'Fire Imp', texture: 'vvFireImpHi', hp: 30, spd: 78, xp: 12, cost: 2,
        faction: 'hell', deathTint: 0xff6a1e, chase: { contactDmg: 5 },
        mapVerb: 'fireLob', lob: { everyMs: 3400, range: 380, count: 2, scatter: 90, radius: 58, warnMs: 850,
                 dmg: 14, burnMs: 3200, burnDmg: 4, burnTickMs: 800 }, unlockAt: 10 };
      DATA.mobs.vvSuccubus = { name: 'Succubus', texture: 'vvSuccubusHi', hp: 44, spd: 72, xp: 16, cost: 2,
        faction: 'hell', deathTint: 0x8a3a9a, chase: { contactDmg: 6 },
        mapVerb: 'charmPull', charm: { everyMs: 5200, range: 260, warnMs: 800, halfRad: 0.55, dmg: 10,
                 pull: 260, ccMs: 350 }, unlockAt: 20 };
      DATA.mobs.vvBrute = { name: 'Demon Brute', texture: 'vvBruteHi', hp: 220, spd: 52, xp: 30, cost: 4,
        faction: 'hell', deathTint: 0x661410, chase: { contactDmg: 16 },
        mapVerb: 'bruteSlam', slam: { everyMs: 4800, range: 180, warnMs: 900, radius: 110, dmg: 22 }, unlockAt: 45 };
      DATA.mobs.vvSkeleton = { name: 'Skeleton Warrior', texture: 'vvSkeletonHi', hp: 60, spd: 66, xp: 15, cost: 2,
        faction: 'hell', deathTint: 0xe0d8c4, chase: { contactDmg: 9 },
        mapVerb: 'skeletonChop', chop: { everyMs: 4200, range: 130, warnMs: 750, halfRad: 0.6, dmg: 16,
                 blockArc: 0.9 }, unlockAt: 25 };
      DATA.mobs.vvGhost = { name: 'Ghost', texture: 'vvGhostHi', hp: 40, spd: 80, xp: 14, cost: 2,
        faction: 'hell', float: true, deathTint: 0x8ab2ac, chase: { contactDmg: 7 },
        mapVerb: 'ghostPhase', phase: { fadeRange: 220 }, unlockAt: 30 };
      DATA.mobs.vvGaoler = { name: 'Chain Gaoler', texture: 'vvGaolerHi', hp: 90, spd: 56, xp: 22, cost: 3,
        faction: 'hell', deathTint: 0x6a6e7a, chase: { contactDmg: 11 },
        mapVerb: 'gaolerHook', hook: { everyMs: 5600, range: 420, warnMs: 900, drag: 300, ccMs: 350,
                 half: 22, dmg: 12 }, unlockAt: 50 };
      DATA.mobs.vvTormentor = { name: 'Tormentor', texture: 'vvTormentorHi', hp: 70, spd: 64, xp: 20, cost: 3,
        faction: 'hell', deathTint: 0x8a3a9a,
        mapVerb: 'whipArc', whip: { everyMs: 5000, range: 340, warnMs: 950, len: 300, half: 20,
                 dmg: 16, burnMs: 3600, burnDmg: 4, burnTickMs: 800 }, unlockAt: 55 };

      // ================= HOLY ROSTER (9) — faction 'holy' =================
      DATA.mobs.vvCherub = { name: 'Cherub', texture: 'vvCherubHi', hp: 26, spd: 92, xp: 10, cost: 1,
        faction: 'holy', float: true, deathTint: 0xffe08a,
        shoot: { range: 340, dmg: 9, projSpeed: 220, cooldownMs: 1800, count: 1, spreadDeg: 0,
                 lifeMs: 2600, tint: 0xffe08a, texture: 'orbShot' }, unlockAt: 10 };
      DATA.mobs.vvAngel = { name: 'Angel Soldier', texture: 'vvAngelHi', hp: 58, spd: 74, xp: 15, cost: 2,
        faction: 'holy', deathTint: 0xf6f2e8, chase: { contactDmg: 9 },
        mapVerb: 'angelLunge', lunge: { range: 210, warnMs: 450, dashMs: 220, dashSpeed: 400, dmg: 12,
                 cooldownMs: 2800 }, unlockAt: 25 };
      DATA.mobs.vvSeraph = { name: 'Seraph', texture: 'vvSeraphHi', hp: 66, spd: 58, xp: 20, cost: 3,
        faction: 'holy', float: true, deathTint: 0xfff2c0,
        mapVerb: 'lightLance', lance: { everyMs: 5000, range: 460, warnMs: 1000, len: 520, half: 20,
                 dmg: 16 }, unlockAt: 40 };
      DATA.mobs.vvValkyrie = { name: 'Valkyrie', texture: 'vvValkyrieHi', hp: 54, spd: 96, xp: 18, cost: 2,
        faction: 'holy', float: true, deathTint: 0xc8d4e8, chase: { contactDmg: 8 },
        mapVerb: 'valkyrieDive', dive: { everyMs: 5400, range: 460, warnMs: 900, radius: 70, dashMs: 260,
                 dashSpeed: 520, dmg: 18 }, unlockAt: 35 };
      DATA.mobs.vvAcolyte = { name: 'Temple Acolyte', texture: 'vvAcolyteHi', hp: 48, spd: 60, xp: 16, cost: 2,
        faction: 'holy', deathTint: 0x7ae87a,                       // SUPPORT — no chase (heals allies)
        mapVerb: 'acolyteHeal', mend: { everyMs: 2600, range: 260, heal: 12, fleeRange: 180 },
        maxConcurrent: 2, unlockAt: 30 };
      DATA.mobs.vvStatue = { name: 'Guardian Statue', texture: 'vvStatueHi', hp: 130, spd: 70, xp: 24, cost: 3,
        faction: 'holy', deathTint: 0xa8a496, chase: { contactDmg: 12 },
        mapVerb: 'statueStalk', stalk: { coneDeg: 55, spd: 70 }, unlockAt: 45 };
      DATA.mobs.vvSiren = { name: 'Harp Siren', texture: 'vvSirenHi', hp: 44, spd: 66, xp: 16, cost: 2,
        faction: 'holy', deathTint: 0xe8d8f0, chase: { contactDmg: 6 },
        mapVerb: 'charmPull', charm: { everyMs: 5200, range: 260, warnMs: 800, halfRad: 0.55, dmg: 10,
                 pull: 260, ccMs: 350 }, unlockAt: 20 };
      DATA.mobs.vvHerald = { name: 'Herald', texture: 'vvHeraldHi', hp: 60, spd: 60, xp: 20, cost: 3,
        faction: 'holy', deathTint: 0xe8e2f0,
        mapVerb: 'heraldBlast', blast: { everyMs: 5200, range: 260, warnMs: 900, halfRad: 0.7, dmg: 14,
                 kb: 340, ccMs: 300 }, unlockAt: 50 };
      DATA.mobs.vvArchon = { name: 'Archon', texture: 'vvArchonHi', hp: 200, spd: 62, xp: 34, cost: 4,
        faction: 'holy', deathTint: 0xf6f0dc, chase: { contactDmg: 15 },
        mapVerb: 'archonBlade', archon: { everyMs: 5200, range: 200, warnMs: 850, halfRad: 0.6, dmg: 20,
                 dashLen: 260, dashMs: 240, dashSpeed: 460 }, unlockAt: 60 };

      // ================= DOUBLE BOSS =================
      // SATAN — KING IN FLAME (hell arena: throne + hellmouth)
      DATA.bosses.satan = {
        name: 'Satan', texture: 'vvSatanHi',
        hp: 4200, spd: 34, xp: 620, contactDmg: 22, deathTint: 0xff6a1e,
        lootTable: 'viceversa', mapOwned: true, entranceMs: 3000, faction: 'hell',
        patterns: {
          verbEveryMs: 5200,
          tridentSweep: { range: 230, warnMs: 850, halfRad: 0.7, dmg: 24, kb: 300 },
          hellfirePillars: { count: 4, radius: 70, warnMs: 900, gapMs: 350, dmg: 22 },
          impCall: { everyMs: 15000, imps: 3, cap: 8 },
          flightDive: { lanes: 3, warnMs: 950, half: 26, dmg: 22, boomerangMs: 900 },   // P2
          ringOfFire: { everyMs: 26000, firstDelayMs: 16000, ringWarnMs: 1200, gaps: 3,
                        dmg: 26, ventMs: 3600, ventDmgMult: 1.5 },
          p2Pct: 0.5
        },
        title: 'KING IN FLAME',
        hints: [
          "They're trapped on their own sides — start at the bridge, pick your poison.",
          'His GOLD TRIDENT flashes a wide arc before the sweep — step around it, not back.',
          'HELLFIRE PILLARS erupt through warned circles in sequence. Walk the order, never the wall.',
          'Below half he TAKES FLIGHT — strafing dive lanes + a boomerang trident. Cross the marked lanes.',
          'RING OF FIRE has telegraphed SAFE GAPS — find one; his crown then gutters out (unload).',
          'Beat one boss and the PORTAL between the arenas opens.'
        ]
      };
      // SUPREME BEING — THE COMPOSITE (holy arena: pearly gate)
      DATA.bosses.supremeBeing = {
        name: 'Supreme Being', texture: 'vvSupremeHi',
        hp: 4200, spd: 30, xp: 620, contactDmg: 22, deathTint: 0xffe08a,
        lootTable: 'viceversa', mapOwned: true, entranceMs: 3000, faction: 'holy',
        patterns: {
          verbEveryMs: 5200,
          gavelFist: { radius: 120, warnMs: 850, dmg: 22, ringDmg: 18, ringMs: 900, ringR: 240 },
          judgmentBeam: { chargeMs: 950, len: 640, half: 30, warnMs: 400, dmg: 24 },   // eye-shut tell
          scalesJudgment: { warnMs: 1000, dmg: 24 },                                   // half-arena smite
          cherubCall: { everyMs: 15000, cherubs: 3, cap: 8 },
          finalVerdict: { everyMs: 26000, firstDelayMs: 16000, chargeMs: 1400, sweepMs: 1600,
                          half: 34, dmg: 26, ventMs: 3600, ventDmgMult: 1.5 },
          blinkMs: 230, blinkHoldMs: 1200,
          p2Pct: 0.5
        },
        title: 'THE WATCHER\'S JUDGE',
        hints: [
          'The Watcher SLAMS SHUT to charge JUDGMENT — eye shut = a line beam is coming.',
          'GAVEL FIST warns a slam circle, then an expanding shockwave ring — leave the ring room.',
          'SCALES OF JUDGMENT smite HALF the arena. The RAISED PAN shows the safe half.',
          'The idle BLINK is quick; the beam-charge shut holds long and hums — do not confuse them.',
          'FINAL VERDICT: the eye closes long, then a rotating beam sweeps the marked line — then he kneels (vent).',
          'Both must fall. Beating one opens the portal to the other arena.'
        ]
      };

      DATA.dropTables.viceversa = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.riverwail = { type: 'sawtooth', freq: 220, freqEnd: 180, len: 0.7, vol: 0.05, limitMs: 900, noise: { vol: 0.03, hp: 400 } };
      DATA.audio.sounds.geyserburst = { type: 'triangle', freq: 120, freqEnd: 420, len: 0.5, vol: 0.13, limitMs: 600, noise: { vol: 0.06, hp: 800 } };
      DATA.audio.sounds.factionclash = { type: 'square', freq: 700, freqEnd: 200, len: 0.18, vol: 0.11, limitMs: 220, noise: { vol: 0.06, hp: 1400 } };
      DATA.audio.sounds.wrapwhoosh = { type: 'sawtooth', freq: 900, freqEnd: 200, len: 0.35, vol: 0.1, limitMs: 400 };
      DATA.audio.sounds.felwhip = { type: 'square', freq: 1600, freqEnd: 500, len: 0.2, vol: 0.12, limitMs: 250, noise: { vol: 0.07, hp: 2200 } };
      DATA.audio.sounds.chainhook = { type: 'square', freq: 300, freqEnd: 700, len: 0.2, vol: 0.12, limitMs: 260 };
      DATA.audio.sounds.charmhum = { type: 'triangle', arp: [520, 620, 700, 620], len: 0.5, vol: 0.09, limitMs: 600 };
      DATA.audio.sounds.statuetick = { type: 'square', freq: 1400, freqEnd: 1200, len: 0.08, vol: 0.1, limitMs: 140 };
      DATA.audio.sounds.healchime = { type: 'triangle', arp: [880, 1170, 1320], len: 0.4, vol: 0.1, limitMs: 500 };
      DATA.audio.sounds.heraldblast = { type: 'square', freq: 500, freqEnd: 900, len: 0.35, vol: 0.13, limitMs: 420 };
      DATA.audio.sounds.portalopen = { type: 'triangle', arp: [440, 660, 880, 1100], len: 0.7, vol: 0.14, limitMs: 800 };
      DATA.audio.sounds.tridentsweep = { type: 'square', freq: 480, freqEnd: 140, len: 0.28, vol: 0.15, limitMs: 320 };
      DATA.audio.sounds.pillarerupt = { type: 'sawtooth', freq: 90, freqEnd: 300, len: 0.5, vol: 0.15, limitMs: 550, noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.impcackle = { type: 'square', arp: [660, 880, 660, 990], len: 0.5, vol: 0.12, limitMs: 600 };
      DATA.audio.sounds.ringroar = { type: 'sawtooth', freq: 80, freqEnd: 240, len: 0.9, vol: 0.15, limitMs: 1000, noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.gavelslam = { type: 'triangle', freq: 160, freqEnd: 60, len: 0.4, vol: 0.16, limitMs: 500, noise: { vol: 0.07, hp: 300 } };
      DATA.audio.sounds.eyecharge = { type: 'sawtooth', freq: 300, freqEnd: 700, len: 0.9, vol: 0.09, limitMs: 1000 };
      DATA.audio.sounds.beamfire = { type: 'square', freq: 1200, freqEnd: 400, len: 0.3, vol: 0.14, limitMs: 360, noise: { vol: 0.08, hp: 2000 } };
      DATA.audio.sounds.scalescreak = { type: 'triangle', freq: 220, freqEnd: 160, len: 0.5, vol: 0.1, limitMs: 600 };
      DATA.audio.sounds.verdictsweep = { type: 'sawtooth', freq: 500, freqEnd: 1400, len: 0.8, vol: 0.13, limitMs: 900 };
      DATA.audio.music.viceversa = ETERNAL_WAR;

      MAPS.addConsoleMap(DATA, { id: 'viceversa', name: 'VICE VERSA',
        sub: 'the eternal struggle, made literal', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof VICEVERSA_ART !== 'undefined') VICEVERSA_ART.buildInto(ctx);
    },

    mobVerbs: {
      impPoke:      function (s, m, p, t) { return s._vvImp(m, p, t); },
      fireLob:      function (s, m, p, t) { return s._vvFireLob(m, p, t); },
      charmPull:    function (s, m, p, t) { return s._vvCharm(m, p, t); },
      bruteSlam:    function (s, m, p, t) { return s._vvSlam(m, p, t); },
      skeletonChop: function (s, m, p, t) { return s._vvChop(m, p, t); },
      ghostPhase:   function (s, m, p, t) { return s._vvGhost(m, p, t); },
      gaolerHook:   function (s, m, p, t) { return s._vvHook(m, p, t); },
      whipArc:      function (s, m, p, t) { return s._vvWhip(m, p, t); },
      angelLunge:   function (s, m, p, t) { return s._vvLunge(m, p, t); },
      lightLance:   function (s, m, p, t) { return s._vvLance(m, p, t); },
      valkyrieDive: function (s, m, p, t) { return s._vvDive(m, p, t); },
      acolyteHeal:  function (s, m, p, t) { return s._vvHeal(m, p, t); },
      statueStalk:  function (s, m, p, t) { return s._vvStatue(m, p, t); },
      heraldBlast:  function (s, m, p, t) { return s._vvBlast(m, p, t); },
      archonBlade:  function (s, m, p, t) { return s._vvArchon(m, p, t); }
    },

    scene: (typeof VICEVERSA_SCENE !== 'undefined') ? VICEVERSA_SCENE : {}
  });
})();
