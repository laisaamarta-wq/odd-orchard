import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { FLAVORS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion, isTouch } from '../state.jsx'
import { scrollToHash } from './Nav.jsx'

export default function Keepers() {
  const { requestSwitch } = useWorld()
  const root = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.keepers__head > *', {
        y: 50,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.keepers__head', start: 'top 80%' },
      })
      gsap.utils.toArray('.card').forEach((card, i) => {
        gsap.from(card, {
          y: 140,
          rotation: i % 2 ? 4 : -4,
          autoAlpha: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: card, start: 'top 92%' },
        })
        gsap.fromTo(
          card.querySelector('.card__char'),
          { yPercent: 18 },
          { yPercent: -14, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    }, root)

    // hover tilt (desktop)
    const cleanups = []
    if (!isTouch()) {
      root.current.querySelectorAll('.card').forEach((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
        const img = card.querySelector('.card__char img')
        const move = (e) => {
          const r = card.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          ry(nx * 12)
          rx(-ny * 10)
        }
        const enter = () => gsap.to(img, { scale: 1.08, rotation: -4, y: -16, duration: 0.6, ease: 'back.out(2)' })
        const leave = () => {
          rx(0)
          ry(0)
          gsap.to(img, { scale: 1, rotation: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
        }
        card.addEventListener('pointermove', move)
        card.addEventListener('pointerenter', enter)
        card.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          card.removeEventListener('pointermove', move)
          card.removeEventListener('pointerenter', enter)
          card.removeEventListener('pointerleave', leave)
        })
      })
    }
    return () => {
      ctx.revert()
      cleanups.forEach((c) => c())
    }
  }, [])

  const enterWorld = (i) => {
    scrollToHash('#top')
    setTimeout(() => requestSwitch(i), 700)
  }

  return (
    <section className="keepers" id="keepers" ref={root} aria-labelledby="keepers-title">
      <div className="keepers__head">
        <p className="label">The bestiary</p>
        <h2 id="keepers-title" className="section-title">
          Meet the <em>keepers.</em>
        </h2>
        <p className="keepers__lede">Four creatures, four temperaments, four fruits that won’t ripen unless they’re watched.</p>
      </div>
      <div className="keepers__grid">
        {FLAVORS.map((fl, i) => (
          <article
            key={fl.id}
            className={`card card--${fl.id}`}
            style={{ '--cbg': fl.palette.bg, '--cink': fl.palette.ink, '--cdeep': fl.palette.deep, '--caccent': fl.palette.accent }}
          >
            <div className="card__top">
              <span className="card__no">Nº {fl.no}</span>
              <span className="card__fruit">
                <img src={asset(`fruit-${fl.id}-1`)} alt="" loading="lazy" />
              </span>
            </div>
            <div className="card__char" aria-hidden="true">
              <img src={asset(`char-${fl.id}`)} alt="" loading="lazy" draggable="false" />
            </div>
            <div className="card__body">
              <h3 className="card__name">{fl.keeper.name}</h3>
              <p className="card__species">
                {fl.keeper.species} · <i>{fl.keeper.latin}</i>
              </p>
              <dl className="card__facts">
                <div>
                  <dt>Temperament</dt>
                  <dd>{fl.keeper.temperament}</dd>
                </div>
                <div>
                  <dt>Favourite hour</dt>
                  <dd>{fl.keeper.hour}</dd>
                </div>
                <div>
                  <dt>Known habit</dt>
                  <dd>{fl.keeper.habit}</dd>
                </div>
              </dl>
              <button className="card__cta" onClick={() => enterWorld(i)} data-cursor="Enter">
                Enter {fl.keeper.name}’s world <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
