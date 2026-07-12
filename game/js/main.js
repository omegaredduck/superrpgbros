// main.js — Phaser boot config. See docs/ARCHITECTURE.md.
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
  scene: [BootScene, TitleScene, NexusScene, RealmScene, BuilderScene]   // M3: map builder (dev tool)
});

// Re-layout on fullscreen enter/exit. Title and Nexus build their layout in
// create() from the current size, so a restart is the correct re-layout (both
// are safe scenes). The Realm needs nothing — camera + HUD adapt — except a
// rebuild of the pause overlay if it happens to be open. Debounced because a
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
      if (game.scene.isActive('Realm') && r.paused) r.buildPauseMenu();
    }, 120);
  });
})();
