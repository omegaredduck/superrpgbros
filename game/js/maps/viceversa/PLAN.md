# VICE VERSA — map plan (MAP 14 of the campaign)

> Realm 18. Every pick is Red's. The map slot pivoted twice (haunted
> library → enchanted library → SCRAPPED) before Red chose the
> underworld and evolved it live into VICE VERSA: one half HOLY, one
> half HELL, divided by an animated river of souls, and the armies
> can be made to fight each other. DOUBLE BOSS. Sheets + finals in
> `assets/` and `artdev/viceversa/`. Numbers TUNE ME. LOCKED
> 2026-07-16 (bosses "sounds lit af", theme "thats great").

## 1 · Theme + name

**VICE VERSA** (Red's name) — the eternal struggle made literal: the
WEST half is hell (brimstone, magma, graves, war camp), the EAST half
is heaven (marble, gold, clouds, chapel). The RIVER OF SOULS runs N–S
between them, crossed by ONE bridge whose west half is skull-and-bones
and east half is gold. Demons carry GREEN FEL accents; the holy army
glows gold and white.

- Realm id `viceversa`, biome `viceversa`, bosses `satan` +
  `supremeBeing` (DOUBLE), music `viceversa`.
- **BIG MAP** (Red): ~1.5× a standard realm. Technical guardrails:
  scale mob counts roughly with area but CAP total live actors at the
  engine budget; the river animation is cheap swapped tile strips,
  not per-pixel work; minimap/dev-view must handle the size.
- TOROIDAL: N–S wraps normally. E–W the OUTER edges join directly —
  hell's west edge continues onto heaven's east edge. That seam is
  the "teleport" crossing (see §2 wrap-leash).

## 2 · FACTION WARFARE — signature map mechanic (LOCKED, Red's design)

**Holy and hell mobs DAMAGE EACH OTHER.** Drag a chase across the
bridge and the two armies fight for real — angels vs demons, full
damage, kills count (no player credit/loot for mob-on-mob kills —
farm guard).
**WRAP-LEASH (Red):** when the player crosses the E–W wrap seam,
chase trains DROP — pursuers turn home, and only mobs on the arrival
side aggro. "You don't have angels just coming in while you're on the
demon side — and vice versa." The BRIDGE is the only chase-preserving
crossing: mobs will follow you across it. That asymmetry is the whole
game: wrap to escape, bridge to instigate.
Fresh mechanic — no reuse.

## 3 · Destructibles (global fence rule applies)

- BONE FENCE (hell decor) + GOLDEN FENCE (holy decor) — destructible
  with deterioration states (bend/crack → break → shards) per the
  campaign-wide rule.
- Everything else is standard decor; the WRECK-tier set pieces
  (thrones, gates, obelisks) are permanent scenery.

## 4 · Rosters (per side — Red demanded one sheet per army)

**HELL (8 — Red picked 1 2 3 4 6 9 12 15):**

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Imp** | swarm | packs; pitchfork poke, warned mini-lunge |
| **Fire Imp** | lobber | warned fireball arcs, small burn circles |
| **Succubus** | lure | charm kiss: warned heart cone, brief reverse/pull (capped, displacement tag) |
| **Demon Brute** | slammer | fel-cracked; warned ground slam circle |
| **Skeleton Warrior** | line | sword+shield; blocks frontal, warned overhead chop |
| **Ghost** | phaser | drifts THROUGH terrain; fades in/out on approach |
| **Chain Gaoler** | dragger | warned hook throw — drags player a capped step (displacement tag) |
| **Tormentor** | zoner | fel whip: warned crack arcs that linger as burn lines |

**HOLY (9 — Red picked 1 2 3 4 7 10 12 16 20):**

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Cherub** | flyer swarm | light-arrow pot shots, drifts lazily |
| **Angel Soldier** | line | sword lunge, warned; the rank-and-file |
| **Seraph** | caster | four wings; paints warned light-lance lines |
| **Valkyrie** | diver | circles high; shadow marks the dive lane |
| **Temple Acolyte** | SUPPORT | heals nearby mobs (green plus ticks) — priority target |
| **Guardian Statue** | stalker | ONLY MOVES WHEN UNWATCHED (freezes in player facing-cone); peek-a-boo dread |
| **Harp Siren** | lure | charm chords: warned note cone, brief pull (mirror of succubus, same caps) |
| **Herald** | zoner | trumpet blast: warned expanding cone knockback (capped) |
| **Archon** | elite | four-wing knight; warned greatblade arcs + short light dash |

MIRROR PAIRS (flavor + faction-warfare matchups): succubus↔siren,
brute↔archon, gaoler↔herald, imps↔cherubs.

## 5 · Decor + tiles

**HELL DECOR (ALL 20 pass):** bone pile · obsidian spire (fel veins) ·
lava geyser · soul cage · brimstone arch · hell banner · gargoyle
idol · skull brazier · pentagram circle · BONE FENCE (destructible) ·
burning dead tree · hellmouth pit (hands reach out) · demon throne ·
impaled spikes · crooked graves · chained coffin · war drum · magma
pool · weapon rack · bat roost.

**HOLY DECOR (ALL 20 — Red replaced both plants):** marble column ·
golden fountain · prayer altar · stained glass arch · holy banner ·
angel statue · **grand candelabra** (7 flames; replaced olive tree) ·
bell tower · pearly gate · GOLDEN FENCE (destructible) · sundial ·
dovecote · **church pews** (replaced lily garden) · scripture
tablets · halo monument · trumpet monument · chalice pedestal ·
cloud bank · beacon of light · great harp (plays itself).

**RIVER/BRIDGE SET (scene-tier, not picked):** boundary obelisks
(half gold / half bone — mark the wrap seam) · soul geysers (river
vents) · fallen titan sword (no-man's-land monument) · bridge
lanterns (gold post + skull post pairs at both bridge ends).

**TILES (8 — Red cut #8 sanctified field + #10 bridge tile):**
Hell: #1 BRIMSTONE WASTE (BASE) · #2 ASH FLATS · #3 OBSIDIAN PAVING ·
#4 BONE LITTER. Holy: #5 HOLY MARBLE (BASE) · #6 GOLDEN PATH ·
#7 CLOUD MEADOW. Shared: #9 RIVER OF SOULS — **ANIMATED** (current
highlights + drifting soul faces cycle phase; cheap frame swap).
THE BRIDGE is a built STRUCTURE (planks, rails, lantern pairs, hard
gold/bone seam at center), NOT a ground tile.

**PLANNED scene (assets/eternal_scene_plan.png — BIG, split):** hell
W (war camp NW, graves quarter W, bone fields center, magma fields
SW, SATAN ARENA mid-S at the throne + hellmouth) · holy E (chapel
quarter NE, fountain plaza E, cloud meadows, SUPREME ARENA mid-S at
the pearly gate) · river N–S center w/ soul geysers · BRIDGE center,
**player STARTS on the bridge seam** · fallen titan sword on the
bank · boundary obelisks at the outer wrap seam · portal rings in
both arenas (dormant until first boss kill).

## 6 · DOUBLE BOSS (LOCKED — Red's structure)

**Both bosses spawn at map load, each TRAPPED on his own side. The
player starts ON THE BRIDGE and chooses whom to fight first. Beating
one opens a PORTAL between the arenas. Beat BOTH to clear the map.
The bosses do NOT damage each other (Red: "No").**

### SATAN — "KING IN FLAME" (hell arena: throne + hellmouth)
**Look (LOCKED, assets/satan_final.png):** satan sheet #10 — massive
red demon, crown of horns + FIRE CROWN, cape of fire, bat wings,
goat legs, GOLD TRIDENT. satan(put,S,p) fully parameterized in
render_satan.js; FINAL params in render_satan_final.js.
**Kit (boss contract):**
- TRIDENT SWEEP — warned melee arc trailing fire.
- HELLFIRE PILLARS — warned circles, lava columns erupt in sequence.
- IMP CALL — 2–3 imps out of the hellmouth (fromBoss, red glow, no
  drops).
- P2 (<50%): TAKES FLIGHT — warned strafing dive lanes + boomerang
  trident along a marked path.
- **SIGNATURE — RING OF FIRE:** trident slam → expanding flame ring
  with telegraphed SAFE GAPS → his crown gutters out, he stumbles:
  **vented ×1.5 (hurtBoss)** while he reignites.

### SUPREME BEING (holy arena: pearly gate)
**Look (LOCKED — Red: "this is the new boss"): THE COMPOSITE** —
jacked JUDGE OLYMPUS body (zeus sheet #10: white beard, gold
bottom-half robe, bare muscled torso, SUN CROWN from #5, golden
SCALES dangling from the end of his outstretched fist) with **THE
WATCHER — a huge-winged golden eye (eye sheet #1) — hovering above
him on twin shafts of light. Permanent form.** He FLIES IN carried
by the Watcher (entrance). The eye BLINKS as its idle animation
(4-frame cycle: open hold ~1.2s → half → closed → half, ~230ms; see
assets/supreme_blink.gif) — and the blink is a fight tell.
zeusGod(put,S,p) in render_supreme_zeus.js (scales = hand-hang
version) + eyeGod(put,S,p) in render_supreme_eye.js; composite in
render_supreme_entrance.js; FINAL params in render_supreme_final.js.
**Kit (boss contract):**
- GAVEL FIST — warned slam circle + expanding shockwave ring.
- JUDGMENT BEAM — the Watcher SLAMS SHUT to charge (blink tell) →
  snaps open → telegraphed line beam across the arena.
- SCALES OF JUDGMENT — he raises the scales; HALF the arena is marked
  for smiting, the RAISED PAN shows the safe half.
- CHERUB CALL — summons cherub archers (fromBoss, no drops).
- **SIGNATURE — FINAL VERDICT:** eye closes long-charge → full-arena
  ROTATING beam sweep on a marked line → the eye droops half-lidded,
  he kneels: **vented ×1.5 (hurtBoss)**.

≤6 scouter hints (shared page): they're trapped on their own sides ·
start at the bridge, pick your poison · eye shut = beam coming · the
raised pan is the safe half · the fire ring has gaps — find them ·
beat one, the portal opens.
Every source fromBoss=true. NO burst+radial spam.

## 7 · Music + SFX

**"ETERNAL WAR.EXE"** (assets/eternal_theme.wav — **TAKE 1,
RED-APPROVED ("thats great")**; Red's brief: EPIC, BUILDING, INTENSE,
8-bit): 152 BPM, 114 bars = 180.0s, E minor (Em–C–G–D). NO SLOW
INTRO — war drums + dark hook from bar 0, then it BUILDS all track:
A war hook → B + tri counter-melody → C octave lift + 16th arps →
D THE BUILD (low choir drone, pounding toms, rising line that steps
UP each pass, marching snare rolls) → E key-lift climax (+2) →
F THE WAR (gallop bass; HOLY CALL pulse motif answered by HELL
ANSWER tri motif, trading bars) → G finale (hook + octave + counter
+ tom barrage) → crash + Em ring-out at exactly 180.0. Port via
section-composer — KEEP bar-0 full stack, the D-section stepping
rise, the call/answer war, and the key lift.
New SFX: river of souls wail loop (quiet) · soul geyser burst ·
bridge footfalls (wood vs bone) · faction battle clash stingers ·
wrap-seam whoosh + chase-drop cue · fel whip crack · chain hook +
drag · charm (heart + harp variants) · statue freeze/unfreeze tick ·
acolyte heal chime · herald blast · portal open choir hit · SATAN:
trident sweep + slam, pillar eruptions, imp call cackle, wing
takeoff/dive, RING OF FIRE roar, crown gutter + reignite ·
SUPREME: gavel slam + shockwave, eye-shut charge hum + beam fire,
scales creak + smite, cherub call, FINAL VERDICT sweep, kneel/vent.

## 8 · Build order (Opus)

1. art.js: 17 mob draws (8 hell + 9 holy; guardian statue needs
   freeze/move frames; acolyte heal FX) + SATAN (satan() canon + P2
   flight frames + crown-out vent frame) + SUPREME (composite: zeus
   body + Watcher eye w/ 4-frame BLINK cycle + shut/charge + droop
   vent frames; entrance fly-in) + 40 decor (both fences w/ break
   states) + 8 tiles + RIVER ANIMATION frames + BRIDGE structure +
   river/bridge set pieces + PORTAL — port from assets/render/*.js.
2. map.js: MAPS.register({ id:'viceversa', ... }) — realm/biome/17
   mob rows (side-tagged: faction 'hell'|'holy')/DOUBLE boss defs/
   dropTable/console unlock + ETERNAL WAR.EXE composer + SFX +
   factionCfg { crossDamage: true, mobKillCredit: none } +
   wrapLeashCfg + portalCfg.
3. scene.js: layout per assets/eternal_scene_plan.png. BIG map
   guardrails (§1). River = impassable animated strip; bridge = only
   walk crossing; wrap seam joins outer edges.
4. FACTION WARFARE per §2: hostility matrix (hell↔holy mutual,
   both→player), chase persistence across the bridge, WRAP-LEASH
   aggro drop at the seam, no-farm guard on mob-vs-mob kills.
5. DOUBLE BOSS per §6: both spawn trapped (arena leash hard), bridge
   start, portal after first kill, map clear on both.
6. Music port (verify vs assets/eternal_theme.wav) + SFX §7.
7. Suite `test/m20_viceversa_verify.js` + FULL battery + ?v= bump +
   docs (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints): routing
   (bridge-only crossing + wrap seams walkable + river impassable) ·
   faction damage matrix + no-credit guard · wrap-leash chase drop ·
   both boss kits (blink tell timing, safe-pan correctness, ring
   gaps, vents) · portal gating · BIG-map actor cap.

## 9 · unfreeze() shift list preview (full in BUILD_INSTRUCTIONS)

river animPhaseAt · geyser burstAt · faction skirmish clocks (none —
emergent) · statue moveWindowAt · acolyte healTickAt · siren/succubus
charmAt · gaoler hookAt · tormentor whip arc[].expireAt · valkyrie
diveAt · herald blastAt · archon dashAt · imps/cherubs (no clock) ·
portal openedAt · SATAN: nextVerbAt / sweepAt / pillar[].at /
impCallAt / diveLane[].at / tridentReturnAt / ringAt / ventedUntil ·
SUPREME: nextVerbAt / gavelAt / beamChargeAt / beamAt / scalesAt /
smiteAt / cherubCallAt / verdictChargeAt / sweepAngleAt / ventedUntil
· blink idle cycleAt · every _zoneWarn.until. (Skip Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — rosters (8 hell + 9 holy), decor (20+20 w/
candelabra + pews swaps), tiles (8; bridge = structure), FACTION
WARFARE + wrap-leash, double boss (SATAN #10 KING IN FLAME "10";
SUPREME BEING composite w/ Watcher "this is the new boss", blink
"thats cool", kits "sounds lit af"), scene, ETERNAL WAR.EXE take 1
("thats great"). Map 14 is build-ready.
