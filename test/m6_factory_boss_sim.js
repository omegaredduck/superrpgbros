// M6e FACTORY BOSS SIM — a WHITE-GEAR (T1) ranger bot fights THE GRAND
// ENGINEER through both phases. The bot reads the same telegraphs a player
// sees (engineerFx.drill/cone/stamp/ring, _zoneWarns, reactor charge) and
// reacts like a decent-but-human player. Deaths revive in place (counted).
// Usage: node factory_boss_sim.js [maxSeconds=420] [level=1]
const path = require('path');
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
const MAXS = parseInt(process.argv[2] || '420', 10);
const LEVEL = parseInt(process.argv[3] || '1', 10);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(400);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'factory' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);

  // ---- white gear + isolate the boss fight + install the bot ----
  const setup = await page.evaluate(`(function(){
    var r = ${scene('Realm')};
    var st = r.player.state;
    CURRENT.equipment.weapon = 'w1'; CURRENT.equipment.ability = 'a1';
    CURRENT.equipment.armor = 'ar1'; CURRENT.equipment.ring = 'r1';
    st.level = ${LEVEL};
    st.stats = SIM.statsFor(DATA.classes[st.cls], st.level, CURRENT.potionsDrunk, CURRENT.equipment);
    st.hp = st.stats.hp; st.mp = st.stats.mp;
    // strip the map phase: no ambient spawns, clear the field
    if (r.spawnEvent) r.spawnEvent.paused = true;
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.mob.hp = 0; m.setActive(false).setVisible(false); if (m.body) m.body.enable = false; } });

    var S = window.__SIM = { t0: r.time.now, dmg: {}, deaths: [], hpMin: st.stats.hp,
                             p1Start: null, p2Start: null, killAt: null, bossHits: 0, bossDmg: 0 };
    // damage-by-source + revive-on-death wrapper
    var orig = Entities.hurtPlayer;
    Entities.hurtPlayer = function (scene2, p, dmg, time, src, fromBoss) {
      var s2 = p.state;
      if (!s2.alive || time - s2.lastHitAt < DATA.combat.iframesMs) return;
      var mit = SIM.incomingDmg(DATA.classes[s2.cls], dmg, !!fromBoss);
      var real = Math.max(DATA.combat.minDamage, mit - Math.floor(s2.stats.def));
      S.dmg[src || '?'] = (S.dmg[src || '?'] || 0) + real;
      if (s2.hp - real <= 0) {
        S.deaths.push({ t: Math.round((scene2.time.now - S.t0) / 1000), by: src || '?' });
        s2.hp = s2.stats.hp; s2.lastHitAt = time;
        return;
      }
      orig(scene2, p, dmg, time, src, fromBoss);
      if (s2.hp < S.hpMin) S.hpMin = s2.hp;
    };
    var origHB = Entities.hurtBoss;
    Entities.hurtBoss = function (scene2, b, dmg) { S.bossHits++; S.bossDmg += dmg; origHB(scene2, b, dmg); };

    r.showScouter = function () {};              // scouter freezes update — skip it
    // trigger the boss arrival (lift cinematic → spawnBossNow via delayedCall)
    r.engineerArrival(DATA.bosses.engineer);
    S.p1Start = r.time.now;

    // ---- BOT BRAIN ----
    var strafeSign = 1, lastFlip = r.time.now, lastT = r.time.now;
    r.rig.collect = function (player) {
      var i = SIM.makeIntent();
      var now = r.time.now; lastT = now;
      if (r.scanning && r.dismissScouter) r.dismissScouter();   // scouter freezes update
      var px = player.x, py = player.y;
      var b = r.boss, EF = r.engineerFx || {};
      var ax = 0, ay = 0;
      if (now - lastFlip > 3500) { strafeSign = -strafeSign; lastFlip = now; }

      // 1) REACTOR PURGE charging → sprint straight out of the circle
      if (b && b.active && EF.reactorUntil) {
        var cfgR = (EF.reactorCfg && EF.reactorCfg.radius) || 500;
        var dxr = px - b.x, dyr = py - b.y, dr = Math.hypot(dxr, dyr) || 1;
        if (dr < cfgR + 70) { i.moveX = dxr / dr; i.moveY = dyr / dr;
          i.aimAngle = Math.atan2(b.y - py, b.x - px); i.firing = true; return i; }
      }
      // 2) FLOOR STAMP → stand on the wave that is NOT about to blow
      if (EF.stamp && EF.stamp.cells && EF.stamp.cells.length) {
        var stp = EF.stamp, half = stp.tile / 2, mine = null;
        for (var c = 0; c < stp.cells.length; c++) { var cc = stp.cells[c];
          if (Math.abs(px - cc.x) < half && Math.abs(py - cc.y) < half) { mine = cc; break; } }
        var nextWave = now < stp.aAt ? 0 : 1;
        if (mine && mine.wave === nextWave) {
          var bestC = null, bcd = 1e9;
          for (var c2 = 0; c2 < stp.cells.length; c2++) { var c3 = stp.cells[c2];
            if (c3.wave === nextWave) continue;
            var dcc = Math.hypot(c3.x - px, c3.y - py);
            if (dcc < bcd) { bcd = dcc; bestC = c3; } }
          if (bestC) { var dl = Math.hypot(bestC.x - px, bestC.y - py) || 1;
            ax += (bestC.x - px) / dl * 300; ay += (bestC.y - py) / dl * 300; }
        }
      }
      // 3) DRILL lane → step out perpendicular
      if (EF.drill) {
        var D = EF.drill, dxl = px - D.x, dyl = py - D.y;
        var proj = dxl * Math.cos(D.ang) + dyl * Math.sin(D.ang);
        var perp = -dxl * Math.sin(D.ang) + dyl * Math.cos(D.ang);
        if (Math.abs(perp) < D.half + 40 && proj > -80 && proj < D.len + 80) {
          var s = perp >= 0 ? 1 : -1;
          ax += -Math.sin(D.ang) * s * 260; ay += Math.cos(D.ang) * s * 260;
        }
      }
      // 4) EXHAUST CONE → sidestep the wedge
      if (EF.cone) {
        var C = EF.cone, dC = Math.hypot(px - C.x, py - C.y);
        if (dC < C.range + 50) {
          var diff = Phaser.Math.Angle.Wrap(Math.atan2(py - C.y, px - C.x) - C.ang);
          if (Math.abs(diff) < C.half + 0.3) {
            var sc = diff >= 0 ? 1 : -1;
            ax += -Math.sin(C.ang) * sc * 240; ay += Math.cos(C.ang) * sc * 240;
          }
        }
      }
      // 5) marked impact circles (press slam / scrap lob) → walk out
      (r._zoneWarns || []).forEach(function (w) {
        var dxw = px - w.x, dyw = py - w.y, dw = Math.hypot(dxw, dyw) || 1;
        if (dw < w.r + 30) { ax += dxw / dw * 220; ay += dyw / dw * 220; }
      });
      // 6) phase-1 arc ring → run radially away (it dies at maxR)
      if (EF.ring) {
        var R = EF.ring, dR = Math.hypot(px - R.x, py - R.y) || 1;
        if (R.r < dR + R.band && dR < R.maxR + 60) { ax += (px - R.x) / dR * 200; ay += (py - R.y) / dR * 200; }
      }
      // 7) enemy shots (phase-1 turrets) → light perpendicular dodge
      if (r.enemyShots) r.enemyShots.children.iterate(function (sh) {
        if (!sh || !sh.active) return;
        var dxs = px - sh.x, dys = py - sh.y, ds = Math.hypot(dxs, dys);
        if (ds < 130) { var va = Math.atan2(sh.body.velocity.y, sh.body.velocity.x);
          var pa = Math.atan2(dys, dxs);
          if (Math.abs(Phaser.Math.Angle.Wrap(va - pa)) < 0.5) { ax += -Math.sin(va) * 150; ay += Math.cos(va) * 150; } }
      });
      // 8) mobs (called adds) — avoid contact
      var nearMob = null, nmd = 1e9;
      r.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        var dm = Math.hypot(px - m.x, py - m.y);
        if (dm < nmd) { nmd = dm; nearMob = m; }
        if (dm < 150) { ax += (px - m.x) / (dm || 1) * 160; ay += (py - m.y) / (dm || 1) * 160; }
      });
      // 9) boss contact — keep distance
      if (b && b.active) {
        var dxb = px - b.x, dyb = py - b.y, db = Math.hypot(dxb, dyb) || 1;
        if (db < 230) { ax += dxb / db * 240; ay += dyb / db * 240; }
        // default: orbit the boss at ~300
        var radial = db > 340 ? -0.8 : (db < 260 ? 0.9 : 0);
        ax += (-dyb / db) * strafeSign * 110 + dxb / db * radial * 110;
        ay += (dxb / db) * strafeSign * 110 + dyb / db * radial * 110;
      }
      if (ax || ay) { var l = Math.hypot(ax, ay); i.moveX = ax / l; i.moveY = ay / l; }
      // stay inside the world (toroidal wrap would strand the bot far from the fight)
      if (px < 90) i.moveX = Math.abs(i.moveX) || 0.5; if (px > r.worldW - 90) i.moveX = -Math.abs(i.moveX) || -0.5;
      if (py < 90) i.moveY = Math.abs(i.moveY) || 0.5; if (py > r.worldH - 90) i.moveY = -Math.abs(i.moveY) || -0.5;
      // aim + fire: nearest threatening add, else the boss
      var target = (nearMob && nmd < 240) ? nearMob : (b && b.active ? b : null);
      if (target) { i.aimAngle = Math.atan2(target.y - py, target.x - px); i.firing = true; }
      i.ability = !!(b && b.active && Math.hypot(px - b.x, py - b.y) < 420 && r.player.state.mp > 60);
      return i;
    };
    return { hp: st.stats.hp, def: st.stats.def, spd: st.stats.spd,
             weaponDmg: SIM.weaponMod(CURRENT.equipment).dmg,
             bossHp: DATA.bosses.engineer.hp };
  })()`);
  console.log('white-gear ranger:', JSON.stringify(setup));

  // ---- drive on a synthetic clock ----
  await page.evaluate(`(function(){ if (game.loop.stop) game.loop.stop(); window.__vt = performance.now(); })()`);
  const CHUNK = 5000, chunks = Math.ceil(MAXS * 1000 / CHUNK);
  let done = false;
  for (let c = 0; c < chunks && !done; c++) {
    await page.evaluate(`(function(){
      var elapsed = 0;
      while (elapsed < ${CHUNK}) { window.__vt += 40; elapsed += 40; try { game.loop.step(window.__vt); } catch (e) {} }
    })()`);
    await sleep(0);
    const snap = await page.evaluate(`(function(){
      var r = ${scene('Realm')}, S = window.__SIM, st = r.player.state, b = r.boss;
      var phase = b && b.boss ? b.boss.phase : 0;
      if (phase === 2 && !S.p2Start) S.p2Start = r.time.now;
      var won = !!r.pendingLoot || (!b && S.p2Start) || (b && !b.active && b.boss && b.boss.phase2done);
      if (won && !S.killAt) S.killAt = r.time.now;
      return { t: Math.round((r.time.now - S.t0) / 1000), phase: phase,
               bossHp: b && b.active ? Math.round(b.boss.hp) : 0,
               resurrect: !!(b && b.boss && b.boss.resurrecting),
               vented: !!(b && b.boss && b.boss.ventedUntil && r.time.now < b.boss.ventedUntil),
               hp: st.hp, deaths: S.deaths.length, won: won };
    })()`);
    console.log(`t=${snap.t}s  phase=${snap.phase}${snap.resurrect ? '(transform)' : ''}${snap.vented ? '(VENTED)' : ''}  bossHp=${snap.bossHp}  playerHp=${snap.hp}  deaths=${snap.deaths}${snap.won ? '  *** BOSS DOWN ***' : ''}`);
    if (snap.won) done = true;
  }

  const rep = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, S = window.__SIM, st = r.player.state;
    var el = (r.time.now - S.t0) / 1000;
    var p1 = S.p2Start ? (S.p2Start - S.p1Start) / 1000 : el;
    var p2 = S.p2Start ? ((S.killAt || r.time.now) - S.p2Start) / 1000 : 0;
    return { won: !!S.killAt, elapsed: Math.round(el), p1: Math.round(p1), p2: Math.round(p2),
             deaths: S.deaths, dmg: S.dmg, hpMin: S.hpMin, hpMax: st.stats.hp,
             botDps: Math.round(S.bossDmg / el * 10) / 10 };
  })()`);
  console.log('\n===== FACTORY BOSS SIM (white T1, level ' + LEVEL + ') =====');
  console.log(`OUTCOME: ${rep.won ? 'VICTORY' : 'TIMEOUT/LOSS'} in ${rep.elapsed}s  (phase1 ${rep.p1}s · phase2 ${rep.p2}s)`);
  console.log(`deaths: ${rep.deaths.length}` + (rep.deaths.length ? '  →  ' + rep.deaths.map(d => d.t + 's by ' + d.by).join(' · ') : ''));
  console.log(`hp floor: ${rep.hpMin}/${rep.hpMax} · bot dps ${rep.botDps}`);
  console.log('damage by source:', Object.entries(rep.dmg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${Math.round(v)}`).join('  ') || 'none');
  await browser.close();
})();
