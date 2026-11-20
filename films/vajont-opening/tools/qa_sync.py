#!/usr/bin/env python3
"""Narration sync check: cross-correlates the finished film's audio with the original narration in three windows (expects 0 ms)."""
import sys, subprocess, numpy as np, soundfile as sf, io
film, narr = sys.argv[1], sys.argv[2]
def pcm(p): return sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True, check=True).stdout))[0]
a, b = pcm(film), pcm(narr); n = min(len(a), len(b)); a, b = a[:n], b[:n]; bad = 0
for t0 in (2, 30, 60):
    s = int(t0 * 16000); w = 16000 * 4; A = a[s:s + w]; best = max(((lag, float(np.dot(A, b[s + lag:s + lag + w]) / (np.linalg.norm(A) * np.linalg.norm(b[s + lag:s + lag + w]) + 1e-9))) for lag in range(-800, 801, 4)), key=lambda r: r[1])
    print(f'sync window {t0:2d} s: offset {best[0] / 16:+.2f} ms, correlation {best[1]:.3f}'); bad += abs(best[0]) > 16 or best[1] < .9
sys.exit(1 if bad else 0)
