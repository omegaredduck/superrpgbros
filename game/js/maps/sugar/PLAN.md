# SUGAR WORLD — map plan (MAP 12 of the campaign)

> Realm 16. Every pick is Red's — including the boss, built from HIS
> concept art. Sugar-coated menace: pastel candy land where the candy
> fights back and the teddy bear has glowing red eyes. Sheets + finals
> in `assets/` and `artdev/sugar/`. Numbers TUNE ME. LOCKED 2026-07-16
> (boss "thats perfect", theme TAKE 1 "ok").

## 1 · Theme + name

**SUGAR WORLD** (Red's name) — candy-land valley: peppermint road,
chocolate river, gingerbread village, cotton-candy woods, frosted
peaks — ruled by SUGAR BEAR from his fenced den. Palette anchors:
frosting cream, candy brights, chocolate/caramel, licorice
(sugar_kit.js `G`).

- Realm id `sugar`, biome `sugar`, boss `sugarBear`, music `sugar`.
- Toroidal wrap ON (peppermint path N–S + chocolate river W–E run
  edge-to-edge).

## 2 · CANDY PICKUPS — signature map mechanic (LOCKED, Red's design)

**Killed mobs have a chance to drop a CANDY PICKUP. Eating it = FULL
HEAL.** Rare because it's total (drop chance TUNE ~3–5%; sparkle +
pickup radius generous; despawn timer long). Sugar Bear's GUMBALL
VOLLEY duds may also leave one (TUNE, can be 0). NO fixed spawners.
BALANCE FLAG: full-heal drops are a NEW economy — tune drop rate
against realm difficulty; suites assert drop rate within bounds.
Fresh mechanic — no reuse.

## 3 · DESTRUCTIBLE FENCES — campaign rule born here

**ALL fences in the game are DESTRUCTIBLE (Red, global rule):** candy
cane fences here (village + den ring) break with deterioration states
(post wobble → crack → shatter into candy shards) and regrow slow (or
stay down for the realm — TUNE). Build step must also RETROFIT
existing maps' fences (graveyard etc.) to be destructible.

## 4 · Roster (ELEVEN — Red picked 1 2 3 5 6 7 11 12 14 16 17; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Gummy Bear** | swarm | packs of 4–6; jelly-glint → chomp lunge; squish-pop death |
| **Gingerdead Man** | runner | fast; cane-shiv slash warn; ON DEATH breaks in half — top half keeps crawling |
| **Candy Lancer** | charger | couches cane-lance → warned charge lane |
| **Jawbreaker** | roller | warned roll lines; armored — layers chip off as damage states |
| **Lolli Twirler** | zoner | NO ARMS (Red); spin-up telegraph → drifting spiral sweep |
| **Gumdrop** | hopper | warned hop arcs; splits into 2 minis on death |
| **Cotton Drift** | slow cloud | drifts at player; sticky slow aura on contact radius |
| **Mint Guardian** | wall | frontal block; telegraphed shield-spin = brief 360° block, then exposed |
| **Mallow Brute** | elite | warned squish-slam circle; splits into 3 mini-mallows at death |
| **Cupcake Mimic** | ambusher | SEALED (Red: frosting flush on wrapper, fang tip at the seam); shimmer warn near → maw opens + chomp |
| **Candy Corn Pack** | flyers | dart formation; warned dart lanes in sequence |

## 5 · Decorations (ALL 20 pass) + tiles (Red: 2 4 7 8 9)

Decor (20): cotton candy tree · gumdrop tree · gingerbread house ·
candy cane fence (DESTRUCTIBLE) · mushroom cottage · lollipop grove ·
frosted peak · marshmallow rocks · candy flowers · choc river bridge ·
soda geyser · sugar cube pile · donut arch · wafer stack · jelly pond ·
candy signpost · melting scoop · peppermint wheel · taffy twist post ·
cupcake cottage.

Tiles (5): #2 peppermint path (main road) · #4 sprinkle meadow (BASE) ·
#7 cookie crumble (outskirt flats) · #8 icing snow (peaks region) ·
#9 gummy floor (boss den). **CHOCOLATE RIVER = scenery water strips
(NOT a ground tile) — impassable, crossable ONLY at the two bridges.**

**PLANNED scene (assets/sugar_scene_plan.png — composed, toroidal, per
Red's concept art):** frosted peaks + icing snow (N ridge, marshmallow
rocks, mint guardians + corn packs) · cotton candy forest (W, gummies/
gumdrops/cotton drifts, lollipop grove) · gingerbread village (E, 3
houses + cupcake cottage + mushroom cottages behind destructible cane
fences; gingerdead men + mimics + lancers) · PEPPERMINT PATH winding
N–S edge-to-edge (jawbreakers roll it; signpost at the crossroads) ·
CHOCOLATE RIVER winding W–E edge-to-edge, 2 cane-railed bridges
(twirlers + brutes on the banks) · soda geysers + jelly pond (SE) ·
cookie crumble flats (corners) · **SUGAR BEAR DEN** (S-center): gummy-
floor clearing ringed by destructible cane fence, DONUT ARCH gateway.

## 6 · SUGAR BEAR (boss — from RED'S CONCEPT ART; final "thats perfect")

**Look (LOCKED, assets/sugar_boss_final.png):** cotton-candy teddy —
pink fluff body, pastel candy armor with MULTI-COLOR gumballs +
jelly beans, RAINBOW GEM centerpiece on the chest, gold-wrapped
lollipop-swirl belly, cherry nose, TWIN PEPPERMINT-SWIRL EARS,
peppermint candy cane in paw, plain pink feet (no stripe pad, nothing
floating between the legs), warm smile — and **GLOWING RED EYES with
halo**. bear160(put,S,o) fully parameterized in
render_sugar_bear_shape.js (bodies: toffee/gummy/stripes/rock/
licorice; weapons: cane/hammer/whip; eyes: friendly/angry/swirl/
button/redglow); FINAL params in render_sugar_boss_final.js.
Title card: **SUGAR BEAR**.

**Kit (LOCKED — boss contract):**
*Phase 1 — THE SWEETHEART (100→50%):*
- **CANE HOOK** — warned hook-line; the crook yanks the player a step
  closer (small displacement, capped).
- **GUMBALL VOLLEY** — plucks gumballs off his armor (armor visibly
  depletes), lobs onto warned circles; dud gumballs may leave a candy
  pickup (TUNE).
- **COTTON SMOTHER** — expanding fluff sector; sticky slow zone.
- **SIGNATURE — BEAR HUG**: big warned grab circle → dodge → he
  stumbles face-first: **×1.5 vented (hurtBoss)**.
*Phase 2 — THE SUGAR CRASH (<50%): eyes blaze, fluff dishevels:*
- Twin cane sweeps (alternating warned arcs).
- **JAWBREAKER SUMMON** — 1–2 jawbreakers roll through on warned lanes.
- **SUGAR RUSH STOMP** — hyper hops, chained warned landing circles.
- **SIGNATURE — CANDY RAIN**: candy hails on warned circles everywhere
  → then a warned wall-to-wall sprint → longest vent, panting.
≤6 scouter hints (drafted): the crook pulls — brace when it glints ·
dodge the gumballs, then EAT them · fluff slows, don't fight in the
cloud · the hug circle is death — leave early · rolling summons follow
the painted lanes · when he pants, he's all yours.
Every source fromBoss=true. NO radial/stream spam.

## 7 · Music + SFX

**"SUGAR RUSH.EXE"** (assets/sugar_theme.wav — **TAKE 1, RED-APPROVED
("ok")**; Red's brief: **fast trance techno + INSANE piano solo +
guitar solo**): 156 BPM, 117 bars = 180.0s, A minor (Am–F–C–G). NO
SLOW INTRO — kick + acid bass + trance arp + hook from bar 0, candy
toy-bell counter-melody. Build → DROP 1 → breather w/ piano teases →
**16-bar INSANE PIANO SOLO** (3-partial chip piano: scale blazes,
32nd cascades, octave-hammer climbs, trills, chromatic sprint) →
4-bar PIANO/GUITAR TRADE-OFF → **16-bar GUITAR SOLO** (0.36-duty
pulse: bends, double stops, THE big held bend) → build 2 → octave-up
FINAL DROP w/ piano hook echo + guitar answers → victory lap → tag
(piano scale, chord, candy bells out). Port via section-composer —
KEEP bar-0 full stack, both solos + the trade-off, the bell
counter-melody, and the duet final drop.
New SFX: candy pickup sparkle + FULL-HEAL chime (distinct, joyful) ·
fence crack/shatter (candy shards) · gummy squish/pop · gingerdead
crack + crawl · lance clash · jawbreaker roll + layer chip ·
twirler whoosh · gumdrop boing + split · cotton sticky loop · mint
shield spin ting · mallow squish-slam + split · mimic maw snap ·
corn dart zips · boss: cane hook whoosh + yank · gumball lobs +
bounces · fluff billow · BEAR HUG slam/stumble · jawbreaker rumble ·
stomp chain · candy rain patter · sprint roar · panting vent.

## 8 · Build order (Opus)

1. art.js: 11 mob draws (twirler armless; mimic sealed w/ open-maw
   attack frame; gingerdead half-crawler; jawbreaker layer states) +
   SUGAR BEAR (bear160 canon + P2 disheveled/blazing-eye variant) +
   20 decor + FENCE break states + 5 tiles + chocolate river strips +
   CANDY PICKUP sprite (sparkling wrapped candy) — port from
   assets/render/*.js.
2. map.js: realm/biome/11 mob rows/boss/dropTable/console unlock +
   SUGAR RUSH.EXE composer + SFX + candyCfg { dropChance ~0.04, heal:
   FULL, despawnMs — TUNE } + fenceCfg (hp/states/regrow — and the
   global destructible-fence retrofit hook).
3. scene.js: layout per scene PNG; river = impassable water strips w/
   bridge crossings; village fences + den ring destructible; wrap.
4. Boss per §6: den arena (fence ring — players CAN break in early!),
   P1/P2 verbs, both signatures + vents, gumball armor depletion
   visual.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m18_sugar_verify.js
   (routing incl. bridge-only river crossing + broken-fence paths ·
   candy drop-rate bounds + full-heal + no-farm exploit check ·
   fence states/regrow · 11 mob mechanics incl. splits [gingerdead
   half, gumdrop minis, mallow x3 — cap total spawns], mimic ambush,
   jawbreaker layers · boss verbs + hug dodge + vents + armor deplete)
   + FULL battery + ?v= bump.

## 9 · unfreeze() shift list preview (full in BUILD_INSTRUCTIONS)

candy[].despawnAt · fence[].regrowAt · gummy lungeAt · gingerdead
slashAt / halfCrawl spawn · lancer chargeAt · jawbreaker rollAt ·
twirler spinAt / spiralAt · gumdrop hopAt · cotton (drift, no clock) ·
mint spinAt / exposedUntil · mallow slamAt · mimic openAt / chompAt ·
corn dart[].at · boss: nextVerbAt / hookAt / volley[].landAt /
smotherAt / hugAt / ventedUntil / sweepAt / summon[].laneAt /
stomp[].at / rain[].at / sprintAt / pantUntil · every _zoneWarn.until.
(Skip Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — roster (11 + art fixes), decor (all 20), tiles
(5 + river-as-scenery), CANDY PICKUPS (full-heal mob drops),
DESTRUCTIBLE FENCES (global rule), SUGAR BEAR from Red's concept
("thats perfect"), scene, theme TAKE 1. Map 12 is build-ready.
