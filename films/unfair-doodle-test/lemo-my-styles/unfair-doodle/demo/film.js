// Unfair Doodle (v2) test cut: "The Unfair Advantages Of Your Birth Order" (60 s). Every shot is a function of film time t.
'use strict';
// original voice clock → film clock (silences inserted at 36.75 +0.8, 44.70 +1.8, 54.84 +0.5)
const T = o => +(o + (o >= 36.75 ? .8 : 0) + (o >= 44.70 ? 1.8 : 0) + (o >= 54.84 ? .5 : 0)).toFixed(3);
const DUR = +(T(56.19) + 1.0).toFixed(2);                                    // 60.29
const FY = 1050;                                                             // feet line of full-body shots (no ground is drawn)
const HX = 1665, HY = 1052, HS = 200;                                        // the Host's corner: bottom-right, ~35 % of frame height
const EV = []; const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });

function bg(col) { if (!col) paper(); else { g.fillStyle = col; g.fillRect(-400, -400, W + 800, H + 800); } }
function hostAt(t, o = {}) { host({ x: HX, y: HY, s: HS, mouth: mouthAt(t), blink: blinkAt(t), armT: t, pips: 4, ...o, y: (o.y ?? HY) + 2 * Math.sin(TAU * t / 1.2) }); }
// a full-frame Host face (the front face fills ~80 % of the frame height)
function hostFace(t, o = {}) { const s = o.s || 960; host({ x: 960 + (o.dx || 0), y: 540 + s * 1.19 + (o.dy || 0), s, mouth: mouthAt(t), blink: blinkAt(t), armT: t, pips: 4, ...o }); }
const bob = (t, ph = 0) => 3 * Math.sin(t * 2.6 + ph);
const popIn = (t, t0) => inK(t, t0, .28);
const lip = (t, closed) => mouthAt(t) || closed;                             // lip-sync, or a resting mouth when silent

// ============ SHOTS ============
// 1a  0.00 — the youngest mid-slide head-first into a big base (readable on frame 1)
function s1a(t) {
  bg(); const sh = shake(t, [.52], 10);
  cam({ dx: sh[0], dy: sh[1] }, () => {
    const u = eo(seg(t, -.3, .55)), hx = lerp(420, 760, u), S = 1.9, by = 860;
    push2(1560, by, 0, () => shp([[0, -95], [330, 0], [0, 95], [-330, 0]], { fill: C.white, boil: .4 }));
    const pf = [[-380, 40, 130, 100], [-560, -10, 110, 90], [-720, 50, 95, 75], [-300, -90, 85, 70], [-850, 0, 70, 60], [-470, 90, 90, 60]].map(([dx, dy, rx, ry], i) => { const k = 1 + .12 * Math.sin(t * 9 + i); return [hx + dx - i * 30 * t, by - 40 + dy - t * 40, rx * k, ry * k]; });
    if (t > .5) [[-60, -30, 110, 85], [90, -110, 85, 70], [-150, -120, 70, 60]].forEach(([dx, dy, rx, ry], i) => { const k = backO(seg(t, .5 + i * .03, .68 + i * .03)); if (k > 0) pf.push([1420 + dx, by - 30 + dy, rx * k, ry * k]); });
    cloud(pf);
    for (let i = 0; i < 3; i++) { const y = by - 330 + i * 120, ph = (t * 6 + i * .3) % 1; strokeP([[hx - 620 - ph * 80, y], [hx - 380 - ph * 80, y]], LW, { boil: 0 }); }
    actor('young', { x: hx, y: by - 70 + 445 * S * .28, s: S, rot: Math.PI / 2 - .05, ex: t > .52 ? 'joy' : 'shocked', armL: 'up', armR: 'up', legL: [-10, -20], legR: [20, 0] });
    if (t > .52) for (const [x, y, r, d] of [[1640, 560, 50, 0], [1780, 680, 36, .06], [1500, 500, 30, .1]]) sparklePop(t, .52 + d, x, y, r, .5);
  });
}
// 1b  UNFAIR slams full-frame on coral
function s1b(t, t0) {
  bg(C.coral); const sh = shake(t, [t0 + 4 / FPS], 9, 8);
  cam({ dx: sh[0], dy: sh[1] }, () => {
    const k = slamK(t, t0, 1.25);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .1, r0 = 560 + 40 * (i % 2), L = 130 * eo(seg(t, t0 + .12, t0 + .3)); if (L > 1) line([960 + Math.cos(a) * r0, 540 + Math.sin(a) * r0 * .62], [960 + Math.cos(a) * (r0 + L), 540 + Math.sin(a) * (r0 + L) * .62], 12, C.paper); }
    text('UNFAIR', 960, 560, { size: 360, col: C.paper, outline: 26, sc: k, rot: -.05, a: t < t0 + 1 / FPS ? .5 : 1 });
  });
}
// 1c  the only child on a pile of toys, eating a WHOLE pizza
function s1c(t, t0) {
  bg(); const z = lerp(1, 1.06, seg(t, t0, t0 + .7));
  cam({ s: z, cy: 620 }, () => {
    const blocks = [[560, 930, 150, 110], [700, 945, 140, 95], [840, 915, 160, 125], [1000, 935, 140, 105], [1140, 945, 150, 95], [1290, 925, 140, 115],
      [650, 840, 130, 100], [790, 820, 150, 95], [950, 830, 140, 100], [1100, 840, 150, 105], [1240, 850, 120, 80], [800, 750, 140, 80], [950, 740, 150, 95], [1090, 760, 130, 80]];
    blocks.forEach(([x, y, w, h], i) => push2(x + w / 2, y + h / 2, (hash(i) - .5) * .25, () => shp(rrP(-w / 2, -h / 2, w, h, 14), { fill: i % 3 ? C.tint : C.paper })));
    shp(ell(600, 800, 58, 58, 40), { fill: C.paper, shade: () => fillP(rectP(540, 788, 130, 24), C.tint2, { boil: 0 }) });
    push2(1360, 770, .3, () => shp(rrP(-38, -100, 76, 200, 34), { fill: C.tint }));
    const S = 1.0, x = 980, y = 760, G = castGeo('only'), hy = y + G.headY * S;
    const cx = x, cy = hy + G.c.R * S + 70 + Math.sin(t * 22) * 3;
    const arms = { armL: reachTo('only', x, y, S, -1, [cx - 108, cy + 10], -40), armR: reachTo('only', x, y, S, 1, [cx + 108, cy + 10], 40) };
    actor('only', { x, y, s: S, ex: 'joy', fx: { eyes: 'closed' }, ...arms });
    shp(ell(cx, cy, 112, 112, 60), { fill: '#EBC98F', shade: () => { fillP(ell(cx, cy, 90, 90, 50), '#E9A26A', { boil: 0 }); for (const [a, r] of [[.5, 48], [1.8, 62], [3.1, 44], [4.2, 66], [5.4, 36]]) fillP(ell(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 13, 13, 16), '#B4432F', { boil: 0 }); fillP(ell(cx, cy - 112, 34, 30, 20), C.paper, { boil: 0 }); } });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; strokeP([[cx, cy], [cx + Math.cos(a) * 100, cy + Math.sin(a) * 100]], 6, { boil: .3 }); }
    for (const sd of [-1, 1]) mitten(cx + sd * 108, cy + 10, sd < 0 ? 0 : Math.PI, 26);
    for (const [px, py, r, d] of [[700, 330, 40, .08], [1270, 290, 48, .2], [1330, 520, 30, .34], [640, 560, 26, .44], [1150, 200, 28, .52]]) sparklePop(t, t0 + d, px, py, r, .7);
  });
}
// 1d  whip-pan: four kids, big; four icon badges pop in a row on "birth order"
function iconBadge(x, y, r, icon, k) {
  if (k <= 0) return;
  push2(x, y, 0, () => {
    shp(ell(0, 0, r, r, 50), { fill: C.mustard, boil: 0 });
    if (icon === 'glasses') { for (const s of [-1, 1]) shp(ell(s * r * .36, 0, r * .27, r * .27, 30), { fill: C.white, boil: 0 }); strokeP([[-r * .1, -r * .04], [r * .1, -r * .04]], LWF, { boil: 0 }); }
    if (icon === 'ghost') { const P = [...arcP(0, -r * .1, r * .42, r * .45, Math.PI, TAU, 16)]; for (let i = 0; i <= 6; i++) P.push([r * .42 - i * r * .14, r * .5 + (i % 2 ? -r * .1 : 0)]); shp(P, { fill: C.white, boil: 0 }); for (const s of [-1, 1]) fillP(ell(s * r * .15, -r * .12, r * .06, r * .1, 12), C.ink, { boil: 0 }); }
    if (icon === 'skate') { shp(rrP(-r * .62, -r * .12, r * 1.24, r * .2, r * .1), { fill: C.tint, boil: 0 }); for (const s of [-1, 1]) shp(ell(s * r * .38, r * .22, r * .12, r * .12, 16), { fill: C.white, lw: LWF, boil: 0 }); }
    if (icon === 'crown') crown(0, r * .04, r * .95, C.white, true);
  }, k);
}
function s1d(t, t0) {
  bg(); const whip = (1 - eo(seg(t, t0, t0 + .16))) * 800;
  cam({ dx: -whip }, () => {
    [['first', 420, 'glasses', 'smug'], ['mid', 810, 'ghost', 'neutral'], ['young', 1170, 'skate', 'joy'], ['only', 1540, 'crown', 'smug']].forEach(([w, x, icon, ex], i) => {
      const k = popIn(t, t0 - .06 + i * .05);
      actor(w, { x, y: FY + (1 - k) * 300, s: .85, ex, bob: bob(t, i) });
      iconBadge(x, 300, 78, icon, inK(t, T(2.27) - .05 + i * .1, .25));
    });
    if (t < t0 + .2) speedLines(1200, 500, 260, 5, -1, t);
  });
  writeOn('BIRTH ORDER', 960, 140, t, T(2.27) + .32, { f: 'slam', size: 120 });
}
// 1e  the Host tumbles in, lands, whips out a clipboard, eyebrows up
function s1e(t, t0) {
  bg(); const land = t0 + .38, s = 300, y = 1000;
  if (t < land) hostRoll({ x: 0, y, s, pips: 3 }, t, t0 - .02, land, -300, 960, 110);
  else {
    const clip = t > land + .2;
    host({ x: 960, y, s, pips: 3, squash: bell(t, land, land + .14) * .9, mouth: lip(t, 0), arms: clip ? 'clip' : 'rest', prop: clip ? 'clip' : null, brow: .3 + .8 * backO(seg(t, land + .2, land + .4)), armT: t });
    if (clip) sparklePop(t, land + .22, 1300, 470, 40, .5);
  }
}
// 1f  a 4-step staircase; badges 4-3-2-1 machine-gun onto the steps
function s1f(t, t0) {
  bg(); const z = lerp(1, 1.05, seg(t, t0, t0 + 1.3));
  cam({ s: z, cy: 700 }, () => {
    const top = stairs(300, 1010, 330, 175, 4);
    for (let i = 0; i < 4; i++) { const tb = T(4.59) + i * .25, k = inK(t, tb, .2), [x, y] = top(i); if (k > 0) badge(x, y - 95 - (1 - clamp(k)) * 80, 72, String(4 - i), k, { id: 'step' + i }); }
  });
}
// 1g  teaser strobe: three 0.35 s close flashes, each with a "?" stamp
function s1g(t, t0) {
  const i = clamp(Math.floor((t - t0) / .37), 0, 2), ti = t0 + i * .37;
  bg([C.paper, C.tint, C.paper][i]); const sh = shake(t, [ti + .05], 7);
  cam({ dx: sh[0], dy: sh[1], s: lerp(1, 1.06, seg(t, ti, ti + .37)) }, () => {
    if (i === 0) actor('mid', { x: 720, y: 1500, s: 1.75, ex: 'sad', a: lerp(1, .2, seg(t, ti, ti + .33)) });
    if (i === 1) { const G = castGeo('first'), hy = 1560 + G.headY * 1.6, R = G.c.R * 1.6; actor('first', { x: 720, y: 1560, s: 1.6, ex: 'neutral' }); for (const s of [-1, 1]) shp(ell(720 + s * R * .36, hy - R * .06, R * .33, R * .33, 40), { fill: '#E9F3F6', lw: 22, shade: () => dotP(720 + s * R * .36, hy - R * .06, R * .06) }); strokeP([[720 - R * .06, hy - R * .1], [720 + R * .06, hy - R * .1]], 22, { boil: 0 }); }
    if (i === 2) {
      const y = 880 - 140 * Math.sin(Math.PI * seg(t, ti - .05, ti + .5));
      actor('young', { x: 720, y, s: 1.05, rot: -.12, ex: 'joy', armL: 'wave', armR: 'up', legL: [-20, -30], legR: [20, -10] });
      push2(720, y + 26, -.14, () => { shp(rrP(-200, -18, 400, 34, 16), { fill: C.tint }); shp(ell(-130, 34, 24, 24, 20), { fill: C.paper }); shp(ell(130, 34, 24, 24, 20), { fill: C.paper }); });
    }
    const k = slamK(t, ti + .01); push2(1400, 460, -.12 + i * .1, () => shp(ell(0, 0, 180, 180, 60), { lw: 16, boil: 0 }), k);
    text('?', 1400, 470, { size: 270, sc: k, rot: -.12 + i * .1, id: 'q' + i, pass: true });
  });
}
// 1h  black: zoom to the top step — the final boss, crowned, coral lightning, shake on "boss"
function bolt(x, y, s, rot) { push2(x, y, rot, () => shp([[0, -1], [.32, -1], [.12, -.25], [.42, -.25], [-.18, 1], [-.02, .12], [-.32, .12]].map(([a, b]) => [a * s, b * s]), { fill: C.coral, line: C.paper, boil: 0 })); }
function s1h(t, t0) {
  bg(C.black); const sh = shake(t, [T(7.43), T(6.97) + .03], 9, 8);
  const z = lerp(1, 1.55, eo(seg(t, t0, t0 + 4 / FPS)));
  cam({ dx: sh[0], dy: sh[1], s: z * punch(t, T(7.43), .08), cx: 960, cy: 640, x: 1455 - 960, y: 200 - 640 }, () => {
    g.save(); g.strokeStyle = '#3A3A44'; g.lineWidth = 12; for (let i = 0; i < 4; i++) g.strokeRect(300 + i * 330, 1010 - (i + 1) * 140, 330 * (4 - i), 140); g.restore();
    const bx = 300 + 3 * 330 + 165, by = 1010 - 4 * 140;
    if (fr(t) % 4 < 2) { bolt(bx - 260, by - 330, 120, .25); bolt(bx + 250, by - 360, 105, -.3); } else { bolt(bx - 290, by - 250, 100, -.15); bolt(bx + 280, by - 280, 130, .2); }
    const P = actor('first', { x: bx, y: by, s: .62, sil: '#26262D', silLine: '#55555F', armL: 'hip', armR: 'hip' });
    for (const s of [-1, 1]) push2(bx + s * P.R * .36, P.headY - P.R * .05, s * .35, () => fillP(ell(0, 0, P.R * .22, P.R * .07, 20), C.paper, { boil: 0 }));
    crown(bx, P.top - 40, 120, C.mustard);
  });
  text('FINAL BOSS', 960, 170, { size: 160, sc: slamK(t, t0, 1.3), col: C.paper, rot: -.03 });
}
// 1i  slot machine: the crown hops between heads on each word; the Host watches from the corner
function s1i(t, t0) {
  bg();
  const xs = { first: 330, mid: 740, young: 1130 }, J = {}, hops = [[t0, 'first'], [t0 + .27, 'young'], [t0 + .52, 'mid']];
  let cur = 0; hops.forEach((h, i) => { if (t >= h[0]) cur = i; });
  ['first', 'mid', 'young'].forEach((w, i) => { const on = hops[cur][1] === w; J[w] = actor(w, { x: xs[w], y: FY, s: .8, ex: on ? (w === 'mid' ? 'shocked' : 'joy') : 'neutral', fx: on ? {} : { look: [clamp((xs[hops[cur][1]] - xs[w]) / 400, -1, 1), 0] }, bob: bob(t, i) }); });
  const cp = w => [J[w].headX, J[w].top - 46], [tc, wc] = hops[cur], prev = cur > 0 ? hops[cur - 1][1] : null, u = seg(t, tc, tc + .13);
  let P = cp(wc); if (prev && u < 1) { const A = cp(prev); P = [lerp(A[0], P[0], eio(u)), lerp(A[1], P[1], u) - Math.sin(Math.PI * u) * 170]; }
  crown(P[0], P[1], 120, C.mustard);
  hostAt(t, { pips: 3, look: [-.9, -.2], ex: 'scheme', mouth: lip(t, { type: 'grin' }) });
}
// 1j  full-frame Host face: one giant eyebrow shoots up, ding
function s1j(t, t0) {
  bg(); const tw = T(9.20);
  cam({ s: punch(t, tw, .12) }, () => hostFace(t, { pips: 3, blink: 0, look: [.2, 0], browR: 1.9 * backO(seg(t, tw, tw + .14), 3), bigR: .5 * ss(seg(t, tw, tw + .1)), browL: -.25, angL: .18 }));
}
// 1k  fast tilt down the staircase; the Host bounces down the steps and lands on step 4
function s1k(t, t0) {
  bg(); const tilt = lerp(-480, 0, eio(seg(t, t0, t0 + .5)));
  cam({ y: tilt }, () => {
    const top = stairs(250, 1010, 340, 245, 4);
    for (let i = 0; i < 4; i++) { const [x, y] = top(i); badge(x + 110, y + 125, 52, String(4 - i), 1, { id: 'step' + i, pass: true }); }
    const hopT = [t0 + .05, t0 + .38, t0 + .68, T(10.87) - .02], step = [3, 2, 1, 0];
    let i = 0; hopT.forEach((h, k) => { if (t >= h) i = k; });
    const [x1, y1] = top(step[i]), [x0, y0] = i ? top(step[i - 1]) : top(3), u = seg(t, hopT[i], hopT[i] + .26);
    const x = i ? lerp(x0, x1, u) - 30 : x1 - 30, y = i ? lerp(y0, y1, u) - Math.sin(Math.PI * u) * 110 : y1, air = u < 1 && i;
    host({ x, y, s: 175, pips: 3, mouth: lip(t, 0), squash: bell(t, hopT[i] + .24, hopT[i] + .36) * .8, arms: air ? 'up' : 'rest', blink: blinkAt(t), brow: .4, ex: air ? 'shock' : undefined });
    const [bx, by] = top(0);
    writeOn('BOTTOM', 230, by - 520, t, T(10.87) + .3, { f: 'slam', size: 90, align: 'left' });
    if (t > T(10.87) + .3) arrow([300, by - 460], [250, by - 300], [bx - 180, by - 230], seg(t, T(10.87) + .3, T(10.87) + .5), 12);
  });
}
// 6  #4 — the Host rolls off step 4 towards camera and lands on "four" in a face close-up; wipe to the rank card
function sibs(t, coralT, o = {}) {
  const xs = o.xs || [400, 790, 1160], J = {};
  ['first', 'mid', 'young'].forEach((w, i) => {
    const on = w === 'mid' && t >= coralT, k = on ? 1 + .06 * bell(t, coralT, coralT + .25) : 1;
    J[w] = actor(w, { x: xs[i], y: FY, s: (o.s || .85) * k, shirt: w === 'mid' && !on ? '#C9C2B4' : undefined, ex: w === 'mid' ? (on ? 'shocked' : 'neutral') : 'happy', bob: bob(t, i) });
  });
  if (t >= coralT) for (const [dx, dy, r, d] of [[-150, -540, 40, 0], [160, -500, 32, .08], [190, -330, 24, .16]]) sparklePop(t, coralT + d, xs[1] + dx, FY + dy, r, .6);
  return J;
}
function rankCard(t, tBadge, tTitle, n, title, x = 210, y = 175) {
  badge(x, y, 92, '#' + n, inK(t, tBadge, .3), { rosette: true, fs: .9, id: 'rank' });
  writeOn(title, x + 135, y + 6, t, tTitle, { f: 'slam', size: 100, align: 'left' });
}
function s6(t, t0) {
  const tw = T(12.00), wipeT = T(12.00) + .52;
  const A = () => {
    bg();
    if (t < tw) {
      const top = stairs(-300, 1010, 330, 175, 4), [sx, sy] = top(0), u = seg(t, t0, tw);
      const s = lerp(170, 640, ei(u)), x = lerp(sx + 60, 960, eo(u)), y = lerp(sy, 1500, ei(u)) - Math.abs(Math.sin(Math.PI * 3 * u)) * 120 * (1 - u);
      host({ x, y, s, rot: -TAU * eo(u), legs: 'tuck', pips: [3, 5, 2, 6, 1][Math.floor(u * 5) % 5], mouth: 2, ex: 'shock' });
    } else {
      const sh = shake(t, [tw + .03], 10);
      cam({ dx: sh[0], dy: sh[1] }, () => hostFace(t, { s: 760, dy: 120, pips: 4, squash: bell(t, tw, tw + .15) * .6, brow: .9 * backO(seg(t, tw, tw + .2)), blink: 0 }));
      const k = slamK(t, tw - .1); if (k > 0) badge(250, 260, 125, '#4', k, { rosette: true, fs: .9, id: 'rank' });
    }
  };
  const B = () => { bg(); sibs(t, T(12.82)); rankCard(t, wipeT + .05, T(13.15) + .35, 4, 'THE MIDDLE CHILD'); hostAt(t, { arms: t > T(12.82) ? 'pointL' : 'rest', look: [-1, 0], brow: .5 }); };
  wipe(t, wipeT, A, B);
}
function wipe(t, t0, A, B, d = .2) {
  if (t < t0) return A();
  const u = eo(seg(t, t0, t0 + d)); if (u >= 1) return B();
  A(); const x = W * (1 - u); g.save(); g.beginPath(); g.rect(x, 0, W, H); g.clip(); g.translate(x * .35, 0); B(); g.restore(); line([x, -20], [x, H + 20], 18);
}
// 7-8  Mom points at the middle kid … and blanks
function miniRank(n, title) { badge(150, 112, 52, '#' + n, 1, { rosette: true, fs: .9, id: 'rank' }); text(title, 222, 116, { size: 58, align: 'left' }); }
function momScene(t, phase) {
  bg(); miniRank(4, 'THE MIDDLE CHILD');
  const scratch = phase === 2, raise = phase === 2 && t > T(16.2);
  const M = actor('mom', { x: 430, y: FY, s: .76, ex: scratch ? 'nervous' : 'open', fx: scratch ? { look: [.6, -.4] } : { look: [1, 0] }, armR: scratch ? 'head' : 'point', armL: 'hang', bob: bob(t) });
  actor('mid', { x: 1110, y: FY, s: .85, ex: raise ? 'neutral' : 'blank', fx: { look: [-.8, 0], blink: blinkAt(t + .7) }, armR: raise ? 'up' : 'hang', bob: bob(t, 2) });
  return M;
}
function s7(t, t0) {
  const M = momScene(t, 1);
  bubble(820, 330, 480, 220, M.headX + 80, M.headY - 70, inK(t, t0 + .35, .25));
  hostAt(t, { look: [-.9, 0], ex: 'side', mouth: lip(t, { type: 'flat' }) });
}
function s8(t, t0) {
  const M = momScene(t, 2);
  bubble(820, 330, 480, 220, M.headX + 80, M.headY - 70, 1);
  if (t < T(16.68) - .2) scribble(650, 330, 340, 90, seg(t, T(15.89) - .05, T(16.5)), 3, 9);
  else writeOn('UHH... KID #2?', 820, 333, t, T(16.68) + .32, { f: 'hand', size: 72 });
  hostAt(t, { look: [-.6, -.3], ex: 'side', browR: .6, mouth: lip(t, { type: 'flat' }) });
}
// 9  navy: heart meters — the youngest's heart is full, the middle kid's heart shrinks on "less"
function heartT(r, fill) { shp(spl([[0, r * .9], [-r * 1.05, -r * .05], [-r * .95, -r * .85], [-r * .35, -r * .95], [0, -r * .45], [r * .35, -r * .95], [r * .95, -r * .85], [r * 1.05, -r * .05]]), { fill }); }
function s9(t, t0) {
  bg(C.navy);
  const tl = T(21.35), sad = t > tl;
  actor('young', { x: 520, y: FY, s: 1, ex: 'joy', bob: bob(t) });
  actor('mid', { x: 1300, y: FY, s: 1, ex: sad ? 'cry' : 'neutral', fx: { look: [-.4, 0], tearT: t }, bob: bob(t, 2) });
  push2(520, 330, 0, () => heartT(95 * (1 + .05 * Math.sin(t * 7)), C.paper));
  const r = lerp(95, 34, eo(seg(t, tl, tl + .5))) * (1 + .04 * Math.sin(t * 7)); push2(1300, 330, 0, () => heartT(r, C.coral));
  const k = slamK(t, T(20.53) - .1, 1.3), sh = shake(t, [T(20.53) + .03], 6);
  text('-80%', 910 + sh[0], 200 + sh[1], { size: 170, sc: k, col: C.coral, outline: 14, oc: C.paper, rot: -.04 });
  writeOn('ONE STUDY', 910, 320, t, T(19.25) + .2, { f: 'hand', size: 44, col: C.paper });
}
// 10  Mom hugs the youngest; the middle kid stands alone at the frame edge
function s10(t, t0) {
  bg(); const z = lerp(1, 1.04, seg(t, t0, t0 + 3.2));
  cam({ s: z, cx: 1650, cy: 640 }, () => {
    const mx = 450, yx = 740, ys = .9, G = castGeo('young'), kidSh = [yx + G.shR[0] * ys, FY + G.shR[1] * ys];
    actor('young', { x: yx, y: FY, s: ys, ex: 'joy', fx: { eyes: 'closed' }, armL: 'up', tilt: -.12 });
    actor('mom', { x: mx, y: FY, s: .76, ex: 'happy', fx: { eyes: 'closed', blush: 1 }, armR: reachTo('mom', mx, FY, .76, 1, [kidSh[0] + 10, kidSh[1] - 10], 50), tilt: .12 });
    for (let i = 0; i < 4; i++) { const tt = t0 + .3 + i * .6, u = seg(t, tt, tt + 1.6); if (u > 0 && u < 1) push2(560 + (i % 2 ? 110 : -60) + Math.sin(u * 9) * 14, 380 - u * 260, 0, () => heartT(28 * (1 - u * .4), C.tint2)); }
    actor('mid', { x: 1700, y: FY, s: .85, ex: 'sad', fx: { look: [-1, 0] } });
  });
}
// 11  OUCH — coral: zoom punch on the middle kid's crying face; then a cut-in of the Host wincing
function s11(t, t0) {
  const tw = T(25.39), tc = tw + .52;
  if (t < tc) {
    bg(C.coral);
    cam({ s: punch(t, tw, .12), cy: 470 }, () => actor('mid', { x: 960, y: 1640, s: 2.2, ex: 'cry', fx: { tearT: t - tw, look: [0, .3] } }));
    text('OUCH', 1500, 250, { size: 170, sc: popK(t, tw + .02), col: C.paper, outline: 14, rot: .12 });
  } else { bg(); hostFace(t, { ex: 'wince', mouth: { type: 'grit' }, blink: 0 }); }
}
// 12  nobody watching: parents' backs, a viewfinder on the middle kid
function s12(t, t0) {
  bg();
  actor('young', { x: 170, y: FY, s: .72, ex: 'joy', armL: 'wave', armR: 'wave' });
  actor('mom', { x: 400, y: FY, s: .7, back: true, tilt: -.06 });
  actor('dad', { x: 650, y: FY, s: .7, back: true, tilt: -.06 });
  const x0 = 900, y0 = 300, x1 = 1440, y1 = 1000, L = 80;
  actor('mid', { x: 1170, y: FY - 10, s: .82, ex: 'side', fx: { look: [1, 0] } });
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 13; g.lineCap = 'round'; g.beginPath();
  for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); }
  g.stroke(); g.restore();
  if (Math.floor((t - t0) * 2) % 2 === 0) circle(x0 + 55, y0 + 55, 16, C.ink, 0);
  writeOn('NOBODY WATCHING', x0 + 85, y0 + 56, t, T(28.21) + .25, { f: 'hand', size: 44, align: 'left' });
  hostAt(t, { look: [-1, -.1], ex: 'scheme', mouth: lip(t, { type: 'grin' }) });
}
// 13  the middle kid builds a crew: friends pop up, hands join, the coral runs along the joined arms on "crew"
function s13(t, t0) {
  bg();
  const who = ['mid', 'f1', 'f2', 'f3'], xs = [250, 560, 870, 1180], s = .78, pops = [0, t0 + .35, t0 + .5, t0 + .65], clasp = [t0 + .55, t0 + .75, t0 + .95];
  const meet = i => { const a = shoulderW(who[i], xs[i], FY, s, 1), b = shoulderW(who[i + 1], xs[i + 1], FY, s, -1); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 70]; };
  const arms = who.map(() => ({}));
  for (let i = 0; i < 3; i++) {
    const p = ss(seg(t, clasp[i] - .25, clasp[i])), M = meet(i), restR = shoulderW(who[i], xs[i], FY, s, 1), restL = shoulderW(who[i + 1], xs[i + 1], FY, s, -1);
    if (i === 0 || t >= pops[i]) { const k = i === 0 ? Math.max(p, ss(seg(t, t0 + .1, t0 + .4)) * .6) : p; arms[i].R = reachTo(who[i], xs[i], FY, s, 1, [lerp(restR[0] + 30, M[0], k), lerp(restR[1] + 150, M[1], k)], 0); }
    if (t >= pops[i + 1]) arms[i + 1].L = reachTo(who[i + 1], xs[i + 1], FY, s, -1, [lerp(restL[0] - 30, M[0], p), lerp(restL[1] + 150, M[1], p)], 0);
  }
  who.forEach((w, i) => { if (i && t < pops[i]) return; const k = i ? popIn(t, pops[i]) : 1; actor(w, { x: xs[i], y: FY + (1 - k) * 300, s, ex: t > clasp[Math.min(2, Math.max(0, i - 1))] ? 'joy' : 'neutral', fx: { look: [i ? -.6 : .6, 0] }, armL: arms[i].L, armR: arms[i].R, bob: bob(t, i) }); });
  const tr = T(30.19) - .12, pr = seg(t, tr, tr + .5);
  if (pr > 0) { const path = []; for (let i = 0; i < 3; i++) path.push(shoulderW(who[i], xs[i], FY, s, 1), meet(i), shoulderW(who[i + 1], xs[i + 1], FY, s, -1)); strokePart(path, pr, 14, C.coral); }
  writeOn('THE CREW', 720, 170, t, T(30.19) + .28, { f: 'slam', size: 120 });
  hostAt(t, { ex: 'happy', mouth: lip(t, { type: 'grin' }), look: [-1, 0] });
}
// 14  two signposts: FRIENDS lights up, FAMILY droops; the kid walks to FRIENDS
function sign(x, y, label, dir, rot, k, col, lit) {
  shp(rrP(x - 12, y, 24, FY - y - 20, 10), { fill: C.tint2 });
  push2(x, y, rot, () => shp([[-dir * 20, -60], [dir * 300, -60], [dir * 360, 0], [dir * 300, 60], [-dir * 20, 60]], { fill: C.paper, boil: .4 }), k);
  if (lit > 0) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .4, r0 = 230, r1 = 230 + 55 * lit; line([x + dir * 170 + Math.cos(a) * r0, y + Math.sin(a) * r0 * .55], [x + dir * 170 + Math.cos(a) * r1, y + Math.sin(a) * r1 * .55], 10); }
  g.save(); g.translate(x, y); g.rotate(rot); text(label, dir * 165, 4, { size: 58, col, sc: k }); g.restore();
}
function s14(t, t0) {
  bg();
  const tf = T(31.98), tm = T(32.71), lit = popK(t, tf), droop = eo(seg(t, tm, tm + .35));
  sign(1110, 380, 'FRIENDS', 1, -.03, t >= tf ? lit : 1, t >= tf ? C.coral : C.ink, t >= tf ? 1 - seg(t, tf + .6, tf + .9) : 0);
  sign(560, 400, 'FAMILY', -1, .05 + droop * .42, 1, t >= tm ? C.mute : C.ink, 0);
  const wk = seg(t, tm - .2, tm + .9), x = lerp(800, 1080, ss(wk)), st = wk > 0 && wk < 1 ? Math.sin(t * 14) : 0;
  actor('mid', { x, y: FY - Math.abs(st) * 12, s: .85, ex: t >= tf ? 'joy' : 'neutral', fx: { look: [t >= tf ? 1 : 0, -.3] }, legL: [st * 30, -Math.max(0, st) * 30], legR: [-st * 30, -Math.max(0, -st) * 30] });
  if (t >= tf) sparklePop(t, tf + .05, 1480, 230, 36, .7);
  hostAt(t, { ex: 'side', look: [-1, 0], mouth: lip(t, { type: 'flat' }) });
}
// 15  "Now it's time for…" — full-frame Host face, hands rubbing below, eyebrows wiggle
function s15(t, t0) {
  bg(); const w = Math.sin((t - t0) * 15);
  hostFace(t, { s: 900, arms: 'rub', armT: t, brow: .35 + .4 * w, ex: 'scheme', mouth: lip(t, { type: 'grin' }), look: [.5, -.1] });
}
// 16  STING: THE FINE PRINT (reusable: everything is relative to ts, the stamp hit)
function stingFinePrint(t, ts, n = 4) {
  bg(); const sh = shake(t, [ts], 10, 8);
  cam({ dx: sh[0], dy: sh[1] }, () => {
    const dy = lerp(-1150, 0, eo(seg(t, ts - .3, ts - .08)));
    g.save(); g.translate(0, dy);
    push2(760, 560, -.02, () => {
      shp(rrP(-340, -480, 680, 1060, 14), { fill: C.white, boil: .3 });
      text('CONTRACT', 0, -395, { f: 'hand', size: 56, col: C.mute, id: false });
      for (let i = 0; i < 17; i++) { const y = -320 + i * 42, w = 470 - (i % 4 === 3 ? 180 : 0) - hash(i) * 60; line([-235, y], [-235 + w, y], 6, C.tint2); }
      if (t >= ts) push2(0, 180, -.12, () => { rrect(-320, -72, 640, 144, 16); fillStroke(null, 12, C.coral); rrect(-300, -52, 600, 104, 10); fillStroke(null, 5, C.coral); text('THE FINE PRINT', 0, 6, { size: 74, col: C.coral, id: 'finePrint' }); }, 1 + .15 * (1 - eo(seg(t, ts, ts + .1))));
    });
    g.restore();
    const down = seg(t, ts - .14, ts), up = seg(t, ts + .12, ts + .4);
    if (t > ts - .14 && up < 1) {
      const y = lerp(-300, 690, ei(down)) - eo(up) * 1100;
      push2(760, y, -.12, () => { shp(rrP(-150, -40, 300, 60, 10), { fill: C.coral, boil: 0 }); shp(rrP(-110, -130, 220, 95, 12), { fill: C.tint, boil: 0 }); shp(rrP(-40, -310, 80, 185, 30), { fill: C.tint2, boil: 0 }); shp(ell(0, -330, 62, 62, 40), { fill: C.tint2, boil: 0 }); });
    }
    for (const [x, y, r, d] of [[360, 600, 38, .1], [1150, 690, 44, .18], [420, 830, 24, .3], [1120, 520, 28, .4]]) sparklePop(t, ts + d, x, y, r, 1.4);
    const tm = T(35.93) - .15, mag = t > tm;
    host({ x: 1520, y: 1040, s: 280, pips: n, mouth: mouthAt(t), blink: blinkAt(t), arms: mag ? 'mag' : 'rest', prop: mag ? 'mag' : null, brow: mag ? .9 * backO(seg(t, tm, tm + .2)) : .3, look: [-.6, 0], armT: t });
  });
}
// 17  under the magnifying glass: three lines of fine print, each written on its word
const FINE = [['- LESS ATTENTION', 37.20], ['- LESS QUALITY TIME', 38.23], ['- BLAMED FOR EVERYTHING', 39.78]];
function fineLines(t, x, y0, dy, size, o = {}) {
  FINE.forEach(([s, w], i) => { const t1 = T(w) + .25, y = y0 + i * dy; if (o.done) text(s, x, y, { f: 'hand', size, align: 'left' }); else writeOn(s, x, y, t, t1, { f: 'hand', size, align: 'left', d: .55 }); });
  const ue = T(40.36) + .35, ws = textW(FINE[2][0], 'hand', size), p = o.done ? 1 : seg(t, ue - .4, ue);
  if (p > 0) strokePart(quadPts([x + size * .55, y0 + 2 * dy + size * .5], [x + ws / 2, y0 + 2 * dy + size * .62], [x + ws, y0 + 2 * dy + size * .45]), p, size * .1, C.coral);
}
function s17(t, t0) {
  bg(); push2(960, 560, -.01, () => shp(rrP(-860, -500, 1720, 1100, 14), { fill: C.white, boil: .3 }));
  for (let i = 0; i < 13; i++) { const y = 150 + i * 66; if (i % 3 === 1) continue; line([220, y], [220 + 820 + hash(i + 9) * 260, y], 5, C.tint); }
  fineLines(t, 200, 300, 200, 96);
  let k = 0; FINE.forEach(([s, w], i) => { if (t > T(w) - .45) k = i; });
  const t1 = T(FINE[k][1]) + .25, ws = textW(FINE[k][0], 'hand', 96), u = eio(seg(t, t1 - .55, t1)), lx = 200 + ws * u + 40, ly = 300 + k * 200;
  const px = lx + 30 * Math.sin(t * 5), py = ly + 10;
  shp(noodle([px + 108, py + 108], [px + 230, py + 230], 0, 34, 34), { fill: C.ink, lw: 0, boil: 0 });
  shp(ell(px, py, 150, 150, 60), { lw: 20, boil: 0 });
  hostAt(t, { look: [-.8, -.2], ex: 'scheme', mouth: lip(t, { type: 'grin' }) });
}
// 18  "That last one isn't from a study." (list + scribbled note) → "That's from my life." (full-frame side-eye, sweat drop)
function s18(t, t0) {
  const tc = T(43.57) + .15;
  if (t < tc) {
    bg(); fineLines(t, 150, 250, 165, 84, { done: true });
    writeOn('*NOT FROM A STUDY', 230, 680, t, T(41.90) + .3, { f: 'hand', size: 60, align: 'left', rot: -.04, d: .6, col: C.coral });
    hostAt(t, { ex: 'side', look: [1, .05], mouth: lip(t, { type: 'flat' }) });
  } else {
    bg(); const tl = T(44.04) - .05, shr = t > tl;
    hostFace(t, { ex: 'side', look: [1, 0], brow: shr ? .55 * backO(seg(t, tl, tl + .15)) : 0, sweat: shr ? backO(seg(t, tl + .05, tl + .3)) : 0, mouth: lip(t, { type: 'flat' }) });
  }
}
// 19  STING: SIBLING SCAN (reusable; t0 = start of the sting, n = item number on the banner)
function stingScan(t, t0, n = 4) {
  bg(C.black);
  const S = 1.0, x = 960, y = 1040, tp = seg(t, t0 + .15, t0 + 1.45), sy = lerp(200, 1050, tp);
  actor('mid', { x, y, s: S, sil: '#2C2C33', silLine: '#43434C' });
  if (tp > 0) {
    g.save(); g.beginPath(); g.rect(0, 0, W, sy); g.clip(); actor('mid', { x, y, s: S, sil: '#2C2C33', silLine: C.green }); g.restore();
    if (tp < 1) for (const [o, w] of [[0, 9], [-16, 5], [-30, 3]]) line([360, sy + o], [1560, sy + o], w, C.green);
  }
  g.save(); g.strokeStyle = C.green; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath();
  for (const [bx, by, sx, sy2] of [[600, 300, 1, 1], [1320, 300, -1, 1], [600, 1020, 1, -1], [1320, 1020, -1, -1]]) { g.moveTo(bx, by + sy2 * 70); g.lineTo(bx, by); g.lineTo(bx + sx * 70, by); }
  g.stroke(); g.restore();
  for (let i = 0; i < 4; i++) if (t > t0 + .25 + i * .38) circle(1420, 360 + i * 50, 11, (fr(t) + i) % 6 < 3 ? C.green : '#1E3A28', 0);
  const k = popK(t, t0 + .05, .22);
  if (k > 0) {
    g.save(); g.translate(960, 150); g.scale(k, k);
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 330, -28); g.lineTo(sd * 420, -28); g.lineTo(sd * 385, 12); g.lineTo(sd * 420, 52); g.lineTo(sd * 330, 52); g.closePath(); fillStroke('#2A8A57', 8, C.black); }
    rrect(-360, -62, 720, 112, 8); fillStroke(C.green, 8, C.black); circle(-360, -6, 54, C.paper, 10, C.black);
    g.restore();
    text(String(n), 960 - 360 * k, 150 - 3 * k, { f: 'badge', size: 62, sc: k, col: C.black, id: 'scanN', pass: true });
    text('SIBLING SCAN', 960 + 30 * k, 150 - 4 * k, { size: 76, sc: k, col: C.black });
  }
}
// 20-21  the checklist: each line written, then ticked in green
const CHECK = [['1. CALLED BY SIBLING\'S NAME', 45.17], ['2. FEWER BABY PHOTOS', 47.33], ['3. "THE EASY ONE"', 49.68]];
function checklist(t, x, y0, dy) {
  CHECK.forEach(([s, w], i) => {
    const tw = T(w), y = y0 + i * dy, pb = seg(t, tw - .55, tw - .3);
    if (pb > 0) { const b = 66, P = [[x, y - b / 2], [x + b, y - b / 2], [x + b, y + b / 2], [x, y + b / 2], [x, y - b / 2]]; strokePart(P, pb, 9, C.ink); }
    writeOn(s, x + 100, y, t, tw - .02, { f: 'hand', size: 68, align: 'left', d: .45 });
    tick(x + 34, y - 4, 72, seg(t, tw, tw + .22), C.green, 15);
  });
}
function s20(t, t0, zoomed) {
  bg(); const tz = T(50.64), z = zoomed ? punch(t, tz, .12) : 1;
  cam({ s: z, cx: 900, cy: 540 }, () => {
    actor('mid', { x: 270, y: FY, s: .9, ex: t > T(51.71) ? 'sad' : 'neutral', fx: { look: [.8, -.2] }, bob: bob(t) });
    checklist(t, 560, 250, 160);
    writeOn('= NOBODY CHECKED', 560, 770, t, T(52.04) + .4, { f: 'slam', size: 80, align: 'left', col: C.coral, d: .6 });
  });
  hostAt(t, { look: [-.9, -.3], ex: t > T(51.71) ? 'sad' : undefined, brow: .3 });
}
// 22  black: the middle kid on step 4 under a spotlight; the Host peeks from the corner
function spotScene() {
  bg(C.black); const cone = [[620, -20], [900, -20], [1160, 1100], [280, 1100]];
  g.save(); g.beginPath(); cone.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); paper(); const top = stairs(470, 1030, 360, 170, 4, { fill: C.paper }); g.restore();
  g.save(); g.beginPath(); g.rect(0, 0, W, H); cone.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip('evenodd');
  g.fillStyle = C.black; g.fillRect(0, 0, W, H); g.strokeStyle = '#2E2E35'; g.lineWidth = 12; for (let i = 0; i < 4; i++) g.strokeRect(470 + i * 360, 1030 - (i + 1) * 170, 360 * (4 - i), 170); g.restore();
  return top;
}
function s22(t, t0) {
  const top = spotScene(), [x, y] = top(0), jit = t > T(54.36) ? (hash(fr(t) * 3.3) - .5) * 8 : 0;
  actor('mid', { x: x - 30 + jit, y, s: .82, ex: t > T(54.36) ? 'shocked' : 'neutral', fx: { look: [.2, 0], blink: blinkAt(t) }, bob: bob(t) });
  const pk = eo(seg(t, t0 + .4, t0 + .8));
  host({ x: 2050 - 330 * pk, y: 1180, s: 300, rot: -.35, pips: 4, mouth: mouthAt(t), blink: blinkAt(t), look: [-1, -.2], ex: t > T(54.84) ? 'shock' : 'side', sweat: t > T(54.84) ? 1 : 0 });
}
// 23  THE GHOST — the kid fades into a bedsheet ghost; rank badge slams with sparkles and a starburst
function s23(t, t0) {
  bg(); const sh = shake(t, [T(55.33) - .07, t0 + .2], 8);
  cam({ dx: sh[0], dy: sh[1] }, () => {
    const fade = seg(t, t0 + .05, t0 + .45), x = 560, s = .95;
    const P = actor('mid', { x, y: FY, s, ex: 'blank', a: lerp(1, .3, fade) });
    const pg = seg(t, t0 + .12, t0 + .6), fl = pg >= 1 ? Math.sin((t - t0) * 3) * 10 : 0, top = P.top - 30 + fl, hem = FY - 40 + fl, L = x - 210, R = x + 210;
    const pts = [[L + 10, hem], [L + 20, top + 200]]; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; pts.push([x + Math.cos(a) * 190, top + 200 + Math.sin(a) * 210]); }
    pts.push([R - 10, hem]); for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([lerp(R - 10, L + 10, u), hem + Math.sin(u * Math.PI * 5 + t * 6) * 18]); }
    if (pg >= 1) { shp(pts, { fill: 'rgba(255,255,255,.6)', line: C.coral }); for (const sd of [-1, 1]) fillP(ell(x + sd * 64, top + 150, 26, 40, 20), C.ink, { boil: 0 }); fillP(ell(x, top + 260, 22, 30, 20), C.ink, { boil: 0 }); }
    else strokePart(pts, pg, LW, C.coral);
  });
  const tb = t0 + .16, k = slamK(t, tb);
  if (k > 0) { push2(1300, 360, (t - tb) * .25, () => starburst(0, 0, 210, 265, 16, C.tint, 11), k); badge(1300, 360, 145, '#4', k, { rosette: true, fs: .85, id: 'rank' }); }
  text('THE GHOST', 1230, 760, { size: 150, sc: slamK(t, T(55.33) - .1, 1.25), col: C.coral, outline: 16, rot: -.04 });
  for (const [x, y, r, d] of [[980, 600, 44, .05], [1620, 600, 38, .12], [1560, 170, 32, .2], [1030, 190, 28, .28], [1650, 900, 26, .36], [960, 900, 30, .44]]) sparklePop(t, T(55.33) + d, x, y, r, 2.2);
}

// ============ the cut ============
const SHOTS = [
  ['1a', 0, s1a], ['1b', .78, s1b], ['1c', 1.28, s1c], ['1d', 1.98, s1d], ['1e', 3.63, s1e], ['1f', 4.50, s1f], ['1g', 5.78, s1g],
  ['1h', 6.90, s1h], ['1i', 8.36, s1i], ['1j', 9.12, s1j], ['1k', 9.90, s1k],
  ['6', 11.65, s6], ['7', 13.80, s7], ['8', 15.80, s8], ['9', 18.85, s9], ['10', 22.05, s10], ['11', 25.30, s11], ['12', 26.30, s12],
  ['13', 28.88, s13], ['14', 30.82, s14], ['15', 33.55, s15], ['16', T(34.96) - .1, (t) => stingFinePrint(t, T(35.11))],
  ['17', T(36.96) - .1, s17], ['18', T(41.24) - .1, s18], ['19', T(44.69) + .01, (t, t0) => stingScan(t, t0)], ['20', T(44.87) - .1, (t, t0) => s20(t, t0, false)],
  ['21', T(48.55) - .1, (t, t0) => s20(t, t0, true)], ['22', T(52.88) - .1, s22], ['23', T(54.99) - .1, s23],
].map(([id, t0, f]) => ({ id, t0, f }));
function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return s; }

// ============ sound events ============
(function events() {
  SHOTS.forEach((s, i) => { if (i && !['19', '23', '21', '16'].includes(s.id)) ev(s.t0, 'whoosh', { v: i < 11 ? 1 : .6 }); });
  ev(0, 'hit', { v: 1 }); ev(.02, 'slide'); ev(.52, 'thud', { v: .8 });
  ev(.78, 'slam', { v: 1.2 }); ev(1.28, 'hit', { v: .7 }); [1.36, 1.48, 1.62, 1.72].forEach(t => ev(t, 'twinkle'));
  [2.02, 2.09, 2.16, 2.23].forEach((t, i) => ev(t, 'pop', { p: 1 + i * .12 })); [0, 1, 2, 3].forEach(i => ev(T(2.27) - .05 + i * .1, 'pop', { p: 1.3 + i * .1 }));
  ev(3.61, 'clatter', { d: .42 }); ev(4.01, 'thud', { v: .6 }); ev(4.21, 'whip');
  [0, 1, 2, 3].forEach(i => ev(T(4.59) + i * .25, 'pop', { p: .9 + i * .15 }));
  [5.79, 6.16, 6.53].forEach(t => ev(t, 'stamp', { v: .7 }));
  ev(6.90, 'slam', { v: 1.3 }); ev(6.92, 'boss'); ev(T(7.43), 'thud', { v: 1 });
  [8.36, 8.63, 8.88].forEach((t, i) => ev(t, 'hop', { p: 1 + i * .2 }));
  ev(T(9.20), 'ding'); ev(T(9.20), 'zoom');
  [9.95, 10.28, 10.58, 10.85].forEach((t, i) => ev(t + .26, 'clack', { p: 1 + i * .08 }));
  ev(11.65, 'clatter', { d: .35 }); ev(T(12.00), 'slam', { v: 1.1 }); ev(T(12.00) + .52, 'whip'); ev(T(12.82), 'twinkle'); ev(T(12.85), 'pencil', { d: .7 });
  ev(14.15, 'pop'); ev(T(15.89) - .05, 'pencil', { d: .6 }); ev(T(16.68) - .1, 'pencil', { d: .4 }); ev(T(16.2), 'pop', { p: 1.3 });
  ev(17.15, 'crickets', { d: 1.65 });
  ev(T(19.25) - .2, 'pencil', { d: .35 }); ev(T(20.53) - .1, 'slam', { v: .9 }); ev(T(21.35), 'deflate');
  ev(22.4, 'twinkle'); ev(T(25.39), 'bonk'); ev(T(25.39) + .02, 'zoom'); ev(T(25.42), 'pop', { p: .8 }); ev(T(25.39) + .52, 'whoosh', { v: .5 });
  ev(T(28.21) - .5, 'pencil', { d: .5 }); [26.5, 27.5, 28.5].forEach(t => ev(t, 'beep', { v: .25, p: 1.5 }));
  ev(T(28.88) + .35, 'pop', { p: 1 }); ev(T(28.88) + .5, 'pop', { p: 1.15 }); ev(T(28.88) + .65, 'pop', { p: 1.3 });
  [29.43, 29.63, 29.83].forEach((t, i) => ev(t, 'clasp', { p: 1 + i * .15 }));
  ev(T(30.19) - .12, 'run'); ev(T(30.19) - .4, 'pencil', { d: .45 });
  ev(T(31.98), 'pop', { p: 1.2 }); ev(T(31.98) + .03, 'twinkle'); ev(T(32.71), 'droop');
  ev(33.55, 'stop'); ev(T(34.96) - .1, 'slide2'); ev(T(35.11), 'stamp', { v: 1.3 }); ev(T(35.11) + .02, 'choir'); ev(T(35.93) - .15, 'twinkle');
  FINE.forEach(([s, w]) => ev(T(w) + .25 - .55, 'pencil', { d: .55 })); ev(T(40.36) - .05, 'pencil', { d: .4 });
  ev(T(41.24) - .1, 'stop'); ev(T(41.90) - .3, 'pencil', { d: .6 }); ev(T(43.57) + .15, 'zoom'); ev(T(44.04) - .05, 'boing');
  ev(T(44.69), 'scanhum', { d: 1.85 }); [0, 1, 2, 3].forEach(i => ev(T(44.69) + .25 + i * .38, 'beep', { v: .8, p: i === 3 ? 1.5 : 1 }));
  CHECK.forEach(([s, w]) => { ev(T(w) - .55, 'pencil', { d: .25 }); ev(T(w) - .47, 'pencil', { d: .45 }); ev(T(w), 'tick'); });
  ev(T(50.64), 'zoom'); ev(T(52.04) + .4 - .6, 'pencil', { d: .6 });
  ev(T(52.88) - .1, 'spot'); ev(T(54.36) - .4, 'drumroll', { d: T(54.99) - T(54.36) + .3 });
  ev(T(54.99) - .1, 'cymbal'); ev(T(55.33) - .1, 'slam', { v: 1.1 }); ev(T(55.33) + .1, 'wooo'); [0, .12, .2, .28].forEach(d => ev(T(55.33) + d, 'twinkle'));
  ev(T(56.19) + .1, 'button');
  EV.sort((a, b) => a.t - b.t);
})();

// ============ page contract ============
window.DUR = DUR; window.EV = EV;
window.SHOT_TIMES = SHOTS.map(s => ({ id: s.id, t0: s.t0 }));
window.render = t => {
  TXT = [];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  toonFrame(t);
  if (QS.get('scene') === 'sheet') drawSheet(t); else { const s = shotAt(t); s.f(t, s.t0); }
  window._txt = TXT; TXT = null;
};
window.TEXTS = t => { window.render(t); return window._txt; };
