#!/usr/bin/env python3
"""Cutscene music — ONE LEITMOTIF, three moods (Red's pick 2026-07-17).
CS1 stays SILENT (Red's call). 32kHz mono 16-bit WAV, chiptune only
(squares/triangle/noise — no sine), section-composer-portable note data.

THE CARETAKER THEME (the motif): A-minor rise that can't resolve —
  A4 C5 E5 D5 | C5 E5 A5 G5  (asks a question)
answered in CS3 by the A-MAJOR version that finally lands on the tonic.
"""
import numpy as np
import wave

SR = 32000

def sq(f, t, duty=0.5):
    ph = (t * f) % 1.0
    return np.where(ph < duty, 1.0, -1.0)

def tri(f, t):
    ph = (t * f) % 1.0
    return 4.0 * np.abs(ph - 0.5) - 1.0

def noise(t, seed=0):
    rng = np.random.RandomState(seed)
    return rng.uniform(-1, 1, len(t))

def env(n, a=0.005, d=0.12, s=0.5, r=0.05, dur=None):
    """Simple ADSR over n samples."""
    dur = dur if dur is not None else n / SR
    t = np.arange(n) / SR
    e = np.ones(n) * s
    ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    if ai > 0:
        e[:ai] = np.linspace(0, 1, ai)
    if di > 0 and ai + di < n:
        e[ai:ai + di] = np.linspace(1, s, di)
    if ri > 0 and ri < n:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e

NOTES = {}
NAMES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
_SEMI = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6,
         'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
for octv in range(1, 8):
    for nm, semi in _SEMI.items():
        midi = 12 * (octv + 1) + semi
        NOTES[f"{nm}{octv}"] = 440.0 * (2 ** ((midi - 69) / 12.0))

def render_track(events, total, wave_fn, gain=0.2, duty=0.25):
    """events: (start_beat, dur_beats, note or None) — beat length set by
    caller via 'spb' seconds per beat baked into events already (seconds)."""
    out = np.zeros(int(total * SR))
    for (st, dur, note, g) in events:
        if note is None:
            continue
        n = int(dur * SR)
        t = np.arange(n) / SR
        f = NOTES[note]
        if wave_fn == 'sq':
            w = sq(f, t, duty)
        elif wave_fn == 'tri':
            w = tri(f, t)
        else:
            w = noise(t, seed=int(f))
        w = w * env(n, d=min(0.2, dur * 0.3), s=0.45, r=min(0.09, dur * 0.2))
        i0 = int(st * SR)
        i1 = min(len(out), i0 + n)
        out[i0:i1] += w[:i1 - i0] * g * gain
    return out

# THE MOTIF (scale degrees on A): question phrase + tail
MOTIF_MINOR = ['A4', 'C5', 'E5', 'D5', 'C5', 'E5', 'A5', 'G5']
MOTIF_MAJOR = ['A4', 'C#5', 'E5', 'D5', 'C#5', 'E5', 'A5', 'G#5']
TAIL_MAJOR  = ['A5', 'E5', 'C#5', 'A4']

def cs0_musicbox(path):
    """Hollow music-box: slow, sparse, high, minor. ~36s."""
    spb = 60 / 66.0
    ev_lead, ev_bass = [], []
    tbeat = 0.0
    for rep in range(4):
        for i, n in enumerate(MOTIF_MINOR):
            # music-box: skip some notes late in the phrase (broken comfort)
            if rep >= 2 and i in (3, 6):
                tbeat += 1
                continue
            up = n[:-1] + str(int(n[-1]) + 1)   # octave up = tiny box
            ev_lead.append((tbeat * spb, spb * 0.85, up, 1.0))
            tbeat += 1
        tbeat += 1  # breath between phrases
    # sparse low triangle roots: Am | F | C | E
    roots = ['A2', 'F2', 'C3', 'E2']
    for rep in range(4):
        ev_bass.append((rep * 9 * spb, spb * 6, roots[rep], 0.8))
    total = tbeat * spb + 2
    mix = (render_track(ev_lead, total, 'sq', gain=0.16, duty=0.18)
           + render_track(ev_bass, total, 'tri', gain=0.16))
    _save(path, mix)

def cs2_swell(path):
    """Rising arps under the motif; builds, ends lifted (unresolved). ~26s."""
    spb = 60 / 108.0
    ev_lead, ev_arp, ev_bass = [], [], []
    arp_sets = [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'],
                ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4']]
    tbeat = 0.0
    for rep in range(4):
        chord = arp_sets[rep % 4]
        for i, n in enumerate(MOTIF_MINOR):
            if rep >= 1:
                ev_lead.append((tbeat * spb, spb * 0.9, n, 1.0))
            # arps run underneath constantly, denser each rep
            div = 2 + rep
            for k in range(div):
                ev_arp.append(((tbeat + k / div) * spb, spb / div * 0.9,
                               chord[k % 3], 0.7 + 0.15 * rep))
            tbeat += 1
        ev_bass.append(((tbeat - 8) * spb, spb * 8,
                        ['A2', 'F2', 'C3', 'G2'][rep % 4], 1.0))
    # the lift: end on E/G# dominant, held (question mark)
    ev_lead.append((tbeat * spb, spb * 4, 'E5', 1.0))
    ev_arp.append((tbeat * spb, spb * 4, 'B4', 0.8))
    ev_bass.append((tbeat * spb, spb * 4, 'E2', 1.0))
    total = (tbeat + 5) * spb
    mix = (render_track(ev_lead, total, 'sq', gain=0.15, duty=0.30)
           + render_track(ev_arp, total, 'sq', gain=0.10, duty=0.50)
           + render_track(ev_bass, total, 'tri', gain=0.17))
    _save(path, mix)

def cs3_resolve(path):
    """The MAJOR answer: full, warm, lands the tonic. ~30s."""
    spb = 60 / 96.0
    ev_lead, ev_harm, ev_arp, ev_bass = [], [], [], []
    tbeat = 0.0
    arp_sets = [['A3', 'C#4', 'E4'], ['D4', 'F#4', 'A4'],
                ['E4', 'G#4', 'B4'], ['A3', 'E4', 'A4']]
    for rep in range(4):
        chord = arp_sets[rep % 4]
        for i, n in enumerate(MOTIF_MAJOR):
            ev_lead.append((tbeat * spb, spb * 0.9, n, 1.0))
            if rep >= 1:  # harmony a third up joins
                harm = {'A4': 'C#5', 'C#5': 'E5', 'E5': 'G#5', 'D5': 'F#5',
                        'A5': 'C#6', 'G#5': 'B5'}.get(n)
                if harm:
                    ev_harm.append((tbeat * spb, spb * 0.9, harm, 0.6))
            for k in range(4):
                ev_arp.append(((tbeat + k / 4) * spb, spb / 4 * 0.9,
                               chord[k % 3], 0.8))
            tbeat += 1
        ev_bass.append(((tbeat - 8) * spb, spb * 8,
                        ['A2', 'D3', 'E2', 'A2'][rep % 4], 1.0))
    # the ANSWER tail: lands and holds the tonic chord
    for i, n in enumerate(TAIL_MAJOR):
        ev_lead.append(((tbeat + i) * spb, spb * (0.9 if i < 3 else 5), n, 1.0))
    ev_bass.append((tbeat * spb, spb * 8, 'A2', 1.1))
    ev_harm.append(((tbeat + 3) * spb, spb * 5, 'E4', 0.7))
    ev_harm.append(((tbeat + 3) * spb, spb * 5, 'C#4', 0.6))
    total = (tbeat + 9) * spb
    mix = (render_track(ev_lead, total, 'sq', gain=0.15, duty=0.30)
           + render_track(ev_harm, total, 'sq', gain=0.09, duty=0.45)
           + render_track(ev_arp, total, 'sq', gain=0.08, duty=0.50)
           + render_track(ev_bass, total, 'tri', gain=0.18))
    _save(path, mix)

def _save(path, mix):
    mx = np.max(np.abs(mix)) or 1.0
    mix = mix / mx * 0.72
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('saved', path, f'{len(pcm)/SR:.1f}s')

if __name__ == '__main__':
    cs0_musicbox('/home/claude/cutscenes/assets/cue_cs0_musicbox.wav')
    cs2_swell('/home/claude/cutscenes/assets/cue_cs2_swell.wav')
    cs3_resolve('/home/claude/cutscenes/assets/cue_cs3_resolve.wav')
