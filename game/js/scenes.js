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

// v5 (2026-07-17): BEATING THE GAME. The first Titan Whale clear grants the
// class's full T5 LEGENDARY SET to the vault/collection (NO auto-equip — Red),
// flips ACCOUNT.beaten (post-campaign), and marks the endgame cutscenes seen.
function grantLegendarySet(cls) {
  if (!GAME_SAVE || !ACCOUNT || typeof DATA === 'undefined') return;
  var g = (DATA.classGear && DATA.classGear[cls]) || (DATA.classGear && DATA.classGear.ranger);
  if (!g) return;
  var keys = [g.weapon[5], g.ability[5], 'ar5', 'r5'];
  keys.forEach(function (k) {
    if (!DATA.items[k]) return;
    if (typeof collectItem === 'function') collectItem(k);
    if (Array.isArray(ACCOUNT.collected) && ACCOUNT.collected.indexOf(k) < 0) ACCOUNT.collected.push(k);
    if (Array.isArray(GAME_SAVE.vault) && GAME_SAVE.vault.indexOf(k) < 0 && DATA.vault && GAME_SAVE.vault.length < DATA.vault.slots) GAME_SAVE.vault.push(k);
  });
}
function beatTheGame(cls) {
  if (!ACCOUNT) return;
  ACCOUNT.beaten = true;
  if (ACCOUNT.cutscenesSeen) { ACCOUNT.cutscenesSeen.cs2 = true; ACCOUNT.cutscenesSeen.cs3 = true; ACCOUNT.cutscenesSeen.cs4 = true; }
  if (Array.isArray(ACCOUNT.cleared) && ACCOUNT.cleared.indexOf('belly') < 0) ACCOUNT.cleared.push('belly');
  // v5: beating the game UNLOCKS the NINJA (locked class) for character select.
  if (Array.isArray(ACCOUNT.unlockedClasses) && typeof DATA !== 'undefined') {
    for (var lc in DATA.classes) { if (DATA.classes[lc].locked && ACCOUNT.unlockedClasses.indexOf(lc) < 0) ACCOUNT.unlockedClasses.push(lc); }
  }
  // beating the game AS the ninja earns its LEGENDARY EMPOWERMENT (SHADOW CLONE).
  if (cls === 'ninja') ACCOUNT.ninjaEmpowered = true;
  // DEVICE-level unlock so the ninja is pickable at NEW GAME on any slot.
  try { SAVE.settings().ninjaUnlocked = true; SAVE.saveSettings(); } catch (e) {}
  grantLegendarySet(cls);
  try { if (typeof ACH !== 'undefined') ACH.check(); } catch (e) {}   // item 6: unlock any freshly-earned achievements
  try { persist(); } catch (e) {}
}

// ---- M5.3 DEV MODE (user): a Settings toggle that grants ALL GEAR + MAX
// LEVEL + IMMORTALITY, for testing gear/kits. The flag lives in device
// settings (SAVE.settings().dev) so immortality reads live everywhere;
// applyDevMode() applies the one-time save grants (max level + fill the vault
// with this hero's full ladder) and refreshes a live realm player if there is
// one. Immortality itself is enforced in Entities.hurtPlayer + trainKill.
// v5 (2026-07-17): DEV MODE REMOVED at Red's request. devOn() is hard-false so a
// stale settings.dev flag can never keep immortality/grants on. applyDevMode() is
// left defined (harmless, no longer called from the Settings menu).
function devOn() { return false; }
function applyDevMode() {
  if (!GAME_SAVE || !CURRENT) return;
  // MAX LEVEL
  CURRENT.level = DATA.xp.cap; CURRENT.xp = 0;
  // ALL GEAR — the class weapon + ability ladder (T0–T5) + every armor + ring,
  // banked in the vault (exactly DATA.vault.slots = 24). Keep any off-class
  // items already stored (append; the vault UI scrolls).
  var line = DATA.classGear[CURRENT.cls] || DATA.classGear.ranger, gear = [];
  line.weapon.forEach(function (k) { gear.push(k); });
  line.ability.forEach(function (k) { gear.push(k); });
  for (var t = 0; t <= 5; t++) { gear.push('ar' + t); gear.push('r' + t); }
  var offClass = (GAME_SAVE.vault || []).filter(function (k) {
    var it = DATA.items[k]; return it && it.cls && it.cls !== CURRENT.cls;
  });
  GAME_SAVE.vault = gear.concat(offClass);
  gear.forEach(function (k) { collectItem(k); });          // M5.5: dev gear is owned (no re-drop)
  persist();
  // refresh a live realm hero (max level now; immortality is read live)
  var realm = game.scene.getScene('Realm');
  if (realm && realm.scene.isActive() && realm.player && realm.player.state) {
    var st = realm.player.state;
    st.level = CURRENT.level;
    st.stats = SIM.statsFor(DATA.classes[st.cls], st.level, CURRENT.potionsDrunk, CURRENT.equipment);
    st.hp = st.stats.hp; st.mp = st.stats.mp;
  }
}
function freshCharacter(cls) {
  cls = (DATA.classes[cls]) ? cls : 'ranger';             // M4: keep the slot's class on death
  return { cls: cls, level: 1, xp: 0, potionsDrunk: SAVE.zeroPots(),
           equipment: SAVE.emptyEquip() };               // M3: gear dies with the character
}

// ---- M5.5 COLLECTION (user): items are OWNED once (account.collected). Gear
// AUTO-UPGRADES from the collection when you find better, and REMAINS across
// death (a fresh hero auto-fills empty slots from the best owned gear).
function collectItem(key) {
  if (!ACCOUNT || !DATA.items[key]) return;
  if (!ACCOUNT.collected) ACCOUNT.collected = [];
  if (ACCOUNT.collected.indexOf(key) < 0) ACCOUNT.collected.push(key);
}
// upgrade=false: only FILL EMPTY slots (realm entry — gear "remains", but a
// manual downgrade for testing is never yanked back up). upgrade=true: also
// replace a weaker piece with a better owned one (chest pickup — auto-upgrade).
function autoEquipFromCollection(upgrade) {
  if (!GAME_SAVE || !CURRENT) return false;
  var coll = (ACCOUNT && ACCOUNT.collected) || [], changed = false;
  DATA.equipSlots.forEach(function (slot) {
    var best = SIM.bestCollected(coll, CURRENT.cls, slot);
    if (!best) return;
    var cur = CURRENT.equipment[slot];
    if (!cur) { CURRENT.equipment[slot] = best; changed = true; }
    else if (upgrade && DATA.items[best].tier > DATA.items[cur].tier) { CURRENT.equipment[slot] = best; changed = true; }
  });
  if (changed) persist();
  return changed;
}

// M6c (Red) BALANCE TESTING: force the WHITE (tier-1 COMMON) class-legal set
// into every slot on realm entry — independent of the collection, so it
// survives death and is never bumped up to legendary. Falls back to the lowest
// tier if a slot has no T1. OFF by default; Settings › "White-gear test".
function equipWhiteSet() {
  if (!GAME_SAVE || !CURRENT) return;
  DATA.equipSlots.forEach(function (slot) {
    var pick = null, pt = 999;
    for (var k in DATA.items) {
      var it = DATA.items[k];
      if (it.slot !== slot || (it.cls && it.cls !== CURRENT.cls)) continue;
      var score = it.tier === 1 ? -1 : it.tier;      // WHITE first, else lowest
      if (score < pt) { pt = score; pick = k; }
    }
    if (pick) { CURRENT.equipment[slot] = pick; collectItem(pick); }
  });
  persist();
}

// M5.5: split rolled loot into NEW items (not yet owned) and DUPLICATES
// (already owned → BONUS XP by rarity). Dedup is against the PERSISTENT
// collection only (intra-chest repeats stay, so drop-table roll counts are
// unchanged for a fresh account). Does not mutate the collection.
function resolveLootRolls(keys) {
  var owned = (ACCOUNT && ACCOUNT.collected) || [];
  var items = [], dupeXp = 0, dupes = [];
  (keys || []).forEach(function (k) {
    var it = DATA.items[k]; if (!it) return;
    if (owned.indexOf(k) >= 0) {
      var bx = (DATA.collection && DATA.collection.dupeXp[it.tier]) || 0;
      dupeXp += bx; dupes.push({ key: k, xp: bx });
    } else items.push(k);
  });
  return { items: items, dupeXp: dupeXp, dupes: dupes };
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
// M4.6: labels lead with the RARITY word (user's ladder: ABUNDANT → COMMON →
// UNCOMMON → RARE → EPIC → LEGENDARY), tinted by the tier color at draw time.
function itemLabel(key) { var it = DATA.items[key]; return DATA.tiers[it.tier].rarity + ' · ' + it.name; }

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
    this.classPicking = false; this.classUi = null;   // M4: class-select overlay state (reset on re-entry)
    // AUDIT FIX 2026-07-14: a spawned-but-unentered portal must NOT outlive a
    // trip to the load screen — it leaked ACROSS SAVE SLOTS (spawn in slot 1,
    // exit, load slot 2 → slot 2's chamber materializes slot 1's configured
    // portal). The title screen is the slot boundary: clear it here.
    this.registry.remove('pendingPortal');
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
    this.input.keyboard.on('keydown-ONE', function () { if (!self.classPicking) self.chooseSlot(1); });
    this.input.keyboard.on('keydown-TWO', function () { if (!self.classPicking) self.chooseSlot(2); });
    this.input.keyboard.on('keydown-THREE', function () { if (!self.classPicking) self.chooseSlot(3); });

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
    if (this.starting || this.classPicking) return;
    var r = SAVE.load(slot);
    if (r.ok) { this.enterSlot(slot, r.data); return; }
    if (r.reason === 'corrupt') return;                    // must delete first
    this.promptClass(slot);                                // M4: empty slot → choose a class first
  },

  // M4: the class-select overlay shown when starting a NEW GAME in an empty
  // slot. One card per class (data-driven from DATA.classes — a new class adds
  // a card, no code); click a card or press its number to pick; ESC cancels.
  promptClass: function (slot) {
    if (this.classPicking) return;
    this.classPicking = true;
    var self = this, W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.78).setDepth(80).setInteractive());
    ui.push(this.add.text(cx, cy - 150, 'CHOOSE YOUR CLASS', { fontFamily: 'monospace', fontSize: 30, color: '#ffcd75', fontStyle: 'bold' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 116, 'SLOT ' + slot + ' — new game · this slot keeps its class through permadeath', { fontFamily: 'monospace', fontSize: 12, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));
    // v5: the NINJA (locked) only appears once the game has been beaten (device flag).
    var ninjaUnlocked = false; try { ninjaUnlocked = !!SAVE.settings().ninjaUnlocked; } catch (e) {}
    var keys = Object.keys(DATA.classes).filter(function (k) { return !DATA.classes[k].locked || ninjaUnlocked; }), n = keys.length;
    // adaptive card width so 3+ class cards still fit the min 960-wide screen
    var gap = 24, cardW = Math.min(300, Math.floor((W - 40 - (n - 1) * gap) / n));
    var totalW = n * cardW + (n - 1) * gap, x0 = cx - totalW / 2 + cardW / 2;
    keys.forEach(function (key, i) {
      var cls = DATA.classes[key], ccx = x0 + i * (cardW + gap), ccy = cy + 6;
      var accent = cls.accent || 0x38b764;          // per-class accent (data-driven)
      var card = self.add.rectangle(ccx, ccy, cardW, 190, 0x1a1c2c, 0.96).setStrokeStyle(2, accent).setDepth(81).setInteractive({ useHandCursor: true });
      ui.push(card);
      // HI-FI DEFAULT (2026-07-14): every class card previews its hi-fi
      // animated model (Ranger 64 / Starweaver / Dark Knight). Classic sprite
      // only if the art module failed to load.
      var rd = (typeof TEX !== 'undefined' && TEX.playerModel) ? TEX.playerModel(key) : null;
      if (rd && self.textures.exists(rd.key)) {
        var rsp = self.add.sprite(ccx, ccy - 54, rd.key, 'idle0').setScale(54 / rd.size).setDepth(82);
        try { rsp.play(rd.idle); } catch (e) {}
        ui.push(rsp);
      } else {
        ui.push(self.add.sprite(ccx, ccy - 54, cls.texture || 'ranger').setScale(3.4).setDepth(82));
      }
      if (cls.weapon && DATA.weapons[cls.weapon] && DATA.weapons[cls.weapon].heldTexture) {
        var hw = DATA.weapons[cls.weapon];
        if (rd && rd.bowKey && self.textures.exists(rd.bowKey)) {
          // hi-fi Ranger card: the lead ARM out to the side (aim right) with the
          // bow held UPRIGHT at its hand — matches the in-game hold.
          var cd = 54, sc = cd / rd.size;
          var shX = ccx + (rd.shoulder.x - 0.5) * cd, shY = (ccy - 54) + (rd.shoulder.y - 0.5) * cd;
          if (self.textures.exists(rd.armKey))
            ui.push(self.add.sprite(shX, shY, rd.armKey).setScale(sc).setOrigin(rd.armPivotX, 0.5).setDepth(83));
          ui.push(self.add.sprite(shX + rd.armLenTex * sc, shY, rd.bowKey).setScale(sc).setOrigin(rd.bowGrip.x, rd.bowGrip.y).setDepth(84));
        } else if (rd && rd.heldKey && self.textures.exists(rd.heldKey)) {
          // hi-fi Wizard/Knight card: the hi-fi weapon beside the model (staff
          // stands upright like the in-game carry; sword rests at a ready angle).
          var wsc = (54 / rd.size) * (rd.heldScale || 1) * 1.2;
          ui.push(self.add.sprite(ccx + 26, ccy - 54, rd.heldKey).setScale(wsc).setDepth(84)
            .setRotation(hw.upright ? -Math.PI / 2 : -Math.PI / 5));
        } else {
          ui.push(self.add.sprite(ccx + 26, ccy - 54, hw.heldTexture).setScale(2.2).setDepth(82)
            .setRotation(hw.upright ? -Math.PI / 2 : 0));   // walking staffs stand up on the card too
        }
      }
      ui.push(self.add.text(ccx, ccy + 6, (i + 1) + '.  ' + cls.name.toUpperCase(), { fontFamily: 'monospace', fontSize: 18, color: '#f4f4f4', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82));
      ui.push(self.add.text(ccx, ccy + 44, cls.blurb || '', { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2', align: 'center', wordWrap: { width: cardW - 30 } }).setOrigin(0.5).setDepth(82));
      ui.push(self.add.text(ccx, ccy + 82, 'SELECT ▶', { fontFamily: 'monospace', fontSize: 13, color: '#38b764' }).setOrigin(0.5).setDepth(82));
      card.on('pointerover', function () { card.setFillStyle(0x29366f, 0.96); });
      card.on('pointerout', function () { card.setFillStyle(0x1a1c2c, 0.96); });
      card.on('pointerdown', function () { self.pickClass(slot, key); });
    });
    var numHint = keys.map(function (_, i) { return i + 1; }).join(' / ');
    ui.push(this.add.text(cx, cy + 150, 'press ' + numHint + ' · or ESC to go back', { fontFamily: 'monospace', fontSize: 12, color: '#566c86' }).setOrigin(0.5).setDepth(81));
    this.classUi = ui;
    // number keys pick the class; ESC cancels
    this._classKeys = function (e) {
      if (!self.classPicking) return;
      if (e.code === 'Escape') { self.closeClassPick(); return; }
      var idx = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[e.code];
      if (idx != null && keys[idx]) self.pickClass(slot, keys[idx]);
    };
    this.input.keyboard.on('keydown', this._classKeys);
  },

  closeClassPick: function () {
    if (this._classKeys) { this.input.keyboard.off('keydown', this._classKeys); this._classKeys = null; }
    if (this.classUi) { this.classUi.forEach(function (o) { o.destroy(); }); this.classUi = null; }
    this.classPicking = false;
  },

  // Commit a class choice → create the save and enter the slot.
  pickClass: function (slot, cls) {
    if (!this.classPicking) return;
    this.closeClassPick();
    this.createNewGame(slot, cls, true);                 // v5: real new game → play the intro cutscenes
  },

  // Create a fresh account in `slot` with the chosen class, then enter it.
  // (Also the headless-test entry point for a new game of a given class.)
  createNewGame: function (slot, cls, withIntro) {
    var data = SAVE.blank(cls);
    SAVE.save(slot, data);
    // v5: the intro cutscenes (CS0→CS1) fire only from the real title button
    // (withIntro). Headless suites call createNewGame(slot,cls) and land straight
    // in the Chamber — the intro path is verified separately in m23.
    this.enterSlot(slot, data, !!withIntro);
  },

  enterSlot: function (slot, data, fresh) {
    if (this.starting) return;
    bindSave(slot, data);
    this.starting = true;
    AUDIO.play('ui');
    this.cameras.main.fadeOut(350);
    var self = this, cls = data.character.cls;
    // v5 (2026-07-17): a BRAND-NEW slot opens on the story — CS0 THE PREAMBLE →
    // CS1 COLD BOOT (the virus-attack backstory, item 2) → then the Chamber.
    var playIntro = fresh && typeof CutsceneScene !== 'undefined' &&
      ACCOUNT.cutscenesSeen && !ACCOUNT.cutscenesSeen.cs0;
    this.time.delayedCall(400, function () {
      if (playIntro) {
        ACCOUNT.cutscenesSeen.cs0 = true; ACCOUNT.cutscenesSeen.cs1 = true; persist();
        self.scene.start('Cutscene', { id: 'cs0', cls: cls, next:
          { scene: 'Cutscene', data: { id: 'cs1', cls: cls, next: { scene: 'Nexus', data: { entry: 'login' } } } } });
      } else {
        self.scene.start('Nexus', { entry: 'login' });   // M3.8: records screen types itself out
      }
    });
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
  var keys = K.addKeys('W,A,S,D,SPACE,F3,ENTER,UP,LEFT,DOWN,RIGHT');   // (dead 'T' auto-fire key removed — it's a Settings checkbox now)
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
    // item 6: evaluate achievements on every hub arrival (catches clears, kills,
    // deaths, discoveries earned during the last run) and toast any fresh ones.
    try {
      if (typeof ACH !== 'undefined') {
        var _fresh = ACH.check();
        if (_fresh && _fresh.length) this.time.delayedCall(500, this.achToast.bind(this, _fresh));
      }
    } catch (e) {}
    // RESIZE mode: the nexus safe room IS the screen, whatever size it is
    // (DATA.nexus.w/h is the windowed minimum).
    var W = Math.max(DATA.nexus.w, this.scale.width), H = Math.max(DATA.nexus.h, this.scale.height);
    this.physics.world.setBounds(0, 0, W, H);
    // ART TEST: hi-fi chamber tiles when Hi-Fi World is on (else classic).
    this.add.tileSprite(W / 2, H / 2, W, H, TEX.nexusKey('floor_nexus'));
    this.cameras.main.setBounds(0, 0, W, H).setBackgroundColor('#0f0f1b');

    // walls (visual + physical)
    var walls = this.physics.add.staticGroup();
    var wallKey = TEX.nexusKey('wall'), wallScl = TEX.nexusScale('wall', 2);
    for (var x = 8; x < W; x += 32) { walls.create(x, 8, wallKey).setScale(wallScl).refreshBody(); walls.create(x, H - 8, wallKey).setScale(wallScl).refreshBody(); }
    for (var y = 8; y < H; y += 32) { walls.create(8, y, wallKey).setScale(wallScl).refreshBody(); walls.create(W - 8, y, wallKey).setScale(wallScl).refreshBody(); }

    // M3.5: THE PORTAL WORKS — one platform at the heart of the nexus,
    // hard-wired to the REALM CONSOLE by an energy conduit. The console
    // powers the platform; future realms live inside the console UI.
    this.buildPortalWorks(W, H);
    wireFullscreen(this);

    // M3: THE VAULT — 8 account slots that survive death (the whole point).
    // Click the chest or press V to open the swap UI.
    // M3.6 polish (user, 2026-07-12): station labels are GREEN, ABOVE their
    // object, and minimal — no counters, no headers.
    var vc = this.add.sprite(120, H / 2 - 60, TEX.nexusKey('chest')).setScale(TEX.nexusScale('chest', 2.5)).setInteractive({ useHandCursor: true });
    var vl = this.add.text(120, H / 2 - 100, 'VAULT (' + BINDS.keyLabel('vault') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5).setDepth(7);
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
    var bst = this.add.sprite(W - 120, H / 2 - 60, TEX.nexusKey('bestiary')).setScale(TEX.nexusScale('bestiary', 3)).setDepth(3)
      .setInteractive({ useHandCursor: true });
    this.bestiarySprite = bst;
    this.tweens.add({ targets: bst, alpha: 0.78, yoyo: true, repeat: -1, duration: 1400 });
    var bl = this.add.text(W - 120, H / 2 - 100, 'BESTIARY (' + BINDS.keyLabel('bestiary') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5).setDepth(7);
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
    var rs = this.add.sprite(W / 2, 92, TEX.nexusKey('wallscreen')).setScale(TEX.nexusScale('wallscreen', 3)).setDepth(2)
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
    var lever = this.add.sprite(swX, swY, TEX.nexusKey(this.recordsMode === 'records' ? 'lever_up' : 'lever_down'))
      .setScale(TEX.nexusScale('lever_up', 3)).setDepth(2).setInteractive({ useHandCursor: true });
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
      this.add.sprite(wx, swY, TEX.nexusKey('conduit')).setScale(TEX.nexusScale('conduit', 1.4)).setDepth(1).setAngle(90).setAlpha(0.9);
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
    // M7k: while a SEARCH BAR is capturing (portal machine / bestiary open),
    // letter keys type into it instead of jumping stations — the capture
    // handler owns ESC (close) itself.
    BINDS.wire(this, {
      vault:       function () { if (!esc._menuOpen && !esc._typing) esc.requestStation('vault'); },
      bestiary:    function () { if (!esc._menuOpen && !esc._typing) esc.requestStation('bestiary'); },
      recordsUp:   function () { if (!esc._menuOpen && !esc._typing) esc.requestStation('switchRecords'); },
      recordsDown: function () { if (!esc._menuOpen && !esc._typing) esc.requestStation('switchGrave'); },
      portal:      function () { if (!esc._menuOpen && !esc._typing) esc.requestStation('machine'); },
      menu:        function () { if (!esc._typing) esc.onMenuKey(); }
    });

    // M3 (Lane C): the MAP BUILDER — a developer tool on a FIXED dev key (M,
    // deliberately not remappable), reached from the nexus (not the player
    // flow) so a save slot is always bound for playtests.
    this.input.keyboard.on('keydown-M', function () {
      if (esc._menuOpen || esc._typing) return;          // M7k: 'm' may be search input
      persist();
      AUDIO.stopMusic();                                 // M3.9
      esc.scene.start('Builder');
    });

    // M5.3: the 24-slot vault scrolls (Up/Down + mouse wheel) while it's open.
    this.input.keyboard.on('keydown-UP', function () { if (esc.vaultUi) esc.scrollVault(-1); });
    this.input.keyboard.on('keydown-DOWN', function () { if (esc.vaultUi) esc.scrollVault(1); });
    this.input.on('wheel', function (ptr, over, dx, dy) {
      if (esc.vaultUi) esc.scrollVault(dy > 0 ? 1 : -1);
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
  // item 6: a brief gold banner when new achievements unlock on hub arrival.
  // Stacks vertically; each card fades itself out. Fully self-contained + safe.
  achToast: function (fresh) {
    if (!fresh || !fresh.length || !this.scene || !this.scene.isActive()) return;
    var self = this, sw = this.scale.width;
    for (var i = 0; i < fresh.length; i++) {
      (function (a, k) {
        var y = 70 + k * 44;
        var bg = self.add.rectangle(sw / 2, y, 360, 38, 0x14162b, 0.96)
          .setScrollFactor(0).setDepth(240).setStrokeStyle(2, 0xffd479, 0.9);
        var t1 = self.add.text(sw / 2 - 150, y - 8, (a.glyph || '★') + '  ACHIEVEMENT UNLOCKED',
          { fontFamily: 'monospace', fontSize: 12, color: '#ffd479' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(241);
        var t2 = self.add.text(sw / 2 - 150, y + 8, a.name,
          { fontFamily: 'monospace', fontSize: 14, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(241);
        try { AUDIO.play('ui'); } catch (e) {}
        self.tweens.add({ targets: [bg, t1, t2], alpha: 0, delay: 2600 + k * 300, duration: 700,
          onComplete: function () { try { bg.destroy(); t1.destroy(); t2.destroy(); } catch (e) {} } });
      })(fresh[i], i);
    }
  },

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
    this.add.sprite(cx, platY, TEX.nexusKey('platform')).setScale(TEX.nexusScale('platform', 2.4)).setDepth(2);
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
      this.add.sprite(cx, y, TEX.nexusKey('conduit')).setScale(TEX.nexusScale('conduit', 2)).setDepth(2).setAlpha(0.9);
    }

    // CONSOLE — the terminal that drives it all; its screen spills blue light
    var spill = this.add.sprite(cx, conY - 6, 'softglow').setScale(1.1)
      .setTint(0x41a6f6).setAlpha(0.3).setDepth(1);
    this.tweens.add({ targets: spill, alpha: 0.16, yoyo: true, repeat: -1, duration: 1200 });
    this.consolePos = { x: cx, y: conY };
    var c = this.add.sprite(cx, conY, TEX.nexusKey('console')).setScale(TEX.nexusScale('console', 3)).setDepth(3).setInteractive({ useHandCursor: true });
    this.consoleSprite = c;
    this.tweens.add({ targets: c, alpha: 0.75, yoyo: true, repeat: -1, duration: 1200 });   // dormant heartbeat
    var cl = this.add.text(cx, conY + 36, DATA.console.name + ' (' + BINDS.keyLabel('portal') + ')',
      { fontFamily: 'monospace', fontSize: 11, color: '#49e83b' }).setOrigin(0.5).setDepth(7);
    cl.setShadow(1, 2, '#1a1c2c', 2, true, true);
    this.consoleLabel = cl;                              // live-updates on rebind
    c.on('pointerdown', function () { self.requestStation('machine'); });
    this.consoleUi = null;
    this.flowTimer = null;       // powered-state pulse stream
    // run config survives open/close within a visit; defaults are fresh per scene
    this.consoleMode = 'clear';
    this.consoleAffixes = [];
    this.consoleMap = (DATA.console.maps && DATA.console.maps[0]) ? DATA.console.maps[0].id : 'trainyard';  // M4.9
    this.mapDropdownOpen = false;
    // M7k (user): searchable map list + scoped bestiary (scene reuse — reset)
    this.consoleSearch = ''; this.mapListScroll = 0;
    this.bestiarySearch = ''; this.bestiaryScope = null;
    this._typing = false;
    // v5 (2026-07-17): FIND THE CORRUPTION scanner state (scene reuse — reset).
    this._corrPhase = 'idle'; this._corrTick = null; this._corrRet = { x: 0, y: 0 };
    this._corrTargetId = null; this._corrHunt = 0; this._corrHop = 0; this._corrFlyT = 0;
    this.chamberAmbient();                    // ART TEST: hi-fi platform/conduit come alive
  },

  // ART TEST (hi-fi chamber): the platform + conduit are ALWAYS animated — the
  // ring lights breathe, the well pulses, and energy pulses climb the conduit
  // even when no portal is up (user: "the platform and the wiring should all be
  // animated"). No-op unless the Hi-Fi Chamber toggle is on. powerUp() takes
  // over while a portal is live; powerDown() restarts this.
  chamberAmbient: function () {
    if (!(typeof TEX !== 'undefined' && TEX.hifiChamberOn && TEX.hifiChamberOn())) return;
    var self = this, amb = 0x49e83b;
    (this.ringLights || []).forEach(function (l, i) {
      self.tweens.killTweensOf(l);
      l.setTint(amb).setAlpha(0.5).setScale(1.4);
      self.tweens.add({ targets: l, alpha: 0.95, scale: 1.75, yoyo: true, repeat: -1, duration: 1000, delay: i * 110, ease: 'Sine.inOut' });
    });
    if (this.wellGlow) {
      this.tweens.killTweensOf(this.wellGlow);
      this.wellGlow.setTint(amb).setAlpha(0.35).setScale(1.7);
      this.tweens.add({ targets: this.wellGlow, alpha: 0.62, scale: 2.0, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.inOut' });
    }
    if (this.ambientFlow) this.ambientFlow.remove();
    this.ambientFlow = this.time.addEvent({ delay: 900, loop: true, callback: function () { self.conduitPulse(amb, 1100); } });
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
    this.chamberAmbient();                                          // ART TEST: hi-fi chamber stays alive
  },

  // M3.5 polish (user, 2026-07-12): NO floating instructional text — the page
  // footer says "SPACE to interact". In range, the console just brightens
  // (diegetic invitation); SPACE opens it.
  handleConsole: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.bestiaryUi || this.charging) return;   // AUDIT #8: bestiary guard
    var p = this.player, cp = this.consolePos;
    var near = Math.hypot(cp.x - p.x, cp.y - p.y) <= DATA.interact.consoleRange;
    this.consoleSprite.setScale(TEX.nexusScale('console', near ? 3.3 : 3));   // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleConsole();
  },

  toggleConsole: function () {
    if (this.consoleUi) {
      this.consoleUi.forEach(function (o) { o.destroy(); });
      this.consoleUi = null;
      this.mapDropdownOpen = false;                        // M4.9: collapse the map dropdown on close
      this.consoleSearch = ''; this.mapListScroll = 0;     // M7k: fresh search per visit
      this._typing = false;
      this.input.keyboard.off('keydown-ENTER', this.consoleEnterFn, this);   // bug #2 family
      if (this._consoleSearchFn) { this.input.keyboard.off('keydown', this._consoleSearchFn); this._consoleSearchFn = null; }
      if (this._consoleWheel) { this.input.off('wheel', this._consoleWheel); this._consoleWheel = null; }
      if (this._corrTick) { this._corrTick.remove(); this._corrTick = null; }   // v5: stop the scanner animation
      return;
    }
    if (this.charging) return;                           // one cinematic at a time
    if (this.vaultUi) this.toggleVault();                // one overlay at a time
    if (this.gyUi) this.toggleGraveyard();
    if (this.bestiaryUi) this.toggleBestiary();
    this.buildConsoleUi();
    // M7k SEARCH CAPTURE — printable keys type into the destination search;
    // BACKSPACE edits; ESC closes the machine. Station hotkeys are muted
    // while _typing (see BINDS.wire guards).
    var self = this;
    this._typing = true;
    this._consoleSearchFn = function (ev) {
      if (!self.consoleUi) return;
      var k = ev.key;
      if (k === 'Escape') { self.toggleConsole(); return; }
      if (ACCOUNT && !ACCOUNT.beaten) return;   // v5: no destination search pre-campaign (scanner UI)
      if (k === 'Backspace') {
        if (self.consoleSearch) { self.consoleSearch = self.consoleSearch.slice(0, -1); self.mapListScroll = 0; self.buildConsoleUi(); }
        return;
      }
      if (k && k.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        if (self.consoleSearch.length < 24) {
          self.consoleSearch += k; self.mapListScroll = 0;
          if (!self.mapDropdownOpen) self.mapDropdownOpen = true;   // typing opens the list
          self.buildConsoleUi();
        }
      }
    };
    this.input.keyboard.on('keydown', this._consoleSearchFn);
    this._consoleWheel = function (ptr, over, dx, dy) {
      if (!self.consoleUi || !(self.mapDropdownOpen || self.consoleSearch)) return;
      self.mapListScroll = Math.max(0, self.mapListScroll + (dy > 0 ? 2 : -2));
      self.buildConsoleUi();
    };
    this.input.on('wheel', this._consoleWheel);
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
  // M4.9: MAP SELECTOR — headless-callable like consoleSetMode. Refuses locked
  // (??? placeholder) maps; only a built, unlocked destination can be chosen.
  consoleSetMap: function (id) {
    var m = (DATA.console.maps || []).filter(function (x) { return x.id === id; })[0];
    if (!m || m.locked) { AUDIO.play('ui'); return; }    // ??? is not selectable
    this.consoleMap = id;
    this.mapDropdownOpen = false;
    this.consoleSearch = ''; this.mapListScroll = 0;     // M7k: picking resolves the search
    AUDIO.play('ui');
    if (this.consoleUi) this.buildConsoleUi();
  },

  toggleMapDropdown: function () {
    this.mapDropdownOpen = !this.mapDropdownOpen;
    AUDIO.play('ui');
    if (this.consoleUi) this.buildConsoleUi();
  },

  consoleSpawnPortal: function (instant) {
    if (this.charging) return;                           // one cinematic at a time
    var cfg = { mode: this.consoleMode, map: this.consoleMap, affixes: this.consoleAffixes.slice() };  // M4.9: map rides along
    this.registry.set('pendingPortal', cfg);             // survives resize restarts
    if (this.consoleUi) this.toggleConsole();
    this.materializePortal(cfg, !instant);
  },

  buildConsoleUi: function () {
    if (this.consoleUi) { this.consoleUi.forEach(function (o) { o.destroy(); }); this.consoleUi = null; }
    // v5 (2026-07-17): FIRST PLAYTHROUGH — before the whale falls the machine is
    // the CORRUPTION SCANNER (find/reroll/step-through a random region). Beating
    // the game flips it to the free selector below (the "final end state", Red).
    if (ACCOUNT && !ACCOUNT.beaten) { this.buildCorruptionUi(); return; }
    var self = this;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, 640, 520, 0x0f0f1b, 0.97).setDepth(80).setStrokeStyle(2, 0x41a6f6));
    ui.push(this.add.text(cx, cy - 232, DATA.console.name, { fontFamily: 'monospace', fontSize: 22, color: '#41a6f6' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 206, 'configure the run · power the platform · step through',
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));

    // the selected MAP (M4.9) — its name feeds the REALM CLEAR detail line
    var selMap = (DATA.console.maps || []).filter(function (x) { return x.id === self.consoleMap; })[0]
                 || { name: DATA.realm.name };

    // --- M7k (user): SEARCH BAR at the very top — type anywhere while the
    // machine is open; the list below filters live. ---
    var sq = this.consoleSearch || '';
    var sBox = this.add.rectangle(cx, cy - 180, 580, 24, 0x1a1c2c, 1).setDepth(81)
      .setStrokeStyle(1, sq ? 0xffcd75 : 0x333c57).setInteractive({ useHandCursor: true });
    sBox.on('pointerdown', function () { if (!self.mapDropdownOpen) self.toggleMapDropdown(); });
    ui.push(sBox);
    ui.push(this.add.text(cx - 278, cy - 180, sq ? ('SEARCH: ' + sq + '_') : 'SEARCH — type to filter destinations',
      { fontFamily: 'monospace', fontSize: 11, color: sq ? '#ffcd75' : '#566c86' }).setOrigin(0, 0.5).setDepth(82));
    if (sq) {
      var clr = this.add.text(cx + 274, cy - 180, '[CLR]', { fontFamily: 'monospace', fontSize: 10, color: '#ff9e6d' })
        .setOrigin(1, 0.5).setDepth(82).setInteractive({ useHandCursor: true });
      clr.on('pointerdown', function () { self.consoleSearch = ''; self.mapListScroll = 0; self.buildConsoleUi(); });
      ui.push(clr);
    }

    // --- MAP SELECTOR at the TOP (M7k, user: "map goes at the top") — the
    // collapsed row shows the chosen destination; click (or type) to expand.
    // The open list is WINDOWED — 20 realms scroll instead of overflowing the
    // panel (the m7j overlap bug). ---
    ui.push(this.add.text(cx - 290, cy - 158, 'MAP', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setDepth(81));
    var selRow = this.add.rectangle(cx, cy - 136, 580, 26, 0x1a1c2c, 1).setDepth(81)
      .setStrokeStyle(1, 0x41a6f6).setInteractive({ useHandCursor: true });
    selRow.on('pointerdown', function () { self.toggleMapDropdown(); });
    ui.push(selRow);
    ui.push(this.add.text(cx - 278, cy - 136, '> ' + selMap.name,
      { fontFamily: 'monospace', fontSize: 12, color: '#a7d3ff' }).setOrigin(0, 0.5).setDepth(82));
    ui.push(this.add.text(cx + 278, cy - 136, this.mapDropdownOpen ? '▲' : '▼',
      { fontFamily: 'monospace', fontSize: 12, color: '#41a6f6' }).setOrigin(1, 0.5).setDepth(82));

    var listOpen = this.mapDropdownOpen || !!sq;
    if (listOpen) {
      // catcher: click anywhere off an option closes the list (and clears the search)
      var catcher = this.add.rectangle(cx, cy, 640, 520, 0x000000, 0.01).setDepth(89)
        .setInteractive();
      catcher.on('pointerdown', function () {
        self.consoleSearch = ''; self.mapListScroll = 0;
        if (self.mapDropdownOpen) self.toggleMapDropdown(); else self.buildConsoleUi();
      });
      ui.push(catcher);
      var q = sq.toLowerCase();
      var flt = (DATA.console.maps || []).filter(function (mp) {
        return !q || (mp.name + ' ' + (mp.sub || '')).toLowerCase().indexOf(q) >= 0;
      });
      var MAXV = 10, top = cy - 110;
      var maxScroll = Math.max(0, flt.length - MAXV);
      if (this.mapListScroll > maxScroll) this.mapListScroll = maxScroll;
      var off = this.mapListScroll;
      // backdrop so the list reads as ONE overlay, not rows floating on the form
      var listH = Math.max(1, Math.min(MAXV, flt.length)) * 26 + 16;
      ui.push(this.add.rectangle(cx, top - 13 + listH / 2, 592, listH, 0x0f0f1b, 0.99)
        .setDepth(90).setStrokeStyle(1, 0x41a6f6));
      if (!flt.length) {
        ui.push(this.add.text(cx, top, 'no destination matches "' + sq + '" — BACKSPACE to edit',
          { fontFamily: 'monospace', fontSize: 11, color: '#ff9e6d' }).setOrigin(0.5).setDepth(91));
      }
      flt.slice(off, off + MAXV).forEach(function (mp, i) {
        var y = top + i * 26;
        var isSel = mp.id === self.consoleMap;
        var box = self.add.rectangle(cx, y, 574, 24, mp.locked ? 0x14142a : (isSel ? 0x29366f : 0x1a1c2c), 1)
          .setDepth(91).setStrokeStyle(1, mp.locked ? 0x1f2440 : (isSel ? 0x41a6f6 : 0x333c57));
        ui.push(box);
        if (!mp.locked) {
          box.setInteractive({ useHandCursor: true });
          box.on('pointerover', function () { if (!isSel) box.setFillStyle(0x222a4d, 1); });
          box.on('pointerout',  function () { if (!isSel) box.setFillStyle(0x1a1c2c, 1); });
          box.on('pointerdown', function () { self.consoleSetMap(mp.id); });
        }
        ui.push(self.add.text(cx - 270, y, (isSel ? '> ' : '  ') + mp.name,
          { fontFamily: 'monospace', fontSize: 11, color: mp.locked ? '#3b4466' : (isSel ? '#ffcd75' : '#a7d3ff') }).setOrigin(0, 0.5).setDepth(92));
        ui.push(self.add.text(cx + 268, y, mp.locked ? 'LOCKED · ' + mp.sub : mp.sub,
          { fontFamily: 'monospace', fontSize: 9, color: mp.locked ? '#3b4466' : '#566c86' }).setOrigin(1, 0.5).setDepth(92));
      });
      // scroll affordances — wheel scrolls; the counters say what's clipped
      if (off > 0) {
        var upB = this.add.text(cx, top - 20, '▲ ' + off + ' more', { fontFamily: 'monospace', fontSize: 9, color: '#41a6f6' })
          .setOrigin(0.5).setDepth(92).setInteractive({ useHandCursor: true });
        upB.on('pointerdown', function () { self.mapListScroll = Math.max(0, self.mapListScroll - MAXV); self.buildConsoleUi(); });
        ui.push(upB);
      }
      if (off + MAXV < flt.length) {
        var dnB = this.add.text(cx, top + Math.min(MAXV, flt.length) * 26 - 6, '▼ ' + (flt.length - off - MAXV) + ' more (scroll)',
          { fontFamily: 'monospace', fontSize: 9, color: '#41a6f6' })
          .setOrigin(0.5).setDepth(92).setInteractive({ useHandCursor: true });
        dnB.on('pointerdown', function () { self.mapListScroll = Math.min(maxScroll, self.mapListScroll + MAXV); self.buildConsoleUi(); });
        ui.push(dnB);
      }
    }

    // --- mode select (below the map — M7k reorder) ---
    ui.push(this.add.text(cx - 290, cy - 112, 'GAME MODE', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setDepth(81));
    DATA.console.modes.forEach(function (m, i) {
      var y = cy - 82 + i * 46, sel = self.consoleMode === m;
      var md = DATA.modes[m];
      var box = self.add.rectangle(cx, y, 580, 40, sel ? 0x29366f : 0x1a1c2c, 1).setDepth(81)
        .setStrokeStyle(sel ? 2 : 1, sel ? 0xffcd75 : 0x333c57)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', function () { self.consoleSetMode(m); });
      ui.push(box);
      var detail = m === 'clear'
        ? selMap.name + ' · ' + DATA.realm.killQuota + ' ' + md.desc
        : md.desc;
      ui.push(self.add.text(cx - 278, y - 8, (sel ? '> ' : '  ') + md.name,
        { fontFamily: 'monospace', fontSize: 13, color: sel ? '#ffcd75' : '#94b0c2' }).setDepth(82));
      ui.push(self.add.text(cx - 278, y + 8, '  ' + detail,
        { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setDepth(82));
    });

    // --- affix board (M3.5 preview: toggleable + visible, INERT until M5) ---
    ui.push(this.add.text(cx - 290, cy + 8, 'MAP AFFIXES — ' + this.consoleAffixes.length + '/' + DATA.console.maxAffixes +
      ' slotted  (preview: not yet active — the danger is coming at M5)',
      { fontFamily: 'monospace', fontSize: 11, color: '#ffcd75' }).setDepth(81));
    DATA.console.affixChoices.forEach(function (key, i) {
      var a = DATA.affixes.map[key];
      var on = self.consoleAffixes.indexOf(key) >= 0;
      var y = cy + 38 + i * 42;
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

    // ENTER spawns — wired per open, unwired on close (listener-stacking gotcha).
    // v5: pre-campaign ENTER drives the scanner (step-through / scan) instead.
    this.consoleEnterFn = this.consoleEnterFn || function () {
      if (!this.consoleUi) return;
      if (ACCOUNT && !ACCOUNT.beaten) { this.corrEnter(); return; }
      this.consoleSpawnPortal();
    };
    this.input.keyboard.off('keydown-ENTER', this.consoleEnterFn, this);
    this.input.keyboard.on('keydown-ENTER', this.consoleEnterFn, this);
  },

  // ==========================================================================
  // v5 (2026-07-17) — FIRST PLAYTHROUGH: FIND THE CORRUPTION.
  // The pre-campaign portal machine. A star-map of the GLOBAL CONSCIOUSNESS
  // (sleeping minds); scanning hunts a crosshair across it and locks the one
  // red corrupted node = the next region. Beating the whale flips ACCOUNT.beaten
  // and the machine becomes the free selector (buildConsoleUi). See memory
  // [[endgame-firstplaythrough]].
  // ==========================================================================
  campaignMaps: function () {
    return (DATA.console.maps || []).filter(function (m) { return !m.locked; });
  },
  // the discovered-but-uncleared region id (the active corruption), or null
  activeCorruption: function () {
    var disc = ACCOUNT.discovered || [], cl = ACCOUNT.cleared || [];
    for (var i = disc.length - 1; i >= 0; i--) { if (cl.indexOf(disc[i]) < 0) return disc[i]; }
    return null;
  },
  corrNodeById: function (id) {
    var ns = this._corrNodes || [];
    for (var i = 0; i < ns.length; i++) if (ns[i].id === id) return ns[i];
    return null;
  },
  corrGarble: function (name) {
    var L = 'ABCDEFGHJKMNPQRSTVWXYZ#?/', s = name || '??????????', out = '';
    for (var i = 0; i < s.length; i++) out += (s[i] === ' ') ? ' ' : L[Math.floor(Math.random() * L.length)];
    return out;
  },
  // pick the next region to reveal. FIRST reveal of the whole run = the train
  // yard; when only the whale remains uncleared = the whale; else a random
  // undiscovered non-whale region (opts.exclude/opts.reroll for rerolls).
  pickCorruption: function (opts) {
    opts = opts || {};
    var maps = this.campaignMaps().map(function (m) { return m.id; });
    var disc = ACCOUNT.discovered || [], cl = ACCOUNT.cleared || [];
    if (!opts.reroll && disc.length === 0 && cl.length === 0 && maps.indexOf('trainyard') >= 0) return 'trainyard';
    var remainingNonWhale = maps.filter(function (id) { return cl.indexOf(id) < 0 && id !== 'belly'; });
    if (remainingNonWhale.length === 0) return 'belly';
    var taken = disc.concat(cl);
    var avail = maps.filter(function (id) { return taken.indexOf(id) < 0 && id !== 'belly' && id !== opts.exclude; });
    if (avail.length === 0) return 'belly';
    return avail[Math.floor(Math.random() * avail.length)];
  },

  corrNodeState: function (id) {
    if ((ACCOUNT.cleared || []).indexOf(id) >= 0) return 'purged';
    if (this._corrPhase === 'locked' && id === this._corrTargetId) return 'found';
    var active = this.activeCorruption();
    if (active && id === active) return 'found';
    if (id === 'belly') return 'whale';
    return 'locked';
  },
  // item 9: the hover-tooltip payload for a region node — name + special
  // mechanics when known (purged/discovered), anonymous otherwise.
  corrNodeTip: function (id) {
    var st = this.corrNodeState(id), nd = this.corrNodeById(id) || { name: id };
    var mech = (DATA.console.mech && DATA.console.mech[id]) || '';
    if (st === 'purged') return { title: (nd.name || id) + '  · PURGED', body: mech, color: '#96eb8c' };
    if (st === 'found') return { title: (nd.name || id), body: mech, color: '#e8f0ff' };
    if (st === 'whale') return { title: 'PATIENT ZERO', body: 'the final corruption — purge everything else first.', color: '#c79bff' };
    return { title: '??? · UNDISCOVERED', body: 'an unidentified signal — scan to reveal it.', color: '#8aa0c8' };
  },

  // compute node + star positions once per panel size (cached)
  corrLayout: function () {
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var PW = 720, PH = 580;
    this._corrPanel = { cx: cx, cy: cy, w: PW, h: PH };
    var mapX0 = cx - PW / 2 + 16, mapY0 = cy - PH / 2 + 74, mapW = PW - 32, mapH = 338;
    this._corrMap = { x0: mapX0, y0: mapY0, w: mapW, h: mapH, cx: mapX0 + mapW / 2, cy: mapY0 + mapH / 2 };
    var key = Math.round(mapW) + 'x' + Math.round(mapH);
    if (this._corrLayoutKey === key && this._corrNodes) return;
    this._corrLayoutKey = key;
    var maps = this.campaignMaps(), mcx = this._corrMap.cx, mcy = this._corrMap.cy;
    var rmax = Math.min(mapW / 2 - 40, (mapH / 2 - 28) / 0.6), n = Math.max(1, maps.length - 1), nodes = [];
    for (var i = 0; i < maps.length; i++) {
      var a = i * (6.283 / 20) * 2.2 + 0.4, r = 42 + (i / n) * (rmax - 42);
      var x = mcx + Math.cos(a) * r, y = mcy + Math.sin(a) * r * 0.6;
      x = Math.min(mapX0 + mapW - 26, Math.max(mapX0 + 26, x));
      y = Math.min(mapY0 + mapH - 24, Math.max(mapY0 + 24, y));
      nodes.push({ x: x, y: y, id: maps[i].id, name: maps[i].name, sub: maps[i].sub });
    }
    this._corrNodes = nodes;
    var seed = 20260717; function rr() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var stars = [];
    for (var s = 0; s < 150; s++) {
      var sx, sy;
      if (rr() < 0.6) { var aa = rr() * 6.28 + rr() * 7, rd = Math.sqrt(rr()) * rmax * 1.1; sx = mcx + Math.cos(aa) * rd; sy = mcy + Math.sin(aa) * rd * 0.6; }
      else { sx = mapX0 + rr() * mapW; sy = mapY0 + rr() * mapH; }
      if (sx > mapX0 + 2 && sx < mapX0 + mapW - 2 && sy > mapY0 + 2 && sy < mapY0 + mapH - 2) stars.push({ x: sx, y: sy, b: 0.2 + rr() * 0.55 });
    }
    this._corrStars = stars;
  },

  startCorrTick: function () {
    if (this._corrTick) return;
    var self = this;
    this._corrTick = this.time.addEvent({ delay: 33, loop: true, callback: function () { try { self.corrFrame(); } catch (e) {} } });
  },

  // one animation frame — redraws the star-map + reticle into this._corrG and
  // advances the hunt/fly phase timers.
  corrFrame: function () {
    var g = this._corrG; if (!g || !g.scene) return;
    var M = this._corrMap, t = this.time.now, self = this; g.clear();
    g.fillStyle(0x0b1024, 1); g.fillRect(M.x0, M.y0, M.w, M.h);
    g.lineStyle(1, 0x35608f, 0.5); g.strokeRect(M.x0, M.y0, M.w, M.h);
    (this._corrStars || []).forEach(function (st) {
      var tw = st.b * (0.55 + 0.45 * Math.sin(t / 500 + st.x));
      g.fillStyle(0x8fb6e6, Math.max(0, Math.min(1, tw))); g.fillRect(st.x, st.y, 1.5, 1.5);
    });
    var nodes = this._corrNodes || [];
    g.lineStyle(1, 0x4a78be, 0.10);
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var near = nodes.slice().sort(function (p, q) { return Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(a.x - q.x, a.y - q.y); }).slice(1, 3);
      for (var k = 0; k < near.length; k++) { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(near[k].x, near[k].y); g.strokePath(); }
    }
    nodes.forEach(function (nd) {
      var st = self.corrNodeState(nd.id);
      if (st === 'found') {
        g.fillStyle(0xe85050, 0.10); g.fillCircle(nd.x, nd.y, 22);
        g.fillStyle(0xe85050, 0.22); g.fillCircle(nd.x, nd.y, 12);
        g.fillStyle(0xffecec, 1); g.fillCircle(nd.x, nd.y, 3);
        g.lineStyle(2, 0xe85050, 0.85); g.strokeCircle(nd.x, nd.y, 14 + 4 * Math.sin(t / 180));
      } else if (st === 'purged') {
        g.fillStyle(0x96eb8c, 0.26); g.fillCircle(nd.x, nd.y, 6); g.fillStyle(0x96eb8c, 1); g.fillCircle(nd.x, nd.y, 2.6);
      } else if (st === 'whale') {
        g.fillStyle(0xc79bff, 0.26); g.fillCircle(nd.x, nd.y, 8); g.fillStyle(0xc79bff, 1); g.fillCircle(nd.x, nd.y, 2.8);
      } else {
        g.fillStyle(0x5a698c, 0.22); g.fillCircle(nd.x, nd.y, 5); g.fillStyle(0x8aa0c8, 0.85); g.fillCircle(nd.x, nd.y, 2);
      }
    });
    var ph = this._corrPhase;
    if (ph === 'hunt') {
      this._corrHunt += 33; this._corrHop += 33;
      if (this._corrHop >= 105) {
        this._corrHop = 0;
        var rn = nodes[Math.floor(Math.random() * nodes.length)];
        if (rn) { this._corrRet.x = rn.x; this._corrRet.y = rn.y; }
        if (this._corrNameText) this._corrNameText.setText(this.corrGarble());
      }
      if (this._corrHunt >= 1700) { this._corrFly0 = { x: this._corrRet.x, y: this._corrRet.y }; this._corrFlyT = 0; this._corrPhase = 'fly'; }
    } else if (ph === 'fly') {
      this._corrFlyT = Math.min(1, this._corrFlyT + 0.05);
      var e = 1 - Math.pow(1 - this._corrFlyT, 3), tg = this.corrNodeById(this._corrTargetId);
      if (tg) { this._corrRet.x = this._corrFly0.x + (tg.x - this._corrFly0.x) * e; this._corrRet.y = this._corrFly0.y + (tg.y - this._corrFly0.y) * e; }
      if (this._corrNameText) this._corrNameText.setText(this.corrGarble(tg ? tg.name : ''));
      if (this._corrFlyT >= 1) { this.corrLock(); return; }
    }
    if (ph === 'hunt' || ph === 'fly' || ph === 'locked') {
      var rx = this._corrRet.x, ry = this._corrRet.y, col = ph === 'locked' ? 0xffcd75 : 0x5fe8c2, rad = ph === 'locked' ? 24 : 18;
      g.lineStyle(2, col, 1);
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { g.beginPath(); g.moveTo(rx + d[0] * rad * 0.55, ry + d[1] * rad * 0.55); g.lineTo(rx + d[0] * rad, ry + d[1] * rad); g.strokePath(); });
      g.strokeCircle(rx, ry, rad);
      if (this._corrNameText) {
        if (ph === 'locked') this._corrNameText.setVisible(false);
        else this._corrNameText.setVisible(true).setPosition(rx, ry - rad - 12).setColor('#7fd0ff');
      }
    } else if (this._corrNameText) { this._corrNameText.setVisible(false); }
  },

  corrLock: function () {
    var id = this._corrTargetId;
    if (ACCOUNT.discovered.indexOf(id) < 0) ACCOUNT.discovered.push(id);
    if (!ACCOUNT.corrMode) ACCOUNT.corrMode = 'clear';
    this._corrPhase = 'locked';
    try { persist(); } catch (e) {}
    try { AUDIO.play('spawn'); } catch (e) {}
    this.buildCorruptionUi();
  },

  corrEnter: function () {
    if (this._corrPhase === 'hunt' || this._corrPhase === 'fly') return;
    if (this.activeCorruption()) this.corruptionStepThrough();
    else this.corruptionScan();
  },

  corruptionScan: function () {
    if (this._corrPhase === 'hunt' || this._corrPhase === 'fly') return;
    if (this.activeCorruption()) return;
    this._corrTargetId = this.pickCorruption();
    this._corrPhase = 'hunt'; this._corrHunt = 0; this._corrHop = 999;
    try { AUDIO.play('ui'); } catch (e) {}
    this.startCorrTick();
    this.buildCorruptionUi();
  },

  corruptionReroll: function () {
    var active = this.activeCorruption();
    if (!active || this._corrPhase === 'hunt' || this._corrPhase === 'fly') return;
    if ((ACCOUNT.mapTokens || 0) <= 0) return;
    ACCOUNT.mapTokens--;
    var modes = (DATA.console.modes || ['clear']);
    var others = modes.filter(function (m) { return m !== ACCOUNT.corrMode; });
    if (others.length) ACCOUNT.corrMode = others[Math.floor(Math.random() * others.length)];
    if (Math.random() < 0.5) {                 // 50%: relocate to a different region (never whale)
      var di = ACCOUNT.discovered.indexOf(active); if (di >= 0) ACCOUNT.discovered.splice(di, 1);
      this._corrTargetId = this.pickCorruption({ reroll: true, exclude: active });
      this._corrPhase = 'hunt'; this._corrHunt = 0; this._corrHop = 999;
      try { persist(); AUDIO.play('ui'); } catch (e) {}
      this.startCorrTick(); this.buildCorruptionUi();
    } else {                                    // else: mode swap only
      try { persist(); AUDIO.play('ui'); } catch (e) {}
      this.buildCorruptionUi();
    }
  },

  corruptionStepThrough: function () {
    var active = this.activeCorruption();
    if (!active) return;
    this.consoleMap = active;
    this.consoleMode = ACCOUNT.corrMode || 'clear';
    this.consoleAffixes = [];
    this.consoleSpawnPortal();
  },

  buildCorruptionUi: function () {
    if (this.consoleUi) { this.consoleUi.forEach(function (o) { try { o.destroy(); } catch (e) {} }); this.consoleUi = null; }
    var self = this, ui = [];
    this.corrLayout();
    var P = this._corrPanel, M = this._corrMap, cx = P.cx, cy = P.cy;
    // phase: mid-animation is preserved; otherwise derived from save state
    if (this._corrPhase !== 'hunt' && this._corrPhase !== 'fly') {
      var active0 = this.activeCorruption();
      this._corrPhase = active0 ? 'locked' : 'idle';
      if (active0) { this._corrTargetId = active0; var an = this.corrNodeById(active0); if (an) { this._corrRet.x = an.x; this._corrRet.y = an.y; } }
    }
    var mode = ACCOUNT.corrMode || 'clear', modeName = (DATA.modes[mode] && DATA.modes[mode].name) || 'REALM CLEAR';
    var purged = (ACCOUNT.cleared || []).length, total = this.campaignMaps().length;

    ui.push(this.add.rectangle(cx, cy, P.w, P.h, 0x0a0c14, 0.98).setDepth(80).setStrokeStyle(2, 0x35608f));
    // HUD header
    ui.push(this.add.text(cx - P.w / 2 + 18, cy - P.h / 2 + 16, 'GLOBAL CONSCIOUSNESS',
      { fontFamily: 'monospace', fontSize: 20, color: '#5fe8c2', fontStyle: 'bold' }).setDepth(83));
    ui.push(this.add.text(cx - P.w / 2 + 18, cy - P.h / 2 + 42, 'the sleeping dream · 8,204,551,300 minds linked · scan for infection',
      { fontFamily: 'monospace', fontSize: 11, color: '#6a86a8' }).setDepth(83));
    ui.push(this.add.text(cx + P.w / 2 - 18, cy - P.h / 2 + 20, 'PURGED ' + purged + ' / ' + total,
      { fontFamily: 'monospace', fontSize: 13, color: '#ffcd75' }).setOrigin(1, 0).setDepth(83));
    // dynamic star-map graphics
    this._corrG = this.add.graphics().setDepth(81); ui.push(this._corrG);
    // legend (compact, along the bottom of the map)
    ui.push(this.add.text(M.x0 + 8, M.y0 + M.h - 16,
      '● purged   ● corruption   ● undiscovered   ● patient zero',
      { fontFamily: 'monospace', fontSize: 10, color: '#6a86a8' }).setDepth(83));
    // floating spinning name (hunt/fly)
    this._corrNameText = this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: 16, color: '#7fd0ff', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(84).setVisible(false); ui.push(this._corrNameText);

    // item 9: HOVER any region node → its name + SPECIAL MECHANICS. Purged and
    // discovered regions read out (fog, bell toll, ghost train…); undiscovered
    // signals stay anonymous until you scan them. One reused tooltip.
    var tip = this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: 11, color: '#e8f0ff',
      backgroundColor: 'rgba(11,16,36,0.94)', padding: { x: 6, y: 5 }, wordWrap: { width: 250 } })
      .setDepth(90).setVisible(false); ui.push(tip);
    this._corrTip = tip;
    (this._corrNodes || []).forEach(function (nd) {
      var z = self.add.circle(nd.x, nd.y, 15, 0xffffff, 0.001).setDepth(85).setInteractive({ useHandCursor: true });
      z.on('pointerover', function () {
        var info = self.corrNodeTip(nd.id);
        tip.setColor(info.color).setText(info.title + (info.body ? ('\n' + info.body) : '')).setVisible(true);
        var tx = Math.min(nd.x + 16, M.x0 + M.w - tip.width - 6), ty = Math.min(nd.y + 12, M.y0 + M.h - tip.height - 6);
        tip.setPosition(Math.max(M.x0 + 6, tx), Math.max(M.y0 + 6, ty));
      });
      z.on('pointerout', function () { tip.setVisible(false); });
      ui.push(z);
    });

    // ---- control strip / discovery card (below the map) ----
    var by = M.y0 + M.h + 10, ph = this._corrPhase;
    function btn(bx, yy, w, label, color, cb) {
      var r = self.add.rectangle(bx, yy, w, 40, color, 1).setDepth(82).setStrokeStyle(2, 0xf4f4f4).setInteractive({ useHandCursor: true });
      r.on('pointerdown', cb); ui.push(r);
      ui.push(self.add.text(bx, yy, label, { fontFamily: 'monospace', fontSize: 14, color: '#0a0c14', fontStyle: 'bold' }).setOrigin(0.5).setDepth(83));
    }
    if (ph === 'hunt' || ph === 'fly') {
      ui.push(this.add.text(cx, by + 60, 'SCANNING FOR INFECTION…', { fontFamily: 'monospace', fontSize: 16, color: '#5fe8c2' }).setOrigin(0.5).setDepth(83));
    } else if (ph === 'locked') {
      var id = this._corrTargetId, def = this.corrNodeById(id) || { name: id }, mech = (DATA.console.mech && DATA.console.mech[id]) || 'unknown corruption.';
      var regionNo = this.campaignMaps().map(function (m) { return m.id; }).indexOf(id) + 1;
      var lft = cx - P.w / 2 + 18;
      ui.push(this.add.text(lft, by + 2, '! CORRUPTION DETECTED · REGION ' + ('0' + regionNo).slice(-2),
        { fontFamily: 'monospace', fontSize: 11, color: '#e85050', fontStyle: 'bold' }).setDepth(83));
      ui.push(this.add.text(lft, by + 18, def.name,
        { fontFamily: 'monospace', fontSize: 20, color: '#ffcd75', fontStyle: 'bold' }).setDepth(83));
      ui.push(this.add.text(cx + P.w / 2 - 18, by + 2, 'MODE: ' + modeName,
        { fontFamily: 'monospace', fontSize: 11, color: '#ffcd75' }).setOrigin(1, 0).setDepth(83));
      ui.push(this.add.text(cx + P.w / 2 - 18, by + 18, 'CLEAR REWARD: +1 MAP TOKEN',
        { fontFamily: 'monospace', fontSize: 11, color: '#96eb8c' }).setOrigin(1, 0).setDepth(83));
      // item 9: SHOW THE MAP — a framed thumbnail of the region's actual terrain
      // (its biome floor tile), so a discovery reveals what the place looks like,
      // then names its SPECIAL MECHANICS beside it (fog, bell toll, ghost train…).
      var rdef = (DATA.realms && DATA.realms[id]) || {}, bdef = (DATA.biomes && DATA.biomes[rdef.biome]) || {};
      var tileKey = bdef.tile, thW = 150, thH = 50, thX = lft + thW / 2, thY = by + 44 + thH / 2;
      ui.push(this.add.rectangle(thX, thY, thW, thH, 0x0b1024, 1).setDepth(82).setStrokeStyle(2, 0x35608f));
      if (tileKey && this.textures.exists(tileKey)) {
        var ts = this.add.tileSprite(thX, thY, thW - 4, thH - 4, tileKey).setDepth(82);
        try { ts.setTileScale(0.6, 0.6); } catch (e) {}
        ui.push(ts);
      } else {
        ui.push(this.add.text(thX, thY, 'MAP', { fontFamily: 'monospace', fontSize: 12, color: '#5a698c' }).setOrigin(0.5).setDepth(83));
      }
      ui.push(this.add.text(thX, thY + thH / 2 - 8, (rdef.name || def.name || '').toUpperCase(),
        { fontFamily: 'monospace', fontSize: 9, color: '#cfe0ff', backgroundColor: '#0009', padding: { x: 3, y: 1 } }).setOrigin(0.5, 0.5).setDepth(84));
      // SPECIAL MECHANICS — labeled, to the right of the map thumbnail
      var mxL = lft + thW + 16, mxW = P.w - 36 - thW - 16;
      ui.push(this.add.text(mxL, by + 44, 'SPECIAL MECHANICS',
        { fontFamily: 'monospace', fontSize: 11, color: '#5fe8c2', fontStyle: 'bold' }).setDepth(83));
      ui.push(this.add.text(mxL, by + 60, mech,
        { fontFamily: 'monospace', fontSize: 11, color: '#cdd7ea', wordWrap: { width: mxW } }).setDepth(83));
      // buttons below the card text
      var bY = by + 118;
      btn(cx - 132, bY, 248, 'STEP THROUGH  ▸', 0x38b764, function () { self.corruptionStepThrough(); });
      var hasTok = (ACCOUNT.mapTokens || 0) > 0;
      var rb = this.add.rectangle(cx + 132, bY, 248, 40, hasTok ? 0x243a24 : 0x1a1c2c, 1).setDepth(82).setStrokeStyle(2, hasTok ? 0x3a6b3a : 0x333c57).setInteractive({ useHandCursor: true });
      rb.on('pointerdown', function () { self.corruptionReroll(); }); ui.push(rb);
      ui.push(this.add.text(cx + 132, bY, '↻ REROLL  (' + (ACCOUNT.mapTokens || 0) + ' TOKENS)',
        { fontFamily: 'monospace', fontSize: 13, color: hasTok ? '#96eb8c' : '#66799e', fontStyle: 'bold' }).setOrigin(0.5).setDepth(83));
    } else { // idle — can scan
      ui.push(this.add.text(cx, by + 18, 'MAP TOKENS: ' + (ACCOUNT.mapTokens || 0),
        { fontFamily: 'monospace', fontSize: 12, color: '#96eb8c' }).setOrigin(0.5).setDepth(83));
      btn(cx, by + 60, 360, '◈ FIND THE CORRUPTION ◈', 0xffcd75, function () { self.corruptionScan(); });
    }
    ui.push(this.add.text(cx, cy + P.h / 2 - 12, 'ESC closes · ENTER ' + (ph === 'locked' ? 'steps through' : 'scans'),
      { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setOrigin(0.5).setDepth(83));

    this.consoleUi = ui;
    this.startCorrTick();
  },

  despawnPortal: function () {
    this.powerDown();                                    // the works go dark
    var sp = this.spawnedPortal;
    if (!sp) return;
    if (sp.swirl) sp.swirl.remove();
    if (sp.label) sp.label.destroy();
    if (sp.disc) { this.tweens.killTweensOf(sp.disc); sp.disc.destroy(); }   // hi-fi door swirl
    sp.sprite.destroy();
    this.spawnedPortal = null;
    this.plazaPortals = [];
    this.portal = null;
  },

  // Light the ring + start the powered pulse stream (the steady state).
  powerUp: function (tint) {
    var self = this, J = DATA.juice.conduit;
    if (this.ambientFlow) { this.ambientFlow.remove(); this.ambientFlow = null; }   // hi-fi ambient yields to powered
    this.ringLights.forEach(function (l) { self.tweens.killTweensOf(l); });
    this.tweens.killTweensOf(this.wellGlow);
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
    var hifi = TEX.nexusKey('portal') !== 'portal';      // hi-fi door portal active?
    var p = this.physics.add.staticSprite(spot.x, spot.y, TEX.nexusKey('portal')).setScale(TEX.nexusScale('portal', 2.2)).setDepth(4);
    p.setTint(tint);                                     // neutral texture, mode color
    var disc = null;
    if (hifi) {
      // a DOOR frame that stays put + a swirl DISC that spins inside it (user:
      // "portal should be more like a door and should have a animation").
      var pS = TEX.nexusScale('portal', 2.2);
      disc = this.add.sprite(spot.x, spot.y + 64 * pS * 0.06, 'portalDiscHi')
        .setScale((64 * pS * 0.6) / 56).setDepth(5).setTint(tint).setAlpha(0);
      this.tweens.add({ targets: disc, alpha: 1, duration: 350 });
      this.tweens.add({ targets: disc, angle: 360, duration: 3200, repeat: -1 });
    } else {
      this.tweens.add({ targets: p, angle: 360, duration: 4000, repeat: -1 });  // classic round portal spins
    }
    var swirl = portalSwirl(this, spot.x, spot.y, tint);
    this.spawnedPortal = { sprite: p, disc: disc, swirl: swirl, mode: cfg.mode, map: cfg.map, affixes: cfg.affixes.slice() };   // M5.0: map rides the portal
    this.plazaPortals = [{ sprite: p, mode: cfg.mode, map: cfg.map, affixes: cfg.affixes.slice() }];
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
    var flare = this.add.sprite(this.consolePos.x, this.consolePos.y, TEX.nexusKey('console'))
      .setScale(TEX.nexusScale('console', 3)).setDepth(5).setTintFill(0xf4f4f4).setAlpha(0.9);
    this.tweens.add({ targets: flare, alpha: 0, scale: TEX.nexusScale('console', 3.6), duration: 320,
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
      self.portal.setScale(TEX.nexusScale('portal', 1.6), TEX.nexusScale('portal', 0.12)).setAlpha(0.65);    // flat sliver in the floor
      self.tweens.add({ targets: self.portal,
        y: self.portalSpot.y, scaleX: TEX.nexusScale('portal', 2.2), scaleY: TEX.nexusScale('portal', 2.2), alpha: 1,
        duration: J.portalMs, ease: 'Back.Out' });
      var flash = self.add.sprite(self.portalSpot.x, self.portalSpot.y, TEX.nexusKey('portal'))
        .setScale(TEX.nexusScale('portal', 0.4)).setDepth(5).setTint(0xf4f4f4).setAlpha(0.9);
      self.tweens.add({ targets: flash, scale: TEX.nexusScale('portal', 3.4), alpha: 0, duration: 480,
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
  // ONE combined always-on readout (user 2026-07-14): character + kills + deaths
  // + best + realms + last death, all on the screen at once. The numbers count
  // up (showRecords 'count') when you exit a map back to the chamber. The lever
  // still kicks energy to the screen and re-plays the count (see setRecordsMode).
  recordsParts: function () {
    var R = ACCOUNT.records;
    var last = ACCOUNT.graveyard.length ? ACCOUNT.graveyard[ACCOUNT.graveyard.length - 1] : null;
    var parts = [
      { t: DATA.classes[CURRENT.cls].name.toUpperCase() + ' LV ', n: CURRENT.level },
      { t: '  ·  KILLS ', n: R.totalKills },
      { t: '  ·  DEATHS ', n: R.deaths },
      { t: '  ·  BEST LV ', n: R.bestLevel },
      { t: '  ·  REALMS ', n: R.realmsEntered },
      { t: '  ·  CLOSED ', n: R.realmsClosed }
    ];
    if (last) parts.push({ t: '  ·  LAST: ' + last.killer.toUpperCase(), n: null });
    return parts;
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
    this.leverSprite.setTexture(TEX.nexusKey(mode === 'records' ? 'lever_up' : 'lever_down'));
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
    this.recordsSprite.setScale(TEX.nexusScale('wallscreen', near ? 3.2 : 3));   // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleGraveyard();
  },

  // M3.8 v3: SPACE at the switch throws it, like every other station
  handleSwitch: function () {
    if (this.entering || this.consoleUi || this.vaultUi || this.gyUi || this.bestiaryUi || this.charging) return;
    var p = this.player, sp = this.switchPos;
    var near = Math.hypot(sp.x - p.x, sp.y - p.y) <= DATA.interact.consoleRange;
    this.leverSprite.setScale(TEX.nexusScale('lever_up', near ? 3.3 : 3));   // leans toward you
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
    // AUDIT #7 fix (2026-07-13): pass CURRENT.equipment so a nexus drink re-
    // derives stats WITH gear bonuses (they were silently dropping until the
    // next re-derive — R5/§6: one truth = class + level + pots + equipment).
    st.stats = SIM.statsFor(cls, st.level, CURRENT.potionsDrunk, CURRENT.equipment);
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
    this.vaultScroll = 0;                                 // M5.3: always open at the top
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

    // right column: VAULT (click → equip/swap). SCROLLABLE (M5.3): a dev
    // gear-grant can overfill the vault well past DATA.vault.slots, so the
    // list shows a WINDOW of rows and scrolls (mouse wheel / Up-Down) through
    // however many items are banked.
    var rx = cx + 172, vRowH = 38, PER_PAGE = 9;
    var total = Math.max(DATA.vault.slots, GAME_SAVE.vault.length);
    var maxScroll = Math.max(0, total - PER_PAGE);
    if (this.vaultScroll == null) this.vaultScroll = 0;
    this.vaultScroll = Phaser.Math.Clamp(this.vaultScroll, 0, maxScroll);
    var scroll = this.vaultScroll;
    var moreBelow = scroll + PER_PAGE < total, moreAbove = scroll > 0;
    ui.push(this.add.text(rx, top - 24,
      'VAULT ' + GAME_SAVE.vault.length + '/' + DATA.vault.slots +
      (maxScroll > 0 ? '  ▲▼ scroll' : '  (click to equip)'),
      { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));
    for (var i = 0; i < PER_PAGE; i++) {
      (function (row) {
        var idx = scroll + row, ry = top + row * vRowH;
        if (idx >= total) return;
        var key = GAME_SAVE.vault[idx] || null;
        var box = self.add.rectangle(rx, ry, colW, vRowH - 5, 0x1a1c2c, 1).setDepth(81)
          .setStrokeStyle(1, key ? itemTint(key) : 0x29366f);
        ui.push(box);
        if (key) {
          var it = DATA.items[key];
          // M4.6: off-class gear (banked by another slot's hero) shows its
          // class tag — it can sit in the vault but won't equip on this hero.
          var offCls = it.cls && it.cls !== CURRENT.cls;
          ui.push(self.add.sprite(rx - colW / 2 + 20, ry, it.texture).setScale(1.5).setTint(itemTint(key)).setDepth(82));
          ui.push(self.add.text(rx - colW / 2 + 38, ry - 8,
            itemLabel(key) + '  (' + it.slot + (offCls ? ' · ' + DATA.classes[it.cls].name.toUpperCase() : '') + ')',
            { fontFamily: 'monospace', fontSize: 11, color: offCls ? '#566c86' : itemColor(key) }).setDepth(82));
          box.setInteractive({ useHandCursor: true });
          box.on('pointerover', function () { box.setFillStyle(0x29366f, 1); });
          box.on('pointerout',  function () { box.setFillStyle(0x1a1c2c, 1); });
          box.on('pointerdown', function () { self.equipFromVault(idx); });
        } else {
          ui.push(self.add.text(rx - colW / 2 + 38, ry - 7, '— empty —',
            { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setDepth(82));
        }
      })(i);
    }
    // scroll affordances
    if (moreAbove) ui.push(this.add.text(rx, top - 6, '▲', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(83));
    if (moreBelow) ui.push(this.add.text(rx, top + PER_PAGE * vRowH - 16, '▼ more', { fontFamily: 'monospace', fontSize: 11, color: '#ffcd75' }).setOrigin(0.5).setDepth(83));

    ui.push(this.add.text(cx, cy + 228, '[ V or ESC to close ]', { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));
    this.vaultUi = ui;
  },

  // M5.3: scroll the 24-slot vault list (mouse wheel + Up/Down while it's open).
  scrollVault: function (delta) {
    if (!this.vaultUi) return;
    this.vaultScroll = (this.vaultScroll || 0) + delta;
    this.buildVaultUi();
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
    collectItem(key);                                    // M5.5: banked = owned
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
    // M4.6 CLASS LOCK: another hero's gear stays banked — it never equips here.
    var vIt = DATA.items[key];
    if (vIt.cls && vIt.cls !== CURRENT.cls) {
      AUDIO.play('ui');
      this.toast(vIt.name + ' is ' + DATA.classes[vIt.cls].name + ' gear — this hero cannot wield it');
      return;
    }
    var slot = DATA.items[key].slot;
    var old = CURRENT.equipment[slot];
    CURRENT.equipment[slot] = key;
    collectItem(key);                                    // M5.5: equipped = owned
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
    this.bestiarySprite.setScale(TEX.nexusScale('bestiary', near ? 3.3 : 3));   // leans toward you
    if (near && this.rig.interactJustDown()) this.toggleBestiary();
  },

  // M7k (user): the book is BY MAP now — 20 live realms made one flat ring of
  // every known boss unbrowsable. bestiaryScope picks the realm (opens on the
  // machine's selected destination); ARROW UP/DOWN cycles maps; TYPING searches
  // every realm at once by creature name.
  bestiaryMaps: function () {
    return (DATA.console.maps || []).filter(function (m) {
      return !m.locked && DATA.realms && DATA.realms[m.id];
    });
  },
  // items 7/8: a creature is only "known" once you've BEATEN its realm. Until
  // then the codex slot reads "??????????" (map-scope browse) and it can't be
  // found by name search at all. Entries with no realm (suite/edge fallback)
  // are treated as known so the classic flat book still works.
  bestiaryKnown: function (entry) {
    if (!entry || !entry.realm) return true;
    var cl = (typeof ACCOUNT !== 'undefined' && ACCOUNT && ACCOUNT.cleared) || [];
    return cl.indexOf(entry.realm) >= 0;
  },
  bestiaryEntries: function () {
    var e = [];
    var q = (this.bestiarySearch || '').toLowerCase();
    var maps = this.bestiaryMaps();
    var addRealm = function (rid, rname) {
      var rdef = DATA.realms[rid]; if (!rdef) return;
      var roster = (DATA.biomes[rdef.biome] || {}).mobs || [];
      roster.forEach(function (key) { if (DATA.mobs[key]) e.push({ kind: 'mob', key: key, realm: rid, realmName: rname }); });
      (rdef.bosses || [rdef.boss]).forEach(function (bk) { if (bk && DATA.bosses[bk]) e.push({ kind: 'boss', key: bk, realm: rid, realmName: rname }); });
    };
    if (q && maps.length) {                    // SEARCH MODE: all realms, name filter
      maps.forEach(function (m) { addRealm(m.id, m.name); });
      var selfK = this;
      return e.filter(function (en) {
        if (!selfK.bestiaryKnown(en)) return false;   // can't find what you haven't unlocked
        var d = en.kind === 'mob' ? DATA.mobs[en.key] : DATA.bosses[en.key];
        return ((d.name || en.key) + '').toLowerCase().indexOf(q) >= 0;
      });
    }
    var scope = this.bestiaryScope || this.consoleMap;   // no persistence — the
    // closed book keeps FOLLOWING the machine's destination (m5 suite contract)
    var mSel = maps.filter(function (m) { return m.id === scope; })[0] || maps[0];
    if (mSel) { addRealm(mSel.id, mSel.name); return e; }
    // fallback (no console maps registered — suites/edge): pre-M7k behavior
    var bio = (DATA.realms && this.consoleMap && DATA.realms[this.consoleMap])
      ? DATA.realms[this.consoleMap].biome : DATA.realm.biome;
    var roster = (DATA.biomes[bio] || {}).mobs || Object.keys(DATA.mobs);
    roster.forEach(function (key) { if (DATA.mobs[key]) e.push({ kind: 'mob', key: key }); });
    var k; for (k in DATA.bosses) e.push({ kind: 'boss', key: k });
    return e;
  },
  bestiaryMapNav: function (dir) {
    if (!this.bestiaryUi) return;
    var maps = this.bestiaryMaps(); if (!maps.length) return;
    this.bestiarySearch = '';                  // map browse resolves the search
    var cur = this.bestiaryScope || this.consoleMap;
    var idx = 0; maps.forEach(function (m, i) { if (m.id === cur) idx = i; });
    // (unknown scope falls back to index 0 — same as the entries fallback)
    idx = (idx + dir + maps.length) % maps.length;
    this.bestiaryScope = maps[idx].id;
    this.bestiaryIndex = 0;
    AUDIO.play('ui');
    this.buildBestiaryUi();
  },

  toggleBestiary: function () {
    if (this.bestiaryUi) {
      this.bestiaryUi.forEach(function (o) { o.destroy(); });
      this.bestiaryUi = null;
      this.bestiarySearch = '';                          // M7k: fresh search per visit
      this.bestiaryScope = null;                         // re-open follows the machine again
      this._typing = false;
      if (this._bestiaryKeys) { this.input.keyboard.off('keydown', this._bestiaryKeys); this._bestiaryKeys = null; }
      return;
    }
    if (this.vaultUi) this.toggleVault();                // one overlay at a time
    if (this.gyUi) this.toggleGraveyard();
    if (this.consoleUi) this.toggleConsole();
    this.bestiaryScope = this.consoleMap;                // the book opens on the machine's destination
    this.buildBestiaryUi();
    // M7k (user): the book got a SEARCH BAR — printable keys type into it, so
    // paging moved to the ARROW KEYS (◀▶ click targets still work): LEFT/RIGHT
    // page entries, UP/DOWN cycle maps, BACKSPACE edits, ESC closes. Station
    // hotkeys are muted while _typing (BINDS.wire guards).
    var self = this;
    this._typing = true;
    this._bestiaryKeys = function (ev) {
      if (!self.bestiaryUi) return;
      var c = ev.code;
      if (c === 'ArrowLeft')  { self.bestiaryNav(-1); return; }
      if (c === 'ArrowRight') { self.bestiaryNav(1); return; }
      if (c === 'ArrowUp')    { self.bestiaryMapNav(-1); return; }
      if (c === 'ArrowDown')  { self.bestiaryMapNav(1); return; }
      var k = ev.key;
      if (k === 'Escape') { self.toggleBestiary(); return; }
      if (k === 'Backspace') {
        if (self.bestiarySearch) { self.bestiarySearch = self.bestiarySearch.slice(0, -1); self.bestiaryIndex = 0; self.buildBestiaryUi(); }
        return;
      }
      if (k && k.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        if (self.bestiarySearch.length < 24) { self.bestiarySearch += k; self.bestiaryIndex = 0; self.buildBestiaryUi(); }
      }
    };
    this.input.keyboard.on('keydown', this._bestiaryKeys);
    AUDIO.play('ui');
  },

  bestiaryNav: function (dir) {
    if (!this.bestiaryUi) return;
    var n = this.bestiaryEntries().length;
    if (!n) return;                                      // M7k: empty search result
    this.bestiaryIndex = (this.bestiaryIndex + dir + n) % n;
    AUDIO.play('ui');
    this.buildBestiaryUi();
  },

  buildBestiaryUi: function () {
    if (this.bestiaryUi) { this.bestiaryUi.forEach(function (o) { o.destroy(); }); this.bestiaryUi = null; }
    var self = this;
    var W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H / 2;
    var entries = this.bestiaryEntries();
    var n = entries.length;
    this.bestiaryIndex = n ? ((this.bestiaryIndex % n) + n) % n : 0;
    var entry = n ? entries[this.bestiaryIndex] : null;
    var GREEN = '#49e83b', DIM = '#94b0c2', FAINT = '#566c86';
    var sq = this.bestiarySearch || '';
    var ui = [];
    ui.push(this.add.rectangle(cx, cy, 640, 520, 0x0f0f1b, 0.97).setDepth(80).setStrokeStyle(2, 0x49e83b));
    ui.push(this.add.text(cx, cy - 232, 'BESTIARY', { fontFamily: 'monospace', fontSize: 22, color: GREEN }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx, cy - 208, 'field notes on everything the realms send at you',
      { fontFamily: 'monospace', fontSize: 11, color: DIM }).setOrigin(0.5).setDepth(81));

    // M7k (user): SEARCH BAR — type to hunt a creature across EVERY realm
    ui.push(this.add.rectangle(cx, cy - 188, 460, 20, 0x1a1c2c, 1).setDepth(81)
      .setStrokeStyle(1, sq ? 0xffcd75 : 0x333c57));
    ui.push(this.add.text(cx - 222, cy - 188, sq ? ('SEARCH: ' + sq + '_') : 'SEARCH — type a creature name',
      { fontFamily: 'monospace', fontSize: 10, color: sq ? '#ffcd75' : FAINT }).setOrigin(0, 0.5).setDepth(82));

    // M7k (user): MAP ROW — the book is scoped BY MAP; ▲▼ (or click) cycles
    var scopeName = sq ? ('ALL REALMS — ' + n + ' match' + (n === 1 ? '' : 'es'))
                       : ((entry && entry.realmName) ? entry.realmName : DATA.realm.name);
    var mapL = this.add.text(cx - 160, cy - 164, '▲', { fontFamily: 'monospace', fontSize: 16, color: sq ? FAINT : GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    mapL.on('pointerdown', function () { self.bestiaryMapNav(-1); });
    ui.push(mapL);
    var mapR = this.add.text(cx + 160, cy - 164, '▼', { fontFamily: 'monospace', fontSize: 16, color: sq ? FAINT : GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    mapR.on('pointerdown', function () { self.bestiaryMapNav(1); });
    ui.push(mapR);
    ui.push(this.add.text(cx, cy - 164, 'MAP: ' + scopeName,
      { fontFamily: 'monospace', fontSize: 12, color: '#ffcd75' }).setOrigin(0.5).setDepth(81));

    // navigation: ◀ entry n/N ▶ (arrow keys or click)
    var navL = this.add.text(cx - 160, cy - 140, '◀', { fontFamily: 'monospace', fontSize: 22, color: GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    navL.on('pointerdown', function () { self.bestiaryNav(-1); });
    ui.push(navL);
    var navR = this.add.text(cx + 160, cy - 140, '▶', { fontFamily: 'monospace', fontSize: 22, color: GREEN })
      .setOrigin(0.5).setDepth(81).setInteractive({ useHandCursor: true });
    navR.on('pointerdown', function () { self.bestiaryNav(1); });
    ui.push(navR);
    ui.push(this.add.text(cx, cy - 140, n ? ('entry ' + (this.bestiaryIndex + 1) + ' / ' + n) : 'entry - / -',
      { fontFamily: 'monospace', fontSize: 12, color: DIM }).setOrigin(0.5).setDepth(81));

    if (!entry) {                              // empty search result
      ui.push(this.add.text(cx, cy - 20, 'no creature matches "' + sq + '"\nBACKSPACE to edit the search',
        { fontFamily: 'monospace', fontSize: 12, color: '#ff9e6d', align: 'center' }).setOrigin(0.5).setDepth(81));
      ui.push(this.add.text(cx, cy + 236,
        '[ type to search · BACKSPACE edit · ' + BINDS.keyLabel('bestiary') + ' / ESC close ]',
        { fontFamily: 'monospace', fontSize: 11, color: GREEN }).setOrigin(0.5).setDepth(81));
      this.bestiaryUi = ui;
      return;
    }

    // items 7/8: REDACTED until you've beaten this creature's realm.
    var known = this.bestiaryKnown(entry);
    if (!known) {
      var REDACT = '??????????';
      ui.push(this.add.rectangle(cx - 180, cy - 60, 80, 80, 0x1a1c2c, 1).setDepth(81).setStrokeStyle(1, 0x333c57));
      ui.push(this.add.text(cx - 180, cy - 60, '?', { fontFamily: 'monospace', fontSize: 52, color: '#566c86' }).setOrigin(0.5).setDepth(81));
      ui.push(this.add.text(cx - 180, cy + 6, REDACT, { fontFamily: 'monospace', fontSize: 14, color: '#94b0c2' }).setOrigin(0.5).setDepth(81));
      ui.push(this.add.text(cx - 180, cy + 24, 'UNIDENTIFIED', { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setOrigin(0.5).setDepth(81));
      if (entry.realmName) ui.push(this.add.text(cx - 180, cy + 40, '· ' + entry.realmName + ' ·',
        { fontFamily: 'monospace', fontSize: 9, color: FAINT }).setOrigin(0.5).setDepth(81));
      var rsy = cy - 112, rlabels = entry.kind === 'boss' ? ['HP', 'SPEED', 'XP', 'CONTACT DMG'] : ['HP', 'SPEED', 'XP', 'THREAT COST'];
      rlabels.forEach(function (lab) {
        ui.push(self.add.text(cx - 40, rsy, lab, { fontFamily: 'monospace', fontSize: 11, color: DIM }).setDepth(81));
        ui.push(self.add.text(cx + 120, rsy, '??', { fontFamily: 'monospace', fontSize: 11, color: '#566c86' }).setDepth(81));
        rsy += 20;
      });
      ui.push(this.add.text(cx - 285, cy + 60, '· ' + REDACT + ' ' + REDACT + '\n· Beat ' + (entry.realmName || 'this region') + ' to unlock this field note.',
        { fontFamily: 'monospace', fontSize: 10, color: FAINT, wordWrap: { width: 570 } }).setDepth(81));
      ui.push(this.add.text(cx, cy + 236,
        '[ ◀ ▶ browse · ▲ ▼ change map · type to search · ESC close ]',
        { fontFamily: 'monospace', fontSize: 11, color: GREEN }).setOrigin(0.5).setDepth(81));
      this.bestiaryUi = ui;
      return;
    }

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

    // portrait + name (M4.7: size-aware — hi-fi boss art is 128px, classic 16-20px)
    var pw = this.textures.exists(d.texture) ? this.textures.get(d.texture).getSourceImage().width : 16;
    ui.push(this.add.sprite(cx - 180, cy - 60, d.texture).setScale((entry.kind === 'boss' ? 90 : 80) / pw).setDepth(81));
    ui.push(this.add.text(cx - 180, cy + 6, d.name, { fontFamily: 'monospace', fontSize: 14, color: '#f4f4f4' }).setOrigin(0.5).setDepth(81));
    ui.push(this.add.text(cx - 180, cy + 24, entry.kind === 'boss' ? (d.title || role) : role,
      { fontFamily: 'monospace', fontSize: 10, color: '#' + ('00000' + tint.toString(16)).slice(-6) }).setOrigin(0.5).setDepth(81));
    if (entry.realmName) ui.push(this.add.text(cx - 180, cy + 40, '· ' + entry.realmName + ' ·',
      { fontFamily: 'monospace', fontSize: 9, color: FAINT }).setOrigin(0.5).setDepth(81));

    // stat block
    var sy = cy - 112;
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
      // M5.7: cap the pattern list so a big kit (the Engineer's 13 verbs) can't
      // overflow the codex panel under the hints (text-fit, note 11). The full
      // tactical read still lives in the scouter's ≤6 hints.
      var pk, pkeys = [], PMAX = 7;
      for (pk in d.patterns) pkeys.push(pk);
      pkeys.slice(0, PMAX).forEach(function (pk2) {
        var pat = d.patterns[pk2];
        // not every verb is a projectile — scene-owned verbs (timber, ghost
        // train, reactor overload…) have no count/shots.
        var desc = pat.lobs ? (pat.lobs + ' marked impact circles')
                 : (pat.count && pat.radius) ? (pat.count + ' telegraphed slams')
                 : (pat.count && pat.keys) ? 'calls the line for help'
                 : pat.count ? (pat.count + ' bolts in a ring')
                 : pat.shots ? (pat.shots + ' aimed bolts')
                 : 'a telegraphed strike';
        var dmgTxt = (pat.dmg != null && pat.dmg < 9999) ? (' · ' + pat.dmg + ' dmg') : '';
        var everyTxt = pat.everyMs ? (' · every ' + (pat.everyMs / 1000) + 's') : '';
        notes.push(pk2.toUpperCase() + ' — ' + desc + dmgTxt + everyTxt);
      });
      if (pkeys.length > PMAX) notes.push('…and ' + (pkeys.length - PMAX) + ' more moves — read the scouter.');
      (d.hints || []).forEach(function (h) { notes.push(h); });
    }
    var ny = cy + 60;
    notes.forEach(function (n) {
      var t = self.add.text(cx - 285, ny, '· ' + n,
        { fontFamily: 'monospace', fontSize: 10, color: FAINT, wordWrap: { width: 570 } }).setDepth(81);
      ny += t.height + 6;
      ui.push(t);
    });

    ui.push(this.add.text(cx, cy + 236,
      '[ ◀ ▶ browse · ▲ ▼ change map · type to search · ESC close ]',
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
    if (near && !this.vaultUi && !this.gyUi && !this.consoleUi && !this.bestiaryUi) {   // AUDIT #8: bestiary guard
      if (this.rig.interactJustDown()) this.enterPortal(near);
    }
  },

  enterPortal: function (entry) {
    if (this.entering) return;
    this.entering = true;
    this.powerDown();                                    // the works go dark behind you
    AUDIO.stopMusic();                                   // M3.9: the chamber falls silent
    persist();
    AUDIO.play('portal');
    this.cameras.main.fadeOut(400);
    var self = this;
    this.time.delayedCall(450, function () {
      // M3.5 ONE-SHOT — consumed HERE, not at the walk-in (audit fix
      // 2026-07-14): a resize/fullscreen restart during the 450ms fade
      // cancels this call; consuming early meant the rebuilt chamber had no
      // portal AND no run — the whole config was lost. Now a cancelled entry
      // simply leaves the portal standing to walk into again.
      self.registry.remove('pendingPortal');
      self.scene.start('Realm', { mode: entry.mode, map: entry.map, affixes: entry.affixes || [] });   // M5.0: map rides in
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
    // HI-FI WORLD (2026-07-14: the DEFAULT realm — hifiWorldOn() is hardwired
    // true once its textures build): the TRAIN YARD replaces the map path.
    // Classic map path survives below as a real fallback (art module absent).
    // AUDIT FIX 2026-07-14: an EXPLICIT mapId (the builder's PLAYTEST ▶
    // button) takes the map path — the hardwired train yard was silently
    // swallowing the map under edit, killing builder playtests. Normal portal
    // runs pass no mapId and get the yard.
    // M5.0: REALM ROUTING — the portal's map choice (cfg.map) picks the entry
    // in DATA.realms; biome/boss/world-kind/music resolve from it. No map in
    // the start data (old suites, direct starts) = the train yard, unchanged.
    this.realmId = (data && data.map && DATA.realms && DATA.realms[data.map]) ? data.map : 'trainyard';
    this.realmDef = (DATA.realms && DATA.realms[this.realmId]) ||
                    { name: DATA.realm.name, biome: DATA.realm.biome, boss: DATA.realm.boss, kind: 'yard', music: 'battle' };
    this.realmBiome = this.realmDef.biome;
    this.realmBoss = this.realmDef.boss;
    // SCENE REUSE (bug #1 family): the yard's train state must not leak into
    // a grove run (and vice versa) — reset both worlds' handles before setup.
    this.train = null; this.trainLanes = null; this.arrivalTrain = null;
    this.groveFall = null; this.groveTrunks = []; this.heartwood = null; this.arrivalGrove = false;
    // M5.6 graveyard handles (scene reuse — reset before setup)
    this.witching = null; this.graveFences = null; this.graveGate = null; this.soulWisps = null;
    this.gasPatches = null; this.graveArrivalActive = false; this.reaper = null; this._realmStart = null;
    this.gravekeeperWaves = null;
    this.hifiWorld = !!(typeof TEX !== 'undefined' && TEX.hifiWorldOn && TEX.hifiWorldOn())
                     && !(data && data.mapId);
    this.map = this.hifiWorld ? null : MAPS.get((data && data.mapId) || DATA.realm.map);
    var WW, HH;
    if (this.map) {
      WW = this.map.w * MAPS.TILE; HH = this.map.h * MAPS.TILE;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.mapRender = MAPS.renderChunks(this, this.map, 'realm', 1);
      this.wallBodies = MAPS.buildWallBodies(this, this.map);
    } else if (this.hifiWorld && this.realmDef.kind === 'grove') {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.wallBodies = null;
      this.setupGrove(WW, HH);                              // M5.0: the enchanted forest
    } else if (this.hifiWorld && this.realmDef.kind === 'graveyard') {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.wallBodies = null;
      this.setupGraveyard(WW, HH);                          // M5.6: the moonlit cemetery
    } else if (this.hifiWorld && this.realmDef.kind === 'factory') {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.wallBodies = null;
      this.setupFactory(WW, HH);                            // M5.7: the robotics factory
    } else if (this.hifiWorld && MAPS.defs && MAPS.defs[this.realmId] &&
               MAPS.defs[this.realmId].scene && MAPS.defs[this.realmId].scene.setup) {
      // M7 REGISTRY: a FOLDER-REGISTERED realm (maps 5-20) owns its terrain.
      // setup() MUST reset all its own instance state (scene reuse, bug #1)
      // and may set this._realmStart (graveyard pattern). Colliders that need
      // the groups wire in scene.afterCreate below.
      WW = HH = MAPS.defs[this.realmId].worldSize || DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.wallBodies = null;
      MAPS.defs[this.realmId].scene.setup(this, WW, HH);
    } else if (this.hifiWorld) {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.wallBodies = null;
      this.setupTrainYard(WW, HH);                          // gravel arena + tracks + tunnels + the train
    } else {
      WW = HH = DATA.realm.size;
      this.physics.world.setBounds(0, 0, WW, HH);
      this.add.tileSprite(WW / 2, HH / 2, WW, HH, DATA.biomes[this.realmBiome].tile);  // E7: biome floor
      this.wallBodies = null;
    }
    this.worldW = WW; this.worldH = HH;
    this.cameras.main.setBounds(0, 0, WW, HH).setBackgroundColor('#0f0f1b');

    // player start comes from the map's object layer (center fallback).
    // M5.6: the graveyard spawns you at the SOUTH iron gate (setupGraveyard).
    var start = this._realmStart || { x: WW / 2, y: HH / 2 };
    if (this.map && this.map.objects.playerStart) {
      start = MAPS.findClearPx(this.map,
        (this.map.objects.playerStart.tx + 0.5) * MAPS.TILE,
        (this.map.objects.playerStart.ty + 0.5) * MAPS.TILE);
    }
    // M5.5: gear REMAINS — a fresh hero auto-fills EMPTY slots from the best
    // owned (collected) gear before spawning. Fill-empty only, so a manual
    // downgrade equipped for testing is never yanked back up.
    // M6c (Red): "White-gear test" (Settings) instead LOCKS the weakest starter
    // set every entry, so balance testing stays in white gear across deaths.
    if (SAVE.settings().whiteTest) equipWhiteSet();
    else autoEquipFromCollection(false);
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
    this.time.paused = false;                    // M7k: scene reuse — never inherit a frozen timer plane
    this._scanStartAt = 0;                       // M7k: scouter freeze clock (scene reuse)
    this.looting = false; this.lootUi = null; this.pendingLoot = null; // E1: chest overlay
    this.lootItems = [];                                           // M3: chest gear rows
    this.chest = null; this.interactables = []; this.promptText = null; // E1/Q6
    this.championKills = 0;                    // E9 v2: bounty rolls for the boss chest
    // M5.0 grove state (scene reuse — reset EVERYTHING)
    this.glowPatches = [];                     // bloom-pixie resurrection trail
    this.corpses = [];                         // recent mob deaths (revive targets)
    this._spawnQueue = [];                     // mechanic spawns, drained once per frame
    this._reviveTarget = null;                 // phase-two: where the pixies fly
    this._reviveState = null;                  // phase-two channel bookkeeping
    this._immuneAt = {};                       // 'IMMUNE' popup rate limit per mob id
    wireFullscreen(this);

    // pooled groups (TM-3/TM-5)
    this.mobs = this.physics.add.group({ maxSize: DATA.waves.maxAlive + 10 });
    this.playerShots = this.physics.add.group({ maxSize: 220 });
    this.enemyShots = this.physics.add.group({ maxSize: 300 });
    this.tornadoes = this.physics.add.group({ maxSize: 24 });   // M4: Knight whirlwind tornado pool
    this.slimePatches = [];                                      // M4.9: conductor-zombie slime hazard pool
    this.playerInFog = false; this._lastSlimeTickAt = 0;        // M4.9: smog fog + slime tick clock
    // (the Wizard's storm-orb pool retired 2026-07-13 — the ARCANE BARRAGE
    //  machine gun fires plain playerShots; see Entities.channelBarrage)
    this.whirlFx = null;                                        // M4: Knight whirlwind ring VFX

    this.physics.add.collider(this.mobs, this.mobs);
    if (this._trunkColliderPending) this.wireGroveColliders();   // M5.0: fallen-trunk walls
    if (this._fenceColliderPending) this.wireGraveyardColliders();  // M5.6: destructible iron fences
    if (this._factoryColliderPending) this.wireFactoryColliders();  // M5.7: prototype-bay pillars
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

    // player shots hit mobs (pierce tracks per-mob hits). M4: a frost bolt
    // (shot.proj.slow) also SLOWS what it pierces (Entities.applySlow); a
    // barrage lightning ball (shot.proj.strike) can PROC A LIGHTNING BOLT
    // down onto its victim (SIM.rng — seam rule 4).
    this.physics.add.overlap(this.playerShots, this.mobs, function (shot, mob) {
      if (!shot.active || !mob.active) return;
      // M4.9 SMOG: a mob concealed by a serpent's fog can't be hit from OUTSIDE
      // the cloud — the shot passes through (not consumed, not marked) until the
      // player is standing in the fog too.
      if (mob.mob.concealed && !self.playerInFog) return;
      if (shot.proj.hits[mob.id]) return;
      shot.proj.hits[mob.id] = true;
      Entities.hurtMob(self, mob, shot.proj.dmg, self.time.now);
      if (shot.proj.slow) Entities.applySlow(mob, shot.proj.slow, self.time.now);
      if (shot.proj.burn) Entities.applyBurn(mob, shot.proj.burn, self.time.now);   // M4.6 fire volley
      if (shot.proj.strike && SIM.rng() < shot.proj.strike.chance) {
        self.lightningStrike(mob.x, mob.y, shot.proj.strike);
      }
      if (shot.proj.explode) self.arrowExplode(shot.x, shot.y, shot.proj.explode, mob);  // M5.1 set arrows
      if (!shot.proj.pierce) Entities.killProjectile(self.playerShots, shot);
    });

    // enemy shots hit player (src is "a Warlock" / "The Grovekeeper")
    this.physics.add.overlap(this.enemyShots, this.player, function (playerObj, shot) {
      if (!shot.active) return;
      var killer = shot.proj.src ? shot.proj.src + "'s bolt" : 'a magic bolt';
      var fromBoss = !!shot.proj.fromBoss;                 // M4.6: boss bolts hit harder per class
      Entities.killProjectile(self.enemyShots, shot);
      Entities.hurtPlayer(self, self.player, shot.proj.dmg, self.time.now, killer, fromBoss);
    });

    // chaser contact damage (ticked — TM-2 i-frames still apply)
    this.physics.add.overlap(this.player, this.mobs, function (playerObj, mob) {
      if (!mob.active || !mob.mob.def.chase) return;
      if (self.time.now - mob.mob.lastContactAt < DATA.combat.contactTickMs) return;
      mob.mob.lastContactAt = self.time.now;
      // M5.4: contact damage scales with the mob's level mult
      var cDmg = Math.max(DATA.combat.minDamage, Math.round(mob.mob.def.chase.contactDmg * (mob.mob.dmgMult || 1)));
      Entities.hurtPlayer(self, self.player, cDmg, self.time.now, 'a ' + mob.mob.def.name);
      // M4.7 DETONATE (Dynamite Mole): his contact hit IS his death — one big
      // boom, no XP (he blew himself up; nobody earned that).
      if (mob.mob.def.detonate && mob.active) {
        self.burst(mob.x, mob.y, 14, mob.mob.def.deathTint);
        self.cameras.main.shake(160, 0.008);
        try { AUDIO.play('thud'); } catch (e) {}
        Entities.clearNameTag(mob); mob.body.enable = false; self.mobs.killAndHide(mob);
      }
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

    // M7 REGISTRY: groups + core colliders exist now — the map wires its own
    // (fence groups, hazard overlaps, ambient cycles) here.
    var MREG = MAPS.forScene ? MAPS.forScene(this) : null;
    if (MREG && MREG.scene && MREG.scene.afterCreate) MREG.scene.afterCreate(this);

    this.buildHud();
    this.wireEvents();
    AUDIO.play('portal');
    // M4.5: BATTLE MUSIC — "Swarmfront" (original) drives the whole realm; it
    // cuts out the moment the fight is decided (boss down / horn / death), so
    // the silence itself is the release. playMusic is idempotent (resize-safe).
    AUDIO.playMusic((this.realmDef && this.realmDef.music) || 'battle');   // M5.0: per-realm theme
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
    // M7k AUDIT (2026-07-17): freeze the timer plane too. Map verbs resolve
    // windup damage through time.delayedCall — without this, a telegraphed
    // hit (backhand, gaze, fire breath, water gun…) elapsed BEHIND the ESC
    // menu and landed on the frozen player (the old train-telegraph bug class,
    // now closed for every delayedCall at once). Menu code uses setTimeout.
    this.time.paused = true;
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
    this.time.paused = false;                    // M7k: timer plane thaws with us
    var dt = this.time.now - this.pausedAt;
    this.startedAt += dt;                        // realm clock ignores paused time
    // AUDIT FIX 2026-07-14: the scene clock keeps running while paused, so
    // EVERY absolute time-stamp must shift by the paused duration — not just
    // shot lifetimes. Before this, pausing ate tornado lifetimes, frost slows,
    // splitter forks, boss pattern cooldowns, and (worst) the train telegraph:
    // the horn's 1300ms warning could fully elapse behind the ESC menu and the
    // instakill train launched the same frame the menu closed.
    var shift = function (g) { g.children.iterate(function (s) {
      if (!s || !s.active) return;
      s.proj.dieAt += dt;
      if (s.proj.splitAt) s.proj.splitAt += dt;            // E9 splitter fork point
    }); };
    shift(this.playerShots); shift(this.enemyShots);
    if (this.tornadoes) this.tornadoes.children.iterate(function (t) {
      if (!t || !t.active) return;
      t.tornado.dieAt += dt;
      for (var k in t.tornado.hits) t.tornado.hits[k] += dt;   // re-hit clocks
    });
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active || !m.mob) return;
      if (m.mob.slowUntil) m.mob.slowUntil += dt;                            // frost slows
      if (m.mob.burnUntil) { m.mob.burnUntil += dt; m.mob.nextBurnAt += dt; } // M4.6 fire burns
      if (m.mob.fuseAt) m.mob.fuseAt += dt;                                  // M4.9 mole bomb
      if (m.mob.lastSlimeAt) m.mob.lastSlimeAt += dt;                        // M4.9 zombie slime cadence
      if (m.mob.fogPhaseAt) m.mob.fogPhaseAt += dt;                          // M4.9 serpent fog phase
      // M5.0 grove mob clocks
      if (m.mob.nextBlinkAt) m.mob.nextBlinkAt += dt;                        // pixie blink
      if (m.mob.castUntil) { m.mob.castUntil += dt; m.mob.castStart += dt; } // brute SUMMON cast
      if (m.mob.nextSummonAt) m.mob.nextSummonAt += dt;                      // bloom-pixie summon
      if (m.mob.lastGlowAt) m.mob.lastGlowAt += dt;                          // glow-trail cadence
      // M5.6 graveyard mob clocks
      if (m.mob.lungeUntil) m.mob.lungeUntil += dt;                          // ghoul lunge windup/dash
      if (m.mob.nextLungeAt) m.mob.nextLungeAt += dt;                        // ghoul lunge cooldown
      if (m.mob.lastWailAt) m.mob.lastWailAt += dt;                          // banshee wail cadence
      if (m.mob.wailUntil) m.mob.wailUntil += dt;                            // banshee wail cast
      if (m.mob.lastHitAt) m.mob.lastHitAt += dt;                            // golem regen idle window
      if (m.mob.nextRegenAt) m.mob.nextRegenAt += dt;                        // golem regen tick
      if (m.mob.nextRaiseAt) m.mob.nextRaiseAt += dt;                        // acolyte raise cadence
      if (m.mob.surgeUntil) m.mob.surgeUntil += dt;                          // cursed-bell speed surge
    });
    // M4.9: slime hazard lifetimes + the player slime-tick clock
    if (this.slimePatches) this.slimePatches.forEach(function (s) { if (s && !s.dead) s.dieAt += dt; });
    if (this._lastSlimeTickAt) this._lastSlimeTickAt += dt;
    if (this.boss && this.boss.active) {
      var bs = this.boss.boss;
      bs.nextRadialAt += dt; bs.nextStreamAt += dt;
      if (bs.streamLeft > 0) bs.nextStreamShotAt += dt;
      if (bs.burnUntil) { bs.burnUntil += dt; bs.nextBurnAt += dt; }         // M4.6 fire burns
      // M4.7: the Conductor's pattern clocks are absolute too
      if (bs.def.patterns.ghostTrain) {
        ['nextTrainAt', 'nextTiesAt', 'nextSchedAt', 'nextLanternAt',
         'lanternUntil', 'nextLanternTickAt', 'lastLanternAt'].forEach(function (k) {
          if (bs[k]) bs[k] += dt;
        });
      }
      // M5.0: the Grovekeeper's verb clocks
      if (bs.def.patterns.timber) {
        ['nextTimberAt', 'nextMortarAt', 'nextOvergrowthAt', 'nextSunlanceAt',
         'nextSurgeAt', 'sunUntil', 'nextSunTickAt', 'lastSunAt'].forEach(function (k) {
          if (bs[k]) bs[k] += dt;
        });
      }
      // M5.6: the Gravekeeper's Necronomicon verb clocks
      if (bs.def.waves) {
        ['nextExplodeAt', 'nextHandsAt', 'nextSigilAt', 'reaperAt'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
      // M5.7/M6e: the Grand Engineer's / 130C-4's verb cadence clocks
      if (bs.def.floorLift) {
        ['nextPressAt', 'nextArcAt', 'nextTurretAt', 'nextCallAt',
         'nextDrillAt', 'nextScrapAt', 'nextConeAt', 'nextStampAt', 'nextOverrideAt',
         'nextReactorAt', 'ventedUntil', 'rootUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    }
    // M5.0 grove scene clocks: falling trees, lingering trunks, glow patches,
    // corpse ledger, the phase-two channel
    if (this.groveFall) {
      if (this.groveFall.nextAt && this.groveFall.nextAt !== Infinity) this.groveFall.nextAt += dt;
      if (this.groveFall.fall && this.groveFall.fall.warnUntil) this.groveFall.fall.warnUntil += dt;
    }
    if (this.timberFall && this.timberFall.warnUntil) this.timberFall.warnUntil += dt;
    if (this.groveTrunks) this.groveTrunks.forEach(function (r2) { r2.dieAt += dt; });
    if (this.glowPatches) this.glowPatches.forEach(function (g2) { if (!g2.dead) g2.dieAt += dt; });
    if (this.corpses) this.corpses.forEach(function (c2) { c2.at += dt; });
    if (this._reviveState) this._reviveState.until += dt;
    // M5.6 graveyard scene clocks: the Witching Cycle + hazards + player curse
    if (this.witching) {
      var W = this.witching;
      if (W.nextGraveAt && W.nextGraveAt !== Infinity) W.nextGraveAt += dt;
      if (W.grave && W.grave.eruptAt) W.grave.eruptAt += dt;
      if (W.nextBellAt && W.nextBellAt !== Infinity) W.nextBellAt += dt;
      if (W.nextTollAt) W.nextTollAt += dt;
      if (W.surgeUntil) W.surgeUntil += dt;
    }
    if (this.gasPatches) this.gasPatches.forEach(function (g) { g.dieAt += dt; if (g.lastTick) g.lastTick += dt; });
    if (this.soulWisps) this.soulWisps.forEach(function (s) { s.dieAt += dt; });
    if (this.graveFences) this.graveFences.forEach(function (f) { if (f.lastChewAt) f.lastChewAt += dt; });
    // M5.7/M6e factory scene clocks: the transform cutscene, boss FX telegraphs
    // (drill lane / cone / stamp waves / zone warns), the conveyor surge,
    // coolant slow-field patches (map phase), deployed turrets, spark cadence.
    if (this._engineerXform && this._engineerXform.until) this._engineerXform.until += dt;
    if (this.engineerFx) { var EF = this.engineerFx;
      ['reactorUntil'].forEach(function (k) { if (EF[k]) EF[k] += dt; });
      ['drill', 'cone'].forEach(function (k) { if (EF[k] && EF[k].until) EF[k].until += dt; });
      if (EF.stamp) { if (EF.stamp.aAt) EF.stamp.aAt += dt; if (EF.stamp.bAt) EF.stamp.bAt += dt; } }
    if (this._zoneWarns) this._zoneWarns.forEach(function (w) { if (w.until) w.until += dt; });
    if (this.conveyorSurge && this.conveyorSurge.until) this.conveyorSurge.until += dt;
    if (this.coolantPatches) this.coolantPatches.forEach(function (p) { if (!p.dead) p.dieAt += dt; });
    if (this.factoryTurrets) this.factoryTurrets.forEach(function (t) { if (t.fireAt) t.fireAt += dt; if (t.offAt) t.offAt += dt; });
    if (this.factory && this.factory.nextSparkAt) this.factory.nextSparkAt += dt;
    // M7 REGISTRY: the map shifts EVERY absolute clock it owns (the #1
    // recurring bug family — each map's PLAN.md carries its shift list).
    var MRF = MAPS.forScene ? MAPS.forScene(this) : null;
    if (MRF && MRF.scene && MRF.scene.unfreeze) MRF.scene.unfreeze(this, dt);
    if (this.player.state.curseUntil) { this.player.state.curseUntil += dt; if (this.player.state.curseNextAt) this.player.state.curseNextAt += dt; }
    if (this.ghostTrain && this.ghostTrain.warnUntil) this.ghostTrain.warnUntil += dt;   // M4.7 ghost track
    if (this.player.state.slowUntil) this.player.state.slowUntil += dt;                  // M4.7 the schedule
    if (this.train) {                                       // train phase clocks
      if (this.train.nextAt) this.train.nextAt += dt;
      if (this.train.warnUntil) this.train.warnUntil += dt;
    }
    if (!this.hitstopActive && !this.scanning && !this.looting) this.physics.world.resume();
    // the director resumes only if nothing upstream stood it down (boss flow,
    // E2 wipe, chest pending) — fixes a latent unpause-restarts-the-swarm bug
    this.spawnEvent.paused = !!(this.bossPortal || this.boss || this.pendingLoot || this.closing);
    this.tweens.resumeAll();
    AUDIO.play('ui');
  },

  // ------------------------------------------------- M2: BOSS FLOW (F8) --
  banner: function (msg, color) {
    var self = this;
    // one banner at a time — a new one REPLACES the old so they never overlap
    if (this._bannerText && this._bannerText.active) { try { this._bannerText.destroy(); } catch (e) {} }
    var t = this.add.text(this.scale.width / 2, this.scale.height * 0.28, msg,
      { fontFamily: 'monospace', fontSize: 26, color: color || '#ffcd75', align: 'center' })
      .setScrollFactor(0).setOrigin(0.5).setDepth(70);
    this._bannerText = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 700,
      onComplete: function () { try { t.destroy(); } catch (e) {} if (self._bannerText === t) self._bannerText = null; } });
  },

  // M5.6 WAVE REVEAL (Red): a GTA-VI-logo-style title card — "WAVE N" in big
  // block letters with an UNDEAD SCENE poured inside the glyphs (ecto→green→rune
  // gradient, zombie hands clawing up, bone highlights, ecto glints), a bone
  // outline, drop shadow, and a soft green glow. A real graphic that POPS in,
  // not flat tinted text. Screen-space; scales/fades as one.
  waveReveal: function (waveIdx, label) {
    var self = this, W = this.scale.width, H = this.scale.height;
    var cx = W / 2, cy = H * 0.16, txt = 'WAVE ' + (waveIdx + 1);
    var FS = Math.max(56, Math.min(132, Math.floor(W / 7))), DEP = 74;
    var FONT = { fontFamily: 'monospace', fontSize: FS, fontStyle: 'bold' };
    var pieces = [];
    var maskText = this.add.text(cx, cy, txt, { fontFamily: 'monospace', fontSize: FS, fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(0.5).setScrollFactor(0).setVisible(false);
    var tw = maskText.width + 22, th = maskText.height + 14;
    // (no glow halo — Red: just the letters)
    // drop shadow
    pieces.push(this.add.text(cx + FS * 0.05, cy + FS * 0.06, txt, { fontFamily: 'monospace', fontSize: FS, fontStyle: 'bold', color: '#08080c' }).setOrigin(0.5).setScrollFactor(0).setDepth(DEP - 1));
    // DARK HALO OUTLINE behind the fill — a thick near-black stroke so every glyph
    // (esp. the wide number) has a crisp, unmistakable silhouette. Red: "the
    // numbers aren't legible" — the busy bone fill was merging with the edges.
    pieces.push(this.add.text(cx, cy, txt, { fontFamily: 'monospace', fontSize: FS, fontStyle: 'bold', color: 'rgba(0,0,0,0)', stroke: '#04100a', strokeThickness: Math.max(12, FS * 0.16) }).setOrigin(0.5).setScrollFactor(0).setDepth(DEP));
    // UNDEAD SCENE fill (drawn centered at 0,0; positioned at cx,cy so it scales about center)
    var g = this.add.graphics().setScrollFactor(0).setDepth(DEP + 1).setPosition(cx, cy);
    var lc = function (a, b, t) { return (Math.round(a[0] + (b[0] - a[0]) * t) << 16) | (Math.round(a[1] + (b[1] - a[1]) * t) << 8) | Math.round(a[2] + (b[2] - a[2]) * t); };
    // GREEN gradient, DARKER now so the fill reads as texture INSIDE the glyph
    // rather than competing with the bright bone edge (keeps digits legible).
    var TOP = [0x7c, 0xd8, 0x9a], MID = [0x2c, 0x84, 0x50], BOT = [0x0c, 0x2a, 0x1a];
    for (var yy = 0; yy < th; yy++) { var tt = yy / th; g.fillStyle(tt < 0.5 ? lc(TOP, MID, tt * 2) : lc(MID, BOT, (tt - 0.5) * 2), 1); g.fillRect(-tw / 2, -th / 2 + yy, tw, 1); }
    // (no bone / zombie-hand fill — Red: "remove bone fill from all of it" — the
    // clawing hands were breaking up the digit shapes. Just the green gradient
    // inside the glyphs; the crisp outlines carry the undead read.)
    g.setMask(maskText.createBitmapMask());
    pieces.push(g);
    // bright bone block-letter OUTLINE on top — the crisp readable edge
    pieces.push(this.add.text(cx, cy, txt, { fontFamily: 'monospace', fontSize: FS, fontStyle: 'bold', color: 'rgba(0,0,0,0)', stroke: '#f4e3c2', strokeThickness: Math.max(7, FS * 0.075) }).setOrigin(0.5).setScrollFactor(0).setDepth(DEP + 2));
    // (no subtitle — Red: the wave-name text under it was unreadable; just the letters)
    // SLIDE ON from the left → hold near the top → SLIDE OFF to the right. All
    // pieces (glyph fill, mask, outlines, shadow) move by the SAME relative delta
    // each frame so the bitmap mask stays aligned to the fill mid-flight.
    var all = pieces.concat([maskText]);
    var SL = W * 0.95;
    all.forEach(function (o) { o.x -= SL; o.setAlpha(0); });   // parked off the left edge
    this.tweens.add({ targets: all, x: '+=' + SL, alpha: 1, duration: 520, ease: 'Back.Out' });  // sweep in + settle
    this.cameras.main.shake(150, 0.003);
    try { AUDIO.play('belltoll'); } catch (e) {}
    this.time.delayedCall(1650, function () {
      self.tweens.add({ targets: all, x: '+=' + SL, alpha: 0, duration: 460, ease: 'Back.In',   // wind up + launch off the right
        onComplete: function () { try { g.clearMask(true); } catch (e) {} all.forEach(function (o) { try { o.destroy(); } catch (e2) {} }); } });
    });
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
    // M4.9: clear lingering slime patches with the swarm (fog/warn rings ride
    // on the mobs and were cleared by clearNameTag above)
    if (this.slimePatches) { this.slimePatches.forEach(function (s) { if (s.obj && s.obj.active) { try { s.obj.destroy(); } catch (e) {} } }); this.slimePatches = []; }
    this.playerInFog = false;
    // M5.0: the grove's revival machinery dies with the swarm too — no queued
    // spawns, no glow patches, no corpses for a pixie that no longer exists
    if (this.glowPatches) { this.glowPatches.forEach(function (g2) { if (g2.obj && g2.obj.active) { try { g2.obj.destroy(); } catch (e) {} } }); this.glowPatches = []; }
    this.corpses = [];
    this._spawnQueue = [];
    // M5.6: the graveyard's hazard pools die with the swarm too
    if (this.gasPatches) { this.gasPatches.forEach(function (g) { if (g.obj && g.obj.active) { try { g.obj.destroy(); } catch (e) {} } }); this.gasPatches = []; }
    if (this.soulWisps) { this.soulWisps.forEach(function (s) { if (s.spr && s.spr.active) { try { s.spr.destroy(); } catch (e) {} } }); this.soulWisps = []; }
    if (this.witching && this.witching.grave && this.witching.grave.ring) { try { this.witching.grave.ring.destroy(); } catch (e) {} this.witching.grave = null; }
    if (this.clearReaper) this.clearReaper();               // M5.6: the reaper marches no more
    // M5.7: the factory's coolant slow-field patches die with the swarm too
    if (this.coolantPatches) { this.coolantPatches.forEach(function (p) { if (p.obj && p.obj.active) { try { p.obj.destroy(); } catch (e) {} } }); this.coolantPatches = []; }
    // M7 REGISTRY: the map's hazard pools die with the swarm too
    var MRA = MAPS.forScene ? MAPS.forScene(this) : null;
    if (MRA && MRA.scene && MRA.scene.annihilate) MRA.scene.annihilate(this);
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
    // M7k AUDIT (2026-07-17): registry maps have no this.map, so barrier maps
    // (neon canyon / vice-versa river of souls / prehistoria river) could get
    // the portal placed INSIDE an impassable strip → run softlocked. The map's
    // bossPortalSpot hook nudges it somewhere reachable.
    var MPP = (typeof MAPS !== 'undefined' && MAPS.forScene) ? MAPS.forScene(this) : null;
    if (MPP && MPP.scene && MPP.scene.bossPortalSpot) {
      var ps2 = MPP.scene.bossPortalSpot(this, x, y);
      if (ps2) { x = ps2.x; y = ps2.y; }
    }
    this.bossPortal = this.physics.add.staticSprite(x, y, TEX.nexusKey('portal')).setScale(TEX.nexusScale('portal', 3)).setTint(0xb13e53).setDepth(6);
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

    var def = DATA.bosses[this.realmBoss || DATA.realm.boss];   // M5.0: per-realm boss
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
    // M4.7: THE CONDUCTOR ARRIVES ON HIS TRAIN (user, 2026-07-14) — the Styx
    // Express steams in, brakes, and he steps off; THEN the scouter + fight.
    // Bosses without an `arrival` block (the Grovekeeper on future maps) keep
    // the classic instant spawn.
    if (def.arrival && this.trainLanes && this.textures.exists('ghostLoco')) {
      this.conductorArrival(def, bx, by);
    } else if (def.treeArrival && this.heartwood) {
      // M5.0: THE HEARTWOOD WAKES — the Grovekeeper steps out of the great tree
      this.grovekeeperArrival(def);
    } else if (def.graveArrival && this.arenaGrave) {
      // M5.6: THE GRAVEKEEPER climbs out of the arena grave
      this.gravekeeperArrival(def);
    } else if (def.floorLift && this.arenaBay) {
      // M5.7: THE GRAND ENGINEER rises through the floor on the hydraulic lift
      this.engineerArrival(def);
    } else if (def.mapOwned && MAPS.forScene && MAPS.forScene(this) &&
               MAPS.forScene(this).scene.bossArrival) {
      // M7 REGISTRY: the map stages its own arrival (hatch / cinematic / lift)
      // and MUST end in scene.spawnBossNow(def, x, y) + scene.showScouter(def).
      MAPS.forScene(this).scene.bossArrival(this, def, bx, by);
    } else {
      this.spawnBossNow(def, bx, by);
      this.showScouter(def);                             // E3: the workup sheet
    }
  },

  // The actual boss materialization — spawn, colliders, HP bar, overlaps.
  // (Extracted from startBossFight for the M4.7 arrival cinematic.)
  spawnBossNow: function (def, bx, by) {
    var self = this;
    this.boss = Entities.spawnBoss(this, this.realmBoss || DATA.realm.boss, bx, by, this.time.now);
    if (this.wallBodies) this.physics.add.collider(this.boss, this.wallBodies);   // M3: bosses respect walls
    this.banner(def.name.toUpperCase() + '\n' + (def.title ? def.title.toLowerCase() : 'guardian of ' + DATA.realm.name), '#b13e53');

    // boss HP bar (top center)
    var W = this.scale.width;
    this.bossBarBg = this.add.rectangle(W / 2, 18, 320, 14, 0x1a1c2c).setScrollFactor(0).setDepth(52);
    this.bossBar = this.add.rectangle(W / 2 - 159, 19, 318, 12, 0xb13e53).setOrigin(0, 0.5).setScrollFactor(0).setDepth(53);
    this.bossName = this.add.text(W / 2, 34, def.name, { fontFamily: 'monospace', fontSize: 11, color: '#b13e53' }).setScrollFactor(0).setOrigin(0.5, 0).setDepth(53);

    // player shots hurt the boss (pierce tracked like mobs; the barrage's
    // lightning-bolt proc lands on bosses too — M4 storm barrage)
    this.physics.add.overlap(this.playerShots, this.boss, function (boss, shot) {
      if (!shot.active || !boss.active) return;
      if (shot.proj.hits[boss.id]) return;
      shot.proj.hits[boss.id] = true;
      Entities.hurtBoss(self, boss, shot.proj.dmg);
      if (shot.proj.burn) Entities.applyBurn(boss, shot.proj.burn, self.time.now);   // M4.6: the boss burns too
      if (shot.proj.strike && SIM.rng() < shot.proj.strike.chance) {
        self.lightningStrike(boss.x, boss.y, shot.proj.strike);
      }
      if (shot.proj.explode) self.arrowExplode(shot.x, shot.y, shot.proj.explode, null);  // M5.1 set arrows
      if (!shot.proj.pierce) Entities.killProjectile(self.playerShots, shot);
    });
    // boss contact damage (ticked, i-frames still apply)
    this.physics.add.overlap(this.player, this.boss, function (playerObj, boss) {
      if (!boss.active) return;
      if (self.time.now - boss.boss.lastContactAt < DATA.combat.contactTickMs) return;
      boss.boss.lastContactAt = self.time.now;
      Entities.hurtPlayer(self, self.player, boss.boss.def.contactDmg, self.time.now, def.name, true);   // M4.6: boss source
    });

    if (def.patterns.ghostTrain) this.initConductor(this.boss, this.time.now);   // M4.7 pattern clocks
    if (def.patterns.timber) this.initGrovekeeper(this.boss, this.time.now);     // M5.0 grove verb clocks
    if (def.waves) this.initGravekeeper(this.boss, this.time.now);               // M5.6 wave loop + verbs
    if (def.floorLift) this.initEngineer(this.boss, this.time.now);              // M5.7 engineer/mech verbs
  },

  // ---------------------- M4.7: THE CONDUCTOR — ARRIVAL + TRAIN VERBS --------
  // The Styx Express pulls into the nearest lane, brakes at the arena point,
  // the Conductor steps off, the train departs. Tween-driven → pause-safe.
  // (Pausing mid-arrival lets the scene clock run — a 3s cinematic, accepted.)
  conductorArrival: function (def, bx, by) {
    var self = this, A = def.arrival;
    // nearest lane to the arena point
    var lane = this.trainLanes[0];
    for (var i = 1; i < this.trainLanes.length; i++)
      if (Math.abs(this.trainLanes[i].y - by) < Math.abs(lane.y - by)) lane = this.trainLanes[i];
    var dir = bx > this.worldW / 2 ? 1 : -1;             // approach from the FAR tunnel (long, dramatic)
    var stopX = Phaser.Math.Clamp(bx, 220, this.worldW - 220);
    var units = [];
    var loco = this.add.image(0, lane.y, 'loco').setDepth(30).setScale(120 / 96).setFlipX(dir < 0);
    var half = loco.displayWidth / 2;
    units.push({ spr: loco, off: 0 });
    var carScale = 108 / 88, off = half;
    for (var c = 0; c < (A.cars || 5); c++) {
      var car = this.add.image(0, lane.y, 'carBox' + (c % 4)).setDepth(30).setScale(carScale).setFlipX(dir < 0);
      var cHalf = car.displayWidth / 2;
      off += 10 + cHalf;
      units.push({ spr: car, off: off });
      off += cHalf;
    }
    var startX = dir > 0 ? -(half + off) : this.worldW + half + off;
    units.forEach(function (u) { u.spr.x = startX - dir * u.off; });
    this.arrivalTrain = units;
    try { AUDIO.play('trainhorn'); } catch (e) {}
    // the CAMERA goes to meet the train (the player may be far from the lane);
    // it snaps back to following the player when the scouter comes up.
    this.cameras.main.stopFollow();
    this.cameras.main.pan(stopX, lane.y, 700, 'Sine.easeInOut');
    this.cameras.main.shake(300, 0.004);
    var proxy = { x: startX };
    this.tweens.add({
      targets: proxy, x: stopX, duration: A.runInMs, ease: 'Cubic.Out',   // braking
      onUpdate: function () { units.forEach(function (u) { u.spr.x = proxy.x - dir * u.off; }); },
      onComplete: function () {
        try { AUDIO.play('trainpass'); } catch (e) {}                     // brake screech
        self.burst(stopX - dir * half * 0.6, lane.y - 30, 14, 0xd8dce4);  // steam
        self.cameras.main.shake(220, 0.006);
        self.time.delayedCall(A.puffMs, function () {
          // HE STEPS OFF — spawn at the cab, hop down toward the yard
          var offY = lane.y + 86;
          self.spawnBossNow(def, stopX, offY);
          if (self.boss) {
            self.boss.setPosition(stopX, lane.y + 30).setAlpha(0);
            self.tweens.add({ targets: self.boss, y: offY, alpha: 1, duration: A.stepOffMs, ease: 'Back.Out' });
          }
          try { AUDIO.play('thud'); } catch (e) {}
          // the Express departs while he cracks his knuckles
          var out = { x: stopX };
          self.tweens.add({
            targets: out, x: dir > 0 ? self.worldW + half + off + 40 : -(half + off + 40),
            duration: 1700, ease: 'Sine.In', delay: A.stepOffMs + 150,
            onUpdate: function () { units.forEach(function (u) { u.spr.x = out.x - dir * u.off; }); },
            onComplete: function () {
              units.forEach(function (u) { try { u.spr.destroy(); } catch (e) {} });
              self.arrivalTrain = null;
            }
          });
          self.time.delayedCall(A.stepOffMs + 100, function () {
            self.cameras.main.startFollow(self.player);   // back to the hero (snap hides behind the scouter)
            self.showScouter(def);
          });
        });
      }
    });
  },

  initConductor: function (b, time) {
    var cd = b.boss, P = cd.def.patterns;
    cd.nextTrainAt = time + 4200;
    cd.nextTiesAt = time + 2600;
    cd.nextSchedAt = time + 7000;
    cd.nextLanternAt = time + 5200;
    cd.lanternUntil = 0; cd.nextLanternTickAt = 0; cd.lanternAng = 0; cd.lastLanternAt = 0; cd.lanternDir = 1;
    this.ghostTrain = null;
    this.condFx = [];                                     // markers/ties for cleanup
  },

  // Pattern driver — called from Entities.updateBoss every frame the boss and
  // player are both alive. All timestamps here are ABSOLUTE (unfreeze shifts).
  conductorUpdate: function (b, player, time) {
    var cd = b.boss, P = cd.def.patterns;
    // GHOST TRACK → GHOST EXPRESS
    if (!this.ghostTrain && time >= cd.nextTrainAt) this.summonGhostTrack(b, time);
    var gt = this.ghostTrain;
    if (gt && gt.phase === 'warn') {
      gt.trackSpr.setAlpha(Math.floor(time / 110) % 2 === 0 ? 0.6 : 0.35);   // flashing rails
      if (time >= gt.warnUntil) this.launchGhostTrain(time);
    }
    // RAILROAD TIES
    if (time >= cd.nextTiesAt) { cd.nextTiesAt = time + P.ties.everyMs; this.throwTies(b, P.ties); }
    // THE SCHEDULE
    if (time >= cd.nextSchedAt) { cd.nextSchedAt = time + P.schedule.everyMs; this.snapSchedule(b, P.schedule, time); }
    // LANTERN SWEEP
    this.updateLantern(b, player, time);
  },

  summonGhostTrack: function (b, time) {
    var P = b.boss.def.patterns.ghostTrain;
    var horiz = SIM.rng() < 0.7;                          // gameplay roll — SIM.rng (seam rule 4)
    var gt = this.ghostTrain = {
      phase: 'warn', horiz: horiz, warnUntil: time + P.warnMs,
      dir: SIM.rng() < 0.5 ? 1 : -1, dmg: P.dmg, speed: P.speed
    };
    if (horiz) {
      gt.pos = Phaser.Math.Clamp(this.player.y, 130, this.worldH - 130);
      gt.trackSpr = this.add.tileSprite(this.worldW / 2, gt.pos, this.worldW, 96, 'track')
        .setDepth(-8).setTint(0x9fd8ff).setAlpha(0);
    } else {
      gt.pos = Phaser.Math.Clamp(this.player.x, 130, this.worldW - 130);
      gt.trackSpr = this.add.tileSprite(gt.pos, this.worldH / 2, this.worldH, 96, 'track')
        .setDepth(-8).setTint(0x9fd6ff).setAlpha(0).setAngle(90);
    }
    this.tweens.add({ targets: gt.trackSpr, alpha: 0.55, duration: 260 });
    try { AUDIO.play('trainhorn'); } catch (e) {}
    this.cameras.main.shake(280, 0.004);
  },

  launchGhostTrain: function (time) {
    var gt = this.ghostTrain;
    gt.phase = 'run';
    var span = gt.horiz ? this.worldW : this.worldH;
    var units = [], scale = 120 / 96, carScale = 108 / 88;
    var count = Math.round(3 + SIM.rng() * 5);            // 3..8 spectral cars
    var mk = function (scene, key, s) {
      var spr = scene.add.image(0, 0, key).setDepth(31).setScale(s).setAlpha(0.82);
      if (gt.horiz) spr.setFlipX(gt.dir < 0);
      else spr.setAngle(gt.dir > 0 ? 90 : -90);
      return spr;
    };
    var loco = mk(this, 'ghostLoco', scale);
    var half = (gt.horiz ? loco.displayWidth : loco.displayHeight) / 2;
    units.push({ spr: loco, off: 0, along: half * 0.9, across: (gt.horiz ? loco.displayHeight : loco.displayWidth) / 2 * 0.78 });
    var off = half;
    for (var i = 0; i < count; i++) {
      var car = mk(this, 'ghostCar', carScale);
      var cHalf = (gt.horiz ? car.displayWidth : car.displayHeight) / 2;
      off += 10 + cHalf;
      units.push({ spr: car, off: off, along: cHalf * 0.9, across: (gt.horiz ? car.displayHeight : car.displayWidth) / 2 * 0.78 });
      off += cHalf;
    }
    gt.units = units;
    gt.a = gt.dir > 0 ? -half : span + half;              // axis position of the loco
    gt.endA = gt.dir > 0 ? span + half + off : -(half + off);
    gt.lastRumble = 0;
    try { AUDIO.play('trainhorn'); } catch (e) {}
    this.cameras.main.shake(260, 0.006);
  },

  // Ghost-train MOVEMENT — driven from update() (not updateBoss) so a rolling
  // ghost express finishes its pass even if the player just died (same rule as
  // the ambush train). Gated on hitstop like the real train.
  updateGhostTrain: function (time, delta) {
    var gt = this.ghostTrain;
    if (!gt) return;
    if (gt.phase !== 'run') {
      // a WARN with no boss left (he died mid-summon) — fade the rails out
      if (gt.phase === 'warn' && (!this.boss || !this.boss.active)) this.clearGhostTrain();
      return;
    }
    gt.a += gt.dir * gt.speed * (delta / 1000);
    var p = this.player, self = this;
    for (var i = 0; i < gt.units.length; i++) {
      var u = gt.units[i], pos = gt.a - gt.dir * u.off;
      if (gt.horiz) u.spr.setPosition(pos, gt.pos); else u.spr.setPosition(gt.pos, pos);
      // EXTREME damage (user: insta-kill if no gear on) — through hurtPlayer,
      // so DEF/HP gear + the class dmgTaken mults all apply; i-frames stop
      // one pass from double-dipping.
      if (p.state.alive) {
        var along = gt.horiz ? Math.abs(p.x - u.spr.x) : Math.abs(p.y - u.spr.y);
        var across = gt.horiz ? Math.abs(p.y - gt.pos) : Math.abs(p.x - gt.pos);
        if (along < u.along && across < u.across) {
          Entities.hurtPlayer(this, p, gt.dmg, time, 'the ghost express', true);
        }
      }
    }
    if (time - (gt.lastRumble || 0) > 230) {
      gt.lastRumble = time; try { AUDIO.play('trainpass'); } catch (e) {}
      this.cameras.main.shake(180, 0.005);
    }
    if ((gt.dir > 0 && gt.a > gt.endA) || (gt.dir < 0 && gt.a < gt.endA)) {
      this.clearGhostTrain();
      if (this.boss && this.boss.active && this.boss.boss.def.patterns.ghostTrain) {
        this.boss.boss.nextTrainAt = time + this.boss.boss.def.patterns.ghostTrain.everyMs;
      }
    }
  },

  clearGhostTrain: function () {
    var gt = this.ghostTrain;
    if (!gt) return;
    if (gt.units) gt.units.forEach(function (u) { try { u.spr.destroy(); } catch (e) {} });
    var track = gt.trackSpr;
    if (track) this.tweens.add({ targets: track, alpha: 0, duration: 500,
      onComplete: function () { try { track.destroy(); } catch (e) {} } });
    this.ghostTrain = null;
  },

  throwTies: function (b, T) {
    var self = this;
    for (var i = 0; i < T.count; i++) {
      // first tie dead on the player, the rest scattered around them (SIM.rng)
      var tx = i === 0 ? this.player.x : this.player.x + (SIM.rng() * 2 - 1) * T.scatter;
      var ty = i === 0 ? this.player.y : this.player.y + (SIM.rng() * 2 - 1) * T.scatter;
      tx = Phaser.Math.Clamp(tx, 60, this.worldW - 60);
      ty = Phaser.Math.Clamp(ty, 60, this.worldH - 60);
      (function (tx, ty) {
        var marker = self.add.ellipse(tx, ty, T.radius * 2, T.radius * 2)
          .setStrokeStyle(3, 0xff5a3c, 0.9).setFillStyle(0xff5a3c, 0.12).setDepth(4);
        self.condFx.push(marker);
        self.tweens.add({ targets: marker, scaleX: { from: 0.4, to: 1 }, scaleY: { from: 0.4, to: 1 },
          duration: T.warnMs, ease: 'Sine.In' });
        var tie = self.add.image(b.x, b.y - 24, 'railtie').setDepth(40).setScale(2.4);
        self.condFx.push(tie);
        self.tweens.add({ targets: tie, scale: 3.4, duration: T.flightMs * 0.5, yoyo: true });   // lob height
        self.tweens.add({
          targets: tie, x: tx, y: ty, angle: 660, duration: T.flightMs, delay: T.warnMs - T.flightMs,
          onComplete: function () {
            try { AUDIO.play('thud'); } catch (e) {}
            self.cameras.main.shake(140, 0.005);
            self.burst(tx, ty, 8, 0x8a5a30);
            var p = self.player;
            if (p.state.alive && Math.hypot(p.x - tx, p.y - ty) < T.radius) {
              Entities.hurtPlayer(self, p, T.dmg, self.time.now, 'a railroad tie', true);
            }
            try { marker.destroy(); } catch (e) {}
            self.tweens.add({ targets: tie, alpha: 0, duration: 900, delay: 500,
              onComplete: function () { try { tie.destroy(); } catch (e) {} } });
          }
        });
      })(tx, ty);
    }
  },

  snapSchedule: function (b, S, time) {
    var self = this, st = this.player.state;
    st.slowUntil = time + S.durMs;
    st.slowMult = S.slowMult;
    try { AUDIO.play('ticktock'); } catch (e) {}
    // the watch flash: a gold ring bursts from the boss...
    var ring = this.add.ellipse(b.x, b.y, 40, 40).setStrokeStyle(4, 0xffd23e, 0.9).setDepth(41);
    this.tweens.add({ targets: ring, scaleX: 9, scaleY: 9, alpha: 0, duration: 700,
      onComplete: function () { try { ring.destroy(); } catch (e) {} } });
    // ...and a golden haze clings to the slowed hero for the duration
    var fx = this.add.sprite(this.player.x, this.player.y, 'softglow')
      .setTint(0xffd23e).setScale(1.6).setAlpha(0.5).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
    this.condFx.push(fx);
    var pRef = this.player;
    this.tweens.add({ targets: fx, alpha: 0.15, duration: S.durMs, ease: 'Sine.In',
      onUpdate: function () { fx.setPosition(pRef.x, pRef.y); },
      onComplete: function () { try { fx.destroy(); } catch (e) {} } });
  },

  updateLantern: function (b, player, time) {
    var cd = b.boss, L = cd.def.patterns.lantern;
    if (!cd.lanternUntil && time >= cd.nextLanternAt) {
      cd.lanternUntil = time + L.durMs;
      cd.lanternAng = Math.atan2(player.y - b.y, player.x - b.x) - 0.6;   // starts just behind you
      cd.lanternDir = SIM.rng() < 0.5 ? 1 : -1;
      cd.lastLanternAt = time;
      cd.nextLanternTickAt = time;
      if (!this.lanternG) this.lanternG = this.add.graphics().setDepth(7);
      try { AUDIO.play('charge'); } catch (e) {}
    }
    if (!cd.lanternUntil) return;
    if (time >= cd.lanternUntil) {
      cd.lanternUntil = 0;
      cd.nextLanternAt = time + L.everyMs;
      if (this.lanternG) this.lanternG.clear();
      return;
    }
    var dtL = Math.min(120, time - (cd.lastLanternAt || time));
    cd.lastLanternAt = time;
    cd.lanternAng += cd.lanternDir * Phaser.Math.DegToRad(L.degPerSec) * dtL / 1000;
    var x2 = b.x + Math.cos(cd.lanternAng) * L.length, y2 = b.y + Math.sin(cd.lanternAng) * L.length;
    var g = this.lanternG;
    g.clear();
    g.lineStyle(26, 0x8fd6ff, 0.22); g.lineBetween(b.x, b.y, x2, y2);
    g.lineStyle(10, 0xd8f3ff, 0.5);  g.lineBetween(b.x, b.y, x2, y2);
    if (time >= cd.nextLanternTickAt) {
      cd.nextLanternTickAt = time + L.tickMs;
      var pd = Math.hypot(player.x - b.x, player.y - b.y);
      if (player.state.alive && pd < L.length && pd > 10) {
        var pa = Math.atan2(player.y - b.y, player.x - b.x);
        var diff = Phaser.Math.Angle.Wrap(pa - cd.lanternAng);
        var halfRad = Phaser.Math.DegToRad(L.halfDeg) + 14 / Math.max(40, pd);   // beam width forgiveness
        if (Math.abs(diff) < halfRad) {
          Entities.hurtPlayer(this, player, L.dmg, time, "the Conductor's lantern", true);
        }
      }
    }
  },

  clearConductorFx: function () {
    if (this.lanternG) { try { this.lanternG.destroy(); } catch (e) {} this.lanternG = null; }
    this.clearGhostTrain();
    (this.condFx || []).forEach(function (o) { try { o.destroy(); } catch (e) {} });
    this.condFx = [];
    if (this.arrivalTrain) {
      this.arrivalTrain.forEach(function (u) { try { u.spr.destroy(); } catch (e) {} });
      this.arrivalTrain = null;
    }
    var st = this.player && this.player.state;
    if (st) { st.slowUntil = 0; st.slowMult = 1; }
  },

  // --------------------------------------- E3 (M2.1): SCOUTER WORKUP SHEET --
  // DBZ-scouter style scan on boss-room entry: raw stats, a visual readout of
  // the boss, and tactical hints per pattern (data-driven — DATA.bosses.*.hints).
  // Combat holds (physics + update loop) until the scan is dismissed.
  showScouter: function (def) {
    var self = this;
    this.scanning = true;
    this._scanStartAt = this.time.now;           // M7k: the read length shifts map clocks on dismiss
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
    // M4.7: size-aware portrait — classic 20px art needs ×6, the Conductor's
    // 128px hi-fi model needs ~×1. Target ≈ 120px in the frame either way.
    var srcW = this.textures.exists(def.texture) ? this.textures.get(def.texture).getSourceImage().width : 20;
    var picScale = 120 / srcW;
    var pic = this.add.image(cx - 210, cy - 8, def.texture).setScale(picScale).setScrollFactor(0).setDepth(87);
    ui.push(pic);
    this.tweens.add({ targets: pic, scale: { from: picScale, to: picScale * 1.08 }, yoyo: true, duration: 700, repeat: -1 });
    // raw stats
    var pats = 0; for (var k in def.patterns) pats++;
    ui.push(this.add.text(cx - 100, cy - 88,
      'HP        ' + def.hp + '\nSPEED     ' + def.spd + '\nCONTACT   ' + def.contactDmg + ' dmg' +
      '\nPATTERNS  ' + pats + '\nBOUNTY    ' + def.xp + ' xp',
      { fontFamily: 'monospace', fontSize: 13, color: '#38b764', lineSpacing: 6 }).setScrollFactor(0).setDepth(86));
    // tactical hints (the moveset) — M5.1 (user bug report): ADAPTIVE SIZING.
    // A six-verb boss (the Grovekeeper) overflowed the panel and ran under
    // the engage prompt; shrink the font until the block fits its box.
    var hints = (def.hints || []).map(function (h) { return '· ' + h; }).join('\n');
    var hintsTxt = this.add.text(cx - 100, cy + 22, 'TACTICAL READOUT\n' + hints,
      { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2', lineSpacing: 4, wordWrap: { width: 402 } })
      .setScrollFactor(0).setDepth(86);
    var hintsBottom = cy + 188;                          // must clear the engage prompt
    [10, 9, 8].forEach(function (fs) {
      if (hintsTxt.y + hintsTxt.height > hintsBottom) hintsTxt.setFontSize(fs);
    });
    ui.push(hintsTxt);
    // the engage prompt sits pinned just inside the panel's bottom edge
    ui.push(this.add.text(cx, cy + 206, '[ ENTER or CLICK to engage ]',
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
      // M5.0: the Grovekeeper's verb clocks re-arm too — a long scouter read
      // must not bank an instant TIMBER
      if (this.boss.boss.def.patterns.timber) this.initGrovekeeper(this.boss, this.time.now);
    }
    // M7k AUDIT (2026-07-17): LAW 11 for the 16 REGISTRY MAPS — update() froze
    // while the scan was up but the scene clock kept running, so every
    // mapOwned verb clock armed pre-scan (nextVerbAt/nextSigAt/…) was banked
    // and the whole kit fired the frame after dismissal. The read duration is
    // a pause in all but name: shift the map's absolute clocks through its
    // unfreeze hook (the same list the ESC menu uses) + the realm clock.
    if (this._scanStartAt) {
      var sdt = this.time.now - this._scanStartAt;
      this._scanStartAt = 0;
      if (sdt > 0) {
        this.startedAt += sdt;                   // the realm clock ignores the read
        var MSC = (typeof MAPS !== 'undefined' && MAPS.forScene) ? MAPS.forScene(this) : null;
        if (MSC && MSC.scene && MSC.scene.unfreeze) MSC.scene.unfreeze(this, sdt);
      }
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
    if (def.patterns.ghostTrain) this.clearConductorFx();   // M4.7: beam/rails/ties die with him
    if (def.patterns.timber) { this.clearGrovekeeperFx(); this.clearGroveTimber(); }   // M5.0 + item 10: fx + arena ring die with him
    if (def.floorLift) this.clearEngineerFx();              // M5.7: reactor/turrets/telegraphs die with him
    // M7k AUDIT (2026-07-17): registry maps get the same courtesy — a boss
    // killed MID-VERB (rooted overload, dash, judgment…) left its telegraph
    // graphics painted forever. The map's bossCleanup hook tears them down.
    var MBC = (typeof MAPS !== 'undefined' && MAPS.forScene) ? MAPS.forScene(this) : null;
    if (MBC && MBC.scene && MBC.scene.bossCleanup) { try { MBC.scene.bossCleanup(this, boss); } catch (e) {} }
    boss.destroy(); this.boss = null;
    if (this.bossBar) { this.bossBar.destroy(); this.bossBarBg.destroy(); this.bossName.destroy(); this.bossBar = null; }
    AUDIO.stopMusic();                                   // M4.5: the battle is decided — silence is the release
    AUDIO.play('victory');
    // v5 (2026-07-17): THE FINALE. The first Titan Whale (belly) kill BEATS THE
    // GAME → grant the legendary set + flip beaten, then play the endgame
    // cutscenes CS2 THE REBOOT → CS3 THE WAKE/FORK (item 1), then home. This
    // replaces the normal loot chest for the finale (the unlocks ARE the reward).
    if (this.realmId === 'belly' && ACCOUNT.cutscenesSeen && !ACCOUNT.cutscenesSeen.cs2 && typeof CutsceneScene !== 'undefined') {
      var _cls = CURRENT.cls, _self = this;
      beatTheGame(_cls);
      this.time.delayedCall(700, function () {
        _self.scene.start('Cutscene', { id: 'cs2', cls: _cls, next:
          { scene: 'Cutscene', data: { id: 'cs3', cls: _cls, next:
            { scene: 'Cutscene', data: { id: 'cs4', cls: _cls, next: { scene: 'Nexus', data: { entry: 'realm' } } } } } } });
      });
      return;
    }
    var stat = DATA.potions.stats[Math.floor(SIM.rng() * DATA.potions.stats.length)];  // seam rule 4
    // M3: the chest also rolls GEAR from the boss's drop table (E1 phase 2 —
    // per-item take/leave is real now). Rolled here, once, through SIM.rng.
    // M4.6: every rolled key passes through SIM.resolveDrop — a wizard/knight
    // receives their OWN class line (no off-class drops; same RNG stream).
    var rolled = [];
    var table = def.lootTable && DATA.dropTables[def.lootTable];
    if (table) for (var i = 0; i < table.rolls; i++) rolled.push(SIM.resolveDrop(SIM.rollDrop(table.entries), CURRENT.cls));
    // E9 v2 — CHAMPION BOUNTY: every champion killed this realm adds a roll
    // (capped) — affixed mobs drop better, paid out where loot lives: the chest.
    var B = DATA.affixes.championBounty;
    var bounty = Math.min(B.cap, this.championKills * B.perKill);
    for (var j = 0; j < bounty; j++) rolled.push(SIM.resolveDrop(SIM.rollDrop(DATA.dropTables[B.table].entries), CURRENT.cls));
    // M5.5: already-owned rolls become bonus XP; only NEW items drop
    var res = resolveLootRolls(rolled);
    this.pendingLoot = {
      kind: 'clear', stat: stat, xp: def.xp + DATA.realm.closeXpBonus + res.dupeXp,
      items: res.items, dupes: res.dupes,
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
    // M6b (Red): NO auto-equip. New items are OFFERED in the overlay and only
    // COLLECTED + EQUIPPED when the player SELECTS them (so white-gear balance
    // testing sticks — a declined drop is never owned and never re-fills a slot).
    // The potion is banked and XP (base + close bonus + DUPLICATE bonus) applies
    // now; duplicates already became bonus XP at the roll (folded into L.xp).
    Entities.grantXp(this, this.player, L.xp);
    ACCOUNT.records.realmsClosed++;
    ACCOUNT.records.totalKills += st.kills; st.kills = 0;    // banked, not lost
    CURRENT.level = st.level; CURRENT.xp = st.xp;
    // v5 (2026-07-17): FIRST-PLAYTHROUGH campaign progress. Opening the chest =
    // the boss is down = this region is PURGED. Record it, pay one MAP TOKEN, and
    // purging the whale (patient zero) BEATS THE GAME (flips to post-campaign).
    (function (mid) {
      if (!mid || !ACCOUNT || !Array.isArray(ACCOUNT.cleared)) return;
      if (ACCOUNT.cleared.indexOf(mid) < 0) {
        ACCOUNT.cleared.push(mid);
        ACCOUNT.mapTokens = (ACCOUNT.mapTokens || 0) + 1;    // +1 token per NEW clear
        if (mid === 'belly') ACCOUNT.beaten = true;           // patient zero purged
      }
    })(this.realmId);
    persist();                                               // reward on disk BEFORE any screen
    this.buildLootOverlay(L);
  },

  // M6b (Red) REDESIGN — the end-of-map chest is a COMPARE-AND-SELECT screen:
  //  · YOUR LOADOUT strip: all four equipped slots, always visible.
  //  · each NEW drop is OFFERED with a side-by-side stat compare vs the piece it
  //    would replace — numbers GREEN when the drop raises a stat, RED when it
  //    lowers one. [EQUIP] collects + equips it (re-derives live stats); a
  //    DECLINED drop is discarded (never owned) so white-gear runs stay white.
  //  · DUPLICATES (already owned) never appear as items — they were paid out as
  //    bonus XP by rarity at the roll, listed here as info.
  //  · ENTER or CLOSE leaves with only what you chose.
  buildLootOverlay: function (L) {
    if (this.lootUi) { this.lootUi.forEach(function (o) { o.destroy(); }); }
    var self = this, st = this.player.state, cls = DATA.classes[CURRENT.cls], lvl = st.level;
    var W = this.scale.width, H = this.scale.height, cx = W / 2;
    var items = L.items || [], dupes = L.dupes || [];
    var PW = 660, headH = 112, itemH = 92, dupeH = 26;
    var bodyH = 8 + (items.length ? items.length * itemH : 46) + (dupes.length ? 24 + dupes.length * dupeH : 0) + 56;
    var panelH = Math.min(H - 16, headH + bodyH);
    var cy = H / 2, top = cy - panelH / 2, ui = [];
    // dim backdrop — interactive so world clicks are swallowed, but never closes
    ui.push(this.add.rectangle(cx, cy, W, H, 0x000000, 0.62).setScrollFactor(0).setDepth(84).setInteractive());
    ui.push(this.add.rectangle(cx, cy, PW, panelH, 0x0f0f1b, 0.98).setScrollFactor(0).setDepth(85).setStrokeStyle(2, 0xffcd75));
    // ---- header
    ui.push(this.add.sprite(cx - PW / 2 + 34, top + 30, 'chest').setScale(1.8).setScrollFactor(0).setDepth(86));
    ui.push(this.add.text(cx - PW / 2 + 60, top + 16, 'LOOT', { fontFamily: 'monospace', fontSize: 20, color: '#ffcd75' }).setScrollFactor(0).setDepth(86));
    ui.push(this.add.text(cx - PW / 2 + 60, top + 40, (L.headline || 'the realm has fallen'), { fontFamily: 'monospace', fontSize: 11, color: '#94b0c2' }).setScrollFactor(0).setDepth(86));
    var xpNote = '+' + L.xp + ' XP' + (L.stat ? '  ·  POTION OF ' + L.stat.toUpperCase() + ' banked' : '') + '  ·  lvl ' + st.level + (st.level >= DATA.xp.cap ? ' (MAX)' : '');
    ui.push(this.add.text(cx + PW / 2 - 20, top + 22, xpNote, { fontFamily: 'monospace', fontSize: 11, color: '#f4f4f4' }).setOrigin(1, 0).setScrollFactor(0).setDepth(86));
    // ---- YOUR LOADOUT strip (equipped in every slot — always visible)
    var stripY = top + 74, cellW = (PW - 40) / DATA.equipSlots.length;
    ui.push(this.add.text(cx - PW / 2 + 20, stripY - 16, 'YOUR LOADOUT', { fontFamily: 'monospace', fontSize: 10, color: '#6c7a99' }).setScrollFactor(0).setDepth(86));
    DATA.equipSlots.forEach(function (slot, i) {
      var celX = cx - PW / 2 + 20 + i * cellW;
      ui.push(self.add.rectangle(celX + cellW / 2, stripY + 14, cellW - 8, 34, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86).setStrokeStyle(1, 0x2a3350));
      var eqKey = CURRENT.equipment[slot];
      if (eqKey) {
        var eit = DATA.items[eqKey];
        ui.push(self.add.sprite(celX + 16, stripY + 14, eit.texture).setScale(1.5).setTint(itemTint(eqKey)).setScrollFactor(0).setDepth(87));
        ui.push(self.add.text(celX + 30, stripY + 3, slot.toUpperCase(), { fontFamily: 'monospace', fontSize: 8, color: '#6c7a99' }).setScrollFactor(0).setDepth(87));
        ui.push(self.add.text(celX + 30, stripY + 14, DATA.tiers[eit.tier].rarity + ' ' + eit.name, { fontFamily: 'monospace', fontSize: 8, color: itemColor(eqKey), wordWrap: { width: cellW - 42 } }).setScrollFactor(0).setDepth(87));
      } else {
        ui.push(self.add.text(celX + 10, stripY + 7, slot.toUpperCase() + '\n— empty —', { fontFamily: 'monospace', fontSize: 8, color: '#4a566f' }).setScrollFactor(0).setDepth(87));
      }
    });
    // ---- OFFERED items (compare + select)
    var y = top + headH + 4;
    if (!items.length) {
      ui.push(this.add.text(cx, y + 14, 'no new gear dropped', { fontFamily: 'monospace', fontSize: 12, color: '#6c7a99' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(86));
      y += 46;
    }
    items.forEach(function (key) {
      var it = DATA.items[key], slot = it.slot, curKey = CURRENT.equipment[slot];
      var equippedThis = curKey === key;
      var eqBefore = {}, eqAfter = {};
      DATA.equipSlots.forEach(function (s) { eqBefore[s] = CURRENT.equipment[s]; eqAfter[s] = CURRENT.equipment[s]; });
      eqAfter[slot] = key;
      var sB = SIM.statsFor(cls, lvl, CURRENT.potionsDrunk, eqBefore);
      var sA = SIM.statsFor(cls, lvl, CURRENT.potionsDrunk, eqAfter);
      var dmgB = SIM.weaponMod(eqBefore).dmg, dmgA = SIM.weaponMod(eqAfter).dmg;
      ui.push(self.add.rectangle(cx, y + itemH / 2 - 6, PW - 40, itemH - 12, 0x1a1c2c, 1).setScrollFactor(0).setDepth(86).setStrokeStyle(1, equippedThis ? 0x38b764 : itemTint(key)));
      ui.push(self.add.sprite(cx - PW / 2 + 42, y + 20, it.texture).setScale(2).setTint(itemTint(key)).setScrollFactor(0).setDepth(87));
      ui.push(self.add.text(cx - PW / 2 + 68, y + 8, itemLabel(key) + '   (' + slot + ')', { fontFamily: 'monospace', fontSize: 12, color: itemColor(key) }).setScrollFactor(0).setDepth(87));
      var replTxt = curKey ? 'replaces  ' + DATA.tiers[DATA.items[curKey].tier].rarity + ' ' + DATA.items[curKey].name : 'fills an EMPTY ' + slot + ' slot';
      ui.push(self.add.text(cx - PW / 2 + 68, y + 24, replTxt, { fontFamily: 'monospace', fontSize: 9, color: '#94b0c2' }).setScrollFactor(0).setDepth(87));
      // stat chips — GREEN up / RED down
      var chips = [];
      if (slot === 'weapon' && dmgA !== dmgB) chips.push(['DMG', dmgB, dmgA]);
      ['att', 'def', 'hp', 'mp', 'spd', 'dex'].forEach(function (k) { if (sA[k] !== sB[k]) chips.push([k.toUpperCase(), sB[k], sA[k]]); });
      var chipX = cx - PW / 2 + 68, chipY = y + 42;
      if (!chips.length) {
        ui.push(self.add.text(chipX, chipY, 'no stat change', { fontFamily: 'monospace', fontSize: 10, color: '#6c7a99' }).setScrollFactor(0).setDepth(87));
      } else {
        chips.forEach(function (c) {
          var col = c[2] > c[1] ? '#38b764' : '#e05b5b';
          var t = self.add.text(chipX, chipY, c[0] + ' ' + c[1] + '→' + c[2], { fontFamily: 'monospace', fontSize: 11, color: col }).setScrollFactor(0).setDepth(87);
          ui.push(t); chipX += t.width + 14;
          if (chipX > cx + PW / 2 - 150) { chipX = cx - PW / 2 + 68; chipY += 16; }
        });
      }
      // EQUIP button (or EQUIPPED tag)
      if (equippedThis) {
        ui.push(self.add.text(cx + PW / 2 - 30, y + 24, '◄ EQUIPPED', { fontFamily: 'monospace', fontSize: 13, color: '#38b764' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(88));
      } else {
        var bw = 108, bx = cx + PW / 2 - 20 - bw / 2, by = y + 24;
        var btn = self.add.rectangle(bx, by, bw, 30, 0x29366f, 1).setScrollFactor(0).setDepth(87).setStrokeStyle(1, 0x5a78c0).setInteractive({ useHandCursor: true });
        var blbl = self.add.text(bx, by, 'EQUIP', { fontFamily: 'monospace', fontSize: 13, color: '#f4f4f4' }).setOrigin(0.5).setScrollFactor(0).setDepth(88);
        ui.push(btn); ui.push(blbl);
        btn.on('pointerover', function () { btn.setFillStyle(0x3a4a90, 1); });
        btn.on('pointerout', function () { btn.setFillStyle(0x29366f, 1); });
        btn.on('pointerdown', function () { self.equipDropped(L, key); });
      }
      y += itemH;
    });
    // ---- DUPLICATES → bonus XP (info only; already applied at the roll)
    if (dupes.length) {
      ui.push(this.add.text(cx - PW / 2 + 20, y + 2, 'DUPLICATES  (already owned → bonus XP by rarity)', { fontFamily: 'monospace', fontSize: 10, color: '#8a7fb0' }).setScrollFactor(0).setDepth(86));
      y += 24;
      dupes.forEach(function (d) {
        var it = DATA.items[d.key];
        ui.push(self.add.sprite(cx - PW / 2 + 30, y + 9, it.texture).setScale(1.3).setTint(0x8a7fb0).setScrollFactor(0).setDepth(87));
        ui.push(self.add.text(cx - PW / 2 + 46, y + 3, DATA.tiers[it.tier].rarity + ' ' + it.name + '   →  +' + d.xp + ' XP', { fontFamily: 'monospace', fontSize: 10, color: '#8a7fb0' }).setScrollFactor(0).setDepth(87));
        y += dupeH;
      });
    }
    // ---- footer: CLOSE (leaves with only what you chose)
    var fy = top + panelH - 24;
    var cbtn = this.add.rectangle(cx, fy, 280, 30, 0x1a1c2c, 1).setScrollFactor(0).setDepth(87).setStrokeStyle(1, 0xffcd75).setInteractive({ useHandCursor: true });
    var clbl = this.add.text(cx, fy, '[ ENTER or CLICK to leave ]', { fontFamily: 'monospace', fontSize: 13, color: '#ffcd75' }).setOrigin(0.5).setScrollFactor(0).setDepth(88);
    ui.push(cbtn); ui.push(clbl);
    cbtn.on('pointerover', function () { cbtn.setFillStyle(0x29366f, 1); });
    cbtn.on('pointerout', function () { cbtn.setFillStyle(0x1a1c2c, 1); });
    cbtn.on('pointerdown', function () { self.takeLoot(); });
    this.lootUi = ui;
    this.rig.keys.ENTER.off('down');
    this.rig.keys.ENTER.once('down', function () { self.takeLoot(); });
  },

  // M6b (Red): equip a chosen drop — collect it (now owned), place it in its
  // slot, re-derive live stats (persists), then rebuild the overlay so the
  // LOADOUT strip + compare numbers refresh. Declined drops are never collected.
  equipDropped: function (L, key) {
    if (!this.looting) return;
    var it = DATA.items[key]; if (!it) return;
    collectItem(key);
    CURRENT.equipment[it.slot] = key;
    applyEquipmentChange(this);
    AUDIO.play('drink');
    this.buildLootOverlay(L);
  },

  // M5.5: close the chest summary (all rewards already applied at open).
  takeLoot: function () {
    if (!this.looting) return;
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
    AUDIO.stopMusic();                                   // M4.5: the horn ends the music too
    AUDIO.play('victory');
    var stat = this.modeDef.potionReward
      ? DATA.potions.stats[Math.floor(SIM.rng() * DATA.potions.stats.length)] : null;
    var rolled = [];                                      // M3: trial gear (pocket change)
    var table = this.modeDef.lootTable && DATA.dropTables[this.modeDef.lootTable];
    if (table) for (var i = 0; i < table.rolls; i++) rolled.push(SIM.resolveDrop(SIM.rollDrop(table.entries), CURRENT.cls));   // M4.6: class-locked drops
    var res = resolveLootRolls(rolled);                  // M5.5: dupes → bonus XP
    this.pendingLoot = { kind: 'survival', stat: stat, xp: this.modeDef.xpBonus + res.dupeXp,
                         items: res.items, dupes: res.dupes,
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
    var roster = DATA.biomes[this.realmBiome || DATA.realm.biome].mobs;
    var pool = [];
    roster.forEach(function (k) { if (!DATA.mobs[k].unlockAt || DATA.mobs[k].unlockAt <= tSec) pool.push(k); });
    if (!pool.length) return;                 // biome roster entirely time-locked (early seconds)
    var poolFull = pool.slice();              // pre-skew pool — the safe over-cap fallback pulls from here
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
    // WEIGHTED pick — a mob's `spawnWeight` (default 1) scales how often it comes
    // up. Used to dial shooters down without cutting them (Red: −10% archers).
    var poolW = pool.reduce(function (s, k) { return s + (DATA.mobs[k].spawnWeight || 1); }, 0);
    var pickWeighted = function () {
      var roll = SIM.rng() * poolW, acc = 0;
      for (var pi = 0; pi < pool.length; pi++) { acc += (DATA.mobs[pool[pi]].spawnWeight || 1); if (roll < acc) return pool[pi]; }
      return pool[pool.length - 1];
    };
    while (budget > 0 && alive < DATA.waves.maxAlive) {
      var k2 = pickWeighted();
      if (DATA.mobs[k2].cost > budget && budget < 4) k2 = pool[0];   // cheap fallback stays IN-BIOME (E7)
      // M4.9: SPARING mobs (the Dynamite Mole) are bounded — over their cap,
      // fall back to the cheap staple so the yard doesn't fill with bombs.
      if (DATA.mobs[k2].maxConcurrent) {
        var cnt = 0;
        this.mobs.children.iterate(function (m) { if (m && m.active && m.mob.key === k2) cnt++; });
        if (cnt >= DATA.mobs[k2].maxConcurrent) {
          // over the cap → spawn a NON-capped in-biome staple instead. Pull from
          // the PRE-SKEW pool so a PACK LEADER caster-skew (pool = [one shooter])
          // can't redirect the capped shooter back onto itself and flood the map.
          k2 = null;
          for (var fi = 0; fi < poolFull.length; fi++) { if (!DATA.mobs[poolFull[fi]].maxConcurrent) { k2 = poolFull[fi]; break; } }
          if (!k2) break;                      // everything unlocked is capped → stop this burst
        }
      }
      budget -= DATA.mobs[k2].cost;
      // M4.9: fuse mobs SURFACE on-screen near you (the telegraph must be seen);
      // everything else pours from the off-screen ring as before.
      var pt = DATA.mobs[k2].fuse ? this.pickSurfacePoint() : this.pickSpawnPoint();
      if (pt && Entities.spawnMob(this, k2, pt.x, pt.y)) alive++;
    }
  },

  // M4.9: an ON-SCREEN point near the player (for a mole to surface + telegraph),
  // clear of walls where the map has them.
  pickSurfacePoint: function () {
    var p = this.player;
    for (var t = 0; t < 10; t++) {
      var a = SIM.rng() * Math.PI * 2, d = 130 + SIM.rng() * 170;
      var x = Phaser.Math.Clamp(p.x + Math.cos(a) * d, 60, this.worldW - 60);
      var y = Phaser.Math.Clamp(p.y + Math.sin(a) * d, 60, this.worldH - 60);
      if (this.map) { var c = MAPS.findClearPx(this.map, x, y); x = c.x; y = c.y; }
      return { x: x, y: y };
    }
    return { x: p.x + 160, y: p.y };
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
     'boss-pattern', 'mob-immune'].forEach(function (e) { self.events.off(e); });
    // M4: the shot / ability SFX come from the class's weapon / ability data
    // (bow→'shoot' + volley→'volley'; frost→'frost' + barrage→'zap'; sword→'slash').
    this.events.on('player-shot', function () {
      var w = DATA.weapons[DATA.classes[CURRENT.cls].weapon];
      AUDIO.play((w && w.sound) || 'shoot');
    });
    this.events.on('player-ability', function (ab) { AUDIO.play((ab && ab.sound) || 'volley'); });
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
      // M7k AUDIT (2026-07-17): boss-summoned adds queued with noLoot pay no
      // XP and tick no quota (Compy Call was a live XP farm) — the death still
      // bursts/sounds and runs every cleanup hook below.
      if (!mob.mob.noLoot) {
        self.player.state.kills++;
        Entities.grantXp(self, self.player, mob.mob.xp || mob.mob.def.xp);   // E9: affix bounty
      }
      self.burst(mob.x, mob.y, DATA.juice.deathParticles, mob.mob.def.deathTint);
      AUDIO.play('die');
      // M5.7: a Bulwark's guard-aura ring dies with it (pooled sprite reuse
      // would otherwise leak the circle).
      if (mob.mob.auraSpr) { try { mob.mob.auraSpr.destroy(); } catch (e) {} mob.mob.auraSpr = null; }
      if (mob.mob.flameRing) { try { mob.mob.flameRing.destroy(); } catch (e) {} mob.mob.flameRing = null; }
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
      // ---- M5.0 grove death hooks ----------------------------------------
      var mdef = mob.mob.def;
      // PUFFCAP SPLIT (user: "duplicate into 10 smaller versions when u kill
      // it") — queued, not spawned inline (group.get inside iterates).
      if (mdef.split) {
        for (var si = 0; si < mdef.split.count; si++) {
          var sa = Math.PI * 2 * si / mdef.split.count;
          self.queueSpawn({ key: mdef.split.key,
                            x: mob.x + Math.cos(sa) * mdef.split.ring,
                            y: mob.y + Math.sin(sa) * mdef.split.ring });
        }
      }
      // BUMBLEBRUTE WARDS — a dead mini frees its brute a step closer
      if (mob.mob.guardianOf) {
        self.mobs.children.iterate(function (b2) {
          if (b2 && b2.active && b2.id === mob.mob.guardianOf && b2.mob.ward > 0) {
            b2.mob.ward--;
            if (b2.mob.ward === 0) {
              self.burst(b2.x, b2.y, 12, 0xffd23e);
              var vt = self.add.text(b2.x, b2.y - b2.displayHeight / 2 - 12, 'VULNERABLE!',
                { fontFamily: 'monospace', fontSize: 11, fontStyle: 'bold', color: '#ffd23e' }).setOrigin(0.5).setDepth(30);
              self.tweens.add({ targets: vt, y: vt.y - 18, alpha: 0, duration: 900,
                onComplete: function () { try { vt.destroy(); } catch (e) {} } });
            }
          }
        });
      }
      // CORPSE LEDGER — the Bloom Pixie's glow (and her death burst) raises
      // these. Bloom pixies themselves never chain-revive. M5.6: the graveyard
      // leans on this ledger too (Acolyte raise · Cursed Bell rise · boss
      // Explode Corpse); ethereal mobs (banshee) leave nothing to raise.
      var _corpseKind = self.realmDef && (self.realmDef.kind === 'grove' || self.realmDef.kind === 'graveyard');
      if (_corpseKind && mob.mob.key !== 'bloomPixie' && mob.mob.key !== 'banshee' && !mob.mob.cinematic) {
        self.corpses.push({ key: (self.realmDef.kind === 'graveyard' ? 'rattlebones' : mob.mob.key),
                            realKey: mob.mob.key, x: mob.x, y: mob.y, at: self.time.now });
        if (self.corpses.length > 40) self.corpses.shift();
      }
      // M5.6 CORPSE BLOATER — bursts a poison gas cloud on death (DoT patch).
      if (mdef.deathGas && self.dropGas) self.dropGas(mob.x, mob.y, mdef.deathGas);
      // M5.6 SOUL WISP — a kill may release a soul drifting to the crypt.
      if (self.realmDef && self.realmDef.kind === 'graveyard' && self.maybeReleaseWisp && !mob.mob.cinematic)
        self.maybeReleaseWisp(mob.x, mob.y);
      // BLOOM PIXIE DEATH BLOOM — resurrects every corpse in the radius
      if (mdef.reviveOnDeath) {
        var rr = mdef.reviveOnDeath.radius, raised = 0;
        for (var ci = 0; ci < self.corpses.length; ci++) {
          var co2 = self.corpses[ci];
          if (!co2.used && Math.hypot(co2.x - mob.x, co2.y - mob.y) < rr) {
            co2.used = true; raised++;
            self.queueSpawn({ key: co2.key, x: co2.x, y: co2.y, revive: true });
          }
        }
        if (raised) {
          var ring2 = self.add.ellipse(mob.x, mob.y, 40, 40).setStrokeStyle(4, 0x8fd6ff, 0.9).setDepth(41);
          self.tweens.add({ targets: ring2, scaleX: rr / 20, scaleY: rr / 20, alpha: 0, duration: 600,
            onComplete: function () { try { ring2.destroy(); } catch (e) {} } });
          try { AUDIO.play('revive'); } catch (e) {}
        }
      }
      // M2 (F8): kill quota met → the boss portal opens (clear mode only — E6)
      if (self.mode === 'clear' && !self.bossPortal && !self.boss && !self.closing &&
          self.player.state.kills >= DATA.realm.killQuota) self.openBossPortal();
    });
    // M5.0: warded Bumblebrute shrugging off a hit — show it, rate-limited
    this.events.on('mob-immune', function (mob) {
      var t = self.time.now;
      if (self._immuneAt[mob.id] && t - self._immuneAt[mob.id] < 350) return;
      self._immuneAt[mob.id] = t;
      self.damageNumber(mob.x, mob.y - 16, 'IMMUNE', '#9aa7b8');
    });
    this.events.on('boss-hurt', function (boss, dmg) {
      self.damageNumber(boss.x, boss.y - 30, dmg, '#f4f4f4');
      self.hitstop(self.time.now);
      AUDIO.play('bossHit');
    });
    this.events.on('boss-pattern', function () { AUDIO.play('volley'); });
    // E1: chest, not auto-award. M5.0: the Grovekeeper's FIRST death triggers
    // PHASE TWO instead — the pixies fly in and resurrect him (kill him twice).
    this.events.on('boss-died', function (boss) {
      if (!self.player.state.alive) return;
      var bd = boss.boss;
      // M7k AUDIT (2026-07-17): a map may CONSUME a boss death entirely (Vice
      // Versa's beat-BOTH gate — core melee/ability paths call hurtBoss
      // directly, which used to clear the realm off the FIRST boss). The hook
      // returns true when it handled the death.
      if (bd.def.mapOwned) {
        var MBD = MAPS.forScene ? MAPS.forScene(self) : null;
        if (MBD && MBD.scene && MBD.scene.bossDefeated && MBD.scene.bossDefeated(self, boss)) return;
      }
      // M7 REGISTRY: a map-owned TWO-PHASE boss runs the MAP's transformation
      // cutscene (def.transform + the folder's scene.bossTransform hook) —
      // same branching seat as the engineer's mech swap below.
      if (bd.def.mapOwned && bd.def.transform && !bd.phase2done && !bd.resurrecting) {
        var MT = MAPS.forScene ? MAPS.forScene(self) : null;
        if (MT && MT.scene && MT.scene.bossTransform) { MT.scene.bossTransform(self, boss); return; }
      }
      // M5.7: the Engineer's phase-two is the mech transformation cutscene,
      // not the grovekeeper's pixie revive — branch on floorLift.
      if (bd.def.floorLift && bd.def.phaseTwo && !bd.phase2done && !bd.resurrecting) self.engineerTransform(boss);
      else if (bd.def.phaseTwo && !bd.phase2done && !bd.resurrecting) self.grovekeeperResurrection(boss);
      else self.onBossDown(boss);
    });
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
    // HI-FI HUD FRAME (2026-07-14, user: the bottom HUD read as disconnected
    // floating pieces): a beveled ring housing crowns each orb and a conduit
    // plate runs the full span behind the XP bar, docking into both rings via
    // glowing end caps — one connected console, in the chamber's art language.
    // Positioned every frame in updateHud (RESIZE-safe). Classic fallback:
    // if the art module is absent these keys don't exist and nothing changes.
    if (this.textures.exists('hudOrbFrame')) {
      this.hudPlate = this.add.tileSprite(0, 0, 64, 36, 'hudPlateMid').setScrollFactor(0).setDepth(48);
      this.hudCapL = this.add.image(0, 0, 'hudPlateCap').setScrollFactor(0).setDepth(48.5);
      this.hudCapR = this.add.image(0, 0, 'hudPlateCap').setScrollFactor(0).setDepth(48.5).setFlipX(true);
      this.hudFrameL = this.add.image(0, 0, 'hudOrbFrame').setScrollFactor(0).setDepth(51.5);
      this.hudFrameR = this.add.image(0, 0, 'hudOrbFrame').setScrollFactor(0).setDepth(51.5);
    } else {
      this.hudPlate = this.hudCapL = this.hudCapR = this.hudFrameL = this.hudFrameR = null;
    }
    // M4 berserker rework: a class with a `resource` (the Knight's RAGE) gets a
    // MOLTEN glow behind its right orb — it breathes, and burns brighter the
    // fuller the pool (alpha driven in updateHud). Hidden for mana classes.
    this.mpGlow = this.add.sprite(0, 0, 'softglow').setScrollFactor(0).setDepth(49).setVisible(false);
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
    // M4 berserker rework: the right orb is the class RESOURCE — molten RAGE
    // for the Knight (lava fill + a breathing glow that burns brighter as the
    // pool fills), classic blue mana for everyone else.
    var res = DATA.classes[st.cls].resource;
    var mpPct = st.mp / st.stats.mp;
    this.drawOrb(g, mpX, orbY, r, mpPct, res ? res.color : HUD.mpColor);
    if (res) {
      var breathe = 0.85 + 0.15 * Math.sin(this.time.now / 260);
      this.mpGlow.setVisible(true).setPosition(mpX, orbY)
        .setTint(res.glow || res.color)
        .setScale(0.9 + 0.5 * mpPct)
        .setAlpha((0.12 + 0.5 * mpPct) * breathe);
      if (mpPct > 0.15) {                                  // molten sheen on the lava surface
        g.fillStyle(res.glow || 0xffcd75, 0.35);
        g.fillEllipse(mpX, orbY + r * (1 - mpPct * 0.9), r * 0.8 * Math.min(1, mpPct * 2.2), 4);
      }
    } else { this.mpGlow.setVisible(false); }
    this.hpOrbText.setPosition(hpX, orbY).setText(String(Math.max(0, Math.ceil(st.hp))));
    this.mpOrbText.setPosition(mpX, orbY).setText(String(Math.floor(st.mp)));

    // XP bar (user redesign, 2026-07-12): the ONLY bottom element — spans the
    // gap between the two orbs, split into 5 equal segments by blue dividers,
    // gold fill for progress, XP-into-level / needed centered on it.
    var bh = 16;
    var bx = hpX + r + 12, bxR = mpX - r - 12, bw = Math.max(40, bxR - bx);
    var by = H - bh - 6;
    // HI-FI HUD FRAME: dock the conduit plate + caps between the orb rings.
    // The plate's dark groove (rows 9..27 of 36) is where the XP bar renders,
    // so the bar reads as energy flowing through the housing.
    if (this.hudFrameL) {
      this.hudFrameL.setPosition(hpX, orbY);
      this.hudFrameR.setPosition(mpX, orbY);
      var pcy = by + bh / 2;
      var plateL = hpX + r + 2, plateR = mpX - r - 2;      // tuck under the rings
      var pw = Math.max(64, plateR - plateL);
      this.hudPlate.setPosition((plateL + plateR) / 2, pcy).setSize(pw, 36);
      this.hudCapL.setPosition(plateL + 14, pcy);
      this.hudCapR.setPosition(plateR - 14, pcy);
    }
    var maxed = st.level >= DATA.xp.cap;
    var need = DATA.xp.needed(st.level);
    var xpPct = maxed ? 1 : Math.max(0, Math.min(1, st.xp / need));
    g.fillStyle(HUD.glass, 0.92); g.fillRect(bx, by, bw, bh);           // dark track
    g.fillStyle(0xffcd75, 1); g.fillRect(bx, by, bw * xpPct, bh);       // gold fill
    if (this.hudFrameL) {
      // hi-fi housing: the plate's groove IS the border — subdued steel-blue
      // dividers only, no bright frame fighting the bezel (2026-07-14).
      g.fillStyle(0x1d5fa8, 0.9);
      for (var s5 = 1; s5 < 5; s5++) { g.fillRect(bx + Math.round(bw * s5 / 5) - 1, by, 2, bh); }
    } else {
      // classic floating bar keeps its own blue frame
      g.fillStyle(0x41a6f6, 1);
      for (var s5c = 1; s5c < 5; s5c++) { g.fillRect(bx + Math.round(bw * s5c / 5) - 1, by, 2, bh); }
      g.lineStyle(2, 0x41a6f6, 1); g.strokeRect(bx, by, bw, bh);        // blue border
    }
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
    // tab on the death screen can't resurrect them. M4: the new character is
    // the SAME class as the one that just fell (a slot keeps its class).
    GAME_SAVE.character = freshCharacter(st.cls);
    CURRENT = GAME_SAVE.character;
    persist();
    // M1 upgraded recap: cause of death, time survived, kills + account context.
    if (this.paused) this.resumeGame();                   // death screen owns the end
    AUDIO.stopMusic();                                    // M4.5: the music dies with you
    AUDIO.play('death');
    var tSec = Math.floor((this.time.now - this.startedAt) / 1000);
    var mmss = Math.floor(tSec / 60) + ':' + ('0' + tSec % 60).slice(-2);
    this.player.setTint(0x555555);
    if (this.player.held) this.player.held.setVisible(false);   // E8: drop the bow
    if (this.player.arm) this.player.arm.setVisible(false);      // ART TEST: drop the lead arm too
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
      'Death is permanent (Fusion Law F4 / Q1). A new ' + DATA.classes[st.cls].name + ' awaits in the Nexus.',
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

  // ---- M4: STORM BARRAGE LIGHTNING PROC (user redesign 2026-07-13) ---------
  // The homing storm-orb system is retired; the Wizard's special is now the
  // STORM BARRAGE machine gun (Entities.channelBarrage fires the lightning
  // balls as ordinary playerShots). What SURVIVES from the old design is the
  // payoff: a connecting ball can PROC these — a LIGHTNING BOLT summoned down
  // onto the victim. Area damage through SIM + the same hurt paths as any hit.
  lightningStrike: function (x, y, spec) {
    var self = this, st = this.player.state;
    var dmg = SIM.damage(spec.dmg, st.stats.att, 0);
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active) return;
      if (Math.hypot(m.x - x, m.y - y) <= spec.radius) Entities.hurtMob(self, m, dmg, self.time.now);
    });
    if (this.boss && this.boss.active && Math.hypot(this.boss.x - x, this.boss.y - y) <= spec.radius) {
      Entities.hurtBoss(this, this.boss, dmg);
    }
    this.strikeVfx(x, y);
    AUDIO.play(spec.sound || 'thunder');
  },

  // The bolt: a jagged column from above down to the impact + a bright flash
  // and expanding ring. Pure presentation (Math.random jitter is cosmetic —
  // seam rule 4); tweened out and destroyed. Small screenshake sells it.
  strikeVfx: function (x, y) {
    var g = this.add.graphics().setDepth(41);
    var top = y - 300, segs = 8;
    var draw = function (w, col, a) {
      g.lineStyle(w, col, a); g.beginPath(); g.moveTo(x, top);
      for (var i = 1; i <= segs; i++) {
        var ny = top + (y - top) * i / segs;
        var nx = (i === segs) ? x : x + (Math.random() * 2 - 1) * 14;
        g.lineTo(nx, ny);
      }
      g.strokePath();
    };
    draw(5, 0x7fb8ff, 0.85); draw(2, 0xffffff, 1);         // glow + hot core
    var flash = this.add.sprite(x, y, 'softglow').setTint(0xbfe8ff).setDepth(40).setScale(0.25).setAlpha(0.9);
    var ring = this.add.circle(x, y, 6, 0xbfe8ff, 0).setStrokeStyle(3, 0xbfe8ff, 0.9).setDepth(40);
    this.tweens.add({ targets: flash, scale: 1.4, alpha: 0, duration: 260, onComplete: function () { flash.destroy(); } });
    this.tweens.add({ targets: ring, radius: 46, alpha: 0, duration: 300, onComplete: function () { ring.destroy(); } });
    this.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: function () { g.destroy(); } });
    this.cameras.main.shake(120, 0.007);
  },

  // ---- M4: KNIGHT SWORD CLEAVE (user design 2026-07-13) --------------------
  // Entities.updatePlayer hands a melee "shot" here (the sword fires no
  // projectile). Hits every mob + the boss within `range` px whose bearing is
  // inside `arcDeg`/2 of the aim — a frontal crescent. Damage routes through SIM
  // (seam) + the same hurt paths as any hit; then the sweep VFX.
  meleeSwing: function (p, intent, st, weapon, wDmg) {
    var self = this, now = this.time.now, hits = 0;
    var dmg = SIM.damage(wDmg, st.stats.att, 0);
    // M5.1: the epic Ragefang OVERRIDES the arc — 360° = the whole circle
    var arcDeg = SIM.weaponMod(st.equipment).arcDeg || weapon.arcDeg || 100;
    var aim = intent.aimAngle, half = Phaser.Math.DegToRad(arcDeg / 2);
    var range = weapon.range || 76;
    // TARGET-SIZE-AWARE arc test (2026-07-14, user: "every other hit isn't
    // doing damage"): the old test checked the mob's CENTER POINT only, so a
    // hi-fi brute (40px wide on screen) visually overlapping the slash still
    // whiffed whenever its center sat just past the range or arc edge — the
    // eye said hit, the math said miss. Now each target contributes its own
    // radius: reach extends by it, and the angular window widens by the angle
    // it subtends. If the blade visually clips a body, it connects.
    var inArc = function (x, y, rad) {
      rad = rad || 0;
      var dx = x - p.x, dy = y - p.y, reach = range + rad;
      var d2 = dx * dx + dy * dy;
      if (d2 > reach * reach) return false;
      var d = Math.sqrt(d2);
      if (d <= rad) return true;                          // standing inside it
      var slack = Math.atan(rad / d);                     // angular size of the target
      return Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - aim)) <= half + slack;
    };
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active) return;
      if (inArc(m.x, m.y, m.displayWidth * 0.45)) { Entities.hurtMob(self, m, dmg, now); hits++; }
    });
    if (this.boss && this.boss.active && inArc(this.boss.x, this.boss.y, this.boss.displayWidth * 0.45)) { Entities.hurtBoss(this, this.boss, dmg); hits++; }
    // BERSERKER REWORK: every enemy the cleave connects with BANKS RAGE
    // (weapon.rageGain each, clamped to the pool) — the auto attack is how the
    // Knight fuels his whirlwind.
    if (weapon.rageGain && hits) st.mp = Math.min(st.stats.mp, st.mp + weapon.rageGain * hits);
    this.meleeVfx(p, aim, range, weapon.arcDeg || 100);
  },

  // The crescent sweep — the slash arc PIVOTS at the Knight (origin 0.03,0.5)
  // and scales so its tip lands at the sword's reach (`range`, = the whirlwind's
  // radius), then sweeps the whole arc and fades. Pure presentation (seam rule 3).
  meleeVfx: function (p, aim, range, arcDeg) {
    var swing = Phaser.Math.DegToRad(arcDeg) * 0.42;
    var s = this.add.sprite(p.x, p.y, 'slash')
      .setOrigin(0.03, 0.5).setDepth(11).setScale(range / 54)
      .setRotation(aim - swing).setAlpha(0.95).setTint(0xdff1ff);
    this.tweens.add({ targets: s, rotation: aim + swing, alpha: 0, duration: 150,
      onComplete: function () { s.destroy(); } });
  },

  // ---- M4: KNIGHT WHIRLWIND (held channel; Entities.channelWhirlwind drives it)
  // One damage tick: every enemy within `radius` takes SIM.damage(dmg,att). Each
  // tick also rolls the TORNADO proc (user add 2026-07-13) — on a hit it flings
  // a tornado outward in a random direction (SIM.rng — seam rule 4).
  whirlwindTick: function (p, st, ab) {
    var self = this, now = this.time.now, hits = 0;
    var dmg = SIM.damage(ab.dmg, st.stats.att, 0);
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active) return;
      if (Math.hypot(m.x - p.x, m.y - p.y) <= ab.radius) { Entities.hurtMob(self, m, dmg, now); hits++; }
    });
    if (this.boss && this.boss.active && Math.hypot(this.boss.x - p.x, this.boss.y - p.y) <= ab.radius) {
      Entities.hurtBoss(this, this.boss, dmg); hits++;
    }
    // BERSERKER REWORK: LIFESTEAL — the whirlwind mends the Knight per enemy
    // it damages this tick (hpPerHit each; spin deep in the pack = drink deep).
    // His survival tool now that he takes real damage.
    if (ab.hpPerHit && hits && st.alive) st.hp = Math.min(st.stats.hp, st.hp + ab.hpPerHit * hits);
    AUDIO.play(ab.sound || 'whirl');
    if (ab.tornado && SIM.rng() < ab.tornado.chance)
      this.spawnTornado(p.x, p.y, SIM.rng() * Math.PI * 2, ab.tornado, st);
  },

  // A TORNADO flung by the whirlwind: a funnel that shoots outward and grinds
  // any enemy it overlaps, re-hitting each every `reHitMs` while touching. Pooled.
  spawnTornado: function (x, y, angle, spec, st) {
    var t = this.tornadoes.get(x, y, 'tornado');
    if (!t) return null;
    t.setActive(true).setVisible(true).setTexture('tornado').setScale(2.4).setDepth(9)
      .setAlpha(0.9).setTint(0xd8e4f0);
    t.body.enable = true; t.body.setSize(8, 12).setOffset(2, 2);
    t.tornado = { dieAt: this.time.now + spec.lifeMs, radius: spec.radius,
                  dmg: SIM.damage(spec.dmg, st.stats.att, 0), reHitMs: spec.reHitMs || 250,
                  hits: {}, sway: 0 };
    this.physics.velocityFromRotation(angle, spec.speed, t.body.velocity);
    return t;
  },

  updateTornadoes: function (time) {
    if (!this.tornadoes) return;
    var self = this;
    this.tornadoes.children.iterate(function (t) {
      if (!t || !t.active) return;
      if (time >= t.tornado.dieAt) { Entities.killProjectile(self.tornadoes, t); return; }
      t.tornado.sway += 0.3;
      t.setScale(2.4 + Math.sin(t.tornado.sway) * 0.25, 2.4);   // funnel wobble (cosmetic)
      var spec = t.tornado;
      self.mobs.children.iterate(function (m) {
        if (!m || !m.active) return;
        if (Math.hypot(m.x - t.x, m.y - t.y) > spec.radius) return;
        if (time - (spec.hits[m.id] || -9999) < spec.reHitMs) return;
        spec.hits[m.id] = time;
        Entities.hurtMob(self, m, spec.dmg, time);
      });
      if (self.boss && self.boss.active &&
          Math.hypot(self.boss.x - t.x, self.boss.y - t.y) <= spec.radius &&
          time - (spec.hits.boss || -9999) >= spec.reHitMs) {
        spec.hits.boss = time; Entities.hurtBoss(self, self.boss, spec.dmg);
      }
    });
  },

  // The whirlwind ring — a spinning blade-halo around the Knight while he
  // channels (st.whirling). Pure presentation: created on spin-up, followed +
  // spun each frame, destroyed on release / death.
  updateWhirlwind: function (time) {
    var whirling = this.player && this.player.state.alive && this.player.state.whirling;
    if (whirling) {
      if (!this.whirlFx) {
        this.whirlFx = this.add.sprite(this.player.x, this.player.y, 'whirl')
          .setDepth(9).setAlpha(0.85).setScale(2.1).setTint(0xdfeaf6);
      }
      this.whirlFx.setPosition(this.player.x, this.player.y)
        .setRotation(this.whirlFx.rotation + 0.6).setVisible(true);
    } else if (this.whirlFx) {
      this.whirlFx.destroy(); this.whirlFx = null;
    }
  },

  // M4.8: RANGER DODGE-REGEN cue — a soft green aura on the player + slow
  // rising '+' motes while st.regenning (set in Entities.updatePlayer). The
  // orb already shows HP climbing; this makes it felt in the world. Cosmetic
  // (Math.random jitter OK — seam rule 4). The mote clock is cosmetic + self-
  // correcting, so it needs no unfreeze shift.
  updateRegenGlow: function (time) {
    var st = this.player && this.player.state;
    var on = st && st.alive && st.regenning;
    if (on) {
      // M4.9: tint by class accent — Ranger green, Wizard blue — so the aura
      // reads as "this class's out-of-combat mend", not a generic effect.
      var accent = (DATA.classes[st.cls] && DATA.classes[st.cls].accent) || 0x8fe07a;
      if (!this.regenFx) {
        this.regenFx = this.add.sprite(this.player.x, this.player.y, 'softglow')
          .setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      }
      var breathe = 0.5 + 0.3 * Math.sin(time / 180);
      this.regenFx.setTint(accent).setVisible(true).setPosition(this.player.x, this.player.y)
        .setScale(1.5).setAlpha(0.32 * breathe);
      if (time - (this._lastRegenMoteAt || 0) > 420) {
        this._lastRegenMoteAt = time;
        var mx = this.player.x + (Math.random() * 22 - 11), my = this.player.y - 6;
        var col = '#' + ('00000' + accent.toString(16)).slice(-6);
        var mote = this.add.text(mx, my, '+', { fontFamily: 'monospace', fontSize: 15,
          fontStyle: 'bold', color: col }).setOrigin(0.5).setDepth(11);
        this.tweens.add({ targets: mote, y: my - 28, alpha: 0, duration: 720,
          onComplete: function () { try { mote.destroy(); } catch (e) {} } });
      }
    } else if (this.regenFx) {
      this.regenFx.setVisible(false);
    }
  },

  // ---------------------- M4.9: DYNAMITE MOLE (telegraphed bomb) -------------
  // A pulsing warning ring shows the blast radius while the fuse burns (created
  // lazily, cleared by Entities.clearNameTag on every removal path).
  ensureMoleWarn: function (m, radius) {
    if (!m.warnCircle) {
      m.warnCircle = this.add.circle(m.x, m.y, radius, 0xff3b30, 0.10)
        .setStrokeStyle(2, 0xff5a3c, 0.9).setDepth(4);
    }
    var pulse = 0.85 + 0.15 * Math.sin(this.time.now / 90);
    m.warnCircle.setPosition(m.x, m.y).setScale(pulse);
  },

  // Detonate: an AoE that catches EVERYTHING in the radius (user 2026-07-14) —
  // the player AND other mobs. Mobs that die to the blast credit the player
  // (Entities.hurtMob emits mob-died → kills + XP + quota). The mole itself is
  // removed UNCREDITED (it blew itself up; only a defusing shot pays out).
  moleExplode: function (m, fuse) {
    var x = m.x, y = m.y, self = this;
    this.fireballFx(x, y, fuse.radius);          // M4.9: think FIRE (user)
    this.burst(x, y, 14, 0xffcd75);
    this.cameras.main.shake(150, 0.011);         // brief thump (user: keep it short, not a train)
    try { AUDIO.play('boom'); } catch (e) {}     // M4.9: real explosion sound (user)
    var p = this.player;
    if (p.state.alive && Math.hypot(p.x - x, p.y - y) < fuse.radius) {
      Entities.hurtPlayer(this, p, fuse.dmg, this.time.now, 'a dynamite mole');
    }
    // catch nearby mobs (skip other fuse mobs so a blast can't chain-detonate)
    this.mobs.children.iterate(function (mob) {
      if (!mob || !mob.active || mob === m || mob.mob.def.fuse) return;
      if (Math.hypot(mob.x - x, mob.y - y) < fuse.radius) Entities.hurtMob(self, mob, fuse.dmg, self.time.now);
    });
    if (m.active) { Entities.clearNameTag(m); m.body.enable = false; this.mobs.killAndHide(m); }   // ring cleared too
  },

  // M4.9: a FIREBALL for the mole detonation (user: "think fire") — a bright
  // core flash, an expanding orange fire body, a gold shockwave ring, an additive
  // ember glow, and flung sparks, all self-destructing via tweens (pause-safe).
  fireballFx: function (x, y, radius) {
    var self = this;
    var core = this.add.circle(x, y, radius * 0.34, 0xfff2b0, 0.95).setDepth(42);
    this.tweens.add({ targets: core, scale: 2.3, alpha: 0, duration: 240, ease: 'Cubic.Out',
      onComplete: function () { try { core.destroy(); } catch (e) {} } });
    var ball = this.add.circle(x, y, radius * 0.5, 0xff7d3a, 0.8).setDepth(41);
    this.tweens.add({ targets: ball, scale: 2.0, alpha: 0, duration: 430, ease: 'Cubic.Out',
      onComplete: function () { try { ball.destroy(); } catch (e) {} } });
    var ring = this.add.circle(x, y, radius * 0.4).setStrokeStyle(4, 0xffd34d, 0.9).setDepth(42);
    this.tweens.add({ targets: ring, scale: 2.5, alpha: 0, duration: 430, ease: 'Cubic.Out',
      onComplete: function () { try { ring.destroy(); } catch (e) {} } });
    if (this.textures.exists('softglow')) {
      var glow = this.add.sprite(x, y, 'softglow').setTint(0xff5a1f).setDepth(40)
        .setBlendMode(Phaser.BlendModes.ADD).setScale(radius / 32 * 1.2).setAlpha(0.85);
      this.tweens.add({ targets: glow, alpha: 0, scale: radius / 32 * 2.2, duration: 460,
        onComplete: function () { try { glow.destroy(); } catch (e) {} } });
    }
    for (var i = 0; i < 12; i++) {
      (function () {
        var a = Math.random() * Math.PI * 2, d = radius * (0.4 + Math.random() * 0.6);
        var e = self.add.circle(x, y, 2 + Math.random() * 2, i % 2 ? 0xffd34d : 0xff5a1f).setDepth(42);
        self.tweens.add({ targets: e, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
          duration: 340 + Math.random() * 260, ease: 'Cubic.Out',
          onComplete: function () { try { e.destroy(); } catch (er) {} } });
      })();
    }
  },

  // M5.1 (user): FULL-LEGENDARY-SET EXPLOSIVE ARROWS — every arrow that
  // connects blasts a small AoE. DELIBERATELY stacking ("the damage can
  // overlap from explosives"): each arrow's blast is its own event, no
  // shared-hit guard — a shotgunned pack eats every overlapping boom. The
  // direct-hit target is excluded (it already took the arrow).
  arrowExplode: function (x, y, cfg, directHit) {
    var self = this;
    // small fiery pop (a scaled-down fireballFx)
    var core = this.add.circle(x, y, cfg.radius * 0.3, 0xfff2b0, 0.9).setDepth(42);
    this.tweens.add({ targets: core, scale: 2, alpha: 0, duration: 200, ease: 'Cubic.Out',
      onComplete: function () { try { core.destroy(); } catch (e) {} } });
    var ring = this.add.circle(x, y, cfg.radius * 0.4).setStrokeStyle(3, 0xff8c2e, 0.85).setDepth(42);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 260, ease: 'Cubic.Out',
      onComplete: function () { try { ring.destroy(); } catch (e) {} } });
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active || m === directHit) return;
      if (Math.hypot(m.x - x, m.y - y) < cfg.radius) Entities.hurtMob(self, m, cfg.dmg, self.time.now);
    });
    if (this.boss && this.boss.active && this.boss !== directHit &&
        Math.hypot(this.boss.x - x, this.boss.y - y) < cfg.radius) {
      Entities.hurtBoss(this, this.boss, cfg.dmg);
    }
  },

  // M4.9: environmental kills (the ambush train's mow) CREDIT the player —
  // route through mob-died so they tick the kill count, quota, XP + bounty,
  // exactly like a shot kill (user 2026-07-14).
  killMobCredited: function (m) {
    if (!m || !m.active) return;
    this.events.emit('mob-died', m);
    if (!m.active) return;                        // a quota-triggered wipe may have taken it
    Entities.clearNameTag(m);
    m.body.enable = false;
    this.mobs.killAndHide(m);
  },

  // ---------------------- M4.9: CONDUCTOR ZOMBIE (slime trail) ---------------
  // Drop a lingering green patch; it fades + self-destructs via tween (pause-
  // safe). updateSlime ticks damage on a player standing in any live patch.
  dropSlime: function (x, y, cfg) {
    // M5.7: the Forge Hound sets fire:true — the patch recolors to embers and
    // reads/labels as a burn trail (same hazard-pool tech as the green slime).
    var fill = cfg.fire ? 0xff7a2c : 0x49e83b, stroke = cfg.fire ? 0xffd34d : 0x8ff0a5;
    var patch = this.add.ellipse(x, y, cfg.radius * 2, cfg.radius * 1.5, fill, 0.32)
      .setDepth(3).setStrokeStyle(1, stroke, 0.5);
    if (cfg.fire) patch.setBlendMode(Phaser.BlendModes.ADD);
    var rec = { obj: patch, x: x, y: y, r: cfg.radius, dmg: cfg.dmg, tickMs: cfg.tickMs,
                src: cfg.fire ? 'a burning trail' : 'toxic slime',
                dieAt: this.time.now + cfg.lifeMs };
    this.slimePatches.push(rec);
    this.tweens.add({ targets: patch, alpha: 0.08, duration: cfg.lifeMs, ease: 'Sine.In',
      onComplete: function () { rec.dead = true; try { patch.destroy(); } catch (e) {} } });
  },

  updateSlime: function (time) {
    if (!this.slimePatches || !this.slimePatches.length) return;
    var live = [], p = this.player, inSlime = false, dmg = 0, tickMs = 480, src = 'toxic slime';
    for (var i = 0; i < this.slimePatches.length; i++) {
      var s = this.slimePatches[i];
      if (s.dead || time >= s.dieAt) { if (s.obj && s.obj.active) { try { s.obj.destroy(); } catch (e) {} } continue; }
      live.push(s);
      if (p.state.alive && Math.hypot(p.x - s.x, p.y - s.y) < s.r) { inSlime = true; dmg = s.dmg; tickMs = s.tickMs; src = s.src || 'toxic slime'; }
    }
    this.slimePatches = live;
    if (inSlime && time - (this._lastSlimeTickAt || 0) >= tickMs) {
      this._lastSlimeTickAt = time;
      Entities.hurtPlayer(this, p, dmg, time, src);
    }
  },

  // ---------------------- M4.9: SMOG SERPENT (concealment fog) ---------------
  // Each serpent pulses a cloud 5s on / 5s off. While ON, every mob inside the
  // cloud (the serpent too, if concealSelf) gets m.mob.concealed = true — the
  // shot→mob overlap then refuses hits from OUTSIDE the cloud. playerInFog is
  // set when the player stands in ANY live cloud. Fog clocks are absolute →
  // shifted in unfreeze().
  updateFog: function (time) {
    var self = this, anyPlayerInFog = false;
    // clear last frame's concealment first
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob) m.mob.concealed = false; });
    this.mobs.children.iterate(function (caster) {
      if (!caster || !caster.active || !caster.mob) return;
      var fog = caster.mob.def.fog; if (!fog) return;
      if (!caster.mob.fogPhaseAt) { caster.mob.fogPhaseAt = time + fog.onMs; caster.mob.fogOn = true; }
      if (time >= caster.mob.fogPhaseAt) {                 // flip the phase
        caster.mob.fogOn = !caster.mob.fogOn;
        caster.mob.fogPhaseAt = time + (caster.mob.fogOn ? fog.onMs : fog.offMs);
      }
      if (caster.mob.fogOn) {
        if (!caster.mob.fogSprite) {
          // depth 7: above mobs (5) so it veils them, below shots (8) + player
          // (10) so you can still see yourself and your fire inside the smog.
          caster.mob.fogSprite = self.add.sprite(caster.x, caster.y, 'softglow')
            .setTint(0x9aa2b2).setDepth(7).setBlendMode(Phaser.BlendModes.NORMAL);
        }
        var breathe = 0.9 + 0.1 * Math.sin(time / 260);
        caster.mob.fogSprite.setVisible(true).setPosition(caster.x, caster.y)
          .setScale(fog.radius / 32 * 2.0 * breathe).setAlpha(0.42);
        var pIn = self.player.state.alive && Math.hypot(self.player.x - caster.x, self.player.y - caster.y) < fog.radius;
        if (pIn) anyPlayerInFog = true;
        self.mobs.children.iterate(function (m) {
          if (!m || !m.active || !m.mob) return;
          if (m === caster && !fog.concealSelf) return;
          if (Math.hypot(m.x - caster.x, m.y - caster.y) < fog.radius) m.mob.concealed = true;
        });
      } else if (caster.mob.fogSprite) {
        caster.mob.fogSprite.setVisible(false);
      }
    });
    this.playerInFog = anyPlayerInFog;
    // paint concealment: a concealed mob you CAN'T reach fades to a ghost; once
    // you're in the fog it (and its cloud-mates) resolve back to solid.
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active || !m.mob) return;
      if (m.mob.concealed && !anyPlayerInFog) m.setAlpha(0.22);
      else if (m.mob.hp > 0) m.setAlpha(1);
    });
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
    this.updateTornadoes(time);                            // M4: Knight whirlwind tornadoes
    this.updateWhirlwind(time);                            // M4: Knight whirlwind ring VFX
    this.updateRegenGlow(time);                            // M4.8: Ranger dodge-regen aura
    this.updateSlime(time);                                // M4.9: conductor-zombie slime hazard
    this.updateFog(time);                                  // M4.9: smog-serpent concealment fog
    // Train runs unless HITSTOP has physics (and the player's dodge) frozen —
    // the train moves manually, so without this gate it advanced ~42px per
    // hitstop into a player who couldn't move (audit fix 2026-07-14).
    if (this.hifiWorld && !this.hitstopActive) this.updateTrainYard(time, delta);
    // M4.7: a rolling GHOST EXPRESS finishes its pass even if the player just
    // died (same rule as the ambush train); frozen during hitstop the same way.
    if (!this.hitstopActive) this.updateGhostTrain(time, delta);
    this.updateGrove(time, delta);                         // M5.0: grove hazard/queues/revive
    this.updateGraveyard(time, delta);                     // M5.6: witching cycle + gate/fences
    this.updateFactory(time, delta);                       // M5.7: conveyors + alive props + engineer
    // M7 REGISTRY: the map's per-frame loop — owns its toroidal wrap, ambient
    // cycle, movers + hazard pools (checks scene.hitstopActive itself if its
    // movers must freeze with the world, like the trains do).
    var MRU = MAPS.forScene ? MAPS.forScene(this) : null;
    if (MRU && MRU.scene && MRU.scene.update) MRU.scene.update(this, time, delta);
    if (!this.player.state.alive && this.lanternG) this.lanternG.clear();   // no beam over the death screen
    if (!this.player.state.alive && this.sunG) this.sunG.clear();           // M5.0: sunlance too
    this.updateHud();
  },

  // ============================ M5.0 — THE GROVE ============================
  // The enchanted forest realm (user picks 2026-07-14/15): lush grass arena
  // ringed by canopy, scattered trees + glowshrooms, drifting fireflies, the
  // HEARTWOOD at the north clearing (the Grovekeeper's tree), and the
  // FALLING ANCIENT TREES hazard — telegraph → crush (mows credit) → the
  // trunk LINGERS as a wall, then crumbles. Ambient falls stop while the
  // boss lives: TIMBER is his verb.
  setupGrove: function (WW, HH) {
    var self = this;
    this.add.tileSprite(WW / 2, HH / 2, WW, HH, 'grovegrass').setDepth(-20);
    // dappled clearings (deterministic scatter, like the yard's oil stains)
    for (var i = 0; i < 40; i++) {
      var ox = (i * 811 % WW), oy = ((i * 677 + 401) % HH);
      this.add.ellipse(ox, oy, 40 + (i % 5) * 26, 26 + (i % 3) * 16, 0x63b25a, 0.10).setDepth(-19);
    }
    // border canopy band
    var wt = 26;
    this.add.tileSprite(WW / 2, wt / 2, WW, wt, 'grovewall').setDepth(-18);
    this.add.tileSprite(WW / 2, HH - wt / 2, WW, wt, 'grovewall').setDepth(-18).setFlipY(true);
    this.add.tileSprite(wt / 2, HH / 2, HH, wt, 'grovewall').setDepth(-18).setAngle(90);
    this.add.tileSprite(WW - wt / 2, HH / 2, HH, wt, 'grovewall').setDepth(-18).setAngle(-90);
    // THE HEARTWOOD — the great tree, north-center; the boss arrives FROM it
    this.heartwood = this.add.image(WW * 0.5, HH * 0.2, 'heartwood').setDepth(2).setScale(1.4);
    // DECORATION PASS (user picks 2026-07-15: oak willow toadstool fairy-ring
    // pond boulders stump flowers lanterns arch runestone log spring obelisk).
    // Deterministic scatter per type; everything stays clear of the center
    // start and the heartwood clearing. Visual-only (the grove has no walls —
    // only fallen trunks block).
    // PLANNED LAYOUT (user 2026-07-15: "dont just place randomly") — the map
    // is COMPOSED, not scattered. Zones, each a deliberate scene:
    //  · THE SHRINE — runestones ring the Heartwood clearing, twin arches
    //    gate the approach, flower beds at the roots
    //  · THE LANTERN TRAIL — pixie lanterns stagger from spawn to the shrine
    //    (they literally light the way to the boss)
    //  · POND GLADES (W / E / NE) — a willow leans over each pond, a wisp
    //    spring or log at the bank
    //  · TREE COPSES (NW / NE / W / E / S) — oaks + grove trees grouped like
    //    real woods, toadstools + stumps + logs in their shade
    //  · THE FAIRY MEADOW (SW) — fairy rings among the wildflowers
    //  · THE OLD RUINS (SE) — obelisks, an arch, a runestone, rubble
    // Coordinates are FRACTIONS of the world; nothing overlaps by design.
    var PLAN = [
      // — the shrine —
      ['dcArch', .44, .30, 1.5], ['dcArch', .56, .30, 1.5],
      ['dcRunestone', .36, .26, 1.2], ['dcRunestone', .64, .26, 1.2],
      ['dcRunestone', .335, .165, 1.2], ['dcRunestone', .665, .165, 1.2],
      ['dcRunestone', .50, .335, 1.15],
      ['dcFlowers', .445, .205, 1.2], ['dcFlowers', .555, .205, 1.2],
      // — the lantern trail (spawn → shrine) —
      ['dcLanterns', .487, .435, 1.2], ['dcLanterns', .515, .395, 1.2],
      ['dcLanterns', .487, .355, 1.2], ['dcLanterns', .515, .315, 1.2],
      // — west pond glade —
      ['dcPond', .20, .42, 1.7], ['dcWillow', .143, .378, 1.4],
      ['dcSpring', .247, .478, 1.3], ['dcFlowers', .158, .468, 1.1],
      ['dcLog', .263, .398, 1.2],
      // — east pond glade —
      ['dcPond', .80, .60, 1.6], ['dcWillow', .857, .562, 1.35],
      ['dcBoulders', .752, .655, 1.2], ['dcFlowers', .833, .663, 1.1],
      // — north-east pond —
      ['dcPond', .625, .135, 1.5], ['dcWillow', .668, .095, 1.25],
      ['dcLog', .578, .175, 1.15],
      // — NW copse —
      ['dcOak', .14, .14, 1.6], ['dcOak', .225, .098, 1.35],
      ['grovetree', .187, .193, 1.1], ['dcToadstool', .112, .215, 1.15],
      ['dcStump', .248, .168, 1.1], ['dcLog', .163, .255, 1.2],
      // — NE copse —
      ['dcOak', .84, .12, 1.5], ['dcOak', .92, .175, 1.3],
      ['grovetree', .882, .225, 1.05], ['dcToadstool', .935, .098, 1.2],
      ['dcBoulders', .795, .185, 1.15],
      // — west copse —
      ['dcOak', .095, .60, 1.5], ['dcWillow', .155, .652, 1.3],
      ['grovetree', .078, .682, 1.0], ['dcToadstool', .142, .722, 1.1],
      // — east copse —
      ['dcOak', .90, .355, 1.55], ['grovetree', .858, .298, 1.05],
      ['dcWillow', .942, .418, 1.3], ['dcStump', .843, .413, 1.1],
      // — SW fairy meadow —
      ['dcFairyRing', .17, .80, 1.3], ['dcFairyRing', .30, .872, 1.15],
      ['dcFlowers', .222, .758, 1.2], ['dcFlowers', .113, .862, 1.1],
      ['dcToadstool', .268, .792, 1.1], ['dcLanterns', .198, .905, 1.2],
      // — SE old ruins —
      ['dcObelisk', .82, .83, 1.4], ['dcObelisk', .877, .872, 1.25],
      ['dcArch', .845, .788, 1.45], ['dcRunestone', .788, .875, 1.2],
      ['dcBoulders', .906, .812, 1.25], ['dcStump', .773, .798, 1.05],
      // — south copse —
      ['dcOak', .46, .862, 1.5], ['dcOak', .552, .888, 1.4],
      ['dcWillow', .506, .818, 1.3], ['grovetree', .418, .902, 1.05],
      ['dcLog', .582, .843, 1.2], ['dcToadstool', .49, .928, 1.15],
      // — open-field accents (each alone, breathing room; nudged clear of
      //   the treeline dividers below) —
      ['dcFairyRing', .64, .48, 1.2], ['dcFlowers', .74, .415, 1.1],
      ['dcSpring', .60, .552, 1.25], ['dcRunestone', .375, .552, 1.2],
      ['dcFlowers', .382, .625, 1.15], ['dcBoulders', .27, .488, 1.15],
      ['dcToadstool', .72, .27, 1.1], ['dcStump', .30, .38, 1.05],
      ['dcFlowers', .60, .78, 1.1], ['dcBoulders', .40, .79, 1.15],
      ['dcOak', .66, .89, 1.45], ['grovetree', .74, .77, 1.05]
    ];
    // TREELINE DIVIDERS (user: "rows of trees to section off areas") — hedge
    // rows that carve the map into rooms, each with a deliberate GAP doorway:
    //  · north wall (either side of the shrine approach — the arch gate)
    //  · west wall (gap mid-row → the west pond glade)
    //  · east wall (gap → the east meadow)
    //  · south wall (gap → the fairy meadow / ruins / south woods)
    var treeRow = function (x0, y0, x1, y1, gaps) {
      var dx2 = x1 - x0, dy2 = y1 - y0;
      var len = Math.hypot(dx2 * WW, dy2 * HH);
      var steps = Math.max(1, Math.round(len / 104));
      for (var i3 = 0; i3 <= steps; i3++) {
        var t3 = i3 / steps;
        var skip = false;
        (gaps || []).forEach(function (g2) { if (t3 >= g2[0] && t3 <= g2[1]) skip = true; });
        if (skip) continue;
        var key3 = (i3 % 3 === 2) ? 'grovetree' : 'dcOak';
        var wob = ((i3 * 37) % 5 - 2) * 9;                  // organic stagger, deterministic
        PLAN.push([key3, x0 + dx2 * t3 + wob / WW, y0 + dy2 * t3 + ((i3 * 53) % 5 - 2) * 7 / HH,
                   1.15 + (i3 % 3) * 0.14]);
      }
    };
    treeRow(.06, .34, .40, .34, []);                        // north wall, west span
    treeRow(.60, .34, .94, .34, []);                        //   (shrine gate between)
    treeRow(.32, .44, .32, .70, [[0.42, 0.62]]);            // west wall + doorway
    treeRow(.705, .30, .705, .56, [[0.38, 0.62]]);          // east wall + doorway
    treeRow(.34, .735, .66, .735, [[0.42, 0.62]]);          // south wall + doorway
    var DECOR_DEPTH = { dcPond: 0.5, dcFlowers: 0.6, dcFairyRing: 1, dcLog: 1, dcSpring: 1 };
    PLAN.forEach(function (d2) {
      if (!self.textures.exists(d2[0])) return;
      self.add.image(d2[1] * WW, d2[2] * HH, d2[0])
        .setDepth(DECOR_DEPTH[d2[0]] !== undefined ? DECOR_DEPTH[d2[0]] : 2)
        .setScale(d2[3]);
    });
    // glowshrooms — planned too: shade of the copses + along the trail edges
    [[.325, .225], [.675, .225], [.245, .555], [.755, .49], [.135, .485],
     [.875, .655], [.435, .69], [.565, .69], [.29, .93], [.71, .935]].forEach(function (gp, s2) {
      var shroom = self.add.image(gp[0] * WW, gp[1] * HH, 'glowshroom').setDepth(1).setScale(1.1);
      self.tweens.add({ targets: shroom, alpha: { from: 1, to: 0.72 }, duration: 1400 + (s2 % 4) * 300,
                        yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    // fireflies — slow wandering warm motes (cosmetic; tween-driven, pause-safe)
    this.fireflies = [];
    for (var f2 = 0; f2 < 14; f2++) {
      var fx = Math.random() * WW, fy = Math.random() * HH;
      var fly = this.add.image(fx, fy, 'glowdot').setTint(0xffe3a8).setScale(1.4)
        .setDepth(15).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD);
      this.fireflies.push(fly);
      (function wander(spr) {
        if (!spr.active) return;
        self.tweens.add({ targets: spr,
          x: Phaser.Math.Clamp(spr.x + (Math.random() * 300 - 150), 40, WW - 40),
          y: Phaser.Math.Clamp(spr.y + (Math.random() * 300 - 150), 40, HH - 40),
          alpha: { from: 0.75, to: 0.25 + Math.random() * 0.5 },
          duration: 2200 + Math.random() * 2200, ease: 'Sine.inOut',
          onComplete: function () { wander(spr); } });
      })(fly);
    }
    // fallen-trunk WALLS — a static group; colliders wire in create() once the
    // player + mob groups exist (wireGroveColliders).
    this.trunkGroup = this.physics.add.staticGroup();
    this._trunkColliderPending = true;
    // the ambient fall scheduler
    var TF = this.realmDef.treeFall;
    this.groveFall = { phase: 'idle', nextAt: this.time.now + 6000 + Math.random() * 6000, cfg: TF };
  },

  // Colliders need the player, which is created after the world — finish here.
  wireGroveColliders: function () {
    if (!this._trunkColliderPending) return;
    this._trunkColliderPending = false;
    this.physics.add.collider(this.player, this.trunkGroup);
    this.physics.add.collider(this.mobs, this.trunkGroup);
  },

  // ============================ M5.6 — THE GRAVEYARD =======================
  // Biome 3 (user design 2026-07-15, graveyard-map-plan.md). A PLANNED moonlit
  // cemetery: south IRON GATE spawn (auto-opens) → winding lantern path → four
  // fence-divided plots (old graves / monument garden / crypt+angel / celtic
  // shrine+fungus) → north boss arena with the OPEN GRAVE (the Gravekeeper
  // climbs out). Signature system: THE WITCHING CYCLE — witching fog + restless
  // graves + soul wisps, all conducted by the CURSED BELL (~45s tolls). Iron
  // fences are DESTRUCTIBLE. Ambient cycle stands down during arrival/boss.
  setupGraveyard: function (WW, HH) {
    var self = this;
    // SPAWN at the south gate (create() reads this._realmStart).
    this._realmStart = { x: WW * 0.5, y: HH * 0.90 };
    // ground + soft vignette (dark, moonlit)
    this.add.tileSprite(WW / 2, HH / 2, WW, HH, 'gravedirt').setDepth(-20);
    for (var i = 0; i < 44; i++) {
      var ox = (i * 811 % WW), oy = ((i * 677 + 401) % HH);
      this.add.ellipse(ox, oy, 50 + (i % 5) * 30, 30 + (i % 3) * 18, 0x1a2438, 0.12).setDepth(-19);
    }
    // border murk band
    this.add.rectangle(WW / 2, 14, WW, 28, 0x0a0c14, 0.85).setDepth(-18);
    this.add.rectangle(WW / 2, HH - 14, WW, 28, 0x0a0c14, 0.85).setDepth(-18);
    this.add.rectangle(14, HH / 2, 28, HH, 0x0a0c14, 0.85).setDepth(-18);
    this.add.rectangle(WW - 14, HH / 2, 28, HH, 0x0a0c14, 0.85).setDepth(-18);

    // ---- winding LANTERN PATH (pale band) from the gate up to the arena ----
    var pathPts = [[.50, .93], [.50, .80], [.44, .70], [.52, .58], [.47, .46],
                   [.52, .34], [.50, .24], [.50, .17]];
    for (var p = 0; p < pathPts.length - 1; p++) {
      var a2 = pathPts[p], b2 = pathPts[p + 1];
      var seg = self.add.line(0, 0, a2[0] * WW, a2[1] * HH, b2[0] * WW, b2[1] * HH, 0x5a4a36, 0.55)
        .setOrigin(0, 0).setLineWidth(20).setDepth(-17);
    }

    // ---- PLANNED DECOR (composed, not scattered) — see graveyard_scene_plan ----
    // [key, xFrac, yFrac, scale]
    var PLAN = [
      // — south iron GATE (spawn) —
      ['gyGate', .50, .955, 1.5],
      ['gyDeadTree', .10, .92, 1.4], ['gyDeadTree', .90, .93, 1.4],
      // — SW plot: THE OLD GRAVES (headstone / cross rows, cemetery grid) —
      ['gyHeadstone', .10, .60, 1.1], ['gyCross', .18, .60, 1.1], ['gyHeadstone', .26, .60, 1.1], ['gyBroken', .34, .60, 1.1],
      ['gyCross', .10, .68, 1.1], ['gyHeadstone', .18, .68, 1.1], ['gyBroken', .26, .68, 1.1], ['gyHeadstone', .34, .68, 1.1],
      ['gyHeadstone', .10, .76, 1.1], ['gyBroken', .18, .76, 1.1], ['gyHeadstone', .26, .76, 1.1], ['gyCross', .34, .76, 1.1],
      ['gyWreath', .14, .84, 1.0], ['gyCandles', .30, .84, 1.0], ['gyDeadTree', .06, .70, 1.2],
      // — SE plot: THE MONUMENT GARDEN (obelisks / tomb / coffin / candles) —
      ['gyObelisk', .66, .60, 1.3], ['gyObelisk', .86, .60, 1.3],
      ['gySarcophagus', .76, .70, 1.25], ['gyCoffin', .64, .78, 1.15],
      ['gyCandles', .86, .78, 1.0], ['gyHeadstone', .90, .66, 1.05], ['gyBroken', .60, .68, 1.0],
      ['gyDeadTree', .94, .84, 1.3],
      // — NW plot: THE CRYPT + angel plaza (the bell lives here) —
      ['gyCrypt', .18, .28, 1.5], ['gyAngel', .10, .42, 1.25], ['gyAngel', .30, .42, 1.25],
      ['gyHeadstone', .08, .30, 1.0], ['gyCross', .30, .30, 1.0], ['gyCandles', .18, .44, 1.0],
      ['gyCobweb', .045, .18, 1.4],
      // — NE plot: CELTIC SHRINE + fungus glade —
      ['gyCeltic', .74, .30, 1.35], ['gyObelisk', .88, .30, 1.2],
      ['gyFungus', .66, .40, 1.15], ['gyFungus', .84, .42, 1.15], ['gyFungus', .78, .34, 1.0],
      ['gyDeadTree', .94, .22, 1.3], ['gyCobweb', .955, .18, 1.4],
      // — the ARENA (north): open grave the boss climbs from + candle ring —
      ['gyCandles', .42, .12, 1.0], ['gyCandles', .58, .12, 1.0],
      ['gyCross', .40, .20, 1.0], ['gyCross', .60, .20, 1.0]
    ];
    // lamp posts stagger up the path (they light the way to the boss)
    pathPts.forEach(function (pp, i2) { if (i2 % 1 === 0) PLAN.push(['gyLamp', pp[0] + (i2 % 2 ? .05 : -.05), pp[1], 1.15]); });
    var DECOR_DEPTH = { gyCandles: 1, gyFungus: 1, gyCobweb: 0.5, gyWreath: 1 };
    PLAN.forEach(function (d2) {
      if (!self.textures.exists(d2[0])) return;
      self.add.image(d2[1] * WW, d2[2] * HH, d2[0])
        .setDepth(DECOR_DEPTH[d2[0]] !== undefined ? DECOR_DEPTH[d2[0]] : 2)
        .setScale(d2[3]);
    });
    // the ARENA OPEN GRAVE — dark pit the Gravekeeper hauls himself out of
    this.arenaGrave = { x: WW * 0.5, y: HH * 0.15 };
    this.add.ellipse(this.arenaGrave.x, this.arenaGrave.y, 96, 60, 0x0a0a10, 0.9).setDepth(0);
    this.add.ellipse(this.arenaGrave.x, this.arenaGrave.y, 96, 60, 0x14201a, 0.5).setDepth(0).setStrokeStyle(3, 0x3a4a30);

    // ---- DESTRUCTIBLE IRON FENCES — carve the plots, doorway gaps ----------
    this.fenceGroup = this.physics.add.staticGroup();
    this.graveFences = [];
    // fences are SOLID barriers now — no doorway gaps (user: they're
    // destructible, so you smash through wherever you like).
    var fenceRow = function (x0, y0, x1, y1) {
      var dx2 = x1 - x0, dy2 = y1 - y0;
      var vertical = Math.abs(dy2 * HH) > Math.abs(dx2 * WW);   // a vertical (top-view) divider run
      var len = Math.hypot(dx2 * WW, dy2 * HH);
      var steps = Math.max(1, Math.round(len / (vertical ? 40 : 58)));
      for (var k = 0; k <= steps; k++) {
        var t = k / steps;
        var px = (x0 + dx2 * t) * WW, py = (y0 + dy2 * t) * HH;
        var tex = vertical ? 'gyFenceV' : 'gyFence';
        var panel = self.fenceGroup.create(px, py, tex).setDepth(2).setScale(1.0);
        var bw = vertical ? 22 : 52, bh = vertical ? 52 : 22;   // collision box matches orientation
        panel.body.setSize(bw, bh); panel.body.setOffset((64 - bw) / 2, (64 - bh) / 2);
        var fhp = (self.realmDef.fence && self.realmDef.fence.hp) || 24;   // balance knob (data.js)
        self.graveFences.push({ spr: panel, hp: fhp, vertical: vertical });
      }
    };
    fenceRow(.06, .52, .94, .52);                          // mid divider (solid — smash the path panel)
    fenceRow(.28, .55, .28, .86);                          // SW / path divider
    fenceRow(.72, .55, .72, .86);                          // SE / path divider
    fenceRow(.28, .18, .28, .48);                          // NW divider
    fenceRow(.72, .18, .72, .48);                          // NE divider
    this._fenceColliderPending = true;

    // the GATE auto-opens as you approach (cosmetic swing/fade)
    this.graveGate = { x: WW * 0.5, y: HH * 0.955, opened: false };

    // ---- drifting GREEN MOTES (cosmetic) ----
    this.motes = [];
    for (var f2 = 0; f2 < 14; f2++) {
      var fx = Math.random() * WW, fy = Math.random() * HH;
      var mote = this.add.image(fx, fy, 'glowdot').setTint(0x78ff96).setScale(1.2)
        .setDepth(15).setAlpha(0.6).setBlendMode(Phaser.BlendModes.ADD);
      this.motes.push(mote);
      (function wander(spr) {
        if (!spr.active) return;
        self.tweens.add({ targets: spr,
          x: Phaser.Math.Clamp(spr.x + (Math.random() * 260 - 130), 40, WW - 40),
          y: Phaser.Math.Clamp(spr.y + (Math.random() * 260 - 130), 40, HH - 40),
          alpha: { from: 0.6, to: 0.2 + Math.random() * 0.4 },
          duration: 2400 + Math.random() * 2200, ease: 'Sine.inOut',
          onComplete: function () { wander(spr); } });
      })(mote);
    }

    // ---- lamp glow anchors (fog burns clear holes here) ----
    this.lampGlows = [];
    PLAN.forEach(function (d2) { if (d2[0] === 'gyLamp' || d2[0] === 'gyCandles' || d2[0] === 'gyFungus')
      self.lampGlows.push({ x: d2[1] * WW, y: d2[2] * HH, r: d2[0] === 'gyLamp' ? 150 : 90 }); });

    // ---- THE WITCHING CYCLE scheduler ----
    var w = this.realmDef.witching;
    this.witching = {
      cfg: w,
      fog: [],                                            // drifting conceal banks
      nextGraveAt: this.time.now + 5000 + Math.random() * 5000,
      grave: null,                                        // active restless-grave telegraph
      nextBellAt: this.time.now + w.bell.everyMs,
      bellTollsLeft: 0, nextTollAt: 0,
      surgeUntil: 0
    };
    // spawn the fog banks
    for (var fb = 0; fb < w.fog.banks; fb++) {
      var ang = Math.random() * Math.PI * 2;
      var fog = this.add.sprite(Math.random() * WW, Math.random() * HH, 'softglow')
        .setDepth(16).setAlpha(0.16).setTint(0x8fd6ff).setBlendMode(Phaser.BlendModes.ADD)
        .setScale(w.fog.radius / 32);
      this.witching.fog.push({ spr: fog, x: fog.x, y: fog.y, vx: Math.cos(ang) * w.fog.driftSpeed, vy: Math.sin(ang) * w.fog.driftSpeed });
    }
    this.soulWisps = [];
    this.gasPatches = [];
  },

  // colliders need the player (created after the world)
  wireGraveyardColliders: function () {
    if (!this._fenceColliderPending) return;
    this._fenceColliderPending = false;
    this.physics.add.collider(this.player, this.fenceGroup);
    // BALANCE ROUND 2026-07-15: mobs CHEW panels open while pressed against
    // them (the locked design: "shots/mobs can smash panels") — the swarm
    // never dead-ends on a fence, and hiding in a plot only buys seconds.
    this.physics.add.collider(this.mobs, this.fenceGroup, this.mobChewFence, null, this);
    this.physics.add.overlap(this.playerShots, this.fenceGroup, this.hitFence, null, this);
    // symmetry (Red: unavoidable damage): ENEMY shots die on fences too — an
    // archer can no longer snipe you through a wall your own arrows can't pass.
    this.physics.add.overlap(this.enemyShots, this.fenceGroup, this.enemyShotFence, null, this);
  },

  // shared fence damage path (player shots + mob chew) — degradation frames,
  // then the panel smashes open
  damageFence: function (panel, dmg) {
    var rec = null;
    for (var i = 0; i < this.graveFences.length; i++) if (this.graveFences[i].spr === panel) { rec = this.graveFences[i]; break; }
    if (!rec || rec.dead) return;
    if (!rec.maxHp) rec.maxHp = rec.hp;
    rec.hp -= dmg;
    this.burst(panel.x, panel.y, 4, 0x9296a6);
    try { AUDIO.play('thud'); } catch (e0) {}
    if (rec.hp <= 0) {
      this.burst(panel.x, panel.y, 12, 0x9296a6);
      try { AUDIO.play('crash'); } catch (e) {}
      panel.body.enable = false; this.fenceGroup.killAndHide(panel); try { panel.destroy(); } catch (e2) {}
      rec.dead = true;
    } else {
      // DEGRADATION — swap in the bent / mangled frame as HP drops (the
      // vertical/top-view fences have their own damage family)
      var frac = rec.hp / rec.maxHp;
      var fam = rec.vertical ? ['gyFenceV', 'gyFenceVDmg1', 'gyFenceVDmg2'] : ['gyFence', 'gyFenceDmg1', 'gyFenceDmg2'];
      var want = frac > 0.62 ? fam[0] : (frac > 0.3 ? fam[1] : fam[2]);
      if (panel.texture && panel.texture.key !== want && this.textures.exists(want)) panel.setTexture(want);
    }
  },

  // a player shot smashes an iron fence panel. BUGFIX (Red: "fences sometimes
  // not hittable"): the once-guard now lives on shot.proj — a FRESH object per
  // fire — instead of the pooled sprite, where a stale flag from a recycled
  // shot's past life let it sail through panels without damaging them.
  hitFence: function (shot, panel) {
    if (!shot.active || !panel.active || !shot.proj || shot.proj._hitFence) return;
    shot.proj._hitFence = true;                 // one hit per shot (overlap re-fires)
    shot.proj.dieAt = 0;                        // the arrow dies on the iron
    this.damageFence(panel, shot.proj.dmg || 8);
  },

  // an ENEMY shot dies on the iron too (no fence damage — mobs break fences
  // by CHEWING, below)
  enemyShotFence: function (shot, panel) {
    if (!shot.active || !panel.active || !shot.proj || shot.proj._hitFence) return;
    shot.proj._hitFence = true;
    shot.proj.dieAt = 0;
  },

  // a mob pressed against a panel gnaws it open (per-panel cadence — a pack
  // chews faster only because more panels are being hit at once)
  mobChewFence: function (mob, panel) {
    if (!mob.active || !panel.active || !mob.mob) return;
    var cfg = (this.realmDef && this.realmDef.fence) || { chewDmg: 8, chewMs: 450 };
    var rec = null;
    for (var i = 0; i < this.graveFences.length; i++) if (this.graveFences[i].spr === panel) { rec = this.graveFences[i]; break; }
    if (!rec || rec.dead) return;
    var t = this.time.now;
    if (rec.lastChewAt && t - rec.lastChewAt < cfg.chewMs) return;
    rec.lastChewAt = t;
    this.damageFence(panel, cfg.chewDmg);
  },

  // CORPSE BLOATER death gas — a lingering poison cloud (slime-patch tech)
  dropGas: function (x, y, cfg) {
    if (!this.gasPatches) this.gasPatches = [];
    var g = this.add.ellipse(x, y, cfg.radius * 2, cfg.radius * 2, 0x78dc96, 0.28).setDepth(1);
    this.tweens.add({ targets: g, alpha: { from: 0.32, to: 0.12 }, duration: 700, yoyo: true, repeat: -1 });
    this.gasPatches.push({ obj: g, x: x, y: y, r: cfg.radius, dmg: cfg.dmg, tickMs: cfg.tickMs,
                           dieAt: this.time.now + cfg.lifeMs, lastTick: 0 });
    try { AUDIO.play('crash'); } catch (e) {}
  },

  // SOUL WISP — a kill may free a soul that drifts toward the crypt; a pickup
  // grants a stacking buff. A Banshee that touches one EATS it (buffs instead).
  maybeReleaseWisp: function (x, y) {
    var w = this.witching && this.witching.cfg.wisps; if (!w) return;
    if (Math.random() > w.chance) return;
    var target = this.arenaGrave ? { x: this.worldW * 0.18, y: this.worldH * 0.28 } : { x: this.worldW / 2, y: this.worldH / 2 };  // the crypt
    var spr = this.add.image(x, y, 'glowdot').setTint(0x8fd6ff).setScale(1.6).setDepth(17)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9);
    this.soulWisps.push({ spr: spr, x: x, y: y, tx: target.x, ty: target.y, dieAt: this.time.now + w.lifeMs });
  },

  applyWispBuff: function () {
    var w = this.witching.cfg.wisps.buff, st = this.player.state;
    st._wispStacks = Math.min((st._wispStacks || 0) + 1, w.maxStacks);
    // reuse the move-mult mechanism (updatePlayer reads slowUntil/slowMult):
    // slowMult > 1 = a HASTE window. TUNE ME.
    st.slowUntil = this.time.now + w.hasteMs; st.slowMult = w.hasteMult;
    var cap = (st.stats && st.stats.hp) || st.hp;
    var heal = Math.round(cap * w.healPct);
    st.hp = Math.min(cap, st.hp + heal);
    this.burst(this.player.x, this.player.y, 10, 0x8fd6ff);
    try { AUDIO.play('chime'); } catch (e) {}
  },

  // ---- per-frame graveyard upkeep: gate, fences, gas, the Witching Cycle ----
  updateGraveyard: function (time, delta) {
    if (!this.realmDef || this.realmDef.kind !== 'graveyard') return;
    var self = this, W = this.witching; if (!W) return;
    var player = this.player, alive = player.state.alive;
    this.wrapGraveyard();                                   // toroidal map — off one edge, on the other
    var ambient = alive && !this.closing && !this.graveArrivalActive && !this.boss;

    // MUMMY CURSE — a contact curse ticks the player until it wears off
    var ps = player.state;
    if (alive && ps.curseUntil && time < ps.curseUntil) {
      if (time >= (ps.curseNextAt || 0)) {
        ps.curseNextAt = time + (ps.curseTickMs || 600);
        Entities.hurtPlayer(this, player, ps.curseDmg || 4, time, 'a mummy curse');
      }
    } else if (ps.curseUntil) { ps.curseUntil = 0; }

    // GATE auto-open
    if (this.graveGate && !this.graveGate.opened &&
        Math.hypot(player.x - this.graveGate.x, player.y - this.graveGate.y) < 150) {
      this.graveGate.opened = true;
      // (cosmetic — the gate is decor; flag it open so it only fires once)
      this.burst(this.graveGate.x, this.graveGate.y, 8, 0x9296a6);
      try { AUDIO.play('creak'); } catch (e) {}
    }

    // GAS PATCHES — tick the player standing inside
    if (this.gasPatches && this.gasPatches.length) {
      for (var gi = this.gasPatches.length - 1; gi >= 0; gi--) {
        var gp = this.gasPatches[gi];
        if (time >= gp.dieAt) { if (gp.obj) { try { gp.obj.destroy(); } catch (e) {} } this.gasPatches.splice(gi, 1); continue; }
        if (alive && Math.hypot(player.x - gp.x, player.y - gp.y) < gp.r && time - gp.lastTick >= gp.tickMs) {
          gp.lastTick = time; Entities.hurtPlayer(this, player, gp.dmg, time, gp.boss ? 'a curse sigil' : 'corpse gas', !!gp.boss);
        }
      }
    }

    // WITCHING FOG — drift banks; conceal mobs inside (lamps/candles burn holes)
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob) m.mob._gyConceal = false; });
    var thick = time < W.surgeUntil ? 1.5 : 1;
    var pInFog = false;
    for (var fi = 0; fi < W.fog.length; fi++) {
      var fk = W.fog[fi];
      fk.x += fk.vx * delta / 1000; fk.y += fk.vy * delta / 1000;
      if (fk.x < 0) fk.x += this.worldW; if (fk.x > this.worldW) fk.x -= this.worldW;
      if (fk.y < 0) fk.y += this.worldH; if (fk.y > this.worldH) fk.y -= this.worldH;
      fk.spr.setPosition(fk.x, fk.y).setScale(W.cfg.fog.radius * thick / 32).setAlpha(0.14 * thick);
      var rad = W.cfg.fog.radius * thick;
      if (alive && Math.hypot(player.x - fk.x, player.y - fk.y) < rad) pInFog = true;
      this.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        if (Math.hypot(m.x - fk.x, m.y - fk.y) >= rad) return;
        var lit = false;
        for (var li = 0; li < self.lampGlows.length; li++) { var lg = self.lampGlows[li]; if (Math.hypot(m.x - lg.x, m.y - lg.y) < lg.r) { lit = true; break; } }
        if (!lit) m.mob._gyConceal = true;
      });
    }
    // apply concealment (reuse the smog-serpent flag + paint)
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active || !m.mob) return;
      if (m.mob._gyConceal) { m.mob.concealed = true; if (!pInFog) m.setAlpha(0.24); else m.setAlpha(1); }
    });
    if (pInFog) this.playerInFog = true;

    // SOUL WISPS — drift toward the crypt; player pickup buffs; banshee eats
    if (this.soulWisps && this.soulWisps.length) {
      var wc = W.cfg.wisps;
      for (var wi = this.soulWisps.length - 1; wi >= 0; wi--) {
        var sw = this.soulWisps[wi];
        if (time >= sw.dieAt) { if (sw.spr) { try { sw.spr.destroy(); } catch (e) {} } this.soulWisps.splice(wi, 1); continue; }
        var dxw = sw.tx - sw.x, dyw = sw.ty - sw.y, dw = Math.hypot(dxw, dyw) || 1;
        sw.x += (dxw / dw) * wc.driftSpeed * delta / 1000; sw.y += (dyw / dw) * wc.driftSpeed * delta / 1000;
        sw.spr.setPosition(sw.x, sw.y);
        if (alive && Math.hypot(player.x - sw.x, player.y - sw.y) < 30) {
          this.applyWispBuff(); if (sw.spr) { try { sw.spr.destroy(); } catch (e2) {} } this.soulWisps.splice(wi, 1); continue;
        }
        var eaten = false;
        this.mobs.children.iterate(function (m) {
          if (eaten || !m || !m.active || !m.mob || !m.mob.def.eatsWisps) return;
          if (Math.hypot(m.x - sw.x, m.y - sw.y) < 34) { eaten = true; m.mob.wispFed = (m.mob.wispFed || 0) + 1;
            m.mob.dmgMult = 1 + m.mob.wispFed * 0.25; m.setTint(0x8fd6ff); self.burst(m.x, m.y, 8, 0x8fd6ff); }
        });
        if (eaten) { if (sw.spr) { try { sw.spr.destroy(); } catch (e3) {} } this.soulWisps.splice(wi, 1); }
      }
    }

    // RESTLESS GRAVES — a plot cracks (green warn) → hands erupt (dmg + slow) +
    // a roster mob claws out. Hands hit mobs too (killMobCredited).
    if (ambient && !W.grave && time >= W.nextGraveAt) {
      var gx = Phaser.Math.Clamp(player.x + (Math.random() * 2 - 1) * 320, 80, this.worldW - 80);
      var gy = Phaser.Math.Clamp(player.y + (Math.random() * 2 - 1) * 320, 80, this.worldH - 80);
      var ring = this.add.ellipse(gx, gy, W.cfg.graves.handRadius * 2, W.cfg.graves.handRadius * 2, 0x78ff96, 0.28)
        .setDepth(1).setStrokeStyle(2, 0x78ff96);
      W.grave = { x: gx, y: gy, ring: ring, eruptAt: time + W.cfg.graves.warnMs };
    }
    if (W.grave && time >= W.grave.eruptAt) { this.eruptGrave(W.grave.x, W.grave.y);
      if (W.grave.ring) { try { W.grave.ring.destroy(); } catch (e) {} }
      W.grave = null;
      W.nextGraveAt = time + W.cfg.graves.everyMinMs + Math.random() * (W.cfg.graves.everyMaxMs - W.cfg.graves.everyMinMs);
    } else if (W.grave && !ambient) { if (W.grave.ring) { try { W.grave.ring.destroy(); } catch (e) {} } W.grave = null; }

    // THE CURSED BELL — every ~45s, three tolls; the final toll rings the wave
    if (ambient && time >= W.nextBellAt && W.bellTollsLeft === 0) {
      W.bellTollsLeft = W.cfg.bell.tolls; W.nextTollAt = time;
    }
    if (W.bellTollsLeft > 0 && time >= W.nextTollAt) {
      W.bellTollsLeft--;
      try { AUDIO.play('belltoll'); } catch (e) {}
      this.banner('THE CURSED BELL TOLLS', '#78ff96');
      if (W.bellTollsLeft === 0) { this.bellPeal(); W.nextBellAt = time + W.cfg.bell.everyMs; }
      else W.nextTollAt = time + W.cfg.bell.tollGapMs;
    }
    if (!ambient) { W.bellTollsLeft = 0; }

    // corpse ledger ages out (mirror updateGrove)
    for (var c3 = this.corpses.length - 1; c3 >= 0; c3--) {
      if (this.corpses[c3].used || time - this.corpses[c3].at > 8000) this.corpses.splice(c3, 1);
    }
  },

  // SCREEN WRAP (Red 2026-07-15): the graveyard is TOROIDAL — the player, the
  // swarm, and the reaper that walk off one edge reappear on the opposite side.
  // This kills the edge pile-up (nothing can stack against a wall that isn't
  // there) and gives the "pop up on the other side" the player asked for. The
  // Gravekeeper himself is pinned to his arena, so he never wraps.
  wrapGraveyard: function () {
    var WW = this.worldW, HH = this.worldH;
    // body-aware teleport: an Arcade body must be reset, not just re-x'd, or the
    // body snaps the sprite straight back. Velocity is preserved across the wrap.
    var wrap = function (o) {
      if (!o) return;
      var nx = o.x, ny = o.y, moved = false;
      if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
      if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
      if (!moved) return;
      if (o.body && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
      else { o.x = nx; o.y = ny; }               // plain object (the reaper)
    };
    wrap(this.player);
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    if (this.reaper) wrap(this.reaper);
  },

  // hands erupt at (x,y): damage + brief slow on the player; a roster mob claws
  // out; hands hit mobs too (credited to the player).
  eruptGrave: function (x, y) {
    var self = this, cfg = this.witching.cfg.graves;
    this.burst(x, y, 14, 0xe6dcc0);
    try { AUDIO.play('crash'); } catch (e) {}
    // hand VFX — bony hands claw up out of the dirt, then sink + fade
    for (var h = 0; h < 5; h++) {
      var hx = x + (Math.random() * 2 - 1) * cfg.handRadius, hy = y + (Math.random() * 2 - 1) * cfg.handRadius;
      var hand = this.add.rectangle(hx, hy + 10, 4, 16, 0xe6dcc0).setDepth(2).setAlpha(0);
      (function (hnd, topY) {
        self.tweens.add({ targets: hnd, y: topY, alpha: 1, duration: 260, ease: 'Back.out',
          onComplete: function () {
            self.tweens.add({ targets: hnd, y: topY + 12, alpha: 0, duration: 520, delay: 220,
              onComplete: function () { try { hnd.destroy(); } catch (e) {} } });
          } });
      })(hand, hy - 6);
    }
    // hit player (grab-slow)
    if (this.player.state.alive && Math.hypot(this.player.x - x, this.player.y - y) < cfg.handRadius + 20) {
      Entities.hurtPlayer(this, this.player, cfg.handDmg, this.time.now, 'grasping hands');
      this.player.state.slowUntil = this.time.now + cfg.grabMs; this.player.state.slowMult = 0.5;
    }
    // hands hit mobs too (kill CREDITS the player)
    this.mobs.children.iterate(function (m) {
      if (m && m.active && m.mob && Math.hypot(m.x - x, m.y - y) < cfg.handRadius + 10) {
        Entities.hurtMob(self, m, cfg.handDmg, self.time.now, {});
        if (m.active && m.mob.hp <= 0) self.killMobCredited(m);
      }
    });
    // a roster mob claws out (queued spawn — never group.get in an iterate)
    var roster = DATA.biomes.graveyard.mobs;
    var key = roster[Math.floor(Math.random() * roster.length)];
    this.queueSpawn({ key: key, x: x, y: y });
  },

  // the bell's final toll: fog thickens, ALL corpses rise, mobs surge, a grave wave
  bellPeal: function () {
    var self = this, W = this.witching, time = this.time.now;
    this.banner('THE DEAD ANSWER THE BELL', '#78ff96');
    this.cameras.main.shake(240, 0.006);
    try { AUDIO.play('revive'); } catch (e) {}
    W.surgeUntil = time + W.cfg.bell.surgeMs;
    // rise every field corpse as a Rattlebones (acolyte tech via queueSpawn)
    for (var c = 0; c < this.corpses.length; c++) {
      var co = this.corpses[c];
      if (co.used) continue; co.used = true;
      this.queueSpawn({ key: 'rattlebones', x: co.x, y: co.y, revive: true });
    }
    // mob eyes flare + short speed surge
    this.mobs.children.iterate(function (m) {
      if (!m || !m.active || !m.mob) return;
      m.mob.surgeUntil = W.surgeUntil; m.mob.surgeMult = W.cfg.bell.surgeMult; m.setTint(0xff6a2c);
    });
    // a grave wave — a few graves erupt around the player
    for (var g = 0; g < 3; g++) {
      var a = Math.PI * 2 * g / 3 + Math.random();
      this.eruptGrave(Phaser.Math.Clamp(this.player.x + Math.cos(a) * 220, 80, this.worldW - 80),
                      Phaser.Math.Clamp(this.player.y + Math.sin(a) * 220, 80, this.worldH - 80));
    }
  },

  // NECRO ACOLYTE — raise nearby field corpses as Rattlebones, capped by how
  // many raised minions of his are already alive (queueSpawn — never group.get
  // inside an iterate).
  raiseCorpses: function (m, cfg) {
    var alive = 0, self = this;
    this.mobs.children.iterate(function (b) { if (b && b.active && b.mob && b.mob.raisedBy === m.id) alive++; });
    if (alive >= cfg.maxAlive) return;
    var raised = 0;
    for (var i = 0; i < this.corpses.length && alive + raised < cfg.maxAlive; i++) {
      var co = this.corpses[i];
      if (co.used) continue;
      if (Math.hypot(co.x - m.x, co.y - m.y) > cfg.radius) continue;
      co.used = true; raised++;
      this.queueSpawn({ key: cfg.key, x: co.x, y: co.y, revive: true, raisedBy: m.id });
    }
    if (raised) { this.burst(m.x, m.y, 10, 0x78ff96); try { AUDIO.play('revive'); } catch (e) {} }
  },

  // BANSHEE WAIL TELEGRAPH — the cone locks to the cast direction and burns
  // on the ground for the whole windup: what's lit is what gets hit. She's
  // rooted mid-cast, so the drawn cone is always honest.
  bansheeWailCastFx: function (m, dir, cfg) {
    var g = this.add.graphics().setDepth(5);
    g.fillStyle(0x8fd6ff, 0.16);
    g.slice(m.x, m.y, cfg.range, dir - Phaser.Math.DegToRad(cfg.halfDeg), dir + Phaser.Math.DegToRad(cfg.halfDeg), false);
    g.fillPath();
    g.lineStyle(2, 0x8fd6ff, 0.5);
    g.slice(m.x, m.y, cfg.range, dir - Phaser.Math.DegToRad(cfg.halfDeg), dir + Phaser.Math.DegToRad(cfg.halfDeg), false);
    g.strokePath();
    this.tweens.add({ targets: g, alpha: { from: 0.5, to: 1 }, duration: cfg.windupMs, ease: 'Sine.In',
      onComplete: function () { try { g.destroy(); } catch (e) {} } });
    try { AUDIO.play('frost'); } catch (e2) {}
  },

  // small cosmetic FX (optional hooks referenced by entities.updateMob)
  bansheeWailFx: function (m, player) {
    var a = Math.atan2(player.y - m.y, player.x - m.x), self = this;
    for (var r = 0; r < 3; r++) {
      (function (rad) {
        var ring = self.add.arc(m.x, m.y, rad, Phaser.Math.RadToDeg(a) - 34, Phaser.Math.RadToDeg(a) + 34, false, 0x8fd6ff, 0.22).setDepth(6);
        self.tweens.add({ targets: ring, alpha: 0, scale: 1.4, duration: 420, onComplete: function () { try { ring.destroy(); } catch (e) {} } });
      })(20 + r * 14);
    }
  },
  regenTickFx: function (m) {
    if (Math.random() < 0.4) this.burst(m.x, m.y - m.displayHeight * 0.2, 2, 0x78ff96);
  },

  // ======================= M5.6 — THE GRAVEKEEPER (boss) ===================
  // Climbs out of the arena grave; IMMUNE while a minion wave walks; 5 waves,
  // each cleared strips 20% max HP (he keeps BONE STORM / SOUL VOLLEY via the
  // generic driver + three telegraphed Necronomicon verbs here). REAPER'S
  // MARCH fires once. During the fight the ambient cycle is quiet — the bell
  // is HIS (each wave opens with a toll). All verb clocks ride unfreeze().
  gravekeeperArrival: function (def) {
    var self = this, g = this.arenaGrave;
    this.graveArrivalActive = true;
    // deliver the player to the arena, south of the open grave
    this.player.setPosition(g.x, g.y + 150);
    this.cameras.main.centerOn(g.x, g.y + 60);
    this.banner('THE GRAVEKEEPER STIRS\nsomething claws up from the earth', '#78ff96');
    this.cameras.main.shake(def.graveArrival.rumbleMs, 0.006);
    // dirt + green flame churn out of the grave
    var churn = this.time.addEvent({ delay: 90, repeat: 14, callback: function () {
      self.burst(g.x + (Math.random() * 2 - 1) * 40, g.y + (Math.random() * 2 - 1) * 24, 4, Math.random() < 0.5 ? 0x624630 : 0x78ff96);
    } });
    var total = def.graveArrival.rumbleMs + def.graveArrival.crackMs + def.graveArrival.climbMs;
    this.time.delayedCall(total, function () {
      if (self.closing || !self.player.state.alive) { self.graveArrivalActive = false; return; }
      self.spawnBossNow(def, g.x, g.y);         // spawns + initGravekeeper (wave 1)
      self.showScouter(def);
      self.graveArrivalActive = false;
    });
  },

  initGravekeeper: function (b, time) {
    var gd = b.boss;
    gd.nextExplodeAt = time + 5200;
    gd.nextHandsAt = time + 4200;
    gd.nextSigilAt = time + 6600;
    gd.wave = -1; gd.immune = false; gd.waveClearing = false; gd.waveSeen = false; gd.reaperSpawned = false;
    this.graveFx = this.graveFx || [];
    this.spawnGraveWave(b, 0);
  },

  // spawn wave `idx`: the boss goes IMMUNE, the mobs are queued (bossWave-tagged)
  spawnGraveWave: function (b, idx) {
    var W = b.boss.def.waves, set = W.sets[idx], self = this;
    b.boss.wave = idx; b.boss.immune = true; b.boss.waveClearing = false; b.boss.waveSeen = false;
    this.waveReveal(idx, set.label);          // GTA-VI-style undead wave card
    try { AUDIO.play('belltoll'); } catch (e) {}
    this.cameras.main.flash(180, 40, 90, 60);
    var n = 0;
    set.spawn.forEach(function (sp) {
      for (var i = 0; i < sp.n; i++) {
        var a = Math.PI * 2 * n / 12 + idx;
        self.queueSpawn({ key: sp.key, bossWave: true,
          x: b.x + Math.cos(a) * (110 + (n % 4) * 22), y: b.y + Math.sin(a) * (110 + (n % 4) * 22) });
        n++;
      }
    });
  },

  // the frame a wave hits zero: strip a chunk (routes through hurtBoss so the
  // 5th chunk KILLS him), then the next wave opens after a short beat
  breakGraveWave: function (b) {
    var bs = b.boss, W = bs.def.waves, self = this;
    this.cameras.main.shake(260, 0.007);
    this.banner('WAVE BROKEN — a fifth of him crumbles', '#e6dcc0');
    try { AUDIO.play('crash'); } catch (e) {}
    this.burst(b.x, b.y, 26, 0x78ff96);
    bs.immune = false;
    Entities.hurtBoss(this, b, bs.maxHp * W.hpChunkPct);
    if (!b.active || bs.hp <= 0) return;              // he fell on the final chunk
    var next = bs.wave + 1;
    if (next < W.count) this.time.delayedCall(1500, function () { if (b.active && !self.closing && self.boss === b) self.spawnGraveWave(b, next); });
  },

  // scene-owned per-frame boss loop (dispatched from Entities.updateBoss)
  gravekeeperUpdate: function (b, player, time) {
    var bs = b.boss, def = bs.def, W = def.waves, self = this;
    if (bs.wave == null || bs.wave < 0) return;
    var alive = 0, mcx = 0, mcy = 0;
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.bossWave) { alive++; mcx += m.x; mcy += m.y; } });
    bs.immune = alive > 0;
    if (alive > 0) bs.waveSeen = true;
    if (bs.waveSeen && alive === 0 && !bs.waveClearing && bs.wave < W.count) { bs.waveClearing = true; this.breakGraveWave(b); }
    // REAPER'S MARCH — armed the moment the fight starts; rises after a short
    // beat with a camera reveal (early, not near-death).
    if (!bs.reaperArmed) { bs.reaperArmed = true; bs.reaperAt = time + (def.reaper.delayMs || 1600); }
    if (!bs.reaperSpawned && time >= bs.reaperAt) { bs.reaperSpawned = true; this.spawnReaper(def.reaper); }
    this.updateReaper(time);
    // COWARD MOVEMENT — override the generic chase updateBoss set this frame
    this.gravekeeperSkulk(b, player, alive, mcx, mcy);
    this.gravekeeperVerbs(b, player, time);
    // keep the HP bar tinted while immune (readout of the mechanic)
    if (this.bossBar) this.bossBar.setFillStyle(bs.immune ? 0x4a4e5c : 0x78ff96);
  },

  // COWARD MOVEMENT — the Gravekeeper skulks behind his wave instead of chasing:
  // flee (fast) when the player is close, HIDE toward his minion cluster at
  // mid-range so bodies stay between you and him, and only amble back if you've
  // drifted far. Gives the chasing minions room to separate from the boss.
  gravekeeperSkulk: function (b, player, alive, mcx, mcy) {
    if (!b.active || !b.body) return;            // mid-death / body gone — no move
    var sk = b.boss.def.skulk || { fleeNear: 230, driftFar: 560, fleeMult: 1.4, holdMult: 0.6 };
    var spd = b.boss.def.spd;
    var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
    var vx = 0, vy = 0, mult = sk.holdMult;
    if (d < sk.fleeNear) {                       // too close → FLEE, biased behind the swarm
      vx = -dx / d; vy = -dy / d; mult = sk.fleeMult;
      if (alive > 0) { var cx = mcx / alive - b.x, cy = mcy / alive - b.y, cl = Math.hypot(cx, cy) || 1; vx += (cx / cl) * 0.6; vy += (cy / cl) * 0.6; }
    } else if (d > sk.driftFar) {                // drifted far → amble back so the fight continues
      vx = dx / d; vy = dy / d; mult = sk.holdMult;
    } else if (alive > 0) {                       // mid-range → HIDE toward the minion cluster
      var hx = mcx / alive - b.x, hy = mcy / alive - b.y, hl = Math.hypot(hx, hy) || 1;
      vx = hx / hl; vy = hy / hl; mult = sk.holdMult * 0.7;
    }                                            // else: no minions mid-range → hold still (no chase)
    var nl = Math.hypot(vx, vy);
    if (nl > 0.01) b.setVelocity(vx / nl * spd * mult, vy / nl * spd * mult); else b.setVelocity(0, 0);
    b.setFlipX(dx < 0);
    b.x = Phaser.Math.Clamp(b.x, 60, this.worldW - 60);   // he never wraps — stays on the field
    b.y = Phaser.Math.Clamp(b.y, 60, this.worldH - 60);
  },

  gravekeeperVerbs: function (b, player, time) {
    var P = b.boss.def.patterns;
    if (time >= b.boss.nextExplodeAt) { b.boss.nextExplodeAt = time + P.explodeCorpse.everyMs; this.explodeCorpses(b, P.explodeCorpse); }
    if (time >= b.boss.nextHandsAt) { b.boss.nextHandsAt = time + P.graspingHands.everyMs; this.graspingHands(b, player, P.graspingHands); }
    if (time >= b.boss.nextSigilAt) { b.boss.nextSigilAt = time + P.curseSigils.everyMs; this.curseSigils(b, player, P.curseSigils); }
  },

  // EXPLODE CORPSE — detonate up to `chain` field corpses in a stagger; if the
  // ground is clean, a bone-blast spawns near the player so the verb still bites
  explodeCorpses: function (b, cfg) {
    var self = this, done = 0;
    for (var i = 0; i < this.corpses.length && done < cfg.chain; i++) {
      var co = this.corpses[i]; if (co.used) continue; co.used = true; done++;
      (function (cx, cy, d) {
        var warn = self.add.ellipse(cx, cy, cfg.radius * 2, cfg.radius * 2, 0xff6a2c, 0.2).setDepth(1);
        self.time.delayedCall(cfg.warnMs * d, function () {
          try { warn.destroy(); } catch (e) {}
          if (self.closing) return;
          self.burst(cx, cy, 16, 0xff6a2c); self.cameras.main.shake(120, 0.004);
          try { AUDIO.play('boom'); } catch (e) {}
          if (self.player.state.alive && Math.hypot(self.player.x - cx, self.player.y - cy) < cfg.radius)
            Entities.hurtPlayer(self, self.player, cfg.dmg, self.time.now, 'an exploding corpse', true);
        });
      })(co.x, co.y, done);
    }
    if (done === 0) {
      var a = Math.random() * Math.PI * 2;
      var cx = Phaser.Math.Clamp(this.player.x + Math.cos(a) * 70, 60, this.worldW - 60);
      var cy = Phaser.Math.Clamp(this.player.y + Math.sin(a) * 70, 60, this.worldH - 60);
      var warn2 = this.add.ellipse(cx, cy, cfg.radius * 2, cfg.radius * 2, 0xff6a2c, 0.2).setDepth(1);
      this.time.delayedCall(cfg.warnMs, function () {
        try { warn2.destroy(); } catch (e) {}
        self.burst(cx, cy, 14, 0xff6a2c); try { AUDIO.play('boom'); } catch (e) {}
        if (self.player.state.alive && Math.hypot(self.player.x - cx, self.player.y - cy) < cfg.radius)
          Entities.hurtPlayer(self, self.player, cfg.dmg, self.time.now, 'a corpse blast', true);
      });
    }
  },

  // GRASPING HANDS — telegraphed circles erupt into bony hands (dmg + grab-slow)
  graspingHands: function (b, player, cfg) {
    var self = this;
    for (var i = 0; i < cfg.count; i++) {
      var a = Math.PI * 2 * i / cfg.count + Math.random();
      var hx = Phaser.Math.Clamp(player.x + Math.cos(a) * (Math.random() * cfg.scatter), 60, this.worldW - 60);
      var hy = Phaser.Math.Clamp(player.y + Math.sin(a) * (Math.random() * cfg.scatter), 60, this.worldH - 60);
      var ring = this.add.ellipse(hx, hy, cfg.radius * 2, cfg.radius * 2, 0xe6dcc0, 0.22).setDepth(1).setStrokeStyle(2, 0xe6dcc0);
      (function (x, y, r) {
        self.time.delayedCall(cfg.warnMs, function () {
          try { r.destroy(); } catch (e) {}
          self.burst(x, y, 12, 0xe6dcc0); try { AUDIO.play('crash'); } catch (e) {}
          for (var h = 0; h < 4; h++) {
            var hnd = self.add.rectangle(x + (Math.random() * 2 - 1) * cfg.radius * 0.7, y + 10, 4, 16, 0xe6dcc0).setDepth(2).setAlpha(0);
            (function (hh, ty) { self.tweens.add({ targets: hh, y: ty, alpha: 1, duration: 220, onComplete: function () { self.tweens.add({ targets: hh, y: ty + 12, alpha: 0, duration: 500, delay: 200, onComplete: function () { try { hh.destroy(); } catch (e) {} } }); } }); })(hnd, y - 6);
          }
          if (self.player.state.alive && Math.hypot(self.player.x - x, self.player.y - y) < cfg.radius) {
            Entities.hurtPlayer(self, self.player, cfg.dmg, self.time.now, 'grasping hands', true);
            self.player.state.slowUntil = self.time.now + cfg.grabMs; self.player.state.slowMult = 0.5;
          }
        });
      })(hx, hy, ring);
    }
  },

  // CURSE SIGILS — rune circles bloom, then blast + leave a ticking sigil patch
  curseSigils: function (b, player, cfg) {
    var self = this;
    for (var i = 0; i < cfg.count; i++) {
      var a = Math.PI * 2 * i / cfg.count + Math.random();
      var sx = Phaser.Math.Clamp(player.x + Math.cos(a) * (40 + Math.random() * 160), 60, this.worldW - 60);
      var sy = Phaser.Math.Clamp(player.y + Math.sin(a) * (40 + Math.random() * 160), 60, this.worldH - 60);
      var ring = this.add.ellipse(sx, sy, cfg.radius * 2, cfg.radius * 2, 0xb060ec, 0.2).setDepth(1).setStrokeStyle(2, 0xb060ec);
      (function (x, y, r) {
        self.time.delayedCall(cfg.warnMs, function () {
          try { r.destroy(); } catch (e) {}
          self.burst(x, y, 12, 0xb060ec);
          var g = self.add.ellipse(x, y, cfg.radius * 2, cfg.radius * 2, 0xb060ec, 0.26).setDepth(1);
          self.tweens.add({ targets: g, alpha: { from: 0.3, to: 0.12 }, duration: 500, yoyo: true, repeat: -1 });
          if (!self.gasPatches) self.gasPatches = [];
          self.gasPatches.push({ obj: g, x: x, y: y, r: cfg.radius, dmg: cfg.sigil.dmg, tickMs: cfg.sigil.tickMs, dieAt: self.time.now + cfg.sigil.lifeMs, lastTick: 0, boss: true });
        });
      })(sx, sy, ring);
    }
  },

  // REAPER'S MARCH — a Grim Reaper rises at the map edge and crawls at the
  // player forever. Touch = instant death (fromBoss). Manual mover (respects
  // hitstop/pause via the loop delta being 0 while frozen).
  spawnReaper: function (cfg) {
    var self = this;
    // rise in the CORNER FARTHEST from the player (the dread creeps in from afar)
    var corners = [[80, 80], [this.worldW - 80, 80], [80, this.worldH - 80], [this.worldW - 80, this.worldH - 80]];
    var px = this.player.x, py = this.player.y, x = corners[0][0], y = corners[0][1], bd = -1;
    corners.forEach(function (c) { var dd = Math.hypot(c[0] - px, c[1] - py); if (dd > bd) { bd = dd; x = c[0]; y = c[1]; } });
    var spr = this.add.image(x, y, 'reaperHi').setDepth(22).setScale(0.12).setBlendMode(Phaser.BlendModes.NORMAL);
    var aura = this.add.ellipse(x, y, 90, 60, 0x78ff96, 0.14).setDepth(21);
    this.reaper = { spr: spr, aura: aura, x: x, y: y, spd: cfg.spd, rising: true };
    // he CLIMBS OUT of the corner, then begins his march
    this.tweens.add({ targets: spr, scale: 112 / 48, duration: 800, ease: 'Back.Out', onComplete: function () { if (self.reaper) self.reaper.rising = false; } });
    for (var ri = 0; ri < 8; ri++) this.burst(x + (Math.random() * 2 - 1) * 40, y + (Math.random() * 2 - 1) * 30, 4, 0x78ff96);
    // CAMERA REVEAL — glance to the corner, hold, then snap back to the player
    var cam = this.cameras.main;
    cam.stopFollow(); cam.pan(x, y, 560, 'Sine.easeInOut');
    this.time.delayedCall(1400, function () {
      cam.pan(self.player.x, self.player.y, 460, 'Sine.easeInOut');
      self.time.delayedCall(480, function () { if (self.player && self.player.active && !self.closing) cam.startFollow(self.player, true, 0.12, 0.12); });
    });
    this.cameras.main.shake(300, 0.006);
    this.banner("THE SPAWN OF DEATH RISES\nits touch is death - never let it reach you", '#78ff96');
    try { AUDIO.play('reaperdrone'); } catch (e) {}
  },

  updateReaper: function (time) {
    var R = this.reaper; if (!R || !R.spr || !R.spr.active) return;
    if (R.rising) { R.aura.setPosition(R.x, R.y); return; }   // still climbing out - no walk, no kill yet
    if (!this.player.state.alive || this.closing) return;
    var dt = this.game.loop.delta / 1000;
    var dx = this.player.x - R.x, dy = this.player.y - R.y, d = Math.hypot(dx, dy) || 1;
    R.x += (dx / d) * R.spd * dt; R.y += (dy / d) * R.spd * dt;
    R.spr.setPosition(R.x, R.y).setFlipX(dx < 0);
    R.aura.setPosition(R.x, R.y).setAlpha(0.1 + 0.06 * Math.sin(time / 200));
    if (d < 32) Entities.hurtPlayer(this, this.player, 99999, time, 'the reaper', true);
  },

  clearReaper: function () {
    if (this.reaper) { try { this.reaper.spr.destroy(); } catch (e) {} try { this.reaper.aura.destroy(); } catch (e2) {} this.reaper = null; }
  },

  // 'IMMUNE' popup over the boss while a wave still walks (rate-limited)
  bossImmunePopup: function (b) {
    var t = this.time.now;
    if (this._bossImmuneAt && t - this._bossImmuneAt < 650) return;
    this._bossImmuneAt = t;
    var txt = this.add.text(b.x, b.y - b.displayHeight / 2 - 14, 'IMMUNE', { fontFamily: 'monospace', fontSize: 12, fontStyle: 'bold', color: '#78ff96' }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: txt, y: txt.y - 18, alpha: 0, duration: 700, onComplete: function () { try { txt.destroy(); } catch (e) {} } });
  },



  // -------- falling trees: shared by the AMBIENT hazard and the TIMBER verb --
  // Telegraph a lane near/through (px,py), then drop the trunk across it.
  startTreeFall: function (px, py, warnMs, dmg, trunkLifeMs, fromBoss) {
    var self = this;
    var horiz = Math.random() < 0.6;                      // cosmetic orientation
    var len = 430, half = 34;
    var cx = Phaser.Math.Clamp(px, len / 2 + 30, this.worldW - len / 2 - 30);
    var cy = Phaser.Math.Clamp(py, 80, this.worldH - 80);
    if (!horiz) { cx = Phaser.Math.Clamp(px, 80, this.worldW - 80); cy = Phaser.Math.Clamp(py, len / 2 + 30, this.worldH - len / 2 - 30); }
    var shadow = this.add.rectangle(cx, cy, horiz ? len : half * 2, horiz ? half * 2 : len,
                                    0x14231a, 0.0).setDepth(3);
    this.tweens.add({ targets: shadow, fillAlpha: 0.45, duration: warnMs * 0.8 });
    try { AUDIO.play('creak'); } catch (e) {}
    this.cameras.main.shake(260, 0.003);
    return { phase: 'warn', warnUntil: this.time.now + warnMs, shadow: shadow,
             cx: cx, cy: cy, horiz: horiz, len: len, half: half,
             dmg: dmg, trunkLifeMs: trunkLifeMs, fromBoss: !!fromBoss };
  },

  dropTree: function (fall) {
    var self = this, cx = fall.cx, cy = fall.cy;
    try { fall.shadow.destroy(); } catch (e) {}
    // the trunk slams in: spawn slightly "above" and drop fast
    var img = this.add.image(cx, cy - 26, 'fallenTrunk').setDepth(6)
      .setScale(fall.len / 260, (fall.half * 2) / 56).setAlpha(0.85);
    if (!fall.horiz) img.setAngle(90);
    this.tweens.add({ targets: img, y: cy, alpha: 1, duration: 130, ease: 'Quad.In' });
    this.cameras.main.shake(220, 0.012);
    try { AUDIO.play('crash'); } catch (e) {}
    this.burst(cx, cy, 18, 0x63b25a);                    // leaf burst
    this.burst(cx, cy, 10, 0x7d6450);                    // dust
    // CRUSH — everything under the lane. Mobs credit the player (m4s rule);
    // the player takes the hit through hurtPlayer (gear + class mults apply).
    var w2 = fall.horiz ? fall.len / 2 : fall.half, h2 = fall.horiz ? fall.half : fall.len / 2;
    var p = this.player;
    if (p.state.alive && Math.abs(p.x - cx) < w2 + 8 && Math.abs(p.y - cy) < h2 + 8) {
      Entities.hurtPlayer(this, p, fall.dmg, this.time.now,
        fall.fromBoss ? "the Grovekeeper's TIMBER" : 'a falling tree', fall.fromBoss);
      // shove the survivor clear so the new wall doesn't swallow them
      if (fall.horiz) p.y = cy + (p.y >= cy ? 1 : -1) * (fall.half + 26);
      else p.x = cx + (p.x >= cx ? 1 : -1) * (fall.half + 26);
    }
    this.mobs.children.iterate(function (m) {
      if (m && m.active && Math.abs(m.x - cx) < w2 && Math.abs(m.y - cy) < h2) self.killMobCredited(m);
    });
    // the trunk LINGERS as a wall, then crumbles
    var body = this.add.rectangle(cx, cy, w2 * 2, h2 * 2, 0, 0);
    this.physics.add.existing(body, true);
    if (this.trunkGroup) this.trunkGroup.add(body);
    var rec = { img: img, body: body, dieAt: this.time.now + fall.trunkLifeMs };
    this.groveTrunks.push(rec);
    return rec;
  },

  crumbleTrunk: function (rec) {
    var self = this;
    this.burst(rec.img.x, rec.img.y, 12, 0x63b25a);
    try { rec.body.destroy(); } catch (e) {}
    this.tweens.add({ targets: rec.img, alpha: 0, duration: 600,
      onComplete: function () { try { rec.img.destroy(); } catch (e) {} } });
  },

  // ---------------- grove mechanics: cast bars, queues, glow, blink ---------
  // The Bumblebrute's SUMMON bar (user: "very short half second cast bar
  // above his head with summon"). Pieces ride the sprite; every death path
  // clears them (Entities.clearNameTag).
  updateCastBar: function (m, pct, label) {
    pct = Phaser.Math.Clamp(pct, 0, 1);
    var y = m.y - m.displayHeight / 2 - 14;
    if (!m.castBarBg) {
      m.castBarBg = this.add.rectangle(m.x, y, 34, 6, 0x1a1c2c, 0.9).setDepth(21).setStrokeStyle(1, 0xffd23e, 0.9);
      m.castBar = this.add.rectangle(m.x - 16, y, 1, 4, 0xffd23e, 1).setOrigin(0, 0.5).setDepth(22);
      m.castText = this.add.text(m.x, y - 9, label || 'SUMMON',
        { fontFamily: 'monospace', fontSize: 8, fontStyle: 'bold', color: '#ffd23e' }).setOrigin(0.5).setDepth(22);
    }
    m.castBarBg.setPosition(m.x, y);
    m.castBar.setPosition(m.x - 16, y).width = Math.max(1, 32 * pct);
    m.castText.setPosition(m.x, y - 9);
  },

  // Mechanic-driven spawns are QUEUED and drained once per frame — group.get
  // inside the physics/update iterates is the documented splitter hazard.
  queueSpawn: function (entry) { this._spawnQueue.push(entry); },

  queueGuardSummon: function (brute) {
    var g = brute.mob.def.guard;
    for (var i = 0; i < g.count; i++) {
      var a = Math.PI * 2 * i / g.count;
      this.queueSpawn({ key: g.key, x: brute.x + Math.cos(a) * g.ring, y: brute.y + Math.sin(a) * g.ring,
                        guardianOf: brute.id });
    }
    try { AUDIO.play('volley'); } catch (e) {}
    this.burst(brute.x, brute.y, 10, 0xffd23e);
  },

  queuePixieSummon: function (pixie, cfg) {
    var count = 0;
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob.key === cfg.key) count++; });
    if (count >= (cfg.maxAlive || 2)) return;
    this.queueSpawn({ key: cfg.key, x: pixie.x, y: pixie.y + 26 });
    this.burst(pixie.x, pixie.y, 8, 0x8fd6ff);
    try { AUDIO.play('chime'); } catch (e) {}
  },

  drainSpawnQueue: function () {
    if (!this._spawnQueue.length) return;
    var q = this._spawnQueue; this._spawnQueue = [];
    var self = this;
    // no mechanic spawns once the fight is decided or the swarm was wiped
    if (this.closing || this.pendingLoot) return;
    q.forEach(function (e) {
      var x = Phaser.Math.Clamp(e.x, 30, self.worldW - 30);
      var y = Phaser.Math.Clamp(e.y, 30, self.worldH - 30);
      var m = Entities.spawnMob(self, e.key, x, y);
      if (!m) return;
      if (e.guardianOf) {
        m.mob.guardianOf = e.guardianOf;
        self.mobs.children.iterate(function (b) {
          if (b && b.active && b.id === e.guardianOf) b.mob.ward++;
        });
      }
      if (e.cinematic) { m.mob.cinematic = true; }
      if (e.raisedBy) { m.mob.raisedBy = e.raisedBy; }    // M5.6: acolyte-raised (alive cap)
      if (e.bossWave) { m.mob.bossWave = true; }          // M5.6: gravekeeper wave (immunity gate)
      if (e.crateChild) { m.mob.crateChild = true; }      // M7k: neon crate-punk alive cap
      if (e.noLoot || e.noDrop) { m.mob.noLoot = true; }  // M7k: boss-summoned adds pay no XP/quota
      if (e.revive) self.burst(x, y, 10, 0x8ff0a5);       // the bloom / the risen take
    });
  },

  // Bloom-pixie GLOW TRAIL — patches that RESURRECT enemies that died nearby.
  dropGlow: function (x, y, cfg) {
    var patch = this.add.ellipse(x, y, cfg.radius * 2, cfg.radius * 1.5, 0x8fd6ff, 0.30)
      .setDepth(3).setStrokeStyle(1, 0xc8fff4, 0.6);
    var rec = { obj: patch, x: x, y: y, r: cfg.radius, dieAt: this.time.now + cfg.lifeMs };
    this.glowPatches.push(rec);
    this.tweens.add({ targets: patch, alpha: 0.08, duration: cfg.lifeMs, ease: 'Sine.In',
      onComplete: function () { rec.dead = true; try { patch.destroy(); } catch (e) {} } });
  },

  blinkFx: function (x0, y0, x1, y1, tint) {
    this.burst(x0, y0, 6, tint || 0xff77a8);
    this.burst(x1, y1, 6, tint || 0xff77a8);
    try { AUDIO.play('chime'); } catch (e) {}
  },

  // ---------------- THE GROVEKEEPER: verbs, arrival, PHASE TWO --------------
  initGrovekeeper: function (b, time) {
    var gd = b.boss;
    gd.nextTimberAt = time + 6000;
    gd.nextMortarAt = time + 3200;
    gd.nextOvergrowthAt = time + 8000;
    gd.nextSunlanceAt = time + 5000;
    gd.nextSurgeAt = time + 10000;
    gd.sunUntil = 0; gd.nextSunTickAt = 0; gd.sunAng = 0; gd.lastSunAt = 0; gd.sunDir = 1;
    this.timberFall = this.timberFall || null;
    this.groveFx = this.groveFx || [];           // re-init (phase two) keeps live fx tracked
  },

  // item 10: raise a timber palisade ring around the clearing + plant the player
  // inside it. The ring is the visible "wall"; groveBound is the real clamp.
  raiseGroveTimber: function (cx, cy) {
    var R = Math.min(340, Math.min(this.worldW, this.worldH) * 0.32);
    // keep the ring fully inside the map
    cx = Math.max(R + 40, Math.min(this.worldW - R - 40, cx));
    cy = Math.max(R + 40, Math.min(this.worldH - R - 40, cy));
    this._groveArena = { x: cx, y: cy, r: R };
    var g = this.add.graphics().setDepth(1.6);
    for (var a = 0; a < Math.PI * 2; a += 0.075) {
      var px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
      g.fillStyle(0x3c2f24, 0.98); g.fillEllipse(px, py + 5, 15, 22);   // trunk shadow/base
      g.fillStyle(0x5b4636, 1); g.fillEllipse(px, py, 13, 20);          // timber post
      g.fillStyle(0x6f5a40, 1); g.fillEllipse(px - 2, py - 2, 5, 16);   // lit side
      g.fillStyle(0x2f251c, 1); g.fillCircle(px, py - 10, 6);           // sharpened top
      g.fillStyle(0x7a8a4a, 0.7); g.fillCircle(px + 3, py + 6, 2);      // moss glint
    }
    this._groveRing = g;
    // plant the player inside the ring (arena bosses start you in the pit)
    try { this.player.body.reset(cx, cy + R * 0.5); } catch (e) {}
  },
  groveBound: function (player) {
    var A = this._groveArena; if (!A || !player || !player.body) return;
    var R = A.r - 12, dx = player.x - A.x, dy = player.y - A.y, d = Math.hypot(dx, dy);
    if (d <= R) return;
    var ox = dx / d, oy = dy / d, nx = A.x + ox * R, ny = A.y + oy * R;
    if (player.body.enable && player.body.reset) {
      var vx = player.body.velocity.x, vy = player.body.velocity.y, vn = vx * ox + vy * oy;
      if (vn > 0) { vx -= vn * ox; vy -= vn * oy; }
      player.body.reset(nx, ny); player.body.velocity.x = vx; player.body.velocity.y = vy;
    } else { player.x = nx; player.y = ny; }
  },
  clearGroveTimber: function () {
    if (this._groveRing) { try { this._groveRing.destroy(); } catch (e) {} this._groveRing = null; }
    this._groveArena = null;
  },

  grovekeeperUpdate: function (b, player, time) {
    var gd = b.boss, P = gd.def.patterns, rate = gd.rateMult || 1;
    if (this._groveArena) this.groveBound(player);         // item 10: keep the player boxed in
    // TIMBER — his ghost train: an ancient tree across YOUR lane
    if (this.timberFall && this.timberFall.phase === 'warn') {
      this.timberFall.shadow.setAlpha(Math.floor(time / 110) % 2 === 0 ? 0.5 : 0.3);
      if (time >= this.timberFall.warnUntil) {
        var tf = this.timberFall; this.timberFall = null;
        this.dropTree(tf);
      }
    } else if (!this.timberFall && time >= gd.nextTimberAt) {
      gd.nextTimberAt = time + P.timber.everyMs * rate;
      this.timberFall = this.startTreeFall(player.x, player.y, P.timber.warnMs,
                                           P.timber.dmg, P.timber.trunkLifeMs, true);
    }
    // THORN MORTAR — marked lobs + lingering brier patches
    if (time >= gd.nextMortarAt) { gd.nextMortarAt = time + P.mortar.everyMs * rate; this.throwMortar(b, P.mortar); }
    // OVERGROWTH — vines grip: the schedule slow, grove-flavored
    if (time >= gd.nextOvergrowthAt) { gd.nextOvergrowthAt = time + P.overgrowth.everyMs * rate; this.snapOvergrowth(b, P.overgrowth, time); }
    // SUNLANCE — the sweeping canopy beam
    this.updateSunlance(b, player, time);
    // SPORE SURGE — a ring of mini puffcaps sprouts around the player
    if (P.sporeSurge && time >= gd.nextSurgeAt) {
      gd.nextSurgeAt = time + P.sporeSurge.everyMs * rate;
      for (var i = 0; i < P.sporeSurge.count; i++) {
        var a = Math.PI * 2 * i / P.sporeSurge.count;
        this.queueSpawn({ key: 'puffcapMini', x: player.x + Math.cos(a) * P.sporeSurge.ring,
                          y: player.y + Math.sin(a) * P.sporeSurge.ring });
      }
      this.burst(b.x, b.y, 12, 0xd95763);
      try { AUDIO.play('volley'); } catch (e) {}
    }
  },

  throwMortar: function (b, T) {
    var self = this;
    for (var i = 0; i < T.count; i++) {
      var tx = i === 0 ? this.player.x : this.player.x + (SIM.rng() * 2 - 1) * T.scatter;
      var ty = i === 0 ? this.player.y : this.player.y + (SIM.rng() * 2 - 1) * T.scatter;
      tx = Phaser.Math.Clamp(tx, 60, this.worldW - 60);
      ty = Phaser.Math.Clamp(ty, 60, this.worldH - 60);
      (function (tx, ty) {
        var marker = self.add.ellipse(tx, ty, T.radius * 2, T.radius * 2)
          .setStrokeStyle(3, 0x8ff0a5, 0.9).setFillStyle(0x38b764, 0.12).setDepth(4);
        self.groveFx.push(marker);
        self.tweens.add({ targets: marker, scaleX: { from: 0.4, to: 1 }, scaleY: { from: 0.4, to: 1 },
          duration: T.warnMs, ease: 'Sine.In' });
        // the pod: a tinted orb lobbed on a rise-and-fall
        var pod = self.add.image(b.x, b.y - 24, 'orbShot').setDepth(40).setScale(3).setTint(0x38b764);
        self.groveFx.push(pod);
        self.tweens.add({ targets: pod, scale: 4.4, duration: T.flightMs * 0.5, yoyo: true });
        self.tweens.add({
          targets: pod, x: tx, y: ty, angle: 540, duration: T.flightMs, delay: T.warnMs - T.flightMs,
          onComplete: function () {
            try { AUDIO.play('thud'); } catch (e) {}
            self.cameras.main.shake(120, 0.004);
            self.burst(tx, ty, 10, 0x38b764);
            var p = self.player;
            if (p.state.alive && Math.hypot(p.x - tx, p.y - ty) < T.radius) {
              Entities.hurtPlayer(self, p, T.dmg, self.time.now, 'a seed mortar', true);
            }
            // the BRIER lingers — slime-patch tech in grove colors
            if (T.brier) {
              var patch = self.add.ellipse(tx, ty, T.radius * 2, T.radius * 1.5, 0x2e9e57, 0.34)
                .setDepth(3).setStrokeStyle(1, 0x8ff0a5, 0.5);
              var rec2 = { obj: patch, x: tx, y: ty, r: T.radius, dmg: T.brier.dmg,
                           tickMs: T.brier.tickMs, dieAt: self.time.now + T.brier.lifeMs };
              self.slimePatches.push(rec2);       // rides the existing hazard pool
              self.tweens.add({ targets: patch, alpha: 0.08, duration: T.brier.lifeMs, ease: 'Sine.In',
                onComplete: function () { rec2.dead = true; try { patch.destroy(); } catch (e) {} } });
            }
            try { marker.destroy(); } catch (e) {}
            self.tweens.add({ targets: pod, alpha: 0, duration: 300,
              onComplete: function () { try { pod.destroy(); } catch (e) {} } });
          }
        });
      })(tx, ty);
    }
  },

  snapOvergrowth: function (b, S, time) {
    var st = this.player.state;
    st.slowUntil = time + S.durMs;
    st.slowMult = S.slowMult;
    try { AUDIO.play('creak'); } catch (e) {}
    // vines burst up around your ankles
    var p = this.player, self = this;
    for (var i = 0; i < 5; i++) {
      var a = Math.PI * 2 * i / 5;
      var vine = this.add.ellipse(p.x + Math.cos(a) * 16, p.y + 10 + Math.sin(a) * 6, 5, 16, 0x2e9e57, 0.9).setDepth(9);
      this.groveFx.push(vine);
      this.tweens.add({ targets: vine, scaleY: { from: 0.2, to: 1 }, alpha: 0, duration: S.durMs,
        onComplete: (function (v) { return function () { try { v.destroy(); } catch (e) {} }; })(vine) });
    }
    var fx = this.add.sprite(p.x, p.y, 'softglow')
      .setTint(0x38b764).setScale(1.6).setAlpha(0.5).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
    this.groveFx.push(fx);
    this.tweens.add({ targets: fx, alpha: 0.12, duration: S.durMs, ease: 'Sine.In',
      onUpdate: function () { fx.setPosition(p.x, p.y); },
      onComplete: function () { try { fx.destroy(); } catch (e) {} } });
  },

  updateSunlance: function (b, player, time) {
    var gd = b.boss, L = gd.def.patterns.sunlance;
    if (!gd.sunUntil && time >= gd.nextSunlanceAt) {
      gd.sunUntil = time + L.durMs;
      gd.sunAng = Math.atan2(player.y - b.y, player.x - b.x) - 0.6;
      gd.sunDir = SIM.rng() < 0.5 ? 1 : -1;
      gd.lastSunAt = time;
      gd.nextSunTickAt = time;
      if (!this.sunG) this.sunG = this.add.graphics().setDepth(7);
      try { AUDIO.play('charge'); } catch (e) {}
    }
    if (!gd.sunUntil) return;
    if (time >= gd.sunUntil) {
      gd.sunUntil = 0;
      gd.nextSunlanceAt = time + L.everyMs * (gd.rateMult || 1);
      if (this.sunG) this.sunG.clear();
      return;
    }
    var dtL = Math.min(120, time - (gd.lastSunAt || time));
    gd.lastSunAt = time;
    gd.sunAng += gd.sunDir * Phaser.Math.DegToRad(L.degPerSec) * dtL / 1000;
    var x2 = b.x + Math.cos(gd.sunAng) * L.length, y2 = b.y + Math.sin(gd.sunAng) * L.length;
    var g = this.sunG;
    g.clear();
    g.lineStyle(26, 0xffd23e, 0.20); g.lineBetween(b.x, b.y, x2, y2);
    g.lineStyle(10, 0xffe3a8, 0.5);  g.lineBetween(b.x, b.y, x2, y2);
    if (time >= gd.nextSunTickAt) {
      gd.nextSunTickAt = time + L.tickMs;
      var pd = Math.hypot(player.x - b.x, player.y - b.y);
      if (player.state.alive && pd < L.length && pd > 10) {
        var pa = Math.atan2(player.y - b.y, player.x - b.x);
        var diff = Phaser.Math.Angle.Wrap(pa - gd.sunAng);
        var halfRad = Phaser.Math.DegToRad(L.halfDeg) + 14 / Math.max(40, pd);
        if (Math.abs(diff) < halfRad) {
          Entities.hurtPlayer(this, player, L.dmg, time, "the Grovekeeper's sunlance", true);
        }
      }
    }
  },

  clearGrovekeeperFx: function () {
    if (this.sunG) { try { this.sunG.destroy(); } catch (e) {} this.sunG = null; }
    if (this.timberFall) { try { this.timberFall.shadow.destroy(); } catch (e) {} this.timberFall = null; }
    (this.groveFx || []).forEach(function (o) { try { o.destroy(); } catch (e) {} });
    this.groveFx = [];
    var st = this.player && this.player.state;
    if (st) { st.slowUntil = 0; st.slowMult = 1; }
    this._reviveTarget = null; this._reviveState = null;
  },

  // THE HEARTWOOD WAKES — camera to the clearing; the ground splits and the
  // Grovekeeper GROWS OUT OF THE GROUND (user 2026-07-15), sprouting from a
  // sapling to his full height at the great tree's feet. Tween-driven,
  // pause-safe; ambient tree-falls gate on arrivalGrove.
  grovekeeperArrival: function (def) {
    var self = this, A = def.treeArrival, hw = this.heartwood;
    this.arrivalGrove = true;
    var bx = hw.x, by = hw.y + 150;                      // the clearing before the tree
    this.cameras.main.stopFollow();
    this.cameras.main.pan(bx, by - 30, 700, 'Sine.easeInOut');
    try { AUDIO.play('creak'); } catch (e) {}
    this.cameras.main.shake(A.shakeMs, 0.005);
    // the canopy shudders + the soil churns where he'll sprout
    this.tweens.add({ targets: hw, scaleX: { from: 1.4, to: 1.46 }, duration: A.shakeMs / 2, yoyo: true, repeat: 1 });
    var mound = this.add.ellipse(bx, by + 16, 60, 22, 0x5b4636, 0.9).setDepth(3);
    this.tweens.add({ targets: mound, scaleX: { from: 0.2, to: 1 }, scaleY: { from: 0.2, to: 1 }, duration: A.shakeMs });
    this.time.delayedCall(300, function () { self.burst(bx, by, 12, 0x7d6450); });   // dirt
    this.time.delayedCall(A.shakeMs, function () {
      try { AUDIO.play('portal'); } catch (e) {}
      // HE GROWS — spawn tiny at the ground line and swell to full height,
      // feet planted (y tracks the scale so the base never moves)
      self.spawnBossNow(def, bx, by);
      // item 10: TIMBER WALLS BOX YOU IN — the mech promises it, so make it real.
      // A palisade ring rises around the heartwood clearing and the player is
      // clamped inside it for the whole fight (survives the phase-two revive).
      self.raiseGroveTimber(bx, by - 30);
      if (self.boss) {
        var b = self.boss, fullScale = b.scaleX, fullH = b.displayHeight;
        var groundY = by + fullH / 2;
        var grow = { t: 0 };
        b.setScale(fullScale * 0.12);
        b.y = groundY - b.displayHeight / 2;
        self.tweens.add({ targets: grow, t: 1, duration: A.splitMs + A.stepMs, ease: 'Back.Out',
          onUpdate: function () {
            if (!b.active) return;
            var s = fullScale * (0.12 + 0.88 * grow.t);
            b.setScale(s);
            b.y = groundY - b.displayHeight / 2;         // roots stay rooted
          },
          onComplete: function () { if (b.active) { b.setScale(fullScale); b.y = by; } } });
        // leaves + dirt burst as he breaches, twice
        self.burst(bx, by + 10, 16, 0x63b25a);
        self.time.delayedCall(Math.round((A.splitMs + A.stepMs) * 0.5), function () {
          self.burst(bx, by - 10, 14, 0x8ff0a5);
          self.cameras.main.shake(180, 0.006);
          try { AUDIO.play('thud'); } catch (e) {}
        });
      }
      self.time.delayedCall(A.splitMs + A.stepMs + 150, function () {
        self.tweens.add({ targets: mound, alpha: 0, duration: 800,
          onComplete: function () { try { mound.destroy(); } catch (e) {} } });
        self.arrivalGrove = false;
        self.cameras.main.startFollow(self.player);
        self.showScouter(def);
      });
    });
  },

  // PHASE TWO (user 2026-07-15): on his first death the pixies come. Real
  // pixie mobs fly in from the clearing's edges and channel the bloom; every
  // one killed mid-channel cuts the restored HP. Then you kill him AGAIN.
  grovekeeperResurrection: function (boss) {
    var P2 = boss.boss.def.phaseTwo, self = this;
    boss.boss.resurrecting = true;
    boss.boss.hp = 1;
    boss.setVelocity(0, 0);
    boss.setTint(0x9aa7b8);
    // his verbs die with him mid-channel (the beam/telegraphs don't haunt the corpse)
    if (this.timberFall) { try { this.timberFall.shadow.destroy(); } catch (e) {} this.timberFall = null; }
    if (this.sunG) this.sunG.clear();
    boss.boss.sunUntil = 0;
    this.banner('THE GROVE ANSWERS\nkill the pixies before the bloom completes!', '#8fd6ff');
    try { AUDIO.play('revive'); } catch (e) {}
    this._reviveTarget = { x: boss.x, y: boss.y };
    this._reviveState = { until: this.time.now + P2.channelMs, boss: boss };
    // the pixies fly in from a wide ring (queued spawns — real, killable mobs)
    for (var i = 0; i < P2.pixies; i++) {
      var a = Math.PI * 2 * i / P2.pixies + 0.3;
      this.queueSpawn({ key: 'pixie',
        x: Phaser.Math.Clamp(boss.x + Math.cos(a) * 520, 40, this.worldW - 40),
        y: Phaser.Math.Clamp(boss.y + Math.sin(a) * 520, 40, this.worldH - 40),
        cinematic: true });
    }
  },

  finishRevive: function () {
    var rs = this._reviveState; if (!rs) return;
    this._reviveState = null; this._reviveTarget = null;
    var boss = rs.boss, self = this;
    if (!boss || !boss.active) return;
    var P2 = boss.boss.def.phaseTwo;
    // surviving channelers power the bloom — corpses cut it
    var alive = 0;
    this.mobs.children.iterate(function (m) {
      if (m && m.active && m.mob.cinematic) { alive++; m.mob.cinematic = false; }  // they turn HOSTILE
    });
    var pct = Math.min(1, P2.basePct + P2.perPixiePct * alive);
    boss.boss.hp = Math.round(boss.boss.maxHp * pct);
    boss.boss.resurrecting = false;
    boss.boss.phase2done = true;
    boss.boss.spdMult = P2.spdMult;
    boss.boss.rateMult = P2.rateMult;
    boss.clearTint();
    // re-arm every clock with a short grace
    var t = this.time.now;
    boss.boss.nextRadialAt = t + 1400; boss.boss.nextStreamAt = t + 2600;
    this.initGrovekeeper(boss, t + 1000);
    this.burst(boss.x, boss.y, 30, 0x8ff0a5);
    this.burst(boss.x, boss.y, 16, 0x8fd6ff);
    try { AUDIO.play('revive'); } catch (e) {}
    this.cameras.main.shake(300, 0.008);
    this.banner('THE GROVEKEEPER RISES AGAIN\nhis stride quickens', '#38b764');
  },

  // per-frame grove upkeep — spawn queue, hazard, trunks, glow, corpses, revive
  updateGrove: function (time, delta) {
    this.drainSpawnQueue();
    if (!this.realmDef || this.realmDef.kind !== 'grove') return;
    // phase-two channel completion
    if (this._reviveState && time >= this._reviveState.until) this.finishRevive();
    // ambient falling trees (quiet while the boss owns the clearing)
    var gf = this.groveFall;
    if (gf) {
      var fightOver = !this.player.state.alive || this.closing;
      if (gf.phase === 'idle') {
        if (time >= gf.nextAt && !fightOver && !this.boss && !this.arrivalGrove && !this.bossPortal) {
          var px = this.player.x + (Math.random() * 2 - 1) * 220;
          var py = this.player.y + (Math.random() * 2 - 1) * 220;
          gf.fall = this.startTreeFall(px, py, gf.cfg.warnMs, gf.cfg.crushDmg, gf.cfg.trunkLifeMs, false);
          gf.phase = 'warn';
        } else if (fightOver) gf.nextAt = Infinity;
      } else if (gf.phase === 'warn') {
        gf.fall.shadow.setAlpha(Math.floor(time / 120) % 2 === 0 ? 0.45 : 0.28);
        if (time >= gf.fall.warnUntil) {
          this.dropTree(gf.fall);
          gf.fall = null;
          gf.phase = 'idle';
          gf.nextAt = time + gf.cfg.everyMinMs + Math.random() * (gf.cfg.everyMaxMs - gf.cfg.everyMinMs);
        }
      }
    }
    // trunks crumble
    for (var i = this.groveTrunks.length - 1; i >= 0; i--) {
      if (time >= this.groveTrunks[i].dieAt) {
        this.crumbleTrunk(this.groveTrunks[i]);
        this.groveTrunks.splice(i, 1);
      }
    }
    // glow patches expire + RESURRECT corpses that fell in them
    if (this.glowPatches.length) {
      var live = [];
      for (var g2 = 0; g2 < this.glowPatches.length; g2++) {
        var gp = this.glowPatches[g2];
        if (gp.dead || time >= gp.dieAt) { if (gp.obj && gp.obj.active) { try { gp.obj.destroy(); } catch (e) {} } continue; }
        live.push(gp);
        for (var c2 = 0; c2 < this.corpses.length; c2++) {
          var co = this.corpses[c2];
          if (!co.used && Math.hypot(co.x - gp.x, co.y - gp.y) < gp.r + 14) {
            co.used = true;
            this.queueSpawn({ key: co.key, x: co.x, y: co.y, revive: true });
            try { AUDIO.play('revive'); } catch (e) {}
          }
        }
      }
      this.glowPatches = live;
    }
    // corpse ledger TTL
    for (var c3 = this.corpses.length - 1; c3 >= 0; c3--) {
      if (this.corpses[c3].used || time - this.corpses[c3].at > 6000) this.corpses.splice(c3, 1);
    }
  },

  // ======================= M5.7 — THE ROBOTICS FACTORY =====================
  // Riveted-steel floors, catwalk borders, IN-GROUND CONVEYOR TRAVELATORS (the
  // map mechanic — moving WITH a belt bursts you along, AGAINST it slows you),
  // and ALIVE ambient machinery (scrolling belts, sweeping arms, hammering
  // presses, spinning fans, sparks, glowing smelters). At the north looms THE
  // PROTOTYPE BAY — the boss arena: 4 cover PILLARS, ceiling presses, wall
  // turrets, and the dormant PROTOTYPE 130C-4 on its gantry (visible all fight).
  // Ambient stands down while the boss lives / arrives. TUNE ME: everything.
  setupFactory: function (WW, HH) {
    var self = this;
    this._realmStart = { x: WW * 0.5, y: HH * 0.90 };
    this.add.tileSprite(WW / 2, HH / 2, WW, HH, 'factoryFloor').setDepth(-20);
    [[WW / 2, 26, WW, 52], [WW / 2, HH - 26, WW, 52], [26, HH / 2, 52, HH], [WW - 26, HH / 2, 52, HH]].forEach(function (b) {
      self.add.tileSprite(b[0], b[1], b[2], b[3], 'factoryHazard').setDepth(-19).setAlpha(0.9);
    });
    this.add.tileSprite(WW / 2, HH * 0.5, WW, 96, 'factoryCatwalk').setDepth(-18).setAlpha(0.85);
    // IN-GROUND CONVEYOR TRAVELATORS — the map mechanic (lanes across the floor)
    this.conveyors = [];
    var ccfg = this.realmDef.conveyor || { push: 150, withMult: 1.4, againstMult: 0.6, scrollSpeed: 90 };
    // THREE NON-OVERLAPPING lanes (Red 2026-07-15): two side verticals + one
    // central horizontal, all clear of each other AND the boss bay (top, y<0.33).
    // A up (x .19–.26), B down (x .74–.81), C right (x .29–.71) — gaps between all.
    [{ x: WW * 0.22, y: HH * 0.63, w: 150, h: HH * 0.56, dir: { x: 0, y: -1 } },
     { x: WW * 0.78, y: HH * 0.63, w: 150, h: HH * 0.56, dir: { x: 0, y: 1 } },
     { x: WW * 0.50, y: HH * 0.52, w: WW * 0.42, h: 150, dir: { x: 1, y: 0 } }].forEach(function (L) {
      var spr = self.add.tileSprite(L.x, L.y, L.dir.x !== 0 ? L.h : L.w, L.dir.x !== 0 ? L.w : L.h, 'convBelt').setDepth(-17);
      if (L.dir.x !== 0) spr.setRotation(Math.PI / 2);
      self.conveyors.push({ spr: spr, x: L.x, y: L.y, w: L.w, h: L.h, dir: L.dir, cfg: ccfg });
    });
    // ambient ALIVE props (animated in updateFactory)
    this.factory = { cfg: this.realmDef.factoryCycle || { sparkEveryMs: 700, steamEveryMs: 2600 },
                     nextSparkAt: this.time.now + 700, arms: [], presses: [] };
    [[WW * 0.2, HH * 0.42], [WW * 0.78, HH * 0.44], [WW * 0.4, HH * 0.68], [WW * 0.68, HH * 0.32]].forEach(function (p, i) {
      self.add.circle(p[0], p[1], 10, 0x454e63).setDepth(2);
      var arm = self.add.rectangle(p[0], p[1], 56, 10, 0x8a94a6).setOrigin(0, 0.5).setDepth(2).setRotation(i);
      self.add.circle(p[0], p[1], 5, 0x41d6f6).setDepth(3);
      self.factory.arms.push({ arm: arm, x: p[0], y: p[1], phase: i, sp: 1.0 + (i % 3) * 0.4 });
    });
    [[WW * 0.34, HH * 0.34], [WW * 0.6, HH * 0.72]].forEach(function (p, i) {
      self.add.rectangle(p[0], p[1] - 40, 54, 14, 0x3d4456).setDepth(2);
      var head = self.add.rectangle(p[0], p[1] - 20, 44, 26, 0x697386).setDepth(2).setStrokeStyle(2, 0x22283a);
      self.factory.presses.push({ head: head, y0: p[1] - 30, phase: i * 900 });
    });
    [[WW * 0.15, HH * 0.75], [WW * 0.85, HH * 0.66], [WW * 0.5, HH * 0.26]].forEach(function (p) {
      var fan = self.add.star(p[0], p[1], 4, 6, 20, 0x2b3245).setDepth(1);
      self.tweens.add({ targets: fan, angle: 360, duration: 900, repeat: -1 });
    });
    [[WW * 0.24, HH * 0.30], [WW * 0.8, HH * 0.82]].forEach(function (p) {
      var glow = self.add.circle(p[0], p[1], 26, 0xff7d3a, 0.5).setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
      self.tweens.add({ targets: glow, alpha: { from: 0.5, to: 0.85 }, scale: { from: 1, to: 1.15 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    this.coolantPatches = [];
    this.buildPrototypeBay(WW, HH);
  },

  // The custom boss arena — built at setup so the dormant mech looms all run.
  buildPrototypeBay: function (WW, HH) {
    var self = this, BC = { x: WW * 0.5, y: HH * 0.18 };
    this.arenaBay = { x: BC.x, y: BC.y, r: 360 };
    this.add.rectangle(BC.x, BC.y, 720, 720, 0x181a26, 0).setStrokeStyle(6, 0xffcd45, 0.3).setDepth(-16);
    this.add.tileSprite(BC.x, BC.y - 360, 720, 40, 'factoryHazard').setDepth(-16).setAlpha(0.8);
    this.add.tileSprite(BC.x, BC.y + 360, 720, 40, 'factoryHazard').setDepth(-16).setAlpha(0.8);
    this.bayBelts = [this.add.tileSprite(BC.x, BC.y, 120, 720, 'convBelt').setDepth(-15),
                     this.add.tileSprite(BC.x, BC.y, 720, 120, 'convBelt').setDepth(-15).setRotation(Math.PI / 2)];
    // 4 cover PILLARS — static bodies that break LOS for the reactor overload
    this.pillarBodies = [];
    this.pillarRects = [];
    [[-150, -120], [150, -120], [-150, 120], [150, 120]].forEach(function (o) {
      var px = BC.x + o[0], py = BC.y + o[1];
      var pil = self.add.rectangle(px, py, 50, 50, 0x5a6072).setStrokeStyle(3, 0x22283a).setDepth(4);
      self.add.rectangle(px, py, 50, 8, 0xffcd45, 0.6).setDepth(5);
      self.physics.add.existing(pil, true);
      self.pillarBodies.push(pil);
      self.pillarRects.push(new Phaser.Geom.Rectangle(px - 25, py - 25, 50, 50));
    });
    this.bayPresses = [];
    [[-150, 0], [150, 0], [0, -120], [0, 120]].forEach(function (o) {
      self.bayPresses.push({ x: BC.x + o[0], y: BC.y + o[1] });
    });
    this.bayTurrets = [{ x: BC.x - 350, y: BC.y }, { x: BC.x + 350, y: BC.y }, { x: BC.x, y: BC.y - 350 }, { x: BC.x, y: BC.y + 350 }];
    this.bayGantry = this.add.rectangle(BC.x, BC.y - 300, 170, 30, 0x454e63).setStrokeStyle(2, 0x22283a).setDepth(3);
    this.dormantMech = this.add.image(BC.x, BC.y - 322, 'mechHi').setDepth(3).setScale(1.4).setTint(0x5a6072);
    for (var l = 0; l < 5; l++) this.add.rectangle(BC.x, BC.y - 258 + l * 14, 22, 4, 0x697386).setDepth(2);
    this.add.rectangle(BC.x - 12, BC.y - 250, 3, 96, 0x697386).setDepth(2);
    this.add.rectangle(BC.x + 12, BC.y - 250, 3, 96, 0x697386).setDepth(2);
    this._factoryColliderPending = true;
  },
  wireFactoryColliders: function () {
    if (!this._factoryColliderPending) return;
    this._factoryColliderPending = false;
    if (!this.pillarBodies || !this.pillarBodies.length) return;
    var self = this;
    // M6e: pillars block BODIES only — shots fly over (squat pistons). They
    // used to eat player arrows, which read as "hitting the boss does nothing";
    // with the reactor no longer LOS-based they have no bullet-blocking job.
    this.pillarBodies.forEach(function (pil) {
      self.physics.add.collider(self.player, pil);
      self.physics.add.collider(self.mobs, pil);
    });
  },

  updateFactory: function (time, delta) {
    if (!this.realmDef || this.realmDef.kind !== 'factory') return;
    var p = this.player, alive = p.state.alive;
    this.wrapFactory();                                    // toroidal map — off one edge, on the other
    this.updateConveyors(time, delta);
    this.updateFactoryProps(time, alive && !this.closing && !this.engineerArrivalActive);
    this.updateCoolant(time);
    this.updateFactoryTurrets(time);
    if (this._engineerXform && time >= this._engineerXform.until) {
      var boss = this._engineerXform.boss; this._engineerXform = null; this.engineerTransformDone(boss);
    }
  },
  // SCREEN WRAP (Red 2026-07-15): the factory is TOROIDAL — the player and the
  // swarm that walk off one edge reappear on the opposite side (mirrors the
  // graveyard). The Grand Engineer / mech is a separate this.boss object and is
  // NOT in this.mobs, so it never wraps — it stays hunting on the field.
  wrapFactory: function () {
    var WW = this.worldW, HH = this.worldH;
    var wrap = function (o) {
      if (!o) return;
      var nx = o.x, ny = o.y, moved = false;
      if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
      if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
      if (!moved) return;
      if (o.body && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
      else { o.x = nx; o.y = ny; }
    };
    wrap(this.player);
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
  },
  updateConveyors: function (time, delta) {
    if (!this.conveyors) return;
    var dt = delta / 1000, self = this;
    // M6e CONVEYOR OVERRIDE — while the surge lives the belts run red + harder
    var surge = 1;
    if (this.conveyorSurge) {
      if (time < this.conveyorSurge.until) surge = this.conveyorSurge.mult;
      else { this.conveyorSurge = null; this.conveyors.forEach(function (c) { c.spr.clearTint(); }); }
    }
    this.conveyors.forEach(function (c) {
      c.spr.tilePositionY -= c.cfg.scrollSpeed * surge * dt;
      // belts shove the PLAYER only (Red 2026-07-15) — mobs are not sped up by them.
      var push = c.cfg.push * surge * dt, hw = c.w / 2, hh = c.h / 2, p = self.player;
      if (p.state.alive && Math.abs(p.x - c.x) < hw && Math.abs(p.y - c.y) < hh) { p.x += c.dir.x * push; p.y += c.dir.y * push; }
    });
  },
  updateFactoryProps: function (time, ambient) {
    var F = this.factory; if (!F) return;
    F.arms.forEach(function (a) { a.arm.setRotation(Math.sin(time / 700 * a.sp + a.phase) * 0.9); });
    F.presses.forEach(function (pr) { var t = (time + pr.phase) % 1200; var d = t < 300 ? t / 300 : (t < 500 ? 1 : (t < 700 ? 1 - (t - 500) / 200 : 0)); pr.head.y = pr.y0 + d * 22; });
    if (!ambient) return;
    if (time >= F.nextSparkAt) {
      F.nextSparkAt = time + F.cfg.sparkEveryMs;
      if (F.arms.length) { var a = F.arms[Math.floor(SIM.rng() * F.arms.length)]; this.burst(a.x + (SIM.rng() * 2 - 1) * 30, a.y, 5, 0xffd34d); }
    }
  },

  // ---- new-mob scene hooks (coolant slow-field / bulwark ward / mend / flame) --
  dropCoolant: function (x, y, cfg) {
    if (this.boss) return;   // M6e (Red): NO slow-pools anywhere in the boss fight
    this.coolantPatches = this.coolantPatches || [];
    var patch = this.add.ellipse(x, y, cfg.radius * 2, cfg.radius * 1.6, 0x8fe0ff, 0.22).setDepth(3).setStrokeStyle(1, 0xc2fbff, 0.5).setBlendMode(Phaser.BlendModes.ADD);
    var rec = { obj: patch, x: x, y: y, r: cfg.radius, slowMult: cfg.slowMult, dieAt: this.time.now + cfg.lifeMs };
    this.coolantPatches.push(rec);
    this.tweens.add({ targets: patch, alpha: 0.06, duration: cfg.lifeMs, ease: 'Sine.In', onComplete: function () { rec.dead = true; try { patch.destroy(); } catch (e) {} } });
  },
  updateCoolant: function (time) {
    if (!this.coolantPatches || !this.coolantPatches.length) return;
    var live = [], p = this.player, inField = false, mult = 1;
    for (var i = 0; i < this.coolantPatches.length; i++) {
      var s = this.coolantPatches[i];
      if (s.dead || time >= s.dieAt) { if (s.obj && s.obj.active) { try { s.obj.destroy(); } catch (e) {} } continue; }
      live.push(s);
      if (p.state.alive && Math.hypot(p.x - s.x, p.y - s.y) < s.r) { inField = true; mult = Math.min(mult, s.slowMult); }
    }
    this.coolantPatches = live;
    if (inField) { p.state.slowUntil = time + 160; p.state.slowMult = mult; }
  },
  updateGuardAura: function (m, cfg, time) {
    if (!m.mob.auraSpr) m.mob.auraSpr = this.add.circle(m.x, m.y, cfg.radius, 0x94b0c2, 0.05).setStrokeStyle(2, 0x94b0c2, 0.3).setDepth(2);
    m.mob.auraSpr.setPosition(m.x, m.y);
    this.mobs.children.iterate(function (b) { if (b && b.active && b !== m && b.mob && Math.hypot(b.x - m.x, b.y - m.y) < cfg.radius) b.mob.guardShieldUntil = time + 300; });
  },
  mendNearby: function (m, cfg) {
    var self = this, healed = 0;
    this.mobs.children.iterate(function (b) {
      if (b && b.active && b !== m && b.mob && b.mob.maxHp && b.mob.hp < b.mob.maxHp && Math.hypot(b.x - m.x, b.y - m.y) < cfg.radius) {
        b.mob.hp = Math.min(b.mob.maxHp, b.mob.hp + cfg.amount);
        if (healed++ < 3) self.burst(b.x, b.y - 6, 3, 0x7fffbf);
      }
    });
  },
  flameCircleWarn: function (m, cfg) {
    var ring = this.add.circle(m.mob.flameX, m.mob.flameY, cfg.radius, cfg.tint || 0xff7a2c, 0.12).setStrokeStyle(2, 0xffd34d, 0.8).setDepth(2);
    this.tweens.add({ targets: ring, scale: { from: 0.4, to: 1 }, duration: cfg.windupMs });
    m.mob.flameRing = ring;
  },
  flameCircleBlast: function (m, cfg) {
    var x = m.mob.flameX, y = m.mob.flameY;
    if (m.mob.flameRing) { try { m.mob.flameRing.destroy(); } catch (e) {} m.mob.flameRing = null; }
    this.burst(x, y, 14, 0xff7a2c); try { AUDIO.play('crash'); } catch (e) {}
    if (this.player.state.alive && Math.hypot(this.player.x - x, this.player.y - y) < cfg.radius)
      Entities.hurtPlayer(this, this.player, cfg.dmg, this.time.now, 'a Purge Flamer');
    this.dropSlime(x, y, { radius: cfg.radius * 0.8, lifeMs: cfg.lingerMs, dmg: cfg.lingerDmg, tickMs: cfg.tickMs, fire: true });
  },

  // ================== M5.7 — THE GRAND ENGINEER (2-phase boss) ==============
  engineerArrival: function (def) {
    var self = this, g = this.arenaBay;
    this.engineerArrivalActive = true;
    // M6e (Red): clear any lingering coolant slow-pools — the fight starts clean
    if (this.coolantPatches) { this.coolantPatches.forEach(function (p) { if (p.obj && p.obj.active) { try { p.obj.destroy(); } catch (e) {} } }); this.coolantPatches = []; }
    this.player.setPosition(g.x, g.y + 300);
    this.cameras.main.centerOn(g.x, g.y + 80);
    this.banner('THE GRAND ENGINEER\nthe line answers to him', '#ffcd45');
    this.cameras.main.shake(def.floorLift.rumbleMs, 0.005);
    var lift = this.add.rectangle(g.x, g.y, 90, 90, 0x454e63).setStrokeStyle(3, 0xffcd45, 0.6).setDepth(2).setScale(1, 0.2);
    this.tweens.add({ targets: lift, scaleY: 1, duration: def.floorLift.riseMs, ease: 'Back.Out' });
    for (var s = 0; s < 6; s++) this.time.delayedCall(s * 120, function () { self.burst(g.x + (SIM.rng() * 2 - 1) * 40, g.y + 40, 4, 0xb8c2d0); });
    this.time.delayedCall(def.floorLift.rumbleMs + def.floorLift.riseMs, function () {
      if (self.closing || !self.player.state.alive) { self.engineerArrivalActive = false; return; }
      self.spawnBossNow(def, g.x, g.y);
      self.showScouter(def);
      self.engineerArrivalActive = false;
    });
  },
  initEngineer: function (b, time) {
    var bs = b.boss, P = bs.def.patterns;
    if (!bs.phase) bs.phase = 1;
    bs.nextPressAt = time + 3000; bs.nextArcAt = time + 6000; bs.nextTurretAt = time + 9000;
    bs.nextCallAt = time + 12000;
    // M6e phase-2 clocks — telegraphed zones only
    bs.nextDrillAt = time + 5000; bs.nextScrapAt = time + 3800; bs.nextConeAt = time + 6500;
    bs.nextStampAt = time + 9000; bs.nextOverrideAt = time + 12000;
    bs.nextReactorAt = time + ((P.reactorPurge && P.reactorPurge.firstDelayMs) || 9000);
    bs.ventDmgMult = (P.reactorPurge && P.reactorPurge.ventDmgMult) || 1.5;
    if (bs.overclocked === undefined) bs.overclocked = false;
  },
  engineerUpdate: function (b, player, time) {
    var bs = b.boss, def = bs.def, P = def.patterns;
    var rate = bs.rateMult || 1;
    if (!bs.overclocked && bs.phase === 2 && bs.hp <= bs.maxHp * P.overclock.hpPct) {
      bs.overclocked = true; bs.spdMult = (bs.spdMult || 1) * P.overclock.spdMult; bs.rateMult = (bs.rateMult || 1) * P.overclock.rateMult;
      rate = bs.rateMult; b.setTint(0xff7a2c);
      this.banner('OVERCLOCK\nit runs hot — the reactor comes sooner', '#ff7a2c');
      bs.nextReactorAt = Math.min(bs.nextReactorAt, time + 4000);
    }
    // reactor purge owns the moment while charging (rooted, circle grows)
    if (this.engineerFx && this.engineerFx.reactorUntil) { this.updateReactor(b, player, time); return; }
    // M6e: VENTED after the purge — rooted, helpless, takes bonus damage
    if (bs.ventedUntil) {
      if (time < bs.ventedUntil) { b.setVelocity(0, 0); return; }
      bs.ventedUntil = 0; if (!bs.overclocked) b.clearTint(); else b.setTint(0xff7a2c);
    }
    var dx = player.x - b.x, dy = player.y - b.y, dist = Math.hypot(dx, dy) || 1;
    var spd = def.spd * (bs.spdMult || 1);
    var rooted = bs.rootUntil && time < bs.rootUntil;       // drill/cone wind-up
    if (rooted) b.setVelocity(0, 0);
    else if (bs.phase === 1) {                              // ranged: hold the line, never melee
      var want = 260, dir = dist < want ? -1 : (dist > want * 1.5 ? 1 : 0);
      b.setVelocity(dx / dist * spd * dir, dy / dist * spd * dir);
    } else {                                                // the mech HUNTS you
      b.setVelocity(dx / dist * spd, dy / dist * spd);
    }
    b.setFlipX(dx < 0);
    if (bs.phase === 1) {
      if (time >= bs.nextPressAt) { bs.nextPressAt = time + P.pressSlam.everyMs * rate; this.engineerPressSlam(b, player, P.pressSlam); }
      if (time >= bs.nextArcAt) { bs.nextArcAt = time + P.arcDischarge.everyMs * rate; this.engineerRing(b.x, b.y, P.arcDischarge, 0x7ff0ff); }
      if (time >= bs.nextTurretAt) { bs.nextTurretAt = time + P.turretDeploy.everyMs * rate; this.engineerTurrets(P.turretDeploy); }
      if (time >= bs.nextCallAt) { bs.nextCallAt = time + P.callLine.everyMs * rate; this.engineerCallLine(b, P.callLine); }
    } else {
      // THE WALKING FACTORY (M6e): telegraphed ground shapes only — no bullets.
      if (time >= bs.nextDrillAt) { bs.nextDrillAt = time + P.drillCharge.everyMs * rate; this.engineerDrill(b, player, P.drillCharge); }
      if (time >= bs.nextScrapAt) { bs.nextScrapAt = time + P.scrapLob.everyMs * rate; this.engineerScrapLob(b, player, P.scrapLob); }
      if (time >= bs.nextConeAt) { bs.nextConeAt = time + P.exhaustCone.everyMs * rate; this.engineerExhaustCone(b, player, P.exhaustCone); }
      if (time >= bs.nextStampAt) { bs.nextStampAt = time + P.floorStamp.everyMs * rate; this.engineerFloorStamp(b, P.floorStamp); }
      if (time >= bs.nextOverrideAt) { bs.nextOverrideAt = time + P.conveyorOverride.everyMs * rate; this.engineerOverride(P.conveyorOverride); }
      if (time >= bs.nextReactorAt) { bs.nextReactorAt = time + P.reactorPurge.everyMs * rate; this.engineerReactorStart(b, P.reactorPurge); }
    }
  },
  hasBayLOS: function (ax, ay, bx, by) {
    if (!this.pillarRects) return true;
    var line = new Phaser.Geom.Line(ax, ay, bx, by);
    for (var i = 0; i < this.pillarRects.length; i++) if (Phaser.Geom.Intersects.LineToRectangle(line, this.pillarRects[i])) return false;
    return true;
  },
  engineerRing: function (cx, cy, cfg, color) {
    var self = this, maxR = cfg.maxR || 560, r0 = 20;
    var ring = this.add.circle(cx, cy, r0, color, 0).setStrokeStyle(4, color, 0.85).setDepth(6);
    var st = { r: r0, hit: false };
    this.engineerFx = this.engineerFx || {};
    var EF = this.engineerFx;
    EF.ring = { x: cx, y: cy, r: r0, band: cfg.band, maxR: maxR };   // bot/HUD-readable
    this.tweens.add({ targets: st, r: maxR, duration: Math.max(300, maxR / cfg.ringSpeed * 1000), ease: 'Linear',
      onUpdate: function () { ring.setScale(st.r / r0); if (EF.ring) EF.ring.r = st.r; var p = self.player;   // scale, not setRadius (Arc API-safe)
        if (p.state.alive && !st.hit) { var d = Math.hypot(p.x - cx, p.y - cy); if (Math.abs(d - st.r) < cfg.band) { st.hit = true; Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, 'the Engineer', true); } } },
      onComplete: function () { EF.ring = null; try { ring.destroy(); } catch (e) {} } });
  },
  // shared telegraphed-circle helper (press slam + scrap lob): warn ring →
  // blast. `warns` entries are exposed on this._zoneWarns for the player-sim.
  engineerZoneBlast: function (spots, cfg, src, killMobs) {
    var self = this;
    this._zoneWarns = this._zoneWarns || [];
    spots.forEach(function (sp, idx) {
      self.time.delayedCall(idx * (cfg.gapMs || 0), function () {
        var ring = self.add.circle(sp.x, sp.y, cfg.radius, 0xffcd45, 0.14).setStrokeStyle(2, 0xffcd45, 0.8).setDepth(2);
        self.tweens.add({ targets: ring, scale: { from: 0.4, to: 1 }, duration: cfg.warnMs });
        var warn = { x: sp.x, y: sp.y, r: cfg.radius, until: self.time.now + cfg.warnMs };
        self._zoneWarns.push(warn);
        self.time.delayedCall(cfg.warnMs, function () {
          var wi = self._zoneWarns.indexOf(warn); if (wi >= 0) self._zoneWarns.splice(wi, 1);
          try { ring.destroy(); } catch (e) {}
          self.burst(sp.x, sp.y, 12, 0xb8c2d0); self.cameras.main.shake(120, 0.005); try { AUDIO.play('crash'); } catch (e) {}
          if (self.player.state.alive && Math.hypot(self.player.x - sp.x, self.player.y - sp.y) < cfg.radius)
            Entities.hurtPlayer(self, self.player, cfg.dmg, self.time.now, src, true);
          if (killMobs) self.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - sp.x, m.y - sp.y) < cfg.radius) self.killMobCredited(m); });
        });
      });
    });
  },
  engineerPressSlam: function (b, player, cfg) {
    var pads = (this.bayPresses || []).slice(), spots = [];
    if (pads.length) { pads.sort(function (a, c) { return Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(c.x - player.x, c.y - player.y); }); spots = pads.slice(0, cfg.count).map(function (pd) { return { x: pd.x, y: pd.y }; }); }
    else for (var i = 0; i < cfg.count; i++) spots.push({ x: player.x + (SIM.rng() * 2 - 1) * 120, y: player.y + (SIM.rng() * 2 - 1) * 120 });
    this.engineerZoneBlast(spots, cfg, "the Engineer's press", true);
  },
  // M6e SCRAP LOB — 3 marked impact circles scattered around you; walk out.
  engineerScrapLob: function (b, player, cfg) {
    var spots = [];
    for (var i = 0; i < cfg.lobs; i++) {
      var a = Math.PI * 2 * i / cfg.lobs + SIM.rng();
      spots.push({ x: Phaser.Math.Clamp(player.x + Math.cos(a) * (SIM.rng() * cfg.scatter), 60, this.worldW - 60),
                   y: Phaser.Math.Clamp(player.y + Math.sin(a) * (SIM.rng() * cfg.scatter), 60, this.worldH - 60) });
    }
    this.engineerZoneBlast(spots, cfg, '130C-4 scrap', false);
  },
  engineerTurrets: function (cfg) {
    var self = this; this.factoryTurrets = this.factoryTurrets || [];
    (this.bayTurrets || []).slice(0, cfg.turrets).forEach(function (mt) {
      var spr = self.add.circle(mt.x, mt.y, 12, 0xb13e53).setStrokeStyle(2, 0x22283a).setDepth(4);
      self.factoryTurrets.push({ x: mt.x, y: mt.y, spr: spr, fireAt: self.time.now + 500, offAt: self.time.now + cfg.durMs, fireMs: cfg.fireMs, dmg: cfg.dmg, projSpeed: cfg.projSpeed });
    });
    this.banner('TURRETS ONLINE\ntake cover or silence them', '#ffcd45');
  },
  updateFactoryTurrets: function (time) {
    if (!this.factoryTurrets || !this.factoryTurrets.length) return;
    var self = this, p = this.player, live = [];
    this.factoryTurrets.forEach(function (t) {
      if (time >= t.offAt || !self.boss) { if (t.spr) { try { t.spr.destroy(); } catch (e) {} } return; }
      live.push(t);
      if (p.state.alive && time >= t.fireAt) {
        t.fireAt = time + t.fireMs;
        var a = Math.atan2(p.y - t.y, p.x - t.x);
        var s = Entities.fireProjectile(self, self.enemyShots, t.x, t.y, a, t.projSpeed, t.dmg, 2600, 'orbShot', false, 'a rivet turret');
        if (s) { s.proj.fromBoss = true; s.setTint(0xffcd45); }
      }
    });
    this.factoryTurrets = live;
  },
  engineerCallLine: function (b, cfg) {
    var alive = 0;
    this.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.bossWave) alive++; });
    var room = Math.max(0, cfg.cap - alive);
    for (var i = 0; i < Math.min(cfg.count, room); i++) {
      var key = cfg.keys[i % cfg.keys.length], a = SIM.rng() * Math.PI * 2;
      this.queueSpawn({ key: key, bossWave: true, x: b.x + Math.cos(a) * 170, y: b.y + Math.sin(a) * 170 });
    }
  },
  // M6e DRILL CHARGE (kept per Red, properly telegraphed): the mech ROOTS and
  // revs, the lane flashes for warnMs — plenty of time to step OUT — then it
  // dashes the lane. Lane geometry exposed on engineerFx.drill for the sim.
  engineerDrill: function (b, player, cfg) {
    var self = this, ang = Math.atan2(player.y - b.y, player.x - b.x), len = cfg.len, half = cfg.half;
    b.boss.rootUntil = this.time.now + cfg.warnMs;          // rooted while revving
    var cx = b.x + Math.cos(ang) * len / 2, cy = b.y + Math.sin(ang) * len / 2;
    var lane = this.add.rectangle(cx, cy, len, half * 2, 0xff3b30, 0).setDepth(3).setRotation(ang);
    this.tweens.add({ targets: lane, fillAlpha: { from: 0.12, to: 0.45 }, duration: 320, yoyo: true, repeat: Math.max(1, Math.floor(cfg.warnMs / 640)) });   // FLASHES, not a fade
    this.engineerFx = this.engineerFx || {};
    this.engineerFx.drill = { x: b.x, y: b.y, ang: ang, len: len, half: half, until: this.time.now + cfg.warnMs };
    try { AUDIO.play('creak'); } catch (e) {}
    this.cameras.main.shake(cfg.warnMs, 0.002);             // it REVS — you can feel it coming
    var ox = b.x, oy = b.y;
    this.time.delayedCall(cfg.warnMs, function () {
      if (self.engineerFx) self.engineerFx.drill = null;
      if (!b.active) { try { lane.destroy(); } catch (e) {} return; }
      self.tweens.add({ targets: b, x: ox + Math.cos(ang) * len, y: oy + Math.sin(ang) * len, duration: cfg.dashMs, ease: 'Quad.in',
        onUpdate: function () { var p = self.player; if (p.state.alive && !lane._hit) {
          var dxl = p.x - b.x, dyl = p.y - b.y, proj = dxl * Math.cos(ang) + dyl * Math.sin(ang), perp = Math.abs(-dxl * Math.sin(ang) + dyl * Math.cos(ang));
          if (perp < half + 12 && proj > -40 && proj < 60) { lane._hit = true; Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, '130C-4 drill charge', true); } } },
        onComplete: function () { try { lane.destroy(); } catch (e) {} } });
    });
  },
  // M6e EXHAUST CONE — direction LOCKS at cast (graveyard banshee rule), the
  // wedge glows on the floor for warnMs, then the flame resolves inside it.
  engineerExhaustCone: function (b, player, cfg) {
    var self = this, ang = Math.atan2(player.y - b.y, player.x - b.x);
    var half = Phaser.Math.DegToRad(cfg.halfDeg);
    b.boss.rootUntil = this.time.now + cfg.warnMs;          // rooted while it vents up
    var g = this.add.graphics().setDepth(3);
    g.fillStyle(0xff7a2c, 0.16); g.slice(b.x, b.y, cfg.range, ang - half, ang + half, false); g.fillPath();
    g.lineStyle(2, 0xff7a2c, 0.8); g.slice(b.x, b.y, cfg.range, ang - half, ang + half, false); g.strokePath();
    this.tweens.add({ targets: g, alpha: { from: 0.55, to: 1 }, duration: 280, yoyo: true, repeat: Math.max(1, Math.floor(cfg.warnMs / 560)) });
    this.engineerFx = this.engineerFx || {};
    this.engineerFx.cone = { x: b.x, y: b.y, ang: ang, half: half, range: cfg.range, until: this.time.now + cfg.warnMs };
    this.time.delayedCall(cfg.warnMs, function () {
      if (self.engineerFx) self.engineerFx.cone = null;
      try { g.destroy(); } catch (e) {}
      if (!b.active) return;
      for (var i = 0; i < 4; i++) self.burst(b.x + Math.cos(ang + (SIM.rng() - 0.5) * half) * (60 + i * 70),
                                             b.y + Math.sin(ang + (SIM.rng() - 0.5) * half) * (60 + i * 70), 6, 0xff7a2c);
      var p = self.player;
      if (p.state.alive) {
        var d = Math.hypot(p.x - b.x, p.y - b.y);
        var diff = Phaser.Math.Angle.Wrap(Math.atan2(p.y - b.y, p.x - b.x) - ang);
        if (d <= cfg.range && Math.abs(diff) <= half) Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "130C-4's exhaust", true);
      }
    });
  },
  // M6e FLOOR STAMP (Red: "square … stand between two waves") — a checkerboard
  // around the mech blows in TWO alternating waves: wave-B tiles are SAFE while
  // wave A resolves, and vice versa. Grid exposed on engineerFx.stamp.
  engineerFloorStamp: function (b, cfg) {
    var self = this, t = cfg.tile, now = this.time.now;
    var x0 = b.x - (cfg.cols / 2 - 0.5) * t, y0 = b.y - (cfg.rows / 2 - 0.5) * t;
    var cells = [];
    for (var i = 0; i < cfg.cols; i++) for (var j = 0; j < cfg.rows; j++) {
      var cx = x0 + i * t, cy = y0 + j * t;
      if (cx < 40 || cy < 40 || cx > this.worldW - 40 || cy > this.worldH - 40) continue;
      cells.push({ x: cx, y: cy, wave: (i + j) % 2 });
    }
    this.engineerFx = this.engineerFx || {};
    this.engineerFx.stamp = { cells: cells, tile: t, aAt: now + cfg.warnMs, bAt: now + cfg.warnMs * 2 };
    var fire = function (wave, delay) {
      self.time.delayedCall(delay, function () {
        if (!b.active) { if (self.engineerFx && wave === 1) self.engineerFx.stamp = null; return; }
        var rects = [];
        cells.forEach(function (c) { if (c.wave !== wave) return;
          rects.push(self.add.rectangle(c.x, c.y, t - 10, t - 10, 0xffcd45, 0.13).setStrokeStyle(2, 0xffcd45, 0.85).setDepth(2)); });
        self.tweens.add({ targets: rects, fillAlpha: 0.32, duration: cfg.warnMs });
        self.time.delayedCall(cfg.warnMs, function () {
          rects.forEach(function (r) { try { r.destroy(); } catch (e) {} });
          try { AUDIO.play('crash'); } catch (e) {} self.cameras.main.shake(140, 0.004);
          var p = self.player, hit = false;
          cells.forEach(function (c) { if (c.wave !== wave) return;
            self.burst(c.x, c.y, 5, 0xffd34d);
            if (!hit && p.state.alive && Math.abs(p.x - c.x) < t / 2 && Math.abs(p.y - c.y) < t / 2) {
              hit = true; Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, 'the floor stamp', true);
            } });
          if (wave === 1 && self.engineerFx) self.engineerFx.stamp = null;
        });
      });
    };
    fire(0, 0);                    // wave A telegraphs now, blows at warnMs
    fire(1, cfg.warnMs);           // wave B telegraphs as A blows — step across
    this.banner('FLOOR STAMP\nstand between the waves', '#ffcd45');
  },
  // M6e CONVEYOR OVERRIDE — the belts surge red and shove twice as hard.
  engineerOverride: function (cfg) {
    this.conveyorSurge = { until: this.time.now + cfg.durMs, mult: cfg.mult };
    (this.conveyors || []).forEach(function (c) { c.spr.setTint(0xff6a4d); });
    this.banner('CONVEYOR OVERRIDE\nthe belts run hot', '#ff7a2c');
  },
  // M6e REACTOR PURGE (signature rework — Red: the LOS detonate "doesn't work,
  // there's nowhere to take cover"): the mech ROOTS where it stands, a huge
  // warning circle grows around it for chargeMs — RUN OUT of it — then the
  // blast hits everything still inside. Afterward it VENTS: rooted, helpless,
  // and taking bonus damage (hurtBoss reads bs.ventedUntil). No pillars needed.
  engineerReactorStart: function (b, cfg) {
    this.engineerFx = this.engineerFx || {};
    this.engineerFx.reactorUntil = this.time.now + cfg.chargeMs;
    this.engineerFx.reactorCfg = cfg;
    this.banner('REACTOR PURGE\nget OUT of the circle!', '#ff3b30');
    try { AUDIO.play('portal'); } catch (e) {}
    if (this.reactorWarnRing) { try { this.reactorWarnRing.destroy(); } catch (e) {} }
    if (this.reactorGrowRing) { try { this.reactorGrowRing.destroy(); } catch (e) {} }
    this.reactorWarnRing = this.add.circle(b.x, b.y, cfg.radius, 0xff3b30, 0.07).setStrokeStyle(3, 0xff3b30, 0.5).setDepth(6);
    this.reactorGrowRing = this.add.circle(b.x, b.y, cfg.radius, 0xff3b30, 0).setStrokeStyle(2, 0xffe08a, 0.9).setDepth(6).setScale(0.05);
    this.tweens.add({ targets: this.reactorGrowRing, scale: 1, duration: cfg.chargeMs, ease: 'Linear' });   // the fuse
  },
  updateReactor: function (b, player, time) {
    b.setVelocity(0, 0);
    var EF = this.engineerFx, cfg = EF.reactorCfg || { radius: 500, dmg: 55, ventMs: 3500 };
    var left = EF.reactorUntil - time, period = Math.max(80, left / 6);
    b.setTint(Math.floor(time / period) % 2 === 0 ? 0xff3b30 : 0xffe08a);
    if (this.reactorWarnRing) { this.reactorWarnRing.setPosition(b.x, b.y); this.reactorWarnRing.setScale(1 + Math.sin(time / 100) * 0.03); }
    if (this.reactorGrowRing) this.reactorGrowRing.setPosition(b.x, b.y);
    if (left <= 0) {
      EF.reactorUntil = 0;
      if (player.state.alive && Math.hypot(player.x - b.x, player.y - b.y) <= cfg.radius)
        Entities.hurtPlayer(this, player, cfg.dmg, time, 'the Reactor Purge', true);
      this.cameras.main.shake(500, 0.012);
      var blast = this.add.circle(b.x, b.y, 40, 0xffd34d, 0.6).setDepth(20).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: blast, scale: cfg.radius / 40, alpha: 0, duration: 450, onComplete: function () { try { blast.destroy(); } catch (e) {} } });
      if (this.reactorWarnRing) { try { this.reactorWarnRing.destroy(); } catch (e) {} this.reactorWarnRing = null; }
      if (this.reactorGrowRing) { try { this.reactorGrowRing.destroy(); } catch (e) {} this.reactorGrowRing = null; }
      // THE PUNISH WINDOW — vented: rooted + bonus damage (see Entities.hurtBoss)
      b.boss.ventedUntil = time + cfg.ventMs;
      b.setTint(0x7ff0ff);
      for (var i = 0; i < 5; i++) this.burst(b.x + (SIM.rng() * 2 - 1) * 50, b.y + (SIM.rng() * 2 - 1) * 50, 6, 0xc2fbff);
      this.banner('IT VENTS\nthe core is exposed — unload!', '#7ff0ff');
    }
  },
  engineerTransform: function (boss) {
    var self = this, bs = boss.boss, def = bs.def, BC = this.arenaBay || { x: boss.x, y: boss.y };
    bs.resurrecting = true; bs.hp = 1; boss.setVelocity(0, 0);
    this.banner('THE ENGINEER BOARDS 130C-4\ntake cover — it is coming', '#ffcd45');
    try { AUDIO.play('revive'); } catch (e) {}
    this.tweens.add({ targets: boss, x: BC.x, y: BC.y - 280, duration: 900, ease: 'Sine.in' });
    this._engineerXform = { until: this.time.now + ((def.phaseTwo && def.phaseTwo.channelMs) || 3200), boss: boss };
    this.time.delayedCall(1000, function () {
      if (!boss.active) return;
      var sc = def.mech.scale || 1.5;
      boss.setTexture(def.mech.texture).setScale(sc).clearTint();
      // M6e FIX ("arrows fly over the boss"): the mech gets a real centered body
      // matching its big sprite — texture-space size = world bodyW/H ÷ scale.
      if (def.mech.bodyW && boss.body) {
        var tex = boss.texture.getSourceImage(), tw = tex ? tex.width : 96;
        var bw = Math.round(def.mech.bodyW / sc), bh = Math.round(def.mech.bodyH / sc);
        boss.body.setSize(bw, bh).setOffset(Math.round((tw - bw) / 2), Math.round((tw - bh) / 2));
      }
      self.cameras.main.shake(400, 0.008);
      if (self.dormantMech) self.dormantMech.setVisible(false);
      if (self.bayGantry) self.tweens.add({ targets: self.bayGantry, x: BC.x - 260, angle: -40, alpha: 0.4, duration: 700 });
    });
  },
  engineerTransformDone: function (boss) {
    if (!boss || !boss.active) return;
    var bs = boss.boss, def = bs.def, P2 = def.phaseTwo, t = this.time.now;
    bs.resurrecting = false; bs.phase2done = true; bs.phase = 2;
    bs.hp = bs.maxHp;
    bs.spdMult = P2.spdMult; bs.rateMult = P2.rateMult;
    this.initEngineer(boss, t); bs.phase = 2;
    // M6e: NO radial/stream re-arm — the mech fires no projectiles at all.
    this.banner('PROTOTYPE 130C-4 ONLINE\nit hunts you now — watch the floor', '#b13e53');
    this.burst(boss.x, boss.y, 30, 0xffcd45);
  },
  clearEngineerFx: function () {
    if (this.reactorWarnRing) { try { this.reactorWarnRing.destroy(); } catch (e) {} this.reactorWarnRing = null; }
    if (this.reactorGrowRing) { try { this.reactorGrowRing.destroy(); } catch (e) {} this.reactorGrowRing = null; }
    this.engineerFx = null; this._engineerXform = null; this._zoneWarns = [];
    if (this.conveyorSurge) { this.conveyorSurge = null; (this.conveyors || []).forEach(function (c) { c.spr.clearTint(); }); }
    if (this.factoryTurrets) { this.factoryTurrets.forEach(function (t) { if (t.spr) { try { t.spr.destroy(); } catch (e) {} } }); this.factoryTurrets = []; }
    if (this.coolantPatches) { this.coolantPatches.forEach(function (p) { if (p.obj && p.obj.active) { try { p.obj.destroy(); } catch (e) {} } }); this.coolantPatches = []; }
  },

  // ======================= ART TEST — HI-FI TRAIN YARD =====================
  // A gravel arena crossed by rail tracks with tunnels at the ends. A train
  // AMBUSHES down a random track at random intervals — a short horn + flashing
  // crossing signals + a rumble telegraph it (fair), then it barrels through at
  // speed. Contact = instant death (bypasses i-frames). It also mows any mob it
  // hits. All of this only exists when Settings > Hi-Fi World is on.
  setupTrainYard: function (WW, HH) {
    var self = this;
    this.add.tileSprite(WW / 2, HH / 2, WW, HH, 'gravel').setDepth(-20);
    // oil stains for character (deterministic scatter — no RNG needed)
    for (var i = 0; i < 60; i++) {
      var ox = (i * 733 % WW), oy = ((i * 977 + 311) % HH);
      this.add.ellipse(ox, oy, 30 + (i % 4) * 22, 18 + (i % 3) * 14, 0x121319, 0.35).setDepth(-19);
    }
    // border wall band (visual only) around the arena
    var wt = 26;
    this.add.tileSprite(WW / 2, wt / 2, WW, wt, 'yardwall').setDepth(-18);
    this.add.tileSprite(WW / 2, HH - wt / 2, WW, wt, 'yardwall').setDepth(-18).setFlipY(true);
    // decorative VERTICAL track down the middle (no train runs it)
    this.add.tileSprite(WW * 0.5, HH / 2, HH, 96, 'track').setDepth(-10).setAngle(90);
    // TWO horizontal train lanes with tunnels at each end + crossing signals
    this.trainLanes = [{ y: Math.round(HH * 0.3) }, { y: Math.round(HH * 0.7) }];
    this.trainLanes.forEach(function (lane) {
      self.add.tileSprite(WW / 2, lane.y, WW, 96, 'track').setDepth(-9);
      lane.tunL = self.add.image(70, lane.y, 'tunnel').setDepth(-8).setScale(1.15);
      lane.tunR = self.add.image(WW - 70, lane.y, 'tunnel').setDepth(-8).setScale(1.15).setFlipX(true);
      lane.sigL = self.add.image(210, lane.y - 78, 'glowdot').setTint(0xff2a2a).setScale(2.4).setDepth(20).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
      lane.sigR = self.add.image(WW - 210, lane.y - 78, 'glowdot').setTint(0xff2a2a).setScale(2.4).setDepth(20).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
    });
    this.train = { phase: 'idle', nextAt: this.time.now + 4500 + Math.random() * 5000, sprite: null, light: null };
  },

  updateTrainYard: function (time, delta) {
    var tr = this.train; if (!tr) return;
    // AUDIT FIX 2026-07-14: no NEW trains once the fight is decided (death
    // screen / realm closing) — they kept launching under "YOU DIED", shaking
    // the camera and blasting horn SFX forever. A train already rolling
    // finishes its pass (mows on, feels alive), but the yard then goes quiet.
    // M4.7: + no fresh ambushes while the Styx Express cinematic runs (the
    // camera is at the lane — an off-screen instakill would be plain unfair).
    var fightOver = !this.player.state.alive || this.closing || !!this.arrivalTrain;
    if (tr.phase === 'idle') {
      if (time >= tr.nextAt && !fightOver) this.startTrainWarning(time);
    } else if (tr.phase === 'warn') {
      if (fightOver) {                                            // cancel a pending ambush
        tr.lane.sigL.setVisible(false); tr.lane.sigR.setVisible(false);
        tr.phase = 'idle';
        // dead/closing → the yard goes quiet FOREVER; the arrival cinematic
        // only borrows the yard — ambushes resume shortly after (M4.7).
        tr.nextAt = (!this.player.state.alive || this.closing) ? Infinity : time + 9000;
        return;
      }
      var on = Math.floor(time / 110) % 2 === 0;                  // flashing crossing signals
      tr.lane.sigL.setVisible(on); tr.lane.sigR.setVisible(on);
      if (time >= tr.warnUntil) this.launchTrain(time);
    } else if (tr.phase === 'running') {
      var trn = tr.sprite;
      trn.x += tr.dir * tr.speed * (delta / 1000);
      // M4.7: the consist trails the loco at fixed couplings
      if (tr.cars) for (var i = 0; i < tr.cars.length; i++) tr.cars[i].spr.x = trn.x - tr.dir * tr.cars[i].off;
      if (tr.light) tr.light.x = trn.x + tr.dir * tr.halfLen;
      if (time - (tr.lastRumble || 0) > 230) {                   // rolling rumble + shake
        tr.lastRumble = time; try { AUDIO.play('trainpass'); } catch (e) {}
        this.cameras.main.shake(200, 0.006);
      }
      this.trainCollisions(tr);
      if ((tr.dir > 0 && trn.x > tr.endX) || (tr.dir < 0 && trn.x < tr.endX)) {
        try { trn.destroy(); } catch (e) {}
        if (tr.cars) { tr.cars.forEach(function (c) { try { c.spr.destroy(); } catch (e) {} }); tr.cars = null; }
        if (tr.light) { try { tr.light.destroy(); } catch (e) {} tr.light = null; }
        tr.lane.sigL.setVisible(false); tr.lane.sigR.setVisible(false);
        tr.phase = 'idle'; tr.sprite = null; tr.nextAt = time + 5000 + Math.random() * 8000;
      }
    }
  },

  startTrainWarning: function (time) {
    var tr = this.train;
    if (tr.phase !== 'idle') return;                         // never overlap a train in flight
    tr.lane = this.trainLanes[Math.floor(Math.random() * this.trainLanes.length)];
    tr.dir = Math.random() < 0.5 ? 1 : -1;
    tr.phase = 'warn'; tr.warnUntil = time + 1300;
    try { AUDIO.play('trainhorn'); } catch (e) {}
    this.cameras.main.shake(320, 0.003);
  },

  launchTrain: function (time) {
    var tr = this.train, lane = tr.lane, dir = tr.dir, WW = this.worldW;
    var loco = this.add.image(0, lane.y, 'loco').setDepth(30);
    loco.setScale(120 / 96);                                     // ~120px tall — overhangs the lane
    loco.setFlipX(dir < 0);
    var half = loco.displayWidth / 2;
    loco.x = dir > 0 ? -half : WW + half;
    // M4.7 CONSIST (user, 2026-07-14): the loco hauls a random MIXED string of
    // freight cars — grain hoppers + boxcars, one model each in 4 recolors,
    // 2..15 cars per train. The whole consist is one death wall (collisions
    // check every segment). Cosmetic randomness → Math.random, same as the
    // ambush train's lane/dir (seam rule 4 applies to gameplay rolls only).
    tr.cars = [];
    var carScale = 108 / 88, gap = 10;
    var nCars = this.textures.exists('carGrain0') ? 2 + Math.floor(Math.random() * 14) : 0;
    var off = half;                                              // distance from loco center to car center
    for (var ci = 0; ci < nCars; ci++) {
      var key = (Math.random() < 0.5 ? 'carGrain' : 'carBox') + Math.floor(Math.random() * 4);
      var car = this.add.image(0, lane.y, key).setDepth(30).setScale(carScale).setFlipX(dir < 0);
      var cHalf = car.displayWidth / 2;
      off += gap + cHalf;
      tr.cars.push({ spr: car, off: off });
      off += cHalf;
    }
    tr.tailLen = off - half;                                     // consist length behind the loco center
    tr.sprite = loco; tr.halfLen = half * 0.9; tr.speed = 1050;
    tr.endX = dir > 0 ? WW + half + tr.tailLen : -half - tr.tailLen;   // the TAIL must clear too
    tr.lastRumble = 0;
    tr.light = this.add.image(loco.x + dir * half, lane.y, 'softglow')
      .setTint(0xfff2b0).setScale(3.2).setDepth(29).setBlendMode(Phaser.BlendModes.ADD);
    tr.phase = 'running';
    try { AUDIO.play('trainhorn'); } catch (e) {}
    this.cameras.main.shake(260, 0.006);
  },

  trainCollisions: function (tr) {
    // M4.7: the WHOLE CONSIST kills — loco + every car is a collision segment.
    var self = this, p = this.player;
    var segs = [tr.sprite];
    if (tr.cars) for (var i = 0; i < tr.cars.length; i++) segs.push(tr.cars[i].spr);
    for (var s = 0; s < segs.length; s++) {
      var seg = segs[s];
      var halfW = seg.displayWidth / 2 * 0.9, halfH = seg.displayHeight / 2 * 0.78;
      if (p.state.alive && Math.abs(p.x - seg.x) < halfW && Math.abs(p.y - seg.y) < halfH) this.trainKill();
      this.mobs.children.iterate(function (m) {
        if (m && m.active && Math.abs(m.x - seg.x) < halfW && Math.abs(m.y - seg.y) < halfH) {
          self.killMobCredited(m);               // M4.9: train mows now COUNT (kills/XP/quota)
        }
      });
    }
  },

  trainKill: function () {
    var st = this.player.state; if (!st.alive) return;
    if (devOn()) return;                                         // M5.3: immortality survives the train
    st.hp = 0; st.alive = false;                                 // instakill — no i-frames
    this.cameras.main.shake(500, 0.02);
    this.events.emit('player-died', 'the 5:15 express');
  }
});
