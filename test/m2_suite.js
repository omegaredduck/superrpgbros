// M2 headless verification suite: save v1→v2 migration (TM-4), kill quota →
// boss portal → Boss 1 patterns → realm close reward → potions in nexus →
// graveyard view. Fails on ANY console error.
const { chromium } = require('playwright');
const path = require('path');

const GAME = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) {
  step++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`);
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const scene = (k) => `game.scene.getScene('${k}')`;
  const sleep = (ms) => page.waitForTimeout(ms);

  // -- 1. TM-4: a v1 (M0.5-era) save migrates losslessly up the whole ladder --
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`localStorage.setItem('srb_save_2', JSON.stringify({
    v: 1,
    account: { unlockedClasses: ['ranger'], graveyard: [{cls:'ranger',level:5,kills:40,killer:'a Slime'}],
               records: { bestLevel: 7, deaths: 1, totalKills: 99, realmsEntered: 4 } },
    vault: [], character: { cls: 'ranger', level: 7, xp: 120 },
    meta: { createdAt: 1, savedAt: 2 }
  }))`);
  const mig = await page.evaluate(`SAVE.load(2)`);
  const SAVE_VERSION = await page.evaluate(`SAVE.VERSION`);   // ladder top moves as schemas land
  check('v1 save loads (not flagged corrupt)', mig.ok === true);
  check('migrated to current schema with new fields zeroed', mig.ok && mig.data.v === SAVE_VERSION &&
    mig.data.account.potions && mig.data.account.potions.att === 0 &&
    mig.data.character.potionsDrunk && mig.data.character.potionsDrunk.dex === 0 &&
    mig.data.account.records.realmsClosed === 0);
  check('migration is lossless (level/records/graveyard kept)', mig.ok &&
    mig.data.character.level === 7 && mig.data.account.records.totalKills === 99 &&
    mig.data.account.graveyard.length === 1);

  // -- 2. fresh account → realm ------------------------------------------------
  await page.evaluate(`${scene('Title')}.chooseSlot(1)`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm')`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);

  // -- 3. kill quota opens the boss portal -------------------------------------
  await page.evaluate(`(function(){
    var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'slime', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(200);
  const portal = await page.evaluate(`(function(){var r=${scene('Realm')};return {open: !!r.bossPortal, kills: r.player.state.kills};})()`);
  check('kill quota spawns the boss portal', portal.open, `kills=${portal.kills}`);

  // -- 4. entering the portal starts the boss fight + E3 scouter scan -----------
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await sleep(300);
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')};
    var texts = []; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return { boss: !!r.boss, hp: r.boss ? r.boss.boss.hp : 0, spawnerPaused: r.spawnEvent.paused,
             mobsLeft: r.mobs.countActive(true), bar: !!r.bossBar,
             scanning: r.scanning, physPaused: r.physics.world.isPaused, blob: texts.join(' | ') };})()`);
  check('boss spawned with full hp + hp bar', boss.boss && boss.hp === 1400 && boss.bar);
  check('wave director stands down, swarm cleared (E2 wipe)', boss.spawnerPaused && boss.mobsLeft === 0);
  check('E3 scouter workup sheet holds combat', boss.scanning && boss.physPaused &&
    boss.blob.indexOf('THREAT ANALYSIS') >= 0 && boss.blob.indexOf('TACTICAL READOUT') >= 0);

  // -- 5. dismiss the scan → boss fires patterns ---------------------------------
  await page.keyboard.press('Enter');
  await sleep(200);
  const scanGone = await page.evaluate(`(function(){var r=${scene('Realm')};return {scanning:r.scanning, phys:r.physics.world.isPaused};})()`);
  check('ENTER dismisses the scouter, combat resumes', !scanGone.scanning && !scanGone.phys);
  await sleep(3500);
  const shots = await page.evaluate(`${scene('Realm')}.enemyShots.countActive(true)`);
  check('boss patterns are firing', shots > 0, `${shots} bolts in flight`);

  // -- 6. boss death drops a chest (E1); SPACE opens it; loot banks + realm closes
  const beforeXp = await page.evaluate(`${scene('Realm')}.player.state.level`);
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await sleep(400);
  const chest = await page.evaluate(`(function(){var r=${scene('Realm')};
    var pots = 0; for (var k in ACCOUNT.potions) pots += ACCOUNT.potions[k];
    return { chest: !!r.chest, pending: !!r.pendingLoot, closing: r.closing, potsBefore: pots };})()`);
  check('boss drops a loot chest (no auto-award)', chest.chest && chest.pending && !chest.closing && chest.potsBefore === 0);
  // walk to the chest and press SPACE (Q6 contextual interact)
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.chest.x, r.chest.y);})()`);
  await sleep(150);
  await page.keyboard.press('Space');
  await sleep(250);
  const loot = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var texts = []; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    var pots = 0; for (var k in ACCOUNT.potions) pots += ACCOUNT.potions[k];
    return { looting: r.looting, blob: texts.join(' | '), pots: pots,
             realmsClosed: ACCOUNT.records.realmsClosed, level: r.player.state.level };
  })()`);
  check('SPACE opens the chest → loot selection overlay', loot.looting && loot.blob.indexOf('LOOT') >= 0 && loot.blob.indexOf('POTION OF') >= 0);
  check('exactly one potion banked at open', loot.pots === 1);
  check('realmsClosed incremented + close XP granted', loot.realmsClosed === 1 && loot.level > beforeXp, `level ${beforeXp}→${loot.level}`);
  const savedPots = await page.evaluate(`(function(){var d=JSON.parse(localStorage.getItem('srb_save_1')); var n=0; for (var k in d.account.potions) n+=d.account.potions[k]; return {n:n, closed:d.account.records.realmsClosed};})()`);
  check('reward persisted to disk before any screen', savedPots.n === 1 && savedPots.closed === 1);
  // take everything → REALM CLOSED screen
  await page.keyboard.press('Enter');
  await sleep(250);
  const closed = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var texts = []; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return { closing: r.closing, blob: texts.join(' | ') };
  })()`);
  check('take-all → REALM CLOSED screen', closed.closing && closed.blob.indexOf('REALM CLOSED') >= 0);

  // -- 7. back to nexus; drink the potion ---------------------------------------
  await page.keyboard.press('Enter');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  const drink = await page.evaluate(`(function(){
    var n=${scene('Nexus')};
    var stat = null; for (var k in ACCOUNT.potions) if (ACCOUNT.potions[k] > 0) stat = k;
    var before = n.player.state.stats[stat];
    n.drinkPotion(stat);
    var after = SIM.statsFor(DATA.classes[CURRENT.cls], CURRENT.level, CURRENT.potionsDrunk)[stat];
    var d = JSON.parse(localStorage.getItem('srb_save_1'));
    return { stat: stat, before: before, after: after, drunk: CURRENT.potionsDrunk[stat],
             stashLeft: ACCOUNT.potions[stat], savedDrunk: d.character.potionsDrunk[stat] };
  })()`);
  check('drinking applies +5 to the stat', drink.after === drink.before + 5, `${drink.stat} ${drink.before}→${drink.after}`);
  check('stash decremented, drink persisted', drink.stashLeft === 0 && drink.drunk === 1 && drink.savedDrunk === 1);

  // -- 8. caps respected (TM-4: "potions apply and respect caps") ----------------
  const cap = await page.evaluate(`(function(){
    var cls = DATA.classes.ranger;
    var pots = SAVE.zeroPots(); pots.att = 999;
    var st = SIM.statsFor(cls, 20, pots);
    return { capped: st.att === cls.caps.att, wasted: SIM.potionWasted(cls, 20, pots, 'att') };
  })()`);
  check('stats clamp at class caps; wasted-drink detected', cap.capped && cap.wasted);

  // -- 9. graveyard overlay -------------------------------------------------------
  await page.keyboard.press('g');
  await sleep(150);
  const gy = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var texts=[]; n.children.list.forEach(function(c){ if(c.text) texts.push(c.text); });
    return { open: !!n.gyUi, blob: texts.join(' | ') };})()`);
  check('G opens graveyard & records', gy.open && gy.blob.indexOf('GRAVEYARD & RECORDS') >= 0 && gy.blob.indexOf('closed 1') >= 0);
  await page.keyboard.press('g');
  await sleep(100);
  check('G closes it again', !(await page.evaluate(`!!${scene('Nexus')}.gyUi`)));

  // -- 10. death path still intact after M2 (permadeath loses drunk pots) ---------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.state.hp=1; Entities.hurtPlayer(r, r.player, 9999, r.time.now+600, 'The Grovekeeper');})()`);
  await sleep(400);
  const death = await page.evaluate(`(function(){
    var d = JSON.parse(localStorage.getItem('srb_save_1'));
    return { level: d.character.level, drunkAtt: (function(){var n=0; for (var k in d.character.potionsDrunk) n+=d.character.potionsDrunk[k]; return n;})(),
             deaths: d.account.records.deaths, closedKept: d.account.records.realmsClosed };
  })()`);
  check('permadeath resets character incl. drunk pots; account records survive',
    death.level === 1 && death.drunkAtt === 0 && death.deaths === 1 && death.closedKept === 1);

  // -- 11. zero console errors -----------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
