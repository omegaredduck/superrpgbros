# PRODUCT PLAN — MVP → 1.0 (wargamed)

Status: v1.3 (2026-07-12 scope expansion E1–E9 folded in — MECHANICS_MANIFESTO Part 4; M2.1 opened) · Solo dev + Claude · Budget: $0 (all FOSS/CC0)

Companion docs: [MECHANICS_MANIFESTO](MECHANICS_MANIFESTO.md) · [MILESTONES](MILESTONES.md) ·
[ARCHITECTURE](ARCHITECTURE.md) · [ASSET_PIPELINE](ASSET_PIPELINE.md) · [TESTING](TESTING.md) · [EVENT_LOG](EVENT_LOG.md)

---

## 1. Vision & pillars

**Vision:** open a browser tab, dodge a screenful of bullets and bodies for 15 minutes,
and log out with an account that is permanently stronger. No installs, no shop, no grind-for-currency.

Pillars (tie-breakers when features fight):

1. **Fun in 60 seconds** — from opening index.html to shooting a mob: under a minute, every build, forever.
2. **Dodging is the skill, the swarm is the show** — readable bullets, dense hordes, 60fps.
3. **The account always moves forward** — every session ends with some permanent gain (XP, pot, gear, unlock).
4. **Solo-first, multiplayer-shaped** — sim/presentation seam from day one (ARCHITECTURE.md).

## 2. The wargame — three courses of action, evaluated

**COA-A: "VS clone first, bolt on RotMG later."** Build wave spectacle + level-up choices, add
persistence at the end. *War-gamed outcome:* persistence bolted on last collides with every balance
number; permadeath retrofitted onto a game tuned for run-resets feels punitive. The pivot the user
explicitly wants (progression) arrives last and riskiest. **REJECTED.**

**COA-B: "RotMG spine first, VS pressure second."** Build nexus → portal → realm → persistent ranger →
chaser/shooter mobs → death → nexus loop at LOW density. Then crank the wave director until it feels
like Survivors. *War-gamed outcome:* the risky fusion question ("does persistent progression + horde
pressure feel good?") is answered by ~M2 with tiny sunk cost; density is a tuning knob, not an
architecture. Matches the user's own MVP instinct (nexus + ranger + level with both mob types). **SELECTED.**

**COA-C: "Parallel tracks."** Progression systems and combat feel developed side by side.
*War-gamed outcome:* viable for a team; for a solo dev it means two half-systems and no playable
game for weeks. Violates Pillar 1. **REJECTED.**

### Red-team pass on COA-B (attack the chosen plan)

| Attack | Where it hurts | Counter built into this plan |
|--------|----------------|------------------------------|
| "Low-density RotMG slice isn't fun, dev morale dies" | M1–M2 | Skeleton ships with the juice basics (hitflash, knockback, screenshake, damage numbers) from day one — cheap in Phaser, huge for feel |
| Art pipeline stalls (user can't make art) | Every visual milestone | Placeholder-first rule: EVERY feature ships with procedural placeholder art; real CC0 assets are swapped in batches at M3/M5, never block a mechanic. Blender MCP is a bonus lane, not a dependency (ASSET_PIPELINE.md) |
| Scope creep toward MMO features | M4+ | Fusion Laws + "Explicitly OUT" list in the manifesto; anything not tracing to a law goes to icebox |
| Permadeath makes solo playtesting miserable | M2 | Q1 default + dev-mode god flag; casual toggle is a pre-designed escape hatch |
| Solo-dev burnout / project abandonment | Anytime | Milestones sized ≤ 2 weekends each; every milestone ends PLAYABLE; EVENT_LOG makes progress visible |
| Phaser 4 (released spring 2026) tempts a mid-project migration | M2–M4 | Locked: Phaser 3.x for the whole 1.0. Phaser 4 migration is a post-1.0 line item. No relitigation. |
| Browser perf collapses at horde density | M3 | Perf gate in TESTING.md: 300 mobs + 200 projectiles at 60fps desktop; object pooling from M0 (already in skeleton) |
| Multiplayer retrofit later requires rewrite | Post-1.0 | Seam rules in ARCHITECTURE.md are enforced from the skeleton onward |

## 3. Tech stack (locked)

- **Engine:** Phaser 3 (3.90.x line), vendored in `game/lib/` with a CDN fallback. Phaser 4 shipped
  in 2026 but 3.x has a decade of docs, tutorials, and AI familiarity — highest velocity for this
  team. Migration is post-1.0 at most.
- **Language:** plain JavaScript, ES5-style script files, **no build step** — double-click `index.html`
  and it runs (procedural textures avoid file:// CORS). A tiny `START_SERVER.bat` exists for when real
  asset files arrive (file-based tileset images need http). TypeScript is a considered-and-deferred option.
- **Map builder:** an **IN-GAME map builder** — a developer-tool scene inside the game itself
  (decision 2026-07-11 replaced the earlier Tiled plan; no external editor to learn). Tile palette
  from procedural (Claude-generated) tilesets AND imported images (png/jpg/gif/webp/bmp), painted
  layers + spawn objects, JSON maps the realm loader reads. This is the user's "map builder with a
  tile set." Built at M3. (ASSET_PIPELINE.md §3.)
- **Data-driven design:** mobs, weapons, classes, realms defined in `js/data.js` (pure data objects).
  Balancing = editing numbers, not code.
- **Persistence:** `localStorage` saves — **3 independent slots behind a welcome/title screen**
  (decision 2026-07-11; LANDED at M0.5). Each slot is a full account (character, vault, graveyard,
  records). Versioned schema v1 from day one; export/import-as-file buttons at M6 so saves survive
  browser resets.
- **Testing:** headless module tests in Node for the sim layer + manual test checklists (TESTING.md).
- **Version control:** the existing `.bat` git workflow in this folder, unchanged.

## 4. MVP definition (= Milestone M2, "First Fun")

Exactly the user's stated slice, made concrete — DONE when all boxes tick:

- [x] Nexus scene: safe zone, no spawns, portal visible, vault chest present (visual only OK) — M0
- [x] Walk into portal → realm loads — M0
- [x] Default **Ranger**: WASD move, mouse aim, auto-fire toggle, SPACE ability (MP volley) — M0/M1
- [x] **Chaser mobs** (contact damage, pursue player) — slime + brute — M0
- [x] **Shooter mobs** (single-shot spitter + 3-spray warlock) — M0
- [x] Wave director: spawn budget escalates over realm timer — M0
- [x] XP → levels 1–20 with auto stat growth; HP/MP/XP bars on HUD — M0
- [x] Death → character lost (permadeath per Q1), death recap screen → nexus with fresh level-1 Ranger — M0.5/M1
- [x] Kill quota → boss portal → The Grovekeeper → realm close reward (stat potion + XP) — M2, 2026-07-11
- [x] Save/load account via localStorage — landed early at M0.5 (3 slots + title screen); schema v2 at M2
- [ ] Runs 60fps with 150 mobs on a mid-range PC in Chrome/Edge/Firefox ← measure with F3 during Fun Gate 1

**The skeleton delivered with this plan already covers ~70% of these boxes** (see §7).

## 5. Road to 1.0 — full scope

**1.0 = "the complete solo game":** 3 classes (Ranger/Wizard/Knight) with unlock chain ·
6-stat system with potion maxing · equipment T0–T6 across 4 slots + nexus vault · 3 realm biomes
(map-builder-built) with distinct, biome-attached mob rosters (E7) · 2 dungeons (portal drops from elites) ·
3 realm bosses + 2 dungeon bosses, each with a scouter workup sheet (E3) · **affix engine** (E9): procedural
mob affixes (Tanky, Speedy, Projectiles Split, Evolutions, Role Distribution) + map affixes rolled at the
portal (Apex Predators, Escalating Threats, Hordes) · breakables + SPACE-opened loot chests with a
PoE2-style selection overlay (E1/Q6) · nexus portal plaza as the travel structure (E5) · alternative stage
objectives incl. 5-min time-trial survival (E6/Q8) · Diablo-style orb HUD (E4) · temp realm-buff picks
(F6, if Q5 passes) · graveyard & records page · settings (volume, screenshake, casual-mode if Q1 demands) ·
CC0 art pass + SFX pass · save export/import. **No shop. No multiplayer (but seams intact).**

## 6. Milestone ladder (tracked in MILESTONES.md)

| M | Name | Contents (compressed) | Exit gate |
|---|------|----------------------|-----------|
| M0 | **Skeleton** ✅ | This session's build: nexus, portal, realm, ranger, chasers, shooters, XP/levels, death loop, pooling, HUD | Boots from double-click; core loop playable |
| M0.5 | **Welcome screen & saves** ✅ | Title screen, 3 independent save slots (full accounts), versioned schema, autosave, permadeath-written-at-death, corrupt-save handling | Headless TM-4 suites green; save survives reload |
| M1 | **Feel pass** | Tune movement/fire-rate/knockback; juice pass (hitstop, flash, particles, damage numbers, SFX via jsfxr); auto-fire toggle; pause | Self-test: "I voluntarily played 3 realms" |
| M2 | **First Fun = MVP** | Boss + kill-quota realm closure, stat potions, permadeath recap polish + graveyard, death recap | FUN GATE 1 (TESTING.md): outside tester plays 20+ min unprompted, asks a progression question |
| M3 | **World, loot & map builder** | IN-GAME map builder (dev tool: procedural + imported tilesets, paint layers, JSON maps) + first real tileset realm; equipment drops T0–T3 + 4 slots + vault; elite mobs; XP gems trial (Q3); realm-buff picks (Q5); CC0 mob/hero sprites batch 1 | Loot chase observable: tester banks an item in the vault and goes back out; a builder-made realm is playable |
| M4 | **Roster** | Wizard + Knight classes, unlock chain, per-class stat caps, class select in nexus; balance pass across 3 | Each class beats realm 1 boss; testers disagree about which is best (= real variety) |
| M5 | **Content ramp** | Biomes 2–3, dungeons 1–2 (portal drops), bosses 2–5, T4–T6 gear, mob roster to ~12, breakables/chests, Blender-MCP hero/boss sprite experiments | FUN GATE 2: 3 testers, median session ≥ 30 min, ≥1 death that produces "one more run" not a quit |
| M6 | **1.0 polish** | Settings, save export/import, records page, audio pass, perf pass (300/200@60), full CC0 credit sweep, README player guide, tag `v1.0` | 1.0 checklist 100%; zero P0 bugs for a week of play |

Sizing: each milestone ≈ 1–2 weekends of solo work with Claude assistance. No calendar dates on
purpose — for-fun project; the ladder orders work, the EVENT_LOG proves motion.

## 7. What exists after this session (M0 deliverable)

Playable skeleton (see README for controls): Boot→Nexus→Realm scene flow, procedural pixel-art
placeholders for everything, ranger with aimed auto-fire + volley ability, chaser + shooter mobs with
escalating wave director, XP/level/stat growth, death → nexus loop, object pooling, HUD, and the
sim/presentation seam already respected. Plus this full documentation suite.

## 8. Multiplayer posture (future-proofing, not building)

Per F10 and user intent: 1.0 ships solo. The protective moves made NOW, costing near-zero:
entity state as plain data objects · all gameplay mutation flows through systems that take
`(state, dt, intents)` · no `Math.random()` in sim without going through the seeded `rng()` ·
rendering reads state, never owns it · IDs on every entity. Post-1.0 path: Node + WebSocket
authoritative server reusing `data.js` + sim systems. Details in ARCHITECTURE.md §4.

## 9. Risk register (live — review at every milestone)

| # | Risk | L | I | Mitigation | Trigger to act |
|---|------|---|---|-----------|----------------|
| 1 | Fusion isn't fun (pressure + permadeath = frustration) | M | H | Fun Gate 1 at M2; Q1 casual toggle pre-designed | Testers quit after first death |
| 2 | Art wall (nothing looks good enough to motivate) | M | M | Placeholder-first rule; CC0 batches at M3/M5; Blender MCP lane | Dev avoids opening the project |
| 3 | Perf at density | L | H | Pooling from M0; perf gate in TESTING.md | <50fps at 200 mobs |
| 4 | Scope creep | H | M | Fusion Laws + icebox; milestone exit gates | Any "while I'm at it…" PR |
| 5 | Save-wipe rage (localStorage cleared) | M | M | Export/import at M6; warn in README | First real progress lost |
| 6 | Solo burnout | M | H | ≤2-weekend milestones, always-playable rule | 3 weeks without an EVENT_LOG entry |

---

*This plan was written, then re-checked against the original project request and iterated once
(recursion pass logged in EVENT_LOG.md entry 2026-07-11). Alignment table lives in §10.*

## 10. Alignment table — original request → where it's honored

| The ask (paraphrased) | Where |
|----------------------|-------|
| Survivors-style game, not roguelite | Manifesto Part 1 (V8 DROPPED), Fusion Law F4 |
| RotMG-style progression | Manifesto Part 2 → F4–F8; M2–M5 |
| PC game, play/test in browser | §3 stack: Phaser 3, no build step, double-click to run |
| No art/animation/VFX skill | ASSET_PIPELINE.md: placeholder-first + CC0 + Blender MCP; "no hand animation" rule in manifesto OUT-list |
| Map builder with tileset | IN-GAME map builder at M3 — procedural + imported tilesets (§3, ASSET_PIPELINE.md §3; decision 2026-07-11 replaced Tiled) |
| Welcome screen with save slots | LANDED M0.5 (2026-07-11): title screen, 3 slots, versioned saves (ARCHITECTURE.md §6) |
| Open-source assets allowed/incorporated | ASSET_PIPELINE.md §2 + credits file |
| Blender MCP integration plan | ASSET_PIPELINE.md §4 (render-to-spritesheet lane) |
| Can Claude make assets? | ASSET_PIPELINE.md §5 — yes: procedural sprites, palettes, SFX; quality lane = CC0 packs |
| MVP: nexus, spawn to world, default ranger, level with chasers + projectile mobs | §4 MVP definition, M0 skeleton |
| 1.0 plan encompassing MVP | §5 + §6 ladder (MVP = M2, strictly contained in 1.0) |
| Playtesting for fun alignment | TESTING.md §3 fun gates; wired to M2/M5 exits |
| Modules for testing | TESTING.md §2 test modules per system |
| Milestones ABSOLUTELY tracked | MILESTONES.md tracker + gates here |
| Documentation | This suite (7 docs) + README |
| Event log of features | EVENT_LOG.md, entry format defined |
| Mechanics manifesto for both games | MECHANICS_MANIFESTO.md Parts 1–3 |
| Wargamed strategy | §2 COAs + red-team pass |
| Solo for fun, no shop | Pillars, OUT-list, F4 |
| Multiplayer maybe later — design for it | F10, §8, ARCHITECTURE.md §4 |
| Recursion/iteration pass | §10 itself + EVENT_LOG 2026-07-11 entry |

### §10b — 2026-07-12 emergent directive → where each ask is honored

| The ask (paraphrased) | Where |
|----------------------|-------|
| SPACE opens chests, PoE2-style item-selection overlay | E1 — Part 4 of the manifesto; live at M2.1 (boss chest), equipment loot at M3; SPACE conflict resolved contextually (Q6) |
| Simplify boss room access (limit mobs / mob destruction screen) | E2 — mob-destruction wipe on portal open (Q7); quota remains the Q4 knob |
| DBZ scouter boss workup sheet (stats, visual, moveset hints) | E3 — live at M2.1, data-driven per boss (`DATA.bosses.*.hints`) |
| Diablo-style HP/mana orb HUD flanking the action bar | E4 — live at M2.1 |
| Nexus portal display structure / portal opener | E5 — portal plaza at M2.1; realms/map-affixes plug in at M5 |
| Alternative objectives, 5-min time-trial survival | E6 — live at M2.1 (Q8) |
| Mob variants attached to dedicated biomes | E7 — `DATA.biomes` at M2.1; biomes 2–3 populate it at M5 |
| Archer bow renders toward aim direction | E8 — fixed at M2.1 (TM-1 item added) |
| Affix engine: map + mob modifier archetypes | E9 — engine + Tanky/Speedy at M2.1; full mob set M3; map affixes M5 |
