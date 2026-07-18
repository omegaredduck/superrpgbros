// ============================================================================
// registry.js — M7 MAP REGISTRY (REGISTRY_SPEC.md, built 2026-07-17).
// The one-time core refactor: every NEW realm (5–20) lives in its own folder
// under game/js/maps/<id>/ and self-registers here. Core (data/textures/
// scenes/entities) consumes registered defs through single hooks — adding a
// map is ONE folder + THREE <script> tags in index.html, ZERO core edits.
// The four LIVE realms (yard/grove/graveyard/factory) STAY IN CORE (Red).
//
// NOTE vs the spec: the spec sketched `window.MAPS = {...}`, but MAPS is
// ALREADY the tile-map module (maps.js) — clobbering it kills the builder and
// the classic map fallback. The registry EXTENDS that object instead: same
// public surface (MAPS.register / MAPS.defs), no collision. Load order in
// index.html: after builder.js (all core globals parsed), map folders next,
// main.js last. DATA exists by then, so register() installs data rows
// immediately — no data.js edit needed at all.
//
// A map def looks like:
// MAPS.register({
//   id: 'skyisles',                          // realm id == folder name
//   installData: function (DATA) {...},      // merge realms/biomes/mobs/bosses/
//                                            //   dropTables/audio.music rows +
//                                            //   MAPS.addConsoleMap(...)
//   buildArt: function (ctx) {...},          // art.js: ctx.spr/ctx.tex + register
//                                            //   in ctx.MOB_HI/MOB_DISPLAY/BOSS_HI
//   mobVerbs: { verbName: fn(scene,m,player,time) -> true|falsy },
//   scene: {                                 // scene.js hooks (all optional):
//     setup:       fn(scene, WW, HH),        //   world terrain (create dispatch);
//                                            //   MUST reset all its own state —
//                                            //   Phaser reuses scene instances
//     afterCreate: fn(scene),                //   groups/colliders exist now
//     update:      fn(scene, time, delta),   //   owns wrap + ambient cycle + movers
//     unfreeze:    fn(scene, dt),            //   shift EVERY map absolute clock
//     annihilate:  fn(scene),                //   clear map hazard pools (E2 wipe)
//     bossUpdate:  fn(scene, b, player, time), // DATA.bosses[key].mapOwned verbs
//     bossArrival: fn(scene, def, bx, by)    //   arrival cinematic; must end in
//                                            //   scene.spawnBossNow + showScouter
//   }
// });
// ============================================================================
(function () {
  if (typeof MAPS === 'undefined') { window.MAPS = {}; }

  MAPS.defs = {};

  MAPS.register = function (def) {
    if (!def || !def.id) throw new Error('MAPS.register: def.id required');
    MAPS.defs[def.id] = def;
    // DATA is a parsed global by the time map files load (script order) —
    // install immediately so realms/biomes/mobs/bosses exist before boot.
    if (def.installData && typeof DATA !== 'undefined') def.installData(DATA);
  };

  // Helper: unlock a PORTAL MACHINE destination row. Inserts before the
  // sealed placeholders so live realms stay grouped in lineup order.
  MAPS.addConsoleMap = function (DATA, entry) {
    var list = DATA.console.maps, at = list.length;
    for (var i = 0; i < list.length; i++) { if (list[i].locked) { at = i; break; } }
    list.splice(at, 0, { id: entry.id, name: entry.name, sub: entry.sub || '', locked: !!entry.locked });
  };

  // Helper for scene hooks: the active realm's registered def (or null).
  MAPS.forScene = function (scene) {
    return (scene && scene.realmId && MAPS.defs[scene.realmId]) || null;
  };
})();
