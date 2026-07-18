// ============================================================================
// game/js/maps/carnival/scene.js — HAUNTED CARNIVAL scene hooks (M7 registry).
// The scene-plan PNG (assets/carnival_scene_plan.png) is canon: a midnight
// fairground on warped FUNHOUSE CHECKER ringed by a wooden fence (south gate
// spawn), the MIDWAY spine of GAME BOOTHS A–D, the RIDE YARD west, SIDESHOW
// ALLEY east, and THE BIG TOP north (boss arena: ring mat, solid striped wall
// except the south flap). GAME BOOTHS is the signature system: booths light
// ONE AT A TIME on a cycle — enter the glow to start an opt-in target round;
// win = prize drop, timeout/abandon = the booth BITES BACK (warned burst,
// killMobCredited on mobs). NEVER mandatory, NEVER two at once. Toroidal wrap
// through the dead-grass outskirts (the wrap never crosses the tent — the
// tent is interior). THE RINGMASTER swings down on a trapeze; his STEP RIGHT
// UP verb weaponizes the booth tech as a safe-ring inversion.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var FAIR = { x0: 0.08, y0: 0.08, x1: 0.92, y1: 0.95 };      // fence rect
  var GATE = { x0: 0.46, x1: 0.54 };                          // south gate gap
  var TENT = { x: 0.5, y: 0.26, rx: 0.19, ry: 0.165 };        // big top ellipse
  var FLAP = 0.34;                                            // south flap half-angle (rad)
  var BOOTHS = [
    { id: 'A', kind: 'bottles', x: 0.4, y: 0.76, tex: 'cvdBottle' },
    { id: 'B', kind: 'darts',   x: 0.6, y: 0.72, tex: 'cvdDarts' },
    { id: 'C', kind: 'striker', x: 0.4, y: 0.62, tex: 'cvdStriker' },
    { id: 'D', kind: 'dunk',    x: 0.6, y: 0.56, tex: 'cvdDunk' }
  ];
  var DECOR = [
    // south gate
    ['cvdTicket', 0.5, 0.875, 1.7], ['cvdLights', 0.43, 0.885, 1.3], ['cvdLights', 0.57, 0.885, 1.3],
    // the midway
    ['cvdLights', 0.5, 0.68, 1.5], ['cvdCandy', 0.47, 0.55, 1.5], ['cvdPopcorn', 0.54, 0.63, 1.5],
    ['cvdPrizes', 0.5, 0.48, 1.6], ['cvdLights', 0.5, 0.585, 1.4],
    // ride yard (west)
    ['cvdCarousel', 0.2, 0.62, 1.9], ['cvdFerris', 0.17, 0.44, 2.0], ['cvdTeacup', 0.27, 0.52, 1.5],
    // sideshow alley (east)
    ['cvdWagon', 0.78, 0.6, 1.6], ['cvdCage', 0.83, 0.48, 1.5], ['cvdPosters', 0.76, 0.72, 1.5],
    ['cvdMirrors', 0.82, 0.36, 1.6], ['cvdFunhouse', 0.72, 0.44, 1.6],
    // big top interior
    ['cvdCalliope', 0.5, 0.17, 1.7], ['cvdBunting', 0.44, 0.315, 1.4], ['cvdBunting', 0.56, 0.315, 1.4]
  ];
  var GOLD = 0xffd23f, TEAL = 0x3fc8b4, PINKT = 0xe86a9a;

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var CAR = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._car = {
        booths: [], booth: { idx: -1, state: 'idle', nextAt: 0, litUntil: 0, roundEndsAt: 0, targets: [] },
        zones: [], lanes: [], rings: [], patches: [], mobWarns: [],
        blobs: [], blobChildMarks: 0, ccSlowUntil: 0,
        spot: null, finale: null, game: null, bossArmed: false, trapeze: null,
        arena: { x: TENT.x * WW, y: TENT.y * HH, r: Math.min(TENT.rx * WW, TENT.ry * HH) * 0.82 }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- ground: dead-grass outskirts, checker fairground, ring mat ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'cvgrass').setDepth(-23).setTint(0x9a9a8a);
      var fair = scene.add.tileSprite((FAIR.x0 + FAIR.x1) / 2 * WW, (FAIR.y0 + FAIR.y1) / 2 * HH,
        (FAIR.x1 - FAIR.x0) * WW, (FAIR.y1 - FAIR.y0) * HH, 'cvchecker').setDepth(-22);
      var mat = scene.add.tileSprite(C.arena.x, C.arena.y, TENT.rx * 2 * WW + 8, TENT.ry * 2 * HH + 8, 'cvringmat').setDepth(-21);
      var mg = scene.make.graphics({ add: false });
      mg.fillStyle(0xffffff, 1); mg.fillEllipse(C.arena.x, C.arena.y, TENT.rx * 2 * WW, TENT.ry * 2 * HH);
      mat.setMask(mg.createGeometryMask());
      // center-ring spotlight circle + ring boundary (cosmetic)
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0xb08a1e, 0.7); rg.strokeEllipse(C.arena.x, C.arena.y, C.arena.r * 1.1, C.arena.r * 0.95);
      rg.lineStyle(2, 0xe8dcc0, 0.5); rg.strokeEllipse(C.arena.x, C.arena.y, TENT.rx * 2 * WW - 10, TENT.ry * 2 * HH - 10);
      // ghost-train rails decal (ride yard)
      rg.lineStyle(2, 0x3fc8b4, 0.45);
      rg.lineBetween(0.13 * WW, 0.79 * HH, 0.31 * WW, 0.72 * HH);
      rg.lineBetween(0.13 * WW, 0.81 * HH, 0.31 * WW, 0.74 * HH);

      // ---- ONE shared static wall group (colliders attach in afterCreate —
      // the player doesn't exist yet during setup: the m7g lesson) ----
      C.wallGroup = scene.physics.add.staticGroup();
      // fence blocks (solid, visible wood posts) — gate gap on the south edge
      var step = 0.02;
      for (var t = FAIR.x0; t <= FAIR.x1; t += step) {
        CAR._fenceBlock(scene, C, t * WW, FAIR.y0 * HH);                       // north
        if (t < GATE.x0 || t > GATE.x1) CAR._fenceBlock(scene, C, t * WW, FAIR.y1 * HH); // south (gate gap)
      }
      for (var u = FAIR.y0 + step; u < FAIR.y1; u += step) {
        CAR._fenceBlock(scene, C, FAIR.x0 * WW, u * HH);
        CAR._fenceBlock(scene, C, FAIR.x1 * WW, u * HH);
      }
      // BIG TOP wall: striped canvas ring, solid except the south flap
      var tg = scene.add.graphics().setDepth(2.4);
      var erx = TENT.rx * WW, ery = TENT.ry * HH;
      for (var a = 0; a < Math.PI * 2; a += 0.045) {
        if (Math.abs(a - Math.PI / 2) < FLAP) continue;                        // south flap gap
        var px = C.arena.x + Math.cos(a) * erx, py = TENT.y * HH + Math.sin(a) * ery;
        tg.fillStyle(Math.floor(a * 9) % 2 ? 0xb03440 : 0xe8dcc0, 0.92);
        tg.fillCircle(px, py, 13);
        if (a % 0.135 < 0.045) {                                               // solid every 3rd step
          var blk = scene.add.rectangle(px, py, 26, 26, 0x000000, 0).setDepth(2);
          C.wallGroup.add(blk);
        }
      }
      // dark flap shadow
      tg.fillStyle(0x0a060c, 0.5);
      tg.fillRect(C.arena.x - 0.035 * WW, TENT.y * HH + ery - 18, 0.07 * WW, 30);

      // ---- GAME BOOTHS A–D: sprite + solid stand + glow zone at the mouth --
      BOOTHS.forEach(function (B, i) {
        var bx = B.x * WW, by = B.y * HH;
        scene.add.sprite(bx, by, B.tex).setScale(1.7).setDepth(2);
        var stand = scene.add.rectangle(bx, by, 62, 40, 0x000000, 0).setDepth(2);
        C.wallGroup.add(stand);
        var mouthX = bx, mouthY = by + 58;
        var glow = scene.add.circle(mouthX, mouthY, 62, GOLD, 0.16)
          .setStrokeStyle(2, GOLD, 0.8).setDepth(1.4).setVisible(false);
        C.booths.push({ id: B.id, kind: B.kind, x: bx, y: by, mouthX: mouthX, mouthY: mouthY, glow: glow });
      });

      // ---- decor per the PLAN ----
      DECOR.forEach(function (D) {
        scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
      });

      // ---- spawn at the SOUTH GATE ----
      scene._realmStart = { x: 0.5 * WW, y: 0.91 * HH };

      // mob-verb helpers (fresh closures)
      scene._cvClown = function (m, player, time) { return CAR._clown(scene, m, player, time); };
      scene._cvWisp = function (m, player, time) { return CAR._wisp(scene, m, player, time); };
      scene._cvBarker = function (m, player, time) { return CAR._barker(scene, m, player, time); };
      scene._cvTeddy = function (m, player, time) { return CAR._teddy(scene, m, player, time); };
      scene._cvPoltergeist = function (m, player, time) { return CAR._poltergeist(scene, m, player, time); };
      scene._cvShade = function (m, player, time) { return CAR._shade(scene, m, player, time); };
      scene._cvBlob = function (m, player, time) { return CAR._blob(scene, m, player, time); };
      scene._cvJuggler = function (m, player, time) { return CAR._juggler(scene, m, player, time); };
      scene._cvMole = function (m, player, time) { return CAR._mole(scene, m, player, time); };
      scene._cvMonkey = function (m, player, time) { return CAR._monkey(scene, m, player, time); };
      scene._cvPhantom = function (m, player, time) { return CAR._phantom(scene, m, player, time); };
    },

    _fenceBlock: function (scene, C, x, y) {
      var r = scene.add.rectangle(x, y, 22, 22, 0x4e3520, 0.9).setDepth(2);
      scene.add.rectangle(x, y - 8, 6, 16, 0x2e1e10, 0.9).setDepth(2.1);
      C.wallGroup.add(r);
    },

    afterCreate: function (scene) {
      var C = scene._car; if (!C) return;
      C.wallColliderP = scene.physics.add.collider(scene.player, C.wallGroup);
      C.wallColliderM = scene.physics.add.collider(scene.mobs, C.wallGroup);
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._car; if (!C) return;
      var cfg = scene.realmDef.booth;
      var p = scene.player, alive = p.state.alive;
      var dts = Math.min(120, delta) / 1000;

      // boss-owned machinery clears when the boss is down (armed rule)
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        CAR._clearSpot(C); CAR._clearFinale(C); CAR._clearGame(C);
      }

      // ---- GAME BOOTHS cycle (parked during boss / scanning) ----
      var B = C.booth;
      if (!B.nextAt) B.nextAt = time + cfg.cycleMs * 0.5;
      if (B.state === 'idle' && B.nextAt !== Infinity && time >= B.nextAt && !scene.scanning && !scene.boss) {
        B.idx = (B.idx + 1) % C.booths.length;
        B.state = 'lit'; B.litUntil = time + cfg.glowMs;
        C.booths[B.idx].glow.setVisible(true);
        try { AUDIO.play('boothsting'); } catch (e) {}
        scene.banner('STEP RIGHT UP\nbooth ' + C.booths[B.idx].id + ' flickers alive', '#ffd23f');
      }
      if (B.state === 'lit') {
        var bb = C.booths[B.idx];
        bb.glow.setAlpha(0.5 + 0.4 * Math.sin(time / 130));
        if (alive && Math.hypot(p.x - bb.mouthX, p.y - bb.mouthY) < 66) {
          // the player steps into the glow — the round begins
          B.state = 'round'; B.roundEndsAt = time + cfg.roundMs;
          for (var ti = 0; ti < cfg.targetsN; ti++) {
            var tx = bb.x + (ti - (cfg.targetsN - 1) / 2) * 34, ty = bb.y - 30;
            var og = scene.add.graphics().setDepth(4);
            og.fillStyle(0xb03440, 1); og.fillCircle(tx, ty, 11);
            og.fillStyle(0xe8dcc0, 1); og.fillCircle(tx, ty, 7);
            og.fillStyle(0xb03440, 1); og.fillCircle(tx, ty, 3);
            B.targets.push({ x: tx, y: ty, g: og });
          }
          try { AUDIO.play('boothsting'); } catch (e) {}
          scene.banner('THE ROUND IS ON\nshoot the targets — win the prize', '#a8f0e4');
        } else if (time >= B.litUntil) {
          // nobody played — no harm, no foul (opt-in only)
          bb.glow.setVisible(false);
          B.state = 'idle'; B.nextAt = time + cfg.cycleMs;
        }
      }
      if (B.state === 'round') {
        var bb2 = C.booths[B.idx];
        bb2.glow.setAlpha(0.6 + 0.35 * Math.sin(time / 80));
        // shots pop targets (env objects — NO kill credit)
        var shots = scene.playerShots;
        if (shots) shots.children.iterate(function (s) {
          if (!s || !s.active) return;
          for (var i2 = B.targets.length - 1; i2 >= 0; i2--) {
            var T = B.targets[i2];
            if (Math.hypot(s.x - T.x, s.y - T.y) < 24) {
              try { T.g.destroy(); } catch (e) {}
              B.targets.splice(i2, 1);
              scene.burst(T.x, T.y, 8, GOLD);
              try { AUDIO.play('targetpop'); } catch (e) {}
              if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
              break;
            }
          }
        });
        if (!B.targets.length) {
          // WIN — prize drop
          p.state.hp = Math.min(p.state.stats.hp, p.state.hp + Math.round(p.state.stats.hp * cfg.prizeHealPct));
          Entities.grantXp(scene, p, cfg.prizeXp);
          scene.burst(bb2.mouthX, bb2.mouthY, 22, GOLD);
          scene.damageNumber(bb2.mouthX, bb2.mouthY - 30, 'WINNER!', '#ffd23f');
          try { AUDIO.play('prizefanfare'); } catch (e) {}
          bb2.glow.setVisible(false);
          B.state = 'idle'; B.nextAt = time + cfg.cycleMs;
        } else if (time >= B.roundEndsAt || (alive && Math.hypot(p.x - bb2.mouthX, p.y - bb2.mouthY) > 360)) {
          // THE BOOTH BITES BACK — warned burst at the mouth
          CAR._failRound(scene, C, cfg, time);
        }
      }

      // ---- sticky patches (cotton candy) + CC slow ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        if (time >= C.patches[pi].dieAt) { try { C.patches[pi].obj.destroy(); } catch (e) {} C.patches.splice(pi, 1); }
      }
      if (alive) {
        for (var pj = 0; pj < C.patches.length; pj++) {
          var PA = C.patches[pj];
          if (Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r) { p.body.velocity.x *= 0.55; p.body.velocity.y *= 0.55; break; }
        }
        if (C.ccSlowUntil > time) { p.body.velocity.x *= 0.6; p.body.velocity.y *= 0.6; }
      }

      // ---- armed cleanups: warn graphics whose mob died early ----
      for (var wi = C.mobWarns.length - 1; wi >= 0; wi--) {
        var MW = C.mobWarns[wi];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(wi, 1); }
      }

      // ---- blob split-on-death watcher (splits ONCE, via queueSpawn) ----
      for (var bi = 0; bi < C.blobs.length; bi++) {
        var BL = C.blobs[bi];
        if (BL.done) continue;
        // M7k AUDIT fix: identity — the pooled sprite may be REUSED for an
        // unrelated mob; a stale ledger entry must not fire a split for it.
        if (BL.m.mob !== BL.mob) { BL.done = true; continue; }
        if (BL.m.active) continue;
        BL.done = true;
        // M7k AUDIT fix: annihilation is final — no splits during the
        // post-wipe run-up (portal roar / boss portal / chest pending)
        if (scene.closing || scene.pendingLoot || scene.bossPortal) continue;
        if (!BL.child) {
          C.blobChildMarks += 2;
          scene.queueSpawn({ key: 'cottonCandyBlob', x: BL.x - 24, y: BL.y });
          scene.queueSpawn({ key: 'cottonCandyBlob', x: BL.x + 24, y: BL.y });
          scene.burst(BL.x, BL.y, 12, PINKT);
        }
      }

      // ---- expanding RINGS (shade shockwaves) ----
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.3); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        if (!RG.hit && alive) {
          var sd = Math.hypot(p.x - RG.x, p.y - RG.y);
          if (Math.abs(sd - RG.r) < 20) {
            RG.hit = true;
            Entities.hurtPlayer(scene, p, RG.dmg, time, RG.src, RG.fromBoss);
          }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }

      // ---- SPOTLIGHT LOCK (boss) — breaks on hitstop, chases, then CRASH ----
      if (C.spot) {
        var SP = C.spot;
        if (!scene.hitstopActive && alive) {
          var sdx = p.x - SP.x, sdy = p.y - SP.y, sdd = Math.hypot(sdx, sdy) || 1;
          var mv = Math.min(sdd, SP.speed * dts);
          SP.x += sdx / sdd * mv; SP.y += sdy / sdd * mv;
        }
        var st = Math.max(0, Math.min(1, 1 - (SP.lockAt - time) / SP.chaseMs));
        SP.g.clear();
        SP.g.fillStyle(GOLD, 0.08 + 0.22 * st); SP.g.fillCircle(SP.x, SP.y, SP.r);
        SP.g.lineStyle(2, GOLD, 0.9); SP.g.strokeCircle(SP.x, SP.y, SP.r);
        if (time >= SP.lockAt) {
          try { SP.g.destroy(); } catch (e) {}
          var flash = scene.add.circle(SP.x, SP.y, SP.r, 0xfff0a8, 0.7).setDepth(9);
          scene.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: function () { try { flash.destroy(); } catch (e) {} } });
          scene.cameras.main.shake(160, 0.008);
          try { AUDIO.play('lightcrash'); } catch (e) {}
          if (alive && Math.hypot(p.x - SP.x, p.y - SP.y) < SP.r)
            Entities.hurtPlayer(scene, p, SP.dmg, time, 'the falling stage light', true);
          C.spot = null;
        }
      }

      // ---- GRAND FINALE firework sequence → the BOW (vented ×1.5) ----
      if (C.finale) {
        var F = C.finale, allDone = true;
        for (var fi = 0; fi < F.seq.length; fi++) {
          var FW = F.seq[fi];
          if (FW.fired) continue;
          allDone = false;
          if (time < FW.at) continue;
          FW.fired = true;
          try { FW.g.destroy(); } catch (e) {}
          scene.burst(FW.x, FW.y, 16, [0xffd23f, 0x3fc8b4, 0xe86a9a, 0xc898e8][fi % 4]);
          scene.cameras.main.shake(100, 0.005);
          try { AUDIO.play('fireworkburst'); } catch (e) {}
          if (alive && Math.hypot(p.x - FW.x, p.y - FW.y) < F.radius)
            Entities.hurtPlayer(scene, p, F.dmg, time, 'the grand finale', true);
        }
        if (allDone) {
          C.finale = null;
          var b = scene.boss;
          if (b && b.active) {
            b.boss.ventedUntil = time + F.ventMs;
            b.boss.ventDmgMult = F.ventDmgMult;
            b.boss.rootUntil = time + F.ventMs;
            b.setTint(0xc0b8b8);
            (function (b2) {
              scene.time.delayedCall(F.ventMs, function () { if (b2.active) b2.clearTint(); });
            })(b);
            scene.banner('HE BOWS — WINDED\nthe show pauses: UNLOAD', '#fff0a8');
            scene.burst(b.x, b.y, 24, 0xfff0a8);
          }
        }
      }

      // ---- STEP RIGHT UP safe rings — everything outside gets raked ----
      if (C.game) {
        var G = C.game;
        G.rings.forEach(function (rg2) {
          rg2.g.setAlpha(0.55 + 0.4 * Math.sin(time / 110));
        });
        if (time >= G.until) {
          var safe = !alive;
          for (var gi = 0; gi < G.rings.length; gi++) {
            if (Math.hypot(p.x - G.rings[gi].x, p.y - G.rings[gi].y) < G.r) { safe = true; break; }
          }
          var rake = scene.add.graphics().setDepth(9);
          rake.fillStyle(0xb03440, 0.28);
          rake.fillEllipse(C.arena.x, C.arena.y, C.arena.r * 2.2, C.arena.r * 1.9);
          G.rings.forEach(function (rg3) { rake.fillStyle(0x000000, 0); try { rg3.g.destroy(); } catch (e) {} });
          scene.tweens.add({ targets: rake, alpha: 0, duration: 320, onComplete: function () { try { rake.destroy(); } catch (e) {} } });
          scene.cameras.main.shake(140, 0.007);
          try { AUDIO.play('boothbite'); } catch (e) {}
          if (!safe) Entities.hurtPlayer(scene, p, G.dmg, time, 'the forced game', true);
          C.game = null;
        }
      }

      // item 10: the Big Top SEALS for the boss fight — the striped canvas wall
      // has a south flap you entered through; clamp the player inside the tent
      // ellipse every frame while the boss lives so the flap can't be used to
      // walk out mid-fight (mirrors colosseum._bound, elliptical).
      if (scene.boss && scene.boss.active) CAR._bound(scene);
      CAR._wrap(scene);
      CAR._runZones(scene, time);
      CAR._runLanes(scene, time);
    },

    // item 10: elliptical arena lock for the Big Top boss fight.
    _bound: function (scene) {
      var p = scene.player; if (!p || !p.body) return;
      var C = scene._car; if (!C) return;
      var cx = C.arena.x, cy = C.arena.y;
      var erx = TENT.rx * scene.worldW - 16, ery = TENT.ry * scene.worldH - 16;
      var dx = p.x - cx, dy = p.y - cy, nd = Math.hypot(dx / erx, dy / ery);
      if (nd <= 1) return;
      var f = 1 / nd, nx = cx + dx * f, ny = cy + dy * f;
      var ox = dx / (erx * erx), oy = dy / (ery * ery), on = Math.hypot(ox, oy) || 1; ox /= on; oy /= on;
      if (p.body.enable && p.body.reset) {
        var vx = p.body.velocity.x, vy = p.body.velocity.y, vn = vx * ox + vy * oy;
        if (vn > 0) { vx -= vn * ox; vy -= vn * oy; }
        p.body.reset(nx, ny); p.body.velocity.x = vx; p.body.velocity.y = vy;
      } else { p.x = nx; p.y = ny; }
    },

    _failRound: function (scene, C, cfg, time) {
      var B = C.booth, bb = C.booths[B.idx];
      B.targets.forEach(function (T) { try { T.g.destroy(); } catch (e) {} });
      B.targets = [];
      bb.glow.setVisible(false);
      CAR._zone(scene, bb.mouthX, bb.mouthY, cfg.biteRadius, cfg.biteWarnMs, cfg.biteDmg,
        'the booth bites back', false, true, time);
      try { AUDIO.play('boothbite'); } catch (e) {}
      scene.banner('THE BOOTH BITES BACK\nyou walked away from the game', '#d86470');
      B.state = 'idle'; B.nextAt = time + cfg.cycleMs;
    },
    _cancelBooth: function (scene, C) {
      var B = C.booth;
      B.targets.forEach(function (T) { try { T.g.destroy(); } catch (e) {} });
      B.targets = [];
      if (B.idx >= 0) C.booths[B.idx].glow.setVisible(false);
      B.state = 'idle'; B.nextAt = Infinity;
    },
    _clearSpot: function (C) { if (C.spot) { try { C.spot.g.destroy(); } catch (e) {} C.spot = null; } },
    _clearFinale: function (C) {
      if (C.finale) { C.finale.seq.forEach(function (F) { if (!F.fired) { try { F.g.destroy(); } catch (e) {} } }); C.finale = null; }
    },
    _clearGame: function (C) {
      if (C.game) { C.game.rings.forEach(function (rg) { try { rg.g.destroy(); } catch (e) {} }); C.game = null; }
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._car; if (!C) return;
      var B = C.booth;
      ['nextAt', 'litUntil', 'roundEndsAt'].forEach(function (k) { if (B[k] && B[k] !== Infinity) B[k] += dt; });
      C.patches.forEach(function (P) { P.dieAt += dt; });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      if (C.ccSlowUntil) C.ccSlowUntil += dt;
      if (C.spot) C.spot.lockAt += dt;
      if (C.finale) C.finale.seq.forEach(function (F) { if (!F.fired) F.at += dt; });
      if (C.game) C.game.until += dt;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        // M7k AUDIT fix: lungeUntil removed — core shifts it for every mob
        // already; the double shift made clowns dash the whole pause length
        ['nextHonkAt', 'honkAt', 'popAt', 'nextSweepAt', 'sweepLockUntil',
         'wakeAt', 'springUntil', 'nextLobAt', 'nextSlamAt', 'nextDripAt', 'nextVolleyAt',
         'volleyLockUntil', 'nextHoleAt', 'eruptAt', 'nextClashAt', 'clashAt',
         'nextRollAt', 'laneLockUntil', 'rollUntil', 'nextBeamAt'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
        if (m.mob.pound && m.mob.pound.until) m.mob.pound.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextSpotAt', 'nextFinaleAt', 'busyUntil',
         'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._car; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } });
      C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      C.lanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} });
      C.rings = [];
      C.patches.forEach(function (P) { try { P.obj.destroy(); } catch (e) {} });
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} });
      C.mobWarns = [];
      // M7k AUDIT fix: annihilation is final — wiped blobs never split, and
      // stale child marks must not shrink the next fresh blob spawn
      C.blobs = [];
      C.blobChildMarks = 0;
    },

    // ================================================== BOSS ARRIVAL =======
    // The spotlight snaps on EMPTY → the calliope swells → THE RINGMASTER
    // swings down out of the tent dark on a trapeze, dismounts, BOWS, and
    // cracks the whip. Title card, THEN r.scanning.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._car, self = scene;
      var ax = C.arena.x, ay = C.arena.y;
      CAR._cancelBooth(scene, C);                              // the games are over
      scene.player.setPosition(ax, ay + C.arena.r - 26);
      scene.cameras.main.centerOn(ax, ay);
      // the spotlight snaps on — EMPTY
      var pool = scene.add.circle(ax, ay, 70, GOLD, 0.22).setStrokeStyle(3, GOLD, 0.9).setDepth(1.5);
      scene.tweens.add({ targets: pool, alpha: { from: 0.2, to: 0.9 }, duration: 320, yoyo: true, repeat: 3 });
      try { AUDIO.play('calliopeswell'); } catch (e) {}
      scene.banner('THE SPOTLIGHT SNAPS ON — EMPTY\nthe calliope swells', '#ffd23f');
      // the trapeze swings down out of the dark
      var rig = scene.add.sprite(ax, ay - 360, 'cvTrapeze').setScale(2.2).setDepth(8).setAlpha(0);
      C.trapeze = rig;
      scene.tweens.add({ targets: rig, y: ay - 90, alpha: 1, angle: { from: -16, to: 12 }, duration: def.entranceMs * 0.5, ease: 'Sine.InOut' });
      scene.time.delayedCall(def.entranceMs * 0.25, function () { try { AUDIO.play('trapezecreak'); } catch (e) {} });
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, ax, ay);
        if (self.boss) {
          var b = self.boss;
          b.setPosition(ax, ay - 300);
          b.setAlpha(0.95);
          self.tweens.add({ targets: b, y: ay, alpha: 1, duration: 420, ease: 'Quad.In',
            onComplete: function () {
              if (!b.active) return;
              // dismount with a flourish — the BOW — whip CRACK
              self.burst(ax, ay + 20, 14, GOLD);
              self.tweens.add({ targets: b, scaleY: b.scaleY * 0.88, duration: 200, yoyo: true });
              self.cameras.main.shake(240, 0.01);
              try { AUDIO.play('whipcrack'); } catch (e) {}
              self.tweens.add({ targets: rig, y: ay - 380, alpha: 0, duration: 600, delay: 200,
                onComplete: function () { try { rig.destroy(); } catch (e) {} } });
            } });
        }
        C.bossArmed = true;
        try { pool.destroy(); } catch (e) {}
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._car;
      if (!bs._cvInit) {
        bs._cvInit = true;
        bs.verbIdx = 0;
        bs.nextVerbAt = time + 2600;
        bs.nextSpotAt = time + PT.spotlight.everyMs * 0.5;
        bs.nextFinaleAt = time + PT.grandFinale.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE CALLIOPE SPEEDS UP\nevery cycle tightens — the show must go on', '#d86470');
      }
      var rate = bs.rateMult || 1;
      if (time < bs.rootUntil || C.finale) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 130) b.setVelocity(dx / d * spd, dy / d * spd);
        else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextFinaleAt) {
        bs.nextFinaleAt = time + PT.grandFinale.everyMs * rate;
        CAR._finaleBegin(scene, b, time);
      } else if (time >= bs.nextSpotAt && !C.spot) {
        bs.nextSpotAt = time + PT.spotlight.everyMs * rate;
        CAR._spotBegin(scene, b, player, time);
      } else if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        var v = ['whip', 'curtain', 'clowns', 'game'][bs.verbIdx % 4];
        bs.verbIdx++;
        if (v === 'whip') CAR._whipCrack(scene, b, player, time);
        else if (v === 'curtain') CAR._knifeCurtain(scene, b, time);
        else if (v === 'clowns') CAR._sendClowns(scene, b, time);
        else CAR._stepRightUp(scene, b, player, time);
      }
    },

    // WHIP CRACK — locked cone flash → crack (damage + knockback).
    _whipCrack: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.whipCrack;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(GOLD, 0.15); g.lineStyle(2, 0xfff0a8, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;          // M7k AUDIT fix: dead-caster guard
        var fg = self.add.graphics().setDepth(9);
        fg.fillStyle(0xfff0a8, 0.5);
        fg.slice(bx, by, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(120, 0.006);
        try { AUDIO.play('whipcrack'); } catch (e) {}
        var p = self.player;
        if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by);
        var pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "the Ringmaster's whip", true);
          p.body.velocity.x += Math.cos(ang) * cfg.kb;
          p.body.velocity.y += Math.sin(ang) * cfg.kb;
        }
      });
    },
    // SPOTLIGHT LOCK — a second spotlight chases; when it fills, a stage
    // light crashes down on it. Never during the entrance (armed only).
    _spotBegin: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.spotlight, C = scene._car;
      var g = scene.add.graphics().setDepth(1.6);
      C.spot = { x: b.x, y: b.y, r: cfg.radius, speed: cfg.speed,
                 lockAt: time + cfg.chaseMs, chaseMs: cfg.chaseMs, dmg: cfg.dmg, g: g };
      try { AUDIO.play('spotlighthum'); } catch (e) {}
      scene.banner('THE SPOTLIGHT HUNTS\ndon\'t let it fill on you', '#fff0a8');
    },
    // SEND IN THE CLOWNS — adds swing in (queueSpawn, capped).
    _sendClowns: function (scene, b, time) {
      var cfg = b.boss.def.patterns.clowns;
      var aliveM = 0;
      scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      if (aliveM >= cfg.cap) return;
      for (var i = 0; i < cfg.count; i++) {
        var a = Math.PI * 2 * i / cfg.count + SIM.rng();
        scene.queueSpawn({ key: 'creepyClown', bossWave: true,
          x: b.x + Math.cos(a) * 180, y: b.y + Math.sin(a) * 150 });
      }
      scene.queueSpawn({ key: 'knifeJuggler', bossWave: true,
        x: b.x + (SIM.rng() * 2 - 1) * 160, y: b.y - 140 });
      scene.banner('SEND IN THE CLOWNS\nthe cast swings in', '#c898e8');
      try { AUDIO.play('clownhonk'); } catch (e) {}
      b.boss.busyUntil = time + 600;
    },
    // KNIFE CURTAIN — warned lanes march across the ring in sequence.
    _knifeCurtain: function (scene, b, time) {
      var cfg = b.boss.def.patterns.knifeCurtain, C = scene._car;
      var A = C.arena;
      for (var i = 0; i < cfg.lanes; i++) {
        var lx = A.x + (i - (cfg.lanes - 1) / 2) * (A.r * 1.5 / (cfg.lanes - 1));
        CAR._lane(scene, { x0: lx, y0: A.y - A.r, x1: lx, y1: A.y + A.r },
          cfg.half, cfg.warnMs + i * cfg.laneGapMs, cfg.dmg, 'the knife curtain', true, time, 0x9aa2b0, b.boss.def);
      }
      try { AUDIO.play('knifewhish'); } catch (e) {}
      scene.banner('KNIFE CURTAIN\nthe blades march in sequence', '#9aa2b0');
      b.boss.busyUntil = time + cfg.warnMs + cfg.lanes * cfg.laneGapMs + 300;
      b.boss.rootUntil = b.boss.busyUntil;
    },
    // STEP RIGHT UP — safe RINGS on the mat; everything outside gets raked.
    // Booth tech weaponized: rings ALWAYS reachable, never all on the wall.
    _stepRightUp: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.stepRightUp, C = scene._car;
      var A = C.arena;
      var rings = [];
      // ring 0: within easy reach of the player, clamped into the arena
      var r0x = player.x + (SIM.rng() * 2 - 1) * 90, r0y = player.y + (SIM.rng() * 2 - 1) * 90;
      var dd = Math.hypot(r0x - A.x, r0y - A.y);
      if (dd > A.r * 0.72) { r0x = A.x + (r0x - A.x) / dd * A.r * 0.72; r0y = A.y + (r0y - A.y) / dd * A.r * 0.72; }
      rings.push({ x: r0x, y: r0y });
      // ring 1: elsewhere in the ring (never on the tent wall)
      var a1 = SIM.rng() * Math.PI * 2;
      rings.push({ x: A.x + Math.cos(a1) * A.r * 0.5, y: A.y + Math.sin(a1) * A.r * 0.45 });
      rings.forEach(function (rg) {
        rg.g = scene.add.circle(rg.x, rg.y, cfg.ringR, TEAL, 0.16).setStrokeStyle(3, 0xa8f0e4, 0.9).setDepth(1.6);
      });
      C.game = { rings: rings, r: cfg.ringR, until: time + cfg.durMs, dmg: cfg.dmg };
      try { AUDIO.play('boothsting'); } catch (e) {}
      scene.banner('STEP RIGHT UP\nstand in the light or be raked', '#a8f0e4');
      b.boss.busyUntil = time + cfg.durMs + 400;
      b.boss.rootUntil = b.boss.busyUntil;
    },
    // THE GRAND FINALE — fireworks rain in sequence... then he BOWS (vented).
    _finaleBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.grandFinale, C = scene._car;
      if (C.finale) return;
      var A = C.arena, seq = [];
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * A.r * 0.8;
        var fx = A.x + Math.cos(a) * rr, fy = A.y + Math.sin(a) * rr * 0.85;
        var g = scene.add.circle(fx, fy, cfg.radius, GOLD, 0.13).setStrokeStyle(2, 0xfff0a8, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs + i * cfg.gapMs });
        seq.push({ x: fx, y: fy, at: time + cfg.warnMs + i * cfg.gapMs, fired: false, g: g });
      }
      C.finale = { seq: seq, radius: cfg.radius, dmg: cfg.dmg, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 500;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('THE GRAND FINALE\nfireworks rain — then he bows', '#ffd23f');
      try { AUDIO.play('calliopeswell'); } catch (e) {}
    },

    // =============================================== MOB VERBS (map-new) ===
    // CREEPY CLOWN — shuffling pack chaser; HONK telegraph → lunge.
    _clown: function (scene, m, player, time) {
      var cfg = m.mob.def.honk;
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); }
        return true;                                          // the dash carries
      }
      if (m.mob.honkAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xfff0a8 : 0xffffff);
        if (time >= m.mob.honkAt) {
          m.mob.honkAt = 0;
          m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
        }
        return true;
      }
      if (!m.mob.nextHonkAt) m.mob.nextHonkAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHonkAt && d < cfg.range && player.state.alive) {
        m.mob.nextHonkAt = time + cfg.everyMs;
        m.mob.honkAt = time + cfg.warnMs;
        try { AUDIO.play('clownhonk'); } catch (e) {}
        return true;
      }
      return false;                                           // core chase shuffles the pack
    },
    // BALLOON WISP — drifts in; telegraphed POP burst; shootable early.
    _wisp: function (scene, m, player, time) {
      var cfg = m.mob.def.pop, C = scene._car;
      if (m.mob.popAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xd86470 : 0xffffff);
        if (time >= m.mob.popAt) {
          scene.burst(m.x, m.y, 14, 0xd86470);
          try { AUDIO.play('balloonpop'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.radius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Balloon Wisp's pop");
          scene.killMobCredited(m);
        }
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.triggerRange && player.state.alive) {
        m.mob.popAt = time + cfg.warnMs;
        var g = scene.add.circle(m.x, m.y, cfg.radius, 0xd86470, 0.12)
          .setStrokeStyle(2, 0xd86470, 0.85).setDepth(2);
        C.mobWarns.push({ m: m, g: g });
        return true;
      }
      return false;                                           // core chase drifts her in
    },
    // CARNY BARKER — warned cane-sweep cone that PUSHES you (CC-capped).
    _barker: function (scene, m, player, time) {
      var cfg = m.mob.def.sweep, C = scene._car;
      if (m.mob.sweepLockUntil && time < m.mob.sweepLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextSweepAt) m.mob.nextSweepAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSweepAt && d < cfg.range && player.state.alive) {
        m.mob.nextSweepAt = time + cfg.everyMs;
        m.mob.sweepLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(TEAL, 0.13); g.lineStyle(2, 0xa8f0e4, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!player.state.alive || !m.active) return;       // M7k AUDIT fix: dead-caster guard
          try { AUDIO.play('knifewhish'); } catch (e) {}
          var pd = Math.hypot(player.x - mx, player.y - my);
          var pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Carny Barker's cane sweep");
            // CC cap: the push is HALVED while the cymbal slow holds you
            var mult = C.ccSlowUntil > self.time.now ? 0.5 : 1;
            player.body.velocity.x += Math.cos(ang) * cfg.push * mult;
            player.body.velocity.y += Math.sin(ang) * cfg.push * mult;
            self.damageNumber(player.x, player.y - 24, 'HERDED', '#a8f0e4');
          }
        });
        return true;
      }
      return false;
    },
    // POSSESSED TEDDY — plays dead as a dropped prize; SHIMMER warn (on the
    // mob only — the prize-wall teddies never shimmer) → springs.
    _teddy: function (scene, m, player, time) {
      var cfg = m.mob.def.ambush;
      if (!m.mob.awake) {
        m.setVelocity(0, 0);
        var d = Math.hypot(player.x - m.x, player.y - m.y);
        if (!m.mob.wakeAt) {
          if (d < cfg.wakeRange && player.state.alive) m.mob.wakeAt = time + cfg.warnMs;
          return true;
        }
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xc898e8 : 0xffffff);   // the shimmer tell
        if (time >= m.mob.wakeAt) {
          m.mob.awake = true;
          m.clearTint();
          scene.burst(m.x, m.y, 10, 0xc898e8);
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.springUntil = time + cfg.springMs;
          m.setVelocity(Math.cos(a) * cfg.springSpeed, Math.sin(a) * cfg.springSpeed);
        }
        return true;
      }
      if (m.mob.springUntil && time < m.mob.springUntil) return true;        // the spring carries
      return false;                                           // core chase + contact
    },
    // POPCORN POLTERGEIST — arcs hot kernels onto warned circles (mortar).
    _poltergeist: function (scene, m, player, time) {
      var cfg = m.mob.def.mortar;
      if (!m.mob.nextLobAt) m.mob.nextLobAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLobAt && d < cfg.range && player.state.alive) {
        m.mob.nextLobAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
          var a = SIM.rng() * Math.PI * 2;
          CAR._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.radius, cfg.warnMs, cfg.dmg, 'hot kernels', false, false, time);
        }
        scene.burst(m.x, m.y - 18, 8, GOLD);
        try { AUDIO.play('targetpop'); } catch (e) {}
        return true;
      }
      return false;
    },
    // STRONGMAN SHADE — barbell overhead slam: big warned circle + a
    // shockwave ring that expands from the crater.
    _shade: function (scene, m, player, time) {
      var cfg = m.mob.def.slam, C = scene._car;
      if (m.mob.pound) {
        m.setVelocity(0, 0);
        if (time >= m.mob.pound.until) {
          m.mob.pound = null;
          var g = scene.add.graphics().setDepth(2);
          C.rings.push({ x: m.x, y: m.y, r: cfg.radius * 0.5, r0: cfg.radius * 0.5, maxR: cfg.shockR,
            start: time, until: time + cfg.shockMs, dmg: cfg.shockDmg,
            src: "a Strongman Shade's shockwave", fromBoss: false, hit: false, g: g, tint: TEAL });
        }
        return true;
      }
      if (!m.mob.nextSlamAt) m.mob.nextSlamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSlamAt && d < cfg.range) {
        m.mob.nextSlamAt = time + cfg.everyMs;
        m.mob.pound = { until: time + cfg.warnMs };
        CAR._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Strongman Shade's slam", false, false, time);
        try { AUDIO.play('crash'); } catch (e) {}
        return true;
      }
      return false;
    },
    // COTTON CANDY BLOB — sticky slow patches; splits ONCE on death.
    _blob: function (scene, m, player, time) {
      var cfg = m.mob.def.drip, C = scene._car;
      if (!m.mob._blobReg) {
        // M7k AUDIT fix: carry the mob ref — the watcher checks identity
        m.mob._blobReg = { m: m, mob: m.mob, x: m.x, y: m.y, done: false, child: false };
        C.blobs.push(m.mob._blobReg);
        if (C.blobChildMarks > 0) {                           // a split child — smaller, never splits
          C.blobChildMarks--;
          m.mob._blobReg.child = true;
          m.setScale(m.scaleX * 0.72, m.scaleY * 0.72);
        }
      }
      m.mob._blobReg.x = m.x; m.mob._blobReg.y = m.y;
      if (!m.mob.nextDripAt) m.mob.nextDripAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextDripAt) {
        m.mob.nextDripAt = time + cfg.everyMs;
        if (C.patches.length < 20) {
          var obj = scene.add.circle(m.x, m.y, cfg.radius, PINKT, 0.24).setDepth(1.2);
          C.patches.push({ x: m.x, y: m.y, r: cfg.radius, dieAt: time + cfg.lifeMs, obj: obj });
        }
      }
      return false;                                           // core chase oozes her along
    },
    // KNIFE JUGGLER — telegraphed 3-knife arc volley (aimed lanes).
    _juggler: function (scene, m, player, time) {
      var cfg = m.mob.def.volley;
      if (m.mob.volleyLockUntil && time < m.mob.volleyLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextVolleyAt) m.mob.nextVolleyAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextVolleyAt && d < cfg.range && player.state.alive) {
        m.mob.nextVolleyAt = time + cfg.everyMs;
        m.mob.volleyLockUntil = time + cfg.warnMs + 2 * cfg.gapMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x);
        for (var i = 0; i < 3; i++) {
          var a = base + (i - 1) * cfg.spreadRad;
          CAR._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len },
            cfg.half, cfg.warnMs + i * cfg.gapMs, cfg.dmg, "a Knife Juggler's blade", false, time, 0x9aa2b0, m.mob.def);
        }
        try { AUDIO.play('knifewhish'); } catch (e) {}
        return true;
      }
      return false;
    },
    // WHACK-A-MOLE — tunnels between warned holes, erupts under you.
    _mole: function (scene, m, player, time) {
      var cfg = m.mob.def.erupt, C = scene._car;
      if (m.mob.moleState === 'buried') {
        m.setVelocity(0, 0);
        if (time >= m.mob.eruptAt) {
          m.mob.moleState = 'up';
          if (m.mob._holeWarn) { m.mob._holeWarn.dead = true; m.mob._holeWarn = null; }
          m.body.reset(m.mob._holeX, m.mob._holeY);
          m.setVisible(true); m.body.enable = true;
          scene.burst(m.x, m.y, 12, 0x7e6a56);
          try { AUDIO.play('crash'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.radius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, 'a Whack-a-Mole eruption');
        }
        return true;
      }
      if (!m.mob.nextHoleAt) m.mob.nextHoleAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHoleAt && d < cfg.range && player.state.alive) {
        m.mob.nextHoleAt = time + cfg.everyMs;
        m.mob.moleState = 'buried';
        m.mob.eruptAt = time + cfg.warnMs;
        m.mob._holeX = player.x + (SIM.rng() * 2 - 1) * 44;
        m.mob._holeY = player.y + (SIM.rng() * 2 - 1) * 44;
        m.setVisible(false); m.body.enable = false;
        var g = scene.add.circle(m.mob._holeX, m.mob._holeY, cfg.radius, 0x7e6a56, 0.15)
          .setStrokeStyle(2, 0xd8bc9a, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        m.mob._holeWarn = { m: m, g: g };
        C.mobWarns.push(m.mob._holeWarn);
        return true;
      }
      return false;
    },
    // CYMBAL MONKEY — telegraphed CLASH ring; brief slow if caught (CC-capped).
    _monkey: function (scene, m, player, time) {
      var cfg = m.mob.def.clash, C = scene._car;
      if (m.mob.clashAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.clashAt) {
          m.mob.clashAt = 0;
          if (m.mob._clashWarn) { m.mob._clashWarn.dead = true; m.mob._clashWarn = null; }
          var fg = scene.add.circle(m.x, m.y, cfg.radius, GOLD, 0.3).setDepth(9);
          scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          try { AUDIO.play('cymbalclash'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.radius) {
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Cymbal Monkey's clash");
            // CC cap: combined slow NEVER holds past +1600ms (siren+swell rule)
            C.ccSlowUntil = Math.min(Math.max(C.ccSlowUntil, time + cfg.slowMs), time + 1600);
            scene.damageNumber(player.x, player.y - 24, 'CLANG', '#ffd23f');
          }
        }
        return true;
      }
      if (!m.mob.nextClashAt) m.mob.nextClashAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextClashAt && d < cfg.range && player.state.alive) {
        m.mob.nextClashAt = time + cfg.everyMs;
        m.mob.clashAt = time + cfg.warnMs;
        var g = scene.add.circle(m.x, m.y, cfg.radius, GOLD, 0.12)
          .setStrokeStyle(2, 0xfff0a8, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        m.mob._clashWarn = { m: m, g: g };
        C.mobWarns.push(m.mob._clashWarn);
        return true;
      }
      return false;
    },
    // FERRIS PHANTOM — elite; rolls a slow warned lane (wrap-aware warn) +
    // spoke-beam flicks.
    _phantom: function (scene, m, player, time) {
      var cfg = m.mob.def.roll;
      if (m.mob.rollUntil) {
        if (time >= m.mob.rollUntil) { m.mob.rollUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._rollAng) * cfg.speed, Math.sin(m.mob._rollAng) * cfg.speed);
        return true;
      }
      if (m.mob.laneLockUntil) {
        if (time >= m.mob.laneLockUntil) {
          m.mob.laneLockUntil = 0;
          (m.mob._rollG || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
          m.mob._rollG = null;
          m.mob.rollUntil = time + cfg.rollMs;
          m.setVelocity(Math.cos(m.mob._rollAng) * cfg.speed, Math.sin(m.mob._rollAng) * cfg.speed);
          try { AUDIO.play('trapezecreak'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      // spoke-beam flicks on their own clock (while roaming)
      if (!m.mob.nextBeamAt) m.mob.nextBeamAt = time + cfg.beamEveryMs * (0.5 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextBeamAt && d < cfg.beamRange && player.state.alive) {
        m.mob.nextBeamAt = time + cfg.beamEveryMs;
        var base2 = Math.atan2(player.y - m.y, player.x - m.x);
        for (var i = 0; i < 2; i++) {
          var a2 = base2 + (i - 0.5) * 1.1;
          CAR._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(a2) * cfg.beamLen, y1: m.y + Math.sin(a2) * cfg.beamLen },
            cfg.beamHalf, cfg.beamWarnMs, cfg.beamDmg, "a Ferris Phantom's spoke beam", false, time, TEAL, m.mob.def);
        }
      }
      if (!m.mob.nextRollAt) m.mob.nextRollAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextRollAt && d < cfg.range && player.state.alive) {
        m.mob.nextRollAt = time + cfg.everyMs;
        m.mob.laneLockUntil = time + cfg.warnMs;
        m.mob._rollAng = Math.atan2(player.y - m.y, player.x - m.x);
        // wrap-aware warn: the lane renders on BOTH sides of the seam
        var WW = scene.worldW, HH = scene.worldH;
        var x1 = m.x + Math.cos(m.mob._rollAng) * cfg.len, y1 = m.y + Math.sin(m.mob._rollAng) * cfg.len;
        var gs = [CAR._rollWarn(scene, m.x, m.y, x1, y1, cfg.half)];
        if (x1 < 0 || x1 >= WW) {
          var sx = x1 < 0 ? WW : -WW;
          gs.push(CAR._rollWarn(scene, m.x + sx, m.y, x1 + sx, y1, cfg.half));
        }
        if (y1 < 0 || y1 >= HH) {
          var sy = y1 < 0 ? HH : -HH;
          gs.push(CAR._rollWarn(scene, m.x, m.y + sy, x1, y1 + sy, cfg.half));
        }
        m.mob._rollG = gs;
        return true;
      }
      return false;
    },
    _rollWarn: function (scene, x0, y0, x1, y1, half) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, TEAL, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, 0xa8f0e4, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
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
        if (o.body && o.body.enable && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    },

    // warn tints must POP on both red + cream checker squares: env warns are
    // TEAL, boss warns are GOLD.
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time) {
      var C = scene._car;
      var tint = fromBoss ? GOLD : TEAL;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._car;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? GOLD : TEAL);
        scene.cameras.main.shake(90, 0.004);
        try { AUDIO.play('crash'); } catch (e) {}
        // env kills FIRST (XP before any heal), the player LAST
        if (z.killMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m);
          });
        }
        if (scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
      }
    },
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint, exclDef) {
      var C = scene._car;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      C.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src,
                     fromBoss: !!fromBoss, g: g, tint: tint, excl: exclDef });
    },
    _runLanes: function (scene, time) {
      var C = scene._car;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(110, 0.005);
        try { AUDIO.play('knifewhish'); } catch (e) {}
        // mobs die FIRST (kill credit + XP before any heal), the player LAST
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.def !== l.excl &&
              dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CAR;
  root.CARNIVAL_SCENE = CAR;
})(typeof window !== 'undefined' ? window : this);
