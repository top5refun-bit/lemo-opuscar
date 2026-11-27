// every text box the page reports (window.TEXTS) must sit inside the 5 % title-safe margin; run from the library root:
// LIB=<library> node tools/safecheck.mjs <this folder>
const LIB = process.env.LIB || '/home/user/lemo-opuscar';
const { openDemo, closeServer } = await import(LIB + '/core/render/page.mjs');
const dir = process.argv[2];
const { page, browser } = await openDemo(dir, { gl: false });
const res = await page.evaluate(() => {
  const out = [], seen = new Set(), x0 = 96, x1 = 1824, y0 = 54, y1 = 1026;
  for (let t = 0; t < window.DUR; t += 1 / 30) {
    for (const b of window.TEXTS(t) || []) {
      if (b.pass) continue;
      const bad = b.x0 < x0 - 1 || b.x1 > x1 + 1 || b.y0 < y0 - 1 || b.y1 > y1 + 1;
      if (bad && !seen.has(b.id)) { seen.add(b.id); out.push(`${t.toFixed(2)}s  "${b.text}"  [${b.x0 | 0}, ${b.y0 | 0}] – [${b.x1 | 0}, ${b.y1 | 0}]`); }
    }
  }
  return out;
});
console.log(res.length ? 'outside the safe margin:\n' + res.join('\n') : 'all text inside the 5 % safe margin');
await browser.close(); closeServer?.(); process.exit(res.length ? 1 : 0);
