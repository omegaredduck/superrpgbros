// ============================================================================
// game/js/maps/pirate/scene.js — PIRATE SHIP scene hooks (M7 registry).
// The scene-plan PNG (assets/pirate_scene_plan.png) is canon: THE COVE (west,
// beach spawn) → lantern dock + gangplank → THE SHIP (bow north): QUARTERDECK
// (stern, helm) · MIDSHIP (mast/hatch/cannons) · THE FOREDECK (bow, storm-deck
// BOSS ARENA). THE ROCKING DECK is the signature system: the ship heels on a
// swell clock — lean telegraph, then a SLIDE that drags everyone on deck
// toward the low rail (rails clamp you aboard); hard swells roll loose cargo
// as damaging rollers. CAPTAIN KRAKEN gets thrown aboard by a colossal
// tentacle and summons THE GHOST SHIP broadside (the map's only ghost).
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var SHIP = { x0: 0.4, x1: 0.8, y0: 0.07, y1: 0.93 };        // deck bounds (clamp)
  var ARENA = { x: 0.6, y: 0.19, r: 0.135 };                  // foredeck (boss)
  var COVE_X = 0.14;                                          // beach strip (west)
  var DOCK = { x0: 0.13, y0: 0.47, x1: 0.4, y1: 0.53 };
  var DECOR = [
    // THE COVE + dock
    ['pxRowboat', 0.05, 0.38, 1.5], ['pxNets', 0.08, 0.62, 1.5], ['pxLantern', 0.2, 0.5, 1.4],
    ['pxLantern', 0.34, 0.5, 1.4],
    // FOREDECK (arena) — kept open; figurehead at the bow, capstan on the rim
    ['pxFigurehead', 0.6, 0.09, 2.2], ['pxCapstan', 0.52, 0.13, 1.5], ['pxLantern', 0.68, 0.13, 1.3],
    // MIDSHIP
    ['pxMast', 0.6, 0.42, 2.2], ['pxRigging', 0.54, 0.44, 1.6], ['pxNest', 0.64, 0.38, 1.7],
    ['pxHatch', 0.52, 0.48, 1.8],
    ['pxCannons', 0.46, 0.56, 1.6], ['pxCannons', 0.74, 0.56, 1.6],
    ['pxSail', 0.68, 0.44, 1.6], ['pxParrot', 0.66, 0.5, 1.3], ['pxRum', 0.54, 0.38, 1.4],
    ['pxGalley', 0.46, 0.64, 1.5], ['pxHammocks', 0.44, 0.7, 1.5],
    ['pxPlank', 0.79, 0.56, 1.5],
    // QUARTERDECK
    ['pxWheel', 0.6, 0.82, 1.8], ['pxCharts', 0.52, 0.78, 1.4], ['pxChest', 0.68, 0.78, 1.4],
    ['pxLantern', 0.7, 0.88, 1.3], ['pxLantern', 0.5, 0.88, 1.3]
  ];
  // rails ring the deck (visual)
  var RAILS = [];
  for (var ry = 0.15; ry <= 0.86; ry += 0.142) { RAILS.push([0.405, ry, 90]); RAILS.push([0.795, ry, 90]); }
  [[0.48, 0.925], [0.6, 0.925], [0.72, 0.925]].forEach(function (r2) { RAILS.push([r2[0], r2[1], 0]); });

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var PIR = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var S = scene._pir = {
        swell: { nextAt: 0, leanUntil: 0, slideUntil: 0, dir: 1, hard: false, periodMult: 1 },
        barrels: [], slicks: [], kegs: [],
        pin: null, zones: [], lanes: [], armWarns: [],
        ghost: null, entTent: null, threwCaptain: false,
        ship: { x0: SHIP.x0 * WW, x1: SHIP.x1 * WW, y0: SHIP.y0 * HH, y1: SHIP.y1 * HH },
        arena: { x: ARENA.x * WW, y: ARENA.y * HH, r: ARENA.r * WW },
        dockY: { y0: DOCK.y0 * HH, y1: DOCK.y1 * HH, x0: DOCK.x0 * WW, x1: DOCK.x1 * WW },
        coveX: COVE_X * WW,
        leanTint: null, rails: 0
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- floors: night sea base + beach + dock + the ship decks ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'pxsea').setDepth(-23);
      scene.add.tileSprite(COVE_X * WW / 2, HH / 2, COVE_X * WW, HH, 'pxsand').setDepth(-22);
      var dw = (DOCK.x1 - DOCK.x0) * WW, dh = (DOCK.y1 - DOCK.y0) * HH;
      scene.add.tileSprite(DOCK.x0 * WW + dw / 2, DOCK.y0 * HH + dh / 2, dw, dh, 'pxdeck').setDepth(-22);
      var sw = (SHIP.x1 - SHIP.x0) * WW, sh = (SHIP.y1 - SHIP.y0) * HH;
      scene.add.tileSprite(SHIP.x0 * WW + sw / 2, SHIP.y0 * HH + sh / 2, sw, sh, 'pxdeck').setDepth(-21);
      // foredeck storm planks + quarterdeck polish + cargo grate
      scene.add.tileSprite(SHIP.x0 * WW + sw / 2, SHIP.y0 * HH + (0.3 - SHIP.y0) * HH / 2 + 0, sw, (0.3 - SHIP.y0) * HH, 'pxstorm').setDepth(-20.5);
      scene.add.tileSprite(SHIP.x0 * WW + sw / 2, 0.72 * HH + (SHIP.y1 - 0.72) * HH / 2, sw, (SHIP.y1 - 0.72) * HH, 'pxquarter').setDepth(-20.5);
      scene.add.tileSprite(0.54 * WW, 0.485 * HH, 0.08 * WW, 0.07 * HH, 'pxgrate').setDepth(-20);
      // hull rim line
      var rim = scene.add.graphics().setDepth(-20);
      rim.lineStyle(6, 0x33251a, 0.9); rim.strokeRect(S.ship.x0, S.ship.y0, sw, sh);

      // ---- decor per the PLAN + rails ----
      DECOR.forEach(function (D) {
        scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
      });
      RAILS.forEach(function (R2) {
        var spr = scene.add.sprite(R2[0] * WW, R2[1] * HH, 'pxRail').setScale(1.4).setDepth(1.5);
        if (R2[2]) spr.setAngle(R2[2]);
        S.rails++;
      });

      // ---- spawn on the cove beach ----
      scene._realmStart = { x: 0.07 * WW, y: 0.5 * HH };

      // first swell
      S.swell.nextAt = 0;                                     // set on first update

      // mob-verb helpers (fresh closures)
      scene._pirMonkey = function (m, player, time) { return PIR._monkey(scene, m, player, time); };
      scene._pirSiren = function (m, player, time) { return PIR._siren(scene, m, player, time); };
      scene._pirKrakenArm = function (m, player, time) { return PIR._krakenArm(scene, m, player, time); };
      scene._pirMako = function (m, player, time) { return PIR._mako(scene, m, player, time); };
      scene._pirSwab = function (m, player, time) { return PIR._swab(scene, m, player, time); };
      scene._pirHarpooner = function (m, player, time) { return PIR._harpooner(scene, m, player, time); };
      scene._pirOcto = function (m, player, time) { return PIR._octo(scene, m, player, time); };
      scene._pirKeg = function (m, player, time) { return PIR._keg(scene, m, player, time); };
    },

    afterCreate: function (scene) {},

    _onShip: function (S, x, y) {
      return x >= S.ship.x0 && x <= S.ship.x1 && y >= S.ship.y0 && y <= S.ship.y1;
    },
    _inWater: function (S, x, y) {
      if (x < S.coveX) return false;                                            // beach
      if (PIR._onShip(S, x, y)) return false;                                   // deck
      if (x >= S.dockY.x0 && x <= S.dockY.x1 && y >= S.dockY.y0 && y <= S.dockY.y1) return false; // dock
      return true;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var S = scene._pir; if (!S) return;
      var dt = Math.min(120, delta), cfg = scene.realmDef.swell;
      var p = scene.player, alive = p.state.alive;

      // ---- THE SWELL clock: lean telegraph → slide → rest ----
      var sw = S.swell;
      if (!sw.nextAt) sw.nextAt = time + cfg.periodMs * 0.6;
      if (time >= sw.nextAt && !sw.leanUntil && !sw.slideUntil && !scene.scanning) {
        sw.dir = SIM.rng() < 0.5 ? -1 : 1;
        sw.hard = SIM.rng() < 0.45;
        sw.leanUntil = time + cfg.leanMs;
        sw.nextAt = Infinity;
        if (!S.leanTint) {
          var W2 = scene.scale.width, H2 = scene.scale.height;
          S.leanTint = scene.add.rectangle(W2 / 2, H2 / 2, W2, H2, 0x16324a, 0).setScrollFactor(0).setDepth(38);
        }
        scene.tweens.add({ targets: S.leanTint, fillAlpha: 0.14, duration: cfg.leanMs });
        scene.banner('THE SHIP HEELS ' + (sw.dir > 0 ? 'TO STARBOARD' : 'TO PORT') + (sw.hard ? '\nHARD SWELL — loose cargo!' : ''), '#9fc4e8');
        try { AUDIO.play('deckcreak'); } catch (e) {}
      }
      if (sw.leanUntil && time >= sw.leanUntil) {
        sw.leanUntil = 0;
        sw.slideUntil = time + cfg.slideMs;
        try { AUDIO.play('swellgroan'); } catch (e) {}
        if (sw.hard) PIR._rollBarrels(scene, S, sw.dir, time);
      }
      if (sw.slideUntil) {
        if (time >= sw.slideUntil) {
          sw.slideUntil = 0;
          sw.nextAt = time + cfg.periodMs * sw.periodMult * (0.8 + SIM.rng() * 0.4);
          if (S.leanTint) scene.tweens.add({ targets: S.leanTint, fillAlpha: 0, duration: 500 });
        } else if (!scene.hitstopActive) {
          // SLIDE: drag everything ON DECK toward the low rail; rails clamp
          var force = cfg.slideForce * (sw.hard ? 1.5 : 1) * dt / 1000 * sw.dir;
          if (alive && PIR._onShip(S, p.x, p.y)) {
            p.x = Math.max(S.ship.x0 + 18, Math.min(S.ship.x1 - 18, p.x + force));
          }
          scene.mobs.children.iterate(function (m) {
            if (!m || !m.active || !m.mob || m.mob.def.float || m.mob.hop) return;
            if (PIR._onShip(S, m.x, m.y)) {
              m.x = Math.max(S.ship.x0 + 14, Math.min(S.ship.x1 - 14, m.x + force));
            }
          });
        }
      }

      // ---- loose-cargo rollers (hard swells + the boss's command) ----
      for (var bi = S.barrels.length - 1; bi >= 0; bi--) {
        var B = S.barrels[bi];
        if (time >= B.dieAt || !alive && false) { try { B.spr.destroy(); } catch (e) {} S.barrels.splice(bi, 1); continue; }
        if (!scene.hitstopActive) {
          B.x += B.vx * dt / 1000;
          B.spr.x = B.x; B.spr.angle += B.vx * dt / 90;
          if (B.x < S.ship.x0 - 30 || B.x > S.ship.x1 + 30) { try { B.spr.destroy(); } catch (e) {} S.barrels.splice(bi, 1); continue; }
          if (alive && Math.hypot(p.x - B.x, p.y - B.y) < 26 && time - B.lastHit > 600) {
            B.lastHit = time;
            Entities.hurtPlayer(scene, p, B.dmg, time, 'a rolling barrel', !!B.fromBoss);
          }
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && m.mob && Math.hypot(m.x - B.x, m.y - B.y) < 26) scene.killMobCredited(m);
          });
        }
      }

      // ---- water slows swimmers (the sea is not a shortcut) ----
      if (alive && PIR._inWater(S, p.x, p.y)) {
        p.body.velocity.x *= 0.55; p.body.velocity.y *= 0.55;
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.float || m.mob.hop) return;
        if (PIR._inWater(S, m.x, m.y)) { m.body.velocity.x *= 0.55; m.body.velocity.y *= 0.55; }
      });

      // ---- ink slicks slow everyone standing in them ----
      for (var si = S.slicks.length - 1; si >= 0; si--) {
        var K = S.slicks[si];
        if (time >= K.dieAt) { try { K.obj.destroy(); } catch (e) {} S.slicks.splice(si, 1); continue; }
        if (alive && Math.hypot(p.x - K.x, p.y - K.y) < K.r) { p.body.velocity.x *= 0.55; p.body.velocity.y *= 0.55; }
      }

      // ---- SIREN SONG pull (verb arms the window; the drag lives here) ----
      if (alive && !scene.hitstopActive) {
        var pulled = 0, maxPull = cfg.maxPullPerFrame * dt / 1000;
        scene.mobs.children.iterate(function (m) {
          if (!m || !m.active || !m.mob || m.mob.def !== DATA.mobs.sirenWake) return;
          if (!m.mob.songUntil || time >= m.mob.songUntil) return;
          var d = Math.hypot(p.x - m.x, p.y - m.y);
          var SG = m.mob.def.song;
          if (d < SG.radius && d > 30 && pulled < maxPull) {
            var step = Math.min(SG.spd * dt / 1000, maxPull - pulled);
            p.x += (m.x - p.x) / d * step; p.y += (m.y - p.y) / d * step;
            pulled += step;
          }
        });
      }

      // ---- HARPOON PIN (hard CC, short; release on death) ----
      if (S.pin) {
        if (!alive || time >= S.pin.until) S.pin = null;
        else if (!scene.hitstopActive) p.setVelocity(0, 0);
      }

      // ---- powder kegs / monkeys: shot-early watcher (env-kill credit) ----
      for (var ki = S.kegs.length - 1; ki >= 0; ki--) {
        var G2 = S.kegs[ki];
        // M7k AUDIT fix: identity check — the pooled sprite may be REUSED for
        // an unrelated mob between frames; a stale ledger entry keyed on the
        // sprite alone tracked the newcomer and fired a phantom blast at it.
        var gone = G2.m.mob !== G2.mob;
        if (!gone && G2.m.active) { G2.x = G2.m.x; G2.y = G2.m.y; continue; }
        if (!gone && G2.m.mob && G2.m.mob._ring) { try { G2.m.mob._ring.destroy(); } catch (e) {} G2.m.mob._ring = null; }
        if (!G2.exploded && !gone) { G2.exploded = true; PIR._kegBlast(scene, G2.x, G2.y, G2.cfg, time, G2.fromBoss); }
        S.kegs.splice(ki, 1);
      }

      // M7k AUDIT fix: kraken-arm bury warns were pushed every cycle and never
      // spliced from scene._zoneWarns — drop each when it expires (eruption)
      // or when the arm dies / its pooled sprite is reused while buried.
      for (var aw = S.armWarns.length - 1; aw >= 0; aw--) {
        var AW = S.armWarns[aw];
        if (AW.m.active && AW.m.mob === AW.mob && time < AW.warn.until) continue;
        var awi = scene._zoneWarns.indexOf(AW.warn);
        if (awi >= 0) scene._zoneWarns.splice(awi, 1);
        S.armWarns.splice(aw, 1);
      }

      // ---- GHOST SHIP broadside runner ----
      if (S.ghost) {
        var GH = S.ghost;
        if (GH.phase === 'surface' && time >= GH.at) {
          GH.phase = 'waves';
          PIR._broadsideWave(scene, S, GH, 0, time);
          GH.at = time + GH.cfg.waveGapMs;
        } else if (GH.phase === 'waves' && time >= GH.at) {
          GH.wave++;
          if (GH.wave < GH.cfg.waves) {
            PIR._broadsideWave(scene, S, GH, GH.wave, time);
            GH.at = time + GH.cfg.waveGapMs;
          } else {
            GH.phase = 'sink';
            GH.at = time + 900;
            scene.tweens.add({ targets: GH.spr, x: GH.spr.x + 140, alpha: 0, duration: 900, ease: 'Sine.In' });
            try { AUDIO.play('ghostmoan'); } catch (e) {}
          }
        } else if (GH.phase === 'sink' && time >= GH.at) {
          try { GH.spr.destroy(); } catch (e) {}
          S.ghost = null;
          // he is WINDED after the summon — vented window
          var b = scene.boss;
          if (b && b.active) {
            b.boss.ventedUntil = time + GH.cfg.ventMs;
            b.boss.ventDmgMult = GH.cfg.ventDmgMult;
            b.boss.rootUntil = time + GH.cfg.ventMs;
            b.setTint(0x5fe8c2);
            (function (b2) {
              scene.time.delayedCall(GH.cfg.ventMs, function () { if (b2.active) b2.clearTint(); });
            })(b);
            scene.banner('THE SUMMON DRAINS HIM\nhe leans on his cutlass — UNLOAD', '#5fe8c2');
          }
        }
      }

      // pending telegraphed zones + beam lanes
      PIR._runZones(scene, time);
      PIR._runLanes(scene, time);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var S = scene._pir; if (!S) return;
      var sw = S.swell;
      ['nextAt', 'leanUntil', 'slideUntil'].forEach(function (k) { if (sw[k] && sw[k] !== Infinity) sw[k] += dt; });
      S.barrels.forEach(function (B) { B.dieAt += dt; B.lastHit += dt; });
      S.slicks.forEach(function (K) { K.dieAt += dt; });
      if (S.pin) S.pin.until += dt;
      if (S.ghost) S.ghost.at += dt;
      S.zones.forEach(function (z) { z.at += dt; });
      S.lanes.forEach(function (l) { l.at += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['fuseAt', 'blastAt', 'nextSongAt', 'songUntil', 'emergeAt', 'nextSweepAt', 'withdrawAt',
         'nextHopAt', 'nextShotAt2', 'lineLockUntil', 'nextSprayAt', 'wobbleAt'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
        if (m.mob.hop) { m.mob.hop.start += dt; m.mob.hop.until += dt; }
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextComboAt', 'nextSlamAt', 'nextKegAt', 'nextCrewAt', 'nextSwellAt',
         'nextBroadsideAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var S = scene._pir; if (!S) return;
      S.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record with the zone — a bulk-
        // cleared zone must not leave a stale entry in scene._zoneWarns
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      S.zones = [];
      S.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      S.lanes = [];
      S.barrels.forEach(function (B) { try { B.spr.destroy(); } catch (e) {} });
      S.barrels = [];
      S.slicks.forEach(function (K) { try { K.obj.destroy(); } catch (e) {} });
      S.slicks = [];
      S.kegs = [];                                            // dropped cleanly — no phantom blasts
      // M7k AUDIT fix: wiped kraken arms leave their bury warns behind
      S.armWarns.forEach(function (AW) {
        var wi2 = scene._zoneWarns.indexOf(AW.warn);
        if (wi2 >= 0) scene._zoneWarns.splice(wi2, 1);
      });
      S.armWarns = [];
      S.pin = null;
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: the Captain killed MID-VERB left his machinery running —
    // the surfaced ghost ship (and its queued broadside lanes) kept raking the
    // deck, and armed slam zones still burst. Central onBossDown hook.
    bossCleanup: function (scene, boss) {
      var S = scene._pir; if (!S) return;
      if (S.ghost) { try { S.ghost.spr.destroy(); } catch (e) {} S.ghost = null; }
      for (var i = S.zones.length - 1; i >= 0; i--) {
        var z = S.zones[i];
        if (!z.fromBoss) continue;
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
        S.zones.splice(i, 1);
      }
      for (var j = S.lanes.length - 1; j >= 0; j--) {
        var l = S.lanes[j];
        if (!l.fromBoss) continue;
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        S.lanes.splice(j, 1);
      }
      S.swell.periodMult = 1;                                 // his rage dies with him
    },

    // ================================================== BOSS ARRIVAL =======
    // A COLOSSAL TENTACLE rises out of the ocean beside the bow, arcs over
    // the rails, and THROWS HIM ABOARD — he lands deck-shakingly hard.
    bossArrival: function (scene, def, bx, by) {
      var S = scene._pir, self = scene;
      S.pin = null;
      scene.player.setPosition(S.arena.x, S.arena.y + S.arena.r - 40);
      scene.cameras.main.centerOn(S.arena.x, S.arena.y);
      // the tentacle rises from the water east of the bow
      var tx = S.ship.x1 + 90, ty = S.arena.y + 40;
      S.entTent = scene.add.sprite(tx, ty + 220, 'pxColossalTentacle').setScale(3).setDepth(30).setAlpha(0.95);
      scene.tweens.add({ targets: S.entTent, y: ty - 60, duration: def.entranceMs * 0.4, ease: 'Sine.Out' });
      scene.cameras.main.shake(def.entranceMs * 0.4, 0.004);
      scene.banner('SOMETHING COLOSSAL RISES OFF THE BOW', '#9fc4e8');
      try { AUDIO.play('tentacleslam'); } catch (e) {}
      // it hurls him onto the foredeck
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        S.threwCaptain = true;
        self.spawnBossNow(def, S.arena.x, S.arena.y);
        if (self.boss) {
          var b = self.boss;
          b.setAlpha(0);
          var fromX = tx - 40, fromY = ty - 120;
          b.setPosition(fromX, fromY);
          self.tweens.add({ targets: b, x: S.arena.x, y: S.arena.y, alpha: 1,
            duration: def.entranceMs * 0.3, ease: 'Quad.In',
            onComplete: function () {
              if (!b.active) return;
              self.cameras.main.shake(300, 0.012);
              self.burst(S.arena.x, S.arena.y, 20, 0x8a6a48);
              try { AUDIO.play('gravthud'); } catch (e) { try { AUDIO.play('crash'); } catch (e2) {} }
            } });
        }
        // the tentacle slides back under
        self.tweens.add({ targets: S.entTent, y: ty + 260, alpha: 0, delay: def.entranceMs * 0.25,
          duration: def.entranceMs * 0.35, ease: 'Sine.In',
          onComplete: function () { try { S.entTent.destroy(); } catch (e) {} S.entTent = null; } });
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        try { AUDIO.play('parrotsquawk'); } catch (e) {}
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, S = scene._pir;
      if (!bs._pirInit) {
        bs._pirInit = true;
        bs.nextComboAt = time + 3200; bs.nextSlamAt = time + 6800;
        bs.nextKegAt = time + 10000; bs.nextCrewAt = time + 12000;
        bs.nextSwellAt = time + 15000; bs.nextBroadsideAt = time + PT.ghostBroadside.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.spdMult = (bs.spdMult || 1) * PT.overclock.spdMult;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        S.swell.periodMult = PT.overclock.swellPeriodMult;
        b.setTint(0xf08a64);
        scene.banner('THE TENTACLE THRASHES\nthe sea answers his rage', '#f08a64');
      }
      var rate = bs.rateMult || 1;
      if (time < bs.rootUntil || S.ghost) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 90) b.setVelocity(dx / d * spd, dy / d * spd);
        else b.setVelocity(dx / d * spd * 0.3, dy / d * spd * 0.3);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextBroadsideAt) {
        bs.nextBroadsideAt = time + PT.ghostBroadside.everyMs * rate;
        PIR._ghostBegin(scene, b, time);
      } else if (time >= bs.nextSwellAt) {
        bs.nextSwellAt = time + PT.hardSwell.everyMs * rate;
        PIR._commandSwell(scene, b, time);
      } else if (time >= bs.nextSlamAt) {
        bs.nextSlamAt = time + PT.tentacleSlam.everyMs * rate;
        PIR._tentacleSlam(scene, b, player, time);
      } else if (time >= bs.nextKegAt) {
        bs.nextKegAt = time + PT.kegToss.everyMs * rate;
        PIR._kegToss(scene, b, player, time);
      } else if (time >= bs.nextComboAt) {
        bs.nextComboAt = time + PT.cutlassCombo.everyMs * rate;
        bs.busyUntil = time + PT.cutlassCombo.warnMs * 2 + 600;
        PIR._cutlassCombo(scene, b, player, time);
      }
      if (time >= bs.nextCrewAt) {
        bs.nextCrewAt = time + PT.boardingCrew.everyMs * rate;
        PIR._boardingCrew(scene, b, PT.boardingCrew);
      }
    },

    // ------------------------------------------------ boss verbs -----------
    _cutlassCombo: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.cutlassCombo, self = scene;
      var mk = function (delayMs) {
        var ang = Math.atan2(player.y - b.y, player.x - b.x);   // re-locks per step
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xc2452e, 0.15); g.lineStyle(2, 0xf08a64, 0.85);
        g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!self.boss || !self.boss.active || !player.state.alive) return;
          var d = Math.hypot(player.x - b.x, player.y - b.y);
          var pa = Math.atan2(player.y - b.y, player.x - b.x);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          var fg = self.add.graphics().setDepth(9);
          fg.fillStyle(0xf08a64, 0.4);
          fg.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
          self.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          try { AUDIO.play('khopeshshing'); } catch (e) { try { AUDIO.play('crash'); } catch (e2) {} }
          if (d < cfg.range && Math.abs(diff) < cfg.halfRad)
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "the Captain's cutlass", true);
        });
      };
      b.boss.rootUntil = time + cfg.warnMs * 2 + 500;
      mk(0);
      scene.time.delayedCall(cfg.warnMs + 220, function () {
        if (scene.boss && scene.boss.active) mk(cfg.warnMs + 220);
      });
    },
    _tentacleSlam: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tentacleSlam;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      for (var i = 0; i < cfg.count; i++) {
        var d2 = 90 + i * cfg.stepPx;
        PIR._zone(scene, b.x + Math.cos(ang) * d2, b.y + Math.sin(ang) * d2,
          cfg.radius, cfg.warnMs + i * cfg.gapMs, cfg.dmg, "the kraken arm's slam", true, true, time);
      }
      b.boss.rootUntil = time + cfg.warnMs + cfg.count * cfg.gapMs;
      try { AUDIO.play('tentacleslam'); } catch (e) {}
    },
    _kegToss: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.kegToss;
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2;
        var rr = (i === 0) ? 0 : 60 + SIM.rng() * cfg.scatter;
        scene.queueSpawn({ key: 'deckKeg', bossWave: true,
          x: player.x + Math.cos(a) * rr, y: player.y + Math.sin(a) * rr });
      }
      scene.banner('KEG TOSS\nshoot them or run', '#f08a64');
      try { AUDIO.play('kegfuse'); } catch (e) {}
    },
    _commandSwell: function (scene, b, time) {
      var S = scene._pir, sw = S.swell, cfg = scene.realmDef.swell;
      if (sw.leanUntil || sw.slideUntil) return;
      sw.dir = SIM.rng() < 0.5 ? -1 : 1;
      sw.hard = true;
      sw.leanUntil = time + cfg.leanMs * 0.7;
      sw.nextAt = Infinity;
      scene.banner('HE COMMANDS THE SEA\nHARD SWELL ' + (sw.dir > 0 ? 'TO STARBOARD' : 'TO PORT'), '#9fc4e8');
      try { AUDIO.play('swellgroan'); } catch (e) {}
    },
    _boardingCrew: function (scene, b, cfg) {
      var alive = 0;
      scene.mobs.children.iterate(function (m) { if (m && m.active) alive++; });
      if (alive >= cfg.cap) return;
      for (var i = 0; i < cfg.deckhands; i++) {
        var a = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: 'deckhand', bossWave: true,
          x: b.x + Math.cos(a) * 200, y: b.y + Math.sin(a) * 160 });
      }
      scene.queueSpawn({ key: 'cutlassCorsair', bossWave: true, x: b.x + 120, y: b.y + 80 });
      scene.banner('BOARDERS!\nthe crew swings in', '#c2452e');
    },
    _ghostBegin: function (scene, b, time) {
      var S = scene._pir, cfg = b.boss.def.patterns.ghostBroadside;
      if (S.ghost) return;
      var gx = S.ship.x1 + 150, gy = S.arena.y + S.arena.r * 0.4;
      var spr = scene.add.sprite(gx + 160, gy, 'pxGhostShip').setScale(2.6).setDepth(3).setAlpha(0);
      scene.tweens.add({ targets: spr, x: gx, alpha: 0.85, duration: cfg.surfaceMs, ease: 'Sine.Out' });
      S.ghost = { spr: spr, phase: 'surface', at: time + cfg.surfaceMs, wave: 0, cfg: cfg };
      b.boss.rootUntil = time + cfg.surfaceMs + cfg.waves * cfg.waveGapMs + 1400;
      b.boss.busyUntil = b.boss.rootUntil;
      scene.banner('THE GHOST SHIP SURFACES TO STARBOARD\ngunports glowing — watch the lanes', '#5fe8c2');
      try { AUDIO.play('ghostmoan'); } catch (e) {}
    },
    _broadsideWave: function (scene, S, GH, wave, time) {
      var cfg = GH.cfg;
      // lanes rake the deck horizontally (from the ghost ship, port-ward)
      var lanesY = [];
      for (var i = 0; i < cfg.lanesPerWave; i++) {
        var fy = S.arena.y - S.arena.r + ((wave % 2 === 0 ? i * 2 : i * 2 + 1) + 0.5) / (cfg.lanesPerWave * 2) * (S.arena.r * 2.4);
        lanesY.push(fy);
      }
      lanesY.forEach(function (ly) {
        PIR._lane(scene, { x0: S.ship.x0 - 20, y0: ly, x1: S.ship.x1 + 130, y1: ly },
          cfg.half, cfg.warnMs, cfg.dmg, "the ghost ship's broadside", true, time, 0x5fe8c2);
      });
      try { AUDIO.play('broadside'); } catch (e) {}
    },

    // =============================================== MOB VERBS (map-new) ===
    // POWDER MONKEY — sprints at you with a lit keg; beeping fuse, blast.
    _monkey: function (scene, m, player, time) {
      return PIR._fuseRunner(scene, m, player, time, m.mob.def.keg, false, true);
    },
    // DECK KEG (boss toss) — rooted keg on a fuse; same blast tech.
    _keg: function (scene, m, player, time) {
      return PIR._fuseRunner(scene, m, player, time, m.mob.def.keg, !!m.mob.bossWave, false);
    },
    _fuseRunner: function (scene, m, player, time, cfg, fromBoss, runs) {
      var S = scene._pir;
      if (!m.mob._kegInit) {
        m.mob._kegInit = true;
        // M7k AUDIT fix: store the mob ref too — the watcher checks identity
        S.kegs.push({ m: m, mob: m.mob, x: m.x, y: m.y, exploded: false, cfg: cfg, fromBoss: fromBoss });
        if (!runs) {                                          // tossed keg: fuse from spawn
          m.mob.blastAt = time + cfg.fuseMs;
          var ring0 = scene.add.circle(m.x, m.y, cfg.radius, 0xf08a64, 0.1)
            .setStrokeStyle(2, 0xf08a64, 0.85).setDepth(2).setScale(0.4);
          scene.tweens.add({ targets: ring0, scale: 1, duration: cfg.fuseMs });
          m.mob._ring = ring0;
          try { AUDIO.play('kegfuse'); } catch (e) {}
        }
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.blastAt) {
        if (d > 1) m.setVelocity((player.x - m.x) / d * m.mob.def.spd, (player.y - m.y) / d * m.mob.def.spd);
        if (d < cfg.armRange && player.state.alive) {
          m.mob.blastAt = time + cfg.fuseMs;
          var ring = scene.add.circle(m.x, m.y, cfg.radius, 0xf08a64, 0.1)
            .setStrokeStyle(2, 0xf08a64, 0.85).setDepth(2).setScale(0.4);
          scene.tweens.add({ targets: ring, scale: 1, duration: cfg.fuseMs });
          m.mob._ring = ring;
          try { AUDIO.play('kegfuse'); } catch (e) {}
        }
        return true;
      }
      m.setVelocity(0, 0);
      m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xf08a64 : 0xffffff);
      if (m.mob._ring) m.mob._ring.setPosition(m.x, m.y);
      if (time >= m.mob.blastAt) {
        var entry = null;
        for (var i = 0; i < S.kegs.length; i++) if (S.kegs[i].m === m) entry = S.kegs[i];
        if (entry) entry.exploded = true;
        var bx = m.x, by = m.y;
        if (m.mob._ring) { try { m.mob._ring.destroy(); } catch (e) {} m.mob._ring = null; }
        scene.killMobCredited(m);                             // env kill, credited (XP first)
        PIR._kegBlast(scene, bx, by, cfg, time, fromBoss);
      }
      return true;
    },
    // SIREN — her song windows PULL you toward her (drag lives in update).
    _siren: function (scene, m, player, time) {
      var cfg = m.mob.def.song;
      if (!m.mob.nextSongAt) m.mob.nextSongAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextSongAt) {
        m.mob.nextSongAt = time + cfg.everyMs;
        m.mob.songUntil = time + cfg.songMs;
        scene.damageNumber(m.x, m.y - 26, '~ ♪ ~', '#9fc4e8');
        try { AUDIO.play('gullshriek'); } catch (e) {}
      }
      if (m.mob.songUntil && time < m.mob.songUntil) {
        m.setTint(Math.floor(time / 160) % 2 === 0 ? 0x9fc4e8 : 0xffffff);
        m.setVelocity(0, 0);                                  // rooted while singing
        return true;
      }
      if (m.mob.songUntil) { m.clearTint(); m.mob.songUntil = 0; }
      return false;                                           // core chase between songs
    },
    // KRAKEN ARM — erupts from a warned deck hole, sweeps, withdraws, moves.
    _krakenArm: function (scene, m, player, time) {
      var cfg = m.mob.def.arm, S = scene._pir;
      if (!m.mob.emergeAt) {                                  // bury + warn
        m.mob.emergeAt = time + cfg.warnMs;
        m.mob.withdrawAt = 0;
        m.setVisible(false); m.body.enable = false;
        var hole = scene.add.circle(m.x, m.y, cfg.holeR, 0x33251a, 0.5)
          .setStrokeStyle(2, 0xc2452e, 0.85).setDepth(1.6);
        m.mob._hole = hole;
        // M7k AUDIT fix: ledger the warn so update() can splice it back out
        var buryWarn = { x: m.x, y: m.y, r: cfg.holeR, until: time + cfg.warnMs };
        scene._zoneWarns.push(buryWarn);
        S.armWarns.push({ m: m, mob: m.mob, warn: buryWarn });
        return true;
      }
      if (!m.mob.withdrawAt) {                                // waiting to erupt
        if (time < m.mob.emergeAt) return true;
        m.setVisible(true); m.body.enable = true; m.body.reset(m.x, m.y);
        m.mob.withdrawAt = time + cfg.upMs;
        m.mob.nextSweepAt = time + 400;
        scene.burst(m.x, m.y, 12, 0x7e3a5c);
        scene.cameras.main.shake(120, 0.005);
        try { AUDIO.play('tentacleslam'); } catch (e) {}
      }
      m.setVelocity(0, 0);                                    // rooted while up
      if (time >= (m.mob.nextSweepAt || 0)) {
        m.mob.nextSweepAt = time + cfg.sweepEveryMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        PIR._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(ang) * cfg.sweepLen, y1: m.y + Math.sin(ang) * cfg.sweepLen },
          cfg.sweepHalf, cfg.sweepWarnMs, cfg.sweepDmg, "a kraken arm's sweep", false, time, 0x7e3a5c);
      }
      if (time >= m.mob.withdrawAt) {                         // withdraw → resurface near you
        if (m.mob._hole) { try { m.mob._hole.destroy(); } catch (e) {} m.mob._hole = null; }
        var a = SIM.rng() * Math.PI * 2;
        var nx = player.x + Math.cos(a) * 180, ny = player.y + Math.sin(a) * 180;
        nx = Math.max(S.ship.x0 + 30, Math.min(S.ship.x1 - 30, nx));
        ny = Math.max(S.ship.y0 + 30, Math.min(S.ship.y1 - 30, ny));
        m.body.enable = false;
        m.x = nx; m.y = ny;
        m.mob.emergeAt = 0; m.mob.withdrawAt = 0;             // re-bury next frame
        m.setVisible(false);
      }
      return true;
    },
    // MAKO LEAPER — leaps over the rails onto marked deck circles.
    _mako: function (scene, m, player, time) {
      var cfg = m.mob.def.hop;
      if (m.mob.hop) {
        var H = m.mob.hop;
        var t = Math.max(0, Math.min(1, (time - H.start) / (H.until - H.start)));
        m.x = H.x0 + (H.x1 - H.x0) * t;
        m.y = H.y0 + (H.y1 - H.y0) * t - Math.sin(t * Math.PI) * 50;
        if (time >= H.until) {
          m.body.enable = true;
          m.body.reset(H.x1, H.y1);
          try { H.ring.destroy(); } catch (e) {}
          m.mob.hop = null;
          scene.burst(H.x1, H.y1, 10, 0x2a5a7e);
          try { AUDIO.play('crash'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - H.x1, player.y - H.y1) < cfg.landRadius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, 'a Mako Leaper');
        }
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHopAt && d > 90 && d < cfg.range && player.state.alive) {
        m.mob.nextHopAt = time + cfg.everyMs;
        var tx = player.x + player.body.velocity.x * 0.3, ty = player.y + player.body.velocity.y * 0.3;
        var ring = scene.add.circle(tx, ty, cfg.landRadius, 0xc2452e, 0.12)
          .setStrokeStyle(2, 0xc2452e, 0.85).setDepth(2);
        m.mob.hop = { x0: m.x, y0: m.y, x1: tx, y1: ty, start: time, until: time + cfg.airMs, ring: ring };
        m.body.enable = false;
        m.setVelocity(0, 0);
        return true;
      }
      if (d > 1) m.setVelocity((player.x - m.x) / d * m.mob.def.spd, (player.y - m.y) / d * m.mob.def.spd);
      return true;
    },
    // DRUNKEN SWAB — erratic zig-zag: owns his own wobbling path.
    _swab: function (scene, m, player, time) {
      if (!m.mob.wobbleAt || time >= m.mob.wobbleAt) {
        m.mob.wobbleAt = time + 350 + SIM.rng() * 450;
        m.mob._wob = (SIM.rng() * 2 - 1) * 1.2;               // new lurch angle
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y) || 1;
      var base = Math.atan2(player.y - m.y, player.x - m.x) + m.mob._wob;
      var spd = m.mob.def.spd;
      m.setVelocity(Math.cos(base) * spd, Math.sin(base) * spd);
      return true;
    },
    // HARPOONER — telegraphed harpoon lane; hit = brief PIN (root).
    _harpooner: function (scene, m, player, time) {
      var cfg = m.mob.def.harpoon, S = scene._pir;
      if (m.mob.lineLockUntil && time < m.mob.lineLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextShotAt2) m.mob.nextShotAt2 = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextShotAt2 && d < cfg.range && player.state.alive) {
        m.mob.nextShotAt2 = time + cfg.everyMs;
        m.mob.lineLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var L = { x0: m.x, y0: m.y, x1: m.x + Math.cos(ang) * cfg.len, y1: m.y + Math.sin(ang) * cfg.len };
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(cfg.half * 2, 0x9fc4e8, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
        g.lineStyle(2, 0x9fc4e8, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
        var self = scene;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!player.state.alive || !m.active) return;
          var fg = self.add.graphics().setDepth(9);
          fg.lineStyle(3, 0xe0f0ff, 0.9); fg.lineBetween(L.x0, L.y0, L.x1, L.y1);
          self.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          try { AUDIO.play('harpoonthunk'); } catch (e) {}
          if (dist2seg(player.x, player.y, L.x0, L.y0, L.x1, L.y1) < cfg.half) {
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a harpooner's spear");
            S.pin = { until: self.time.now + cfg.pinMs };
            self.damageNumber(player.x, player.y - 24, 'PINNED', '#9fc4e8');
          }
        });
        return true;
      }
      return false;                                           // core chase otherwise
    },
    // INKPOT OCTO — lobs warned ink globs → slippery slicks.
    _octo: function (scene, m, player, time) {
      var cfg = m.mob.def.ink, S = scene._pir;
      if (!m.mob.nextSprayAt) m.mob.nextSprayAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSprayAt && d < cfg.range && player.state.alive) {
        m.mob.nextSprayAt = time + cfg.everyMs;
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * 50;
        var zx = player.x + Math.cos(a) * rr, zy = player.y + Math.sin(a) * rr;
        var ring = scene.add.circle(zx, zy, cfg.radius, 0x0a0c10, 0.15)
          .setStrokeStyle(2, 0x1c1e2c, 0.8).setDepth(2).setScale(0.35);
        scene.tweens.add({ targets: ring, scale: 1, duration: cfg.warnMs });
        var self = scene;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { ring.destroy(); } catch (e) {}
          if (!m.active) return;                              // M7k AUDIT fix: dead-caster guard (harpooner rule)
          var obj = self.add.circle(zx, zy, cfg.radius, 0x0a0c10, 0.45).setDepth(1.2);
          S.slicks.push({ x: zx, y: zy, r: cfg.radius, dieAt: self.time.now + cfg.lifeMs, obj: obj });
        });
        return false;
      }
      return false;                                           // core chase (slow zoner)
    },

    // ================================================= INTERNAL HELPERS ====
    _kegBlast: function (scene, x, y, cfg, time, fromBoss) {
      scene.burst(x, y, 16, 0xff9a3a);
      scene.cameras.main.shake(150, 0.007);
      try { AUDIO.play('crash'); } catch (e) {}
      // mobs first (XP/level-up heals land BEFORE the player burn), player last
      scene.mobs.children.iterate(function (o) {
        if (o && o.active && o.mob && Math.hypot(o.x - x, o.y - y) < cfg.radius &&
            o.mob.def !== DATA.mobs.powderMonkey && o.mob.def !== DATA.mobs.deckKeg)
          scene.killMobCredited(o);
      });
      var p = scene.player;
      if (p.state.alive && Math.hypot(p.x - x, p.y - y) < cfg.radius)
        Entities.hurtPlayer(scene, p, cfg.dmg, time || scene.time.now, 'a powder keg', !!fromBoss);
    },
    _rollBarrels: function (scene, S, dir, time) {
      var cfg = scene.realmDef.swell;
      for (var i = 0; i < cfg.barrels; i++) {
        var by = S.ship.y0 + 60 + SIM.rng() * (S.ship.y1 - S.ship.y0 - 120);
        var bx = dir > 0 ? S.ship.x0 + 20 : S.ship.x1 - 20;
        var spr = scene.add.sprite(bx, by, 'pxRum').setScale(1.1).setDepth(4);
        S.barrels.push({ spr: spr, x: bx, y: by, vx: dir * cfg.barrelSpeed,
          dmg: cfg.barrelDmg, dieAt: time + 6000, lastHit: 0, fromBoss: !!scene.boss });
      }
      try { AUDIO.play('barrelrumble'); } catch (e) {}
    },

    _wrap: null,   // pirate wrap handled by the shared runner below

    // pending telegraphed circle blasts (absolute clocks — unfreeze-safe)
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time) {
      var S = scene._pir;
      var tint = fromBoss ? 0x7e3a5c : 0x9fc4e8;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      S.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var S = scene._pir;
      for (var i = S.zones.length - 1; i >= 0; i--) {
        var z = S.zones[i];
        if (time < z.at) continue;
        S.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0x7e3a5c : 0x9fc4e8);
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
    // warned LANE (harpoons, kraken sweeps, the ghost broadside)
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint) {
      var S = scene._pir;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      S.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint });
    },
    _runLanes: function (scene, time) {
      var S = scene._pir;
      for (var i = S.lanes.length - 1; i >= 0; i--) {
        var l = S.lanes[i];
        if (time < l.at) continue;
        S.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(110, 0.005);
        try { AUDIO.play('crash'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.def !== DATA.mobs.krakenArm && m.mob.def !== DATA.mobs.harpooner &&
              dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
      }
    }
  };

  // shared toroidal wrap (seam through open water)
  PIR.update = (function (baseUpdate) {
    return function (scene, time, delta) {
      baseUpdate(scene, time, delta);
      var WW = scene.worldW, HH = scene.worldH, S = scene._pir;
      if (!S) return;
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
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave && !m.mob.hop) wrap(m); });
    };
  })(PIR.update);

  if (typeof module !== 'undefined' && module.exports) module.exports = PIR;
  root.PIRATE_SCENE = PIR;
})(typeof window !== 'undefined' ? window : this);
