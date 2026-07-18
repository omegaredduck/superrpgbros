// ============================================================================
// game/js/maps/lunar/scene.js — LUNAR STATION scene hooks (M7 registry).
// The scene-plan PNG (assets/lunar_scene_plan.png) is canon: LANDING PAD
// (spawn, S) → grate corridors w/ airlocks → THE HUB (center) → THE LABS (N) /
// HIVE WING (E) / SOLAR FIELD (W) / CRATER BELT (S + corners, jump pads
// across) → REACTOR ARENA (NE, boss). LOW GRAVITY is the signature system:
// knockback drifts ~2× farther and hangs (player glide + mob drift), JUMP
// PADS arc you across the craters (airborne = contact-immune, zones still
// land), dust puffs sell the gravity. SPECIMEN ZERO · THE OVERMIND is a
// psychic zone-caster — ground overlays only, LIGHTS-OUT entrance.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var FLOORS = [
    { x0: 0.3,  y0: 0.14, x1: 0.56, y1: 0.34, tex: 'lnlab' },    // THE LABS
    { x0: 0.36, y0: 0.42, x1: 0.64, y1: 0.66, tex: 'lnhull' },   // THE HUB
    { x0: 0.66, y0: 0.4,  x1: 0.9,  y1: 0.6,  tex: 'lnhive' },   // HIVE WING
    { x0: 0.47, y0: 0.34, x1: 0.53, y1: 0.42, tex: 'lngrate' },  // corridors
    { x0: 0.64, y0: 0.48, x1: 0.66, y1: 0.54, tex: 'lngrate' },
    { x0: 0.47, y0: 0.66, x1: 0.53, y1: 0.78, tex: 'lngrate' },
    { x0: 0.56, y0: 0.2,  x1: 0.68, y1: 0.26, tex: 'lngrate' }
  ];
  var ARENA = { x: 0.72, y: 0.16, r: 0.117 };                    // reactor (boss)
  var PADCIRCLE = { x: 0.5, y: 0.86, r: 0.078 };                 // landing pad
  var DECOR = [
    // LANDING PAD (spawn)
    ['lnLander', 0.5, 0.85, 2.0], ['lnRover', 0.43, 0.9, 1.4], ['lnFlag', 0.57, 0.9, 1.3],
    ['lnBeacon', 0.44, 0.82, 1.3],
    // corridor spine beacons
    ['lnBeacon', 0.5, 0.72, 1.2], ['lnBeacon', 0.5, 0.37, 1.2],
    // THE HUB
    ['lnConsole', 0.44, 0.5, 1.5], ['lnHolo', 0.52, 0.55, 1.5],
    ['lnCargo', 0.58, 0.48, 1.4], ['lnO2', 0.4, 0.6, 1.3],
    // THE LABS
    ['lnCryo', 0.36, 0.2, 1.7], ['lnBench', 0.46, 0.24, 1.4], ['lnBench', 0.52, 0.18, 1.4],
    ['lnHydro', 0.34, 0.28, 1.4], ['lnHydro', 0.42, 0.3, 1.4],
    // HIVE WING
    ['lnResin', 0.72, 0.44, 1.7], ['lnResin', 0.8, 0.52, 1.7],
    ['lnResin', 0.86, 0.44, 1.5], ['lnResin', 0.7, 0.56, 1.5],
    // SOLAR FIELD (panels as a grid) + comms + probe
    ['lnSolar', 0.09, 0.53, 1.4], ['lnSolar', 0.14, 0.56, 1.4], ['lnSolar', 0.09, 0.61, 1.4],
    ['lnSolar', 0.14, 0.64, 1.4], ['lnSolar', 0.19, 0.53, 1.4], ['lnSolar', 0.24, 0.56, 1.4],
    ['lnDish', 0.22, 0.64, 1.8], ['lnProbe', 0.16, 0.6, 1.5],
    // CRATER BELT + rocks
    ['lnCrater', 0.14, 0.8, 2.4], ['lnCrater', 0.34, 0.9, 1.8], ['lnCrater', 0.85, 0.78, 2.6],
    ['lnCrater', 0.9, 0.14, 2.0], ['lnCrater', 0.66, 0.88, 1.6], ['lnCrater', 0.08, 0.35, 1.8],
    ['lnRocks', 0.62, 0.78, 1.5], ['lnRocks', 0.7, 0.84, 1.4], ['lnRocks', 0.3, 0.08, 1.4],
    // REACTOR ARENA
    ['lnReactor', 0.72, 0.16, 2.2]
  ];
  var ARENA_BEACONS = [[0.64, 0.1], [0.8, 0.1], [0.64, 0.22], [0.8, 0.22]];
  var AIRLOCKS = [[0.5, 0.77], [0.5, 0.4]];
  // jump pads in PAIRS crossing the craters (launch → partner)
  var PADS = [
    [0.24, 0.76, 1], [0.32, 0.68, 0],
    [0.78, 0.72, 3], [0.84, 0.64, 2],
    [0.88, 0.26, 5], [0.82, 0.32, 4]
  ];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var LUN = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var G = null; // realmDef not set yet during create? it is: scene.realmDef — read lazily
      var P = scene._lun = {
        pads: [], padAir: null, dust: [], nextDustAt: 0,
        glide: { vx: 0, vy: 0 }, pvx: 0, pvy: 0,
        mines: [], grab: null, well: null, scream: null, purge: null,
        zones: [], lanes: [], airlocks: [],
        dark: null, eye: null, darkArmed: false,
        scutPending: 0,
        arena: { x: ARENA.x * WW, y: ARENA.y * HH, r: ARENA.r * WW },
        modules: []
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- floors: regolith base + module rects + masked circles ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'lnregolith').setDepth(-23);
      FLOORS.forEach(function (F) {
        var w = (F.x1 - F.x0) * WW, h = (F.y1 - F.y0) * HH;
        scene.add.tileSprite(F.x0 * WW + w / 2, F.y0 * HH + h / 2, w, h, F.tex).setDepth(-21);
        P.modules.push({ x0: F.x0 * WW, y0: F.y0 * HH, x1: F.x1 * WW, y1: F.y1 * HH });
      });
      // the LANDING PAD (hull circle + warning rim)
      var lx = PADCIRCLE.x * WW, ly = PADCIRCLE.y * HH, lr = PADCIRCLE.r * WW;
      var lpTile = scene.add.tileSprite(lx, ly, lr * 2 + 8, lr * 2 + 8, 'lnhull').setDepth(-21);
      var lpm = scene.make.graphics({ add: false });
      lpm.fillStyle(0xffffff, 1); lpm.fillCircle(lx, ly, lr);
      lpTile.setMask(lpm.createGeometryMask());
      var lpg = scene.add.graphics().setDepth(-20);
      lpg.lineStyle(4, 0xff9a3a, 0.8); lpg.strokeCircle(lx, ly, lr * 0.96);
      P.padCircle = { x: lx, y: ly, r: lr };
      // the REACTOR ARENA (reactor plate circle + hazard rim)
      var ax = P.arena.x, ay = P.arena.y, ar = P.arena.r;
      var arTile = scene.add.tileSprite(ax, ay, ar * 2 + 8, ar * 2 + 8, 'lnreactor').setDepth(-21);
      var arm = scene.make.graphics({ add: false });
      arm.fillStyle(0xffffff, 1); arm.fillCircle(ax, ay, ar);
      arTile.setMask(arm.createGeometryMask());
      var arg = scene.add.graphics().setDepth(-20);
      arg.lineStyle(5, 0xff9a3a, 0.85); arg.strokeCircle(ax, ay, ar * 0.97);
      arg.lineStyle(2, 0x4adcf0, 0.7); arg.strokeCircle(ax, ay, ar * 0.55);

      // ---- decor per the PLAN ----
      DECOR.forEach(function (D) {
        var spr = scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
        if (D[0] === 'lnBeacon') {
          scene.tweens.add({ targets: spr, alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
        }
      });
      P.beacons = [];
      ARENA_BEACONS.forEach(function (B) {
        var spr = scene.add.sprite(B[0] * WW, B[1] * HH, 'lnBeacon').setScale(1.3).setDepth(2);
        scene.tweens.add({ targets: spr, alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
        P.beacons.push(spr);
      });
      AIRLOCKS.forEach(function (A) {
        var spr = scene.add.sprite(A[0] * WW, A[1] * HH, 'lnAirlock').setScale(1.5).setDepth(2);
        P.airlocks.push({ x: spr.x, y: spr.y, spr: spr, openUntil: 0 });
      });
      // ---- jump pads (pairs) ----
      PADS.forEach(function (J) {
        var spr = scene.add.sprite(J[0] * WW, J[1] * HH, 'lnPad').setScale(1.5).setDepth(1.5);
        P.pads.push({ x: spr.x, y: spr.y, to: J[2], cooldownUntil: 0, spr: spr });
      });

      // ---- spawn on the landing pad ----
      scene._realmStart = { x: 0.46 * WW, y: 0.89 * HH };

      // mob-verb helpers (fresh closures)
      scene._lunBroodSac = function (m, player, time) { return LUN._broodSac(scene, m, player, time); };
      scene._lunTurret = function (m, player, time) { return LUN._turret(scene, m, player, time); };
      scene._lunRevenant = function (m, player, time) { return LUN._revenant(scene, m, player, time); };
      scene._lunLeaper = function (m, player, time) { return LUN._leaper(scene, m, player, time); };
      scene._lunMine = function (m, player, time) { return LUN._mine(scene, m, player, time); };
      scene._lunHorror = function (m, player, time) { return LUN._horror(scene, m, player, time); };
    },

    afterCreate: function (scene) {},

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var P = scene._lun; if (!P) return;
      var dt = Math.min(120, delta), G = scene.realmDef.lowGrav;
      var p = scene.player, alive = p.state.alive;

      // lights lift when the Overmind is fully down
      if (P.dark && P.darkArmed && (!scene.boss || !scene.boss.active)) {
        try { P.dark.destroy(); } catch (e) {}
        if (P.eye) { try { P.eye.destroy(); } catch (e) {} }
        P.dark = null; P.eye = null;
      }

      // ---- LOW GRAVITY: mob knockback DRIFT (hit → glide ~2× farther) ----
      var kbPx = (DATA.combat.knockback / 10) * (G.kbMult - 1);
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        if (m.mob._lgHp === undefined) { m.mob._lgHp = m.mob.hp; return; }
        if (m.mob.hp < m.mob._lgHp) {
          var dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy) || 1;
          m.mob._lgDrift = { vx: dx / d * (kbPx * 1000 / G.kbGlideMs),
                             vy: dy / d * (kbPx * 1000 / G.kbGlideMs),
                             until: time + G.kbGlideMs };
        }
        m.mob._lgHp = m.mob.hp;
        if (m.mob._lgDrift && time < m.mob._lgDrift.until && !scene.hitstopActive) {
          m.x += m.mob._lgDrift.vx * dt / 1000;
          m.y += m.mob._lgDrift.vy * dt / 1000;
        } else if (m.mob._lgDrift && time >= m.mob._lgDrift.until) m.mob._lgDrift = null;
      });

      // ---- LOW GRAVITY: player momentum GLIDE (dodges carry) ----
      if (alive && !P.padAir && !scene.hitstopActive) {
        var vx = p.body.velocity.x, vy = p.body.velocity.y;
        var was = Math.hypot(P.pvx, P.pvy), now = Math.hypot(vx, vy);
        if (was > now + 30) {                                  // sudden slow → residual glide
          P.glide.vx += (P.pvx - vx) * G.glideGain;
          P.glide.vy += (P.pvy - vy) * G.glideGain;
        }
        P.pvx = vx; P.pvy = vy;
        P.glide.vx *= G.glideDecay; P.glide.vy *= G.glideDecay;
        if (Math.abs(P.glide.vx) + Math.abs(P.glide.vy) > 4) {
          p.x += P.glide.vx * dt / 1000; p.y += P.glide.vy * dt / 1000;
        }
      }

      // ---- MAGNETRON pull (fight the drag — brutal in low-grav) ----
      if (alive && !scene.hitstopActive) {
        scene.mobs.children.iterate(function (m) {
          if (!m || !m.active || !m.mob || m.mob.def !== DATA.mobs.magnetron) return;
          var d = Math.hypot(p.x - m.x, p.y - m.y);
          var MG = m.mob.def.magnetPull;   // M7k AUDIT fix: renamed data key (core `pull` verb collision)
          if (d < MG.radius && d > 30) {
            p.x += (m.x - p.x) / d * MG.spd * dt / 1000;
            p.y += (m.y - p.y) / d * MG.spd * dt / 1000;
          }
        });
      }

      // ---- GRAVITY WELL pull + pop ----
      if (P.well) {
        var W2 = P.well;
        if (alive && !scene.hitstopActive && time < W2.until) {
          var wd = Math.hypot(p.x - W2.x, p.y - W2.y);
          if (wd < W2.r * 1.6 && wd > 12) {
            p.x += (W2.x - p.x) / wd * W2.pullSpd * dt / 1000;
            p.y += (W2.y - p.y) / wd * W2.pullSpd * dt / 1000;
          }
        }
        if (time >= W2.until) {
          try { W2.g.destroy(); } catch (e) {}
          scene.burst(W2.x, W2.y, 18, 0x8a5fd6);
          scene.cameras.main.shake(160, 0.007);
          try { AUDIO.play('crash'); } catch (e) {}
          if (alive && Math.hypot(p.x - W2.x, p.y - W2.y) < W2.r * 0.6)
            Entities.hurtPlayer(scene, p, W2.dmg, time, 'the gravity well', true);
          P.well = null;
        }
      }

      // ---- REVENANT GRAB hold (release on death/timeout; hitstop-gated) ----
      if (P.grab) {
        var GR = P.grab;
        if (!GR.m.active || !alive || time >= GR.until) P.grab = null;
        else if (!scene.hitstopActive) {
          p.setVelocity(0, 0);
          GR.m.setVelocity(0, 0);
          if (time >= GR.nextTickAt) {
            GR.nextTickAt = time + 420;
            Entities.hurtPlayer(scene, p, GR.dmg, time, 'an Astro-Revenant');
          }
        }
      }

      // ---- JUMP PAD arc (manual mover; airborne = contact-immune) ----
      if (!P.padAir && alive && !scene.scanning && !scene.closing) {
        for (var pi = 0; pi < P.pads.length; pi++) {
          var pad = P.pads[pi];
          if (time < pad.cooldownUntil) continue;
          if (Math.hypot(p.x - pad.x, p.y - pad.y) > 30) continue;
          var to = P.pads[pad.to];
          P.padAir = { x0: pad.x, y0: pad.y, x1: to.x, y1: to.y, start: time, until: time + G.padAirMs };
          pad.cooldownUntil = time + G.padCooldownMs;
          to.cooldownUntil = time + G.padCooldownMs;           // no instant bounce-back
          p.body.enable = false;                               // contact-immune (zones still land)
          try { AUDIO.play('padlaunch'); } catch (e) {}
          scene.burst(pad.x, pad.y, 8, 0x4adcf0);
          break;
        }
      }
      if (P.padAir) {
        var A = P.padAir;
        if (!alive) { p.body.enable = true; P.padAir = null; }
        else {
          var t2 = Math.max(0, Math.min(1, (time - A.start) / (A.until - A.start)));
          p.x = A.x0 + (A.x1 - A.x0) * t2;
          p.y = A.y0 + (A.y1 - A.y0) * t2 - Math.sin(t2 * Math.PI) * 46;
          if (time >= A.until) {
            p.body.enable = true;
            p.body.reset(A.x1, A.y1);
            P.padAir = null;
            LUN._dust(scene, P, A.x1, A.y1 + 8, time, 1.6);
            try { AUDIO.play('gravthump'); } catch (e) {}
          }
        }
      }

      // item 10: the reactor arena LOCKS you in for the boss fight — the
      // containment purge assumes you're inside the ring, so clamp the player to
      // it every frame while the boss lives (mirrors colosseum._bound).
      if (scene.boss && scene.boss.active && !P.padAir) LUN._bound(scene);
      LUN._wrap(scene);

      // ---- airlocks hiss open when you approach (cosmetic, graveyard-gate) --
      P.airlocks.forEach(function (AL) {
        if (time < AL.openUntil) return;
        if (alive && Math.hypot(p.x - AL.x, p.y - AL.y) < 70) {
          AL.openUntil = time + 2200;
          AL.spr.setAlpha(0.35);
          try { AUDIO.play('airlockhiss'); } catch (e) {}
          scene.time.delayedCall(1800, function () { if (AL.spr.active) AL.spr.setAlpha(1); });
        }
      });

      // ---- dust puffs (regolith only — sells the gravity) ----
      if (alive && !P.padAir && time >= P.nextDustAt &&
          Math.hypot(p.body.velocity.x, p.body.velocity.y) > 30 &&
          !LUN._onDeck(P, p.x, p.y)) {
        P.nextDustAt = time + G.dustEveryMs;
        LUN._dust(scene, P, p.x, p.y + 12, time, 1);
      }
      for (var di = P.dust.length - 1; di >= 0; di--) {
        var D2 = P.dust[di];
        var left = (D2.dieAt - time) / G.dustLifeMs;
        if (left <= 0) { try { D2.obj.destroy(); } catch (e) {} P.dust.splice(di, 1); }
        else { D2.obj.setAlpha(0.4 * left); D2.obj.y -= dt * 0.012; }
      }

      // ---- ORBITAL MINES: shot-early watcher (env-kill credit) ----
      // M7k AUDIT fix: the ledger keyed on the POOLED sprite — a recycled
      // sprite read as "my mine, still alive". The entry keeps its own m.mob
      // reference; a mismatch means the mine died and the sprite was reused.
      for (var mi = P.mines.length - 1; mi >= 0; mi--) {
        var MN = P.mines[mi];
        if (MN.m.active && MN.m.mob === MN.mob) { MN.x = MN.m.x; MN.y = MN.m.y; continue; }
        if (MN.mob && MN.mob._ring) { try { MN.mob._ring.destroy(); } catch (e) {} MN.mob._ring = null; }
        if (!MN.exploded) { MN.exploded = true; LUN._mineBlast(scene, MN.x, MN.y, MN.cfg, time); }
        P.mines.splice(mi, 1);
      }

      // ---- PSYCHIC SCREAM ring (outrun it) ----
      if (P.scream) {
        var SC = P.scream;
        var st = Math.max(0, Math.min(1, (time - SC.start) / (SC.until - SC.start)));
        SC.r = 40 + (SC.maxR - 40) * st;
        SC.g.clear();
        SC.g.lineStyle(10, 0x8a5fd6, 0.35); SC.g.strokeCircle(SC.x, SC.y, SC.r);
        SC.g.lineStyle(2, 0xc8a8ff, 0.9); SC.g.strokeCircle(SC.x, SC.y, SC.r);
        if (!SC.hit && alive) {
          var sd = Math.hypot(p.x - SC.x, p.y - SC.y);
          if (Math.abs(sd - SC.r) < 26) {
            SC.hit = true;
            Entities.hurtPlayer(scene, p, SC.dmg, time, 'the psychic scream', true);
          }
        }
        if (time >= SC.until) { try { SC.g.destroy(); } catch (e) {} P.scream = null; }
      }

      // ---- CONTAINMENT PURGE sectors (rotating safe pocket) ----
      if (P.purge) {
        var PU = P.purge, allDone = true;
        for (var si = 0; si < PU.seq.length; si++) {
          var SEC = PU.seq[si];
          if (SEC.fired) continue;
          allDone = false;
          if (time < SEC.at) continue;
          SEC.fired = true;
          try { SEC.g.destroy(); } catch (e) {}
          var fg = scene.add.graphics().setDepth(9);
          fg.fillStyle(0xff9a3a, 0.45);
          fg.slice(PU.cx, PU.cy, PU.r, SEC.a0, SEC.a1, false); fg.fillPath();
          (function (fg2) {
            scene.tweens.add({ targets: fg2, alpha: 0, duration: 300, onComplete: function () { try { fg2.destroy(); } catch (e) {} } });
          })(fg);
          scene.cameras.main.shake(120, 0.006);
          try { AUDIO.play('purgevent'); } catch (e) {}
          if (alive) {
            var pd = Math.hypot(p.x - PU.cx, p.y - PU.cy);
            var pa = Math.atan2(p.y - PU.cy, p.x - PU.cx);
            if (pa < 0) pa += Math.PI * 2;
            if (pd < PU.r && pa >= SEC.a0 && pa < SEC.a1)
              Entities.hurtPlayer(scene, p, PU.dmg, time, 'the containment purge', true);
          }
        }
        if (allDone) {
          P.purge = null;
          // the tank FRACTURES wider — VENTED
          var b = scene.boss;
          if (b && b.active) {
            b.boss.ventedUntil = time + PU.ventMs;
            b.boss.ventDmgMult = PU.ventDmgMult;
            b.boss.rootUntil = time + PU.ventMs;
            b.setTint(0x9df0e0);
            scene.time.delayedCall(PU.ventMs, function () { if (b.active) b.clearTint(); });
            scene.banner('THE TANK FRACTURES\nit reels in the leaking fluid — UNLOAD', '#9df0e0');
            scene.burst(b.x, b.y, 24, 0x4adcf0);
          }
        }
      }

      // pending telegraphed zones + beam lanes
      LUN._runZones(scene, time);
      LUN._runLanes(scene, time);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var P = scene._lun; if (!P) return;
      if (P.nextDustAt) P.nextDustAt += dt;
      P.pads.forEach(function (pad) { if (pad.cooldownUntil) pad.cooldownUntil += dt; });
      if (P.padAir) { P.padAir.start += dt; P.padAir.until += dt; }
      P.dust.forEach(function (D) { D.dieAt += dt; });
      if (P.grab) { P.grab.until += dt; P.grab.nextTickAt += dt; }
      if (P.well) P.well.until += dt;
      if (P.scream) { P.scream.start += dt; P.scream.until += dt; }
      if (P.purge) P.purge.seq.forEach(function (S) { if (!S.fired) S.at += dt; });
      P.airlocks.forEach(function (A) { if (A.openUntil) A.openUntil += dt; });
      P.zones.forEach(function (z) { z.at += dt; });
      P.lanes.forEach(function (l) { l.at += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['hatchAt', 'nextWaveAt', 'nextSweepAt', 'sweepUntil', 'nextGrabAt',
         'nextHopAt', 'blastAt', 'nextConeAt', 'coneLockUntil'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
        if (m.mob.hop) { m.mob.hop.start += dt; m.mob.hop.until += dt; }
        if (m.mob._lgDrift) m.mob._lgDrift.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextBarrageAt', 'nextLashAt', 'nextWellAt', 'nextCableAt', 'nextScreamAt',
         'nextPurgeAt', 'nextAddsAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var P = scene._lun; if (!P) return;
      P.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record with the zone
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      P.zones = [];
      P.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      P.lanes = [];
      P.dust.forEach(function (D) { try { D.obj.destroy(); } catch (e) {} });
      P.dust = [];
      if (P.scream) { try { P.scream.g.destroy(); } catch (e) {} P.scream = null; }
      if (P.well) { try { P.well.g.destroy(); } catch (e) {} P.well = null; }
      if (P.purge) { P.purge.seq.forEach(function (S) { if (S.g) { try { S.g.destroy(); } catch (e) {} } }); P.purge = null; }
      P.grab = null;
      // M7k AUDIT fix: the wiped mines' warn rings died with nobody to
      // destroy them — tear each ledger ring down before dropping the ledger
      P.mines.forEach(function (MN) {
        if (MN.mob && MN.mob._ring) { try { MN.mob._ring.destroy(); } catch (e) {} MN.mob._ring = null; }
      });
      P.mines = [];
    },

    // ================================================== BOSS ARRIVAL =======
    // LIGHTS OUT (LOCKED): the reactor arena POWERS DOWN to black; beat… the
    // violet EYE ignites in the darkness; emergency lights stutter on one by
    // one — it was already there, hovering over the core.
    bossArrival: function (scene, def, bx, by) {
      var P = scene._lun, self = scene;
      if (P.padAir) { scene.player.body.enable = true; P.padAir = null; }
      scene.player.setPosition(P.arena.x, P.arena.y + P.arena.r - 44);
      scene.cameras.main.centerOn(P.arena.x, P.arena.y);
      var W = scene.scale.width, H = scene.scale.height;
      P.dark = scene.add.rectangle(W / 2, H / 2, W, H, 0x05060c, 0).setScrollFactor(0).setDepth(40);
      scene.tweens.add({ targets: P.dark, fillAlpha: 0.92, duration: def.entranceMs * 0.22 });
      try { AUDIO.play('powerdown'); } catch (e) {}
      scene.banner('THE REACTOR POWERS DOWN\nsomething was already in here with you', '#8a5fd6');
      // the violet EYE ignites in the black
      scene.time.delayedCall(def.entranceMs * 0.35, function () {
        if (self.closing) return;
        P.eye = self.add.circle(W / 2, H / 2 - 30, 7, 0xc8a8ff, 1).setScrollFactor(0).setDepth(41);
        self.tweens.add({ targets: P.eye, scale: { from: 0.2, to: 1.6 }, duration: 500, ease: 'Sine.Out' });
        try { AUDIO.play('eyeignite'); } catch (e) {}
      });
      // emergency lights stutter on one by one
      [0.55, 0.68, 0.8].forEach(function (f, i) {
        scene.time.delayedCall(def.entranceMs * f, function () {
          if (self.closing || !P.dark) return;
          P.dark.fillAlpha = 0.92 - (i + 1) * 0.18;
          self.cameras.main.flash(90, 40, 30, 60);
          try { AUDIO.play('minebeep'); } catch (e) {}
        });
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive) return;
        self.cameras.main.flash(220, 138, 95, 214);
        self.spawnBossNow(def, P.arena.x, P.arena.y);
        P.darkArmed = true;
        if (P.dark) self.tweens.add({ targets: P.dark, fillAlpha: 0.16, duration: 700 });
        if (P.eye) { try { P.eye.destroy(); } catch (e) {} P.eye = null; }
        if (self.boss) {
          self.boss.setAlpha(0);
          self.tweens.add({ targets: self.boss, alpha: 1, duration: 500 });
        }
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, P = scene._lun;
      if (!bs._lunInit) {
        bs._lunInit = true;
        bs.nextBarrageAt = time + 3500; bs.nextLashAt = time + 6500;
        bs.nextWellAt = time + 9500; bs.nextCableAt = time + 12500;
        bs.nextScreamAt = time + 16000; bs.nextPurgeAt = time + PT.containmentPurge.firstDelayMs;
        bs.nextAddsAt = time + 11000; bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.spdMult = (bs.spdMult || 1) * PT.overclock.spdMult;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        b.setTint(0xc8a8ff);
        scene.banner('THE EYE BLAZES\nthe Overmind rages in its cracked tank', '#c8a8ff');
      }
      var rate = bs.rateMult || 1;
      // slow telekinetic hover toward you (cable-drag)
      if (time < bs.rootUntil || P.purge) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 130) b.setVelocity(dx / d * spd, dy / d * spd);
        else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextPurgeAt) {
        bs.nextPurgeAt = time + PT.containmentPurge.everyMs * rate;
        LUN._purgeBegin(scene, b, time);
      } else if (time >= bs.nextScreamAt) {
        bs.nextScreamAt = time + PT.psychicScream.everyMs * rate;
        LUN._screamBegin(scene, b, time);
      } else if (time >= bs.nextWellAt) {
        bs.nextWellAt = time + PT.gravityWell.everyMs * rate;
        LUN._wellBegin(scene, b, player, time);
      } else if (time >= bs.nextLashAt) {
        bs.nextLashAt = time + PT.mindLash.everyMs * rate;
        bs.busyUntil = time + PT.mindLash.warnMs + 300;
        LUN._mindLash(scene, b, player, time);
      } else if (time >= bs.nextCableAt) {
        bs.nextCableAt = time + PT.cableSweep.everyMs * rate;
        LUN._cableSweep(scene, b, player, time);
      } else if (time >= bs.nextBarrageAt) {
        bs.nextBarrageAt = time + PT.tkBarrage.everyMs * rate;
        LUN._tkBarrage(scene, b, player, time);
      }
      if (time >= bs.nextAddsAt) {
        bs.nextAddsAt = time + PT.broodCall.everyMs * rate;
        LUN._broodCall(scene, b, PT.broodCall);
      }
    },

    // ------------------------------------------------ boss verbs -----------
    _tkBarrage: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tkBarrage;
      for (var i = 0; i < cfg.count; i++) {
        var a = Math.PI * 2 * i / cfg.count + SIM.rng();
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
        LUN._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
          cfg.radius, cfg.warnMs, cfg.dmg, 'telekinetic wreckage', true, true, time);
      }
      try { AUDIO.play('psibolt'); } catch (e) {}
    },
    _mindLash: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.mindLash;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);      // LOCKS at cast
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0x8a5fd6, 0.14); g.lineStyle(2, 0xc8a8ff, 0.8);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      try { AUDIO.play('psibolt'); } catch (e) {}
      var self = scene;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active || !player.state.alive) return;
        var d = Math.hypot(player.x - b.x, player.y - b.y);
        var pa = Math.atan2(player.y - b.y, player.x - b.x);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        var fg = self.add.graphics().setDepth(9);
        fg.fillStyle(0xc8a8ff, 0.4);
        fg.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 280, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(140, 0.006);
        try { AUDIO.play('screamring'); } catch (e) {}
        if (d < cfg.range && Math.abs(diff) < cfg.halfRad)
          Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, 'the mind lash', true);
      });
    },
    _wellBegin: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.gravityWell, P = scene._lun, self = scene;
      var wx = player.x, wy = player.y;
      var ring = scene.add.circle(wx, wy, cfg.radius, 0x4c2c8e, 0.16).setStrokeStyle(2, 0x8a5fd6, 0.85).setDepth(2).setScale(0.3);
      scene.tweens.add({ targets: ring, scale: 1, duration: cfg.warnMs });
      try { AUDIO.play('psibolt'); } catch (e) {}
      scene.time.delayedCall(cfg.warnMs, function () {
        try { ring.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;
        var g = self.add.graphics().setDepth(2);
        g.lineStyle(3, 0x8a5fd6, 0.9); g.strokeCircle(wx, wy, cfg.radius);
        g.lineStyle(1, 0xc8a8ff, 0.7); g.strokeCircle(wx, wy, cfg.radius * 0.4);
        P.well = { x: wx, y: wy, r: cfg.radius, until: self.time.now + cfg.pullMs,
                   pullSpd: cfg.pullSpd, dmg: cfg.dmg, g: g };
        self.banner('GRAVITY WELL\nfight the drag', '#c8a8ff');
      });
    },
    _cableSweep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.cableSweep;
      var base = Math.atan2(player.y - b.y, player.x - b.x);
      for (var i = 0; i < cfg.count; i++) {
        var a = base + (i - (cfg.count - 1) / 2) * cfg.spreadRad;
        var lane = { x0: b.x, y0: b.y,
                     x1: b.x + Math.cos(a) * cfg.len, y1: b.y + Math.sin(a) * cfg.len };
        LUN._lane(scene, lane, cfg.half, cfg.warnMs + i * cfg.gapMs, cfg.dmg,
          'a whipping floor cable', true, time, 0xff9a3a);
      }
      b.boss.rootUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 200;
      try { AUDIO.play('crash'); } catch (e) {}
    },
    _screamBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.psychicScream, P = scene._lun;
      if (P.scream) return;
      var g = scene.add.graphics().setDepth(2);
      P.scream = { x: b.x, y: b.y, r: 40, maxR: cfg.maxR, start: time,
                   until: time + cfg.growMs, dmg: cfg.dmg, hit: false, g: g };
      b.boss.rootUntil = time + 700;
      scene.banner('PSYCHIC SCREAM\noutrun the ring', '#c8a8ff');
      try { AUDIO.play('screamring'); } catch (e) {}
    },
    _purgeBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.containmentPurge, P = scene._lun;
      if (P.purge) return;
      var safe = Math.floor(SIM.rng() * cfg.sectors);
      var seq = [], order = 0;
      for (var i = 0; i < cfg.sectors; i++) {
        if (i === safe) continue;
        var a0 = i * Math.PI * 2 / cfg.sectors, a1 = (i + 1) * Math.PI * 2 / cfg.sectors;
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xff9a3a, 0.13); g.lineStyle(1, 0xff9a3a, 0.7);
        g.slice(P.arena.x, P.arena.y, P.arena.r, a0, a1, false);
        g.fillPath(); g.strokePath();
        seq.push({ a0: a0, a1: a1, at: time + cfg.warnMs + order * cfg.gapMs, fired: false, g: g });
        order++;
      }
      P.purge = { cx: P.arena.x, cy: P.arena.y, r: P.arena.r, seq: seq,
                  dmg: cfg.dmg, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.warnMs + order * cfg.gapMs + 400;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('CONTAINMENT PURGE\nthe sectors vent in sequence — find the pocket', '#ff9a3a');
      try { AUDIO.play('purgevent'); } catch (e) {}
    },
    _broodCall: function (scene, b, cfg) {
      var alive = 0;
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && m.mob && m.mob.def === DATA.mobs.scuttler) alive++;
      });
      if (alive >= cfg.cap) return;
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: 'scuttler', bossWave: true,
          x: b.x + Math.cos(a) * 160, y: b.y + Math.sin(a) * 140 });
      }
      scene.banner('BROOD CALL\nthe hive answers', '#5fd668');
    },

    // =============================================== MOB VERBS (map-new) ===
    // BROOD SAC — dormant until you approach, then hatches SCUTTLER waves.
    _broodSac: function (scene, m, player, time) {
      var cfg = m.mob.def.sac, P = scene._lun;
      m.setVelocity(0, 0);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.hatchAt) {
        if (d < cfg.triggerRange && player.state.alive) {
          m.mob.hatchAt = time + cfg.crackMs;
          m.setTint(0xb8f04a);
          try { AUDIO.play('airlockhiss'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.hatched) {
        if (time < m.mob.hatchAt) {                            // cracking open
          m.setTint(Math.floor(time / 120) % 2 === 0 ? 0xb8f04a : 0xffffff);
          return true;
        }
        m.mob.hatched = true;
        m.clearTint();
        m.mob.nextWaveAt = time;
        scene.burst(m.x, m.y, 10, 0xb8f04a);
      }
      if (time >= m.mob.nextWaveAt) {
        m.mob.nextWaveAt = time + cfg.waveEveryMs;
        var alive = 0;
        scene.mobs.children.iterate(function (o) {
          if (o && o.active && o.mob && o.mob.def === DATA.mobs.scuttler) alive++;
        });
        if (alive < cfg.cap) {
          for (var i = 0; i < cfg.perWave; i++) {
            scene.queueSpawn({ key: 'scuttler',
              x: m.x + (SIM.rng() * 2 - 1) * 44, y: m.y + (SIM.rng() * 2 - 1) * 44 });
          }
          try { AUDIO.play('psibolt'); } catch (e) {}
        }
      }
      return true;                                             // never moves
    },
    // HAYWIRE TURRET — rooted; telegraphed sweeping beam arcs.
    _turret: function (scene, m, player, time) {
      var cfg = m.mob.def.sweep;
      m.setVelocity(0, 0);
      if (!m.mob.nextSweepAt) m.mob.nextSweepAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSweepAt && d < cfg.range && player.state.alive) {
        m.mob.nextSweepAt = time + cfg.everyMs;
        m.mob.sweepUntil = time + cfg.warnMs + cfg.arcs * cfg.gapMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x) - cfg.stepRad;
        for (var i = 0; i < cfg.arcs; i++) {
          var a = base + i * cfg.stepRad;
          var lane = { x0: m.x, y0: m.y,
                       x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len };
          LUN._lane(scene, lane, cfg.half, cfg.warnMs + i * cfg.gapMs, cfg.dmg,
            'a haywire turret beam', false, time, 0xff4b4e);
        }
        try { AUDIO.play('psibolt'); } catch (e) {}
      }
      if (m.mob.sweepUntil && time < m.mob.sweepUntil) {
        m.setTint(Math.floor(time / 130) % 2 === 0 ? 0xff9a3a : 0xffffff);
      } else if (m.mob.sweepUntil) { m.clearTint(); m.mob.sweepUntil = 0; }
      return true;                                             // rooted forever
    },
    // ASTRO-REVENANT — drifts (core chase, floats over walls); brief GRAB.
    _revenant: function (scene, m, player, time) {
      var cfg = m.mob.def.grab, P = scene._lun;
      if (P.grab && P.grab.m === m) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextGrabAt) m.mob.nextGrabAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.7);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      // M7k AUDIT fix: no grab mid jump-pad arc — the hold would freeze the
      // airborne player with a disabled body (contact-immune contract)
      if (time >= m.mob.nextGrabAt && d < cfg.range && !P.grab && player.state.alive && !P.padAir) {
        m.mob.nextGrabAt = time + cfg.cooldownMs;
        P.grab = { m: m, until: time + cfg.holdMs, nextTickAt: time, dmg: cfg.dmg };
        scene.damageNumber(player.x, player.y - 24, 'GRABBED', '#c8a8ff');
        try { AUDIO.play('eyeignite'); } catch (e) {}
        return true;
      }
      return false;                                            // core chase drifts him
    },
    // LUNA LEAPER — sails in low-grav arcs onto marked landing circles.
    _leaper: function (scene, m, player, time) {
      var cfg = m.mob.def.hop;
      if (m.mob.hop) {                                         // mid-arc
        var H = m.mob.hop;
        var t = Math.max(0, Math.min(1, (time - H.start) / (H.until - H.start)));
        m.x = H.x0 + (H.x1 - H.x0) * t;
        m.y = H.y0 + (H.y1 - H.y0) * t - Math.sin(t * Math.PI) * 40;
        if (time >= H.until) {
          m.body.enable = true;
          m.body.reset(H.x1, H.y1);
          try { H.ring.destroy(); } catch (e) {}
          m.mob.hop = null;
          scene.burst(H.x1, H.y1, 8, 0x8a5fd6);
          try { AUDIO.play('gravthump'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - H.x1, player.y - H.y1) < cfg.landRadius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, 'a Luna Leaper');
        }
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHopAt && d > 90 && d < cfg.range && player.state.alive) {
        m.mob.nextHopAt = time + cfg.everyMs;
        var tx = player.x + player.body.velocity.x * 0.3, ty = player.y + player.body.velocity.y * 0.3;
        var ring = scene.add.circle(tx, ty, cfg.landRadius, 0xff9a3a, 0.12)
          .setStrokeStyle(2, 0xff9a3a, 0.85).setDepth(2);
        m.mob.hop = { x0: m.x, y0: m.y, x1: tx, y1: ty, start: time, until: time + cfg.airMs, ring: ring };
        m.body.enable = false;                                 // airborne
        m.setVelocity(0, 0);
        return true;
      }
      // ground scuttle toward you between hops
      if (d > 1) m.setVelocity((player.x - m.x) / d * m.mob.def.spd, (player.y - m.y) / d * m.mob.def.spd);
      return true;
    },
    // ORBITAL MINE — drifts at you, beeps, telegraphed blast. SHOOTABLE.
    _mine: function (scene, m, player, time) {
      var cfg = m.mob.def.mine, P = scene._lun;
      if (!m.mob._mineInit) {
        m.mob._mineInit = true;
        // M7k AUDIT fix: keep the m.mob reference — the sprite is pooled
        P.mines.push({ m: m, mob: m.mob, x: m.x, y: m.y, exploded: false, cfg: cfg });
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.blastAt) {
        // drift straight at you, slow
        if (d > 1) m.setVelocity((player.x - m.x) / d * m.mob.def.spd, (player.y - m.y) / d * m.mob.def.spd);
        if (d < cfg.armRange && player.state.alive) {
          m.mob.blastAt = time + cfg.fuseMs;
          var ring = scene.add.circle(m.x, m.y, cfg.radius, 0xff4b4e, 0.1)
            .setStrokeStyle(2, 0xff4b4e, 0.85).setDepth(2).setScale(0.4);
          scene.tweens.add({ targets: ring, scale: 1, duration: cfg.fuseMs });
          m.mob._ring = ring;
          try { AUDIO.play('minebeep'); } catch (e) {}
        }
        return true;
      }
      // armed: rooted, beeping faster
      m.setVelocity(0, 0);
      m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xff4b4e : 0xffffff);
      if (m.mob._ring) m.mob._ring.setPosition(m.x, m.y);
      if (time >= m.mob.blastAt) {
        var entry = null;
        for (var i = 0; i < P.mines.length; i++) if (P.mines[i].mob === m.mob) entry = P.mines[i];  // M7k AUDIT fix: match the mob, not the pooled sprite
        if (entry) entry.exploded = true;                      // no double blast on death
        var bx = m.x, by = m.y;
        if (m.mob._ring) { try { m.mob._ring.destroy(); } catch (e) {} m.mob._ring = null; }
        scene.killMobCredited(m);                              // env kill, credited (XP first)
        LUN._mineBlast(scene, bx, by, cfg, time);
        return true;
      }
      return true;
    },
    // STAR HORROR — elite; tentacle sweep cones (locks, then resolves).
    _horror: function (scene, m, player, time) {
      var cfg = m.mob.def.cone;
      if (m.mob.coneLockUntil && time < m.mob.coneLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextConeAt) m.mob.nextConeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextConeAt && d < cfg.range && player.state.alive) {
        m.mob.nextConeAt = time + cfg.everyMs;
        m.mob.coneLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);  // LOCKS at cast
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x8a5fd6, 0.14); g.lineStyle(2, 0xc8a8ff, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!m.active) return;   // M7k AUDIT fix: a dead horror's windup must not land
          if (!player.state.alive) return;
          var pd = Math.hypot(player.x - mx, player.y - my);
          var pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          var fg = self.add.graphics().setDepth(9);
          fg.fillStyle(0xc8a8ff, 0.35);
          fg.slice(mx, my, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
          self.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Star Horror's tentacles");
        });
        return true;
      }
      return false;                                            // core chase floats him
    },

    // ================================================= INTERNAL HELPERS ====
    _mineBlast: function (scene, x, y, cfg, time) {
      scene.burst(x, y, 16, 0xff9a3a);
      scene.cameras.main.shake(150, 0.007);
      try { AUDIO.play('crash'); } catch (e) {}
      // mobs first (XP/level-up heals land BEFORE the player burn), player last
      scene.mobs.children.iterate(function (o) {
        if (o && o.active && o.mob && Math.hypot(o.x - x, o.y - y) < cfg.radius &&
            o.mob.def !== DATA.mobs.orbitalMine)               // near mobs die, credited
          scene.killMobCredited(o);
      });
      var p = scene.player;
      if (p.state.alive && Math.hypot(p.x - x, p.y - y) < cfg.radius)
        Entities.hurtPlayer(scene, p, cfg.dmg, time || scene.time.now, 'an orbital mine');
    },
    _dust: function (scene, P, x, y, time, sc) {
      var G = scene.realmDef.lowGrav;
      if (P.dust.length > 40) return;                          // pooled cap
      var c = scene.add.circle(x + (SIM.rng() * 2 - 1) * 6, y, 3 + SIM.rng() * 3 * (sc || 1), 0xb0b4c2, 0.4).setDepth(1);
      P.dust.push({ obj: c, dieAt: time + G.dustLifeMs });
    },
    _onDeck: function (P, x, y) {
      for (var i = 0; i < P.modules.length; i++) {
        var M = P.modules[i];
        if (x >= M.x0 && x < M.x1 && y >= M.y0 && y < M.y1) return true;
      }
      if (Math.hypot(x - P.arena.x, y - P.arena.y) < P.arena.r) return true;
      if (Math.hypot(x - P.padCircle.x, y - P.padCircle.y) < P.padCircle.r) return true;
      return false;
    },

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
      var P = scene._lun;
      // during the boss fight the player is clamped to the reactor (LUN._bound),
      // so don't also wrap them — only wrap when roaming pre-boss.
      if (!P.padAir && !(scene.boss && scene.boss.active)) wrap(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave && !m.mob.hop) wrap(m); });
    },

    // item 10: hard arena lock — clamp the player inside the reactor ring every
    // frame during the boss fight (matches colosseum._bound / belly's ellipse).
    _bound: function (scene) {
      var P = scene._lun, A = P.arena, p = scene.player;
      if (!p || !p.body || P.padAir) return;
      var R = A.r - 14, dx = p.x - A.x, dy = p.y - A.y, d = Math.hypot(dx, dy);
      if (d <= R) return;
      var ox = dx / d, oy = dy / d, nx = A.x + ox * R, ny = A.y + oy * R;
      if (p.body.enable && p.body.reset) {
        var vx = p.body.velocity.x, vy = p.body.velocity.y, vn = vx * ox + vy * oy;
        if (vn > 0) { vx -= vn * ox; vy -= vn * oy; }
        p.body.reset(nx, ny); p.body.velocity.x = vx; p.body.velocity.y = vy;
      } else { p.x = nx; p.y = ny; }
    },

    // pending telegraphed circle blasts (absolute clocks — unfreeze-safe)
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time) {
      var P = scene._lun;
      var tint = fromBoss ? 0x8a5fd6 : 0x4adcf0;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      P.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var P = scene._lun;
      for (var i = P.zones.length - 1; i >= 0; i--) {
        var z = P.zones[i];
        if (time < z.at) continue;
        P.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0x8a5fd6 : 0x4adcf0);
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
    // warned LANE that blasts along its band (turret arcs + cable whips)
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint) {
      var P = scene._lun;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      P.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint });
    },
    _runLanes: function (scene, time) {
      var P = scene._lun;
      for (var i = P.lanes.length - 1; i >= 0; i--) {
        var l = P.lanes[i];
        if (time < l.at) continue;
        P.lanes.splice(i, 1);
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
          if (m && m.active && m.mob && m.mob.def !== DATA.mobs.haywireTurret &&
              dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = LUN;
  root.LUNAR_SCENE = LUN;
})(typeof window !== 'undefined' ? window : this);
