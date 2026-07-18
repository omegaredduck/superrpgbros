// m25 — CS4 "? → ninja" reveal (item 5). The endgame unveiling cutscene:
// 4 shots (roster → ? zoom → oni resolve → THE ONI KING card), every base fn
// renders without throwing, beatTheGame marks cs4 seen, and the scene plays to
// completion and hands off. Fails on ANY console error.
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
  await page.waitForFunction(`typeof game!=='undefined' && CUT && CUT.SCENES.cs4 && game.scene.getScene('Nexus')`, null, { timeout: 15000 });

  // 1. timeline shape
  const shape = await page.evaluate(`(function(){var s=CUT.SCENES.cs4;
    return { n:s.length, bases:s.map(function(sh){return typeof sh.base;}).every(function(t){return t==='function';}) };})()`);
  check('cs4 has 4 shots, all with a base draw fn', shape.n === 4 && shape.bases, 'shots=' + shape.n);

  // 2. every base fn renders without throwing at stages 0..1
  const render = await page.evaluate(`(function(){
    var cv=document.createElement('canvas'); cv.width=240; cv.height=160; var cx=cv.getContext('2d');
    var ok=true, threw=null;
    CUT.SCENES.cs4.forEach(function(sh){ [0,0.3,0.6,1].forEach(function(p){ try{ sh.base(cx, 1, p, 'ninja'); }catch(e){ ok=false; threw=String(e); } }); });
    return { ok:ok, threw:threw };})()`);
  check('all cs4 base fns render across prog 0..1 without throwing', render.ok, render.threw || '');

  // 3. beatTheGame marks cs4 as seen (so it fires once, in the endgame chain)
  const seen = await page.evaluate(`(function(){ bindSave(1, SAVE.blank('ranger')); beatTheGame('ranger');
    return { cs4: ACCOUNT.cutscenesSeen && ACCOUNT.cutscenesSeen.cs4 === true }; })()`);
  check('beatTheGame flips cutscenesSeen.cs4 (endgame chain plays it once)', seen.cs4);

  // 4. the scene actually plays to completion and hands off to the next scene
  const played = await page.evaluate(`(function(){ return new Promise(function(res){
    bindSave(1, SAVE.blank('ninja'));
    var handed=false;
    game.scene.start('Cutscene', {id:'cs4', cls:'ninja', next:function(){ handed=true; }});
    var s=game.scene.getScene('Cutscene');
    // fast-forward: repeatedly skip through blocks/shots
    var t=setInterval(function(){
      try{ if(handed){ clearInterval(t); res({handed:true}); return; } s.skipBlock(); if(s.finish&&s.si>=s.shots.length){ } }catch(e){}
    }, 30);
    setTimeout(function(){ clearInterval(t); res({handed:handed}); }, 8000);
  }); })()`);
  check('cs4 plays through all shots and calls its next() handoff', played.handed);

  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
