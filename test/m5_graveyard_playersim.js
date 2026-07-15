// M5.6 PLAYER SIM — drives a bot through THE GRAVEYARD in WHITE GEAR (tier 1)
// to answer: is the boss REACHABLE (quota pace) and SURVIVABLE (deaths/min)?
// The bot kites, avoids gas/grave-warns/wail-cones, breaks fences when stuck,
// grabs wisps, and fires at the nearest mob. Deaths revive on the spot (and
// are counted) so one run measures the whole difficulty curve.
// Usage: node test/m5_graveyard_playersim.js [seconds=120] [level=1]
const path = require('path');
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
const DURATION = parseInt(process.argv[2] || '120', 10);
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
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'graveyard' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);

  // ---- install the bot + instrumentation ----
  await page.evaluate(`(function(){
    var r = ${scene('Realm')};
    var st = r.player.state;
    // WHITE GEAR (tier 1) at the requested level (keep the equipment REF)
    CURRENT.equipment.weapon = 'w1'; CURRENT.equipment.ability = 'a1';
    CURRENT.equipment.armor = 'ar1'; CURRENT.equipment.ring = 'r1';
    st.level = ${LEVEL};
    st.stats = SIM.statsFor(DATA.classes[st.cls], st.level, CURRENT.potionsDrunk, CURRENT.equipment);
    st.hp = st.stats.hp; st.mp = st.stats.mp;

    var S = window.__SIM = { t0: r.time.now, dmg: {}, deaths: [], kills0: st.kills,
                             hpMin: st.hp, stuckSecs: 0, fencesBroken0: 0, samples: [] };
    // damage-by-source + death-counting wrapper (revive on the spot)
    var orig = Entities.hurtPlayer;
    Entities.hurtPlayer = function (scene2, p, dmg, time, src, fromBoss) {
      var s2 = p.state;
      if (!s2.alive || time - s2.lastHitAt < DATA.combat.iframesMs) return;
      var mit = SIM.incomingDmg(DATA.classes[s2.cls], dmg, !!fromBoss);
      var real = Math.max(DATA.combat.minDamage, mit - Math.floor(s2.stats.def));
      S.dmg[src || '?'] = (S.dmg[src || '?'] || 0) + real;
      if (s2.hp - real <= 0) {
        S.deaths.push({ t: Math.round((scene2.time.now - S.t0) / 1000), by: src || '?' });
        s2.hp = s2.stats.hp; s2.lastHitAt = time;      // revive, keep measuring
        return;
      }
      orig(scene2, p, dmg, time, src, fromBoss);
      if (s2.hp < S.hpMin) S.hpMin = s2.hp;
    };

    // ---- the BOT BRAIN: replaces rig.collect ----
    var lastX = r.player.x, lastY = r.player.y, stuckMs = 0, lastT = r.time.now;
    r.rig.collect = function (player) {
      var i = SIM.makeIntent();
      var now = r.time.now, dt = Math.min(100, now - lastT); lastT = now;
      var px = player.x, py = player.y;
      var ax = 0, ay = 0;                       // avoidance vector
      var best = null, bd = 1e9, nearCount = 0;
      r.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        var dx = px - m.x, dy = py - m.y, d = Math.hypot(dx, dy) || 1;
        if (d < bd) { bd = d; best = m; }
        if (d < 300) nearCount++;
        if (d < 180) { ax += dx / d * (180 - d); ay += dy / d * (180 - d); }
        // dodge a casting banshee's locked cone: move perpendicular to it
        if (m.mob.wailUntil && d < (m.mob.def.wail ? m.mob.def.wail.range + 30 : 300)) {
          var coneA = m.mob.wailDir || 0;
          var myA = Math.atan2(py - m.y, px - m.x);
          var diff = Phaser.Math.Angle.Wrap(myA - coneA);
          if (Math.abs(diff) < 0.8) { ax += -Math.sin(coneA) * 140 * Math.sign(diff || 1); ay += Math.cos(coneA) * 140 * Math.sign(diff || 1); }
        }
      });
      (r.gasPatches || []).forEach(function (g) {
        var dx = px - g.x, dy = py - g.y, d = Math.hypot(dx, dy) || 1;
        if (d < g.r + 34) { ax += dx / d * 120; ay += dy / d * 120; }
      });
      if (r.witching && r.witching.grave) {
        var gw = r.witching.grave, dx3 = px - gw.x, dy3 = py - gw.y, d3 = Math.hypot(dx3, dy3) || 1;
        if (d3 < 110) { ax += dx3 / d3 * 130; ay += dy3 / d3 * 130; }
      }
      // safe wisp pickup
      var wisp = null, wd = 240;
      (r.soulWisps || []).forEach(function (w) { var d4 = Math.hypot(w.x - px, w.y - py); if (d4 < wd && bd > 150) { wd = d4; wisp = w; } });

      if (ax || ay) { var l = Math.hypot(ax, ay); i.moveX = ax / l; i.moveY = ay / l; }
      else if (wisp) { var lw = Math.hypot(wisp.x - px, wisp.y - py) || 1; i.moveX = (wisp.x - px) / lw; i.moveY = (wisp.y - py) / lw; }
      else if (best && bd < 480) {
        // orbit the nearest mob at ~240 (strafe + range-keep)
        var dxo = best.x - px, dyo = best.y - py, dl = Math.hypot(dxo, dyo) || 1;
        var radial = dl > 280 ? 0.7 : (dl < 200 ? -1 : 0);
        i.moveX = (-dyo / dl) * 0.75 + (dxo / dl) * radial;
        i.moveY = (dxo / dl) * 0.75 + (dyo / dl) * radial;
        var l2 = Math.hypot(i.moveX, i.moveY) || 1; i.moveX /= l2; i.moveY /= l2;
      } else {
        // roam: head toward the portal if open, else the map middle
        var tx = r.bossPortal ? r.bossPortal.x : r.worldW / 2;
        var ty = r.bossPortal ? r.bossPortal.y : r.worldH * 0.5;
        var dl2 = Math.hypot(tx - px, ty - py) || 1;
        i.moveX = (tx - px) / dl2; i.moveY = (ty - py) / dl2;
      }
      // aim + fire: nearest mob in range, else the fence in the way when stuck
      var moved = Math.hypot(px - lastX, py - lastY);
      if ((i.moveX || i.moveY) && moved < 0.6) stuckMs += dt; else stuckMs = Math.max(0, stuckMs - dt * 2);
      lastX = px; lastY = py;
      if (stuckMs > 250) S.stuckSecs += dt / 1000;
      if (best && bd < 460) { i.aimAngle = Math.atan2(best.y - py, best.x - px); i.firing = true; }
      else if (stuckMs > 400) {
        // shoot the nearest fence panel roughly ahead
        var fp = null, fd = 200;
        (r.graveFences || []).forEach(function (f) { if (f.dead || !f.spr || !f.spr.active) return; var d5 = Math.hypot(f.spr.x - px, f.spr.y - py); if (d5 < fd) { fd = d5; fp = f.spr; } });
        if (fp) { i.aimAngle = Math.atan2(fp.y - py, fp.x - px); i.firing = true; }
        else { i.aimAngle = Math.atan2(i.moveY, i.moveX); i.firing = true; }
      }
      i.ability = (nearCount >= 5 && r.player.state.mp > 50);
      return i;
    };
    return { hp: st.stats.hp, def: st.stats.def, spd: st.stats.spd, dmgOut: SIM.weaponMod(CURRENT.equipment).dmg || 0 };
  })()`).then(s => console.log('white-gear ranger:', JSON.stringify(s)));

  // ---- drive: SYNTHETIC clock (faster than real-time). Stop the rAF auto-loop
  // and hand-step at a fixed 16ms dt so N game-seconds finish in a few real ones.
  await page.evaluate(`(function(){ if (game.loop.stop) game.loop.stop(); window.__vt = performance.now(); })()`);
  const CHUNK = 5000, chunks = Math.ceil(DURATION * 1000 / CHUNK);
  for (let c = 0; c < chunks; c++) {
    // one chunk = a tight SYNCHRONOUS step burst (no inner await — that hung)
    await page.evaluate(`(function(){
      var elapsed = 0;
      while (elapsed < ${CHUNK}) { window.__vt += 33; elapsed += 33; try { game.loop.step(window.__vt); } catch (e) {} }
    })()`);
    await sleep(0);   // yield to Node between chunks
    const snap = await page.evaluate(`(function(){
      var r = ${scene('Realm')}, S = window.__SIM, st = r.player.state;
      var far = 0, near = 0, alive = 0;
      r.mobs.children.iterate(function(m){ if(!m||!m.active) return; alive++;
        var d = Math.hypot(m.x - r.player.x, m.y - r.player.y); if (d > 520) far++; if (d < 300) near++; });
      var fBroken = (r.graveFences||[]).filter(function(f){return f.dead;}).length;
      S.samples.push({ t: Math.round((r.time.now - S.t0)/1000), kills: st.kills, hp: st.hp, alive: alive, far: far, fBroken: fBroken });
      return S.samples[S.samples.length-1];
    })()`);
    console.log(`t=${snap.t}s  kills=${snap.kills}  hp=${snap.hp}  mobsAlive=${snap.alive} (far ${snap.far})  fencesBroken=${snap.fBroken}`);
  }

  // ---- report ----
  const rep = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, S = window.__SIM, st = r.player.state;
    var el = (r.time.now - S.t0) / 1000;
    var dmgTot = 0; for (var k in S.dmg) dmgTot += S.dmg[k];
    return { elapsed: Math.round(el), kills: st.kills - S.kills0, kpm: Math.round((st.kills - S.kills0) / el * 600) / 10,
             quota: DATA.realm.killQuota, deaths: S.deaths, dmg: S.dmg, dmgPerMin: Math.round(dmgTot / el * 60),
             hpMax: st.stats.hp, stuckSecs: Math.round(S.stuckSecs), portal: !!r.bossPortal };
  })()`);
  console.log('\n===== PLAYER-SIM REPORT (white gear, level ' + LEVEL + ') =====');
  console.log(`elapsed ${rep.elapsed}s · kills ${rep.kills} (${rep.kpm}/min) · quota ${rep.quota} → projected ${rep.kpm > 0 ? Math.round(rep.quota / rep.kpm) : '∞'} min to portal`);
  console.log(`deaths: ${rep.deaths.length}` + (rep.deaths.length ? '  →  ' + rep.deaths.map(d => d.t + 's by ' + d.by).join(' · ') : ''));
  console.log(`incoming: ${rep.dmgPerMin} dmg/min vs pool ${rep.hpMax} HP`);
  console.log('by source:', Object.entries(rep.dmg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${Math.round(v)}`).join('  '));
  console.log(`stuck-on-walls seconds: ${rep.stuckSecs} · bossPortal open: ${rep.portal}`);
  await browser.close();
})();
