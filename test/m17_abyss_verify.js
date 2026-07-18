// M17 THE ABYSS verification suite — realm 15, registry map 11.
// Registry/data · UNDER THE TRENCH (360 beats @120 = 180.0s calypso) · scene
// layout (4 DROPs + coral reef + bell spawn) · THE UNDERTOW (warn → pull toward
// the nearest DROP, anchor blocks, mobs swept = env credit) · DROP pit eject ·
// DESTRUCTIBLE CORAL (4 states → break → staged regrow, blocked while occupied)
// · 11 mob mechanics · wrap · THE VOLT WYRM: segmented follow-the-leader body,
// brush vs head split, P1 (snap/discharge/tail + DEEP DIVE signature → vented),
// P2 (live-wire/chain/serpent-undertow + MAELSTROM signature → lattice → vented),
// kill → chest + machinery swept.
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

  // -- 1. boot: registry + the calypso ------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.abyss, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.voltWyrm;
    return { def: !!MAPS.defs.abyss, roster: DATA.biomes.abyss.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length, headHeavy: bd.contactDmg > bd.segments.brushDmg,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'abyss' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 11-mob roster + console unlock', reg.def && reg.roster === 11 && reg.consoleRow, reg.roster + ' mobs');
  check('boss mapOwned, NO radial/stream, ≤6 hints, HEAD > brush', reg.mapOwned && reg.noFiller && reg.hints <= 6 && reg.headHeavy);
  check('UNDER THE TRENCH: 360 beats @120, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 360 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm --------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'abyss' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(500);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab;
    return { id: r.realmId, drops: C.drops.length, coral: C.coral.length, coralGroup: !!C.coralGroup,
             arena: !!C.arena, spawnNW: r._realmStart.x / r.worldW < 0.5 && r._realmStart.y / r.worldH < 0.2 };})()`);
  check('abyss scene: 4 DROP chasms + destructible coral reef + arena + BELL spawn (NW)',
    realm.id === 'abyss' && realm.drops === 4 && realm.coral === 12 && realm.coralGroup && realm.arena && realm.spawnNW);

  // -- 3. park undertow + wipe ambient mobs (fixture) ----------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._ab.undertow.nextAt = Infinity; r._ab.undertow.phase = 'idle';
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 4. THE UNDERTOW: warn → pull (toward a DROP) → anchor blocks → mob swept ---------
  const undertow = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    var uCfg = r.realmDef.undertow;
    C.undertow.phase = 'idle'; C.undertow.nextAt = 1;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var warned = C.undertow.phase === 'warn';
    C.undertow.warnUntil = 1;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var pulling = C.undertow.phase === 'pull';
    // player in open water (away from covers) → pulled toward the target drop
    p.body.reset(C.arena.x, C.arena.y - C.arena.ry - 300);
    while (ABYSS_SCENE._anchored(r, C, p.x, p.y)) p.body.reset(p.x, p.y - 40);
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    r.hitstopActive = false;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var toward = (p.body.velocity.x * C.undertow.dirx + p.body.velocity.y * C.undertow.diry) > 50;
    // anchored: standing on a cover → NO pull
    var cov = C.covers[0];
    p.body.reset(cov.x, cov.y); p.body.velocity.x = 0; p.body.velocity.y = 0;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var anchored = Math.hypot(p.body.velocity.x, p.body.velocity.y) < 20;
    // a mob swept into a DROP dies (env credit)
    var D = C.drops[0];
    var m = Entities.spawnMob(r, 'swordfish', D.x, D.y);
    var kills0 = p.state.kills;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var swept = !m.active && p.state.kills - kills0 === 1;
    C.undertow.phase = 'idle'; C.undertow.nextAt = Infinity;
    if (m.active) { Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); }
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { warned: warned, pulling: pulling, toward: toward, anchored: anchored, swept: swept };})()`);
  check('UNDERTOW warns, then PULLS you toward a DROP; anchored cover blocks it',
    undertow.warned && undertow.pulling && undertow.toward && undertow.anchored);
  check('mobs are dragged too — swept into a DROP = env-credited death', undertow.swept);

  // -- 5. DROP pit: fall in → damage + EJECT to the rim (never insta) -------------------
  const pit = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    C.pitSafeUntil = 0;
    var D = C.drops[1];
    p.body.reset(D.x, D.y); p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    r.hitstopActive = false;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var hurt = p.state.hp < hp0;
    var ejected = !ABYSS_SCENE._inDrop(C, p.x, p.y);
    var iframe = C.pitSafeUntil > r.time.now;
    p.state.hp = hp0; p.body.reset(C.arena.x, C.arena.y - C.arena.ry - 300);
    return { hurt: hurt, ejected: ejected, iframe: iframe };})()`);
  check('DROP pit: you take damage + EJECT to the rim (+ i-frames), never insta-death',
    pit.hurt && pit.ejected && pit.iframe);

  // -- 6. DESTRUCTIBLE CORAL: 4 states → break (shrapnel) → staged regrow ---------------
  const coral = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab;
    var cfg = r.realmDef.coral, CO = C.coral[0];
    CO.alive = true; CO.hp = cfg.hp; CO.state = 0; CO.spr.setTexture('abyssCoral0'); CO.rect.body.enable = true; CO.regrowAt = Infinity;
    var states = [0];
    for (var i = 0; i < 4; i++) { ABYSS_SCENE._hurtCoral(r, CO, cfg.hpPerState, r.time.now); states.push(CO.state); }
    // by now hp <= 0 → BROKEN
    var broke = !CO.alive && CO.regrowAt !== Infinity && CO.rect.body.enable === false;
    var stepped = states[1] === 1 && states[2] === 2 && states[3] === 3;
    // regrow blocked while occupied
    r.player.body.reset(CO.x, CO.y);
    CO.regrowAt = 1;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var blocked = !CO.alive;
    // step away → regrows to pristine, body re-enabled
    r.player.body.reset(C.arena.x, C.arena.y - C.arena.ry - 300);
    CO.regrowAt = 1;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var regrew = CO.alive && CO.state === 0 && CO.rect.body.enable === true;
    return { stepped: stepped, broke: broke, blocked: blocked, regrew: regrew };})()`);
  check('CORAL deteriorates through 4 states → BREAKS (shrapnel, body off)', coral.stepped && coral.broke);
  check('CORAL regrow is BLOCKED while occupied, then staged-regrows to pristine', coral.blocked && coral.regrew);

  // -- 7. GHOST JELLY drift · SWORDFISH lance · VOLT EEL shock ring ---------------------
  const trio = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    // jelly: slow sinusoidal drift, owns its movement
    var j = Entities.spawnMob(r, 'ghostJelly', p.x + 200, p.y);
    Entities.updateMob(r, j, p, r.time.now);
    var jv = Math.hypot(j.body.velocity.x, j.body.velocity.y);
    var drifts = jv > 5 && jv < j.mob.def.spd;
    Entities.clearNameTag(j); j.body.enable = false; r.mobs.killAndHide(j);
    // swordfish: lane telegraph → high-speed charge
    var s = Entities.spawnMob(r, 'swordfish', p.x + 200, p.y);
    s.mob.nextLanceAt = 1;
    Entities.updateMob(r, s, p, r.time.now);
    var locked = s.mob.laneLockUntil > r.time.now && !!s.mob._lanceG;
    s.mob.laneLockUntil = 1;
    Entities.updateMob(r, s, p, r.time.now);
    var charging = s.mob.chargeUntil > r.time.now && Math.abs(s.body.velocity.x) > 300;
    Entities.clearNameTag(s); s.body.enable = false; r.mobs.killAndHide(s);
    // volt eel: coil telegraph → expanding shock ring
    var e = Entities.spawnMob(r, 'voltEel', p.x + 150, p.y);
    e.mob.nextZapAt = 1;
    Entities.updateMob(r, e, p, r.time.now);
    var coiled = e.mob.coilUntil > r.time.now;
    var ring0 = C.rings.length;
    e.mob.coilUntil = 1;
    Entities.updateMob(r, e, p, r.time.now);
    var ringed = C.rings.length === ring0 + 1;
    C.rings.forEach(function(G){ try { G.g.destroy(); } catch(x){} }); C.rings = [];
    Entities.clearNameTag(e); e.body.enable = false; r.mobs.killAndHide(e);
    return { drifts: drifts, locked: locked, charging: charging, coiled: coiled, ringed: ringed };})()`);
  check('GHOST JELLY drifts slow (owns movement) · SWORDFISH lane-locks then CHARGES',
    trio.drifts && trio.locked && trio.charging);
  check('VOLT EEL coils → fires an expanding SHOCK RING', trio.coiled && trio.ringed);

  // -- 8. VAMPIRE SQUID ink-on-hurt + jet · CRIMSON STARFISH latch + release ------------
  const pair = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    // squid: on hurt → ink cloud + jet away
    var q = Entities.spawnMob(r, 'vampireSquid', p.x + 200, p.y);
    Entities.updateMob(r, q, p, r.time.now);   // init _inkHp, returns false (core shoot)
    var pc0 = C.patches.length;
    Entities.hurtMob(r, q, 12, r.time.now); r.hitstopActive = false;
    Entities.updateMob(r, q, p, r.time.now);
    var inked = C.patches.length === pc0 + 1 && C.patches[C.patches.length-1].slowMult && q.mob.jetUntil > r.time.now;
    var jetting = Math.hypot(q.body.velocity.x, q.body.velocity.y) > 100;
    C.patches.forEach(function(P){ if (P.obj) try { P.obj.destroy(); } catch(x){} }); C.patches = [];
    Entities.clearNameTag(q); q.body.enable = false; r.mobs.killAndHide(q);
    // starfish: warn → hop → LATCH (player slow) → release on distance
    var f = Entities.spawnMob(r, 'crimsonStarfish', p.x + 150, p.y);
    f.mob.nextHopAt = 1;
    Entities.updateMob(r, f, p, r.time.now);              // warn
    var warned = f.mob.laneLockUntil > r.time.now;
    f.mob.laneLockUntil = 1;
    Entities.updateMob(r, f, p, r.time.now);              // hop
    f.body.reset(p.x + 10, p.y);                          // contact
    Entities.updateMob(r, f, p, r.time.now);              // LATCH
    var latched = !!C.starLatch && C.starLatch.m === f;
    p.body.velocity.x = 100; r.hitstopActive = false;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    f.body.reset(p.x + 400, p.y);                         // move far → release
    ABYSS_SCENE.update(r, r.time.now, 16);
    var released = !C.starLatch;
    p.body.velocity.x = 0;
    Entities.clearNameTag(f); f.body.enable = false; r.mobs.killAndHide(f);
    return { inked: inked, jetting: jetting, warned: warned, latched: latched, slowed: slowed, released: released };})()`);
  check('VAMPIRE SQUID inks + jets when hurt', pair.inked && pair.jetting);
  check('CRIMSON STARFISH warns → hops → LATCHES (slows you) → releases on distance',
    pair.warned && pair.latched && pair.slowed && pair.released);

  // -- 9. DIVER harpoon + FISHERMAN yank (shared REEL cooldown — no stunlock) -----------
  const pulls = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    C.reelUntil = 0;
    p.body.reset(1000, 1000); p.body.velocity.x = 0; p.body.velocity.y = 0;
    var d = Entities.spawnMob(r, 'drownedDiver', p.x + 200, p.y);
    d.mob.nextHarpoonAt = 1;
    Entities.updateMob(r, d, p, r.time.now);              // aim
    var aimed = d.mob.aimUntil > r.time.now;
    d.mob.aimUntil = 1;
    Entities.updateMob(r, d, p, r.time.now);              // harpoon pull
    var pulled = p.body.velocity.x > 40;                  // toward the diver (at +x)
    var reelTag = C.reelUntil > r.time.now;
    // fisherman yank during the reel window is BLOCKED (no chain)
    var g = Entities.spawnMob(r, 'ghostFisherman', p.x - 200, p.y);
    g.mob.nextCastAt = 1;
    Entities.updateMob(r, g, p, r.time.now);              // cast (lure at player)
    var casted = g.mob.landUntil > r.time.now && g.mob._lureG;
    g.mob.landUntil = 1;
    var vx0 = p.body.velocity.x;
    Entities.updateMob(r, g, p, r.time.now);              // yank — reel still hot → no pull
    var chainBlocked = Math.abs(p.body.velocity.x - vx0) < 1;
    // let the reel cool → the yank pulls
    C.reelUntil = 0; g.mob.nextCastAt = 1;
    Entities.updateMob(r, g, p, r.time.now);
    g.mob.landUntil = 1;
    Entities.updateMob(r, g, p, r.time.now);
    var yanked = p.body.velocity.x < vx0;                 // toward the fisherman (at -x)
    [d, g].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { aimed: aimed, pulled: pulled, reelTag: reelTag, casted: casted, chainBlocked: chainBlocked, yanked: yanked };})()`);
  check('DROWNED DIVER aims → HARPOON reels you a step in (reel-tagged)', pulls.aimed && pulls.pulled && pulls.reelTag);
  check('GHOST FISHERMAN casts → YANK is reel-gated (no stunlock chain), then hooks',
    pulls.casted && pulls.chainBlocked && pulls.yanked);

  // -- 10. LOBSTER frontal armor · SEA SNAKE venom cone · LANTERN SNAIL heal -----------
  const three = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    // lobster: armored while charging (refunds a fraction)
    var lo = Entities.spawnMob(r, 'trenchLobster', p.x + 200, p.y);
    lo.mob.nextChargeAt = 1;
    Entities.updateMob(r, lo, p, r.time.now);             // charge warn (claws up = armored)
    var warned = lo.mob.laneLockUntil > r.time.now;
    var hp0 = lo.mob.hp;
    Entities.hurtMob(r, lo, 20, r.time.now); r.hitstopActive = false;
    Entities.updateMob(r, lo, p, r.time.now);             // refund 40%
    var armored = lo.mob.hp === hp0 - 12;
    Entities.clearNameTag(lo); lo.body.enable = false; r.mobs.killAndHide(lo);
    // sea snake: cone strike → venom slow
    var sn = Entities.spawnMob(r, 'bandedSeaSnake', p.x - 50, p.y);
    p.state.lastHitAt = -1e9; var php0 = p.state.hp;
    sn.mob.nextStrikeAt = 1;
    Entities.updateMob(r, sn, p, r.time.now);             // cone warn
    var coned = sn.mob.strikeLockUntil > r.time.now && !!sn.mob._strikeG;
    sn.mob.strikeLockUntil = 1;
    Entities.updateMob(r, sn, p, r.time.now);             // strike (player in cone)
    var venomed = C.venomUntil > r.time.now && p.state.hp < php0;
    p.body.velocity.x = 100; r.hitstopActive = false;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var venomSlow = p.body.velocity.x < 70;
    p.state.hp = php0; p.body.velocity.x = 0; C.venomUntil = 0;
    Entities.clearNameTag(sn); sn.body.enable = false; r.mobs.killAndHide(sn);
    // snail: heals wounded ally, respects hitstop
    var hurt = Entities.spawnMob(r, 'trenchLobster', p.x + 380, p.y); hurt.mob.hp = 50;
    var sa = Entities.spawnMob(r, 'lanternSnail', p.x + 400, p.y);
    sa.mob.nextHealAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, sa, p, r.time.now);
    var healed = hurt.mob.hp === 62;
    sa.mob.nextHealAt = 1; r.hitstopActive = true;
    Entities.updateMob(r, sa, p, r.time.now);
    var respected = hurt.mob.hp === 62;
    r.hitstopActive = false;
    [hurt, sa].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { warned: warned, armored: armored, coned: coned, venomed: venomed, venomSlow: venomSlow, healed: healed, respected: respected };})()`);
  check('TRENCH LOBSTER is ARMORED while charging (frontal refund) — flank it',
    three.warned && three.armored);
  check('BANDED SEA SNAKE cone-strikes → VENOM slows you', three.coned && three.venomed && three.venomSlow);
  check('LANTERN SNAIL mends the wounded (+12) — and respects hitstop', three.healed && three.respected);

  // -- 11. KRAKEN SPAWN tentacle-slam sequence + toroidal WRAP --------------------------
  const kw = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, p=r.player;
    var k = Entities.spawnMob(r, 'krakenSpawn', p.x + 200, p.y);
    var l0 = C.lanes.length;
    k.mob.nextSlamAt = 1;
    Entities.updateMob(r, k, p, r.time.now);
    var slammed = C.lanes.length === l0 + 3;
    C.lanes.forEach(function(l){ if (l.g) try { l.g.destroy(); } catch(x){} }); C.lanes = [];
    // the sequence lock must CLEAR when it resolves so the kraken slams AGAIN
    // (regression: slamSeq that never cleared → one slam for the whole fight)
    var lockedAfter = !!k.mob.slamSeq;
    k.mob.slamEndAt = 1; k.mob.nextSlamAt = 1;
    Entities.updateMob(r, k, p, r.time.now);
    var reslammed = lockedAfter && C.lanes.length === 3 && !!k.mob.slamSeq;
    C.lanes.forEach(function(l){ if (l.g) try { l.g.destroy(); } catch(x){} }); C.lanes = [];
    Entities.clearNameTag(k); k.body.enable = false; r.mobs.killAndHide(k);
    // wrap: player past the east edge stitches to the west
    p.body.reset(r.worldW + 20, r.worldH * 0.5);
    ABYSS_SCENE.update(r, r.time.now, 16);
    var wrapped = p.x < r.worldW;
    p.body.reset(C.arena.x, C.arena.y - C.arena.ry - 300);
    return { slammed: slammed, reslammed: reslammed, wrapped: wrapped };})()`);
  check('KRAKEN SPAWN telegraphs a 3-lane tentacle-slam sequence (and re-slams)', kw.slammed && kw.reslammed);
  check('toroidal WRAP stitches the trench edges', kw.wrapped);

  // -- 12. quota → THE VOLT WYRM breaches out of the DROP (deterministic arrival) ------
  const arrive = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab;
    r.player.state.kills = 0;
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    r.startBossFight();
    for (var z = 0; z < 40 && !r.scanning; z++) { caps.splice(0).forEach(function(f){ try { f(); } catch(e){} }); }
    r.time.delayedCall = orig;
    var big = C.drops[0];
    return { boss: !!r.boss, key: r.boss && r.boss.boss.key, armed: C.bossArmed,
             nearDrop: r.boss ? Math.hypot(r.boss.x - big.x, r.boss.y - big.y) < 220 : false,
             scanning: r.scanning, parked: C.undertow.nextAt === Infinity };})()`);
  check('THE VOLT WYRM rises OUT of the big DROP (armed, scanning)',
    arrive.boss && arrive.key === 'voltWyrm' && arrive.armed && arrive.nearDrop && arrive.scanning);
  check('the map UNDERTOW holds its breath on boss arrival', arrive.parked);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.scanning = false; if (r.scanUi) { try { r.hideScouter(); } catch(e){} }})()`);

  // -- 13. segmented serpent: follow-the-leader + S-wave + brush/shot split -------------
  const seg = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, b=r.boss, bs=b.boss, p=r.player;
    bs.nextVerbAt = r.time.now + 1e9; bs.nextSigAt = r.time.now + 1e9; bs.busyUntil = 0; bs.rootUntil = 0;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // inits segments
    var count = C.segs.length;
    // drive the head so followers trace its path (S-wave weave advances)
    var ph0 = bs.wavePhase;
    for (var i = 0; i < 20; i++) { b.body.reset(1000 + i * 8, 1000); ABYSS_SCENE.bossUpdate(r, b, p, r.time.now); ABYSS_SCENE.update(r, r.time.now, 16); }
    var s0 = C.segs[0].spr, follows = Math.hypot(s0.x - b.x, s0.y - b.y) > 4 && Math.hypot(s0.x - b.x, s0.y - b.y) < bs.def.segments.spacing * 3;
    var swave = bs.wavePhase > ph0;
    // player shot on a SEGMENT: shared hp pool but reduced (armored body)
    var mid = C.segs[5].spr;
    var hp0 = bs.hp;
    var sh = Entities.fireProjectile(r, r.playerShots, mid.x, mid.y, 0, 0, 20, 3000, 'arrow', false);
    ABYSS_SCENE.update(r, r.time.now, 16);
    var segHit = bs.hp === hp0 - Math.round(20 * bs.def.segments.segHitMult) && !sh.active;
    // segment BRUSH damage to the player is light
    p.body.reset(mid.x, mid.y); p.state.lastHitAt = -1e9; var php0 = p.state.hp; C.brushAt = 0; r.hitstopActive = false;
    ABYSS_SCENE.update(r, r.time.now, 16);
    var brushed = p.state.hp < php0 && (php0 - p.state.hp) <= bs.def.segments.brushDmg + 1;
    p.state.hp = php0; p.body.reset(C.arena.x, C.arena.y);
    return { count: count, follows: follows, swave: swave, segHit: segHit, brushed: brushed };})()`);
  check('VOLT WYRM is SEGMENTED (11) — followers trace the head; the S-wave weave runs',
    seg.count === 11 && seg.follows && seg.swave);
  check('player shots on a SEGMENT chip the shared pool (armored/reduced); brush is LIGHT',
    seg.segHit && seg.brushed);

  // -- 14. P1 verbs: SNAP STRIKE lane · VOLT DISCHARGE rings · TAIL WHIP zone -----------
  const p1 = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, b=r.boss, bs=b.boss, p=r.player;
    bs.nextSigAt = r.time.now + 1e9; bs.busyUntil = 0; bs.rootUntil = 0; bs._phase2 = false; bs.hp = bs.maxHp;
    p.body.reset(b.x + 200, b.y);
    var l0 = C.lanes.length; bs.verbIdx = 0; bs.nextVerbAt = 1;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // SNAP STRIKE
    var snapped = C.lanes.length === l0 + 1 && C.lanes[C.lanes.length-1].fromBoss && bs.rootUntil > r.time.now;
    C.lanes.forEach(function(l){ if (l.g) try { l.g.destroy(); } catch(x){} }); C.lanes = [];
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;
    var ri0 = C.rings.length;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // VOLT DISCHARGE
    var discharged = C.rings.length === ri0 + bs.def.patterns.voltDischarge.points && C.rings[C.rings.length-1].fromBoss;
    C.rings.forEach(function(G){ try { G.g.destroy(); } catch(x){} }); C.rings = [];
    bs.busyUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1;
    var z0 = C.zones.length;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // TAIL WHIP
    var whipped = C.zones.length === z0 + 1 && C.zones[C.zones.length-1].fromBoss;
    C.zones.forEach(function(z){ if (z.ring) try { z.ring.destroy(); } catch(x){} }); C.zones = []; r._zoneWarns.length = 0;
    return { snapped: snapped, discharged: discharged, whipped: whipped };})()`);
  check('P1: SNAP STRIKE arrow-lane · VOLT DISCHARGE 3 rings · TAIL WHIP arc',
    p1.snapped && p1.discharged && p1.whipped);

  // -- 15. SIGNATURE — DEEP DIVE: submerge → shadow → breach → vented ×1.5 --------------
  const dive = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, b=r.boss, bs=b.boss, p=r.player;
    bs._phase2 = false; bs.hp = bs.maxHp; bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextVerbAt = r.time.now + 1e9; bs.nextSigAt = 1;
    p.body.reset(C.arena.x, C.arena.y);
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // DEEP DIVE begins
    var dove = !!C.dive && !b.visible && !b.body.enable && bs.diving;
    C.dive.moveUntil = 1;
    ABYSS_SCENE.update(r, r.time.now, 16);                // shadow → breach warn
    var breaching = C.dive && C.dive.phase === 'breach';
    C.dive.breachAt = 1; p.state.lastHitAt = -1e9;
    ABYSS_SCENE.update(r, r.time.now, 16);                // BREACH
    var surfaced = !C.dive && b.visible && b.body.enable && !bs.diving;
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    return { dove: dove, breaching: breaching, surfaced: surfaced, vented: vented };})()`);
  check('DEEP DIVE: submerges (untargetable) → shadow → BREACHES → beached & VENTED ×1.5',
    dive.dove && dive.breaching && dive.surfaced && dive.vented);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150 (×1.5)', ventDmg === 150, ventDmg + ' dmg');

  // -- 16. P2 verbs: LIVE WIRE window · CHAIN LIGHTNING (eel-gated + reroute) · UNDERTOW -
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, b=r.boss, bs=b.boss, p=r.player;
    bs._phase2 = true; bs.hp = bs.maxHp * 0.4; bs.ventedUntil = 0;
    bs.nextSigAt = r.time.now + 1e9; bs.busyUntil = 0; bs.rootUntil = 0;
    // LIVE WIRE
    bs.verbIdx = 0; bs.nextVerbAt = 1;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);
    var live = bs.liveWireUntil > r.time.now;
    bs.liveWireUntil = 0;
    // CHAIN LIGHTNING with NO eel → reroutes to discharge rings
    bs.busyUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;
    var ri0 = C.rings.length;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);
    var rerouted = C.rings.length > ri0;
    C.rings.forEach(function(G){ try { G.g.destroy(); } catch(x){} }); C.rings = [];
    // …with a volt eel present → real chain arcs (fromBoss lanes)
    var eel = Entities.spawnMob(r, 'voltEel', b.x + 120, b.y);
    bs.busyUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;
    var l0 = C.lanes.length;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);
    var chained = C.lanes.length > l0 && C.lanes[C.lanes.length-1].fromBoss;
    C.lanes.forEach(function(l){ if (l.g) try { l.g.destroy(); } catch(x){} }); C.lanes = [];
    Entities.clearNameTag(eel); eel.body.enable = false; r.mobs.killAndHide(eel);
    // SERPENT'S UNDERTOW → his own inward pull
    bs.busyUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1;
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);
    var hasPull = !!C.bossPull;
    p.body.reset(C.arena.x + 300, C.arena.y); p.body.velocity.x = 0; p.body.velocity.y = 0;
    while (ABYSS_SCENE._anchored(r, C, p.x, p.y)) p.body.reset(p.x + 40, p.y);
    ABYSS_SCENE.update(r, r.time.now, 16);
    var pulledIn = p.body.velocity.x < -20;               // toward arena center (at -x from player)
    C.bossPull = null; p.body.velocity.x = 0;
    return { live: live, rerouted: rerouted, chained: chained, hasPull: hasPull, pulledIn: pulledIn };})()`);
  check('P2: LIVE WIRE arms a timed window · CHAIN LIGHTNING is eel-gated (reroutes w/o one)',
    p2.live && p2.rerouted && p2.chained);
  check("P2: SERPENT'S UNDERTOW drags you into the coil (his own pull)", p2.hasPull && p2.pulledIn);

  // -- 17. SIGNATURE — MAELSTROM BREACH: 3 dives → lattice → longest vent ---------------
  const mael = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab, b=r.boss, bs=b.boss, p=r.player;
    bs._phase2 = true; bs.hp = bs.maxHp * 0.4; bs.ventedUntil = 0;
    bs.nextVerbAt = r.time.now + 1e9; bs.busyUntil = 0; bs.rootUntil = 0; bs.nextSigAt = 1;
    p.body.reset(C.arena.x, C.arena.y);
    ABYSS_SCENE.bossUpdate(r, b, p, r.time.now);          // MAELSTROM begins
    var began = !!C.maelstrom && C.maelstrom.seq.length === bs.def.patterns.maelstrom.dives && !b.visible;
    var ri0 = C.rings.length;
    for (var i = 0; i < 8 && C.maelstrom; i++) { C.maelstrom.seq.forEach(function(S){ S.at = 1; }); ABYSS_SCENE.update(r, r.time.now, 16); }
    var lattice = C.rings.length > ri0;                   // the final breach erupts the ring lattice
    var surfaced = !C.maelstrom && b.visible && b.body.enable;
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    C.rings.forEach(function(G){ try { G.g.destroy(); } catch(x){} }); C.rings = [];
    return { began: began, lattice: lattice, surfaced: surfaced, vented: vented };})()`);
  check('MAELSTROM BREACH: 3 warned dives → full-arena LATTICE → surfaces & vented (longest)',
    mael.began && mael.lattice && mael.surfaced && mael.vented);

  // -- 18. kill → chest + the boss machinery swept -------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 9999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._ab;
    ABYSS_SCENE.update(r, r.time.now, 16);
    return { swept: !C.dive && !C.maelstrom && !C.bossPull && !C.bossArmed && C.segs.length === 0 };})()`);
  check('the Volt Wyrm falls → chest/loot flow + his machinery swept', clean.swept);

  // -- 19. zero console errors ---------------------------------------------------------
  check('zero console/page errors on the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log('RESULT: ' + (step - failures) + '/' + step);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); console.log('RESULT: 0/0'); process.exit(1); });
