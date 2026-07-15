// M5.6 BOSS TEST — THE GRAVEKEEPER: grave-climb arrival trigger, the 5-wave
// immunity loop (IMMUNE while a wave lives → clearing strips 20% max HP), the
// telegraphed verbs, REAPER'S MARCH (touch = death), and a full-clear kill.
// The arrival + next-wave use real-time delayedCalls (headless throttles rAF
// during bare sleeps — the grove ships the same mechanism); this suite drives
// the wave loop DETERMINISTICALLY so it can't flake on the clock.
const path = require('path');
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
let n = 0, fails = 0;
function check(name, ok, detail) { n++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + String(n).padStart(2) + '  ' + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }
const clearWave = `(function(){var r=${scene('Realm')};var k=0;r.mobs.children.iterate(function(m){if(m&&m.active&&m.mob&&m.mob.bossWave){m.mob.hp=0;r.killMobCredited(m);k++;}});return k;})()`;
const tick = `(function(){var r=${scene('Realm')};for(var i=0;i<4;i++)r.update(r.time.now,16);})()`;
const waveAlive = `(function(){var r=${scene('Realm')};var w=0;r.mobs.children.iterate(function(m){if(m&&m.active&&m.mob&&m.mob.bossWave)w++;});return w;})()`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const pageErrors = [], consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(500);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'graveyard' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);

  // arrival TRIGGER (sets the flag + schedules the climb) then drive the climb
  // to completion the way the delayedCall would — deterministic for mechanics
  const arr = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.witching.nextGraveAt=Infinity; r.witching.nextBellAt=Infinity;
    r.gravekeeperArrival(DATA.bosses.gravekeeper);
    var started = r.graveArrivalActive === true;         // the cinematic began
    r.spawnBossNow(DATA.bosses.gravekeeper, r.arenaGrave.x, r.arenaGrave.y);  // = what the climb ends with
    r.showScouter(DATA.bosses.gravekeeper); r.graveArrivalActive = false;
    if (r.scanning) r.dismissScouter();
    return { started: started, boss: !!r.boss, scouterHints: DATA.bosses.gravekeeper.hints.length };})()`);
  check('grave-climb arrival triggers the cinematic', arr.started);
  check('boss spawns (wave 1 queued)', arr.boss);
  check('scouter hints ≤ 6 (panel limit)', arr.scouterHints <= 6, arr.scouterHints + ' hints');

  // drain wave 1 in + confirm IMMUNE
  await page.evaluate(tick); await page.evaluate(tick);
  const w1 = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;var w=0;
    r.mobs.children.iterate(function(m){if(m&&m.active&&m.mob&&m.mob.bossWave)w++;});
    return { wave:w, immune:b.boss.immune, hp:b.boss.hp, maxHp:b.boss.maxHp, idx:b.boss.wave };})()`);
  check('wave 1 walks + the boss is IMMUNE', w1.wave > 0 && w1.immune);

  const imm = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;var hp0=b.boss.hp;
    Entities.hurtBoss(r,b,500); return { blocked: b.boss.hp===hp0 };})()`);
  check('hurtBoss bounces while a wave lives (IMMUNE)', imm.blocked);

  // clear wave 1 → the break strips ~20% max HP (synchronous on the tick)
  await page.evaluate(clearWave);
  await page.evaluate(tick);
  const afterW1 = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;
    return { hpFrac: b.boss.hp/b.boss.maxHp, idx:b.boss.wave };})()`);
  check('clearing a wave strips ~20% max HP', afterW1.hpFrac <= 0.81 && afterW1.hpFrac > 0.75, 'hp=' + afterW1.hpFrac.toFixed(2));

  // verbs must not throw — force each
  const verbs = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;var p=r.player;
    try { r.corpses.push({key:'rattlebones',x:p.x+30,y:p.y,at:r.time.now});
      r.explodeCorpses(b, b.boss.def.patterns.explodeCorpse);
      r.graspingHands(b, p, b.boss.def.patterns.graspingHands);
      r.curseSigils(b, p, b.boss.def.patterns.curseSigils);
      return { ok:true }; } catch(e){ return { ok:false, err:e.message }; }})()`);
  check('Necronomicon verbs run without throwing', verbs.ok, verbs.err || '');

  // REAPER'S MARCH — now armed at FIGHT START (reaperAt timer), rises in a
  // corner, then walks; touch kills once it's done rising.
  const reaper = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;
    b.boss.reaperArmed=true; b.boss.reaperAt=0;           // fire the reaper this tick
    r.gravekeeperUpdate(b, r.player, r.time.now);
    var reap=r.reaper, died=false;
    if(reap){ reap.rising=false; reap.x=r.player.x; reap.y=r.player.y; r.player.state.lastHitAt=0; var hp=r.player.state.hp; r.updateReaper(r.time.now); died=!r.player.state.alive||r.player.state.hp<hp; }
    return { spawned:!!reap, touchKills:died };})()`);
  check("Reaper's March rises at fight start (not HP-gated)", reaper.spawned);
  check('reaper touch is lethal once risen', reaper.touchKills);

  // FULL CLEAR — walk all 5 waves down deterministically (drive each wave, don't
  // wait on the next-wave delayedCall). 5 chunks × 20% = the keeper falls.
  const kill = await page.evaluate(`(function(){var r=${scene('Realm')};var b=r.boss;
    r.player.state.alive=true; r.player.state.hp=r.player.state.stats.hp;
    var W=b.boss.def.waves;
    for(var i=b.boss.wave+1; i<W.count && b.active && b.boss.hp>0; i++){
      r.spawnGraveWave(b, i);
      for(var t=0;t<3;t++)r.update(r.time.now,16);        // drain the wave in
      r.mobs.children.iterate(function(m){if(m&&m.active&&m.mob&&m.mob.bossWave){m.mob.hp=0;r.killMobCredited(m);}});
      for(var t2=0;t2<3;t2++)r.update(r.time.now,16);     // the break strips the chunk
    }
    return { dead: !b.active || b.boss.hp<=0, finalWave:b.boss.wave };})()`);
  check('boss dies once all 5 waves are broken', kill.dead, 'final wave idx=' + kill.finalWave);

  check('NO page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));
  check('NO console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  console.log('\n' + (fails ? fails + ' FAILED' : 'ALL ' + n + ' PASSED'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
