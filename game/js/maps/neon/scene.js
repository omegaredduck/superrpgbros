// ============================================================================
// game/js/maps/neon/scene.js — NEON CITY scene hooks (M7 registry).
// The scene-plan PNG (assets/neon_scene_plan.png) is canon: rain-slick rooftop
// sprawl, toroidal. A STREET CANYON (asphalt) runs W-E edge-to-edge and is
// ROOF-LEVEL-BLOCKED — crossable ONLY at the CABLE-RUN crossings. A MIRROR
// PROMENADE runs N-S. Turfs: TAGGED QUARTER (NW, punks+rats), CORP PLAZA (NE,
// drones/turrets/enforcers), AD FLOORS (vipers), OLD QUARTER (SW, cracked),
// CABLE RUNS (netrunners), HELIPAD (SE) = CRASH SITE boss arena with the
// permanent APACHE WRECK as cover. FIRE ESCAPE railings are destructible
// fences. KINGPIN'S PATROL is the signature cycle: searchlight WARN ->
// telegraphed STRAFE LANES or ROCKET CIRCLES (alternate) -> gone; below 50%
// boss HP it targets the arena as his BACKUP (never overlapping SYSTEM
// BREACH). THE SOCIAL ENGINEER: crash entrance, FIREWALL drone gate (immune
// while up), DDOS darts, POP-UP ad walls (block your shots, not his), REMOTE
// ACCESS hacked turrets, SYSTEM BREACH -> vented x1.5. All absolute clocks.
// ============================================================================
(function (root) {
  'use strict';

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  // planned layout (fractions of world; scene-plan PNG canon)
  var DECOR = [
    ['nedBillboard', 0.16, 0.08, 2.0], ['nedBillboard', 0.68, 0.08, 2.0],
    ['nedTank', 0.1, 0.3, 1.7], ['nedTank', 0.72, 0.28, 1.6],
    ['nedAC', 0.28, 0.26, 1.6], ['nedVent', 0.6, 0.24, 1.6],
    ['nedAntenna', 0.44, 0.22, 1.7], ['nedDish', 0.86, 0.34, 1.6],
    ['nedVending', 0.36, 0.5, 1.5], ['nedShanty', 0.24, 0.86, 1.7],
    ['nedDumpster', 0.08, 0.82, 1.6], ['nedShed', 0.9, 0.5, 1.7],
    ['nedMascot', 0.2, 0.5, 1.8], ['nedSakura', 0.6, 0.44, 1.7],
    ['nedKoi', 0.13, 0.68, 1.7], ['nedPower', 0.5, 0.72, 1.5],
    ['nedCell', 0.78, 0.16, 1.9], ['nedDock', 0.66, 0.7, 1.5],
    ['nedSpotlight', 0.4, 0.16, 1.6], ['nedSkylight', 0.52, 0.9, 1.6]
  ];

  var NE = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._ne = {
        WW: WW, HH: HH,
        zones: [], lanes: [], trails: [], patches: [], mobWarns: [],
        rails: [], crateCount: 0, bossArmed: false, _diedBound: false,
        drones: [], adWalls: [], breach: null,
        arena: { x: 0.8 * WW, y: 0.82 * HH, rx: 0.16 * WW, ry: 0.13 * HH },
        canyon: { y: 0.62 * HH, half: 0.055 * HH },
        crossings: [0.22, 0.53, 0.78], crossHalf: 0.05 * WW,
        patrol: { phase: 'idle', nextPassAt: 0, warnUntil: 0, strikeAt: 0, goneAt: 0,
                  mode: 'lanes', strikes: [], searchG: null, sil: null, arenaTarget: false }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- base wet rooftop + turf regions (masked tilesprites) ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'netRoof').setDepth(-23);
      // street canyon band (asphalt, wraps W-E)
      scene.add.tileSprite(WW / 2, C.canyon.y, WW, C.canyon.half * 2, 'netAsphalt').setDepth(-22);
      // mirror promenade (wraps N-S)
      scene.add.tileSprite(0.33 * WW, HH / 2, 0.1 * WW, HH, 'netMirror').setDepth(-22);
      NE._region(scene, 0.16 * WW, 0.2 * HH, 0.16 * WW, 0.16 * HH, 'netTagged', -21.5);   // tagged quarter NW
      NE._region(scene, 0.62 * WW, 0.22 * HH, 0.2 * WW, 0.16 * HH, 'netMirror', -21.5);    // corp plaza NE
      NE._region(scene, 0.8 * WW, 0.16 * HH, 0.1 * WW, 0.1 * HH, 'netAdFloor', -21.4);     // ad floor (viper turf)
      NE._region(scene, 0.5 * WW, 0.42 * HH, 0.12 * WW, 0.1 * HH, 'netAdFloor', -21.4);
      NE._region(scene, 0.14 * WW, 0.86 * HH, 0.13 * WW, 0.1 * HH, 'netCracked', -21.5);   // old quarter SW
      // cable-run crossings over the canyon
      C.crossings.forEach(function (cxf) {
        scene.add.tileSprite(cxf * WW, C.canyon.y, C.crossHalf * 1.7, C.canyon.half * 2.4, 'netCable').setDepth(-21.8);
      });
      // helipad arena (SE) — the crash site
      var A = C.arena;
      NE._region(scene, A.x, A.y, A.rx, A.ry, 'netHelipad', -21);
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0xffb02e, 0.5); rg.strokeEllipse(A.x, A.y, A.rx * 1.7, A.ry * 1.7);

      // ---- decor ----
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });

      // ---- the permanent APACHE WRECK at the pad's NW edge (solid cover) ----
      C.wreckBodies = scene.physics.add.staticGroup();
      var wx = A.x - A.rx * 0.7, wy = A.y - A.ry * 0.55;
      C.wreck = scene.add.sprite(wx, wy, 'neonWreck').setScale(1.5).setDepth(3);
      var wb = C.wreckBodies.create(wx, wy, 'neonWreck').setScale(1.5).setVisible(false);
      wb.body.setSize(wb.width * 0.5, wb.height * 0.32);
      // skid scar cosmetic
      var sk = scene.add.graphics().setDepth(-19.5);
      sk.lineStyle(6, 0x0e0e14, 0.5);
      sk.lineBetween(A.x - A.rx, A.y - A.ry, wx, wy);

      // ---- FIRE ESCAPE railings — destructible fences along roof edges ----
      C.railBodies = scene.physics.add.staticGroup();
      [[0.32, 0.4], [0.42, 0.4], [0.55, 0.52], [0.66, 0.52],
       [0.28, 0.74], [0.4, 0.74], [0.7, 0.32], [0.82, 0.7]].forEach(function (F) {
        NE._addRail(scene, C, F[0] * WW, F[1] * HH);
      });

      // ---- spawn at the tagged quarter (NW) ----
      scene._realmStart = { x: 0.15 * WW, y: 0.2 * HH };

      // mob-verb helpers (fresh closures)
      scene._nePunk = function (m, p, t) { return NE._punk(scene, m, p, t); };
      scene._neDrone = function (m, p, t) { return NE._drone(scene, m, p, t); };
      scene._neEnforcer = function (m, p, t) { return NE._enforcer(scene, m, p, t); };
      scene._neNetrunner = function (m, p, t) { return NE._netrunner(scene, m, p, t); };
      scene._neTurret = function (m, p, t) { return NE._turret(scene, m, p, t); };
      scene._neRats = function (m, p, t) { return NE._rats(scene, m, p, t); };
      scene._neLifter = function (m, p, t) { return NE._lifter(scene, m, p, t); };
      scene._neViper = function (m, p, t) { return NE._viper(scene, m, p, t); };
      scene._neLoader = function (m, p, t) { return NE._loader(scene, m, p, t); };
    },

    _region: function (scene, cx, cy, rx, ry, tex, depth) {
      var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, tex).setDepth(depth);
      var mg = scene.make.graphics({ add: false });
      mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
      spr.setMask(mg.createGeometryMask());
    },
    _addRail: function (scene, C, x, y) {
      var spr = C.railBodies.create(x, y, 'neonRail0').setScale(1.4).setDepth(3);
      spr.body.setSize(spr.width * 0.8, spr.height * 0.4);
      var cfg = scene.realmDef.fence || { hp: 24 };
      C.rails.push({ spr: spr, x: x, y: y, hp: cfg.hp, maxHp: cfg.hp, state: 0, down: false });
    },
    // FIRE ESCAPE railing deterioration: bend (neonRail1) -> shear (neonRail2,
    // body off, clears out of the way). Fire escapes don't regrow.
    _railState: function (scene, RA, time) {
      if (RA.hp <= 0) {
        RA.down = true; RA.state = 2;
        try { RA.spr.setTexture('neonRail2'); } catch (e) {}
        if (RA.spr.body) RA.spr.body.enable = false;
        scene.time.delayedCall(140, function () { if (RA.spr && RA.spr.active && RA.down) RA.spr.setVisible(false); });
        scene.burst(RA.x, RA.y, 14, 0xffb02e);
        try { AUDIO.play('cratedrop'); } catch (e) {}
      } else {
        var ns = (RA.hp / RA.maxHp) > 0.5 ? 0 : 1;
        if (ns !== RA.state) { RA.state = ns; try { RA.spr.setTexture(ns === 0 ? 'neonRail0' : 'neonRail1'); } catch (e) {} }
        RA.spr.setTintFill(0xffffff);
        (function (R) { scene.time.delayedCall(50, function () { if (R.spr && R.spr.active) R.spr.clearTint(); }); })(RA);
        try { AUDIO.play('shieldclang'); } catch (e) {}
      }
    },

    afterCreate: function (scene) {
      var C = scene._ne; if (!C) return;
      // ATTACH ALL COLLIDERS HERE (player + groups exist now) — never in setup()
      scene.physics.add.collider(scene.player, C.railBodies);
      scene.physics.add.collider(scene.mobs, C.railBodies);
      scene.physics.add.collider(scene.player, C.wreckBodies);
      scene.physics.add.collider(scene.mobs, C.wreckBodies);
    },

    _inArena: function (C, x, y) {
      var A = C.arena;
      return ((x - A.x) / (A.rx * 1.5)) * ((x - A.x) / (A.rx * 1.5)) + ((y - A.y) / (A.ry * 1.5)) * ((y - A.y) / (A.ry * 1.5)) < 1;
    },
    _atCrossing: function (C, x) {
      var WW = C.WW;
      for (var i = 0; i < C.crossings.length; i++) {
        var dx = Math.abs(x - C.crossings[i] * WW); dx = Math.min(dx, WW - dx);
        if (dx < C.crossHalf) return true;
      }
      return false;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._ne; if (!C) return;
      var p = scene.player, alive = p.state.alive;
      NE._bindDeath(scene, C);

      // boss-owned machinery clears when the boss is down
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        NE._clearBossMachinery(scene, C, time);
      }

      // ---- CANYON ROUTING: the street is a drop — cross only at cable runs ----
      if (alive && Math.abs(p.y - C.canyon.y) < C.canyon.half && !NE._atCrossing(C, p.x)) {
        var toTop = p.y < C.canyon.y;
        p.y = toTop ? C.canyon.y - C.canyon.half - 2 : C.canyon.y + C.canyon.half + 2;
        if (p.body) p.body.velocity.y = 0;
      }

      // ---- KINGPIN'S PATROL cycle (the signature map mechanic) ----
      NE._runPatrol(scene, C, time);

      // ---- BOSS machinery (drones / ad walls / breach / darts / hacked) ----
      if (C.bossArmed && scene.boss && scene.boss.active) NE._runBoss(scene, C, scene.boss, time, delta);

      // ---- damage patches (viper light trails + any DoT fields) ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r && PA.dmg && time >= (PA.nextTickAt || 0)) {
          PA.nextTickAt = time + PA.tickMs;
          Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'a light trail', !!PA.fromBoss);
        }
      }

      // M7k AUDIT fix: prune expired viper-trail records — each record lives in
      // BOTH C.trails and C.patches; the patches prune above destroys the obj
      // but C.trails grew forever, saturating the segMax*3 guard so vipers
      // eventually stopped leaving trails.
      for (var ti = C.trails.length - 1; ti >= 0; ti--) {
        if (time >= C.trails[ti].dieAt) C.trails.splice(ti, 1);
      }

      // ---- warn-graphic cleanup (mob died mid-telegraph) ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m || !MW.m.active) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- FIRE ESCAPE railings: player shots deteriorate them -> SHEAR
      // (this map's DESTRUCTIBLE fences — bend -> shear -> clatter, no regrow) ----
      var rshots = scene.playerShots;
      if (rshots) for (var ri = 0; ri < C.rails.length; ri++) {
        var RA = C.rails[ri];
        if (RA.down) continue;
        rshots.children.iterate(function (s) {
          if (!s || !s.active || RA.down) return;
          if (Math.hypot(s.x - RA.x, s.y - RA.y) < 34) {
            RA.hp -= (s.proj ? s.proj.dmg : 5);
            NE._railState(scene, RA, time);
            if (!s.proj || !s.proj.pierce) Entities.killProjectile(rshots, s);
          }
        });
      }

      NE._wrap(scene, C);
      NE._runZones(scene, C, time);
      NE._runLanes(scene, C, time);
    },

    _bindDeath: function (scene, C) {
      if (C._diedBound) return;
      C._diedBound = true;
      scene.events.on('mob-died', function (mob) {
        if (!mob || !mob.mob) return;
        if (mob.mob.crateChild) C.crateCount = Math.max(0, C.crateCount - 1);
      });
    },

    // ================================================== KINGPIN'S PATROL ===
    _runPatrol: function (scene, C, time) {
      var P = C.patrol, cfg = scene.realmDef.patrol, p = scene.player, WW = C.WW, HH = C.HH;
      if (!P.nextPassAt) P.nextPassAt = time + cfg.firstAtMs;
      if (P.phase === 'idle') {
        if (P.nextPassAt === Infinity || time < P.nextPassAt) return;
        // BACKUP never overlaps SYSTEM BREACH resolution — hold the pass
        if (P.arenaTarget && C.breach) { P.nextPassAt = time + 2000; return; }
        P.phase = 'warn';
        P.warnUntil = time + cfg.warnMs;
        P.strikeAt = time + cfg.warnMs;
        P.mode = (P.mode === 'lanes') ? 'circles' : 'lanes';   // alternate, never both
        // path: across the roofs, OR raking the arena when it's his backup
        var A = C.arena;
        if (P.arenaTarget) { P.px0 = A.x - A.rx * 1.2; P.py0 = A.y - A.ry; P.px1 = A.x + A.rx * 1.2; P.py1 = A.y + A.ry; }
        else { P.px0 = 0.05 * WW; P.py0 = 0.34 * HH; P.px1 = 0.95 * WW; P.py1 = 0.42 * HH; }
        // searchlight sweep + rotor swell
        P.searchG = scene.add.graphics().setDepth(9);
        P.sil = scene.add.sprite(P.px0, P.py0 - 60, 'neonHeli').setScale(1.1).setDepth(31).setTint(0x223044).setAlpha(0.9);
        try { AUDIO.play('patrolrotor'); } catch (e) {}
        try { AUDIO.play('searchping'); } catch (e) {}
        scene.banner('KINGPIN PATROL INBOUND\nsearchlight sweeping — ' + (P.mode === 'lanes' ? 'STRAFE LANES' : 'ROCKET CIRCLES'), '#ff9aa0');
        return;
      }
      if (P.phase === 'warn') {
        var tt = Math.max(0, Math.min(1, 1 - (P.warnUntil - time) / cfg.warnMs));
        var sx = P.px0 + (P.px1 - P.px0) * tt, sy = P.py0 + (P.py1 - P.py0) * tt;
        if (P.searchG) { P.searchG.clear(); P.searchG.fillStyle(0xffe0a0, 0.12); P.searchG.fillEllipse(sx, sy, 90, 60); P.searchG.lineStyle(2, 0xffe0a0, 0.6); P.searchG.strokeEllipse(sx, sy, 90, 60); }
        if (P.sil) { P.sil.x = sx; P.sil.y = sy - 60; }
        if (time < P.strikeAt) return;
        // STRIKE — schedule telegraphed lanes OR circles along the path
        P.phase = 'strike';
        P.strikes = [];
        if (P.mode === 'lanes') {
          for (var i = 0; i < cfg.laneCount; i++) {
            var f = cfg.laneCount === 1 ? 0.5 : i / (cfg.laneCount - 1);
            var lx = P.px0 + (P.px1 - P.px0) * f;
            var L = { x0: lx, y0: 0, x1: lx, y1: HH };
            NE._lane(scene, C, L, cfg.laneHalf, 700 + i * cfg.strikeGapMs, cfg.laneDmg, "the patrol's strafe", P.arenaTarget);
          }
        } else {
          for (var j = 0; j < cfg.circleCount; j++) {
            var g = cfg.circleCount === 1 ? 0.5 : j / (cfg.circleCount - 1);
            var cxp = P.px0 + (P.px1 - P.px0) * g, cyp = P.py0 + (P.py1 - P.py0) * g;
            NE._zone(scene, C, cxp, cyp, cfg.circleR, 700 + j * cfg.strikeGapMs, cfg.circleDmg, "the patrol's rockets", P.arenaTarget, false, time, null);
          }
        }
        try { AUDIO.play('strafe'); } catch (e) {}
        P.goneAt = time + 700 + cfg.strikeGapMs * Math.max(cfg.laneCount, cfg.circleCount) + 900;
        return;
      }
      if (P.phase === 'strike') {
        if (P.sil) P.sil.x += (P.arenaTarget ? -6 : 8);       // chopper exits
        if (time < P.goneAt) return;
        if (P.searchG) { try { P.searchG.destroy(); } catch (e) {} P.searchG = null; }
        if (P.sil) { try { P.sil.destroy(); } catch (e) {} P.sil = null; }
        P.phase = 'idle';
        P.nextPassAt = time + cfg.periodMs;
      }
    },

    // ================================================= BOSS MACHINERY ======
    _initBoss: function (scene, b, time) {
      var bs = b.boss; if (bs._neInit) return;
      bs._neInit = true;
      var C = scene._ne, PT = bs.def.patterns;
      bs.verbIdx = 0;
      bs.nextVerbAt = time + 2600;
      bs.nextBreachAt = time + 15000;
      bs.busyUntil = 0; bs.rootUntil = 0;
      bs.ventedUntil = 0; bs.ventDmgMult = PT.systemBreach.ventDmgMult;
      bs.backupOn = false;
      NE._spawnDrones(scene, b, time);
      C.bossArmed = true;
    },
    _spawnDrones: function (scene, b, time) {
      var C = scene._ne, cfg = b.boss.def.patterns.firewall;
      C.drones = [];
      for (var i = 0; i < cfg.count; i++) {
        var ang = i / cfg.count * Math.PI * 2;
        var spr = scene.add.sprite(b.x + Math.cos(ang) * cfg.orbitR, b.y + Math.sin(ang) * cfg.orbitR, 'neonFirewallDrone').setScale(1.1).setDepth(7);
        C.drones.push({ spr: spr, hp: cfg.hp, maxHp: cfg.hp, angle: ang, alive: true, respawnAt: 0 });
      }
      try { AUDIO.play('dronehum'); } catch (e) {}
    },
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._ne;
      NE._initBoss(scene, b, time);
      var anyDrone = C.drones.some(function (d) { return d.alive; });
      var vented = bs.ventedUntil && time < bs.ventedUntil;
      // FIREWALL GATE — untouchable while any shield drone lives (airtight:
      // hurtBoss honors bs.immune for EVERY damage source, DoT included).
      bs.immune = anyDrone && !vented;
      // <50% HP -> the patrol becomes his BACKUP (targets the arena)
      if (!bs.backupOn && bs.hp <= bs.maxHp * PT.backup.hpPct) {
        bs.backupOn = true; C.patrol.arenaTarget = true;
        C.patrol.nextPassAt = time + 4000;
        scene.banner('CALLING IN BACKUP\nthe patrol chopper turns on the pad — watch the searchlight', '#ff9aa0');
      }
      // movement — struts slowly while shielded, closes when naked; rooted on cue
      if (C.breach && C.breach.phase === 'warn') { b.setVelocity(0, 0); }
      else if (time < bs.rootUntil) { b.setVelocity(0, 0); }
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (anyDrone ? 0.5 : 1);
        if (d > 140) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
        // keep him on the pad
        var A = C.arena, ad = Math.hypot(b.x - A.x, b.y - A.y);
        if (ad > A.rx * 1.4) { b.x = A.x + (b.x - A.x) / ad * A.rx * 1.4; b.y = A.y + (b.y - A.y) / ad * A.rx * 1.4; }
      }
      if (time < bs.busyUntil) return;
      // SIGNATURE — SYSTEM BREACH on its own clock (won't overlap backup)
      if (time >= bs.nextBreachAt && !C.breach) {
        bs.nextBreachAt = time + 22000;
        NE._systemBreach(scene, b, time);
        return;
      }
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs;
        var v = ['darts', 'ads', 'remote', 'darts'][bs.verbIdx % 4];
        bs.verbIdx++;
        if (v === 'darts') NE._ddosDarts(scene, b, player, time);
        else if (v === 'ads') NE._popupAds(scene, b, time);
        else NE._remoteAccess(scene, b, time);
      }
    },

    // FIREWALL drones + AD walls + BREACH + DDOS darts, per frame.
    _runBoss: function (scene, C, b, time, delta) {
      var bs = b.boss, PT = bs.def.patterns, p = scene.player, cfg = PT.firewall;
      var vented = bs.ventedUntil && time < bs.ventedUntil;
      // ---- firewall drones: orbit, shootable, respawn (paused while vented) ----
      var anyAlive = false;
      C.drones.forEach(function (d) {
        if (d.alive) {
          anyAlive = true;
          d.angle += cfg.orbitSpd * delta;
          d.spr.x = b.x + Math.cos(d.angle) * cfg.orbitR;
          d.spr.y = b.y + Math.sin(d.angle) * cfg.orbitR;
          d.spr.setVisible(true);
          // player shots pop them
          var shots = scene.playerShots;
          if (shots) shots.children.iterate(function (s) {
            if (!s || !s.active) return;
            if (Math.hypot(s.x - d.spr.x, s.y - d.spr.y) < 22) {
              d.hp -= s.proj ? s.proj.dmg : 5;
              d.spr.setTintFill(0xffffff);
              (function (sp) { scene.time.delayedCall(50, function () { if (sp.active) sp.clearTint(); }); })(d.spr);
              if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
              if (d.hp <= 0) {
                d.alive = false; d.spr.setVisible(false);
                d.respawnAt = time + cfg.respawnMs;
                scene.burst(d.spr.x, d.spr.y, 12, 0xffb02e);
                try { AUDIO.play('dronepop'); } catch (e) {}
              }
            }
          });
        } else {
          d.spr.setVisible(false);
          if (!vented && time >= d.respawnAt && d.respawnAt !== Infinity) {
            d.alive = true; d.hp = d.maxHp;
            scene.burst(b.x, b.y, 8, 0xffb02e);
            try { AUDIO.play('dronehum'); } catch (e) {}
          }
        }
      });
      bs.immune = anyAlive && !vented;
      // hex firewall bubble cosmetic
      if (!C._bubbleG) C._bubbleG = scene.add.graphics().setDepth(5);
      C._bubbleG.clear();
      if (anyAlive) { C._bubbleG.lineStyle(2, 0xffb02e, 0.5); C._bubbleG.strokeCircle(b.x, b.y, cfg.orbitR); }

      // ---- POP-UP AD walls: block PLAYER shots ONLY (his darts pass) ----
      for (var ai = C.adWalls.length - 1; ai >= 0; ai--) {
        var W = C.adWalls[ai];
        if (time >= W.dieAt || W.hp <= 0) {
          scene.burst(W.x, W.y, 14, 0xff2e88);
          try { W.spr.destroy(); } catch (e) {}
          C.adWalls.splice(ai, 1);
          continue;
        }
        var shots2 = scene.playerShots;
        if (shots2) shots2.children.iterate(function (s) {
          if (!s || !s.active) return;
          if (Math.abs(s.x - W.x) < W.bw && Math.abs(s.y - W.y) < W.bh) {
            W.hp -= s.proj ? s.proj.dmg : 5;
            Entities.killProjectile(shots2, s);          // YOUR shot is eaten
            var st = Math.min(3, Math.floor((1 - W.hp / W.maxHp) * 4));
            if (st !== W.state) { W.state = st; W.spr.setTexture('neonAd' + st); try { AUDIO.play('adwallpop'); } catch (e) {} }
          }
        });
      }

      // ---- hacked REMOTE-ACCESS turrets: red glow, fromBoss (tag once) ----
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && m.mob && m.mob.bossWave && m.mob.def && m.mob.def.mapVerb === 'turretLanes' && !m.mob.hacked) {
          m.mob.hacked = true; m.setTint(0xff3a4a);
        }
      });

      // ---- SYSTEM BREACH state machine ----
      if (C.breach) NE._runBreach(scene, C, b, time);

      // ---- DDOS darts: slow homing, capped turn rate ----
      var es = scene.enemyShots;
      if (es) es.children.iterate(function (s) {
        if (!s || !s.active || !s.proj || !s.proj._ddos) return;
        var vx = s.body.velocity.x, vy = s.body.velocity.y, sp = Math.hypot(vx, vy) || 1;
        var cur = Math.atan2(vy, vx), want = Math.atan2(p.y - s.y, p.x - s.x);
        var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
        var turn = s.proj._turn * (delta / 1000) * 6;
        var na = cur + Math.max(-turn, Math.min(turn, diff));
        s.body.velocity.x = Math.cos(na) * sp; s.body.velocity.y = Math.sin(na) * sp;
      });
    },

    _ddosDarts: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.ddosDarts;
      var base = Math.atan2(player.y - b.y, player.x - b.x);
      for (var i = 0; i < cfg.count; i++) {
        var a = base + (i - (cfg.count - 1) / 2) * 0.28;
        var s = Entities.fireProjectile(scene, scene.enemyShots, b.x, b.y, a, cfg.projSpeed, cfg.dmg, cfg.lifeMs, 'orbShot', false, 'the Social Engineer');
        if (s) { s.setTint(0xff3a4a); s.proj.fromBoss = true; s.proj._ddos = true; s.proj._turn = cfg.turnRate; }
      }
      try { AUDIO.play('ddoszip'); } catch (e) {}
      b.boss.busyUntil = time + 700;
      scene.banner('DDOS DARTS\nslow homing bolts — keep moving', '#ff9aa0');
    },
    _popupAds: function (scene, b, time) {
      var C = scene._ne, cfg = b.boss.def.patterns.popupAds, A = C.arena;
      var spots = [[A.x - A.rx * 0.5, A.y + A.ry * 0.2], [A.x + A.rx * 0.4, A.y - A.ry * 0.2], [A.x, A.y + A.ry * 0.5]];
      for (var i = 0; i < cfg.count && i < spots.length; i++) {
        var sx = spots[i][0], sy = spots[i][1];
        var spr = scene.add.sprite(sx, sy, 'neonAd0').setScale(1.4).setDepth(4);
        C.adWalls.push({ spr: spr, x: sx, y: sy, hp: cfg.hp, maxHp: cfg.hp, state: 0,
                         bw: cfg.blockR, bh: cfg.blockR * 1.6, dieAt: time + cfg.lifeMs });
      }
      try { AUDIO.play('adwallpop'); } catch (e) {}
      scene.banner('POP-UP ADS\nthey block YOUR shots — his darts phase through', '#ff2e88');
      b.boss.busyUntil = time + 500;
    },
    _remoteAccess: function (scene, b, time) {
      var C = scene._ne, cfg = b.boss.def.patterns.remoteAccess, A = C.arena;
      var spots = [[A.x - A.rx * 0.8, A.y - A.ry * 0.3], [A.x + A.rx * 0.8, A.y + A.ry * 0.3]];
      for (var i = 0; i < cfg.count && i < spots.length; i++) {
        NE._zone(scene, C, spots[i][0], spots[i][1], 44, 900, 0, 'a hacked vent', true, false, time, { hackTurret: true });
      }
      try { AUDIO.play('turrethack'); } catch (e) {}
      scene.banner('REMOTE ACCESS\nhe hacks the vents — turrets rise with his glow', '#ff3a4a');
      b.boss.busyUntil = time + 700;
    },
    _systemBreach: function (scene, b, time) {
      var C = scene._ne, cfg = b.boss.def.patterns.systemBreach, A = C.arena;
      if (C.breach) return;
      try { AUDIO.play('breachslam'); } catch (e) {}
      try { AUDIO.play('deckkeys'); } catch (e) {}
      scene.cameras.main.shake(180, 0.008);
      var cells = [];
      var x0 = A.x - A.rx * 1.1, y0 = A.y - A.ry * 1.1, sxw = A.rx * 2.2 / (cfg.cols - 1), syw = A.ry * 2.2 / (cfg.rows - 1);
      for (var r = 0; r < cfg.rows; r++) for (var c = 0; c < cfg.cols; c++) {
        var cxp = x0 + c * sxw, cyp = y0 + r * syw;
        var order = r + c;                                  // spreading grid (diagonal wavefront)
        var g = scene.add.rectangle(cxp, cyp, cfg.cellR * 1.8, cfg.cellR * 1.8, 0x39ff6a, 0.1)
          .setStrokeStyle(2, 0x39ff6a, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs + order * cfg.spreadGapMs });
        cells.push({ x: cxp, y: cyp, at: time + cfg.warnMs + order * cfg.spreadGapMs, g: g, fired: false });
      }
      C.breach = { cells: cells, phase: 'warn', glitchUntil: 0, glitchFx: null };
      var span = cfg.warnMs + (cfg.rows + cfg.cols) * cfg.spreadGapMs;
      b.boss.busyUntil = time + span + 300;
      b.boss.rootUntil = time + span;
      scene.banner('SYSTEM BREACH\nthe floor corrupts in a spreading grid — MOVE', '#39ff6a');
    },
    _runBreach: function (scene, C, b, time) {
      var B = C.breach, cfg = b.boss.def.patterns.systemBreach, p = scene.player;
      if (B.phase === 'warn') {
        var all = true;
        for (var i = 0; i < B.cells.length; i++) {
          var cell = B.cells[i];
          if (cell.fired) continue;
          if (time < cell.at) { all = false; continue; }
          cell.fired = true;
          try { cell.g.destroy(); } catch (e) {}
          scene.burst(cell.x, cell.y, 8, 0x39ff6a);
          if (p.state.alive && Math.abs(p.x - cell.x) < cfg.cellR && Math.abs(p.y - cell.y) < cfg.cellR)
            Entities.hurtPlayer(scene, p, cfg.dmg, time, 'a system breach', true);
        }
        if (all) {
          B.phase = 'glitch'; B.glitchUntil = time + cfg.glitchMs;
          try { AUDIO.play('glitchdet'); } catch (e) {}
          var W = scene.scale.width, H = scene.scale.height;
          B.glitchFx = scene.add.graphics().setScrollFactor(0).setDepth(70);
          B.glitchFx.fillStyle(0x39ff6a, 0.16);
          B.glitchFx.fillRect(0, 0, W, 10); B.glitchFx.fillRect(0, H - 10, W, 10);
          B.glitchFx.fillRect(0, 0, 10, H); B.glitchFx.fillRect(W - 10, 0, 10, H);
        }
      } else if (B.phase === 'glitch') {
        if (time >= B.glitchUntil) {
          // OVERHEAT VENT — deck smoking, drones drop, vented x1.5
          B.phase = 'vent';
          if (B.glitchFx) { try { B.glitchFx.destroy(); } catch (e) {} B.glitchFx = null; }
          C.drones.forEach(function (d) { d.alive = false; d.respawnAt = time + cfg.ventMs; if (d.spr) d.spr.setVisible(false); });
          b.boss.immune = false;
          b.boss.ventedUntil = time + cfg.ventMs;
          b.boss.ventDmgMult = cfg.ventDmgMult;
          try { b.setTexture('neonBossVentHi'); } catch (e) {}
          try { AUDIO.play('ventalarm'); } catch (e) {}
          scene.banner('DECK SMOKING — HIT HIM NOW\nthe firewall is down, he takes 1.5x', '#ffb02e');
        }
      } else if (B.phase === 'vent') {
        if (time >= b.boss.ventedUntil) {
          try { b.setTexture('neonBossHi'); } catch (e) {}
          C.breach = null;
        }
      }
    },
    _clearBossMachinery: function (scene, C, time) {
      C.drones.forEach(function (d) { if (d.spr) { try { d.spr.destroy(); } catch (e) {} } });
      C.drones = [];
      if (C._bubbleG) { try { C._bubbleG.clear(); } catch (e) {} }
      C.adWalls.forEach(function (W) { try { W.spr.destroy(); } catch (e) {} });
      C.adWalls = [];
      if (C.breach) { C.breach.cells.forEach(function (cell) { if (!cell.fired) { try { cell.g.destroy(); } catch (e) {} } }); if (C.breach.glitchFx) { try { C.breach.glitchFx.destroy(); } catch (e) {} } C.breach = null; }
      // hacked turrets die with him
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.hacked) scene.killMobCredited(m); });
      C.patrol.arenaTarget = false;
    },

    // ================================================== BOSS ARRIVAL =======
    // The Kingpin's Apache streaks in SMOKING, crashes onto the pad (shake),
    // skids, slumps as the WRECK; the door kicks open, the SOCIAL ENGINEER
    // hops out. Title card, THEN the scouter.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._ne, self = scene, A = C.arena;
      C.patrol.nextPassAt = Infinity;                         // roofs go quiet for the crash
      scene.player.setPosition(A.x - A.rx * 0.5, A.y + A.ry * 0.7);
      scene.cameras.main.centerOn(A.x, A.y);
      var heli = scene.add.sprite(A.x - 520, A.y - 380, 'neonHeli').setScale(1.5).setDepth(31);
      try { AUDIO.play('crashwhine'); } catch (e) {}
      scene.tweens.add({ targets: heli, x: A.x - A.rx * 0.6, y: A.y - A.ry * 0.5, angle: 46,
        duration: def.entranceMs * 0.5, ease: 'Quad.In' });
      scene.banner('INCOMING\nthe Kingpin\'s bird is coming down SMOKING', '#ff9aa0');
      scene.time.delayedCall(def.entranceMs * 0.5, function () {
        if (self.closing) return;
        self.cameras.main.shake(360, 0.014);
        self.burst(A.x - A.rx * 0.6, A.y - A.ry * 0.5, 26, 0xffb02e);
        try { AUDIO.play('loaderslam'); } catch (e) {}
        try { heli.destroy(); } catch (e) {}
      });
      scene.time.delayedCall(def.entranceMs * 0.6, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, A.x, A.y);
        if (self.boss) {
          NE._initBoss(self, self.boss, self.time.now);
          self.burst(self.boss.x, self.boss.y, 16, 0xffb02e);
          try { AUDIO.play('deckkeys'); } catch (e) {}
        }
        C.bossArmed = true;
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // M7k AUDIT fix: the quota boss portal could land INSIDE the impassable
    // street-canyon strip (roof-level-blocked off the cable runs) — softlock.
    // Nudge it onto the player's side of the canyon, clamped into the world.
    bossPortalSpot: function (scene, x, y) {
      var C = scene._ne; if (!C) return null;
      if (Math.abs(y - C.canyon.y) < C.canyon.half + 24 && !NE._atCrossing(C, x)) {
        var side = scene.player.y < C.canyon.y ? -1 : 1;
        var ny = C.canyon.y + side * (C.canyon.half + 60);
        ny = Math.max(100, Math.min(C.HH - 100, ny));
        return { x: x, y: ny };
      }
      return null;
    },

    // M7k AUDIT fix: a mid-verb death (breach grid mid-warn, glitch border,
    // firewall drones, ad walls) left telegraph graphics painted until the
    // NEXT update tick — onBossDown now tears the machinery down immediately.
    bossCleanup: function (scene, boss) {
      var C = scene._ne; if (!C) return;
      C.bossArmed = false;
      NE._clearBossMachinery(scene, C, scene.time.now);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._ne; if (!C) return;
      var P = C.patrol;
      ['nextPassAt', 'warnUntil', 'strikeAt', 'goneAt'].forEach(function (k) { if (P[k] && P[k] !== Infinity) P[k] += dt; });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      // M7k AUDIT fix: every C.trails record ALSO lives in C.patches — shifting
      // both arrays moved the same record's clocks twice. Shift patches only.
      C.patches.forEach(function (pa) { if (pa.dieAt !== Infinity) pa.dieAt += dt; if (pa.nextTickAt) pa.nextTickAt += dt; });
      C.drones.forEach(function (d) { if (d.respawnAt && d.respawnAt !== Infinity) d.respawnAt += dt; });
      C.adWalls.forEach(function (W) { W.dieAt += dt; });
      if (C.breach) { C.breach.cells.forEach(function (cell) { if (!cell.fired) cell.at += dt; }); if (C.breach.glitchUntil) C.breach.glitchUntil += dt; }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['nextSwingAt', 'swingLockUntil', 'nextFireAt', 'aimLockUntil', 'fireUntil',
         'nextShoveAt', 'shoveLockUntil', 'nextZoneAt', 'risenAt', 'nextLaneAt',
         'nextDashAt', 'dashUntil', 'nextDropAt', 'dashLockUntil', 'nextComboAt',
         'chargeLockUntil', 'chargeUntil'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });
        if (m.mob.pound && m.mob.pound.until) m.mob.pound.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextBreachAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._ne; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } });
      C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      C.lanes = [];
      C.trails.forEach(function (t) { if (t.obj) { try { t.obj.destroy(); } catch (e) {} } });
      C.trails = [];
      C.patches.forEach(function (pa) { if (pa.obj) { try { pa.obj.destroy(); } catch (e) {} } });
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} });
      C.mobWarns = [];
      var P = C.patrol;
      if (P.searchG) { try { P.searchG.destroy(); } catch (e) {} P.searchG = null; }
      if (P.sil) { try { P.sil.destroy(); } catch (e) {} P.sil = null; }
      P.phase = 'idle'; P.strikes = [];
    },

    // =============================================== MOB VERBS (map-new) ===
    // STREET PUNK — chain spin-up glint -> short warned swing arc.
    _punk: function (scene, m, player, time) {
      var cfg = m.mob.def.swing, C = scene._ne;
      if (m.mob.swingLockUntil) {
        if (time < m.mob.swingLockUntil) { m.setVelocity(0, 0); m.setTint(Math.floor(time / 90) % 2 ? 0xff2e88 : 0xffffff); return true; }
        m.mob.swingLockUntil = 0; m.clearTint();
        if (m.mob._swingWarn) { m.mob._swingWarn.m = null; m.mob._swingWarn = null; }
        var ang = m.mob._swingAng, mx = m.x, my = m.y;
        var fg = scene.add.graphics().setDepth(9);
        fg.fillStyle(0xff9ac8, 0.5); fg.slice(mx, my, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        try { AUDIO.play('chainswing'); } catch (e) {}
        if (player.state.alive) {
          var pd = Math.hypot(player.x - mx, player.y - my), pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
            Entities.hurtPlayer(scene, player, cfg.dmg, scene.time.now, "a Street Punk's chain");
            player.body.velocity.x += Math.cos(ang) * cfg.kb; player.body.velocity.y += Math.sin(ang) * cfg.kb;
          }
        }
        return true;
      }
      if (!m.mob.nextSwingAt) m.mob.nextSwingAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSwingAt && d < cfg.range + 30 && player.state.alive) {
        m.mob.nextSwingAt = time + cfg.everyMs;
        m.mob.swingLockUntil = time + cfg.warnMs;
        m.mob._swingAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xff2e88, 0.13); g.lineStyle(2, 0xff9ac8, 0.85);
        g.slice(m.x, m.y, cfg.range, m.mob._swingAng - cfg.halfRad, m.mob._swingAng + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        m.mob._swingWarn = { m: m, g: g }; C.mobWarns.push(m.mob._swingWarn);
        return true;
      }
      return false;                                           // core chase
    },
    // SPY DRONE — hovers; thin aim-line telegraph -> laser beam along it.
    _drone: function (scene, m, player, time) {
      var cfg = m.mob.def.laser;
      if (m.mob.fireUntil) { if (time >= m.mob.fireUntil) m.mob.fireUntil = 0; m.setVelocity(0, 0); return true; }
      if (m.mob.aimLockUntil) {
        if (time >= m.mob.aimLockUntil) {
          m.mob.aimLockUntil = 0;
          if (m.mob._aimWarn) { try { m.mob._aimWarn.g.destroy(); } catch (e) {} m.mob._aimWarn = null; }
          var a = m.mob._aimAng;
          NE._beam(scene, m.x, m.y, m.x + Math.cos(a) * cfg.len, m.y + Math.sin(a) * cfg.len, cfg.half, cfg.dmg, "a Spy Drone's laser", false, time);
          try { AUDIO.play('dronelaser'); } catch (e) {}
          m.mob.fireUntil = time + cfg.fireMs;
        } else m.setVelocity(0, 0);
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.nextFireAt) m.mob.nextFireAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextFireAt && d < cfg.hover + 160 && player.state.alive) {
        m.mob.nextFireAt = time + cfg.everyMs;
        m.mob.aimLockUntil = time + cfg.warnMs;
        m.mob._aimAng = Math.atan2(player.y - m.y, player.x - m.x);
        var x1 = m.x + Math.cos(m.mob._aimAng) * cfg.len, y1 = m.y + Math.sin(m.mob._aimAng) * cfg.len;
        m.mob._aimWarn = { g: NE._laneWarn(scene, m.x, m.y, x1, y1, cfg.half, 0x22d6ee) };
        return true;
      }
      // hover at range
      var spd = m.mob.def.spd;
      if (d < cfg.hover - 30) { var af = Math.atan2(m.y - player.y, m.x - player.x); m.setVelocity(Math.cos(af) * spd, Math.sin(af) * spd); }
      else if (d > cfg.hover + 50) { var at = Math.atan2(player.y - m.y, player.x - m.x); m.setVelocity(Math.cos(at) * spd, Math.sin(at) * spd); }
      else m.setVelocity(0, 0);
      return true;
    },
    // RIOT ENFORCER — frontal shield BLOCK + warned baton shove.
    _enforcer: function (scene, m, player, time) {
      var cfg = m.mob.def.enforcer;
      if (m.mob._shHp === undefined) m.mob._shHp = m.mob.hp;
      if (m.mob.shoveLockUntil) {
        if (time < m.mob.shoveLockUntil) { m.setVelocity(0, 0); return true; }  // facing LOCKED (flank window)
        m.mob.shoveLockUntil = 0;
        if (m.mob._shoveWarn) { m.mob._shoveWarn.m = null; m.mob._shoveWarn = null; }
        var ang = m.mob.blockFacing, mx = m.x, my = m.y;
        var fg = scene.add.graphics().setDepth(9);
        fg.fillStyle(0xffe0a0, 0.5); fg.slice(mx, my, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        try { AUDIO.play('batonshove'); } catch (e) {}
        if (player.state.alive) {
          var pd = Math.hypot(player.x - mx, player.y - my), pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
            Entities.hurtPlayer(scene, player, cfg.dmg, scene.time.now, "a Riot Enforcer's baton", false);
            player.body.velocity.x += Math.cos(ang) * cfg.kb; player.body.velocity.y += Math.sin(ang) * cfg.kb;
          }
        }
        m.mob._shHp = m.mob.hp;
        return true;
      }
      // face the player (except while a shove is locked)
      m.mob.blockFacing = Math.atan2(player.y - m.y, player.x - m.x);
      // SHIELD BLOCK — frontal hits are refunded; flank hits land full
      if (m.mob.hp < m.mob._shHp) {
        var pa2 = Math.atan2(player.y - m.y, player.x - m.x);
        var diff2 = Math.atan2(Math.sin(pa2 - m.mob.blockFacing), Math.cos(pa2 - m.mob.blockFacing));
        if (Math.abs(diff2) < cfg.frontArc) {
          m.mob.hp = m.mob._shHp;                             // BLOCKED
          scene.damageNumber(m.x, m.y - 22, 'BLOCK', '#aefaff');
          try { AUDIO.play('shieldclang'); } catch (e) {}
        }
      }
      m.mob._shHp = m.mob.hp;
      if (!m.mob.nextShoveAt) m.mob.nextShoveAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextShoveAt && d < cfg.range && player.state.alive) {
        m.mob.nextShoveAt = time + cfg.everyMs;
        m.mob.shoveLockUntil = time + cfg.warnMs;
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xffb02e, 0.13); g.lineStyle(2, 0xffe0a0, 0.85);
        g.slice(m.x, m.y, cfg.range, m.mob.blockFacing - cfg.halfRad, m.mob.blockFacing + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        m.mob._shoveWarn = { m: m, g: g }; scene._ne.mobWarns.push(m.mob._shoveWarn);
        return true;
      }
      return false;                                           // core chase (blocked from front)
    },
    // NETRUNNER — paints warned GLITCH ZONES that detonate; flees up close.
    _netrunner: function (scene, m, player, time) {
      var cfg = m.mob.def.zone;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.fleeRange && player.state.alive) { var a = Math.atan2(m.y - player.y, m.x - player.x); m.setVelocity(Math.cos(a) * m.mob.def.spd * 1.4, Math.sin(a) * m.mob.def.spd * 1.4); }
      else m.setVelocity(0, 0);
      if (!m.mob.nextZoneAt) m.mob.nextZoneAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextZoneAt && d < cfg.range && player.state.alive) {
        m.mob.nextZoneAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var ang = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : 50 + SIM.rng() * 70;
          NE._zone(scene, scene._ne, player.x + Math.cos(ang) * rr, player.y + Math.sin(ang) * rr, cfg.radius, cfg.warnMs, cfg.dmg, 'a glitch zone', false, false, time, null);
        }
        m.setTint(0x39ff6a);
        (function (m2) { scene.time.delayedCall(240, function () { if (m2.active) m2.clearTint(); }); })(m);
        try { AUDIO.play('glitchcharge'); } catch (e) {}
        return true;
      }
      return true;                                            // manages its own move (flee/hold)
    },
    // TURRET POD — anchored; rises from a vent -> warned laser LANES in sequence.
    _turret: function (scene, m, player, time) {
      var cfg = m.mob.def.turret, fromBoss = !!m.mob.hacked;
      m.setVelocity(0, 0);                                    // ANCHORED, never moves
      if (!m.mob.risenAt) { m.mob.risenAt = time + cfg.riseMs; return true; }
      if (time < m.mob.risenAt) return true;
      if (!m.mob.nextLaneAt) m.mob.nextLaneAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLaneAt && d < 620 && player.state.alive) {
        m.mob.nextLaneAt = time + cfg.everyMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x);
        for (var i = 0; i < cfg.laneCount; i++) {
          var a = base + (i - (cfg.laneCount - 1) / 2) * 0.4;
          var L = { x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len };
          NE._lane(scene, scene._ne, L, cfg.half, cfg.warnMs + i * cfg.gapMs, cfg.dmg, 'a turret lane', fromBoss);
        }
        try { AUDIO.play('turretsweep'); } catch (e) {}
        return true;
      }
      return true;
    },
    // CYBER RATS — cheap swarm; erratic skitter dashes (individually chip).
    _rats: function (scene, m, player, time) {
      var cfg = m.mob.def.scuttle;
      if (m.mob.dashUntil) { if (time >= m.mob.dashUntil) m.mob.dashUntil = 0; return true; }
      if (!m.mob.nextDashAt) m.mob.nextDashAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.9);
      if (time >= m.mob.nextDashAt && player.state.alive) {
        m.mob.nextDashAt = time + cfg.everyMs;
        m.mob.dashUntil = time + cfg.dashMs;
        var a = Math.atan2(player.y - m.y, player.x - m.x) + (SIM.rng() - 0.5) * 0.9;
        m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
        if (SIM.rng() < 0.25) { try { AUDIO.play('ratchitter'); } catch (e) {} }
        return true;
      }
      return false;                                           // core chase between dashes
    },
    // CARGO LIFTER — flyer; warned drop circles -> crates burst into punks.
    _lifter: function (scene, m, player, time) {
      var cfg = m.mob.def.drop, C = scene._ne;
      if (!m.mob.nextDropAt) m.mob.nextDropAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextDropAt && d < cfg.range && player.state.alive) {
        m.mob.nextDropAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var ang = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : 60 + SIM.rng() * 80;
          NE._zone(scene, C, player.x + Math.cos(ang) * rr, player.y + Math.sin(ang) * rr, cfg.radius, cfg.warnMs, 0, 'a cargo drop', false, false, time,
            { crate: { key: cfg.childKey, cap: cfg.childCap } });
        }
        try { AUDIO.play('cratedrop'); } catch (e) {}
        return true;
      }
      // hover above / near the player
      if (d < 120) { var af = Math.atan2(m.y - player.y, m.x - player.x); m.setVelocity(Math.cos(af) * m.mob.def.spd, Math.sin(af) * m.mob.def.spd); }
      else if (d > 260) { var at = Math.atan2(player.y - m.y, player.x - m.x); m.setVelocity(Math.cos(at) * m.mob.def.spd, Math.sin(at) * m.mob.def.spd); }
      else m.setVelocity(0, 0);
      return true;
    },
    // NEON VIPER — warned dash that leaves a LIGHT TRAIL hazard line (short life).
    _viper: function (scene, m, player, time) {
      var cfg = m.mob.def.dash, C = scene._ne;
      if (m.mob.dashUntil) {
        if (!m.mob._lastSeg || time - m.mob._lastSeg > 55) {
          m.mob._lastSeg = time;
          if (C.trails.length < cfg.segMax * 3) {
            var obj = scene.add.circle(m.x, m.y, 14, 0x39ff6a, 0.28).setDepth(1.4);
            C.trails.push({ x: m.x, y: m.y, r: 14, dmg: cfg.trailDmg, tickMs: cfg.trailTickMs, nextTickAt: 0, dieAt: time + cfg.trailMs, obj: obj });
            C.patches.push(C.trails[C.trails.length - 1]);
          }
        }
        if (time >= m.mob.dashUntil) { m.mob.dashUntil = 0; m.setVelocity(0, 0); }
        return true;
      }
      if (m.mob.dashLockUntil) {
        if (time >= m.mob.dashLockUntil) {
          m.mob.dashLockUntil = 0;
          m.clearTint();
          m.mob.dashUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(m.mob._dashAng) * cfg.dashSpeed, Math.sin(m.mob._dashAng) * cfg.dashSpeed);
          try { AUDIO.play('viperdash'); } catch (e) {}
        } else { m.setVelocity(0, 0); m.setTint(Math.floor(time / 90) % 2 ? 0x39ff6a : 0xffffff); }
        return true;
      }
      if (!m.mob.nextDashAt) m.mob.nextDashAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextDashAt && d < cfg.range && player.state.alive) {
        m.mob.nextDashAt = time + cfg.everyMs;
        m.mob.dashLockUntil = time + cfg.warnMs;
        m.mob._dashAng = Math.atan2(player.y - m.y, player.x - m.x);
        return true;
      }
      return false;                                           // core chase between dashes
    },
    // EXO LOADER — elite mech; warned CHARGE lane -> warned SLAM circle (alternate).
    _loader: function (scene, m, player, time) {
      var cfg = m.mob.def.combo, C = scene._ne;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
        return true;
      }
      if (m.mob.chargeLockUntil) {
        if (time >= m.mob.chargeLockUntil) {
          m.mob.chargeLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
        } else m.setVelocity(0, 0);
        return true;
      }
      if (m.mob.pound) { m.setVelocity(0, 0); if (time >= m.mob.pound.until) m.mob.pound = null; return true; }
      if (!m.mob.nextComboAt) m.mob.nextComboAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextComboAt && d < cfg.range && player.state.alive) {
        m.mob.nextComboAt = time + cfg.everyMs;
        m.mob.comboIdx = (m.mob.comboIdx || 0) + 1;
        if (m.mob.comboIdx % 2 === 1) {                       // CHARGE
          m.mob.chargeLockUntil = time + cfg.chargeWarnMs;
          m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob._chargeG = NE._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.chargeLen, m.y + Math.sin(m.mob._chargeAng) * cfg.chargeLen, cfg.chargeHalf, 0xffb02e);
        } else {                                              // SLAM
          m.mob.pound = { until: time + cfg.slamWarnMs };
          NE._zone(scene, C, m.x, m.y, cfg.slamRadius, cfg.slamWarnMs, cfg.slamDmg, "an Exo Loader's slam", false, false, time, null);
          try { AUDIO.play('loaderslam'); } catch (e) {}
        }
        return true;
      }
      return false;                                           // core chase, furious
    },

    // ================================================= INTERNAL HELPERS ====
    _wrap: function (scene, C) {
      var WW = C.WW, HH = C.HH;
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
        if (!m || !m.active || !m.mob || m.mob.bossWave) return;
        if (m.mob.dashUntil || m.mob.chargeUntil) return;     // don't wrap mid-dash/charge
        wrap(m);
      });
    },
    _zone: function (scene, C, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var tint = fromBoss ? 0xffb02e : 0x39ff6a;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
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
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xffb02e : 0x39ff6a);
        if (z.dmg > 0) { scene.cameras.main.shake(80, 0.004); try { AUDIO.play('glitchdet'); } catch (e) {} }
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        // CARGO LIFTER crates -> burst into punks (children cap, farm-guarded)
        if (z.opts && z.opts.crate) {
          var cr = z.opts.crate, alive = 0;
          scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.crateChild) alive++; });
          var room = Math.max(0, cr.cap - alive);
          var n = Math.min(2, room);
          for (var k = 0; k < n; k++) {
            scene.queueSpawn({ key: cr.key, bossWave: true, crateChild: true,
              x: z.x + (SIM.rng() * 2 - 1) * 20, y: z.y + (SIM.rng() * 2 - 1) * 20 });
            C.crateCount++;
          }
          try { AUDIO.play('cratedrop'); } catch (e) {}
        }
        // REMOTE ACCESS -> a hacked turret rises
        if (z.opts && z.opts.hackTurret) {
          scene.queueSpawn({ key: 'turretPod', bossWave: true, x: z.x, y: z.y });
        }
      }
    },
    _laneWarn: function (scene, x0, y0, x1, y1, half, tint) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint || 0xff3a4a, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, tint || 0xff9aa0, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    _lane: function (scene, C, L, half, warnMs, dmg, src, fromBoss) {
      var g = NE._laneWarn(scene, L.x0, L.y0, L.x1, L.y1, half, fromBoss ? 0xffb02e : 0xff3a4a);
      C.lanes.push({ L: L, half: half, at: scene.time.now + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: fromBoss ? 0xffb02e : 0xff3a4a });
    },
    _runLanes: function (scene, C, time) {
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        scene.cameras.main.shake(100, 0.005);
        try { AUDIO.play('strafe'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    },
    // instant laser BEAM (the aim-line WAS the telegraph).
    _beam: function (scene, x0, y0, x1, y1, half, dmg, src, fromBoss, time) {
      var fg = scene.add.graphics().setDepth(9);
      fg.lineStyle(half * 2, 0x22d6ee, 0.55); fg.lineBetween(x0, y0, x1, y1);
      scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
      var p = scene.player;
      if (p.state.alive && dist2seg(p.x, p.y, x0, y0, x1, y1) < half)
        Entities.hurtPlayer(scene, p, dmg, time, src, fromBoss);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = NE;
  root.NEON_SCENE = NE;
})(typeof window !== 'undefined' ? window : this);
