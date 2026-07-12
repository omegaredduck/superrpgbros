// M1 headless verification suite (TESTING.md TM-1/TM-4-adjacent + M1 features).
// Runs the real game in headless Chromium, drives scenes, asserts state,
// and fails on ANY console error.
const { chromium } = require('playwright');

const GAME = 'file://' + require('path').resolve(__dirname, '../game/index.html').replace(/\\/g,'/') + '';
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

  const scene = (key) => `game.scene.getScene('${key}')`;
  const active = (key) => page.evaluate(`game.scene.isActive('${key}')`);
  const sleep = (ms) => page.waitForTimeout(ms);

  // -- 1. boot → title --------------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  check('boots to Title scene', true);

  // -- 2. new game in slot 1 → nexus -----------------------------------------
  await page.evaluate(`${scene('Title')}.chooseSlot(1)`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  const save1 = await page.evaluate(`JSON.parse(localStorage.getItem('srb_save_1'))`);
  const CURV = await page.evaluate(`SAVE.VERSION`);
  check('new game → Nexus, current-version save written', save1 && save1.v === CURV && save1.character.level === 1);

  // -- 3. settings exist with defaults ----------------------------------------
  const s0 = await page.evaluate(`SAVE.settings()`);
  check('settings defaults (volume 0.5, autoFire true)', s0.volume === 0.5 && s0.autoFire === true);

  // -- 4. enter realm via portal overlap --------------------------------------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm')`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  check('portal → Realm', true);
  await sleep(2500);
  const mobs = await page.evaluate(`${scene('Realm')}.mobs.countActive(true)`);
  check('wave director spawns mobs', mobs > 0, `${mobs} alive`);

  // -- 5. pause: ESC freezes the realm ----------------------------------------
  await page.keyboard.press('Escape');
  await sleep(120);
  const p1 = await page.evaluate(`(function(){var r=${scene('Realm')};return {paused:r.paused, phys:r.physics.world.isPaused, spawn:r.spawnEvent.paused};})()`);
  check('ESC pauses (flag, physics, spawner)', p1.paused && p1.phys && p1.spawn);

  // realm clock should not advance while paused
  const t1 = await page.evaluate(`(function(){var r=${scene('Realm')};return r.time.now - r.startedAt;})()`);
  await sleep(700);

  // -- 6. volume control while paused -----------------------------------------
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await sleep(80);
  const vol = await page.evaluate(`SAVE.settings().volume`);
  const volStored = await page.evaluate(`JSON.parse(localStorage.getItem('srb_settings')).volume`);
  check('LEFT lowers volume + persists', Math.abs(vol - 0.3) < 1e-9 && Math.abs(volStored - 0.3) < 1e-9, `now ${vol}`);

  // -- 7. resume: clock excluded pause time ------------------------------------
  await page.keyboard.press('Escape');
  await sleep(150);
  const p2 = await page.evaluate(`(function(){var r=${scene('Realm')};return {paused:r.paused, phys:r.physics.world.isPaused, dt:(r.time.now - r.startedAt)};})()`);
  check('ESC resumes', !p2.paused && !p2.phys);
  check('realm clock ignored paused time', p2.dt - t1 < 600, `clock advanced ${Math.round(p2.dt - t1)}ms across ~850ms pause`);

  // -- 8. auto-fire toggle persists (T) ----------------------------------------
  await page.keyboard.press('t');
  await sleep(80);
  const af = await page.evaluate(`(function(){var r=${scene('Realm')};return {scene:r.autoFire, saved:JSON.parse(localStorage.getItem('srb_settings')).autoFire};})()`);
  check('T toggles auto-fire + persists', af.scene === false && af.saved === false);

  // -- 9. Q from pause → saves + returns to nexus ------------------------------
  await page.keyboard.press('Escape');
  await sleep(100);
  await page.keyboard.press('q');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  check('pause → Q returns to Nexus', true);

  // -- 10. re-enter realm: auto-fire stayed OFF (TM-1) --------------------------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(300);
  const af2 = await page.evaluate(`${scene('Realm')}.autoFire`);
  check('auto-fire persisted across realm re-entry', af2 === false);

  // -- 11. hitstop fires on player shot impact ---------------------------------
  await page.evaluate(`(function(){
    var r=${scene('Realm')};
    // spawn a brute right of the player and shoot it point-blank
    var m = Entities.spawnMob(r, 'brute', r.player.x + 40, r.player.y);
    Entities.fireProjectile(r, r.playerShots, r.player.x + 20, r.player.y, 0, 600, 5, 500, 'arrow', false);
  })()`);
  await sleep(120);
  const hs = await page.evaluate(`${scene('Realm')}.hitstopReadyAt`);
  check('hitstop triggered by shot impact', hs > 0, `hitstopReadyAt=${Math.round(hs)}`);
  await sleep(200);
  const hsOver = await page.evaluate(`(function(){var r=${scene('Realm')};return !r.hitstopActive && !r.physics.world.isPaused;})()`);
  check('hitstop releases physics', hsOver);

  // -- 12. death: recap shows cause/time/kills; permadeath in save --------------
  await page.evaluate(`(function(){
    var r=${scene('Realm')};
    r.player.state.kills = 7;
    r.player.state.hp = 1;
    Entities.hurtPlayer(r, r.player, 9999, r.time.now + 600, "a Warlock's bolt");
  })()`);
  await sleep(400);
  const dead = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var texts = [];
    r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return { alive: r.player.state.alive, blob: texts.join(' | ') };
  })()`);
  check('player died', dead.alive === false);
  check('recap shows cause of death', dead.blob.indexOf("slain by a Warlock's bolt") >= 0);
  check('recap shows kills + time survived', dead.blob.indexOf('kills 7') >= 0 && dead.blob.indexOf('survived') >= 0);
  check('recap shows account records', dead.blob.indexOf('THE ACCOUNT') >= 0 && dead.blob.indexOf('graveyard 1') >= 0);
  const save2 = await page.evaluate(`JSON.parse(localStorage.getItem('srb_save_1'))`);
  check('permadeath written to save at death', save2.character.level === 1 && save2.account.records.deaths === 1 && save2.account.graveyard.length === 1,
    `level=${save2.character.level} deaths=${save2.account.records.deaths} graveyard=${save2.account.graveyard.length}`);
  check("graveyard entry has the killer", save2.account.graveyard[0].killer === "a Warlock's bolt" && save2.account.graveyard[0].kills === 7);

  // -- 13. ENTER returns to nexus ----------------------------------------------
  await page.keyboard.press('Enter');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  check('recap → ENTER → Nexus (fresh ranger)', true);

  // -- 14. sim stays headless-clean (seam rule 6) -------------------------------
  const { execSync } = require('child_process');
  const path = require('path');
  const dataPath = path.resolve(__dirname, '../game/js/data.js').replace(/\\/g, '/');
  const simPath = path.resolve(__dirname, '../game/js/sim.js').replace(/\\/g, '/');
  let simOk = true;
  try {
    execSync(`node -e "global.DATA=(function(){var s=require('fs').readFileSync('${dataPath}','utf8');eval(s);return DATA;})(); var SIM=require('${simPath}'); if(SIM.damage(14,12,0)!==Math.floor(14*(1+12/50))) throw new Error('damage'); var r=SIM.applyXp(1,0,100); if(r.level<2) throw new Error('xp');"`);
  } catch (e) { simOk = false; }
  check('sim.js runs in Node untouched (TM-2 spot check)', simOk);

  // -- 15. zero console errors ---------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
