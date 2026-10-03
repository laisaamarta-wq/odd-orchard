// Odd Orchard — export the closing CTA plate (13).
//   node scripts/behance/cta.mjs          → behance-export/plates/plate-cta.png
//   node scripts/behance/cta.mjs motion   → behance-export/motion/mo-cta-2560x1938.mp4 (6 s seamless loop)
// The plate's CSS animations all divide 6 s; frames are scrubbed through the Web
// Animations API (pause + currentTime), so the loop is exact and machine-independent.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { BASE, OUT, ensureDir, loadPlaywright } from './lib.mjs'

const motion = process.argv.includes('motion')
const FPS = 30
const LOOP = 6000
const { chromium } = await loadPlaywright()
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1400, height: 1060 }, deviceScaleFactor: motion ? 2 : 2 })
const dir = process.env.OO_FONTS_DIR
if (dir) {
  const css = fs.readFileSync(path.join(dir, 'fonts.css'), 'utf8')
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }))
  await ctx.route('https://fonts.gstatic.com/**', (r) => r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(dir, r.request().url().split('/').pop())) }))
}
const page = await ctx.newPage()
await page.goto(`${BASE}/behance/?export&plate=13`, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  await document.fonts.ready
  await Promise.all([...document.images].map((im) => (im.complete ? 0 : im.decode().catch(() => 0))))
})
const el = page.locator('[data-plate="13"]')
const seek = (t) => page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t }), t)

if (!motion) {
  await seek(1200)
  const out = path.join(ensureDir(path.join(OUT, 'plates')), 'plate-cta.png')
  await el.screenshot({ path: out })
  console.log('✓', out)
} else {
  const frames = ensureDir(path.join(OUT, '.frames', 'cta'))
  fs.rmSync(frames, { recursive: true, force: true })
  fs.mkdirSync(frames, { recursive: true })
  const n = (LOOP / 1000) * FPS
  for (let i = 0; i < n; i++) {
    await seek((i * 1000) / FPS)
    await el.screenshot({ path: path.join(frames, `${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 })
  }
  const out = path.join(ensureDir(path.join(OUT, 'motion')), 'mo-cta-2560x1938.mp4')
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg'),
    '-vf', 'scale=2560:1938:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', out])
  console.log('✓', out)
}
await browser.close()
