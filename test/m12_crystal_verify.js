// M12 CRYSTAL CAVERNS verification suite — realm 10, registry map 6.
// Registry/data · CAVERN OF WONDERS (264 beats @88 = 180.0s) · chambered
// layout · GROWING CRYSTAL gates (warn → solid wall → crack → SHATTER ring,
// never-all-shut, never-on-your-tile) · rock crush-slow + water + dust ·
// the 8 mapVerbs (lurker wake · golem slam + CORE rear bonus · bat screech
// slow · ram lane charge · resonator rings · moth dust · crawler snip ·
// void beams) · THE SHARDLORD: ceiling-drop entrance, RAINBOW CORE color
// verbs, PRISMATIC OVERLOAD → vented ×1.5, kill → chest.
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

  // -- 1. boot: registry + the sparkle theme --------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`localStorage.clear()`);
  const reg = await page.evaluate(`(function(){
    var m = DATA.audio.music.crystal, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.shardlord;
    return { def: !!MAPS.defs.crystal, roster: DATA.biomes.crystal.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'crystal' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 9-mob roster + console unlock', reg.def && reg.roster === 9 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('CAVERN OF WONDERS: 264 beats @88, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 264 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm ----------------------------------------------------------
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'crystal' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  // M7k: snapshot the gates IMMEDIATELY — on a slow boot the cycle's opening
  // grace can elapse before a post-sleep capture (env timing, not a code bug).
  const realm = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry;
    return { id: r.realmId, gates: C.gates.length, chambers: C.chambers.length,
             chands: C.chandeliers.length,
             allOpen: C.gates.every(function(g){ return g.state === 'open' || g.state === 'warn'; }) };})()`);
  await sleep(600);
  check('crystal scene: 6 chambers + GATES A–D (all open) + arena chandeliers',
    realm.id === 'crystal' && realm.gates === 4 && realm.chambers === 6 && realm.chands === 3 && realm.allOpen);

  // -- 3. park the gate cycle (suite fixture rule) ---------------------------------
  await page.evaluate(`(function(){${scene('Realm')}._cry.grow.nextAt = Infinity;})()`);

  // -- 4. terrain: rock crush-slows, chambers are free, water swims slow -----------
  const terra = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    var out = {};
    p.body.reset(C.chambers[1].x, C.chambers[1].y);          // great hall
    p.body.velocity.x = 100;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    out.hall = p.body.velocity.x;
    p.body.reset(r.worldW * 0.95, r.worldH * 0.95);          // solid rock corner
    p.body.velocity.x = 100;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    out.rock = p.body.velocity.x;
    p.body.reset(C.chambers[3].x, C.chambers[3].y + r.worldH * 0.04);  // lake water, OFF the bridge
    p.body.velocity.x = 100;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    out.water = p.body.velocity.x;
    p.body.velocity.x = 0;
    p.body.reset(C.chambers[0].x, C.chambers[0].y);
    return out;})()`);
  check('rock CRUSH-SLOWS (0.35×), chambers run free, the lake swims slow',
    terra.hall > 95 && terra.rock < 40 && terra.water > 40 && terra.water < 60,
    `hall ${terra.hall.toFixed(0)} rock ${terra.rock.toFixed(0)} water ${terra.water.toFixed(0)}`);

  // -- 5. GATE cycle: warn → wall UP (solid) → crack → SHATTER ring -----------------
  const gate = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    var cfg = r.realmDef.grow, g = C.gates[0];
    CRYSTAL_SCENE._gateWarn(r, C, g, r.time.now, cfg);
    var warned = g.state === 'warn' && !!g.warnG;
    g.warnUntil = 1;                                         // fast-forward (player far away)
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var closed = g.state === 'closed' && g.blocks.every(function(b){ return b.body.enable; }) && g.shard.visible;
    // shatter: park a victim mob on the line, fast-forward
    var v = Entities.spawnMob(r, 'shardling', g.mx + 10, g.my);
    var kills0 = p.state.kills;
    g.shatterAt = 1; g.crackAt = 1;
    CRYSTAL_SCENE.update(r, r.time.now, 16);                 // shatter fires + ring zone queued
    var reopened = g.state === 'open' && g.blocks.every(function(b){ return !b.body.enable; });
    C.zones.forEach(function(z){ z.at = 1; });
    CRYSTAL_SCENE.update(r, r.time.now, 16);                 // the shard ring blasts
    var out = { warned: warned, closed: closed, reopened: reopened,
                victimDead: !v.active, credited: p.state.kills - kills0 };
    if (v.active) { Entities.clearNameTag(v); v.body.enable = false; r.mobs.killAndHide(v); }
    return out;})()`);
  check('GATE A: shimmer warn → the wall GROWS SHUT (solid blocks)', gate.warned && gate.closed);
  check('…then SHATTERS open — the shard ring kills the mob on the line (credited)',
    gate.reopened && gate.victimDead && gate.credited === 1);

  // -- 6. NEVER ALL SHUT + NEVER on an occupied tile --------------------------------
  const rules = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    var cfg = r.realmDef.grow;
    // close gates 0 + 1 outright
    [0, 1].forEach(function(i){ var g = C.gates[i];
      CRYSTAL_SCENE._gateWarn(r, C, g, r.time.now, cfg); g.warnUntil = 1;
      CRYSTAL_SCENE.update(r, r.time.now, 16); });
    var twoClosed = C.gates.filter(function(g){ return g.state === 'closed'; }).length === 2;
    // the cycle must now REFUSE to close a third (2 open = the floor)
    C.grow.nextAt = 1;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var refused = C.gates.filter(function(g){ return g.state !== 'open'; }).length === 2;
    C.grow.nextAt = Infinity;
    // occupied rule: warn gate 2 with the player standing ON the line → defers
    var g2 = C.gates[2];
    CRYSTAL_SCENE._gateWarn(r, C, g2, r.time.now, cfg);
    p.body.reset(g2.mx, g2.my);
    g2.warnUntil = 1;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var deferred = g2.state === 'warn' && g2.warnUntil > r.time.now;
    // cleanup: reopen everything
    p.body.reset(C.chambers[0].x, C.chambers[0].y);
    C.gates.forEach(function(g){
      if (g.state === 'closed') { g.shatterAt = 1; g.crackAt = 1; }
      if (g.state === 'warn') { if (g.warnG) g.warnG.destroy(); g.warnG = null; g.state = 'open'; }
    });
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { twoClosed: twoClosed, refused: refused, deferred: deferred };})()`);
  check('NEVER ALL SHUT: with two gates closed the cycle refuses a third', rules.twoClosed && rules.refused);
  check('a gate NEVER closes on your tile — it defers while you stand in it', rules.deferred);

  // -- 7. AMETHYST LURKER: disguised → shimmer → wakes ------------------------------
  const lurk = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    p.body.reset(C.chambers[1].x, C.chambers[1].y);
    var far = Entities.spawnMob(r, 'amethystLurker', p.x + 500, p.y);
    Entities.updateMob(r, far, p, r.time.now);
    var dormant = !far.mob.wakeAt && !far.mob.awake;
    var near = Entities.spawnMob(r, 'amethystLurker', p.x + 120, p.y);
    Entities.updateMob(r, near, p, r.time.now);
    var warned = !!near.mob.wakeAt;
    near.mob.wakeAt = 1;
    Entities.updateMob(r, near, p, r.time.now);
    var woke = near.mob.awake === true;
    [far, near].forEach(function(m){ Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m); });
    return { dormant: dormant, warned: warned, woke: woke };})()`);
  check('AMETHYST LURKER poses as a cluster, shimmers, then WAKES', lurk.dormant && lurk.warned && lurk.woke);

  // -- 8. GEODE GOLEM: warned slam + the exposed CORE takes rear bonus --------------
  const golem = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    var m = Entities.spawnMob(r, 'geodeGolem', p.x + 150, p.y);
    m.mob.nextSlamAt = 1;
    var z0 = C.zones.length;
    Entities.updateMob(r, m, p, r.time.now);                 // slam telegraph
    var slammed = C.zones.length === z0 + 1 && !!m.mob.pound;
    // rear CORE bonus: he moves AWAY from the player, hit lands from behind
    m.mob.pound = null;
    m.body.velocity.x = 60; m.body.velocity.y = 0;           // moving +x, player at -x → behind
    var hp0 = m.mob.hp;
    Entities.hurtMob(r, m, 20, r.time.now);
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);                 // verb detects the rear hit
    var lost = hp0 - m.mob.hp;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { slammed: slammed, lost: lost };})()`);
  check('GEODE GOLEM telegraphs his slam circle', golem.slammed);
  check('the exposed CORE takes BONUS damage from behind (20 → 30)', golem.lost === 30, golem.lost + ' dmg');

  // -- 9. SHATTERBAT: screech cone locks + DAZES (slow) ------------------------------
  const bat = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var m = Entities.spawnMob(r, 'shatterbat', p.x + 150, p.y);
    m.mob.nextScreechAt = 1;
    // capture the warn's delayedCall so the cone resolves deterministically
    var orig = r.time.delayedCall.bind(r.time), captured = null;
    r.time.delayedCall = function(ms, cb){ captured = cb; return orig(ms, function(){}); };
    Entities.updateMob(r, m, p, r.time.now);
    r.time.delayedCall = orig;
    var locked = m.mob.screechLockUntil > r.time.now;
    if (captured) captured();                                // the screech lands NOW
    var hurt = p.state.hp < hp0;
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var dazed = p.body.velocity.x < 60;
    C.slowUntil = 0; p.state.hp = hp0; p.body.velocity.x = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { locked: locked, hurt: hurt, dazed: dazed };})()`);
  check('SHATTERBAT screech cone lands — you are DAZED (slowed)', bat.locked && bat.hurt && bat.dazed);

  // -- 10. QUARTZ RAM: warned lane → head-down CHARGE --------------------------------
  const ram = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    var m = Entities.spawnMob(r, 'quartzRam', p.x + 200, p.y);
    m.mob.nextChargeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // locks the lane
    var locked = m.mob.lockUntil > r.time.now && !!m.mob._laneG;
    m.mob.lockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);                 // CHARGE begins
    var charging = m.mob.chargeUntil > r.time.now && Math.abs(m.body.velocity.x) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { locked: locked, charging: charging };})()`);
  check('QUARTZ RAM locks his lane, then thunders down it', ram.locked && ram.charging);

  // -- 11. RESONATOR rings + GEMWING MOTH dust ---------------------------------------
  const zone2 = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    var m = Entities.spawnMob(r, 'resonator', p.x + 200, p.y);
    m.mob.nextPulseAt = 1;
    var r0 = C.rings.length;
    Entities.updateMob(r, m, p, r.time.now);
    var pulsed = C.rings.length === r0 + 1;
    // ring crosses the player → damage once
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var RG = C.rings[C.rings.length - 1];
    RG.r0 = Math.hypot(p.x - RG.x, p.y - RG.y) - 2;          // ring band at the player
    RG.maxR = RG.r0 + 4; RG.start = r.time.now - 100; RG.until = r.time.now + 100;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var rang = p.state.hp < hp0;
    p.state.hp = hp0;
    // moth dust
    var mo = Entities.spawnMob(r, 'gemwingMoth', p.x + 300, p.y);
    mo.mob.nextDustAt = 1;
    var d0 = C.dust.length;
    Entities.updateMob(r, mo, p, r.time.now);
    var dusted = C.dust.length === d0 + 1;
    p.body.reset(C.dust[C.dust.length - 1].x, C.dust[C.dust.length - 1].y);
    p.body.velocity.x = 100;
    r.hitstopActive = false;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    p.body.velocity.x = 0;
    C.dust.forEach(function(D){ D.obj.destroy(); }); C.dust = [];
    C.rings.forEach(function(G){ G.g.destroy(); }); C.rings = [];
    [m, mo].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    p.body.reset(C.chambers[1].x, C.chambers[1].y);
    return { pulsed: pulsed, rang: rang, dusted: dusted, slowed: slowed };})()`);
  check('RESONATOR pulses an expanding ring that stings as it crosses you', zone2.pulsed && zone2.rang);
  check('GEMWING MOTH sheds glitter dust that slows you', zone2.dusted && zone2.slowed);

  // -- 12. DEEP CRAWLER snip + VOIDGEM HORROR beams ----------------------------------
  const melee = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry, p=r.player;
    var m = Entities.spawnMob(r, 'deepCrawler', p.x + 100, p.y);
    m.mob.nextSnipAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var snip = m.mob.snipLockUntil > r.time.now;
    var h = Entities.spawnMob(r, 'voidgemHorror', p.x + 200, p.y);
    h.mob.nextBeamAt = 1;
    var l0 = C.lanes.length;
    Entities.updateMob(r, h, p, r.time.now);
    var beams = C.lanes.length === l0 + 2;
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    [m, h].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { snip: snip, beams: beams };})()`);
  check('DEEP CRAWLER locks his pincer cone; VOIDGEM HORROR rakes twin beams', melee.snip && melee.beams);

  // -- 13. clocks shift through unfreeze() --------------------------------------------
  const shift = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry;
    C.grow.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'resonator', r.player.x + 900, r.player.y);
    m.mob.nextPulseAt = r.time.now + 6000;
    var before = { g: C.grow.nextAt, m: m.mob.nextPulseAt };
    r.pauseGame();
    return new Promise(function(res){ setTimeout(function(){
      r._menuHandle.close();
      var dt = { g: C.grow.nextAt - before.g, m: m.mob.nextPulseAt - before.m };
      C.grow.nextAt = Infinity;
      Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
      res(dt);
    }, 700); });})()`);
  check('unfreeze() shifts gate-cycle + mob clocks', shift.g > 500 && shift.m > 500);

  // -- 14. quota → CEILING-DROP entrance ------------------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')};
    r.player.state.kills = DATA.realm.killQuota - 1;
    var m = Entities.spawnMob(r, 'shardling', r.player.x + 60, r.player.y);
    Entities.hurtMob(r, m, 99999, r.time.now);
  })()`);
  await sleep(300);
  await page.evaluate(`(function(){var r=${scene('Realm')}; r.player.setPosition(r.bossPortal.x, r.bossPortal.y);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.boss && r.scanning;})()`,
    null, { timeout: 30000 });
  const boss = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry;
    return { key: r.boss.boss.key, armed: C.bossArmed, big: r.boss.body.width * r.boss.scaleX > 55,
             inArena: Math.hypot(r.boss.x - C.arena.x, r.boss.y - C.arena.y) < C.arena.rx };})()`);
  check('THE SHARDLORD crashes down from the cavern dark (colossus in the fissure)',
    boss.key === 'shardlord' && boss.armed && boss.big && boss.inArena);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 15. the RAINBOW CORE: each color fires its verb ----------------------------------
  const colors = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, C=r._cry;
    var out = {};
    bs.nextOverloadAt = r.time.now + 999999;
    var fire = function(idx){
      bs.busyUntil = 0; bs.rootUntil = 0;
      bs.colorIdx = idx - 1; bs.lockTint = null; bs.nextColorAt = 1;
      CRYSTAL_SCENE.bossUpdate(r, b, r.player, r.time.now);   // locks the color
      var lockOk = bs.lockTint === idx;
      bs.colorLockUntil = 1;
      CRYSTAL_SCENE.bossUpdate(r, b, r.player, r.time.now);   // fires the verb
      return lockOk;
    };
    var z0 = C.zones.length;
    out.pinkLock = fire(0);
    out.pink = C.zones.length - z0 === 5;                     // SHARD VOLLEY
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    var l0 = C.lanes.length;
    fire(1);
    out.cyan = C.lanes.length - l0 === 3;                     // CRYSTAL LANCE
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    fire(2);
    out.purple = C.bossWalls.length === 2;                    // GROWING WALLS
    C.bossWalls.forEach(function(W){ W.shatterAt = 1; });
    CRYSTAL_SCENE.update(r, r.time.now, 16);                  // auto-shatter
    out.purpleGone = C.bossWalls.length === 0;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    var r0 = C.rings.length;
    fire(3);
    out.amber = C.rings.length - r0 === 2;                    // QUAKE FISTS
    C.rings.forEach(function(G){ G.g.destroy(); }); C.rings = [];
    var q0 = r._spawnQueue.length;
    fire(4);
    out.green = r._spawnQueue.length - q0 === 4 &&            // GEODE HATCH
      r._spawnQueue.slice(q0).every(function(e){ return e.key === 'shardling'; });
    r._spawnQueue.length = q0;
    return out;})()`);
  check('PINK locks → SHARD VOLLEY paints 5 circles', colors.pinkLock && colors.pink);
  check('CYAN → 3 lance lanes · PURPLE → 2 growing walls that auto-shatter',
    colors.cyan && colors.purple && colors.purpleGone);
  check('AMBER → twin quake rings · GREEN → 4 shardlings hatch', colors.amber && colors.green);

  // -- 16. PRISMATIC OVERLOAD: five cones sweep → the core burns out grey → VENTED ------
  const over = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, C=r._cry;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.lockTint = null;
    bs.nextOverloadAt = 1; bs.nextColorAt = r.time.now + 999999;
    CRYSTAL_SCENE.bossUpdate(r, b, r.player, r.time.now);
    var began = !!C.overload && C.overload.seq.length === 5;
    r.player.setPosition(C.arena.x, C.arena.y + C.arena.ry + 160);   // outside the wheel
    if (C.overload) C.overload.seq.forEach(function(S){ S.at = 1; });
    CRYSTAL_SCENE.update(r, r.time.now, 16);                  // all five fire
    CRYSTAL_SCENE.update(r, r.time.now, 16);                  // → vented
    return { began: began, vented: bs.ventedUntil > r.time.now, mult: bs.ventDmgMult };})()`);
  check('PRISMATIC OVERLOAD sweeps five colored cones, then the core burns out — VENTED',
    over.began && over.vented && over.mult === 1.5);
  const ventDmg = await page.evaluate(`(function(){var r=${scene('Realm')}, b=r.boss;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150', ventDmg === 150, ventDmg + ' dmg');

  // -- 17. kill → chest + boss walls/glow cleaned ---------------------------------------
  await page.evaluate(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`,
    null, { timeout: 15000 });
  const clean = await page.evaluate(`(function(){var r=${scene('Realm')}, C=r._cry;
    CRYSTAL_SCENE.update(r, r.time.now, 16);
    return C.bossWalls.length === 0 && !C.overload;})()`);
  check('the Shardlord falls → chest/loot flow + his walls are swept away', clean);

  // -- 18. zero console errors -----------------------------------------------------------
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL GREEN — ' + step + ' checks');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
