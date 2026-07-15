// M4 headless verification suite — the WIZARD class (user design 2026-07-13;
// special reworked same day: ARCANE BARRAGE machine gun replaced the storm orbs):
// class data integrity (frost weapon pierce+slow, barrage channel, SFX) ·
// per-class stats + caps · SAVE.blank(cls) + freshCharacter(cls) + both classes
// open · title-screen class select creates a wizard slot · Wizard sprite/staff
// in the nexus · FROST BOLT is a piercing, slowing projectile · mob SLOW status
// cuts speed · BARRAGE machine-guns straight non-piercing bolts at a fixed
// cadence, pays mpPerShot each, and goes quiet below the per-shot cost ·
// permadeath keeps the slot's class · zero console errors.
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

  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`['srb_save_1','srb_save_2','srb_save_3'].forEach(function(k){ localStorage.removeItem(k); })`);

  // -- 1. class data: wizard exists, frost weapon pierces + slows, barrage ability
  // (ARCANE BARRAGE machine gun replaced the storm orbs — user redesign 2026-07-13)
  const cd = await page.evaluate(`(function(){
    var w = DATA.classes.wizard, fr = DATA.weapons.frost, ba = DATA.abilities.barrage;
    return {
      wizard: !!w, wtex: w && w.texture, weapon: w && w.weapon, ability: w && w.ability,
      frostPierce: !!(fr && fr.pierce), frostSlow: !!(fr && fr.slow && fr.slow.mult < 1),
      frostTex: fr && fr.texture, frostHeld: fr && fr.heldTexture,
      baType: ba && ba.type, baCost: ba && ba.mpPerShot, baRate: ba && ba.fireEveryMs, baDmg: ba && ba.dmg,
      baStrike: !!(ba && ba.strike && ba.strike.chance > 0 && ba.strike.dmg > 0 && ba.strike.radius > 0),
      staffUpright: !!(fr && fr.upright),
      frostSfx: !!DATA.audio.sounds.frost, zapSfx: !!DATA.audio.sounds.zap, thunderSfx: !!DATA.audio.sounds.thunder
    };})()`);
  check('Wizard class defined (texture, weapon=frost, ability=barrage)',
    cd.wizard && cd.wtex === 'wizard' && cd.weapon === 'frost' && cd.ability === 'barrage');
  check('Frost weapon pierces + slows, frostbolt/staff art, staff carried upright',
    cd.frostPierce && cd.frostSlow && cd.frostTex === 'frostbolt' && cd.frostHeld === 'staff' && cd.staffUpright);
  check('Barrage is data-driven (mpPerShot/fireEveryMs/dmg) with a LIGHTNING-STRIKE proc + zap/thunder SFX',
    cd.baType === 'barrage' && cd.baCost > 0 && cd.baRate > 0 && cd.baDmg > 0 && cd.baStrike &&
    cd.frostSfx && cd.zapSfx && cd.thunderSfx);

  // -- 2. per-class stats differ; wizard has the deeper MP pool + distinct caps
  const stat = await page.evaluate(`(function(){
    var r = SIM.statsFor(DATA.classes.ranger, 1), w = SIM.statsFor(DATA.classes.wizard, 1);
    return { rmp: r.mp, wmp: w.mp, rhp: r.hp, whp: w.hp,
             rCapMp: DATA.classes.ranger.caps.mp, wCapMp: DATA.classes.wizard.caps.mp };})()`);
  check('Wizard is a distinct build (more MP, less HP than the Ranger)',
    stat.wmp > stat.rmp && stat.whp < stat.rhp && stat.wCapMp > stat.rCapMp,
    `wiz mp ${stat.wmp}/${stat.wCapMp} hp ${stat.whp} vs ranger mp ${stat.rmp} hp ${stat.rhp}`);

  // -- 3. all textures generated at boot
  const tex = await page.evaluate(`(function(){
    return ['wizard','staff','frostbolt','zapball'].map(function(k){ return game.textures.exists(k); });})()`);
  check('Wizard textures generated (wizard, staff, frostbolt, zapball)', tex.every(Boolean));

  // -- 4. SAVE.blank(cls): both classes open; a bogus class falls back to ranger
  const blank = await page.evaluate(`(function(){
    var w = SAVE.blank('wizard'), r = SAVE.blank('ranger'), bad = SAVE.blank('nonsense');
    return { wcls: w.character.cls, rcls: r.character.cls, badcls: bad.character.cls,
             unlocked: w.account.unlockedClasses,
             fresh: (typeof freshCharacter === 'function') ? freshCharacter('wizard').cls : null,
             freshBad: (typeof freshCharacter === 'function') ? freshCharacter('nope').cls : null };})()`);
  check('SAVE.blank(cls) seeds the chosen class; bad class → ranger; both classes unlocked',
    blank.wcls === 'wizard' && blank.rcls === 'ranger' && blank.badcls === 'ranger' &&
    blank.unlocked.indexOf('wizard') >= 0 && blank.unlocked.indexOf('ranger') >= 0);
  check('freshCharacter(cls) keeps the class on permadeath; bad class → ranger',
    blank.fresh === 'wizard' && blank.freshBad === 'ranger');

  // -- 5. title-screen class select: createNewGame(1,'wizard') writes a wizard slot
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'wizard')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 6000 });
  const nex = await page.evaluate(`(function(){
    var n = ${scene('Nexus')}, saved = JSON.parse(localStorage.getItem('srb_save_1'));
    return { savedCls: saved.character.cls, cur: CURRENT.cls,
             sprite: n.player.texture.key, held: n.player.held && n.player.held.texture.key };})()`);
  check('New-game class select creates a Wizard slot (save + CURRENT)',
    nex.savedCls === 'wizard' && nex.cur === 'wizard');
  check('Wizard is drawn with the hi-fi Starweaver sprite + star staff in the nexus',   // 2026-07-14: hi-fi is the default look
    nex.sprite === 'wizard64' && nex.held === 'staff64');

  // -- enter a realm as the wizard (M3b portal pattern) --------------------------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);

  // -- 6. the FROST BOLT: a firing wizard makes a piercing, slowing frostbolt ----
  const frostShot = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player;
    p.state.lastShotAt = 0;
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:true,ability:false}, r.time.now, 16);
    var shot = null; r.playerShots.children.iterate(function(s){ if (s && s.active) shot = s; });
    return shot ? { tex: shot.texture.key, pierce: !!shot.proj.pierce, slow: !!shot.proj.slow } : { none: true };})()`);
  check('Wizard basic fire emits a piercing frostbolt carrying a slow rider',
    frostShot.tex === 'frostbolt' && frostShot.pierce === true && frostShot.slow === true);

  // -- 7. mob SLOW status: a slowed mob crawls (updateMob applies spd × mult) -----
  const slow = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, now = r.time.now;
    var ctrl = Entities.spawnMob(r, 'slime', r.player.x + 200, r.player.y - 40);
    var slowed = Entities.spawnMob(r, 'slime', r.player.x + 200, r.player.y + 40);
    Entities.applySlow(slowed, DATA.weapons.frost.slow, now);
    Entities.updateMob(r, ctrl, r.player, now);
    Entities.updateMob(r, slowed, r.player, now);
    var mag = function(m){ return Math.hypot(m.body.velocity.x, m.body.velocity.y); };
    return { ctrl: mag(ctrl), slowed: mag(slowed), until: slowed.mob.slowUntil > now };})()`);
  check('Frost slow set + updateMob moves a slowed mob slower than an un-slowed one',
    slow.until && slow.slowed < slow.ctrl - 1, `slowed ${slow.slowed.toFixed(0)} < ctrl ${slow.ctrl.toFixed(0)}`);

  // -- 8. ARCANE BARRAGE: holding the ability machine-guns straight-line bolts ---
  const gun = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, ab = DATA.abilities.barrage;
    p.state.mp = 100; p.state.lastBarrageAt = 0;
    var mp0 = p.state.mp, before = r.playerShots.countActive(true);
    // 3 held frames spaced past the cadence → 3 bolts
    var t0 = r.time.now;
    for (var i = 0; i < 3; i++) {
      Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0.5,firing:false,ability:true}, t0 + i * (ab.fireEveryMs + 5), 0);   // dt 0 → no MP regen noise
    }
    var bolts = [];
    r.playerShots.children.iterate(function(s){ if (s && s.active) bolts.push({ tex: s.texture.key, rot: s.rotation, pierce: s.proj.pierce, strike: !!(s.proj.strike && s.proj.strike.chance > 0) }); });
    var newBolts = bolts.filter(function(b){ return b.tex === 'zapball'; });
    return { fired: r.playerShots.countActive(true) - before, n: newBolts.length,
             straight: newBolts.every(function(b){ return Math.abs(b.rot - 0.5) < 0.001; }),
             noPierce: newBolts.every(function(b){ return !b.pierce; }),
             procRider: newBolts.every(function(b){ return b.strike; }),
             drained: p.state.mp, want: mp0 - 3 * ab.mpPerShot };})()`);
  check('Held barrage machine-guns LIGHTNING BALLS at the fireEveryMs cadence (3 frames → 3 balls)',
    gun.fired === 3 && gun.n === 3, `${gun.fired} fired`);
  check('Lightning balls fly DEAD STRAIGHT down the aim line, no pierce, each carrying the strike-proc rider',
    gun.straight && gun.noPierce && gun.procRider);
  check('Each ball costs mpPerShot (MP drained exactly per round)',
    Math.abs(gun.drained - gun.want) < 0.01, `mp ${gun.drained} vs want ${gun.want}`);

  // -- 10a. the LIGHTNING-BOLT proc: a summoned strike is real area damage --------
  const strike = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, sp = DATA.abilities.barrage.strike;
    var x = r.player.x - 400, y = r.player.y - 400;
    var a = Entities.spawnMob(r, 'brute', x, y);
    var b = Entities.spawnMob(r, 'brute', x + 26, y + 18);       // inside radius
    var far = Entities.spawnMob(r, 'brute', x + 420, y);         // outside radius
    [a, b, far].forEach(function(m){ m.mob.affix = null; m.mob.evolved = true; m.mob.hp = DATA.mobs.brute.hp; });
    var ha = a.mob.hp, hb = b.mob.hp, hf = far.mob.hp;
    r.lightningStrike(x, y, sp);
    return { aHit: a.mob.hp < ha, bHit: b.mob.hp < hb, farUntouched: far.mob.hp === hf };})()`);
  check('Summoned lightning bolt damages everything in its radius, spares mobs outside it',
    strike.aHit && strike.bHit && strike.farUntouched);

  // -- 10b. the gun goes quiet when MP cannot cover the next round ----------------
  const dry = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, ab = DATA.abilities.barrage;
    p.state.mp = ab.mpPerShot - 0.1; p.state.lastBarrageAt = 0;
    var before = r.playerShots.countActive(true);
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:false,ability:true}, r.time.now + 5000, 0);
    return { fired: r.playerShots.countActive(true) - before, mp: p.state.mp };})()`);
  check('Barrage refuses to fire when MP is below the per-shot cost',
    dry.fired === 0 && dry.mp > 0);

  // -- 11. permadeath keeps the slot's class (a Wizard slot stays a Wizard) -------
  const perma = await page.evaluate(`(function(){
    var r = ${scene('Realm')};
    r.player.state.cls = 'wizard';           // ensure
    r.onDeath('the void');
    return { cls: CURRENT.cls, saved: JSON.parse(localStorage.getItem('srb_save_1')).character.cls };})()`);
  check('Permadeath spawns a fresh character of the SAME class (wizard→wizard)',
    perma.cls === 'wizard' && perma.saved === 'wizard');

  // -- 12. zero console errors across the whole run ------------------------------
  check('no console errors during the run', consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(' | '));

  console.log(`\n${failures === 0 ? 'ALL GREEN' : failures + ' FAILED'} — ${step} checks`);
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
