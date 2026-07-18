// M21 PREHISTORIA verification suite — realm 19, registry map 9.
// Registry/data · PRIMAL.EXE (420 beats @140 = 180.0s dark trance) · scene
// layout (nest arena + egg, river fords, game-trail ring, toroidal wrap) ·
// METEOR SHOWER cycle (omen -> warned circles in sequence -> lava puddles,
// NE bias, density cap, single system) · the 6 mob mechanics + the ptero
// recolor exemption · brachio neutral-until-provoked (cycle ≠ player) · THE
// HATCH entrance (untargetable before the flash) · THE PRIMORDIAL: tail lash /
// fire-breath rake / wing gust (capped KB) / compy call / P2 ignite + dive
// strafes / METEOR CALL signature (early-fire, NO double-fire, vented x1.5).
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

  // -- 1. boot: registry + the dark trance ------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.prehistoria, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.primordial, rv = DATA.realms.prehistoria.recolorVariants;
    return { def: !!MAPS.defs.prehistoria, roster: DATA.biomes.prehistoria.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'prehistoria' && !x.locked; }),
             variants: rv.length, pteroExempt: rv.every(function(v){ return v.base !== 'ptero'; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 7-mob roster + console unlock', reg.def && reg.roster === 7 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6, reg.hints + ' hints');
  check('PRIMAL.EXE: 420 beats @140, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 420 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');
  check('RECOLOR spawn table has exactly 6 variant rows, PTERODACTYL exempt',
    reg.variants === 6 && reg.pteroExempt);

  // -- 2. enter the realm --------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'prehistoria' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph;
    return { id: r.realmId, arena: !!C.arena, egg: !!C.egg && C.egg.active,
             fords: C.river.fords.length, trail: !!C.trail, spawn: r._realmStart.x / r.worldW < 0.3 };})()`);
  check('scene: nest arena + PRE-PLACED egg + river (ford + log bridge) + game trail + jungle spawn',
    realm.id === 'prehistoria' && realm.arena && realm.egg && realm.fords === 2 && realm.trail && realm.spawn);

  // -- 3. park the ambient cycle + wipe mobs (fixture) -------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._ph.meteor.nextAt = Infinity;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 4. METEOR SHOWER cycle: omen -> warned circles -> lava puddles ----------------
  const meteor = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph, p=r.player, cfg=r.realmDef.meteor;
    p.body.reset(r.worldW*0.15, r.worldH*0.55);
    C.zones.length = 0;
    C.meteor.nextAt = 1;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);              // OMEN + schedule impacts in sequence
    var made = C.zones.length;
    var warned = made > 0 && made <= cfg.maxLive && C.zones.every(function(z){ return z.at > r.time.now; });
    var seq = C.zones.length >= 2 ? C.zones[1].at > C.zones[0].at : true;   // land in sequence, not all at once
    // land them all + leave lava puddles
    p.body.reset(r.worldW*0.99, r.worldH*0.99);               // out of every circle
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var lava = C.patches.length > pc0 && C.patches[C.patches.length-1].src === 'a lava puddle';
    // stand in a fresh puddle -> it TICKS
    var LP = C.patches[C.patches.length-1];
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(LP.x, LP.y); LP.nextTickAt = 1;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var ticked = p.state.hp < hp0;
    p.state.hp = hp0;
    // fade: force expiry -> the puddle clears
    C.patches.forEach(function(q){ q.dieAt = 1; });
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var faded = C.patches.length === 0;
    return { made: made, warned: warned, seq: seq, lava: lava, ticked: ticked, faded: faded };})()`);
  check('METEOR SHOWER omens then warns impact circles in SEQUENCE (density-capped)',
    meteor.warned && meteor.seq, meteor.made + ' circles');
  check('impacts land -> brief LAVA PUDDLES that TICK then fade', meteor.lava && meteor.ticked && meteor.faded);

  // -- 4b. NE DENSITY BIAS (PLAN §2: heavier near the volcano quarter) ---------------
  const nebias = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph, p=r.player, cfg=r.realmDef.meteor;
    p.body.reset(r.worldW*0.05, r.worldH*0.95);              // SW, far from the NE quarter + safe radius
    C.zones.length = 0; r._zoneWarns.length = 0;
    var origRng = SIM.rng;
    SIM.rng = function(){ return 0.1; };                     // 0.1 < neBias -> NE branch; small -> NE quadrant
    try { PREHISTORIA_SCENE._meteorShower(r, C, cfg, false, r.time.now); } finally { SIM.rng = origRng; }
    var n = C.zones.length;
    var allNE = n > 0 && C.zones.every(function(z){ return z.x > r.worldW*0.5 && z.y < r.worldH*0.5; });
    C.zones.forEach(function(z){ if (z.ring) { try { z.ring.destroy(); } catch(e){} } });
    C.zones.length = 0; r._zoneWarns.length = 0;
    return { allNE: allNE, n: n };})()`);
  check('METEOR density BIASES to the NE volcano quarter (heavier near the nest)', nebias.allNE, nebias.n + ' in NE');

  // -- 5. RAPTOR pack lunger: warned mini-dash --------------------------------------
  const raptor = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(r.worldW*0.15, r.worldH*0.55);
    var m = Entities.spawnMob(r, 'raptor', p.x + 180, p.y);
    m.mob.nextLungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // warn
    var warned = m.mob.lungeAt > r.time.now;
    m.mob.lungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // LUNGE
    var dashing = m.mob.lungeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, dashing: dashing };})()`);
  check('RAPTOR warns then LUNGES (sickle-claw mini-dash)', raptor.warned && raptor.dashing);

  // -- 6. TRICERATOPS warned charge lane + CAPPED knockback (displacement tag) -------
  const trike = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph, p=r.player;
    C.lastDisplaceAt = -1e9;
    var m = Entities.spawnMob(r, 'trike', p.x + 200, p.y);
    m.mob.nextChargeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // lane locks
    var locked = m.mob.chargeLockUntil > r.time.now && !!m.mob._chargeG;
    m.mob.chargeLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // CHARGES
    var charging = m.mob.chargeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    // contact mid-charge -> capped knockback
    m.body.reset(p.x + 20, p.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var hitKB = p.state.hp < hp0 && Math.hypot(p.body.velocity.x, p.body.velocity.y) > 150 && C.lastDisplaceAt > 0;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { locked: locked, charging: charging, hitKB: hitKB };})()`);
  check('TRICERATOPS locks a charge LANE, charges, and knocks back (capped, displacement-tagged)',
    trike.locked && trike.charging && trike.hitKB);

  // -- 7. STEGOSAURUS warned thagomizer sweep ----------------------------------------
  const stego = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(r.worldW*0.15, r.worldH*0.55);
    var m = Entities.spawnMob(r, 'stego', p.x + 120, p.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob.nextSweepAt = 1;
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    Entities.updateMob(r, m, p, r.time.now);                  // sweep telegraph
    r.time.delayedCall = orig;
    var warned = m.mob.sweepLockUntil > r.time.now;
    r.hitstopActive = false;
    if (cap) cap();                                           // the sweep lands
    var hurt = p.state.hp < hp0;
    p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, hurt: hurt };})()`);
  check('STEGOSAURUS warns then SWEEPS its thagomizer (arc damage)', stego.warned && stego.hurt);

  // -- 8. PTERODACTYL shadow-marked dive lane ----------------------------------------
  const ptero = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'ptero', p.x + 200, p.y - 50);
    m.mob.nextDiveAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // shadow lane marks
    var marked = m.mob.diveLockUntil > r.time.now && !!m.mob._diveG;
    m.mob.diveLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                  // DIVES down the lane
    var diving = m.mob.diveUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { marked: marked, diving: diving };})()`);
  check('PTERODACTYL marks a SHADOW lane, then dives down it', ptero.marked && ptero.diving);

  // -- 9. DILOPHOSAURUS venom spit -> lingering venom puddle (ticks + slows) ----------
  const dilo = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph, p=r.player;
    var m = Entities.spawnMob(r, 'dilo', p.x + 180, p.y);
    m.mob.nextSpitAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);                  // warned venom arcs
    var spat = C.zones.length - z0 === m.mob.def.spit.count;
    p.body.reset(r.worldW*0.99, r.worldH*0.1);
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var VP = C.patches[C.patches.length-1];
    var puddle = C.patches.length > pc0 && VP.slowMult && VP.src === 'lingering venom';
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(VP.x, VP.y); p.body.velocity.x = 100; VP.nextTickAt = 1;
    r.hitstopActive = false;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var slowedTicked = p.body.velocity.x < 70 && p.state.hp < hp0;
    p.state.hp = hp0; p.body.velocity.x = 0;
    C.patches.forEach(function(q){ if (q.obj) q.obj.destroy(); }); C.patches.length = 0;
    C.zones.length = 0; r._zoneWarns.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { spat: spat, puddle: puddle, slowedTicked: slowedTicked };})()`);
  check('DILOPHOSAURUS spits warned venom -> a puddle that LINGERS (slows + ticks)',
    dilo.spat && dilo.puddle && dilo.slowedTicked);

  // -- 10. BRACHIOSAURUS neutral until PROVOKED (cycle ≠ player) + quake stomp --------
  const brachio = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph, p=r.player;
    p.body.reset(r.worldW*0.5, r.worldH*0.3);
    var m = Entities.spawnMob(r, 'brachio', p.x + 60, p.y);
    Entities.updateMob(r, m, p, r.time.now);                  // NEUTRAL -> wanders, ignores you
    var neutral = !(m.mob.provokedUntil && r.time.now < m.mob.provokedUntil) && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 0;
    // a meteor lands ON it (fromCycle) -> must NOT provoke (no mob damage from the cycle)
    PREHISTORIA_SCENE._zone(r, m.x, m.y, 80, 0, 20, 'a falling meteor', false, false, r.time.now, null);
    C.zones[C.zones.length-1].at = 1;
    var hpBefore = m.mob.hp;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    Entities.updateMob(r, m, p, r.time.now);
    var cycleSafe = m.mob.hp === hpBefore && !(m.mob.provokedUntil && r.time.now < m.mob.provokedUntil);
    // the PLAYER hits it -> provoked
    Entities.hurtMob(r, m, 20, r.time.now);
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var provoked = m.mob.provokedUntil > r.time.now;
    // provoked, in range -> warned quake stomp -> ring
    m.body.reset(p.x + 120, p.y);
    m.mob.nextStompAt = 1;
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);
    r.time.delayedCall = orig;
    var stompWarn = m.mob.stompLockUntil > r.time.now && C.zones.length === z0 + 1;
    var rg0 = C.rings.length;
    if (cap) cap();
    var quaked = C.rings.length === rg0 + 1;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones.length = 0; r._zoneWarns.length = 0;
    C.rings.forEach(function(g){ g.g.destroy(); }); C.rings.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { neutral: neutral, cycleSafe: cycleSafe, provoked: provoked, stompWarn: stompWarn, quaked: quaked };})()`);
  check('BRACHIOSAURUS is NEUTRAL and the meteor cycle does NOT provoke it (fromCycle ≠ player)',
    brachio.neutral && brachio.cycleSafe);
  check('…the PLAYER provokes it -> warned QUAKE-STOMP ring', brachio.provoked && brachio.stompWarn && brachio.quaked);

  // -- 11. RECOLOR mix spawning + ptero exemption ------------------------------------
  const recolor = await page.evaluate(`(function(){var r=${scene('Realm')};
    var base = {}, variant = {}, pteroBase = true;
    for (var i = 0; i < 44; i++) {
      var m = Entities.spawnMob(r, 'raptor', 100 + i, 100);
      if (m.texture.key === 'prehistoriaRaptorHi') base.raptor = 1;
      if (m.texture.key === 'prehistoriaRaptorJungleHi') variant.raptor = 1;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      var pt = Entities.spawnMob(r, 'ptero', 100 + i, 200);
      if (pt.texture.key !== 'prehistoriaPteroHi') pteroBase = false;
      Entities.clearNameTag(pt); pt.body.enable = false; r.mobs.killAndHide(pt);
    }
    return { mixed: base.raptor && variant.raptor, pteroBase: pteroBase };})()`);
  check('RAPTORS spawn MIXED base + recolor; PTERODACTYL never recolors (exempt)',
    recolor.mixed && recolor.pteroBase);

  // -- 12. toroidal WRAP (player rings W-E) ------------------------------------------
  const wrap = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    r._ph.hatching = false;
    p.body.reset(r.worldW + 8, r.worldH * 0.5);
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var wrappedX = p.x < r.worldW * 0.5;
    p.body.reset(r.worldW * 0.5, -8);
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var wrappedY = p.y > r.worldH * 0.5;
    p.body.reset(r.worldW*0.15, r.worldH*0.55);
    return { wrappedX: wrappedX, wrappedY: wrappedY };})()`);
  check('toroidal WRAP both axes (trail + river rings stitch W-E)', wrap.wrappedX && wrap.wrappedY);

  // -- 13. clocks shift through unfreeze() -------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph;
    C.meteor.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'raptor', r.player.x + 900, r.player.y);
    m.mob.nextLungeAt = r.time.now + 6000;
    var before = { t: C.meteor.nextAt, m: m.mob.nextLungeAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { t: C.meteor.nextAt - before.t, m: m.mob.nextLungeAt - before.m };
      C.meteor.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts the meteor cycle + mob clocks', shift.t > 500 && shift.m > 500);

  // -- 14. THE HATCH: egg splits, boss untargetable until the FLASH -------------------
  const hatch = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    var def = DATA.bosses.primordial;
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push({ ms: ms, cb: cb }); return orig(ms, function(){}); };
    PREHISTORIA_SCENE.bossArrival(r, def, C.arena.x, C.arena.y);
    r.time.delayedCall = orig;
    caps.sort(function(a,b){ return a.ms - b.ms; });
    var hatchingStart = C.hatching === true;
    caps[0].cb(); caps[1].cb();                               // crack + split (pre-flash beats)
    var untargetable = !r.boss;                               // boss does NOT exist yet
    caps[2].cb();                                             // the FLASH -> boss goes live on beat 4
    var live = !!r.boss && r.boss.boss.key === 'primordial';
    var armed = C.bossArmed === true && C.hatching === false;
    var atArena = live && Math.hypot(r.boss.x - C.arena.x, r.boss.y - C.arena.y) < 60;
    return { hatchingStart: hatchingStart, untargetable: untargetable, live: live, armed: armed, atArena: atArena };})()`);
  check('THE HATCH plays out — boss is UNTARGETABLE until the flash', hatch.hatchingStart && hatch.untargetable);
  check('…on the FLASH (beat 4) THE PRIMORDIAL goes live in the nest arena', hatch.live && hatch.armed && hatch.atArena);

  // -- 15. TAIL LASH: warned arc -> heavy sweep --------------------------------------
  const lash = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.nextCallAt = r.time.now + 9e9; bs.nextAddsAt = r.time.now + 9e9;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 0; bs.nextVerbAt = 1; bs.ignited = false;
    p.body.reset(b.x + 120, b.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);        // LASH warn
    r.time.delayedCall = orig;
    var warned = bs.busyUntil > r.time.now;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    if (cap) cap();                                           // the swat lands
    var hurt = p.state.hp < hp0;
    p.state.hp = hp0;
    return { warned: warned, hurt: hurt };})()`);
  check('TAIL LASH: telegraphed arc -> heavy sweep (fromBoss damage)', lash.warned && lash.hurt);

  // -- 16. FIRE BREATH rake (sweep path telegraphed, then rakes) ---------------------
  const breath = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;   // 'breath'
    p.body.reset(b.x + 80, b.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);        // full-sweep static warn
    var warned = bs.busyUntil > r.time.now && bs.rootUntil > r.time.now;
    // drain nested delayedCalls: the launcher, then each rake step
    r.hitstopActive = false;
    for (var pass = 0; pass < 6 && caps.length; pass++) { var batch = caps.splice(0); batch.forEach(function(f){ try { f(); } catch(e){} }); }
    r.time.delayedCall = orig;
    var raked = p.state.hp < hp0;
    p.state.hp = hp0;
    return { warned: warned, raked: raked };})()`);
  check('FIRE BREATH telegraphs the FULL sweep path, then RAKES across (rooted)', breath.warned && breath.raked);

  // -- 17. WING GUST warned cone -> capped knockback push ----------------------------
  const gust = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._ph;
    C.lastDisplaceAt = -1e9;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1;   // 'gust'
    p.body.reset(b.x + 120, b.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    r.time.delayedCall = orig;
    var warned = bs.busyUntil > r.time.now;
    r.hitstopActive = false;
    if (cap) cap();                                           // gust buffets
    var pushed = p.state.hp < hp0 && Math.hypot(p.body.velocity.x, p.body.velocity.y) > 150 && C.lastDisplaceAt > 0;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { warned: warned, pushed: pushed };})()`);
  check('WING GUST: warned cone -> CAPPED knockback (displacement-tagged)', gust.warned && gust.pushed);

  // -- 18. COMPY CALL: 2-3 boss compys scurry in (bossWave, NO drops) ----------------
  const call = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextAddsAt = 1; bs.nextVerbAt = r.time.now + 9e9; bs.nextCallAt = r.time.now + 9e9;
    var q0 = r._spawnQueue.length;
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    var got = r._spawnQueue.slice(q0);
    var ok = got.length === bs.def.patterns.compyCall.count && got.every(function(e){ return e.key === 'compy' && e.bossWave && e.noDrop; });
    r._spawnQueue.length = q0;
    return { ok: ok, n: got.length };})()`);
  check('COMPY CALL summons the swarm (bossWave, NO drops)', call.ok, call.n + ' compys');

  // -- 19. P2: feathers IGNITE (<50%) + DIVE STRAFES unlock --------------------------
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextVerbAt = r.time.now + 9e9; bs.nextAddsAt = r.time.now + 9e9; bs.nextCallAt = r.time.now + 9e9;
    bs.hp = bs.maxHp * 0.4;                                   // drop below the P2 gate
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    var ignited = bs.ignited === true && b.texture.key === 'prehistoriaPrimordialIgnitedHi';
    // now the dive verb is in rotation
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 3; bs.nextVerbAt = 1;   // 'dive' in the ignited pool
    p.body.reset(b.x + 160, b.y);
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    var diving = !!bs.diveLane && bs.diveLane.length === bs.def.patterns.dive.count;
    // land the strafes
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset((bs.diveLane[0].x0 + bs.diveLane[0].x1)/2, (bs.diveLane[0].y0 + bs.diveLane[0].y1)/2);
    r.hitstopActive = false;
    bs.diveLane.forEach(function(L){ L.at = 1; });
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    var struck = p.state.hp < hp0;
    p.state.hp = hp0;
    bs.hp = bs.maxHp;   // restore for later
    return { ignited: ignited, diving: diving, struck: struck };})()`);
  check('P2 <50%: feathers IGNITE (texture swap) and DIVE STRAFES unlock + land', p2.ignited && p2.diving && p2.struck);

  // -- 20. METEOR CALL signature: early-fire, NO double-fire, vented x1.5 -------------
  const sig = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._ph;
    C.zones.length = 0; C.patches.length = 0; C.pendingVent = null;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextCallAt = 1; bs.nextVerbAt = r.time.now + 9e9; bs.nextAddsAt = r.time.now + 9e9;
    p.body.reset(r.worldW*0.05, r.worldH*0.95);              // far from the arena ring
    PREHISTORIA_SCENE.bossUpdate(r, b, p, r.time.now);
    var called = C.zones.length === bs.def.patterns.meteorCall.count && !!C.pendingVent;
    var fromBoss = C.zones.every(function(z){ return z.fromBoss === true; });
    // DOUBLE-FIRE GUARD: ambient cycle must NOT fire while the boss lives
    C.meteor.nextAt = 1;
    var z0 = C.zones.length;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);              // scene.boss set -> ambient suppressed
    // (zones may only shrink as the called ones land; never grow from an ambient omen)
    var noDouble = C.zones.length <= z0;
    // land the called stones + fire the vent window
    C.zones.forEach(function(z){ z.at = 1; });
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    C.pendingVent.at = 1;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    C.patches.forEach(function(q){ if (q.obj) q.obj.destroy(); }); C.patches.length = 0;
    return { called: called, fromBoss: fromBoss, noDouble: noDouble, vented: vented };})()`);
  check('METEOR CALL early-fires the cycle (fromBoss ring), NO ambient double-fire',
    sig.called && sig.fromBoss && sig.noDouble);
  check('the last called stone leaves him WINDED — vented + rooted', sig.vented);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150 (x1.5)', ventDmg === 150, ventDmg + ' dmg');

  // -- 21. kill -> chest + the machinery swept ---------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ph;
    PREHISTORIA_SCENE.update(r, r.time.now, 16);
    return !C.bossArmed && !C.pendingVent && C.meteor.nextAt !== Infinity;})()`);
  check('The Primordial falls -> chest/loot flow + the sky calms (cycle re-armed)', clean);

  // -- 22. zero console errors --------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nRESULT: ${step - failures}/${step}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
