#!/bin/sh
# Final-file checks: streams, duration, frame rate, black frames, long freezes (intentional holds are listed), loudness / true peak, narration sync.
HERE=$(cd "$(dirname "$0")/.." && pwd); O="$HERE/VAJONT_OPENING_FINAL_1080P.mp4"; LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
[ -x "$HERE/.bin/ffmpeg" ] && PATH="$HERE/.bin:$PATH"
echo "== streams"; ffprobe -v error -show_entries format=duration,size:stream=codec_name,profile,width,height,r_frame_rate,nb_frames,sample_rate,channels -of compact "$O"
echo "== black frames (none expected)"; ffmpeg -hide_banner -nostats -i "$O" -vf "blackdetect=d=0.1:pix_th=0.04" -an -f null - 2>&1 | grep black_start || echo "none"
echo "== freezes > 1.5 s (expected: the date hold ≈33.1–35.0 s and the verdict hold ≈65.1–67.8 s)"; ffmpeg -hide_banner -nostats -i "$O" -vf "freezedetect=n=0.0015:d=1.5" -an -f null - 2>&1 | grep -E "freeze_(start|duration)" | sed 's/.*lavfi.//'
echo "== loudness (target −14 LUFS, true peak ≤ −1 dBTP)"; ffmpeg -hide_banner -nostats -i "$O" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
echo "== narration sync"; "$LIB/.venv/bin/python" "$HERE/tools/qa_sync.py" "$O" "$HERE/source/narration/NARRATION_ElevenLabs_67s.mp3"
