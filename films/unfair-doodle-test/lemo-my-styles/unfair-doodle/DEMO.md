# Unfair Doodle — demo film: "The Unfair Advantages Of Your Birth Order" (test cut, 60 s)

One example among many. Don't reuse its story, arc, shots, props or timings.

## Story
A comedic ranking of birth order, cut down to its last item for the test: an 11-cut cold open teases every item (a slide into base, UNFAIR, an only child with a whole pizza, the line-up with icon badges, the Host's arrival, the staircase of ranks, a strobe of suspects, the final boss, the slot-machine crown, a giant eyebrow, a tilt down to the bottom step). Then item #4, the middle child: mom forgets their name, a study says mom feels closest to the youngest, OUCH, but the kid builds a crew and picks friends over family. THE FINE PRINT lists the costs; the Host confesses one is personal; SIBLING SCAN runs a checklist; the reveal: the middle child is the ghost.

## Shots (film clock)
1a 0.00 slide into base · 1b 0.78 UNFAIR (coral) · 1c 1.28 only child + pizza · 1d 1.98 line-up + icon badges · 1e 3.63 Host tumbles in · 1f 4.50 staircase badges · 1g 5.78 three "?" flashes · 1h 6.90 FINAL BOSS (black) · 1i 8.36 crown hops · 1j 9.12 giant eyebrow close-up · 1k 9.90 tilt down, Host bounces to step 4 · 6 11.65 roll → landing close-up on "four" → wipe to the rank card · 7–8 13.80 mom points / blanks (mini rank card pinned) · 9 18.85 heart meters on navy, −80 % · 10 22.05 the hug · 11 25.30 OUCH on coral + Host wince cut-in · 12 26.30 nobody watching · 13 28.88 the crew · 14 30.82 FRIENDS / FAMILY · 15 33.55 Host close-up, music stops · 16 34.86 THE FINE PRINT sting · 17 37.66 lines under the lens · 18 41.94 note + side-eye close-up · 19 45.50 SIBLING SCAN sting · 20–21 47.37 checklist · 22 55.38 spotlight + drum roll · 23 57.99 THE GHOST.

## Palette
Cream void #F7F3EA, ink #1D1D22, people #FFFDF6, coral #E8553D (the middle kid's T-shirt, key words), mustard #F2B632 (tie, badges, crown), green #3BB273 (scan, ticks), navy #24315E (suit, the −80 % beat), black #111114 (boss, scan, spotlight), greys #B9B2A5 #CEC7B8 #DCD5C6 #8F887C, hair #2E2A33.

## Score and sound
110 BPM, C major I–vi–IV–V: ukulele strums, pizzicato bass/cellos/violin hook, bass drum, claps, shaker, woodblock; glockenspiel and xylophone for reveals. Each section starts its grid on its cut; the music stops for "Now it's time for…" through THE FINE PRINT and for the confession through SIBLING SCAN, and for the drum-roll hold. Foley per event type is in `mix.py` (table in the loop). Voice compressed, music ~10 dB under it and ducked; master −14 LUFS, −1 dBTP, AAC 320 kbps (`tools/master.py`).

## Build
`sh demo/build.sh` (set `LIB` to the library folder, `OUT` to where it should write). It edits the voice (`tools/voice_prep.py`: three silences, the robot line, the lip-sync envelope), exports events, renders the picture (`video.mjs`, 30 fps), mixes (`mix.py`), masters (`tools/master.py`), writes `test.jpg` and `test.srt`, and runs the checks (`readcheck.mjs`, `tools/safecheck.mjs`).

## Which file draws what
- `toon.js`: screen-space outlines and boil, the cast (`actor`, `CAST`), faces and expressions (`EXPR`), the Host (`host2`, `HOSTEX`), clouds.
- `engine.js`: paper, camera, type and write-on, arrows and ticks, badges, crown, bubbles, sparkles, starbursts, stairs, lip-sync and blinks, the Host's roll.
- `film.js`: every shot, the two stings (`stingFinePrint`, `stingScan`), the rank card, the checklist, the sound events.
- `sheet.js`: the model sheet (`index.html?scene=sheet`).

## Known limits of the test
Some on-screen words are shorter than the reading rule because the user's timings are fixed: the cold-open slams, OUCH, NOBODY WATCHING, THE CREW, "= NOBODY CHECKED", the 1.87 s SIBLING SCAN banner (see `readcheck.txt` after a build). Everything stays inside the 5 % margin on every frame.
