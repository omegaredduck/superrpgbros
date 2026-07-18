// M11 PIRATE SHIP verification suite — realm 9, registry map 5.
// Registry/data · THE KRAKEN'S SHANTY (300 beats @100 = 180.0s) · layout ·
// THE ROCKING DECK (swell slide + rail clamp + cargo rollers) · water slows ·
// the 8 mapVerbs (powder-monkey keg env-credit · siren pull · kraken-arm
// erupt/sweep/withdraw · mako arcs · swab wobble · harpoon PIN + release ·
// ink slicks) · CAPTAIN KRAKEN: tentacle-throw entrance, cutlass combo,
// tentacle slam, keg toss, GHOST SHIP broadside → vented ×1.5, kill → chest.
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

  // -- 1. boot: registry + the shanty ---------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.pirate, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.captainkraken;
    return { def: !!MAPS.defs.pirate, roster: DATA.biomes.pirate.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'pirate' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 10-mob roster + console unlock', reg.def && reg.roster === 10 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check("THE KRAKEN'S SHANTY: 300 beats @100, equal tracks, EXACTLY 180.0s",
    reg.equalBeats && reg.beats === 300 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ----------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'pirate' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir;
    return { id: r.realmId, rails: S.rails, ship: !!S.ship, arena: !!S.arena, swell: !!S.swell };})()`);
  check('pirate scene: the ship + rails ring the deck + the foredeck arena + the swell clock',
    realm.id === 'pirate' && realm.rails >= 12 && realm.ship && realm.arena && realm.swell);

  // -- 3. park the ambient swell (suite fixture rule) ------------------------------
  await page.evaluate(`(function(){var S=${scene('Realm')}._pir; S.swell.nextAt = Infinity;})()`);

  // -- 4. THE SWELL: slide drags deck-standers to the low rail; beach is safe ------
  const swell = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    var m = Entities.spawnMob(r, 'deckhand', S.ship.x0 + 200, r.worldH * 0.5);
    // force a live slide to starboard (+x)
    S.swell.dir = 1; S.swell.hard = false; S.swell.slideUntil = r.time.now + 1000;
    p.body.reset(S.ship.x0 + 150, r.worldH * 0.5);
    var px0 = p.x, mx0 = m.x;
    PIRATE_SCENE.update(r, r.time.now, 100);
    var onDeck = { p: p.x - px0, m: m.x - mx0 };
    // beach stander unaffected
    p.body.reset(r.worldW * 0.06, r.worldH * 0.5);
    var bx0 = p.x;
    PIRATE_SCENE.update(r, r.time.now, 100);
    var onBeach = p.x - bx0;
    S.swell.slideUntil = 0; S.swell.nextAt = Infinity;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return { p: onDeck.p, m: onDeck.m, beach: onBeach };})()`);
  check('the SLIDE drags player AND mobs on deck toward the low rail', swell.p > 1 && swell.m > 1,
    '+' + swell.p.toFixed(1) + 'px / +' + swell.m.toFixed(1) + 'px');
  check('the beach does not tilt (cove standers unaffected)', Math.abs(swell.beach) < 0.5);

  // -- 5. RAIL SAFETY: the slide clamps you at the rail, never overboard -----------
  const rail = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    S.swell.dir = 1; S.swell.hard = false; S.swell.slideUntil = r.time.now + 1000;
    p.body.reset(S.ship.x1 - 20, r.worldH * 0.5);
    for (var i = 0; i < 10; i++) PIRATE_SCENE.update(r, r.time.now, 100);
    var clamped = p.x <= S.ship.x1 - 17;
    S.swell.slideUntil = 0; S.swell.nextAt = Infinity;
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return clamped;})()`);
  check('RAIL SAFETY: pinned at the low rail, never pushed overboard', rail);

  // -- 6. LOOSE CARGO: rollers cross the deck, kill mobs credited, hurt you --------
  const barrel = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    p.state.lastHitAt = -1e9; p.state.hp = p.state.stats.hp;
    PIRATE_SCENE._rollBarrels(r, S, 1, r.time.now);
    var n = S.barrels.length;
    // park a victim + the player right on a roller's path
    var B = S.barrels[0];
    var v = Entities.spawnMob(r, 'deckhand', B.x + 10, B.y);
    var kills0 = p.state.kills;
    p.body.reset(B.x + 12, B.y);
    var hp0 = p.state.hp;
    PIRATE_SCENE.update(r, r.time.now, 100);
    var out = { spawned: n, victimDead: !v.active, credited: p.state.kills - kills0, hurt: p.state.hp < hp0 };
    S.barrels.forEach(function(B2){ B2.spr.destroy(); }); S.barrels = [];
    p.state.hp = hp0;
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return out;})()`);
  check('a HARD SWELL rolls barrels: the roller kills the mob (credited) + clips you',
    barrel.spawned === 3 && barrel.victimDead && barrel.credited === 1 && barrel.hurt);

  // -- 7. the sea slows swimmers ----------------------------------------------------
  const water = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    p.body.reset(r.worldW * 0.25, r.worldH * 0.2);           // open water
    p.body.velocity.x = 100;
    PIRATE_SCENE.update(r, r.time.now, 16);
    var wet = p.body.velocity.x;
    p.body.reset(r.worldW * 0.06, r.worldH * 0.5);           // beach
    p.body.velocity.x = 100;
    PIRATE_SCENE.update(r, r.time.now, 16);
    var dry = p.body.velocity.x;
    p.body.velocity.x = 0;
    return { wet: wet, dry: dry };})()`);
  check('open water SLOWS the swimmer; the beach does not', water.wet < 60 && water.dry > 95);

  // -- 8. POWDER MONKEY: fuse blast is credited env-kill; shootable early ----------
  const monkey = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
    p.state.lastHitAt = -1e9; p.state.hp = p.state.stats.hp;
    var m = Entities.spawnMob(r, 'powderMonkey', p.x + 70, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // arms (inside armRange)
    var armed = !!m.mob.blastAt;
    var v = Entities.spawnMob(r, 'deckhand', m.x + 40, m.y);
    var kills0 = p.state.kills;
    m.mob.blastAt = 1;
    var hp0 = p.state.hp;
    Entities.updateMob(r, m, p, r.time.now);                 // BOOM
    var out = { armed: armed, monkeyDead: !m.active, victimDead: !v.active,
                credited: p.state.kills - kills0, hurt: p.state.hp < hp0 };
    p.state.hp = hp0;
    // shot-early path
    var m2 = Entities.spawnMob(r, 'powderMonkey', p.x + 400, p.y);
    Entities.updateMob(r, m2, p, r.time.now);                // registers the watcher
    var v2 = Entities.spawnMob(r, 'deckhand', m2.x + 30, m2.y);
    Entities.hurtMob(r, m2, 99999, r.time.now);              // SHOT DOWN early
    PIRATE_SCENE.update(r, r.time.now, 16);                  // watcher fires the blast
    out.popEarly = !v2.active;
    if (v2.active) { Entities.clearNameTag(v2); v2.body.enable = false; r.mobs.killAndHide(v2); }
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return out;})()`);
  check('POWDER MONKEY fuse: monkey + bystander die CREDITED, the blast burns you',
    monkey.armed && monkey.monkeyDead && monkey.victimDead && monkey.credited === 2 && monkey.hurt);
  check('shooting the monkey pops the keg EARLY — the blast still lands', monkey.popEarly);

  // -- 9. SIREN: her song window PULLS you toward her -------------------------------
  const siren = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
    var m = Entities.spawnMob(r, 'sirenWake', p.x + 200, p.y);
    m.mob.nextSongAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // begins the song
    var singing = m.mob.songUntil > r.time.now;
    var x0 = p.x;
    PIRATE_SCENE.update(r, r.time.now, 100);
    var pulled = p.x - x0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return { singing: singing, pulled: pulled };})()`);
  check('SIREN song window pulls you toward the rails', siren.singing && siren.pulled > 1,
    '+' + (siren.pulled || 0).toFixed(1) + 'px');

  // -- 10. KRAKEN ARM: warned hole → erupts rooted → sweeps → withdraws -------------
  const arm = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
    var m = Entities.spawnMob(r, 'krakenArm', p.x + 150, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // buries + warns
    var buried = !m.visible && m.body.enable === false && !!m.mob._hole;
    m.mob.emergeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // erupts
    var up = m.visible && m.body.enable === true;
    m.mob.nextSweepAt = 1;
    var l0 = S.lanes.length;
    Entities.updateMob(r, m, p, r.time.now);
    var swept = S.lanes.length === l0 + 1;
    m.mob.withdrawAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // withdraws + re-buries
    var moved = !m.visible && !m.mob.emergeAt && m.body.enable === false;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    if (m.mob._hole) m.mob._hole.destroy();
    S.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); S.lanes = [];
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return { buried: buried, up: up, swept: swept, moved: moved };})()`);
  check('KRAKEN ARM: warned deck hole → erupts rooted', arm.buried && arm.up);
  check('…sweeps a telegraphed lane, then withdraws to ambush anew', arm.swept && arm.moved);

  // -- 11. MAKO LEAPER: marked ring + arc + landing ---------------------------------
  const mako = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    return new Promise(function(res){
      p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
      var m = Entities.spawnMob(r, 'makoLeaper', p.x + 200, p.y);
      m.mob.nextHopAt = 1;
      Entities.updateMob(r, m, p, r.time.now);
      var out = { hopped: !!m.mob.hop, airborne: m.body.enable === false };
      if (m.mob.hop) m.mob.hop.until = r.time.now + 30;
      setTimeout(function(){
        Entities.updateMob(r, m, p, r.time.now);
        out.landed = !m.mob.hop && m.body.enable === true;
        Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
        p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
        res(out);
      }, 80);
    });})()`);
  check('MAKO LEAPER sails a marked arc over the rails and lands', mako.hopped && mako.airborne && mako.landed);

  // -- 12. DRUNKEN SWAB: erratic wobble owns his path -------------------------------
  const swab = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'drunkenSwab', p.x + 200, p.y);
    m.mob.wobbleAt = r.time.now + 99999; m.mob._wob = 1.0;   // pin the lurch
    Entities.updateMob(r, m, p, r.time.now);
    var v1 = Math.atan2(m.body.velocity.y, m.body.velocity.x);
    m.mob._wob = -1.0;                                       // force the other lurch
    Entities.updateMob(r, m, p, r.time.now);
    var v2 = Math.atan2(m.body.velocity.y, m.body.velocity.x);
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return Math.abs(v1 - v2) > 0.5;})()`);
  check('DRUNKEN SWAB lurches on a zig-zag of his own', swab);

  // -- 13. HARPOONER: lane telegraph → PIN roots you, then releases ------------------
  const pinLock = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    p.state.lastHitAt = -1e9; window._t17hp = p.state.hp;
    p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
    var m = Entities.spawnMob(r, 'harpooner', p.x + 200, p.y);
    m.mob.nextShotAt2 = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // locks the lane
    window._t17m = m;
    return m.mob.lineLockUntil > r.time.now;})()`);
  // the warn resolves on SCENE time (headless throttles it) — poll for the pin
  await page.waitForFunction(`!!${scene('Realm')}._pir.pin`, null, { timeout: 20000 });
  const pin = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.hitstopActive = false;
    var out = { pinned: !!S.pin && p.state.hp < window._t17hp };
    S.pin.until = r.time.now + 5000;                         // hold it for the root check
    p.body.velocity.x = 150;
    PIRATE_SCENE.update(r, r.time.now, 16);                  // pin roots you
    out.rooted = p.body.velocity.x === 0;
    S.pin.until = 1;
    PIRATE_SCENE.update(r, r.time.now, 16);                  // timeout → release
    out.released = !S.pin;
    p.state.hp = window._t17hp;
    var m = window._t17m;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return out;})()`);
  check('HARPOONER lane hits → brief PIN (rooted), then release', pinLock && pin.pinned && pin.rooted && pin.released);

  // -- 14. INKPOT OCTO: warned glob → slippery slick slows you -----------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    S.slicks.forEach(function(K){ K.obj.destroy(); }); S.slicks = [];
    p.body.reset(r.worldW * 0.6, r.worldH * 0.5);
    var m = Entities.spawnMob(r, 'inkpotOcto', p.x + 150, p.y);
    m.mob.nextSprayAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // lobs the glob
    window._t18m = m;})()`);
  await page.waitForFunction(`${scene('Realm')}._pir.slicks.length >= 1`, null, { timeout: 20000 });
  const ink = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir, p=r.player;
    p.body.reset(S.slicks[0].x, S.slicks[0].y);
    p.body.velocity.x = 100;
    PIRATE_SCENE.update(r, r.time.now, 16);
    var out = { slick: true, slowed: p.body.velocity.x < 60 };
    S.slicks.forEach(function(K){ K.obj.destroy(); }); S.slicks = [];
    p.body.velocity.x = 0;
    var m = window._t18m;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW * 0.07, r.worldH * 0.5);
    return out;})()`);
  check('INKPOT OCTO slick lands and SLOWS anyone in it', ink.slick && ink.slowed);

  // -- 15. clocks shift through unfreeze() -------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir;
    S.swell.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'sirenWake', r.player.x + 900, r.player.y);
    m.mob.nextSongAt = r.time.now + 6000;
    var before = { s: S.swell.nextAt, m: m.mob.nextSongAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { s: S.swell.nextAt - before.s, m: m.mob.nextSongAt - before.m };
      S.swell.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts swell + mob clocks', shift.s > 500 && shift.m > 500);

  // -- 16. quota → the COLOSSAL TENTACLE throws him aboard ----------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'deckhand', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, S=r._pir;
    return { key: r.boss.boss.key, threw: S.threwCaptain,
             inArena: Math.hypot(r.boss.x - S.arena.x, r.boss.y - S.arena.y) < S.arena.r + 40 };})()`);
  check('the tentacle THROWS Captain Kraken onto the foredeck',
    boss.key === 'captainkraken' && boss.threw && boss.inArena);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 17. TENTACLE SLAM line + KEG TOSS ----------------------------------------------
  const kit = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, S=r._pir;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextSlamAt = 1;
    bs.nextComboAt = bs.nextKegAt = bs.nextCrewAt = bs.nextSwellAt = bs.nextBroadsideAt = r.time.now + 99999;
    var z0 = S.zones.length;
    PIRATE_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var slams = S.zones.length - z0;
    S.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); S.zones = []; r._zoneWarns.length = 0;
    // keg toss queues deckKeg mobs
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextKegAt = 1; bs.nextSlamAt = r.time.now + 99999;
    var q0 = r._spawnQueue.length;
    PIRATE_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var kegs = r._spawnQueue.length - q0;
    var allKegs = r._spawnQueue.slice(q0).every(function(e){ return e.key === 'deckKeg'; });
    r._spawnQueue.length = q0;
    return { slams: slams, kegs: kegs, allKegs: allKegs };})()`);
  check('TENTACLE SLAM marches 5 warned circles down the line', kit.slams === 5, kit.slams + ' zones');
  check('KEG TOSS queues 3 shootable powder kegs', kit.kegs === 3 && kit.allKegs);

  // -- 18. GHOST SHIP BROADSIDE: surfaces, rakes two lane waves, sinks → VENTED -------
  const ghost = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, S=r._pir;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextBroadsideAt = 1;
    bs.nextKegAt = bs.nextSlamAt = bs.nextComboAt = bs.nextCrewAt = bs.nextSwellAt = r.time.now + 99999;
    PIRATE_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var surfaced = !!S.ghost && S.ghost.phase === 'surface';
    r.player.setPosition(r.worldW * 0.1, r.worldH * 0.5);    // off the ship — dodge it all
    // fast-forward: surface → wave 1 → wave 2 → sink
    var l0 = S.lanes.length;
    S.ghost.at = 1; PIRATE_SCENE.update(r, r.time.now, 16);  // wave 0 fires warns
    var wave1 = S.lanes.length - l0;
    S.ghost.at = 1; PIRATE_SCENE.update(r, r.time.now, 16);  // wave 1
    var wave2 = S.lanes.length - l0 - wave1;
    S.ghost.at = 1; PIRATE_SCENE.update(r, r.time.now, 16);  // → sink
    S.ghost.at = 1; PIRATE_SCENE.update(r, r.time.now, 16);  // sink done → vented
    S.lanes.forEach(function(l){ l.at = 1; });
    PIRATE_SCENE.update(r, r.time.now, 16);                  // lanes resolve (nobody aboard)
    return { surfaced: surfaced, wave1: wave1, wave2: wave2, gone: !S.ghost,
             vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult };})()`);
  check('THE GHOST SHIP surfaces and rakes TWO 3-lane waves', ghost.surfaced && ghost.wave1 === 3 && ghost.wave2 === 3);
  check('the summon sinks — he is WINDED (vented ×1.5)', ghost.gone && ghost.vented && ghost.mult === 1.5);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 19. kill → chest ---------------------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  check('Captain Kraken falls → chest/loot flow', true);

  // -- 20. zero console errors ---------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
