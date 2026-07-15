"""Pixel-art toolkit for the SUPER RPG BROS graveyard mob sheet.
Sprites drawn on an 80x80 logical grid, scaled x2 -> 160x160 (crisp NN pixels).
Top-left light source, 3-tone material ramps, dark outline pass.
"""
import numpy as np

W = H = 80
OUT = (16, 12, 26, 255)          # silhouette outline
NONE = (0, 0, 0, 0)

# ---- palettes: (dark, mid, light) ----
BONE   = ((176,164,126), (230,220,192), (247,241,220))
ROT    = ((54,82,46),    (104,140,74),  (150,182,110))
ROT2   = ((70,92,58),    (122,150,92),  (168,196,128))
GHOST  = ((86,132,146),  (150,206,214), (216,244,248))
ECTO   = ((30,120,88),   (92,214,150),  (190,255,210))
STONE  = ((74,78,92),    (120,124,138), (170,174,190))
STONE2 = ((60,62,74),    (98,102,116),  (146,150,166))
DIRT   = ((62,44,30),    (98,70,48),    (134,102,70))
MOSS   = ((44,74,42),    (84,122,64),   (120,158,90))
PURP   = ((56,34,82),    (100,66,134),  (154,112,190))
CLOTH  = ((40,40,54),    (66,66,86),    (100,100,124))
SHEET  = ((150,150,166), (200,200,214), (238,238,246))
RUST   = ((120,60,34),   (168,92,50),   (206,132,78))
GOLD   = ((150,110,40),  (214,168,66),  (250,222,120))
WOOD   = ((72,50,32),    (110,78,48),   (146,108,66))

REDEYE = (232,70,66,255)
REDGLOW= (255,128,110,255)
CYEYE  = (150,240,235,255)
GRNEYE = (150,255,150,255)
PURGLOW= (190,120,255,255)
HOLE   = (20,16,28,255)
WHITE  = (244,244,250,255)


def canvas():
    return np.zeros((H, W, 4), dtype=np.uint8)

def _c(col):
    if len(col) == 3:
        return (col[0], col[1], col[2], 255)
    return col

def P(s, x, y, col):
    x = int(round(x)); y = int(round(y))
    if 0 <= x < W and 0 <= y < H:
        s[y, x] = _c(col)

def R(s, x0, y0, x1, y1, col):
    for y in range(int(y0), int(y1)+1):
        for x in range(int(x0), int(x1)+1):
            P(s, x, y, col)

def disc(s, cx, cy, r, col):
    col = _c(col)
    for y in range(int(cy-r-1), int(cy+r+2)):
        for x in range(int(cx-r-1), int(cx+r+2)):
            if (x-cx)**2 + (y-cy)**2 <= r*r:
                P(s, x, y, col)

def ell(s, cx, cy, rx, ry, col):
    col = _c(col)
    for y in range(int(cy-ry-1), int(cy+ry+2)):
        for x in range(int(cx-rx-1), int(cx+rx+2)):
            if rx>0 and ry>0 and ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1.0:
                P(s, x, y, col)

def shell(s, cx, cy, rx, ry, ramp, ldir=(-0.66,-0.66)):
    """Shaded ellipse: spherical 3-tone shading, top-left light."""
    if not isinstance(ramp[0], (tuple, list)):
        c = ramp[:3]
        ramp = (tuple(int(v*0.6) for v in c), tuple(c), tuple(min(255,int(v*1.4)) for v in c))
    dk, md, lt = _c(ramp[0]), _c(ramp[1]), _c(ramp[2])
    lx, ly = ldir
    for y in range(int(cy-ry-1), int(cy+ry+2)):
        for x in range(int(cx-rx-1), int(cx+rx+2)):
            if rx<=0 or ry<=0: continue
            nx = (x-cx)/rx; ny = (y-cy)/ry
            if nx*nx + ny*ny <= 1.0:
                d = nx*lx + ny*ly
                c = lt if d > 0.34 else (dk if d < -0.30 else md)
                P(s, x, y, c)

def thick(s, x0, y0, x1, y1, r, col):
    col = _c(col)
    n = int(max(abs(x1-x0), abs(y1-y0)) ) + 1
    for i in range(n+1):
        t = i/max(n,1)
        cx = x0+(x1-x0)*t; cy = y0+(y1-y0)*t
        disc(s, cx, cy, r, col)

def limb(s, x0, y0, x1, y1, r, ramp):
    thick(s, x0, y0, x1, y1, r, ramp[0])       # dark base (acts as edge)
    thick(s, x0, y0, x1, y1, max(r-0.7,0.6), ramp[1])
    thick(s, x0-0.7, y0-0.7, x1-0.7, y1-0.7, max(r-1.6,0.4), ramp[2])

def line(s, x0, y0, x1, y1, col, r=0):
    col=_c(col)
    x0,y0,x1,y1 = int(x0),int(y0),int(x1),int(y1)
    dx=abs(x1-x0); dy=-abs(y1-y0)
    sx=1 if x0<x1 else -1; sy=1 if y0<y1 else -1
    err=dx+dy
    while True:
        if r<=0: P(s,x0,y0,col)
        else: disc(s,x0,y0,r,col)
        if x0==x1 and y0==y1: break
        e2=2*err
        if e2>=dy: err+=dy; x0+=sx
        if e2<=dx: err+=dx; y0+=sy

def outline(s, col=OUT, diag=True):
    """Add outline where an opaque pixel borders transparency."""
    a = s[:,:,3] > 0
    pad = np.zeros((H+2, W+2), dtype=bool); pad[1:-1,1:-1]=a
    neigh = (pad[0:-2,1:-1]|pad[2:,1:-1]|pad[1:-1,0:-2]|pad[1:-1,2:])
    if diag:
        neigh |= (pad[0:-2,0:-2]|pad[0:-2,2:]|pad[2:,0:-2]|pad[2:,2:])
    edge = (~a) & neigh
    ys,xs = np.where(edge)
    for y,x in zip(ys,xs):
        s[y,x]=_c(col)

def shadow_layer(cx, cy, rx, ry, alpha=90):
    """Return a soft ground shadow as its own array (drawn under sprite)."""
    sh = canvas()
    for y in range(int(cy-ry-1), int(cy+ry+2)):
        for x in range(int(cx-rx-1), int(cx+rx+2)):
            if rx>0 and ry>0 and ((x-cx)/rx)**2+((y-cy)/ry)**2 <= 1.0:
                P(sh, x, y, (0,0,0,alpha))
    return sh
