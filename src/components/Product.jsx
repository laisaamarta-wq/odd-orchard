import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FLAVORS, asset } from '../data/flavors.js'
import { useWorld, prefersReducedMotion, isTouch, SIZES, unitPrice } from '../state.jsx'

export default function Product() {
  const { active, requestSwitch, addItem } = useWorld()
  const f = FLAVORS[active]
  const root = useRef(null)
  const stage = useRef(null)
  const tilt = useRef(null)
  const bottles = useRef([])
  const orbit = useRef(null)
  const prev = useRef(active)
  const [size, setSize] = useState('250')
  const price = unitPrice(f.id, size).toFixed(2)

  // Cross-fade bottles with a little spin whenever the world changes.
  useEffect(() => {
    const from = prev.current
    prev.current = active
    if (from === active) {
      bottles.current.forEach((b, i) => gsap.set(b, { autoAlpha: i === active ? 1 : 0 }))
      return
    }
    if (prefersReducedMotion()) {
      gsap.set(bottles.current[from], { autoAlpha: 0 })
      gsap.set(bottles.current[active], { autoAlpha: 1 })
      return
    }
    gsap.to(bottles.current[from], { autoAlpha: 0, rotationY: -70, x: -40, duration: 0.5, ease: 'power2.in' })
    gsap.fromTo(
      bottles.current[active],
      { autoAlpha: 0, rotationY: 70, x: 40 },
      { autoAlpha: 1, rotationY: 0, x: 0, duration: 0.9, delay: 0.25, ease: 'power3.out' },
    )
    gsap.fromTo(
      root.current.querySelectorAll('.js-spec'),
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out', delay: 0.2 },
    )
  }, [active])

  // Ingredient bars grow when revealed and on every world change.
  useEffect(() => {
    const bars = root.current.querySelectorAll('.ing__bar i')
    const t = gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out', stagger: 0.08, paused: true })
    const st = ScrollTrigger.create({ trigger: root.current.querySelector('.ing'), start: 'top 85%', once: true, onEnter: () => t.play() })
    if (st.progress > 0 || ScrollTrigger.isInViewport(root.current.querySelector('.ing'))) t.play()
    return () => {
      t.kill()
      st.kill()
    }
  }, [active])

  // Pointer tilt + drag-to-spin.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = stage.current
    const ry = gsap.quickTo(tilt.current, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    const rx = gsap.quickTo(tilt.current, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    let drag = null
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      if (drag) {
        ry(gsap.utils.clamp(-60, 60, (e.clientX - drag) * 0.5))
      } else if (!isTouch()) {
        ry(nx * 40)
        rx(-ny * 18)
      }
    }
    const down = (e) => {
      drag = e.clientX
      el.setPointerCapture?.(e.pointerId)
    }
    const up = () => {
      drag = null
      gsap.to(tilt.current, { rotationY: 0, rotationX: 0, duration: 1.4, ease: 'elastic.out(1, 0.35)' })
    }
    const leave = () => !drag && up()
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointerleave', leave)
    const spin = gsap.to(orbit.current, { rotation: 360, duration: 40, ease: 'none', repeat: -1 })
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointerleave', leave)
      spin.kill()
    }
  }, [])

  // Section reveal
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.product__stage', {
        scale: 0.85,
        rotation: -6,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
      gsap.from('.product__info > *', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const add = (e) => {
    addItem(f.id, size)
    if (prefersReducedMotion()) return
    // A tiny bottle hops into the basket.
    const target = document.querySelector('.basket')
    const dst = target.getBoundingClientRect()
    const ghost = document.createElement('img')
    ghost.src = asset(`bottle-${f.id}`)
    ghost.className = 'ghost-bottle'
    ghost.alt = ''
    document.body.appendChild(ghost)
    const btn = e.currentTarget.getBoundingClientRect()
    gsap.set(ghost, { left: btn.left + btn.width / 2 - 20, top: btn.top - 30, width: 40 })
    gsap
      .timeline({ onComplete: () => ghost.remove() })
      .to(ghost, { top: btn.top - 160, rotation: -30, duration: 0.45, ease: 'power2.out' })
      .to(ghost, { left: dst.left + dst.width / 2 - 10, top: dst.top, width: 20, rotation: 30, duration: 0.6, ease: 'power3.in' })
  }

  return (
    <section className="product" id="product" ref={root} aria-labelledby="product-title">
      <div className="product__stage" ref={stage} data-cursor="Drag">
        <svg className="product__orbit" ref={orbit} viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <path id="orbitPath" d="M200,200 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0" />
          </defs>
          <text>
            <textPath href="#orbitPath">
              ODD ORCHARD ✺ SPECIMEN Nº {f.no} ✺ {f.full.toUpperCase()} ✺ COLD-PRESSED ✺ KEPT BY {f.keeper.name.toUpperCase()} ✺
            </textPath>
          </text>
        </svg>
        <div className="product__disc" aria-hidden="true" />
        <div className="product__fruit product__fruit--a" aria-hidden="true">
          <img src={asset(`fruit-${f.id}-2`)} alt="" />
        </div>
        <div className="product__fruit product__fruit--b" aria-hidden="true">
          <img src={asset(`fruit-${f.id}-1`)} alt="" />
        </div>
        <div className="product__tilt" ref={tilt}>
          {FLAVORS.map((fl, i) => (
            <img
              key={fl.id}
              ref={(el) => (bottles.current[i] = el)}
              src={asset(`bottle-${fl.id}`)}
              alt={i === active ? `${fl.full} bottle` : ''}
              className="product__bottle"
              draggable="false"
              loading="lazy"
            />
          ))}
        </div>
        <p className="product__hint" aria-hidden="true">
          {isTouch() ? 'drag to turn' : 'move · drag to turn'}
        </p>
      </div>

      <div className="product__info">
        <p className="label js-spec">Specimen Nº {f.no} — the bottle</p>
        <h2 id="product-title" className="product__title js-spec">
          {f.full.split(' & ')[0]} <em>&amp; {f.full.split(' & ')[1]}</em>
        </h2>
        <p className="product__desc js-spec">{f.description}</p>

        <div className="mini-tabs" role="group" aria-label="Change flavor">
          {FLAVORS.map((fl, i) => (
            <button
              key={fl.id}
              className={i === active ? 'is-active' : ''}
              aria-pressed={i === active}
              style={{ '--c': fl.palette.juice }}
              onClick={(e) => requestSwitch(i, e.currentTarget)}
              data-cursor="Switch"
            >
              <i />
              {fl.name}
            </button>
          ))}
        </div>

        <div className="ing js-spec">
          <h3 className="label">What’s inside</h3>
          <ul>
            {f.ingredients.map((ing) => {
              const [name, pct] = [ing.replace(/\s\d+%$/, ''), parseInt(ing.match(/(\d+)%/)[1], 10)]
              return (
                <li key={ing}>
                  <span>{name}</span>
                  <span className="ing__bar">
                    <i style={{ width: `${pct}%` }} />
                  </span>
                  <span className="ing__pct">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </div>

        <dl className="nutri js-spec">
          <div>
            <dt>Energy</dt>
            <dd>
              {f.nutrition.kcal}
              <small>kcal</small>
            </dd>
          </div>
          <div>
            <dt>Natural sugars</dt>
            <dd>{f.nutrition.sugars}</dd>
          </div>
          <div>
            <dt>Fibre</dt>
            <dd>{f.nutrition.fibre}</dd>
          </div>
          <div>
            <dt>Vitamin C</dt>
            <dd>{f.nutrition.vitC}</dd>
          </div>
        </dl>
        <p className="nutri__foot">per 250 ml · no added sugar · nothing from concentrate · unpasteurised</p>

        <div className="buy">
          <div className="sizes" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => (
              <button key={s.id} role="radio" aria-checked={size === s.id} className={size === s.id ? 'is-active' : ''} onClick={() => setSize(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="buy__row">
            <p className="price" aria-live="polite">
              €{price}
            </p>
            <button className="btn btn--solid" onClick={add} data-cursor="Add">
              Add to basket <span className="btn__arrow" aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
