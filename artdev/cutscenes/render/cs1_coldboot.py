#!/usr/bin/env python3
"""CS1 — COLD BOOT (~40s). The crash + the draft. SILENT until the Chamber
(Red's call 2026-07-17): type ticks + FAIL buzzes only.
Beats verbatim from docs/STORY.md §2–§3."""
import random
from PIL import Image, ImageDraw
from cutscene_kit import (W, H, Reel, canvas, text, text_w, center_text,
                          scanline_bars, skip_hint, server_hall, chamber,
                          figure, BG, WHITE, CYAN, CYAN_D, RED, GOLD, GREY,
                          GREY_D, GREY_DD)

TERM_GREEN = (110, 190, 140)   # 6ebe8c boot-log body
TERM_DIM   = (52, 88, 68)      # 34584 4 dim scroll blur

def term(v=0, shiver=0):
    img = canvas((6, 8, 10))
    scanline_bars(img)
    if shiver:
        pass  # shiver applied by caller offset
    return img

# ---------------------------------------------------------------- shot 1.1
def cursor_blink(r):
    for i in range(6):
        img = term()
        if i % 2 == 0:
            d = ImageDraw.Draw(img)
            d.rectangle([12, 20, 17, 29], fill=TERM_GREEN)
        skip_hint(img)
        r.add(img, 350)

# ---------------------------------------------------------------- shot 1.2
FAST_LINES = ["mount /dream/%02d ... ok" , "sync shard %04x", "gc heap %d%%",
              "relink bus %02d", "checksum %08x", "wake vector %04d"]

def fast_scroll(r):
    rng = random.Random(11)
    for f in range(10):
        img = term()
        d = ImageDraw.Draw(img)
        for row in range(14):
            y = 12 + row * 10 - (f * 7) % 10
            s = FAST_LINES[rng.randrange(len(FAST_LINES))]
            try:
                s = s % rng.randrange(9999)
            except TypeError:
                pass
            ok = rng.random() < 0.6
            text(img, (10, y), s + ("" if ok else "  ...FAIL"),
                 TERM_DIM if ok else (120, 50, 50), 7)
        skip_hint(img)
        r.add(img, 90)

SLOW_LOG = [
    ("MOUNTING GLOBAL CONSCIOUSNESS", "FAIL", RED),
    ("SLEEPERS LINKED: 8,204,551,300 ", "SIGNAL LOST", RED),
    ("subsystem [DREAM-01 ... DREAM-20] ", "CORRUPTED", RED),
    ("integrity check ", "FAILED", RED),
    ("", "FAILED", RED),
    ("", "FAILED", RED),
]

def slow_log(r):
    """Types each line; FAIL word slams in red with a 1px shiver frame."""
    done = []
    y0 = 26
    lh = 12
    for li, (body, fail, fc) in enumerate(SLOW_LOG):
        # type the body
        i = 0
        while i < len(body):
            i = min(len(body), i + 3)
            img = term()
            _draw_log(img, done, body[:i], None, y0, lh, li)
            skip_hint(img)
            r.add(img, 110)
        # beat
        img = term()
        _draw_log(img, done, body, None, y0, lh, li)
        r.add(img, 260 if body else 120)
        # FAIL slams in + shiver (draw shifted 1px)
        img = term()
        _draw_log(img, done, body, (fail, fc), y0, lh, li, shiver=1)
        r.add(img, 90)
        img = term()
        _draw_log(img, done, body, (fail, fc), y0, lh, li)
        r.add(img, 420 + li * 60)
        done.append((body, fail, fc))
    # hold the full log
    img = term()
    _draw_log(img, done, None, None, y0, lh, len(SLOW_LOG))
    r.add(img, 900)
    return img

def _draw_log(img, done, cur_body, cur_fail, y0, lh, li, shiver=0):
    ox = shiver
    for k, (b, f, fc) in enumerate(done):
        y = y0 + k * lh
        text(img, (10 + ox, y), b + "... ", TERM_GREEN, 8)
        text(img, (10 + ox + text_w(b + "... ", 8), y), f, fc, 8)
    if cur_body is not None:
        y = y0 + li * lh
        text(img, (10 + ox, y), cur_body + ("... " if cur_fail else ""),
             TERM_GREEN, 8)
        if cur_fail:
            f, fc = cur_fail
            text(img, (10 + ox + text_w(cur_body + "... ", 8), y), f, fc, 8)

# ---------------------------------------------------------------- shot 1.3
def lone_line(r):
    for i in range(3):
        img = term()
        r.add(img, 220)
    s = "> spawning caretaker process"
    i = 0
    while i < len(s):
        i = min(len(s), i + 2)
        img = term()
        center_text(img, 76, s[:i], CYAN, 8)
        skip_hint(img)
        r.add(img, 120)
    for i in range(5):
        img = term()
        center_text(img, 76, s, CYAN, 8)
        if i % 2 == 0:
            d = ImageDraw.Draw(img)
            lx = (W + text_w(s, 8)) // 2 + 3
            d.rectangle([lx, 76, lx + 5, 84], fill=CYAN)
        r.add(img, 320)

# ---------------------------------------------------------------- shot 1.4
def dying_hall(v):
    img = server_hall(v, dying=True, standing=True, seed=13)
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 1.5
def filament(r):
    """The light wakes deep in the hall and flies at the figure's neck."""
    # positions along a path from deep-center to the figure (120,108ish)
    path = [(120, 60), (117, 70), (114, 79), (117, 86), (119, 91)]
    for k, (px, py) in enumerate(path):
        img = server_hall(k, dying=True, standing=True, seed=13)
        d = ImageDraw.Draw(img)
        # trail
        for j in range(max(0, k - 2), k):
            tx, ty = path[j]
            d.point((tx, ty), fill=CYAN_D)
        d.ellipse([px - 2, py - 2, px + 2, py + 2], fill=WHITE)
        d.point((px, py), fill=CYAN)
        scanline_bars(img); skip_hint(img)
        r.add(img, 160 if k < len(path) - 1 else 90)
    # impact spark at the neck
    img = server_hall(1, dying=True, standing=True, seed=13)
    d = ImageDraw.Draw(img)
    for a in ((-3, -3), (3, -3), (-3, 3), (3, 3), (0, -4), (0, 4)):
        d.point((119 + a[0], 91 + a[1]), fill=WHITE)
    d.ellipse([116, 88, 122, 94], fill=CYAN)
    scanline_bars(img); skip_hint(img)
    r.add(img, 120)

# ---------------------------------------------------------------- shot 1.6
PROMPT = ["caretaker online.", "20 regions corrupted.",
          "purge to relink.", "// begin"]

def chamber_wake(r):
    white = canvas((240, 244, 248))
    r.add(white, 90)
    r.add(canvas((160, 200, 210)), 60)
    base = lambda v: _chamber_framed(v)
    r.fade(canvas((160, 200, 210)), base(0), steps=3, ms=100)
    r.hold(base, 1.4, anim_ms=450)
    # prompt types, line by line, cyan, lower third + wall screen glows
    shown = []
    v = 0
    for li, s in enumerate(PROMPT):
        i = 0
        while i < len(s):
            i = min(len(s), i + 2)
            img = _chamber_framed(v); v += 1
            _prompt_lines(img, shown + [s[:i]])
            r.add(img, 130)
        shown.append(s)
        img = _chamber_framed(v); v += 1
        _prompt_lines(img, shown)
        r.add(img, 420)
    # // begin blinks
    for i in range(6):
        img = _chamber_framed(v); v += 1
        _prompt_lines(img, shown[:-1] + ([shown[-1]] if i % 2 == 0 else [""]))
        r.add(img, 340)

def _chamber_framed(v):
    img = chamber(v)
    d = ImageDraw.Draw(img)
    # wall screen alive now
    d.rectangle([162, 42, 230, 94], fill=(10, 26, 24))
    for ly in range(46, 92, 6):
        d.line([(166, ly), (166 + (ly * 7) % 56, ly)], fill=(24, 60, 52))
    scanline_bars(img); skip_hint(img)
    return img

def _prompt_lines(img, lines):
    y0 = H - 14 - 11 * len([l for l in lines if l]) - 2
    y0 = min(y0, 112)
    k = 0
    for s in lines:
        if not s:
            k += 1
            continue
        center_text(img, 112 + 0 + k * 11, s, CYAN, 8)
        k += 1

# ---------------------------------------------------------------- assemble
def main():
    r = Reel()
    cursor_blink(r)
    fast_scroll(r)
    slow_log(r)
    lone_line(r)
    # cut to the hall
    blk = term()
    r.add(blk, 400)
    r.fade(blk, dying_hall(0), steps=3, ms=120)
    r.hold(dying_hall, 2.2, anim_ms=420)
    r.type_on(dying_hall,
              ["THE LAST DEFENSE NEEDS A CLEAN MIND TO RUN ON.",
               "THERE WAS EXACTLY ONE LEFT."],
              seconds_after=1.4, y0=126, anim_ms=220, px=7)
    filament(r)
    chamber_wake(r)
    path = r.save("/home/claude/cutscenes/assets/cs1_coldboot_preview.gif")
    print("saved", path, len(r.frames), "frames")

if __name__ == "__main__":
    main()
