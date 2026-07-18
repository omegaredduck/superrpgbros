// M7 STORM SKY ISLES verification suite — realm 5, the first REGISTRY map.
// Runs the real game headless: registry routing · console/bestiary wiring ·
// the 8-mob roster (incl. the three NEW mapVerbs) · mist slow (floaters
// exempt) · toroidal wrap · TEMPEST CYCLE clocks through unfreeze() ·
// NIMBUS TALON growing-shadow entrance + telegraphed kit + vent window.
// Fails on ANY console error.
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

  // -- 1. boot → registry + data rows installed --------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.skyisles, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (beats === 0) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    return { def: !!MAPS.defs.skyisles, realm: !!DATA.realms.skyisles,
             roster: DATA.biomes.skyisles.mobs.length, boss: !!DATA.bosses.nimbustalon,
             mapOwned: DATA.bosses.nimbustalon.mapOwned === true,
             noFiller: !DATA.bosses.nimbustalon.patterns.radial && !DATA.bosses.nimbustalon.patterns.stream,
             hints: DATA.bosses.nimbustalon.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'skyisles' && !x.locked; }),
             table: !!DATA.dropTables.nimbustalon,
             musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + realm/biome/boss/dropTable rows installed', reg.def && reg.realm && reg.boss && reg.table);
  check('roster is EXACTLY the 8 picks; boss is mapOwned with NO radial/stream filler',
    reg.roster === 8 && reg.mapOwned && reg.noFiller);
  check('scouter hints ≤6 (boss contract)', reg.hints <= 6, reg.hints + ' hints');
  check('SKYBREAKER MARCH: equal-beat tracks, EXACTLY 180.0s', reg.equalBeats && Math.abs(reg.musicSec - 180) < 1e-9, reg.musicSec + 's');
  check('portal machine lists STORM SKY ISLES unlocked', reg.consoleRow);

  // -- 2. bestiary follows the selected map ------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  const beast = await page.evaluate(`(function(){var nx=${scene('Nexus')};
    nx.consoleSetMap('skyisles');
    var e = nx.bestiaryEntries();
    var mobs = e.filter(function(x){ return x.kind === 'mob'; }).map(function(x){ return x.key; });
    var bosses = e.filter(function(x){ return x.kind === 'boss'; }).map(function(x){ return x.key; });
    return { n: e.length, expected: DATA.biomes.skyisles.mobs.length + 1,
             hasRay: mobs.indexOf('cloudRay') >= 0, hasRoc: mobs.indexOf('rocHatchling') >= 0,
             hasTalon: bosses.indexOf('nimbustalon') >= 0 };})()`);
  // M7k: the bestiary is BY MAP now — the scoped book lists the realm's roster
  // + the realm's OWN boss(es), not every boss known to the game.
  check('bestiary re-scopes to the skyisles roster + its boss', beast.n === beast.expected && beast.hasRay && beast.hasRoc && beast.hasTalon);

  // -- 3. realm routing: registry map owns the terrain -------------------------
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'skyisles' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { id: r.realmId, hasSky: !!r._sky, isles: r._sky.isles.length, shards: r._sky.shards.length,
             bridges: r._sky.bridges.length, rods: r._sky.rods.length, banks: r._sky.banks.length,
             spawnOnLand: (function(){ var S = r._sky, p = r.player, on = false;
               S.isles.forEach(function(I){ if (((p.x-I.x)*(p.x-I.x))/(I.rx*I.rx) + ((p.y-I.y)*(p.y-I.y))/(I.ry*I.ry) <= 1) on = true; });
               return on; })() };})()`);
  check('skyisles scene: 7 isles + 8 shards + 7 bridges + 4 rods + cloud banks',
    realm.id === 'skyisles' && realm.hasSky && realm.isles === 7 && realm.shards === 8 &&
    realm.bridges === 7 && realm.rods === 4 && realm.banks === 5);
  check('you spawn ON the spawn isle (the sky dock)', realm.spawnOnLand);

  // -- 4. stand the ambient cycle down (suite fixture rule) --------------------
  await page.evaluate(`(function(){var T=${scene('Realm')}._sky.tempest;
    T.windAt = Infinity; T.strikeAt = Infinity; T.ventAt = Infinity; T.eye.retargetAt = Infinity;})()`);

  // -- 5. MIST SLOW: mist multiplies speed down; floaters exempt ----------------
  const mist = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._sky, p=r.player;
    // park the player in open mist and push a constant velocity through one frame
    var mx = r.worldW * 0.42, my = r.worldH * 0.72;  // open mist west of the spawn bridge
    var onLand = false;
    S.isles.concat(S.shards).forEach(function(I){ if (((mx-I.x)*(mx-I.x))/(I.rx*I.rx) + ((my-I.y)*(my-I.y))/(I.ry*I.ry) <= 1.2) onLand = true; });
    S.bridges.forEach(function(B){ var dx=B.x1-B.x0, dy=B.y1-B.y0, L2=dx*dx+dy*dy,
      t=Math.max(0,Math.min(1,((mx-B.x0)*dx+(my-B.y0)*dy)/L2));
      if (Math.hypot(mx-(B.x0+dx*t), my-(B.y0+dy*t)) < B.half) onLand = true; });
    return { spotIsMist: !onLand, slowMult: S.slowMult };})()`);
  check('the test spot is open mist (fixture sanity)', mist.spotIsMist);
  const slow = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._sky, p=r.player;
    p.body.reset(r.worldW * 0.42, r.worldH * 0.72);
    p.body.velocity.x = 100; p.body.velocity.y = 0;
    SKYISLES_SCENE.update(r, r.time.now, 16);
    var mistV = p.body.velocity.x;
    p.body.reset(S.isles[0].x, S.isles[0].y);          // back onto the spawn isle
    p.body.velocity.x = 100; p.body.velocity.y = 0;
    SKYISLES_SCENE.update(r, r.time.now, 16);
    var landV = p.body.velocity.x;
    return { mistV: mistV, landV: landV };})()`);
  check('mist multiplies the player mover down; land does not',
    Math.abs(slow.mistV - 100 * mist.slowMult) < 2 && Math.abs(slow.landV - 100) < 2,
    'mist ' + slow.mistV.toFixed(0) + ' vs land ' + slow.landV.toFixed(0));
  const floater = await page.evaluate(`(function(){var r=${scene('Realm')};
    var ray = Entities.spawnMob(r, 'cloudRay', r.worldW * 0.42, r.worldH * 0.72);
    var walker = Entities.spawnMob(r, 'stormSprite', r.worldW * 0.42 + 30, r.worldH * 0.72);
    ray.body.velocity.x = 100; ray.body.velocity.y = 0;
    walker.body.velocity.x = 100; walker.body.velocity.y = 0;
    SKYISLES_SCENE.update(r, r.time.now, 16);
    var out = { rayV: ray.body.velocity.x, walkerV: walker.body.velocity.x };
    Entities.clearNameTag(ray); ray.body.enable = false; r.mobs.killAndHide(ray);
    Entities.clearNameTag(walker); walker.body.enable = false; r.mobs.killAndHide(walker);
    return out;})()`);
  check('floaters (Cloud Ray) cross the mist at full speed; walkers slow',
    Math.abs(floater.rayV - 100) < 2 && floater.walkerV < 70,
    'ray ' + floater.rayV.toFixed(0) + ' vs sprite ' + floater.walkerV.toFixed(0));

  // -- 6. TOROIDAL WRAP: off one edge, on the other (velocity preserved) -------
  const wrap = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(-8, r.worldH * 0.5); p.body.velocity.x = -50;
    SKYISLES_SCENE.update(r, r.time.now, 16);
    var xAfter = p.x, vx = p.body.velocity.x;
    p.body.reset(r.worldW * 0.5, r.worldH * 0.5);
    return { xAfter: xAfter, vx: vx };})()`);
  check('wrap: player off the west edge reappears east, velocity preserved (mist-scaled)',
    wrap.xAfter > 2000 && wrap.vx <= -25 && wrap.vx >= -51, 'x=' + Math.round(wrap.xAfter) + ' vx=' + wrap.vx.toFixed(1));

  // -- 7. the 3 NEW mapVerbs (registry mobVerbs table through the core hook) ---
  const verbs = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(r._sky.isles[1].x, r._sky.isles[1].y);   // crosswinds, on land
    var out = {};
    // CLOUD RAY MARK: force the cadence, expect a telegraphed zone
    var ray = Entities.spawnMob(r, 'cloudRay', p.x + 80, p.y);
    ray.mob.nextMarkAt = 1;
    var zBefore = r._sky.zones.length;
    Entities.updateMob(r, ray, p, r.time.now);
    out.rayZone = r._sky.zones.length === zBefore + 1;
    out.rayWarnListed = r._zoneWarns.length > 0;
    // GOLEM SHOVE: in contact range, expect a positional toss on the scene
    var gol = Entities.spawnMob(r, 'nimbusGolem', p.x + 30, p.y);
    gol.mob.nextShoveAt = 1;
    Entities.updateMob(r, gol, p, r.time.now);
    out.shoved = !!r._sky.toss && Math.abs(r._sky.toss.vx) > 0;
    r._sky.toss = null;
    // ROC BELLY-FLOP: cadence forced → hop state + a telegraphed zone; body off mid-hop
    var roc = Entities.spawnMob(r, 'rocHatchling', p.x + 100, p.y);
    roc.mob.nextFlopAt = 1;
    var z2 = r._sky.zones.length;
    Entities.updateMob(r, roc, p, r.time.now);
    out.flopping = !!roc.mob.flop && !roc.body.enable && r._sky.zones.length === z2 + 1;
    // clear the fixtures + pending zones
    [ray, gol, roc].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    r._sky.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); });
    r._sky.zones = []; r._zoneWarns.length = 0;
    return out;})()`);
  check('CLOUD RAY marks a strike circle (mapVerb via the core hook)', verbs.rayZone && verbs.rayWarnListed);
  check('NIMBUS GOLEM contact SHOVE tosses the player (positional)', verbs.shoved);
  check('ROC HATCHLING hops airborne (body off) + telegraphs its flop circle', verbs.flopping);

  // -- 8. TEMPEST clocks shift through unfreeze() -------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, T=r._sky.tempest;
    T.windAt = r.time.now + 5000; T.strikeAt = r.time.now + 6000; T.ventAt = r.time.now + 7000;
    T.eye.retargetAt = r.time.now + 8000;
    r._sky.zones.push({ x: 0, y: 0, r: 10, at: r.time.now + 3000, dmg: 0, src: 't', ring: null });
    var before = { w: T.windAt, s: T.strikeAt, v: T.ventAt, e: T.eye.retargetAt, z: r._sky.zones[0].at };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { w: T.windAt - before.w, s: T.strikeAt - before.s, v: T.ventAt - before.v,
                 e: T.eye.retargetAt - before.e, z: r._sky.zones[0].at - before.z };
      r._sky.zones = [];
      T.windAt = Infinity; T.strikeAt = Infinity; T.ventAt = Infinity; T.eye.retargetAt = Infinity;
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts wind/strike/vent/eye/zone clocks by the paused time',
    shift.w > 500 && shift.s > 500 && shift.v > 500 && shift.e > 500 && shift.z > 500,
    '+' + Math.round(shift.w) + 'ms');

  // -- 9. quota → portal → GROWING-SHADOW entrance → NIMBUS TALON --------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'stormSprite', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  const portal = await page.evaluate(`(function(){var r=${scene('Realm')}; return !!r.bossPortal;})()`);
  check('kill quota opens the boss portal', portal);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  // the growing-shadow entrance runs ~3s before the boss lands + scouter shows
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { key: r.boss.boss.key, atNest: Math.hypot(r.boss.x - r._sky.nest.x, r.boss.y - r._sky.nest.y) < 40,
             dark: !!r._sky.dark, eyeParked: Math.hypot(r._sky.tempest.eye.tx - r._sky.nest.x, r._sky.tempest.eye.ty - r._sky.nest.y) < 5 };})()`);
  check('NIMBUS TALON lands ON the roc nest after the shadow grows', boss.key === 'nimbustalon' && boss.atNest);
  check('the arena darkens + the storm eye parks over the Roost', boss.dark && boss.eyeParked);
  await page.keyboard.press('Enter');                     // dismiss the scouter
  await sleep(250);

  // -- 10. the kit: skyfall paints circles · rod overload roots + VENTS --------
  const kit = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss;
    var out = {};
    // force SKYFALL now
    bs.busyUntil = 0; bs.nextSkyfallAt = 1; bs.nextGaleAt = bs.nextSlamAt = bs.nextDiveAt = bs.nextRodAt = bs.nextAddsAt = r.time.now + 99999;
    var z0 = r._sky.zones.length;
    SKYISLES_SCENE.bossUpdate(r, b, r.player, r.time.now);
    out.skyfall = r._sky.zones.length - z0;
    out.skyfallBossTagged = r._sky.zones.slice(z0).every(function(z){ return z.fromBoss === true; });
    r._sky.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); r._sky.zones = []; r._zoneWarns.length = 0;
    return out;})()`);
  check('SKYFALL paints 5 warned circles, ALL tagged fromBoss', kit.skyfall === 5 && kit.skyfallBossTagged);
  const rod = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss;
    bs.busyUntil = 0; bs.nextRodAt = 1; bs.nextSkyfallAt = r.time.now + 99999;
    SKYISLES_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var charging = !!bs.rod && bs.rootUntil > r.time.now;
    // fast-forward the sequence: pop all 4 rods
    for (var i = 0; i < 4; i++) { bs.rod.nextAt = 1; SKYISLES_SCENE.bossUpdate(r, b, r.player, r.time.now); }
    return { charging: charging, spent: !bs.rod, vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult };})()`);
  check('ROD OVERLOAD roots him; all 4 rods fire in sequence', rod.charging && rod.spent);
  check('afterward he VENTS — ×1.5 damage window (core hurtBoss reads it)', rod.vented && rod.mult === 1.5);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp;
    Entities.hurtBoss(r, b, 100);
    return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 11. adds ride queueSpawn; kill the boss → chest + realm closes -----------
  const adds = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss;
    bs.ventedUntil = 0; bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextAddsAt = 1; bs.nextSkyfallAt = bs.nextGaleAt = bs.nextSlamAt = bs.nextDiveAt = bs.nextRodAt = r.time.now + 99999;
    var q0 = r._spawnQueue.length;
    SKYISLES_SCENE.bossUpdate(r, b, r.player, r.time.now);
    return r._spawnQueue.length - q0;})()`);
  check('STORM-ELEMENTAL ADDS queue through queueSpawn (3 sprites + a vane)', adds === 4, adds + ' queued');
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const closed = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { chest: !!r.chest || !!r.pendingLoot, darkGone: !r._sky.dark };})()`);
  check('boss down → chest/loot flow; the fight darkness clears', closed.chest && closed.darkGone);

  // -- 12. zero console errors ---------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
