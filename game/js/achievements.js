// ============================================================================
// achievements.js — item 6 (2026-07-17, Opus). A DEVICE-LEVEL achievement
// collection that persists in SAVE.settings().achievements (id -> true) across
// every character and account, exactly like the ninja unlock flag. Data-driven:
// each entry is a predicate eval(c) over the live account / records / settings /
// vault snapshot. ACH.check() evaluates them all, unlocks any freshly-earned
// ones, persists, and returns the new ones (the ESC-menu Achievements page and
// the Nexus toast both read from here). Failure-safe: a throwing predicate is
// treated as "not earned", never a crash.
// ============================================================================
var ACH = (function () {
  // Ordered roughly by the journey: progress → combat → unlocks → grit → secret.
  var LIST = [
    { id: 'first_purge',  name: 'First Purge',       glyph: '✦', desc: 'Purge your first corrupted region.',
      eval: function (c) { return c.cleared.length >= 1; } },
    { id: 'sweep5',       name: 'Sweep',             glyph: '✦', desc: 'Purge five regions.',
      eval: function (c) { return c.cleared.length >= 5; } },
    { id: 'cartographer', name: 'Cartographer',      glyph: '◈', desc: 'Discover every region on the map.',
      eval: function (c) { return c.total > 0 && c.disc.length >= c.total; } },
    { id: 'conqueror',    name: 'Conqueror',         glyph: '♛', desc: 'Purge every region in the campaign.',
      eval: function (c) { return c.total > 0 && c.cleared.length >= c.total; } },
    { id: 'assimilated',  name: 'The Assimilated',   glyph: '★', desc: 'Beat the game.',
      eval: function (c) { return !!c.acc.beaten; } },
    { id: 'blooded',      name: 'Blooded',           glyph: '†', desc: 'Land 100 total kills.',
      eval: function (c) { return (c.rec.totalKills || 0) >= 100; } },
    { id: 'reaper',       name: 'Reaper',            glyph: '†', desc: 'Land 1,000 total kills.',
      eval: function (c) { return (c.rec.totalKills || 0) >= 1000; } },
    { id: 'sugar_rush',   name: 'Sugar Rush',        glyph: '✦', desc: 'Defeat Sugar Bear in Sugar World.',
      eval: function (c) { return c.cleared.indexOf('sugar') >= 0; } },
    { id: 'oni_awakened', name: 'Oni Awakened',      glyph: '卍', desc: 'Unlock the Ninja.',
      eval: function (c) { return !!c.set.ninjaUnlocked; } },
    { id: 'arsenal',      name: 'Legendary Arsenal', glyph: '◆', desc: 'Bank a full legendary set in the vault.',
      eval: function (c) { return c.vault.indexOf('ar5') >= 0 && c.vault.indexOf('r5') >= 0; } },
    { id: 'polyglot',     name: 'Polyglot',          glyph: '✶', desc: 'Unlock every class.',
      eval: function (c) {
        if (typeof DATA === 'undefined') return false;
        var ul = c.acc.unlockedClasses || [];
        return Object.keys(DATA.classes).every(function (k) {
          return DATA.classes[k].locked ? !!c.set.ninjaUnlocked : ul.indexOf(k) >= 0;
        });
      } },
    { id: 'fallen',       name: 'Fallen',            glyph: '☠', desc: 'Lose a character to permadeath.',
      eval: function (c) { return (c.rec.deaths || 0) >= 1; } },
    { id: 'veteran',      name: 'Veteran',           glyph: '▲', desc: 'Reach character level 10.',
      eval: function (c) { return (c.rec.bestLevel || 1) >= 10; } },
    { id: 'shadow_master', name: 'Shadow Master', secret: true, glyph: '卍', desc: 'Beat the game as the Ninja.',
      eval: function (c) { return !!c.acc.ninjaEmpowered; } }
  ];

  function state() {
    var s = (typeof SAVE !== 'undefined' && SAVE.settings) ? SAVE.settings() : null;
    if (!s) return {};
    if (!s.achievements || typeof s.achievements !== 'object') s.achievements = {};
    return s.achievements;
  }

  // Snapshot the live globals into a flat context the predicates read.
  function ctx() {
    var acc = (typeof ACCOUNT !== 'undefined' && ACCOUNT) || {};
    var rec = acc.records || {};
    var set = (typeof SAVE !== 'undefined' && SAVE.settings && SAVE.settings()) || {};
    var sv  = (typeof GAME_SAVE !== 'undefined' && GAME_SAVE) || {};
    var maps = ((typeof DATA !== 'undefined' && DATA.console && DATA.console.maps) || [])
      .filter(function (m) { return !m.locked; });
    return {
      acc: acc, rec: rec, set: set, vault: sv.vault || [],
      cleared: acc.cleared || [], disc: acc.discovered || [], total: maps.length
    };
  }

  function unlocked(id) { return !!state()[id]; }
  function count() {
    var st = state(), e = 0;
    for (var i = 0; i < LIST.length; i++) if (st[LIST[i].id]) e++;
    return { earned: e, total: LIST.length };
  }

  // Evaluate all predicates; unlock + persist any newly-earned; return the fresh
  // entries (so callers can toast them).
  function check() {
    var c = ctx(), st = state(), fresh = [];
    for (var i = 0; i < LIST.length; i++) {
      var a = LIST[i];
      if (st[a.id]) continue;
      var ok = false; try { ok = !!a.eval(c); } catch (e) {}
      if (ok) { st[a.id] = true; fresh.push(a); }
    }
    if (fresh.length) { try { SAVE.saveSettings(); } catch (e) {} }
    return fresh;
  }

  return { LIST: LIST, state: state, unlocked: unlocked, count: count, check: check };
})();
if (typeof module !== 'undefined') { module.exports = { ACH: ACH }; }
