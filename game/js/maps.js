// ============================================================================
// maps.js — M3 map system (ASSET_PIPELINE.md §3, Lane C). One JSON format,
// two consumers: the in-game MAP BUILDER writes it, the realm loader reads it.
// Maps live in localStorage (key srb_maps, via this module only — same rule
// as save.js: scenes never touch localStorage directly) with export/import
// as a file. A built-in default (realm1) ships in code so the game still
// boots with a clean storage. Pure-data parts run in Node (TM tests);
// anything touching scene.textures is render-side and browser-only.
//
// SCHEMA v1:
// { v:1, id:'realm1', name:'Grasslands of Woe', biome:'grasslands',
//   tileset:'grasslands', w:150, h:150,
//   key:    { 'a':'t_grass', ... }            char → texture key ('.'=empty)
//   layers: { ground:[row strings], walls:[...], decor:[...] }
//   tiles:  { imp_x_0: [16 hex rows] }        imported tiles EMBEDDED (works file://)
//   objects:{ playerStart:{tx,ty}|null, spawnZones:[{tx,ty,tw,th}],
//             bossArena:{tx,ty,tw,th}|null } }
// ============================================================================
var MAPS = (function () {

  var VERSION = 1;
  var STORE_KEY = 'srb_maps';
  var TILE = 16;
  var LAYERS = ['ground', 'walls', 'decor'];
  var CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
                '!@#$%^&*()-=+[]{};:<>?~';

  // ------------------------------------------------------------- basics --
  function emptyRows(w, h) {
    var rows = [], row = new Array(w + 1).join('.');
    for (var y = 0; y < h; y++) rows.push(row);
    return rows;
  }

  function blank(id, name, w, h, tileset, biome) {
    return {
      v: VERSION, id: id, name: name || id,
      biome: biome || 'grasslands', tileset: tileset || 'grasslands',
      w: w, h: h,
      key: {},
      layers: { ground: emptyRows(w, h), walls: emptyRows(w, h), decor: emptyRows(w, h) },
      tiles: {},
      objects: { playerStart: null, spawnZones: [], bossArena: null }
    };
  }

  function validate(m) {
    if (!m || m.v !== VERSION || !m.id || !m.w || !m.h) return false;
    if (!m.layers || !m.key || !m.objects) return false;
    for (var i = 0; i < LAYERS.length; i++) {
      var L = m.layers[LAYERS[i]];
      if (!Array.isArray(L) || L.length !== m.h) return false;
      for (var y = 0; y < m.h; y++) if (typeof L[y] !== 'string' || L[y].length !== m.w) return false;
    }
    if (!Array.isArray(m.objects.spawnZones)) return false;
    return true;
  }

  function tileAt(m, layer, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return '.';
    return m.layers[layer][ty].charAt(tx);
  }

  function setTile(m, layer, tx, ty, ch) {
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return;
    var row = m.layers[layer][ty];
    m.layers[layer][ty] = row.substring(0, tx) + ch + row.substring(tx + 1);
  }

  function isWall(m, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true;   // out of bounds blocks
    return tileAt(m, 'walls', tx, ty) !== '.';
  }

  function isWallAtPx(m, x, y) { return isWall(m, Math.floor(x / TILE), Math.floor(y / TILE)); }

  // char for a texture key — reuse if assigned, else allocate from the pool.
  function charFor(m, texKey) {
    for (var c in m.key) if (m.key[c] === texKey) return c;
    for (var i = 0; i < CHARSET.length; i++) {
      var ch = CHARSET.charAt(i);
      if (!m.key[ch]) { m.key[ch] = texKey; return ch; }
    }
    return null;                                        // palette exhausted (84 tiles)
  }

  // ------------------------------------------------------------ storage --
  function storeRead() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var d = raw ? JSON.parse(raw) : {};
      return (d && typeof d === 'object') ? d : {};
    } catch (e) { return {}; }                          // garbled store → empty, never a crash
  }

  function storeWrite(d) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); return true; }
    catch (e) { return false; }
  }

  function saveLocal(m) {
    if (!validate(m)) return false;
    var d = storeRead(); d[m.id] = m;
    return storeWrite(d);
  }

  function deleteLocal(id) { var d = storeRead(); delete d[id]; storeWrite(d); }

  function listIds() {
    var ids = {}, k;
    for (k in BUILTIN) ids[k] = true;
    var d = storeRead();
    for (k in d) ids[k] = true;
    return Object.keys(ids);
  }

  // stored map wins over the built-in of the same id; always a deep copy so
  // the builder can edit freely without mutating the shipped default.
  function get(id) {
    var d = storeRead();
    var src = d[id] || BUILTIN[id] || null;
    if (!src || !validate(src)) return null;
    return JSON.parse(JSON.stringify(src));
  }

  function exportJson(m) { return JSON.stringify(m, null, 1); }

  function importJson(str) {
    var m = null;
    try { m = JSON.parse(str); } catch (e) { return { ok: false, reason: 'not JSON' }; }
    if (!validate(m)) return { ok: false, reason: 'not a v' + VERSION + ' map' };
    return { ok: true, map: m };
  }

  // ----------------------------------------------- render (browser only) --
  // Imported tiles are stored as 16 rows of 16×6 hex chars ('......'=clear),
  // synchronous to rebuild — no async image decoding, works from file://.
  function ensureTextures(scene, m) {
    for (var key in m.tiles) {
      if (scene.textures.exists(key)) continue;
      var t = scene.textures.createCanvas(key, TILE, TILE);
      var ctx = t.getContext();
      var rows = m.tiles[key];
      for (var y = 0; y < TILE; y++) {
        var row = rows[y] || '';
        for (var x = 0; x < TILE; x++) {
          var hex = row.substr(x * 6, 6);
          if (hex && hex !== '......') { ctx.fillStyle = '#' + hex; ctx.fillRect(x, y, 1, 1); }
        }
      }
      t.refresh();
    }
  }

  // draw one tile cell (ground → decor → walls, walls on top) onto a chunk ctx
  var DRAW_ORDER = ['ground', 'decor', 'walls'];
  function drawCell(scene, m, ctx, tx, ty, dx, dy) {
    ctx.clearRect(dx, dy, TILE, TILE);
    for (var i = 0; i < DRAW_ORDER.length; i++) {
      var ch = tileAt(m, DRAW_ORDER[i], tx, ty);
      if (ch === '.') continue;
      var key = m.key[ch];
      if (!key || !scene.textures.exists(key)) continue;
      var src = scene.textures.get(key).getSourceImage();
      ctx.drawImage(src, dx, dy);
    }
  }

  var CHUNK = 32;                                       // tiles per chunk side (512px canvases)

  // Renders the whole map as chunked canvas textures + images. Returns
  // { images:[], chunkKey:fn, redraw:fn } — the builder repaints single cells.
  function renderChunks(scene, m, prefix, depth) {
    ensureTextures(scene, m);
    var images = [];
    var cw = Math.ceil(m.w / CHUNK), chh = Math.ceil(m.h / CHUNK);
    function keyOf(cx, cy) { return prefix + '_' + m.id + '_' + cx + '_' + cy; }
    for (var cy = 0; cy < chh; cy++) for (var cx = 0; cx < cw; cx++) {
      var key = keyOf(cx, cy);
      var wTiles = Math.min(CHUNK, m.w - cx * CHUNK), hTiles = Math.min(CHUNK, m.h - cy * CHUNK);
      if (scene.textures.exists(key)) scene.textures.remove(key);   // stale from a prior visit
      var t = scene.textures.createCanvas(key, wTiles * TILE, hTiles * TILE);
      var ctx = t.getContext();
      for (var y = 0; y < hTiles; y++) for (var x = 0; x < wTiles; x++) {
        drawCell(scene, m, ctx, cx * CHUNK + x, cy * CHUNK + y, x * TILE, y * TILE);
      }
      t.refresh();
      images.push(scene.add.image(cx * CHUNK * TILE, cy * CHUNK * TILE, key)
        .setOrigin(0, 0).setDepth(depth || 1));
    }
    return {
      images: images,
      redraw: function (tx, ty) {                       // builder: repaint ONE cell
        var cx = Math.floor(tx / CHUNK), cy = Math.floor(ty / CHUNK);
        var key = keyOf(cx, cy);
        if (!scene.textures.exists(key)) return;
        var t2 = scene.textures.get(key);
        drawCell(scene, m, t2.getContext(), tx, ty, (tx - cx * CHUNK) * TILE, (ty - cy * CHUNK) * TILE);
        t2.refresh();
      },
      redrawRect: function (tx, ty, tw, th) {           // builder: repaint a region,
        var touched = {};                               // one refresh per chunk (rect fill)
        for (var y2 = ty; y2 < ty + th; y2++) for (var x2 = tx; x2 < tx + tw; x2++) {
          var cx = Math.floor(x2 / CHUNK), cy = Math.floor(y2 / CHUNK);
          var key = keyOf(cx, cy);
          if (!scene.textures.exists(key)) continue;
          drawCell(scene, m, scene.textures.get(key).getContext(),
                   x2, y2, (x2 - cx * CHUNK) * TILE, (y2 - cy * CHUNK) * TILE);
          touched[key] = true;
        }
        for (var k3 in touched) scene.textures.get(k3).refresh();
      },
      destroy: function () { images.forEach(function (im) { im.destroy(); }); }
    };
  }

  // Static physics bodies for the walls layer — horizontal runs merged into
  // single invisible rectangles so the body count stays low (TM-5 friendly).
  function buildWallBodies(scene, m) {
    var group = scene.physics.add.staticGroup();
    for (var ty = 0; ty < m.h; ty++) {
      var runStart = -1;
      for (var tx = 0; tx <= m.w; tx++) {
        var wall = tx < m.w && isWall(m, tx, ty);
        if (wall && runStart < 0) runStart = tx;
        if (!wall && runStart >= 0) {
          var len = tx - runStart;
          var r = scene.add.rectangle((runStart + len / 2) * TILE, (ty + 0.5) * TILE,
                                      len * TILE, TILE, 0, 0);   // invisible; visuals are the chunks
          scene.physics.add.existing(r, true);                   // explicit STATIC body
          group.add(r);
          runStart = -1;
        }
      }
    }
    return group;
  }

  // Walk outward from (x,y) in px until a non-wall tile is found (spiral by
  // ring). Keeps portals/bosses/chests out of the scenery. Gameplay-neutral.
  function findClearPx(m, x, y) {
    var tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (!isWall(m, tx, ty)) return { x: x, y: y };
    for (var r = 1; r < Math.max(m.w, m.h); r++) {
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (!isWall(m, tx + dx, ty + dy)) {
          return { x: (tx + dx + 0.5) * TILE, y: (ty + dy + 0.5) * TILE };
        }
      }
    }
    return { x: x, y: y };                              // solid map — give up gracefully
  }

  // -------------------------------------------- the built-in Realm 1 map --
  // Authored in the builder's own format. Deterministic local rng (NOT
  // SIM.rng — this is content, not gameplay) so the shipped map is identical
  // on every machine. Repaint it in the builder any time: a saved copy under
  // the same id overrides this one.
  function mulberry(seed) {
    var s = seed >>> 0;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function buildRealm1() {
    var W = 150, H = 150;
    var m = blank('realm1', 'Grasslands of Woe', W, H, 'grasslands', 'grasslands');
    var rnd = mulberry(20260712);
    var g  = charFor(m, 't_grass'),  g2 = charFor(m, 't_grass2'), dirt = charFor(m, 't_dirt');
    var rk = charFor(m, 't_rock'),   hg = charFor(m, 't_hedge'),  wt   = charFor(m, 't_water');
    var fl = charFor(m, 't_flower'), sh = charFor(m, 't_shrub'),  pb   = charFor(m, 't_pebble');
    var st = charFor(m, 't_stump');
    var x, y, i;

    // ground: grass with variance + dirt patches
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var r = rnd();
      setTile(m, 'ground', x, y, r < 0.82 ? g : (r < 0.96 ? g2 : dirt));
    }
    for (i = 0; i < 26; i++) {                          // dirt clearings
      var px2 = 8 + Math.floor(rnd() * (W - 16)), py = 8 + Math.floor(rnd() * (H - 16));
      var rad = 2 + Math.floor(rnd() * 4);
      for (y = -rad; y <= rad; y++) for (x = -rad; x <= rad; x++) {
        if (x * x + y * y <= rad * rad && rnd() < 0.8) setTile(m, 'ground', px2 + x, py + y, dirt);
      }
    }

    // border: 2-tile rock ring (the realm has real edges now)
    for (x = 0; x < W; x++) for (i = 0; i < 2; i++) {
      setTile(m, 'walls', x, i, rk); setTile(m, 'walls', x, H - 1 - i, rk);
    }
    for (y = 0; y < H; y++) for (i = 0; i < 2; i++) {
      setTile(m, 'walls', i, y, rk); setTile(m, 'walls', W - 1 - i, y, rk);
    }

    // scattered rock clusters (cover to kite around — F2)
    for (i = 0; i < 34; i++) {
      var cx = 10 + Math.floor(rnd() * (W - 20)), cy2 = 10 + Math.floor(rnd() * (H - 20));
      if (Math.abs(cx - W / 2) < 9 && Math.abs(cy2 - H / 2) < 9) continue;    // keep the start clear
      var n = 2 + Math.floor(rnd() * 5);
      for (var j = 0; j < n; j++) {
        setTile(m, 'walls', cx + Math.floor(rnd() * 3) - 1, cy2 + Math.floor(rnd() * 3) - 1, rk);
      }
    }
    // hedge lines (soft maze walls)
    for (i = 0; i < 14; i++) {
      var hx = 12 + Math.floor(rnd() * (W - 30)), hy = 12 + Math.floor(rnd() * (H - 24));
      if (Math.abs(hx - W / 2) < 12 && Math.abs(hy - H / 2) < 12) continue;
      var len = 4 + Math.floor(rnd() * 8), horiz = rnd() < 0.5;
      for (var k2 = 0; k2 < len; k2++) setTile(m, 'walls', hx + (horiz ? k2 : 0), hy + (horiz ? 0 : k2), hg);
    }
    // a pond
    for (y = -4; y <= 4; y++) for (x = -6; x <= 6; x++) {
      if ((x * x) / 36 + (y * y) / 16 <= 1) setTile(m, 'walls', 34 + x, 108 + y, wt);
    }

    // decor: flowers / shrubs / pebbles / stumps on clear ground
    for (i = 0; i < 420; i++) {
      x = 2 + Math.floor(rnd() * (W - 4)); y = 2 + Math.floor(rnd() * (H - 4));
      if (isWall(m, x, y)) continue;
      var d2 = rnd();
      setTile(m, 'decor', x, y, d2 < 0.42 ? fl : (d2 < 0.72 ? sh : (d2 < 0.94 ? pb : st)));
    }

    // objects: start center, boss arena NE (cleared of walls/decor)
    m.objects.playerStart = { tx: Math.floor(W / 2), ty: Math.floor(H / 2) };
    var A = { tx: 112, ty: 18, tw: 24, th: 24 };
    m.objects.bossArena = A;
    for (y = A.ty - 1; y < A.ty + A.th + 1; y++) for (x = A.tx - 1; x < A.tx + A.tw + 1; x++) {
      if (x > 1 && y > 1 && x < W - 2 && y < H - 2) {
        setTile(m, 'walls', x, y, '.'); setTile(m, 'decor', x, y, '.');
      }
    }
    m.objects.spawnZones = [];                          // empty = classic ring spawning
    return m;
  }

  var BUILTIN = { realm1: buildRealm1() };

  return {
    VERSION: VERSION, TILE: TILE, LAYERS: LAYERS, CHUNK: CHUNK,
    blank: blank, validate: validate, get: get, listIds: listIds,
    saveLocal: saveLocal, deleteLocal: deleteLocal,
    exportJson: exportJson, importJson: importJson,
    tileAt: tileAt, setTile: setTile, isWall: isWall, isWallAtPx: isWallAtPx,
    charFor: charFor, findClearPx: findClearPx,
    ensureTextures: ensureTextures, renderChunks: renderChunks,
    buildWallBodies: buildWallBodies,
    _builtin: BUILTIN
  };
})();

// Headless Node tests (TM-4/TM-8) can stub localStorage and require this module.
if (typeof module !== 'undefined') { module.exports = MAPS; }
