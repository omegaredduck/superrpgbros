// M16 THE COLOSSEUM verification suite — realm 14, registry map 10.
// Registry/data · GLORY.EXE (420 beats @140 = 180.0s) · ROUND arena + WALL
// collision (NO WRAP — the campaign's one exception) + full reachability · THE
// PROGRAM (BEAST RELEASE / TRAPDOOR SHUFFLE / CHARIOT LAP / INTERMISSION,
// announce + park) · the 12 mob mechanics (gladiator slash + frontal block ·
// retiarius net root · lion pounce lane · legionary frontal block · handler
// whip-rally respects hitstop · elephant stampede + stomp · minotaur charge +
// slam · crowd-favorite taunt window + shield refund + no-chain · hound lunge ·
// vestal weaken glyph · executioner slam + cleave · chariot orbit + lane) ·
// DIVINITY HIMSELF: lift+surf entrance, cup splash slicks, verdict doom-ring
// env credit, tribute, backhand, WINE FLOOD halves → vent ×1.5, P2 double
// verdict + rim cup toss + ENCORE once/phase + DIONYSIAN DELUGE ring-wave →
// longest vent, kill → chest.
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
  const ev = (js) => page.evaluate(js);

  // -- 1. boot: registry + GLORY.EXE ---------------------------------------------------
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await ev(`localStorage.clear()`);
  const reg = await ev(`(function(){
    var m = DATA.audio.music.colosseum, beats = 0, equal = true;
    m.tracks.forEach(function(t){ var s = 0; t.notes.forEach(function(n){ s += n[1]; }); if (!beats) beats = s; if (Math.abs(s - beats) > 1e-6) equal = false; });
    var bd = DATA.bosses.divinityHimself;
    return { def: !!MAPS.defs.colosseum, roster: DATA.biomes.colosseum.mobs.length,
             mapOwned: bd.mapOwned === true, noFiller: !bd.patterns.radial && !bd.patterns.stream,
             hints: bd.hints.length,
             consoleRow: DATA.console.maps.some(function(x){ return x.id === 'colosseum' && !x.locked; }),
             beats: beats, musicSec: beats * 60 / m.bpm, equalBeats: equal };})()`);
  check('registry def + 12-mob roster + console unlock', reg.def && reg.roster === 12 && reg.consoleRow);
  check('boss mapOwned, NO radial/stream, ≤6 hints', reg.mapOwned && reg.noFiller && reg.hints <= 6);
  check('GLORY.EXE: 420 beats @140, equal tracks, EXACTLY 180.0s',
    reg.equalBeats && reg.beats === 420 && Math.abs(reg.musicSec - 180) < 1e-9, reg.beats + ' beats');

  // -- 2. enter the realm --------------------------------------------------------------
  await ev(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });
  await ev(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: 'colosseum' })`);
  await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
  await sleep(600);
  const layout = await ev(`(function(){var r=${scene('Realm')}, C=r._col, A=C.arena;
    var reach = Math.hypot(r._realmStart.x - A.x, r._realmStart.y - A.y) < A.trackR;   // arch → boss circle on open sand
    return { id: r.realmId, gates: C.gates.length, traps: C.trapdoors.length, crowd: C.crowd.length,
             wallR: Math.round(A.wallR), trackR: Math.round(A.trackR), reach: reach,
             spawnInside: Math.hypot(r.player.x - A.x, r.player.y - A.y) < A.wallR };})()`);
  check('ROUND scene: 3 gates + 5 trapdoors + crowd ring + arch spawn reaches the boss circle',
    layout.id === 'colosseum' && layout.gates === 3 && layout.traps === 5 && layout.crowd >= 12 && layout.reach && layout.spawnInside);

  // -- 3. park program + wipe ambient mobs, then ROUND WALL (no wrap) -------------------
  await ev(`(function(){var r=${scene('Realm')};
    r._col.program.nextAt = Infinity; r._col.program.stage = null;
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
  })()`);
  const wall = await ev(`(function(){var r=${scene('Realm')}, C=r._col, A=C.arena, p=r.player;
    var angles = [0, Math.PI*0.5, Math.PI, Math.PI*1.5, Math.PI*0.25], allInside = true, cancelled = true;
    angles.forEach(function(a){
      p.body.reset(A.x + Math.cos(a)*(A.wallR + 300), A.y + Math.sin(a)*(A.wallR + 300));
      p.body.velocity.x = Math.cos(a)*400; p.body.velocity.y = Math.sin(a)*400;
      COLOSSEUM_SCENE.update(r, r.time.now, 16);
      var d = Math.hypot(p.x - A.x, p.y - A.y);
      if (d > A.wallR) allInside = false;
      var ox = Math.cos(a), oy = Math.sin(a), vn = p.body.velocity.x*ox + p.body.velocity.y*oy;
      if (vn > 1) cancelled = false;   // outward velocity component killed at the wall
    });
    p.body.velocity.x = 0; p.body.velocity.y = 0;
    p.body.reset(A.x, A.y + A.spawnR);
    return { allInside: allInside, cancelled: cancelled };})()`);
  check('ROUND WALL: player never escapes past the wall (no wrap) — bounced from every angle',
    wall.allInside && wall.cancelled);

  // -- 4. THE PROGRAM: all 4 stages announce + park ------------------------------------
  const program = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    var order = r.realmDef.program.order, kinds = [];
    order.forEach(function(kind){ C.program.stage = null; COLOSSEUM_SCENE._startStage(r, kind, r.time.now); if (C.program.stage) kinds.push(C.program.stage.kind); });
    C.program.stage = null;
    // parked: the cycle refuses to open a stage
    C.program.nextAt = Infinity;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var parked = !C.program.stage;
    return { kinds: kinds.join(','), parked: parked };})()`);
  check('THE PROGRAM announces all 4 stages and parks on Infinity',
    program.kinds === 'beast,trapdoor,chariot,intermission' && program.parked);

  // -- 5. BEAST RELEASE: gates grind open + a beast wave queues -------------------------
  const beast = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    var q0 = r._spawnQueue.length;
    COLOSSEUM_SCENE._beastRelease(r, r.time.now);
    var opened = C.gates.every(function(g){ return g.openUntil > r.time.now; });
    var wave = r._spawnQueue.length - q0;
    r._spawnQueue.length = q0;
    return { opened: opened, wave: wave };})()`);
  check('BEAST RELEASE: all gates open + a depth-scaled beast wave queues', beast.opened && beast.wave >= 3);

  // -- 6. TRAPDOOR SHUFFLE: warned under feet → opens → FALL ejects (not death) ---------
  const trap = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    COLOSSEUM_SCENE._trapShuffle(r, r.time.now);
    var warned = C.trapdoors.filter(function(t){ return t.state === 'warn' && t.warnG; });
    var warnedN = warned.length;
    var TD = warned[0];
    // stand on the (still-warned) hatch: no fall yet
    p.body.reset(TD.x, TD.y); p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var safeWhileWarned = Math.hypot(p.x - TD.x, p.y - TD.y) < 4 && p.state.hp === hp0;
    // hatch OPENS under the player → fall = damage + eject, still ALIVE
    TD.openAt = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var opened = TD.state === 'open';
    var ejected = Math.hypot(p.x - TD.x, p.y - TD.y) > 40 && p.state.hp < hp0 && p.state.alive;
    // reset trapdoors
    C.trapdoors.forEach(function(t){ t.state='closed'; t.spr.setVisible(false); if (t.warnG){ try{t.warnG.destroy();}catch(e){} t.warnG=null; } t.warnAt=Infinity; t.openAt=Infinity; t.closeAt=Infinity; });
    r._zoneWarns.length = 0;
    p.state.hp = hp0; p.body.reset(C.arena.x, C.arena.y + C.arena.spawnR);
    return { warnedN: warnedN, safeWhileWarned: safeWhileWarned, opened: opened, ejected: ejected };})()`);
  check('TRAPDOOR SHUFFLE: warns under the feet first (safe), then opens and the FALL ejects (not death)',
    trap.warnedN === 3 && trap.safeWhileWarned && trap.opened && trap.ejected);

  // -- 7. CHARIOT LAP: racers ride the rim, despawn cleanly on stage end ----------------
  const lap = await ev(`(function(){var r=${scene('Realm')}, C=r._col, A=C.arena;
    COLOSSEUM_SCENE._chariotLap(r, r.time.now);
    var spawned = C.stageMobs.length;
    var onTrack = C.stageMobs.every(function(m){ return Math.abs(Math.hypot(m.x-A.x, m.y-A.y) - A.trackR) < 40; });
    COLOSSEUM_SCENE._endStage(r, r.time.now);
    var cleaned = C.stageMobs.length === 0;
    return { spawned: spawned, onTrack: onTrack, cleaned: cleaned };})()`);
  check('CHARIOT LAP: racers spawn on the rim track and despawn cleanly when the stage ends',
    lap.spawned >= 1 && lap.onTrack && lap.cleaned);

  // -- 8. INTERMISSION: rose/goblet scatter --------------------------------------------
  const inter = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    C.drops = [];
    COLOSSEUM_SCENE._intermission(r, r.time.now);
    var n = (C.drops || []).length;
    (C.drops||[]).forEach(function(d){ try{d.obj.destroy();}catch(e){} }); C.drops = [];
    return { n: n };})()`);
  check('INTERMISSION scatters roses + goblets onto the sand', inter.n >= 4);

  // -- 9. GLADIATOR: sword-glint → warned slash cone + shield eats frontal shots --------
  const glad = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'gladiator', p.x + 120, p.y);
    m.mob.slashAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var warned = m.mob._slashLock > r.time.now && !!m.mob._slashG;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob._slashLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // cone FIRES
    var hurt = p.state.hp < hp0;
    p.state.hp = hp0;
    // frontal shield block: a shot into the face (player side, -x) dies, a shot behind (+x) survives
    var front = Entities.fireProjectile(r, r.playerShots, m.x - 24, m.y, 0, 0, 5, 3000, 'arrow', false);
    var back  = Entities.fireProjectile(r, r.playerShots, m.x + 24, m.y, 0, 0, 5, 3000, 'arrow', false);
    Entities.updateMob(r, m, p, r.time.now);
    var blocked = !front.active && back.active;
    if (back.active) Entities.killProjectile(r.playerShots, back);
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, hurt: hurt, blocked: blocked };})()`);
  check('GLADIATOR: glint → warned slash cone lands, and the shield eats a FRONTAL shot (rear open)',
    glad.warned && glad.hurt && glad.blocked);

  // -- 10. RETIARIUS: net → brief ROOT (releases on hitstop) → trident jab --------------
  const net = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    var m = Entities.spawnMob(r, 'retiarius', p.x + 140, p.y);
    m.mob.nextNetAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var warned = m.mob._netLock > r.time.now && !!m.mob._netG;
    m.mob._netLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // net LANDS
    var rooted = !!C.netRoot;
    p.body.velocity.x = 200; r.hitstopActive = false;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var pinned = Math.abs(p.body.velocity.x) < 1;     // held in place
    r.hitstopActive = true;                           // hitstop RELEASES the net
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var released = !C.netRoot;
    r.hitstopActive = false;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob._jabLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // trident JAB
    var jabbed = p.state.hp < hp0;
    p.state.hp = hp0; p.body.velocity.x = 0; C.netRoot = null;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, rooted: rooted, pinned: pinned, released: released, jabbed: jabbed };})()`);
  check('RETIARIUS: net marks a circle → SHORT root (pins, breaks on hitstop) → trident jab',
    net.warned && net.rooted && net.pinned && net.released && net.jabbed);

  // -- 11. WAR LION: crouch → pounce along a marked lane --------------------------------
  const lion = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'warLion', p.x + 200, p.y);
    m.mob.pounceAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var crouch = m.mob._pounceLock > r.time.now && !!m.mob._pounceG;
    m.mob._pounceLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // POUNCE
    var pouncing = m.mob.pounceUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { crouch: crouch, pouncing: pouncing };})()`);
  check('WAR LION crouches (tail-flick warn), then POUNCES down the marked lane', lion.crouch && lion.pouncing);

  // -- 12. SHIELD LEGIONARY: frontal block ~100°, flanks/back open ----------------------
  const legion = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'shieldLegionary', p.x - 160, p.y);  // faces player (+x)
    var front = Entities.fireProjectile(r, r.playerShots, m.x + 26, m.y, 0, 0, 5, 3000, 'arrow', false);
    var flank = Entities.fireProjectile(r, r.playerShots, m.x, m.y - 26, 0, 0, 5, 3000, 'arrow', false);
    var back  = Entities.fireProjectile(r, r.playerShots, m.x - 26, m.y, 0, 0, 5, 3000, 'arrow', false);
    Entities.updateMob(r, m, p, r.time.now);
    var out = { front: !front.active, flank: flank.active, back: back.active };
    [front, flank, back].forEach(function(s){ if (s.active) Entities.killProjectile(r.playerShots, s); });
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return out;})()`);
  check('SHIELD LEGIONARY blocks the FRONTAL shot; the flank and back land (never total immunity)',
    legion.front && legion.flank && legion.back);

  // -- 13. BEAST HANDLER: whip-rally buffs a beast (mobs only) + respects hitstop -------
  const handler = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var h = Entities.spawnMob(r, 'beastHandler', p.x + 300, p.y);
    var beast = Entities.spawnMob(r, 'warHound', h.x + 60, h.y);
    h.mob.nextBuffAt = 1; r.hitstopActive = false;
    Entities.updateMob(r, h, p, r.time.now);
    var buffed = beast.mob._buffUntil > r.time.now && beast.mob.spdMult > 1;
    // ...but NOT during hitstop
    var fresh = Entities.spawnMob(r, 'warHound', h.x + 60, h.y - 20);
    h.mob.nextBuffAt = 1; r.hitstopActive = true;
    Entities.updateMob(r, h, p, r.time.now);
    var respected = !(fresh.mob._buffUntil > r.time.now);
    r.hitstopActive = false;
    [h, beast, fresh].forEach(function(o){ Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); });
    return { buffed: buffed, respected: respected };})()`);
  check('BEAST HANDLER whip-rally buffs a nearby beast (mobs only) and respects hitstop',
    handler.buffed && handler.respected);

  // -- 14. WAR ELEPHANT: stampede lanes + quake-ring stomp up close ---------------------
  const eleph = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    var m = Entities.spawnMob(r, 'warElephant', p.x + 400, p.y);
    m.mob.stampedeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);          // trumpet → lanes warned
    var warnedLanes = !!m.mob._stampG && m.mob._stampLock > r.time.now;
    var l0 = C.lanes.length;
    m.mob._stampLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // lanes FIRE
    var stampeded = C.lanes.length - l0 === r.realmDef.mobs ? false : (C.lanes.length - l0) === m.mob.def.stampede.laneCount;
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    // stomp up close
    m.body.reset(p.x + 60, p.y); m.mob.stampedeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);          // stomp warn
    var g0 = C.rings.length;
    m.mob._stompLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // stomp RING
    var stomped = C.rings.length - g0 === 1;
    C.rings.forEach(function(g){ g.g.destroy(); }); C.rings = [];
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warnedLanes: warnedLanes, stampeded: stampeded, stomped: stomped };})()`);
  check('WAR ELEPHANT trumpets warned stampede lanes, then quake-ring STOMPS up close',
    eleph.warnedLanes && eleph.stampeded && eleph.stomped);

  // -- 15. MINOTAUR: charge lane → axe-slam circle where he stops -----------------------
  const mino = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    var m = Entities.spawnMob(r, 'minotaur', p.x + 220, p.y);
    m.mob.chargeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var chargeWarn = m.mob._chargeLock > r.time.now && !!m.mob._chargeG;
    m.mob._chargeLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // CHARGE
    var charging = m.mob.chargeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    var z0 = C.zones.length;
    m.mob.chargeUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);          // stops → SLAM circle
    var slammed = C.zones.length - z0 === 1;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { chargeWarn: chargeWarn, charging: charging, slammed: slammed };})()`);
  check('MINOTAUR paws → warned charge lane → axe-SLAM circle where he stops',
    mino.chargeWarn && mino.charging && mino.slammed);

  // -- 16. CROWD FAVORITE: hit him mid-taunt; cheer SHIELD refunds, can't chain ---------
  const fav = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'crowdFavorite', p.x + 120, p.y);
    m.mob.nextTauntAt = 1;
    Entities.updateMob(r, m, p, r.time.now);          // TAUNT (vulnerable)
    var taunting = m.mob._taunting === true;
    var hp0 = m.mob.hp;
    Entities.hurtMob(r, m, 20, r.time.now);           // mid-taunt damage LANDS
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var landed = m.mob.hp < hp0;
    m.mob.tauntUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);          // taunt ends → SHIELD raises
    var shielded = m.mob._shielded === true;
    var sHp = m.mob.hp;
    Entities.hurtMob(r, m, 25, r.time.now);           // shielded → REFUNDED
    r.hitstopActive = false;
    Entities.updateMob(r, m, p, r.time.now);
    var refunded = m.mob.hp === sHp;
    m.mob.shieldUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);          // shield drops → cooldown set
    var dropped = m.mob._shielded === false && m.mob.shieldCdUntil > r.time.now;
    m.mob.nextTauntAt = 1; Entities.updateMob(r, m, p, r.time.now);
    m.mob.tauntUntil = 1; Entities.updateMob(r, m, p, r.time.now);   // cannot chain another shield
    var noChain = m.mob._shielded === false;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { taunting: taunting, landed: landed, shielded: shielded, refunded: refunded, dropped: dropped, noChain: noChain };})()`);
  check('CROWD FAVORITE: mid-taunt damage LANDS; the cheer SHIELD refunds and cannot chain',
    fav.taunting && fav.landed && fav.shielded && fav.refunded && fav.dropped && fav.noChain);

  // -- 17. WAR HOUND: pack lunger — lunge-glint → dash ---------------------------------
  const hound = await ev(`(function(){var r=${scene('Realm')}, p=r.player;
    var m = Entities.spawnMob(r, 'warHound', p.x + 160, p.y);
    m.mob.lungeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var glint = m.mob._lungeLock > r.time.now;
    m.mob._lungeLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // dash begins
    Entities.updateMob(r, m, p, r.time.now);          // dash velocity applied
    var lunging = m.mob.lungeUntil > r.time.now && Math.hypot(m.body.velocity.x, m.body.velocity.y) > 300;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { glint: glint, lunging: lunging };})()`);
  check('WAR HOUND lunge-glint warns, then it DASHES the pack lunge', hound.glint && hound.lunging);

  // -- 18. VESTAL CURSER: glyph blooms where you stand → weaken zone (slow + weaken) ----
  const vestal = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    var m = Entities.spawnMob(r, 'vestalCurser', p.x + 220, p.y);
    m.mob.glyphAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var glyphed = m.mob._glyphLock > r.time.now && !!m.mob._glyphG;
    var pc0 = C.patches.length;
    m.mob._glyphLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // glyph zone armed (warnMs 0)
    COLOSSEUM_SCENE.update(r, r.time.now, 16);         // _runZones BLOOMS → weaken zone
    var zone = C.patches.length - pc0 === 1 && C.patches[C.patches.length-1].weakenMult;
    var Z = C.patches[C.patches.length-1];
    // stand inside → slowed
    p.body.reset(Z.x, Z.y); p.body.velocity.x = 100; r.hitstopActive = false;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var slowed = p.body.velocity.x < 70;
    // shots fired from inside land weakened (0.7x)
    var s = Entities.fireProjectile(r, r.playerShots, p.x + 500, p.y, 0, 0, 10, 3000, 'arrow', false);
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var weakened = s.proj.dmg === 7;
    Entities.killProjectile(r.playerShots, s);
    for (var i=C.patches.length-1;i>=0;i--){ if (C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    p.body.velocity.x = 0; p.body.reset(C.arena.x, C.arena.y + C.arena.spawnR);
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { glyphed: glyphed, zone: !!zone, slowed: slowed, weakened: weakened };})()`);
  check('VESTAL CURSER blooms a glyph where you stand → weaken zone (slows + weakens your shots)',
    vestal.glyphed && vestal.zone && vestal.slowed && vestal.weakened);

  // -- 19. EXECUTIONER: warned slam circle + follow-through cleave sector ---------------
  const exe = await ev(`(function(){var r=${scene('Realm')}, C=r._col, p=r.player;
    var m = Entities.spawnMob(r, 'executioner', p.x + 150, p.y);
    m.mob.exeAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var warned = m.mob._exeLock > r.time.now && !!m.mob._exeG;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    m.mob._exeLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // SLAM lands + cleave arms
    var slammed = p.state.hp < hp0 && m.mob._cleaveLock > r.time.now;
    p.state.lastHitAt = -1e9; var hp1 = p.state.hp;
    m.mob._cleaveLock = 1;
    Entities.updateMob(r, m, p, r.time.now);          // CLEAVE follow-through
    var cleaved = p.state.hp < hp1;
    p.state.hp = hp0;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { warned: warned, slammed: slammed, cleaved: cleaved };})()`);
  check('EXECUTIONER: warned SLAM circle lands then the follow-through CLEAVE sector', exe.warned && exe.slammed && exe.cleaved);

  // -- 20. CHARIOT RACER: orbits the rim + telegraphs a warned crossing lane ------------
  const chariot = await ev(`(function(){var r=${scene('Realm')}, C=r._col, A=C.arena, p=r.player;
    var m = Entities.spawnMob(r, 'chariotRacer', A.x + A.trackR, A.y);
    Entities.updateMob(r, m, p, r.time.now);
    var orbiting = Math.hypot(m.body.velocity.x, m.body.velocity.y) > 100 && Math.abs(m.body.velocity.x) < m.mob.def.chariotRun.orbitSpeed + 5;
    m.mob.laneAt = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var laneWarn = m.mob._laneLockUntil > r.time.now && !!m.mob._laneG;
    var l0 = C.lanes.length;
    m.mob._laneLockUntil = 1;
    Entities.updateMob(r, m, p, r.time.now);
    var lane = C.lanes.length - l0 === 1;
    C.lanes.forEach(function(l){ if (l.g) l.g.destroy(); }); C.lanes = [];
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return { orbiting: orbiting, laneWarn: laneWarn, lane: lane };})()`);
  check('CHARIOT RACER orbits the rim track and telegraphs a warned crossing lane',
    chariot.orbiting && chariot.laneWarn && chariot.lane);

  // -- 21. unfreeze() shifts every map clock -------------------------------------------
  const shift = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    C.program.nextAt = r.time.now + 5000;
    var m = Entities.spawnMob(r, 'gladiator', r.player.x + 900, r.player.y);
    m.mob.slashAt = r.time.now + 6000;
    C.doomRings.push({ x:0, y:0, r:10, until: r.time.now + 7000, moveAt: r.time.now + 1, nextTickAt: r.time.now + 1, tickMs:600, dmg:1, chaseSpeed:1, g:r.add.graphics() });
    var b0 = { prog: C.program.nextAt, slash: m.mob.slashAt, doom: C.doomRings[0].until };
    COLOSSEUM_SCENE.unfreeze(r, 1000);
    var out = { prog: C.program.nextAt - b0.prog, slash: m.mob.slashAt - b0.slash, doom: C.doomRings[0].until - b0.doom };
    try { C.doomRings[0].g.destroy(); } catch(e){} C.doomRings = [];
    C.program.nextAt = Infinity;
    Entities.clearNameTag(m); m.body.enable = false; r.mobs.killAndHide(m);
    return out;})()`);
  check('unfreeze() shifts program + mob + doom-ring clocks', shift.prog === 1000 && shift.slash === 1000 && shift.doom === 1000);

  // -- 22. quota → LIFT + WINE-WAVE SURF entrance (deterministic) -----------------------
  await ev(`(function(){var r=${scene('Realm')};
    r.mobs.children.iterate(function(o){ if (o && o.active) { Entities.clearNameTag(o); o.body.enable = false; r.mobs.killAndHide(o); } });
    var caps = [], orig = r.time.delayedCall.bind(r.time);
    r.time.delayedCall = function(ms, cb){ caps.push(cb); return orig(ms, function(){}); };
    r.startBossFight();
    for (var i = 0; i < 40 && !(r.boss && r.scanning); i++) { caps.splice(0).forEach(function(f){ try { f(); } catch(e){} }); }
    r.time.delayedCall = orig;
  })()`);
  const boss = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    return { key: r.boss && r.boss.boss.key, scanning: r.scanning, armed: C.bossArmed,
             parked: C.program.nextAt === Infinity,
             center: r.boss ? Math.hypot(r.boss.x - C.arena.x, r.boss.y - C.arena.y) < 60 : false };})()`);
  check('DIVINITY HIMSELF: gilded lift + WINE-WAVE SURF → he lands dry at the boss circle, scanning',
    boss.key === 'divinityHimself' && boss.scanning && boss.armed && boss.center);
  check('the Program holds its breath on boss arrival', boss.parked);
  await page.keyboard.press('Enter');
  await sleep(250);

  // -- 23. P1 CUP SPLASH → lingering wine slicks (slide-through) ------------------------
  const splash = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col;
    bs._colInit = true; bs.phase = 1; bs.busyUntil = 0; bs.rootUntil = 0; bs.encoreUsed = {};
    bs.nextSigAt = r.time.now + 9e9; bs.verbIdx = 0; bs.nextVerbAt = 1;
    var z0 = C.zones.length;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    var splashed = C.zones.length - z0 === 3 && C.zones[C.zones.length-1].fromBoss;
    var pc0 = C.patches.length;
    C.zones.forEach(function(z){ z.at = 1; });
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var slicks = C.patches.length > pc0 && C.patches[C.patches.length-1].slideMult > 1;
    // slide-through: standing on a slick amplifies your velocity (control loss)
    var SL = C.patches[C.patches.length-1];
    p.body.reset(SL.x, SL.y); p.body.velocity.x = 100; r.hitstopActive = false;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var slid = p.body.velocity.x > 110;
    for (var i=C.patches.length-1;i>=0;i--){ if (C.patches[i].obj) C.patches[i].obj.destroy(); C.patches.splice(i,1); }
    p.body.velocity.x = 0; p.body.reset(C.arena.x, C.arena.y + 100);
    return { splashed: splashed, slicks: slicks, slid: slid };})()`);
  check('CUP SPLASH paints 3 boss circles → lingering wine SLICKS you slide through', splash.splashed && splash.slicks && splash.slid);

  // -- 24. THE VERDICT doom-ring: chases, CLIPS MOBS (env credit) + hits you ------------
  const verdict = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1; bs.nextSigAt = r.time.now + 9e9;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    var made = C.doomRings.length === 1;
    var DR = C.doomRings[0];
    // clip a parked mob → env credit
    var v = Entities.spawnMob(r, 'warHound', DR.x, DR.y);
    var kills0 = p.state.kills;
    DR.nextTickAt = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var clipped = !v.active && p.state.kills - kills0 === 1;
    // ...and it hits the player
    DR.x = p.x; DR.y = p.y; DR.nextTickAt = 1;
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var hitYou = p.state.hp < hp0;
    p.state.hp = hp0;
    C.doomRings.forEach(function(d){ try{d.g.destroy();}catch(e){} }); C.doomRings = [];
    if (v.active) { Entities.clearNameTag(v); v.body.enable = false; r.mobs.killAndHide(v); }
    return { made: made, clipped: clipped, hitYou: hitYou };})()`);
  check('THE VERDICT doom-ring clips MOBS (env credit) and ticks the player (fromBoss)', verdict.made && verdict.clipped && verdict.hitYou);

  // -- 25. TRIBUTE RAIN + GOLDEN BACKHAND ----------------------------------------------
  const tb = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1; bs.nextSigAt = r.time.now + 9e9;
    var z0 = C.zones.length;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    var tribute = C.zones.length - z0 === r.boss.boss.def.patterns.tributeRain.count;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    // GOLDEN BACKHAND — warned cone → captured swat
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 3; bs.nextVerbAt = 1;
    p.body.reset(b.x + 120, b.y); p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    var orig = r.time.delayedCall.bind(r.time), cap = null;
    r.time.delayedCall = function(ms, cb){ cap = cb; return orig(ms, function(){}); };
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    r.time.delayedCall = orig;
    var busy = bs.busyUntil > r.time.now;
    p.body.velocity.x = 0; p.body.velocity.y = 0; r.hitstopActive = false;
    if (cap) cap();
    var hurt = p.state.hp < hp0, knocked = Math.hypot(p.body.velocity.x, p.body.velocity.y) > 150;
    p.state.hp = hp0; p.body.velocity.x = 0; p.body.velocity.y = 0;
    return { tribute: tribute, busy: busy, hurt: hurt, knocked: knocked };})()`);
  check('TRIBUTE RAIN scatters warned circles · GOLDEN BACKHAND cones then swats + knocks back',
    tb.tribute && tb.busy && tb.hurt && tb.knocked);

  // -- 26. SIGNATURE (P1) WINE FLOOD: half swept (credit), safe spared → VENTED ×1.5 ----
  const flood = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col, A=C.arena;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.nextVerbAt = r.time.now + 9e9; bs.nextSigAt = 1; bs.phase = 1;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);       // WINE FLOOD warns
    var warned = !!C.wave;
    var side = C.wave.side;
    var v = Entities.spawnMob(r, 'warHound', side ? A.x + A.wallR*0.4 : A.x - A.wallR*0.4, A.y);
    p.body.reset(side ? A.x - A.wallR*0.4 : A.x + A.wallR*0.4, A.y);
    p.state.lastHitAt = -1e9; var hp0 = p.state.hp; var kills0 = p.state.kills;
    C.wave.at = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);             // the FLOOD hits the marked half
    var swept = C.wave.fired && !v.active && p.state.kills - kills0 === 1 && p.state.hp === hp0;
    C.wave.ventAt = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);             // he gazes into the empty cup → VENTED
    var vented = !C.wave && bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    if (v.active) { Entities.clearNameTag(v); v.body.enable = false; r.mobs.killAndHide(v); }
    p.state.hp = hp0; p.body.reset(A.x, A.y + 100);
    return { warned: warned, swept: swept, vented: vented };})()`);
  check('WINE FLOOD: the warned half sweeps mobs (credited), the safe half is spared, then VENTED ×1.5',
    flood.warned && flood.swept && flood.vented);
  const ventDmg = await ev(`(function(){var r=${scene('Realm')}, b=r.boss;
    b.boss.ventedUntil = r.time.now + 3000; b.boss.ventDmgMult = 1.5;
    var hp0 = b.boss.hp; Entities.hurtBoss(r, b, 100); return hp0 - b.boss.hp;})()`);
  check('vented damage lands at 150 (×1.5)', ventDmg === 150, ventDmg + ' dmg');

  // -- 27. PHASE TWO swap → DOUBLE VERDICT + rim CUP TOSS -------------------------------
  const p2 = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col, A=C.arena;
    bs.ventedUntil = 0; bs.busyUntil = 0; bs.rootUntil = 0;
    bs.hp = bs.maxHp * 0.4; bs.nextVerbAt = r.time.now + 9e9; bs.nextSigAt = r.time.now + 9e9;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);       // → DRUNK GOD (phase 2)
    var phase2 = bs.phase === 2;
    // DOUBLE VERDICT (two doom-rings)
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 0; bs.nextVerbAt = 1; bs.nextSigAt = r.time.now + 9e9;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    var doubled = C.doomRings.length === 2;
    C.doomRings.forEach(function(d){ try{d.g.destroy();}catch(e){} }); C.doomRings = [];
    // CUP TOSS travels the RIM only
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 1; bs.nextVerbAt = 1;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);
    var tossed = !!C.cupToss;
    C.cupToss.launchAt = r.time.now;                   // launch NOW → pr=0 (rides the rim, not done)
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var onRim = !!C.cupToss && C.cupToss.launched && Math.abs(Math.hypot(C.cupToss.x - A.x, C.cupToss.y - A.y) - A.trackR) < 30;
    if (C.cupToss) { if (C.cupToss.spr) C.cupToss.spr.destroy(); if (C.cupToss.warnG) C.cupToss.warnG.destroy(); C.cupToss = null; }
    return { phase2: phase2, doubled: doubled, tossed: tossed, onRim: onRim };})()`);
  check('PHASE 2 (DRUNK GOD): DOUBLE VERDICT casts two doom-rings; CUP TOSS boomerangs the RIM only',
    p2.phase2 && p2.doubled && p2.tossed && p2.onRim);

  // -- 28. ENCORE! — one BEAST RELEASE, ONCE per phase ---------------------------------
  const encore = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.encoreUsed = {}; bs.phase = 2;
    bs.verbIdx = 2; bs.nextVerbAt = 1; bs.nextSigAt = r.time.now + 9e9;
    var q0 = r._spawnQueue.length;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);       // ENCORE → 3 hounds
    var called = r._spawnQueue.length - q0 === bs.def.patterns.encore.hounds &&
      r._spawnQueue.slice(q0).every(function(e){ return e.bossWave && e.key === 'warHound'; });
    var q1 = r._spawnQueue.length;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.verbIdx = 2; bs.nextVerbAt = 1;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);       // spent → reroute, no new hounds
    var onceOnly = r._spawnQueue.length === q1;
    r._spawnQueue.length = q0;
    C.zones.forEach(function(z){ if (z.ring) z.ring.destroy(); }); C.zones = []; r._zoneWarns.length = 0;
    return { called: called, onceOnly: onceOnly };})()`);
  check('ENCORE! orders one BEAST RELEASE (3 hounds, bossWave) — ONCE per phase', encore.called && encore.onceOnly);

  // -- 29. SIGNATURE (P2) DIONYSIAN DELUGE: rain → ring-wave → LONGEST vent -------------
  const deluge = await ev(`(function(){var r=${scene('Realm')}, b=r.boss, bs=b.boss, p=r.player, C=r._col, A=C.arena;
    bs.busyUntil = 0; bs.rootUntil = 0; bs.ventedUntil = 0; bs.phase = 2;
    bs.nextVerbAt = r.time.now + 9e9; bs.nextSigAt = 1;
    COLOSSEUM_SCENE.bossUpdate(r, b, p, r.time.now);       // DELUGE
    var made = !!C.deluge && C.deluge.rain.length === bs.def.patterns.deluge.rainCount;
    p.body.reset(A.x + A.wallR + 500, A.y);               // out of the rain
    C.deluge.rain.forEach(function(rn){ rn.at = 1; });
    COLOSSEUM_SCENE.update(r, r.time.now, 16);            // all rain fires
    C.deluge.ringWaveAt = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);            // ring-wave born
    var ringBorn = !!C.deluge.ring;
    // put the player on the wavefront → it hits
    p.body.reset(A.x + C.deluge.ring.r, A.y); p.state.lastHitAt = -1e9; var hp0 = p.state.hp;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    var waveHit = p.state.hp < hp0; p.state.hp = hp0;
    C.deluge.ring.until = 1;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);            // → LONGEST vent
    var vented = !C.deluge && bs.ventedUntil > r.time.now && bs.ventDmgMult === 1.5;
    p.body.reset(A.x, A.y + 100);
    return { made: made, ringBorn: ringBorn, waveHit: waveHit, vented: vented };})()`);
  check('DIONYSIAN DELUGE: wine rains everywhere → a ring-wave pulses out → the LONGEST vent',
    deluge.made && deluge.ringBorn && deluge.waveHit && deluge.vented);

  // -- 30. kill → chest + his machinery swept ------------------------------------------
  await ev(`(function(){var r=${scene('Realm')}; Entities.hurtBoss(r, r.boss, 999999);})()`);
  await page.waitForFunction(`(function(){var r=${scene('Realm')}; return !!r.chest || !!r.pendingLoot;})()`, null, { timeout: 15000 });
  const clean = await ev(`(function(){var r=${scene('Realm')}, C=r._col;
    COLOSSEUM_SCENE.update(r, r.time.now, 16);
    return !C.wave && !C.deluge && !C.cupToss && C.doomRings.length === 0 && !C.bossArmed;})()`);
  check('DIVINITY HIMSELF falls → chest/loot flow + all his machinery swept', clean);

  // -- 31. zero console errors ---------------------------------------------------------
  check('zero console/page errors on boot + full run', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log(`\nRESULT: ${step - failures}/${step}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASH:', e); process.exit(1); });
