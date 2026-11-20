#!/usr/bin/env python3
"""Mix for "The Dam Didn't Fail. The Mountain Did." → out/mix.wav (48 kHz stereo, float).
Layers (bottom → top): room tone → score (core/audio/sampler: VSCO 2 CE / VCSL, CC0) → procedural foley (core/audio/sfx + local)
→ the user's ElevenLabs narration, used whole and unedited (no trim, no EQ, no compression; level only).
Sound cues come from page/events.json, exported from the same calls that draw the picture; sections and subtitles from page/film.json."""
import json, os, sys
import numpy as np, soundfile as sf, soxr
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(D, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, hp, lp, noise, env_exp, t_, thump, norm, limit, brown, rumble, whoosh

F = json.load(open(os.path.join(D, 'page/film.json'))); DUR = F['frames'] / F['fps']; N = int(round(DUR * SR))
EV = json.load(open(os.path.join(D, 'page/events.json')))['ev']
SEC = {s[0]: (s[1], s[2]) for s in F['sections']}
db = lambda x: 10 ** (x / 20)

# ── narration (unchanged audio; mono → centre) ──
v, sr = sf.read(os.path.join(D, F['narration']), dtype='float32', always_2d=True); v = v.mean(1)
if sr != SR: v = soxr.resample(v, sr, SR)
voc = np.zeros((N, 2), np.float32); voc[:min(N, len(v)), 0] = v[:N]; voc[:min(N, len(v)), 1] = v[:N]

# ── score ──
S.seed(11); ev = []
def E(t, inst, p, d, vel=.5, pan=0., g=1.): ev.append((t, inst, p, d, vel, pan, g))
a, b = SEC['s01'][0], SEC['s04'][1]                      # setup: low D pedal + sparse pizzicato (Dm – B♭ – Gm – A)
E(a, 'contrabass', 'D2', b - a, .45, -.15, .5); E(a + .3, 'cellos', 'A2', b - a - .3, .4, .2, .3)
for sec, pat in [('s01', ['D3', 'F3', 'A3', 'F3']), ('s02', ['D3', 'F3', 'Bb3', 'F3']), ('s03', ['D3', 'G3', 'Bb3', 'G3']), ('s04', ['C#3', 'E3', 'A3', 'E3'])]:
    t0, t1 = SEC[sec]; k = 0; tt = t0 + .25
    while tt < t1 - .1: E(tt, 'cellos_pizz', pat[k % 4], .4, .38 + .1 * (k % 4 == 0), .3, .32); k += 1; tt += .5
a, b = SEC['s05'][0], SEC['s07'][1]                      # discovery: drone thickens, slow pulse, tremolo minor second in 07
E(a, 'contrabass', 'D2', b - a, .45, -.15, .5); E(a, 'cellos', 'D3', b - a, .38, .15, .3); E(SEC['s06'][0], 'violas', 'A3', b - SEC['s06'][0], .32, -.25, .2)
for tt in np.arange(SEC['s06'][0], b - .3, 1.0): E(float(tt), 'contrabass_pizz', 'D2', .5, .6, 0, .35)
E(SEC['s07'][0], 'violins_trem', 'E5', b - SEC['s07'][0], .25, .35, .13); E(SEC['s07'][0] + 1.2, 'violins_trem', 'F5', b - SEC['s07'][0] - 1.2, .3, -.35, .13)
E(SEC['s08'][0], 'cellos', 'D3', 2.3, .3, 0, .25)        # four years later: one cello, then silence for the date
E(35.0, 'timpani', 'D2', 2.4, .75, 0, .7)                 # the event: one timpani stroke on the impact, low pedal, a muted cluster
E(35.0, 'contrabass', 'D2', SEC['s12'][1] - 35.0, .4, 0, .4)
E(SEC['s10'][0], 'cellos', 'D3', SEC['s12'][1] - SEC['s10'][0] - .2, .3, .2, .16); E(SEC['s10'][0] + .4, 'cellos', 'Eb3', SEC['s12'][1] - SEC['s10'][0] - .6, .28, -.2, .14)
# s13: no music
t0 = SEC['s14'][0]                                        # paradox: slow sustained chords
for st, en, notes in [(t0, 54.25, ['D2', 'D3', 'F3', 'A3']), (54.25, SEC['s14'][1], ['Bb1', 'D3', 'F3', 'Bb3']),
                      (SEC['s15'][0], 59.5, ['G1', 'D3', 'G3', 'Bb3']), (59.5, SEC['s15'][1], ['A1', 'E3', 'A3', 'C#4'])]:
    for i, p in enumerate(notes): E(st, 'contrabass' if i == 0 else ('cellos' if i < 3 else 'violas'), p, en - st + .3, .35, (-.2, .1, -.1, .25)[i], (.35, .22, .18, .16)[i])
for t, p in [(56.45, 'D5'), (58.6, 'F5'), (59.6, 'A5')]: E(t, 'vibraphone', p, 2.0, .35, .2, .16)
t0 = SEC['s16'][0]; T1 = DUR                              # verdict: D minor add9, vibraphone arpeggio on the verdict, fading tail
for i, (p, g) in enumerate([('D2', .35), ('D3', .22), ('A3', .18), ('E4', .12), ('F4', .12)]): E(t0, 'contrabass' if i == 0 else ('cellos' if i < 3 else 'violas'), p, T1 - t0, .35, (-.2, .1, -.1, .25, -.25)[i], g)
for i, p in enumerate(['D4', 'A4', 'E5', 'F5', 'A5', 'D6']): E(64.7 + .2 * i, 'vibraphone', p, 2.6, .4, -.3 + .12 * i, .2)
for e in EV:
    if e['type'] == 'mallet': E(e['t'], 'glockenspiel', 'D6' if e.get('n') else 'Eb6', 1.0, .35, .1, .12)
mus = S.render(ev, dur=DUR, master=False)[:N]
if len(mus) < N: mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = S.room(mus, size=.5, mix=.22)[:N]

# ── foley (procedural) ──
fx = np.zeros((N, 2), np.float32)
def shutter(v=1.):
    d = .09; a_ = hp(noise(d), 2000) * env_exp(d, .006); b_ = np.pad(hp(noise(.05), 1500) * env_exp(.05, .005), (int(.045 * SR), 0))[:len(a_)]
    return norm(a_ + b_ * .8) * v
def click(v=1.):
    d = .03; return norm(hp(noise(d), 2500) * env_exp(d, .002) + np.sin(2 * np.pi * 3100 * t_(d)) * env_exp(d, .004) * .5) * v
def tick(v=1.):
    d = .03; return norm(hp(noise(d), 1800) * env_exp(d, .003) + np.sin(2 * np.pi * 2400 * t_(d)) * env_exp(d, .004) * .6) * v
def paper(v=1.):
    d = .28; return norm(bp(noise(d), 1200, 6000) * env_exp(d, .06) * (1 - np.exp(-t_(d) / .012))) * v
def pencil(d=.6, v=1.):
    d = max(.15, d); tt = t_(d); grain = .55 + .45 * np.abs(np.sin(2 * np.pi * 23 * tt + 3 * np.sin(2 * np.pi * 3.1 * tt)))
    return norm(bp(noise(d), 2500, 7500) * grain * np.minimum(1, tt / .03) * np.minimum(1, (d - tt) / .06)) * v
def water(d=2.4, v=1.):
    tt = t_(d); e = np.sin(np.pi * np.minimum(1, tt / d)) ** 1.5; return norm(lp(noise(d), 900) * e + bp(noise(d), 300, 2500) * e * .35) * v
def impact(v=1.):
    th = thump(1.0, 46); r = rumble(3.2) * .5; out = np.zeros(max(len(th), len(r))); out[:len(th)] += th; out[:len(r)] += r; return norm(out) * v
SFX = {'shutter': (lambda e: shutter(), .16), 'click': (lambda e: click(), .10), 'tick': (lambda e: tick(), .14), 'paper': (lambda e: paper(), .18),
       'pencil': (lambda e: pencil(e.get('d', .5)), .06), 'scratch': (lambda e: pencil(.3), .12), 'water': (lambda e: water(2.6), .22),
       'rumble': (lambda e: rumble(3.0), .30), 'impact': (lambda e: impact(), .55), 'whoosh': (lambda e: whoosh(.45), .10),
       'cut': (lambda e: thump(.6, 62), .22), 'verdict': (lambda e: thump(.5, 55), .18)}
for e in EV:
    if e['type'] == 'tickline':
        for i in range(25): add(fx, tick(), e['t'] + i * e['d'] / 24, .05, .3)
        continue
    if e['type'] not in SFX: continue
    if SEC['s13'][0] <= e['t'] < SEC['s13'][1]: continue      # no sound effects on the dead
    fn, g = SFX[e['type']]; add(fx, fn(e).astype(np.float32), e['t'], g * e.get('v', 1.0), .15 if e['type'] in ('shutter', 'click') else 0)

# ── room tone bed (≈ −30 dB under the voice), slightly up in the two silences ──
bed = lp(brown(DUR + .1)[:N], 380); bed = norm(bed) * .5
lvl = np.full(N, db(-44)); tt = np.arange(N) / SR
for a_, b_ in [(SEC['s08'][0] + 2.2, SEC['s08'][1]), SEC['s13']]: lvl[(tt >= a_) & (tt < b_)] = db(-38)
room = np.stack([bed * lvl, np.roll(bed, 4800) * lvl], 1).astype(np.float32)

# ── balance: music RMS about 12 dB under the voice, ducked a further ~9 dB while the voice speaks ──
rms = lambda s: float(np.sqrt(np.mean(s ** 2)) + 1e-12)
vm = np.abs(voc[:, 0]); act = vm > db(-40)
v_rms = rms(voc[act]) if act.any() else rms(voc)
mus *= db(-12) * v_rms / rms(mus[mus.any(1)]) if mus.any() else 1
win = int(.12 * SR); env = np.convolve(vm, np.ones(win) / win, 'same'); env = env / (env.max() + 1e-9)
duck = 1 - (1 - db(-9)) * np.clip(env * 6, 0, 1)
k = np.ones(int(.08 * SR)) / int(.08 * SR); duck = np.convolve(duck, k, 'same')
mus *= duck[:, None]
fx *= db(-1) * float(np.abs(voc).max()) / max(1e-9, float(np.abs(fx).max()))
mix = voc + mus + fx + room
peak = float(np.abs(mix).max()); mix = mix * (db(-3) / peak) if peak > db(-3) else mix
mix = np.stack([limit(mix[:, 0], .89), limit(mix[:, 1], .89)], 1).astype(np.float32)
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), mix, SR, subtype='FLOAT')
for name, s in [('voice', voc), ('music', mus), ('foley', fx), ('room', room)]: sf.write(os.path.join(D, f'out/stem_{name}.wav'), s.astype(np.float32), SR, subtype='FLOAT')
print(f'mix {N / SR:.3f} s · voice rms {20 * np.log10(v_rms):.1f} dBFS · music rms (voiced) {20 * np.log10(rms(mus[act])):.1f} · peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS · {len(ev)} notes · {len(EV)} cues')
