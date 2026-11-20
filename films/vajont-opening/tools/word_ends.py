#!/usr/bin/env python3
"""Adds 'te' (word end) to audio/words.json: the first 20 ms window under -40 dB after a word's last token, before the next word."""
import json, os, numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a, sr = sf.read(os.path.join(D, 'work/asr/narr16k.wav')); h = int(sr * .02)
db = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + h] ** 2)) + 1e-9) for i in range(0, len(a) - h, h)])
W = json.load(open(os.path.join(D, 'audio/words.json'))); ws = W['words']
for i, w in enumerate(ws):
    nxt = ws[i + 1]['t0'] if i + 1 < len(ws) else len(a) / sr; te = None; j = int((w['tl'] + .06) / .02)
    while j * .02 < nxt:
        if j < len(db) and db[j] < -40: te = j * .02; break
        j += 1
    w['te'] = round(te if te is not None else nxt, 3)
json.dump(W, open(os.path.join(D, 'audio/words.json'), 'w'), indent=0)
