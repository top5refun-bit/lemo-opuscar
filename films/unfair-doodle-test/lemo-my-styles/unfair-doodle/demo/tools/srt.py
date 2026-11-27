"""test.srt: the narration as a sidecar subtitle file (nothing is burned into the picture). Times are the speech segments of
vo_test.mp3 on the original clock, moved to the film clock (silences inserted at 36.75, 44.70, 54.84); each cue holds
max(1.8 s, speech + 0.6 s) where the next line allows.  usage: python tools/srt.py out.srt"""
import sys
T = lambda o: o + (.8 if o >= 36.75 else 0) + (1.8 if o >= 44.70 else 0) + (.5 if o >= 54.84 else 0)
C = [(0.12, 3.11, 'These are the unfair advantages of your birth order.'), (3.74, 5.51, 'I ranked every spot in the family.'),
     (5.91, 7.97, 'And one of them is the final boss.'), (8.46, 9.62, "It's not the one you think."), (9.99, 11.37, "We're starting from the bottom."),
     (11.75, 13.66, 'Number four. The middle child.'), (13.90, 15.42, 'Or as their parents call them...'), (15.91, 18.37, 'Uh... hang on, I had it a second ago.'),
     (18.94, 22.12, 'In one study, middle kids were 80% less likely'), (22.12, 24.92, 'than the youngest to be the child their mom felt closest to.'),
     (25.37, 26.02, 'Ouch.'), (26.40, 28.73, 'But because nobody was watching,'), (28.94, 30.47, 'middle kids built their own crew.'),
     (30.91, 33.16, "They're more likely to turn to friends than to family."), (33.61, 34.75, "Now it's time for..."), (34.94, 36.64, 'the fine print.'),
     (36.99, 39.07, 'Less attention. Less quality time.'), (39.21, 40.97, 'And you get blamed for everything.'), (41.23, 43.29, "That last one isn't from a study."),
     (43.57, 44.50, "That's from my life."), ('robot', 0, '[ROBOT] Initiating sibling scan.'), (44.88, 46.54, "You've been called by your sibling's name."),
     (46.77, 48.41, 'There are fewer baby photos of you.'), (48.59, 50.32, 'And you were "the easy one."'), (50.67, 52.52, 'Translation: nobody checked.'),
     (52.93, 54.70, 'Middle child... you are...'), (55.05, 55.96, 'the ghost.')]
cues = []
for a, b, s in C:
    if a == 'robot': t0, t1 = T(44.69) + .1, T(44.69) + 1.62
    else: t0, t1 = T(a), T(b)
    cues.append([t0, t1, s])
for i, c in enumerate(cues):
    nxt = cues[i + 1][0] - .05 if i + 1 < len(cues) else 60.29
    c[1] = min(max(c[1] + .6, c[0] + 1.8), max(nxt, c[1]))
ts = lambda x: f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}'
open(sys.argv[1], 'w').write(''.join(f'{i + 1}\n{ts(a)} --> {ts(b)}\n{s}\n\n' for i, (a, b, s) in enumerate(cues)))
print('srt', len(cues), 'cues')
