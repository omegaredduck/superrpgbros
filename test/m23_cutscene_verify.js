// m23 — CUTSCENE RIG + wiring verify (2026-07-17, Opus). Covers:
//  · CutsceneScene registered · cutscenesSeen schema + v4→v5 migrate
//  · fresh slot routes into CS0 (virus-attack intro, item 2) + marks seen/persists
//  · beating the game (belly) grants the class T5 legendary set to the VAULT
//    (no auto-equip) + flips beaten + marks CS2/CS3 seen (item 1)
//  · shot lists present · a scene skips to completion. Fails on ANY console error.
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
  const sleep = (ms) => page.waitForTimeout(ms);

  await page.goto(GAME);
  await page.waitForFunction(`typeof game !== 'undefined' && game.scene.getScene('Cutscene') && game.scene.isActive('Title')`, null, { timeout: 15000 });

  // 1. rig present
  check('CutsceneScene registered', await page.evaluate(`!!game.scene.getScene('Cutscene')`));
  check('CUT.SCENES has cs0..cs3 + csReveal', await page.evaluate(`!!(CUT&&CUT.SCENES&&CUT.SCENES.cs0&&CUT.SCENES.cs1&&CUT.SCENES.cs2&&CUT.SCENES.cs3&&CUT.SCENES.csReveal)`));
  const counts = await page.evaluate(`({cs0:CUT.SCENES.cs0.length,cs1:CUT.SCENES.cs1.length,cs2:CUT.SCENES.cs2.length,cs3:CUT.SCENES.cs3.length,csReveal:CUT.SCENES.csReveal.length})`);
  // v7 (2026-07-19, Red): cs1 lost its final "caretaker online" shot to the new
  // csReveal scene (played AFTER the dream-body select, so it shows YOUR body).
  check('shot counts (cs0:5 cs1:4 cs2:5 cs3:6 csReveal:1)', counts.cs0 === 5 && counts.cs1 === 4 && counts.cs2 === 5 && counts.cs3 === 6 && counts.csReveal === 1, JSON.stringify(counts));

  // 2. schema: fresh save carries cutscenesSeen
  check('SAVE.blank has cutscenesSeen {cs0..cs3}=false', await page.evaluate(`(function(){var a=SAVE.blank('ranger').account.cutscenesSeen;return a&&a.cs0===false&&a.cs3===false;})()`));

  // 3. v4 → v5 migrate defaults the new fields (lossless)
  await page.evaluate(`localStorage.setItem('srb_save_3', JSON.stringify({
    v:4, account:{unlockedClasses:['ranger'],graveyard:[],potions:{hp:0,mp:0,att:0,def:0,spd:0,dex:0},collected:[],
      records:{bestLevel:1,deaths:0,totalKills:0,realmsEntered:0,realmsClosed:0}},
    vault:[], character:{cls:'ranger',level:1,xp:0,potionsDrunk:{hp:0,mp:0,att:0,def:0,spd:0,dex:0},
      equipment:{weapon:null,ability:null,armor:null,ring:null}}, meta:{createdAt:1,savedAt:2}}))`);
  const mig = await page.evaluate(`SAVE.load(3)`);
  check('v4 save loads', mig.ok === true);
  check('migrated to v5 with campaign + cutscene fields', mig.ok && mig.data.v === 5 &&
    Array.isArray(mig.data.account.discovered) && mig.data.account.beaten === false &&
    mig.data.account.mapTokens === 3 && mig.data.account.cutscenesSeen && mig.data.account.cutscenesSeen.cs0 === false);

  // 4. fresh slot routes into CS0 (and marks cs0/cs1 seen + persists)
  await page.evaluate(`(function(){var t=game.scene.getScene('Title'); t.starting=false; t.createNewGame(1,'ranger',true);})()`);
  await sleep(4000);
  const fresh = await page.evaluate(`({active: game.scene.isActive('Cutscene'), id:(game.scene.getScene('Cutscene')||{}).sceneId, seen:ACCOUNT.cutscenesSeen, saved: (SAVE.load(1).data||{}).account})`);
  check('fresh slot opens CS0 (not the Chamber)', fresh.active === true && fresh.id === 'cs0');
  check('CS0/CS1 marked seen + persisted to disk', fresh.seen.cs0 === true && fresh.seen.cs1 === true && fresh.saved.cutscenesSeen.cs0 === true);

  // 5. a cutscene skips to completion (hold-skip → finish)
  const skipped = await page.evaluate(`(function(){var s=game.scene.getScene('Cutscene'); s.nextFn=function(){}; for(var i=0;i<40;i++) s.skipBlock(); return {done:s.done, si:s.si};})()`);
  check('skipping marches through every shot to the end', skipped.si >= CUT_len(counts.cs0) - 1 || skipped.done === true, JSON.stringify(skipped));

  // 6. beating the game grants the T5 legendary set to the VAULT (no auto-equip)
  const beat = await page.evaluate(`(function(){ bindSave(1, SAVE.blank('knight')); beatTheGame('knight');
    return { beaten:ACCOUNT.beaten, seen:ACCOUNT.cutscenesSeen, vault:GAME_SAVE.vault.slice(), collected:ACCOUNT.collected.slice(),
             equip:CURRENT.equipment, belly:(ACCOUNT.cleared||[]).indexOf('belly')>=0 }; })()`);
  check('beaten flag set + CS2/CS3 marked seen', beat.beaten === true && beat.seen.cs2 === true && beat.seen.cs3 === true);
  check('knight T5 legendary set granted to vault', ['kw5', 'ka5', 'ar5', 'r5'].every(k => beat.vault.indexOf(k) >= 0), beat.vault.join(','));
  check('legendaries collected (survive death) not auto-equipped', ['kw5', 'ka5', 'ar5', 'r5'].every(k => beat.collected.indexOf(k) >= 0) && beat.equip.weapon === null);
  check('belly recorded as cleared', beat.belly === true);

  // 7. no console errors
  check('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL GREEN — ' + step + ' checks' : `\n${failures} FAILURE(S)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
function CUT_len(n) { return n; }
