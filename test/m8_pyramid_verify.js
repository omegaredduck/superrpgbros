// M8 PYRAMID PLUNDER verification suite — realm 6, registry map 2.
// Registry/data · bestiary · layout · quicksand slow · wrap · the TREASURE &
// CURSE loop (loot pays + angers, urns free, traps arm, retaliation) · the 3
// mapVerbs · NEFERU-KA: sarcophagus entrance, phase-1 telegraphs, the
// TRANSFORMATION into THE EXECUTIONER, judgment vent, kill → chest.
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

  // -- 1. boot: registry rows + the theme ---------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.pyramid, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.neferuka;
    return { def: !!MAPS.defs.pyramid, roster: DATA.biomes.pyramid.mobs.length,
             twoPhase: bd.mapOwned === true && bd.transform === true && !!bd.exec,
             noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length, execHints: bd.execScouter.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'pyramid' && !x.locked; }),
             musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 8-mob roster + console unlock', reg.def && reg.roster === 8 && reg.consoleRow);
  check('boss is mapOwned TWO-PHASE (transform + exec), NO radial/stream filler', reg.twoPhase && reg.noFiller);
  check('scouter hints ≤6 PER PHASE (boss contract)', reg.hints <= 6 && reg.execHints <= 6);
  check('THE ETERNAL CHILD: equal-beat tracks, EXACTLY 180.0s', reg.equalBeats && Math.abs(reg.musicSec - 180) < 1e-9, reg.musicSec + 's');

  // -- 2. enter the realm --------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'pyramid' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr;
    return { id: r.realmId, pits: P.pits.length, loot: P.loot.length, urns: P.urns.length,
             traps: P.traps.length, statues: P.statues.length, sarco: !!P.sarco };})()`);
  check('pyramid scene: 5 pits + 8 lootables + urns + 4 traps + 4 anubis + the sarcophagus',
    realm.id === 'pyramid' && realm.pits === 5 && realm.loot === 8 && realm.urns === 5 &&
    realm.traps === 4 && realm.statues === 4 && realm.sarco);

  // -- 3. quicksand slows the mover (players + walkers) --------------------------
  const qs = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var q = P.pits[0];
    p.body.reset(q.x, q.y); p.body.velocity.x = 100; p.body.velocity.y = 0;
    PYRAMID_SCENE.update(r, r.time.now, 16);
    var inV = p.body.velocity.x;
    p.body.reset(r.worldW * 0.5, r.worldH * 0.86); p.body.velocity.x = 100; p.body.velocity.y = 0;
    PYRAMID_SCENE.update(r, r.time.now, 16);
    return { inV: inV, outV: p.body.velocity.x };})()`);
  check('quicksand halves the mover; open sand does not', qs.inV < 60 && Math.abs(qs.outV - 100) < 2,
    'pit ' + qs.inV.toFixed(0) + ' vs sand ' + qs.outV.toFixed(0));

  // -- 4. toroidal wrap -----------------------------------------------------------
  const wrap = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    p.body.reset(r.worldW * 0.5, -8); p.body.velocity.y = -50;
    PYRAMID_SCENE.update(r, r.time.now, 16);
    var y = p.y;
    p.body.reset(r.worldW * 0.5, r.worldH * 0.86);
    return y;})()`);
  check('wrap: off the north edge reappears south', wrap > 2000, 'y=' + Math.round(wrap));

  // -- 5. TREASURE & CURSE: loot pays + angers the tomb ---------------------------
  const loot = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var cfg = r.realmDef.curse, L = P.loot[0];
    var xp0 = p.state.xp + p.state.level * 100000;
    p.body.reset(L.x, L.y);
    PYRAMID_SCENE.update(r, r.time.now, 16);
    return { looted: L.looted, curse: P.curse, buff: P.buffUntil > r.time.now,
             dot: P.dotUntil > r.time.now,
             pitGrew: P.pits[0].r > P.pits[0].base };})()`);
  check('walking over PLUNDER loots it: haste buff + curse DoT + curse counter',
    loot.looted && loot.curse === 1 && loot.buff && loot.dot);
  check('quicksand churns WIDER with the theft', loot.pitGrew);
  const urn = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var U = P.urns[0], c0 = P.curse;
    p.body.reset(U.x, U.y);
    PYRAMID_SCENE.update(r, r.time.now, 16);
    return { smashed: U.smashed, curseSame: P.curse === c0 };})()`);
  check('urns are FREE micro-smashes (no curse)', urn.smashed && urn.curseSame);
  const trap = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var T = P.traps[0];
    p.body.reset(T.x, T.y);
    var n0 = P.lanes.length;
    PYRAMID_SCENE.update(r, r.time.now, 16);
    var fired = P.lanes.length === n0 + 1;
    // clear the pending volley
    P.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); P.lanes = [];
    p.body.reset(r.worldW * 0.5, r.worldH * 0.86);
    return fired;})()`);
  check('armed TRAP PLATE fires a warned dart lane when crossed (curse ≥ 1)', trap);
  const wave = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var q0 = r._spawnQueue.length;
    P.curse = 2;                                     // next loot hits waveEvery=3
    var L = P.loot[1];
    p.body.reset(L.x, L.y);
    PYRAMID_SCENE.update(r, r.time.now, 16);
    p.body.reset(r.worldW * 0.5, r.worldH * 0.86);
    return { curse: P.curse, queued: r._spawnQueue.length - q0, dim: !!P.skyDim };})()`);
  check('high curse → TOMB RETALIATION wave (guards + jackals queued, sky dims)',
    wave.curse === 3 && wave.queued === 5 && wave.dim, wave.queued + ' queued');

  // -- 6. the 3 mapVerbs -----------------------------------------------------------
  const verbs = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr, p=r.player;
    var out = {};
    // KHOPESH GUARD shield window: force it on → hurtMob bounces
    var g = Entities.spawnMob(r, 'khopeshGuard', p.x + 60, p.y);
    g.mob.nextShieldAt = 1;
    Entities.updateMob(r, g, p, r.time.now);
    var hp0 = g.mob.hp;
    Entities.hurtMob(r, g, 50, r.time.now);
    out.blocked = g.mob.hp === hp0 && g.mob.guardShieldUntil > r.time.now;
    // after the window: vulnerable
    g.mob.guardShieldUntil = 1;
    Entities.hurtMob(r, g, 10, r.time.now);
    out.vulnerable = g.mob.hp === hp0 - 10;
    // SANDSTONE GOLEM pound: telegraphed zone at his feet + rooted
    var go = Entities.spawnMob(r, 'sandstoneGolem', p.x + 80, p.y);
    go.mob.nextPoundAt = 1;
    var z0 = P.zones.length;
    Entities.updateMob(r, go, p, r.time.now);
    out.pound = P.zones.length === z0 + 1 && !!go.mob.pound;
    // JACKAL pack: first jackal queues 1-2 mates; pack credits stop the chain
    var q0 = r._spawnQueue.length;
    var j = Entities.spawnMob(r, 'jackalRunner', p.x + 100, p.y);
    Entities.updateMob(r, j, p, r.time.now);
    var queued = r._spawnQueue.length - q0;
    out.pack = queued >= 1 && queued <= 2 && P.pendingPack === queued;
    [g, go, j].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    P.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); P.zones = []; r._zoneWarns.length = 0;
    r._spawnQueue = [];
    return out;})()`);
  check('KHOPESH GUARD shield window bounces damage, then a generous gap', verbs.blocked && verbs.vulnerable);
  check('SANDSTONE GOLEM telegraphs a ground-pound circle + roots', verbs.pound);
  check('JACKALS spawn in packs (credits stop chain-packs)', verbs.pack);

  // -- 7. curse clocks shift through unfreeze() ------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr;
    P.dotUntil = r.time.now + 5000; P.buffUntil = r.time.now + 6000;
    P.traps[0].nextAt = r.time.now + 7000;
    P.zones.push({ x: 0, y: 0, r: 10, at: r.time.now + 3000, dmg: 0, src: 't', ring: null });
    var before = { d: P.dotUntil, b: P.buffUntil, t: P.traps[0].nextAt, z: P.zones[0].at };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { d: P.dotUntil - before.d, b: P.buffUntil - before.b,
                 t: P.traps[0].nextAt - before.t, z: P.zones[0].at - before.z };
      P.zones = []; P.dotUntil = 0; P.buffUntil = 0;
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts dot/buff/trap/zone clocks by the paused time',
    shift.d > 500 && shift.b > 500 && shift.t > 500 && shift.z > 500, '+' + Math.round(shift.d) + 'ms');

  // -- 8. quota → portal → SARCOPHAGUS entrance → phase 1 ---------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'scarab', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._pyr;
    return { key: r.boss.boss.key, onSeal: Math.hypot(r.boss.x - P.seal.x, r.boss.y - P.seal.y) < 40,
             dim: !!P.dim, lidMoved: P.sarco.x > P.seal.x + 30 };})()`);
  check('the sarcophagus creaks open — NEFERU-KA floats out onto the seal',
    boss.key === 'neferuka' && boss.onSeal && boss.lidMoved && boss.dim);
  await page.keyboard.press('Enter');
  await sleep(250);
  const p1 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, P=r._pyr;
    bs.busyUntil = 0; bs.nextSigilAt = 1;
    bs.nextGazeAt = bs.nextQuakeAt = bs.nextSandsAt = bs.nextSummonAt = r.time.now + 99999;
    var z0 = P.zones.length;
    PYRAMID_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var sigils = P.zones.length - z0;
    var tagged = P.zones.slice(z0).every(function(z){ return z.fromBoss; });
    P.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); P.zones = []; r._zoneWarns.length = 0;
    return { sigils: sigils, tagged: tagged, phase: bs.phase };})()`);
  check('phase 1: CURSE SIGILS paint 3 warned circles, ALL fromBoss', p1.sigils === 3 && p1.tagged && p1.phase === 1);

  // -- 9. THE TRANSFORMATION: phase-1 death → THE EXECUTIONER ----------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')};
    return r.boss && r.boss.active && r.boss.boss.phase === 2 && !r.boss.boss.resurrecting;})()`,
    null, { timeout: 15000 });
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss;
    return { tex: b.texture.key, hpFull: bs.hp === bs.maxHp, phase2done: bs.phase2done,
             faster: (bs.spdMult || 1) > 2, bodyBig: b.body.width * b.scaleX > 40 };})()`);
  check('THE EXECUTIONER strides out: new texture, full HP pool, hunter speed, REAL body',
    p2.tex === 'executionerHi' && p2.hpFull && p2.phase2done && p2.faster && p2.bodyBig);
  await page.keyboard.press('Enter');                    // dismiss the phase-2 scouter
  await sleep(250);

  // -- 10. JUDGMENT OF THE FOUR: statue lanes in sequence → he kneels (vent) --------
  const judgment = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, P=r._pyr;
    bs.busyUntil = 0; bs.rootUntil = 0;
    bs.nextJudgmentAt = 1;
    bs.nextCrossAt = bs.nextWhirlAt = bs.nextBrandAt = bs.nextLeapAt = bs.nextAddsAt = r.time.now + 99999;
    PYRAMID_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var began = !!bs.judgment && bs.rootUntil > r.time.now;
    // fast-forward: all four statues fire
    for (var i = 0; i < 4; i++) { if (bs.judgment) { bs.judgment.nextAt = 1; PYRAMID_SCENE.bossUpdate(r, b, r.player, r.time.now); } }
    var lanes = P.lanes.length;
    P.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); P.lanes = [];
    return { began: began, lanes: lanes };})()`);
  check('JUDGMENT roots him; all four statues sweep beam lanes', judgment.began && judgment.lanes === 4, judgment.lanes + ' lanes');
  await page.waitForFunction(`(function(){var r=${scene('Realm')};
    return r.boss && r.boss.boss.ventedUntil > r.time.now;})()`, null, { timeout: 8000 });
  const vent = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('after the fourth statue he KNEELS — vented damage lands at 150', vent === 150, vent + ' dmg');

  // -- 11. phase-2 death CLOSES the fight (no second transform) ---------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  check('killing THE EXECUTIONER drops the chest (fight over)', true);

  // -- 12. zero console errors -------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
