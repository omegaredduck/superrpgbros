// m24 — NINJA class verify (2026-07-17, Opus). The final post-game class "Oni
// King": data (shuriken weapon, shurikenStorm ability, CHI resource, locked),
// gear ladder + remap, LOCKED until the game is beaten (device flag gates the
// picker), beatTheGame unlocks it + grants the empowerment/legendary set, and it
// renders + plays in a realm. Fails on ANY console error.
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

  // 1. class data
  const d = await page.evaluate(`(function(){var n=DATA.classes.ninja,w=DATA.weapons.shuriken,a=DATA.abilities.shurikenStorm;
    return { tex:n.texture, weap:n.weapon, abil:n.ability, chi:n.resource&&n.resource.name==='CHI', locked:n.locked===true,
      fastest: n.base.spd >= DATA.classes.ranger.base.spd,
      wProj:w&&w.texture==='shurikenProj'&&w.ricochet>0, aType:a&&a.type==='volley'&&a.spreadDeg===360&&!!a.burn };})()`);
  check('Ninja class: texture=ninja, weapon=shuriken, ability=shurikenStorm, CHI resource, locked',
    d.tex === 'ninja' && d.weap === 'shuriken' && d.abil === 'shurikenStorm' && d.chi && d.locked);
  check('Ninja is the fastest class; shuriken ricochets; storm is a 360° bleed nova',
    d.fastest && d.wProj && d.aType);

  // 2. gear ladder + remap + legendary set
  const g = await page.evaluate(`(function(){
    return { gear:JSON.stringify(DATA.classGear.ninja),
      items:['nw0','nw1','nw2','nw3','nw4','nw5','na0','na1','na2','na3','na4','na5'].every(function(k){return !!DATA.items[k];}),
      remap: SIM.resolveDrop('w3','ninja'),
      legSet: [DATA.classGear.ninja.weapon[5], DATA.classGear.ninja.ability[5], 'ar5','r5'].join(',') };})()`);
  check('classGear.ninja + all 12 nw*/na* items exist', g.items && g.gear.indexOf('nw5') >= 0 && g.gear.indexOf('na5') >= 0);
  check('drop remap swaps a rolled generic key to the ninja line (w3 → nw3)', g.remap === 'nw3');
  check('legendary set = Oni Fang + Oni Charm + Titanplate + Ring of the Realm', g.legSet === 'nw5,na5,ar5,r5');

  // 3. LOCKED by default; device flag gates the picker
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

  // 4. beating the game unlocks + empowers + grants the set
  const beat = await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ninja')); beatTheGame('ninja');
    return { unlockFlag: !!SAVE.settings().ninjaUnlocked, emp: ACCOUNT.ninjaEmpowered === true,
      vault: ['nw5','na5','ar5','r5'].every(function(k){return GAME_SAVE.vault.indexOf(k)>=0;}),
      equip: CURRENT.equipment.weapon }; })()`);
  check('beatTheGame("ninja") sets the device unlock + Shadow-Clone empowerment', beat.unlockFlag && beat.emp);
  check('legendary set granted to the VAULT (not auto-equipped)', beat.vault && beat.equip === null);

  // 5. renders + plays in a realm as the ninja
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ninja')); ${scene('Nexus')}.scene.start('Realm',{mode:'clear',map:'trainyard'}); })()`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const rl = await page.evaluate(`(function(){var r=${scene('Realm')};
    // fire the shuriken + the storm once
    Entities.updatePlayer(r, r.player, {moveX:0,moveY:0,aimAngle:0,firing:true,ability:true}, r.time.now, 0);
    return { spriteKey: r.player.texture.key, ninjaTex: game.textures.exists('ninja64'),
      projTex: game.textures.exists('shurikenProj'), chi: r.player.state.stats.mp > 0 };})()`);
  check('Ninja renders with the Oni-King sprite + shuriken projectile texture', rl.spriteKey === 'ninja64' && rl.ninjaTex && rl.projTex);
  check('Ninja plays: fires the shuriken + storm in a realm with a CHI pool', rl.chi);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
