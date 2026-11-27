// toon.js — Unfair Doodle v2 cartoon layer (plain globals, loaded after engine.js).
// Shapes are point lists in local coordinates; they are transformed to the screen with the canvas's current matrix,
// resampled, given a very subtle boil (0.6 px, 3 drawings at 12 fps), then filled and stroked under an identity
// transform, so outlines keep one weight on screen at every zoom (technique after Sci-Fi Sitcom Toon's toon.js, MIT).
'use strict';
const LW = 13;                                   // the one outline weight (px at 1080p)
const LWF = 9;                                   // face details, fingers, inner lines
const SKIN = '#FFFDF6';
const TB = { k: 0, sid: 0, amp: .6 };
function toonFrame(t) { TB.k = Math.floor(t * 12 + 1e-6) % 3; TB.sid = 0; }
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };

// ---- point builders (local coordinates) ----
function ell(cx, cy, rx, ry, n = 48, a0 = 0) { const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function arcP(cx, cy, rx, ry, a0, a1, n = 20) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function spl(c, closed = true, k = 8) {
  const n = c.length, out = [], P = i => closed ? c[(i + n) % n] : c[clamp(i, 0, n - 1)], m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  if (!closed) out.push(c[n - 1]); return out;
}
function rrP(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const p = [], c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a] of c) for (let i = 0; i <= 8; i++) { const b = a + i / 8 * Math.PI / 2; p.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); }
  return p;
}
const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
// a tube limb from a to b, bent sideways by `bend`, width w0 → w1, round caps
function noodle(a, b, bend, w0, w1 = w0) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const c = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend], mid = quadPts(a, c, b, 14), L1 = [], R1 = [];
  for (let i = 0; i < mid.length; i++) {
    const p = mid[i], q = mid[Math.min(mid.length - 1, i + 1)], o = mid[Math.max(0, i - 1)];
    let tx = q[0] - o[0], ty = q[1] - o[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = lerp(w0, w1, i / (mid.length - 1)) / 2; L1.push([p[0] - ty * w, p[1] + tx * w]); R1.push([p[0] + ty * w, p[1] - tx * w]);
  }
  const n = mid.length, endA = Math.atan2(mid[n - 1][1] - mid[n - 2][1], mid[n - 1][0] - mid[n - 2][0]), begA = Math.atan2(mid[1][1] - mid[0][1], mid[1][0] - mid[0][0]);
  return [...L1, ...arcP(b[0], b[1], w1 / 2, w1 / 2, endA + Math.PI / 2, endA - Math.PI / 2, 8), ...R1.reverse(), ...arcP(a[0], a[1], w0 / 2, w0 / 2, begA - Math.PI / 2, begA - Math.PI * 1.5, 8)];
}

// ---- screen-space draw ----
function scr(pts) { const m = g.getTransform(); return pts.map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]); }
function resample(s, closed, step = 7) {
  const out = [s[0]], n = closed ? s.length : s.length - 1; let acc = 0;
  for (let i = 0; i < n; i++) {
    const a = s[i], b = s[(i + 1) % s.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]); let pos = step - acc;
    while (pos < d) { const u = pos / d; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); pos += step; }
    acc = d - (pos - step);
  }
  if (!closed) out.push(s[s.length - 1]); return out;
}
function boilP(s, closed, amp, seed) {
  if (amp <= 0 || s.length < 4) return s;
  const n = s.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    const ia = closed ? s[(i - 1 + n) % n] : s[Math.max(0, i - 1)], ib = closed ? s[(i + 1) % n] : s[Math.min(n - 1, i + 1)];
    let nx = -(ib[1] - ia[1]), ny = ib[0] - ia[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    let v = vnoise(i * 7 / 38 + seed) * 2 - 1; if (closed) v = lerp(v, vnoise((i - n) * 7 / 38 + seed) * 2 - 1, i / n);
    out[i] = [s[i][0] + nx * v * amp, s[i][1] + ny * v * amp];
  }
  return out;
}
// shp(points, {fill, lw, line, shade(), boil (0 = off), closed, alpha})
const TOV = { fill: null, line: null };                      // override colours (silhouettes)
function shp(pts, o = {}) {
  if (TOV.fill && o.fill) o = { ...o, fill: o.fill === C.white || o.fill === '#3A1620' ? o.fill : TOV.fill };
  if (TOV.line) o = { ...o, line: TOV.line };
  const closed = o.closed !== false, id = TB.sid++, amp = (o.boil ?? 1) * TB.amp;
  let s = scr(pts); if (amp > 0) s = boilP(resample(s, closed), closed, amp, hash(id * 1.37 + 3) * 90 + TB.k * 23.7);
  const P = new Path2D(); P.moveTo(s[0][0], s[0][1]); for (let i = 1; i < s.length; i++) P.lineTo(s[i][0], s[i][1]); if (closed) P.closePath();
  const m = g.getTransform();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.fill && closed) { g.fillStyle = o.fill; g.fill(P); }
  if (o.shade) { g.save(); g.clip(P); g.setTransform(m); o.shade(); g.restore(); }
  if (o.lw !== 0 && o.line !== null) { g.lineWidth = o.lw ?? LW; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = o.line || C.ink; g.stroke(P); }
  g.restore(); return P;
}
const fillP = (pts, fill, o = {}) => shp(pts, { ...o, fill, lw: 0 });
const strokeP = (pts, lw = LWF, o = {}) => shp(pts, { ...o, closed: false, lw });
function dotP(x, y, r, col = C.ink) { const [[a, b]] = scr([[x, y]]), m = g.getTransform(), k = Math.hypot(m.a, m.b); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.beginPath(); g.arc(a, b, Math.max(2, r * k), 0, TAU); g.fill(); g.restore(); }

// ---- face parts ----
// eye: 'dot' small black dot | 'big' white oval with thick outline and a black pupil
function eyeP(cx, cy, R, o) {
  const look = o.look || [0, 0];
  if (o.blink) { strokeP([[cx - R * .14, cy], [cx + R * .14, cy]], LWF_); return; }
  if (o.eyes === 'closed') { strokeP(arcP(cx, cy + R * .05, R * .13, R * .1, Math.PI * 1.1, Math.PI * 1.9, 10), LWF_); return; }
  if (o.eyes === 'big') {
    const rx = R * .25 * (o.eyeS || 1), ry = R * .31 * (o.eyeS || 1);
    shp(ell(cx, cy, rx, ry, 36), { fill: C.white, lw: LWF_ + 1, shade: () => { dotP(cx + look[0] * rx * .45, cy + look[1] * ry * .4, R * (o.pupil ?? .1)); } });
  } else dotP(cx + look[0] * R * .08, cy + look[1] * R * .06, R * .085);
}
// brows: thin curves by default; thick angled filled shapes for anger or shock. ang > 0 = angry (inner ends down), < 0 = sad
function browP(cx, cy, R, sd, o) {
  const b = o.brow || {}, raise = (b.raise || 0) + (sd < 0 ? b.l || 0 : b.r || 0), ang = (b.ang || 0) * sd + (sd < 0 ? b.tl || 0 : b.tr || 0);
  const y = cy - R * .36 - raise * R * .18, w = R * .22;
  push2(cx, y, ang, () => {
    if (b.type === 'thick') fillP(spl([[-w, R * .04], [-w * .2, -R * .06], [w, -R * .05], [w * .95, R * .06], [-w * .1, R * .06]]), C.ink, { boil: .5 });
    else strokeP(quadPts([-w, R * .03], [0, -R * .05], [w, R * .03], 10), LWF_);
  });
}
function push2(x, y, a, fn, sx = 1, sy = sx) { g.save(); g.translate(x, y); if (a) g.rotate(a); if (sx !== 1 || sy !== 1) g.scale(sx, sy); fn(); g.restore(); }
// mouths: line | smile | frown | D (open, teeth, tongue) | zig | wavy | o | grin (closed wide smile)
function mouthP(cx, cy, R, m) {
  const type = m.type || 'line', w = R * .3 * (m.w || 1), o = m.o ?? .8;
  if (type === 'line') strokeP([[cx - w * .6, cy], [cx + w * .6, cy]], LWF_);
  else if (type === 'smile') strokeP(quadPts([cx - w * .8, cy - R * .04], [cx, cy + R * .16], [cx + w * .8, cy - R * .04], 14), LWF_);
  else if (type === 'grin') strokeP(quadPts([cx - w, cy - R * .08], [cx, cy + R * .2], [cx + w, cy - R * .08], 14), LWF_);
  else if (type === 'frown') strokeP(quadPts([cx - w * .7, cy + R * .07], [cx, cy - R * .1], [cx + w * .7, cy + R * .07], 14), LWF_);
  else if (type === 'zig') { const P = []; for (let i = 0; i <= 6; i++) P.push([cx - w * .8 + i * w * 1.6 / 6, cy + (i % 2 ? -1 : 1) * R * .05]); strokeP(P, LWF_); }
  else if (type === 'wavy') { const P = []; for (let i = 0; i <= 20; i++) { const u = i / 20; P.push([cx - w * .8 + u * w * 1.6, cy + Math.sin(u * TAU * 1.5) * R * .04]); } strokeP(P, LWF_); }
  else if (type === 'o') shp(ell(cx, cy + R * .02, R * .09 * o + R * .03, R * .13 * o + R * .03, 28), { fill: '#3A1620', lw: LWF_ });
  else {                                                         // 'D': flat top, round bottom, teeth band, tongue
    const h = R * .32 * o + R * .06, top = cy - R * .04;
    const P = [[cx - w, top], ...quadPts([cx + w, top], [cx + w * .9, top + h * 1.2], [cx, top + h], 10).slice(0, 1), ...quadPts([cx + w, top], [cx + w * .2, top + h * 1.5], [cx - w, top], 18)];
    shp(P, { fill: '#3A1620', lw: LWF, shade: () => { fillP(rectP(cx - w * 1.2, top - 20, w * 2.4, 20 + h * .26), C.white, { boil: 0 }); fillP(ell(cx + w * .15, top + h * .95, w * .55, h * .38, 20), '#E7808A', { boil: 0 }); } });
  }
}
function sweatP(x, y, s) { shp(spl([[x, y - 26 * s], [x + 15 * s, y + 6 * s], [x, y + 20 * s], [x - 15 * s, y + 6 * s]]), { fill: '#CFEAF5', lw: LWF_ }); }
function tearP(x, y, s, a = 0) { push2(x, y, a, () => shp(spl([[0, -18 * s], [11 * s, 4 * s], [0, 14 * s], [-11 * s, 4 * s]]), { fill: '#CFEAF5', lw: LWF_ })); }
// expression presets (switch instantly, no in-betweens)
const EXPR = {
  neutral: { eyes: 'dot', mouth: { type: 'line' } },
  happy: { eyes: 'dot', mouth: { type: 'grin' }, brow: { raise: .2 } },
  joy: { eyes: 'big', mouth: { type: 'D', o: .8 }, brow: { raise: .6 } },
  sad: { eyes: 'dot', mouth: { type: 'frown' }, brow: { ang: -.45, raise: .1 } },
  cry: { eyes: 'big', look: [0, .5], mouth: { type: 'wavy' }, brow: { ang: -.5, raise: .2 }, tears: 1 },
  shocked: { eyes: 'big', pupil: .07, eyeS: 1.15, mouth: { type: 'o', o: 1 }, brow: { type: 'thick', raise: 1.1 } },
  side: { eyes: 'dot', look: [1, 0], mouth: { type: 'line', w: .8 }, brow: { l: -.1, r: .5, tl: .2 } },
  smug: { eyes: 'dot', look: [-1, 0], mouth: { type: 'grin', w: .8 }, brow: { l: .5, tr: .2 } },
  angry: { eyes: 'big', pupil: .08, mouth: { type: 'zig' }, brow: { type: 'thick', ang: .45, raise: -.1 } },
  nervous: { eyes: 'big', pupil: .07, mouth: { type: 'wavy' }, brow: { ang: -.4, raise: .4 }, sweat: 1 },
  blank: { eyes: 'dot', mouth: { type: 'line', w: .5 } },
  open: { eyes: 'dot', mouth: { type: 'D', o: .5 }, brow: { raise: .2 } },
};
let LWF_ = 9;
function faceP(R, ex, extra = {}) {
  const o = { ...(EXPR[ex] || EXPR.neutral), ...extra }, ox = (o.turn || 0) * R * .3, m = g.getTransform();
  LWF_ = clamp(9 * Math.sqrt(R * Math.hypot(m.a, m.b) / 90), 5, 11);
  const ey = -R * .08;
  for (const sd of [-1, 1]) { eyeP(ox + sd * R * .33, ey, R, o); if (o.brow !== false) browP(ox + sd * R * .33, ey, R, sd, o); }
  if (o.nose) strokeP(quadPts([ox + R * .02, R * .08], [ox + R * .12, R * .14], [ox - R * .02, R * .19], 8), LWF_ * .8);
  mouthP(ox + (o.mx || 0) * R, R * .38, R, o.mouth || { type: 'line' });
  if (o.blush) for (const sd of [-1, 1]) fillP(ell(ox + sd * R * .55, R * .2, R * .14, R * .07, 20), '#F2B4A4', { boil: 0 });
  if (o.sweat) sweatP(ox + R * .78, -R * .45, R / 90);
  if (o.tears) { const ph = o.tearT || 0; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const u = (ph * 1.8 + k / 3) % 1; tearP(ox + sd * (R * .36 + u * R * .55), ey + R * .26 + u * R * 1.0 - Math.sin(u * Math.PI) * R * .25, R / 120 * (1 - u * .3), sd * u * .6); } }
}

// ---- the cast ----
const KIDPANTS = '#6F6A62', SHOE = '#3D3942';
const CAST = {
  first: { H: 660, R: 104, tw: 112, th: 220, leg: 200, lw_: 34, arm: 205, aw: 30, shirt: '#B9B2A5', hair: 'flat', lanky: 1 },
  mid: { H: 545, R: 92, tw: 140, th: 172, leg: 150, lw_: 42, arm: 165, aw: 34, shirt: C.coral, hair: 'tuft' },
  young: { H: 445, R: 84, tw: 158, th: 132, leg: 100, lw_: 46, arm: 128, aw: 36, shirt: '#DCD5C6', hair: 'curl', round: 1 },
  only: { H: 470, R: 86, tw: 146, th: 140, leg: 115, lw_: 42, arm: 140, aw: 34, shirt: '#CEC7B8', hair: 'swoop', round: .5 },
  mom: { H: 820, R: 102, tw: 150, th: 300, leg: 230, lw_: 34, arm: 255, aw: 32, shirt: '#8F887C', hair: 'bun', dress: 1, adult: 1 },
  dad: { H: 850, R: 106, tw: 176, th: 280, leg: 260, lw_: 40, arm: 265, aw: 36, shirt: '#A8A194', hair: 'side', adult: 1 },
  f1: { H: 540, R: 90, tw: 136, th: 170, leg: 150, lw_: 40, arm: 160, aw: 34, shirt: '#B9B2A5', hair: 'spike' },
  f2: { H: 500, R: 88, tw: 150, th: 150, leg: 130, lw_: 42, arm: 150, aw: 34, shirt: '#DCD5C6', hair: 'pony' },
  f3: { H: 580, R: 94, tw: 130, th: 190, leg: 165, lw_: 38, arm: 172, aw: 32, shirt: '#CEC7B8', hair: 'cap' },
};
// geometry of a cast member (local, feet at y = 0)
function castGeo(who, P = {}) {
  const c = CAST[who], hipY = -(24 + c.leg), neckY = hipY - c.th, headY = neckY - c.R * .82;
  return { c, hipY, neckY, headY, shL: [-c.tw * .4, neckY + 26], shR: [c.tw * .4, neckY + 26] };
}
// a hanging arm by default; P.armL / P.armR = {h:[dx, dy] hand offset from the shoulder (in arm lengths), bend, front}
const ARM = { hang: { h: [-.18, .96], bend: -8 }, wave: { h: [-.5, -.85], bend: 30 }, up: { h: [-.15, -1], bend: 10 }, point: { h: [-1, -.05], bend: 0 }, hip: { h: [-.45, .55], bend: -60 },
  head: { h: [.2, -.95], bend: -60, front: 1 }, reach: { h: [-.98, -.2], bend: 0 }, hug: { h: [.75, .4], bend: 50, front: 1 }, out: { h: [-.7, .6], bend: -10 }, shrug: { h: [-.75, -.25], bend: -60 } };
function armSpec(a, sd) { const s = typeof a === 'string' ? ARM[a] : a || ARM.hang; if (s.abs) return s; return { h: [s.h[0] * -sd, s.h[1]], bend: (s.bend || 0) * -sd, front: s.front }; }
function mitten(x, y, ang, r, fill = SKIN) {
  push2(x, y, ang, () => {
    shp(spl([[-r * .7, -r * .75], [r * .35, -r * .95], [r * .95, -r * .7], [r * 1.25, -r * .35], [r * 1.05, -r * .05], [r * 1.3, r * .2], [r * 1.05, r * .5], [r * 1.15, r * .75], [r * .6, r * 1.0], [-r * .5, r * .9], [-r * .95, r * .1]]), { fill, lw: LWF + 2 });
    strokeP([[r * .55, -r * .15], [r * .95, -r * .2]], LWF * .7); strokeP([[r * .55, r * .38], [r * .9, r * .38]], LWF * .7);
  });
}
// P: {x, y (feet), s, lean, sq, ex (expression), fx (face extras), armL, armR, legL, legR ([dx, dy] foot offsets), a (alpha), coral (bool), back, prop}
function actor(who, P) {
  if (P.sil) { TOV.fill = P.sil; TOV.line = P.silLine || null; try { return actor(who, { ...P, sil: null, back: true }); } finally { TOV.fill = TOV.line = null; } }
  const G = castGeo(who), c = G.c, s = P.s ?? 1;
  g.save(); g.translate(P.x, P.y + (P.bob || 0)); if (P.rot) { g.translate(0, G.hipY * s); g.rotate(P.rot); g.translate(0, -G.hipY * s); }
  g.scale(s * (P.flip ? -1 : 1) * (1 + (P.sq || 0) * .12), s * (1 - (P.sq || 0) * .14)); if (P.a != null) g.globalAlpha *= P.a;
  const shirt = P.shirt || c.shirt, shirtS = shade(shirt);
  // legs + nub feet
  for (const sd of [-1, 1]) {
    const f = (sd < 0 ? P.legL : P.legR) || [0, 0], hip = [sd * c.tw * .2, G.hipY + 10], ank = [sd * c.tw * .24 + f[0], -26 + f[1]];
    shp(noodle(hip, ank, sd * (f[2] || 0), c.lw_, c.lw_ * .92), { fill: c.adult && !c.dress ? KIDPANTS : SKIN });
    shp(ell(ank[0] + sd * c.lw_ * .35, ank[1] + 12, c.lw_ * .85, c.lw_ * .5, 28), { fill: SHOE });
  }
  const arms = [[-1, armSpec(P.armL, -1)], [1, armSpec(P.armR, 1)]];
  const drawArm = (sd, A) => {
    const sh = sd < 0 ? G.shL : G.shR, hp = [sh[0] + A.h[0] * c.arm, sh[1] + A.h[1] * c.arm];
    shp(noodle(sh, hp, A.bend, c.aw, c.aw * .9), { fill: SKIN });
    shp(noodle(sh, [lerp(sh[0], hp[0], .28), lerp(sh[1], hp[1], .28)], A.bend * .3, c.aw * 1.5, c.aw * 1.4), { fill: c.dress ? shirt : shirt });
    mitten(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), c.aw * .72);
  };
  for (const [sd, A] of arms) if (!A.front) drawArm(sd, A);
  // torso: a bean in the shirt colour (kids: shorts band at the bottom); mom: a dress
  const w = c.tw, top = G.neckY, bot = G.hipY + 14, rd = c.round || 0;
  const body = c.dress
    ? spl([[-w * .36, top + 6], [w * .36, top + 6], [w * .5, top + c.th * .35], [w * .78, bot + 50], [0, bot + 62], [-w * .78, bot + 50], [-w * .5, top + c.th * .35]])
    : spl([[-w * .38, top + 4], [w * .38, top + 4], [w * (.5 + rd * .08), top + c.th * .45], [w * (.48 + rd * .06), bot - 6], [0, bot + 6], [-w * (.48 + rd * .06), bot - 6], [-w * (.5 + rd * .08), top + c.th * .45]]);
  shp(body, { fill: shirt, shade: () => {
    fillP(spl([[w * .2, top - 20], [w * .7, top], [w * .8, bot + 70], [w * .3, bot + 70], [w * .34, top + c.th * .5]]), shirtS, { boil: .3 });
    if (!c.dress) fillP(rectP(-w, bot - c.th * .2, w * 2, c.th), KIDPANTS, { boil: .3 });
    if (!c.dress) strokeP([[-w, bot - c.th * .2], [w, bot - c.th * .2]], LWF);
  } });
  // head (no neck drawn: the head sits on the shoulders)
  g.save(); g.translate(0, G.headY); if (P.tilt) g.rotate(P.tilt);
  hairBack(c.hair, c.R);
  shp(ell(0, 0, c.R, c.R * .96, 60), { fill: SKIN });
  hairFront(c.hair, c.R);
  if (!P.back) faceP(c.R, P.ex || 'neutral', P.fx || {}); else hairBackView(c.hair, c.R);
  g.restore();
  for (const [sd, A] of arms) if (A.front) drawArm(sd, A);
  g.restore();
  return { headX: P.x, headY: P.y + G.headY * s, R: c.R * s, top: P.y + (G.headY - c.R) * s, hand: sd => { const A = sd < 0 ? arms[0][1] : arms[1][1], sh = sd < 0 ? G.shL : G.shR; return [P.x + (sh[0] + A.h[0] * c.arm) * s, P.y + (sh[1] + A.h[1] * c.arm) * s]; }, G };
}
function shade(hex) { const v = hexRGB(hex).map(x => Math.round(x * .86)); return 'rgb(' + v.join(',') + ')'; }
function hexRGB(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
const HAIR = '#2E2A33';
function hairBack(type, R) {
  if (type === 'bun') shp(ell(R * .15, -R * 1.02, R * .42, R * .36, 36), { fill: HAIR });
  if (type === 'pony') shp(noodle([R * .7, -R * .4], [R * 1.15, R * .5], 20, R * .35, R * .2), { fill: HAIR });
}
function hairFront(type, R) {
  if (type === 'bun') shp(spl([[-R * .98, -R * .05], [-R * .85, -R * .6], [-R * .3, -R * .97], [R * .4, -R * .95], [R * .9, -R * .55], [R * .98, -R * .05], [R * .7, -R * .45], [R * .1, -R * .62], [-R * .55, -R * .5]]), { fill: HAIR });
  if (type === 'pony') shp(spl([[-R * .95, -R * .2], [-R * .6, -R * .85], [R * .3, -R * .98], [R * .95, -R * .35], [R * .4, -R * .55], [-R * .3, -R * .6]]), { fill: HAIR });
  if (type === 'flat') shp(spl([[-R * .9, -R * .45], [-R * .75, -R * 1.08], [R * .75, -R * 1.08], [R * .9, -R * .45], [R * .4, -R * .68], [-R * .4, -R * .68]]), { fill: HAIR });
  if (type === 'tuft') { strokeP(spl([[-R * .1, -R * .95], [-R * .05, -R * 1.25], [R * .22, -R * 1.3], [R * .2, -R * 1.12]], false), LW); strokeP(spl([[R * .12, -R * .96], [R * .3, -R * 1.18]], false), LW); }
  if (type === 'curl') strokeP(spl([[0, -R * .96], [R * .05, -R * 1.22], [R * .28, -R * 1.22], [R * .25, -R * 1.05], [R * .1, -R * 1.08]], false), LW);
  if (type === 'swoop') shp(spl([[-R * .92, -R * .3], [-R * .6, -R * .92], [R * .5, -R * 1.02], [R * 1.05, -R * .55], [R * .5, -R * .62], [-R * .2, -R * .42]]), { fill: HAIR });
  if (type === 'spike') shp([[-R * .85, -R * .5], [-R * .7, -R * 1.15], [-R * .4, -R * .85], [-R * .1, -R * 1.25], [R * .2, -R * .88], [R * .5, -R * 1.2], [R * .7, -R * .8], [R * .9, -R * .45], [0, -R * .7]], { fill: HAIR });
  if (type === 'cap') { shp(spl([[-R * .95, -R * .3], [-R * .8, -R * .9], [R * .8, -R * .9], [R * .95, -R * .3]]), { fill: '#7E786E' }); shp(rrP(-R * .2, -R * .42, R * 1.45, R * .2, R * .1), { fill: '#7E786E' }); }
  if (type === 'side') shp(spl([[-R * .95, -R * .3], [-R * .7, -R * .95], [R * .6, -R * .98], [R * .97, -R * .3], [R * .5, -R * .7], [-R * .2, -R * .55]]), { fill: HAIR });
}
function hairBackView(type, R) { if (['bun', 'flat', 'swoop', 'side', 'pony'].includes(type)) shp(spl([[-R * .97, R * .1], [-R * .8, -R * .7], [0, -R * .98], [R * .8, -R * .7], [R * .97, R * .1], [0, R * .35]]), { fill: HAIR }); }

// ---- the Host (v2): same outline, big filled brows, big oval eyes, teeth and tongue ----
// h: {x, y (feet), s (die size), rot, turn (0 front … 1 three-quarter), pips, mouth (0/1/2 or {type,o}), brow (raise), browL/browR, ang/angL/angR, big (brow size),
//     look:[x,y], blink, eyeS, arms, armT, legs, sweat, squash, prop, a, ex (preset)}
const HOSTEX = {
  neutral: {}, raise: { browR: 1.4, browL: -.2, angL: .15, bigR: .25 }, shock: { brow: .8, eyeS: 1.15, pupil: .7, mouth: { type: 'o', o: 1 }, sweat: 1 },
  side: { look: [1, .05], browL: -.2, angL: .35, browR: .3, angR: -.05, mouth: { type: 'flat' } }, happy: { brow: .4, mouth: { type: 'D', o: .7 } },
  sad: { brow: .2, ang: -.35, mouth: { type: 'frown' } }, wince: { ang: -.4, brow: .3, eyeS: .8, mouth: { type: 'grit' }, sweat: 1 }, scheme: { ang: .3, look: [.6, -.2], mouth: { type: 'grin' } },
};
function host2(h0) {
  const def = {}; for (const k in h0) if (h0[k] !== undefined) def[k] = h0[k];
  const h = { ...(HOSTEX[h0.ex] || {}), ...def }, s = h.s, turn = h.turn || 0;
  const torsoH = s * .44, legH = s * .3, faceH = s * .9;
  g.save(); g.translate(h.x, h.y); if (h.a != null) g.globalAlpha *= h.a;
  const cy = -(legH + torsoH + faceH * .5);
  if (h.rot) { g.translate(0, cy); g.rotate(h.rot); g.translate(0, -cy); }
  g.scale(1 + (h.squash || 0) * .14, 1 - (h.squash || 0) * .16);
  const tuck = h.legs === 'tuck', limb = Math.max(s * .07, 14);
  if (!tuck) for (const sd of [-1, 1]) {
    const hx = sd * s * .13, fx = sd * s * .18;
    shp(noodle([hx, -legH - 6], [fx, -s * .05], sd * -s * .02, limb, limb), { fill: C.ink, lw: 0, boil: 0 });
    shp(ell(fx + sd * s * .06, -s * .04, s * .12, s * .065, 28), { fill: C.ink, lw: 0, boil: 0 });
  }
  const tw = s * .66, ty = -legH - torsoH;
  const A = armPose(h, s), handR = s * .1;
  const arm = (sd, front) => {
    const a = A[sd < 0 ? 0 : 1]; if (!a || tuck) return; const isFront = a[1][1] < .1 * s && Math.abs(a[1][0]) < .3 * s; if (!!front !== isFront) return;
    const S0 = [sd * (tw / 2 - s * .05), ty + s * .1], E = [a[0][0], a[0][1] + ty], Hn = [a[1][0], a[1][1] + ty];
    shp(quadPts(S0, E, Hn, 16), { closed: false, lw: limb, boil: 0 });
    mitten(Hn[0], Hn[1], Math.atan2(Hn[1] - E[1], Hn[0] - E[0]) + (a[2] === 'point' ? 0 : 0), handR, C.white);
    if (a[2] === 'point') shp(noodle([Hn[0], Hn[1]], [Hn[0] + sd * handR * 1.9, Hn[1] - handR * .25], 0, handR * .55, handR * .5), { fill: C.white, lw: LWF + 2, boil: 0 });
  };
  arm(-1, false); arm(1, false);
  shp(rrP(-tw / 2, ty - s * .04, tw, torsoH + s * .06, s * .16), { fill: C.navy, boil: 0, shade: () => fillP(rectP(tw * .18, ty - s * .1, tw, torsoH + s * .2), '#1C2750', { boil: 0 }) });
  shp([[-s * .18, ty - s * .01], [0, ty + s * .2], [s * .18, ty - s * .01]], { fill: C.white, lw: LWF + 2, boil: 0 });
  shp([[-s * .05, ty + s * .03], [s * .05, ty + s * .03], [s * .035, ty + s * .085], [-s * .035, ty + s * .085]], { fill: C.mustard, lw: LWF, boil: 0 });
  shp([[-s * .035, ty + s * .085], [s * .035, ty + s * .085], [s * .055, ty + s * .27], [0, ty + s * .33], [-s * .055, ty + s * .27]], { fill: C.mustard, lw: LWF, boil: 0 });
  // the die
  const fw = s * (1 - .16 * turn), fh = faceH, fx = -fw / 2 - s * .05 * turn, fy = ty - fh + s * .02, D = [s * (.2 + .22 * turn), -s * .22], r = s * .18;
  const F0 = [fx, fy], F1 = [fx + fw, fy], F2 = [fx + fw, fy + fh], F3 = [fx, fy + fh];
  const hex = rounded([F3, F0, [F0[0] + D[0], F0[1] + D[1]], [F1[0] + D[0], F1[1] + D[1]], [F2[0] + D[0], F2[1] + D[1] + r * .2], F2], r);
  shp(hex, { fill: C.ivTop, boil: 0, shade: () => fillP([F1, [F1[0] + D[0], F1[1] + D[1]], [F1[0] + D[0] + 400, F1[1] + D[1]], [F2[0] + 400, F2[1] + 400], F2], C.ivSide, { boil: 0 }) });
  strokeP([[F1[0] - r * .29, F1[1] + r * .29], [F1[0] + D[0] * .8, F1[1] + D[1] * .8]], LWF, { boil: 0 });
  const pl = PIPS[h.pips ?? 'hair'] || PIPS.hair;
  for (const [u, v] of pl) { const uu = u * .3 + .5, vv = v * .28 + .5; fillP(ell(fx + uu * fw + vv * D[0], fy + 2 + vv * D[1], s * .075, s * .04, 24), C.ink, { boil: 0 }); }
  shp(rrP(fx, fy, fw, fh, r), { fill: C.ivory, boil: 0 });
  // face (on the front face)
  const fcx = fx + fw / 2 + s * .04 * turn, ey = fy + fh * .44, lk = h.look || [0, 0], eS = h.eyeS || 1;
  for (const sd of [-1, 1]) {
    const x = fcx + sd * s * .2 * (1 - .12 * turn * (sd < 0 ? 1 : -.3)), rx = s * .135 * eS * (sd < 0 ? 1 - .15 * turn : 1), ry = s * .165 * eS;
    if (h.blink) strokeP(quadPts([x - rx, ey], [x, ey + ry * .35], [x + rx, ey], 10), LW, { boil: 0 });
    else shp(ell(x, ey, rx, ry, 40), { fill: C.white, boil: 0, shade: () => { const pr = s * .072 * (h.pupil || 1); dotP(x + lk[0] * rx * .42, ey + lk[1] * ry * .4, pr); dotP(x + lk[0] * rx * .42 - pr * .35, ey + lk[1] * ry * .4 - pr * .38, pr * .3, C.white); } });
    const raise = (h.brow || 0) + (sd < 0 ? h.browL || 0 : h.browR || 0), ang = (h.ang || 0) * sd + (sd < 0 ? h.angL || 0 : h.angR || 0), big = 1 + (sd < 0 ? h.bigL || 0 : h.bigR || 0);
    const bw = s * .25 * big * .5, bh = s * .12 * big, by = ey - ry - s * .08 - raise * s * .075;
    push2(x, by, ang, () => fillP(spl([[-bw, bh * .4], [-bw * .92, -bh * .35], [0, -bh * .65], [bw * .95, -bh * .3], [bw, bh * .4], [0, bh * .3]]), C.ink, { boil: 0 }));
  }
  const mo = h.mouth ?? 0, my = fy + fh * .77, mw = s * .14;
  const mt = typeof mo === 'object' ? mo.type : mo === 0 ? 'smile' : 'D', moo = typeof mo === 'object' ? mo.o ?? .8 : mo === 2 ? 1 : .45;
  if (mt === 'smile') strokeP(quadPts([fcx - mw * .8, my - s * .01], [fcx, my + s * .06], [fcx + mw * .8, my - s * .01], 14), LW, { boil: 0 });
  else if (mt === 'grin') strokeP(quadPts([fcx - mw * 1.1, my - s * .04], [fcx, my + s * .09], [fcx + mw * 1.1, my - s * .04], 14), LW, { boil: 0 });
  else if (mt === 'flat') strokeP([[fcx - mw * .5, my + s * .01], [fcx + mw * .6, my - s * .005]], LW, { boil: 0 });
  else if (mt === 'frown') strokeP(quadPts([fcx - mw * .7, my + s * .04], [fcx, my - s * .04], [fcx + mw * .7, my + s * .04], 14), LW, { boil: 0 });
  else if (mt === 'grit') { shp(rrP(fcx - mw, my - s * .045, mw * 2, s * .09, s * .03), { fill: C.white, boil: 0 }); strokeP([[fcx - mw, my], [fcx + mw, my]], LWF, { boil: 0 }); }
  else if (mt === 'o') shp(ell(fcx, my + s * .02, s * .07, s * .09 * moo, 30), { fill: '#3A1620', boil: 0 });
  else { const hh = s * .16 * moo + s * .03, top = my - s * .04; mouthHost(fcx, top, mw * (1 + .2 * moo), hh); }
  if (h.sweat) { const k = h.sweat; push2(fx + fw + s * .02, fy + fh * .18, 0, () => sweatP(0, k * s * .05, s / 150 * k)); }
  arm(-1, true); arm(1, true);
  if (h.prop === 'clip' && !tuck) {
    const a = A[1], Hn = [a[1][0], a[1][1] + ty];
    push2(Hn[0] - s * .05, Hn[1] - s * .12, -.12, () => { shp(rrP(-s * .2, -s * .28, s * .4, s * .52, s * .03), { fill: C.tint, boil: 0 }); shp(rrP(-s * .08, -s * .33, s * .16, s * .09, s * .02), { fill: C.mute, lw: LWF, boil: 0 }); for (let i = 0; i < 4; i++) strokeP([[-s * .12, -s * .14 + i * s * .09], [s * (i === 3 ? .02 : .12), -s * .14 + i * s * .09]], LWF * .7, { boil: 0 }); });
    mitten(Hn[0], Hn[1], -.4, handR, C.white);
  }
  if (h.prop === 'mag' && !tuck) {
    const a = A[1], Hn = [a[1][0], a[1][1] + ty], R = s * .3, cx = Hn[0] + s * .22, cyy = Hn[1] - s * .34;
    shp(noodle(Hn, [cx - R * .7, cyy + R * .7], 0, s * .07, s * .07), { fill: C.ink, lw: 0, boil: 0 });
    shp(ell(cx, cyy, R, R, 50), { fill: '#EEF6F8', lw: LW * 1.4, boil: 0 }); fillP(ell(cx - R * .35, cyy - R * .35, R * .16, R * .12, 20), C.white, { boil: 0 });
    mitten(Hn[0], Hn[1], -.8, handR, C.white);
  }
  g.restore();
}
function mouthHost(cx, top, w, h) {
  const P = [[cx - w, top], [cx + w, top], ...quadPts([cx + w, top], [cx, top + h * 2], [cx - w, top], 20).slice(1)];
  shp(P, { fill: '#3A1620', boil: 0, shade: () => { fillP(rectP(cx - w * 1.2, top - 20, w * 2.4, 20 + h * .28), C.white, { boil: 0 }); fillP(ell(cx + w * .1, top + h * 1.0, w * .55, h * .38, 24), '#E7808A', { boil: 0 }); } });
}
// round the corners of a polygon into a point list
function rounded(P, r) {
  const out = [], n = P.length;
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
    const da = Math.hypot(a[0] - b[0], a[1] - b[1]), dc = Math.hypot(c[0] - b[0], c[1] - b[1]), rr = Math.min(r, da / 2, dc / 2);
    const p0 = [b[0] + (a[0] - b[0]) / da * rr, b[1] + (a[1] - b[1]) / da * rr], p1 = [b[0] + (c[0] - b[0]) / dc * rr, b[1] + (c[1] - b[1]) / dc * rr];
    out.push(...quadPts(p0, b, p1, 8));
  }
  return out;
}
host = host2;

// an arm spec that puts the hand of `who` (at x, y, scale s) on the world point T
function reachTo(who, x, y, s, sd, T, bend = 0) {
  const G = castGeo(who), sh = sd < 0 ? G.shL : G.shR, c = G.c;
  return { h: [(T[0] - x) / s / c.arm - sh[0] / c.arm, (T[1] - y) / s / c.arm - sh[1] / c.arm], bend, front: 1, abs: 1 };
}
function shoulderW(who, x, y, s, sd) { const G = castGeo(who), sh = sd < 0 ? G.shL : G.shR; return [x + sh[0] * s, y + sh[1] * s]; }

// a cloud of puffs with one outline round the whole union (outlines first, fills on top)
function cloud(puffs, fill = C.paper) {
  for (const [x, y, rx, ry] of puffs) shp(ell(x, y, rx, ry, 36), { lw: LW * 2, boil: .6 });
  for (const [x, y, rx, ry] of puffs) shp(ell(x, y, rx, ry, 36), { fill, lw: 0, boil: .6 });
}
