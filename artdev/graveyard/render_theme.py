import numpy as np, wave

SR=44100; BPM=168
STEP=60.0/BPM/4; SPS=int(SR*STEP)
def midi(m): return 440.0*2**((m-69)/12.0)

def adsr(N,a,d,s,r):
    e=np.zeros(N); A=max(int(SR*a),1); D=max(int(SR*d),1); R=max(int(SR*r),1)
    i=0
    if A<N: e[:A]=np.linspace(0,1,A); i=A
    if i+D<N: e[i:i+D]=np.linspace(1,s,D); i+=D
    e[i:]=s
    if R<N: e[-R:]=e[-R:]*np.linspace(1,0,R)
    return e

def sq(freq,N,duty=0.5,vib=0.0,vrate=5.5,detune=0.0):
    t=np.arange(N)/SR
    f=freq*(1+detune)*(1+vib*0.006*np.sin(2*np.pi*vrate*t))
    ph=np.cumsum(f)/SR
    return np.where((ph%1.0)<duty,1.0,-1.0)

def tri(freq,N):
    t=np.arange(N)/SR; ph=(t*freq)%1.0; return 2*np.abs(2*ph-1)-1

def place(buf,start,w):
    if start<0: w=w[-start:]; start=0
    if start>=len(buf): return
    e=start+len(w)
    if e>len(buf): w=w[:len(buf)-start]
    buf[start:start+len(w)]+=w

# ---- voices ----
def organ(freq,N,vol):
    w=sq(freq,N,0.5)*0.5+sq(freq,N,0.5,detune=0.005)*0.4+sq(freq*2,N,0.25)*0.18
    return w*adsr(N,0.06,0.1,0.85,0.14)*vol
def lead(freq,N,vol):
    w=sq(freq,N,0.28,1.0)*0.82+sq(freq*2,N,0.5)*0.14
    return w*adsr(N,0.012,0.08,0.74,0.07)*vol
def pluck(freq,N,vol):
    return sq(freq,N,0.5)*adsr(N,0.002,0.10,0.0,0.02)*vol
def chug(freq,N,vol):
    return sq(freq,N,0.5)*adsr(N,0.002,0.05,0.0,0.01)*vol
def bell(freq,N,vol):
    w=tri(freq,N)*0.6+sq(freq*2.005,N,0.5)*0.25
    t=np.arange(N)/SR; return w*np.exp(-t*2.0)*vol
def bassv(freq,N,vol):
    return (tri(freq,N)*0.82+sq(freq,N,0.5)*0.14)*adsr(N,0.004,0.06,0.62,0.03)*vol

def kickf(N):
    t=np.arange(N)/SR; f=140*np.exp(-t*28)+46
    w=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*13)
    w+=np.random.uniform(-1,1,N)*np.exp(-t*90)*0.25
    return w
def snaref(N):
    t=np.arange(N)/SR
    return np.random.uniform(-1,1,N)*np.exp(-t*21)+np.sin(2*np.pi*185*t)*np.exp(-t*24)*0.45
def hatf(N,op=False):
    t=np.arange(N)/SR
    return np.random.uniform(-1,1,N)*np.exp(-t*(40 if op else 115))
def crashf(N):
    t=np.arange(N)/SR
    return np.random.uniform(-1,1,N)*np.exp(-t*5.5)*0.8

ROOTS={'D':62,'E':64,'F':65,'G':67,'A':69,'Bb':70,'C':72,'Cs':73}
def triad(root,kind):
    r=ROOTS[root]; th=3 if kind=='min' else 4; return [r,r+th,r+7]

def render(sections):
    total=sum(s['bars'] for s in sections)*16
    N=total*SPS+SR*2
    ch={k:np.zeros(N) for k in ('org','arp','ld','bs','rh','dr','bl')}
    step0=0
    for sec in sections:
        bars=sec['bars']; prog=sec['prog']; motif=sec.get('lead',[]); mode=sec['mode']
        lv=sec.get('lv',0.34)
        cur=step0; end=step0+bars*16; mi=0
        while motif and cur<end:
            m,st=motif[mi%len(motif)]; mi+=1
            if m>0:
                dur=int(st*SPS*0.97)
                w=lead(midi(m),dur,lv)+lead(midi(m+12),dur,lv*0.16)
                place(ch['ld'],cur*SPS,w)
            cur+=st
        for b in range(bars):
            root,kind=prog[b%len(prog)]; tones=triad(root,kind)
            base=step0+b*16; broot=ROOTS[root]-24; barN=16*SPS
            last=(b==bars-1)
            # organ pad
            if mode in ('A','B','break','intro','outro','climax'):
                ov={'A':0.10,'B':0.14,'break':0.16,'intro':0.13,'outro':0.13,'climax':0.15}[mode]
                for tn in tones: place(ch['org'],base*SPS,organ(midi(tn),barN,ov))
            # gallop bass (metal engine): per beat [0,2,3]
            if mode in ('A','B','climax'):
                for beat in range(4):
                    bstep=base+beat*4
                    for off,ln,note in [(0,2,broot),(2,1,broot),(3,1,broot if beat%2==0 else broot+7)]:
                        place(ch['bs'],(bstep+off)*SPS,bassv(midi(note),int(ln*SPS*0.95),0.52))
            elif mode in ('break','intro','outro'):
                place(ch['bs'],base*SPS,bassv(midi(broot),int(barN*0.6),0.4))
                place(ch['bs'],(base+8)*SPS,bassv(midi(broot),int(6*SPS),0.3))
            # rhythm chug 16ths
            if mode in ('A','B','climax'):
                for stp in range(16):
                    tone=tones[stp%3]
                    place(ch['rh'],(base+stp)*SPS,chug(midi(tone),int(SPS*0.9),0.09))
            # frantic arpeggio 16ths (gothic harpsichord feel)
            if mode in ('B','break','climax'):
                seq=[tones[0]+24,tones[2]+12,tones[1]+24,tones[2]+24,
                     tones[0]+24,tones[1]+24,tones[2]+12,tones[1]+24]
                av=0.11 if mode!='break' else 0.14
                for stp in range(16):
                    place(ch['arp'],(base+stp)*SPS,pluck(midi(seq[stp%8]),int(SPS*0.95),av))
            # bells
            if b==0 or (mode in ('B','climax') and b%4==0):
                place(ch['bl'],base*SPS,bell(midi(tones[0]+12),int(barN*1.5),0.26))
            # drums
            if mode=='A':
                for stp in [0,3,4,6,8,11,12,14]: place(ch['dr'],(base+stp)*SPS,kickf(int(SPS*1.6))*0.55)
                for stp in [4,12]: place(ch['dr'],(base+stp)*SPS,snaref(int(SPS*2))*0.5)
                for stp in range(0,16,2): place(ch['dr'],(base+stp)*SPS,hatf(int(SPS*1.2))*0.15)
            elif mode in ('B','climax'):
                for stp in range(0,16,2): place(ch['dr'],(base+stp)*SPS,kickf(int(SPS*1.4))*(0.5 if mode=='B' else 0.55))
                for stp in [4,12]: place(ch['dr'],(base+stp)*SPS,snaref(int(SPS*2))*0.5)
                for stp in range(16): place(ch['dr'],(base+stp)*SPS,hatf(int(SPS*0.9))*0.11)
                if b==0: place(ch['dr'],base*SPS,crashf(int(SPS*8))*0.5)
            elif mode=='break':
                place(ch['dr'],base*SPS,kickf(int(SPS*3))*0.42)
                place(ch['dr'],(base+8)*SPS,snaref(int(SPS*3))*0.35)
            if last and mode in ('A','B','climax','break'):
                for j,stp in enumerate([8,10,12,13,14,15]):
                    place(ch['dr'],(base+stp)*SPS,snaref(int(SPS*1.5))*(0.32+j*0.04))
        step0=end
    ch['N']=N; return ch

def reverb(x,wet=0.2):
    out=np.zeros_like(x)
    for D,g in [(1116,0.78),(1277,0.75),(1422,0.72),(1617,0.70)]:
        y=x.copy()
        for s in range(D,len(y),D):
            e=min(s+D,len(y)); L=e-s; y[s:e]+=g*y[s-D:s-D+L]
        out+=y
    out/=4.0
    out=np.convolve(out,np.ones(8)/8,'same')
    return x*(1-wet)+out*wet

# ---------- composition: D harmonic minor, epic/frantic gothic metal ----------
# A verse — stalking, gothic
LA=[(74,4),(77,2),(76,2),(74,4),(73,4), (74,4),(69,4),(70,4),(73,2),(74,2),
    (77,4),(76,2),(74,2),(76,4),(73,4), (74,8),(0,4),(69,4),
    (74,4),(77,2),(76,2),(79,4),(77,4), (76,4),(74,2),(73,2),(74,4),(76,4),
    (77,4),(76,2,),(74,2),(73,4),(70,4), (69,12),(0,4)]
# B chorus — epic soar
LB=[(81,6),(79,2),(77,4),(76,4), (77,6),(76,2),(74,4),(73,4),
    (74,4),(77,4),(81,4),(82,4), (81,12),(0,4),
    (82,6),(81,2),(79,4),(77,4), (79,6),(77,2),(76,4),(74,4),
    (76,4),(77,4),(79,4),(81,4), (86,12),(0,4)]
# break — mournful bells over half-time
LK=[(74,8),(73,8),(70,8),(69,8), (67,8),(69,4),(70,4),(73,12),(0,4),
    (74,8),(77,8),(76,8),(73,8), (74,16)]
# intro/outro toll fragment
LI=[(74,10),(0,6),(69,10),(0,6),(70,10),(0,6),(73,10),(0,22)]

Ap=[('D','min'),('G','min'),('A','maj'),('D','min'),('Bb','maj'),('G','min'),('A','maj'),('D','min')]
Bp=[('Bb','maj'),('G','min'),('D','min'),('A','maj'),('Bb','maj'),('C','maj'),('A','maj'),('D','min')]
Kp=[('D','min'),('Bb','maj'),('G','min'),('A','maj')]
Ip=[('D','min'),('D','min'),('Bb','maj'),('G','min'),('A','maj'),('A','maj'),('D','min'),('D','min')]

sections=[
 dict(bars=8, prog=Ip, lead=LI, mode='intro', lv=0.30),
 dict(bars=16,prog=Ap, lead=LA, mode='A'),
 dict(bars=16,prog=Bp, lead=LB, mode='B', lv=0.36),
 dict(bars=16,prog=Ap, lead=LA, mode='A'),
 dict(bars=12,prog=Kp, lead=LK, mode='break', lv=0.32),
 dict(bars=16,prog=Bp, lead=LB, mode='climax', lv=0.38),
 dict(bars=16,prog=Ap, lead=LA, mode='A'),
 dict(bars=16,prog=Bp, lead=LB, mode='climax', lv=0.38),
 dict(bars=8, prog=Ip, lead=LI, mode='outro', lv=0.26),
]

np.random.seed(13)
ch=render(sections)
wet=reverb(ch['ld']+ch['arp']+ch['bl']+ch['org']*0.55,0.22)
mix=wet+ch['org']*0.45+ch['bs']+ch['rh']+ch['dr']*0.9
mix=np.tanh(mix*1.02)
mix/=np.max(np.abs(mix))+1e-9; mix*=0.92
mix=np.round(mix*96)/96
data=(mix*32767).astype(np.int16)
with wave.open("/tmp/graveyard_theme.wav","w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
bars=sum(s['bars'] for s in sections)
print(f"dur {ch['N']/SR:.1f}s  bars {bars}  peak {np.max(np.abs(mix)):.2f}")
