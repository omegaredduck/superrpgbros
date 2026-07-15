// M3b headless verification suite — EQUIPMENT + NEXUS VAULT (M3 second half):
// schema v2→v3 migration (lossless + sanitizing) · item/drop-table data
// integrity · SIM equipment math (gear pushes past caps, weapon/ability mods)
// · boss chest rolls gear, TAKE equips + persists, swap-back, ENTER takes
// upgrades · vault bank/equip/swap, full-vault guard · gear dies with the
// character, the VAULT SURVIVES DEATH (the gate clause) · zero console errors.
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

  // -- 1. TM-4: a v2 (M2-era) save migrates losslessly to v3 --------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 15000 });
  await page.evaluate(`localStorage.setItem('srb_save_2', JSON.stringify({
    v: 2,
    account: { unlockedClasses: ['ranger'], graveyard: [],
               potions: { hp: 2, mp: 0, att: 1, def: 0, spd: 0, dex: 0 },
               records: { bestLevel: 9, deaths: 3, totalKills: 500, realmsEntered: 12, realmsClosed: 2 } },
    vault: [], character: { cls: 'ranger', level: 9, xp: 40,
      potionsDrunk: { hp: 1, mp: 0, att: 0, def: 0, spd: 0, dex: 0 } },
    meta: { createdAt: 1, savedAt: 2 }
  }))`);
  const mig = await page.evaluate(`SAVE.load(2)`);
  check('v2 save loads (not flagged corrupt)', mig.ok === true);
  check('migrated to v4: equipment slots added empty, vault kept', mig.ok && mig.data.v === 4 &&
    mig.data.character.equipment && mig.data.character.equipment.weapon === null &&
    Array.isArray(mig.data.vault) && mig.data.vault.length === 0);
  check('migration is lossless (potions/records/level kept)', mig.ok &&
    mig.data.account.potions.hp === 2 && mig.data.account.records.totalKills === 500 &&
    mig.data.character.level === 9 && mig.data.character.potionsDrunk.hp === 1);

  // -- 2. sanitizer: unknown/wrong-slot item keys are dropped, real ones kept ----
  const dirty = await page.evaluate(`(function(){
    var d = SAVE.blank();
    d.vault = ['w1', 'NOT_AN_ITEM', 'r2'];
    d.character.equipment.weapon = 'ar1';                 // armor in the weapon slot
    d.character.equipment.ring = 'r0';
    SAVE.save(2, d);
    var r = SAVE.load(2);
    return { ok: r.ok, vault: r.data.vault, weapon: r.data.character.equipment.weapon,
             ring: r.data.character.equipment.ring };})()`);
  check('sanitizer drops junk vault keys, keeps real items', dirty.ok &&
    dirty.vault.length === 2 && dirty.vault[0] === 'w1' && dirty.vault[1] === 'r2');
  check('sanitizer clears wrong-slot equipment, keeps correct', dirty.weapon === null && dirty.ring === 'r0');

  // -- 2b. M4.6: v3→v4 key renumbering + class-lock reflavor migration ------------
  const v3mig = await page.evaluate(`(function(){
    localStorage.setItem('srb_save_3', JSON.stringify({ v: 3,
      account: { unlockedClasses: ['ranger','wizard','knight'], graveyard: [],
                 potions: { hp:0,mp:0,att:0,def:0,spd:0,dex:0 },
                 records: { bestLevel:5, deaths:0, totalKills:10, realmsEntered:1, realmsClosed:1 } },
      vault: ['w3', 'r1'],
      character: { cls: 'wizard', level: 5, xp: 0,
                   potionsDrunk: { hp:0,mp:0,att:0,def:0,spd:0,dex:0 },
                   equipment: { weapon: 'w1', ability: 'a2', armor: 'ar1', ring: null } },
      meta: { createdAt: 1, savedAt: 2 } }));
    var r = SAVE.load(3);
    return r.ok && { v: r.data.v, vault: r.data.vault, eq: r.data.character.equipment };})()`);
  check('v3→v4: vault keys renumbered, identity kept (w3→w4 Grovepiercer, r1→r2)',
    v3mig && v3mig.v === 4 && v3mig.vault[0] === 'w4' && v3mig.vault[1] === 'r2');
  check("v3→v4: a wizard's old ranger gear REFLAVORS to her line (w1→w2→ww2, a2→a3→wa3), armor untouched",
    v3mig && v3mig.eq.weapon === 'ww2' && v3mig.eq.ability === 'wa3' && v3mig.eq.armor === 'ar2');

  // -- 3. data integrity: 48 items — 6 tiers × 3 class weapon/ability lines + universal armor/rings
  const data = await page.evaluate(`(function(){
    var n = 0, bySlot = {}, bad = 0;
    for (var k in DATA.items) { n++;
      var it = DATA.items[k];
      bySlot[it.slot] = (bySlot[it.slot] || 0) + 1;
      if (DATA.equipSlots.indexOf(it.slot) < 0 || !DATA.tiers[it.tier] || !it.name || !it.desc || !it.texture) bad++;
    }
    var tableBad = 0;
    for (var t in DATA.dropTables) DATA.dropTables[t].entries.forEach(function(e){
      if (!DATA.items[e.item] || !(e.w > 0)) tableBad++; });
    return { n: n, bySlot: bySlot, bad: bad, tableBad: tableBad,
             bossTable: DATA.bosses.grovekeeper.lootTable, trialTable: DATA.modes.survival.lootTable };})()`);
  check('48 items — 18 weapons + 18 ability (6 tiers × 3 classes) + 6 armor + 6 rings, all well-formed',
    data.n === 48 && data.bad === 0 &&
    data.bySlot.weapon === 18 && data.bySlot.ability === 18 && data.bySlot.armor === 6 && data.bySlot.ring === 6);
  check('drop tables reference real items; boss + trial wired', data.tableBad === 0 &&
    data.bossTable === 'grovekeeper' && data.trialTable === 'trial');

  // -- 4. SIM equipment math (pure — TM-2 spot checks) ---------------------------
  const math = await page.evaluate(`(function(){
    var cls = DATA.classes.ranger;
    var eq = { weapon: 'w5', ability: 'a5', armor: 'ar5', ring: 'r5' };   // full LEGENDARY kit
    var maxPots = { hp: 99, mp: 99, att: 99, def: 99, spd: 99, dex: 99 };
    var bare = SIM.statsFor(cls, DATA.xp.cap, maxPots);   // capped everywhere (cap 60 since M4.6)
    var geared = SIM.statsFor(cls, DATA.xp.cap, maxPots, eq);
    var eb = SIM.equipBonus(eq);
    // M5.4: level is cosmetic, so base+potions may sit BELOW a cap — but GEAR is
    // applied AFTER the clamp, so it still pushes the total PAST the caps.
    return { atCap: geared.hp > cls.caps.hp && geared.def > cls.caps.def,
             pastCap: geared.hp === bare.hp + eb.hp && geared.def === bare.def + eb.def,
             ebHp: eb.hp, wDmg: SIM.weaponMod(eq).dmg,
             ab: SIM.abilityFor(DATA.abilities.volley, eq),
             abFloor: SIM.abilityFor(DATA.abilities.volley, eq).mpCost >= 4,
             abBare: SIM.abilityFor(DATA.abilities.volley, { ability: null }).mpCost,
             // M4.6: efficiency mods for the OTHER classes' channels
             tome: SIM.abilityFor(DATA.abilities.barrage, { ability: 'wa5' }).mpPerShot,
             tomeFloor: SIM.abilityFor(DATA.abilities.barrage, { ability: 'wa5' }).mpPerShot >= 0.5,
             horn: SIM.abilityFor(DATA.abilities.whirlwind, { ability: 'ka5' }).mpDrainPerSec,
             hornBare: SIM.abilityFor(DATA.abilities.whirlwind, { ability: null }).mpDrainPerSec };})()`);
  check('gear pushes stats PAST the caps (that is the point)', math.atCap && math.pastCap,
    `+${math.ebHp} hp over cap`);
  check('weaponMod + abilityFor: +15 dmg, volley 11 arrows @14 energy, floor respected',
    math.wDmg === 15 && math.ab.count === 11 && math.ab.mpCost === 14 && math.abFloor && math.abBare === 22);
  check('M4.6 efficiency mods: Tempest tome 1.25→0.6 MP/ball (floor 0.5) · Cataclysm horn 20→10 rage/s',
    Math.abs(math.tome - 0.6) < 1e-9 && math.tomeFloor && math.horn === 10 && math.hornBare === 20);

  // -- 5. fresh account → realm → boss → THE CHEST HAS GEAR ----------------------
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.scene.restart()`);
  await sleep(400);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm')`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  await sleep(400);
  await page.evaluate(`(function(){
    var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'slime', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(200);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  // M4.7: wait out the Conductor's train-arrival cinematic (boss + scouter)
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 60000 });
  await page.keyboard.press('Enter');                     // dismiss the scouter
  await sleep(200);
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 99999);})()`);
  await sleep(200);
  const drop = await page.evaluate(`(function(){var r=${scene('Realm')};
    var L = r.pendingLoot, total = L.items.length + (L.dupes || []).length;
    return { chest: !!r.chest, items: L.items, total: total,
             real: L.items.every(function(k){ return !!DATA.items[k]; }) };})()`);
  check('boss chest rolls gear from the drop table (2 rolls, real items or dupe-XP)',
    drop.chest && drop.total === 2 && drop.real, drop.items.join(', '));

  // -- 6. SPACE opens it: M5.5 COLLECTION — items auto-collected + auto-equipped ---
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.chest.x, r.chest.y);})()`);
  await sleep(150);
  await page.keyboard.press('Space');
  await sleep(250);
  const overlay = await page.evaluate(`(function(){var r=${scene('Realm')};
    var texts = []; r.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    var L = r.pendingLoot;
    var owned = (L.items || []).every(function(k){ return ACCOUNT.collected.indexOf(k) >= 0; });
    return { looting: r.looting, owned: owned,
             summary: texts.join(' | ').indexOf('LOOT') >= 0 };})()`);
  check('opening the chest COLLECTS its items (owned) and shows the summary',
    overlay.looting && overlay.owned && overlay.summary);
  const took = await page.evaluate(`(function(){var r=${scene('Realm')};
    var L = r.pendingLoot, ok = true;
    // every rolled item is either equipped (best) or a better piece is owned/equipped
    (L.items || []).forEach(function(k){
      var slot = DATA.items[k].slot, eq = CURRENT.equipment[slot];
      if (!eq || DATA.items[eq].tier < DATA.items[k].tier) ok = false;
    });
    var d = JSON.parse(localStorage.getItem('srb_save_1'));
    return { ok: ok, persisted: JSON.stringify(d.character.equipment) === JSON.stringify(CURRENT.equipment),
             collectedSaved: JSON.stringify(d.account.collected) === JSON.stringify(ACCOUNT.collected) };})()`);
  check('chest AUTO-EQUIPS the best owned gear + PERSISTS (equipment + collection)',
    took.ok && took.persisted && took.collectedSaved);

  // -- 7. ENTER closes the chest summary ------------------------------------------
  await page.keyboard.press('Enter');
  await sleep(250);
  const closed = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { closing: r.closing, looting: r.looting };})()`);
  check('ENTER closes the chest and moves to the realm-closed screen',
    closed.closing && !closed.looting);

  // -- 8. back to the nexus: V opens the vault; bank the weapon (THE GATE CLAUSE) --
  await page.keyboard.press('Enter');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await sleep(300);
  // M3.8: V walks the character to the vault first — stand there so it opens at once
  await page.evaluate(`(function(){var n=${scene('Nexus')};
    n.player.setPosition(n.stations.vault.x, n.stations.vault.y);})()`);
  await page.keyboard.press('v');
  await sleep(250);
  const vaultOpen = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var texts = []; n.children.list.forEach(function(c){ if (c.text) texts.push(c.text); });
    return { open: !!n.vaultUi, blob: texts.join(' | ').indexOf('THE VAULT') >= 0 };})()`);
  check('V opens the vault UI in the nexus', vaultOpen.open && vaultOpen.blob);
  const banked = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var slot = null;
    DATA.equipSlots.forEach(function(s){ if (!slot && CURRENT.equipment[s]) slot = s; });
    var key = CURRENT.equipment[slot];
    n.bankItem(slot);
    var d = JSON.parse(localStorage.getItem('srb_save_1'));
    return { key: key, slot: slot, inVault: GAME_SAVE.vault.indexOf(key) >= 0,
             slotEmpty: CURRENT.equipment[slot] === null,
             savedVault: d.vault.indexOf(key) >= 0 };})()`);
  check('clicking an equipped item BANKS it (persisted to disk)',
    banked.inVault && banked.slotEmpty && banked.savedVault, banked.key + ' banked');

  // -- 9. equip back from the vault; swap works in place ---------------------------
  const reequip = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var key = GAME_SAVE.vault[0];
    n.equipFromVault(0);
    return { key: key, equipped: CURRENT.equipment[DATA.items[key].slot] === key,
             vaultLen: GAME_SAVE.vault.length };})()`);
  check('clicking a vault item equips it (empty slot frees the vault row)',
    reequip.equipped && reequip.vaultLen === 0);
  const swap = await page.evaluate(`(function(){var n=${scene('Nexus')};
    // force a known pair: r0 equipped, r3 in the vault → equip r3, expect r0 back in that vault spot
    CURRENT.equipment.ring = 'r0';
    GAME_SAVE.vault.push('r3');
    var idx = GAME_SAVE.vault.length - 1;
    n.equipFromVault(idx);
    return { ring: CURRENT.equipment.ring, back: GAME_SAVE.vault[idx] };})()`);
  check('equipping into an occupied slot SWAPS (old item takes the vault spot)',
    swap.ring === 'r3' && swap.back === 'r0');

  // -- 10. vault-full guard ----------------------------------------------------------
  const full = await page.evaluate(`(function(){var n=${scene('Nexus')};
    while (GAME_SAVE.vault.length < DATA.vault.slots) GAME_SAVE.vault.push('w0');
    CURRENT.equipment.weapon = 'w1';
    n.buildVaultUi();
    n.bankItem('weapon');
    return { vaultLen: GAME_SAVE.vault.length, stillEquipped: CURRENT.equipment.weapon === 'w1', slots: DATA.vault.slots };})()`);
  check('a full vault refuses one more item (nothing lost)',
    full.vaultLen === full.slots && full.stillEquipped);

  // -- 11. equipment affects live stats (armor heals the delta, unequip clamps) -------
  const hpDelta = await page.evaluate(`(function(){var n=${scene('Nexus')};
    var st = n.player.state;
    CURRENT.equipment.armor = null; applyEquipmentChange(n);
    var base = st.stats.hp;
    CURRENT.equipment.armor = 'ar4'; applyEquipmentChange(n);   // M4.6: +60 HP lives at ar4 now
    var up = { max: st.stats.hp, cur: st.hp };
    CURRENT.equipment.armor = null; applyEquipmentChange(n);
    return { base: base, upMax: up.max, upFilled: up.cur === up.max,
             downMax: st.stats.hp, downClamped: st.hp <= st.stats.hp };})()`);
  check('gear changes re-derive live stats (+60 HP granted filled, unequip clamps)',
    hpDelta.upMax === hpDelta.base + 60 && hpDelta.upFilled &&
    hpDelta.downMax === hpDelta.base && hpDelta.downClamped);

  // -- 12. THE POINT: gear dies with the character, the vault survives death ----------
  await page.keyboard.press('v');                          // close the vault UI
  await sleep(150);
  const death = await page.evaluate(`(function(){var n=${scene('Nexus')};
    CURRENT.equipment.weapon = 'w1';                       // die holding something
    var vaultBefore = GAME_SAVE.vault.slice();
    n.scene.start('Realm', { mode: 'clear' });
    return vaultBefore;})()`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')};
    Entities.hurtPlayer(r, r.player, 99999, r.time.now + 99999, 'the test harness');})()`);
  await sleep(300);
  const after = await page.evaluate(`(function(){
    var d = JSON.parse(localStorage.getItem('srb_save_1'));
    var eqCount = 0; for (var s in d.character.equipment) if (d.character.equipment[s]) eqCount++;
    return { eqCount: eqCount, vault: d.vault, deaths: d.account.records.deaths };})()`);
  check("death wipes the character's equipment (permadeath, R5)", after.eqCount === 0 && after.deaths === 1);
  check('THE VAULT SURVIVES DEATH (gate clause: banked gear outlives its finder)',
    JSON.stringify(after.vault) === JSON.stringify(death), after.vault.length + ' items kept');

  // -- 13. the fresh character can walk back into a realm (gate clause, part 2) --------
  await page.keyboard.press('Enter');
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 5000 });
  await page.evaluate(`(function(){var n=${scene('Nexus')}; if(!n.portal){n.consoleSetMode('clear');n.consoleSpawnPortal(true);} n.player.setPosition(n.portal.x, n.portal.y);})()`);
  await sleep(300);
  // M3: portals are SPACE-activated (retried — headless fps can stall a frame)
  for (let sp = 0; sp < 3; sp++) {
    await page.keyboard.press('Space');
    try { await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 7000 }); break; }
    catch (e) { if (sp === 2) throw e; }
  }
  const rerun = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { alive: r.player.state.alive, level: r.player.state.level,
             vault: GAME_SAVE.vault.length, slots: DATA.vault.slots };})()`);
  check('a fresh level-1 character returns to a realm with the vault intact',
    rerun.alive && rerun.level === 1 && rerun.vault === rerun.slots);

  // -- 14. zero console errors ----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' ;; '));

  await browser.close();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(2); });
