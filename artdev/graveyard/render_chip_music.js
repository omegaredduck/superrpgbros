// render DATA.audio.music.graveyard (the in-game chip song) to a WAV preview
global.window={}; eval(require('fs').readFileSync('/home/claude/srb/game/js/data.js','utf8'));
const D=(typeof DATA!=='undefined')?DATA:window.DATA; const g=D.audio.music.graveyard;
const SR=44100, spb=60/g.bpm;
function noteHz(n){var m=/^([A-G])(#?)(\d)$/.exec(n);if(!m)return 0;var idx={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0);var midi=(+m[3]+1)*12+idx;return 440*Math.pow(2,(midi-69)/12);}
let beats=0; g.tracks[0].notes.forEach(n=>beats+=n[1]);
const loopSec=beats*spb, N=Math.floor(loopSec*SR)+SR;
const mix=new Float32Array(N);
function osc(type,f,ph){ // one sample of square/triangle at phase ph (0..1)
  if(type==='square') return (ph%1)<0.5?1:-1;
  // triangle
  const p=ph%1; return 2*Math.abs(2*p-1)-1;
}
g.tracks.forEach(tr=>{
  let t=0;
  tr.notes.forEach(n=>{
    const dur=n[1]*spb;
    if(n[0]){
      const f=noteHz(n[0]); const st=Math.floor(t*SR), en=Math.floor((t+dur)*SR);
      let ph=0; const dph=f/SR;
      for(let i=st;i<en&&i<N;i++){
        // linear attack 20ms, release 80ms envelope (approx audio.js)
        const rel=(i-st)/SR, left=(en-i)/SR;
        let env=tr.vol;
        if(rel<0.02) env*=rel/0.02;
        if(left<0.08) env*=Math.max(0,left/0.08);
        mix[i]+=osc(tr.type,f,ph)*env;
        ph+=dph;
      }
    }
    t+=dur;
  });
});
// soft clip + normalize
let peak=0; for(let i=0;i<N;i++){mix[i]=Math.tanh(mix[i]*1.2); if(Math.abs(mix[i])>peak)peak=Math.abs(mix[i]);}
const norm=0.9/(peak||1);
const buf=Buffer.alloc(44+N*2);
buf.write('RIFF',0);buf.writeUInt32LE(36+N*2,4);buf.write('WAVE',8);buf.write('fmt ',12);
buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(SR,24);
buf.writeUInt32LE(SR*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
for(let i=0;i<N;i++){let v=Math.max(-1,Math.min(1,mix[i]*norm));buf.writeInt16LE(v*32767|0,44+i*2);}
require('fs').writeFileSync('/tmp/graveyard_chip.wav',buf);
console.log('wrote /tmp/graveyard_chip.wav', (N/SR).toFixed(1)+'s');
