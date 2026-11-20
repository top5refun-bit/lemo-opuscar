# VAJONT — "The Dam Didn't Fail. The Mountain Did."

Documentary opening, 67.77 s, 1920×1080, 30 fps, H.264 + AAC, −14 LUFS. Style: Lemo-Opuscar **Visual Investigation** (`styles/visual-investigation/STYLE.md`, unchanged). Every frame is drawn by code (Canvas 2D, `page/index.html`) from the supplied photographs; no AI video.

| File | What |
|---|---|
| `VAJONT_OPENING_FINAL_1080P.mp4` | the finished film |
| `poster.jpg`, `thumbnail_verdict.jpg` | poster (evidence map, 64.5 s) and verdict frame (66.9 s), without subtitles |
| `subtitles_en.srt` | English subtitles (also burned into the picture) |
| `TREATMENT.md` | structure, measured scene timings, shot list, sound design |
| `FACTS.md` | every on-screen claim with its basis; inferences and schematics |
| `CREDITS` | sources, reconstruction disclosures, licences |
| `REPORT_BG.md` | delivery report (Bulgarian) |
| `build.sh` | one command rebuilds the film from `source/` |
| `page/` | the film: `index.html` (16 scenes), `film.json` (sections + subtitles), `events.json` (sound cues exported from the picture), `fonts/`, `assets/` |
| `audio/` | `mix.py` (score, foley, room tone, narration), `words.json` (word timings of the narration) |
| `tools/` | `cues.py` (subtitles from word timings), `subcheck.mjs`, `qa.sh` + `qa_sync.py` (final checks), `prep_assets.py`, `coast.py`, `asr_parakeet.py`, `word_ends.py` |

## Rebuild

1. Put this folder at `<lemo-opuscar>/films/vajont-opening/` (or set `LIB`) and run `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps` in the library.
2. FFmpeg 7+ on `PATH` (the session used the imageio-ffmpeg build 9.0.2; `build.sh` explains how).
3. Unpack the four scene packages into `source/scenes/` and put the narration at `source/narration/NARRATION_ElevenLabs_67s.mp3` (`page/assets/` already holds the prepared images if you use the asset ZIPs).
4. `sh build.sh` — runs the reading-time and subtitle checks, exports the sound cues, mixes, renders 2,033 frames, masters, encodes, makes the poster and runs `tools/qa.sh`.

## Scene timing (from the measured narration)

01 0.00 · 02 3.20 · 03 7.90 · 04 12.00 · 05 15.30 · 06 21.30 · 07 24.80 · 08 28.90 · 09 35.00 · 10 38.50 · 11 41.60 · 12 44.50 · 13 48.30 · 14 51.60 · 15 56.40 · 16 62.10 → 67.77 s
