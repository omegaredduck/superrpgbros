// M19 NEON CITY verification suite — realm 17, registry map 13.
// Registry/data · NIGHT DRIVE.EXE (348 beats @116 = 180.0s, equal tracks) ·
// rooftop layout + WRECK + rails · CANYON routing (cross only at cable runs) +
// toroidal wrap (4 seams) · KINGPIN'S PATROL (warn -> strafe lanes OR rocket
// circles, alternate · untargetable) · the 9 mapVerbs (punk swing · drone
// aim-laser · enforcer shield BLOCK + baton shove · netrunner glitch zones ·
// turret ANCHORED lane sequence · rat scuttle dash · lifter crate children
// cap · viper light-trail lifetime · loader charge+slam) · THE SOCIAL
// ENGINEER: crash entrance, FIREWALL drone gate (0 dmg while up), DDOS darts,
// POP-UP ad walls (block YOUR shots not his darts), REMOTE ACCESS hacked
// turrets, SYSTEM BREACH telegraph->trigger->vent x1.5 (drones down), <50%
// patrol BACKUP never overlaps breach, kill -> chest + machinery swept.
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

  // -- 1. boot: registry + NIGHT DRIVE ---------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.neon, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.socialEngineer;
    return { def: !!MAPS.defs.neon, roster: DATA.biomes.neon.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length, title: bd.title,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'neon' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal, bpm: m.bpm };})()`);
  check('registry def + 9-mob roster + console unlock', reg.def && reg.roster === 9 && reg.consoleRow, reg.roster + ' mobs');
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6, reg.hints + ' hints');
  check('NIGHT DRIVE.EXE: 348 beats @116, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 348 && reg.bpm === 116 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ----------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'neon' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);
  const layout = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    return { id: r.realmId, arena: !!C.arena, wreck: !!C.wreck, rails: C.rails.length,
             crossings: C.crossings.length, canyon: !!C.canyon,
             spawnNW: r._realmStart.x/r.worldW < 0.3 && r._realmStart.y/r.worldH < 0.4 };})()`);
  check('neon scene: helipad arena + WRECK cover + fire-escape rails + cable crossings + NW spawn',
    layout.id === 'neon' && layout.arena && layout.wreck && layout.rails >= 6 && layout.crossings === 3 && layout.spawnNW);

  // -- park ambient + patrol; wipe mobs (fixture base) -----------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    C.patrol.nextPassAt = Infinity;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 3. CANYON routing + toroidal wrap -------------------------------------
  const routing = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player, WW=r.worldW, HH=r.worldH;
    var out = {};
    // block: mid-canyon at a NON-crossing x -> pushed to the band edge
    var badX = 0.4 * WW;   // not near 0.22/0.53/0.78
    p.body.reset(badX, C.canyon.y); p.body.velocity.y = 120;
    NEON_SCENE.update(r, r.time.now, 16);
    out.blocked = Math.abs(p.y - C.canyon.y) > C.canyon.half - 1;
    // pass: mid-canyon AT a crossing x -> allowed to stay in the band
    p.body.reset(0.53 * WW, C.canyon.y); p.body.velocity.y = 0;
    NEON_SCENE.update(r, r.time.now, 16);
    out.crossed = Math.abs(p.y - C.canyon.y) < C.canyon.half;
    // wrap all four seams (safe y above the canyon)
    p.body.reset(-6, 0.12 * HH); NEON_SCENE.update(r, r.time.now, 16); out.wrapW = p.x > WW - 60;
    p.body.reset(WW + 6, 0.12 * HH); NEON_SCENE.update(r, r.time.now, 16); out.wrapE = p.x < 60;
    p.body.reset(0.12 * WW, -6); NEON_SCENE.update(r, r.time.now, 16); out.wrapN = p.y > HH - 60;
    p.body.reset(0.12 * WW, HH + 6); NEON_SCENE.update(r, r.time.now, 16); out.wrapS = p.y < 60;
    p.body.velocity.y = 0; p.body.reset(0.12 * WW, 0.12 * HH);
    return out;})()`);
  check('CANYON is roof-blocked off-crossing, walkable at cable runs', routing.blocked && routing.crossed);
  check('toroidal wrap on all four seams', routing.wrapW && routing.wrapE && routing.wrapN && routing.wrapS);

  // -- 3b. FIRE ESCAPE railings are DESTRUCTIBLE fences (deteriorate -> shear) -
  const rails = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    var RA = C.rails[0]; RA.hp = RA.maxHp; RA.state = 0; RA.down = false;
    if (RA.spr.body) RA.spr.body.enable = true; RA.spr.setVisible(true); RA.spr.setTexture('neonRail0');
    var solid0 = RA.spr.body.enable === true;
    var bent = false;
    for (var it = 0; it < 60 && !RA.down; it++) {
      Entities.fireProjectile(r, r.playerShots, RA.x, RA.y, 0, 0, 8, 3000, 'arrow', false);
      NEON_SCENE.update(r, r.time.now, 16);
      if (RA.state === 1) bent = true;                       // saw the mid deterioration state
    }
    r.playerShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.playerShots, s); });
    return { solid0: solid0, bent: bent, down: RA.down, sheared: RA.state === 2, bodyOff: RA.spr.body.enable === false };})()`);
  check('FIRE ESCAPE rails are DESTRUCTIBLE — player fire bends then SHEARS the barrier (body off)',
    rails.solid0 && rails.bent && rails.down && rails.sheared && rails.bodyOff);

  // -- 4. KINGPIN'S PATROL: warn -> strike (alternate lanes|circles) -> gone --
  const patrol = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, P=C.patrol, p=r.player;
    p.body.reset(0.1*r.worldW, 0.1*r.worldH); p.state.lastHitAt = -1e9;
    var out = {};
    // pass 1
    P.phase='idle'; P.nextPassAt=1; P.mode='lanes'; P.arenaTarget=false;
    C.zones=[]; C.lanes=[]; r._zoneWarns.length=0;
    NEON_SCENE.update(r, r.time.now, 16);
    out.warned = P.phase==='warn' && !!P.searchG && !!P.sil;
    out.mode1 = P.mode;
    out.untargetable = !!P.sil && !P.sil.mob;               // scenery-actor, no hurtbox
    P.warnUntil=1; P.strikeAt=1;
    var z0=C.zones.length, l0=C.lanes.length;
    NEON_SCENE.update(r, r.time.now, 16);
    out.struck1 = P.phase==='strike';
    out.circlesFired = out.mode1==='circles' ? (C.zones.length>z0) : (C.lanes.length>l0);
    // gone
    P.goneAt=1; NEON_SCENE.update(r, r.time.now, 16); out.gone = P.phase==='idle';
    // pass 2 alternates
    P.nextPassAt=1; C.zones=[]; C.lanes=[]; r._zoneWarns.length=0;
    NEON_SCENE.update(r, r.time.now, 16);
    out.mode2 = P.mode;
    // cleanup
    NEON_SCENE.annihilate(r); P.phase='idle'; P.nextPassAt=Infinity; P.arenaTarget=false;
    return out;})()`);
  check('PATROL sweeps a searchlight WARN (untargetable scenery-actor)', patrol.warned && patrol.untargetable);
  check('PATROL STRIKES telegraphed lanes|circles and clears — and ALTERNATES each pass',
    patrol.struck1 && patrol.circlesFired && patrol.gone && patrol.mode1 !== patrol.mode2, patrol.mode1 + ' -> ' + patrol.mode2);

  const clearFix = `(function(){var r=${scene('Realm')}, C=r._ne;
    C.zones=[]; C.lanes=[]; C.trails=[]; C.patches=[]; C.mobWarns=[]; r._zoneWarns.length=0;
    r.mobs.children.iterate(function(o){ if(o&&o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o);} });
    r.hitstopActive=false;})()`;

  // -- 5. STREET PUNK swing + SPY DRONE aim-laser ----------------------------
  const pd = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player;
    C.zones=[]; C.lanes=[]; C.trails=[]; C.patches=[]; C.mobWarns=[]; r._zoneWarns.length=0; r.hitstopActive=false;
    var out={};
    p.body.reset(0.1*r.worldW, 0.1*r.worldH); p.state.lastHitAt=-1e9;
    // PUNK: chain warn -> swing arc
    var m = Entities.spawnMob(r, 'streetPunk', p.x+70, p.y);
    m.mob.nextSwingAt=1; Entities.updateMob(r, m, p, r.time.now);
    out.punkWarn = m.mob.swingLockUntil > r.time.now;
    var hp0=p.state.hp; m.mob.swingLockUntil=1;
    Entities.updateMob(r, m, p, r.time.now);
    out.punkHit = p.state.hp < hp0 && Math.hypot(p.body.velocity.x,p.body.velocity.y) > 150;
    p.state.hp=hp0; p.body.velocity.x=0; p.body.velocity.y=0; p.state.lastHitAt=-1e9;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    // DRONE: aim-line -> laser beam
    var dr = Entities.spawnMob(r, 'spyDrone', p.x+150, p.y);
    dr.mob.nextFireAt=1; Entities.updateMob(r, dr, p, r.time.now);
    out.droneAim = dr.mob.aimLockUntil > r.time.now && !!dr.mob._aimWarn;
    var hp1=p.state.hp; dr.mob.aimLockUntil=1;
    Entities.updateMob(r, dr, p, r.time.now);
    out.droneFire = p.state.hp < hp1 && dr.mob.fireUntil > r.time.now;
    p.state.hp=hp1; p.state.lastHitAt=-1e9;
    Entities.clearNameTag(dr); dr.body.enable=false; r.mobs.killAndHide(dr);
    return out;})()`);
  check('STREET PUNK spins the chain then swings a warned arc (damage + knockback)', pd.punkWarn && pd.punkHit);
  check('SPY DRONE telegraphs an aim-line then fires the laser along it', pd.droneAim && pd.droneFire);

  // -- 6. RIOT ENFORCER shield BLOCK + baton shove ---------------------------
  const enf = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player;
    p.body.reset(0.3*r.worldW, 0.3*r.worldH);
    var m = Entities.spawnMob(r, 'riotEnforcer', p.x+110, p.y);
    m.mob.nextShoveAt = r.time.now + 999999;                 // no shove during the block test
    Entities.updateMob(r, m, p, r.time.now);                 // settle facing + _shHp
    // FRONTAL hit -> BLOCKED (refunded)
    var hp0 = m.mob.hp; Entities.hurtMob(r, m, 30, r.time.now); r.hitstopActive=false;
    Entities.updateMob(r, m, p, r.time.now);
    var blocked = m.mob.hp === hp0;
    // BAIT THE SHOVE: during the locked windup, hits LAND (block check skipped)
    m.body.reset(p.x+90, p.y);                               // in shove range (undo knockback drift)
    m.mob.nextShoveAt = 1; Entities.updateMob(r, m, p, r.time.now);
    var shoving = m.mob.shoveLockUntil > r.time.now;
    var hp1 = m.mob.hp; Entities.hurtMob(r, m, 20, r.time.now); r.hitstopActive=false;
    Entities.updateMob(r, m, p, r.time.now);                 // still locked -> no refund
    var flankHit = m.mob.hp < hp1;
    // the shove lands: warned cone -> damage + knockback
    m.body.reset(p.x+90, p.y);
    p.state.lastHitAt=-1e9; var php=p.state.hp; p.body.velocity.x=0; p.body.velocity.y=0;
    m.mob.shoveLockUntil = 1; Entities.updateMob(r, m, p, r.time.now);
    var shoved = p.state.hp < php && Math.hypot(p.body.velocity.x,p.body.velocity.y) > 200;
    p.state.hp=php; p.body.velocity.x=0; p.body.velocity.y=0; p.state.lastHitAt=-1e9;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    return { blocked: blocked, flankHit: flankHit, shoved: shoved };})()`);
  check('RIOT ENFORCER BLOCKS frontal shots — but a hit during the shove windup LANDS', enf.blocked && enf.flankHit);
  check('…and the baton SHOVE is a warned cone (damage + knockback)', enf.shoved);

  // -- 7. NETRUNNER glitch zones + TURRET POD anchored lane sequence ---------
  const nt = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player;
    p.body.reset(0.1*r.worldW, 0.1*r.worldH); p.state.lastHitAt=-1e9;
    var out={};
    // NETRUNNER: 2 warned glitch zones -> detonate for damage
    var nr = Entities.spawnMob(r, 'netrunner', p.x+220, p.y);
    nr.mob.nextZoneAt=1; var z0=C.zones.length;
    Entities.updateMob(r, nr, p, r.time.now);
    out.painted = C.zones.length - z0 === 2;
    p.body.reset(C.zones[C.zones.length-1].x, C.zones[C.zones.length-1].y);
    var hp0=p.state.hp; C.zones.forEach(function(z){ z.at=1; });
    NEON_SCENE.update(r, r.time.now, 16);
    out.detonated = p.state.hp < hp0;
    p.state.hp=hp0; p.state.lastHitAt=-1e9;
    Entities.clearNameTag(nr); nr.body.enable=false; r.mobs.killAndHide(nr);
    C.zones=[]; r._zoneWarns.length=0;
    // TURRET POD: anchored + rises + warned lane sequence
    var t = Entities.spawnMob(r, 'turretPod', p.x+180, p.y+40);
    Entities.updateMob(r, t, p, r.time.now);                 // rising
    t.body.velocity.x = 200; Entities.updateMob(r, t, p, r.time.now);
    out.anchored = Math.abs(t.body.velocity.x) < 1;          // never moves
    t.mob.risenAt=1; t.mob.nextLaneAt=1;
    var l0=C.lanes.length; Entities.updateMob(r, t, p, r.time.now);
    out.lanes = C.lanes.length - l0 === t.mob.def.turret.laneCount;
    Entities.clearNameTag(t); t.body.enable=false; r.mobs.killAndHide(t);
    C.lanes=[];
    return out;})()`);
  check('NETRUNNER paints 2 warned GLITCH ZONES that detonate for damage', nt.painted && nt.detonated);
  check('TURRET POD is ANCHORED (never moves) and fires a warned laser-lane sequence', nt.anchored && nt.lanes);

  // -- 8. CYBER RATS scuttle · CARGO LIFTER crate children CAP ----------------
  const rl = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player;
    var out={};
    // RATS: erratic skitter dash
    var rt = Entities.spawnMob(r, 'cyberRats', p.x+120, p.y);
    rt.mob.nextDashAt=1; Entities.updateMob(r, rt, p, r.time.now);
    out.scuttled = rt.mob.dashUntil > r.time.now && Math.hypot(rt.body.velocity.x, rt.body.velocity.y) > 200;
    Entities.clearNameTag(rt); rt.body.enable=false; r.mobs.killAndHide(rt);
    // LIFTER: warned drop circles -> crate children (bossWave + crateChild) with a CAP
    var lf = Entities.spawnMob(r, 'cargoLifter', p.x+200, p.y);
    lf.mob.nextDropAt=1; var z0=C.zones.length;
    Entities.updateMob(r, lf, p, r.time.now);
    out.dropped = C.zones.length - z0 === lf.mob.def.drop.count && !!C.zones[C.zones.length-1].opts.crate;
    var q0 = r._spawnQueue.length;
    C.zones.forEach(function(z){ z.at=1; }); p.body.reset(0.1*r.worldW,0.1*r.worldH);
    NEON_SCENE.update(r, r.time.now, 16);
    var qNew = r._spawnQueue.slice(q0);
    out.childrenQueued = qNew.length > 0 && qNew.every(function(e){ return e.key==='streetPunk' && e.bossWave && e.crateChild; });
    r._spawnQueue.length = q0;
    // CAP: fill the child slots, re-detonate -> zero new
    var cap = lf.mob.def.drop.childCap, made=[];
    for (var i=0;i<cap;i++){ var c=Entities.spawnMob(r,'streetPunk', 0.5*r.worldW, 0.5*r.worldH); c.mob.crateChild=true; made.push(c); }
    lf.mob.nextDropAt=1; Entities.updateMob(r, lf, p, r.time.now);
    var q1=r._spawnQueue.length; C.zones.forEach(function(z){ z.at=1; });
    NEON_SCENE.update(r, r.time.now, 16);
    out.capped = r._spawnQueue.length - q1 === 0;
    r._spawnQueue.length = q1;
    made.forEach(function(c){ Entities.clearNameTag(c); c.body.enable=false; r.mobs.killAndHide(c); });
    Entities.clearNameTag(lf); lf.body.enable=false; r.mobs.killAndHide(lf);
    C.zones=[]; r._zoneWarns.length=0;
    return out;})()`);
  check('CYBER RATS skitter-dash the player (erratic swarm)', rl.scuttled);
  check('CARGO LIFTER drops warned crates -> punks (bossWave/crateChild) that respect the CHILD CAP',
    rl.dropped && rl.childrenQueued && rl.capped);

  // -- 9. NEON VIPER light-trail lifetime · EXO LOADER charge+slam -----------
  const vl = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, p=r.player;
    var out={};
    // VIPER: warned dash -> light-trail hazard that LINGERS then expires
    var v = Entities.spawnMob(r, 'neonViper', p.x+150, p.y);
    v.mob.nextDashAt=1; Entities.updateMob(r, v, p, r.time.now);
    out.vwarn = v.mob.dashLockUntil > r.time.now;
    v.mob.dashLockUntil=1; Entities.updateMob(r, v, p, r.time.now);
    out.vdash = v.mob.dashUntil > r.time.now && Math.hypot(v.body.velocity.x,v.body.velocity.y) > 300;
    var tr0=C.trails.length; v.mob._lastSeg=0; Entities.updateMob(r, v, p, r.time.now);
    out.trailLaid = C.trails.length > tr0;
    var seg = C.trails[C.trails.length-1];
    out.shortLife = seg.dieAt - r.time.now <= v.mob.def.dash.trailMs + 50 && seg.dmg > 0;
    // trail expires
    C.patches.forEach(function(pa){ pa.dieAt = 1; });
    NEON_SCENE.update(r, r.time.now, 16);
    out.expired = C.patches.length === 0;
    C.trails=[];
    Entities.clearNameTag(v); v.body.enable=false; r.mobs.killAndHide(v);
    // LOADER: warned charge lane -> warned slam circle (alternate)
    var lo = Entities.spawnMob(r, 'exoLoader', p.x+200, p.y);
    lo.mob.nextComboAt=1; lo.mob.comboIdx=0;
    Entities.updateMob(r, lo, p, r.time.now);
    out.chargeWarn = lo.mob.chargeLockUntil > r.time.now && !!lo.mob._chargeG;
    lo.mob.chargeLockUntil=1; Entities.updateMob(r, lo, p, r.time.now);
    out.charging = lo.mob.chargeUntil > r.time.now && Math.abs(lo.body.velocity.x) > 300;
    lo.mob.chargeUntil=1; Entities.updateMob(r, lo, p, r.time.now);
    var z0=C.zones.length; lo.mob.nextComboAt=1;
    Entities.updateMob(r, lo, p, r.time.now);
    out.slam = C.zones.length - z0 === 1 && !!lo.mob.pound;
    C.zones=[]; r._zoneWarns.length=0;
    Entities.clearNameTag(lo); lo.body.enable=false; r.mobs.killAndHide(lo);
    return out;})()`);
  check('NEON VIPER dashes and lays a LIGHT TRAIL hazard that lingers then expires',
    vl.vwarn && vl.vdash && vl.trailLaid && vl.shortLife && vl.expired);
  check('EXO LOADER alternates a warned CHARGE lane -> warned SLAM circle', vl.chargeWarn && vl.charging && vl.slam);

  // -- 10. unfreeze() shifts the map clocks ----------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    C.patrol.nextPassAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'neonViper', r.player.x + 900, r.player.y);
    m.mob.nextDashAt = r.time.now + 6000;
    var before = { p: C.patrol.nextPassAt, m: m.mob.nextDashAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { p: C.patrol.nextPassAt - before.p, m: m.mob.nextDashAt - before.m };
      C.patrol.nextPassAt = Infinity;
      Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts patrol + mob clocks', shift.p > 500 && shift.m > 500);

  // -- 11. quota -> CRASH entrance (deterministic delayedCall capture) -------
  await page.evaluate(clearFix);
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota;
    var caps=[], orig=r.time.delayedCall.bind(r.time);
    r.time.delayedCall=function(ms,cb){ caps.push(cb); return orig(ms, function(){}); };
    r.startBossFight();
    for (var p=0;p<30 && !r.boss;p++){ caps.splice(0).forEach(function(f){ try{f();}catch(e){} }); }
    r.time.delayedCall=orig;
    if (r.scanning && r.dismissScouter) r.dismissScouter();
    try { r.physics.world.resume(); } catch(e){}
  })()`);
  await sleep(150);
  const arrival = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    NEON_SCENE.bossUpdate(r, r.boss, r.player, r.time.now);
    return { key: r.boss && r.boss.boss.key, armed: C.bossArmed,
             drones: C.drones.length, allUp: C.drones.every(function(d){return d.alive;}),
             immune: r.boss.boss.immune === true, wreck: !!C.wreck };})()`);
  check('the Apache CRASHES -> SOCIAL ENGINEER steps off (wreck stays as cover)',
    arrival.key === 'socialEngineer' && arrival.armed && arrival.wreck);
  check('FIREWALL up on arrival: 3 shield drones orbiting, boss IMMUNE',
    arrival.drones === 3 && arrival.allUp && arrival.immune);

  // -- 12. FIREWALL GATE: zero damage while shielded, opens when popped ------
  const gate = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss, bs=b.boss;
    bs.nextVerbAt = r.time.now + 1e9; bs.nextBreachAt = r.time.now + 1e9; bs.busyUntil=0;
    NEON_SCENE.bossUpdate(r, b, r.player, r.time.now);        // immune=true
    var hp0 = bs.hp;
    Entities.hurtBoss(r, b, 200);                             // direct shot
    Entities.applyBurn && Entities.applyBurn(b, { dmg: 40, ticks: 3, every: 100 }, r.time.now);
    Entities.hurtBoss(r, b, 999);                             // DoT-style
    var shielded0 = bs.hp === hp0;
    // POP every drone with player shots
    for (var it=0; it<14; it++){
      var any=false;
      C.drones.forEach(function(d){ if(d.alive){ any=true; Entities.fireProjectile(r, r.playerShots, d.spr.x, d.spr.y, 0, 0, 30, 3000, 'arrow', false); } });
      NEON_SCENE.update(r, r.time.now, 16);
      if(!any) break;
    }
    var allDown = C.drones.every(function(d){ return !d.alive; });
    NEON_SCENE.bossUpdate(r, b, r.player, r.time.now);        // immune should clear
    var hp1 = bs.hp; Entities.hurtBoss(r, b, 100);
    var opened = bs.immune === false && bs.hp < hp1;
    // clear stray player shots
    r.playerShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.playerShots, s); });
    return { shielded0: shielded0, allDown: allDown, opened: opened };})()`);
  check('FIREWALL gate is AIRTIGHT — boss takes ZERO damage (shots AND DoT) while any drone lives', gate.shielded0);
  check('popping all 3 drones OPENS his hurtbox (damage lands)', gate.allDown && gate.opened);

  // -- 13. DDOS DARTS (fromBoss, slow homing) --------------------------------
  const darts = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss, p=r.player;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    p.body.reset(b.x + 300, b.y + 40);
    NEON_SCENE._ddosDarts(r, b, p, r.time.now);
    var darts=[]; r.enemyShots.children.iterate(function(s){ if(s&&s.active&&s.proj&&s.proj._ddos) darts.push(s); });
    var fired = darts.length === b.boss.def.patterns.ddosDarts.count && darts.every(function(s){ return s.proj.fromBoss; });
    // homing steer: the velocity angle turns toward the player over a few frames
    var s0 = darts[0]; var a0 = Math.atan2(s0.body.velocity.y, s0.body.velocity.x);
    p.body.reset(b.x - 200, b.y - 200);                      // move the target hard off-axis
    for (var i=0;i<8;i++) NEON_SCENE.update(r, r.time.now, 16);
    var a1 = Math.atan2(s0.body.velocity.y, s0.body.velocity.x);
    var want = Math.atan2(p.y - s0.y, p.x - s0.x);
    var turnedToward = Math.abs(Math.atan2(Math.sin(want-a1),Math.cos(want-a1))) < Math.abs(Math.atan2(Math.sin(want-a0),Math.cos(want-a0)));
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots, s); });
    return { fired: fired, turnedToward: turnedToward };})()`);
  check('DDOS DARTS: 3 fromBoss bolts that slowly HOME (capped turn) — dodgeable', darts.fired && darts.turnedToward);

  // -- 14. POP-UP ADS: block YOUR shots, NOT his darts -----------------------
  const ads = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss;
    NEON_SCENE._popupAds(r, b, r.time.now);
    var made = C.adWalls.length === b.boss.def.patterns.popupAds.count;
    var W = C.adWalls[0], hp0 = W.hp;
    // a PLAYER shot at the wall is EATEN + damages the wall (state advances)
    var ps = Entities.fireProjectile(r, r.playerShots, W.x, W.y, 0, 0, 30, 3000, 'arrow', false);
    NEON_SCENE.update(r, r.time.now, 16);
    var blocksPlayer = !ps.active && W.hp < hp0;
    // an ENEMY dart PASSES THROUGH untouched
    var es = Entities.fireProjectile(r, r.enemyShots, W.x, W.y, 0, 0, 0, 3000, 'orbShot', false);
    NEON_SCENE.update(r, r.time.now, 16);
    var dartPasses = es.active;
    Entities.killProjectile(r.enemyShots, es);
    r.playerShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.playerShots, s); });
    // clear the ad walls
    C.adWalls.forEach(function(w){ try{w.spr.destroy();}catch(e){} }); C.adWalls=[];
    return { made: made, blocksPlayer: blocksPlayer, dartPasses: dartPasses };})()`);
  check('POP-UP ADS block YOUR shots (eaten + deteriorate) but his darts PHASE THROUGH',
    ads.made && ads.blocksPlayer && ads.dartPasses);

  // -- 15. REMOTE ACCESS hacked turrets --------------------------------------
  const remote = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss;
    C.zones=[]; r._zoneWarns.length=0;
    NEON_SCENE._remoteAccess(r, b, r.time.now);
    var warned = C.zones.length === b.boss.def.patterns.remoteAccess.count && !!C.zones[0].opts.hackTurret;
    var q0 = r._spawnQueue.length;
    C.zones.forEach(function(z){ z.at=1; }); NEON_SCENE.update(r, r.time.now, 16);
    var qNew = r._spawnQueue.slice(q0);
    var rose = qNew.length === b.boss.def.patterns.remoteAccess.count && qNew.every(function(e){ return e.key==='turretPod' && e.bossWave; });
    r._spawnQueue.length = q0;
    // a bossWave turret gets the hacked (red glow / fromBoss) tag on update
    var t = Entities.spawnMob(r, 'turretPod', b.x+60, b.y+60); t.mob.bossWave = true;
    NEON_SCENE.update(r, r.time.now, 16);
    var tagged = t.mob.hacked === true;
    Entities.clearNameTag(t); t.body.enable=false; r.mobs.killAndHide(t);
    C.zones=[]; r._zoneWarns.length=0;
    return { warned: warned, rose: rose, tagged: tagged };})()`);
  check('REMOTE ACCESS warns 2 vents -> hacked TURRET PODS rise (bossWave, red-glow tag)',
    remote.warned && remote.rose && remote.tagged);

  // -- 16. SYSTEM BREACH: spreading grid -> trigger -> VENT x1.5 --------------
  const breach = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss, bs=b.boss, p=r.player;
    // ensure drones up first (so the vent DROP is meaningful)
    C.drones.forEach(function(d){ d.alive=true; d.hp=d.maxHp; d.respawnAt=0; });
    bs.busyUntil=0; bs.rootUntil=0;
    NEON_SCENE._systemBreach(r, b, r.time.now);
    var cfg = bs.def.patterns.systemBreach;
    var telegraphed = !!C.breach && C.breach.cells.length === cfg.cols*cfg.rows && C.breach.phase==='warn';
    // stand in a cell; fire all cells
    p.body.reset(C.breach.cells[0].x, C.breach.cells[0].y); p.state.lastHitAt=-1e9; var hp0=p.state.hp;
    C.breach.cells.forEach(function(cl){ cl.at=1; });
    NEON_SCENE.update(r, r.time.now, 16);
    var triggered = p.state.hp < hp0 && C.breach.phase==='glitch';
    p.state.hp=hp0; p.body.reset(b.x-40, b.y-40); p.state.lastHitAt=-1e9;
    // glitch -> VENT overheat
    C.breach.glitchUntil = 1;
    NEON_SCENE.update(r, r.time.now, 16);
    var vented = C.breach.phase==='vent' && bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5 &&
                 C.drones.every(function(d){ return !d.alive; }) && bs.immune===false;
    // drones DON'T respawn during the vent
    NEON_SCENE.update(r, r.time.now, 16);
    var stayDown = C.drones.every(function(d){ return !d.alive; });
    // vented damage lands at 1.5x
    var hpB=bs.hp; Entities.hurtBoss(r, b, 100); var ventDmg = hpB - bs.hp;
    // vent ends -> restore
    bs.ventedUntil = 1;
    NEON_SCENE.update(r, r.time.now, 16);
    var restored = C.breach === null;
    return { telegraphed: telegraphed, triggered: triggered, vented: vented, stayDown: stayDown, ventDmg: ventDmg, restored: restored };})()`);
  check('SYSTEM BREACH telegraphs a spreading grid, then TRIGGERS for damage', breach.telegraphed && breach.triggered);
  check('…then OVERHEATS: drones drop, VENTED x1.5 window (150 dmg), drones stay down, then restores',
    breach.vented && breach.stayDown && breach.ventDmg === 150 && breach.restored);

  // -- 17. <50% BACKUP never overlaps SYSTEM BREACH resolution ---------------
  const backup = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne, b=r.boss, bs=b.boss;
    bs.hp = bs.maxHp * 0.4;                                   // below 50%
    bs.nextVerbAt = r.time.now + 1e9; bs.nextBreachAt = r.time.now + 1e9; bs.busyUntil=0;
    NEON_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var backupOn = bs.backupOn === true && C.patrol.arenaTarget === true;
    // with a LIVE breach, a backup pass is HELD (never overlaps breach)
    C.breach = { cells: [], phase: 'warn', glitchUntil: 0 };
    C.patrol.phase='idle'; C.patrol.nextPassAt=1;
    NEON_SCENE.update(r, r.time.now, 16);
    var held = C.patrol.phase === 'idle';
    // clear the breach -> the backup pass may start
    C.breach = null; C.patrol.nextPassAt=1;
    NEON_SCENE.update(r, r.time.now, 16);
    var startsAfter = C.patrol.phase === 'warn';
    NEON_SCENE.annihilate(r); C.patrol.phase='idle'; C.patrol.nextPassAt=Infinity; C.patrol.arenaTarget=false;
    return { backupOn: backupOn, held: held, startsAfter: startsAfter };})()`);
  check('below 50% the PATROL becomes his BACKUP, and it never overlaps a live SYSTEM BREACH',
    backup.backupOn && backup.held && backup.startsAfter);

  // -- 18. kill -> chest + machinery swept -----------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; var b=r.boss;
    r._ne.drones.forEach(function(d){ d.alive=false; }); b.boss.immune=false; b.boss.ventedUntil=0;
    Entities.hurtBoss(r, b, 9999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`, null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ne;
    NEON_SCENE.update(r, r.time.now, 16);
    return !C.bossArmed && C.drones.length === 0 && C.adWalls.length === 0 && C.breach === null;})()`);
  check('the Social Engineer falls -> chest/loot flow + his machinery swept', clean);

  // -- 19. zero console errors -----------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log('\nRESULT: ' + (step - failures) + '/' + step);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); console.log('\nRESULT: 0/0'); process.exit(1); });
