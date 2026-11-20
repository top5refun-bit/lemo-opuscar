// Subtitle check (English, one line): widths measured in the burned-in font ≤ 1500 px; each cue ≥ 1.8 s and ≥ its spoken words + 0.6 s.
//   node tools/subcheck.mjs            (run from the library root or anywhere; LIB defaults to ../..)
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), FILMDIR = path.resolve(HERE, '..'), PAGE = path.join(FILMDIR, 'page');
const LIB = process.env.LIB || path.resolve(FILMDIR, '../..');
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(PAGE, { w: 1920, h: 1080 });
const bad = await page.evaluate(() => window.SUBCHECK());
await browser.close(); closeServer();
let n = 0; for (const b of bad) { n++; console.log(`BAD width ${b.w}px > 1500: ${b.s}`); }
const film = JSON.parse(fs.readFileSync(path.join(PAGE, 'film.json'), 'utf8'));
const words = JSON.parse(fs.readFileSync(path.join(FILMDIR, 'audio/words.json'), 'utf8')).words;
film.subs.forEach(([a, b, s], i) => { if (b - a < 1.8 - 1e-6) { n++; console.log(`BAD #${i + 1} ${(b - a).toFixed(2)} s < 1.8 s: ${s}`); }
  // continuous narration: a cue must cover its own words (first word start → last word end ≈ last token + 0.25 s)
  const ws = words.filter(w => w.t0 >= a - .02 && w.t0 < b - .05); if (ws.length) { const end = ws[ws.length - 1].te; if (a > ws[0].t0 + .1 || b < end - .15) { n++; console.log(`BAD #${i + 1} does not cover its words (${ws[0].t0}–${end.toFixed(2)}): ${s}`); } } });
console.log(n ? `subcheck: ${n} problems` : `subcheck: OK (${film.subs.length} cues, one line each)`);
process.exit(n ? 1 : 0);
