#!/bin/sh
# One command: the Unfair Doodle test cut, "The Unfair Advantages Of Your Birth Order" (60 s, 1920x1080, 30 fps).
#   sh build.sh          voice edit + robot line, events, picture, score + foley + voice mix, master (-14 LUFS, -1 dBTP, AAC 320k),
#                        poster, checks (reading time, 5 % text margin)
# Everything it writes goes to $OUT (default: ./out). LIB is the Lemo-Opuscar library folder.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/home/user/lemo-opuscar}
OUT=${OUT:-$HERE/out}
export LIB OUT
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
mkdir -p "$OUT"
PY="$LIB/.venv/bin/python"

# ffmpeg 7+ (mux and loudness need it): use the system one when new enough, else a private copy from the imageio-ffmpeg package
FFV=$(ffmpeg -version 2>/dev/null | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9][0-9]*\)\..*/\1/p')
if [ -z "$FFV" ] || [ "$FFV" -lt 7 ]; then
  [ -x "$OUT/.tools/bin/python" ] || { python3 -m venv "$OUT/.tools" && "$OUT/.tools/bin/pip" -q install imageio-ffmpeg; }
  mkdir -p "$OUT/bin"; ln -sf "$("$OUT/.tools/bin/python" -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')" "$OUT/bin/ffmpeg"
  ln -sf "$(command -v ffprobe)" "$OUT/bin/ffprobe"; PATH="$OUT/bin:$PATH"; export PATH
fi
# the sample libraries the score uses (downloaded once, before the long render)
"$PY" "$LIB/core/audio/sampler.py" --need "$HERE/mix.py"

# voice: the user's recording with three inserted silences, the robot line (Kokoro am_michael through a ring modulator),
# the Host's lip-sync envelope
mkdir -p "$OUT/robot"
"$PY" "$LIB/core/tts/tts.py" "$HERE/voice/robot.json" "$OUT/robot" > /dev/null
"$PY" "$HERE/tools/voice_prep.py"
[ -f "$HERE/voice/env.json" ] || cp "$OUT/env.json" "$HERE/voice/env.json"

cd "$LIB"
node core/render/events.mjs "$HERE" --out "$OUT/events.json"
node core/render/video.mjs "$HERE" --fps 30 --workers "${WORKERS:-3}" --out "$OUT/video.mp4"
"$PY" "$HERE/mix.py"
"$PY" "$HERE/tools/master.py" "$OUT/video.mp4" "$OUT/mix.wav" "$OUT/test.mp4"
ffmpeg -v error -y -ss 13.6 -i "$OUT/test.mp4" -frames:v 1 -q:v 2 "$OUT/test.jpg"
"$PY" "$HERE/tools/srt.py" "$OUT/test.srt"

node core/render/readcheck.mjs "$HERE" > "$OUT/readcheck.txt" || echo "readcheck: some texts are shorter than the reading rule (cold open and fixed shot lengths; see $OUT/readcheck.txt)"
node "$HERE/tools/safecheck.mjs" "$HERE"
echo "done: $OUT/test.mp4"
