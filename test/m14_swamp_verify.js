// M14 WITCH'S SWAMP verification suite — realm 12, registry map 8.
// Registry/data · WISP RAVE (420 beats @140 = 180.0s) · island/plank layout
// + WATER RULE (slow-wade 0.45×) · HEX TOTEMS (rise → aura fields hit mobs
// too → shootable shatter w/ env credit · max-2 rule) · the mapVerbs (leech
// latch-release · turtle tuck armor · myconid spore slows · toad seep
// mortar · serpent wrap lane · sprite heal · imp smash+flame · mimic quake
// hops · mossback sleep→wake combo) · THE BREWMISTRESS: cauldron-rise
// entrance, ladle/flask/totem-reroute/gas/adds, GRAND BREW dive → POT TIPS
// half-arena wave → vented ×1.5, kill → chest.
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

  // -- 1. boot: registry + the trance ------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.swamp, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.brewmistress;
    return { def: !!MAPS.defs.swamp, roster: DATA.biomes.swamp.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'swamp' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 12-mob roster + console unlock', reg.def && reg.roster === 12 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('WISP RAVE: 420 beats @140, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 420 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm --------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'swamp' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw;
    return { id: r.realmId, isles: C.isles.length, planks: C.planks.length,
             cauldron: !!C.cauldron, arena: !!C.arena, spawnS: r._realmStart.y / r.worldH > 0.85 };})()`);
  check('swamp scene: 7 islands + plank paths + the giant cauldron + dock spawn',
    realm.id === 'swamp' && realm.isles === 7 && realm.planks >= 12 && realm.cauldron && realm.spawnS);

  // -- 3. park the totem cycle (fixture) + wipe mobs + WATER RULE -----------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._sw.totemCycle.nextAt = Infinity;
    r.spawnEvent.paused = true;   // M7k: park the DIRECTOR too — on slow runs its
    // witchlings plant totems + wander into count/velocity fixtures (flaky 6/10/25/26/30)
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);
  const water = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    var out = {};
    p.body.reset(C.isles[2].x, C.isles[2].y);                // the mire (island)
    p.body.velocity.x = 100;
    SWAMP_SCENE.update(r, r.time.now, 16);
    out.isle = p.body.velocity.x;
    p.body.reset(r.worldW * 0.05, r.worldH * 0.05);          // open water corner
    p.body.velocity.x = 100;
    SWAMP_SCENE.update(r, r.time.now, 16);
    out.water = p.body.velocity.x;
    var P = C.planks[0];                                     // mid-plank
    p.body.reset((P.x0 + P.x1) / 2, (P.y0 + P.y1) / 2);
    p.body.velocity.x = 100;
    SWAMP_SCENE.update(r, r.time.now, 16);
    out.plank = p.body.velocity.x;
    p.body.velocity.x = 0;
    p.body.reset(C.isles[2].x, C.isles[2].y);
    return out;})()`);
  check('WATER RULE: islands + planks run free, open water slow-wades (0.45×)',
    water.isle > 90 && water.plank > 90 && water.water < 55,
    `isle ${water.isle.toFixed(0)} plank ${water.plank.toFixed(0)} water ${water.water.toFixed(0)}`);

  // -- 4. HEX TOTEM: rise → SLOW aura (player + mobs) → shot down → splinter credit ------
  const totem = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    var cfg = r.realmDef.totem;
    SWAMP_SCENE._totemWarn(r, C, 0, 'slow', r.time.now, cfg);
    var warned = C.totemWarns.length === 1;
    C.totemWarns[0].at = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);                   // RISES
    var T = C.totems[0];
    var rose = C.totems.length === 1 && T.hp === cfg.hp && T.spr.active;
    // slow aura: player inside
    p.body.reset(T.x + 60, T.y);
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var slowedP = p.body.velocity.x < 70;
    // ...and MOBS too (the witch's magic is indiscriminate)
    var m = Entities.spawnMob(r, 'bogling', T.x - 60, T.y);
    m.body.velocity.x = 100;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var slowedM = m.body.velocity.x < 70;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    // shoot it down — splinter kills a parked mob (env credit)
    var v = Entities.spawnMob(r, 'bogling', T.x + 30, T.y);
    var kills0 = p.state.kills;
    for (var i = 0; i < 12; i++) Entities.fireProjectile(r, r.playerShots, T.x, T.y, 0, 0, 5, 3000, 'arrow', false);
    SWAMP_SCENE.update(r, r.time.now, 16);
    var down = C.totems.length === 0;
    var out = { warned: warned, rose: rose, slowedP: slowedP, slowedM: slowedM,
                down: down, victimDead: !v.active, credited: p.state.kills - kills0 };
    if (v.active) { Entities.clearNameTag(v); v.body.enable = false; r.mobs.killAndHide(v); }
    p.body.velocity.x = 0; p.body.reset(C.isles[2].x, C.isles[2].y);
    return out;})()`);
  check('HEX TOTEM shimmers, RISES, and its SLOW aura grips you AND the mobs',
    totem.warned && totem.rose && totem.slowedP && totem.slowedM);
  check('shot down → splinter burst kills the mob beside it (env credit)',
    totem.down && totem.victimDead && totem.credited === 1);

  // -- 5. DRAIN + WEAKEN hexes -----------------------------------------------------------
  const hexes = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    var cfg = r.realmDef.totem;
    // DRAIN: ticks the player and KILLS a weak mob (env-credited)
    SWAMP_SCENE._totemRise(r, C, 1, 'drain', p.x + 60, p.y, cfg.hp, false, r.time.now, cfg);
    var T = C.totems[0];
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'bogling', T.x + 40, T.y);
    m.mob.hp = 3;
    var kills0 = p.state.kills;
    T.nextDrainAt = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var drained = p.state.hp < hp0;
    var mobDied = !m.active && p.state.kills - kills0 === 1;
    p.state.hp = hp0;
    SWAMP_SCENE._totemShatter(r, C, T, r.time.now, true);
    // WEAKEN: shots fired from inside leave at 0.6×
    SWAMP_SCENE._totemRise(r, C, 2, 'weaken', p.x, p.y, cfg.hp, false, r.time.now, cfg);
    var T2 = C.totems[0];
    var s = Entities.fireProjectile(r, r.playerShots, p.x + 400, p.y + 400, 0, 0, 10, 3000, 'arrow', false);
    SWAMP_SCENE.update(r, r.time.now, 16);
    var weakened = s.proj.dmg === 6;
    Entities.killProjectile(r.playerShots, s);
    SWAMP_SCENE._totemShatter(r, C, T2, r.time.now, true);
    if (m.active) { Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); }
    return { drained: drained, mobDied: mobDied, weakened: weakened };})()`);
  check('DRAIN hex ticks you AND kills the weak mob inside (env credit)', hexes.drained && hexes.mobDied);
  check('WEAKEN hex: shots fired from inside land at 0.6×', hexes.weakened);

  // -- 6. max-2 rule: with two totems up the cycle refuses a third ------------------------
  const maxup = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw;
    var cfg = r.realmDef.totem;
    SWAMP_SCENE._totemRise(r, C, 0, 'slow', 100, 100, cfg.hp, false, r.time.now, cfg);
    SWAMP_SCENE._totemRise(r, C, 1, 'drain', 200, 100, cfg.hp, false, r.time.now, cfg);
    C.totemCycle.nextAt = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var refused = C.totems.length === 2 && C.totemWarns.length === 0;
    C.totemCycle.nextAt = Infinity;
    C.totems.slice().forEach(function(T){ SWAMP_SCENE._totemShatter(r, C, T, r.time.now, true); });
    return { refused: refused };})()`);
  check('NEVER MORE THAN 2 UP: the cycle refuses a third totem', maxup.refused);

  // -- 7. GIANT LEECH: lunge → LATCH (short) → shot off ------------------------------------
  const leech = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'giantLeech', p.x + 150, p.y);
    m.mob.nextLungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // warn
    var warned = m.mob.lungeAt > r.time.now;
    m.mob.lungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // LUNGE
    var lunging = m.mob.lungeUntil > r.time.now;
    m.body.reset(p.x + 20, p.y);                             // contact mid-lunge
    Entities.updateMob(r, m, p, r.time.now);                 // LATCH
    var latched = !!C.latch && C.latch.m === m;
    var short = latched && C.latch.until - r.time.now <= 1000;   // SHORT (~0.8s)
    m.mob.nextDrainAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // drain tick
    var drained = p.state.hp < hp0;
    Entities.hurtMob(r, m, 10, r.time.now);                  // SHOOT it off
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var shotOff = !C.latch;
    p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    C.latch = null;
    return { warned: warned, lunging: lunging, latched: latched, short: short,
             drained: drained, shotOff: shotOff };})()`);
  check('GIANT LEECH lunges, LATCHES (short + draining), and is SHOT OFF',
    leech.warned && leech.lunging && leech.latched && leech.short && leech.drained && leech.shotOff);

  // -- 8. SNAPJAW TURTLE: snap cone + TUCK armor refunds, then OPENS -----------------------
  const turtle = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'snapjawTurtle', p.x + 140, p.y);
    m.mob.nextSnapAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // snap telegraph
    var snapped = m.mob.snapLockUntil > r.time.now;
    m.mob.snapLockUntil = 0;
    Entities.updateMob(r, m, p, r.time.now);                 // settle _tHp
    var hp0 = m.mob.hp;
    Entities.hurtMob(r, m, 15, r.time.now);                  // shot → TUCKS
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var tucked = m.mob._tucked === true;
    var tuckHp = m.mob.hp;
    Entities.hurtMob(r, m, 20, r.time.now);                  // shell TINK — refunded
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var refunded = m.mob.hp === tuckHp;
    m.mob.tuckUntil = 1;                                     // fast-forward: OPENS
    Entities.updateMob(r, m, p, r.time.now);
    var opened = m.mob._tucked === false;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { snapped: snapped, tucked: tucked, refunded: refunded, opened: opened,
             took: hp0 - tuckHp };})()`);
  check('SNAPJAW TURTLE snaps, TUCKS when shot (TINK refund), then OPENS again',
    turtle.snapped && turtle.tucked && turtle.refunded && turtle.opened);

  // -- 9. MYCONID spore slows + TOAD seep mortar --------------------------------------------
  const zoners = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    var m = Entities.spawnMob(r, 'sporecapMyconid', p.x + 200, p.y);
    m.mob.nextSporeAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);
    var spored = C.zones.length === z0 + 2;
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    SWAMP_SCENE.update(r, r.time.now, 16);                   // clouds settle
    var clouds = C.patches.length === pc0 + 2 && C.patches[C.patches.length - 1].slowMult === 0.55;
    // stand in one → slowed
    var PA = C.patches[C.patches.length - 1];
    p.body.reset(PA.x, PA.y);
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    p.body.velocity.x = 0;
    // toad: 3 warned flasks → toxic seeps that TICK
    var t2 = Entities.spawnMob(r, 'toadAlchemist', p.x + 200, p.y);
    t2.mob.nextLobAt = 1;
    var z1 = C.zones.length;
    Entities.updateMob(r, t2, p, r.time.now);
    var lobbed = C.zones.length === z1 + 3;
    p.body.reset(r.worldW * 0.9, r.worldH * 0.9);            // out of the blasts
    var pc1 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    SWAMP_SCENE.update(r, r.time.now, 16);
    var seeps = C.patches.length === pc1 + 3;
    var SE = C.patches[C.patches.length - 1];
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(SE.x, SE.y);
    SE.nextTickAt = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);
    var ticked = p.state.hp < hp0;
    p.state.hp = hp0;
    // cleanup transient patches (keep the 3 permanent mire seeps)
    for (var i = C.patches.length - 1; i >= 0; i--) {
      if (C.patches[i].dieAt !== Infinity) { if (C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i, 1); }
    }
    [m, t2].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    p.body.reset(C.isles[2].x, C.isles[2].y);
    return { spored: spored, clouds: clouds, slowed: slowed, lobbed: lobbed, seeps: seeps, ticked: ticked };})()`);
  check('SPORECAP MYCONID puffs 2 warned circles → violet SLOW clouds',
    zoners.spored && zoners.clouds && zoners.slowed);
  check('TOAD ALCHEMIST mortars 3 flasks → lingering toxic seeps that TICK',
    zoners.lobbed && zoners.seeps && zoners.ticked);

  // -- 10. MIRE SERPENT wrap-lane strike + GLOWCAP SPRITE heals ------------------------------
  const pair = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'mireSerpent', p.x + 200, p.y);
    m.mob.nextStrikeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // lane locks
    var locked = m.mob.strikeLockUntil > r.time.now && !!m.mob._strikeG;
    m.mob.strikeLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // STRIKES
    var striking = m.mob.strikeUntil > r.time.now && Math.abs(m.body.velocity.x) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    // sprite mends a wounded ally
    var hurt = Entities.spawnMob(r, 'snapjawTurtle', p.x + 380, p.y);
    hurt.mob.hp = 50;
    var s = Entities.spawnMob(r, 'glowcapSprite', p.x + 400, p.y);
    s.mob.nextHealAt = 1;
    r.hitstopActive = false;
    Entities.updateMob(r, s, p, r.time.now);
    var healed = hurt.mob.hp === 62;
    // ...but never during hitstop
    s.mob.nextHealAt = 1;
    r.hitstopActive = true;
    Entities.updateMob(r, s, p, r.time.now);
    var respected = hurt.mob.hp === 62;
    r.hitstopActive = false;
    [hurt, s].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { locked: locked, striking: striking, healed: healed, respected: respected };})()`);
  check('MIRE SERPENT locks a wrap-aware lane, then STRIKES down it', pair.locked && pair.striking);
  check('GLOWCAP SPRITE mends the wounded (+12) — and respects hitstop', pair.healed && pair.respected);

  // -- 11. BOTTLED IMP smash + flame · CAULDRON MIMIC quake hop + spew -----------------------
  const elites = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'bottledImp', p.x + 60, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // arms the smash
    var armed = m.mob.smashAt > r.time.now;
    var pc0 = C.patches.length, kills0 = p.state.kills;
    m.mob.smashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // SMASH
    var smashed = !m.active && p.state.hp < hp0 && C.patches.length === pc0 + 1;
    p.state.hp = hp0;
    r.hitstopActive = false;
    SWAMP_SCENE.update(r, r.time.now, 16);                   // warn swept
    // mimic: hop → landing quake ring; spew → 2 warned brews
    var k = Entities.spawnMob(r, 'cauldronMimic', p.x + 300, p.y);
    k.mob.nextHopAt = 1; k.mob.nextSpewAt = r.time.now + 999999;
    Entities.updateMob(r, k, p, r.time.now);                 // HOP
    var hopped = k.mob.hopUntil > r.time.now;
    var r0 = C.rings.length;
    k.mob.hopUntil = 1;
    Entities.updateMob(r, k, p, r.time.now);                 // LANDS → quake
    var quaked = C.rings.length === r0 + 1;
    var z0 = C.zones.length;
    k.mob.nextSpewAt = 1;
    Entities.updateMob(r, k, p, r.time.now);                 // SPEW
    var spewed = C.zones.length === z0 + 2;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    C.rings.forEach(function(G){ G.g.destroy(); }); C.rings = [];
    for (var i = C.patches.length - 1; i >= 0; i--) {
      if (C.patches[i].dieAt !== Infinity) { if (C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i, 1); }
    }
    Entities.clearNameTag(k); k.body.enable = false; r.mobs.killAndHide(k);
    return { armed: armed, smashed: smashed, hopped: hopped, quaked: quaked, spewed: spewed };})()`);
  check('BOTTLED IMP warns, SMASHES (blast + flame patch, self gone)', elites.armed && elites.smashed);
  check('CAULDRON MIMIC quake-hops (landing ring) + spews 2 warned brews',
    elites.hopped && elites.quaked && elites.spewed);

  // -- 12. MOSSBACK: sleeps → shot wakes it → charge + slam combo ----------------------------
  const moss = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw, p=r.player;
    var far = Entities.spawnMob(r, 'mossback', p.x + 500, p.y);
    Entities.updateMob(r, far, p, r.time.now);
    var asleep = !far.mob.awake && !far.mob.wakeAt;
    Entities.hurtMob(r, far, 10, r.time.now);                // shooting WAKES it
    r.hitstopActive = false;
    Entities.updateMob(r, far, p, r.time.now);
    var startled = !!far.mob.wakeAt;
    far.mob.wakeAt = 1;
    Entities.updateMob(r, far, p, r.time.now);
    var woke = far.mob.awake === true;
    far.body.reset(p.x + 200, p.y);                          // step into combo range
    far.mob.nextComboAt = 1; far.mob.comboIdx = 0;
    Entities.updateMob(r, far, p, r.time.now);               // combo 1: CHARGE lane
    var chargeWarn = far.mob.chargeLockUntil > r.time.now && !!far.mob._chargeG;
    far.mob.chargeLockUntil = 1;
    Entities.updateMob(r, far, p, r.time.now);
    var charging = far.mob.chargeUntil > r.time.now && Math.abs(far.body.velocity.x) > 300;
    far.mob.chargeUntil = 1;
    Entities.updateMob(r, far, p, r.time.now);
    var z0 = C.zones.length;
    far.mob.nextComboAt = 1;
    Entities.updateMob(r, far, p, r.time.now);               // combo 2: SLAM
    var slammed = C.zones.length === z0 + 1 && !!far.mob.pound;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    Entities.clearNameTag(far); far.body.enable = false; r.mobs.killAndHide(far);
    return { asleep: asleep, startled: startled, woke: woke,
             chargeWarn: chargeWarn, charging: charging, slammed: slammed };})()`);
  check('MOSSBACK sleeps until SHOT — shimmers, wakes furious', moss.asleep && moss.startled && moss.woke);
  check('…then alternates: warned CHARGE lane → warned SLAM circle',
    moss.chargeWarn && moss.charging && moss.slammed);

  // -- 13. clocks shift through unfreeze() -----------------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw;
    C.totemCycle.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'toadAlchemist', r.player.x + 900, r.player.y);
    m.mob.nextLobAt = r.time.now + 6000;
    var before = { t: C.totemCycle.nextAt, m: m.mob.nextLobAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { t: C.totemCycle.nextAt - before.t, m: m.mob.nextLobAt - before.m };
      C.totemCycle.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts totem-cycle + mob clocks', shift.t > 500 && shift.m > 500);

  // -- 14. quota → CAULDRON-RISE entrance ------------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'bogling', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  // M7k: headless fps dilation stretches the 3.2s entrance chain to ~40s wall
  // on a loaded 2-core box — widen the wait, the chain itself is verified below.
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 120000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw;
    return { key: r.boss.boss.key, armed: C.bossArmed, cyclePaused: C.totemCycle.nextAt === Infinity,
             nearPot: Math.hypot(r.boss.x - C.cauldron.x, r.boss.y - C.cauldron.y) < 120 };})()`);
  check('THE BREWMISTRESS rises OUT of the giant cauldron (bloops accelerating)',
    boss.key === 'brewmistress' && boss.armed && boss.nearPot);
  check('the totem cycle holds its breath on boss arrival', boss.cyclePaused);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 15. LADLE SWING: cone → swat + knockback -------------------------------------------------
  const ladle = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player;
    bs.nextBrewAt = r.time.now + 999999; bs.nextAddsAt = r.time.now + 999999;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 0; bs.nextVerbAt = 1;
    p.body.reset(b.x + 140, b.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var orig = r.time.delayedCall.bind(r.time), captured = null;
    r.time.delayedCall = function(ms, cb){ captured = cb; return orig(ms, function(){}); };
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);             // LADLE warn
    r.time.delayedCall = orig;
    var busy = bs.busyUntil > r.time.now;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    if (captured) captured();                                // the SWAT lands
    var hurt = p.state.hp < hp0;
    var swatted = Math.hypot(p.body.velocity.x, p.body.velocity.y) > 200;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { busy: busy, hurt: hurt, swatted: swatted };})()`);
  check('LADLE SWING: locked cone → heavy swat (damage + knockback)',
    ladle.busy && ladle.hurt && ladle.swatted);

  // -- 16. FLASK VOLLEY + PLANT A HEX TOTEM (and the 2-up reroute) -------------------------------
  const verbs = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sw;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 1; bs.nextVerbAt = 1;                       // FLASK VOLLEY
    var z0 = C.zones.length;
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);
    var flasks = C.zones.length - z0 === 3 && C.zones[C.zones.length - 1].fromBoss;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 2; bs.nextVerbAt = 1;                       // PLANT A HEX TOTEM
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);
    var planted = C.totems.length === 1 && C.totems[0].bossOwned && C.totems[0].hex === 'slow';
    // with 2 MAP totems up, the verb REROUTES to flask volley
    var cfg = r.realmDef.totem;
    SWAMP_SCENE._totemShatter(r, C, C.totems[0], r.time.now, true);
    SWAMP_SCENE._totemRise(r, C, 0, 'slow', 100, 100, cfg.hp, false, r.time.now, cfg);
    SWAMP_SCENE._totemRise(r, C, 1, 'drain', 200, 100, cfg.hp, false, r.time.now, cfg);
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 2; bs.nextVerbAt = 1;
    var z1 = C.zones.length;
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);
    var rerouted = C.totems.length === 2 && C.zones.length - z1 === 3;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    C.totems.slice().forEach(function(T){ SWAMP_SCENE._totemShatter(r, C, T, r.time.now, true); });
    return { flasks: flasks, planted: planted, rerouted: rerouted };})()`);
  check('FLASK VOLLEY paints 3 boss circles · PLANT A HEX TOTEM drops a shootable slow totem',
    verbs.flasks && verbs.planted);
  check('with 2 map totems up the totem verb REROUTES to flasks (no hex soup)', verbs.rerouted);

  // -- 17. SWAMP GAS sectors + SUMMON THE BREW ----------------------------------------------------
  const gasAdds = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sw;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.verbIdx = 3; bs.nextVerbAt = 1;                       // SWAMP GAS
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);
    var gassed = !!C.gas && C.gas.seq.length === 3;
    p.body.reset(C.arena.x, C.arena.y + C.arena.ry + 400);   // out of the clouds
    if (C.gas) C.gas.seq.forEach(function(S2){ S2.at = 1; });
    SWAMP_SCENE.update(r, r.time.now, 16);                   // all three fire
    SWAMP_SCENE.update(r, r.time.now, 16);                   // → the cloud clears
    var done = !C.gas;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextAddsAt = 1; bs.nextVerbAt = r.time.now + 999999;
    var q0 = r._spawnQueue.length;
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);             // SUMMON THE BREW
    var adds = r._spawnQueue.length - q0 === 4 &&
      r._spawnQueue.slice(q0).every(function(e){ return e.bossWave; });
    r._spawnQueue.length = q0;
    return { gassed: gassed, done: done, adds: adds };})()`);
  check('SWAMP GAS sweeps 3 warned sectors in order', gasAdds.gassed && gasAdds.done);
  check('SUMMON THE BREW pours 3 boglings + a bottled imp (bossWave)', gasAdds.adds);

  // -- 18. THE GRAND BREW: dive → splashes → POT TIPS half → vented ×1.5 --------------------------
  const brew = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._sw;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextBrewAt = 1; bs.nextVerbAt = r.time.now + 999999; bs.nextAddsAt = r.time.now + 999999;
    SWAMP_SCENE.bossUpdate(r, b, p, r.time.now);             // she DIVES IN
    var dove = !!C.brew && !b.visible && !b.body.enable && C.brew.splashes.length === 5;
    var side = C.brew.side;
    // park a victim mob in the doomed half; the player stands in the SAFE half
    var A = C.arena;
    var vx = side ? A.x + A.rx * 0.5 : A.x - A.rx * 0.5;
    var v = Entities.spawnMob(r, 'bogling', vx, A.y);
    p.body.reset(side ? A.x - A.rx * 0.5 : A.x + A.rx * 0.5, A.y);
    var kills0 = p.state.kills;
    C.brew.splashes.forEach(function(S2){ S2.at = 1; });
    SWAMP_SCENE.update(r, r.time.now, 16);                   // splashes fire
    // M7k: capture hp AFTER the splashes — they land on random spots and can
    // legally hit the parked player; this check is about the WAVE sparing the
    // safe half, not the rain.
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    C.brew.waveAt = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);                   // the POT TIPS
    var waved = C.brew.waved && !v.active && p.state.kills - kills0 === 1 && p.state.hp === hp0;
    C.brew.emergeAt = 1;
    SWAMP_SCENE.update(r, r.time.now, 16);                   // she crawls out
    var emerged = !C.brew && b.visible && b.body.enable &&
      bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    return { dove: dove, waved: waved, emerged: emerged };})()`);
  check('THE GRAND BREW: she dives in (untargetable), 5 splashes rain', brew.dove);
  check('the POT TIPS the warned half — mob swept (credited), the safe half spared', brew.waved);
  check('she crawls out dizzy — WINDED (rooted + vented)', brew.emerged);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 19. kill → chest + the brew machinery swept --------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._sw;
    SWAMP_SCENE.update(r, r.time.now, 16);
    return !C.gas && !C.brew && !C.bossArmed && C.totems.every(function(T){ return !T.bossOwned; });})()`);
  check('the Brewmistress falls → chest/loot flow + her machinery swept', clean);

  // -- 20. zero console errors ------------------------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
