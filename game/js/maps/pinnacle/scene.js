// ============================================================================
// game/js/maps/pinnacle/scene.js — THE PINNACLE OF CORRUPTION scene (ACT 2 of
// the finale). Standalone map. The belly guts beach you here (csBeach → this).
// Toroidal L/R + vertical sand-loop; the SURF up top KNOCKS YOU BACK onto the
// sand. Ground = sand tiles 1-4. Only decor = DRIFTWOOD (destructible, splinters
// on break, no blast). One QUICKSAND pit slows you. A 1000-kill any-realm HORDE
// ramps from 1. The 1.5x beached TITAN WHALE is the stationary boss — its combat
// kit + hazard machinery are REUSED from BELLY_SCENE. Kill the whale AND clear
// 1000 → the screen shatters → cs2/cs3/cs4 (handled in scenes.js).
// ============================================================================
(function (root) {
  'use strict';
  var BE = (typeof BELLY_SCENE !== 'undefined') ? BELLY_SCENE : (root.BELLY_SCENE || {});
  var A = (typeof PINNACLE_ART !== 'undefined') ? PINNACLE_ART : root.PINNACLE_ART;
  var GREEN = 0x9ae83a, GREENLT = 0xd8ffa0;

  var PIN = {

    // ------------------------------------------------------ TEXTURES --------
    _tex: function (scene, key, w, h, drawFn) {
      if (scene.textures.exists(key)) scene.textures.remove(key);
      var t = scene.textures.createCanvas(key, w, h);
      var ctx = t.getContext ? t.getContext() : t.context;
      drawFn(ctx, w, h); t.refresh();
      t.setFilter(Phaser.Textures.FilterMode.NEAREST);
      return t;
    },
    _buildTextures: function (scene) {
      var TS = 64;
      this._tex(scene, 'pinSand', TS, TS, function (c) { A.TILES.sand(c, TS); });
      this._tex(scene, 'pinWet', TS, TS, function (c) { A.TILES.wet(c, TS); });
      this._tex(scene, 'pinRipple', TS, TS, function (c) { A.TILES.ripple(c, TS); });
      this._tex(scene, 'pinShell', TS, TS, function (c) { A.TILES.shell(c, TS); });
      this._tex(scene, 'pinLap', TS, TS, function (c) { A.surf(c, TS, 0); });         // scrolls toward shore
      this._tex(scene, 'pinFoam', 128, 40, function (c) { A.foamEdge(c, 128, 40, 0); });
      for (var s = 0; s < 4; s++) (function (st) { PIN._tex(scene, 'pinDrift' + st, 96, 96, function (c) { A.driftwood(c, 96, st); }); })(s);
    },

    // -------------------------------------------------------- SETUP ---------
    setup: function (scene, WW, HH) {
      this._buildTextures(scene);
      var rd = scene.realmDef, self = this;
      var sandTop = Math.round(HH * 0.16);                    // the waterline: surf above, sand below
      // shared state — reused by the belly WHALE KIT (scene._belly) + our logic.
      var C = scene._belly = {
        stage: 'arena', zones: [], mLanes: [], rings: [], patches: [], mobWarns: [],
        latch: null, dispUntil: 0, bossArmed: false, tracked: {}, popsThisFrame: 0,
        acidTiles: [], acidFrame: 0, acidNextAt: 0, uvula: null, uvulaGagged: true, cinematic: null,
        tide: { phase: 'idle', nextAt: Infinity, gurgleUntil: 0, riseUntil: 0, recedeUntil: 0, zones: [], flexG: null },
        horde: null, driftwood: [], quicksand: null, hordeText: null, surf: null,
        sandTop: sandTop,
        // the whale's attack zone (a shore region near the top, not the whole map)
        arena: { x: 0.5 * WW, y: sandTop + (rd.arenaCfg.ry) * HH * 0.7, rx: rd.arenaCfg.rx * WW, ry: rd.arenaCfg.ry * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- GROUND: sand base + organic patches of the other 3 sand tiles ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'pinSand').setDepth(-24);
      var patch = function (cx, cy, rx, ry, key) {
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, key).setDepth(-22);
        var mg = scene.make.graphics({ add: false }); mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask()); return spr;
      };
      patch(0.22 * WW, 0.30 * HH, 0.16 * WW, 0.11 * HH, 'pinRipple');
      patch(0.78 * WW, 0.72 * HH, 0.18 * WW, 0.12 * HH, 'pinRipple');
      patch(0.55 * WW, 0.90 * HH, 0.20 * WW, 0.09 * HH, 'pinRipple');
      patch(0.16 * WW, 0.74 * HH, 0.12 * WW, 0.08 * HH, 'pinShell');
      patch(0.85 * WW, 0.24 * HH, 0.12 * WW, 0.09 * HH, 'pinShell');
      patch(0.50 * WW, sandTop + 0.06 * HH, 0.42 * WW, 0.06 * HH, 'pinWet');   // damp band under the surf

      // ---- SURF: whitewater layer at the very top, then a lapping line ----
      var lap = scene.add.tileSprite(WW / 2, sandTop - 46, WW, 92, 'pinLap').setDepth(-21);   // lapping line
      var foam = scene.add.tileSprite(WW / 2, 20, WW, 40, 'pinFoam').setDepth(-20.8);          // whitewater at the very top
      // a thin foam wash right at the waterline
      var wash = scene.add.tileSprite(WW / 2, sandTop, WW, 10, 'pinFoam').setDepth(-20.5);
      C.surf = { lap: lap, foam: foam, wash: wash, sandTop: sandTop };

      // ---- SPAWN: spat onto the sand in front of the whale ----
      scene._realmStart = { x: WW / 2, y: sandTop + 0.14 * HH };

      // ---- DRIFTWOOD (destructible, splinter break, NO blast) ----
      var dpos = [[0.20, 0.42], [0.40, 0.30], [0.72, 0.30], [0.84, 0.52], [0.16, 0.64],
                  [0.56, 0.66], [0.86, 0.80], [0.32, 0.82], [0.66, 0.50], [0.48, 0.44]];
      dpos.forEach(function (d) {
        var dx = d[0] * WW, dy = d[1] * HH;
        var spr = scene.add.sprite(dx, dy, 'pinDrift0').setScale(1.3).setDepth(2);
        C.driftwood.push({ spr: spr, x: dx, y: dy, hp: 42, maxHp: 42, stage: 0, dead: false });
      });

      // (2026-07-19 Red: quicksand REMOVED — that spot is just regular sand now.
      //  C.patches stays for the boss's P2 wet-sand mortar patches.)

      // ---- HORDE state: 1000-kill any-realm ramp (starts at 1) ----
      var pool = [];
      try { for (var bk in DATA.biomes) { (DATA.biomes[bk].mobs || []).forEach(function (k) { var md = DATA.mobs[k]; if (md && !md.boss && scene.textures.exists(md.texture) && pool.indexOf(k) < 0) pool.push(k); }); } } catch (e) {}
      if (!pool.length) pool = ['shipRatPack'];
      // BOSS-MOB pool (Red): once every regular has been SEEN once, other realms'
      // BOSSES join the swarm as ELITE mobs (synthesized from their boss defs) —
      // max ONE alive at a time, on top of the whale.
      var bossPool = [];
      try { for (var bkk in DATA.bosses) {
        if (bkk === 'titanWhale') continue;
        var bd = DATA.bosses[bkk];
        if (!bd || !bd.texture || !scene.textures.exists(bd.texture)) continue;
        var mk = 'pbm_' + bkk;
        DATA.mobs[mk] = { name: (bd.name || 'Boss') + ' (elite)', texture: bd.texture,
          hp: Math.max(300, Math.round((bd.hp || 2000) * 0.14)), spd: 46, xp: (bd.xp || 120), cost: 1,
          deathTint: bd.deathTint || 0xffffff, chase: { contactDmg: Math.round((bd.contactDmg || 20) * 0.7) },
          bossMob: true, bmScale: 0.92 };
        bossPool.push(mk);
      } } catch (e) {}
      var hc = rd.hordeCfg || {};
      C.horde = { goal: hc.goal || 1000, kills: 0, pool: pool, seen: {}, bossPool: bossPool, bossChance: 0.18,
                  nextAt: 0, intervalMs: hc.intervalMs || 640,
                  burst: hc.burst || 5, maxCap: hc.maxCap || 52, rampMs: hc.rampMs || 6000, startAt: scene.time.now };
      var W = scene.scale.width;
      C.hordeText = scene.add.text(W / 2, 44, 'DEVOURED  0 / ' + C.horde.goal,
        { fontFamily: 'monospace', fontSize: 15, color: '#ffe08a', stroke: '#3a2410', strokeThickness: 3 })
        .setScrollFactor(0).setOrigin(0.5).setDepth(60);
      C._surfPh = 0;
    },

    afterCreate: function (scene) {
      var C = scene._belly; if (!C) return;
      if (scene.spawnEvent) scene.spawnEvent.paused = true;            // our horde runs the show
      scene.time.delayedCall(400, function () { if (!scene.closing && !scene.boss && scene.startBossFight) scene.startBossFight(); });
    },

    // ------------------------------------------------- BOSS (reuse belly) ---
    // Beach the 1.5x whale at the shoreline (in the surf), player spat below.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._belly, self = scene, WW = scene.worldW, HH = scene.worldH;
      C.tracked = {}; C.latch = null;
      scene.cameras.main.startFollow(scene.player, true, 0.12, 0.12);
      scene.banner('THE TITAN WHALE\nbeached in the surf — and it is FURIOUS', '#b13e53');
      try { AUDIO.play('whaleroar'); } catch (e) {}
      var tx = WW / 2, ty = C.sandTop + 6;                            // right at the waterline
      scene.time.delayedCall(def.entranceMs * 0.5, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, tx, ty);
        if (self.boss) {
          var b = self.boss;
          b.setScale((b.scaleX || 1) * 1.5);
          try { if (b.body && b.body.setSize) b.body.setSize(b.body.width * 1.5, b.body.height * 1.5, true); } catch (e) {}
          b.setAlpha(0);
          self.tweens.add({ targets: b, alpha: 1, duration: 500, onComplete: function () { if (b.active) { self.cameras.main.shake(240, 0.01); try { AUDIO.play('whaleroar'); } catch (e) {} } } });
          b.setVelocity(0, 0);
        }
        C.bossArmed = true;
      });
      scene.time.delayedCall(def.entranceMs, function () { if (!self.closing && self.player.state.alive && self.boss) self.showScouter(def); });
    },
    bossUpdate: function (scene, b, player, time) { if (BE.bossUpdate) return BE.bossUpdate(scene, b, player, time); },
    unfreeze: function (scene, dt) { if (BE.unfreeze) BE.unfreeze(scene, dt); },
    annihilate: function (scene) { if (BE.annihilate) BE.annihilate(scene); },
    afterCreateSafe: function () {},

    // ------------------------------------------------------ UPDATE ----------
    update: function (scene, time, delta) {
      var C = scene._belly; if (!C) return;
      var p = scene.player, alive = p.state.alive;
      C.popsThisFrame = 0;

      // boss fallen → reveal name + clear its FX
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        try { if (BE.markCleared) BE.markCleared(); } catch (e) {}
        if (BE._clearBossFx) BE._clearBossFx(scene, C);
      }

      // THE WHALE IS INVULNERABLE until the 300-swarm is spent — THEN the real
      // fight (Red). It still SNIPES the map the whole time. Restore HP + a shield
      // tint while the horde lives; on the last kill, expose it with the banner.
      if (scene.boss && scene.boss.active && scene.boss.boss) {
        if (C.horde && C.horde.kills < C.horde.goal) {
          scene.boss.boss.hp = scene.boss.boss.maxHp;
          if (scene.boss.setTint) scene.boss.setTint(0x8aa8ff);
        } else if (!C._bossExposed) {
          C._bossExposed = true;
          if (scene.boss.clearTint) scene.boss.clearTint();
          scene.banner('ONLY THE PINNACLE OF CORRUPTION REMAINS', '#ff9ab0');
          try { AUDIO.play('mawalight'); } catch (e) {}
        }
      }

      // surf scroll (lapping toward shore + drifting whitewater)
      C._surfPh += delta * 0.00016;
      if (C.surf) { var s = C.surf; s.lap.tilePositionY -= delta * 0.03; s.foam.tilePositionX += delta * 0.02; s.wash.tilePositionX -= delta * 0.03; }

      // --- boss hazard machinery (REUSED) ---
      PIN._rings(scene, C, time, alive);
      PIN._patches(scene, C, time, alive);
      if (BE._runZones) BE._runZones(scene, time);
      if (BE._deathPops) BE._deathPops(scene, C, time);
      PIN._mobWarns(scene, C);

      // --- driftwood destructibles ---
      PIN._driftwoodStep(scene, C, time);

      // --- the 1000-kill horde ---
      PIN._hordeStep(scene, C, time);

      // --- size elite boss-mobs on spawn; keep all mobs on the sand (out of surf) ---
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active) return;
        if (m.mob && m.mob.def.bossMob && !m._bmSized) { m._bmSized = true; try { m.setScale(m.mob.def.bmScale || 0.9); if (m.body && m.body.setSize) m.body.setSize(Math.max(24, m.width * 0.5), Math.max(24, m.height * 0.5)); } catch (e) {} }
        if (m.y < C.sandTop + 6) { m.y = C.sandTop + 6; if (m.body) m.body.velocity.y = Math.abs(m.body.velocity.y); }
      });

      // --- movement bounds: L/R + vertical sand-loop wrap, surf knockback ---
      PIN._bound(scene, C);
    },

    // ------------------------------------------------------ HORDE ----------
    _arenaSpawnPoint: function (scene, C) {
      var WW = scene.worldW, HH = scene.worldH, top = C.sandTop + 20;
      var side = Math.floor((typeof SIM !== 'undefined' ? SIM.rng() : Math.random()) * 3);   // L / R / bottom edges of the sand
      var rx = (typeof SIM !== 'undefined' ? SIM.rng() : Math.random());
      if (side === 0) return { x: 8, y: top + rx * (HH - top - 8) };
      if (side === 1) return { x: WW - 8, y: top + rx * (HH - top - 8) };
      return { x: rx * WW, y: HH - 8 };
    },
    _hordeStep: function (scene, C, time) {
      var H = C.horde, p = scene.player; if (!H) return;
      H.kills = p.state.kills;
      var elapsed = time - H.startAt;
      var cap = Math.min(H.maxCap, 1 + Math.floor(elapsed / H.rampMs) + Math.floor(H.kills / 40));
      if (time >= H.nextAt && !scene.closing && !scene._bellyFinaleFired && H.kills < H.goal) {   // stop spawning once the 300 is met — then it's just the whale
        H.nextAt = time + H.intervalMs;
        var want = Math.min(H.burst, cap - scene.mobs.countActive(true));
        var rnd = function () { return typeof SIM !== 'undefined' ? SIM.rng() : Math.random(); };
        var bmAlive = 0; scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.def.bossMob) bmAlive++; });
        for (var i = 0; i < want; i++) {
          var k, j;
          var unseen = []; for (j = 0; j < H.pool.length; j++) if (!H.seen[H.pool[j]]) unseen.push(H.pool[j]);
          if (unseen.length) { k = unseen[Math.floor(rnd() * unseen.length)]; }                          // COVERAGE: see one of each first
          else if (H.bossPool.length && bmAlive < 1 && rnd() < H.bossChance) { k = H.bossPool[Math.floor(rnd() * H.bossPool.length)]; bmAlive++; }   // then ELITE bosses (max 1)
          else { k = H.pool[Math.floor(rnd() * H.pool.length)]; }                                          // otherwise basically random
          H.seen[k] = 1;
          var pt = PIN._arenaSpawnPoint(scene, C);
          scene.queueSpawn({ key: k, x: pt.x, y: pt.y });
        }
      }
      if (C.hordeText && C.hordeText.active) C.hordeText.setText('DEVOURED  ' + Math.min(H.kills, H.goal) + ' / ' + H.goal);
      if (H.kills >= H.goal && scene._bellyBossDead && !scene._bellyFinaleFired && scene.triggerBellyFinale) scene.triggerBellyFinale();
    },

    // ---------------------------------------------- DRIFTWOOD (destructible) -
    _driftwoodStep: function (scene, C, time) {
      var shots = scene.playerShots; if (!shots) return;
      C.driftwood.forEach(function (D) {
        if (D.dead || !D.spr.active) return;
        shots.children.iterate(function (s) {
          if (!s || !s.active || D.dead) return;
          if (Math.hypot(s.x - D.x, s.y - D.y) < 30) {
            D.hp -= s.proj ? s.proj.dmg : 5;
            D.spr.setTintFill(0xffffff);
            (function (spr) { scene.time.delayedCall(40, function () { if (spr.active) spr.clearTint(); }); })(D.spr);
            try { AUDIO.play('axechop'); } catch (e) {}
            var st = D.hp > D.maxHp * 0.66 ? 0 : D.hp > D.maxHp * 0.33 ? 1 : 2;
            if (st !== D.stage) { D.stage = st; if (D.spr.active) D.spr.setTexture('pinDrift' + st); }
            if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
            if (D.hp <= 0) {
              D.dead = true;
              if (D.spr.active) D.spr.setTexture('pinDrift3');                 // splinters (no blast)
              scene.burst(D.x, D.y, 14, 0xb09a6a);
              try { AUDIO.play('axechop'); } catch (e) {}
              (function (spr) { scene.time.delayedCall(220, function () { try { spr.destroy(); } catch (e) {} }); })(D.spr);
            }
          }
        });
      });
    },

    // ---------------------------------------------- BOUNDS: wrap + knockback -
    _bound: function (scene, C) {
      var p = scene.player, WW = scene.worldW, HH = scene.worldH, top = C.sandTop;
      var reset = function (nx, ny) { if (p.body && p.body.reset) { var vx = p.body.velocity.x, vy = p.body.velocity.y; p.body.reset(nx, ny); p.body.velocity.x = vx; p.body.velocity.y = vy; } else { p.x = nx; p.y = ny; } };
      if (p.x < 0) reset(p.x + WW, p.y); else if (p.x >= WW) reset(p.x - WW, p.y);   // horizontal toroidal
      if (p.y >= HH) reset(p.x, top + 6);                                            // bottom loops to the top of the sand
      else if (p.y < top) {                                                          // walked into the SURF → knocked back onto the sand
        p.y = top;
        if (p.body) { p.body.velocity.y = 150; p.body.velocity.x *= 0.6; }
        if (!C._washAt || scene.time.now > C._washAt) { C._washAt = scene.time.now + 500; scene.cameras.main.shake(90, 0.003); try { AUDIO.play('beachslide'); } catch (e) {} }
      }
      // wrap the horde horizontally too (keeps the field seamless)
      scene.mobs.children.iterate(function (m) { if (!m || !m.active || !m.body) return; if (m.x < 0) m.x += WW; else if (m.x >= WW) m.x -= WW; });
    },

    // ---------------------------------------------- copied FX loops ---------
    _rings: function (scene, C, time, alive) {
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear(); RG.g.lineStyle(8, RG.tint, 0.28); RG.g.strokeCircle(RG.x, RG.y, RG.r); RG.g.lineStyle(2, RG.tint, 0.9);
        for (var seg = 0; seg < 24; seg++) {
          var a0 = seg / 24 * Math.PI * 2, inGap = false;
          for (var gi = 0; gi < RG.gaps.length; gi++) { var d = Math.atan2(Math.sin(a0 - RG.gaps[gi]), Math.cos(a0 - RG.gaps[gi])); if (Math.abs(d) < RG.gapHalf) inGap = true; }
          if (inGap) continue;
          RG.g.beginPath(); RG.g.arc(RG.x, RG.y, RG.r, a0, a0 + Math.PI * 2 / 24); RG.g.strokePath();
        }
        if (!RG.hit && alive) {
          var sd = Math.hypot(scene.player.x - RG.x, scene.player.y - RG.y);
          if (Math.abs(sd - RG.r) < 22) {
            var pa = Math.atan2(scene.player.y - RG.y, scene.player.x - RG.x), safe = false;
            for (var gj = 0; gj < RG.gaps.length; gj++) { var dd = Math.atan2(Math.sin(pa - RG.gaps[gj]), Math.cos(pa - RG.gaps[gj])); if (Math.abs(dd) < RG.gapHalf) safe = true; }
            if (!safe) { RG.hit = true; Entities.hurtPlayer(scene, scene.player, RG.dmg, time, 'the flipper slam', true); }
          }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }
    },
    _patches: function (scene, C, time, alive) {
      var p = scene.player;
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) >= PA.r) continue;
        if (PA.slowMult) { p.body.velocity.x *= PA.slowMult; p.body.velocity.y *= PA.slowMult; }
        if (PA.dmg && time >= (PA.nextTickAt || 0)) { PA.nextTickAt = time + PA.tickMs; Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'a hazard', !!PA.fromBoss); }
      }
    },
    _mobWarns: function (scene, C) {
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) { var MW = C.mobWarns[mw]; if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); } }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PIN;
  root.PINNACLE_SCENE = PIN;
})(typeof window !== 'undefined' ? window : this);
