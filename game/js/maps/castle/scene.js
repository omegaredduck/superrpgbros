// ============================================================================
// game/js/maps/castle/scene.js — VAMPIRE CASTLE scene hooks (M7 registry).
// The scene-plan PNG is canon: gatehouse (spawn, S) → outer courtyard →
// great hall (W, parquet) / ballroom (E, checker) → dungeon wing (NW) /
// library (NE) → THE TILTYARD (boss arena, N). THE BLOOD MOON COURT is the
// signature cycle: crimson window beams (empower mobs, burn you) → THE WALTZ
// (synchronized mob drift) → CHANDELIER CRASHES. THE PALE KING is a mounted
// jouster — every verb is a lane, ring or zone. Everything resets in setup().
// ============================================================================
(function (root) {
  'use strict';

  var FLOORS = [
    { x0: 0.0, y0: 0.68, x1: 1.0, y1: 1.0, tex: 'cacourtyard' },     // courtyard band
    { x0: 0.28, y0: 0.02, x1: 0.72, y1: 0.3, tex: 'cacourtyard' },   // THE TILTYARD
    { x0: 0.06, y0: 0.36, x1: 0.42, y1: 0.64, tex: 'caparquet' },    // GREAT HALL
    { x0: 0.58, y0: 0.36, x1: 0.94, y1: 0.64, tex: 'caballroom' },   // THE BALLROOM
    { x0: 0.02, y0: 0.06, x1: 0.24, y1: 0.3, tex: 'cabloodstone' }   // DUNGEON WING
  ];
  var DECOR = [
    // GATEHOUSE (spawn): portcullis + weeping statues
    ['caGate', 0.5, 0.965, 1.8], ['caStatue', 0.44, 0.93, 1.4], ['caStatue', 0.56, 0.93, 1.4],
    // OUTER COURTYARD: blood fountain + candelabra runner + armor displays + columns
    ['caFountain', 0.5, 0.8, 2.2],
    ['caCandelabra', 0.46, 0.88, 1.3], ['caCandelabra', 0.54, 0.88, 1.3],
    ['caCandelabra', 0.46, 0.72, 1.3], ['caCandelabra', 0.54, 0.72, 1.3],
    ['caArmorStand', 0.2, 0.78, 1.5], ['caArmorStand', 0.8, 0.78, 1.5],
    ['caColumn', 0.12, 0.9, 1.5], ['caColumn', 0.88, 0.9, 1.5],
    // GREAT HALL: banquet + hearth + portraits + throne
    ['caBanquet', 0.24, 0.5, 2.2], ['caHearth', 0.09, 0.5, 1.9],
    ['caThrone', 0.24, 0.62, 1.6], ['caCandelabra', 0.12, 0.44, 1.2], ['caCandelabra', 0.36, 0.56, 1.2],
    // BALLROOM: mirrors + the great organ
    ['caMirror', 0.6, 0.56, 1.5], ['caMirror', 0.92, 0.56, 1.5], ['caOrgan', 0.76, 0.38, 2.1],
    // windows (beam sources) on the outer ballroom + hall walls
    ['caWindow', 0.58, 0.44, 1.4], ['caWindow', 0.58, 0.52, 1.4],
    ['caWindow', 0.94, 0.44, 1.4], ['caWindow', 0.94, 0.52, 1.4],
    ['caWindow', 0.06, 0.42, 1.4], ['caWindow', 0.06, 0.56, 1.4],
    // DUNGEON WING: wine racks + coffin + roost
    ['caWine', 0.12, 0.12, 1.5], ['caCoffin', 0.19, 0.2, 1.5], ['caRoost', 0.06, 0.24, 1.4],
    // LIBRARY (NE): stacks + candelabra
    ['caLibrary', 0.82, 0.12, 1.6], ['caLibrary', 0.9, 0.16, 1.6], ['caLibrary', 0.82, 0.22, 1.6],
    ['caCandelabra', 0.88, 0.24, 1.2],
    // THE TILTYARD: joust list + banners(roosts) + candelabras
    ['caJoustList', 0.5, 0.16, 2.3],
    ['caRoost', 0.3, 0.26, 1.4], ['caRoost', 0.7, 0.26, 1.4],
    ['caCandelabra', 0.36, 0.12, 1.2], ['caCandelabra', 0.64, 0.2, 1.2]
  ];
  var PORTRAITS = [[0.16, 0.38], [0.28, 0.38], [0.22, 0.44]];   // phantom spawn walls
  var CHANDELIERS = [[0.66, 0.42], [0.76, 0.5], [0.86, 0.42]];
  var WINDOWS = [
    { x: 0.58, y: 0.44, room: [0.58, 0.36, 0.94, 0.64] }, { x: 0.94, y: 0.52, room: [0.58, 0.36, 0.94, 0.64] },
    { x: 0.06, y: 0.42, room: [0.06, 0.36, 0.42, 0.64] }, { x: 0.06, y: 0.56, room: [0.06, 0.36, 0.42, 0.64] }
  ];
  var ARENA = { x0: 0.28, y0: 0.02, x1: 0.72, y1: 0.3 };
  var GATE = [0.5, 0.035];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var CAS = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._cas = {
        portraits: PORTRAITS.map(function (p) { return { x: p[0] * WW, y: p[1] * HH }; }),
        chandeliers: [], zones: [], lanes: [], grps: {}, grpSeq: 1,
        leech: [],                      // vampire-initiate shot ledger
        pendingPack: 0,
        court: null, moon: null, tiltWalls: null, tiltCollider: null,
        gate: null, dim: null, dimArmed: false,
        arena: { x0: ARENA.x0 * WW, y0: ARENA.y0 * HH, x1: ARENA.x1 * WW, y1: ARENA.y1 * HH },
        center: { x: 0.5 * WW, y: 0.16 * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- floors: flagstone base + room floors + the crimson runner ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'caflagstone').setDepth(-23);
      FLOORS.forEach(function (F) {
        var w = (F.x1 - F.x0) * WW, h = (F.y1 - F.y0) * HH;
        scene.add.tileSprite(F.x0 * WW + w / 2, F.y0 * HH + h / 2, w, h, F.tex).setDepth(-21);
      });
      scene.add.tileSprite(0.5 * WW, 0.64 * HH, 60, 0.68 * HH, 'carunner').setDepth(-20);

      // ---- decor ----
      DECOR.forEach(function (D) {
        var spr = scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
        if (D[0] === 'caGate' && Math.abs(D[2] - 0.965) < 0.01) { /* spawn gate */ }
      });
      // the ARENA GATE (he smashes through it)
      C.gate = scene.add.sprite(GATE[0] * WW, GATE[1] * HH, 'caGate').setScale(2).setDepth(3);
      // chandeliers are scene OBJECTS (the crash mechanic)
      CHANDELIERS.forEach(function (Ch) {
        var spr = scene.add.sprite(Ch[0] * WW, Ch[1] * HH, 'caChandelier').setScale(1.8).setDepth(11);
        C.chandeliers.push({ x: spr.x, y: spr.y, spr: spr, down: false, rehoistAt: 0 });
      });

      // ---- THE BLOOD MOON COURT conductor ----
      var cfg = scene.realmDef.bloodMoon;
      var now = scene.time.now;
      C.court = {
        cfg: cfg,
        nextBeamAt: now + 7000, beams: [],
        waltz: { nextAt: now + cfg.waltz.everyMs * 0.5, until: 0, crashAt: 0 }
      };

      scene._realmStart = { x: 0.5 * WW, y: 0.93 * HH };

      // verb helpers (fresh closures)
      scene._casGargoyle = function (m, p, t) { return CAS._gargoyle(scene, m, p, t); };
      scene._casHalberd = function (m, p, t) { return CAS._halberd(scene, m, p, t); };
      scene._casPhantom = function (m, p, t) { return CAS._phantom(scene, m, p, t); };
      scene._casLeech = function (m, p, t) { return CAS._leech(scene, m, p, t); };
      scene._casRatPack = function (m, p, t) { return CAS._ratPack(scene, m, p, t); };
      scene._casArmorPiece = function (m, p, t) { return CAS._armorPiece(scene, m, p, t); };
      scene._casDuelist = function (m, p, t) { return CAS._duelist(scene, m, p, t); };
    },

    afterCreate: function (scene) {},

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._cas; if (!C) return;
      var dt = Math.min(120, delta), cfg = C.court.cfg;

      // boss-gone cleanup (frame-driven — wireEvents strips listeners)
      if (C.dim && C.dimArmed && (!scene.boss || !scene.boss.active)) { try { C.dim.destroy(); } catch (e) {} C.dim = null; }
      if (C.tiltWalls && (!scene.boss || !scene.boss.active)) CAS._clearTilt(scene);
      if (C.moon && (!scene.boss || !scene.boss.active)) { if (C.moon.g) { try { C.moon.g.destroy(); } catch (e) {} } C.moon = null; }

      // ---- THE WALTZ drift is applied BEFORE the wrap check (build rule) ----
      var W = C.court.waltz;
      var ambient = !scene.boss && !scene.bossPortal && !scene.closing && !scene.pendingLoot;
      if (ambient && time >= W.nextAt && W.nextAt !== Infinity) {
        W.nextAt = time + cfg.waltz.everyMs;
        W.until = time + cfg.waltz.durMs;
        W.crashAt = time + cfg.waltz.durMs;              // the crashes hit at the waltz peak
        scene.banner('THE WALTZ\nthe court dances — one two three', '#9fb8e8');
        try { AUDIO.play('waltzswell'); } catch (e) {}
      }
      if (W.until > time && !scene.hitstopActive) {
        // synchronized 1-2-3 diagonal steps
        var beat = Math.floor((time - (W.until - cfg.waltz.durMs)) / cfg.waltz.beatMs) % 3;
        var dirs = [[1, 1], [-1, 1], [1, -1]];
        var vx = dirs[beat][0] * cfg.waltz.push * dt / 1000, vy = dirs[beat][1] * cfg.waltz.push * dt / 1000;
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && !m.mob.bossWave) { m.x += vx; m.y += vy; }
        });
      }
      if (W.crashAt && time >= W.crashAt) {
        W.crashAt = 0;
        if (ambient) CAS._chandelierCrash(scene, time);
      }

      CAS._wrap(scene);

      // ---- CRIMSON BEAMS: sweeping window light ----
      var court = C.court;
      if (ambient && time >= court.nextBeamAt && court.nextBeamAt !== Infinity) {
        court.nextBeamAt = time + cfg.beams.everyMs;
        var win = WINDOWS[Math.floor(SIM.rng() * WINDOWS.length)];
        var room = win.room, WW = scene.worldW, HH = scene.worldH;
        var g = scene.add.graphics().setDepth(1.5);
        court.beams.push({
          x0: room[0] * WW, x1: room[2] * WW, y0: room[1] * HH, y1: room[3] * HH,
          startAt: time, until: time + cfg.beams.sweepMs, g: g, lastBurnAt: 0
        });
        try { AUDIO.play('beamhum'); } catch (e) {}
      }
      // reset EMPOWERED flags each frame BEFORE marking (conceal-flag lesson)
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob) m.mob.empowered = false; });
      for (var bi = court.beams.length - 1; bi >= 0; bi--) {
        var B = court.beams[bi];
        if (time >= B.until) { try { B.g.destroy(); } catch (e) {} court.beams.splice(bi, 1); continue; }
        var t = (time - B.startAt) / (B.until - B.startAt);
        var bx = B.x0 + (B.x1 - B.x0) * t, half = cfg.beams.half;
        B.g.clear();
        B.g.fillStyle(0xc22e3e, 0.16); B.g.fillRect(bx - half, B.y0, half * 2, B.y1 - B.y0);
        B.g.lineStyle(2, 0xf06a6a, 0.7); B.g.strokeRect(bx - half, B.y0, half * 2, B.y1 - B.y0);
        // mobs inside are EMPOWERED; the player takes a slow burn
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && Math.abs(m.x - bx) < half && m.y > B.y0 && m.y < B.y1) m.mob.empowered = true;
        });
        var p = scene.player;
        if (p.state.alive && Math.abs(p.x - bx) < half && p.y > B.y0 && p.y < B.y1 && time - B.lastBurnAt > cfg.beams.burnTickMs) {
          B.lastBurnAt = time;
          Entities.hurtPlayer(scene, p, cfg.beams.burnDmg, time, 'the blood moon');
        }
      }
      // empowered mobs move faster (velocity boost after core movement)
      if (!scene.hitstopActive) {
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.empowered) { m.body.velocity.x *= 1.3; m.body.velocity.y *= 1.3; }
        });
      }

      // ---- chandelier re-hoist ----
      C.chandeliers.forEach(function (Ch) {
        if (Ch.down && time >= Ch.rehoistAt) {
          Ch.down = false;
          Ch.spr.setPosition(Ch.x, Ch.y).setAlpha(1).setAngle(0);
        }
      });

      // ---- vampire-initiate LIFESTEAL ledger ----
      for (var li = C.leech.length - 1; li >= 0; li--) {
        var L = C.leech[li];
        if (L.shot.active && L.shot.proj === L.proj) { L.sx = L.shot.x; L.sy = L.shot.y; continue; }
        // the shot resolved — if it died on the player, the initiate drinks
        C.leech.splice(li, 1);
        if (L.mob.active && L.mob.mob && scene.player.state &&
            Math.hypot(L.sx - scene.player.x, L.sy - scene.player.y) < 44) {
          var def = L.mob.mob.def;
          // M7k AUDIT fix: hpMult never exists on m.mob — spawnMob sets maxHp.
          // The old cap read def.hp for scaled initiates and could REDUCE hp.
          L.mob.mob.hp = Math.min(L.mob.mob.maxHp || def.hp, L.mob.mob.hp + L.heal);
          scene.burst(L.mob.x, L.mob.y, 4, 0xc22e3e);
        }
      }

      // ---- animated-armor REASSEMBLY (outside the mob iterate) ----
      CAS._reassemble(scene, time);

      // ---- boss moonbeam sweep (per-frame rotation) ----
      if (C.moon && scene.boss && scene.boss.active) CAS._moonStep(scene, time);

      CAS._runZones(scene, time);
      CAS._runLanes(scene, time);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._cas; if (!C) return;
      var court = C.court;
      if (court) {
        if (court.nextBeamAt !== Infinity) court.nextBeamAt += dt;
        court.beams.forEach(function (B) { B.startAt += dt; B.until += dt; if (B.lastBurnAt) B.lastBurnAt += dt; });
        var W = court.waltz;
        if (W.nextAt !== Infinity) W.nextAt += dt;
        if (W.until) W.until += dt;
        if (W.crashAt) W.crashAt += dt;
      }
      C.chandeliers.forEach(function (Ch) { if (Ch.rehoistAt) Ch.rehoistAt += dt; });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      Object.keys(C.grps).forEach(function (k) { C.grps[k].bornAt += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        // M7k AUDIT fix: nextBlinkAt removed — core unfreeze already shifts it
        // for every mob; shifting here too delayed phantom blinks by 2x pause.
        ['perchUntil', 'nextDiveAt', 'diveAt', 'nextThrustAt', 'thrustAt',
         'nextShotAt', 'nextLungeAt2', 'lungeAt2', 'lungeEnd2'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });
        if (m.mob.flop && m.mob.flop.until) m.mob.flop.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextPassAt', 'nextCarouselAt', 'nextTiltAt', 'nextTrampleAt', 'nextSweepAt',
         'nextMoonAt', 'nextAddsAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
        if (bs.pass && bs.pass.at) bs.pass.at += dt;
        if (bs.pass && bs.pass.dashing && bs.pass.dashing.until) bs.pass.dashing.until += dt;  // M7k AUDIT fix: mid-dash clock
        if (bs.carousel) { if (bs.carousel.at) bs.carousel.at += dt; if (bs.carousel.until) bs.carousel.until += dt; }
      }
      if (C.moon) { C.moon.startAt += dt; C.moon.until += dt; }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._cas; if (!C) return;
      C.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record with the zone
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      C.lanes = [];
      C.court.beams.forEach(function (B) { try { B.g.destroy(); } catch (e) {} });
      C.court.beams = [];
      C.court.waltz.until = 0; C.court.waltz.crashAt = 0;
      C.leech = [];
      CAS._clearTilt(scene);
      if (C.moon) { if (C.moon.g) { try { C.moon.g.destroy(); } catch (e) {} } C.moon = null; }
      C.pendingPack = 0;   // M7k AUDIT fix: stale pack credits suppressed future dire-rat packs
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: the Pale King killed MID-VERB left telegraph graphics
    // painted forever (lance-pass lanes, the carousel ring). Central
    // onBossDown hook; dim/tiltWalls/moon also die here rather than waiting
    // a frame for the update() sweep.
    bossCleanup: function (scene, boss) {
      var C = scene._cas; if (!C) return;
      var bs = boss && boss.boss;
      if (bs) {
        if (bs.pass && bs.pass.g) { try { bs.pass.g.destroy(); } catch (e) {} bs.pass = null; }
        if (bs.carousel && bs.carousel.g) { try { bs.carousel.g.destroy(); } catch (e) {} bs.carousel = null; }
      }
      if (C.dim) { try { C.dim.destroy(); } catch (e) {} C.dim = null; }
      C.dimArmed = false;
      CAS._clearTilt(scene);
      if (C.moon) { if (C.moon.g) { try { C.moon.g.destroy(); } catch (e) {} } C.moon = null; }
    },

    // ================================================== BOSS ARRIVAL =======
    // GATE-SMASH CHARGE: the portcullis rises, hoofbeats in the dark, and the
    // first LANCE PASS lane IS the entrance — telegraphed like every pass.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._cas, self = scene;
      var gx = C.gate.x, gy = C.gate.y;
      scene.player.setPosition(C.center.x, C.arena.y1 - 60);
      scene.cameras.main.centerOn(C.center.x, C.center.y);
      // the tiltyard dims under the blood moon
      var W = scene.scale.width, H = scene.scale.height;
      C.dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x100c14, 0).setScrollFactor(0).setDepth(40);
      scene.tweens.add({ targets: C.dim, fillAlpha: 0.3, duration: 1200 });
      scene.cameras.main.shake(def.entranceMs, 0.004);
      scene.banner('HOOFBEATS IN THE DARK\nthe portcullis rises', '#9fb8e8');
      try { AUDIO.play('gallop'); } catch (e) {}
      scene.tweens.add({ targets: C.gate, y: gy - 30, duration: 900 });    // gate rises
      // the entrance lane: gate → straight down the tiltyard
      var lane = { x0: gx, y0: gy, x1: gx, y1: C.arena.y1 - 40 };
      CAS._lane(scene, lane, def.patterns.lancePass.half, def.entranceMs - 400, def.patterns.lancePass.dmg,
        "the Pale King's lance", true, scene.time.now, 0xe8b23a, false);
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive) return;
        // HE EXPLODES THROUGH THE GATE at full gallop
        self.cameras.main.flash(160, 232, 178, 58);
        self.cameras.main.shake(400, 0.012);
        self.burst(gx, gy, 22, 0x8a84a0);
        scene.tweens.add({ targets: C.gate, alpha: 0.25, angle: -14, duration: 300 });
        try { AUDIO.play('gatesmash'); } catch (e) {}
        self.spawnBossNow(def, gx, gy + 40);
        C.dimArmed = true;
        if (self.boss) {
          // the first pass: gallop from the gate to the arena heart
          self.tweens.add({ targets: self.boss, y: C.center.y + 60, duration: 700, ease: 'Sine.Out' });
        }
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, P = bs.def.patterns, C = scene._cas;
      if (!bs._casInit) {
        bs._casInit = true;
        bs.nextPassAt = time + 3500; bs.nextCarouselAt = time + 12000;
        bs.nextTiltAt = time + 18000; bs.nextTrampleAt = time + 7000;
        bs.nextSweepAt = time + 5000; bs.nextMoonAt = time + P.bloodMoonJoust.firstDelayMs;
        bs.nextAddsAt = time + P.ratAdds.everyMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * P.overclock.hpPct) {
        bs._overclocked = true;
        bs.spdMult = P.overclock.spdMult; bs.rateMult = P.overclock.rateMult;
        scene.banner('UNHORSED BY NO MAN\nthe Pale King spurs to a killing pace', '#e8b23a');
      }
      var rate = bs.rateMult || 1;
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      if (bs.pass) { CAS._passStep(scene, b, player, time); return; }
      if (bs.carousel) { CAS._carouselStep(scene, b, player, time); return; }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextMoonAt) {                                   // signature
        bs.nextMoonAt = time + P.bloodMoonJoust.everyMs * rate;
        CAS._moonBegin(scene, b, time);
      } else if (time >= bs.nextTiltAt) {
        bs.nextTiltAt = time + P.tiltCourt.everyMs * rate;
        CAS._tiltCourt(scene, b, player, time);
      } else if (time >= bs.nextCarouselAt) {
        bs.nextCarouselAt = time + P.carousel.everyMs * rate;
        CAS._carouselBegin(scene, b, time);
      } else if (time >= bs.nextPassAt) {
        bs.nextPassAt = time + P.lancePass.everyMs * rate;
        CAS._passBegin(scene, b, player, time, bs.hp <= bs.maxHp * 0.6 ? 2 : 1);
      } else if (time >= bs.nextTrampleAt) {
        bs.nextTrampleAt = time + P.waltzTrample.everyMs * rate;
        CAS._trample(scene, b, player, time);
      } else if (time >= bs.nextSweepAt && Math.hypot(player.x - b.x, player.y - b.y) < P.pennonSweep.range * 0.9) {
        bs.nextSweepAt = time + P.pennonSweep.everyMs * rate;
        bs.busyUntil = time + P.pennonSweep.warnMs + 300;
        CAS._pennonSweep(scene, b, player, time);
      }
      if (time >= bs.nextAddsAt) {
        bs.nextAddsAt = time + P.ratAdds.everyMs * rate;
        var alive = 0;
        scene.mobs.children.iterate(function (m) { if (m && m.active) alive++; });
        if (alive < P.ratAdds.cap) {
          for (var i = 0; i < P.ratAdds.count; i++) {
            var a = SIM.rng() * Math.PI * 2;
            scene.queueSpawn({ key: 'direRats', bossWave: true,
              x: b.x + Math.cos(a) * 200, y: b.y + Math.sin(a) * 160 });
          }
        }
      }
    },

    // ------------------------------------------------ boss verb bodies -----
    _passBegin: function (scene, b, player, time, count) {
      var cfg = b.boss.def.patterns.lancePass;
      var lanes = [];
      for (var i = 0; i < count; i++) {
        var ang = SIM.rng() * Math.PI;
        lanes.push({
          x0: player.x - Math.cos(ang) * cfg.len / 2, y0: player.y - Math.sin(ang) * cfg.len / 2,
          x1: player.x + Math.cos(ang) * cfg.len / 2, y1: player.y + Math.sin(ang) * cfg.len / 2
        });
      }
      var g = scene.add.graphics().setDepth(2);
      lanes.forEach(function (L) {
        g.lineStyle(cfg.half * 2, 0xe8b23a, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
        g.lineStyle(2, 0xe8b23a, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      });
      b.boss.pass = { lanes: lanes, idx: 0, at: time + cfg.warnMs, g: g, dashing: null, hit: false };
      b.boss.busyUntil = time + cfg.warnMs + cfg.dashMs * count + 600;
      scene.banner(count > 1 ? 'DOUBLE LANCE PASS' : 'LANCE PASS', '#e8b23a');
      try { AUDIO.play('gallop'); } catch (e) {}
    },
    _passStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.lancePass, ps = b.boss.pass;
      if (time < ps.at) { b.setVelocity(0, 0); return; }
      if (!ps.dashing) {
        var L = ps.lanes[ps.idx];
        b.setPosition(L.x0, L.y0);
        ps.dashing = { L: L, until: time + cfg.dashMs };
        ps.hit = false;
        scene.cameras.main.shake(cfg.dashMs, 0.006);
        try { AUDIO.play('lancecrack'); } catch (e) {}
      }
      var D = ps.dashing, t = 1 - Math.max(0, (D.until - time) / cfg.dashMs);
      b.setPosition(D.L.x0 + (D.L.x1 - D.L.x0) * t, D.L.y0 + (D.L.y1 - D.L.y0) * t);
      b.setFlipX(D.L.x1 < D.L.x0);
      if (!ps.hit && player.state.alive &&
          dist2seg(player.x, player.y, D.L.x0, D.L.y0, D.L.x1, D.L.y1) < cfg.half &&
          Math.hypot(player.x - b.x, player.y - b.y) < cfg.half * 3) {
        ps.hit = true;
        Entities.hurtPlayer(scene, player, cfg.dmg, time, "the Pale King's lance", true);
      }
      if (time >= D.until) {
        ps.idx++;
        if (ps.idx >= ps.lanes.length) { try { ps.g.destroy(); } catch (e) {} b.boss.pass = null; }
        else { ps.dashing = null; ps.at = time + 200; }
      }
    },
    _carouselBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.carousel, C = scene._cas;
      var ring = scene.add.graphics().setDepth(2);
      ring.lineStyle(cfg.band, 0xe8b23a, 0.15); ring.strokeCircle(C.center.x, C.center.y, cfg.radius);
      ring.lineStyle(2, 0xe8b23a, 0.9);
      ring.strokeCircle(C.center.x, C.center.y, cfg.radius - cfg.band / 2);
      ring.strokeCircle(C.center.x, C.center.y, cfg.radius + cfg.band / 2);
      b.boss.carousel = { at: time + cfg.warnMs, until: 0, g: ring, hit: false, a0: SIM.rng() * Math.PI * 2 };
      b.boss.busyUntil = time + cfg.warnMs + cfg.gallopMs + 400;
      scene.banner('CAROUSEL\nstand inside or outside the ring', '#e8b23a');
    },
    _carouselStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.carousel, cs = b.boss.carousel, C = scene._cas;
      if (time < cs.at) { b.setVelocity(0, 0); return; }
      if (!cs.until) { cs.until = time + cfg.gallopMs; try { AUDIO.play('gallop'); } catch (e) {} }
      var t = 1 - Math.max(0, (cs.until - time) / cfg.gallopMs);
      var a = cs.a0 + t * Math.PI * 2;
      b.setPosition(C.center.x + Math.cos(a) * cfg.radius, C.center.y + Math.sin(a) * cfg.radius);
      b.setFlipX(Math.sin(a) > 0);
      if (!cs.hit && player.state.alive && Math.hypot(player.x - b.x, player.y - b.y) < cfg.band) {
        cs.hit = true;
        Entities.hurtPlayer(scene, player, cfg.dmg, time, "the Pale King's carousel", true);
      }
      if (time >= cs.until) { try { cs.g.destroy(); } catch (e) {} b.boss.carousel = null; }
    },
    _tiltCourt: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tiltCourt, C = scene._cas, self = scene;
      // spectral barriers split the arena into 3 vertical lanes
      CAS._clearTilt(scene);
      var w = (C.arena.x1 - C.arena.x0) / 3;
      C.tiltWalls = scene.physics.add.staticGroup();
      [1, 2].forEach(function (i) {
        var wx = C.arena.x0 + w * i;
        var wall = scene.add.rectangle(wx, (C.arena.y0 + C.arena.y1) / 2, 10, C.arena.y1 - C.arena.y0, 0x9fb8e8, 0.35).setDepth(4);
        C.tiltWalls.add(wall);
      });
      C.tiltCollider = scene.physics.add.collider(scene.player, C.tiltWalls);
      // YOUR lane flashes → he passes down it
      var laneIdx = Math.max(0, Math.min(2, Math.floor((player.x - C.arena.x0) / w)));
      var lx = C.arena.x0 + w * laneIdx + w / 2;
      var lane = { x0: lx, y0: C.arena.y0 - 20, x1: lx, y1: C.arena.y1 + 20 };
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(cfg.half * 2, 0xc22e3e, 0.16); g.lineBetween(lane.x0, lane.y0, lane.x1, lane.y1);
      g.lineStyle(2, 0xc22e3e, 0.9); g.lineBetween(lane.x0, lane.y0, lane.x1, lane.y1);
      b.boss.pass = { lanes: [lane], idx: 0, at: time + cfg.warnMs, g: g, dashing: null, hit: false };
      b.boss.busyUntil = time + cfg.warnMs + cfg.dashMs + 800;
      scene.banner('TILT OF THE COURT\ndodge through the barrier gaps', '#9fb8e8');
      try { AUDIO.play('khinch'); } catch (e) {}
      // barriers clear after the pass resolves
      scene.time.delayedCall(cfg.warnMs + cfg.dashMs + cfg.wallLingerMs, function () { CAS._clearTilt(self); });
    },
    _clearTilt: function (scene) {
      var C = scene._cas; if (!C) return;
      if (C.tiltCollider) { try { C.tiltCollider.destroy(); } catch (e) {} C.tiltCollider = null; }
      if (C.tiltWalls) { try { C.tiltWalls.clear(true, true); C.tiltWalls.destroy(); } catch (e) {} C.tiltWalls = null; }
    },
    _trample: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.waltzTrample;
      // 3-beat triplets of hoof-stomp zones, waltz-timed (1-2-3, 1-2-3)
      for (var wave = 0; wave < 3; wave++) {
        for (var i = 0; i < 3; i++) {
          var a = SIM.rng() * Math.PI * 2, rr = (i === 0 && wave === 0) ? 0 : SIM.rng() * cfg.scatter;
          CAS._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.radius, cfg.warnMs + wave * cfg.beatMs, cfg.dmg, "the Pale King's trample", true, true, time);
        }
      }
      try { AUDIO.play('waltzswell'); } catch (e) {}
    },
    _pennonSweep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.pennonSweep, self = scene;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xe8b23a, 0.14); g.lineStyle(2, 0xe8b23a, 0.8);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active || !player.state.alive) return;
        var d = Math.hypot(player.x - b.x, player.y - b.y);
        var pa = Math.atan2(player.y - b.y, player.x - b.x);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        self.cameras.main.shake(140, 0.006);
        try { AUDIO.play('lancecrack'); } catch (e) {}
        if (d < cfg.range && Math.abs(diff) < cfg.halfRad)
          Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "the pennon sweep", true);
      });
    },
    _moonBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.bloodMoonJoust, C = scene._cas;
      b.boss.rootUntil = time + cfg.sweepMs + cfg.ventMs;
      b.boss.busyUntil = b.boss.rootUntil;
      C.moon = { startAt: time, until: time + cfg.sweepMs, a0: SIM.rng() * Math.PI,
                 g: scene.add.graphics().setDepth(2), hit: false, cfg: cfg };
      scene.banner('BLOOD MOON JOUST\nthe moonbeam sweeps the lists like a clock hand', '#9fb8e8');
      try { AUDIO.play('beamhum'); } catch (e) {}
    },
    _moonStep: function (scene, time) {
      var C = scene._cas, M = C.moon; if (!M) return;
      var b = scene.boss, cfg = M.cfg;
      if (time >= M.until) {
        try { M.g.destroy(); } catch (e) {}
        C.moon = null;
        // WINDED: the horse rears — rooted, vented ×1.5
        if (b && b.active) {
          b.boss.ventedUntil = time + cfg.ventMs;
          b.boss.ventDmgMult = cfg.ventDmgMult;
          b.setTint(0x9fb8e8);
          var self = scene;
          scene.time.delayedCall(cfg.ventMs, function () { if (b.active) b.clearTint(); });
          scene.banner('THE HORSE REARS — HE IS WINDED. UNLOAD', '#dce8ff');
        }
        return;
      }
      var t = (time - M.startAt) / (M.until - M.startAt);
      var a = M.a0 + t * Math.PI;
      var cx = C.center.x, cy = C.center.y, len = 900;
      var L = { x0: cx - Math.cos(a) * len / 2, y0: cy - Math.sin(a) * len / 2,
                x1: cx + Math.cos(a) * len / 2, y1: cy + Math.sin(a) * len / 2 };
      M.g.clear();
      M.g.lineStyle(cfg.half * 2, 0x9fb8e8, 0.22); M.g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      M.g.lineStyle(3, 0xdce8ff, 0.9); M.g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      var p = scene.player;
      if (!M.hit && p.state.alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < cfg.half) {
        M.hit = true;
        Entities.hurtPlayer(scene, p, cfg.dmg, time, 'the blood moonbeam', true);
      }
    },

    // ----------------------------------------------- the chandelier crash --
    _chandelierCrash: function (scene, time) {
      var C = scene._cas, cfg = C.court.cfg.chandeliers;
      C.chandeliers.forEach(function (Ch) {
        if (Ch.down) return;
        CAS._zone(scene, Ch.x, Ch.y + 30, cfg.radius, cfg.warnMs, cfg.dmg, 'a falling chandelier', false, true, time);
        Ch.down = true;
        Ch.rehoistAt = time + cfg.rehoistMs;
        scene.time.delayedCall(cfg.warnMs, function () {
          if (!Ch.spr.active) return;
          scene.tweens.add({ targets: Ch.spr, y: Ch.y + 34, angle: 20, alpha: 0.45, duration: 160 });
          try { AUDIO.play('chandeliercrash'); } catch (e) {}
        });
      });
    },

    // =============================================== MOB VERBS (map-new) ===
    // GARGOYLE — perches ARMORED (damage resist + 'HARDENED'), then dives
    // onto a marked circle.
    _gargoyle: function (scene, m, player, time) {
      var cfg = m.mob.def.perchDive;
      // damage-resist refund while perched (NOT immunity — hurtMob has no
      // resist hook, so the perch refunds half of what just landed)
      if (m.mob._lastHp === undefined) m.mob._lastHp = m.mob.hp;
      if (m.mob.perchUntil && time < m.mob.perchUntil && m.mob.hp < m.mob._lastHp) {
        var taken = m.mob._lastHp - m.mob.hp;
        var refund = Math.floor(taken * cfg.resist);
        if (refund > 0) {
          m.mob.hp += refund;
          scene.damageNumber(m.x, m.y - 24, 'HARDENED', '#b8b2cc');
        }
      }
      m.mob._lastHp = m.mob.hp;
      if (m.mob.flop) {                                   // mid-dive (airborne)
        var F = m.mob.flop;
        var t = 1 - Math.max(0, (F.until - time) / cfg.diveMs);
        m.setPosition(F.sx + (F.tx - F.sx) * t, F.sy + (F.ty - F.sy) * t - Math.sin(t * Math.PI) * 70);
        if (time >= F.until) { m.body.enable = true; m.mob.flop = null; m.mob.perchUntil = 0; m.mob.nextDiveAt = time + cfg.everyMs; }
        return true;
      }
      if (!m.mob.nextDiveAt) { m.mob.nextDiveAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.5); m.mob.perchUntil = time + cfg.everyMs * 2; }
      if (m.mob.perchUntil && time < m.mob.perchUntil) {
        m.setVelocity(0, 0);
        m.setTint(0x8a84a0);                              // stone-grey perched read
        var d = Math.hypot(player.x - m.x, player.y - m.y);
        if (time >= m.mob.nextDiveAt && d < cfg.range) {
          m.clearTint();
          m.mob.flop = { sx: m.x, sy: m.y, tx: player.x, ty: player.y, until: time + cfg.diveMs };
          m.body.enable = false;
          CAS._zone(scene, player.x, player.y, cfg.radius, cfg.diveMs, cfg.dmg, "a Gargoyle's dive", false, false, time);
        }
        return true;                                      // perched owns the frame
      }
      m.clearTint();
      if (time >= m.mob.nextDiveAt + cfg.chaseMs) m.mob.perchUntil = time + cfg.everyMs * 2;   // re-perch
      return false;                                       // chase between dives
    },
    // HALBERD GUARD — telegraphed thrust down a short flashing lane.
    _halberd: function (scene, m, player, time) {
      var cfg = m.mob.def.thrust;
      if (m.mob.thrustAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.thrustAt) m.mob.thrustAt = 0;
        return true;                                      // rooted through the windup
      }
      if (!m.mob.nextThrustAt) m.mob.nextThrustAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextThrustAt && d < cfg.range) {
        m.mob.nextThrustAt = time + cfg.everyMs;
        m.mob.thrustAt = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var lane = { x0: m.x, y0: m.y, x1: m.x + Math.cos(ang) * cfg.len, y1: m.y + Math.sin(ang) * cfg.len };
        CAS._lane(scene, lane, cfg.half, cfg.warnMs, cfg.dmg, "a Halberd Guard's thrust", false, time, 0xc8d0dc, false);
        return true;
      }
      return false;
    },
    // PORTRAIT PHANTOM — emerges from the portrait walls, chases, blinks back.
    _phantom: function (scene, m, player, time) {
      var C = scene._cas, cfg = m.mob.def.wallBlink;
      if (!m.mob._emerged) {
        m.mob._emerged = true;
        var P0 = C.portraits[Math.floor(SIM.rng() * C.portraits.length)];
        scene.burst(P0.x, P0.y, 8, 0x8f68b0);
        m.body.reset(P0.x, P0.y);
        m.mob.nextBlinkAt = time + cfg.everyMs;
        try { AUDIO.play('mirrorchime'); } catch (e) {}
        return true;
      }
      if (time >= m.mob.nextBlinkAt) {
        m.mob.nextBlinkAt = time + cfg.everyMs;
        // blink back to the portrait nearest the player (never truly gone)
        var best = null, bd = 1e9;
        C.portraits.forEach(function (P0) {
          var d = Math.hypot(P0.x - player.x, P0.y - player.y);
          if (d < bd) { bd = d; best = P0; }
        });
        if (best) {
          scene.burst(m.x, m.y, 8, 0x8f68b0);
          m.body.reset(best.x, best.y);
          scene.burst(best.x, best.y, 8, 0x8f68b0);
          try { AUDIO.play('mirrorchime'); } catch (e) {}
        }
      }
      return false;                                       // generic chase
    },
    // VAMPIRE INITIATE — aimed blood bolt that HEALS HIM when it lands.
    _leech: function (scene, m, player, time) {
      var cfg = m.mob.def.bloodBolt, C = scene._cas;
      if (!m.mob.nextShotAt) m.mob.nextShotAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextShotAt && d < cfg.range) {
        m.mob.nextShotAt = time + cfg.everyMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var s = Entities.fireProjectile(scene, scene.enemyShots, m.x, m.y, ang,
          cfg.projSpeed, cfg.dmg, cfg.lifeMs, 'orbShot', false, 'a Vampire Initiate');
        if (s) {
          s.setTint(0xc22e3e);
          C.leech.push({ shot: s, proj: s.proj, mob: m, heal: cfg.heal, sx: s.x, sy: s.y });
        }
      }
      return false;
    },
    // DIRE RATS — spawn in packs (pack-credit trick).
    _ratPack: function (scene, m, player, time) {
      var C = scene._cas;
      if (!m.mob._packInit) {
        m.mob._packInit = true;
        if (C.pendingPack > 0) C.pendingPack--;
        else if (!m.mob.bossWave) {
          var n = 1 + (SIM.rng() < 0.5 ? 1 : 0);
          C.pendingPack += n;
          for (var i = 0; i < n; i++)
            scene.queueSpawn({ key: 'direRats', x: m.x + (SIM.rng() * 2 - 1) * 60, y: m.y + (SIM.rng() * 2 - 1) * 60 });
        }
      }
      return false;
    },
    // ARMOR PIECE — crawls toward its siblings (the reassembly).
    _armorPiece: function (scene, m, player, time) {
      var C = scene._cas;
      if (!m.mob._grpId) {
        // join the nearest young group, else found one
        var best = null, bd = 140;
        scene.mobs.children.iterate(function (o) {
          if (o !== m && o.active && o.mob && o.mob._grpId && o.mob.def === m.mob.def) {
            var d = Math.hypot(o.x - m.x, o.y - m.y);
            if (d < bd) { bd = d; best = o.mob._grpId; }
          }
        });
        m.mob._grpId = best || ('g' + (C.grpSeq++));
        if (!C.grps[m.mob._grpId]) C.grps[m.mob._grpId] = { bornAt: time, used: false };
      }
      // crawl toward the sibling centroid (that's the tell — kill the pieces!)
      var sx = 0, sy = 0, n = 0;
      scene.mobs.children.iterate(function (o) {
        if (o.active && o.mob && o.mob._grpId === m.mob._grpId) { sx += o.x; sy += o.y; n++; }
      });
      if (n >= 2) {
        var cx = sx / n, cy = sy / n;
        var d = Math.hypot(cx - m.x, cy - m.y);
        if (d > 6) m.setVelocity((cx - m.x) / d * m.mob.spd, (cy - m.y) / d * m.mob.spd);
        else m.setVelocity(0, 0);
        return true;                                      // crawling owns the frame
      }
      return false;                                       // last piece just chases
    },
    // CRIMSON DUELIST — circles you; telegraphed rapier lunge LINES.
    _duelist: function (scene, m, player, time) {
      var cfg = m.mob.def.rapier;
      if (m.mob.lungeAt2) {                               // windup: rooted, lane locked
        m.setVelocity(0, 0);
        if (time >= m.mob.lungeAt2) {
          m.mob.lungeAt2 = 0;
          m.mob.lungeEnd2 = time + cfg.dashMs;
          m.mob._lungeHit = false;
        }
        return true;
      }
      if (m.mob.lungeEnd2 && time < m.mob.lungeEnd2) {    // the dash itself
        var L = m.mob._lungeLane;
        var t = 1 - (m.mob.lungeEnd2 - time) / cfg.dashMs;
        m.setPosition(L.x0 + (L.x1 - L.x0) * t, L.y0 + (L.y1 - L.y0) * t);
        if (!m.mob._lungeHit && player.state.alive &&
            Math.hypot(player.x - m.x, player.y - m.y) < 30) {
          m.mob._lungeHit = true;
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Crimson Duelist's rapier");
        }
        return true;
      }
      if (m.mob.lungeEnd2 && time >= m.mob.lungeEnd2) m.mob.lungeEnd2 = 0;
      if (!m.mob.nextLungeAt2) m.mob.nextLungeAt2 = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var dx = player.x - m.x, dy = player.y - m.y, d = Math.hypot(dx, dy) || 1;
      if (time >= m.mob.nextLungeAt2 && d < cfg.range) {
        m.mob.nextLungeAt2 = time + cfg.everyMs;
        m.mob.lungeAt2 = time + cfg.warnMs;
        var ang = Math.atan2(dy, dx);
        var lane = { x0: m.x, y0: m.y, x1: m.x + Math.cos(ang) * cfg.len, y1: m.y + Math.sin(ang) * cfg.len };
        m.mob._lungeLane = lane;
        CAS._lane(scene, lane, cfg.half, cfg.warnMs, 0, null, false, time, 0xf06a6a, false, true);
        return true;
      }
      // STRAFE: orbit the player at fencing distance
      var tangential = { x: -dy / d, y: dx / d };
      var radial = d > cfg.orbit ? 1 : (d < cfg.orbit * 0.7 ? -1 : 0);
      m.setVelocity((tangential.x + radial * dx / d * 0.6) * m.mob.spd,
                    (tangential.y + radial * dy / d * 0.6) * m.mob.spd);
      m.setFlipX(dx < 0);
      return true;                                        // the orbit owns movement
    },

    // ------------------------------------------- reassembly (scene-side) ---
    _reassemble: function (scene, time) {
      var C = scene._cas;
      var groups = {};
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && m.mob && m.mob._grpId) (groups[m.mob._grpId] = groups[m.mob._grpId] || []).push(m);
      });
      Object.keys(groups).forEach(function (gid) {
        var G2 = C.grps[gid]; if (!G2 || G2.used) return;
        var pieces = groups[gid];
        if (pieces.length < 2 || time < G2.bornAt + 1200) return;
        var cx = 0, cy = 0;
        pieces.forEach(function (p) { cx += p.x; cy += p.y; });
        cx /= pieces.length; cy /= pieces.length;
        var together = pieces.every(function (p) { return Math.hypot(p.x - cx, p.y - cy) < 46; });
        if (!together) return;
        // REASSEMBLE — once. Kill the pieces silently, raise the armor at 40%.
        G2.used = true;
        pieces.forEach(function (p) { Entities.clearNameTag(p); p.body.enable = false; scene.mobs.killAndHide(p); });
        scene.burst(cx, cy, 16, 0xc8d0dc);
        try { AUDIO.play('armorclatter'); } catch (e) {}
        scene.queueSpawn({ key: 'armorReborn', x: cx, y: cy });
        C.fixHp = (C.fixHp || 0) + 1;
      });
      if (C.fixHp > 0) {
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.def === DATA.mobs.armorReborn && !m.mob._hpFixed) {
            m.mob._hpFixed = true;
            m.mob.hp = Math.ceil(m.mob.hp * 0.4);
            C.fixHp--;
          }
        });
      }
    },

    // ================================================= INTERNAL HELPERS ====
    _wrap: function (scene) {
      var WW = scene.worldW, HH = scene.worldH;
      var wrap = function (o) {
        if (!o) return;
        var nx = o.x, ny = o.y, moved = false;
        if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
        if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
        if (!moved) return;
        if (o.body && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time) {
      var C = scene._cas;
      var tint = fromBoss ? 0xe8b23a : 0xc22e3e;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._cas;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xe8b23a : 0xc22e3e);
        scene.cameras.main.shake(90, 0.004);
        try { AUDIO.play('crash'); } catch (e) {}
        if (scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.killMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m);
          });
        }
      }
    },
    // warned LANE. hitMobs=true credits env kills; silent=true draws only.
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint, hitMobs, silent) {
      var C = scene._cas;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      C.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src,
                     fromBoss: !!fromBoss, g: g, tint: tint, hitMobs: !!hitMobs, silent: !!silent });
    },
    _runLanes: function (scene, time) {
      var C = scene._cas;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        if (l.silent) continue;                            // duelist windup line (dash does the damage)
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(100, 0.005);
        try { AUDIO.play('crash'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
        if (l.hitMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
          });
        }
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CAS;
  root.CASTLE_SCENE = CAS;
})(typeof window !== 'undefined' ? window : this);
