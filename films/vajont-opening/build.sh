#!/bin/sh
# Rebuilds VAJONT_OPENING_FINAL_1080P.mp4 and poster.jpg from this folder.
# Needs: the Lemo-Opuscar library (set LIB, or keep this folder at <library>/films/vajont-opening) set up with `setup.sh deps`,
# ffmpeg 7+ on PATH (or .bin/ffmpeg: python3 -m venv .tools && .tools/bin/pip install imageio-ffmpeg && ln -s "$(.tools/bin/python -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')" .bin/ffmpeg),
# and the source material in source/ (scene packages from the Drive folder unpacked in source/scenes, the narration in source/narration).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
[ -x "$HERE/.bin/ffmpeg" ] && PATH="$HERE/.bin:$PATH" && export PATH
FFV=$(ffmpeg -version | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9][0-9]*\)\..*/\1/p'); [ -z "$FFV" ] || [ "$FFV" -ge 7 ] || { echo "ffmpeg 7 or newer is needed"; exit 1; }
cd "$LIB"
"$LIB/.venv/bin/python" core/audio/sampler.py --need "$HERE/audio/mix.py"          # sample libraries (CC0) before the long render
mkdir -p "$HERE/out"
ffmpeg -v error -y -i "$HERE/source/narration/NARRATION_ElevenLabs_67s.mp3" -ac 1 -ar 48000 -c:a pcm_f32le "$HERE/audio/narration_48k.wav"
[ -f "$HERE/page/assets/ai01.jpg" ] || python3 -I "$HERE/tools/prep_assets.py" "$HERE/source/scenes" "$HERE/page/assets"
[ -f "$HERE/page/assets/coast.json" ] || python3 -I "$HERE/tools/coast.py"
python3 -I "$HERE/tools/cues.py" > /dev/null                                          # subtitles from the measured word timings
node core/render/readcheck.mjs "$HERE/page" --step 0.0333                              # every key text long enough to read
node "$HERE/tools/subcheck.mjs"                                                        # one line per subtitle, ≥ 1.8 s, covers its words
node core/render/events.mjs "$HERE/page"                                               # sound cues from the picture
"$LIB/.venv/bin/python" "$HERE/audio/mix.py"                                           # score + foley + room + narration → out/mix.wav
node core/render/video.mjs "$HERE/page" --fps 30 --workers 4 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/master_mux_hq.mp4" 30 0   # −14 LUFS, ≤ −1 dBTP (grain already in the picture)
ffmpeg -v error -y -i "$HERE/out/master_mux_hq.mp4" -map 0 -c:v libx264 -preset slow -crf 25 -pix_fmt yuvj420p -color_range pc -profile:v high -level 4.2 -c:a copy -movflags +faststart "$HERE/VAJONT_OPENING_FINAL_1080P.mp4"
node core/render/still.mjs "$HERE/page" 64.5 66.9 --q nosubs=1 --out "$HERE/out/poster"
cp "$HERE/out/poster/t_64.5.jpg" "$HERE/poster.jpg"; cp "$HERE/out/poster/t_66.9.jpg" "$HERE/thumbnail_verdict.jpg"
sh "$HERE/tools/qa.sh"
