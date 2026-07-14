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

  // ==========================================================================
  // ART-FIDELITY TEST (2026-07-13) — higher-resolution ANIMATED Ranger models.
  // Purely ADDITIVE and gated behind Settings > Character Model. The classic
  // 16x16 'ranger' texture below is the DEFAULT and is never touched, so with
  // the default selection the game is byte-for-byte identical to before.
  // Each model is drawn by RANGER_ART (js/ranger_art.js) as true pixel art at
  // its native canvas size, with idle + walk frames, plus a matching bow+arrow.
  // On-screen footprint (and therefore the hitbox) is kept equal to the classic
  // ranger, so ONLY the art fidelity changes — gameplay is unaffected.
  // ==========================================================================
  var RANGER_SIZES = [32, 64, 128, 160];
  var RANGER_TARGET = 64;                 // on-screen px — user 2026-07-13: "a
                                          // little bigger" (~2x the classic 32px)
  var IDLE_FRAMES = 4, WALK_FRAMES = 6;

  function rangerModelDesc(S) {
    var scale = RANGER_TARGET / S;
    var armW = Math.round(0.5 * S), armH = Math.round(0.15 * S);
    return {
      id: String(S), key: 'ranger' + S, size: S, scale: scale,
      idle: 'ranger' + S + '_idle', walk: 'ranger' + S + '_walk',
      body: { w: Math.round(0.625 * S), h: Math.round(0.75 * S),
              ox: Math.round(0.1875 * S), oy: Math.round(0.1875 * S) },
      bowKey: 'bow' + S, arrowKey: 'arrow' + S,
      // bowGrip = the bow's belly/handle (drawBow grip ≈ 0.56, 0.5) → held-bow
      // ORIGIN so it pivots at the grip. The bow stays UPRIGHT (rotation 0,
      // flipped by facing); it does NOT spin to the aim (real archer's hold).
      bowGrip: { x: 0.56, y: 0.5 },
      // The LEAD ARM is a separate sprite that ROTATES to the aim (arm moves,
      // bow stays upright). armKey texture: shoulder at the left (pivot), hand at
      // the right. shoulder = where the arm mounts on the body; armLen = world
      // shoulder→hand distance; armPivotX = the pivot's x-fraction in armKey.
      armKey: 'rangerArm' + S, armW: armW, armH: armH,
      armPivotX: (armH * 0.5) / armW, armLenTex: (armW - armH * 1.02), armLen: (armW - armH * 1.02) * scale,
      shoulder: { x: 0.64, y: 0.44 },
      idleFrames: IDLE_FRAMES, walkFrames: WALK_FRAMES
    };
  }
  // Descriptor for a model id ('16' | '32' | '64' | '128' | '160'); null = classic.
  function modelFor(id) {
    id = String(id == null ? '16' : id);
    if (id === '16') return null;
    var S = parseInt(id, 10);
    return RANGER_SIZES.indexOf(S) >= 0 ? rangerModelDesc(S) : null;
  }
  // The currently-selected model id from settings (default '16' = classic).
  function selectedModelId() {
    try { var s = SAVE.settings(); return (s && s.rangerModel) || '16'; }
    catch (e) { return '16'; }
  }

  // draw into a sub-cell of a canvas at x-offset ox, clipped to cw x ch so a
  // frame can never bleed into its neighbour on the strip.
  function drawCell(ctx, ox, cw, ch, drawFn) {
    var put = function (x, y, c) {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= cw || y >= ch) return;
      ctx.fillStyle = c; ctx.fillRect(ox + x, y, 1, 1);
    };
    drawFn(put);
  }
  // 1px dark outline around the whole silhouette on a canvas (browser side of
  // RANGER_ART.outlinePass — reads/writes ImageData).
  function outlineCanvas(ctx, W, H) {
    var img = ctx.getImageData(0, 0, W, H), data = img.data;
    var OUT = RANGER_ART.C.OUT;
    var r = parseInt(OUT.slice(1, 3), 16), g = parseInt(OUT.slice(3, 5), 16), b = parseInt(OUT.slice(5, 7), 16);
    RANGER_ART.outlinePass(W, H,
      function (x, y) { return data[(y * W + x) * 4 + 3]; },
      function (x, y) { var i = (y * W + x) * 4; data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255; });
    ctx.putImageData(img, 0, 0);
  }

  function buildRangerModels(scene) {
    if (typeof RANGER_ART === 'undefined') return;         // art module absent → skip (classic still works)
    RANGER_SIZES.forEach(function (S) {
      var d = rangerModelDesc(S), n = IDLE_FRAMES + WALK_FRAMES;
      // ---- body: one strip canvas of n frames (idle... then walk...) --------
      if (!scene.textures.exists(d.key)) {
        var t = scene.textures.createCanvas(d.key, S * n, S), ctx = t.getContext();
        for (var f = 0; f < n; f++) {
          var isWalk = f >= IDLE_FRAMES, idx = isWalk ? f - IDLE_FRAMES : f;
          var count = isWalk ? WALK_FRAMES : IDLE_FRAMES;
          (function (ff, w, ii, cc) {
            drawCell(ctx, ff * S, S, S, function (put) {
              RANGER_ART.drawBody(put, S, { frame: w ? 'walk' : 'idle', t: ii / cc });
            });
          })(f, isWalk, idx, count);
        }
        outlineCanvas(ctx, S * n, S);
        for (var fi = 0; fi < n; fi++) {
          var fn = (fi < IDLE_FRAMES ? 'idle' + fi : 'walk' + (fi - IDLE_FRAMES));
          t.add(fn, 0, fi * S, 0, S, S);
        }
        t.refresh();
      }
      // ---- matching bow (S x S) --------------------------------------------
      if (!scene.textures.exists(d.bowKey)) {
        var tb = scene.textures.createCanvas(d.bowKey, S, S), bctx = tb.getContext();
        drawCell(bctx, 0, S, S, function (put) { RANGER_ART.drawBow(put, S); });
        outlineCanvas(bctx, S, S); tb.refresh();
      }
      // ---- matching arrow (wide, short) ------------------------------------
      if (!scene.textures.exists(d.arrowKey)) {
        var aw = S, ah = Math.max(6, Math.round(S * 0.4));
        var ta = scene.textures.createCanvas(d.arrowKey, aw, ah), actx = ta.getContext();
        drawCell(actx, 0, aw, ah, function (put) { RANGER_ART.drawArrow(put, S, ah); });
        outlineCanvas(actx, aw, ah); ta.refresh();
      }
      // ---- lead arm (rotates to aim in-game) -------------------------------
      if (!scene.textures.exists(d.armKey)) {
        var rmA = scene.textures.createCanvas(d.armKey, d.armW, d.armH), armctx = rmA.getContext();
        drawCell(armctx, 0, d.armW, d.armH, function (put) { RANGER_ART.drawArm(put, d.armW, d.armH); });
        outlineCanvas(armctx, d.armW, d.armH); rmA.refresh();
      }
      // ---- animations (global anim manager — create once) ------------------
      if (!scene.anims.exists(d.idle)) {
        var idleF = []; for (var a = 0; a < IDLE_FRAMES; a++) idleF.push({ key: d.key, frame: 'idle' + a });
        scene.anims.create({ key: d.idle, frames: idleF, frameRate: 6, repeat: -1 });
      }
      if (!scene.anims.exists(d.walk)) {
        var walkF = []; for (var b2 = 0; b2 < WALK_FRAMES; b2++) walkF.push({ key: d.key, frame: 'walk' + b2 });
        scene.anims.create({ key: d.walk, frames: walkF, frameRate: 11, repeat: -1 });
      }
    });
  }

  // ==========================================================================
  // HI-FI WORLD (train yard) — ART-FIDELITY TEST, gated on settings.hifiWorld.
  // Textures are generated at boot (so the toggle is instant) but only USED
  // when the setting is on (via mobModel/bossModel returning null when off, and
  // RealmScene reading hifiWorldOn()). Classic mob/boss/tile art is untouched.
  // ==========================================================================
  var MOB_HI = { slime: 'slimeHi', brute: 'bruteHi', spitter: 'spitterHi', warlock: 'warlockHi' };
  var MOB_HI_SIZE = 48, MOB_HI_DISPLAY = 40, MOB_BODY_WORLD = 22;     // keep classic 22px hitbox
  var BOSS_HI_KEY = 'boss1Hi', BOSS_HI_SIZE = 96, BOSS_HI_DISPLAY = 76;
  var BOSS_BODY_W = 42, BOSS_BODY_H = 36;                              // classic boss world body (14·3,12·3)

  function hifiWorldOn() { try { var s = SAVE.settings(); return !!(s && s.hifiWorld); } catch (e) { return false; } }

  function mobModel(key) {
    if (!hifiWorldOn()) return null;
    var hi = MOB_HI[key]; if (!hi) return null;
    var scale = MOB_HI_DISPLAY / MOB_HI_SIZE, bt = Math.round(MOB_BODY_WORLD / scale);
    return { key: hi, scale: scale, body: { w: bt, h: bt, ox: Math.round((MOB_HI_SIZE - bt) / 2), oy: Math.round((MOB_HI_SIZE - bt) / 2) } };
  }
  function bossModel() {
    if (!hifiWorldOn()) return null;
    var scale = BOSS_HI_DISPLAY / BOSS_HI_SIZE;
    return { key: BOSS_HI_KEY, scale: scale, body: { w: Math.round(BOSS_BODY_W / scale), h: Math.round(BOSS_BODY_H / scale),
             ox: Math.round((BOSS_HI_SIZE - BOSS_BODY_W / scale) / 2), oy: Math.round((BOSS_HI_SIZE - BOSS_BODY_H / scale) / 2) } };
  }

  function buildHiFiWorld(scene) {
    if (typeof WORLD_ART === 'undefined') return;
    function spr(key, W, H, fn) {                 // outlined creature/object
      if (scene.textures.exists(key)) return;
      var t = scene.textures.createCanvas(key, W, H), ctx = t.getContext();
      drawCell(ctx, 0, W, H, function (put) { fn(put, W, H); });
      outlineCanvas(ctx, W, H); t.refresh();
    }
    function tex(key, W, H, fn) {                  // seamless tile (NO outline)
      if (scene.textures.exists(key)) return;
      var t = scene.textures.createCanvas(key, W, H), ctx = t.getContext();
      drawCell(ctx, 0, W, H, function (put) { fn(put, W, H); });
      t.refresh();
    }
    var A = WORLD_ART;
    spr('slimeHi', MOB_HI_SIZE, MOB_HI_SIZE, A.drawSlime);
    spr('bruteHi', MOB_HI_SIZE, MOB_HI_SIZE, A.drawBrute);
    spr('spitterHi', MOB_HI_SIZE, MOB_HI_SIZE, A.drawSpitter);
    spr('warlockHi', MOB_HI_SIZE, MOB_HI_SIZE, A.drawWarlock);
    spr('boss1Hi', BOSS_HI_SIZE, BOSS_HI_SIZE, A.drawBoss);
    tex('gravel', 48, 48, A.drawGravel);
    tex('yardwall', 48, 28, A.drawYardWall);
    tex('track', 48, 96, A.drawTrack);
    spr('tunnel', 96, 120, A.drawTunnel);
    spr('loco', 240, 96, A.drawLoco);
  }

  // ==========================================================================
  // HI-FI PORTAL ROOM (chamber) — same gating as the yard (settings.hifiWorld).
  // Textures built at boot; NexusScene routes its sprites through nexusKey()/
  // nexusScale() so the on-screen size is unchanged and ONLY the fidelity rises.
  // r = classicPx / hiPx, so (existing setScale × r) keeps the display identical.
  // ==========================================================================
  var NEXUS_HI = {
    floor_nexus: { hi: 'floorNexusHi', tile: true },
    wall:        { hi: 'wallHi', r: 0.5 },
    platform:    { hi: 'platformHi', r: 64 / 160 },
    portal:      { hi: 'portalHi', r: 20 / 64 },
    console:     { hi: 'consoleHi', r: 16 / 48 },
    conduit:     { hi: 'conduitHi', r: 16 / 32 },
    wallscreen:  { hi: 'wallscreenHi', r: 0.5 },
    lever_up:    { hi: 'leverHiUp', r: 0.5 },
    lever_down:  { hi: 'leverHiDown', r: 0.5 },
    bestiary:    { hi: 'bestiaryHi', r: 16 / 48 },
    chest:       { hi: 'chestHi', r: 16 / 40 }
  };
  var _chamberBuilt = false;
  function hifiChamberOn() { try { var s = SAVE.settings(); return !!(s && s.hifiChamber); } catch (e) { return false; } }
  // chamber assets follow the Hi-Fi Chamber toggle; the PORTAL is shared with the
  // realm (boss-exit portal), so it turns hi-fi if EITHER toggle is on.
  function nexusOn(name) { return name === 'portal' ? (hifiChamberOn() || hifiWorldOn()) : hifiChamberOn(); }
  function nexusKey(name) { return (nexusOn(name) && _chamberBuilt && NEXUS_HI[name]) ? NEXUS_HI[name].hi : name; }
  function nexusScale(name, base) {
    return (nexusOn(name) && _chamberBuilt && NEXUS_HI[name] && NEXUS_HI[name].r) ? base * NEXUS_HI[name].r : base;
  }
  function buildHiFiChamber(scene) {
    if (typeof NEXUS_ART === 'undefined') return;
    function spr(key, W, H, fn) { if (scene.textures.exists(key)) return; var t = scene.textures.createCanvas(key, W, H), c = t.getContext(); drawCell(c, 0, W, H, function (put) { fn(put, W, H); }); outlineCanvas(c, W, H); t.refresh(); }
    function tex(key, W, H, fn) { if (scene.textures.exists(key)) return; var t = scene.textures.createCanvas(key, W, H), c = t.getContext(); drawCell(c, 0, W, H, function (put) { fn(put, W, H); }); t.refresh(); }
    var A = NEXUS_ART;
    tex('floorNexusHi', 32, 32, A.drawFloor);
    tex('wallHi', 32, 32, A.drawWall);
    tex('conduitHi', 32, 32, A.drawConduit);
    spr('platformHi', 160, 160, A.drawPlatform);
    spr('portalHi', 64, 96, A.drawPortal);         // door-shaped gateway (tall)
    tex('portalDiscHi', 56, 56, A.drawPortalDisc); // the spinning swirl inside the door (no outline)
    spr('consoleHi', 48, 48, A.drawConsole);
    spr('bestiaryHi', 48, 48, A.drawBestiary);
    spr('wallscreenHi', 380, 52, A.drawWallscreen);
    spr('leverHiUp', 34, 48, function (put, W, H) { A.drawLever(put, W, H, true); });
    spr('leverHiDown', 34, 48, function (put, W, H) { A.drawLever(put, W, H, false); });
    spr('chestHi', 40, 40, A.drawChest);
    _chamberBuilt = true;
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
    // M4: the WIZARD — a pointed-hat caster in a blue robe (mirrors the ranger
    // build). Body faces aim in-game; the staff is a separate held sprite.
    grid(scene, 'wizard', [
      '......kk........',
      '.....kbbk.......',
      '....kbBBbk......',
      '...kbBBBBbk.....',
      '..kbBBBBBBbk....',
      '..kkkkkkkkkk....',
      '...kssssssk.....',
      '...kskssksk.....',
      '...kssssssk.....',
      '..kBBBBBBBBk....',
      '.kBBbBBBBbBBk...',
      '.kBBBBBBBBBBk...',
      '.kBBbBBBBbBBk...',
      '..kBBBBBBBBk....',
      '...kk....kk.....',
      '................'
    ]);
    // M4: the KNIGHT — an armored melee bruiser in steel plate with an orange
    // crest + belt accent (its class accent color). Visored helm, breastplate
    // sheen, greaves. Body faces aim in-game; the sword is a separate held sprite.
    grid(scene, 'knight', [
      '.......o........',
      '......ook.......',
      '.....klllk......',
      '....kllllk......',
      '....kl..lk......',
      '....kllllk......',
      '.....kkkk.......',
      '...kklLLlkk.....',
      '..klLLwwLLlk....',
      '..klLwwwwLlk....',
      '..klLLwwLLlk....',
      '..klLLLLLLlk....',
      '...kL.oo.Lk.....',
      '...kL....Lk.....',
      '..kkl....lkk....',
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
    // M4: the Wizard's STAFF — drawn POINTING RIGHT (rotation 0 = aim 0) like
    // the bow, a wooden shaft with a blue crystal head at the aim end.
    grid(scene, 'staff', [
      '..........k.',
      '.........kbk',
      'kwwwwwwwkbBk',
      'kKwwwwwwkbBk',
      'kwwwwwwwkbk.',
      '..........k.'
    ]);
    // M4: the FROSTBOLT — the Wizard's piercing basic, icy blue with a white
    // shaft (mirrors the arrow shape so it flies point-first).
    grid(scene, 'frostbolt', [
      '............',
      '.....kk.....',
      'kbbbbkwk....',
      'kwwwwwwwk...',
      'kbbbbkwk....',
      '.....kk.....'
    ]);
    // M4 (user redesign 2026-07-13, replaces the storm orb): the ZAPBALL — the
    // Wizard's machine-gun round, a BIG crackling LIGHTNING BALL (gold core,
    // white heart, blue rim + spark nubs) — sized at least HALF THE WIZARD
    // (10px grid × scale 2 = 20px vs his 32px). Fired dead straight; on
    // connecting it can PROC a lightning bolt down (RealmScene.lightningStrike).
    grid(scene, 'zapball', [
      '....bb....',
      '..kbbybk..',
      '.kbyyyybk.',
      '.kbywwyybk',
      'bkbywwwyb.',
      '.kbywwwybb',
      'bkbyywwybk',
      '.kbyyyyybk',
      '..kbbyybk.',
      '....bb....'
    ]);
    // M4: the Knight's SWORD — a held MELEE weapon drawn POINTING RIGHT
    // (rotation 0 = aim 0) like the bow/staff: dark pommel + grip on the left
    // (the hand end), a gold crossguard, then a steel blade to a white tip.
    grid(scene, 'sword', [
      '................',
      '..k.............',
      'kKyyllllllllllww',
      'kKyyllllllllllw.',
      '..k.............',
      '................'
    ]);
    // M4 (user add): the TORNADO — the whirlwind's proc funnel. Wide swirling
    // top tapering to a point, banded light/white for a spin read; drawn
    // greyscale so RealmScene tints it steel and sways it as it travels.
    grid(scene, 'tornado', [
      'llllllllllll',
      '.wwwwwwwwww.',
      '.lllllllll..',
      '..wwwwwww...',
      '..llllll....',
      '...wwwww....',
      '...llll.....',
      '...wwww.....',
      '....lll.....',
      '....www.....',
      '....ll......',
      '.....ww.....',
      '.....l......',
      '.....w......',
      '.....l......',
      '.....w......'
    ]);
    // M4: the SLASH — the sword-cleave VFX (user 2026-07-13: ONE thick COMMA
    // that reaches as far as the whirlwind). A single filled comma: an outer
    // blade edge at radius 54 with an inner edge that tapers from a thick head
    // to a point, so it reads as one bold curved slash. PIVOT at left-center
    // (2,32) → RealmScene.meleeSwing sets origin (0.03,0.5) = the Knight,
    // scale = range/54 (blade tip lands at the reach), rotate to the aim. Neutral
    // white → tinted at draw.
    (function () {
      var t = scene.textures.createCanvas('slash', 64, 64);
      var ctx = t.getContext();
      var cx = 2, cy = 32, R = 54, a0 = -1.02, a1 = 1.02, N = 30;
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {                 // outer edge, head → tail
        var th = a0 + (a1 - a0) * i / N;
        ctx.lineTo(cx + Math.cos(th) * R, cy + Math.sin(th) * R);
      }
      for (var j = N; j >= 0; j--) {                 // inner edge back, tapering to a point
        var th2 = a0 + (a1 - a0) * j / N;
        var w = 2 + 15 * (1 - j / N);                // thick head (a0) → sharp tail (a1)
        ctx.lineTo(cx + Math.cos(th2) * (R - w), cy + Math.sin(th2) * (R - w));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
      t.refresh();
    })();
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
    // (the E5 'pedestal' texture was retired with the plaza — removed 2026-07-13)
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
    // M4: the WHIRL — the Knight's whirlwind ring. Two bright blade-arcs on
    // opposite sides of a faint ring (plus an inner swirl); RealmScene spins it
    // around the Knight while he channels. Neutral white → tinted steel at draw.
    (function () {
      var t = scene.textures.createCanvas('whirl', 96, 96);
      var ctx = t.getContext();
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(48, 48, 40, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(48, 48, 38, -0.5, 1.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(48, 48, 38, Math.PI - 0.5, Math.PI + 1.1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(48, 48, 25, 0.4, 2.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(48, 48, 25, Math.PI + 0.4, Math.PI + 2.2); ctx.stroke();
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

    // ART-FIDELITY TEST: build the optional hi-fi animated Ranger models last
    // (additive; the classic 'ranger' above is the default and is untouched).
    buildRangerModels(scene);
    buildHiFiWorld(scene);                 // hi-fi train-yard mobs/tiles/train (gated at use)
    buildHiFiChamber(scene);               // hi-fi portal room (gated at use)
  }

  return {
    generateAll: generateAll,
    // ART-FIDELITY TEST helpers (consumed by entities.js / scenes.js / menu.js)
    modelFor: modelFor, selectedModelId: selectedModelId, RANGER_SIZES: RANGER_SIZES,
    // HI-FI WORLD helpers
    hifiWorldOn: hifiWorldOn, mobModel: mobModel, bossModel: bossModel,
    // HI-FI CHAMBER helpers
    nexusKey: nexusKey, nexusScale: nexusScale, hifiChamberOn: hifiChamberOn
  };
})();
