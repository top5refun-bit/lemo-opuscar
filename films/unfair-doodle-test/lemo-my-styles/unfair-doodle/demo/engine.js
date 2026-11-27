// Unfair Doodle — drawing engine (Canvas 2D, deterministic, plain globals).
// Paper, camera (zoom punch, shake), hand-lettered type (pop, slam, write-on), stroke-by-stroke shapes (arrows, ticks),
// stick people with dot-eye faces, the Host (a suited die), props and ornaments (4-point sparkles, starbursts, badges, crown).
// The figure skeleton follows the Stick-figure Explainer rig (one quadratic curve per limb, joint as control point; MIT, see CREDITS).
'use strict';
const W = 1920, H = 1080, FPS = 30;
const QS = new URLSearchParams(location.search);
const BASE = QS.get('base') === '1';            // ?base=1 draws the same frame with the base style's settings (for styleframe-vs-base)

const C = BASE ? {
  paper:'#F3F0EA', ink:'#24242C', coral:'#EB4A2A', mustard:'#E2DDD2', green:'#9C978C', navy:'#24242C', ivory:'#F3F0EA',
  ivTop:'#E2DDD2', ivSide:'#D5CFC2', black:'#24242C', mute:'#9C978C', tint:'#E2DDD2', tint2:'#D5CFC2', white:'#F3F0EA', dark:'#3A3A42' }
: {
  paper:'#F7F3EA', ink:'#1D1D22', coral:'#E8553D', mustard:'#F2B632', green:'#3BB273', navy:'#24315E', ivory:'#FFF8E7',
  ivTop:'#F1E6CB', ivSide:'#E3D5B3', black:'#111114', mute:'#A29C90', tint:'#E7E1D4', tint2:'#D6CFC0', white:'#FFFFFF', dark:'#2B2B31' };
const FONT = BASE ? { slam:'600 {s}px Jost', hand:'500 {s}px Jost', badge:'600 {s}px Jost' }
                  : { slam:'{s}px "Permanent Marker"', hand:'{s}px "Patrick Hand"', badge:'{s}px "Luckiest Guy"' };
const font = (k, s) => FONT[k].replace('{s}', Math.round(s));

const cv = document.getElementById('c'), g = cv.getContext('2d');

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eo = t => { t = clamp(t); return 1 - (1 - t) ** 3; };
const ei = t => clamp(t) ** 2;
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const backO = (t, s = 2.6) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };   // strong back-ease overshoot
const bell = (t, a, b) => { const u = seg(t, a, b); return Math.sin(Math.PI * u); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const TAU = Math.PI * 2;
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fr = t => Math.floor(t * FPS + 1e-6);                     // frame index (for stepped jitter)

// ---------- paper ----------
let paperC = null;
function paper(col) {
  if (col && col !== C.paper) { g.fillStyle = col; g.fillRect(-200, -200, W + 400, H + 400); return; }
  if (!paperC) {
    paperC = document.createElement('canvas'); paperC.width = W; paperC.height = H;
    const x = paperC.getContext('2d'); x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
    const id = x.getImageData(0, 0, W, H), d = id.data, r = mulberry(7);
    for (let i = 0; i < d.length; i += 4) { const n = (r() + r() - 1) * 3; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(id, 0, 0);
  }
  g.fillStyle = C.paper; g.fillRect(-400, -400, W + 800, H + 800);
  g.drawImage(paperC, 0, 0);
}

// ---------- camera: zoom punch and shake ----------
function punch(t, t0, amt = .12) { return t < t0 ? 1 : 1 + amt * eo((t - t0) * FPS / 4); }      // 1 → 1.12 in 4 frames, ease-out, then held
function shake(t, hits, amp = 6, frames = 6) {
  let dx = 0, dy = 0;
  for (const t0 of hits) {
    const k = (t - t0) * FPS; if (k < 0 || k >= frames) continue;
    const a = amp * (1 - k / frames), n = fr(t) * 7 + Math.round(t0 * 100);
    dx += a * (hash(n) * 2 - 1); dy += a * (hash(n + 3.3) * 2 - 1);
  }
  return [dx, dy];
}
// zoom s about the point (cx, cy) plus an offset; everything drawn inside fn is in world (= frame) coordinates
function cam(o, fn) {
  g.save();
  const s = o.s ?? 1, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2;
  g.translate((o.dx || 0) + cx, (o.dy || 0) + cy); g.scale(s, s); if (o.r) g.rotate(o.r); g.translate(-cx - (o.x || 0), -cy - (o.y || 0));
  fn(); g.restore();
}

// ---------- type ----------
let TXT = null;                                                  // texts drawn this frame (window.TEXTS)
function note(id, s, x0, y0, x1, y1, pass) { if (TXT) TXT.push({ id, text: s, x0, y0, x1, y1, ...(pass ? { pass: true } : {}) }); }
// one line of text. o: f (slam|hand|badge), size, col, align, rot, sc (scale), outline (px), oc, a (alpha), track, id
function text(s, x, y, o = {}) {
  const size = o.size || 80, sc = o.sc ?? 1; if (sc <= 0 || (o.a ?? 1) <= 0) return 0;
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(sc, sc);
  g.globalAlpha = clamp(o.a ?? 1);
  g.font = font(o.f || 'slam', size); g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.track) g.letterSpacing = o.track + 'px';
  const w = g.measureText(s).width;
  if (o.outline) { g.lineWidth = o.outline; g.strokeStyle = o.oc || C.ink; g.lineJoin = 'round'; g.strokeText(s, 0, o.dy || 0); }
  g.fillStyle = o.col || C.ink; g.fillText(s, 0, o.dy || 0);
  g.restore();
  if (o.id !== false) {
    const al = o.align || 'center', x0 = al === 'left' ? x : al === 'right' ? x - w * sc : x - w * sc / 2;
    const m = g.getTransform(), p0 = m.transformPoint(new DOMPoint(x0, y - size * .55 * sc)), p1 = m.transformPoint(new DOMPoint(x0 + w * sc, y + size * .55 * sc));
    note(o.id || s, s, p0.x, p0.y, p1.x, p1.y, o.pass);
  }
  return w;
}
function textW(s, f, size) { g.save(); g.font = font(f, size); const w = g.measureText(s).width; g.restore(); return w; }
// pop: scale 0 → 1.15 → 1.0 in 0.2 s
function popK(t, t0, d = .2) {
  if (t < t0) return 0; const u = (t - t0) / d; if (u >= 1) return 1;
  return u < .62 ? 1.15 * eo(u / .62) : lerp(1.15, 1, ss((u - .62) / .38));
}
// slam: 1.6 → 1.0 in 4 frames (accelerating into the hit)
function slamK(t, t0, s0 = 1.6) { if (t < t0) return 0; const u = clamp((t - t0) * FPS / 4); return s0 - (s0 - 1) * u * u; }
// back-ease pop-in for objects (strong overshoot, ~0.25 s)
function inK(t, t0, d = .25) { return t < t0 ? 0 : backO(seg(t, t0, t0 + d)); }
// write-on: revealed left → right like a pen, finishing exactly at t1 (the spoken word)
function writeOn(s, x, y, t, t1, o = {}) {
  const size = o.size || 64, n = s.replace(/\s/g, '').length;
  const d = o.d ?? clamp(n * .045, .3, .8), t0 = t1 - d, p = clamp((t - t0) / d);
  if (p <= 0) return;
  const w = textW(s, o.f || 'hand', size), al = o.align || 'center';
  const left = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
  g.save();
  if (o.rot) { g.translate(x, y); g.rotate(o.rot); g.translate(-x, -y); }
  if (p < 1) { g.beginPath(); g.rect(left - 30, y - size * 1.2, 30 + (w + 30) * eio(p) * 1.0, size * 2.4); g.clip(); }
  text(s, x, y, { ...o, size, id: o.id || s });
  g.restore();
}

// ---------- strokes ----------
function quadPts(a, q, b, n = 40) { const P = []; for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; P.push([s * s * a[0] + 2 * s * t * q[0] + t * t * b[0], s * s * a[1] + 2 * s * t * q[1] + t * t * b[1]]); } return P; }
function polyLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
// draw the first fraction p of a polyline (by length)
function strokePart(P, p, lw, col, cap = 'round') {
  if (p <= 0 || P.length < 2) return null;
  const L = polyLen(P) * clamp(p); let acc = 0;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = cap; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(P[0][0], P[0][1]); let end = P[0], ang = 0;
  for (let i = 1; i < P.length; i++) {
    const dx = P[i][0] - P[i - 1][0], dy = P[i][1] - P[i - 1][1], l = Math.hypot(dx, dy); ang = Math.atan2(dy, dx);
    if (acc + l >= L) { const u = (L - acc) / (l || 1); end = [P[i - 1][0] + dx * u, P[i - 1][1] + dy * u]; g.lineTo(end[0], end[1]); break; }
    acc += l; end = P[i]; g.lineTo(P[i][0], P[i][1]);
  }
  g.stroke(); g.restore(); return { end, ang };
}
// hand-drawn arrow along a quadratic curve; the head lands when the line is complete (p = 1)
function arrow(a, q, b, p, lw = 9, col = C.ink) {
  const r = strokePart(quadPts(a, q, b), p, lw, col); if (!r || p < 1) return;
  const P = quadPts(a, q, b), n = P.length - 1, ang = Math.atan2(P[n][1] - P[n - 3][1], P[n][0] - P[n - 3][0]), L = lw * 4.2;
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
  g.moveTo(b[0] + Math.cos(ang + 2.5) * L, b[1] + Math.sin(ang + 2.5) * L); g.lineTo(b[0], b[1]); g.lineTo(b[0] + Math.cos(ang - 2.5) * L, b[1] + Math.sin(ang - 2.5) * L);
  g.stroke(); g.restore();
}
// a tick drawn stroke by stroke: short leg down, long leg up
function tick(x, y, s, p, col = C.green, lw = 12) {
  const P = [[x - s * .45, y - s * .05], [x - s * .12, y + s * .32], [x + s * .55, y - s * .55]];
  const pts = [...quadPts(P[0], [(P[0][0] + P[1][0]) / 2, (P[0][1] + P[1][1]) / 2 + 2], P[1], 10), ...quadPts(P[1], [(P[1][0] + P[2][0]) / 2 - s * .06, (P[1][1] + P[2][1]) / 2], P[2], 20).slice(1)];
  strokePart(pts, p, lw, col);
}
function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function roundPoly(P, r) {                                       // closed polygon with rounded corners
  g.beginPath(); const n = P.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(P[n - 1], P[0]); g.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; g.arcTo(a[0], a[1], b[0], b[1], r); }
  g.closePath();
}
function fillStroke(fill, lw, col = C.ink) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
function line(a, b, lw, col = C.ink) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore(); }
function circle(x, y, r, fill, lw, col) { g.beginPath(); g.arc(x, y, Math.max(.1, r), 0, TAU); fillStroke(fill, lw, col); }

// ---------- ornaments ----------
function sparkle(x, y, r, col = C.ink, rot = 0) {
  if (r <= .5) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2, b = a + Math.PI / 2, m = a + Math.PI / 4;
    if (!i) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    g.quadraticCurveTo(Math.cos(m) * r * .16, Math.sin(m) * r * .16, Math.cos(b) * r, Math.sin(b) * r);
  }
  g.closePath(); g.fillStyle = col; g.fill(); g.restore();
}
// a 4-point sparkle that pops in with overshoot, twinkles, and shrinks away after `life` s
function sparklePop(t, t0, x, y, r, life = .9, col = C.ink) {
  if (t < t0 || t > t0 + life) return;
  const k = backO(seg(t, t0, t0 + .18), 3) * (1 - ss(seg(t, t0 + life - .25, t0 + life)));
  sparkle(x, y, r * k, col, (t - t0) * 1.4);
}
function starburst(x, y, r0, r1, n, fill = C.tint, lw = 6, rot = 0) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r0 : r1; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  g.closePath(); fillStroke(fill, lw);
}
// rank badge: mustard disc, ink ring, Luckiest Guy number
function badge(x, y, r, label, k = 1, o = {}) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k); if (o.rot) g.rotate(o.rot);
  if (o.rosette) starburst(0, 0, r * 1.08, r * 1.24, 14, C.mustard, clamp(r * .11, 7, 12));
  circle(0, 0, r, C.mustard, clamp(r * .14, 8, 13));
  g.restore();
  text(label, x + (o.ox || 0) * k, y + r * .09 * k, { f: 'badge', size: r * (o.fs || 1.05), sc: k, col: C.ink, id: o.id || ('badge ' + label), pass: o.pass });
}
function crown(x, y, s, fill = C.mustard, q = false) {
  const P = [[-.5, .3], [-.55, -.32], [-.25, -.05], [0, -.45], [.25, -.05], [.55, -.32], [.5, .3]].map(([a, b]) => [x + a * s, y + b * s]);
  roundPoly(P, s * .05); fillStroke(fill, clamp(s * .1, 7, 13));
  if (q) text('?', x, y + s * .02, { f: 'badge', size: s * .5, id: false });
}
function speedLines(x, y, len, n, dir, t, col = C.tint2) {        // dashes trailing behind a moving thing
  for (let i = 0; i < n; i++) {
    const yy = y + (i - (n - 1) / 2) * 26, ph = (t * 9 + i * .37) % 1, l = len * (.6 + .4 * hash(i + 4));
    line([x - dir * (40 + ph * 30), yy], [x - dir * (40 + ph * 30 + l), yy], 8, col);
  }
}
function dustPuffs(x, y, t, t0, n = 6, size = 60, seed = 1) {
  if (t < t0) return;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1.05 + .9 * i / (n - 1)), u = seg(t, t0 + i * .02, t0 + .9 + i * .03), k = backO(seg(t, t0 + i * .02, t0 + .2 + i * .02), 1.6) * (1 - ss(seg(u, .55, 1)));
    const r = size * (.55 + .5 * hash(i + seed)) * k, d = size * (.3 + 1.4 * eo(u));
    if (r > 1) circle(x + Math.cos(a) * d * 1.6, y + Math.sin(a) * d * .7, r, C.paper, 6);
  }
}

// ---------- stick people ----------
// Pose units: figure height = 1. Angle a has direction (sin a, cos a): 0 points down, +π/2 right, π up.
const GEO = { thigh: .2, shin: .2, hipH: .4, spine: .27, sh: .05, upper: .17, fore: .15, headR: .13, stance: .085 };
const REST = { hx: 0, hy: 0, lean: 0, bend: 0, head: 0, la: -.42, lb: .14, ra: .42, rb: -.14, lfx: 0, lfy: 0, rfx: 0, rfy: 0 };
const pose = o => ({ ...REST, ...o });
const dirv = a => [Math.sin(a), Math.cos(a)];
function ik(Hp, F, L1, L2, side) {
  let dx = F[0] - Hp[0], dy = F[1] - Hp[1], d = Math.hypot(dx, dy); const m = (L1 + L2) * .9995;
  if (d > m) { F = [Hp[0] + dx / d * m, Hp[1] + dy / d * m]; dx = F[0] - Hp[0]; dy = F[1] - Hp[1]; d = m; }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const px = Hp[0] + a * dx / d, py = Hp[1] + a * dy / d; let nx = -dy / d, ny = dx / d;
  if (nx * side < 0) { nx = -nx; ny = -ny; }
  return [[px + nx * h, py + ny * h], F];
}
function joints(f, p) {
  const S = f.S, hr = (f.headR || GEO.headR) * S, bx = f.x, gy = f.gy;
  const Hp = [bx + p.hx * S, gy - (GEO.hipH - p.hy) * S];
  const sd = dirv(Math.PI - p.lean), N = [Hp[0] + sd[0] * GEO.spine * S, Hp[1] + sd[1] * GEO.spine * S];
  const mid = [(Hp[0] + N[0]) / 2, (Hp[1] + N[1]) / 2], perp = [-sd[1], sd[0]];
  const Cc = [mid[0] + perp[0] * p.bend * S, mid[1] + perp[1] * p.bend * S];
  const u = 1 - GEO.sh / GEO.spine;
  const Sh = [(1 - u) ** 2 * Hp[0] + 2 * (1 - u) * u * Cc[0] + u * u * N[0], (1 - u) ** 2 * Hp[1] + 2 * (1 - u) * u * Cc[1] + u * u * N[1]];
  const hd = dirv(Math.PI - (p.lean + p.head)), Hd = [N[0] + hd[0] * hr * .92, N[1] + hd[1] * hr * .92];
  const arm = (a, b) => { const e = dirv(a), E = [Sh[0] + e[0] * GEO.upper * S, Sh[1] + e[1] * GEO.upper * S], w = dirv(a + b); return [E, [E[0] + w[0] * GEO.fore * S, E[1] + w[1] * GEO.fore * S]]; };
  const footL = [bx + (-GEO.stance + p.lfx) * S, gy - p.lfy * S], footR = [bx + (GEO.stance + p.rfx) * S, gy - p.rfy * S];
  return { Hp, N, Cc, Sh, Hd, hr, ang: p.lean + p.head, aL: arm(p.la, p.lb), aR: arm(p.ra, p.rb),
    lL: ik(Hp, footL, GEO.thigh * S, GEO.shin * S, -1), lR: ik(Hp, footR, GEO.thigh * S, GEO.shin * S, 1) };
}
function ctrl(A, B, E, k) { const m = [(A[0] + E[0]) / 2, (A[1] + E[1]) / 2]; return [B[0] + (B[0] - m[0]) * k, B[1] + (B[1] - m[1]) * k]; }
const figLW = S => clamp(8 * Math.sqrt(S / 380), 5.5, 14);
// f: {x, gy, S, col, fill, face:{ex, lx, ly, blink, brows}, back, bun, glasses, rot, a, armL/armR: {to, q} overrides, noFace}
function figure(f, p) {
  p = pose(p); const S = f.S, j = joints(f, p), col = f.col || C.ink, lw = f.lw || figLW(S);
  g.save(); g.globalAlpha = f.a ?? 1;
  if (f.rot) { const o = f.pivot || j.Hp; g.translate(o[0], o[1]); g.rotate(f.rot); g.translate(-o[0], -o[1]); }
  g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw; g.beginPath();
  for (const [K, F] of [j.lL, j.lR]) { const Q = ctrl(j.Hp, K, F, .8); g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(Q[0], Q[1], F[0], F[1]); }
  g.moveTo(j.Hp[0], j.Hp[1]); g.quadraticCurveTo(j.Cc[0], j.Cc[1], j.N[0], j.N[1]);
  const arms = [[j.aL, f.armL], [j.aR, f.armR]];
  for (const [[El, Hn], ov] of arms) {
    if (ov === null) continue;
    if (ov) { g.moveTo(j.Sh[0], j.Sh[1]); g.quadraticCurveTo(ov.q[0], ov.q[1], ov.to[0], ov.to[1]); continue; }
    const Q = ctrl(j.Sh, El, Hn, .8); g.moveTo(j.Sh[0], j.Sh[1]); g.quadraticCurveTo(Q[0], Q[1], Hn[0], Hn[1]);
  }
  g.stroke();
  if (f.bun) {                                                    // mom: a bun on top of the head, one stroke and a ring
    const a = Math.PI - j.ang - .55, bx = j.Hd[0] + Math.sin(a) * j.hr * 1.18, by = j.Hd[1] + Math.cos(a) * j.hr * 1.18;
    circle(bx, by, j.hr * .36, f.fill || C.paper, lw * .9, col);
  }
  circle(j.Hd[0], j.Hd[1], j.hr, f.fill || C.paper, lw * .95, col);
  if (!f.back && !f.noFace && !BASE) face(j.Hd[0], j.Hd[1], j.hr, f.face || {}, j.ang, f.fcol || C.ink, lw);
  if (f.glasses) {                                               // huge thick glasses
    const r = j.hr * .36; g.save(); g.translate(j.Hd[0], j.Hd[1]); g.rotate(-j.ang);
    for (const s of [-1, 1]) circle(s * j.hr * .38, -j.hr * .05, r, null, lw * 1.25, C.ink);
    line([-j.hr * .08, -j.hr * .08], [j.hr * .08, -j.hr * .08], lw * 1.1);
    for (const s of [-1, 1]) circle(s * j.hr * .38, -j.hr * .05, r * .2, C.ink, 0);
    g.restore();
  }
  g.restore();
  return j;
}
// dot-eye face: ex = neutral | happy | sad | shocked | side ; lx/ly look offset (−1..1), blink 0..1, brows true/false
function face(x, y, r, o, ang = 0, col = C.ink, lw = 7) {
  const ex = o.ex || 'neutral', lx = o.lx || 0, ly = o.ly || 0, blink = o.blink || 0;
  g.save(); g.translate(x, y); g.rotate(-ang);
  const flw = Math.max(3.2, lw * .62), er = Math.max(3.2, r * .1) * (ex === 'shocked' ? 1.25 : 1);
  const ox = lx * r * .28, oy = ly * r * .16 - r * .06;
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = flw;
  for (const s of [-1, 1]) {
    const exx = ox + s * r * .34 + (ex === 'side' ? r * .12 * (o.sd || 1) : 0), eyy = oy;
    if (blink > .5) { g.beginPath(); g.moveTo(exx - er, eyy); g.lineTo(exx + er, eyy); g.stroke(); }
    else { g.beginPath(); g.ellipse(exx, eyy, er, er * (ex === 'shocked' ? 1.25 : 1), 0, 0, TAU); g.fill(); }
  }
  const brows = o.brows ?? (ex !== 'neutral' && ex !== 'happy');
  if (brows) {
    for (const s of [-1, 1]) {
      const bx = ox + s * r * .34, by = oy - r * (ex === 'shocked' ? .4 : .3);
      let tilt = 0; if (ex === 'sad') tilt = s * .38; if (ex === 'angry') tilt = -s * .4; if (ex === 'side') tilt = s === (o.sd || 1) ? 0 : -.3 * s;
      const c = r * .13 * Math.cos(tilt), sn = r * .13 * Math.sin(tilt);
      g.beginPath(); g.moveTo(bx - c, by - sn); g.lineTo(bx + c, by + sn); g.stroke();
    }
  }
  const mx = ox + (ex === 'side' ? r * .1 * (o.sd || 1) : 0), my = oy + r * .42, mw = r * .26;
  g.beginPath();
  if (ex === 'happy') { g.moveTo(mx - mw, my - r * .04); g.quadraticCurveTo(mx, my + r * .26, mx + mw, my - r * .04); g.stroke(); }
  else if (ex === 'sad') { g.moveTo(mx - mw * .9, my + r * .1); g.quadraticCurveTo(mx, my - r * .14, mx + mw * .9, my + r * .1); g.stroke(); }
  else if (ex === 'shocked') { g.ellipse(mx, my + r * .02, r * .12, r * .16, 0, 0, TAU); g.fill(); }
  else if (ex === 'open') { g.ellipse(mx, my, r * .17, r * .13, 0, 0, TAU); g.fill(); }
  else { g.moveTo(mx - mw * .75, my); g.lineTo(mx + mw * .75, my); g.stroke(); }
  g.restore();
}
// key-framed pose: keys = [[t, pose], …], blended with ease-in-out (one in-between per switch)
function kpose(t, keys) {
  if (t <= keys[0][0]) return pose(keys[0][1]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t < t1) { const u = eio(seg(t, t0, t1)), A = pose(a), B = pose(b), o = {}; for (const k in A) o[k] = lerp(A[k], B[k], u); return o; }
  }
  return pose(keys[keys.length - 1][1]);
}
const kval = (t, keys) => { let v = keys[0][1]; for (const [tt, x] of keys) if (t >= tt) v = x; return v; };   // step value
function breathe(p, t, ph = 0) { p.hy += .006 * (.5 + .5 * Math.sin(t * 2.4 + ph)); p.lean += .01 * Math.sin(t * 1.3 + ph); return p; }
function walk(p, t, speed = 2.2, amp = .07) {                    // a simple walk cycle (feet alternate, arms swing)
  const s = Math.sin(t * speed * TAU), c = Math.cos(t * speed * TAU);
  p.lfx += amp * s; p.rfx -= amp * s; p.lfy += Math.max(0, c) * .05; p.rfy += Math.max(0, -c) * .05; p.hy += .01 * Math.abs(c);
  p.la -= .25 * s; p.ra -= .25 * s; return p;
}
// arms joined into one continuous curve: A's right hand and B's left hand meet at a clasp point
function claspArms(jA, jB, S, p, sag = .2) {
  const P = [(jA.Sh[0] + jB.Sh[0]) / 2, (jA.Sh[1] + jB.Sh[1]) / 2 + sag * S];
  const d = [jB.Sh[0] - jA.Sh[0], jB.Sh[1] - jA.Sh[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L];
  const QA = [P[0] - u[0] * L * .26, P[1] - u[1] * L * .26], QB = [P[0] + u[0] * L * .26, P[1] + u[1] * L * .26];
  const rA = jA.aR[1], qA = ctrl(jA.Sh, jA.aR[0], jA.aR[1], .8), rB = jB.aL[1], qB = ctrl(jB.Sh, jB.aL[0], jB.aL[1], .8), k = eio(p);
  return { A: { to: [lerp(rA[0], P[0], k), lerp(rA[1], P[1], k)], q: [lerp(qA[0], QA[0], k), lerp(qA[1], QA[1], k)] },
           B: { to: [lerp(rB[0], P[0], k), lerp(rB[1], P[1], k)], q: [lerp(qB[0], QB[0], k), lerp(qB[1], QB[1], k)] }, P, QA, QB };
}

// ---------- the Host: a rounded ivory die in a navy suit ----------
const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]], hair: [[-1, .9], [-.2, .1], [.6, -.8]] };
let ENV = null;                                                  // voice loudness per frame (lip-sync)
function mouthAt(t) {
  if (!ENV) return 0; const i = Math.round(t * ENV.fps); if (i < 0 || i >= ENV.v.length) return 0;
  const v = ENV.v[i]; return v > .42 ? 2 : v > .13 ? 1 : 0;
}
let BLINKS = []; { let t = 1.4, i = 0; while (t < 80) { BLINKS.push(t); t += 3 + 2 * hash(++i * 3.1); } }
const blinkAt = t => BLINKS.some(b => t >= b && t < b + .12) ? 1 : 0;
// h: {x, y (ground under the feet), s (die size), rot, pips, mouth, brow (0..1 raise), browL/browR (extra raise), tilt (brow angle),
//     look:[lx,ly], blink, arms: rest|point|pointL|shrug|rub|clip|mag|wave|up, armT (cycle time), legs: stand|tuck, sweat, squash, prop, a}
function host(h) {
  if (BASE) return;                                              // the base style has no mascot
  const s = h.s, lw = clamp(6 * Math.sqrt(s / 120), 5, 11), sq = h.squash || 0;
  const torsoH = s * .44, legH = s * .32, faceH = s * .9;
  g.save(); g.globalAlpha = h.a ?? 1;
  g.translate(h.x, h.y);
  const cy = -(legH + torsoH + faceH * .5);                       // centre of the die front face, relative to the feet
  if (h.rot) { g.translate(0, cy); g.rotate(h.rot); g.translate(0, -cy); }
  g.scale(1 + sq * .14, 1 - sq * .16);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const tuck = h.legs === 'tuck';
  // legs
  if (!tuck) {
    for (const sd of [-1, 1]) {
      const hx = sd * s * .13, fx = sd * s * (.17 + (h.step ? .05 * Math.sin(h.step) * sd : 0));
      g.strokeStyle = C.ink; g.lineWidth = lw; g.beginPath(); g.moveTo(hx, -legH - 2); g.quadraticCurveTo(hx + sd * s * .02, -legH * .45, fx, -s * .02); g.stroke();
      g.beginPath(); g.ellipse(fx + sd * s * .05, -s * .03, s * .1, s * .055, 0, 0, TAU); g.fillStyle = C.ink; g.fill();
    }
  }
  // torso (navy suit) with a white collar and the mustard tie
  const tw = s * .64, ty = -legH - torsoH;
  rrect(-tw / 2, ty - s * .04, tw, torsoH + s * .06, s * .14); fillStroke(C.navy, lw);
  g.beginPath(); g.moveTo(-s * .17, ty); g.lineTo(0, ty + s * .2); g.lineTo(s * .17, ty); g.closePath(); fillStroke(C.white, lw * .7);
  g.beginPath(); g.moveTo(-s * .045, ty + s * .03); g.lineTo(s * .045, ty + s * .03); g.lineTo(s * .03, ty + s * .08); g.lineTo(-s * .03, ty + s * .08); g.closePath(); fillStroke(C.mustard, lw * .55);
  g.beginPath(); g.moveTo(-s * .03, ty + s * .08); g.lineTo(s * .03, ty + s * .08); g.lineTo(s * .05, ty + s * .27); g.lineTo(0, ty + s * .33); g.lineTo(-s * .05, ty + s * .27); g.closePath(); fillStroke(C.mustard, lw * .55);
  // arms (behind the die where they rise)
  const shY = ty + s * .1, shX = tw / 2 - s * .03;
  const arms = armPose(h, s);
  const handR = s * .085;
  if (!tuck) for (const sd of [-1, 1]) {
    const A = arms[sd < 0 ? 0 : 1]; if (!A) continue;
    const S0 = [sd * shX, shY], E = [A[0][0], A[0][1] + ty], Hn = [A[1][0], A[1][1] + ty];
    g.strokeStyle = C.ink; g.lineWidth = lw; g.beginPath(); g.moveTo(S0[0], S0[1]); g.quadraticCurveTo(E[0], E[1], Hn[0], Hn[1]); g.stroke();
    if (A[2] === 'point') { circle(Hn[0], Hn[1], handR * .9, C.white, lw * .7); line([Hn[0], Hn[1]], [Hn[0] + sd * handR * 1.7, Hn[1] - handR * .3], lw * .9); }
    else circle(Hn[0], Hn[1], handR, C.white, lw * .7);
  }
  // the die: one solid rounded cube (front face + top face + a sliver of side face), one outline round the whole silhouette
  const fw = s, fh = faceH, fx = -fw / 2, fy = ty - fh + s * .02, D = [s * .2, -s * .22], r = s * .18;
  const F0 = [fx, fy], F1 = [fx + fw, fy], F2 = [fx + fw, fy + fh], F3 = [fx, fy + fh];
  const hex = [F3, F0, [F0[0] + D[0], F0[1] + D[1]], [F1[0] + D[0], F1[1] + D[1]], [F2[0] + D[0], F2[1] + D[1] + r * .2], F2];
  roundPoly(hex, r); g.fillStyle = C.ivTop; g.fill();
  g.save(); roundPoly(hex, r); g.clip();
  g.beginPath(); g.moveTo(F1[0], F1[1]); g.lineTo(F1[0] + D[0], F1[1] + D[1]); g.lineTo(F1[0] + D[0] + 300, F1[1] + D[1]); g.lineTo(F2[0] + 300, F2[1] + 300); g.lineTo(F2[0], F2[1]); g.closePath();
  g.fillStyle = C.ivSide; g.fill(); g.restore();
  roundPoly(hex, r); fillStroke(null, lw);
  line([F1[0] - r * .29, F1[1] + r * .29], [F1[0] + D[0] * .8, F1[1] + D[1] * .8], lw * .6);   // the top/side edge
  // pips on top (they read like hair; after a roll they show the item number)
  const pk = h.pips ?? 'hair', pl = PIPS[pk] || PIPS.hair;
  for (const [u, v] of pl) {
    const uu = (u * .3 + .5), vv = (v * .28 + .5);             // u across, v front→back
    const px = fx + uu * fw + vv * D[0], py = fy + 2 + vv * D[1];
    g.beginPath(); g.ellipse(px, py, s * .07, s * .038, 0, 0, TAU); g.fillStyle = C.ink; g.fill();
  }
  rrect(fx, fy, fw, fh, r); fillStroke(C.ivory, lw);
  // face
  const ex = 0, ey = fy + fh * .42, lk = h.look || [0, 0];
  const eR = s * .135;
  for (const sd of [-1, 1]) {
    const x = sd * s * .2;
    if ((h.blink || 0) > .5) { line([x - eR * .8, ey + eR * .1], [x + eR * .8, ey + eR * .1], lw * .9); }
    else {
      circle(x, ey, eR, C.white, lw * .8);
      circle(x + lk[0] * eR * .45, ey + lk[1] * eR * .4, eR * .46, C.ink, 0);
      circle(x + lk[0] * eR * .45 - eR * .14, ey + lk[1] * eR * .4 - eR * .15, eR * .12, C.white, 0);
    }
    // big thick brows (~1/6 of the face wide)
    const raise = (h.brow || 0) + (sd < 0 ? h.browL || 0 : h.browR || 0), tilt = (h.tilt || 0) * sd + (sd < 0 ? h.tiltL || 0 : h.tiltR || 0);
    const big = sd < 0 ? h.bigL || 0 : h.bigR || 0, by = ey - eR * 1.45 - raise * s * .11, bw = s * .17 * (1 + big * .6);
    g.save(); g.translate(x, by); g.rotate(tilt); g.strokeStyle = C.ink; g.lineWidth = s * .065 * (1 + big * .35); g.lineCap = 'round';
    g.beginPath(); g.moveTo(-bw / 2, s * .012); g.quadraticCurveTo(0, -s * .03, bw / 2, s * .012); g.stroke(); g.restore();
  }
  const mo = h.mouth ?? 0, my = fy + fh * .76;
  if (mo === 0) { g.strokeStyle = C.ink; g.lineWidth = lw * .9; g.beginPath(); g.moveTo(-s * .1, my - s * .01); g.quadraticCurveTo(0, my + s * .045, s * .1, my - s * .01); g.stroke(); }
  else if (mo === 1) { g.beginPath(); g.moveTo(-s * .1, my - s * .025); g.quadraticCurveTo(0, my - s * .01, s * .1, my - s * .025); g.quadraticCurveTo(s * .07, my + s * .07, 0, my + s * .07); g.quadraticCurveTo(-s * .07, my + s * .07, -s * .1, my - s * .025); g.closePath(); fillStroke(C.ink, lw * .5); }
  else { g.beginPath(); g.ellipse(0, my + s * .02, s * .12, s * .085, 0, 0, TAU); fillStroke(C.ink, lw * .5); }
  if (h.sweat) {                                                 // sweat drop at the die's corner
    const k = h.sweat, dx = fx + fw + s * .02, dy = fy + fh * .12 + (1 - k) * -s * .05 + k * s * .06;
    g.save(); g.translate(dx, dy); g.scale(k, k); g.beginPath(); g.moveTo(0, -s * .13); g.quadraticCurveTo(s * .08, 0, 0, s * .05); g.quadraticCurveTo(-s * .08, 0, 0, -s * .13); g.closePath();
    fillStroke(C.white, lw * .7); g.restore();
  }
  // props held in front (clipboard, magnifying glass)
  if (h.prop === 'clip' && !tuck) {
    const A = arms[1], Hn = [A[1][0], A[1][1] + ty]; g.save(); g.translate(Hn[0] - s * .05, Hn[1] - s * .1); g.rotate(-.12);
    rrect(-s * .2, -s * .28, s * .4, s * .52, s * .03); fillStroke(C.tint, lw * .8);
    rrect(-s * .08, -s * .32, s * .16, s * .08, s * .02); fillStroke(C.mute, lw * .6);
    for (let i = 0; i < 4; i++) line([-s * .12, -s * .14 + i * s * .09], [s * (i === 3 ? .02 : .12), -s * .14 + i * s * .09], lw * .5);
    g.restore(); circle(Hn[0], Hn[1], handR, C.white, lw * .7);
  }
  if (h.prop === 'mag' && !tuck) {
    const A = arms[1], Hn = [A[1][0], A[1][1] + ty], R = s * .3, cx = Hn[0] + s * .22, cyy = Hn[1] - s * .34;
    line(Hn, [cx - R * .7, cyy + R * .7], lw * 1.6);
    circle(cx, cyy, R, C.white, lw * 1.3); g.save(); g.globalAlpha = .9; circle(cx - R * .35, cyy - R * .35, R * .14, C.tint, 0); g.restore();
    circle(Hn[0], Hn[1], handR, C.white, lw * .7);
  }
  g.restore();
}
// arm poses: [elbow, hand, kind] in die units relative to the top of the torso, for left (−x) and right (+x)
function armPose(h, s) {
  const k = h.arms || 'rest', t = h.armT || 0, R = (sd, ex, ey, hx, hy, kind) => [[sd * ex * s, ey * s], [sd * hx * s, hy * s], kind];
  switch (k) {
    case 'point': return [R(-1, .42, .3, .42, .52), R(1, .58, .02, .8, -.12, 'point')];
    case 'pointL': return [R(-1, .58, .02, .8, -.12, 'point'), R(1, .42, .3, .42, .52)];
    case 'shrug': return [R(-1, .55, .22, .62, -.1), R(1, .55, .22, .62, -.1)];
    case 'up': return [R(-1, .5, -.1, .55, -.45), R(1, .5, -.1, .55, -.45)];
    case 'rub': { const w = Math.sin(t * TAU * 4) * .06; return [R(-1, .4, .38, .06 + w, .28 + Math.abs(w)), R(1, .4, .38, .06 - w, .3 - Math.abs(w))]; }
    case 'clip': return [R(-1, .42, .3, .42, .52), R(1, .5, .34, .48, .2)];
    case 'mag': return [R(-1, .42, .3, .42, .52), R(1, .52, .2, .58, -.05)];
    case 'wave': { const w = Math.sin(t * TAU * 2.5) * .12; return [R(-1, .42, .3, .42, .52), R(1, .52, -.06, .58 + w, -.4)]; }
    default: { const w = Math.sin(t * 1.6) * .015; return [R(-1, .42, .3, .4, .55 + w), R(1, .42, .3, .4, .55 - w)]; }
  }
}
// the Host's signature move: rolls across the frame (3 tumbles with hops and motion blur) and lands face to camera
function hostRoll(h, t, t0, t1, x0, x1, hop = 70) {
  const u = seg(t, t0, t1);
  const draw = uu => {
    const x = lerp(x0, x1, eo(uu * 1.02)), bounce = Math.abs(Math.sin(Math.PI * 3 * uu)) * hop * (1 - uu * .5);
    const rot = -Math.sign(x1 - x0) * -TAU * eo(uu) * 1, landed = uu >= 1;
    host({ ...h, x, y: h.y - (landed ? 0 : bounce), rot: landed ? 0 : rot, legs: landed ? h.legs : 'tuck', arms: landed ? h.arms : 'rest',
      pips: landed ? h.pips : ['hair', 3, 5, 2, 6][Math.floor(uu * 5) % 5], mouth: landed ? h.mouth : 2, brow: landed ? h.brow : .6 });
  };
  if (u > 0 && u < 1) for (let k = 3; k >= 1; k--) { g.save(); g.globalAlpha = .16; draw(Math.max(0, u - k * .035)); g.restore(); }
  draw(u);
}
// world props
function stairs(x, y, stepW, stepH, n = 4, o = {}) {                // step i (0 = bottom) top-left corner at (x + i·w, y − (i+1)·h)
  const lw = o.lw || 12;
  for (let i = n - 1; i >= 0; i--) { g.beginPath(); g.rect(x + i * stepW, y - (i + 1) * stepH, stepW * (n - i), stepH); fillStroke(o.fill || C.paper, lw); }
  return i => [x + i * stepW + stepW / 2, y - (i + 1) * stepH];   // top centre of step i
}
function bubble(x, y, w, h, tx, ty, k = 1) {                     // speech bubble with tail to (tx, ty)
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
  const cx = x, cy = y; g.beginPath(); g.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU); fillStroke(C.white, 11);
  g.beginPath(); g.moveTo(cx - w * .12, cy + h * .38); g.lineTo(tx, ty); g.lineTo(cx + w * .02, cy + h * .44); g.closePath(); fillStroke(C.white, 11);
  g.beginPath(); g.ellipse(cx, cy, w / 2 - 5.5, h / 2 - 5.5, 0, 0, TAU); g.fillStyle = C.white; g.fill();
  g.restore();
}
function heart(x, y, r, fill, lw = 7) {
  g.beginPath(); g.moveTo(x, y + r * .9);
  g.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .9, y - r * 1.25, x, y - r * .45);
  g.bezierCurveTo(x + r * .9, y - r * 1.25, x + r * 1.5, y - r * .1, x, y + r * .9); g.closePath(); fillStroke(fill, lw);
}
function scribble(x, y, w, h, p, seed = 1, lw = 6, col = C.ink) {   // a loopy scribble line written left → right
  const P = [], r = mulberry(seed); for (let i = 0; i <= 60; i++) { const u = i / 60; P.push([x + u * w + Math.sin(u * 38) * 12, y + Math.cos(u * 38) * h * .4 + (r() - .5) * 6]); }
  strokePart(P, p, lw, col);
}
