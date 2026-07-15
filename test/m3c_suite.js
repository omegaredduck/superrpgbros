// M3c headless verification suite — AFFIX ENGINE v2 (E9) + M3.5 REALM CONSOLE:
// plaza boots EMPTY · console prompt/board · placeholder affixes toggle VISIBLY
// (inert until M5) · SPAWN materializes a one-shot portal wearing the affixes ·
// SPACE gating unchanged · affixes ride into the realm HUD as preview · then
// SPLITTING/EVOLVING/PACK LEADER behaviors · champion bounty (capped).
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

  // -- 0. boot; M3.5 REALM CONSOLE: no portal exists until you spawn one -----------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  const empty = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var dark = n.ringLights.every(function(l){ return l.alpha < 1; });
    return { portals: n.plazaPortals.length, canonical: !!n.portal, console: !!n.consolePos,
             ring: n.ringLights.length, dark: dark, flow: !!n.flowTimer };})()`);
  check('M3.5 the works boot DORMANT — platform + console present, zero portals',
    empty.portals === 0 && !empty.canonical && empty.console);
  check('M3.5 dormant state: all 8 ring lights dark, no conduit flow',
    empty.ring === 8 && empty.dark && !empty.flow);

  // walk to the console → it brightens (NO floating text — footer carries the
  // controls); open the board and slot affixes
  // (m4n+ hi-fi chamber: the machine's BASE scale is ~1, not 3 — measure the
  // brighten as far-vs-near delta instead of an absolute classic-era number)
  await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.player.setPosition(n.consolePos.x - 400, n.consolePos.y - 200);})()`);
  await sleep(600);                                       // let update() see the far position
  const farC = await page.evaluate(`${scene('Nexus')}.consoleSprite.scaleX`);
  await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.player.setPosition(n.consolePos.x, n.consolePos.y);})()`);
  await sleep(600);
  const nearC = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { scale: n.consoleSprite.scaleX,
             noPrompts: !n.consolePrompt && !n.portalPrompt };})()`);
  check('M3.5 in range the console brightens; NO floating prompt text (footer has SPACE hint)',
    nearC.scale > farC && nearC.noPrompts, 'scale ' + farC + ' → ' + nearC.scale);

  // -- 0a2. station labels carry their hotkeys; P opens the PORTAL MACHINE ---------
  const labels = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var texts=[]; n.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return texts.join(' | ');})()`);
  check('station labels: VAULT (V) · BESTIARY (B) · PORTAL MACHINE (P)',
    labels.indexOf('VAULT (V)') >= 0 && labels.indexOf('BESTIARY (B)') >= 0 &&
    labels.indexOf('PORTAL MACHINE (P)') >= 0);
  // M3.8: P walks the character to the machine first, THEN the board opens
  await page.keyboard.press('p');
  try {
    await page.waitForFunction(`(function(){var n=${scene('Nexus')}; return !!n.consoleUi;})()`,
      null, { timeout: 30000 });
  } catch (e) { /* judged below */ }
  const pkey = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var open = !!n.consoleUi;
    if (open) n.toggleConsole();
    return open;})()`);
  check('P walks to the portal machine and opens the board', pkey);

  // -- 0b. M3.6 BESTIARY: field notes read straight from data.js -------------------
  // M4.7: the book is biome-scoped now — the TRAIN YARD's 8 mobs + ALL bosses
  // (Grovekeeper + Conductor + M5.6 Gravekeeper, all listed in the index) = 11.
  const beast = await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.toggleBestiary();
    var t1=[]; n.bestiaryUi.forEach(function(c){ if (c.text) t1.push(c.text); });
    var first = t1.join(' | ');
    var nMobs = DATA.biomes[DATA.realm.biome].mobs.length;
    for (var i = 0; i < nMobs; i++) n.bestiaryNav(1);                          // → first boss
    var t2=[]; n.bestiaryUi.forEach(function(c){ if (c.text) t2.push(c.text); });
    var boss = t2.join(' | ');
    n.bestiaryNav(1);                                                          // → the Conductor
    var t3=[]; n.bestiaryUi.forEach(function(c){ if (c.text) t3.push(c.text); });
    var boss2 = t3.join(' | ');
    n.bestiaryNav(1);                                                          // → M5.6 the Gravekeeper
    var t4=[]; n.bestiaryUi.forEach(function(c){ if (c.text) t4.push(c.text); });
    var boss3 = t4.join(' | ');
    n.bestiaryNav(1);                                                          // wraps → entry 1
    var wrapped = n.bestiaryIndex === 0;
    n.toggleBestiary();
    var closed = !n.bestiaryUi;
    return { entries: n.bestiaryEntries().length, first: first, boss: boss, boss2: boss2, boss3: boss3,
             wrapped: wrapped, closed: closed };})()`);
  check('M3.6 bestiary opens on the YARD roster (8 mobs + 3 bosses = 11 entries)',
    beast.entries === 11 && beast.first.indexOf('Coal Golem') >= 0 && beast.first.indexOf('CHASER') >= 0 &&
    beast.first.indexOf('HP') >= 0, beast.entries + ' entries');
  check('M3.6 arrows navigate the bosses: Grovekeeper · Conductor · Gravekeeper (title + hints)',
    // M5.0: the Grovekeeper is WARDEN OF THE HEARTWOOD; M5.6 adds the Gravekeeper
    beast.boss.indexOf('Grovekeeper') >= 0 && beast.boss.indexOf('HEARTWOOD') >= 0 &&
    beast.boss2.indexOf('Conductor') >= 0 && beast.boss2.indexOf('STYX') >= 0 &&
    beast.boss2.indexOf('GHOST TRACK') >= 0 &&
    beast.boss3.indexOf('Gravekeeper') >= 0 && beast.boss3.indexOf('HOLLOW EARTH') >= 0);
  check('M3.6 navigation wraps around; B/ESC closes the book', beast.wrapped && beast.closed);

  // -- 0c. M3.7/3.8 RECORDS wall screen: login TYPES the readout out; live data,
  // no slot number, no floating header
  const midType = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { len: n.recordsText.text.length, typing: !!n.typeTimer };})()`);
  // m4n+: ONE combined always-on readout — '· REALMS n · CLOSED n' (the old
  // two-page 'REALMS CLOSED' literal is retired)
  await page.waitForFunction(`(function(){var n=${scene('Nexus')};
    return !n.typeTimer && n.recordsText.text.indexOf('CLOSED') >= 0;})()`,
    null, { timeout: 30000 });
  check('M3.8 login boots the glass EMPTY then types the readout out', midType.typing || midType.len > 0);
  const records = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var texts=[]; n.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    var blob = texts.join(' | ');
    n.toggleGraveyard();
    var open = !!n.gyUi;
    n.toggleGraveyard();
    return { screen: n.recordsText.text, blob: blob, opens: open };})()`);
  check('M3.7 wall screen carries the readout (class/deaths/best/closed), NO slot number',
    records.screen.indexOf('RANGER LV') >= 0 && records.screen.indexOf('DEATHS') >= 0 &&
    records.screen.indexOf('REALMS') >= 0 && records.screen.indexOf('CLOSED') >= 0 &&
    records.screen.indexOf('Slot') < 0 && records.blob.indexOf('Slot ') < 0, records.screen);
  check('M3.7 the screen opens the full RECORDS page (graveyard merged)', records.opens);

  // -- 0d. M3.8 the SWITCH (m4n+ combined readout: the lever flips + kicks a
  // wire-pulse burst + RE-TYPES the same combined readout — no second page) ---------
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.setRecordsMode('grave');})()`);
  const sw = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var down = n.leverSprite.texture.key;
    var chip = n.leverLabel.text;                        // v3: shows the OTHER page's key
    var retype = !!n.typeTimer;                          // the throw re-types the glass
    n.setRecordsMode('records');
    var chipBack = n.leverLabel.text;
    return { lever: down, chip: chip, chipBack: chipBack, retype: retype };})()`);
  check('M3.8 lever throw flips it down and RE-TYPES the combined readout',
    sw.lever.toLowerCase().indexOf('down') >= 0 && sw.retype);   // classic 'lever_down' or hi-fi 'leverHiDown' (m4n)
  check('M3.8 v3 hotkey chip above the lever shows the flip key: (R) when down, (G) when up',
    sw.chip === '(R)' && sw.chipBack === '(G)');
  await page.waitForFunction(`(function(){var n=${scene('Nexus')}; return !n.typeTimer;})()`,
    null, { timeout: 30000 });

  // -- 0e. M3.8 WALK-TO-INTERACT: a hotkey walks the character to the station, THEN opens
  await page.evaluate(`(function(){var n=${scene('Nexus')};
    var st = n.stations.bestiary;
    n.player.setPosition(st.x - 70, st.y + 40);})()`);   // a short stroll away
  await page.keyboard.press('b');
  await sleep(300);
  const walking = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { walking: !!n.autoWalk, notYetOpen: !n.bestiaryUi };})()`);
  await page.waitForFunction(`(function(){var n=${scene('Nexus')};
    return !!n.bestiaryUi;})()`, null, { timeout: 30000 });
  const arrived = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var st = n.stations.bestiary;
    var atSpot = Math.hypot(n.player.x - st.x, n.player.y - st.y) < 8;
    n.toggleBestiary();
    return atSpot;})()`);
  check('M3.8 hotkey does NOT open instantly — the character walks the line first',
    walking.walking && walking.notYetOpen);
  check('M3.8 arrival just below the station auto-opens the window', arrived);
  const board = await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.toggleConsole();
    n.consoleToggleAffix('apex'); n.consoleToggleAffix('hordes');
    var texts=[]; n.consoleUi.forEach(function(c){ if (c.text) texts.push(c.text); });
    var blob = texts.join(' | ');
    return { open: !!n.consoleUi, slotted: n.consoleAffixes.slice(),
             showsOn: blob.indexOf('[x] APEX PREDATORS') >= 0 && blob.indexOf('[x] HORDES') >= 0,
             showsOff: blob.indexOf('[ ] ESCALATING THREATS') >= 0,
             counter: blob.indexOf('2/' + DATA.console.maxAffixes) >= 0 };})()`);
  check('M3.5 console board: toggled affixes VISIBLY slotted ([x]), others [ ], counter right',
    board.open && board.slotted.length === 2 && board.showsOn && board.showsOff && board.counter);

  // -- M4.9: the MAP SELECTOR dropdown — real map selectable, ??? sealed placeholders locked
  const mapsel = await page.evaluate(`(function(){var n=${scene('Nexus')};
    // collapsed: shows the current real map, and the MAP label
    var t0=[]; n.consoleUi.forEach(function(c){ if (c.text) t0.push(c.text); });
    var collapsed = t0.join(' | ');
    var startMap = n.consoleMap;
    // expand it → the ??? sealed placeholders appear
    n.toggleMapDropdown();
    var t1=[]; n.consoleUi.forEach(function(c){ if (c.text) t1.push(c.text); });
    var expanded = t1.join(' | ');
    // try to pick a LOCKED map → refused (stays on the real one)
    n.consoleSetMap('sealed1');
    var afterLocked = n.consoleMap;
    // pick the real map explicitly → accepted, dropdown collapses
    n.toggleMapDropdown();
    n.consoleSetMap('trainyard');
    return { hasLabel: collapsed.indexOf('MAP') >= 0,
             showsReal: collapsed.indexOf('THE TRAIN YARD') >= 0,
             sealedHidden: collapsed.indexOf('SEALED') < 0,          // ??? only shows when expanded
             sealedShown: expanded.indexOf('SEALED') >= 0,
             lockedRefused: afterLocked === startMap && startMap === 'trainyard',
             chosen: n.consoleMap, closed: !n.mapDropdownOpen };})()`);
  check('M4.9 MAP dropdown: collapsed shows the real map; expands to ??? SEALED placeholders',
    mapsel.hasLabel && mapsel.showsReal && mapsel.sealedHidden && mapsel.sealedShown);
  check('M4.9 locked ??? maps are NOT selectable; a real map is + collapses the dropdown',
    mapsel.lockedRefused && mapsel.chosen === 'trainyard' && mapsel.closed);
  // the run cfg carries the chosen map
  const mapCfg = await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.consoleSpawnPortal(true);
    var cfg = game.registry.get('pendingPortal');
    return cfg && cfg.map;})()`);
  check('M4.9 the spawned portal cfg carries the selected map', mapCfg === 'trainyard');
  // reopen the board for the following checks (spawn closed it)
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(n.portal){n.despawnPortal&&n.despawnPortal();} if(!n.consoleUi) n.toggleConsole();})()`);

  // spawn → the full charge-up cinematic: console powers the platform, THEN the
  // portal exists (headless runs ~5× slow, so the ~2.3s cinematic gets ~30s)
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.consoleSpawnPortal();})()`);
  const charging = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { closed: !n.consoleUi, charging: n.charging, noPortalYet: !n.portal,
             pending: !!game.registry.get('pendingPortal') };})()`);
  check('M3.5 SPAWN starts the CHARGE-UP: board closes, works charging, portal not yet born',
    charging.closed && charging.charging && charging.noPortalYet && charging.pending);
  await page.waitForFunction(`(function(){var n=${scene('Nexus')}; return !!n.portal && !n.charging;})()`,
    null, { timeout: 30000 });
  const spawned = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var lit = n.ringLights.every(function(l){ return l.tintTopLeft !== 0x29366f; });
    return { portal: !!n.portal, lit: lit, flow: !!n.flowTimer,
             green: n.portal.tintTopLeft === DATA.modes.clear.color,
             well: n.wellGlow.tintTopLeft === DATA.modes.clear.color && n.wellGlow.alpha > 0.35,
             noLabel: !n.spawnedPortal.label };})()`);
  check('M3.5 charge-up completes: portal born, all 8 ring lights lit, conduit flowing',
    spawned.portal && spawned.lit && spawned.flow);
  check('M3.5 the run reads through LIGHT, not text: portal + well glow in mode color, no label',
    spawned.green && spawned.well && spawned.noLabel);

  // standing on it still does NOT enter (M3 gating unchanged, now promptless)
  await page.evaluate(`(function(){var n=${scene('Nexus')}; n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(600);                              // long enough that walk-in WOULD have fired
  const gated = await page.evaluate(`(function(){var n=${scene('Nexus')};
    return { stillNexus: game.scene.isActive('Nexus') && !n.entering };})()`);
  check('standing on a portal does NOT enter — SPACE-gated (silently; footer has the hint)',
    gated.stillNexus);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);
  const carried = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { affixes: r.mapAffixes.slice(),
             hud: r.affixText ? r.affixText.text : '',
             consumed: !game.registry.get('pendingPortal') };})()`);
  check('M3.5 affixes ride into the realm + HUD shows them as PREVIEW',
    carried.affixes.length === 2 && carried.hud.indexOf('APEX PREDATORS') >= 0 &&
    carried.hud.indexOf('preview') >= 0, carried.hud);
  check('M3.5 the portal was ONE-SHOT — consumed on entry (registry cleared)', carried.consumed);

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
  // M4.7: wait out the Conductor's train-arrival cinematic
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 60000 });
  await page.keyboard.press('Enter');                     // dismiss the scouter
  await sleep(200);
  const chest = await page.evaluate(`(function(){var r=${scene('Realm')};
    Entities.hurtBoss(r, r.boss, 99999);
    return null;})()`);
  await sleep(200);
  const rolls = await page.evaluate(`(function(){var r=${scene('Realm')};
    var base = DATA.dropTables[DATA.bosses[DATA.realm.boss].lootTable].rolls;
    var cap = DATA.affixes.championBounty.cap;
    // M5.5: total rolls are conserved as NEW items + DUPLICATE (bonus-XP) rolls
    var total = r.pendingLoot.items.length + (r.pendingLoot.dupes || []).length;
    return { total: total, expected: base + cap,
             real: r.pendingLoot.items.every(function(k){ return !!DATA.items[k]; }) };})()`);
  check('boss chest = base rolls + champion bounty, CAPPED (2 + 3, all real items or dupe-XP)',
    rolls.total === rolls.expected && rolls.real, `${rolls.total} rolls`);

  // -- 7. zero console errors -----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
