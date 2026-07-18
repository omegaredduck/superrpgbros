// m29 — BOSS ARENA LOCKS (item 10). Three maps visually box you into a boss
// arena but never actually contained you: lunar (reactor "LOCKED" ring),
// carnival (Big Top with a south-flap gap), grove (Grovekeeper's "TIMBER walls
// box you in"). Each now clamps the player inside the arena every frame during
// the boss fight. This suite pushes the player OUT and asserts they're pulled
// back. Fails on ANY console error.
const { chromium } = require('playwright');
const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
let failures = 0, step = 0;
function check(name, ok, extra) { step++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(step).padStart(2)}  ${name}${extra ? '  — ' + extra : ''}`); if (!ok) failures++; }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const scene = (k) => `game.scene.getScene('${k}')`;
  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.isActive('Title')`, null, { timeout: 20000 });
  await page.evaluate(`${scene('Title')}.createNewGame(1, 'ranger')`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 15000 });

  async function enter(map) {
    await page.evaluate(`game.scene.getScene('Nexus').scene.start('Realm', { mode: 'clear', map: '${map}' })`);
    await page.waitForFunction(`game.scene.isActive('Realm') && ${scene('Realm')}.player`, null, { timeout: 15000 });
    await page.waitForTimeout(200);
  }

  // ---- LUNAR: reactor ring clamp during the boss fight ----
  await enter('lunar');
  const lun = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, A=r._lun.arena;
    // drop the player WAY outside the reactor, run the boss-fight clamp
    p.body.reset(A.x + A.r + 260, A.y + A.r + 260);
    for (var i=0;i<3;i++) LUNAR_SCENE._bound(r);
    var d = Math.hypot(p.x - A.x, p.y - A.y), inside = d <= A.r;
    // the update gates the clamp on scene.boss being active (source contract)
    var gated = LUNAR_SCENE.update.toString().indexOf('scene.boss') >= 0 &&
                LUNAR_SCENE.update.toString().indexOf('_bound') >= 0;
    return { inside: inside, gated: gated, d: Math.round(d), R: Math.round(A.r) };})()`);
  check('LUNAR: player is clamped inside the reactor ring', lun.inside, 'd=' + lun.d + ' R=' + lun.R);
  check('LUNAR: the clamp is wired into update(), gated on an active boss', lun.gated);

  // ---- CARNIVAL: Big Top ellipse clamp during the boss fight ----
  await enter('carnival');
  const car = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player, C=r._car;
    // shove the player through the south flap (below-center, outside the tent)
    p.body.reset(C.arena.x, C.arena.y + 900);
    for (var i=0;i<3;i++) CARNIVAL_SCENE._bound(r);
    var cx=C.arena.x, cy=C.arena.y, erx=0.19*r.worldW, ery=0.165*r.worldH;
    var nd = Math.hypot((p.x-cx)/erx, (p.y-cy)/ery), inside = nd <= 1.02;
    var gated = CARNIVAL_SCENE.update.toString().indexOf('scene.boss') >= 0 &&
                CARNIVAL_SCENE.update.toString().indexOf('_bound') >= 0;
    return { inside: inside, gated: gated, nd: Math.round(nd*100)/100 };})()`);
  check('CARNIVAL: player is clamped inside the Big Top (south flap sealed)', car.inside, 'nd=' + car.nd);
  check('CARNIVAL: the clamp is wired into update(), gated on an active boss', car.gated);

  // ---- GROVE: timber palisade clamp during the Grovekeeper fight ----
  await enter('grove');
  const grv = await page.evaluate(`(function(){var r=${scene('Realm')}, p=r.player;
    // raise the timber ring (as the arrival does) then shove the player out
    r.raiseGroveTimber(r.worldW*0.5, r.worldH*0.25);
    var A = r._groveArena, hasRing = !!r._groveRing;
    p.body.reset(A.x + A.r + 300, A.y);
    for (var i=0;i<3;i++) r.groveBound(p);
    var d = Math.hypot(p.x-A.x, p.y-A.y), inside = d <= A.r;
    // clearing it releases the clamp
    r.clearGroveTimber();
    var cleared = !r._groveArena && !r._groveRing;
    return { hasRing: hasRing, inside: inside, cleared: cleared, R: Math.round(A.r) };})()`);
  check('GROVE: timber ring raised (visual) + player clamped inside it', grv.hasRing && grv.inside, 'R=' + grv.R);
  check('GROVE: clearing the timber (boss death) releases the clamp + ring', grv.cleared);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
