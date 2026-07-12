// ============================================================================
// menu.js — the unified ESC menu (2026-07-12). One overlay used by BOTH the
// chamber (Nexus) and realm runs: Resume · Settings · Exit to load screen.
// Settings holds the split MUSIC / SOUND channels (volume + on-off) and the
// remappable KEYBINDS list (click a key to rebind; on-screen labels re-read
// BINDS immediately). Pure presentation — it only reads/writes SAVE + AUDIO +
// BINDS and calls back into the scene for resume/exit. Failure-safe: any error
// while building a row is swallowed so the menu can never brick a scene.
// ============================================================================
var MENU = (function () {

  var D = 200;                        // overlay depth floor (above all HUD)

  function open(scene, cfg) {
    cfg = cfg || {};
    if (scene._menuHandle) return scene._menuHandle;      // already open — idempotent
    scene._menuOpen = true;
    scene._bindsCapture = false;

    var page = 'root';
    var capturing = null;             // action id currently awaiting a key
    var objs = [];                    // current-page objects (cleared on nav)

    function Wd() { return scene.scale.width; }
    function Hd() { return scene.scale.height; }

    // Persistent full-view backdrop; interactive so clicks can't fall through
    // to the game underneath. Oversized + scrollFactor 0 = covers any camera.
    var dim = scene.add.rectangle(Wd() / 2, Hd() / 2, Wd() * 2, Hd() * 2, 0x05060c, 0.82)
      .setScrollFactor(0).setDepth(D).setInteractive();

    function clearObjs() { objs.forEach(function (o) { try { o.destroy(); } catch (e) {} }); objs = []; }

    function txt(x, y, s, o) {
      o = o || {};
      var t = scene.add.text(x, y, s, {
        fontFamily: 'monospace', fontSize: o.size || 16,
        color: o.color || '#f4f4f4', align: o.align || 'left',
        fontStyle: o.bold ? 'bold' : 'normal'
      }).setScrollFactor(0).setDepth(D + 2).setOrigin(o.ox == null ? 0 : o.ox, o.oy == null ? 0.5 : o.oy);
      objs.push(t);
      return t;
    }

    function btn(x, y, s, cb, o) {
      o = o || {};
      var t = txt(x, y, s, o);
      var base = o.color || '#ffe08a';
      t.setInteractive({ useHandCursor: true });
      t.on('pointerover', function () { if (!capturing) t.setColor('#ffffff'); });
      t.on('pointerout', function () { t.setColor(base); });
      t.on('pointerdown', function () { if (capturing) return; try { AUDIO.play('ui'); } catch (e) {} cb(t); });
      return t;
    }

    function box(cx, cy, w, h) {
      var r = scene.add.rectangle(cx, cy, w, h, 0x14162b, 0.96)
        .setScrollFactor(0).setDepth(D + 1).setStrokeStyle(2, 0x41a6f6, 0.9);
      objs.push(r);
      return r;
    }

    // ---- ROOT PAGE -------------------------------------------------------
    // Resume + Settings are always present; each scene supplies its own exit
    // buttons (chamber: exit to load screen; realm: return to chamber + exit).
    function renderRoot() {
      var extras = cfg.extraButtons || [];
      var cx = Wd() / 2, cy = Hd() / 2, w = 460;
      var rows = 2 + extras.length;                        // Resume, Settings, + extras
      var h = 150 + rows * 46;
      box(cx, cy, w, h);
      var y = cy - h / 2 + 44;
      txt(cx, y, cfg.title || 'PAUSED', { size: 34, color: '#ffcd75', ox: 0.5, bold: true });
      y += 52;
      btn(cx, y, 'Resume', function () { close(); }, { size: 20, ox: 0.5, color: '#a7f070' }); y += 46;
      btn(cx, y, 'Settings', function () { page = 'settings'; render(); }, { size: 20, ox: 0.5 }); y += 46;
      extras.forEach(function (b) {
        btn(cx, y, b.label, function () { close(true); if (b.onClick) b.onClick(); },
          { size: 19, ox: 0.5, color: b.color || '#ff9e6d' });
        y += 46;
      });
      txt(cx, cy + h / 2 - 22, BINDS.keyLabel('menu') + ' resume  ·  ' + BINDS.keyLabel('fullscreen') + ' fullscreen',
        { size: 12, color: '#94b0c2', ox: 0.5 });
    }

    // ---- SETTINGS PAGE ---------------------------------------------------
    function volRow(y, name, get, setV, isOn, setOn) {
      var cx = Wd() / 2, left = cx - 250;
      txt(left, y, name, { size: 16, color: '#f4f4f4' });
      // on/off toggle
      var on = isOn();
      btn(left + 92, y, on ? '[ ON ]' : '[ OFF ]', function () {
        setOn(!isOn()); render();
      }, { size: 14, ox: 0, color: on ? '#a7f070' : '#8a93a8' });
      // minus / bar / plus
      btn(left + 176, y, '◄', function () { setV(get() - 0.1); render(); }, { size: 16, ox: 0.5 });
      var v = Math.max(0, Math.min(1, get())), n = Math.round(v * 10);
      var bar = new Array(n + 1).join('█') + new Array(10 - n + 1).join('░');
      txt(left + 196, y, bar + ' ' + Math.round(v * 100) + '%',
        { size: 15, color: on ? '#f4f4f4' : '#6b7590' });
      btn(left + 420, y, '►', function () { setV(get() + 0.1); render(); }, { size: 16, ox: 0.5 });
    }

    function keyRow(x, y, item) {
      txt(x, y, item.label, { size: 14, color: '#cbd5e6' });
      var chipX = x + 214, isCap = capturing === item.id;
      btn(chipX, y, isCap ? '[ press a key ]' : '[ ' + BINDS.keyLabel(item.id) + ' ]',
        function () { beginCapture(item.id); },
        { size: 14, ox: 1, color: isCap ? '#ffcd75' : '#a7d3ff' });
    }

    function renderSettings() {
      var cx = Wd() / 2, cy = Hd() / 2, w = 640, h = 512;
      box(cx, cy, w, h);
      var top = cy - h / 2;
      txt(cx, top + 34, 'SETTINGS', { size: 26, color: '#ffcd75', ox: 0.5, bold: true });

      txt(cx - 250, top + 74, 'AUDIO', { size: 13, color: '#7cc7ff' });
      volRow(top + 104, 'Music', AUDIO.musicVolume, AUDIO.setMusicVolume, AUDIO.musicOn, AUDIO.setMusicOn);
      volRow(top + 136, 'Sound', AUDIO.sfxVolume, AUDIO.setSfxVolume, AUDIO.sfxOn, AUDIO.setSfxOn);

      txt(cx - 250, top + 178, 'KEYBINDS', { size: 13, color: '#7cc7ff' });
      txt(cx + 250, top + 178, 'click a key to rebind', { size: 11, color: '#8a93a8', ox: 1 });

      // two columns
      var list = (DATA.keybinds && DATA.keybinds.list) || [];
      var perCol = Math.ceil(list.length / 2), rowH = 30, y0 = top + 208;
      for (var i = 0; i < list.length; i++) {
        var col = i < perCol ? 0 : 1;
        var row = i - col * perCol;
        keyRow(cx - 250 + col * 268, y0 + row * rowH, list[i]);
      }

      var by = cy + h / 2 - 34;
      btn(cx - 250, by, 'Reset keybinds', function () {
        SAVE.resetBinds();
        if (scene.refreshBindLabels) scene.refreshBindLabels();
        if (scene.rig && scene.rig.refresh) scene.rig.refresh();
        if (typeof window !== 'undefined' && window.updateFooter) window.updateFooter();
        render();
      }, { size: 14, ox: 0, color: '#ff9e6d' });
      btn(cx + 250, by, 'Back', function () { page = 'root'; render(); }, { size: 16, ox: 1, color: '#a7f070' });
    }

    // ---- key capture -----------------------------------------------------
    function beginCapture(id) {
      if (capturing) return;
      capturing = id;
      scene._bindsCapture = true;                          // suppress dispatch
      render();
      scene.input.keyboard.once('keydown', function (ev) {
        capturing = null;
        if (ev && ev.code && ev.code !== 'Escape') {
          BINDS.rebind(id, ev.code);
          if (scene.refreshBindLabels) scene.refreshBindLabels();
          if (scene.rig && scene.rig.refresh) scene.rig.refresh();
          if (typeof window !== 'undefined' && window.updateFooter) window.updateFooter();
        }
        render();
        // keep dispatch suppressed a hair past this event so the rebind key
        // doesn't also fire its new action on the same press.
        scene.time.delayedCall(80, function () { scene._bindsCapture = false; });
      });
    }

    function render() { clearObjs(); if (page === 'settings') renderSettings(); else renderRoot(); }

    function close(silent) {
      clearObjs();
      try { dim.destroy(); } catch (e) {}
      scene._menuOpen = false;
      scene._menuHandle = null;
      scene._bindsCapture = false;
      if (!silent && cfg.onResume) cfg.onResume();
    }

    render();
    var handle = {
      close: close, rebuild: render,
      page: function () { return page; },
      setPage: function (p) { page = p; render(); }
    };
    scene._menuHandle = handle;
    return handle;
  }

  // Rebuild the menu in place after a resize (main.js calls this).
  function relayout(scene) {
    if (scene._menuHandle) scene._menuHandle.rebuild();
  }

  return { open: open, relayout: relayout };
})();
