// ============================================================================
// game/js/maps/prehistoria/scene.js — PREHISTORIA scene hooks (M7 registry).
// Scene-plan (assets/prehistoria_scene_plan.png) is canon: fern meadows NW ·
// deep jungle W · volcano quarter NE with the NEST ARENA on the rim (the
// giant egg sits there from map load) · SKULL ROCK center · GAME TRAIL wraps
// W-E · RIVER wraps W-E along the S (cross at the FORD + LOG BRIDGE) · tar
// pits/bone field/ribcage S · swamp SW · geysers SE · roost spire E. Toroidal.
// SIGNATURE: the METEOR SHOWER cycle (omen streaks -> warned impact circles in
// sequence -> brief LAVA PUDDLES; heavier NE). THE PRIMORDIAL reuses that SAME
// machinery for his METEOR CALL (no double-fire: ambient parks while he calls).
// THE HATCH: the egg is scenery until the arena triggers a 4-beat crack/split/
// reveal/FLASH — the boss is untargetable (doesn't exist yet) until beat 4.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) --------
  var ARENA = [0.77, 0.30, 0.10, 0.09];   // NEST ARENA (volcano rim NE)
  // tile regions: [tex, cx, cy, rx, ry]  (masked ellipses over the jungle base)
  var REGIONS = [
    ['phtFern', 0.24, 0.20, 0.20, 0.14],     // fern meadows NW
    ['phtJungle', 0.14, 0.52, 0.16, 0.16],   // deep jungle W
    ['phtAsh', 0.80, 0.20, 0.18, 0.16],      // volcanic ash NE
    ['phtCrater', 0.77, 0.30, 0.13, 0.12],   // crater rock (nest quarter)
    ['phtTarSeep', 0.22, 0.78, 0.14, 0.10],  // tar pits SW
    ['phtBone', 0.44, 0.76, 0.14, 0.10],     // bone field S
    ['phtSwamp', 0.09, 0.88, 0.10, 0.08],    // swamp SW
    ['phtMud', 0.55, 0.50, 0.14, 0.09]       // mud flats mid
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
        meteor: { nextAt: 0, seq: [] }, pendingVent: null,
        lastDisplaceAt: 0, hatching: false, bossArmed: false,
        egg: null, eggShards: [],
        river: { y: 0.90 * HH, half: 0.045 * HH, fords: [{ x: 0.45 * WW, half: 0.03 * WW }, { x: 0.66 * WW, half: 0.035 * WW }] },
        trail: { y: 0.62 * HH, half: 0.11 * HH },
        arena: { x: ARENA[0] * WW, y: ARENA[1] * HH, rx: ARENA[2] * WW, ry: ARENA[3] * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- jungle base + masked tile regions ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'phtJungle').setDepth(-24);
      REGIONS.forEach(function (Rg) {
        var cx = Rg[1] * WW, cy = Rg[2] * HH, rx = Rg[3] * WW, ry = Rg[4] * HH;
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, Rg[0]).setDepth(-23);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask());
      });
      // ---- GAME TRAIL band W-E (decorative road; wraps) ----
      var tr = scene.add.tileSprite(WW / 2, C.trail.y, WW, C.trail.half * 2, 'phtTrail').setDepth(-22.5);
      var tg = scene.make.graphics({ add: false });
      tg.fillStyle(0xffffff, 1); tg.fillRect(0, C.trail.y - C.trail.half, WW, C.trail.half * 2);
      tr.setMask(tg.createGeometryMask());
      // ---- RIVER band W-E along the S (wraps); riverbed stone ----
      scene.add.tileSprite(WW / 2, C.river.y, WW, C.river.half * 2, 'phtRiverbed').setDepth(-22.4);
      var riv = scene.add.rectangle(WW / 2, C.river.y, WW, C.river.half * 2, 0x3a6a7a, 0.5).setDepth(-22.3);
      // ford + log bridge crossings (visual)
      C.river.fords.forEach(function (F, i) {
        scene.add.rectangle(F.x, C.river.y, F.half * 2, C.river.half * 2 + 6, i ? 0x4a3a24 : 0x8a8276, 0.9).setDepth(-22.2);
      });

      // ---- landmarks + decor ----
      scene.add.sprite(0.50 * WW, 0.16 * HH, 'phdSkullRock').setScale(2.6).setDepth(2);   // SKULL ROCK center-N
      scene.add.sprite(0.92 * WW, 0.44 * HH, 'phdRoost').setScale(2.4).setDepth(2);       // ROOST SPIRE E
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });

      // ---- NEST ARENA ring + the GIANT EGG (pre-placed scenery, bigger than the boss) ----
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0xc8452a, 0.85); rg.strokeEllipse(C.arena.x, C.arena.y, C.arena.rx * 1.7, C.arena.ry * 1.7);
      scene.add.sprite(C.arena.x, C.arena.y + 6, 'phdNest').setScale(2.2).setDepth(1.6);
      C.egg = scene.add.sprite(C.arena.x, C.arena.y - 8, 'prehistoriaHatch1').setScale(1.5).setDepth(3);

      // ---- spawn in the deep jungle SW ----
      scene._realmStart = { x: 0.16 * WW, y: 0.56 * HH };

      // mob-verb helpers (fresh closures)
      scene._phRaptor = function (m, player, time) { return PH._raptor(scene, m, player, time); };
      scene._phTrike = function (m, player, time) { return PH._trike(scene, m, player, time); };
      scene._phStego = function (m, player, time) { return PH._stego(scene, m, player, time); };
      scene._phPtero = function (m, player, time) { return PH._ptero(scene, m, player, time); };
      scene._phDilo = function (m, player, time) { return PH._dilo(scene, m, player, time); };
      scene._phBrachio = function (m, player, time) { return PH._brachio(scene, m, player, time); };
    },

    // colliders (none) exist NOW — river/trail are soft, not walls (like swamp water)
    afterCreate: function (scene) { /* no map colliders — the ARENA is OPEN (no fences) */ },

    // ========================================================= UPDATE ========
    update: function (scene, time, delta) {
      var C = scene._ph; if (!C) return;
      var cfg = scene.realmDef.meteor;
      var p = scene.player, alive = p.state.alive;

      // boss-owned machinery clears when the boss is down
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false; C.pendingVent = null;
        if (C.meteor.nextAt === Infinity) C.meteor.nextAt = time + cfg.cycleMs;   // the sky calms, then resumes
      }

      // ---- METEOR SHOWER ambient cycle (parked while the boss holds court) ----
      var mc = C.meteor;
      if (!mc.nextAt) mc.nextAt = time + cfg.cycleMs * 0.6;
      if (mc.nextAt !== Infinity && time >= mc.nextAt && !scene.scanning && !scene.boss && !C.hatching) {
        mc.nextAt = time + cfg.cycleMs * (0.85 + SIM.rng() * 0.3);
        PH._meteorShower(scene, C, cfg, false, time);
      }

      // ---- pending METEOR CALL vent: the last stone winds him ----
      if (C.pendingVent && time >= C.pendingVent.at) {
        var b0 = scene.boss;
        if (b0 && b0.active) {
          b0.boss.ventedUntil = time + C.pendingVent.ventMs;
          b0.boss.ventDmgMult = C.pendingVent.ventDmgMult;
          b0.boss.rootUntil = time + C.pendingVent.ventMs;
          b0.setTint(0x6a6266);
          (function (bb) { scene.time.delayedCall(C.pendingVent.ventMs, function () { if (bb.active) PH._bossTint(bb); }); })(b0);
          scene.banner('THE LAST STONE WINDS HIM\nwings drooped — UNLOAD', '#ffd24a');
          scene.burst(b0.x, b0.y, 22, 0xc8452a);
          try { AUDIO.play('windedsnort'); } catch (e) {}
        }
        C.pendingVent = null;
      }

      // ---- patches: lava + venom (slow fields + damage ticks) ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        var inP = Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r;
        if (!inP) continue;
        if (PA.slowMult) { p.body.velocity.x *= PA.slowMult; p.body.velocity.y *= PA.slowMult; }
        if (PA.dmg && time >= (PA.nextTickAt || 0)) {
          PA.nextTickAt = time + PA.tickMs;
          Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'a lava puddle', PA.fromBoss);
        }
      }

      // ---- armed cleanups: warn graphics whose mob died early ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- expanding RINGS (quake stomps) ----
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

      // ---- RIVER soft-barrier: impassable except at the ford + log bridge ----
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

    // =================================================== METEOR machinery ====
    // Shared by the ambient cycle AND the boss's METEOR CALL (single system —
    // never double-fires: the ambient parks whenever a boss exists).
    _meteorShower: function (scene, C, cfg, fromBoss, time) {
      var WW = scene.worldW, HH = scene.worldH, p = scene.player;
      // OMEN — streaks rake the sky (readable), whistle
      var omen = scene.add.graphics().setDepth(9);
      omen.lineStyle(2, 0xc8452a, 0.9);
      for (var k = 0; k < 5; k++) { var ox = SIM.rng() * WW, oy = SIM.rng() * HH * 0.2; omen.lineBetween(ox, oy, ox + 40, oy + 26); }
      scene.tweens.add({ targets: omen, alpha: 0, duration: cfg.omenMs, onComplete: function () { try { omen.destroy(); } catch (e) {} } });
      scene.banner(fromBoss ? 'METEOR CALL\nhe roars the sky down — stand clear' : 'METEOR SHOWER\nstreaks in the sky — find the gaps', '#ffd24a');
      try { AUDIO.play('meteoromen'); } catch (e) {}
      // schedule impacts in SEQUENCE (never all at once)
      var count = cfg.waveCount, live = 0;
      for (var i = 0; i < count; i++) {
        var x, y;
        if (fromBoss) { var a = i / count * Math.PI * 2 + SIM.rng() * 0.4; x = C.arena.x + Math.cos(a) * cfg.ringR; y = C.arena.y + Math.sin(a) * cfg.ringR; }
        else {
          // NE bias: the closer to the volcano quarter, the angrier the sky
          if (SIM.rng() < cfg.neBias) { x = (0.55 + SIM.rng() * 0.45) * WW; y = SIM.rng() * 0.45 * HH; }
          else { x = SIM.rng() * WW; y = SIM.rng() * HH; }
        }
        // FAIRNESS: never spawn-camp the player or the arena entrance during the hatch
        if (Math.hypot(x - p.x, y - p.y) < cfg.safeR) continue;
        if (C.hatching && Math.hypot(x - C.arena.x, y - C.arena.y) < C.arena.rx * 2) continue;
        if (live >= cfg.maxLive) break;
        live++;
        PH._zone(scene, x, y, cfg.radius, cfg.omenMs + i * cfg.gapMs + cfg.impactWarnMs, cfg.dmg,
          fromBoss ? "The Primordial's meteor" : 'a falling meteor', fromBoss, false, time,
          { leaveLava: { lifeMs: cfg.puddleMs, dmg: cfg.puddleDmg, tickMs: cfg.puddleTickMs } });
      }
      return time + cfg.omenMs + count * cfg.gapMs + cfg.impactWarnMs;
    },

    _meteorCall: function (scene, b, time) {
      var C = scene._ph, cfg = scene.realmDef.meteor, PT = b.boss.def.patterns.meteorCall;
      // early-fire the cycle machinery in a ring around the arena; NO ambient overlap
      var lastAt = PH._meteorShower(scene, C, { waveCount: PT.count, ringR: PT.ringR, radius: cfg.radius,
        omenMs: cfg.omenMs, gapMs: PT.gapMs, impactWarnMs: PT.warnMs, dmg: cfg.dmg,
        puddleMs: cfg.puddleMs, puddleDmg: cfg.puddleDmg, puddleTickMs: cfg.puddleTickMs,
        neBias: 0, maxLive: PT.count, safeR: 0 }, true, time);
      C.pendingVent = { at: lastAt + 200, ventMs: PT.ventMs, ventDmgMult: PT.ventDmgMult };
      b.boss.busyUntil = lastAt + 300;
      try { AUDIO.play('dragonroar'); } catch (e) {}
    },

    // M7k AUDIT fix: the quota boss portal could land INSIDE the impassable
    // southern-river strip (crossable only at the ford/log bridge) — softlock.
    // Nudge it onto the player's bank, clamped into the world.
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
      if (C.meteor.nextAt && C.meteor.nextAt !== Infinity) C.meteor.nextAt += dt;
      if (C.pendingVent) C.pendingVent.at += dt;
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.patches.forEach(function (PA) { if (PA.dieAt !== Infinity) PA.dieAt += dt; if (PA.nextTickAt) PA.nextTickAt += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['nextLungeAt', 'lungeAt', 'lungeUntil', 'nextChargeAt', 'chargeLockUntil', 'chargeUntil',
         'nextSweepAt', 'sweepLockUntil', 'nextDiveAt', 'diveLockUntil', 'diveUntil',
         'nextSpitAt', 'nextStompAt', 'stompLockUntil', 'provokedUntil', 'wanderUntil'].forEach(function (kk) {
          if (m.mob[kk]) m.mob[kk] += dt;
        });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextAddsAt', 'nextCallAt', 'nextDiveAt', 'busyUntil', 'rootUntil',
         'ventedUntil', 'igniteAt'].forEach(function (kk) { if (bs[kk]) bs[kk] += dt; });
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
      C.pendingVent = null;
    },

    // ================================================== BOSS ARRIVAL =========
    // THE HATCH: the pre-placed egg cracks (beat 1-2), the halves separate and
    // the Primordial is revealed (beat 3), then the halves FLASH WHITE and
    // vanish — the boss goes live on beat 4 (untargetable before the flash).
    bossArrival: function (scene, def, bx, by) {
      var C = scene._ph, self = scene;
      var ax = C.arena.x, ay = C.arena.y;
      C.hatching = true;
      C.meteor.nextAt = Infinity;                         // the ambient sky holds its breath
      scene.player.setPosition(ax, ay + C.arena.ry * 1.4);
      scene.cameras.main.centerOn(ax, ay);
      scene.banner('THE HATCH\nthe egg splits — something older than you', '#ffd24a');
      var beat = def.entranceMs / 4;
      // beat 1: towering egg cracks
      scene.time.delayedCall(beat * 0.5, function () {
        if (self.closing) return;
        if (C.egg && C.egg.active) C.egg.setTexture('prehistoriaHatch2').setScale(1.6);
        self.burst(ax, ay - 8, 8, 0xffd24a);
        try { AUDIO.play('hatchcrack'); } catch (e) {}
      });
      // beat 3: halves separate, the Primordial revealed between them
      scene.time.delayedCall(beat * 2.5, function () {
        if (self.closing) return;
        if (C.egg && C.egg.active) C.egg.setTexture('prehistoriaHatch3').setScale(1.7);
        self.cameras.main.shake(220, 0.006);
        try { AUDIO.play('hatchcrack'); } catch (e) {}
      });
      // beat 4: FLASH WHITE, halves gone, boss goes LIVE
      scene.time.delayedCall(beat * 3.5, function () {
        if (self.closing || !self.player.state.alive) { C.hatching = false; return; }
        if (C.egg) { try { C.egg.destroy(); } catch (e) {} C.egg = null; }
        var flash = self.add.rectangle(ax, ay, 260, 260, 0xffffff, 0.75).setDepth(40);
        self.tweens.add({ targets: flash, alpha: 0, scale: 1.6, duration: 420, onComplete: function () { try { flash.destroy(); } catch (e) {} } });
        try { AUDIO.play('hatchflash'); } catch (e) {}
        self.spawnBossNow(def, ax, ay);
        if (self.boss) { self.burst(self.boss.x, self.boss.y, 24, 0xc8452a); try { AUDIO.play('dragonroar'); } catch (e) {} }
        C.bossArmed = true;
        C.hatching = false;
      });
      // scouter after the flash
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE =========
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._ph;
      if (!bs._phInit) {
        bs._phInit = true;
        bs.verbIdx = 0;
        bs.nextVerbAt = time + 2400;
        bs.nextAddsAt = time + PT.compyCall.everyMs * 0.5;
        bs.nextCallAt = time + PT.meteorCall.warnMs * 6 + 9000;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.ignited = false; bs.diveLane = null;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE APEX QUICKENS\nevery breath comes faster', '#ffd24a');
      }
      // P2 (<50%): his feathers IGNITE + the DIVE STRAFES unlock
      if (!bs.ignited && bs.hp <= bs.maxHp * PT.p2HpPct) {
        bs.ignited = true;
        if (scene.textures.exists('prehistoriaPrimordialIgnitedHi')) b.setTexture('prehistoriaPrimordialIgnitedHi');
        b.setTint(0xff9a3f);
        scene.banner('HIS FEATHERS IGNITE\nthe hatchling burns — and now he DIVES', '#ff9a3f');
        scene.burst(b.x, b.y, 22, 0xff9a3f);
        try { AUDIO.play('ignitefwoosh'); } catch (e) {}
      }
      var rate = bs.rateMult || 1;

      // active dive-strafe lanes (P2)
      if (bs.diveLane) PH._runDive(scene, b, time);

      // chase / root
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 130) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      // SIGNATURE — METEOR CALL (own clock, top priority)
      if (time >= bs.nextCallAt) {
        bs.nextCallAt = time + PT.meteorCall.warnMs * 8 + 14000 * rate;
        PH._meteorCall(scene, b, time);
        return;
      }
      // COMPY CALL — 2-3 map compys scurry in (fromBoss, glow, NO drops)
      if (time >= bs.nextAddsAt) {
        bs.nextAddsAt = time + PT.compyCall.everyMs * rate;
        PH._compyCall(scene, b, time);
        return;
      }
      // rotating kit verbs
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        var pool = bs.ignited ? ['lash', 'breath', 'gust', 'dive'] : ['lash', 'breath', 'gust'];
        var v = pool[bs.verbIdx % pool.length];
        bs.verbIdx++;
        if (v === 'lash') PH._tailLash(scene, b, player, time);
        else if (v === 'breath') PH._fireBreath(scene, b, player, time);
        else if (v === 'gust') PH._wingGust(scene, b, player, time);
        else PH._diveStrafe(scene, b, player, time);
      }
    },
    _bossTint: function (b) {
      if (b.boss && b.boss.ignited) b.setTint(0xff9a3f); else b.clearTint();
    },

    // TAIL LASH — warned melee arc behind/beside him -> heavy sweep.
    _tailLash: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tailLash;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xc8452a, 0.15); g.lineStyle(2, 0xffd24a, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;   // M7k AUDIT fix: dead caster — no lash
        var fg = self.add.graphics().setDepth(9);
        fg.fillStyle(0xffd24a, 0.5); fg.slice(bx, by, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(130, 0.007);
        try { AUDIO.play('tailwhoosh'); } catch (e) {}
        var p = self.player; if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by), pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "The Primordial's tail", true);
      });
    },
    // FIRE BREATH — a marked cone that RAKES across the arena (the whole sweep
    // path is telegraphed BEFORE it moves — readability rule).
    _fireBreath: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.fireBreath;
      var a0 = Math.atan2(player.y - b.y, player.x - b.x) - cfg.sweepRad / 2;
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xc8452a, 0.12); g.lineStyle(2, 0xffd24a, 0.8);
      g.slice(b.x, b.y, cfg.range, a0, a0 + cfg.sweepRad, false);   // the FULL sweep path, static warn
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + cfg.steps * cfg.gapMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;   // M7k AUDIT fix: dead caster — no rake
        for (var i = 0; i < cfg.steps; i++) {
          (function (idx) {
            self.time.delayedCall(idx * cfg.gapMs, function () {
              if (!self.boss || !self.boss.active) return;
              var ca = a0 + cfg.sweepRad * (idx / (cfg.steps - 1));
              var fg = self.add.graphics().setDepth(9);
              fg.fillStyle(0xffd24a, 0.5); fg.slice(bx, by, cfg.range, ca - cfg.halfRad, ca + cfg.halfRad, false); fg.fillPath();
              self.tweens.add({ targets: fg, alpha: 0, duration: 200, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
              if (idx === 0) { try { AUDIO.play('breathrake'); } catch (e) {} }
              var p = self.player; if (!p.state.alive) return;
              var pd = Math.hypot(p.x - bx, p.y - by), pa = Math.atan2(p.y - by, p.x - bx);
              var diff = Math.atan2(Math.sin(pa - ca), Math.cos(pa - ca));
              if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
                Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "The Primordial's fire", true);
            });
          })(i);
        }
      });
    },
    // WING GUST — warned cone push, CAPPED knockback (shares the displacement tag).
    _wingGust: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.wingGust;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0x74a0b2, 0.14); g.lineStyle(2, 0xd8f4ff, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y, C = scene._ph;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;   // M7k AUDIT fix: dead caster — no gust
        self.cameras.main.shake(120, 0.006);
        try { AUDIO.play('wingbuffet'); } catch (e) {}
        var p = self.player; if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by), pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "The Primordial's gust", true);
          if (self.time.now - C.lastDisplaceAt > 600) {          // DISPLACEMENT tag — no ping-pong
            C.lastDisplaceAt = self.time.now;
            p.body.velocity.x += Math.cos(ang) * cfg.kb;
            p.body.velocity.y += Math.sin(ang) * cfg.kb;
          }
        }
      });
    },
    // COMPY CALL — 2-3 map compys scurry in (fromBoss glow, NO drops).
    _compyCall: function (scene, b, time) {
      var cfg = b.boss.def.patterns.compyCall;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      if (aliveM >= cfg.cap) { b.boss.busyUntil = time + 300; return; }
      for (var i = 0; i < cfg.count; i++) {
        scene.queueSpawn({ key: 'compy', bossWave: true, noDrop: true,
          x: b.x + (SIM.rng() * 2 - 1) * 70, y: b.y + 30 + SIM.rng() * 40 });
      }
      scene.banner('COMPY CALL\nthe swarm answers his cry', '#5a7a34');
      try { AUDIO.play('compychirp'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    // DIVE STRAFE (P2) — shadow marks the lane, he lands along it (valkyrie tech).
    _diveStrafe: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.dive, C = scene._ph;
      var lanes = [];
      for (var i = 0; i < cfg.count; i++) {
        var ang = Math.atan2(player.y - b.y, player.x - b.x) + (i - (cfg.count - 1) / 2) * 0.5;
        var x0 = player.x - Math.cos(ang) * cfg.len / 2, y0 = player.y - Math.sin(ang) * cfg.len / 2;
        var x1 = player.x + Math.cos(ang) * cfg.len / 2, y1 = player.y + Math.sin(ang) * cfg.len / 2;
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(cfg.half * 2, 0x2e2a2c, 0.4); g.lineBetween(x0, y0, x1, y1);   // the SHADOW mark
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
        L.done = true;
        try { L.g.destroy(); } catch (e) {}
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(L.half * 2, 0xff9a3f, 0.5); fg.lineBetween(L.x0, L.y0, L.x1, L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: (function (f2) { return function () { try { f2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(120, 0.006);
        try { AUDIO.play('pteroscreech'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < L.half)
          Entities.hurtPlayer(scene, p, L.dmg, time, "The Primordial's dive", true);
      }
      if (all) b.boss.diveLane = null;
    },

    // =============================================== MOB VERBS (map-new) =====
    // RAPTOR — pack lunger: warned sickle-claw mini-dash (contact via chase).
    _raptor: function (scene, m, player, time) {
      var cfg = m.mob.def.lunge;
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); return true; }
        return true;   // riding the dash — core contact damage lands
      }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xc87a2e : 0xffffff);
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0; PH._restoreTint(m);
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          try { AUDIO.play('raptorshriek'); } catch (e) {}
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
      return false;   // otherwise core chase (packs)
    },
    // TRICERATOPS — warned shield-charge LANE -> charge, capped knockback.
    _trike: function (scene, m, player, time) {
      var cfg = m.mob.def.charge, C = scene._ph;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 40 && !m.mob._chargeHit) {
          m.mob._chargeHit = true;
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Triceratops charge");
          if (time - C.lastDisplaceAt > 600) {                   // shared displacement tag
            C.lastDisplaceAt = time;
            player.body.velocity.x += Math.cos(m.mob._chargeAng) * cfg.kb;
            player.body.velocity.y += Math.sin(m.mob._chargeAng) * cfg.kb;
          }
        }
        return true;
      }
      if (m.mob.chargeLockUntil) {
        if (time >= m.mob.chargeLockUntil) {
          m.mob.chargeLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs; m.mob._chargeHit = false;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
          try { AUDIO.play('trikebellow'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextChargeAt) m.mob.nextChargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextChargeAt && d < cfg.range && player.state.alive) {
        m.mob.nextChargeAt = time + cfg.everyMs;
        m.mob.chargeLockUntil = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._chargeG = PH._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // STEGOSAURUS — warned thagomizer tail sweep (REAR arc, away from the face).
    _stego: function (scene, m, player, time) {
      var cfg = m.mob.def.sweep;
      if (m.mob.sweepLockUntil && time < m.mob.sweepLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextSweepAt) m.mob.nextSweepAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSweepAt && d < cfg.range && player.state.alive) {
        m.mob.nextSweepAt = time + cfg.everyMs;
        m.mob.sweepLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);   // the tail whips toward the threat
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x5a7a34, 0.13); g.lineStyle(2, 0xd8ccb0, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!m.active) return;   // M7k AUDIT fix: stego died mid-telegraph — no sweep
          if (!player.state.alive) return;
          try { AUDIO.play('stegowhoosh'); } catch (e) {}
          var pd = Math.hypot(player.x - mx, player.y - my), pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Stegosaurus thagomizer");
        });
        return true;
      }
      return false;
    },
    // PTERODACTYL — circles high; the SHADOW marks the dive lane -> it dives.
    _ptero: function (scene, m, player, time) {
      var cfg = m.mob.def.dive;
      if (m.mob.diveUntil) {
        if (time >= m.mob.diveUntil) { m.mob.diveUntil = 0; m.setVelocity(0, 0); PH._restoreTint(m); return true; }
        m.setVelocity(Math.cos(m.mob._diveAng) * cfg.speed, Math.sin(m.mob._diveAng) * cfg.speed);
        if (player.state.alive && dist2seg(player.x, player.y, m.mob._dx0, m.mob._dy0, m.mob._dx1, m.mob._dy1) < cfg.half && !m.mob._diveHit) {
          m.mob._diveHit = true;
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Pterodactyl dive");
        }
        return true;
      }
      if (m.mob.diveLockUntil) {
        if (time >= m.mob.diveLockUntil) {
          m.mob.diveLockUntil = 0;
          if (m.mob._diveG) { try { m.mob._diveG.destroy(); } catch (e) {} m.mob._diveG = null; }
          m.mob.diveUntil = time + cfg.diveMs; m.mob._diveHit = false;
          m.setVelocity(Math.cos(m.mob._diveAng) * cfg.speed, Math.sin(m.mob._diveAng) * cfg.speed);
          try { AUDIO.play('pteroscreech'); } catch (e) {}
        } else { m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xb06a4a : 0xffffff); }
        return true;
      }
      // circle high, flit around the player at range
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.nextDiveAt) m.mob.nextDiveAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      if (time >= m.mob.nextDiveAt && d < cfg.range && player.state.alive) {
        m.mob.nextDiveAt = time + cfg.everyMs;
        m.mob.diveLockUntil = time + cfg.warnMs;
        m.mob._diveAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._dx0 = m.x; m.mob._dy0 = m.y;
        m.mob._dx1 = m.x + Math.cos(m.mob._diveAng) * cfg.len; m.mob._dy1 = m.y + Math.sin(m.mob._diveAng) * cfg.len;
        m.mob._diveG = PH._laneWarn(scene, m.mob._dx0, m.mob._dy0, m.mob._dx1, m.mob._dy1, cfg.half, 0x2e2a2c);
        return true;
      }
      // idle hover circling (no chase — airborne)
      var ca = time / 700 + m.id;
      m.setVelocity(Math.cos(ca) * 40, Math.sin(ca) * 40);
      return true;
    },
    // DILOPHOSAURUS — twin crests flare; warned venom spit -> lingering puddle.
    _dilo: function (scene, m, player, time) {
      var cfg = m.mob.def.spit;
      if (!m.mob.nextSpitAt) m.mob.nextSpitAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSpitAt && d < cfg.range && player.state.alive) {
        m.mob.nextSpitAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter, a = SIM.rng() * Math.PI * 2;
          PH._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.radius, cfg.warnMs, cfg.dmg, "a Dilophosaurus's venom", false, false, time,
            { leaveVenom: { lifeMs: cfg.puddleMs, dmg: cfg.puddleDmg, tickMs: cfg.puddleTickMs, slowMult: cfg.slowMult } });
        }
        m.setTint(0x8ae83a);
        (function (m2) { scene.time.delayedCall(240, function () { if (m2.active) PH._restoreTint(m2); }); })(m);
        try { AUDIO.play('dilospit'); } catch (e) {}
        return true;
      }
      return false;
    },
    // BRACHIOSAURUS — NEUTRAL until the PLAYER damages it (cycle dmg does NOT
    // provoke); provoked -> warned quake-stomp circles; else wanders the meadow.
    _brachio: function (scene, m, player, time) {
      var cfg = m.mob.def.stomp, C = scene._ph;
      if (m.mob._lastHp === undefined) m.mob._lastHp = m.mob.hp;
      if (m.mob.hp < m.mob._lastHp) {                            // any hp loss = PLAYER hit (cycle never damages mobs)
        m.mob.provokedUntil = time + scene.realmDef.brachio.calmMs;
        if (!m.mob._roared) { m.mob._roared = true; scene.banner('THE COLOSSUS IS PROVOKED\nyou woke the longneck', '#a8b284'); try { AUDIO.play('trikebellow'); } catch (e) {} }
      }
      m.mob._lastHp = m.mob.hp;
      var provoked = m.mob.provokedUntil && time < m.mob.provokedUntil;
      if (!provoked) { m.mob._roared = false; }
      if (!provoked) {                                           // NEUTRAL — wander, ignore the player
        if (!m.mob.wanderUntil || time >= m.mob.wanderUntil) {
          m.mob.wanderUntil = time + 1400 + SIM.rng() * 1200;
          m.mob._wanderAng = SIM.rng() * Math.PI * 2;
        }
        m.setVelocity(Math.cos(m.mob._wanderAng) * cfg.wanderSpd, Math.sin(m.mob._wanderAng) * cfg.wanderSpd);
        return true;
      }
      // provoked: warned quake-stomp rings
      if (m.mob.stompLockUntil && time < m.mob.stompLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextStompAt) m.mob.nextStompAt = time + cfg.everyMs;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextStompAt && d < cfg.range && player.state.alive) {
        m.mob.nextStompAt = time + cfg.everyMs;
        m.mob.stompLockUntil = time + cfg.warnMs;
        var self = scene, mx = m.x, my = m.y;
        PH._zone(scene, mx, my, cfg.radius, cfg.warnMs, 0, 'a quake stomp', false, false, time, null);
        scene.time.delayedCall(cfg.warnMs, function () {
          if (!self._ph) return;
          var g = self.add.graphics().setDepth(2);
          self._ph.rings.push({ x: mx, y: my, r: 24, r0: 24, maxR: cfg.radius * 1.6, start: self.time.now,
            until: self.time.now + 800, dmg: cfg.dmg, src: 'a Brachiosaurus stomp', fromBoss: false, hit: false, g: g, tint: 0xa8b284 });
          self.cameras.main.shake(160, 0.008);
          try { AUDIO.play('quakestomp'); } catch (e) {}
        });
        return true;
      }
      return false;   // provoked chase otherwise (core)
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
      if (C.hatching) return;                       // no wrap mid-cinematic
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
    // warned circle — env = volcano orange, boss = brighter (reads on every tile).
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
        // env kills FIRST (XP before any heal), the player LAST
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        // lingering pools
        if (z.opts && z.opts.leaveLava) {
          var lv = z.opts.leaveLava;
          var obj = scene.add.circle(z.x, z.y, z.r * 0.8, 0xc8452a, 0.28).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r * 0.8, dieAt: time + lv.lifeMs, obj: obj, dmg: lv.dmg, tickMs: lv.tickMs, nextTickAt: 0, src: 'a lava puddle', fromBoss: z.fromBoss });
          try { AUDIO.play('lavasizzle'); } catch (e) {}
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
