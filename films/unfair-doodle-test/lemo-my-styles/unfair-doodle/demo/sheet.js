// sheet.js — the model sheet (?scene=sheet): the Host (front, three-quarter, four expressions) and the family (two expressions each)
'use strict';
function drawSheet(t) {
  toonFrame(0); paper();
  text('UNFAIR DOODLE — CAST', 96, 66, { size: 44, align: 'left', id: false });
  host({ x: 200, y: 470, s: 175, pips: 4, mouth: 0 });
  host({ x: 450, y: 470, s: 175, pips: 4, mouth: 0, turn: 1, look: [.5, 0] });
  text('host · front', 200, 510, { f: 'hand', size: 36, id: false }); text('three-quarter', 450, 510, { f: 'hand', size: 36, id: false });
  const X = [760, 1050, 1340, 1630], L = ['neutral', 'eyebrow raise', 'shock', 'side-eye'], E = ['neutral', 'raise', 'shock', 'side'];
  E.forEach((e, i) => { g.save(); g.beginPath(); g.rect(X[i] - 135, 110, 280, 370); g.clip(); host({ x: X[i] - 12, y: 640, s: 235, pips: 4, ex: e, mouth: e === 'raise' ? 0 : undefined }); g.restore(); text(e === 'neutral' ? 'neutral' : L[i], X[i], 510, { f: 'hand', size: 36, id: false }); });
  line([96, 560], [1824, 560], 4, C.tint2);
  const fam = [['first', 'firstborn', ['smug', 'shocked'], 'hang'], ['mid', 'middle kid', ['neutral', 'cry'], 'hang'], ['young', 'youngest', ['joy', 'angry'], 'wave'], ['mom', 'mom', ['open', 'nervous'], 'hip']];
  let x = 170;
  fam.forEach(([w, lab, ex, arm]) => {
    ex.forEach((e, k) => actor(w, { x: x + k * 205, y: 1030, s: w === 'mom' ? .56 : .66, ex: e, armL: k ? arm : 'hang', fx: { tearT: .3 } }));
    text(lab + ' · ' + ex.join(' / '), x + 100, 1055, { f: 'hand', size: 34, id: false });
    x += 450;
  });
}
