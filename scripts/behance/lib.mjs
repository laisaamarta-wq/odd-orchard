// Shared Playwright helpers for the Behance capture scripts.
// Every frame is taken under Playwright's fake clock, so GSAP, Lenis, the
// hero autoplay and all timeouts advance only when we say so — the same
// command always produces the same frames.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
export const BASE = process.env.OO_BASE || 'http://localhost:4173'
export const OUT = path.join(ROOT, 'behance-export')

export async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    // fall back to a globally installed copy (e.g. NODE_PATH or PLAYWRIGHT_MODULE)
    const p = process.env.PLAYWRIGHT_MODULE || '/opt/npm-tools/node_modules/playwright'
    return createRequire(import.meta.url)(p)
  }
}

/* Optional: serve the Google fonts from local files (sandboxes without access to fonts.googleapis.com).
   OO_FONTS_DIR must contain bric.woff2, inst.woff2, insti.woff2, jb4.woff2, jb5.woff2. */
async function routeFonts(ctx) {
  const dir = process.env.OO_FONTS_DIR
  if (!dir) return
  const css = `
@font-face{font-family:'Bricolage Grotesque';font-weight:200 800;font-stretch:75% 100%;src:url(https://fonts.gstatic.com/l/bric.woff2) format('woff2')}
@font-face{font-family:'Instrument Serif';font-style:normal;src:url(https://fonts.gstatic.com/l/inst.woff2)}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(https://fonts.gstatic.com/l/insti.woff2)}
@font-face{font-family:'JetBrains Mono';font-weight:400;src:url(https://fonts.gstatic.com/l/jb4.woff2)}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(https://fonts.gstatic.com/l/jb5.woff2)}`
  await ctx.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }))
  await ctx.route('https://fonts.gstatic.com/**', (r) =>
    r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(dir, r.request().url().split('/').pop())) }),
  )
}

// Clean-frame rules: no custom cursor, no scrollbar, frozen grain, no skip link.
const NO_CURSOR = `.cursor{display:none!important}`
const CLEAN_CSS = `
html{scrollbar-width:none} ::-webkit-scrollbar{display:none}
.grain{animation:none!important}
.skip{display:none!important}
`

export const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true },
}

export async function launch() {
  const { chromium } = await loadPlaywright()
  return chromium.launch()
}

export async function openPage(browser, device = 'desktop', { url = '/', clean = true, cursor = false, dpr } = {}) {
  const dev = { ...DEVICES[device], ...(dpr ? { deviceScaleFactor: dpr } : {}) }
  const ctx = await browser.newContext({ ...dev, reducedMotion: 'no-preference' })
  await routeFonts(ctx)
  const page = await ctx.newPage()
  // Frozen fake clock: nothing moves unless tick() advances it.
  const T0 = new Date('2026-10-02T09:00:00Z').getTime()
  await page.clock.install({ time: T0 })
  await page.clock.pauseAt(T0 + 1000)
  await page.goto(BASE + url, { waitUntil: 'load' })
  if (clean) await page.addStyleTag({ content: CLEAN_CSS + (cursor ? '' : NO_CURSOR) })
  await page.evaluate(() => document.fonts.ready)
  await tick(page, 100)
  return { ctx, page }
}

// Advance the fake clock in small steps so rAF-driven code (GSAP, Lenis) runs every frame.
export async function tick(page, ms, step = 16) {
  let left = ms
  while (left > 0) {
    const d = Math.min(step, left)
    await page.clock.runFor(d)
    left -= d
  }
}

// Let the opening scene finish and stop the autoplay the way a visitor would:
// by choosing the flavor that is already active.
export async function settleHero(page) {
  await tick(page, 3800)
  await domClick(page, '.switch__btn.is-active')
  await scrollToY(page, 0, 400)
}

// DOM click: no actionability auto-scroll, so the page stays exactly where we put it.
export async function domClick(page, sel, n = 0) {
  await page.evaluate(([sel, n]) => document.querySelectorAll(sel)[n].click(), [sel, n])
}

export async function switchWorld(page, i, settle = 3800) {
  await domClick(page, '.switch__btn', i)
  await tick(page, settle)
}

export async function scrollToY(page, y, settle = 1600) {
  await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y)
  await tick(page, settle)
}

export async function scrollToEl(page, sel, offset = 0, settle = 1600) {
  const y = await page.evaluate(
    ([sel, offset]) => {
      const el = document.querySelector(sel)
      const host = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
      return host.getBoundingClientRect().top + window.scrollY + offset
    },
    [sel, offset],
  )
  await scrollToY(page, y, settle)
  return y
}

// Walk down through a region so every scroll-triggered reveal fires.
export async function sweep(page, from, to, steps = 8) {
  for (let k = 0; k <= steps; k++) await scrollToY(page, from + ((to - from) * k) / steps, 250)
}

export function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true })
  return d
}
