# Unfair Doodle — Style Prompt

Based on Sci-Fi Sitcom Toon (scifi-toon) from Lemo-Opuscar.
Default size: 1920×1080 at 30 fps.

> Comedic science rankings as an adult-animation sitcom on a cream void: thick constant-weight outlines, flat cream bodies, big white reaction eyes, elastic mouths, brows that carry the emotion, and one star, a suited ivory die who rolls in to introduce every item and reacts in the corner or in full-frame close-ups. One coral T-shirt marks who the story is about. Hard cuts every ~3 s, zoom punches, slams, solid-colour beats, and two recurring stings (THE FINE PRINT, SIBLING SCAN).
> References (grammar only): adult-swim-era sitcom cartoons (thick outlines, reaction close-ups, dry escalation); comedic ranking explainers with one mascot on cream paper; 1950s limited animation for pops, sparkles and rank medallions; sketchnoting for checklists; whiteboard explainers for labels written on the word. Copy none of their characters, silhouettes, colour combos, names, catchphrases, logos, layouts or music; never name them in a film.

## 1. Essence, and what it is not

Hand-drawn-looking 2D TV comedy: **uniform thick near-black outlines, constant on screen at any zoom**, **flat fills with hard-edged shadow shapes only where needed (no gradients)**, **big white eyes on reactions**, **elastic mouths**, **brows that carry the emotion**, and **reaction close-ups** after every absurd image. The comedy is the narrator's dry voice against extreme, instant expressions. Every person is a filled cartoon body (bean torso, tube limbs, mitten hands, nub feet, head 1:3 for kids and 1:4 for adults), never a stick figure. The host is the star.

Not a stick-figure explainer (bodies have volume and clothes), not a kids' cartoon (dry humour, deadpan beats), not a sci-fi sitcom (no worlds, portals or sky bands: the ground is a flat cream void), not a vector explainer (outlines boil, very slightly).

**Copyright red lines (non-negotiable):** never reproduce any existing show's characters, silhouettes or colour combos (e.g. a spiky-blue-haired old man in a lab coat with a kid in a yellow shirt), names, catchphrases, logos or devices; never copy a reference channel's mascot, characters, segment graphics or wording. Invent your own cast and props.

## 2. Materials & rendering

- **Line**: near-black #1D1D22, **13 px** for bodies, the host and props (12–14 at 1080p), 9 px for face details, fingers and inner lines (face lines scale gently with face size, 5–11 px). **Constant in screen space**: shapes are transformed to the screen first, then stroked with an identity transform, so close-ups are redrawn at the same weight.
- **Boil**: very subtle: outlines resampled every ~7 px and displaced along the normal by low-frequency noise, **amplitude 0.6 px**, 3 drawings cycling at 12 fps. **Off** on the host, on text, on badges and on UI stings.
- **Fills**: flat. People are cream **#FFFDF6**; clothing is one flat colour with one hard-edged darker shadow shape on the side away from the light; kids wear shorts in warm dark grey. No gradients.
- **People** (`actor()` in `demo/toon.js`): bean torso, tube arms and legs with thickness, mitten hands with finger bumps, rounded nub shoes, no elbows or knees drawn, no neck. Head-to-body ≈ 1:3 for kids, 1:4 for adults. Body shapes differ per character (the firstborn tall and lanky, the middle kid average, the youngest small and round). Hair is one flat dark shape or one thick stroke; mom has a dark bun and a simple dress.
- **Faces**: small black dot eyes by default; on reactions and close-ups big white ovals with thick outlines and black pupils. Thin curved brows; thick angled filled brows for anger or shock. No nose (or a tiny hook). Mouths: line, grin, frown, open "D" with teeth and tongue, zigzag, wavy, small "o". Extras: sweat drops, blush marks, streaming tears. Expressions are **extreme** and **switch instantly** (no in-betweens).
- **The host** (`host2()`): a rounded ivory die #FFF8E7 (corner radius ≈ 18 %) drawn as one solid cube silhouette (front face, top face with pips that read like hair and show the item number after a roll, a sliver of side face; a three-quarter turn widens the side face), the same 13 px outline. Big white oval eyes with one large black pupil and a highlight at every size; **very big, thick filled eyebrows**, each ≈ 1/4 of the face wide; a mouth that opens to teeth and tongue. A navy suit #24315E with a white collar and a mustard tie #F2B632; ink stick limbs with thickness, white mitten gloves, ink nub shoes.
- **Ornaments**: 4-point sparkles (ink, or cream on dark), starbursts (tint fill, ink outline) behind rank badges, rank badges (mustard disc or rosette, Luckiest Guy number), icon badges (mustard disc with a white icon), a mustard crown, white speech bubbles, puffy dust clouds drawn as one outlined union, hand-drawn arrows and ticks drawn stroke by stroke.

## 3. Colour logic

- **Ground**: a flat cream void #F7F3EA with a very fine grain. **No ground line**: characters float unless they stand on a prop (a staircase, a base, a pile of toys).
- **Full-screen solid colours for emotional or diagram beats**: black #111114 (the final boss, SIBLING SCAN, the drum roll and spotlight), coral #E8553D (an "UNFAIR"-type slam, an "OUCH"), navy #24315E (a heart-meter or data beat). Text on a dark or coral ground is cream.
- **Coral, one meaning**: the figure the narration is about wears a coral T-shirt (from the moment it is named), and the key number or word on screen is coral. Never decoration.
- **Mustard** only for the host's tie, badges and the crown. **Green #3BB273** only for the scan line, the SIBLING SCAN banner and checklist ticks. **Navy** for the host's suit and the navy beat. Everyone else's clothes are warm greys (#B9B2A5, #CEC7B8, #DCD5C6, #8F887C), hair #2E2A33.
- Line colour and eye white never change.

## 4. Type & subtitles

- **Hand-lettered ALL CAPS**, three free faces, self-hosted: **Permanent Marker** (Apache 2.0) for slams and titles, **Patrick Hand** (OFL) for labels, list lines and speech bubbles (never under 36 px), **Luckiest Guy** (Apache 2.0) for numbers on badges.
- Centred titles and banners are allowed; a rank title card sits top-left (badge, then the title beside it). 1–5 words per card. Small labels sit **next to what they refer to**.
- **Arrival**: pop (0 → 1.15 → 1.0 in 0.2 s), slam (from up to 1.6 down to 1.0 in 4 frames, then a 6-frame shake; start lower for very wide words so every frame stays inside the margin), or written on left to right so it **finishes exactly on the spoken word**.
- **Safe margin**: all text inside 5 % of the frame on every frame (`tools/safecheck.mjs`), and clear of the host's corner.
- **No burned-in subtitles.** Export an `.srt` when the film has narration.

## 5. Motion quality

- 30 fps output; the boil steps at 12 fps; poses and expressions switch instantly or in a single eased move.
- **Acting over moving**: held poses with small changes (a bob of ±3 px, pupils sliding, a sweat drop, nervous jitter on panic).
- **Pop-ins** with a strong back-ease overshoot (~0.25–0.28 s): characters pop up out of the bottom, badges machine-gun in at 0.25 s intervals.
- **The host**: idle bob 2 px on a 1.2 s cycle, a blink every 3–5 s, mouth shapes from the voice loudness (closed / half / open with teeth and tongue). Reactions: one giant eyebrow shooting up, side-eye, shock (sweat drop), wince (gritted teeth), scheming grin with rubbing hands, shrug of the brows.
- **Squash & stretch** on landings; the host's roll tumbles with hops and motion blur.
- **Zoom punch** on punchlines: 1.0 → 1.12 in 4 frames, ease-out, held to the cut. **Shake** on slams: 6–10 px, 6–8 frames.

## 6. Camera grammar

| Move | What it expresses | Can serve |
|---|---|---|
| Hard cut on a whoosh or hit | the default: a new fact | every 2.5–3.5 s; 0.4–1.2 s in a cold open |
| Full-frame host close-up (face ≥ 80 % of the frame) | the punchline lives on the host's face | a reaction after every absurd image; the item number landing; a confession |
| Reaction cut-in | the laugh | a wince after "OUCH", a side-eye |
| Zoom punch | the punchline | a face, a number |
| Solid-colour beat | an emotional or diagram moment | UNFAIR, OUCH, a data comparison, the boss |
| Fast zoom-in (4 frames) | a reveal | the final boss |
| Whip-pan | arriving in a new set | a line-up popping up |
| Fast tilt | travelling a ranking | down a staircase |
| Slide wipe | from the item card to its world | the host's landing → the rank card |
| Slow push (≤ 6 %) | holding attention while words are read | a hug, a pile of toys |

Characters fill **40–60 % of the frame height** in normal shots and **80 %+** in close-ups; never small figures in a big empty frame. Each cut in a cold open changes the ground treatment or the scale. The host is in **60–70 % of shots**: in the bottom-right corner at 30–40 % of the frame height, or as the main subject.

## 7. Sound palette

- **Score**: upbeat comedic, about 110 BPM: ukulele strums, pizzicato strings and bass, quirky percussion (woodblock, claps, shaker, kick, tambourine), glockenspiel or xylophone hits for reveals. It starts on frame 1 with a hit and **stops for deadpan beats** (silence is the punchline), returning on the next line.
- **Foley** (cartoon): whoosh on every cut-in, pop on every pop-in, thud + paper slap for slams, dice clatter for the host's roll and clacks for its bounces, ding for the eyebrow, bonk for a pained face, crickets for a blank, pencil scratch for every written line, a tick per checklist item, drum roll + cymbal for the reveal, a soft "wooo" for a ghost, twinkles for sparkles.
- **Stings**: THE FINE PRINT = rubber-stamp THUNK + a short choir "aaah"; SIBLING SCAN = scanner hum + beeps + a robot voice (TTS through a ring modulator and a bit-crusher).
- **Voice**: the user's narrator. Compress, sit it ≈ 10 dB above the music, duck the music under speech. −14 LUFS integrated, true peak −1 dBTP, AAC 320 kbps.

## 8. Native moves

- **The host's roll.** The die rolls across the frame (tumbles, hops, motion blur, dice clatter) and lands face to camera with the item number of pips on top, eyebrows up, often in a full-frame close-up. Number 1 lands on six.
- **The rank title card.** A rank badge slams top-left and the item's name is written beside it on the word; the subject's T-shirt turns coral at the same moment; the host points at it from the corner.
- **THE FINE PRINT.** A contract slides down, a rubber stamp slams THE FINE PRINT on the word, the host lifts a magnifying glass; the downsides are written one by one under the lens.
- **SIBLING SCAN (or any SCAN).** Black screen, a green scan line sweeps down a silhouette while a robot voice announces it; a green numbered banner; back on cream, a checklist is written and ticked in green on each spoken word.
- **Reaction close-up.** After every absurd image, cut to the host's face filling the frame: one giant eyebrow, a side-eye with a sweat drop, a wince.
- **The slot machine.** A crown hops from head to head on each word before it lands.
- **Join the hands.** Kids pop up and hold hands in a line; the coral runs along the joined arms.
- **The reveal.** Black ground, a spotlight on the subject, drum roll, a held silence, then a rank badge slams with a starburst and sparkles.

## 9. Pitfalls of the medium

- **Scaled outlines.** Stroking under the zoom makes close-up lines fat and wide-shot lines thin. Always transform first, then stroke at identity.
- **Too much boil.** Above ~1 px the shapes swim; keep 0.6 px, and none on the host and on text.
- **Small figures.** At half size the 13 px outline swallows the face. Frame characters at 40–60 % of the frame height.
- **Coral on coral.** On a coral ground the subject's T-shirt disappears; frame the face, or put the subject on cream.
- **Dark lines on dark grounds.** On black, draw silhouettes with a lighter outline; text is cream.
- **Mirrored arms.** Arm presets are written for the left arm and mirrored for the right; an arm aimed at a world point (`reachTo`) must not be mirrored again.
- **Dust as bubbles.** Overlapping outlined puffs read as bubbles; draw a cloud as one union (outlines first, fills on top).
- **Second accent.** Coral anywhere but the subject's shirt or the key word kills its meaning; mustard and green keep their single jobs.
- **Text clipping.** Slams start large; check every frame against the 5 % margin.
- **Copying.** No existing show's or channel's characters, colour combos or segment graphics.

## 10. Engine

- `demo/toon.js`: the cartoon layer: screen-space outlines with a 0.6 px boil (`shp`, `fillP`, `strokeP`, `dotP`, `toonFrame`), point builders (`ell`, `spl`, `rrP`, `noodle`, `arcP`, `rounded`), faces (`faceP`, `eyeP`, `browP`, `mouthP`, `EXPR` presets), the cast (`CAST`, `actor`, `castGeo`, `reachTo`, `shoulderW`, `mitten`, hair), the host (`host2`, `HOSTEX` presets, `mouthHost`), `cloud`.
- `demo/engine.js`: paper, camera (`cam`, `punch`, `shake`), type (`text`, `popK`, `slamK`, `writeOn`), strokes drawn on over time (`strokePart`, `arrow`, `tick`, `scribble`), ornaments (`sparklePop`, `starburst`, `badge`, `crown`, `bubble`), stairs, lip-sync and blinks (`mouthAt`, `blinkAt`), the host's arm poses and roll (`armPose`, `hostRoll`).
- `demo/film.js`: the test cut; reusable pieces: `stingFinePrint(t, ts, n)`, `stingScan(t, t0, n)`, `rankCard(...)`, `checklist(...)`, `iconBadge(...)`, `sibs(...)`, `wipe(...)`, `spotScene()`, `hostFace(t, o)` (full-frame close-up), `hostAt(t, o)` (the corner).
- `demo/sheet.js`: the model sheet (`?scene=sheet`). `demo/tools/safecheck.mjs`: the 5 % text margin on every frame. `demo/tools/voice_prep.py`: voice inserts, robot line, lip-sync envelope.
- Then the base: `$LIB/styles/scifi-toon/demo/toon.js` and `chars.js`.

## 11. Variation space

The agent decides the ranking's items, their order, the facts and jokes, the extra cast, which native moves to spend where and the pacing inside the rules. Keep the cream void, the cast construction, the host (same design, same roll, same reactions), the one coral meaning, the fonts and the two stings exactly as they are.

- **Three structures**: a countdown from 6 to 1 with a reveal per item; a versus (two items scored round by round); a myth list (each "fact" stamped TRUE or FALSE).
- **Three openings**: a cold-open montage teasing the items; the host rolls in on frame 1 and lands on the number of items; one coral word slams full-frame.
- **Three endings**: number 1 lands on six with a crown; the host's full-frame side-eye over the final ranking; the last character walks off the staircase.

---

How the test cut was made (story, shots, score, build): [DEMO.md](DEMO.md). Read it after your treatment exists.
