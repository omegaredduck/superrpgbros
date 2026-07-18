// M4.7 verification — THE CONDUCTOR (arrival + 4 train verbs), train consists,
// the yard mob roster, detonate verb, clock shifts. Run like the suites.
const path = require('path');
const { chromium } = require('playwright');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
let n = 0, fails = 0;
function check(name, ok, detail) {
  n++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + String(n).padStart(2) + '  ' + name + (detail ? '  — ' + detail : ''));
  if (!ok) fails++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(600);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });

  // -- 0. bestiary is BY MAP (M7k): yard mobs + the yard's OWN boss; other
  // realms' pages live behind the map pager / search.
  const beast = await page.evaluate(`(function(){var nx=${scene('Nexus')};
    // items 7/8: name search only finds creatures whose realm you've BEATEN —
    // mark the campaign cleared so Gravekeeper is searchable.
    ACCOUNT.cleared = nx.campaignMaps().map(function(m){ return m.id; });
    var e = nx.bestiaryEntries();
    var expected = DATA.biomes[DATA.realm.biome].mobs.length + 1;
    var bossKeys = e.filter(function(x){ return x.kind === 'boss'; }).map(function(x){ return x.key; });
    nx.bestiarySearch = 'gravekeeper';
    var hit = nx.bestiaryEntries();
    nx.bestiarySearch = '';
    return { n: e.length, expected: expected, firstMob: e[0].key,
             hasConductor: bossKeys.indexOf('conductor') >= 0,
             graveViaSearch: hit.length === 1 && hit[0].key === 'gravekeeper' };})()`);
  check('bestiary: yard roster + yard boss (M7k by-map); Gravekeeper via SEARCH',
    beast.n === beast.expected && beast.firstMob === 'coalGolem' && beast.hasConductor && beast.graveViaSearch,
    beast.n + ' entries (expected ' + beast.expected + ')');

  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);

  // -- 1. the wave director spawns from the YARD roster ---------------------------
  const roster = await page.evaluate(`(function(){var r=${scene('Realm')};
    for (var i = 0; i < 6; i++) r.directorSpend();
    var keys = {};
    r.mobs.children.iterate(function(m){ if (m && m.active) keys[m.mob.key] = true; });
    var yard = DATA.biomes.trainyard.mobs;
    var allYard = Object.keys(keys).every(function(k){ return yard.indexOf(k) >= 0; });
    return { n: Object.keys(keys).length, allYard: allYard, keys: Object.keys(keys).join(',') };})()`);
  check('director spawns YARD mobs only', roster.n > 0 && roster.allYard, roster.keys);

  // -- 2. DYNAMITE MOLE — timed fuse bomb: arms + flashes, then an AoE that hits
  // the player AND nearby mobs (mob kills credit the player) ----------------------
  const mole = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.lastHitAt = -99999; st.kills = 0;
    p.setPosition(r.worldW / 2, r.worldH / 2);
    var mo = Entities.spawnMob(r, 'dynamiteMole', p.x + 30, p.y); mo.mob.affix = null;
    var victim = Entities.spawnMob(r, 'coalGolem', p.x + 45, p.y); victim.mob.affix = null; victim.mob.hp = 1;
    // fuse burning: stationary, armed, warning ring up, NOT yet blown
    Entities.updateMob(r, mo, p, r.time.now);
    var armed = !!mo.mob.fuseAt && mo.active && !!mo.warnCircle && mo.body.velocity.x === 0;
    // force the fuse to the end → detonate
    mo.mob.fuseAt = r.time.now - 1;
    Entities.updateMob(r, mo, p, r.time.now);
    return { armed: armed, spawned: mo.mob.spd === 0,
             playerHurt: st.hp < st.stats.hp, moleGone: !mo.active,
             victimGone: !victim.active, kills: st.kills };})()`);
  check('DYNAMITE MOLE arms + flashes on a fuse (stationary, warning ring up)', mole.armed && mole.spawned);
  check('mole blast hits the player AND nearby mobs; mob kills CREDIT the player',
    mole.playerHurt && mole.moleGone && mole.victimGone && mole.kills >= 1,
    `hurt ${mole.playerHurt} kills ${mole.kills}`);

  // -- 2b. CONDUCTOR ZOMBIE — no longer a shooter; drops a short-lived slime trail
  const slime = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.slimePatches = []; r._lastSlimeTickAt = 0;
    var p = r.player, st = p.state; st.hp = st.stats.hp; st.lastHitAt = -99999;
    p.setPosition(r.worldW / 2, r.worldH / 2);
    r.dropSlime(p.x, p.y, DATA.mobs.conductorZombie.slimeTrail);
    var dropped = r.slimePatches.length === 1;
    r._lastSlimeTickAt = r.time.now - 1000; var before = st.hp; st.lastHitAt = -99999;
    r.updateSlime(r.time.now);
    var ticked = st.hp < before;
    r.slimePatches[0].dieAt = r.time.now - 1;              // expire it
    r.updateSlime(r.time.now + 1);
    var gone = r.slimePatches.length === 0;
    return { noShoot: !DATA.mobs.conductorZombie.shoot, chaser: !!DATA.mobs.conductorZombie.chase,
             dropped: dropped, ticked: ticked, gone: gone };})()`);
  check('CONDUCTOR ZOMBIE: chaser (no shoot); slime patch drops, ticks damage, then expires',
    slime.noShoot && slime.chaser && slime.dropped && slime.ticked && slime.gone);

  // -- 2c. SMOG SERPENT — fog conceals mobs; only reachable from inside the cloud
  const fog = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var p = r.player; p.setPosition(r.worldW / 2, r.worldH / 2);
    var serp = Entities.spawnMob(r, 'smogSerpent', p.x + 320, p.y); serp.mob.affix = null;
    var hidden = Entities.spawnMob(r, 'coalGolem', p.x + 320, p.y); hidden.mob.affix = null;
    serp.mob.fogPhaseAt = r.time.now + 5000; serp.mob.fogOn = true;
    r.updateFog(r.time.now);                                // player far away
    var outside = hidden.mob.concealed === true && serp.mob.concealed === true && r.playerInFog === false;
    p.setPosition(serp.x, serp.y);                          // step into the cloud
    r.updateFog(r.time.now);
    var inside = r.playerInFog === true;
    return { noShoot: !DATA.mobs.smogSerpent.shoot, outside: outside, inside: inside };})()`);
  check('SMOG SERPENT: fog caster (no shoot); conceals mobs + itself, player-in-fog flips inside the cloud',
    fog.noShoot && fog.outside && fog.inside);

  // -- 3. AMBUSH TRAIN pulls a consist (2..15 cars, they follow, they kill) -------
  const consist = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.setPosition(200, r.worldH / 2);                 // off the lanes
    r.train.phase = 'idle'; r.train.nextAt = 0;
    r.startTrainWarning(r.time.now);
    r.train.warnUntil = 0;                                   // launch NOW
    r.launchTrain(r.time.now);
    var tr = r.train;
    return { cars: tr.cars.length, endBeyond: Math.abs(tr.endX) > r.worldW || tr.endX > r.worldW,
             tail: tr.tailLen > 0 };})()`);
  check('ambush train hauls a 2–15 car consist; pass end accounts for the tail',
    consist.cars >= 2 && consist.cars <= 15 && consist.tail, `${consist.cars} cars`);
  const carKill = await page.evaluate(`(function(){var r=${scene('Realm')};
    var tr = r.train;
    // advance the train so a MIDDLE car is over the lane center, put the player on it
    var mid = tr.cars[Math.floor(tr.cars.length / 2)];
    tr.sprite.x = r.worldW / 2 + tr.dir * mid.off;           // mid car lands at center
    r.updateTrainYard(r.time.now, 16);                       // reposition cars + collide
    var onCar = { x: r.worldW / 2, y: tr.lane.y };
    r.player.setPosition(onCar.x, onCar.y);
    r.updateTrainYard(r.time.now + 17, 16);
    return { dead: !r.player.state.alive };})()`);
  check('standing on a CAR (not the loco) is death — the whole consist kills', carKill.dead);

  // -- 4. THE CONDUCTOR: arrival cinematic → boss + scouter ------------------------
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Title')`);
  await page.waitForFunction(`game.scene.isActive('Title')`, null, { timeout: 15000 });
  await sleep(400);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'knight')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);
  const arriving = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.startBossFight();
    return { train: !!r.arrivalTrain, bossYet: !!r.boss };})()`);
  check('the Styx Express pulls in FIRST (no boss during the run-in)', arriving.train && !arriving.bossYet);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 60000 });
  const scout = await page.evaluate(`(function(){var r=${scene('Realm')};
    var texts=[]; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return { hp: r.boss.boss.hp, blob: texts.join(' | ') };})()`);
  check('he steps off → boss live (hp 1500) + scouter with train hints',
    scout.hp === 1500 && scout.blob.indexOf('GHOST TRACK') >= 0 && scout.blob.indexOf('STYX') >= 0);
  await page.keyboard.press('Enter');
  await sleep(300);

  // -- 5. GHOST TRAIN: track summon → spectral consist → EXTREME damage ------------
  const ghost = await page.evaluate(`(function(){var r=${scene('Realm')};
    var b = r.boss, cd = b.boss;
    r.player.setPosition(r.worldW / 2, r.worldH / 2);
    cd.nextTrainAt = 0;                                      // force the summon
    r.conductorUpdate(b, r.player, r.time.now);
    var gt = r.ghostTrain;
    var warn = gt && gt.phase === 'warn' && !!gt.trackSpr;
    gt.warnUntil = 0;
    r.launchGhostTrain(r.time.now);
    return { warn: warn, running: gt.phase === 'run', units: gt.units.length,
             ghostTex: gt.units[0].spr.texture.key };})()`);
  check('GHOST TRACK telegraphs, then a spectral consist launches (loco + 3-8 cars)',
    ghost.warn && ghost.running && ghost.units >= 4 && ghost.units <= 9 && ghost.ghostTex === 'ghostLoco',
    `${ghost.units} units`);
  const ghostHit = await page.evaluate(`(function(){var r=${scene('Realm')};
    var gt = r.ghostTrain, p = r.player, st = p.state;
    st.hp = st.stats.hp; st.lastHitAt = -99999;
    // park the loco on the player
    gt.a = gt.horiz ? p.x : p.y;
    if (gt.horiz) r.player.setPosition(gt.a, gt.pos); else r.player.setPosition(gt.pos, gt.a);
    var before = st.hp;
    r.updateGhostTrain(r.time.now, 16);
    var took = before - st.hp;
    // expected: 200 raw × 1.6 (knight vs boss) − DEF... which EXCEEDS a fresh
    // hero's whole pool — hp floors at 0, so "took" clamps to before and the
    // hero DIES (exactly the user's spec: insta-kill with no gear on).
    var want = Math.min(before, Math.max(1, Math.round(200 * DATA.classes.knight.dmgTaken.boss) - Math.floor(st.stats.def)));
    return { took: took, want: want, dead: !st.alive };})()`);
  check('the ghost express one-shots an ungeared hero (extreme boss-scaled damage)',
    ghostHit.took === ghostHit.want && ghostHit.dead, `took ${ghostHit.took} (dead ${ghostHit.dead})`);

  // -- 6. RAILROAD TIES: markers + lobbed ties land ---------------------------------
  const ties = await page.evaluate(`(function(){var r=${scene('Realm')};
    var before = r.condFx.length;
    r.throwTies(r.boss, DATA.bosses.conductor.patterns.ties);
    return { added: r.condFx.length - before };})()`);
  check('TIE THROW puts marked circles + spinning ties in the air (3 of each)',
    ties.added === 6, `${ties.added} fx`);

  // -- 7. THE SCHEDULE: pocket watch slows the player's movement --------------------
  const sched = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.alive = true;
    r.snapSchedule(r.boss, DATA.bosses.conductor.patterns.schedule, r.time.now);
    var intent = SIM.makeIntent(); intent.moveX = 1;
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var slowed = Math.abs(p.body.velocity.x - st.stats.spd * DATA.bosses.conductor.patterns.schedule.slowMult) < 1;
    // after it expires, full speed returns
    Entities.updatePlayer(r, p, intent, st.slowUntil + 10, 16);
    var recovered = Math.abs(p.body.velocity.x - st.stats.spd) < 1;
    return { slowed: slowed, recovered: recovered, until: st.slowUntil > 0 };})()`);
  check('THE SCHEDULE: movement runs at slowMult while the watch holds, then recovers',
    sched.slowed && sched.recovered && sched.until);

  // -- 8. LANTERN SWEEP: beam ticks damage inside the arc ---------------------------
  const lantern = await page.evaluate(`(function(){var r=${scene('Realm')};
    var b = r.boss, cd = b.boss, L = DATA.bosses.conductor.patterns.lantern;
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.alive = true; st.lastHitAt = -99999; st.slowUntil = 0;
    cd.nextLanternAt = 0; cd.lanternUntil = 0;
    r.updateLantern(b, p, r.time.now);                       // ignites
    var lit = cd.lanternUntil > 0;
    // stand IN the beam: place the player along the current beam angle
    var d = 120;
    p.setPosition(b.x + Math.cos(cd.lanternAng) * d, b.y + Math.sin(cd.lanternAng) * d);
    cd.nextLanternTickAt = 0;
    var before = st.hp;
    r.updateLantern(b, p, r.time.now + 20);
    return { lit: lit, took: before - st.hp, beam: !!r.lanternG };})()`);
  check('LANTERN SWEEP ignites and ticks damage on a player standing in the beam',
    lantern.lit && lantern.took > 0 && lantern.beam, `tick ${lantern.took}`);

  // -- 9. unfreeze() shifts every conductor clock -----------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')};
    var cd = r.boss.boss, st = r.player.state;
    st.slowUntil = r.time.now + 1000;
    cd.nextTrainAt = r.time.now + 5000; cd.lanternUntil = r.time.now + 900;
    var g0 = { train: cd.nextTrainAt, lant: cd.lanternUntil, slow: st.slowUntil };
    r.pauseGame();
    r.pausedAt = r.time.now - 4000;                          // simulate 4s behind the menu
    r.unfreeze();
    if (r._menuHandle) r._menuHandle.close();
    return { dTrain: cd.nextTrainAt - g0.train, dLant: cd.lanternUntil - g0.lant,
             dSlow: st.slowUntil - g0.slow };})()`);
  check('unfreeze() shifts ghost-train/lantern/schedule clocks by the paused time',
    shift.dTrain >= 3900 && shift.dLant >= 3900 && shift.dSlow >= 3900,
    `+${shift.dTrain}ms`);

  // -- 10. boss death clears every conductor effect ----------------------------------
  const cleanup = await page.evaluate(`(function(){var r=${scene('Realm')};
    Entities.hurtBoss(r, r.boss, 999999);
    return { boss: !!r.boss, ghost: !!r.ghostTrain, fx: r.condFx.length,
             lantern: !!r.lanternG, slow: r.player.state.slowUntil };})()`);
  check('boss down → rails/beam/ties/schedule all cleared', !cleanup.boss && !cleanup.ghost &&
    cleanup.fx === 0 && !cleanup.lantern && cleanup.slow === 0);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));
  console.log('');
  console.log(fails === 0 ? 'ALL GREEN — ' + n + ' checks' : fails + ' FAILURE(S)');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('SUITE CRASH:', e); process.exit(1); });
