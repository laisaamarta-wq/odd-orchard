// Odd Orchard — export the /behance plates as Behance-ready images.
//   node scripts/behance/export.mjs [01 02 … cover]
//   → behance-export/plates/plate-NN.jpg (2800 px wide) and cover-1616x1264.png
import path from 'node:path'
import { BASE, OUT, ensureDir, loadPlaywright } from './lib.mjs'
import fs from 'node:fs'

const DIR = ensureDir(path.join(OUT, 'plates'))
const ALL = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 'cover']
const want = process.argv.slice(2).length ? process.argv.slice(2) : ALL

const { chromium } = await loadPlaywright()
const browser = await chromium.launch()
for (const id of want) {
  const cover = id === 'cover'
  const ctx = await browser.newContext({ viewport: cover ? { width: 808, height: 632 } : { width: 1400, height: 900 }, deviceScaleFactor: 2 })
  const dir = process.env.OO_FONTS_DIR
  if (dir) {
    // same local-font fallback as capture (see lib.mjs)
    const css = fs.readFileSync(path.join(dir, 'fonts.css'), 'utf8')
    await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }))
    await ctx.route('https://fonts.gstatic.com/**', (r) =>
      r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(dir, r.request().url().split('/').pop())) }),
    )
  }
  const page = await ctx.newPage()
  await page.goto(`${BASE}/behance/?export&plate=${id}`, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((im) => (im.complete ? 0 : im.decode().catch(() => 0))))
  })
  await page.waitForTimeout(300)
  const name = cover ? 'cover-1616x1264.png' : `plate-${id}.jpg`
  const opts = cover ? {} : { type: 'jpeg', quality: 92 }
  await page.locator(`[data-plate="${id}"]`).screenshot({ path: path.join(DIR, name), ...opts })
  console.log('✓', name)
  await ctx.close()
}
await browser.close()
