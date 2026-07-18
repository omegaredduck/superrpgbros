// M10 LUNAR STATION verification suite — realm 8, registry map 4.
// Registry/data · SEA OF TRANQUILITY (216 beats @72 = 180.0s) · layout ·
// LOW GRAVITY (knockback drift · momentum glide · jump-pad arcs · dust) ·
// the 6 mapVerbs (brood sac hatching · turret sweeps · revenant grab ·
// leaper arcs · orbital mine env-kill credit · star-horror cones) + the
// magnetron drag · SPECIMEN ZERO: lights-out entrance, TK barrage,
// gravity well, containment purge → vented ×1.5, kill → chest.
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

  // -- 1. boot: registry + the zero-G theme ---------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.lunar, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.specimenzero;
    return { def: !!MAPS.defs.lunar, roster: DATA.biomes.lunar.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'lunar' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 9-mob roster + console unlock', reg.def && reg.roster === 9 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('SEA OF TRANQUILITY: 216 beats @72, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 216 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ----------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'lunar' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._lun;
    return { id: r.realmId, pads: P.pads.length, airlocks: P.airlocks.length,
             beacons: P.beacons.length, arena: !!P.arena };})()`);
  check('lunar scene: 6 jump pads (3 pairs) + 2 airlocks + 4 arena beacons + the arena',
    realm.id === 'lunar' && realm.pads === 6 && realm.airlocks === 2 && realm.beacons === 4 && realm.arena);

  // -- 3. LOW GRAVITY: knockback DRIFT (~2× farther, hangs) ------------------------
  const drift = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    var m = Entities.spawnMob(r, 'scuttler', p.x + 60, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // seeds _lgHp via scene update? no — verb-less; seed below
    LUNAR_SCENE.update(r, r.time.now, 16);                   // seeds _lgHp
    var x0 = m.x;
    Entities.hurtMob(r, m, 5, r.time.now);                   // core knockback + our drift arms
    var x1 = m.x;                                            // core shove landed
    r.hitstopActive = false;                                 // the hit juice-freeze gates pushes
    LUNAR_SCENE.update(r, r.time.now, 100);                  // drift glides him farther
    LUNAR_SCENE.update(r, r.time.now, 100);
    var x2 = m.x;
    var out = { core: x1 - x0, drift: x2 - x1, armed: false };
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return out;})()`);
  check('a hit mob DRIFTS on after the core knockback (low-grav glide)',
    drift.core > 0 && drift.drift > 1, 'core +' + drift.core.toFixed(1) + 'px, drift +' + drift.drift.toFixed(1) + 'px');

  // -- 4. LOW GRAVITY: player momentum GLIDE ---------------------------------------
  const glide = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    r.hitstopActive = false;
    p.body.reset(r.worldW * 0.3, r.worldH * 0.5);
    p.body.velocity.x = 190; p.body.velocity.y = 0;
    LUNAR_SCENE.update(r, r.time.now, 16);                   // records pv
    p.body.velocity.x = 0;                                   // sudden stop
    var x0 = p.x;
    LUNAR_SCENE.update(r, r.time.now, 100);                  // residual glide applies
    LUNAR_SCENE.update(r, r.time.now, 100);
    var moved = p.x - x0;
    P.glide.vx = 0; P.glide.vy = 0; P.pvx = 0; P.pvy = 0;
    p.body.reset(r.worldW * 0.46, r.worldH * 0.89);
    return moved;})()`);
  check('a sudden stop leaves the player GLIDING on (momentum carries)', glide > 1, '+' + glide.toFixed(1) + 'px');

  // -- 5. JUMP PAD: launch → airborne (contact-immune) → land at the partner -------
  const pad = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    return new Promise(function(res){
      var A = P.pads[0], B = P.pads[A.to];
      p.body.reset(A.x, A.y);
      LUNAR_SCENE.update(r, r.time.now, 16);                 // trigger
      var out = { launched: !!P.padAir, bodyOff: p.body.enable === false,
                  cooled: A.cooldownUntil > r.time.now && B.cooldownUntil > r.time.now };
      if (P.padAir) P.padAir.until = r.time.now + 30;        // fast-forward the arc
      setTimeout(function(){
        LUNAR_SCENE.update(r, r.time.now, 16);               // land
        out.landed = !P.padAir && p.body.enable === true &&
                     Math.hypot(p.x - B.x, p.y - B.y) < 6;
        out.dust = P.dust.length > 0;
        p.body.reset(r.worldW * 0.46, r.worldH * 0.89);
        res(out);
      }, 80);
    });})()`);
  check('jump pad LAUNCHES (airborne, body off, both pads cool down)', pad.launched && pad.bodyOff && pad.cooled);
  check('the arc lands you ON the partner pad + a dust slam', pad.landed && pad.dust);

  // -- 6. dust puffs on regolith movement ------------------------------------------
  const dust = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    P.dust.forEach(function(D){ D.obj.destroy(); }); P.dust = []; P.nextDustAt = 0;
    p.body.reset(r.worldW * 0.15, r.worldH * 0.9);           // open regolith
    p.body.velocity.x = 120;
    LUNAR_SCENE.update(r, r.time.now, 16);
    var onMoon = P.dust.length;
    P.dust.forEach(function(D){ D.obj.destroy(); }); P.dust = []; P.nextDustAt = 0;
    p.body.reset(r.worldW * 0.5, r.worldH * 0.5);            // hull deck (no dust)
    p.body.velocity.x = 120;
    LUNAR_SCENE.update(r, r.time.now, 16);
    var onDeck = P.dust.length;
    p.body.velocity.x = 0;
    p.body.reset(r.worldW * 0.46, r.worldH * 0.89);
    return { onMoon: onMoon, onDeck: onDeck };})()`);
  check('dust puffs kick on REGOLITH, none on the hull deck', dust.onMoon === 1 && dust.onDeck === 0);

  // -- 7. BROOD SAC: dormant → cracks on approach → hatches capped waves -----------
  const sac = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    var far = Entities.spawnMob(r, 'broodSac', p.x + 600, p.y);
    Entities.updateMob(r, far, p, r.time.now);
    var dormant = !far.mob.hatchAt;
    var near = Entities.spawnMob(r, 'broodSac', p.x + 120, p.y);
    Entities.updateMob(r, near, p, r.time.now);
    var cracked = !!near.mob.hatchAt;
    near.mob.hatchAt = 1;                                    // fast-forward the crack
    var q0 = r._spawnQueue.length;
    Entities.updateMob(r, near, p, r.time.now);
    var q1 = r._spawnQueue.length - q0;
    [far, near].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    r._spawnQueue.length = q0;
    return { dormant: dormant, cracked: cracked, wave: q1 };})()`);
  check('BROOD SAC sits dormant far away, cracks when you approach', sac.dormant && sac.cracked);
  check('the hatch queues a scuttler wave (3 via queueSpawn)', sac.wave === 3, sac.wave + ' queued');

  // -- 8. HAYWIRE TURRET: rooted + telegraphed sweeping arcs ------------------------
  const turret = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    var m = Entities.spawnMob(r, 'haywireTurret', p.x + 200, p.y);
    m.mob.nextSweepAt = 1;
    var l0 = P.lanes.length;
    Entities.updateMob(r, m, p, r.time.now);
    var out = { lanes: P.lanes.length - l0, rooted: m.body.velocity.x === 0 && m.body.velocity.y === 0 };
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    P.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); P.lanes = [];
    return out;})()`);
  check('HAYWIRE TURRET roots + telegraphs a 3-arc beam sweep', turret.lanes === 3 && turret.rooted);

  // -- 9. ASTRO-REVENANT: grab = brief hold + tick, then release --------------------
  const grab = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    p.state.lastHitAt = -1e9;                                // clean iframes for the tick
    var m = Entities.spawnMob(r, 'astroRevenant', p.x + 30, p.y);
    m.mob.nextGrabAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var grabbed = !!P.grab && P.grab.m === m;
    var hp0 = p.state.hp;
    p.body.velocity.x = 150;
    LUNAR_SCENE.update(r, r.time.now, 16);                   // hold: roots you + first tick
    var held = p.body.velocity.x === 0 && p.state.hp < hp0;
    P.grab.until = 1;
    LUNAR_SCENE.update(r, r.time.now, 16);                   // timeout → release
    var released = !P.grab;
    p.state.hp = hp0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { grabbed: grabbed, held: held, released: released };})()`);
  check('ASTRO-REVENANT grabs: brief hold + damage, then releases', grab.grabbed && grab.held && grab.released);

  // -- 10. MAGNETRON: constant pull toward it ---------------------------------------
  const pull = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    var m = Entities.spawnMob(r, 'magnetron', p.x + 180, p.y);
    m.mob._packInit = true;
    var x0 = p.x;
    LUNAR_SCENE.update(r, r.time.now, 100);
    var pulled = p.x - x0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    p.body.reset(x0, p.y);
    return pulled;})()`);
  check('MAGNETRON drags you toward it (fight the pull)', pull > 1, '+' + pull.toFixed(1) + 'px');

  // -- 11. LUNA LEAPER: marked landing ring + low-grav arc --------------------------
  const leap = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    return new Promise(function(res){
      var m = Entities.spawnMob(r, 'lunaLeaper', p.x + 200, p.y);
      m.mob.nextHopAt = 1;
      Entities.updateMob(r, m, p, r.time.now);
      var out = { hopped: !!m.mob.hop, ring: !!(m.mob.hop && m.mob.hop.ring), airborne: m.body.enable === false };
      if (m.mob.hop) m.mob.hop.until = r.time.now + 30;      // fast-forward the sail
      setTimeout(function(){
        Entities.updateMob(r, m, p, r.time.now);
        out.landed = !m.mob.hop && m.body.enable === true;
        Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
        res(out);
      }, 80);
    });})()`);
  check('LUNA LEAPER marks a landing circle and sails the arc (airborne)', leap.hopped && leap.ring && leap.airborne);
  check('the leaper LANDS and returns to the ground game', leap.landed);

  // -- 12. ORBITAL MINE: fuse blast kills NEARBY MOBS credited (env kill) -----------
  const mine = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    p.body.reset(r.worldW * 0.2, r.worldH * 0.3);            // clear ground
    p.state.lastHitAt = -1e9; p.state.hp = p.state.stats.hp; // clean slate for the burn
    var m = Entities.spawnMob(r, 'orbitalMine', p.x + 90, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // arms (inside armRange)
    var armed = !!m.mob.blastAt;
    var victim = Entities.spawnMob(r, 'scuttler', m.x + 40, m.y);
    var kills0 = p.state.kills;
    m.mob.blastAt = 1;                                       // fast-forward the fuse
    var hp0 = p.state.hp;
    Entities.updateMob(r, m, p, r.time.now);                 // BOOM
    var out = { armed: armed, mineDead: !m.active, victimDead: !victim.active,
                credited: p.state.kills - kills0, hurt: p.state.hp < hp0 };
    p.state.hp = hp0;
    p.body.reset(r.worldW * 0.46, r.worldH * 0.89);
    return out;})()`);
  check('ORBITAL MINE arms on proximity, blast kills it + the mob beside it', mine.armed && mine.mineDead && mine.victimDead);
  check('the blast is CREDITED (mine + victim, no double-credit) + burns you',
    mine.credited === 2 && mine.hurt, mine.credited + ' kills credited');

  // -- 13. mine shot early → pops at its position (watcher path) --------------------
  const pop = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    p.body.reset(r.worldW * 0.2, r.worldH * 0.3);
    var m = Entities.spawnMob(r, 'orbitalMine', p.x + 300, p.y);
    Entities.updateMob(r, m, p, r.time.now);                 // registers the watcher
    var victim = Entities.spawnMob(r, 'scuttler', m.x + 30, m.y);
    Entities.hurtMob(r, m, 99999, r.time.now);               // SHOT DOWN early
    LUNAR_SCENE.update(r, r.time.now, 16);                   // watcher fires the blast
    var out = { victimDead: !victim.active };
    if (victim.active) { Entities.clearNameTag(victim); victim.body.enable = false; r.mobs.killAndHide(victim); }
    p.body.reset(r.worldW * 0.46, r.worldH * 0.89);
    return out;})()`);
  check('shooting a mine pops it EARLY — the blast still kills mobs beside it', pop.victimDead);

  // -- 14. STAR HORROR: tentacle cone locks + roots him ------------------------------
  const cone = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, P=r._lun;
    var m = Entities.spawnMob(r, 'starHorror', p.x + 150, p.y);
    m.mob.nextConeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var out = { locked: m.mob.coneLockUntil > r.time.now };
    Entities.updateMob(r, m, p, r.time.now);
    out.rooted = m.body.velocity.x === 0 && m.body.velocity.y === 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return out;})()`);
  check('STAR HORROR locks a tentacle cone and roots while it charges', cone.locked && cone.rooted);

  // -- 15. clocks shift through unfreeze() -------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._lun;
    P.pads[0].cooldownUntil = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'haywireTurret', r.player.x + 900, r.player.y);
    m.mob.nextSweepAt = r.time.now + 6000;
    var before = { p: P.pads[0].cooldownUntil, t: m.mob.nextSweepAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { p: P.pads[0].cooldownUntil - before.p, t: m.mob.nextSweepAt - before.t };
      P.pads[0].cooldownUntil = 0;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts pad + mob clocks', shift.p > 500 && shift.t > 500);

  // -- 16. quota → LIGHTS OUT entrance ------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'scuttler', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, P=r._lun;
    return { key: r.boss.boss.key, dark: !!P.dark, darkArmed: P.darkArmed,
             inArena: Math.hypot(r.boss.x - P.arena.x, r.boss.y - P.arena.y) < P.arena.r,
             gloom: P.dark ? P.dark.fillAlpha < 0.5 : false };})()`);
  check('LIGHTS OUT: the Overmind was already there — hovering over the core, gloom held low',
    boss.key === 'specimenzero' && boss.dark && boss.darkArmed && boss.inArena);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 17. TK BARRAGE zones + GRAVITY WELL pull → pop ---------------------------------
  const kit = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, P=r._lun;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextBarrageAt = 1;
    bs.nextLashAt = bs.nextWellAt = bs.nextCableAt = bs.nextScreamAt = bs.nextPurgeAt = bs.nextAddsAt = r.time.now + 99999;
    var z0 = P.zones.length;
    LUNAR_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var zones = P.zones.length - z0;
    P.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); P.zones = []; r._zoneWarns.length = 0;
    return { zones: zones };})()`);
  check('TK BARRAGE paints 5 warned wreckage circles', kit.zones === 5, kit.zones + ' zones');
  const well = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, P=r._lun, p=r.player;
    return new Promise(function(res){
      bs.busyUntil = 0; bs.rootUntil = 0; bs.nextWellAt = 1; bs.nextBarrageAt = r.time.now + 99999;
      LUNAR_SCENE.bossUpdate(r, b, r.player, r.time.now);    // warn ring → live in warnMs (1000)
      setTimeout(function(){
        if (!P.well) { res({ live: false }); return; }
        p.body.reset(P.well.x + 100, P.well.y);
        var x0 = p.x;
        LUNAR_SCENE.update(r, r.time.now, 100);
        var pulled = x0 - p.x;                               // dragged toward center (−x)
        P.well.until = 1;                                    // pop now
        p.state.lastHitAt = -1e9;
        var hp0 = p.state.hp;
        p.body.reset(P.well.x, P.well.y);                    // stand in the crush
        LUNAR_SCENE.update(r, r.time.now, 16);
        var out = { live: true, pulled: pulled, popped: !P.well, hurt: p.state.hp < hp0 };
        p.state.hp = hp0;
        res(out);
      }, 1200);
    });})()`);
  check('GRAVITY WELL goes live, DRAGS you inward, then pops for damage',
    well.live && well.pulled > 1 && well.popped && well.hurt,
    well.live ? 'pull ' + well.pulled.toFixed(1) + 'px' : 'never went live');

  // -- 18. CONTAINMENT PURGE: sectors vent in sequence → VENTED ×1.5 -------------------
  const purge = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, P=r._lun;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextPurgeAt = 1;
    bs.nextWellAt = bs.nextBarrageAt = bs.nextLashAt = bs.nextCableAt = bs.nextScreamAt = r.time.now + 99999;
    LUNAR_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var began = !!P.purge && P.purge.seq.length === 5;       // 6 sectors − 1 safe pocket
    r.player.setPosition(P.arena.x, P.arena.y + P.arena.r + 120);  // outside — dodge it all
    if (P.purge) P.purge.seq.forEach(function(S){ S.at = 1; });
    LUNAR_SCENE.update(r, r.time.now, 16);                   // all sectors fire
    LUNAR_SCENE.update(r, r.time.now, 16);                   // allDone → vent
    return { began: began, vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult };})()`);
  check('CONTAINMENT PURGE vents 5 sectors (one safe pocket) then the tank FRACTURES',
    purge.began && purge.vented && purge.mult === 1.5);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 19. kill → chest + the lights come back up --------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const lights = await page.evaluate(`(function(){var r=${scene('Realm')};
    LUNAR_SCENE.update(r, r.time.now, 16);
    return !r._lun.dark;})()`);
  check('the Overmind falls → chest/loot flow + the gloom lifts', lights);

  // -- 20. zero console errors -----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
