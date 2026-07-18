// M9 VAMPIRE CASTLE verification suite — realm 7, registry map 3.
// Registry/data · the 3/4 THE LAST WALTZ · layout · THE BLOOD MOON COURT
// (beams empower mobs + burn you · the waltz drift · chandelier crashes) ·
// the 7 mapVerbs (incl. ANIMATED ARMOR reassembly) · THE PALE KING:
// gate-smash entrance, lance lanes, blood-moon vent, kill → chest.
const { chromium } = require('playwright');

const GAME = 'file://' + require('path').resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) {
  step++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`);
  if (!ok) failures++;
}
const scene = (k) => `game.scene.getScene('${k}')`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const sleep = (ms) => page.waitForTimeout(ms);

  // -- 1. boot: registry + the 3/4 theme ----------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.castle, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.paleking;
    return { def: !!MAPS.defs.castle, roster: DATA.biomes.castle.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'castle' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 8-mob roster + console unlock', reg.def && reg.roster === 8 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('THE LAST WALTZ: true 3/4 (450 beats), equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 450 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ---------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'castle' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas;
    return { id: r.realmId, chands: C.chandeliers.length, portraits: C.portraits.length,
             gate: !!C.gate, court: !!C.court };})()`);
  check('castle scene: 3 chandeliers + portrait walls + the arena gate + the court',
    realm.id === 'castle' && realm.chands === 3 && realm.portraits === 3 && realm.gate && realm.court);

  // -- 3. stand the ambient court down (suite fixture rule) -----------------------
  await page.evaluate(`(function(){var C=${scene('Realm')}._cas.court;
    C.nextBeamAt = Infinity; C.waltz.nextAt = Infinity;})()`);

  // -- 4. CRIMSON BEAM: empowers mobs, burns the player ---------------------------
  const beam = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas, p=r.player;
    var cfg = r.realmDef.bloodMoon.beams;
    // synthesize a beam mid-sweep over the ballroom
    var g = r.add.graphics();
    C.court.beams.push({ x0: r.worldW * 0.7, x1: r.worldW * 0.7, y0: r.worldH * 0.36, y1: r.worldH * 0.64,
                         startAt: r.time.now - 100, until: r.time.now + 3000, g: g, lastBurnAt: 0 });
    var m = Entities.spawnMob(r, 'direRats', r.worldW * 0.7, r.worldH * 0.5);
    m.mob._packInit = true;
    p.body.reset(r.worldW * 0.7, r.worldH * 0.55);
    var hp0 = p.state.hp;
    CASTLE_SCENE.update(r, r.time.now, 16);
    var out = { empowered: m.mob.empowered === true, burned: p.state.hp < hp0 };
    C.court.beams.forEach(function(B){ B.g.destroy(); }); C.court.beams = [];
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.5, r.worldH * 0.93); p.state.hp = hp0;
    return out;})()`);
  check('a mob inside the beam is EMPOWERED; the player takes the burn', beam.empowered && beam.burned);

  // -- 5. THE WALTZ: synchronized drift + chandelier crashes at the peak ----------
  const waltz = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas;
    var m = Entities.spawnMob(r, 'direRats', r.worldW * 0.5, r.worldH * 0.5);
    m.mob._packInit = true;
    var x0 = m.x, y0 = m.y;
    C.court.waltz.until = r.time.now + 1000;               // surge live now
    CASTLE_SCENE.update(r, r.time.now, 100);
    var drifted = (m.x !== x0 || m.y !== y0);
    C.court.waltz.until = 0;
    // crash at the peak: zones bloom under all 3 chandeliers
    var z0 = C.zones.length;
    C.court.waltz.crashAt = 1;
    CASTLE_SCENE.update(r, r.time.now, 16);
    var crashes = C.zones.length - z0;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { drifted: drifted, crashes: crashes, down: C.chandeliers.every(function(c){ return c.down; }) };})()`);
  check('the WALTZ drifts the court in step', waltz.drifted);
  check('at the waltz peak all 3 CHANDELIERS mark their crash circles', waltz.crashes === 3 && waltz.down);

  // -- 6. mapVerbs: gargoyle · halberd · phantom · leech · armor · duelist --------
  const verbs = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas, p=r.player;
    var out = {};
    // GARGOYLE: perched = HARDENED refund (damage halved, not immune)
    var g = Entities.spawnMob(r, 'gargoyle', p.x + 300, p.y);
    Entities.updateMob(r, g, p, r.time.now);                 // arms the perch
    g.mob.perchUntil = r.time.now + 9999;
    var hp0 = g.mob.hp;
    Entities.hurtMob(r, g, 40, r.time.now);
    Entities.updateMob(r, g, p, r.time.now);                 // the refund lands next frame
    out.hardened = g.mob.hp > hp0 - 40 && g.mob.hp < hp0;
    // HALBERD: thrust lane telegraph
    var h = Entities.spawnMob(r, 'halberdGuard', p.x + 100, p.y);
    h.mob.nextThrustAt = 1;
    var l0 = C.lanes.length;
    Entities.updateMob(r, h, p, r.time.now);
    out.thrust = C.lanes.length === l0 + 1;
    // PHANTOM: first frame emerges AT a portrait wall
    var ph = Entities.spawnMob(r, 'portraitPhantom', p.x + 100, p.y + 50);
    Entities.updateMob(r, ph, p, r.time.now);
    out.phantom = C.portraits.some(function(P0){ return Math.hypot(ph.x - P0.x, ph.y - P0.y) < 4; });
    // INITIATE: fires a leech bolt; when it dies on you, he drinks
    var v = Entities.spawnMob(r, 'vampInitiate', p.x + 120, p.y);
    v.mob.nextShotAt = 1;
    Entities.updateMob(r, v, p, r.time.now);
    out.leechFired = C.leech.length === 1;
    v.mob.hp = 10;
    var L = C.leech[0];
    L.sx = p.x; L.sy = p.y;                                  // shot resolved ON the player
    Entities.killProjectile(r.enemyShots, L.shot);
    CASTLE_SCENE.update(r, r.time.now, 16);
    out.leechHealed = v.mob.hp > 10;
    // DUELIST: orbits (owns movement), then telegraphs a rapier line
    var d = Entities.spawnMob(r, 'crimsonDuelist', p.x + 150, p.y);
    Entities.updateMob(r, d, p, r.time.now);
    out.orbit = Math.abs(d.body.velocity.x) + Math.abs(d.body.velocity.y) > 0;
    d.mob.nextLungeAt2 = 1;
    var l1 = C.lanes.length;
    Entities.updateMob(r, d, p, r.time.now);
    out.rapier = C.lanes.length === l1 + 1 && d.mob.lungeAt2 > r.time.now;
    [g, h, ph, v, d].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = []; C.leech = [];
    return out;})()`);
  check('GARGOYLE perch is HARDENED (resist, not immunity)', verbs.hardened);
  check('HALBERD GUARD telegraphs a thrust lane', verbs.thrust);
  check('PORTRAIT PHANTOM emerges from a portrait wall', verbs.phantom);
  check('VAMPIRE INITIATE leech bolt heals him when it lands', verbs.leechFired && verbs.leechHealed);
  check('CRIMSON DUELIST strafes (owns movement) + telegraphs rapier lines', verbs.orbit && verbs.rapier);

  // -- 7. ANIMATED ARMOR: split → pieces crawl together → REASSEMBLES at 40% ------
  const armor = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas, p=r.player;
    return new Promise(function(res){
      var a = Entities.spawnMob(r, 'animatedArmor', p.x + 200, p.y);
      Entities.hurtMob(r, a, 99999, r.time.now);             // death → split (queued)
      r.drainSpawnQueue ? r.drainSpawnQueue() : null;
      setTimeout(function(){
        var pieces = [];
        r.mobs.children.iterate(function(m){ if (m && m.active && m.mob && m.mob.def === DATA.mobs.armorPiece) pieces.push(m); });
        var out = { pieces: pieces.length };
        // run their crawl + force the group old enough, huddle them together
        pieces.forEach(function(m){ Entities.updateMob(r, m, p, r.time.now); });
        pieces.forEach(function(m){ m.body.reset(p.x + 200, p.y); });
        Object.keys(C.grps).forEach(function(k){ C.grps[k].bornAt = 1; });
        CASTLE_SCENE.update(r, r.time.now, 16);              // reassembly check
        r.drainSpawnQueue ? r.drainSpawnQueue() : null;
        setTimeout(function(){
          CASTLE_SCENE.update(r, r.time.now, 16);            // hp fix pass
          var reborn = null;
          r.mobs.children.iterate(function(m){ if (m && m.active && m.mob && m.mob.def === DATA.mobs.armorReborn) reborn = m; });
          out.reborn = !!reborn;
          out.at40 = reborn ? Math.abs(reborn.mob.hp - Math.ceil(DATA.mobs.armorReborn.hp * (reborn.mob.hpMult || 1) * 0.4)) <= 1 : false;
          if (reborn) { Entities.clearNameTag(reborn); reborn.body.enable = false; r.mobs.killAndHide(reborn); }
          res(out);
        }, 120);
      }, 120);
    });})()`);
  check('armor DEATH bursts into crawling pieces', armor.pieces === 3, armor.pieces + ' pieces');
  check('pieces together → the armor REASSEMBLES at 40% HP', armor.reborn && armor.at40);

  // -- 8. court clocks shift through unfreeze() ------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas;
    C.court.nextBeamAt = r.time.now + 5000;
    C.court.waltz.nextAt = r.time.now + 6000;
    C.chandeliers[0].rehoistAt = r.time.now + 7000;
    var before = { b: C.court.nextBeamAt, w: C.court.waltz.nextAt, c: C.chandeliers[0].rehoistAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { b: C.court.nextBeamAt - before.b, w: C.court.waltz.nextAt - before.w, c: C.chandeliers[0].rehoistAt - before.c };
      C.court.nextBeamAt = Infinity; C.court.waltz.nextAt = Infinity;
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts beam/waltz/chandelier clocks', shift.b > 500 && shift.w > 500 && shift.c > 500);

  // -- 9. quota → GATE-SMASH entrance (the first lance pass IS the arrival) --------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'direRats', r.player.x + 60, r.player.y);
    m.mob._packInit = true;
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cas;
    return { key: r.boss.boss.key, inArena: r.boss.y > C.arena.y0 && r.boss.y < C.arena.y1,
             wide: r.boss.body.width * r.boss.scaleX > 60,
             gateSmashed: C.gate.y < r.worldH * 0.035 - 10 || C.gate.alpha < 0.9 };})()`);
  check('THE PALE KING smashes through the gate into the lists (wide mounted body)',
    boss.key === 'paleking' && boss.inArena && boss.wide && boss.gateSmashed);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 10. LANCE PASS lanes + BLOOD MOON JOUST vent --------------------------------
  const kit = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss;
    bs.busyUntil = 0; bs.nextPassAt = 1;
    bs.nextCarouselAt = bs.nextTiltAt = bs.nextTrampleAt = bs.nextSweepAt = bs.nextMoonAt = bs.nextAddsAt = r.time.now + 99999;
    CASTLE_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var began = !!bs.pass && bs.pass.lanes.length >= 1;
    // resolve the pass instantly
    if (bs.pass) { bs.pass.at = 1; for (var i = 0; i < 80 && bs.pass; i++) CASTLE_SCENE.bossUpdate(r, b, r.player, r.time.now + i * 20); }
    return { began: began, done: !bs.pass };})()`);
  check('LANCE PASS: the lane flashes, he thunders down it, the verb resolves', kit.began && kit.done);
  const moon = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, C=r._cas;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextMoonAt = 1; bs.nextPassAt = r.time.now + 99999;
    CASTLE_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var sweeping = !!C.moon && bs.rootUntil > r.time.now;
    C.moon.until = 1;                                        // fast-forward the sweep
    CASTLE_SCENE.update(r, r.time.now, 16);
    return { sweeping: sweeping, vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult };})()`);
  check('BLOOD MOON JOUST sweeps, then the horse REARS — vented ×1.5', moon.sweeping && moon.vented && moon.mult === 1.5);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 11. kill → chest -------------------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  check('the Pale King falls → chest/loot flow', true);

  // -- 12. zero console errors -------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
