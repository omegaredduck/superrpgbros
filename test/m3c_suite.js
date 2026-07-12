// M3c headless verification suite — AFFIX ENGINE v2 (E9): SPLITTING/EVOLVING/
// PACK LEADER un-gated · split only rolls on shooters · bolts fork mid-flight
// (children never re-split) · evolution triggers once on surviving a hit ·
// pack leader skews the director to casters · champion kills add bounty rolls
// to the boss chest (capped). Fails on ANY console error.
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

  // -- 0. boot; portals are SPACE-activated (standing on one does NOT enter) ----
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`${scene('Title')}.chooseSlot(1)`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(600);                              // long enough that walk-in WOULD have fired
  const gated = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { stillNexus: game.scene.isActive('Nexus') && !n.entering,
             prompt: n.portalPrompt ? n.portalPrompt.text : null };})()`);
  check('standing on a portal does NOT enter — the prompt asks for SPACE',
    gated.stillNexus && gated.prompt && gated.prompt.indexOf('SPACE') >= 0, gated.prompt);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);

  // -- 1. all five affixes are live (no gates left in the data) -----------------
  const gates = await page.evaluate(`(function(){
    var gated = 0, n = 0;
    for (var k in DATA.affixes.mob) { n++; if (DATA.affixes.mob[k].m3 || DATA.affixes.mob[k].m5) gated++; }
    return { n: n, gated: gated };})()`);
  check('all 5 mob affixes un-gated (E9 v2)', gates.n === 5 && gates.gated === 0);

  // -- 2. SPLITTING refuses chasers, takes on shooters ----------------------------
  const splitRoll = await page.evaluate(`(function(){var r=${scene('Realm')};
    var slime = Entities.spawnMob(r, 'slime', 100, 100, 'split');
    var spit  = Entities.spawnMob(r, 'spitter', 140, 100, 'split');
    return { slimeAffix: slime.mob.affix, spitAffix: spit.mob.affix && spit.mob.affix.name };})()`);
  check('SPLITTING never lands on a chaser (needs projectiles)', splitRoll.slimeAffix === null);
  check('SPLITTING lands on a shooter', splitRoll.spitAffix === 'SPLITTING');

  // -- 2b. champion NAMEPLATE: appears on the affixed mob, follows it, dies with it
  const plate = await page.evaluate(`(function(){var r=${scene('Realm')};
    var m = Entities.spawnMob(r, 'brute', r.player.x + 250, r.player.y + 250, 'tanky');
    var out = { born: !!m.nameTag, text: m.nameTag && m.nameTag.text };
    Entities.updateMob(r, m, r.player, r.time.now);       // one tick — the tag follows
    out.follows = m.nameTag && Math.abs(m.nameTag.x - m.x) < 1 && m.nameTag.y < m.y;
    Entities.hurtMob(r, m, 99999, r.time.now);            // death clears it
    out.cleared = !m.nameTag;
    var plain = Entities.spawnMob(r, 'brute', r.player.x + 280, r.player.y + 280);
    // (6% champion roll: tag iff affixed — either way tag presence must match)
    out.plainClean = !!plain.nameTag === !!plain.mob.affix;
    return out;})()`);
  check('champion nameplate: born with the affix, floats above, follows the mob',
    plate.born && plate.text === 'TANKY' && plate.follows);
  check('nameplate dies with the champion; plain mobs stay untagged', plate.cleared && plate.plainClean);

  // -- 3. the splitter's bolt forks mid-flight ------------------------------------
  const fork = await page.evaluate(`(function(){var r=${scene('Realm')};
    // clear enemy shots for a clean count
    r.enemyShots.children.iterate(function(s){ if (s && s.active) Entities.killProjectile(r.enemyShots, s); });
    var m = null;
    r.mobs.children.iterate(function(mm){ if (mm && mm.active && mm.mob.key === 'spitter' && mm.mob.affix) m = mm; });
    m.setPosition(r.player.x + 120, r.player.y);          // in range
    m.mob.lastShotAt = -99999;
    Entities.updateMob(r, m, r.player, r.time.now);       // fires 1 bolt
    var bolt = null, live = 0;
    r.enemyShots.children.iterate(function(s){ if (s && s.active) { live++; bolt = s; } });
    var marked = bolt && !!bolt.proj.splitAt && bolt.proj.split.shots === 2;
    bolt.proj.splitAt = 1;                                // force the fork NOW (0 is falsy = unmarked)
    Entities.updateProjectiles(r, r.enemyShots, r.time.now);
    var children = 0, resplitters = 0;
    r.enemyShots.children.iterate(function(s){ if (s && s.active) { children++; if (s.proj.splitAt) resplitters++; } });
    return { before: live, marked: marked, after: children, resplit: resplitters };})()`);
  check('champion bolt carries split data (2 shots, fork scheduled)', fork.before === 1 && fork.marked);
  check('bolt forks into 2 children; children never re-split', fork.after === 2 && fork.resplit === 0);

  // -- 4. EVOLVING: one-time mid-fight evolution on surviving a hit ------------------
  const evo = await page.evaluate(`(function(){var r=${scene('Realm')};
    var m = Entities.spawnMob(r, 'slime', r.player.x + 300, r.player.y + 300, 'evolving');
    var hpAtSpawn = m.mob.hp, scale0 = m.scaleX, xp0 = m.mob.xp;
    var hits = 0;
    while (!m.mob.evolved && hits < 40 && m.mob.hp > 1) { Entities.hurtMob(r, m, 1, r.time.now + hits); hits++; }
    var out = { evolved: m.mob.evolved, hits: hits,
                hpAtSpawn: hpAtSpawn, hpNow: m.mob.hp,
                bigger: m.scaleX > scale0, worthMore: m.mob.xp > xp0,
                expectedHp: Math.round(DATA.mobs.slime.hp * DATA.affixes.mob.evolving.evolve.hpMult) };
    // it must NOT evolve twice — keep hitting, hp only goes down now
    var hpAfterEvolve = m.mob.hp;
    for (var i = 0; i < 10 && m.mob.hp > 1; i++) Entities.hurtMob(r, m, 1, r.time.now + 100 + i);
    out.noSecond = m.mob.hp < hpAfterEvolve;
    return out;})()`);
  check('EVOLVING champion evolves mid-fight (fresh bigger HP pool)',
    evo.evolved && evo.hpNow <= evo.expectedHp && evo.hpNow > evo.hpAtSpawn - evo.hits,
    `after ${evo.hits} hits, hp ${evo.hpAtSpawn}→${evo.expectedHp}`);
  check('evolution grows the mob + its bounty, and only fires ONCE',
    evo.bigger && evo.worthMore && evo.noSecond);

  // -- 5. PACK LEADER skews the director to casters -----------------------------------
  const skew = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.startedAt = r.time.now - 80000;                     // all 4 mobs unlocked
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var leader = Entities.spawnMob(r, 'slime', r.player.x + 400, r.player.y + 400, 'roles');
    r.directorSpend(); r.directorSpend();
    var casters = 0, melee = 0;
    r.mobs.children.iterate(function(m){ if (!m || !m.active || m === leader) return;
      if (m.mob.def.shoot) casters++; else melee++; });
    var out = { leader: leader.mob.affix && leader.mob.affix.name, casters: casters, melee: melee };
    // leader dies → the skew lifts
    Entities.hurtMob(r, leader, 99999, r.time.now);
    r.mobs.children.iterate(function(m){ if (m && m.active) { m.body.enable=false; r.mobs.killAndHide(m); } });
    var tries = 0, sawMelee = false;
    while (tries < 6 && !sawMelee) { r.directorSpend();
      r.mobs.children.iterate(function(m){ if (m && m.active && !m.mob.def.shoot) sawMelee = true; });
      tries++; }
    out.liftedEventually = sawMelee;
    return out;})()`);
  check('while a PACK LEADER lives, the director spawns only casters',
    skew.leader === 'PACK LEADER' && skew.casters > 0 && skew.melee === 0,
    `${skew.casters} casters, ${skew.melee} melee`);
  check('leader down → the mix returns', skew.liftedEventually);

  // -- 6. CHAMPION BOUNTY: champion kills add rolls to the boss chest (capped) ---------
  const bounty = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.championKills = 5;                                  // over the cap of 3
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'slime', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
    return { portal: !!r.bossPortal, champs: r.championKills };})()`);
  check('quota met → boss portal (bounty counter intact)', bounty.portal && bounty.champs >= 5,
    `${bounty.champs} champions down`);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await sleep(300);
  await page.keyboard.press('Enter');                     // dismiss the scouter
  await sleep(200);
  const chest = await page.evaluate(`(function(){var r=${scene('Realm')};
    Entities.hurtBoss(r, r.boss, 99999);
    return null;})()`);
  await sleep(200);
  const rolls = await page.evaluate(`(function(){var r=${scene('Realm')};
    var base = DATA.dropTables[DATA.bosses.grovekeeper.lootTable].rolls;
    var cap = DATA.affixes.championBounty.cap;
    return { n: r.pendingLoot.items.length, expected: base + cap,
             real: r.pendingLoot.items.every(function(k){ return !!DATA.items[k]; }) };})()`);
  check('boss chest = base rolls + champion bounty, CAPPED (2 + 3, all real items)',
    rolls.n === rolls.expected && rolls.real, `${rolls.n} items`);

  // -- 7. zero console errors -----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
