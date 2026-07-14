# Ranger Art-Fidelity Test — Change Log (2026-07-13, build ?v=m4e)

A TEMPORARY, fully reversible feature to test higher-fidelity pixel art for the
Ranger/archer. Adds selectable canvas sizes (32/64/128/160) with real idle +
walk animation, plus a matching bow + arrow and an archer stance whose lead hand
holds the bow. The original 16x16 Ranger is the DEFAULT and is never removed or
modified.

## How to use
ESC → Settings → CHARACTER (art test) → Model: pick [16·orig] [32] [64] [128]
[160]. Applies live to the player in the chamber/realm and is previewed on the
class-select card. The choice is saved in srb_settings.rangerModel.

## Reversibility (the whole point)
- Full backup of every touched file before any edit:
  `_art_test_backup_20260713_152543/` (index.html + js/{textures,entities,menu,
  save,scenes}.js).  [gitignored via `_art_test_backup_*/`]
- Everything is ADDITIVE and gated behind the Model selector. With the default
  '16' (or any non-Ranger class) the code paths reproduce the classic behavior
  EXACTLY — verified: texture 'ranger', scale 2, 20x24 world hitbox, no anim.
- On-screen footprint (and therefore the physics hitbox) is held at 32px for
  every model, so ONLY art fidelity changes — gameplay/collisions are identical.
- To fully revert: re-select '16' in Settings, OR restore the six files from the
  backup folder + delete game/js/ranger_art.js, OR `git checkout` the touched
  files. No original art is ever changed.

## Files changed
- game/js/ranger_art.js  — NEW. Procedural, resolution-aware Ranger art
  (drawBody idle/walk, drawBow, drawArrow, outlinePass). Pure pixel-plotting;
  the same module rendered the preview PNGs.
- game/js/textures.js    — ADD RANGER_SIZES/model helpers + buildRangerModels()
  (spritesheets ranger32/64/128/160 with idle0-3/walk0-5 frames, bow{S},
  arrow{S}, and the idle/walk anims). Classic 'ranger' grid untouched. Exposes
  TEX.modelFor / TEX.selectedModelId / TEX.RANGER_SIZES.
- game/js/save.js        — ADD settings default `rangerModel: '16'`.
- game/js/menu.js        — ADD "CHARACTER (art test)" Model selector row;
  Settings panel height 544→600, KEYBINDS shifted down.
- game/js/entities.js    — ADD Entities.applyModelSkin(); createPlayer calls it;
  updatePlayer drives idle/walk anims + swaps the matching arrow (all gated on
  p._rangerModel, so the classic path is unchanged). Export applyModelSkin.
- game/js/scenes.js      — class-picker Ranger card previews the selected model
  (animated) + matching bow. Every other class/card renders as before.
- game/index.html        — load js/ranger_art.js before textures.js; ?v=m4d→m4e.

## Verification (headless, this build)
- m4_suite 18/18, m4b_suite 26/26, m2_suite all green — zero console errors.
- Boot smoke test: all 15 textures + 8 anims + frames present; default settings
  rangerModel='16'; classic player = ranger/scale2/20x24; live switch to 64/160
  works; re-select 16 fully restores classic. In-engine screenshots confirm the
  bow attaches to the lead hand at 64 and 160.

---

# Hi-Fi World — TRAIN YARD (2026-07-13, build ?v=m4f)

Opt-in, reversible extension of the art test: Settings → ART TEST → **Hi-Fi World
[ON/OFF]** (default OFF). When ON, the realm becomes a hi-fi TRAIN YARD and all
mobs + the boss use higher-fidelity art. Also: the hi-fi Ranger is now ~2x bigger
(RANGER_TARGET 32→64) per user request.

## What it adds (all gated on settings.hifiWorld; default = normal realm)
- TRAIN YARD arena: seamless gravel ground, oil stains, a concrete wall border,
  two horizontal rail tracks + a decorative vertical track, arched tunnel mouths.
- AMBUSH TRAIN: at random intervals a train is telegraphed (air-horn + flashing
  red crossing signals + camera rumble ~1.3s), then barrels down a random lane at
  1050px/s from a tunnel. Contact = INSTANT DEATH (bypasses i-frames, killer =
  "the 5:15 express"). It also mows any mob it hits. Fair: the warn window +
  off-track safety let you dodge. Defensive guard: a warning only starts from idle.
- Hi-fi monsters: slime/brute/spitter/warlock (48px) + Grovekeeper boss (96px),
  faithful redraws. Hitboxes preserved (mob 22px world, boss ~42x36) so balance
  is unchanged — only the art + on-screen size differ.

## Reversibility
- Pre-edit backup: `_map_train_backup_20260713_161251/` (maps/data/scenes/textures/
  entities/audio/save/menu + index.html), gitignored.
- 100% gated: Hi-Fi World OFF → the realm, mobs, boss, and tiles are byte-for-byte
  the classic game (mobModel()/bossModel() return null; RealmScene skips the yard).
  Verified: m4 18/18, m4b 26/26, m2 green — zero console errors with it off.
- To revert: turn Hi-Fi World OFF (and set Ranger model to 16), or restore the
  backup files + delete world_art.js, or git checkout.

## Files changed
- game/js/world_art.js  — NEW. Hi-fi mobs, boss, gravel/wall tiles, track, tunnel,
  locomotive (reuses ranger_art.js primitives).
- game/js/textures.js   — buildHiFiWorld() generates the above; mobModel/bossModel/
  hifiWorldOn helpers; RANGER_TARGET 32→64 (bigger Ranger).
- game/js/entities.js   — spawnMob/spawnBoss route to hi-fi textures when on
  (gated; classic path unchanged).
- game/js/scenes.js     — RealmScene setupTrainYard + the train state machine
  (warn→launch→run), instakill, mob-mow (gated on hifiWorld).
- game/js/menu.js        — Hi-Fi World toggle in the ART TEST section (panel taller).
- game/js/save.js        — settings default hifiWorld:false.
- game/js/data.js        — trainhorn + trainpass SFX recipes.
- game/index.html        — load world_art.js after ranger_art.js; ?v m4e→m4f.

## Verification (headless)
- Suites m4/m4b/m2 green, zero console errors.
- Hi-Fi World ON: realm = train yard (2 lanes), all 10 hi-fi textures present,
  mobs use hi-fi art at a 22px hitbox, Ranger displays at 64px, train launches and
  INSTAKILLS the player on contact (alive→false, hp→0). In-engine screenshots
  confirm the yard + the train's headlight.

---

# Bow-hold rework — UPRIGHT BOW + AIM-TRACKING ARM (2026-07-13, ?v=m4f → m4g)

User: a bow shouldn't spin to the cursor; a real archer keeps the bow ~vertical
(90°) and the ARM moves. Fixed for the hi-fi Ranger:
- The bow no longer rotates to the aim. It stays UPRIGHT (rotation 0, pivot at its
  grip), flipped to the facing side so the belly points at the target.
- The LEAD ARM is now its own sprite (`rangerArm{S}`, drawArm in ranger_art.js)
  that ROTATES to the aim — reaches right, drops when you aim down, raises when
  you aim up, flips left when facing left. The bow sits UPRIGHT at the arm's hand.
- The baked lead arm was removed from the body frames (the rear/draw arm stays);
  the class-select card shows the arm + upright bow too.
- The arrow still fires the true aim angle. Only the hi-fi Ranger is affected;
  classic ranger/wizard/knight unchanged.

Files: ranger_art.js (drawArm added; lead arm removed from drawBody), textures.js
(arm texture per model + descriptor armKey/armLen/armPivotX/shoulder; bowGrip),
entities.js (applyModelSkin creates p.arm; updatePlayer rotates arm to aim + bow
upright; i-frame/death handle p.arm), scenes.js (card + onDeath), index.html
(?v m4f→m4g). Verified: m4 18/18, m4b 26/26, m2 green; in-engine holds at
right/up/down/left all correct (bow vertical, arm tracks aim) — zero console errors.

---

# Bow orientation — TANGENT TO THE CIRCLE (2026-07-13, ?v=m4h → m4i)

User refinement: the bow should ride TANGENT to a circle around the character —
limbs perpendicular to the arm (the radius), belly pointing outward along the aim.
Aiming right = vertical bow; up/down = horizontal (belly up / down); left =
vertical belly-left. So the bow's rotation = the aim angle (arm = radius, bow =
tangent), NOT a fixed-vertical hold. Shoulder anchor lowered to the shoulder
(0.64/0.44) and the arm slimmed (armH 0.22→0.15) so it no longer joins at the
head. One line: updatePlayer sets the hi-fi bow rotation = aim (was 0). Files:
entities.js + textures.js (arm dims/shoulder) + index.html (?v). Verified in-engine
at right/up/down/left — bow tangent, arm on the shoulder, zero console errors.

---

# Hi-Fi PORTAL ROOM (chamber) + split toggles (2026-07-13, ?v=m4j)

Toggles SPLIT into two independent switches (user): Settings → ART TEST →
**Hi-Fi: World [ ]  Chamber [ ]**.
- World (hifiWorld) = the train-yard realm + hi-fi monsters (as before).
- Chamber (hifiChamber) = the portal room (nexus) uses hi-fi art. Both default OFF.

Hi-fi chamber assets (NEW game/js/nexus_art.js, reuses ranger_art primitives):
arcane floor + wall tiles, the portal PLATFORM (beveled ring, radial inlays, 8
sockets, glowing well), the PORTAL as a DOOR (arched stone gateway with a swirl
inside) + a spinning swirl DISC, the CONSOLE + BESTIARY terminals, VAULT chest,
LEVER (up/down), CONDUIT, records WALL SCREEN. All NEUTRAL where tinted (portal)
so mode colors still apply.

Gating (textures.js): buildHiFiChamber() builds them at boot; nexusKey(name)/
nexusScale(name,base) swap the NexusScene sprites (r = classicPx/hiPx so on-screen
size + hitless placement are IDENTICAL — only fidelity rises). Portal is shared
with the realm boss-exit, so it turns hi-fi if EITHER toggle is on. hifiChamberOn()
exported.

Animation (user asks — "portal like a door with animation", "platform + wiring
animated", "consider the low-fi animations"):
- Passive tweens (pulsing terminals, halos, well glow, ring-light ignition,
  conduit pulses) CARRY OVER automatically — they target the sprites, which only
  got re-textured.
- The DOOR frame stays put; a swirl DISC spins inside it (createPortalAt: hi-fi
  path skips the classic 360° spin, adds a spinning 'portalDiscHi' disc, fades it
  in; despawnPortal destroys it).
- chamberAmbient(): the platform ring-lights BREATHE, the well pulses, and energy
  pulses climb the conduit CONTINUOUSLY (not only when powered). powerUp() kills
  the ambient + takes over while a portal is live; powerDown() restarts it. No-op
  unless Hi-Fi Chamber is on.

Reversible: gated on hifiChamber; OFF = the classic chamber byte-for-byte
(nexusKey/nexusScale return the classic key/scale). Pre-edit backup
`_portal_room_backup_20260714_162357/` (gitignored). To revert: toggle off, or
restore backup + delete nexus_art.js, or git checkout.

Files: NEW nexus_art.js; textures.js (buildHiFiChamber + NEXUS_HI + nexusKey/
nexusScale/hifiChamberOn + portalDiscHi); scenes.js (NexusScene texture swaps +
door/disc + chamberAmbient + powerUp/powerDown handoff + boss-portal swap);
menu.js (two toggles; panel 640); save.js (hifiChamber:false); index.html
(nexus_art.js load; ?v m4i→m4j).

Verify: m2/m4/m4b green (classic untouched) + in-engine (suite-style launch —
the GL-swiftshader flag was what hung my ad-hoc harness): Hi-Fi Chamber ON renders
the door portal + spinning disc on the animated platform, all chamber textures
hi-fi, zero console errors. NOTE: disk-only — awaits 2_SAVE_AND_UPLOAD.bat with
the m4a–m4j backlog.

---

## 2026-07-14 (m4k → m4l) — chamber polish: records readout, platform, labels, light strip

Follow-up polish on the hi-fi chamber from live screenshot feedback. All still
gated on hifiChamber; classic path untouched.

- RECORDS SCREEN combined onto ONE always-visible wall readout. recordsParts()
  now returns a single line: `CLASS LV n · KILLS · DEATHS · BEST LV · REALMS ·
  CLOSED · LAST: <killer>`. The count-up animation still fires on realm exit
  (entry==='realm' → 'count'), so the numbers tick up when you leave a map — now
  on the same screen you already see kills/deaths on. Fits: text width 525 <
  glass 570 at font 8.
- WALL-SCREEN 2×-WIDTH BUG fixed. The four "lean toward you" setScale calls
  (console/wallscreen/lever/bestiary) hard-coded the classic scale 3, which
  overrode the hi-fi nexusScale and doubled the glass width. All four now wrap in
  TEX.nexusScale(...) so the hi-fi screen renders at its true 570px width.
- STATION LABELS restored: vault/bestiary/console text depths raised to 7 so they
  aren't hidden behind the hi-fi station sprites. (PORTAL WORKS title left at
  default depth — setDepth 7 made it overlap the wall screen.)
- PLATFORM proportions redrawn to match the classic (big central well ~0.41R,
  clean donut ring, 8 sockets, radial blue→cyan glow, bright core).
- CONDUIT reverted to the LIGHT STRIP (stone lips + bright animated core). The
  wire-bundle/sparks experiment was rejected ("that wiring looks terrible / lets
  go back to the light strip"); chamberSparks/spawnSpark removed.

Reversible: same gating + backup `_portal_room_backup_20260714_162357/`.
Files: scenes.js (recordsParts + 4 setScale fixes + label depths); nexus_art.js
(drawPlatform + drawConduit); index.html (?v m4k→m4l).
Verify: m2/m4/m4b ALL GREEN; in-engine records_screen.png shows the single-line
readout on the correctly-sized wall screen, zero console errors.

---

## 2026-07-14 (m4l → m4m) — vault icon → keypad wall-safe

User reviewed a numbered PNG grid of 10 metal chests + 10 metal vaults and picked
"vault 5" (the keypad safe). Swapped the chamber VAULT icon from the wood+gold
chest to a metal keypad wall-safe.

- nexus_art.js drawChest() rewritten: gunmetal outer frame + iron inset door
  (new frameMetal() beveled-plate helper), a 3×4 round-button keypad, a green
  status LED (top-right), and a steel lever handle (lower-right). New MET palette
  (steel/iron/gun dark-mid-light-hi) + GREEN.
- Same texture key (chestHi) and call site — no scenes.js/textures.js change; the
  vault station just draws the new art. Still gated on hifiChamber (OFF = classic
  wood chest, untouched).
- index.html ?v m4l→m4m.

Reversible: toggle Hi-Fi Chamber off = classic wood chest; or git checkout
nexus_art.js. Design-grid render scripts kept in artdev (render_chests.js,
render_chests_metal.js, render_vaults.js) if we want to revisit other options.
Verify: m2/m4/m4b green; in-engine (hifiChamber on) the keypad safe renders on the
left chamber wall, zero console errors.
