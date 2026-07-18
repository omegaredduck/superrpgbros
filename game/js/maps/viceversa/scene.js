// ============================================================================
// game/js/maps/viceversa/scene.js — VICE VERSA scene hooks (M7 registry).
// Scene-plan (assets/eternal_scene_plan.png) is canon: BIG split map — HELL
// west / HOLY east, the RIVER OF SOULS (impassable, animated) N-S down the
// centre, ONE bridge (bone half / gold half, seam at centre). The player
// STARTS ON THE BRIDGE SEAM and picks who to fight first.
// FACTION WARFARE (Red): hell + holy mobs damage each other at full value;
// mob-vs-mob kills credit NOBODY (farm guard). WRAP-LEASH: crossing the E-W
// wrap seam DROPS pursuers (deaggro + path home); the BRIDGE preserves chases.
// N-S wrap never drops. DOUBLE BOSS: SATAN (hell arena) + SUPREME BEING (holy
// arena), both spawn at boss-time, each HARD-LEASHED to his arena; beat one →
// the PORTAL pair opens; beat BOTH → clear. Bosses never damage each other.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  function angDiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var HELL_TINT = 0xff6a1e, HOLY_TINT = 0xffe08a, FEL_TINT = 0x5aff2e, SOUL_TINT = 0x6ae4c8;

  var VV = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._vv = {
        WW: WW, HH: HH,
        riverCx: WW * 0.5, riverHalf: WW * 0.028,
        bridgeCy: HH * 0.5, bridgeHalfY: HH * 0.05, bridgeX0: WW * 0.4, bridgeX1: WW * 0.6,
        satanArena: { x: WW * 0.17, y: HH * 0.58, r: WW * 0.13 },
        supremeArena: { x: WW * 0.83, y: HH * 0.58, r: WW * 0.13 },
        hellPortal: { x: WW * 0.28, y: HH * 0.58 }, holyPortal: { x: WW * 0.72, y: HH * 0.58 },
        zones: [], lanes: [], cones: [], patches: [], rings: [], mobWarns: [],
        ccUntil: 0,                                    // shared displacement cooldown (charm/hook/blast/gaol)
        satan: null, supreme: null, portalOpen: false, portalSprites: [], bars: null,
        river: null, animPhaseAt: 0, riverFrame: 0,
        lastFactionAt: 0, prevPlayerX: WW * 0.5
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- ground: hell brimstone west, holy marble east ----
      scene.add.tileSprite(WW * 0.25, HH / 2, WW * 0.5, HH, 'vvtBrimstone').setDepth(-23);
      scene.add.tileSprite(WW * 0.75, HH / 2, WW * 0.5, HH, 'vvtMarble').setDepth(-23);
      // zone accents
      scene.add.tileSprite(WW * 0.12, HH * 0.18, WW * 0.22, HH * 0.18, 'vvtObsidian').setDepth(-22.5);   // war camp
      scene.add.tileSprite(WW * 0.1, HH * 0.42, WW * 0.2, HH * 0.16, 'vvtBoneLitter').setDepth(-22.5);   // graves
      scene.add.tileSprite(WW * 0.85, HH * 0.18, WW * 0.22, HH * 0.18, 'vvtGoldPath').setDepth(-22.5);   // chapel
      scene.add.tileSprite(WW * 0.9, HH * 0.42, WW * 0.18, HH * 0.16, 'vvtCloud').setDepth(-22.5);       // meadow
      scene.add.tileSprite(WW * 0.2, HH * 0.8, WW * 0.24, HH * 0.16, 'vvtAsh').setDepth(-22.5);          // magma flats
      // ---- the RIVER OF SOULS (animated strip, impassable) ----
      C.river = scene.add.tileSprite(C.riverCx, HH / 2, C.riverHalf * 2, HH, 'vvtRiver0').setDepth(-22);
      // ---- THE BRIDGE (structure — the only walk crossing) ----
      scene.add.tileSprite((C.bridgeX0 + C.bridgeX1) / 2, C.bridgeCy, C.bridgeX1 - C.bridgeX0, C.bridgeHalfY * 2, 'vvtBridge').setDepth(-21);

      // ---- arena rings (cosmetic) ----
      var ag = scene.add.graphics().setDepth(-20);
      ag.lineStyle(3, HELL_TINT, 0.7); ag.strokeCircle(C.satanArena.x, C.satanArena.y, C.satanArena.r);
      ag.lineStyle(3, HOLY_TINT, 0.7); ag.strokeCircle(C.supremeArena.x, C.supremeArena.y, C.supremeArena.r);

      // ---- decor scatter (deterministic) ----
      function D(key, fx, fy, sc) { scene.add.sprite(WW * fx, HH * fy, key).setScale(sc || 1.6).setDepth(2); }
      // hell
      D('vvdThrone', 0.17, 0.55, 2.4); D('vvdGeyser', 0.16, 0.62); D('vvdBonePile', 0.3, 0.4);
      D('vvdSpire', 0.1, 0.24, 2.0); D('vvdGraves', 0.09, 0.44); D('vvdBrazier', 0.22, 0.5);
      D('vvdHellBanner', 0.14, 0.16); D('vvdMagma', 0.2, 0.8, 2.2); D('vvdBonePile', 0.24, 0.7);
      C.fences = [];
      [[0.28, 0.3], [0.32, 0.5], [0.26, 0.62]].forEach(function (f) {
        var spr = scene.add.sprite(WW * f[0], HH * f[1], 'vvdBoneFence0').setScale(1.6).setDepth(2);
        C.fences.push({ spr: spr, x: WW * f[0], y: HH * f[1], hp: scene.realmDef.fenceCfg.hp, maxHp: scene.realmDef.fenceCfg.hp, state: 0, kind: 'bone' });
      });
      // holy
      D('vvdGate', 0.83, 0.55, 2.4); D('vvdFountain', 0.78, 0.34); D('vvdColumn', 0.86, 0.22, 2.0);
      D('vvdColumn', 0.9, 0.3, 2.0); D('vvdAltar', 0.84, 0.18); D('vvdStatue', 0.9, 0.5);
      D('vvdHolyBanner', 0.86, 0.16); D('vvdColumn', 0.72, 0.42, 1.8);
      [[0.72, 0.3], [0.68, 0.5], [0.74, 0.62]].forEach(function (f) {
        var spr = scene.add.sprite(WW * f[0], HH * f[1], 'vvdGoldFence0').setScale(1.6).setDepth(2);
        C.fences.push({ spr: spr, x: WW * f[0], y: HH * f[1], hp: scene.realmDef.fenceCfg.hp, maxHp: scene.realmDef.fenceCfg.hp, state: 0, kind: 'gold' });
      });
      // set pieces
      D('vvdObelisk', 0.02, 0.28, 1.8); D('vvdObelisk', 0.02, 0.72, 1.8);
      D('vvdObelisk', 0.98, 0.28, 1.8); D('vvdObelisk', 0.98, 0.72, 1.8);
      D('vvdSoulGeyser', 0.5, 0.22); D('vvdSoulGeyser', 0.5, 0.82);
      D('vvdTitanSword', 0.44, 0.36, 2.0); D('vvdLantern', 0.4, 0.5); D('vvdLantern', 0.6, 0.5);

      // ---- spawn on the bridge seam ----
      scene._realmStart = { x: WW * 0.5, y: HH * 0.5 };

      // mob-verb helpers (fresh closures)
      scene._vvImp = function (m, p, t) { return VV._imp(scene, m, p, t); };
      scene._vvFireLob = function (m, p, t) { return VV._fireLob(scene, m, p, t); };
      scene._vvCharm = function (m, p, t) { return VV._charm(scene, m, p, t); };
      scene._vvSlam = function (m, p, t) { return VV._slam(scene, m, p, t); };
      scene._vvChop = function (m, p, t) { return VV._chop(scene, m, p, t); };
      scene._vvGhost = function (m, p, t) { return VV._ghost(scene, m, p, t); };
      scene._vvHook = function (m, p, t) { return VV._hook(scene, m, p, t); };
      scene._vvWhip = function (m, p, t) { return VV._whip(scene, m, p, t); };
      scene._vvLunge = function (m, p, t) { return VV._lunge(scene, m, p, t); };
      scene._vvLance = function (m, p, t) { return VV._lance(scene, m, p, t); };
      scene._vvDive = function (m, p, t) { return VV._dive(scene, m, p, t); };
      scene._vvHeal = function (m, p, t) { return VV._heal(scene, m, p, t); };
      scene._vvStatue = function (m, p, t) { return VV._statue(scene, m, p, t); };
      scene._vvBlast = function (m, p, t) { return VV._blast(scene, m, p, t); };
      scene._vvArchon = function (m, p, t) { return VV._archon(scene, m, p, t); };
      // suite-facing helpers
      scene._vvSide = function (x) { return VV._side(scene, x); };
      scene._vvDropChases = function (t) { return VV._dropChases(scene, t); };
      scene._vvHurtBoss = function (b, dmg) { return VV._hurtBoss(scene, b, dmg); };
    },

    afterCreate: function (scene) {
      // Colliders that need the player attach HERE (never setup — the isParent
      // gotcha). Fence hits are shot-driven (see update), the river/side leash
      // is positional, so there are no wall bodies to bind — but the boss
      // overlaps ARE created here-equivalent (at spawn, in _spawnBosses).
    },

    // ---------------------------------------------------- geometry helpers --
    _side: function (scene, x) {
      var C = scene._vv;
      if (x < C.riverCx - C.riverHalf) return 'hell';
      if (x > C.riverCx + C.riverHalf) return 'holy';
      return 'river';
    },
    _onBridge: function (scene, x, y) {
      var C = scene._vv;
      return x >= C.bridgeX0 && x <= C.bridgeX1 && Math.abs(y - C.bridgeCy) < C.bridgeHalfY;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._vv; if (!C) return;
      var p = scene.player, alive = p.state.alive;

      // ---- animated RIVER strip (cheap frame swap) ----
      if (!C.animPhaseAt) C.animPhaseAt = time + 180;
      if (C.animPhaseAt !== Infinity && time >= C.animPhaseAt) {
        C.animPhaseAt = time + 180;
        C.riverFrame = (C.riverFrame + 1) % 4;
        if (C.river && C.river.active) C.river.setTexture('vvtRiver' + C.riverFrame);
      }

      // ---- FACTION WARFARE + mob leash/aggro ----
      VV._factionWar(scene, time);
      VV._mobLeash(scene, time);

      // ---- player: river impassable (bridge is the only crossing) ----
      if (alive && VV._side(scene, p.x) === 'river' && !VV._onBridge(scene, p.x, p.y)) {
        var toLeft = Math.abs(p.x - (C.riverCx - C.riverHalf));
        var toRight = Math.abs(p.x - (C.riverCx + C.riverHalf));
        var nx = toLeft < toRight ? C.riverCx - C.riverHalf - 4 : C.riverCx + C.riverHalf + 4;
        if (p.body && p.body.reset) { var vy = p.body.velocity.y; p.body.reset(nx, p.y); p.body.velocity.y = vy; }
      }

      // ---- displacement pulls (charm/hook) applied here, before wrap ----
      if (C.pull) {
        if (!alive || time >= C.pull.until) C.pull = null;
        else { p.body.velocity.x = C.pull.vx; p.body.velocity.y = C.pull.vy; }
      }

      // ---- hazard pools ----
      VV._runZones(scene, time);
      VV._runLanes(scene, time);
      VV._runCones(scene, time);
      VV._runRings(scene, time);
      VV._runPatches(scene, time);
      // fence break-state cleanup (shards linger a frame)
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) { var MW = C.mobWarns[mw]; if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); } }

      // ---- fences take player shots (destructible, deterioration states) ----
      var shots = scene.playerShots;
      if (shots && C.fences.length) shots.children.iterate(function (s) {
        if (!s || !s.active || !s.proj) return;
        for (var i = 0; i < C.fences.length; i++) {
          var F = C.fences[i]; if (F.state >= 2) continue;
          if (Math.hypot(s.x - F.x, s.y - F.y) < 34) {
            F.hp -= s.proj.dmg;
            var ns = F.hp <= 0 ? 2 : (F.hp <= F.maxHp * 0.5 ? 1 : 0);
            if (ns !== F.state) { F.state = ns; F.spr.setTexture('vvd' + (F.kind === 'bone' ? 'BoneFence' : 'GoldFence') + ns); if (ns === 2) scene.burst(F.x, F.y, 12, F.kind === 'bone' ? 0xe0d8c4 : 0xffe08a); }
            if (!s.proj.pierce) Entities.killProjectile(shots, s);
            break;
          }
        }
      });

      // ---- the SECOND boss (the one core isn't driving) ----
      [C.satan, C.supreme].forEach(function (b) {
        if (!b || b._vvDefeated || !b.active) return;
        if (b === scene.boss) return;                  // core drives this.boss
        if (!alive) { b.setVelocity(0, 0); return; }
        VV.bossUpdate(scene, b, p, time);
      });
      VV._updateBars(scene);

      // M7k AUDIT fix: the first-kill portal pair was decorative — walk onto a
      // portal to actually cross into the opposite arena.
      VV._runPortals(scene, time);

      // ---- toroidal wrap (owns the wrap-leash) ----
      VV._wrap(scene, time);
    },

    // -------------------------------------------- FACTION WARFARE (Red) ----
    _factionWar: function (scene, time) {
      var C = scene._vv, cfg = scene.realmDef.factionCfg;
      if (!cfg || !cfg.crossDamage) return;
      if (time - C.lastFactionAt < cfg.tickMs) return;
      C.lastFactionAt = time;
      var list = [];
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.def.faction) list.push(m); });
      var brawls = 0;
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          if (brawls >= cfg.maxBrawlers) break;
          var a = list[i], b = list[j];
          if (a.mob.def.faction === b.mob.def.faction) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) > cfg.range) continue;
          brawls++;
          a.mob.hp -= cfg.dmg; b.mob.hp -= cfg.dmg;
          a.setTintFill(0xffffff); b.setTintFill(0xffffff);
          (function (aa, bb) { scene.time.delayedCall(50, function () { if (aa.active) aa.clearTint(); if (bb.active) bb.clearTint(); }); })(a, b);
          try { AUDIO.play('factionclash'); } catch (e) {}
          // deaths credit NOBODY (farm guard) — corpses still play a burst
          if (a.mob.hp <= 0) VV._killNoCredit(scene, a);
          if (b.mob.hp <= 0) VV._killNoCredit(scene, b);
        }
      }
    },
    _killNoCredit: function (scene, m) {
      if (!m || !m.active) return;
      scene.burst(m.x, m.y, 10, m.mob && m.mob.def ? (m.mob.def.deathTint || 0xffffff) : 0xffffff);
      Entities.clearNameTag(m); m.body.enable = false; scene.mobs.killAndHide(m);
    },

    // ---------------------------------- mob aggro / leash / wrap-leash -----
    _mobLeash: function (scene, time) {
      var C = scene._vv, p = scene.player;
      var pSide = VV._side(scene, p.x), onBridgeP = VV._onBridge(scene, p.x, p.y);
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || !m.mob.def.faction) return;
        var mob = m.mob, fac = mob.def.faction;
        var deaggro = mob._vvDeaggroUntil && time < mob._vvDeaggroUntil;
        // aggro allowed: player on your side, on the bridge, or you're mid-bridge-chase
        var may = !deaggro && (onBridgeP || pSide === fac || mob._vvBridging);
        mob._vvAggro = may;
        if (may) {
          // preserve chase across the bridge (the instigate crossing)
          if (onBridgeP || pSide !== fac) mob._vvBridging = true;
          else if (pSide === fac && VV._side(scene, m.x) === fac) mob._vvBridging = false;
        } else {
          // path home: steer back to your half at the mob's own y
          var homeX = fac === 'hell' ? C.WW * 0.25 : C.WW * 0.75;
          var dx = homeX - m.x, dy = 0, d = Math.abs(dx) || 1;
          if (Math.abs(dx) > 20) m.setVelocity(dx / d * mob.spd, dy);
          else m.setVelocity(0, 0);
          mob._vvBridging = false;
        }
        // river / side leash (river impassable except the bridge y-band while bridging)
        var inBridgeY = Math.abs(m.y - C.bridgeCy) < C.bridgeHalfY;
        if (!(mob._vvBridging && inBridgeY)) {
          var leftBank = C.riverCx - C.riverHalf - 6, rightBank = C.riverCx + C.riverHalf + 6;
          if (fac === 'hell' && m.x > leftBank) { if (m.body && m.body.reset) { var v1 = m.body.velocity.y; m.body.reset(leftBank, m.y); m.body.velocity.y = v1; if (m.body.velocity.x > 0) m.body.velocity.x = 0; } }
          if (fac === 'holy' && m.x < rightBank) { if (m.body && m.body.reset) { var v2 = m.body.velocity.y; m.body.reset(rightBank, m.y); m.body.velocity.y = v2; if (m.body.velocity.x < 0) m.body.velocity.x = 0; } }
        }
      });
    },
    _dropChases: function (scene, time) {
      var C = scene._vv, cfg = scene.realmDef.wrapLeashCfg, ms = (cfg && cfg.deaggroMs) || 1600;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        m.mob._vvDeaggroUntil = time + ms;
        m.mob._vvBridging = false;
        m.mob._vvAggro = false;
      });
      try { AUDIO.play('wrapwhoosh'); } catch (e) {}
    },

    // ------------------------------------------------------- toroidal wrap --
    _wrap: function (scene, time) {
      var C = scene._vv, WW = C.WW, HH = C.HH, p = scene.player;
      // detect a HORIZONTAL player wrap (the E-W seam) → drop chases
      var wrappedEW = false;
      function wrapObj(o, isPlayer) {
        if (!o) return;
        var nx = o.x, ny = o.y, movedX = false, movedY = false;
        if (o.x < 0) { nx = o.x + WW; movedX = true; } else if (o.x >= WW) { nx = o.x - WW; movedX = true; }
        if (o.y < 0) { ny = o.y + HH; movedY = true; } else if (o.y >= HH) { ny = o.y - HH; movedY = true; }
        if (!movedX && !movedY) return;
        if (isPlayer && movedX) wrappedEW = true;
        if (o.body && o.body.enable && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      }
      wrapObj(p, true);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrapObj(m, false); });
      if (wrappedEW && scene.realmDef.wrapLeashCfg && scene.realmDef.wrapLeashCfg.dropOnEWSeam) VV._dropChases(scene, time);
      C.prevPlayerX = p.x;
    },

    // M7k AUDIT fix: the quota boss portal could land INSIDE the impassable
    // River of Souls strip — softlock. Clamp it onto the player's current
    // half, off the river geometry.
    bossPortalSpot: function (scene, x, y) {
      var C = scene._vv; if (!C) return null;
      var margin = C.riverHalf + 60;
      var pSide = VV._side(scene, scene.player.x);
      var wantLeft = pSide === 'hell' || (pSide === 'river' && scene.player.x < C.riverCx);
      if (wantLeft) {
        if (x > C.riverCx - margin) return { x: Math.max(100, C.riverCx - margin), y: y };
      } else {
        if (x < C.riverCx + margin) return { x: Math.min(C.WW - 100, C.riverCx + margin), y: y };
      }
      return null;
    },

    // ========================================================= UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._vv; if (!C) return;
      if (C.animPhaseAt && C.animPhaseAt !== Infinity) C.animPhaseAt += dt;
      if (C.lastFactionAt) C.lastFactionAt += dt;
      if (C.ccUntil) C.ccUntil += dt;
      if (C.pull) C.pull.until += dt;
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.cones.forEach(function (c) { c.at += dt; });
      C.rings.forEach(function (r) { r.start += dt; r.until += dt; });
      C.patches.forEach(function (pa) { if (pa.dieAt !== Infinity) pa.dieAt += dt; if (pa.nextTickAt) pa.nextTickAt += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['_vvDeaggroUntil', 'nextPokeAt', 'pokeAt', 'pokeUntil', 'nextLobAt', 'nextCharmAt', 'charmAt',
         'nextSlamAt', 'slamAt', 'nextChopAt', 'chopAt', 'nextHookAt', 'hookAt', 'hookUntil', 'nextWhipAt', 'whipAt',
         'nextLungeAt', 'lungeAt', 'lungeUntil', 'nextLanceAt', 'lanceAt', 'nextDiveAt', 'diveAt', 'diveUntil',
         'nextHealAt', 'nextBlastAt', 'blastAt', 'nextArchonAt', 'archonAt', 'archonUntil'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });
      });
      [C.satan, C.supreme].forEach(function (b) {
        if (!b || !b.active || !b.boss) return; var bs = b.boss;
        ['nextVerbAt', 'nextImpAt', 'nextCherubAt', 'nextRingAt', 'nextVerdictAt', 'busyUntil', 'rootUntil',
         'ventedUntil', 'blinkAt', 'beamAt', 'sweepAt'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      });
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._vv; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.lanes = [];
      C.cones.forEach(function (c) { if (c.g) { try { c.g.destroy(); } catch (e) {} } }); C.cones = [];
      C.rings.forEach(function (r) { try { r.g.destroy(); } catch (e) {} }); C.rings = [];
      C.patches.forEach(function (pa) { if (pa.obj) { try { pa.obj.destroy(); } catch (e) {} } }); C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      C.pull = null;
    },

    // ================================================== BOSS ARRIVAL =======
    // Both bosses materialise, each in his own arena, hard-leashed. The player
    // was delivered to the bridge; the scouter comes up after the fly/rise-in.
    bossArrival: function (scene, def, bx, by) {
      VV._spawnBosses(scene, def);
      var self = scene;
      scene.time.delayedCall(def.entranceMs || 3000, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },
    _spawnBosses: function (scene, def) {
      var C = scene._vv, self = scene;
      // player starts on the bridge seam — deliver him there for the choice
      scene.player.setPosition(C.WW * 0.5, C.HH * 0.5);
      scene.cameras.main.centerOn(C.WW * 0.5, C.HH * 0.5);
      var satDef = DATA.bosses.satan, supDef = DATA.bosses.supremeBeing;
      var sat = Entities.spawnBoss(scene, 'satan', C.satanArena.x, C.satanArena.y, scene.time.now);
      var sup = Entities.spawnBoss(scene, 'supremeBeing', C.supremeArena.x, C.supremeArena.y, scene.time.now);
      C.satan = sat; C.supreme = sup;
      scene.boss = sat;                                     // core tracks one live boss for its guards
      // fly/rise-in cosmetic
      [sat, sup].forEach(function (b) {
        b.setAlpha(0); scene.tweens.add({ targets: b, alpha: 1, duration: 500, ease: 'Quad.Out' });
        scene.burst(b.x, b.y, 20, b.boss.def.deathTint);
      });
      scene.cameras.main.shake(240, 0.008);
      scene.banner('SATAN & THE SUPREME BEING\ntrapped their own sides — pick your poison', '#8a52ff');
      // per-boss overlaps (shots + contact) — custom damage so neither death
      // ends the map until BOTH are down (the double-boss gate)
      [sat, sup].forEach(function (b) {
        scene.physics.add.overlap(scene.playerShots, b, function (bo, shot) {
          if (!shot.active || !bo.active || bo._vvDefeated) return;
          if (shot.proj.hits && shot.proj.hits[bo.id]) return;
          if (shot.proj.hits) shot.proj.hits[bo.id] = true;
          VV._hurtBoss(scene, bo, shot.proj.dmg);
          if (!shot.proj.pierce) Entities.killProjectile(scene.playerShots, shot);
        });
        scene.physics.add.overlap(scene.player, b, function (pl, bo) {
          if (!bo.active || bo._vvDefeated) return;
          if (scene.time.now - bo.boss.lastContactAt < DATA.combat.contactTickMs) return;
          bo.boss.lastContactAt = scene.time.now;
          Entities.hurtPlayer(scene, scene.player, bo.boss.def.contactDmg, scene.time.now, bo.boss.def.name, true);
        });
      });
      // simple twin HP bars
      try {
        var Wd = scene.scale.width;
        C.bars = {
          bg: scene.add.rectangle(Wd / 2, 18, 340, 16, 0x1a1c2c).setScrollFactor(0).setDepth(52),
          s: scene.add.rectangle(Wd / 2 - 168, 18, 166, 12, HELL_TINT).setOrigin(0, 0.5).setScrollFactor(0).setDepth(53),
          h: scene.add.rectangle(Wd / 2 + 2, 18, 166, 12, HOLY_TINT).setOrigin(0, 0.5).setScrollFactor(0).setDepth(53)
        };
      } catch (e) {}
    },
    _updateBars: function (scene) {
      var C = scene._vv; if (!C.bars) return;
      try {
        if (C.satan) C.bars.s.width = 166 * Math.max(0, C.satan.boss.hp) / C.satan.boss.maxHp;
        if (C.supreme) C.bars.h.width = 166 * Math.max(0, C.supreme.boss.hp) / C.supreme.boss.maxHp;
      } catch (e) {}
    },
    _hurtBoss: function (scene, b, dmg) {
      if (!b.active || b._vvDefeated || b.boss.hp <= 0) return;
      if (b.boss.ventedUntil && scene.time.now < b.boss.ventedUntil) dmg = Math.round(dmg * (b.boss.ventDmgMult || 1.5));
      b.boss.hp -= dmg;
      b.setTintFill(0xffffff);
      scene.time.delayedCall(50, function () { if (b.active && !b._vvDefeated) b.clearTint(); });
      scene.damageNumber(b.x, b.y - 30, dmg, '#f4f4f4');
      try { scene.hitstop(scene.time.now); } catch (e) {}
      try { AUDIO.play('bossHit'); } catch (e) {}
      if (b.boss.hp <= 0) VV._bossDefeated(scene, b);
    },
    // M7k AUDIT fix: core melee/whirlwind/tornado/lightning paths call
    // Entities.hurtBoss directly → 'boss-died' → the realm used to FULL-CLEAR
    // off the FIRST boss. Core's boss-died listener now calls this hook first
    // for mapOwned bosses; routing into the SAME _bossDefeated the playerShots
    // overlap path uses keeps both kill paths identical. Always returns true —
    // the double-boss gate owns every death on this map.
    bossDefeated: function (scene, b) {
      VV._bossDefeated(scene, b);
      return true;
    },
    _bossDefeated: function (scene, b) {
      if (b._vvDefeated) return;
      var C = scene._vv;
      var survivor = (b === C.satan) ? C.supreme : C.satan;
      if (survivor && !survivor._vvDefeated) {
        // FIRST kill — open the portal, retire this boss, hand core the survivor
        b._vvDefeated = true;
        scene.burst(b.x, b.y, 40, b.boss.def.deathTint);
        b.setActive(false); b.setVisible(false); if (b.body) b.body.enable = false;
        // M7k AUDIT fix: ALWAYS re-point core at the survivor (not only when
        // the dead boss held the reference) — every core damage path (melee,
        // abilities, DoT) targets scene.boss, so melee-only classes could
        // never hurt the second boss otherwise.
        scene.boss = survivor;
        VV._openPortal(scene);
        scene.banner(b.boss.def.name.toUpperCase() + ' HAS FALLEN\nthe PORTAL opens — finish the other', '#8a52ff');
      } else {
        // SECOND kill — the map clears through the core loot flow
        if (scene.boss !== b) scene.boss = b;
        b._vvDefeated = true;
        if (C.bars) { ['bg', 's', 'h'].forEach(function (k) { try { C.bars[k].destroy(); } catch (e) {} }); C.bars = null; }
        b.setActive(true);
        scene.onBossDown(b);
      }
    },
    // M7k AUDIT fix: proximity teleport between the portal pair. Lands the
    // player 60px PAST the destination portal (outside the 46px trigger) so it
    // can't instantly re-trigger; walking back through returns you.
    _runPortals: function (scene, time) {
      var C = scene._vv; if (!C.portalOpen) return;
      var p = scene.player; if (!p.state.alive) return;
      var pairs = [[C.hellPortal, C.holyPortal], [C.holyPortal, C.hellPortal]];
      for (var i = 0; i < pairs.length; i++) {
        var src = pairs[i][0], dst = pairs[i][1];
        if (Math.hypot(p.x - src.x, p.y - src.y) >= 46) continue;
        // step off toward the destination's arena (hell portal → west, holy → east)
        var off = (dst === C.hellPortal) ? -60 : 60;
        var nx = dst.x + off, ny = dst.y;
        if (p.body && p.body.reset) p.body.reset(nx, ny); else { p.x = nx; p.y = ny; }
        scene.burst(dst.x, dst.y, 14, 0x8a52ff);
        try { scene.cameras.main.flash(180, 40, 20, 60); } catch (e) {}
        try { AUDIO.play('wrapwhoosh'); } catch (e) {}
        break;
      }
    },
    _openPortal: function (scene) {
      var C = scene._vv; if (C.portalOpen) return;
      C.portalOpen = true;
      [C.hellPortal, C.holyPortal].forEach(function (P) {
        var spr = scene.add.sprite(P.x, P.y, 'vvPortal').setScale(2).setDepth(4);
        scene.tweens.add({ targets: spr, angle: 360, duration: 3000, repeat: -1 });
        C.portalSprites.push(spr);
      });
      scene.cameras.main.shake(220, 0.008);
      try { AUDIO.play('portalopen'); } catch (e) {}
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      if (b._vvDefeated) { b.setVelocity(0, 0); return; }
      if (b.boss.key === 'satan') VV._satan(scene, b, player, time);
      else VV._supreme(scene, b, player, time);
    },
    _leash: function (scene, b, arena) {
      var d = Math.hypot(b.x - arena.x, b.y - arena.y);
      if (d > arena.r) {
        var a = Math.atan2(b.y - arena.y, b.x - arena.x);
        if (b.body && b.body.reset) { b.body.reset(arena.x + Math.cos(a) * arena.r, arena.y + Math.sin(a) * arena.r); }
      }
    },
    _bossChase: function (scene, b, player, arena, time) {
      var bs = b.boss;
      if (time < bs.rootUntil) { b.setVelocity(0, 0); }
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 120) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
      }
      VV._leash(scene, b, arena);
    },

    // ------------------------------------------------------------- SATAN ---
    _satan: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._vv;
      if (!bs._vvInit) {
        bs._vvInit = true; bs.verbIdx = 0; bs.nextVerbAt = time + 2400;
        bs.nextImpAt = time + PT.impCall.everyMs * 0.5; bs.nextRingAt = time + PT.ringOfFire.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      var p2 = !bs._p2 && bs.hp <= bs.maxHp * PT.p2Pct;
      if (p2) { bs._p2 = true; scene.banner('SATAN TAKES FLIGHT\nstrafing dive lanes — cross them', '#ff6a1e'); }
      VV._bossChase(scene, b, player, C.satanArena, time);
      if (time < bs.busyUntil) return;
      // M7k AUDIT fix: leash the kit — the unengaged boss must not bombard the
      // player with hellfire/dives from across the map while you fight the other.
      if (Math.hypot(player.x - b.x, player.y - b.y) > 1100) return;
      if (time >= bs.nextRingAt) { bs.nextRingAt = time + PT.ringOfFire.everyMs; VV._ringOfFire(scene, b, time); }
      else if (time >= bs.nextImpAt) { bs.nextImpAt = time + PT.impCall.everyMs; VV._impCall(scene, b, time); }
      else if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs;
        var pool = bs._p2 ? ['sweep', 'pillars', 'dive'] : ['sweep', 'pillars'];
        var v = pool[bs.verbIdx % pool.length]; bs.verbIdx++;
        if (v === 'sweep') VV._tridentSweep(scene, b, player, time);
        else if (v === 'pillars') VV._hellfirePillars(scene, b, player, time);
        else VV._flightDive(scene, b, player, time);
      }
    },
    _tridentSweep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tridentSweep;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      VV._cone(scene, b.x, b.y, cfg.range, ang, cfg.halfRad, cfg.warnMs, cfg.dmg, "Satan's trident", true, time, { kb: cfg.kb, ang: ang });
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('TRIDENT SWEEP\nstep around the arc', '#ff6a1e');
      try { AUDIO.play('tridentsweep'); } catch (e) {}
    },
    _hellfirePillars: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.hellfirePillars;
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = 60 + SIM.rng() * 160;
        VV._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs + i * cfg.gapMs, cfg.dmg, "a hellfire pillar", true, time, null);
      }
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 200;
      scene.banner('HELLFIRE PILLARS\nwalk the order', '#ff6a1e');
      try { AUDIO.play('pillarerupt'); } catch (e) {}
    },
    _impCall: function (scene, b, time) {
      var cfg = b.boss.def.patterns.impCall, C = scene._vv;
      var n = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) n++; });
      if (n >= cfg.cap) { b.boss.busyUntil = time + 200; return; }
      for (var i = 0; i < cfg.imps; i++) scene.queueSpawn({ key: 'vvImp', bossWave: true, x: b.x + (SIM.rng() * 2 - 1) * 60, y: b.y + 40 + SIM.rng() * 40 });
      scene.banner('IMP CALL\nthey pour from the hellmouth', '#ff6a1e');
      try { AUDIO.play('impcackle'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    _flightDive: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.flightDive;
      var base = Math.atan2(player.y - b.y, player.x - b.x);
      for (var i = 0; i < cfg.lanes; i++) {
        var a = base + (i - (cfg.lanes - 1) / 2) * 0.5;
        VV._lane(scene, b.x, b.y, b.x + Math.cos(a) * 900, b.y + Math.sin(a) * 900, cfg.half, cfg.warnMs, cfg.dmg, "Satan's dive", true, time);
      }
      b.boss.busyUntil = time + cfg.warnMs + 300;
      scene.banner('STRAFING DIVE\ncross the lanes', '#ff6a1e');
    },
    _ringOfFire: function (scene, b, time) {
      var cfg = b.boss.def.patterns.ringOfFire, C = scene._vv;
      var gaps = [];
      for (var g = 0; g < cfg.gaps; g++) gaps.push(SIM.rng() * Math.PI * 2);
      C.rings.push({ x: b.x, y: b.y, r0: 20, r: 20, maxR: C.satanArena.r * 1.1, start: time, until: time + cfg.ringWarnMs + 900,
        dmg: cfg.dmg, src: "the ring of fire", fromBoss: true, hit: false, gaps: gaps, gapHalf: 0.45,
        g: scene.add.graphics().setDepth(9), tint: HELL_TINT, boss: b, ventMs: cfg.ventMs, ventMult: cfg.ventDmgMult });
      b.boss.busyUntil = time + cfg.ringWarnMs + 900 + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('RING OF FIRE\nfind the SAFE GAP', '#ff6a1e');
      try { AUDIO.play('ringroar'); } catch (e) {}
    },

    // ---------------------------------------------------- SUPREME BEING ----
    _supreme: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._vv;
      if (!bs._vvInit) {
        bs._vvInit = true; bs.verbIdx = 0; bs.nextVerbAt = time + 2400;
        bs.nextCherubAt = time + PT.cherubCall.everyMs * 0.5; bs.nextVerdictAt = time + PT.finalVerdict.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.blinkAt = time + PT.blinkHoldMs; bs.eyeShut = false;
      }
      // idle BLINK (cosmetic tell — SHORT, never fakes the charge)
      if (!bs.eyeCharging && time >= bs.blinkAt) {
        bs.blinkAt = time + PT.blinkHoldMs + PT.blinkMs;
        if (b.active && !b._vvDefeated) { b.setTexture('vvSupremeShutHi'); scene.time.delayedCall(PT.blinkMs, function () { if (b.active && !b._vvDefeated && !b.boss.eyeCharging) b.setTexture('vvSupremeHi'); }); }
      }
      var p2 = !bs._p2 && bs.hp <= bs.maxHp * PT.p2Pct;
      if (p2) { bs._p2 = true; scene.banner('THE WATCHER OPENS WIDE\njudgment quickens', '#ffe08a'); bs.spdMult = 1.15; }
      VV._bossChase(scene, b, player, C.supremeArena, time);
      if (time < bs.busyUntil) return;
      // M7k AUDIT fix: leash the kit — no cross-map gavel/beam bombardment
      // while the player fights the other boss.
      if (Math.hypot(player.x - b.x, player.y - b.y) > 1100) return;
      if (time >= bs.nextVerdictAt) { bs.nextVerdictAt = time + PT.finalVerdict.everyMs; VV._finalVerdict(scene, b, player, time); }
      else if (time >= bs.nextCherubAt) { bs.nextCherubAt = time + PT.cherubCall.everyMs; VV._cherubCall(scene, b, time); }
      else if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs;
        var pool = ['gavel', 'beam', 'scales'];
        var v = pool[bs.verbIdx % pool.length]; bs.verbIdx++;
        if (v === 'gavel') VV._gavelFist(scene, b, player, time);
        else if (v === 'beam') VV._judgmentBeam(scene, b, player, time);
        else VV._scales(scene, b, player, time);
      }
    },
    _gavelFist: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.gavelFist, C = scene._vv;
      VV._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, "the gavel", true, time, { tint: HOLY_TINT });   // M7k AUDIT fix: holy gold
      // expanding shockwave ring follows the slam
      var self = scene, gx = player.x, gy = player.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        if (self.closing) return;
        if (!b.active || b._vvDefeated) return;   // M7k AUDIT fix: dead caster — no shockwave
        C.rings.push({ x: gx, y: gy, r0: 24, r: 24, maxR: cfg.ringR, start: self.time.now, until: self.time.now + cfg.ringMs,
          dmg: cfg.ringDmg, src: "the shockwave", fromBoss: true, hit: false, g: self.add.graphics().setDepth(9), tint: HOLY_TINT });
        try { AUDIO.play('gavelslam'); } catch (e) {}
      });
      b.boss.busyUntil = time + cfg.warnMs + cfg.ringMs; b.boss.rootUntil = time + cfg.warnMs + 200;
      scene.banner('GAVEL FIST\nleave the ring room', '#ffe08a');
    },
    _judgmentBeam: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.judgmentBeam, bs = b.boss;
      // the Watcher SLAMS SHUT to charge (long shut — the tell, NOT the idle blink)
      bs.eyeCharging = true;
      if (b.active && !b._vvDefeated) b.setTexture('vvSupremeShutHi');
      try { AUDIO.play('eyecharge'); } catch (e) {}
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var self = scene;
      scene.time.delayedCall(cfg.chargeMs, function () {
        if (self.closing || !b.active || b._vvDefeated) { bs.eyeCharging = false; return; }
        b.setTexture('vvSupremeHi'); bs.eyeCharging = false;
        VV._lane(self, b.x, b.y, b.x + Math.cos(ang) * cfg.len, b.y + Math.sin(ang) * cfg.len, cfg.half, cfg.warnMs, cfg.dmg, "the judgment beam", true, self.time.now, { tint: HOLY_TINT });   // M7k AUDIT fix: holy gold
        try { AUDIO.play('beamfire'); } catch (e) {}
      });
      bs.busyUntil = time + cfg.chargeMs + cfg.warnMs + 200; bs.rootUntil = bs.busyUntil;
      scene.banner('JUDGMENT BEAM\neye shut — a line beam is coming', '#ffe08a');
    },
    _scales: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.scalesJudgment, C = scene._vv, A = C.supremeArena;
      // the raised pan shows the SAFE half — smite the OTHER half
      var safeLeft = SIM.rng() < 0.5;                       // true = west/left half safe
      b.boss._safeLeft = safeLeft;
      var g = scene.add.graphics().setDepth(9);
      g.fillStyle(HOLY_TINT, 0.28);
      g.fillRect(safeLeft ? A.x : A.x - A.r, A.y - A.r * 1.4, A.r, A.r * 2.8);   // the DOOMED half is highlighted
      C.cones.push({ scales: true, safeLeft: safeLeft, ax: A.x, ay: A.y, r: A.r, at: time + cfg.warnMs, dmg: cfg.dmg, g: g, src: "the scales", fromBoss: true });
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('SCALES OF JUDGMENT\nthe RAISED PAN is the safe half', '#ffe08a');
      try { AUDIO.play('scalescreak'); } catch (e) {}
    },
    _cherubCall: function (scene, b, time) {
      var cfg = b.boss.def.patterns.cherubCall;
      var n = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) n++; });
      if (n >= cfg.cap) { b.boss.busyUntil = time + 200; return; }
      for (var i = 0; i < cfg.cherubs; i++) scene.queueSpawn({ key: 'vvCherub', bossWave: true, x: b.x + (SIM.rng() * 2 - 1) * 60, y: b.y - 40 - SIM.rng() * 40 });
      scene.banner('CHERUB CALL\nlight archers descend', '#ffe08a');
      b.boss.busyUntil = time + 500;
    },
    _finalVerdict: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.finalVerdict, C = scene._vv, bs = b.boss;
      bs.eyeCharging = true;
      if (b.active && !b._vvDefeated) b.setTexture('vvSupremeShutHi');
      try { AUDIO.play('eyecharge'); } catch (e) {}
      var self = scene, startAng = Math.atan2(player.y - b.y, player.x - b.x);
      scene.time.delayedCall(cfg.chargeMs, function () {
        if (self.closing || !b.active || b._vvDefeated) { bs.eyeCharging = false; return; }
        bs.eyeCharging = false; b.setTexture('vvSupremeHi');
        // ROTATING beam sweep on a marked line
        C.rings.push({ verdict: true, x: b.x, y: b.y, ang: startAng, sweep: Math.PI, len: cfg.half * 18 + 520,
          half: cfg.half, start: self.time.now, until: self.time.now + cfg.sweepMs, dmg: cfg.dmg, src: "the final verdict",
          fromBoss: true, g: self.add.graphics().setDepth(9), tint: HOLY_TINT, boss: b, ventMs: cfg.ventMs, ventMult: cfg.ventDmgMult, hits: {} });
        try { AUDIO.play('verdictsweep'); } catch (e) {}
      });
      bs.busyUntil = time + cfg.chargeMs + cfg.sweepMs + 200; bs.rootUntil = bs.busyUntil;
      scene.banner('FINAL VERDICT\nthe eye closes — a sweep is coming', '#ffe08a');
    },

    // ================================================= MOB VERBS ===========
    _imp: function (scene, m, player, time) {
      var cfg = m.mob.def.poke;
      if (m.mob.pokeUntil) { if (time >= m.mob.pokeUntil) { m.mob.pokeUntil = 0; m.setVelocity(0, 0); } return true; }
      if (m.mob.pokeAt) {
        m.setVelocity(0, 0); m.setTint(Math.floor(time / 90) % 2 ? 0xff6a1e : 0xffffff);
        if (time >= m.mob.pokeAt) {
          m.mob.pokeAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.pokeUntil = time + cfg.dashMs; m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 60) Entities.hurtPlayer(scene, player, cfg.dmg, time, "an Imp's pitchfork");
        }
        return true;
      }
      if (!m.mob.nextPokeAt) m.mob.nextPokeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      if (m.mob._vvAggro !== false && time >= m.mob.nextPokeAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextPokeAt = time + cfg.cooldownMs; m.mob.pokeAt = time + cfg.warnMs; return true;
      }
      return false;
    },
    _fireLob: function (scene, m, player, time) {
      var cfg = m.mob.def.lob;
      if (!m.mob.nextLobAt) m.mob.nextLobAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextLobAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextLobAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var a = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
          VV._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs, cfg.dmg, "a fireball", false, time,
            { leaveBurn: { lifeMs: cfg.burnMs, dmg: cfg.burnDmg, tickMs: cfg.burnTickMs } });
        }
        return true;
      }
      return false;
    },
    _charm: function (scene, m, player, time) {           // succubus + siren share this (mirror pair)
      var cfg = m.mob.def.charm, C = scene._vv;
      if (m.mob.charmAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.charmAt) {
          m.mob.charmAt = 0;
          var ang = Math.atan2(player.y - m.y, player.x - m.x);
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            if (pd < cfg.range && Math.abs(angDiff(pa, ang)) < cfg.halfRad) {
              Entities.hurtPlayer(scene, player, cfg.dmg, time, "a charm");
              if (time >= C.ccUntil) {                     // shared displacement cap (abyss lesson)
                C.ccUntil = time + cfg.ccMs + 600;
                var toM = Math.atan2(m.y - player.y, m.x - player.x);
                C.pull = { vx: Math.cos(toM) * cfg.pull, vy: Math.sin(toM) * cfg.pull, until: time + cfg.ccMs };
                scene.damageNumber(player.x, player.y - 24, 'CHARMED', '#ff8ab0');
              }
            }
          }
          try { AUDIO.play('charmhum'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextCharmAt) m.mob.nextCharmAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextCharmAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextCharmAt = time + cfg.everyMs; m.mob.charmAt = time + cfg.warnMs;
        var ang2 = Math.atan2(player.y - m.y, player.x - m.x);
        VV._coneWarn(scene, m.x, m.y, cfg.range, ang2, cfg.halfRad, 0xff8ab0);
        return true;
      }
      return false;
    },
    _slam: function (scene, m, player, time) {
      var cfg = m.mob.def.slam;
      if (m.mob.slamAt) { m.setVelocity(0, 0); if (time >= m.mob.slamAt) m.mob.slamAt = 0; return true; }
      if (!m.mob.nextSlamAt) m.mob.nextSlamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextSlamAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextSlamAt = time + cfg.everyMs; m.mob.slamAt = time + cfg.warnMs;
        VV._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Brute's slam", false, time, null);
        return true;
      }
      return false;
    },
    _chop: function (scene, m, player, time) {            // skeleton: blocks frontal, warned overhead chop
      var cfg = m.mob.def.chop;
      if (m.mob.chopAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.chopAt) {
          m.mob.chopAt = 0;
          var ang = m.mob._chopAng;
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            if (pd < cfg.range && Math.abs(angDiff(pa, ang)) < cfg.halfRad) Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Skeleton's chop");
          }
        }
        return true;
      }
      if (!m.mob.nextChopAt) m.mob.nextChopAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextChopAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextChopAt = time + cfg.everyMs; m.mob.chopAt = time + cfg.warnMs;
        m.mob._chopAng = Math.atan2(player.y - m.y, player.x - m.x);
        VV._coneWarn(scene, m.x, m.y, cfg.range, m.mob._chopAng, cfg.halfRad, 0xe0d8c4);
        return true;
      }
      return false;
    },
    _ghost: function (scene, m, player, time) {           // phaser: fades in/out on approach
      var cfg = m.mob.def.phase;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      m.setAlpha(d < cfg.fadeRange ? 0.4 + 0.6 * (d / cfg.fadeRange) : 1);
      return false;                                        // core chase; leash still applies
    },
    _hook: function (scene, m, player, time) {            // dragger: warned hook → capped drag
      var cfg = m.mob.def.hook, C = scene._vv;
      if (m.mob.hookAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.hookAt) {
          m.mob.hookAt = 0;
          var ang = m.mob._hookAng;
          if (player.state.alive) {
            var d = dist2seg(player.x, player.y, m.x, m.y, m.x + Math.cos(ang) * cfg.range, m.y + Math.sin(ang) * cfg.range);
            if (d < cfg.half) {
              Entities.hurtPlayer(scene, player, cfg.dmg, time, "a chain hook");
              if (time >= C.ccUntil) {
                C.ccUntil = time + cfg.ccMs + 600;
                var toM = Math.atan2(m.y - player.y, m.x - player.x);
                C.pull = { vx: Math.cos(toM) * cfg.drag, vy: Math.sin(toM) * cfg.drag, until: time + cfg.ccMs };
                scene.damageNumber(player.x, player.y - 24, 'HOOKED', '#8a8e9a');
                try { AUDIO.play('chainhook'); } catch (e) {}
              }
            }
          }
        }
        return true;
      }
      if (!m.mob.nextHookAt) m.mob.nextHookAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextHookAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextHookAt = time + cfg.everyMs; m.mob.hookAt = time + cfg.warnMs;
        m.mob._hookAng = Math.atan2(player.y - m.y, player.x - m.x);
        VV._laneWarnG(scene, m.x, m.y, m.x + Math.cos(m.mob._hookAng) * cfg.range, m.y + Math.sin(m.mob._hookAng) * cfg.range, cfg.half, 0x8a8e9a);
        return true;
      }
      return false;
    },
    _whip: function (scene, m, player, time) {            // tormentor: warned fel-whip arc → burn line
      var cfg = m.mob.def.whip;
      if (!m.mob.nextWhipAt) m.mob.nextWhipAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextWhipAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextWhipAt = time + cfg.everyMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        VV._lane(scene, m.x, m.y, m.x + Math.cos(ang) * cfg.len, m.y + Math.sin(ang) * cfg.len, cfg.half, cfg.warnMs, cfg.dmg, "a fel whip", false, time,
          { leaveBurn: { lifeMs: cfg.burnMs, dmg: cfg.burnDmg, tickMs: cfg.burnTickMs } });
        try { AUDIO.play('felwhip'); } catch (e) {}
        return true;
      }
      return false;
    },
    _lunge: function (scene, m, player, time) {           // angel soldier
      var cfg = m.mob.def.lunge;
      if (m.mob.lungeUntil) { if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); } return true; }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0); m.setTint(Math.floor(time / 90) % 2 ? 0xffe08a : 0xffffff);
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs; m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 60) Entities.hurtPlayer(scene, player, cfg.dmg, time, "an Angel's blade");
        }
        return true;
      }
      if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      if (m.mob._vvAggro !== false && time >= m.mob.nextLungeAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextLungeAt = time + cfg.cooldownMs; m.mob.lungeAt = time + cfg.warnMs; return true;
      }
      return false;
    },
    _lance: function (scene, m, player, time) {           // seraph: warned light-lance line
      var cfg = m.mob.def.lance;
      if (!m.mob.nextLanceAt) m.mob.nextLanceAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextLanceAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextLanceAt = time + cfg.everyMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        VV._lane(scene, m.x, m.y, m.x + Math.cos(ang) * cfg.len, m.y + Math.sin(ang) * cfg.len, cfg.half, cfg.warnMs, cfg.dmg, "a light lance", false, time, null);
        return true;
      }
      return false;
    },
    _dive: function (scene, m, player, time) {            // valkyrie: shadow marks the dive lane
      var cfg = m.mob.def.dive;
      if (m.mob.diveUntil) { if (time >= m.mob.diveUntil) { m.mob.diveUntil = 0; m.setVelocity(0, 0); } return true; }
      if (m.mob.diveAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.diveAt) {
          m.mob.diveAt = 0;
          var a = m.mob._diveAng;
          m.mob.diveUntil = time + cfg.dashMs; m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.radius) Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Valkyrie's dive");
        }
        return true;
      }
      if (!m.mob.nextDiveAt) m.mob.nextDiveAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextDiveAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextDiveAt = time + cfg.everyMs; m.mob.diveAt = time + cfg.warnMs;
        m.mob._diveAng = Math.atan2(player.y - m.y, player.x - m.x);
        VV._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, 0, "a dive shadow", false, time, null);
        return true;
      }
      return false;
    },
    _heal: function (scene, m, player, time) {            // acolyte: heals SAME-faction only (farm guard)
      var cfg = m.mob.def.mend;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.fleeRange && player.state.alive) { var a = Math.atan2(m.y - player.y, m.x - player.x); m.setVelocity(Math.cos(a) * m.mob.def.spd * 1.3, Math.sin(a) * m.mob.def.spd * 1.3); }
      else m.setVelocity(0, 0);
      if (!m.mob.nextHealAt) m.mob.nextHealAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (!scene.hitstopActive && time >= m.mob.nextHealAt) {
        var best = null, bestD = cfg.range;
        scene.mobs.children.iterate(function (o) {
          if (!o || !o.active || !o.mob || o === m || o.mob.hp >= o.mob.maxHp) return;
          if (o.mob.def.faction !== m.mob.def.faction) return;   // NEVER cross-faction (the war never ends otherwise)
          var dd = Math.hypot(o.x - m.x, o.y - m.y); if (dd < bestD) { bestD = dd; best = o; }
        });
        if (best) {
          m.mob.nextHealAt = time + cfg.everyMs;
          best.mob.hp = Math.min(best.mob.maxHp, best.mob.hp + cfg.heal);
          best.setTint(0x7ae87a); (function (o2) { scene.time.delayedCall(220, function () { if (o2.active) o2.clearTint(); }); })(best);
          scene.damageNumber(best.x, best.y - 24, '+' + cfg.heal, '#7ae87a');
          try { AUDIO.play('healchime'); } catch (e) {}
        }
      }
      return true;                                        // support never chases
    },
    _statue: function (scene, m, player, time) {          // ONLY MOVES WHEN UNWATCHED (facing-cone freeze)
      var cfg = m.mob.def.stalk;
      var faceAng = (player.flipX ? Math.PI : 0);
      if (player.body && (Math.abs(player.body.velocity.x) > 4 || Math.abs(player.body.velocity.y) > 4)) faceAng = Math.atan2(player.body.velocity.y, player.body.velocity.x);
      var toStatue = Math.atan2(m.y - player.y, m.x - player.x);
      var watched = Math.abs(angDiff(toStatue, faceAng)) < (cfg.coneDeg * Math.PI / 180);
      if (watched) { m.setVelocity(0, 0); m.mob._watched = true; }
      else {
        m.mob._watched = false;
        var a = Math.atan2(player.y - m.y, player.x - m.x);
        m.setVelocity(Math.cos(a) * cfg.spd, Math.sin(a) * cfg.spd);
        if (Math.floor(time / 400) % 2 === 0) { try { AUDIO.play('statuetick'); } catch (e) {} }
      }
      return true;                                        // fully owns its movement
    },
    _blast: function (scene, m, player, time) {           // herald: warned expanding cone knockback
      var cfg = m.mob.def.blast, C = scene._vv;
      if (m.mob.blastAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.blastAt) {
          m.mob.blastAt = 0;
          var ang = m.mob._blastAng;
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            if (pd < cfg.range && Math.abs(angDiff(pa, ang)) < cfg.halfRad) {
              Entities.hurtPlayer(scene, player, cfg.dmg, time, "a trumpet blast");
              if (time >= C.ccUntil) {
                C.ccUntil = time + cfg.ccMs + 600;
                C.pull = { vx: Math.cos(ang) * cfg.kb, vy: Math.sin(ang) * cfg.kb, until: time + cfg.ccMs };
              }
            }
          }
          try { AUDIO.play('heraldblast'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextBlastAt) m.mob.nextBlastAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextBlastAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextBlastAt = time + cfg.everyMs; m.mob.blastAt = time + cfg.warnMs;
        m.mob._blastAng = Math.atan2(player.y - m.y, player.x - m.x);
        VV._coneWarn(scene, m.x, m.y, cfg.range, m.mob._blastAng, cfg.halfRad, 0xffe08a);
        return true;
      }
      return false;
    },
    _archon: function (scene, m, player, time) {          // elite: warned greatblade arc + short light dash
      var cfg = m.mob.def.archon;
      if (m.mob.archonUntil) { if (time >= m.mob.archonUntil) { m.mob.archonUntil = 0; m.setVelocity(0, 0); } return true; }
      if (m.mob.archonAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.archonAt) {
          m.mob.archonAt = 0;
          var ang = m.mob._archonAng;
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            if (pd < cfg.range && Math.abs(angDiff(pa, ang)) < cfg.halfRad) Entities.hurtPlayer(scene, player, cfg.dmg, time, "an Archon's greatblade");
          }
          m.mob.archonUntil = time + cfg.dashMs; m.setVelocity(Math.cos(ang) * cfg.dashSpeed, Math.sin(ang) * cfg.dashSpeed);
        }
        return true;
      }
      if (!m.mob.nextArchonAt) m.mob.nextArchonAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._vvAggro !== false && time >= m.mob.nextArchonAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextArchonAt = time + cfg.everyMs; m.mob.archonAt = time + cfg.warnMs;
        m.mob._archonAng = Math.atan2(player.y - m.y, player.x - m.x);
        VV._coneWarn(scene, m.x, m.y, cfg.range, m.mob._archonAng, cfg.halfRad, 0xf6f0dc);
        return true;
      }
      return false;
    },

    // ================================================= SHARED HELPERS ======
    _coneWarn: function (scene, x, y, r, ang, half, tint) {
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(tint, 0.12); g.lineStyle(2, tint, 0.85);
      g.slice(x, y, r, ang - half, ang + half, false); g.fillPath(); g.strokePath();
      scene.tweens.add({ targets: g, alpha: 0, duration: 700, onComplete: function () { try { g.destroy(); } catch (e) {} } });
    },
    _laneWarnG: function (scene, x0, y0, x1, y1, half, tint) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, tint, 0.85); g.lineBetween(x0, y0, x1, y1);
      scene.tweens.add({ targets: g, alpha: 0, duration: 850, onComplete: function () { try { g.destroy(); } catch (e) {} } });
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, time, opts) {
      var C = scene._vv;
      // M7k AUDIT fix: opts.tint lets the Supreme's holy kit paint gold —
      // fromBoss alone painted his telegraphs hell-orange.
      var tint = (opts && opts.tint) || (fromBoss ? HELL_TINT : FEL_TINT);
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, tint: tint, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs }; scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._vv, p = scene.player;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i]; if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.tint || (z.fromBoss ? HELL_TINT : FEL_TINT));   // M7k AUDIT fix: caster tint
        if (z.dmg > 0) { scene.cameras.main.shake(80, 0.004); }
        if (z.dmg > 0 && p.state.alive && Math.hypot(p.x - z.x, p.y - z.y) < z.r) Entities.hurtPlayer(scene, p, z.dmg, time, z.src, z.fromBoss);
        if (z.opts && z.opts.leaveBurn) { var bn = z.opts.leaveBurn; var obj = scene.add.circle(z.x, z.y, z.r * 0.85, HELL_TINT, 0.24).setDepth(1.2); C.patches.push({ x: z.x, y: z.y, r: z.r * 0.85, dieAt: time + bn.lifeMs, obj: obj, dmg: bn.dmg, tickMs: bn.tickMs, nextTickAt: 0, src: 'burning ground', fromBoss: z.fromBoss }); }
      }
    },
    _lane: function (scene, x0, y0, x1, y1, half, warnMs, dmg, src, fromBoss, time, opts) {
      // M7k AUDIT fix: opts.tint — holy casters paint gold, not hell-orange
      var C = scene._vv, tint = (opts && opts.tint) || (fromBoss ? HELL_TINT : FEL_TINT);
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(x0, y0, x1, y1);
      C.lanes.push({ x0: x0, y0: y0, x1: x1, y1: y1, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint, opts: opts || null });
    },
    _runLanes: function (scene, time) {
      var C = scene._vv, p = scene.player;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i]; if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9); fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.x0, l.y0, l.x1, l.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: (function (f2) { return function () { try { f2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(100, 0.005);
        if (l.dmg > 0 && p.state.alive && dist2seg(p.x, p.y, l.x0, l.y0, l.x1, l.y1) < l.half) Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
        if (l.opts && l.opts.leaveBurn) { var bn = l.opts.leaveBurn; var mx = (l.x0 + l.x1) / 2, my = (l.y0 + l.y1) / 2; var obj = scene.add.rectangle(mx, my, Math.hypot(l.x1 - l.x0, l.y1 - l.y0), l.half * 2, FEL_TINT, 0.22).setDepth(1.2); obj.setRotation(Math.atan2(l.y1 - l.y0, l.x1 - l.x0)); C.patches.push({ x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1, half: l.half, lane: true, dieAt: time + bn.lifeMs, obj: obj, dmg: bn.dmg, tickMs: bn.tickMs, nextTickAt: 0, src: 'a burn line', fromBoss: l.fromBoss }); }
      }
    },
    _cone: function (scene, x, y, r, ang, half, warnMs, dmg, src, fromBoss, time, opts) {
      // M7k AUDIT fix: opts.tint — same caster-tint seam as _zone/_lane
      var C = scene._vv, tint = (opts && opts.tint) || (fromBoss ? HELL_TINT : FEL_TINT);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(tint, 0.15); g.lineStyle(2, tint, 0.85);
      g.slice(x, y, r, ang - half, ang + half, false); g.fillPath(); g.strokePath();
      C.cones.push({ x: x, y: y, r: r, ang: ang, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, opts: opts || null });
    },
    _runCones: function (scene, time) {
      var C = scene._vv, p = scene.player;
      for (var i = C.cones.length - 1; i >= 0; i--) {
        var c = C.cones[i]; if (time < c.at) continue;
        C.cones.splice(i, 1);
        if (c.g) { try { c.g.destroy(); } catch (e) {} }
        if (c.scales) {                                    // half-arena smite: doomed half only
          var A = { x: c.ax, y: c.ay, r: c.r };
          var inHalf = function (px, py) { if (Math.abs(py - A.y) > A.r * 1.4 || Math.abs(px - A.x) > A.r) return false; return c.safeLeft ? px >= A.x : px < A.x; };
          scene.mobs.children.iterate(function (m) { if (m && m.active && inHalf(m.x, m.y)) VV._killNoCredit(scene, m); });
          if (p.state.alive && inHalf(p.x, p.y)) Entities.hurtPlayer(scene, p, c.dmg, time, c.src, true);
          scene.cameras.main.shake(200, 0.01);
          continue;
        }
        scene.cameras.main.shake(110, 0.006);
        if (c.dmg > 0 && p.state.alive) {
          var pd = Math.hypot(p.x - c.x, p.y - c.y), pa = Math.atan2(p.y - c.y, p.x - c.x);
          if (pd < c.r && Math.abs(angDiff(pa, c.ang)) < c.half) {
            Entities.hurtPlayer(scene, p, c.dmg, time, c.src, c.fromBoss);
            if (c.opts && c.opts.kb) { p.body.velocity.x += Math.cos(c.opts.ang) * c.opts.kb; p.body.velocity.y += Math.sin(c.opts.ang) * c.opts.kb; }
          }
        }
      }
    },
    _runRings: function (scene, time) {
      var C = scene._vv, p = scene.player;
      for (var i = C.rings.length - 1; i >= 0; i--) {
        var r = C.rings[i];
        if (r.verdict) {                                   // FINAL VERDICT rotating sweep
          var t2 = Math.max(0, Math.min(1, (time - r.start) / (r.until - r.start)));
          var ang = r.ang + r.sweep * t2;
          r.g.clear(); r.g.lineStyle(r.half * 2, r.tint, 0.4); r.g.lineBetween(r.x, r.y, r.x + Math.cos(ang) * r.len, r.y + Math.sin(ang) * r.len);
          r.g.lineStyle(2, r.tint, 0.9); r.g.lineBetween(r.x, r.y, r.x + Math.cos(ang) * r.len, r.y + Math.sin(ang) * r.len);
          if (p.state.alive && dist2seg(p.x, p.y, r.x, r.y, r.x + Math.cos(ang) * r.len, r.y + Math.sin(ang) * r.len) < r.half) {
            if (!r._lastHitAt || time - r._lastHitAt > 400) { r._lastHitAt = time; Entities.hurtPlayer(scene, p, r.dmg, time, r.src, true); }
          }
          if (time >= r.until) { try { r.g.destroy(); } catch (e) {} C.rings.splice(i, 1); VV._vent(scene, r.boss, time, r.ventMs, r.ventMult, 'THE WATCHER DROOPS\nhe kneels — unload'); }
          continue;
        }
        var t = Math.max(0, Math.min(1, (time - r.start) / (r.until - r.start)));
        r.r = r.r0 + (r.maxR - r.r0) * t;
        r.g.clear();
        r.g.lineStyle(10, r.tint, 0.3); r.g.strokeCircle(r.x, r.y, r.r);
        r.g.lineStyle(3, r.tint, 0.9);
        if (r.gaps) {                                      // RING OF FIRE — draw with safe gaps
          for (var a = 0; a < Math.PI * 2; a += 0.06) {
            var safe = false; for (var gi = 0; gi < r.gaps.length; gi++) if (Math.abs(angDiff(a, r.gaps[gi])) < r.gapHalf) { safe = true; break; }
            if (!safe) put_arc(r.g, r.x, r.y, r.r, a);
          }
        } else r.g.strokeCircle(r.x, r.y, r.r);
        if (!r.hit && p.state.alive) {
          var sd = Math.hypot(p.x - r.x, p.y - r.y);
          if (Math.abs(sd - r.r) < 22) {
            var inGap = false;
            if (r.gaps) { var pa2 = Math.atan2(p.y - r.y, p.x - r.x); for (var gj = 0; gj < r.gaps.length; gj++) if (Math.abs(angDiff(pa2, r.gaps[gj])) < r.gapHalf) inGap = true; }
            if (!inGap) { r.hit = true; Entities.hurtPlayer(scene, p, r.dmg, time, r.src, r.fromBoss); }
          }
        }
        if (time >= r.until) { try { r.g.destroy(); } catch (e) {} C.rings.splice(i, 1); if (r.boss && r.ventMs) VV._vent(scene, r.boss, time, r.ventMs, r.ventMult, 'HIS CROWN GUTTERS OUT\nhe stumbles — unload'); }
      }
    },
    _vent: function (scene, b, time, ventMs, ventMult, msg) {
      if (!b || !b.active || b._vvDefeated) return;
      b.boss.ventedUntil = time + ventMs; b.boss.ventDmgMult = ventMult || 1.5; b.boss.rootUntil = time + ventMs;
      b.setTint(0xffffff);
      scene.time.delayedCall(ventMs, function () { if (b.active && !b._vvDefeated) b.clearTint(); });
      scene.banner(msg, '#d8ffa0');
    },
    _runPatches: function (scene, time) {
      var C = scene._vv, p = scene.player;
      for (var i = C.patches.length - 1; i >= 0; i--) {
        var pa = C.patches[i];
        if (time >= pa.dieAt) { if (pa.obj) { try { pa.obj.destroy(); } catch (e) {} } C.patches.splice(i, 1); continue; }
        if (!p.state.alive) continue;
        var inP = pa.lane ? (dist2seg(p.x, p.y, pa.x0, pa.y0, pa.x1, pa.y1) < pa.half) : (Math.hypot(p.x - pa.x, p.y - pa.y) < pa.r);
        if (!inP) continue;
        if (pa.dmg && time >= (pa.nextTickAt || 0)) { pa.nextTickAt = time + pa.tickMs; Entities.hurtPlayer(scene, p, pa.dmg, time, pa.src || 'the burn', pa.fromBoss); }
      }
    }
  };

  // arc-point helper for the ring-of-fire gaps (kept outside the object literal)
  function put_arc(g, cx, cy, r, a) { g.lineBetween(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2)); }

  if (typeof module !== 'undefined' && module.exports) module.exports = VV;
  root.VICEVERSA_SCENE = VV;
})(typeof window !== 'undefined' ? window : this);
