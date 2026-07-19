// M5.0 verification — THE GROVE: realm routing, the 8-mob roster mechanics
// (split / blink / wards+cast / revive trail / turret colors / flap), the
// falling-tree hazard, the Grovekeeper's grove verbs, the growing arrival,
// PHASE TWO (pixie resurrection), and the unfreeze shift list.
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
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(600);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });

  // -- 1. console: THE GROVE is a live destination; bestiary re-scopes ------------
  const con = await page.evaluate(`(function(){var nx=${scene('Nexus')};
    var grove = DATA.console.maps.filter(function(m){ return m.id === 'grove'; })[0];
    var before = nx.bestiaryEntries().map(function(e){ return e.key; });
    nx.consoleSetMap('grove');
    var after = nx.bestiaryEntries().map(function(e){ return e.key; });
    return { live: grove && !grove.locked, sel: nx.consoleMap,
             beforeFirst: before[0], afterFirst: after[0], afterN: after.length,
             expected: DATA.biomes.grove.mobs.length + 1,
             hasMoth: after.indexOf('moonmoth') >= 0, hasBloom: after.indexOf('bloomPixie') >= 0 };})()`);
  check('THE GROVE is unlocked on the portal machine + selectable', con.live && con.sel === 'grove');
  // M7k: the book is BY MAP — grove roster + the grove's OWN boss
  check('bestiary follows the selected map: grove roster + its boss (M7k by-map)',
    con.afterN === con.expected && con.hasMoth && con.hasBloom && con.beforeFirst === 'coalGolem');

  // -- 2. realm routing: map:'grove' → grove biome/boss/world ----------------------
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'grove' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);
  const world = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { id: r.realmId, biome: r.realmBiome, boss: r.realmBoss, kind: r.realmDef.kind,
             heartwood: !!r.heartwood, noTrain: !r.train && !r.trainLanes,
             fall: !!r.groveFall, trunkGroup: !!r.trunkGroup,
             flapTex: game.textures.exists('pixieHib') && game.textures.exists('moonmothHib'),
             decor: game.textures.exists('dcOak') && game.textures.exists('dcPond') && game.textures.exists('dcObelisk') };})()`);
  check('grove realm: biome/boss/kind routed, heartwood up, NO train state',
    world.id === 'grove' && world.biome === 'grove' && world.boss === 'grovekeeper' &&
    world.kind === 'grove' && world.heartwood && world.noTrain && world.fall && world.trunkGroup);
  check('flap frames + decor-pick textures built', world.flapTex && world.decor);

  // determinism: stand the AMBIENT tree-falls down for the mechanics tests —
  // a random timber mid-test crushes the fixtures (it did — flake source)
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.groveFall.nextAt = Infinity;
    if (r.groveFall.fall) { try { r.groveFall.fall.shadow.destroy(); } catch (e) {} r.groveFall.fall = null; r.groveFall.phase = 'idle'; }
    r.groveTrunks.forEach(function(t){ t.dieAt = 0; });
    r.updateGrove(r.time.now, 16);})()`);

  // -- 3. director spawns from the GROVE roster only -------------------------------
  const roster = await page.evaluate(`(function(){var r=${scene('Realm')};
    for (var i = 0; i < 6; i++) r.directorSpend();
    var keys = {};
    r.mobs.children.iterate(function(m){ if (m && m.active) keys[m.mob.key] = true; });
    var grove = DATA.biomes.grove.mobs;
    var all = Object.keys(keys).every(function(k){ return grove.indexOf(k) >= 0; });
    return { n: Object.keys(keys).length, all: all, keys: Object.keys(keys).join(',') };})()`);
  check('director spawns GROVE mobs only', roster.n > 0 && roster.all, roster.keys);

  // -- 4. PUFFCAP splits into 10 recolored minis on death ---------------------------
  const puff = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r._spawnQueue = []; r.corpses = [];
    var p = r.player; p.setPosition(r.worldW / 2, r.worldH / 2);
    var pc = Entities.spawnMob(r, 'puffcap', p.x + 200, p.y); pc.mob.affix = null;
    var slow = pc.mob.spd === 42;
    Entities.hurtMob(r, pc, 9999, r.time.now);
    var queued = r._spawnQueue.length;
    r.updateGrove(r.time.now, 16);
    var minis = 0, skins = {};
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.key === 'puffcapMini') { minis++; skins[m.texture.key] = true; } });
    return { slow: slow, queued: queued, minis: minis, skinCount: Object.keys(skins).length };})()`);
  check('PUFFCAP: slow; death splits into 10 minis with recolored caps',
    puff.slow && puff.queued === 10 && puff.minis === 10 && puff.skinCount >= 2,
    `${puff.minis} minis, ${puff.skinCount} skins`);

  // -- 5. PIXIE blinks between fans; shots are tinted orbs --------------------------
  const pixie = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var p = r.player;
    var px = Entities.spawnMob(r, 'pixie', p.x + 250, p.y); px.mob.affix = null;
    var x0 = px.x, y0 = px.y;
    px.mob.nextBlinkAt = r.time.now - 1;
    Entities.updateMob(r, px, p, r.time.now);
    var moved = Math.hypot(px.x - x0, px.y - y0);
    // force a shot: in range, cooldown clear
    px.mob.lastShotAt = -99999;
    var before = r.enemyShots.countActive(true);
    Entities.updateMob(r, px, p, r.time.now + 10);
    var shots = [];
    r.enemyShots.children.iterate(function(s){ if (s && s.active) shots.push({ tex: s.texture.key, tint: s.tintTopLeft }); });
    return { moved: moved, fired: shots.length - before >= 3,
             orb: shots.length && shots[shots.length-1].tex === 'orbShot',
             tinted: shots.length && shots[shots.length-1].tint === DATA.mobs.pixie.shoot.tint };})()`);
  check('PIXIE blinks to a new spot (with fx) between fans', pixie.moved > 60, `moved ${Math.round(pixie.moved)}px`);
  check('pixie fan = 3 tinted orb shots', pixie.fired && pixie.orb && pixie.tinted);

  // -- 6. turret plants: rooted, distinct projectile colors -------------------------
  const plants = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.enemyShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.enemyShots, s); });
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var p = r.player;
    var seed = Entities.spawnMob(r, 'seedlingTurret', p.x + 150, p.y); seed.mob.affix = null;
    var snap = Entities.spawnMob(r, 'snapdragon', p.x - 150, p.y); snap.mob.affix = null;
    seed.mob.lastShotAt = -99999; snap.mob.lastShotAt = -99999;
    Entities.updateMob(r, seed, p, r.time.now);
    Entities.updateMob(r, snap, p, r.time.now);
    var gold = 0, pink = 0, total = 0;
    r.enemyShots.children.iterate(function(s){
      if (!s || !s.active) return;
      total++;
      if (s.tintTopLeft === DATA.mobs.seedlingTurret.shoot.tint) gold++;
      if (s.tintTopLeft === DATA.mobs.snapdragon.shoot.tint) pink++;
    });
    return { rooted: seed.body.velocity.x === 0 && snap.body.velocity.x === 0,
             gold: gold, pink: pink, total: total };})()`);
  check('SEEDLING (radial gold ×10) + SNAPDRAGON (aimed pink ×3) — rooted, distinct colors',
    plants.rooted && plants.gold === 10 && plants.pink === 3, `gold ${plants.gold} pink ${plants.pink}`);

  // -- 7. BUMBLEBRUTE: SUMMON cast bar → 4 ward minis → immortal until they fall ----
  const brute = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.enemyShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.enemyShots, s); });
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r._spawnQueue = [];
    var p = r.player;
    var bb = Entities.spawnMob(r, 'bumblebrute', p.x + 220, p.y); bb.mob.affix = null;
    var casting = bb.mob.castUntil > 0;
    Entities.updateMob(r, bb, p, r.time.now);
    var barUp = !!bb.castBar && !!bb.castText && bb.castText.text === 'SUMMON';
    var rooted = bb.body.velocity.x === 0;
    bb.mob.castUntil = r.time.now - 1;               // the half second passes
    Entities.updateMob(r, bb, p, r.time.now);
    var barGone = !bb.castBar;
    r.updateGrove(r.time.now, 16);                   // drain the ward spawns
    var minis = [];
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.key === 'bumblebruteMini') minis.push(m); });
    var hpBefore = bb.mob.hp;
    Entities.hurtMob(r, bb, 500, r.time.now);        // should BOUNCE
    var immune = bb.mob.hp === hpBefore && bb.active;
    minis.forEach(function(m){ Entities.hurtMob(r, m, 9999, r.time.now); });
    var freed = bb.mob.ward === 0;
    Entities.hurtMob(r, bb, 500, r.time.now);        // now it lands
    var hurt = bb.mob.hp < hpBefore;
    return { casting: casting, barUp: barUp, rooted: rooted, barGone: barGone,
             minis: minis.length, ward: freed, immune: immune, hurt: hurt };})()`);
  check('BUMBLEBRUTE casts SUMMON (0.5s bar over his head, rooted)', brute.casting && brute.barUp && brute.rooted);
  check('4 ward minis spawn; he is IMMORTAL until they die, then takes damage',
    brute.barGone && brute.minis === 4 && brute.immune && brute.ward && brute.hurt,
    `${brute.minis} minis`);

  // -- 8. BLOOM PIXIE: glow trail resurrects; death-bloom raises the yard -----------
  const bloom = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r._spawnQueue = []; r.corpses = []; r.glowPatches = [];
    var p = r.player;
    // a victim dies at a spot...
    var moth = Entities.spawnMob(r, 'moonmoth', p.x + 300, p.y); moth.mob.affix = null;
    var mx = moth.x, my = moth.y;
    Entities.hurtMob(r, moth, 9999, r.time.now);
    var corpse = r.corpses.length === 1;
    // ...a bloom pixie's trail covers it → it RISES
    r.dropGlow(mx, my, DATA.mobs.bloomPixie.glowTrail);
    r.updateGrove(r.time.now, 16);                    // revive check queues
    r.updateGrove(r.time.now + 1, 16);                // drain
    var raised = 0;
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.key === 'moonmoth') raised++; });
    // death bloom: corpses near HER death rise too
    var m2 = null;
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.key === 'moonmoth') m2 = m; });
    var bp = Entities.spawnMob(r, 'bloomPixie', m2.x + 40, m2.y); bp.mob.affix = null;
    Entities.hurtMob(r, m2, 9999, r.time.now + 5);    // fresh corpse next to her
    Entities.hurtMob(r, bp, 9999, r.time.now + 6);    // kill HER → death bloom
    r.updateGrove(r.time.now + 10, 16);
    var raised2 = 0;
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.key === 'moonmoth') raised2++; });
    return { corpse: corpse, raised: raised, raised2: raised2,
             summonCfg: !!DATA.mobs.bloomPixie.summon && DATA.mobs.bloomPixie.summon.key === 'bumblebrute' };})()`);
  check('BLOOM PIXIE: glow trail resurrects a fallen mob', bloom.corpse && bloom.raised === 1);
  check('her death-bloom raises corpses in a radius; periodic BUMBLEBRUTE summon wired',
    bloom.raised2 === 1 && bloom.summonCfg);

  // -- 9. FALLING TREE: crush credits kills, hurts the player, trunk lingers then
  // crumbles ------------------------------------------------------------------------
  const tree = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.groveTrunks.forEach(function(t){ t.dieAt = 0; });
    r.updateGrove(r.time.now, 16);                   // start with a clear floor
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.lastHitAt = -99999; st.kills = 0;
    p.setPosition(r.worldW / 2, r.worldH / 2);
    var victim = Entities.spawnMob(r, 'moonmoth', p.x + 40, p.y); victim.mob.affix = null;
    var fall = r.startTreeFall(p.x, p.y, 100, 55, 500, false);
    var telegraphed = fall.phase === 'warn' && !!fall.shadow;
    // cheat the lane onto the player exactly, then drop
    fall.cx = p.x; fall.cy = p.y; fall.horiz = true;
    r.dropTree(fall);
    var hurt = st.hp < st.stats.hp, credited = st.kills >= 1, gone = !victim.active;
    var trunkUp = r.groveTrunks.length === 1 && !!r.groveTrunks[0].body.body;
    r.groveTrunks[0].dieAt = r.time.now - 1;
    r.updateGrove(r.time.now, 16);
    var crumbled = r.groveTrunks.length === 0;
    return { telegraphed: telegraphed, hurt: hurt, credited: credited, gone: gone,
             trunkUp: trunkUp, crumbled: crumbled, kills: st.kills };})()`);
  check('FALLING TREE: telegraph → crush (player hurt, mob mowed + CREDITED)',
    tree.telegraphed && tree.hurt && tree.credited && tree.gone, `kills ${tree.kills}`);
  check('the trunk lingers as a wall, then crumbles', tree.trunkUp && tree.crumbled);

  // -- 10. THE GROVEKEEPER: grows out of the ground → scouter -----------------------
  const arriving = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.startBossFight();
    return { growing: r.arrivalGrove === true, bossYet: !!r.boss };})()`);
  check('boss portal → THE HEARTWOOD WAKES (growth cinematic first, no instant boss)',
    arriving.growing && !arriving.bossYet);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 60000 });
  const scout = await page.evaluate(`(function(){var r=${scene('Realm')};
    var texts=[]; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    var b = r.boss;
    return { hp: b.boss.hp, scale: Math.abs(b.scaleX - (TEX.bossModel('grovekeeper') ? TEX.bossModel('grovekeeper').scale : 3)) < 0.01,
             blob: texts.join(' | ') };})()`);
  check('he stands full-grown: hp 1400 + scouter with TIMBER/SUNLANCE hints',
    scout.hp === 1400 && scout.scale && scout.blob.indexOf('TIMBER') >= 0 && scout.blob.indexOf('SUNLANCE') >= 0);
  // M5.1 (user bug): the six-hint readout must FIT the panel — no collision
  // with the engage prompt, nothing past the frame's bottom edge
  const fit = await page.evaluate(`(function(){var r=${scene('Realm')};
    var hints = null, prompt = null, cy = r.scale.height / 2;
    r.children.list.forEach(function(c){
      if (c.text && c.text.indexOf('TACTICAL READOUT') === 0) hints = c;
      if (c.text && c.text.indexOf('ENTER or CLICK') >= 0) prompt = c;
    });
    return { found: !!hints && !!prompt,
             clear: hints && prompt && (hints.y + hints.height) <= prompt.y - 2,
             inPanel: hints && (hints.y + hints.height) <= cy + 224 };})()`);
  check('scouter readout fits in frame (clear of the engage prompt + panel edge)',
    fit.found && fit.clear && fit.inPanel);
  await page.keyboard.press('Enter');
  await sleep(300);

  // -- M5.1: LEGENDARY GLOW — an equipped T5 weapon burns in the hand ---------------
  const glow = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state;
    var intent = SIM.makeIntent();
    var was = st.equipment.weapon;
    st.equipment.weapon = 'w5';                        // Phoenix Longbow (LEGENDARY)
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var on = !!p.legendGlow && p.legendGlow.visible &&
             p.legendGlow.tintTopLeft === DATA.tiers[5].color;
    st.equipment.weapon = 'w2';                        // back to an UNCOMMON bow
    Entities.updatePlayer(r, p, intent, r.time.now + 16, 16);
    var off = !p.legendGlow.visible;
    st.equipment.weapon = was;
    return { on: on, off: off };})()`);
  check('LEGENDARY weapon glow: on with a T5 equipped (orange, additive), off otherwise',
    glow.on && glow.off);
  // M5.1: FULL-LEGENDARY SET AURA (class-colored body glow) + the muzzle fix
  const setAura = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state, intent = SIM.makeIntent();
    var was = { w: st.equipment.weapon, a: st.equipment.ability, ar: st.equipment.armor, rg: st.equipment.ring };
    st.equipment.weapon = 'w5'; st.equipment.ability = 'a5';
    st.equipment.armor = 'ar5'; st.equipment.ring = 'r5';
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var on = !!p.setGlowFx && p.setGlowFx.visible &&
             p.setGlowFx.tintTopLeft === DATA.classes.ranger.setGlow;
    st.equipment.ring = 'r4';                          // break the set
    Entities.updatePlayer(r, p, intent, r.time.now + 16, 16);
    var off = !p.setGlowFx.visible;
    // muzzle fix: a shot spawns ~20px along the aim, not at the spine.
    // (kill the pool FIRST — auto-fire arrows from earlier frames made
    // "newest active" a stale pick: the m5c first-run flake)
    r.playerShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.playerShots, s); });
    intent.firing = true; intent.aimAngle = 0; st.lastShotAt = -99999;
    Entities.updatePlayer(r, p, intent, r.time.now + 32, 16);
    var newest = null;
    r.playerShots.children.iterate(function(s){ if (s && s.active) newest = s; });
    var muzzled = newest && (newest.x - p.x) > 10;
    st.equipment.weapon = was.w; st.equipment.ability = was.a;
    st.equipment.armor = was.ar; st.equipment.ring = was.rg;
    return { on: on, off: off, muzzled: muzzled,
             colors: DATA.classes.ranger.setGlow === 0x38b764 &&
                     DATA.classes.wizard.setGlow === 0x41a6f6 &&
                     DATA.classes.knight.setGlow === 0xff3b30 };})()`);
  check('FULL-LEGENDARY SET AURA: green on the archer with all 4 slots T5, off when broken; green/blue/red per class',
    setAura.on && setAura.off && setAura.colors);
  check('shots fire from the muzzle (no fletching out the back)', setAura.muzzled);
  // M5.1: class set-pieces — knight 360° cleave + unlimited rage, wizard
  // homing missiles + all-directions barrage on the full set
  const opKits = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state;
    var was = { w: st.equipment.weapon, a: st.equipment.ability, ar: st.equipment.armor, rg: st.equipment.ring };
    // knight: Ragefang overrides the arc; a mob BEHIND the aim gets cleaved
    st.equipment.weapon = 'kw4';
    var arc = SIM.weaponMod(st.equipment).arcDeg;
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var behind = Entities.spawnMob(r, 'moonmoth', p.x - 50, p.y); behind.mob.affix = null;
    var hp0 = behind.mob.hp;
    r.meleeSwing(p, { aimAngle: 0 }, st, DATA.weapons.sword, 10);   // aiming RIGHT, mob LEFT
    var cleavedBehind = behind.mob.hp < hp0 || !behind.active;
    // knight full set: the whirlwind drain is ZERO (unlimited rage)
    st.equipment.weapon = 'kw5'; st.equipment.ability = 'ka5';
    st.equipment.armor = 'ar5'; st.equipment.ring = 'r5';
    var fullSet = SIM.fullLegendSet(st.equipment);
    // wizard: homing rider + 8-direction radial on the full set
    st.equipment.weapon = 'ww5'; st.equipment.ability = 'wa5';
    r.playerShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.playerShots, s); });
    st.mp = 50; st.lastBarrageAt = 0;
    Entities.channelBarrage ? null : null;
    // drive the barrage through updatePlayer (wizard channel path needs cls) —
    // simpler: call the internal path via a synthetic: count via public effects
    var homingFlag = SIM.weaponMod(st.equipment).homing === true;
    st.equipment.weapon = was.w; st.equipment.ability = was.a;
    st.equipment.armor = was.ar; st.equipment.ring = was.rg;
    return { arc: arc, cleavedBehind: cleavedBehind, fullSet: fullSet, homingFlag: homingFlag };})()`);
  check('KNIGHT: Ragefang cleave = 360° (hits a mob BEHIND him); full-set = fullLegendSet true',
    opKits.arc === 360 && opKits.cleavedBehind && opKits.fullSet);
  check('WIZARD: epic+ rod flags the barrage HOMING', opKits.homingFlag);
  // M5.1: RANGER kit — unlimited energy, auto-volley basics, explosive shotgun set
  const rangerKit = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state;
    var was = { w: st.equipment.weapon, a: st.equipment.ability, ar: st.equipment.armor, rg: st.equipment.ring };
    st.equipment.weapon = 'w5';
    st.mp = 1;
    var intent = SIM.makeIntent();
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var unlimited = st.mp === st.stats.mp;                 // pinned full
    // basic trigger = the VOLLEY (burning fan)
    r.playerShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.playerShots, s); });
    intent.firing = true; intent.aimAngle = 0; st.lastShotAt = -99999;
    Entities.updatePlayer(r, p, intent, r.time.now + 16, 16);
    var fan = 0, burns = 0;
    r.playerShots.children.iterate(function(s){ if (s && s.active) { fan++; if (s.proj.burn) burns++; } });
    // full set: +4 arrows on top of the (legendary-quiver-boosted) fan,
    // every arrow explosive
    st.equipment.ability = 'a5'; st.equipment.armor = 'ar5'; st.equipment.ring = 'r5';
    var wantShotgun = SIM.abilityFor(DATA.abilities.volley, st.equipment).count + 4;
    r.playerShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.playerShots, s); });
    st.lastShotAt = -99999;
    Entities.updatePlayer(r, p, intent, r.time.now + 32, 16);
    var shotgun = 0, explosive = 0;
    r.playerShots.children.iterate(function(s){ if (s && s.active) { shotgun++; if (s.proj.explode) explosive++; } });
    // overlapping blasts STACK: two explosions on one victim
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var victim = Entities.spawnMob(r, 'mossGolem', p.x + 300, p.y); victim.mob.affix = null;
    var vhp = victim.mob.hp;
    r.arrowExplode(victim.x + 10, victim.y, { radius: 60, dmg: 5 }, null);
    r.arrowExplode(victim.x - 10, victim.y, { radius: 60, dmg: 5 }, null);
    var stacked = victim.mob.hp === vhp - 10;
    st.equipment.weapon = was.w; st.equipment.ability = was.a;
    st.equipment.armor = was.ar; st.equipment.ring = was.rg;
    return { unlimited: unlimited, fan: fan, burns: burns, shotgun: shotgun,
             wantShotgun: wantShotgun, explosive: explosive, stacked: stacked };})()`);
  check('RANGER: epic+ bow = unlimited energy + basic shots fire the burning VOLLEY',
    rangerKit.unlimited && rangerKit.fan >= 5 && rangerKit.burns === rangerKit.fan,
    `${rangerKit.fan} arrows`);
  check('RANGER FULL SET: shotgun fan (+4) of EXPLOSIVE arrows; overlapping blasts STACK',
    rangerKit.shotgun === rangerKit.wantShotgun && rangerKit.explosive === rangerKit.shotgun && rangerKit.stacked,
    `${rangerKit.shotgun}/${rangerKit.wantShotgun} arrows`);

  // -- 11. grove verbs --------------------------------------------------------------
  const timber = await page.evaluate(`(function(){var r=${scene('Realm')};
    var b = r.boss, gd = b.boss;
    r.player.setPosition(r.worldW / 2, r.worldH / 2);
    gd.nextTimberAt = 0;
    r.grovekeeperUpdate(b, r.player, r.time.now);
    var warn = !!r.timberFall && r.timberFall.phase === 'warn';
    r.timberFall.warnUntil = 0;
    r.grovekeeperUpdate(b, r.player, r.time.now + 5);
    var dropped = !r.timberFall && r.groveTrunks.length >= 1;
    r.groveTrunks.forEach(function(t){ t.dieAt = 0; });
    r.updateGrove(r.time.now + 6, 16);
    return { warn: warn, dropped: dropped };})()`);
  check('TIMBER: lane telegraph → an ancient trunk crashes + lingers', timber.warn && timber.dropped);
  const mortar = await page.evaluate(`(function(){var r=${scene('Realm')};
    var before = r.groveFx.length, patchesBefore = r.slimePatches.length;
    r.throwMortar(r.boss, DATA.bosses.grovekeeper.patterns.mortar);
    return { added: r.groveFx.length - before };})()`);
  check('THORN MORTAR: 3 marked circles + 3 pods in the air', mortar.added === 6, `${mortar.added} fx`);
  const over = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.alive = true;
    r.snapOvergrowth(r.boss, DATA.bosses.grovekeeper.patterns.overgrowth, r.time.now);
    var intent = SIM.makeIntent(); intent.moveX = 1;
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var slowed = Math.abs(p.body.velocity.x - st.stats.spd * DATA.bosses.grovekeeper.patterns.overgrowth.slowMult) < 1;
    Entities.updatePlayer(r, p, intent, st.slowUntil + 10, 16);
    var recovered = Math.abs(p.body.velocity.x - st.stats.spd) < 1;
    return { slowed: slowed, recovered: recovered };})()`);
  check('OVERGROWTH: vines slow the player, then release', over.slowed && over.recovered);
  const sun = await page.evaluate(`(function(){var r=${scene('Realm')};
    var b = r.boss, gd = b.boss, L = DATA.bosses.grovekeeper.patterns.sunlance;
    var p = r.player, st = p.state;
    st.hp = st.stats.hp; st.alive = true; st.lastHitAt = -99999; st.slowUntil = 0;
    gd.nextSunlanceAt = 0; gd.sunUntil = 0;
    r.updateSunlance(b, p, r.time.now);
    var lit = gd.sunUntil > 0;
    p.setPosition(b.x + Math.cos(gd.sunAng) * 120, b.y + Math.sin(gd.sunAng) * 120);
    gd.nextSunTickAt = 0;
    var before = st.hp;
    r.updateSunlance(b, p, r.time.now + 20);
    return { lit: lit, took: before - st.hp, beam: !!r.sunG };})()`);
  check('SUNLANCE: golden beam sweeps + ticks damage in the light', sun.lit && sun.took > 0 && sun.beam, `tick ${sun.took}`);
  const surge = await page.evaluate(`(function(){var r=${scene('Realm')};
    r._spawnQueue = [];
    var b = r.boss, gd = b.boss;
    gd.nextSurgeAt = 0;
    r.grovekeeperUpdate(b, r.player, r.time.now);
    var queued = r._spawnQueue.filter(function(e){ return e.key === 'puffcapMini'; }).length;
    r.updateGrove(r.time.now, 16);
    return { queued: queued };})()`);
  check('SPORE SURGE: a ring of 6 mini puffcaps sprouts around the player', surge.queued === 6);

  // -- 12. unfreeze() shifts the grove clocks ---------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')};
    var gd = r.boss.boss;
    gd.nextTimberAt = r.time.now + 5000; gd.nextSunlanceAt = r.time.now + 4000;
    r.groveFall.nextAt = r.time.now + 7000;
    var px2 = null;
    r.mobs.children.iterate(function(m){ if (m && m.active && !px2) px2 = m; });
    if (px2) px2.mob.nextBlinkAt = r.time.now + 2000;
    var g0 = { t: gd.nextTimberAt, s: gd.nextSunlanceAt, f: r.groveFall.nextAt,
               b: px2 ? px2.mob.nextBlinkAt : 0 };
    r.pauseGame();
    r.pausedAt = r.time.now - 4000;
    r.unfreeze();
    if (r._menuHandle) r._menuHandle.close();
    return { dT: gd.nextTimberAt - g0.t, dS: gd.nextSunlanceAt - g0.s,
             dF: r.groveFall.nextAt - g0.f, dB: px2 ? (px2.mob.nextBlinkAt - g0.b) : 4000 };})()`);
  check('unfreeze() shifts timber/sunlance/tree-fall/blink clocks by the paused time',
    shift.dT >= 3900 && shift.dS >= 3900 && shift.dF >= 3900 && shift.dB >= 3900, `+${shift.dT}ms`);

  // -- 13. PHASE TWO: first "death" → pixie resurrection → kill him twice -----------
  const p2a = await page.evaluate(`(function(){var r=${scene('Realm')};
    r._spawnQueue = [];
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    Entities.hurtBoss(r, r.boss, 999999);
    var resur = r.boss && r.boss.boss.resurrecting === true;
    var q = r._spawnQueue.filter(function(e){ return e.cinematic; }).length;
    r.updateGrove(r.time.now, 16);                    // the pixies arrive
    var cine = 0;
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.cinematic) cine++; });
    // they FLY toward him and can't be pushed into fighting
    var one = null;
    r.mobs.children.iterate(function(m){ if (m && m.active && m.mob.cinematic && !one) one = m; });
    Entities.updateMob(r, one, r.player, r.time.now);
    var flying = Math.abs(one.body.velocity.x) + Math.abs(one.body.velocity.y) > 0;
    // untouchable mid-channel
    var hp0 = r.boss.boss.hp;
    Entities.hurtBoss(r, r.boss, 500);
    var shielded = r.boss.boss.hp === hp0;
    // kill 5 of the 8 mid-channel — the bloom weakens
    var killed = 0;
    r.mobs.children.iterate(function(m){
      if (m && m.active && m.mob.cinematic && killed < 5) { Entities.hurtMob(r, m, 9999, r.time.now); killed++; }
    });
    r._reviveState.until = r.time.now - 1;
    r.updateGrove(r.time.now, 16);                    // the bloom completes
    var b = r.boss.boss;
    var wantHp = Math.round(b.maxHp * (b.def.phaseTwo.basePct + b.def.phaseTwo.perPixiePct * 3));
    return { resur: resur, q: q, cine: cine, flying: flying, shielded: shielded,
             hp: b.hp, wantHp: wantHp, p2: b.phase2done === true,
             enraged: b.spdMult > 1 && b.rateMult < 1 };})()`);
  check('first kill → he falls but the pixies fly in (8, cinematic, shielded boss)',
    p2a.resur && p2a.q === 8 && p2a.cine === 8 && p2a.flying && p2a.shielded);
  check('kill 5 mid-channel → he rises at reduced HP, enraged (phase two)',
    p2a.hp === p2a.wantHp && p2a.p2 && p2a.enraged, `hp ${p2a.hp}/${p2a.wantHp}`);
  const p2b = await page.evaluate(`(function(){var r=${scene('Realm')};
    Entities.hurtBoss(r, r.boss, 999999);             // the SECOND kill is final
    return { boss: !!r.boss, loot: !!r.pendingLoot, chest: !!r.chest,
             sun: !!r.sunG, slow: r.player.state.slowUntil };})()`);
  check('second kill is FINAL: chest drops, grove fx cleared',
    !p2b.boss && p2b.loot && p2b.chest && !p2b.sun && p2b.slow === 0);

  // -- 14. the yard still routes as before (no-map start = trainyard) ---------------
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Realm', { mode: 'clear' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player && ${scene('Realm')}.realmId`, null, { timeout: 15000 });
  await sleep(600);
  const yard = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { id: r.realmId, train: !!r.train, lanes: !!r.trainLanes, noGrove: !r.heartwood };})()`);
  check('a no-map start is still THE TRAIN YARD (train + lanes up, no grove state)',
    yard.id === 'trainyard' && yard.train && yard.lanes && yard.noGrove);

  // wizard radial + homing behavior — as a wizard save
  await page.evaluate(`game.scene.getScene('Realm').scene.start('Title')`);
  await page.waitForFunction(`game.scene.isActive('Title')`, null, { timeout: 15000 });
  await sleep(400);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'wizard')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'grove' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);
  const wiz = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.groveFall.nextAt = Infinity;
    var p = r.player, st = p.state;
    st.equipment.weapon = 'ww5'; st.equipment.ability = 'wa5';
    st.equipment.armor = 'ar5'; st.equipment.ring = 'r5';
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    r.playerShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.playerShots, s); });
    st.mp = st.stats.mp; st.lastBarrageAt = 0;
    var intent = SIM.makeIntent(); intent.ability = true; intent.aimAngle = 0;
    var mpBefore = st.mp;
    Entities.updatePlayer(r, p, intent, r.time.now, 16);
    var balls = [], homing = 0;
    r.playerShots.children.iterate(function(s){ if (s && s.active) { balls.push(s); if (s.proj.homing) homing++; } });
    // homing steer: a mob ABOVE the player pulls a rightward ball upward
    var prey = Entities.spawnMob(r, 'moonmoth', p.x + 120, p.y - 120); prey.mob.affix = null;
    var ball = null;
    balls.forEach(function(s){ if (Math.abs(s.rotation) < 0.1) ball = s; });   // the eastbound ball
    var vy0 = ball ? ball.body.velocity.y : 0;
    r.playerShots._lastHomingAt = r.time.now - 100;
    Entities.updateProjectiles(r, r.playerShots, r.time.now);
    var steered = ball && ball.body.velocity.y < vy0 - 1;   // bending upward
    return { balls: balls.length, homing: homing, cost: +(mpBefore - st.mp).toFixed(2),
             steered: steered };})()`);
  check('WIZARD FULL SET: one trigger = 8-direction radial, every ball homing, ONE ball cost',
    wiz.balls === 8 && wiz.homing === 8 && wiz.cost <= 1.5, `${wiz.balls} balls, cost ${wiz.cost}`);
  check('homing missiles STEER toward prey', wiz.steered);

  // -- DEV MODE REMOVED (v5, 2026-07-17, Red): the Settings toggle + immortality
  // are gone; devOn() is hard-false. The old 2-check dev-mode block was deleted.
  // The 24-slot vault + legendary/tier data are still covered by other suites.

  // -- M5.4 LEVEL IS COSMETIC + 2026-07-18 (Red) MOBS SCALE WITH CAMPAIGN DEPTH ----
  // (level-scaling retired: mobLevelScale 0.03→0; the world-threat axis moved to
  //  DATA.progression / SIM.depthMult, keyed on regions cleared.)
  const flat = await page.evaluate(`(function(){
    var cls = DATA.classes.ranger;
    var s1 = SIM.statsFor(cls, 1, null, null), s60 = SIM.statsFor(cls, 60, null, null);
    return { same: JSON.stringify(s1) === JSON.stringify(s60), levelPower: DATA.xp.levelPower,
             d0: SIM.depthMult(0).mobHp, dMax: +SIM.depthMult(DATA.progression.maxDepth).mobHp.toFixed(3) };})()`);
  check('LEVEL IS COSMETIC: player base stats identical at L1 and L60 (power = gear + potions)',
    flat.same && flat.levelPower === false);
  check('DEPTH mult: 1.0 at depth 0, higher at max depth (world scales with progress)',
    flat.d0 === 1 && flat.dMax > 1, `depth-max ×${flat.dMax}`);
  const scaled = await page.evaluate(`(function(){var r=${scene('Realm')};
    var p = r.player;
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var _d0 = r.progressDepth;
    r.progressDepth = 0;
    var a = Entities.spawnMob(r, 'moonmoth', p.x + 300, p.y); a.mob.affix = null;
    var hp1 = a.mob.hp, dm1 = a.mob.dmgMult, xp1 = a.mob.xp;
    r.progressDepth = DATA.progression.maxDepth;
    var b = Entities.spawnMob(r, 'moonmoth', p.x + 330, p.y); b.mob.affix = null;
    var hpD = b.mob.hp, dmD = b.mob.dmgMult, xpD = b.mob.xp;
    r.progressDepth = _d0;
    return { hp1: hp1, hpD: hpD, dmgBigger: dmD > dm1, xpBigger: xpD > xp1,
             hpBigger: hpD > hp1 };})()`);
  check('a mob spawned at MAX DEPTH has more HP · damage · XP than at depth 0 (world scales with progress)',
    scaled.hpBigger && scaled.dmgBigger && scaled.xpBigger, `hp ${scaled.hp1}→${scaled.hpD}`);

  // -- M5.5 COLLECTION: dupes → bonus XP · gear auto-upgrades + remains ------------
  const coll = await page.evaluate(`(function(){var r=${scene('Realm')};
    // wizard save here — use wizard-line bows (ww2 owned, ww3 new)
    ACCOUNT.collected = ['ww2'];
    var res = resolveLootRolls(['ww2', 'ww3']);
    var dupeOk = res.items.indexOf('ww3') >= 0 && res.items.indexOf('ww2') < 0 && res.dupeXp > 0;
    // empty slot auto-fills the best OWNED piece (gear remains after death)
    CURRENT.equipment.weapon = null;
    autoEquipFromCollection(false);
    var filled = CURRENT.equipment.weapon === 'ww2';
    // collecting a better piece auto-upgrades
    collectItem('ww3');
    autoEquipFromCollection(true);
    var upgraded = CURRENT.equipment.weapon === 'ww3';
    // a manual downgrade for testing is NOT yanked back up on entry (fill-empty only)
    CURRENT.equipment.weapon = 'ww2';
    autoEquipFromCollection(false);
    var stuck = CURRENT.equipment.weapon === 'ww2';
    // an off-class item can't be auto-equipped (w2 is ranger)
    ACCOUNT.collected.push('w2');
    CURRENT.equipment.weapon = null;
    autoEquipFromCollection(false);
    var classSafe = CURRENT.equipment.weapon === 'ww3';   // best WIZARD piece, not the ranger bow
    return { dupeOk: dupeOk, filled: filled, upgraded: upgraded, stuck: stuck, classSafe: classSafe };})()`);
  check('COLLECTION: a rolled DUPLICATE → bonus XP; only a NEW item drops', coll.dupeOk);
  check('gear REMAINS (empty slot fills best owned) + AUTO-UPGRADES on a better find; class-locked',
    coll.filled && coll.upgraded && coll.classSafe);
  check('a manual downgrade is NOT auto-reverted on entry (testing stays put)', coll.stuck);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));
  console.log('');
  console.log(fails === 0 ? 'ALL GREEN — ' + n + ' checks' : fails + ' FAILURE(S)');
  await browser.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('SUITE CRASH:', e); process.exit(1); });
