"""Master and mux: two-pass loudnorm to −14 LUFS with a true-peak ceiling, AAC 320 kbps, picture copied.
Checks the encoded file itself (integrated loudness, true peak) and lowers the ceiling until the AAC's true peak is ≤ −1 dBTP.
usage: python tools/master.py out/video.mp4 out/mix.wav test.mp4"""
import json, re, subprocess, sys
video, wav, out = sys.argv[1:4]
def run(a): return subprocess.run(a, capture_output=True, text=True)
def measure_loudnorm(src, extra=''):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', f'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json{extra}', '-f', 'null', '-'])
    return json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
def ebur(src):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    s = r.stderr[r.stderr.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))
m = measure_loudnorm(wav)
for tp in (-1.5, -2.0, -2.5, -3.0):
    af = (f"loudnorm=I=-14:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
    r = run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
             '-af', af, '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out])
    if r.returncode: print(r.stderr); sys.exit(1)
    I, P = ebur(out)
    print(f'ceiling {tp} dBTP → integrated {I} LUFS, true peak {P} dBTP')
    if P <= -1.0 and abs(I + 14) <= .5: break
else:
    print('warning: could not reach −14 LUFS with a true peak ≤ −1 dBTP'); sys.exit(1)
