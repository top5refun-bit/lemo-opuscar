#!/usr/bin/env python3
"""Subtitle cues from the narration's word timings (audio/words.json, Parakeet TDT) → page/film.json "subs" + subtitles_en.srt.
Each cue = an on-screen line (digits, real spellings) + how many recognised words it covers (the recogniser spells numbers out)."""
import json, os, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = [("In the summer of 1959, a young geologist", 10), ("named Edoardo Semenza was mapping the slopes", 7), ("of a mountain in the Italian Alps.", 7),
 ("Below him, one of the tallest dams in the world was almost finished.", 13), ("The engineer who had designed that dam was his father.", 10),
 ("What Edoardo found in the rock suggested that", 8), ("an entire mountainside was not as solid as it appeared.", 11),
 ("It bore the scars of an enormous prehistoric landslide,", 9), ("one that had already fallen thousands of years", 8), ("earlier and could move again.", 5),
 ("Four years later, on the night of October 9, 1963,", 12), ("it did.", 2), ("Around 260 million cubic metres of rock", 9),
 ("slid into the lake behind the dam in less than a minute.", 12), ("An enormous wave surged across the reservoir,", 7),
 ("poured over the top of the dam, and destroyed the town below.", 12), ("Almost 2,000 people were killed.", 6),
 ("The dam itself survived with remarkably little damage.", 8), ("It is still standing today.", 6),
 ("This is the story of Vajont, and of how a structure", 11), ("could be engineered with extraordinary precision", 6),
 ("and still stand at the centre of the deadliest", 9), ("landslide disaster in Europe's recorded history.", 6)]
W = json.load(open(os.path.join(D, 'audio/words.json')))['words']
assert sum(n for _, n in CUES) == len(W), (sum(n for _, n in CUES), len(W))
def wend(i): return W[i]['te']   # word end: first silent 20 ms window after its last token (added from the waveform)
film = json.load(open(os.path.join(D, 'page/film.json'))); END = film['narration_dur'] - .02
spans, i = [], 0
for s, n in CUES: spans.append((s, W[i]['t0'], wend(i + n - 1))); i += n
subs = []
for k, (s, a, b) in enumerate(spans):
    t0 = max(subs[-1][1] if subs else 0, a - .12, 0.03)
    nxt = spans[k + 1][1] - .12 if k + 1 < len(spans) else END
    t1 = nxt if nxt - b < .5 else b + .45
    if t1 - t0 < 1.8: t1 = min(max(t1, t0 + 1.8), max(nxt, t1))
    if t1 - t0 < 1.8 and subs:  # still short: start earlier, inside the previous cue's tail (after its last word)
        t0 = max(spans[k - 1][2] + .01, t1 - 1.8); subs[-1][1] = round(t0, 2)
    subs.append([round(t0, 2), round(t1, 2), s])
for k in range(len(subs) - 1): assert subs[k][1] <= subs[k + 1][0] + 1e-6
film['subs'] = subs; open(os.path.join(D, 'page/film.json'), 'w').write(json.dumps(film, indent=1, ensure_ascii=False))
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
with open(os.path.join(D, 'subtitles_en.srt'), 'w') as f:
    for k, (a, b, s) in enumerate(subs, 1): f.write(f"{k}\n{ts(a)} --> {ts(b)}\n{s}\n\n")
for a, b, s in subs: print(f"{a:6.2f} {b:6.2f} {b-a:4.2f}  {s}")
