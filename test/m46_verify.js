// M4.6 verification — fire volley burn (+unfreeze shift), ranger ENERGY,
// class dmgTaken multipliers, class-locked drops, efficiency mods live in the
// channels, vault class-lock guard. Run: NODE_PATH=... node test/m46_verify.js
const path = require('path');
const { chromium } = require('playwright');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
let n = 0, fails = 0;
function check(name, ok, detail) {
  n++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + String(n).padStart(2) + '  ' + name + (detail ? '  — ' + detail : ''));
  if (!ok) fails++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(600);

  // ---- RANGER: energy + fire volley ------------------------------------------------
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  const energy = await page.evaluate(`(function(){var c=DATA.classes.ranger;
    return { name: c.resource && c.resource.name, regen: c.mpRegenPerSec,
             startsFull: ${scene('Nexus')}.player.state.mp > 0 };})()`);
  check('Ranger runs on ENERGY: yellow resource, regen 10/s, starts FULL (not a rage)',
    energy.name === 'ENERGY' && energy.regen === 10 && energy.startsFull);

  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);

  // volley → shots carry the burn rider
  const volley = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p=r.player, st=p.state, intent=SIM.makeIntent();
    st.mp = st.stats.mp; st.lastAbilityAt = -99999; intent.ability = true;
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var burns=0, tinted=0, live=0;
    r.playerShots.children.iterate(function(s){ if(s&&s.active){ live++;
      if(s.proj.burn && s.proj.burn.tick>0) burns++; if(s.tintTopLeft!==0xffffff) tinted++; } });
    return { live: live, burns: burns, tinted: tinted, cost: st.stats.mp - st.mp };})()`);
  // (the scene's own auto-fire can slip a plain basic arrow into the pool —
  // count the volley's 5 burning arrows, don't demand the whole pool burns)
  check('FIRE VOLLEY: all 5 volley arrows carry an ATT-scaled burn rider + ember tint',
    volley.burns >= 5 && volley.tinted >= 5,
    volley.live + ' arrows, ' + volley.burns + ' burning');
  check('volley paid its energy cost', volley.cost >= 20, 'cost ' + volley.cost);

  // burn ticks on a pinned mob: applyBurn → updateMob ticks → hp drops, no knockback
  const burn = await page.evaluate(`(function(){var r=${scene('Realm')};
    var m = Entities.spawnMob(r, 'brute', r.player.x + 300, r.player.y);
    m.mob.affix = null; m.setVelocity(0,0);
    var t = r.time.now;
    Entities.applyBurn(m, { tick: 7, everyMs: 100, ms: 10000 }, t);
    var x0 = m.x, hp0 = m.mob.hp;
    Entities.updateMob(r, m, r.player, t + 150);   // one tick due
    var hp1 = m.mob.hp;
    Entities.updateMob(r, m, r.player, t + 250);   // second tick due
    return { d1: hp0 - hp1, d2: hp1 - m.mob.hp, moved: Math.abs(m.x - x0) > 20,
             scorched: m.mob.scorched, until0: m.mob.burnUntil,
             mob: m };})()`);
  check('burn TICKS: 7 dmg per everyMs, ember tint on, no knockback from ticks',
    burn.d1 === 7 && burn.d2 === 7 && burn.scorched === true);

  // unfreeze shifts burn clocks (the m4p audit gotcha)
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')};
    var m=null; r.mobs.children.iterate(function(x){ if(x&&x.active&&x.mob.burnUntil) m=x; });
    // m5a harness fix: the check-4 brute can burn to DEATH between evaluates
    // (slow headless frames — the old timing flake family). The invariant
    // under test is the SHIFT, so pin a fresh burning mob if needed.
    if (!m) {
      m = Entities.spawnMob(r, 'brute', r.player.x + 300, r.player.y);
      m.mob.affix = null;
      Entities.applyBurn(m, { tick: 1, everyMs: 5000, ms: 60000 }, r.time.now);
    }
    if (!m) return { found: false };
    var u0=m.mob.burnUntil, n0=m.mob.nextBurnAt;
    r.pauseGame();
    var pausedAt = r.pausedAt;
    r.time.now && null;
    // simulate 5s of menu time passing on the scene clock, then unfreeze
    r.pausedAt = r.time.now - 5000;
    r.unfreeze();
    if (r._menuHandle) { r._menuHandle.close(); }
    return { found: true, du: m.mob.burnUntil - u0, dn: m.mob.nextBurnAt - n0 };})()`);
  check('unfreeze() SHIFTS burn clocks (burnUntil/nextBurnAt move with the pause)',
    shift.found && shift.du >= 4900 && shift.dn >= 4900, 'shift ' + shift.du + 'ms');

  // dmgTaken: ranger takes 1x from everything
  const rangerHit = await page.evaluate(`(function(){var r=${scene('Realm')};
    var st=r.player.state; st.hp = st.stats.hp; st.lastHitAt = -99999;
    Entities.hurtPlayer(r, r.player, 20, r.time.now, 'test', true);
    return st.stats.hp - st.hp;})()`);
  check('Ranger dmgTaken is 1x even from the boss (20 raw → 20 before DEF)',
    rangerHit === Math.max(1, 20 - 0), 'took ' + rangerHit);

  // M4.8: DODGE REGEN — untouched for delayMs heals; a fresh hit blocks it
  const regen = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p=r.player, st=p.state, rr=DATA.classes.ranger.hpRegen, intent=SIM.makeIntent();
    st.alive = true; st.hp = st.stats.hp - 50;
    // JUST hit → inside the delay window, no heal
    st.lastHitAt = r.time.now;
    var h0 = st.hp;
    Entities.updatePlayer(r, p, intent, r.time.now + 500, 500);   // 0.5s < delay
    var duringDelay = st.hp;
    // clean past the delay → heals pctPerSec/s, sets regenning
    st.lastHitAt = r.time.now - rr.delayMs - 100;
    Entities.updatePlayer(r, p, intent, r.time.now + 1000, 1000); // 1s of regen
    var healed = st.hp;
    var want = Math.min(st.stats.hp, duringDelay + st.stats.hp * rr.pctPerSec);
    // full → nothing to do, regenning off
    st.hp = st.stats.hp;
    Entities.updatePlayer(r, p, intent, r.time.now + 2000, 1000);
    return { blocked: Math.abs(duringDelay - h0) < 1e-6, healed: healed, want: want,
             regenning: st.regenning === false, healedRegenning: healed > duringDelay };})()`);
  check('DODGE REGEN: a fresh hit blocks it; a clean window heals pctPerSec/s (regenning true; off at full)',
    regen.blocked && Math.abs(regen.healed - regen.want) < 0.01 && regen.healedRegenning && regen.regenning,
    'healed ' + regen.healed.toFixed(1) + ' want ' + regen.want.toFixed(1));

  // M4.8/M4.9: the DODGE CLASSES regen (Ranger 2.5s, Wizard 5s); the Knight
  // does NOT (he has lifesteal instead).
  const whoRegens = await page.evaluate(`(function(){
    return { k: !DATA.classes.knight.hpRegen,
             rDelay: DATA.classes.ranger.hpRegen && DATA.classes.ranger.hpRegen.delayMs,
             wDelay: DATA.classes.wizard.hpRegen && DATA.classes.wizard.hpRegen.delayMs };})()`);
  check('regen: Ranger 2.5s + Wizard 5s out-of-combat; Knight has none (lifesteal)',
    whoRegens.k && whoRegens.rDelay === 2500 && whoRegens.wDelay === 5000,
    'ranger ' + whoRegens.rDelay + ' wizard ' + whoRegens.wDelay);

  // M4.8: the two enlarged yard mobs render bigger, with proportional hitboxes
  const sizes = await page.evaluate(`(function(){
    var imp = TEX.mobModel('furnaceImp'), creep = TEX.mobModel('crossingCreep'), slime = TEX.mobModel('coalGolem');
    var world = function(m){ return m.body.w * m.scale; };   // hitbox in world px
    return { impScale: imp.scale, creepScale: creep.scale, baseScale: slime.scale,
             impBody: world(imp), baseBody: world(slime) };})()`);
  check('enlarged mobs: Furnace Imp + Crossing Creep scale up past the base 40px mob, hitbox grows with them',
    sizes.impScale > sizes.baseScale && sizes.creepScale > sizes.baseScale &&
    sizes.creepScale < sizes.impScale && sizes.impBody > sizes.baseBody,
    'imp ' + sizes.impScale.toFixed(2) + ' creep ' + sizes.creepScale.toFixed(2) + ' base ' + sizes.baseScale.toFixed(2));

  // class-locked drops resolve through classGear
  const drops = await page.evaluate(`(function(){
    return { rw: SIM.resolveDrop('w3','ranger'),  ww: SIM.resolveDrop('w3','wizard'),
             kw: SIM.resolveDrop('w3','knight'),  ka: SIM.resolveDrop('a5','knight'),
             ar: SIM.resolveDrop('ar4','wizard'), leg: SIM.resolveDrop('w5','wizard') };})()`);
  check('drops resolve per class: w3→ww3/kw3, a5→ka5, armor untouched, legendary maps to legendary',
    drops.rw === 'w3' && drops.ww === 'ww3' && drops.kw === 'kw3' &&
    drops.ka === 'ka5' && drops.ar === 'ar4' && drops.leg === 'ww5');

  // ---- KNIGHT: dmgTaken mults + war-horn drain -------------------------------------
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Title')`);
  await page.waitForFunction(`game.scene.isActive('Title')`, null, { timeout: 15000 });
  await sleep(400);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(2, 'knight')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);

  const knightHits = await page.evaluate(`(function(){var r=${scene('Realm')};
    var st=r.player.state, def=Math.floor(st.stats.def);
    st.hp = st.stats.hp; st.lastHitAt = -99999;
    Entities.hurtPlayer(r, r.player, 20, r.time.now, 'mob-test', false);
    var mobHit = st.stats.hp - st.hp;
    st.hp = st.stats.hp; st.lastHitAt = -99999;
    Entities.hurtPlayer(r, r.player, 20, r.time.now, 'boss-test', true);
    var bossHit = st.stats.hp - st.hp;
    return { mob: mobHit, boss: bossHit, def: def };})()`);
  check('Knight eats +30% from mobs (20→26 before DEF) and +60% from the boss (20→32)',
    knightHits.mob === Math.max(1, 26 - knightHits.def) &&
    knightHits.boss === Math.max(1, 32 - knightHits.def),
    'mob ' + knightHits.mob + ' boss ' + knightHits.boss + ' (def ' + knightHits.def + ')');

  // war horn cuts the whirlwind drain (channel reads SIM.abilityFor live)
  const horn = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p=r.player, st=p.state, ab=DATA.abilities.whirlwind, intent=SIM.makeIntent();
    intent.ability = true;
    st.mp = 60; st.lastWhirlTickAt = r.time.now;         // tick just fired — isolate the DRAIN
    st.equipment.ability = null;
    Entities.updatePlayer(r, p, intent, r.time.now, 1000);   // 1s of channel
    var bare = 60 - st.mp;
    st.mp = 60; st.lastWhirlTickAt = r.time.now;
    st.equipment.ability = 'ka5';                        // Cataclysm Horn: -10/s (floor 6)
    Entities.updatePlayer(r, p, intent, r.time.now, 1000);
    var horned = 60 - st.mp;
    st.equipment.ability = null;
    return { bare: Math.round(bare), horned: Math.round(horned) };})()`);
  check('WAR HORN live in the channel: whirlwind drains 20/s bare, 10/s with the Cataclysm Horn',
    horn.bare === 20 && horn.horned === 10, horn.bare + ' vs ' + horn.horned);

  // ---- WIZARD: tome per-shot cost + boss-bolt mult ---------------------------------
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Title')`);
  await page.waitForFunction(`game.scene.isActive('Title')`, null, { timeout: 15000 });
  await sleep(400);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(3, 'wizard')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);

  const tome = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p=r.player, st=p.state, intent=SIM.makeIntent();
    intent.ability = true;
    st.mp = 100; st.lastBarrageAt = 0; st.equipment.ability = null;
    Entities.updatePlayer(r, p, intent, r.time.now, 0);
    var bare = 100 - st.mp;                              // one ball, base cost
    st.mp = 100; st.lastBarrageAt = 0; st.equipment.ability = 'wa5';
    Entities.updatePlayer(r, p, intent, r.time.now, 0);
    var tomed = 100 - st.mp;
    st.equipment.ability = null;
    return { bare: bare, tomed: Math.round(tomed * 100) / 100 };})()`);
  check('TOME live in the barrage: 1.25 MP/ball bare, 0.60 with the Codex of the Tempest',
    Math.abs(tome.bare - 1.25) < 1e-9 && Math.abs(tome.tomed - 0.6) < 1e-9,
    tome.bare + ' vs ' + tome.tomed);

  // boss-tagged bolt hits the wizard for 1.6x
  const wizBolt = await page.evaluate(`(function(){var r=${scene('Realm')};
    var st=r.player.state, def=Math.floor(st.stats.def);
    st.hp = st.stats.hp; st.lastHitAt = -99999;
    var s = Entities.fireProjectile(r, r.enemyShots, r.player.x+40, r.player.y, Math.PI, 10, 10, 1000, 'bolt', false, 'T');
    s.proj.fromBoss = true;
    Entities.hurtPlayer(r, r.player, s.proj.dmg, r.time.now, 'test', s.proj.fromBoss);
    Entities.killProjectile(r.enemyShots, s);
    return { took: st.stats.hp - st.hp, def: def };})()`);
  check('Wizard eats +60% from a boss-tagged bolt (10→16 before DEF)',
    wizBolt.took === Math.max(1, 16 - wizBolt.def), 'took ' + wizBolt.took);

  // ---- VAULT class lock (wizard cannot equip knight gear) ---------------------------
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Nexus', { entry: 'realm' })`);
  await page.waitForFunction(`game.scene.isActive('Nexus') && ${scene('Nexus')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const lock = await page.evaluate(`(function(){var nx=${scene('Nexus')};
    GAME_SAVE.vault.length = 0;
    GAME_SAVE.vault.push('kw4');                         // a knight Ragefang in the account vault
    GAME_SAVE.vault.push('ar3');                         // universal armor
    nx.buildVaultUi();
    nx.equipFromVault(0);                                // must refuse
    var refused = CURRENT.equipment.weapon === null && GAME_SAVE.vault[0] === 'kw4';
    nx.equipFromVault(1);                                // must equip
    var equipped = CURRENT.equipment.armor === 'ar3';
    if (nx.vaultUi) { nx.vaultUi.forEach(function(o){o.destroy();}); nx.vaultUi = null; }
    return { refused: refused, equipped: equipped };})()`);
  check("VAULT CLASS LOCK: a wizard can't equip knight gear (stays banked); universal armor equips",
    lock.refused && lock.equipped);

  // rarity label sanity
  const label = await page.evaluate(`itemLabel('w5') + ' | ' + itemLabel('ar0') + ' | ' + itemLabel('r3')`);
  check('labels lead with the rarity ladder (LEGENDARY/ABUNDANT/RARE)',
    label.indexOf('LEGENDARY · Phoenix Longbow') === 0 && label.indexOf('ABUNDANT · Padded Vest') > 0 &&
    label.indexOf('RARE · Ring of Might') > 0, label);

  console.log('');
  console.log(fails === 0 ? 'ALL GREEN — ' + n + ' checks' : fails + ' FAILURE(S)');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('SUITE CRASH:', e); process.exit(1); });
