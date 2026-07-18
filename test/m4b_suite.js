// M4b headless verification suite — the KNIGHT class (user design 2026-07-13):
// class data (sword melee weapon, whirlwind channel ability + tornado proc, SFX,
// accent) · tanky per-class stats + distinct caps · art generated · SAVE.blank/
// freshCharacter + all three classes open · title-screen select creates a knight
// slot (sprite + sword) · MELEE CLEAVE hits the frontal arc only (spares behind /
// out-of-range) and fires NO projectile · WHIRLWIND is a held channel that drains
// MP + ticks AoE damage + sets st.whirling, and stops on release · TORNADO proc
// spawns + grinds mobs it overlaps · permadeath keeps the slot's class · the
// class picker is 3-wide, data-driven · zero console errors.
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

  // -- 1. class data: knight exists, sword is melee, whirlwind + tornado config,
  //       and the BERSERKER REWORK (2026-07-13): RAGE resource (starts empty, no
  //       passive regen, built by cleave hits), lifesteal whirlwind.
  const cd = await page.evaluate(`(function(){
    var k = DATA.classes.knight, sw = DATA.weapons.sword, ww = DATA.abilities.whirlwind;
    return {
      knight: !!k, ktex: k && k.texture, weapon: k && k.weapon, ability: k && k.ability, accent: k && k.accent != null,
      melee: !!(sw && sw.melee), swRange: sw && sw.range, swArc: sw && sw.arcDeg, swHeld: sw && sw.heldTexture,
      wwType: ww && ww.type, wwDrain: ww && ww.mpDrainPerSec, wwTick: ww && ww.tickMs, wwRadius: ww && ww.radius,
      torn: !!(ww && ww.tornado && ww.tornado.chance > 0 && ww.tornado.dmg > 0),
      rage: k && k.resource && k.resource.name === 'RAGE' && k.resource.startsEmpty === true,
      noRegen: k && k.mpRegenPerSec === 0, rageGain: sw && sw.rageGain > 0, lifesteal: ww && ww.hpPerHit > 0,
      slashSfx: !!DATA.audio.sounds.slash, whirlSfx: !!DATA.audio.sounds.whirl };})()`);
  check('Knight class defined (texture, weapon=sword, ability=whirlwind, accent)',
    cd.knight && cd.ktex === 'knight' && cd.weapon === 'sword' && cd.ability === 'whirlwind' && cd.accent);
  check('Sword is a MELEE weapon with a reach + arc + held sword art',
    cd.melee === true && cd.swRange > 0 && cd.swArc > 0 && cd.swHeld === 'sword');
  check('Whirlwind is a channel (type/drain/tick/radius) with a tornado proc + slash/whirl SFX',
    cd.wwType === 'whirlwind' && cd.wwDrain > 0 && cd.wwTick > 0 && cd.wwRadius > 0 &&
    cd.torn && cd.slashSfx && cd.whirlSfx);
  check('BERSERKER: RAGE resource (starts empty, zero passive regen), cleave rageGain, whirlwind lifesteal',
    cd.rage && cd.noRegen && cd.rageGain && cd.lifesteal);

  // -- 2. tanky per-class stats: most HP + DEF, less MP, slowest of the three
  const stat = await page.evaluate(`(function(){
    var r = SIM.statsFor(DATA.classes.ranger, 1), w = SIM.statsFor(DATA.classes.wizard, 1), k = SIM.statsFor(DATA.classes.knight, 1);
    var C = DATA.classes;
    return { khp: k.hp, rhp: r.hp, whp: w.hp, kdef: C.knight.base.def, rdef: C.ranger.base.def,
             kspd: k.spd, rspd: r.spd, wspd: w.spd, kmp: k.mp, rmp: r.mp,
             kCapHp: C.knight.caps.hp, rCapHp: C.ranger.caps.hp, kCapDef: C.knight.caps.def, rCapDef: C.ranger.caps.def };})()`);
  check('Knight is the tanky build (most HP + DEF, less MP, slowest of the three)',
    stat.khp > stat.rhp && stat.khp > stat.whp && stat.kdef > stat.rdef &&
    stat.kmp < stat.rmp && stat.kspd < stat.rspd && stat.kspd < stat.wspd,
    `hp ${stat.khp} def ${stat.kdef} spd ${stat.kspd} mp ${stat.kmp}`);
  check('Knight caps are distinct — the highest HP + DEF ceilings',
    stat.kCapHp > stat.rCapHp && stat.kCapDef > stat.rCapDef,
    `hp cap ${stat.kCapHp}/${stat.rCapHp} · def cap ${stat.kCapDef}/${stat.rCapDef}`);

  // -- 3. all Knight textures generated at boot
  const tex = await page.evaluate(`(function(){
    return ['knight','sword','slash','whirl','tornado'].map(function(k){ return game.textures.exists(k); });})()`);
  check('Knight textures generated (knight, sword, slash, whirl, tornado)', tex.every(Boolean));

  // -- 4. SAVE.blank / freshCharacter: all three classes open, knight keeps
  const blank = await page.evaluate(`(function(){
    var k = SAVE.blank('knight');
    return { kcls: k.character.cls, unlocked: k.account.unlockedClasses,
             fresh: freshCharacter('knight').cls, n: Object.keys(DATA.classes).length };})()`);
  check('SAVE.blank("knight") seeds a knight; base classes unlocked (ninja locked until beat)',
    blank.kcls === 'knight' && blank.n === 4 &&
    ['ranger','wizard','knight'].every(c => blank.unlocked.indexOf(c) >= 0) &&
    blank.unlocked.indexOf('ninja') < 0);
  check('freshCharacter("knight") keeps the class on permadeath', blank.fresh === 'knight');

  // -- 5. title-screen class select: createNewGame(1,'knight') → knight slot ------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'knight')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 6000 });
  const nex = await page.evaluate(`(function(){
    var n = ${scene('Nexus')}, saved = JSON.parse(localStorage.getItem('srb_save_1'));
    return { savedCls: saved.character.cls, cur: CURRENT.cls,
             sprite: n.player.texture.key, held: n.player.held && n.player.held.texture.key };})()`);
  check('New-game class select creates a Knight slot (save + CURRENT)',
    nex.savedCls === 'knight' && nex.cur === 'knight');
  check('Knight is drawn with the hi-fi Dark Knight sprite + greatsword in the nexus',   // 2026-07-14: hi-fi is the default look
    nex.sprite === 'knight64' && nex.held === 'sword64');

  // -- enter a realm as the knight (m4 portal pattern) ---------------------------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);

  // -- 5b. BERSERKER: rage STARTS EMPTY on realm entry ----------------------------
  const rage0 = await page.evaluate(`(function(){
    var p = ${scene('Realm')}.player;
    return { mp: p.state.mp, cap: p.state.stats.mp };})()`);
  check('Rage starts EMPTY in the realm (earned, never given)', rage0.mp === 0, `mp ${rage0.mp}/${rage0.cap}`);

  // -- 6. MELEE CLEAVE: hits the frontal arc only, spares behind + out-of-range,
  //       fires NO projectile, and BANKS RAGE per enemy hit ------------------------
  const melee = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, R = DATA.weapons.sword.range;
    p.state.lastShotAt = 0;
    var front = Entities.spawnMob(r, 'brute', p.x + R*0.5, p.y);       // in arc + range
    var behind = Entities.spawnMob(r, 'brute', p.x - R*0.5, p.y);      // opposite the aim
    var far = Entities.spawnMob(r, 'brute', p.x + R + 260, p.y);       // beyond reach
    var f0 = front.mob.hp, b0 = behind.mob.hp, x0 = far.mob.hp;
    var rage0 = p.state.mp, shotsBefore = r.playerShots.countActive(true);
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:true,ability:false}, r.time.now, 0);
    return { frontHit: front.mob.hp < f0, behindSpared: behind.mob.hp === b0, farSpared: far.mob.hp === x0,
             noProjectile: r.playerShots.countActive(true) === shotsBefore,
             dmg: f0 - front.mob.hp,
             rageGained: p.state.mp - rage0, wantRage: DATA.weapons.sword.rageGain };})()`);
  check('Sword cleave damages the mob in the frontal arc', melee.frontHit, `for ${melee.dmg}`);
  check('Cleave spares the mob behind you and the one out of reach', melee.behindSpared && melee.farSpared);
  check('A melee swing fires NO projectile (the sword has none)', melee.noProjectile);
  check('Connecting the cleave BANKS RAGE (rageGain per enemy hit)',
    melee.rageGained === melee.wantRage, `+${melee.rageGained} rage`);

  // -- 7. WHIRLWIND channel: held → drains MP, ticks AoE damage, sets whirling ---
  const whirl = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, ww = DATA.abilities.whirlwind;
    p.state.mp = 200; p.state.lastWhirlTickAt = 0;
    var near = Entities.spawnMob(r, 'brute', p.x + ww.radius*0.5, p.y);
    var out  = Entities.spawnMob(r, 'brute', p.x + ww.radius + 220, p.y);
    var n0 = near.mob.hp, o0 = out.mob.hp, mp0 = p.state.mp;
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:false,ability:true}, r.time.now, 200);
    return { whirling: p.state.whirling === true, drained: p.state.mp < mp0,
             nearHit: near.mob.hp < n0, outSpared: out.mob.hp === o0,
             mp0: mp0, mp1: p.state.mp };})()`);
  check('Whirlwind held → the Knight spins (st.whirling) and drains MP',
    whirl.whirling && whirl.drained, `mp ${whirl.mp0}→${whirl.mp1.toFixed(1)}`);
  check('Whirlwind tick damages mobs in radius, spares mobs outside it',
    whirl.nearHit && whirl.outSpared);

  // -- 8. releasing the key stops the channel (no drain, whirling clears) ---------
  const release = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player;
    p.state.mp = 30; var mp0 = p.state.mp;    // below the knight's lvl-1 mp cap so regen doesn't clamp
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:false,ability:false}, r.time.now, 200);
    return { whirling: p.state.whirling === false, mpSteady: p.state.mp >= mp0 };})()`);
  check('Releasing the ability key stops the whirlwind (no MP drain, whirling off)',
    release.whirling && release.mpSteady);

  // -- 8b. BERSERKER: the whirlwind LIFESTEALS — damaging a mob heals the Knight -
  const steal = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, ww = DATA.abilities.whirlwind;
    var m = Entities.spawnMob(r, 'brute', p.x + ww.radius*0.5, p.y);
    m.mob.affix = null; m.mob.evolved = true;             // deterministic (no champion evolve)
    p.state.hp = 20; var hp0 = p.state.hp;
    r.whirlwindTick(p, p.state, ww);
    return { healed: p.state.hp > hp0, gain: p.state.hp - hp0 };})()`);
  check('Whirlwind tick HEALS the Knight per enemy it damages (lifesteal)',
    steal.healed, `+${steal.gain} hp`);

  // -- 8c. BERSERKER: at ZERO rage the channel refuses ----------------------------
  const zero = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player;
    p.state.mp = 0; p.state.lastWhirlTickAt = 0;
    Entities.updatePlayer(r, p, {moveX:0,moveY:0,aimAngle:0,firing:false,ability:true}, r.time.now, 200);
    return { whirling: p.state.whirling, mp: p.state.mp };})()`);
  check('At 0 rage the whirlwind cannot channel (holding the key does nothing)',
    zero.whirling === false && zero.mp === 0);

  // -- 9. TORNADO proc: whirlwindTick can fling a tornado; it grinds mobs it laps -
  const torn = await page.evaluate(`(function(){
    var r = ${scene('Realm')}, p = r.player, ww = DATA.abilities.whirlwind;
    var save = ww.tornado.chance; ww.tornado.chance = 1;      // force the proc, deterministically
    var before = r.tornadoes.countActive(true);
    r.whirlwindTick(p, p.state, ww);
    ww.tornado.chance = save;
    var spawned = r.tornadoes.countActive(true) > before;
    // grind (isolated): a fresh mob 500px away from the player + any proc'd
    // tornado, with a tornado placed right on it — no cross-contamination.
    var mx = p.x - 500, my = p.y - 500;
    var m = Entities.spawnMob(r, 'brute', mx, my);
    m.mob.affix = null; m.mob.evolved = true; m.mob.hp = DATA.mobs.brute.hp;   // plain mob (no champion evolve mid-grind)
    if (m.nameTag) { m.nameTag.destroy(); m.nameTag = null; }
    var h0 = m.mob.hp;
    r.spawnTornado(mx, my, 0, ww.tornado, p.state);
    r.updateTornadoes(r.time.now);
    return { spawned: spawned, ground: m.mob.hp < h0, dmg: h0 - m.mob.hp };})()`);
  check('Whirlwind can fling a TORNADO out', torn.spawned);
  check('A tornado grinds a mob it overlaps', torn.ground, `for ${torn.dmg}`);

  // -- 10. permadeath keeps the slot's class (a Knight slot stays a Knight) -------
  const perma = await page.evaluate(`(function(){
    var r = ${scene('Realm')};
    r.player.state.cls = 'knight';
    r.onDeath('the void');
    return { cls: CURRENT.cls, saved: JSON.parse(localStorage.getItem('srb_save_1')).character.cls };})()`);
  check('Permadeath spawns a fresh character of the SAME class (knight→knight)',
    perma.cls === 'knight' && perma.saved === 'knight');

  // -- 11. the class picker is data-driven for all three classes ------------------
  const picker = await page.evaluate(`(function(){
    var t = ${scene('Title')};
    game.scene.stop('Realm'); game.scene.stop('Nexus');
    if (!game.scene.isActive('Title')) game.scene.start('Title');
    return { classes: Object.keys(DATA.classes),
             accents: Object.keys(DATA.classes).every(function(k){ return DATA.classes[k].accent != null; }) };})()`);
  check('Picker is data-driven: four classes (incl. the locked NINJA), each with its own accent',
    picker.classes.length === 4 && picker.accents);

  // -- 12. zero console errors across the whole run ------------------------------
  check('no console errors during the run', consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(' | '));

  console.log(`\n${failures === 0 ? 'ALL GREEN' : failures + ' FAILED'} — ${step} checks`);
  await browser.close();
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
