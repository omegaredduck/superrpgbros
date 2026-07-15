import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
import mobkit as k
from mobkit import P,R,disc,ell,shell,thick,limb,line,outline,canvas,BONE,STONE,GOLD,HOLE,WHITE

RB   = ((26,20,16),(48,38,30),(74,60,46))     # robe brown
DARK = ((10,10,14),(22,20,26),(38,36,44))     # inner drape / shadow cloth
LE   = ((58,38,24),(92,64,40),(126,92,58))    # leather straps
IRON = ((24,26,34),(48,52,64),(86,92,112))
RUNP = (176,96,236,255); RUNPd=(96,44,150,255)
RUNG = (120,255,150,255); RUNGd=(46,140,80,255)
ORG  = (255,150,44,255); ORGc=(255,214,130,255)
GF   = (120,255,150,255); GFl=(200,255,220,255)
RED  = (240,64,58,255)
FACE = (9,8,12,255)

def robe():
    s=canvas()
    # ---- lower drape shadow (ragged) behind
    for y in range(40,77):
        t=(y-40)/37; w=int(9+t*15)
        cut = ((y//2)%2)* (3 if y>66 else 0) + (2 if (y//3)%2 and y>62 else 0)
        R(s,40-w+cut,y,40+w-cut,y,DARK[1])
    # ---- main robe body
    for y in range(30,75):
        t=(y-30)/45; w=int(8+t*13)
        cut = 0
        if y>66: cut = (0 if (y//2)%2 else 4) + (3 if (y//3)%2 else 0)
        R(s,40-w+cut,y,40+w-cut,y,RB[1])
        R(s,40-w+cut,y,40-w+cut+2,y,RB[2])       # left light
        R(s,40+w-cut-2,y,40+w-cut,y,RB[0])       # right shade
    # center front drape (darker, ragged tongue)
    for y in range(44,76):
        t=(y-44)/32; w=int(3+t*5)
        cut=(2 if (y//2)%2 and y>68 else 0)
        R(s,40-w+cut,y,40+w-cut,y,DARK[1]); R(s,40-w,y,40-w+1,y,DARK[2])
    # ---- rune sashes (two vertical straps front)
    for sx,(cd,cl) in [(34,(RUNPd,RUNP)),(46,(RUNGd,RUNG))]:
        for y in range(34,70,1):
            P(s,sx,y,LE[0]); P(s,sx+1,y,LE[1])
        for y in range(37,68,4):
            P(s,sx,y,cl); P(s,sx+1,y,cl); P(s,sx,y+1,cd)   # glyph blips
            if (y//4)%2: P(s,sx,y-1,cd)
    # ---- shoulder cape (tattered layer)
    for y in range(28,46):
        t=(y-28)/18; w=int(11+t*4)
        cut=(0 if (y//2)%2 else 3) if y>40 else 0
        R(s,40-w+cut,y,40+w-cut,y,DARK[1])
        R(s,40-w+cut,y,40-w+cut+2,y,DARK[2]); R(s,40+w-cut-2,y,40+w-cut,y,DARK[0])
    # collar
    R(s,32,29,48,32,DARK[2])
    # ---- chest straps (X) + belt
    line(s,32,34,48,48,LE[1]); line(s,33,34,49,48,LE[0])
    line(s,48,34,32,48,LE[1]); line(s,47,34,31,48,LE[0])
    R(s,30,49,50,53,LE[1]); R(s,30,49,50,50,LE[2]); R(s,30,52,50,53,LE[0])  # belt
    R(s,38,49,42,53,GOLD[1]); R(s,39,50,41,52,GOLD[0])                       # buckle
    # pouches
    R(s,44,50,50,58,LE[1]); R(s,44,50,50,51,LE[2]); R(s,45,53,49,54,LE[0])
    R(s,30,51,35,57,LE[0])
    # ---- keyring at hip
    disc(s,50,56,2.4,GOLD[1]); disc(s,50,56,1.2,(0,0,0,0)); P(s,52,56,GOLD[2])
    for kx,ky in [(52,58),(54,57),(53,60)]:
        line(s,50,57,kx,ky,GOLD[0]); disc(s,kx,ky,1,GOLD[1]); P(s,kx,ky+1,GOLD[2])
    # ---- boots
    R(s,33,72,39,77,RB[0]); R(s,41,72,47,77,RB[0]); R(s,33,72,39,73,RB[1]); R(s,41,72,47,73,RB[1])
    R(s,32,76,40,78,DARK[0]); R(s,40,76,48,78,DARK[0])
    return s

def arms_props(s):
    # ---- right arm DOWN holding lantern (his left, screen right)
    limb(s,49,36,55,56,3,RB)
    disc(s,55,57,2.2,LE[1])                                   # gloved hand
    # lantern
    thick(s,55,58,55,60,1,IRON[1])
    R(s,51,60,59,72,IRON[0])
    R(s,52,61,58,71,IRON[1])
    R(s,53,63,57,70,(24,60,42,255))                          # glass
    disc(s,55,67,2,GF); disc(s,55,67,3.4,(120,255,150,70))   # faint green flame
    R(s,51,59,59,61,IRON[2]); R(s,50,72,60,74,IRON[0])       # cap/base
    P(s,55,58,IRON[2])
    # ---- left arm RAISED holding Necronomicon (his right, screen left)
    limb(s,31,36,20,34,3,RB)
    disc(s,18,34,2.4,LE[1])                                   # hand under book
    # book cover
    R(s,10,24,26,40,LE[0])                                    # back cover / shadow
    R(s,11,23,25,39,LE[1]); R(s,11,23,13,39,LE[2])            # front cover
    R(s,17,23,19,39,LE[0])                                    # spine center (open)
    R(s,13,25,17,37,BONE[2]); R(s,19,25,23,37,BONE[1])        # pages
    # skull face on cover
    shell(s,15,30,3,3,BONE); disc(s,14,30,0.8,RED); disc(s,16,30,0.8,RED)
    P(s,15,32,HOLE)
    # runes on right page
    for ry in range(26,37,3): P(s,21,ry,RUNP); P(s,22,ry+1,RUNG)
    # chain dangling
    for cy in range(40,50,2): disc(s,12,cy,1,IRON[2])
    # green flame pouring up + drip down
    for j,cy in enumerate(range(22,10,-2)):
        disc(s,17,cy,2.6-j*0.3,GF); disc(s,15+ (j%2)*3,cy-1,1.4,GFl)
    disc(s,17,15,2,(190,255,210,160))
    for cy in range(40,46,2): disc(s,20,cy,1.2,GF)            # drip
    return s

def head(s):
    # hood outer
    for y in range(10,34):
        t=(y-10)/24; w=int(3+t*11)
        R(s,40-w,y,40+w,y,RB[1])
        R(s,40-w,y,40-w+2,y,RB[2]); R(s,40+w-2,y,40+w,y,RB[0])
    # hood peak
    for i,y in enumerate(range(6,12)):
        w=i; R(s,40-w,y,40+w,y,RB[1])
    # face void
    ell(s,40,23,5,7,FACE)
    # burning eyes (angled)
    for ex,dx in [(37,-1),(43,1)]:
        disc(s,ex,23,1.5,ORG); P(s,ex,22,ORGc); P(s,ex+dx,24,ORG)
        disc(s,ex,23,2.6,(255,150,44,70))
    # hood inner rim highlight
    for a in range(200,340,10):
        xx=40+int(6*math.cos(math.radians(a))); yy=22+int(8*math.sin(math.radians(a)))
        P(s,xx,yy,RB[2])
    return s

s=robe()
arms_props(s)
head(s)
outline(s,(6,6,10,255))
# re-brighten eyes/flame after outline
for ex in (37,43): disc(s,ex,23,1.4,ORG); P(s,ex,22,ORGc)
disc(s,17,15,2,GFl)

# ---- compose presentation card ----
SC=4
big=Image.fromarray(s,"RGBA").resize((80*SC,80*SC),Image.NEAREST)
cw,ch=460,470
card=Image.new("RGB",(cw,ch),(14,13,20))
bgp=card.load()
for y in range(ch):
    for x in range(cw):
        d=((x-cw/2)**2+(y-ch/2)**2)**0.5; v=max(0,1-d/340)
        bgp[x,y]=(int(14+10*v),int(13+8*v),int(20+14*v))
card=card.convert("RGBA"); dr=ImageDraw.Draw(card)
def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()
# ground shadow
dr.ellipse((cw/2-120,398,cw/2+120,428),fill=(0,0,0,120))
card.alpha_composite(big,(int(cw/2-160),58))
dr.text((cw/2-150,14),"THE GRAVEKEEPER",font=font(30),fill=(226,222,236))
sub="hi-fi pixel · from your concept art"
tb=dr.textbbox((0,0),sub,font=font(15)); dr.text((cw/2-(tb[2]-tb[0])/2,432),sub,font=font(15),fill=(150,150,172))
card.convert("RGB").save("/tmp/gravekeeper_sprite.png"); print("saved")
