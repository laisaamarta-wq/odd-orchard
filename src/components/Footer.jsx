import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FLAVORS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion } from '../state.jsx'
import { Logo } from './Nav.jsx'

export default function Footer() {
  const { active } = useWorld()
  const root = useRef(null)
  const [sent, setSent] = useState(false)
  const word = useRef(null)

  // Fit the giant wordmark to the viewport width, whatever the font metrics.
  useEffect(() => {
    const fit = () => {
      const el = word.current
      if (!el) return
      el.style.fontSize = '16vw'
      const avail = el.clientWidth
      const ratio = avail / el.scrollWidth
      el.style.fontSize = `${Math.min(24, 16 * ratio * 0.97)}vw`
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.footer__word .wl', {
        yPercent: 100,
        stagger: 0.04,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.footer__word', start: 'top 95%' },
      })
      gsap.from('.peek', {
        yPercent: 100,
        stagger: 0.12,
        duration: 1.1,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.footer__wordwrap', start: 'top 90%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <footer className="footer" ref={root}>
      <div className="footer__inner">
        <div className="footer__news">
          <h2 className="section-title section-title--sm">
            Join the <em>night shift.</em>
          </h2>
          <p>One letter a month from the orchard: new keepers, seasonal pressings, where the trees wandered to.</p>
          {sent ? (
            <p className="footer__thanks" role="status">
              Vesper has your address now. Expect something at 02:17.
            </p>
          ) : (
            <form className="footer__form" onSubmit={submit}>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input id="email" type="email" required placeholder="you@somewhere.off.the.map" autoComplete="email" />
              <button className="btn btn--solid" type="submit" data-cursor="Join">
                Subscribe <span className="btn__arrow" aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </div>
        <div className="footer__cols">
          <div>
            <p className="label">Flavors</p>
            {FLAVORS.map((fl) => (
              <a key={fl.id} href="#top">
                {fl.full}
              </a>
            ))}
          </div>
          <div>
            <p className="label">Orchard</p>
            <a href="#story">Field notes</a>
            <a href="#keepers">Keepers</a>
            <a href="#ritual">Ritual</a>
            <a href="#product">Stockists</a>
          </div>
          <div>
            <p className="label">Elsewhere</p>
            <a href="#top">Instagram</a>
            <a href="#top">Telegram</a>
            <a href="#top">Wholesale</a>
          </div>
        </div>
      </div>
      <div className="footer__wordwrap">
        <div className="footer__peeks" aria-hidden="true">
          {FLAVORS.map((fl, i) => (
            <img key={fl.id} className={`peek peek--${fl.id} ${i === active ? 'is-active' : ''}`} src={asset(`char-${fl.id}`)} alt="" loading="lazy" />
          ))}
        </div>
        <div className="footer__word" aria-hidden="true" ref={word}>
          {'ODD ORCHARD'.split('').map((c, i) => (
            <span className="wm" key={i}>
              <span className="wl">{c === ' ' ? '\u00a0' : c}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="footer__base">
        <Logo />
        <span>© 2026 Odd Orchard — a fictional juice brand. Concept & art direction study.</span>
        <a href="#top">Back to the gate ↑</a>
      </div>
    </footer>
  )
}
