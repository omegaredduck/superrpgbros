// ============================================================================
// builder.js — M3: the IN-GAME MAP BUILDER (ASSET_PIPELINE.md §3, Lane C).
// A developer-tool scene, reached with M from the nexus (not the player flow).
// Paints the same JSON the realm loader consumes (maps.js). Tiles come from
// the procedural tilesets in data.js/textures.js AND from imported images
// (png/jpg/gif/webp/bmp, sliced to the 16×16 grid, EMBEDDED in the map JSON
// so exports stay self-contained and file:// keeps working).
//
// Controls: WASD/arrows pan · wheel zoom · 1-4 layers · B/E/R tools ·
// left-drag paints · panel buttons for save/export/import/playtest.
// ============================================================================
var BuilderScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Builder' }); },

  init: function (data) {
    this.openMapId = (data && data.mapId) || DATA.realm.map;
  },

  create: function () {
    // Phaser reuses scene instances — reset EVERY instance-field guard
    // (TESTING.md bug #1 family).
    this.map = MAPS.get(this.openMapId) ||
               MAPS.blank('custom', 'Custom Map', DATA.builder.newMap.w, DATA.builder.newMap.h);
    MAPS.ensureTextures(this, this.map);
    this.layer = 'ground';
    this.tool = 'paint';                                 // paint | erase | rect
    this.sel = { ground: null, walls: null, decor: null, objects: 'start' };
    this.rectAnchor = null;
    this.dirty = false;
    this.exitArmedAt = 0;
    this.ui = []; this.objUi = [];
    this.statusAt = 0;
    this.PW = 200;                                       // panel width (UI hit-test)

    var Wpx = this.map.w * MAPS.TILE, Hpx = this.map.h * MAPS.TILE;
    this.cameras.main.setBackgroundColor('#0a0a12')
      .setBounds(-240, -240, Wpx + 480, Hpx + 480)
      .centerOn(Wpx / 2, Hpx / 2);
    this.mapRender = MAPS.renderChunks(this, this.map, 'bld', 1);
    this.add.rectangle(Wpx / 2, Hpx / 2, Wpx + 4, Hpx + 4, 0, 0)
      .setStrokeStyle(2, 0x566c86).setDepth(2);

    // object-layer overlay + cursor
    this.objG = this.add.graphics().setDepth(20);
    this.startImg = this.add.image(0, 0, 'ranger').setScale(2).setAlpha(0.65).setDepth(21).setVisible(false);
    this.rectG = this.add.graphics().setDepth(30);       // rect-tool preview
    this.cursor = this.add.rectangle(0, 0, MAPS.TILE, MAPS.TILE, 0, 0)
      .setStrokeStyle(1, 0xffcd75).setOrigin(0, 0).setDepth(31).setVisible(false);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    this.wireInput();
    this.drawObjects();
    this.buildUi();
    this.cameras.main.fadeIn(200);
  },

  // ------------------------------------------------------------- input --
  wireInput: function () {
    var self = this;
    ['keydown-ONE', 'keydown-TWO', 'keydown-THREE', 'keydown-FOUR'].forEach(function (k, i) {
      self.input.keyboard.off(k);                       // listeners survive restarts (bug #2)
      self.input.keyboard.on(k, function () { self.setLayer(['ground', 'walls', 'decor', 'objects'][i]); });
    });
    ['keydown-B', 'keydown-E', 'keydown-R', 'keydown-ESC'].forEach(function (k) { self.input.keyboard.off(k); });
    this.input.keyboard.on('keydown-B', function () { self.setTool('paint'); });
    this.input.keyboard.on('keydown-E', function () { self.setTool('erase'); });
    this.input.keyboard.on('keydown-R', function () { self.setTool('rect'); });
    this.input.keyboard.on('keydown-ESC', function () { self.tryExit(); });

    this.input.off('wheel'); this.input.off('pointerdown'); this.input.off('pointermove'); this.input.off('pointerup');
    this.input.on('wheel', function (pointer, objs, dx, dy) {
      var Z = DATA.builder.zoom, cam = self.cameras.main;
      cam.setZoom(Phaser.Math.Clamp(cam.zoom - Math.sign(dy) * Z.step, Z.min, Z.max));
    });
    this.input.on('pointerdown', function (pointer) {
      if (pointer.x <= self.PW) return;                 // over the panel
      var t = self.tileUnder(pointer);
      if (!t) return;
      if (self.layer === 'objects') { self.objectDown(t); return; }
      if (self.tool === 'rect') { self.rectAnchor = t; return; }
      self.applyAt(t.tx, t.ty);
    });
    this.input.on('pointermove', function (pointer) {
      if (!pointer.isDown || pointer.x <= self.PW) return;
      var t = self.tileUnder(pointer);
      if (!t) return;
      if (self.layer === 'objects') return;             // zones apply on release
      if (self.tool === 'rect') return;                 // preview drawn in update
      self.applyAt(t.tx, t.ty);
    });
    this.input.on('pointerup', function (pointer) {
      if (self.rectAnchor) {
        var t = self.tileUnder(pointer) || self.rectAnchor;
        var r = self.normRect(self.rectAnchor, t);
        if (self.layer === 'objects') self.objectRect(r);
        else self.applyRect(r);
        self.rectAnchor = null; self.rectG.clear();
      }
    });
  },

  tileUnder: function (pointer) {
    pointer.updateWorldPoint(this.cameras.main);
    var tx = Math.floor(pointer.worldX / MAPS.TILE), ty = Math.floor(pointer.worldY / MAPS.TILE);
    if (tx < 0 || ty < 0 || tx >= this.map.w || ty >= this.map.h) return null;
    return { tx: tx, ty: ty };
  },

  normRect: function (a, b) {
    var x0 = Math.min(a.tx, b.tx), y0 = Math.min(a.ty, b.ty);
    return { tx: x0, ty: y0, tw: Math.abs(a.tx - b.tx) + 1, th: Math.abs(a.ty - b.ty) + 1 };
  },

  // ------------------------------------------------------------ editing --
  paintChar: function () {
    if (this.tool === 'erase') return '.';
    var key = this.sel[this.layer];
    if (!key) { this.toast('pick a tile from the palette first'); return null; }
    var ch = MAPS.charFor(this.map, key);
    if (!ch) this.toast('map palette full (84 tile kinds)');
    return ch;
  },

  applyAt: function (tx, ty) {
    var ch = this.paintChar();
    if (ch === null) return;
    if (MAPS.tileAt(this.map, this.layer, tx, ty) === ch) return;
    MAPS.setTile(this.map, this.layer, tx, ty, ch);
    this.mapRender.redraw(tx, ty);
    this.dirty = true;
  },

  applyRect: function (r) {
    var ch = this.paintChar();
    if (ch === null) return;
    for (var y = r.ty; y < r.ty + r.th; y++) for (var x = r.tx; x < r.tx + r.tw; x++) {
      MAPS.setTile(this.map, this.layer, x, y, ch);
    }
    this.mapRender.redrawRect(r.tx, r.ty, r.tw, r.th);
    this.dirty = true;
    this.toast('filled ' + r.tw + '×' + r.th);
  },

  // object layer: START places on click; ZONE/ARENA drag a rect; CLEAR (or the
  // erase tool) removes whatever is under the cursor.
  objectDown: function (t) {
    var o = this.map.objects, mode = this.tool === 'erase' ? 'clear' : this.sel.objects;
    if (mode === 'start') { o.playerStart = { tx: t.tx, ty: t.ty }; this.dirty = true; }
    else if (mode === 'zone' || mode === 'arena') { this.rectAnchor = t; return; }
    else if (mode === 'clear') {
      var hit = false;
      for (var i = o.spawnZones.length - 1; i >= 0; i--) {
        var z = o.spawnZones[i];
        if (t.tx >= z.tx && t.tx < z.tx + z.tw && t.ty >= z.ty && t.ty < z.ty + z.th) {
          o.spawnZones.splice(i, 1); hit = true; break;
        }
      }
      var A = o.bossArena;
      if (!hit && A && t.tx >= A.tx && t.tx < A.tx + A.tw && t.ty >= A.ty && t.ty < A.ty + A.th) {
        o.bossArena = null; hit = true;
      }
      if (!hit && o.playerStart &&
          Math.abs(t.tx - o.playerStart.tx) <= 1 && Math.abs(t.ty - o.playerStart.ty) <= 1) {
        o.playerStart = null; hit = true;
      }
      if (hit) this.dirty = true;
    }
    this.drawObjects();
  },

  objectRect: function (r) {
    var mode = this.tool === 'erase' ? 'clear' : this.sel.objects;
    if (mode === 'zone') { this.map.objects.spawnZones.push(r); this.dirty = true; }
    if (mode === 'arena') { this.map.objects.bossArena = r; this.dirty = true; }
    this.drawObjects();
  },

  drawObjects: function () {
    var g = this.objG, T = MAPS.TILE, o = this.map.objects, self = this;
    g.clear();
    this.objUi.forEach(function (t) { t.destroy(); });
    this.objUi = [];
    function label(x, y, txt, color) {
      self.objUi.push(self.add.text(x, y, txt,
        { fontFamily: 'monospace', fontSize: 11, color: color }).setDepth(22));
    }
    o.spawnZones.forEach(function (z) {
      g.fillStyle(0x38b764, 0.10).fillRect(z.tx * T, z.ty * T, z.tw * T, z.th * T);
      g.lineStyle(2, 0x38b764, 0.9).strokeRect(z.tx * T, z.ty * T, z.tw * T, z.th * T);
      label(z.tx * T + 3, z.ty * T + 3, 'SPAWN ZONE', '#38b764');
    });
    if (o.bossArena) {
      var A = o.bossArena;
      g.fillStyle(0xb13e53, 0.10).fillRect(A.tx * T, A.ty * T, A.tw * T, A.th * T);
      g.lineStyle(2, 0xb13e53, 0.9).strokeRect(A.tx * T, A.ty * T, A.tw * T, A.th * T);
      label(A.tx * T + 3, A.ty * T + 3, 'BOSS ARENA', '#b13e53');
    }
    if (o.playerStart) {
      this.startImg.setVisible(true).setPosition((o.playerStart.tx + 0.5) * T, (o.playerStart.ty + 0.5) * T);
      label(o.playerStart.tx * T - 14, (o.playerStart.ty + 1.2) * T, 'START', '#ffcd75');
    } else this.startImg.setVisible(false);
  },

  // ---------------------------------------------------------------- UI --
  setLayer: function (l) { this.layer = l; this.rectAnchor = null; this.buildUi(); },
  setTool:  function (t) { this.tool = t; this.rectAnchor = null; this.buildUi(); },

  btn: function (x, y, w, txt, color, on, cb) {
    var self = this;
    var bg = this.add.rectangle(x, y, w, 20, on ? 0x29366f : 0x1a1c2c, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101)
      .setStrokeStyle(1, on ? 0xffcd75 : 0x333c57).setInteractive({ useHandCursor: true });
    var t = this.add.text(x + w / 2, y + 10, txt,
      { fontFamily: 'monospace', fontSize: 11, color: color || (on ? '#ffcd75' : '#94b0c2') })
      .setOrigin(0.5).setScrollFactor(0).setDepth(102);
    bg.on('pointerover', function () { bg.setFillStyle(0x29366f, 1); });
    bg.on('pointerout',  function () { bg.setFillStyle(on ? 0x29366f : 0x1a1c2c, 1); });
    bg.on('pointerdown', function (p, lx, ly, ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); cb(); });
    this.ui.push(bg, t);
    return bg;
  },

  buildUi: function () {
    var self = this;
    this.ui.forEach(function (o) { o.destroy(); });
    this.ui = [];
    var H = this.scale.height, PW = this.PW;
    this.ui.push(this.add.rectangle(0, 0, PW, H, 0x0f0f1b, 0.96).setOrigin(0, 0)
      .setScrollFactor(0).setDepth(100).setStrokeStyle(1, 0x29366f));
    var x = 10, y = 10;
    this.ui.push(this.add.text(x, y, 'MAP BUILDER', { fontFamily: 'monospace', fontSize: 16, color: '#ffcd75' })
      .setScrollFactor(0).setDepth(101));
    y += 22;
    this.ui.push(this.add.text(x, y,
      this.map.id + ' · ' + this.map.w + '×' + this.map.h + ' · ' + this.map.tileset + (this.dirty ? ' *' : ''),
      { fontFamily: 'monospace', fontSize: 10, color: '#94b0c2' }).setScrollFactor(0).setDepth(101));
    y += 20;

    // layers
    this.ui.push(this.add.text(x, y, '— LAYER (1-4) —', { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setScrollFactor(0).setDepth(101));
    y += 14;
    var L = ['ground', 'walls', 'decor', 'objects'];
    for (var i = 0; i < L.length; i++) {
      (function (l, i2) {
        self.btn(x + (i2 % 2) * 92, y + Math.floor(i2 / 2) * 24, 88, l.toUpperCase(), null,
          self.layer === l, function () { self.setLayer(l); });
      })(L[i], i);
    }
    y += 52;

    // tools
    this.ui.push(this.add.text(x, y, '— TOOL —', { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setScrollFactor(0).setDepth(101));
    y += 14;
    var TL = [['paint', 'PAINT (B)'], ['erase', 'ERASE (E)'], ['rect', 'RECT (R)']];
    for (var j = 0; j < TL.length; j++) {
      (function (t) {
        self.btn(x + (j % 2) * 92, y + Math.floor(j / 2) * 24, 88, t[1], null,
          self.tool === t[0], function () { self.setTool(t[0]); });
      })(TL[j]);
    }
    y += 52;

    // palette
    this.ui.push(this.add.text(x, y, '— PALETTE —', { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setScrollFactor(0).setDepth(101));
    y += 16;
    if (this.layer === 'objects') {
      var OL = [['start', 'PLAYER START'], ['zone', 'SPAWN ZONE (drag)'],
                ['arena', 'BOSS ARENA (drag)'], ['clear', 'CLEAR (click)']];
      for (var q = 0; q < OL.length; q++) {
        (function (o) {
          self.btn(x, y, 180, o[1], null, self.sel.objects === o[0], function () {
            self.sel.objects = o[0]; self.buildUi();
          });
          y += 24;
        })(OL[q]);
      }
    } else {
      var set = DATA.tilesets[this.map.tileset] || DATA.tilesets.grasslands;
      var keys = (set[this.layer] || []).concat(Object.keys(this.map.tiles));
      for (var p = 0; p < keys.length; p++) {
        (function (key, p2) {
          var sx = x + (p2 % 5) * 37 + 16, sy = y + Math.floor(p2 / 5) * 37 + 16;
          var onSel = self.sel[self.layer] === key;
          var frame = self.add.rectangle(sx, sy, 36, 36, onSel ? 0x29366f : 0x14162b, 1)
            .setScrollFactor(0).setDepth(101).setStrokeStyle(1, onSel ? 0xffcd75 : 0x333c57)
            .setInteractive({ useHandCursor: true });
          frame.on('pointerdown', function (pp, lx, ly, ev) {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            self.sel[self.layer] = key; self.buildUi();
          });
          self.ui.push(frame);
          self.ui.push(self.add.image(sx, sy, key).setScale(2).setScrollFactor(0).setDepth(102));
        })(keys[p], p);
      }
      y += Math.ceil(keys.length / 5) * 37 + 6;
      if (!this.sel[this.layer] && keys.length) this.sel[this.layer] = keys[0];
    }
    y += 8;

    // actions
    this.ui.push(this.add.text(x, y, '— MAP —', { fontFamily: 'monospace', fontSize: 10, color: '#566c86' }).setScrollFactor(0).setDepth(101));
    y += 14;
    this.btn(x, y, 88, 'SAVE', '#38b764', false, function () { self.saveMap(); });
    this.btn(x + 92, y, 88, 'EXPORT', null, false, function () { self.exportMap(); });
    y += 24;
    this.btn(x, y, 88, 'IMPORT MAP', null, false, function () { self.importMap(); });
    this.btn(x + 92, y, 88, 'IMPORT TILES', null, false, function () { self.importTiles(); });
    y += 24;
    this.btn(x, y, 88, 'TILESET ⟳', null, false, function () { self.cycleTileset(); });
    this.btn(x + 92, y, 88, 'OPEN ⟳', null, false, function () { self.cycleMap(); });
    y += 24;
    this.btn(x, y, 88, 'NEW MAP', null, false, function () { self.newMap(); });
    this.btn(x + 92, y, 88, 'PLAYTEST ▶', '#ffcd75', false, function () { self.playtest(); });
    y += 24;
    this.btn(x, y, 180, 'EXIT TO NEXUS (ESC)', '#b13e53', false, function () { self.tryExit(); });
    y += 30;

    this.statusText = this.add.text(x, y, '', { fontFamily: 'monospace', fontSize: 10, color: '#ffcd75', wordWrap: { width: 180 } })
      .setScrollFactor(0).setDepth(101);
    this.ui.push(this.statusText);
    this.ui.push(this.add.text(x, H - 34, 'WASD/arrows pan · wheel zoom\nimports are embedded in the map JSON',
      { fontFamily: 'monospace', fontSize: 9, color: '#566c86' }).setScrollFactor(0).setDepth(101));
  },

  toast: function (msg) {
    if (this.statusText) this.statusText.setText(msg);
    this.statusAt = this.time.now;
  },

  // ------------------------------------------------------------ actions --
  saveMap: function () {
    if (MAPS.saveLocal(this.map)) { this.dirty = false; this.toast('saved — a realm with id "' + this.map.id + '" now loads THIS map'); }
    else this.toast('save failed (storage unavailable or map invalid)');
    this.buildUi();
  },

  exportMap: function () {
    try {
      var blob = new Blob([MAPS.exportJson(this.map)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = this.map.id + '.json';
      a.click();
      this.toast('exported ' + this.map.id + '.json');
    } catch (e) { this.toast('export failed: ' + e.message); }
  },

  pickFile: function (accept, cb) {
    var input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = function () { if (input.files && input.files[0]) cb(input.files[0]); };
    input.click();
  },

  importMap: function () {
    var self = this;
    this.pickFile('.json,application/json', function (file) {
      var fr = new FileReader();
      fr.onload = function () {
        var r = MAPS.importJson(String(fr.result));
        if (!r.ok) { self.toast('import failed: ' + r.reason); return; }
        self.openMapId = r.map.id;
        self.map = r.map;
        self.rebuildWorld();
        self.toast('imported "' + r.map.id + '" — SAVE to keep it');
        self.dirty = true;
      };
      fr.readAsText(file);
    });
  },

  // Import a tileset image (png/jpg/gif/webp/bmp), sliced to the 16×16 grid.
  // Tiles are EMBEDDED in the map JSON as hex rows — self-contained, file://-
  // safe, and the realm loader rebuilds textures from them (maps.js).
  // Every import gets a line in ASSET_CREDITS.md the day it lands (Lane B rule).
  importTiles: function () {
    var self = this;
    this.pickFile('image/*,.png,.jpg,.jpeg,.gif,.webp,.bmp', function (file) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var T = MAPS.TILE;
          var cols = Math.floor(img.width / T), rows = Math.floor(img.height / T);
          if (!cols || !rows) { self.toast('image smaller than one 16×16 tile'); return; }
          var cv = document.createElement('canvas');
          cv.width = img.width; cv.height = img.height;
          var ctx = cv.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          var base = (file.name || 'imp').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 12) || 'imp';
          var added = 0;
          for (var gy = 0; gy < rows && added < 40; gy++) for (var gx = 0; gx < cols && added < 40; gx++) {
            var d = ctx.getImageData(gx * T, gy * T, T, T).data;
            var hexRows = [], any = false;
            for (var y = 0; y < T; y++) {
              var row = '';
              for (var x = 0; x < T; x++) {
                var o = (y * T + x) * 4;
                if (d[o + 3] < 40) { row += '......'; continue; }
                any = true;
                row += ('0' + d[o].toString(16)).slice(-2) +
                       ('0' + d[o + 1].toString(16)).slice(-2) +
                       ('0' + d[o + 2].toString(16)).slice(-2);
              }
              hexRows.push(row);
            }
            if (!any) continue;
            self.map.tiles['imp_' + base + '_' + gy + '_' + gx] = hexRows;
            added++;
          }
          MAPS.ensureTextures(self, self.map);
          self.dirty = true;
          self.buildUi();
          self.toast(added + ' tiles imported from ' + file.name +
                     ' — add a line to ASSET_CREDITS.md (source + license)!');
        };
        img.src = String(fr.result);
      };
      fr.readAsDataURL(file);
    });
  },

  cycleTileset: function () {
    var ids = Object.keys(DATA.tilesets);
    var i = (ids.indexOf(this.map.tileset) + 1) % ids.length;
    this.map.tileset = ids[i];
    this.sel.ground = this.sel.walls = this.sel.decor = null;
    this.dirty = true;
    this.buildUi();
    this.toast('tileset: ' + DATA.tilesets[ids[i]].name + ' (palette only — painted tiles stay)');
  },

  cycleMap: function () {
    var ids = MAPS.listIds();
    var i = (ids.indexOf(this.map.id) + 1) % ids.length;
    this.openMapId = ids[i];
    this.map = MAPS.get(ids[i]);
    this.rebuildWorld();
    this.toast('opened "' + ids[i] + '"');
  },

  newMap: function () {
    var n = 1, ids = MAPS.listIds();
    while (ids.indexOf('custom' + n) >= 0) n++;
    this.map = MAPS.blank('custom' + n, 'Custom Map ' + n,
                          DATA.builder.newMap.w, DATA.builder.newMap.h, this.map.tileset, this.map.biome);
    this.openMapId = this.map.id;
    this.rebuildWorld();
    this.dirty = true;
    this.toast('new blank map "' + this.map.id + '" — paint, then SAVE');
  },

  rebuildWorld: function () {
    MAPS.ensureTextures(this, this.map);
    this.mapRender.destroy();
    this.mapRender = MAPS.renderChunks(this, this.map, 'bld', 1);
    var Wpx = this.map.w * MAPS.TILE, Hpx = this.map.h * MAPS.TILE;
    this.cameras.main.setBounds(-240, -240, Wpx + 480, Hpx + 480).centerOn(Wpx / 2, Hpx / 2);
    this.sel.ground = this.sel.walls = this.sel.decor = null;
    this.drawObjects();
    this.buildUi();
  },

  playtest: function () {
    if (!this.map.objects.playerStart) { this.toast('place a PLAYER START first (layer 4)'); return; }
    MAPS.saveLocal(this.map);
    this.dirty = false;
    this.toast('entering the realm...');
    this.scene.start('Realm', { mode: 'clear', mapId: this.map.id });
  },

  tryExit: function () {
    if (this.dirty && this.time.now - this.exitArmedAt > 2500) {
      this.exitArmedAt = this.time.now;
      this.toast('UNSAVED CHANGES — ESC again to exit anyway');
      return;
    }
    this.scene.start('Nexus');
  },

  // ------------------------------------------------------------- update --
  update: function (time, delta) {
    // pan
    var cam = this.cameras.main, k = this.keys;
    var v = DATA.builder.panSpeed * delta / 1000 / cam.zoom;
    if (k.A.isDown || k.LEFT.isDown)  cam.scrollX -= v;
    if (k.D.isDown || k.RIGHT.isDown) cam.scrollX += v;
    if (k.W.isDown || k.UP.isDown)    cam.scrollY -= v;
    if (k.S.isDown || k.DOWN.isDown)  cam.scrollY += v;

    // cursor + rect preview
    var pointer = this.input.activePointer;
    var t = pointer.x > this.PW ? this.tileUnder(pointer) : null;
    this.cursor.setVisible(!!t);
    if (t) this.cursor.setPosition(t.tx * MAPS.TILE, t.ty * MAPS.TILE);
    this.rectG.clear();
    if (this.rectAnchor && t) {
      var r = this.normRect(this.rectAnchor, t), T = MAPS.TILE;
      var col = this.layer === 'objects' ? (this.sel.objects === 'arena' ? 0xb13e53 : 0x38b764) : 0xffcd75;
      this.rectG.lineStyle(2, col, 0.9).strokeRect(r.tx * T, r.ty * T, r.tw * T, r.th * T);
    }

    // fade stale status
    if (this.statusText && this.statusText.text && time - this.statusAt > 6000) this.statusText.setText('');
  }
});
