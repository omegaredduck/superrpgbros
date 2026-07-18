// cs4 preview — force each shot of the "? → ninja" reveal and screenshot it.
const { chromium } = require('playwright');
const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../game/index.html').replace(/\\/g, '/');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(GAME);
  await page.waitForFunction(`typeof game!=='undefined' && CUT && CUT.SCENES.cs4 && game.scene.getScene('Nexus')`, null, { timeout: 15000 });

  // start the cutscene as the ninja, then take control of the scene
  await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ninja')); game.scene.start('Cutscene', {id:'cs4', cls:'ninja'}); })()`);
  await page.waitForFunction(`game.scene.isActive('Cutscene') && game.scene.getScene('Cutscene').drawShot`, null, { timeout: 10000 });
  await page.waitForTimeout(200);

  async function frame(si, prog, v, file, label) {
    await page.evaluate(`(function(){var s=game.scene.getScene('Cutscene');
      s.done=true; s.si=${si}; s.bi=0; s.prog=${prog}; s.v=${v};
      if(s.fadeRect) s.fadeRect.setAlpha(0); if(s.clearText) s.clearText();
      s.drawShot(); })()`);
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.resolve(__dirname, file) });
    console.log('shot', label, '->', file);
  }
  // selectGrid (roster + "?"), qZoom mid-dissolve, oni assembling by stage, final card
  await frame(0, 1, 0, '/tmp/cs4_1_roster.png', 'roster + ? slot');
  await frame(1, 0.55, 2, '/tmp/cs4_2_zoom.png', '? zoom glitch');
  await frame(2, 0.30, 0, '/tmp/cs4_3a_silhouette.png', 'oni silhouette+horns');
  await frame(2, 0.60, 0, '/tmp/cs4_3b_mask.png', 'oni mask+fangs');
  await frame(2, 1.00, 0, '/tmp/cs4_3c_ignite.png', 'oni eyes ignite');
  await frame(3, 1.00, 0, '/tmp/cs4_4_card.png', 'THE ONI KING card');

  console.log(errs.length ? 'ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no console errors');
  await browser.close();
})();
