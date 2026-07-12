# ASSET PIPELINE — art without being an artist

> Constraint accepted as a design input: no hand-drawn art, no hand animation, no hand VFX — ever.
> Four lanes cover everything. Every lane ends in a PNG (or JSON) the game loads; the game never
> knows or cares which lane produced it.

## 1. Lane A — Procedural placeholders (ACTIVE, lane of record until M3)

Claude generates pixel-art sprites in code: character grids → canvas textures at boot
(see `game/js/textures.js`). Zero files, zero licenses, works from file://, instantly editable.
**Rule: every new mechanic ships FIRST with a Lane-A placeholder.** Art never blocks gameplay.

What Claude can produce directly (answering the "can you make the assets?" question):
- ✅ Pixel sprites & tiles (this skeleton's entire look), palettes, UI, icons
- ✅ Animation *effects* without animation: flip, squash/stretch tweens, hit-flash, particles,
  screenshake, knockback — the whole "juice" layer is code, and code is covered
- ✅ SFX: generated chiptune-style effects (ZzFX/jsfxr, tiny JS, no audio files needed)
- ✅ Music: loopable chiptune via code (post-M5, optional)
- ⚠️ Quality ceiling: "charming programmer pixel art." For hero/boss showpieces, use Lanes B/C.

## 2. Lane B — Open-source / CC0 packs (primary quality lane, batches at M3 & M5)

| Source | What to take | License |
|--------|--------------|---------|
| **kenney.nl** ("Asset Jesus") | Tiny Dungeon / Pixel Platformer / RPG packs: tiles, props, UI, characters | CC0 |
| **0x72.itch.io** — DungeonTileset II | The classic 16×16 dungeon set: floors, walls, heroes, mobs | CC0 |
| **itch.io** game assets, filtered CC0/free | mob packs, effects sheets (search: "16x16 CC0 monsters") | per-pack — verify |
| **opengameart.org** | gap-filling (potions, icons, bullets) | prefer CC0; CC-BY needs credit |

*(Tiled/mapeditor.org was listed here as the map tool — retired 2026-07-11 in favor of the
in-game map builder, Lane C below. CC0 tileset images from these sources feed the builder's
Import button instead.)*

Rules: 16×16 grid, one palette family per biome (mixing packs is the #1 amateur tell —
recolor to a shared palette with a script if needed). **Every import gets a line in
`ASSET_CREDITS.md` (file, source URL, license) the same day it lands.** CC-BY credit text
goes in the README credits section at M6 sweep.

## 3. Lane C — IN-GAME MAP BUILDER ✅ SHIPPED 2026-07-12 (`builder.js` + `maps.js`)

> DECISION 2026-07-11: Tiled (external editor) is retired — user wants the map
> builder to be a developer tool INSIDE the game itself, no external tool to learn.

The builder is a scene in the game — press **M in the nexus** (dev tool, not the
player flow). As shipped:

1. **Tile palette** from two sources, both live:
   - Procedural tilesets in code (Lane A — `DATA.tilesets`: grasslands + stonehold,
     17 tiles in textures.js; TILESET ⟳ cycles the palette);
   - **IMPORT TILES button**: loads a tileset image from disk — png, jpg, gif, webp,
     or bmp — sliced to the 16×16 grid in-browser and **EMBEDDED in the map JSON as
     pixel rows**, so exported maps are self-contained and everything keeps working
     from file://. Every imported image gets its line in `ASSET_CREDITS.md` the day
     it lands (the builder's status line reminds you).
2. **Paint tools**: brush (B) / erase (E) / rectangle fill (R) across layers `ground`,
   `walls` (collision — blocks movement AND shots in the realm), `decor`, plus the
   object layer (keys 1–4): player start (click), mob spawn zones (drag — they steer
   the wave director), boss arena (drag — the boss portal delivers the fight there).
3. **Save/load**: maps serialize to JSON v1 in localStorage `srb_maps` (via `maps.js`
   only — same access rule as account saves) + EXPORT/IMPORT as a .json file; the
   realm loader consumes the identical JSON. Built-in `realm1` ships in code; a saved
   map under the same id overrides it. PLAYTEST ▶ jumps straight into the painted map.

Note on http: NOT needed for maps — imported tiles are embedded, so double-click
file:// stays fully supported. `START_SERVER.bat` remains for future file-based
sprite/atlas batches (Lanes B/D at M5).

## 4. Lane D — Blender MCP → sprite sheets (the integration plan, experiment at M5)

You have Blender MCP; Claude can drive Blender directly. The lane that fits a no-animation-skills
project is **render-to-spritesheet** (3D does the animating, the game stays 2D):

1. **Source models:** CC0/CC-BY rigged low-poly packs — Quaternius (CC0), KayKit (CC0), Kenney 3D.
   No modeling required; Claude imports via MCP script.
2. **Rig/animate:** packs ship with idle/walk/attack clips, or retarget from Mixamo-style clips.
   Claude handles retargeting scripts via MCP; you never touch a keyframe.
3. **Camera jig (Claude-written, reusable `.py` in `tools/blender/`):** orthographic camera at the
   game's top-down-ish angle; render N frames × 4 or 8 facing directions at 64–128px, transparent bg.
4. **Pack:** Claude stitches frames into a sprite sheet + writes the Phaser atlas JSON.
5. **Import:** drops into `game/assets/sprites/` like any Lane-B file.

When to use: hero classes and bosses only (highest visual ROI). Never for tiles/props (Lane B is
better) or bulk mobs (too slow per unit). First experiment is a scheduled M5 checklist item — the
pipeline script gets built once and reused. Risk note: this lane is a BONUS; if results look worse
than Lane B pixel packs, we keep pixels with zero schedule damage.

## 5. Folder & naming conventions

```
game/assets/
  sprites/   hero_ranger.png + .json (atlases)      [Lanes B/D]
  tiles/     biome1_dungeon.png                      [Lane B]
  maps/      realm1.json, dungeon_spider.json        [Lane C]
  audio/     (only if we ever leave ZzFX)            [Lane A/B]
ASSET_CREDITS.md   one line per imported file — enforced
tools/blender/     spritesheet_render.py             [Lane D]
```

Lane A assets have no files by definition — they live in `textures.js`.
