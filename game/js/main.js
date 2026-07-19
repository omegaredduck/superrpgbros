// main.js — Phaser boot config. See docs/ARCHITECTURE.md.

// v5 (2026-07-17, Red): DELETE ALL CHARACTERS — a one-time wipe of every save
// slot so the reworked first-playthrough starts clean. Flag-guarded → runs a
// single time on the next load; normal saving is untouched afterward.
(function () {
  try {
    if (typeof SAVE !== 'undefined' && SAVE.storageOk && SAVE.storageOk() && !localStorage.getItem('srb_reset_v5')) {
      for (var s = 1; s <= SAVE.SLOTS; s++) SAVE.clear(s);
      localStorage.setItem('srb_reset_v5', '1');
    }
  } catch (e) {}
})();

// v6 (2026-07-19, Red): MAP TOKENS ARE CROSS-CHARACTER now — the pool moved off
// each per-slot account and into device settings. One-time seed so nobody loses
// tokens in the move: take the highest balance any existing character held and
// carry it into the shared device pool. Flag-guarded (runs once).
(function () {
  try {
    if (typeof SAVE === 'undefined' || !SAVE.storageOk || !SAVE.storageOk()) return;
    if (localStorage.getItem('srb_tokens_v6')) return;
    var best = 0;
    for (var s = 1; s <= SAVE.SLOTS; s++) {
      var r = SAVE.load(s);
      if (r.ok && r.data && r.data.account && typeof r.data.account.mapTokens === 'number')
        best = Math.max(best, r.data.account.mapTokens);
    }
    var st = SAVE.settings();
    if (best > (st.mapTokens || 0)) { st.mapTokens = best; SAVE.saveSettings(); }
    localStorage.setItem('srb_tokens_v6', '1');
  } catch (e) {}
})();

var game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#0f0f1b',
  pixelArt: true,
  // M1 fix (bug #3, v2): RESIZE mode — the canvas always matches its container,
  // so fullscreen FILLS the screen (no letterbox black bars) and you simply see
  // more of the realm. Windowed stays exactly 960×640 because the #game div is
  // fixed at that size in index.html. Scenes read this.scale.width/height
  // instead of assuming 960×640; the wave director's spawn ring grows with the
  // viewport so mobs still spawn off-screen (V11/TM-3).
  scale: {
    parent: 'game',
    fullscreenTarget: 'game',   // fullscreen the #game div itself
    mode: Phaser.Scale.RESIZE,
    width: 960,
    height: 640
  },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, TitleScene, BodySelectScene, NexusScene, RealmScene, BuilderScene, CutsceneScene]   // M3: map builder · v5: story cutscenes · v7: dream-body select
});

// ESC-in-fullscreen fix (2026-07-12): by default the browser eats the Escape
// key to LEAVE fullscreen, which is why P used to double as pause. The Keyboard
// Lock API (Chrome/Edge, secure context incl. http://localhost) routes Escape
// to the page instead — a single tap opens the ESC menu, and holding Escape
// still exits fullscreen as a safety valve. Only the fullscreen key (F) toggles
// fullscreen now. Failure-safe: unsupported → we simply fall back to old
// behavior (still works via the F key + P is gone but menu opens on ESC when
// not fullscreen).
(function () {
  function lock() {
    try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']); } catch (e) {}
  }
  function unlock() {
    try { if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); } catch (e) {}
  }
  game.scale.on('enterfullscreen', lock);
  game.scale.on('leavefullscreen', unlock);
})();

// Re-layout on fullscreen enter/exit / window resize. Title and Nexus build
// their layout in create() from the current size, so a restart is the correct
// re-layout (both are safe scenes; their create() resets the menu guards, so an
// open menu simply closes). The Realm survives — camera + HUD adapt — so if its
// ESC menu is open we just rebuild that overlay in place. Debounced because a
// fullscreen toggle can fire several resize events.
(function () {
  var t = null;
  game.scale.on('resize', function () {
    if (t) clearTimeout(t);
    t = setTimeout(function () {
      ['Title', 'Nexus'].forEach(function (k) {
        if (game.scene.isActive(k)) game.scene.getScene(k).scene.restart();
      });
      var r = game.scene.getScene('Realm');
      if (game.scene.isActive('Realm') && r._menuHandle) MENU.relayout(r);
    }, 120);
  });
})();
