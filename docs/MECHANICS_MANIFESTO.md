# MECHANICS MANIFESTO — "Super RPG Bros" (working title)

> The DNA document. Every mechanic in Vampire Survivors and Realm of the Mad God,
> dissected, then fused into ONE coherent design. If a future feature idea doesn't
> trace back to a row in Part 3, it goes to the icebox, not the code.

Status: v1.2 (Part 4 scope expansion added 2026-07-12) · Solo project, fun-first, no shop, no monetization.

---

## Part 1 — Vampire Survivors: mechanic dissection

**What VS actually is:** a horde-pressure game where the player's only moment-to-moment
verb is *movement*, and all depth lives in *build decisions* between waves.

| # | Mechanic | What it does for the game | Verdict for us |
|---|----------|---------------------------|----------------|
| V1 | Movement-only input (weapons auto-fire) | Zero execution barrier; brain free to enjoy the spectacle | **ADAPT** — we add manual aim (see fusion F2), but keep firing frictionless (hold/auto-fire, no clicking per shot) |
| V2 | Horde density / wave director | The core spectacle. Escalating spawn budget over a run timer creates a rising-pressure curve | **TAKE** — this is the half of the fusion VS contributes most |
| V3 | XP gems dropped on kill, magnet pickup | Makes kills *feel* rewarding; risk/reward of walking into the horde to vacuum gems | **TAKE** (MVP uses auto-XP-on-kill for simplicity; gem entities land in M3 — decided in playtest question Q3) |
| V4 | Level-up → choose 1 of 3-4 upgrades | The build-crafting dopamine loop; every run differs | **ADAPT** — choices upgrade the *persistent* character's kit for this realm visit; the permanent stat growth comes from RotMG-side leveling (F4) |
| V5 | Weapon evolutions (max weapon + passive = evolved weapon) | Long-run goal inside a run | **ICEBOX (post-1.0)** — evolution-style upgrades of class abilities |
| V6 | Passive items / stat boosts | Build variety | **ADAPT** — becomes RotMG-style equipment (F5) |
| V7 | Run timer + scheduled events (waves, Death at 30:00) | Structures a session; guarantees an ending | **ADAPT** — realms escalate on a timer, but ending is "close the realm" (kill quota + boss), not a forced Death |
| V8 | Roguelite meta shop (gold → permanent power-ups) | Persistence between runs | **DROP — explicitly.** Replaced entirely by RotMG progression. This is the user's core pivot. |
| V9 | Character unlock roster | Collection goal | **TAKE** — becomes the class-unlock chain (F7) |
| V10 | Breakables (braziers/candles) & chests | Micro-rewards, luck spikes | **TAKE (light)** — breakables in realms, chest on boss kill |
| V11 | Screen-relative danger (enemies spawn just off-screen, despawn behind) | Constant pressure, cheap performance | **TAKE** — spawn ring around camera; hard cap + recycle for perf |
| V12 | Gold & greed stats | Feeds the shop | **DROP** — no shop, no currency in 1.0 |

**VS's soul, one line:** *"The swarm is the spectacle; the build is the game."*

## Part 2 — Realm of the Mad God: mechanic dissection

**What RotMG actually is:** a permadeath bullet-hell MMO where progression is a
*pipeline of characters* through a persistent account, and mastery is dodging.

| # | Mechanic | What it does for the game | Verdict for us |
|---|----------|---------------------------|----------------|
| R1 | Nexus hub (safe zone, portals out) | Home base; breathing room; ritual of "going out" | **TAKE** — literally the user's stated MVP anchor |
| R2 | Portals → realms/dungeons | World structure; difficulty selection by choosing the portal | **TAKE** — MVP: one portal, one realm. 1.0: tiered portals + dungeon drops |
| R3 | Permadeath + account persistence (vault, class unlocks survive) | Stakes. Makes loot *matter* | **ADAPT** — permadeath ON by default (it's the spine of RotMG progression) but this is playtest question **Q1**; a "casual mode" toggle is cheap insurance for a fun-first solo game |
| R4 | 8-stat system (HP/MP/ATT/DEF/SPD/DEX/VIT/WIS) with per-class caps | Long grind with visible ceiling; "maxing" a stat is a milestone | **ADAPT** — 6 stats for 1.0: HP, MP, ATT (damage), DEF (flat reduction), SPD (move), DEX (fire rate). VIT/WIS folded into HP/MP regen baked per class |
| R5 | Stat potions drop from dungeons/events | THE endgame loop: farm → drink → max | **TAKE** — potions drop from realm bosses & dungeon bosses; "maxing" is the 1.0 endgame |
| R6 | Level 1–20 via XP, fast early | Quick on-ramp for each new character | **TAKE** — level 20 cap, stats auto-grow per level, then potions take over |
| R7 | Manual aim (WASD + mouse), enemy bullet patterns, dodging as the skill | The actual skill expression | **TAKE** — this is the half RotMG contributes most to moment-to-moment feel |
| R8 | Equipment: weapon / ability / armor / ring, tiered (T0–T14) | Loot chase; ability item = class identity button | **ADAPT** — 4 slots, tiers T0–T6 at 1.0. Ability item on SPACE (ranger: quiver = piercing volley) costing MP |
| R9 | Class unlock chain (level a class to unlock the next) | Roster progression, replay reasons | **TAKE** — Ranger first; Wizard unlocks at Ranger 20; Knight at Wizard 20 (1.0 = 3 classes) |
| R10 | Fame / stars | Prestige metrics | **ICEBOX** — a simple "graveyard + records" page instead at 1.0 |
| R11 | Gods / event bosses in the realm | Density of danger = density of reward | **ADAPT** — elite mobs + one realm boss at 1.0 |
| R12 | Vault (shared item storage) | Makes permadeath survivable emotionally | **TAKE** — small vault chest in nexus (8 slots at 1.0) |
| R13 | Realm closes when heroes clear it → world boss | Server-wide goal | **ADAPT (solo)** — kill quota opens the boss arena portal; killing boss "closes" the realm, big potion/loot payout, back to nexus |
| R14 | MMO simultaneity | The "MAD" part | **DEFER** — designed-for, not built (see ARCHITECTURE.md seam rules). Post-1.0. |

**RotMG's soul, one line:** *"Loot you can lose, dodging you can master, an account that always moves forward."*

## Part 3 — THE FUSION: what this game actually is

**One line:** *A browser bullet-hell horde game where VS-style swarms pressure a
RotMG-style persistent character — you dodge like Realm, you're swarmed like
Survivors, and your account gets stronger forever without a single shop.*

### The Ten Fusion Laws

| # | Law | Sourced from |
|---|-----|--------------|
| F1 | **The Nexus is home.** Every session starts and ends (or dies) into the nexus. Portals are how you choose danger. | R1, R2 |
| F2 | **WASD moves, mouse aims, firing is frictionless.** Hold LMB or toggle auto-fire; dodging enemy patterns is the skill, never clicking fast. | R7 + V1 |
| F3 | **The swarm escalates on a clock.** Inside a realm, a wave director raises spawn budget over time. Standing still is death; the screen filling up is the spectacle. | V2, V7, V11 |
| F4 | **Progression is the character, not the run.** No roguelite meta-currency, ever. XP → level 20 → stat potions → maxed. Death matters (Q1 governs how much). | R3–R6 replaces V8 |
| F5 | **Loot is equipment, not passives.** 4 slots (weapon/ability/armor/ring), tiered drops from elites and bosses, stored in the nexus vault. | R8, R12 replaces V6 |
| F6 | **In-realm level-ups still offer a choice.** On level-up mid-realm, pick 1 of 3 temporary realm-buffs (e.g. +15% fire rate this realm). Keeps VS's build-dopamine without breaking persistent balance. Post-MVP (M3). | V4, scoped by F4 |
| F7 | **Classes are the roster.** Ranger → Wizard → Knight unlock chain. Each = weapon archetype + SPACE ability + stat caps. | R9 + V9 |
| F8 | **Realms end; the account doesn't.** Kill quota → boss portal → boss kill → realm closes → guaranteed stat potion + loot chest → nexus. A "run" is 10–20 minutes with a real ending. | R13 + V7 |
| F9 | **Two mob verbs minimum, forever: CHASE and SHOOT.** Every enemy is built from chaser DNA (pressure your position) and/or shooter DNA (deny your space). All future mobs are combos/elaborations (orbiting, splitting, turret, spiral-shooter…). | V2 + R7, user's explicit MVP ask |
| F10 | **Solo-first, multiplayer-shaped.** No feature may assume "exactly one player" in the sim layer. Entity state is plain data; input is intents. The wire can come later without a rewrite. | R14, user's stated future desire |

### Explicitly OUT (so they stay out)

Shop/monetization/currency (user mandate) · roguelite meta-upgrades (V8) · forced run-ending Death (V7) ·
fame/stars (R10) · trading/market (needs multiplayer) · pets · crafting · anything requiring
hand-made animation beyond flip/flash/particles (user constraint: no art skills — see ASSET_PIPELINE.md).

### Open design questions → answered by playtest, not by argument

| Q | Question | Default until data says otherwise | Test at |
|---|----------|-----------------------------------|---------|
| Q1 | Permadeath: full RotMG (character gone) vs. softened (drop carried gear, keep character)? | Full permadeath, vault protects stored gear. If playtests show rage-quits > "one more run", add casual toggle. | M2 fun gate |
| Q2 | Auto-fire default ON or hold-to-fire? | Auto-fire toggle (T key), default ON. | M1 |
| Q3 | XP: auto-on-kill (RotMG) vs. gem pickups (VS)? | Auto for MVP (cheaper); gems trialed at M3 for the magnet-vacuum joy. | M3 |
| Q4 | Realm length target? | 12 min to boss-portal at competent play. | M2 fun gate |
| Q5 | Do temp realm-buffs (F6) dilute the RotMG identity? | Ship at M3 behind a flag; keep if testers call the mid-realm level-up "a moment". | M3 fun gate |
| Q6 | SPACE is the ability key (F2) AND now the interact key (E1). Contextual (interact wins near a chest) or split keys? | Contextual: within interact range SPACE interacts, otherwise fires the ability. If testers waste volleys at chests (or the reverse), move interact to E. | M2 fun gate / self-test |
| Q7 | Boss-room access (E2): mob-destruction wipe when the portal opens, vs. strictly cutting the kill quota? | Wipe: opening the boss portal ANNIHILATES the live swarm and stands the director down — the run-up to the boss room is always clear. killQuota stays the Q4 knob. | M2 fun gate |
| Q8 | Time-trial survival (E6): is 5:00 with a guaranteed potion the right ride? | 5:00, boss-free, survive to win, guaranteed random stat potion + reduced XP bonus. | Fun Gate 1/2 |

## Part 4 — Scope expansion of 2026-07-12 (the "emergent critical task")

> User directive. Nine features enter the scope. Each is traced to the laws
> above (the DNA rule holds — nothing here needed a new law; E9 comes closest
> and is scoped as an elaboration of R11/V2). Placement on the ladder lives in
> MILESTONES.md; engine design notes in ARCHITECTURE.md §7.

| # | Feature | What it is | Traces to | Lands at |
|---|---------|------------|-----------|----------|
| E1 | **Loot chest mechanics** | SPACE interacts/opens chests; a PoE2-inspired item-selection overlay lists the contents and you take what you want. First real chest: the boss drops one (replaces the auto-award). | V10, F5, F8 | M2.1 (potion loot) → M3 (equipment loot) |
| E2 | **Boss room access** | Clear the run-up: when the boss portal opens, a mob-destruction wipe annihilates the live swarm and the wave director stands down (Q7). Quota itself stays tunable (Q4). | F8, F3 | M2.1 |
| E3 | **Boss intro "scouter" UI** | Entering the boss room triggers a DBZ-scouter workup sheet: raw stats, a visual readout of the boss, and tactical hints per attack pattern. Combat holds until the scan is dismissed. | R7, F8, Pillar 2 (readable danger) | M2.1 |
| E4 | **HUD overhaul** | Diablo-style resource orbs — HP and MP globes flanking a central action bar (ability + XP). | Pillar 2 (presentation only — sim untouched) | M2.1 |
| E5 | **Nexus travel mechanics** | A dedicated portal plaza in the nexus: a pedestal per destination (realm, time trial, sealed future realms), each displaying name/biome/mode. This is the portal display structure future realms and map affixes plug into. | F1, R2 | M2.1 (structure) → M5 (more realms) |
| E6 | **Stage objectives & modes** | Alternative objectives beyond mob-clearing; first mode: 5-minute time-trial survival (no boss, survive to win, potion reward — Q8). | V7 adapted, F8 ("a run has a real ending") | M2.1 |
| E7 | **World design & spawning** | Mob variants/archetypes attach to dedicated biomes (a biome = roster + palette + realm identity). The wave director reads the biome roster, not the global mob list. | F9, R2 | M2.1 (data structure) → M5 (biomes 2–3) |
| E8 | **Weapon fix (Archer)** | Bow rendering: the bow sprite now exists, is held by the Ranger, and dynamically aligns to the side/direction being aimed — body facing follows aim, not movement. | F2, TM-1 | M2.1 |
| E9 | **Modifier systems (affixes)** | A data-driven affix engine, two halves. **Mob affixes** (procedural champion/elite modifiers): Tanky, Speedy, Projectiles Split, Evolutions (% chance to mutate mid-fight), Role Distribution (more casters / more melee). **Map affixes** (zone-wide modifiers rolled at the portal): Apex Predators (double boss), Escalating Threats (elite spawn rate), Hordes (high spawn density). | R11, V2, R2 (portal = difficulty choice) | M2.1 (engine + Tanky/Speedy live) → M3 (full mob set — absorbs the old "elite mobs" item) → M5 (map affixes on the portal plaza) |

E9 note: affixes are data in `data.js` like everything else — an affix is a bag of
multipliers/flags applied at spawn (mob) or at realm entry (map). The "elite mob
modifier" from the old M3 list is now the affix engine's first consumer, not a
separate system.

---

*Change process: edit this file → log it in EVENT_LOG.md → if a Fusion Law changes, bump the version.*
