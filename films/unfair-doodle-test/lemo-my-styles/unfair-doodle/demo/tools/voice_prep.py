"""Voice edit for the test cut: insert the three silences, make the robot line, and write the Host's lip-sync envelope.
in:  audio/vo_test.mp3 (the user's recording), $OUT/robot/robot.wav (Kokoro)
out: $OUT/vo_edit.wav (48 kHz mono, film clock), $OUT/robot_fx.wav, $OUT/env.json (loudness per frame, 30 fps; the page reads voice/env.json)"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT') or os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
SR = 48000
INSERTS = [(36.75, .8), (44.70, 1.8), (54.84, .5)]          # original clock, seconds of silence
TAIL = 1.0

def load_vo():
    tmp = os.path.join(OUT, 'vo_48k.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, 'audio', 'vo_test.mp3'), '-ar', str(SR), '-ac', '1', tmp], check=True)
    x, _ = sf.read(tmp, dtype='float32'); os.remove(tmp); return x

x = load_vo()
parts, last = [], 0
for at, d in INSERTS:
    i = int(round(at * SR)); parts += [x[last:i], np.zeros(int(round(d * SR)), np.float32)]; last = i
parts += [x[last:], np.zeros(int(TAIL * SR), np.float32)]
vo = np.concatenate(parts)
# short fades at each splice so nothing clicks (the cuts sit in pauses, this is only a guard)
sf.write(os.path.join(OUT, 'vo_edit.wav'), vo, SR)

# robot: Kokoro line → ring modulator (55 Hz) + bit-crush (sample-and-hold to 8 kHz, 6 bits) + a short metallic comb
r, sr = sf.read(os.path.join(OUT, 'robot', 'robot.wav'), dtype='float32')
r = soxr.resample(r, sr, SR)
t = np.arange(len(r)) / SR
ring = r * np.sin(2 * np.pi * 55 * t)
y = .55 * ring + .45 * r
hold = SR // 8000; y = np.repeat(y[::hold], hold)[:len(y)]
q = 2 ** 5; y = np.round(y * q) / q
d = int(.006 * SR); comb = y.copy(); comb[d:] += .5 * y[:-d]
y = comb / (np.abs(comb).max() + 1e-9) * .9
sf.write(os.path.join(OUT, 'robot_fx.wav'), y.astype(np.float32), SR)

# lip-sync envelope: RMS per 1/30 s frame, smoothed, normalised to the loud passages
fps, hop = 30, SR // 30
n = len(vo) // hop
rms = np.array([np.sqrt(np.mean(vo[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
db = 20 * np.log10(rms + 1e-6)
ref = np.percentile(db[db > -45], 90)
v = np.clip((db - (ref - 26)) / 26, 0, 1)
v = np.convolve(v, [.25, .5, .25], 'same')
json.dump({'fps': fps, 'v': [round(float(a), 3) for a in v]}, open(os.path.join(OUT, 'env.json'), 'w'))
print('vo_edit', round(len(vo) / SR, 2), 's · robot', round(len(y) / SR, 2), 's · env frames', n)
