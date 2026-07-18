#!/usr/bin/env python3
"""cutscene_kit.py — shared pixel-cutscene render framework (design previews).

Design res 240x160 (3:2), integer upscale, crisp thresholded mono text,
typewriter sequencing, GIF assembly with per-frame durations.
Palette matches the shipped game art (near-black bg, cyan system text,
red FAILs, gold titles). Preview-only: the build session re-implements
these shots in cutscene_art.js frame-for-frame.
"""
from PIL import Image, ImageDraw, ImageFont
import random

W, H = 240, 160
SCALE = 3  # preview upscale (720x480)

# ---- palette (6-digit hex ALWAYS — ranger mix() gotcha carried here too) ----
BG      = (10, 12, 16)      # 0a0c10 near-black
WHITE   = (232, 232, 232)   # e8e8e8 narration
CYAN    = (95, 232, 194)    # 5fe8c2 system text
CYAN_D  = (43, 122, 104)    # 2b7a68 dim cyan
RED     = (232, 69, 69)     # e84545 FAIL
GOLD    = (232, 194, 95)    # e8c25f title cards
AMBER   = (232, 165, 63)    # e8a53f pod warmth
GREY    = (90, 96, 104)     # 5a6068
GREY_D  = (44, 48, 56)      # 2c3038
GREY_DD = (24, 27, 33)      # 181b21
INDIGO  = (26, 22, 48)      # 1a1630 dusk sky
ORANGE  = (200, 90, 40)     # c85a28 dusk horizon
SKIN    = (222, 178, 140)   # deb28c

_font_cache = {}
def _font(px):
    if px not in _font_cache:
        _font_cache[px] = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", px)
    return _font_cache[px]

def text(img, xy, s, color=WHITE, px=8, anchor=None):
    """Crisp (thresholded, no-AA) monospace text."""
    mask = Image.new("1", img.size, 0)
    d = ImageDraw.Draw(mask)
    d.text(xy, s, font=_font(px), fill=1, anchor=anchor)
    img.paste(Image.new("RGB", img.size, color), (0, 0), mask)

def text_w(s, px=8):
    f = _font(px)
    return int(f.getlength(s))

def center_text(img, y, s, color=WHITE, px=8):
    text(img, ((W - text_w(s, px)) // 2, y), s, color, px)

def canvas(color=BG):
    return Image.new("RGB", (W, H), color)

def dither_rect(d, x0, y0, x1, y1, color, step=2, phase=0):
    for y in range(y0, y1):
        for x in range(x0 + ((y + phase) % step), x1, step):
            d.point((x, y), fill=color)

def vgrad(img, y0, y1, c0, c1):
    d = ImageDraw.Draw(img)
    n = max(1, y1 - y0)
    for i, y in enumerate(range(y0, y1)):
        t = i / n
        d.line([(0, y), (W, y)],
               fill=tuple(int(a + (b - a) * t) for a, b in zip(c0, c1)))

def scanline_bars(img):
    """Letterbox bars (the picture already fills 240x160; bars are cosmetic
    top/bottom 10px to sell the cinematic frame)."""
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 9], fill=(0, 0, 0))
    d.rectangle([0, H - 10, W, H], fill=(0, 0, 0))

def skip_hint(img, on=True):
    if on:
        text(img, (W - 62, H - 8), "SPACE > SKIP", GREY_D, 7)

# ---------------------------------------------------------------- sequencing
class Reel:
    """Collects (frame, duration_ms) pairs and writes the GIF."""
    def __init__(self):
        self.frames = []

    def add(self, img, ms):
        self.frames.append((img.convert("RGB"), int(ms)))

    def hold(self, base_fn, seconds, anim_ms=500, nvar=2, post=None):
        """Hold a shot: alternate base_fn(v) variants v=0..nvar-1."""
        total = int(seconds * 1000)
        t = 0
        v = 0
        while t < total:
            img = base_fn(v % nvar)
            if post:
                post(img)
            self.add(img, min(anim_ms, total - t))
            t += anim_ms
            v += 1

    def type_on(self, base_fn, lines, seconds_after=1.2, cps=20,
                px=8, color=WHITE, y0=None, line_h=11, nvar=2,
                anim_ms=250, center=True, cursor=False, tail_blink=True,
                per_line_pause=0.35, x0=8):
        """Typewriter: types `lines` (list of (str,color) or str) over the
        animated base. Then holds with blinking ▼ (or block cursor)."""
        norm = [(l, color) if isinstance(l, str) else l for l in lines]
        if y0 is None:
            y0 = H - 14 - line_h * len(norm) - 10
        # typing frames
        v = 0
        for li, (s, col) in enumerate(norm):
            shown_prev = norm[:li]
            i = 0
            while i < len(s):
                i = min(len(s), i + max(1, int(cps * anim_ms / 1000)))
                img = base_fn(v % nvar); v += 1
                self._draw_lines(img, shown_prev + [(s[:i], col)],
                                 y0, line_h, px, center, x0,
                                 cursor and li == len(norm) - 1 and i < len(s))
                self.add(img, anim_ms)
            # small pause at line end
            img = base_fn(v % nvar); v += 1
            self._draw_lines(img, shown_prev + [(s, col)], y0, line_h, px,
                             center, x0, False)
            self.add(img, int(per_line_pause * 1000))
        # hold with advance cue
        total = int(seconds_after * 1000)
        t = 0
        while t < total:
            img = base_fn(v % nvar); v += 1
            blink_on = (t // 400) % 2 == 0
            self._draw_lines(img, norm, y0, line_h, px, center, x0, False)
            if tail_blink and blink_on:
                if cursor:
                    lx = (W // 2 + text_w(norm[-1][0], px) // 2 + 3
                          if center else x0 + text_w(norm[-1][0], px) + 2)
                    d = ImageDraw.Draw(img)
                    ly = y0 + line_h * (len(norm) - 1)
                    d.rectangle([lx, ly, lx + 5, ly + px], fill=norm[-1][1])
                else:
                    center_text(img, y0 + line_h * len(norm) + 3, "▼",
                                GREY, 8)
            self.add(img, 200)
            t += 200

    def _draw_lines(self, img, pairs, y0, line_h, px, center, x0, cur):
        for i, (s, col) in enumerate(pairs):
            if center:
                center_text(img, y0 + i * line_h, s, col, px)
            else:
                text(img, (x0, y0 + i * line_h), s, col, px)
        if cur and pairs:
            s, col = pairs[-1]
            lx = ((W - text_w(s, px)) // 2 + text_w(s, px) + 2 if center
                  else x0 + text_w(s, px) + 2)
            d = ImageDraw.Draw(img)
            ly = y0 + line_h * (len(pairs) - 1)
            d.rectangle([lx, ly, lx + 5, ly + px], fill=col)

    def fade(self, img_from, img_to, steps=4, ms=90):
        for i in range(1, steps + 1):
            self.add(Image.blend(img_from, img_to, i / steps), ms)

    def save(self, path):
        big = [f.resize((W * SCALE, H * SCALE), Image.NEAREST)
               for f, _ in self.frames]
        durs = [d for _, d in self.frames]
        big = [f.quantize(colors=96, dither=Image.NONE) for f in big]
        big[0].save(path, save_all=True, append_images=big[1:],
                    duration=durs, loop=0, optimize=True)
        return path

# ---------------------------------------------------------------- shared set
def draw_pod(d, x, y, w, h, glow, lid=True, face=None, light=None):
    """One stasis pod, side view. glow = interior color or None."""
    rad = 3 if min(w, h) >= 7 else 1
    d.rounded_rectangle([x, y, x + w, y + h], radius=rad, fill=GREY_DD,
                        outline=GREY_D)
    if glow and w > 4 and h > 4:
        d.rounded_rectangle([x + 2, y + 2, x + w - 2, y + h - 2], radius=1,
                            fill=tuple(c // 3 for c in glow))
        if h > 7:
            d.rectangle([x + 3, y + 3, x + w - 3, y + 3 + (h - 6) // 2],
                        fill=tuple(c // 2 for c in glow))
    if face:
        fx = x + w // 2
        d.ellipse([fx - 2, y + h // 3, fx + 2, y + h // 3 + 4], fill=face)
    if light:
        d.point((x + w - 3, y + 2), fill=light)

def server_hall(v, warm=0.0, standing=True, cascade=0.0, dying=False,
                eyes=0.0, seed=7, cls="ranger"):
    """The pod hall, one-point perspective. warm 0..1 grey→amber/cyan;
    cascade = fraction of racks lit (front to back); eyes = fraction of
    pods showing a lit 'eye' glint (CS3)."""
    img = canvas()
    d = ImageDraw.Draw(img)
    rng = random.Random(seed)
    vx, vy = W // 2, 58  # vanishing point
    # floor
    vgrad(img, 100, H, GREY_DD, BG)
    # center-aisle floor seams toward the vanishing point
    for fx in (-70, -34, 34, 70):
        d.line([(vx + fx // 4, 100), (vx + fx, H)], fill=(20, 23, 29))
    # rack rows: 4 clean depths, mirrored L/R, NO overlap
    for depth in range(3, -1, -1):
        t = depth / 3.0
        y = int(104 - t * 34)
        ph = int(24 * (1 - t) + 6)
        pw = int(13 * (1 - t) + 4)
        gap = pw + max(3, pw // 2)
        margin = int(22 + t * 58)
        lit_row = cascade >= (t - 0.01)
        n = max(2, (W // 2 - margin) // gap)
        for side in (-1, 1):
            for i in range(n):
                x = (vx + side * (margin + i * gap)
                     - (pw if side < 0 else 0))
                if x < -pw or x > W:
                    continue
                base = AMBER if warm > 0.5 else CYAN
                g = None
                if dying:
                    g = RED if rng.random() < 0.25 else GREY_D
                elif lit_row and (warm > 0 or cascade > 0):
                    g = base
                elif warm == 0 and cascade == 0:
                    g = CYAN_D
                blink = (v + i + depth) % 2 == 0
                if dying and g is RED and not blink:
                    g = GREY_DD
                d_face = SKIN if depth == 0 and ph > 14 else None
                draw_pod(d, x, y - ph, pw, ph, g, face=d_face,
                         light=(g if blink else None) if g else None)
                if eyes > 0 and rng.random() < eyes and ph > 8:
                    ex = x + pw // 2
                    d.point((ex - 1, y - ph + ph // 3), fill=WHITE)
                    d.point((ex + 1, y - ph + ph // 3), fill=WHITE)
    # ceiling cables
    for i in range(5):
        d.line([(vx, vy - 4), (i * (W // 4), 8)], fill=GREY_DD)
    # standing figure, center aisle
    if standing:
        fy = 104 + (1 if v % 2 else 0)  # breath bob
        figure(d, vx - 3, fy - 16, facing="back", cls=cls)
    return img

HERO_PAL = {
    "ranger": {"main": (52, 122, 70), "dark": (34, 82, 48),
               "accent": (95, 232, 140), "trim": (120, 90, 50)},
    "wizard": {"main": (64, 84, 186), "dark": (44, 58, 132),
               "accent": (95, 150, 232), "trim": (200, 190, 120)},
    "knight": {"main": (74, 76, 90), "dark": (48, 50, 60),
               "accent": (216, 70, 60), "trim": (140, 144, 158)},
}

def hero(d, x, y, cls="ranger", facing="back", pose="stand"):
    """The player character, readable person: 9w x 20h from (x, y)=head top.
    Head + face/hood, torso, arms, legs, class weapon. 3 class variants —
    the rig draws whichever class the save slot selected."""
    p = HERO_PAL.get(cls, HERO_PAL["ranger"])
    cx = x + 4                                   # center column
    # --- legs + boots
    d.rectangle([x + 2, y + 13, x + 3, y + 18], fill=p["dark"])
    d.rectangle([x + 5, y + 13, x + 6, y + 18], fill=p["dark"])
    d.rectangle([x + 2, y + 18, x + 3, y + 19], fill=(30, 30, 36))
    d.rectangle([x + 5, y + 18, x + 6, y + 19], fill=(30, 30, 36))
    # --- torso (cloak/robe/armor)
    d.rectangle([x + 1, y + 6, x + 7, y + 12], fill=p["main"])
    d.rectangle([x + 1, y + 11, x + 7, y + 12], fill=p["dark"])   # hem shade
    # belt
    d.rectangle([x + 1, y + 10, x + 7, y + 10], fill=p["trim"])
    # --- arms
    if pose == "gasp":
        d.rectangle([x - 1, y + 5, x, y + 8], fill=p["main"])
        d.rectangle([x + 8, y + 5, x + 9, y + 8], fill=p["main"])
        d.point((x - 1, y + 9), fill=SKIN); d.point((x + 9, y + 9), fill=SKIN)
    else:
        d.rectangle([x, y + 6, x, y + 11], fill=p["dark"])
        d.rectangle([x + 8, y + 6, x + 8, y + 11], fill=p["dark"])
        d.point((x, y + 12), fill=SKIN); d.point((x + 8, y + 12), fill=SKIN)
    # --- head (skin) then class headgear
    d.rectangle([cx - 1, y + 1, cx + 2, y + 5], fill=SKIN)
    if facing == "back":
        d.rectangle([cx - 1, y + 1, cx + 2, y + 5],
                    fill=(150, 110, 70))          # hair/back of head
    else:
        d.point((cx, y + 3), fill=(30, 30, 36))   # eyes
        d.point((cx + 2, y + 3), fill=(30, 30, 36))
    if cls == "ranger":                           # hood
        d.rectangle([cx - 2, y, cx + 3, y + 1], fill=p["main"])
        d.point((cx - 2, y + 2), fill=p["main"])
        d.point((cx + 3, y + 2), fill=p["main"])
    elif cls == "wizard":                         # pointed hat + brim
        d.point((cx, y - 3), fill=p["main"])
        d.rectangle([cx - 1, y - 2, cx + 1, y - 1], fill=p["main"])
        d.rectangle([cx - 3, y, cx + 4, y], fill=p["dark"])
    else:                                         # knight helm + plume
        d.rectangle([cx - 2, y, cx + 3, y + 2], fill=p["trim"])
        d.point((cx, y - 1), fill=p["accent"])
        d.point((cx + 1, y - 1), fill=p["accent"])
    # --- class weapon (back view = on the back; front = at side)
    if cls == "ranger":                           # bow arc + string
        bx = x + 8 if facing == "back" else x - 1
        d.arc([bx - 3, y + 4, bx + 3, y + 14], 300, 60, fill=p["trim"])
        d.line([(bx + 2, y + 5), (bx + 2, y + 13)], fill=(200, 200, 200))
    elif cls == "wizard":                         # staff + orb
        sx = x + 9 if facing == "back" else x - 1
        d.line([(sx, y + 2), (sx, y + 16)], fill=(120, 90, 50))
        d.point((sx, y + 1), fill=p["accent"])
    else:                                         # greatsword over shoulder
        sx = x + 7 if facing == "back" else x + 1
        d.line([(sx, y - 2), (sx, y + 8)], fill=p["trim"])
        d.rectangle([sx - 1, y + 6, sx + 1, y + 6], fill=(120, 90, 50))
    # accent glow pixel (the scan lives in them)
    d.point((cx + 1, y + 8), fill=p["accent"])

def figure(d, x, y, facing="back", pose="stand", h=16, cls="ranger"):
    """Back-compat shim → hero()."""
    hero(d, x - 1, y - 3, cls=cls, facing=facing, pose=pose)

def person(d, x, y, c=(40, 44, 52), h=10):
    """Generic small background person (crowds, pod-hall walkers) — WITH a
    head so nobody reads as furniture."""
    d.rectangle([x, y + 3, x + 4, y + 7], fill=c)                 # body
    d.rectangle([x + 1, y + 7, x + 1, y + h - 1], fill=tuple(
        max(0, k - 8) for k in c))
    d.rectangle([x + 3, y + 7, x + 3, y + h - 1], fill=tuple(
        max(0, k - 8) for k in c))
    d.ellipse([x + 1, y, x + 3, y + 2], fill=SKIN)                # head

def chamber(v, prompt_done=False, cls="ranger", show_hero=True):
    """The Portal Chamber, cold: platform, dark portal ring, wall screen."""
    img = canvas((12, 14, 20))
    d = ImageDraw.Draw(img)
    vgrad(img, 0, 60, (16, 18, 26), (12, 14, 20))
    d.rectangle([0, 118, W, H], fill=GREY_DD)                     # floor
    for x in range(0, W, 24):                                     # floor seams
        d.line([(x, 118), (x, H)], fill=(30, 33, 41))
    # platform
    d.ellipse([88, 118, 152, 138], fill=(34, 38, 48), outline=GREY_D)
    # portal ring (door-shaped, dark/idle)
    d.rounded_rectangle([104, 62, 136, 120], radius=10, fill=(16, 18, 24),
                        outline=(52, 58, 70), width=2)
    if v % 2 == 0:  # faint ember
        d.point((120, 90), fill=CYAN_D)
    # conduit to wall
    d.line([(136, 112), (196, 112)], fill=(40, 44, 54))
    # wall screen (records wall)
    d.rectangle([160, 40, 232, 96], fill=(14, 20, 22), outline=GREY_D)
    # hero standing on platform, small
    if show_hero:
        figure(d, 116, 100, facing="front", cls=cls)
    return img
