// ============================================================================
// scenes.js — Boot → Title → Nexus → Realm flow (ARCHITECTURE.md §5).
// Scenes collect intents, tick entity updates, and render state. They do not
// own gameplay math (that's sim.js/entities.js/data.js) or storage (save.js).
// ============================================================================

// Active save. Set by TitleScene; ACCOUNT/CURRENT are views into GAME_SAVE so
// existing gameplay code keeps reading/writing the same shapes.
var SAVE_SLOT = null;      // 1..3
var GAME_SAVE = null;      // full schema object (save.js blank())
var ACCOUNT = null;        // = GAME_SAVE.account
var CURRENT = null;        // = GAME_SAVE.character

function bindSave(slot, data) {
  SAVE_SLOT = slot;
  GAME_SAVE = data;
  ACCOUNT = data.account;
  CURRENT = data.character;
}
function persist() { if (SAVE_SLOT && GAME_SAVE) SAVE.save(SAVE_SLOT, GAME_SAVE); }
function freshCharacter() {
  return { cls: 'ranger', level: 1, xp: 0, potionsDrunk: SAVE.zeroPots(),
           equipment: SAVE.emptyEquip() };               // M3: gear dies with the character
}

// M3: after any gear change (chest take, vault swap) re-derive the live stats
// from the one truth (class + level + pots + equipment — ARCHITECTURE §6) and
// heal by the max-HP/MP delta (gaining +60 HP armor grants those 60 filled;
// removing it clamps down — never free damage, never a free full heal).
function applyEquipmentChange(scene) {
  var st = scene.player.state, cls = DATA.classes[st.cls];
  var before = st.stats;
  st.stats = SIM.statsFor(cls, st.level, CURRENT.potionsDrunk, CURRENT.equipment);
  st.hp = Math.min(st.stats.hp, st.hp + Math.max(0, st.stats.hp - before.hp));
  st.mp = Math.min(st.stats.mp, st.mp + Math.max(0, st.stats.mp - before.mp));
  persist();                                             // a gear change is real immediately
}

// Item display helpers (M3) — one place for tier color/name text.
function itemTint(key)  { return DATA.tiers[DATA.items[key].tier].color; }
function itemColor(key) { return '#' + ('00000' + itemTint(key).toString(16)).slice(-6); }
function itemLabel(key) { var it = DATA.items[key]; return DATA.tiers[it.tier].name + ' · ' + it.name; }

// --- M1 shared presentation helpers ----------------------------------------

// Portal swirl: particles orbit inward and fade (cosmetic — Math.random OK).
function portalSwirl(scene, x, y, tint) {
  var J = DATA.juice.swirl;
  return scene.time.addEvent({
    delay: J.intervalMs, loop: true, callback: function () {
      var a = Math.random() * Math.PI * 2, r = J.radius;
      var p = scene.add.image(x + Math.cos(a) * r, y + Math.sin(a) * r, 'px')
        .setTint(tint).setDepth(4);
      var o = { t: 0 };
      scene.tweens.add({
        targets: o, t: 1, duration: J.durationMs,
        onUpdate: function () {
          var rr = r * (1 - o.t), aa = a + o.t * 3;
          p.setPosition(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr).setAlpha(1 - o.t * 0.7);
        },
        onComplete: function () { p.destroy(); }
      });
    }
  });
}

// The fullscreen key (rebindable, default F) toggles fullscreen in any scene.
// Reads the live binding via the dispatcher so a rebind takes effect at once;
// guarded because some environments refuse fullscreen. ESC no longer exits
// fullscreen — main.js keyboard-locks Escape so it reaches the menu instead.
function wireFullscreen(scene) {
  scene.input.keyboard.on('keydown', function (ev) {
    if (scene._bindsCapture) return;
    if (BINDS.actionForEvent(ev) === 'fullscreen') {
      try { scene.scale.toggleFullscreen(); } catch (e) {}
    }
  });
}

// ------------------------------------------------------------------- BOOT --
var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Boot' }); },
  create: function () {
    TEX.generateAll(this);
    SIM.seed(20260711);
    this.scene.start('Title');
  }
});

// ------------------------------------------------------------------ TITLE --
// Welcome screen: 3 save slots, each a full separate account.
// New Game / Continue per slot, two-click Delete. No browser dialogs.
var TitleScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Title' }); },

  create: function () {
    this.starting = false;                 // scene objects persist across visits — reset the guard
    // RESIZE mode: read the real canvas size; center the 640-tall layout vertically
    var W = this.scale.width, H = this.scale.height;
    var oy = Math.max(0, (H - 640) / 2);
    this.add.tileSprite(W / 2, H / 2, W, H, 'floor_nexus').setAlpha(0.35);
    this.cameras.main.setBackgroundColor('#0f0f1b');

    this.add.text(W / 2, oy + 92, 'SUPER RPG BROS', {
      fontFamily: 'monospace', fontSize: 52, color: '#ffcd75', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 4, '#1a1c2c', 0, true, true);
    this.add.text(W / 2, oy + 138, 'dodge like Realm · swarmed like Survivors · your account only moves forward', {
      fontFamily: 'monospace', fontSize: 13, color: '#94b0c2'
    }).setOrigin(0.5);

    // decorative portal (portal green — the texture is neutral, always tint it)
    var portal = this.add.sprite(W / 2, oy + 205, 'portal').setScale(2.4).setTint(DATA.modes.clear.color);
    this.tweens.add({ targets: portal, angle: 360, duration: 6000, repeat: -1 });
    portalSwirl(this, W / 2, oy + 205, DATA.modes.clear.color);
    wireFullscreen(this);

    if (!SAVE.storageOk()) {
      this.add.text(W / 2, oy + 245, 'WARNING: browser storage unavailable — progress will NOT be saved', {
        fontFamily: 'monospace', fontSize: 13, color: '#b13e53'
      }).setOrigin(0.5);
    }

    for (var s = 1; s <= SAVE.SLOTS; s++) this.buildSlotCard(s, W / 2, oy + 260 + s * 95);

    this.add.text(W / 2, H - 28, 'click a slot to play · or press 1 / 2 / 3 · saves live in this browser', {
      fontFamily: 'monospace', fontSize: 12, color: '#566c86'
    }).setOrigin(0.5);

    // keyboard slot select
    var self = this;
    this.input.keyboard.on('keydown-ONE', function () { self.chooseSlot(1); });
    this.input.keyboard.on('keydown-TWO', function () { self.chooseSlot(2); });
    this.input.keyboard.on('keydown-THREE', function () { self.chooseSlot(3); });

    this.cameras.main.fadeIn(300);
  },

  buildSlotCard: function (slot, cx, cy) {
    var self = this;
    var info = SAVE.peek(slot);
    var w = 560, h = 78;

    var box = this.add.rectangle(cx, cy, w, h, 0x1a1c2c, 0.92)
      .setStrokeStyle(2, info.exists ? 0x41a6f6 : 0x29366f)
      .setInteractive({ useHandCursor: true });

    var main, sub, subColor = '#94b0c2';
    if (info.corrupt) {
      main = 'corrupted save'; sub = 'click DELETE to clear this slot'; subColor = '#b13e53';
    } else if (info.exists) {
      main = info.cls + '  ·  Level ' + info.level;
      sub = 'best Lv ' + info.bestLevel + '  ·  deaths ' + info.deaths +
            (info.savedAt ? '  ·  saved ' + new Date(info.savedAt).toLocaleString() : '');
    } else {
      main = '— empty —'; sub = 'click to start a new game';
    }

    this.add.text(cx - w / 2 + 18, cy - 26, 'SLOT ' + slot, { fontFamily: 'monospace', fontSize: 13, color: '#ffcd75' });
    this.add.text(cx - w / 2 + 18, cy - 8, main, { fontFamily: 'monospace', fontSize: 17, color: info.corrupt ? '#b13e53' : '#f4f4f4' });
    this.add.text(cx - w / 2 + 18, cy + 16, sub, { fontFamily: 'monospace', fontSize: 11, color: subColor });

    this.add.text(cx + w / 2 - 18, cy - 10,
      info.corrupt ? '' : (info.exists ? 'CONTINUE ▶' : 'NEW GAME ▶'),
      { fontFamily: 'monospace', fontSize: 14, color: '#38b764' }).setOrigin(1, 0.5);

    box.on('pointerover', function () { box.setFillStyle(0x29366f, 0.92); });
    box.on('pointerout', function () { box.setFillStyle(0x1a1c2c, 0.92); });
    box.on('pointerdown', function () { if (!info.corrupt) self.chooseSlot(slot); });

    // two-click delete (no browser confirm dialogs — they freeze the tab)
    if (info.exists || info.corrupt) {
      var del = this.add.text(cx + w / 2 - 18, cy + 16, 'DELETE', {
        fontFamily: 'monospace', fontSize: 11, color: '#b13e53'
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
      var armed = false;
      del.on('pointerdown', function (pointer, lx, ly, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        if (!armed) { armed = true; del.setText('REALLY DELETE?').setColor('#ffcd75'); return; }
        SAVE.clear(slot);
        self.scene.restart();
      });
    }
  },

  chooseSlot: function (slot) {
    if (this.starting) return;
    var r = SAVE.load(slot);
    var data;
    if (r.ok) data = r.data;
    else if (r.reason === 'corrupt') return;               // must delete first
    else { data = SAVE.blank(); SAVE.save(slot, data); }   // new game in empty slot
    bindSave(slot, data);
    this.starting = true;
    AUDIO.play('ui');
    this.cameras.main.fadeOut(350);
    var self = this;
    // M3.8: entry:'login' → the records screen boots empty and TYPES itself out
    this.time.delayedCall(400, function () { self.scene.start('Nexus', { entry: 'login' }); });
  }
});

// ------------------------------------------------------- SHARED INPUT RIG --
// Movement and the interact/ability key are REBINDABLE and each has a PRIMARY
// + ALTERNATE binding (movement defaults to WASD + arrows). rig.refresh()
// resolves both slots to live Phaser Keys (called on load + after any rebind);
// held(action) = either slot down; interactJustDown() covers both interact
// slots so station SPACE-in-range checks honour the alt too. ENTER / F3 stay
// fixed. keys.SPACE still points at the interact PRIMARY for legacy refs.
function makeInputRig(scene) {
  var K = scene.input.keyboard;
  var keys = K.addKeys('W,A,S,D,SPACE,T,F3,ENTER,UP,LEFT,DOWN,RIGHT');
  function keyFor(action, slot) {
    var kc = BINDS.phaserKeyCode(BINDS.code(action, slot));
    return kc != null ? K.addKey(kc) : null;
  }
  var rig = {
    keys: keys,
    mv: {},                                          // action -> { p:Key|null, a:Key|null }
    refresh: function () {
      var self = this;
      ['moveUp', 'moveLeft', 'moveDown', 'moveRight', 'interact'].forEach(function (a) {
        self.mv[a] = { p: keyFor(a, 'primary'), a: keyFor(a, 'alt') };
      });
      keys.SPACE = this.mv.interact.p || keys.SPACE; // legacy rig.keys.SPACE refs
    },
    held: function (a) { var m = this.mv[a]; return !!(m && ((m.p && m.p.isDown) || (m.a && m.a.isDown))); },
    interactJustDown: function () {
      var m = this.mv.interact, JD = Phaser.Input.Keyboard.JustDown;
      return !!(m && ((m.p && JD(m.p)) || (m.a && JD(m.a))));
    },
    collect: function (player, autoFire) {           // -> intent (seam rule 2)
      var i = SIM.makeIntent();
      i.moveX = (this.held('moveLeft') ? -1 : 0) + (this.held('moveRight') ? 1 : 0);
      i.moveY = (this.held('moveUp') ? -1 : 0) + (this.held('moveDown') ? 1 : 0);
      var pt = scene.input.activePointer;
      pt.updateWorldPoint(scene.cameras.main);
      i.aimAngle = Math.atan2(pt.worldY - player.y, pt.worldX - player.x);
      i.firing = autoFire || pt.isDown;
      i.ability = this.held('interact');
      return i;
    }
  };
  rig.refresh();
  return rig;
}

// ------------------------------------------------------------------ NEXUS --
var NexusScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Nexus' }); },
  create: function (data) {
    if (!GAME_SAVE) { this.scene.start('Title'); return; }   // no slot bound → welcome screen
    this.entry = (data && data.entry) || 'none';             // M3.8: login / realm / none
    persist();                                               // autosave on every nexus arrival
    // RESIZE mode: the nexus safe room IS the screen, whatever size it is
    // (DATA.nexus.w/h is the windowed minimum).
    var W = Math.max(DATA.nexus.w, this.scale.width), H = Math.max(DATA.nexus.h, this.scale.height);
    this.physics.world.setBounds(0, 0, W, H);
    this.add.tileSprite(W / 2, H / 2, W, H, 'floor_nexus');
    this.cameras.main.setBounds(0, 0, W, H).setBackgroundColor('#0f0f1b');

    // walls (visual + physical)
    var walls = this.physics.add.staticGroup();
    for (var x = 8; x < W; x += 32) { walls.create(x, 8, 'wall').setScale(2).refreshBody(); walls.create(x, H - 8, 'wall').setScale(2).refreshBody(); }
    for (var y = 8; y < H; y += 32) { walls.create(8, y, 'wall').setScale(2).refreshBody(); walls.create(W - 8, y, 'wall').setScale(2).refreshBody(); }

    // M3.5: THE PORTAL WORKS — one platform at the heart of the nexus,
    // hard-wired to the REALM CONSOLE by an energy conduit. The console
    // powers the platform; future realms live inside the console UI.
    this.buildPortalWorks(W, H);
    wireFullscreen(this);

    // M3: THE VAULT — 8 account slots that survive death (the whole point).
    // Click the chest or press V to open the swap UI.
    // M3.6 polish (user, 2026-07-12): station labels are GREEN, ABOVE their
    // object, and minimal — no counters, no headers.
    var vc = this.add.sprite(120, H / 2 - 60, 'chest').setScale(2.5).setInteractive({ useHandCursor: true });
    var vl = this.add.text(120, H / 2 - 100, 'VAULT (' + BINDS.keyLabel('vault') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5);
    vl.setShadow(1, 2, '#1a1c2c', 2, true, true);        // readable on the light floor
    this.vaultLabel = vl;                                // live-updates on rebind
    var vSelf = this;
    vc.on('pointerdown', function () { vSelf.requestStation('vault'); });
    this.vaultUi = null;

    // M3.6: THE BESTIARY — the vault's mirror on the right wall (same height,
    // same distance from the edge): a green terminal of field notes on every
    // mob and boss currently implemented. Click, B, or SPACE in range.
    this.bestiaryPos = { x: W - 120, y: H / 2 - 60 };
    var bglow = this.add.sprite(W - 120, H / 2 - 66, 'softglow').setScale(1.0)
      .setTint(0x49e83b).setAlpha(0.25).setDepth(1);
    this.tweens.add({ targets: bglow, alpha: 0.13, yoyo: true, repeat: -1, duration: 1400 });
    var bst = this.add.sprite(W - 120, H / 2 - 60, 'bestiary').setScale(3).setDepth(3)
      .setInteractive({ useHandCursor: true });
    this.bestiarySprite = bst;
    this.tweens.add({ targets: bst, alpha: 0.78, yoyo: true, repeat: -1, duration: 1400 });
    var bl = this.add.text(W - 120, H / 2 - 100, 'BESTIARY (' + BINDS.keyLabel('bestiary') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5);
    bl.setShadow(1, 2, '#1a1c2c', 2, true, true);
    this.bestiaryLabel = bl;                             // live-updates on rebind
    bst.on('pointerdown', function () { vSelf.requestStation('bestiary'); });
    this.bestiaryUi = null;
    this.bestiaryIndex = 0;
    // V / B / R / G / P + menu are dispatched centrally (rebindable) below.

    // M3.5: you arrive just south of the console — the works are the first
    // thing you see, and the prompt is two steps away.
    this.player = Entities.createPlayer(this, W / 2, H / 2 + 190, CURRENT);
    this.physics.add.collider(this.player, walls);
    this.rig = makeInputRig(this);

    // M2: potion stash + records page (G now flips the wall switch — M3.8;
    // the full records page opens by walking to the screen / clicking it)
    this.potUi = null; this.gyUi = null;
    this.buildPotionUi();

    // M3.5 polish (user, 2026-07-12): the room is the PORTAL CHAMBER — the
    // title glows like light cast by the works themselves (a soft halo that
    // breathes). NO instructional text inside the frame — the page footer
    // under the canvas carries the controls, including SPACE to interact.
    var halo = this.add.sprite(W / 2, 44, 'softglow').setScale(4.4, 1.6)
      .setTint(0x49e83b).setAlpha(0.4).setDepth(1);
    this.tweens.add({ targets: halo, alpha: 0.22, yoyo: true, repeat: -1, duration: 1600 });
    var title = this.add.text(W / 2, 40, 'PORTAL CHAMBER',
      { fontFamily: 'monospace', fontSize: 28, color: '#d8ffd8' }).setOrigin(0.5).setDepth(2);
    title.setShadow(0, 0, '#49e83b', 12, false, true);
    this.tweens.add({ targets: title, alpha: 0.82, yoyo: true, repeat: -1, duration: 1600 });

    // M3.7/3.8 (user, 2026-07-12): THE RECORDS SCREEN — the floating account
    // header is GONE; a wall monitor under the title carries the live readout
    // on its glass (no slot number — the chamber shows WHO you are, not which
    // save you're in). Click / SPACE at the screen opens the full RECORDS page.
    // M3.8: a large UNLABELED LEVER left of the screen swaps the readout —
    // up = character records (R), down = graveyard stats (G) — and its wire
    // feeds the screen with little energy pulses, portal-machine style.
    this.recordsPos = { x: W / 2, y: 92 };
    var rglow = this.add.sprite(W / 2, 96, 'softglow').setScale(3.6, 0.8)
      .setTint(0x49e83b).setAlpha(0.18).setDepth(1);
    this.tweens.add({ targets: rglow, alpha: 0.1, yoyo: true, repeat: -1, duration: 1800 });
    var rs = this.add.sprite(W / 2, 92, 'wallscreen').setScale(3).setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.recordsSprite = rs;
    var rSelf = this;
    rs.on('pointerdown', function () { rSelf.requestStation('recordsPage'); });
    this.recordsText = this.add.text(W / 2, 92, '',
      { fontFamily: 'monospace', fontSize: 12, color: '#49e83b' }).setOrigin(0.5).setDepth(3);
    this.recordsText.setShadow(0, 0, '#49e83b', 6, false, true);   // phosphor glow
    this.tweens.add({ targets: this.recordsText, alpha: 0.86, yoyo: true, repeat: -1, duration: 900 });
    this.typeTimer = null; this.countTimer = null;       // scene-instance guards (bug #1)
    this.recordsMode = this.registry.get('recordsMode') || 'records';

    // the GIANT metal switch + its wire to the screen (v2: pulses only when
    // the lever is thrown — the wire is quiet otherwise)
    var screenLeft = W / 2 - this.recordsSprite.displayWidth / 2;
    var swX = screenLeft - 78, swY = 92;
    this.switchPos = { x: swX, y: swY };
    var lever = this.add.sprite(swX, swY, this.recordsMode === 'records' ? 'lever_up' : 'lever_down')
      .setScale(3).setDepth(2).setInteractive({ useHandCursor: true });
    this.leverSprite = lever;
    // left-click: walk over and throw it (same trip as the hotkeys)
    lever.on('pointerdown', function () {
      rSelf.requestStation(rSelf.recordsMode === 'records' ? 'switchGrave' : 'switchRecords');
    });
    // floating hotkey chip above the lever: shows the key that flips it
    // to the OTHER page — (G) while records is up, (R) while graveyard is down
    this.leverLabel = this.add.text(swX, swY - 46,
      '(' + BINDS.keyLabel(this.recordsMode === 'records' ? 'recordsDown' : 'recordsUp') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5).setDepth(3);
    this.leverLabel.setShadow(1, 2, '#1a1c2c', 2, true, true);
    for (var wx = swX + 34; wx < screenLeft; wx += 24) {
      this.add.sprite(wx, swY, 'conduit').setScale(1.4).setDepth(1).setAngle(90).setAlpha(0.9);
    }
    this.wireFrom = swX + 28; this.wireTo = screenLeft + 6;

    // walk-to-interact targets (M3.8): stand JUST BELOW the object, then act
    this.stations = {
      vault:         { x: 120,     y: H / 2 - 14, act: function () { this.toggleVault(); } },
      bestiary:      { x: W - 120, y: H / 2 - 14, act: function () { this.toggleBestiary(); } },
      machine:       { x: W / 2,   y: H / 2 + 158, act: function () { this.toggleConsole(); } },
      recordsPage:   { x: W / 2,   y: 150,        act: function () { this.toggleGraveyard(); } },
      switchGrave:   { x: swX,     y: 150,        act: function () { this.setRecordsMode('grave'); } },
      switchRecords: { x: swX,     y: 150,        act: function () { this.setRecordsMode('records'); } }
    };
    this.autoWalk = null;                                // scene-instance guard (bug #1)
    this._menuOpen = false; this._menuHandle = null; this._bindsCapture = false;  // reset (bug #1)

    // Rebindable hotkeys are dispatched centrally from the live binds map, so a
    // rebind takes effect instantly and needs no re-registration. Station keys
    // are ignored while the ESC menu is open. ESC (the menu key) closes an open
    // overlay first, then opens the menu; the exit-to-load-screen lives INSIDE
    // the menu now (it used to be ESC's job).
    var esc = this;
    BINDS.wire(this, {
      vault:       function () { if (!esc._menuOpen) esc.requestStation('vault'); },
      bestiary:    function () { if (!esc._menuOpen) esc.requestStation('bestiary'); },
      recordsUp:   function () { if (!esc._menuOpen) esc.requestStation('switchRecords'); },
      recordsDown: function () { if (!esc._menuOpen) esc.requestStation('switchGrave'); },
      portal:      function () { if (!esc._menuOpen) esc.requestStation('machine'); },
      menu:        function () { esc.onMenuKey(); }
    });

    // M3 (Lane C): the MAP BUILDER — a developer tool on a FIXED dev key (M,
    // deliberately not remappable), reached from the nexus (not the player
    // flow) so a save slot is always bound for playtests.
    this.input.keyboard.on('keydown-M', function () {
      if (esc._menuOpen) return;
      persist();
      AUDIO.stopMusic();                                 // M3.9
      esc.scene.start('Builder');
    });

    // M3 polish: portals are SPACE-ACTIVATED, not walk-in — approach, THEN
    // commit. (M3.5: no floating prompts — the footer says SPACE to interact.)
    this.entering = false;

    // M3.5: a portal spawned by the console survives a scene restart (resize,
    // fullscreen toggle, vault detours) via the game registry — but it is
    // ONE-SHOT: enterPortal clears the registry, so it never outlives a run.
    var pending = this.registry.get('pendingPortal');
    if (pending) this.materializePortal(pending, false);

    // M3.8: how the glass wakes up depends on how you arrived —
    // login: empty box → letters type out · back from a realm: letters ready,
    // numbers ramp · anything else (resize, builder): instant.
    this.showRecords(this.entry === 'login' ? 'type' : this.entry === 'realm' ? 'count' : 'none');

    // M3.9: chamber music — "The Chamber at Rest" (original composition;
    // plays only here, idempotent across resize restarts, waits for the
    // browser's audio unlock if needed)
    AUDIO.playMusic('chamber');

    this.cameras.main.fadeIn(300);
  },

  // -------------------------------------- M3.5: THE PORTAL WORKS --
  // The nexus centerpiece (user redesign 2026-07-12): ONE platform, an energy
  // CONDUIT, and the REALM CONSOLE that powers it. Three states:
  //   DORMANT — ring lights dark, conduit dead, console screen dim-pulsing.
  //   CHARGING (~2s) — console flares, pulses race up the conduit, the 8 ring
  //     lights ignite one by one in the mode color, the portal tears open.
  //   POWERED — pulses keep flowing, lights breathe, portal spins until entry.
  buildPortalWorks: function (W, H) {
    var self = this;
    this.plazaPortals = [];      // filled by materializePortal, not at boot
    this.portal = null;          // canonical spawned portal (suites refer to it)
    this.spawnedPortal = null;   // {sprite, label, swirl, mode, affixes}
    this.charging = false;       // true during the spawn cinematic
    var cx = W / 2;
    var platY = H / 2 - 110, conY = H / 2 + 110;
    this.portalSpot = { x: cx, y: platY - 6 };            // portal floats in the well

    // PLATFORM — big stone ring, 8 dark light sockets the console ignites.
    // A soft glow pool sits in the well: dim while dormant, blazing in the
    // mode color while powered — the room's lighting comes from the works.
    this.wellGlow = this.add.sprite(cx, platY, 'softglow').setScale(1.6)
      .setTint(0x29366f).setAlpha(0.35).setDepth(1);
    this.add.sprite(cx, platY, 'platform').setScale(2.4).setDepth(2);
    var J = DATA.juice.conduit;
    this.ringLights = [];
    for (var i = 0; i < J.ringLights; i++) {
      var a = i * Math.PI * 2 / J.ringLights;
      this.ringLights.push(this.add.sprite(
        cx + Math.cos(a) * J.ringRadius, platY + Math.sin(a) * J.ringRadius, 'glowdot')
        .setScale(1.4).setDepth(3).setTint(0x29366f).setAlpha(0.25));
    }
    var wt = this.add.text(cx, platY - 96, 'PORTAL WORKS',
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setOrigin(0.5, 1).setName('worksTitle');
    wt.setShadow(1, 2, '#1a1c2c', 2, true, true);

    // CONDUIT — carved channel from the console up to the platform
    this.conduitTop = platY + 70; this.conduitBottom = conY - 42;
    for (var y = this.conduitBottom; y >= this.conduitTop; y -= 30) {
      this.add.sprite(cx, y, 'conduit').setScale(2).setDepth(2).setAlpha(0.9);
    }

    // CONSOLE — the terminal that drives it all; its screen spills blue light
    var spill = this.add.sprite(cx, conY - 6, 'softglow').setScale(1.1)
      .setTint(0x41a6f6).setAlpha(0.3).setDepth(1);
    this.tweens.add({ targets: spill, alpha: 0.16, yoyo: true, repeat: -1, duration: 1200 });
    this.consolePos = { x: cx, y: conY };
    var c = this.add.sprite(cx, conY, 'console').setScale(3).setDepth(3).setInteractive({ useHandCursor: true });
    this.consoleSprite = c;
    this.tweens.add({ targets: c, alpha: 0.75, yoyo: true, repeat: -1, duration: 1200 });   // dormant heartbeat
    var cl = this.add.text(cx, conY + 36, DATA.console.name + ' (' + BINDS.keyLabel('portal') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5);
    cl.setShadow(1, 2, '#1a1c2c', 2, true, true);
    this.consoleLabel = cl;                              // live-updates on rebind
    c.on('pointerdown', function () { self.requestStation('machine'); });
    this.consoleUi = null;
    this.flowTimer = null;       // powered-state pulse stream
    // run config survives open/close within a visit; defaults are fresh per scene
    this.consoleMode = 'clear';
    this.consoleAffixes = [];
  },

  // one energy pulse traveling the conduit console→platform
  conduitPulse: function (tint, ms) {
    var self = this;
    var p = this.add.sprite(this.consolePos.x, this.conduitBottom + 14, 'glowdot')
      .setScale(1.2).setDepth(4).setTint(tint || 0x41a6f6);
    this.tweens.add({ targets: p, y: this.conduitTop - 20, duration: ms,
      ease: 'Sine.In', onComplete: function () {
        self.tweens.add({ targets: p, scale: 2.2, alpha: 0, duration: 160,
          onComplete: function () { p.destroy(); } });
      } });
  },

  powerDown: function () {
    if (this.flowTimer) { this.flowTimer.remove(); this.flowTimer = null; }
    var self = this;
    this.ringLights.forEach(function (l) {
      self.tweens.killTweensOf(l);
      l.setTint(0x29366f); l.setAlpha(0.25); l.setScale(1.4);
    });
    this.tweens.killTweensOf(this.wellGlow);
    this.wellGlow.setTint(0x29366f).setAlpha(0.35).setScale(1.6);   // dormant pool
  },

  // M3.5 polish (user, 2026-07-12): NO floating instructional text — the page
  // footer says "SPACE to interact". In range, the console just brightens
  // (diegetic invitation); SPACE opens it.
  handleConsole: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.charging) return;
    var p = this.player, cp = this.consolePos;
    var near = Math.hypot(cp.x - p.x, cp.y - p.y) <= DATA.interact.consoleRange;
    this.consoleSprite.setScale(near ? 3.3 : 3);          // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleConsole();
  },

  toggleConsole: function () {
    if (this.consoleUi) {
      this.consoleUi.forEach(function (o) { o.destroy(); });
      this.consoleUi = null;
      this.input.keyboard.off('keydown-ENTER', this.consoleEnterFn, this);   // bug #2 family
      return;
    }
    if (this.charging) return;                           // one cinematic at a time
    if (this.vaultUi) this.toggleVault();                // one overlay at a time
    if (this.gyUi) this.toggleGraveyard();
    if (this.bestiaryUi) this.toggleBestiary();
    this.buildConsoleUi();
    AUDIO.play('ui');
  },

  // The UI is a veneer: it only calls consoleSetMode / consoleToggleAffix /
  // consoleSpawnPortal, which are headless-callable (suites drive them raw).
  consoleSetMode: function (mode) {
    if (!DATA.modes[mode] || DATA.console.modes.indexOf(mode) < 0) return;
    this.consoleMode = mode;
    if (this.consoleUi) this.buildConsoleUi();
  },

  consoleToggleAffix: function (key) {
    if (!DATA.affixes.map[key]) return;
    var i = this.consoleAffixes.indexOf(key);
    if (i >= 0) this.consoleAffixes.splice(i, 1);
    else if (this.consoleAffixes.length < DATA.console.maxAffixes) this.consoleAffixes.push(key);
    if (this.consoleUi) this.buildConsoleUi();
  },

  // instant=true skips the charge-up cinematic (registry rebuilds + suites).
  consoleSpawnPortal: function (instant) {
    if (this.charging) return;                           // one cinematic at a time
    var cfg = { mode: this.consoleMode, affixes: this.consoleAffixes.slice() };
    this.registry.set('pendingPortal', cfg);             // survives resize restarts
    if (this.consoleUi) this.toggleConsole();
    this.materializePortal(cfg, !instant);
  },

  buildConsoleUi: function () {
    if (this.consoleUi) { this.consoleUi.forEach(function (o) { o.destroy(); }); this.consoleUi = null; }
    var self = this;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, 640, 520, 0x0f0f1b, 0.97).setDepth(80).setStrokeStyle(2, 0x41a6f6));
    ui.push(this.add.text(cx, cy - 232, DATA.console.name, { fontFamily: 'monospace', fontSize: 22, color: '#41a6f6' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 206, 'configure the run · power the platform · step through',
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));

    // --- mode select ---
    ui.push(this.add.text(cx - 290, cy - 180, 'GAME MODE', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setDepth(81));
    DATA.console.modes.forEach(function (m, i) {
      var y = cy - 150 + i * 46, sel = self.consoleMode === m;
      var md = DATA.modes[m];
      var box = self.add.rectangle(cx, y, 580, 40, sel ? 0x29366f : 0x1a1c2c, 1).setDepth(81)
        .setStrokeStyle(sel ? 2 : 1, sel ? 0xffcd75 : 0x333c57)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', function () { self.consoleSetMode(m); });
      ui.push(box);
      var detail = m === 'clear'
        ? DATA.realm.name + ' · ' + DATA.realm.killQuota + ' ' + md.desc
        : md.desc;
      ui.push(self.add.text(cx - 278, y - 8, (sel ? '> ' : '  ') + md.name,
        { fontFamily: 'monospace', fontSize: 13, color: sel ? '#ffcd75' : '#94b0c2' }).setDepth(82));
      ui.push(self.add.text(cx - 278, y + 8, '  ' + detail,
        { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setDepth(82));
    });

    // --- sealed destinations (M5) — future realms live in the console now ---
    DATA.console.sealed.forEach(function (d, i) {
      var y = cy - 66 + i * 24;
      var box = self.add.rectangle(cx, y, 580, 20, 0x14142a, 1).setDepth(81).setStrokeStyle(1, 0x1f2440);
      ui.push(box);
      ui.push(self.add.text(cx - 278, y, '  ' + d.label + ' — ' + d.sub,
        { fontFamily: 'monospace', fontSize: 10, color: '#3b4466' }).setOrigin(0, 0.5).setDepth(82));
    });

    // --- affix board (M3.5 preview: toggleable + visible, INERT until M5) ---
    ui.push(this.add.text(cx - 290, cy - 4, 'MAP AFFIXES — ' + this.consoleAffixes.length + '/' + DATA.console.maxAffixes +
      ' slotted  (preview: not yet active — the danger is coming at M5)',
      { fontFamily: 'monospace', fontSize: 11, color: '#ffcd75' }).setDepth(81));
    DATA.console.affixChoices.forEach(function (key, i) {
      var a = DATA.affixes.map[key];
      var on = self.consoleAffixes.indexOf(key) >= 0;
      var y = cy + 26 + i * 42;
      var box = self.add.rectangle(cx, y, 580, 36, on ? 0x29366f : 0x1a1c2c, 1).setDepth(81)
        .setStrokeStyle(on ? 2 : 1, on ? a.tint : 0x333c57)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', function () { self.consoleToggleAffix(key); });
      ui.push(box);
      var col = '#' + ('00000' + a.tint.toString(16)).slice(-6);
      ui.push(self.add.text(cx - 278, y - 8, (on ? '[x] ' : '[ ] ') + a.name,
        { fontFamily: 'monospace', fontSize: 12, color: on ? col : '#94b0c2' }).setDepth(82));
      ui.push(self.add.text(cx - 278, y + 7, '    ' + a.desc,
        { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setDepth(82));
    });

    // --- spawn ---
    var btn = this.add.rectangle(cx, cy + 192, 300, 42, 0x38b764, 1).setDepth(81)
      .setStrokeStyle(2, 0xf4f4f4).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', function () { self.consoleSpawnPortal(); });
    ui.push(btn);
    ui.push(this.add.text(cx, cy + 192, 'POWER THE PLATFORM  [ENTER]',
      { fontFamily: 'monospace', fontSize: 14, color: '#0f0f1b' }).setOrigin(0.5).setDepth(82));
    ui.push(this.add.text(cx, cy + 230, 'a new spawn replaces the old portal · portals are consumed on entry · ESC closes',
      { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setOrigin(0.5).setDepth(81));
    this.consoleUi = ui;

    // ENTER spawns — wired per open, unwired on close (listener-stacking gotcha)
    this.consoleEnterFn = this.consoleEnterFn || function () { if (this.consoleUi) this.consoleSpawnPortal(); };
    this.input.keyboard.off('keydown-ENTER', this.consoleEnterFn, this);
    this.input.keyboard.on('keydown-ENTER', this.consoleEnterFn, this);
  },

  despawnPortal: function () {
    this.powerDown();                                    // the works go dark
    var sp = this.spawnedPortal;
    if (!sp) return;
    if (sp.swirl) sp.swirl.remove();
    if (sp.label) sp.label.destroy();
    sp.sprite.destroy();
    this.spawnedPortal = null;
    this.plazaPortals = [];
    this.portal = null;
  },

  // Light the ring + start the powered pulse stream (the steady state).
  powerUp: function (tint) {
    var self = this, J = DATA.juice.conduit;
    this.ringLights.forEach(function (l, i) {
      l.setTint(tint).setAlpha(1);
      self.tweens.add({ targets: l, alpha: 0.55, yoyo: true, repeat: -1,
        duration: 700, delay: i * 90 });                 // the ring breathes
    });
    // the well floods with the mode color — the chamber is LIT by the portal
    this.tweens.killTweensOf(this.wellGlow);
    this.wellGlow.setTint(tint).setAlpha(0.8).setScale(2.2);
    this.tweens.add({ targets: this.wellGlow, alpha: 0.5, scale: 2.0,
      yoyo: true, repeat: -1, duration: 900 });
    if (this.flowTimer) this.flowTimer.remove();
    this.flowTimer = this.time.addEvent({ delay: J.flowEveryMs, loop: true,
      callback: function () { self.conduitPulse(tint, J.flowTravelMs); } });
  },

  // The portal itself (sprite + swirl) — shared by both spawn paths.
  // M3.5 polish (user, 2026-07-12): NO text on the works — the run reads
  // through color and light (mode-tinted portal/ring/well; board recaps it).
  createPortalAt: function (cfg, tint) {
    var spot = this.portalSpot;
    var p = this.physics.add.staticSprite(spot.x, spot.y, 'portal').setScale(2.2).setDepth(4);
    p.setTint(tint);                                     // neutral texture, mode color
    this.tweens.add({ targets: p, angle: 360, duration: 4000, repeat: -1 });
    var swirl = portalSwirl(this, spot.x, spot.y, tint);
    this.spawnedPortal = { sprite: p, swirl: swirl, mode: cfg.mode, affixes: cfg.affixes.slice() };
    this.plazaPortals = [{ sprite: p, mode: cfg.mode, affixes: cfg.affixes.slice() }];
    this.portal = p;                                     // canonical (suites + docs)
  },

  // Materialize the configured portal on the platform. animate=false is the
  // instant path (registry rebuild after a resize restart, headless suites);
  // animate=true plays the full charge-up: console flare → pulses race the
  // conduit → ring lights ignite one by one → the portal tears open.
  materializePortal: function (cfg, animate) {
    this.despawnPortal();                                // a new spawn replaces the old
    var tint = DATA.modes[cfg.mode].color;               // portal green / trial gold
    var self = this, J = DATA.juice.conduit;

    if (!animate) { this.createPortalAt(cfg, tint); this.powerUp(tint); return; }

    this.charging = true;
    AUDIO.play('charge');                                // electricity crackles
    // 1. console flare
    var flare = this.add.sprite(this.consolePos.x, this.consolePos.y, 'console')
      .setScale(3).setDepth(5).setTintFill(0xf4f4f4).setAlpha(0.9);
    this.tweens.add({ targets: flare, alpha: 0, scale: 3.6, duration: 320,
      onComplete: function () { flare.destroy(); } });
    // 2. pulses race up the conduit
    for (var i = 0; i < J.chargePulses; i++) {
      this.time.delayedCall(i * J.pulseGapMs, function () { self.conduitPulse(tint, J.pulseTravelMs); });
    }
    var pulsesDone = (J.chargePulses - 1) * J.pulseGapMs + J.pulseTravelMs;
    // 3. ring lights ignite one by one (each pulse "delivers" power)
    this.ringLights.forEach(function (l, i) {
      self.time.delayedCall(pulsesDone + i * J.segMs, function () {
        l.setTint(tint).setAlpha(1).setScale(2);
        self.tweens.add({ targets: l, scale: 1.4, duration: 180 });
        AUDIO.play('hit');
      });
    });
    var ringDone = pulsesDone + this.ringLights.length * J.segMs;
    // 4. the portal RISES OUT OF THE FLOOR of the platform well (user ask,
    // 2026-07-12): born sunken and squashed flat, it climbs up and unfolds —
    // then the phaser zap + flash + shake sell the tear-open.
    this.time.delayedCall(ringDone, function () {
      AUDIO.play('spawn');                               // phaser zap
      self.createPortalAt(cfg, tint);
      self.portal.setPosition(self.portalSpot.x, self.portalSpot.y + 22);
      self.portal.setScale(1.6, 0.12).setAlpha(0.65);    // flat sliver in the floor
      self.tweens.add({ targets: self.portal,
        y: self.portalSpot.y, scaleX: 2.2, scaleY: 2.2, alpha: 1,
        duration: J.portalMs, ease: 'Back.Out' });
      var flash = self.add.sprite(self.portalSpot.x, self.portalSpot.y, 'portal')
        .setScale(0.4).setDepth(5).setTint(0xf4f4f4).setAlpha(0.9);
      self.tweens.add({ targets: flash, scale: 3.4, alpha: 0, duration: 480,
        onComplete: function () { flash.destroy(); } });
      self.cameras.main.shake(120, 0.002);
      self.powerUp(tint);
      self.charging = false;
    });
  },

  // ------------------------------- M3.7/3.8: THE RECORDS SCREEN --
  // Live account readout rendered on the wall monitor's glass. No slot
  // number by design (user call). Two pages, chosen by the big lever:
  //   'records' (R, lever up)  — the character: class/level/deaths/best/closed
  //   'grave'   (G, lever down) — the graveyard: fallen/kills/entered/last death
  // Anim modes: 'type' (login + every lever flip: the glass boots empty and
  // the letters hammer out one by one) · 'count' (back from a realm: letters
  // already there, NUMBERS tick slowly then shoot up) · 'none' (instant).
  recordsParts: function () {
    var R = ACCOUNT.records;
    if (this.recordsMode === 'grave') {
      var last = ACCOUNT.graveyard.length ? ACCOUNT.graveyard[ACCOUNT.graveyard.length - 1] : null;
      var parts = [
        { t: 'FALLEN ', n: ACCOUNT.graveyard.length },
        { t: '  ·  TOTAL KILLS ', n: R.totalKills },
        { t: '  ·  REALMS ENTERED ', n: R.realmsEntered }
      ];
      if (last) parts.push({ t: '  ·  LAST: ' + last.killer.toUpperCase(), n: null });
      return parts;
    }
    var drunk = 0, k;
    for (k in CURRENT.potionsDrunk) drunk += CURRENT.potionsDrunk[k];
    var p = [
      { t: DATA.classes[CURRENT.cls].name.toUpperCase() + ' LV ', n: CURRENT.level },
      { t: '  ·  DEATHS ', n: ACCOUNT.records.deaths },
      { t: '  ·  BEST LV ', n: ACCOUNT.records.bestLevel },
      { t: '  ·  REALMS CLOSED ', n: ACCOUNT.records.realmsClosed }
    ];
    if (drunk) p.push({ t: '  ·  POTS ', n: drunk });
    return p;
  },

  recordsString: function (scale) {
    return this.recordsParts().map(function (p) {
      return p.t + (p.n === null ? '' : (scale === undefined ? p.n : Math.floor(p.n * scale)));
    }).join('');
  },

  fitRecordsFont: function (text) {
    var glass = this.recordsSprite.displayWidth - 30;
    var fs = 12;                                         // v2: bigger base font
    this.recordsText.setFontSize(fs).setText(text);
    while (this.recordsText.width > glass && fs > 8) {
      fs--;
      this.recordsText.setFontSize(fs);
    }
  },

  showRecords: function (anim) {
    var self = this, JR = DATA.juice.records;
    var full = this.recordsString();
    if (this.typeTimer) { this.typeTimer.remove(); this.typeTimer = null; }
    if (this.countTimer) { this.countTimer.remove(); this.countTimer = null; }
    this.fitRecordsFont(full);                           // size for the FINAL text
    if (anim === 'type') {
      // the glass boots empty, then the letters hammer out rapidly
      this.recordsText.setText('');
      var i = 0;
      this.typeTimer = this.time.addEvent({ delay: JR.typeMs, loop: true, callback: function () {
        // looped timers CATCH UP under a slow clock (headless ~2fps) — the
        // callback can fire again in the same frame after completion. Guard.
        if (!self.typeTimer) return;
        i += 1 + (i % 3 === 0 ? 1 : 0);                  // uneven, rapid
        self.recordsText.setText(full.slice(0, i) + (i < full.length ? '_' : ''));
        if (i % 4 === 0) AUDIO.play('ui');
        if (i >= full.length) {
          self.recordsText.setText(full);
          self.typeTimer.remove(); self.typeTimer = null;
        }
      } });
    } else if (anim === 'count') {
      // letters already typed — the NUMBERS ramp: slow ticks, then they fly
      var step = 0;
      this.recordsText.setText(this.recordsString(0));
      this.countTimer = this.time.addEvent({ delay: JR.countTickMs, loop: true, callback: function () {
        if (!self.countTimer) return;                    // catch-up guard (see above)
        step++;
        var t = step / JR.countTicks;
        self.recordsText.setText(self.recordsString(t * t * t));   // cubic ease-in
        if (step % 3 === 0) AUDIO.play('ui');
        if (step >= JR.countTicks) {
          self.recordsText.setText(full);
          self.countTimer.remove(); self.countTimer = null;
        }
      } });
    } else {
      this.recordsText.setText(full);
    }
  },

  // kept for callers that just need a silent refresh (potion drink, etc.)
  updateRecordsScreen: function () { this.showRecords('none'); },

  // the lever: flips the page, kicks a pulse down the wire, re-TYPES the glass
  // ------- ESC MENU (2026-07-12): unified chamber/realm pop-up ------------
  onMenuKey: function () {
    if (this._menuHandle) { this._menuHandle.close(); return; }   // menu open → close it
    if (this.consoleUi) { this.toggleConsole(); return; }         // else close an overlay first
    if (this.vaultUi) { this.toggleVault(); return; }
    if (this.bestiaryUi) { this.toggleBestiary(); return; }
    if (this.gyUi) { this.toggleGraveyard(); return; }
    this.openMenu();
  },

  openMenu: function () {
    var self = this;
    this.physics.world.pause();                          // freeze the room while open
    AUDIO.play('ui');
    MENU.open(this, {
      title: 'MENU',
      extraButtons: [
        { label: 'Exit to load screen', color: '#ff9e6d', onClick: function () {
            persist(); AUDIO.stopMusic(); self.scene.start('Title');
        } }
      ],
      onResume: function () { self.physics.world.resume(); AUDIO.play('ui'); }
    });
  },

  // Rewrite every station chip from the live binds (called after a rebind).
  refreshBindLabels: function () {
    if (this.vaultLabel)    this.vaultLabel.setText('VAULT (' + BINDS.keyLabel('vault') + ')');
    if (this.bestiaryLabel) this.bestiaryLabel.setText('BESTIARY (' + BINDS.keyLabel('bestiary') + ')');
    if (this.consoleLabel)  this.consoleLabel.setText(DATA.console.name + ' (' + BINDS.keyLabel('portal') + ')');
    if (this.leverLabel)    this.leverLabel.setText('(' + BINDS.keyLabel(this.recordsMode === 'records' ? 'recordsDown' : 'recordsUp') + ')');
  },

  setRecordsMode: function (mode) {
    if (mode !== 'records' && mode !== 'grave') return;
    if (this.recordsMode === mode) return;
    this.recordsMode = mode;
    this.registry.set('recordsMode', mode);              // survives resize restarts
    this.leverSprite.setTexture(mode === 'records' ? 'lever_up' : 'lever_down');
    this.leverLabel.setText('(' + BINDS.keyLabel(mode === 'records' ? 'recordsDown' : 'recordsUp') + ')');   // the OTHER page's key
    AUDIO.play('ui');
    // v2: the wire only carries energy when the lever is THROWN — a burst
    // of three pulses races to the screen, then it goes quiet again
    var self = this;
    this.wirePulse();
    this.time.delayedCall(140, function () { self.wirePulse(); });
    this.time.delayedCall(280, function () { self.wirePulse(); });
    this.showRecords('type');
  },

  // one energy pulse traveling the wire switch → screen (mini portal-machine)
  wirePulse: function () {
    var self = this, JR = DATA.juice.records;
    var p = this.add.sprite(this.wireFrom, this.switchPos.y, 'glowdot')
      .setScale(0.9).setDepth(4).setTint(0x49e83b).setAlpha(0.9);
    this.tweens.add({ targets: p, x: this.wireTo, duration: JR.wireTravelMs,
      ease: 'Sine.In', onComplete: function () {
        self.tweens.add({ targets: p, scale: 1.8, alpha: 0, duration: 140,
          onComplete: function () { p.destroy(); } });
      } });
  },

  // ---------------------------------- M3.8: WALK-TO-INTERACT --
  // A hotkey or click doesn't open a window — the character walks a straight
  // line to stand just below the station, THEN interacts. Manual movement
  // cancels the trip. If the station's window is already open, close it.
  closeOverlays: function () {
    if (this.vaultUi) this.toggleVault();
    if (this.gyUi) this.toggleGraveyard();
    if (this.consoleUi) this.toggleConsole();
    if (this.bestiaryUi) this.toggleBestiary();
  },

  requestStation: function (key) {
    var st = this.stations[key];
    if (!st || this.entering || this.charging) return;
    // toggle-close if this station's window is already open
    if (key === 'vault' && this.vaultUi) { this.toggleVault(); return; }
    if (key === 'bestiary' && this.bestiaryUi) { this.toggleBestiary(); return; }
    if (key === 'machine' && this.consoleUi) { this.toggleConsole(); return; }
    if (key === 'recordsPage' && this.gyUi) { this.toggleGraveyard(); return; }
    // v2 (user): R/G ALWAYS walk you to the switch, whatever position it's in
    // (setRecordsMode no-ops on arrival if the page is already showing)
    this.closeOverlays();
    var d = Math.hypot(st.x - this.player.x, st.y - this.player.y);
    if (d < 16) { st.act.call(this); return; }           // already standing there
    this.autoWalk = { x: st.x, y: st.y, act: st.act };
  },

  handleRecords: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.bestiaryUi || this.charging) return;
    var p = this.player, rp = this.recordsPos;
    var near = Math.hypot(rp.x - p.x, rp.y - p.y) <= DATA.interact.consoleRange;
    this.recordsSprite.setScale(near ? 3.2 : 3);         // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleGraveyard();
  },

  // M3.8 v3: SPACE at the switch throws it, like every other station
  handleSwitch: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.bestiaryUi || this.charging) return;
    var p = this.player, sp = this.switchPos;
    var near = Math.hypot(sp.x - p.x, sp.y - p.y) <= DATA.interact.consoleRange;
    this.leverSprite.setScale(near ? 3.3 : 3);           // leans toward you
    if (near && this.rig.interactJustDown()) {
      this.setRecordsMode(this.recordsMode === 'records' ? 'grave' : 'records');
    }
  },

  // ---------------------------------------------- M2: POTIONS (R5/F4) --
  buildPotionUi: function () {
    if (this.potUi) this.potUi.forEach(function (o) { o.destroy(); });
    // M3.6 polish (user, 2026-07-12): no header, no empty-state line — the
    // stash is just the potions themselves when you have them.
    var self = this, ui = [], H = this.scale.height;
    var x = 48, y = H / 2 + 40;
    DATA.potions.stats.forEach(function (stat) {
      var n = ACCOUNT.potions[stat];
      if (!n) return;
      ui.push(self.add.sprite(x + 10, y + 10, 'potion').setScale(2).setTint(DATA.potions.tints[stat]));
      var t = self.add.text(x + 26, y + 3, stat.toUpperCase() + ' ×' + n + '   [ drink: +' + DATA.potions.boost + ' ]',
        { fontFamily: 'monospace', fontSize: 12, color: '#f4f4f4' }).setInteractive({ useHandCursor: true });
      t.setShadow(1, 2, '#1a1c2c', 2, true, true);
      t.on('pointerover', function () { t.setColor('#38b764'); });
      t.on('pointerout', function () { t.setColor('#f4f4f4'); });
      t.on('pointerdown', function () { self.drinkPotion(stat); });
      ui.push(t);
      y += 26;
    });
    this.potUi = ui;
  },

  drinkPotion: function (stat) {
    if (ACCOUNT.potions[stat] <= 0) return;
    var cls = DATA.classes[CURRENT.cls];
    if (SIM.potionWasted(cls, CURRENT.level, CURRENT.potionsDrunk, stat)) {
      this.toast(stat.toUpperCase() + ' is at its cap — potion kept for a future character');
      return;
    }
    ACCOUNT.potions[stat]--;
    CURRENT.potionsDrunk[stat]++;
    persist();                                           // a drink is permanent (Pillar 3)
    AUDIO.play('drink');
    var st = this.player.state, before = st.stats;
    st.stats = SIM.statsFor(cls, st.level, CURRENT.potionsDrunk);
    st.hp = Math.min(st.stats.hp, st.hp + Math.max(0, st.stats.hp - before.hp));
    st.mp = Math.min(st.stats.mp, st.mp + Math.max(0, st.stats.mp - before.mp));
    this.toast('+' + DATA.potions.boost + ' ' + stat.toUpperCase() + ' — yours until this character falls');
    this.buildPotionUi();
    this.updateRecordsScreen();                          // M3.7: the wall screen is live
  },

  toast: function (msg) {
    var t = this.add.text(this.player.x, this.player.y - 34, msg,
      { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: t.y - 22, alpha: 0, duration: 1400, onComplete: function () { t.destroy(); } });
  },

  // ------------------------------------------------- M3: THE NEXUS VAULT --
  // 8 account slots that SURVIVE DEATH (Pillar 3) next to the character's 4
  // equipment slots (which don't). Click an equipped item to bank it; click a
  // banked item to equip it (occupied slot = swap). Every change persists.
  toggleVault: function () {
    if (this.vaultUi) {
      this.vaultUi.forEach(function (o) { o.destroy(); });
      this.vaultUi = null;
      return;
    }
    if (this.gyUi) this.toggleGraveyard();               // one overlay at a time
    if (this.consoleUi) this.toggleConsole();
    if (this.bestiaryUi) this.toggleBestiary();
    this.buildVaultUi();
    AUDIO.play('ui');
  },

  buildVaultUi: function () {
    if (this.vaultUi) { this.vaultUi.forEach(function (o) { o.destroy(); }); }
    var self = this;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, 700, 500, 0x0f0f1b, 0.97).setDepth(80).setStrokeStyle(2, 0xffcd75));
    ui.push(this.add.text(cx, cy - 222, 'THE VAULT', { fontFamily: 'monospace', fontSize: 22, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 196, 'banked gear survives death · equipped gear dies with the character',
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));

    var rowH = 42;
    var mkRow = function (x, y, w, key, subLabel, onClick, clickable) {
      var box = self.add.rectangle(x, y, w, rowH - 6, 0x1a1c2c, 1).setDepth(81)
        .setStrokeStyle(1, key ? itemTint(key) : 0x29366f);
      ui.push(box);
      if (key) {
        var it = DATA.items[key];
        ui.push(self.add.sprite(x - w / 2 + 20, y, it.texture).setScale(1.6).setTint(itemTint(key)).setDepth(82));
        ui.push(self.add.text(x - w / 2 + 38, y - 13, itemLabel(key),
          { fontFamily: 'monospace', fontSize: 12, color: itemColor(key) }).setDepth(82));
        ui.push(self.add.text(x - w / 2 + 38, y + 2, it.desc,
          { fontFamily: 'monospace', fontSize: 9, color: '#94b0c2' }).setDepth(82));
      } else {
        ui.push(self.add.text(x - w / 2 + 38, y - 6, subLabel,
          { fontFamily: 'monospace', fontSize: 11, color: '#566c86' }).setDepth(82));
      }
      if (clickable) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerover', function () { box.setFillStyle(0x29366f, 1); });
        box.on('pointerout',  function () { box.setFillStyle(0x1a1c2c, 1); });
        box.on('pointerdown', onClick);
      }
      return box;
    };

    // left column: EQUIPPED (click → bank)
    var lx = cx - 172, colW = 320, top = cy - 148;
    ui.push(this.add.text(lx, top - 24, 'EQUIPPED  (click to bank)', { fontFamily: 'monospace', fontSize: 12, color: '#41a6f6' }).setOrigin(0.5).setDepth(81));
    DATA.equipSlots.forEach(function (slot, i) {
      var key = CURRENT.equipment[slot];
      ui.push(self.add.text(lx - colW / 2 + 4, top + i * rowH - 20, slot.toUpperCase(),
        { fontFamily: 'monospace', fontSize: 8, color: '#566c86' }).setDepth(82));
      mkRow(lx, top + i * rowH, colW, key, '— empty ' + slot + ' slot —', function () {
        self.bankItem(slot);
      }, !!key);
    });

    // the numbers the gear is worth, under the equipped column
    var eb = SIM.equipBonus(CURRENT.equipment), parts = [];
    for (var k in eb) if (eb[k]) parts.push('+' + eb[k] + ' ' + k.toUpperCase());
    var wm = SIM.weaponMod(CURRENT.equipment);
    if (wm.dmg) parts.unshift('+' + wm.dmg + ' weapon dmg');
    ui.push(this.add.text(lx, top + 4 * rowH + 4, parts.length ? 'gear total:  ' + parts.join(' · ') : 'no gear equipped',
      { fontFamily: 'monospace', fontSize: 10, color: '#38b764', wordWrap: { width: colW } }).setOrigin(0.5, 0).setDepth(82));

    // right column: VAULT (click → equip/swap)
    var rx = cx + 172;
    ui.push(this.add.text(rx, top - 24, 'VAULT ' + GAME_SAVE.vault.length + '/' + DATA.vault.slots + '  (click to equip)',
      { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));
    var vRowH = 38;
    for (var i = 0; i < DATA.vault.slots; i++) {
      (function (idx) {
        var key = GAME_SAVE.vault[idx] || null;
        var box = self.add.rectangle(rx, top + idx * vRowH, colW, vRowH - 5, 0x1a1c2c, 1).setDepth(81)
          .setStrokeStyle(1, key ? itemTint(key) : 0x29366f);
        ui.push(box);
        if (key) {
          var it = DATA.items[key];
          ui.push(self.add.sprite(rx - colW / 2 + 20, top + idx * vRowH, it.texture).setScale(1.5).setTint(itemTint(key)).setDepth(82));
          ui.push(self.add.text(rx - colW / 2 + 38, top + idx * vRowH - 8, itemLabel(key) + '  (' + it.slot + ')',
            { fontFamily: 'monospace', fontSize: 11, color: itemColor(key) }).setDepth(82));
          box.setInteractive({ useHandCursor: true });
          box.on('pointerover', function () { box.setFillStyle(0x29366f, 1); });
          box.on('pointerout',  function () { box.setFillStyle(0x1a1c2c, 1); });
          box.on('pointerdown', function () { self.equipFromVault(idx); });
        } else {
          ui.push(self.add.text(rx - colW / 2 + 38, top + idx * vRowH - 7, '— empty —',
            { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setDepth(82));
        }
      })(i);
    }

    ui.push(this.add.text(cx, cy + 222, '[ V or ESC to close ]', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));
    this.vaultUi = ui;
  },

  // Equipped → vault (first free slot). The gate clause: "tester banks an item".
  bankItem: function (slot) {
    var key = CURRENT.equipment[slot];
    if (!key) return;
    if (GAME_SAVE.vault.length >= DATA.vault.slots) {
      this.toast('the vault is full — equip or leave something first');
      return;
    }
    GAME_SAVE.vault.push(key);
    CURRENT.equipment[slot] = null;
    applyEquipmentChange(this);                          // persists
    AUDIO.play('ui');
    this.toast(DATA.items[key].name + ' banked — it will outlive you');
    this.buildVaultUi();
  },

  // Vault → equipped. Occupied slot = swap (the old item takes the vault spot).
  equipFromVault: function (idx) {
    var key = GAME_SAVE.vault[idx];
    if (!key) return;
    var slot = DATA.items[key].slot;
    var old = CURRENT.equipment[slot];
    CURRENT.equipment[slot] = key;
    if (old) GAME_SAVE.vault[idx] = old;                 // swap in place
    else GAME_SAVE.vault.splice(idx, 1);                 // slot freed
    applyEquipmentChange(this);                          // persists
    AUDIO.play('drink');
    this.toast(DATA.items[key].name + ' equipped' + (old ? ' — ' + DATA.items[old].name + ' banked' : ''));
    this.buildVaultUi();
  },

  // ------------------------------------------- M2: GRAVEYARD & RECORDS --
  toggleGraveyard: function () {
    if (this.gyUi) { this.gyUi.forEach(function (o) { o.destroy(); }); this.gyUi = null; return; }
    if (this.consoleUi) this.toggleConsole();            // one overlay at a time
    if (this.bestiaryUi) this.toggleBestiary();
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [], R = ACCOUNT.records;
    ui.push(this.add.rectangle(cx, cy, 620, 460, 0x0f0f1b, 0.96).setDepth(80).setStrokeStyle(2, 0x49e83b));
    ui.push(this.add.text(cx, cy - 200, 'RECORDS', { fontFamily: 'monospace', fontSize: 20, color: '#49e83b' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 178, 'the account · fallen heroes', { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 152,
      'best level ' + R.bestLevel + ' · deaths ' + R.deaths + ' · total kills ' + R.totalKills +
      ' · realms entered ' + R.realmsEntered + ' · closed ' + R.realmsClosed,
      { fontFamily: 'monospace', fontSize: 12, color: '#f4f4f4' }).setOrigin(0.5).setDepth(81));
    var rows = ACCOUNT.graveyard.slice(-10).reverse();
    if (!rows.length) {
      ui.push(this.add.text(cx, cy - 40, 'No one has died yet.\nThe realm will fix that.',
        { fontFamily: 'monospace', fontSize: 13, color: '#566c86', align: 'center' }).setOrigin(0.5).setDepth(81));
    } else {
      for (var i = 0; i < rows.length; i++) {
        var g = rows[i];
        ui.push(this.add.text(cx, cy - 128 + i * 26,
          'Lv ' + g.level + ' ' + DATA.classes[g.cls].name + ' — ' + g.kills + ' kills — slain by ' + g.killer,
          { fontFamily: 'monospace', fontSize: 12, color: i === 0 ? '#f4f4f4' : '#94b0c2' }).setOrigin(0.5).setDepth(81));
      }
    }
    ui.push(this.add.text(cx, cy + 200, '[ G or ESC to close ]', { fontFamily: 'monospace', fontSize: 12, color: '#49e83b' }).setOrigin(0.5).setDepth(81));
    this.gyUi = ui;
  },

  // ------------------------------------------------ M3.6: THE BESTIARY --
  // Field notes on every implemented creature, read STRAIGHT from data.js —
  // a new mob or boss in DATA appears here automatically. Navigate with the
  // LEFT/RIGHT arrows (or click ◀ ▶); B/ESC closes.
  handleBestiary: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.bestiaryUi || this.charging) return;
    var p = this.player, bp = this.bestiaryPos;
    var near = Math.hypot(bp.x - p.x, bp.y - p.y) <= DATA.interact.consoleRange;
    this.bestiarySprite.setScale(near ? 3.3 : 3);        // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleBestiary();
  },

  bestiaryEntries: function () {
    var e = [], k;
    for (k in DATA.mobs) e.push({ kind: 'mob', key: k });
    for (k in DATA.bosses) e.push({ kind: 'boss', key: k });
    return e;
  },

  toggleBestiary: function () {
    if (this.bestiaryUi) {
      this.bestiaryUi.forEach(function (o) { o.destroy(); });
      this.bestiaryUi = null;
      this.input.keyboard.off('keydown-LEFT', this.bestiaryNavL, this);   // bug #2 family
      this.input.keyboard.off('keydown-RIGHT', this.bestiaryNavR, this);
      return;
    }
    if (this.vaultUi) this.toggleVault();                // one overlay at a time
    if (this.gyUi) this.toggleGraveyard();
    if (this.consoleUi) this.toggleConsole();
    this.buildBestiaryUi();
    this.bestiaryNavL = this.bestiaryNavL || function () { this.bestiaryNav(-1); };
    this.bestiaryNavR = this.bestiaryNavR || function () { this.bestiaryNav(1); };
    this.input.keyboard.off('keydown-LEFT', this.bestiaryNavL, this);
    this.input.keyboard.off('keydown-RIGHT', this.bestiaryNavR, this);
    this.input.keyboard.on('keydown-LEFT', this.bestiaryNavL, this);
    this.input.keyboard.on('keydown-RIGHT', this.bestiaryNavR, this);
    AUDIO.play('ui');
  },

  bestiaryNav: function (dir) {
    if (!this.bestiaryUi) return;
    var n = this.bestiaryEntries().length;
    this.bestiaryIndex = (this.bestiaryIndex + dir + n) % n;
    AUDIO.play('ui');
    this.buildBestiaryUi();
  },

  buildBestiaryUi: function () {
    if (this.bestiaryUi) { this.bestiaryUi.forEach(function (o) { o.destroy(); }); this.bestiaryUi = null; }
    var self = this;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var entries = this.bestiaryEntries();
    this.bestiaryIndex = ((this.bestiaryIndex % entries.length) + entries.length) % entries.length;
    var entry = entries[this.bestiaryIndex];
    var GREEN = '#49e83b', DIM = '#94b0c2', FAINT = '#566c86';
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, 640, 520, 0x0f0f1b, 0.97).setDepth(80).setStrokeStyle(2, 0x49e83b));
    ui.push(this.add.text(cx, cy - 232, 'BESTIARY', { fontFamily: 'monospace', fontSize: 22, color: GREEN }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 206, 'field notes on everything the realm sends at you',
      { fontFamily: 'monospace', fontSize: 11, color: DIM }).setOrigin(0.5).setDepth(81));

    // navigation: ◀ entry n/N ▶ (arrow keys or click)
    var navL = this.add.text(cx - 160, cy - 170, '◀', { fontFamily: 'monospace', fontSize: 26, color: GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    navL.on('pointerdown', function () { self.bestiaryNav(-1); });
    ui.push(navL);
    var navR = this.add.text(cx + 160, cy - 170, '▶', { fontFamily: 'monospace', fontSize: 26, color: GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    navR.on('pointerdown', function () { self.bestiaryNav(1); });
    ui.push(navR);
    ui.push(this.add.text(cx, cy - 170, 'entry ' + (this.bestiaryIndex + 1) + ' / ' + entries.length,
      { fontFamily: 'monospace', fontSize: 12, color: DIM }).setOrigin(0.5).setDepth(81));

    var d, lines = [], role, tint;
    if (entry.kind === 'mob') {
      d = DATA.mobs[entry.key];
      role = d.shoot ? 'SHOOTER' : 'CHASER';
      tint = d.deathTint;
      lines.push(['HP', d.hp], ['SPEED', d.spd], ['XP', d.xp], ['THREAT COST', d.cost]);
      if (d.chase) lines.push(['CONTACT DMG', d.chase.contactDmg]);
      if (d.shoot) {
        lines.push(['BOLT DMG', d.shoot.dmg], ['RANGE', d.shoot.range],
                   ['BOLT SPEED', d.shoot.projSpeed], ['COOLDOWN', (d.shoot.cooldownMs / 1000) + 's']);
        if (d.shoot.count > 1) lines.push(['VOLLEY', d.shoot.count + ' bolts · ' + d.shoot.spreadDeg + '° fan']);
      }
    } else {
      d = DATA.bosses[entry.key];
      role = 'BOSS';
      tint = d.deathTint;
      lines.push(['HP', d.hp], ['SPEED', d.spd], ['XP', d.xp], ['CONTACT DMG', d.contactDmg]);
    }

    // portrait + name
    ui.push(this.add.sprite(cx - 180, cy - 60, d.texture).setScale(entry.kind === 'boss' ? 4.5 : 5).setDepth(81));
    ui.push(this.add.text(cx - 180, cy + 6, d.name, { fontFamily: 'monospace', fontSize: 14, color: '#f4f4f4' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx - 180, cy + 24, entry.kind === 'boss' ? (d.title || role) : role,
      { fontFamily: 'monospace', fontSize: 10, color: '#' + ('00000' + tint.toString(16)).slice(-6) }).setOrigin(0.5).setDepth(81));

    // stat block
    var sy = cy - 120;
    lines.forEach(function (row) {
      ui.push(self.add.text(cx - 40, sy, row[0], { fontFamily: 'monospace', fontSize: 11, color: DIM }).setDepth(81));
      ui.push(self.add.text(cx + 120, sy, String(row[1]), { fontFamily: 'monospace', fontSize: 11, color: '#f4f4f4' }).setDepth(81));
      sy += 20;
    });

    // abilities / behavior notes
    var notes = [];
    if (entry.kind === 'mob') {
      notes.push(d.shoot
        ? (d.shoot.count > 1
            ? 'Keeps its distance and looses a ' + d.shoot.count + '-bolt spray.'
            : 'Keeps its distance and fires single aimed bolts.')
        : 'Chases you down — damage on contact.');
      notes.push(d.unlockAt ? 'Joins the realm ' + d.unlockAt + 's in.' : 'Hunts from the first second.');
      notes.push('May spawn as a CHAMPION (' + Math.round(DATA.affixes.mobRollChance * 100) + '% roll) wearing an affix.');
    } else {
      var pk;
      for (pk in d.patterns) {
        var pat = d.patterns[pk];
        notes.push(pk.toUpperCase() + ' — ' +
          (pat.count ? pat.count + ' bolts in a ring' : pat.shots + ' aimed bolts') +
          ' · ' + pat.dmg + ' dmg · every ' + (pat.everyMs / 1000) + 's');
      }
      (d.hints || []).forEach(function (h) { notes.push(h); });
    }
    var ny = cy + 60;
    notes.forEach(function (n) {
      var t = self.add.text(cx - 285, ny, '· ' + n,
        { fontFamily: 'monospace', fontSize: 10, color: FAINT, wordWrap: { width: 570 } }).setDepth(81);
      ny += t.height + 6;
      ui.push(t);
    });

    ui.push(this.add.text(cx, cy + 236, '[ ◀ ▶ browse · B or ESC to close ]',
      { fontFamily: 'monospace', fontSize: 11, color: GREEN }).setOrigin(0.5).setDepth(81));
    this.bestiaryUi = ui;
  },

  // M3: SPACE-activated portal travel (Q6 pattern, nexus edition). Held while
  // the vault/graveyard/console overlays are open so a click-spree can't warp
  // you. M3.5 polish (user, 2026-07-12): no floating prompt — the run you
  // configured is visible ON the works (mode-colored portal, ring, well glow);
  // the footer says SPACE to interact.
  handlePortals: function () {
    if (this.entering) return;
    var near = null, p = this.player, R = DATA.interact.portalRange;
    for (var i = 0; i < this.plazaPortals.length; i++) {
      var e = this.plazaPortals[i];
      if (Math.hypot(e.sprite.x - p.x, e.sprite.y - p.y) <= R) { near = e; break; }
    }
    if (near && !this.vaultUi && !this.gyUi && !this.consoleUi) {
      if (this.rig.interactJustDown()) this.enterPortal(near);
    }
  },

  enterPortal: function (entry) {
    if (this.entering) return;
    this.entering = true;
    this.registry.remove('pendingPortal');               // M3.5: ONE-SHOT — consumed on entry
    this.powerDown();                                    // the works go dark behind you
    AUDIO.stopMusic();                                   // M3.9: the chamber falls silent
    persist();
    AUDIO.play('portal');
    this.cameras.main.fadeOut(400);
    var self = this;
    this.time.delayedCall(450, function () {
      self.scene.start('Realm', { mode: entry.mode, affixes: entry.affixes || [] });
    });
  },

  update: function (time, delta) {
    if (this._menuOpen) { this.player.body.setVelocity(0, 0); return; }   // menu freezes the room
    var intent = this.rig.collect(this.player, false);
    intent.firing = false; intent.ability = false;      // nexus is safe (Fusion Law F1)
    // M3.8: walk-to-interact — a straight line to the station, then act.
    // Any manual movement input cancels the trip.
    if (this.autoWalk) {
      if (intent.moveX || intent.moveY) {
        this.autoWalk = null;
      } else {
        var aw = this.autoWalk;
        var dx = aw.x - this.player.x, dy = aw.y - this.player.y;
        var dist = Math.hypot(dx, dy);
        // arrival window scales with the distance covered per frame, so the
        // ~2fps headless clock can't oscillate around the target forever
        var arrive = Math.max(12, this.player.state.stats.spd * delta / 1000);
        if (dist <= arrive) {
          this.player.body.reset(aw.x, aw.y);            // true snap: position + velocity
          this.autoWalk = null;
          aw.act.call(this);
        } else {
          intent.moveX = dx / dist; intent.moveY = dy / dist;
        }
      }
    }
    this.handlePortals();                               // M3: SPACE commits at a portal
    this.handleConsole();                               // M3.5: SPACE opens the machine
    this.handleBestiary();                              // M3.6: SPACE opens the bestiary
    this.handleRecords();                               // M3.7: SPACE opens the records
    this.handleSwitch();                                // M3.8: SPACE throws the lever
    Entities.updatePlayer(this, this.player, intent, time, delta);
  }
});

// ------------------------------------------------------------------ REALM --
var RealmScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Realm' }); },

  create: function (data) {
    if (!GAME_SAVE) { this.scene.start('Title'); return; }   // no slot bound → welcome screen
    ACCOUNT.records.realmsEntered++;
    persist();
    // M3 (Lane C): the realm is a painted MAP now. Builder playtests pass
    // data.mapId; the plaza uses DATA.realm.map. A saved map under the same
    // id overrides the built-in. Fallback (missing/corrupt map): the legacy
    // endless biome tileSprite — never a crash (TM-4 spirit).
    this.map = MAPS.get((data && data.mapId) || DATA.realm.map);
    var WW, HH;
    if (this.map) {
      WW = this.map.w * MAPS.TILE; HH = this.map.h * MAPS.TILE;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.mapRender = MAPS.renderChunks(this, this.map, 'realm', 1);
      this.wallBodies = MAPS.buildWallBodies(this, this.map);
    } else {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.add.tileSprite(WW / 2, HH / 2, WW, HH, DATA.biomes[DATA.realm.biome].tile);  // E7: biome floor
      this.wallBodies = null;
    }
    this.worldW = WW; this.worldH = HH;
    this.cameras.main.setBounds(0, 0, WW, HH).setBackgroundColor('#0f0f1b');

    // player start comes from the map's object layer (center fallback)
    var start = { x: WW / 2, y: HH / 2 };
    if (this.map && this.map.objects.playerStart) {
      start = MAPS.findClearPx(this.map,
        (this.map.objects.playerStart.tx + 0.5) * MAPS.TILE,
        (this.map.objects.playerStart.ty + 0.5) * MAPS.TILE);
    }
    this.player = Entities.createPlayer(this, start.x, start.y, CURRENT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.rig = makeInputRig(this);
    // auto-fire is read LIVE from settings (a Settings checkbox now, not a key),
    // so toggling it in the pause menu takes effect this frame — see update().
    this.startedAt = this.time.now;
    this.deadUi = null;
    this.paused = false; this.pausedAt = 0; this.pauseUi = null;   // M1 pause
    this._menuOpen = false; this._menuHandle = null; this._bindsCapture = false;  // ESC menu (bug #1)
    this.hitstopReadyAt = 0; this.hitstopActive = false;           // M1 hitstop
    this.bossPortal = null; this.boss = null; this.closing = false; // M2 boss flow
    // M2.1 scope patch (MECHANICS_MANIFESTO Part 4) — reset ALL instance-field
    // guards in create(): Phaser reuses scene instances (TESTING.md bug #1).
    this.mode = (data && data.mode) || 'clear';                    // E6: objective mode
    this.modeDef = DATA.modes[this.mode];
    // M3.5: map affixes slotted at the REALM CONSOLE ride along for DISPLAY.
    // They mutate nothing until DATA.console.live flips at M5 (risk = reward
    // numbers land then, resolved by playtest). The HUD shows them so a run
    // configured with affixes is visibly that run.
    this.mapAffixes = (data && data.affixes) || [];
    this.scanning = false; this.scanUi = null;                     // E3: scouter overlay
    this.looting = false; this.lootUi = null; this.pendingLoot = null; // E1: chest overlay
    this.lootItems = [];                                           // M3: chest gear rows
    this.chest = null; this.interactables = []; this.promptText = null; // E1/Q6
    this.championKills = 0;                    // E9 v2: bounty rolls for the boss chest
    wireFullscreen(this);

    // pooled groups (TM-3/TM-5)
    this.mobs = this.physics.add.group({ maxSize: DATA.waves.maxAlive + 10 });
    this.playerShots = this.physics.add.group({ maxSize: 220 });
    this.enemyShots = this.physics.add.group({ maxSize: 300 });

    this.physics.add.collider(this.mobs, this.mobs);
    var self = this;

    // M3: walls are real — they block bodies AND shots (cover to kite around).
    // NOTE: with a dynamic group vs a static group Phaser hands the callback
    // (staticChild, dynamicChild) — identify the shot by .proj, never by order.
    if (this.wallBodies) {
      this.physics.add.collider(this.player, this.wallBodies);
      this.physics.add.collider(this.mobs, this.wallBodies);
      var eatShot = function (group) {
        return function (a, b) {
          var shot = a.proj ? a : b;
          if (shot.proj && shot.active) Entities.killProjectile(group, shot);
        };
      };
      this.physics.add.collider(this.playerShots, this.wallBodies, eatShot(this.playerShots));
      this.physics.add.collider(this.enemyShots, this.wallBodies, eatShot(this.enemyShots));
    }

    // player shots hit mobs (pierce tracks per-mob hits)
    this.physics.add.overlap(this.playerShots, this.mobs, function (shot, mob) {
      if (!shot.active || !mob.active) return;
      if (shot.proj.hits[mob.id]) return;
      shot.proj.hits[mob.id] = true;
      Entities.hurtMob(self, mob, shot.proj.dmg, self.time.now);
      if (!shot.proj.pierce) Entities.killProjectile(self.playerShots, shot);
    });

    // enemy shots hit player (src is "a Warlock" / "The Grovekeeper")
    this.physics.add.overlap(this.enemyShots, this.player, function (playerObj, shot) {
      if (!shot.active) return;
      var killer = shot.proj.src ? shot.proj.src + "'s bolt" : 'a magic bolt';
      Entities.killProjectile(self.enemyShots, shot);
      Entities.hurtPlayer(self, self.player, shot.proj.dmg, self.time.now, killer);
    });

    // chaser contact damage (ticked — TM-2 i-frames still apply)
    this.physics.add.overlap(this.player, this.mobs, function (playerObj, mob) {
      if (!mob.active || !mob.mob.def.chase) return;
      if (self.time.now - mob.mob.lastContactAt < DATA.combat.contactTickMs) return;
      mob.mob.lastContactAt = self.time.now;
      Entities.hurtPlayer(self, self.player, mob.mob.def.chase.contactDmg, self.time.now, 'a ' + mob.mob.def.name);
    });

    // wave director (Fusion Law F3)
    this.spawnEvent = this.time.addEvent({ delay: DATA.waves.spawnIntervalMs, loop: true, callback: this.directorSpend, callbackScope: this });
    this.directorSpend(); this.directorSpend();          // opening pressure

    // Pause / menu key (rebindable, default ESC) — main.js keyboard-locks ESC
    // in fullscreen so it opens the menu instead of leaving fullscreen. Volume,
    // exits AND the auto-fire toggle all live INSIDE the menu now.
    BINDS.wire(this, {
      menu: function () { self.togglePause(); }
    });

    this.buildHud();
    this.wireEvents();
    AUDIO.play('portal');
    this.cameras.main.fadeIn(300);
  },

  // ------------------------------------------------------------ M1: PAUSE --
  // The pause overlay is now the shared ESC menu (MENU): Resume · Settings
  // (music/SFX + keybinds) · Return to chamber · Exit to load screen. The
  // freeze/unfreeze logic stays here; MENU owns the UI and calls unfreeze()
  // back through onResume.
  togglePause: function () {
    if (!this.player.state.alive) return;
    if (this.scanning || this.looting) return;            // M2.1: overlays own the freeze
    if (this._menuHandle) { this._menuHandle.close(); return; }   // close → unfreeze via onResume
    this.pauseGame();
  },

  pauseGame: function () {
    this.paused = true;
    this.pausedAt = this.time.now;
    this.physics.world.pause();
    this.spawnEvent.paused = true;
    this.tweens.pauseAll();
    AUDIO.play('ui');
    var self = this;
    MENU.open(this, {
      title: 'PAUSED',
      extraButtons: [
        { label: 'Return to chamber', color: '#a7d3ff', onClick: function () {
            persist(); self.scene.start('Nexus', { entry: 'realm' });   // M3.8: numbers ramp on return
        } },
        { label: 'Exit to load screen', color: '#ff9e6d', onClick: function () {
            persist(); AUDIO.stopMusic(); self.scene.start('Title');
        } }
      ],
      onResume: function () { self.unfreeze(); }
    });
  },

  // resumeGame is the single "leave pause" path (death screen calls it too):
  // closing the menu triggers unfreeze via onResume; if it's already gone,
  // unfreeze directly.
  resumeGame: function () {
    if (this._menuHandle) { this._menuHandle.close(); return; }
    this.unfreeze();
  },

  unfreeze: function () {
    if (!this.paused) return;
    this.paused = false;
    var dt = this.time.now - this.pausedAt;
    this.startedAt += dt;                        // realm clock ignores paused time
    var shift = function (g) { g.children.iterate(function (s) { if (s && s.active) s.proj.dieAt += dt; }); };
    shift(this.playerShots); shift(this.enemyShots);
    if (!this.hitstopActive && !this.scanning && !this.looting) this.physics.world.resume();
    // the director resumes only if nothing upstream stood it down (boss flow,
    // E2 wipe, chest pending) — fixes a latent unpause-restarts-the-swarm bug
    this.spawnEvent.paused = !!(this.bossPortal || this.boss || this.pendingLoot || this.closing);
    this.tweens.resumeAll();
    AUDIO.play('ui');
  },

  // ------------------------------------------------- M2: BOSS FLOW (F8) --
  banner: function (msg, color) {
    var t = this.add.text(this.scale.width / 2, this.scale.height * 0.28, msg,
      { fontFamily: 'monospace', fontSize: 26, color: color || '#ffcd75', align: 'center' })
      .setScrollFactor(0).setOrigin(0.5).setDepth(70);
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 700, onComplete: function () { t.destroy(); } });
  },

  // E2 (M2.1, Q7): the mob-destruction wipe — annihilates every live mob (no
  // XP; they were the appetizer) + all enemy shots, and stands the director
  // down. Used when the boss portal opens (clears the run-up) and when a time
  // trial completes.
  annihilateSwarm: function () {
    var self = this;
    this.spawnEvent.paused = true;
    this.mobs.children.iterate(function (m) {
      if (m && m.active) { self.burst(m.x, m.y, 6, m.mob.def.deathTint); Entities.clearNameTag(m); m.body.enable = false; self.mobs.killAndHide(m); }
    });
    this.enemyShots.children.iterate(function (s) { if (s && s.active) Entities.killProjectile(self.enemyShots, s); });
    // full-screen destruction flash
    var W = this.scale.width, H = this.scale.height;
    var flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0.55).setScrollFactor(0).setDepth(75);
    this.tweens.add({ targets: flash, alpha: 0, duration: 550, onComplete: function () { flash.destroy(); } });
    this.cameras.main.shake(200, 0.008);
  },

  openBossPortal: function () {
    // spawn the portal near (not on) the player, clamped inside the world,
    // nudged off the scenery (M3 maps have walls)
    var a = SIM.rng() * Math.PI * 2;
    var x = Phaser.Math.Clamp(this.player.x + Math.cos(a) * 260, 100, this.worldW - 100);
    var y = Phaser.Math.Clamp(this.player.y + Math.sin(a) * 260, 100, this.worldH - 100);
    if (this.map) { var c = MAPS.findClearPx(this.map, x, y); x = c.x; y = c.y; }
    this.bossPortal = this.physics.add.staticSprite(x, y, 'portal').setScale(3).setTint(0xb13e53).setDepth(6);
    this.tweens.add({ targets: this.bossPortal, angle: 360, duration: 3000, repeat: -1 });
    portalSwirl(this, x, y, 0xb13e53);
    this.annihilateSwarm();                              // E2/Q7: the run-up is CLEAR
    this.banner('THE PORTAL\'S ROAR ANNIHILATES THE SWARM\nthe way to the boss lies open', '#b13e53');
    AUDIO.play('portal');
    var self = this;
    this.physics.add.overlap(this.player, this.bossPortal, function () {
      if (!self.boss && !self.closing) self.startBossFight();
    });
  },

  startBossFight: function () {
    var self = this;
    AUDIO.play('portal');
    // quiet safety clear (the loud E2 wipe already fired at portal open)
    this.spawnEvent.paused = true;
    this.mobs.children.iterate(function (m) {
      if (m && m.active) { Entities.clearNameTag(m); m.body.enable = false; self.mobs.killAndHide(m); }
    });
    this.enemyShots.children.iterate(function (s) { if (s && s.active) Entities.killProjectile(self.enemyShots, s); });
    if (this.bossPortal) { this.bossPortal.destroy(); this.bossPortal = null; }

    var def = DATA.bosses[DATA.realm.boss];
    var bx, by;
    if (this.map && this.map.objects.bossArena) {
      // M3: the map defines a BOSS ARENA — the portal delivers you to its
      // edge and the boss holds its center (a real boss room, E2/E3 language).
      var A = this.map.objects.bossArena, T = MAPS.TILE;
      bx = (A.tx + A.tw / 2) * T; by = (A.ty + A.th / 2) * T;
      var ps = MAPS.findClearPx(this.map, bx, (A.ty + A.th - 2) * T);
      this.player.setPosition(ps.x, ps.y);
      this.cameras.main.centerOn(ps.x, ps.y);
    } else {
      var a = SIM.rng() * Math.PI * 2;
      bx = Phaser.Math.Clamp(this.player.x + Math.cos(a) * 380, 150, this.worldW - 150);
      by = Phaser.Math.Clamp(this.player.y + Math.sin(a) * 380, 150, this.worldH - 150);
      if (this.map) { var c = MAPS.findClearPx(this.map, bx, by); bx = c.x; by = c.y; }
    }
    this.boss = Entities.spawnBoss(this, DATA.realm.boss, bx, by, this.time.now);
    if (this.wallBodies) this.physics.add.collider(this.boss, this.wallBodies);   // M3: bosses respect walls
    this.banner(def.name.toUpperCase() + '\nguardian of ' + DATA.realm.name, '#b13e53');

    // boss HP bar (top center)
    var W = this.scale.width;
    this.bossBarBg = this.add.rectangle(W / 2, 18, 320, 14, 0x1a1c2c).setScrollFactor(0).setDepth(52);
    this.bossBar = this.add.rectangle(W / 2 - 159, 19, 318, 12, 0xb13e53).setOrigin(0, 0.5).setScrollFactor(0).setDepth(53);
    this.bossName = this.add.text(W / 2, 34, def.name, { fontFamily: 'monospace', fontSize: 11, color: '#b13e53' }).setScrollFactor(0).setOrigin(0.5, 0).setDepth(53);

    // player shots hurt the boss (pierce tracked like mobs)
    this.physics.add.overlap(this.playerShots, this.boss, function (boss, shot) {
      if (!shot.active || !boss.active) return;
      if (shot.proj.hits[boss.id]) return;
      shot.proj.hits[boss.id] = true;
      Entities.hurtBoss(self, boss, shot.proj.dmg);
      if (!shot.proj.pierce) Entities.killProjectile(self.playerShots, shot);
    });
    // boss contact damage (ticked, i-frames still apply)
    this.physics.add.overlap(this.player, this.boss, function (playerObj, boss) {
      if (!boss.active) return;
      if (self.time.now - boss.boss.lastContactAt < DATA.combat.contactTickMs) return;
      boss.boss.lastContactAt = self.time.now;
      Entities.hurtPlayer(self, self.player, boss.boss.def.contactDmg, self.time.now, def.name);
    });

    this.showScouter(def);                               // E3: the workup sheet
  },

  // --------------------------------------- E3 (M2.1): SCOUTER WORKUP SHEET --
  // DBZ-scouter style scan on boss-room entry: raw stats, a visual readout of
  // the boss, and tactical hints per pattern (data-driven — DATA.bosses.*.hints).
  // Combat holds (physics + update loop) until the scan is dismissed.
  showScouter: function (def) {
    var self = this;
    this.scanning = true;
    this.physics.world.pause();
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.6).setScrollFactor(0).setDepth(84));
    var panel = this.add.rectangle(cx, cy, 640, 448, 0x0f0f1b, 0.96).setScrollFactor(0).setDepth(85).setStrokeStyle(2, 0x38b764);
    ui.push(panel);
    // scan sweep line (cosmetic)
    var sweep = this.add.rectangle(cx, cy - 214, 636, 3, 0x38b764, 0.8).setScrollFactor(0).setDepth(88);
    ui.push(sweep);
    this.tweens.add({ targets: sweep, y: cy + 214, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    ui.push(this.add.text(cx, cy - 198, '— SCOUTER · THREAT ANALYSIS —',
      { fontFamily: 'monospace', fontSize: 14, color: '#38b764' }).setScrollFactor(0).setOrigin(0.5).setDepth(86));
    ui.push(this.add.text(cx, cy - 168, def.name.toUpperCase(),
      { fontFamily: 'monospace', fontSize: 26, color: '#f4f4f4' }).setScrollFactor(0).setOrigin(0.5).setDepth(86));
    ui.push(this.add.text(cx, cy - 142, def.title || '',
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setScrollFactor(0).setOrigin(0.5).setDepth(86));
    // visual readout — the boss itself, framed
    ui.push(this.add.rectangle(cx - 210, cy - 8, 170, 170, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86).setStrokeStyle(1, 0x38b764));
    var pic = this.add.image(cx - 210, cy - 8, def.texture).setScale(6).setScrollFactor(0).setDepth(87);
    ui.push(pic);
    this.tweens.add({ targets: pic, scale: { from: 6, to: 6.5 }, yoyo: true, duration: 700, repeat: -1 });
    // raw stats
    var pats = 0; for (var k in def.patterns) pats++;
    ui.push(this.add.text(cx - 100, cy - 88,
      'HP        ' + def.hp + '\nSPEED     ' + def.spd + '\nCONTACT   ' + def.contactDmg + ' dmg' +
      '\nPATTERNS  ' + pats + '\nBOUNTY    ' + def.xp + ' xp',
      { fontFamily: 'monospace', fontSize: 13, color: '#38b764', lineSpacing: 6 }).setScrollFactor(0).setDepth(86));
    // tactical hints (the moveset)
    var hints = (def.hints || []).map(function (h) { return '· ' + h; }).join('\n');
    ui.push(this.add.text(cx - 100, cy + 24, 'TACTICAL READOUT\n' + hints,
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2', lineSpacing: 5, wordWrap: { width: 400 } }).setScrollFactor(0).setDepth(86));
    ui.push(this.add.text(cx, cy + 198, '[ ENTER or CLICK to engage ]',
      { fontFamily: 'monospace', fontSize: 13, color: '#ffcd75' }).setScrollFactor(0).setOrigin(0.5).setDepth(86));
    this.scanUi = ui;
    AUDIO.play('ui');
    var go = function () { self.dismissScouter(); };
    this.rig.keys.ENTER.once('down', go);
    this.input.once('pointerdown', go);
  },

  dismissScouter: function () {
    if (!this.scanning) return;
    this.scanning = false;
    if (this.scanUi) { this.scanUi.forEach(function (o) { o.destroy(); }); this.scanUi = null; }
    if (this.boss && this.boss.boss) {                   // the grace period starts NOW
      this.boss.boss.nextRadialAt = this.time.now + 1600;
      this.boss.boss.nextStreamAt = this.time.now + 3000;
    }
    if (!this.paused && !this.hitstopActive) this.physics.world.resume();
    AUDIO.play('ui');
  },

  // ---------------------------------------- E1 (M2.1): BOSS LOOT CHEST --
  // The boss now DROPS A CHEST (V10) instead of auto-awarding. SPACE opens it
  // (Q6 contextual interact); a PoE2-style selection overlay lists the loot.
  // Rewards are banked + persisted at OPEN time — before any screen (TM-4 rule).
  onBossDown: function (boss) {
    var def = boss.boss.def;
    var bx = boss.x, by = boss.y;
    this.burst(bx, by, 40, def.deathTint);
    boss.destroy(); this.boss = null;
    if (this.bossBar) { this.bossBar.destroy(); this.bossBarBg.destroy(); this.bossName.destroy(); this.bossBar = null; }
    AUDIO.play('victory');
    var stat = DATA.potions.stats[Math.floor(SIM.rng() * DATA.potions.stats.length)];  // seam rule 4
    // M3: the chest also rolls GEAR from the boss's drop table (E1 phase 2 —
    // per-item take/leave is real now). Rolled here, once, through SIM.rng.
    var items = [];
    var table = def.lootTable && DATA.dropTables[def.lootTable];
    if (table) for (var i = 0; i < table.rolls; i++) items.push(SIM.rollDrop(table.entries));
    // E9 v2 — CHAMPION BOUNTY: every champion killed this realm adds a roll
    // (capped) — affixed mobs drop better, paid out where loot lives: the chest.
    var B = DATA.affixes.championBounty;
    var bounty = Math.min(B.cap, this.championKills * B.perKill);
    for (var j = 0; j < bounty; j++) items.push(SIM.rollDrop(DATA.dropTables[B.table].entries));
    this.pendingLoot = {
      kind: 'clear', stat: stat, xp: def.xp + DATA.realm.closeXpBonus, items: items,
      headline: def.name + ' has fallen'
    };
    this.spawnLootChest(bx, by);
    this.banner(def.name.toUpperCase() + ' HAS FALLEN\nit drops a chest...', '#ffcd75');
  },

  spawnLootChest: function (x, y) {
    var self = this;
    this.chest = this.add.sprite(x, y, 'chest').setScale(2.5).setDepth(6);
    this.tweens.add({ targets: this.chest, scale: { from: 2.5, to: 2.9 }, yoyo: true, duration: 600, repeat: -1 });
    portalSwirl(this, x, y, 0xffcd75);
    this.interactables.push({ x: x, y: y, prompt: DATA.chest.promptText,
                              action: function () { self.openChest(); } });
  },

  openChest: function () {
    if (this.looting || this.closing || !this.pendingLoot) return;
    this.looting = true;
    this.interactables = [];
    if (this.promptText) { this.promptText.destroy(); this.promptText = null; }
    this.physics.world.pause();
    AUDIO.play('levelup');
    // BANK + PERSIST FIRST — the overlay is presentation; per-item choice
    // becomes real when equipment lands at M3 (E1 phase 2).
    var L = this.pendingLoot, st = this.player.state;
    if (L.stat) ACCOUNT.potions[L.stat]++;
    Entities.grantXp(this, this.player, L.xp);
    ACCOUNT.records.realmsClosed++;
    ACCOUNT.records.totalKills += st.kills; st.kills = 0;    // banked, not lost
    CURRENT.level = st.level; CURRENT.xp = st.xp;
    persist();                                               // reward on disk BEFORE any screen
    // M3: gear is a CHOICE, not a grant — the rows live here while the overlay
    // is up; TAKE equips (persisting each take), leftovers stay in the realm.
    this.lootItems = (L.items || []).slice();
    this.buildLootOverlay(L);
  },

  buildLootOverlay: function (L) {
    if (this.lootUi) { this.lootUi.forEach(function (o) { o.destroy(); }); }
    var self = this, st = this.player.state;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var nItems = this.lootItems.length;
    var panelH = 240 + Math.max(1, nItems + 1) * 62;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.55).setScrollFactor(0).setDepth(84));
    ui.push(this.add.rectangle(cx, cy, 480, panelH, 0x0f0f1b, 0.97).setScrollFactor(0).setDepth(85).setStrokeStyle(2, 0xffcd75));
    ui.push(this.add.sprite(cx - 200, cy - panelH / 2 + 34, 'chest').setScale(2).setScrollFactor(0).setDepth(86));
    ui.push(this.add.text(cx - 168, cy - panelH / 2 + 26, 'LOOT', { fontFamily: 'monospace', fontSize: 20, color: '#ffcd75' }).setScrollFactor(0).setDepth(86));
    var y = cy - panelH / 2 + 92;
    // banked rows (already yours — display only)
    if (L.stat) {
      ui.push(this.add.rectangle(cx, y, 440, 52, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86).setStrokeStyle(1, 0x29366f));
      ui.push(this.add.sprite(cx - 196, y, 'potion').setScale(2.2).setTint(DATA.potions.tints[L.stat]).setScrollFactor(0).setDepth(87));
      ui.push(this.add.text(cx - 170, y - 16, 'POTION OF ' + L.stat.toUpperCase(), { fontFamily: 'monospace', fontSize: 14, color: '#f4f4f4' }).setScrollFactor(0).setDepth(87));
      ui.push(this.add.text(cx - 170, y + 3, '+' + DATA.potions.boost + ' ' + L.stat.toUpperCase() + ' — banked to the stash (survives death)',
        { fontFamily: 'monospace', fontSize: 10, color: '#94b0c2' }).setScrollFactor(0).setDepth(87));
      y += 62;
    }
    ui.push(this.add.rectangle(cx, y, 440, 52, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86).setStrokeStyle(1, 0x29366f));
    ui.push(this.add.sprite(cx - 196, y, 'px').setScale(6).setTint(0xffcd75).setScrollFactor(0).setDepth(87));
    ui.push(this.add.text(cx - 170, y - 16, '+' + L.xp + ' XP', { fontFamily: 'monospace', fontSize: 14, color: '#f4f4f4' }).setScrollFactor(0).setDepth(87));
    ui.push(this.add.text(cx - 170, y + 3, 'applied — now level ' + st.level + (st.level >= DATA.xp.cap ? ' (MAX)' : ''),
      { fontFamily: 'monospace', fontSize: 10, color: '#94b0c2' }).setScrollFactor(0).setDepth(87));
    y += 62;
    // M3: GEAR rows — the PoE2 moment. TAKE equips; an occupied slot swaps the
    // old item back into the chest row (change your mind freely; leftovers
    // stay behind when you close the lid).
    this.lootItems.forEach(function (key, idx) {
      var box = self.add.rectangle(cx, y, 440, 52, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86);
      ui.push(box);
      if (key) {
        var it = DATA.items[key];
        box.setStrokeStyle(1, itemTint(key)).setInteractive({ useHandCursor: true });
        box.on('pointerover', function () { box.setFillStyle(0x29366f, 1); });
        box.on('pointerout',  function () { box.setFillStyle(0x1a1c2c, 1); });
        box.on('pointerdown', function () { self.takeItemFromChest(idx); });
        ui.push(self.add.sprite(cx - 196, y, it.texture).setScale(2).setTint(itemTint(key)).setScrollFactor(0).setDepth(87));
        ui.push(self.add.text(cx - 170, y - 16, itemLabel(key), { fontFamily: 'monospace', fontSize: 13, color: itemColor(key) }).setScrollFactor(0).setDepth(87));
        var cur = CURRENT.equipment[it.slot];
        ui.push(self.add.text(cx - 170, y + 3, it.desc + (cur ? '  ·  swaps out ' + DATA.items[cur].name : ''),
          { fontFamily: 'monospace', fontSize: 10, color: '#94b0c2' }).setScrollFactor(0).setDepth(87));
        ui.push(self.add.text(cx + 208, y, 'TAKE ▶', { fontFamily: 'monospace', fontSize: 12, color: '#38b764' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(87));
      } else {
        box.setStrokeStyle(1, 0x29366f);
        ui.push(self.add.text(cx - 170, y - 6, '— taken —', { fontFamily: 'monospace', fontSize: 11, color: '#566c86' }).setScrollFactor(0).setDepth(87));
      }
      y += 62;
    });
    ui.push(this.add.text(cx, cy + panelH / 2 - 26,
      nItems ? '[ ENTER — take upgrades & close ]' : '[ ENTER — close ]',
      { fontFamily: 'monospace', fontSize: 14, color: '#ffcd75' }).setScrollFactor(0).setOrigin(0.5).setDepth(86));
    this.lootUi = ui;
    // the overlay rebuilds on every take — clear the old once() first so ENTER
    // listeners don't stack (TESTING.md bug #2 family)
    this.rig.keys.ENTER.off('down');
    this.rig.keys.ENTER.once('down', function () { self.takeLoot(); });
  },

  // M3: TAKE one item — equips it on the spot (persisted); if the slot was
  // occupied, the old item takes the row (swap back any time before closing).
  takeItemFromChest: function (idx) {
    if (!this.looting) return;
    var key = this.lootItems[idx];
    if (!key) return;
    var slot = DATA.items[key].slot;
    var old = CURRENT.equipment[slot] || null;
    CURRENT.equipment[slot] = key;
    this.lootItems[idx] = old;
    applyEquipmentChange(this);                          // re-derive + persist
    AUDIO.play('drink');
    this.buildLootOverlay(this.pendingLoot);             // redraw with the swap
  },

  takeLoot: function () {
    if (!this.looting) return;
    // ENTER = grab the sensible leftovers: equip anything whose slot is empty
    // or holds a LOWER tier (the replaced piece is left in the realm), then close.
    var changed = false;
    for (var i = 0; i < this.lootItems.length; i++) {
      var key = this.lootItems[i];
      if (!key) continue;
      var it = DATA.items[key], cur = CURRENT.equipment[it.slot];
      if (!cur || DATA.items[cur].tier < it.tier) {
        CURRENT.equipment[it.slot] = key;
        this.lootItems[i] = null;
        changed = true;
      }
    }
    if (changed) applyEquipmentChange(this);             // re-derive + persist
    if (this.lootUi) { this.lootUi.forEach(function (o) { o.destroy(); }); this.lootUi = null; }
    if (this.chest) { this.chest.destroy(); this.chest = null; }
    var L = this.pendingLoot; this.pendingLoot = null;
    this.lootItems = [];
    this.looting = false;
    AUDIO.play('drink');
    this.closeScreen(L);
  },

  // Realms end; the account doesn't (F8). Shown AFTER the chest is looted.
  closeScreen: function (L) {
    this.closing = true;
    var self = this, st = this.player.state;
    this.physics.world.pause();
    var tSec = Math.floor((this.time.now - this.startedAt) / 1000);
    var mmss = Math.floor(tSec / 60) + ':' + ('0' + tSec % 60).slice(-2);
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var title = L.kind === 'survival' ? 'TRIAL COMPLETE' : 'REALM CLOSED';
    this.add.rectangle(cx, cy, W, H, 0x000000, 0.72).setScrollFactor(0).setDepth(90);
    this.add.text(cx, cy - 110, title, { fontFamily: 'monospace', fontSize: 42, color: '#38b764' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy - 62, L.headline + ' · ' + mmss,
      { fontFamily: 'monospace', fontSize: 15, color: '#f4f4f4' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    if (L.stat) {
      var potIcon = this.add.sprite(cx - 120, cy + 8, 'potion').setScale(3).setTint(DATA.potions.tints[L.stat]).setScrollFactor(0).setDepth(91);
      this.tweens.add({ targets: potIcon, scale: { from: 3, to: 3.6 }, yoyo: true, duration: 500, repeat: -1 });
      this.add.text(cx - 90, cy + 8,
        'POTION OF ' + L.stat.toUpperCase() + '  (+' + DATA.potions.boost + ' ' + L.stat.toUpperCase() + ', drink it in the Nexus)\n' +
        '+' + L.xp + ' bonus XP · now level ' + st.level,
        { fontFamily: 'monospace', fontSize: 14, color: '#94b0c2' }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(91);
    }
    this.add.text(cx, cy + 90, 'The account always moves forward.',
      { fontFamily: 'monospace', fontSize: 13, color: '#ffcd75' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy + 134, '[ ENTER or CLICK to return to the Nexus ]',
      { fontFamily: 'monospace', fontSize: 14, color: '#ffcd75' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    var back = function () { self.physics.world.resume(); self.scene.start('Nexus', { entry: 'realm' }); };
    this.rig.keys.ENTER.once('down', back);
    this.input.once('pointerdown', back);
  },

  // -------------------------------- E6 (M2.1): TIME-TRIAL SURVIVAL (Q8) --
  survivalComplete: function () {
    this.annihilateSwarm();
    this.banner('YOU SURVIVED\nthe horn sounds — the swarm is annihilated', '#ffcd75');
    AUDIO.play('victory');
    var stat = this.modeDef.potionReward
      ? DATA.potions.stats[Math.floor(SIM.rng() * DATA.potions.stats.length)] : null;
    var items = [];                                       // M3: trial gear (pocket change)
    var table = this.modeDef.lootTable && DATA.dropTables[this.modeDef.lootTable];
    if (table) for (var i = 0; i < table.rolls; i++) items.push(SIM.rollDrop(table.entries));
    this.pendingLoot = { kind: 'survival', stat: stat, xp: this.modeDef.xpBonus, items: items,
                         headline: 'survived the ' + this.modeDef.name.toLowerCase() };
    var x = Phaser.Math.Clamp(this.player.x + 60, 100, this.worldW - 100), y = this.player.y;
    if (this.map) { var c = MAPS.findClearPx(this.map, x, y); x = c.x; y = c.y; }
    this.spawnLootChest(x, y);
  },

  // M1 hitstop: freeze physics for ~2-3 frames when a player shot lands.
  hitstop: function (time) {
    if (this.paused || time < this.hitstopReadyAt) return;
    this.hitstopReadyAt = time + DATA.juice.hitstopCooldownMs;
    this.hitstopActive = true;
    this.physics.world.pause();
    var self = this;
    this.time.delayedCall(DATA.juice.hitstopMs, function () {
      self.hitstopActive = false;
      if (!self.paused) self.physics.world.resume();
    });
  },

  directorSpend: function () {
    if (!this.player.state.alive) return;
    var tSec = (this.time.now - this.startedAt) / 1000;
    var budget = DATA.waves.budget(tSec);
    // E7: the spawn pool comes from the realm's BIOME roster, never the global
    // mob table — attaching a mob to a biome IS adding it to this list.
    var roster = DATA.biomes[DATA.realm.biome].mobs;
    var pool = [];
    roster.forEach(function (k) { if (!DATA.mobs[k].unlockAt || DATA.mobs[k].unlockAt <= tSec) pool.push(k); });
    if (!pool.length) return;                 // biome roster entirely time-locked (early seconds)
    // E9 v2 — PACK LEADER: while one lives, the director skews the mix to
    // casters (shooter mobs), if the unlocked pool has any.
    var leaderUp = false;
    this.mobs.children.iterate(function (m) {
      if (m && m.active && m.mob.affix && m.mob.affix.roleSkew) leaderUp = true;
    });
    if (leaderUp) {
      var casters = pool.filter(function (k) { return !!DATA.mobs[k].shoot; });
      if (casters.length) pool = casters;
    }
    var alive = this.mobs.countActive(true);
    while (budget > 0 && alive < DATA.waves.maxAlive) {
      var k2 = pool[Math.floor(SIM.rng() * pool.length)];
      if (DATA.mobs[k2].cost > budget && budget < 4) k2 = pool[0];   // cheap fallback stays IN-BIOME (E7)
      budget -= DATA.mobs[k2].cost;
      var pt = this.pickSpawnPoint();
      if (pt && Entities.spawnMob(this, k2, pt.x, pt.y)) alive++;
    }
  },

  // M3: spawn placement — the classic off-screen ring, but never inside a
  // wall; if the map's object layer defines SPAWN ZONES, mobs come from those
  // zones instead (builder decides where the swarm pours from).
  pickSpawnPoint: function () {
    // RESIZE mode: the ring must clear the actual viewport so mobs still
    // spawn off-screen at any canvas size (V11/TM-3). data.js values are the floor.
    var cam = this.cameras.main;
    var ringMin = Math.max(DATA.waves.spawnRing.min, Math.hypot(cam.width, cam.height) / 2 + 30);
    var ringMax = ringMin + (DATA.waves.spawnRing.max - DATA.waves.spawnRing.min);
    var zones = (this.map && this.map.objects.spawnZones.length) ? this.map.objects.spawnZones : null;
    for (var t = 0; t < 8; t++) {
      var x, y;
      if (zones) {
        var z = zones[Math.floor(SIM.rng() * zones.length)], T = MAPS.TILE;
        x = (z.tx + SIM.rng() * z.tw) * T;
        y = (z.ty + SIM.rng() * z.th) * T;
        // prefer zone points that aren't right on top of the player
        if (t < 6 && Math.hypot(x - this.player.x, y - this.player.y) < ringMin * 0.5) continue;
      } else {
        var ang = SIM.rng() * Math.PI * 2;
        var d = ringMin + SIM.rng() * (ringMax - ringMin);
        x = Phaser.Math.Clamp(this.player.x + Math.cos(ang) * d, 24, this.worldW - 24);
        y = Phaser.Math.Clamp(this.player.y + Math.sin(ang) * d, 24, this.worldH - 24);
      }
      if (!this.map || !MAPS.isWallAtPx(this.map, x, y)) return { x: x, y: y };
    }
    return null;                                        // dense scenery — skip this spawn
  },

  wireEvents: function () {
    var self = this;
    // Scene instances are REUSED across scene.start() and their event emitter
    // keeps old listeners (same gotcha family as TESTING.md bug #1). Without
    // this, every realm re-entry doubles the listeners — a death after N
    // realm entries was recorded N times (TESTING.md bug #2, found by the M1
    // headless suite).
    ['player-shot', 'player-ability', 'mob-hurt', 'mob-died', 'mob-evolved',
     'player-hurt', 'player-levelup', 'player-died', 'boss-hurt', 'boss-died',
     'boss-pattern'].forEach(function (e) { self.events.off(e); });
    this.events.on('player-shot', function () { AUDIO.play('shoot'); });
    this.events.on('player-ability', function () { AUDIO.play('volley'); });
    this.events.on('mob-hurt', function (mob, dmg) {
      self.damageNumber(mob.x, mob.y - 14, dmg, '#f4f4f4');
      self.hitstop(self.time.now);                        // M1: impact freeze
      AUDIO.play('hit');
    });
    // E9 v2: an evolving champion turned — sell the moment (sound + burst + tag)
    this.events.on('mob-evolved', function (mob) {
      self.burst(mob.x, mob.y, DATA.juice.levelupParticles, mob.mob.affix.tint);
      var t = self.add.text(mob.x, mob.y - 26, 'EVOLVED!', { fontFamily: 'monospace', fontSize: 13, color: '#38b764' }).setOrigin(0.5).setDepth(30);
      self.tweens.add({ targets: t, y: t.y - 20, alpha: 0, duration: 800, onComplete: function () { t.destroy(); } });
      AUDIO.play('levelup');
    });
    this.events.on('mob-died', function (mob) {
      self.player.state.kills++;
      Entities.grantXp(self, self.player, mob.mob.xp || mob.mob.def.xp);   // E9: affix bounty
      self.burst(mob.x, mob.y, DATA.juice.deathParticles, mob.mob.def.deathTint);
      AUDIO.play('die');
      // E9 v2: champion kills feed the boss chest (CHAMPION BOUNTY)
      if (mob.mob.affix) {
        self.championKills++;
        var B = DATA.affixes.championBounty;
        if (self.championKills * B.perKill <= B.cap) {
          var bt = self.add.text(mob.x, mob.y - 40, 'CHAMPION BOUNTY +' + B.perKill,
            { fontFamily: 'monospace', fontSize: 11, color: '#ffcd75' }).setOrigin(0.5).setDepth(30);
          self.tweens.add({ targets: bt, y: bt.y - 18, alpha: 0, duration: 1000, onComplete: function () { bt.destroy(); } });
        }
      }
      // M2 (F8): kill quota met → the boss portal opens (clear mode only — E6)
      if (self.mode === 'clear' && !self.bossPortal && !self.boss && !self.closing &&
          self.player.state.kills >= DATA.realm.killQuota) self.openBossPortal();
    });
    this.events.on('boss-hurt', function (boss, dmg) {
      self.damageNumber(boss.x, boss.y - 30, dmg, '#f4f4f4');
      self.hitstop(self.time.now);
      AUDIO.play('bossHit');
    });
    this.events.on('boss-pattern', function () { AUDIO.play('volley'); });
    this.events.on('boss-died', function (boss) { if (self.player.state.alive) self.onBossDown(boss); });   // E1: chest, not auto-award
    this.events.on('player-hurt', function (dmg) {
      self.cameras.main.shake(90, 0.006);
      self.damageNumber(self.player.x, self.player.y - 20, dmg, '#b13e53');
      AUDIO.play('hurt');
    });
    this.events.on('player-levelup', function (level) {
      ACCOUNT.records.bestLevel = Math.max(ACCOUNT.records.bestLevel, level);
      CURRENT.level = self.player.state.level; CURRENT.xp = self.player.state.xp;
      persist();                                          // a level is a permanent gain (Pillar 3)
      var t = self.add.text(self.player.x, self.player.y - 34, 'LEVEL ' + level + '!', { fontFamily: 'monospace', fontSize: 16, color: '#ffcd75' }).setOrigin(0.5).setDepth(30);
      self.tweens.add({ targets: t, y: t.y - 26, alpha: 0, duration: 900, onComplete: function () { t.destroy(); } });
      self.burst(self.player.x, self.player.y, DATA.juice.levelupParticles, 0xffcd75);
      AUDIO.play('levelup');
    });
    this.events.on('player-died', function (killer) { self.onDeath(killer); });
  },

  damageNumber: function (x, y, dmg, color) {
    var t = this.add.text(x, y, String(dmg), { fontFamily: 'monospace', fontSize: 13, color: color }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: DATA.ui.dmgNumberMs, onComplete: function () { t.destroy(); } });
  },

  burst: function (x, y, n, tint) {
    for (var i = 0; i < n; i++) {
      var p = this.add.image(x, y, 'px').setDepth(9).setTint(tint || 0xffcd75);
      var a = Math.random() * Math.PI * 2, d = 10 + Math.random() * 26;
      this.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, duration: 300 + Math.random() * 200, onComplete: function (tw, targets) { targets[0].destroy(); } });
    }
  },

  // E4 (M2.1): HUD OVERHAUL — Diablo-style HP/MP resource orbs flanking a
  // central action bar (ability slot + XP strip). Presentation only: it READS
  // player state, never writes it (seam rule 3). Redrawn each frame so RESIZE
  // fullscreen re-anchors it for free.
  buildHud: function () {
    var T = { fontFamily: 'monospace', color: '#f4f4f4' };
    this.hudG = this.add.graphics().setScrollFactor(0).setDepth(50);
    // HUD numeric readouts (HP · MP · XP) are BLACK (user, 2026-07-12) — reads
    // on the bright orbs / gold XP fill.
    this.hpOrbText = this.add.text(0, 0, '', { fontFamily: T.fontFamily, fontSize: 13, color: '#000000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(52);
    this.mpOrbText = this.add.text(0, 0, '', { fontFamily: T.fontFamily, fontSize: 13, color: '#000000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(52);
    // XP bar readout (user, 2026-07-12): the old action box is GONE — a single
    // segmented XP bar spans the bottom between the orbs, this text = XP/needed.
    this.xpText = this.add.text(0, 0, '', { fontFamily: T.fontFamily, fontSize: 12, color: '#000000', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(52);
    this.hudText = this.add.text(12, 12, '', { fontFamily: T.fontFamily, fontSize: 12, color: '#f4f4f4' }).setScrollFactor(0).setDepth(51);
    // M3.5: slotted map affixes ride under the objective line — visibly part
    // of the run, even while they're preview-only (inert until M5).
    if (this.mapAffixes.length) {
      this.affixText = this.add.text(12, 30,
        'AFFIXES: ' + this.mapAffixes.map(function (k) { return DATA.affixes.map[k].name; }).join(' · ') +
        (DATA.console.live ? '' : '  (preview — not yet active)'),
        { fontFamily: T.fontFamily, fontSize: 10, color: '#ffcd75' }).setScrollFactor(0).setDepth(51);
    } else { this.affixText = null; }
    this.debugText = this.add.text(12, this.mapAffixes.length ? 46 : 34, '', { fontFamily: T.fontFamily, fontSize: 11, color: '#38b764' }).setScrollFactor(0).setDepth(51).setVisible(false);
    // auto-fire is dispatched as a rebindable action now (see BINDS.wire in
    // create); F3 debug stays a fixed dev key.
    this.rig.keys.F3.on('down', function () { this.debugText.setVisible(!this.debugText.visible); }, this);
  },

  // One resource orb: dark glass backing, "liquid" fill (a circle segment up to
  // the fill line), glass shine, rim.
  drawOrb: function (g, cx, cy, r, pct, color) {
    var HUD = DATA.ui.hud;
    g.fillStyle(HUD.glass, 0.94); g.fillCircle(cx, cy, r + 4);
    pct = Math.max(0, Math.min(1, pct));
    if (pct > 0.999) {
      g.fillStyle(color, 1); g.fillCircle(cx, cy, r);
    } else if (pct > 0.001) {
      var t = Math.asin(1 - 2 * pct);                    // chord angle of the fill line
      g.fillStyle(color, 1);
      g.beginPath();
      g.arc(cx, cy, r, t, Math.PI - t, false);           // sweep through the bottom
      g.closePath();
      g.fillPath();
    }
    g.fillStyle(0xffffff, 0.10); g.fillEllipse(cx - r * 0.26, cy - r * 0.4, r * 0.75, r * 0.42);
    g.lineStyle(3, 0x566c86, 1); g.strokeCircle(cx, cy, r + 4);
  },

  updateHud: function () {
    var st = this.player.state, HUD = DATA.ui.hud;
    var W = this.scale.width, H = this.scale.height;
    var g = this.hudG; g.clear();
    var r = HUD.orbRadius, m = HUD.orbMargin;
    var hpX = m + r + 4,       orbY = H - m - r - 4;
    var mpX = W - m - r - 4;
    this.drawOrb(g, hpX, orbY, r, st.hp / st.stats.hp, HUD.hpColor);   // life orb
    this.drawOrb(g, mpX, orbY, r, st.mp / st.stats.mp, HUD.mpColor);   // mana orb
    this.hpOrbText.setPosition(hpX, orbY).setText(String(Math.max(0, Math.ceil(st.hp))));
    this.mpOrbText.setPosition(mpX, orbY).setText(String(Math.floor(st.mp)));

    // XP bar (user redesign, 2026-07-12): the ONLY bottom element — spans the
    // gap between the two orbs, split into 5 equal segments by blue dividers,
    // gold fill for progress, XP-into-level / needed centered on it.
    var bh = 16;
    var bx = hpX + r + 12, bxR = mpX - r - 12, bw = Math.max(40, bxR - bx);
    var by = H - bh - 6;
    var maxed = st.level >= DATA.xp.cap;
    var need = DATA.xp.needed(st.level);
    var xpPct = maxed ? 1 : Math.max(0, Math.min(1, st.xp / need));
    g.fillStyle(HUD.glass, 0.92); g.fillRect(bx, by, bw, bh);           // dark track
    g.fillStyle(0xffcd75, 1); g.fillRect(bx, by, bw * xpPct, bh);       // gold fill
    // 5 segments = 4 interior blue dividers
    g.fillStyle(0x41a6f6, 1);
    for (var s5 = 1; s5 < 5; s5++) { g.fillRect(bx + Math.round(bw * s5 / 5) - 1, by, 2, bh); }
    g.lineStyle(2, 0x41a6f6, 1); g.strokeRect(bx, by, bw, bh);          // blue border
    this.xpText.setPosition(bx + bw / 2, by + bh / 2)
      .setText(maxed ? 'MAX' : (Math.floor(st.xp) + ' / ' + need));

    // objective line, top-left (mode-aware — E6)
    var tSec = Math.floor((this.time.now - this.startedAt) / 1000);
    var clock = Math.floor(tSec / 60) + ':' + ('0' + tSec % 60).slice(-2);
    var objTxt;
    if (this.mode === 'survival') {
      var left = Math.max(0, this.modeDef.durationSec - tSec);
      objTxt = 'SURVIVE ' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) +
               ' · Kills ' + st.kills;
    } else {
      objTxt = (this.boss ? 'BOSS FIGHT' :
               (this.bossPortal ? 'Kills ' + st.kills + ' · PORTAL OPEN' :
                'Kills ' + st.kills + '/' + DATA.realm.killQuota)) + ' · Realm ' + clock;
    }
    this.hudText.setText(objTxt);
    if (this.boss && this.bossBar) {
      this.bossBar.width = Math.max(0, 318 * this.boss.boss.hp / this.boss.boss.maxHp);
    }
    if (this.debugText.visible) {
      this.debugText.setText('fps ' + Math.round(this.game.loop.actualFps) +
        ' | mobs ' + this.mobs.countActive(true) +
        ' | pShots ' + this.playerShots.countActive(true) +
        ' | eShots ' + this.enemyShots.countActive(true));
    }
  },

  onDeath: function (killer) {
    var st = this.player.state;
    ACCOUNT.graveyard.push({ cls: st.cls, level: st.level, kills: st.kills, killer: killer });
    ACCOUNT.records.deaths++;
    ACCOUNT.records.totalKills += st.kills;
    // Permadeath (Q1): reset the SAVED character immediately, so closing the
    // tab on the death screen can't resurrect them.
    GAME_SAVE.character = freshCharacter();
    CURRENT = GAME_SAVE.character;
    persist();
    // M1 upgraded recap: cause of death, time survived, kills + account context.
    if (this.paused) this.resumeGame();                   // death screen owns the end
    AUDIO.play('death');
    var tSec = Math.floor((this.time.now - this.startedAt) / 1000);
    var mmss = Math.floor(tSec / 60) + ':' + ('0' + tSec % 60).slice(-2);
    this.player.setTint(0x555555);
    if (this.player.held) this.player.held.setVisible(false);   // E8: drop the bow
    if (this.promptText) { this.promptText.destroy(); this.promptText = null; }
    var cam = this.cameras.main;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    this.add.rectangle(cx, cy, W, H, 0x000000, 0.72).setScrollFactor(0).setDepth(90);
    this.add.text(cx, cy - 130,
      'YOU DIED', { fontFamily: 'monospace', fontSize: 42, color: '#b13e53' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy - 84,
      'Level ' + st.level + ' ' + DATA.classes[st.cls].name + ' · slain by ' + killer,
      { fontFamily: 'monospace', fontSize: 16, color: '#f4f4f4' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy - 20,
      'THIS RUN\nkills ' + st.kills + '   ·   survived ' + mmss + '   ·   reached level ' + st.level,
      { fontFamily: 'monospace', fontSize: 14, color: '#94b0c2', align: 'center' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy + 38,
      'THE ACCOUNT (always moves forward)\ndeaths ' + ACCOUNT.records.deaths + '   ·   best level ' + ACCOUNT.records.bestLevel +
      '   ·   total kills ' + ACCOUNT.records.totalKills + '   ·   graveyard ' + ACCOUNT.graveyard.length,
      { fontFamily: 'monospace', fontSize: 14, color: '#94b0c2', align: 'center' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy + 96,
      'Death is permanent (Fusion Law F4 / Q1). A new ' + DATA.classes[freshCharacter().cls].name + ' awaits in the Nexus.',
      { fontFamily: 'monospace', fontSize: 13, color: '#f4f4f4' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    this.add.text(cx, cy + 140, '[ ENTER or CLICK to return ]', { fontFamily: 'monospace', fontSize: 14, color: '#ffcd75' }).setScrollFactor(0).setOrigin(0.5).setDepth(91);
    var self = this, back = function () { self.scene.start('Nexus', { entry: 'realm' }); };
    this.rig.keys.ENTER.once('down', back);
    this.input.once('pointerdown', back);
    cam.shake(220, 0.012);
  },

  // Q6 (M2.1): contextual SPACE — returns the registered interactable in range,
  // and manages the floating prompt. Chests (E1) register here.
  handleInteract: function (intent) {
    var near = null, p = this.player, R = DATA.interact.range;
    for (var i = 0; i < this.interactables.length; i++) {
      var it = this.interactables[i];
      if (Math.hypot(it.x - p.x, it.y - p.y) <= R) { near = it; break; }
    }
    if (near) {
      intent.ability = false;                             // interact wins inside range (Q6)
      if (!this.promptText) {
        this.promptText = this.add.text(near.x, near.y - 34, near.prompt,
          { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(60);
      }
      if (this.rig.interactJustDown()) near.action();
    } else if (this.promptText) {
      this.promptText.destroy(); this.promptText = null;
    }
  },

  update: function (time, delta) {
    if (this.paused || this.closing) return;              // M1 pause / M2 realm-closed screen
    if (this.scanning || this.looting) return;            // M2.1: scouter scan / loot overlay hold the world
    if (this.player.state.alive) {
      var intent = this.rig.collect(this.player, SAVE.settings().autoFire);
      this.handleInteract(intent);                        // Q6: may consume SPACE
      Entities.updatePlayer(this, this.player, intent, time, delta);
      // mirror progress into the bound save object (written to disk on
      // level-up, death, and nexus arrival — not every frame)
      CURRENT.level = this.player.state.level; CURRENT.xp = this.player.state.xp;
      // E6: time-trial objective — survive to the horn
      if (this.mode === 'survival' && !this.pendingLoot &&
          time - this.startedAt >= this.modeDef.durationSec * 1000) this.survivalComplete();
    }
    var self = this;
    this.mobs.children.iterate(function (m) { if (m && m.active) Entities.updateMob(self, m, self.player, time); });
    if (this.boss && this.boss.active && this.player.state.alive) Entities.updateBoss(this, this.boss, this.player, time);
    Entities.updateProjectiles(this, this.playerShots, time);
    Entities.updateProjectiles(this, this.enemyShots, time);
    this.updateHud();
  }
});
