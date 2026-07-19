// m30 — ARCADE MODE + CROSS-CHARACTER TOKENS + LEGENDARY UNLOCK (2026-07-19, Red).
// Verifies: (1) map tokens are device-level and shared across slots; (2) ARCADE
// is gated behind beating the game and beatTheGame flips the device flag; (3) an
// arcade new-game seeds a post-campaign save (beaten + cutscenes seen) with NO
// legendary set; a story new-game does not; (4) the nexus opens the free
// selector (not the corruption scanner) for a beaten save; (5) the vault's
// 30-token LEGENDARY UNLOCK spends tokens and banks the class set. Fails on ANY
// console error. Points at the /tmp assembled game tree.
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
  const sleep = (ms) => page.waitForTimeout(ms);

  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && DATA && SAVE && game.scene.getScene('Nexus')`, null, { timeout: 15000 });

  // 1. CROSS-CHARACTER TOKENS — device-level pool, shared regardless of slot
  const tok = await page.evaluate(`(function(){
    var s = SAVE.settings(); s.mapTokens = 5; SAVE.saveSettings();
    var read0 = SAVE.tokens();
    SAVE.addTokens(3); var read1 = SAVE.tokens();           // 8
    var spentOk = SAVE.spendTokens(2), read2 = SAVE.tokens(); // 6
    var spentNo = SAVE.spendTokens(999);                    // refused
    // switching the bound slot must NOT change the pool
    bindSave(1, SAVE.blank('ranger')); var afterA = SAVE.tokens();
    bindSave(2, SAVE.blank('wizard')); var afterB = SAVE.tokens();
    return { read0:read0, read1:read1, spentOk:spentOk, read2:read2, spentNo:spentNo, afterA:afterA, afterB:afterB,
      deviceLevel: (SAVE.settings().mapTokens === read2) };})()`);
  check('SAVE.tokens/addTokens/spendTokens operate on the device pool', tok.read0 === 5 && tok.read1 === 8 && tok.spentOk === true && tok.read2 === 6 && tok.spentNo === false);
  check('Token pool is CROSS-CHARACTER (unchanged when the bound slot changes)', tok.afterA === 6 && tok.afterB === 6 && tok.deviceLevel);

  // 2. ARCADE unlock gating — off by default, flipped by beating the game
  const gate = await page.evaluate(`(function(){
    SAVE.settings().arcadeUnlocked = false; SAVE.saveSettings();
    var before = !!SAVE.settings().arcadeUnlocked;
    bindSave(1, SAVE.blank('ranger')); beatTheGame('ranger');
    return { before: before, after: !!SAVE.settings().arcadeUnlocked };})()`);
  check('ARCADE is LOCKED by default (before any beat)', gate.before === false);
  check('beatTheGame() unlocks ARCADE device-wide', gate.after === true);

  // 3. new-game seeding — arcade = post-campaign, no legendary; story = fresh
  const seed = await page.evaluate(`(function(){
    var t = ${scene('Title')};
    // read the PERSISTED save (createNewGame saves before enterSlot) so the
    // Title.starting bind-guard can't skew what we inspect.
    t.starting = false; t.createNewGame(1, 'ranger', false, 'arcade');
    var ad = SAVE.load(1).data;
    var a = { beaten: ad.account.beaten, cs0: ad.account.cutscenesSeen.cs0, cs4: ad.account.cutscenesSeen.cs4, vault: ad.vault.slice() };
    t.starting = false; t.createNewGame(2, 'ranger', false, 'story');
    var sd = SAVE.load(2).data;
    var s = { beaten: sd.account.beaten };
    return { a:a, s:s };})()`);
  check('ARCADE new game seeds a POST-CAMPAIGN save (beaten + all cutscenes seen)',
    seed.a.beaten === true && seed.a.cs0 === true && seed.a.cs4 === true);
  check('ARCADE grants NO legendary set (vault has no nw5/ar5/r5/w5-type set)',
    !['w5','nw5','ww5','kw5','a5','na5','ar5','r5'].some(function(k){ return seed.a.vault.indexOf(k) >= 0; }), 'vault=' + JSON.stringify(seed.a.vault));
  check('STORY new game is NOT pre-beaten', seed.s.beaten === false);

  // 4. the nexus opens the FREE SELECTOR for a beaten save, the SCANNER otherwise
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ranger')); ACCOUNT.beaten = true;
    ${scene('Title')}.scene.start('Nexus', { entry:'none' }); })()`);
  await page.waitForFunction(`game.scene.isActive('Nexus') && ${scene('Nexus')}.scene.key === 'Nexus'`, null, { timeout: 15000 });
  await sleep(300);
  const branch = await page.evaluate(`(function(){
    var n = ${scene('Nexus')};
    function hasText(needle){ return (n.consoleUi||[]).some(function(o){ return o && typeof o.text==='string' && o.text.indexOf(needle) >= 0; }); }
    // beaten → classic selector (no "FIND THE CORRUPTION")
    ACCOUNT.beaten = true; if (n.consoleUi) n.toggleConsole(); n.toggleConsole();
    var beatenHasScanner = hasText('FIND THE CORRUPTION');
    if (n.consoleUi) n.toggleConsole();
    // not beaten → the scanner
    ACCOUNT.beaten = false; n.toggleConsole();
    var freshHasScanner = hasText('FIND THE CORRUPTION');
    if (n.consoleUi) n.toggleConsole();
    ACCOUNT.beaten = true;
    return { beatenHasScanner: beatenHasScanner, freshHasScanner: freshHasScanner };})()`);
  check('Beaten (arcade) save → nexus shows the FREE SELECTOR, not the corruption scanner', branch.beatenHasScanner === false);
  check('Non-beaten save → nexus shows the FIND THE CORRUPTION scanner', branch.freshHasScanner === true);

  // 5. VAULT legendary unlock — 30 tokens → class set banked, tokens debited
  const buy = await page.evaluate(`(function(){
    var n = ${scene('Nexus')};
    var s = SAVE.settings(); s.mapTokens = 30; SAVE.saveSettings();   // exactly the cost
    // render the vault in the >=30 state (button path builds without error)
    if (n.vaultUi) n.toggleVault(); n.toggleVault();
    var rendered = !!n.vaultUi;
    if (n.vaultUi) n.toggleVault();
    // exercise the exchange mechanism the button runs
    var before = SAVE.tokens();
    var ok = SAVE.spendTokens(DATA.console.legendaryCost);
    grantLegendarySet(CURRENT.cls);
    persist();
    var keys = [DATA.classGear[CURRENT.cls].weapon[5], DATA.classGear[CURRENT.cls].ability[5], 'ar5', 'r5'];
    var banked = keys.every(function(k){ return GAME_SAVE.vault.indexOf(k) >= 0; });
    return { rendered: rendered, before: before, ok: ok, after: SAVE.tokens(), banked: banked, cost: DATA.console.legendaryCost };})()`);
  check('Vault renders the LEGENDARY UNLOCK button state at >= cost tokens', buy.rendered);
  check('Legendary unlock spends ' + buy.cost + ' tokens and banks the class T5 set to the vault',
    buy.before === 30 && buy.ok === true && buy.after === 0 && buy.banked === true);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
