// M13 HAUNTED CARNIVAL verification suite — realm 11, registry map 7.
// Registry/data · THE LAST SHOW (396 beats @132 TRUE 3/4 = 180.0s) ·
// fairground layout (fence + booths + big top) · GAME BOOTHS (lit → opt-in
// round → target pops give NO kill credit → WIN prize / BITE back with env
// kill credit) · the 11 mapVerbs (clown honk-lunge · wisp pop · barker push
// cone · teddy ambush · popcorn mortar · shade slam+shockwave · blob patches
// + split-once · juggler knife lanes · mole erupt · monkey clash slow ·
// phantom rolling lane + spoke beams) · THE RINGMASTER: trapeze entrance,
// whip crack, spotlight lock, clowns, knife curtain, STEP RIGHT UP safe
// rings, GRAND FINALE → bow vented ×1.5, kill → chest.
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

  // -- 1. boot: registry + the creepy calliope --------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.carnival, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.ringmaster;
    return { def: !!MAPS.defs.carnival, roster: DATA.biomes.carnival.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'carnival' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 11-mob roster + console unlock', reg.def && reg.roster === 11 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('THE LAST SHOW: 396 beats @132 (TRUE 3/4), equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 396 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm -------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'carnival' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car;
    return { id: r.realmId, booths: C.booths.length, walls: C.wallGroup.getLength(),
             arena: !!C.arena, spawnS: r._realmStart.y / r.worldH > 0.85 };})()`);
  check('carnival scene: 4 GAME BOOTHS + fence/tent walls + big-top arena + south-gate spawn',
    realm.id === 'carnival' && realm.booths === 4 && realm.walls > 80 && realm.arena && realm.spawnS);

  // -- 3. park the booth cycle (suite fixture rule) + wipe ambient mobs ----------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._car.booth.nextAt = Infinity;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 4. GAME BOOTH: glow → opt-in round → target pops give NO kill credit ------------
  const round = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player, B=C.booth;
    var bb = C.booths[0];
    B.idx = 0; B.state = 'lit'; B.litUntil = r.time.now + 99999;
    bb.glow.setVisible(true);
    p.body.reset(bb.mouthX, bb.mouthY);                      // step into the glow
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var started = B.state === 'round' && B.targets.length === r.realmDef.booth.targetsN;
    // pop ONE target with a real shot — env pop, NO kill credit
    var kills0 = p.state.kills, t0 = B.targets.length;
    var T = B.targets[0];
    Entities.fireProjectile(r, r.playerShots, T.x, T.y, 0, 0, 5, 3000, 'arrow', false);
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var popped = B.targets.length === t0 - 1 && p.state.kills === kills0;
    return { started: started, popped: popped, left: B.targets.length };})()`);
  check('booth lights, the player opts IN — the target round starts', round.started);
  check('shooting a target POPS it — env object, NO kill credit', round.popped, round.left + ' left');

  // -- 5. WIN: clear the targets → PRIZE (heal) ----------------------------------------
  const win = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player, B=C.booth;
    p.state.hp = Math.max(10, Math.round(p.state.stats.hp * 0.3));
    var hp0 = p.state.hp;
    B.targets.slice().forEach(function(T){ Entities.fireProjectile(r, r.playerShots, T.x, T.y, 0, 0, 5, 3000, 'arrow', false); });
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    return { healed: p.state.hp > hp0, idle: B.state === 'idle', parked: false };})()`);
  check('all targets down in time → PRIZE DROP heals you, the booth goes dark', win.healed && win.idle);

  // -- 6. THE BOOTH BITES BACK: timeout → warned burst, env kill credit ----------------
  const bite = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player, B=C.booth;
    var bb = C.booths[1];
    B.idx = 1; B.state = 'lit'; B.litUntil = r.time.now + 99999;
    bb.glow.setVisible(true);
    p.body.reset(bb.mouthX, bb.mouthY);
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // round starts
    var began = B.state === 'round';
    B.roundEndsAt = 1;                                       // fast-forward: timeout
    var z0 = C.zones.length;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var warned = C.zones.length === z0 + 1 && B.state === 'idle';
    // park a victim mob in the bite, player OUT of it
    var v = Entities.spawnMob(r, 'creepyClown', bb.mouthX + 10, bb.mouthY);
    p.body.reset(r.worldW * 0.5, r.worldH * 0.7);
    var kills0 = p.state.kills;
    C.zones.forEach(function(z){ z.at = 1; });
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // the bite fires
    var out = { began: began, warned: warned, victimDead: !v.active, credited: p.state.kills - kills0 };
    if (v.active) { Entities.clearNameTag(v); v.body.enable = false; r.mobs.killAndHide(v); }
    B.nextAt = Infinity;
    return out;})()`);
  check('abandoned round → THE BOOTH BITES BACK (warned burst at the mouth)', bite.began && bite.warned);
  check('…the bite kills the mob it catches — CREDITED env kill', bite.victimDead && bite.credited === 1);

  // -- 7. CREEPY CLOWN: honk telegraph → lunge -----------------------------------------
  const clown = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'creepyClown', p.x + 150, p.y);
    m.mob.nextHonkAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // HONK
    var honked = m.mob.honkAt > r.time.now;
    m.mob.honkAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // LUNGE
    var lunging = m.mob.lungeUntil > r.time.now && Math.abs(m.body.velocity.x) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { honked: honked, lunging: lunging };})()`);
  check('CREEPY CLOWN honks, then LUNGES', clown.honked && clown.lunging);

  // -- 8. BALLOON WISP: drifts close → telegraphed POP (self-kill credited) -------------
  const wisp = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'balloonWisp', p.x + 60, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // arms the pop
    var armed = m.mob.popAt > r.time.now && C.mobWarns.length > 0;
    m.mob.popAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // POP
    var popped = !m.active && p.state.hp < hp0;
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // warn ring swept (armed cleanup)
    var cleaned = C.mobWarns.length === 0;
    p.state.hp = hp0;
    return { armed: armed, popped: popped, cleaned: cleaned };})()`);
  check('BALLOON WISP drifts in, warns, then POPS (burst hurts, warn swept)',
    wisp.armed && wisp.popped && wisp.cleaned);

  // -- 9. CARNY BARKER: warned cane cone PUSHES you ---------------------------------------
  const barker = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'carnyBarker', p.x + 140, p.y);
    m.mob.nextSweepAt = 1;
    var orig = r.time.delayedCall.bind(r.time), captured = null;
    r.time.delayedCall = function(ms, cb){ captured = cb; return orig(ms, function(){}); };
    Entities.updateMob(r, m, p, r.time.now);
    r.time.delayedCall = orig;
    var locked = m.mob.sweepLockUntil > r.time.now;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    if (captured) captured();                                // the sweep lands NOW
    var pushed = Math.hypot(p.body.velocity.x, p.body.velocity.y) > 150;
    var hurt = p.state.hp < hp0;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { locked: locked, pushed: pushed, hurt: hurt };})()`);
  check('CARNY BARKER locks his cone, the cane sweep HERDS you (push + sting)',
    barker.locked && barker.pushed && barker.hurt);

  // -- 10. POSSESSED TEDDY: plays dead → shimmer → SPRINGS --------------------------------
  const teddy = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var far = Entities.spawnMob(r, 'possessedTeddy', p.x + 500, p.y);
    Entities.updateMob(r, far, p, r.time.now);
    var dormant = !far.mob.wakeAt && !far.mob.awake;
    var near = Entities.spawnMob(r, 'possessedTeddy', p.x + 120, p.y);
    Entities.updateMob(r, near, p, r.time.now);
    var warned = !!near.mob.wakeAt;
    near.mob.wakeAt = 1;
    Entities.updateMob(r, near, p, r.time.now);
    var sprang = near.mob.awake === true && Math.abs(near.body.velocity.x) > 300;
    [far, near].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    return { dormant: dormant, warned: warned, sprang: sprang };})()`);
  check('POSSESSED TEDDY plays dead, SHIMMERS (mob only), then springs', teddy.dormant && teddy.warned && teddy.sprang);

  // -- 11. POPCORN POLTERGEIST mortar + STRONGMAN SHADE slam→shockwave --------------------
  const heavies = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    var m = Entities.spawnMob(r, 'popcornPoltergeist', p.x + 200, p.y);
    m.mob.nextLobAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);
    var lobbed = C.zones.length === z0 + 3;                  // 3 warned kernels
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    var s = Entities.spawnMob(r, 'strongmanShade', p.x + 150, p.y);
    s.mob.nextSlamAt = 1;
    var z1 = C.zones.length;
    Entities.updateMob(r, s, p, r.time.now);                 // slam telegraph
    var slammed = C.zones.length === z1 + 1 && !!s.mob.pound;
    s.mob.pound.until = 1;
    var r0 = C.rings.length;
    Entities.updateMob(r, s, p, r.time.now);                 // slam lands → shockwave ring
    var shocked = C.rings.length === r0 + 1;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    C.rings.forEach(function(G){ G.g.destroy(); }); C.rings = [];
    [m, s].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { lobbed: lobbed, slammed: slammed, shocked: shocked };})()`);
  check('POPCORN POLTERGEIST mortars 3 warned kernels', heavies.lobbed);
  check('STRONGMAN SHADE telegraphs his slam, the crater rings a SHOCKWAVE', heavies.slammed && heavies.shocked);

  // -- 12. COTTON CANDY BLOB: sticky patches + splits ONCE --------------------------------
  const blob = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    var m = Entities.spawnMob(r, 'cottonCandyBlob', p.x + 200, p.y);
    m.mob.nextDripAt = 1;
    var d0 = C.patches.length;
    Entities.updateMob(r, m, p, r.time.now);
    var dripped = C.patches.length === d0 + 1;
    // the patch slows you
    p.body.reset(C.patches[C.patches.length - 1].x, C.patches[C.patches.length - 1].y);
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    p.body.velocity.x = 0;
    // split ONCE on death (queueSpawn, marked children)
    var q0 = r._spawnQueue.length;
    Entities.hurtMob(r, m, 99999, r.time.now);
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // the watcher splits her
    var split = r._spawnQueue.length - q0 === 2 &&
      r._spawnQueue.slice(q0).every(function(e){ return e.key === 'cottonCandyBlob'; }) &&
      C.blobChildMarks === 2;
    r._spawnQueue.length = q0; C.blobChildMarks = 0;
    C.patches.forEach(function(P){ P.obj.destroy(); }); C.patches = [];
    p.body.reset(r.worldW * 0.5, r.worldH * 0.7);
    return { dripped: dripped, slowed: slowed, split: split };})()`);
  check('COTTON CANDY BLOB drips sticky slow patches', blob.dripped && blob.slowed);
  check('…and SPLITS ONCE on death (2 marked children via queueSpawn)', blob.split);

  // -- 13. KNIFE JUGGLER lanes + WHACK-A-MOLE erupt ----------------------------------------
  const knives = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    var m = Entities.spawnMob(r, 'knifeJuggler', p.x + 200, p.y);
    m.mob.nextVolleyAt = 1;
    var l0 = C.lanes.length;
    Entities.updateMob(r, m, p, r.time.now);
    var volleyed = C.lanes.length === l0 + 3 && m.mob.volleyLockUntil > r.time.now;
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { volleyed: volleyed };})()`);
  check('KNIFE JUGGLER locks and throws a 3-knife arc (aimed lanes)', knives.volleyed);
  const mole = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'whackAMole', p.x + 200, p.y);
    m.mob.nextHoleAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // buries + warns the hole
    var buried = m.mob.moleState === 'buried' && !m.visible && !m.body.enable && C.mobWarns.length > 0;
    p.body.reset(m.mob._holeX, m.mob._holeY);                // stand on the hole
    m.mob.eruptAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // ERUPTS under you
    var erupted = m.mob.moleState === 'up' && m.visible && m.body.enable && p.state.hp < hp0;
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // hole warn swept
    p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.5, r.worldH * 0.7);
    return { buried: buried, erupted: erupted, cleaned: C.mobWarns.length === 0 };})()`);
  check('WHACK-A-MOLE tunnels, warns the hole, ERUPTS under you', mole.buried && mole.erupted && mole.cleaned);

  // -- 14. CYMBAL MONKEY: clash ring slows (CC-capped) --------------------------------------
  const monkey = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'cymbalMonkey', p.x + 120, p.y);
    m.mob.nextClashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // warn ring
    var warned = m.mob.clashAt > r.time.now;
    m.mob.clashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // CLASH (player inside 150)
    var hurt = p.state.hp < hp0;
    var slowedUntil = C.ccSlowUntil;
    var capped = slowedUntil > r.time.now && slowedUntil <= r.time.now + 1600;
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    C.ccSlowUntil = 0; p.state.hp = hp0; p.body.velocity.x = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, hurt: hurt, capped: capped, slowed: slowed };})()`);
  check('CYMBAL MONKEY clashes — you are slowed, CC hard-capped at +1600ms',
    monkey.warned && monkey.hurt && monkey.capped && monkey.slowed);

  // -- 15. FERRIS PHANTOM: spoke beams + rolling warned lane --------------------------------
  const phantom = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car, p=r.player;
    var m = Entities.spawnMob(r, 'ferrisPhantom', p.x + 250, p.y);
    m.mob.nextBeamAt = 1; m.mob.nextRollAt = r.time.now + 999999;
    var l0 = C.lanes.length;
    Entities.updateMob(r, m, p, r.time.now);
    var beamed = C.lanes.length === l0 + 2;                  // twin spoke flicks
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    m.mob.nextRollAt = 1; m.mob.nextBeamAt = r.time.now + 999999;
    Entities.updateMob(r, m, p, r.time.now);                 // locks the lane
    var locked = m.mob.laneLockUntil > r.time.now && !!m.mob._rollG;
    m.mob.laneLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // ROLLS
    var rolling = m.mob.rollUntil > r.time.now && Math.abs(m.body.velocity.x) > 250;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { beamed: beamed, locked: locked, rolling: rolling };})()`);
  check('FERRIS PHANTOM flicks twin spoke beams, locks a lane, then ROLLS it',
    phantom.beamed && phantom.locked && phantom.rolling);

  // -- 16. clocks shift through unfreeze() ----------------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car;
    C.booth.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'cymbalMonkey', r.player.x + 900, r.player.y);
    m.mob.nextClashAt = r.time.now + 6000;
    var before = { b: C.booth.nextAt, m: m.mob.nextClashAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { b: C.booth.nextAt - before.b, m: m.mob.nextClashAt - before.m };
      C.booth.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts booth-cycle + mob clocks', shift.b > 500 && shift.m > 500);

  // -- 17. quota → TRAPEZE DESCENT entrance ----------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'creepyClown', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car;
    return { key: r.boss.boss.key, armed: C.bossArmed, boothParked: C.booth.nextAt === Infinity,
             inArena: Math.hypot(r.boss.x - C.arena.x, r.boss.y - C.arena.y) < C.arena.r };})()`);
  check('THE RINGMASTER swings down on the trapeze (spotlight, bow, whip crack)',
    boss.key === 'ringmaster' && boss.armed && boss.inArena);
  check('the games are over — the booth cycle is CANCELLED on boss arrival', boss.boothParked);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 18. WHIP CRACK: locked cone → crack + knockback -----------------------------------------
  const whip = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.nextFinaleAt = r.time.now + 999999; bs.nextSpotAt = r.time.now + 999999;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 0; bs.nextVerbAt = 1;
    p.body.reset(b.x + 150, b.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var orig = r.time.delayedCall.bind(r.time), captured = null;
    r.time.delayedCall = function(ms, cb){ captured = cb; return orig(ms, function(){}); };
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);          // WHIP warn
    r.time.delayedCall = orig;
    var busy = bs.busyUntil > r.time.now;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    if (captured) captured();                                // the CRACK lands
    var hurt = p.state.hp < hp0;
    var flung = Math.hypot(p.body.velocity.x, p.body.velocity.y) > 200;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { busy: busy, hurt: hurt, flung: flung };})()`);
  check('WHIP CRACK: cone flash → crack (damage + knockback)', whip.busy && whip.hurt && whip.flung);

  // -- 19. SPOTLIGHT LOCK: chases, fills, the stage light CRASHES -------------------------------
  const spot = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._car;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextSpotAt = 1; bs.nextVerbAt = r.time.now + 999999;
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    var hunting = !!C.spot;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(C.spot.x, C.spot.y);                        // stand in the light
    C.spot.lockAt = 1;
    r.hitstopActive = false;
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // CRASH
    var crashed = !C.spot && p.state.hp < hp0;
    p.state.hp = hp0;
    return { hunting: hunting, crashed: crashed };})()`);
  check('SPOTLIGHT LOCK hunts you — when it fills, the stage light CRASHES', spot.hunting && spot.crashed);

  // -- 20. SEND IN THE CLOWNS + KNIFE CURTAIN ----------------------------------------------------
  const cast = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._car;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 2; bs.nextVerbAt = 1;                       // SEND IN THE CLOWNS
    var q0 = r._spawnQueue.length;
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    var clowns = r._spawnQueue.length - q0 === 4 &&
      r._spawnQueue.slice(q0).every(function(e){ return e.bossWave; });
    r._spawnQueue.length = q0;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 1; bs.nextVerbAt = 1;                       // KNIFE CURTAIN
    var l0 = C.lanes.length;
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    var curtain = C.lanes.length - l0 === 4;
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    return { clowns: clowns, curtain: curtain };})()`);
  check('SEND IN THE CLOWNS queues 4 bossWave adds · KNIFE CURTAIN marches 4 lanes',
    cast.clowns && cast.curtain);

  // -- 21. STEP RIGHT UP: safe rings — inside is safe, outside gets RAKED ------------------------
  const game2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._car;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 3; bs.nextVerbAt = 1;                       // STEP RIGHT UP
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    var rings = C.game && C.game.rings.length === 2;
    var reachable = C.game && Math.hypot(C.game.rings[0].x - p.x, C.game.rings[0].y - p.y) < 260;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(C.game.rings[0].x, C.game.rings[0].y);      // stand IN the light
    C.game.until = 1;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var safe = p.state.hp === hp0 && !C.game;
    // again — this time OUTSIDE every ring
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 3; bs.nextVerbAt = 1;
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    p.body.reset(C.arena.x, C.arena.y + C.arena.r + 300);    // far outside
    p.state.lastHitAt = -1e9;
    C.game.until = 1;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    var raked = p.state.hp < hp0;
    p.state.hp = hp0;
    p.body.reset(C.arena.x, C.arena.y + 60);
    return { rings: rings, reachable: reachable, safe: safe, raked: raked };})()`);
  check('STEP RIGHT UP paints 2 safe rings — one always within reach', game2.rings && game2.reachable);
  check('inside the ring is SAFE; outside gets raked', game2.safe && game2.raked);

  // -- 22. THE GRAND FINALE: fireworks → the BOW → vented ×1.5 -----------------------------------
  const finale = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._car;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.lockTint = null;
    bs.nextFinaleAt = 1; bs.nextVerbAt = r.time.now + 999999; bs.nextSpotAt = r.time.now + 999999;
    CARNIVAL_SCENE.bossUpdate(r, b, p, r.time.now);
    var began = !!C.finale && C.finale.seq.length === 8;
    p.body.reset(C.arena.x, C.arena.y + C.arena.r + 300);    // out of the show
    if (C.finale) C.finale.seq.forEach(function(F){ F.at = 1; });
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // all 8 fire
    CARNIVAL_SCENE.update(r, r.time.now, 16);                // → the BOW
    return { began: began, vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult,
             rooted: bs.rootUntil > r.time.now };})()`);
  check('THE GRAND FINALE rains 8 fireworks, then he BOWS — WINDED (rooted + vented)',
    finale.began && finale.vented && finale.mult === 1.5 && finale.rooted);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 23. kill → chest + the show's machinery swept ----------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._car;
    CARNIVAL_SCENE.update(r, r.time.now, 16);
    return !C.spot && !C.finale && !C.game && !C.bossArmed;})()`);
  check('the Ringmaster falls → chest/loot flow + spotlight/finale/game swept', clean);

  // -- 24. zero console errors ----------------------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
