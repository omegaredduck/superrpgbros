// ============================================================================
// game/js/maps/pinnacle/map.js — THE PINNACLE OF CORRUPTION (the final sand
// stand; ACT 2 of the finale). Standalone map folder (2026-07-19, Red). The
// belly guts (ACT 1) beach you HERE. Reuses the TITAN WHALE boss + THE LAST
// TIDE music (both installed by maps/belly). The 1000-kill horde pulls RANDOM
// mobs from every realm, so this realm's own biome roster is empty (its
// director is paused; the scene spawns the horde itself).
// ============================================================================
(function () {
  'use strict';
  MAPS.register({
    id: 'pinnacle',

    installData: function (DATA) {
      DATA.biomes.pinnacle = { name: 'The Pinnacle of Corruption', tile: 'pinSand', mobs: [] };
      DATA.realms.pinnacle = {
        name: 'The Pinnacle of Corruption', biome: 'pinnacle', boss: 'titanWhale',
        kind: 'pinnacle', music: 'sandArena',
        finale: true,                                        // scenes.js gates the whale+horde shatter finale on this
        // the whale's attacks cover a SHORE ZONE (fraction of world) around it —
        // not the whole map (the horde is the far-field threat).
        arenaCfg: { rx: 0.34, ry: 0.30 },
        hordeCfg: { goal: 300, intervalMs: 640, burst: 5, maxCap: 52, rampMs: 6000 },   // 2026-07-19 Red: 1000 → 300
        quicksandCfg: { slowMult: 0.6 }
      };
      // NOT added to the realm-select console — reached only via the belly
      // beaching (ACT 1 → csBeach → here).
    },

    // Textures are baked at runtime in the scene (createCanvas from PINNACLE_ART);
    // the whale reuses the belly-built bellyTitanWhale* textures.
    buildArt: function (ctx) {},

    // Horde mobs are foreign-realm → their map-verbs are realm-scoped and simply
    // don't fire here (they chase + use generic behaviours). No verbs to wire.
    mobVerbs: {},

    scene: (typeof PINNACLE_SCENE !== 'undefined') ? PINNACLE_SCENE : {}
  });
})();
