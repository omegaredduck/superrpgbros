// M3 headless verification suite — MAP BUILDER + map-driven realms (Lane C):
// builder opens from the nexus · paint/erase/rect across layers · object layer
// (start/zones/arena) · save to localStorage · export/import JSON round-trip ·
// playtest loads the painted map · default realm runs on the built-in realm1 ·
// walls get bodies, block shots, and exclude spawns · boss arena delivery.
// Fails on ANY console error.
const { chromium } = require('playwright');
const path = require('path');

const GAME = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) {
  step++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`);
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const scene = (k) => `game.scene.getScene('${k}')`;
  const sleep = (ms) => page.waitForTimeout(ms);

  // -- 1. boot → new game → nexus → M opens the builder ------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`${scene('Title')}.chooseSlot(1)`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.keyboard.press('m');
  await page.waitForFunction(`game.scene.isActive('Builder')`, null, { timeout: 5000 });
  const opened = await page.evaluate(`(function(){var b=${scene('Builder')};
    return { id: b.map.id, valid: MAPS.validate(b.map), chunks: b.mapRender.images.length,
             ui: b.ui.length > 10 };})()`);
  check('M in the nexus opens the builder on the default map', opened.id === 'realm1' && opened.valid);
  check('builder rendered chunked map + UI panel', opened.chunks === 25 && opened.ui, opened.chunks + ' chunks');

  // -- 2. fresh blank map, paint / rect / erase across layers --------------------------
  const paint = await page.evaluate(`(function(){var b=${scene('Builder')};
    b.newMap();                                            // custom1 — leaves realm1 untouched
    b.setLayer('ground'); b.sel.ground = 't_dirt'; b.tool='paint';
    b.applyAt(5, 5);
    var out = {};
    out.painted = MAPS.tileAt(b.map, 'ground', 5, 5) === MAPS.charFor(b.map, 't_dirt');
    b.applyRect({ tx: 10, ty: 10, tw: 6, th: 4 });         // rect fill
    out.rect = MAPS.tileAt(b.map,'ground',10,10) === MAPS.charFor(b.map,'t_dirt') &&
               MAPS.tileAt(b.map,'ground',15,13) === MAPS.charFor(b.map,'t_dirt');
    b.setLayer('walls'); b.sel.walls = 't_rock';
    b.applyAt(20, 20);
    out.wall = MAPS.isWall(b.map, 20, 20);
    b.tool = 'erase'; b.applyAt(20, 20);
    out.erased = !MAPS.isWall(b.map, 20, 20);
    b.applyAt(21, 20);                                     // stays erased (was empty)
    b.tool = 'paint'; b.sel.walls = 't_hedge';
    b.applyRect({ tx: 30, ty: 8, tw: 1, th: 10 });         // a hedge line for the shot test
    out.hedge = MAPS.isWall(b.map, 30, 12);
    return out;})()`);
  check('paint places a ground tile', paint.painted);
  check('rect tool fills a region', paint.rect);
  check('walls layer paints + erases', paint.wall && paint.erased && paint.hedge);

  // -- 3. object layer: start, spawn zone, boss arena -----------------------------------
  const objects = await page.evaluate(`(function(){var b=${scene('Builder')};
    b.setLayer('objects'); b.tool='paint';
    b.sel.objects='start'; b.objectDown({ tx: 50, ty: 50 });
    b.sel.objects='zone';  b.objectRect({ tx: 60, ty: 60, tw: 10, th: 10 });
    b.sel.objects='arena'; b.objectRect({ tx: 100, ty: 100, tw: 20, th: 20 });
    var o = b.map.objects;
    return { start: o.playerStart && o.playerStart.tx === 50,
             zones: o.spawnZones.length === 1, arena: !!o.bossArena,
             marker: b.startImg.visible };})()`);
  check('object layer: player start + spawn zone + boss arena placed',
    objects.start && objects.zones && objects.arena && objects.marker);

  // -- 4. save → localStorage · export/import round-trip --------------------------------
  const persisted = await page.evaluate(`(function(){var b=${scene('Builder')};
    b.saveMap();
    var store = JSON.parse(localStorage.getItem('srb_maps') || '{}');
    var json = MAPS.exportJson(b.map);
    var r = MAPS.importJson(json);
    var bad = MAPS.importJson('{"nope":1}');
    return { saved: !!store.custom1, dirty: b.dirty,
             rt: r.ok && r.map.id === 'custom1' && r.map.objects.spawnZones.length === 1,
             rejects: !bad.ok };})()`);
  check('SAVE writes the map to localStorage (srb_maps)', persisted.saved && !persisted.dirty);
  check('export → import round-trips; junk JSON rejected', persisted.rt && persisted.rejects);

  // -- 5. playtest: the painted map IS the realm ------------------------------------------
  await page.evaluate(`${scene('Builder')}.playtest()`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(300);
  const played = await page.evaluate(`(function(){var r=${scene('Realm')};
    var T = MAPS.TILE;
    return { id: r.map.id, mode: r.mode,
             startX: Math.abs(r.player.x - 50.5*T) < 2, startY: Math.abs(r.player.y - 50.5*T) < 2,
             bounds: r.physics.world.bounds.width === r.map.w * T,
             walls: r.wallBodies.getLength() > 0 };})()`);
  check('playtest starts a realm ON the painted map', played.id === 'custom1' && played.mode === 'clear');
  check('player spawns at the painted PLAYER START', played.startX && played.startY);
  check('world bounds match the map; wall bodies built', played.bounds && played.walls);

  // -- 6. spawn zones drive the director ----------------------------------------------------
  const zoned = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.startedAt = r.time.now - 30000;                      // unlock spitter-era spawns
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.directorSpend(); r.directorSpend();
    var T = MAPS.TILE, inZone = 0, total = 0;
    r.mobs.children.iterate(function(m){ if (!m || !m.active) return; total++;
      var tx = m.x / T, ty = m.y / T;
      if (tx >= 60 && tx <= 70 && ty >= 60 && ty <= 70) inZone++; });
    return { total: total, inZone: inZone };})()`);
  check('mobs pour from the painted SPAWN ZONE', zoned.total > 0 && zoned.inZone === zoned.total,
    zoned.inZone + '/' + zoned.total);

  // -- 7. boss arena: the fight is delivered to the painted room ----------------------------
  const arena = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.startBossFight();
    var T = MAPS.TILE, A = r.map.objects.bossArena;
    var inside = function(o){ return o.x >= A.tx*T && o.x <= (A.tx+A.tw)*T &&
                                     o.y >= A.ty*T && o.y <= (A.ty+A.th)*T; };
    return { scan: r.scanning, boss: inside(r.boss), player: inside(r.player) };})()`);
  check('boss fight teleports to the arena (boss centered, player at the edge)', arena.boss && arena.player);
  check('scouter workup sheet still fires on boss-room entry', arena.scan);
  await page.keyboard.press('Enter');                      // dismiss the scouter
  await sleep(200);

  // -- 8. walls eat projectiles ---------------------------------------------------------------
  const blocked = await page.evaluate(`(function(){var r=${scene('Realm')};
    var T = MAPS.TILE;
    // fire straight at the hedge line at x=30 (painted in step 2) from its right
    var s = Entities.fireProjectile(r, r.playerShots, 33*T, 12.5*T, Math.PI, 560, 5, 30000, 'arrow', false);
    if (s) s.proj.testTag = true;                        // auto-fire arrows also fly — track OURS
    return { fired: !!s };})()`);
  await sleep(400);
  const blocked2 = await page.evaluate(`(function(){var r=${scene('Realm')};
    var tagged = 0;
    r.playerShots.children.iterate(function(s){ if (s && s.active && s.proj.testTag) tagged++; });
    return { tagged: tagged };})()`);
  check('walls block shots (30s-lifetime arrow dies on the hedge)', blocked.fired && blocked2.tagged === 0);

  // -- 9. default realm runs on the built-in realm1 -------------------------------------------
  await page.keyboard.press('Escape');
  await sleep(120);
  await page.keyboard.press('q');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(300);
  const realm1 = await page.evaluate(`(function(){var r=${scene('Realm')};
    var T = MAPS.TILE;
    var wallsOk = true, checked = 0;
    r.mobs.children.iterate(function(m){ if (!m || !m.active) return; checked++;
      if (MAPS.isWallAtPx(r.map, m.x, m.y)) wallsOk = false; });
    return { id: r.map.id, w: r.map.w,
             start: Math.abs(r.player.x - 75.5*T) < 2,
             wallBodies: r.wallBodies.getLength(),
             chunks: r.mapRender.images.length,
             arena: !!r.map.objects.bossArena,
             mobsChecked: checked, mobsClear: wallsOk };})()`);
  check('plaza portal loads built-in realm1 (150×150, arena, 25 chunks)',
    realm1.id === 'realm1' && realm1.w === 150 && realm1.arena && realm1.chunks === 25);
  check('player starts at realm1 painted start; wall bodies merged',
    realm1.start && realm1.wallBodies > 0 && realm1.wallBodies < 900, realm1.wallBodies + ' bodies');
  check('director spawns land clear of walls', realm1.mobsChecked > 0 && realm1.mobsClear,
    realm1.mobsChecked + ' mobs checked');

  // -- 10. zero console errors -----------------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
