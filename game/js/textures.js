// ============================================================================
// textures.js — Lane A procedural pixel art (ASSET_PIPELINE.md §1).
// Character grids -> canvas textures at boot. No files, no licenses, no CORS.
// Replace any sprite later by loading a real PNG under the same key. The game
// never knows which lane produced a texture.
// ============================================================================
var TEX = (function () {

  var PAL = {
    '.': null,
    'k': '#1a1c2c', 'K': '#333c57',            // outlines / dark
    'g': '#38b764', 'G': '#257179',            // greens
    'r': '#b13e53', 'R': '#7a1f38',            // reds
    'p': '#8f3fb5', 'P': '#5d275d',            // purples
    'y': '#ffcd75', 'o': '#ef7d57',            // gold / orange
    'w': '#f4f4f4', 's': '#e8b796',            // white / skin
    'b': '#41a6f6', 'B': '#3b5dc9',            // blues
    'm': '#ff77a8',                            // magenta (enemy shots)
    'd': '#29366f', 'D': '#1a1c2c',
    'l': '#94b0c2', 'L': '#566c86'             // light/dark stone
  };

  function grid(scene, key, rows, scale) {
    scale = scale || 1;
    var h = rows.length, w = rows[0].length;
    var t = scene.textures.createCanvas(key, w * scale, h * scale);
    var ctx = t.getContext();
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var c = PAL[rows[y][x]];
      if (c) { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale); }
    }
    t.refresh();
  }

  // Noisy 16x16 tile from two colors.
  function tile(scene, key, base, fleck, density) {
    var t = scene.textures.createCanvas(key, 16, 16);
    var ctx = t.getContext();
    ctx.fillStyle = base; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = fleck;
    for (var i = 0; i < 256 * density; i++) {
      ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
    }
    t.refresh();
  }

  function generateAll(scene) {
    grid(scene, 'ranger', [
      '....kkkkkk......',
      '...kggggggk.....',
      '..kgggggggggk...',
      '..kgkssssgk.....',
      '..kgsskssgk.....',
      '..kgssssgk......',
      '...kggggk.......',
      '..kGGGGGGk......',
      '.kGGgGGgGGk..y..',
      '.kGGGGGGGGk.kyk.',
      '.kGGgGGgGGkkyk..',
      '..kGGGGGGkkyk...',
      '..kKk..kKkyk....',
      '..kKk..kKk......',
      '.kKKk..kKKk.....',
      '................'
    ]);
    grid(scene, 'slime', [
      '................',
      '................',
      '................',
      '.....kkkkk......',
      '...kkgggggkk....',
      '..kgggggggggk...',
      '..kggwkggwkgk...',
      '.kggggkggggggk..',
      '.kgggggggggggk..',
      '.kgggggggggggk..',
      '.kgGgggggggGgk..',
      '..kgGGgggGGgk...',
      '...kkgggggkk....',
      '.....kkkkk......',
      '................',
      '................'
    ]);
    grid(scene, 'brute', [
      '....kkkkkkkk....',
      '...krrrrrrrrk...',
      '..krrrrrrrrrrk..',
      '..krwkrrrrkwrk..',
      '..krrkrrrrkrrk..',
      '..krrrrkkrrrrk..',
      '..krrwwwwwwrrk..',
      '...krrrrrrrrk...',
      '..kRRRRRRRRRRk..',
      '.kRRrRRRRRRrRRk.',
      '.kRkRRRRRRRRkRk.',
      '.kRkRRRRRRRRkRk.',
      '..kkRRRRRRRRkk..',
      '...kRRk..kRRk...',
      '...kkkk..kkkk...',
      '................'
    ]);
    grid(scene, 'spitter', [
      '................',
      '.....kkkkkk.....',
      '...kkppppppkk...',
      '..kpppPppPpppk..',
      '..kppppppppppk..',
      '.kpPpppppppPpk..',
      '.kpppppppppppk..',
      '..kpppppppppk...',
      '...kkpppppkk....',
      '....kwppppwk....',
      '....kppppppk....',
      '...kpPk..kPpk...',
      '...kkk....kkk...',
      '................',
      '................',
      '................'
    ]);
    grid(scene, 'warlock', [
      '.....kkkkkk.....',
      '....kPPPPPPk....',
      '...kPPPPPPPPk...',
      '...kPbkPPkbPk...',
      '...kPPPPPPPPk...',
      '....kPPPPPPk....',
      '...kPPPPPPPPk...',
      '..kPPpPPPPpPPk..',
      '..kPPpPPPPpPPk..',
      '.kPPPpPPPPpPPPk.',
      '.kPPppPPPPppPPk.',
      '.kPPpPPPPPPpPPk.',
      '.kPPPPPPPPPPPPk.',
      '..kPPPPPPPPPPk..',
      '...kkkkkkkkkk...',
      '................'
    ]);
    // E8 (M2.1): the held bow — drawn POINTING RIGHT (rotation 0 = aim 0), so
    // setRotation(aimAngle) aligns it to wherever the player aims (F2/TM-1).
    grid(scene, 'bow', [
      '..wkk.......',
      '..wkyok.....',
      '..w.kyok....',
      '..w..kyok...',
      '..w..kyok...',
      '..w..kyok...',
      '..w..kyok...',
      '..w..kyok...',
      '..w..kyok...',
      '..w..kyok...',
      '..wkyok.....',
      '..wkk.......'
    ]);
    grid(scene, 'arrow', [
      '............',
      '.....kk.....',
      'kyyyykwk....',
      'kwwwwwwwk...',
      'kyyyykwk....',
      '.....kk.....'
    ]);
    grid(scene, 'bolt', [
      '..kk..',
      '.kmmk.',
      'kmwmmk',
      'kmmwmk',
      '.kmmk.',
      '..kk..'
    ]);
    // M3.5 color pass: the portal is NEUTRAL greyscale and always tinted by
    // purpose — PORTAL GREEN for realm clear (DATA.modes.clear.color; user
    // call: blue-on-blue was unreadable), gold for the trial, red for the
    // realm boss portal (a true red now, not blue-multiplied mud).
    grid(scene, 'portal', [
      '......kkkkkkkk......',
      '....kklwwwwwwlkk....',
      '...klwKKKKKKKKwlk...',
      '..klwKK......KKwlk..',
      '.klwK..........Kwlk.',
      '.kwK....llll....Kwk.',
      'klwK...lwwwwl...Kwlk',
      'kwK...lw....wl...Kwk',
      'kwK...lw.ll.wl...Kwk',
      'kwK...lw.ll.wl...Kwk',
      'kwK...lw....wl...Kwk',
      'klwK...lwwwwl...Kwlk',
      '.kwK....llll....Kwk.',
      '.klwK..........Kwlk.',
      '..klwKK......KKwlk..',
      '...klwKKKKKKKKwlk...',
      '....kklwwwwwwlkk....',
      '......kkkkkkkk......',
      '....................',
      '....................'
    ]);
    // Boss 1 — The Grovekeeper (M2). 20x20, rendered at 3x: a hulking treant.
    grid(scene, 'boss1', [
      '....kkk......kkk....',
      '...kGGgk....kgGGk...',
      '...kGgk......kgGk...',
      '....kGkkkkkkkkGk....',
      '...kkGGGGGGGGGGkk...',
      '..kGGgggggggggGGGk..',
      '.kGgggwkggggwkgggGk.',
      '.kGgggkkggggkkgggGk.',
      'kGGggggggggggggggGGk',
      'kGgggkggkkkkggkgggGk',
      'kGgggkgwwwwwwgkgggGk',
      'kGGgggkkkkkkkkgggGGk',
      '.kGGgggggggggggGGGk.',
      '.kGKGGgggggggGGKGk..',
      '..kKkGGGGGGGGkKk....',
      '..kKk.kGGGGk.kKk....',
      '..kKKk.kKKk.kKKk....',
      '.kKKKk.kKKk.kKKKk...',
      '.kkkk..kkkk..kkkk...',
      '....................'
    ]);
    // Stat potion bottle (M2) — tinted per stat at draw time.
    grid(scene, 'potion', [
      '....kk....',
      '...kwwk...',
      '....kk....',
      '...kwwk...',
      '..kwwwwk..',
      '.kwwwwwwk.',
      '.kwwwwwwk.',
      '.kwwwwwwk.',
      '..kwwwwk..',
      '...kkkk...'
    ]);
    // M3 equipment icons — drawn in neutral whites/greys so the TIER TINT
    // (DATA.tiers[].color) applied at draw time carries the rarity color.
    grid(scene, 'quiver', [
      '....kk....',
      '...kwlk...',
      '..kwlwlk..',
      '..klwlwk..',
      '..kwlwlk..',
      '..kllllk..',
      '..kwwwwk..',
      '..kwwwwk..',
      '..kwwwwk..',
      '...kkkk...'
    ]);
    grid(scene, 'armor', [
      '..kk..kk..',
      '.kwwkkwwk.',
      '.kwwwwwwk.',
      '.kwlwwlwk.',
      '.kwwwwwwk.',
      '..kwwwwk..',
      '..kwllwk..',
      '..kwwwwk..',
      '...kwwk...',
      '....kk....'
    ]);
    grid(scene, 'ring', [
      '..........',
      '....ww....',
      '...wllw...',
      '....ww....',
      '...k..k...',
      '..k....k..',
      '..k....k..',
      '...k..k...',
      '....kk....',
      '..........'
    ]);
    grid(scene, 'chest', [
      '................',
      '................',
      '..kkkkkkkkkkkk..',
      '.kooooooooooook.',
      '.koyyyyyyyyyyok.',
      '.kooooooooooook.',
      '.kkkkkkkkkkkkkk.',
      '.koooookyykoook.',
      '.koooookyykoook.',
      '.koooooookkook..',
      '.kooooooooooook.',
      '.kkkkkkkkkkkkkk.',
      '................',
      '................',
      '................',
      '................'
    ]);
    // E5 (M2.1): portal pedestal for the nexus plaza.
    grid(scene, 'pedestal', [
      '................',
      '................',
      '................',
      '................',
      '..llllllllllll..',
      '..lLLLLLLLLLLl..',
      '...lLLLLLLLLl...',
      '...lLLLLLLLLl...',
      '...lLLLLLLLLl...',
      '...lLLLLLLLLl...',
      '..lLLLLLLLLLLl..',
      '.llllllllllllll.',
      '.lLLLLLLLLLLLLl.',
      '.llllllllllllll.',
      '................',
      '................'
    ]);
    // M3.5 PORTAL WORKS: the one portal PLATFORM — a big stone ring with 8
    // light sockets the console ignites. Drawn with canvas arcs (still lane A:
    // procedural, pixelArt rendering keeps it crisp). Ring lights are separate
    // 'glowdot' sprites so scenes can ignite them one by one in the mode color.
    (function () {
      var t = scene.textures.createCanvas('platform', 64, 64);
      var ctx = t.getContext();
      var ring = function (r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(32, 32, r, 0, Math.PI * 2); ctx.fill(); };
      ring(31, '#1a1c2c');            // outline
      ring(29, '#566c86');            // outer rim
      ring(25, '#94b0c2');            // rim highlight
      ring(23, '#333c57');            // deck
      ring(15, '#1a1c2c');            // inner well (the portal floats here)
      ring(13, '#29366f');            // well glow floor
      for (var i = 0; i < 8; i++) {   // 8 dark light-sockets on the deck
        var a = i * Math.PI / 4;
        ctx.fillStyle = '#1a1c2c';
        ctx.fillRect(Math.round(32 + Math.cos(a) * 19) - 3, Math.round(32 + Math.sin(a) * 19) - 3, 6, 6);
        ctx.fillStyle = '#29366f';
        ctx.fillRect(Math.round(32 + Math.cos(a) * 19) - 2, Math.round(32 + Math.sin(a) * 19) - 2, 4, 4);
      }
      t.refresh();
    })();
    // conduit tile: a carved energy channel (dark groove between stone lips) —
    // stacked vertically between console and platform; pulses travel the groove.
    grid(scene, 'conduit', [
      '.....kLddLk.....',
      '.....kLddLk.....',
      '.....kLdDLk.....',
      '.....kLddLk.....',
      '.....kLddLk.....',
      '....kkLddLkk....',
      '....kLLddLLk....',
      '....kLdddddk....',
      '....kLdddddk....',
      '....kLLddLLk....',
      '....kkLddLkk....',
      '.....kLddLk.....',
      '.....kLdDLk.....',
      '.....kLddLk.....',
      '.....kLddLk.....',
      '.....kLddLk.....'
    ]);
    // softglow: a big radial light pool, tinted at runtime — the "lighting
    // inside the map": platform well glow, console screen spill, title halo.
    (function () {
      var t = scene.textures.createCanvas('softglow', 128, 128);
      var ctx = t.getContext();
      var grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, 'rgba(255,255,255,0.55)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.22)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      t.refresh();
    })();
    // glowdot: a soft round light, tinted at runtime (ring lights + pulses).
    (function () {
      var t = scene.textures.createCanvas('glowdot', 8, 8);
      var ctx = t.getContext();
      ctx.fillStyle = '#f4f4f4';
      ctx.beginPath(); ctx.arc(4, 4, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(4, 4, 2, 0, Math.PI * 2); ctx.fill();
      t.refresh();
    })();
    // M3.7: the RECORDS wall screen — a wide monitor mounted under the chamber
    // title; scenes render the live account readout onto its face in green.
    (function () {
      // M3.8 v2 (user): WIDER glass so the graveyard page keeps a big font
      var t = scene.textures.createCanvas('wallscreen', 190, 26);
      var ctx = t.getContext();
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, 190, 26);      // bezel
      ctx.fillStyle = '#333c57'; ctx.fillRect(1, 1, 188, 24);      // frame
      ctx.fillStyle = '#0a1408'; ctx.fillRect(3, 3, 184, 20);      // dark green glass
      ctx.fillStyle = '#123317'; ctx.fillRect(3, 3, 184, 2);       // glass sheen
      ctx.fillStyle = '#49e83b';                                    // power pip
      ctx.fillRect(184, 21, 2, 2);
      // mounting struts to the wall above
      ctx.fillStyle = '#333c57'; ctx.fillRect(44, 0, 3, 3); ctx.fillRect(143, 0, 3, 3);
      t.refresh();
    })();
    // M3.8 v2: the records SWITCH — a GIANT riveted metal breaker lever.
    // Up = records, down = graveyard stats. Its wire feeds the wall screen.
    grid(scene, 'lever_up', [
      '......klllk......',
      '......klwlk......',
      '......klllk......',
      '.......kwk.......',
      '.......kwk.......',
      '.......kwk.......',
      '.......kwk.......',
      '.kkkkkkkkkkkkkkk.',
      'klLLLLLLLLLLLLLlk',
      'klLwLLLLkLLLLwLlk',
      'klLLLLLkKkLLLLLlk',
      'klLLLLkKKKkLLLLlk',
      'klLLLLLkKkLLLLLlk',
      'klLwLLLLkLLLLwLlk',
      'klLLLLLLLLLLLLLlk',
      '.kkkkkkkkkkkkkkk.',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................'
    ]);
    grid(scene, 'lever_down', [
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.................',
      '.kkkkkkkkkkkkkkk.',
      'klLLLLLLLLLLLLLlk',
      'klLwLLLLkLLLLwLlk',
      'klLLLLLkKkLLLLLlk',
      'klLLLLkKKKkLLLLlk',
      'klLLLLLkKkLLLLLlk',
      'klLwLLLLkLLLLwLlk',
      'klLLLLLLLLLLLLLlk',
      '.kkkkkkkkkkkkkkk.',
      '.......kwk.......',
      '.......kwk.......',
      '.......kwk.......',
      '.......kwk.......',
      '......klllk......',
      '......klwlk......',
      '......klllk......',
      '.................'
    ]);
    // M3.6: the BESTIARY — the console's green-screened sibling on the right
    // wall: field notes on everything the realm sends at you.
    grid(scene, 'bestiary', [
      '................',
      '..kkkkkkkkkkkk..',
      '.kggggggggggggk.',
      '.kgGGGGGGGGGGgk.',
      '.kgGwgGGGGwGGgk.',
      '.kgGGGGgGGGGGgk.',
      '.kgGGwGGGGgGGgk.',
      '.kggggggggggggk.',
      '..kkkkkkkkkkkk..',
      '....llllllll....',
      '....lLLLLLLl....',
      '....lLLLLLLl....',
      '...llllllllll...',
      '..lLLLLLLLLLLl..',
      '..llllllllllll..',
      '................'
    ]);
    // M3.5: the REALM CONSOLE — an arcane terminal on a stone base. The
    // glowing blue "screen" is where runs are configured before a portal
    // exists at all (scenes.js NexusScene console overlay).
    grid(scene, 'console', [
      '................',
      '..kkkkkkkkkkkk..',
      '.kbbbbbbbbbbbbk.',
      '.kbBBBBBBBBBBbk.',
      '.kbBwbBBBBwBBbk.',
      '.kbBBBBbBBBBBbk.',
      '.kbBBwBBBBbBBbk.',
      '.kbbbbbbbbbbbbk.',
      '..kkkkkkkkkkkk..',
      '....llllllll....',
      '....lLLLLLLl....',
      '....lLLLLLLl....',
      '...llllllllll...',
      '..lLLLLLLLLLLl..',
      '..llllllllllll..',
      '................'
    ]);
    // tiles
    tile(scene, 'floor_nexus', '#566c86', '#94b0c2', 0.06);
    tile(scene, 'floor_realm', '#1e3a2f', '#29584a', 0.08);
    tile(scene, 'wall',        '#29366f', '#1a1c2c', 0.15);

    // --- M3 (Lane C): procedural tilesets for the MAP BUILDER. Same rule as
    // every Lane-A asset: replace any of these by importing a real image in
    // the builder — the map JSON embeds imported tiles, the game can't tell.
    // grasslands set
    tile(scene, 't_grass',  '#1e3a2f', '#29584a', 0.08);
    tile(scene, 't_grass2', '#234636', '#2f6b4f', 0.12);
    tile(scene, 't_dirt',   '#4d3b2a', '#6b5138', 0.14);
    tile(scene, 't_rock',   '#333c57', '#1a1c2c', 0.20);
    tile(scene, 't_hedge',  '#1d4d2e', '#38b764', 0.22);
    tile(scene, 't_water',  '#1d3b6f', '#41a6f6', 0.10);
    // stonehold set (dungeon-flavored, ready for M5 biomes)
    tile(scene, 't_stone',  '#333c57', '#566c86', 0.10);
    tile(scene, 't_stone2', '#2b3350', '#475777', 0.10);
    tile(scene, 't_moss',   '#2e4a41', '#38b764', 0.14);
    tile(scene, 't_swall',  '#14162b', '#29366f', 0.22);
    // decor (transparent background — drawn over the ground layer)
    grid(scene, 't_flower', [
      '................',
      '................',
      '......m.........',
      '.....mym........',
      '......m.........',
      '......g.....w...',
      '.....g.....wyw..',
      '............w...',
      '..y.........g...',
      '.yoy........g...',
      '..y..m..........',
      '..g.mym.........',
      '..g..m..........',
      '.....g..........',
      '................',
      '................'
    ]);
    grid(scene, 't_shrub', [
      '................',
      '................',
      '................',
      '.....gg.........',
      '...ggGGgg.......',
      '..gGGgGGGg......',
      '..gGgGGgGg......',
      '...gGGGGg.......',
      '....gggg........',
      '..........gg....',
      '.........gGGg...',
      '.........gGgg...',
      '..........gg....',
      '................',
      '................',
      '................'
    ]);
    grid(scene, 't_pebble', [
      '................',
      '................',
      '................',
      '....ll..........',
      '...lLLl.........',
      '...lLLl.........',
      '....ll..........',
      '................',
      '..........l.....',
      '.........lLl....',
      '..........l.....',
      '....l...........',
      '................',
      '................',
      '................',
      '................'
    ]);
    grid(scene, 't_stump', [
      '................',
      '................',
      '................',
      '....kkkkkk......',
      '...kssyyssk.....',
      '...ksyssysk.....',
      '...kssyyssk.....',
      '...kssssssk.....',
      '...kssssssk.....',
      '...kKssssKk.....',
      '....kKKKKk......',
      '.....kkkk.......',
      '................',
      '................',
      '................',
      '................'
    ]);
    grid(scene, 't_pillar', [
      '....llllllll....',
      '...lLLLLLLLLl...',
      '....lLLLLLLl....',
      '....lLllllLl....',
      '....lLlLLlLl....',
      '....lLlLLlLl....',
      '....lLlLLlLl....',
      '....lLlLLlLl....',
      '....lLlLLlLl....',
      '....lLlLLlLl....',
      '....lLllllLl....',
      '...lLLLLLLLLl...',
      '..lLLLLLLLLLLl..',
      '..llllllllllll..',
      '................',
      '................'
    ]);
    grid(scene, 't_crack', [
      '................',
      '................',
      '....k...........',
      '.....k..........',
      '.....k..........',
      '......kk........',
      '........k.......',
      '........k.......',
      '.......k........',
      '.......k....k...',
      '........k..k....',
      '.........kk.....',
      '................',
      '................',
      '................',
      '................'
    ]);
    grid(scene, 't_bones', [
      '................',
      '................',
      '...w......ww....',
      '...ww....w......',
      '....w...........',
      '................',
      '......www.......',
      '.....wwLww......',
      '.....wLwLw......',
      '......www.......',
      '................',
      '...........w....',
      '..ww......ww....',
      '................',
      '................',
      '................'
    ]);
    // 1px white for particles/bars
    var t = scene.textures.createCanvas('px', 2, 2);
    t.getContext().fillStyle = '#ffffff'; t.getContext().fillRect(0, 0, 2, 2); t.refresh();
  }

  return { generateAll: generateAll };
})();
