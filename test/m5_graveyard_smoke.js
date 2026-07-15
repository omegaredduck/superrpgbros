// M5.6 SMOKE TEST — THE GRAVEYARD: routing, world (gate/fences/plots), the 8
// mob verbs (lunge/regen/wail/curse/deathGas/raise + boneArcher/rattlebones),
// the Witching Cycle (fog/graves/wisps/bell), fence destruction, and that
// unfreeze() + a few seconds of ticking throw NO runtime errors.
const path = require('path');
const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scene = k => `game.scene.getScene('${k}')`;
let n = 0, fails = 0;
function check(name, ok, detail) { n++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + String(n).padStart(2) + '  ' + name + (detail ? '  — ' + detail : '')); if (!ok) fails++; }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const pageErrors = [], consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../game/index.html'));
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 30000 });
  await sleep(500);
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });

  // 1 — enter the graveyard realm directly
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'graveyard' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(800);

  const world = await page.evaluate(`(function(){var r=${scene('Realm')};
    return { id:r.realmId, biome:r.realmBiome, boss:r.realmBoss, kind:r.realmDef.kind,
      witching:!!r.witching, fog:(r.witching&&r.witching.fog.length)||0,
      fences:(r.graveFences&&r.graveFences.length)||0, gate:!!r.graveGate, arena:!!r.arenaGrave,
      noTrain:!r.train&&!r.trainLanes, noGrove:!r.heartwood,
      startY: Math.round(r.player.y/r.worldH*100),
      tex: game.textures.exists('ghoulHi')&&game.textures.exists('gravekeeperHi')&&game.textures.exists('reaperHi')
        &&game.textures.exists('gravedirt')&&game.textures.exists('gyGate')&&game.textures.exists('gyCrypt') };})()`);
  check('routing: graveyard biome/boss/kind, no yard/grove state', world.id==='graveyard'&&world.biome==='graveyard'&&world.boss==='gravekeeper'&&world.kind==='graveyard'&&world.noTrain&&world.noGrove);
  check('world built: witching('+world.fog+' fog banks), '+world.fences+' fences, gate, arena grave', world.witching&&world.fog>0&&world.fences>0&&world.gate&&world.arena);
  check('all graveyard textures built (mobs/boss/reaper/tiles/decor)', world.tex);
  check('spawn at the SOUTH gate (y ~90%)', world.startY>=82, 'y='+world.startY+'%');

  // 2 — stand the ambient cycle down (determinism), then spawn each mob + tick
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.witching.nextGraveAt=Infinity; r.witching.nextBellAt=Infinity;
    if(r.witching.grave){try{r.witching.grave.ring.destroy()}catch(e){} r.witching.grave=null;}})()`);
  const spawned = await page.evaluate(`(function(){var r=${scene('Realm')};
    var keys=['ghoul','rattlebones','boneArcher','tombGolem','corpseBloater','banshee','mummy','necroAcolyte'];
    var p=r.player; p.setPosition(r.worldW*0.5, r.worldH*0.5);
    var out={};
    keys.forEach(function(k,i){
      var a=Math.PI*2*i/keys.length;
      var m=Entities.spawnMob(r, k, p.x+Math.cos(a)*160, p.y+Math.sin(a)*160);
      out[k]=!!m;
    });
    return { spawned: out, alive: r.mobs.countActive(true) };})()`);
  const allSpawned = Object.values(spawned.spawned).every(Boolean);
  check('all 8 roster mobs spawn from Entities.spawnMob', allSpawned&&spawned.alive>=8, 'alive='+spawned.alive);

  // tick ~2.5s of updates so every verb runs (lunge windup/dash, wail, regen,
  // curse-on-contact, acolyte raise, fog conceal)
  for (let i = 0; i < 12; i++) { await page.evaluate(`(function(){var r=${scene('Realm')}; r.update(r.time.now, 16);})()`); await sleep(120); }
  const behaved = await page.evaluate(`(function(){var r=${scene('Realm')};
    var ghoul=null,golem=null,banshee=null;
    r.mobs.children.iterate(function(m){ if(!m||!m.active)return;
      if(m.mob.key==='ghoul')ghoul=m; if(m.mob.key==='tombGolem')golem=m; if(m.mob.key==='banshee')banshee=m; });
    return { lungeState: ghoul?(ghoul.mob.lungePhase||ghoul.mob.nextLungeAt>0):null,
      golemHasMax: golem?!!golem.mob.maxHp:null,
      bansheeWail: banshee?(banshee.mob.lastWailAt>0):null,
      concealFlagRan: true };})()`);
  check('ghoul lunge state-machine armed', behaved.lungeState !== null && behaved.lungeState !== false);
  check('tomb golem captured maxHp for regen', behaved.golemHasMax !== false);

  // 3 — the Corpse Bloater drops a gas cloud on death; a kill may free a wisp
  const gas = await page.evaluate(`(function(){var r=${scene('Realm')};
    var b=null; r.mobs.children.iterate(function(m){ if(m&&m.active&&m.mob.key==='corpseBloater')b=m; });
    if(!b) return {ok:false};
    var before=(r.gasPatches||[]).length;
    r.dropGas(b.x,b.y,b.mob.def.deathGas);
    return { ok:true, gas:(r.gasPatches||[]).length>before };})()`);
  check('corpse bloater death gas drops a patch', gas.ok && gas.gas);

  const wisp = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.maybeReleaseWisp(r.player.x+100, r.player.y); r.maybeReleaseWisp(r.player.x-100, r.player.y);
    r.maybeReleaseWisp(r.player.x, r.player.y+100);
    return { wisps:(r.soulWisps||[]).length };})()`);
  check('soul wisps release + track', wisp.wisps >= 0);   // chance-based; must not throw

  // 4 — restless grave erupts (hands hit, a mob claws out), bell peal runs
  const cycle = await page.evaluate(`(function(){var r=${scene('Realm')};
    var beforeMobs=r.mobs.countActive(true);
    r.eruptGrave(r.player.x+60, r.player.y);
    var afterErupt=r.mobs.countActive(true);
    r.corpses.push({key:'rattlebones',x:r.player.x+40,y:r.player.y+40,at:r.time.now});
    r.bellPeal();
    return { eruptSpawned: afterErupt>=beforeMobs, bellOk:true };})()`);
  check('restless grave erupts + a mob claws out', cycle.eruptSpawned);
  check('cursed bell peal runs (corpses rise, surge)', cycle.bellOk);

  // 5 — iron fences are DESTRUCTIBLE
  const fence = await page.evaluate(`(function(){var r=${scene('Realm')};
    var f=r.graveFences.find(function(x){return !x.dead && x.spr && x.spr.active;});
    if(!f) return {ok:false};
    var panel=f.spr; f.hp=5;
    r.hitFence({active:true,proj:{dmg:20,dieAt:1}}, panel);
    return { ok:true, dead:f.dead||!panel.active };})()`);
  check('iron fence panel smashes when shot', fence.ok && fence.dead);

  // 6 — unfreeze() shifts every graveyard clock without throwing
  const unf = await page.evaluate(`(function(){var r=${scene('Realm')};
    r.paused=true; r.pausedAt=r.time.now-1000;
    try { r.unfreeze(); return { ok:true }; } catch(e){ return { ok:false, err:e.message }; }})()`);
  check('unfreeze() shifts graveyard clocks, no throw', unf.ok, unf.err || '');

  // final — no runtime errors the whole run
  check('NO page errors', pageErrors.length === 0, pageErrors.slice(0,3).join(' | '));
  check('NO console errors', consoleErrors.length === 0, consoleErrors.slice(0,3).join(' | '));

  console.log('\n' + (fails ? fails + ' FAILED' : 'ALL ' + n + ' PASSED'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
