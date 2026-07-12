// M2.1 headless verification suite — the 2026-07-12 scope patch (TESTING.md TM-7):
// E8 bow aim alignment · E9 mob affix engine · E7 biome rosters · E5 portal
// plaza · E4 orb HUD · Q6 contextual SPACE · E6 time-trial survival mode.
// Fails on ANY console error.
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

  // -- 1. boot → new game → nexus: E5 portal plaza --------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`${scene('Title')}.chooseSlot(1)`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  const plaza = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var texts=[]; n.children.list.forEach(function(c){ if(c.text) texts.push(c.text); });
    return { portals: n.plazaPortals.length, canonical: !!n.portal,
             spot: !!n.portalSpot, ring: n.ringLights.length, console: !!n.consolePos,
             modes: DATA.console.modes.slice(),
             blob: texts.join(' | ') };})()`);
  // M3.5 PORTAL WORKS: the nexus boots DORMANT — one platform, no portal until
  // the console powers it; future realms are sealed rows inside the console UI
  check('E5/M3.5 works boot DORMANT: no portals until the console powers the platform',
    plaza.portals === 0 && !plaza.canonical);
  check('E5/M3.5 one platform (8 ring lights) + console; clear + survival spawnable',
    plaza.spot && plaza.ring === 8 && plaza.console &&
    plaza.modes.indexOf('clear') >= 0 && plaza.modes.indexOf('survival') >= 0 &&
    plaza.blob.indexOf('PORTAL WORKS') >= 0 && plaza.blob.indexOf('REALM CONSOLE') >= 0);

  // -- 2. enter the clear realm ----------------------------------------------------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(300);
  const mode = await page.evaluate(`${scene('Realm')}.mode`);
  check('clear portal starts a clear-mode realm', mode === 'clear');

  // -- 3. E8: bow aligns to the aim direction ---------------------------------------
  const bow = await page.evaluate(`(function(){
    var r=${scene('Realm')}, p=r.player, out={};
    var iL = SIM.makeIntent(); iL.aimAngle = Math.PI;            // aim LEFT
    Entities.updatePlayer(r, p, iL, r.time.now, 16);
    out.left = { flipX: p.flipX, bowLeft: p.held.x < p.x, rot: p.held.rotation };
    var iR = SIM.makeIntent(); iR.aimAngle = 0;                  // aim RIGHT
    Entities.updatePlayer(r, p, iR, r.time.now, 16);
    out.right = { flipX: p.flipX, bowRight: p.held.x > p.x, rot: p.held.rotation };
    var iD = SIM.makeIntent(); iD.aimAngle = Math.PI / 2;        // aim DOWN
    Entities.updatePlayer(r, p, iD, r.time.now, 16);
    out.down = { bowBelow: p.held.y > p.y };
    return out;
  })()`);
  check('E8 aim left: body faces left, bow sits left, rotated ~180°',
    bow.left.flipX === true && bow.left.bowLeft && Math.abs(Math.abs(bow.left.rot) - Math.PI) < 0.01);
  check('E8 aim right: body faces right, bow sits right, rotation 0',
    bow.right.flipX === false && bow.right.bowRight && Math.abs(bow.right.rot) < 0.01);
  check('E8 aim down: bow tracks below the player', bow.down.bowBelow);

  // -- 4. E9: affix engine — forced champion roll ------------------------------------
  const affix = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var was = DATA.affixes.mobRollChance;
    DATA.affixes.mobRollChance = 1;                              // force a champion
    var m = Entities.spawnMob(r, 'slime', r.player.x + 500, r.player.y + 500);
    DATA.affixes.mobRollChance = 0;                              // determinism for the rest
    var def = DATA.mobs.slime;
    return { name: m.mob.affix ? m.mob.affix.name : null,
             hpUp: m.mob.hp > def.hp, xpUp: m.mob.xp > def.xp,
             spdChanged: m.mob.spd !== def.spd, tinted: m.tintTopLeft !== 0xffffff,
             m3Leak: !!(m.mob.affix && m.mob.affix.m3), was: was };
  })()`);
  check('E9 forced roll produces a live champion (Tanky/Speedy only)',
    (affix.name === 'TANKY' || affix.name === 'SPEEDY') && !affix.m3Leak, affix.name);
  check('E9 affix multipliers applied (hp/xp/spd, tinted)', affix.hpUp && affix.xpUp && affix.spdChanged && affix.tinted);

  // -- 5. E7: the director spawns from the BIOME roster -------------------------------
  const biome = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var was = DATA.biomes.grasslands.mobs, was2 = r.startedAt;
    DATA.biomes.grasslands.mobs = ['spitter'];                   // pin the roster
    r.startedAt = r.time.now - 30000;                            // realm age 30s → spitter unlocked
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.directorSpend();
    var keys = {};
    r.mobs.children.iterate(function(m){ if (m && m.active) keys[m.mob.key] = true; });
    DATA.biomes.grasslands.mobs = was; r.startedAt = was2;
    return Object.keys(keys);
  })()`);
  check('E7 director pool == biome roster', biome.length === 1 && biome[0] === 'spitter', biome.join(','));

  // -- 6. Q6: SPACE with nothing in range still fires the ability ---------------------
  const mpBefore = await page.evaluate(`${scene('Realm')}.player.state.mp`);
  await page.keyboard.down('Space');
  await sleep(150);
  await page.keyboard.up('Space');
  const mpAfter = await page.evaluate(`${scene('Realm')}.player.state.mp`);
  check('Q6 SPACE out of range = ability (MP spent)', mpAfter < mpBefore, `mp ${mpBefore}→${Math.round(mpAfter)}`);

  // -- 7. E4: orb HUD present, old bars retired ----------------------------------------
  const hud = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { orbs: !!r.hudG, hpNum: r.hpOrbText.text.length > 0, oldBars: !!r.hpBar };})()`);
  check('E4 orb HUD drawn (graphics + hp readout), old bars gone', hud.orbs && hud.hpNum && !hud.oldBars);

  // -- 8. back to nexus, then E6: the time-trial survival portal ------------------------
  await page.keyboard.press('Escape');
  await sleep(120);
  await page.keyboard.press('q');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.consoleSetMode('survival'); n.consoleSpawnPortal(true);   // M3.5: console spawns it
    var p = n.plazaPortals.filter(function(e){return e.mode==='survival';})[0].sprite;
    n.player.setPosition(p.x, p.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.mode === 'survival'`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(200);
  const surv = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.modeDef.durationSec = 1;                                   // fast-forward the trial (Q8 knob)
    return { mode: r.mode, hud: r.hudText.text };})()`);
  check('E6 survival realm entered, HUD shows the countdown objective', surv.mode === 'survival' && surv.hud.indexOf('SURVIVE') >= 0);

  // -- 9. the horn: swarm annihilated, chest drops, SPACE loots, trial closes ------------
  await sleep(1400);
  const horn = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { chest: !!r.chest, pending: !!r.pendingLoot, spawnerPaused: r.spawnEvent.paused,
             mobs: r.mobs.countActive(true) };})()`);
  check('E6 trial complete → E2-style wipe + reward chest', horn.chest && horn.pending && horn.spawnerPaused && horn.mobs === 0);
  const potsBefore = await page.evaluate(`(function(){var n=0; for (var k in ACCOUNT.potions) n+=ACCOUNT.potions[k]; return n;})()`);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.chest.x, r.chest.y);})()`);
  await sleep(150);
  await page.keyboard.press('Space');
  await sleep(250);
  const trialLoot = await page.evaluate(`(function(){
    var r=${scene('Realm')};
    var pots=0; for (var k in ACCOUNT.potions) pots+=ACCOUNT.potions[k];
    var d=JSON.parse(localStorage.getItem('srb_save_1'));
    var saved=0; for (var k2 in d.account.potions) saved+=d.account.potions[k2];
    return { looting: r.looting, pots: pots, saved: saved };
  })()`);
  check('E6 chest banks the trial potion + persists before any screen',
    trialLoot.looting && trialLoot.pots === potsBefore + 1 && trialLoot.saved === trialLoot.pots);
  await page.keyboard.press('Enter');
  await sleep(250);
  const trialClosed = await page.evaluate(`(function(){var r=${scene('Realm')};
    var texts=[]; r.children.list.forEach(function(c){ if(c.text) texts.push(c.text); });
    return { closing: r.closing, blob: texts.join(' | ') };})()`);
  check('E6 take-all → TRIAL COMPLETE screen', trialClosed.closing && trialClosed.blob.indexOf('TRIAL COMPLETE') >= 0);
  await page.keyboard.press('Enter');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  check('trial → Nexus, account moved forward', true);

  // -- 10. E3 data: every boss carries scouter hints -------------------------------------
  const hints = await page.evaluate(`(function(){
    for (var k in DATA.bosses) { var b = DATA.bosses[k]; if (!b.hints || !b.hints.length) return k; }
    return 'ok';})()`);
  check('E3 every boss defines tactical hints', hints === 'ok', hints);

  // -- 11. zero console errors -------------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
