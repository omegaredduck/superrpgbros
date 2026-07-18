// M22 BELLY OF THE BEAST verification suite — realm 20, THE FINALE.
// Registry/data · HEAVE HO.EXE (360 beats @120 = 180.0s) · the guts layout +
// UVULA set piece + ARENA · "???" reveal persistence · DIGESTION TIDE (gurgle
// → rise warned zones → tick off safe ground → recede) · toroidal wrap · the
// 14 mapVerbs (fisherman lure lane · lobster charge · snake strike+venom ·
// starfish/lamprey leap→latch · mermaid charm+displacement cap · pirate lunge
// · deckhand chop · parrot dive · crab block · slug lob+puddle · worm erupt ·
// krill chip+disperse · polyp vent+slow) · jelly death-pop + polyp krill-pop
// cap · uvula gag → arena handoff · THE TITAN WHALE: deterministic arrival,
// STATIONARY rig, mortars / inhale+chomp+displacement / flipper ring gaps /
// gut cough no-loot / P2 maw alight / WATER GUN corridor-before-jet → vented
// ×1.5. Deterministic throughout (no real-time cinematic waits).
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

  // -- 1. boot: registry + the shanty ------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.belly, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.titanWhale;
    return { def: !!MAPS.defs.belly, roster: DATA.biomes.belly.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length, stationary: bd.stationary === true,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'belly' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 16-mob roster + console unlock', reg.def && reg.roster === 16 && reg.consoleRow);
  check('boss mapOwned + STATIONARY, NO radial/stream, ≤6 hints', reg.mapOwned && reg.stationary && reg.noFiller && reg.hints <= 6);
  check('HEAVE HO.EXE: 360 beats @120, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 360 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. "???" reveal persistence -----------------------------------------------------
  const reveal = await page.evaluate(`(function(){
    try { localStorage.removeItem('srb_belly_cleared'); } catch(e){}
    var hidden = BELLY_SCENE.realmName();
    var consoleHidden = DATA.console.maps.find(function(x){return x.id==='belly';}).name === '???';
    BELLY_SCENE.markCleared();
    var shown = BELLY_SCENE.realmName();
    var persisted = false; try { persisted = localStorage.getItem('srb_belly_cleared') === '1'; } catch(e){}
    try { localStorage.removeItem('srb_belly_cleared'); } catch(e){}
    return { hidden: hidden, consoleHidden: consoleHidden, shown: shown, persisted: persisted, backHidden: BELLY_SCENE.realmName() };})()`);
  check('"???" name hidden pre-clear (realm select + console)', reveal.hidden === '???' && reveal.consoleHidden);
  check('first clear REVEALS "Belly of the Beast" and persists', reveal.shown === 'Belly of the Beast' && reveal.persisted && reveal.backHidden === '???');

  // -- 2b. no-sine theme law + INTRO cinematic beats (PLAN §2, verbatim) ----------------
  const intro = await page.evaluate(`(function(){
    var m = DATA.audio.music.belly, cc = DATA.realms.belly.cinematicCfg;
    return { noSine: m.tracks.every(function(t){ return t.type !== 'sine'; }),
             blurb: cc && cc.introBlurb,
             breachSwallow: !!(cc && cc.introBeats && cc.introBeats.indexOf('breach') >= 0 && cc.introBeats.indexOf('swallow') >= 0),
             skip: !!(cc && cc.skipRepeat) };})()`);
  check('HEAVE HO.EXE is chiptune — NO sine oscillator', intro.noSine);
  check('INTRO cinematic: verbatim blurb + breach/swallow beats + skip-on-repeat',
    intro.blurb === 'thats weird... isnt there supposed to be stuff for me to kill?' && intro.breachSwallow && intro.skip);

  // -- 3. enter the realm --------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'belly' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const layout = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    return { id: r.realmId, stage: C.stage, uvula: !!C.uvula, uvulaHp: C.uvula.hp,
             arena: !!C.arena, wreck: !!C.wreck,
             spawnOnWreck: Math.hypot(r._realmStart.x - C.wreck.x, r._realmStart.y - C.wreck.y) < C.wreck.rx };})()`);
  check('belly scene: guts stage + the UVULA + the ARENA + SPAWN on the wreck deck',
    layout.id === 'belly' && layout.stage === 'guts' && layout.uvula && layout.arena && layout.spawnOnWreck);

  // -- 3b. INTRO SWALLOW CAPTION: after the whale swallows you, the meta line shows -------
  const swallow = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    var QUOTE='the simulation is running out of content to give you, and the whale is the system devouring its own last asset.';
    var cc = r.realmDef.cinematicCfg;
    C.introSeen = false; C.introStarted = false; C.stage = 'guts';
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function (ms, cb) { cap = cb; return orig(ms, function(){}); };
    BELLY_SCENE.update(r, r.time.now, 16);                       // fires the intro cinematic
    var started = C.introStarted === true;
    var blurbShown = !!(r._bannerText && r._bannerText.active && r._bannerText.text.indexOf('SWALLOWED WHOLE') >= 0);
    if (cap) cap();                                             // the SWALLOW beat lands the meta line
    r.time.delayedCall = orig;
    var shown = r._bannerText ? r._bannerText.text.replace(/\\n/g, ' ') : '';
    var quoteShown = shown.indexOf('running out of content to give you') >= 0 &&
                     shown.indexOf('devouring its own last asset') >= 0;
    return { dataExact: cc.swallowLine === QUOTE, started: started, blurbShown: blurbShown, quoteShown: quoteShown };})()`);
  check('INTRO SWALLOW: the meta line renders on screen after the swallow (verbatim)',
    swallow.dataExact && swallow.started && swallow.blurbShown && swallow.quoteShown);

  // helper: wipe ambient mobs + park the tide (fixtures)
  const clean = `(function(){var r=${scene('Realm')};
    r._belly.tide.nextAt = Infinity; r._belly.tide.phase='idle';
    r.mobs.children.iterate(function(o){ if(o&&o.active){Entities.clearNameTag(o);o.body.enable=false;r.mobs.killAndHide(o);} });
  })()`;
  await page.evaluate(clean);

  // -- 4. DIGESTION TIDE — gurgle → warned rise → tick off safe ground → recede ---------
  const tide = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    var cfg = r.realmDef.tideCfg, T = C.tide;
    T.nextAt = 1; T.phase='idle';
    BELLY_SCENE.update(r, r.time.now, 16);                     // GURGLE
    var gurgled = T.phase === 'gurgle';
    T.gurgleUntil = 1;
    BELLY_SCENE.update(r, r.time.now, 16);                     // RISE — spread warned zones
    var rose = T.phase === 'rise' && T.zones.length > 0;
    var warned = T.zones.every(function(z){ return z.activeAt > r.time.now || z.activeAt <= r.time.now; }) && !!T.zones[0].g;
    // stand in a tide zone OFF safe ground → tick
    var z0 = T.zones[0];
    z0.activeAt = 1; z0.nextTickAt = 1;
    p.body.reset(z0.x, z0.y); p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    r.hitstopActive = false;
    BELLY_SCENE.update(r, r.time.now, 16);
    var ticked = p.state.hp < hp0;
    // …but the wreck deck (high ground) is spared
    p.state.hp = hp0; p.state.lastHitAt = -1e9;
    p.body.reset(C.wreck.x, C.wreck.y); z0.nextTickAt = 1;
    BELLY_SCENE.update(r, r.time.now, 16);
    var safe = p.state.hp === hp0;
    // RECEDE clears the zones
    T.riseUntil = 1; BELLY_SCENE.update(r, r.time.now, 16);
    var receding = T.phase === 'recede';
    T.recedeUntil = 1; BELLY_SCENE.update(r, r.time.now, 16);
    var cleared = T.phase === 'idle' && T.zones.length === 0;
    T.nextAt = Infinity; p.state.hp = hp0; p.body.reset(C.wreck.x, C.wreck.y);
    return { gurgled: gurgled, rose: rose, warned: warned, ticked: ticked, safe: safe, receding: receding, cleared: cleared };})()`);
  check('TIDE gurgles → RISES as warned acid zones out of the lakes', tide.gurgled && tide.rose && tide.warned);
  check('the tide TICKS off the high ground but SPARES the wreck deck', tide.ticked && tide.safe);
  check('the tide RECEDES and clears its zones', tide.receding && tide.cleared);

  // -- 5. toroidal WRAP (guts) ---------------------------------------------------------
  const wrap = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    C.stage = 'guts';
    p.body.reset(r.worldW + 20, r.worldH * 0.5);
    BELLY_SCENE.update(r, r.time.now, 16);
    var wrappedX = p.x < r.worldW * 0.5;
    p.body.reset(r.worldW * 0.5, -20);
    BELLY_SCENE.update(r, r.time.now, 16);
    var wrappedY = p.y > r.worldH * 0.5;
    p.body.reset(C.wreck.x, C.wreck.y);
    return { wrappedX: wrappedX, wrappedY: wrappedY };})()`);
  check('toroidal WRAP both axes in the guts', wrap.wrappedX && wrap.wrappedY);

  // -- 6. FISHERMAN lure lane + LOBSTER charge -----------------------------------------
  const zoners = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var f = Entities.spawnMob(r, 'drownedFisherman', p.x + 200, p.y);
    f.mob.nextCastAt = 1;
    Entities.updateMob(r, f, p, r.time.now);                   // lure warn
    var castWarn = f.mob.castLockUntil > r.time.now && !!f.mob._castG;
    f.mob.castLockUntil = 1;
    Entities.updateMob(r, f, p, r.time.now);                   // lure snaps → mLane
    var laned = C.mLanes.length === 1;
    r.hitstopActive = false;
    BELLY_SCENE.update(r, r.time.now, 16);                     // resolve mLane
    var lureHit = p.state.hp < hp0;
    Entities.clearNameTag(f); f.body.enable=false; r.mobs.killAndHide(f);
    p.state.hp = hp0;
    // LOBSTER: warned charge lane → DASH
    var l = Entities.spawnMob(r, 'gutLobster', p.x + 200, p.y);
    l.mob.nextChargeAt = 1;
    Entities.updateMob(r, l, p, r.time.now);
    var chWarn = l.mob.chargeLockUntil > r.time.now && !!l.mob._clG;
    l.mob.chargeLockUntil = 1;
    Entities.updateMob(r, l, p, r.time.now);
    var charging = l.mob.chargeUntil > r.time.now && Math.abs(l.body.velocity.x) > 300;
    Entities.clearNameTag(l); l.body.enable=false; r.mobs.killAndHide(l);
    C.mLanes.forEach(function(L){ if(L.g)L.g.destroy(); }); C.mLanes = [];
    return { castWarn: castWarn, laned: laned, lureHit: lureHit, chWarn: chWarn, charging: charging };})()`);
  check('DROWNED FISHERMAN casts a warned lure lane that SNAPS (damage)', zoners.castWarn && zoners.laned && zoners.lureHit);
  check('GUT LOBSTER warns a snip-charge lane, then DASHES it', zoners.chWarn && zoners.charging);

  // -- 7. SEA SNAKE strike + venom puddle ----------------------------------------------
  const snake = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    var m = Entities.spawnMob(r, 'seaSnake', p.x + 200, p.y);
    m.mob.nextStrikeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var locked = m.mob.strikeLockUntil > r.time.now && !!m.mob._strikeG;
    var pc0 = C.patches.length;
    m.mob.strikeLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // STRIKE + drop venom
    var striking = m.mob.strikeUntil > r.time.now && Math.abs(m.body.velocity.x) > 300;
    var venom = C.patches.length === pc0 + 1;
    // stand in the venom → tick
    var V = C.patches[C.patches.length - 1];
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    p.body.reset(V.x, V.y); V.nextTickAt = 1; r.hitstopActive = false;
    BELLY_SCENE.update(r, r.time.now, 16);
    var venomTick = p.state.hp < hp0;
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    for (var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj)C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    p.state.hp = hp0; p.body.reset(C.wreck.x, C.wreck.y);
    return { locked: locked, striking: striking, venom: venom, venomTick: venomTick };})()`);
  check('SEA SNAKE locks a wrap-aware lane, STRIKES, and leaves lingering VENOM', snake.locked && snake.striking && snake.venom && snake.venomTick);

  // -- 8. STARFISH leap → LATCH → shot off (and LAMPREY shares the tech) ----------------
  const latch = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'bellyStarfish', p.x + 150, p.y);
    m.mob.nextLatchAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // leap warn
    var warned = m.mob.leapAt > r.time.now;
    m.mob.leapAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // leaps
    var leaping = m.mob.leapUntil > r.time.now;
    m.body.reset(p.x + 18, p.y);
    Entities.updateMob(r, m, p, r.time.now);                   // LATCH
    var latched = !!C.latch && C.latch.m === m;
    var short = latched && C.latch.until - r.time.now <= 1000;
    m.mob.nextDrainAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // drain tick
    var drained = p.state.hp < hp0;
    Entities.hurtMob(r, m, 10, r.time.now);                    // SHOOT it off
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var shotOff = !C.latch;
    // lamprey uses the same latch tech
    var lam = Entities.spawnMob(r, 'lamprey', p.x + 150, p.y);
    lam.mob.nextLatchAt = 1; Entities.updateMob(r, lam, p, r.time.now);
    var lamWarn = lam.mob.leapAt > r.time.now;
    [m, lam].forEach(function(o){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o); });
    C.latch = null; p.state.hp = hp0; p.body.reset(C.wreck.x, C.wreck.y);
    return { warned: warned, leaping: leaping, latched: latched, short: short, drained: drained, shotOff: shotOff, lamWarn: lamWarn };})()`);
  check('CRIMSON STARFISH leaps, LATCHES (short + draining), and is SHOT OFF',
    latch.warned && latch.leaping && latch.latched && latch.short && latch.drained && latch.shotOff);
  check('LAMPREY shares the launch→latch tech', latch.lamWarn);

  // -- 9. MERMAID charm + the SHARED displacement cap ----------------------------------
  const charm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    C.dispUntil = 0;
    var m = Entities.spawnMob(r, 'mermaid', p.x + 100, p.y);
    m.mob.nextCharmAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // charm cone warn
    var coned = m.mob.charmLockUntil > r.time.now && !!m.mob._charmG;
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    m.mob.charmLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                   // PULL (displacement)
    var pulled = Math.hypot(p.body.velocity.x, p.body.velocity.y) > 40 && C.dispUntil > r.time.now;
    // SHARED CAP: with the tag hot, a second charm does NOT re-pull
    C.dispUntil = r.time.now + 5000;
    var m2 = Entities.spawnMob(r, 'mermaid', p.x + 100, p.y);
    m2.mob.charmLockUntil = 1; m2.mob._charmAng = Math.atan2(p.y - m2.y, p.x - m2.x);
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    Entities.updateMob(r, m2, p, r.time.now);
    var capped = Math.hypot(p.body.velocity.x, p.body.velocity.y) < 5;
    [m, m2].forEach(function(o){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o); });
    C.dispUntil = 0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { coned: coned, pulled: pulled, capped: capped };})()`);
  check('MERMAID charm cone PULLS you (displacement) — and the cap blocks a second yank', charm.coned && charm.pulled && charm.capped);

  // -- 10. PIRATE lunge · DECKHAND chop · PARROT dive ----------------------------------
  const crew = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    var pi = Entities.spawnMob(r, 'swallowedPirate', p.x + 200, p.y);
    pi.mob.nextLungeAt = 1; Entities.updateMob(r, pi, p, r.time.now);
    var lungeWarn = pi.mob.lungeAt > r.time.now;
    pi.mob.lungeAt = 1; Entities.updateMob(r, pi, p, r.time.now);
    var lunging = pi.mob.lungeUntil > r.time.now && Math.abs(pi.body.velocity.x) > 300;
    Entities.clearNameTag(pi); pi.body.enable=false; r.mobs.killAndHide(pi);
    // deckhand chop (warned circle)
    var d = Entities.spawnMob(r, 'skeletonDeckhand', p.x + 120, p.y);
    d.mob.nextChopAt = 1; var z0 = C.zones.length;
    Entities.updateMob(r, d, p, r.time.now);
    var chopped = C.zones.length === z0 + 1;
    Entities.clearNameTag(d); d.body.enable=false; r.mobs.killAndHide(d);
    // parrot dive (shadow mark → dive)
    var pa = Entities.spawnMob(r, 'bilgeParrot', p.x + 150, p.y);
    pa.mob.nextDiveAt = 1; var z1 = C.zones.length;
    Entities.updateMob(r, pa, p, r.time.now);
    var diveMark = pa.mob.diveWarnUntil > r.time.now && C.zones.length === z1 + 1;
    pa.mob.diveWarnUntil = 1; Entities.updateMob(r, pa, p, r.time.now);
    var diving = pa.mob.diveUntil > r.time.now;
    Entities.clearNameTag(pa); pa.body.enable=false; r.mobs.killAndHide(pa);
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { lungeWarn: lungeWarn, lunging: lunging, chopped: chopped, diveMark: diveMark, diving: diving };})()`);
  check('SWALLOWED PIRATE warns + LUNGES · SKELETON DECKHAND warns an axe circle',
    crew.lungeWarn && crew.lunging && crew.chopped);
  check('BILGE PARROT shadow-marks a dive, then DIVES', crew.diveMark && crew.diving);

  // -- 11. CRAB block · SLUG lob+puddle · WORM erupt -----------------------------------
  const bruisers = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    // crab: warned pincer + refund-on-hit block stance
    var c = Entities.spawnMob(r, 'gutCrab', p.x + 100, p.y);
    c.mob.nextBlockAt = 1; var z0 = C.zones.length;
    Entities.updateMob(r, c, p, r.time.now);
    var pincer = C.zones.length === z0 + 1 && c.mob.stanceUntil > r.time.now;
    var hp0 = c.mob.hp;
    Entities.hurtMob(r, c, 20, r.time.now); r.hitstopActive = false;
    Entities.updateMob(r, c, p, r.time.now);                   // stance refunds part of it
    var blocked = c.mob.hp > hp0 - 20;
    Entities.clearNameTag(c); c.body.enable=false; r.mobs.killAndHide(c);
    // slug: warned globs → burn puddles
    var s = Entities.spawnMob(r, 'acidSlug', p.x + 200, p.y);
    s.mob.nextLobAt = 1; var z1 = C.zones.length;
    Entities.updateMob(r, s, p, r.time.now);
    var lobbed = C.zones.length === z1 + 2;
    p.body.reset(r.worldW*0.05, r.worldH*0.05);
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    BELLY_SCENE.update(r, r.time.now, 16);
    var puddles = C.patches.length === pc0 + 2;
    Entities.clearNameTag(s); s.body.enable=false; r.mobs.killAndHide(s);
    // worm: warned eruption underfoot
    p.body.reset(C.wreck.x, C.wreck.y);
    var w = Entities.spawnMob(r, 'gutWorm', p.x + 100, p.y);
    w.mob.nextEruptAt = 1; var z2 = C.zones.length;
    Entities.updateMob(r, w, p, r.time.now);
    var erupted = C.zones.length === z2 + 1;
    Entities.clearNameTag(w); w.body.enable=false; r.mobs.killAndHide(w);
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    for (var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj)C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    return { pincer: pincer, blocked: blocked, lobbed: lobbed, puddles: puddles, erupted: erupted };})()`);
  check('GUT CRAB warns a pincer + raises a BLOCK stance (refund)', bruisers.pincer && bruisers.blocked);
  check('ACID SLUG lobs 2 warned globs → lingering burn PUDDLES · GUT WORM erupts underfoot',
    bruisers.lobbed && bruisers.puddles && bruisers.erupted);

  // -- 12. KRILL CLOUD chip + disperse · POLYP vent + slow -----------------------------
  const swarm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var k = Entities.spawnMob(r, 'krillCloud', p.x + 30, p.y);
    k.mob.chipAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, k, p, r.time.now);                   // chip tick
    var chipped = p.state.hp < hp0;
    Entities.hurtMob(r, k, 5, r.time.now);                     // AoE hit → DISPERSE
    r.hitstopActive = false;
    Entities.updateMob(r, k, p, r.time.now);
    var dispersing = k.mob.disperseUntil > r.time.now;
    Entities.clearNameTag(k); k.body.enable=false; r.mobs.killAndHide(k);
    p.state.hp = hp0;
    // polyp: stationary vent → slow field
    var po = Entities.spawnMob(r, 'fleshPolyp', p.x + 100, p.y);
    po.mob.nextVentAt = 1; var z0 = C.zones.length;
    Entities.updateMob(r, po, p, r.time.now);
    var vented = C.zones.length === z0 + 1;
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    BELLY_SCENE.update(r, r.time.now, 16);
    var slowField = C.patches.length === pc0 + 1 && C.patches[C.patches.length-1].slowMult < 1;
    var PA = C.patches[C.patches.length - 1];
    p.body.reset(PA.x, PA.y); p.body.velocity.x = 100; r.hitstopActive = false;
    BELLY_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    Entities.clearNameTag(po); po.body.enable=false; r.mobs.killAndHide(po);
    for (var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj)C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    p.body.velocity.x = 0; p.body.reset(C.wreck.x, C.wreck.y);
    return { chipped: chipped, dispersing: dispersing, vented: vented, slowField: slowField, slowed: slowed };})()`);
  check('KRILL CLOUD chips on contact and DISPERSES under AoE (one actor)', swarm.chipped && swarm.dispersing);
  check('FLESH POLYP vents a warned gas circle → lingering SLOW field', swarm.vented && swarm.slowField && swarm.slowed);

  // -- 13. jelly death-pop (warned + capped) + polyp krill-pop --------------------------
  const pops = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    C.tracked = {};
    var j = Entities.spawnMob(r, 'bileJelly', p.x + 200, p.y);
    BELLY_SCENE.update(r, r.time.now, 16);                     // track it
    var tracked = !!C.tracked[j.id];
    var z0 = C.zones.length;
    Entities.clearNameTag(j); j.body.enable=false; r.mobs.killAndHide(j);
    BELLY_SCENE.update(r, r.time.now, 16);                     // death → warned pop
    var jellyPop = C.zones.length === z0 + 1 && !C.tracked[j.id];
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    // polyp krill-pop (capped by live krill)
    var po = Entities.spawnMob(r, 'fleshPolyp', p.x + 250, p.y);
    BELLY_SCENE.update(r, r.time.now, 16);
    var q0 = r._spawnQueue.length;
    var px = po.x, py = po.y;
    Entities.clearNameTag(po); po.body.enable=false; r.mobs.killAndHide(po);
    BELLY_SCENE.update(r, r.time.now, 16);
    var krillPop = r._spawnQueue.length - q0 === 2 && r._spawnQueue.slice(q0).every(function(e){return e.key==='krillCloud';});
    r._spawnQueue.length = q0;
    return { tracked: tracked, jellyPop: jellyPop, krillPop: krillPop };})()`);
  check('BILE JELLY POPS on death (warned micro-burst)', pops.tracked && pops.jellyPop);
  check('FLESH POLYP pops KRILL on death (capped spawns)', pops.krillPop);

  // -- 14. THE UVULA → gag → ARENA handoff ---------------------------------------------
  const gag = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    // capture the deferred startBossFight so the gag doesn't spawn the boss now
    var orig = r.time.delayedCall.bind(r.time), caps=[];
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    C.uvula.hp = 0; C.uvulaGagged = false; C.stage = 'guts';
    BELLY_SCENE.update(r, r.time.now, 16);
    r.time.delayedCall = orig;
    return { gagged: C.uvulaGagged, arena: C.stage === 'arena' };})()`);
  check('UVULA kill → the whale GAGS → one-way ARENA handoff', gag.gagged && gag.arena);

  // -- 15. ARENA bounds (bounded beach, no wrap) ---------------------------------------
  const bounds = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly, p=r.player;
    C.stage = 'arena'; var A = C.arena;
    p.body.reset(A.x + A.rx + 300, A.y);
    BELLY_SCENE.update(r, r.time.now, 16);
    var inside = Math.hypot((p.x-A.x)/A.rx, (p.y-A.y)/A.ry) <= 1.02;
    return { inside: inside };})()`);
  check('ARENA is BOUNDED — the player is kept in the beached whale view', bounds.inside);

  // -- 16. deterministic BOSS ARRIVAL (registry contract) ------------------------------
  const arrival = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    var def = DATA.bosses.titanWhale;
    var orig = r.time.delayedCall.bind(r.time), caps=[];
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    BELLY_SCENE.bossArrival(r, def, C.arena.x, C.arena.y - C.arena.ry);
    for (var pass=0; pass<10 && !r.boss; pass++) caps.splice(0).forEach(function(f){ try{f();}catch(e){} });
    r.time.delayedCall = orig;
    return { boss: !!r.boss, key: r.boss && r.boss.boss.key, stage: C.stage,
             atTop: r.boss ? (r.boss.y < C.arena.y) : false, armed: C.bossArmed };})()`);
  check('THE TITAN WHALE arrives beached at the arena TOP (spawnBossNow + armed)',
    arrival.boss && arrival.key === 'titanWhale' && arrival.atTop && arrival.armed);

  // -- 17. STATIONARY rig (it never moves) ---------------------------------------------
  const stat = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, p=r.player;
    b.boss.busyUntil = 0; b.boss.nextVerbAt = r.time.now + 999999; b.boss.nextCoughAt = r.time.now + 999999;
    b.setVelocity(220, 220);
    BELLY_SCENE.bossUpdate(r, b, p, r.time.now);
    var stopped = Math.abs(b.body.velocity.x) < 1 && Math.abs(b.body.velocity.y) < 1;
    return { stopped: stopped };})()`);
  check('STATIONARY BOSS: it zeroes the core chase velocity every frame', stat.stopped);

  // -- 18. SPRAY MORTARS in order (+ P2 wet-sand) --------------------------------------
  const mortars = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._belly;
    bs._p2 = false; var z0 = C.zones.length;
    BELLY_SCENE._mortars(r, b, p, r.time.now);
    var cfg = bs.def.patterns.mortars;
    var rained = C.zones.length - z0 === cfg.count && C.zones[C.zones.length-1].fromBoss;
    var ordered = C.zones[z0+1].at > C.zones[z0].at;               // staggered = "in order"
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    // P2: mortars leave wet-sand slow patches
    bs._p2 = true; var z1 = C.zones.length;
    BELLY_SCENE._mortars(r, b, p, r.time.now);
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    BELLY_SCENE.update(r, r.time.now, 16);
    var wet = C.patches.length > pc0 && C.patches[C.patches.length-1].slowMult < 1;
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    for (var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj)C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    bs._p2 = false;
    return { rained: rained, ordered: ordered, wet: wet };})()`);
  check('SPRAY MORTARS rain warned circles IN ORDER (P2 leaves wet-sand slow)', mortars.rained && mortars.ordered && mortars.wet);

  // -- 19. INHALE (displacement tag) → CHOMP -------------------------------------------
  const inhale = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, p=r.player, C=r._belly;
    C.dispUntil = 0;
    var orig = r.time.delayedCall.bind(r.time), cap=null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    var z0 = C.zones.length;
    BELLY_SCENE._inhale(r, b, p, r.time.now);
    r.time.delayedCall = orig;
    var coned = !!b.boss._inhale && C.dispUntil > r.time.now && b.boss.busyUntil > r.time.now;
    if (cap) cap();                                               // the CHOMP lands
    var chomped = C.zones.length === z0 + 1;
    C.zones.forEach(function(z){ if(z.ring)z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    b.boss.busyUntil = 0; b.boss.rootUntil = 0; C.dispUntil = 0;
    return { coned: coned, chomped: chomped };})()`);
  check('INHALE warns a pull cone (claims the displacement tag) → ends in a CHOMP', inhale.coned && inhale.chomped);

  // -- 20. FLIPPER SLAM ring with telegraphed SAFE GAPS --------------------------------
  const flipper = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, p=r.player, C=r._belly;
    var orig = r.time.delayedCall.bind(r.time), cap=null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    BELLY_SCENE._flipperSlam(r, b, p, r.time.now);
    r.time.delayedCall = orig;
    if (cap) cap();                                              // the ring goes out
    var RG = C.rings[C.rings.length - 1];
    var hasGaps = !!RG && RG.gaps.length === b.boss.def.patterns.flipper.gaps;
    // pin the ring at a fixed radius; stand in a GAP → no hit
    RG.r0 = 200; RG.maxR = 200; RG.start = r.time.now; RG.until = r.time.now + 5000; RG.hit = false;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp; r.hitstopActive = false;
    var ga = RG.gaps[0];
    p.body.reset(RG.x + Math.cos(ga) * 200, RG.y + Math.sin(ga) * 200);
    BELLY_SCENE.update(r, r.time.now, 16);
    var gapSafe = p.state.hp === hp0 && !RG.hit;
    // find a WALL angle (not within any gap) → hit
    var wall = null;
    for (var a=0; a<6.28; a+=0.05){ var ok=true; for (var g=0;g<RG.gaps.length;g++){ var d=Math.atan2(Math.sin(a-RG.gaps[g]),Math.cos(a-RG.gaps[g])); if(Math.abs(d)<RG.gapHalf+0.15)ok=false; } if(ok){ wall=a; break; } }
    RG.hit = false; p.state.lastHitAt = -1e9;
    p.body.reset(RG.x + Math.cos(wall) * 200, RG.y + Math.sin(wall) * 200);
    BELLY_SCENE.update(r, r.time.now, 16);
    var wallHit = p.state.hp < hp0;
    C.rings.forEach(function(g){ try{g.g.destroy();}catch(e){} }); C.rings = [];
    p.state.hp = hp0; p.body.reset(C.arena.x, C.arena.y);
    return { hasGaps: hasGaps, gapSafe: gapSafe, wallHit: wallHit };})()`);
  check('FLIPPER SLAM ring has telegraphed SAFE GAPS (gap spares, wall hits)',
    flipper.hasGaps && flipper.gapSafe && flipper.wallHit);

  // -- 21. GUT COUGH — adds are bossWave + NO loot -------------------------------------
  const cough = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, C=r._belly;
    b.boss.busyUntil = 0;
    var q0 = r._spawnQueue.length;
    BELLY_SCENE._gutCough(r, b, r.time.now);
    var cfg = b.boss.def.patterns.cough;
    var coughed = r._spawnQueue.length - q0 === cfg.count &&
      r._spawnQueue.slice(q0).every(function(e){ return e.bossWave && e.noLoot; });
    r._spawnQueue.length = q0;
    return { coughed: coughed };})()`);
  check('GUT COUGH hacks up map mobs (bossWave, NO loot)', cough.coughed);

  // -- 22. P2 MAW ALIGHT ---------------------------------------------------------------
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, p=r.player;
    b.boss.busyUntil = 0; b.boss.nextVerbAt = r.time.now + 999999; b.boss.nextCoughAt = r.time.now + 999999;
    b.boss._p2 = false; b.boss.hp = b.boss.maxHp * 0.45;
    BELLY_SCENE.bossUpdate(r, b, p, r.time.now);
    var lit = b.boss._p2 === true && b.boss.rateMult < 1;
    b.boss.hp = b.boss.maxHp;
    return { lit: lit };})()`);
  check('P2 MAW ALIGHT: <50% hp → verbs quicken', p2.lit);

  // -- 23. SIGNATURE WATER GUN — corridor marked BEFORE the jet → VENTED ×1.5 -----------
  const gun = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._belly;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.ventedUntil = 0;
    p.body.reset(b.x + 200, b.y + 40);                          // stand on the corridor path
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var orig = r.time.delayedCall.bind(r.time), caps=[];
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    BELLY_SCENE._waterGun(r, b, p, r.time.now);
    // corridor is FULLY MARKED before any motion (the jet hasn't fired yet)
    var markedFirst = !!bs._gun && bs.gunChargeUntil > r.time.now && p.state.hp === hp0;
    r.hitstopActive = false;
    caps.splice(0, 1)[0]();                                     // the JET rakes the LOCKED corridor
    r.time.delayedCall = orig;
    var raked = p.state.hp < hp0;
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    p.state.hp = hp0;
    return { markedFirst: markedFirst, raked: raked, vented: vented };})()`);
  check('WATER GUN: corridor FULLY marked BEFORE the jet, then it RAKES the path', gun.markedFirst && gun.raked);
  check('…it SLUMPS gasping — VENTED ×1.5', gun.vented);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 24. clocks shift through unfreeze() ---------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    C.tide.nextAt = r.time.now + 5000; C.tide.phase = 'idle';
    var before = C.tide.nextAt;
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = C.tide.nextAt - before;
      C.tide.nextAt = Infinity;
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts the tide clock', shift > 500);

  // -- 25. kill → the machinery swept + the finale clears --------------------------------
  // v5 (2026-07-17): the FIRST belly kill now plays the endgame cutscenes (CS2→CS3)
  // + grants the legendary set instead of the chest (verified in m23). This suite
  // tests the boss/loot path, so mark the finale seen → normal chest flow.
  await page.evaluate(`(function(){ if(typeof ACCOUNT!=='undefined'&&ACCOUNT.cutscenesSeen){ACCOUNT.cutscenesSeen.cs2=true;ACCOUNT.cutscenesSeen.cs3=true;} })()`);
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot || !r.boss || !r.boss.active;})()`,
    null, { timeout: 15000 });
  const done = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._belly;
    BELLY_SCENE.update(r, r.time.now, 16);
    var revealed = false; try { revealed = localStorage.getItem('srb_belly_cleared') === '1'; } catch(e){}
    return { swept: !C.bossArmed && C.rings.length === 0, revealed: revealed };})()`);
  check('the Titan Whale falls → its machinery is swept', done.swept);
  check('beating the whale REVEALS "Belly of the Beast" in the live flow', done.revealed);

  // -- 26. zero console errors ----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nRESULT: ${step - failures}/${step}`);
  console.log(failures ? `${failures} FAILURE(S)` : 'ALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
