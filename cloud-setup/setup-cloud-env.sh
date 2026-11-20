#!/bin/sh
# Restore the Lemo-Opuscar render environment in a fresh Claude Code cloud container.
#   1. FFmpeg 7+ static build from johnvansickle.com into a private folder (MD5 checked against the published value)
#   2. that folder first on PATH (~/.bashrc, ~/.profile)
#   3. the library's own core tier: sh plugin/skills/lemo-opuscar/scripts/setup.sh deps
# Safe to run again: each step is skipped when already done. Run it from the repository, or from the folder above it.
# Needs network access to johnvansickle.com (allowed in the environment) plus npm and PyPI (package managers).
set -e
FFDIR=${FFMPEG_DIR:-$HOME/.local/opt/ffmpeg-7}
URL=https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

# —— 1. FFmpeg 7+ ——
if "$FFDIR/bin/ffmpeg" -version 2>/dev/null | head -1 | grep -Eq '^ffmpeg version n?([7-9]|[1-9][0-9])\.'; then
  echo "✓ FFmpeg already installed: $("$FFDIR/bin/ffmpeg" -version | head -1 | cut -d' ' -f1-3)"
else
  echo "↓ downloading FFmpeg static build"
  T=$(mktemp -d)
  ( cd "$T"
    curl -fsSL --retry 3 -O "$URL" -O "$URL.md5"
    md5sum -c ffmpeg-release-amd64-static.tar.xz.md5
    mkdir x && tar -xJf ffmpeg-release-amd64-static.tar.xz -C x
    V=$(./x/*/ffmpeg -version | head -1 | sed -n 's/^ffmpeg version n\{0,1\}\([0-9]*\)\..*/\1/p')
    [ -n "$V" ] && [ "$V" -ge 7 ] || { echo "✗ downloaded FFmpeg is not 7+ ($V)"; exit 1; }
    mkdir -p "$FFDIR/bin"
    cp x/*/ffmpeg x/*/ffprobe "$FFDIR/bin/"
    cp x/*/GPLv3.txt x/*/readme.txt "$FFDIR/" )
  rm -rf "$T"
  echo "✓ FFmpeg installed: $("$FFDIR/bin/ffmpeg" -version | head -1 | cut -d' ' -f1-3)"
fi

# —— 2. PATH ——
for f in "$HOME/.bashrc" "$HOME/.profile"; do
  grep -qs "$FFDIR/bin" "$f" || printf '\n# Lemo-Opuscar: private FFmpeg 7 build first on PATH\nexport PATH="%s/bin:$PATH"\n' "$FFDIR" >> "$f"
done
PATH="$FFDIR/bin:$PATH"; export PATH

# —— 3. the library's core packages (npm, headless browser, Python .venv) ——
if top=$(git rev-parse --show-toplevel 2>/dev/null) && [ -f "$top/plugin/skills/lemo-opuscar/scripts/setup.sh" ]; then LIB=$top
elif [ -f lemo-opuscar/plugin/skills/lemo-opuscar/scripts/setup.sh ]; then LIB=$(pwd)/lemo-opuscar
else echo "! lemo-opuscar repository not found here: skipped its packages"; exit 0; fi
( cd "$LIB" && sh plugin/skills/lemo-opuscar/scripts/setup.sh deps )
