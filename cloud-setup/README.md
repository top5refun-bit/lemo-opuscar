# Cloud setup (not part of the style library)

`setup-cloud-env.sh` restores what a Lemo-Opuscar render needs in a fresh Claude Code cloud container:

1. **FFmpeg 7+** (the library's `mux.sh` refuses Ubuntu's 6.1): the static build from johnvansickle.com, its MD5
   checked against the value published next to it, installed privately in `~/.local/opt/ffmpeg-7` (nothing system-wide is replaced).
2. That folder first on `PATH` (`~/.bashrc`, `~/.profile`).
3. The library's own core tier: `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps`.

Run it by hand from the repository root:

```sh
sh cloud-setup/setup-cloud-env.sh
```

It is idempotent: finished steps are skipped. Voice and music tiers are added only when a film needs them
(`sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music`).

The environment must allow `johnvansickle.com` and package managers (npm, PyPI).
