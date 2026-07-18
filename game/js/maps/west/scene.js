// ============================================================================
// game/js/maps/west/scene.js — WILD WEST TOWN scene hooks (M7 registry).
// The scene-plan PNG (assets/west_scene_plan.png) is canon: one dusty MAIN
// STREET spine (N-S, edge-to-edge = wraps), the CLOCK-TOWER SQUARE at center
// (= duel ground + boss arena, OPEN — no fences), SALOON (saloon floor) W
// facing the JAIL E (iron doors onto the square), GALLOWS behind the jail,
// CHURCH N, WATER TOWER SW, WAGON YARD SE, TROUGH + HITCH ROW + THE HORSE S,
// RAIL LINE E (wraps N-S) + STAGE STOP, TUMBLEWEED FLATS W band, CRACKED
// EARTH NE, DESERT RING all edges. Toroidal wrap everywhere.
// SIGNATURE — HIGH NOON: EVERYBODY DRAWS. On a cycle the clock strikes noon:
// every ARMED mob freezes + telegraphs ONE shot lane at the player; all fire
// on the last toll; every lane the player DODGED fires BACK at its shooter
// (env-credited); the wind re-rolls (tumbleweeds change roll direction).
// NOON EXPRESS: the yard-train telegraph/instakill on the east rail line.
// Boss: THE OUTLAW SHERIFF — doors blast → he shoots THE HORSE → duel circle.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---- planned layout (fractions of the world; plan PNG canon) ------------
  var DECOR = [
    ['wdChurch', 0.5, 0.10, 2.4],
    ['wdSaloon', 0.36, 0.31, 2.4], ['wdJail', 0.628, 0.31, 2.4],
    ['wdClock', 0.5, 0.30, 2.0], ['wdGallows', 0.70, 0.47, 2.0],
    ['wdWaterTower', 0.30, 0.68, 2.2], ['wdWindmill', 0.13, 0.27, 2.0],
    ['wdWagon', 0.62, 0.66, 1.8], ['wdStagecoach', 0.955, 0.46, 1.9],
    ['wdBarrels', 0.44, 0.72, 1.6], ['wdTrough', 0.31, 0.82, 1.8],
    ['wdHitch', 0.40, 0.82, 1.6],
    ['wdCactus', 0.07, 0.55, 1.7], ['wdCactus', 0.85, 0.68, 1.7],
    ['wdCactus', 0.76, 0.08, 1.6]
  ];
  var LANE_ENV = 0xe0a832, LANE_FIRE = 0xf8d878, BOSS_TINT = 0xd05a4a, CHALK = 0xe8e0c8;
  var WIND = [{ x: 1, y: 0.2 }, { x: -1, y: 0.15 }, { x: 0.2, y: 1 }, { x: -0.15, y: -1 }];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var WS = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._west = {
        arena: { x: 0.5 * WW, y: 0.5 * HH, r: 0.145 * WW },
        railCx: 0.913 * WW, railHalf: (scene.realmDef.train.railHalf) || 22,
        streetX0: 0.46 * WW, streetX1: 0.539 * WW,
        saloonRightX: 0.44 * WW, jailLeftX: 0.56 * WW,
        horse: null, horseDead: false, chalkG: null, flashG: null,
        noon: { nextAt: 0, phase: 'idle', lanes: [], tolls: [], fireAt: 0, tollIdx: 0,
                freeze: false, windIdx: 0 },
        train: { nextAt: 0, phase: 'idle', warnUntil: 0, passUntil: 0, dir: 1,
                 headY: 0, len: 0, cars: [], warnG: null },
        zones: [], lanes: [], patches: [], mobWarns: [],
        venom: { until: 0, mult: 1 }, bossArmed: false
      };
      scene._zoneWarns = scene._zoneWarns || [];
      C.noon.windIdx = 0;

      // ---- ground: desert sand base + zone bands (composed, never scatter) --
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'wtsand').setDepth(-23);
      // tumbleweed flats W band
      scene.add.tileSprite(0.083 * WW, HH / 2, 0.166 * WW, HH, 'wtflats').setDepth(-22.5);
      // cracked earth NE corner
      WS._maskTile(scene, 'wtcracked', 0.83 * WW, 0.12 * HH, 0.34 * WW, 0.24 * HH, -22.5);
      // rail bed strip E (wraps N-S)
      scene.add.tileSprite(C.railCx, HH / 2, C.railHalf * 2, HH, 'wtrail').setDepth(-22);
      // main street spine (N-S, edge-to-edge = wraps)
      scene.add.tileSprite((C.streetX0 + C.streetX1) / 2, HH / 2, C.streetX1 - C.streetX0, HH, 'wtdirt').setDepth(-22);
      // clock-tower square: packed dirt duel ground (arena)
      WS._maskTile(scene, 'wtdirt', C.arena.x, C.arena.y, C.arena.r * 2.2, C.arena.r * 2.2, -21.6);
      // boardwalk aprons + saloon-floor interior
      [[0.36, 0.42, 0.18, 0.03], [0.628, 0.42, 0.18, 0.03], [0.5, 0.185, 0.15, 0.025]].forEach(function (A) {
        scene.add.tileSprite(A[0] * WW, A[1] * HH, A[2] * WW, A[3] * HH, 'wtboard').setDepth(-21.4);
      });
      WS._maskTile(scene, 'wtfloor', 0.36 * WW, 0.31 * HH, 0.16 * WW, 0.1 * HH, -21.3);

      // ---- decor + THE HORSE (entrance victim, hitched at the trough) -------
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });
      C.horse = scene.add.sprite(0.34 * WW, 0.80 * HH, 'wdHorse').setScale(1.7).setDepth(3);

      // ---- boss arena ring cosmetic (duel ground) ----
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(2, 0x96784e, 0.6); rg.strokeCircle(C.arena.x, C.arena.y, C.arena.r);

      // ---- spawn at the SOUTH end of MAIN STREET ----
      scene._realmStart = { x: (C.streetX0 + C.streetX1) / 2, y: 0.92 * HH };

      // mob-verb helpers (fresh closures each setup)
      scene._wRustler = function (m, p, t) { return WS._rustler(scene, m, p, t); };
      scene._wBandit = function (m, p, t) { return WS._bandit(scene, m, p, t); };
      scene._wDan = function (m, p, t) { return WS._dan(scene, m, p, t); };
      scene._wSnake = function (m, p, t) { return WS._snake(scene, m, p, t); };
      scene._wVulture = function (m, p, t) { return WS._vulture(scene, m, p, t); };
      scene._wTumble = function (m, p, t) { return WS._tumble(scene, m, p, t); };
      scene._wScorpion = function (m, p, t) { return WS._scorpion(scene, m, p, t); };
      scene._wDevil = function (m, p, t) { return WS._devil(scene, m, p, t); };
    },

    _maskTile: function (scene, key, cx, cy, w, h, depth) {
      var spr = scene.add.tileSprite(cx, cy, w, h, key).setDepth(depth);
      var mg = scene.make.graphics({ add: false });
      mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, w, h);
      spr.setMask(mg.createGeometryMask());
      return spr;
    },

    afterCreate: function (scene) {
      // The duel ground + whole town are OPEN (graveyard reachable-boss lesson):
      // no fences, no map colliders. Nothing to wire here — but this hook MUST
      // exist and MUST be where any collider would attach (never in setup()).
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._west; if (!C) return;
      var p = scene.player, alive = p.state.alive;
      var noonCfg = scene.realmDef.noon, trainCfg = scene.realmDef.train;

      // boss-owned machinery clears when the boss is down
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        if (C.chalkG) { try { C.chalkG.destroy(); } catch (e) {} C.chalkG = null; }
      }

      // ---- HIGH NOON cycle (parked while the boss holds court) ----
      var N = C.noon;
      if (!N.nextAt) N.nextAt = time + noonCfg.firstDelayMs;
      if (N.phase === 'idle' && N.nextAt !== Infinity && time >= N.nextAt && !scene.scanning && !scene.boss) {
        WS._startNoon(scene, C, time, noonCfg);
      }
      if (N.phase === 'warn') {
        // tolls chime; freeze holds
        while (N.tollIdx < N.tolls.length && time >= N.tolls[N.tollIdx]) {
          N.tollIdx++; try { AUDIO.play('duelchime'); } catch (e) {}
        }
        if (time >= N.fireAt) WS._fireNoon(scene, C, time, noonCfg);
      }
      if (N.freeze) {
        scene.mobs.children.iterate(function (m) { if (m && m.active) m.setVelocity(0, 0); });
      }

      // ---- NOON EXPRESS (yard train tech; offset from noon) ----
      WS._updateTrain(scene, C, time, delta, trainCfg);

      // ---- combined player slow (venom + devil swirl), capped (CC-stack) ----
      if (alive) {
        var sm = 1;
        if (time < C.venom.until) sm *= C.venom.mult;
        for (var pi = 0; pi < C.patches.length; pi++) {
          var PA = C.patches[pi];
          if (PA.slowMult && Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r) sm *= PA.slowMult;
        }
        if (sm < 0.5) sm = 0.5;                        // never slower than half
        if (sm < 1) { p.body.velocity.x *= sm; p.body.velocity.y *= sm; }
      }

      // ---- hazard patches: slow fields + optional damage ticks ----
      for (var pj = C.patches.length - 1; pj >= 0; pj--) {
        var PB = C.patches[pj];
        if (time >= PB.dieAt) { if (PB.obj) { try { PB.obj.destroy(); } catch (e) {} } C.patches.splice(pj, 1); continue; }
        if (!alive) continue;
        if (PB.dmg && Math.hypot(p.x - PB.x, p.y - PB.y) < PB.r && time >= (PB.nextTickAt || 0)) {
          PB.nextTickAt = time + PB.tickMs;
          Entities.hurtPlayer(scene, p, PB.dmg, time, PB.src || 'the dust', PB.fromBoss);
        }
      }

      // ---- armed-warn cleanup (a mob died mid-telegraph) ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      WS._wrap(scene, C);
      WS._runZones(scene, C, time);
      WS._runLanes(scene, C, time);
    },

    // ------------------------------------------- HIGH NOON machinery -------
    _startNoon: function (scene, C, time, cfg) {
      var N = C.noon, p = scene.player;
      // white-hot flash
      var fg = scene.add.rectangle(scene.cameras.main.midPoint.x, scene.cameras.main.midPoint.y,
        scene.scale.width * 2, scene.scale.height * 2, 0xffffff, 0.45).setScrollFactor(0).setDepth(40);
      scene.tweens.add({ targets: fg, alpha: 0, duration: 500, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
      try { AUDIO.play('noonbell'); } catch (e) {} try { AUDIO.play('freezesting'); } catch (e) {}
      scene.banner('HIGH NOON — EVERYBODY DRAWS\nthe street freezes... move on the last toll', '#e8cc9a');
      // gather ARMED mobs (all but tumbleweed + dust devil), nearest first
      var armed = [];
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && m.mob && !m.mob.def.noonSkip) armed.push(m);
      });
      armed.sort(function (a, b) {
        return (Math.hypot(a.x - p.x, a.y - p.y)) - (Math.hypot(b.x - p.x, b.y - p.y));
      });
      armed = armed.slice(0, cfg.laneCap);
      N.lanes = armed.map(function (m) {
        var ang = Math.atan2(p.y - m.y, p.x - m.x);
        var x1 = m.x + Math.cos(ang) * cfg.laneLen, y1 = m.y + Math.sin(ang) * cfg.laneLen;
        var gs = WS._laneWarn(scene, C, m.x, m.y, x1, y1, cfg.laneHalf, LANE_ENV);
        return { m: m, x0: m.x, y0: m.y, x1: x1, y1: y1, gs: gs, half: cfg.laneHalf };
      });
      N.freeze = true;
      N.tolls = [];
      for (var i = 0; i < cfg.tollCount; i++) N.tolls.push(time + cfg.warnMs + i * cfg.tollGapMs);
      N.fireAt = N.tolls[N.tolls.length - 1];
      N.tollIdx = 0;
      N.phase = 'warn';
    },
    _fireNoon: function (scene, C, time, cfg) {
      var N = C.noon, p = scene.player, alive = p.state.alive;
      for (var i = 0; i < N.lanes.length; i++) {
        var L = N.lanes[i];
        (L.gs || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(L.half * 2, LANE_FIRE, 0.55); fg.lineBetween(L.x0, L.y0, L.x1, L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (f) { return function () { try { f.destroy(); } catch (e) {} }; })(fg) });
        var inLane = alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < L.half;
        if (inLane) {
          try { AUDIO.play('lanefire'); } catch (e) {}
          Entities.hurtPlayer(scene, p, cfg.laneDmg, time, 'a noon shot');   // env source (not fromBoss)
        } else {
          // DODGED → the lane fires BACK at its shooter (env-credited)
          try { AUDIO.play('returnfire'); } catch (e) {}
          if (L.m && L.m.active) { scene.burst(L.m.x, L.m.y, 8, LANE_FIRE); scene.killMobCredited(L.m); }
        }
      }
      scene.cameras.main.shake(140, 0.006);
      N.lanes = [];
      N.freeze = false;
      // WIND SHIFT — re-roll the wind → tumbleweeds change roll direction
      if (cfg.windShift) N.windIdx = (N.windIdx + 1) % WIND.length;
      N.phase = 'idle';
      N.nextAt = time + cfg.cycleMs;
    },

    // --------------------------------------------- NOON EXPRESS (train) ----
    _updateTrain: function (scene, C, time, delta, cfg) {
      var T = C.train, WW = scene.worldW, HH = scene.worldH, p = scene.player;
      if (!T.nextAt) T.nextAt = time + cfg.firstDelayMs;
      if (scene.hitstopActive) return;                 // the train freezes with the world
      if (T.phase === 'idle') {
        if (T.nextAt !== Infinity && time >= T.nextAt && !scene.scanning) {
          // never launch during a noon freeze (one death sentence at a time)
          if (C.noon.freeze) { T.nextAt = time + 1500; return; }
          T.dir = SIM.rng() < 0.5 ? 1 : -1;
          T.warnUntil = time + cfg.warnMs;
          T.phase = 'warn';
          T.warnG = scene.add.graphics().setDepth(3);
          T.warnG.fillStyle(0xf8d878, 0.14); T.warnG.fillRect(C.railCx - C.railHalf, 0, C.railHalf * 2, HH);
          try { AUDIO.play('trainwhistle'); } catch (e) {}
          scene.banner('THE NOON EXPRESS\nwhistle down the line — off the tracks!', '#f8d878');
        }
        return;
      }
      if (T.phase === 'warn') {
        // smoke-plume pulse on the strip
        if (time >= T.warnUntil) WS._launchTrain(scene, C, time, cfg);
        return;
      }
      if (T.phase === 'pass') {
        T.headY += T.dir * cfg.speed * (delta / 1000);
        // move car sprites
        for (var i = 0; i < T.cars.length; i++) {
          var car = T.cars[i];
          car.y = T.headY - T.dir * i * car._carLen;
          car.spr.setPosition(C.railCx, ((car.y % HH) + HH) % HH);
        }
        // lethal band on the rail bed only, wrap-aware
        var band0 = Math.min(T.headY, T.headY - T.dir * T.len);
        var band1 = Math.max(T.headY, T.headY - T.dir * T.len);
        if (p.state.alive && Math.abs(p.x - C.railCx) < C.railHalf) {
          var inBand = function (yy) { return yy >= band0 && yy <= band1; };
          if (inBand(p.y) || inBand(p.y + HH) || inBand(p.y - HH)) {
            Entities.hurtPlayer(scene, p, 999, time, 'the Noon Express');   // instakill on the tracks
          }
        }
        // it mows MOBS on the rail too (env-credited)
        scene.mobs.children.iterate(function (m) {
          if (!m || !m.active || Math.abs(m.x - C.railCx) >= C.railHalf) return;
          var y = m.y;
          if ((y >= band0 && y <= band1) || (y + HH >= band0 && y + HH <= band1) || (y - HH >= band0 && y - HH <= band1))
            scene.killMobCredited(m);
        });
        if ((time % 220) < 30) { try { AUDIO.play('trainrumble'); } catch (e) {} }
        if (time >= T.passUntil) WS._clearTrain(scene, C, time, cfg);
        return;
      }
    },
    _launchTrain: function (scene, C, time, cfg) {
      var T = C.train, HH = scene.worldH;
      if (T.warnG) { try { T.warnG.destroy(); } catch (e) {} T.warnG = null; }
      var carLen = Math.round(HH / 9), nCars = cfg.cars;
      T.len = carLen * nCars;
      T.headY = T.dir > 0 ? -8 : HH + T.len + 8;         // enter from the near edge
      T.cars = [];
      var useSpr = scene.textures.exists('loco') && scene.textures.exists('carBox0');
      for (var i = 0; i < nCars; i++) {
        var key = useSpr ? (i === 0 ? 'loco' : 'carBox0') : null;
        var spr;
        if (useSpr) {
          spr = scene.add.sprite(C.railCx, 0, key).setDepth(8).setAngle(90).setTint(0xd8bc8a);
          var srcH = scene.textures.get(key).getSourceImage().height;   // rotated: height → along-rail
          spr.setScale((C.railHalf * 2.1) / srcH, carLen / scene.textures.get(key).getSourceImage().width);
        } else {
          spr = scene.add.rectangle(C.railCx, 0, C.railHalf * 2, carLen - 4, i === 0 ? 0x8a7c64 : 0xb0a078).setStrokeStyle(2, 0x34281c).setDepth(8);
        }
        T.cars.push({ spr: spr, y: 0, _carLen: carLen });
      }
      T.passUntil = time + cfg.passMs;
      T.phase = 'pass';
      try { AUDIO.play('trainrumble'); } catch (e) {}
    },
    _clearTrain: function (scene, C, time, cfg) {
      var T = C.train;
      T.cars.forEach(function (c) { try { c.spr.destroy(); } catch (e) {} });
      T.cars = [];
      T.phase = 'idle';
      T.nextAt = time + cfg.cycleMs;
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._west; if (!C) return;
      var N = C.noon;
      if (N.nextAt && N.nextAt !== Infinity) N.nextAt += dt;
      if (N.fireAt) N.fireAt += dt;
      for (var i = 0; i < N.tolls.length; i++) N.tolls[i] += dt;
      N.lanes.forEach(function (L) { /* lanes are position-based, no clocks */ });
      var T = C.train;
      if (T.nextAt && T.nextAt !== Infinity) T.nextAt += dt;
      if (T.warnUntil) T.warnUntil += dt;
      if (T.passUntil) T.passUntil += dt;
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.patches.forEach(function (PA) { if (PA.dieAt !== Infinity) PA.dieAt += dt; if (PA.nextTickAt) PA.nextTickAt += dt; });
      if (C.venom.until) C.venom.until += dt;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        // M7k AUDIT fix: lungeUntil/nextLungeAt removed — core's dismissScouter
        // shifts both for every mob already (double shift).
        ['lungeAt', 'nextAimAt', 'shotAt', 'nextLobAt',
         'nextStrikeAt', 'strikeAt', 'venomUntil', 'nextDiveAt', 'diveAt', 'diveUntil',
         'nextSurfaceAt', 'surfaceAt', 'stingAt', 'nextWanderAt', 'nextPatchAt'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextSigAt', 'busyUntil', 'rootUntil', 'ventedUntil', 'slideUntil', 'posseAt'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
        if (bs.fan && bs.fan.fireAt) bs.fan.fireAt += dt;
        if (bs.rico && bs.rico.fireAt) bs.rico.fireAt += dt;
        if (bs.sig) {
          if (bs.sig.lockAt) bs.sig.lockAt += dt;
          if (bs.sig.bangAt) bs.sig.bangAt += dt;
          if (bs.sig.fireAt) bs.sig.fireAt += dt;
          if (bs.sig.tolls) for (var t = 0; t < bs.sig.tolls.length; t++) bs.sig.tolls[t] += dt;
        }
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._west; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } });
      C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      C.lanes = [];
      for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} } }
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} });
      C.mobWarns = [];
      // stop any in-flight noon lanes
      C.noon.lanes.forEach(function (L) { (L.gs || []).forEach(function (g) { try { g.destroy(); } catch (e) {} }); });
      C.noon.lanes = []; C.noon.freeze = false; C.noon.phase = 'idle';
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: the Sheriff killed MID-VERB left telegraph graphics
    // painted forever (the chalk duel circle, RICOCHET lane warns, HIGH NOON /
    // CLOCK STRIKES 13 signature lanes). Central onBossDown hook.
    bossCleanup: function (scene, boss) {
      var C = scene._west; if (!C) return;
      if (C.chalkG) { try { C.chalkG.destroy(); } catch (e) {} C.chalkG = null; }
      C.bossArmed = false;
      var bs = boss && boss.boss;
      if (!bs) return;
      if (bs.rico && bs.rico.lanes) {
        bs.rico.lanes.forEach(function (L) { (L.gs || []).forEach(function (g) { try { g.destroy(); } catch (e) {} }); });
        bs.rico = null;
      }
      if (bs.sig) {
        if (bs.sig.gs) bs.sig.gs.forEach(function (g) { try { g.destroy(); } catch (e) {} });
        if (bs.sig.lanes) bs.sig.lanes.forEach(function (L) { (L.gs || []).forEach(function (g) { try { g.destroy(); } catch (e) {} }); });
        bs.sig = null;
      }
      bs.fan = null;
    },

    // ================================================== BOSS ARRIVAL =======
    // The jail's IRON DOORS blast off → he steps through the dust → title
    // card → without looking he SHOOTS THE HORSE at the trough (it drops; no
    // player damage) → the chalk duel circle draws → r.scanning.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._west, self = scene;
      var A = C.arena;
      C.noon.nextAt = Infinity;                          // the town holds its breath
      C.train.nextAt = Infinity;
      // player at the south edge of the duel ground, camera on the square
      scene.player.setPosition(A.x, A.y + A.r - 24);
      scene.cameras.main.centerOn(A.x, A.y);
      // JAIL is E of the square; the iron doors blast off toward the square
      var doorX = 0.628 * scene.worldW, doorY = 0.40 * scene.worldH;
      scene.cameras.main.shake(300, 0.01);
      try { AUDIO.play('doorsblast'); } catch (e) {}
      scene.burst(doorX, doorY, 26, 0x9aa0aa);           // iron debris
      // two door leaves fly off
      [-1, 1].forEach(function (s) {
        var leaf = scene.add.rectangle(doorX, doorY, 10, 26, 0x5a5e66).setStrokeStyle(1, 0x26282e).setDepth(7);
        scene.tweens.add({ targets: leaf, x: doorX + s * 90, y: doorY + 40, angle: s * 200, alpha: 0, duration: 700,
          onComplete: function () { try { leaf.destroy(); } catch (e) {} } });
      });
      scene.banner('THE OUTLAW SHERIFF\n' + '"THIS TOWN AINT BIG ENOUGH FOR THE TWO OF US."', '#d05a4a');

      scene.time.delayedCall(def.entranceMs * 0.42, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, doorX, doorY);
        if (self.boss) {
          var b = self.boss;
          b.setAlpha(0);
          self.tweens.add({ targets: b, alpha: 1, x: A.x + A.r * 0.5, y: A.y - A.r * 0.3, duration: 520, ease: 'Quad.Out' });
        }
        // he SHOOTS THE HORSE (pure villainy — no player damage)
        if (C.horse && !C.horseDead) {
          C.horseDead = true;
          try { AUDIO.play('lockshot'); } catch (e) {}
          try { AUDIO.play('horsewhinny'); } catch (e) {}
          self.burst(C.horse.x, C.horse.y - 20, 10, 0x8a1622);
          self.tweens.add({ targets: C.horse, angle: 92, y: C.horse.y + 16, alpha: 0.4, duration: 600 });
        }
        // the chalk duel circle draws around the square
        C.chalkG = scene.add.graphics().setDepth(-19.5);
        C.chalkG.lineStyle(3, CHALK, 0.85); C.chalkG.strokeCircle(A.x, A.y, A.r * 1.02);
        C.chalkG.lineStyle(2, 0x601812, 0.6); C.chalkG.strokeCircle(A.x, A.y, A.r * 0.82);
        C.bossArmed = true;
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._west;
      if (!bs._wInit) {
        bs._wInit = true;
        bs.verbIdx = 0; bs.phase = 1;
        bs.nextVerbAt = time + 2600;
        bs.nextSigAt = time + PT.sigFirstMs;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.slideUntil = 0;
        bs.ventedUntil = 0; bs.ventDmgMult = PT.highNoon.ventDmgMult;
        bs.posseAt = 0; bs.fan = null; bs.rico = null; bs.sig = null;
      }

      // ---- PHASE TWO (<50%): the WHITE HAT burns off (ONCE), red glare doubles
      if (bs.phase === 1 && bs.hp <= bs.maxHp * PT.phase2Pct) {
        bs.phase = 2;
        b.setTexture('westSheriffP2Hi');                 // hatless art swap
        scene.burst(b.x, b.y - 30, 18, 0xf8d878);        // the hat burns off
        scene.cameras.main.shake(160, 0.007);
        try { AUDIO.play('hatburn'); } catch (e) {}
        scene.banner('THE WHITE HAT BURNS OFF\nno more pretending — THE OUTLAW', '#d05a4a');
        bs.posseAt = time + 1200;                        // POSSE CALL — once, soon
      }

      // ---- SIGNATURE state machine (owns the moment; runs every frame) -----
      if (bs.sig) { WS._runSig(scene, b, player, time); return; }

      // ---- FAN / RICOCHET pending fires (clock-driven, no delayedCall) -----
      if (bs.fan && time >= bs.fan.fireAt) { WS._fanFire(scene, b, time); }
      if (bs.rico && time >= bs.rico.fireAt) { WS._ricoFire(scene, b, player, time); }

      // ---- movement: dust-slide reposition / chase / root -----------------
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      else if (time < bs.slideUntil) { /* slide velocity persists from _slide */ }
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 150) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      // ---- POSSE CALL (P2, once) ------------------------------------------
      if (bs.phase === 2 && bs.posseAt && time >= bs.posseAt) {
        bs.posseAt = 0;
        WS._posse(scene, b, time);
        bs.busyUntil = time + 800;
        return;
      }

      // ---- SIGNATURES on their own clock ----------------------------------
      if (time >= bs.nextSigAt) {
        bs.nextSigAt = time + PT.sigEveryMs;
        if (bs.phase === 2) WS._thirteen(scene, b, player, time);
        else WS._highNoon(scene, b, player, time);
        return;
      }

      // ---- ordinary verbs (telegraphed, no radial/stream spam) ------------
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs;
        WS._slide(scene, b, player, time);               // dust-trail reposition
        var v = ['fan', 'rico', 'tnt'][bs.verbIdx % 3];
        bs.verbIdx++;
        if (v === 'fan') WS._fanHammer(scene, b, player, time);
        else if (v === 'rico') WS._ricochet(scene, b, player, time);
        else WS._dynamiteDeputy(scene, b, player, time);
      }
    },

    _slide: function (scene, b, player, time) {
      var PT = b.boss.def.patterns;
      var a = Math.atan2(b.y - player.y, b.x - player.x) + (SIM.rng() - 0.5);
      b.setVelocity(Math.cos(a) * PT.slideSpeed, Math.sin(a) * PT.slideSpeed);
      b.boss.slideUntil = time + PT.slideMs;
      scene.burst(b.x, b.y + 16, 5, 0xc8a878);
    },

    // FAN THE HAMMER — cone paints → 5 shots fanned (P2 = TWIN cones).
    _fanHammer: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.fanHammer;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var twin = b.boss.phase === 2;
      var cones = twin ? [ang - 0.55, ang + 0.55] : [ang];
      cones.forEach(function (ca) {
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(BOSS_TINT, 0.14); g.lineStyle(2, LANE_FIRE, 0.85);
        g.slice(b.x, b.y, cfg.range, ca - cfg.halfRad, ca + cfg.halfRad, false); g.fillPath(); g.strokePath();
        scene.tweens.add({ targets: g, alpha: 0, duration: cfg.warnMs + 200, onComplete: function () { try { g.destroy(); } catch (e) {} } });
      });
      b.boss.fan = { fireAt: time + cfg.warnMs, cones: cones };
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('FAN THE HAMMER\nduck the cone SIDEWAYS', '#f8d878');
    },
    _fanFire: function (scene, b, time) {
      var cfg = b.boss.def.patterns.fanHammer, fan = b.boss.fan;
      b.boss.fan = null;
      var n = cfg.shots, spread = Phaser.Math.DegToRad(cfg.spreadDeg);
      fan.cones.forEach(function (ca) {
        for (var i = 0; i < n; i++) {
          var a = ca + spread * ((i - (n - 1) / 2) / (n - 1));
          var s = Entities.fireProjectile(scene, scene.enemyShots, b.x, b.y, a, cfg.projSpeed, cfg.dmg, 2600, 'orbShot', false, b.boss.def.name);
          if (s) { s.proj.fromBoss = true; s.setTint(BOSS_TINT); }
        }
      });
      try { AUDIO.play('fanhammer'); } catch (e) {}
      scene.cameras.main.shake(120, 0.006);
    },

    // RICOCHET — bent lanes that bounce off the fixed building walls.
    _ricochet: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.ricochet, C = scene._west;
      var lanes = [];
      for (var i = 0; i < cfg.lanes; i++) {
        var ang = Math.atan2(player.y - b.y, player.x - b.x) + (i - (cfg.lanes - 1) / 2) * 0.5;
        var dirX = Math.cos(ang), dirY = Math.sin(ang);
        // pick the wall the ray heads toward; reflect the x-component off it
        var wallX = dirX >= 0 ? C.jailLeftX : C.saloonRightX;
        var t = Math.abs(dirX) > 1e-3 ? (wallX - b.x) / dirX : cfg.len;
        if (t < 40 || t > cfg.len) t = cfg.len * 0.5;    // fallback bend midway
        var mx = b.x + dirX * t, my = b.y + dirY * t;
        var rem = cfg.len - t;
        var ex = mx - dirX * rem, ey = my + dirY * rem;  // x reflected (bounce)
        var g1 = WS._laneWarn(scene, C, b.x, b.y, mx, my, cfg.half, BOSS_TINT);
        var g2 = WS._laneWarn(scene, C, mx, my, ex, ey, cfg.half, BOSS_TINT);
        lanes.push({ segs: [[b.x, b.y, mx, my], [mx, my, ex, ey]], gs: g1.concat(g2), half: cfg.half });
      }
      b.boss.rico = { fireAt: time + cfg.warnMs, lanes: lanes };
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('RICOCHET\nthe lanes BEND off the walls — read the bounce', '#f8d878');
    },
    _ricoFire: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.ricochet, rico = b.boss.rico, p = scene.player;
      b.boss.rico = null;
      var hit = false;
      rico.lanes.forEach(function (L) {
        L.gs.forEach(function (g) { try { g.destroy(); } catch (e) {} });
        L.segs.forEach(function (sg) {
          var fg = scene.add.graphics().setDepth(9);
          fg.lineStyle(L.half * 2, BOSS_TINT, 0.5); fg.lineBetween(sg[0], sg[1], sg[2], sg[3]);
          scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (f) { return function () { try { f.destroy(); } catch (e) {} }; })(fg) });
          if (p.state.alive && dist2seg(p.x, p.y, sg[0], sg[1], sg[2], sg[3]) < L.half) hit = true;
        });
      });
      try { AUDIO.play('ricochettwang'); } catch (e) {}
      if (hit) Entities.hurtPlayer(scene, p, cfg.dmg, time, "the Sheriff's ricochet", true);
    },

    // DYNAMITE DEPUTY — 3 chained warned blast circles down the street.
    _dynamiteDeputy: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.dynamiteDeputy;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      for (var i = 0; i < cfg.count; i++) {
        var x = b.x + Math.cos(ang) * cfg.stride * (i + 1);
        var y = b.y + Math.sin(ang) * cfg.stride * (i + 1);
        WS._zone(scene, scene._west, x, y, cfg.radius, cfg.warnMs + i * cfg.gapMs, cfg.dmg,
          "the Sheriff's dynamite", true, time);
      }
      try { AUDIO.play('tntfuse'); } catch (e) {}
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 200;
      scene.banner('DYNAMITE DEPUTY\nfuses down the street — run PAST them', '#f8d878');
    },

    // POSSE CALL — 3 gang rustlers vault the jail rubble (ONCE per phase).
    _posse: function (scene, b, time) {
      var cfg = b.boss.def.patterns.posse, WW = scene.worldW, HH = scene.worldH;
      for (var i = 0; i < cfg.rustlers; i++) {
        scene.queueSpawn({ key: 'gangRustler', bossWave: true,
          x: 0.628 * WW + (SIM.rng() * 2 - 1) * 40, y: 0.40 * HH + SIM.rng() * 30 });
      }
      try { AUDIO.play('possewhistle'); } catch (e) {}
      scene.banner('POSSE CALL\nthree rustlers vault the jail rubble', '#d05a4a');
    },

    // SIGNATURE — HIGH NOON (P1): tolls → a tracking kill-shot lane → LOCK on
    // the last chime → BANG; sidestep the locked lane → WINDED (vented ×1.5).
    _highNoon: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.highNoon, C = scene._west;
      var tolls = [];
      for (var i = 0; i < cfg.tollCount; i++) tolls.push(time + (i + 1) * cfg.tollGapMs);
      var lockAt = tolls[tolls.length - 1];
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var lane = { x0: b.x, y0: b.y, x1: b.x + Math.cos(ang) * cfg.len, y1: b.y + Math.sin(ang) * cfg.len, ang: ang };
      b.boss.sig = { kind: 'noon', tolls: tolls, tollIdx: 0, lockAt: lockAt, bangAt: lockAt + cfg.lockMs,
                     tracking: true, done: false, lane: lane, gs: null, cfg: cfg };
      b.boss.busyUntil = lockAt + cfg.lockMs + 400;
      b.boss.rootUntil = b.boss.busyUntil;
      if (C.chalkG) { C.chalkG.lineStyle(2, LANE_FIRE, 0.6); C.chalkG.strokeCircle(C.arena.x, C.arena.y, C.arena.r * 0.9); }
      try { AUDIO.play('noonbell'); } catch (e) {}
      scene.banner('HIGH NOON\nhe holsters... move on the LAST chime', '#f8d878');
    },
    // SIGNATURE — CLOCK STRIKES 13 (P2): 5-6 crisscross lanes + his locked
    // shot, all fire on the 13th toll → weave the gaps → longest vent.
    _thirteen: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.thirteen, C = scene._west, A = C.arena;
      var lanes = [];
      for (var i = 0; i < cfg.laneCount; i++) {
        var a = (i / cfg.laneCount) * Math.PI + 0.3;
        var x0 = A.x - Math.cos(a) * cfg.len, y0 = A.y - Math.sin(a) * cfg.len;
        var x1 = A.x + Math.cos(a) * cfg.len, y1 = A.y + Math.sin(a) * cfg.len;
        lanes.push({ x0: x0, y0: y0, x1: x1, y1: y1, gs: WS._laneWarn(scene, C, x0, y0, x1, y1, cfg.half, BOSS_TINT), half: cfg.half });
      }
      // his own locked shot toward the player
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var bx = b.x + Math.cos(ang) * cfg.len, by = b.y + Math.sin(ang) * cfg.len;
      lanes.push({ x0: b.x, y0: b.y, x1: bx, y1: by, gs: WS._laneWarn(scene, C, b.x, b.y, bx, by, cfg.half, LANE_FIRE), half: cfg.half });
      b.boss.sig = { kind: '13', fireAt: time + cfg.warnMs, done: false, lanes: lanes, cfg: cfg };
      b.boss.busyUntil = time + cfg.warnMs + 500;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.cameras.main.shake(200, 0.004);
      try { AUDIO.play('noonbell'); } catch (e) {}
      scene.banner('CLOCK STRIKES 13\nthe whole ground draws — weave the gaps', '#d05a4a');
    },
    _runSig: function (scene, b, player, time) {
      var bs = b.boss, S = bs.sig, C = scene._west, p = scene.player;
      b.setVelocity(0, 0);
      if (S.kind === 'noon') {
        var cfg = S.cfg;
        while (S.tollIdx < S.tolls.length && time >= S.tolls[S.tollIdx]) { S.tollIdx++; try { AUDIO.play('duelchime'); } catch (e) {} }
        if (S.tracking) {
          if (time < S.lockAt) {
            // the kill-shot lane TRACKS the player
            var ang = Math.atan2(player.y - b.y, player.x - b.x);
            S.lane.ang = ang; S.lane.x1 = b.x + Math.cos(ang) * cfg.len; S.lane.y1 = b.y + Math.sin(ang) * cfg.len;
          } else {
            S.tracking = false;                          // LOCK on the last chime
          }
          if (S.gs) S.gs.forEach(function (g) { try { g.destroy(); } catch (e) {} });
          S.gs = WS._laneWarn(scene, C, b.x, b.y, S.lane.x1, S.lane.y1, cfg.half, S.tracking ? LANE_ENV : LANE_FIRE);
        }
        if (!S.done && time >= S.bangAt) {
          S.done = true;
          if (S.gs) S.gs.forEach(function (g) { try { g.destroy(); } catch (e) {} });
          var fg = scene.add.graphics().setDepth(9);
          fg.lineStyle(cfg.half * 2, LANE_FIRE, 0.6); fg.lineBetween(S.lane.x0, S.lane.y0, S.lane.x1, S.lane.y1);
          scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          try { AUDIO.play('lockshot'); } catch (e) {}
          scene.cameras.main.shake(160, 0.008);
          if (p.state.alive && dist2seg(p.x, p.y, S.lane.x0, S.lane.y0, S.lane.x1, S.lane.y1) < cfg.half) {
            Entities.hurtPlayer(scene, p, cfg.dmg, time, "the Sheriff's kill-shot", true);
          } else {
            WS._vent(scene, b, time, cfg.ventMs, cfg.ventDmgMult, 'HE MISSES — re-holstering\nWINDED — unload');
          }
          bs.sig = null;
        }
        return;
      }
      if (S.kind === '13') {
        var cfg13 = S.cfg;
        if (!S.done && time >= S.fireAt) {
          S.done = true;
          var hit = false;
          S.lanes.forEach(function (L) {
            (L.gs || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
            var fg2 = scene.add.graphics().setDepth(9);
            fg2.lineStyle(L.half * 2, LANE_FIRE, 0.5); fg2.lineBetween(L.x0, L.y0, L.x1, L.y1);
            scene.tweens.add({ targets: fg2, alpha: 0, duration: 260, onComplete: (function (f) { return function () { try { f.destroy(); } catch (e) {} }; })(fg2) });
            if (p.state.alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < L.half) hit = true;
          });
          try { AUDIO.play('lockshot'); } catch (e) {}
          scene.cameras.main.shake(220, 0.01);
          if (hit) Entities.hurtPlayer(scene, p, cfg13.dmg, time, 'the 13th toll', true);
          WS._vent(scene, b, time, cfg13.ventMs, cfg13.ventDmgMult, 'THE VOLLEY SPENT — he reloads\nLONG WINDED — unload everything');
          bs.sig = null;
        }
        return;
      }
    },
    _vent: function (scene, b, time, ventMs, mult, msg) {
      var bs = b.boss;
      bs.ventedUntil = time + ventMs;
      bs.ventDmgMult = mult;
      bs.rootUntil = time + ventMs;
      bs.busyUntil = time + ventMs;
      b.setTint(0xf8d878);
      (function (b2) { scene.time.delayedCall(ventMs, function () { if (b2.active) b2.clearTint(); }); })(b);
      scene.banner(msg, '#f8d878');
    },

    // =============================================== MOB VERBS (map-new) ===
    // GANG RUSTLER — knife-glint flash (~0.4s) → short lunge; fast, fragile.
    _rustler: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.rustlerCharge;   // M7k AUDIT fix: renamed def key (core ghoul-lunge collision)
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); m.mob._noWrap = false; }
        return true;
      }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 90) % 2 === 0 ? 0x9aa0aa : 0xffffff);     // knife glint
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs; m.mob._noWrap = true;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
        }
        return true;
      }
      if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLungeAt && d < cfg.range && player.state.alive) {
        m.mob.nextLungeAt = time + cfg.cooldownMs;
        m.mob.lungeAt = time + cfg.warnMs;
        return true;
      }
      return false;                                        // fall through to the generic chase
    },
    // SIX-GUN BANDIT — thin aim-line (~0.6s) → single crack shot; strafes.
    _bandit: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.aim;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (m.mob.shotAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.shotAt) {
          m.mob.shotAt = 0;
          if (m.mob._aimG) { m.mob._aimG.dead = true; m.mob._aimG = null; }
          var a = m.mob._aimAng;
          var s = Entities.fireProjectile(scene, scene.enemyShots, m.x, m.y, a, cfg.projSpeed, cfg.dmg, 2400, 'orbShot', false, 'a ' + m.mob.def.name);
          if (s) s.setTint(0x4e6a8a);
          try { AUDIO.play('lanefire'); } catch (e) {}
          m.mob.nextAimAt = time + cfg.cooldownMs;
        }
        return true;
      }
      if (!m.mob.nextAimAt) m.mob.nextAimAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.6);
      if (time >= m.mob.nextAimAt && d < cfg.range && player.state.alive) {
        m.mob.shotAt = time + cfg.warnMs;
        m.mob._aimAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = WS._laneWarn(scene, C, m.x, m.y, m.x + Math.cos(m.mob._aimAng) * cfg.range, m.y + Math.sin(m.mob._aimAng) * cfg.range, 4, LANE_ENV);
        m.mob._aimG = { m: m, g: g[0] };
        C.mobWarns.push(m.mob._aimG);
        for (var i = 1; i < g.length; i++) { try { g[i].destroy(); } catch (e) {} }
        return true;
      }
      // strafe: keep at mid range, circle the player
      var a2 = Math.atan2(player.y - m.y, player.x - m.x);
      if (d > cfg.range * 0.7) m.setVelocity(Math.cos(a2) * m.mob.def.spd, Math.sin(a2) * m.mob.def.spd);
      else m.setVelocity(Math.cos(a2 + 1.57) * cfg.strafeSpeed, Math.sin(a2 + 1.57) * cfg.strafeSpeed);
      return true;
    },
    // DYNAMITE DAN — TNT lob onto a warned blast circle; keeps distance.
    _dan: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.tnt;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.nextLobAt) m.mob.nextLobAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.6);
      if (time >= m.mob.nextLobAt && d < cfg.range && player.state.alive) {
        m.mob.nextLobAt = time + cfg.cooldownMs;
        WS._zone(scene, C, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, "Dynamite Dan's TNT", false, time);
        scene.burst(m.x, m.y - 14, 6, 0xf8d878);
        try { AUDIO.play('tntfuse'); } catch (e) {}
      }
      // keep distance
      var a = Math.atan2(player.y - m.y, player.x - m.x);
      if (d < cfg.keepDist) m.setVelocity(-Math.cos(a) * m.mob.def.spd, -Math.sin(a) * m.mob.def.spd);
      else if (d > cfg.range) m.setVelocity(Math.cos(a) * m.mob.def.spd, Math.sin(a) * m.mob.def.spd);
      else m.setVelocity(0, 0);
      return true;
    },
    // RATTLESNAKE — rattle + shake (~0.8s) → cone strike + brief venom slow.
    _snake: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.strike;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      if (m.mob.strikeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xe0a832 : 0xffffff);
        if (time >= m.mob.strikeAt) {
          m.mob.strikeAt = 0; m.clearTint();
          // M7k AUDIT fix: retire the cone telegraph on fire (bandit pattern) —
          // it used to stay painted until the snake died.
          if (m.mob._strikeG) { m.mob._strikeG.dead = true; m.mob._strikeG = null; }
          try { AUDIO.play('snakerattle'); } catch (e) {}
          var ang = m.mob._strikeAng;
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y);
            var pa = Math.atan2(player.y - m.y, player.x - m.x);
            var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
            if (pd < cfg.reach && Math.abs(diff) < cfg.halfRad) {
              Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Rattlesnake's strike");
              WS._venom(C, time, cfg.venomMs, cfg.venomMult);
            }
          }
          m.mob.nextStrikeAt = time + cfg.cooldownMs;
        }
        return true;
      }
      if (!m.mob.nextStrikeAt) m.mob.nextStrikeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextStrikeAt && d < cfg.range && player.state.alive) {
        m.mob.strikeAt = time + cfg.warnMs;
        m.mob._strikeAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xe0a832, 0.14); g.lineStyle(2, LANE_FIRE, 0.8);
        g.slice(m.x, m.y, cfg.reach, m.mob._strikeAng - cfg.halfRad, m.mob._strikeAng + cfg.halfRad, false); g.fillPath(); g.strokePath();
        m.mob._strikeG = { m: m, g: g };
        C.mobWarns.push(m.mob._strikeG);
        return true;
      }
      return false;                                        // core chase otherwise (has contact dmg)
    },
    // VULTURE — circles; a shadow marks the dive line → swoop along it.
    _vulture: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.dive;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      if (m.mob.diveUntil) {
        if (time >= m.mob.diveUntil) { m.mob.diveUntil = 0; m.mob._noWrap = false; m.mob.nextDiveAt = time + cfg.cooldownMs; }
        return true;                                       // velocity persists along the dive
      }
      if (m.mob.diveAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0x3a2e28 : 0xffffff);
        if (time >= m.mob.diveAt) {
          m.mob.diveAt = 0; m.clearTint();
          if (m.mob._diveG) { m.mob._diveG.dead = true; m.mob._diveG = null; }
          var a = m.mob._diveAng;
          m.mob.diveUntil = time + cfg.diveMs; m.mob._noWrap = true;
          m.setVelocity(Math.cos(a) * cfg.diveSpeed, Math.sin(a) * cfg.diveSpeed);
          try { AUDIO.play('vulturescreech'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextDiveAt) m.mob.nextDiveAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextDiveAt && player.state.alive) {
        m.mob.diveAt = time + cfg.warnMs;
        m.mob._diveAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = WS._laneWarn(scene, C, m.x, m.y, m.x + Math.cos(m.mob._diveAng) * cfg.orbitR * 2.4, m.y + Math.sin(m.mob._diveAng) * cfg.orbitR * 2.4, 10, 0x3a2e28);
        m.mob._diveG = { m: m, g: g[0] };
        C.mobWarns.push(m.mob._diveG);
        for (var i = 1; i < g.length; i++) { try { g[i].destroy(); } catch (e) {} }
        return true;
      }
      // orbit the player
      if (m.mob._orbit == null) m.mob._orbit = SIM.rng() * 6.28;
      m.mob._orbit += cfg.orbitSpeed * 0.016;
      var tx = player.x + Math.cos(m.mob._orbit) * cfg.orbitR, ty = player.y + Math.sin(m.mob._orbit) * cfg.orbitR;
      var oa = Math.atan2(ty - m.y, tx - m.x);
      m.setVelocity(Math.cos(oa) * m.mob.def.spd, Math.sin(oa) * m.mob.def.spd);
      return true;
    },
    // TUMBLEWEED — rolls with the wind (re-rolled each noon); shootable pops.
    _tumble: function (scene, m, player, time) {
      var C = scene._west;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      // despawn if it wanders into the boss's chalk ring (never block the arena)
      if (scene.boss && scene.boss.active) {
        var A = C.arena;
        if (Math.hypot(m.x - A.x, m.y - A.y) < A.r) { scene.killMobCredited(m); return true; }
      }
      var wind = WIND[C.noon.windIdx];
      var wl = Math.hypot(wind.x, wind.y) || 1;
      m.setVelocity(wind.x / wl * m.mob.def.roll.speed, wind.y / wl * m.mob.def.roll.speed);
      return true;                                         // contact damage rides on def.chase
    },
    // SCORPION — burrows (untargetable but VISIBLE mound) → surfaces on a
    // clock → warned sting circle where it pops up.
    _scorpion: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.burrow;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      if (m.mob._surf == null) { m.mob._surf = false; m.mob.nextSurfaceAt = time + cfg.surfaceMs; m.body.enable = false; m.setTint(0xc8a878); }
      if (!m.mob._surf) {
        // burrowed: untargetable (body disabled) — crawl toward the player
        var a = Math.atan2(player.y - m.y, player.x - m.x);
        var step = cfg.crawlSpeed * 0.016;
        m.x += Math.cos(a) * step; m.y += Math.sin(a) * step;
        if (time >= m.mob.nextSurfaceAt) {
          m.mob._surf = true; m.body.reset(m.x, m.y); m.body.enable = true; m.clearTint();
          m.mob.stingAt = time + cfg.stingWarnMs;
          var g = scene.add.circle(m.x, m.y, cfg.stingRange, 0xe0a832, 0.14).setStrokeStyle(2, LANE_FIRE, 0.85).setDepth(2).setScale(0.4);
          scene.tweens.add({ targets: g, scale: 1, duration: cfg.stingWarnMs });
          m.mob._stingG = { m: m, g: g };
          C.mobWarns.push(m.mob._stingG);
          try { AUDIO.play('scorpionscrape'); } catch (e) {}
        }
        return true;
      }
      // surfaced
      m.setVelocity(0, 0);
      if (m.mob.stingAt && time >= m.mob.stingAt) {
        m.mob.stingAt = 0;
        if (m.mob._stingG) { m.mob._stingG.dead = true; m.mob._stingG = null; }
        scene.burst(m.x, m.y, 10, 0xe0a832);
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.stingRange) {
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Scorpion's sting");
          WS._venom(C, time, cfg.venomMs, cfg.venomMult);
        }
        // back underground
        m.mob._surf = false; m.body.enable = false; m.setTint(0xc8a878);
        m.mob.nextSurfaceAt = time + cfg.cooldownMs;
      }
      return true;
    },
    // DUST DEVIL — wandering whirlwind: pushes the player + deflects the
    // player's shots inside the whirl; leaves brief slow-swirl patches.
    _devil: function (scene, m, player, time) {
      var C = scene._west, cfg = m.mob.def.whirl;
      if (C.noon.freeze) { m.setVelocity(0, 0); return true; }
      // wander
      if (!m.mob.nextWanderAt || time >= m.mob.nextWanderAt) {
        m.mob.nextWanderAt = time + cfg.wanderMs;
        m.mob._wanderA = SIM.rng() * 6.28;
      }
      m.setVelocity(Math.cos(m.mob._wanderA) * cfg.wanderSpeed, Math.sin(m.mob._wanderA) * cfg.wanderSpeed);
      // push the player out of the whirl
      if (player.state.alive) {
        var d = Math.hypot(player.x - m.x, player.y - m.y);
        if (d < cfg.pushR && d > 1) {
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          player.body.velocity.x += Math.cos(a) * cfg.push;
          player.body.velocity.y += Math.sin(a) * cfg.push;
        }
      }
      // DEFLECT the player's shots inside the whirl (mob shots unaffected)
      if (scene.playerShots) scene.playerShots.children.iterate(function (s) {
        if (!s || !s.active) return;
        var dd = Math.hypot(s.x - m.x, s.y - m.y);
        if (dd < cfg.deflectR) {
          var sp = Math.hypot(s.body.velocity.x, s.body.velocity.y) || 1;
          var oa = Math.atan2(s.y - m.y, s.x - m.x);
          s.body.velocity.x = Math.cos(oa) * sp;             // fling it back outward
          s.body.velocity.y = Math.sin(oa) * sp;
        }
      });
      // leave a brief slow-swirl patch
      if (!m.mob.nextPatchAt) m.mob.nextPatchAt = time + cfg.patchEveryMs;
      if (time >= m.mob.nextPatchAt) {
        m.mob.nextPatchAt = time + cfg.patchEveryMs;
        var obj = scene.add.circle(m.x, m.y, cfg.patchR, 0xc8a878, 0.16).setDepth(1.2);
        C.patches.push({ x: m.x, y: m.y, r: cfg.patchR, dieAt: time + cfg.patchMs, obj: obj, slowMult: cfg.patchMult });
        try { AUDIO.play('devilwhoosh'); } catch (e) {}
      }
      return true;
    },
    _venom: function (C, time, ms, mult) {
      // brief slow; capped combined in update (CC-stack rule)
      // M7k AUDIT fix: expire the stale record BEFORE applying the new venom —
      // the old order set until first, so a stronger old mult never reset.
      if (C.venom.until <= time) C.venom.mult = 1;
      C.venom.until = Math.max(C.venom.until, time + ms);
      C.venom.mult = Math.min(C.venom.mult, mult);
    },

    // ================================================= INTERNAL HELPERS ====
    _wrap: function (scene, C) {
      var WW = scene.worldW, HH = scene.worldH;
      var wrap = function (o) {
        if (!o) return;
        var nx = o.x, ny = o.y, moved = false;
        if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
        if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
        if (!moved) return;
        if (o.body && o.body.enable && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && m.mob && !m.mob.bossWave && !m.mob._noWrap) wrap(m);
      });
    },
    // wrap-aware lane warn (rider/serpent lesson: warn both sides of the seam)
    _laneWarn: function (scene, C, x0, y0, x1, y1, half, tint) {
      var WW = scene.worldW, HH = scene.worldH, gs = [];
      var draw = function (ax, ay, bx, by) {
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(half * 2, tint, 0.16); g.lineBetween(ax, ay, bx, by);
        g.lineStyle(2, tint, 0.9); g.lineBetween(ax, ay, bx, by);
        gs.push(g);
      };
      draw(x0, y0, x1, y1);
      if (x1 < 0 || x1 >= WW) { var sx = x1 < 0 ? WW : -WW; draw(x0 + sx, y0, x1 + sx, y1); }
      if (y1 < 0 || y1 >= HH) { var sy = y1 < 0 ? HH : -HH; draw(x0, y0 + sy, x1, y1 + sy); }
      return gs;
    },
    _zone: function (scene, C, x, y, r, warnMs, dmg, src, fromBoss, time) {
      var tint = fromBoss ? BOSS_TINT : LANE_ENV;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, LANE_FIRE, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, ring: ring };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, C, time) {
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 12, z.fromBoss ? BOSS_TINT : LANE_FIRE);
        scene.cameras.main.shake(100, 0.005);
        try { AUDIO.play('tntboom'); } catch (e) {}
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
      }
    },
    _runLanes: function (scene, C, time) {
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        if (scene.player.state.alive && dist2seg(scene.player.x, scene.player.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, scene.player, l.dmg, time, l.src, l.fromBoss);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = WS;
  root.WEST_SCENE = WS;
})(typeof window !== 'undefined' ? window : this);
