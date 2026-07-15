import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
import mobkit as k
from mobkit import (P,R,disc,ell,shell,thick,limb,line,outline,canvas,
    BONE,ROT,GHOST,ECTO,STONE,STONE2,DIRT,MOSS,PURP,GOLD,WOOD,HOLE,WHITE,GRNEYE,REDEYE,REDGLOW,PURGLOW)

BLACK=((14,14,22),(32,32,46),(60,60,82))
BROWN=((44,32,22),(74,56,38),(106,84,56))
IRON=((30,32,44),(56,60,76),(96,100,122))
RUST=((78,44,30),(122,72,44),(158,104,66))
PALE=((150,150,168),(200,202,216),(234,236,246))
GRN=(120,255,150,255)

def robe(s,cx,ytop,ybot,wtop,wbot,ramp,tatter=True,folds=True):
    for y in range(int(ytop),int(ybot)+1):
        t=(y-ytop)/max(1,(ybot-ytop)); w=int(wtop+(wbot-wtop)*t)
        cut=0
        if tatter and y>ybot-7:
            cut = (0 if ((y//2)%2==0) else 4) + (2 if ((cx+y)//3)%2 else 0)
        R(s,cx-w+cut,y,cx+w-cut,y,ramp[1])
        R(s,cx-w+cut,y,cx-w+cut+2,y,ramp[2]); R(s,cx+w-cut-2,y,cx+w-cut,y,ramp[0])
    if folds:
        for fx in (-0.45,0.15,0.55):
            x=cx+int((wbot)*fx)
            line(s,x,ytop+6,x+int(wbot*fx*0.2),ybot-4,ramp[0])

def hood(s,cx,cy,r,ramp,eyes=GRN,peak=True):
    shell(s,cx,cy,r,r+2,ramp)
    if peak:
        for i,yy in enumerate(range(cy-r-4,cy-r+2)):
            w=i; R(s,cx-w,yy,cx+w,yy,ramp[1])
    ell(s,cx,cy+1,r*0.6,r*0.75,HOLE)
    if eyes:
        disc(s,cx-r*0.28,cy,1.3,eyes); disc(s,cx+r*0.28,cy,1.3,eyes)

def skullface(s,cx,cy,r,glow=None):
    shell(s,cx,cy,r,r,BONE)
    disc(s,cx-r*0.4,cy-r*0.1,r*0.28,HOLE); disc(s,cx+r*0.4,cy-r*0.1,r*0.28,HOLE)
    if glow: disc(s,cx-r*0.4,cy-r*0.1,1.1,glow); disc(s,cx+r*0.4,cy-r*0.1,1.1,glow)
    R(s,int(cx-1),int(cy+r*0.3),int(cx+1),int(cy+r*0.6),HOLE)
    for xx in range(int(cx-r*0.5),int(cx+r*0.5),2): P(s,xx,cy+r*0.85,HOLE)

def tome(s,cx,cy,w=7,h=5,cover=PURP,glow=GRN,openbook=True):
    if not isinstance(cover[0],(tuple,list)):
        c=cover[:3]; cover=(tuple(int(v*0.55) for v in c), tuple(c), tuple(min(255,int(v*1.4)) for v in c))
    if openbook:
        R(s,cx-w,cy-h,cx+w,cy+h,cover[1])
        R(s,cx-w+1,cy-h+1,cx-1,cy+h-1,BONE[2]); R(s,cx+1,cy-h+1,cx+w-1,cy+h-1,BONE[1])
        R(s,cx-1,cy-h,cx+1,cy+h,cover[0])            # spine
        disc(s,cx,cy,1.8,glow); disc(s,cx,cy,3.2,(glow[0],glow[1],glow[2],80))
        for a in range(0,360,60): P(s,cx+int(2.4*math.cos(math.radians(a))),cy+int(2.2*math.sin(math.radians(a))),(20,60,40,255))
    else:
        R(s,cx-w,cy-h,cx+w,cy+h,cover[1]); R(s,cx-w,cy-h,cx-w+2,cy+h,cover[2])
        R(s,cx+w-2,cy-h,cx+w,cy+h,cover[0]); R(s,cx-w+2,cy-h,cx-w+3,cy+h,BONE[1])
        disc(s,cx-1,cy,1.6,glow)

def crown(s,cx,cy,w=8,ramp=GOLD,spikes=3,glow=GRN):
    R(s,cx-w,cy,cx+w,cy+3,ramp[1]); R(s,cx-w,cy,cx+w,cy+1,ramp[2])
    step=(2*w)//(spikes+1)
    for i in range(spikes+1):
        sx=cx-w+i*step; hh=6 if i%2==0 else 4
        R(s,sx-1,cy-hh,sx+1,cy,ramp[1]); P(s,sx,cy-hh,ramp[2])
        if glow and i%2==0: P(s,sx,cy-hh-1,glow)

def scythe(s,x0,y0,x1,y1,ramp=STONE):
    thick(s,x0,y0,x1,y1,1.3,WOOD[1])
    # blade at top
    for a in range(200,300,6):
        bx=x1+int(12*math.cos(math.radians(a))); by=y1+int(12*math.sin(math.radians(a)))
        disc(s,bx,by,1.4,ramp[2])
    disc(s,x1,y1,2,ramp[1])

def bonewing(s,cx,cy,side,scale=1.0):
    base=cx+side*3
    for i in range(4):
        ex=base+side*int((10+i*4)*scale); ey=cy-int((2+i*4)*scale)
        thick(s,base,cy,ex,ey,1.3,BONE[0])
        for j in range(2):
            thick(s,ex,ey,ex+side*3,ey+3+j*3,0.8,BONE[1])

def sleeves(s,cx,y,spanw,ramp,handcol=None):
    thick(s,cx-6,y,cx-spanw,y+8,3,ramp[1]); thick(s,cx+6,y,cx+spanw,y+8,3,ramp[1])
    if handcol:
        disc(s,cx-spanw,y+8,2,handcol); disc(s,cx+spanw,y+8,2,handcol)

def ground(s,y=74,w=30,col=DIRT):
    for yy in range(y-2,min(y+3,79)): R(s,40-w,yy,40+w,yy,col[0])

# ============================================================= BOSSES
def b1():  # GRAVEDIGGER (old sexton)
    s=canvas()
    robe(s,40,34,72,10,20,BROWN)
    sleeves(s,40,40,16,BROWN,BONE[1])
    # gaunt hooded head + wide tattered hat
    hood(s,40,26,8,BROWN,eyes=None,peak=False)
    skullface(s,40,27,6,GRN)
    for i,yy in enumerate(range(16,20)):            # hat brim
        w=16-i*0; R(s,40-16,yy,40+16,yy,BROWN[0]) if i==2 else None
    R(s,24,18,56,20,BROWN[0]); R(s,24,18,56,19,BROWN[1]); R(s,32,10,48,18,BROWN[1])
    # shovel
    line(s,56,44,66,18,WOOD[2],1); R(s,62,12,70,20,STONE[1]); R(s,62,12,70,13,STONE[2])
    # lantern
    thick(s,24,40,20,30,1,IRON[1]); R(s,16,30,24,40,IRON[0]); R(s,17,32,23,38,(30,70,44,255)); disc(s,20,35,2,GRN)
    tome(s,40,52,6,4,BROWN,GRN,openbook=False)
    outline(s); return s

def b2():  # BONE LICH
    s=canvas()
    robe(s,40,36,72,8,19,PURP)
    sleeves(s,40,42,15,PURP,BONE[1])
    # skeletal ribcage torso
    R(s,36,36,44,50,BONE[1])
    for ry in range(38,50,3): line(s,34,ry,46,ry,BONE[0])
    skullface(s,40,26,7,GRN)
    crown(s,40,17,8,BONE,4,GRN)
    # floating open tome
    tome(s,58,40,7,5,PURP,GRN,True)
    # staff
    thick(s,22,30,22,60,1.2,WOOD[1]); disc(s,22,28,2.5,PURP[2]); disc(s,22,28,1.2,GRN)
    outline(s); return s

def b3():  # ROTLORD (hulking warden)
    s=canvas()
    robe(s,40,40,72,16,24,ROT,folds=False)
    R(s,26,36,54,52,ROT[1])                          # broad chest
    limb(s,28,40,18,58,3.5,ROT); limb(s,52,40,62,58,3.5,ROT)
    disc(s,18,58,3,ROT[1]); disc(s,62,58,3,ROT[1])
    shell(s,40,28,9,9,ROT)
    disc(s,36,28,2,HOLE); disc(s,44,28,2,HOLE); P(s,36,27,GRN); P(s,44,27,GRN)
    line(s,34,33,46,34,HOLE)
    for xx in range(35,46,2): P(s,xx,33,BONE[2])
    # chains + keyring
    for cx in range(30,52,4): disc(s,cx,50,1.4,IRON[2])
    disc(s,60,60,3,GOLD[1]); disc(s,60,60,1.6,(0,0,0,0)); P(s,63,60,GOLD[2])
    tome(s,24,54,6,4,BLACK,GRN,False)
    outline(s); return s

def b4():  # SHROUDED NECROMANCER
    s=canvas()
    robe(s,40,32,72,9,20,BLACK)
    hood(s,40,24,9,BLACK,eyes=GRN)
    sleeves(s,40,40,14,BLACK,None)
    disc(s,26,48,2,GHOST[2]); disc(s,54,48,2,GHOST[2])   # spectral hands
    # big open floating Necronomicon center
    tome(s,40,50,9,6,(50,20,60),GRN,True)
    # rising spirits
    for sx,sy in [(20,34),(60,32),(30,20)]: disc(s,sx,sy,2,(120,255,150,110))
    outline(s); return s

def b5():  # BONEYARD GOLEM
    s=canvas()
    ground(s)
    R(s,26,50,54,72,STONE[1])                         # tombstone chest
    R(s,26,50,28,72,STONE[2]); R(s,52,50,54,72,STONE[0])
    R(s,34,54,46,56,HOLE); R(s,35,60,45,62,HOLE)      # RIP
    # bone amalgam arms
    for lx in (24,56):
        disc(s,lx,52,4,BONE[1]); disc(s,lx,60,3.5,BONE[0]); disc(s,lx,68,3,BONE[1])
    # skull cluster shoulders
    for sx in (28,52): shell(s,sx,46,4,4,BONE); disc(s,sx-1,46,1,HOLE); disc(s,sx+1,46,1,HOLE)
    skullface(s,40,34,9,GRN)                          # big skull head
    for i in range(3): P(s,38+i*2,24,BONE[2])
    outline(s); return s

def b6():  # PALE PRIEST
    s=canvas()
    robe(s,40,34,72,9,18,PALE)
    sleeves(s,40,42,14,PALE,BONE[1])
    skullface(s,40,26,7,GRN)
    # mitre
    for i,yy in enumerate(range(12,26)):
        w=int((yy-12)*0.5)+1; R(s,40-w,yy,40+w,yy,PALE[1]);
    R(s,39,14,41,24,GOLD[1])                          # cross on mitre
    R(s,36,17,44,19,GOLD[1])
    # censer swinging
    line(s,56,44,60,54,IRON[1],0); disc(s,60,56,2.5,GOLD[1]); disc(s,60,56,1,GRN)
    tome(s,26,50,6,4,PALE,GRN,False)
    outline(s); return s

def b7():  # CORPSE COLLECTOR
    s=canvas()
    robe(s,40,34,72,12,20,((40,38,34),(64,60,52),(92,88,78)))
    hood(s,40,26,8,((40,38,34),(64,60,52),(92,88,78)),eyes=REDEYE)
    # hanging bones from arms
    for hx in (24,30,50,56):
        line(s,hx,42,hx,54,BONE[1]); disc(s,hx,55,1.4,BONE[2])
    # hooks
    for hx in (20,60):
        line(s,hx,40,hx,50,IRON[1]); line(s,hx,50,hx+2,52,IRON[2])
    # sack over shoulder
    disc(s,56,38,5,((60,54,44,255)))
    tome(s,40,52,6,4,((40,38,34),(64,60,52),(92,88,78)),REDGLOW if False else GRN,False)
    outline(s); return s

def b8():  # WRAITH KING
    s=canvas()
    for yy in range(30,70):
        t=(yy-30)/40; w=int(6+t*15)
        R(s,40-w,yy,40+w,yy,GHOST[1]); R(s,40-w,yy,40-w+2,yy,GHOST[2]); R(s,40+w-2,yy,40+w,yy,GHOST[0])
    ell(s,40,26,7,8,HOLE); disc(s,37,26,1.4,GRN); disc(s,43,26,1.4,GRN)
    crown(s,40,16,8,GOLD,4,GRN)
    limb(s,28,40,20,52,2,GHOST); limb(s,52,40,60,52,2,GHOST)
    tome(s,58,44,6,4,(40,60,70),GRN,True)
    outline(s,(70,110,130,255))
    for yy in range(62,70):
        f=1-(yy-62)/8
        for x in range(80):
            if s[yy,x,3]>0: s[yy,x,3]=int(s[yy,x,3]*max(.2,f))
    return s

def b9():  # PLAGUE KEEPER
    s=canvas()
    robe(s,40,32,72,9,19,BLACK)
    sleeves(s,40,40,14,BLACK,PALE[2])
    # wide hat
    R(s,26,20,54,22,BLACK[0]); R(s,32,10,48,20,BLACK[1])
    # beaked mask
    shell(s,40,27,6,7,PALE)
    disc(s,37,25,1.6,(30,60,40,255)); disc(s,43,25,1.6,(30,60,40,255)); P(s,37,25,GRN);P(s,43,25,GRN)
    for i,yy in enumerate(range(29,36)): P(s,40,yy,PALE[0]); P(s,40+1,yy,PALE[1])  # beak
    R(s,38,33,42,34,PALE[0])
    # censer + tome
    line(s,56,42,60,52,IRON[1]); disc(s,60,54,2.4,GOLD[1]); disc(s,60,54,1,GRN)
    tome(s,26,48,6,4,BLACK,GRN,False)
    outline(s); return s

def b10(): # ASHEN MONK
    s=canvas()
    robe(s,40,30,72,11,19,((60,60,68),(92,92,104),(130,130,146)))
    hood(s,40,26,9,((60,60,68),(92,92,104),(130,130,146)),eyes=GRN)
    # rosary of skulls
    for i,a in enumerate(range(200,340,20)):
        rx=40+int(15*math.cos(math.radians(a))); ry=44+int(15*math.sin(math.radians(a)))
        disc(s,rx,ry,1.6,BONE[1])
    # cradled glowing tome
    tome(s,40,52,8,5,((60,60,68),(92,92,104),(130,130,146)),GRN,True)
    outline(s); return s

def b11(): # TOMB TITAN (mausoleum body)
    s=canvas()
    R(s,20,60,60,72,STONE[0])                         # base
    R(s,22,40,58,62,STONE[1]); R(s,22,40,24,62,STONE[2]); R(s,56,40,58,62,STONE[0])
    # iron-gate ribcage
    for bx in range(28,53,5): R(s,bx,44,bx+1,60,IRON[1])
    R(s,26,44,54,46,IRON[1]); R(s,26,58,54,60,IRON[1])
    # pediment shoulders
    for i,yy in enumerate(range(30,40)): w=int((yy-30)*1.8)+8; R(s,40-w,yy,40+w,yy,STONE[1])
    # skull in pediment / head
    skullface(s,40,26,6,GRN)
    R(s,39,12,41,22,STONE2[2]); R(s,36,15,44,17,STONE2[2])   # cross crown
    # column arms
    R(s,16,42,22,64,STONE[1]); R(s,58,42,64,64,STONE[1])
    outline(s); return s

def b12(): # DEADROOT WALKER
    s=canvas()
    root=((40,54,36),(66,86,52),(96,120,74))
    robe(s,40,38,72,10,20,ROT,folds=False)
    # roots wrapping
    for (ax,ay,bx,by) in [(30,40,22,70),(50,40,58,70),(40,44,34,68),(40,44,48,66)]:
        thick(s,ax,ay,bx,by,1.6,root[0]); thick(s,ax,ay,(ax+bx)//2,(ay+by)//2,1.2,root[1])
    shell(s,40,28,8,8,ROT[1]); disc(s,36,28,2,HOLE);disc(s,44,28,2,HOLE);P(s,36,27,GRN);P(s,44,27,GRN)
    # branch antlers
    for side in (-1,1):
        thick(s,40+side*4,22,40+side*12,10,1.2,root[0]); thick(s,40+side*8,16,40+side*16,12,1,root[0])
    tome(s,40,52,6,4,root,GRN,True)
    for lf in [(20,30),(60,28),(30,14)]: disc(s,lf[0],lf[1],1.6,root[2])
    outline(s); return s

def b13(): # WAXWARDEN
    s=canvas()
    wax=((150,140,120),(206,196,172),(236,228,208))
    robe(s,40,34,72,10,19,wax)
    # drips
    for dx in range(26,55,4): line(s,dx,60,dx,64+((dx//3)%4),wax[2])
    hood(s,40,27,7,wax,eyes=(40,30,20,255),peak=False)
    disc(s,37,27,1.4,(255,180,90,255)); disc(s,43,27,1.4,(255,180,90,255))
    # candelabra crown
    R(s,32,18,48,20,GOLD[1])
    for cx in (33,40,47):
        R(s,cx-1,12,cx+1,18,wax[1]); disc(s,cx,10,1.6,(255,200,110,255)); P(s,cx,9,(255,245,200,255))
    tome(s,40,52,6,4,wax,(255,180,90,255),True)
    outline(s); return s

def b14(): # IRON SEXTON
    s=canvas()
    ground(s)
    robe(s,40,44,72,12,20,BLACK)
    # armored torso
    R(s,28,36,52,54,IRON[1]); R(s,28,36,30,54,IRON[2]); R(s,50,36,52,54,IRON[0])
    R(s,34,40,46,42,RUST[1]); R(s,36,46,44,48,RUST[1])
    # helm w/ grill
    shell(s,40,26,7,7,IRON[1])
    for xx in range(36,45,2): line(s,xx,24,xx,30,IRON[0])
    P(s,37,26,GRN); P(s,43,26,GRN)
    # gate shield
    R(s,16,40,26,62,IRON[0]);
    for bx in range(18,26,3): R(s,bx,42,bx+1,60,IRON[2])
    # keyring
    disc(s,58,54,3,GOLD[1]); disc(s,58,54,1.4,(0,0,0,0)); line(s,58,57,58,62,GOLD[2])
    tome(s,52,58,5,4,BLACK,GRN,False); line(s,46,50,52,56,IRON[2])   # chained tome
    outline(s); return s

def b15(): # GHOUL KING
    s=canvas()
    GH=((88,92,100),(138,142,150),(184,188,196))
    # cape
    for yy in range(34,70):
        t=(yy-34)/36; w=int(9+t*14); R(s,40-w,yy,40+w,yy,(70,24,40,255))
    limb(s,30,42,20,62,3,GH); limb(s,50,42,58,60,3,GH)
    for cx,dx in [(20,-1),(58,1)]:
        for j in range(3): line(s,cx,62,cx+dx*3,66+j*1.5,(220,220,225,255))
    R(s,30,38,50,52,GH[1])                            # hunched torso
    shell(s,40,30,7,6,GH); disc(s,36,30,1.6,REDEYE);disc(s,44,30,1.6,REDEYE)
    line(s,33,33,47,33,HOLE)
    for xx in range(34,47,2): P(s,xx,33,(230,230,235,255)); P(s,xx,34,(230,230,235,255))
    crown(s,40,20,7,GOLD,3,REDGLOW)
    tome(s,40,50,6,4,(70,24,40),GRN,True)
    outline(s); return s

def b16(): # SPECTRAL WIDOW
    s=canvas()
    for yy in range(24,70):
        t=(yy-24)/46; w=int(4+t*16)
        R(s,40-w,yy,40+w,yy,GHOST[1]); R(s,40-w,yy,40-w+2,yy,GHOST[2]); R(s,40+w-2,yy,40+w,yy,GHOST[0])
    # veil
    for yy in range(18,40):
        w=int(5+(yy-18)*0.4); R(s,40-w,yy,40+w,yy,(200,206,220, 200))
    disc(s,37,26,1.4,HOLE); disc(s,43,26,1.4,HOLE); ell(s,40,30,1.6,2.4,HOLE)  # wailing
    limb(s,28,42,22,54,2,GHOST); limb(s,52,42,58,54,2,GHOST)
    tome(s,58,46,5,4,(50,60,74),GRN,True)
    outline(s,(70,110,130,255))
    for yy in range(62,70):
        f=1-(yy-62)/8
        for x in range(80):
            if s[yy,x,3]>0: s[yy,x,3]=int(s[yy,x,3]*max(.2,f))
    return s

def b17(): # BONE SERPENT KEEPER
    s=canvas()
    ground(s,74,26)
    # serpent coil lower body rising
    for i,a in enumerate(range(0,540,20)):
        rr=16-i*0.4; xx=40+int(rr*math.cos(math.radians(a))); yy=66-i*0.9
        disc(s,xx,yy,3.2-i*0.03,BONE[1]); P(s,xx-1,yy-1,BONE[2])
    # humanoid torso
    R(s,34,34,46,50,PURP[1]);
    sleeves(s,40,38,14,PURP,BONE[1])
    skullface(s,40,26,7,GRN)
    crown(s,40,17,7,BONE,3,GRN)
    tome(s,58,42,6,4,PURP,GRN,True)
    outline(s); return s

def b18(): # GRAVE COLOSSUS
    s=canvas()
    R(s,18,58,62,72,STONE[0])
    R(s,24,38,56,60,STONE[1]); R(s,24,38,26,60,STONE[2]); R(s,54,38,56,60,STONE[0])
    # obelisk spine
    R(s,38,20,42,40,STONE2[1]); P(s,40,18,GRN)
    # headstone crown
    for i,cx in enumerate(range(28,53,8)):
        R(s,cx,10,cx+6,20,STONE[1]); ell(s,cx+3,10,3,2,STONE[1])
    skullface(s,40,30,7,GRN)
    # slab arms
    R(s,14,40,24,64,STONE[1]); R(s,56,40,66,64,STONE[1])
    for xx in range(28,53,3): P(s,xx,40,MOSS[1])
    outline(s); return s

def b19(): # CROWCLOAK
    s=canvas()
    fe=((18,18,26),(38,38,52),(66,66,88))
    for yy in range(30,70):
        t=(yy-30)/40; w=int(8+t*15)
        for x in range(40-w,40+w+1):
            feather = ((x+yy)//2)%2
            P(s,x,yy, fe[1] if feather else fe[0])
        R(s,40-w,yy,40-w+2,yy,fe[2])
    skullface(s,40,27,7,PURGLOW)
    hood(s,40,24,9,fe,eyes=None); skullface(s,40,27,6,PURGLOW)
    # crows circling
    for cx,cy in [(18,24),(62,20),(24,14),(58,40)]:
        line(s,cx-3,cy,cx,cy-2,fe[2]); line(s,cx,cy-2,cx+3,cy,fe[2]); P(s,cx,cy-1,fe[1])
    thick(s,58,34,60,64,1.2,WOOD[1]); disc(s,60,32,2.4,fe[2]); disc(s,60,32,1,PURGLOW)  # staff
    tome(s,24,50,6,4,fe,PURGLOW,False)
    outline(s); return s

def b20(): # GRAND NECROLORD (showpiece)
    s=canvas()
    # skeletal wings behind
    bonewing(s,40,36,-1,1.1); bonewing(s,40,36,1,1.1)
    robe(s,40,30,73,10,22,((24,18,40),(46,32,70),(78,56,112)))
    sleeves(s,40,40,16,((24,18,40),(46,32,70),(78,56,112)),GHOST[2])
    hood(s,40,24,9,((24,18,40),(46,32,70),(78,56,112)),eyes=GRN)
    crown(s,40,15,9,BONE,5,GRN)
    # giant floating open Necronomicon spewing green fire
    R(s,30,46,50,60,(40,26,18,255)); R(s,31,47,39,59,BONE[2]); R(s,41,47,49,59,BONE[1]); R(s,39,46,41,60,(20,14,10,255))
    disc(s,40,52,3,GRN); disc(s,40,52,5,(120,255,150,90))
    for a in range(0,360,45):
        fx=40+int(9*math.cos(math.radians(a))); fy=52+int(7*math.sin(math.radians(a)))
        disc(s,fx,fy,1.6,(120,255,150,130))
    # green fire rising
    for j,yy in enumerate(range(40,30,-3)): disc(s,40,yy,2.4-j*0.3,(120,255,150,120))
    # staff
    thick(s,20,28,20,64,1.4,WOOD[1]); disc(s,20,26,3,BONE[1]); disc(s,20,26,1.4,GRN)
    outline(s,(30,20,50,255)); return s

BOSSES=[
 (b1,"THE SEXTON","gravedigger"),(b2,"BONE LICH","skeletal king"),
 (b3,"ROTLORD","warden giant"),(b4,"THE SHROUD","necromancer"),
 (b5,"BONEYARD","bone golem"),(b6,"PALE PRIEST","death cleric"),
 (b7,"COLLECTOR","corpse hauler"),(b8,"WRAITH KING","ghost lord"),
 (b9,"PLAGUE KEEPER","masked warden"),(b10,"ASHEN MONK","hooded"),
 (b11,"TOMB TITAN","mausoleum"),(b12,"DEADROOT","root-bound"),
 (b13,"WAXWARDEN","candle keeper"),(b14,"IRON SEXTON","armored"),
 (b15,"GHOUL KING","bestial royal"),(b16,"SPECTRAL WIDOW","veiled"),
 (b17,"BONE SERPENT","coiled keeper"),(b18,"COLOSSUS","grave giant"),
 (b19,"CROWCLOAK","feathered"),(b20,"NECROLORD","grand showpiece"),
]

def to_img(a): return Image.fromarray(a,"RGBA")
def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()

cols,rows=5,4; SPR=160; cell_w,cell_h=176,210; margin_x,top=26,96
sheet_w=margin_x*2+cols*cell_w; sheet_h=top+rows*cell_h+20
bg=np.zeros((sheet_h,sheet_w,3),dtype=np.uint8)
for y in range(sheet_h):
    t=y/sheet_h; bg[y,:]=(max(int(22-8*t),6),max(int(16-4*t),6),max(int(30-8*t),10))
sheet=Image.fromarray(bg,"RGB").convert("RGBA"); d=ImageDraw.Draw(sheet)
d.text((margin_x,18),"THE GRAVEKEEPER  —  20 BOSS DESIGNS",font=font(30),fill=(228,222,240))
d.text((margin_x,56),"climbs from a grave · wields the Necronomicon · pick one (or mix: 'body of #4, crown of #2')",font=font(16),fill=(158,150,180))
d.line((margin_x,88,sheet_w-margin_x,88),fill=(80,60,100),width=2)
for i,(fn,name,role) in enumerate(BOSSES):
    arr=fn()
    base=to_img(k.shadow_layer(40,74,16,3,90)); base=Image.alpha_composite(base,to_img(arr))
    big=base.resize((SPR,SPR),Image.NEAREST)
    cx=margin_x+(i%cols)*cell_w; cy=top+(i//cols)*cell_h
    d.rounded_rectangle((cx+4,cy+4,cx+cell_w-6,cy+cell_h-6),radius=8,fill=(24,20,36,255),outline=(74,58,96,255),width=1)
    sheet.alpha_composite(big,(cx+8,cy+6))
    bx,by=cx+12,cy+10
    d.ellipse((bx,by,bx+30,by+30),fill=(96,40,110,255),outline=(210,170,235,255),width=2)
    num=str(i+1); f=font(19); tb=d.textbbox((0,0),num,font=f)
    d.text((bx+15-(tb[2]-tb[0])/2,by+15-(tb[3]-tb[1])/2-1),num,font=f,fill=(240,235,245))
    fn2=font(17); tb=d.textbbox((0,0),name,font=fn2)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2,cy+168),name,font=fn2,fill=(232,226,242))
    fr=font(14); tb=d.textbbox((0,0),role,font=fr)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2,cy+190),role,font=fr,fill=(164,152,186))
sheet.convert("RGB").save("/tmp/gravekeeper_bosses.png"); print("saved",sheet.size)
