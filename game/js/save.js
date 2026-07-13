// ============================================================================
// save.js — versioned localStorage save slots (ARCHITECTURE.md §6, TM-4).
// 3 slots; each slot is a FULL separate account (character, vault, graveyard,
// records). Scenes never touch localStorage directly — everything goes
// through SAVE. Schema is versioned from day one so future format changes
// can migrate old saves instead of destroying them.
// ============================================================================
var SAVE = (function () {

  var VERSION = 3;
  var SLOTS = 3;
  var KEY = function (slot) { return 'srb_save_' + slot; };

  function zeroPots() { return { hp: 0, mp: 0, att: 0, def: 0, spd: 0, dex: 0 }; }
  function emptyEquip() { return { weapon: null, ability: null, armor: null, ring: null }; }

  // Every class defined in data (M4: ranger + wizard) — all OPEN from the start
  // (unlock chain deferred). Falls back to ['ranger'] if DATA isn't loaded yet.
  function allClasses() {
    return (typeof DATA !== 'undefined' && DATA.classes) ? Object.keys(DATA.classes) : ['ranger'];
  }
  // A valid class key or the default. Guards a hand-edited / stale cls string.
  function normClass(cls) {
    return (typeof DATA !== 'undefined' && DATA.classes && DATA.classes[cls]) ? cls : 'ranger';
  }

  // A brand-new account (schema v3 — M3 added equipment + the live vault).
  // M4: `cls` is the class chosen for this slot at NEW GAME (title screen);
  // it seeds the first character. The slot keeps this class across permadeath.
  function blank(cls) {
    cls = normClass(cls);
    return {
      v: VERSION,
      account: {
        unlockedClasses: allClasses(),                   // M4: both classes open
        graveyard: [],                                   // {cls, level, kills, killer}
        potions: zeroPots(),                             // v2: unclaimed stash — SURVIVES death (Pillar 3)
        records: { bestLevel: 1, deaths: 0, totalKills: 0, realmsEntered: 0, realmsClosed: 0 }
      },
      vault: [],                                         // v3: item keys, ≤ DATA.vault.slots — SURVIVES death
      character: { cls: cls, level: 1, xp: 0,
                   potionsDrunk: zeroPots(),             // v2: drunk pots DIE with the character (R5)
                   equipment: emptyEquip() },            // v3: gear DIES with the character too
      meta: { createdAt: Date.now(), savedAt: Date.now() }
    };
  }

  function storageOk() {
    try {
      localStorage.setItem('srb_probe', '1');
      localStorage.removeItem('srb_probe');
      return true;
    } catch (e) { return false; }
  }

  // Migrate older schema versions forward — the TM-4 ladder:
  // v1 (M0.5) → v2 (M2 potions) → v3 (M3 equipment + live vault). Lossless:
  // nothing an old account owned is dropped, new fields start empty.
  function migrate(data) {
    if (!data || typeof data.v !== 'number') return null;   // unrecognizable
    if (data.v === 1) {
      data.account.potions = zeroPots();
      data.account.records.realmsClosed = 0;
      data.character.potionsDrunk = zeroPots();
      data.v = 2;
    }
    if (data.v === 2) {
      data.character.equipment = emptyEquip();
      if (!Array.isArray(data.vault)) data.vault = [];      // v1/v2 always had it, but be kind
      data.v = 3;
    }
    if (data.v !== VERSION) return null;                    // future/unknown version
    // Sanitize (never a crash): drop vault/equipment references to item keys
    // that no longer exist in data.js — valid items are untouched (lossless).
    data.vault = data.vault.filter(function (k) { return DATA.items[k]; });
    if (data.character.equipment) {
      for (var s in data.character.equipment) {
        var k2 = data.character.equipment[s];
        if (k2 && (!DATA.items[k2] || DATA.items[k2].slot !== s)) data.character.equipment[s] = null;
      }
    }
    return data;
  }

  // Light validation so a hand-edited or corrupted save can't crash a scene.
  function valid(d) {
    return d && d.account && Array.isArray(d.account.graveyard) && d.account.records &&
           d.account.potions && Array.isArray(d.vault) &&
           d.character && d.character.potionsDrunk &&
           d.character.equipment && typeof d.character.equipment === 'object' &&
           DATA.classes[d.character.cls] &&
           d.character.level >= 1 && d.character.level <= DATA.xp.cap;
  }

  function load(slot) {
    if (!storageOk()) return { ok: false, reason: 'no-storage' };
    var raw = localStorage.getItem(KEY(slot));
    if (!raw) return { ok: false, reason: 'empty' };
    var data = null;
    try { data = JSON.parse(raw); } catch (e) { return { ok: false, reason: 'corrupt' }; }
    data = migrate(data);
    if (!data || !valid(data)) return { ok: false, reason: 'corrupt' };
    return { ok: true, data: data };
  }

  function save(slot, data) {
    if (!storageOk() || !slot) return false;
    data.v = VERSION;
    data.meta = data.meta || { createdAt: Date.now() };
    data.meta.savedAt = Date.now();
    try { localStorage.setItem(KEY(slot), JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  function clear(slot) {
    if (!storageOk()) return;
    localStorage.removeItem(KEY(slot));
  }

  // Summary for the title screen's slot cards.
  function peek(slot) {
    var r = load(slot);
    if (!r.ok) return { slot: slot, exists: false, corrupt: r.reason === 'corrupt' };
    var d = r.data;
    return {
      slot: slot, exists: true, corrupt: false,
      cls: DATA.classes[d.character.cls].name,
      level: d.character.level,
      deaths: d.account.records.deaths,
      bestLevel: d.account.records.bestLevel,
      savedAt: d.meta && d.meta.savedAt ? d.meta.savedAt : null
    };
  }

  // --- Settings (M1): device-level preferences, NOT part of any account slot.
  // Volume and auto-fire live here so they persist across slots and sessions.
  // Same rule as saves: scenes never touch localStorage — only through SAVE.
  var SETTINGS_KEY = 'srb_settings';
  var _settings = null;

  // Fresh-profile defaults. musicVolume/sfxVolume both seed from the one
  // legacy defaultVolume; `binds` is built from DATA.keybinds (event.code
  // strings). `volume` is kept only so an old save can migrate its value.
  // Default binds: each action id -> { primary, alt } of event.code strings.
  // Only movement ships with an alt (the arrow keys) by default.
  function defaultBinds() {
    var binds = {};
    if (typeof DATA !== 'undefined' && DATA.keybinds && DATA.keybinds.list) {
      DATA.keybinds.list.forEach(function (b) { binds[b.id] = { primary: b.def, alt: b.alt || null }; });
    }
    return binds;
  }

  function settingsDefaults() {
    var seed = (typeof DATA !== 'undefined' && DATA.audio) ? DATA.audio.defaultVolume : 0.5;
    return {
      volume: seed,            // legacy master — migration seed only
      musicVolume: seed,       // 2026-07-12: split channels
      musicOn: true,
      sfxVolume: seed,
      sfxOn: true,
      autoFire: true,          // Q2 default: ON (now a Settings checkbox, not a key)
      binds: defaultBinds()    // action id -> { primary, alt }
    };
  }

  function settings() {
    if (_settings) return _settings;
    var def = settingsDefaults();
    if (storageOk()) {
      try {
        var raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          var d = JSON.parse(raw);
          if (d && typeof d === 'object') {
            // Migrate the pre-split single volume: seed both new channels from it.
            if (typeof d.volume === 'number') {
              if (typeof d.musicVolume !== 'number') d.musicVolume = d.volume;
              if (typeof d.sfxVolume !== 'number') d.sfxVolume = d.volume;
            }
            for (var k in def) {
              if (k === 'binds') continue;                 // merged per-key below
              if (typeof d[k] === typeof def[k]) def[k] = d[k];
            }
            // Binds: overlay saved onto defaults so a NEW action added later
            // keeps its default instead of vanishing (TM-4 spirit). Accepts the
            // OLD single-string format too (m3o) — it becomes the primary, the
            // default alt is kept (so migrated movement still has its arrows).
            if (d.binds && typeof d.binds === 'object') {
              for (var id in def.binds) {
                var sv = d.binds[id];
                if (typeof sv === 'string') {
                  def.binds[id].primary = sv;                 // legacy → primary
                } else if (sv && typeof sv === 'object') {
                  if (typeof sv.primary === 'string') def.binds[id].primary = sv.primary;
                  if (typeof sv.alt === 'string' || sv.alt === null) def.binds[id].alt = sv.alt;
                }
              }
            }
          }
        }
      } catch (e) { /* garbled settings → defaults, never a crash (TM-4 spirit) */ }
    }
    _settings = def;
    return _settings;
  }

  // Reset every keybind to its DATA default (used by the settings panel).
  function resetBinds() {
    var s = settings();
    s.binds = defaultBinds();
    saveSettings();
    return s.binds;
  }

  function saveSettings() {
    if (!storageOk() || !_settings) return false;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings)); return true; }
    catch (e) { return false; }
  }

  return { VERSION: VERSION, SLOTS: SLOTS, blank: blank, load: load, save: save,
           clear: clear, peek: peek, storageOk: storageOk, zeroPots: zeroPots,
           emptyEquip: emptyEquip, settings: settings, saveSettings: saveSettings,
           resetBinds: resetBinds };
})();

// Headless Node tests (TM-4) can stub localStorage and require this module.
if (typeof module !== 'undefined') { module.exports = SAVE; }
