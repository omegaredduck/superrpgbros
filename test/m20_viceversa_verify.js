// M20 VICE VERSA verification suite — realm 18, registry map 14.
// Registry/data · ETERNAL WAR.EXE (456 beats @152 = 180.0s) · split-map layout
// (river impassable, bridge crossing, arenas, portal spots) · FACTION WARFARE
// (hell+holy cross-damage, mob-vs-mob NO player credit, no cross-faction heal)
// · WRAP-LEASH (E-W seam drops chases, N-S never, bridge preserves) · EVERY
// mob mechanic (imp poke · fire lob+burn · charm pull (cap) · brute slam ·
// skeleton chop · ghost fade · gaoler hook · tormentor whip · cherub shot ·
// angel lunge · seraph lance · valkyrie dive · acolyte heal (same-faction) ·
// guardian statue facing-freeze · siren charm · herald blast · archon blade) ·
// DOUBLE BOSS: both spawn trapped, SATAN kit (trident/pillars/imps/P2 dive/
// RING OF FIRE + vent), SUPREME kit (gavel/beam eye-shut/scales safe-pan/
// cherubs/FINAL VERDICT + vent), portal-on-first-kill, clear-on-both.
const { chromium } = require('playwright');

const GAME = 'file://' + require('path').resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) {
  step++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`);
  if (!ok) failures++;
}
const scene = (k) => `game.scene.getScene('${k}')`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const sleep = (ms) => page.waitForTimeout(ms);

  // -- 1. boot: registry + the theme -------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.viceversa, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var sat = DATA.bosses.satan, sup = DATA.bosses.supremeBeing;
    var hell = DATA.biomes.viceversa.mobs.filter(function(k){ return DATA.mobs[k].faction === 'hell'; }).length;
    var holy = DATA.biomes.viceversa.mobs.filter(function(k){ return DATA.mobs[k].faction === 'holy'; }).length;
    return { def: !!MAPS.defs.viceversa, roster: DATA.biomes.viceversa.mobs.length, hell: hell, holy: holy,
             satOwned: sat.mapOwned === true && !sat.patterns.radial && !sat.patterns.stream, satHints: sat.hints.length,
             supOwned: sup.mapOwned === true && !sup.patterns.radial && !sup.patterns.stream, supHints: sup.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'viceversa' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal,
             faction: DATA.realms.viceversa.factionCfg.crossDamage === true && DATA.realms.viceversa.factionCfg.mobKillCredit === 'none' };})()`);
  check('registry def + 17-mob roster (8 hell + 9 holy) + console unlock',
    reg.def && reg.roster === 17 && reg.hell === 8 && reg.holy === 9 && reg.consoleRow);
  check('BOTH bosses mapOwned, NO radial/stream, ≤6 hints each',
    reg.satOwned && reg.satHints <= 6 && reg.supOwned && reg.supHints <= 6, `sat ${reg.satHints} sup ${reg.supHints}`);
  check('ETERNAL WAR: 456 beats @152, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 456 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');
  check('factionCfg: crossDamage on + mob-vs-mob credit NONE (farm guard)', reg.faction);

  // -- 2. enter the realm --------------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'viceversa' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const layout = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    return { id: r.realmId, hasVV: !!C, river: !!C.river, fences: C.fences.length,
             sat: !!C.satanArena, sup: !!C.supremeArena,
             startBridge: Math.abs(r._realmStart.x - r.worldW*0.5) < 5 && Math.abs(r._realmStart.y - r.worldH*0.5) < 5,
             sideHell: r._vvSide(r.worldW*0.1), sideHoly: r._vvSide(r.worldW*0.9), sideRiver: r._vvSide(r.worldW*0.5) };})()`);
  check('split scene: river strip + arenas + fences + bridge-seam spawn',
    layout.id === 'viceversa' && layout.river && layout.sat && layout.sup && layout.fences >= 4 && layout.startBridge);
  check('sides resolve: west=hell, east=holy, centre=river',
    layout.sideHell === 'hell' && layout.sideHoly === 'holy' && layout.sideRiver === 'river');

  // -- 3. wipe ambient + park the river anim (fixture) --------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r._vv.animPhaseAt = Infinity;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);

  // -- 4. river impassable, bridge walkable ------------------------------------------
  const routing = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    r.hitstopActive = false;
    // stand in the river band OFF the bridge → pushed to a bank
    p.body.reset(C.riverCx, r.worldH*0.2);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var pushed = r._vvSide(p.x) !== 'river';
    // stand on the bridge seam → stays (walkable crossing)
    p.body.reset(C.riverCx, C.bridgeCy);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var onBridge = Math.abs(p.x - C.riverCx) < C.riverHalf + 8;
    p.body.reset(r.worldW*0.5, r.worldH*0.5);
    return { pushed: pushed, onBridge: onBridge };})()`);
  check('ROUTING: river impassable off-bridge, bridge seam walkable', routing.pushed && routing.onBridge);

  // -- 5. FACTION WARFARE: cross-damage + NO player credit + no cross-heal ------------
  const faction = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    C.lastFactionAt = 0;
    var a = Entities.spawnMob(r, 'vvImp', r.worldW*0.3, r.worldH*0.3);      // hell
    var b = Entities.spawnMob(r, 'vvAngel', r.worldW*0.3 + 20, r.worldH*0.3); // holy adjacent
    var ah0 = a.mob.hp, bh0 = b.mob.hp, kills0 = p.state.kills;
    VICEVERSA_SCENE._factionWar(r, r.time.now);
    var crossed = a.mob.hp < ah0 && b.mob.hp < bh0;
    // drive to death → NO player credit
    for (var i=0;i<40 && a.active && b.active;i++){ C.lastFactionAt = 0; VICEVERSA_SCENE._factionWar(r, r.time.now + i*600); }
    var died = !a.active || !b.active;
    var noCredit = p.state.kills === kills0;
    // acolyte does NOT heal a cross-faction (hell) mob
    var wounded = Entities.spawnMob(r, 'vvImp', r.worldW*0.32, r.worldH*0.32); wounded.mob.hp = 5;
    var aco = Entities.spawnMob(r, 'vvAcolyte', r.worldW*0.32+10, r.worldH*0.32);
    aco.mob.nextHealAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, aco, p, r.time.now);
    var noCrossHeal = wounded.mob.hp === 5;
    [a,b,wounded,aco].forEach(function(o){ if(o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o);} });
    return { crossed: crossed, died: died, noCredit: noCredit, noCrossHeal: noCrossHeal };})()`);
  check('FACTION WAR: opposite factions damage each other', faction.crossed && faction.died);
  check('farm guard: mob-vs-mob kills credit NOBODY + no cross-faction heal', faction.noCredit && faction.noCrossHeal);

  // -- 6. WRAP-LEASH: E-W drops chases · N-S never · bridge preserves ------------------
  const leash = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    r.hitstopActive = false;
    // hell mob aggroed while player on the hell side
    p.body.reset(r.worldW*0.3, r.worldH*0.5);
    var m = Entities.spawnMob(r, 'vvImp', r.worldW*0.28, r.worldH*0.5);
    m.mob._vvDeaggroUntil = 0;
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var aggro = m.mob._vvAggro === true;
    // simulate an E-W wrap of the player → chases DROP
    VICEVERSA_SCENE._dropChases(r, r.time.now);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var droppedEW = m.mob._vvAggro === false && m.mob._vvDeaggroUntil > r.time.now;
    // clear + re-aggro, then a bridge-preserve check
    m.mob._vvDeaggroUntil = 0;
    p.body.reset(C.riverCx, C.bridgeCy);                       // player ON the bridge
    m.body.reset(r.worldW*0.35, C.bridgeCy);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var bridgePreserve = m.mob._vvAggro === true && m.mob._vvBridging === true;
    // N-S wrap never drops: put player on hell side, aggro, then a vertical wrap sim
    m.mob._vvDeaggroUntil = 0; m.mob._vvBridging = false;
    p.body.reset(r.worldW*0.3, r.worldH*0.5);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var pre = m.mob._vvAggro;
    p.body.reset(r.worldW*0.3, r.worldH + 5);                  // crosses the south edge (N-S wrap)
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var nsKept = m.mob._vvAggro === true && !(m.mob._vvDeaggroUntil > r.time.now);
    Entities.clearNameTag(m); m.body.enable=false; r.mobs.killAndHide(m);
    p.body.reset(r.worldW*0.5, r.worldH*0.5);
    return { aggro: aggro, droppedEW: droppedEW, bridgePreserve: bridgePreserve, pre: pre, nsKept: nsKept };})()`);
  check('WRAP-LEASH: E-W wrap DROPS the chase (deaggro + path home)', leash.aggro && leash.droppedEW);
  check('the BRIDGE preserves the chase (bridging across the river)', leash.bridgePreserve);
  check('N-S wrap NEVER drops (same side)', leash.pre && leash.nsKept);

  // -- 7. HELL mob verbs -------------------------------------------------------------
  const hell = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    p.state.lastHitAt = -1e9; var out = {};
    p.body.reset(r.worldW*0.3, r.worldH*0.4);
    // IMP poke: warn → dash
    var imp = Entities.spawnMob(r, 'vvImp', p.x + 120, p.y); imp.mob._vvAggro = true; imp.mob.nextPokeAt = 1;
    Entities.updateMob(r, imp, p, r.time.now); out.impWarn = imp.mob.pokeAt > r.time.now;
    imp.mob.pokeAt = 1; Entities.updateMob(r, imp, p, r.time.now); out.impDash = imp.mob.pokeUntil > r.time.now;
    // FIRE IMP lob → warned zone + lingering burn
    var fi = Entities.spawnMob(r, 'vvFireImp', p.x + 150, p.y); fi.mob._vvAggro = true; fi.mob.nextLobAt = 1;
    var z0 = C.zones.length; Entities.updateMob(r, fi, p, r.time.now); out.fireLob = C.zones.length === z0 + 2;
    p.body.reset(r.worldW*0.85, r.worldH*0.85);                // dodge the blast
    var pc0 = C.patches.length; C.zones.forEach(function(z){ z.at = 1; }); VICEVERSA_SCENE.update(r, r.time.now, 16);
    out.fireBurn = C.patches.length > pc0;
    p.body.reset(r.worldW*0.3, r.worldH*0.4);
    // SUCCUBUS charm: warn → pull (capped by shared cc)
    var su = Entities.spawnMob(r, 'vvSuccubus', p.x + 60, p.y); su.mob._vvAggro = true; su.mob.nextCharmAt = 1;
    Entities.updateMob(r, su, p, r.time.now); out.charmWarn = su.mob.charmAt > r.time.now;
    C.ccUntil = 0; su.mob.charmAt = 1; Entities.updateMob(r, su, p, r.time.now); out.charmPull = !!C.pull;
    C.pull = null;
    // BRUTE slam warned circle
    var br = Entities.spawnMob(r, 'vvBrute', p.x + 100, p.y); br.mob._vvAggro = true; br.mob.nextSlamAt = 1;
    var z1 = C.zones.length; Entities.updateMob(r, br, p, r.time.now); out.slam = C.zones.length === z1 + 1;
    // SKELETON chop cone
    var sk = Entities.spawnMob(r, 'vvSkeleton', p.x + 90, p.y); sk.mob._vvAggro = true; sk.mob.nextChopAt = 1;
    Entities.updateMob(r, sk, p, r.time.now); out.chop = sk.mob.chopAt > r.time.now;
    // GHOST fade on approach
    var gh = Entities.spawnMob(r, 'vvGhost', p.x + 30, p.y); gh.mob._vvAggro = true;
    Entities.updateMob(r, gh, p, r.time.now); out.ghost = gh.alpha < 1;
    // GAOLER hook: warn → drag
    var ga = Entities.spawnMob(r, 'vvGaoler', p.x + 60, p.y); ga.mob._vvAggro = true; ga.mob.nextHookAt = 1;
    Entities.updateMob(r, ga, p, r.time.now); out.hookWarn = ga.mob.hookAt > r.time.now;
    C.ccUntil = 0; ga.mob.hookAt = 1; Entities.updateMob(r, ga, p, r.time.now); out.hookDrag = !!C.pull; C.pull = null;
    // TORMENTOR whip lane + burn line
    var to = Entities.spawnMob(r, 'vvTormentor', p.x + 120, p.y); to.mob._vvAggro = true; to.mob.nextWhipAt = 1;
    var l0 = C.lanes.length; Entities.updateMob(r, to, p, r.time.now); out.whip = C.lanes.length === l0 + 1;
    [imp,fi,su,br,sk,gh,ga,to].forEach(function(o){ if(o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o);} });
    C.zones.forEach(function(z){ if(z.ring) z.ring.destroy(); }); C.zones=[]; r._zoneWarns.length=0;
    C.lanes.forEach(function(l){ if(l.g) l.g.destroy(); }); C.lanes=[];
    for(var i=C.patches.length-1;i>=0;i--){ if(C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    return out;})()`);
  check('HELL verbs: imp poke · fire lob+burn · succubus charm-pull',
    hell.impWarn && hell.impDash && hell.fireLob && hell.fireBurn && hell.charmWarn && hell.charmPull);
  check('HELL verbs: brute slam · skeleton chop · ghost fade · gaoler hook · tormentor whip',
    hell.slam && hell.chop && hell.ghost && hell.hookWarn && hell.hookDrag && hell.whip);

  // -- 8. HOLY mob verbs -------------------------------------------------------------
  const holy = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    var out = {}; p.body.reset(r.worldW*0.7, r.worldH*0.4); p.state.lastHitAt=-1e9;
    // CHERUB shoots (orbShot + tint)
    var ch = Entities.spawnMob(r, 'vvCherub', p.x + 100, p.y); ch.mob._vvAggro = true; ch.mob.lastShotAt = 0;
    var es0 = r.enemyShots.countActive(true); Entities.updateMob(r, ch, p, r.time.now);
    out.cherub = r.enemyShots.countActive(true) > es0;
    r.enemyShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.enemyShots,s); });
    // ANGEL lunge
    var an = Entities.spawnMob(r, 'vvAngel', p.x + 120, p.y); an.mob._vvAggro = true; an.mob.nextLungeAt = 1;
    Entities.updateMob(r, an, p, r.time.now); out.angelWarn = an.mob.lungeAt > r.time.now;
    an.mob.lungeAt = 1; Entities.updateMob(r, an, p, r.time.now); out.angelDash = an.mob.lungeUntil > r.time.now;
    // SERAPH lance line
    var se = Entities.spawnMob(r, 'vvSeraph', p.x + 150, p.y); se.mob._vvAggro = true; se.mob.nextLanceAt = 1;
    var l0 = C.lanes.length; Entities.updateMob(r, se, p, r.time.now); out.lance = C.lanes.length === l0 + 1;
    // VALKYRIE dive: warn (shadow zone) → dash
    var va = Entities.spawnMob(r, 'vvValkyrie', p.x + 140, p.y); va.mob._vvAggro = true; va.mob.nextDiveAt = 1;
    var z0 = C.zones.length; Entities.updateMob(r, va, p, r.time.now); out.diveWarn = va.mob.diveAt > r.time.now && C.zones.length === z0 + 1;
    va.mob.diveAt = 1; Entities.updateMob(r, va, p, r.time.now); out.diveDash = va.mob.diveUntil > r.time.now;
    // ACOLYTE heals a SAME-faction (holy) ally
    var hurt = Entities.spawnMob(r, 'vvAngel', p.x + 200, p.y); hurt.mob.hp = 20;
    var aco = Entities.spawnMob(r, 'vvAcolyte', p.x + 220, p.y); aco.mob.nextHealAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, aco, p, r.time.now); out.heal = hurt.mob.hp === 32;
    // GUARDIAN STATUE: frozen when watched, moves when not
    var st = Entities.spawnMob(r, 'vvStatue', p.x + 120, p.y); p.flipX = false; // facing +x (toward statue)
    st.body.velocity.x = 0; st.body.velocity.y = 0; p.body.velocity.x=0; p.body.velocity.y=0;
    Entities.updateMob(r, st, p, r.time.now); out.watched = Math.hypot(st.body.velocity.x, st.body.velocity.y) < 1;
    p.flipX = true;                                            // now facing AWAY (-x)
    Entities.updateMob(r, st, p, r.time.now); out.unwatched = Math.hypot(st.body.velocity.x, st.body.velocity.y) > 10;
    // SIREN charm (mirror)
    var si = Entities.spawnMob(r, 'vvSiren', p.x + 60, p.y); si.mob._vvAggro = true; si.mob.nextCharmAt = 1;
    Entities.updateMob(r, si, p, r.time.now); out.sirenWarn = si.mob.charmAt > r.time.now;
    // HERALD blast cone
    var he = Entities.spawnMob(r, 'vvHerald', p.x + 90, p.y); he.mob._vvAggro = true; he.mob.nextBlastAt = 1;
    Entities.updateMob(r, he, p, r.time.now); out.blast = he.mob.blastAt > r.time.now;
    // ARCHON blade + dash
    var ar = Entities.spawnMob(r, 'vvArchon', p.x + 100, p.y); ar.mob._vvAggro = true; ar.mob.nextArchonAt = 1;
    Entities.updateMob(r, ar, p, r.time.now); out.archonWarn = ar.mob.archonAt > r.time.now;
    ar.mob.archonAt = 1; Entities.updateMob(r, ar, p, r.time.now); out.archonDash = ar.mob.archonUntil > r.time.now;
    [ch,an,se,va,hurt,aco,st,si,he,ar].forEach(function(o){ if(o.active){ Entities.clearNameTag(o); o.body.enable=false; r.mobs.killAndHide(o);} });
    C.lanes.forEach(function(l){ if(l.g) l.g.destroy(); }); C.lanes=[];
    C.zones.forEach(function(z){ if(z.ring) z.ring.destroy(); }); C.zones=[]; r._zoneWarns.length=0;
    return out;})()`);
  check('HOLY verbs: cherub shot · angel lunge · seraph lance · valkyrie dive',
    holy.cherub && holy.angelWarn && holy.angelDash && holy.lance && holy.diveWarn && holy.diveDash);
  check('HOLY verbs: acolyte heal (+12) · statue facing-freeze (watch/unwatch) · siren · herald · archon',
    holy.heal && holy.watched && holy.unwatched && holy.sirenWarn && holy.blast && holy.archonWarn && holy.archonDash);

  // -- 9. clocks shift through unfreeze() ---------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    C.animPhaseAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'vvTormentor', r.worldW*0.3, r.worldH*0.4);
    m.mob.nextWhipAt = r.time.now + 6000;
    var before = { a: C.animPhaseAt, m: m.mob.nextWhipAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { a: C.animPhaseAt - before.a, m: m.mob.nextWhipAt - before.m };
      C.animPhaseAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts river-anim + mob clocks', shift.a > 500 && shift.m > 500);

  // -- 9b. DESTRUCTIBLE FENCES: player shots deteriorate them (campaign law) ----------
  const fence = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    r.hitstopActive = false;
    var F = C.fences[0]; F.state = 0; F.hp = F.maxHp;
    var half = Math.ceil(F.maxHp * 0.6);           // enough to cross the 50% bend threshold, not lethal
    Entities.fireProjectile(r, r.playerShots, F.x, F.y, 0, 0, half, 5000, 'bolt', false);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var bent = F.state === 1 && F.spr.texture.key === 'vvd' + (F.kind === 'bone' ? 'BoneFence' : 'GoldFence') + '1';
    Entities.fireProjectile(r, r.playerShots, F.x, F.y, 0, 0, F.maxHp, 5000, 'bolt', false);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var broke = F.state === 2 && F.spr.texture.key === 'vvd' + (F.kind === 'bone' ? 'BoneFence' : 'GoldFence') + '2';
    r.playerShots.children.iterate(function(s){ if(s&&s.active) Entities.killProjectile(r.playerShots, s); });
    return { bent: bent, broke: broke };})()`);
  check('ALL FENCES DESTRUCTIBLE: shots deteriorate fence (bend → break states)', fence.bent && fence.broke);

  // -- 10. DOUBLE BOSS: both spawn trapped -------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota;
    var caps=[], orig=r.time.delayedCall.bind(r.time);
    r.time.delayedCall=function(ms,cb){caps.push(cb);return orig(ms,function(){});};
    r.startBossFight();
    r.time.delayedCall=orig;
  })()`);
  await sleep(200);
  const bosses = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    return { two: !!C.satan && !!C.supreme, coreBoss: r.boss === C.satan,
             satKey: C.satan.boss.key, supKey: C.supreme.boss.key,
             satHell: Math.abs(C.satan.x - C.satanArena.x) < C.satanArena.r,
             supHoly: Math.abs(C.supreme.x - C.supremeArena.x) < C.supremeArena.r,
             notDefeated: !C.satan._vvDefeated && !C.supreme._vvDefeated };})()`);
  check('DOUBLE BOSS: SATAN + SUPREME BEING both spawn, each in his arena',
    bosses.two && bosses.satKey === 'satan' && bosses.supKey === 'supremeBeing' && bosses.satHell && bosses.supHoly);

  // -- 11. SATAN kit: trident sweep · pillars · imp call · P2 dive · RING OF FIRE + vent
  const satan = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    var b = C.satan, bs = b.boss;
    bs.nextRingAt = r.time.now + 9e9; bs.nextImpAt = r.time.now + 9e9; bs.busyUntil = 0; bs.rootUntil = 0;
    p.body.reset(b.x + 120, b.y); p.state.lastHitAt=-1e9;
    // trident sweep (cone)
    bs.verbIdx = 0; bs.nextVerbAt = 1; var c0 = C.cones.length;
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now); var sweep = C.cones.length === c0 + 1 && C.cones[C.cones.length-1].fromBoss;
    C.cones.forEach(function(c){ if(c.g) c.g.destroy(); }); C.cones=[];
    // hellfire pillars (warned zones)
    bs.busyUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1; var z0 = C.zones.length;
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now); var pillars = C.zones.length === z0 + b.boss.def.patterns.hellfirePillars.count;
    C.zones.forEach(function(z){ if(z.ring) z.ring.destroy(); }); C.zones=[]; r._zoneWarns.length=0;
    // imp call
    bs.busyUntil = 0; bs.nextImpAt = 1; bs.nextVerbAt = r.time.now + 9e9; bs.nextRingAt = r.time.now + 9e9;
    var q0 = r._spawnQueue.length; VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var imps = r._spawnQueue.length - q0 === b.boss.def.patterns.impCall.imps && r._spawnQueue.slice(q0).every(function(e){ return e.bossWave && e.key==='vvImp'; });
    r._spawnQueue.length = q0;
    // P2 flight dive (drop below half)
    bs.hp = bs.maxHp * 0.4; bs.busyUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1; bs.nextImpAt = r.time.now+9e9;
    var l0 = C.lanes.length; VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var p2 = bs._p2 === true && C.lanes.length === l0 + b.boss.def.patterns.flightDive.lanes;
    C.lanes.forEach(function(l){ if(l.g) l.g.destroy(); }); C.lanes=[];
    // RING OF FIRE signature → vent ×1.5
    bs.busyUntil = 0; bs.nextRingAt = 1; bs.nextVerbAt = r.time.now+9e9; bs.nextImpAt = r.time.now+9e9;
    var rg0 = C.rings.length; VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var ring = C.rings.length === rg0 + 1 && C.rings[C.rings.length-1].gaps.length === b.boss.def.patterns.ringOfFire.gaps;
    C.rings[C.rings.length-1].until = 1; VICEVERSA_SCENE.update(r, r.time.now, 16);
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    var hp0 = bs.hp; VICEVERSA_SCENE._hurtBoss(r, b, 100); var ventDmg = hp0 - bs.hp;
    return { sweep: sweep, pillars: pillars, imps: imps, p2: p2, ring: ring, vented: vented, ventDmg: ventDmg };})()`);
  check('SATAN P1: TRIDENT SWEEP cone · HELLFIRE PILLARS · IMP CALL (bossWave imps)',
    satan.sweep && satan.pillars && satan.imps);
  check('SATAN P2: TAKES FLIGHT (dive lanes) · RING OF FIRE gaps → VENTED ×1.5',
    satan.p2 && satan.ring && satan.vented && satan.ventDmg === 150, satan.ventDmg + ' dmg');

  // -- 12. SUPREME kit: gavel · beam eye-shut · scales safe-pan · cherubs · FINAL VERDICT + vent
  const supreme = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv, p=r.player;
    var b = C.supreme, bs = b.boss, A = C.supremeArena;
    bs.nextCherubAt = r.time.now+9e9; bs.nextVerdictAt = r.time.now+9e9; bs.busyUntil = 0; bs.rootUntil = 0;
    p.body.reset(b.x - 120, b.y); p.state.lastHitAt=-1e9;
    var caps=[], orig=r.time.delayedCall.bind(r.time);
    function cap(){ r.time.delayedCall=function(ms,cb){caps.push(cb);return orig(ms,function(){});}; }
    function flush(){ r.time.delayedCall=orig; caps.splice(0).forEach(function(f){try{f();}catch(e){}}); }
    // GAVEL FIST → warned zone + (delayed) shockwave ring
    bs.verbIdx = 0; bs.nextVerbAt = 1; var z0 = C.zones.length; cap();
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now); var gavelZone = C.zones.length === z0 + 1;
    var rg0 = C.rings.length; flush(); var gavelRing = C.rings.length === rg0 + 1;
    C.zones.forEach(function(z){ if(z.ring) z.ring.destroy(); }); C.zones=[]; r._zoneWarns.length=0;
    C.rings.forEach(function(g){ if(g.g) g.g.destroy(); }); C.rings=[];
    // JUDGMENT BEAM: eye SHUT charge (texture) → line beam
    bs.busyUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1; cap();
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var shut = bs.eyeCharging === true && b.texture.key === 'vvSupremeShutHi';
    var l0 = C.lanes.length; flush(); var beam = C.lanes.length === l0 + 1 && bs.eyeCharging === false;
    C.lanes.forEach(function(l){ if(l.g) l.g.destroy(); }); C.lanes=[];
    // SCALES: raised pan = safe half; the DOOMED half smites, safe half spared
    bs.busyUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1; var c0 = C.cones.length;
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var scales = C.cones.length === c0 + 1 && C.cones[C.cones.length-1].scales;
    var safeLeft = C.cones[C.cones.length-1].safeLeft;
    // player in the SAFE half → unhurt; a mob in the DOOMED half → swept (no credit)
    p.body.reset(safeLeft ? A.x - A.r*0.5 : A.x + A.r*0.5, A.y);
    var vic = Entities.spawnMob(r, 'vvCherub', safeLeft ? A.x + A.r*0.5 : A.x - A.r*0.5, A.y);
    var hp0 = p.state.hp, kills0 = p.state.kills;
    C.cones[C.cones.length-1].at = 1; VICEVERSA_SCENE.update(r, r.time.now, 16);
    var safePan = p.state.hp === hp0 && !vic.active && p.state.kills === kills0;
    if(vic.active){ Entities.clearNameTag(vic); vic.body.enable=false; r.mobs.killAndHide(vic); }
    // CHERUB CALL
    bs.busyUntil = 0; bs.nextCherubAt = 1; bs.nextVerbAt = r.time.now+9e9; bs.nextVerdictAt = r.time.now+9e9;
    var q0 = r._spawnQueue.length; VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now);
    var cherubs = r._spawnQueue.length - q0 === b.boss.def.patterns.cherubCall.cherubs && r._spawnQueue.slice(q0).every(function(e){ return e.bossWave && e.key==='vvCherub'; });
    r._spawnQueue.length = q0;
    // FINAL VERDICT: long eye-shut charge → rotating sweep → vent ×1.5
    bs.busyUntil = 0; bs.nextVerdictAt = 1; bs.nextVerbAt = r.time.now+9e9; bs.nextCherubAt = r.time.now+9e9; cap();
    VICEVERSA_SCENE.bossUpdate(r, b, p, r.time.now); var verdictShut = bs.eyeCharging === true;
    var rg1 = C.rings.length; flush(); var verdict = C.rings.length === rg1 + 1 && C.rings[C.rings.length-1].verdict;
    C.rings[C.rings.length-1].until = 1; p.body.reset(r.worldW*0.99, r.worldH*0.99);
    VICEVERSA_SCENE.update(r, r.time.now, 16);
    var vented = bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    var hp1 = bs.hp; VICEVERSA_SCENE._hurtBoss(r, b, 100); var ventDmg = hp1 - bs.hp;
    return { gavelZone: gavelZone, gavelRing: gavelRing, shut: shut, beam: beam, scales: scales, safePan: safePan,
             cherubs: cherubs, verdictShut: verdictShut, verdict: verdict, vented: vented, ventDmg: ventDmg };})()`);
  check('SUPREME P1: GAVEL FIST (slam + shockwave ring) · JUDGMENT BEAM (eye-shut tell → line)',
    supreme.gavelZone && supreme.gavelRing && supreme.shut && supreme.beam);
  check('SUPREME: SCALES safe-pan correctness · CHERUB CALL (bossWave)',
    supreme.scales && supreme.safePan && supreme.cherubs);
  check('SUPREME signature: FINAL VERDICT eye-shut → rotating sweep → VENTED ×1.5',
    supreme.verdictShut && supreme.verdict && supreme.vented && supreme.ventDmg === 150, supreme.ventDmg + ' dmg');

  // -- 13. PORTAL gating: first kill opens portal, clear needs BOTH -------------------
  const portal = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    // kill SUPREME first (the scene-owned boss) → portal opens, map NOT cleared
    C.supreme.boss.hp = 1; VICEVERSA_SCENE._hurtBoss(r, C.supreme, 50);
    var opened = C.portalOpen && C.supreme._vvDefeated && !!r.boss && r.boss === C.satan && !r.chest && !r.pendingLoot;
    return { opened: opened };})()`);
  check('PORTAL opens on FIRST kill; map NOT cleared while one boss lives', portal.opened);

  // -- 14. clear on BOTH down → chest/loot -------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._vv;
    C.satan.boss.hp = 1; VICEVERSA_SCENE._hurtBoss(r, C.satan, 50);
  })()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`, null, { timeout: 15000 });
  const cleared = await page.evaluate(`(function(){var r=${scene('Realm')}; return !!(r.chest || r.pendingLoot) && !r.boss; })()`);
  check('both bosses down → clear flow (chest/loot), no live boss left', cleared);

  // -- 15. zero console errors -------------------------------------------------------
  check('zero console errors on boot + play', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log('\nRESULT: ' + (step - failures) + '/' + step);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
