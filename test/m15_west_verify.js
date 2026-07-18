// M15 WILD WEST TOWN verification suite — realm 13, registry map 9.
// Registry/data · HIGH NOON HOEDOWN (420 beats @140 = 180.0s) · town layout
// (main-street spine · duel-ground arena · rail line · THE HORSE) · HIGH NOON
// EVERYBODY DRAWS (armed mobs freeze + telegraph lanes → fire → dodged lanes
// return-fire env-credited → wind re-rolls) · NOON EXPRESS (yard train:
// warn → pass → rail-bed instakill + wrap + mob mow · offset from noon) ·
// the 8 mob verbs (rustler lunge · bandit aim-shot · Dan TNT · snake cone +
// venom · vulture dive · tumbleweed wind-roll · scorpion burrow-untargetable
// → sting · dust-devil push + shot-deflect + slow patch) · THE OUTLAW
// SHERIFF: doors-blast + horse-shot entrance, fan/ricochet/dynamite, HIGH
// NOON sig (track→lock→bang→sidestep→vented), P2 hat-burn + POSSE CALL,
// CLOCK STRIKES 13 lattice → vented. Deterministic (no real-time cinematic
// waits — the boss-arrival sandbox rule).
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

  // -- 1. boot: registry + the hoedown --------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.west, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.outlawSheriff;
    return { def: !!MAPS.defs.west, roster: DATA.biomes.west.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'west' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 8-mob roster + console unlock', reg.def && reg.roster === 8 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('HIGH NOON HOEDOWN: 420 beats @140, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 420 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ---------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'west' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);
  const layout = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west;
    return { id: r.realmId, arena: !!C.arena, horse: !!C.horse, rail: C.railCx > r.worldW * 0.85,
             spawnS: r._realmStart.y / r.worldH > 0.85,
             tex: r.textures.exists('westSheriffP2Hi') && r.textures.exists('wdHorse') };})()`);
  check('west scene: duel-ground arena + rail line + THE HORSE + south main-street spawn',
    layout.id === 'west' && layout.arena && layout.horse && layout.rail && layout.spawnS && layout.tex);

  // -- 3. park the cycles + wipe ambient mobs (fixture) ---------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._west.noon.nextAt = Infinity; r._west.train.nextAt = Infinity;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 4. HIGH NOON: armed mobs FREEZE + telegraph one lane each (weed excluded) --------
  const noonWarn = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    var cfg = r.realmDef.noon;
    var b = Entities.spawnMob(r, 'sixGunBandit', p.x + 200, p.y);
    var d = Entities.spawnMob(r, 'dynamiteDan', p.x - 200, p.y);
    var w = Entities.spawnMob(r, 'tumbleweed', p.x, p.y - 150);
    WEST_SCENE._startNoon(r, C, r.time.now, cfg);
    var lanes = C.noon.lanes.length, froze = C.noon.freeze === true;
    // freeze holds: an armed mob's velocity is zeroed by update()
    b.body.velocity.x = 120;
    WEST_SCENE.update(r, r.time.now, 16);
    var frozenVel = Math.abs(b.body.velocity.x) < 1;
    var out = { lanes: lanes, froze: froze, frozenVel: frozenVel };
    // clean up the noon warn
    C.noon.lanes.forEach(function(L){ (L.gs||[]).forEach(function(g){ g.destroy(); }); });
    C.noon.lanes = []; C.noon.freeze = false; C.noon.phase = 'idle'; C.noon.nextAt = Infinity;
    [b,d,w].forEach(function(o){ if(o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o); } });
    return out;})()`);
  check('HIGH NOON freezes the street + draws one lane per ARMED mob (tumbleweed excluded)',
    noonWarn.lanes === 2 && noonWarn.froze && noonWarn.frozenVel, noonWarn.lanes + ' lanes');

  // -- 5. HIGH NOON fire: dodged lanes RETURN FIRE (env credit); in-lane = hit; wind re-rolls
  const noonFire = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    var cfg = r.realmDef.noon;
    // DODGE case: two shooters, player steps far off the lanes → both out-shot
    var b = Entities.spawnMob(r, 'sixGunBandit', p.x + 200, p.y);
    var d = Entities.spawnMob(r, 'dynamiteDan', p.x - 200, p.y);
    WEST_SCENE._startNoon(r, C, r.time.now, cfg);
    var wind0 = C.noon.windIdx;
    p.body.reset(p.x, p.y + 400);                 // sidestep off both lanes
    var kills0 = p.state.kills;
    C.noon.fireAt = 1;
    WEST_SCENE._fireNoon(r, C, r.time.now, cfg);
    var returned = p.state.kills - kills0 === 2 && !b.active && !d.active;
    var windRolled = C.noon.windIdx !== wind0;
    [b,d].forEach(function(o){ if(o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o); } });
    // HIT case: one shooter, the player stands IN the lane at fire
    var b2 = Entities.spawnMob(r, 'sixGunBandit', p.x + 200, p.y);
    WEST_SCENE._startNoon(r, C, r.time.now, cfg);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    WEST_SCENE._fireNoon(r, C, r.time.now, cfg);
    var hitInLane = p.state.hp < hp0 && b2.active;
    p.state.hp = hp0;
    if (b2.active) { Entities.clearNameTag(b2); b2.body.enable=false; r.mobs.killAndHide(b2); }
    C.noon.freeze = false; C.noon.phase = 'idle'; C.noon.nextAt = Infinity;
    return { returned: returned, windRolled: windRolled, hitInLane: hitInLane };})()`);
  check('DODGED lanes FIRE BACK at their shooters (env-credited)', noonFire.returned);
  check('standing in a lane at the last toll = HIT · noon WIND re-rolls', noonFire.hitInLane && noonFire.windRolled);

  // -- 6. TUMBLEWEED rolls with the (re-rolled) wind ------------------------------------
  const weed = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    var m = Entities.spawnMob(r, 'tumbleweed', p.x + 60, p.y + 60);
    C.noon.windIdx = 0;
    Entities.updateMob(r, m, p, r.time.now);
    var v0 = { x: m.body.velocity.x, y: m.body.velocity.y };
    C.noon.windIdx = 2;                           // a different wind
    Entities.updateMob(r, m, p, r.time.now);
    var v1 = { x: m.body.velocity.x, y: m.body.velocity.y };
    var da = Math.abs(Math.atan2(Math.sin(Math.atan2(v1.y, v1.x) - Math.atan2(v0.y, v0.x)),
                                 Math.cos(Math.atan2(v1.y, v1.x) - Math.atan2(v0.y, v0.x))));
    var changed = da > 0.3;                        // the roll direction genuinely turned
    var moving = Math.hypot(v1.x, v1.y) > 50;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { changed: changed, moving: moving };})()`);
  check('TUMBLEWEED rolls with the wind — re-rolling the wind changes its direction', weed.changed && weed.moving);

  // -- 7. NOON EXPRESS: whistle warn → the train THUNDERS → rail-bed instakill + wrap ----
  const train = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player, HH=r.worldH;
    var cfg = r.realmDef.train;
    var T = C.train;
    // it will NOT launch during a noon freeze (one death sentence at a time)
    C.noon.freeze = true; T.phase = 'idle'; T.nextAt = 1;
    WEST_SCENE._updateTrain(r, C, r.time.now, 16, cfg);
    var noOverlap = T.phase === 'idle';
    C.noon.freeze = false;
    // warn → pass
    T.nextAt = 1;
    WEST_SCENE._updateTrain(r, C, r.time.now, 16, cfg);
    var warned = T.phase === 'warn';
    T.warnUntil = 1;
    WEST_SCENE._updateTrain(r, C, r.time.now, 16, cfg);
    var launched = T.phase === 'pass' && T.cars.length === cfg.cars;
    // MOB mow on the rail (env-credited): park a mob in the lethal band
    T.headY = HH * 0.5; T.dir = 1; T.len = HH * 0.4;
    var m = Entities.spawnMob(r, 'gangRustler', C.railCx, HH * 0.4);
    m.mob._noWrap = true;
    var kills0 = p.state.kills;
    p.body.reset(r.worldW * 0.2, HH * 0.1);       // player OFF the rail
    WEST_SCENE._updateTrain(r, C, r.time.now, 16, cfg);
    var mowed = !m.active && p.state.kills - kills0 === 1;
    // WRAP-AWARE lethality: band near the seam threatens the wrapped player
    T.headY = HH + T.len * 0.5;                    // band straddles y=worldH
    p.state.alive = true; p.state.hp = 60; p.state.lastHitAt = -1e9;
    p.body.reset(C.railCx, HH * 0.02);            // p.y+HH lands in the band
    WEST_SCENE._updateTrain(r, C, r.time.now, 16, cfg);
    var wrapKill = !p.state.alive || p.state.hp <= 0;
    // revive + clear the train
    p.state.alive = true; p.state.hp = p.state.stats.hp; p.state.lastHitAt = -1e9;
    WEST_SCENE._clearTrain(r, C, r.time.now, cfg);
    T.nextAt = Infinity;
    if (m.active) { Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m); }
    return { noOverlap: noOverlap, warned: warned, launched: launched, mowed: mowed, wrapKill: wrapKill };})()`);
  check('NOON EXPRESS: whistle WARN → the train THUNDERS the rail line', train.warned && train.launched);
  check('the train instakills across the seam (wrap-aware) + MOWS mobs (env credit) + never during noon',
    train.mowed && train.wrapKill && train.noOverlap);

  // -- 8. GANG RUSTLER: knife-glint → short lunge --------------------------------------
  const rustler = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'gangRustler', p.x + 150, p.y);
    m.mob.nextLungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var glint = m.mob.lungeAt > r.time.now;
    m.mob.lungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var lunging = m.mob.lungeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { glint: glint, lunging: lunging };})()`);
  check('GANG RUSTLER knife-glints, then LUNGES (fast, short dash)', rustler.glint && rustler.lunging);

  // -- 9. SIX-GUN BANDIT: thin aim-line → single crack shot ----------------------------
  const bandit = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    var m = Entities.spawnMob(r, 'sixGunBandit', p.x + 200, p.y);
    m.mob.nextAimAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var aiming = m.mob.shotAt > r.time.now && !!m.mob._aimG;
    var e0 = r.enemyShots.countActive(true);
    m.mob.shotAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var shot = r.enemyShots.countActive(true) === e0 + 1;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { aiming: aiming, shot: shot };})()`);
  check('SIX-GUN BANDIT draws a thin aim-line, then cracks a single shot', bandit.aiming && bandit.shot);

  // -- 10. DYNAMITE DAN: TNT onto a warned blast circle → boom ticks -------------------
  const dan = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    var m = Entities.spawnMob(r, 'dynamiteDan', p.x + 260, p.y);
    m.mob.nextLobAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);
    var lobbed = C.zones.length === z0 + 1;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(C.zones[C.zones.length-1].x, C.zones[C.zones.length-1].y);
    C.zones[C.zones.length-1].at = 1;
    WEST_SCENE.update(r, r.time.now, 16);
    var boomed = p.state.hp < hp0;
    p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { lobbed: lobbed, boomed: boomed };})()`);
  check('DYNAMITE DAN lobs TNT onto a warned circle → it BOOMS', dan.lobbed && dan.boomed);

  // -- 11. RATTLESNAKE: rattle cone strike + venom slow --------------------------------
  const snake = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    p.body.reset(400, 400);
    var m = Entities.spawnMob(r, 'rattlesnake', p.x + 90, p.y);
    m.mob.nextStrikeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var rattled = m.mob.strikeAt > r.time.now && !!m.mob._strikeG;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob.strikeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var struck = p.state.hp < hp0 && C.venom.until > r.time.now && C.venom.mult < 1;
    p.state.hp = hp0; C.venom.until = 0; C.venom.mult = 1;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { rattled: rattled, struck: struck };})()`);
  check('RATTLESNAKE rattles a cone, STRIKES → hit + brief venom slow', snake.rattled && snake.struck);

  // -- 12. VULTURE: shadow dive-line → swoop -------------------------------------------
  const vulture = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'vulture', p.x + 200, p.y);
    m.mob.nextDiveAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var marked = m.mob.diveAt > r.time.now && !!m.mob._diveG;
    m.mob.diveAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var swooped = m.mob.diveUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { marked: marked, swooped: swooped };})()`);
  check('VULTURE marks a dive line, then SWOOPS along it', vulture.marked && vulture.swooped);

  // -- 13. SCORPION: burrowed = untargetable → surfaces → sting ------------------------
  const scorpion = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(500, 500);
    var m = Entities.spawnMob(r, 'scorpion', p.x + 120, p.y);
    Entities.updateMob(r, m, p, r.time.now);
    var burrowed = m.mob._surf === false && m.body.enable === false;   // untargetable while mound
    m.mob.nextSurfaceAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var surfaced = m.mob._surf === true && m.body.enable === true && m.mob.stingAt > r.time.now;
    p.body.reset(m.x, m.y);                        // stand on the sting
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob.stingAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var stung = p.state.hp < hp0 && m.mob._surf === false;             // erupts then re-burrows
    p.state.hp = hp0; r._west.venom.until = 0; r._west.venom.mult = 1;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { burrowed: burrowed, surfaced: surfaced, stung: stung };})()`);
  check('SCORPION burrows (untargetable mound), SURFACES, then STINGS', scorpion.burrowed && scorpion.surfaced && scorpion.stung);

  // -- 14. DUST DEVIL: pushes the player + DEFLECTS the player's shots ------------------
  const devil = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west, p=r.player;
    p.body.reset(600, 600);
    var m = Entities.spawnMob(r, 'dustDevil', p.x, p.y);
    // player just inside the whirl → pushed OUTWARD
    p.body.reset(m.x + 40, m.y);
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    var pc0 = C.patches.length;
    m.mob.nextPatchAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var pushed = p.body.velocity.x > 40;           // shoved to +x (away from centre)
    var patched = C.patches.some(function(P){ return P.slowMult; }) && C.patches.length > pc0;
    // a player shot INSIDE the whirl gets flung back out
    var s = Entities.fireProjectile(r, r.playerShots, m.x - 30, m.y, 0, 300, 5, 3000, 'arrow', false);
    Entities.updateMob(r, m, p, r.time.now);
    var deflected = s.body.velocity.x < 0;         // was heading +x (into centre), now flung -x
    if (s.active) Entities.killProjectile(r.playerShots, s);
    for (var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { pushed: pushed, patched: patched, deflected: deflected };})()`);
  check('DUST DEVIL pushes the player, deflects the player shots, drops a slow patch',
    devil.pushed && devil.patched && devil.deflected);

  // -- 15. clocks shift through unfreeze() ---------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west;
    C.noon.nextAt = r.time.now + 5000; C.train.nextAt = r.time.now + 6000;
    var m = Entities.spawnMob(r, 'sixGunBandit', r.player.x + 300, r.player.y);
    m.mob.nextAimAt = r.time.now + 4000;
    var before = { n: C.noon.nextAt, t: C.train.nextAt, m: m.mob.nextAimAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { n: C.noon.nextAt - before.n, t: C.train.nextAt - before.t, m: m.mob.nextAimAt - before.m };
      C.noon.nextAt = Infinity; C.train.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts noon + train + mob clocks', shift.n > 500 && shift.t > 500 && shift.m > 500);

  // -- 16. THE OUTLAW SHERIFF entrance: doors blast → horse shot → chalk → scanning -----
  const entrance = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west;
    var def = DATA.bosses.outlawSheriff, A = C.arena;
    r.player.state.kills = DATA.realm.killQuota;
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    WEST_SCENE.bossArrival(r, def, A.x, A.y - A.r * 0.3);
    for (var pass = 0; pass < 20 && (!r.boss || !r.scanning); pass++) caps.splice(0).forEach(function(f){ try { f(); } catch(e){} });
    r.time.delayedCall = orig;
    return { boss: !!r.boss, key: r.boss && r.boss.boss.key, horseDead: C.horseDead,
             chalk: !!C.chalkG, scanning: r.scanning === true,
             noonParked: C.noon.nextAt === Infinity, trainParked: C.train.nextAt === Infinity };})()`);
  check('ENTRANCE: doors blast → he SHOOTS THE HORSE → chalk circle → r.scanning',
    entrance.boss && entrance.key === 'outlawSheriff' && entrance.horseDead && entrance.chalk && entrance.scanning);
  check('the noon + train cycles hold their breath while the boss holds court',
    entrance.noonParked && entrance.trainParked);
  await page.evaluate(`(function(){var r=${scene('Realm')}; if (r.scanning) r.dismissScouter();})()`);

  // -- 17. FAN THE HAMMER (5 shots) + RICOCHET (bent lanes) + DYNAMITE DEPUTY (3) -------
  const p1 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._west;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    bs.nextSigAt = r.time.now + 999999; bs.busyUntil = 0; bs.rootUntil = 0; bs.slideUntil = 0;
    // FAN
    bs.verbIdx = 0; bs.nextVerbAt = 1;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var fanned = !!bs.fan;
    var e0 = r.enemyShots.countActive(true);
    bs.fan.fireAt = 1;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var fired5 = r.enemyShots.countActive(true) === e0 + 5;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    // RICOCHET — bent (2-segment) lanes
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var bent = !!bs.rico && bs.rico.lanes.length === 2 && bs.rico.lanes[0].segs.length === 2;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var sg = bs.rico.lanes[0].segs[0];
    p.body.reset((sg[0]+sg[2])/2, (sg[1]+sg[3])/2);   // stand on the first bent segment
    bs.rico.fireAt = 1;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var ricoHit = p.state.hp < hp0;
    p.state.hp = hp0;
    // DYNAMITE DEPUTY — 3 chained circles
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1;
    var z0 = C.zones.length;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var deputy = C.zones.length - z0 === 3 && C.zones[C.zones.length-1].fromBoss;
    C.zones.forEach(function(z){ if(z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { fanned: fanned, fired5: fired5, bent: bent, ricoHit: ricoHit, deputy: deputy };})()`);
  check('FAN THE HAMMER paints a cone → 5 fanned shots', p1.fanned && p1.fired5);
  check('RICOCHET bends 2 lanes off the walls (2 segments each) → hits on the bent path', p1.bent && p1.ricoHit);
  check('DYNAMITE DEPUTY kicks 3 chained boss blast circles', p1.deputy);

  // -- 18. HIGH NOON signature: track → LOCK → BANG → sidestep → VENTED ×1.5 ------------
  const sig1 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.phase = 1; bs.busyUntil = 0; bs.rootUntil = 0; bs.nextSigAt = 1; bs.sig = null;
    p.body.reset(b.x + 120, b.y);
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var opened = !!bs.sig && bs.sig.kind === 'noon' && bs.sig.tracking === true;
    // sidestep the locked lane before the bang → he is WINDED (vented)
    bs.sig.lockAt = 1; bs.sig.bangAt = 1;
    p.body.reset(b.x, b.y + 400);                 // way off the locked lane
    p.state.lastHitAt = -1e9;
    WEST_SCENE._runSig(r, b, p, r.time.now);
    var vented = bs.sig === null && bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    var hp0 = bs.hp; Entities.hurtBoss(r, b, 100); var ventDmg = hp0 - bs.hp;
    return { opened: opened, vented: vented, ventDmg: ventDmg };})()`);
  check('HIGH NOON: a kill-shot lane tracks then LOCKS on the last chime', sig1.opened);
  check('sidestep the locked lane → he re-holsters WINDED, vented ×1.5 (100→150)',
    sig1.vented && sig1.ventDmg === 150, sig1.ventDmg + ' dmg');

  // -- 19. PHASE TWO: WHITE HAT burns off (art swap) + POSSE CALL (3 rustlers, once) ----
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.ventedUntil = 0; bs.rootUntil = 0; bs.busyUntil = 0;
    bs.hp = bs.maxHp * 0.4;                        // cross the 50% threshold
    bs.nextSigAt = r.time.now + 999999; bs.nextVerbAt = r.time.now + 999999;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var hatOff = bs.phase === 2 && b.texture.key === 'westSheriffP2Hi' && bs.posseAt > 0;
    // POSSE CALL — 3 gang rustlers vault the jail rubble (bossWave), once
    bs.busyUntil = 0; bs.posseAt = 1;
    var q0 = r._spawnQueue.length;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var posse = r._spawnQueue.length - q0 === 3 &&
      r._spawnQueue.slice(q0).every(function(e){ return e.bossWave && e.key === 'gangRustler'; });
    r._spawnQueue.length = q0;
    // POSSE fires ONCE (posseAt cleared)
    bs.busyUntil = 0;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var once = r._spawnQueue.length === q0;
    return { hatOff: hatOff, posse: posse, once: once };})()`);
  check('PHASE TWO: the WHITE HAT burns off (hatless art swap), red glare doubles', p2.hatOff);
  check('POSSE CALL vaults 3 gang rustlers (bossWave) — ONCE per phase', p2.posse && p2.once);

  // -- 20. CLOCK STRIKES 13: full lattice → all fire on toll 13 → longest vent ---------
  const sig2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.phase = 2; bs.busyUntil = 0; bs.rootUntil = 0; bs.ventedUntil = 0; bs.nextSigAt = 1; bs.sig = null;
    bs.posseAt = 0; bs.nextVerbAt = r.time.now + 999999;
    var cfg = bs.def.patterns.thirteen;
    WEST_SCENE.bossUpdate(r, b, p, r.time.now);
    var lattice = !!bs.sig && bs.sig.kind === '13' && bs.sig.lanes.length === cfg.laneCount + 1;
    p.body.reset(b.x - 900, b.y - 900);           // weave clear of every lane
    bs.sig.fireAt = 1;
    WEST_SCENE._runSig(r, b, p, r.time.now);
    var fired = bs.sig === null && bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    var longWindow = bs.ventedUntil - r.time.now > bs.def.patterns.highNoon.ventMs;   // longer than P1's
    return { lattice: lattice, fired: fired, longWindow: longWindow };})()`);
  check('CLOCK STRIKES 13: a full crisscross lattice (5 lanes + his locked shot)', sig2.lattice);
  check('the 13th toll fires the whole ground → his LONGEST vented window', sig2.fired && sig2.longWindow);

  // -- 21. kill → chest / loot flow ----------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.boss.boss.ventedUntil = 0; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._west;
    WEST_SCENE.update(r, r.time.now, 16);
    return !C.bossArmed && !C.chalkG;})()`);
  check('the Outlaw Sheriff falls → chest/loot flow + his duel machinery swept', clean);

  // -- 22. zero console errors ---------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nRESULT: ${step - failures}/${step}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
