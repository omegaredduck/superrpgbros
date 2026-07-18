// M18 SUGAR WORLD verification suite — realm 16, registry map.
// Registry/data · SUGAR RUSH.EXE (468 beats @156 = 180.0s) · scene layout +
// IMPASSABLE chocolate river (bridge-only crossing) · DESTRUCTIBLE fences
// (states → shatter → regrow) · CANDY PICKUPS (full-heal, no-farm guard, ground
// cap) · every mob mechanic (gummy lunge · gingerdead slash + top-half split ·
// lancer charge lane · jawbreaker roll + armor chips · twirler drifting spiral ·
// gumdrop hop + 2-mini split · cotton slow aura + CC cap · mint block/spin ·
// mallow slam + 3-mini split · mimic ambush · corn dart lanes) · wrap · unfreeze
// · SUGAR BEAR: den-rise arrival, P1 (cane hook / gumball volley + armor deplete
// / cotton smother / BEAR HUG signature + vent) · P2 (twin sweeps / jawbreaker
// summon / sugar stomp / CANDY RAIN signature + sprint + vent) · vented ×1.5.
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

  // -- 1. boot: registry + the trance ---------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.sugar, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.sugarBear;
    return { def: !!MAPS.defs.sugar, roster: DATA.biomes.sugar.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'sugar' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 11-mob roster + console unlock', reg.def && reg.roster === 11 && reg.consoleRow, reg.roster + ' mobs');
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6, reg.hints + ' hints');
  check('SUGAR RUSH.EXE: 468 beats @156, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 468 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ---------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'sugar' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);
  const layout = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg;
    return { id: r.realmId, fences: C.fences.length, denRing: C.fences.filter(function(f){return f.denRing;}).length,
             arena: !!C.arena, candies: C.candies.length, bridges: C.river.bridges.length };})()`);
  check('sugar scene: destructible fences (village + den ring) + den arena',
    layout.id === 'sugar' && layout.fences > 12 && layout.denRing > 4 && layout.arena && layout.bridges === 2);

  // wipe ambient mobs so fixtures run clean
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 3. CHOCOLATE RIVER — impassable except at the bridges -----------------
  const river = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var bx = C.river.bridges[0], midX = (C.river.bridges[0] + C.river.bridges[1]) / 2;
    var onBridge = SUGAR_SCENE._onBridge(C, bx) === true;
    var offBridge = SUGAR_SCENE._onBridge(C, midX) === false;
    r.hitstopActive = false;
    // in the river OFF a bridge → shoved back to last-safe (impassable)
    C.lastSafe = { x: midX, y: 200 };
    p.body.reset(midX, SUGAR_SCENE._riverY(C, midX));
    p.body.velocity.x = 0; p.body.velocity.y = 200;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var blocked = Math.abs(p.x - midX) < 2 && Math.abs(p.y - 200) < 2;
    // ON a bridge → the river band is crossable (not shoved)
    p.body.reset(bx, SUGAR_SCENE._riverY(C, bx));
    p.body.velocity.y = 100;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var crossed = Math.abs(p.y - SUGAR_SCENE._riverY(C, bx)) < 4;
    p.body.reset(midX, 200); p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { onBridge: onBridge, offBridge: offBridge, blocked: blocked, crossed: crossed };})()`);
  check('river is IMPASSABLE off-bridge, CROSSABLE on a bridge',
    river.onBridge && river.offBridge && river.blocked && river.crossed);

  // -- 4. DESTRUCTIBLE FENCE — states → shatter → regrow ---------------------
  const fence = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg;
    var F = C.fences[0]; F.hp = F.maxHp = 24; F.down = false; F.state = 0; F.spr.setVisible(true); F.spr.body.enable = true;
    function shoot(){ var s = Entities.fireProjectile(r, r.playerShots, F.x, F.y, 0, 0, 10, 3000, 'arrow', false);
      SUGAR_SCENE.update(r, r.time.now, 16); return s; }
    shoot(); var s0 = F.state, hp0 = F.hp;             // 24-10=14 → still whole (>0.5)
    shoot(); var cracked = F.state === 1;              // 14-10=4 → cracked
    shoot(); var shattered = F.down === true && F.spr.body.enable === false;   // 4-10 → shatter
    F.regrowAt = 1;                                    // fast-forward the regrow
    SUGAR_SCENE.update(r, r.time.now, 16);
    var regrew = F.down === false && F.spr.body.enable === true && F.hp === F.maxHp;
    return { whole: s0 === 0 && hp0 === 14, cracked: cracked, shattered: shattered, regrew: regrew };})()`);
  check('candy-cane fence: whole → crack → SHATTER (collider off) → slow regrow',
    fence.whole && fence.cracked && fence.shattered && fence.regrew);

  // -- 5. CANDY PICKUPS — full heal + NO-FARM guard + ground cap -------------
  const candy = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var cc = r.realmDef.candy, savedRate = cc.dropChance;
    cc.dropChance = 1;                                  // force a drop
    var c0 = C.candies.length;
    var m = Entities.spawnMob(r, 'gummyBear', p.x + 300, p.y);
    Entities.hurtMob(r, m, 99999, r.time.now);          // legit kill → drops
    var dropped = C.candies.length === c0 + 1;
    // child + boss-add NEVER drop (no-farm)
    var c1 = C.candies.length;
    var kid = Entities.spawnMob(r, 'gumdropMini', p.x + 320, p.y); kid.mob.isChild = true;
    Entities.hurtMob(r, kid, 99999, r.time.now);
    var add = Entities.spawnMob(r, 'gummyBear', p.x + 340, p.y); add.mob.bossWave = true;
    Entities.hurtMob(r, add, 99999, r.time.now);
    var noFarm = C.candies.length === c1;
    cc.dropChance = savedRate;
    // eat one → FULL HEAL
    p.state.hp = 5; p.state.lastHitAt = -1e9;
    SUGAR_SCENE._spawnCandy(r, C, p.x, p.y);
    r.hitstopActive = false;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var healed = p.state.hp === p.state.stats.hp;
    // ground cap (~3): spawning many keeps it capped
    for (var i = 0; i < 6; i++) SUGAR_SCENE._spawnCandy(r, C, p.x + 500 + i * 10, p.y + 500);
    var capped = C.candies.length <= (cc.maxGround || 3);
    C.candies.slice().forEach(function(k){ try { k.spr.destroy(); } catch(e){} }); C.candies = [];
    return { dropped: dropped, noFarm: noFarm, healed: healed, capped: capped };})()`);
  check('CANDY drops on a legit kill, and eating it FULL-HEALs', candy.dropped && candy.healed);
  check('NO-FARM guard: split-children + boss adds never drop; ground cap holds', candy.noFarm && candy.capped);

  // -- 5b. childCap must be a CONCURRENT cap: a REAL spawned child (isChild
  // lives on the DEF, not the instance — core never copies it) must DECREMENT
  // childCount at death, else splits lock out for the rest of the realm. -----
  const childDec = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    C.childCount = 3;
    var kid = Entities.spawnMob(r, 'gumdropMini', p.x + 400, p.y);   // NOTHING sets kid.mob.isChild — only its def has it
    var instHasFlag = kid.mob.isChild === true;                       // proves the instance lacks the flag
    var c0 = C.candies.length;
    Entities.hurtMob(r, kid, 99999, r.time.now);                      // real death → mob-died fires
    var decremented = C.childCount === 2;
    var noDrop = C.candies.length === c0;                             // child still drops NO candy
    return { instHasFlag: instHasFlag, decremented: decremented, noDrop: noDrop };})()`);
  check('childCap is CONCURRENT: a real spawned child decrements childCount at death (no instance isChild)',
    childDec.instHasFlag === false && childDec.decremented && childDec.noDrop);

  // -- 6. GUMMY BEAR lunge --------------------------------------------------
  const gummy = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'gummyBear', p.x + 150, p.y);
    m.mob.nextLungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // windup
    var warned = m.mob.lungeAt > r.time.now;
    m.mob.lungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // LUNGE
    var lunging = m.mob.lungeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, lunging: lunging };})()`);
  check('GUMMY BEAR jelly-glints, then chomp-LUNGES', gummy.warned && gummy.lunging);

  // -- 7. GINGERDEAD slash cone + TOP-HALF split ----------------------------
  const ginger = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    p.body.reset(400, 400);
    var m = Entities.spawnMob(r, 'gingerdead', p.x + 150, p.y);   // mob to the RIGHT → cone telegraphs toward the player (LEFT)
    m.mob.nextSlashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // slash telegraph
    var warned = m.mob.slashAt > r.time.now && !!m.mob._slashG;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp; p.body.reset(m.x - 40, m.y);   // stay inside the telegraphed cone
    m.mob.slashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // slash resolves
    var hurt = p.state.hp < hp0; p.state.hp = hp0;
    // death → top half crawls on (1 child), and the child never re-splits
    C.childCount = 0;
    var q0 = r._spawnQueue.length;
    Entities.hurtMob(r, m, 99999, r.time.now);
    var split = r._spawnQueue.length - q0 === 1 && r._spawnQueue[q0].key === 'gingerHalf' && C.childCount === 1;
    r._spawnQueue.length = q0; C.childCount = 0;
    p.body.reset(200, 200);
    return { warned: warned, hurt: hurt, split: split };})()`);
  check('GINGERDEAD MAN slashes a warned cone, and its top half CRAWLS on at death',
    ginger.warned && ginger.hurt && ginger.split);

  // -- 8. CANDY LANCER charge lane ------------------------------------------
  const lancer = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'candyLancer', p.x + 200, p.y);
    m.mob.nextChargeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // lance couched, lane warned
    var warned = m.mob.chargeLockUntil > r.time.now && !!m.mob._chargeG;
    m.mob.chargeLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);            // CHARGE
    var charging = m.mob.chargeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, charging: charging };})()`);
  check('CANDY LANCER couches → warned charge lane → dashes it', lancer.warned && lancer.charging);

  // -- 9. JAWBREAKER roll + ARMOR LAYER chips -------------------------------
  const jaw = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'jawbreaker', p.x + 200, p.y);
    Entities.updateMob(r, m, p, r.time.now);            // settle _layer
    var layer0 = m.mob._layer;
    Entities.hurtMob(r, m, 25, r.time.now);             // chip a full layer (20hp)
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var chipped = m.mob._layer < layer0;
    m.mob.nextRollAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // roll lane warned
    var warned = m.mob.rollLockUntil > r.time.now && !!m.mob._rollG;
    m.mob.rollLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);            // ROLLS
    var rolling = m.mob.rollUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { layer0: layer0, chipped: chipped, warned: warned, rolling: rolling };})()`);
  check('JAWBREAKER armor LAYERS chip off as it takes damage, then it warns + ROLLS',
    jaw.layer0 === 5 && jaw.chipped && jaw.warned && jaw.rolling);

  // -- 10. LOLLI TWIRLER drifting spiral ------------------------------------
  const twirler = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var m = Entities.spawnMob(r, 'lolliTwirler', p.x + 200, p.y);
    m.mob.nextSpinAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // spin-up telegraph
    var spinning = m.mob.spinLockUntil > r.time.now;
    var sp0 = C.spirals.length;
    m.mob.spinLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);            // spiral spawns
    var spawned = C.spirals.length === sp0 + 1;
    var S = C.spirals[C.spirals.length - 1], x0 = S.x, y0 = S.y;
    SUGAR_SCENE.update(r, r.time.now, 16);              // it drifts
    SUGAR_SCENE.update(r, r.time.now, 16);
    var drifts = Math.hypot(S.x - x0, S.y - y0) > 0.5;  // actually translated
    C.spirals.forEach(function(s){ if (s.g) s.g.destroy(); }); C.spirals = [];
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { spinning: spinning, spawned: spawned, drifts: drifts };})()`);
  check('LOLLI TWIRLER (armless) spins up → a DRIFTING spiral sweep', twirler.spinning && twirler.spawned && twirler.drifts);

  // -- 11. GUMDROP hop + landing + 2-mini split -----------------------------
  const gumdrop = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var m = Entities.spawnMob(r, 'gumdrop', p.x + 200, p.y);
    m.mob.nextHopAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // HOP
    var hopped = m.mob.hopUntil > r.time.now;
    var z0 = C.zones.length;
    m.mob.hopUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);            // land → warned squish circle
    var landed = C.zones.length === z0 + 1;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    C.childCount = 0; var q0 = r._spawnQueue.length;
    Entities.hurtMob(r, m, 99999, r.time.now);          // split into 2 minis
    var split = r._spawnQueue.length - q0 === 2 && r._spawnQueue.slice(q0).every(function(e){ return e.key === 'gumdropMini'; });
    r._spawnQueue.length = q0; C.childCount = 0;
    return { hopped: hopped, landed: landed, split: split };})()`);
  check('GUMDROP hops → warned squish landing → SPLITS into 2 minis', gumdrop.hopped && gumdrop.landed && gumdrop.split);

  // -- 12. COTTON DRIFT slow aura (CC-capped) -------------------------------
  const cotton = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var m = Entities.spawnMob(r, 'cottonDrift', p.x + 40, p.y);
    p.body.reset(m.x + 40, m.y); p.body.velocity.x = 100; r.hitstopActive = false;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    // two drifts don't stack below the 0.4× cap
    var m2 = Entities.spawnMob(r, 'cottonDrift', p.x + 10, p.y);
    p.body.reset(m.x, m.y); p.body.velocity.x = 100;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var capped = p.body.velocity.x >= 40 - 1;
    p.body.velocity.x = 0; p.body.reset(200, 200);
    [m, m2].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { slowed: slowed, capped: capped };})()`);
  check('COTTON DRIFT sticky aura SLOWS you — and the CC-stack cap holds at 0.4×', cotton.slowed && cotton.capped);

  // -- 13. MINT GUARDIAN block front → shield-spin → exposed ----------------
  const mint = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(400, 400);
    var m = Entities.spawnMob(r, 'mintGuardian', p.x + 200, p.y);   // mob to the RIGHT → its front faces LEFT (the player)
    m.mob.nextSpinCyc = r.time.now + 999999;            // don't auto-spin yet
    var s = Entities.fireProjectile(r, r.playerShots, m.x - 30, m.y, 0, 0, 10, 3000, 'arrow', false);   // shot on the player side = front
    Entities.updateMob(r, m, p, r.time.now);            // front shot BLOCKED
    var blocked = !s.active;
    // shield-spin then EXPOSED → a shot lands
    m.mob.exposedUntil = r.time.now + 999999; m.mob.spinUntil = 0;
    var s2 = Entities.fireProjectile(r, r.playerShots, m.x - 30, m.y, 0, 0, 10, 3000, 'arrow', false);
    Entities.updateMob(r, m, p, r.time.now);
    var openWindow = s2.active === true;                // not blocked while exposed
    Entities.killProjectile(r.playerShots, s2);
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { blocked: blocked, openWindow: openWindow };})()`);
  check('MINT GUARDIAN blocks frontal shots, then its shield-spin EXPOSES it', mint.blocked && mint.openWindow);

  // -- 14. MALLOW BRUTE slam + 3-mini split ---------------------------------
  const mallow = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var m = Entities.spawnMob(r, 'mallowBrute', p.x + 200, p.y);
    m.mob.nextSlamAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);            // warned squish-slam circle
    var slammed = C.zones.length === z0 + 1 && m.mob.slamUntil > r.time.now;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    C.childCount = 0; var q0 = r._spawnQueue.length;
    Entities.hurtMob(r, m, 99999, r.time.now);          // split into 3 minis
    var split = r._spawnQueue.length - q0 === 3 && r._spawnQueue.slice(q0).every(function(e){ return e.key === 'mallowMini'; });
    // global children cap refuses more splits
    C.childCount = C.childCap;
    var m2 = Entities.spawnMob(r, 'mallowBrute', p.x + 250, p.y);
    var q1 = r._spawnQueue.length;
    Entities.hurtMob(r, m2, 99999, r.time.now);
    var capped = r._spawnQueue.length === q1;
    r._spawnQueue.length = q0; C.childCount = 0;
    return { slammed: slammed, split: split, capped: capped };})()`);
  check('MALLOW BRUTE warned squish-slam → SPLITS into 3 (global children cap enforced)',
    mallow.slammed && mallow.split && mallow.capped);

  // -- 15. CUPCAKE MIMIC ambush (sealed → shimmer → maw → chomp) -------------
  const mimic = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'cupcakeMimic', p.x + 300, p.y);
    p.body.reset(1200, 1200);
    Entities.updateMob(r, m, p, r.time.now);            // far → stays SEALED
    var sealed = m.mob._mphase === 'seal';
    p.body.reset(m.x + 40, m.y);
    Entities.updateMob(r, m, p, r.time.now);            // near → shimmer
    var shimmering = m.mob._mphase === 'shimmer';
    m.mob.shimmerAt = 1;
    Entities.updateMob(r, m, p, r.time.now);            // maw OPENS
    var opened = m.mob._mphase === 'open';
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp; m.mob.chompAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);            // CHOMP
    var chomped = p.state.hp < hp0 && m.mob._mphase === 'reseal'; p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); p.body.reset(200, 200);
    return { sealed: sealed, shimmering: shimmering, opened: opened, chomped: chomped };})()`);
  check('CUPCAKE MIMIC sits SEALED → shimmers near → maw OPENS → chomps → reseals',
    mimic.sealed && mimic.shimmering && mimic.opened && mimic.chomped);

  // -- 16. CANDY CORN dart lanes in sequence --------------------------------
  const corn = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg, p=r.player;
    var m = Entities.spawnMob(r, 'candyCorn', p.x + 200, p.y);
    m.mob.nextDartAt = 1;
    var d0 = C.dartLanes.length;
    Entities.updateMob(r, m, p, r.time.now);            // 3 warned dart lanes queued
    var darted = C.dartLanes.length === d0 + 3;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var L = C.dartLanes[C.dartLanes.length - 1];
    p.body.reset((L.x0 + L.x1) / 2, (L.y0 + L.y1) / 2);
    C.dartLanes.forEach(function(l){ l.at = 1; }); r.hitstopActive = false;
    SUGAR_SCENE.update(r, r.time.now, 16);              // lanes strike
    var struck = p.state.hp < hp0; p.state.hp = hp0;
    C.dartLanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.dartLanes = [];
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); p.body.reset(200, 200);
    return { darted: darted, struck: struck };})()`);
  check('CANDY CORN PACK fires 3 warned dart lanes that STRIKE in sequence', corn.darted && corn.struck);

  // -- 17. wrap + unfreeze --------------------------------------------------
  const wrap = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.setPosition(r.worldW + 10, 300); p.body.reset(r.worldW + 10, 300); p.body.velocity.x = 0;
    var beyond = p.x >= r.worldW;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var wrapped = beyond && p.x < r.worldW * 0.5;
    p.body.reset(200, 200);
    return { wrapped: wrapped };})()`);
  check('toroidal wrap carries the player across the seam', wrap.wrapped);

  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg;
    var m = Entities.spawnMob(r, 'gumdrop', r.player.x + 900, r.player.y);
    m.mob.nextHopAt = r.time.now + 6000;
    var before = m.mob.nextHopAt;
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = m.mob.nextHopAt - before;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts mob clocks by the paused span', shift > 500, shift.toFixed(0) + 'ms');

  // -- 18. quota → DEN-RISE arrival (deterministic capture) -----------------
  const arrival = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    r.player.state.kills = DATA.realm.killQuota;
    if (!r.bossPortal && !r.boss) r.openBossPortal();
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    r.startBossFight();
    for (var i = 0; i < 30 && !r.boss; i++) caps.splice(0).forEach(function(f){ try { f(); } catch(e){} });
    for (var j = 0; j < 8; j++) caps.splice(0).forEach(function(f){ try { f(); } catch(e){} });   // flush scouter
    r.time.delayedCall = orig;
    return { key: r.boss && r.boss.boss.key, armed: C.bossArmed, scanning: r.scanning === true,
             nearDen: r.boss ? Math.hypot(r.boss.x - C.arena.x, r.boss.y - C.arena.y) < 140 : false };})()`);
  check('SUGAR BEAR rises in the DEN and the scouter opens',
    arrival.key === 'sugarBear' && arrival.armed && arrival.nearDen && arrival.scanning);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.scanning = false; if (r.scanUi) { try { r.scanUi.destroy(); } catch(e){} r.scanUi = null; }})()`);

  // -- 19. P1 dispatch + CANE HOOK + GUMBALL VOLLEY (armor deplete) + SMOTHER -
  const p1 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sg;
    bs.phase = 1; bs.busyUntil = 0; bs.rootUntil = 0;
    // CANE HOOK
    var h0 = C.hooks.length;
    SUGAR_SCENE._caneHook(r, b, p, r.time.now);
    var hooked = C.hooks.length === h0 + 1;
    C.hooks.forEach(function(o){ if (o.g) o.g.destroy(); }); C.hooks = [];
    // GUMBALL VOLLEY — 3 boss circles + armor depletes
    bs.armor = bs.def.patterns.gumballVolley.studs;
    var z0 = C.zones.length, arm0 = bs.armor;
    SUGAR_SCENE._gumballVolley(r, b, p, r.time.now);
    var volleyed = C.zones.length - z0 === 3 && C.zones[C.zones.length - 1].fromBoss === true;
    var deplete = bs.armor < arm0;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    // COTTON SMOTHER → sticky slow patch
    var s0 = C.smothers.length;
    SUGAR_SCENE._cottonSmother(r, b, p, r.time.now);
    var smothered = C.smothers.length === s0 + 1;
    var pc0 = C.patches.length; C.smothers[C.smothers.length - 1].at = 1;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var patch = C.patches.length > pc0 && C.patches[C.patches.length - 1].slowMult < 1;
    for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i, 1); }
    return { hooked: hooked, volleyed: volleyed, deplete: deplete, smothered: smothered, patch: patch };})()`);
  check('P1: CANE HOOK warns · GUMBALL VOLLEY paints 3 boss circles (armor DEPLETES)',
    p1.hooked && p1.volleyed && p1.deplete);
  check('P1: COTTON SMOTHER blooms a sticky slow patch', p1.smothered && p1.patch);

  // -- 20. P1 signature BEAR HUG → dodge → vent ×1.5 ------------------------
  const hug = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sg;
    bs.phase = 1; bs.verbIdx = 2; bs.busyUntil = 0; bs.rootUntil = 0; bs.nextVerbAt = 1;
    SUGAR_SCENE.bossUpdate(r, b, p, r.time.now);         // dispatch picks the P1 signature
    var hugSet = !!C.hug;
    // DODGE — stand clear of the grab circle
    p.body.reset(C.hug.x + 400, C.hug.y + 400);
    C.hug.at = 1; r.hitstopActive = false;
    SUGAR_SCENE.update(r, r.time.now, 16);
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5 && !C.hug;
    return { hugSet: hugSet, vented: vented };})()`);
  check('BEAR HUG (P1 signature) → dodge → he stumbles, VENTED ×1.5', hug.hugSet && hug.vented);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    b.boss.ventedUntil = r.time.now + 2000; b.boss.ventDmgMult = 1.5;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150 (×1.5)', ventDmg === 150, ventDmg + ' dmg');

  // -- 21. P2 transition + verbs (twin sweeps · jaw summon · sugar stomp) ----
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sg;
    bs.hp = bs.maxHp * 0.4;                              // cross the 50% threshold
    bs.busyUntil = 0; bs.rootUntil = 0; bs.ventedUntil = 0;
    SUGAR_SCENE.bossUpdate(r, b, p, r.time.now);
    var phase2 = bs.phase === 2 && b.texture.key === 'sugBearP2Hi';
    bs.busyUntil = 0; bs.rootUntil = 0;
    // TWIN CANE SWEEPS
    var c0 = C.cones.length;
    SUGAR_SCENE._caneSweep(r, b, p, r.time.now);
    var swept = C.cones.length - c0 === 2;
    C.cones.forEach(function(o){ if (o.g) o.g.destroy(); }); C.cones = [];
    // JAWBREAKER SUMMON — warned lanes + bossWave rollers
    var l0 = C.lanes.length, q0 = r._spawnQueue.length;
    SUGAR_SCENE._jawSummon(r, b, p, r.time.now);
    var summoned = C.lanes.length - l0 === 2 && r._spawnQueue.slice(q0).every(function(e){ return e.key === 'jawbreaker' && e.bossWave; });
    C.lanes.forEach(function(o){ if (o.g) o.g.destroy(); }); C.lanes = []; r._spawnQueue.length = q0;
    // SUGAR RUSH STOMP — chained warned landings
    var z0 = C.zones.length;
    SUGAR_SCENE._sugarStomp(r, b, p, r.time.now);
    var stomped = C.zones.length - z0 === bs.def.patterns.sugarStomp.count;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { phase2: phase2, swept: swept, summoned: summoned, stomped: stomped };})()`);
  check('P2 THE SUGAR CRASH: eyes blaze (sprite swap) + TWIN SWEEPS + JAW SUMMON + STOMP',
    p2.phase2 && p2.swept && p2.summoned && p2.stomped);

  // -- 22. P2 signature CANDY RAIN → sprint → longest vent -------------------
  const rain = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sg;
    bs.phase = 2; bs.verbIdx = 2; bs.busyUntil = 0; bs.rootUntil = 0; bs.ventedUntil = 0; bs.nextVerbAt = 1;
    p.body.reset(C.arena.x, C.arena.y + 400);            // clear of the rain + sprint lane
    SUGAR_SCENE.bossUpdate(r, b, p, r.time.now);
    var rainSet = !!C.rain && C.rain.circles.length === bs.def.patterns.candyRain.count;
    C.rain.circles.forEach(function(sp){ sp.at = 1; });
    r.hitstopActive = false;
    SUGAR_SCENE.update(r, r.time.now, 16);               // all candy circles fall
    SUGAR_SCENE.update(r, r.time.now, 16);               // (allDone) → the wall-to-wall sprint ARMS
    var rained = C.rain && C.rain.circles.every(function(sp){ return sp.fired; }) && !!C.rain.sprintG;
    C.rain.sprintAt = 1;
    SUGAR_SCENE.update(r, r.time.now, 16);               // sprint fires → longest vent
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5 && !C.rain;
    return { rainSet: rainSet, rained: rained, vented: vented };})()`);
  check('CANDY RAIN (P2 signature): circles fall → warned SPRINT → longest vent (panting)',
    rain.rainSet && rain.rained && rain.vented);

  // -- 23. kill → chest + boss machinery swept -------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`, null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sg;
    SUGAR_SCENE.update(r, r.time.now, 16);
    return !C.hug && !C.rain && !C.bossArmed && C.cones.length === 0 && C.hooks.length === 0;})()`);
  check('SUGAR BEAR falls → chest/loot flow + his machinery swept', clean);

  // -- 24. zero console errors ----------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nRESULT: ${step - failures}/${step}`);
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASS');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
