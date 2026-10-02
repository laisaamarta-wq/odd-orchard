// Odd Orchard — Behance still capture.
//   npm run build && npm run preview            (or OO_BASE=https://odd-orchard.vercel.app)
//   node scripts/behance/capture.mjs [scene…]   → behance-export/raw/*.png
// Scenes are deterministic: the fake clock drives every animation.
import path from 'node:path'
import { OUT, domClick, ensureDir, launch, openPage, settleHero, switchWorld, tick, scrollToEl, scrollToY, sweep } from './lib.mjs'

const RAW = ensureDir(path.join(OUT, 'raw'))
const FL = ['kiwi', 'orange', 'cherry', 'pitaya']
// CSS transitions (loader, nav, menu) run on real time, not the fake clock — let them land first.
const shot = async (page, name, opts = {}) => {
  await page.waitForTimeout(1100)
  return page.screenshot({ path: path.join(RAW, `${name}.png`), ...opts })
}
const crop = (page, sel, name, pad = 0) =>
  page.locator(sel).first().evaluate((el) => el.scrollIntoView({ block: 'nearest' })).then(async () => {
    const b = await page.locator(sel).first().boundingBox()
    return shot(page, name, { clip: { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 } })
  })

const SCENES = {
  // Hero, all four worlds, plus the UI details that live in it.
  async hero(b) {
    const { page, ctx } = await openPage(b, 'desktop')
    await settleHero(page)
    await shot(page, 'shot-hero-kiwi')
    await crop(page, '.switch', 'crop-switcher', 0)
    await crop(page, '.keeper-chip', 'crop-keeper-chip', 12)
    await crop(page, '.hero__copy--left .btn', 'crop-button', 12)
    await crop(page, '.nav', 'crop-nav', 0)
    for (let i = 1; i < 4; i++) {
      await switchWorld(page, i)
      await shot(page, `shot-hero-${FL[i]}`)
    }
    await ctx.close()
  },

  // The world switch, frame by frame (kiwi → cherry).
  async transition(b) {
    const { page, ctx } = await openPage(b, 'desktop')
    await settleHero(page)
    await domClick(page, '.switch__btn', 2)
    let t = 0
    for (const at of [380, 520, 700, 950, 1700, 3600]) {
      await tick(page, at - t)
      t = at
      await shot(page, `seq-switch-${String(at).padStart(4, '0')}`)
    }
    await ctx.close()
  },

  // Specimen per world, the details, the basket.
  async product(b) {
    const { page, ctx } = await openPage(b, 'desktop')
    await settleHero(page)
    for (let i = 0; i < 4; i++) {
      if (i > 0) {
        await scrollToY(page, 0, 400)
        await switchWorld(page, i)
      }
      await scrollToEl(page, '#product', 48, 2200)
      await shot(page, `shot-product-${FL[i]}`)
    }
    await scrollToY(page, 0, 400)
    await switchWorld(page, 0)
    await scrollToEl(page, '#product', 0, 2200)
    await crop(page, '.product__stage', 'crop-specimen', 0)
    await crop(page, '.ing', 'crop-ingredients', 16)
    await crop(page, '.nutri', 'crop-nutrition', 16)
    await crop(page, '.mini-tabs', 'crop-minitabs', 12)
    await crop(page, '.buy', 'crop-buy', 16)
    // basket: 250 ml + a crate → free delivery unlocked
    await page.locator('.buy .btn--solid').click()
    await tick(page, 1400)
    await page.locator('.sizes button').nth(2).click()
    await page.locator('.buy .btn--solid').click()
    await tick(page, 1600)
    await crop(page, '.basket', 'crop-basket-pill', 10)
    await page.locator('.basket').click()
    await tick(page, 1800)
    await shot(page, 'shot-cart')
    await crop(page, '.cart-item', 'crop-cart-item', 8)
    await crop(page, '.cart__foot', 'crop-cart-foot', 0)
    await page.locator('.cart__checkout-btn').click()
    await tick(page, 1400)
    await shot(page, 'shot-checkout')
    await ctx.close()
  },

  // Field notes: the pinned horizontal track at six points, then bestiary, ritual, footer.
  async scroll(b) {
    const { page, ctx } = await openPage(b, 'desktop')
    await settleHero(page)
    const top = await scrollToEl(page, '#story', 0, 1200)
    // intro, each chapter centred in the viewport, outro
    const stops = await page.evaluate(() => {
      const t = document.querySelector('.story__track')
      const max = t.scrollWidth - window.innerWidth
      const xs = [...t.querySelectorAll('.chapter')].map((c) => c.offsetLeft - (window.innerWidth - c.offsetWidth) / 2)
      return [0, ...xs, max].map((x) => Math.max(0, Math.min(max, x)))
    })
    for (const [k, x] of stops.entries()) {
      await scrollToY(page, top + x, 2400)
      await shot(page, `seq-story-${k}`)
    }
    // bestiary
    const kt = await scrollToEl(page, '#keepers', 0, 600)
    const kh = await page.evaluate(() => document.querySelector('#keepers').offsetHeight)
    await sweep(page, kt - 900, kt + kh, 12)
    await page.locator('#keepers').screenshot({ path: path.join(RAW, 'shot-keepers-full.png') })
    await scrollToEl(page, '#keepers', 0, 1200)
    await shot(page, 'shot-keepers')
    await crop(page, '.card--cherry', 'crop-card-cherry', 40)
    // ritual: progress 0.02 / 0.5 / 0.99 of the 260% pin
    const rt = await scrollToEl(page, '#ritual', 0, 600)
    const vh = 900
    for (const [name, p] of [['0000', 0.02], ['0300', 0.5], ['0600', 1.0]]) {
      await scrollToY(page, rt + p * 2.6 * vh, 2000)
      await shot(page, `shot-ritual-${name}`)
    }
    // footer
    await scrollToY(page, 1e6, 600)
    const ft = await scrollToEl(page, '.footer__wordwrap', -500, 600)
    await sweep(page, ft - 400, ft + 400, 4)
    await scrollToY(page, 1e6, 2400)
    await shot(page, 'shot-footer')
    await ctx.close()
  },

  // Tablet + mobile, same world, plus the mobile-only states.
  async responsive(b) {
    for (const dev of ['tablet', 'mobile']) {
      const { page, ctx } = await openPage(b, dev)
      await settleHero(page)
      await shot(page, `shot-hero-kiwi-${dev}`)
      await switchWorld(page, 2)
      await shot(page, `shot-hero-cherry-${dev}`)
      await scrollToY(page, 0, 300)
      await switchWorld(page, 0)
      await scrollToEl(page, '#product', 0, 2200)
      await shot(page, `shot-product-kiwi-${dev}`)
      await scrollToEl(page, '#keepers', 300, 1600)
      await shot(page, `shot-keepers-${dev}`)
      if (dev === 'mobile') {
        await scrollToEl(page, '#product', 0, 1600)
        await page.locator('.buy .btn--solid').click()
        await tick(page, 1400)
        await page.locator('.sizes button').nth(2).click()
        await page.locator('.buy .btn--solid').click()
        await tick(page, 1400)
        await page.locator('.basket').click()
        await tick(page, 1800)
        await shot(page, 'shot-cart-mobile')
        await page.locator('.cart__close').click()
        await tick(page, 1400)
        await scrollToY(page, 0, 800)
        await page.locator('.burger').click()
        await tick(page, 1600)
        await shot(page, 'shot-menu-mobile')
      }
      await ctx.close()
    }
    // desktop reference at the same moment, for the device row
    const { page, ctx } = await openPage(b, 'desktop')
    await settleHero(page)
    await switchWorld(page, 2)
    await shot(page, 'shot-hero-cherry-desktop')
    await ctx.close()
  },
}

const want = process.argv.slice(2)
const b = await launch()
for (const [name, fn] of Object.entries(SCENES)) {
  if (want.length && !want.includes(name)) continue
  const t0 = Date.now()
  await fn(b)
  console.log(`✓ ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
}
await b.close()
