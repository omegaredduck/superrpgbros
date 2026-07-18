// m28 — DISCOVERY CARD + NODE HOVER (item 9). When a corruption is locked in,
// the card SHOWS THE MAP (a thumbnail of the region's biome terrain) and names
// its SPECIAL MECHANICS; hovering any star-map node reads out that region's
// name + mechanics (undiscovered stays anonymous). Fails on ANY console error.
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
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ranger')); ACCOUNT.beaten=false;
    ACCOUNT.discovered=['trainyard','grove']; ACCOUNT.cleared=['trainyard']; ACCOUNT.corrMode='clear';
    game.scene.start('Nexus',{entry:'login'}); })()`);
  await page.waitForFunction(`game.scene.isActive('Nexus')`, null, { timeout: 10000 });
  await page.waitForTimeout(300);
  await page.evaluate(`(function(){var n=game.scene.getScene('Nexus'); n.consoleMap='grove'; n._corrTargetId='grove'; n._corrPhase='locked'; n.buildCorruptionUi();})()`);
  await page.waitForTimeout(200);

  // 1. the card shows a MAP thumbnail (a tileSprite of the region's biome tile)
  const thumb = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    // a TileSprite makes a private fill-texture (random key), so just assert one
    // exists in the card — only the map thumbnail adds a TileSprite here.
    var hasTS = n.consoleUi.some(function(o){ return o.type==='TileSprite'; });
    var texts = n.consoleUi.filter(function(o){return o.text;}).map(function(o){return o.text;}).join(' | ');
    return { hasTS:hasTS, mechLabel: texts.indexOf('SPECIAL MECHANICS')>=0,
      mechText: texts.indexOf('GROVEKEEPER')>=0, name: texts.indexOf('THE GROVE')>=0 };})()`);
  check('discovery card shows a terrain thumbnail (biome tileSprite)', thumb.hasTS);
  check('discovery card labels SPECIAL MECHANICS + names the region + describes the mechanic', thumb.mechLabel && thumb.name && thumb.mechText);

  // 2. corrNodeTip payloads
  const tips = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    return { purged:n.corrNodeTip('trainyard'), found:n.corrNodeTip('grove'),
      whale:n.corrNodeTip('belly'), unknown:n.corrNodeTip('graveyard') };})()`);
  check('hover a PURGED region → name + PURGED + its mechanics', tips.purged.title.indexOf('PURGED') >= 0 && tips.purged.body.length > 0);
  check('hover the DISCOVERED corruption → name + mechanics', tips.found.title.indexOf('GROVE') >= 0 && tips.found.body.length > 0);
  check('hover PATIENT ZERO (whale) → labelled, no spoiler mechanics', tips.whale.title === 'PATIENT ZERO');
  check('hover an UNDISCOVERED region stays anonymous (??? )', tips.unknown.title.indexOf('???') >= 0);

  // 3. the hover zone actually shows the reused tooltip
  const hov = await page.evaluate(`(function(){var n=game.scene.getScene('Nexus');
    var nd=(n._corrNodes||[]).filter(function(x){return x.id==='trainyard';})[0];
    var z=null; n.consoleUi.forEach(function(o){ if(o.type==='Arc' && Math.abs(o.x-nd.x)<1 && Math.abs(o.y-nd.y)<1) z=o; });
    if(z) z.emit('pointerover');
    var vis = n._corrTip && n._corrTip.visible, txt = n._corrTip && n._corrTip.text;
    if(z) z.emit('pointerout');
    var hid = n._corrTip && !n._corrTip.visible;
    return { vis:vis, txt:txt, hid:hid };})()`);
  check('hovering a node shows the tooltip; leaving hides it', hov.vis && hov.txt.indexOf('TRAIN YARD') >= 0 && hov.hid);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
