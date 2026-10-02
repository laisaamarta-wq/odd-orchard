// Odd Orchard — Behance motion capture.
//   node scripts/behance/motion.mjs [scene…]  → behance-export/motion/*.mp4 + *.gif
// Frame-by-frame under the fake clock: every frame is exactly 1/FPS s apart,
// so the videos are perfectly smooth regardless of machine speed. Needs ffmpeg.
// The site's own custom cursor (with its labels) is kept on in these clips.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { OUT, domClick, ensureDir, launch, openPage, settleHero, tick, scrollToEl } from './lib.mjs'

const FPS = 60
const DT = 1000 / FPS
const DIR = ensureDir(path.join(OUT, 'motion'))
const TMP = ensureDir(path.join(OUT, '.frames'))

// Keep CSS transitions (real-time) roughly in step with the fake clock.
async function cssRate(page, rate) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Animation.enable')
  await cdp.send('Animation.setPlaybackRate', { playbackRate: rate })
  return cdp
}

function recorder(page, name) {
  const dir = path.join(TMP, name)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  let n = 0
  let cdp
  let t0 = Date.now()
  const frame = async () => {
    await page.screenshot({ path: path.join(dir, `${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 })
    n++
    await page.clock.runFor(DT)
    if (n % 30 === 0) {
      // virtual 500 ms took (now - t0) real ms → slow CSS down to match
      const rate = Math.max(0.02, Math.min(1, (30 * DT) / (Date.now() - t0)))
      if (!cdp) cdp = await cssRate(page, rate)
      else await cdp.send('Animation.setPlaybackRate', { playbackRate: rate })
      t0 = Date.now()
    }
  }
  return {
    dir,
    frame,
    async hold(ms) {
      for (let t = 0; t < ms; t += DT) await frame()
    },
    // run fn(p) every frame for ms, p = 0 → 1
    async during(ms, fn) {
      const frames = Math.round(ms / DT)
      for (let k = 0; k <= frames; k++) {
        await fn(k / frames)
        await frame()
      }
    },
    get count() {
      return n
    },
  }
}

function encode(dir, out, { crop, scale } = {}) {
  const vf = [crop && `crop=${crop}`, scale && `scale=${scale}:flags=lanczos`, 'format=yuv420p'].filter(Boolean).join(',')
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-vf', vf, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-movflags', '+faststart', path.join(DIR, out)])
  console.log('  →', out)
}

function gif(dir, out, { crop, width = 720, fps = 20, start = 0, dur } = {}) {
  const sel = [crop && `crop=${crop}`, `fps=${fps}`, `scale=${width}:-1:flags=lanczos`].filter(Boolean).join(',')
  const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(Math.round(start * FPS)), '-i', path.join(dir, '%05d.jpg')]
  if (dur) args.push('-t', String(dur))
  args.push('-vf', `${sel},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a`, path.join(DIR, out))
  execFileSync('ffmpeg', args)
  console.log('  →', out)
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
const mouseTo = async (page, sel, dx = 0, dy = 0) => {
  const b = await page.locator(sel).first().boundingBox()
  return { x: b.x + b.width / 2 + dx, y: b.y + b.height / 2 + dy }
}
// glide the (custom) cursor from a to b over ms, recording frames
async function glide(page, rec, a, b, ms) {
  await rec.during(ms, async (p) => {
    const e = ease(p)
    await page.mouse.move(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e)
  })
  return b
}

const SCENES = {
  // Kiwi → orange → cherry → pitaya → kiwi, clicked on the real switcher.
  async switch(b) {
    const { page, ctx } = await openPage(b, 'desktop', { cursor: true, dpr: 1.5 })
    await settleHero(page)
    await page.mouse.move(1100, 500)
    await tick(page, 600)
    const rec = recorder(page, 'switch')
    let at = { x: 1100, y: 500 }
    await rec.hold(500)
    for (const i of [1, 2, 3, 0]) {
      const to = await mouseTo(page, `.switch__btn >> nth=${i}`)
      at = await glide(page, rec, at, to, 550)
      await page.mouse.down()
      await rec.hold(80)
      await page.mouse.up()
      at = await glide(page, rec, at, { x: to.x + 260, y: to.y - 330 }, 900)
      await rec.hold(2200)
    }
    encode(rec.dir, 'mo-world-switch-1440x900.mp4', { scale: '1440:900' })
    // the keeper entrances, square crop on the stage
    encode(rec.dir, 'mo-keepers-1080.mp4', { crop: '1350:1350:405:0', scale: '1080:1080' })
    gif(rec.dir, 'gif-world-switch-720.gif', { width: 720, fps: 15, start: 1.0, dur: 3.6 })
    await ctx.close()
  },

  // Turn the specimen by hand.
  async specimen(b) {
    const { page, ctx } = await openPage(b, 'desktop', { cursor: true, dpr: 1.5 })
    await settleHero(page)
    await scrollToEl(page, '#product', 48, 2400)
    const c = await mouseTo(page, '.product__stage')
    await page.mouse.move(c.x + 300, c.y + 200)
    await tick(page, 300)
    const rec = recorder(page, 'specimen')
    let at = await glide(page, rec, { x: c.x + 300, y: c.y + 200 }, { x: c.x - 160, y: c.y - 120 }, 1200)
    at = await glide(page, rec, at, { x: c.x + 140, y: c.y + 60 }, 1100)
    await page.mouse.down()
    at = await glide(page, rec, at, { x: c.x - 120, y: c.y + 60 }, 700)
    at = await glide(page, rec, at, { x: c.x + 200, y: c.y + 40 }, 800)
    await page.mouse.up()
    await rec.hold(1600)
    encode(rec.dir, 'mo-specimen-1080.mp4', { crop: '1350:1350:0:0', scale: '1080:1080' })
    await ctx.close()
  },

  // Add to basket → bottle hops into the nav → open the basket.
  async basket(b) {
    const { page, ctx } = await openPage(b, 'desktop', { cursor: true, dpr: 1.5 })
    await settleHero(page)
    await scrollToEl(page, '#product', 48, 2400)
    await page.mouse.move(1000, 300)
    await tick(page, 300)
    const rec = recorder(page, 'basket')
    let at = await glide(page, rec, { x: 1000, y: 300 }, await mouseTo(page, '.buy .btn--solid'), 900)
    await page.locator('.buy .btn--solid').click()
    await rec.hold(1300)
    at = await glide(page, rec, at, await mouseTo(page, '.sizes button >> nth=2'), 600)
    await page.locator('.sizes button').nth(2).click()
    await rec.hold(300)
    at = await glide(page, rec, at, await mouseTo(page, '.buy .btn--solid'), 500)
    await page.locator('.buy .btn--solid').click()
    await rec.hold(1300)
    at = await glide(page, rec, at, await mouseTo(page, '.basket'), 800)
    await page.locator('.basket').click()
    await rec.hold(1200)
    at = await glide(page, rec, at, await mouseTo(page, '.cart-item .stepper button >> nth=1'), 700)
    await page.locator('.cart-item .stepper button').nth(1).click()
    await rec.hold(900)
    await page.locator('.cart-item .stepper button').nth(1).click()
    await rec.hold(1400)
    encode(rec.dir, 'mo-add-to-basket-1440x900.mp4', { scale: '1440:900' })
    await ctx.close()
  },

  // Field notes: the pinned horizontal track, scrolled smoothly.
  async story(b) {
    const { page, ctx } = await openPage(b, 'desktop', { dpr: 1.5 })
    await settleHero(page)
    const top = await scrollToEl(page, '#story', -300, 1600)
    const dist = await page.evaluate(() => document.querySelector('.story__track').scrollWidth - window.innerWidth)
    const rec = recorder(page, 'story')
    const from = top
    const to = top + 300 + dist
    await rec.during(9000, async (p) => {
      await page.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), from + (to - from) * ease(p))
    })
    await rec.hold(600)
    encode(rec.dir, 'mo-field-notes-1440x900.mp4', { scale: '1440:900' })
    await ctx.close()
  },

  // The ritual: clock 00:00 → 06:00 while the bottle fills.
  async ritual(b) {
    const { page, ctx } = await openPage(b, 'desktop', { dpr: 1.5 })
    await settleHero(page)
    const top = await scrollToEl(page, '#ritual', 0, 1600)
    const rec = recorder(page, 'ritual')
    await rec.hold(300)
    await rec.during(7000, async (p) => {
      await page.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), top + 2.6 * 900 * p)
    })
    await rec.hold(800)
    encode(rec.dir, 'mo-ritual-1440x900.mp4', { scale: '1440:900' })
    await ctx.close()
  },

  // Mobile: swipe through worlds, add to basket, bottom sheet.
  async mobile(b) {
    const { page, ctx } = await openPage(b, 'mobile', { dpr: 2 })
    await settleHero(page)
    const rec = recorder(page, 'mobile')
    await rec.hold(600)
    const swipe = async () => {
      // the stage listens for pointerdown/up and switches on a horizontal swipe
      await page.mouse.move(320, 420)
      await page.mouse.down()
      await rec.during(260, async (p) => page.mouse.move(320 - 240 * ease(p), 420))
      await page.mouse.up()
      await rec.hold(3000)
    }
    await swipe()
    await swipe()
    await swipe()
    const y0 = await page.evaluate(() => window.scrollY)
    const y1 = await page.evaluate(() => document.querySelector('.buy').getBoundingClientRect().top + window.scrollY - 520)
    await rec.during(1400, (p) => page.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), y0 + (y1 - y0) * ease(p)))
    await rec.hold(500)
    await domClick(page, '.buy .btn--solid')
    await rec.hold(1400)
    await domClick(page, '.basket')
    await rec.hold(2000)
    // drag the sheet's handle down to close it
    const h = await mouseTo(page, '.cart__handle')
    await page.mouse.move(h.x, h.y)
    await page.mouse.down()
    await rec.during(500, async (p) => page.mouse.move(h.x, h.y + 420 * ease(p)))
    await page.mouse.up()
    await rec.hold(1500)
    encode(rec.dir, 'mo-mobile-780x1688.mp4')
    await ctx.close()
  },

  // Small loops: each keeper idling on its bottle.
  async idle(b) {
    const { page, ctx } = await openPage(b, 'desktop', { dpr: 1.5 })
    await settleHero(page)
    for (const [i, id] of ['kiwi', 'orange', 'cherry', 'pitaya'].entries()) {
      if (i > 0) {
        await domClick(page, '.switch__btn', i)
        await tick(page, 3800)
      }
      const rec = recorder(page, `idle-${id}`)
      await rec.hold(3000)
      gif(rec.dir, `gif-idle-${id}-480.gif`, { crop: '1350:1350:405:0', width: 480, fps: 20 })
    }
    await ctx.close()
  },
}

const want = process.argv.slice(2)
const b = await launch()
for (const [name, fn] of Object.entries(SCENES)) {
  if (want.length && !want.includes(name)) continue
  const t0 = Date.now()
  await fn(b)
  console.log(`✓ ${name} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
}
await b.close()
fs.rmSync(TMP, { recursive: true, force: true })
