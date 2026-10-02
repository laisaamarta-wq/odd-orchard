import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FLAVORS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion } from '../state.jsx'

const STEPS = [
  ['Picked at first light', 'Only the fruit the keeper hands over. Never shaken from the branch.'],
  ['Carried, not shipped', 'Crates travel cushioned in moss, in the dark, at orchard temperature.'],
  ['Cold-pressed, slowly', 'Twelve tonnes of gentle pressure. No heat, no concentrate, no water added.'],
  ['Bottled within six hours', 'Then sealed with the keeper’s mark. If it’s later than that, we drink it ourselves.'],
]

export default function Ritual() {
  const { active } = useWorld()
  const f = FLAVORS[active]
  const root = useRef(null)
  const [step, setStep] = useState(0)
  const [hour, setHour] = useState('00:00')

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(3)
      setHour('06:00')
      gsap.set(root.current.querySelector('.ritual__fill'), { clipPath: 'inset(6% 0% 0% 0%)' })
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=260%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress
            setStep(Math.min(3, Math.floor(p * 4.0001)))
            const mins = Math.round(p * 360)
            setHour(`${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`)
          },
        },
      })
      tl.fromTo('.ritual__fill', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(6% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
      gsap.utils.toArray('.ritual__drop').forEach((el, k) => {
        const start = 0.02 + k * 0.1
        tl.fromTo(
          el,
          { y: '-75vh', x: gsap.utils.random(-180, 180), rotation: gsap.utils.random(-120, 120), scale: 1, autoAlpha: 1 },
          { y: '0vh', x: 0, rotation: gsap.utils.random(-30, 30), scale: 0.2, autoAlpha: 0, ease: 'power2.in', duration: 0.18 },
          start,
        )
      })
      tl.fromTo('.ritual__rings span', { scale: 0.6 }, { scale: 1.25, stagger: 0.05, ease: 'none', duration: 1 }, 0)
      tl.fromTo('.ritual__bottle', { rotation: -4 }, { rotation: 3, ease: 'none', duration: 1 }, 0)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="ritual" id="ritual" ref={root} aria-labelledby="ritual-title">
      <div className="ritual__rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="ritual__head">
        <p className="label">The ritual</p>
        <h2 id="ritual-title" className="section-title">
          Branch to bottle <em>in six hours.</em>
        </h2>
      </div>

      <ol className="ritual__steps">
        {STEPS.map(([t, d], i) => (
          <li key={t} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
            <span className="ritual__n">0{i + 1}</span>
            <div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="ritual__center" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, k) => (
          <img key={k} className="ritual__drop" src={asset(`fruit-${f.id}-${(k % 4) + 1}`)} alt="" loading="lazy" />
        ))}
        <div className="ritual__bottle">
          <img className="ritual__ghost" src={asset(`bottle-${f.id}`)} alt="" loading="lazy" />
          <img className="ritual__fill" src={asset(`bottle-${f.id}`)} alt="" loading="lazy" />
        </div>
      </div>

      <div className="ritual__clock" aria-live="off">
        <span className="label">since picking</span>
        <strong>{hour}</strong>
        <span className="ritual__bar">
          <i style={{ transform: `scaleX(${(step + 1) / 4})` }} />
        </span>
      </div>
    </section>
  )
}
