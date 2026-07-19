// ============================================================================
// game/js/maps/prehistoria/scene.js — PREHISTORIA (INSECT re-theme 2026-07-19).
// Lost-world plateau of MEGAFAUNA BUGS. Scene layout UNCHANGED (fern meadows NW ·
// jungle W · volcano quarter NE with the ARENA on the rim · SKULL ROCK center ·
// GAME TRAIL + RIVER wrap W-E · tar/bone S · geysers SE · roost E). Toroidal.
// SIGNATURE CYCLE: the ARMY ANT MARCH — a telegraphed MOVING column sweeps the
// plateau; step out of its path. BOSS: THE PRIMORDIAL METAMORPH digs OUT of the
// ground as a WORM (5-beat dig-out, untargetable till it crawls free), fights,
// then COCOONS at 50% and the EMBER MOTH emerges to finish the fight.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  var ARENA = [0.77, 0.30, 0.10, 0.09];   // ARENA (volcano rim NE) — the dig site
  var REGIONS = [
    ['phtFern', 0.24, 0.20, 0.20, 0.14], ['phtJungle', 0.14, 0.52, 0.16, 0.16],
    ['phtAsh', 0.80, 0.20, 0.18, 0.16], ['phtCrater', 0.77, 0.30, 0.13, 0.12],
    ['phtTarSeep', 0.22, 0.78, 0.14, 0.10], ['phtBone', 0.44, 0.76, 0.14, 0.10],
    ['phtSwamp', 0.09, 0.88, 0.10, 0.08], ['phtMud', 0.55, 0.50, 0.14, 0.09]
  ];
  var DECOR = [
    ['phdFerns', 0.20, 0.16, 1.7], ['phdFerns', 0.30, 0.24, 1.5],
    ['phdCycad', 0.12, 0.30, 1.6], ['phdCanopy', 0.10, 0.58, 2.0],
    ['phdVent', 0.84, 0.16, 1.8], ['phdVent', 0.72, 0.22, 1.6],
    ['phdCrater', 0.66, 0.40, 1.6], ['phdTar', 0.22, 0.78, 1.8],
    ['phdRibcage', 0.40, 0.70, 1.8], ['phdAmber', 0.60, 0.60, 1.4],
    ['phdBoulders', 0.32, 0.40, 1.6], ['phdReeds', 0.36, 0.90, 1.5],
    ['phdReeds', 0.62, 0.90, 1.5], ['phdLog', 0.66, 0.895, 1.6],
    ['phdTermite', 0.50, 0.36, 1.5], ['phdGinkgo', 0.28, 0.60, 1.7],
    ['phdGeyser', 0.80, 0.80, 1.6], ['phdConifer', 0.90, 0.46, 1.7],
    ['phdWallow', 0.46, 0.50, 1.5], ['phdBloom', 0.56, 0.66, 1.3]
  ];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var PH = {

    // ======================================================== SETUP =========
    setup: function (scene, WW, HH) {
      var C = scene._ph = {
        zones: [], lanes: [], rings: [], patches: [], mobWarns: [],
        antMarch: { nextAt: 0 }, march: null, pendingVent: null,
        lastDisplaceAt: 0, hatching: false, bossArmed: false, egg: null,
        river: { y: 0.90 * HH, half: 0.045 * HH, fords: [{ x: 0.45 * WW, half: 0.03 * WW }, { x: 0.66 * WW, half: 0.035 * WW }] },
        trail: { y: 0.62 * HH, half: 0.11 * HH },
        arena: { x: ARENA[0] * WW, y: ARENA[1] * HH, rx: ARENA[2] * WW, ry: ARENA[3] * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'phtJungle').setDepth(-24);
      REGIONS.forEach(function (Rg) {
        var cx = Rg[1] * WW, cy = Rg[2] * HH, rx = Rg[3] * WW, ry = Rg[4] * HH;
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, Rg[0]).setDepth(-23);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask());
      });
      var tr = scene.add.tileSprite(WW / 2, C.trail.y, WW, C.trail.half * 2, 'phtTrail').setDepth(-22.5);
      var tg = scene.make.graphics({ add: false });
      tg.fillStyle(0xffffff, 1); tg.fillRect(0, C.trail.y - C.trail.half, WW, C.trail.half * 2);
      tr.setMask(tg.createGeometryMask());
      scene.add.tileSprite(WW / 2, C.river.y, WW, C.river.half * 2, 'phtRiverbed').setDepth(-22.4);
      scene.add.rectangle(WW / 2, C.river.y, WW, C.river.half * 2, 0x3a6a7a, 0.5).setDepth(-22.3);
      C.river.fords.forEach(function (F, i) {
        scene.add.rectangle(F.x, C.river.y, F.half * 2, C.river.half * 2 + 6, i ? 0x4a3a24 : 0x8a8276, 0.9).setDepth(-22.2);
      });

      scene.add.sprite(0.50 * WW, 0.16 * HH, 'phdSkullRock').setScale(2.6).setDepth(2);
      scene.add.sprite(0.92 * WW, 0.44 * HH, 'phdRoost').setScale(2.4).setDepth(2);
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });

      // ARENA ring + the CHURNED DIG MOUND (scenery — where the boss will surface)
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0xc8452a, 0.85); rg.strokeEllipse(C.arena.x, C.arena.y, C.arena.rx * 1.7, C.arena.ry * 1.7);
      C.egg = scene.add.sprite(C.arena.x, C.arena.y + 2, 'prehistoriaDig1').setScale(1.5).setDepth(1.6);

      scene._realmStart = { x: 0.16 * WW, y: 0.56 * HH };

      // mob-verb helpers (fresh closures)
      scene._phMayfly = function (m, player, time) { return PH._mayfly(scene, m, player, time); };
      scene._phWasp = function (m, player, time) { return PH._wasp(scene, m, player, time); };
      scene._phHornet = function (m, player, time) { return PH._hornet(scene, m, player, time); };
      scene._phBee = function (m, player, time) { return PH._bee(scene, m, player, time); };
      scene._phCenti = function (m, player, time) { return PH._centi(scene, m, player, time); };
      scene._phArthro = function (m, player, time) { return PH._arthro(scene, m, player, time); };
    },

    afterCreate: function (scene) { /* no map colliders — the ARENA is OPEN */ },

    // ========================================================= UPDATE ========
    update: function (scene, time, delta) {
      var C = scene._ph; if (!C) return;
      var cfg = scene.realmDef.antMarch;
      var p = scene.player, alive = p.state.alive;

      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false; C.pendingVent = null;
        if (C.antMarch.nextAt === Infinity) C.antMarch.nextAt = time + cfg.cycleMs;
      }

      // ---- ARMY ANT MARCH ambient cycle (parked while the boss holds court) ----
      var mc = C.antMarch;
      if (!mc.nextAt) mc.nextAt = time + cfg.cycleMs * 0.6;
      if (mc.nextAt !== Infinity && time >= mc.nextAt && !scene.scanning && !scene.boss && !C.hatching && !C.march) {
        mc.nextAt = time + cfg.cycleMs * (0.85 + SIM.rng() * 0.3);
        PH._antMarch(scene, C, cfg, time);
      }
      // ---- the moving column itself (a MOVING hazard band) ----
      if (C.march) {
        var M2 = C.march;
        M2.x += M2.dir * M2.speed * (delta / 1000);
        M2.g.clear();
        M2.g.fillStyle(0x6a4a2a, 0.22); M2.g.fillRect(M2.x - M2.half, 0, M2.half * 2, scene.worldH);
        M2.g.lineStyle(3, 0xe0a838, 0.85); M2.g.strokeRect(M2.x - M2.half, 0, M2.half * 2, scene.worldH);
        for (var a2 = 0; a2 < 10; a2++) {                                   // skittering ants
          var ay = (a2 / 10) * scene.worldH + (Math.sin(time / 120 + a2) * 8);
          M2.g.fillStyle(0x3a2414, 0.9); M2.g.fillCircle(M2.x + Math.sin(time / 90 + a2 * 2) * M2.half * 0.6, ay, 3);
        }
        if (alive && time >= (M2.lastTickAt || 0) && Math.abs(p.x - M2.x) < M2.half) {
          M2.lastTickAt = time + 420;
          Entities.hurtPlayer(scene, p, M2.dmg, time, 'the army-ant march', false);
          try { AUDIO.play('antmarch'); } catch (e) {}
        }
        if ((M2.dir > 0 && M2.x >= M2.endX) || (M2.dir < 0 && M2.x <= M2.endX) || time >= M2.until) {
          try { M2.g.destroy(); } catch (e) {} C.march = null;
        }
      }

      // ---- lingering patches (dust/venom fields + damage ticks) ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) >= PA.r) continue;
        if (PA.slowMult) { p.body.velocity.x *= PA.slowMult; p.body.velocity.y *= PA.slowMult; }
        if (PA.dmg && time >= (PA.nextTickAt || 0)) {
          PA.nextTickAt = time + PA.tickMs;
          Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'burning scale-dust', PA.fromBoss);
        }
      }
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }
      // ---- expanding RINGS (quake slams) ----
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.3); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        if (!RG.hit && alive) {
          var sd = Math.hypot(p.x - RG.x, p.y - RG.y);
          if (Math.abs(sd - RG.r) < 22) { RG.hit = true; Entities.hurtPlayer(scene, p, RG.dmg, time, RG.src, RG.fromBoss); }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }
      // ---- RIVER soft-barrier (cross at ford/log bridge) ----
      if (alive && !C.hatching) {
        var dRiv = Math.abs(p.y - C.river.y);
        if (dRiv < C.river.half && !PH._onFord(C, p.x)) {
          if (p._phRiverSide == null) p._phRiverSide = (p.y < C.river.y) ? -1 : 1;
          var side = p._phRiverSide;
          p.y = C.river.y + side * (C.river.half + 2);
          if (side < 0 && p.body.velocity.y > 0) p.body.velocity.y = 0;
          if (side > 0 && p.body.velocity.y < 0) p.body.velocity.y = 0;
        } else if (dRiv >= C.river.half) { p._phRiverSide = (p.y < C.river.y) ? -1 : 1; }
      }

      PH._runZones(scene, time);
      PH._runLanes(scene, time);
      PH._wrap(scene);
    },

    // =================================================== ANT MARCH cycle ======
    _antMarch: function (scene, C, cfg, time) {
      var WW = scene.worldW;
      var dir = SIM.rng() < 0.5 ? 1 : -1;
      var startX = dir > 0 ? -cfg.laneHalf : WW + cfg.laneHalf;
      var endX = dir > 0 ? WW + cfg.laneHalf : -cfg.laneHalf;
      C.march = {
        x: startX, endX: endX, dir: dir, half: cfg.laneHalf, speed: cfg.speed, dmg: cfg.dmg,
        until: time + (Math.abs(endX - startX) / cfg.speed) * 1000 + 600, lastTickAt: 0,
        g: scene.add.graphics().setDepth(2)
      };
      scene.banner('THE ARMY-ANT MARCH\na living column sweeps the plateau — let it pass', '#e0a838');
      try { AUDIO.play('antmarchwarn'); } catch (e) {}
    },

    bossPortalSpot: function (scene, x, y) {
      var C = scene._ph; if (!C) return null;
      if (Math.abs(y - C.river.y) < C.river.half + 24 && !PH._onFord(C, x)) {
        var side = scene.player.y < C.river.y ? -1 : 1;
        var ny = C.river.y + side * (C.river.half + 60);
        ny = Math.max(100, Math.min(scene.worldH - 100, ny));
        return { x: x, y: ny };
      }
      return null;
    },

    // ======================================================== UNFREEZE =======
    unfreeze: function (scene, dt) {
      var C = scene._ph; if (!C) return;
      if (C.antMarch.nextAt && C.antMarch.nextAt !== Infinity) C.antMarch.nextAt += dt;
      if (C.march) { C.march.until += dt; if (C.march.lastTickAt) C.march.lastTickAt += dt; }
      if (C.pendingVent) C.pendingVent.at += dt;
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.patches.forEach(function (PA) { if (PA.dieAt !== Infinity) PA.dieAt += dt; if (PA.nextTickAt) PA.nextTickAt += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['nextDiveAt', 'diveLockUntil', 'diveUntil', 'nextChargeAt', 'chargeLockUntil', 'chargeUntil',
         'nextBurrowAt', 'burrowUntil', 'nextBuffAt', 'nextFlitAt', 'flitUntil', '_nearSince',
         'provokedUntil', 'wanderUntil'].forEach(function (kk) { if (m.mob[kk]) m.mob[kk] += dt; });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextAddsAt', 'busyUntil', 'rootUntil', 'nextFlapAt', '_lureUntil'].forEach(function (kk) { if (bs[kk]) bs[kk] += dt; });
        if (bs.diveLane) bs.diveLane.forEach(function (d) { d.at += dt; });
      }
    },

    // ====================================================== ANNIHILATE =======
    annihilate: function (scene) {
      var C = scene._ph; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.lanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} }); C.rings = [];
      for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} } }
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      if (C.march) { try { C.march.g.destroy(); } catch (e) {} C.march = null; }
      C.pendingVent = null;
    },

    // ================================================== BOSS ARRIVAL =========
    // DIG-OUT: the churned mound heaves (beats 1-4), then the WORM crawls free on
    // beat 5 and the fight begins (untargetable — doesn't exist yet — until then).
    bossArrival: function (scene, def, bx, by) {
      var C = scene._ph, self = scene, ax = C.arena.x, ay = C.arena.y;
      C.hatching = true;
      C.antMarch.nextAt = Infinity;
      scene.player.setPosition(ax, ay + C.arena.ry * 1.6);
      scene.cameras.main.centerOn(ax, ay);
      scene.banner('THE GROUND CHURNS\nsomething is clawing its way up', '#e08a34');
      var beat = def.entranceMs / 5;
      if (C.egg && C.egg.active) C.egg.setTexture('prehistoriaDig1').setScale(1.6);
      try { AUDIO.play('digrumble'); } catch (e) {}
      [['prehistoriaDig2', 1, 'wormburrow'], ['prehistoriaDig3', 2, 'wormheave'], ['prehistoriaDig4', 3, 'wormheave']].forEach(function (fr) {
        scene.time.delayedCall(beat * fr[1], function () {
          if (self.closing) return;
          if (C.egg && C.egg.active) C.egg.setTexture(fr[0]).setScale(1.7);
          self.cameras.main.shake(150, 0.007); self.burst(ax, ay, 10, 0x7a5836);
          try { AUDIO.play(fr[2]); } catch (e) {}
        });
      });
      scene.time.delayedCall(beat * 4, function () {
        if (self.closing || !self.player.state.alive) { C.hatching = false; return; }
        if (C.egg) { try { C.egg.destroy(); } catch (e) {} C.egg = null; }
        self.spawnBossNow(def, ax, ay);
        if (self.boss) { self.burst(self.boss.x, self.boss.y, 24, 0xe08a34); self.cameras.main.shake(220, 0.01); try { AUDIO.play('wormheave'); } catch (e) {} }
        C.bossArmed = true; C.hatching = false;
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE =========
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._ph, M = bs.def.metamorph;
      if (!bs._phInit) {
        bs._phInit = true; bs.verbIdx = 0; bs.nextVerbAt = time + 2400;
        bs.nextAddsAt = time + PT.termiteCall.everyMs * 0.6;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.isMoth = false; bs.cocooning = false;
        bs.metamorphed = false; bs.diveLane = null; bs.nextFlapAt = 0; bs.flapOn = false;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true; bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE INSTAR QUICKENS\nevery beat comes faster', '#ffd24a');
      }
      var rate = bs.rateMult || 1;

      // ---- METAMORPHOSIS at 50%: the worm falls, cocoons, the moth emerges ----
      if (!bs.metamorphed && bs.hp <= bs.maxHp * PT.p2HpPct) {
        bs.metamorphed = true; bs.cocooning = true; bs.diveLane = null;
        bs.busyUntil = time + M.cocoonMs + 600; bs.rootUntil = bs.busyUntil;
        b.setVelocity(0, 0); b.clearTint(); b.setTexture(M.cocoon);
        scene.banner('THE WORM FALLS\nit wraps itself into a cocoon...', '#e08a34');
        scene.burst(b.x, b.y, 22, 0xe08a34);
        try { AUDIO.play('cocoonform'); } catch (e) {}
        var self = scene;
        scene.time.delayedCall(M.cocoonMs * 0.7, function () {
          if (self.boss && self.boss.active && self.boss.boss.cocooning) { self.boss.setTexture(M.cocoonCrack); self.burst(self.boss.x, self.boss.y, 14, 0xffdc78); }
        });
        scene.time.delayedCall(M.cocoonMs, function () {
          if (!self.boss || !self.boss.active) return;
          var bb = self.boss.boss; bb.cocooning = false; bb.isMoth = true;
          self.boss.setTexture(M.mothTexture); self.boss.clearTint();
          bb.nextVerbAt = self.time.now + 1200; bb.busyUntil = self.time.now + 700; bb.rootUntil = self.time.now + 700;
          self.banner('THE MOTH EMERGES\nTHE FINAL INSTAR', '#ff9a3f');
          self.burst(self.boss.x, self.boss.y, 26, 0xff9a3f); self.cameras.main.shake(240, 0.01);
          try { AUDIO.play('mothscreech'); } catch (e) {}
        });
        return;
      }
      if (bs.cocooning) { if (bs.hp < 1) bs.hp = 1; b.setVelocity(0, 0); return; }   // survive the cocoon

      // ---- wing-flap / serpentine undulation frame toggle ----
      if (time >= bs.nextFlapAt) {
        bs.nextFlapAt = time + 140; bs.flapOn = !bs.flapOn;
        var base = bs.isMoth ? M.mothTexture : bs.def.texture, fl = bs.isMoth ? M.mothFlap : M.wormFlap;
        if (scene.textures.exists(fl) && time >= bs.busyUntil) b.setTexture(bs.flapOn ? fl : base);
      }
      // ---- moonlight lure pull (moth) ----
      if (bs._lureUntil && time < bs._lureUntil && player.state.alive) {
        var la = Math.atan2(b.y - player.y, b.x - player.x);
        player.body.velocity.x += Math.cos(la) * PT.moonLure.pull * 0.05;
        player.body.velocity.y += Math.sin(la) * PT.moonLure.pull * 0.05;
      }
      if (bs.diveLane) PH._runDive(scene, b, time);

      if (time < bs.rootUntil) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1) * (bs.isMoth ? 1.25 : 1);
        if (d > 130) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      // WORM adds (termite call)
      if (!bs.isMoth && time >= bs.nextAddsAt) {
        bs.nextAddsAt = time + PT.termiteCall.everyMs * rate;
        PH._termiteCall(scene, b, time); return;
      }
      // rotating kit — worm pool vs moth pool
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        var pool = bs.isMoth ? ['dive', 'dust', 'gust', 'lure'] : ['burrow', 'spray', 'quake', 'burrow'];
        var v = pool[bs.verbIdx % pool.length]; bs.verbIdx++;
        if (v === 'burrow') PH._burrow(scene, b, player, time);
        else if (v === 'spray') PH._dirtSpray(scene, b, player, time);
        else if (v === 'quake') PH._quake(scene, b, player, time);
        else if (v === 'dive') PH._diveStrafe(scene, b, player, time);
        else if (v === 'dust') PH._scaleDust(scene, b, player, time);
        else if (v === 'gust') PH._wingGust(scene, b, player, time);
        else if (v === 'lure') PH._moonLure(scene, b, player, time);
      }
    },

    // ------------------------------- WORM P1 verbs ---------------------------
    // BURROW & RE-EMERGE (signature) — dives under, erupts along the marked lane.
    _burrow: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.burrow;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var x0 = b.x, y0 = b.y, x1 = player.x + Math.cos(ang) * 80, y1 = player.y + Math.sin(ang) * 80;
      var g = PH._laneWarn(scene, x0, y0, x1, y1, cfg.half, 0x2e2a2c);
      b.boss.busyUntil = time + cfg.warnMs + cfg.diveMs + 200; b.boss.rootUntil = time + cfg.warnMs;
      var self = scene;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;
        self.boss.setPosition(x1, y1); self.burst(x1, y1, 18, 0xe08a34); self.cameras.main.shake(170, 0.009);
        try { AUDIO.play('wormheave'); } catch (e) {}
        var p = self.player;
        if (p.state.alive && dist2seg(p.x, p.y, x0, y0, x1, y1) < cfg.half)
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "The Metamorph's burrow", true);
      });
    },
    // DIRT SPRAY — a warned cone of grit toward the player.
    _dirtSpray: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.dirtSpray;
      var base = Math.atan2(player.y - b.y, player.x - b.x);
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 200; b.boss.rootUntil = time + cfg.warnMs;
      try { AUDIO.play('dirtspray'); } catch (e) {}
      for (var i = 0; i < cfg.count; i++) {
        var a = base + (i - (cfg.count - 1) / 2) * 0.4, dd = cfg.range * (0.5 + i * 0.18);
        PH._zone(scene, b.x + Math.cos(a) * dd, b.y + Math.sin(a) * dd, cfg.radius,
          cfg.warnMs + i * cfg.gapMs, cfg.dmg, "The Metamorph's spray", true, false, time, null);
      }
    },
    // BODY-SLAM QUAKE — warned expanding shock ring.
    _quake: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.quake, self = scene, bx = b.x, by = b.y;
      b.boss.busyUntil = time + cfg.warnMs + 900; b.boss.rootUntil = time + cfg.warnMs;
      PH._zone(scene, bx, by, cfg.radius * 0.5, cfg.warnMs, 0, 'a body slam', true, false, time, null);
      scene.time.delayedCall(cfg.warnMs, function () {
        if (!self._ph || !self.boss || !self.boss.active) return;
        var g = self.add.graphics().setDepth(2);
        self._ph.rings.push({ x: bx, y: by, r: 24, r0: 24, maxR: cfg.radius * 1.6, start: self.time.now,
          until: self.time.now + 800, dmg: cfg.dmg, src: "The Metamorph's slam", fromBoss: true, hit: false, g: g, tint: 0xe08a34 });
        self.cameras.main.shake(180, 0.01); try { AUDIO.play('quakestomp'); } catch (e) {}
      });
    },
    // TERMITE CALL — the brood boils up from the soil (fromBoss glow, NO drops).
    _termiteCall: function (scene, b, time) {
      var cfg = b.boss.def.patterns.termiteCall;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      if (aliveM >= cfg.cap) { b.boss.busyUntil = time + 300; return; }
      for (var i = 0; i < cfg.count; i++) {
        scene.queueSpawn({ key: 'termite', bossWave: true, noDrop: true,
          x: b.x + (SIM.rng() * 2 - 1) * 70, y: b.y + 30 + SIM.rng() * 40 });
      }
      scene.banner('THE BROOD ANSWERS\ntermites boil up from the soil', '#c8a86a');
      try { AUDIO.play('termitechitter'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },

    // ------------------------------- MOTH P2 verbs ---------------------------
    // DIVE STRAFE — shadow marks the lane, she lands along it.
    _diveStrafe: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.diveStrafe;
      var lanes = [];
      for (var i = 0; i < cfg.count; i++) {
        var ang = Math.atan2(player.y - b.y, player.x - b.x) + (i - (cfg.count - 1) / 2) * 0.5;
        var x0 = player.x - Math.cos(ang) * cfg.len / 2, y0 = player.y - Math.sin(ang) * cfg.len / 2;
        var x1 = player.x + Math.cos(ang) * cfg.len / 2, y1 = player.y + Math.sin(ang) * cfg.len / 2;
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(cfg.half * 2, 0x2e2a2c, 0.4); g.lineBetween(x0, y0, x1, y1);
        g.lineStyle(2, 0xff9a3f, 0.85); g.lineBetween(x0, y0, x1, y1);
        lanes.push({ x0: x0, y0: y0, x1: x1, y1: y1, half: cfg.half, at: time + cfg.warnMs + i * 160, g: g, dmg: cfg.dmg, done: false });
      }
      b.boss.diveLane = lanes;
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * 160 + cfg.diveMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('DIVE STRAFE\nthe shadow shows the lane — step off it', '#ff9a3f');
    },
    _runDive: function (scene, b, time) {
      var lanes = b.boss.diveLane, all = true;
      for (var i = 0; i < lanes.length; i++) {
        var L = lanes[i]; if (L.done) continue; all = false;
        if (time < L.at) continue;
        L.done = true; try { L.g.destroy(); } catch (e) {}
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(L.half * 2, 0xff9a3f, 0.5); fg.lineBetween(L.x0, L.y0, L.x1, L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: (function (f2) { return function () { try { f2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(120, 0.006);
        try { AUDIO.play('mothscreech'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < L.half)
          Entities.hurtPlayer(scene, p, L.dmg, time, "The Metamorph's dive", true);
      }
      if (all) b.boss.diveLane = null;
    },
    // SCALE-DUST — warned circles that leave lingering burning powder.
    _scaleDust: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.scaleDust;
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 200; b.boss.rootUntil = time + cfg.warnMs;
      try { AUDIO.play('scaledust'); } catch (e) {}
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * cfg.radius * 2;
        PH._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius,
          cfg.warnMs + i * cfg.gapMs, 0, 'burning scale-dust', true, false, time,
          { leaveLava: { lifeMs: cfg.puddleMs, dmg: cfg.puddleDmg, tickMs: cfg.tickMs } });
      }
    },
    // WING-GUST — warned cone push, CAPPED knockback (displacement tag).
    _wingGust: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.wingGust;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xd2642a, 0.14); g.lineStyle(2, 0xffdc78, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y, C = scene._ph;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;
        self.cameras.main.shake(120, 0.006);
        try { AUDIO.play('winggust'); } catch (e) {}
        var p = self.player; if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by), pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "The Metamorph's gust", true);
          if (self.time.now - C.lastDisplaceAt > 600) {
            C.lastDisplaceAt = self.time.now;
            p.body.velocity.x += Math.cos(ang) * cfg.kb; p.body.velocity.y += Math.sin(ang) * cfg.kb;
          }
        }
      });
    },
    // MOONLIGHT LURE — a glow drags you in + calls moth adds.
    _moonLure: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.moonLure, self = scene;
      var g = scene.add.circle(b.x, b.y, cfg.pull, 0xfadc78, 0.12).setStrokeStyle(2, 0xfadc78, 0.7).setDepth(2);
      b.boss.busyUntil = time + cfg.warnMs + cfg.durMs + 200;
      b.boss._lureUntil = time + cfg.warnMs + cfg.durMs;
      scene.banner('MOONLIGHT LURE\nthe glow drags you in — break away', '#fadc78');
      try { AUDIO.play('moonlure'); } catch (e) {}
      scene.time.delayedCall(cfg.warnMs, function () {
        if (!self.boss || !self.boss.active) return;
        for (var i = 0; i < cfg.summon; i++) self.queueSpawn({ key: 'mayfly', bossWave: true, noDrop: true, x: self.boss.x + (SIM.rng() * 2 - 1) * 80, y: self.boss.y + (SIM.rng() * 2 - 1) * 80 });
      });
      scene.time.delayedCall(cfg.warnMs + cfg.durMs, function () { try { g.destroy(); } catch (e) {} });
    },

    // =============================================== MOB VERBS ================
    // GIANT WASP — circles; shadow marks the dive lane -> it dives (Ptero tech).
    _wasp: function (scene, m, player, time) {
      var cfg = m.mob.def.dive;
      if (m.mob.diveUntil) {
        if (time >= m.mob.diveUntil) { m.mob.diveUntil = 0; m.setVelocity(0, 0); PH._restoreTint(m); return true; }
        m.setVelocity(Math.cos(m.mob._diveAng) * cfg.speed, Math.sin(m.mob._diveAng) * cfg.speed);
        if (player.state.alive && dist2seg(player.x, player.y, m.mob._dx0, m.mob._dy0, m.mob._dx1, m.mob._dy1) < cfg.half && !m.mob._diveHit) {
          m.mob._diveHit = true; Entities.hurtPlayer(scene, player, cfg.dmg, time, 'a Giant Wasp dive');
        }
        return true;
      }
      if (m.mob.diveLockUntil) {
        if (time >= m.mob.diveLockUntil) {
          m.mob.diveLockUntil = 0;
          if (m.mob._diveG) { try { m.mob._diveG.destroy(); } catch (e) {} m.mob._diveG = null; }
          m.mob.diveUntil = time + cfg.diveMs; m.mob._diveHit = false;
          m.setVelocity(Math.cos(m.mob._diveAng) * cfg.speed, Math.sin(m.mob._diveAng) * cfg.speed);
          try { AUDIO.play('waspdive'); } catch (e) {}
        } else { m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xd2a020 : 0xffffff); }
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.nextDiveAt) m.mob.nextDiveAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      if (time >= m.mob.nextDiveAt && d < cfg.range && player.state.alive) {
        m.mob.nextDiveAt = time + cfg.everyMs; m.mob.diveLockUntil = time + cfg.warnMs;
        m.mob._diveAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._dx0 = m.x; m.mob._dy0 = m.y;
        m.mob._dx1 = m.x + Math.cos(m.mob._diveAng) * cfg.len; m.mob._dy1 = m.y + Math.sin(m.mob._diveAng) * cfg.len;
        m.mob._diveG = PH._laneWarn(scene, m.mob._dx0, m.mob._dy0, m.mob._dx1, m.mob._dy1, cfg.half, 0x2e2a2c);
        return true;
      }
      var ca = time / 700 + m.id; m.setVelocity(Math.cos(ca) * 44, Math.sin(ca) * 44);
      return true;
    },
    // HORNET — the longer it's near you, the FASTER and angrier it gets.
    _hornet: function (scene, m, player, time) {
      var cfg = m.mob.def.enrage;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.nearRange && player.state.alive) {
        if (!m.mob._nearSince) m.mob._nearSince = time;
        var ramp = Math.min(1, (time - m.mob._nearSince) / cfg.rampMs);
        if (ramp >= 1 && !m.mob._enraged) { m.mob._enraged = true; m.setTint(cfg.glow); try { AUDIO.play('hornetbuzz'); } catch (e) {} }
        var spd = m.mob.def.spd * (1 + (cfg.spdMult - 1) * ramp);
        var a = Math.atan2(player.y - m.y, player.x - m.x);
        m.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd);
        return true;
      }
      if (m.mob._nearSince) { m.mob._nearSince = 0; if (m.mob._enraged) { m.mob._enraged = false; PH._restoreTint(m); } }
      return false;   // core chase when it loses you
    },
    // HONEY BEE — pollen pulse: hastes + gilds nearby bugs (kill it first).
    _bee: function (scene, m, player, time) {
      var cfg = m.mob.def.buff;
      if (!m.mob.nextBuffAt) m.mob.nextBuffAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.5);
      if (time >= m.mob.nextBuffAt) {
        m.mob.nextBuffAt = time + cfg.everyMs;
        var self = scene;
        scene.mobs.children.iterate(function (o) {
          if (!o || !o.active || o === m || !o.mob) return;
          if (Math.hypot(o.x - m.x, o.y - m.y) > cfg.radius) return;
          o.mob.spdMult = cfg.hasteMult; o.setTint(0xffe08a);
          (function (oo) { self.time.delayedCall(cfg.durMs, function () { if (oo.active && oo.mob) { oo.mob.spdMult = 1; PH._restoreTint(oo); } }); })(o);
        });
        scene.burst(m.x, m.y, 10, 0xffd24a); try { AUDIO.play('beebuzz'); } catch (e) {}
      }
      return false;   // core chase (weak)
    },
    // GIANT CENTIPEDE — submerges, then ERUPTS beneath the player (warned).
    _centi: function (scene, m, player, time) {
      var cfg = m.mob.def.burrow;
      if (m.mob.burrowUntil) {
        if (time < m.mob.burrowUntil) { m.setVisible(false); m.setVelocity(0, 0); return true; }
        m.setVisible(true); m.setPosition(m.mob._popX, m.mob._popY); m.mob.burrowUntil = 0;
        try { AUDIO.play('centiburrow'); } catch (e) {}
        return true;
      }
      if (!m.mob.nextBurrowAt) m.mob.nextBurrowAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextBurrowAt && d < cfg.range && player.state.alive) {
        m.mob.nextBurrowAt = time + cfg.everyMs;
        m.mob._popX = player.x; m.mob._popY = player.y; m.mob.burrowUntil = time + cfg.submergeMs;
        PH._zone(scene, player.x, player.y, cfg.popRadius, cfg.submergeMs, cfg.dmg, 'a Centipede ambush', false, false, time, null);
        try { AUDIO.play('centiburrow'); } catch (e) {}
        return true;
      }
      return false;   // core chase (fast, serpentine)
    },
    // ARTHROPLEURA — NEUTRAL colossus; provoke it (damage) and it TRAMPLE-charges.
    _arthro: function (scene, m, player, time) {
      var cfg = m.mob.def.trample, C = scene._ph, rc = scene.realmDef.arthro;
      if (m.mob._lastHp === undefined) m.mob._lastHp = m.mob.hp;
      if (m.mob.hp < m.mob._lastHp) {
        m.mob.provokedUntil = time + rc.calmMs;
        if (!m.mob._roared) { m.mob._roared = true; scene.banner('THE COLOSSUS STIRS\nyou woke the great arthropod', '#8a94a6'); try { AUDIO.play('quakestomp'); } catch (e) {} }
      }
      m.mob._lastHp = m.mob.hp;
      var provoked = m.mob.provokedUntil && time < m.mob.provokedUntil;
      if (!provoked) {
        m.mob._roared = false;
        if (!m.mob.wanderUntil || time >= m.mob.wanderUntil) { m.mob.wanderUntil = time + 1400 + SIM.rng() * 1200; m.mob._wanderAng = SIM.rng() * Math.PI * 2; }
        m.setVelocity(Math.cos(m.mob._wanderAng) * 34, Math.sin(m.mob._wanderAng) * 34);
        return true;
      }
      // provoked: warned trample-charge line (capped knockback)
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 44 && !m.mob._chargeHit) {
          m.mob._chargeHit = true; Entities.hurtPlayer(scene, player, cfg.dmg, time, 'an Arthropleura trample');
          if (time - C.lastDisplaceAt > 600) { C.lastDisplaceAt = time; player.body.velocity.x += Math.cos(m.mob._chargeAng) * cfg.kb; player.body.velocity.y += Math.sin(m.mob._chargeAng) * cfg.kb; }
        }
        return true;
      }
      if (m.mob.chargeLockUntil) {
        if (time >= m.mob.chargeLockUntil) {
          m.mob.chargeLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs; m.mob._chargeHit = false;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
          try { AUDIO.play('quakestomp'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextChargeAt) m.mob.nextChargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextChargeAt && d < cfg.range && player.state.alive) {
        m.mob.nextChargeAt = time + cfg.everyMs; m.mob.chargeLockUntil = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._chargeG = PH._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len, cfg.half);
        return true;
      }
      return false;   // provoked chase otherwise
    },
    // GIANT MAYFLY — fast, fragile, erratic flit (evasive; loosely approaches).
    _mayfly: function (scene, m, player, time) {
      var cfg = m.mob.def.flit;
      if (m.mob.flitUntil && time < m.mob.flitUntil) return true;
      if (m.mob.flitUntil) { m.mob.flitUntil = 0; }
      if (!m.mob.nextFlitAt) m.mob.nextFlitAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextFlitAt && player.state.alive) {
        m.mob.nextFlitAt = time + cfg.everyMs;
        var pa = Math.atan2(player.y - m.y, player.x - m.x) + (SIM.rng() * 2 - 1) * 1.6;
        m.mob.flitUntil = time + cfg.dur;
        m.setVelocity(Math.cos(pa) * m.mob.def.spd * 1.4, Math.sin(pa) * m.mob.def.spd * 1.4);
        return true;
      }
      var a = Math.atan2(player.y - m.y, player.x - m.x) + Math.sin(time / 300 + m.id) * 0.8;
      m.setVelocity(Math.cos(a) * m.mob.def.spd * 0.5, Math.sin(a) * m.mob.def.spd * 0.5);
      return true;
    },

    // ================================================= INTERNAL HELPERS ======
    _onFord: function (C, x) {
      for (var i = 0; i < C.river.fords.length; i++) if (Math.abs(x - C.river.fords[i].x) < C.river.fords[i].half) return true;
      return false;
    },
    _restoreTint: function (m) {
      if (m.mob && m.mob.affix) m.setTint(m.mob.affix.tint); else m.clearTint();
    },
    _wrap: function (scene) {
      var C = scene._ph, WW = scene.worldW, HH = scene.worldH;
      if (C.hatching) return;
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
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    },
    _laneWarn: function (scene, x0, y0, x1, y1, half, tint) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint || 0xc8452a, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, 0xffd24a, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._ph;
      var tint = fromBoss ? 0xffd24a : 0xc8452a;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._ph;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xffd24a : 0xc8452a);
        if (z.dmg > 0) { scene.cameras.main.shake(90, 0.005); try { AUDIO.play('meteorboom'); } catch (e) {} }
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.opts && z.opts.leaveLava) {
          var lv = z.opts.leaveLava;
          var obj = scene.add.circle(z.x, z.y, z.r * 0.8, 0xd2642a, 0.28).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r * 0.8, dieAt: time + lv.lifeMs, obj: obj, dmg: lv.dmg, tickMs: lv.tickMs, nextTickAt: 0, src: 'burning scale-dust', fromBoss: z.fromBoss });
          try { AUDIO.play('scaledust'); } catch (e) {}
        }
        if (z.opts && z.opts.leaveVenom) {
          var vn = z.opts.leaveVenom;
          var obj2 = scene.add.circle(z.x, z.y, z.r, 0x8ae83a, 0.24).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + vn.lifeMs, obj: obj2, dmg: vn.dmg, tickMs: vn.tickMs, nextTickAt: 0, slowMult: vn.slowMult, src: 'lingering venom' });
        }
      }
    },
    _runLanes: function (scene, time) {
      var C = scene._ph;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PH;
  root.PREHISTORIA_SCENE = PH;
})(typeof window !== 'undefined' ? window : this);
