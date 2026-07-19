// m24 — NINJA class verify (updated 2026-07-19, Red buff pass). Confirms the
// RAPID-FIRE + longer-range shuriken and the NEW SHADOW CLONE JUTSU ult (SPACE):
// data shape, the cast spawning a clone squad in a realm, the clones firing
// homing/bleeding stars into playerShots, and the squad expiring on its timer.
// Fails on ANY console error. Points at the /tmp assembled game tree.
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
  const scene = (k) => `game.scene.getScene('${k}')`;
  const sleep = (ms) => page.waitForTimeout(ms);

  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && DATA && DATA.classes.ninja && game.scene.getScene('Nexus')`, null, { timeout: 15000 });

  // 1. class data — ability now points at SHADOW CLONE
  const d = await page.evaluate(`(function(){var n=DATA.classes.ninja,w=DATA.weapons.shuriken,a=DATA.abilities.shadowClone;
    return { tex:n.texture, weap:n.weapon, abil:n.ability, chi:n.resource&&n.resource.name==='CHI', locked:n.locked===true,
      fastest: n.base.spd >= DATA.classes.ranger.base.spd,
      wProj:w&&w.texture==='shurikenProj',
      aType:a&&a.type==='shadowClone'&&a.count>=1&&!!a.homing&&!!a.burn&&a.durationMs>0 };})()`);
  check('Ninja class: texture=ninja, weapon=shuriken, ability=shadowClone, CHI resource, locked',
    d.tex === 'ninja' && d.weap === 'shuriken' && d.abil === 'shadowClone' && d.chi && d.locked);
  check('Ninja is the fastest class; SHADOW CLONE is a timed homing/bleed summon',
    d.fastest && d.wProj && d.aType);

  // 1b. RAPID-FIRE + RANGE buff on the basic shuriken
  const buff = await page.evaluate(`(function(){var w=DATA.weapons.shuriken;
    return { baseRate:w.baseRate, dexRate:w.dexRate, lifeMs:w.lifeMs, projSpeed:w.projSpeed };})()`);
  check('Shuriken rapid-fire (baseRate 2.7 / dexRate 0.085, up from 1.9 / 0.06)',
    buff.baseRate === 2.7 && buff.dexRate === 0.085, `rate=${buff.baseRate}+dex*${buff.dexRate}`);
  check('Shuriken extended range (projSpeed 700 × lifeMs 1050 ≈ 735px, up from 432px)',
    buff.projSpeed === 700 && buff.lifeMs === 1050, `${Math.round(buff.projSpeed*buff.lifeMs/1000)}px`);

  // 2. gear ladder + remap + legendary set (unchanged)
  const g = await page.evaluate(`(function(){
    return { items:['nw0','nw1','nw2','nw3','nw4','nw5','na0','na1','na2','na3','na4','na5'].every(function(k){return !!DATA.items[k];}),
      gear:JSON.stringify(DATA.classGear.ninja), remap: SIM.resolveDrop('w3','ninja'),
      cloneAdd: DATA.items.na5.mod.count };})()`);
  check('classGear.ninja + all 12 nw*/na* items exist', g.items && g.gear.indexOf('nw5') >= 0 && g.gear.indexOf('na5') >= 0);
  check('drop remap swaps a rolled generic key to the ninja line (w3 → nw3)', g.remap === 'nw3');
  check('Oni Charm now adds +6 CLONES to the ult (count mod)', g.cloneAdd === 6);

  // 3. LOCKED by default; device flag gates the picker (unchanged)
  const lock = await page.evaluate(`(function(){
    var fresh = SAVE.blank('ranger').account.unlockedClasses;
    SAVE.settings().ninjaUnlocked = false;
    var hidden = Object.keys(DATA.classes).filter(function(k){return !DATA.classes[k].locked || !!SAVE.settings().ninjaUnlocked;});
    SAVE.settings().ninjaUnlocked = true;
    var shown = Object.keys(DATA.classes).filter(function(k){return !DATA.classes[k].locked || !!SAVE.settings().ninjaUnlocked;});
    SAVE.settings().ninjaUnlocked = false;
    return { notDefault: fresh.indexOf('ninja') < 0, hidden: hidden.indexOf('ninja') < 0, shown: shown.indexOf('ninja') >= 0 };})()`);
  check('Ninja NOT in a fresh account unlocked classes', lock.notDefault);
  check('Picker HIDES the ninja until unlocked, SHOWS it when the device flag is set', lock.hidden && lock.shown);

  // 4. beating the game unlocks + empowers + grants the set (unchanged)
  const beat = await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ninja')); beatTheGame('ninja');
    return { unlockFlag: !!SAVE.settings().ninjaUnlocked, emp: ACCOUNT.ninjaEmpowered === true,
      vault: ['nw5','na5','ar5','r5'].every(function(k){return GAME_SAVE.vault.indexOf(k)>=0;}),
      equip: CURRENT.equipment.weapon }; })()`);
  check('beatTheGame("ninja") sets the device unlock + empowerment', beat.unlockFlag && beat.emp);
  check('legendary set granted to the VAULT (not auto-equipped)', beat.vault && beat.equip === null);

  // 5. renders + plays in a realm as the ninja
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ninja')); ${scene('Nexus')}.scene.start('Realm',{mode:'clear',map:'trainyard'}); })()`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const rl = await page.evaluate(`(function(){var r=${scene('Realm')};
    // basic fire still works
    Entities.updatePlayer(r, r.player, {moveX:0,moveY:0,aimAngle:0,firing:true,ability:false}, r.time.now, 16);
    return { spriteKey: r.player.texture.key, ninjaTex: game.textures.exists('ninja64'),
      projTex: game.textures.exists('shurikenProj'), chi: r.player.state.stats.mp > 0 };})()`);
  check('Ninja renders with the Oni-King sprite + shuriken projectile texture', rl.spriteKey === 'ninja64' && rl.ninjaTex && rl.projTex);
  check('Ninja plays: fires the shuriken in a realm with a CHI pool', rl.chi);

  // 6. SHADOW CLONE JUTSU end-to-end: cast → squad spawns → clones fire homing
  //    bleed-stars into playerShots → squad expires on its timer.
  const ult = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, st=p.state;
    st.mp = st.stats.mp; st.lastAbilityAt = -1e9;              // full CHI, off cooldown
    var t = r.time.now, cost = SIM.abilityFor(DATA.abilities.shadowClone, st.equipment).mpCost;
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:false,ability:true}, t, 16);
    var spawned = r.shadowClones.length, mpAfter = st.mp;
    // give the squad a target and force them to fire this instant
    var savedBoss = r.boss;
    r.boss = { x: p.x + 70, y: p.y, active: true, id: 'testboss' };
    r.shadowClones.forEach(function(c){ c.lastFireAt = -1e9; });
    var before = r.playerShots.countActive(true);
    r.updateShadowClones(t + 25);
    var after = r.playerShots.countActive(true);
    var cs = null;
    r.playerShots.getChildren().forEach(function(s){ if (s.active && s.proj && s.proj.src === 'clone') cs = s; });
    r.boss = savedBoss;
    // expire the squad
    r.updateShadowClones(t + DATA.abilities.shadowClone.durationMs + 200);
    return { spawned: spawned, count: DATA.abilities.shadowClone.count, cost: cost, mpPaid: (st.stats.mp - mpAfter) >= cost - 0.001,
      fired: after > before, homing: !!(cs && cs.proj.homing), bleeds: !!(cs && cs.proj.burn),
      cleared: r.shadowClones.length };})()`);
  check('Casting SPACE spawns the shadow-clone squad + pays CHI', ult.spawned === ult.count && ult.mpPaid, `${ult.spawned} clones, cost ${ult.cost}`);
  check('Clones fire HOMING, BLEEDING shuriken into playerShots', ult.fired && ult.homing && ult.bleeds);
  check('The squad expires on its own timer (clones cleared)', ult.cleared === 0);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
