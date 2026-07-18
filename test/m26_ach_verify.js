// m26 — ACHIEVEMENTS (item 6). Device-level collection: 14 entries, predicates
// evaluate over live account/records/settings/vault, ACH.check() unlocks +
// persists, the secret stays hidden until earned, beatTheGame + Nexus arrival
// both fire a check, and the ESC-menu Achievements page renders. Fails on ANY
// console error.
const { chromium } = require('playwright');
const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) { step++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) failures++; }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  await page.goto(GAME);
  await page.waitForFunction(`typeof game!=='undefined' && typeof ACH!=='undefined' && game.scene.getScene('Nexus')`, null, { timeout: 15000 });

  // 1. list shape
  const shape = await page.evaluate(`(function(){var L=ACH.LIST;
    return { n:L.length, evals:L.every(function(a){return typeof a.eval==='function' && a.id && a.name;}),
      secret:L.some(function(a){return a.secret;}) };})()`);
  check('ACH.LIST has 14 entries, all with id/name/eval; at least one secret', shape.n === 14 && shape.evals && shape.secret, 'n=' + shape.n);

  // 2. fresh account earns nothing
  const fresh = await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ranger'));
    SAVE.settings().achievements={}; SAVE.saveSettings();
    var f=ACH.check(); return { earned:ACH.count().earned, fresh:f.length }; })()`);
  check('a brand-new account has 0 achievements', fresh.earned === 0 && fresh.fresh === 0);

  // 3. progress unlocks the right ones
  const prog = await page.evaluate(`(function(){
    ACCOUNT.cleared=['trainyard']; ACCOUNT.records.totalKills=120;
    var f=ACH.check().map(function(a){return a.id;});
    return { first:f.indexOf('first_purge')>=0, blooded:f.indexOf('blooded')>=0,
      notReaper:f.indexOf('reaper')<0, earned:ACH.count().earned }; })()`);
  check('clearing a map + 120 kills earns First Purge & Blooded (not Reaper)', prog.first && prog.blooded && prog.notReaper);

  // 4. persistence + idempotence
  const persist = await page.evaluate(`(function(){
    var before=ACH.count().earned; var again=ACH.check().length;   // second check earns nothing new
    var stored = SAVE.settings().achievements.first_purge===true;
    return { again:again, stored:stored, before:before }; })()`);
  check('achievements persist in settings + a re-check unlocks nothing new (idempotent)', persist.stored && persist.again === 0);

  // 5. beating the game earns The Assimilated; secret only via ninja empower
  const beat = await page.evaluate(`(function(){
    bindSave(1, SAVE.blank('ranger')); SAVE.settings().achievements={};
    beatTheGame('ranger');
    var assimilated = ACH.unlocked('assimilated'), shadowNo = ACH.unlocked('shadow_master');
    bindSave(2, SAVE.blank('ninja')); SAVE.settings().achievements={};
    beatTheGame('ninja');
    var shadowYes = ACH.unlocked('shadow_master');
    return { assimilated:assimilated, shadowNo:shadowNo, shadowYes:shadowYes }; })()`);
  check('beatTheGame earns The Assimilated; Shadow Master ONLY when beaten as ninja', beat.assimilated && !beat.shadowNo && beat.shadowYes);

  // 6. Nexus arrival runs a check (records earned mid-run show up in the hub)
  const hub = await page.evaluate(`(function(){
    bindSave(1, SAVE.blank('ranger')); SAVE.settings().achievements={}; SAVE.saveSettings();
    ACCOUNT.cleared=['trainyard','grove','graveyard','factory','sugar']; ACCOUNT.records.totalKills=300;
    game.scene.start('Nexus',{entry:'realm'});
    return true; })()`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 10000 });
  await page.waitForTimeout(400);
  const afterHub = await page.evaluate(`(function(){ return { sweep:ACH.unlocked('sweep5'), sugar:ACH.unlocked('sugar_rush'), reaper:ACH.unlocked('reaper') }; })()`);
  check('arriving in the Nexus evaluates achievements (Sweep + Sugar Rush earned, Reaper not)', afterHub.sweep && afterHub.sugar && !afterHub.reaper);

  // 7. the ESC-menu Achievements page renders without throwing
  const menu = await page.evaluate(`(function(){ try{
    var n=game.scene.getScene('Nexus'); var h=MENU.open(n,{title:'PAUSED'}); h.setPage('achievements'); h.setPage('root'); h.close(true);
    return { ok:true }; }catch(e){ return { ok:false, e:String(e) }; } })()`);
  check('ESC-menu Achievements page opens + navigates without error', menu.ok, menu.e || '');

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
