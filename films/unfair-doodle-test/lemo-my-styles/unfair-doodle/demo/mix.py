"""Sound for the Unfair Doodle test cut (60.29 s): the user's narration + an original comedic score + cartoon foley.

Score: 110 BPM in C major, I–vi–IV–V (C Am F G), ukulele strums + pizzicato bass and cellos + a pizzicato violin hook +
quirky percussion (bass drum, claps, shaker, woodblock, tambourine), glockenspiel and xylophone for reveals. Each section's
grid starts on its own cut, so the first beat is the cut. The music STOPS for the deadpan beats ("Now it's time for…" until
the line after THE FINE PRINT, and "That last one isn't from a study…" through SIBLING SCAN) and for the drum-roll hold.
Foley comes from the page's events (events.json), one sound per event type (table SFX below).
Voice: compressed, ~10 dB (RMS) above the music; the music ducks under speech. Out: $OUT/mix.wav (48 kHz stereo, un-normalised;
tools/master.py sets −14 LUFS / −1 dBTP).
Run:  "$LIB/.venv/bin/python" mix.py      (LIB = the library folder)
"""
import json, os, sys
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, clack, whoosh, pop, thump, ding, noise, t_, env_exp, norm

OUT = os.environ.get('OUT') or os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
D = json.load(open(os.path.join(OUT, 'events.json')))
DUR = float(D['dur']); N = int(round(DUR * SR)) + SR // 2
EV = D['ev']
T = lambda o: round(o + (.8 if o >= 36.75 else 0) + (1.8 if o >= 44.70 else 0) + (.5 if o >= 54.84 else 0), 3)
S.seed(7); rng = np.random.default_rng(5)

# ================= score =================
BPM = 110; B = 60 / BPM; BAR = 4 * B
CH = {'C': (48, [67, 60, 64, 72]), 'Am': (45, [69, 60, 64, 69]), 'F': (41, [69, 60, 65, 69]), 'G': (43, [67, 62, 67, 71]), 'E': (40, [68, 59, 64, 71])}
PROG = ['C', 'Am', 'F', 'G']
HOOK = [(0, 72, .5), (.5, 76, .5), (1, 79, .5), (1.5, 76, .5), (2.5, 74, .5), (3, 72, .5),        # a pizzicato hook (beats, pitch, length)
        (4, 69, .5), (4.5, 72, .5), (5, 76, .5), (6, 74, .5), (6.5, 72, .5), (7, 71, .5)]
ev = []
def strum(t, notes, vel, up=False, gain=.55):
    for i, p in enumerate(reversed(notes) if up else notes): ev.append((t + i * .012, 'ukulele', p, .32, vel * (.85 if up else 1), -.25 + .12 * i, gain))
def section(t0, t1, energy=1.0, hook=True, bars_prog=PROG):
    """a section of the groove from cut t0 to t1 (the grid starts on t0)"""
    nb = int(np.ceil((t1 - t0) / BAR))
    for b in range(nb):
        tb = t0 + b * BAR; root, notes = CH[bars_prog[b % len(bars_prog)]]
        for k, (beat, up) in enumerate([(0, 0), (1, 0), (1.5, 1), (2.5, 1), (3, 0), (3.5, 1)]):           # D . D U . U D U
            tt = tb + beat * B
            if tt < t1 - .05: strum(tt, notes, (.62 if k in (0, 4) else .46) * (.8 + .2 * energy), bool(up))
        for beat, st, v in [(0, 0, .75), (2, 7, .6), (3.5, 12, .45)]:
            tt = tb + beat * B
            if tt < t1 - .05: ev.append((tt, 'contrabass_pizz', root + st - 12 if root + st - 12 >= 28 else root + st, .4, v, 0, .95))
        for beat in (0, 2):
            tt = tb + beat * B
            if tt < t1 - .05: ev.append((tt, 'cellos_pizz', root + 12, .3, .5, .15, .5))
        # percussion
        for beat in range(4):
            tt = tb + beat * B
            if tt >= t1 - .05: continue
            if beat in (0, 2): ev.append((tt, 'bass_drum', None, None, .55 * energy, 0, .8))
            if beat in (1, 3): ev.append((tt, 'claps', 'solo', None, .5 * energy, .1, .45))
            for h in (0, .5):
                if tt + h * B < t1 - .05: ev.append((tt + h * B, 'shaker', None, None, .35 if h else .25, .35, .35 * energy))
        for beat in (.75, 2.75):
            tt = tb + beat * B
            if tt < t1 - .05 and energy > .7: ev.append((tt, 'woodblock', 'a' if beat < 1 else 'b', None, .5, -.4, .35))
        if hook and b % 2 == 0:
            for beat, p, ln in HOOK:
                tt = tb + beat * B
                if tt < t1 - .05: ev.append((tt, 'violins_pizz', p, ln * B, .55, .3, .42 * energy))
def downbeat(t, root='C', big=False):
    r, notes = CH[root]; strum(t, notes, .8); ev.append((t, 'contrabass_pizz', r, .6, .85, 0, 1))
    ev.append((t, 'bass_drum', None, None, .9 if big else .7, 0, 1)); ev.append((t, 'crash' if big else 'sus_cymbal', None, None, .6 if big else .4, 0, .45 if big else .3))

# cold open: 0 → 11.65 (hit on frame 1; the bigger beats — UNFAIR, FINAL BOSS, the eyebrow — get the loudest hits)
downbeat(0, 'C', big=True)
section(0, 11.65, energy=1.0)
for t in (.78, 6.90): downbeat(t, 'C', big=True)
ev.append((T(9.20), 'glockenspiel', 84, .6, .7, .2, .5)); ev.append((T(9.20) + .08, 'glockenspiel', 91, .6, .6, .2, .4))
# body 1: #4 → "Now it's time for…" (33.55), a little lighter under the narration
downbeat(11.65, 'G'); section(11.65, 33.55, energy=.75)
# return after THE FINE PRINT sting (shot 17) until the deadpan confession (shot 18)
t17 = T(36.96) - .1; t18 = T(41.24) - .1
downbeat(t17, 'F'); section(t17, t18, energy=.75, bars_prog=['F', 'G', 'C', 'Am'])
# back after SIBLING SCAN: the checklist (shots 20-21)
t20 = T(44.87) - .1; t22 = T(52.88) - .1
downbeat(t20, 'C'); section(t20, t22, energy=.8)
# shot 22: a tense pizzicato pulse on E under the spotlight, stopping for the drum-roll hold
hold0 = T(54.84) - .02
for i in range(int((hold0 - t22) / (B / 2))):
    tt = t22 + i * B / 2; ev.append((tt, 'contrabass_pizz', 40 if i % 2 == 0 else 47, .25, .55 + .2 * i / 8, 0, .8))
    if i % 2 == 1: ev.append((tt, 'violins_pizz', 76 + (i // 2) % 3, .2, .4, .3, .3))
# the reveal: cymbal on "the ghost", then the music button after the last word
tg = T(54.99) - .1
downbeat(tg, 'C', big=True)
for i, p in enumerate([72, 76, 79, 84]): ev.append((tg + .05 + i * .07, 'glockenspiel', p, .8, .6, -.2 + .15 * i, .45))
tb = T(56.19) + .1
for i, (inst, p) in enumerate([('ukulele', 60), ('ukulele', 64), ('ukulele', 67), ('ukulele', 72)]): ev.append((tb + i * .01, inst, p, .6, .9, -.2 + .1 * i, .7))
ev.append((tb, 'contrabass_pizz', 36, .8, .9, 0, 1)); ev.append((tb, 'cellos_pizz', 48, .5, .8, 0, .6)); ev.append((tb, 'violins_pizz', 84, .4, .8, .3, .5))
ev.append((tb, 'bass_drum', None, None, .9, 0, 1)); ev.append((tb, 'claps', 'group', None, .7, 0, .5)); ev.append((tb + .02, 'xylophone', 96, .4, .7, .3, .45))
music = S.render(ev, dur=N / SR)
music = S.room(music, size=.25, mix=.1)

# ================= foley =================
fx = np.zeros((N, 2), np.float32)
def pitch(x, p):
    if abs(p - 1) < 1e-3: return x
    n = int(len(x) / p); return np.interp(np.arange(n) * p, np.arange(len(x)), x).astype(np.float32)
def slap(v=1):                     # paper slap
    d = .12; return norm(hp(noise(d), 1500) * env_exp(d, .012)) * v
def scratch(d, v=1):               # pencil on paper: band-passed noise, choppy strokes
    x = bp(noise(d), 2400, 6500); tt = t_(d); m = .55 + .45 * np.sign(np.sin(2 * np.pi * (7 + 3 * rng.random()) * tt)); m = lp(m, 40)
    return norm(x * m * np.minimum(1, np.minimum(tt / .02, (d - tt) / .05))) * v
def sine_glide(d, f0, f1, v=1, vib=0, shape=None):
    tt = t_(d); f = f0 * (f1 / f0) ** (tt / d) * (1 + vib * np.sin(2 * np.pi * 7 * tt)); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = shape(tt) if shape else np.minimum(1, np.minimum(tt / .01, (d - tt) / .05)); return (x * e * v).astype(np.float32)
def crickets(d):
    out = np.zeros(int(d * SR), np.float32)
    for k in range(int(d / .5)):
        for j in range(3):
            at = int((k * .5 + j * .055 + .02 * rng.random()) * SR); dd = .035; tt = t_(dd)
            ch = np.sin(2 * np.pi * 4600 * tt) * np.sin(np.pi * tt / dd) * (.6 + .4 * np.sin(2 * np.pi * 120 * tt))
            out[at:at + len(ch)] += ch[:len(out) - at] * (.8 if k % 2 else .55)
    return norm(out) * .5
def clatter(d):
    out = np.zeros(int((d + .2) * SR), np.float32); t = 0; k = 0
    while t < d: c = clack(1.4 + .4 * rng.random(), .5 + .5 * rng.random()); at = int(t * SR); out[at:at + len(c)] += c[:len(out) - at]; t += .05 + .07 * rng.random(); k += 1
    return norm(out) * .8
def choir(d=1.3):                  # a short "aaah": formant-filtered sawtooth chord (C major), soft attack
    tt = t_(d); out = np.zeros_like(tt)
    for f0 in (261.6, 329.6, 392.0, 523.3):
        for det in (-.004, .004):
            f = f0 * (1 + det) * (1 + .006 * np.sin(2 * np.pi * 5.2 * tt)); ph = np.cumsum(f) / SR; out += 2 * (ph % 1) - 1
    v = sum(a * bp(out, fc * .85, fc * 1.15) for fc, a in [(730, 1), (1090, .6), (2440, .25)])
    return norm(v * np.minimum(1, tt / .12) * np.minimum(1, (d - tt) / .4)) * .9
def scanhum(d):
    tt = t_(d); x = .5 * np.sin(2 * np.pi * 120 * tt) + .25 * np.sin(2 * np.pi * 240 * tt) + .15 * bp(noise(d), 800, 3000) * (.5 + .5 * np.sin(2 * np.pi * 3 * tt))
    return norm(x * np.minimum(1, np.minimum(tt / .1, (d - tt) / .1))) * .6
def beep(p=1, v=1): d = .09; tt = t_(d); return (np.sign(np.sin(2 * np.pi * 1000 * p * tt)) * .3 + np.sin(2 * np.pi * 1000 * p * tt) * .7) * np.minimum(1, (d - tt) / .01) * v
def bonk(): d = .45; tt = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(330 * (1 - .45 * tt / d)) / SR) * env_exp(d, .09) + .4 * hp(noise(d), 2000) * env_exp(d, .004))
def boing(): return sine_glide(.6, 180, 420, .8, vib=.08, shape=lambda tt: np.exp(-tt / .25))
def wooo(): return lp(sine_glide(1.4, 520, 300, .7, vib=.03, shape=lambda tt: np.sin(np.pi * tt / 1.4) ** 2), 1800)
def boss():
    x = S.render([(0, 'timpani', 43, 1.2, .95, 0, 1), (0, 'bassoon_stac', 'C2', .5, .9, -.2, .8), (0, 'bassoon_stac', 'D#2', .5, .9, .2, .8), (0, 'contrabass_pizz', 36, .6, .9, 0, .9), (.02, 'crash', None, None, .5, 0, .4)], dur=1.6, master=False)
    return x
def drumroll(d):
    x = S.render([(0, 'snare', 'roll', d, .75, 0, 1)], dur=d + .3, master=False)
    ramp = np.linspace(.35, 1, len(x))[:, None]; return x * ramp
def glock(ps, dt=.06, v=.6): return S.render([(i * dt, 'glockenspiel', p, .5, v, -.2 + .1 * i, .6) for i, p in enumerate(ps)], dur=.4 + len(ps) * dt + .5, master=False)
def put(x, t, g=1.0, pan=0.0):
    if x.ndim == 2: i = int(round(t * SR)); n = min(len(x), N - i); fx[i:i + n] += (x[:n] * g).astype(np.float32) if n > 0 else 0
    else: add(fx, x.astype(np.float32), t, g, pan)

for e in EV:
    t, k, v, p = e['t'], e['type'], e.get('v', 1.0), e.get('p', 1.0)
    if k == 'whoosh': put(whoosh(.28, 1), t - .12, .32 * v, .2 * np.sin(t))
    elif k == 'whip': put(whoosh(.18, 1), t - .06, .4)
    elif k == 'zoom': put(pitch(whoosh(.22, 1), 1.4), t - .05, .3)
    elif k == 'hit': pass                                   # the score's downbeat is the frame-1 hit
    elif k == 'slide': put(lp(bp(noise(.6), 300, 2500), 2500) * np.linspace(1, .2, int(.6 * SR)) * np.sin(np.linspace(0, np.pi, int(.6 * SR))) ** .5, t, .35)
    elif k == 'slide2': put(lp(bp(noise(.32), 500, 4000), 4000) * np.sin(np.linspace(0, np.pi, int(.32 * SR))), t, .3)
    elif k == 'thud': put(thump(1, 65), t, .7 * v)
    elif k == 'slam': put(thump(1, 60), t + .12, .8 * v); put(slap(), t + .12, .45 * v)
    elif k == 'pop': put(pitch(pop(1), p), t, .35)
    elif k == 'twinkle': put(glock([96, 100, 103], .05, .45), t, .5)
    elif k == 'clatter': put(clatter(e.get('d', .4)), t, .45)
    elif k == 'clack': put(clack(p, 1), t, .5)
    elif k == 'stamp': put(thump(1, 52), t, .9 * v); put(click(.45, 1), t, .35 * v); put(slap(), t, .3 * v)
    elif k == 'boss': put(boss(), t, .9)
    elif k == 'hop': put(S.render([(0, 'woodblock', 'c', None, .7, 0, 1)], dur=.4, master=False), t, .45 * p)
    elif k == 'ding': put(ding(1), t, .35)
    elif k == 'pencil': put(scratch(e.get('d', .4)), t, .2, .25)
    elif k == 'crickets': put(crickets(e.get('d', 1.6)), t, .3, .3)
    elif k == 'deflate': put(sine_glide(.7, 1100, 260, 1), t, .22)
    elif k == 'bonk': put(bonk(), t, .65)
    elif k == 'beep': put(beep(p, 1), t, .14 * v)
    elif k == 'clasp': put(S.render([(0, 'marimba', 72 + int(4 * (p - 1) * 5), .4, .6, 0, 1)], dur=.6, master=False), t, .4)
    elif k == 'run': put(glock([72, 76, 79, 84, 88], .08, .55), t, .5)
    elif k == 'droop': put(sine_glide(.6, 700, 240, 1, vib=.02), t, .22)
    elif k == 'choir': put(choir(1.3), t, .4)
    elif k == 'boing': put(boing(), t, .35)
    elif k == 'scanhum': put(scanhum(e.get('d', 1.8)), t, .35)
    elif k == 'tick': put(click(1.6, 1), t, .5); put(glock([88], .05, .5), t, .35)
    elif k == 'spot': put(thump(1, 90), t, .5); put(click(.6, 1), t, .4)
    elif k == 'drumroll': put(drumroll(e.get('d', 1.2)), t, .7)
    elif k == 'cymbal': put(S.render([(0, 'crash', None, None, .85, 0, 1)], dur=2.5, master=False), t + .08, .55)
    elif k == 'wooo': put(wooo(), t, .3)
fx = S.room(fx, size=.15, mix=.06)

# ================= voice =================
vo, _ = sf.read(os.path.join(OUT, 'vo_edit.wav'), dtype='float32')
rob, _ = sf.read(os.path.join(OUT, 'robot_fx.wav'), dtype='float32')
v = np.zeros(N, np.float32); v[:len(vo)] = vo[:N]
add_at = int(round((T(44.69) + .1) * SR)); v[add_at:add_at + len(rob)] += rob * .75
v = hp(v, 70).astype(np.float32)
v = compress(v, thr=.18, ratio=3.5, att=.004, rel=.09)
vs = np.stack([v, v], 1)

# ================= balance + duck =================
def rms(x): return float(np.sqrt(np.mean(x ** 2) + 1e-12))
speech = np.abs(v) > 1e-3
vr = rms(v[speech]); mr = rms(music[np.repeat(speech[:, None], 2, 1)].reshape(-1, 2)) if speech.any() else rms(music)
music *= (vr / mr) * 10 ** (-10 / 20)                       # music ~10 dB below the voice (RMS, while speaking)
env = np.convolve(np.abs(v), np.ones(int(.05 * SR)) / int(.05 * SR), 'same')
env = np.clip(env / (np.percentile(env[speech], 60) + 1e-9), 0, 1)
k = int(.15 * SR); env = np.convolve(env, np.ones(k) / k, 'same')       # smooth attack and release
duck = 10 ** (-5 * env / 20)                                # up to −5 dB more under speech
mid = bp(music, 300, 4000) * (duck[:, None] - 1) * .6           # the music gives way most in the voice band
music = music * duck[:, None] + mid
mix = vs + music + fx * (vr / max(rms(fx), 1e-6)) * 10 ** (-9 / 20)
mix = limit(mix, .95)
sf.write(os.path.join(OUT, 'mix.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(OUT, 'stem_music.wav'), music.astype(np.float32), SR)
sf.write(os.path.join(OUT, 'stem_fx.wav'), fx.astype(np.float32), SR)
print('mix.wav', round(len(mix) / SR, 2), 's · voice rms', round(20 * np.log10(vr), 1), 'dB · music rms (speech)', round(20 * np.log10(rms(music[speech])), 1), 'dB')
print('instruments:', S.credits(sorted({e[1] if isinstance(e, tuple) else e['inst'] for e in ev} | {'timpani', 'bassoon_stac', 'snare', 'crash', 'woodblock', 'marimba', 'glockenspiel'})))
