// m27 — BESTIARY GATING (items 7/8). A creature's field note is REDACTED
// ("??????????", stats "??") until you've BEATEN its realm; name search only
// finds unlocked creatures; the map-scope roster still lists every slot (so you
// see how many remain). Fails on ANY console error.
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
  await page.goto(GAME);
  await page.waitForFunction(`typeof game!=='undefined' && game.scene.getScene('Nexus')`, null, { timeout: 15000 });
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ranger')); ACCOUNT.cleared=[]; game.scene.start('Nexus',{entry:'login'}); })()`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 10000 });
  await page.waitForTimeout(300);

  const uiText = `(function(){var n=game.scene.getScene('Nexus'); var t=[]; (n.bestiaryUi||[]).forEach(function(c){ if(c.text) t.push(c.text); }); return t.join(' | '); })()`;

  // 1. known() gate
  const gate = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    var beforeF = n.bestiaryKnown({realm:'trainyard'});
    ACCOUNT.cleared=['trainyard'];
    var afterT = n.bestiaryKnown({realm:'trainyard'});
    var noRealm = n.bestiaryKnown({kind:'mob',key:'x'});   // edge/suite fallback = known
    ACCOUNT.cleared=[];
    return { beforeF:beforeF, afterT:afterT, noRealm:noRealm };})()`);
  check('bestiaryKnown is false for an unbeaten realm, true once cleared, true for realm-less entries', !gate.beforeF && gate.afterT && gate.noRealm);

  // 2. redacted render on an unbeaten map
  await page.evaluate(`(function(){var n=game.scene.getScene('Nexus'); ACCOUNT.cleared=[]; n.bestiaryScope='trainyard'; n.bestiaryIndex=0; n.buildBestiaryUi();})()`);
  const red = await page.evaluate(uiText);
  check('unbeaten map shows "??????????" and hides the real creature name', red.indexOf('??????????') >= 0 && red.indexOf('Coal Golem') < 0, '');
  check('redacted entry shows "??" stats + UNIDENTIFIED', red.indexOf('??') >= 0 && red.indexOf('UNIDENTIFIED') >= 0);

  // 3. revealed once the realm is beaten
  await page.evaluate(`(function(){var n=game.scene.getScene('Nexus'); ACCOUNT.cleared=['trainyard']; n.buildBestiaryUi();})()`);
  const rev = await page.evaluate(uiText);
  check('beating the map reveals the real field note (Coal Golem, no redaction)', rev.indexOf('Coal Golem') >= 0 && rev.indexOf('??????????') < 0);

  // 4. the roster slot count is the SAME redacted or revealed (you see how many remain)
  const counts = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    ACCOUNT.cleared=[]; n.bestiaryScope='trainyard'; var a=n.bestiaryEntries().length;
    ACCOUNT.cleared=['trainyard']; var b=n.bestiaryEntries().length;
    return { a:a, b:b };})()`);
  check('map-scope roster lists every slot whether beaten or not', counts.a === counts.b && counts.a > 0, counts.a + ' entries');

  // 5. name search only finds unlocked creatures
  const search = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    ACCOUNT.cleared=[]; n.bestiarySearch='coal';
    var locked = n.bestiaryEntries().length;
    ACCOUNT.cleared=['trainyard'];
    var unlocked = n.bestiaryEntries().length;
    n.bestiarySearch='';
    return { locked:locked, unlocked:unlocked };})()`);
  check('name search finds nothing in an unbeaten realm, finds it once beaten', search.locked === 0 && search.unlocked >= 1, 'locked=' + search.locked + ' unlocked=' + search.unlocked);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
